// 低性能模式：用户手动切换或根据硬件启发自动开启
const KEY = 'jqnest.perf';

function detectAuto() {
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = /Mobi|Android/i.test(navigator.userAgent);
  return mem <= 2 || (mobile && cores <= 4);
}

export function getPerfMode() {
  return document.documentElement.getAttribute('data-performance') || 'normal';
}
export function setPerfMode(mode) {
  if (mode === 'normal') document.documentElement.removeAttribute('data-performance');
  else document.documentElement.setAttribute('data-performance', mode);
  try { localStorage.setItem(KEY, mode); } catch (_) {}
  window.dispatchEvent(new CustomEvent('app:perf-change', { detail: { mode } }));
}
export function togglePerfMode() {
  setPerfMode(getPerfMode() === 'low' ? 'normal' : 'low');
}
export function initPerfMode() {
  let saved;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  if (saved) setPerfMode(saved);
  else if (detectAuto()) setPerfMode('low');
}
