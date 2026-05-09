/* 0. 导入 */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, delegate, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { drawTextWatermark, drawImageWatermark } from '../_shared/watermark-core.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { initWatermarkUI } from '../_shared/watermark-ui.js';

mountToolHeader();

/* 1. 常量 */
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* 2. 状态 */
let pdfDoc        = null;
let pdfFileBytes  = null;
let currentPage   = 1;
let selectedPages = [];

/* 3. DOM 引用 */
const dropEl    = $('[data-drop]');
const fileEl    = $('[data-file]');
const previewEl = $('[data-preview]');
const canvasEl  = $('[data-canvas]');
const ctx       = canvasEl.getContext('2d');
const pageInfo  = $('[data-page-info]');
const prevBtn   = $('[data-nav="prev"]');
const nextBtn   = $('[data-nav="next"]');
const dlBtn     = $('[data-action="download"]');
const clearBtn  = $('[data-action="clear"]');
const progEl    = $('[data-progress]');
const barEl     = $('[data-bar]');
const progText  = $('[data-progress-text]');

/* 4. 共享水印 UI */
const debouncedRender = debounce(() => renderPage(currentPage), 200);
const wmUI = initWatermarkUI({ onChanged: debouncedRender });

/* 5. 工具函数 */

function initPdfJs() {
  const lib = window['pdfjs-dist/build/pdf'];
  if (!lib) { showToast('pdf.js 尚未加载，请稍后重试', { type: 'warn' }); return null; }
  lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return lib;
}

async function renderPage(num) {
  if (!pdfDoc) return;
  try {
    const page = await pdfDoc.getPage(num);
    const vp0  = page.getViewport({ scale: 1.0 });
    const wrap = canvasEl.parentElement;
    const maxW = wrap.offsetWidth - 20;
    const maxH = 540;
    const scale = Math.min(maxW / vp0.width, maxH / vp0.height, 2);
    const vp = page.getViewport({ scale });
    canvasEl.width = vp.width;
    canvasEl.height = vp.height;
    ctx.clearRect(0, 0, vp.width, vp.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    const opts = wmUI.getOpts(vp.width, vp.height);
    if (wmUI.type === 'text' && opts.text)         drawTextWatermark(ctx, opts);
    else if (wmUI.type === 'image' && wmUI.image)  drawImageWatermark(ctx, opts);
  } catch (err) { console.error(err); showToast('页面渲染失败', { type: 'error' }); }
}

function updatePageNav() {
  if (!pdfDoc) return;
  pageInfo.textContent = `第 ${currentPage} 页，共 ${pdfDoc.numPages} 页`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= pdfDoc.numPages;
}

function updatePageRange() {
  if (!pdfDoc) return;
  const rangeType = $('[data-range-type] .active')?.dataset.range;
  if (rangeType === 'all') {
    selectedPages = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);
    return;
  }
  const raw = $('[data-page-range]')?.value.trim() || '';
  selectedPages = [];
  if (!raw) { selectedPages = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1); return; }
  raw.split(',').forEach(part => {
    const sp = part.trim().split('-');
    if (sp.length === 1) {
      const p = parseInt(sp[0]);
      if (p > 0 && p <= pdfDoc.numPages) selectedPages.push(p);
    } else if (sp.length === 2) {
      const a = parseInt(sp[0]), b = parseInt(sp[1]);
      if (a > 0 && b >= a) for (let i = a; i <= b && i <= pdfDoc.numPages; i++) selectedPages.push(i);
    }
  });
  selectedPages = [...new Set(selectedPages)].sort((a, b) => a - b);
}

async function loadPdf(file) {
  if (!file || file.type !== 'application/pdf') { showToast('请选择有效的 PDF 文件', { type: 'warn' }); return; }
  const pdfjsLib = initPdfJs();
  if (!pdfjsLib) return;
  try {
    if (pdfDoc) pdfDoc.destroy();
    const rawBytes = await file.arrayBuffer();
    pdfFileBytes = rawBytes.slice(0);
    pdfDoc = await pdfjsLib.getDocument({ data: rawBytes }).promise;
    currentPage = 1;
    updatePageRange();
    dropEl.hidden = true;
    previewEl.hidden = false;
    dlBtn.disabled = false;
    clearBtn.disabled = false;
    updatePageNav();
    renderPage(1);
  } catch (err) { console.error(err); showToast('PDF 加载失败', { type: 'error' }); }
}

/* 6. 事件绑定 */
initUploadZone({ dropEl, fileEl, onFiles: files => loadPdf(files[0]), accept: 'pdf' });

on(prevBtn, 'click', () => { if (currentPage > 1) { currentPage--; updatePageNav(); renderPage(currentPage); } });
on(nextBtn, 'click', () => { if (pdfDoc && currentPage < pdfDoc.numPages) { currentPage++; updatePageNav(); renderPage(currentPage); } });

/* 页面范围 */
delegate($('[data-range-type]'), 'click', '[data-range]', (e, btn) => {
  $$('.btn', $('[data-range-type]')).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const custom = $('[data-custom-range]');
  if (custom) custom.hidden = btn.dataset.range !== 'custom';
  updatePageRange();
});

on($('[data-page-range]'), 'input', updatePageRange);

delegate(document.body, 'click', '[data-quick]', (e, btn) => {
  if (!pdfDoc) return;
  const type = btn.dataset.quick;
  const pages = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    if ((type === 'odd' && i % 2 === 1) || (type === 'even' && i % 2 === 0)) pages.push(i);
  }
  const rangeEl = $('[data-page-range]');
  if (rangeEl) rangeEl.value = pages.join(',');
  updatePageRange();
});

/* 下载 PDF */
on(dlBtn, 'click', async () => {
  if (!pdfDoc || !pdfFileBytes) return;
  if (typeof PDFLib === 'undefined') { showToast('pdf-lib 尚未加载，请稍后重试', { type: 'warn' }); return; }
  updatePageRange();
  if (!selectedPages.length) { showToast('请选择要添加水印的页面', { type: 'warn' }); return; }
  const opts = wmUI.getOpts(0, 0);
  if (wmUI.type === 'text' && !opts.text.trim()) { showToast('请输入水印文字', { type: 'warn' }); return; }
  if (wmUI.type === 'image' && !wmUI.image) { showToast('请上传水印图片', { type: 'warn' }); return; }

  dlBtn.disabled = true;
  progEl.hidden = false;
  barEl.style.width = '0%';

  try {
    const existingPdf = await PDFLib.PDFDocument.load(pdfFileBytes);
    const newPdf      = await PDFLib.PDFDocument.create();

    for (let i = 0; i < selectedPages.length; i++) {
      const pageNum = selectedPages[i];
      const [page]  = await newPdf.copyPages(existingPdf, [pageNum - 1]);
      newPdf.addPage(page);
      const { width, height } = page.getSize();

      const tmp = document.createElement('canvas');
      tmp.width = width;
      tmp.height = height;
      const tCtx = tmp.getContext('2d');
      const pageOpts = { ...opts, canvasW: width, canvasH: height };
      if (wmUI.type === 'text')       drawTextWatermark(tCtx, pageOpts);
      else if (wmUI.type === 'image') drawImageWatermark(tCtx, pageOpts);

      const wmBytes = await fetch(tmp.toDataURL('image/png')).then(r => r.arrayBuffer());
      const wmImg   = await newPdf.embedPng(wmBytes);
      page.drawImage(wmImg, { x: 0, y: 0, width, height });

      const pct = Math.round(((i + 1) / selectedPages.length) * 100);
      barEl.style.width = pct + '%';
      progText.textContent = `正在处理 ${i + 1} / ${selectedPages.length} 页`;
    }

    const pdfBytes = await newPdf.save();
    downloadBlob(pdfBytes, 'watermarked.pdf', 'application/pdf');
    showToast('PDF 导出成功');
  } catch (err) { console.error(err); showToast('PDF 导出失败', { type: 'error' }); }
  finally { dlBtn.disabled = false; progEl.hidden = true; }
});

/* 清空水印 */
on(clearBtn, 'click', () => {
  wmUI.clear();
  debouncedRender();
  showToast('已清空水印');
});
