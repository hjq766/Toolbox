import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals provinceData, cityData */

/* ---------- 按需加载 XLSX ---------- */
let xlsxReady = null;
function loadXLSX() {
  if (xlsxReady) return xlsxReady;
  xlsxReady = new Promise((resolve, reject) => {
    if (typeof XLSX !== 'undefined') { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = resolve;
    s.onerror = () => { xlsxReady = null; reject(new Error('XLSX 加载失败')); };
    document.head.appendChild(s);
  });
  return xlsxReady;
}

const inputEl      = $('[data-input]');
const tbodyEl      = $('[data-tbody]');
const resultPanel  = $('[data-result-panel]');
const pagerEl      = $('[data-pager]');
const resultCount  = $('[data-result-count]');

const ZODIAC = ['子鼠','丑牛','寅虎','卯兔','辰龙','巳蛇','午马','未羊','申猴','酉鸡','戌狗','亥猪'];
const CONSTELLATIONS = [
  { name:'水瓶座', s:'01-20', e:'02-18' }, { name:'双鱼座', s:'02-19', e:'03-20' },
  { name:'白羊座', s:'03-21', e:'04-19' }, { name:'金牛座', s:'04-20', e:'05-20' },
  { name:'双子座', s:'05-21', e:'06-21' }, { name:'巨蟹座', s:'06-22', e:'07-22' },
  { name:'狮子座', s:'07-23', e:'08-22' }, { name:'处女座', s:'08-23', e:'09-22' },
  { name:'天秤座', s:'09-23', e:'10-23' }, { name:'天蝎座', s:'10-24', e:'11-22' },
  { name:'射手座', s:'11-23', e:'12-21' }, { name:'摩羯座', s:'12-22', e:'01-19' }
];

/* ---------- 校验 ---------- */
function validateId(id) {
  const pat = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/;
  if (!pat.test(id)) return false;
  const y = +id.slice(6,10), m = +id.slice(10,12), d = +id.slice(12,14);
  const dt = new Date(y, m-1, d);
  if (dt.getFullYear()!==y || dt.getMonth()+1!==m || dt.getDate()!==d) return false;
  const f = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
  const t = '10X98765432';
  let sum = 0;
  for (let i=0;i<17;i++) sum += +id[i] * f[i];
  return t[sum%11] === id[17].toUpperCase();
}

function calcAge(birthday) {
  const today = new Date(), b = new Date(birthday);
  let age = today.getFullYear() - b.getFullYear();
  const md = today.getMonth() - b.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

function getZodiac(year) { return ZODIAC[(year-4)%12].substring(1); }

function getConstellation(m, d) {
  if ((m===12 && d>=22) || (m===1 && d<=19)) return '摩羯座';
  for (const c of CONSTELLATIONS) {
    const [sm,sd] = c.s.split('-').map(Number);
    const [em,ed] = c.e.split('-').map(Number);
    if ((m===sm && d>=sd) || (m===em && d<=ed)) return c.name;
  }
  return '未知';
}

function getRegion(code) {
  const pCode = code.slice(0,2) + '0000';
  const cCode = code.slice(0,4) + '00';
  const parts = [];
  if (typeof provinceData !== 'undefined' && provinceData[pCode]) {
    parts.push(provinceData[pCode].text);
    if (typeof cityData !== 'undefined' && cityData[cCode]) parts.push(cityData[cCode].text);
  }
  return parts.join(' ') || '—';
}

/* ---------- 批量计算 ---------- */
let allResults = [];
let currentPage = 1;
const PER_PAGE = 10;

function calculate() {
  const raw = inputEl.value.trim();
  if (!raw) { showToast('请输入身份证号码', { type: 'warn' }); return; }
  const ids = raw.split('\n').map(s => s.trim()).filter(Boolean);

  allResults = ids.map((id, i) => {
    const valid = validateId(id);
    if (!valid) return { id: i+1, idCard: id, isValid: false };
    const y = +id.slice(6,10), m = +id.slice(10,12), d = +id.slice(12,14);
    const birthday = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return {
      id: i+1, idCard: id, isValid: true,
      region: getRegion(id.slice(0,6)), birthday,
      gender: +id[16] % 2 === 0 ? '女' : '男',
      age: calcAge(birthday), zodiac: getZodiac(y), constellation: getConstellation(m, d)
    };
  });

  currentPage = 1;
  renderTable();
  showToast(`已计算 ${allResults.length} 条`);
}

function renderTable() {
  resultPanel.hidden = false;
  resultCount.textContent = `共 ${allResults.length} 条`;
  const total = Math.ceil(allResults.length / PER_PAGE);
  const page = allResults.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

  tbodyEl.innerHTML = page.map(r => {
    const cells = !r.isValid
      ? [r.id, `<span class="u-mono">${r.idCard}</span>`, '<span style="color:var(--color-danger)">无效</span>', '—','—','—','—','—','—']
      : [r.id, `<span class="u-mono">${r.idCard}</span>`, '<span style="color:var(--color-brand)">有效</span>',
         r.region, r.birthday, r.gender, r.age, r.zodiac, r.constellation];
    return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  }).join('');

  if (total > 1) {
    pagerEl.innerHTML = `
      <button class="btn is-sm" ${currentPage===1?'disabled':''} data-page="${currentPage-1}">上一页</button>
      <span class="field-hint">第 ${currentPage} / ${total} 页</span>
      <button class="btn is-sm" ${currentPage===total?'disabled':''} data-page="${currentPage+1}">下一页</button>`;
    pagerEl.querySelectorAll('[data-page]').forEach(b =>
      b.addEventListener('click', () => { currentPage = +b.dataset.page; renderTable(); }));
  } else { pagerEl.innerHTML = ''; }
}

/* ---------- 文件导入 ---------- */
const fileEl = $('[data-file]');
on($('[data-action="import"]'), 'click', () => fileEl.click());
on(fileEl, 'change', () => { loadFile(fileEl.files[0]); fileEl.value = ''; });

function loadFile(f) {
  if (!f) return;
  const ext = f.name.split('.').pop().toLowerCase();
  const reader = new FileReader();
  if (ext === 'txt' || ext === 'csv') {
    reader.onload = e => { inputEl.value = e.target.result; showToast('文件导入成功'); };
    reader.readAsText(f);
  } else if (ext === 'xlsx' || ext === 'xls') {
    loadXLSX().then(() => {
      reader.onload = e => {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        inputEl.value = rows.flat().filter(v => v).join('\n');
        showToast('文件导入成功');
      };
      reader.readAsArrayBuffer(f);
    }).catch(() => showToast('XLSX 库加载失败', { type: 'error' }));
  }
}

/* ---------- 导出 Excel ---------- */
async function exportExcel() {
  if (!allResults.length) { showToast('没有数据', { type: 'warn' }); return; }
  try { await loadXLSX(); } catch { showToast('XLSX 库加载失败', { type: 'error' }); return; }
  const data = allResults.map(r => ({
    '序号': r.id, '身份证号码': r.idCard, '验证': r.isValid ? '有效' : '无效',
    '地区': r.isValid ? r.region : '—', '出生日期': r.isValid ? r.birthday : '—',
    '性别': r.isValid ? r.gender : '—', '年龄': r.isValid ? r.age : '—',
    '生肖': r.isValid ? r.zodiac : '—', '星座': r.isValid ? r.constellation : '—'
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), '身份证信息');
  XLSX.writeFile(wb, '身份证信息.xlsx');
  showToast('导出成功');
}

/* ---------- 绑定 ---------- */
on($('[data-action="calc"]'),   'click', calculate);
on($('[data-action="export"]'), 'click', exportExcel);
on($('[data-action="clear"]'),  'click', () => {
  inputEl.value = ''; allResults = []; resultPanel.hidden = true;
});
