// 主题管理：单例，防止重复绑定
const STORAGE_KEY = 'jqnest.theme';
let bound = false;

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}
export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  window.dispatchEvent(new CustomEvent('app:theme-change', { detail: { theme } }));
}
export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// 尽早初始化，避免闪烁（可由 HTML head 内联调用）
export function initTheme() {
  if (bound) return;
  bound = true;
  let saved;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));

  // 跨窗口/ iframe 同步（storage 事件在同源的其它 document 触发）
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue && e.newValue !== getTheme()) {
      document.documentElement.setAttribute('data-theme', e.newValue);
      window.dispatchEvent(new CustomEvent('app:theme-change', { detail: { theme: e.newValue } }));
    }
  });
}
