# 工具家族模板

> 新增或改版工具时**先对号入座**，选定类型后去 `assets/templates/<type>/` 复制起步代码。

---

## 1. 综合单位换算器 `unit_converter`

**代表工具**：`unit_converter`

**模板**：优先参考 `tools/unit_converter/`，旧 `assets/templates/converter-linear/` 仅作为专项换算器的起步参考。

**布局**：`grid-sidebar-r` + 主区多 `.panel`（按单位体系或常用场景分组）

**JS 核心**：
```js
const FACTORS = {
  m: 1,        // 基准单位
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  ft: 0.3048,
};
const NAMES = {
  m: '米', km: '千米', cm: '厘米', mm: '毫米',
  mi: '英里', ft: '英尺',
};

function convert(fromUnit, value) {
  if (!isFinite(value)) return;
  const base = value * FACTORS[fromUnit];
  for (const k of Object.keys(FACTORS)) {
    if (k === fromUnit) continue;
    const v = base / FACTORS[k];
    const el = $(`[data-unit="${k}"]`);
    if (el && document.activeElement !== el) {
      el.value = roundTo(v, precision);
    }
  }
}
```

**侧栏必含**：
- 快速输入预设（1 / 10 / 100 / 1000 按钮）
- 精度滑块（2-10 位小数，`.range-row`）
- 操作组（复制全部 / 重置，`.act-group`）

**初始化**：预填 `1` 并立即触发一次全量换算，用户进入即看到结果。

---

## 2. 专项换算/计算器

**代表工具**：`convert_scale` · `calc_golden` · `date_calc` · `age_calc` · `exchange_rate` · `rmb`

**模板**：按工具复杂度参考 `assets/templates/converter-nonlinear/` 或 `assets/templates/generator/`，优先看同类已上线工具。

**差异**：专项工具通常不是单纯因子表换算，应把算法函数与 DOM 更新拆开；若是非线性换算，用 `toBase / fromBase` 函数对替代因子表：

```js
const UNITS = {
  C: {
    name: '摄氏度',
    toBase: v => v,               // 以摄氏度为基准
    fromBase: v => v,
  },
  F: {
    name: '华氏度',
    toBase:   v => (v - 32) * 5/9,
    fromBase: v => v * 9/5 + 32,
  },
  K: {
    name: '开尔文',
    toBase:   v => v - 273.15,
    fromBase: v => v + 273.15,
  },
};

function convert(fromUnit, value) {
  const base = UNITS[fromUnit].toBase(value);
  for (const k of Object.keys(UNITS)) {
    if (k === fromUnit) continue;
    const v = UNITS[k].fromBase(base);
    $(`[data-unit="${k}"]`).value = roundTo(v, precision);
  }
}
```

**结构原则**：
- 输入校验要明确，不展示过期结果。
- 预设按钮使用 `.tabs` / `.tab-btn` 或 `.preset-row .btn`。
- 计算结果用 `.stat-grid`、`.result-row`、`.result-strip` 展示。
- 复制、下载、提示分别复用 `copyText`、`downloadBlob`、`showToast`。

---

## 3. 图片处理器 `images_*`

**代表工具**：`images_flip` · `images_convert` · `images_compress` · `images_cut` · `images_color`

**模板**：`assets/templates/image-tool/`

**布局**：`grid-sidebar-r` `--sidebar-w:300px`

**左主区结构**（自上而下）：
1. 上传区 `<label data-drop>`（复用 `initUploadZone`）
2. 预览区（`<canvas>` 单图 / `.preview-grid` 批量）
3. 可选：文件信息面板（文件名/尺寸/大小/格式）
4. 可选：当前状态面板（如变换状态）

**批量模式**需引入 `_shared/preview-grid.css`（提供 `.preview-grid` / `.preview-item` / `.remove-btn` / `.img-modal` 等），见 [shared-modules §2](./shared-modules.md#2-preview-gridcss)。

**右侧栏结构**：
- 参数面板（输出格式 / 质量 / 尺寸…）
- `.act-group` 含：`.is-primary` 执行 + `.is-ghost` 重置 + `.is-ghost` 删除/清空

**核心状态**：
```js
let currentFile = null;       // 单图
let currentImage = null;      // Image 对象
let uploadedFiles = [];       // 批量
let convertedFiles = [];      // 输出结果
```

**必备能力**：
- 复用 `initUploadZone`（拖拽/粘贴/点击）
- 文件大小限制提示（典型 10MB）
- 输出用 `downloadBlob`，批量用 `JSZip` CDN

---

## 4. 代码编辑器类

**代表工具**：`code_format` · `code_json` · `code_xml` · `svg_code_editor` · `html_preview` · `html_markdown` · `markdown_html` · `html_javascript` · `html_text` · `meta`

**模板**：`assets/templates/code-editor/`

**布局**：
- 输入→输出互转：`grid-2`
- 实时生成：`grid-sidebar-r`（侧栏放表单）
- 复杂编辑器：自定义（如 `html_preview` 三编辑器）

**核心**：用 `_shared/code-editor.js` 的 `createEditor` 包装 `<textarea>`：

```js
import { createEditor } from '../_shared/code-editor.js';

const srcEl = $('[data-input="src"]');
const outEl = $('[data-output]');

const cmSrc = await createEditor(srcEl, { mode: 'javascript' });
const cmOut = await createEditor(outEl, { mode: 'javascript', readOnly: true });

// 之后直接用 srcEl.value，createEditor 自动代理
on(srcEl, 'input', debounce(format, 300));

function format() {
  try {
    outEl.value = beautify(srcEl.value);
  } catch (e) {
    showToast(`格式化失败：${e.message}`, { type: 'error' });
  }
}
```

**支持的 mode**：`javascript` / `xml` / `css` / `htmlmixed` / `markdown`（`json` 复用 javascript 模式）

---

## 5. 文本处理器

**代表工具**：`text_size` · `text_deduplicate` · `text_difference` · `text_morse` · `urlcode` · `base64` · `hex_convert` · `en_case` · `zh_convert`

**模板**：`assets/templates/text-tool/`

**布局**：`grid-2`（最常见）

**典型结构**：
```html
<div class="panel">
  <div class="grid grid-2">
    <div class="field">
      <label class="field-label" for="src">输入</label>
      <textarea class="textarea" id="src" data-input="src"></textarea>
    </div>
    <div class="field">
      <label class="field-label" for="out">输出</label>
      <textarea class="textarea" id="out" data-output readonly></textarea>
    </div>
  </div>

  <!-- 选项（若有） -->
  <div class="u-row u-gap-4 u-mt-3" style="flex-wrap:wrap">
    <label class="checkbox"><input type="checkbox" data-opt="trim"> 去首尾空白</label>
    <label class="checkbox"><input type="checkbox" data-opt="dedupe"> 去重</label>
  </div>

  <!-- 操作 -->
  <div class="u-row u-gap-3 u-mt-4">
    <button class="btn is-primary" data-action="run">转换</button>
    <button class="btn" data-action="copy">复制结果</button>
    <button class="btn" data-action="swap">交换</button>
    <button class="btn is-ghost" data-action="clear">清空</button>
  </div>
</div>

<!-- 若有统计，用 stat-grid -->
<div class="stat-grid u-mt-4" data-stats hidden>
  <div class="stat"><div class="stat-label">字符数</div><div class="stat-value" data-stat="chars">0</div></div>
  <div class="stat"><div class="stat-label">词数</div><div class="stat-value" data-stat="words">0</div></div>
</div>
```

---

## 6. 实时生成器

**代表工具**：`meta` · `qrcode` · `rmb` · `rand_password` · `ico_generator`

**模板**：`assets/templates/generator/`

**布局**：`grid-sidebar-r`，左预览/输出，右**所有**参数

**核心原则**：
- **不要**「生成」按钮，所有字段 `input` / `change` 事件即时重算
- 初始载入也触发一次生成，用户立即看到默认结果
- 重算用 `debounce(update, 200)` 避免高频刷新

**典型结构**：
```js
const fields = $$('[data-field]');
fields.forEach(el => {
  on(el, 'input', debounce(update, 200));
  on(el, 'change', update);
});

function update() {
  const data = collect();          // 从所有 [data-field] 收集
  const output = generate(data);
  outEl.value = output;
}

update();                          // 初始化
```

---

## 7. 查询类工具（本地数据库）

**代表工具**：`areacode` · `phone_localtion` · `idcard_calc` · `pinyin` · `zodiac`

**模板**：无独立模板（差异太大），参考 `tools/areacode/`

**布局选项**：
- `grid-sidebar` — 左导航列表 + 右详情（`areacode`）
- 单面板 + result-row — 输入 → 多行结果（`phone_localtion`）
- 批量表格 — 数据量大时（`idcard_calc`）

**关键模式**：vendor 大文件放 `public/vendor/`，HTML 全局注入：

```html
<script src="../../public/vendor/idcard_area.js"></script>
```

```js
// JS 里加载守卫
if (typeof provinceData === 'undefined') {
  showToast('数据文件未加载，请刷新重试', { type: 'error' });
  return;
}
```

---

## 8. 水印类工具

**代表工具**：`watermark_images` · `watermark_pdf`

**模板**：无独立模板，参考 `tools/watermark_images/`

**布局**：`grid-sidebar-r` `--sidebar-w:320px`

**侧栏特色组件**（来自 `sidebar.css`）：
- `.pos-grid` + `.pos-cell` — 3×3 位置九宫格
- `.opt-row` — 预设样式切换
- `.range-row` — 不透明度 / 旋转角度
- `.act-group` — 下载 / 重置

**九宫格模板**：
```html
<div class="pos-grid" data-pos-grid>
  <button class="pos-cell" data-pos="tl">↖</button>
  <button class="pos-cell" data-pos="tc">↑</button>
  <button class="pos-cell" data-pos="tr">↗</button>
  <button class="pos-cell" data-pos="ml">←</button>
  <button class="pos-cell is-active" data-pos="mc">●</button>
  <button class="pos-cell" data-pos="mr">→</button>
  <button class="pos-cell" data-pos="bl">↙</button>
  <button class="pos-cell" data-pos="bc">↓</button>
  <button class="pos-cell" data-pos="br">↘</button>
</div>
```

---

## 9. 图表工具 `chart_*`

**代表工具**：`chart_bar` · `chart_line` · `chart_pie` · `chart_scatter` · `chart_radar` · `chart_funnel` · `chart_gauge` · `chart_treemap`

**无独立模板**，参考 `tools/chart_bar/`

**依赖（必须在 `<head>` 加载）**：
```html
<link rel="stylesheet" href="../_shared/chart.css">
<script src="../../public/vendor/echarts.min.js" defer></script>
<script src="../../public/vendor/xlsx.mini.min.js" defer></script>  <!-- 支持 Excel 导入 -->
```

**布局**：`.chart-studio`（`chart.css` 提供）— 左侧图表预览 + 右侧 380px 操作面板

```html
<div class="chart-studio">
  <!-- 左：图表画布（sticky 吸顶） -->
  <div class="chart-stage">
    <div class="chart-canvas" id="chart"></div>
  </div>
  <!-- 右：操作面板（手风琴 + 导出） -->
  <div class="chart-controls">
    <div class="panel">
      <div class="cs-section is-open" data-section="data">
        <button class="cs-header" type="button">数据编辑</button>
        <div class="cs-body"><div data-editor></div></div>
      </div>
      <div class="cs-section" data-section="palette">
        <button class="cs-header" type="button">配色方案</button>
        <div class="cs-body">…</div>
      </div>
      <div class="cs-section" data-section="options">
        <button class="cs-header" type="button">图表选项</button>
        <div class="cs-body">…</div>
      </div>
    </div>
    <div class="panel">
      <div class="act-group">
        <div class="u-row u-gap-2">
          <button class="btn is-primary is-block" data-export="png">下载 PNG</button>
          <button class="btn is-block" data-export="svg">下载 SVG</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

**JS 核心（五步套路）**：
```js
import { createChart, exportPNG, exportSVG, getPalette, getPaletteNames,
         PALETTES, interpolateColors, setupChartSize } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';

// 1. 创建图表实例（SVG 渲染器）
const chart = createChart($('#chart'));

// 2. 创建可编辑数据表格
const editor = createDataEditor($('[data-editor]'), {
  data: DEFAULT_DATA,    // 2D 数组，见 chart-data.js 格式
  onChange: () => updateChart(),
});

// 3. 数据 → ECharts option
function buildOption(data) { … }

// 4. 刷新图表
function updateChart() {
  chart.setOption(buildOption(editor.getData()), true);
}

// 5. 尺寸管理 + 导出
const chartSize = setupChartSize($('#chart'), $('[data-opt="width"]'), $('[data-opt="height"]'));
on($('[data-export="png"]'), 'click', () => exportPNG(chart, '图表.png', { w: chartSize.getW(), h: chartSize.getH() }));
on($('[data-export="svg"]'), 'click', () => exportSVG(chart, '图表.svg', { w: chartSize.getW(), h: chartSize.getH() }));

updateChart(); // 初始渲染
```

**手风琴折叠**（手动绑定，`chart.css` 已提供样式）：
```js
document.querySelectorAll('.cs-header').forEach(header => {
  header.addEventListener('click', () => header.closest('.cs-section').classList.toggle('is-open'));
});
```

**图表选项控件常用组合**（均来自 `chart.css`）：
- `.co-row` + `.co-label` + `.co-seg` — 标签 + 分段按钮（方向/堆叠/模式切换）
- `.co-toggle` + `.co-toggle-track` — Toggle 开关（图例/标签显示）
- `.co-sep` — 选项区分隔线
- `.range-row` — 滑块行（复用 `sidebar.css`）

**数据格式约定**：
```js
// 多系列（柱/线/散点/雷达）
[['', '一月', '二月', '三月'],
 ['系列1', 150, 230, 224],
 ['系列2', 320, 132, 301]]

// 单系列（饼/漏斗/仪表/树图）
[['项目', '值'],
 ['直接访问', 335],
 ['邮件营销', 310]]
```

**注意事项**：
- `echarts.min.js` 是全局变量注入，**不要** `import`
- 导出用离屏临时实例，不影响预览，见 `chart-core.js`
- `chart.css` 包含数据编辑表格（`.cd-*`）和导入弹窗样式，**不要**重复实现

---

## 10. 解析/查看器工具

**代表工具**：`design_md`

**无独立模板**，参考 `tools/design_md/`

**适用场景**：导入结构化文件（Markdown / YAML / JSON），解析后渲染为可视化长文档，提供编辑侧栏 + 滚动主视图，支持多种格式导出。

**布局**：自定义 `.dm-viewer`（`tool.css` 提供）— 左侧可折叠源码侧栏 + 右侧全高滚动预览区

```html
<div class="dm-viewer">
  <!-- 左：可折叠源码侧栏 -->
  <aside class="dm-sidebar" data-sidebar>
    <div class="dm-sidebar-head">…标题 + 折叠按钮…</div>
    <textarea class="textarea dm-source-textarea" data-source></textarea>
    <div>…底部操作按钮…</div>
  </aside>
  <!-- 右：主内容区 -->
  <div class="dm-main">
    <header class="dm-header">…标题栏 + 锚点导航 + 导出按钮…</header>
    <div class="dm-content" data-content>…JS 动态渲染…</div>
  </div>
</div>
```

**文件结构**（`design_md` 特有）：
```
tools/design_md/
├─ index.html      ← 布局 shell
├─ page.js         ← 解析 + 渲染 + 事件
├─ exporter.js     ← 导出函数（genCSS / genTailwind / genHTML）
└─ tool.css        ← 可视化样式（独立查看器布局，>100 行属合理，已在文件头部说明）
```

**JS 核心模式**：
```js
// 解析层（纯函数）
function parse(text)         // 文件内容 → tokens + md
function extractFromProse(text) // 纯 Markdown 降级提取

// 渲染层（纯函数，返回 HTML 字符串）
function renderOverviewSection()
function renderColorsSection()
function renderTypographySection()
function renderSpacingSection()
function renderComponentsSection()
function renderGuideSection()

// 更新入口
function update()   // 读取 textarea → parse → renderAll
function renderAll() // 将所有 section 拼接写入 contentEl.innerHTML

// 导出（exporter.js，传参纯函数）
window.Exporter.genCSS(tk)              // → CSS 变量字符串
window.Exporter.genTailwind(tk)         // → @theme 字符串
window.Exporter.genHTML(tk, innerHTML)  // async → 完整 HTML 字符串（含 tool.css）
```

**空状态处理三层**：
1. `tk === null`：什么都没载入 → 显示引导空状态
2. `tk._proseOnly`：有内容但没识别到 token → 显示警告 + 渲染原始 Markdown
3. 正常：完整可视化文档

**导出 HTML 的关键设计**（`exporter.js`）：
- `dumpSystemVars()` 从当前页面 `getComputedStyle` 读取所有 CSS 变量实际值，写入导出文件的 `:root {}`，保证导出样式与预览一致
- 再叠加 `genCSS(tk)` 的 token 变量和 `tool.css` 原文
- 导出文件不依赖任何外部 CSS 文件

---

## 11. CSS 可视化生成器

**代表工具**：`css_border_radius` · `css_triangle` · `css_clip_path`

**无独立模板**，参考 `tools/css_border_radius/`（最简）或 `tools/css_clip_path/`（最复杂）

**布局**：`grid-sidebar-r`，左侧「预览区 + CSS 输出」，右侧「参数控制」

**核心特征**：
- 左区分上下两块：① 可视化 demo 画布（tool.css 定制），② CSS/HTML 输出 textarea + 复制按钮
- CSS 输出区使用 `.tool-details` 折叠「HTML 示例」
- 右侧参数完全使用 `sidebar.css` 组件（`opt-row` / `range-row` / `tabs` / `.sep`）
- **无「生成」按钮**，参数变化即时更新 demo 和输出

**demo 画布装饰色**：使用 `--color-brand` + `--demo-purple`（均来自 `sidebar.css`），禁止硬编码色值

**典型 JS 结构**：
```js
function render() {
  const css = buildCSS(state);   // 根据 state 生成 CSS 字符串
  applyDemo(css);                // 实时更新预览区
  outputEl.value = css;         // 更新文本输出
}

// 参数变化时 → render()
on($('[data-range]'), 'input', render);
on($('[data-opts]'), 'click', e => { state.x = e.target.dataset.val; render(); });

render(); // 初始化
```

**tool.css 复杂度说明**：
- 简单工具（`css_border_radius`）：~30 行，仅 demo 画布布局
- 复杂工具（`css_clip_path`）：~200 行，含拖拽交互层、预设缩略图、绝对定位叠层
- > 100 行时需在文件头部写明原因（参见 `anti-patterns.md`）

---

## 12. 多模式计算器

**代表工具**：`percent_calc` · `date_calc` · `age_calc`

**无独立模板**，参考 `tools/percent_calc/`（最简）或 `tools/date_calc/`（含多模式 + 自定义快捷键）

**布局**：顶部 `.tabs` + 下方 `data-panel` 面板组（每个 tab 对应一个面板）

**核心特征**：
- 顶部 `.tabs` 切换计算模式，面板用 `hidden` 控制显隐
- **无「计算」按钮**：所有 `input` 事件即时触发计算，输入即出结果
- 结果区默认 `hidden`，有有效输入时才显示
- 结果展示优先用 `.stat-grid` / `.grid.grid-3` + `.stat` 卡片

**典型结构**：
```html
<div class="tabs u-mb-4" data-mode-tabs>
  <button class="tab-btn is-active" type="button" data-mode="a">模式 A</button>
  <button class="tab-btn" type="button" data-mode="b">模式 B</button>
</div>

<div data-panel="a">
  <div class="panel">
    <!-- 输入字段 -->
  </div>
  <div class="panel" data-a-result hidden>
    <div class="grid grid-3" data-a-grid></div>
  </div>
</div>

<div data-panel="b" hidden>
  <!-- 模式 B 的输入 + 结果 -->
</div>
```

```js
// 模式切换
modeBtns.forEach(b => on(b, 'click', () => {
  modeBtns.forEach(x => x.classList.toggle('is-active', x === b));
  panels.forEach(p => { p.hidden = p.dataset.panel !== b.dataset.mode; });
}));

// 即时计算（无按钮）
on(inputA, 'input', calc);
on(inputB, 'input', calc);

function calc() {
  const a = getNum(inputA), b = getNum(inputB);
  if (a === null || b === null) { resultEl.hidden = true; return; }
  // 计算 + 渲染 stat 卡片
  gridEl.innerHTML = stat('结果', fmt(a + b));
  resultEl.hidden = false;
}
```

**注意事项**：
- 折扣计算等双向推算场景，用 `lock` 标志位防止循环触发（参考 `percent_calc` 的 `discountLock`）
- 若计算依赖分母为零，提前 return 并隐藏结果面板，而非展示 Infinity
- 统计值用 `toPrecision(8)` + `parseFloat` 去尾零（参考 `percent_calc` 的 `fmt()`）

---

## 决策树：我该选哪个模板？

```text
用户需求是什么？
├─ 数值换算？
│  ├─ 线性比例（长度/重量/面积…） → 模板 1
│  └─ 非线性（温度/对数…）         → 模板 2
├─ 多场景计算（tab 切模式，输入即算） → 类型 12，参考 percent_calc / date_calc
├─ 图片处理？                        → 模板 3
├─ 代码编辑/格式化？                 → 模板 4
├─ 纯文本输入输出互转？              → 模板 5
├─ 实时表单 → 输出代码/图？          → 模板 6
├─ 查本地数据库？                    → 参考 areacode（无模板）
├─ 加水印？                          → 参考 watermark_images
├─ 数据可视化图表？                  → 类型 9，参考 chart_bar
├─ 导入文件 → 解析 → 可视化文档？   → 类型 10，参考 design_md
├─ CSS 属性可视化生成？              → 类型 11，参考 css_border_radius / css_clip_path
└─ 都不是？
   ├─ 多结果展示？→ 布局 4（单面板+result-strip/result-row）
   ├─ 多设备预览？→ 布局 5（iframe）
   └─ 其他       → 从 _base 模板起步
```
