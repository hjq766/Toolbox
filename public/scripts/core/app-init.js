// 统一入口：单例初始化。所有页面都只引这一个脚本。
import { initTheme } from './theme.js';
import { initPerfMode } from './perf-mode.js';
import { mountShell } from './shell.js';
import { mountDock } from '../components/dock.js';
import { mountBackTop } from '../components/back-top.js';
import { initCopyDelegation } from '../utils/clipboard.js';
import '../components/toast.js';

(function purgeLegacyServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        if (!regs || regs.length === 0) return;
        let didUnregister = false;
        regs.forEach((r) => { r.unregister(); didUnregister = true; });
        if (didUnregister && 'caches' in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
        }
        // 首次清理后自动 reload 一次，确保立即看到新内容
        if (didUnregister && !sessionStorage.getItem('__sw_purged__')) {
          sessionStorage.setItem('__sw_purged__', '1');
          setTimeout(() => location.reload(), 50);
        }
      }).catch(() => {});
    }
  } catch {}
})();

// 嵌入模式检测：被父页 iframe 嵌入时标记并做降级
const isEmbedded = (() => { try { return window.self !== window.top; } catch { return true; } })();
if (isEmbedded) document.documentElement.classList.add('is-embedded');

// 尽早应用主题 / 性能模式，降低 FOUC
initTheme();
initPerfMode();

// 网站统计 - 模块顶层立即执行，不等待 DOMContentLoaded
if (!isEmbedded) {
  // 百度统计
  window._hmt = window._hmt || [];
  (function() {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?d07c3a564a178264d3c3326f1509bc98";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  })();
  // 51.la
  (function() {
    var la = document.createElement('script');
    la.charset = 'UTF-8';
    la.id = 'LA_COLLECT';
    la.src = '//sdk.51.la/js-sdk-pro.min.js';
    la.onload = function() { if (window.LA) LA.init({ id: '3PqV31tIx1xTAuun', ck: '3PqV31tIx1xTAuun' }); };
    document.head.appendChild(la);
  })();
}

function start() {
  const body = document.body;
  const page = body.dataset.page || 'home';
  const basePath = body.dataset.basePath || './';
  body.classList.toggle('is-embedded', isEmbedded);

  // favicon
  if (!document.querySelector('link[rel="icon"]')) {
    const link = document.createElement('link');
    link.rel = 'icon'; link.type = 'image/webp';
    link.href = `${basePath}public/favicon.webp`;
    document.head.appendChild(link);
  }

  // 嵌入模式下默认不再挂载站点 shell / dock，避免外壳重复
  const wantShell = body.dataset.shell !== 'none' && !isEmbedded;
  const wantDock  = body.dataset.dock  !== 'none' && !isEmbedded;

  if (wantShell) mountShell({ page, basePath });
  if (wantDock)  mountDock();
  if (!isEmbedded) mountBackTop();
}

/* ---------- Range 滑块轨道填充色 ---------- */
function syncRangeFill(el) {
  const min = parseFloat(el.min) || 0;
  const max = parseFloat(el.max) || 100;
  const val = parseFloat(el.value) || 0;
  el.style.setProperty('--range-pct', ((val - min) / (max - min) * 100) + '%');
}
function initRangeSliders() {
  document.querySelectorAll('input[type="range"]').forEach(syncRangeFill);
  document.addEventListener('input', e => {
    if (e.target.matches('input[type="range"]')) syncRangeFill(e.target);
  });
}

/* ---------- Lucide 图标初始化 ---------- */
function loadLucide() {
  const basePath = document.body?.dataset.basePath || './';
  return new Promise((resolve) => {
    if (window.lucide) { resolve(); return; }
    const s = document.createElement('script');
    s.src = `${basePath}public/vendor/lucide.js`;
    s.onload = resolve;
    s.onerror = resolve; // 降级：图标不显示但不阻塞
    document.head.appendChild(s);
  });
}
function refreshIcons(root) {
  if (window.lucide) window.lucide.createIcons({ root: root || document });
}
window.refreshIcons = refreshIcons;

/* ---------- 版本强刷（部署新版后自动刷新） ---------- */
async function checkVersion() {
  try {
    const basePath = document.body?.dataset.basePath || './';
    const res = await fetch(`${basePath}version.json?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const { v } = await res.json();
    const key = '__app_ver__';
    const stored = localStorage.getItem(key);
    if (stored && stored !== v) {
      localStorage.setItem(key, v);
      location.reload();                 // 版本不一致 → 强刷
      return true;                       // 标记已刷新
    }
    localStorage.setItem(key, v);
  } catch {}
  return false;
}

async function boot() {
  if (await checkVersion()) return;      // 若触发了强刷，后续不执行
  start();
  initCopyDelegation();
  initRangeSliders();
  await loadLucide();
  refreshIcons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
