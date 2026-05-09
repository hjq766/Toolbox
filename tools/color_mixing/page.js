// ── 0. 导入 ──────────────────────────────────────────────────
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';

// ── 1. 常量 / 工具函数 ──────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}
function rgbToHex(r,g,b) { return '#'+[r,g,b].map(x=>Math.round(x).toString(16).padStart(2,'0')).join('').toUpperCase(); }

// ── 2. DOM 引用 ─────────────────────────────────────────────
const pick1     = $('[data-picker="c1"]');
const pick2     = $('[data-picker="c2"]');
const text1     = $('[data-text="c1"]');
const text2     = $('[data-text="c2"]');
const w1        = $('[data-weight="c1"]');
const w2        = $('[data-weight="c2"]');
const wv1       = $('[data-weight-val="c1"]');
const wv2       = $('[data-weight-val="c2"]');
const gradType  = $('[data-grad-type]');
const gradAngle = $('[data-grad-angle]');
const angleVal  = $('[data-angle-val]');

// ── 3. 业务逻辑 ─────────────────────────────────────────────
function mixColors() {
  const c1 = hexToRgb(pick1.value);
  const c2 = hexToRgb(pick2.value);
  const p1 = +w1.value / 100, p2 = +w2.value / 100;
  return rgbToHex(c1[0]*p1+c2[0]*p2, c1[1]*p1+c2[1]*p2, c1[2]*p1+c2[2]*p2);
}

function gradientCSS() {
  const c1 = pick1.value, c2 = pick2.value, m = mixColors();
  return gradType.value === 'linear'
    ? `linear-gradient(${gradAngle.value}deg, ${c1}, ${m}, ${c2})`
    : `radial-gradient(circle, ${c1}, ${m}, ${c2})`;
}

function setBlock(key, hex) {
  const block = $(`[data-preview="${key}"]`);
  block.style.background = hex;
  block.dataset.copy = hex;
  $(`[data-hex="${key}"]`).textContent = hex.toUpperCase();
  const [r,g,b] = hexToRgb(hex);
  $(`[data-rgb="${key}"]`).textContent = `rgb(${r}, ${g}, ${b})`;
}

function updateAll() {
  setBlock('c1', pick1.value);
  setBlock('c2', pick2.value);
  setBlock('mix', mixColors());
  const css = gradientCSS();
  $('[data-gradient]').style.background = css;
  $('[data-gradient-code]').value = `background: ${css};`;
}

// ── 4. 事件绑定 + 初始化 ────────────────────────────────────
mountToolHeader();

on(pick1, 'input', () => { text1.value = pick1.value.toUpperCase(); updateAll(); });
on(pick2, 'input', () => { text2.value = pick2.value.toUpperCase(); updateAll(); });
on(text1, 'input', () => { try { const s = new Option().style; s.color = text1.value; if(s.color) { pick1.value = text1.value; updateAll(); } } catch{} });
on(text2, 'input', () => { try { const s = new Option().style; s.color = text2.value; if(s.color) { pick2.value = text2.value; updateAll(); } } catch{} });

on(w1, 'input', () => { wv1.textContent = w1.value+'%'; w2.value = 100-w1.value; wv2.textContent = w2.value+'%'; updateAll(); });
on(w2, 'input', () => { wv2.textContent = w2.value+'%'; w1.value = 100-w2.value; wv1.textContent = w1.value+'%'; updateAll(); });
on(gradType, 'change', updateAll);
on(gradAngle, 'input', () => { angleVal.textContent = gradAngle.value+'°'; updateAll(); });

on(document, 'click', e => {
  const b = e.target.closest('[data-copy]');
  if (b && b.dataset.copy) { copyText(b.dataset.copy); showToast('已复制 ' + b.dataset.copy); }
});
on($('[data-action="copy-gradient"]'), 'click', () => {
  copyText($('[data-gradient-code]').value); showToast('CSS 已复制');
});

updateAll();
