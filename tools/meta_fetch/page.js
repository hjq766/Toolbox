import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';

mountToolHeader();

const inputEl   = $('[data-input]');
const errorEl   = $('[data-error]');
const resultEl  = $('[data-result]');
const metaList  = $('[data-meta-list]');
const ogCard    = $('[data-og-card]');
const ogPreview = $('[data-og-preview]');

let allMetaText = '';

function row(label, value) {
  if (!value) return '';
  return `<div class="result-row"><span class="u-muted">${escapeHtml(label)}</span><span style="word-break:break-all">${escapeHtml(String(value))}</span></div>`;
}

/* ======== 多代理降级 ======== */
const PROXIES = [
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
];

async function fetchWithProxy(url) {
  let lastErr;
  for (const proxy of PROXIES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const resp = await fetch(proxy(url), { signal: ctrl.signal });
      clearTimeout(timer);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.text();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('所有代理均失败');
}

async function fetchMeta() {
  let url = inputEl.value.trim();
  if (!url) { showToast('请输入 URL', { type: 'warn' }); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  errorEl.hidden = true;
  resultEl.hidden = true;
  ogCard.hidden = true;
  metaList.innerHTML = '<span class="u-muted">抓取中…</span>';
  resultEl.hidden = false;

  try {
    const html = await fetchWithProxy(url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const meta = {};

    // title
    meta.title = doc.querySelector('title')?.textContent?.trim() || '';

    // meta tags
    doc.querySelectorAll('meta').forEach(el => {
      const name = el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('http-equiv');
      const content = el.getAttribute('content');
      if (name && content) meta[name] = content;
    });

    // canonical
    const canonical = doc.querySelector('link[rel="canonical"]');
    if (canonical) meta['canonical'] = canonical.getAttribute('href');

    // favicon
    const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (favicon) meta['favicon'] = favicon.getAttribute('href');

    renderMeta(meta, url);
  } catch (e) {
    errorEl.textContent = '抓取失败: ' + (e.name === 'AbortError' ? '请求超时，请稍后重试' : e.message);
    errorEl.hidden = false;
    metaList.innerHTML = '';
  }
}

function renderMeta(meta, url) {
  // 重要字段
  const important = [
    ['title', meta.title],
    ['description', meta.description],
    ['keywords', meta.keywords],
    ['og:title', meta['og:title']],
    ['og:description', meta['og:description']],
    ['og:image', meta['og:image']],
    ['og:url', meta['og:url']],
    ['og:type', meta['og:type']],
    ['og:site_name', meta['og:site_name']],
    ['twitter:card', meta['twitter:card']],
    ['twitter:title', meta['twitter:title']],
    ['twitter:description', meta['twitter:description']],
    ['twitter:image', meta['twitter:image']],
    ['canonical', meta.canonical],
    ['favicon', meta.favicon],
    ['author', meta.author],
    ['robots', meta.robots],
    ['viewport', meta.viewport],
    ['charset', meta['content-type'] || meta.charset],
  ];

  const rows = important.filter(([, v]) => v).map(([k, v]) => row(k, v)).join('');

  // 其他字段
  const shown = new Set(important.map(([k]) => k));
  const otherRows = Object.entries(meta)
    .filter(([k, v]) => v && !shown.has(k))
    .map(([k, v]) => row(k, v))
    .join('');

  metaList.innerHTML = rows + (otherRows ? `<h4 style="margin:var(--space-3) 0 var(--space-2);font-size:var(--text-sm);color:var(--fg-subtle)">其他标签</h4>${otherRows}` : '');

  // 复制文本
  allMetaText = important.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');

  // OG 卡片
  const ogTitle = meta['og:title'] || meta.title;
  const ogDesc = meta['og:description'] || meta.description;
  const ogImg = meta['og:image'];
  if (ogTitle) {
    ogCard.hidden = false;
    let imgHtml = '';
    if (ogImg) {
      const imgUrl = ogImg.startsWith('http') ? ogImg : new URL(ogImg, url).href;
      imgHtml = `<img src="${escapeHtml(imgUrl)}" alt="OG Image" style="width:100%;display:block" onerror="this.style.display='none'">`;
    }
    ogPreview.innerHTML = `${imgHtml}<div style="padding:var(--space-3)"><div class="u-strong" style="margin-bottom:var(--space-1)">${escapeHtml(ogTitle)}</div>${ogDesc ? `<div class="u-muted" style="font-size:var(--text-sm)">${escapeHtml(ogDesc)}</div>` : ''}<div class="u-muted" style="font-size:var(--text-xs);margin-top:var(--space-1)">${escapeHtml(url)}</div></div>`;
  }
}

/* ======== 事件 ======== */
on($('[data-action="fetch"]'), 'click', fetchMeta);
on(inputEl, 'keydown', (e) => { if (e.key === 'Enter') fetchMeta(); });

on($('[data-action="copy"]'), 'click', async () => {
  if (!allMetaText) return;
  const ok = await copyText(allMetaText);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
