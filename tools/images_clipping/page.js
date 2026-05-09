import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== state ========== */
let currentImage = null;
let currentFile  = null;
let rotation = 0, flipH = false, flipV = false;
let currentRatio = 'free';
let canvasScale = 1;
let cropData = { x: 0, y: 0, width: 0, height: 0 };
let isDragging = false, isResizing = false, resizeHandle = null;
let startX = 0, startY = 0;

/* ========== DOM ========== */
const dropEl      = $('[data-drop]');
const fileEl      = $('[data-file]');
const previewEl   = $('[data-preview]');
const resultEl    = $('[data-result]');
const canvasEl    = $('[data-canvas]');
const ctx         = canvasEl.getContext('2d');
const cropBox     = $('[data-crop-box]');
const imgPreview  = $('[data-image-preview]');
const cropSizeEl  = $('[data-crop-size]');
const sizeInfoEl  = $('[data-size-info]');
const resultImg   = $('[data-result-img]');
const cropBtn     = $('[data-action="crop"]');

/* ========== 上传 ========== */
initUploadZone({ dropEl, fileEl, onFiles: files => handleFile(files[0]), accept: 'image' });

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  currentFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      rotation = 0; flipH = false; flipV = false;
      dropEl.hidden = true; previewEl.hidden = false; resultEl.hidden = true;
      cropBtn.disabled = false;
      sizeInfoEl.textContent = `${img.width} × ${img.height}`;
      setTimeout(() => { displayImage(); initCropBox(); }, 0);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ========== 显示 ========== */
function displayImage() {
  if (!currentImage) return;
  const container = imgPreview;
  const cw = container.offsetWidth, ch = container.offsetHeight || 400;
  let imgW = currentImage.width, imgH = currentImage.height;
  if (rotation % 180 !== 0) [imgW, imgH] = [imgH, imgW];
  const scX = cw / imgW, scY = ch / imgH;
  canvasScale = Math.min(scX, scY, 1);
  const dw = imgW * canvasScale, dh = imgH * canvasScale;
  canvasEl.width = dw; canvasEl.height = dh;
  canvasEl.style.width = dw + 'px'; canvasEl.style.height = dh + 'px';
  ctx.save(); ctx.clearRect(0, 0, dw, dh);
  ctx.translate(dw / 2, dh / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  const drawW = rotation % 180 === 0 ? dw : dh;
  const drawH = rotation % 180 === 0 ? dh : dw;
  ctx.drawImage(currentImage, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

/* ========== 裁剪框 ========== */
function initCropBox() {
  cropData = { x: 0, y: 0, width: canvasEl.width, height: canvasEl.height };
  updateCropBox();
  cropBox.classList.add('active');
}

function updateCropBox() {
  const cr = canvasEl.getBoundingClientRect();
  const pr = imgPreview.getBoundingClientRect();
  cropBox.style.left   = (cr.left - pr.left + cropData.x) + 'px';
  cropBox.style.top    = (cr.top - pr.top + cropData.y) + 'px';
  cropBox.style.width  = cropData.width + 'px';
  cropBox.style.height = cropData.height + 'px';
  const aw = Math.round(cropData.width / canvasScale);
  const ah = Math.round(cropData.height / canvasScale);
  cropSizeEl.textContent = `裁剪区域: ${aw} × ${ah}`;
}

/* ========== 拖拽/缩放 裁剪框 ========== */
on(cropBox, 'mousedown', e => {
  const handle = e.target.closest('.crop-handle');
  if (handle) {
    isResizing = true;
    resizeHandle = handle.className.split(' ').find(c => c !== 'crop-handle');
  } else { isDragging = true; }
  startX = e.clientX; startY = e.clientY;
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!isDragging && !isResizing) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  if (isDragging) {
    cropData.x = Math.max(0, Math.min(cropData.x + dx, canvasEl.width - cropData.width));
    cropData.y = Math.max(0, Math.min(cropData.y + dy, canvasEl.height - cropData.height));
  } else if (isResizing) {
    resizeCrop(dx, dy);
  }
  startX = e.clientX; startY = e.clientY;
  updateCropBox();
});

document.addEventListener('mouseup', () => { isDragging = false; isResizing = false; resizeHandle = null; });

function resizeCrop(dx, dy) {
  const min = 30;
  let { x, y, width: w, height: h } = cropData;
  switch (resizeHandle) {
    case 'nw': x += dx; y += dy; w -= dx; h -= dy; break;
    case 'ne': y += dy; w += dx; h -= dy; break;
    case 'sw': x += dx; w -= dx; h += dy; break;
    case 'se': w += dx; h += dy; break;
    case 'n': y += dy; h -= dy; break;
    case 's': h += dy; break;
    case 'w': x += dx; w -= dx; break;
    case 'e': w += dx; break;
  }
  if (currentRatio !== 'free') {
    const [rw, rh] = currentRatio.split(':').map(Number);
    const r = rw / rh;
    if (resizeHandle.includes('e') || resizeHandle.includes('w')) h = w / r;
    else w = h * r;
    if (resizeHandle.includes('n')) y = cropData.y + cropData.height - h;
    if (resizeHandle.includes('w')) x = cropData.x + cropData.width - w;
  }
  if (w >= min && h >= min && x >= 0 && y >= 0 && x + w <= canvasEl.width && y + h <= canvasEl.height) {
    cropData = { x, y, width: w, height: h };
  }
}

/* ========== 比例 ========== */
$('[data-ratio-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-ratio]'); if (!btn) return;
  $('[data-ratio-opts]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentRatio = btn.dataset.ratio;
  if (currentRatio !== 'free' && canvasEl.width) {
    const [rw, rh] = currentRatio.split(':').map(Number);
    const r = rw / rh;
    const cRatio = canvasEl.width / canvasEl.height;
    let nw, nh;
    if (r > cRatio) { nw = canvasEl.width; nh = nw / r; }
    else { nh = canvasEl.height; nw = nh * r; }
    cropData = { x: (canvasEl.width - nw) / 2, y: (canvasEl.height - nh) / 2, width: nw, height: nh };
    updateCropBox();
  }
});

/* ========== 旋转翻转 ========== */
on($('[data-action="rotate-left"]'),  'click', () => { rotation = (rotation - 90 + 360) % 360; displayImage(); initCropBox(); });
on($('[data-action="rotate-right"]'), 'click', () => { rotation = (rotation + 90) % 360; displayImage(); initCropBox(); });
on($('[data-action="flip-h"]'), 'click', () => { flipH = !flipH; displayImage(); });
on($('[data-action="flip-v"]'), 'click', () => { flipV = !flipV; displayImage(); });
on($('[data-action="reset"]'),  'click', () => { rotation = 0; flipH = false; flipV = false; displayImage(); initCropBox(); });

/* ========== 裁剪 ========== */
on(cropBtn, 'click', () => {
  if (!currentImage) return;
  const isRotated = rotation % 180 !== 0;
  const tw = isRotated ? currentImage.height : currentImage.width;
  const th = isRotated ? currentImage.width : currentImage.height;

  const full = document.createElement('canvas');
  full.width = tw; full.height = th;
  const fCtx = full.getContext('2d');
  fCtx.save(); fCtx.translate(tw / 2, th / 2);
  fCtx.rotate(rotation * Math.PI / 180);
  fCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  fCtx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);
  fCtx.restore();

  const fmt = document.querySelector('[data-format-opts] .active')?.dataset.fmt || 'image/jpeg';
  const cx = cropData.x / canvasScale, cy = cropData.y / canvasScale;
  const cw = cropData.width / canvasScale, ch = cropData.height / canvasScale;

  const out = document.createElement('canvas');
  out.width = cw; out.height = ch;
  const oCtx = out.getContext('2d');
  if (fmt === 'image/jpeg') { oCtx.fillStyle = '#fff'; oCtx.fillRect(0, 0, cw, ch); }
  oCtx.drawImage(full, cx, cy, cw, ch, 0, 0, cw, ch);

  resultImg.src = out.toDataURL(fmt, 1.0);
  previewEl.hidden = true; resultEl.hidden = false;
  showToast('裁剪完成');
});

/* ========== 下载 ========== */
on($('[data-action="download"]'), 'click', () => {
  const fmt = document.querySelector('[data-format-opts] .active')?.dataset.fmt || 'image/jpeg';
  const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const ext = extMap[fmt] || 'jpg';
  const name = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'image';
  const link = document.createElement('a');
  link.download = `${name}-cropped.${ext}`;
  link.href = resultImg.src;
  link.click();
});

on($('[data-action="continue"]'), 'click', () => { resultEl.hidden = true; previewEl.hidden = false; });

/* ========== 格式选择 ========== */
$('[data-format-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-fmt]'); if (!btn) return;
  $('[data-format-opts]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

/* ========== 删除 ========== */
on($('[data-action="delete"]'), 'click', () => {
  currentImage = null; currentFile = null;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  cropBox.classList.remove('active');
  previewEl.hidden = true; resultEl.hidden = true; dropEl.hidden = false;
  cropBtn.disabled = true; fileEl.value = '';
});
