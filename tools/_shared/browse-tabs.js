import { on } from '../../public/scripts/utils/dom.js';

/**
 * 浏览速查 Tab：统一 data-cat、标准 tab-btn 尺寸、单行横滑
 *
 * @param {Element|string} root  [data-tabs] 容器
 * @param {object} opts
 * @param {{ id: string|number, label: string }[] | (() => array)} opts.items
 * @param {() => string|number} opts.getActive
 * @param {(id: string) => void} opts.onSelect
 */
export function mountBrowseTabs(root, { items, getActive, onSelect }) {
  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return { render: () => {} };

  function list() {
    return typeof items === 'function' ? items() : items;
  }

  function applyShell() {
    el.classList.add('tabs', 'is-scroll');
    if (!el.getAttribute('role')) el.setAttribute('role', 'tablist');
  }

  function scrollTabIntoView(btn) {
    btn?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  }

  function render({ scrollActive = false } = {}) {
    const active = String(getActive());
    applyShell();
    el.innerHTML = list().map(({ id, label }) =>
      `<button class="tab-btn${String(id) === active ? ' is-active' : ''}" type="button" data-cat="${id}">${label}</button>`
    ).join('');
    if (scrollActive) scrollTabIntoView(el.querySelector('[data-cat].is-active'));
  }

  on(el, 'click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    const id = btn.dataset.cat;
    if (String(id) === String(getActive())) return;
    onSelect(id);
    render({ scrollActive: true });
  });

  render();
  return { render: (opts) => render({ scrollActive: !!opts?.scrollActive }) };
}
