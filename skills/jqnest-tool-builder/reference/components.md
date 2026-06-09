# 组件库速查

> 组件样式定义于 `public/styles/components.css`。**有原名就用原名**，严禁另造 class。

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

**浏览速查类**（符号/色卡/首都等）：Tab 由 `mountBrowseTabs()` 统一渲染，始终单行横滑、**标准 tab-btn 尺寸**（不缩小字号）；容器只需 `<div data-tabs role="tablist"></div>`。

其它工具少量选项（2–5 个）手写 `.tabs` 即可，可自动换行；`.is-scroll` 仅在手写多分类横滑时使用。

---

## Browse 浏览速查（`browse.css`）

数据集浏览类工具引入 `public/styles/browse.css`，完整骨架见 `layouts.md` §6。

| Class | 用途 |
|---|---|
| `.browse-head` | 搜索 + Tab 控制区（无 panel） |
| `.browse-toolbar` | 全宽搜索行 + 右侧 meta/actions |
| `.browse-toolbar__meta` | 「共 N 个」「找到 N 条」 |
| `.browse-toolbar__actions` | 换一批等辅助按钮组 |
| `.browse-body` | 芯片/网格/列表内容区 |
| `.browse-foot` | 居中数据来源脚注 |
| `.browse-section` | 复合工具内的独立浏览块 |
| `.query-bar` | 主动提交查询（仅 meta_fetch 等），非即时筛选 |

浏览 Tab JS：`import { mountBrowseTabs } from '../_shared/browse-tabs.js'`，统一 `data-cat`，自动 `is-scroll`。

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
<div class="table-scroll">
  <table class="data-table">
    <thead><tr><th>列 A</th><th>列 B</th></tr></thead>
    <tbody>
      <tr><td>值 1</td><td>值 2</td></tr>
    </tbody>
  </table>
</div>
```

轻量表格：自带 th 加粗底线 + td 浅底线 + 行 hover 高亮。外层加 `overflow-x:auto` 防窄屏溢出。

### Upload Panel（上传区）

```html
<label class="panel u-col u-gap-2 upload-panel" data-drop>
  <i data-lucide="upload"></i>
  <div class="u-strong">点击或拖拽文件到此处</div>
  <div class="u-muted u-text-xs">支持 JPG/PNG/WebP · 支持粘贴上传</div>
  <input type="file" accept="image/*" hidden data-file>
</label>
```

用于单图或批量文件上传区。交互能力仍由 `_shared/upload-zone.js` 提供。

变体：嵌在已有 `.panel` 内部时使用 `upload-panel is-inner`；需要 2px 虚线边框时加 `is-strong`；小上传区可加 `is-compact` 或 `is-comfortable`。

### Progress（进度条）

```html
<div class="progress">
  <div class="progress-bar" style="--progress:40%"></div>
</div>
```

JS 中优先更新 CSS 变量：`bar.style.setProperty('--progress', '40%')`。

### Status Badge（处理状态）

```html
<span class="status-badge is-pending">待处理</span>
<span class="status-badge is-processing">处理中</span>
<span class="status-badge is-done">完成</span>
<span class="status-badge is-fail">失败</span>
```

### Summary Grid（结果汇总）

```html
<div class="summary-grid">
  <div class="summary-item">
    <div class="val highlight">42%</div>
    <div class="label">平均节省</div>
  </div>
</div>
```

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
| `u-text-xs` / `u-text-sm` | 小字号快捷 |
| `u-mono` | 等宽字体 |
| `u-muted` / `u-strong` | 弱化 / 强化颜色 |
| `u-truncate` | 单行省略 |
| `u-break` | 强制换行（长 URL） |
| `u-nowrap` | 禁止换行 |
| `u-mt-0/2/3/4/6` / `u-mb-*` | 上下外边距 |
| `u-pt-*` / `u-pb-*` | 上下内边距 |
| `u-flex` / `u-row` / `u-col` | flex 容器（默认/横/竖） |
| `u-items-start/center/end` | flex 交叉轴对齐 |
| `u-between` | `justify-content: space-between` |
| `u-gap-2/3/4/6` | gap（8/12/16/24） |
| `u-grow` | `flex: 1` |
| `u-min-0` | 防止 flex/grid 子项撑破 |
| `u-no-shrink` | `flex-shrink: 0` |
| `u-clickable` | `cursor: pointer` |
| `icon-16/18/20/24` | 常用图标尺寸 |

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

## 数据来源脚注（第三方库 / 数据集）

### 何时用工具页脚注 vs 关于页集中致谢

| 场景 | 处理方式 |
|---|---|
| `public/vendor/` 通用开源库（ECharts、PDF.js、qrcodejs、crypto-js 等） | **关于页「开源组件」**集中列出（`attributions.js` / `NOTICE.md`），工具页**不必重复** |
| 外部 API（汇率、IP 查询等） | 工具页脚注：写清数据来自哪个 API |
| 权威标准 / 注册表（IANA、WHATWG、Unicode 等） | 工具页脚注 |
| 静态数据集且与工具卖点强绑定（色表、Emoji、拼音字典等） | 工具页脚注：写清数据仓库 + 可选本站扩展说明 |
| 合规 / 虚构数据声明（如模拟数据生成） | 工具页脚注 |
| GPL 等需单独提示的许可 | 工具页脚注或关于页均可，calendar 等须在工具页说明扩展与许可 |

纯自研、无外部依赖的工具可省略脚注。

### 工具页脚注（仅以上「须单独说明」场景）

### 固定 HTML 模板（class 与 style 不得改）

```html
<p class="field-hint u-muted" style="margin:0;text-align:center">
  数据/核心来自开源项目
  <a href="https://github.com/xxx/yyy" target="_blank" rel="noopener noreferrer">xxx/yyy</a>
  （MIT）。
</p>
```

**要点**：
- 必须**居中**：`style="margin:0;text-align:center"` 写死在 `<p>` 上
- 禁止用 `u-mt-*` / `u-mb-*` 替代；禁止省略 `text-align:center`（否则会左对齐）
- 外链必须 `target="_blank" rel="noopener noreferrer"`

### 链接怎么选（优先 GitHub / Gitee，但有例外）

**默认原则**：脚注里的来源链接，**尽量**指向 GitHub、Gitee 等代码托管平台（`owner/repo` 形式），而不是个人站、论坛帖、已停更的第三方页面。

| 场景 | 推荐链接 | 说明 |
|---|---|---|
| `public/vendor/` 来自开源项目 | 该项目的 **GitHub / Gitee 仓库** | 用户可核对许可证、版本、issue；比零散网页更稳定 |
| 数据经某仓库打包/redistribute | 打包仓库（如 `sxei/pinyinjs`） | 脚注链「你实际引用的那份」，正文可一句带过原始出处 |
| **无**稳定开源托管 | 最权威的**官方**页面 | 如 IANA 注册表、WHATWG 规范、厂商官方 API 文档 |
| 官方 API（微信、地图等） | **官方域名**（如 `open.weixin.qq.com`） | 链 GitHub 上的非官方封装反而误导 |

**为什么倾向 GitHub/Gitee（但不是绝对）**：
- ✅ 仓库通常比个人小站更长寿，HTTPS 稳定，便于核对 LICENSE
- ✅ 与「本地 vendor 来自某开源项目」的叙事一致，说服力更强
- ⚠️ GitHub 也会删库、改名、转移；链接仍可能失效
- ⚠️ 规范/标准类数据，**官方注册表比某个 mirror 仓库更权威**（如 `http_status` → IANA，不应硬换 GitHub）

**反例**：拼音字典曾链 `zi.artx.cn`——本站实际用的是 `pinyinjs` 仓库里的打包字典，改链 `sxei/pinyinjs` 更准确。

### 正文只写什么

| ✅ 要写 | ❌ 不要写 |
|---|---|
| 来源名称 + 链接（优先 GitHub/Gitee，见上表） | 文件体积（「约 79KB」「18KB」） |
| 许可证（MIT、GPL-3.0 等） | 「本地静态加载」等实现细节 |
| 上游项目（如「基于 mumuy/relationship 重构」） | 性能数据、缓存策略 |
| 本站扩展说明（如 calendar 的节日/五行） | 与溯源无关的废话 |
| API/CDN 类工具可写获取方式（如 exchange_rate 的 CDN 缓存） | 把脚注当 changelog 用 |
| 标准/官方源可注明「基于 Unicode / IANA / WHATWG」 | 为凑 GitHub 而链非官方 fork |

### 参考示例

| 场景 | 工具 |
|---|---|
| 本地 vendor 库 | `tools/relationship/` · `tools/color_name/` |
| vendor + 本站扩展 | `tools/calendar/` |
| 外部 API | `tools/exchange_rate/` |
| 标准数据集 | `tools/http_status/` · `tools/html_query/` |

---

## 禁止事项

- 在 `tool.css` 里覆盖任何上述组件的默认样式
- 自造相同功能的 class（例：已有 `.tabs` 就不要造 `.nav-segments`）
- 在 `.btn` 上加 inline `style="..."` 改尺寸/颜色
- 用 `.panel` 嵌套 `.panel`（应该用 `.field` 或 `.u-col`）
