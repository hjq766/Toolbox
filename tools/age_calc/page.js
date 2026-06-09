/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $ } from '../../public/scripts/utils/dom.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const ZODIAC = [
  { name: '摩羯座', icon: '♑', end: [1, 19] },
  { name: '水瓶座', icon: '♒', end: [2, 18] },
  { name: '双鱼座', icon: '♓', end: [3, 20] },
  { name: '白羊座', icon: '♈', end: [4, 19] },
  { name: '金牛座', icon: '♉', end: [5, 20] },
  { name: '双子座', icon: '♊', end: [6, 20] },
  { name: '巨蟹座', icon: '♋', end: [7, 22] },
  { name: '狮子座', icon: '♌', end: [8, 22] },
  { name: '处女座', icon: '♍', end: [9, 22] },
  { name: '天秤座', icon: '♎', end: [10, 22] },
  { name: '天蝎座', icon: '♏', end: [11, 21] },
  { name: '射手座', icon: '♐', end: [12, 21] },
  { name: '摩羯座', icon: '♑', end: [12, 31] },
];
const SHENGXIAO = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const DECADE_MAP = [
  [2010, '10后'], [2000, '00后'], [1990, '90后'],
  [1980, '80后'], [1970, '70后'], [1960, '60后'],
];
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ v: i + 1, t: `${i + 1}月` }));

/* ========== 2. 状态 ========== */
const NOW   = new Date();
NOW.setHours(0, 0, 0, 0);
let birthY  = 1990;
let birthM  = 1;
let birthD  = 1;
let openDrop = null;

/* ========== 3. DOM 引用 ========== */
const resultEl     = $('[data-result]');
const birthdayHint = $('[data-birthday-hint]');
const ageGridEl    = $('[data-age-grid]');
const extraGridEl  = $('[data-extra-grid]');
const infoPanelEl  = $('[data-info-panel]');

/* ========== 4. 工具函数 ========== */

function stat(label, value, unit = '') {
  return `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${value}${unit ? `<small style="font-size:.6em;font-weight:400;margin-left:2px">${unit}</small>` : ''}</div></div>`;
}

function row(label, value) {
  return `<div class="result-row"><span class="u-muted">${label}</span><strong>${value}</strong></div>`;
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function getZodiac(month, day) {
  return ZODIAC.find(z => month < z.end[0] || (month === z.end[0] && day <= z.end[1]));
}

function getShengxiao(year) {
  return SHENGXIAO[(year - 1900 + 48) % 12];
}

function getDecade(year) {
  const d = DECADE_MAP.find(([y]) => year >= y);
  return d ? d[1] : `${Math.floor(year / 10) * 10}s`;
}

function calcAge(birth) {
  let y = NOW.getFullYear() - birth.getFullYear();
  let m = NOW.getMonth()    - birth.getMonth();
  let d = NOW.getDate()     - birth.getDate();
  if (d < 0) { m--; d += new Date(NOW.getFullYear(), NOW.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}

function nextBirthday(birth) {
  const thisYear = new Date(NOW.getFullYear(), birth.getMonth(), birth.getDate());
  const target   = thisYear > NOW
    ? thisYear
    : new Date(NOW.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return Math.round((target - NOW) / 86400000);
}

function toLocaleDateStr(date) {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

/* --- createPicker（移植自 calendar/page.js）--- */
function closeDrop() {
  if (openDrop) {
    openDrop.drop.classList.remove('show');
    openDrop.trigger.classList.remove('open');
    openDrop = null;
  }
}
document.addEventListener('click', e => {
  if (openDrop && !openDrop.el.contains(e.target)) closeDrop();
});

function createPicker(selector, { items, cols, value, label, hasNav, onChange }) {
  const el = $(selector);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'pk-trigger';
  const drop = document.createElement('div');
  drop.className = 'pk-drop';
  el.append(trigger, drop);

  let val = value;
  const pk = {
    el, trigger, drop,
    get value() { return val; },
    set value(v) { val = v; trigger.textContent = label(v); pk.refresh?.(); onChange?.(v); },
    refresh: null,
  };

  trigger.textContent = label(val);
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    if (openDrop === pk) { closeDrop(); return; }
    closeDrop();
    openDrop = pk;
    trigger.classList.add('open');
    drop.classList.add('show');
    pk.refresh?.();
    requestAnimationFrame(() => drop.querySelector('.on')?.scrollIntoView({ block: 'center' }));
  });

  if (hasNav) {
    let decade = Math.floor(val / 10) * 10;
    const renderYear = () => {
      const start = decade, end = Math.min(decade + 9, NOW.getFullYear());
      drop.innerHTML =
        `<div class="pk-nav"><button data-yd="-1">‹</button><strong>${start}–${end}</strong><button data-yd="1">›</button></div>` +
        `<div class="pk-grid cols-5">${Array.from({ length: end - start + 1 }, (_, i) => {
          const y = start + i;
          return `<span data-v="${y}"${y === val ? ' class="on"' : ''}>${y}</span>`;
        }).join('')}</div>`;
    };
    drop.addEventListener('click', e => {
      e.stopPropagation();
      const navBtn = e.target.closest('[data-yd]');
      if (navBtn) {
        const next = decade + +navBtn.dataset.yd * 10;
        if (next > NOW.getFullYear()) return;
        if (next < 1920) return;
        decade = next; renderYear(); return;
      }
      const opt = e.target.closest('[data-v]');
      if (opt) { pk.value = +opt.dataset.v; decade = Math.floor(pk.value / 10) * 10; closeDrop(); }
    });
    pk.refresh = () => { decade = Math.floor(val / 10) * 10; renderYear(); };
    renderYear();
  } else {
    const renderGrid = () => {
      const list = typeof items === 'function' ? items() : items;
      drop.innerHTML = `<div class="pk-grid cols-${cols}">${list.map(it =>
        `<span data-v="${it.v}"${it.v === val ? ' class="on"' : ''}>${it.t}</span>`
      ).join('')}</div>`;
    };
    drop.addEventListener('click', e => {
      e.stopPropagation();
      const opt = e.target.closest('[data-v]');
      if (opt) { pk.value = +opt.dataset.v; closeDrop(); }
    });
    pk.refresh = renderGrid;
    renderGrid();
  }
  return pk;
}

function calc() {
  const birth = new Date(birthY, birthM - 1, birthD);
  if (birth > NOW) { resultEl.hidden = true; return; }

  const { y, m, d } = calcAge(birth);
  const totalDays   = Math.round((NOW - birth) / 86400000);
  const daysLeft    = nextBirthday(birth);
  const zodiac      = getZodiac(birthM, birthD);
  const shengxiao   = getShengxiao(birthY);
  const decade      = getDecade(birthY);
  const isBirthday  = m === 0 && d === 0;

  birthdayHint.hidden = !isBirthday;

  ageGridEl.innerHTML = [
    stat('年', y, '岁'),
    stat('月', m, '个月'),
    stat('天', d, '天'),
  ].join('');

  extraGridEl.innerHTML = [
    stat('已活', totalDays.toLocaleString(), '天'),
    stat('下次生日', isBirthday ? '今天 🎂' : `${daysLeft} 天后`),
  ].join('');

  infoPanelEl.innerHTML = [
    row('出生日期', toLocaleDateStr(birth)),
    row('星座', `${zodiac.icon} ${zodiac.name}`),
    row('生肖', `${shengxiao}年`),
    row('年代', decade),
  ].join('');

  resultEl.hidden = false;
}

/* ========== 5. 事件绑定 ========== */

let pkDay;

const pkYear = createPicker('#pk-year', {
  value: birthY, label: v => `${v}年`, hasNav: true,
  onChange: v => {
    birthY = v;
    const max = daysInMonth(birthY, birthM);
    if (birthD > max) { birthD = max; pkDay.value = birthD; }
    else { pkDay.refresh?.(); calc(); }
  },
});

const pkMonth = createPicker('#pk-month', {
  value: birthM, label: v => `${v}月`, items: MONTHS, cols: 4,
  onChange: v => {
    birthM = v;
    const max = daysInMonth(birthY, birthM);
    if (birthD > max) { birthD = max; pkDay.value = birthD; }
    else { pkDay.refresh?.(); calc(); }
  },
});

pkDay = createPicker('#pk-day', {
  value: birthD,
  label: v => `${v}日`,
  items: () => Array.from({ length: daysInMonth(birthY, birthM) }, (_, i) => ({ v: i + 1, t: i + 1 })),
  cols: 7,
  onChange: v => { birthD = v; calc(); },
});

calc();
