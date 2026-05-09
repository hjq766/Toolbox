import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const textEl  = $('[data-input="text"]');
const morseEl = $('[data-input="morse"]');

/* ---------- 摩尔斯码表 ---------- */
const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
  '@': '.--.-.', '&': '.-...', '(': '-.--.', ')': '-.--.-',
  ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
  "'": '.----.', '/': '-..-.'
};
const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
const TONE_MAP = {
  'ā':'a','á':'a','ǎ':'a','à':'a',
  'ē':'e','é':'e','ě':'e','è':'e',
  'ō':'o','ó':'o','ǒ':'o','ò':'o',
  'ī':'i','í':'i','ǐ':'i','ì':'i',
  'ū':'u','ú':'u','ǔ':'u','ù':'u',
  'ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v'
};

/** 单字符中文 → 拼音（不带声调，多音字取第一个） */
function toPinyin(chineseChar) {
  const dict = window.pinyin_dict_all;
  if (!dict || !dict[chineseChar]) return null;
  const first = dict[chineseChar].split(',')[0];
  return first.replace(/[āáǎàēéěèōóǒòīíǐìūúǔùǖǘǚǜ]/g, c => TONE_MAP[c] || c);
}

/* ---------- 文本 → 摩尔斯 ---------- */
function textToMorse() {
  const src = textEl.value;
  if (!src) { showToast('请先输入文本', { type: 'warn' }); return; }

  const out = [];
  let unknown = 0;
  for (const ch of src) {
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      out.push('/');
      continue;
    }
    if (/[\u4e00-\u9fa5]/.test(ch)) {
      const py = toPinyin(ch);
      if (!py) { unknown++; continue; }
      for (const p of py) {
        const code = MORSE[p.toUpperCase()];
        if (code) out.push(code);
      }
      out.push('/');   // 每个汉字视为独立词
      continue;
    }
    const code = MORSE[ch.toUpperCase()];
    if (code) out.push(code);
    else unknown++;
  }

  morseEl.value = out.join(' ').replace(/\s*\/\s*\/\s*/g, ' / ').trim();
  if (unknown) showToast(`已编码，${unknown} 个字符不在码表中已忽略`, { type: 'warn' });
}

/* ---------- 摩尔斯 → 文本 ---------- */
function morseToText() {
  const src = morseEl.value.trim();
  if (!src) { showToast('请先输入摩尔斯电码', { type: 'warn' }); return; }

  const words = src.split(/\s*\/\s*/);
  const decodedWords = words.map(w => {
    return w.trim().split(/\s+/).map(code => {
      if (!code) return '';
      return REVERSE[code] ?? `[${code}]`;
    }).join('');
  });
  textEl.value = decodedWords.join(' ').trim();
}

/* ---------- 事件 ---------- */
on($('[data-action="to-morse"]'), 'click', textToMorse);
on($('[data-action="to-text"]'),  'click', morseToText);

on($('[data-action="paste-text"]'), 'click', async () => {
  try {
    const t = await navigator.clipboard.readText();
    textEl.value = t;
    showToast('已粘贴', { type: 'success' });
  } catch {
    showToast('无法访问剪贴板', { type: 'error' });
  }
});
on($('[data-action="copy-morse"]'), 'click', async () => {
  if (!morseEl.value) { showToast('电码为空', { type: 'warn' }); return; }
  const ok = await copyText(morseEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear-text"]'),  'click', () => { textEl.value = ''; });
on($('[data-action="clear-morse"]'), 'click', () => { morseEl.value = ''; });
