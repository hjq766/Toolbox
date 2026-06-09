import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';

mountToolHeader();

/* ── 工具函数 ── */

function fmt(n) {
  if (!isFinite(n)) return '—';
  return parseFloat(n.toPrecision(8)).toString();
}

function getNum(el) {
  const v = parseFloat(el.value);
  return isNaN(v) ? null : v;
}

/**
 * stat 卡片，无 inline style。
 * .stat-value 已在全局 components.css 定义为 text-2xl + bold。
 */
function stat(label, value, note = '') {
  return `<div class="stat">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    ${note ? `<div class="stat-label u-mt-2">${note}</div>` : ''}
  </div>`;
}

/** 点击可复制的结果值包装 */
function copyable(val, html) {
  return `<span class="u-clickable" data-copy="${val}" title="点击复制">${html}</span>`;
}

/* ── 场景切换（chip.is-active 处理选中态） ── */
const sceneBtns = $$('[data-scene]');
const panels    = $$('[data-panel]');

function setScene(scene) {
  sceneBtns.forEach(b => b.classList.toggle('is-active', b.dataset.scene === scene));
  panels.forEach(p => { p.hidden = p.dataset.panel !== scene; });
}

sceneBtns.forEach(b => on(b, 'click', () => setScene(b.dataset.scene)));

/* ── 场景 1：X% 是多少？ ── */
const vB = $('[data-v-b]'), vX = $('[data-v-x]');
const vResult = $('[data-v-result]'), vGrid = $('[data-v-grid]');

function calcValue() {
  const b = getNum(vB), x = getNum(vX);
  if (b === null || x === null) { vResult.hidden = true; return; }
  const result = b * x / 100;
  vGrid.innerHTML = [
    stat(
      `${fmt(b)} 的 ${fmt(x)}%`,
      copyable(fmt(result), `<span style="color:var(--color-brand)">${fmt(result)}</span>`),
    ),
    stat('剩余部分', fmt(b - result), `占 ${fmt(100 - x)}%`),
    stat('比例关系', `${fmt(x)}% : ${fmt(100 - x)}%`),
  ].join('');
  vResult.hidden = false;
}

on(vB, 'input', calcValue);
on(vX, 'input', calcValue);

/* ── 场景 2：占多少比例？ ── */
const rA = $('[data-r-a]'), rB = $('[data-r-b]');
const rResult = $('[data-r-result]'), rGrid = $('[data-r-grid]');

function calcRatio() {
  const a = getNum(rA), b = getNum(rB);
  if (a === null || b === null || b === 0) { rResult.hidden = true; return; }
  const pct  = a / b * 100;
  const rest = 100 - pct;
  rGrid.innerHTML = [
    stat(
      `${fmt(a)} 占 ${fmt(b)} 的`,
      copyable(fmt(pct), `<span style="color:var(--color-brand)">${fmt(pct)}%</span>`),
    ),
    stat('剩余占比', `${fmt(rest)}%`),
    stat('A : B', a === 0 ? '0 : 1' : `1 : ${fmt(b / a)}`),
  ].join('');
  rResult.hidden = false;
}

on(rA, 'input', calcRatio);
on(rB, 'input', calcRatio);

/* ── 场景 3：涨跌了多少？（A 股惯例：涨红跌绿，动态颜色用 inline） ── */
const cA = $('[data-c-a]'), cB = $('[data-c-b]');
const cResult = $('[data-c-result]'), cGrid = $('[data-c-grid]');

function calcChange() {
  const a = getNum(cA), b = getNum(cB);
  if (a === null || b === null || a === 0) { cResult.hidden = true; return; }
  const change = b - a;
  const pct    = change / Math.abs(a) * 100;
  const color  = change > 0 ? 'var(--color-danger)' : change < 0 ? 'var(--color-success)' : 'inherit';
  const sign   = change > 0 ? '+' : '';
  cGrid.innerHTML = [
    stat(
      '变化幅度',
      copyable(fmt(pct), `<span style="color:${color}">${sign}${fmt(pct)}%</span>`),
      change > 0 ? '上涨' : change < 0 ? '下跌' : '持平',
    ),
    stat('变化量', `<span style="color:${color}">${sign}${fmt(change)}</span>`),
    stat('原值 → 新值', `${fmt(a)} → ${fmt(b)}`),
  ].join('');
  cResult.hidden = false;
}

on(cA, 'input', calcChange);
on(cB, 'input', calcChange);

/* ── 场景 4：打折后多少钱？ ── */
const dOriginal = $('[data-d-original]');
const dRate     = $('[data-d-rate]');
const dFinal    = $('[data-d-final]');
const dResult   = $('[data-d-result]');
const dGrid     = $('[data-d-grid]');

let discountLock = false;

/**
 * 三输入联动：按"刚改动的字段"推算另一项，
 * 修复全部填满后修改任一字段无响应的问题。
 * @param {'original'|'rate'|'final'} changed
 */
function calcDiscount(changed) {
  if (discountLock) return;

  const original = getNum(dOriginal);
  const rate     = getNum(dRate);
  const final_   = getNum(dFinal);

  if ([original, rate, final_].filter(v => v !== null).length < 2) {
    dResult.hidden = true;
    return;
  }

  discountLock = true;

  let o = original, r = rate, f = final_;

  if (changed === 'original') {
    if (r !== null)                   { f = o * r / 100;   dFinal.value    = fmt(f); }
    else if (f !== null && o !== 0)   { r = f / o * 100;   dRate.value     = fmt(r); }
  } else if (changed === 'rate') {
    if (o !== null)                   { f = o * r / 100;   dFinal.value    = fmt(f); }
    else if (f !== null && r !== 0)   { o = f / r * 100;   dOriginal.value = fmt(o); }
  } else if (changed === 'final') {
    if (r !== null && r !== 0)        { o = f / r * 100;   dOriginal.value = fmt(o); }
    else if (o !== null && o !== 0)   { r = f / o * 100;   dRate.value     = fmt(r); }
  }

  discountLock = false;

  /* 读回回写后的最新值再渲染 */
  o = getNum(dOriginal);
  r = getNum(dRate);
  f = getNum(dFinal);

  if (o === null || r === null || f === null) { dResult.hidden = true; return; }

  const saving = o - f;
  dGrid.innerHTML = [
    stat('折扣率', copyable(fmt(r), `<span style="color:var(--color-brand)">${fmt(r)}%</span>`), `打 ${fmt(r / 10)} 折`),
    stat('折后价', copyable(fmt(f), `<span style="color:var(--color-danger)">${fmt(f)}</span>`)),
    stat('节省了', `<span style="color:var(--color-success)">${fmt(saving)}</span>`, `${fmt(100 - r)}% off`),
  ].join('');
  dResult.hidden = false;
}

on(dOriginal, 'input', () => calcDiscount('original'));
on(dRate,     'input', () => calcDiscount('rate'));
on(dFinal,    'input', () => calcDiscount('final'));

on($('[data-action="discount-reset"]'), 'click', () => {
  dOriginal.value = '';
  dRate.value = '';
  dFinal.value = '';
  dResult.hidden = true;
});
