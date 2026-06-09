/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { createChart, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';
import { setupChartColors } from '../_shared/chart-colors.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['项目', '值'],
  ['直接访问', 335],
  ['邮件营销', 310],
  ['联盟广告', 234],
  ['视频广告', 135],
  ['搜索引擎', 548],
];

/* ========== 2. 状态 ========== */
let isDonut      = false;       // 实心 false / 圆环 true
let innerRadius  = 40;          // 圆环内径 %
let isRose       = false;       // 玫瑰图开关（可与圆环叠加）
let roseMode     = 'area';      // 'area' | 'radius'
let labelPos     = 'outside';   // 'outside' | 'inside' | 'none'
let showLegend   = true;
let legendPos    = 'center';
let borderRadius = 0;
/* ========== 3. DOM 引用 ========== */
const chartDom    = $('#chart');
const legendCheck = $('[data-opt="legend"]');
const radiusRange = $('[data-opt="radius"]');
const radiusVal   = $('[data-val-radius]');
const customArea  = $('[data-custom-colors]');
const pickersRow  = $('[data-color-pickers]');
const gradPreview = $('[data-grad-preview]');
const donutOpts    = $('[data-donut-opts]');
const innerRange   = $('[data-opt="inner-radius"]');
const innerVal     = $('[data-val-inner]');
const roseCheck    = $('[data-opt="rose"]');
const roseOpts     = $('[data-rose-opts]');

/* ========== 4. 图表实例 ========== */
const chart = createChart(chartDom);

/* ========== 5. 数据编辑器 ========== */
const editor = createDataEditor($('[data-editor]'), {
  data: DEFAULT_DATA,
  onChange: () => {
    chartColors.syncForDataChange();
    updateChart();
  },
});

/* ========== 7. 数据 → ECharts option ========== */
function buildOption(data) {
  const colors = chartColors.getColors();
  const pieData = data.slice(1).map(row => ({
    name: String(row[0]),
    value: Number(row[1]) || 0,
  }));

  const innerR = isDonut ? `${innerRadius}%` : '0%';
  const outerR = '70%';
  const surface = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg-surface').trim() || '#fff';

  const showLabels = labelPos !== 'none';

  const isBottom = legendPos === 'bottom';
  let legend = undefined;
  if (showLegend) {
    legend = {
      data: pieData.map(d => d.name),
      ...(isBottom
        ? { bottom: 0, left: 'center' }
        : { top: 8, left: legendPos }),
    };
  }

  return {
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend,
    series: [{
      type: 'pie',
      radius: [innerR, outerR],
      center: ['50%', showLegend ? '55%' : '50%'],
      roseType: isRose ? roseMode : undefined,
      data: pieData,
      label: {
        show: showLabels,
        position: labelPos === 'inside' ? 'inside' : 'outside',
        formatter: labelPos === 'inside' ? '{d}%' : '{b} {d}%',
        fontSize: 12,
      },
      labelLine: {
        show: showLabels && labelPos === 'outside',
      },
      itemStyle: {
        borderRadius,
        borderColor: surface,
        borderWidth: borderRadius > 0 ? 2 : (isDonut ? 1 : 0),
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0,0,0,.2)',
        },
      },
    }],
  };
}

function updateChart() {
  chart.setOption(buildOption(editor.getData()), true);
}

/* ========== 8. 尺寸控制（公共） ========== */
const chartSize = setupChartSize(chartDom, $('[data-opt="width"]'), $('[data-opt="height"]'));

/* ========== 9. 手风琴折叠 ========== */
document.querySelectorAll('.cs-header').forEach(header => {
  header.addEventListener('click', () => {
    header.closest('.cs-section').classList.toggle('is-open');
  });
});

/* ========== 10. 配色方案 ========== */
const chartColors = setupChartColors({
  editor,
  paletteGrid: $('[data-palette]'),
  customArea,
  colorModeEl: $('[data-color-mode]'),
  pickersRow,
  gradPreview,
  gradStartEl: $('[data-grad-start]'),
  gradEndEl: $('[data-grad-end]'),
  onChange: updateChart,
});

/* ========== 12. 样式控件 ========== */

function bindSeg(selector, cb) {
  on($(selector), 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    $(selector).querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cb(btn.dataset.val);
  });
}

function syncShapeOpts() {
  donutOpts.hidden = !isDonut;
  roseOpts.hidden  = !isRose;
}
bindSeg('[data-shape]', v => { isDonut = v === 'donut'; syncShapeOpts(); updateChart(); });
bindSeg('[data-rose-mode]', v => { roseMode = v; updateChart(); });
on(roseCheck, 'change', () => { isRose = roseCheck.checked; syncShapeOpts(); updateChart(); });
syncShapeOpts();
bindSeg('[data-label-pos]',  v => { labelPos = v; updateChart(); });
bindSeg('[data-legend-pos]', v => { legendPos = v; updateChart(); });

// 图例 toggle + 联动禁用位置
const legendSeg = $('[data-legend-pos]');
function syncLegendSeg() { legendSeg.classList.toggle('is-disabled', !showLegend); }
on(legendCheck, 'change', () => { showLegend = legendCheck.checked; syncLegendSeg(); updateChart(); });
syncLegendSeg();

// 圆角
on(radiusRange, 'input', () => {
  borderRadius = +radiusRange.value;
  radiusVal.textContent = borderRadius;
  updateChart();
});

// 圆环内径
on(innerRange, 'input', () => {
  innerRadius = +innerRange.value;
  innerVal.textContent = `${innerRadius}%`;
  updateChart();
});

/* ========== 13. 导出 ========== */
setupExportPanel(chart, '饼图.png', chartSize);

/* ========== 14. 初始渲染 ========== */
updateChart();
