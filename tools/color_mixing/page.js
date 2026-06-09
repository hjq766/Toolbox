// ── 0. 导入 ──────────────────────────────────────────────────
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { hexToRgbArr, rgbToHex as _rgbToHex } from '../../public/scripts/utils/color.js';

// ── 1. 适配器（color_mixing 内部用数组格式和分离参数） ────────
const hexToRgb = hexToRgbArr;
const rgbToHex = (r, g, b) => _rgbToHex([r, g, b]);

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

on($('[data-action="copy-gradient"]'), 'click', () => {
  copyText($('[data-gradient-code]').value); showToast('CSS 已复制');
});

updateAll();
