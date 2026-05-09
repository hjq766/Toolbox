import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $ } from '../../public/scripts/utils/dom.js';

mountToolHeader();

const cities = [
  { name: '夏威夷',   nameEn: 'Hawaii',       tz: 'UTC-10',   flag: 'us' },
  { name: '阿拉斯加', nameEn: 'Alaska',       tz: 'UTC-9',    flag: 'us' },
  { name: '洛杉矶',   nameEn: 'Los Angeles',  tz: 'UTC-8',    flag: 'us' },
  { name: '芝加哥',   nameEn: 'Chicago',      tz: 'UTC-6',    flag: 'us' },
  { name: '纽约',     nameEn: 'New York',     tz: 'UTC-5',    flag: 'us' },
  { name: '伦敦',     nameEn: 'London',       tz: 'UTC+0',    flag: 'gb' },
  { name: '巴黎',     nameEn: 'Paris',        tz: 'UTC+1',    flag: 'fr' },
  { name: '柏林',     nameEn: 'Berlin',       tz: 'UTC+1',    flag: 'de' },
  { name: '莫斯科',   nameEn: 'Moscow',       tz: 'UTC+3',    flag: 'ru' },
  { name: '迪拜',     nameEn: 'Dubai',        tz: 'UTC+4',    flag: 'ae' },
  { name: '新德里',   nameEn: 'New Delhi',    tz: 'UTC+5:30', flag: 'in' },
  { name: '曼谷',     nameEn: 'Bangkok',      tz: 'UTC+7',    flag: 'th' },
  { name: '新加坡',   nameEn: 'Singapore',    tz: 'UTC+8',    flag: 'sg' },
  { name: '香港',     nameEn: 'Hongkong',     tz: 'UTC+8',    flag: 'cn' },
  { name: '首尔',     nameEn: 'Seoul',        tz: 'UTC+9',    flag: 'kr' },
  { name: '东京',     nameEn: 'Tokyo',        tz: 'UTC+9',    flag: 'jp' },
  { name: '悉尼',     nameEn: 'Sydney',       tz: 'UTC+11',   flag: 'au' },
  { name: '惠灵顿',   nameEn: 'Wellington',   tz: 'UTC+13',   flag: 'nz' }
];

const gridEl  = $('[data-grid]');
const bjTime  = $('[data-bj-time]');
const bjDate  = $('[data-bj-date]');

/* ---------- time calc ---------- */
function parseOffset(tz) {
  const s = tz.replace('UTC', '').trim();
  if (s.includes(':')) {
    const [h, m] = s.split(':').map(Number);
    return h >= 0 ? h + m / 60 : h - m / 60;
  }
  return parseFloat(s) || 0;
}

function getTime(tz) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const d = new Date(utc + parseOffset(tz) * 3600000);
  const pad = n => String(n).padStart(2, '0');
  return {
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    date: `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日`
  };
}

/* ---------- render ---------- */
gridEl.innerHTML = cities.map(c => `
  <div class="card wt-card" data-city="${c.name}">
    <div class="card-body">
      <div class="u-row u-gap-2 u-mb-2" style="justify-content:center">
        <span class="fi fi-${c.flag}"></span>
        <span style="font-size:var(--text-sm);font-weight:600">${c.name}</span>
        <span class="u-muted" style="font-size:var(--text-xs)">${c.nameEn}</span>
      </div>
      <div class="wt-card-time" data-t>--:--:--</div>
      <div class="u-muted" style="font-size:var(--text-xs)" data-d>----年--月--日</div>
      <div class="u-muted" style="font-size:var(--text-xs);margin-top:var(--space-1)">${c.tz}</div>
    </div>
  </div>`).join('');

function tick() {
  const bj = getTime('UTC+8');
  bjTime.textContent = bj.time;
  bjDate.textContent = bj.date;

  cities.forEach(c => {
    const card = gridEl.querySelector(`[data-city="${c.name}"]`);
    if (!card) return;
    const t = getTime(c.tz);
    card.querySelector('[data-t]').textContent = t.time;
    card.querySelector('[data-d]').textContent = t.date;
  });
}

tick();
setInterval(tick, 1000);
