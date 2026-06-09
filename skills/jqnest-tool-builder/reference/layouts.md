# 6 种布局模式详解

> 布局 class 定义于 `public/styles/utilities.css`、`public/styles/layout.css` 与 `public/styles/browse.css`。改版时**优先从下列模式选一种**，不要自造。

---

## 1. `grid-sidebar-r`（左主 + 右侧栏）★ 默认首选

**占比**：60%+ 的工具使用此布局。

**适用**：换算器、图片处理、水印、实时生成器、带参数面板的工具。

```html
<div class="grid grid-sidebar-r" style="--sidebar-w:300px">
  <!-- 左：主内容区 -->
  <div>
    <div class="panel">主区内容（输入/预览/结果）</div>
  </div>

  <!-- 右：参数侧栏 -->
  <aside>
    <div class="panel">
      <h3 class="panel-title">参数分组 A</h3>
      <div class="opt-row">...</div>
    </div>
    <div class="panel">
      <h3 class="panel-title">参数分组 B</h3>
      <div class="range-row">...</div>
    </div>
    <div class="panel">
      <div class="act-group">
        <button class="btn is-primary" data-action="run">执行</button>
        <button class="btn is-ghost" data-action="reset">重置</button>
      </div>
    </div>
  </aside>
</div>
```

**侧栏宽度约定**：
- `260px` — 换算器（参数简单）
- `300px` — 默认值，图片类 / 复杂参数
- `320px` — 含特殊控件（3×3 九宫格、大滑块组）

**aside 行为**：
- 桌面端：sticky 固定，随主区滚动
- 移动端（<900px）：自动变为顺序流，侧栏在主区下方

---

## 2. `grid-sidebar`（左侧栏 + 右主）

**适用**：本地数据库浏览类（左导航列表 + 右内容）。

**代表工具**：`areacode`、`phone_localtion`

```html
<div class="grid grid-sidebar">
  <!-- 左：导航列表 -->
  <div class="grid-aside">
    <input class="input" placeholder="搜索..." data-input="search">
    <div class="list-item is-active" data-key="001">北京市</div>
    <div class="list-item" data-key="002">天津市</div>
    <div class="list-item" data-key="003">上海市</div>
  </div>

  <!-- 右：详情内容 -->
  <div>
    <div class="panel">
      <h2 data-title>北京市</h2>
      <div class="stat-grid">
        <div class="stat">
          <div class="stat-label">人口</div>
          <div class="stat-value">2189 万</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**关键配套**：`.grid-aside` 会自动处理滚动 + 粘性，`.list-item` 带 hover/active 状态。

---

## 3. `grid-2`（等分双栏）

**适用**：简单输入 → 输出文本工具（URL 编解码、Base64、大小写转换、文本去重）。

**代表工具**：`urlcode`、`base64`、`hex_convert`、`text_deduplicate`

```html
<div class="panel">
  <div class="grid grid-2">
    <div class="field">
      <label class="field-label" for="src">输入</label>
      <textarea class="textarea" id="src" data-input="src"
                placeholder="粘贴原文..."></textarea>
    </div>
    <div class="field">
      <label class="field-label" for="out">输出</label>
      <textarea class="textarea" id="out" data-output readonly></textarea>
    </div>
  </div>
  <div class="u-row u-gap-3 u-mt-4">
    <button class="btn is-primary" data-action="run">转换</button>
    <button class="btn" data-action="copy">复制结果</button>
    <button class="btn is-ghost" data-action="clear">清空</button>
  </div>
</div>
```

**扩展 grid**：`grid-3`（三等分）、`grid-4`（四等分）、`grid-auto`（自动填充）、`grid-auto-sm`（较密自动填充）。

---

## 4. 单面板 + 结果条（Result Strips）

**适用**：单输入 → 多结果展示（哈希值、编码输出、查询结果）。

**代表工具**：`hash`、`phone_localtion`

```html
<!-- 输入区 -->
<div class="panel">
  <div class="field">
    <label class="field-label">待计算文本</label>
    <textarea class="textarea" data-input="src"></textarea>
  </div>
  <button class="btn is-primary u-mt-3" data-action="run">计算</button>
</div>

<!-- 结果区（多条） -->
<div class="u-col u-gap-2 u-mt-4" data-results hidden>
  <div class="result-strip">
    <span class="badge is-brand">MD5</span>
    <span class="u-break u-grow u-mono" data-val="md5">—</span>
    <button class="btn is-sm is-ghost" data-copy>复制</button>
  </div>
  <div class="result-strip">
    <span class="badge is-brand">SHA-1</span>
    <span class="u-break u-grow u-mono" data-val="sha1">—</span>
    <button class="btn is-sm is-ghost" data-copy>复制</button>
  </div>
  <!-- 更多... -->
</div>
```

**关键**：初始 `data-results hidden`，计算完成后移除 hidden。

---

## 5. 多设备 iframe 预览

**适用**：HTML / 网页预览工具。

**代表工具**：`web_preview`、`html_preview`、`grid_layout`

```html
<div class="u-row u-between u-mb-3">
  <div class="tabs" data-device-tabs>
    <button class="tab-btn is-active" data-device="desktop">桌面</button>
    <button class="tab-btn" data-device="tablet">平板</button>
    <button class="tab-btn" data-device="mobile">手机</button>
  </div>
  <button class="btn is-sm" data-action="refresh">
    <i data-lucide="refresh-cw"></i> 刷新
  </button>
</div>

<div class="preview-wrapper" data-preview-wrapper>
  <iframe data-preview data-device="desktop"></iframe>
</div>
```

**特殊许可**：此类工具需写 `tool.css` 控制 `iframe[data-device="xxx"]` 的尺寸，通常 ≤ 30 行：

```css
.preview-wrapper { display: flex; justify-content: center; }
iframe[data-device="desktop"] { width: 100%; height: 70vh; }
iframe[data-device="tablet"]  { width: 768px; height: 1024px; }
iframe[data-device="mobile"]  { width: 375px; height: 667px; }
```

---

## 常见组合

### 换算器（grid-sidebar-r + 左内嵌 grid-2）

左主区每个面板内部用 `grid-2` 并排放两个换算字段：

```html
<div class="grid grid-sidebar-r" style="--sidebar-w:260px">
  <div class="u-col u-gap-4">
    <div class="panel">
      <h3 class="panel-title">公制</h3>
      <div class="grid grid-2">
        <div class="field">
          <label>米 (m)</label>
          <input class="input" type="number" data-unit="m">
        </div>
        <div class="field">
          <label>千米 (km)</label>
          <input class="input" type="number" data-unit="km">
        </div>
      </div>
    </div>
    <!-- 更多体系分组... -->
  </div>
  <aside>
    <!-- 快速输入 + 精度滑块 + 操作 -->
  </aside>
</div>
```

### 图片工具（grid-sidebar-r + 左纵向多 panel）

左主区自上而下：上传区 → 预览 → 文件信息

```html
<div class="grid grid-sidebar-r" style="--sidebar-w:300px">
  <div class="u-col u-gap-4">
    <label class="panel" data-drop>...</label>           <!-- 上传 -->
    <div class="panel" data-preview-panel hidden>...</div> <!-- 预览 canvas -->
    <div class="panel" data-info-panel hidden>...</div>    <!-- 文件信息 -->
  </div>
  <aside>
    <!-- 参数 + 操作 -->
  </aside>
</div>
```

---

## 6. Browse / Reference（浏览速查）★ 数据集浏览类

**适用**：本地数据集即时筛选 + Tab 分类 + 卡片/芯片/网格内容（符号大全、色卡、首都、HTTP 状态码等）。

**代表工具**：`special_symbols`、`emoji`、`html_query`、`capital`、`color_gradient`、`http_status`、`areacode`（仅搜索条，无 Tab）；`color_name` 色表区为复合工具内的 `browse-section`。

**引入**（`index.html`）：

```html
<link rel="stylesheet" href="../../public/styles/browse.css">
```

**骨架**（控制区无 panel，内容区扁平）：

```html
<div class="browse-head">
  <div class="browse-toolbar">
    <label class="search-shell">
      <i data-lucide="search" class="search-icon" aria-hidden="true"></i>
      <input class="search-box" type="search" data-search placeholder="搜索…" autocomplete="off">
    </label>
    <span class="browse-toolbar__meta" data-status></span>
    <!-- 可选：browse-toolbar__actions 放「换一批」等 -->
  </div>
  <div data-tabs role="tablist"></div>
</div>

<div class="browse-body" data-content></div>
<p class="browse-foot field-hint u-muted">数据来源脚注…</p>
```

**约定**：
- 控制区（搜索 + Tab）**不用** `.panel`
- 内容区（芯片/网格/列表）**不用** `.panel`
- Tab 用 `mountBrowseTabs()`（`tools/_shared/browse-tabs.js`），始终横滑、标准字号
- 复合工具内独立浏览块用 `.browse-section` + `.browse-section-head`

### 提交查询（非即时筛选）

仅 `meta_fetch` 等需主动触发的工具用 `.query-bar`，输入区可保留 `.panel`：

```html
<div class="query-bar">
  <input class="input" data-input placeholder="…">
  <button class="btn is-primary" type="button" data-action="fetch">抓取</button>
  <div class="field-error" data-error hidden></div>
</div>
```

---

## 响应式规则

| 布局 | 桌面 | 平板（640-900px） | 手机（<640px） |
|---|---|---|---|
| `grid-sidebar-r` | 左主 + 右侧 sticky | 顺序流，侧栏在下 | 顺序流 |
| `grid-sidebar` | 左导航 + 右内容 | 顺序流 | 顺序流 |
| `grid-2` | 等分 | 等分 | 堆叠 |
| `grid-auto` | 自适应多列 | 自适应 | 堆叠 |

**禁止**在 `tool.css` 里覆盖响应式，全局已处理好。
