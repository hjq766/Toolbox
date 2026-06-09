// 统一 toast 组件（事件驱动 + 直接 API 两用）
let stack;
function ensureStack() {
  if (stack) return stack;
  stack = document.createElement('div');
  stack.className = 'toast-stack';
  document.body.appendChild(stack);
  return stack;
}

export function showToast(message, { type = 'default', duration = 1800 } = {}) {
  const root = ensureStack();
  const el = document.createElement('div');
  el.className = 'toast' + (type !== 'default' ? ` is-${type}` : '');
  el.textContent = message;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// 事件桥：任意地方 dispatch 'app:toast' 都可触发
if (typeof window !== 'undefined') {
  window.addEventListener('app:toast', (e) => {
    const d = e.detail || {};
    showToast(d.message || '', { type: d.type, duration: d.duration });
  });
  window.$toast = showToast;
}
