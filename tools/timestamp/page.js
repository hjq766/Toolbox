import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';

mountToolHeader();

const clockEl   = $('[data-clock]');
const clockTsEl = $('[data-clock-ts]');
const tsInput   = $('[data-input="ts"]');
const dateInput = $('[data-input="date"]');
const resultDate = $('[data-result-date]');
const resultTs   = $('[data-result-ts]');

/* ======== 实时时钟 ======== */
function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  clockTsEl.textContent = `秒: ${Math.floor(now.getTime() / 1000)}　毫秒: ${now.getTime()}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ======== 时间戳 → 日期 ======== */
function convertTs2Date() {
  const raw = tsInput.value.trim();
  if (!raw) { resultDate.innerHTML = ''; return; }
  let ts = parseInt(raw, 10);
  if (isNaN(ts)) { resultDate.innerHTML = '<div class="field-error">无效的时间戳</div>'; return; }
  const isMs = raw.length >= 13;
  const ms = isMs ? ts : ts * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) { resultDate.innerHTML = '<div class="field-error">无效的时间戳</div>'; return; }

  const rows = [
    ['本地时间', d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })],
    ['UTC 时间', d.toUTCString()],
    ['ISO 8601', d.toISOString()],
    ['秒级时间戳', Math.floor(ms / 1000)],
    ['毫秒时间戳', ms],
  ];
  resultDate.innerHTML = rows.map(([l, v]) =>
    `<div class="result-row"><span class="u-muted">${l}</span><span class="u-mono" style="cursor:pointer" data-copy-val="${v}">${v}</span></div>`
  ).join('');
}

on(tsInput, 'input', convertTs2Date);
on($('[data-action="now-ts"]'), 'click', () => {
  tsInput.value = Math.floor(Date.now() / 1000);
  convertTs2Date();
});

/* ======== 日期 → 时间戳 ======== */
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
dateInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

function convertDate2Ts() {
  const val = dateInput.value;
  if (!val) { resultTs.innerHTML = ''; return; }
  const d = new Date(val);
  if (isNaN(d.getTime())) { resultTs.innerHTML = '<div class="field-error">无效的日期</div>'; return; }
  const sec = Math.floor(d.getTime() / 1000);
  const ms = d.getTime();

  const rows = [
    ['秒级时间戳', sec],
    ['毫秒时间戳', ms],
    ['ISO 8601', d.toISOString()],
    ['UTC 时间', d.toUTCString()],
  ];
  resultTs.innerHTML = rows.map(([l, v]) =>
    `<div class="result-row"><span class="u-muted">${l}</span><span class="u-mono" style="cursor:pointer" data-copy-val="${v}">${v}</span></div>`
  ).join('');
}

on(dateInput, 'input', convertDate2Ts);
convertDate2Ts();

