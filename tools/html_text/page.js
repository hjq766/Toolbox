import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

const input   = $('[data-input]');
const output  = $('[data-output]');
const countEl = $('[data-count]');

const BLOCK_TAGS = new Set([
  'div','p','h1','h2','h3','h4','h5','h6',
  'ul','ol','li','table','tr','article','section',
  'header','footer','nav','form','blockquote','pre','hr','br'
]);

/** 递归提取文本，保留块级节点之间的换行 */
function extractText(node) {
  let out = '';
  node.childNodes.forEach(n => {
    if (n.nodeType === Node.TEXT_NODE) {
      out += n.textContent.replace(/\s+/g, ' ');
    } else if (n.nodeType === Node.ELEMENT_NODE) {
      const tag = n.tagName.toLowerCase();
      if (tag === 'br') { out += '\n'; return; }
      if (tag === 'script' || tag === 'style') return;
      if (BLOCK_TAGS.has(tag)) out += '\n' + extractText(n) + '\n';
      else out += extractText(n);
    }
  });
  return out;
}

function run() {
  const src = input.value.trim();
  if (!src) { output.value = ''; countEl.textContent = ''; return; }
  try {
    const doc = new DOMParser().parseFromString(input.value, 'text/html');
    const body = doc.body || doc.documentElement;
    const text = extractText(body).replace(/\n{3,}/g, '\n\n').trim();
    output.value = text;
    countEl.textContent = text ? `${text.length} 字` : '';
  } catch {
    output.value = '';
    countEl.textContent = '';
  }
}

on(input, 'input', run);

/* ---------- 文件上传（复用全局模块） ---------- */
function loadFile(file) {
  if (!file) return;
  if (!/\.html?$/i.test(file.name) && !/^text\/html$/i.test(file.type)) {
    showToast('请选择 HTML 文件', { type: 'warn' }); return;
  }
  const reader = new FileReader();
  reader.onload = () => { input.value = reader.result; run(); };
  reader.readAsText(file);
}

const fileEl = $('[data-file]');

initUploadZone({
  dropEl: $('[data-drop]'),
  fileEl,
  accept: '*',
  onFiles: (files) => loadFile(files[0]),
});

on($('[data-action="pick-file"]'), 'click', (e) => {
  e.stopPropagation();
  fileEl.click();
});

/* ---------- 动作 ---------- */
on($('[data-action="copy"]'), 'click', async () => {
  if (!output.value) return;
  const ok = await copyText(output.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', () => {
  if (!output.value) return;
  downloadText(output.value, 'extracted.txt', 'text/plain');
});

on($('[data-action="sample"]'), 'click', () => {
  input.value = '<div>\n  <h1>Hello World</h1>\n  <p>This is a <b>bold</b> and <i>italic</i> paragraph.</p>\n  <ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n  </ul>\n  <script>var x = 1;<\/script>\n  <style>body { color: red; }</style>\n</div>';
  run();
});

on($('[data-action="clear"]'), 'click', () => {
  input.value = '';
  output.value = '';
  countEl.textContent = '';
  input.focus();
});
