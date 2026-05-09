import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals pinyin_dict_all */

const inputEl  = $('[data-input]');
const resultEl = $('[data-result]');
const countEl  = $('[data-count]');

const opts = { tone: true, first: false, upper: false };

/* ---------- 选项 chips（可多选切换） ---------- */
$$('[data-opt]').forEach(chip => on(chip, 'click', () => {
  const key = chip.dataset.opt;
  opts[key] = !opts[key];
  // first 和 tone 互斥：选首字母时声调无意义
  if (key === 'first' && opts.first) opts.tone = false;
  if (key === 'tone' && opts.tone) opts.first = false;
  $$('[data-opt]').forEach(c => c.classList.toggle('is-active', opts[c.dataset.opt]));
  convert();
}));

/* ---------- 拼音核心 ---------- */
function toPinyin(text) {
  if (typeof pinyin_dict_all === 'undefined') return text;
  return text.split('').map(ch => {
    const raw = pinyin_dict_all[ch];
    if (!raw) return ch;
    let py = raw.split(',')[0];
    if (opts.first)    py = py.charAt(0);
    else if (!opts.tone) {
      py = py.replace(/[āáǎàa]/g, 'a').replace(/[ēéěèe]/g, 'e')
             .replace(/[īíǐìi]/g, 'i').replace(/[ōóǒòo]/g, 'o')
             .replace(/[ūúǔùu]/g, 'u').replace(/[ǖǘǚǜüv]/g, 'v');
    }
    return py;
  }).join(' ');
}

/* ---------- 转换（始终自动） ---------- */
function convert() {
  const text = inputEl.value.trim();
  if (!text) { resultEl.innerHTML = ''; return; }
  let result = toPinyin(text);
  if (opts.upper) result = result.toUpperCase();

  const chars = text.split('');
  const pys   = result.split(' ');
  resultEl.innerHTML = chars.map((ch, i) => {
    if (!ch.trim()) return '';
    return `<span class="py-item">
      <span class="py-ruby">${pys[i] || ''}</span>
      <span class="py-char">${ch}</span>
    </span>`;
  }).join('');
}

on(inputEl, 'input', () => {
  countEl.textContent = `${inputEl.value.length} 字`;
  convert();
});

on($('[data-action="copy"]'), 'click', async () => {
  const items = resultEl.querySelectorAll('.py-item');
  if (!items.length) { showToast('结果为空', { type: 'warn' }); return; }
  let text = '';
  items.forEach(item => {
    const ruby = item.querySelector('.py-ruby').textContent;
    const char = item.querySelector('.py-char').textContent;
    text += `${char}(${ruby}) `;
  });
  const ok = await copyText(text.trim());
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="clear"]'), 'click', () => {
  inputEl.value = ''; resultEl.innerHTML = ''; countEl.textContent = '0 字';
});
