import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ================= 单位定义（基准：毫升 mL） ================= */
const FACTORS = {
  cubicm: 1_000_000, cubicdm: 1000, cubiccm: 1, cubicmm: 0.001,
  hl: 100_000, l: 1000, dl: 100, cl: 10, ml: 1,
  shi: 100_000, hu: 50_000, dou: 10_000, sheng: 1000, he: 100,
  shao: 10, cuo: 1, chao: 0.1, gui: 0.01, liao: 0.001,
  cubicyd: 764_554.858, cubicft: 28_316.846592, cubicin: 16.387064,
  ukgallon: 4546.09, ukquart: 1136.5225, ukpint: 568.26125, ukfloz: 28.4130625,
  usgallon: 3785.411784, usquart: 946.352946, uspint: 473.176473,
  uscup: 236.588236, usfloz: 29.5735295625, ustbsp: 14.7867647813, ustsp: 4.92892159375
};
const NAMES = {
  cubicm:'立方米', cubicdm:'立方分米', cubiccm:'立方厘米', cubicmm:'立方毫米',
  hl:'百升', l:'升', dl:'分升', cl:'厘升', ml:'毫升',
  shi:'市石', hu:'市斛', dou:'市斗', sheng:'市升', he:'市合',
  shao:'市勺', cuo:'市撮', chao:'市抄', gui:'市圭', liao:'市撂',
  cubicyd:'立方码', cubicft:'立方英尺', cubicin:'立方英寸',
  ukgallon:'英制加仑', ukquart:'英制夸脱', ukpint:'英制品脱', ukfloz:'英制液盎司',
  usgallon:'美制加仑', usquart:'美制夸脱', uspint:'美制品脱',
  uscup:'美制杯', usfloz:'美制液盎司', ustbsp:'美制汤匙', ustsp:'美制茶匙'
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

inputs.l.value = '1'; convert('l');
