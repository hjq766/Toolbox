import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== 状态 ========== */
let currentImage = null;
let currentFile  = null;
let currentRotation = 0;
let isFlippedH = false;
let isFlippedV = false;

/* ========== DOM ========== */
const dropEl     = $('[data-drop]');
const fileEl     = $('[data-file]');
const previewEl  = $('[data-preview]');
const canvasEl   = $('[data-canvas]');
const ctx        = canvasEl.getContext('2d');
const dlBtn      = $('[data-action="download"]');
const deleteBtn  = $('[data-action="delete"]');
const statePanel = $('[data-state-panel]');
const stateTags  = $('[data-state-tags]');
const infoName   = $('[data-info-name]');
const infoDim    = $('[data-info-dim]');
const infoSize   = $('[data-info-size]');
const infoType   = $('[data-info-type]');

/* ========== 工具 ========== */
function fmtSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024, u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + u[i];
}

/* ========== 上传 ========== */
initUploadZone({ dropEl, fileEl, onFiles: files => handleFile(files[0]), accept: 'image' });

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 10 * 1024 * 1024) { showToast('图片过大，请选择 10MB 以内的图片'); return; }
  currentFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      resetTransforms();
      dropEl.hidden = true; previewEl.hidden = false;
      dlBtn.disabled = false; deleteBtn.hidden = false;
      infoName.textContent = file.name;
      infoDim.textContent  = `${img.naturalWidth} × ${img.naturalHeight}`;
      infoSize.textContent = fmtSize(file.size);
      infoType.textContent = file.type.split('/')[1]?.toUpperCase() || '-';
      displayImage();
      updateStateTags();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ========== 显示 ========== */
function displayImage() {
  if (!currentImage) return;
  const wrap = canvasEl.parentElement;
  const maxW = wrap.offsetWidth || 600;
  const maxH = window.innerHeight * 0.65;
  const rotated = currentRotation % 180 !== 0;
  const effW = rotated ? currentImage.height : currentImage.width;
  const effH = rotated ? currentImage.width : currentImage.height;
  const scale = Math.min(maxW / effW, maxH / effH, 1);
  canvasEl.width  = Math.max(Math.floor(effW * scale), 1);
  canvasEl.height = Math.max(Math.floor(effH * scale), 1);
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.save();
  ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
  if (currentRotation) ctx.rotate(currentRotation * Math.PI / 180);
  ctx.scale(isFlippedH ? -1 : 1, isFlippedV ? -1 : 1);
  const dw = currentImage.width * scale, dh = currentImage.height * scale;
  ctx.drawImage(currentImage, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function resetTransforms() { currentRotation = 0; isFlippedH = false; isFlippedV = false; }

/* ========== 变换状态标签 ========== */
function updateStateTags() {
  const tags = [];
  if (isFlippedH) tags.push('水平翻转');
  if (isFlippedV) tags.push('垂直翻转');
  if (currentRotation) tags.push(`旋转 ${currentRotation}°`);
  statePanel.hidden = tags.length === 0;
  stateTags.innerHTML = tags.length
    ? tags.map(t => `<span class="state-tag is-active">${t}</span>`).join('')
    : '';
}

/* ========== 操作按钮 ========== */
function act(fn) { if (!currentImage) return; fn(); displayImage(); updateStateTags(); }
on($('[data-action="flip-h"]'),     'click', () => act(() => isFlippedH = !isFlippedH));
on($('[data-action="flip-v"]'),     'click', () => act(() => isFlippedV = !isFlippedV));
on($('[data-action="rotate-cw"]'),  'click', () => act(() => currentRotation = (currentRotation + 90) % 360));
on($('[data-action="rotate-ccw"]'), 'click', () => act(() => currentRotation = (currentRotation - 90 + 360) % 360));
on($('[data-action="rotate-180"]'), 'click', () => act(() => currentRotation = (currentRotation + 180) % 360));
on($('[data-action="reset"]'),      'click', () => { if (!currentImage) return; resetTransforms(); displayImage(); updateStateTags(); showToast('已重置'); });

/* ========== 下载 ========== */
on(dlBtn, 'click', () => {
  if (!currentImage) return;
  const tmp = document.createElement('canvas');
  const tCtx = tmp.getContext('2d');
  const rotated = currentRotation % 180 !== 0;
  tmp.width  = rotated ? currentImage.height : currentImage.width;
  tmp.height = rotated ? currentImage.width  : currentImage.height;
  tCtx.save();
  tCtx.translate(tmp.width / 2, tmp.height / 2);
  if (currentRotation) tCtx.rotate(currentRotation * Math.PI / 180);
  tCtx.scale(isFlippedH ? -1 : 1, isFlippedV ? -1 : 1);
  tCtx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);
  tCtx.restore();

  const fileName = currentFile?.name || 'image.png';
  const ext = fileName.split('.').pop().toLowerCase();
  const base = fileName.substring(0, fileName.lastIndexOf('.')) || 'image';
  let ops = [];
  if (isFlippedH) ops.push('h-flip');
  if (isFlippedV) ops.push('v-flip');
  if (currentRotation) ops.push('r' + currentRotation);
  const suffix = ops.length ? '_' + ops.join('_') : '_edited';

  let mime = 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
  else if (ext === 'webp') mime = 'image/webp';

  tmp.toBlob(blob => downloadBlob(blob, `${base}${suffix}.${ext}`), mime, 0.95);
});

/* ========== 删除 ========== */
on(deleteBtn, 'click', () => {
  currentImage = null; currentFile = null; resetTransforms();
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  previewEl.hidden = true; dropEl.hidden = false;
  dlBtn.disabled = true; deleteBtn.hidden = true;
  statePanel.hidden = true; fileEl.value = '';
});
