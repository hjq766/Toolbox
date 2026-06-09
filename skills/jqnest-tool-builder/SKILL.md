---
name: jqnest-tool-builder
description: Refactor or create tools in the jqnest toolbox project (tools/<slug>/). Use this skill when the user asks to refactor an existing tool to match the 2.x design system, create a new tool, apply design tokens, reuse shared modules (sidebar.css / upload-zone.js / code-editor.js / chart-core.js / chart-data.js / chart.css), or ensure a tool complies with project conventions (HTML skeleton, five-section page.js, data-* selectors, Lucide icons, no hardcoded values). Covers the current toolbox families: converters, image processors, code editors, text tools, realtime generators, database queries, watermark tools, ECharts chart tools, and file parser/viewer tools. Includes ready-to-copy templates for common categories and validation scripts.
license: MIT
---

# jqnest Tool Builder

一站式 skill：改版旧工具 / 新增工具，严格遵循 jqnest 2.x 设计系统与开发规范。

## 什么时候用这个 skill

- 用户说"按规范重构 `<slug>` 工具" / "改版 `<slug>`"
- 用户说"新增一个 xxx 工具"
- 用户说"这个工具不符合规范，修一下"
- 用户询问 jqnest 的设计 token / 组件 / 布局

## 关键前置事实

- **项目路径**：活跃代码在项目根目录；`old/` 是 1.0 历史版本，仅作迁移源参考，不直接修改
- **版本基线**：2.0 是全站重构版，2.1.0 是基于 2.0 新增工具后的正式迭代起点；当前实际版本以根目录 `version.json` 与 `public/scripts/data/changelog.js` 为准
- **更新日志双轨**：迭代期只在 `changelog.js` 当前版本 **prepend**；整理/发版时 **先**把全部 items 归档到 `docs/CHANGELOG_DEV.md`「原始流水」，**再**合并对外稿并同步「对外定稿」。详见 `docs/DEVELOPMENT.md` §Changelog 双轨
- **工具单元**：每个工具 = `tools/<slug>/index.html` + `page.js`（可选 `tool.css`，详见行数规范）
- **注册表**：`public/scripts/data/tools.js` — 新增工具**必改**此处，否则首页看不到
- **启动命令**：`python3 -m http.server 5173`
- **验证地址**：
  - `http://localhost:5173/tools/<slug>/index.html`（独立）
  - `http://localhost:5173/#/tool/<slug>`（工作台嵌入）
  - `http://localhost:5173/`（首页搜索）

## 核心工作流

### A. 改版旧工具（7 步）

```text
1. 读取 tools/<slug>/ 的 index.html + page.js
2. 对号入座（见 reference/tool-types.md）判断属于哪类工具家族
3. 用 grep 定位业务算法（保留不动）
4. 按 reference/layouts.md 选布局 + 按 assets/templates/<type>/ 复制模板改造
5. 重写 HTML：骨架严格按本文档 §HTML骨架，组件只用原名
6. 重写 page.js：五段式结构（见本文档 §JS结构）
7. 跑 scripts/check_skeleton.sh + scripts/check_tokens.sh 验证
```

### B. 新增工具（5 步）

```text
1. 设计 slug（英文小写 + 下划线）
2. 调用 scripts/scaffold.sh <slug> <type> 创建目录 + 文件
   注：scaffold.sh 会自动从 assets/templates/<type>/ 复制模板
3. 填充业务逻辑（替换模板 TODO 标记）
4. 启动本地服务器验证三种访问路径
5. 跑 scripts/check_checklist.sh 过一遍验收清单
```

## HTML 骨架（强制）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>工具名 · jqnest 工具箱</title>
  <!-- ★ 样式表顺序固定 -->
  <link rel="stylesheet" href="../../public/styles/tokens.css">
  <link rel="stylesheet" href="../../public/styles/themes.css">
  <link rel="stylesheet" href="../../public/styles/base.css">
  <link rel="stylesheet" href="../../public/styles/layout.css">
  <link rel="stylesheet" href="../../public/styles/components.css">
  <link rel="stylesheet" href="../../public/styles/utilities.css">
  <link rel="stylesheet" href="../_shared/sidebar.css">
</head>
<body data-page="tool" data-base-path="../../" data-tool-slug="<slug>">
  <div class="page-shell"><main class="page-main"><div class="container">
    <div class="tool-layout">
      <header class="tool-header" data-tool-header></header>
      <div class="tool-body">
        <!-- 业务 UI -->
      </div>
    </div>
  </div></main></div>
  <script type="module" src="../../public/scripts/core/app-init.js"></script>
  <script type="module" src="./page.js"></script>
</body>
</html>
```

**body 三件套必填**：`data-page="tool"` · `data-base-path="../../"` · `data-tool-slug="<slug>"`

## JS 结构（五段式）

```js
/* 0. 导入 */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
// 按需：copyText / downloadBlob / initUploadZone / createEditor

mountToolHeader();   // 第一句

/* 1. 常量 */       const FACTORS = {};
/* 2. 状态 */       let currentFile = null;
/* 3. DOM 引用 */   const btn = $('[data-action="run"]');
/* 4. 工具函数 */   function fmtSize(n) {}
/* 5. 事件绑定 */   on(btn, 'click', run);
```

## 禁止（违反则直接打回）

- `var(--radius)` → 用 `--radius-sm/md/lg/xl/pill`
- 硬编码 `#fff` / `16px` → 用 token
- 覆盖 `.btn` / `.panel` / `.tool-header` → 禁止
- `document.querySelector` → 用 `$`
- `alert()` → 用 `showToast`
- `execCommand('copy')` → 用 `copyText`
- 手写 `.tool-header` HTML → 用 `mountToolHeader()`
- 自造拖拽上传 → 用 `initUploadZone`
- 内联 SVG / emoji 图标 → 用 Lucide `<i data-lucide="xxx">`
- JS 用 id/class 作 hook → 只用 `data-*`
- vendor 文件放工具目录 → 放 `public/vendor/`
- 不注册 `tools.js` 就创建工具 → 必须先注册
- 通用 vendor 库在每个工具页重复脚注 → 写入 `attributions.js` / 关于页集中致谢；仅 API/数据集/合规声明用工具页脚注
- 工具页脚注乱写（左对齐 / 加 KB / 自造 class）→ 严格用 `components.md` §数据来源脚注 固定模板

## 深入资料索引（按需读取）

| 场景 | 读取文件 |
|---|---|
| 选布局 / 搭侧栏 | `reference/layouts.md` |
| 查 CSS 变量 | `reference/design-tokens.md` |
| 查组件类名 | `reference/components.md` |
| 判断工具类型 + 模板 | `reference/tool-types.md` |
| 共享模块 API（含图表模块） | `reference/shared-modules.md` |
| 反模式全清单 | `reference/anti-patterns.md` |

## 代码模板（按需复制）

| 工具类型 | 模板路径 |
|---|---|
| 空白起步（任意类型） | `assets/templates/_base/` |
| 单位换算器（线性） | `assets/templates/converter-linear/` |
| 单位换算器（非线性） | `assets/templates/converter-nonlinear/` |
| 图片处理器 | `assets/templates/image-tool/` |
| 代码编辑器 | `assets/templates/code-editor/` |
| 文本互转 | `assets/templates/text-tool/` |
| 实时生成器 | `assets/templates/generator/` |

每个模板包含最小可运行的 `index.html` + `page.js`，带 `// TODO` 标记需要填充的业务点。

## 自动化脚本

```bash
# 新工具脚手架（最常用）
scripts/scaffold.sh <slug> <type> "<title>" "<desc>" <category> <icon>

# 验证骨架完整性
scripts/check_skeleton.sh <slug>

# 扫描硬编码反模式
scripts/check_tokens.sh <slug>

# 过验收清单
scripts/check_checklist.sh <slug>
```

## 教科书示例工具（遇到边缘场景必查）

| 场景 | 参考工具 |
|---|---|
| 换算器（统一） | `tools/unit_converter/` |
| 多模式计算器（tabs + 自动算） | `tools/percent_calc/` · `tools/date_calc/` |
| 图片单文件 canvas | `tools/images_flip/` |
| 图片批量 + ZIP | `tools/images_convert/` |
| 代码编辑器（JSON / YAML 自动检测） | `tools/code_json/` |
| SQL 格式化（方言选择） | `tools/code_sql/` |
| CSS 可视化生成器 | `tools/css_border_radius/` · `tools/css_clip_path/` |
| 实时表单生成 | `tools/meta/` |
| 本地数据库 + 侧栏 | `tools/areacode/` |
| 水印（九宫格） | `tools/watermark_images/` |
| 图表工具（ECharts） | `tools/chart_bar/` |
| 文件解析/可视化查看器 | `tools/design_md/` |
| 工具页数据/API 脚注 | `tools/color_name/` · `tools/exchange_rate/` · `tools/lorem_generator/` |
| 开源组件集中致谢 | `about.html#opensource` · `public/scripts/data/attributions.js` |

## 设计 Token 速查（高频）

- 圆角：`--radius-sm`(6) / `--radius-md`(10) / `--radius-lg`(14) / `--radius-xl`(20) / `--radius-pill`(999) ⚠️ **没有裸 `--radius`**
- 间距：`--space-1`(4) ~ `--space-16`(64)
- 字号：`--text-xs` ~ `--text-5xl`
- 品牌色：`--color-brand` / `--color-brand-hover` / `--color-brand-soft` / `--color-brand-ring`
- 语义色：`--color-success` / `--color-warning` / `--color-danger` / `--color-info`
- 前景：`--fg-base` / `--fg-strong` / `--fg-muted` / `--fg-subtle` / `--fg-invert`
- 背景：`--bg-page` / `--bg-surface` / `--bg-surface-2`
- 边框：`--border-subtle` / `--border-base` / `--border-strong`

完整清单见 `reference/design-tokens.md`。

## 验收清单（完成时自查）

- [ ] 独立访问 `/tools/<slug>/index.html` 正常
- [ ] 嵌入访问 `#/tool/<slug>` 正常
- [ ] 首页能搜到（`tools.js` 有注册，新工具加 `updatedAt`，优化旧工具加 `improvedAt`）
- [ ] 改动已 prepend 到 `changelog.js` 当前版本（迭代期不删改旧行）；若用户要求整理/发版，先归档 `CHANGELOG_DEV.md` 原始流水再合并
- [ ] 移动端 <640px 无横向滚动
- [ ] `tool.css` 行数合规（≤100 行无需注释；101-200 行需文件头部写明原因；>200 行另需评估是否提取为 `_shared/*.css`）或不存在
- [ ] 无硬编码颜色/字号/间距/圆角
- [ ] 所有按钮 `.btn` 变体，所有输入 `.input`/`.select`/`.textarea`
- [ ] JS selector 全部 `data-*`
- [ ] 复用 `showToast` / `copyText` / `downloadBlob`
- [ ] 图标 Lucide `data-lucide="xxx"`
- [ ] DevTools Console 无报错
- [ ] 通用 vendor 库已记入 `attributions.js`（不必工具页重复）；若工具页有 API/数据集/合规脚注，须为 `field-hint u-muted` + `style="margin:0;text-align:center"`（见 `components.md` §数据来源脚注）
