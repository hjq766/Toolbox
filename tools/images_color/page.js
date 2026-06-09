import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import {
  rgbToHex, rgbToHSLArray, rgbToCss, hslToCss,
  relativeLuminance, contrastRatioRgb, contrastTextColor,
} from '../../public/scripts/utils/color.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|avif)$/i;
const DEFAULT_PREVIEW_HEIGHT = 400;
const MIN_SELECTION_SIZE = 10;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.25;
const ZOOM_WHEEL_STEP = 0.1;
const SOURCE_RANK = {
  auto: 0,
  manual: 1,
  selection: 2,
};

const ROLES = [null, 'primary', 'accent', 'bg', 'text'];
const ROLE_LABELS = { primary: '主色', accent: '辅色', bg: '背景色', text: '文字色' };

const state = {
  image: null,
  imageName: '',
  mode: 'auto',
  format: 'hex',
  count: 5,
  sort: 'default',
  selectionMode: 'append',
  mergeThreshold: 14,
  colors: [],
  nextColorId: 1,
  nextOrder: 1,
  selectedColorId: null,
  selecting: false,
  selection: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  panning: false,
  panLastX: 0,
  panLastY: 0,
};

let fitScale = 0;

const colorThief = window.ColorThief ? new window.ColorThief() : null;
const sourceCanvas = document.createElement('canvas');
const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });

const els = {
  drop: $('[data-drop]'),
  file: $('[data-file]'),
  previewSection: $('[data-preview-section]'),
  colorsSection: $('[data-colors-section]'),
  canvas: $('[data-canvas]'),
  previewStatus: $('[data-preview-status]'),
  loupe: $('[data-loupe]'),
  loupeCanvas: $('[data-loupe-canvas]'),
  loupeColor: $('[data-loupe-color]'),
  loupePoint: $('[data-loupe-point]'),
  selectionBadge: $('[data-selection-badge]'),
  previewWrap: $('[data-preview-wrap]'),
  zoomLabel: $('[data-zoom-label]'),
  colorList: $('[data-color-list]'),
  paletteStrip: $('[data-palette-strip]'),
  countOpts: $('[data-count-opts]'),
  selectionPanel: $('[data-selection-panel]'),
  selectionModeOpts: $('[data-selection-mode-opts]'),
  mergeOpts: $('[data-merge-opts]'),
  sortOpts: $('[data-sort-opts]'),
  formatOpts: $('[data-format-opts]'),
  colorDetail: $('[data-color-detail]'),
  bulkActions: $('[data-bulk-actions]'),
  detailSwatch: $('[data-detail-swatch]'),
  detailHexDisplay: $('[data-detail-hex-display]'),
  detailHex: $('[data-detail-hex]'),
  detailRgb: $('[data-detail-rgb]'),
  detailHsl: $('[data-detail-hsl]'),
  detailHue: $('[data-detail-hue]'),
  detailSaturation: $('[data-detail-saturation]'),
  detailLightness: $('[data-detail-lightness]'),
  detailSource: $('[data-detail-source]'),
  detailText: $('[data-detail-text]'),
  detailWhiteRatio: $('[data-detail-white-ratio]'),
  detailBlackRatio: $('[data-detail-black-ratio]'),
  detailOpenTool: $('[data-detail-open-tool]'),
};
const ctx = els.canvas.getContext('2d', { willReadFrequently: true });
const loupeCtx = els.loupeCanvas.getContext('2d', { willReadFrequently: true });

initUploadZone({
  dropEl: els.drop,
  fileEl: els.file,
  onFiles: files => handleFile(files[0]),
  accept: 'image',
  onDelete: clearImage,
});

on(window, 'resize', () => {
  if (!state.image) return;
  resizeCanvas();
});

async function handleFile(file) {
  if (!isImageFile(file)) return;
  try {
    const image = await loadImage(file);
    state.image = image;
    state.imageName = file.name;
    state.colors = [];
    state.nextColorId = 1;
    state.nextOrder = 1;
    state.selectedColorId = null;
    state.mode = 'auto';
    state.sort = 'default';
    state.zoom = 1;
    state.panX = image.naturalWidth / 2;
    state.panY = image.naturalHeight / 2;
    syncModeButtons();
    syncSortButtons();

    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;
    sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceCtx.drawImage(image, 0, 0);

    els.drop.hidden = true;
    els.previewSection.hidden = false;
    els.colorsSection.hidden = false;
    resizeCanvas();
    extractAuto();
  } catch {
    showToast('图片加载失败，请换一张图片试试', { type: 'error' });
  }
}

function isImageFile(file) {
  return Boolean(file && (file.type.startsWith('image/') || IMAGE_EXT_RE.test(file.name || '')));
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    image.src = url;
  });
}

function resizeCanvas() {
  const containerW = Math.max(els.previewWrap.clientWidth, 1);
  const natW = state.image.naturalWidth;
  const natH = state.image.naturalHeight;
  const imgRatio = natW / natH;

  let fitW, fitH;
  if (imgRatio > containerW / DEFAULT_PREVIEW_HEIGHT) {
    fitW = containerW;
    fitH = fitW / imgRatio;
  } else {
    fitH = DEFAULT_PREVIEW_HEIGHT;
    fitW = fitH * imgRatio;
  }
  fitScale = Math.min(fitW / natW, fitH / natH);

  const displayW = Math.round(clamp(natW * fitScale * state.zoom, 1, containerW));
  const displayH = Math.round(clamp(natH * fitScale * state.zoom, 1, DEFAULT_PREVIEW_HEIGHT));

  const dpr = window.devicePixelRatio || 1;
  const resCap = Math.min(dpr, natW / displayW, natH / displayH);
  els.canvas.width = Math.round(displayW * resCap);
  els.canvas.height = Math.round(displayH * resCap);
  els.canvas.style.width = `${displayW}px`;
  els.canvas.style.height = `${displayH}px`;

  clampPan();
  els.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
  redrawSelection();
}

function getViewport() {
  const natW = state.image.naturalWidth;
  const natH = state.image.naturalHeight;
  if (state.zoom <= 1) return { sx: 0, sy: 0, sw: natW, sh: natH };
  const es = fitScale * state.zoom;
  const cw = parseInt(els.canvas.style.width) || els.canvas.width;
  const ch = parseInt(els.canvas.style.height) || els.canvas.height;
  const vw = Math.min(cw / es, natW);
  const vh = Math.min(ch / es, natH);
  const cx = clamp(state.panX, vw / 2, natW - vw / 2);
  const cy = clamp(state.panY, vh / 2, natH - vh / 2);
  return { sx: cx - vw / 2, sy: cy - vh / 2, sw: vw, sh: vh };
}

function clampPan() {
  if (!state.image || state.zoom <= 1) return;
  const natW = state.image.naturalWidth;
  const natH = state.image.naturalHeight;
  const es = fitScale * state.zoom;
  const cw = parseInt(els.canvas.style.width) || els.canvas.width;
  const ch = parseInt(els.canvas.style.height) || els.canvas.height;
  const vw = Math.min(cw / es, natW);
  const vh = Math.min(ch / es, natH);
  state.panX = clamp(state.panX, vw / 2, natW - vw / 2);
  state.panY = clamp(state.panY, vh / 2, natH - vh / 2);
}

function setZoom(value) {
  state.zoom = clamp(Math.round(value * 100) / 100, ZOOM_MIN, ZOOM_MAX);
  if (state.zoom <= 1 && state.image) {
    state.panX = state.image.naturalWidth / 2;
    state.panY = state.image.naturalHeight / 2;
  }
  if (state.image) resizeCanvas();
  syncCanvasCursor();
  syncPreviewHint();
}

function drawPreviewImage() {
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
  if (!state.image) return;
  const vp = getViewport();
  ctx.drawImage(state.image, vp.sx, vp.sy, vp.sw, vp.sh, 0, 0, els.canvas.width, els.canvas.height);
}

function extractAuto() {
  if (!state.image || !colorThief) return;
  try {
    const palette = colorThief.getPalette(state.image, state.count) || [];
    replaceAutoColors(palette);
  } catch {
    showToast('自动提取失败，请尝试手动取色或选区取色', { type: 'warn' });
  }
}

function replaceAutoColors(colors) {
  const customColors = state.colors.filter(color => color.sourceType !== 'auto');
  const autoColors = colors.map((rgb, index) => createColor(rgb, '自动', 'auto', index + 1));
  state.colors = [...autoColors, ...customColors];
  if (!state.selectedColorId || !state.colors.some(color => color.id === state.selectedColorId)) {
    state.selectedColorId = autoColors[0]?.id || customColors[0]?.id || null;
  }
  autoAssignRoles();
  renderColors();
}

function appendColors(colors, source, sourceType) {
  const nextColors = colors.map(rgb => createColor(rgb, source, sourceType));
  state.colors.push(...nextColors);
  state.selectedColorId = nextColors[0]?.id || state.selectedColorId;
  autoAssignRoles();
  renderColors();
}

function replaceColors(colors, source, sourceType) {
  state.colors = colors.map(rgb => createColor(rgb, source, sourceType));
  state.selectedColorId = state.colors[0]?.id || null;
  autoAssignRoles();
  renderColors();
}

function createColor(rgb, source, sourceType, order) {
  const id = state.nextColorId++;
  if (typeof order === 'number') {
    state.nextOrder = Math.max(state.nextOrder, order + 1);
  }
  return {
    id,
    rgb: normalizeRgb(rgb),
    source,
    sourceType,
    order: typeof order === 'number' ? order : state.nextOrder++,
    role: null,
  };
}

function normalizeRgb(rgb) {
  return rgb.slice(0, 3).map(value => Math.max(0, Math.min(255, Math.round(Number(value) || 0))));
}

function renderColors() {
  const colors = getSortedColors();
  if (!colors.length) {
    els.colorList.innerHTML = '<div class="u-muted u-text-center">暂无颜色，上传图片后会自动生成色板</div>';
    els.paletteStrip.innerHTML = '';
    els.paletteStrip.style.removeProperty('--palette-count');
    state.selectedColorId = null;
    renderColorDetail();
    return;
  }

  if (!state.selectedColorId || !colors.some(color => color.id === state.selectedColorId)) {
    state.selectedColorId = colors[0].id;
  }

  els.paletteStrip.style.setProperty('--palette-count', colors.length);
  els.paletteStrip.innerHTML = colors.map(color => (
    `<button class="palette-chip" type="button" data-color-id="${color.id}" style="--swatch:${rgbToHex(color.rgb)}" aria-label="${rgbToHex(color.rgb)}"></button>`
  )).join('');

  els.colorList.innerHTML = colors.map(color => {
    const active = color.id === state.selectedColorId ? ' active' : '';
    const hex = rgbToHex(color.rgb);
    const textColor = contrastTextColor(color.rgb);
    return `
      <article class="card color-card${active}" data-color-id="${color.id}" style="--swatch:${hex};--swatch-text:${textColor}" title="点击查看 ${hex}">
        <span class="color-swatch"></span>
        <span class="u-col u-gap-1 u-min-0 color-info">
          <strong class="u-mono u-text-xs u-strong u-truncate">${formatColor(color.rgb)}</strong>
          <span class="u-text-xs u-row u-gap-1" style="flex-wrap:wrap">
            <span class="u-muted">${color.source}</span>
            <span class="color-role-tag${color.role ? '' : ' is-unset'}" data-cycle-role="${color.id}">${color.role ? ROLE_LABELS[color.role] : '+ 角色'}</span>
          </span>
        </span>
        <span class="color-actions">
          <button class="btn is-sm is-ghost color-act-btn" type="button" data-copy-card-format="${state.format}" data-color-id="${color.id}" title="复制"><i data-lucide="copy"></i></button>
          <a class="btn is-sm is-ghost color-act-btn" href="${getColorToolUrl(hex)}" target="_blank" data-color-open title="在颜色工具箱中继续调色"><i data-lucide="palette"></i></a>
          <button class="btn is-sm is-ghost color-act-btn is-danger" type="button" data-color-delete="${color.id}" title="删除"><i data-lucide="x"></i></button>
        </span>
      </article>
    `;
  }).join('');
  if (window.refreshIcons) window.refreshIcons(els.colorList);
  renderColorDetail();
}

function getSortedColors() {
  const colors = [...state.colors];
  if (state.sort === 'brightness') {
    colors.sort((a, b) => rgbToHSLArray(b.rgb)[2] - rgbToHSLArray(a.rgb)[2]);
  } else if (state.sort === 'hue') {
    colors.sort((a, b) => rgbToHSLArray(a.rgb)[0] - rgbToHSLArray(b.rgb)[0]);
  } else if (state.sort === 'saturation') {
    colors.sort((a, b) => rgbToHSLArray(b.rgb)[1] - rgbToHSLArray(a.rgb)[1]);
  } else {
    colors.sort((a, b) => {
      const rank = getSourceRank(a) - getSourceRank(b);
      return rank || a.order - b.order;
    });
  }
  return colors;
}

function getSourceRank(color) {
  return SOURCE_RANK[color.sourceType] ?? 9;
}

function renderColorDetail() {
  const color = state.colors.find(item => item.id === state.selectedColorId);
  const hasColor = Boolean(color);
  els.colorDetail.hidden = !hasColor;
  els.bulkActions.hidden = state.colors.length === 0;
  if (!color) return;

  const hsl = rgbToHSLArray(color.rgb);
  const hex = rgbToHex(color.rgb);
  const whiteRatio = contrastRatioRgb(color.rgb, [255, 255, 255]);
  const blackRatio = contrastRatioRgb(color.rgb, [0, 0, 0]);
  const recommendedText = blackRatio >= whiteRatio ? '黑色文字' : '白色文字';
  const textColor = contrastTextColor(color.rgb);
  els.detailSwatch.style.setProperty('--swatch', hex);
  els.detailSwatch.style.setProperty('--swatch-text', textColor);
  els.detailHexDisplay.textContent = hex;
  els.detailHex.value = hex;
  els.detailRgb.value = rgbToCss(color.rgb);
  els.detailHsl.value = hslToCss(hsl);
  els.detailHue.textContent = `${Math.round(hsl[0])}°`;
  els.detailSaturation.textContent = `${Math.round(hsl[1])}%`;
  els.detailLightness.textContent = `${Math.round(hsl[2])}%`;
  els.detailSource.textContent = color.source;
  els.detailText.textContent = recommendedText;
  els.detailWhiteRatio.textContent = `${whiteRatio.toFixed(2)}:1`;
  els.detailBlackRatio.textContent = `${blackRatio.toFixed(2)}:1`;
  els.detailOpenTool.href = getColorToolUrl(hex);
}

on(els.colorList, 'click', e => {
  const openLink = e.target.closest('[data-color-open]');
  if (openLink) {
    e.stopPropagation();
    return;
  }

  const roleBtn = e.target.closest('[data-cycle-role]');
  if (roleBtn) {
    e.stopPropagation();
    const id = Number(roleBtn.dataset.cycleRole);
    const color = state.colors.find(c => c.id === id);
    if (!color) return;
    setColorRole(color, ROLES[(ROLES.indexOf(color.role) + 1) % ROLES.length]);
    renderColors();
    return;
  }
  const del = e.target.closest('[data-color-delete]');
  if (del) {
    const id = Number(del.dataset.colorDelete);
    state.colors = state.colors.filter(color => color.id !== id);
    if (state.selectedColorId === id) {
      state.selectedColorId = getSortedColors()[0]?.id || null;
    }
    renderColors();
    return;
  }

  const copyBtn = e.target.closest('[data-copy-card-format]');
  if (copyBtn) {
    const color = state.colors.find(item => item.id === Number(copyBtn.dataset.colorId));
    if (!color) return;
    copyText(getColorFormatValue(color.rgb, copyBtn.dataset.copyCardFormat), '已复制颜色');
    return;
  }

  const card = e.target.closest('[data-color-id]');
  if (!card) return;
  const color = state.colors.find(item => item.id === Number(card.dataset.colorId));
  if (!color) return;
  state.selectedColorId = color.id;
  renderColors();
});

on(els.paletteStrip, 'click', e => {
  const chip = e.target.closest('[data-color-id]');
  if (!chip) return;
  state.selectedColorId = Number(chip.dataset.colorId);
  renderColors();
});

document.querySelectorAll('[data-mode]').forEach(btn => {
  on(btn, 'click', () => {
    const mode = btn.dataset.mode;
    state.mode = state.mode === mode ? 'auto' : mode;
    syncModeButtons();
  });
});

function syncModeButtons() {
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === state.mode && state.mode !== 'auto');
  });
  els.selectionPanel.hidden = state.mode !== 'selection';
  syncCanvasCursor();
  if (state.mode !== 'manual') hideLoupe();
  if (state.mode !== 'selection') hideSelectionBadge();
  syncPreviewHint();
}

function syncPreviewHint() {
  if (state.mode === 'manual') {
    els.previewStatus.textContent = '点击图片取色';
    els.previewStatus.className = 'preview-hint is-active';
  } else if (state.mode === 'selection') {
    els.previewStatus.textContent = '拖拽选区提取';
    els.previewStatus.className = 'preview-hint is-active';
  } else if (state.zoom > 1) {
    els.previewStatus.textContent = '拖动画布平移';
    els.previewStatus.className = 'preview-hint is-active';
  } else {
    els.previewStatus.textContent = '自动提取';
    els.previewStatus.className = 'preview-hint';
  }
}

function syncCanvasCursor() {
  if (state.mode === 'manual' || state.mode === 'selection') {
    els.canvas.style.cursor = 'crosshair';
  } else if (state.panning) {
    els.canvas.style.cursor = 'grabbing';
  } else if (state.zoom > 1) {
    els.canvas.style.cursor = 'grab';
  } else {
    els.canvas.style.cursor = 'default';
  }
}

document.querySelectorAll('[data-zoom]').forEach(btn => {
  on(btn, 'click', () => {
    if (!state.image) return;
    const action = btn.dataset.zoom;
    if (action === 'in') setZoom(state.zoom + ZOOM_STEP);
    else if (action === 'out') setZoom(state.zoom - ZOOM_STEP);
    else if (action === 'fit') {
      state.panX = state.image.naturalWidth / 2;
      state.panY = state.image.naturalHeight / 2;
      setZoom(1);
    }
  });
});

on(els.previewWrap, 'wheel', e => {
  if (!state.image) return;
  if (e.ctrlKey) {
    e.preventDefault();
    setZoom(state.zoom - Math.sign(e.deltaY) * ZOOM_WHEEL_STEP);
    return;
  }
  if (state.zoom > 1) {
    e.preventDefault();
    const es = fitScale * state.zoom;
    state.panX += e.deltaX / es;
    state.panY += e.deltaY / es;
    clampPan();
    redrawSelection();
  }
}, { passive: false });

on(els.canvas, 'click', e => {
  if (state.mode !== 'manual' || !state.image || state.selecting) return;
  const point = getImagePoint(e);
  const pixel = sourceCtx.getImageData(point.x, point.y, 1, 1).data;
  appendColors([[pixel[0], pixel[1], pixel[2]]], '手动', 'manual');
});

on(els.canvas, 'mousemove', e => {
  if (state.panning) {
    panPreview(e);
    return;
  }
  if (state.selecting && state.selection) {
    state.selection.endCanvas = getCanvasPoint(e);
    state.selection.endImage = getImagePoint(e);
    redrawSelection();
    return;
  }
  if (state.mode === 'manual' && state.image) updateLoupe(e);
});

on(els.canvas, 'mousedown', e => {
  if (canPanPreview(e)) {
    startPanPreview(e);
    return;
  }
  if (state.mode !== 'selection' || !state.image) return;
  hideLoupe();
  const canvasPoint = getCanvasPoint(e);
  const imagePoint = getImagePoint(e);
  state.selecting = true;
  state.selection = { startCanvas: canvasPoint, endCanvas: canvasPoint, startImage: imagePoint, endImage: imagePoint };
});

on(els.canvas, 'mouseup', () => finishSelection());
on(document, 'mouseup', () => {
  if (state.panning) stopPanPreview();
  if (state.selecting) finishSelection();
});
on(els.canvas, 'mouseleave', () => {
  hideLoupe();
});

function canPanPreview(e) {
  return e.button === 0 && state.image && state.mode === 'auto' && state.zoom > 1;
}

function startPanPreview(e) {
  e.preventDefault();
  state.panning = true;
  state.panLastX = e.clientX;
  state.panLastY = e.clientY;
  syncCanvasCursor();
}

function panPreview(e) {
  e.preventDefault();
  const es = fitScale * state.zoom;
  state.panX -= (e.clientX - state.panLastX) / es;
  state.panY -= (e.clientY - state.panLastY) / es;
  state.panLastX = e.clientX;
  state.panLastY = e.clientY;
  clampPan();
  drawPreviewImage();
}

function stopPanPreview() {
  state.panning = false;
  syncCanvasCursor();
}

function finishSelection() {
  if (!state.selecting || !state.selection) return;
  state.selecting = false;
  const rect = getSelectionRect(state.selection.startImage, state.selection.endImage);
  state.selection = null;
  hideSelectionBadge();
  drawPreviewImage();
  if (rect.w < MIN_SELECTION_SIZE || rect.h < MIN_SELECTION_SIZE) return;
  try {
    const palette = extractSelectionPalette(rect, state.count);
    if (!palette.length) throw new Error('empty palette');
    if (state.selectionMode === 'replace') replaceColors(palette, '选区', 'selection');
    else appendColors(palette, '选区', 'selection');
  } catch {
    showToast('选区取色失败，请换一个区域试试', { type: 'warn' });
  }
}

function extractSelectionPalette(rect, count) {
  const imageData = sourceCtx.getImageData(rect.x, rect.y, rect.w, rect.h).data;
  const bucketSize = 24;
  const maxSamples = 12000;
  const step = Math.max(1, Math.floor(Math.sqrt((rect.w * rect.h) / maxSamples)));
  const buckets = new Map();

  for (let y = 0; y < rect.h; y += step) {
    for (let x = 0; x < rect.w; x += step) {
      const offset = (y * rect.w + x) * 4;
      const alpha = imageData[offset + 3];
      if (alpha < 125) continue;
      const rgb = [imageData[offset], imageData[offset + 1], imageData[offset + 2]];
      const key = rgb.map(value => Math.floor(value / bucketSize)).join('-');
      const bucket = buckets.get(key) || { count: 0, sum: [0, 0, 0] };
      bucket.count += 1;
      bucket.sum = bucket.sum.map((value, index) => value + rgb[index]);
      buckets.set(key, bucket);
    }
  }

  const ranked = [...buckets.values()]
    .map(bucket => bucket.sum.map(value => Math.round(value / bucket.count)).concat(bucket.count))
    .sort((a, b) => b[3] - a[3]);
  const palette = [];

  ranked.forEach(item => {
    if (palette.length >= count) return;
    const rgb = item.slice(0, 3);
    if (palette.every(color => colorDistance(color, rgb) >= 28)) palette.push(rgb);
  });

  ranked.forEach(item => {
    if (palette.length >= count) return;
    const rgb = item.slice(0, 3);
    if (palette.every(color => colorDistance(color, rgb) >= 8)) palette.push(rgb);
  });

  return palette;
}

function redrawSelection() {
  drawPreviewImage();
  if (!state.selecting || !state.selection) return;
  const rect = getSelectionRect(state.selection.startCanvas, state.selection.endCanvas);
  const imageRect = getSelectionRect(state.selection.startImage, state.selection.endImage);
  const brand = getCssColor('--color-brand', 'royalblue');
  ctx.save();
  ctx.strokeStyle = brand;
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = brand;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  updateSelectionBadge(rect, imageRect);
}

function updateLoupe(e) {
  const point = getImagePoint(e);
  const pixel = sourceCtx.getImageData(point.x, point.y, 1, 1).data;
  const color = [pixel[0], pixel[1], pixel[2]];
  const size = 9;
  const half = Math.floor(size / 2);
  const sx = clamp(point.x - half, 0, Math.max(sourceCanvas.width - size, 0));
  const sy = clamp(point.y - half, 0, Math.max(sourceCanvas.height - size, 0));
  loupeCtx.clearRect(0, 0, els.loupeCanvas.width, els.loupeCanvas.height);
  loupeCtx.imageSmoothingEnabled = false;
  loupeCtx.drawImage(sourceCanvas, sx, sy, size, size, 0, 0, els.loupeCanvas.width, els.loupeCanvas.height);
  loupeCtx.strokeStyle = contrastTextColor(color);
  loupeCtx.lineWidth = 2;
  const cell = els.loupeCanvas.width / size;
  loupeCtx.strokeRect(half * cell, half * cell, cell, cell);
  els.loupeColor.textContent = rgbToHex(color);
  els.loupePoint.textContent = `${point.x}, ${point.y}`;
  const dp = getDisplayPoint(e);
  const displayW = els.canvas.clientWidth;
  const displayH = els.canvas.clientHeight;
  const left = clamp(dp.x + 16, 8, Math.max(displayW - 126, 8));
  const top = clamp(dp.y + 16, 8, Math.max(displayH - 142, 8));
  els.loupe.style.left = `${left}px`;
  els.loupe.style.top = `${top}px`;
  els.loupe.hidden = false;
}

function hideLoupe() {
  els.loupe.hidden = true;
}

function updateSelectionBadge(canvasRect, imageRect) {
  const sx = els.canvas.clientWidth / els.canvas.width;
  const sy = els.canvas.clientHeight / els.canvas.height;
  const displayW = els.canvas.clientWidth;
  const displayH = els.canvas.clientHeight;
  els.selectionBadge.textContent = `${imageRect.w} × ${imageRect.h}`;
  els.selectionBadge.style.left = `${clamp((canvasRect.x + canvasRect.w) * sx + 8, 8, Math.max(displayW - 92, 8))}px`;
  els.selectionBadge.style.top = `${clamp(canvasRect.y * sy, 8, Math.max(displayH - 26, 8))}px`;
  els.selectionBadge.hidden = false;
  els.previewStatus.textContent = `选区 ${imageRect.w} × ${imageRect.h}`;
}

function hideSelectionBadge() {
  els.selectionBadge.hidden = true;
}

function getDisplayPoint(e) {
  const rect = els.canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function getCanvasPoint(e) {
  const rect = els.canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (els.canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (els.canvas.height / rect.height);
  return {
    x: clamp(Math.round(x), 0, els.canvas.width - 1),
    y: clamp(Math.round(y), 0, els.canvas.height - 1),
  };
}

function getImagePoint(e) {
  const cp = getCanvasPoint(e);
  const vp = getViewport();
  return {
    x: clamp(Math.round(vp.sx + cp.x * (vp.sw / els.canvas.width)), 0, sourceCanvas.width - 1),
    y: clamp(Math.round(vp.sy + cp.y * (vp.sh / els.canvas.height)), 0, sourceCanvas.height - 1),
  };
}

function getSelectionRect(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

on(els.countOpts, 'click', e => {
  const btn = e.target.closest('[data-count]');
  if (!btn) return;
  state.count = Number(btn.dataset.count);
  els.countOpts.querySelectorAll('.btn').forEach(item => item.classList.toggle('active', item === btn));
  if (state.image) extractAuto();
});

on(els.selectionModeOpts, 'click', e => {
  const btn = e.target.closest('[data-selection-mode]');
  if (!btn) return;
  state.selectionMode = btn.dataset.selectionMode;
  els.selectionModeOpts.querySelectorAll('.btn').forEach(item => item.classList.toggle('active', item === btn));
});

on(els.mergeOpts, 'click', e => {
  const btn = e.target.closest('[data-merge-threshold]');
  if (!btn) return;
  state.mergeThreshold = Number(btn.dataset.mergeThreshold);
  els.mergeOpts.querySelectorAll('.btn').forEach(item => item.classList.toggle('active', item === btn));
});

on(els.sortOpts, 'click', e => {
  const btn = e.target.closest('[data-sort]');
  if (!btn) return;
  state.sort = btn.dataset.sort;
  syncSortButtons();
  renderColors();
});

function syncSortButtons() {
  els.sortOpts.querySelectorAll('[data-sort]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === state.sort);
  });
}

on(els.formatOpts, 'click', e => {
  const btn = e.target.closest('[data-format]');
  if (!btn) return;
  state.format = btn.dataset.format;
  els.formatOpts.querySelectorAll('.btn').forEach(item => item.classList.toggle('active', item === btn));
  renderColors();
});

function clearImage() {
  state.image = null;
  state.imageName = '';
  state.colors = [];
  state.nextColorId = 1;
  state.nextOrder = 1;
  state.selectedColorId = null;
  state.mode = 'auto';
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  state.panning = false;
  state.panLastX = 0;
  state.panLastY = 0;
  state.selecting = false;
  state.selection = null;
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
  els.previewSection.hidden = true;
  els.colorsSection.hidden = true;
  els.drop.hidden = false;
  els.colorList.innerHTML = '';
  els.paletteStrip.innerHTML = '';
  els.paletteStrip.style.removeProperty('--palette-count');
  els.file.value = '';
  syncModeButtons();
  renderColorDetail();
}

on($('[data-action="clear-colors"]'), 'click', () => {
  state.colors = [];
  state.selectedColorId = null;
  renderColors();
});

on($('[data-action="merge-similar"]'), 'click', () => {
  if (state.colors.length < 2) {
    showToast('颜色数量不足');
    return;
  }
  const before = state.colors.length;
  mergeSimilarColors();
  const merged = before - state.colors.length;
  showToast(merged > 0 ? `已合并 ${merged} 个近似颜色` : '没有发现需要合并的近似颜色');
});

on($('[data-action="export-img"]'), 'click', () => {
  const colors = getSortedColors();
  if (!colors.length) {
    showToast('暂无颜色');
    return;
  }
  const cellW = 140;
  const cellH = 100;
  const canvas = document.createElement('canvas');
  canvas.width = colors.length * cellW;
  canvas.height = cellH;
  const exportCtx = canvas.getContext('2d');
  colors.forEach((color, index) => {
    const x = index * cellW;
    exportCtx.fillStyle = rgbToHex(color.rgb);
    exportCtx.fillRect(x, 0, cellW, cellH);
    exportCtx.fillStyle = contrastTextColor(color.rgb);
    exportCtx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    exportCtx.textAlign = 'center';
    exportCtx.textBaseline = 'middle';
    exportCtx.fillText(formatColor(color.rgb), x + cellW / 2, cellH / 2);
  });
  canvas.toBlob(blob => {
    if (blob) downloadBlob(blob, 'color-palette.png');
  });
});

on($('[data-action="export-json"]'), 'click', () => {
  if (!state.colors.length) {
    showToast('暂无颜色');
    return;
  }
  const colors = getColorPayload();
  const blob = new Blob([JSON.stringify(colors, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'color-palette.json');
});

on($('[data-action="export-css"]'), 'click', () => {
  if (!state.colors.length) {
    showToast('暂无颜色');
    return;
  }
  const blob = new Blob([getCssVariableBlock()], { type: 'text/css' });
  downloadBlob(blob, 'color-palette.css');
});

on($('[data-action="copy-values"]'), 'click', () => {
  const colors = getSortedColors();
  if (!colors.length) {
    showToast('暂无颜色');
    return;
  }
  copyText(colors.map(color => formatColor(color.rgb)).join('\n'), '已复制当前格式色板');
});

on($('[data-action="copy-css"]'), 'click', () => {
  if (!state.colors.length) {
    showToast('暂无颜色');
    return;
  }
  copyText(getCssVariableBlock(), '已复制 CSS 变量');
});

on($('[data-action="copy-tailwind"]'), 'click', () => {
  if (!state.colors.length) { showToast('暂无颜色'); return; }
  copyText(getTailwindBlock(), '已复制 Tailwind 配置');
});

on($('[data-action="export-tailwind"]'), 'click', () => {
  if (!state.colors.length) { showToast('暂无颜色'); return; }
  const blob = new Blob([getTailwindBlock()], { type: 'text/plain' });
  downloadBlob(blob, 'tailwind-colors.js');
});

on($('[data-action="auto-roles"]'), 'click', () => {
  if (!state.colors.length) { showToast('暂无颜色'); return; }
  state.colors.forEach(c => { c.role = null; });
  autoAssignRoles();
  renderColors();
  showToast('已自动分配语义角色');
});

document.querySelectorAll('[data-copy-format]').forEach(btn => {
  on(btn, 'click', () => {
    const color = state.colors.find(item => item.id === state.selectedColorId);
    if (!color) return;
    copyText(getColorFormatValue(color.rgb, btn.dataset.copyFormat), '已复制颜色');
  });
});

function mergeSimilarColors() {
  const groups = [];
  getSortedColors().forEach(color => {
    const group = groups.find(item => colorDistance(item.rgb, color.rgb) <= state.mergeThreshold);
    if (!group) {
      groups.push({ base: color, rgb: [...color.rgb], count: 1, items: [color] });
      return;
    }
    group.items.push(color);
    group.count += 1;
    group.rgb = group.rgb.map((value, index) => (
      Math.round((value * (group.count - 1) + color.rgb[index]) / group.count)
    ));
  });

  state.colors = groups.map(group => {
    const source = group.items.length > 1 ? `${group.base.source} · 合并${group.items.length}` : group.base.source;
    return {
      ...group.base,
      rgb: normalizeRgb(group.rgb),
      source,
    };
  });
  state.selectedColorId = state.colors[0]?.id || null;
  renderColors();
}

function colorDistance(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function getColorPayload() {
  let idx = 1;
  return getSortedColors().map(color => {
    const name = getColorExportName(color, idx);
    if (!color.role) idx += 1;
    return {
      name,
      role: color.role,
      hex: rgbToHex(color.rgb),
      rgb: rgbToCss(color.rgb),
      hsl: hslToCss(rgbToHSLArray(color.rgb)),
      source: color.source,
    };
  });
}

function getCssVariableBlock() {
  let idx = 1;
  const lines = getSortedColors().map(color => {
    const name = `--${getColorExportName(color, idx)}`;
    if (!color.role) idx += 1;
    return `  ${name}: ${rgbToHex(color.rgb)};`;
  });
  return `:root {\n${lines.join('\n')}\n}\n`;
}

function getTailwindBlock() {
  let idx = 1;
  const entries = getSortedColors().map(color => {
    const key = color.role ? color.role : `palette-${String(idx).padStart(2, '0')}`;
    if (!color.role) idx += 1;
    return `        '${key}': '${rgbToHex(color.rgb)}',`;
  });
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries.join('\n')}\n      },\n    },\n  },\n};\n`;
}

function getColorExportName(color, index) {
  return color.role ? `color-${color.role}` : `palette-${String(index).padStart(2, '0')}`;
}

function getColorToolUrl(hex) {
  return `../color_tool/#${hex.replace('#', '').toLowerCase()}`;
}

function setColorRole(color, role) {
  if (role) {
    state.colors.forEach(item => {
      if (item.id !== color.id && item.role === role) item.role = null;
    });
  }
  color.role = role;
}

function autoAssignRoles() {
  const unassigned = state.colors.filter(c => c.role === null);
  if (!unassigned.length) return;
  const usedRoles = new Set(state.colors.map(c => c.role).filter(Boolean));
  if (unassigned.length === 1 && !usedRoles.size) {
    setColorRole(unassigned[0], 'primary');
    return;
  }
  const byLum = [...unassigned].sort((a, b) => relativeLuminance(b.rgb) - relativeLuminance(a.rgb));
  const bySat = [...unassigned].sort((a, b) => rgbToHSLArray(b.rgb)[1] - rgbToHSLArray(a.rgb)[1]);
  const assignedIds = new Set();

  if (!usedRoles.has('bg')) {
    const bgColor = byLum.find(c => !assignedIds.has(c.id));
    if (bgColor) {
      setColorRole(bgColor, 'bg');
      usedRoles.add('bg');
      assignedIds.add(bgColor.id);
    }
  }

  const bgColor = state.colors.find(c => c.role === 'bg') || byLum[0];
  if (!usedRoles.has('text')) {
    const darkest = [...byLum].reverse().find(c => !assignedIds.has(c.id));
    if (darkest && bgColor && contrastRatioRgb(darkest.rgb, bgColor.rgb) >= 3) {
      setColorRole(darkest, 'text');
      usedRoles.add('text');
      assignedIds.add(darkest.id);
    }
  }

  const primary = !usedRoles.has('primary')
    ? bySat.find(c => !assignedIds.has(c.id) && rgbToHSLArray(c.rgb)[1] >= 15)
    : state.colors.find(c => c.role === 'primary');
  if (primary && !usedRoles.has('primary')) {
    setColorRole(primary, 'primary');
    usedRoles.add('primary');
    assignedIds.add(primary.id);
  }

  if (primary && !usedRoles.has('accent')) {
    const primaryHue = rgbToHSLArray(primary.rgb)[0];
    const accent = bySat.find(c => {
      if (assignedIds.has(c.id)) return false;
      const diff = Math.abs(rgbToHSLArray(c.rgb)[0] - primaryHue);
      return Math.min(diff, 360 - diff) > 25;
    });
    if (accent) setColorRole(accent, 'accent');
  }
}

async function copyText(text, successText) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successText);
  } catch {
    showToast('复制失败，请手动复制', { type: 'error' });
  }
}

function formatColor(rgb) {
  return getColorFormatValue(rgb, state.format);
}

function getColorFormatValue(rgb, format) {
  if (format === 'rgb') return rgbToCss(rgb);
  if (format === 'hsl') return hslToCss(rgbToHSLArray(rgb));
  return rgbToHex(rgb);
}


function getCssColor(token, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || fallback;
}
