import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ================= 单位定义（基准：帕斯卡 Pa） ================= */
const FACTORS = {
  bar: 100_000, kilopascal: 1000, hectopascal: 100, millibar: 100, pascal: 1,
  atmosphere: 101_325, mmhg: 133.322, inhg: 3386.389,
  kgf_cm2: 98_066.5, kgf_m2: 9.80665, mmh2o: 9.80665,
  lbf_ft2: 47.88026, psi: 6894.757
};
const NAMES = {
  bar:'巴', kilopascal:'千帕', hectopascal:'百帕', millibar:'毫巴', pascal:'帕斯卡',
  atmosphere:'标准大气压', mmhg:'毫米汞柱', inhg:'英寸汞柱',
  kgf_cm2:'公斤力/cm²', kgf_m2:'公斤力/m²', mmh2o:'毫米水柱',
  lbf_ft2:'磅力/ft²', psi:'psi'
};

/* ================= DOM ================= */
const inputs = {};
$$('[data-unit]').forEach(el => { inputs[el.dataset.unit] = el; });
const precisionEl = $('[data-precision]'), precisionVal = $('[data-precision-val]'), quickUnitEl = $('[data-quick-unit]');
let precision = 6;

function fmt(n) { if (!Number.isFinite(n)) return ''; return Number(n.toPrecision(precision)).toString(); }

function convert(src) {
  const raw = inputs[src].value.trim();
  if (!raw) { for (const k in inputs) if (k !== src) inputs[k].value = ''; return; }
  const val = Number(raw); if (!Number.isFinite(val)) return;
  const base = val * FACTORS[src];
  for (const k in inputs) { if (k === src) continue; inputs[k].value = fmt(base / FACTORS[k]); }
}

for (const key in inputs) on(inputs[key], 'input', () => convert(key));

$$('[data-quick]').forEach(btn => on(btn, 'click', () => { const u = quickUnitEl.value; inputs[u].value = btn.dataset.quick; inputs[u].focus(); convert(u); }));
on(precisionEl, 'input', () => { precision = parseInt(precisionEl.value); precisionVal.textContent = precision + ' 位'; const a = Object.keys(inputs).find(k => inputs[k].value.trim()); if (a) convert(a); });
on($('[data-action="copy-all"]'), 'click', async () => { const lines = []; for (const k in inputs) { const v = inputs[k].value.trim(); if (v) lines.push(`${NAMES[k]}: ${v}`); } if (!lines.length) { showToast('请先输入数值', { type: 'warn' }); return; } const ok = await copyText(lines.join('\n')); showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' }); });
on($('[data-action="reset"]'), 'click', () => { for (const k in inputs) inputs[k].value = ''; showToast('已重置'); });

inputs.atmosphere.value = '1'; convert('atmosphere');
