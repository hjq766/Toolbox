# 组件库速查

> 组件样式定义于 `v2/public/styles/components.css`。**有原名就用原名**，严禁另造 class。

---

## 按钮（Button）

```html
<!-- 基础变体 -->
<button class="btn">默认</button>
<button class="btn is-primary">主要操作</button>
<button class="btn is-ghost">次要/幽灵</button>
<button class="btn is-danger">危险操作</button>

<!-- 尺寸 -->
<button class="btn is-sm">小按钮</button>
<button class="btn is-lg">大按钮</button>

<!-- 宽度 -->
<button class="btn is-primary is-block">占满整行</button>

<!-- 带图标 -->
<button class="btn is-primary">
  <i data-lucide="download"></i>
  下载
</button>

<!-- 按钮组（紧密排列） -->
<div class="btn-group">
  <button class="btn">上一步</button>
  <button class="btn is-primary">下一步</button>
</div>

<!-- 禁用 -->
<button class="btn" disabled>不可用</button>
```

**使用原则**：
- **一个界面只能有一个 `is-primary`**（唯一主要操作）
- 重置/取消用 `is-ghost`
- 删除/清空用 `is-danger`（若需要强提示）或 `is-ghost`
- 图标按钮：icon 写在文字前，用空格分隔

---

## 表单（Form）

### 基础输入

```html
<div class="field">
  <label class="field-label" for="my-input">字段名</label>
  <input class="input" id="my-input" type="text" placeholder="请输入…">
  <span class="field-hint">辅助说明文字</span>
</div>
```

### 下拉

```html
<select class="select" data-input="format">
  <option value="png">PNG</option>
  <option value="jpg">JPG</option>
</select>
```

### 多行文本

```html
<textarea class="textarea" data-input="src" placeholder="粘贴内容…"></textarea>
```

### 带前后缀（Input Group）

```html
<div class="input-group">
  <span class="addon">https://</span>
  <input class="input" placeholder="域名">
  <span class="addon">.com</span>
</div>
```

### 错误状态

```html
<input class="input is-error" value="错误值">
<span class="field-hint is-error">此处必填</span>
```

---

## 选择控件（Choice）

### Checkbox

```html
<label class="checkbox">
  <input type="checkbox" checked>
  <span>启用缩略图</span>
</label>
```

### Radio

```html
<label class="radio">
  <input type="radio" name="mode" value="a" checked>
  <span>模式 A</span>
</label>
<label class="radio">
  <input type="radio" name="mode" value="b">
  <span>模式 B</span>
</label>
```

### Switch（开关）

```html
<label class="switch">
  <input type="checkbox">
  <span class="track"></span>
  <span class="thumb"></span>
</label>
<!-- 配合 .switch-list / .switch-item 用于参数开关列表，见 sidebar.css -->
```

---

## 容器（Container）

### Panel（主力容器）

```html
<div class="panel">
  <h3 class="panel-title">标题</h3>
  <p class="panel-sub">副标题/说明</p>
  <!-- 内容 -->
</div>
```

**必选样式变体**：`.panel` 本身已内置 padding + 圆角 + 背景。**禁止在 `tool.css` 里改 panel**。

### Card（复杂卡片）

```html
<div class="card">
  <div class="card-header">
    <h4 class="card-title">标题</h4>
    <p class="card-subtitle">副标题</p>
  </div>
  <div class="card-body">内容</div>
  <div class="card-footer">
    <button class="btn is-sm">操作</button>
  </div>
</div>
```

### Field（表单字段包装）

```html
<div class="field">
  <label class="field-label">标签</label>
  <!-- 输入控件 -->
  <span class="field-hint">提示</span>
</div>
```

---

## Tabs（切换）

```html
<div class="tabs" role="tablist">
  <button class="tab-btn is-active" data-tab="a">选项 A</button>
  <button class="tab-btn" data-tab="b">选项 B</button>
  <button class="tab-btn" data-tab="c">选项 C</button>
</div>
```

**原则**：凡是"多选一"按钮组都用 `.tabs`，**不要**自造 `chip-btn` / `segment` / `filter-btn`。

---

## Badge / Chip

### Badge（徽标，无交互）

```html
<span class="badge">普通</span>
<span class="badge is-brand">品牌</span>
<span class="badge is-success">成功</span>
<span class="badge is-danger">错误</span>
```

### Chip（可点击标签）

```html
<div class="grid-chips">
  <div class="chip is-active" data-key="a">
    标签 A
    <span class="chip-sub">副文字</span>
  </div>
  <div class="chip" data-key="b">标签 B</div>
</div>
```

---

## 结果展示

### Result Strip（单行结果条 — 卡片式）

```html
<div class="result-strip">
  <span class="badge is-brand">MD5</span>
  <span class="u-break u-grow u-mono">abc123...</span>
  <button class="btn is-sm is-ghost" data-copy>复制</button>
</div>
```

带背景 + 圆角 + 虚线边框 + 等宽字体。用于 hash、密码等单条结果展示。

### Result Row（左右结果行）

```html
<div class="result-row">
  <span class="u-muted">归属地</span>
  <strong>广东省 深圳市</strong>
</div>
```

行式：左 label 右 value，底部虚线分隔。用于查询结果（手机归属地、生肖详情等）纵向堆叠的多行信息。**注意**：与 `.result-strip` 是两个不同的组件。

### Range Slider（滑块）

```html
<input type="range" min="0" max="100" value="50">
```

全局样式已定义，滑块拇指为品牌色（`--color-brand`），轨道为 `--bg-surface-2`。无需额外 class。

### Data Table（数据表格）

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

轻量表格：自带 th 加粗底线 + td 浅底线 + 行 hover 高亮。外层加 `overflow-x:auto` 防窄屏溢出。

### Stat Grid（统计卡片）

```html
<div class="stat-grid">
  <div class="stat">
    <div class="stat-label">字数</div>
    <div class="stat-value">1234</div>
  </div>
  <div class="stat">
    <div class="stat-label">字符</div>
    <div class="stat-value">5678</div>
  </div>
</div>
```

### List Item（列表项）

```html
<div class="grid-aside">
  <div class="list-item is-active">当前选中</div>
  <div class="list-item">普通项</div>
</div>
```

### Empty（空状态）

```html
<div class="empty-panel">
  <i data-lucide="search" style="width:3rem;height:3rem;opacity:.3"></i>
  <h3>没有结果</h3>
  <p>换个关键词试试</p>
</div>
```

---

## Modal（模态框）

```html
<div class="modal-backdrop" hidden data-modal>
  <div class="modal-panel">
    <div class="modal-header">
      <h3>标题</h3>
      <button class="btn is-sm is-ghost" data-modal-close>
        <i data-lucide="x"></i>
      </button>
    </div>
    <div class="modal-body">内容</div>
    <div class="modal-footer">
      <button class="btn is-ghost" data-modal-close>取消</button>
      <button class="btn is-primary" data-confirm>确定</button>
    </div>
  </div>
</div>
```

JS 控制：
```js
const modal = $('[data-modal]');
on($('[data-action="open"]'), 'click', () => modal.hidden = false);
on($$('[data-modal-close]'), 'click', () => modal.hidden = true);
```

---

## Toast（通知）— JS 调用

```js
import { showToast } from '../../public/scripts/components/toast.js';

showToast('已复制');                             // 默认（info）
showToast('导出成功', { type: 'success' });
showToast('请先上传图片', { type: 'warn' });
showToast('计算失败', { type: 'error' });
showToast('长消息', { type: 'info', duration: 5000 });
```

---

## Utility 类速查

| Class | 含义 |
|---|---|
| `is-hidden` / `[hidden]` | `display: none !important` |
| `sr-only` | 屏幕阅读器专用 |
| `u-text-center` / `u-text-right` | 对齐 |
| `u-mono` | 等宽字体 |
| `u-muted` / `u-strong` | 弱化 / 强化颜色 |
| `u-truncate` | 单行省略 |
| `u-break` | 强制换行（长 URL） |
| `u-mt-0/2/3/4/6` / `u-mb-*` | 上下外边距 |
| `u-pt-*` / `u-pb-*` | 上下内边距 |
| `u-flex` / `u-row` / `u-col` | flex 容器（默认/横/竖） |
| `u-between` | `justify-content: space-between` |
| `u-gap-2/3/4/6` | gap（8/12/16/24） |
| `u-grow` | `flex: 1` |

### Grid 类

| Class | 含义 |
|---|---|
| `grid` | 启用 grid |
| `grid-2/3/4` | 等分 2/3/4 列 |
| `grid-auto` | `auto-fit` 自动填充，最小 220px |
| `grid-auto-sm` | `auto-fit` 较密，最小 160px |
| `grid-sidebar` | 左侧栏 + 右主（`var(--sidebar-w,180px)`） |
| `grid-sidebar-r` | 左主 + 右侧栏（同上，反向） |
| `grid-chips` | flex wrap 流式（chip 容器） |
| `grid-aside` | 侧栏滚动区（带 sticky） |

---

## Preview Stage（iframe 预览舞台）

```html
<div class="preview-stage" data-device="desktop" data-preview>
  <iframe class="preview-frame" data-frame></iframe>
</div>
```

用于 `html_preview`、`web_preview` 等需要多设备尺寸切换的 iframe 预览工具。通过 `data-device` 属性切换 iframe 尺寸：

| `data-device` | iframe 尺寸 | 说明 |
|---|---|---|
| `desktop` | 100% × 100% | 铺满容器 |
| `laptop` | 1440 × 900 | 笔记本（自动缩放） |
| `tablet` | 834 × 1194 | 平板竖屏 |
| `mobile` | 390 × 844 | 手机（圆角 24px） |

**注意**：`.preview-stage` 本身是 `position:relative` + `overflow:hidden` + flex 居中。非 desktop 模式下 `.preview-frame` 为 `position:absolute`，需要 JS 配合 `transform:scale()` 来适配容器。

---

## Embedded CodeMirror（填满 flex 父容器）

```html
<div class="cm-embed" style="display:flex;flex-direction:column;height:100%">
  <textarea class="textarea" data-input="src"></textarea>
</div>
```

当 CodeMirror 编辑器需要撑满 flex 父容器时（如多面板编辑器布局），给父容器加 `.cm-embed`。效果：

- `.CodeMirror` → `flex:1; height:100%!important; max-height:none`
- 去掉边框和圆角
- 去掉 focus 时的 box-shadow

典型用于 `html_preview`（3 个并排编辑器面板）。

---

## 禁止事项

- 在 `tool.css` 里覆盖任何上述组件的默认样式
- 自造相同功能的 class（例：已有 `.tabs` 就不要造 `.nav-segments`）
- 在 `.btn` 上加 inline `style="..."` 改尺寸/颜色
- 用 `.panel` 嵌套 `.panel`（应该用 `.field` 或 `.u-col`）
