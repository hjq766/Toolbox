// 统一的页面/工具标题头。所有页面（首页 welcome、工具页、关于页）都调用它，
// 保证 DOM 结构、排版、间距完全一致；只有文字不同。
import { findTool, categoryName } from '../data/tools.js';
import { escapeHtml } from '../utils/dom.js';

/**
 * @param {Object} opts
 * @param {HTMLElement} [opts.container]  挂载节点；不传则默认 document.querySelector('[data-tool-header]')
 * @param {string}  [opts.slug]          若传入，自动从 TOOLS 读取 title/desc/eyebrow，并同步 <title>
 * @param {string}  [opts.title]         标题
 * @param {string}  [opts.desc]          描述
 * @param {string}  [opts.eyebrow]       右上角徽章文字（分类名等），空则不渲染
 * @param {boolean} [opts.back=false]    是否显示"← 返回"按钮（已移至顶栏，默认关闭）
 * @param {string}  [opts.backHref]      返回链接，默认 '../../index.html'
 * @returns {HTMLElement|null}
 */
export function mountPageHeader(opts = {}) {
  const mount = opts.container || document.querySelector('[data-tool-header]');
  if (!mount) return null;

  let { title, desc, eyebrow, back = false, backHref = '../../index.html', slug } = opts;

  if (slug) {
    const t = findTool(slug);
    if (t) {
      title   = title   || t.title;
      desc    = desc    || t.desc;
      eyebrow = eyebrow || categoryName(t.category);
      document.title = `${t.title} · jqnest 工具箱`;
    } else {
      console.warn('[page-header] unknown slug:', slug);
    }
  }

  const eyebrowHtml = eyebrow ? `<span class="badge">${escapeHtml(eyebrow)}</span>` : '';

  mount.classList.add('tool-header');

  if (back) {
    // 有返回按钮时保留 top 行
    mount.innerHTML = `
      <div class="tool-header-top">
        <a class="tool-back" href="${backHref}" aria-label="返回首页">
          <i data-lucide="chevron-left" style="width:16px;height:16px"></i>
          返回
        </a>${eyebrowHtml}
      </div>
      <h1>${escapeHtml(title || '')}</h1>
      ${desc ? `<p class="tool-subtitle">${escapeHtml(desc)}</p>` : ''}
    `;
  } else {
    // 无返回按钮：标题 + 标签同行，去掉 top 行空位
    mount.innerHTML = `
      <div class="tool-header-title">${escapeHtml(title || '')}${eyebrowHtml ? ` ${eyebrowHtml}` : ''}</div>
      ${desc ? `<p class="tool-subtitle">${escapeHtml(desc)}</p>` : ''}
    `;
  }

  // 嵌入模式下返回按钮改为让父窗口回首页
  if (back) {
    const isEmbedded = (() => { try { return window.self !== window.top; } catch { return true; } })();
    if (isEmbedded) {
      const backEl = mount.querySelector('.tool-back');
      backEl?.addEventListener('click', (e) => {
        e.preventDefault();
        try { window.top.location.hash = ''; window.top.focus?.(); } catch (err) { console.warn(err); }
      });
    }
  }
  return mount;
}
