// 统一入口：单例初始化。所有页面都只引这一个脚本。
import { initTheme } from './theme.js';
import { initPerfMode } from './perf-mode.js';
import { mountShell } from './shell.js';
import { mountDock } from '../components/dock.js';
import { mountBackTop } from '../components/back-top.js';
import '../components/toast.js';

/* ---------------- 僵尸 Service Worker 清理 ----------------
 * v2 不再注册任何 Service Worker。但历史版本（v1）可能注册过，
 * 残留的 SW 会拦截所有请求并返回旧缓存，导致"无论怎么刷新都是旧页面"。
 * 这里在每次页面加载时：
 *   1) 注销所有已注册的 Service Worker
 *   2) 清空 Cache Storage 中的所有缓存
 * 执行完毕后老用户只需再刷一次即可拿到最新代码，之后彻底干净。
 * 新用户不受影响（没有 SW 时 getRegistrations 返回空）。
 * -------------------------------------------------------- */
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

/* ---------- 网站统计 ---------- */
function initAnalytics() {
  if (isEmbedded) return; // iframe 内不重复统计
  // 百度统计
  window._hmt = window._hmt || [];
  const hm = document.createElement('script');
  hm.src = 'https://hm.baidu.com/hm.js?d07c3a564a178264d3c3326f1509bc98';
  document.head.appendChild(hm);
  // 51.la
  const la = document.createElement('script');
  la.charset = 'UTF-8';
  la.id = 'LA_COLLECT';
  la.src = '//sdk.51.la/js-sdk-pro.min.js';
  la.onload = () => { if (window.LA) LA.init({ id: '3PqV31tIx1xTAuun', ck: '3PqV31tIx1xTAuun' }); };
  document.head.appendChild(la);
}

async function boot() {
  start();
  initRangeSliders();
  initAnalytics();
  await loadLucide();
  refreshIcons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
