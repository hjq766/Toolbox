import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
const MODE_QUALITY = { quality: 0.9, balanced: 0.8, aggressive: 0.5 };
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

/* ========== 2. 状态 ========== */
let uploaded   = [];   // { file, preview(objectURL), origW, origH } | null
let compressed = [];   // { file, name } | null
let _jpegCodec   = null;
let _oxipngCodec = null;

/* ========== 3. DOM 引用 ========== */
const dropEl      = $('[data-drop]');
const fileEl      = $('[data-file]');
const gridEl      = $('[data-grid]');
const progEl      = $('[data-progress]');
const barEl       = $('[data-bar]');
const progText    = $('[data-progress-text]');
const compBtn     = $('[data-action="compress"]');
const dlBtn       = $('[data-action="download"]');
const clearBtn    = $('[data-action="clear"]');
const modeEls     = $$('[data-mode]');
const qualityEl   = $('[data-quality]');
const qualityValEl   = $('[data-quality-val]');
const customQualityEl = $('[data-custom-quality]');
const targetSizeEl    = $('[data-target-size]');
const targetValEl     = $('[data-target-val]');
const targetUnitEl    = $('[data-target-unit]');
const allowResizeEl   = $('[data-allow-resize]');
const tinypngPanelEl = $('[data-tinypng-panel]');
const tinypngKeyEl   = $('[data-tinypng-key]');
const tinypngShowEl  = $('[data-tinypng-show]');
const tinypngCountEl = $('[data-tinypng-count]');
const summaryEl   = $('[data-summary]');
const modal       = $('[data-modal]');
const modalImg    = $('[data-modal-img]');
const modalClose  = $('[data-modal-close]');

/* ========== 4. 工具函数 ========== */
function fmtSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getMode() {
  const v = $('[data-mode]:checked').value;
  if (v === 'target') {
    const val = parseFloat(targetValEl.value) || 200;
    const kb  = targetUnitEl.value === 'mb' ? val * 1024 : val;
    return { type: 'target', kb, allowResize: allowResizeEl.checked };
  }
  if (v === 'tinypng') return { type: 'tinypng', key: tinypngKeyEl.value.trim() };
  const quality = v === 'custom' ? +qualityEl.value / 100 : (MODE_QUALITY[v] ?? 0.8);
  return { type: 'quality', quality };
}

function hasFiles() {
  return uploaded.some(Boolean);
}

function updateButtons() {
  const has = hasFiles();
  compBtn.disabled = !has;
  clearBtn.hidden = !has;
}

function setCardStatus(card, status, text) {
  if (!card) return;
  const badge = card.querySelector('[data-status]');
  if (!badge) return;
  badge.className = 'status-badge';
  switch (status) {
    case 'pending':    badge.classList.add('is-pending');    badge.textContent = '待压缩'; break;
    case 'processing': badge.classList.add('is-processing'); badge.textContent = '压缩中…'; break;
    case 'done':       badge.classList.add('is-done');       badge.textContent = text || '完成'; break;
    case 'fail':       badge.classList.add('is-fail');       badge.textContent = text || '失败'; break;
  }
}

function updateSummary() {
  let count = 0, totalBefore = 0, totalAfter = 0;
  for (let i = 0; i < compressed.length; i++) {
    if (!compressed[i] || !uploaded[i]) continue;
    count++;
    totalBefore += uploaded[i].file.size;
    totalAfter  += compressed[i].file.size;
  }
  if (!count) { summaryEl.hidden = true; return; }

  const saved = totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;

  $('[data-summary-count]').textContent = count;
  $('[data-summary-saved]').textContent = saved > 0 ? `-${saved}%` : '0%';
  $('[data-summary-before]').textContent = fmtSize(totalBefore);
  $('[data-summary-after]').textContent = fmtSize(totalAfter);
  summaryEl.hidden = false;
}

/* 模态框 */
function showModal(src) {
  modalImg.src = src;
  modal.classList.add('is-active');
  document.body.style.overflow = 'hidden';
}
function hideModal() {
  modal.classList.remove('is-active');
  document.body.style.overflow = '';
}

/* ========== 5. 事件绑定 ========== */

/* 上传 */
initUploadZone({ dropEl, fileEl, dirEl: $('[data-file-dir]'), onFiles: handleFiles, accept: 'image', multiple: true });

function handleFiles(files) {
  let added = 0;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    if (file.size > MAX_SIZE) {
      showToast(`${file.name} 超过 20MB，已跳过`, { type: 'warn' });
      continue;
    }
    added++;
    const preview = URL.createObjectURL(file);
    uploaded.push({ file, preview, origW: 0, origH: 0 });
    createPreviewItem(file, preview, uploaded.length - 1);
  }
  if (added === 0 && files.length > 0) {
    showToast('没有有效的图片文件', { type: 'warn' });
    return;
  }
  updateButtons();
}

function createPreviewItem(file, previewUrl, index) {
  const el = document.createElement('div');
  el.className = 'preview-item';
  el.dataset.idx = index;
  el.innerHTML = `
    <div class="preview-img"><img src="${previewUrl}" alt="${escapeHtml(file.name)}" data-preview-img></div>
    <div class="preview-info">
      <div class="fname">${escapeHtml(file.name)}</div>
      <div class="info-row"><span>原始大小</span><span>${fmtSize(file.size)}</span></div>
      <div class="info-row"><span>尺寸</span><span data-dim>—</span></div>
      <div class="info-row"><span>压缩后</span><span class="cv" data-compressed-size>—</span></div>
      <div class="info-row"><span>节省</span><span class="cv" data-ratio>—</span></div>
      <span class="status-badge is-pending" data-status>待压缩</span>
      ${file.size > 12 * 1024 * 1024 ? `<div style="text-align:center;color:var(--color-danger);font-size:11px;margin-top:5px">超过 12MB，TinyPNG 模式将改用本地压缩</div>` : ''}
      <button class="btn is-sm" data-dl-single="${index}" hidden><i data-lucide="download"></i> 下载</button>
    </div>
    <button class="remove-btn" data-remove="${index}"><i data-lucide="x"></i></button>`;
  gridEl.appendChild(el);
  if (window.refreshIcons) window.refreshIcons(el);

  // 读取图片尺寸
  const img = new Image();
  img.onload = () => {
    if (uploaded[index]) {
      uploaded[index].origW = img.naturalWidth;
      uploaded[index].origH = img.naturalHeight;
    }
    const dimEl = el.querySelector('[data-dim]');
    if (dimEl) dimEl.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
  };
  img.src = previewUrl;

  // 点击缩略图预览
  el.querySelector('[data-preview-img]').addEventListener('click', () => showModal(previewUrl));
}

/* 移除文件 */
on(gridEl, 'click', e => {
  const rmBtn = e.target.closest('[data-remove]');
  if (rmBtn) {
    const idx = +rmBtn.dataset.remove;
    const entry = uploaded[idx];
    if (entry) URL.revokeObjectURL(entry.preview);
    rmBtn.closest('.preview-item').remove();
    uploaded[idx] = null;
    if (compressed[idx]) compressed[idx] = null;
    if (!hasFiles()) {
      uploaded = []; compressed = [];
      dlBtn.hidden = true;
      summaryEl.hidden = true;
    }
    updateButtons();
    if (compressed.some(Boolean)) updateSummary();
    return;
  }

  // 单文件下载
  const dlSingle = e.target.closest('[data-dl-single]');
  if (dlSingle) {
    const idx = +dlSingle.dataset.dlSingle;
    const c = compressed[idx];
    if (c) downloadBlob(c.file, 'compressed_' + c.name);
  }
});

/* 模态框 */
on(modalClose, 'click', hideModal);
on(modal, 'click', e => { if (e.target === modal) hideModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('is-active')) hideModal();
});

/* 模式切换 */
modeEls.forEach(r => {
  on(r, 'change', () => {
    customQualityEl.hidden = r.value !== 'custom';
    targetSizeEl.hidden    = r.value !== 'target';
    tinypngPanelEl.hidden  = r.value !== 'tinypng';
  });
});
on(qualityEl, 'input', e => { qualityValEl.textContent = e.target.value + '%'; });

/* TinyPNG */
function updateTinyPngCount(n) {
  localStorage.setItem('tinypng_count', String(n));
  if (tinypngCountEl) tinypngCountEl.textContent = `本月已用：${n} / 500`;
}
if (tinypngKeyEl) {
  const _k = localStorage.getItem('tinypng_key');
  if (_k) tinypngKeyEl.value = _k;
}
if (tinypngCountEl) {
  const _c = localStorage.getItem('tinypng_count');
  if (_c) tinypngCountEl.textContent = `本月已用：${_c} / 500`;
}
on(tinypngKeyEl, 'change', () => {
  const k = tinypngKeyEl.value.trim();
  k ? localStorage.setItem('tinypng_key', k) : localStorage.removeItem('tinypng_key');
});
on(tinypngShowEl, 'click', () => {
  const hidden = tinypngKeyEl.type === 'password';
  tinypngKeyEl.type = hidden ? 'text' : 'password';
  const ico = tinypngShowEl.querySelector('[data-lucide]');
  if (ico) { ico.dataset.lucide = hidden ? 'eye-off' : 'eye'; if (window.refreshIcons) window.refreshIcons(tinypngShowEl); }
});

/* jSquash 懒加载 */
async function loadJpegCodec() {
  if (!_jpegCodec) _jpegCodec = await import('https://esm.sh/@jsquash/jpeg');
  return _jpegCodec;
}
async function loadOxipngCodec() {
  if (!_oxipngCodec) _oxipngCodec = await import('https://esm.sh/@jsquash/oxipng');
  return _oxipngCodec;
}
async function compressJsquash(file, quality) {
  try {
    if (file.type === 'image/jpeg') {
      const { decode, encode } = await loadJpegCodec();
      const imageData = await decode(await file.arrayBuffer());
      const buf = await encode(imageData, { quality: Math.round(quality * 100) });
      return new Blob([buf], { type: 'image/jpeg' });
    }
    if (file.type === 'image/png') {
      const { optimise } = await loadOxipngCodec();
      const buf = await optimise(await file.arrayBuffer(), { level: 2 });
      return new Blob([buf], { type: 'image/png' });
    }
  } catch (e) {
    console.warn('[jsquash] 压缩失败，降级处理:', e);
  }
  return null;
}
async function compressWithTinyPng(file, apiKey) {
  const auth = 'Basic ' + btoa('api:' + apiKey);
  const uploadRes = await fetch('https://long-credit-bed9.hjq766.workers.dev/shrink', {
    method: 'POST',
    headers: { 'Authorization': auth, 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (uploadRes.status === 401) throw new Error('API Key 无效，请检查后重试');
  if (uploadRes.status === 429) throw new Error('本月压缩次数已用完');
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.message || `上传失败 (${uploadRes.status})`);
  }
  const countHdr = uploadRes.headers.get('Compression-Count');
  const prevCount = parseInt(localStorage.getItem('tinypng_count') || '0');
  updateTinyPngCount(countHdr ? parseInt(countHdr) : prevCount + 1);
  const outputUrl = uploadRes.headers.get('Location');
  if (!outputUrl) throw new Error('无法获取结果地址（可能受 CORS 限制）');
  const outputPath = new URL(outputUrl).pathname;
  const dlRes = await fetch('https://long-credit-bed9.hjq766.workers.dev' + outputPath, { headers: { 'Authorization': auth } });
  if (!dlRes.ok) throw new Error('下载压缩结果失败');
  return dlRes.blob();
}

/* 压缩 */
on(compBtn, 'click', async () => {
  const mode = getMode();
  if (mode.type === 'tinypng' && !mode.key) {
    showToast('请先输入 TinyPNG API Key', { type: 'warn' });
    return;
  }
  compBtn.disabled = true;
  progEl.hidden = false;
  barEl.style.width = '0%';
  compressed = new Array(uploaded.length).fill(null);
  dlBtn.hidden = true;
  summaryEl.hidden = true;

  let done = 0;
  const total = uploaded.filter(Boolean).length;

  for (let i = 0; i < uploaded.length; i++) {
    if (!uploaded[i]) continue;
    const { file } = uploaded[i];
    const card = gridEl.querySelector(`[data-idx="${i}"]`);

    setCardStatus(card, 'processing');

    try {
      let out;
      let targetResult = null;

      let localFallback = false;
      if (mode.type === 'tinypng') {
        if (file.size > 12 * 1024 * 1024) {
          localFallback = true;
          const enhanced = await compressJsquash(file, 0.8);
          if (enhanced !== null) {
            out = enhanced.size < file.size ? enhanced : file;
          } else {
            const opts = { maxSizeMB: Infinity, useWebWorker: true, libURL: new URL('../../public/vendor/browser-image-compression.js', location.href).href, initialQuality: 0.8, maxIteration: 20, alwaysKeepResolution: true, fileType: file.type };
            out = await imageCompression(file, opts);
            if (out.size >= file.size) out = file;
          }
        } else {
          out = await compressWithTinyPng(file, mode.key);
        }
      } else if (mode.type === 'target') {
        const targetBytes = mode.kb * 1024;
        if (file.size <= targetBytes) {
          out = file;
          targetResult = 'already';
        } else {
          const opts = {
            maxSizeMB: mode.kb / 1024,
            useWebWorker: true,
            libURL: new URL('../../public/vendor/browser-image-compression.js', location.href).href,
            initialQuality: 0.85,
            maxIteration: 25,
            alwaysKeepResolution: !mode.allowResize,
            fileType: file.type,
          };
          out = await imageCompression(file, opts);
          targetResult = out.size <= targetBytes * 1.05 ? 'met' : 'missed';
        }
      } else {
        const enhanced = await compressJsquash(file, mode.quality);
        if (enhanced !== null) {
          out = enhanced.size < file.size ? enhanced : file;
        } else if (mode.quality >= 1) {
          out = file;
        } else {
          const opts = {
            maxSizeMB: Infinity,
            useWebWorker: true,
            libURL: new URL('../../public/vendor/browser-image-compression.js', location.href).href,
            initialQuality: mode.quality,
            maxIteration: 20,
            alwaysKeepResolution: true,
            fileType: file.type,
          };
          out = await imageCompression(file, opts);
          if (out.size >= file.size) out = file;
        }
      }

      const saved = file.size - out.size;
      const ratio = saved > 0 ? Math.round((saved / file.size) * 100) : 0;

      compressed[i] = { file: out, name: file.name };

      if (card) {
        const sizeEl  = card.querySelector('[data-compressed-size]');
        const ratioEl = card.querySelector('[data-ratio]');
        if (sizeEl) sizeEl.textContent = fmtSize(out.size);
        if (targetResult === 'already') {
          if (ratioEl) { ratioEl.textContent = '已在目标内'; ratioEl.classList.add('same'); }
          setCardStatus(card, 'done', '已在目标内');
        } else if (targetResult === 'missed') {
          if (ratioEl) { ratioEl.textContent = ratio > 0 ? `-${ratio}%` : '无变化'; ratioEl.classList.add('fail'); }
          setCardStatus(card, 'fail', '未达目标');
        } else {
          if (ratioEl) {
            ratioEl.textContent = ratio > 0 ? `-${ratio}%` : '无变化';
            ratioEl.classList.add(ratio > 0 ? 'good' : 'same');
          }
          setCardStatus(card, 'done', ratio > 0 ? `-${ratio}%` : '无变化');
        }
        const dlSingleBtn = card.querySelector('[data-dl-single]');
        if (dlSingleBtn) dlSingleBtn.hidden = false;
      }
    } catch (err) {
      console.error(`[images_compress] ${file.name} 压缩失败:`, err);
      if (card) {
        const sizeEl = card.querySelector('[data-compressed-size]');
        if (sizeEl) { sizeEl.textContent = '失败'; sizeEl.classList.add('fail'); }
        setCardStatus(card, 'fail');
      }
    }

    done++;
    barEl.style.width = (done / total * 100) + '%';
    progText.textContent = `${done} / ${total}`;
  }

  progEl.hidden = true;
  compBtn.disabled = false;
  updateButtons();

  const successCount = compressed.filter(Boolean).length;
  if (successCount) {
    dlBtn.hidden = false;
    dlBtn.textContent = successCount > 1 ? '批量下载 ZIP' : '下载图片';
    updateSummary();
    showToast(`压缩完成，共 ${successCount} 张`, { type: 'success' });
  }
});

/* 下载 */
on(dlBtn, 'click', async () => {
  const done = compressed.filter(Boolean);
  if (!done.length) return;

  if (done.length === 1) {
    downloadBlob(done[0].file, 'compressed_' + done[0].name);
    showToast('开始下载');
    return;
  }

  if (typeof JSZip === 'undefined') {
    showToast('ZIP 库未加载，请稍后重试', { type: 'error' });
    return;
  }
  const zip = new JSZip();
  done.forEach(c => zip.file('compressed_' + c.name, c.file));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, 'compressed_images.zip');
  showToast('开始下载压缩包', { type: 'success' });
});

/* 清空 */
on(clearBtn, 'click', () => {
  uploaded.forEach(u => u && URL.revokeObjectURL(u.preview));
  uploaded = []; compressed = [];
  gridEl.innerHTML = '';
  dlBtn.hidden = true;
  clearBtn.hidden = true;
  compBtn.disabled = true;
  progEl.hidden = true;
  summaryEl.hidden = true;
  barEl.style.width = '0%';
  showToast('已清空');
});
