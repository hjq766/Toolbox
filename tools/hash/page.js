import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const modeTabs  = $$('[data-mode]');
const views     = $$('[data-view]');
const textInput = $('[data-input="text"]');
const keyInput  = $('[data-input="key"]');
const fileInput = $('[data-input="file"]');
const dropZone  = $('[data-drop]');
const resultPanel = $('[data-result-panel]');
const resultList  = $('[data-result-list]');

const ALGOS = ['MD5', 'SHA1', 'SHA256', 'SHA512', 'SHA3', 'RIPEMD160', 'SHA224', 'SHA384'];

/* ---------- 模式切换 ---------- */
function switchMode(mode) {
  modeTabs.forEach(b => b.classList.toggle('is-active', b.dataset.mode === mode));
  views.forEach(v => v.hidden = v.dataset.view !== mode);
  clearResults();
}
modeTabs.forEach(b => on(b, 'click', () => switchMode(b.dataset.mode)));

/* ---------- 公共：渲染一行结果 ---------- */
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function addGroupLabel(text) {
  const el = document.createElement('div');
  el.className = 'u-muted u-mt-4';
  el.style.cssText = 'font-size:var(--text-xs);font-weight:600';
  el.textContent = text;
  resultList.appendChild(el);
}

function addResultRow(algo, value) {
  const row = document.createElement('div');
  row.className = 'result-strip';
  row.innerHTML = `
    <span class="badge is-brand">${escapeHtml(algo)}</span>
    <span class="u-break u-grow">${escapeHtml(value)}</span>
    <button class="btn is-sm is-ghost" type="button" data-action="copy">复制</button>
  `;
  on(row.querySelector('[data-action="copy"]'), 'click', async () => {
    const ok = await copyText(value);
    showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
  });
  resultList.appendChild(row);
}

function clearResults() {
  resultList.innerHTML = '';
  resultPanel.hidden = true;
}

/* ---------- 文本哈希 ---------- */
function ensureCrypto() {
  if (window.CryptoJS) return true;
  showToast('CryptoJS 尚未加载，请稍候重试', { type: 'warn' });
  return false;
}

function calcText() {
  if (!ensureCrypto()) return;
  const text = textInput.value;
  const key  = keyInput.value;
  if (!text) { showToast('请输入要计算的文本', { type: 'warn' }); return; }

  clearResults();
  ALGOS.forEach(algo => {
    try {
      const fn = window.CryptoJS[algo];
      if (typeof fn === 'function') {
        addResultRow(algo, fn(text).toString());
      }
      if (key) {
        const hfn = window.CryptoJS['Hmac' + algo];
        if (typeof hfn === 'function') {
          addResultRow(`HMAC-${algo}`, hfn(text, key).toString());
        }
      }
    } catch (err) { console.warn(algo, err); }
  });
  resultPanel.hidden = false;
}

/* ---------- 文件哈希 ---------- */
function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function selectedAlgos() {
  return $$('[data-algo]:checked').map(el => el.dataset.algo);
}

function hashFile(file, algo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wa = window.CryptoJS.lib.WordArray.create(reader.result);
        const fn = window.CryptoJS[algo];
        resolve(fn(wa).toString());
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

async function handleFiles(files) {
  if (!files || !files.length) return;
  if (!ensureCrypto()) return;
  const algos = selectedAlgos();
  if (!algos.length) { showToast('请至少选择一种算法', { type: 'warn' }); return; }

  clearResults();
  resultPanel.hidden = false;
  showToast('正在计算…');

  for (const file of files) {
    addGroupLabel(`${file.name} · ${file.type || '未知类型'} · ${formatSize(file.size)}`);
    for (const algo of algos) {
      try {
        const v = await hashFile(file, algo);
        addResultRow(algo, v);
      } catch (err) {
        addResultRow(algo, '计算失败：' + err.message);
      }
    }
  }
  showToast('计算完成', { type: 'success' });
}

/* ---------- 拖放 ---------- */
['dragenter', 'dragover'].forEach(ev => on(dropZone, ev, (e) => {
  e.preventDefault(); e.stopPropagation();
  dropZone.style.background = 'var(--color-brand-soft)';
  dropZone.style.borderColor = 'var(--color-brand)';
}));
['dragleave', 'drop'].forEach(ev => on(dropZone, ev, (e) => {
  e.preventDefault(); e.stopPropagation();
  dropZone.style.background = '';
  dropZone.style.borderColor = '';
}));
on(dropZone, 'drop', (e) => handleFiles(e.dataTransfer.files));

on(fileInput, 'change', (e) => handleFiles(e.target.files));

/* ---------- 事件 ---------- */
on($('[data-action="calc-text"]'),    'click', calcText);
on($('[data-action="clear-text"]'),   'click', () => { textInput.value = ''; keyInput.value = ''; clearResults(); });
on($('[data-action="clear-result"]'), 'click', clearResults);
