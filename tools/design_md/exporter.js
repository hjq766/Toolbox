/**
 * exporter.js — DESIGN.md 导出模块
 * 纯函数，不依赖全局状态，通过参数接收 tokens / contentHTML
 * genHTML 内联页面实际依赖的样式，保证导出文件可独立查看
 */
import { resolveRef, safeCssValue } from '../_shared/token-utils.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';

/* ── 预加载导出依赖样式（页面初始化时执行一次） ── */
const EXPORT_STYLES = [
  ['公共基础样式', '../../public/styles/base.css'],
  ['公共布局样式', '../../public/styles/layout.css'],
  ['公共组件样式', '../../public/styles/components.css'],
  ['公共布局工具类', '../../public/styles/utilities.css'],
  ['颜色示例共享样式', '../_shared/color-examples.css'],
  ['DESIGN.md 可视化样式', './tool.css'],
];

const exportStylesPromise = Promise.all(EXPORT_STYLES.map(async ([label, url]) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    return `/* ── ${label} ── */\n${await response.text()}`;
  } catch {
    return `/* ${label}加载失败：${url} */`;
  }
}));

function safeName(value) {
  return String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '-');
}

function safeValue(value, root) {
  return safeCssValue(root ? resolveRef(String(value ?? ''), root) : value);
}

/* ── 生成 CSS 变量 ── */
function genCSS(tk) {
  if (!tk) return '/* 无数据 */';
  let s = ':root {\n';
  if (tk.colors) for (const [n, v] of Object.entries(tk.colors))
    s += `  --color-${safeName(n)}: ${safeValue(v, tk)};\n`;
  if (tk.typography) for (const [n, p] of Object.entries(tk.typography)) {
    if (typeof p !== 'object') continue;
    if (p.fontFamily) s += `  --font-${safeName(n)}: ${safeValue(p.fontFamily, tk)};\n`;
    if (p.fontSize)   s += `  --text-${safeName(n)}: ${safeValue(p.fontSize, tk)};\n`;
    if (p.fontWeight) s += `  --weight-${safeName(n)}: ${safeValue(p.fontWeight, tk)};\n`;
    if (p.lineHeight) s += `  --leading-${safeName(n)}: ${safeValue(p.lineHeight, tk)};\n`;
  }
  if (tk.rounded) for (const [n, v] of Object.entries(tk.rounded))
    s += `  --radius-${safeName(n)}: ${safeValue(v, tk)};\n`;
  if (tk.spacing) for (const [n, v] of Object.entries(tk.spacing))
    s += `  --spacing-${safeName(n)}: ${safeValue(v, tk)};\n`;
  return s + '}\n';
}

/* ── 生成 Tailwind v4 @theme ── */
function genTailwind(tk) {
  if (!tk) return '/* 无数据 */';
  let s = '@theme {\n';
  if (tk.colors) for (const [n, v] of Object.entries(tk.colors))
    s += `  --color-${safeName(n)}: ${safeValue(v, tk)};\n`;
  if (tk.typography) for (const [n, p] of Object.entries(tk.typography)) {
    if (typeof p !== 'object') continue;
    if (p.fontFamily) s += `  --font-${safeName(n)}: ${safeValue(p.fontFamily, tk)};\n`;
    if (p.fontSize)   s += `  --text-${safeName(n)}: ${safeValue(p.fontSize, tk)};\n`;
  }
  if (tk.rounded) for (const [n, v] of Object.entries(tk.rounded))
    s += `  --radius-${safeName(n)}: ${safeValue(v, tk)};\n`;
  if (tk.spacing) for (const [n, v] of Object.entries(tk.spacing))
    s += `  --spacing-${safeName(n)}: ${safeValue(v, tk)};\n`;
  return s + '}\n';
}

/**
 * 读取当前页面所有 CSS 自定义属性的实际值
 * 这样导出 HTML 能完整继承 tokens.css / themes.css 定义的设计变量
 */
function dumpSystemVars() {
  const computed = getComputedStyle(document.documentElement);
  const seen = new Set();
  let vars = '';
  try {
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = [...sheet.cssRules]; } catch { continue; }
      for (const rule of rules) {
        if (!(rule instanceof CSSStyleRule) && !(rule.type === 1)) continue;
        const sel = rule.selectorText || '';
        if (sel !== ':root' && sel !== 'html') continue;
        for (const prop of rule.style) {
          if (!prop.startsWith('--') || seen.has(prop)) continue;
          seen.add(prop);
          const val = computed.getPropertyValue(prop).trim();
          if (val) vars += `  ${prop}: ${val};\n`;
        }
      }
    }
  } catch (_) {}
  return vars ? `:root {\n${vars}}\n` : '';
}

/**
 * 生成独立 HTML 文档
 * @param {object} tk          - 解析出的 tokens
 * @param {string} contentHTML - 当前预览区 innerHTML
 * @returns {Promise<string>}
 */
async function genHTML(tk, contentHTML) {
  if (!tk || !contentHTML.trim()) return '<!-- 无预览内容，请先载入 DESIGN.md -->';

  const exportStyles = (await exportStylesPromise).join('\n\n');
  const systemVars = dumpSystemVars();
  const title      = tk.name || 'Design System';

  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Design System</title>
<style>
/* ── 系统 CSS 变量（来自当前主题 tokens.css / themes.css）── */
${systemVars}

/* ── 设计系统 Token CSS 变量 ── */
${genCSS(tk)}

/* ── 独立文档所需布局、示例与工具样式 ── */
${exportStyles}

/* ── 导出独立重置 ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg-base, #f8f8fc);
  color: var(--fg-base, #1a1a2e);
  padding: 40px 24px;
  font-size: 14px;
}
.dm-export-wrap { max-width: 960px; margin: 0 auto; }
.dm-swatch-edit { display: none !important; }
.dm-swatch { cursor: default !important; }
</style>
</head>
<body>
<div class="dm-export-wrap">
${contentHTML}
</div>
</body>
</html>`;
}

/* ── 挂载到全局供 page.js 调用 ── */
window.Exporter = { genCSS, genTailwind, genHTML };
