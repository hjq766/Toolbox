import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$ } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

const MIME_MAP = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const FORMAT_LABEL = { png: 'PNG', jpg: 'JPG', webp: 'WebP' };
const MAX_HISTORY = 20;

const els = {
  drop: $('[data-drop]'),
  file: $('[data-file]'),
  preview: $('[data-preview]'),
  fileName: $('[data-file-name]'),
  imgInfo: $('[data-img-info]'),
  stage: $('[data-stage]'),
  canvas: $('[data-canvas]'),
  sel: $('[data-sel]'),
  cursor: $('[data-cursor]'),
  strength: $('[data-strength]'),
  strengthVal: $('[data-strength-val]'),
  brushSize: $('[data-brush-size]'),
  brushSizeVal: $('[data-brush-size-val]'),
  maskColor: $('[data-mask-color]'),
  qualityRow: $('[data-quality-row]'),
  quality: $('[data-quality]'),
  qualityVal: $('[data-quality-val]'),
  output: $('[data-output]'),
};

const actions = {
  applyFull: $('[data-action="apply-full"]'),
  undo: $('[data-action="undo"]'),
  redo: $('[data-action="redo"]'),
  reset: $('[data-action="reset"]'),
  download: $('[data-action="download"]'),
  copy: $('[data-action="copy"]'),
};

const ctx = els.canvas.getContext('2d');
const state = {
  source: null,
  objectUrl: '',
  tool: 'brush',
  effect: 'mosaic',
  format: 'png',
  drawing: false,
  start: null,
  last: null,
  selection: null,
  history: [],
  redo: [],
  edits: 0,
};

initUploadZone({ dropEl: els.drop, fileEl: els.file, onFiles: files => handleFile(files[0]), accept: 'image', onDelete: clearImage });
bindControls();
syncUI();

function bindControls() {
  $('[data-tool-opts]').addEventListener('click', e => {
    const btn = e.target.closest('[data-tool]');
    if (!btn) return;
    state.tool = btn.dataset.tool;
    syncUI();
  });

  $('[data-effect-opts]').addEventListener('click', e => {
    const btn = e.target.closest('[data-effect]');
    if (!btn) return;
    state.effect = btn.dataset.effect;
    syncUI();
  });

  $('[data-format-opts]').addEventListener('click', e => {
    const btn = e.target.closest('[data-fmt]');
    if (!btn) return;
    state.format = btn.dataset.fmt;
    syncUI();
  });

  for (const input of [els.strength, els.brushSize, els.quality]) {
    input.addEventListener('input', syncUI);
  }

  actions.applyFull.addEventListener('click', applyFull);
  actions.undo.addEventListener('click', undo);
  actions.redo.addEventListener('click', redo);
  actions.reset.addEventListener('click', resetImage);
  actions.download.addEventListener('click', downloadImage);
  actions.copy.addEventListener('click', copyImage);

  els.stage.addEventListener('pointerdown', onPointerDown);
  els.stage.addEventListener('pointermove', onPointerMove);
  els.stage.addEventListener('pointerup', onPointerUp);
  els.stage.addEventListener('pointercancel', cancelPointer);
  els.stage.addEventListener('pointerleave', () => {
    if (!state.drawing) els.cursor.style.display = 'none';
  });
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('请选择有效的图片文件', { type: 'warn' });
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    revokeSource();
    state.source = {
      file,
      img,
      name: file.name,
      size: file.size,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    state.objectUrl = url;
    els.canvas.width = img.naturalWidth;
    els.canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
    ctx.drawImage(img, 0, 0);
    state.history = [snapshot()];
    state.redo = [];
    state.edits = 0;
    els.drop.hidden = true;
    els.preview.hidden = false;
    renderMeta();
    syncUI();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast(`${file.name} 加载失败`, { type: 'error' });
  };
  img.src = url;
}

function revokeSource() {
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = '';
}

function clearImage() {
  revokeSource();
  state.source = null;
  state.history = [];
  state.redo = [];
  state.edits = 0;
  els.file.value = '';
  els.canvas.width = 0;
  els.canvas.height = 0;
  els.drop.hidden = false;
  els.preview.hidden = true;
  els.output.hidden = true;
  hideSelection();
  syncUI();
}

function renderMeta() {
  if (!state.source) return;
  els.fileName.textContent = state.source.name;
  els.imgInfo.textContent = `${state.source.width} × ${state.source.height} px · ${formatSize(state.source.size)}`;
  renderOutput();
}

function syncUI() {
  $$('[data-tool]').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === state.tool));
  $$('[data-effect]').forEach(btn => btn.classList.toggle('active', btn.dataset.effect === state.effect));
  $$('[data-fmt]').forEach(btn => btn.classList.toggle('active', btn.dataset.fmt === state.format));

  els.strengthVal.textContent = els.strength.value;
  els.brushSizeVal.textContent = `${els.brushSize.value} px`;
  els.qualityVal.textContent = `${els.quality.value}%`;
  els.qualityRow.hidden = state.format === 'png';
  els.cursor.style.width = `${els.brushSize.value}px`;
  els.cursor.style.height = `${els.brushSize.value}px`;

  for (const input of $$('input[type="range"]')) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value || 0);
    input.style.setProperty('--range-pct', `${((val - min) / (max - min)) * 100}%`);
  }

  const hasImage = Boolean(state.source);
  actions.applyFull.disabled = !hasImage;
  actions.reset.disabled = !hasImage || state.history.length <= 1;
  actions.download.disabled = !hasImage;
  actions.copy.disabled = !hasImage;
  actions.undo.disabled = state.history.length <= 1;
  actions.redo.disabled = state.redo.length === 0;
  renderOutput();
}

function onPointerDown(e) {
  if (!state.source || e.button > 0) return;
  e.preventDefault();
  els.stage.setPointerCapture?.(e.pointerId);
  const point = canvasCoords(e);
  state.drawing = true;
  state.start = point;
  state.last = point;

  if (state.tool === 'brush') {
    els.cursor.style.display = 'block';
    moveCursor(e);
    applyBrushPoint(point);
  } else {
    els.sel.style.borderRadius = state.tool === 'ellipse' ? '999px' : '';
    els.sel.style.display = 'block';
    updateSelection(e);
  }
}

function onPointerMove(e) {
  if (!state.source) return;
  moveCursor(e);
  if (!state.drawing) return;
  e.preventDefault();
  const point = canvasCoords(e);
  if (state.tool === 'brush') {
    applyBrushLine(state.last, point);
    state.last = point;
  } else {
    updateSelection(e);
  }
}

function onPointerUp(e) {
  if (!state.drawing) return;
  e.preventDefault();
  if (state.tool === 'brush') {
    commitEdit();
  } else if (state.selection && state.selection.w >= 4 && state.selection.h >= 4) {
    applyEffect(state.selection, state.tool);
    commitEdit();
  }
  cancelPointer();
}

function cancelPointer() {
  state.drawing = false;
  state.start = null;
  state.last = null;
  hideSelection();
}

function canvasCoords(e) {
  const rect = els.canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (els.canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (els.canvas.height / rect.height);
  return {
    x: clamp(Math.round(x), 0, els.canvas.width),
    y: clamp(Math.round(y), 0, els.canvas.height),
  };
}

function moveCursor(e) {
  if (state.tool !== 'brush' || !state.source) {
    els.cursor.style.display = 'none';
    return;
  }
  const stageRect = els.stage.getBoundingClientRect();
  els.cursor.style.display = 'block';
  els.cursor.style.left = `${e.clientX - stageRect.left}px`;
  els.cursor.style.top = `${e.clientY - stageRect.top}px`;
}

function updateSelection(e) {
  const cur = canvasCoords(e);
  const rect = makeRect(state.start, cur);
  state.selection = rect;
  const canvasRect = els.canvas.getBoundingClientRect();
  const stageRect = els.stage.getBoundingClientRect();
  const scaleX = canvasRect.width / els.canvas.width;
  const scaleY = canvasRect.height / els.canvas.height;
  els.sel.style.left = `${canvasRect.left - stageRect.left + rect.x * scaleX}px`;
  els.sel.style.top = `${canvasRect.top - stageRect.top + rect.y * scaleY}px`;
  els.sel.style.width = `${rect.w * scaleX}px`;
  els.sel.style.height = `${rect.h * scaleY}px`;
}

function hideSelection() {
  els.sel.style.display = 'none';
  els.sel.style.borderRadius = '';
  state.selection = null;
}

function applyBrushPoint(point) {
  const size = Number(els.brushSize.value);
  const rect = {
    x: clamp(Math.round(point.x - size / 2), 0, els.canvas.width),
    y: clamp(Math.round(point.y - size / 2), 0, els.canvas.height),
    w: size,
    h: size,
  };
  rect.w = Math.min(rect.w, els.canvas.width - rect.x);
  rect.h = Math.min(rect.h, els.canvas.height - rect.y);
  applyEffect(rect, 'ellipse');
}

function applyBrushLine(from, to) {
  const size = Number(els.brushSize.value);
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(dist / Math.max(size * .35, 4)));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    applyBrushPoint({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    });
  }
}

function applyEffect(rect, shape = 'rect') {
  const clean = normalizeRect(rect);
  if (clean.w <= 0 || clean.h <= 0) return;
  if (state.effect === 'mask') {
    fillMask(clean, shape);
    return;
  }

  const processed = document.createElement('canvas');
  processed.width = clean.w;
  processed.height = clean.h;
  const pctx = processed.getContext('2d');
  pctx.drawImage(els.canvas, clean.x, clean.y, clean.w, clean.h, 0, 0, clean.w, clean.h);

  if (state.effect === 'mosaic') applyMosaicToCanvas(processed, Number(els.strength.value));
  else applyBlurToCanvas(processed, Number(els.strength.value));

  ctx.save();
  clipShape(ctx, clean, shape);
  ctx.drawImage(processed, clean.x, clean.y);
  ctx.restore();
}

function fillMask(rect, shape) {
  ctx.save();
  clipShape(ctx, rect, shape);
  ctx.fillStyle = els.maskColor.value;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function clipShape(targetCtx, rect, shape) {
  targetCtx.beginPath();
  if (shape === 'ellipse') {
    targetCtx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2);
  } else {
    targetCtx.rect(rect.x, rect.y, rect.w, rect.h);
  }
  targetCtx.closePath();
  targetCtx.clip();
}

function applyMosaicToCanvas(canvas, blockSize) {
  const localCtx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const imgData = localCtx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const size = Math.max(2, blockSize);

  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let yy = y; yy < Math.min(y + size, h); yy++) {
        for (let xx = x; xx < Math.min(x + size, w); xx++) {
          const i = (yy * w + xx) * 4;
          r += d[i]; g += d[i + 1]; b += d[i + 2]; a += d[i + 3]; count++;
        }
      }
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count); a = Math.round(a / count);
      for (let yy = y; yy < Math.min(y + size, h); yy++) {
        for (let xx = x; xx < Math.min(x + size, w); xx++) {
          const i = (yy * w + xx) * 4;
          d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
        }
      }
    }
  }
  localCtx.putImageData(imgData, 0, 0);
}

function applyBlurToCanvas(canvas, strength) {
  const localCtx = canvas.getContext('2d');
  const scale = Math.max(4, strength);
  const smallW = Math.max(1, Math.round(canvas.width / scale));
  const smallH = Math.max(1, Math.round(canvas.height / scale));
  const tmp = document.createElement('canvas');
  tmp.width = smallW;
  tmp.height = smallH;
  const tctx = tmp.getContext('2d');
  tctx.imageSmoothingEnabled = true;
  tctx.drawImage(canvas, 0, 0, smallW, smallH);
  localCtx.imageSmoothingEnabled = true;
  localCtx.clearRect(0, 0, canvas.width, canvas.height);
  localCtx.drawImage(tmp, 0, 0, smallW, smallH, 0, 0, canvas.width, canvas.height);
}

function applyFull() {
  if (!state.source) {
    showToast('请先上传图片', { type: 'warn' });
    return;
  }
  applyEffect({ x: 0, y: 0, w: els.canvas.width, h: els.canvas.height }, 'rect');
  commitEdit();
  showToast('已应用全图效果', { type: 'success' });
}

function resetImage() {
  if (!state.source) return;
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
  ctx.drawImage(state.source.img, 0, 0);
  state.history = [snapshot()];
  state.redo = [];
  state.edits = 0;
  syncUI();
}

function snapshot() {
  return ctx.getImageData(0, 0, els.canvas.width, els.canvas.height);
}

function commitEdit() {
  state.history.push(snapshot());
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.redo = [];
  state.edits += 1;
  syncUI();
}

function undo() {
  if (state.history.length <= 1) {
    showToast('无法继续撤销', { type: 'warn' });
    return;
  }
  state.redo.push(state.history.pop());
  ctx.putImageData(state.history[state.history.length - 1], 0, 0);
  state.edits = Math.max(0, state.edits - 1);
  syncUI();
}

function redo() {
  if (!state.redo.length) return;
  const next = state.redo.pop();
  state.history.push(next);
  ctx.putImageData(next, 0, 0);
  state.edits += 1;
  syncUI();
}

async function downloadImage() {
  if (!state.source) {
    showToast('请先上传图片', { type: 'warn' });
    return;
  }
  try {
    const blob = await canvasToBlob(getExportCanvas(), getMime(), getQuality());
    downloadBlob(blob, `mosaic.${state.format}`);
    showToast('下载已开始', { type: 'success' });
  } catch (err) {
    showToast(err.message || '导出失败', { type: 'error' });
  }
}

async function copyImage() {
  if (!state.source) {
    showToast('请先上传图片', { type: 'warn' });
    return;
  }
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('当前浏览器不支持复制图片');
    const blob = await canvasToBlob(els.canvas, 'image/png', 1);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('已复制到剪贴板', { type: 'success' });
  } catch (err) {
    showToast(err.message || '复制失败', { type: 'error' });
  }
}

function getExportCanvas() {
  if (state.format !== 'jpg') return els.canvas;
  const out = document.createElement('canvas');
  out.width = els.canvas.width;
  out.height = els.canvas.height;
  const outCtx = out.getContext('2d');
  outCtx.fillStyle = '#ffffff';
  outCtx.fillRect(0, 0, out.width, out.height);
  outCtx.drawImage(els.canvas, 0, 0);
  return out;
}

function renderOutput() {
  if (!state.source) {
    els.output.hidden = true;
    return;
  }
  els.output.hidden = false;
  els.output.innerHTML = `
    <div><span>输出尺寸</span><strong>${els.canvas.width} × ${els.canvas.height}</strong></div>
    <div><span>格式</span><strong>${FORMAT_LABEL[state.format]}</strong></div>
    <div><span>操作次数</span><strong>${state.edits}</strong></div>
    <div><span>当前效果</span><strong>${getEffectLabel()}</strong></div>
  `;
}

function getEffectLabel() {
  return ({ mosaic: '马赛克', blur: '模糊', mask: '遮挡' })[state.effect] || '马赛克';
}

function getMime() {
  return MIME_MAP[state.format] || 'image/png';
}

function getQuality() {
  return state.format === 'png' ? 1 : Number(els.quality.value) / 100;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('浏览器无法生成图片，请尝试降低尺寸'));
    }, mime, quality);
  });
}

function makeRect(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

function normalizeRect(rect) {
  const x = clamp(Math.round(rect.x), 0, els.canvas.width);
  const y = clamp(Math.round(rect.y), 0, els.canvas.height);
  return {
    x,
    y,
    w: Math.max(0, Math.min(Math.round(rect.w), els.canvas.width - x)),
    h: Math.max(0, Math.min(Math.round(rect.h), els.canvas.height - y)),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
