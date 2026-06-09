import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { drawTextWatermark, drawImageWatermark } from '../_shared/watermark-core.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { initWatermarkUI } from '../_shared/watermark-ui.js';

mountToolHeader();

let originalImage = null;

const dropEl    = $('[data-drop]');
const fileEl    = $('[data-file]');
const previewEl = $('[data-preview]');
const canvasEl  = $('[data-canvas]');
const ctx       = canvasEl.getContext('2d');
const dlBtn      = $('[data-action="download"]');
const clearBtn   = $('[data-action="clear"]');
const copyBtn    = $('[data-action="copy"]');
const imgInfoEl  = $('[data-img-info]');

const wmUI = initWatermarkUI({ onChanged: updatePreview });

const ro = new ResizeObserver(debounce(() => { if (originalImage) updatePreview(); }, 150));
ro.observe(canvasEl.parentElement);

function resetCanvas() {
  if (!originalImage) return;
  const maxW = canvasEl.parentElement.offsetWidth || 600;
  const scale = Math.min(maxW / originalImage.width, 1);
  canvasEl.width  = originalImage.width * scale;
  canvasEl.height = originalImage.height * scale;
  ctx.drawImage(originalImage, 0, 0, canvasEl.width, canvasEl.height);
}

function updatePreview() {
  if (!originalImage) return;
  resetCanvas();
  const opts = wmUI.getOpts(canvasEl.width, canvasEl.height);
  if (wmUI.type === 'text' && opts.text)         drawTextWatermark(ctx, opts);
  else if (wmUI.type === 'image' && wmUI.image)  drawImageWatermark(ctx, opts);
}

function loadImage(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      dropEl.hidden = true;
      previewEl.hidden = false;
      $('aside')?.classList.remove('is-inactive');
      dlBtn.disabled = false;
      clearBtn.disabled = false;
      if (copyBtn)   copyBtn.disabled = false;
      if (imgInfoEl) imgInfoEl.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
      updatePreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

initUploadZone({ dropEl, fileEl, onFiles: files => loadImage(files[0]), accept: 'image', onDelete: clearImage });

function clearImage() {
  originalImage = null;
  previewEl.hidden = true;
  dropEl.hidden = false;
  $('aside')?.classList.add('is-inactive');
  dlBtn.disabled = true;
  clearBtn.disabled = true;
  if (copyBtn)   copyBtn.disabled = true;
  if (imgInfoEl) imgInfoEl.textContent = '';
  fileEl.value = '';
}

on(copyBtn, 'click', () => {
  if (!originalImage) return;
  const full = document.createElement('canvas');
  full.width  = originalImage.width;
  full.height = originalImage.height;
  const fCtx  = full.getContext('2d');
  fCtx.drawImage(originalImage, 0, 0);
  const opts = wmUI.getOpts(full.width, full.height);
  if (wmUI.type === 'text' && opts.text)        drawTextWatermark(fCtx, opts);
  else if (wmUI.type === 'image' && wmUI.image) drawImageWatermark(fCtx, opts);
  full.toBlob(async blob => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('已复制到剪贴板');
    } catch {
      showToast('当前环境不支持复制，请使用下载', { type: 'warn' });
    }
  }, 'image/png');
});

on(dlBtn, 'click', () => {
  if (!originalImage) return;
  const full = document.createElement('canvas');
  full.width = originalImage.width;
  full.height = originalImage.height;
  const fCtx = full.getContext('2d');
  fCtx.drawImage(originalImage, 0, 0);

  const opts = wmUI.getOpts(full.width, full.height);
  if (wmUI.type === 'text' && opts.text)         drawTextWatermark(fCtx, opts);
  else if (wmUI.type === 'image' && wmUI.image)  drawImageWatermark(fCtx, opts);

  const fmt = wmUI.format;
  const mime = fmt === 'jpg' ? 'image/jpeg' : `image/${fmt}`;

  if (fmt === 'jpg') {
    const tmp = document.createElement('canvas');
    tmp.width = full.width;
    tmp.height = full.height;
    const tCtx = tmp.getContext('2d');
    tCtx.fillStyle = '#fff';
    tCtx.fillRect(0, 0, tmp.width, tmp.height);
    tCtx.drawImage(full, 0, 0);
    tmp.toBlob(blob => { downloadBlob(blob, `watermarked.${fmt}`); showToast('下载已开始'); }, mime, 1.0);
  } else {
    full.toBlob(blob => { downloadBlob(blob, `watermarked.${fmt}`); showToast('下载已开始'); }, mime, 1.0);
  }
});

on(clearBtn, 'click', () => {
  wmUI.clear();
  updatePreview();
  showToast('已清空水印');
});
