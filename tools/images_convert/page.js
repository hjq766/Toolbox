import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== 状态 ========== */
let uploadedFiles  = [];   // { file, preview(objectURL) }
let convertedFiles = [];   // { file(blob), name }
let selectedFormat = 'jpg';
let selectedPreset = 'original';
let maintainAspectRatio = true;
let currentAspectRatio  = 1;
let imageQuality = 0.95;
let namingMode = 'original';
let preserveAlpha = true;

/* ========== DOM 引用 ========== */
const gridEl       = $('[data-grid]');
const progEl       = $('[data-progress]');
const barEl        = $('[data-bar]');
const progText     = $('[data-progress-text]');
const convBtn      = $('[data-action="convert"]');
const clearBtn     = $('[data-action="clear"]');
const dlBtn        = $('[data-action="download"]');
const dlPanel      = $('[data-download-panel]');
const qualPanel    = $('[data-quality-panel]');
const qualSlider   = $('[data-quality]');
const qualVal      = $('[data-quality-val]');
const alphaPanel   = $('[data-alpha-panel]');
const sizeRow      = $('[data-size-row]');
const customSizeEl = $('[data-custom-size]');
const cwInput      = $('[data-cw]');
const chInput      = $('[data-ch]');
const linkIcon     = $('[data-link-icon]');
const modal        = $('[data-modal]');
const modalImg     = $('[data-modal-img]');
const modalClose   = $('[data-modal-close]');

/* ========== 工具函数 ========== */
function fmtSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024, u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + u[i];
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function getConvertedFileName(originalName, ext) {
  const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  return namingMode === 'original' ? `${base}.${ext}` : `converted_${base}.${ext}`;
}

const MIME_MAP = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', tiff: 'image/tiff',
};

/* ========== 格式选择 ========== */
on($('[data-fmt-grid]'), 'click', e => {
  const btn = e.target.closest('[data-fmt]');
  if (!btn) return;
  $$('[data-fmt]', $('[data-fmt-grid]')).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedFormat = btn.dataset.fmt;
  updateQualityDisplay();
  updateAlphaDisplay();
});

function updateQualityDisplay() {
  qualPanel.hidden = !(selectedFormat === 'jpg' || selectedFormat === 'webp');
}
function updateAlphaDisplay() {
  alphaPanel.hidden = selectedFormat !== 'webp';
}
updateQualityDisplay();
updateAlphaDisplay();

/* ========== 质量滑块 ========== */
on(qualSlider, 'input', () => {
  imageQuality = parseInt(qualSlider.value) / 100;
  qualVal.textContent = qualSlider.value + '%';
});

/* ========== 透明度选项 ========== */
$$('[data-alpha]').forEach(r => on(r, 'change', () => {
  preserveAlpha = r.value === 'preserve';
}));

/* ========== 尺寸预设 ========== */
on(sizeRow, 'click', e => {
  const btn = e.target.closest('[data-size]');
  if (!btn) return;
  $$('[data-size]', sizeRow).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPreset = btn.dataset.size;
  customSizeEl.hidden = selectedPreset !== 'custom';
});

/* ========== 宽高比联动 ========== */
on(linkIcon, 'click', () => {
  maintainAspectRatio = !maintainAspectRatio;
  linkIcon.style.color = maintainAspectRatio ? 'var(--color-brand)' : 'var(--fg-muted)';
});
on(cwInput, 'input', () => {
  if (maintainAspectRatio && currentAspectRatio && cwInput.value) {
    chInput.value = Math.round(cwInput.value / currentAspectRatio);
  }
});
on(chInput, 'input', () => {
  if (maintainAspectRatio && currentAspectRatio && chInput.value) {
    cwInput.value = Math.round(chInput.value * currentAspectRatio);
  }
});

/* ========== 命名方式 ========== */
$$('[data-naming]').forEach(r => on(r, 'change', () => {
  namingMode = r.value;
}));

/* ========== 图片预览模态框 ========== */
function showModal(src) {
  modalImg.src = src;
  modal.classList.add('is-active');
  document.body.style.overflow = 'hidden';
}
function hideModal() {
  modal.classList.remove('is-active');
  document.body.style.overflow = '';
}
on(modalClose, 'click', hideModal);
on(modal, 'click', e => { if (e.target === modal) hideModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('is-active')) hideModal();
});

/* ========== 上传 ========== */
initUploadZone({
  dropEl: $('[data-drop]'),
  fileEl: $('[data-file]'),
  onFiles: handleFiles,
  accept: 'image',
  multiple: true,
});

function handleFiles(files) {
  let count = 0;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    count++;
    const isFirst = uploadedFiles.length === 0;
    const preview = URL.createObjectURL(file);
    uploadedFiles.push({ file, preview });
    createPreviewItem(file, preview, uploadedFiles.length - 1, isFirst);
  }
  if (count === 0) { showToast('请选择有效的图片文件', { type: 'warn' }); return; }
  convBtn.disabled = false;
  clearBtn.hidden = false;
}

function createPreviewItem(file, previewUrl, index, isFirst) {
  const el = document.createElement('div');
  el.className = 'preview-item';
  el.dataset.idx = index;
  el.innerHTML = `
    <div class="preview-img"><img src="${previewUrl}" alt="${escapeHtml(file.name)}" data-preview-img></div>
    <div class="preview-info">
      <div class="fname">${escapeHtml(file.name)}</div>
      <div class="info-row"><span>原始大小：</span><span>${fmtSize(file.size)}</span></div>
      <div class="info-row"><span>原始尺寸：</span><span data-orig-dim>-</span></div>
      <div class="info-row"><span>转换格式：</span><span data-cv-fmt class="cv">-</span></div>
      <div class="info-row"><span>转换大小：</span><span data-cv-size class="cv">-</span></div>
      <div class="info-row"><span>转换尺寸：</span><span data-cv-dim class="cv">-</span></div>
      <button class="btn is-sm" data-dl-single hidden>下载此图片</button>
    </div>
    <button class="remove-btn" data-remove="${index}"><i data-lucide="x"></i></button>`;

  gridEl.appendChild(el);
  if (window.refreshIcons) window.refreshIcons(el);

  const img = new Image();
  img.onload = () => {
    el.querySelector('[data-orig-dim]').textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
    if (isFirst) {
      currentAspectRatio = img.naturalWidth / img.naturalHeight;
      if (selectedPreset === 'custom' && maintainAspectRatio) {
        if (cwInput.value) chInput.value = Math.round(cwInput.value / currentAspectRatio);
        else if (chInput.value) cwInput.value = Math.round(chInput.value * currentAspectRatio);
      }
    }
  };
  img.src = previewUrl;

  el.querySelector('[data-preview-img]').addEventListener('click', () => showModal(previewUrl));
}

/* ========== 移除文件 ========== */
on(gridEl, 'click', e => {
  const rmBtn = e.target.closest('[data-remove]');
  if (!rmBtn) return;
  const idx = +rmBtn.dataset.remove;
  rmBtn.closest('.preview-item').remove();
  uploadedFiles[idx] = null;
  if (convertedFiles[idx]) convertedFiles[idx] = null;
  if (uploadedFiles.every(u => !u)) {
    uploadedFiles = []; convertedFiles = [];
    convBtn.disabled = true; clearBtn.hidden = true;
    dlPanel.hidden = true;
  }
});

/* ========== 转换 ========== */
on(convBtn, 'click', async () => {
  if (!uploadedFiles.filter(Boolean).length) { showToast('请先上传图片', { type: 'warn' }); return; }

  convBtn.disabled = true;
  progEl.hidden = false;
  barEl.style.width = '0%';
  convertedFiles = [];

  try {
    for (let i = 0; i < uploadedFiles.length; i++) {
      const entry = uploadedFiles[i];
      if (!entry) continue;
      const { file, preview } = entry;
      const card = gridEl.querySelector(`[data-idx="${i}"]`);

      barEl.style.width = `${((i + 1) / uploadedFiles.filter(Boolean).length) * 100}%`;
      progText.textContent = `${i + 1} / ${uploadedFiles.filter(Boolean).length}`;

      const originalFormat = file.type.split('/')[1];
      if (originalFormat === selectedFormat && selectedPreset === 'original') {
        const ext = selectedFormat === 'jpg' ? 'jpg' : selectedFormat;
        convertedFiles[i] = { file: file, name: getConvertedFileName(file.name, ext) };
        const bmp = await createImageBitmap(file);
        if (card) {
          card.querySelector('[data-cv-fmt]').textContent = selectedFormat.toUpperCase();
          card.querySelector('[data-cv-size]').textContent = fmtSize(file.size);
          card.querySelector('[data-cv-dim]').textContent = `${bmp.width} × ${bmp.height}`;
          setupSingleDownload(card, i);
        }
        continue;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => {
        img.onload = () => (img.complete && img.naturalWidth > 0) ? res() : rej(new Error('图片加载失败'));
        img.onerror = rej;
        img.src = preview;
      });

      let tw, th;
      switch (selectedPreset) {
        case '0.5x':    tw = Math.round(img.naturalWidth * 0.5); th = Math.round(img.naturalHeight * 0.5); break;
        case '2x':      tw = Math.round(img.naturalWidth * 2);   th = Math.round(img.naturalHeight * 2);   break;
        case 'hd':      tw = 1280; th = 720;  break;
        case 'fhd':     tw = 1920; th = 1080; break;
        case '4k':      tw = 3840; th = 2160; break;
        case 'square': { const s = Math.min(img.naturalWidth, img.naturalHeight); tw = th = s; break; }
        case 'custom':   tw = parseInt(cwInput.value) || img.naturalWidth; th = parseInt(chInput.value) || img.naturalHeight; break;
        default:         tw = img.naturalWidth; th = img.naturalHeight;
      }

      let fw = tw, fh = th;
      if (maintainAspectRatio && selectedPreset !== 'square') {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (tw && !th) fh = Math.round(tw / ratio);
        else if (!tw && th) fw = Math.round(th * ratio);
        else {
          const tr = tw / th;
          if (ratio > tr) fh = Math.round(tw / ratio);
          else fw = Math.round(th * ratio);
        }
      }

      const canvas = document.createElement('canvas');
      const needsAlpha = selectedFormat === 'png' || (selectedFormat === 'webp' && preserveAlpha);
      const ctx = canvas.getContext('2d', { alpha: needsAlpha, colorSpace: 'srgb' });
      canvas.width = fw; canvas.height = fh;

      if (selectedFormat === 'webp' && !preserveAlpha) {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, fw, fh);
      } else if (selectedFormat !== 'png' && selectedFormat !== 'webp') {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, fw, fh);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, fw, fh);

      const mimeType = MIME_MAP[selectedFormat] || `image/${selectedFormat}`;
      const quality = (selectedFormat === 'jpg' || selectedFormat === 'webp') ? imageQuality : undefined;

      let blob = await new Promise((res, rej) => {
        canvas.toBlob(b => b ? res(b) : rej(new Error('转换失败')), mimeType, quality);
      });

      let actualFmt = selectedFormat;
      if (selectedFormat === 'webp' && blob.type !== 'image/webp') {
        showToast('浏览器不支持 WebP，已转换为 PNG', { type: 'warn' });
        blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        actualFmt = 'png';
      }

      const ext = actualFmt === 'jpg' ? 'jpg' : actualFmt;
      convertedFiles[i] = { file: blob, name: getConvertedFileName(file.name, ext) };

      if (card) {
        card.querySelector('[data-cv-fmt]').textContent = actualFmt.toUpperCase() + (actualFmt !== selectedFormat ? ' (WebP不支持)' : '');
        card.querySelector('[data-cv-size]').textContent = fmtSize(blob.size);
        card.querySelector('[data-cv-dim]').textContent = `${fw} × ${fh}`;
        setupSingleDownload(card, i);
      }
    }

    dlPanel.hidden = false;
    dlBtn.innerHTML = convertedFiles.filter(Boolean).length > 1
      ? '<i data-lucide="download"></i> 批量下载'
      : '<i data-lucide="download"></i> 下载图片';
    if (window.refreshIcons) window.refreshIcons(dlBtn);
    showToast('转换完成！', { type: 'success' });
  } catch (err) {
    console.error('转换错误:', err);
    showToast('转换失败，请重试', { type: 'error' });
  } finally {
    convBtn.disabled = false;
    progEl.hidden = true;
  }
});

function setupSingleDownload(card, idx) {
  const btn = card.querySelector('[data-dl-single]');
  btn.hidden = false;
  btn.onclick = () => {
    const f = convertedFiles[idx];
    if (!f) return;
    downloadBlob(f.file, f.name);
  };
}

/* ========== 批量下载 ========== */
on(dlBtn, 'click', async () => {
  const done = convertedFiles.filter(Boolean);
  if (!done.length) return;

  if (done.length === 1) {
    downloadBlob(done[0].file, done[0].name);
    showToast('开始下载');
    return;
  }

  if (typeof JSZip === 'undefined') { showToast('ZIP 库未加载', { type: 'error' }); return; }
  const zip = new JSZip();
  done.forEach((f, i) => {
    const ext = selectedFormat === 'jpg' ? 'jpg' : selectedFormat;
    const origName = uploadedFiles.filter(Boolean)[i]?.file?.name;
    const name = origName ? getConvertedFileName(origName, ext) : f.name;
    zip.file(name, f.file);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, 'converted_images.zip');
  showToast('开始下载压缩包', { type: 'success' });
});

/* ========== 清空 ========== */
on(clearBtn, 'click', () => {
  uploadedFiles.forEach(u => u && URL.revokeObjectURL(u.preview));
  uploadedFiles = []; convertedFiles = [];
  gridEl.innerHTML = '';
  convBtn.disabled = true; clearBtn.hidden = true;
  dlPanel.hidden = true; progEl.hidden = true;
  barEl.style.width = '0%';
  showToast('已清空所有内容');
});
