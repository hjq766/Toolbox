/* design_md/render.js — 各 Section 渲染函数（纯函数，无 DOM 副作用） */
import { cr, resolveRef } from './parser.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';
import { renderColorExamplesHTML, themeFromDesignTokens } from '../_shared/color-examples.js';
import { safeCssValue } from '../_shared/token-utils.js';

/* ── 安全辅助 ── */

/* CSS 属性值轻量消毒：仅保留安全字符，防止 style 注入 */
function sanitizeCssVal(v) {
  return safeCssValue(v);
}

/* ── 内部辅助 ── */

function resolveRefs(s, tokens) {
  if (!tokens) return s;
  return s.replace(/\{([\w][\w.-]*)\}/g, (orig, path) => {
    const parts = path.split('.');
    let v = tokens;
    for (const p of parts) { if (v == null) return orig; v = v[p]; }
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && v?.fontSize) return String(v.fontSize);
    return orig;
  });
}

function simpleMd(s, tokens) {
  if (tokens) s = resolveRefs(s, tokens);

  /* Tables */
  s = s.replace(/\|(.+)\|\n\|[-|: ]+\|\n((?:\|.+\|\n?)*)/g, (_, header, rows) => {
    const th = header.split('|').filter(c => c.trim())
      .map(c => `<th>${c.trim()}</th>`).join('');
    const trs = rows.trim().split('\n').map(row => {
      const tds = row.split('|').filter(c => c.trim())
        .map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table class="dm-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
  });

  /* Headings */
  s = s.replace(/^### (.+)$/gm, '<h4 class="dm-md-h3">$1</h4>');
  s = s.replace(/^## (.+)$/gm,  '<h3 class="dm-md-h2">$1</h3>');
  s = s.replace(/^# (.+)$/gm,   '<h2 class="dm-md-h1">$1</h2>');

  /* Inline */
  s = s.replace(/`([^`]+)`/g, '<code class="dm-md-code">$1</code>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');

  /* Lists */
  s = s.replace(/^- (.+)$/gm, '<li>$1</li>');
  s = s.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul class="dm-md-ul">${m}</ul>`);

  /* Paragraphs */
  s = s.replace(/\n{2,}/g, '</p><p class="dm-md-p">');
  return `<p class="dm-md-p">${s}</p>`;
}

function groupColors(colors) {
  const groups = {};
  for (const [name, val] of Object.entries(colors)) {
    if (typeof val !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(val)) continue;
    const prefix = name.includes('-') ? name.split('-')[0] : '基础';
    (groups[prefix] = groups[prefix] || []).push([name, val]);
  }
  return groups;
}

function docSection(id, title, sub, body) {
  return `<section class="dm-doc-section" id="${id}">
    <div class="dm-doc-section-title">${title}</div>
    ${sub ? `<div class="dm-doc-section-sub">${sub}</div>` : ''}
    ${body}
  </section>`;
}

/* ── 公开渲染函数 ── */

export function renderOverviewSection(tk) {
  if (!tk) return '';
  const accent  = tk.colors?.primary || tk.colors?.accent || '#5B47E0';
  const initial = (tk.name || 'D').replace(/[^a-zA-Z0-9]/g,'').charAt(0).toUpperCase() || 'D';
  const stats   = [];
  if (tk.colors)     stats.push([`${Object.keys(tk.colors).length}`, '色彩']);
  if (tk.typography) stats.push([`${Object.keys(tk.typography).length}`, '字阶']);
  if (tk.spacing)    stats.push([`${Object.keys(tk.spacing).length}`, '间距']);
  if (tk.rounded)    stats.push([`${Object.keys(tk.rounded).length}`, '圆角']);
  if (tk.components) stats.push([`${Object.keys(tk.components).length}`, '组件']);
  const pills = stats.map(([n,l]) => `<span class="dm-stat-pill">${escapeHtml(n)} ${escapeHtml(l)}</span>`).join('');
  return `<div class="dm-overview-card" id="dm-overview">
    <div class="dm-overview-badge" style="background:${sanitizeCssVal(accent)}">${escapeHtml(initial)}</div>
    <div style="flex:1;min-width:0">
      <div><span class="dm-overview-name">${escapeHtml(tk.name||'未命名设计系统')}</span>${tk.version?`<span class="dm-overview-ver">v${escapeHtml(tk.version)}</span>`:''}</div>
      <div class="dm-overview-stats">${pills}</div>
      ${tk.description?`<div class="dm-overview-desc">${escapeHtml(tk.description)}</div>`:''}
    </div>
  </div>`;
}

export function renderColorsSection(tk) {
  if (!tk?.colors) return '';
  const groups = groupColors(tk.colors);
  let body = '';
  for (const [group, pairs] of Object.entries(groups)) {
    const swatches = pairs.map(([name, val]) => {
      const best = Math.max(cr(val,'#ffffff'), cr(val,'#000000'));
      const lbl = best>=7?'AAA':best>=4.5?'AA':best>=3?'A':'—';
      const badgeBg = lbl==='AAA'||lbl==='AA'?'#10B981':lbl==='A'?'#F59E0B':'rgba(0,0,0,.35)';
      const safeVal = sanitizeCssVal(val);
      return `<div class="dm-swatch" data-color-key="${escapeHtml(name)}" data-color-val="${escapeHtml(val)}" title="点击编辑 · 右键复制">
        <div class="dm-swatch-color" style="background:${safeVal}">
          <span class="dm-swatch-badge" style="background:${sanitizeCssVal(badgeBg)}">${lbl}</span>
          <div class="dm-swatch-edit">✏ 编辑</div>
        </div>
        <div class="dm-swatch-body">
          <div class="dm-swatch-name">${escapeHtml(name)}</div>
          <div class="dm-swatch-hex">${escapeHtml(val)}</div>
        </div>
      </div>`;
    }).join('');
    body += `<div class="dm-color-group"><div class="dm-color-group-title">${escapeHtml(group)}</div><div class="dm-colors-grid">${swatches}</div></div>`;
  }
  return docSection('dm-colors', '色彩系统', '点击色板编辑颜色值 · 右键复制 Hex', body);
}

export function renderTypographySection(tk) {
  if (!tk?.typography) return '';
  const items = Object.entries(tk.typography).map(([name, p]) => {
    if (typeof p !== 'object') return '';
    const fsRaw = p.fontSize || '1rem';
    const fsNum = parseFloat(fsRaw);
    const unit  = String(fsRaw).replace(/[\d.]/g,'');
    const fsCapped = unit==='px' ? `${Math.min(fsNum,48)}px` : `min(${fsRaw},3rem)`;
    const ls = p.letterSpacing?`;letter-spacing:${sanitizeCssVal(p.letterSpacing)}`:'';
    const tt = p.textTransform?`;text-transform:${sanitizeCssVal(p.textTransform)}`:'';
    const st = `font-family:${sanitizeCssVal(p.fontFamily||'inherit')};font-size:${sanitizeCssVal(fsCapped)};font-weight:${sanitizeCssVal(p.fontWeight||400)};line-height:${sanitizeCssVal(p.lineHeight||1.5)}${ls}${tt}`;
    const isCode  = name.includes('code')||name.includes('mono');
    const isSmall = name.includes('caption')||name.includes('button')||name.includes('nav')||name.includes('label');
    const sample  = isCode ? 'const x = (a, b) => a + b;' : isSmall ? 'Button · Label · Caption Aa' : '清风徐来 · Aa Bb Cc 123';
    const specs   = [p.fontSize, p.fontWeight?`/ ${p.fontWeight}`:'', p.lineHeight?`/ lh ${p.lineHeight}`:'', p.letterSpacing?`/ ls ${p.letterSpacing}`:''].filter(Boolean).map(escapeHtml).join(' ');
    const fontNameDisplay = p.fontFamily ? escapeHtml(p.fontFamily.split(',')[0].replace(/['"]/g,'').trim()) : '';
    return `<div class="dm-typo-item">
      <div><div class="dm-typo-token">${escapeHtml(name)}</div><div class="dm-typo-sample" style="${st}">${sample}</div></div>
      <div class="dm-typo-meta-wrap">
        <div class="dm-typo-specs">${specs}</div>
        ${fontNameDisplay?`<div class="dm-typo-specs" style="margin-top:2px;opacity:.6">${fontNameDisplay}</div>`:''}
      </div>
    </div>`;
  }).join('');
  return docSection('dm-typography','字体排版','排版层级与字型规格',`<div class="dm-typo-list">${items}</div>`);
}

export function renderSpacingSection(tk) {
  if (!tk?.spacing && !tk?.rounded && !tk?.shadows) return '';
  const accent = tk.colors?.primary || tk.colors?.accent || tk.colors?.brand
    || Object.values(tk.colors||{}).find(v => typeof v==='string' && /^#[0-9a-f]{3,8}$/i.test(v))
    || '#5B47E0';
  let body = '';
  if (tk.spacing) {
    const mx = Math.max(...Object.values(tk.spacing).map(v=>parseInt(v)||0), 1);
    const rows = Object.entries(tk.spacing).map(([k,v]) => {
      const w = Math.max((parseInt(v)||0)/mx*260, 4);
      return `<div class="dm-spacing-row">
        <span class="dm-spacing-key">${escapeHtml(k)}</span>
        <span class="dm-spacing-bar" style="width:${w}px;background:${sanitizeCssVal(accent)}"></span>
        <span class="dm-spacing-val">${escapeHtml(v)}</span>
      </div>`;
    }).join('');
    body += `<div style="margin-bottom:var(--space-6)"><div class="dm-color-group-title">间距</div><div class="dm-spacing-list">${rows}</div></div>`;
  }
  if (tk.rounded) {
    const boxes = Object.entries(tk.rounded).filter(([,v])=>v!=='0'&&v!=='0px').map(([k,v]) =>
      `<div class="dm-rounded-item">
        <div class="dm-rounded-box" style="border-radius:${sanitizeCssVal(v)};background:${sanitizeCssVal(accent)}"></div>
        <div class="dm-rounded-lbl">${escapeHtml(k)}<br>${escapeHtml(v)}</div>
      </div>`
    ).join('');
    body += `<div style="margin-bottom:var(--space-6)"><div class="dm-color-group-title">圆角</div><div class="dm-rounded-row">${boxes}</div></div>`;
  }
  if (tk.shadows) {
    const boxes = Object.entries(tk.shadows).map(([k,v]) =>
      `<div class="dm-shadow-item"><div class="dm-shadow-box" style="box-shadow:${sanitizeCssVal(v)}"></div><div class="dm-shadow-lbl">${escapeHtml(k)}</div></div>`
    ).join('');
    body += `<div><div class="dm-color-group-title">阴影</div><div class="dm-shadow-row">${boxes}</div></div>`;
  }
  return docSection('dm-spacing','间距 & 形状','间距系统、圆角规格与阴影层级', body);
}

export function renderColorExamplesSection(tk) {
  if (!tk?.colors) return '';
  const theme = themeFromDesignTokens(tk);
  const html = renderColorExamplesHTML(theme, {
    featureTitle: escapeHtml(tk.name || '设计系统'),
    featureDesc: escapeHtml(tk.description || '基于 DESIGN.md 色彩 Token 的组件应用预览，展示主色、语义色与交互状态在实际界面中的效果。'),
    pricingTitle: '色彩系统落地',
    pricingDesc: '将 Token 中的主色与语义色应用到按钮、提示、卡片等常见 UI 模式',
  });
  return docSection(
    'dm-examples',
    '颜色示例',
    '表面分层、文本层级、YAML 组件与常见 UI 模式的可视化预览',
    `<div class="dm-color-examples" data-color-examples-root><div class="grid grid-2">${html}</div></div>`
  );
}

export function renderGuideSection(tk, md) {
  if (!md) return '';
  return docSection('dm-guide','设计规范文档','',`<div class="dm-prose">${simpleMd(md, tk)}</div>`);
}

export function renderComponentsSection(tk) {
  if (!tk?.components) return '';

  function specCell(val) {
    const resolved = sanitizeCssVal(resolveRef(String(val ?? '—'), tk));
    const swatch = /^#[0-9a-f]{3,8}$/i.test(resolved)
      ? `<span class="dm-spec-swatch" style="background:${resolved}"></span>` : '';
    return `${swatch}<span class="dm-spec-val">${escapeHtml(resolved)}</span>`;
  }

  function typoLabel(props) {
    if (!props.typography) return '—';
    const key = String(props.typography).replace(/^\{typography\.(.+)\}$/, '$1');
    const t = tk.typography?.[key];
    if (!t) return escapeHtml(String(props.typography));
    const parts = [key, t.fontSize, t.fontWeight ? `w${t.fontWeight}` : ''].filter(Boolean);
    return escapeHtml(parts.join(' · '));
  }

  const rows = Object.entries(tk.components).map(([name, props]) => {
    const rd = props.rounded ? resolveRef(String(props.rounded), tk) : '—';
    const pd = props.padding ? resolveRef(String(props.padding), tk) : '—';
    const ht = props.height ? resolveRef(String(props.height), tk) : '—';
    return `<tr>
      <td><code class="dm-spec-token">${escapeHtml(name)}</code></td>
      <td>${specCell(props.backgroundColor || 'transparent')}</td>
      <td>${specCell(props.textColor || '—')}</td>
      <td><span class="dm-spec-val">${escapeHtml(rd)}</span></td>
      <td>${typoLabel(props)}</td>
      <td><span class="dm-spec-val">${escapeHtml(pd)}${ht !== '—' ? ` · h ${escapeHtml(ht)}` : ''}</span></td>
    </tr>`;
  }).join('');

  const note = `<p class="dm-comp-spec-note">此处为 Token 属性对照表，避免与下方预览重复。完整视觉场景见 <a href="#dm-examples">颜色示例</a>（表面分层、按钮状态、卡片、表单等）。</p>`;
  const table = `<div class="dm-comp-spec-wrap"><table class="dm-comp-spec-table">
    <thead><tr><th>Token</th><th>背景</th><th>文字</th><th>圆角</th><th>字阶</th><th>尺寸</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;

  return docSection('dm-components', '组件规范', 'YAML components 段属性一览', note + table);
}
