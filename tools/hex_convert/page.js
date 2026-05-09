import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const inputs = $$('input[data-base]');

function parseVal(str, base) {
  const s = String(str).trim();
  if (!s) return null;
  const neg = s.startsWith('-');
  const body = neg ? s.slice(1) : s;
  // 允许 0x/0b/0o 前缀
  const clean = body.replace(/^0[xX]/, '').replace(/^0[bB]/, '').replace(/^0[oO]/, '');
  if (!clean) return NaN;
  const re = base <= 10
    ? new RegExp(`^[0-${base - 1}]+$`)
    : new RegExp(`^[0-9a-${String.fromCharCode(96 + base - 10)}]+$`, 'i');
  if (!re.test(clean)) return NaN;
  const n = parseInt(clean, base);
  if (!Number.isFinite(n)) return NaN;
  return neg ? -n : n;
}

function updateFromSource(source) {
  const base = Number(source.dataset.base);
  const raw = source.value.trim();
  // 清除所有错误态
  inputs.forEach(i => i.classList.remove('is-error'));
  if (!raw) { inputs.forEach(i => { if (i !== source) i.value = ''; }); return; }
  const n = parseVal(raw, base);
  if (Number.isNaN(n)) {
    source.classList.add('is-error');
    return;
  }
  for (const el of inputs) {
    if (el === source) continue;
    const b = Number(el.dataset.base);
    el.value = (n < 0 ? '-' : '') + Math.abs(n).toString(b).toUpperCase();
  }
}

inputs.forEach(el => on(el, 'input', () => updateFromSource(el)));

// 初始化一个示例
const dec = inputs.find(i => i.dataset.base === '10');
dec.value = '255';
updateFromSource(dec);

// 自定义进制
const cVal  = $('[data-custom-value]');
const cFrom = $('[data-custom-from]');
const cTo   = $('[data-custom-to]');
const cOut  = $('[data-custom-result]');

function updateCustom() {
  const from = Math.max(2, Math.min(36, Number(cFrom.value) || 10));
  const to   = Math.max(2, Math.min(36, Number(cTo.value)   || 16));
  const n = parseVal(cVal.value, from);
  if (n == null) { cOut.textContent = '—'; return; }
  if (Number.isNaN(n)) { cOut.textContent = '输入不符合源进制'; return; }
  cOut.textContent = (n < 0 ? '-' : '') + Math.abs(n).toString(to).toUpperCase();
}
[cVal, cFrom, cTo].forEach(el => on(el, 'input', updateCustom));
updateCustom();

on($('[data-copy-custom]'), 'click', async () => {
  const ok = await copyText(cOut.textContent);
  showToast(ok ? '已复制结果' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* 错误态最小样式（注入一次） */
const style = document.createElement('style');
style.textContent = `.input.is-error{border-color:var(--color-danger);box-shadow:0 0 0 3px hsl(0 78% 58%/.18)}`;
document.head.appendChild(style);
