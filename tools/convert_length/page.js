import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ================= 单位定义（基准：米） ================= */
const FACTORS = {
  km: 1000, m: 1, dm: 0.1, cm: 0.01, mm: 0.001, um: 1e-6,
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, nmi: 1852,
  li: 500, chi: 1 / 3, cun: 1 / 30
};

const NAMES = {
  km:'千米', m:'米', dm:'分米', cm:'厘米', mm:'毫米', um:'微米',
  in:'英寸', ft:'英尺', yd:'码', mi:'英里', nmi:'海里',
  li:'市里', chi:'市尺', cun:'市寸'
};

/* ================= DOM ================= */
const inputs = {};
$$('[data-unit]').forEach(el => { inputs[el.dataset.unit] = el; });

const precisionEl  = $('[data-precision]');
const precisionVal = $('[data-precision-val]');
const quickUnitEl  = $('[data-quick-unit]');

/* ================= 状态 ================= */
let precision = 6;

/* ================= 格式化 ================= */
function fmt(n) {
  if (!Number.isFinite(n)) return '';
  return Number(n.toPrecision(precision)).toString();
}

/* ================= 换算核心 ================= */
function convert(sourceKey) {
  const raw = inputs[sourceKey].value.trim();
  if (!raw) {
    for (const k in inputs) if (k !== sourceKey) inputs[k].value = '';
    return;
  }
  const val = Number(raw);
  if (!Number.isFinite(val)) return;

  const base = val * FACTORS[sourceKey];
  for (const k in inputs) {
    if (k === sourceKey) continue;
    inputs[k].value = fmt(base / FACTORS[k]);
  }
}

/* ================= 输入监听 ================= */
for (const key in inputs) {
  on(inputs[key], 'input', () => convert(key));
}

/* ================= 快速输入 ================= */
$$('[data-quick]').forEach(btn => on(btn, 'click', () => {
  const unit = quickUnitEl.value;
  const val = btn.dataset.quick;
  inputs[unit].value = val;
  inputs[unit].focus();
  convert(unit);
}));

/* ================= 精度 ================= */
on(precisionEl, 'input', () => {
  precision = parseInt(precisionEl.value);
  precisionVal.textContent = precision + ' 位';
  const active = Object.keys(inputs).find(k => inputs[k].value.trim());
  if (active) convert(active);
});

/* ================= 复制全部 ================= */
on($('[data-action="copy-all"]'), 'click', async () => {
  const lines = [];
  for (const k in inputs) {
    const v = inputs[k].value.trim();
    if (v) lines.push(`${NAMES[k]}: ${v}`);
  }
  if (!lines.length) { showToast('请先输入数值', { type: 'warn' }); return; }
  const ok = await copyText(lines.join('\n'));
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ================= 重置 ================= */
on($('[data-action="reset"]'), 'click', () => {
  for (const k in inputs) inputs[k].value = '';
  showToast('已重置');
});

/* ================= 初始化 ================= */
inputs.m.value = '1';
convert('m');
