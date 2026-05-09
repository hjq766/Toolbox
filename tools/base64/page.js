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

/* ---------- UTF-8 安全的 Base64 编解码 ---------- */
function utf8ToBase64(str) {
  return btoa(String.fromCodePoint(...new TextEncoder().encode(str)));
}
function base64ToUtf8(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.codePointAt(0));
  return new TextDecoder().decode(bytes);
}

/* ========== 文本编码 ========== */
const textIn  = $('[data-text-in]');
const textOut = $('[data-text-out]');

function encode() {
  if (!textIn.value) { showToast('请输入文本', { type: 'warn' }); return; }
  try {
    textOut.value = utf8ToBase64(textIn.value);
    showToast('编码成功', { type: 'success' });
  } catch (e) { showToast('编码失败：' + e.message, { type: 'error' }); }
}
function decode() {
  if (!textOut.value) { showToast('请在右侧输入 Base64', { type: 'warn' }); return; }
  try {
    textIn.value = base64ToUtf8(textOut.value.trim());
    showToast('解码成功', { type: 'success' });
  } catch (_) { showToast('解码失败：无效的 Base64', { type: 'error' }); }
}

on($('[data-action="encode"]'),     'click', encode);
on($('[data-action="decode"]'),     'click', decode);
on($('[data-action="copy-text"]'),  'click', async () => {
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
    showToast('图片转换成功', { type: 'success' });
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

on($('[data-action="decode-img"]'), 'click', () => {
  const v = imgOut.value.trim();
  if (!v) { showToast('请输入 Base64', { type: 'warn' }); return; }
  const src = v.startsWith('data:') ? v : `data:image/png;base64,${v}`;
  previewImg.onerror = () => { hidePreview(); showToast('无效的图片 Base64', { type: 'error' }); };
  showPreview(src, `Base64 长度 ${v.length.toLocaleString()}`);
  showToast('图片还原成功', { type: 'success' });
});
on($('[data-action="copy-img"]'), 'click', async () => {
  if (!imgOut.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(imgOut.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear-img"]'), 'click', () => {
  hidePreview();
  imgOut.value = '';
});
