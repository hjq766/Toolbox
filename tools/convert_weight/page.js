import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ================= 单位定义（基准：千克） ================= */
const FACTORS = {
  t: 1000, kg: 1, g: 0.001, mg: 1e-6, ct: 0.0002,
  lb: 0.45359237, oz: 0.028349523125, st: 6.35029318,
  jin: 0.5, liang: 0.05
};
const NAMES = {
  t:'吨', kg:'千克', g:'克', mg:'毫克', ct:'克拉',
  lb:'磅', oz:'盎司', st:'英石', jin:'市斤', liang:'市两'
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

inputs.kg.value = '1'; convert('kg');
