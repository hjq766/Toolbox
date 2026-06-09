import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== state ========== */
let currentImage = null;
let rows = 3, cols = 3;
let sourceBaseName = 'grid';
let selectedFormat = 'png';
let imageQuality = 0.92;

const MIME_MAP = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

/* ========== DOM ========== */
const dropEl    = $('[data-drop]');
const fileEl    = $('[data-file]');
const previewEl = $('[data-preview]');
const canvasEl  = $('[data-canvas]');
const ctx       = canvasEl.getContext('2d');
const cutBtn    = $('[data-action="cut"]');
const imageInfo = $('[data-image-info]');
const presetsEl = $('[data-presets]');
const customGroup = $('[data-custom-group]');
const customRows = $('[data-custom-rows]');
const customCols = $('[data-custom-cols]');
const formatRow = $('[data-format-row]');
const qualityPanel = $('[data-quality-panel]');
const qualityInput = $('[data-quality]');
const qualityVal = $('[data-quality-val]');
const namePrefix = $('[data-name-prefix]');

/* ========== 上传 ========== */
initUploadZone({ dropEl, fileEl, onFiles: files => handleFile(files[0]), accept: 'image', onDelete: clearImage });

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  sourceBaseName = getBaseName(file.name);
  if (!namePrefix.value.trim()) namePrefix.placeholder = sourceBaseName;
  if (file.type === 'image/gif') showToast('GIF 会按静态首帧切割', { type: 'warn' });
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      dropEl.hidden = true;
      previewEl.hidden = false;
      cutBtn.disabled = false;
      displayImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ========== 显示图片 ========== */
function displayImage() {
  if (!currentImage) return;
  const wrap = canvasEl.parentElement;
  const maxW = wrap.offsetWidth || 600, maxH = 500;
  const scale = Math.min(maxW / currentImage.width, maxH / currentImage.height, 1);
  const w = Math.round(currentImage.width * scale);
  const h = Math.round(currentImage.height * scale);
  canvasEl.width = w; canvasEl.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(currentImage, 0, 0, w, h);
  canvasEl._info = { w, h, scale };
  drawGridLines();
  updateImageInfo();
}

/* ========== 网格线 ========== */
function drawGridLines() {
  if (!currentImage || !canvasEl._info) return;
  const { w, h } = canvasEl._info;
  ctx.drawImage(currentImage, 0, 0, w, h);

  ctx.setLineDash([4, 4]);
  const makeLine = (x1, y1, x2, y2, stroke, widthPx) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = widthPx;
    ctx.stroke();
  };
  const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const backStroke = token('--fg-invert');
  const frontStroke = token('--color-brand');

  ctx.save();
  for (let i = 1; i < cols; i++) makeLine(w * i / cols, 0, w * i / cols, h, backStroke, 3);
  for (let i = 1; i < rows; i++) makeLine(0, h * i / rows, w, h * i / rows, backStroke, 3);
  for (let i = 1; i < cols; i++) makeLine(w * i / cols, 0, w * i / cols, h, frontStroke, 1);
  for (let i = 1; i < rows; i++) makeLine(0, h * i / rows, w, h * i / rows, frontStroke, 1);
  ctx.restore();
}

function updateImageInfo() {
  if (!currentImage) {
    imageInfo.textContent = '';
    return;
  }
  const minPieceW = Math.floor(currentImage.width / cols);
  const maxPieceW = Math.ceil(currentImage.width / cols);
  const minPieceH = Math.floor(currentImage.height / rows);
  const maxPieceH = Math.ceil(currentImage.height / rows);
  const pieceText = minPieceW === maxPieceW && minPieceH === maxPieceH
    ? `${minPieceW} × ${minPieceH}`
    : `约 ${minPieceW}-${maxPieceW} × ${minPieceH}-${maxPieceH}`;
  imageInfo.textContent = `${currentImage.width} × ${currentImage.height} · ${rows} × ${cols} · ${rows * cols} 张 · 单张 ${pieceText}`;
}

function getBaseName(filename) {
  return (filename || 'grid').replace(/\.[^.]+$/, '').trim() || 'grid';
}

function sanitizeName(value) {
  return (value || '').trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_') || 'grid';
}

function pad(num, size) {
  return String(num).padStart(size, '0');
}

function getExportBaseName() {
  return sanitizeName(namePrefix.value || sourceBaseName);
}

function updateQualityPanel() {
  qualityPanel.hidden = !(selectedFormat === 'jpg' || selectedFormat === 'webp');
}

function fillBackgroundForOpaqueFormat(context, width, height) {
  if (selectedFormat !== 'jpg') return;
  context.save();
  context.globalCompositeOperation = 'destination-over';
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim();
  context.fillRect(0, 0, width, height);
  context.restore();
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, mime, quality));
}

function setRange(el) {
  const min = parseFloat(el.min) || 0;
  const max = parseFloat(el.max) || 100;
  const value = parseFloat(el.value) || min;
  el.style.setProperty('--range-pct', `${((value - min) / (max - min)) * 100}%`);
}

function readGridValue(input, fallback) {
  const value = parseInt(input.value, 10);
  return Number.isFinite(value) ? Math.min(Math.max(value, 1), 10) : fallback;
}

function applyCustomGrid({ commit = false } = {}) {
  rows = readGridValue(customRows, rows);
  cols = readGridValue(customCols, cols);
  if (commit) {
    customRows.value = rows;
    customCols.value = cols;
  }
  drawGridLines();
  updateImageInfo();
}

/* ========== 宫格预设 ========== */
on(presetsEl, 'click', e => {
  const btn = e.target.closest('[data-rows]');
  const customBtn = e.target.closest('[data-custom]');
  if (btn) {
    rows = +btn.dataset.rows; cols = +btn.dataset.cols;
    $$('.btn', presetsEl).forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    customGroup.hidden = true;
    drawGridLines();
    updateImageInfo();
  } else if (customBtn) {
    $$('.btn', presetsEl).forEach(b => b.classList.remove('is-active'));
    customBtn.classList.add('is-active');
    customGroup.hidden = false;
    customRows.value = rows;
    customCols.value = cols;
    applyCustomGrid();
  }
});

on(customGroup, 'input', e => {
  if (!e.target.matches('[data-custom-rows], [data-custom-cols]')) return;
  applyCustomGrid();
});
on(customGroup, 'change', e => {
  if (!e.target.matches('[data-custom-rows], [data-custom-cols]')) return;
  applyCustomGrid({ commit: true });
});

on(formatRow, 'click', e => {
  const btn = e.target.closest('[data-format]');
  if (!btn) return;
  selectedFormat = btn.dataset.format;
  $$('[data-format]', formatRow).forEach(b => b.classList.toggle('is-active', b === btn));
  updateQualityPanel();
});

on(qualityInput, 'input', () => {
  imageQuality = +qualityInput.value / 100;
  qualityVal.textContent = `${qualityInput.value}%`;
  setRange(qualityInput);
});

const previewResize = new ResizeObserver(() => displayImage());
previewResize.observe(canvasEl.parentElement);

/* ========== 切割下载 ========== */
on(cutBtn, 'click', async () => {
  if (!currentImage) { showToast('请先上传图片'); return; }
  if (typeof JSZip === 'undefined') { showToast('ZIP 库未加载，请刷新后重试', { type: 'error' }); return; }
  showToast('正在切割...');
  cutBtn.disabled = true;
  try {
    const tmp = document.createElement('canvas');
    const tmpCtx = tmp.getContext('2d');
    const mime = MIME_MAP[selectedFormat] || MIME_MAP.png;
    const quality = selectedFormat === 'jpg' || selectedFormat === 'webp' ? imageQuality : undefined;
    const base = getExportBaseName();
    const ext = selectedFormat;
    const rowDigits = String(rows).length;
    const colDigits = String(cols).length;
    let warnedWebpFallback = false;

    const zip = new JSZip();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = Math.round(c * currentImage.width / cols);
        const sy = Math.round(r * currentImage.height / rows);
        const ex = Math.round((c + 1) * currentImage.width / cols);
        const ey = Math.round((r + 1) * currentImage.height / rows);
        const sw = ex - sx;
        const sh = ey - sy;
        tmp.width = sw; tmp.height = sh;
        tmpCtx.clearRect(0, 0, sw, sh);
        tmpCtx.drawImage(currentImage, sx, sy, sw, sh, 0, 0, sw, sh);
        fillBackgroundForOpaqueFormat(tmpCtx, sw, sh);
        let blob = await canvasToBlob(tmp, mime, quality);
        if (selectedFormat === 'webp' && blob && blob.type !== MIME_MAP.webp) {
          blob = await canvasToBlob(tmp, MIME_MAP.png);
          if (!warnedWebpFallback) {
            showToast('当前浏览器不支持 WebP 导出，已改用 PNG', { type: 'warn' });
            warnedWebpFallback = true;
          }
        }
        if (!blob) throw new Error('canvas export failed');
        const actualExt = blob.type === MIME_MAP.png && selectedFormat === 'webp' ? 'png' : ext;
        zip.file(`${base}_r${pad(r + 1, rowDigits)}_c${pad(c + 1, colDigits)}.${actualExt}`, blob);
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${base}_${rows}x${cols}.zip`);
    showToast('下载已开始');
  } catch (err) {
    showToast('切割失败，请重试', { type: 'error' });
  } finally {
    cutBtn.disabled = false;
  }
});

/* ========== 删除 ========== */
function clearImage() {
  currentImage = null;
  canvasEl._info = null;
  sourceBaseName = 'grid';
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  imageInfo.textContent = '';
  previewEl.hidden = true;
  dropEl.hidden = false;
  cutBtn.disabled = true;
  fileEl.value = '';
  namePrefix.placeholder = '默认使用原图文件名';
}

updateQualityPanel();
setRange(qualityInput);
