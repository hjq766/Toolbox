/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/* ========== 2. 状态 ========== */
let currentFile  = null;
let currentImage = null;

/* ========== 3. DOM 引用 ========== */
const canvas       = $('[data-canvas]');
const ctx          = canvas.getContext('2d');
const previewPanel = $('[data-preview-panel]');
const infoPanel    = $('[data-info-panel]');
const downloadBtn  = $('[data-action="download"]');
const deleteBtn    = $('[data-action="delete"]');

/* ========== 4. 工具函数 ========== */

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

function displayImage(img) {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // TODO: 在此处添加处理逻辑（翻转/滤镜/裁剪等），然后绘制
  ctx.drawImage(img, 0, 0);

  previewPanel.hidden = false;
}

function updateInfo(file, img) {
  $('[data-info="name"]').textContent = file.name;
  $('[data-info="size"]').textContent = fmtSize(file.size);
  $('[data-info="dimensions"]').textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
  $('[data-info="type"]').textContent = file.type || '未知';
  infoPanel.hidden = false;
}

function setButtons(enabled) {
  downloadBtn.disabled = !enabled;
  deleteBtn.disabled = !enabled;
}

function clearAll() {
  currentFile = null;
  currentImage = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  previewPanel.hidden = true;
  infoPanel.hidden = true;
  setButtons(false);
}

// TODO: 添加业务处理函数
function processImage() {
  if (!currentImage) return;
  displayImage(currentImage);
}

/* ========== 5. 事件绑定 ========== */

initUploadZone({
  dropEl: $('[data-drop]'),
  fileEl: $('[data-file]'),
  accept: 'image',
  onFiles: async (files) => {
    const file = files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      showToast('文件不能超过 10MB', { type: 'warn' });
      return;
    }

    try {
      currentFile = file;
      currentImage = await loadImage(file);
      displayImage(currentImage);
      updateInfo(file, currentImage);
      setButtons(true);
    } catch (e) {
      showToast(e.message, { type: 'error' });
    }
  },
});

on(downloadBtn, 'click', () => {
  if (!currentFile) return;
  canvas.toBlob(blob => {
    if (!blob) { showToast('导出失败', { type: 'error' }); return; }
    // TODO: 根据工具类型调整文件名和格式
    const name = currentFile.name.replace(/\.[^.]+$/, '') + '_processed.png';
    downloadBlob(blob, name);
    showToast('下载成功', { type: 'success' });
  }, 'image/png');
});

on(deleteBtn, 'click', () => {
  clearAll();
  showToast('已清除');
});
