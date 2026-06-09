import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ---------- Tab 切换 ---------- */
const tabs  = $$('[data-tab]');
const panes = $$('[data-pane]');
tabs.forEach(btn => on(btn, 'click', () => {
  const id = btn.dataset.tab;
  tabs.forEach(b => b.classList.toggle('is-active', b === btn));
  panes.forEach(p => p.hidden = p.dataset.pane !== id);
}));

/* ---------- UTF-8 安全的 Base64 编解码（修复栈溢出） ---------- */
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function base64ToUtf8(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* ========== 文本编码（双向实时） ========== */
const textIn  = $('[data-text-in]');
const textOut = $('[data-text-out]');
let _dir = '';  // 'encode' | 'decode' — 防止循环触发

on(textIn, 'input', () => {
  if (_dir === 'decode') return;
  _dir = 'encode';
  try { textOut.value = textIn.value ? utf8ToBase64(textIn.value) : ''; }
  catch { textOut.value = ''; }
  _dir = '';
});

on(textOut, 'input', () => {
  if (_dir === 'encode') return;
  _dir = 'decode';
  try { textIn.value = textOut.value ? base64ToUtf8(textOut.value.trim()) : ''; }
  catch { /* 输入中的 Base64 可能不完整，静默 */ }
  _dir = '';
});

on($('[data-action="copy-text"]'), 'click', async () => {
  if (!textOut.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(textOut.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear-text"]'), 'click', () => { textIn.value = ''; textOut.value = ''; });

/* ========== 图片编码 ========== */
const previewImg  = $('[data-preview]');
const previewHint = $('[data-preview-hint]');
const imgInfo     = $('[data-img-info]');
const imgOut      = $('[data-img-out]');

function showPreview(src, info) {
  previewImg.src = src;
  previewImg.hidden = false;
  previewHint.hidden = true;
  if (info) imgInfo.textContent = info;
}
function hidePreview() {
  previewImg.hidden = true;
  previewImg.src = '';
  previewHint.hidden = false;
  imgInfo.textContent = '';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function handleImageFile(file) {
  if (!file || !file.type.startsWith('image/')) { showToast('请选择图片文件', { type: 'warn' }); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    showPreview(base64, `${file.name} · ${file.type} · ${formatSize(file.size)} · Base64 长度 ${base64.length.toLocaleString()}`);
    imgOut.value = base64;
  };
  reader.readAsDataURL(file);
}

initUploadZone({
  dropEl: $('[data-drop]'),
  fileEl: $('[data-file]'),
  onFiles: (files) => handleImageFile(files[0]),
  accept: 'image',
  multiple: false,
});

/* 粘贴 Base64 到 textarea 自动还原预览 */
let _imgTimer = null;
on(imgOut, 'input', () => {
  clearTimeout(_imgTimer);
  _imgTimer = setTimeout(() => {
    const v = imgOut.value.trim();
    if (!v) { hidePreview(); return; }
    const src = v.startsWith('data:') ? v : `data:image/png;base64,${v}`;
    previewImg.onerror = () => { hidePreview(); };
    showPreview(src, `Base64 长度 ${v.length.toLocaleString()}`);
  }, 400);
});

on($('[data-action="copy-img"]'), 'click', async () => {
  if (!imgOut.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(imgOut.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear-img"]'), 'click', () => {
  hidePreview();
  imgOut.value = '';
  imgInfo.textContent = '';
});
