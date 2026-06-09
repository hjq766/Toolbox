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
const qualPanel    = $('[data-quality-panel]');
const qualSlider   = $('[data-quality]');
const qualVal      = $('[data-quality-val]');
const alphaPanel   = $('[data-alpha-panel]');
const sizeRow      = $('[data-size-row]');
const customSizeEl = $('[data-custom-size]');
const cwInput      = $('[data-cw]');
const chInput      = $('[data-ch]');
const msInput      = $('[data-ms]');
const maxsideEl    = $('[data-maxside-size]');
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

function markConvertedStale() {
  if (!convertedFiles.some(Boolean)) return;
  convertedFiles = [];
  dlBtn.hidden = true;
  $$('[data-dl-single]', gridEl).forEach(btn => { btn.hidden = true; });
}

function buildZipPath(f, usedPaths) {
  let candidate;
  if (f.relPath) {
    const segs = f.relPath.split('/');
    segs[segs.length - 1] = f.name;
    candidate = segs.join('/');
  } else {
    candidate = f.name;
  }
  if (!usedPaths.has(candidate)) return candidate;
  const dot  = candidate.lastIndexOf('.');
  const base = dot >= 0 ? candidate.slice(0, dot) : candidate;
  const ext  = dot >= 0 ? candidate.slice(dot) : '';
  for (let n = 1; ; n++) {
    const alt = `${base} (${n})${ext}`;
    if (!usedPaths.has(alt)) return alt;
  }
}

/* ========== 格式选择 ========== */
on($('[data-fmt-grid]'), 'click', e => {
  const btn = e.target.closest('[data-fmt]');
  if (!btn) return;
  $$('[data-fmt]', $('[data-fmt-grid]')).forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  selectedFormat = btn.dataset.fmt;
  updateQualityDisplay();
  updateAlphaDisplay();
  markConvertedStale();
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
  markConvertedStale();
});

/* ========== 透明度选项 ========== */
$$('[data-alpha]').forEach(r => on(r, 'change', () => {
  preserveAlpha = r.value === 'preserve';
  markConvertedStale();
}));

/* ========== 尺寸预设 ========== */
on(sizeRow, 'click', e => {
  const btn = e.target.closest('[data-size]');
  if (!btn) return;
  $$('[data-size]', sizeRow).forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  selectedPreset = btn.dataset.size;
  customSizeEl.hidden = selectedPreset !== 'custom';
  maxsideEl.hidden = selectedPreset !== 'maxside';
  markConvertedStale();
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
  markConvertedStale();
});
on(chInput, 'input', () => {
  if (maintainAspectRatio && currentAspectRatio && chInput.value) {
    cwInput.value = Math.round(chInput.value * currentAspectRatio);
  }
  markConvertedStale();
});
on(msInput, 'input', () => markConvertedStale());

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
  dirEl: $('[data-file-dir]'),
  onFiles: handleFiles,
  accept: 'image',
  multiple: true,
});

function isHeic(file) {
  const ext = file.name.toLowerCase().split('.').pop();
  return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
}

async function loadHeicDecoder() {
  if (typeof HeicTo !== 'undefined') return;
  showToast('HEIC 解码库加载中，请稍候...', { type: 'info' });
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/heic-to@1.4.2/dist/iife/heic-to.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('HEIC 解码库加载失败，请检查网络'));
    document.head.appendChild(s);
  });
}

async function decodeHeic(file) {
  // Lazy-load heic-to (supports all modern iPhone HEIC formats)
  await loadHeicDecoder();
  return await HeicTo({ blob: file, type: 'image/png' });
}

async function handleFiles(files) {
  let count = 0;
  for (const file of files) {
    const heic = isHeic(file);
    if (!heic && !file.type.startsWith('image/')) continue;
    count++;

    let displayFile = file;
    let preview;

    if (heic) {
      try {
        const decoded = await decodeHeic(file);
        preview = URL.createObjectURL(decoded);
        // store decoded blob for conversion, keep original name
        displayFile = new File([decoded], file.name, { type: 'image/png' });
      } catch (e) {
        showToast(`HEIC 解码失败: ${e.message}`, { type: 'error' });
        continue;
      }
    } else {
      preview = URL.createObjectURL(file);
    }

    const relPath = file.webkitRelativePath || '';
    const isFirst = uploadedFiles.length === 0;
    uploadedFiles.push({ file: displayFile, preview, originalFile: file, relPath });
    createPreviewItem(displayFile, preview, uploadedFiles.length - 1, isFirst, relPath);
  }
  const hasGif = [...files].some(f => f.type === 'image/gif');
  if (hasGif && selectedFormat !== 'gif') showToast('GIF 动图转换后仅保留第一帧', { type: 'warn' });
  if (count === 0) { showToast('请选择有效的图片文件', { type: 'warn' }); return; }
  convBtn.disabled = false;
  clearBtn.hidden = false;
}

function createPreviewItem(file, previewUrl, index, isFirst, relPath = '') {
  const el = document.createElement('div');
  el.className = 'preview-item';
  el.dataset.idx = index;
  const pathHtml = relPath && relPath.includes('/')
    ? `<div class="hint u-truncate" title="${escapeHtml(relPath)}">${escapeHtml(relPath)}</div>`
    : '';
  el.innerHTML = `
    <div class="preview-img"><img src="${previewUrl}" alt="${escapeHtml(file.name)}" data-preview-img></div>
    <div class="preview-info">
      <div class="fname">${escapeHtml(file.name)}</div>
      ${pathHtml}
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
  const removing = uploadedFiles[idx];
  if (removing) URL.revokeObjectURL(removing.preview);
  uploadedFiles[idx] = null;
  if (convertedFiles[idx]) convertedFiles[idx] = null;
  if (uploadedFiles.every(u => !u)) {
    uploadedFiles = []; convertedFiles = [];
    convBtn.disabled = true; clearBtn.hidden = true;
    dlBtn.hidden = true;
  }
});

/* ========== 转换 ========== */
on(convBtn, 'click', async () => {
  if (!uploadedFiles.filter(Boolean).length) { showToast('请先上传图片', { type: 'warn' }); return; }

  convBtn.disabled = true;
  progEl.hidden = false;
  barEl.style.width = '0%';
  convertedFiles = [];

  const total = uploadedFiles.filter(Boolean).length;
  let successCount = 0, failCount = 0;

  for (let i = 0; i < uploadedFiles.length; i++) {
    const entry = uploadedFiles[i];
    if (!entry) continue;
    const { file, preview } = entry;
    const card = gridEl.querySelector(`[data-idx="${i}"]`);
    const doneCount = successCount + failCount;
    barEl.style.width = `${(doneCount / total) * 100}%`;
    progText.textContent = `${doneCount + 1} / ${total}`;

    try {
      const rawFormat = file.type ? file.type.split('/')[1] : '';
      const originalFormat = rawFormat === 'jpeg' ? 'jpg' : rawFormat;
      if (originalFormat === selectedFormat && selectedPreset === 'original' && selectedFormat !== 'jpg' && selectedFormat !== 'webp') {
        const ext = selectedFormat === 'jpg' ? 'jpg' : selectedFormat;
        convertedFiles[i] = { file: file, name: getConvertedFileName(file.name, ext), relPath: uploadedFiles[i].relPath || '' };
        const bmp = await createImageBitmap(file);
        if (card) {
          card.querySelector('[data-cv-fmt]').textContent = selectedFormat.toUpperCase();
          card.querySelector('[data-cv-size]').textContent = fmtSize(file.size);
          card.querySelector('[data-cv-dim]').textContent = `${bmp.width} × ${bmp.height}`;
          setupSingleDownload(card, i);
        }
        successCount++;
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
        case '0.5x':    tw = Math.round(img.naturalWidth * 0.5);  th = Math.round(img.naturalHeight * 0.5);  break;
        case '0.75x':   tw = Math.round(img.naturalWidth * 0.75); th = Math.round(img.naturalHeight * 0.75); break;
        case '2x':      tw = Math.round(img.naturalWidth * 2);    th = Math.round(img.naturalHeight * 2);    break;
        case 'maxside': {
          const ms = parseInt(msInput.value) || Math.max(img.naturalWidth, img.naturalHeight);
          const s = ms / Math.max(img.naturalWidth, img.naturalHeight);
          tw = Math.round(img.naturalWidth * s); th = Math.round(img.naturalHeight * s);
          break;
        }
        case 'square':  { const sq = Math.min(img.naturalWidth, img.naturalHeight); tw = th = sq; break; }
        case 'custom':  tw = parseInt(cwInput.value) || img.naturalWidth; th = parseInt(chInput.value) || img.naturalHeight; break;
        default:        tw = img.naturalWidth; th = img.naturalHeight;
      }

      let fw = tw, fh = th;
      if (maintainAspectRatio && selectedPreset !== 'square' && selectedPreset !== 'maxside') {
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
        canvas.toBlob(b => b ? res(b) : rej(new Error(`${selectedFormat.toUpperCase()} 格式转换失败，当前浏览器不支持`)), mimeType, quality);
      });

      let actualFmt = selectedFormat;
      if (selectedFormat === 'webp' && blob.type !== 'image/webp') {
        showToast('浏览器不支持 WebP，已转换为 PNG', { type: 'warn' });
        blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        actualFmt = 'png';
      }

      const ext = actualFmt === 'jpg' ? 'jpg' : actualFmt;
      convertedFiles[i] = { file: blob, name: getConvertedFileName(file.name, ext), relPath: uploadedFiles[i].relPath || '' };

      if (card) {
        card.querySelector('[data-cv-fmt]').textContent = actualFmt.toUpperCase() + (actualFmt !== selectedFormat ? ' (WebP不支持)' : '');
        card.querySelector('[data-cv-size]').textContent = fmtSize(blob.size);
        card.querySelector('[data-cv-dim]').textContent = `${fw} × ${fh}`;
        setupSingleDownload(card, i);
      }
      successCount++;
    } catch (err) {
      failCount++;
      console.error(`[${file.name}] 转换失败:`, err);
      if (card) card.querySelector('[data-cv-fmt]').textContent = '转换失败';
    }
  }

  barEl.style.width = '100%';
  if (successCount > 0) {
    dlBtn.hidden = false;
    dlBtn.textContent = successCount > 1 ? '批量下载' : '保存图片';
  }
  if (failCount === 0) {
    showToast('转换完成！', { type: 'success' });
  } else if (successCount > 0) {
    showToast(`${successCount} 张成功，${failCount} 张失败`, { type: 'warn' });
  } else {
    showToast('全部转换失败，请检查格式或文件', { type: 'error' });
  }
  convBtn.disabled = false;
  progEl.hidden = true;
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
  const usedPaths = new Set();
  convertedFiles.forEach(f => {
    if (!f) return;
    const zipPath = buildZipPath(f, usedPaths);
    usedPaths.add(zipPath);
    zip.file(zipPath, f.file);
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
  dlBtn.hidden = true; progEl.hidden = true;
  barEl.style.width = '0%';
  showToast('已清空所有内容');
});
