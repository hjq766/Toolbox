import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== pdf.js worker ========== */
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* ========== state ========== */
let pdfDoc    = null;
let pdfFile   = null;
let pageImgs  = [];   // dataURL[]
let pageIdx   = 0;
let viewMode  = 'single';

/* ========== DOM ========== */
const dropEl    = $('[data-drop]');
const fileEl    = $('[data-file]');
const progEl    = $('[data-progress]');
const barEl     = $('[data-bar]');
const progText  = $('[data-progress-text]');
const viewerEl  = $('[data-viewer]');
const singleEl  = $('[data-single]');
const gridEl    = $('[data-grid-view]');
const infoEl      = $('[data-info]');
const downloadBtn = $('[data-action="download"]');
const clearBtn    = $('[data-action="clear"]');
const curEl     = $('[data-cur]');
const totalEl   = $('[data-total]');
const prevBtn   = $('[data-action="prev"]');
const nextBtn   = $('[data-action="next"]');
const navEl     = $('[data-nav]');

/* ========== helpers ========== */
function fmtSize(b) { if(!b) return '0 B'; const k=1024,s=['B','KB','MB','GB']; const i=Math.floor(Math.log(b)/Math.log(k)); return (b/Math.pow(k,i)).toFixed(2)+' '+s[i]; }

/* ========== upload ========== */
initUploadZone({ dropEl, fileEl, onFiles: files => loadPDF(files[0]), accept: 'pdf' });

/* ========== load PDF ========== */
async function loadPDF(file) {
  if (file.size > 100 * 1024 * 1024) return showToast('文件不能超过 100 MB');
  pdfFile = file;

  // info
  $('[data-fname]').textContent = file.name;
  $('[data-fsize]').textContent = fmtSize(file.size);
  infoEl.hidden = false;

  try {
    const buf = await file.arrayBuffer();
    pdfDoc = await pdfjsLib.getDocument({
      data: buf,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    }).promise;

    $('[data-fpage]').textContent = pdfDoc.numPages + ' 页';
    dropEl.hidden = true;
    await convertAll();
  } catch (err) {
    showToast('PDF 加载失败：' + (err.message || '未知错误'));
  }
}

/* ========== convert ========== */
async function convertAll() {
  progEl.hidden = false;
  barEl.style.width = '0%';
  pageImgs = [];
  let done = 0;
  const total = pdfDoc.numPages;
  const batch = 3;

  for (let i = 1; i <= total; i += batch) {
    const tasks = [];
    for (let j = 0; j < batch && i + j <= total; j++) tasks.push(renderPage(i + j, 1.5));
    const results = await Promise.all(tasks);
    results.forEach(r => { pageImgs[r.num - 1] = r.url; done++; });
    barEl.style.width = (done / total * 100) + '%';
    progText.textContent = `${done} / ${total}`;
  }

  progEl.hidden = true;
  viewerEl.hidden = false;
  downloadBtn.disabled = false;
  clearBtn.hidden = false;
  pageIdx = 0;
  showView();
  showToast('转换完成');
}

async function renderPage(num, scale) {
  const page = await pdfDoc.getPage(num);
  const vp = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.width = vp.width; canvas.height = vp.height;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const url = canvas.toDataURL('image/png', 0.92);
  canvas.width = 0; canvas.height = 0;
  return { num, url };
}

/* ========== view ========== */
function showView() {
  if (viewMode === 'single') {
    singleEl.hidden = false;
    gridEl.hidden = true;
    navEl.style.display = '';
    singleEl.innerHTML = `<img src="${pageImgs[pageIdx]}" alt="第 ${pageIdx+1} 页"><div class="u-muted u-mt-2" style="font-size:var(--text-sm)">第 ${pageIdx+1} 页</div>`;
    curEl.textContent = pageIdx + 1;
    totalEl.textContent = pageImgs.length;
    prevBtn.disabled = pageIdx === 0;
    nextBtn.disabled = pageIdx === pageImgs.length - 1;
  } else {
    singleEl.hidden = true;
    gridEl.hidden = false;
    navEl.style.display = 'none';
    gridEl.innerHTML = pageImgs.map((url, i) =>
      `<div class="thumb-card" data-thumb="${i}"><img src="${url}" alt="第 ${i+1} 页"><div class="thumb-label">第 ${i+1} 页</div></div>`
    ).join('');
  }
}

/* ========== view tabs ========== */
on($('[data-view-tabs]'), 'click', e => {
  const t = e.target.closest('[data-view]');
  if (!t) return;
  $('[data-view-tabs]').querySelectorAll('.tab-btn').forEach(x => x.classList.remove('is-active'));
  t.classList.add('is-active');
  viewMode = t.dataset.view;
  showView();
});

on(gridEl, 'click', e => {
  const card = e.target.closest('[data-thumb]');
  if (!card) return;
  pageIdx = +card.dataset.thumb;
  viewMode = 'single';
  $('[data-view-tabs]').querySelectorAll('.tab-btn').forEach(x => x.classList.toggle('is-active', x.dataset.view === 'single'));
  showView();
});

/* ========== nav ========== */
on(prevBtn, 'click', () => { if (pageIdx > 0) { pageIdx--; showView(); } });
on(nextBtn, 'click', () => { if (pageIdx < pageImgs.length - 1) { pageIdx++; showView(); } });

document.addEventListener('keydown', e => {
  if (!pageImgs.length || viewMode !== 'single') return;
  if (e.key === 'ArrowLeft' && pageIdx > 0) { pageIdx--; showView(); }
  if (e.key === 'ArrowRight' && pageIdx < pageImgs.length - 1) { pageIdx++; showView(); }
});

/* ========== export ========== */
const exportCfg = { fast: { scale: 1.5, quality: 0.9 }, high: { scale: 2.0, quality: 1.0 } };

on($('[data-action="download"]'), 'click', async () => {
  if (!pdfDoc || !pageImgs.length) return;
  const quality = $('[data-quality]').value;
  const format  = $('[data-format]').value;
  const cfg     = exportCfg[quality];
  const name    = pdfFile.name.replace(/\.pdf$/i, '');

  showToast(quality === 'high' ? '正在生成高清图片…' : '正在导出…');
  progEl.hidden = false; barEl.style.width = '0%';

  try {
    const zip = new JSZip();
    let done = 0;
    const total = pdfDoc.numPages;
    const batch = 3;

    for (let i = 1; i <= total; i += batch) {
      const tasks = [];
      for (let j = 0; j < batch && i + j <= total; j++) {
        const num = i + j;
        tasks.push((async () => {
          const page = await pdfDoc.getPage(num);
          const vp = page.getViewport({ scale: cfg.scale });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { alpha: format === 'png' });
          canvas.width = vp.width; canvas.height = vp.height;
          if (format !== 'png') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
          await page.render({ canvasContext: ctx, viewport: vp, intent: 'print' }).promise;
          const dataUrl = canvas.toDataURL(`image/${format}`, cfg.quality);
          canvas.width = 0; canvas.height = 0;
          return { num, data: dataUrl.split(',')[1] };
        })());
      }
      const results = await Promise.all(tasks);
      results.forEach(r => { zip.file(`${name}_第${r.num}页.${format}`, r.data, { base64: true }); done++; });
      barEl.style.width = (done / total * 100) + '%';
      progText.textContent = `导出 ${done} / ${total}`;
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${name}_转换图片.zip`);
    showToast('下载已开始');
  } catch (err) {
    showToast('导出失败：' + (err.message || ''));
  }
  progEl.hidden = true;
});

/* ========== clear ========== */
on(clearBtn, 'click', () => {
  pdfDoc = null; pdfFile = null; pageImgs = []; pageIdx = 0;
  dropEl.hidden = false;
  viewerEl.hidden = true;
  infoEl.hidden = true;
  downloadBtn.disabled = true;
  clearBtn.hidden = true;
  progEl.hidden = true;
});
