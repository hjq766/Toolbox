/* 0. 导入 */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, delegate, escapeHtml } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* 1. 状态 */
let uploaded   = [];   // { file, content } | null
let compressed = [];   // { name, content } | null

/* 2. DOM 引用 */
const dropEl   = $('[data-drop]');
const fileEl   = $('[data-file]');
const gridEl   = $('[data-grid]');
const barEl    = $('[data-bar]');
const progEl   = $('[data-progress]');
const progText = $('[data-progress-text]');
const compBtn  = $('[data-action="compress"]');
const dlBtn    = $('[data-action="download"]');
const clrBtn   = $('[data-action="clear"]');
const summaryEl = $('[data-summary]');

/* 3. 工具函数 */
function fmtSize(b) {
  if (!b) return '0 B';
  const k = 1024, u = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + u[i];
}

function getOpt(name) {
  const el = $(`[data-opt="${name}"]`);
  return el ? el.checked : true;
}

function hasFiles() { return uploaded.some(Boolean); }

function updateButtons() {
  const has = hasFiles();
  compBtn.disabled = !has;
  clrBtn.hidden = !has;
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
    totalBefore += new Blob([uploaded[i].content]).size;
    totalAfter  += new Blob([compressed[i].content]).size;
  }
  if (!count) { summaryEl.hidden = true; return; }
  const saved = totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;
  $('[data-summary-count]').textContent  = count;
  $('[data-summary-saved]').textContent  = saved > 0 ? `-${saved}%` : '0%';
  $('[data-summary-before]').textContent = fmtSize(totalBefore);
  $('[data-summary-after]').textContent  = fmtSize(totalAfter);
  summaryEl.hidden = false;
}

function compressSvg(svgContent) {
  const doc = new DOMParser().parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) throw new Error('无效 SVG');

  if (getOpt('comments')) {
    const iter = doc.createNodeIterator(svg, NodeFilter.SHOW_COMMENT);
    let n; while ((n = iter.nextNode())) n.remove();
  }

  svg.querySelectorAll('*').forEach(el => {
    if (getOpt('empty')) [...el.attributes].forEach(a => { if (a.value === '') el.removeAttribute(a.name); });
    if (getOpt('defaults')) {
      if (el.getAttribute('fill') === '#000000' || el.getAttribute('fill') === 'black') el.removeAttribute('fill');
      if (el.getAttribute('stroke') === 'none') el.removeAttribute('stroke');
      if (el.getAttribute('stroke-width') === '1') el.removeAttribute('stroke-width');
      if (el.getAttribute('opacity') === '1') el.removeAttribute('opacity');
      if (el.getAttribute('fill-opacity') === '1') el.removeAttribute('fill-opacity');
      if (el.getAttribute('stroke-opacity') === '1') el.removeAttribute('stroke-opacity');
    }
  });
  if (getOpt('emptyg')) svg.querySelectorAll('g').forEach(g => {
    if (!g.children.length && !g.getAttribute('transform')) g.remove();
  });

  let result = new XMLSerializer().serializeToString(svg);
  if (getOpt('whitespace')) result = result.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').replace(/\n/g, '');
  return result;
}

/* 4. 卡片渲染 */
function createCard(file, content, index) {
  const el = document.createElement('div');
  el.className = 'preview-item';
  el.dataset.idx = index;
  el.innerHTML = `
    <div class="preview-img"><div class="svg-thumb" data-svg>${content}</div></div>
    <div class="preview-info">
      <div class="fname">${escapeHtml(file.name)}</div>
      <div class="info-row"><span>原始大小</span><span>${fmtSize(file.size)}</span></div>
      <div class="info-row"><span>压缩后</span><span class="cv" data-compressed-size>—</span></div>
      <div class="info-row"><span>节省</span><span class="cv" data-ratio>—</span></div>
      <span class="status-badge is-pending" data-status>待压缩</span>
      <button class="btn is-sm" data-dl-single="${index}" hidden style="margin-top:var(--space-2)"><i data-lucide="download"></i> 下载</button>
    </div>
    <button class="remove-btn" data-remove="${index}"><i data-lucide="x"></i></button>`;
  gridEl.appendChild(el);
  if (window.refreshIcons) window.refreshIcons(el);
}

/* 5. 事件绑定 */
initUploadZone({ dropEl, fileEl, onFiles: handleFiles, accept: '*', multiple: true });

async function handleFiles(files) {
  let added = 0;
  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.svg')) continue;
    added++;
    const content = await file.text();
    uploaded.push({ file, content });
    createCard(file, content, uploaded.length - 1);
  }
  if (!added && files.length) return showToast('请上传 SVG 文件', { type: 'warn' });
  updateButtons();
}

/* 移除 + 单个下载 */
delegate(gridEl, 'click', '[data-remove]', (e, btn) => {
  const idx = +btn.dataset.remove;
  btn.closest('.preview-item').remove();
  uploaded[idx] = null;
  compressed[idx] = null;
  if (!hasFiles()) { uploaded = []; compressed = []; dlBtn.hidden = true; summaryEl.hidden = true; }
  updateButtons();
  if (compressed.some(Boolean)) updateSummary();
});

delegate(gridEl, 'click', '[data-dl-single]', (e, btn) => {
  const c = compressed[+btn.dataset.dlSingle];
  if (c) downloadBlob(new Blob([c.content], { type: 'image/svg+xml' }), c.name);
});

/* 压缩 */
on(compBtn, 'click', () => {
  const total = uploaded.filter(Boolean).length;
  if (!total) return;
  compBtn.disabled = true;
  progEl.hidden = false;
  barEl.style.width = '0%';
  compressed = new Array(uploaded.length).fill(null);
  dlBtn.hidden = true;
  summaryEl.hidden = true;

  let done = 0;
  for (let i = 0; i < uploaded.length; i++) {
    const entry = uploaded[i];
    if (!entry) continue;
    const card = gridEl.querySelector(`[data-idx="${i}"]`);
    setCardStatus(card, 'processing');

    try {
      const result = compressSvg(entry.content);
      const os = new Blob([entry.content]).size;
      const cs = new Blob([result]).size;
      const ratio = os > 0 ? Math.round((1 - cs / os) * 100) : 0;
      compressed[i] = { name: `compressed_${entry.file.name}`, content: result };

      if (card) {
        const sizeEl  = card.querySelector('[data-compressed-size]');
        const ratioEl = card.querySelector('[data-ratio]');
        if (sizeEl) sizeEl.textContent = fmtSize(cs);
        if (ratioEl) {
          ratioEl.textContent = ratio > 0 ? `-${ratio}%` : '无变化';
          ratioEl.classList.add(ratio > 0 ? 'good' : 'same');
        }
        setCardStatus(card, 'done', `-${ratio}%`);
        const dlSingleBtn = card.querySelector('[data-dl-single]');
        if (dlSingleBtn) dlSingleBtn.hidden = false;
        const preview = card.querySelector('[data-svg]');
        if (preview) {
          preview.innerHTML = result;
        }
      }
    } catch {
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
    dlBtn.innerHTML = successCount > 1
      ? '<i data-lucide="download"></i> 批量下载 ZIP'
      : '<i data-lucide="download"></i> 下载 SVG';
    if (window.refreshIcons) window.refreshIcons(dlBtn);
    updateSummary();
    showToast(`压缩完成，共 ${successCount} 个`, { type: 'success' });
  }
});

/* 批量下载 */
on(dlBtn, 'click', async () => {
  const items = compressed.filter(Boolean);
  if (!items.length) return;
  if (items.length === 1) {
    downloadBlob(new Blob([items[0].content], { type: 'image/svg+xml' }), items[0].name);
    showToast('开始下载');
    return;
  }
  if (typeof JSZip === 'undefined') return showToast('ZIP 库未加载，请稍后重试', { type: 'error' });
  const zip = new JSZip();
  items.forEach(f => zip.file(f.name, f.content));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, 'compressed_svgs.zip');
  showToast('开始下载压缩包', { type: 'success' });
});

/* 清空 */
on(clrBtn, 'click', () => {
  uploaded = []; compressed = [];
  gridEl.innerHTML = '';
  dlBtn.hidden = true; clrBtn.hidden = true;
  compBtn.disabled = true; progEl.hidden = true;
  summaryEl.hidden = true; barEl.style.width = '0%';
  showToast('已清空');
});
