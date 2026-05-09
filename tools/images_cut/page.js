import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== state ========== */
let currentImage = null;
let rows = 3, cols = 3;

/* ========== DOM ========== */
const dropEl    = $('[data-drop]');
const fileEl    = $('[data-file]');
const previewEl = $('[data-preview]');
const canvasEl  = $('[data-canvas]');
const ctx       = canvasEl.getContext('2d');
const gridEl    = $('[data-grid-lines]');
const cutBtn    = $('[data-action="cut"]');

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
      previewEl.hidden = false;
      cutBtn.disabled = false;
      displayImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ========== 显示图片 ========== */
function displayImage() {
  if (!currentImage) return;
  const wrap = canvasEl.parentElement;
  const maxW = wrap.offsetWidth || 600, maxH = 500;
  const scale = Math.min(maxW / currentImage.width, maxH / currentImage.height, 1);
  const w = Math.round(currentImage.width * scale);
  const h = Math.round(currentImage.height * scale);
  canvasEl.width = w; canvasEl.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(currentImage, 0, 0, w, h);
  canvasEl._info = { w, h, scale };
  drawGridLines();
}

/* ========== 网格线 ========== */
function drawGridLines() {
  gridEl.innerHTML = '';
  if (!canvasEl._info) return;
  const { w, h } = canvasEl._info;
  // 计算 canvas 在 wrap 中的偏移
  const wrap = canvasEl.parentElement;
  const offX = (wrap.offsetWidth - w) / 2;
  const offY = (wrap.offsetHeight - h) / 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
  svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none';

  const makeLine = (x1, y1, x2, y2) => {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', '#fff'); l.setAttribute('stroke-width', '1');
    l.setAttribute('stroke-dasharray', '4,4');
    svg.appendChild(l);
  };

  for (let i = 1; i < cols; i++) makeLine(offX + w * i / cols, offY, offX + w * i / cols, offY + h);
  for (let i = 1; i < rows; i++) makeLine(offX, offY + h * i / rows, offX + w, offY + h * i / rows);

  gridEl.appendChild(svg);
}

/* ========== 宫格预设 ========== */
$('[data-presets]').addEventListener('click', e => {
  const btn = e.target.closest('[data-rows]');
  const customBtn = e.target.closest('[data-custom]');
  if (btn) {
    rows = +btn.dataset.rows; cols = +btn.dataset.cols;
    $('[data-presets]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $('[data-custom-group]').classList.remove('show');
    drawGridLines();
  } else if (customBtn) {
    $('[data-presets]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    customBtn.classList.add('active');
    $('[data-custom-group]').classList.add('show');
  }
});

on($('[data-action="apply-custom"]'), 'click', () => {
  rows = Math.min(Math.max(+$('[data-custom-rows]').value || 1, 1), 10);
  cols = Math.min(Math.max(+$('[data-custom-cols]').value || 1, 1), 10);
  $('[data-custom-rows]').value = rows;
  $('[data-custom-cols]').value = cols;
  drawGridLines();
});

/* ========== 切割下载 ========== */
on(cutBtn, 'click', async () => {
  if (!currentImage) { showToast('请先上传图片'); return; }
  showToast('正在切割...');
  cutBtn.disabled = true;
  try {
    const pw = currentImage.width / cols, ph = currentImage.height / rows;
    const tmp = document.createElement('canvas');
    const tmpCtx = tmp.getContext('2d');
    tmp.width = pw; tmp.height = ph;

    const zip = new JSZip();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tmpCtx.clearRect(0, 0, pw, ph);
        tmpCtx.drawImage(currentImage, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
        const data = tmp.toDataURL('image/png').split(',')[1];
        zip.file(`piece_${r + 1}_${c + 1}.png`, data, { base64: true });
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'grid_pieces.zip');
    showToast('下载已开始');
  } catch (err) {
    showToast('切割失败，请重试');
  }
  cutBtn.disabled = false;
});

/* ========== 删除 ========== */
on($('[data-action="delete"]'), 'click', () => {
  currentImage = null;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  gridEl.innerHTML = '';
  previewEl.hidden = true;
  dropEl.hidden = false;
  cutBtn.disabled = true;
  fileEl.value = '';
});
