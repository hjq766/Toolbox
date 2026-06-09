import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, delegate, debounce, h } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob, downloadText } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import {
  buildRecipients,
  createOutputFileName,
  createMismatchReport,
  drawBatchWatermark,
  generateBatchWatermarkZip,
  getMismatchInfo,
  parseList,
  validateTemplates,
} from '../_shared/pdf-watermark-batch.js';

mountToolHeader();

const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pdfFileBytes = null;
let currentPage = 1;
let currentDensity = 'medium';
let currentSecondaryMode = 'row';
let currentReport = '';
let currentRenderTask = null;

const dropEl = $('[data-drop]');
const fileEl = $('[data-file]');
const asideEl = $('aside');
const previewPanel = $('[data-preview-panel]');
const previewWrap = $('[data-preview-wrap]');
const canvasEl = $('[data-canvas]');
const ctx = canvasEl.getContext('2d');
const pageInfo = $('[data-page-info]');
const prevBtn = $('[data-nav="prev"]');
const nextBtn = $('[data-nav="next"]');
const genBtn = $('[data-action="generate"]');
const clearBtn = $('[data-action="clear"]');
const progEl = $('[data-progress]');
const barEl = $('[data-bar]');
const progText = $('[data-progress-text]');
const reportBadge = $('[data-report-badge]');
const reportBtn = $('[data-action="download-report"]');
const secondaryShareControl = $('[data-secondary-share-control]');
const listEmpty = $('[data-list-empty]');
const listTable = $('[data-list-table]');
const outputCount = $('[data-output-count]');
const confirmModal = $('[data-confirm-modal]');

const namesEl = $('[data-names]');
const secondaryNamesEl = $('[data-secondary-names]');
const primaryTemplateEl = $('[data-primary-template]');
const primaryColorEl = $('[data-primary-color]');
const primarySizeEl = $('[data-primary-size]');
const primaryOpacityEl = $('[data-primary-opacity]');
const secondaryTemplateEl = $('[data-secondary-template]');
const secondaryColorEl = $('[data-secondary-color]');
const secondarySizeEl = $('[data-secondary-size]');
const secondaryOpacityEl = $('[data-secondary-opacity]');
const lineSpacingEl = $('[data-line-spacing]');
const useSecondaryEl = $('[data-use-secondary]');
const useFixedEl = $('[data-use-fixed]');
const fixedTextEl = $('[data-fixed-text]');
const fixedColorEl = $('[data-fixed-color]');
const fixedSizeEl = $('[data-fixed-size]');
const fixedOpacityEl = $('[data-fixed-opacity]');
const fixedLineSpacingEl = $('[data-fixed-line-spacing]');
const filenamePatternEl = $('[data-filename-pattern]');
const angleInputEl = $('[data-angle-input]');
const angleValEl = $('[data-angle-val]');
const secondaryPanelEl = $('[data-secondary-panel]');
const secondaryStyleEl = $('[data-secondary-style]');
const fixedPanelEl = $('[data-fixed-panel]');
const fixedStyleEl = $('[data-fixed-style]');
const secondarySharedEl = $('[data-secondary-shared]');
const nameCountEl = $('[data-name-count]');
const secondaryCountEl = $('[data-secondary-count]');

const debouncedRender = debounce(renderPreview, 140);

const _colorCtx = document.createElement('canvas').getContext('2d');

function resolveColor(tokenName) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  const fallback = getComputedStyle(document.body).color;
  _colorCtx.fillStyle = fallback;
  _colorCtx.fillStyle = raw || fallback;
  return _colorCtx.fillStyle;
}

function initPdfJs() {
  const lib = window['pdfjs-dist/build/pdf'];
  if (!lib) {
    showToast('pdf.js 尚未加载，请稍后重试', { type: 'warn' });
    return null;
  }
  lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return lib;
}

function getOptions() {
  return {
    primaryTemplate: primaryTemplateEl.value.trim(),
    primaryColor: primaryColorEl.value,
    primarySize: Number(primarySizeEl.value),
    primaryOpacity: Number(primaryOpacityEl.value),
    useSecondary: useSecondaryEl.checked,
    secondaryMode: currentSecondaryMode,
    secondaryTemplate: secondaryTemplateEl.value.trim(),
    secondaryColor: secondaryColorEl.value,
    secondarySize: Number(secondarySizeEl.value),
    secondaryOpacity: Number(secondaryOpacityEl.value),
    lineSpacing: Number(lineSpacingEl.value),
    useFixed: useFixedEl.checked,
    fixedText: fixedTextEl.value.trim(),
    fixedColor: fixedColorEl.value,
    fixedSize: Number(fixedSizeEl.value),
    fixedOpacity: Number(fixedOpacityEl.value),
    fixedLineSpacing: Number(fixedLineSpacingEl.value),
    filenamePattern: filenamePatternEl.value.trim() || '水印_{{name}}.pdf',
    density: currentDensity,
    angle: Number(angleInputEl.value),
  };
}

function getRecipients(options) {
  const names = parseList(namesEl.value);
  const secondaryItems = parseList(secondaryNamesEl.value);
  return {
    names,
    secondaryItems,
    recipients: buildRecipients(names, secondaryItems, options || getOptions()),
  };
}

function updateCounts(data) {
  const { names, secondaryItems } = data || getRecipients();
  nameCountEl.textContent = `${names.length} 个主水印`;
  secondaryCountEl.textContent = `${secondaryItems.length} 个副水印`;
  genBtn.disabled = !pdfFileBytes || !names.length;
  clearBtn.disabled = !pdfFileBytes && !names.length && !secondaryItems.length;
}

function updateReport(data, options) {
  const { names, secondaryItems, recipients } = data;
  const mismatch = getMismatchInfo(recipients);
  const ignoredSecondaryCount = getIgnoredSecondaryCount(secondaryItems, options);
  currentReport = createMismatchReport(mismatch, {
    primaryCount: names.length,
    secondaryCount: secondaryItems.length,
    secondaryMode: options.secondaryMode,
    ignoredSecondaryCount,
  });

  reportBadge.hidden = !mismatch.length && !ignoredSecondaryCount;
  reportBtn.hidden = !mismatch.length && !ignoredSecondaryCount;
  if (mismatch.length && ignoredSecondaryCount) reportBadge.textContent = `缺失 ${mismatch.length} · 忽略 ${ignoredSecondaryCount}`;
  else if (mismatch.length) reportBadge.textContent = `缺失 ${mismatch.length}`;
  else if (ignoredSecondaryCount) reportBadge.textContent = `忽略 ${ignoredSecondaryCount}`;
}

function updateListPreview(data, options) {
  const { recipients } = data;
  outputCount.textContent = `预计 ${recipients.length} 份`;
  listTable.replaceChildren();
  listTable.hidden = !recipients.length;
  listEmpty.hidden = !!recipients.length;
  if (!recipients.length) return;

  const fileNames = recipients.map(item => createOutputFileName(item, options.filenamePattern));
  const duplicates = findDuplicates(fileNames);
  const table = h('table', { class: 'data-table' }, [
    h('thead', {}, [
      h('tr', {}, [
        h('th', {}, '#'),
        h('th', {}, '文件名'),
        h('th', {}, '主水印'),
        h('th', {}, '副水印'),
        h('th', {}, '状态'),
      ]),
    ]),
    h('tbody', {}, recipients.map((item, index) => {
      const fileName = fileNames[index];
      const isDuplicate = duplicates.has(fileName);
      const hasMissingSecondary = item.hasMissingSecondary;
      const missingText = options.secondaryMode === 'shared' ? '缺少共用副水印' : '缺失副水印';
      const statusText = isDuplicate ? '文件名重复' : hasMissingSecondary ? missingText : '就绪';
      const statusClass = isDuplicate || hasMissingSecondary ? 'is-fail' : 'is-done';
      return h('tr', {}, [
        h('td', {}, String(index + 1)),
        h('td', { class: 'u-mono u-break' }, fileName),
        h('td', { class: 'u-break' }, item.primaryText),
        h('td', { class: 'u-break' }, item.secondaryText || '—'),
        h('td', {}, h('span', { class: `status-badge ${statusClass}` }, statusText)),
      ]);
    })),
  ]);
  listTable.appendChild(table);
}

function updatePageNav() {
  if (!pdfDoc) return;
  pageInfo.textContent = `第 ${currentPage} 页，共 ${pdfDoc.numPages} 页`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= pdfDoc.numPages;
}

async function loadPdf(file) {
  if (!file || file.type !== 'application/pdf') {
    showToast('请选择有效的 PDF 文件', { type: 'warn' });
    return;
  }
  const pdfjsLib = initPdfJs();
  if (!pdfjsLib) return;

  try {
    if (pdfDoc) pdfDoc.destroy();
    pdfFileBytes = await file.arrayBuffer();
    pdfDoc = await pdfjsLib.getDocument({ data: pdfFileBytes.slice(0) }).promise;
    currentPage = 1;
    dropEl.hidden = true;
    previewPanel.hidden = false;
    previewWrap.hidden = false;
    asideEl.classList.remove('is-inactive');
    updatePageNav();
    await renderPreview();
    showToast('PDF 已载入');
  } catch (err) {
    console.error(err);
    showToast('PDF 加载失败', { type: 'error' });
  }
}

async function renderPreview() {
  const options = getOptions();
  const data = getRecipients(options);
  updateCounts(data);
  updateReport(data, options);
  updateListPreview(data, options);
  if (!pdfDoc) return;

  if (currentRenderTask) {
    try { currentRenderTask.cancel(); } catch {}
    currentRenderTask = null;
  }

  try {
    const page = await pdfDoc.getPage(currentPage);
    const vp0 = page.getViewport({ scale: 1, rotation: 0 });
    const wrap = canvasEl.parentElement;
    const maxW = Math.max(200, wrap.offsetWidth - 20);
    const maxH = 560;
    const scale = Math.min(maxW / vp0.width, maxH / vp0.height, 2);
    const vp = page.getViewport({ scale, rotation: 0 });

    canvasEl.width = vp.width;
    canvasEl.height = vp.height;
    ctx.clearRect(0, 0, vp.width, vp.height);

    currentRenderTask = page.render({ canvasContext: ctx, viewport: vp });
    await currentRenderTask.promise;
    currentRenderTask = null;

    if (data.recipients[0]) drawBatchWatermark(ctx, vp.width, vp.height, data.recipients[0], options);
  } catch (err) {
    if (err?.name === 'RenderingCancelledException') return;
    console.error(err);
    showToast('预览渲染失败', { type: 'error' });
  }
}

function bindRange(input, valEl, suffix) {
  on(input, 'input', () => {
    valEl.textContent = `${input.value}${suffix}`;
    debouncedRender();
  });
}

initUploadZone({ dropEl, fileEl, onFiles: files => loadPdf(files[0]), accept: 'pdf' });

primaryColorEl.value = resolveColor('--color-brand');
secondaryColorEl.value = resolveColor('--fg-muted');
fixedColorEl.value = resolveColor('--color-brand');

on(prevBtn, 'click', () => {
  if (!pdfDoc || currentPage <= 1) return;
  currentPage--;
  updatePageNav();
  renderPreview();
});

on(nextBtn, 'click', () => {
  if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
  currentPage++;
  updatePageNav();
  renderPreview();
});

[namesEl, primaryTemplateEl, secondaryNamesEl, secondaryTemplateEl, fixedTextEl, primaryColorEl, secondaryColorEl, fixedColorEl, filenamePatternEl]
  .forEach(el => on(el, 'input', debouncedRender));

[
  [primarySizeEl, $('[data-primary-size-val]'), 'px'],
  [primaryOpacityEl, $('[data-primary-opacity-val]'), '%'],
  [secondarySizeEl, $('[data-secondary-size-val]'), 'px'],
  [secondaryOpacityEl, $('[data-secondary-opacity-val]'), '%'],
  [lineSpacingEl, $('[data-line-spacing-val]'), 'px'],
  [fixedSizeEl, $('[data-fixed-size-val]'), 'px'],
  [fixedOpacityEl, $('[data-fixed-opacity-val]'), '%'],
  [fixedLineSpacingEl, $('[data-fixed-line-spacing-val]'), 'px'],
  [angleInputEl, angleValEl, '°'],
].forEach(([input, valEl, suffix]) => bindRange(input, valEl, suffix));

on(useSecondaryEl, 'change', e => {
  secondaryPanelEl.hidden = !e.target.checked;
  secondaryStyleEl.hidden = !e.target.checked;
  secondaryShareControl.hidden = !e.target.checked;
  debouncedRender();
});

on(secondarySharedEl, 'change', e => {
  currentSecondaryMode = e.target.checked ? 'shared' : 'row';
  debouncedRender();
});

on(useFixedEl, 'change', e => {
  fixedPanelEl.hidden = !e.target.checked;
  fixedStyleEl.hidden = !e.target.checked;
  debouncedRender();
});

delegate($('[data-density-row]'), 'click', '[data-density]', (e, btn) => {
  currentDensity = btn.dataset.density;
  $$('[data-density]', $('[data-density-row]')).forEach(item => item.classList.toggle('active', item === btn));
  debouncedRender();
});

delegate($('[data-angle-row]'), 'click', '[data-angle]', (e, btn) => {
  const value = Number(btn.dataset.angle);
  angleInputEl.value = value;
  angleValEl.textContent = `${value}°`;
  $$('[data-angle]', $('[data-angle-row]')).forEach(item => item.classList.toggle('active', item === btn));
  debouncedRender();
});

on(reportBtn, 'click', () => {
  if (!currentReport) return;
  downloadText(currentReport, 'pdf_watermark_match_report.txt');
});

on(genBtn, 'click', () => {
  if (!pdfFileBytes) return;
  const options = getOptions();
  const validation = validateTemplates(options);
  if (validation) {
    showToast(validation, { type: 'warn' });
    return;
  }

  const { names, recipients } = getRecipients(options);
  if (!names.length) {
    showToast('请先输入主水印名单', { type: 'warn' });
    return;
  }

  const fileNames = recipients.map(item => createOutputFileName(item, options.filenamePattern));
  if (findDuplicates(fileNames).size) {
    showToast('存在重复文件名，请先调整命名规则或名单', { type: 'warn' });
    return;
  }
  openConfirmModal(recipients, fileNames);
});

on($('[data-confirm-cancel]'), 'click', closeConfirmModal);
on(confirmModal, 'click', e => { if (e.target === confirmModal) closeConfirmModal(); });
on(document, 'keydown', e => {
  if (e.key === 'Escape' && !confirmModal.hidden) closeConfirmModal();
});

on($('[data-confirm-ok]'), 'click', async () => {
  closeConfirmModal();
  await runGenerate();
});

async function runGenerate() {
  const options = getOptions();
  const { recipients } = getRecipients(options);
  genBtn.disabled = true;
  progEl.hidden = false;
  barEl.style.width = '0%';
  progText.textContent = '准备生成...';

  try {
    const blob = await generateBatchWatermarkZip(pdfFileBytes, recipients, options, progress => {
      barEl.style.width = `${progress.percent}%`;
      progText.textContent = `正在生成 ${progress.done} / ${progress.total}：${progress.recipient.name}`;
    });
    downloadBlob(blob, 'pdf_batch_watermark.zip', 'application/zip');
    showToast(`已生成 ${recipients.length} 份 PDF`, { type: 'success' });
  } catch (err) {
    console.error(err);
    showToast(err?.message || '批量水印生成失败', { type: 'error' });
  } finally {
    genBtn.disabled = false;
    progEl.hidden = true;
    renderPreview();
  }
}

function openConfirmModal(recipients, fileNames) {
  const options = getOptions();
  const { secondaryItems } = getRecipients(options);
  const mismatch = getMismatchInfo(recipients);
  const ignoredSecondaryCount = getIgnoredSecondaryCount(secondaryItems, options);
  $('[data-confirm-count]').textContent = recipients.length;
  $('[data-confirm-secondary]').textContent = options.secondaryMode === 'shared' && options.useSecondary
    ? `共用 ${secondaryItems.length ? 1 : 0} 条`
    : secondaryItems.length;
  $('[data-confirm-missing]').textContent = mismatch.length;
  $('[data-confirm-pages]').textContent = pdfDoc?.numPages || 0;
  $('[data-confirm-pattern]').textContent = options.filenamePattern;
  $('[data-confirm-first-file]').textContent = fileNames[0] || '—';
  $('[data-confirm-note]').textContent = mismatch.length
    ? options.secondaryMode === 'shared'
      ? '共用副水印为空，确认后仍会生成，只是不绘制副水印内容。'
      : '存在缺失副水印的文件，确认后仍会生成，只是不绘制副水印内容。'
    : ignoredSecondaryCount
      ? `当前为共用副水印模式，只使用第一条，额外 ${ignoredSecondaryCount} 条不会参与生成。`
    : '请确认名单、命名规则和预览效果无误后再生成 ZIP。';
  confirmModal.hidden = false;
  requestAnimationFrame(() => confirmModal.classList.add('is-open'));
}

function closeConfirmModal() {
  confirmModal.classList.remove('is-open');
  setTimeout(() => { confirmModal.hidden = true; }, 160);
}

on(clearBtn, 'click', () => {
  if (pdfDoc) pdfDoc.destroy();
  pdfDoc = null;
  pdfFileBytes = null;
  currentPage = 1;
  currentReport = '';
  fileEl.value = '';
  namesEl.value = '';
  secondaryNamesEl.value = '';
  fixedTextEl.value = '';
  filenamePatternEl.value = '水印_{{name}}.pdf';
  useSecondaryEl.checked = true;
  useFixedEl.checked = false;
  currentSecondaryMode = 'row';
  secondarySharedEl.checked = false;
  secondaryPanelEl.hidden = false;
  secondaryStyleEl.hidden = false;
  secondaryShareControl.hidden = false;
  fixedPanelEl.hidden = true;
  fixedStyleEl.hidden = true;
  dropEl.hidden = false;
  previewPanel.hidden = true;
  previewWrap.hidden = true;
  reportBadge.hidden = true;
  reportBtn.hidden = true;
  asideEl.classList.add('is-inactive');
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  renderPreview();
  showToast('已清空');
});

function findDuplicates(items) {
  const seen = new Set();
  const duplicates = new Set();
  items.forEach(item => {
    if (seen.has(item)) duplicates.add(item);
    seen.add(item);
  });
  return duplicates;
}

function getIgnoredSecondaryCount(secondaryItems, options) {
  if (!options.useSecondary || options.secondaryMode !== 'shared') return 0;
  return Math.max(0, secondaryItems.length - 1);
}

renderPreview();
