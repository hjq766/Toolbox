/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const MAX_AMOUNT  = 99_999_999_999.99;
const MAX_HISTORY = 5;

/* ========== 2. 状态 ========== */
const history = [];

/* ========== 3. DOM 引用 ========== */
const digitsEl       = $('[data-digits]');
const resultEl       = $('[data-result]');
const fmtEl          = $('[data-fmt]');
const historyEl      = $('[data-history]');
const clearHistBtn   = $('[data-action="clear-history"]');

/* ========== 4. 工具函数 ========== */

function convertCurrency(str) {
  if (!str) return '';
  const D   = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
  const R   = ['','拾','佰','仟'];
  const B   = ['','万','亿'];
  const DEC = ['角','分'];

  str = str.replace(/,/g, '').replace(/^0+(?=\d)/, '') || '0';
  if (!/^(\d+)(\.(\d{0,2}))?$/.test(str)) return '';
  const num = Number(str);
  if (!Number.isFinite(num) || num > MAX_AMOUNT) return '';

  const parts    = str.split('.');
  const integral = parts[0] || '0';
  const decimal  = (parts[1] || '').padEnd(2, '0').slice(0, 2);

  let out = '';

  if (Number(integral) > 0) {
    let zeroCount = 0;
    for (let i = 0; i < integral.length; i++) {
      const p   = integral.length - i - 1;
      const d   = Number(integral[i]);
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
  } else if (Number(decimal) > 0) {
    out = '零元';
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

function fmtNumber(raw) {
  if (!raw) return '¥ 0.00';
  const clean   = raw.replace(/,/g, '');
  const num     = Number(clean);
  if (!Number.isFinite(num)) return '¥ 0.00';
  const parts   = clean.split('.');
  const intPart = parts[0] || '0';
  const decPart = (parts[1] || '').padEnd(2, '0').slice(0, 2);
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `¥ ${grouped}.${decPart}`;
}

function renderHistory() {
  clearHistBtn.hidden = !history.length;
  if (!history.length) {
    historyEl.innerHTML = '<p class="rmb-hint u-text-center" style="padding:var(--space-2) 0">暂无记录</p>';
    return;
  }
  historyEl.innerHTML = history.map((item, i) => `
    <div style="display:flex;align-items:flex-start;gap:var(--space-2);padding:6px 0;border-bottom:1px dashed var(--border-subtle)">
      <div style="flex:1;min-width:0">
        <div style="font-size:var(--text-xs);color:var(--fg-muted);margin-bottom:2px">${item.fmt}</div>
        <div style="font-size:var(--text-sm);font-weight:600;color:var(--fg-strong);word-break:break-all;line-height:1.5">${item.chinese}</div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;margin-top:2px">
        <button class="btn is-sm is-ghost" data-copy-idx="${i}">复制</button>
        <button class="btn is-sm is-ghost" style="padding:0 8px;opacity:.45" data-del-idx="${i}">×</button>
      </div>
    </div>
  `).join('');
}

function deleteHistory(idx) {
  history.splice(idx, 1);
  renderHistory();
}

function addToHistory(raw, fmt, chinese) {
  if (!chinese || chinese === '零元整' || !raw) return;
  if (history.length && history[0].chinese === chinese) return;
  history.unshift({ raw, fmt, chinese });
  if (history.length > MAX_HISTORY) history.pop();
  renderHistory();
}

function convert() {
  const raw     = digitsEl.value.replace(/[^\d.]/g, '');
  const chinese = convertCurrency(raw) || '零元整';
  const fmt     = fmtNumber(raw);
  resultEl.textContent = chinese;
  fmtEl.textContent    = fmt;
  return { raw, fmt, chinese };
}

/* ========== 5. 事件绑定 ========== */

on(digitsEl, 'input', e => {
  let v = e.target.value.replace(/[^\d.]/g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  e.target.value = v;
  convert();
});

on(digitsEl, 'blur', () => {
  const raw = digitsEl.value.replace(/[^\d.]/g, '');
  if (raw) addToHistory(raw, fmtEl.textContent, resultEl.textContent);
});

$$('[data-quick]').forEach(btn => on(btn, 'click', () => {
  const raw = Number(btn.dataset.quick).toFixed(2);
  digitsEl.value = raw;
  const { fmt, chinese } = convert();
  addToHistory(raw, fmt, chinese);
}));

on($('[data-action="copy"]'), 'click', async () => {
  const chinese = resultEl.textContent;
  if (!chinese || chinese === '零元整') { showToast('结果为空', { type: 'warn' }); return; }
  addToHistory(digitsEl.value, fmtEl.textContent, chinese);
  const ok = await copyText(chinese);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="clear"]'), 'click', () => {
  digitsEl.value       = '';
  resultEl.textContent = '零元整';
  fmtEl.textContent    = '¥ 0.00';
});

on(historyEl, 'click', async e => {
  const copyBtn = e.target.closest('[data-copy-idx]');
  if (copyBtn) {
    const item = history[+copyBtn.dataset.copyIdx];
    if (!item) return;
    const ok = await copyText(item.chinese);
    showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
    return;
  }
  const delBtn = e.target.closest('[data-del-idx]');
  if (delBtn) deleteHistory(+delBtn.dataset.delIdx);
});

on(clearHistBtn, 'click', () => {
  history.length = 0;
  renderHistory();
});
