// 返回顶部按钮
// 支持三种滚动容器：
//   1. 首页欢迎页 .ws-welcome
//   2. 首页 iframe 工具页 .ws-frame (contentWindow)
//   3. 独立工具页 window

export function mountBackTop() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-top';
  btn.setAttribute('aria-label', '返回顶部');
  btn.innerHTML = '<i data-lucide="chevron-up"></i>';
  document.body.appendChild(btn);

  const welcomeEl = document.querySelector('.ws-welcome');
  const frameEl = document.querySelector('.ws-frame');
  const THRESHOLD = 300;
  let ticking = false;

  // 获取当前活跃的滚动目标
  function getActiveScroller() {
    if (frameEl && frameEl.classList.contains('is-active')) {
      try { return frameEl.contentWindow; } catch { return null; }
    }
    if (welcomeEl && !welcomeEl.classList.contains('is-hidden')) return welcomeEl;
    return window;
  }

  function getScrollTop() {
    const s = getActiveScroller();
    if (!s) return 0;
    return s === welcomeEl ? s.scrollTop : (s.scrollY ?? s.pageYOffset ?? 0);
  }

  function update() {
    btn.classList.toggle('is-visible', getScrollTop() > THRESHOLD);
    ticking = false;
  }

  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  // 绑定所有可能的滚动源
  if (welcomeEl) welcomeEl.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // iframe 每次加载新工具时重新绑定其 scroll
  if (frameEl) {
    frameEl.addEventListener('load', () => {
      try { frameEl.contentWindow.addEventListener('scroll', onScroll, { passive: true }); } catch {}
      update();
    });
  }

  btn.addEventListener('click', () => {
    const s = getActiveScroller();
    if (s) s.scrollTo({ top: 0, behavior: 'smooth' });
  });

  update();
  if (window.refreshIcons) window.refreshIcons(btn);
}
