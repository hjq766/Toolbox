import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

const editorEl = $('[data-editor]');
const sizeEl   = $('[data-size]');
const fileEl   = $('[data-file]');

/* ---------- 示例 ---------- */
editorEl.value = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">Harry Potter</title>
    <author>J.K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="science">
    <title lang="en">A Brief History of Time</title>
    <author>Stephen Hawking</author>
    <year>1988</year>
    <price>19.99</price>
  </book>
</bookstore>`;
updateSize();

/* ---------- 大小 ---------- */
function updateSize() {
  const b = new Blob([editorEl.value]).size;
  sizeEl.textContent = b < 1024 ? b + ' B' : (b / 1024).toFixed(2) + ' KB';
}
on(editorEl, 'input', updateSize);

/* ---------- 文件导入 ---------- */
on(fileEl, 'change', e => load(e.target.files[0]));
on(editorEl, 'dragover', e => e.preventDefault());
on(editorEl, 'drop', e => { e.preventDefault(); load(e.dataTransfer.files[0]); });
function load(f) {
  if (!f) return;
  const r = new FileReader();
  r.onload = e => { editorEl.value = e.target.result; updateSize(); showToast('导入成功'); };
  r.readAsText(f);
}

/* ---------- XML 美化 ---------- */
function prettyXml(xml) {
  const PADDING = '  ';
  let formatted = '';
  let indent = 0;
  const lines = xml.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).filter(Boolean);
  for (const token of lines) {
    if (token.startsWith('</')) {
      indent--;
      formatted += PADDING.repeat(Math.max(indent, 0)) + token + '\n';
    } else if (token.startsWith('<') && !token.startsWith('<?') && !token.endsWith('/>') && !token.startsWith('<!')) {
      formatted += PADDING.repeat(indent) + token + '\n';
      indent++;
    } else if (token.endsWith('/>')) {
      formatted += PADDING.repeat(indent) + token + '\n';
    } else {
      formatted += PADDING.repeat(indent) + token + (token.startsWith('<?') || token.startsWith('<!') ? '\n' : '');
    }
  }
  return formatted.trim();
}

function parseXml(str) {
  const doc = new DOMParser().parseFromString(str, 'text/xml');
  const err = doc.getElementsByTagName('parsererror');
  if (err.length) throw new Error('XML 格式错误');
  return doc;
}

/* ---------- 操作 ---------- */
on($('[data-action="format"]'), 'click', () => {
  try {
    parseXml(editorEl.value);
    editorEl.value = prettyXml(editorEl.value);
    updateSize(); showToast('格式化成功');
  } catch (e) { showToast(e.message, { type: 'error' }); }
});

on($('[data-action="compress"]'), 'click', () => {
  try {
    parseXml(editorEl.value);
    editorEl.value = editorEl.value.replace(/>\s+</g, '><').replace(/\n\s*/g, '').trim();
    updateSize(); showToast('压缩成功');
  } catch (e) { showToast(e.message, { type: 'error' }); }
});

on($('[data-action="validate"]'), 'click', () => {
  try { parseXml(editorEl.value); showToast('XML 格式有效 ✓'); }
  catch (e) { showToast(e.message, { type: 'error' }); }
});

on($('[data-action="copy"]'), 'click', async () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  const ok = await copyText(editorEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  downloadText(editorEl.value, 'data.xml', 'text/xml');
  showToast('导出成功');
});

on($('[data-action="clear"]'), 'click', () => { editorEl.value = ''; updateSize(); });

/* ---------- 代码编辑器 ---------- */
createEditor(editorEl, { mode: 'xml' });
