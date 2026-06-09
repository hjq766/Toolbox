# 共享模块 API（`tools/_shared/`）

> 四个公共模块覆盖 80% 工具需求，**能用尽量用**，严禁自造轮子。

---

## 1. `sidebar.css`

**引入方式**（`index.html`）：
```html
<link rel="stylesheet" href="../_shared/sidebar.css">
```

**提供的 class**：

| Class | 用途 | 典型用法 |
|---|---|---|
| `.panel-title` | 分组小标题（大写 + 底部分隔线） | `<h3 class="panel-title">导出设置</h3>` |
| `.opt-row` | 横向按钮组 | 格式切换、单位切换 |
| `.preset-row` | 预设按钮组（略密） | 尺寸预设 |
| `.opt-card` | radio/checkbox 卡片 | 模式选择 |
| `.range-row` + `.val` | 滑块 + 数值显示 | 质量、精度 |
| `.switch-list` / `.switch-item` | 开关列表 | 选项开关 |
| `.tabs` | 胶囊 tab | 视图切换 |
| `.act-group` | 全宽按钮纵向堆叠 | 主操作区（执行/重置/下载） |
| `.pos-grid` / `.pos-cell` | 3×3 位置选择器 | 水印定位 |
| `.field-label` | 小号 muted 标签 | select 上方标签 |
| `.hint` | 11px 浅色提示 | 使用说明 |
| `.sep` | 分隔线 | 面板内分隔 |
| `.tool-details` | `<details>` 折叠区，`summary` 统一样式 | CSS 工具「HTML 示例」折叠展示 |

**CSS 工具演示色变量**（定义在 `sidebar.css :root`，仅用于 demo 预览区装饰）：
- `--demo-purple: hsl(280 72% 62%)` — 与 `--color-brand` 搭配做渐变演示

### 典型组合

```html
<aside>
  <!-- 格式切换 -->
  <div class="panel">
    <h3 class="panel-title">导出设置</h3>
    <div class="opt-row">
      <button class="btn is-sm active" data-fmt="png">PNG</button>
      <button class="btn is-sm" data-fmt="jpg">JPG</button>
      <button class="btn is-sm" data-fmt="webp">WebP</button>
    </div>
  </div>

  <!-- 质量滑块 -->
  <div class="panel">
    <div class="range-row">
      <label>质量</label>
      <input type="range" min="1" max="100" value="80" data-quality>
      <span class="val" data-quality-val>80%</span>
    </div>
    <div class="range-row">
      <label>精度</label>
      <input type="range" min="2" max="10" value="4" data-precision>
      <span class="val" data-precision-val>4 位</span>
    </div>
  </div>

  <!-- 开关列表 -->
  <div class="panel">
    <h3 class="panel-title">选项</h3>
    <div class="switch-list">
      <label class="switch-item">
        <span>保留透明通道</span>
        <label class="switch">
          <input type="checkbox" data-opt="alpha">
          <span class="track"></span><span class="thumb"></span>
        </label>
      </label>
    </div>
  </div>

  <!-- 操作 -->
  <div class="panel">
    <div class="act-group">
      <button class="btn is-primary" data-action="export">
        <i data-lucide="download"></i> 导出
      </button>
      <button class="btn is-ghost" data-action="reset">重置</button>
    </div>
  </div>

  <!-- 提示 -->
  <div class="panel">
    <p class="hint">建议单张图片不超过 10MB</p>
  </div>
</aside>
```

---

## 2. `preview-grid.css`

**引入方式**（`index.html`，放在 `sidebar.css` 之后）：
```html
<link rel="stylesheet" href="../_shared/preview-grid.css">
```

**适用场景**：批量图片处理工具（多文件上传 → 卡片网格预览），目前用于 `images_compress`、`images_convert`。

**提供的 class**：

| Class | 用途 | 典型用法 |
|---|---|---|
| `.preview-grid` | 自适应卡片网格（`minmax(200px, 1fr)`） | 包裹所有 `.preview-item` |
| `.preview-item` | 单张卡片容器（圆角 + 边框 + flex column） | 每个上传的文件一张卡 |
| `.preview-img` | 缩略图区（160px 高，居中 contain） | 卡片顶部 |
| `.preview-img img` | 缩略图交互（hover 放大，cursor pointer） | 点击触发模态预览 |
| `.preview-info` | 信息区（文件名 + info-row） | 卡片底部 |
| `.preview-info .fname` | 文件名（加粗 + break-all） | — |
| `.preview-info .info-row` | 信息行（flex between，muted 色） | 原始大小 / 尺寸 / 转换后 |
| `.preview-info .info-row .cv` | 强调值（加粗） | 转换结果数值 |
| `.cv.good` / `.cv.same` / `.cv.fail` | 值的语义色（成功/无变化/失败） | 压缩比例 |
| `.remove-btn` | 悬浮删除按钮（hover 显示，半透明圆形） | 覆盖在缩略图右上角 |
| `.img-modal` | 全屏图片预览遮罩（`.is-active` 显示） | 点击缩略图后弹出 |
| `.img-modal .close-btn` | 模态框关闭按钮 | 右上角 |

### 典型组合

```html
<!-- 预览网格 -->
<div class="preview-grid" data-grid></div>

<!-- JS 动态创建的卡片 -->
<div class="preview-item" data-idx="0">
  <div class="preview-img"><img src="..." data-preview-img></div>
  <div class="preview-info">
    <div class="fname">photo.jpg</div>
    <div class="info-row"><span>原始大小</span><span>2.4 MB</span></div>
    <div class="info-row"><span>压缩后</span><span class="cv good">1.1 MB</span></div>
  </div>
  <button class="remove-btn" data-remove="0"><i data-lucide="x"></i></button>
</div>

<!-- 图片预览模态框 -->
<div class="img-modal" data-modal>
  <img src="" alt="预览图片" data-modal-img>
  <button class="close-btn" data-modal-close><i data-lucide="x"></i></button>
</div>
```

### 模态框 JS 用法

```js
const modal = $('[data-modal]');
const modalImg = $('[data-modal-img]');
const modalClose = $('[data-modal-close]');

function showModal(src) {
  modalImg.src = src;
  modal.classList.add('is-active');
  document.body.style.overflow = 'hidden';
}
function hideModal() {
  modal.classList.remove('is-active');
  document.body.style.overflow = '';
}
on(modalClose, 'click', hideModal);
on(modal, 'click', e => { if (e.target === modal) hideModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('is-active')) hideModal();
});
```

### ⚠️ 注意事项

- 工具特有的状态样式（如 `.status-badge`）仍写在工具自己的 `<style>` 里
- 如需覆盖 `.cv` 颜色（如 `images_convert` 用品牌色），在工具 `<style>` 中追加 `.preview-info .info-row .cv{color:var(--color-brand)}`
- 删除文件时务必 `URL.revokeObjectURL(preview)` 释放内存

---

## browse-tabs.js + browse.css

**适用**：符号大全、色卡、首都、HTTP 状态码、颜色名称色表等浏览速查 Tab。

**CSS**（`index.html`）：
```html
<link rel="stylesheet" href="../../public/styles/browse.css">
```

**HTML**（Tab 一律留空容器，由 JS 渲染）：
```html
<div class="browse-head">
  <div class="browse-toolbar">…</div>
  <div data-tabs role="tablist"></div>
</div>
```

**JS**：
```js
import { mountBrowseTabs } from '../_shared/browse-tabs.js';

let active = 'all';

mountBrowseTabs($('[data-tabs]'), {
  items: [
    { id: 'all', label: '全部' },
    { id: 'foo', label: '分类 A' },
  ],
  getActive: () => active,
  onSelect: id => { active = id; render(); },
});
```

- 统一 `data-cat` 传值；始终 `.is-scroll` 横滑，字号与全局 `.tab-btn` 一致
- 同一页多个 Tab 条：`<div data-tabs="hue">` 等，分别 `mountBrowseTabs`

---

## 3. `upload-zone.js`

### HTML 结构

```html
<label class="panel u-col u-gap-2 upload-panel" data-drop>
  <i data-lucide="upload"></i>
  <div class="u-strong">点击或拖拽文件到此处</div>
  <div class="u-muted u-text-xs">
    支持 JPG/PNG/WebP · 支持粘贴上传
  </div>
  <input type="file" accept="image/*" hidden data-file>
</label>
```

**关键点**：
- 外层是 `<label>`，内嵌 `<input type="file" hidden>` — 浏览器点击 label 自动触发 input
- 图标：图片用 `upload`，PDF 用 `file-upload`
- `data-drop` 标记拖拽区，`data-file` 标记文件输入

### JS 调用

```js
import { initUploadZone } from '../_shared/upload-zone.js';

initUploadZone({
  dropEl: $('[data-drop]'),          // 拖拽区元素
  fileEl: $('[data-file]'),          // input[type=file] 元素
  onFiles: (files) => {              // FileList 回调
    handleFiles(files);
  },
  accept: 'image',                    // 'image' | 'pdf' | 'any'
  multiple: true,                     // 可选，默认 false
});
```

### 内置能力

- **拖拽**：拖入页面时弹出全屏固定蒙层（`position:fixed` overlay + 透明度动画），放下后触发 `onFiles`。蒙层由模块内部创建和管理，无需额外 CSS
- **点击**：若 `dropEl` 是包裹 `fileEl` 的 `<label>`，浏览器自动触发选文件；否则模块手动 `fileEl.click()`
- **粘贴**：监听 `document.paste`，剪贴板里有文件 → 触发 `onFiles`
- **MIME 过滤**：按 `accept` 参数（`'image'` / `'pdf'` / `'*'`）静默过滤不匹配的文件

### ⚠️ 注意事项

- **不要手动 `fileEl.click()`** — label 已内置此行为，重复调用会双弹窗
- **不要在 `onFiles` 里假设只有一个文件** — 即使 `multiple: false`，FileList 长度仍是 1 而非取 [0]
- **文件大小校验自己写** — 模块不处理大小限制

### 典型完整流程

```js
const MAX_SIZE = 10 * 1024 * 1024;   // 10MB

initUploadZone({
  dropEl: $('[data-drop]'),
  fileEl: $('[data-file]'),
  accept: 'image',
  onFiles: async (files) => {
    const file = files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      showToast('文件不能超过 10MB', { type: 'warn' });
      return;
    }

    currentFile = file;
    const img = await loadImage(file);
    displayImage(img);
    updateFileInfo(file, img);
  },
});
```

---

## 4. `code-editor.js`

### 基本用法

```js
import { createEditor, MODES } from '../_shared/code-editor.js';

const textareaEl = $('[data-input="src"]');

const cm = await createEditor(textareaEl, {
  mode: 'javascript',       // 见支持的 mode 列表
  readOnly: false,          // 可选，默认 false（也可在 textarea 上加 readonly 属性自动识别）
  lineNumbers: true,         // 可选，默认 true
});

// 之后直接操作 textareaEl.value，自动代理到 CM
textareaEl.value = 'new content';

// 监听变化
on(textareaEl, 'input', () => {
  console.log('changed:', textareaEl.value);
});
```

### 支持的 mode

| mode | 用途 |
|---|---|
| `javascript` | JS / JSON |
| `xml` | XML / SVG |
| `css` | CSS |
| `htmlmixed` | HTML（嵌 JS/CSS） |
| `markdown` | Markdown |

使用 `MODES` 映射获取标准 mode 值：
```js
import { MODES } from '../_shared/code-editor.js';
const mode = MODES.html;    // → 'htmlmixed'
```

### 模块内部能力

- 动态从 cdnjs 加载 CodeMirror 5.65.18（首次调用时）
- 加载 modes: xml / javascript / css / htmlmixed / markdown
- 加载 addons: matchbrackets / closebrackets / placeholder
- 自动注入匹配设计系统的主题（颜色/圆角/边框跟随 token）
- 透明代理：`textarea.value` getter/setter 映射到 `cm.getValue() / setValue()`
- 派发 `input` 事件：CM 内容变化 → `textarea.dispatchEvent('input')`

### 直接操作 CM 实例

```js
const cm = await createEditor(textareaEl, { mode: 'javascript' });

// 方式 1：保存的 cm 实例
cm.setOption('lineWrapping', true);

// 方式 2：从 textarea 反取
const cm2 = textareaEl._cm;
cm2.focus();
```

### 已集成的工具（10+）

`code_format` · `code_json` · `code_xml` · `svg_code_editor` · `html_preview`（3 个编辑器） · `html_markdown` · `markdown_html` · `html_javascript` · `html_text` · `meta`

### 典型完整流程（双编辑器互转）

```js
import { createEditor } from '../_shared/code-editor.js';

const srcEl = $('[data-input="src"]');
const outEl = $('[data-output]');

// 初始化两个编辑器
await createEditor(srcEl, { mode: 'htmlmixed' });
await createEditor(outEl, { mode: 'markdown', readOnly: true });

// 实时转换
on(srcEl, 'input', debounce(convert, 300));

function convert() {
  if (!window.TurndownService) {
    showToast('Turndown 库加载中…', { type: 'warn' });
    return;
  }
  const turndown = new TurndownService();
  outEl.value = turndown.turndown(srcEl.value);
}
```

---

## 5. `chart-core.js` + `chart-data.js` + `chart.css`

> 三个文件配合使用，覆盖所有 `chart_*` 图表工具的完整需求。

### 5.1 引入方式

```html
<!-- index.html <head> -->
<link rel="stylesheet" href="../_shared/chart.css">
<script src="../../public/vendor/echarts.min.js" defer></script>
<script src="../../public/vendor/xlsx.mini.min.js" defer></script>
```

```js
// page.js
import { createChart, exportPNG, exportSVG, getPalette, getPaletteNames,
         PALETTES, interpolateColors, setupChartSize } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';
```

### 5.2 `chart-core.js` API

| 函数 | 说明 |
|---|---|
| `createChart(container, opts?)` | 创建 ECharts 实例（SVG 渲染器），自动绑定 ResizeObserver |
| `disposeChart(instance)` | 销毁实例并释放 ResizeObserver |
| `setupChartSize(container, widthInput, heightInput, defaults?)` | 统一管理导出宽高，预览区用 aspect-ratio 保持比例；返回 `{ getW, getH }` |
| `exportPNG(instance, filename, { w, h, pixelRatio? })` | 导出 PNG（离屏实例，不影响预览） |
| `exportSVG(instance, filename, { w, h })` | 导出 SVG（离屏实例） |
| `getPalette(name?)` | 取配色方案数组，默认 `'default'` |
| `getPaletteNames()` | 返回所有方案名数组 |
| `PALETTES` | 全部配色方案对象（`default / vibrant / ocean / warm / pastel / mono`） |
| `interpolateColors(c1, c2, steps)` | 两色渐变插值，返回 hex 数组 |

```js
// 典型用法
const chart = createChart($('#chart'));
chart.setOption(option, true);  // true = 完全替换（推荐）

const size = setupChartSize($('#chart'), $('[data-opt="width"]'), $('[data-opt="height"]'));
on($('[data-export="png"]'), 'click',
  () => exportPNG(chart, '图表.png', { w: size.getW(), h: size.getH() }));
```

### 5.3 `chart-data.js` API

```js
const editor = createDataEditor(container, {
  data: DEFAULT_DATA,   // 2D 数组（见数据格式）
  onChange: (data) => updateChart(),
  minRows: 2,           // 可选，最少数据行，默认 2
  minCols: 2,           // 可选，最少列数，默认 2
});

editor.getData()        // → 2D 数组（deep clone）
editor.setData(newData) // 替换数据并重渲染
editor.destroy()        // 从 DOM 移除
```

**数据格式**（2D 数组，第 0 行为表头）：
```js
// 多系列图（柱/线/散/雷达）
[['', '1月', '2月', '3月'],
 ['系列A', 100, 200, 150],
 ['系列B',  80, 160, 120]]

// 单系列图（饼/漏斗/仪表/树图）
[['类别', '值'],
 ['A', 335],
 ['B', 210]]
```

**内置能力**：
- 单元格 `contenteditable` 直接编辑，数值自动转 Number
- Tab / Enter 键盘导航
- `+ 行 / + 列` 按钮
- 导入弹窗：支持 Excel（`.xlsx/.xls`，依赖 `xlsx.mini.min.js`）、CSV / TSV 文件，以及表格内粘贴多行数据

### 5.4 `chart.css` 提供的类

**布局**：

| Class | 说明 |
|---|---|
| `.chart-studio` | 主布局容器（`grid: 1fr 380px`，响应式折叠） |
| `.chart-stage` | 左侧图表区（`position: sticky`） |
| `.chart-canvas` | ECharts 挂载容器（默认 `aspect-ratio: 800/480`） |
| `.chart-controls` | 右侧面板栏（`flex-direction: column; gap`） |

**手风琴**：

| Class | 说明 |
|---|---|
| `.cs-section` | 折叠区块容器，加 `.is-open` 展开 |
| `.cs-header` | 折叠标题按钮（含箭头伪元素） |
| `.cs-body` | 折叠内容区（`.is-open` 时 `display: block`） |

**选项控件**：

| Class | 说明 |
|---|---|
| `.co-row` | 标签 + 控件横排一行 |
| `.co-label` | 行内标签（muted，不换行） |
| `.co-seg` | 连体分段按钮（active 状态显示品牌色） |
| `.co-seg.is-disabled` | 禁用分段按钮组 |
| `.co-toggle` + `.co-toggle-track` | Toggle 开关 |
| `.co-sep` | 选项区内分隔线 |

**配色选择器**：`.palette-grid` / `.palette-item`（`.active` 显示品牌色边框）

**数据编辑器**（由 `chart-data.js` 自动生成 DOM，样式在此）：`.cd-wrap` / `.cd-toolbar` / `.cd-btn` / `.cd-scroll` / `.cd-table` / `.cd-act` / `.cd-overlay` / `.cd-modal`

---

## 共享模块路径总览

```text
tools/_shared/
├─ sidebar.css           ← <link rel="stylesheet" href="../_shared/sidebar.css">
├─ preview-grid.css      ← <link rel="stylesheet" href="../_shared/preview-grid.css">
├─ chart.css             ← <link rel="stylesheet" href="../_shared/chart.css">
├─ upload-zone.js        ← import { initUploadZone } from '../_shared/upload-zone.js';
├─ code-editor.js        ← import { createEditor } from '../_shared/code-editor.js';
├─ chart-core.js         ← import { createChart, … } from '../_shared/chart-core.js';
└─ chart-data.js         ← import { createDataEditor } from '../_shared/chart-data.js';
```

所有工具的 import/link 路径都是相对的 `../_shared/xxx`，不要写绝对路径。
