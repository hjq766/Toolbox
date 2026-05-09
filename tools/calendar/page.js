import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const now   = new Date();
const TODAY = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };

let vY = TODAY.y, vM = TODAY.m - 1;
let sel = { ...TODAY };

const body   = $('[data-body]');
const title  = $('[data-title]');
const detail = $('[data-detail]');

/* ======== 月历 ======== */

function render() {
  title.textContent = `${vY} 年 ${vM + 1} 月`;
  const pad = new Date(vY, vM, 1).getDay();
  const len = new Date(vY, vM + 1, 0).getDate();
  let h = '';
  for (let i = 0; i < pad; i++) h += '<i></i>';
  for (let d = 1; d <= len; d++) {
    const info = calendar.solar2lunar(vY, vM + 1, d);
    const cls  = (vY === TODAY.y && vM + 1 === TODAY.m && d === TODAY.d ? ' today' : '')
               + (vY === sel.y && vM + 1 === sel.m && d === sel.d ? ' sel' : '');
    const imp = info.festivalImportant || info.lunarFestivalImportant;
    const fest = info.festival || info.lunarFestival || '';
    const sub  = fest
      ? `<small class="${imp ? 'f' : 'fm'}">${fest}</small>`
      : `<small>${info.displayText || info.IDayCn}</small>`;
    h += `<i data-d="${d}"${cls ? ` class="${cls.trim()}"` : ''}>${d}${sub}</i>`;
  }
  body.innerHTML = h;
}

function pick(y, m, d) {
  sel = { y, m, d };
  body.querySelector('.sel')?.classList.remove('sel');
  body.querySelector(`[data-d="${d}"]`)?.classList.add('sel');
  const info = calendar.solar2lunar(y, m, d);
  if (info === -1) { detail.innerHTML = '<h3 class="panel-title">日期超出范围</h3>'; return; }
  const wx = info.WuXing || {};
  const wuXingStr = [wx.yearGan, wx.monthGan, wx.dayGan].filter(Boolean).join(' ');
  detail.innerHTML =
    `<h3 class="panel-title">${info.date || `${info.cYear}-${info.cMonth}-${info.cDay}`} ${info.ncWeek}</h3>` +
    [
      ['农历', `${info.IMonthCn}${info.IDayCn}`],
      ['干支', `${info.gzYear}年 ${info.gzMonth}月 ${info.gzDay}日`],
      ['五行', wuXingStr || '—'],
      ['生肖', info.AnimalByLiChun ? `${info.AnimalByLiChun}（立春）/ ${info.Animal}（年份）` : info.Animal],
      ['星座', info.astro],
      ['节气', info.isTerm ? info.Term : '—'],
      ['公历节日', info.festival || '—'],
      ['农历节日', info.lunarFestival || '—'],
    ].map(([l, v]) => `<div class="result-row"><span class="u-muted">${l}</span><span>${v}</span></div>`).join('');
}

on(body, 'click', e => {
  const c = e.target.closest('[data-d]');
  if (c) pick(vY, vM + 1, +c.dataset.d);
});

/* ======== 导航 ======== */

const nav = {
  py()    { vY--; },
  ny()    { vY++; },
  pm()    { vM--; if (vM < 0)  { vM = 11; vY--; } },
  nm()    { vM++; if (vM > 11) { vM = 0;  vY++; } },
  today() { vY = TODAY.y; vM = TODAY.m - 1; },
};
document.querySelectorAll('[data-nav]').forEach(btn =>
  on(btn, 'click', () => { nav[btn.dataset.nav](); render(); })
);

/* ======== 自定义选择器 ======== */

let openDrop = null;

function closeDrop() {
  if (openDrop) { openDrop.drop.classList.remove('show'); openDrop.trigger.classList.remove('open'); openDrop = null; }
}
document.addEventListener('click', e => { if (openDrop && !openDrop.el.contains(e.target)) closeDrop(); });

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
    // 自动滚动到选中项
    requestAnimationFrame(() => {
      const active = drop.querySelector('.on');
      if (active) active.scrollIntoView({ block: 'center' });
    });
  });

  if (hasNav) {
    // 年份选择器：十年一页
    let decade = Math.floor(val / 10) * 10;
    const renderYear = () => {
      const start = decade, end = decade + 9;
      drop.innerHTML =
        `<div class="pk-nav"><button data-yd="-1">‹</button><strong>${start}–${end}</strong><button data-yd="1">›</button></div>` +
        `<div class="pk-grid cols-5">${Array.from({ length: 10 }, (_, i) => {
          const y = start + i;
          return `<span data-v="${y}"${y === val ? ' class="on"' : ''}>${y}</span>`;
        }).join('')}</div>`;
    };
    drop.addEventListener('click', e => {
      e.stopPropagation();
      const navBtn = e.target.closest('[data-yd]');
      if (navBtn) { decade += +navBtn.dataset.yd * 10; renderYear(); return; }
      const opt = e.target.closest('[data-v]');
      if (opt) { pk.value = +opt.dataset.v; decade = Math.floor(pk.value / 10) * 10; closeDrop(); }
    });
    pk.refresh = () => { decade = Math.floor(val / 10) * 10; renderYear(); };
    renderYear();
  } else {
    // 月/日选择器：平铺网格
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

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ v: i + 1, t: `${i + 1}月` }));
const DAYS31 = Array.from({ length: 31 }, (_, i) => ({ v: i + 1, t: i + 1 }));
const DAYS30 = Array.from({ length: 30 }, (_, i) => ({ v: i + 1, t: i + 1 }));

function lunarMonths(year) {
  const leap = calendar.leapMonth(year);
  const list = [];
  for (let m = 1; m <= 12; m++) {
    list.push({ v: m, t: `${m}月` });
    if (m === leap) list.push({ v: -m, t: `闰${m}月` });
  }
  return list;
}

/* ======== 转换器 ======== */

const convOut = $('[data-conv-result]');
const lunar = calendar.solar2lunar(TODAY.y, TODAY.m, TODAY.d);

// 公历选择器
const s2lY = createPicker('[data-pk="s2l-y"]', { value: TODAY.y, label: v => `${v}年`, hasNav: true });
const s2lM = createPicker('[data-pk="s2l-m"]', { value: TODAY.m, label: v => `${v}月`, items: MONTHS, cols: 4 });
const s2lD = createPicker('[data-pk="s2l-d"]', { value: TODAY.d, label: v => `${v}日`, items: DAYS31, cols: 7 });

// 农历选择器（月份根据年份动态生成，含闰月）
const l2sY = createPicker('[data-pk="l2s-y"]', {
  value: lunar.lYear, label: v => `${v}年`, hasNav: true,
  onChange: () => l2sM.refresh?.(),
});
const l2sM = createPicker('[data-pk="l2s-m"]', {
  value: lunar.lMonth,
  label: v => v < 0 ? `闰${-v}月` : `${v}月`,
  items: () => lunarMonths(l2sY.value),
  cols: 4,
});
const l2sD = createPicker('[data-pk="l2s-d"]', { value: lunar.lDay, label: v => `${v}日`, items: DAYS30, cols: 7 });

// tab 切换
const s2lPane = $('[data-pane-s2l]');
const l2sPane = $('[data-pane-l2s]');
$('[data-conv-tabs]').addEventListener('click', e => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  $('[data-conv-tabs]').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  closeDrop();
  s2lPane.hidden = btn.dataset.tab !== 's2l';
  l2sPane.hidden = btn.dataset.tab !== 'l2s';
  convOut.innerHTML = '';
});

// 公历 → 农历
on($('[data-action="s2l"]'), 'click', () => {
  const info = calendar.solar2lunar(s2lY.value, s2lM.value, s2lD.value);
  if (info === -1) { convOut.innerHTML = '<span style="color:var(--color-danger)">日期超出范围</span>'; return; }
  const wx2 = info.WuXing || {};
  convOut.innerHTML =
    `<div class="result-row"><span class="u-muted">农历</span><strong>${info.lYear}年 ${info.IMonthCn}${info.IDayCn}</strong></div>` +
    `<div class="result-row"><span class="u-muted">干支</span><span>${info.gzYear}年 ${info.gzMonth}月 ${info.gzDay}日</span></div>` +
    `<div class="result-row"><span class="u-muted">五行</span><span>${[wx2.yearGan, wx2.monthGan, wx2.dayGan].filter(Boolean).join(' ') || '—'}</span></div>` +
    `<div class="result-row"><span class="u-muted">生肖</span><span>${info.AnimalByLiChun || info.Animal}</span></div>` +
    (info.isTerm ? `<div class="result-row"><span class="u-muted">节气</span><span>${info.Term}</span></div>` : '') +
    (info.festival ? `<div class="result-row"><span class="u-muted">节日</span><span>${info.festival}</span></div>` : '');
});

// 农历 → 公历
on($('[data-action="l2s"]'), 'click', () => {
  const mv = l2sM.value;
  const isLeap = mv < 0;
  const info = calendar.lunar2solar(l2sY.value, Math.abs(mv), l2sD.value, isLeap);
  if (info === -1) { convOut.innerHTML = '<span style="color:var(--color-danger)">日期超出范围或不存在</span>'; return; }
  convOut.innerHTML =
    `<div class="result-row"><span class="u-muted">公历</span><strong>${info.cYear}-${info.cMonth}-${info.cDay}</strong></div>` +
    `<div class="result-row"><span class="u-muted">星期</span><span>${info.ncWeek}</span></div>` +
    `<div class="result-row"><span class="u-muted">星座</span><span>${info.astro}</span></div>` +
    (info.festival ? `<div class="result-row"><span class="u-muted">节日</span><span>${info.festival}</span></div>` : '') +
    (info.lunarFestival ? `<div class="result-row"><span class="u-muted">农历节日</span><span>${info.lunarFestival}</span></div>` : '');
});

/* ======== init ======== */
render();
pick(TODAY.y, TODAY.m, TODAY.d);
