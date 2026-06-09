import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { parseCssColor } from '../../public/scripts/utils/color.js';

mountToolHeader();

/* ================================================================
   平台 / 尺寸配置
   ================================================================ */
const PLATFORMS = {
  windows: [
    { s: 16, d: '小图标' }, { s: 32, d: '标准' }, { s: 48, d: '大图标' },
    { s: 64, d: '超大' }, { s: 128, d: '缩略图' }, { s: 256, d: '高清' }, { s: 512, d: '超高清' }
  ],
  macos: [
    { s: 16, d: '小图标' }, { s: 32, d: '标准' }, { s: 128, d: '大图标' },
    { s: 256, d: '高清' }, { s: 512, d: 'Retina' }, { s: 1024, d: 'Retina HD' }
  ],
  ios: [
    { s: 20, d: '通知' }, { s: 29, d: '设置' }, { s: 40, d: '聚焦' },
    { s: 58, d: '设置@2x' }, { s: 60, d: '应用' }, { s: 76, d: 'iPad' },
    { s: 80, d: '聚焦@2x' }, { s: 87, d: '设置@3x' }, { s: 120, d: '应用@2x' },
    { s: 152, d: 'iPad@2x' }, { s: 167, d: 'iPad Pro' }, { s: 180, d: '应用@3x' },
    { s: 1024, d: 'App Store' }
  ],
  android: [
    { s: 36, d: 'LDPI' }, { s: 48, d: 'MDPI' }, { s: 72, d: 'HDPI' },
    { s: 96, d: 'XHDPI' }, { s: 144, d: 'XXHDPI' }, { s: 192, d: 'XXXHDPI' },
    { s: 512, d: 'Play Store' }
  ],
  favicon: [
    { s: 16, d: '标签页' }, { s: 32, d: '书签栏' }, { s: 48, d: '快捷方式' },
    { s: 64, d: '高清' }, { s: 128, d: '兼容' }, { s: 256, d: '特殊' }
  ]
};

const QUICK = {
  windows:  { '常用': [16, 32, 48, 256], '完整': [16, 32, 48, 64, 128, 256, 512] },
  macos:    { '标准': [16, 32, 128, 256, 512], '高分辨率': [256, 512, 1024] },
  ios:      { '必需': [60, 76, 120, 152, 180, 1024], '完整': [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024] },
  android:  { '标准': [48, 72, 96, 144, 192], '全部': [36, 48, 72, 96, 144, 192, 512] },
  favicon:  { '基础': [16, 32, 48], '完整': [16, 32, 48, 64, 128, 256] }
};

const DEFAULTS = { windows: [16, 32, 48, 256], macos: [16, 32, 128, 256, 512], ios: [60, 76, 120, 152, 180, 1024], android: [48, 72, 96, 144, 192], favicon: [16, 32, 48] };
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i;

/* ================================================================
   状态
   ================================================================ */
let platform      = 'windows';
let originalImage  = null;
let croppedImage   = null;
let borderRadius   = 0;
let convertedFiles = [];
let bgFill         = true;
let bgColor        = '';
let sourceHasAlpha = false;
let adaptiveMode   = false;
let adaptiveBgColor = '';
let darkPreview    = false;

/* ================================================================
   DOM
   ================================================================ */
const dropEl      = $('[data-drop]');
const fileEl      = $('[data-file]');
const srcPanel    = $('[data-src-panel]');
const srcCv       = $('[data-src-cv]');
const srcInfo     = $('[data-src-info]');
const cropBox     = $('[data-crop]');
const cropBar     = $('[data-crop-bar]');
const radiusPanel = $('[data-radius-panel]');
const radiusEl    = $('[data-radius]');
const radiusVal   = $('[data-radius-val]');
const fmtLabel    = $('[data-fmt-label]');
const sizeCount   = $('[data-size-count]');
const clearBtn    = $('[data-act="clear"]');
const genBtn      = $('[data-act="generate"]');
const zipBtn      = $('[data-act="download-zip"]');
const progEl      = $('[data-progress]');
const barEl       = $('[data-bar]');
const progText    = $('[data-prog-text]');
const resultPanel = $('[data-result-panel]');
const iconGrid    = $('[data-icon-grid]');
const bgColorEl   = $('[data-bg-color]');
const bgColorRow  = $('[data-bg-color-row]');
const adaptivePanel    = $('[data-adaptive-panel]');
const adaptiveSettings = $('[data-adaptive-settings]');
const adaptiveBgEl     = $('[data-adaptive-bg]');
const darkToggle  = $('[data-dark-toggle]');
const iconModal   = $('[data-icon-modal]');
const modalCv     = $('[data-modal-cv]');
const modalInfo   = $('[data-modal-info]');
const appearancePanel = $('[data-appearance-panel]');

/* ================================================================
   平台 / 尺寸 UI
   ================================================================ */
function renderSizes() {
  const cont = $('[data-sizes]');
  const defs = DEFAULTS[platform];
  cont.innerHTML = PLATFORMS[platform].map(({ s, d }) => {
    const on = defs.includes(s) ? ' on' : '';
    return `<button class="sz-card${on}" type="button" data-sz="${s}"><strong>${s}×${s}</strong><span>${d}</span></button>`;
  }).join('');
  updateSizeCount();
}

function renderQuick() {
  const cont = $('[data-quick]');
  const q = QUICK[platform];
  const utilityActions = `
    <button class="btn is-sm is-ghost" type="button" data-qk="__all">全选</button>
    <button class="btn is-sm is-ghost" type="button" data-qk="__none">清空</button>
  `;
  cont.innerHTML = Object.entries(q).map(([label]) => (
    `<button class="btn is-sm is-ghost" type="button" data-qk="${label}">${label}</button>`
  )).join('') + utilityActions;
}

function getSelectedSizes() {
  return [...document.querySelectorAll('.sz-card.on')].map(el => +el.dataset.sz).sort((a, b) => a - b);
}

function updatePlatformUI() {
  const iconFormatBtn = $('[data-fmt="icon"]');
  const pngFormatBtn = $('[data-fmt="png"]');
  renderSizes();
  renderQuick();
  radiusPanel.hidden = !['ios', 'android', 'favicon'].includes(platform);
  if (platform === 'macos') { borderRadius = 0; }
  if (platform === 'ios' && borderRadius === 0) { borderRadius = 22; radiusEl.value = 22; radiusVal.textContent = '22%'; updateRadiusPresets(); }
  fmtLabel.textContent = platform === 'macos' ? 'ICNS' : 'ICO';
  iconFormatBtn.hidden = !isIconPlat();
  if (!isIconPlat()) pngFormatBtn.classList.add('active');
  adaptivePanel.hidden = platform !== 'android';
  updateBgPanel();
  syncAppearanceEmpty();
}

function updateBgPanel() {
  $('[data-bg-panel]').hidden = !sourceHasAlpha;
  syncAppearanceEmpty();
}

function updateRadiusPresets() {
  document.querySelectorAll('[data-rv]').forEach(b => b.classList.toggle('active', +b.dataset.rv === borderRadius));
}

function updateSizeCount() {
  sizeCount.textContent = `${getSelectedSizes().length} 个`;
}

function syncAppearanceEmpty() {
  appearancePanel.hidden = !originalImage || (radiusPanel.hidden && adaptivePanel.hidden && $('[data-bg-panel]').hidden);
}

/* — 事件 — */
$('[data-plats]').addEventListener('click', e => {
  const b = e.target.closest('[data-plat]'); if (!b) return;
  $('[data-plats]').querySelectorAll('[data-plat]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  platform = b.dataset.plat;
  clearGeneratedResults();
  updatePlatformUI();
});

$('[data-sizes]').addEventListener('click', e => {
  const card = e.target.closest('.sz-card'); if (!card) return;
  card.classList.toggle('on');
  updateSizeCount();
  clearGeneratedResults();
});

$('[data-quick]').addEventListener('click', e => {
  const b = e.target.closest('[data-qk]'); if (!b) return;
  const key = b.dataset.qk;
  const sizes = QUICK[platform][key]; if (!sizes) return;
  document.querySelectorAll('.sz-card').forEach(c => c.classList.remove('on'));
  sizes.forEach(s => { const el = document.querySelector(`.sz-card[data-sz="${s}"]`); if (el) el.classList.add('on'); });
  updateSizeCount();
  clearGeneratedResults();
});

on(radiusEl, 'input', e => { borderRadius = +e.target.value; radiusVal.textContent = borderRadius + '%'; updateRadiusPresets(); clearGeneratedResults(); });
$('[data-rp]').addEventListener('click', e => {
  const b = e.target.closest('[data-rv]'); if (!b) return;
  borderRadius = +b.dataset.rv; radiusEl.value = borderRadius; radiusVal.textContent = borderRadius + '%'; updateRadiusPresets();
  clearGeneratedResults();
});

/* 全选/清空按钮（标题栏内联） */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-qk="__all"],[data-qk="__none"]'); if (!b) return;
  const key = b.dataset.qk;
  if (key === '__all')  document.querySelectorAll('.sz-card').forEach(c => c.classList.add('on'));
  if (key === '__none') document.querySelectorAll('.sz-card').forEach(c => c.classList.remove('on'));
  updateSizeCount();
  clearGeneratedResults();
});

/* 导出格式多选 */
$('[data-fmt-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-fmt]'); if (!btn || btn.hidden) return;
  btn.classList.toggle('active');
  clearGeneratedResults();
  updateBgPanel();
});

/* 背景填充 */
$('[data-bg-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-bg]'); if (!btn) return;
  $('[data-bg-opts]').querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  bgFill = btn.dataset.bg === 'fill';
  bgColorRow.hidden = !bgFill;
  clearGeneratedResults();
});
on(bgColorEl, 'input', e => { bgColor = e.target.value; clearGeneratedResults(); });

/* Android 自适应图标 */
$('[data-adaptive-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-adaptive]'); if (!btn) return;
  $('[data-adaptive-opts]').querySelectorAll('[data-adaptive]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  adaptiveMode = btn.dataset.adaptive === 'adaptive';
  adaptiveSettings.hidden = !adaptiveMode;
  clearGeneratedResults();
});
on(adaptiveBgEl, 'input', e => { adaptiveBgColor = e.target.value; clearGeneratedResults(); });

/* 暗色预览切换 */
on(darkToggle, 'click', () => {
  darkPreview = !darkPreview;
  darkToggle.classList.toggle('active', darkPreview);
  document.querySelectorAll('.ii-preview').forEach(el => el.classList.toggle('dark-bg', darkPreview));
});

/* ================================================================
   图片上传
   ================================================================ */
initUploadZone({ dropEl, fileEl, onFiles: files => loadImage(files[0]), accept: 'image', onDelete: resetImage });


function finalizeImage(img) {
  originalImage = img; croppedImage = null;
  clearGeneratedResults();
  exitCrop();
  drawSrcPreview();
  dropEl.hidden = true; srcPanel.hidden = false;
  genBtn.disabled = false;
  updateBgPanel();
}

function loadImage(file) {
  if (!file || (!file.type.startsWith('image/') && !IMAGE_EXT_RE.test(file.name || ''))) return;
  sourceHasAlpha = !['image/jpeg', 'image/jpg', 'image/bmp'].includes(file.type);
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === 0) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 512;
        cv.getContext('2d').drawImage(img, 0, 0, 512, 512);
        const r = new Image();
        r.onload = () => finalizeImage(r);
        r.src = cv.toDataURL();
      } else { finalizeImage(img); }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function drawSrcPreview() {
  const img = croppedImage || originalImage; if (!img) return;
  const maxW = srcCv.parentElement.offsetWidth || 500, maxH = 280;
  const sc = Math.min(maxW / img.width, maxH / img.height, 1);
  srcCv.width = img.width * sc; srcCv.height = img.height * sc;
  srcCv.getContext('2d').drawImage(img, 0, 0, srcCv.width, srcCv.height);
  srcInfo.textContent = `${img.width}×${img.height} px`;
}

/* ================================================================
   裁剪
   ================================================================ */
let cropState = null;

on($('[data-act="crop"]'), 'click', () => {
  if (!originalImage) return;
  croppedImage = null; drawSrcPreview();
  const sz = Math.min(srcCv.width, srcCv.height);
  cropState = { x: (srcCv.width - sz) / 2, y: (srcCv.height - sz) / 2, w: sz, h: sz, scale: srcCv.width / originalImage.width };
  applyCropPos();
  cropBox.classList.add('vis');
  cropBar.hidden = false;
});

on($('[data-act="apply-crop"]'), 'click', () => {
  if (!cropState) return;
  const sc = cropState.scale;
  const sx = cropState.x / sc, sy = cropState.y / sc, sw = cropState.w / sc, sh = cropState.h / sc;
  const cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
  cv.getContext('2d').drawImage(originalImage, sx, sy, sw, sh, 0, 0, sw, sh);
  croppedImage = new Image();
  croppedImage.onload = () => { exitCrop(); drawSrcPreview(); showToast('裁剪已应用'); };
  croppedImage.src = cv.toDataURL();
});

on($('[data-act="reset-crop"]'), 'click', () => {
  if (!cropState) return;
  const sz = Math.min(srcCv.width, srcCv.height);
  cropState = { ...cropState, x: (srcCv.width - sz) / 2, y: (srcCv.height - sz) / 2, w: sz, h: sz };
  applyCropPos();
});

on($('[data-act="cancel-crop"]'), 'click', exitCrop);

function exitCrop() { cropBox.classList.remove('vis'); cropBar.hidden = true; cropState = null; }

function applyCropPos() {
  if (!cropState) return;
  cropBox.style.left = (cropState.x + srcCv.offsetLeft) + 'px';
  cropBox.style.top = (cropState.y + srcCv.offsetTop) + 'px';
  cropBox.style.width = cropState.w + 'px';
  cropBox.style.height = cropState.h + 'px';
}

/* 拖拽 & 缩放 */
let drag = null;
cropBox.addEventListener('pointerdown', e => {
  e.preventDefault();
  const handle = e.target.closest('.c-h');
  drag = { startX: e.clientX, startY: e.clientY, orig: { ...cropState }, handle: handle ? handle.className : null };
  cropBox.setPointerCapture(e.pointerId);
});
cropBox.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
  const o = drag.orig, cw = srcCv.width, ch = srcCv.height, min = 40;
  if (!drag.handle) {
    cropState.x = Math.max(0, Math.min(cw - o.w, o.x + dx));
    cropState.y = Math.max(0, Math.min(ch - o.h, o.y + dy));
  } else {
    const delta = drag.handle.includes('se') ? Math.max(dx, dy) :
                  drag.handle.includes('sw') ? Math.max(-dx, dy) :
                  drag.handle.includes('ne') ? Math.max(dx, -dy) : Math.max(-dx, -dy);
    let ns = Math.max(min, o.w + delta);
    if (drag.handle.includes('nw')) { ns = Math.min(ns, o.x + o.w, o.y + o.h); cropState.x = o.x + o.w - ns; cropState.y = o.y + o.h - ns; }
    else if (drag.handle.includes('ne')) { ns = Math.min(ns, cw - o.x, o.y + o.h); cropState.y = o.y + o.h - ns; }
    else if (drag.handle.includes('sw')) { ns = Math.min(ns, o.x + o.w, ch - o.y); cropState.x = o.x + o.w - ns; }
    else { ns = Math.min(ns, cw - o.x, ch - o.y); }
    cropState.w = cropState.h = ns;
  }
  applyCropPos();
});
cropBox.addEventListener('pointerup', () => { drag = null; });

/* ================================================================
   Canvas 绘制工具
   ================================================================ */
function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawSquirclePath(ctx, size, n = 5) {
  const cx = size / 2, cy = size / 2, r = size / 2;
  ctx.beginPath();
  for (let i = 0; i <= 128; i++) {
    const t = (i / 128) * Math.PI * 2;
    const cos = Math.cos(t), sin = Math.sin(t);
    const x = cx + Math.sign(cos) * Math.pow(Math.abs(cos), 2 / n) * r;
    const y = cy + Math.sign(sin) * Math.pow(Math.abs(sin), 2 / n) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function renderIcon(src, size) {
  const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = size > 64;
  if (ctx.imageSmoothingEnabled) ctx.imageSmoothingQuality = 'high';

  if (platform === 'macos') {
    drawSquirclePath(ctx, size); ctx.clip();
  } else if (borderRadius > 0 && ['ios', 'android', 'favicon'].includes(platform)) {
    drawRoundedRect(ctx, 0, 0, size, size, size * borderRadius / 100); ctx.clip();
  }

  if (bgFill) { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, size, size); }

  const ss = Math.min(src.width, src.height);
  const sx = (src.width - ss) / 2, sy = (src.height - ss) / 2;
  if (platform === 'android' && adaptiveMode) {
    const pad = size * 0.125;
    ctx.drawImage(src, sx, sy, ss, ss, pad, pad, size - pad * 2, size - pad * 2);
  } else {
    ctx.drawImage(src, sx, sy, ss, ss, 0, 0, size, size);
  }
  return cv;
}

/* ================================================================
   ICO / ICNS 二进制编码
   ================================================================ */
function createICO(images) {
  const hdr = 6, dir = 16;
  let total = hdr + images.length * dir;
  images.forEach(i => total += i.data.length);
  const buf = new ArrayBuffer(total), dv = new DataView(buf), u8 = new Uint8Array(buf);
  dv.setUint16(0, 0, true); dv.setUint16(2, 1, true); dv.setUint16(4, images.length, true);
  let off = hdr + images.length * dir;
  images.forEach((img, idx) => {
    const e = hdr + idx * dir, sz = img.size >= 256 ? 0 : img.size;
    dv.setUint8(e, sz); dv.setUint8(e + 1, sz);
    dv.setUint8(e + 2, 0); dv.setUint8(e + 3, 0);
    dv.setUint16(e + 4, 1, true); dv.setUint16(e + 6, 32, true);
    dv.setUint32(e + 8, img.data.length, true); dv.setUint32(e + 12, off, true);
    u8.set(img.data, off); off += img.data.length;
  });
  return u8;
}

const ICNS_MAP = { 16: 'icp4', 32: 'icp5', 64: 'icp6', 128: 'ic07', 256: 'ic08', 512: 'ic09', 1024: 'ic10' };

function createICNS(images) {
  const enc = new TextEncoder();
  let total = 8;
  const entries = images.filter(i => ICNS_MAP[i.size]).map(i => {
    const len = 8 + i.data.length; total += len;
    return { type: ICNS_MAP[i.size], len, data: i.data };
  });
  const buf = new ArrayBuffer(total), dv = new DataView(buf), u8 = new Uint8Array(buf);
  u8.set(enc.encode('icns'), 0); dv.setUint32(4, total, false);
  let off = 8;
  entries.forEach(e => {
    u8.set(enc.encode(e.type), off); dv.setUint32(off + 4, e.len, false);
    u8.set(e.data, off + 8); off += e.len;
  });
  return u8;
}

async function canvasToUint8(cv) {
  const blob = await new Promise(r => cv.toBlob(r, 'image/png', 1.0));
  return new Uint8Array(await blob.arrayBuffer());
}

/* ================================================================
   生成 & 下载
   ================================================================ */
function fileName(size, ext) {
  const base = { windows: 'icon', macos: 'icon', ios: 'AppIcon', android: 'ic_launcher', favicon: 'favicon' }[platform] || 'icon';
  return `${base}_${size}x${size}.${ext}`;
}
function iconExt() { return platform === 'macos' ? 'icns' : 'ico'; }
function isIconPlat() { return ['windows', 'macos', 'favicon'].includes(platform); }
function fmtSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }

on(genBtn, 'click', async () => {
  const sizes = getSelectedSizes();
  if (!sizes.length) { showToast('请至少选择一个尺寸'); return; }
  if (!originalImage) return;

  const src = croppedImage || originalImage;
  const useIcon = $('[data-fmt="icon"]').classList.contains('active') && isIconPlat();
  const usePng  = $('[data-fmt="png"]').classList.contains('active');
  if (!useIcon && !usePng) { showToast('请至少选择一种导出格式'); return; }

  genBtn.disabled = true; progEl.hidden = false; barEl.style.width = '0%';
  clearGeneratedResults();
  resultPanel.hidden = false;

  try {
    const total = sizes.length;
    for (let i = 0; i < sizes.length; i++) {
      const sz = sizes[i];
      const cv = renderIcon(src, sz);
      const pngData = await canvasToUint8(cv);

      if (useIcon) {
        const blob = platform === 'macos'
          ? new Blob([createICNS([{ size: sz, data: pngData }])], { type: 'image/icns' })
          : new Blob([createICO([{ size: sz, data: pngData }])], { type: 'image/x-icon' });
        convertedFiles.push({ blob, size: sz, name: fileName(sz, iconExt()), format: iconExt() });
      }
      if (usePng) {
        const blob = new Blob([pngData], { type: 'image/png' });
        convertedFiles.push({ blob, size: sz, name: fileName(sz, 'png'), format: 'png' });
      }

      // Android 自适应：额外生成背景层
      if (platform === 'android' && adaptiveMode) {
        const bgCv = document.createElement('canvas'); bgCv.width = bgCv.height = sz;
        bgCv.getContext('2d').fillStyle = adaptiveBgColor;
        bgCv.getContext('2d').fillRect(0, 0, sz, sz);
        const bgData = await canvasToUint8(bgCv);
        convertedFiles.push({ blob: new Blob([bgData], { type: 'image/png' }), size: sz, name: `ic_launcher_background_${sz}.png`, format: 'png-bg' });
      }

      // 预览卡片
      const displaySz = Math.min(sz, 96);
      cv.style.width = displaySz + 'px'; cv.style.height = displaySz + 'px';
      if (['ios', 'android', 'favicon'].includes(platform) && borderRadius > 0) cv.style.borderRadius = borderRadius + '%';
      if (platform === 'macos') cv.style.borderRadius = '22%';
      const card = document.createElement('div'); card.className = 'card icon-item';
      const body = document.createElement('div'); body.className = 'card-body u-col u-items-center u-gap-2 u-text-center';
      const preview = document.createElement('div'); preview.className = 'ii-preview';
      if (darkPreview) preview.classList.add('dark-bg');
      preview.appendChild(cv);
      const fmts = (useIcon ? iconExt().toUpperCase() : '') + (useIcon && usePng ? ' + ' : '') + (usePng ? 'PNG' : '');
      body.appendChild(preview);
      body.insertAdjacentHTML('beforeend', `<div class="u-text-xs"><div class="u-strong u-mono">${sz}×${sz}</div><div class="u-muted u-text-xs">${fmts}</div></div><button class="btn is-sm is-ghost is-block" data-dl="${sz}">下载</button>`);
      card.appendChild(body);
      iconGrid.appendChild(card);

      const pct = Math.round(((i + 1) / total) * 100);
      barEl.style.width = pct + '%'; progText.textContent = `${i + 1} / ${total}`;
    }

    zipBtn.disabled = false; clearBtn.hidden = false;
    showToast(`已生成 ${convertedFiles.length} 个图标`);
  } catch (err) { console.error(err); showToast('生成失败'); }
  finally { genBtn.disabled = false; progEl.hidden = true; }
});

/* 批量下载 ZIP */
on(zipBtn, 'click', async () => {
  if (!convertedFiles.length) return;
  zipBtn.disabled = true; progEl.hidden = false; barEl.style.width = '0%';

  try {
    const src = croppedImage || originalImage;
    const sizes = getSelectedSizes();
    const useIcon = $('[data-fmt="icon"]').classList.contains('active') && isIconPlat();
    const zip = new JSZip();

    // 多尺寸合并 ICO/ICNS（需重新渲染）
    if (useIcon && sizes.length > 1) {
      const entries = [];
      for (let i = 0; i < sizes.length; i++) {
        const cv = renderIcon(src, sizes[i]);
        entries.push({ size: sizes[i], data: await canvasToUint8(cv) });
        barEl.style.width = Math.round((i + 1) / sizes.length * 50) + '%';
      }
      const combined = platform === 'macos'
        ? new Blob([createICNS(entries)], { type: 'image/icns' })
        : new Blob([createICO(entries)], { type: 'image/x-icon' });
      zip.file(platform === 'favicon' ? `favicon.${iconExt()}` : `icon_multi.${iconExt()}`, combined);
    }

    // 散装文件直接用已生成的 blobs
    convertedFiles.forEach((f, i) => {
      let path = f.name;
      if (platform === 'android' && (f.format === 'png' || f.format === 'png-bg')) {
        const d = { 36: 'ldpi', 48: 'mdpi', 72: 'hdpi', 96: 'xhdpi', 144: 'xxhdpi', 192: 'xxxhdpi', 512: 'play-store' }[f.size] || '';
        if (d) path = `drawable-${d}/${path}`;
      }
      zip.file(path, f.blob);
      barEl.style.width = Math.round(50 + (i + 1) / convertedFiles.length * 50) + '%';
    });

    // Favicon: 自动生成 PWA manifest.json
    if (platform === 'favicon') {
      const pngFiles = convertedFiles.filter(f => f.format === 'png');
      if (pngFiles.length) {
        const manifest = {
          name: 'App', short_name: 'App',
          icons: pngFiles.map(f => ({ src: f.name, sizes: `${f.size}x${f.size}`, type: 'image/png' })),
          theme_color: bgFill ? bgColor : getDefaultBgColor(),
          background_color: bgFill ? bgColor : getDefaultBgColor(),
          display: 'standalone'
        };
        zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${platform}_icons.zip`; a.click();
    URL.revokeObjectURL(a.href);
    showToast('ZIP 下载已开始');
  } catch (err) { console.error(err); showToast('下载失败'); }
  finally { zipBtn.disabled = false; progEl.hidden = true; }
});

/* 单个图标下载 + 放大查看 */
iconGrid.addEventListener('click', e => {
  const btn = e.target.closest('[data-dl]');
  if (btn) {
    const sz = +btn.dataset.dl;
    convertedFiles.filter(f => f.size === sz && f.format !== 'png-bg').forEach(f => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(f.blob); a.download = f.name; a.click();
      URL.revokeObjectURL(a.href);
    });
    return;
  }
  const previewCv = e.target.closest('.ii-preview canvas');
  if (previewCv) {
    const item = previewCv.closest('.icon-item');
    const sz = +item.querySelector('[data-dl]').dataset.dl;
    const src = croppedImage || originalImage;
    const dispSz = Math.min(sz, 256);
    const tempCv = renderIcon(src, dispSz);
    modalCv.width = modalCv.height = dispSz;
    modalCv.style.width = `${dispSz}px`;
    modalCv.style.height = `${dispSz}px`;
    modalCv.getContext('2d').drawImage(tempCv, 0, 0);
    if (platform === 'macos') modalCv.style.borderRadius = '22%';
    else if (['ios', 'android', 'favicon'].includes(platform) && borderRadius > 0) modalCv.style.borderRadius = borderRadius + '%';
    else modalCv.style.borderRadius = '';
    modalInfo.textContent = `${sz}×${sz} px`;
    iconModal.hidden = false;
  }
});

/* Modal 关闭 */
$('[data-modal-close]').addEventListener('click', () => { iconModal.hidden = true; });
iconModal.addEventListener('click', e => { if (e.target === iconModal) iconModal.hidden = true; });

/* 清空重置 */
on(clearBtn, 'click', clearGeneratedResults);

function clearGeneratedResults() {
  convertedFiles = []; iconGrid.innerHTML = ''; resultPanel.hidden = true;
  zipBtn.disabled = true; clearBtn.hidden = true;
}

function resetImage() {
  originalImage = null;
  croppedImage = null;
  sourceHasAlpha = false;
  srcPanel.hidden = true;
  dropEl.hidden = false;
  genBtn.disabled = true;
  fileEl.value = '';
  exitCrop();
  clearGeneratedResults();
  updateBgPanel();
  srcCv.getContext('2d').clearRect(0, 0, srcCv.width, srcCv.height);
  srcInfo.textContent = '';
}

function getDefaultBgColor() {
  return cssColorToHex(getCssColor('--bg-surface', 'white'));
}

function getDefaultAdaptiveBgColor() {
  return cssColorToHex(getCssColor('--color-brand', 'royalblue'));
}

function getCssColor(token, fallback) {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || fallback;
}

function cssColorToHex(color) {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = color;
  const normalized = ctx.fillStyle;
  if (normalized.startsWith('#')) return normalized;
  return parseCssColor(normalized) ?? 'white';
}

/* ================================================================
   初始化
   ================================================================ */
bgColor = getDefaultBgColor();
adaptiveBgColor = getDefaultAdaptiveBgColor();
bgColorEl.value = bgColor;
adaptiveBgEl.value = adaptiveBgColor;
updatePlatformUI();
