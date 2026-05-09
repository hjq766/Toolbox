/**
 * 共享上传交互模块
 * 提供：全页面拖拽蒙层 + 粘贴上传 + 统一上传区域行为
 *
 * 用法：
 *   import { initUploadZone } from '../_shared/upload-zone.js';
 *   initUploadZone({
 *     dropEl,           // 上传区域 DOM（label / div）
 *     fileEl,           // <input type="file"> DOM
 *     onFiles(files),   // 回调：收到文件列表
 *     accept: 'image',  // 'image' | 'pdf' | '*'（默认 'image'）
 *     multiple: false,  // 是否多选
 *   });
 */

const OVERLAY_ID = '__upload-overlay';

function getOrCreateOverlay() {
  let el = document.getElementById(OVERLAY_ID);
  if (el) return el;
  el = document.createElement('div');
  el.id = OVERLAY_ID;
  Object.assign(el.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: 'rgba(var(--color-brand-rgb, 59,130,246), .08)',
    backdropFilter: 'blur(2px)',
    display: 'none', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity .15s',
    pointerEvents: 'none',
  });
  el.innerHTML = `<div style="
    padding:32px 48px;border-radius:16px;
    background:var(--bg-surface,#fff);
    border:2px dashed var(--color-brand,#3b82f6);
    box-shadow:0 12px 40px rgba(0,0,0,.12);
    text-align:center;font-size:1.1rem;font-weight:600;
    color:var(--color-brand,#3b82f6);
    pointer-events:none;
  ">松开鼠标，上传文件</div>`;
  document.body.appendChild(el);
  return el;
}

function matchAccept(file, accept) {
  if (accept === '*') return true;
  if (accept === 'image') return file.type.startsWith('image/');
  if (accept === 'pdf') return file.type === 'application/pdf';
  return true;
}

export function initUploadZone({ dropEl, fileEl, onFiles, accept = 'image', multiple = false }) {
  if (!dropEl || !fileEl || !onFiles) return;
  const overlay = getOrCreateOverlay();
  let dragCounter = 0;

  /* ---- 上传区域点击 ---- */
  const labelOwnsInput = dropEl.tagName === 'LABEL' && dropEl.contains(fileEl);
  if (!labelOwnsInput) {
    dropEl.addEventListener('click', e => {
      if (e.target === fileEl) return;
      fileEl.click();
    });
  }

  /* ---- input change ---- */
  fileEl.addEventListener('change', () => {
    const files = filterFiles(fileEl.files);
    if (files.length) onFiles(files);
    fileEl.value = '';
  });

  /* ---- 上传区域拖拽（保留原有行为） ---- */
  dropEl.addEventListener('dragover', e => e.preventDefault());
  dropEl.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    hideOverlay();
    const files = filterFiles(e.dataTransfer.files);
    if (files.length) onFiles(files);
  });

  /* ---- 全页面拖拽蒙层 ---- */
  document.addEventListener('dragenter', e => {
    e.preventDefault();
    dragCounter++;
    if (dragCounter === 1) {
      overlay.style.display = 'flex';
      requestAnimationFrame(() => overlay.style.opacity = '1');
    }
  });
  document.addEventListener('dragleave', e => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) { dragCounter = 0; hideOverlay(); }
  });
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    dragCounter = 0;
    hideOverlay();
    const files = filterFiles(e.dataTransfer.files);
    if (files.length) onFiles(files);
  });

  /* ---- 全页面粘贴 ---- */
  document.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const it of items) {
      if (it.kind === 'file') {
        const f = it.getAsFile();
        if (f && matchAccept(f, accept)) files.push(f);
      }
    }
    if (files.length) {
      e.preventDefault();
      onFiles(multiple ? files : [files[0]]);
    }
  });

  function filterFiles(fileList) {
    const arr = [...fileList].filter(f => matchAccept(f, accept));
    return multiple ? arr : arr.slice(0, 1);
  }

  function hideOverlay() {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 150);
  }
}
