import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== state ========== */
let currentImage  = null;
let currentMode   = 'auto';   // auto | manual | selection
let currentFormat = 'hex';
let isSelecting   = false;
let startX = 0, startY = 0;
let selectionData = null;
const colorThief  = new ColorThief();

/* ========== DOM ========== */
const dropEl       = $('[data-drop]');
const fileEl       = $('[data-file]');
const previewSec   = $('[data-preview-section]');
const colorsSec    = $('[data-colors-section]');
const canvasEl     = $('[data-canvas]');
const ctx          = canvasEl.getContext('2d');
const colorListEl  = $('[data-color-list]');

/* ========== 颜色转换 ========== */
function rgbToHex(rgb) {
  const v = rgb.match(/\d+/g);
  return '#' + v.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}
function rgbToHsl(rgb) {
  const v = rgb.match(/\d+/g).map(Number);
  const [r, g, b] = v.map(x => x / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}
function formatColor(rgb) {
  switch (currentFormat) {
    case 'hex': return rgbToHex(rgb);
    case 'rgb': return rgb;
    case 'hsl': { const h = rgbToHsl(rgb); return `hsl(${Math.round(h[0])}, ${Math.round(h[1])}%, ${Math.round(h[2])}%)`; }
  }
  return rgbToHex(rgb);
}
function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000' : '#fff';
}

/* ========== 上传 ========== */
initUploadZone({ dropEl, fileEl, onFiles: files => handleFile(files[0]), accept: 'image' });

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      dropEl.hidden = true;
      previewSec.hidden = false;
      colorsSec.hidden = false;
      setTimeout(() => { resizeCanvas(); extractAuto(); }, 0);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function resizeCanvas() {
  const wrap = canvasEl.parentElement;
  const maxW = wrap.offsetWidth, maxH = 400;
  const ratio = currentImage.width / currentImage.height;
  let w, h;
  if (ratio > maxW / maxH) { w = maxW; h = w / ratio; } else { h = maxH; w = h * ratio; }
  canvasEl.width = Math.round(w); canvasEl.height = Math.round(h);
  canvasEl.style.width = w + 'px'; canvasEl.style.height = h + 'px';
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(currentImage, 0, 0, w, h);
}

/* ========== 自动提取 ========== */
function extractAuto() {
  if (!currentImage) return;
  const count = +document.querySelector('[data-count-opts] .active')?.dataset.count || 5;
  const colors = colorThief.getPalette(currentImage, count);
  const strs = colors.map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
  addColors(strs, false);
}

/* ========== 颜色列表 ========== */
function addColors(colors, append) {
  if (!append) colorListEl.innerHTML = '';
  colors.forEach(rgb => {
    const hex = rgbToHex(rgb);
    const card = document.createElement('div');
    card.className = 'color-card';
    card.innerHTML = `<div class="color-swatch" style="background:${hex}"></div><span class="color-val">${formatColor(rgb)}</span><button class="color-del" title="删除">✕</button>`;
    card.dataset.rgb = rgb;
    card.addEventListener('click', e => {
      if (e.target.closest('.color-del')) { card.remove(); return; }
      navigator.clipboard.writeText(card.querySelector('.color-val').textContent);
      showToast('已复制');
    });
    colorListEl.appendChild(card);
  });
}

/* ========== 模式切换 ========== */
document.querySelectorAll('[data-mode]').forEach(btn => {
  on(btn, 'click', () => {
    const m = btn.dataset.mode;
    currentMode = currentMode === m ? 'auto' : m;
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === currentMode && currentMode !== 'auto'));
    canvasEl.style.cursor = (currentMode === 'manual' || currentMode === 'selection') ? 'crosshair' : 'default';
  });
});

/* ========== 手动取色 ========== */
on(canvasEl, 'click', e => {
  if (currentMode !== 'manual') return;
  const rect = canvasEl.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const px = ctx.getImageData(x, y, 1, 1).data;
  addColors([`rgb(${px[0]}, ${px[1]}, ${px[2]})`], true);
});

/* ========== 选区取色 ========== */
on(canvasEl, 'mousedown', e => {
  if (currentMode !== 'selection' || !currentImage) return;
  const rect = canvasEl.getBoundingClientRect();
  const scX = canvasEl.width / rect.width, scY = canvasEl.height / rect.height;
  startX = (e.clientX - rect.left) * scX; startY = (e.clientY - rect.top) * scY;
  isSelecting = true;
  selectionData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
});
on(canvasEl, 'mousemove', e => {
  if (!isSelecting) return;
  const rect = canvasEl.getBoundingClientRect();
  const scX = canvasEl.width / rect.width, scY = canvasEl.height / rect.height;
  const cx = (e.clientX - rect.left) * scX, cy = (e.clientY - rect.top) * scY;
  if (selectionData) ctx.putImageData(selectionData, 0, 0);
  ctx.strokeStyle = 'var(--color-brand, #3b82f6)'; ctx.lineWidth = 2;
  ctx.strokeRect(Math.min(startX, cx), Math.min(startY, cy), Math.abs(cx - startX), Math.abs(cy - startY));
  ctx.fillStyle = 'rgba(59,130,246,.15)';
  ctx.fillRect(Math.min(startX, cx), Math.min(startY, cy), Math.abs(cx - startX), Math.abs(cy - startY));
});
on(canvasEl, 'mouseup', e => {
  if (!isSelecting) return;
  isSelecting = false;
  const rect = canvasEl.getBoundingClientRect();
  const scX = canvasEl.width / rect.width, scY = canvasEl.height / rect.height;
  const ex = (e.clientX - rect.left) * scX, ey = (e.clientY - rect.top) * scY;
  const w = Math.abs(ex - startX), h = Math.abs(ey - startY);
  if (selectionData) ctx.putImageData(selectionData, 0, 0);
  if (w < 10 || h < 10) return;
  try {
    const tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    const tmpCtx = tmp.getContext('2d');
    const sx = Math.min(startX, ex) * (currentImage.width / canvasEl.width);
    const sy = Math.min(startY, ey) * (currentImage.height / canvasEl.height);
    const sw = w * (currentImage.width / canvasEl.width);
    const sh = h * (currentImage.height / canvasEl.height);
    tmpCtx.drawImage(currentImage, sx, sy, sw, sh, 0, 0, w, h);
    const colors = colorThief.getPalette(tmp, 5);
    addColors(colors.map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`), true);
  } catch (_) { /* ignore */ }
});
on(canvasEl, 'mouseleave', () => { if (isSelecting) { isSelecting = false; if (selectionData) ctx.putImageData(selectionData, 0, 0); } });

/* ========== 选项面板 ========== */
// 取色数量
$('[data-count-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-count]'); if (!btn) return;
  $('[data-count-opts]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (currentImage) extractAuto();
});

// 排序
$('[data-sort-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-sort]'); if (!btn) return;
  $('[data-sort-opts]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const sortType = btn.dataset.sort;
  if (sortType === 'default') return;
  const cards = Array.from(colorListEl.children);
  cards.sort((a, b) => {
    const [ha, hb] = [rgbToHsl(a.dataset.rgb), rgbToHsl(b.dataset.rgb)];
    if (sortType === 'brightness') return hb[2] - ha[2];
    if (sortType === 'hue') return ha[0] - hb[0];
    return hb[1] - ha[1];
  });
  cards.forEach(c => colorListEl.appendChild(c));
});

// 格式
$('[data-format-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-format]'); if (!btn) return;
  $('[data-format-opts]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFormat = btn.dataset.format;
  colorListEl.querySelectorAll('.color-card').forEach(card => {
    card.querySelector('.color-val').textContent = formatColor(card.dataset.rgb);
  });
});

/* ========== 操作按钮 ========== */
on($('[data-action="delete-img"]'), 'click', () => {
  currentImage = null; ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  previewSec.hidden = true; colorsSec.hidden = true; dropEl.hidden = false;
  colorListEl.innerHTML = ''; fileEl.value = '';
});

on($('[data-action="clear-colors"]'), 'click', () => { colorListEl.innerHTML = ''; });

on($('[data-action="export-img"]'), 'click', () => {
  const cards = Array.from(colorListEl.children); if (!cards.length) { showToast('暂无颜色'); return; }
  const cw = 100, ch = 100;
  const c = document.createElement('canvas'); c.width = cards.length * cw; c.height = ch;
  const cx = c.getContext('2d');
  cards.forEach((card, i) => {
    const hex = rgbToHex(card.dataset.rgb);
    cx.fillStyle = hex; cx.fillRect(i * cw, 0, cw, ch);
    cx.fillStyle = getContrastColor(hex); cx.font = '12px Arial'; cx.textAlign = 'center';
    cx.fillText(card.querySelector('.color-val').textContent, i * cw + cw / 2, ch / 2 + 4);
  });
  c.toBlob(blob => downloadBlob(blob, 'color-palette.png'));
});

on($('[data-action="export-json"]'), 'click', () => {
  const colors = Array.from(colorListEl.children).map(card => ({
    hex: rgbToHex(card.dataset.rgb), rgb: card.dataset.rgb
  }));
  const blob = new Blob([JSON.stringify(colors, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'color-palette.json');
});
