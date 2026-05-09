import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

const input   = $('[data-input]');
const output  = $('[data-output]');
const dropEl  = $('[data-drop]');
const fileEl  = $('[data-file]');

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

function extract() {
  if (!input.value.trim()) { showToast('请输入 HTML 源码', { type: 'warn' }); return; }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input.value, 'text/html');
    const body = doc.body || doc.documentElement;
    output.value = extractText(body).replace(/\n{3,}/g, '\n\n').trim();
    if (!output.value) showToast('未提取到任何可见文本', { type: 'warn' });
  } catch (err) {
    showToast('解析失败：' + err.message, { type: 'error' });
  }
}

/* ---------- 文件读取 ---------- */
function loadFile(file) {
  if (!file) return;
  if (!/html?$|^text\/html$/i.test(file.type || file.name)) {
    showToast('请选择 HTML 文件', { type: 'warn' }); return;
  }
  const reader = new FileReader();
  reader.onload = () => { input.value = reader.result; extract(); };
  reader.readAsText(file);
}

on(fileEl, 'change', (e) => loadFile(e.target.files[0]));

['dragenter','dragover'].forEach(ev => on(dropEl, ev, (e) => {
  e.preventDefault(); e.stopPropagation();
  dropEl.style.background = 'var(--color-brand-soft)';
  dropEl.style.borderColor = 'var(--color-brand)';
}));
['dragleave','drop'].forEach(ev => on(dropEl, ev, (e) => {
  e.preventDefault(); e.stopPropagation();
  dropEl.style.background = '';
  dropEl.style.borderColor = '';
}));
on(dropEl, 'drop', (e) => loadFile(e.dataTransfer.files[0]));

/* ---------- 动作 ---------- */
on($('[data-action="extract"]'),  'click', extract);
on($('[data-action="copy"]'),     'click', async () => {
  if (!output.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(output.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="download"]'), 'click', () => {
  if (!output.value) { showToast('结果为空', { type: 'warn' }); return; }
  downloadText(output.value, 'extracted.txt');
});
on($('[data-action="clear"]'),    'click', () => { input.value = ''; output.value = ''; });

/* ---------- 代码编辑器 ---------- */
createEditor(input, { mode: 'htmlmixed' });
