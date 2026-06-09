import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';

mountToolHeader();

/* ============ 1. 状态 ============ */

let currentMethod = 'equal-payment';
let lastSummary = '';
const MAX_MONTHS = 600;
const MAX_YEARLY_RATE = 0.3;

/* ============ 2. DOM 引用 ============ */

const amountEl = $('[data-input="amount"]');
const yearsEl = $('[data-input="years"]');
const rateEl = $('[data-input="rate"]');
const singlePanel = $('[data-panel="single"]');
const comparePanel = $('[data-panel="compare"]');
const schedulePanel = $('[data-schedule-panel]');
const scheduleEl = $('[data-schedule]');
const scheduleBody = $('[data-schedule-body]');
const scheduleBtn = $('[data-action="toggle-schedule"]');
const colPayment = $('[data-col-payment]');

/* ============ 3. 工具函数 ============ */

function yuan(n) {
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function readParams() {
  return {
    amount: Number(amountEl.value) * 10000,
    months: Math.round(Number(yearsEl.value) * 12),
    yearlyRate: Number(rateEl.value) / 100,
  };
}

function calcEqualPayment(amount, months, monthlyRate) {
  if (monthlyRate === 0) {
    const monthly = amount / months;
    return { monthly, interest: 0, total: amount };
  }

  const pow = Math.pow(1 + monthlyRate, months);
  const monthly = amount * monthlyRate * pow / (pow - 1);
  const total = monthly * months;
  return { monthly, interest: total - amount, total };
}

function calcEqualPrincipal(amount, months, monthlyRate) {
  const principal = amount / months;
  let interest = 0;

  for (let i = 0; i < months; i++) {
    interest += (amount - principal * i) * monthlyRate;
  }

  return {
    firstMonthly: principal + amount * monthlyRate,
    interest,
    total: amount + interest,
  };
}

function buildSchedule(amount, months, monthlyRate, method) {
  const rows = [];
  let remaining = amount;

  if (method === 'equal-principal') {
    const principal = amount / months;
    for (let i = 1; i <= months; i++) {
      const interest = remaining * monthlyRate;
      const payment = principal + interest;
      remaining -= principal;
      rows.push({ i, payment, principal, interest, remaining: Math.max(remaining, 0) });
    }
    return rows;
  }

  const { monthly } = calcEqualPayment(amount, months, monthlyRate);
  for (let i = 1; i <= months; i++) {
    const interest = remaining * monthlyRate;
    const principal = monthly - interest;
    remaining -= principal;
    rows.push({ i, payment: monthly, principal, interest, remaining: Math.max(remaining, 0) });
  }
  return rows;
}

function setText(selector, value) {
  const el = $(selector);
  if (el) el.textContent = value;
}

function renderSchedule(params) {
  const rows = buildSchedule(params.amount, params.months, params.yearlyRate / 12, currentMethod);
  const frag = document.createDocumentFragment();

  rows.forEach(row => {
    const tr = document.createElement('tr');
    [row.i, yuan(row.payment), yuan(row.principal), yuan(row.interest), yuan(row.remaining)]
      .forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
    frag.appendChild(tr);
  });

  scheduleBody.innerHTML = '';
  scheduleBody.appendChild(frag);
}

/* ============ 4. 渲染 ============ */

function calculate() {
  const params = readParams();
  const isValid = Number.isFinite(params.amount)
    && Number.isFinite(params.months)
    && Number.isFinite(params.yearlyRate)
    && params.amount > 0
    && params.months > 0
    && params.months <= MAX_MONTHS
    && params.yearlyRate >= 0
    && params.yearlyRate <= MAX_YEARLY_RATE;
  if (!isValid) {
    singlePanel.hidden = true;
    comparePanel.hidden = true;
    schedulePanel.hidden = true;
    lastSummary = '';
    return;
  }
  singlePanel.hidden = currentMethod === 'compare';
  comparePanel.hidden = currentMethod !== 'compare';
  schedulePanel.hidden = currentMethod === 'compare';

  const monthlyRate = params.yearlyRate / 12;
  const ep = calcEqualPayment(params.amount, params.months, monthlyRate);
  const epr = calcEqualPrincipal(params.amount, params.months, monthlyRate);

  setText('[data-val="cmp-ep-monthly"]', `${yuan(ep.monthly)} 元`);
  setText('[data-val="cmp-ep-interest"]', `${yuan(ep.interest)} 元`);
  setText('[data-val="cmp-ep-total"]', `${yuan(ep.total)} 元`);
  setText('[data-val="cmp-epr-first"]', `${yuan(epr.firstMonthly)} 元`);
  setText('[data-val="cmp-epr-interest"]', `${yuan(epr.interest)} 元`);
  setText('[data-val="cmp-epr-total"]', `${yuan(epr.total)} 元`);
  setText('[data-val="compare-summary"]', `等额本金比等额还款少付利息 ${yuan(ep.interest - epr.interest)} 元。`);

  if (currentMethod === 'equal-principal') {
    setText('[data-result-title]', '等额本金结果');
    setText('[data-result-desc]', '前期还款压力更高，但总利息通常更少。');
    setText('[data-label="primary"]', '首月月供');
    setText('[data-note="primary"]', '之后逐月递减');
    setText('[data-val="primary"]', yuan(epr.firstMonthly));
    setText('[data-val="interest"]', yuan(epr.interest));
    setText('[data-val="total"]', yuan(epr.total));
    colPayment.textContent = '月供（递减）';
    lastSummary = `等额本金：首月月供 ${yuan(epr.firstMonthly)} 元，支付利息 ${yuan(epr.interest)} 元，还款总额 ${yuan(epr.total)} 元。`;
  } else {
    setText('[data-result-title]', '等额还款结果');
    setText('[data-result-desc]', '每月还款金额固定，便于长期预算。');
    setText('[data-label="primary"]', '月供');
    setText('[data-note="primary"]', '元/月');
    setText('[data-val="primary"]', yuan(ep.monthly));
    setText('[data-val="interest"]', yuan(ep.interest));
    setText('[data-val="total"]', yuan(ep.total));
    colPayment.textContent = '月供';
    lastSummary = `等额还款：月供 ${yuan(ep.monthly)} 元，支付利息 ${yuan(ep.interest)} 元，还款总额 ${yuan(ep.total)} 元。`;
  }

  if (!scheduleEl.hidden) renderSchedule(params);
}

function setMethod(method) {
  currentMethod = method;
  $$('[data-method]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.method === method);
  });

  singlePanel.hidden = method === 'compare';
  comparePanel.hidden = method !== 'compare';
  schedulePanel.hidden = method === 'compare';
  calculate();
}

/* ============ 5. 事件绑定 ============ */

on($('[data-methods]'), 'click', e => {
  const btn = e.target.closest('[data-method]');
  if (btn) setMethod(btn.dataset.method);
});

on(document, 'input', e => {
  if (e.target.dataset.input) calculate();
});

on(document, 'click', e => {
  const yearBtn = e.target.closest('[data-preset-year]');
  if (yearBtn) {
    yearsEl.value = yearBtn.dataset.presetYear;
    calculate();
    return;
  }

  const rateBtn = e.target.closest('[data-preset-rate]');
  if (rateBtn) {
    rateEl.value = rateBtn.dataset.presetRate;
    calculate();
    return;
  }

  if (e.target.closest('[data-action="toggle-schedule"]')) {
    scheduleEl.hidden = !scheduleEl.hidden;
    scheduleBtn.textContent = scheduleEl.hidden ? '展开' : '收起';
    calculate();
    return;
  }

  if (e.target.closest('[data-action="copy-summary"]')) {
    copyText(lastSummary).then(ok => showToast(ok ? '已复制结果' : '复制失败', { type: ok ? 'success' : 'error' }));
  }
});

calculate();
