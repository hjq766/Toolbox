/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */

// TODO: 替换为实际的单位因子表（以基准单位 = 1 为核心）
const FACTORS = {
  m:  1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  ft: 0.3048,
};

// TODO: 替换为实际的单位名称
const NAMES = {
  m:  '米',
  km: '千米',
  cm: '厘米',
  mm: '毫米',
  mi: '英里',
  ft: '英尺',
};

/* ========== 2. 状态 ========== */
let precision = 4;
let lastActiveUnit = 'm';

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
  const base = v * FACTORS[fromUnit];
  unitInputs.forEach(el => {
    const k = el.dataset.unit;
    if (k === fromUnit) return;
    el.value = roundTo(base / FACTORS[k], precision);
  });
}

function getAllResults() {
  return unitInputs.map(el => {
    const k = el.dataset.unit;
    return `${NAMES[k]}：${el.value || '0'} ${k}`;
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

// 初始化：预填 1 并触发换算
const initEl = $(`[data-unit="${lastActiveUnit}"]`);
if (initEl) {
  initEl.value = '1';
  convert(lastActiveUnit, '1');
}
