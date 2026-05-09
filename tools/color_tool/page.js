/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
const PRESETS = [
  '#FF0000','#FF8000','#FFBF00','#00C853','#00BCD4',
  '#3B82F6','#6366F1','#8B5CF6','#EC4899','#000000',
];
const DEFAULT_HEX = '#3b82f6';

/* ========== 2. 状态 ========== */
let currentFmt = 'css';

/* ========== 3. DOM 引用 ========== */
const wheel      = $('[data-wheel]');
const colorInput = $('[data-color-input]');
const swatchEl   = $('[data-swatch]');
const presetsEl  = $('[data-presets]');
const fmtList    = $('[data-format-list]');
const shadesEl   = $('[data-shades]');
const schemesEl  = $('[data-schemes]');
const semanticEl = $('[data-semantic]');
const exportCode = $('[data-export-code]');
const fmtBtns    = $$('[data-fmt]');
const contrastWhite = $('[data-contrast="white"]');
const contrastBlack = $('[data-contrast="black"]');
const crWhite    = $('[data-cr="white"]');
const crBlack    = $('[data-cr="black"]');
const wcagWhite  = $('[data-wcag="white"]');
const wcagBlack  = $('[data-wcag="black"]');
const contrastDetail = $('[data-contrast-detail]');
const harmonyScore = $('[data-harmony-score]');
const harmonyTips  = $('[data-harmony-tips]');
const tabBtns    = $$('[data-tab]');
const panes      = $$('[data-pane]');
const examplesEl = $('[data-examples]');
const toolBody   = $('[data-tool-slug="color_tool"] .tool-body');

/* ========== 4. 颜色数学 ========== */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16) };
}
function rgbToHex({r,g,b}) { return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase(); }
function rgbToHSL(r,g,b) {
  r/=255; g/=255; b/=255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2;
  if(mx===mn) return {h:0,s:0,l:Math.round(l*100)};
  const d=mx-mn, s=l>.5?d/(2-mx-mn):d/(mx+mn);
  let h; switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
  return {h:Math.round(h*60),s:Math.round(s*100),l:Math.round(l*100)};
}
function hslToHex(h,s,l) {
  l/=100; const a=s*Math.min(l,1-l)/100;
  const f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(Math.min(k-3,9-k,1),-1))).toString(16).padStart(2,'0');};
  return '#'+f(0)+f(8)+f(4);
}
function rgbToHSB(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h,s=mx===0?0:d/mx;if(mx===mn)h=0;else{switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}return{h:Math.round(h*360),s:Math.round(s*100),b:Math.round(mx*100)};}
function rgbToCMYK(r,g,b){let c=1-r/255,m=1-g/255,y=1-b/255,k=Math.min(c,m,y);if(k===1)return{c:0,m:0,y:0,k:100};c=Math.round(((c-k)/(1-k))*100);m=Math.round(((m-k)/(1-k))*100);y=Math.round(((y-k)/(1-k))*100);k=Math.round(k*100);return{c,m,y,k};}
function hexToHWB(hex){const{r,g,b}=hexToRgb(hex);const w=Math.min(r,g,b)/255;const bl=1-Math.max(r,g,b)/255;const hsv=rgbToHSB(r,g,b);return{h:hsv.h,w:Math.round(w*100),b:Math.round(bl*100)};}
function isLight(hex){const{r,g,b}=hexToRgb(hex);return(r*299+g*587+b*114)/1000>128;}

function parseColor(input) {
  input = input.trim();
  let match;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(input)) {
    const rgb = hexToRgb(input);
    return buildFormats(rgbToHex(rgb), rgb);
  }
  match = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (match) { const rgb={r:+match[1],g:+match[2],b:+match[3]}; return buildFormats(rgbToHex(rgb),rgb); }
  match = input.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i);
  if (match) { const hex=hslToHex(+match[1],+match[2],+match[3]); return buildFormats(hex,hexToRgb(hex)); }
  return null;
}

function buildFormats(hex, rgb) {
  const hsl=rgbToHSL(rgb.r,rgb.g,rgb.b), hsb=rgbToHSB(rgb.r,rgb.g,rgb.b);
  const cmyk=rgbToCMYK(rgb.r,rgb.g,rgb.b), hwb=hexToHWB(hex);
  return {
    HEX: hex.toUpperCase(),
    RGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    HSL: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    HSB: `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`,
    CMYK: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    HWB: `hwb(${hwb.h}, ${hwb.w}%, ${hwb.b}%)`
  };
}

function generateShades(hex) {
  const hsl = rgbToHSL(...Object.values(hexToRgb(hex)));
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

function semanticColors(hex) {
  const hsl = rgbToHSL(...Object.values(hexToRgb(hex)));
  return {
    Success: hslToHex(120, Math.min(85, hsl.s + 10), Math.min(45, hsl.l)),
    Info:    hslToHex(210, Math.min(95, hsl.s + 10), Math.min(65, hsl.l + 10)),
    Warning: hslToHex(40, Math.min(95, hsl.s + 15), Math.min(65, Math.max(45, hsl.l))),
    Danger:  hslToHex(5, Math.min(100, hsl.s + 20), Math.min(60, Math.max(40, hsl.l - 5)))
  };
}

function colorSchemes(hex) {
  const {h,s,l} = rgbToHSL(...Object.values(hexToRgb(hex)));
  const c = (hue) => hslToHex((hue + 360) % 360, s, l).toUpperCase();
  return {
    '互补色': [hex.toUpperCase(), c(h+180)],
    '分裂互补': [hex.toUpperCase(), c(h+150), c(h+210)],
    '近似色': [c(h-20), c(h-10), hex.toUpperCase(), c(h+10), c(h+20)],
    '三等分': [hex.toUpperCase(), c(h+120), c(h+240)]
  };
}

function genVars(hex, type) {
  const shades = generateShades(hex);
  const sem = semanticColors(hex);
  const rgb = hexToRgb(hex);
  if (type === 'tailwind') {
    let o = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n';
    o += `          DEFAULT: '${hex.toUpperCase()}',\n`;
    shades.forEach(s => { o += `          ${s.level}: '${s.hex}',\n`; });
    o += '        },\n';
    Object.entries(sem).forEach(([k,v]) => { o += `        ${k.toLowerCase()}: '${v.toUpperCase()}',\n`; });
    o += '      },\n    },\n  },\n};';
    return o;
  }
  const pre = type === 'css' ? '--' : type === 'scss' ? '$' : '@';
  let o = type === 'css' ? ':root {\n' : '';
  o += `  ${pre}primary: ${hex.toUpperCase()};\n`;
  o += `  ${pre}primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n`;
  shades.forEach(s => { o += `  ${pre}primary-${s.level}: ${s.hex};\n`; });
  Object.entries(sem).forEach(([k,v]) => { o += `  ${pre}${k.toLowerCase()}: ${v.toUpperCase()};\n`; });
  if (type === 'css') o += '}';
  return o;
}

/* WCAG 对比度 */
function luminance(r, g, b) {
  const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1), rgb2 = hexToRgb(hex2);
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b), l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

/* 和谐度评分 */
function harmonyAnalysis(hex) {
  const {h, s, l} = rgbToHSL(...Object.values(hexToRgb(hex)));
  const hueScore = Math.max(0, Math.min(100, 100 - Math.abs(50 - (h % 60)) * 1.5));
  const satScore = s >= 20 && s <= 80 ? 90 + (40 - Math.abs(50 - s)) * 0.25 : Math.max(40, 100 - Math.abs(50 - s) * 1.2);
  const lumScore = l >= 25 && l <= 75 ? 85 + (50 - Math.abs(50 - l)) * 0.3 : Math.max(30, 100 - Math.abs(50 - l) * 1.4);
  const total = Math.round(hueScore * 0.3 + satScore * 0.35 + lumScore * 0.35);
  const tips = [];
  if (s < 15) tips.push('饱和度偏低，颜色略显灰暗');
  if (s > 90) tips.push('饱和度过高，可能产生视觉疲劳');
  if (l < 20) tips.push('明度过低，建议用于小面积点缀');
  if (l > 85) tips.push('明度过高，建议搭配深色背景');
  if (tips.length === 0) tips.push('当前配色具有良好的视觉平衡');
  tips.push('建议在深色/浅色模式下分别测试对比度');
  return { total, hue: Math.round(hueScore), sat: Math.round(satScore), lum: Math.round(lumScore), tips };
}

/* ========== 核心渲染 ========== */
function updateAll() {
  const hex = wheel.value;
  const fmt = parseColor(hex);
  if (!fmt) return;

  swatchEl.style.background = hex;

  fmtList.innerHTML = Object.entries(fmt).map(([k,v]) =>
    `<div class="ct-fmt" data-copy="${v}"><span class="u-muted">${k}</span><span class="u-mono">${v}</span></div>`
  ).join('');

  const shades = generateShades(hex);
  shadesEl.innerHTML = shades.map(s =>
    `<div title="${s.level}: ${s.hex}" data-copy="${s.hex}">
      <div class="ct-shade" style="background:${s.hex}"></div>
      <div style="font-size:10px;text-align:center;margin-top:2px" class="u-muted">${s.level}</div>
    </div>`
  ).join('');

  const schemes = colorSchemes(hex);
  schemesEl.innerHTML = Object.entries(schemes).map(([name, colors]) =>
    `<div class="ct-scheme-card">
      <div class="ct-scheme-strip">${colors.map(c =>
        `<span style="background:${c}" title="${c}" data-copy="${c}"></span>`
      ).join('')}</div>
      <div class="ct-scheme-info"><span class="u-strong">${name}</span><span class="u-muted">${colors.length} 色</span></div>
    </div>`
  ).join('');

  const sem = semanticColors(hex);
  semanticEl.innerHTML = Object.entries(sem).map(([k,v]) =>
    `<div class="u-row u-gap-2" style="align-items:center;cursor:pointer" data-copy="${v.toUpperCase()}">
      <div class="ct-sem" style="background:${v};width:40px"></div>
      <span style="font-size:var(--text-sm)">${k}</span>
      <span class="u-muted u-mono" style="font-size:var(--text-xs);margin-left:auto">${v.toUpperCase()}</span>
    </div>`
  ).join('');

  exportCode.textContent = genVars(hex, currentFmt);

  /* WCAG 对比度 */
  const crW = contrastRatio(hex, '#FFFFFF'), crB = contrastRatio(hex, '#000000');
  contrastWhite.style.background = '#FFFFFF';
  contrastWhite.style.color = hex;
  contrastBlack.style.background = '#000000';
  contrastBlack.style.color = hex;
  crWhite.textContent = crW.toFixed(2) + ':1';
  crBlack.textContent = crB.toFixed(2) + ':1';
  wcagWhite.textContent = wcagLevel(crW);
  wcagBlack.textContent = wcagLevel(crB);
  contrastDetail.innerHTML = [
    { bg: '#FFFFFF', label: '白底' },
    { bg: '#F5F5F5', label: '浅灰底' },
    { bg: '#333333', label: '深灰底' },
    { bg: '#000000', label: '黑底' },
  ].map(({ bg, label }) => {
    const cr = contrastRatio(hex, bg);
    const lv = wcagLevel(cr);
    const lvColor = lv === 'Fail' ? 'var(--color-danger)' : lv === 'AAA' ? 'var(--color-success)' : 'var(--color-warning)';
    return `<div class="u-row u-between" style="font-size:var(--text-sm);padding:var(--space-1) 0">
      <span class="u-row u-gap-2"><span style="width:16px;height:16px;border-radius:var(--radius-sm);background:${bg};border:1px solid var(--border-subtle)"></span>${label}</span>
      <span>${cr.toFixed(2)}:1 <strong style="color:${lvColor}">${lv}</strong></span>
    </div>`;
  }).join('');

  /* 和谐度 */
  const ha = harmonyAnalysis(hex);
  harmonyScore.innerHTML = `${ha.total}<small>和谐度</small>`;
  $('[data-score="hue"]').textContent = ha.hue + '%';
  $('[data-score="sat"]').textContent = ha.sat + '%';
  $('[data-score="lum"]').textContent = ha.lum + '%';
  $('[data-bar="hue"]').style.width = ha.hue + '%';
  $('[data-bar="sat"]').style.width = ha.sat + '%';
  $('[data-bar="lum"]').style.width = ha.lum + '%';
  harmonyTips.innerHTML = ha.tips.map(t => `<div class="u-muted">• ${t}</div>`).join('');

  /* 动态 CSS 变量注入 */
  const rgb2 = hexToRgb(hex);
  const tb = toolBody.style;
  tb.setProperty('--ct-primary', hex);
  tb.setProperty('--ct-primary-rgb', `${rgb2.r},${rgb2.g},${rgb2.b}`);
  tb.setProperty('--ct-success', sem.Success);
  tb.setProperty('--ct-info', sem.Info);
  tb.setProperty('--ct-warning', sem.Warning);
  tb.setProperty('--ct-danger', sem.Danger);
  shades.forEach(sh => tb.setProperty(`--ct-${sh.level}`, sh.hex));

  renderExamples(hex, sem);
}

/* ========== 颜色示例渲染 ========== */

/* SVG 圆环图辅助 */
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
function buildDoughnut(hex) {
  const shades = generateShades(hex);
  const picks = [
    shades[1],  shades[4],  shades[6],
    shades[8],  shades[10], shades[12]
  ];
  const cx = 110, cy = 110, R = 100, r = 72, gap = 2;
  const step = 360 / picks.length;
  let paths = '', legends = '';
  picks.forEach((s, i) => {
    const a1 = i * step + gap / 2, a2 = (i + 1) * step - gap / 2;
    paths += `<path d="${arcPath(cx, cy, R, r, a1, a2)}" fill="${s.hex}" style="cursor:pointer" data-copy="${s.hex}"><title>${s.level}: ${s.hex}</title></path>`;
    legends += `<span><i style="background:${s.hex}"></i>${s.level}</span>`;
  });
  return { svg: `<svg viewBox="0 0 220 220">${paths}<text x="110" y="114" text-anchor="middle" fill="var(--fg-muted)" font-size="13" font-weight="600">色阶展示</text></svg>`, legends };
}

function renderExamples(hex, sem) {
  const shades = generateShades(hex);
  const doughnut = buildDoughnut(hex);

  examplesEl.innerHTML = `
    <!-- 1. 特性卡片 -->
    <div class="ct-ex-section ct-ex-feature">
      <div class="ct-ex-feature-circle"><span>01</span></div>
      <i data-lucide="palette" class="ct-ex-feature-icon"></i>
      <h4 class="ct-ex-feature-title" style="margin-bottom:0">颜色工具箱</h4>
      <p class="ct-ex-feature-desc">专业的颜色处理工具集，集成多种实用功能，助力设计开发工作流程。支持多种颜色格式转换、智能色阶生成、配色方案推荐等功能，让颜色处理更加便捷高效。</p>
    </div>

    <!-- 2. 颜色系统 / 定价卡片 -->
    <div class="ct-ex-section ct-ex-pricing">
      <div class="ct-ex-pricing-inner">
        <h4 class="ct-ex-pricing-title">颜色系统示例</h4>
        <p class="ct-ex-pricing-desc">展示如何在实际产品中运用色彩系统，包括主色、渐变、文本和交互状态等</p>
        <div class="ct-ex-switch-tabs" data-switch-tabs>
          <button class="ct-ex-switch-tab is-active" type="button">基础版</button>
          <button class="ct-ex-switch-tab" type="button">专业版</button>
          <div class="ct-ex-switch-indicator"></div>
        </div>
        <div class="ct-ex-feature-list">
          <span class="ct-ex-feature-list-title">功能特点</span>
          <ul>
            <li><i data-lucide="check-circle"></i><span>支持多种颜色格式转换与调整</span></li>
            <li><i data-lucide="check-circle"></i><span>智能生成配色方案与色阶</span></li>
          </ul>
        </div>
      </div>
      <div class="ct-ex-pricing-footer">
        <div class="ct-ex-price"><sup>￥</sup>99<sub><sup>元</sup></sub></div>
        <button class="ct-ex-pricing-action" type="button">立即升级</button>
      </div>
    </div>

    <!-- 3. 色阶圆环图 -->
    <div class="ct-ex-section">
      <h4>色阶可视化</h4>
      <div class="ct-ex-doughnut">${doughnut.svg}<span class="ct-ex-doughnut-center"></span></div>
      <div class="ct-ex-doughnut-legend">${doughnut.legends}</div>
    </div>

    <!-- 4. 状态提示 -->
    <div class="ct-ex-section">
      <h4>状态提示</h4>
      <div class="ct-ex-toast" style="border-color:${sem.Success}">
        <i data-lucide="check-circle" style="color:${sem.Success}"></i>
        <div class="ct-ex-toast-body"><div class="ct-ex-toast-title" style="color:${sem.Success}">成功提示</div><div class="ct-ex-toast-msg">操作已成功完成，数据已保存。</div></div>
      </div>
      <div class="ct-ex-toast" style="border-color:${sem.Info}">
        <i data-lucide="info" style="color:${sem.Info}"></i>
        <div class="ct-ex-toast-body"><div class="ct-ex-toast-title" style="color:${sem.Info}">信息提示</div><div class="ct-ex-toast-msg">这是一条重要的信息通知。</div></div>
      </div>
      <div class="ct-ex-toast" style="border-color:${sem.Warning}">
        <i data-lucide="alert-triangle" style="color:${sem.Warning}"></i>
        <div class="ct-ex-toast-body"><div class="ct-ex-toast-title" style="color:${sem.Warning}">警告提示</div><div class="ct-ex-toast-msg">请注意，这是一条警告信息。</div></div>
      </div>
      <div class="ct-ex-toast" style="border-color:${sem.Danger}">
        <i data-lucide="x-circle" style="color:${sem.Danger}"></i>
        <div class="ct-ex-toast-body"><div class="ct-ex-toast-title" style="color:${sem.Danger}">错误提示</div><div class="ct-ex-toast-msg">操作失败，请检查后重试。</div></div>
      </div>
    </div>

    <!-- 5. 聊天界面 -->
    <div class="ct-ex-section">
      <h4>聊天界面</h4>
      <div class="ct-ex-chat">
        <div class="ct-ex-bubble is-left">你好！请问有什么可以帮助你的吗？</div>
        <div class="ct-ex-bubble is-right">我想了解一下这个颜色工具的使用方法。</div>
        <div class="ct-ex-bubble is-left">当然可以，你可以直接使用颜色选择器，或者输入颜色值来开始。</div>
        <div class="ct-ex-bubble is-right">明白了，谢谢！工具界面很直观呢。</div>
      </div>
    </div>

    <!-- 6. 选择开发语言 -->
    <div class="ct-ex-section">
      <h4>选择开发语言</h4>
      <div class="ct-ex-radios">
        <label class="ct-ex-radio">
          <i data-lucide="code" class="ct-ex-radio-icon"></i>
          <span class="ct-ex-radio-label">HTML</span>
          <input type="radio" name="ct-lang" value="html" checked>
        </label>
        <label class="ct-ex-radio">
          <i data-lucide="code" class="ct-ex-radio-icon"></i>
          <span class="ct-ex-radio-label">CSS</span>
          <input type="radio" name="ct-lang" value="css">
        </label>
        <label class="ct-ex-radio">
          <i data-lucide="terminal" class="ct-ex-radio-icon"></i>
          <span class="ct-ex-radio-label">JavaScript</span>
          <input type="radio" name="ct-lang" value="js">
        </label>
      </div>
    </div>

    <!-- 7. 主要按钮 -->
    <div class="ct-ex-section">
      <h4>主要按钮</h4>
      <div class="ct-ex-btn-grid">
        <button class="ct-ex-btn is-fill">Default</button>
        <button class="ct-ex-btn is-fill is-hover">Hover</button>
        <button class="ct-ex-btn is-fill is-active">Active</button>
        <button class="ct-ex-btn is-disabled">Disabled</button>
      </div>
    </div>

    <!-- 8. 描边按钮 -->
    <div class="ct-ex-section">
      <h4>描边按钮</h4>
      <div class="ct-ex-btn-grid">
        <button class="ct-ex-btn is-outline">Default</button>
        <button class="ct-ex-btn is-outline is-outline-hover">Hover</button>
        <button class="ct-ex-btn is-outline is-outline-active">Active</button>
        <button class="ct-ex-btn is-outline is-disabled">Disabled</button>
      </div>
    </div>

    <!-- 9. 进度条 -->
    <div class="ct-ex-section">
      <h4>进度条</h4>
      <div class="ct-ex-progress">
        <div class="ct-ex-progress-label"><span>主色进度</span><span>75%</span></div>
        <div class="ct-ex-progress-bar"><div class="ct-ex-progress-fill" style="width:75%;background:${hex}"></div></div>
      </div>
      <div class="ct-ex-progress">
        <div class="ct-ex-progress-label"><span>成功</span><span>45%</span></div>
        <div class="ct-ex-progress-bar"><div class="ct-ex-progress-fill" style="width:45%;background:${sem.Success}"></div></div>
      </div>
      <div class="ct-ex-progress">
        <div class="ct-ex-progress-label"><span>警告</span><span>60%</span></div>
        <div class="ct-ex-progress-bar"><div class="ct-ex-progress-fill" style="width:60%;background:${sem.Warning}"></div></div>
      </div>
    </div>

    <!-- 10. 标签 -->
    <div class="ct-ex-section">
      <h4>标签</h4>
      <div class="ct-ex-tags">
        <span class="ct-ex-tag" style="background:${hex}">Primary</span>
        <span class="ct-ex-tag" style="background:${sem.Success}">Success</span>
        <span class="ct-ex-tag" style="background:${sem.Warning};color:${isLight(sem.Warning) ? '#000' : '#fff'}">Warning</span>
        <span class="ct-ex-tag" style="background:${sem.Danger}">Danger</span>
        <span class="ct-ex-tag" style="background:${sem.Info}">Info</span>
      </div>
    </div>

    <!-- 11. 输入框 -->
    <div class="ct-ex-section">
      <h4>输入框</h4>
      <div class="u-col u-gap-3">
        <div>
          <div style="font-size:var(--text-xs);color:var(--fg-muted);margin-bottom:var(--space-1)">默认输入框</div>
          <input class="ct-ex-input" placeholder="请输入内容" readonly>
        </div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--fg-muted);margin-bottom:var(--space-1)">聚焦状态</div>
          <input class="ct-ex-input is-focused" value="聚焦状态示例" readonly>
        </div>
      </div>
    </div>

    <!-- 12. 卡片 -->
    <div class="ct-ex-section">
      <h4>卡片</h4>
      <div class="ct-ex-card">
        <div class="ct-ex-card-header">
          <h5>卡片标题</h5>
          <span class="ct-ex-card-badge">新</span>
        </div>
        <div class="ct-ex-card-body">这是一个使用当前颜色主题的卡片示例，展示了颜色在实际组件中的应用效果。</div>
        <div class="ct-ex-card-footer">
          <button class="ct-ex-btn is-fill" style="width:100%">查看详情</button>
        </div>
      </div>
    </div>
  `;

  if (window.refreshIcons) window.refreshIcons(examplesEl);

  /* 定价卡片的 switch tabs 交互 */
  const sw = examplesEl.querySelector('[data-switch-tabs]');
  if (sw) {
    const tabs = sw.querySelectorAll('.ct-ex-switch-tab');
    const indicator = sw.querySelector('.ct-ex-switch-indicator');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        indicator.style.left = `calc(${i * 50}% + 2px)`;
      });
    });
  }
}

/* ========== 5. 事件绑定 ========== */

/* --- Tabs --- */
on($('[data-tabs]'), 'click', e => {
  const t = e.target.closest('[data-tab]');
  if (!t) return;
  tabBtns.forEach(b => b.classList.toggle('is-active', b === t));
  panes.forEach(p => p.hidden = p.dataset.pane !== t.dataset.tab);
});

/* --- 预设色 --- */
presetsEl.innerHTML = PRESETS.map(c =>
  `<div class="ct-preset" style="background:${c}" data-preset="${c}" title="${c}"></div>`
).join('');

on(presetsEl, 'click', e => {
  const el = e.target.closest('[data-preset]');
  if (!el) return;
  const hex = el.dataset.preset;
  wheel.value = hex; colorInput.value = hex;
  $$('[data-preset]').forEach(p => p.classList.toggle('active', p === el));
  updateAll();
});

/* --- 颜色选择器 --- */
on(wheel, 'input', () => { colorInput.value = wheel.value; updateAll(); });
on(colorInput, 'input', debounce(() => {
  const c = parseColor(colorInput.value);
  if (c) { wheel.value = c.HEX; updateAll(); }
}, 200));

/* --- 导出格式切换 --- */
fmtBtns.forEach(btn => on(btn, 'click', () => {
  currentFmt = btn.dataset.fmt;
  fmtBtns.forEach(b => b.classList.toggle('active', b === btn));
  updateAll();
}));

/* --- 全局点击复制 --- */
on(document, 'click', e => {
  const el = e.target.closest('[data-copy]');
  if (!el) return;
  copyText(el.dataset.copy);
  showToast('已复制 ' + el.dataset.copy, { type: 'success' });
});

/* --- 复制导出代码 --- */
on($('[data-action="copy-export"]'), 'click', () => {
  copyText(exportCode.textContent);
  showToast('代码已复制', { type: 'success' });
});

/* --- 复制 HEX --- */
on($('[data-action="copy-hex"]'), 'click', async () => {
  const ok = await copyText(wheel.value.toUpperCase());
  showToast(ok ? '已复制 ' + wheel.value.toUpperCase() : '复制失败', { type: ok ? 'success' : 'error' });
});

/* --- 重置 --- */
on($('[data-action="reset"]'), 'click', () => {
  wheel.value = DEFAULT_HEX; colorInput.value = DEFAULT_HEX;
  currentFmt = 'css';
  fmtBtns.forEach(b => b.classList.toggle('active', b.dataset.fmt === 'css'));
  $$('[data-preset]').forEach(p => p.classList.remove('active'));
  updateAll();
  showToast('已重置');
});

/* ========== 初始化 ========== */
updateAll();
