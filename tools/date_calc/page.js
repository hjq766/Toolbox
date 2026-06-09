import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ======== Tab 切换 ======== */
const panels = { diff: $('[data-panel="diff"]'), add: $('[data-panel="add"]'), workday: $('[data-panel="workday"]') };
$$('[data-mode]').forEach(btn => on(btn, 'click', () => {
  $$('[data-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
  for (const k in panels) panels[k].hidden = k !== btn.dataset.mode;
}));

/* ======== 工具函数 ======== */
const pad = (n) => String(n).padStart(2, '0');
const WD = ['日', '一', '二', '三', '四', '五', '六'];
const fmtD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtFull = (d) => `${fmtD(d)} 星期${WD[d.getDay()]}`;
const toStr = (d) => fmtD(d);
const stat     = (label, num, unit) => `<div class="dc-stat"><span class="dc-stat-label">${label}</span><div class="dc-stat-num"><strong>${num}</strong><span>${unit}</span></div></div>`;
const statText = (label, value) => `<div class="dc-stat"><span class="dc-stat-label">${label}</span><strong class="dc-stat-text">${value}</strong></div>`;
const statGrid = (...cards) => `<div class="dc-stat-grid">${cards.join('')}</div>`;
const row      = (label, value) => `<div class="result-row"><span class="u-muted">${label}</span><strong>${value}</strong></div>`;
const sec      = (...items) => `<div class="dc-sec">${items.join('')}</div>`;
const emptyHint = (text) => `<div class="u-muted" style="text-align:center;padding:var(--space-3);font-size:var(--text-sm)">${text}</div>`;

/* ======== DOM ======== */
const diffStart = $('[data-diff-start]');
const diffEnd   = $('[data-diff-end]');
const addStart  = $('[data-add-start]');
const addNum    = $('[data-add-num]');
const addOp     = $('[data-add-op]');
const addUnit   = $('[data-add-unit]');
const wdStart   = $('[data-wd-start]');
const wdEnd     = $('[data-wd-end]');

/* ======== 初始化日期 ======== */
const now = new Date();
const todayStr = toStr(now);
const d30 = new Date(now); d30.setDate(d30.getDate() + 30);
diffStart.value = todayStr; diffEnd.value = toStr(d30);
addStart.value = todayStr;
wdStart.value = todayStr; wdEnd.value = toStr(d30);

/* ============================================================
   日期间隔 — 自动计算
   ============================================================ */
function calcDiff() {
  const a = new Date(diffStart.value);
  const b = new Date(diffEnd.value);
  if (isNaN(a) || isNaN(b)) { $('[data-diff-result]').innerHTML = emptyHint('请选择有效日期'); return; }

  const totalDays = Math.round(Math.abs(b - a) / 86400000);
  const totalWeeks = (totalDays / 7).toFixed(1);
  const totalYears = (totalDays / 365.25).toFixed(2);

  const [s, e] = a <= b ? [new Date(a), new Date(b)] : [new Date(b), new Date(a)];
  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();
  if (days < 0) { months--; days += new Date(e.getFullYear(), e.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }

  const mDiff = (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth() + (e.getDate() >= s.getDate() ? 0 : -1);

  let decomp = '';
  if (years) decomp += `${years} 年 `;
  if (months) decomp += `${months} 个月 `;
  decomp += `${days} 天`;

  $('[data-diff-result]').innerHTML = [
    statGrid(
      statText('相差', decomp),
      stat('总天数', totalDays, '天'),
      stat('总周数', totalWeeks, '周'),
      stat('总月数', mDiff, '个月'),
    ),
    sec(
      row('总年数', `${totalYears} 年`),
      row('总小时', `${(totalDays * 24).toLocaleString()} 小时`),
      row('总分钟', `${(totalDays * 1440).toLocaleString()} 分钟`),
      row('总秒数', `${(totalDays * 86400).toLocaleString()} 秒`),
      row('开始日', fmtFull(a)),
      row('结束日', fmtFull(b)),
    ),
  ].join('');
}

on(diffStart, 'input', calcDiff);
on(diffEnd, 'input', calcDiff);

// 交换
on($('[data-action="swap-diff"]'), 'click', () => {
  const tmp = diffStart.value; diffStart.value = diffEnd.value; diffEnd.value = tmp;
  calcDiff();
});

// 快捷
$$('[data-diff-q]').forEach(btn => on(btn, 'click', () => {
  const v = btn.dataset.diffQ;
  const today = new Date();
  if (v === 'month') {
    diffStart.value = toStr(new Date(today.getFullYear(), today.getMonth(), 1));
    diffEnd.value = toStr(new Date(today.getFullYear(), today.getMonth() + 1, 0));
  } else if (v === 'year') {
    diffStart.value = `${today.getFullYear()}-01-01`;
    diffEnd.value = `${today.getFullYear()}-12-31`;
  } else {
    const n = parseInt(v, 10);
    const past = new Date(today); past.setDate(past.getDate() - n);
    diffStart.value = toStr(past);
    diffEnd.value = toStr(today);
  }
  calcDiff();
}));

/* ============================================================
   日期推算 — 自动计算，支持天/周/月/年
   ============================================================ */
function calcAdd() {
  const base = new Date(addStart.value);
  const num = parseInt(addNum.value, 10);
  if (isNaN(base) || isNaN(num) || num < 0) { $('[data-add-result]').innerHTML = emptyHint('请输入有效日期和数值'); return; }

  const op = addOp.value;
  const unit = addUnit.value;
  const sign = op === 'add' ? 1 : -1;
  const result = new Date(base);

  const UNIT_LABEL = { day: '天', week: '周', month: '个月', year: '年' };

  switch (unit) {
    case 'day':   result.setDate(result.getDate() + sign * num); break;
    case 'week':  result.setDate(result.getDate() + sign * num * 7); break;
    case 'month': result.setMonth(result.getMonth() + sign * num); break;
    case 'year':  result.setFullYear(result.getFullYear() + sign * num); break;
  }

  const daysDiff = Math.round(Math.abs(result - base) / 86400000);

  $('[data-add-result]').innerHTML = [
    statGrid(
      statText('结果日期', fmtFull(result)),
      stat('相差天数', daysDiff, '天'),
    ),
    sec(
      row('起始日期', fmtFull(base)),
      row('操作', `${op === 'add' ? '+' : '−'} ${num} ${UNIT_LABEL[unit]}`),
      row('ISO 格式', toStr(result)),
    ),
  ].join('');
}

on(addStart, 'input', calcAdd);
on(addNum, 'input', calcAdd);
on(addOp, 'change', calcAdd);
on(addUnit, 'change', calcAdd);

// 快捷
$$('[data-add-q]').forEach(btn => on(btn, 'click', () => {
  const v = btn.dataset.addQ;
  const m = v.match(/^(\d+)([dmy])$/);
  if (!m) return;
  addOp.value = 'add';
  addNum.value = m[1];
  addUnit.value = m[2] === 'd' ? 'day' : m[2] === 'm' ? 'month' : 'year';
  if (!addStart.value) addStart.value = toStr(new Date());
  calcAdd();
}));

/* ============================================================
   工作日计算 — 自动计算
   ============================================================ */
function calcWd() {
  const a = new Date(wdStart.value);
  const b = new Date(wdEnd.value);
  if (isNaN(a) || isNaN(b)) { $('[data-wd-result]').innerHTML = emptyHint('请选择有效日期'); return; }

  const [start, end] = a <= b ? [new Date(a), new Date(b)] : [new Date(b), new Date(a)];
  let workdays = 0, saturdays = 0, sundays = 0, totalDays = 0;
  const cur = new Date(start);

  while (cur <= end) {
    totalDays++;
    const dow = cur.getDay();
    if (dow === 0) sundays++;
    else if (dow === 6) saturdays++;
    else workdays++;
    cur.setDate(cur.getDate() + 1);
  }

  const weeks = Math.floor(totalDays / 7);
  const extra = totalDays % 7;

  $('[data-wd-result]').innerHTML = [
    statGrid(
      stat('工作日', workdays, '天'),
      stat('总天数', totalDays, '天'),
      stat('周六', saturdays, '天'),
      stat('周日', sundays, '天'),
    ),
    sec(
      row('完整周数', weeks ? `${weeks} 周${extra ? ' + ' + extra + ' 天' : ''}` : `${extra} 天`),
      row('开始日', fmtFull(a)),
      row('结束日', fmtFull(b)),
    ),
  ].join('');
}

on(wdStart, 'input', calcWd);
on(wdEnd, 'input', calcWd);

// 快捷
$$('[data-wd-q]').forEach(btn => on(btn, 'click', () => {
  const v = btn.dataset.wdQ;
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth();
  if (v === 'week') {
    const dow = today.getDay();
    const mon = new Date(today); mon.setDate(mon.getDate() - ((dow + 6) % 7));
    const fri = new Date(mon); fri.setDate(fri.getDate() + 4);
    wdStart.value = toStr(mon); wdEnd.value = toStr(fri);
  } else if (v === 'month') {
    wdStart.value = toStr(new Date(y, m, 1));
    wdEnd.value = toStr(new Date(y, m + 1, 0));
  } else if (v === 'quarter') {
    const qm = Math.floor(m / 3) * 3;
    wdStart.value = toStr(new Date(y, qm, 1));
    wdEnd.value = toStr(new Date(y, qm + 3, 0));
  } else if (v === 'year') {
    wdStart.value = `${y}-01-01`;
    wdEnd.value = `${y}-12-31`;
  }
  calcWd();
}));

/* ======== 点击结果行复制 ======== */
document.addEventListener('click', async (e) => {
  const row = e.target.closest('.result-row strong');
  if (!row) return;
  const ok = await copyText(row.textContent);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ======== 初始计算 ======== */
calcDiff();
calcAdd();
calcWd();
