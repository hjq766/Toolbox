/* 0. 导入 */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { drawTextWatermark, drawImageWatermark } from '../_shared/watermark-core.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { initWatermarkUI } from '../_shared/watermark-ui.js';

mountToolHeader();

/* 1. 状态 */
let originalImage = null;

/* 2. DOM 引用 */
const dropEl    = $('[data-drop]');
const fileEl    = $('[data-file]');
const previewEl = $('[data-preview]');
const canvasEl  = $('[data-canvas]');
const ctx       = canvasEl.getContext('2d');
const dlBtn     = $('[data-action="download"]');
const clearBtn  = $('[data-action="clear"]');

/* 3. 共享水印 UI */
const wmUI = initWatermarkUI({ onChanged: updatePreview });

/* 4. 工具函数 */
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
      dlBtn.disabled = false;
      clearBtn.disabled = false;
      updatePreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* 5. 事件绑定 */
initUploadZone({ dropEl, fileEl, onFiles: files => loadImage(files[0]), accept: 'image' });

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
