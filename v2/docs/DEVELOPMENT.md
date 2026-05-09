# jqnest 工具箱 v2 · 开发规范

> 本文档是**强制性规范**，在本项目里开发任何工具、组件、页面都必须严格遵守。
> 违反会导致全站样式漂移、重复代码膨胀、未来维护崩盘。
>
> 更新时间：2026-04-26

## 目录

1. [核心理念](#核心理念)
2. [目录结构](#目录结构)
3. [运行环境要求](#运行环境要求)
4. [CSS 架构](#css-架构)
5. [设计 Token 清单](#设计-token-清单)
6. [全局组件清单](#全局组件清单)
7. [Utility Class 清单](#utility-class-清单)
8. [JS 架构与模块规则](#js-架构与模块规则)
9. [页面外壳与工作台](#页面外壳与工作台)
10. [统一页面 Header 规则](#统一页面-header-规则)
11. [新增一个工具的完整步骤](#新增一个工具的完整步骤)
12. [新增全局组件的规则](#新增全局组件的规则)
13. [禁止事项清单](#禁止事项清单)
14. [图标系统（Lucide）](#图标系统-lucide)
15. [共享侧栏模块](#共享侧栏模块)
16. [共享上传模块](#共享上传模块)
17. [提交前自查清单](#提交前自查清单)
18. [常见故障排查](#常见故障排查)

---

## 核心理念

### 五条铁律

1. **设计 Token 单一源**：所有颜色、字号、间距、圆角、动效时长一律用 `tokens.css` 里的 CSS 变量。**不允许在任何地方写死 16px、#fff、1rem 这类字面量**（特殊单位除外，如描边 1px、小圆点尺寸）。
2. **组件一次实现，到处复用**：`components.css` 与 `utilities.css` 提供的 class 能满足 95% 的场景。任何"看着像 .btn / .panel / .card / .field"的东西都**直接用**，不允许自己另造。
3. **页面外壳统一**：首页、工具页、关于页**同一套 `.container + .tool-layout + .tool-header` 结构**，header 内容只通过 `mountPageHeader()` 函数渲染，不允许手写 header 内部的 HTML。
4. **工具页独立 + 嵌入双模式**：每个工具 HTML 必须能被 `file:` 以外的方式单独访问，也必须能被 `index.html` 工作台的 iframe 无缝嵌入。渲染逻辑依赖 `window.self !== window.top` 检测。
5. **零 tool.css 优先**：新工具**默认不写 `tool.css`**。先尝试用全局组件组合；只有真正独有的布局状态（例如 `iframe[data-device]` 的尺寸切换、canvas 专用背景）才允许写一个**尽可能短**的 `tool.css`。超过 80 行必须有充分理由。

### 目的

- 所有工具看起来是一家人。
- 切换主题、切换性能模式、改设计 Token，**一处改动全站生效**。
- 让只会抄模板的开发者也能产出合格的页面。

---

## 目录结构

```
v2/
├─ index.html                       工作台首页（左侧边 + 右 iframe）
├─ about.html                       关于页
├─ docs/
│   └─ DEVELOPMENT.md               ← 本文件
├─ README.md                        快速起步说明
├─ tools/
│   ├─ _template.html               工具页模板（复制它来建新工具）
│   ├─ _shared/
│   │   ├─ sidebar.css              侧栏统一样式（panel/opt-row/range/act-group…）
│   │   ├─ preview-grid.css         多文件预览卡片网格 + 图片模态框
│   │   ├─ upload-zone.js           共享上传交互（拖拽蒙层 + 粘贴 + 点击）
│   │   └─ code-editor.js           CodeMirror 5 包装器（动态加载 + 主题注入）
│   └─ <slug>/
│       ├─ index.html               工具页（入口）
│       ├─ page.js                  工具业务逻辑（ES Module）
│       └─ tool.css                 ← 可选，尽量不写
└─ public/
    ├─ styles/
    │   ├─ tokens.css               设计 Token（颜色、字号、间距…）
    │   ├─ themes.css               主题（light/dark/performance）
    │   ├─ base.css                 reset + 基础排版
    │   ├─ layout.css               容器、外壳、tool-layout、嵌入降级
    │   ├─ components.css           全局组件库（btn/input/panel/…）
    │   ├─ utilities.css            原子工具类（u-row/grid/is-hidden/…）
    │   └─ pages/home.css           首页工作台专用
    └─ scripts/
        ├─ core/                    跨页初始化
        │   ├─ app-init.js          每页入口：主题/性能/外壳/嵌入检测
        │   ├─ shell.js             site-header / site-footer 注入
        │   ├─ dock.js              右下角悬浮菜单
        │   ├─ theme.js             主题切换 + 跨 frame 同步
        │   ├─ perf-mode.js         性能模式
        │   └─ tool-page.js         工具页 header 薄壳（含 mountToolHeader）
        ├─ components/
        │   ├─ page-header.js       ★ 统一 header 组件（必用）
        │   ├─ toast.js             showToast API
        │   └─ dock.js
        ├─ utils/
        │   ├─ dom.js               $ / $$ / on / delegate / h / debounce / throttle / escapeHtml
        │   ├─ clipboard.js         copyText（带 fallback）
        │   └─ download.js          downloadBlob / downloadText
        ├─ data/
        │   └─ tools.js             ★ 唯一工具注册表 + 分类定义
        └─ pages/
            └─ home.js              工作台首页逻辑
    ├─ vendor/                        本地数据库 / 字典文件（不走 CDN）
    │   ├─ pinyin_dict.js         拼音字典（pinyin 工具使用）
    │   ├─ idcard_area.js         身份证省市数据（idcard_calc 使用）
    │   └─ areacode_data.js       行政区划数据（areacode 使用）
```

---

## 运行环境要求

### 必须通过 HTTP 访问

本项目使用原生 ES Modules，浏览器规范强制模块走 CORS，**`file://` 协议会被全部拒绝**。

### 推荐启动方式（任选其一）

```bash
# A. Python（Mac 自带）
cd v2 && python3 -m http.server 5173

# B. Node
npx http-server v2 -p 5173 -c-1

# C. VSCode Live Server 扩展
右键 v2/index.html → Open with Live Server
```

访问 `http://localhost:5173/`。

### 浏览器要求

- 支持 ES Modules、`import.meta`、CSS `color-mix()`、CSS `clamp()`、`:has()`。
- 即 Chrome/Edge/Safari/Firefox 最近 2 年的稳定版。

---

## CSS 架构

### 加载顺序（强制）

所有 HTML 文件必须按以下顺序引入全局样式：

```html
<link rel="stylesheet" href="../../public/styles/tokens.css">
<link rel="stylesheet" href="../../public/styles/themes.css">
<link rel="stylesheet" href="../../public/styles/base.css">
<link rel="stylesheet" href="../../public/styles/layout.css">
<link rel="stylesheet" href="../../public/styles/components.css">
<link rel="stylesheet" href="../../public/styles/utilities.css">
<!-- 可选：只有独有样式时 -->
<link rel="stylesheet" href="./tool.css">
```

顺序说明：
1. **tokens.css**：定义所有 CSS 变量。必须最先。
2. **themes.css**：明/暗主题、背景装饰。
3. **base.css**：reset + 原生标签基础样式 + Lucide SVG 图标基础样式（详见[图标系统](#图标系统-lucide)）。
4. **layout.css**：容器、页壳、`.tool-layout`、嵌入降级。
5. **components.css**：全局组件。
6. **utilities.css**：优先级高的原子类（`is-hidden` 等）。
7. **sidebar.css**（可选）：带侧栏的工具引入 `../_shared/sidebar.css`，放在 `utilities.css` 之后。
8. **preview-grid.css**（可选）：批量图片工具引入 `../_shared/preview-grid.css`，放在 `sidebar.css` 之后。
9. **tool.css**（可选）：工具独有样式，位于最后，覆盖权重最高。

### 侧栏布局变量

`grid-sidebar` / `grid-sidebar-r` 均使用 `var(--sidebar-w, 180px)`。需要自定义侧栏宽度时，在工具页 `:root` 或容器上设置 `--sidebar-w`：

```css
:root { --sidebar-w: 300px; }
```

### 不能做的事

- ❌ 在 `tool.css` 里覆盖全局选择器：`button`、`input`、`.btn`、`.input`、`.panel` 都**不能改**。
- ❌ 复制 `components.css` 里的 class 重命名使用。有需要就**直接用原名**。
- ❌ 写死颜色/字号/间距。
- ❌ 自行引入图标库。Lucide 已通过 `app-init.js` 全局加载，无需额外引入。

---

## 设计 Token 清单

所有 Token 在 `public/styles/tokens.css`。用 CSS 变量形式 `var(--xxx)` 引用。

### 颜色

| 变量 | 用途 |
|---|---|
| `--bg-page` | 页面主背景 |
| `--bg-surface` | 卡片/面板背景 |
| `--bg-surface-2` | 次级表面（如 input 背景、addon） |
| `--bg-inverse` | 反色背景（toast） |
| `--fg-base` | 正文 |
| `--fg-strong` | 标题、加粗内容 |
| `--fg-muted` | 辅助文字（subtitle） |
| `--fg-subtle` | 极弱文字（label/hint） |
| `--fg-invert` | 反色文字（深底上） |
| `--border-subtle` | 极淡描边（分割线） |
| `--border-base` | 常规描边 |
| `--border-strong` | 交互态描边 |
| `--color-brand` | 品牌主色 |
| `--color-brand-hover` | 主色 hover |
| `--color-brand-soft` | 主色浅底（tag/chip） |
| `--color-success` / `--color-warning` / `--color-danger` / `--color-info` | 语义色 |

### 字号

`--text-xs` / `--text-sm` / `--text-md` / `--text-lg` / `--text-xl` / `--text-2xl` / `--text-3xl` / `--text-4xl` / `--text-5xl`

> `--text-md` 是正文基准。禁止使用 `1rem`、`14px` 字面量。

### 间距

`--space-1` (4px) / `--space-2` (8px) / `--space-3` (12px) / `--space-4` (16px) / `--space-5` (20px) / `--space-6` (24px) / `--space-8` (32px) / `--space-10` (40px) / `--space-12` (48px) / `--space-16` (64px)

### 圆角

`--radius-sm` (6px) / `--radius-md` (10px) / `--radius-lg` (14px) / `--radius-xl` (20px) / `--radius-pill` (999px)

### 阴影

`--shadow-xs` / `--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-focus`

### 动效

`--dur-fast` (120ms) / `--dur-base` (200ms) / `--dur-slow` (280ms)
`--ease-standard` / `--ease-emph`

### 布局

`--container-max` (1240px) — 页面最大宽度
`--container-px` — 左右内边距（响应式）
`--header-h` (60px) — site-header 高度
`--dock-size` (48px) — 右下悬浮按钮尺寸

### z-index 层级

`--z-base` / `--z-sticky` / `--z-dock` / `--z-modal` / `--z-toast`

---

## 全局组件清单

全部定义在 `public/styles/components.css`。下面给出每个组件的 **最小 HTML 用法**。

### Button

```html
<button class="btn" type="button">默认</button>
<button class="btn is-primary" type="button">主要</button>
<button class="btn is-ghost" type="button">幽灵</button>
<button class="btn is-danger" type="button">危险</button>

<!-- 尺寸 -->
<button class="btn is-sm">小</button>
<button class="btn is-lg">大</button>
<button class="btn is-primary is-block">占满整行</button>

<!-- 按钮组 -->
<div class="btn-group">
  <button class="btn">A</button>
  <button class="btn">B</button>
</div>
```

### Form（表单）

```html
<div class="field">
  <label class="field-label" for="xxx">字段名</label>
  <input class="input" id="xxx" placeholder="提示">
  <span class="field-hint">额外说明</span>
  <span class="field-error">出错提示</span>
</div>

<select class="select"><option>A</option></select>

<textarea class="textarea" placeholder="多行…"></textarea>

<!-- 输入组（前缀/后缀） -->
<div class="input-group">
  <span class="addon">https://</span>
  <input class="input" placeholder="域名">
  <span class="addon">.com</span>
</div>
```

### Checkbox / Radio / Switch

```html
<label class="checkbox"><input type="checkbox"> 选项</label>
<label class="radio"><input type="radio" name="x"> 单选</label>

<label class="switch">
  <input type="checkbox">
  <span class="track"></span>
  <span class="thumb"></span>
</label>
```

### Panel / Card

```html
<!-- 通用面板（带 padding + 圆角 + 描边） -->
<div class="panel">
  <h3 class="panel-title">标题</h3>
  <p class="panel-sub">说明</p>
  <!-- 内容 -->
</div>

<!-- 卡片 -->
<div class="card">
  <div class="card-header">头部</div>
  <div class="card-body">
    <h4 class="card-title">卡片标题</h4>
    <p class="card-subtitle">副标题</p>
  </div>
  <div class="card-footer">底部</div>
</div>
```

### Tabs（切换）

```html
<div class="tabs" role="tablist" aria-label="xxx">
  <button class="tab-btn is-active" data-tab="a" type="button">A</button>
  <button class="tab-btn" data-tab="b" type="button">B</button>
</div>
```

> Tabs 是"胶囊药丸"造型，也用作设备切换/偏好切换/分类切换。凡是**多选一的按钮组**都用它，不要自造 chip、segment、filter-btn。

### Badge

```html
<span class="badge">默认</span>
<span class="badge is-brand">品牌色</span>
```

### Empty state

```html
<div class="empty-panel">
  <h3>未找到相关内容</h3>
  <p>换个条件试试。</p>
</div>
```

### Toast

不写 HTML，调 API：

```js
import { showToast } from '../../public/scripts/components/toast.js';
showToast('已复制', { type: 'success' });
showToast('出错了', { type: 'error' });
showToast('请输入内容', { type: 'warn' });
showToast('一般信息');
// 事件桥（inline 脚本也能用）
window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'hi' } }));
```

### Modal

```html
<div class="modal-backdrop" hidden>
  <div class="modal-panel">
    <div class="modal-header">标题</div>
    <div class="modal-body">内容</div>
    <div class="modal-footer">
      <button class="btn">取消</button>
      <button class="btn is-primary">确定</button>
    </div>
  </div>
</div>
```

### Result strip（一行结果展示条）

```html
<div class="result-strip">
  <span class="badge is-brand">MD5</span>
  <span class="u-break u-grow">abc123...</span>
  <button class="btn is-sm is-ghost">复制</button>
</div>
```

卡片式：带背景 + 圆角 + 虚线边框 + 等宽字体。用于 hash、密码等单条结果展示。

### Result row（左右结果行）

```html
<div class="result-row">
  <span class="u-muted">归属地</span>
  <strong>广东省 深圳市</strong>
</div>
```

行式：左 label 右 value，底部虚线分隔。用于查询结果（手机归属地、生肖详情等）纵向堆叠的多行信息。

### Range slider（滑块）

```html
<input type="range" min="0" max="100" value="50">
```

全局样式已在 `components.css` 定义，滑块拇指为品牌色（`--color-brand`），轨道为 `--bg-surface-2`。无需额外 class，直接用 `<input type="range">`。

### Data table（数据表格）

```html
<div style="overflow-x:auto">
  <table class="data-table">
    <thead><tr><th>列 A</th><th>列 B</th></tr></thead>
    <tbody>
      <tr><td>值 1</td><td>值 2</td></tr>
    </tbody>
  </table>
</div>
```

轻量表格：`th` 2px 底边框加粗、`td` 1px 虚底边、行 hover 高亮。用于批量数据展示（身份证查询等）。外层加 `overflow-x:auto` 防窄屏溢出。

### Stat grid（数字面板）

```html
<div class="stat-grid">
  <div class="stat">
    <div class="stat-label">字符数</div>
    <div class="stat-value">1,234</div>
  </div>
  <!-- 更多 stat -->
</div>
```

### Chip / Tag

```html
<!-- 基础 chip -->
<div class="chip">标签名</div>

<!-- 激活态 -->
<div class="chip is-active">已选中</div>

<!-- 带副文本（如邮编、代码） -->
<div class="chip">
  <span>北京市</span>
  <span class="chip-sub">100000</span>
</div>

<!-- 布局容器：流式排列 -->
<div class="grid-chips">
  <div class="chip">标签 A</div>
  <div class="chip is-active">标签 B</div>
  <div class="chip">标签 C</div>
</div>
```

适用场景：城市/区县选择、分类筛选、快捷标签等。

### List Item（侧边栏导航条目）

```html
<div class="grid-aside">
  <div class="list-item">项目 A</div>
  <div class="list-item is-active">项目 B（当前）</div>
  <div class="list-item">项目 C</div>
</div>
```

配合 `.grid-sidebar` + `.grid-aside` 使用，可构建"左侧导航 + 右侧内容"布局。

### Preview Stage（iframe 预览舞台）

```html
<!-- 预览容器 -->
<div class="preview-stage" data-device="desktop" data-preview>
  <iframe class="preview-frame" data-frame></iframe>
</div>
```

用于 `html_preview`、`web_preview` 等需要多设备尺寸切换的 iframe 预览工具。`data-device` 控制 iframe 尺寸：

| `data-device` | iframe 尺寸 | 说明 |
|---|---|---|
| `desktop` | 100% × 100% | 铺满容器 |
| `laptop` | 1440 × 900 | 笔记本（自动缩放） |
| `tablet` | 834 × 1194 | 平板竖屏 |
| `mobile` | 390 × 844 | 手机（圆角 24px） |

### Embedded CodeMirror（填满 flex 父容器）

```html
<div class="cm-embed" style="display:flex;flex-direction:column;height:100%">
  <textarea class="textarea" data-input="src"></textarea>
</div>
```

当 CodeMirror 需要撑满 flex 容器（如多编辑器面板）时，给父容器加 `.cm-embed`。内部 `.CodeMirror` 会自动 `flex:1`、去掉边框和圆角、取消 max-height 限制。

---

## Utility Class 清单

全部定义在 `public/styles/utilities.css`。用来**做局部排布**，不应大量嵌套。

| Class | 含义 |
|---|---|
| `is-hidden`, `[hidden]` | `display: none !important` |
| `sr-only` | 屏幕阅读器专用，视觉隐藏 |
| `u-text-center`, `u-text-right` | 对齐 |
| `u-mono` | 等宽字体 |
| `u-muted`, `u-strong` | 文字颜色快捷 |
| `u-truncate` | 单行省略 |
| `u-break` | 长文本强制换行 |
| `u-mt-0` / `u-mt-2` / `u-mt-4` / `u-mt-6` | 上外边距 |
| `u-mb-0` / `u-mb-2` / `u-mb-4` / `u-mb-6` | 下外边距 |
| `u-flex` / `u-row` / `u-col` | flex 容器 |
| `u-between` | `justify-content: space-between` |
| `u-gap-2`, `u-gap-3`, `u-gap-4` | gap |
| `u-grow` | `flex: 1` |
| `grid`, `grid-2`, `grid-3`, `grid-4`, `grid-auto`, `grid-auto-sm` | 网格布局 |
| `grid-sidebar` | 左 `var(--sidebar-w, 180px)` + 右自适应（sidebar + main） |
| `grid-sidebar-r` | 右 `var(--sidebar-w, 180px)` + 左自适应 |
| `grid-chips` | flex wrap 流式布局（gap: space-2） |
| `grid-aside` | 侧边栏滚动区（max-height + 右边框） |

**用法示例**：

```html
<div class="u-row u-between u-gap-3">
  <h3>标题</h3>
  <button class="btn is-sm">操作</button>
</div>

<div class="grid grid-3 u-gap-3">
  <input class="input"><input class="input"><input class="input">
</div>

<!-- sidebar + main 布局 -->
<div class="grid grid-sidebar">
  <div class="grid-aside">
    <div class="list-item is-active">导航 A</div>
    <div class="list-item">导航 B</div>
  </div>
  <div>
    <div class="grid-chips">
      <div class="chip is-active">城市 A</div>
      <div class="chip">城市 B <span class="chip-sub">100000</span></div>
    </div>
  </div>
</div>
```

---

## JS 架构与模块规则

### 模块分层

```
core/       跨页初始化、外壳注入。除非要改全局行为，否则不碰。
components/ 可复用的纯表现组件，导出函数 API。
utils/      无状态工具函数。只做纯计算/DOM 操作。
data/       只放数据与查询函数（如 tools.js）。
pages/      页面级脚本，import 上面三层拼装。
tools/<slug>/page.js  工具业务逻辑。
vendor/     本地数据库/字典（不走 CDN 的大文件），通过 <script> 全局注入。
```

### 引入路径

- 所有模块引用**相对路径**，不要用绝对路径或 bare specifier。
- 工具页 `page.js` 的相对起点是 `tools/<slug>/`，所以向上到 v2 根：`../../public/scripts/...`。
- 顶层 `index.html` / `about.html` 的起点是 `v2/`，使用 `./public/scripts/...`。

### vendor 文件引入规则

本地数据库 / 字典等大文件放在 `public/vendor/` 目录。因为它们不是 ES Module，在 `index.html` 里用 **`<script src>`** 全局注入，`page.js` 里通过 `typeof xxx !== 'undefined'` 做 guard：

```html
<!-- index.html -->
<script src="../../public/vendor/idcard_area.js"></script>
```

```js
// page.js
if (typeof provinceData === 'undefined') { showToast('数据未加载', { type: 'error' }); return; }
```

**禁止**将 vendor 文件放到工具自己的文件夹里（如 `tools/xxx/data.js`），统一走 `public/vendor/`。

### 必须复用的工具

```js
import { $, $$, on, delegate, h, debounce, throttle, escapeHtml } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadBlob, downloadText } from '../../public/scripts/utils/download.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { mountPageHeader } from '../../public/scripts/components/page-header.js';
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { findTool, TOOLS, CATEGORIES, categoryName } from '../../public/scripts/data/tools.js';
```

**禁止在 `page.js` 里自己重写 `document.querySelector` 的包装、debounce、escapeHtml、复制逻辑**。已经有的直接导入。

### Selector 风格

用 `data-*` 属性，不用 id/class 作为 JS 入口。这样样式与逻辑解耦。

```html
<button class="btn is-primary" data-action="calc">计算</button>
<input class="input" data-input="source">
```

```js
const runBtn = $('[data-action="calc"]');
const src    = $('[data-input="source"]');
on(runBtn, 'click', () => { /* ... */ });
```

---

## 页面外壳与工作台

### 工作台（index.html）

左侧 sidebar + 右侧 canvas（iframe 覆盖 welcome）的布局。**原则上不要改这个文件结构**，只在 `home.js` 里调内容。

Hash 路由：
- `#`（空）→ welcome 浏览视图
- `#/tool/<slug>` → 加载对应工具 iframe
- `#/page/<id>` → 加载站内页（目前只有 `about`）

### 嵌入模式（is-embedded）

`app-init.js` 自动检测 `window.self !== window.top`，在嵌入时给 `<html>` 加 `is-embedded` class。规则：

| 元素 | 非嵌入 | 嵌入（is-embedded） |
|---|---|---|
| `.site-header` / `.site-footer` / `.dock` | 显示 | 隐藏 |
| `.page-main` 垂直 padding | 标准 | **清零**（只靠 `.tool-layout` 的 padding） |
| 背景装饰（body::before） | 显示 | 隐藏 |
| 返回按钮点击 | 原生跳转 `../../index.html` | `window.top.location.hash = ''` 回到首页 |

### 单工具独立访问的结构

```html
<body data-page="tool" data-base-path="../../" data-tool-slug="<slug>">
  <div class="page-shell">
    <main class="page-main">
      <div class="container tool-layout">
        <header class="tool-header" data-tool-header></header>
        <div class="tool-body">
          <!-- 工具实际内容 -->
        </div>
      </div>
    </main>
  </div>
  <script type="module" src="../../public/scripts/core/app-init.js"></script>
  <script type="module" src="./page.js"></script>
</body>
```

**必填属性**：
- `data-tool-slug="<slug>"` —— 必须与 `tools.js` 注册表里的 slug 完全一致，`mountToolHeader()` 依赖它查元数据。
- `data-base-path="../../"` —— 给 shell 注入时计算相对路径用。
- `data-page="tool"` —— 标识页面类型。

---

## 统一页面 Header 规则

**所有页面的 header 必须通过 `mountPageHeader()` 或 `mountToolHeader()` 挂载。禁止手写 `.tool-header` 内部 HTML。**

### 挂载点

页面 HTML 里写一个空容器：

```html
<header class="tool-header" data-tool-header></header>
```

或自定义 data 名（非默认挂载点）：

```html
<header data-welcome-header></header>
```

### API

```js
import { mountPageHeader } from '../../public/scripts/components/page-header.js';

mountPageHeader({
  container: HTMLElement | undefined,  // 默认 [data-tool-header]
  slug: string | undefined,            // 若提供，从 TOOLS 注册表自动填 title/desc/eyebrow
  title: string,                       // 必填（除非用了 slug）
  desc: string | undefined,
  eyebrow: string | undefined,         // 右上角 badge 文字
  back: boolean,                       // 默认 true，显示"← 返回"按钮
  backHref: string | undefined         // 默认 '../../index.html'
});
```

### 三种标准调用

```js
// 工具页（最常见）：从注册表自动填充
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
mountToolHeader();   // 读 body[data-tool-slug]

// 首页 welcome（index.html / home.js）
mountPageHeader({
  container: $('[data-welcome-header]'),
  title: '全部工具',
  desc: '...',
  eyebrow: '共 10 个 · 10 已上线',
  back: false        // 首页不要返回按钮
});

// 关于页（about.html 内联脚本）
mountPageHeader({
  title: '关于 jqnest 工具箱',
  desc: '...',
  eyebrow: '关于',
  backHref: './index.html'
});
```

### 产出的 DOM 结构（永远一致）

```html
<header class="tool-header" data-tool-header>
  <div class="tool-header-top">       <!-- 永远渲染，min-height: 32px 保证垂直对齐 -->
    <a class="tool-back">← 返回</a>    <!-- back: false 时为隐形占位 <span> -->
    <span class="badge">eyebrow</span> <!-- 无 eyebrow 时不渲染 -->
  </div>
  <h1>Title</h1>
  <p class="tool-subtitle">Desc</p>
</header>
```

### 视觉规格

H1 与 subtitle 的字号/颜色/行距由 `layout.css:122-136` **单一处**定义，作用于所有 `.tool-header h1` 与 `.tool-header .tool-subtitle`。**任何页面都不得覆盖这两个选择器**。

---

## 新增一个工具的完整步骤

### 步骤 0：想清楚 slug

- 英文小写 + 下划线：`text_size`、`convert_length`、`grid_layout`
- 一个 slug 对应 `tools/<slug>/` 文件夹和 `tools.js` 里的一条记录。

### 步骤 1：注册到 `tools.js`

`v2/public/scripts/data/tools.js`：

```js
export const TOOLS = [
  // ...
  {
    slug: 'my_tool',                         // 必填，唯一
    title: '我的工具',                        // 必填，显示名
    desc: '一句话描述（会出现在卡片和 header）', // 必填
    category: 'dev',                         // 见 CATEGORIES
    icon: 'star',                               // Lucide 图标名（kebab-case，如 'shield-check'、'file-text'）
    tags: ['foo', 'bar'],                    // 可选，用于搜索
    status: 'ready'                          // 'ready' | 'planned'
  },
];
```

`status: 'planned'` 表示占位（展示为置灰卡片，不可点击）；`'ready'` 才会真正加载。

### 步骤 2：创建工具文件夹

```
v2/tools/my_tool/
├─ index.html
└─ page.js
```

可以参考 `v2/tools/_template.html`。

### 步骤 3：写 `index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的工具 · jqnest 工具箱</title>
  <link rel="stylesheet" href="../../public/styles/tokens.css">
  <link rel="stylesheet" href="../../public/styles/themes.css">
  <link rel="stylesheet" href="../../public/styles/base.css">
  <link rel="stylesheet" href="../../public/styles/layout.css">
  <link rel="stylesheet" href="../../public/styles/components.css">
  <link rel="stylesheet" href="../../public/styles/utilities.css">
  <!-- 只有真正需要时再引入 ./tool.css -->
</head>
<body data-page="tool" data-base-path="../../" data-tool-slug="my_tool">
  <div class="page-shell"><main class="page-main"><div class="container">
    <div class="tool-layout">
      <header class="tool-header" data-tool-header></header>
      <div class="tool-body">

        <!-- ★ 这里开始写你的业务 UI，只用全局 class ★ -->
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
          <div class="u-row u-gap-3 u-mt-4">
            <button class="btn is-primary" type="button" data-action="run">运行</button>
            <button class="btn" type="button" data-action="copy">复制</button>
            <button class="btn is-ghost" type="button" data-action="clear">清空</button>
          </div>
        </div>

      </div>
    </div>
  </div></main></div>
  <script type="module" src="../../public/scripts/core/app-init.js"></script>
  <script type="module" src="./page.js"></script>
</body>
</html>
```

### 步骤 4：写 `page.js`

```js
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();            // 渲染 header，文字从 tools.js 自动取

const src = $('[data-input="src"]');
const out = $('[data-output]');

function run() {
  if (!src.value.trim()) { showToast('请输入内容', { type: 'warn' }); return; }
  out.value = src.value.toUpperCase();  // 示例业务逻辑
}

on($('[data-action="run"]'),   'click', run);
on($('[data-action="copy"]'),  'click', async () => {
  if (!out.value) return;
  const ok = await copyText(out.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear"]'), 'click', () => { src.value = ''; out.value = ''; });
```

### 步骤 5（可选）：写 `tool.css`

**只在以下情况才允许：**

- iframe 宽高需要随设备类型切换（见 `html_preview` / `web_preview`）
- 需要特殊 canvas 背景（见 `grid_layout` 的斜线条纹）
- 需要原生 `<textarea>` 的 monospace 代码输入框外壳

**禁止**：用它来改按钮 hover 颜色、改 padding、改字号。

### 步骤 6：自测

1. `http://localhost:5173/tools/my_tool/index.html` 直接访问，独立形态完整可用。
2. `http://localhost:5173/#/tool/my_tool` 从工作台加载，header / 返回按钮 / 主题切换都正常。
3. 首页 sidebar "开发工具" 分类下有卡片，点击进入。
4. 右下角主题切换按钮按一下，看 dark mode 颜色正确。

---

## 新增全局组件的规则

当某个 UI 模式**在至少 2 个工具里重复出现**，才能升格为全局组件。

### 步骤

1. 在 `public/styles/components.css` 里新增选择器。
2. 用 Token 定义所有颜色/间距/圆角，**绝不 hardcode**。
3. 在本文件"[全局组件清单](#全局组件清单)"补充用法示例。
4. 把各处复制粘贴的 CSS 删干净，改用新组件 class。

### 命名约定

- 组件名：短横线分隔，小写。如 `.panel`、`.result-strip`、`.stat-grid`。
- 修饰符：`.is-primary`、`.is-active`、`.is-sm`、`.is-block`。
- 元素/子节点：`.card-header`、`.modal-body`。
- 原子工具类：`u-` 前缀。

### 可覆盖性

组件内如果有需要让外部覆盖的颜色/间距，**必须**通过 CSS 变量暴露：

```css
.btn {
  --_bg: var(--bg-surface);
  --_fg: var(--fg-strong);
  background: var(--_bg);
  color: var(--_fg);
}
.btn.is-primary {
  --_bg: var(--color-brand);
  --_fg: var(--fg-invert);
}
```

这样修饰符只改变量不碰具体属性。

---

## 禁止事项清单

打 ❌ 的都是代码评审会被直接打回的。

- ❌ 在 `tool.css` 里写 `.btn { padding: ... }` / `button { ... }` / `input { ... }`
- ❌ 重新定义 `.tabs` / `.tab-btn` / `.panel` / `.card` / `.field` / `.input`
- ❌ 手写 `.tool-header` 内部 HTML（必须走 `mountPageHeader`）
- ❌ 覆盖 `.tool-layout` 的 padding（**这个特别容易错，出错会导致首页/工具页 h1 不对齐**）
- ❌ 把 JS 逻辑写进 HTML 的 `onclick=""` 属性里
- ❌ 在 `page.js` 里做 `document.write` 或往 body 注入非工具自己的东西
- ❌ 直接在 CSS 里写死颜色、字号、间距（`#fff` / `16px` / `1rem` / `.5em` 等）
- ❌ 添加新的顶级 CSS 文件而不登记到 index.html 的加载顺序
- ❌ 用 jQuery、Lodash 这类重型库替代 `utils/dom.js`
- ❌ `<script type="module">` 里 import 绝对路径 `/public/...`（必须相对）
- ❌ 不注册进 `tools.js` 就创建工具文件夹
- ❌ 使用内联 SVG 或 emoji 作为 UI 图标（统一用 Lucide `<i data-lucide="xxx">`）
- ❌ 在 `tools.js` 的 `icon` 字段写 Unicode 字符（必须是 Lucide 图标名）

---

## 图标系统（Lucide）

全站使用 [Lucide](https://lucide.dev/) SVG 图标库（v1.11.0 UMD），通过 `app-init.js` 动态加载 `public/vendor/lucide.js` 并调用 `createIcons()` 自动替换：

```css
/* base.css */
.lucide { width: 1em; height: 1em; stroke-width: 2; vertical-align: -0.125em; flex-shrink: 0; }
```

### 用法

```html
<!-- 行内图标 -->
<i data-lucide="search"></i>

<!-- 指定大小 -->
<i data-lucide="upload" style="width:32px;height:32px"></i>

<!-- 在按钮里 -->
<button class="btn is-sm"><i data-lucide="scissors"></i> 裁剪</button>
```

### 命名规则

- 格式：kebab-case，如 `shield-check`、`file-text`、`arrow-left-right`
- 完整图标列表：<https://lucide.dev/icons>

### 在 tools.js 中的用法

`icon` 字段直接写 Lucide 图标名，渲染时自动包裹为 `<i data-lucide="xxx">`：

```js
{ slug: 'hash', title: '哈希计算', icon: 'shield-check', ... }
```

首页侧栏导航和工具卡片会自动渲染为 `<i data-lucide="shield-check"></i>`，由 Lucide 替换为 SVG。

### 动态渲染注意事项

如果通过 JS 动态插入含 `data-lucide` 的 HTML，插入后需调用：

```js
if (window.refreshIcons) window.refreshIcons(containerEl);
```

### 禁止事项

- ❌ 在单个 HTML 文件中另外引入图标库（已全局加载）
- ❌ 使用内联 SVG 或 emoji 作为 UI 图标（统一用 Lucide）
- ❌ 在 `icon` 字段填 Unicode 字符（如 `★`、`◐`），必须用 Lucide 图标名
- ❌ 使用不存在的图标名（新增前到 [lucide.dev/icons](https://lucide.dev/icons) 搜索确认）

---

## 共享侧栏模块

路径：`tools/_shared/sidebar.css`

适用于有右侧/左侧操作面板的工具（图片压缩、水印、PDF 转换等）。

### 引入方式

在 `index.html` 中，放在 `utilities.css` 之后：

```html
<link rel="stylesheet" href="../../public/styles/utilities.css">
<link rel="stylesheet" href="../_shared/sidebar.css">
```

### 提供的 class

| Class | 用途 |
|---|---|
| `.panel-title` | 面板标题（小号加粗 + 下边距） |
| `.opt-row` / `.preset-row` | flex 按钮行，子项可 `.active` 高亮 |
| `.tabs` | 药丸切换组 |
| `.range-row` | 滑块 + 数值显示行 |
| `.opt-card` | 带 radio/checkbox 的选项卡（`:has(input:checked)` 激活） |
| `.switch-list` / `.switch-item` | checkbox 开关列表 |
| `.act-group` | 操作按钮栈（全宽，垂直排列） |
| `.pos-grid` / `.pos-cell` | 3×3 九宫格位置选择器（水印工具） |
| `.field-label` | 小号 muted 标签 |
| `.hint` | 11px 辅助提示文字 |
| `.sep` | 分隔线 |

### 示例

```html
<aside>
  <div class="panel">
    <h3 class="panel-title">导出设置</h3>
    <div class="opt-row">
      <button class="btn is-sm active" data-fmt="png">PNG</button>
      <button class="btn is-sm" data-fmt="jpg">JPG</button>
    </div>
    <div class="range-row">
      <label>质量</label>
      <input type="range" min="1" max="100" value="80">
      <span class="val">80%</span>
    </div>
  </div>
  <div class="panel">
    <div class="act-group">
      <button class="btn is-primary" data-action="export">导出</button>
      <button class="btn is-ghost" data-action="reset">重置</button>
    </div>
  </div>
</aside>
```

---

## 共享上传模块

路径：`tools/_shared/upload-zone.js`

为拖拽上传区域提供统一的交互行为（蒙层、粘贴、点击触发 `<input type="file">`）。

### 引入方式

```js
import { initUploadZone } from '../_shared/upload-zone.js';

initUploadZone({
  dropEl:   $('[data-drop]'),      // 拖拽接收区域
  fileEl:   $('[data-file]'),      // <input type="file">
  onFiles:  (files) => { ... }     // 拿到 FileList 的回调
});
```

### 上传区域推荐 HTML

```html
<label class="panel" data-drop style="border-style:dashed;align-items:center;text-align:center;cursor:pointer;padding:var(--space-8)">
  <i data-lucide="upload" style="width:1.8rem;height:1.8rem;opacity:.35"></i>
  <div class="u-strong">拖拽文件到此处，或点击选择</div>
  <div class="u-muted" style="font-size:var(--text-xs)">支持 PNG / JPG / WebP</div>
  <input type="file" accept="image/*" hidden data-file>
</label>
```

> 图片/PDF 类上传统一用 `upload` 图标。

---

## 提交前自查清单

每个新工具 / 组件改动，请对照：

### 功能

- [ ] 已在 `tools.js` 注册，slug / category / status 正确
- [ ] 工具在 `http://localhost:5173/tools/<slug>/index.html` 独立打开正常
- [ ] 工具在 `http://localhost:5173/#/tool/<slug>` 嵌入模式正常
- [ ] 主题切换按钮在两种模式下都工作正常
- [ ] 返回按钮：独立模式跳首页，嵌入模式触发父页 `goHome`
- [ ] 搜索框在首页侧栏能搜到（title/desc/tags 里有关键词）
- [ ] 移动端宽度（<640px）查看，布局无横向滚动

### 代码

- [ ] `tool.css` 行数 ≤ 80，或不存在
- [ ] 没用任何不在全局 Token/组件里的颜色/字号/间距
- [ ] 所有按钮都是 `.btn` 变体
- [ ] 所有输入控件都是 `.input` / `.select` / `.textarea`
- [ ] 所有容器都是 `.panel` / `.card` / `.field`
- [ ] JS selector 全部走 `data-*` 而不是 id/class
- [ ] 导入了 `showToast` 而不是自己写 alert
- [ ] 导入了 `copyText` 而不是自己写 execCommand
- [ ] `tools.js` 中 `icon` 使用 Lucide 图标名（kebab-case）
- [ ] 没有使用内联 SVG 或 emoji 作为 UI 图标（统一 `data-lucide`）

### 性能/兼容

- [ ] DevTools Console 无 error
- [ ] DevTools Network 所有模块 200（无 404/CORS）
- [ ] 在 `data-performance="low"` 下不卡顿（关闭 hover transform、背景装饰等）

---

## 常见故障排查

### 卡片不显示、首页空白

**大概率是浏览器缓存**。`Cmd + Shift + R` 强刷。或在 DevTools Network 面板勾选 "Disable cache"。

如仍空白：打开 Console 看报错。`home.js` 有防御检测，缺关键 DOM 节点时会在页面顶部弹红框提示。

### `file://` 打开报 CORS 错误

见 [运行环境要求](#运行环境要求)。必须走 HTTP server。

### 工具页 h1 比首页 h1 往下偏

说明有人（或缓存）加了一条覆盖 `.tool-layout` padding 或 `.page-main` padding 的规则。`grep -r "tool-layout" public/styles` 检查唯一定义。

### 主题切换在 iframe 里不生效

`theme.js` 用 `storage` 事件跨 frame 同步。如果被 Safari 私密模式等环境阻止 localStorage，可能会失效——这种场景降级期望就是失效。

### 新工具点不开（卡片灰）

确认 `tools.js` 里 `status: 'ready'` 而不是 `'planned'`。

### "cryptojs / html2canvas / jspdf / qrcodejs 尚未加载"

这些第三方库通过 CDN 的 `<script defer>` 加载，慢网可能慢几百毫秒。工具代码需要用 `if (!window.xxx) { showToast('...', { type: 'warn' }); return; }` 做 guard，不要假设它一定存在。

---

## 附录：参考已上线工具

想动手前先参考这些"教科书式"实现：

| 场景 | 参考工具 | 关键看点 |
|---|---|---|
| 最小表单工具 | `meta` | 零 tool.css，纯 `.panel + .field + .input + .select + .btn` |
| 双 textarea 输入 | `text_deduplicate` | `.grid.grid-2` + `.textarea` + `.checkbox` |
| 多结果行展示 | `hash` | `.result-strip` + 动态 `copyText` 按钮 |
| 多设备 iframe 预览 | `web_preview`、`html_preview` | `data-device` 切换 + 受限 tool.css (~40 行) |
| 带画布的可视化 | `grid_layout` | sticky 左面板 + dashed 背景 + html2canvas 导出 |
| 纯算换算类 | `convert_length` / `convert_weight` | 复用 `components/unit-converter.js` |
| CDN 库 + textarea | `code_json`、`code_format` | js-yaml / js-beautify CDN 加载 + guard 检测 |
| Markdown / HTML 互转 | `markdown_html`、`html_markdown` | marked / turndown CDN + 视图 Tab 切换 |
| 大型本地数据库 | `areacode` | `vendor/areacode_data.js` + `.grid-sidebar` + `.list-item` + `.chip` |
| 批量 + 导出 Excel | `idcard_calc` | XLSX CDN + `vendor/idcard_area.js` + 分页表格 |
| JSONP 远程 API | `phone_localtion` | 动态 `<script>` + `.result-strip` |
| 带侧栏的图片工具 | `images_compress`、`images_convert` | `_shared/sidebar.css` + `_shared/preview-grid.css` + `_shared/upload-zone.js` + `grid-sidebar-r` |
| 水印工具 | `watermark_images`、`watermark_pdf` | `.pos-grid` 九宫格 + `.opt-row` 预设 + `.act-group` |
| Vue 替代方案 | `qrcode`、`zh_convert` | 旧版 Vue 已重写为原生 JS，复用全局组件 |

---

**本文档有疑义，以现有 "已上线并通过设计师确认" 的工具实际写法为准。有不清楚的先问再动手，不要边做边猜。**
