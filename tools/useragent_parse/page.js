import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';

mountToolHeader();

const myUaEl       = $('[data-my-ua]');
const myStatsEl    = $('[data-my-stats]');
const inputEl      = $('[data-input]');
const resultStats  = $('[data-result-stats]');
const resultDetail = $('[data-result-detail]');
const examplesEl   = $('[data-examples]');

function row(label, value) {
  if (!value) return '';
  return `<div class="result-row"><span class="u-muted">${label}</span><span>${escapeHtml(String(value))}</span></div>`;
}

function stat(label, value, sub) {
  return `<div class="ua-stat"><div class="label">${label}</div><div class="value">${escapeHtml(String(value || '未知'))}</div>${sub ? `<div class="sub">${escapeHtml(String(sub))}</div>` : ''}</div>`;
}

/* ======== UA 解析器 ======== */
function parseUA(ua) {
  const result = {
    browser: '', browserVersion: '',
    engine: '', engineVersion: '',
    os: '', osVersion: '',
    device: '', deviceType: '',
    bot: false,
  };

  // Bot
  if (/bot|crawl|spider|slurp|ia_archiver/i.test(ua)) {
    result.bot = true;
    const m = ua.match(/(Googlebot|Bingbot|baiduspider|YandexBot|Slurp|DuckDuckBot|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|ChatGPT|GPTBot)[\/\s]?([\d.]*)/i);
    if (m) { result.browser = m[1]; result.browserVersion = m[2] || ''; }
    result.deviceType = '爬虫/机器人';
    return result;
  }

  // Device type
  if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) result.deviceType = '手机';
  else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) result.deviceType = '平板';
  else result.deviceType = '桌面';

  // OS
  if (/Windows NT ([\d.]+)/i.test(ua)) {
    result.os = 'Windows';
    const ver = RegExp.$1;
    const map = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' };
    result.osVersion = map[ver] || ver;
  } else if (/Mac OS X ([\d._]+)/i.test(ua)) {
    result.os = 'macOS';
    result.osVersion = RegExp.$1.replace(/_/g, '.');
  } else if (/iPhone OS ([\d_]+)/i.test(ua) || /iPad.*OS ([\d_]+)/i.test(ua)) {
    result.os = 'iOS';
    result.osVersion = RegExp.$1.replace(/_/g, '.');
  } else if (/Android ([\d.]+)/i.test(ua)) {
    result.os = 'Android';
    result.osVersion = RegExp.$1;
  } else if (/Linux/i.test(ua)) {
    result.os = 'Linux';
  } else if (/CrOS/i.test(ua)) {
    result.os = 'Chrome OS';
  }

  // Browser (order matters)
  if (/EdgA?\/([\d.]+)/i.test(ua)) { result.browser = 'Edge'; result.browserVersion = RegExp.$1; }
  else if (/OPR\/([\d.]+)/i.test(ua) || /Opera\/([\d.]+)/i.test(ua)) { result.browser = 'Opera'; result.browserVersion = RegExp.$1; }
  else if (/Vivaldi\/([\d.]+)/i.test(ua)) { result.browser = 'Vivaldi'; result.browserVersion = RegExp.$1; }
  else if (/Brave/i.test(ua)) { result.browser = 'Brave'; const m = ua.match(/Chrome\/([\d.]+)/); result.browserVersion = m ? m[1] : ''; }
  else if (/YaBrowser\/([\d.]+)/i.test(ua)) { result.browser = 'Yandex'; result.browserVersion = RegExp.$1; }
  else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) { result.browser = 'Samsung Internet'; result.browserVersion = RegExp.$1; }
  else if (/UCBrowser\/([\d.]+)/i.test(ua)) { result.browser = 'UC Browser'; result.browserVersion = RegExp.$1; }
  else if (/QQBrowser\/([\d.]+)/i.test(ua)) { result.browser = 'QQ 浏览器'; result.browserVersion = RegExp.$1; }
  else if (/MicroMessenger\/([\d.]+)/i.test(ua)) { result.browser = '微信内置浏览器'; result.browserVersion = RegExp.$1; }
  else if (/Firefox\/([\d.]+)/i.test(ua)) { result.browser = 'Firefox'; result.browserVersion = RegExp.$1; }
  else if (/FxiOS\/([\d.]+)/i.test(ua)) { result.browser = 'Firefox (iOS)'; result.browserVersion = RegExp.$1; }
  else if (/CriOS\/([\d.]+)/i.test(ua)) { result.browser = 'Chrome (iOS)'; result.browserVersion = RegExp.$1; }
  else if (/Chrome\/([\d.]+)/i.test(ua)) { result.browser = 'Chrome'; result.browserVersion = RegExp.$1; }
  else if (/Safari\/([\d.]+)/i.test(ua) && /Version\/([\d.]+)/i.test(ua)) { result.browser = 'Safari'; result.browserVersion = ua.match(/Version\/([\d.]+)/)[1]; }

  // Engine
  if (/AppleWebKit\/([\d.]+)/i.test(ua)) { result.engine = 'WebKit'; result.engineVersion = RegExp.$1; }
  else if (/Gecko\/([\d.]+)/i.test(ua)) { result.engine = 'Gecko'; result.engineVersion = RegExp.$1; }
  else if (/Trident\/([\d.]+)/i.test(ua)) { result.engine = 'Trident'; result.engineVersion = RegExp.$1; }

  return result;
}

function renderStats(r, statsEl, detailEl) {
  statsEl.innerHTML = [
    stat('浏览器', r.browser || '未知', r.browserVersion),
    stat('操作系统', r.os || '未知', r.osVersion),
    stat('设备类型', r.bot ? '爬虫' : r.deviceType),
  ].join('');
  statsEl.hidden = false;

  if (detailEl) {
    detailEl.innerHTML = [
      row('引擎', r.engine ? `${r.engine} ${r.engineVersion}` : ''),
      row('机器人', r.bot ? '是' : ''),
    ].filter(Boolean).join('');
  }
}

/* ======== 当前 UA ======== */
const currentUA = navigator.userAgent;
myUaEl.textContent = currentUA;
myUaEl.dataset.copyVal = currentUA;
renderStats(parseUA(currentUA), myStatsEl, null);

/* ======== 手动解析 ======== */
on($('[data-action="parse"]'), 'click', () => {
  const ua = inputEl.value.trim();
  if (!ua) { showToast('请输入 User-Agent', { type: 'warn' }); return; }
  renderStats(parseUA(ua), resultStats, resultDetail);
});

on($('[data-action="clear"]'), 'click', () => {
  inputEl.value = '';
  resultStats.hidden = true;
  resultStats.innerHTML = '';
  resultDetail.innerHTML = '';
});

/* ======== 示例 UA ======== */
const EXAMPLES = [
  { label: 'Chrome (Windows)', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' },
  { label: 'Safari (macOS)', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15' },
  { label: 'Firefox (Linux)', ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0' },
  { label: 'Chrome (Android)', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.52 Mobile Safari/537.36' },
  { label: 'Safari (iPhone)', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' },
  { label: 'Edge', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0' },
  { label: '微信内置', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A.240205.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.47.2560' },
  { label: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
];

examplesEl.innerHTML = EXAMPLES.map((e, i) =>
  `<div class="ex-item" data-example="${i}"><div class="ex-label">${escapeHtml(e.label)}</div><div class="ex-ua">${escapeHtml(e.ua)}</div></div>`
).join('');

on(examplesEl, 'click', (e) => {
  const card = e.target.closest('[data-example]');
  if (!card) return;
  const ex = EXAMPLES[parseInt(card.dataset.example, 10)];
  inputEl.value = ex.ua;
  renderStats(parseUA(ex.ua), resultStats, resultDetail);
});

