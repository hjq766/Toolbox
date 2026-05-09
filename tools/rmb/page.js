import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const digitsEl = $('[data-digits]');
const resultEl = $('[data-result]');

/* ---------- 核心：数字金额 → 中文大写 ---------- */
function convertCurrency(str) {
  if (!str) return '';
  const MAX = 99_999_999_999.99;
  const D = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
  const R = ['','拾','佰','仟'];
  const B = ['','万','亿'];
  const DEC = ['角','分'];

  str = str.replace(/,/g, '').replace(/^0+/, '') || '0';
  if (!/^(\d+)(\.(\d{0,2}))?$/.test(str)) return '';
  const num = Number(str);
  if (!Number.isFinite(num) || num > MAX) return '';

  const parts = str.split('.');
  const integral = parts[0] || '0';
  const decimal  = (parts[1] || '').padEnd(2, '0').slice(0, 2);

  let out = '';

  if (Number(integral) > 0) {
    let zeroCount = 0;
    for (let i = 0; i < integral.length; i++) {
      const p = integral.length - i - 1;
      const d = Number(integral[i]);
      const mod = p % 4;
      const grp = Math.floor(p / 4);
      if (d === 0) { zeroCount++; }
      else {
        if (zeroCount > 0) out += D[0];
        zeroCount = 0;
        out += D[d] + R[mod];
      }
      if (mod === 0 && zeroCount < 4) out += B[grp];
    }
    out += '元';
  }

  if (decimal && Number(decimal) > 0) {
    for (let i = 0; i < decimal.length; i++) {
      const d = Number(decimal[i]);
      if (d !== 0) out += D[d] + DEC[i];
    }
  } else {
    if (out) out += '整';
  }

  return out || D[0] + '元整';
}

/* ---------- 实时转换 ---------- */
function convert() {
  const raw = digitsEl.value.replace(/[^\d.]/g, '');
  resultEl.textContent = convertCurrency(raw) || '零元整';
}

on(digitsEl, 'input', (e) => {
  // 只保留数字和一个小数点，限制 2 位小数
  let v = e.target.value.replace(/[^\d.]/g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) {
    v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  }
  e.target.value = v;
  convert();
});

/* ---------- 快捷金额 ---------- */
$$('[data-quick]').forEach(btn => on(btn, 'click', () => {
  const n = Number(btn.dataset.quick);
  digitsEl.value = n.toFixed(2);
  convert();
}));

/* ---------- 动作 ---------- */
on($('[data-action="copy"]'), 'click', async () => {
  if (!resultEl.textContent || resultEl.textContent === '零元整') { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(resultEl.textContent);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear"]'), 'click', () => {
  digitsEl.value = '';
  resultEl.textContent = '零元整';
});
