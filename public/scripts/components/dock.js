// macOS 风格底部 Dock 快捷栏
// 默认只有一个 ＋ 按钮，用户可添加工具到 Dock 快速启动
import { readyTools, CATEGORIES } from '../data/tools.js';

const STORAGE_KEY = 'jqnest_dock_items';

/* ── 持久化 ── */
function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveItems(slugs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

/* ── 删除 puff 动画 ── */
function showPuff(x, y) {
  const el = document.createElement('div');
  el.textContent = '\ud83d\udca8';
  el.style.cssText = `position:fixed;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(1);font-size:48px;pointer-events:none;z-index:9999;opacity:1;transition:all .45s ease-out`;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = 'translate(-50%,-50%) scale(2.2)';
    el.style.opacity = '0';
  });
  setTimeout(() => el.remove(), 500);
}

/* ── 判断是否在首页 SPA 外壳中 ── */
function isInShell() {
  return !!document.querySelector('[data-tool-frame]');
}

/* ── 根据页面路径推算工具页基路径 ── */
function getToolHref(slug) {
  // 首页 SPA 模式：用 hash 路由
  if (isInShell()) return `#/tool/${encodeURIComponent(slug)}`;
  // 工具独立页：直链
  const base = document.body.dataset.basePath || './';
  return `${base}tools/${slug}/`;
}

/* ── 创建 Dock 项 ── */
let reorderSlug = null;

function createDockItem(tool) {
  const a = document.createElement('a');
  a.className = 'dock-item';
  a.href = getToolHref(tool.slug);
  a.dataset.slug = tool.slug;
  a.draggable = true;
  a.innerHTML = `<i data-lucide="${tool.icon}"></i><span class="dock-tip">${tool.title}</span>`;
  // SPA 模式下通过 hashchange 导航，不跳转页面
  if (isInShell()) {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = `#/tool/${encodeURIComponent(tool.slug)}`;
    });
  }
  // 拖拽排序
  a.addEventListener('dragstart', (e) => {
    reorderSlug = tool.slug;
    e.dataTransfer.setData('application/jqnest-dock-reorder', tool.slug);
    e.dataTransfer.effectAllowed = 'move';
    a.classList.add('is-reordering');
    requestAnimationFrame(() => a.style.opacity = '0.35');
  });
  a.addEventListener('dragend', (e) => {
    a.classList.remove('is-reordering');
    a.style.opacity = '';
    const slug = reorderSlug;
    reorderSlug = null;
    dockEl.querySelectorAll('.dock-item').forEach(el => {
      el.classList.remove('is-drag-before', 'is-drag-after');
    });
    // 拖到 dock 外面 → 删除
    if (slug && e.dataTransfer.dropEffect === 'none') {
      const rect = dockEl.getBoundingClientRect();
      const out = e.clientX < rect.left - 30 || e.clientX > rect.right + 30
               || e.clientY < rect.top - 30 || e.clientY > rect.bottom + 30;
      if (out) {
        // puff 动画
        showPuff(e.clientX, e.clientY);
        removeDockItem(slug);
        import('../components/toast.js').then(m => m.showToast(`已从 Dock 移除「${tool.title}」`));
      }
    }
  });
  a.addEventListener('dragover', (e) => {
    if (!reorderSlug || reorderSlug === tool.slug) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = a.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    const before = e.clientX < mid;
    a.classList.toggle('is-drag-before', before);
    a.classList.toggle('is-drag-after', !before);
  });
  a.addEventListener('dragleave', () => {
    a.classList.remove('is-drag-before', 'is-drag-after');
  });
  a.addEventListener('drop', (e) => {
    e.preventDefault();
    a.classList.remove('is-drag-before', 'is-drag-after');
    const from = e.dataTransfer.getData('application/jqnest-dock-reorder');
    if (!from || from === tool.slug) return;
    const items = loadItems();
    const fi = items.indexOf(from);
    const ti = items.indexOf(tool.slug);
    if (fi === -1 || ti === -1) return;
    items.splice(fi, 1);
    const rect = a.getBoundingClientRect();
    const insertBefore = e.clientX < rect.left + rect.width / 2;
    const newTi = items.indexOf(tool.slug);
    items.splice(insertBefore ? newTi : newTi + 1, 0, from);
    saveItems(items);
    renderDock();
  });

  return a;
}

/* ── 全局引用 ── */
let dockEl, pickerEl, overlayEl, listEl, searchInput, tabsEl;
let activeCat = 'all';

/* ── 渲染 Dock 内容 ── */
function renderDock() {
  if (!dockEl) return;
  const slugs = loadItems();
  const tools = readyTools();
  // 清除现有项（保留 sep 和 add 按钮）
  dockEl.querySelectorAll('.dock-item:not(.dock-add):not(.dock-fixed)').forEach(el => el.remove());
  dockEl.querySelectorAll('.dock-sep').forEach(el => el.remove());

  const addBtn = dockEl.querySelector('.dock-add');
  slugs.forEach(slug => {
    const t = tools.find(x => x.slug === slug);
    if (!t) return;
    dockEl.insertBefore(createDockItem(t), addBtn);
  });

  // 分隔线：有项时才显示
  if (slugs.length > 0) {
    const sep = document.createElement('div');
    sep.className = 'dock-sep';
    dockEl.insertBefore(sep, addBtn);
  }

  bindNeighborEffect();
  if (window.refreshIcons) window.refreshIcons(dockEl);
}

/* ── 添加/移除 ── */
function addDockItem(slug) {
  const items = loadItems();
  if (items.includes(slug)) return;
  if (items.length >= 12) return; // 上限
  items.push(slug);
  saveItems(items);
  renderDock();
  renderPickerList();
}

function removeDockItem(slug) {
  const items = loadItems().filter(s => s !== slug);
  saveItems(items);
  renderDock();
  if (pickerEl?.classList.contains('is-open')) renderPickerList();
}

/* ── 邻居放大效果 ── */
function bindNeighborEffect() {
  const items = dockEl.querySelectorAll('.dock-item');
  items.forEach((el, i) => {
    el.addEventListener('mouseenter', () => {
      items.forEach(x => x.classList.remove('is-neighbor'));
      if (i > 0) items[i - 1].classList.add('is-neighbor');
      if (i < items.length - 1) items[i + 1].classList.add('is-neighbor');
    });
    el.addEventListener('mouseleave', () => {
      if (i > 0) items[i - 1].classList.remove('is-neighbor');
      if (i < items.length - 1) items[i + 1].classList.remove('is-neighbor');
    });
  });
}

/* ── Picker 弹窗 ── */
function isMobile() { return window.matchMedia('(max-width: 860px)').matches || 'ontouchstart' in window; }
function isEmbedded() { try { return window.self !== window.top; } catch { return true; } }

function getSiteHomeHref() {
  return window.location.pathname.includes('/tools/') ? '../../index.html' : 'index.html';
}

function getSiteAssetHref(path) {
  return window.location.pathname.includes('/tools/') ? `../../${path}` : path;
}

function createSiteDockItem({ href, icon, image, title, external }) {
  const item = document.createElement('a');
  item.className = `dock-item${external ? ' dock-external' : ''}`;
  item.href = href;
  if (external) {
    item.target = '_blank';
    item.rel = 'noopener';
  }
  const media = image
    ? `<img class="dock-logo-img" src="${image}" alt="${title}">`
    : `<span class="iconify" data-icon="${icon}" data-inline="false"></span>`;
  item.innerHTML = `
    ${media}
    <span class="dock-tooltip">${title}</span>
  `;
  return item;
}

function mountSiteDock(target) {
  if (isEmbedded() || document.getElementById('dockContainer')) return;

  const container = document.createElement('div');
  container.className = 'dock-container';
  container.id = 'dockContainer';

  const dock = document.createElement('div');
  dock.className = 'dock';
  dock.append(
    createSiteDockItem({
      href: getSiteHomeHref(),
      image: getSiteAssetHref('public/favicon.webp'),
      title: '极趣工具箱',
    }),
    createSiteDockItem({
      href: 'https://jqnav.top',
      image: getSiteAssetHref('public/designer.svg'),
      title: '极趣导航',
      external: true,
    })
  );

  container.appendChild(dock);
  target.appendChild(container);
}

function openPicker() {
  overlayEl.classList.add('is-open');
  pickerEl.classList.add('is-open');
  searchInput.value = '';
  renderPickerList();
  // 移动端不自动聚焦，避免弹出软键盘把弹窗顶飞
  if (!isMobile()) requestAnimationFrame(() => searchInput.focus());
}

function closePicker() {
  overlayEl.classList.remove('is-open');
  pickerEl.classList.remove('is-open');
}

function renderTabs() {
  tabsEl.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'dock-picker-tab' + (activeCat === cat.id ? ' is-active' : '');
    btn.type = 'button';
    btn.textContent = cat.name;
    btn.addEventListener('click', () => {
      activeCat = cat.id;
      tabsEl.querySelectorAll('.dock-picker-tab').forEach(b => b.classList.toggle('is-active', b === btn));
      renderPickerList(searchInput.value);
    });
    tabsEl.appendChild(btn);
  });
}

function renderPickerList(filter = '') {
  const tools = readyTools();
  const added = new Set(loadItems());
  const q = filter.toLowerCase();
  listEl.innerHTML = '';

  const filtered = tools.filter(t => {
    const matchCat = activeCat === 'all' || t.category === activeCat;
    const matchQ = !q || t.title.toLowerCase().includes(q) || (t.tags || []).some(tag => tag.includes(q)) || t.desc.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const grid = document.createElement('div');
  grid.className = 'dock-picker-grid';

  filtered.forEach(t => {
    const isAdded = added.has(t.slug);
    const div = document.createElement('div');
    div.className = 'dock-picker-item' + (isAdded ? ' is-added' : '');
    div.innerHTML = `<i data-lucide="${t.icon}"></i><div><div class="pi-title">${t.title}${isAdded ? ' <span class="added-hint">(已添加)</span><span class="remove-hint">(点击移除)</span>' : ''}</div><div class="pi-desc">${t.desc}</div></div>`;
    div.addEventListener('click', () => isAdded ? removeDockItem(t.slug) : addDockItem(t.slug));
    grid.appendChild(div);
  });

  if (!filtered.length) {
    listEl.innerHTML = '<div class="dock-picker-empty">没有匹配的工具</div>';
  } else {
    listEl.appendChild(grid);
  }
  if (window.refreshIcons) window.refreshIcons(listEl);
}

/* ── 挂载 ── */
export function mountDock(target = document.body, options = {}) {
  if (options.variant === 'site') {
    mountSiteDock(target);
    return;
  }
  if (document.querySelector('[data-dock]')) return;

  // Dock 栏
  dockEl = document.createElement('div');
  dockEl.className = 'dock';
  dockEl.dataset.dock = '';

  const addBtn = document.createElement('div');
  addBtn.className = 'dock-item dock-add';
  addBtn.innerHTML = '<i data-lucide="plus"></i><span class="dock-tip">添加工具</span>';
  addBtn.addEventListener('click', () => openPicker());
  dockEl.appendChild(addBtn);

  const navLink = document.createElement('a');
  navLink.className = 'dock-item dock-fixed';
  navLink.href = 'https://jqnav.top';
  navLink.target = '_blank';
  navLink.rel = 'noopener';
  const base = document.body.dataset.basePath || './';
  navLink.innerHTML = `<img src="${base}public/designer.svg" alt="极趣导航"><span class="dock-tip">极趣导航</span>`;
  dockEl.appendChild(navLink);

  // Picker 遮罩 + 面板
  overlayEl = document.createElement('div');
  overlayEl.className = 'dock-picker-overlay';
  overlayEl.addEventListener('click', closePicker);

  pickerEl = document.createElement('div');
  pickerEl.className = 'dock-picker';
  pickerEl.innerHTML = `
    <div class="dock-picker-header">
      <input type="text" placeholder="搜索工具…" data-dock-search>
    </div>
    <div class="dock-picker-tabs" data-dock-tabs></div>
    <div class="dock-picker-list" data-dock-list></div>
    <div class="dock-picker-hint">💡 点击添加工具 · 已添加的工具悬停可移除 · 拖拽 Dock 图标可排序或拖出移除</div>
  `;
  searchInput = pickerEl.querySelector('[data-dock-search]');
  tabsEl = pickerEl.querySelector('[data-dock-tabs]');
  listEl = pickerEl.querySelector('[data-dock-list]');
  searchInput.addEventListener('input', () => renderPickerList(searchInput.value));
  renderTabs();

  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pickerEl.classList.contains('is-open')) closePicker();
  });

  target.appendChild(dockEl);
  target.appendChild(overlayEl);
  target.appendChild(pickerEl);

  // 拖拽放入 dock
  dockEl.addEventListener('dragover', e => {
    if (e.dataTransfer.types.includes('application/jqnest-tool')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  });
  dockEl.addEventListener('dragenter', e => {
    if (e.dataTransfer.types.includes('application/jqnest-tool')) {
      e.preventDefault();
      dockEl.classList.add('is-drop-hover');
    }
  });
  dockEl.addEventListener('dragleave', e => {
    if (!dockEl.contains(e.relatedTarget)) {
      dockEl.classList.remove('is-drop-hover');
    }
  });
  dockEl.addEventListener('drop', e => {
    e.preventDefault();
    dockEl.classList.remove('is-drop-hover', 'is-drop-ready');
    const slug = e.dataTransfer.getData('application/jqnest-tool');
    if (!slug) return;
    const items = loadItems();
    if (items.includes(slug)) {
      const t = readyTools().find(x => x.slug === slug);
      if (t) import('../components/toast.js').then(m => m.showToast(`「${t.title}」已在 Dock 中`, { type: 'info' }));
      return;
    }
    if (items.length >= 12) {
      import('../components/toast.js').then(m => m.showToast('Dock 最多放 12 个工具', { type: 'warn' }));
      return;
    }
    addDockItem(slug);
    const t = readyTools().find(x => x.slug === slug);
    if (t) import('../components/toast.js').then(m => m.showToast(`已将「${t.title}」添加到 Dock`));
  });

  renderDock();

  // 滚动隐藏：向下滚隐藏，向上滚显示
  let lastY = 0;
  let hoverNearBottom = false;
  const THRESHOLD = 8;
  const onScroll = (src) => {
    if (pickerEl?.classList.contains('is-open')) return;
    if (hoverNearBottom) return;               // 鼠标在底部时不隐藏
    const y = (src === window) ? window.scrollY
      : (src.scrollTop != null) ? src.scrollTop : 0;
    if (y - lastY > THRESHOLD) dockEl.classList.add('is-hidden');
    else if (lastY - y > THRESHOLD) dockEl.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', () => onScroll(window), { passive: true });

  // 鼠标靠近底部时显示 Dock（即使被滚动隐藏）
  const BOTTOM_ZONE = 48;
  window.addEventListener('mousemove', (e) => {
    const near = e.clientY >= window.innerHeight - BOTTOM_ZONE;
    hoverNearBottom = near;
    if (near) dockEl.classList.remove('is-hidden');
  }, { passive: true });

  // SPA 模式：监听 iframe / 欢迎页滚动
  const frameEl = document.querySelector('.ws-frame');
  const welcomeEl = document.querySelector('.ws-welcome');
  if (welcomeEl) welcomeEl.addEventListener('scroll', () => onScroll(welcomeEl), { passive: true });
  if (frameEl) {
    const bindFrame = () => {
      try {
        const cw = frameEl.contentWindow;
        lastY = 0;
        cw.addEventListener('scroll', () => onScroll({ scrollTop: cw.scrollY }), { passive: true });
        // iframe 内鼠标靠近底部时也唤出 Dock
        cw.addEventListener('mousemove', (e) => {
          const near = e.clientY >= cw.innerHeight - BOTTOM_ZONE;
          hoverNearBottom = near;
          if (near) dockEl.classList.remove('is-hidden');
        }, { passive: true });
      } catch {}
    };
    frameEl.addEventListener('load', bindFrame);
  }
}
