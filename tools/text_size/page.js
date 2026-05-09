import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';

mountToolHeader();

const ta = $('[data-text]');
const stats = $('[data-stats]');

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024*1024) return `${(n/1024).toFixed(2)} KB`;
  return `${(n/1024/1024).toFixed(2)} MB`;
}

function analyze(str) {
  // Unicode 码点数（避免代理对算两次）
  const cp = [...str];
  const codePoints = cp.length;
  const noSpaces = cp.filter(c => !/\s/.test(c)).length;
  const chineseChars = (str.match(/[\u4e00-\u9fff]/g) || []).length;
  // 简单英文单词
  const words = (str.trim().match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || []).length;
  const lines = str === '' ? 0 : str.split(/\r?\n/).length;
  const paragraphs = str.trim() === '' ? 0 : str.split(/\n{2,}/).filter(s => s.trim()).length;
  const bytesUtf8 = new TextEncoder().encode(str).length;
  // GBK 近似：汉字 2 + ASCII 1 + 其它按 utf8 长度
  let bytesGbk = 0;
  for (const c of cp) {
    if (/[\u0000-\u007F]/.test(c)) bytesGbk += 1;
    else if (/[\u4e00-\u9fff\u3000-\u303F\uFF00-\uFFEF]/.test(c)) bytesGbk += 2;
    else bytesGbk += new TextEncoder().encode(c).length;
  }
  const readMin = Math.max(1, Math.round((chineseChars/300) + (words/200)));
  return {
    '字符数(含空格)': codePoints,
    '字符数(不含空格)': noSpaces,
    '汉字数': chineseChars,
    '英文单词': words,
    '行数': lines,
    '段落数': paragraphs,
    'UTF-8 字节': formatBytes(bytesUtf8),
    'GBK 字节(约)': formatBytes(bytesGbk),
    '阅读时长(约)': `${readMin} 分钟`
  };
}

const render = debounce(() => {
  const data = analyze(ta.value);
  stats.innerHTML = Object.entries(data).map(([k, v]) =>
    `<div class="stat"><div class="stat-label">${k}</div><div class="stat-value">${v}</div></div>`
  ).join('');
}, 80);

on(ta, 'input', render);
on($('[data-clear]'), 'click', () => { ta.value = ''; ta.focus(); render(); });

ta.value = '欢迎使用 jqnest 文本分析器 Text Analyzer.';
render();
