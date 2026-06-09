import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';

mountToolHeader();

/* ============ 1. 常量 ============ */

const FORMAT_HINTS = {
  CODE128:    'CODE128：支持 ASCII 全字符集，最常用',
  CODE39:     'CODE39：支持大写字母、数字及 - . $ / + % 空格',
  EAN13:      'EAN-13：需精确 12 位数字（第 13 位校验码自动计算）',
  EAN8:       'EAN-8：需精确 7 位数字（第 8 位校验码自动计算）',
  UPC:        'UPC-A：需精确 11 位数字（第 12 位校验码自动计算）',
  ITF14:      'ITF-14：需 13 位数字（第 14 位校验码自动计算）',
  MSI:        'MSI：支持纯数字',
  pharmacode: 'Pharmacode：支持 3–131985 的整数',
};

/* ============ 2. 状态 ============ */

const state = {
  format:       'CODE128',
  lineWidth:    2,
  height:       100,
  lineColor:    '#000000',
  background:   '#ffffff',
  displayValue: true,
  fontSize:     14,
  textPosition: 'bottom',
};

/* ============ 3. DOM 引用 ============ */

const contentEl    = $('[data-content]');
const svgEl        = $('[data-barcode]');
const errorEl      = $('[data-barcode-error]');
const hintEl       = $('[data-format-hint]');
const textOptsEls  = $$('[data-text-opts]');

/* ============ 4. 工具函数 ============ */

/* globals JsBarcode */

function render() {
  const value = contentEl.value.trim();
  errorEl.hidden = true;

  if (!value) {
    svgEl.innerHTML = '';
    svgEl.hidden = true;
    return;
  }
  if (typeof JsBarcode === 'undefined') {
    svgEl.hidden = true;
    errorEl.textContent = '条形码组件加载失败，请检查网络后刷新重试';
    errorEl.hidden = false;
    return;
  }

  try {
    svgEl.hidden = false;
    JsBarcode(svgEl, value, {
      format:        state.format,
      width:         state.lineWidth,
      height:        state.height,
      lineColor:     state.lineColor,
      background:    state.background,
      displayValue:  state.displayValue,
      fontSize:      state.fontSize,
      textPosition:  state.textPosition,
      margin:        10,
      valid(v) { if (!v) throw new Error('内容与所选格式不兼容'); },
    });
  } catch (err) {
    svgEl.innerHTML = '';
    svgEl.hidden = true;
    errorEl.textContent = `生成失败：${err.message || '内容与所选格式不兼容'}`;
    errorEl.hidden = false;
  }
}

function getSvgString() {
  const clone = svgEl.cloneNode(true);
  // 内联背景色，确保导出带背景
  clone.style.background = state.background;
  return new XMLSerializer().serializeToString(clone);
}

function downloadPng() {
  const svgStr = getSvgString();
  if (!svgEl.children.length || svgEl.hidden) { showToast('请先生成有效条形码', { type: 'warn' }); return; }

  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth  * 2;
    canvas.height = img.naturalHeight * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob(blob => {
      if (blob) downloadBlob(blob, `barcode_${state.format}.png`);
      else showToast('PNG 生成失败', { type: 'error' });
    }, 'image/png');
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast('PNG 生成失败', { type: 'error' });
  };
  img.src = url;
}

function downloadSvg() {
  if (!svgEl.children.length || svgEl.hidden) { showToast('请先生成有效条形码', { type: 'warn' }); return; }
  const blob = new Blob([getSvgString()], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `barcode_${state.format}.svg`);
}

/* ============ 5. 事件绑定 ============ */

// 内容输入
on(contentEl, 'input', render);

// 参数控件统一监听
on(document, 'change', e => {
  const el = e.target;
  const key = el.dataset.param;
  if (!key) return;

  if (el.type === 'checkbox') {
    state[key] = el.checked;
    textOptsEls.forEach(d => { d.hidden = !state.displayValue; });
  } else {
    state[key] = el.type === 'range' || el.type === 'number'
      ? Number(el.value)
      : el.value;
  }

  if (key === 'format') {
    hintEl.textContent = FORMAT_HINTS[state.format] || '';
  }

  render();
});

// range 实时更新数值展示
on(document, 'input', e => {
  const el = e.target;
  if (el.type !== 'range' || !el.dataset.param) return;
  const key = el.dataset.param;
  const valEl = $(`[data-range-val="${key}"]`);
  if (valEl) valEl.textContent = el.value;
});

// 导出
on(document, 'click', e => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action === 'download-png') downloadPng();
  else if (action === 'download-svg') downloadSvg();
});

// 初始渲染（等 JsBarcode CDN 加载完成）
window.addEventListener('load', render);
