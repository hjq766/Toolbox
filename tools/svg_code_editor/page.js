import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { createEditor } from '../_shared/code-editor.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import {
  parseSvg as _parseSvg,
  sanitizeSvg as _sanitizeSvg,
  optimizeSvg as _optimizeSvg,
  serializeSvg as _serializeSvg,
  formatXml,
  minifyXml,
  PRESETS,
} from '../_shared/svg-optimize.js';
import { rgbNumToHex, parseCssColor } from '../../public/scripts/utils/color.js';

mountToolHeader();

const SVG_NS = 'http://www.w3.org/2000/svg';
const EXAMPLE = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="180" rx="20" fill="royalblue" opacity="0.8"/>
  <circle cx="100" cy="100" r="60" fill="white" opacity="0.9"/>
  <path d="M 70 100 L 90 120 L 130 80" stroke="royalblue" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const SELECTABLE = 'rect,circle,ellipse,line,polyline,polygon,path,text,use,image';
const COLOR_ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color', 'color'];

let originalSVG = '';
let selectedElement = null;
let suppressInput = false;

const COLOR_PICKER_FALLBACK = rgbNumToHex(0, 0, 0);
const WHITE_EXPORT_BG = rgbNumToHex(255, 255, 255);

const codeEl = $('[data-code]');
const fileEl = $('[data-file]');
const previewInner = $('[data-preview-inner]');
const previewBox = $('[data-preview]');
const statChars = $('[data-stat-chars]');
const statLines = $('[data-stat-lines]');
const statSize = $('[data-stat-size]');
const statDim = $('[data-stat-dim]');
const scaleInput = $('[data-png-scale]');
const pngBgInput = $('[data-png-bg]');
const pngBgColor = $('[data-png-bg-color]');
const paletteEl = $('[data-palette]');
const sizeWidth = $('[data-size-width]');
const sizeHeight = $('[data-size-height]');
const sizeViewBox = $('[data-size-viewbox]');
const a11yTitle = $('[data-a11y-title]');
const a11yDesc = $('[data-a11y-desc]');
const a11yLabel = $('[data-a11y-label]');
const drawer = $('[data-drawer]');
const elTab = $('[data-el-tab]');
const elForm = $('[data-el-form]');
const elEmpty = $('[data-el-empty]');

// formatXML / minifyXML / sanitize 由 _shared/svg-optimize.js 提供，editor 在此仅做封装

function roundNum(value, digits = 3) {
  return Number.parseFloat(Number(value).toFixed(digits));
}

function setCodeValue(value, { render = false, silent = false } = {}) {
  suppressInput = silent;
  codeEl.value = value ?? '';
  suppressInput = false;
  if (render) updatePreview();
}

function setPreviewMessage(message, type = 'muted') {
  const span = document.createElement('span');
  span.className = `sce-msg ${type === 'error' ? 'is-error' : ''}`;
  span.textContent = message;
  previewInner.replaceChildren(span);
}

function parseSVG(code, { sanitize = true } = {}) {
  const { doc, svg } = _parseSvg(code);
  if (sanitize) sanitizeSVG(svg);
  return { doc, svg };
}

function sanitizeSVG(svg) {
  _sanitizeSvg(svg);
  removeEditorArtifacts(svg);
  return svg;
}

function removeEditorArtifacts(svg) {
  [svg, ...svg.querySelectorAll('*')].forEach(el => {
    el.classList?.remove('is-selected');
    if (el.getAttribute('class') === '') el.removeAttribute('class');
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith('data-svg-editor')) el.removeAttribute(attr.name);
    });
  });
}

function serializeSVG(svg, { pretty = true, sanitize = true } = {}) {
  const clone = svg.cloneNode(true);
  if (sanitize) sanitizeSVG(clone);
  removeEditorArtifacts(clone);
  return _serializeSvg(clone, { pretty, minify: !pretty });
}

function getCleanSource({ pretty = true, sanitize = true } = {}) {
  const { svg } = parseSVG(codeEl.value.trim(), { sanitize });
  return serializeSVG(svg, { pretty, sanitize });
}

function parseViewBoxValue(value) {
  const nums = String(value || '').trim().split(/[\s,]+/).map(Number);
  return nums.length === 4 && nums.every(Number.isFinite) ? nums : null;
}

function parseSvgLength(value) {
  if (!value || String(value).includes('%')) return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function directChild(svg, tag) {
  return [...svg.children].find(el => el.localName?.toLowerCase() === tag) || null;
}

function openDrawer(mode = 'colors') {
  drawer.hidden = false;
  $$('[data-drawer-open]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.drawerOpen === mode);
  });
  $$('[data-drawer-panel]').forEach(panel => {
    panel.hidden = panel.dataset.drawerPanel !== mode;
  });
}

function closeDrawer() {
  drawer.hidden = true;
  $$('[data-drawer-open]').forEach(btn => btn.classList.remove('is-active'));
}

function syncPanelsFromSVG(svg) {
  sizeWidth.value = svg.getAttribute('width') || '';
  sizeHeight.value = svg.getAttribute('height') || '';
  sizeViewBox.value = svg.getAttribute('viewBox') || '';
  a11yTitle.value = directChild(svg, 'title')?.textContent || '';
  a11yDesc.value = directChild(svg, 'desc')?.textContent || '';
  a11yLabel.value = svg.getAttribute('aria-label') || '';
  renderPalette(svg);
}

function updatePreview() {
  const code = codeEl.value.trim();
  deselectElement();

  if (!code) {
    setPreviewMessage('在左侧输入 SVG 代码');
    updateStats();
    renderPalette(null);
    return;
  }

  try {
    const { svg } = parseSVG(code, { sanitize: true });
    const previewSvg = document.importNode(svg, true);
    previewInner.replaceChildren(previewSvg);
    setupElementSelection(previewSvg);
    syncPanelsFromSVG(previewSvg);
  } catch (err) {
    setPreviewMessage(err.message, 'error');
  }
  updateStats();
}

function updateStats() {
  const code = codeEl.value;
  statChars.textContent = `${code.length} 字符`;
  statLines.textContent = `${code ? code.split('\n').length : 0} 行`;
  statSize.textContent = `${(new Blob([code]).size / 1024).toFixed(2)} KB`;

  const svg = previewInner.querySelector('svg');
  if (!svg) {
    statDim.textContent = '';
    return;
  }
  const vb = parseViewBoxValue(svg.getAttribute('viewBox'));
  const w = svg.getAttribute('width') || vb?.[2] || 'auto';
  const h = svg.getAttribute('height') || vb?.[3] || 'auto';
  statDim.textContent = `${w} × ${h}`;
}

function loadSVG(text, msg) {
  setCodeValue(text, { render: true });
  originalSVG = text;
  if (msg) showToast(msg);
}

function readSVGFile(file) {
  if (!file) return;
  if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
    showToast('仅支持 SVG 文件', { type: 'warn' });
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => loadSVG(ev.target.result, '文件已加载');
  reader.readAsText(file);
}

function setupElementSelection(svg) {
  svg.querySelectorAll(SELECTABLE).forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      selectElement(el);
    });
  });
  svg.addEventListener('click', () => deselectElement());
}

function selectElement(el) {
  deselectElement();
  selectedElement = el;
  el.classList.add('is-selected');
  $('[data-el-title]').textContent = `<${el.tagName.toLowerCase()}>`;

  const fill = el.getAttribute('fill') || COLOR_PICKER_FALLBACK;
  const fillOp = Math.round(parseFloat(el.getAttribute('fill-opacity') ?? '1') * 100);
  const stroke = el.getAttribute('stroke') || 'none';
  const strokeW = parseFloat(el.getAttribute('stroke-width') || '1');
  const strokeOp = Math.round(parseFloat(el.getAttribute('stroke-opacity') ?? '1') * 100);

  const isHex = c => /^#[0-9a-f]{3,8}$/i.test(c);
  $('[data-el-fill]').value = isHex(fill) ? fill : COLOR_PICKER_FALLBACK;
  $('[data-el-fill-text]').value = fill;
  $('[data-el-fill-opacity]').value = fillOp;
  $('[data-el-fill-opacity-val]').textContent = `${fillOp}%`;
  $('[data-el-stroke]').value = isHex(stroke) ? stroke : COLOR_PICKER_FALLBACK;
  $('[data-el-stroke-text]').value = stroke;
  $('[data-el-stroke-w]').value = strokeW;
  $('[data-el-stroke-w-val]').textContent = strokeW;
  $('[data-el-stroke-opacity]').value = strokeOp;
  $('[data-el-stroke-opacity-val]').textContent = `${strokeOp}%`;

  // 元素面板从「未选中」切为表单态，顶部「元素」tab 显现并打开 drawer
  elEmpty.hidden = true;
  elForm.hidden = false;
  elTab.hidden = false;
  openDrawer('element');
}

function deselectElement() {
  if (selectedElement) {
    selectedElement.classList.remove('is-selected');
    selectedElement = null;
  }
  // 面板保留在 drawer 中，只是回到提示态，避免反复点击时面板闪动
  elEmpty.hidden = false;
  elForm.hidden = true;
}

function syncCodeFromPreview() {
  const svg = previewInner.querySelector('svg');
  if (!svg) return;
  setCodeValue(serializeSVG(svg), { silent: true });
  updateStats();
  syncPanelsFromSVG(svg);
}

function getMaxStrokePadding(svg) {
  let max = 0;
  svg.querySelectorAll(SELECTABLE).forEach(el => {
    const stroke = el.getAttribute('stroke');
    if (stroke && stroke !== 'none' && stroke !== 'transparent') {
      const w = parseFloat(el.getAttribute('stroke-width') || '1');
      if (Number.isFinite(w)) max = Math.max(max, w / 2);
    }
  });
  return max;
}

function doTrim(safe) {
  const code = codeEl.value.trim();
  if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });

  let tmp = null;
  try {
    const { svg } = parseSVG(code, { sanitize: true });
    const tmpSvg = document.importNode(svg, true);
    tmp = document.createElement('div');
    tmp.className = 'sce-measure';
    tmp.appendChild(tmpSvg);
    document.body.appendChild(tmp);

    const bbox = tmpSvg.getBBox();
    const strokePad = getMaxStrokePadding(tmpSvg);
    document.body.removeChild(tmp);

    if (!bbox || bbox.width === 0 || bbox.height === 0) {
      showToast('无法计算边界', { type: 'error' });
      return;
    }

    let x = bbox.x - strokePad;
    let y = bbox.y - strokePad;
    let w = bbox.width + strokePad * 2;
    let h = bbox.height + strokePad * 2;
    if (safe) {
      const px = w * 0.1;
      const py = h * 0.1;
      x -= px; y -= py; w += px * 2; h += py * 2;
    }

    svg.setAttribute('viewBox', `${roundNum(x)} ${roundNum(y)} ${roundNum(w)} ${roundNum(h)}`);
    svg.setAttribute('width', String(Math.round(w)));
    svg.setAttribute('height', String(Math.round(h)));

    setCodeValue(serializeSVG(svg), { render: true });
    showToast(`${safe ? '安全' : '精确'}裁剪完成 ${Math.round(w)}×${Math.round(h)}`);
  } catch (err) {
    if (tmp?.parentNode) tmp.parentNode.removeChild(tmp);
    showToast(`裁剪失败：${err.message}`, { type: 'error' });
  }
}

function optimizeSVG() {
  const code = codeEl.value.trim();
  if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });

  try {
    const before = new Blob([code]).size;
    const { svg } = parseSVG(code, { sanitize: true });
    _optimizeSvg(svg, { ...PRESETS.balanced, minifyWhitespace: false });
    const next = serializeSVG(svg, { pretty: true, sanitize: true });
    const after = new Blob([next]).size;
    setCodeValue(next, { render: true });
    showToast(`优化完成，体积 ${formatBytes(before)} → ${formatBytes(after)}`, { type: 'success' });
  } catch (err) {
    showToast(`优化失败：${err.message}`, { type: 'error' });
  }
}

function formatBytes(bytes) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(2)} KB`;
}

function doSanitize() {
  const code = codeEl.value.trim();
  if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });
  try {
    const next = getCleanSource({ pretty: true, sanitize: true });
    setCodeValue(next, { render: true });
    showToast('危险脚本、事件属性与编辑器痕迹已清理', { type: 'success' });
  } catch (err) {
    showToast(`清理失败：${err.message}`, { type: 'error' });
  }
}

function applySize() {
  try {
    const { svg } = parseSVG(codeEl.value.trim(), { sanitize: true });
    const w = sizeWidth.value.trim();
    const h = sizeHeight.value.trim();
    const vb = sizeViewBox.value.trim();

    w ? svg.setAttribute('width', w) : svg.removeAttribute('width');
    h ? svg.setAttribute('height', h) : svg.removeAttribute('height');
    if (vb) {
      if (!parseViewBoxValue(vb)) return showToast('viewBox 需要 4 个数字', { type: 'warn' });
      svg.setAttribute('viewBox', vb);
    } else {
      svg.removeAttribute('viewBox');
    }

    setCodeValue(serializeSVG(svg), { render: true });
    showToast('尺寸已应用');
  } catch (err) {
    showToast(`应用失败：${err.message}`, { type: 'error' });
  }
}

function sizeFromViewBox() {
  const vb = parseViewBoxValue(sizeViewBox.value);
  if (!vb) return showToast('当前没有可用 viewBox', { type: 'warn' });
  sizeWidth.value = String(roundNum(vb[2]));
  sizeHeight.value = String(roundNum(vb[3]));
  applySize();
}

function collectColors(svg) {
  if (!svg) return [];
  const colors = new Map();
  [svg, ...svg.querySelectorAll('*')].forEach(el => {
    COLOR_ATTRS.forEach(attr => addColor(colors, el.getAttribute(attr), attr));
    const style = el.getAttribute('style') || '';
    for (const match of style.matchAll(/(?:fill|stroke|stop-color|flood-color|lighting-color|color)\s*:\s*([^;]+)/gi)) {
      addColor(colors, match[1], 'style');
    }
  });
  return [...colors.values()];
}

function addColor(map, value, source) {
  const color = String(value || '').trim();
  if (!color || /^(none|transparent|inherit|initial|unset)$/i.test(color) || /^url\(/i.test(color)) return;
  const key = color.toLowerCase();
  if (!map.has(key)) {
    map.set(key, { value: color, count: 0, sources: new Set() });
  }
  const item = map.get(key);
  item.count++;
  if (source) item.sources.add(source);
}

function renderPalette(svg) {
  const colors = collectColors(svg);
  paletteEl.replaceChildren();
  if (!colors.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = '当前 SVG 没有检测到可替换的填充、描边或渐变颜色。';
    paletteEl.appendChild(empty);
    return;
  }

  colors.slice(0, 40).forEach(asset => {
    const pickerValue = colorToPickerValue(asset.value);
    const row = document.createElement('div');
    row.className = 'card';
    row.dataset.color = asset.value;
    const body = document.createElement('div');
    body.className = 'card-body u-col u-gap-2';
    const head = document.createElement('div');
    head.className = 'u-row u-gap-3 u-min-0';

    const swatch = document.createElement('span');
    swatch.className = 'sce-swatch';
    const swatchFill = document.createElement('span');
    swatchFill.className = 'sce-swatch-fill';
    swatchFill.style.background = asset.value;
    swatch.appendChild(swatchFill);

    const info = document.createElement('div');
    info.className = 'u-min-0 u-grow';
    const value = document.createElement('div');
    value.className = 'u-mono u-text-sm u-strong u-truncate';
    value.title = asset.value;
    value.textContent = asset.value;
    const meta = document.createElement('div');
    meta.className = 'u-muted u-text-xs';
    meta.textContent = `${asset.count} 处 · ${[...asset.sources].join(' / ')}`;
    info.append(value, meta);
    head.append(swatch, info);

    const edit = document.createElement('div');
    edit.className = 'u-row u-gap-2';
    const arrow = document.createElement('span');
    arrow.className = 'u-muted u-text-xs u-no-shrink';
    arrow.textContent = '改为';
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.dataset.colorPicker = '';
    picker.value = pickerValue;
    picker.title = '点击选择新颜色';
    const replace = document.createElement('button');
    replace.className = 'btn is-sm is-primary';
    replace.type = 'button';
    replace.dataset.colorAction = 'replace';
    replace.textContent = `替换所有 ${asset.count} 处`;
    edit.append(arrow, picker, replace);

    const current = document.createElement('button');
    current.className = 'btn is-sm is-ghost is-block';
    current.type = 'button';
    current.dataset.colorAction = 'current';
    current.title = '将此颜色换为 currentColor 关键字，这样 SVG 的颜色会被外部 CSS 的 color 属性控制。适合做可以随主题变色的图标。';
    current.textContent = '改用 currentColor（跟随 CSS 颜色）';

    body.append(head, edit, current);
    row.appendChild(body);
    paletteEl.appendChild(row);
  });
}

function colorToPickerValue(color) {
  const value = String(color || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  const short = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) return `#${short.slice(1).map(v => v + v).join('')}`;
  // 利用浏览器解析命名色 / rgb() / rgba() / hsl() 等任意 CSS 颜色字符串
  try {
    const probe = document.createElement('span');
    probe.style.display = 'none';
    probe.style.color = value;
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    document.body.removeChild(probe);
    const hex = parseCssColor(computed);
    if (hex) return hex;
  } catch {}
  return COLOR_PICKER_FALLBACK;
}

function replaceColorInSVG(from, to) {
  if (!from || !to) return showToast('请填写替换前后的颜色', { type: 'warn' });

  try {
    const { svg } = parseSVG(codeEl.value.trim(), { sanitize: true });
    const lowerFrom = from.toLowerCase();
    let count = 0;

    [svg, ...svg.querySelectorAll('*')].forEach(el => {
      COLOR_ATTRS.forEach(attr => {
        const value = el.getAttribute(attr);
        if (value && value.trim().toLowerCase() === lowerFrom) {
          el.setAttribute(attr, to);
          count++;
        }
      });

      const style = el.getAttribute('style');
      if (style) {
        const next = style.replace(/((?:fill|stroke|stop-color|flood-color|lighting-color|color)\s*:\s*)([^;]+)/gi, (all, prop, value) => {
          if (value.trim().toLowerCase() !== lowerFrom) return all;
          count++;
          return `${prop}${to}`;
        });
        el.setAttribute('style', next);
      }
    });

    if (!count) {
      showToast('没有找到匹配颜色', { type: 'warn' });
      return false;
    }
    setCodeValue(serializeSVG(svg), { render: true });
    showToast(`已替换 ${count} 处颜色`, { type: 'success' });
    return true;
  } catch (err) {
    showToast(`替换失败：${err.message}`, { type: 'error' });
    return false;
  }
}

function convertToCurrentColor(color = '') {
  const svg = previewInner.querySelector('svg');
  const firstColor = color || collectColors(svg)[0]?.value;
  if (!firstColor) return showToast('没有可转换的颜色', { type: 'warn' });
  if (!replaceColorInSVG(firstColor, 'currentColor')) return;
  try {
    const { svg: parsed } = parseSVG(codeEl.value.trim(), { sanitize: true });
    if (!parsed.getAttribute('color')) parsed.setAttribute('color', firstColor);
    setCodeValue(serializeSVG(parsed), { render: true });
  } catch {
    /* replaceColorInSVG 已处理错误提示 */
  }
}

function getSvgDimensions(svg) {
  const vb = parseViewBoxValue(svg.getAttribute('viewBox'));
  const width = parseSvgLength(svg.getAttribute('width')) || vb?.[2] || 800;
  const height = parseSvgLength(svg.getAttribute('height')) || vb?.[3] || 600;
  return { width, height };
}

function getExportBackground() {
  const mode = pngBgInput.value;
  if (mode === 'white') return WHITE_EXPORT_BG;
  if (mode === 'dark') return colorHex(0, 0, 0);
  if (mode === 'custom') {
    const custom = pngBgText.value.trim();
    if (custom && globalThis.CSS?.supports?.('color', custom)) return custom;
    return pngBgColor.value || WHITE_EXPORT_BG;
  }
  return null;
}

function doExportPNG() {
  const code = codeEl.value.trim();
  if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });

  try {
    const { svg } = parseSVG(code, { sanitize: true });
    const { width, height } = getSvgDimensions(svg);
    const scale = parseInt(scaleInput.querySelector('.is-active')?.dataset.scale, 10) || 2;
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    const bg = getExportBackground();
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    }

    const svgText = serializeSVG(svg, { pretty: false, sanitize: true });
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) return showToast('PNG 导出失败，画布无法生成图片', { type: 'error' });
        downloadBlob(blob, 'svg-export.png');
        showToast(`PNG ${canvas.width}×${canvas.height} 导出成功`, { type: 'success' });
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('PNG 导出失败，SVG 可能包含外链资源或不支持内容', { type: 'error' });
    };
    img.src = url;
  } catch (err) {
    showToast(`PNG 导出失败：${err.message}`, { type: 'error' });
  }
}

function svgToDataURI() {
  const svgText = getCleanSource({ pretty: false, sanitize: true });
  return `data:image/svg+xml,${encodeURIComponent(svgText)}`;
}

function applyA11y(clear = false) {
  try {
    const { svg, doc } = parseSVG(codeEl.value.trim(), { sanitize: true });
    directChild(svg, 'title')?.remove();
    directChild(svg, 'desc')?.remove();
    svg.removeAttribute('aria-label');
    svg.removeAttribute('aria-labelledby');

    if (!clear) {
      const ids = [];
      const title = a11yTitle.value.trim();
      const desc = a11yDesc.value.trim();
      const label = a11yLabel.value.trim();

      if (title) {
        const node = doc.createElementNS(SVG_NS, 'title');
        node.setAttribute('id', 'svg-title');
        node.textContent = title;
        svg.insertBefore(node, svg.firstChild);
        ids.push('svg-title');
      }
      if (desc) {
        const node = doc.createElementNS(SVG_NS, 'desc');
        node.setAttribute('id', 'svg-desc');
        node.textContent = desc;
        svg.insertBefore(node, directChild(svg, 'title')?.nextSibling || svg.firstChild);
        ids.push('svg-desc');
      }
      if (label) svg.setAttribute('aria-label', label);
      else if (ids.length) svg.setAttribute('aria-labelledby', ids.join(' '));
      if (label || ids.length) svg.setAttribute('role', 'img');
    } else {
      svg.removeAttribute('role');
    }

    setCodeValue(serializeSVG(svg), { render: true });
    showToast(clear ? '无障碍信息已清空' : '无障碍信息已应用', { type: 'success' });
  } catch (err) {
    showToast(`无障碍信息处理失败：${err.message}`, { type: 'error' });
  }
}

const debouncedPreview = debounce(updatePreview, 250);
on(codeEl, 'input', () => {
  if (!suppressInput) debouncedPreview();
});

initUploadZone({
  dropEl: $('[data-drop]'),
  fileEl,
  onFiles: (files) => readSVGFile(files[0]),
  accept: '*',
  multiple: false,
});

document.addEventListener('paste', e => {
  if (document.activeElement === codeEl) return;
  if (codeEl._cm && codeEl._cm.hasFocus()) return;
  const text = e.clipboardData.getData('text');
  if (text && text.trim().match(/^(<\?xml|<svg)/i)) {
    loadSVG(text, '已粘贴 SVG');
    e.preventDefault();
  }
});

on($('[data-bg-row]'), 'click', e => {
  const btn = e.target.closest('[data-bg]');
  if (!btn) return;
  $$('[data-bg-row] [data-bg]').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  previewBox.classList.remove('is-bg-checker', 'is-bg-white', 'is-bg-dark', 'is-bg-none');
  previewBox.classList.add(`is-bg-${btn.dataset.bg}`);
});

on(scaleInput, 'click', e => {
  const btn = e.target.closest('[data-scale]');
  if (!btn) return;
  $$('[data-scale]', scaleInput).forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
});

const pngBgCustom = $('[data-png-bg-custom]');
const pngBgText = $('[data-png-bg-text]');
on(pngBgInput, 'change', () => {
  pngBgCustom.hidden = pngBgInput.value !== 'custom';
});
on(pngBgColor, 'input', () => { pngBgText.value = pngBgColor.value; });
on(pngBgText, 'input', () => {
  const v = pngBgText.value.trim();
  if (v && globalThis.CSS?.supports?.('color', v)) pngBgColor.value = colorToPickerValue(v);
});

on(document, 'click', e => {
  const drawerBtn = e.target.closest('[data-drawer-open]');
  if (drawerBtn) {
    openDrawer(drawerBtn.dataset.drawerOpen);
  }
});

on(paletteEl, 'click', e => {
  const btn = e.target.closest('[data-color-action]');
  if (!btn) return;
  const row = btn.closest('[data-color]');
  const original = row.dataset.color;

  if (btn.dataset.colorAction === 'replace') {
    const picker = row.querySelector('[data-color-picker]');
    replaceColorInSVG(original, picker.value);
  } else if (btn.dataset.colorAction === 'current') {
    convertToCurrentColor(original);
  }
});

on($('[data-el-close]'), 'click', deselectElement);

on($('[data-el-fill]'), 'input', e => {
  if (!selectedElement) return;
  $('[data-el-fill-text]').value = e.target.value;
  selectedElement.setAttribute('fill', e.target.value);
  syncCodeFromPreview();
});
on($('[data-el-fill-text]'), 'change', e => {
  if (!selectedElement) return;
  selectedElement.setAttribute('fill', e.target.value);
  if (/^#[0-9a-f]{3,8}$/i.test(e.target.value)) $('[data-el-fill]').value = e.target.value;
  syncCodeFromPreview();
});
on($('[data-el-fill-opacity]'), 'input', e => {
  if (!selectedElement) return;
  $('[data-el-fill-opacity-val]').textContent = `${e.target.value}%`;
  selectedElement.setAttribute('fill-opacity', e.target.value / 100);
  syncCodeFromPreview();
});
on($('[data-el-stroke]'), 'input', e => {
  if (!selectedElement) return;
  $('[data-el-stroke-text]').value = e.target.value;
  selectedElement.setAttribute('stroke', e.target.value);
  syncCodeFromPreview();
});
on($('[data-el-stroke-text]'), 'change', e => {
  if (!selectedElement) return;
  selectedElement.setAttribute('stroke', e.target.value);
  if (/^#[0-9a-f]{3,8}$/i.test(e.target.value)) $('[data-el-stroke]').value = e.target.value;
  syncCodeFromPreview();
});
on($('[data-el-stroke-w]'), 'input', e => {
  if (!selectedElement) return;
  $('[data-el-stroke-w-val]').textContent = e.target.value;
  selectedElement.setAttribute('stroke-width', e.target.value);
  syncCodeFromPreview();
});
on($('[data-el-stroke-opacity]'), 'input', e => {
  if (!selectedElement) return;
  $('[data-el-stroke-opacity-val]').textContent = `${e.target.value}%`;
  selectedElement.setAttribute('stroke-opacity', e.target.value / 100);
  syncCodeFromPreview();
});

on(document, 'click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  switch (btn.dataset.action) {
    case 'format': {
      const code = codeEl.value.trim();
      if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });
      try {
        const next = getCleanSource({ pretty: true, sanitize: false });
        setCodeValue(next, { render: true });
        showToast('格式化完成');
      } catch (err) {
        showToast(`格式化失败：${err.message}`, { type: 'error' });
      }
      break;
    }
    case 'minify': {
      const code = codeEl.value.trim();
      if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });
      try {
        const next = getCleanSource({ pretty: false, sanitize: false });
        setCodeValue(next, { render: true });
        showToast('压缩完成');
      } catch (err) {
        showToast(`压缩失败：${err.message}`, { type: 'error' });
      }
      break;
    }
    case 'sanitize': doSanitize(); break;
    case 'optimize': optimizeSVG(); break;
    case 'trim': doTrim(false); break;
    case 'trim-safe': doTrim(true); break;
    case 'apply-size': applySize(); break;
    case 'size-from-viewbox': sizeFromViewBox(); break;
    case 'copy-data-uri': {
      try {
        copyText(svgToDataURI()).then(ok => showToast(ok ? 'Data URI 已复制' : '复制失败', { type: ok ? 'success' : 'error' }));
      } catch (err) {
        showToast(`复制失败：${err.message}`, { type: 'error' });
      }
      break;
    }
    case 'copy-css-bg': {
      try {
        const css = `background-image: url("${svgToDataURI()}");`;
        copyText(css).then(ok => showToast(ok ? 'CSS 背景已复制' : '复制失败', { type: ok ? 'success' : 'error' }));
      } catch (err) {
        showToast(`复制失败：${err.message}`, { type: 'error' });
      }
      break;
    }
    case 'apply-a11y': applyA11y(false); break;
    case 'clear-a11y': applyA11y(true); break;
    case 'copy': {
      const code = codeEl.value.trim();
      if (!code) return showToast('没有可复制的内容', { type: 'warn' });
      copyText(code).then(ok => showToast(ok ? '已复制到剪贴板' : '复制失败', { type: ok ? 'success' : 'error' }));
      break;
    }
    case 'dl-svg': {
      const code = codeEl.value.trim();
      if (!code) return showToast('没有可下载的内容', { type: 'warn' });
      downloadBlob(new Blob([code], { type: 'image/svg+xml' }), 'image.svg');
      break;
    }
    case 'dl-png': doExportPNG(); break;
    case 'reset': {
      if (!originalSVG) return showToast('没有可恢复的原始 SVG', { type: 'warn' });
      setCodeValue(originalSVG, { render: true });
      showToast('已恢复');
      break;
    }
    case 'clear': {
      setCodeValue('', { render: true });
      originalSVG = '';
      showToast('已清空');
      break;
    }
    case 'load-example': {
      loadSVG(EXAMPLE, '示例已加载');
      break;
    }
  }
});

pngBgColor.value = WHITE_EXPORT_BG;
pngBgText.value = WHITE_EXPORT_BG;

// 检查从其他工具（如 svg_compress）跳转过来的 SVG handoff
const handoff = readHandoff();
const initialCode = handoff?.code || EXAMPLE;
setCodeValue(initialCode, { render: true });
originalSVG = initialCode;
if (handoff) showToast(`已载入：${handoff.name || 'SVG'}`, { type: 'success' });
openDrawer('colors');

function readHandoff() {
  try {
    const raw = sessionStorage.getItem('svg-handoff');
    if (!raw) return null;
    sessionStorage.removeItem('svg-handoff');
    const data = JSON.parse(raw);
    // 5 分钟内有效，避免历史残留
    if (!data?.code || Date.now() - (data.ts || 0) > 5 * 60 * 1000) return null;
    return data;
  } catch { return null; }
}
createEditor(codeEl, { mode: 'xml' });
