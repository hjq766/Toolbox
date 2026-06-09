import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals pinyin_dict_all, pinyin_phrase */

const inputEl  = $('[data-input]');
const resultEl = $('[data-result]');
const countEl  = $('[data-count]');

let mode = 'tone';   // tone | none | first
let upper = false;

const MAX_WORD = 5;  // 词组最大匹配长度

/* ---------- 模式 tabs（单选） ---------- */
$$('[data-mode]').forEach(btn => on(btn, 'click', () => {
  mode = btn.dataset.mode;
  $$('[data-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
  convert();
}));

/* ---------- 大写 checkbox ---------- */
const upperCheck = $('[data-opt="upper"]');
on(upperCheck, 'change', () => { upper = upperCheck.checked; convert(); });

/* ---------- 去声调映射 ---------- */
const TONE_MAP = {
  'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
  'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e', 'ê': 'e',
  'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
  'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
  'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
  'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü', 'ü': 'ü',
  'ń': 'n', 'ǹ': 'n', 'ň': 'n',
};
const TONE_RE = new RegExp(`[${Object.keys(TONE_MAP).join('')}]`, 'g');
function removeTone(py) { return py.replace(TONE_RE, m => TONE_MAP[m] || m); }

/* ---------- 应用模式 ---------- */
function applyMode(py) {
  if (mode === 'first') return removeTone(py).charAt(0);
  if (mode === 'none')  return removeTone(py);
  return py;
}

/* ---------- 单字拼音 ---------- */
function charPinyin(ch) {
  if (typeof pinyin_dict_all === 'undefined') return null;
  const raw = pinyin_dict_all[ch];
  return raw ? raw.split(',')[0] : null;
}

/* ---------- 正向最大匹配分词 ---------- */
function segment(text) {
  const hasPhrase = typeof pinyin_phrase !== 'undefined';
  const chars = [...text];
  const items = [];  // { chars: [字], pys: [拼音] } 或 { type: 'space' | 'raw', ch }
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];
    if (/\s/.test(ch)) { items.push({ type: 'space' }); i++; continue; }

    // 尝试从当前位置匹配最长词组
    let matched = false;
    if (hasPhrase) {
      const maxLen = Math.min(MAX_WORD, chars.length - i);
      for (let len = maxLen; len >= 2; len--) {
        const word = chars.slice(i, i + len).join('');
        const phrasePy = pinyin_phrase[word];
        if (phrasePy) {
          const pys = phrasePy.split(' ');
          const wordChars = [...word];
          items.push({ type: 'phrase', chars: wordChars, pys });
          i += wordChars.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      const py = charPinyin(ch);
      items.push(py ? { type: 'han', ch, py } : { type: 'raw', ch });
      i++;
    }
  }
  return items;
}

/* ---------- 从分词结果生成扁平的 (字, 拼音) 列表 ---------- */
function flatten(segments) {
  const result = [];
  for (const seg of segments) {
    if (seg.type === 'space') { result.push({ type: 'space' }); continue; }
    if (seg.type === 'phrase') {
      seg.chars.forEach((ch, j) => result.push({ type: 'han', ch, py: seg.pys[j] || '' }));
    } else if (seg.type === 'han') {
      result.push({ type: 'han', ch: seg.ch, py: seg.py });
    } else {
      result.push({ type: 'raw', ch: seg.ch });
    }
  }
  return result;
}

/* ---------- 转换 ---------- */
function convert() {
  const text = inputEl.value;
  if (!text.trim()) { resultEl.innerHTML = ''; return; }

  const items = flatten(segment(text));

  resultEl.innerHTML = items.map(it => {
    if (it.type === 'space') return '<span style="width:8px"></span>';
    const pyText = it.py ? applyMode(it.py) : '';
    const display = pyText && upper ? pyText.toUpperCase() : pyText;
    return `<span class="py-item"><span class="py-ruby">${display}</span><span class="py-char">${it.ch}</span></span>`;
  }).join('');
}

/* ---------- 实时触发 ---------- */
on(inputEl, 'input', () => {
  countEl.textContent = `${inputEl.value.length} 字`;
  convert();
});

/* ---------- 示例 ---------- */
const SAMPLE = '银行的音乐很好听，长大以后更加重要了。';
on($('[data-action="sample"]'), 'click', () => {
  inputEl.value = SAMPLE;
  countEl.textContent = `${SAMPLE.length} 字`;
  convert();
});

/* ---------- 清空 ---------- */
on($('[data-action="clear"]'), 'click', () => {
  inputEl.value = '';
  resultEl.innerHTML = '';
  countEl.textContent = '0 字';
});

/* ---------- 复制（纯拼音文本） ---------- */
on($('[data-action="copy"]'), 'click', async () => {
  const text = inputEl.value;
  if (!text.trim()) { showToast('结果为空', { type: 'warn' }); return; }

  const items = flatten(segment(text));
  const parts = [];
  for (const it of items) {
    if (it.type === 'space') { parts.push(' '); continue; }
    const pyText = it.py ? applyMode(it.py) : it.ch;
    parts.push(upper ? pyText.toUpperCase() : pyText);
  }
  const result = parts.join(' ').replace(/ {2,}/g, ' ').trim();
  const ok = await copyText(result);
  showToast(ok ? '已复制拼音' : '复制失败', { type: ok ? 'success' : 'error' });
});
