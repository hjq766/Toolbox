import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ======== DOM ======== */
const inputEl    = $('[data-input]');
const fileEl     = $('[data-file]');
const detectEl   = $('[data-detect]');
const previewEl  = $('[data-preview]');
const outputEl   = $('[data-output]');
const excelHint  = $('[data-excel-hint]');

/* ======== 状态 ======== */
let headers = [];
let rows    = [];
let outFmt  = 'table';
let timer   = null;

/* ======== 自动检测 + 解析 ======== */
function detect(text) {
  text = text.trim();
  if (!text) return null;
  // JSON 数组
  if (text[0] === '[') {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr) && arr.length && typeof arr[0] === 'object' && arr[0] !== null) return 'json';
    } catch {}
  }
  // TSV（Tab 出现比逗号多）
  const firstLine = text.split('\n')[0] || '';
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  if (tabs > 0 && tabs >= commas) return 'tsv';
  return 'csv';
}

function parse() {
  const text = inputEl.value.trim();
  headers = [];
  rows = [];

  if (!text) { detectEl.textContent = ''; render(); return; }

  const fmt = detect(text);

  if (fmt === 'json') {
    try {
      const arr = JSON.parse(text);
      headers = Object.keys(arr[0]);
      rows = arr.map(o => headers.map(h => String(o[h] ?? '')));
      detectEl.textContent = `JSON · ${rows.length} 行 × ${headers.length} 列`;
    } catch {
      detectEl.textContent = 'JSON 格式错误';
      render(); return;
    }
  } else {
    const delim = fmt === 'tsv' ? '\t' : ',';
    const allRows = parseCSV(text, delim);
    if (!allRows.length) { detectEl.textContent = ''; render(); return; }
    // 首行当表头（列数 > 1 且行数 > 1）
    if (allRows.length > 1) {
      headers = allRows[0];
      rows = allRows.slice(1);
    } else {
      headers = allRows[0].map((_, i) => `列${i + 1}`);
      rows = allRows;
    }
    // 补齐列数
    const max = Math.max(headers.length, ...rows.map(r => r.length));
    while (headers.length < max) headers.push(`列${headers.length + 1}`);
    rows = rows.map(r => { while (r.length < max) r.push(''); return r; });
    detectEl.textContent = `${fmt.toUpperCase()} · ${rows.length} 行 × ${headers.length} 列`;
  }

  render();
}

function parseLazy() {
  clearTimeout(timer);
  timer = setTimeout(parse, 180);
}

/* ======== CSV 解析 ======== */
function parseCSV(text, d) {
  const result = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else {
      if (c === '"') q = true;
      else if (c === d) { row.push(cell); cell = ''; }
      else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
        if (c === '\r') i++;
        row.push(cell); cell = '';
        if (row.some(v => v.length)) result.push(row);
        row = [];
      } else cell += c;
    }
  }
  row.push(cell);
  if (row.some(v => v.length)) result.push(row);
  return result;
}

/* ======== 输出渲染 ======== */
function render() {
  const hasData = rows.length > 0;
  previewEl.hidden = true;
  outputEl.hidden = true;
  excelHint.hidden = true;

  if (!hasData) {
    previewEl.hidden = false;
    previewEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--fg-muted);font-size:var(--text-sm)">输入数据后自动显示结果</div>';
    return;
  }

  if (outFmt === 'table') {
    previewEl.hidden = false;
    const ths = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
    const limit = Math.min(rows.length, 500);
    const trs = rows.slice(0, limit).map(r =>
      '<tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>'
    ).join('');
    let html = `<table class="data-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    if (rows.length > limit) html += `<div style="padding:8px;text-align:center;font-size:var(--text-xs);color:var(--fg-muted)">仅展示前 ${limit} 行</div>`;
    previewEl.innerHTML = html;
  } else if (outFmt === 'excel') {
    excelHint.hidden = false;
  } else {
    outputEl.hidden = false;
    outputEl.value = format(outFmt);
  }
}

function format(fmt) {
  switch (fmt) {
    case 'csv': return toDelimited(',');
    case 'tsv': return toDelimited('\t');
    case 'json': {
      return JSON.stringify(rows.map(r => {
        const o = {};
        headers.forEach((h, i) => { o[h] = r[i]; });
        return o;
      }), null, 2);
    }
    case 'md': {
      const h = '| ' + headers.map(s => s.replace(/\|/g, '\\|')).join(' | ') + ' |';
      const s = '| ' + headers.map(() => '---').join(' | ') + ' |';
      const b = rows.map(r => '| ' + r.map(c => c.replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ') + ' |').join('\n');
      return h + '\n' + s + '\n' + b;
    }
    default: return '';
  }
}

function toDelimited(d) {
  const q = s => (s.includes(d) || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
  return headers.map(q).join(d) + '\n' + rows.map(r => r.map(q).join(d)).join('\n');
}

/* ======== Tab 切换 ======== */
$$('[data-tab]').forEach(btn => on(btn, 'click', () => {
  outFmt = btn.dataset.tab;
  $$('[data-tab]').forEach(b => b.classList.toggle('is-active', b === btn));
  render();
}));

/* ======== 输入事件 ======== */
on(inputEl, 'input', parseLazy);

/* ======== 文件上传 ======== */
initUploadZone({
  dropEl: inputEl,
  fileEl: fileEl,
  accept: '*',
  onFiles(files) { loadFile(files[0]); },
});

function loadFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!raw.length) { showToast('Excel 为空', { type: 'error' }); return; }
        // 转 CSV 填入输入框，后续走统一解析
        const csv = raw.map(r => r.map(c => {
          const s = String(c);
          return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
        }).join(',')).join('\n');
        inputEl.value = csv;
        parse();
        showToast(`已加载 ${file.name}（${wb.SheetNames[0]}）`, { type: 'success' });
      } catch (e) {
        console.error(e);
        showToast('Excel 解析失败', { type: 'error' });
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  // 文本文件
  const reader = new FileReader();
  reader.onload = () => {
    inputEl.value = reader.result;
    parse();
    showToast(`已加载 ${file.name}`, { type: 'success' });
  };
  reader.readAsText(file);
}

/* ======== 示例 & 清空 ======== */
const SAMPLE = `name,age,city,email
张三,28,北京,zhangsan@example.com
李四,32,上海,lisi@example.com
王五,25,广州,wangwu@example.com
赵六,30,深圳,zhaoliu@example.com
陈七,27,杭州,chenqi@example.com`;

on($('[data-action="sample"]'), 'click', () => { inputEl.value = SAMPLE; parse(); });
on($('[data-action="clear"]'), 'click', () => { inputEl.value = ''; parse(); });

/* ======== 复制 & 下载 ======== */
on($('[data-action="copy"]'), 'click', async () => {
  if (!rows.length) return;
  if (outFmt === 'excel') { showToast('Excel 请用下载', { type: 'error' }); return; }
  const text = outFmt === 'table' ? toDelimited(',') : format(outFmt);
  const ok = await copyText(text);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', doDownload);
on($('[data-action="download-excel"]'), 'click', downloadExcel);

function doDownload() {
  if (!rows.length) return;
  if (outFmt === 'excel') { downloadExcel(); return; }
  const text = outFmt === 'table' ? toDelimited(',') : format(outFmt);
  const map = { table: ['.csv','text/csv'], csv: ['.csv','text/csv'], tsv: ['.tsv','text/tab-separated-values'], json: ['.json','application/json'], md: ['.md','text/markdown'] };
  const [ext, mime] = map[outFmt] || ['.txt','text/plain'];
  downloadText(text, 'data' + ext, mime);
}

function downloadExcel() {
  if (!rows.length) return;
  try {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'data.xlsx');
  } catch (e) { showToast('导出失败', { type: 'error' }); }
}

/* ======== 初始化 ======== */
inputEl.value = SAMPLE;
parse();
