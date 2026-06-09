/**
 * chart-core.js — ECharts 实例管理、配色、导出
 * 依赖：public/vendor/echarts.min.js（全局 echarts 对象）
 */
import { hexToRgbArr, rgbNumToHex } from '../../public/scripts/utils/color.js';

/* ========== 配色方案 ========== */

export const PALETTES = {
  default:  ['#165DFF','#00B42A','#F77234','#722ED1','#14C9C9','#F7BA1E','#F53F3F','#9FDB1D','#3491FA','#D91AD9','#FF7D00','#F5319D','#FADC19'],
  vibrant:  ['#F53F3F','#FF7D00','#F7BA1E','#00B42A','#165DFF','#722ED1','#D91AD9','#F5319D'],
  ocean:    ['#165DFF','#3491FA','#14C9C9','#00B42A','#9FDB1D','#722ED1','#FADC19','#F7BA1E'],
  warm:     ['#F53F3F','#F77234','#FF7D00','#F7BA1E','#FADC19','#F5319D','#D91AD9','#9FDB1D'],
  pastel:   ['#94BFFF','#7BE188','#FFC46C','#B894F6','#89E8E8','#FFD666','#F98D8D','#D4F576'],
  mono:     ['#165DFF','#4080FF','#6AA1FF','#94BFFF','#BEDAFF','#D3E7FF','#E8F3FF','#F2F7FF'],
};

export function getPalette(name = 'default') {
  return PALETTES[name] || PALETTES.default;
}

export function getPaletteNames() {
  return Object.keys(PALETTES);
}

/* ========== 颜色工具（已统一到 utils/color.js，此处仅做兼容再导出） ========== */

export { hexToRgbArr as hexToRgb } from '../../public/scripts/utils/color.js';

export function interpolateColors(c1, c2, steps) {
  const [r1, g1, b1] = hexToRgbArr(c1);
  const [r2, g2, b2] = hexToRgbArr(c2);
  if (steps <= 1) return [c1];
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return rgbNumToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
  });
}

/* ========== 实例管理 ========== */

/**
 * 创建 ECharts 实例（SVG 渲染器，支持 SVG / PNG 导出）
 * @param {HTMLElement} container
 * @param {object} [opts] - echarts.init 额外选项
 * @returns {echarts.ECharts}
 */
export function createChart(container, opts = {}) {
  /* global echarts */
  const instance = echarts.init(container, null, {
    renderer: 'svg',
    ...opts,
  });

  // 跟随容器尺寸自动 resize
  const ro = new ResizeObserver(() => instance.resize());
  ro.observe(container);
  instance._ro = ro;

  return instance;
}

/**
 * 销毁实例并释放 ResizeObserver
 */
export function disposeChart(instance) {
  if (!instance) return;
  instance._ro?.disconnect();
  instance.dispose();
}

/* ========== 预览尺寸管理 ========== */

/**
 * 统一管理导出尺寸 & 预览比例
 * - 预览区始终 width:100%，通过 aspect-ratio 保持比例
 * - 宽/高仅用于导出
 * @param {HTMLElement} container - .chart-canvas 元素
 * @param {HTMLInputElement} widthInput
 * @param {HTMLInputElement} heightInput
 * @param {{ w?: number, h?: number }} [defaults]
 * @returns {{ getW: () => number, getH: () => number }}
 */
export function setupChartSize(container, widthInput, heightInput, defaults = {}) {
  let chartW = defaults.w || 800;
  let chartH = defaults.h || 480;

  function applyRatio() {
    container.style.aspectRatio = `${chartW} / ${chartH}`;
  }

  widthInput.addEventListener('change', () => {
    chartW = Math.max(400, Math.min(2000, +widthInput.value || 800));
    widthInput.value = chartW;
    applyRatio();
  });

  heightInput.addEventListener('change', () => {
    chartH = Math.max(200, Math.min(1200, +heightInput.value || 480));
    heightInput.value = chartH;
    applyRatio();
  });

  applyRatio();

  return {
    getW: () => chartW,
    getH: () => chartH,
  };
}

/* ========== 导出 ========== */

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * 创建离屏临时实例，以精确尺寸渲染后执行回调，完全不碰预览实例
 */
function withExportSize(instance, w, h, fn) {
  /* global echarts */
  const temp = document.createElement('div');
  temp.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${w}px;height:${h}px;`;
  document.body.appendChild(temp);

  const exportChart = echarts.init(temp, null, { renderer: 'svg' });
  const opt = instance.getOption();
  opt.animation = false;
  exportChart.setOption(opt);

  return new Promise(resolve => {
    requestAnimationFrame(() => {
      fn(exportChart);
      exportChart.dispose();
      document.body.removeChild(temp);
      resolve();
    });
  });
}

/**
 * 导出 PNG（通过 SVG → Canvas 转换）
 * @param {echarts.ECharts} instance
 * @param {string} filename
 * @param {{ w?: number, h?: number, pixelRatio?: number }} [opts]
 */
export function exportPNG(instance, filename = 'chart.png', opts = {}) {
  const { w, h, pixelRatio = 1 } = opts;

  function doExport(chart) {
    const svgEl = chart.getDom().querySelector('svg');
    if (!svgEl) return;

    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth  * pixelRatio;
      canvas.height = img.naturalHeight * pixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim() || '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) triggerDownload(URL.createObjectURL(blob), filename);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  if (w && h) {
    withExportSize(instance, w, h, doExport);
  } else {
    doExport(instance);
  }
}

/**
 * 注入 PNG 导出倍率选择器，并统一绑定 PNG / SVG 导出按钮
 * @param {echarts.ECharts} instance
 * @param {string} pngFilename  - 如 '柱状图.png'，SVG 文件名自动派生
 * @param {{ getW: () => number, getH: () => number }} chartSize
 */
export function setupExportPanel(instance, pngFilename, chartSize) {
  let pixelRatio = 1;
  const svgFilename = pngFilename.replace(/\.png$/i, '.svg');

  const pngBtn = document.querySelector('[data-export="png"]');
  if (pngBtn) {
    const actGroup = pngBtn.closest('.act-group');
    if (actGroup) {
      const row = document.createElement('div');
      row.className = 'co-row';
      row.style.marginBottom = 'var(--space-3)';
      row.innerHTML =
        '<span class="co-label">PNG 倍率</span>' +
        '<div class="co-seg">' +
          '<button class="active" data-ratio="1">1×</button>' +
          '<button data-ratio="2">2×</button>' +
          '<button data-ratio="3">3×</button>' +
        '</div>';
      actGroup.before(row);
      row.addEventListener('click', e => {
        const btn = e.target.closest('[data-ratio]');
        if (!btn) return;
        row.querySelectorAll('[data-ratio]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        pixelRatio = +btn.dataset.ratio;
      });
    }
  }

  document.querySelector('[data-export="png"]')?.addEventListener('click', () =>
    exportPNG(instance, pngFilename, { w: chartSize.getW(), h: chartSize.getH(), pixelRatio })
  );
  document.querySelector('[data-export="svg"]')?.addEventListener('click', () =>
    exportSVG(instance, svgFilename, { w: chartSize.getW(), h: chartSize.getH() })
  );
}

/**
 * 导出 SVG
 * @param {echarts.ECharts} instance
 * @param {string} filename
 * @param {{ w?: number, h?: number }} [opts]
 */
export function exportSVG(instance, filename = 'chart.svg', opts = {}) {
  const { w, h } = opts;

  function doExport(chart) {
    const svgEl = chart.getDom().querySelector('svg');
    if (!svgEl) return;

    const clone = svgEl.cloneNode(true);
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    const svgStr = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(URL.createObjectURL(blob), filename);
  }

  if (w && h) {
    withExportSize(instance, w, h, doExport);
  } else {
    doExport(instance);
  }
}
