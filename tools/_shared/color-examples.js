/**
 * 颜色示例预览 — color_tool 与 design_md 共用
 * 依赖 CSS：tools/_shared/color-examples.css
 */
import { hexToRgb, rgbToHSL, hslToHex, isLight, contrastRatio, wcagLevel } from '../../public/scripts/utils/color.js';
import { resolveRef, safeCssValue } from './token-utils.js';

const PREVIEW_COMPONENT_ALIASES = {
  buttonPrimary:   ['button-primary', 'btn-primary'],
  buttonSecondary: ['button-secondary', 'btn-secondary'],
  buttonGhost:     ['button-ghost', 'btn-ghost'],
  card:            ['card', 'panel'],
  badge:           ['badge', 'pill', 'tag'],
  input:           ['input', 'field', 'text-field'],
};

export function generateShades(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHSL(r, g, b);
  const out = [];
  for (let i = 0; i <= 18; i++) {
    const level = i * 50;
    let shade;
    if (level === 500) shade = hex;
    else if (level < 500) {
      const p = (500 - level) / 500;
      shade = hslToHex(hsl.h, Math.max(hsl.s * 0.8, hsl.s * (1 - p * 0.4)), Math.min(98, hsl.l + (100 - hsl.l) * p));
    } else {
      const p = (level - 500) / 400;
      shade = hslToHex(hsl.h, Math.min(100, hsl.s * (1 + p * 0.2)), Math.max(5, hsl.l * (1 - p)));
    }
    out.push({ hex: shade.toUpperCase(), level });
  }
  return out;
}

export function semanticColors(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHSL(r, g, b);
  return {
    Success: hslToHex(120, Math.min(85, hsl.s + 10), Math.min(45, hsl.l)),
    Info:    hslToHex(210, Math.min(95, hsl.s + 10), Math.min(65, hsl.l + 10)),
    Warning: hslToHex(40, Math.min(95, hsl.s + 15), Math.min(65, Math.max(45, hsl.l))),
    Danger:  hslToHex(5, Math.min(100, hsl.s + 20), Math.min(60, Math.max(40, hsl.l - 5))),
  };
}

function pickHex(colors, keys) {
  for (const k of keys) {
    const v = colors?.[k];
    if (typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)) return v.toUpperCase();
  }
  return null;
}

function pickRounded(tk, key, fallback) {
  return safeCssValue(tk?.rounded?.[key], fallback);
}

function typoInline(tk, key, fallbackSize = '14px') {
  const t = tk?.typography?.[key];
  if (!t || typeof t !== 'object') return `font-size:${fallbackSize};font-weight:400;line-height:1.5`;
  const spacing = safeCssValue(t.letterSpacing);
  const ls = spacing ? `;letter-spacing:${spacing}` : '';
  return `font-family:${safeCssValue(t.fontFamily, 'inherit')};font-size:${safeCssValue(t.fontSize, fallbackSize)};font-weight:${safeCssValue(t.fontWeight, '400')};line-height:${safeCssValue(t.lineHeight, '1.5')}${ls}`;
}

function resolveComponentEntry(tk, aliases) {
  if (!tk?.components) return null;
  for (const key of aliases) {
    const props = tk.components[key];
    if (!props) continue;
    const typoKey = String(props.typography || '').replace(/^\{typography\.(.+)\}$/, '$1');
    return {
      token: key,
      bg: safeCssValue(resolveRef(props.backgroundColor || 'transparent', tk), 'transparent'),
      fg: safeCssValue(resolveRef(props.textColor || '#111', tk), '#111'),
      rounded: safeCssValue(resolveRef(props.rounded || '{rounded.md}', tk).replace(/^\{rounded\.(\w+)\}$/, (_, k) => tk.rounded?.[k] || '8px'), '8px'),
      padding: safeCssValue(resolveRef(props.padding || '', tk)),
      height: props.height ? safeCssValue(resolveRef(String(props.height), tk)) : '',
      typoStyle: typoKey ? typoInline(tk, typoKey) : typoInline(tk, 'body-md'),
    };
  }
  return null;
}

export function resolvePreviewComponents(tk) {
  if (!tk?.components) return null;
  const out = {};
  for (const [slot, aliases] of Object.entries(PREVIEW_COMPONENT_ALIASES)) {
    const entry = resolveComponentEntry(tk, aliases);
    if (entry) out[slot] = entry;
  }
  return Object.keys(out).length ? out : null;
}

function buildTheme(hex, sem, shades, tk = null) {
  const colors = tk?.colors || {};
  const primarySoft  = pickHex(colors, ['primary-soft']) || shades[0]?.hex || hex;
  const primaryActive = pickHex(colors, ['primary-active']) || shades[10]?.hex || hex;
  const onPrimary = pickHex(colors, ['on-primary', 'onPrimary']) || (isLight(hex) ? '#111111' : '#FFFFFF');
  const surfaces = {
    canvas: pickHex(colors, ['canvas', 'background', 'bg']) || shades[0]?.hex || '#F8F8FC',
    card:   pickHex(colors, ['surface-card', 'surface', 'card']) || '#FFFFFF',
    raised: pickHex(colors, ['surface-raised', 'surface-secondary']) || shades[1]?.hex || '#F0F0FA',
    stripe: pickHex(colors, ['hairline-soft', 'surface-muted']) || shades[2]?.hex || '#EDEDF8',
  };
  const text = {
    ink:   pickHex(colors, ['ink', 'foreground', 'text']) || shades[18]?.hex || '#1A1A2E',
    body:  pickHex(colors, ['body', 'text-secondary']) || '#4A4A6A',
    muted: pickHex(colors, ['muted', 'text-muted', 'placeholder']) || '#8080A0',
  };
  const hairline = pickHex(colors, ['hairline', 'border', 'divider']) || '#E4E4F0';
  const onDark = pickHex(colors, ['on-dark', 'onDark']) || '#F8F8FC';
  const darkBg = pickHex(colors, ['ink', 'inverse', 'dark']) || text.ink;

  return {
    hex, sem, shades,
    hasTokens: !!tk?.colors,
    surfaces, text, hairline, onDark, darkBg,
    primarySoft, primaryActive, onPrimary,
    rounded: {
      sm:   pickRounded(tk, 'sm', '6px'),
      md:   pickRounded(tk, 'md', '8px'),
      lg:   pickRounded(tk, 'lg', '12px'),
      pill: pickRounded(tk, 'pill', '9999px'),
    },
    typo: {
      display: typoInline(tk, 'display-md', '36px'),
      title:   typoInline(tk, 'title-md', '18px'),
      body:    typoInline(tk, 'body-md', '16px'),
      caption: typoInline(tk, 'caption', '12px'),
    },
    components: resolvePreviewComponents(tk),
  };
}

/** color_tool：仅主色推导 */
export function themeFromWheel(hex) {
  const h = hex.toUpperCase();
  const sem = semanticColors(h);
  return buildTheme(h, sem, generateShades(h));
}

/** design_md：完整 Token */
export function themeFromDesignTokens(tk) {
  const colors = tk?.colors || {};
  const hex = pickHex(colors, ['primary', 'accent', 'brand'])
    || Object.values(colors).find(v => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v))
    || '#3B82F6';
  const derived = semanticColors(hex);
  const sem = {
    Success: pickHex(colors, ['semantic-success', 'success']) || derived.Success,
    Info:    pickHex(colors, ['semantic-info', 'info']) || derived.Info,
    Warning: pickHex(colors, ['semantic-warning', 'warning']) || derived.Warning,
    Danger:  pickHex(colors, ['semantic-error', 'error', 'danger']) || derived.Danger,
  };
  return buildTheme(hex, sem, generateShades(hex), tk);
}

export function applyColorExampleVars(el, theme) {
  if (!el || !theme) return;
  const { hex, sem, shades, surfaces, text, hairline, onPrimary, primarySoft, primaryActive, rounded } = theme;
  const { r, g, b } = hexToRgb(hex);
  el.classList.toggle('ct-ex-themed', theme.hasTokens);
  el.style.setProperty('--ct-primary', hex);
  el.style.setProperty('--ct-primary-rgb', `${r},${g},${b}`);
  el.style.setProperty('--ct-primary-soft', primarySoft);
  el.style.setProperty('--ct-primary-active', primaryActive);
  el.style.setProperty('--ct-on-primary', onPrimary);
  el.style.setProperty('--ct-success', sem.Success);
  el.style.setProperty('--ct-info', sem.Info);
  el.style.setProperty('--ct-warning', sem.Warning);
  el.style.setProperty('--ct-danger', sem.Danger);
  el.style.setProperty('--ct-canvas', surfaces.canvas);
  el.style.setProperty('--ct-surface-card', surfaces.card);
  el.style.setProperty('--ct-surface-raised', surfaces.raised);
  el.style.setProperty('--ct-surface-stripe', surfaces.stripe);
  el.style.setProperty('--ct-ink', text.ink);
  el.style.setProperty('--ct-body', text.body);
  el.style.setProperty('--ct-muted', text.muted);
  el.style.setProperty('--ct-hairline', hairline);
  el.style.setProperty('--ct-on-dark', theme.onDark);
  el.style.setProperty('--ct-dark-bg', theme.darkBg);
  el.style.setProperty('--ct-radius-sm', rounded.sm);
  el.style.setProperty('--ct-radius-md', rounded.md);
  el.style.setProperty('--ct-radius-lg', rounded.lg);
  el.style.setProperty('--ct-radius-pill', rounded.pill);
  shades.forEach(sh => el.style.setProperty(`--ct-${sh.level}`, sh.hex));
}

function polarXY(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, R, r, a1, a2) {
  const s1 = polarXY(cx, cy, R, a2), e1 = polarXY(cx, cy, R, a1);
  const s2 = polarXY(cx, cy, r, a2), e2 = polarXY(cx, cy, r, a1);
  const lg = a2 - a1 > 180 ? 1 : 0;
  return `M${s1.x},${s1.y} A${R},${R},0,${lg},0,${e1.x},${e1.y} L${e2.x},${e2.y} A${r},${r},0,${lg},1,${s2.x},${s2.y} Z`;
}

function buildDoughnut(shades) {
  const picks = [shades[1], shades[4], shades[6], shades[8], shades[10], shades[12]];
  const cx = 110, cy = 110, R = 100, r = 72, gap = 2;
  const step = 360 / picks.length;
  let paths = '', legends = '';
  picks.forEach((s, i) => {
    const a1 = i * step + gap / 2, a2 = (i + 1) * step - gap / 2;
    paths += `<path d="${arcPath(cx, cy, R, r, a1, a2)}" fill="${s.hex}" style="cursor:pointer" data-copy="${s.hex}"><title>${s.level}: ${s.hex}</title></path>`;
    legends += `<span><i style="background:${s.hex}"></i>${s.level}</span>`;
  });
  return {
    svg: `<svg viewBox="0 0 220 220">${paths}<text x="110" y="114" text-anchor="middle" fill="var(--ct-muted, var(--fg-muted))" font-size="13" font-weight="600">色阶展示</text></svg>`,
    legends,
  };
}

function wcagBadge(fg, bg) {
  const cr = contrastRatio(fg, bg);
  const lv = wcagLevel(cr);
  const color = lv === 'Fail' ? 'var(--color-danger)' : lv === 'AAA' ? 'var(--color-success)' : 'var(--color-warning)';
  return `<span class="ct-ex-wcag" style="color:${color}">${cr.toFixed(1)}:1 ${lv}</span>`;
}

function btnStyle(comp, variant = 'fill') {
  if (!comp) return '';
  const bg = variant === 'fill' ? comp.bg : 'transparent';
  const border = variant === 'outline' ? `1.5px solid ${comp.fg}` : 'none';
  const h = comp.height ? `height:${comp.height};box-sizing:border-box;` : '';
  return `background:${bg};color:${comp.fg};border:${border};border-radius:${comp.rounded};padding:${comp.padding || '10px 20px'};${comp.typoStyle};${h}`;
}

const DEFAULT_COPY = {
  featureTitle: '颜色工具箱',
  featureDesc: '专业的颜色处理工具集，集成多种实用功能，助力设计开发工作流程。',
  pricingTitle: '颜色系统示例',
  pricingDesc: '展示主色、语义色与表面分层在实际界面中的效果',
  pricingCta: '立即体验',
  pricingPrice: '免费',
  chatUser: '我想了解一下这套色彩系统的用法。',
  chatBot: '当然可以，你可以从表面分层与文本层级开始对照 Token。',
};

export function renderColorExamplesHTML(theme, copy = {}, options = {}) {
  const { showTextLevels = true } = options;
  const c = { ...DEFAULT_COPY, ...copy };
  const { hex, sem, shades, components: comps, typo } = theme;
  const doughnut = buildDoughnut(shades);
  const pri = comps?.buttonPrimary;
  const sec = comps?.buttonSecondary;
  const ghost = comps?.buttonGhost;
  const cardComp = comps?.card;
  const badgeComp = comps?.badge;
  const inputComp = comps?.input;

  const tokenBlock = comps ? `
    <div class="ct-ex-section ct-ex-token-block">
      <h4>YAML 组件（与 components 段同步）</h4>
      <p class="ct-ex-section-hint">以下直接读取 DESIGN.md 的 components Token，完整场景预览见各区块</p>
      <div class="ct-ex-token-row">
        ${pri ? `<button type="button" class="ct-ex-token-btn" style="${btnStyle(pri)}">${pri.token} ${wcagBadge(pri.fg, pri.bg)}</button>` : ''}
        ${sec ? `<button type="button" class="ct-ex-token-btn" style="${btnStyle(sec)}">${sec.token}</button>` : ''}
        ${ghost ? `<button type="button" class="ct-ex-token-btn" style="${btnStyle(ghost, 'outline')}">${ghost.token}</button>` : ''}
        ${badgeComp ? `<span class="ct-ex-token-badge" style="${btnStyle(badgeComp)}">${badgeComp.token}</span>` : ''}
      </div>
    </div>
  ` : '';

  return `
    ${tokenBlock}

    <div class="ct-ex-section ct-ex-surfaces">
      <h4>表面层级</h4>
      <p class="ct-ex-section-hint">用面色差分层，而非描边分割</p>
      <div class="ct-ex-surface-stack">
        <div class="ct-ex-surface-layer is-canvas"><span>canvas</span><code data-copy="${theme.surfaces.canvas}">${theme.surfaces.canvas}</code></div>
        <div class="ct-ex-surface-layer is-raised"><span>surface-raised</span><code data-copy="${theme.surfaces.raised}">${theme.surfaces.raised}</code></div>
        <div class="ct-ex-surface-layer is-card"><span>surface-card</span><code data-copy="${theme.surfaces.card}">${theme.surfaces.card}</code></div>
      </div>
    </div>

    ${showTextLevels ? `
    <div class="ct-ex-section ct-ex-type">
      <h4>文本层级</h4>
      <div class="ct-ex-type-stack">
        <div class="ct-ex-type-display" style="${typo.display}">Display · 设计系统标题</div>
        <div class="ct-ex-type-title" style="${typo.title}">Title · 区块标题</div>
        <div class="ct-ex-type-body" style="${typo.body}">Body · 默认正文与说明段落，用于承载主要阅读内容。</div>
        <div class="ct-ex-type-caption" style="${typo.caption}">Caption · 辅助标注</div>
      </div>
    </div>
    ` : ''}

    <div class="ct-ex-section ct-ex-dark-band">
      <h4>反色条带</h4>
      <div class="ct-ex-dark-inner">
        <strong>${c.featureTitle}</strong>
        <span>on-dark 文本与主色 CTA 在深色面上的表现</span>
        <button type="button" class="ct-ex-dark-cta">主色按钮</button>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>表格斑马纹</h4>
      <table class="ct-ex-table">
        <thead><tr><th>名称</th><th>状态</th><th>数值</th></tr></thead>
        <tbody>
          <tr><td>条目 A</td><td>进行中</td><td>128</td></tr>
          <tr><td>条目 B</td><td>已完成</td><td>256</td></tr>
          <tr><td>条目 C</td><td>待处理</td><td>64</td></tr>
        </tbody>
      </table>
    </div>

    <div class="ct-ex-section ct-ex-feature">
      <div class="ct-ex-feature-circle"><span>01</span></div>
      <i data-lucide="palette" class="ct-ex-feature-icon"></i>
      <h4 class="ct-ex-feature-title" style="margin-bottom:0">${c.featureTitle}</h4>
      <p class="ct-ex-feature-desc">${c.featureDesc}</p>
    </div>

    <div class="ct-ex-section ct-ex-pricing">
      <div class="ct-ex-pricing-inner">
        <h4 class="ct-ex-pricing-title">${c.pricingTitle}</h4>
        <p class="ct-ex-pricing-desc">${c.pricingDesc}</p>
        <div class="ct-ex-switch-tabs" data-switch-tabs>
          <button class="ct-ex-switch-tab is-active" type="button">基础版</button>
          <button class="ct-ex-switch-tab" type="button">专业版</button>
          <div class="ct-ex-switch-indicator"></div>
        </div>
        <div class="ct-ex-feature-list">
          <span class="ct-ex-feature-list-title">功能特点</span>
          <ul>
            <li><i data-lucide="check-circle"></i><span>表面 Token 分层落地</span></li>
            <li><i data-lucide="check-circle"></i><span>语义色状态反馈</span></li>
          </ul>
        </div>
      </div>
      <div class="ct-ex-pricing-footer">
        <div class="ct-ex-price">${c.pricingPrice}</div>
        <button class="ct-ex-pricing-action" type="button">${c.pricingCta}</button>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>色阶可视化</h4>
      <div class="ct-ex-doughnut">${doughnut.svg}<span class="ct-ex-doughnut-center"></span></div>
      <div class="ct-ex-doughnut-legend">${doughnut.legends}</div>
    </div>

    <div class="ct-ex-section">
      <h4>状态提示</h4>
      <div class="ct-ex-toast" style="border-color:${sem.Success}">
        <i data-lucide="check-circle" style="color:${sem.Success}"></i>
        <div class="ct-ex-toast-body"><div class="ct-ex-toast-title" style="color:${sem.Success}">成功提示</div><div class="ct-ex-toast-msg">操作已成功完成。</div></div>
      </div>
      <div class="ct-ex-toast" style="border-color:${sem.Danger}">
        <i data-lucide="x-circle" style="color:${sem.Danger}"></i>
        <div class="ct-ex-toast-body"><div class="ct-ex-toast-title" style="color:${sem.Danger}">错误提示</div><div class="ct-ex-toast-msg">请检查输入后重试。</div></div>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>聊天界面</h4>
      <div class="u-col u-gap-2">
        <div class="ct-ex-bubble is-left">${c.chatBot}</div>
        <div class="ct-ex-bubble is-right">${c.chatUser}</div>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>按钮状态</h4>
      <div class="ct-ex-btn-grid">
        <button type="button" class="ct-ex-btn is-fill">Default</button>
        <button type="button" class="ct-ex-btn is-fill is-hover">Hover</button>
        <button type="button" class="ct-ex-btn is-fill is-active">Active</button>
        <button type="button" class="ct-ex-btn is-disabled">Disabled</button>
      </div>
      <div class="ct-ex-btn-grid u-mt-3">
        <button type="button" class="ct-ex-btn is-outline">Outline</button>
        <button type="button" class="ct-ex-btn is-ghost">Ghost</button>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>进度条</h4>
      <div class="ct-ex-progress">
        <div class="ct-ex-progress-label"><span>主色</span><span>75%</span></div>
        <div class="ct-ex-progress-bar"><div class="ct-ex-progress-fill" style="width:75%"></div></div>
      </div>
      <div class="ct-ex-progress">
        <div class="ct-ex-progress-label"><span>成功</span><span>45%</span></div>
        <div class="ct-ex-progress-bar"><div class="ct-ex-progress-fill is-success" style="width:45%"></div></div>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>标签</h4>
      <div class="ct-ex-tag-demo">
        <div class="ct-ex-tag-group">
          <div class="ct-ex-tag-label">语义状态 · 填充</div>
          <div class="grid-chips">
            <span class="ct-ex-tag is-primary"><i data-lucide="sparkles"></i>主要</span>
            <span class="ct-ex-tag is-success"><i data-lucide="check"></i>已完成</span>
            <span class="ct-ex-tag is-warning"><i data-lucide="clock"></i>待处理</span>
            <span class="ct-ex-tag is-danger"><i data-lucide="alert-circle"></i>异常</span>
            <span class="ct-ex-tag is-info"><i data-lucide="info"></i>提示</span>
          </div>
        </div>
        <div class="ct-ex-tag-group">
          <div class="ct-ex-tag-label">视觉层级 · 柔和 / 描边</div>
          <div class="grid-chips">
            <span class="ct-ex-tag is-soft is-primary"><span class="ct-ex-tag-dot"></span>设计系统</span>
            <span class="ct-ex-tag is-soft is-success"><span class="ct-ex-tag-dot"></span>稳定版</span>
            <span class="ct-ex-tag is-soft is-warning"><span class="ct-ex-tag-dot"></span>审核中</span>
            <span class="ct-ex-tag is-outline is-danger">高风险</span>
            <span class="ct-ex-tag is-neutral">默认标签</span>
          </div>
        </div>
        <div class="ct-ex-tag-group">
          <div class="ct-ex-tag-label">内容结构 · 计数 / 可移除</div>
          <div class="grid-chips">
            <span class="ct-ex-tag is-outline"><i data-lucide="palette"></i>颜色 <span class="ct-ex-tag-count">12</span></span>
            <span class="ct-ex-tag is-outline is-info">组件 <span class="ct-ex-tag-count">8</span></span>
            <span class="ct-ex-tag is-soft is-primary">Stellar <span class="ct-ex-tag-remove" aria-hidden="true">×</span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>输入框</h4>
      <div class="u-col u-gap-3">
        <div>
          <div class="ct-ex-field-label">默认</div>
          <input class="ct-ex-input" placeholder="请输入内容" readonly style="${inputComp ? `${inputComp.typoStyle};border-radius:${inputComp.rounded};padding:${inputComp.padding};background:${inputComp.bg};color:${inputComp.fg}` : ''}">
        </div>
        <div>
          <div class="ct-ex-field-label">聚焦</div>
          <input class="ct-ex-input is-focused" value="聚焦状态" readonly>
        </div>
        <div>
          <div class="ct-ex-field-label">错误</div>
          <input class="ct-ex-input is-error" value="格式不正确" readonly>
          <div class="ct-ex-field-error">请填写有效内容</div>
        </div>
      </div>
    </div>

    <div class="ct-ex-section">
      <h4>卡片</h4>
      <div class="ct-ex-card" style="${cardComp ? `background:${cardComp.bg};color:${cardComp.fg};border-radius:${cardComp.rounded}` : ''}">
        <div class="ct-ex-card-header">
          <h5>卡片标题</h5>
          <span class="ct-ex-card-badge" style="${badgeComp ? `background:${badgeComp.bg};color:${badgeComp.fg};border-radius:${badgeComp.rounded};padding:${badgeComp.padding}` : ''}">新</span>
        </div>
        <div class="ct-ex-card-body">颜色 Token 在真实组件中的组合效果。</div>
        <div class="ct-ex-card-footer">
          <button type="button" class="ct-ex-btn is-fill" style="width:100%">查看详情</button>
        </div>
      </div>
    </div>
  `;
}

export function bindColorExampleInteractions(container) {
  if (!container) return;
  const sw = container.querySelector('[data-switch-tabs]');
  if (sw) {
    const tabs = sw.querySelectorAll('.ct-ex-switch-tab');
    const indicator = sw.querySelector('.ct-ex-switch-indicator');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        if (indicator) indicator.style.left = `calc(${i * 50}% + 2px)`;
      });
    });
  }
  container.querySelectorAll('[data-copy]').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = el.title || '点击复制';
  });
}
