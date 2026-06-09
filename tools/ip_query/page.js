import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, escapeHtml } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const inputEl  = $('[data-input]');
const resultEl = $('[data-result]');
const myIpEl   = $('[data-my-ip]');
let querySeq = 0;

function cell(label, value) {
  if (!value) return '';
  const v = escapeHtml(String(value));
  return `<div class="result-row"><span class="u-muted">${label}</span><span class="u-strong u-clickable" style="word-break:break-all" data-copy-val="${v}">${v}</span></div>`;
}

/* ======== 多接口兜底（按可用性排序，国内可达接口优先） ======== */
const PROVIDERS = [
  {
    // ip.sb — 对国内可达性较好
    url: ip => ip ? `https://api.ip.sb/geoip/${ip}` : 'https://api.ip.sb/geoip',
    norm: d => {
      if (!d.ip) throw new Error('failed');
      return { ip: d.ip, country: d.country, region: d.region, city: d.city, postal: d.postal,
        lat: d.latitude, lon: d.longitude, timezone: d.timezone,
        isp: d.isp, org: d.organization, asn: d.asn ? `AS${d.asn}` : '' };
    },
  },
  {
    // ipwho.is
    url: ip => ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/',
    norm: d => {
      if (!d.success) throw new Error(d.message || 'failed');
      return { ip: d.ip, country: d.country, region: d.region, city: d.city, postal: d.postal,
        lat: d.latitude, lon: d.longitude, timezone: d.timezone?.id,
        isp: d.connection?.isp, org: d.connection?.org,
        asn: d.connection?.asn ? `AS${d.connection.asn}` : '' };
    },
  },
  {
    // freeipapi.com
    url: ip => ip ? `https://freeipapi.com/api/json/${ip}` : 'https://freeipapi.com/api/json',
    norm: d => {
      if (d.ipVersion === 0) throw new Error('failed');
      return { ip: d.ipAddress, country: d.countryName, region: d.regionName, city: d.cityName,
        postal: d.zipCode, lat: d.latitude, lon: d.longitude, timezone: d.timeZone,
        isp: '', org: '', asn: '' };
    },
  },
  {
    // ipapi.co
    url: ip => ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/',
    norm: d => {
      if (d.error) throw new Error(d.reason || 'failed');
      return { ip: d.ip, country: d.country_name, region: d.region, city: d.city, postal: d.postal,
        lat: d.latitude, lon: d.longitude, timezone: d.timezone,
        isp: d.org, org: d.org, asn: d.asn };
    },
  },
  {
    // ipinfo.io
    url: ip => ip ? `https://ipinfo.io/${ip}/json` : 'https://ipinfo.io/json',
    norm: d => {
      if (d.error) throw new Error(d.error.message || 'failed');
      const [lat, lon] = (d.loc || ',').split(',').map(Number);
      const m = d.org?.match(/^(AS\d+)\s*(.*)/);
      return { ip: d.ip, country: d.country, region: d.region, city: d.city, postal: d.postal,
        lat: lat || null, lon: lon || null, timezone: d.timezone,
        isp: d.org, org: m?.[2] || d.org, asn: m?.[1] || '' };
    },
  },
];

function renderGrid(n) {
  const location = [n.country, n.region, n.city].filter(Boolean).join(' · ');
  return `<div class="u-row u-mb-3" style="align-items:baseline;flex-wrap:wrap;gap:var(--space-3)">
    <span class="u-mono u-strong u-clickable" style="font-size:var(--text-xl);font-weight:800" data-copy-val="${escapeHtml(n.ip)}">${escapeHtml(n.ip)}</span>
    <span class="u-muted">${escapeHtml(location)}</span>
  </div>
  ${[
    cell('国家', n.country),
    cell('省/州', n.region),
    cell('城市', n.city),
    cell('ISP', n.isp),
    cell('时区', n.timezone),
    cell('AS', n.asn),
    cell('组织', n.org),
    cell('坐标', n.lat != null && n.lon != null ? `${n.lat}, ${n.lon}` : ''),
    cell('邮编', n.postal),
  ].filter(Boolean).join('')}`;
}

/* ======== 查询 IP（空 ip = 自动检测当前） ======== */
async function queryIP(ip = '', isMyIp = false) {
  const target = isMyIp ? myIpEl : resultEl;
  const seq = ++querySeq;
  target.innerHTML = '<span class="u-muted">查询中…</span>';
  let lastErr;
  for (const p of PROVIDERS) {
    try {
      const resp = await fetch(p.url(ip));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (seq !== querySeq && !isMyIp) return;
      target.innerHTML = renderGrid(p.norm(data));
      return;
    } catch (e) { lastErr = e; }
  }
  if (seq === querySeq || isMyIp) {
    target.innerHTML = `<span style="color:var(--color-danger)">查询失败：${escapeHtml(lastErr?.message || '所有接口均不可用')}</span>`;
  }
}
queryIP('', true);

/* ======== 事件 ======== */
on($('[data-action="query"]'), 'click', () => {
  const ip = inputEl.value.trim();
  if (!ip) { showToast('请输入 IP 地址', { type: 'warn' }); return; }
  queryIP(ip);
});

on(inputEl, 'keydown', (e) => { if (e.key === 'Enter') $('[data-action="query"]').click(); });
