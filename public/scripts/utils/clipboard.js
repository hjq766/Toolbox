// 跨环境剪贴板复制
export async function copyText(text) {
  const str = String(text ?? '');
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch (_) { /* fallthrough */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

// 全局复制委托：任何带 [data-copy] / [data-copy-val] 的元素点击即复制并提示。
// 在 app-init 里挂一次即可，所有工具零成本拥有"点击复制"能力。
// 元素若带 data-no-copy-toast 则只复制不提示（交由工具自行提示）。
let _copyDelegationBound = false;
export function initCopyDelegation(root = document) {
  if (_copyDelegationBound) return;
  _copyDelegationBound = true;
  root.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-copy], [data-copy-val]');
    if (!el) return;
    const value = el.dataset.copy ?? el.dataset.copyVal;
    if (value == null || value === '') return;
    const ok = await copyText(value);
    if (el.hasAttribute('data-no-copy-toast')) return;
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: ok ? '已复制' : '复制失败', type: ok ? 'success' : 'error' },
    }));
  });
}
