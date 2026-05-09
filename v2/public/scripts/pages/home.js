// 工作台首页：侧边栏 + 右侧 iframe。Hash 路由：#/tool/<slug>
import { TOOLS, CATEGORIES, findTool, categoryName } from '../data/tools.js';
import { $, $$, on, debounce, escapeHtml } from '../utils/dom.js';
import { toggleTheme } from '../core/theme.js';
import { showToast } from '../components/toast.js';
import { mountPageHeader } from '../components/page-header.js';

/* 每次"父页面加载"都用同一个 nonce，确保 iframe 跟随父页的刷新生命周期：
 * - 硬刷新 / 普通刷新父页 → 新 nonce → iframe 强制拉新
 * - 在同一次会话内切换工具 → 同一 nonce → 命中 HTTP 缓存
 * 这样解决"Cmd+Shift+R 不会穿透到 JS 动态注入的 iframe src"的浏览器行为。 */
const FRAME_NONCE = (() => {
  try {
    const nav = performance.getEntriesByType?.('navigation')?.[0];
    // reload 型导航用时间戳，确保穿透 HTTP 缓存；其他类型用会话 ID 即可
    return nav?.type === 'reload' ? String(Date.now()) : String(performance.timeOrigin | 0);
  } catch {
    return String(Date.now());
  }
})();
const withNonce = (url) => url + (url.includes('?') ? '&' : '?') + '_v=' + FRAME_NONCE;

const els = {
  cats:     $('[data-tool-cats]'),
  search:   $('[data-tool-search]'),
  clear:    $('[data-clear-search]'),
  welcome:  $('[data-welcome]'),
  groups:   $('[data-welcome-groups]'),
  empty:    $('[data-empty]'),
  frame:    $('[data-tool-frame]'),
  crumb:    $('[data-crumb]'),
  back:     $('[data-action="back"]'),
  burger:   $('[data-burger]'),
  actions:  $('[data-actions]'),
  toggleTheme: $('[data-toggle-theme]'),
  hitokoto: $('[data-hitokoto]')
};

// 防御：若关键 DOM 节点缺失（通常是浏览器缓存了旧 index.html），显式报错并给出自愈提示
const REQUIRED = ['cats', 'welcome', 'groups', 'frame', 'crumb', 'actions'];
const missing = REQUIRED.filter(k => !els[k]);
if (missing.length) {
  const msg = `[home.js] 缺少关键 DOM 节点: ${missing.map(k => `data-${k.replace(/([A-Z])/g,'-$1').toLowerCase()}`).join(', ')}。\n\n很可能是浏览器缓存了旧版 index.html。请按 Cmd+Shift+R 强制刷新，或在 DevTools 的 Network 面板勾选 "Disable cache"。`;
  console.error(msg);
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;inset:16px;z-index:9999;padding:24px;background:#fff;border:2px solid #e23;color:#222;border-radius:12px;font:14px/1.6 ui-sans-serif,system-ui;white-space:pre-wrap;box-shadow:0 10px 40px rgba(0,0,0,.2)';
  banner.textContent = msg;
  document.body.appendChild(banner);
  throw new Error('home.js init aborted: missing DOM');
}

let currentCategory = 'all';
let keyword = '';
let activeSlug = null;

/* ---------- 顶部数量（已移除） ---------- */
function renderStats() {}

/* ---------- 侧边栏分类导航 ---------- */
function renderCats() {
  els.cats.innerHTML = CATEGORIES.map(c => {
    const count = c.id === 'all' ? TOOLS.length : TOOLS.filter(t => t.category === c.id).length;
    return `<button class="nav-item${c.id === currentCategory ? ' is-active' : ''}" data-cat="${c.id}" type="button">
      <span class="nav-icon" aria-hidden="true"><i data-lucide="${c.icon || ''}"></i></span>
      <span class="nav-name">${escapeHtml(c.name)}</span>
      <span class="nav-count">${count}</span>
    </button>`;
  }).join('');
  if (window.refreshIcons) window.refreshIcons(els.cats);
}

/* ---------- 右侧工具卡片：按分类分组 ---------- */
function filterTools() {
  const kw = keyword.trim().toLowerCase();
  return TOOLS.filter(t => {
    if (currentCategory !== 'all' && t.category !== currentCategory) return false;
    if (!kw) return true;
    return (t.title + t.desc + (t.tags || []).join(' ')).toLowerCase().includes(kw);
  });
}

function renderCard(t) {
  const planned = t.status !== 'ready';
  return `
    <a class="welcome-card${planned ? ' is-planned' : ''}"
       href="#/tool/${encodeURIComponent(t.slug)}"
       data-slug="${t.slug}"
       data-planned="${planned ? '1' : ''}"
       ${planned ? '' : 'draggable="true"'}
       title="${escapeHtml(t.desc)}">
      <div class="wc-head">
        <span class="wc-icon" aria-hidden="true"><i data-lucide="${t.icon || ''}"></i></span>
        <h4>${escapeHtml(t.title)}</h4>
      </div>
      <p>${escapeHtml(t.desc)}</p>
      ${planned ? '<span class="wc-tag">规划中</span>' : ''}
    </a>`;
}

function renderGroups() {
  const pool = filterTools();
  if (!pool.length) {
    els.empty?.classList.remove('is-hidden');
    els.groups.innerHTML = '';
    return;
  }
  els.empty?.classList.add('is-hidden');

  // 按分类分组，保持 CATEGORIES 顺序
  const groups = new Map();
  for (const t of pool) {
    if (!groups.has(t.category)) groups.set(t.category, []);
    groups.get(t.category).push(t);
  }
  const order = CATEGORIES.map(c => c.id).filter(id => id !== 'all');

  els.groups.innerHTML = order
    .filter(id => groups.has(id))
    .map(id => {
      const list = groups.get(id);
      const cat = CATEGORIES.find(c => c.id === id);
      return `
        <section class="welcome-group" data-group="${id}">
          <h3>${escapeHtml(cat.name)} <span class="group-count">· ${list.length} 个</span></h3>
          <div class="welcome-grid">${list.map(renderCard).join('')}</div>
        </section>`;
    }).join('');
  if (window.refreshIcons) window.refreshIcons(els.groups);
}

/* ---------- \u8def\u7531\uff1aopen \u5de5\u5177 ---------- */
function openTool(slug, { push = true } = {}) {
  const t = findTool(slug);
  if (!t) { goHome({ push }); return; }
  if (t.status !== 'ready') {
    showToast('\u8be5\u5de5\u5177\u6b63\u5728\u8fc1\u79fb\u4e2d\uff0c\u656c\u8bf7\u671f\u5f85', { type: 'warn' });
    return;
  }
  // 外部 / 第三方工具：仅卡片点击时打开（click handler 已处理），hash 恢复时回首页
  if (t.url) {
    goHome({ push });
    return;
  }
  activeSlug = slug;
  // \u66f4\u65b0 iframe\uff08\u4ec5\u5f53 src \u4e0d\u540c\u65f6\u91cd\u65b0\u52a0\u8f7d\uff09
  const url = `./tools/${encodeURIComponent(slug)}/index.html`;
  if (els.frame.dataset.slug !== slug) {
    els.frame.dataset.slug = slug;
    els.frame.src = withNonce(url);
  }
  els.frame.classList.add('is-active');
  els.welcome.classList.add('is-hidden');

  // \u9876\u680f
  els.crumb.innerHTML = `
    <span class="crumb-cat">${escapeHtml(categoryName(t.category))}</span>
    <span class="crumb-title">${escapeHtml(t.title)}</span>`;
  if (els.back) els.back.hidden = false;
  toggleActions(true, url);

  // 更新标题
  document.title = `${t.title} · jqnest 工具箱`;

  // URL 同步
  if (push) {
    const hash = `#/tool/${encodeURIComponent(slug)}`;
    if (location.hash !== hash) history.pushState({ slug }, '', hash);
  }
  // 移动端自动关闭抽屉
  document.body.classList.remove('ws-sidebar-open');
}

function goHome({ push = true } = {}) {
  activeSlug = null;
  els.frame.classList.remove('is-active');
  els.welcome.classList.remove('is-hidden');
  els.crumb.innerHTML = `
    <span class="crumb-cat">\u9996\u9875</span>
    <span class="crumb-title">\u9009\u62e9\u5de5\u5177\u5f00\u59cb\u4f7f\u7528</span>`;
  if (els.back) els.back.hidden = true;
  toggleActions(false);
  document.title = 'jqnest 工具箱 · 免费在线工具集合';
  renderGroups();
  if (push && location.hash) history.pushState({}, '', location.pathname + location.search);
}

function toggleActions(show, url) {
  const reload = els.actions.querySelector('[data-action="reload"]');
  const open   = els.actions.querySelector('[data-action="open"]');
  const home   = els.actions.querySelector('[data-action="home"]');
  reload.hidden = !show;
  open.hidden   = !show;
  home.hidden   = !show;
  if (url) open.setAttribute('href', url);
}

/* ---------- 站内页面（关于等） ---------- */
const PAGES = {
  about: { title: '关于', url: './about.html', desc: '关于本站与反馈渠道' }
};

function openPage(id, { push = true } = {}) {
  const p = PAGES[id];
  if (!p) { goHome({ push }); return; }
  activeSlug = `page:${id}`;
  if (els.frame.dataset.slug !== activeSlug) {
    els.frame.dataset.slug = activeSlug;
    els.frame.src = withNonce(p.url);
  }
  els.frame.classList.add('is-active');
  els.welcome.classList.add('is-hidden');
  els.crumb.innerHTML = `
    <span class="crumb-cat">站内</span>
    <span class="crumb-title">${escapeHtml(p.title)}</span>`;
  if (els.back) els.back.hidden = false;
  toggleActions(true, p.url);
  document.title = `${p.title} · jqnest 工具箱`;
  if (push) {
    const hash = `#/page/${encodeURIComponent(id)}`;
    if (location.hash !== hash) history.pushState({ page: id }, '', hash);
  }
  document.body.classList.remove('ws-sidebar-open');
}

function applyHash() {
  const tool = location.hash.match(/^#\/tool\/([^/?#]+)/);
  if (tool) { openTool(decodeURIComponent(tool[1]), { push: false }); return; }
  const page = location.hash.match(/^#\/page\/([^/?#]+)/);
  if (page) { openPage(decodeURIComponent(page[1]), { push: false }); return; }
  goHome({ push: false });
}

/* ---------- 事件绑定 ---------- */
on(els.cats, 'click', (e) => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  currentCategory = b.dataset.cat;
  renderCats();
  renderGroups();
  // 如果正在看 iframe，切分类时返回浏览页
  if (activeSlug) goHome();
  // 关闭移动抽屉
  document.body.classList.remove('ws-sidebar-open');
  // 滚回顶部
  els.welcome.scrollTop = 0;
});

on(els.groups, 'click', (e) => {
  const a = e.target.closest('[data-slug]'); if (!a) return;
  if (a.dataset.planned === '1') {
    e.preventDefault();
    showToast('该工具正在迁移中，敬请期待', { type: 'warn' });
    return;
  }
  const t = findTool(a.dataset.slug);
  if (t?.url) {
    e.preventDefault();
    window.open(t.url, '_blank');
  }
});

/* ---------- 拖拽卡片到 Dock ---------- */
on(els.groups, 'dragstart', (e) => {
  const card = e.target.closest('[data-slug]');
  if (!card || card.dataset.planned === '1') { e.preventDefault(); return; }
  e.dataTransfer.setData('application/jqnest-tool', card.dataset.slug);
  e.dataTransfer.effectAllowed = 'copy';
  card.classList.add('is-dragging');
  // 通知 dock 进入可接收状态
  document.querySelector('[data-dock]')?.classList.add('is-drop-ready');
});
on(els.groups, 'dragend', (e) => {
  const card = e.target.closest('[data-slug]');
  if (card) card.classList.remove('is-dragging');
  const dock = document.querySelector('[data-dock]');
  dock?.classList.remove('is-drop-ready', 'is-drop-hover');
});

on(els.search, 'input', debounce((e) => {
  keyword = e.target.value;
  els.clear.classList.toggle('is-hidden', !keyword);
  renderGroups();
}, 120));

on(els.clear, 'click', () => {
  els.search.value = ''; keyword = '';
  els.clear.classList.add('is-hidden');
  els.search.focus();
  renderGroups();
});

on(els.toggleTheme, 'click', toggleTheme);

on(els.burger, 'click', () => {
  document.body.classList.toggle('ws-sidebar-open');
});

// Topbar back
if (els.back) on(els.back, 'click', () => goHome());

// Topbar actions
on(els.actions, 'click', (e) => {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  const act = b.dataset.action;
  if (act === 'reload') {
    if (els.frame.src) els.frame.contentWindow?.location.reload();
  } else if (act === 'home') {
    goHome();
  }
});

// 点击空白关闭 sidebar
on(document, 'click', (e) => {
  if (!document.body.classList.contains('ws-sidebar-open')) return;
  if (e.target.closest('.ws-sidebar') || e.target.closest('[data-burger]')) return;
  document.body.classList.remove('ws-sidebar-open');
});

// hash 变化 + 浏览器前进/后退
window.addEventListener('hashchange', applyHash);
window.addEventListener('popstate', applyHash);

// 初始化
const readyCount = TOOLS.filter(t => t.status === 'ready').length;
mountPageHeader({
  container: $('[data-welcome-header]'),
  title: '全部工具',
  desc: '点击任意工具卡片，会直接在当前页面内打开；每个工具也都可以单独拉出去用。',
  eyebrow: `共 ${TOOLS.length} 个 · ${readyCount} 已上线`,
  back: false
});
renderStats();
renderCats();
renderGroups();
applyHash();

/* ---------- 一言 ---------- */
const HITOKOTO_FALLBACK = [
  { hitokoto: '代码千万行，注释第一行。', from: '程序员民谣' },
  { hitokoto: '用心做好每一个工具。', from: 'jqnest' },
  { hitokoto: '万物皆可工具化。', from: 'jqnest' },
  { hitokoto: '好的工具让创造更简单。', from: 'jqnest' },
  { hitokoto: '简洁是智慧的灵魂。', from: '莎士比亚' },
  { hitokoto: '技术为人所用，工具为人所造。', from: '佚名' },
  { hitokoto: '世上无难事，只要有工具。', from: 'jqnest' },
  { hitokoto: '凡事预则立，不预则废。', from: '礼记' },
];
let hitoCooldown = false;

function fetchHitokoto() {
  if (!els.hitokoto) return;
  fetch('https://v1.hitokoto.cn?max_length=24')
    .then(r => r.json())
    .then(d => {
      els.hitokoto.textContent = d.hitokoto;
      els.hitokoto.title = `—— ${d.from}\n点击换一句`;
    })
    .catch(() => {
      const d = HITOKOTO_FALLBACK[Math.random() * HITOKOTO_FALLBACK.length | 0];
      els.hitokoto.textContent = d.hitokoto;
      els.hitokoto.title = `—— ${d.from}\n点击换一句`;
    });
}

if (els.hitokoto) {
  fetchHitokoto();
  on(els.hitokoto, 'click', () => {
    if (hitoCooldown) return;
    hitoCooldown = true;
    fetchHitokoto();
    setTimeout(() => { hitoCooldown = false; }, 1000);
  });
}
