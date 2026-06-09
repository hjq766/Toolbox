import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ======== DOM ======== */
const fromEl     = $('[data-from]');
const toEl       = $('[data-to]');
const amtFromEl  = $('[data-amount-from]');
const amtToEl    = $('[data-amount-to]');
const infoEl     = $('[data-rate-info]');
const tableEl    = $('[data-rate-table]');
const updateEl   = $('[data-update-time]');

/* ======== 货币列表 ======== */
const CURRENCIES = [
  { code: 'CNY', name: '人民币',       symbol: '¥',  flag: '🇨🇳' },
  { code: 'USD', name: '美元',         symbol: '$',  flag: '🇺🇸' },
  { code: 'EUR', name: '欧元',         symbol: '€',  flag: '🇪🇺' },
  { code: 'GBP', name: '英镑',         symbol: '£',  flag: '🇬🇧' },
  { code: 'JPY', name: '日元',         symbol: '¥',  flag: '🇯🇵' },
  { code: 'KRW', name: '韩元',         symbol: '₩',  flag: '🇰🇷' },
  { code: 'HKD', name: '港币',         symbol: '$',  flag: '🇭🇰' },
  { code: 'TWD', name: '新台币',       symbol: '$',  flag: '🇹🇼' },
  { code: 'SGD', name: '新加坡元',     symbol: '$',  flag: '🇸🇬' },
  { code: 'AUD', name: '澳元',         symbol: '$',  flag: '🇦🇺' },
  { code: 'CAD', name: '加元',         symbol: '$',  flag: '🇨🇦' },
  { code: 'CHF', name: '瑞士法郎',     symbol: 'Fr', flag: '🇨🇭' },
  { code: 'RUB', name: '俄罗斯卢布',   symbol: '₽',  flag: '🇷🇺' },
  { code: 'INR', name: '印度卢比',     symbol: '₹',  flag: '🇮🇳' },
  { code: 'THB', name: '泰铢',         symbol: '฿',  flag: '🇹🇭' },
  { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM', flag: '🇲🇾' },
];

// 百度 API 需要的中文名映射
const BAIDU_NAMES = {
  CNY:'人民币', USD:'美元', EUR:'欧元', GBP:'英镑', JPY:'日元',
  KRW:'韩元', HKD:'港币', TWD:'新台币', SGD:'新加坡元', AUD:'澳元',
  CAD:'加元', CHF:'瑞士法郎', RUB:'俄罗斯卢布', INR:'印度卢比',
  THB:'泰铢', MYR:'林吉特',
};

const getC = (code) => CURRENCIES.find(c => c.code === code);

/* ======== 状态 ======== */
let usdRates = {};          // currency-api: 1 USD = X
let googleDate = '';        // Google 数据日期
let baiduRate = null;       // { rate, date, from, to }
let lastDir = 'from';       // 最后输入方向

const CACHE_KEY = 'jqnest_fx_v3';
const CACHE_TTL = 4 * 60 * 60 * 1000;

/* ======== 初始化下拉 ======== */
function populateSelects() {
  const opts = CURRENCIES.map(c => `<option value="${c.code}">${c.flag} ${c.code} - ${c.name}</option>`).join('');
  fromEl.innerHTML = opts;
  toEl.innerHTML = opts;
  fromEl.value = 'USD';
  toEl.value = 'CNY';
}
populateSelects();

/* ======== 汇率计算核心 ======== */
function getRate(from, to) {
  if (from === to) return 1;
  const f = from.toLowerCase(), t = to.toLowerCase();
  return (1 / (usdRates[f] || 1)) * (usdRates[t] || 1);
}

function fmtNum(n) {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1) return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toPrecision(6);
}

/* ======== 双向换算 ======== */
function calcFrom() {
  lastDir = 'from';
  const v = parseFloat(amtFromEl.value);
  if (isNaN(v) || v < 0) { amtToEl.value = ''; updateInfo(); return; }
  const rate = getRate(fromEl.value, toEl.value);
  amtToEl.value = (v * rate).toFixed(4);
  updateInfo();
}

function calcTo() {
  lastDir = 'to';
  const v = parseFloat(amtToEl.value);
  if (isNaN(v) || v < 0) { amtFromEl.value = ''; updateInfo(); return; }
  const rate = getRate(toEl.value, fromEl.value);
  amtFromEl.value = (v * rate).toFixed(4);
  updateInfo();
}

function recalc() {
  if (lastDir === 'to') calcTo(); else calcFrom();
}

/* ======== 汇率信息面板 ======== */
function updateInfo() {
  const from = fromEl.value, to = toEl.value;
  const rate = getRate(from, to);
  const inv  = getRate(to, from);

  if (!usdRates.cny) {
    infoEl.innerHTML = '<div class="u-muted" style="text-align:center;padding:var(--space-3);font-size:var(--text-sm)">正在获取汇率数据…</div>';
    return;
  }

  let html = `
    <div class="result-row"><span class="u-muted">正向汇率</span><strong class="u-mono" data-copy-val="${rate.toFixed(6)}">1 ${from} = ${rate.toFixed(6)} ${to}</strong></div>
    <div class="result-row"><span class="u-muted">反向汇率</span><strong class="u-mono" data-copy-val="${inv.toFixed(6)}">1 ${to} = ${inv.toFixed(6)} ${from}</strong></div>
    <div class="result-row"><span class="u-muted">Google Finance</span><span style="font-size:var(--text-xs)">${googleDate || '—'}</span></div>`;

  if (baiduRate && baiduRate.from === from && baiduRate.to === to) {
    html += `<div class="result-row"><span class="u-muted">百度汇率</span><strong class="u-mono" data-copy-val="${baiduRate.rate.toFixed(6)}">1 ${from} = ${baiduRate.rate.toFixed(6)} ${to}</strong> <span style="font-size:var(--text-xs);color:var(--fg-subtle);margin-left:var(--space-2)">${baiduRate.date}</span></div>`;
  } else if (baiduRate && baiduRate.from === to && baiduRate.to === from) {
    html += `<div class="result-row"><span class="u-muted">百度汇率</span><strong class="u-mono" data-copy-val="${(1/baiduRate.rate).toFixed(6)}">1 ${from} = ${(1/baiduRate.rate).toFixed(6)} ${to}</strong> <span style="font-size:var(--text-xs);color:var(--fg-subtle);margin-left:var(--space-2)">${baiduRate.date}</span></div>`;
  }

  html += `<div style="margin-top:var(--space-2);font-size:var(--text-xs);color:var(--fg-subtle)">汇率仅供参考，实际交易以银行牌价为准 · 点击数值可复制</div>`;
  infoEl.innerHTML = html;
}

/* ======== 汇率表 ======== */
function renderTable() {
  if (!usdRates.cny) return;
  const baseCny = usdRates.cny;
  const rows = CURRENCIES.map(c => {
    const code = c.code.toLowerCase();
    const usdToC = usdRates[code] || 0;
    const cnyToC = usdToC / baseCny;
    const cToCny = cnyToC ? 1 / cnyToC : 0;
    return `<tr><td>${c.flag} ${c.code}</td><td>${c.name}</td><td class="u-mono">${cnyToC.toFixed(6)}</td><td class="u-mono">${cToCny.toFixed(4)}</td></tr>`;
  }).join('');
  tableEl.innerHTML = `<table class="data-table"><thead><tr><th>代码</th><th>货币</th><th>1 CNY =</th><th>1 外币 = CNY</th></tr></thead><tbody>${rows}</tbody></table>`;
  updateEl.textContent = `Google Finance · ${googleDate || '—'}`;
}

/* ================================================================
   数据源 1: currency-api（Google Finance）
   ================================================================ */
const API_PRIMARY  = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';
const API_FALLBACK = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (Date.now() - c.ts > CACHE_TTL) return null;
    return c;
  } catch { return null; }
}

function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() })); } catch {}
}

function applyGoogleData(data) {
  usdRates = data.usd || {};
  googleDate = data.date || '';
  renderTable();
  recalc();
}

async function fetchGoogle(silent = false) {
  if (!silent) showToast('正在获取 Google Finance 汇率…');
  for (const url of [API_PRIMARY, API_FALLBACK]) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const data = await resp.json();
      if (data && data.usd) {
        applyGoogleData(data);
        saveCache(data);
        if (!silent) showToast('Google 汇率已更新', { type: 'success' });
        return true;
      }
    } catch { continue; }
  }
  if (!silent) showToast('Google Finance 数据获取失败', { type: 'warn' });
  return false;
}

/* ================================================================
   数据源 2: 百度汇率（JSONP）— 仅查询当前货币对
   ================================================================ */
function fetchBaidu(fromCode, toCode) {
  const fromName = BAIDU_NAMES[fromCode];
  const toName   = BAIDU_NAMES[toCode];
  if (!fromName || !toName) return;

  const cbName = '__baiduFx' + Date.now() + Math.random().toString(36).slice(2, 6);
  const script = document.createElement('script');
  let done = false;

  const cleanup = () => {
    done = true;
    delete window[cbName];
    if (script.parentNode) script.remove();
  };
  const timeout = setTimeout(cleanup, 6000);

  window[cbName] = (resp) => {
    if (done) return;
    clearTimeout(timeout);
    cleanup();
    try {
      const list = resp?.data;
      if (!Array.isArray(list) || !list.length) return;
      const tpl = list[0]?.DisplayData?.resultData?.tplData;
      if (!tpl) return;
      const money = tpl.money || tpl.result || {};
      const rateVal = parseFloat(money.number || money.result || money.num);
      if (isNaN(rateVal)) return;
      const dateStr = money.update_time || money.updatetime || '';
      baiduRate = { rate: rateVal, date: dateStr ? `更新 ${dateStr}` : '百度', from: fromCode, to: toCode };
      updateInfo();
    } catch { /* ignore parse failures */ }
  };

  script.onerror = () => { clearTimeout(timeout); cleanup(); };
  script.src = `https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?resource_id=6017&query=1${fromName}等于多少${toName}&cb=${cbName}`;
  document.head.appendChild(script);
}

/* ======== 初始化 ======== */
async function init() {
  const cached = loadCache();
  if (cached && cached.usd) {
    applyGoogleData(cached);
  } else {
    await fetchGoogle(true);
  }
  // 同时拉取百度数据作对比
  fetchBaidu(fromEl.value, toEl.value);
}

/* ======== 事件 ======== */
on(amtFromEl, 'input', calcFrom);
on(amtToEl,   'input', calcTo);
on(fromEl, 'change', () => { recalc(); fetchBaidu(fromEl.value, toEl.value); });
on(toEl,   'change', () => { recalc(); fetchBaidu(fromEl.value, toEl.value); });

on($('[data-action="swap"]'), 'click', () => {
  const tmpC = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = tmpC;
  const tmpV = amtFromEl.value;
  amtFromEl.value = amtToEl.value;
  amtToEl.value = tmpV;
  updateInfo();
  fetchBaidu(fromEl.value, toEl.value);
});

on($('[data-action="refresh"]'), 'click', async () => {
  await fetchGoogle(false);
  fetchBaidu(fromEl.value, toEl.value);
});

$$('[data-quick]').forEach(btn => on(btn, 'click', () => {
  amtFromEl.value = btn.dataset.quick;
  calcFrom();
}));

init();
