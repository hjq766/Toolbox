/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, escapeHtml } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ========== 1. 工具函数 ========== */

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const MAX_TOTAL_BYTES = 200 * 1024 * 1024;
const MAX_SPLIT_PAGES = 500;
const MAX_SPLIT_FILES = 500;
const MAX_SELECTED_PAGES = 2000;

/**
 * 解析页面范围字符串 → 0-indexed 页码数组的数组
 * 例：parseRanges("1-3, 5, 7-8", 10) → [[0,1,2], [4], [6,7]]
 */
function parseRanges(str, pageCount) {
  const parts = str.split(',').map(s => s.trim());
  if (!parts.length || parts.some(seg => !seg)) return [];
  const ranges = parts.map(seg => {
    const range = seg.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      if (from < 1 || to > pageCount || from > to) return [];
      return Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
    }
    if (!/^\d+$/.test(seg)) return [];
    const n = Number(seg);
    if (n < 1 || n > pageCount) return [];
    return [n - 1];
  });
  return ranges.some(range => range.length === 0) ? [] : ranges;
}

function getRangeLimitError(segments) {
  if (segments.length > MAX_SPLIT_FILES) {
    return `自定义拆分最多生成 ${MAX_SPLIT_FILES} 个文件`;
  }
  const selectedPages = segments.reduce((sum, range) => sum + range.length, 0);
  if (selectedPages > MAX_SELECTED_PAGES) {
    return `自定义拆分累计最多处理 ${MAX_SELECTED_PAGES} 页`;
  }
  return '';
}

function setProgress(barEl, statusEl, pct, text) {
  barEl.style.setProperty('--progress', `${pct}%`);
  statusEl.textContent = text;
}

/* ========== 2. 模式切换 ========== */
const modeBtns = $$('[data-mode-tabs] [data-mode]');
const panels   = $$('[data-panel]');

modeBtns.forEach(b => on(b, 'click', () => {
  modeBtns.forEach(x => x.classList.toggle('is-active', x === b));
  panels.forEach(p => { p.hidden = p.dataset.panel !== b.dataset.mode; });
}));

/* ══════════════════════════════════════════════════
   合并模块
══════════════════════════════════════════════════ */

/* ── 3. 合并状态 ── */
/** @type {{ file: File, bytes: ArrayBuffer, pageCount: number }[]} */
let mergeFiles = [];

/* ── 4. 合并 DOM 引用 ── */
const mergeDropEl   = $('[data-merge-drop]');
const mergeFileEl   = $('[data-merge-file]');
const mergeListEl   = $('[data-merge-list]');
const mergeFilesEl  = $('[data-merge-files]');
const mergeSummary  = $('[data-merge-summary]');
const statFiles     = $('[data-stat-files]');
const statPages     = $('[data-stat-pages]');
const mergeRunBtn   = $('[data-action="merge-run"]');
const mergeProgress = $('[data-merge-progress]');
const mergeBar      = $('[data-merge-bar]');
const mergeStatus   = $('[data-merge-status]');
const outName       = $('[data-out-name]');

/* ── 5. 合并文件列表渲染 ── */
function renderMergeList() {
  mergeFilesEl.innerHTML = '';
  mergeFiles.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'u-row u-gap-2';
    row.dataset.mergeItem = idx;

    // 上移 / 下移
    const btnUp   = mkBtn('arrow-up', '上移', idx === 0);
    const btnDown = mkBtn('arrow-down', '下移', idx === mergeFiles.length - 1);
    btnUp.dataset.action   = 'move-up';
    btnUp.dataset.idx      = idx;
    btnDown.dataset.action = 'move-down';
    btnDown.dataset.idx    = idx;

    // 文件信息
    const info = document.createElement('div');
    info.className = 'u-grow u-min-0';
    info.innerHTML =
      `<div class="u-truncate u-text-sm">${escapeHtml(item.file.name)}</div>` +
      `<div class="u-text-xs u-muted">${item.pageCount} 页 · ${fmtSize(item.file.size)}</div>`;

    // 删除
    const btnDel = mkBtn('x', '移除');
    btnDel.dataset.action = 'remove';
    btnDel.dataset.idx    = idx;
    row.append(btnUp, btnDown, info, btnDel);
    mergeFilesEl.appendChild(row);
  });
  window.refreshIcons?.(mergeFilesEl);

  const hasFiles = mergeFiles.length > 0;
  mergeListEl.hidden    = !hasFiles;
  mergeSummary.hidden   = !hasFiles;
  mergeRunBtn.disabled  = mergeFiles.length < 2;

  if (hasFiles) {
    statFiles.textContent = mergeFiles.length;
    statPages.textContent = mergeFiles.reduce((s, f) => s + f.pageCount, 0);
  }
}

function mkBtn(icon, title, disabled = false) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn is-ghost is-sm u-no-shrink';
  b.innerHTML = `<i data-lucide="${icon}" class="icon-16"></i>`;
  b.title = title;
  if (disabled) b.disabled = true;
  return b;
}

/* ── 6. 合并文件操作事件 ── */
on(mergeFilesEl, 'click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);

  if (btn.dataset.action === 'remove') {
    mergeFiles.splice(idx, 1);
    renderMergeList();
  } else if (btn.dataset.action === 'move-up' && idx > 0) {
    [mergeFiles[idx - 1], mergeFiles[idx]] = [mergeFiles[idx], mergeFiles[idx - 1]];
    renderMergeList();
  } else if (btn.dataset.action === 'move-down' && idx < mergeFiles.length - 1) {
    [mergeFiles[idx], mergeFiles[idx + 1]] = [mergeFiles[idx + 1], mergeFiles[idx]];
    renderMergeList();
  }
});

on($('[data-action="merge-clear"]'), 'click', () => {
  mergeFiles = [];
  renderMergeList();
});

/* ── 7. 合并上传 ── */
async function addMergeFiles(files) {
  const pdfs = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
  if (!pdfs.length) { showToast('请上传 PDF 文件', { type: 'error' }); return; }

  const nextSize = mergeFiles.reduce((sum, item) => sum + item.file.size, 0)
    + pdfs.reduce((sum, file) => sum + file.size, 0);
  if (nextSize > MAX_TOTAL_BYTES) {
    showToast('文件总大小不能超过 200 MB', { type: 'error' });
    return;
  }
  if (typeof PDFLib === 'undefined') {
    showToast('PDF 组件加载失败，请刷新页面重试', { type: 'error' });
    return;
  }

  for (const file of pdfs) {
    try {
      const bytes = await file.arrayBuffer();
      const doc   = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
      if (doc.isEncrypted) throw new Error('encrypted');
      mergeFiles.push({ file, bytes, pageCount: doc.getPageCount() });
    } catch {
      showToast(`"${file.name}" 读取失败，跳过`, { type: 'error' });
    }
  }
  renderMergeList();
}

initUploadZone({ dropEl: mergeDropEl, fileEl: mergeFileEl, onFiles: addMergeFiles, accept: 'pdf', multiple: true });

/* ── 8. 执行合并 ── */
on(mergeRunBtn, 'click', async () => {
  if (mergeFiles.length < 2) { showToast('请至少添加 2 个 PDF 文件', { type: 'error' }); return; }
  if (typeof PDFLib === 'undefined') { showToast('PDF 组件加载失败，请刷新页面重试', { type: 'error' }); return; }

  mergeRunBtn.disabled  = true;
  mergeProgress.hidden  = false;
  setProgress(mergeBar, mergeStatus, 0, '准备中…');

  try {
    const merged = await PDFLib.PDFDocument.create();
    const total  = mergeFiles.length;

    for (let i = 0; i < total; i++) {
      setProgress(mergeBar, mergeStatus, Math.round((i / total) * 90), `正在处理第 ${i + 1} 个文件…`);
      const src   = await PDFLib.PDFDocument.load(mergeFiles[i].bytes, { ignoreEncryption: true });
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }

    setProgress(mergeBar, mergeStatus, 95, '正在保存…');
    const bytes    = await merged.save();
    const filename = `${(outName.value.trim() || 'merged').replace(/\.pdf$/i, '')}.pdf`;
    downloadBlob(new Blob([bytes], { type: 'application/pdf' }), filename);
    setProgress(mergeBar, mergeStatus, 100, '完成 ✓');
    showToast(`已下载：${filename}`, { type: 'success' });
  } catch (err) {
    showToast(`合并失败：${err.message}`, { type: 'error' });
    mergeProgress.hidden = true;
  } finally {
    mergeRunBtn.disabled = false;
  }
});

/* ══════════════════════════════════════════════════
   拆分模块
══════════════════════════════════════════════════ */

/* ── 9. 拆分状态 ── */
let splitFile  = null;
let splitBytes = null;
let splitPages = 0;
let splitMode  = 'each';   // 'each' | 'range'

/* ── 10. 拆分 DOM 引用 ── */
const splitDropEl    = $('[data-split-drop]');
const splitFileEl    = $('[data-split-file]');
const splitInfoEl    = $('[data-split-info]');
const splitFname     = $('[data-split-fname]');
const splitPagesEl   = $('[data-split-pages]');
const splitSizeEl    = $('[data-split-size]');
const splitRunBtn    = $('[data-action="split-run"]');
const splitProgress  = $('[data-split-progress]');
const splitBar       = $('[data-split-bar]');
const splitStatus    = $('[data-split-status]');
const rangePanelEl   = $('[data-range-panel]');
const rangeInput     = $('[data-range-input]');
const rangeHint      = $('[data-range-hint]');
const splitModeBtns  = $$('[data-split-mode] [data-val]');

/* ── 11. 拆分上传 ── */
async function loadSplitFile(files) {
  const file = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
  if (!file) { showToast('请上传 PDF 文件', { type: 'error' }); return; }
  if (file.size > MAX_TOTAL_BYTES) { showToast('PDF 文件不能超过 200 MB', { type: 'error' }); return; }
  if (typeof PDFLib === 'undefined') { showToast('PDF 组件加载失败，请刷新页面重试', { type: 'error' }); return; }

  try {
    const bytes = await file.arrayBuffer();
    const doc   = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
    if (doc.isEncrypted) throw new Error('encrypted');
    splitFile  = file;
    splitBytes = bytes;
    splitPages = doc.getPageCount();

    splitInfoEl.hidden    = false;
    splitFname.textContent = file.name;
    splitPagesEl.textContent = splitPages;
    splitSizeEl.textContent  = fmtSize(file.size);
    splitRunBtn.disabled  = false;
    updateRangeHint();
    // 替换上传区为已上传状态
    splitDropEl.classList.add('is-done');
  } catch {
    showToast('PDF 读取失败，请确认文件未加密', { type: 'error' });
  }
}

initUploadZone({ dropEl: splitDropEl, fileEl: splitFileEl, onFiles: loadSplitFile, accept: 'pdf', multiple: false });

/* ── 12. 清空拆分 ── */
on($('[data-action="split-clear"]'), 'click', () => {
  splitFile = null; splitBytes = null; splitPages = 0;
  splitInfoEl.hidden   = true;
  splitRunBtn.disabled = true;
  splitProgress.hidden = true;
  splitDropEl.classList.remove('is-done');
  rangeHint.textContent = '';
  rangeInput.value = '';
});

/* ── 13. 拆分模式切换 ── */
splitModeBtns.forEach(b => on(b, 'click', () => {
  splitModeBtns.forEach(x => x.classList.toggle('is-active', x === b));
  splitMode = b.dataset.val;
  rangePanelEl.hidden = splitMode !== 'range';
  updateRangeHint();
}));

function updateRangeHint() {
  if (!splitPages) return;
  if (splitMode === 'each') {
    rangeHint.textContent = '';
    return;
  }
  const val = rangeInput.value.trim();
  if (!val) { rangeHint.textContent = ''; return; }
  const segments = parseRanges(val, splitPages);
  if (!segments.length) {
    rangeHint.textContent = '范围无效，请检查输入';
    return;
  }
  rangeHint.textContent = getRangeLimitError(segments)
    || `将拆分为 ${segments.length} 个 PDF 文件`;
}

on(rangeInput, 'input', updateRangeHint);

/* ── 14. 执行拆分 ── */
on(splitRunBtn, 'click', async () => {
  if (!splitBytes) { showToast('请先上传 PDF 文件', { type: 'error' }); return; }
  if (typeof PDFLib === 'undefined' || typeof JSZip === 'undefined') {
    showToast('PDF 或 ZIP 组件加载失败，请刷新页面重试', { type: 'error' });
    return;
  }

  let segments;
  if (splitMode === 'each') {
    if (splitPages > MAX_SPLIT_PAGES) {
      showToast(`逐页拆分最多支持 ${MAX_SPLIT_PAGES} 页，请改用自定义范围`, { type: 'warn' });
      return;
    }
    segments = Array.from({ length: splitPages }, (_, i) => [i]);
  } else {
    segments = parseRanges(rangeInput.value.trim(), splitPages);
    if (!segments.length) { showToast('页面范围无效，请检查输入', { type: 'error' }); return; }
    const limitError = getRangeLimitError(segments);
    if (limitError) { showToast(limitError, { type: 'warn' }); return; }
  }

  splitRunBtn.disabled  = true;
  splitProgress.hidden  = false;
  setProgress(splitBar, splitStatus, 0, '准备中…');

  try {
    const srcDoc  = await PDFLib.PDFDocument.load(splitBytes, { ignoreEncryption: true });
    const zip     = new JSZip();
    const padLen  = String(segments.length).length;
    const total   = segments.length;

    for (let i = 0; i < total; i++) {
      setProgress(splitBar, splitStatus, Math.round((i / total) * 90), `正在处理第 ${i + 1} 份…`);
      const newDoc = await PDFLib.PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, segments[i]);
      copied.forEach(p => newDoc.addPage(p));
      const bytes  = await newDoc.save();
      const num    = String(i + 1).padStart(padLen, '0');
      zip.file(`part_${num}.pdf`, bytes);
    }

    setProgress(splitBar, splitStatus, 95, '正在打包 ZIP…');
    const zipBlob  = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 1 } });
    const basename = splitFile.name.replace(/\.pdf$/i, '');
    downloadBlob(zipBlob, `${basename}_split.zip`);
    setProgress(splitBar, splitStatus, 100, `完成 ✓ 共 ${total} 个文件`);
    showToast(`已下载 ${total} 个 PDF（ZIP）`, { type: 'success' });
  } catch (err) {
    showToast(`拆分失败：${err.message}`, { type: 'error' });
    splitProgress.hidden = true;
  } finally {
    splitRunBtn.disabled = false;
  }
});
