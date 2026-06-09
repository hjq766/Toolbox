import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { createEditor, MODES } from '../_shared/code-editor.js';

mountToolHeader();

/* globals jsyaml */
const editorEl = $('[data-editor]');
const sizeEl   = $('[data-size]');
const fileEl   = $('[data-file]');

let originalJson = null;
let currentFormat = 'json';

/* ---------- 示例数据 ---------- */
const example = {
  name: '示例数据', type: 'JSON示例', description: '这是一个JSON格式示例',
  features: ['支持嵌套结构','支持数组','支持多种数据类型'],
  types: { string: '文本', number: 123, boolean: true, null: null, array: [1,2,3], object: { key: 'value' } },
  createTime: '2024-03-20', version: 1.0
};
editorEl.value = JSON.stringify(example, null, 2);
updateSize();

/* ---------- 文件大小 ---------- */
function updateSize() {
  const bytes = new Blob([editorEl.value]).size;
  if (bytes < 1024) sizeEl.textContent = bytes + ' B';
  else if (bytes < 1024 * 1024) sizeEl.textContent = (bytes / 1024).toFixed(2) + ' KB';
  else sizeEl.textContent = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
on(editorEl, 'input', () => { updateSize(); if (currentFormat === 'json') originalJson = null; });

/* ---------- 拖拽 / 选择文件 ---------- */
on(fileEl, 'change', e => loadFile(e.target.files[0]));
on(editorEl, 'dragover', e => e.preventDefault());
on(editorEl, 'drop', e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); });
function loadFile(f) {
  if (!f) return;
  const r = new FileReader();
  r.onload = e => { editorEl.value = e.target.result; originalJson = null; updateSize(); showToast('文件导入成功'); };
  r.readAsText(f);
}

/* ---------- 格式化 / 压缩 / 校验 ---------- */
function setPreviewTab(fmt) {
  currentFormat = fmt;
  $$('[data-preview]').forEach(b => b.classList.toggle('is-active', b.dataset.preview === fmt));
}

/**
 * 解析编辑器内容为 JS 对象。
 * 优先用缓存的 originalJson，否则按 JSON → YAML 顺序自动检测。
 * CSV 内容无法反向解析，抛出友好提示。
 */
function getJson() {
  if (originalJson) return originalJson;
  const text = editorEl.value.trim();
  if (!text) throw new Error('编辑器为空');
  if (currentFormat === 'csv') throw new Error('CSV 格式无法反向解析，请先切回 JSON 或 YAML 视图');
  // 先尝试 JSON
  try { const o = JSON.parse(text); originalJson = o; return o; } catch (_) {}
  // 再尝试 YAML
  try {
    const o = jsyaml.load(text);
    if (o !== null && typeof o === 'object') { originalJson = o; return o; }
  } catch (_) {}
  throw new Error('内容不是有效的 JSON 或 YAML，请检查格式');
}

on($('[data-action="format"]'), 'click', () => {
  try {
    const obj = getJson();
    editorEl.value = JSON.stringify(obj, null, 2);
    originalJson = obj; setPreviewTab('json'); updateSize();
    showToast('格式化成功');
  } catch (e) { showToast('格式化失败：' + e.message, { type: 'error' }); }
});

on($('[data-action="compress"]'), 'click', () => {
  try {
    const obj = getJson();
    editorEl.value = JSON.stringify(obj);
    originalJson = obj; setPreviewTab('json'); updateSize();
    showToast('压缩成功');
  } catch (e) { showToast('压缩失败：' + e.message, { type: 'error' }); }
});

on($('[data-action="validate"]'), 'click', () => {
  try {
    getJson(); // 复用自动检测逻辑
    showToast(currentFormat === 'yaml' ? 'YAML 格式有效 ✓' : 'JSON 格式有效 ✓', { type: 'success' });
  } catch (e) { showToast('格式无效：' + e.message, { type: 'error' }); }
});

/* ---------- 预览为 JSON / YAML / CSV ---------- */
function jsonToCSV(data) {
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.length) throw new Error('空数据');
  const headers = [...new Set(arr.flatMap(o => Object.keys(o)))];
  const rows = [headers.join(',')];
  arr.forEach(obj => {
    rows.push(headers.map(h => {
      const v = obj[h];
      if (v == null) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`;
      return v;
    }).join(','));
  });
  return rows.join('\n');
}

$$('[data-preview]').forEach(btn => on(btn, 'click', () => {
  const fmt = btn.dataset.preview;
  if (fmt === currentFormat) return; // 已是当前格式，不重复处理
  try {
    const json = getJson(); // 自动检测 JSON / YAML，CSV 会提前报错
    let output;
    if (fmt === 'json')      output = JSON.stringify(json, null, 2);
    else if (fmt === 'yaml') output = jsyaml.dump(json);
    else if (fmt === 'csv')  output = jsonToCSV(json);
    editorEl.value = output;
    setPreviewTab(fmt);
    updateSize();
    showToast(`已切换到 ${fmt.toUpperCase()}`);
  } catch (e) { showToast('转换失败：' + e.message, { type: 'error' }); }
}));

/* ---------- 复制 / 导出 / 清空 ---------- */
on($('[data-action="copy"]'), 'click', async () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  const ok = await copyText(editorEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  const ext = { json: 'json', yaml: 'yaml', csv: 'csv' }[currentFormat] || 'json';
  downloadText(editorEl.value, `data.${ext}`, `text/${ext}`);
  showToast('导出成功');
});

on($('[data-action="clear"]'), 'click', () => {
  editorEl.value = ''; originalJson = null; updateSize();
});

/* ---------- 代码编辑器 ---------- */
createEditor(editorEl, { mode: MODES.json });
