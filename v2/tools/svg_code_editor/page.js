import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { createEditor } from '../_shared/code-editor.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

/* ====================== 1. 常量 / 配置 ====================== */
const EXAMPLE = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="180" rx="20" fill="#3366FF" opacity="0.8"/>
  <circle cx="100" cy="100" r="60" fill="#fff" opacity="0.9"/>
  <path d="M 70 100 L 90 120 L 130 80" stroke="#3366FF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const SELECTABLE = 'rect,circle,ellipse,line,polyline,polygon,path,text,use,image';

/* ====================== 2. 状态 ====================== */
let originalSVG     = '';
let selectedElement = null;

/* ====================== 3. DOM 引用 ====================== */
const codeEl       = $('[data-code]');
const fileEl       = $('[data-file]');
const previewInner = $('[data-preview-inner]');
const previewBox   = $('[data-preview]');
const bgLayer      = $('[data-bg-layer]');
const elPanel      = $('[data-el-panel]');
const statChars    = $('[data-stat-chars]');
const statLines    = $('[data-stat-lines]');
const statSize     = $('[data-stat-size]');
const statDim      = $('[data-stat-dim]');
const scaleInput   = $('[data-png-scale]');

/* ====================== 4. 工具函数 ====================== */

/* --- 格式化 XML --- */
function formatXML(xml) {
  let result = '';
  let indent = 0;
  const tab = '  ';
  const tokens = xml.replace(/>\s*</g, '>\n<').split('\n');

  for (const token of tokens) {
    const t = token.trim();
    if (!t) continue;
    if (/^<\//.test(t)) indent = Math.max(0, indent - 1);
    result += tab.repeat(indent) + t + '\n';
    if (/^<[^\/!?][^>]*[^\/]>$/.test(t) && !/<\//.test(t)) indent++;
  }
  return result.trim();
}

/* --- 压缩 XML --- */
function minifyXML(xml) {
  return xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* --- 更新预览 --- */
function updatePreview() {
  const code = codeEl.value.trim();
  deselectElement();

  if (!code) {
    previewInner.innerHTML = '<span class="u-muted">在左侧输入 SVG 代码</span>';
    updateStats();
    return;
  }
  try {
    const doc = new DOMParser().parseFromString(code, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('SVG 格式错误');
    previewInner.innerHTML = code;
    const svg = previewInner.querySelector('svg');
    if (svg) {
      svg.style.maxWidth = '100%';
      svg.style.maxHeight = '100%';
      svg.style.border = '1px dashed var(--color-brand-ring)';
      setupElementSelection(svg);
    }
  } catch (err) {
    previewInner.innerHTML = `<span style="color:var(--color-danger)">${err.message}</span>`;
  }
  updateStats();
}

/* --- 统计信息 --- */
function updateStats() {
  const code = codeEl.value;
  statChars.textContent = code.length + ' 字符';
  statLines.textContent = code.split('\n').length + ' 行';
  statSize.textContent = (new Blob([code]).size / 1024).toFixed(2) + ' KB';

  const svg = previewInner.querySelector('svg');
  if (svg) {
    const vb = svg.viewBox?.baseVal;
    const w = svg.getAttribute('width') || (vb?.width) || 'auto';
    const h = svg.getAttribute('height') || (vb?.height) || 'auto';
    statDim.textContent = `${w} × ${h}`;
  } else {
    statDim.textContent = '';
  }
}

/* --- 加载 SVG --- */
function loadSVG(text, msg) {
  codeEl.value = text;
  originalSVG = text;
  updatePreview();
  if (msg) showToast(msg);
}

/* --- 读取文件 --- */
function readSVGFile(file) {
  if (!file) return;
  if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
    return showToast('仅支持 SVG 文件', { type: 'warn' });
  }
  const reader = new FileReader();
  reader.onload = ev => loadSVG(ev.target.result, '文件已加载');
  reader.readAsText(file);
}

/* --- 元素选择 --- */
function setupElementSelection(svg) {
  svg.querySelectorAll(SELECTABLE).forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', e => { e.stopPropagation(); selectElement(el); });
  });
  svg.addEventListener('click', () => deselectElement());
}

function selectElement(el) {
  deselectElement();
  selectedElement = el;
  el.style.outline = '2px dashed var(--color-brand)';
  el.style.outlineOffset = '2px';

  $('[data-el-title]').textContent = `<${el.tagName.toLowerCase()}>`;

  const fill     = el.getAttribute('fill') || '#000000';
  const fillOp   = Math.round(parseFloat(el.getAttribute('fill-opacity') ?? '1') * 100);
  const stroke   = el.getAttribute('stroke') || 'none';
  const strokeW  = parseFloat(el.getAttribute('stroke-width') || '1');
  const strokeOp = Math.round(parseFloat(el.getAttribute('stroke-opacity') ?? '1') * 100);

  const isHex = c => /^#[0-9a-f]{3,8}$/i.test(c);
  $('[data-el-fill]').value          = isHex(fill) ? fill : '#000000';
  $('[data-el-fill-text]').value     = fill;
  $('[data-el-fill-opacity]').value  = fillOp;
  $('[data-el-fill-opacity-val]').textContent = fillOp + '%';
  $('[data-el-stroke]').value        = isHex(stroke) ? stroke : '#000000';
  $('[data-el-stroke-text]').value   = stroke;
  $('[data-el-stroke-w]').value      = strokeW;
  $('[data-el-stroke-w-val]').textContent = strokeW;
  $('[data-el-stroke-opacity]').value = strokeOp;
  $('[data-el-stroke-opacity-val]').textContent = strokeOp + '%';

  elPanel.hidden = false;
}

function deselectElement() {
  if (selectedElement) {
    selectedElement.style.outline = '';
    selectedElement.style.outlineOffset = '';
    selectedElement = null;
  }
  elPanel.hidden = true;
}

function syncCodeFromPreview() {
  const svg = previewInner.querySelector('svg');
  if (svg) {
    codeEl.value = formatXML(new XMLSerializer().serializeToString(svg));
    updateStats();
  }
}

/* --- 裁剪 viewBox --- */
function doTrim(safe) {
  const code = codeEl.value.trim();
  if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });

  try {
    const tmp = document.createElement('div');
    tmp.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    tmp.innerHTML = code;
    document.body.appendChild(tmp);
    const svg = tmp.querySelector('svg');
    if (!svg) { document.body.removeChild(tmp); return showToast('未找到 SVG 元素', { type: 'error' }); }

    const hidden = [];
    svg.querySelectorAll('*').forEach(el => {
      const f = el.getAttribute('fill'), s = el.getAttribute('stroke'), o = el.getAttribute('opacity');
      if (f === 'transparent' || (f === 'none' && (!s || s === 'none')) || o === '0') {
        hidden.push({ el, parent: el.parentNode });
        el.remove();
      }
    });

    const bbox = svg.getBBox();
    hidden.forEach(({ el, parent }) => parent.appendChild(el));
    document.body.removeChild(tmp);

    if (!bbox || bbox.width === 0 || bbox.height === 0) return showToast('无法计算边界', { type: 'error' });

    const doc = new DOMParser().parseFromString(code, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    let x = bbox.x, y = bbox.y, w = bbox.width, h = bbox.height;
    if (safe) {
      const px = w * 0.1, py = h * 0.1;
      x -= px; y -= py; w += px * 2; h += py * 2;
    }
    svgEl.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    svgEl.setAttribute('width', Math.round(w));
    svgEl.setAttribute('height', Math.round(h));

    codeEl.value = formatXML(new XMLSerializer().serializeToString(svgEl));
    updatePreview();
    showToast(`${safe ? '安全' : '精确'}裁剪完成 ${Math.round(w)}×${Math.round(h)}`);
  } catch (err) {
    showToast('裁剪失败：' + err.message, { type: 'error' });
  }
}

/* --- 导出 PNG --- */
function doExportPNG() {
  const svg = previewInner.querySelector('svg');
  if (!svg) return showToast('请先输入 SVG 代码', { type: 'warn' });

  const vb = svg.viewBox?.baseVal;
  let w = parseInt(svg.getAttribute('width'))  || (vb?.width) || 800;
  let h = parseInt(svg.getAttribute('height')) || (vb?.height) || 600;
  const scale = parseInt(scaleInput.value) || 2;

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const clone = svg.cloneNode(true);
  clone.setAttribute('width', w);
  clone.setAttribute('height', h);
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob(blob => {
      downloadBlob(blob, 'svg-export.png');
      showToast(`PNG ${w * scale}×${h * scale} 导出成功`, { type: 'success' });
    }, 'image/png');
  };
  img.onerror = () => showToast('PNG 导出失败，SVG 可能包含不支持的内容', { type: 'error' });
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
}

/* ====================== 5. 事件绑定 ====================== */

/* --- 代码输入 → 实时预览 --- */
on(codeEl, 'input', debounce(updatePreview, 250));

/* --- 文件上传 + 拖拽（全局蒙层反馈） --- */
initUploadZone({
  dropEl: fileEl.closest('label'),
  fileEl: fileEl,
  onFiles: (files) => readSVGFile(files[0]),
  accept: '*',
  multiple: false,
});

/* --- 全局粘贴 SVG --- */
document.addEventListener('paste', e => {
  if (document.activeElement === codeEl) return;
  if (codeEl._cm && codeEl._cm.hasFocus()) return;
  const text = e.clipboardData.getData('text');
  if (text && text.trim().match(/^(<\?xml|<svg)/i)) {
    loadSVG(text, '已粘贴 SVG');
    e.preventDefault();
  }
});

/* --- 预览背景切换 --- */
on($('[data-bg-row]'), 'click', e => {
  const btn = e.target.closest('[data-bg]');
  if (!btn) return;
  $$('[data-bg-row] [data-bg]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const t = btn.dataset.bg;
  bgLayer.style.display = t === 'checker' ? '' : 'none';
  previewBox.style.background = t === 'white' ? '#fff' : t === 'dark' ? '#1a1a1a' : t === 'none' ? 'transparent' : 'var(--bg-surface-2)';
});

/* --- 元素编辑器绑定 --- */
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
  const isHex = /^#[0-9a-f]{3,8}$/i.test(e.target.value);
  if (isHex) $('[data-el-fill]').value = e.target.value;
  syncCodeFromPreview();
});
on($('[data-el-fill-opacity]'), 'input', e => {
  if (!selectedElement) return;
  $('[data-el-fill-opacity-val]').textContent = e.target.value + '%';
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
  const isHex = /^#[0-9a-f]{3,8}$/i.test(e.target.value);
  if (isHex) $('[data-el-stroke]').value = e.target.value;
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
  $('[data-el-stroke-opacity-val]').textContent = e.target.value + '%';
  selectedElement.setAttribute('stroke-opacity', e.target.value / 100);
  syncCodeFromPreview();
});

/* --- 工具栏动作（事件委托） --- */
on(document, 'click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  switch (btn.dataset.action) {
    case 'format': {
      const code = codeEl.value.trim();
      if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });
      codeEl.value = formatXML(code);
      updatePreview();
      showToast('格式化完成');
      break;
    }
    case 'minify': {
      const code = codeEl.value.trim();
      if (!code) return showToast('请先输入 SVG 代码', { type: 'warn' });
      codeEl.value = minifyXML(code);
      updatePreview();
      showToast('压缩完成');
      break;
    }
    case 'trim':      doTrim(false); break;
    case 'trim-safe': doTrim(true);  break;
    case 'copy': {
      const code = codeEl.value.trim();
      if (!code) return showToast('没有可复制的内容', { type: 'warn' });
      copyText(code).then(ok =>
        showToast(ok ? '已复制到剪贴板' : '复制失败', { type: ok ? 'success' : 'error' })
      );
      break;
    }
    case 'dl-svg': {
      const code = codeEl.value.trim();
      if (!code) return showToast('没有可下载的内容', { type: 'warn' });
      downloadBlob(new Blob([code], { type: 'image/svg+xml' }), 'image.svg');
      break;
    }
    case 'dl-png':  doExportPNG(); break;
    case 'reset': {
      if (!originalSVG) return showToast('没有可恢复的原始 SVG', { type: 'warn' });
      codeEl.value = originalSVG;
      updatePreview();
      showToast('已恢复');
      break;
    }
    case 'clear': {
      codeEl.value = '';
      originalSVG = '';
      updatePreview();
      showToast('已清空');
      break;
    }
    case 'load-example': {
      loadSVG(EXAMPLE, '示例已加载');
      break;
    }
  }
});

/* ====================== 初始化 ====================== */
codeEl.value = EXAMPLE;
originalSVG = EXAMPLE;
updatePreview();
createEditor(codeEl, { mode: 'xml' });
