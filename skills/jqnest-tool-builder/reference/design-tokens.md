# Design Tokens 完整清单

> 定义于 `v2/public/styles/tokens.css`，**所有颜色/字号/间距/圆角/阴影必须用变量**，禁止硬编码。

---

## 颜色（Colors）

### 背景

| Token | 用途 |
|---|---|
| `--bg-page` | 页面主背景 |
| `--bg-surface` | 卡片/面板背景（一级） |
| `--bg-surface-2` | 次级表面（悬浮层、hover 态） |

### 前景（文字）

| Token | 用途 |
|---|---|
| `--fg-base` | 正文（默认） |
| `--fg-strong` | 标题、强调 |
| `--fg-muted` | 辅助信息 |
| `--fg-subtle` | 极弱文字（placeholder 级别） |
| `--fg-invert` | 反色文字（用于深底、主色底上） |

### 边框

| Token | 用途 |
|---|---|
| `--border-subtle` | 分割线（极弱） |
| `--border-base` | 常规描边 |
| `--border-strong` | 交互态、hover |

### 品牌色

| Token | 用途 |
|---|---|
| `--color-brand` | 主色（按钮、链接、强调） |
| `--color-brand-hover` | 主色 hover |
| `--color-brand-soft` | 浅底（徽标底、提示底） |
| `--color-brand-alpha` | 带透明的主色（focus ring 等） |

### 语义色

| Token | 用途 |
|---|---|
| `--color-success` | 成功（toast success、可用状态） |
| `--color-warning` | 警告 |
| `--color-danger` | 危险（删除、错误） |
| `--color-info` | 信息 |

每个语义色还有 `-hover` / `-soft` 变体：`--color-success-hover`、`--color-danger-soft` 等。

---

## 字号（Font Size）

| Token | 典型值 | 用途 |
|---|---|---|
| `--text-xs` | 11px | 辅助 hint / 徽标 |
| `--text-sm` | 12px | 小标签、field-label |
| `--text-md` | 14px | **正文基准** |
| `--text-lg` | 16px | 列表标题、副标题 |
| `--text-xl` | 18px | 卡片标题 |
| `--text-2xl` | 22px | 面板大标题 |
| `--text-3xl` | 28px | 章节 |
| `--text-4xl` | 36px | 页面主标题（tool-header h1） |
| `--text-5xl` | 48px | 首页 hero |

---

## 间距（Space）

基于 4px 栅格。

| Token | 值 | 典型用途 |
|---|---|---|
| `--space-1` | 4 | 图标间距 |
| `--space-2` | 8 | 紧凑间距 |
| `--space-3` | 12 | field 内部 |
| `--space-4` | 16 | **默认间距** |
| `--space-5` | 20 | 面板内 padding |
| `--space-6` | 24 | 卡片间距 |
| `--space-8` | 32 | 大间距 |
| `--space-10` | 40 | 区块分隔 |
| `--space-12` | 48 | 大区块分隔 |
| `--space-16` | 64 | 超大间距 |

---

## 圆角（Radius）

⚠️ **常见陷阱**：没有裸 `--radius`，必须带尺寸后缀。写 `var(--radius)` 会回落到 0。

| Token | 值 | 用途 |
|---|---|---|
| `--radius-sm` | 6 | 小控件（input、checkbox） |
| `--radius-md` | 10 | **默认**（btn、field） |
| `--radius-lg` | 14 | 面板、卡片 |
| `--radius-xl` | 20 | 大卡片、modal |
| `--radius-pill` | 999 | 胶囊按钮、tag |

---

## 阴影（Shadow）

| Token | 用途 |
|---|---|
| `--shadow-xs` | 极弱（hover 提示） |
| `--shadow-sm` | 卡片静止态 |
| `--shadow-md` | 浮层、dropdown |
| `--shadow-lg` | modal、drawer |
| `--shadow-focus` | 焦点环（覆盖在 input 上） |

---

## 动效（Motion）

| Token | 值 | 用途 |
|---|---|---|
| `--dur-fast` | 120ms | 微交互（hover） |
| `--dur-base` | 200ms | **默认过渡** |
| `--dur-slow` | 280ms | 面板展开、tab 切换 |
| `--ease-standard` | `cubic-bezier(.2,.8,.2,1)` | 常规缓动 |
| `--ease-emph` | `cubic-bezier(.3,0,.1,1)` | 强调缓动 |

使用示例：`transition: background var(--dur-base) var(--ease-standard);`

---

## 布局（Layout）

| Token | 值 | 用途 |
|---|---|---|
| `--container-max` | 1240px | 容器最大宽度 |
| `--container-px` | clamp(…) | 容器左右 padding |
| `--header-h` | 60px | 站点 header 高度 |
| `--sidebar-w` | 180px | 网格默认侧栏宽（可被 `style="--sidebar-w:300px"` 覆盖） |

---

## z-index（Layering）

| Token | 用途 |
|---|---|
| `--z-base` | 默认 |
| `--z-sticky` | sticky header / aside |
| `--z-dock` | 底部 dock 栏 |
| `--z-modal` | 模态框 |
| `--z-toast` | toast 通知（最高） |

---

## 主题切换

`v2/public/styles/themes.css` 通过 `[data-theme="dark"]` 重新赋值这些 token，工具无需关心明暗适配，**只要用 token 就自动跟随**。

```css
/* 错误 */
.my-thing { background: #fff; color: #000; }

/* 正确 */
.my-thing { background: var(--bg-surface); color: var(--fg-base); }
```

---

## 快速查找

- 不确定用哪个 token 时，在 `v2/public/styles/tokens.css` 里搜关键词
- 遇到设计稿里的具体数值，先想"它属于哪个抽象层级"再选 token
- 色号接近但找不到匹配的 → 在 `tokens.css` 新增（需同步深色主题）；**不要硬编码救急**
