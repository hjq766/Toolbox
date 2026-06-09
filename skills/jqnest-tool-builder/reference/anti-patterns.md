# 反模式清单（❌ 禁止出现）

> 代码评审会直接打回的错误做法，**一条都不许出现**。

---

## CSS / 样式

| ❌ 错误写法 | ✅ 正确写法 | 原因 |
|---|---|---|
| `border-radius: var(--radius)` | `border-radius: var(--radius-md)` | 没有裸 `--radius`，回落为 0 |
| `color: #fff` | `color: var(--fg-invert)` | 硬编码破坏主题切换 |
| `padding: 16px` | `padding: var(--space-4)` | 硬编码不随栅格 |
| `font-size: 14px` | `font-size: var(--text-md)` | 硬编码破坏字号体系 |
| 在 `tool.css` 里写 `.btn { padding: ... }` | 不写 | 不可覆盖组件样式 |
| 在 `tool.css` 里重定义 `.panel` / `.card` / `.input` | 不写 | 违反单一来源 |
| 覆盖 `.tool-layout` 或 `.tool-header` 样式 | 不写 | 会导致全站对齐错乱 |
| 复制 `components.css` 的 class 改名用 | 用原名 | 污染组件库 |
| 新增顶级 CSS 文件却不登记到 `index.html` | 按顺序插入 `link` | 违反加载顺序 |
| 在 HTML inline 写 `<div style="display:flex">` | 用 `u-row` / `u-col` | 复用 utility 类 |

---

## HTML

| ❌ 错误 | ✅ 正确 | 原因 |
|---|---|---|
| 手写 `<header class="tool-header">...</header>` 内部 HTML | `<header class="tool-header" data-tool-header></header>` + JS `mountToolHeader()` | 必须由 JS 注入，保证全站一致 |
| 用内联 SVG 作 UI 图标 | `<i data-lucide="xxx"></i>` | Lucide 图标已全局加载 |
| 用 emoji 作 UI 图标（`★` `◐`） | Lucide `data-lucide` | 无主题适配 |
| `tools.js` 的 `icon` 填 `★` | `icon: 'star'` | 必须是 Lucide 图标名 |
| 使用不存在的 Lucide 图标名 | 到 [lucide.dev/icons](https://lucide.dev/icons) 搜索确认 | 会不渲染 |
| `<button onclick="doSomething()">` | `on(btn, 'click', ...)` | JS 与 HTML 解耦 |
| 自己实现拖拽上传 `<div ondragover=...>` | 用 `initUploadZone` | 共享能力必须复用 |
| 缺少 `data-tool-slug="<slug>"` | 必填 | header 挂载依赖它 |
| 缺少 `data-base-path="../../"` | 必填 | 路径解析依赖 |
| 样式表顺序错乱（如把 `utilities.css` 放在 `components.css` 前） | 严格按 tokens→themes→base→layout→components→utilities→sidebar | 级联依赖 |
| 单独工具引入图标库 | 不需要，Lucide 已全局加载 | 避免重复 |

---

## JavaScript

| ❌ 错误 | ✅ 正确 | 原因 |
|---|---|---|
| `document.querySelector(...)` | `$('[data-...]')` | 统一用 `utils/dom.js` |
| `document.getElementById(...)` | `$('[data-...]')` | JS 不用 id 作 hook |
| 用 class 作 JS hook（`.my-btn`） | `[data-action="xxx"]` | 避免样式与逻辑耦合 |
| 用 id 作 JS hook（`#my-btn`） | `[data-action="xxx"]` | 同上 |
| `alert('...')` | `showToast('...', { type: 'warn' })` | UI 反馈统一走 toast |
| `confirm('...')` | 自定义 `.modal-panel` 或 toast | 原生弹窗风格不一致 |
| `document.execCommand('copy')` | `copyText(text)` | 已废弃，用 Clipboard API |
| 自己写 `debounce` / `throttle` | `import { debounce, throttle } from '.../utils/dom.js'` | 复用项目工具 |
| 自己写 `escapeHtml` | `import { escapeHtml } from '.../utils/dom.js'` | 复用 |
| import 绝对路径 `/public/...` | 相对路径 `../../public/...` | 绝对路径在嵌入模式下会断 |
| 重复引入同一 CDN 库多个版本 | 一库一版本 | 避免冲突 |
| vendor 文件放工具目录 | 放 `public/vendor/` 全局注入 | 统一管理 |
| 不注册进 `tools.js` 就创建工具 | 先改 `tools.js` 再建文件夹 | 首页看不到、路由找不到 |
| 用 jQuery 或 Lodash | 用 `utils/dom.js` 的 `$` / `$$` | 不引入重库 |
| 依赖 `mountUnitConverter` 共享组件做换算器 | 手写 FACTORS/NAMES + 侧栏 | 该组件不支持分组 + 侧栏 |
| 业务逻辑硬编码依赖首页 DOM | 每个工具必须能独立运行 | 双模式（独立 + 嵌入） |
| 重复绑定全局事件（scroll/resize） | 每页一个统一入口，绑定后不重复 | 避免内存泄漏 |
| 未做加载守卫就用第三方库 | `if (!window.XXX) { showToast(...); return; }` | CDN 慢网会延迟 |
| 缺少空状态处理 | 无数据时 `data-results hidden` | 避免显示空面板 |
| 缺少异常处理 | `try { ... } catch (e) { showToast(e.message, {type:'error'}) }` | 避免崩溃无反馈 |

---

## `page.js` 结构

| ❌ 错误 | ✅ 正确 |
|---|---|
| 没有分段注释，代码混杂 | 五段式：导入 / 常量 / 状态 / DOM / 工具函数 / 事件 |
| 不调用 `mountToolHeader()` | 第一句必须调用 |
| 把 import 写在文件中间 | 全部放文件顶部 |
| 在模块作用域立即执行大量计算 | 包装成函数，或放 `DOMContentLoaded` 后（但本项目 `type="module"` 自带 defer，可直接写） |
| 把业务算法和 DOM 操作混在一起 | 算法放工具函数，DOM 操作放事件绑定 |

---

## `tools.js` 注册

| ❌ 错误 | ✅ 正确 |
|---|---|
| `slug` 用大写或空格 | 英文小写 + 下划线 |
| `category` 用不存在的值 | 只用 `CATEGORIES` 里定义的 |
| `status` 写 `"done"` / `"available"` | 只能是 `'ready'` 或 `'planned'` |
| `icon` 填 Unicode 字符 | 必须是 Lucide 图标名（kebab-case） |
| 多个工具用同一 slug | slug 必须唯一 |
| 修改已上线工具的 slug | 禁止，会破坏直达链接与 SEO |

---

## 性能陷阱

| ❌ 错误 | ✅ 正确 |
|---|---|
| 大列表不用虚拟滚动或分页 | 数据量 >500 时考虑分页 |
| 每次 input 事件都重算（无 debounce） | `debounce(update, 200)` |
| 所有 CDN 库首屏加载 | 按需加载（`loadScriptOnce`） |
| 动画用 `left/top/width` | 用 `transform` |
| 低性能模式（`data-performance="low"`）不降级 | 关闭动画、`backdrop-filter`、阴影 |

---

## 目录结构

| ❌ 错误 | ✅ 正确 |
|---|---|
| 工具目录叫 `my-tool`（连字符） | `my_tool`（下划线） |
| 把图片/字体放到工具目录 | 放 `public/` 下的共享资源目录 |
| `tool.css` 超出行数却无说明 | ≤ 100 行无需注释；101–200 行在文件头部写明工具特有 UI 的原因；> 200 行需评估是否提取为 `_shared/*.css` 共享模块 |
| 在 `old/` 目录改代码 | `old/` 是 1.0 历史版本，仅作迁移源参考 |

---

## 数据来源脚注

| ❌ 错误 | ✅ 正确 | 原因 |
|---|---|---|
| `<p class="field-hint u-muted u-mt-4">` | `<p class="field-hint u-muted" style="margin:0;text-align:center">` | 全站脚注必须居中，margin 走固定 style |
| 脚注左对齐（缺 `text-align:center`） | 同上模板 | 与 color_name / calendar 等已上线工具不一致 |
| 写「本地静态加载约 79KB」 | 只写来源 + 许可证 + 可选上游 | 体积对用户无意义，且全站无先例 |
| 脚注写性能、缓存、加载策略 | 仅 API 工具写「数据来自 xxx API」 | 实现细节不属于版权声明 |
| 通用 `public/vendor/` 库在每个工具页重复脚注 | 写入 `attributions.js` + 关于页；工具页省略 | 集中致谢 |
| 外部 API / 数据集 / 合规声明却无任何说明 | 按 `components.md` §数据来源脚注 在工具页补全 | 溯源义务 |
| 自造 `.source-footer` 等 class | 只用 `field-hint u-muted` + 固定 inline style | 单一来源，避免再发明样式 |
| vendor 来自开源项目却链个人站/论坛/HTTP 小站 | 优先 `github.com` / `gitee.com` 上的**实际引用仓库** | 便于核对许可证；例外见 `components.md` §链接怎么选 |
| 标准/registry 硬换 GitHub mirror | IANA、WHATWG、厂商官方 API 等链**权威官网** | 官方源比随机 fork 更有说服力 |

---

## 修复建议

发现问题时：

1. **优先从全局 token/组件修复**，不要在工具本地打补丁
2. **若确实需要扩展组件库**，先在 `components.css` 补充，同步说明用途
3. **若发现规范有漏洞**，更新 `SKILL.md` + 本文件，保持单一数据源
4. **不确定时**，参考教科书示例工具的实际写法
