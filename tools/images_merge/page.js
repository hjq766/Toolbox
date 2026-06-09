import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce, escapeHtml } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { PRESETS } from './presets.js';
import { parseCssColor } from '../../public/scripts/utils/color.js';

mountToolHeader();

const MAX_CANVAS_AREA = 16000 * 16000;
const MAX_PREVIEW_AREA = 2400 * 2400;
const MAX_PREVIEW_SIDE = 2800;
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|avif)$/i;
const MIME_MAP = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const FORMAT_LABEL = { png: 'PNG', jpg: 'JPG', webp: 'WebP' };
const TEMPLATE_PRESETS = PRESETS.filter(p => p.slots > 0);
const DEFAULT_BG_COLOR = getTokenColorAsHex('--bg-surface');
const DEFAULT_TITLE_COLOR = getTokenColorAsHex('--fg-strong');
const FILE_NAME_COLLATOR = new Intl.Collator('zh-Hans-CN', { numeric: true, sensitivity: 'base' });

const els = {
  drop: $('[data-drop]'),
  dropTitle: $('[data-drop-title]'),
  dropHint: $('[data-drop-hint]'),
  file: $('[data-file]'),
  slotFile: $('[data-slot-file]'),
  templateWorkbench: $('[data-template-workbench]'),
  templateTitle: $('[data-template-title]'),
  templateDesc: $('[data-template-desc]'),
  templateTotal: $('[data-template-total]'),
  freePreviewSlot: $('[data-free-preview-slot]'),
  slotCount: $('[data-slot-count]'),
  slotsStage: $('[data-slots-stage]'),
  slots: $('[data-slots]'),
  strip: $('[data-strip]'),
  thumbs: $('[data-thumbs]'),
  count: $('[data-count]'),
  preview: $('[data-preview]'),
  previewTitle: $('[data-preview-title]'),
  previewBadge: $('[data-preview-badge]'),
  empty: $('[data-empty]'),
  workflowOpts: $('[data-workflow-opts]'),
  freePanels: $$('[data-free-panel]'),
  presets: $('[data-presets]'),
  modeOpts: $('[data-mode-opts]'),
  gridOpts: $('[data-grid-opts]'),
  cols: $('[data-cols]'),
  colsVal: $('[data-cols-val]'),
  cellSizeOpts: $('[data-cellsize-opts]'),
  templatePanels: $$('[data-template-panel]'),
  titleInput: $('[data-title-input]'),
  titleAlignOpts: $('[data-title-align-opts]'),
  alignPanel: $('[data-align-panel]'),
  gap: $('[data-gap]'),
  gapVal: $('[data-gap-val]'),
  padding: $('[data-padding]'),
  paddingVal: $('[data-padding-val]'),
  fit: $('[data-fit]'),
  alignX: $('[data-align-x]'),
  alignY: $('[data-align-y]'),
  bgColor: $('[data-bg-color]'),
  bgTransparent: $('[data-bg-transparent]'),
  formatOpts: $('[data-format-opts]'),
  qualityRow: $('[data-quality-row]'),
  quality: $('[data-quality]'),
  qualityVal: $('[data-quality-val]'),
  output: $('[data-output]'),
  exportWarning: $('[data-export-warning]'),
  download: $('[data-action="download"]'),
  copy: $('[data-action="copy"]'),
  clear: $('[data-action="clear"]'),
};

const state = {
  images: [],
  settings: {
    workflow: 'free',
    mode: 'horizontal',
    presetId: '',
    customLayout: null,
    slots: 0,
    cols: 2,
    gap: 4,
    padding: 0,
    fit: 'height',
    cellSize: 1200,
    alignX: 'center',
    alignY: 'center',
    titleText: '',
    titleAlign: 'center',
    bgColor: DEFAULT_BG_COLOR,
    transparent: false,
    format: 'png',
    quality: 0.92,
  },
};
let dragIndex = -1;
let slotTargetIndex = -1;

const debouncedRenderAll = debounce(renderAll, 60);

renderPresets();
syncControls();
updateRangeFill();
renderAll();

initUploadZone({
  dropEl: els.drop,
  fileEl: els.file,
  dirEl: $('[data-file-dir]'),
  accept: 'image',
  multiple: true,
  onFiles: handleFiles,
});

async function handleFiles(files) {
  let added = 0;
  for (const file of getSortedImageFiles(files)) {
    try {
      const entry = await loadImageEntry(file);
      if (insertImageEntry(entry)) added++;
      else URL.revokeObjectURL(entry.url);
    } catch {
      showToast(`${file.name} 加载失败，已跳过`, { type: 'warn' });
    }
  }
  if (!added) {
    showToast('没有可用的图片文件', { type: 'warn' });
    return;
  }
  clearInvalidPresetIfNeeded();
  renderAll();
}

function getSortedImageFiles(files) {
  return Array.from(files || [])
    .filter(file => file?.type?.startsWith('image/') || IMAGE_EXT_RE.test(file?.name || ''))
    .sort((a, b) => FILE_NAME_COLLATOR.compare(getFileSortName(a), getFileSortName(b)));
}

function getFileSortName(file) {
  return file.webkitRelativePath || file.name || '';
}

on(els.slotFile, 'change', async () => {
  const file = els.slotFile.files?.[0];
  els.slotFile.value = '';
  if (!file || slotTargetIndex < 0) return;
  try {
    const entry = await loadImageEntry(file);
    replaceSlotImage(slotTargetIndex, entry);
    renderAll();
  } catch {
    showToast(`${file.name} 加载失败，已跳过`, { type: 'warn' });
  } finally {
    slotTargetIndex = -1;
  }
});

function insertImageEntry(entry) {
  const slotCount = getActiveSlotCount();
  if (!slotCount) {
    state.images.push(entry);
    return true;
  }

  ensureSlotArray(slotCount);
  const emptyIndex = state.images.findIndex((item, idx) => idx < slotCount && !item);
  if (emptyIndex === -1) {
    showToast('当前模板槽位已满，多余图片已跳过', { type: 'warn' });
    return false;
  }
  state.images[emptyIndex] = entry;
  return true;
}

function replaceSlotImage(index, entry) {
  const slotCount = getActiveSlotCount();
  if (!slotCount || index >= slotCount) return;
  ensureSlotArray(slotCount);
  const old = state.images[index];
  if (old) URL.revokeObjectURL(old.url);
  state.images[index] = entry;
}

function loadImageEntry(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        file,
        img,
        url,
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}

function renderPresets() {
  els.templateTotal.textContent = `${TEMPLATE_PRESETS.length} 个`;
  els.presets.innerHTML = TEMPLATE_PRESETS.map(p => `
    <button class="preset-card" type="button" data-preset="${escapeHtml(p.id)}" style="--preset-thumb:44px;min-height:54px">
      ${renderPresetPreview(p)}
      <span class="preset-card-copy">
        <strong>${escapeHtml(p.name)}</strong>
        <span>${escapeHtml(p.desc || '')}</span>
      </span>
    </button>
  `).join('');
}

function renderPresetPreview(preset) {
  const matrix = getPresetPreviewMatrix(preset);
  const rows = matrix.length;
  const cols = Math.max(...matrix.map(row => row.length));
  const slots = [...new Set(matrix.flat())].filter(n => Number.isInteger(n) && n >= 0);
  const cells = slots.map(slot => {
    const rect = findMatrixRect(matrix, slot);
    if (!rect) return '';
    return `<i style="grid-column:${rect.col + 1} / span ${rect.cols};grid-row:${rect.row + 1} / span ${rect.rows};"></i>`;
  }).join('');
  return `<span class="mg-preset-preview" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells}</span>`;
}

function getPresetPreviewMatrix(preset) {
  if (preset.layout) return preset.layout;
  const cols = preset.cols || preset.slots || 1;
  const rows = preset.rows || Math.ceil(preset.slots / cols);
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const idx = row * cols + col;
      return idx < preset.slots ? idx : -1;
    })
  );
}

on(els.presets, 'click', e => {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  const preset = PRESETS.find(p => p.id === btn.dataset.preset);
  if (!preset) return;
  applyPreset(preset);
});

function applyPreset(preset) {
  state.settings.workflow = 'template';
  state.settings.presetId = preset.id;
  state.settings.mode = preset.mode;
  state.settings.customLayout = preset.layout || null;
  state.settings.slots = preset.slots || 0;
  if (preset.cols) state.settings.cols = preset.cols;
  if (Number.isFinite(preset.gap)) state.settings.gap = preset.gap;
  if (['original', 'height', 'width'].includes(state.settings.fit)) state.settings.fit = 'cover';
  if (preset.slots) ensureSlotArray(preset.slots);

  syncControls();
  clearInvalidPresetIfNeeded();
  renderAll();
}

on(els.workflowOpts, 'click', e => {
  const btn = e.target.closest('[data-workflow]');
  if (!btn) return;
  const workflow = btn.dataset.workflow;
  if (workflow === state.settings.workflow) return;

  if (workflow === 'template') {
    const preset = getActivePreset() || TEMPLATE_PRESETS.find(p => p.id === 'grid4') || TEMPLATE_PRESETS[0];
    if (preset) applyPreset(preset);
    return;
  }

  state.settings.workflow = 'free';
  state.settings.presetId = '';
  state.settings.customLayout = null;
  state.settings.slots = 0;
  if (state.settings.mode === 'custom') state.settings.mode = 'grid';
  state.images = getFilledImages();
  renderAll();
});

on(els.modeOpts, 'click', e => {
  const btn = e.target.closest('[data-dir]');
  if (!btn) return;
  state.settings.workflow = 'free';
  state.settings.mode = btn.dataset.dir;
  state.settings.presetId = '';
  state.settings.slots = 0;
  if (state.settings.mode !== 'custom') state.settings.customLayout = null;
  if (btn.dataset.dir === 'horizontal') state.settings.fit = 'height';
  else if (btn.dataset.dir === 'vertical') state.settings.fit = 'width';
  else if (btn.dataset.dir === 'grid') state.settings.fit = 'cover';
  state.images = getFilledImages();
  syncControls();
  renderAll();
});

on(els.cellSizeOpts, 'click', e => {
  const btn = e.target.closest('[data-cellsize]');
  if (!btn) return;
  state.settings.cellSize = Number(btn.dataset.cellsize);
  syncControls();
  renderAll();
});

on(els.titleInput, 'input', () => {
  state.settings.titleText = els.titleInput.value;
  debouncedRenderAll();
});

on(els.titleAlignOpts, 'click', e => {
  const btn = e.target.closest('[data-title-align]');
  if (!btn) return;
  state.settings.titleAlign = btn.dataset.titleAlign;
  syncControls();
  renderAll();
});

on(els.formatOpts, 'click', e => {
  const btn = e.target.closest('[data-fmt]');
  if (!btn) return;
  state.settings.format = btn.dataset.fmt;
  if (state.settings.format === 'jpg' && state.settings.transparent) {
    state.settings.transparent = false;
    showToast('JPG 不支持透明背景，已切换为当前背景色', { type: 'warn' });
  }
  syncControls();
  renderAll();
});

on(els.cols, 'input', () => {
  state.settings.cols = Number(els.cols.value);
  state.settings.presetId = '';
  syncControls();
  debouncedRenderAll();
});
on(els.gap, 'input', () => {
  state.settings.gap = Number(els.gap.value);
  syncControls();
  debouncedRenderAll();
});
on(els.padding, 'input', () => {
  state.settings.padding = Number(els.padding.value);
  syncControls();
  debouncedRenderAll();
});
on(els.fit, 'change', () => {
  state.settings.fit = els.fit.value;
  renderAll();
});
on(els.alignX, 'change', () => {
  state.settings.alignX = els.alignX.value;
  renderAll();
});
on(els.alignY, 'change', () => {
  state.settings.alignY = els.alignY.value;
  renderAll();
});
on(els.bgColor, 'input', () => {
  state.settings.bgColor = els.bgColor.value;
  debouncedRenderAll();
});
on(els.bgTransparent, 'change', () => {
  state.settings.transparent = els.bgTransparent.checked;
  renderAll();
});
on(els.quality, 'input', () => {
  state.settings.quality = Number(els.quality.value) / 100;
  syncControls();
});

on(els.thumbs, 'click', e => {
  const btn = e.target.closest('[data-remove]');
  if (!btn) return;
  const idx = Number(btn.dataset.remove);
  const [removed] = state.images.splice(idx, 1);
  if (removed) URL.revokeObjectURL(removed.url);
  clearInvalidPresetIfNeeded();
  renderAll();
});

on(els.slots, 'click', e => {
  const action = e.target.closest('[data-slot-action]');
  const slot = e.target.closest('[data-slot]');
  if (!slot) return;
  const idx = Number(slot.dataset.slot);

  if (action?.dataset.slotAction === 'clear') {
    const old = state.images[idx];
    if (old) URL.revokeObjectURL(old.url);
    state.images[idx] = null;
    renderAll();
    return;
  }

  slotTargetIndex = idx;
  els.slotFile.click();
});

on(els.thumbs, 'dragstart', e => {
  const card = e.target.closest('[data-idx]');
  if (!card) return;
  dragIndex = Number(card.dataset.idx);
  card.classList.add('is-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', card.dataset.idx);
});

on(els.thumbs, 'dragend', e => {
  e.target.closest('[data-idx]')?.classList.remove('is-dragging');
  dragIndex = -1;
  renderAll();
});

on(els.thumbs, 'dragover', e => {
  e.preventDefault();
  const over = e.target.closest('[data-idx]');
  if (!over || dragIndex < 0) return;
  const to = Number(over.dataset.idx);
  if (dragIndex === to) return;
  moveImage(dragIndex, to);
  dragIndex = to;
  renderAll({ keepPreview: true });
});

on(els.download, 'click', async () => {
  if (!getFilledImages().length) {
    showToast('请先添加图片', { type: 'warn' });
    return;
  }
  if (!confirmTemplateGaps('下载')) return;
  try {
    const canvas = buildCanvas();
    const blob = await canvasToBlob(canvas, getExportMime(), getExportQuality());
    downloadBlob(blob, getExportFileName());
    showToast('下载已开始', { type: 'success' });
  } catch (err) {
    showToast(err.message || '导出失败', { type: 'error' });
  }
});

on(els.copy, 'click', async () => {
  if (!getFilledImages().length) {
    showToast('请先添加图片', { type: 'warn' });
    return;
  }
  if (!confirmTemplateGaps('复制')) return;
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      throw new Error('当前浏览器不支持复制图片');
    }
    const canvas = buildCanvas();
    const blob = await canvasToBlob(canvas, 'image/png', 1);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('已复制到剪贴板', { type: 'success' });
  } catch (err) {
    showToast(err.message || '复制失败', { type: 'error' });
  }
});

on(els.clear, 'click', () => {
  for (const entry of getFilledImages()) URL.revokeObjectURL(entry.url);
  const slotCount = getActiveSlotCount();
  state.images = slotCount ? new Array(slotCount).fill(null) : [];
  renderAll();
});

function moveImage(from, to) {
  const [item] = state.images.splice(from, 1);
  state.images.splice(to, 0, item);
}

function clearInvalidPresetIfNeeded() {
  const preset = PRESETS.find(p => p.id === state.settings.presetId);
  if (!preset || !preset.layout || !preset.slots || state.images.length <= preset.slots) return;
  state.settings.presetId = '';
  state.settings.customLayout = null;
  state.settings.slots = 0;
  state.settings.mode = 'grid';
}

function getActivePreset() {
  return PRESETS.find(p => p.id === state.settings.presetId) || null;
}

function getActiveSlotCount() {
  return state.settings.workflow === 'template' && state.settings.slots > 0 ? state.settings.slots : 0;
}

function ensureSlotArray(slotCount) {
  if (!slotCount) return;
  const dropped = state.images.slice(slotCount).filter(Boolean);
  for (const entry of dropped) URL.revokeObjectURL(entry.url);
  state.images = state.images.slice(0, slotCount);
  while (state.images.length < slotCount) state.images.push(null);
}

function getFilledImages() {
  return state.images.filter(Boolean);
}

function syncControls() {
  const s = state.settings;
  const isTemplate = s.workflow === 'template';
  $$('[data-workflow]', els.workflowOpts).forEach(btn => btn.classList.toggle('active', btn.dataset.workflow === s.workflow));
  $$('[data-dir]', els.modeOpts).forEach(btn => btn.classList.toggle('active', btn.dataset.dir === s.mode));
  $$('[data-fmt]', els.formatOpts).forEach(btn => btn.classList.toggle('active', btn.dataset.fmt === s.format));
  $$('[data-preset]', els.presets).forEach(btn => btn.classList.toggle('active', btn.dataset.preset === s.presetId));
  $$('[data-title-align]', els.titleAlignOpts).forEach(btn => btn.classList.toggle('active', btn.dataset.titleAlign === s.titleAlign));

  els.freePanels.forEach(panel => { panel.hidden = isTemplate; });
  els.templatePanels.forEach(panel => { panel.hidden = !isTemplate; });
  $$('[data-cellsize]', els.cellSizeOpts).forEach(btn => btn.classList.toggle('active', Number(btn.dataset.cellsize) === s.cellSize));
  els.alignPanel.hidden = s.fit === 'cover';
  els.templateWorkbench.hidden = !isTemplate;
  els.templateWorkbench.dataset.fit = s.fit;
  syncPreviewPanel(isTemplate);
  els.dropTitle.textContent = isTemplate ? '批量导入到模板' : '点击或拖拽图片到此处';
  els.dropHint.textContent = isTemplate ? '多选会自动填入当前模板空格，也可点击画布格子单独替换' : '支持多选、粘贴图片；拖动缩略图调整顺序';

  els.gridOpts.hidden = isTemplate || s.mode !== 'grid';
  els.cols.value = s.cols;
  els.colsVal.textContent = s.cols;
  els.gap.value = s.gap;
  els.gapVal.textContent = s.gap;
  els.padding.value = s.padding;
  els.paddingVal.textContent = s.padding;
  els.fit.value = s.fit;
  els.alignX.value = s.alignX;
  els.alignY.value = s.alignY;
  if (els.titleInput.value !== s.titleText) els.titleInput.value = s.titleText;
  els.bgColor.value = s.bgColor;
  els.bgColor.disabled = s.transparent;
  els.bgTransparent.disabled = s.format === 'jpg';
  els.bgTransparent.checked = s.transparent;
  els.quality.value = Math.round(s.quality * 100);
  els.qualityVal.textContent = `${els.quality.value}%`;
  els.qualityRow.hidden = s.format === 'png';
  updateRangeFill();
}

function syncPreviewPanel(isTemplate) {
  els.freePreviewSlot.hidden = isTemplate;
  if (els.preview.parentElement !== els.freePreviewSlot) {
    els.freePreviewSlot.appendChild(els.preview);
  }
  els.preview.dataset.context = 'free';
}

function updateRangeFill() {
  for (const input of [els.cols, els.gap, els.padding, els.quality]) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value || 0);
    input.style.setProperty('--range-pct', `${((val - min) / (max - min)) * 100}%`);
  }
}

function renderAll(options = {}) {
  syncControls();
  const layout = getCurrentLayout();
  renderSlots(layout);
  renderThumbs();
  renderPreview(options, layout);
  updateExportWarning(layout);
  updateActions(layout);
}

function renderSlots(layout) {
  const slotCount = getActiveSlotCount();
  if (!slotCount) {
    els.slots.innerHTML = '';
    els.slots.style.width = '';
    els.slots.style.height = '';
    syncEditableStage(null);
    els.slotCount.textContent = '0 / 0';
    return;
  }
  ensureSlotArray(slotCount);
  const preset = getActivePreset();
  const filled = getFilledImages().length;
  const scale = getEditorPreviewScale(layout);
  els.templateTitle.textContent = preset?.name || '模板拼图';
  els.templateDesc.textContent = preset?.desc || '点击格子放入图片';
  els.slotCount.textContent = `${filled}/${slotCount} 张 · ${Math.round(layout.width)} × ${Math.round(layout.height)}`;
  syncEditableStage(layout);
  els.slots.style.width = toCssPx(layout.width * scale);
  els.slots.style.height = toCssPx(layout.height * scale);
  els.slots.innerHTML = layout.placements.map((placement, idx) => {
    const entry = state.images[idx] || null;
    return `
    <button class="mg-slot" type="button" data-slot="${idx}" style="${getEditableSlotStyle(placement, scale)}" aria-label="${entry ? `替换第 ${idx + 1} 张图片` : `上传第 ${idx + 1} 张图片`}">
      <span class="mg-slot-index">${idx + 1}</span>
      ${entry ? `<img src="${entry.url}" alt="${escapeHtml(entry.name)}">` : `
        <span class="mg-slot-empty"><i data-lucide="plus"></i><span>点击放入图片</span></span>
      `}
      ${entry ? `
        <span class="mg-slot-actions">
          <span class="btn is-sm"><i data-lucide="refresh-cw"></i> 替换</span>
          <span class="remove-btn" data-slot-action="clear"><i data-lucide="trash-2"></i></span>
        </span>
      ` : ''}
    </button>
  `;
  }).join('') + renderEditableTitle(layout.title, scale);
  layout.placements.forEach((placement, idx) => {
    const img = els.slots.querySelector(`[data-slot="${idx}"] img`);
    if (img) img.setAttribute('style', getEditableImageStyle(placement, scale));
  });
  if (window.refreshIcons) window.refreshIcons(els.slots);
}

function syncEditableStage(layout) {
  if (!els.slotsStage) return;
  const s = state.settings;
  const transparent = s.transparent && s.format !== 'jpg';
  els.slots.style.setProperty('--mg-stage-bg', transparent ? 'transparent' : (s.bgColor || DEFAULT_BG_COLOR));
  els.slots.dataset.transparent = transparent ? 'true' : 'false';
  els.slotsStage.dataset.hasLayout = layout ? 'true' : 'false';
}

function getEditorPreviewScale(layout = null) {
  const baseScale = Math.min(Math.max(160 / (state.settings.cellSize || 1200), 0.08), 0.18);
  if (!layout?.width || !layout?.height) return baseScale;
  const sideScale = 980 / Math.max(layout.width, layout.height);
  return Math.min(baseScale, Math.max(sideScale, 0.05));
}

function getEditableSlotStyle(placement, scale) {
  const box = placement.box || placement;
  return [
    `left:${toCssPx(box.x * scale)}`,
    `top:${toCssPx(box.y * scale)}`,
    `width:${toCssPx(box.w * scale)}`,
    `height:${toCssPx(box.h * scale)}`,
  ].join(';');
}

function getEditableImageStyle(placement, scale) {
  const box = placement.box || placement;
  return [
    `left:${toCssPx((placement.x - box.x) * scale)}`,
    `top:${toCssPx((placement.y - box.y) * scale)}`,
    `width:${toCssPx(placement.w * scale)}`,
    `height:${toCssPx(placement.h * scale)}`,
    `object-fit:${placement.crop ? 'cover' : 'fill'}`,
  ].join(';');
}

function renderEditableTitle(title, scale) {
  if (!title) return '';
  const justify = { start: 'flex-start', center: 'center', end: 'flex-end' }[title.align] || 'center';
  const style = [
    'left:0',
    'top:0',
    `width:${toCssPx(title.width * scale)}`,
    `height:${toCssPx(title.height * scale)}`,
    `padding:0 ${toCssPx(title.inset * scale)}`,
    `font-size:${toCssPx(title.fontSize * scale)}`,
    `justify-content:${justify}`,
    `color:${title.color}`,
  ].join(';');
  return `<div class="mg-title-preview" style="${style}">${escapeHtml(title.text)}</div>`;
}

function toCssPx(value) {
  return `${Math.max(Math.round(value * 10) / 10, 0)}px`;
}

function renderThumbs() {
  const isSlotMode = getActiveSlotCount() > 0;
  const filled = getFilledImages();
  els.strip.hidden = isSlotMode || filled.length === 0;
  els.count.textContent = `${filled.length} 张`;
  els.thumbs.innerHTML = filled.map((entry, idx) => `
    <div class="mg-thumb" draggable="true" data-idx="${idx}">
      <img src="${entry.url}" alt="${escapeHtml(entry.name)}">
      <div class="mg-thumb-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
      <button class="remove-btn" type="button" data-remove="${idx}" aria-label="移除 ${escapeHtml(entry.name)}"><i data-lucide="x"></i></button>
    </div>
  `).join('');
  if (window.refreshIcons) window.refreshIcons(els.thumbs);
}

function renderPreview({ keepPreview = false } = {}, layout) {
  const filled = getFilledImages();
  const isTemplate = state.settings.workflow === 'template';

  els.preview.hidden = isTemplate;
  els.empty.hidden = filled.length > 0;
  if (!filled.length) {
    els.preview.querySelector('canvas')?.remove();
    els.output.hidden = true;
    updatePreviewHeader();
    return;
  }

  if (isTemplate) {
    els.preview.querySelector('canvas')?.remove();
    renderOutputInfo(layout);
    return;
  }

  if (keepPreview) {
    updatePreviewHeader();
    return;
  }

  try {
    const previewScale = getPreviewScale(layout.width, layout.height);
    const canvas = renderCanvas(layout, state.settings, { scale: previewScale });
    const existing = els.preview.querySelector('canvas');
    if (existing) existing.replaceWith(canvas);
    else els.preview.appendChild(canvas);
    renderOutputInfo(layout, previewScale);
  } catch (err) {
    els.preview.querySelector('canvas')?.remove();
    els.output.hidden = true;
    showToast(err.message || '预览生成失败', { type: 'error' });
  }
}

function updateActions(layout) {
  const hasImages = getFilledImages().length > 0;
  const canExport = hasImages && getCanvasLimitStatus(layout).ok;
  els.download.disabled = !canExport;
  els.copy.disabled = !canExport;
  els.clear.disabled = !hasImages;
}

function renderOutputInfo(sizeSource, previewScale = 1) {
  const w = Math.max(Math.round(sizeSource.width), 1);
  const h = Math.max(Math.round(sizeSource.height), 1);
  const s = state.settings;
  const slotStats = getTemplateSlotStats();
  const bg = s.transparent && s.format !== 'jpg' ? '透明' : s.bgColor.toUpperCase();
  const imageCount = slotStats.slotCount
    ? `${slotStats.filled} / ${slotStats.slotCount} 张`
    : `${getFilledImages().length} 张`;
  els.output.hidden = false;
  els.output.innerHTML = `
    <div><span>输出尺寸</span><strong>${w} × ${h}</strong></div>
    <div><span>格式</span><strong>${FORMAT_LABEL[s.format]}</strong></div>
    <div><span>图片数量</span><strong>${imageCount}</strong></div>
    <div><span>背景</span><strong>${bg}</strong></div>
    ${slotStats.empty ? `<div><span>空槽位</span><strong>${slotStats.empty} 个</strong></div>` : ''}
    ${previewScale < 0.999 ? `<div><span>预览比例</span><strong>${Math.round(previewScale * 100)}%</strong></div>` : ''}
  `;
  updatePreviewHeader({ width: w, height: h });
}

function updatePreviewHeader(size = null) {
  const isTemplate = state.settings.workflow === 'template';
  const slotStats = getTemplateSlotStats();
  const filled = getFilledImages().length;
  els.previewTitle.textContent = isTemplate ? '最终预览' : '实时预览';
  if (!filled) {
    els.previewBadge.textContent = '未添加图片';
    return;
  }
  const countText = slotStats.slotCount ? `${slotStats.filled}/${slotStats.slotCount} 张` : `${filled} 张`;
  const sizeText = size ? ` · ${size.width} × ${size.height}` : '';
  els.previewBadge.textContent = `${countText}${sizeText}`;
}

function updateExportWarning(layout) {
  const slotStats = getTemplateSlotStats();
  const warnings = [];
  const hasImages = getFilledImages().length > 0;
  const limitStatus = hasImages ? getCanvasLimitStatus(layout) : null;
  if (slotStats.filled && slotStats.empty) {
    warnings.push(`当前模板还有 ${slotStats.empty} 个空位，导出时会保留为${getEmptySlotLabel()}。`);
  }
  if (state.settings.format === 'jpg' && state.settings.transparent) {
    warnings.push('JPG 不支持透明背景，会使用当前背景色导出。');
  }
  if (limitStatus && !limitStatus.ok) {
    warnings.push(`输出尺寸 ${limitStatus.width} × ${limitStatus.height} 超过浏览器画布上限，请减少图片数量、降低单格尺寸或改用更小原图。`);
  } else if (limitStatus && getPreviewScale(limitStatus.width, limitStatus.height) < 0.999) {
    warnings.push('预览已按比例缩小以保持流畅，下载仍会按原始输出尺寸生成。');
  }
  els.exportWarning.hidden = !warnings.length;
  els.exportWarning.textContent = warnings.join(' ');
}

function confirmTemplateGaps(actionName) {
  const { empty } = getTemplateSlotStats();
  if (!empty) return true;
  return window.confirm(`当前模板还有 ${empty} 个空位，${actionName}后这些位置会保留为${getEmptySlotLabel()}。继续吗？`);
}

function getTemplateSlotStats() {
  const slotCount = getActiveSlotCount();
  if (!slotCount) {
    return { slotCount: 0, filled: getFilledImages().length, empty: 0 };
  }
  const filled = state.images.slice(0, slotCount).filter(Boolean).length;
  return { slotCount, filled, empty: Math.max(slotCount - filled, 0) };
}

function getEmptySlotLabel() {
  return state.settings.transparent && state.settings.format !== 'jpg' ? '透明区域' : '空白背景';
}

function buildCanvas() {
  const layout = getCurrentLayout();
  ensureCanvasSize(layout.width, layout.height);
  return renderCanvas(layout, state.settings);
}

function getCurrentLayout() {
  return applyTitleToLayout(computeLayout(state.images, state.settings), state.settings);
}

function computeLayout(images, settings) {
  const layoutImages = getLayoutImages(images);
  if (!layoutImages.length) return { width: 0, height: 0, placements: [] };
  const gap = settings.gap;
  const padding = settings.padding;
  const fixedCell = settings.workflow === 'template' ? (settings.cellSize || 1200) : null;

  if (settings.mode === 'custom' && settings.customLayout) {
    return computeCustomLayout(layoutImages, settings, settings.customLayout, fixedCell);
  }
  if (settings.mode === 'grid') {
    return computeGridLayout(layoutImages, settings, settings.cols, fixedCell);
  }
  if (settings.mode === 'vertical') {
    const cellW = fixedCell || getMaxWidth(layoutImages);
    const maxH = fixedCell || getMaxHeight(layoutImages);
    const units = layoutImages.map(img => getDrawSize(img, settings, cellW, maxH));
    const contentW = Math.max(...units.map(u => u.drawW));
    const contentH = units.reduce((sum, u) => sum + u.drawH, 0) + gap * (units.length - 1);
    let y = padding;
    const placements = layoutImages.map((img, idx) => {
      const unit = units[idx];
      const box = { x: padding, y, w: contentW, h: unit.drawH };
      y += unit.drawH + gap;
      return createPlacement(img, unit, box, settings);
    });
    return { width: contentW + padding * 2, height: contentH + padding * 2, placements };
  }

  const cellW = fixedCell || getMaxWidth(layoutImages);
  const cellH = fixedCell || getMaxHeight(layoutImages);
  const units = layoutImages.map(img => getDrawSize(img, settings, cellW, cellH));
  const contentW = units.reduce((sum, u) => sum + u.drawW, 0) + gap * (units.length - 1);
  const contentH = Math.max(...units.map(u => u.drawH));
  let x = padding;
  const placements = layoutImages.map((img, idx) => {
    const unit = units[idx];
    const box = { x, y: padding, w: unit.drawW, h: contentH };
    x += unit.drawW + gap;
    return createPlacement(img, unit, box, settings);
  });
  return { width: contentW + padding * 2, height: contentH + padding * 2, placements };
}

function applyTitleToLayout(layout, settings) {
  const text = getTitleText(settings.titleText);
  if (!text || !layout.width || !layout.height) return { ...layout, title: null };
  const width = Math.max(Math.round(layout.width), 1);
  const fontSize = getTitleFontSize(width);
  const inset = Math.max(settings.padding || 0, Math.round(fontSize * 0.9));
  const titleHeight = Math.round(fontSize * 2.25);
  const title = {
    text,
    align: settings.titleAlign,
    width,
    height: titleHeight,
    fontSize,
    inset,
    y: Math.round(titleHeight / 2),
    color: DEFAULT_TITLE_COLOR,
  };
  return {
    ...layout,
    height: layout.height + titleHeight,
    title,
    placements: layout.placements.map(placement => ({
      ...placement,
      y: placement.y + titleHeight,
      box: placement.box ? { ...placement.box, y: placement.box.y + titleHeight } : placement.box,
    })),
  };
}

function getTitleText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function getTitleFontSize(width) {
  return Math.round(Math.min(Math.max(width * 0.04, 32), 72));
}

function getLayoutImages(images) {
  const filled = images.filter(Boolean);
  if (!filled.length) return [];
  const slotCount = getActiveSlotCount();
  if (!slotCount) return filled;

  const fallbackW = getMaxWidth(filled);
  const fallbackH = getMaxHeight(filled);
  return images.slice(0, slotCount).map((entry, idx) => entry || {
    id: `empty-${idx}`,
    name: '',
    img: null,
    width: fallbackW,
    height: fallbackH,
    empty: true,
  });
}

function computeGridLayout(images, settings, cols, fixedCell = null) {
  const gap = settings.gap;
  const padding = settings.padding;
  const cellW = fixedCell || getMaxWidth(images);
  const cellH = fixedCell || getMaxHeight(images);
  const rows = Math.ceil(images.length / cols);
  const contentW = cols * cellW + Math.max(cols - 1, 0) * gap;
  const contentH = rows * cellH + Math.max(rows - 1, 0) * gap;
  const placements = images.map((img, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const box = {
      x: padding + col * (cellW + gap),
      y: padding + row * (cellH + gap),
      w: cellW,
      h: cellH,
    };
    return createPlacement(img, getDrawSize(img, settings, cellW, cellH), box, settings);
  });
  return { width: contentW + padding * 2, height: contentH + padding * 2, placements };
}

function computeCustomLayout(images, settings, matrix, fixedCell = null) {
  const gap = settings.gap;
  const padding = settings.padding;
  const cols = Math.max(...matrix.map(row => row.length));
  const rows = matrix.length;
  const cellW = fixedCell || getMaxWidth(images);
  const cellH = fixedCell || getMaxHeight(images);
  const placements = [];

  for (let idx = 0; idx < images.length; idx++) {
    const rect = findMatrixRect(matrix, idx);
    if (!rect) continue;
    const box = {
      x: padding + rect.col * (cellW + gap),
      y: padding + rect.row * (cellH + gap),
      w: rect.cols * cellW + (rect.cols - 1) * gap,
      h: rect.rows * cellH + (rect.rows - 1) * gap,
    };
    placements.push(createPlacement(images[idx], getDrawSize(images[idx], settings, box.w, box.h), box, settings));
  }

  return {
    width: cols * cellW + Math.max(cols - 1, 0) * gap + padding * 2,
    height: rows * cellH + Math.max(rows - 1, 0) * gap + padding * 2,
    placements,
  };
}

function findMatrixRect(matrix, target) {
  let minRow = Infinity, minCol = Infinity, maxRow = -1, maxCol = -1;
  matrix.forEach((row, r) => row.forEach((value, c) => {
    if (value !== target) return;
    minRow = Math.min(minRow, r);
    minCol = Math.min(minCol, c);
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }));
  if (maxRow < 0) return null;
  return { row: minRow, col: minCol, rows: maxRow - minRow + 1, cols: maxCol - minCol + 1 };
}

function getDrawSize(img, settings, boxW, boxH) {
  const ratio = img.width / img.height;
  if (settings.fit === 'contain') {
    const scale = Math.min(boxW / img.width, boxH / img.height, 1);
    return { drawW: Math.round(img.width * scale), drawH: Math.round(img.height * scale), crop: false };
  }
  if (settings.fit === 'cover') {
    return { drawW: boxW, drawH: boxH, crop: true };
  }
  if (settings.fit === 'width') {
    return { drawW: boxW, drawH: Math.round(boxW / ratio), crop: false };
  }
  if (settings.fit === 'height') {
    return { drawW: Math.round(boxH * ratio), drawH: boxH, crop: false };
  }
  return { drawW: img.width, drawH: img.height, crop: false };
}

function createPlacement(img, unit, box, settings) {
  const x = align(box.x, box.w, unit.drawW, settings.alignX);
  const y = align(box.y, box.h, unit.drawH, settings.alignY);
  return { entry: img, x, y, w: unit.drawW, h: unit.drawH, crop: unit.crop, box };
}

function align(start, outer, inner, mode) {
  if (mode === 'start') return start;
  if (mode === 'end') return start + outer - inner;
  return start + Math.floor((outer - inner) / 2);
}

function renderCanvas(layout, settings, options = {}) {
  const scale = Math.min(Math.max(Number(options.scale) || 1, 0.01), 1);
  const outputW = Math.max(Math.round(layout.width), 1);
  const outputH = Math.max(Math.round(layout.height), 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(Math.round(outputW * scale), 1);
  canvas.height = Math.max(Math.round(outputH * scale), 1);
  canvas.dataset.outputWidth = String(outputW);
  canvas.dataset.outputHeight = String(outputH);
  canvas.dataset.previewScale = String(scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.save();
  ctx.scale(scale, scale);

  const shouldFill = !settings.transparent || settings.format === 'jpg';
  if (shouldFill) {
    ctx.fillStyle = settings.bgColor || DEFAULT_BG_COLOR;
    ctx.fillRect(0, 0, outputW, outputH);
  }

  drawTitle(ctx, layout.title);

  for (const p of layout.placements) {
    if (!p.entry?.img) continue;
    if (p.crop) drawCover(ctx, p.entry.img, p.x, p.y, p.w, p.h);
    else ctx.drawImage(p.entry.img, p.x, p.y, p.w, p.h);
  }
  ctx.restore();
  return canvas;
}

function drawTitle(ctx, title) {
  if (!title) return;
  const alignMap = { start: 'left', center: 'center', end: 'right' };
  const xMap = { start: title.inset, center: title.width / 2, end: title.width - title.inset };
  ctx.save();
  ctx.fillStyle = title.color;
  ctx.font = `700 ${title.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = alignMap[title.align] || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title.text, xMap[title.align] ?? title.width / 2, title.y, title.width - title.inset * 2);
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

function getMaxWidth(images) {
  return Math.max(...images.map(img => img.width));
}

function getMaxHeight(images) {
  return Math.max(...images.map(img => img.height));
}

function ensureCanvasSize(width, height) {
  if (width * height > MAX_CANVAS_AREA) {
    throw new Error('输出尺寸过大，请减少图片数量或降低原图尺寸');
  }
}

function getCanvasLimitStatus(layout = getCurrentLayout()) {
  const width = Math.max(Math.round(layout.width), 1);
  const height = Math.max(Math.round(layout.height), 1);
  return { width, height, ok: width * height <= MAX_CANVAS_AREA };
}

function getPreviewScale(width, height) {
  const outputW = Math.max(Math.round(width), 1);
  const outputH = Math.max(Math.round(height), 1);
  const sideScale = Math.min(1, MAX_PREVIEW_SIDE / Math.max(outputW, outputH));
  const areaScale = Math.min(1, Math.sqrt(MAX_PREVIEW_AREA / Math.max(outputW * outputH, 1)));
  return Math.min(sideScale, areaScale);
}

function getExportFileName() {
  const s = state.settings;
  const count = getFilledImages().length;
  const ext = s.format;
  if (s.workflow === 'template') {
    const preset = getActivePreset();
    const label = preset?.name || '模板拼图';
    return `${label}_${count}张.${ext}`;
  }
  const modeLabel = { horizontal: '横拼', vertical: '竖拼', grid: '宫格' }[s.mode] || '拼接';
  return `${modeLabel}_${count}张.${ext}`;
}

function getExportMime() {
  return MIME_MAP[state.settings.format] || 'image/png';
}

function getExportQuality() {
  return state.settings.format === 'png' ? 1 : state.settings.quality;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('浏览器无法生成图片，请尝试降低尺寸'));
    }, mime, quality);
  });
}

function getTokenColorAsHex(tokenName) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = value || 'white';
  const normalized = ctx.fillStyle;
  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;
  return parseCssColor(normalized) ?? 'white';
}
