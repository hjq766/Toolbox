import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce, escapeHtml } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import { EXAMPLE } from './example-data.js';
import { parse, cr, resolveRef } from './parser.js';
import {
  renderOverviewSection,
  renderColorsSection,
  renderTypographySection,
  renderSpacingSection,
  renderComponentsSection,
  renderColorExamplesSection,
  renderGuideSection,
} from './render.js';
import {
  themeFromDesignTokens,
  applyColorExampleVars,
  bindColorExampleInteractions,
} from '../_shared/color-examples.js';

mountToolHeader();

/* ========== DOM ========== */
const sourceEl  = $('[data-source]');
const contentEl = $('[data-content]');
const brandEl   = $('[data-brand]');
const dropEl    = $('[data-drop]');
const fileInput = $('[data-file]');
const sidebar   = $('[data-sidebar]');

/* ── 颜色选择器（注入到 body，使用 class 而非 id） ── */
const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.className = 'dm-color-picker';
document.body.appendChild(colorPicker);

/* ========== 状态 ========== */
let tk = null;
let md = '';
let _pendingColorKey = null;

function setContentHTML(html) {
  contentEl.innerHTML = typeof DOMPurify !== 'undefined'
    ? DOMPurify.sanitize(html)
    : '<div class="dm-empty"><div class="dm-empty-title">安全组件加载失败，请刷新后重试</div></div>';
}

/* ========== Token 有效性判断 ========== */
function hasUsefulTokens(tokens) {
  if (!tokens) return false;
  /* 必须至少一个段落有实际 key，空对象不算有效 */
  return (
    Object.keys(tokens.colors     || {}).length > 0 ||
    Object.keys(tokens.typography || {}).length > 0 ||
    Object.keys(tokens.spacing    || {}).length > 0 ||
    Object.keys(tokens.components || {}).length > 0
  );
}

/* ========== 核心更新 ========== */
function update() {
  const text = sourceEl.value.trim();
  if (!text) { tk = null; md = ''; renderAll(); return; }
  const result = parse(text);
  if (result.error) {
    tk = null; md = '';
    showToast('YAML 解析错误: ' + result.error, { type: 'error' });
    renderAll();
    return;
  }
  tk = hasUsefulTokens(result.tokens) ? result.tokens : null;
  md = result.md;
  if (!tk && result.md) {
    tk = { _proseOnly: true, name: (result.md.match(/^#\s+(.+)$/m) || [])[1] || null };
  }
  renderAll();
}

function renderAll() {
  if (!tk) {
    setContentHTML(`<div class="dm-empty">
      <div class="dm-empty-icon">📐</div>
      <div class="dm-empty-title">导入 DESIGN.md 开始解析</div>
      <div class="dm-empty-hint">支持 Stitch 导出格式（YAML frontmatter + Markdown）</div>
    </div>`);
    brandEl.textContent = 'DESIGN.md';
    return;
  }
  if (tk._proseOnly) {
    brandEl.textContent = tk.name || '未识别格式';
    setContentHTML(`<div class="dm-empty dm-empty--compact">
      <div class="dm-empty-icon">⚠️</div>
      <div class="dm-empty-title">未识别到设计 Token</div>
      <div class="dm-empty-hint">文件内容已读取，但未找到 colors / typography 等结构化数据。<br>
      建议使用 YAML frontmatter 格式：在文件顶部加 <code class="dm-md-code">---</code> 包裹的 YAML 块。</div>
    </div>
    ${md ? `<div class="dm-doc-section">
      <div class="dm-doc-section-title">文档内容</div>
      <div class="dm-prose">${md}</div>
    </div>` : ''}`);
    return;
  }

  brandEl.textContent = tk.name || 'Design System';
  setContentHTML(
    renderOverviewSection(tk) +
    renderColorsSection(tk)   +
    renderTypographySection(tk) +
    renderSpacingSection(tk)  +
    renderComponentsSection(tk) +
    renderColorExamplesSection(tk) +
    renderGuideSection(tk, md)
  );

  mountColorExamples();

  /* 色板点击编辑 */
  contentEl.querySelectorAll('[data-color-key]').forEach(el => {
    on(el, 'click', () => {
      _pendingColorKey = el.dataset.colorKey;
      colorPicker.value = el.dataset.colorVal || '#000000';
      colorPicker.click();
    });
    on(el, 'contextmenu', async e => {
      e.preventDefault();
      const ok = await copyText(el.dataset.colorVal);
      showToast(ok ? `已复制 ${el.dataset.colorVal}` : '复制失败', { type: ok ? 'success' : 'error' });
    });
  });
}

function mountColorExamples() {
  if (!tk?.colors || tk._proseOnly) return;
  const root = contentEl.querySelector('[data-color-examples-root]');
  if (!root) return;
  const theme = themeFromDesignTokens(tk);
  applyColorExampleVars(root, theme);
  bindColorExampleInteractions(root);
  window.refreshIcons?.(root);
}

/* ========== 校验 ========== */
function lint() {
  if (!tk) { showToast('请先输入 DESIGN.md 内容', { type: 'warn' }); return; }
  const issues = [];
  if (!tk.name)       issues.push('⚠️ 缺少 name 字段');
  if (!tk.colors)     issues.push('⚠️ 缺少 colors 段');
  if (!tk.typography) issues.push('⚠️ 缺少 typography 段');
  if (tk.colors) {
    for (const [n, v] of Object.entries(tk.colors)) {
      if (typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)) {
        const best = Math.max(cr(v, '#ffffff'), cr(v, '#000000'));
        if (best < 3) issues.push(`⚠️ colors.${n} (${v}) 对比度过低 (${best.toFixed(1)}:1)`);
      }
    }
  }
  if (tk.components) {
    for (const [n, p] of Object.entries(tk.components)) {
      if (p?.backgroundColor && p?.textColor) {
        const bg = resolveRef(p.backgroundColor, tk);
        const fg = resolveRef(p.textColor, tk);
        if (/^#[0-9a-f]{3,8}$/i.test(bg) && /^#[0-9a-f]{3,8}$/i.test(fg)) {
          const r = cr(bg, fg);
          if (r < 4.5) issues.push(`⚠️ components.${n}: 文字/背景对比度 ${r.toFixed(1)}:1 不满足 WCAG AA`);
        }
      }
    }
  }
  showToast(issues.length ? `发现 ${issues.length} 个问题` : '校验通过', { type: issues.length ? 'warn' : 'success' });
  if (issues.length) {
    const el = document.createElement('div');
    el.className = 'dm-lint is-warn';
    el.innerHTML = issues.map(i => `<div class="dm-lint-item">${escapeHtml(i)}</div>`).join('');
    contentEl.prepend(el);
    setTimeout(() => el.remove(), 7000);
  }
}

/* ========== 颜色编辑回写 ========== */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

colorPicker.addEventListener('change', () => {
  if (!_pendingColorKey) return;
  const newHex = colorPicker.value;
  const key    = escapeRegExp(_pendingColorKey);
  const re     = new RegExp(`(\\b${key}:\\s*["'])#[0-9a-fA-F]{3,8}(["'])`, 'g');
  sourceEl.value = sourceEl.value.replace(re, `$1${newHex}$2`);
  _pendingColorKey = null;
  update();
});

/* ========== 工具栏事件 ========== */
$$('[data-action="toggle-sidebar"]').forEach(btn => on(btn, 'click', () => sidebar.classList.toggle('is-collapsed')));
on(sourceEl, 'input', debounce(update, 350));

on($('[data-action="example"]'), 'click', () => {
  sourceEl.value = EXAMPLE;
  update();
  showToast('已载入示例');
});

initUploadZone({
  dropEl,
  fileEl: fileInput,
  accept: '*',
  onFiles(files) {
    const f = files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { sourceEl.value = reader.result; update(); showToast('已导入 ' + f.name); };
    reader.readAsText(f);
  },
});

on($('[data-action="copy-source"]'), 'click', async () => {
  const ok = await copyText(sourceEl.value);
  showToast(ok ? '已复制源码' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', () => {
  if (!sourceEl.value.trim()) { showToast('暂无内容', { type: 'warn' }); return; }
  const blob = new Blob([sourceEl.value], { type: 'text/markdown' });
  downloadBlob(blob, (tk?.name || 'DESIGN').replace(/\s+/g, '-') + '.md');
  showToast('已下载 .md');
});

on($('[data-action="lint"]'), 'click', lint);

function exportAndCopy(gen, label) {
  if (!tk) { showToast('请先输入 DESIGN.md 内容', { type: 'warn' }); return; }
  copyText(gen(tk)).then(ok => showToast(ok ? `已复制 ${label}` : '复制失败', { type: ok ? 'success' : 'error' }));
}

on($('[data-action="export-css"]'),      'click', () => exportAndCopy(window.Exporter.genCSS, 'CSS 变量'));
on($('[data-action="export-tailwind"]'), 'click', () => exportAndCopy(window.Exporter.genTailwind, 'Tailwind 主题'));
on($('[data-action="export-html"]'),     'click', () => {
  if (!tk) { showToast('请先载入 DESIGN.md 内容', { type: 'warn' }); return; }
  window.Exporter.genHTML(tk, contentEl.innerHTML).then(html => {
    const blob = new Blob([html], { type: 'text/html' });
    const filename = ((tk?.name || 'design-system').toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '') || 'design-system') + '-preview.html';
    downloadBlob(blob, filename);
    showToast('已下载预览 HTML');
  });
});

/* ========== 初始化 ========== */
renderAll();
