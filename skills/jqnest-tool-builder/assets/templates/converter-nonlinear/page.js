/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */

// TODO: 替换为实际的非线性单位定义
// 每个单位提供 toBase（转为基准）和 fromBase（从基准转出）
const UNITS = {
  C: {
    name: '摄氏度',
    symbol: '°C',
    toBase:   v => v,                    // 以摄氏度为基准
    fromBase: v => v,
  },
  F: {
    name: '华氏度',
    symbol: '°F',
    toBase:   v => (v - 32) * 5 / 9,
    fromBase: v => v * 9 / 5 + 32,
  },
  K: {
    name: '开尔文',
    symbol: 'K',
    toBase:   v => v - 273.15,
    fromBase: v => v + 273.15,
  },
};

/* ========== 2. 状态 ========== */
let precision = 4;
let lastActiveUnit = 'C';

/* ========== 3. DOM 引用 ========== */
const unitInputs    = $$('[data-unit]');
const precisionEl   = $('[data-precision]');
const precisionVal  = $('[data-precision-val]');
const quickBtns     = $$('[data-quick]');
const copyAllBtn    = $('[data-action="copy-all"]');
const resetBtn      = $('[data-action="reset"]');

/* ========== 4. 工具函数 ========== */

function roundTo(num, digits) {
  if (!isFinite(num)) return '';
  if (num === 0) return '0';
  const s = num.toFixed(digits);
  return s.replace(/\.?0+$/, '') || '0';
}

function convert(fromUnit, value) {
  if (value === '' || !isFinite(Number(value))) {
    unitInputs.forEach(el => {
      if (el.dataset.unit !== fromUnit) el.value = '';
    });
    return;
  }
  const v = Number(value);
  const base = UNITS[fromUnit].toBase(v);
  unitInputs.forEach(el => {
    const k = el.dataset.unit;
    if (k === fromUnit) return;
    el.value = roundTo(UNITS[k].fromBase(base), precision);
  });
}

function getAllResults() {
  return unitInputs.map(el => {
    const k = el.dataset.unit;
    const u = UNITS[k];
    return `${u.name}：${el.value || '0'} ${u.symbol}`;
  }).join('\n');
}

/* ========== 5. 事件绑定 ========== */

unitInputs.forEach(el => {
  on(el, 'input', () => {
    lastActiveUnit = el.dataset.unit;
    convert(el.dataset.unit, el.value);
  });
  on(el, 'focus', () => {
    lastActiveUnit = el.dataset.unit;
  });
});

on(precisionEl, 'input', () => {
  precision = Number(precisionEl.value);
  precisionVal.textContent = precision;
  const activeEl = $(`[data-unit="${lastActiveUnit}"]`);
  if (activeEl && activeEl.value) {
    convert(lastActiveUnit, activeEl.value);
  }
});

quickBtns.forEach(btn => {
  on(btn, 'click', () => {
    const v = btn.dataset.quick;
    const activeEl = $(`[data-unit="${lastActiveUnit}"]`);
    if (activeEl) {
      activeEl.value = v;
      convert(lastActiveUnit, v);
    }
  });
});

on(copyAllBtn, 'click', () => {
  copyText(getAllResults());
  showToast('已复制全部结果', { type: 'success' });
});

on(resetBtn, 'click', () => {
  unitInputs.forEach(el => { el.value = ''; });
  showToast('已重置');
});

// 初始化
const initEl = $(`[data-unit="${lastActiveUnit}"]`);
if (initEl) {
  initEl.value = '0';
  convert(lastActiveUnit, '0');
}
