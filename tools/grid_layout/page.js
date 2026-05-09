import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ================= DOM ================= */
const containerWidth = $('[data-input="containerWidth"]');
const desiredCols    = $('[data-input="desiredCols"]');
const customGap      = $('[data-input="customGap"]');
const customMargin   = $('[data-input="customSideMargin"]');
const rowCountEl     = $('[data-input="rowCount"]');
const gridSideMargin = $('[data-input="gridSideMargin"]');
const colGapEl       = $('[data-input="colGap"]');
const rowGapEl       = $('[data-input="rowGap"]');
const planList       = $('[data-plan-list]');
const gridPreview    = $('[data-grid-preview]');
const previewInfo    = $('[data-preview-info]');
const containerInfo  = $('[data-container-info]');

const tabs     = $$('.tool-body > .tabs > .tab-btn');
const views    = $$('[data-view]');
const sections = $$('[data-section]');

const colQuickBtns  = $$('.opt-row [data-cols]');
const marginRadios  = $$('[name="marginPref"]');
const styleTabs     = $$('[data-style]');
const spacingBlock  = $('[data-show="spacing"]');
const customBlock   = $('[data-show="custom-params"]');

/* ================= 状态 ================= */
let marginPref   = 'auto';     // '0' | 'auto' | 'custom'
let spacingStyle = 'balanced'; // 'compact' | 'balanced' | 'spacious'

/* ================= Tab 切换 ================= */
function switchTab(name) {
  tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
  views.forEach(v => v.hidden = v.dataset.view !== name);
  sections.forEach(s => s.hidden = s.dataset.section !== name);
  if (name === 'manual') updateGridPreview();
}
tabs.forEach(t => on(t, 'click', () => switchTab(t.dataset.tab)));

/* ================= 列数快捷选择 ================= */
function syncColQuickBtns() {
  const v = parseInt(desiredCols.value, 10);
  colQuickBtns.forEach(b => b.classList.toggle('is-active', parseInt(b.dataset.cols, 10) === v));
}
colQuickBtns.forEach(b => on(b, 'click', () => {
  desiredCols.value = b.dataset.cols;
  syncColQuickBtns();
  renderPlans();
}));
on(desiredCols, 'input', () => { syncColQuickBtns(); renderPlans(); });

/* ================= 边距偏好 ================= */
function syncMarginUI() {
  spacingBlock.hidden = marginPref === 'custom';
  customBlock.hidden  = marginPref !== 'custom';
}
marginRadios.forEach(r => on(r, 'change', () => {
  marginPref = r.value;
  syncMarginUI();
  renderPlans();
}));

/* ================= 间距风格 ================= */
styleTabs.forEach(t => on(t, 'click', () => {
  spacingStyle = t.dataset.style;
  styleTabs.forEach(x => x.classList.toggle('is-active', x === t));
  renderPlans();
}));

/* ================= 智能方案生成 ================= */
function generatePlans() {
  const width = parseInt(containerWidth.value, 10) || 1440;
  const cols  = parseInt(desiredCols.value, 10) || 12;
  const plans = [];

  if (marginPref === 'custom') {
    const gap = parseInt(customGap.value, 10) || 16;
    const sm  = parseInt(customMargin.value, 10) || 0;
    const cw  = Math.floor((width - gap * (cols - 1) - sm * 2) / cols);
    const tw  = cw * cols + gap * (cols - 1) + sm * 2;
    plans.push({
      name: '自定义布局', gap, sideMargin: sm, colWidth: cw, totalWidth: tw,
      description: `使用 ${gap}px 的列间距和 ${sm}px 的左右边距，总宽度 ${tw}px`
    });
  } else {
    let gapRange;
    switch (spacingStyle) {
      case 'compact':  gapRange = [8, 10, 12]; break;
      case 'spacious': gapRange = [28, 30, 32]; break;
      default:         gapRange = [16, 18, 20, 22, 24];
    }
    gapRange.forEach(gap => {
      let marginOptions;
      if (marginPref === '0') {
        marginOptions = [0];
      } else {
        switch (spacingStyle) {
          case 'compact':  marginOptions = [16, 20, 24]; break;
          case 'spacious': marginOptions = [32, 40, 48]; break;
          default:         marginOptions = [20, 24, 32];
        }
      }
      marginOptions.forEach(sm => {
        const cw = Math.floor((width - gap * (cols - 1) - sm * 2) / cols);
        const tw = cw * cols + gap * (cols - 1) + sm * 2;
        const label = spacingStyle === 'compact' ? '紧凑' : spacingStyle === 'spacious' ? '宽松' : '均衡';
        let name, desc;
        if (marginPref === '0') {
          name = `无边距${label}布局`;
          desc = `满屏布局，${gap}px 列间距，适合最大化内容展示`;
        } else {
          name = `${label}布局 (${gap}px间距/${sm}px边距)`;
          const twHtml = tw === width
            ? `<strong style="color:var(--color-brand)">${tw}px</strong>` : `${tw}px`;
          desc = `${gap}px 列间距，${sm}px 边距，总宽度 ${twHtml}`;
        }
        plans.push({ name, gap, sideMargin: sm, colWidth: cw, totalWidth: tw, description: desc });
      });
    });
    plans.sort((a, b) => {
      const da = Math.abs(a.totalWidth - width), db = Math.abs(b.totalWidth - width);
      return da !== db ? da - db : b.colWidth - a.colWidth;
    });
    if (plans.length > 8) plans.length = 8;
  }
  return plans;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function renderPlans() {
  const cols = parseInt(desiredCols.value, 10) || 12;
  const width = parseInt(containerWidth.value, 10) || 1440;
  const plans = generatePlans();

  planList.innerHTML = plans.map((p, i) => {
    const perfect = p.totalWidth === width;
    const cells = Array.from({ length: Math.min(cols, 16) }, () => '<div class="gl-plan-cell"></div>').join('');
    return `
      <div class="card">
        <div class="card-body">
          <div class="u-row u-between u-mb-2">
            <strong>${esc(p.name)}</strong>
            <div class="u-row u-gap-2">
              <button class="btn is-sm" type="button" data-copy-svg="${i}">复制 SVG</button>
              <button class="btn is-sm is-primary" type="button" data-apply="${i}">应用方案</button>
            </div>
          </div>
          <div class="gl-plan-mini" style="grid-template-columns:repeat(${Math.min(cols,16)},1fr);--plan-gap:${p.gap}px;--plan-margin:${p.sideMargin}px">${cells}</div>
          <div class="u-row u-gap-3" style="font-size:var(--text-sm)">
            <span class="u-muted">宽度</span><strong${perfect ? ' style="color:var(--color-brand)"' : ''}>${p.totalWidth}px</strong>
            <span class="u-muted">列宽</span><strong>${p.colWidth}px</strong>
            <span class="u-muted">间距</span><strong>${p.gap}px</strong>
            <span class="u-muted">边距</span><strong>${p.sideMargin}px</strong>
          </div>
        </div>
      </div>`;
  }).join('');

  $$('[data-apply]', planList).forEach(btn => on(btn, 'click', () =>
    exportPlanImage(plans[parseInt(btn.dataset.apply, 10)])
  ));
  $$('[data-copy-svg]', planList).forEach(btn => on(btn, 'click', () =>
    copySVG(plans[parseInt(btn.dataset.copySvg, 10)])
  ));
}

/* ================= 复制 SVG ================= */
function copySVG(plan) {
  const width = parseInt(containerWidth.value, 10) || 1440;
  const cols  = parseInt(desiredCols.value, 10) || 12;
  const h = 240, cellH = 120, top = 40, cw = plan.colWidth;

  let svg = `<svg width="${width}" height="${h}" viewBox="0 0 ${width} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>
    .gt{font-family:system-ui,sans-serif;font-size:16px;font-weight:600;fill:#1a1a1a}
    .gc{fill:#f0f9ff;stroke:#0ea5e9;stroke-width:1.5}
    .ma{fill:#fef3c7;fill-opacity:.6;stroke:#f59e0b;stroke-width:1;stroke-dasharray:3,3}
    .dl{stroke:#6b7280;stroke-width:1}
    .dt{font-family:system-ui,sans-serif;font-size:11px;fill:#6b7280}
    .gl2{stroke:#ef4444;stroke-width:1}
    .gt2{font-family:system-ui,sans-serif;font-size:10px;fill:#ef4444}
    .cn{font-family:system-ui,sans-serif;font-size:12px;fill:#0369a1;font-weight:500}
  </style></defs>
  <rect width="${width}" height="${h}" fill="#fff" stroke="#e5e7eb" rx="8"/>
  <text x="${width/2}" y="25" text-anchor="middle" class="gt">${esc(plan.name)}</text>`;

  if (plan.sideMargin > 0) {
    svg += `\n  <rect x="8" y="${top}" width="${Math.max(0,plan.sideMargin-8)}" height="${cellH}" class="ma"/>`;
    svg += `\n  <rect x="${width-plan.sideMargin}" y="${top}" width="${Math.max(0,plan.sideMargin-8)}" height="${cellH}" class="ma"/>`;
  }
  for (let i = 0; i < cols; i++) {
    const x = plan.sideMargin + i * (cw + plan.gap);
    svg += `\n  <rect x="${x}" y="${top}" width="${cw}" height="${cellH}" class="gc" rx="6"/>`;
    svg += `\n  <text x="${x+cw/2}" y="${top+cellH/2+4}" text-anchor="middle" class="cn">${i+1}</text>`;
  }
  const ay = top + cellH + 20;
  svg += `\n  <line x1="${plan.sideMargin}" y1="${ay}" x2="${plan.sideMargin+cw}" y2="${ay}" class="dl"/>`;
  svg += `\n  <text x="${plan.sideMargin+cw/2}" y="${ay+15}" text-anchor="middle" class="dt">${cw}px</text>`;
  if (plan.gap > 0 && cols > 1) {
    svg += `\n  <line x1="${plan.sideMargin+cw+2}" y1="${ay+10}" x2="${plan.sideMargin+cw+plan.gap-2}" y2="${ay+10}" class="gl2"/>`;
    svg += `\n  <text x="${plan.sideMargin+cw+plan.gap/2}" y="${ay+25}" text-anchor="middle" class="gt2">${plan.gap}px gap</text>`;
  }
  if (plan.sideMargin > 0) {
    svg += `\n  <line x1="8" y1="${top-10}" x2="${plan.sideMargin}" y2="${top-10}" class="dl"/>`;
    svg += `\n  <text x="${(8+plan.sideMargin)/2}" y="${top-15}" text-anchor="middle" class="dt">${plan.sideMargin}px</text>`;
  }
  svg += `\n  <text x="16" y="${h-20}" class="dt">容器: ${width}px | 列数: ${cols} | 列宽: ${cw}px | 间距: ${plan.gap}px | 边距: ${plan.sideMargin}px</text>`;
  svg += `\n</svg>`;

  navigator.clipboard.writeText(svg)
    .then(() => showToast('SVG 已复制，可直接粘贴到 Figma', { type: 'success' }))
    .catch(() => {
      const ta = Object.assign(document.createElement('textarea'), { value: svg });
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      showToast('SVG 已复制', { type: 'success' });
    });
}

/* ================= 导出方案 PNG ================= */
async function exportPlanImage(plan) {
  if (!window.html2canvas) { showToast('html2canvas 尚未加载', { type: 'warn' }); return; }
  const width = parseInt(containerWidth.value, 10) || 1440;
  const cols  = parseInt(desiredCols.value, 10) || 12;

  const wrap = document.createElement('div');
  wrap.style.cssText = `position:fixed;left:-99999px;top:0;width:${width}px;padding:20px;background:#fff;`;
  const grid = document.createElement('div');
  grid.style.cssText = `display:grid;grid-template-columns:repeat(${cols},${plan.colWidth}px);gap:${plan.gap}px;margin:0 ${plan.sideMargin}px;`;
  for (let i = 0; i < cols; i++) {
    const cell = document.createElement('div');
    cell.style.cssText = 'height:160px;background:rgba(99,102,241,.14);border:1px solid rgba(99,102,241,.6);border-radius:6px;';
    grid.appendChild(cell);
  }
  wrap.appendChild(grid); document.body.appendChild(wrap);
  try {
    const canvas = await window.html2canvas(wrap, { backgroundColor: '#fff', scale: 1, useCORS: true, logging: false });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `grid-${cols}cols-${plan.gap}gap.png`;
    a.click();
    showToast('布局方案已导出', { type: 'success' });
  } finally { wrap.remove(); }
}

/* ================= 网格预览（网格类型 tab） ================= */
function updateGridPreview() {
  const cols = parseInt(desiredCols.value, 10) || 12;
  const rows = parseInt(rowCountEl.value, 10) || 1;
  const cGap = parseInt(colGapEl.value, 10) || 0;
  const rGap = parseInt(rowGapEl.value, 10) || 0;
  const sm   = parseInt(gridSideMargin.value, 10) || 0;
  const cw   = parseInt(containerWidth.value, 10) || 1440;

  gridPreview.style.width = `${cw}px`;
  gridPreview.style.maxWidth = '100%';
  gridPreview.style.display = 'grid';
  gridPreview.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridPreview.style.gridTemplateRows = `repeat(${rows}, 60px)`;
  gridPreview.style.gap = `${rGap}px ${cGap}px`;
  gridPreview.style.padding = `20px ${sm}px`;
  gridPreview.innerHTML = Array.from({ length: cols * rows }, () => '<div class="grid-cell"></div>').join('');

  const colWidth = Math.max(0, Math.floor((cw - cGap * (cols - 1) - sm * 2) / cols));
  containerInfo.textContent = `${cw}px 容器`;
  previewInfo.innerHTML = `
    <div class="stat"><div class="stat-label">容器宽度</div><strong>${cw}px</strong></div>
    <div class="stat"><div class="stat-label">列数</div><strong>${cols}列</strong></div>
    <div class="stat"><div class="stat-label">列宽</div><strong>${colWidth}px</strong></div>
    <div class="stat"><div class="stat-label">列间距</div><strong>${cGap}px</strong></div>
    <div class="stat"><div class="stat-label">行间距</div><strong>${rGap}px</strong></div>
    <div class="stat"><div class="stat-label">左右边距</div><strong>${sm}px</strong></div>`;
}

/* ================= 导出当前网格 PNG ================= */
async function exportCurrentGrid() {
  if (!window.html2canvas) { showToast('html2canvas 尚未加载', { type: 'warn' }); return; }
  const cols = parseInt(desiredCols.value, 10) || 12;
  const rows = parseInt(rowCountEl.value, 10) || 1;
  const cGap = parseInt(colGapEl.value, 10) || 0;
  const rGap = parseInt(rowGapEl.value, 10) || 0;
  const sm   = parseInt(gridSideMargin.value, 10) || 0;
  const cw   = parseInt(containerWidth.value, 10) || 1440;

  const wrap = document.createElement('div');
  wrap.style.cssText = `position:fixed;left:-99999px;top:0;width:${cw}px;background:#fff;`;
  const grid = document.createElement('div');
  grid.style.cssText = `display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},60px);gap:${rGap}px ${cGap}px;padding:0 ${sm}px;width:${cw}px;box-sizing:border-box;`;
  for (let i = 0; i < cols * rows; i++) {
    const cell = document.createElement('div');
    cell.style.cssText = 'background:rgba(99,102,241,.14);border:1px solid rgba(99,102,241,.6);border-radius:6px;';
    grid.appendChild(cell);
  }
  wrap.appendChild(grid); document.body.appendChild(wrap);
  try {
    const canvas = await window.html2canvas(wrap, { backgroundColor: '#fff', scale: 1, useCORS: true, logging: false });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `grid-preview-${cw}.png`;
    a.click();
    showToast('网格预览已导出', { type: 'success' });
  } finally { wrap.remove(); }
}

/* ================= 复制 CSS ================= */
function copyCSS() {
  const cols = parseInt(desiredCols.value, 10) || 12;
  const cGap = parseInt(colGapEl.value, 10) || 0;
  const sm   = parseInt(gridSideMargin.value, 10) || 0;
  const cw   = parseInt(containerWidth.value, 10) || 1440;
  const css = `/* Grid Layout CSS */
.grid-container {
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    gap: ${cGap}px;
    padding: 0 ${sm}px;
    max-width: ${cw}px;
    margin: 0 auto;
}

.grid-item {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
}`;
  navigator.clipboard.writeText(css)
    .then(() => showToast('CSS 代码已复制', { type: 'success' }))
    .catch(() => {
      const ta = Object.assign(document.createElement('textarea'), { value: css });
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      showToast('CSS 代码已复制', { type: 'success' });
    });
}

/* ================= Stepper 按钮 ================= */
const stepMap = { cols: desiredCols, rows: rowCountEl, margin: gridSideMargin, colGap: colGapEl, rowGap: rowGapEl };
$$('[data-step]').forEach(btn => on(btn, 'click', () => {
  const target = stepMap[btn.dataset.step];
  if (!target) return;
  const dir = parseInt(btn.dataset.dir, 10);
  target.value = Math.max(parseInt(target.min,10), Math.min(parseInt(target.max,10), (parseInt(target.value,10)||0) + dir));
  if (btn.dataset.step === 'cols') { syncColQuickBtns(); renderPlans(); }
  else updateGridPreview();
}));

/* ================= 实时输入监听 ================= */
on(containerWidth, 'input', renderPlans);
[customGap, customMargin].forEach(el => on(el, 'input', renderPlans));
[rowCountEl, colGapEl, rowGapEl, gridSideMargin].forEach(el => on(el, 'input', updateGridPreview));

/* ================= 操作按钮 ================= */
on($('[data-action="generate"]'), 'click', renderPlans);
on($('[data-action="export"]'), 'click', exportCurrentGrid);
on($('[data-action="copyCSS"]'), 'click', copyCSS);

/* ================= 初始化 ================= */
syncMarginUI();
syncColQuickBtns();
renderPlans();
updateGridPreview();
switchTab('recommend');
