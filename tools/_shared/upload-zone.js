/**
 * 共享上传交互模块
 * 提供：全页面拖拽蒙层 + 粘贴上传 + 统一上传区域行为 + 可选文件夹批量导入
 *
 * 用法：
 *   import { initUploadZone } from '../_shared/upload-zone.js';
 *   initUploadZone({
 *     dropEl,           // 上传区域 DOM（label / div）
 *     fileEl,           // <input type="file"> DOM
 *     onFiles(files),   // 回调：收到文件列表
 *     accept: 'image',  // 'image' | 'pdf' | '*'（默认 'image'）
 *     multiple: false,  // 是否多选
 *     dirEl,            // 可选：<input type="file" webkitdirectory> DOM。
 *                       //       传入后自动绑定 change，并自动绑定 dropEl 内的
 *                       //       [data-pick-dir] 按钮 click 触发文件夹选择。
 *   });
 */

const OVERLAY_ID = '__upload-overlay';
const zones = [];
let globalEventsBound = false;
let globalDragCounter = 0;

function getOrCreateOverlay() {
  let el = document.getElementById(OVERLAY_ID);
  if (el) return el;
  el = document.createElement('div');
  el.id = OVERLAY_ID;
  Object.assign(el.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: 'color-mix(in srgb, var(--color-brand) 8%, transparent)',
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
  if (accept === '*' || accept === 'any') return true;
  if (accept === 'image') return file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name);
  if (accept === 'pdf') return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  return true;
}

async function readEntryRecursive(entry) {
  if (entry.isFile) {
    return new Promise(resolve => {
      entry.file(f => {
        try {
          Object.defineProperty(f, 'webkitRelativePath', {
            value: entry.fullPath.replace(/^\//, ''),
            configurable: true,
          });
        } catch (_) {}
        resolve([f]);
      }, () => resolve([]));
    });
  }
  if (entry.isDirectory) {
    const reader = entry.createReader();
    const all = [];
    const readBatch = () => new Promise((res, rej) =>
      reader.readEntries(async batch => {
        if (!batch.length) { res(); return; }
        for (const child of batch) all.push(...await readEntryRecursive(child));
        readBatch().then(res).catch(rej);
      }, rej)
    );
    await readBatch();
    return all;
  }
  return [];
}

export function initUploadZone({ dropEl, fileEl, onFiles, accept = 'image', multiple = false, onDelete, dirEl }) {
  if (!dropEl || !fileEl || !onFiles) return;
  const overlay = getOrCreateOverlay();
  const zone = {
    dropEl,
    accept,
    multiple,
    dirEl,
    onFiles,
    filterFiles,
    extractDroppedFiles,
  };
  zones.push(zone);
  bindGlobalEvents(overlay);

  /* ---- 上传区域点击 ---- */
  const labelOwnsInput = dropEl.tagName === 'LABEL' && dropEl.contains(fileEl);
  if (!labelOwnsInput) {
    dropEl.addEventListener('click', e => {
      if (e.target === fileEl) return;
      if (e.target.closest('[data-pick-dir], [data-no-pick]')) return;
      fileEl.click();
    });
  }

  /* ---- input change ---- */
  fileEl.addEventListener('change', () => {
    const files = filterFiles(fileEl.files);
    if (files.length) onFiles(files);
    fileEl.value = '';
  });

  /* ---- 文件夹选择（可选） ---- */
  if (dirEl) {
    dirEl.addEventListener('change', () => {
      const files = filterFiles(dirEl.files);
      if (files.length) onFiles(files);
      dirEl.value = '';
    });
    // 自动绑定 dropEl 内任意 [data-pick-dir] 按钮
    dropEl.querySelectorAll('[data-pick-dir]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        dirEl.click();
      });
    });
  }

  /* ---- 上传区域拖拽（保留原有行为） ---- */
  dropEl.addEventListener('dragover', e => e.preventDefault());
  dropEl.addEventListener('drop', async e => {
    e.preventDefault();
    e.stopPropagation();
    hideOverlay();
    const files = dirEl ? await extractDroppedFiles(e.dataTransfer) : filterFiles(e.dataTransfer.files);
    if (files.length) onFiles(files);
  });

  function filterFiles(fileList) {
    const arr = [...fileList].filter(f => matchAccept(f, accept));
    return multiple ? arr : arr.slice(0, 1);
  }

  async function extractDroppedFiles(dataTransfer) {
    const items = [...(dataTransfer.items || [])];
    if (!items.length || !items[0].webkitGetAsEntry) return filterFiles(dataTransfer.files);

    // DataTransferItem can become unavailable after async work starts. Snapshot
    // every entry synchronously so dragging multiple folders does not drop the
    // later folders while the first one is being read.
    const entries = items.map(item => item.webkitGetAsEntry?.()).filter(Boolean);
    if (!entries.length) return filterFiles(dataTransfer.files);

    const hasDir = entries.some(entry => entry.isDirectory);
    if (!hasDir) return filterFiles(dataTransfer.files);
    const nested = await Promise.all(entries.map(entry => readEntryRecursive(entry)));
    const all = nested.flat();
    const filtered = all.filter(f => matchAccept(f, accept));
    return multiple ? filtered : filtered.slice(0, 1);
  }

  if (onDelete) {
    const deleteBtn = document.querySelector('[data-img-delete]');
    if (deleteBtn) deleteBtn.addEventListener('click', onDelete);
  }

}

function getActiveZone() {
  return zones.find(zone => zone.dropEl.isConnected && zone.dropEl.offsetParent !== null)
    || zones.find(zone => zone.dropEl.isConnected);
}

function bindGlobalEvents(overlay) {
  if (globalEventsBound) return;
  globalEventsBound = true;

  document.addEventListener('dragenter', e => {
    e.preventDefault();
    globalDragCounter++;
    if (globalDragCounter === 1) {
      overlay.style.display = 'flex';
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    }
  });
  document.addEventListener('dragleave', e => {
    e.preventDefault();
    globalDragCounter--;
    if (globalDragCounter <= 0) {
      globalDragCounter = 0;
      hideOverlay();
    }
  });
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', async e => {
    e.preventDefault();
    globalDragCounter = 0;
    hideOverlay();
    const zone = getActiveZone();
    if (!zone) return;
    const files = zone.dirEl
      ? await zone.extractDroppedFiles(e.dataTransfer)
      : zone.filterFiles(e.dataTransfer.files);
    if (files.length) zone.onFiles(files);
  });
  document.addEventListener('paste', e => {
    const zone = getActiveZone();
    const items = e.clipboardData?.items;
    if (!zone || !items) return;
    const files = [];
    for (const item of items) {
      if (item.kind !== 'file') continue;
      const file = item.getAsFile();
      if (file && matchAccept(file, zone.accept)) files.push(file);
    }
    if (!files.length) return;
    e.preventDefault();
    zone.onFiles(zone.multiple ? files : [files[0]]);
  });
}

function hideOverlay() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) return;
  overlay.style.opacity = '0';
  setTimeout(() => { overlay.style.display = 'none'; }, 150);
}
