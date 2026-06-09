import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import * as D from './fake-data.js';

mountToolHeader();

/* ======== 通用工具 ======== */
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pad = (n, l = 2) => String(n).padStart(l, '0');
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* ======== Tab 切换 ======== */
const panels = { text: $('[data-panel="text"]'), table: $('[data-panel="table"]') };
$$('[data-mode]').forEach(btn => on(btn, 'click', () => {
  $$('[data-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
  for (const k in panels) panels[k].hidden = k !== btn.dataset.mode;
}));

/* ================================================================
   文本占位模式
   ================================================================ */
const textTypeEl   = $('[data-text-type]');
const textCountEl  = $('[data-text-count]');
const textOutputEl = $('[data-text-output]');
const textStatsEl  = $('[data-text-stats]');

function genTextContent() {
  const type = textTypeEl.value;
  const n = clamp(parseInt(textCountEl.value, 10) || 3, 1, 50);
  const src = type === 'lorem' ? D.LOREM : D.ZH_SENTENCES;
  const sep = type === 'lorem' ? ' ' : '';
  const paras = [];
  for (let i = 0; i < n; i++) {
    const count = randInt(3, 6);
    const sentences = Array.from({ length: count }, () => rand(src));
    paras.push(sentences.join(sep));
  }
  textOutputEl.value = paras.join('\n\n');
  updateTextStats();
}

function updateTextStats() {
  const t = textOutputEl.value;
  if (!t) { textStatsEl.textContent = ''; return; }
  const chars = t.length;
  const paras = t.split(/\n\n+/).filter(Boolean).length;
  textStatsEl.textContent = `${paras} 段 · ${chars} 字符`;
}

// 切换类型 / 改段落数 → 自动重新生成
on(textTypeEl, 'change', genTextContent);
on(textCountEl, 'input', genTextContent);

on($('[data-action="gen-text"]'), 'click', genTextContent);
on($('[data-action="copy-text"]'), 'click', async () => {
  if (!textOutputEl.value) { showToast('请先生成内容', { type: 'warn' }); return; }
  const ok = await copyText(textOutputEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear-text"]'), 'click', () => { textOutputEl.value = ''; textStatsEl.textContent = ''; });

/* ================================================================
   结构化数据模式 — 生成器注册
   ================================================================ */
// 列最小宽度（px），未列出的字段由浏览器自动分配
const COL_MIN_W = { name: 100, enName: 140, address: 220, company: 200, email: 160, url: 180, idCard: 190, job: 120 };

const FIELD_DEFS = {
  name:     { label: '中文姓名', gen: () => rand(D.SURNAMES) + rand(D.GIVEN_NAMES) },
  enName:   { label: '英文姓名', gen: () => rand(D.EN_FIRST_NAMES) + ' ' + rand(D.EN_LAST_NAMES) },
  phone:    { label: '手机号',   gen: () => rand(D.PHONE_PREFIXES) + String(randInt(10000000, 99999999)) },
  email:    { label: '邮箱',     gen: () => {
    const u = rand(D.USERNAME_PARTS) + randInt(10, 999);
    return u + '@' + rand(D.EMAIL_DOMAINS);
  }},
  idCard:   { label: '身份证号', gen: genIdCard },
  address:  { label: '地址',     gen: () => {
    const p = rand(D.PROVINCES);
    const suffix = rand(D.BUILDING_SUFFIX);
    const n = randInt(1, 300);
    let tail = suffix;
    if (['号', '号楼', '栋', '座'].includes(suffix)) tail = `${n}${suffix}`;
    else if (suffix === '弄18号') tail = `弄${randInt(1, 99)}号`;
    else if (suffix === '单元302室') tail = `${n}号${randInt(1, 6)}单元${randInt(101, 2501)}室`;
    else if (suffix === '号院') tail = `${n}号院`;
    else if (suffix === '广场A座') tail = `${randInt(1, 20)}号广场${String.fromCharCode(65 + randInt(0, 3))}座`;
    return p.name + rand(p.cities) + rand(D.STREETS) + tail;
  }},
  company:  { label: '公司名',   gen: () => {
    const p = rand(D.PROVINCES);
    const region = p.name
      .replace(/壮族自治区|回族自治区|维吾尔自治区|特别行政区/g, '')
      .replace(/自治区|省|市/g, '');
    return region + rand(D.COMPANY_PREFIXES) + rand(D.COMPANY_SUFFIXES) + rand(D.COMPANY_TYPES);
  }},
  job:      { label: '职位',     gen: () => rand(D.JOB_TITLES) },
  date:     { label: '日期',     gen: () => {
    const y = randInt(2020, 2026), m = randInt(1, 12), d = randInt(1, 28);
    return `${y}-${pad(m)}-${pad(d)}`;
  }},
  ip:       { label: 'IP 地址',  gen: () => `${randInt(1,223)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}` },
  url:      { label: 'URL',      gen: () => `https://www.${rand(D.USERNAME_PARTS)}${randInt(1,99)}.com/${rand(D.USERNAME_PARTS)}` },
  plate:    { label: '车牌号',   gen: () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    return rand(D.PLATE_PROVINCES) + letters[randInt(0, letters.length - 1)] + '·' +
      Array.from({ length: 5 }, () => chars[randInt(0, chars.length - 1)]).join('');
  }},
  username: { label: '用户名',   gen: () => rand(D.USERNAME_PARTS) + '_' + rand(D.USERNAME_PARTS) + randInt(1, 999) },
  uuid:     { label: 'UUID',     gen: genUUID },
  color:    { label: '颜色值',   gen: () => '#' + Array.from({ length: 6 }, () => '0123456789abcdef'[randInt(0, 15)]).join('') },
  number:   { label: '随机数字', gen: () => String(randInt(1, 99999)) },
};

function genIdCard() {
  const area = rand(D.ID_AREA_CODES);
  const y = randInt(1970, 2005), m = randInt(1, 12), d = randInt(1, 28);
  const seq = String(randInt(100, 999));
  const base = area + y + pad(m) + pad(d) + seq;
  const weights = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
  const checks = '10X98765432';
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += parseInt(base[i]) * weights[i];
  return base + checks[sum % 11];
}

function genUUID() {
  const h = '0123456789abcdef';
  const s = (n) => Array.from({ length: n }, () => h[randInt(0, 15)]).join('');
  return `${s(8)}-${s(4)}-4${s(3)}-${h[randInt(8,11)]}${s(3)}-${s(12)}`;
}

/* ======== 结构化数据 — DOM ======== */
const rowCountEl  = $('[data-row-count]');
const tableWrap   = $('[data-table-wrap]');
const resultCount = $('[data-result-count]');

let tableData = [];   // [{field: value, ...}, ...]
let activeFields = []; // ['name', 'phone', ...]

function getSelectedFields() {
  return [...$$('[data-field-list] input:checked')].map(el => el.value);
}

/* ======== 生成表格数据 ======== */
function genTable() {
  activeFields = getSelectedFields();
  if (!activeFields.length) { showToast('请至少选择一个字段', { type: 'warn' }); return; }
  const n = clamp(parseInt(rowCountEl.value, 10) || 20, 1, 500);
  tableData = [];
  for (let i = 0; i < n; i++) {
    const row = {};
    for (const f of activeFields) row[f] = FIELD_DEFS[f].gen();
    tableData.push(row);
  }
  renderTable();
  resultCount.textContent = `${n} 条`;
  const bar = $('[data-export-bar]');
  if (bar) bar.style.display = '';
}

function renderTable() {
  if (!tableData.length || !activeFields.length) return;
  const ths = activeFields.map(f => {
    const w = COL_MIN_W[f];
    const style = w ? ` style="min-width:${w}px"` : '';
    return `<th${style}>${FIELD_DEFS[f].label}</th>`;
  }).join('');
  const rows = tableData.map(row => {
    const tds = activeFields.map(f => `<td class="u-mono" style="cursor:pointer;white-space:nowrap" data-cell-val="${row[f]}">${row[f]}</td>`).join('');
    return `<tr>${tds}</tr>`;
  }).join('');
  tableWrap.innerHTML = `<table class="data-table" style="font-size:var(--text-sm)"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
}

/* ======== 快捷数量 ======== */
$$('[data-set-rows]').forEach(btn => on(btn, 'click', () => {
  rowCountEl.value = btn.dataset.setRows;
  genTable();
}));

/* ======== 复制全部 ======== */
async function copyTableText() {
  if (!tableData.length) { showToast('请先生成数据', { type: 'warn' }); return; }
  const header = activeFields.map(f => FIELD_DEFS[f].label).join('\t');
  const rows = tableData.map(row => activeFields.map(f => row[f]).join('\t'));
  const text = [header, ...rows].join('\n');
  const ok = await copyText(text);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
}

/* ======== 导出 ======== */
function downloadFile(content, filename, mime) {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

function exportJSON() {
  if (!tableData.length) { showToast('请先生成数据', { type: 'warn' }); return; }
  const labeled = tableData.map(row => {
    const obj = {};
    for (const f of activeFields) obj[FIELD_DEFS[f].label] = row[f];
    return obj;
  });
  downloadFile(JSON.stringify(labeled, null, 2), 'mock-data.json', 'application/json');
  showToast('已导出 JSON', { type: 'success' });
}

function exportCSV() {
  if (!tableData.length) { showToast('请先生成数据', { type: 'warn' }); return; }
  const header = activeFields.map(f => FIELD_DEFS[f].label).join(',');
  const rows = tableData.map(row => activeFields.map(f => `"${row[f]}"`).join(','));
  const bom = '\uFEFF';
  downloadFile(bom + [header, ...rows].join('\n'), 'mock-data.csv', 'text/csv;charset=utf-8');
  showToast('已导出 CSV', { type: 'success' });
}

function exportTXT() {
  if (!tableData.length) { showToast('请先生成数据', { type: 'warn' }); return; }
  const header = activeFields.map(f => FIELD_DEFS[f].label).join('\t');
  const rows = tableData.map(row => activeFields.map(f => row[f]).join('\t'));
  downloadFile([header, ...rows].join('\n'), 'mock-data.txt', 'text/plain;charset=utf-8');
  showToast('已导出 TXT', { type: 'success' });
}

/* ======== 点击单元格复制 ======== */
document.addEventListener('click', async (e) => {
  const cell = e.target.closest('[data-cell-val]');
  if (!cell) return;
  const ok = await copyText(cell.dataset.cellVal);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ======== 事件绑定 ======== */
on($('[data-action="gen-table"]'), 'click', genTable);
on($('[data-action="copy-table"]'), 'click', copyTableText);
on($('[data-action="export-json"]'), 'click', exportJSON);
on($('[data-action="export-csv"]'), 'click', exportCSV);
on($('[data-action="export-txt"]'), 'click', exportTXT);

/* ======== 初始生成 ======== */
genTextContent();
