import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { DEFAULT_PRESET, PRESETS } from './presets.js';

mountToolHeader();

const MIME_MAP = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const FORMAT_LABEL = { png: 'PNG', jpg: 'JPG', webp: 'WebP' };
const MAX_CANVAS_AREA = 16000 * 16000;
const CSS_RGB = 'rgb';
const colorCtx = document.createElement('canvas').getContext('2d');
let renderPending = false;

const CTRL_KEYS = [
  'fit', 'ratio', 'radius', 'padding', 'borderW', 'borderColor',
  'shadowBlur', 'shadowX', 'shadowY', 'shadowOpacity', 'shadowColor',
  'bgColor', 'gradientFrom', 'gradientTo', 'bgBlur', 'quality',
];
const VALUE_KEYS = ['radius', 'padding', 'borderW', 'shadowBlur', 'shadowX', 'shadowY', 'shadowOpacity', 'bgBlur', 'quality'];
const ROW_KEYS = ['quality', 'borderColor', 'shadowX', 'shadowY', 'shadowColor', 'bgColor', 'gradient', 'bgBlur'];
const NUMERIC_KEYS = new Set([...VALUE_KEYS]);
const COLOR_KEYS = new Set(['borderColor', 'shadowColor', 'bgColor', 'gradientFrom', 'gradientTo']);
const BG_LABEL = { solid: '纯色', gradient: '渐变', blur: '模糊', transparent: '透明' };

const els = {
  drop: $('[data-drop]'),
  file: $('[data-file]'),
  preview: $('[data-preview]'),
  wrap: $('[data-canvas-wrap]'),
  fileName: $('[data-file-name]'),
  imgInfo: $('[data-img-info]'),
  presets: $('[data-preset-opts]'),
  presetCount: $('[data-preset-count]'),
  output: $('[data-output]'),
  scale: $('[data-scale]'),
  download: $('[data-action="download"]'),
  copy: $('[data-action="copy"]'),
};

const ctrls = mapData(CTRL_KEYS);
const valEls = mapData(VALUE_KEYS, 'val');
const rowEls = mapData(ROW_KEYS, 'row');

const state = {
  source: null,
  objectUrl: '',
  presetId: DEFAULT_PRESET,
  format: 'png',
  scale: 1,
  settings: { ...PRESETS[DEFAULT_PRESET] },
};

renderPresets();
syncControls();
render();

initUploadZone({ dropEl: els.drop, fileEl: els.file, onFiles: files => handleFile(files[0]), accept: 'image', onDelete: clearImage });

function mapData(keys, suffix = '') {
  return Object.fromEntries(keys.map(key => [key, $(`[data-${toKebab(key)}${suffix ? `-${suffix}` : ''}]`)]));
}

function toKebab(key) {
  return key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
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
    els.drop.hidden = true;
    els.preview.hidden = false;
    render();
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

function renderPresets() {
  els.presetCount.textContent = `${Object.keys(PRESETS).length} 个`;
  els.presets.replaceChildren(...Object.entries(PRESETS).map(([id, preset]) => {
    const pv = getPresetPreviewVars(preset);
    const fv = getPresetFrameVars(preset);
    const button = withVars(node('button', 'preset-card'), { '--preset-thumb': '58px' });
    const preview = withVars(node('span', 'ib-preset-preview'), { '--ib-preview-a': pv.a, '--ib-preview-b': pv.b });
    const frame = withVars(node('span', `ib-preset-frame${preset.shape === 'circle' ? ' is-circle' : ''}`), {
      '--ib-radius': fv.radius,
      '--ib-border': fv.border,
      '--ib-border-color': fv.borderColor,
      '--ib-shadow': fv.shadow,
    });
    const copy = node('span', 'preset-card-copy');
    button.type = 'button';
    button.dataset.preset = id;
    preview.append(frame);
    copy.append(node('strong', '', preset.name), node('span', '', preset.desc));
    button.append(preview, copy);
    return button;
  }));
}

function node(tag, className, text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function withVars(el, vars) {
  Object.entries(vars).forEach(([name, value]) => el.style.setProperty(name, value));
  return el;
}

function getPresetPreviewVars(preset) {
  if (preset.bgMode === 'gradient') return { a: preset.gradientFrom, b: preset.gradientTo };
  if (preset.bgMode === 'blur') return { a: 'var(--bg-inverse)', b: 'var(--fg-muted)' };
  if (preset.bgMode === 'transparent') return { a: 'var(--bg-surface-2)', b: 'var(--border-base)' };
  return { a: preset.bgColor, b: preset.bgColor };
}

function getPresetFrameVars(preset) {
  const radius = preset.shape === 'circle' ? '50%' : `${Math.min(preset.radius, 16)}px`;
  const border = Math.min(preset.borderW, 4);
  const shadow = Math.min(preset.shadowOpacity / 100, .32);
  return {
    radius,
    border: `${border}px`,
    borderColor: preset.borderColor,
    shadow: String(shadow),
  };
}

on(els.presets, 'click', e => {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  applyPreset(btn.dataset.preset);
});

function applyPreset(id) {
  const preset = PRESETS[id];
  if (!preset) return;
  state.presetId = id;
  state.settings = { ...state.settings, ...preset };
  scheduleRender();
}

on($('[data-action="reset"]'), 'click', () => applyPreset(DEFAULT_PRESET));

bindChoice('[data-shape-opts]', 'shape', e => {
  const btn = e.target.closest('[data-shape]');
  if (btn.dataset.shape === 'circle') {
    state.settings.fit = 'cover';
    state.settings.ratio = '1:1';
  }
});

bindChoice('[data-bg-mode-opts]', 'bgMode');
bindChoice('[data-format-opts]', 'format', null, 'fmt');

on(els.scale, 'change', () => {
  state.scale = Number(els.scale.value) || 1;
  scheduleRender();
});

function bindChoice(selector, key, after, dataKey = key) {
  on($(selector), 'click', e => {
    const btn = e.target.closest(`[data-${toKebab(dataKey)}]`);
    if (!btn) return;
    if (key === 'format') state.format = btn.dataset[dataKey];
    else state.settings[key] = btn.dataset[dataKey];
    if (key !== 'format') state.presetId = '';
    if (after) after(e);
    scheduleRender();
  });
}

for (const key of Object.keys(ctrls)) {
  const update = () => {
    state.settings[key] = NUMERIC_KEYS.has(key) ? Number(ctrls[key].value) : ctrls[key].value;
    if (key !== 'quality') state.presetId = '';
    scheduleRender();
  };
  on(ctrls[key], 'input', update);
  on(ctrls[key], 'change', update);
}

function syncControls() {
  const s = state.settings;
  setActive('[data-preset]', 'preset', state.presetId, els.presets);
  setActive('[data-shape]', 'shape', s.shape);
  setActive('[data-bg-mode]', 'bgMode', s.bgMode);
  setActive('[data-fmt]', 'fmt', state.format);
  els.scale.value = String(state.scale);

  CTRL_KEYS.forEach(key => {
    const value = key === 'quality' ? s.quality || 92 : s[key];
    ctrls[key].value = COLOR_KEYS.has(key) ? colorInputValue(value) : value;
  });

  setValueLabels(s);
  rowEls.quality.hidden = state.format === 'png';
  rowEls.borderColor.hidden = !s.borderW;
  const hasShadow = Boolean(s.shadowBlur && s.shadowOpacity);
  rowEls.shadowX.hidden = !hasShadow;
  rowEls.shadowY.hidden = !hasShadow;
  rowEls.shadowColor.hidden = !hasShadow;
  rowEls.bgColor.hidden = s.bgMode !== 'solid' && !(s.bgMode === 'transparent' && state.format === 'jpg');
  rowEls.gradient.hidden = s.bgMode !== 'gradient';
  rowEls.bgBlur.hidden = s.bgMode !== 'blur';

  for (const input of $$('input[type="range"]', document.body)) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value || 0);
    input.style.setProperty('--range-pct', `${((val - min) / (max - min)) * 100}%`);
  }
}

function setActive(selector, dataKey, value, root = document) {
  $$(selector, root).forEach(btn => btn.classList.toggle('is-active', btn.dataset[dataKey] === value));
}

function setValueLabels(s) {
  const labels = {
    radius: `${s.radius} px`,
    padding: `${s.padding} px`,
    borderW: `${s.borderW} px`,
    shadowBlur: `${s.shadowBlur} px`,
    shadowX: `${s.shadowX} px`,
    shadowY: `${s.shadowY} px`,
    shadowOpacity: `${s.shadowOpacity}%`,
    bgBlur: `${s.bgBlur} px`,
    quality: `${ctrls.quality.value}%`,
  };
  Object.entries(labels).forEach(([key, value]) => { valEls[key].textContent = value; });
}

function clearImage() {
  revokeSource();
  state.source = null;
  els.file.value = '';
  els.wrap.replaceChildren(createEmptyState());
  els.drop.hidden = false;
  els.preview.hidden = true;
  els.output.hidden = true;
  updateActions();
  if (window.refreshIcons) window.refreshIcons(els.wrap);
}

function createEmptyState() {
  const empty = document.createElement('div');
  empty.className = 'ib-empty';
  empty.dataset.empty = '';
  const icon = document.createElement('i');
  icon.className = 'ib-empty-icon';
  icon.dataset.lucide = 'image';
  const label = document.createElement('span');
  label.textContent = '上传图片后实时预览';
  empty.append(icon, label);
  return empty;
}

function updateActions() {
  const has = Boolean(state.source);
  els.download.disabled = !has;
  els.copy.disabled = !has;
}

function render() {
  renderPending = false;
  syncControls();
  updateActions();
  if (!state.source) return;

  try {
    const canvas = buildCanvas();
    els.fileName.textContent = state.source.name;
    els.imgInfo.textContent = `${state.source.width} × ${state.source.height} px · ${formatSize(state.source.size)}`;
    els.wrap.replaceChildren(canvas);
    renderOutputInfo(canvas);
  } catch (err) {
    showToast(err.message || '预览生成失败', { type: 'error' });
  }
}

function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(render);
}

function buildCanvas() {
  const s = state.settings;
  const src = state.source;
  if (!src) throw new Error('请先上传图片');

  const frame = computeFrame(src, s);
  const scale = state.scale || 1;
  ensureCanvasSize(frame.canvasW * scale, frame.canvasH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(frame.canvasW * scale);
  canvas.height = Math.round(frame.canvasH * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  drawBackground(ctx, src.img, frame, s);
  drawShadow(ctx, frame, s);
  drawImageLayer(ctx, src.img, frame, s);
  drawBorder(ctx, frame, s);

  return canvas;
}

function computeFrame(src, s) {
  const naturalW = src.width;
  const naturalH = src.height;
  const ratio = parseRatio(s.ratio);
  const pad = s.padding;
  const shadowPad = Math.ceil(s.shadowBlur + Math.max(Math.abs(s.shadowX), Math.abs(s.shadowY)));
  const outerPad = pad + shadowPad;

  let contentW = naturalW;
  let contentH = naturalH;
  if (ratio) {
    const base = Math.max(naturalW, naturalH);
    contentW = ratio >= 1 ? base : Math.round(base * ratio);
    contentH = ratio >= 1 ? Math.round(base / ratio) : base;
  }
  if (s.shape === 'circle') {
    const size = Math.max(naturalW, naturalH);
    contentW = size;
    contentH = size;
  }

  let imageW = naturalW;
  let imageH = naturalH;
  if (s.fit === 'contain') {
    const scale = Math.min(contentW / naturalW, contentH / naturalH, 1);
    imageW = Math.round(naturalW * scale);
    imageH = Math.round(naturalH * scale);
  } else if (s.fit === 'cover' || s.shape === 'circle') {
    imageW = contentW;
    imageH = contentH;
  }

  return {
    canvasW: Math.max(1, Math.round(contentW + outerPad * 2)),
    canvasH: Math.max(1, Math.round(contentH + outerPad * 2)),
    contentX: outerPad,
    contentY: outerPad,
    contentW,
    contentH,
    imageX: outerPad + Math.round((contentW - imageW) / 2),
    imageY: outerPad + Math.round((contentH - imageH) / 2),
    imageW,
    imageH,
    radius: s.shape === 'circle' ? Math.min(contentW, contentH) / 2 : Math.min(s.radius, contentW / 2, contentH / 2),
  };
}

function drawBackground(ctx, img, frame, s) {
  if (s.bgMode === 'transparent' && state.format !== 'jpg') return;

  if (s.bgMode === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, frame.canvasW, frame.canvasH);
    g.addColorStop(0, resolveColor(s.gradientFrom));
    g.addColorStop(1, resolveColor(s.gradientTo));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, frame.canvasW, frame.canvasH);
    return;
  }

  if (s.bgMode === 'blur') {
    ctx.save();
    ctx.filter = `blur(${s.bgBlur}px)`;
    drawCover(ctx, img, -s.bgBlur, -s.bgBlur, frame.canvasW + s.bgBlur * 2, frame.canvasH + s.bgBlur * 2);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = .22;
    ctx.fillStyle = cssVar('--bg-inverse');
    ctx.fillRect(0, 0, frame.canvasW, frame.canvasH);
    ctx.restore();
    return;
  }

  ctx.fillStyle = resolveColor(s.bgColor || cssVar('--bg-surface'));
  ctx.fillRect(0, 0, frame.canvasW, frame.canvasH);
}

function drawShadow(ctx, frame, s) {
  if (!s.shadowBlur || !s.shadowOpacity) return;
  ctx.save();
  ctx.shadowColor = colorWithAlpha(s.shadowColor, s.shadowOpacity / 100);
  ctx.shadowBlur = s.shadowBlur;
  ctx.shadowOffsetX = s.shadowX;
  ctx.shadowOffsetY = s.shadowY;
  framePath(ctx, frame, s);
  ctx.fillStyle = colorWithAlpha(s.shadowColor, 1);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.shadowColor = 'transparent';
  framePath(ctx, frame, s);
  ctx.fill();
  ctx.restore();
}

function drawImageLayer(ctx, img, frame, s) {
  ctx.save();
  framePath(ctx, frame, s);
  ctx.clip();
  if (s.fit === 'cover' || s.shape === 'circle') {
    drawCover(ctx, img, frame.contentX, frame.contentY, frame.contentW, frame.contentH);
  } else {
    ctx.drawImage(img, frame.imageX, frame.imageY, frame.imageW, frame.imageH);
  }
  ctx.restore();
}

function drawBorder(ctx, frame, s) {
  if (!s.borderW) return;
  const strokeW = Math.min(s.borderW, frame.contentW, frame.contentH);
  if (strokeW <= 0) return;
  ctx.save();
  ctx.strokeStyle = resolveColor(s.borderColor);
  ctx.lineWidth = strokeW;
  const inset = strokeW / 2;
  framePath(ctx, {
    ...frame,
    contentX: frame.contentX + inset,
    contentY: frame.contentY + inset,
    contentW: Math.max(1, frame.contentW - strokeW),
    contentH: Math.max(1, frame.contentH - strokeW),
    radius: Math.max(0, frame.radius - inset),
  }, s);
  ctx.stroke();
  ctx.restore();
}

function drawCover(ctx, img, dx, dy, dw, dh) {
  const sourceRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = dw / dh;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (sourceRatio > targetRatio) {
    sw = Math.round(img.naturalHeight * targetRatio);
    sx = Math.round((img.naturalWidth - sw) / 2);
  } else {
    sh = Math.round(img.naturalWidth / targetRatio);
    sy = Math.round((img.naturalHeight - sh) / 2);
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function framePath(ctx, frame, s) {
  ctx.beginPath();
  if (s.shape !== 'circle') return ctx.roundRect(frame.contentX, frame.contentY, frame.contentW, frame.contentH, frame.radius);
  const r = Math.min(frame.contentW, frame.contentH) / 2;
  ctx.arc(frame.contentX + frame.contentW / 2, frame.contentY + frame.contentH / 2, r, 0, Math.PI * 2);
  ctx.closePath();
}

function parseRatio(value) {
  if (!value || value === 'auto') return null;
  const [w, h] = value.split(':').map(Number);
  return w && h ? w / h : null;
}

function colorWithAlpha(value, alpha) {
  const clean = normalizeColor(value).replace('#', '');
  const int = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${CSS_RGB}(${r} ${g} ${b} / ${alpha})`;
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resolveColor(value) {
  if (!value) return cssVar('--bg-surface');
  const varMatch = /^var\((--[^)]+)\)$/.exec(value.trim());
  return varMatch ? cssVar(varMatch[1]) : value;
}

function colorInputValue(value) {
  return normalizeColor(value);
}

function normalizeColor(value) {
  colorCtx.fillStyle = cssVar('--bg-surface');
  colorCtx.fillStyle = resolveColor(value);
  return colorCtx.fillStyle;
}

function ensureCanvasSize(width, height) {
  if (width * height > MAX_CANVAS_AREA) throw new Error('输出尺寸过大，请换更小图片或减少留白/阴影');
}

function renderOutputInfo(canvas) {
  els.output.hidden = false;
  const bg = state.settings.bgMode === 'transparent' && state.format !== 'jpg' ? '透明' : getBgLabel(state.settings.bgMode);
  els.output.innerHTML = [
    ['输出尺寸', `${canvas.width} × ${canvas.height}`],
    ['格式', FORMAT_LABEL[state.format]],
    ['倍率', `${state.scale}×`],
    ['背景', bg],
    ['形状', state.settings.shape === 'circle' ? '圆形' : '圆角'],
  ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function getBgLabel(mode) {
  return BG_LABEL[mode] || BG_LABEL.solid;
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function getMime() {
  return MIME_MAP[state.format] || 'image/png';
}

function getQuality() {
  return state.format === 'png' ? 1 : Number(ctrls.quality.value) / 100;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('浏览器无法生成图片，请尝试降低尺寸'));
    }, mime, quality);
  });
}

function getDownloadName(ext) {
  const base = (state.source?.name || 'framed').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_') || 'framed';
  const scale = state.scale > 1 ? `@${state.scale}x` : '';
  return `${base}_border${scale}.${ext}`;
}

on(els.download, 'click', async () => {
  if (!state.source) {
    showToast('请先上传图片', { type: 'warn' });
    return;
  }
  try {
    const canvas = buildCanvas();
    let blob = await canvasToBlob(canvas, getMime(), getQuality());
    let ext = state.format;
    if (state.format === 'webp' && blob.type !== MIME_MAP.webp) {
      blob = await canvasToBlob(canvas, MIME_MAP.png, 1);
      ext = 'png';
      showToast('当前浏览器不支持 WebP 导出，已改用 PNG', { type: 'warn' });
    }
    downloadBlob(blob, getDownloadName(ext));
    showToast('下载已开始', { type: 'success' });
  } catch (err) {
    showToast(err.message || '导出失败', { type: 'error' });
  }
});

on(els.copy, 'click', async () => {
  if (!state.source) {
    showToast('请先上传图片', { type: 'warn' });
    return;
  }
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('当前浏览器不支持复制图片');
    const canvas = buildCanvas();
    const blob = await canvasToBlob(canvas, 'image/png', 1);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('已复制到剪贴板', { type: 'success' });
  } catch (err) {
    showToast(err.message || '复制失败', { type: 'error' });
  }
});
