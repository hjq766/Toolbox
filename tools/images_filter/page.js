/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const FILTERS = [
  { key: 'brightness', def: 100, unit: '%',   css: v => `brightness(${v / 100})`,  isDefault: v => v === 100 },
  { key: 'contrast',   def: 100, unit: '%',   css: v => `contrast(${v / 100})`,    isDefault: v => v === 100 },
  { key: 'saturate',   def: 100, unit: '%',   css: v => `saturate(${v / 100})`,    isDefault: v => v === 100 },
  { key: 'hue-rotate', def: 0,   unit: 'deg', css: v => `hue-rotate(${v}deg)`,     isDefault: v => v === 0   },
  { key: 'grayscale',  def: 0,   unit: '%',   css: v => `grayscale(${v}%)`,        isDefault: v => v === 0   },
  { key: 'sepia',      def: 0,   unit: '%',   css: v => `sepia(${v}%)`,            isDefault: v => v === 0   },
  { key: 'invert',     def: 0,   unit: '%',   css: v => `invert(${v}%)`,           isDefault: v => v === 0   },
  { key: 'blur',       def: 0,   unit: 'px',  css: v => `blur(${v}px)`,            isDefault: v => v === 0   },
];

const PRESETS = [
  { name: '原图',  vals: [100, 100, 100,   0,   0,  0,  0, 0] },
  { name: '黑白',  vals: [100, 120,   0,   0, 100,  0,  0, 0] },
  { name: '复古',  vals: [110, 110,  80,   0,   0, 80,  0, 0] },
  { name: '暖光',  vals: [115, 105, 110,  20,   0, 30,  0, 0] },
  { name: '冷调',  vals: [100, 110,  80, 200,   0,  0,  0, 0] },
  { name: '清晨',  vals: [125, 115, 120,   0,   0,  0,  0, 0] },
  { name: '暗调',  vals: [ 75, 130,  80,   0,   0,  0,  0, 0] },
  { name: '胶片',  vals: [105,  95,  85,  10,   0, 25,  0, 1] },
];

/* ========== 2. 状态 ========== */
let hasImage = false;
let fmt = 'png';

/* ========== 3. DOM 引用 ========== */
const uploadZoneEl = $('[data-upload-zone]');
const fileEl       = $('[data-file]');
const previewPanel = $('[data-preview-panel]');
const previewImg   = $('[data-img]');
const cssOutEl     = $('[data-css-out]');
const exportPanel  = $('[data-export-panel]');
const hintPanel    = $('[data-hint-panel]');
const presetsEl    = $('[data-presets]');
const fileNameEl   = $('[data-file-name]');
const imgInfoEl    = $('[data-img-info]');

/* ========== 4. 工具函数 ========== */

function getVals() {
  return FILTERS.map(f => Number($(`[data-filter="${f.key}"]`).value));
}

function buildFilterStr(values) {
  const parts = FILTERS
    .map((f, i) => f.isDefault(values[i]) ? null : f.css(values[i]))
    .filter(Boolean);
  return parts.length ? parts.join(' ') : 'none';
}

function update() {
  const values = getVals();
  const filterStr = buildFilterStr(values);
  if (hasImage) previewImg.style.filter = filterStr === 'none' ? '' : filterStr;
  cssOutEl.textContent = `filter: ${filterStr};`;
}

function applySliderVals(vals) {
  FILTERS.forEach((f, i) => {
    $(`[data-filter="${f.key}"]`).value = vals[i];
    $(`[data-val="${f.key}"]`).textContent = `${vals[i]}${f.unit}`;
  });
  $$('[data-preset-idx]').forEach(b => b.classList.remove('is-active'));
  update();
}

function renderPresets() {
  presetsEl.innerHTML = PRESETS
    .map((p, i) => `<div class="chip" data-preset-idx="${i}">${p.name}</div>`)
    .join('');
  on(presetsEl, 'click', e => {
    const chip = e.target.closest('[data-preset-idx]');
    if (!chip) return;
    $$('[data-preset-idx]').forEach(b => b.classList.remove('is-active'));
    chip.classList.add('is-active');
    applySliderVals(PRESETS[Number(chip.dataset.presetIdx)].vals);
  });
}

function exportImg() {
  if (!hasImage) {
    showToast('请先上传图片', { type: 'warn' });
    return;
  }
  const values = getVals();
  const filterStr = buildFilterStr(values);

  const canvas = document.createElement('canvas');
  canvas.width  = previewImg.naturalWidth;
  canvas.height = previewImg.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (filterStr !== 'none') ctx.filter = filterStr;
  ctx.drawImage(previewImg, 0, 0);

  const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
  canvas.toBlob(blob => {
    if (!blob) { showToast('导出失败', { type: 'error' }); return; }
    downloadBlob(blob, `filtered.${fmt}`);
    showToast('图片已下载', { type: 'success' });
  }, mime, fmt === 'jpg' ? 0.92 : undefined);
}

/* ========== 5. 事件绑定 ========== */

function fmtSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function loadFile(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  previewImg.onload = () => {
    hasImage = true;
    fileNameEl.textContent = file.name;
    imgInfoEl.textContent  = `${previewImg.naturalWidth} × ${previewImg.naturalHeight}px · ${fmtSize(file.size)}`;
    uploadZoneEl.hidden = true;
    previewPanel.hidden = false;
    exportPanel.hidden  = false;
    hintPanel.hidden    = true;
    update();
  };
  previewImg.src = url;
}

function removeImage() {
  hasImage = false;
  previewImg.src      = '';
  uploadZoneEl.hidden = false;
  previewPanel.hidden = true;
  exportPanel.hidden  = true;
  hintPanel.hidden    = false;
  cssOutEl.textContent = 'filter: none;';
}

initUploadZone({
  dropEl: uploadZoneEl,
  fileEl,
  accept: 'image',
  onFiles: (files) => loadFile(files[0]),
  onDelete: removeImage,
});


FILTERS.forEach(f => {
  const rangeEl = $(`[data-filter="${f.key}"]`);
  const valEl   = $(`[data-val="${f.key}"]`);
  on(rangeEl, 'input', () => {
    valEl.textContent = `${rangeEl.value}${f.unit}`;
    $$('[data-preset-idx]').forEach(b => b.classList.remove('is-active'));
    update();
  });
});

on($('[data-action="copy-css"]'), 'click', () => {
  copyText(cssOutEl.textContent);
  showToast('已复制', { type: 'success' });
});

on($('[data-action="reset"]'), 'click', () => {
  applySliderVals(PRESETS[0].vals);
  $('[data-preset-idx="0"]')?.classList.add('is-active');
});

on($('[data-action="export"]'), 'click', exportImg);

on(document, 'click', e => {
  const btn = e.target.closest('[data-fmt]');
  if (!btn) return;
  $$('[data-fmt]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fmt = btn.dataset.fmt;
});

renderPresets();
$('[data-preset-idx="0"]')?.classList.add('is-active');
update();
