/* design_md/parser.js — DESIGN.md 解析器与对比度工具函数 */
import { hexToRgbArr } from '../../public/scripts/utils/color.js';
export { resolveRef } from '../_shared/token-utils.js';

/* ========== 解析 ========== */

export function stripCodeFence(text) {
  return text.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
}

export function extractFromProse(text) {
  const title = (text.match(/^#\s+(.+)$/m) || [])[1] || null;
  const colors = {};
  // `name` (#hex) or name (#hex)
  text.replace(/[`"']?([\w][\w-]*)[`"']?\s*\(#([0-9a-fA-F]{3,8})\)/g, (_, n, h) => { colors[n] = '#' + h; });
  // **name** `#hex` or name: `#hex`
  text.replace(/[*`'"](\w[\w-]*)[*`'"]:?\s+`#([0-9a-fA-F]{3,8})`/g, (_, n, h) => { colors[n] = colors[n] || '#' + h; });
  // standalone `#hex`
  text.replace(/`#([0-9a-fA-F]{6,8})`/g, (_, h) => {
    const v = '#' + h; if (!Object.values(colors).includes(v)) colors['#' + h.slice(0,6)] = v;
  });
  const spacing = {};
  text.replace(/`spacing-([\w]+)`\s*\(([\d.]+(?:rem|px))\)/g, (_, n, v) => { spacing[n] = v; });
  return { name: title, colors, spacing };
}

export function parse(text) {
  const clean = stripCodeFence(text);
  const m = clean.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (m) {
    try { return { mode: 'yaml', tokens: window.jsyaml.load(m[1]), md: m[2].trim() }; }
    catch (e) { return { error: e.message }; }
  }
  return { mode: 'prose', tokens: extractFromProse(clean), md: clean };
}

/* ========== WCAG 对比度 ========== */

function lum([r, g, b]) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function cr(a, b) {
  const la = lum(hexToRgbArr(a)), lb = lum(hexToRgbArr(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
