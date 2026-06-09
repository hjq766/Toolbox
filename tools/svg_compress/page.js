/* 0. 导入 */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, delegate } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { optimizeSvgString, parseSvg, PRESETS } from '../_shared/svg-optimize.js';

mountToolHeader();

/* 1. 状态 */
let uploaded   = [];   // { file:{name,size}, content } | null
let compressed = [];   // { name, content, original } | null
let currentPreset = 'balanced';

const PRESET_DESC = {
  safe: '仅移除注释和多余空白，<strong>绝对不影响渲染</strong>，节省幅度有限。',
  balanced: '移除 metadata、默认值、空 g，数值四舍五入到3位小数。<strong>推荐默认使用。</strong>',
  aggressive: '在平衡基础上进一步压缩路径 d 数据精度到2位小数，<strong>体积更小但可能丢失细微精度</strong>，复杂图标请检查效果。',
  custom: '从下方手动勾选每一项。',
};

/* 2. DOM 引用 */
const dropEl     = $('[data-drop]');
const fileEl     = $('[data-file]');
const fileDirEl  = $('[data-file-dir]');
const gridEl     = $('[data-grid]');
const barEl      = $('[data-bar]');
const progEl     = $('[data-progress]');
const progText   = $('[data-progress-text]');
const compBtn    = $('[data-action="compress"]');
const dlBtn      = $('[data-action="download"]');
const clrBtn     = $('[data-action="clear"]');
const summaryEl  = $('[data-summary]');
const presetRow  = $('[data-preset-row]');
const presetDesc = $('[data-preset-desc]');
const customPanel = $('[data-custom-panel]');
const pastePanel = $('[data-paste-panel]');
const pasteEl    = $('[data-paste]');
const pasteName  = $('[data-paste-name]');
const numericPrecisionEl = $('[data-opt-numeric-precision]');
const pathPrecisionEl = $('[data-opt-path-precision]');

/* 3. 工具函数 */
function fmtSize(b) {
  if (!b) return '0 B';
  const k = 1024, u = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + u[i];
}

function hasFiles() { return uploaded.some(Boolean); }

function updateButtons() {
  const has = hasFiles();
  compBtn.disabled = !has;
  clrBtn.hidden = !has;
}

function getOptions() {
  if (currentPreset === 'custom') {
    const opts = { sanitize: true };
    $$('[data-opt]').forEach(el => { opts[el.dataset.opt] = el.checked; });
    opts.numericPrecision = Number(numericPrecisionEl?.value ?? 3);
    opts.pathPrecision = Number(pathPrecisionEl?.value ?? 2);
    return opts;
  }
  return { ...PRESETS[currentPreset] };
}

function renderSvgPreview(container, code) {
  container.replaceChildren();
  const { svg } = parseSvg(code);
  container.appendChild(document.importNode(svg, true));
}

function waitForPaint() {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 0);
  });
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

function ratioClass(saved) {
  if (saved > 0) return 'good';
  return 'same';
}

function ratioText(saved) {
  if (saved <= 0) return '无变化';
  const pct = Math.round(saved * 100);
  if (saved >= 0.3) return `🚀 -${pct}%`;
  if (saved >= 0.1) return `✓ -${pct}%`;
  return `-${pct}%`;
}

function ratioLabel(saved) {
  if (saved >= 0.3) return '体积大幅减少';
  if (saved >= 0.1) return '体积明显减少';
  if (saved > 0)    return '体积小幅减少';
  return '无明显效果';
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

/* 4. 卡片渲染 */
function createCard(file, content, index) {
  const item = document.createElement('div');
  item.className = 'preview-item';
  item.dataset.idx = index;

  const img = document.createElement('div');
  img.className = 'preview-img';
  const thumb = document.createElement('div');
  thumb.className = 'svg-thumb';
  thumb.dataset.svg = '';
  try {
    const { code } = optimizeSvgString(content, PRESETS.safe);
    renderSvgPreview(thumb, code);
  } catch {
    thumb.textContent = '⚠ 解析失败';
  }
  img.appendChild(thumb);

  const info = document.createElement('div');
  info.className = 'preview-info';

  const fname = document.createElement('div');
  fname.className = 'fname';
  fname.textContent = file.name;
  fname.title = file.name;

  const rowOrig = document.createElement('div');
  rowOrig.className = 'info-row';
  rowOrig.append(makeSpan(null, '原始大小'), makeSpan(null, fmtSize(file.size)));

  const rowComp = document.createElement('div');
  rowComp.className = 'info-row';
  rowComp.append(makeSpan(null, '压缩后'), makeSpan('cv', '—', 'data-compressed-size'));

  const rowRatio = document.createElement('div');
  rowRatio.className = 'info-row';
  rowRatio.append(makeSpan(null, '节省'), makeSpan('cv', '—', 'data-ratio'));

  const badge = document.createElement('span');
  badge.className = 'status-badge is-pending';
  badge.dataset.status = '';
  badge.textContent = '待压缩';

  const dlSingle = document.createElement('button');
  dlSingle.className = 'btn is-sm u-mt-2';
  dlSingle.dataset.dlSingle = String(index);
  dlSingle.hidden = true;
  dlSingle.innerHTML = '<i data-lucide="download"></i> 下载';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn is-sm is-ghost u-mt-2';
  editBtn.dataset.openEditor = String(index);
  editBtn.title = '在 SVG 代码编辑器中打开此文件，进行精细编辑';
  editBtn.innerHTML = '<i data-lucide="pen-tool"></i> 编辑';

  const actions = document.createElement('div');
  actions.className = 'u-row u-gap-2';
  actions.append(dlSingle, editBtn);

  info.append(fname, rowOrig, rowComp, rowRatio, badge, actions);

  const remove = document.createElement('button');
  remove.className = 'remove-btn';
  remove.dataset.remove = String(index);
  remove.innerHTML = '<i data-lucide="x"></i>';

  item.append(img, info, remove);
  gridEl.appendChild(item);
  if (window.refreshIcons) window.refreshIcons(item);
}

function makeSpan(cls, text, dataAttr) {
  const el = document.createElement('span');
  if (cls) el.className = cls;
  if (dataAttr) el.setAttribute(dataAttr, '');
  el.textContent = text;
  return el;
}

/* 5. 文件接入 */
initUploadZone({ dropEl, fileEl, dirEl: fileDirEl, onFiles: handleFiles, accept: '*', multiple: true });

async function handleFiles(files) {
  let added = 0;
  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.svg')) continue;
    added++;
    const content = await file.text();
    uploaded.push({ file: { name: file.name, size: file.size }, content });
    createCard({ name: file.name, size: file.size }, content, uploaded.length - 1);
  }
  if (!added && files.length) return showToast('请上传 SVG 文件', { type: 'warn' });
  updateButtons();
}

/* 粘贴入口 */
on($('[data-action="toggle-paste"]'), 'click', () => {
  pastePanel.hidden = !pastePanel.hidden;
  if (!pastePanel.hidden) pasteEl.focus();
});
on($('[data-action="add-paste"]'), 'click', () => {
  const content = (pasteEl.value || '').trim();
  if (!content) return showToast('请先粘贴 SVG 代码', { type: 'warn' });
  if (!/<svg[\s\S]*<\/svg>/i.test(content)) return showToast('未识别到 SVG 内容', { type: 'warn' });
  let name = (pasteName.value || '').trim() || 'pasted.svg';
  if (!name.toLowerCase().endsWith('.svg')) name += '.svg';
  const size = new Blob([content]).size;
  uploaded.push({ file: { name, size }, content });
  createCard({ name, size }, content, uploaded.length - 1);
  pasteEl.value = '';
  pastePanel.hidden = true;
  updateButtons();
  showToast('已加入列表', { type: 'success' });
});

/* 6. 档位预设切换 */
on(presetRow, 'click', e => {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  currentPreset = btn.dataset.preset;
  $$('[data-preset]', presetRow).forEach(b => b.classList.toggle('is-active', b === btn));
  presetDesc.innerHTML = PRESET_DESC[currentPreset];
  customPanel.hidden = currentPreset !== 'custom';
});

/* 7. 移除 + 单个下载 + 在编辑器打开 */
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

delegate(gridEl, 'click', '[data-open-editor]', (e, btn) => {
  const idx = +btn.dataset.openEditor;
  const c = compressed[idx];
  const u = uploaded[idx];
  if (!u) return;
  // 优先用压缩后内容，没有则用原文
  const code = c ? c.content : u.content;
  try {
    sessionStorage.setItem('svg-handoff', JSON.stringify({
      from: 'svg_compress',
      name: u.file.name,
      code,
      ts: Date.now(),
    }));
  } catch {}
  window.location.href = '../svg_code_editor/';
});

/* 8. 压缩 */
on(compBtn, 'click', async () => {
  const total = uploaded.filter(Boolean).length;
  if (!total) return;
  compBtn.disabled = true;
  progEl.hidden = false;
  barEl.style.width = '0%';
  compressed = new Array(uploaded.length).fill(null);
  dlBtn.hidden = true;
  summaryEl.hidden = true;

  const options = getOptions();
  let done = 0;
  await waitForPaint();
  for (let i = 0; i < uploaded.length; i++) {
    const entry = uploaded[i];
    if (!entry) continue;
    const card = gridEl.querySelector(`[data-idx="${i}"]`);
    setCardStatus(card, 'processing');

    try {
      const { code, stats } = optimizeSvgString(entry.content, options);
      compressed[i] = { name: `compressed_${entry.file.name}`, content: code, original: entry.content };
      applyResultToCard(card, stats);
      // 重新渲染缩略图（用压缩后的内容）
      const preview = card?.querySelector('[data-svg]');
      if (preview) renderSvgPreview(preview, code);
    } catch (err) {
      applyFailToCard(card, err?.message || '未知错误');
    }
    done++;
    barEl.style.width = (done / total * 100) + '%';
    progText.textContent = `${done} / ${total}`;
    if (done % 4 === 0 || done === total) await waitForPaint();
  }

  progEl.hidden = true;
  compBtn.disabled = false;
  updateButtons();

  const successCount = compressed.filter(Boolean).length;
  if (successCount) {
    dlBtn.hidden = false;
    dlBtn.textContent = successCount > 1 ? '批量下载 ZIP' : '下载 SVG';
    updateSummary();
    showToast(`压缩完成，共 ${successCount} 个`, { type: 'success' });
  }
});

function applyResultToCard(card, stats) {
  if (!card) return;
  const sizeEl  = card.querySelector('[data-compressed-size]');
  const ratioEl = card.querySelector('[data-ratio]');
  const saved = stats.saved;
  const pct = Math.round(saved * 100);
  if (sizeEl) sizeEl.textContent = fmtSize(stats.after);
  if (ratioEl) {
    ratioEl.textContent = ratioText(saved);
    ratioEl.className = `cv ${ratioClass(saved)}`;
    ratioEl.title = ratioLabel(saved);
  }
  setCardStatus(card, 'done', saved > 0 ? `-${pct}%` : '0%');
  const dlSingleBtn = card.querySelector('[data-dl-single]');
  if (dlSingleBtn) dlSingleBtn.hidden = false;
}

function applyFailToCard(card, message) {
  if (!card) return;
  const sizeEl = card.querySelector('[data-compressed-size]');
  if (sizeEl) { sizeEl.textContent = '失败'; sizeEl.classList.add('is-fail'); }
  setCardStatus(card, 'fail');
  card.title = `压缩失败：${message}`;
}

/* 9. 批量下载 */
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

/* 10. 清空 */
on(clrBtn, 'click', () => {
  uploaded = []; compressed = [];
  gridEl.replaceChildren();
  dlBtn.hidden = true; clrBtn.hidden = true;
  compBtn.disabled = true; progEl.hidden = true;
  summaryEl.hidden = true; barEl.style.width = '0%';
  showToast('已清空');
});
