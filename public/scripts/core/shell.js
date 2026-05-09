// 注入统一的 header / footer。所有页面共用，避免每页维护一份。
import { on, throttle } from '../utils/dom.js';
import { getTheme, toggleTheme } from './theme.js';

export function mountShell({ basePath = './', page = 'home' } = {}) {
  // Header
  if (!document.querySelector('.site-header')) {
    const header = document.createElement('header');
    header.className = 'site-header';
    const activeClass = (p) => page === p ? ' is-active' : '';
    header.innerHTML = `
      <div class="container">
        <div class="nav">
          <div class="nav-left">
            <nav class="nav-links" aria-label="主导航">
              <a class="nav-link${activeClass('home')}" href="${basePath}index.html">在线工具</a>
              <a class="nav-link" href="https://jqnav.top" target="_blank" rel="noopener">设计导航</a>
            </nav>
          </div>
          <div class="nav-right">
            ${page !== 'home' ? `<a class="nav-icon-btn" href="${basePath}index.html" title="返回首页" aria-label="返回首页"><i data-lucide="home"></i></a>` : ''}
            <button class="nav-icon-btn" type="button" data-theme-toggle aria-label="切换主题"><i data-lucide="${getTheme() === 'dark' ? 'sun' : 'moon'}"></i></button>
          </div>
        </div>
      </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    const onScroll = throttle(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }, 100);
    on(window, 'scroll', onScroll, { passive: true });
    onScroll();

    // 主题切换
    const themeToggle = header.querySelector('[data-theme-toggle]');
    if (themeToggle) {
      on(themeToggle, 'click', () => {
        toggleTheme();
        const icon = themeToggle.querySelector('i, svg');
        if (icon) {
          const newI = document.createElement('i');
          newI.dataset.lucide = getTheme() === 'dark' ? 'sun' : 'moon';
          icon.replaceWith(newI);
          if (window.refreshIcons) window.refreshIcons(themeToggle);
        }
      });
    }
  }

  // Footer
  if (!document.querySelector('.site-footer')) {
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-row">
          <div>
            <span>© ${new Date().getFullYear()} Jacket</span>
            &nbsp;|&nbsp;
            <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener">粤ICP备2024225759号</a>
            &nbsp;|&nbsp;
            <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank" rel="noopener">粤公网备44030002003173号</a>
          </div>
          <div class="u-row">
            <a href="${basePath}about.html">关于</a>
            <a href="mailto:jieqi.yellow@gmail.com">反馈</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  }
}
