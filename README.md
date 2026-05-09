# jqnest Toolbox

jqnest Toolbox 是一个面向日常开发、内容处理、图片处理和生活查询的在线工具箱。2.0 版本完成了从零散工具页到统一工作台的重构：所有工具共享同一套设计系统、页面外壳、主题能力和工具注册表，既可以在首页集中搜索使用，也可以作为独立页面直接访问。

当前 `main` 分支默认展示 2.0 最新版。

## 版本下载

- [下载最新版 v2.0](https://github.com/hjq766/Toolbox/archive/refs/tags/v2.0.zip)
- [下载历史版 v1.0](https://github.com/hjq766/Toolbox/archive/refs/tags/v1.0.zip)

## 2.0 亮点

- **工作台式首页**：左侧品牌、搜索、分类导航，右侧工具卡片与 iframe 工具画布。
- **67 个可用工具**：覆盖编码开发、文本处理、代码格式、计算换算、图片处理、二维码、颜色设计、生活查询等场景。
- **统一设计系统**：颜色、字号、间距、圆角、阴影、动效全部由 CSS Token 管理。
- **明暗主题与性能模式**：跨页面、跨 iframe 同步主题；低性能模式可关闭复杂动画和阴影。
- **独立访问 + 嵌入访问**：每个工具既能在工作台中打开，也能通过独立 URL 直接使用。
- **模块化架构**：每个工具由 `index.html` + `page.js` 组成，业务逻辑与公共能力清晰分离。
- **本地化依赖**：常用 vendor、字典和数据文件放在 `public/vendor/`，减少外部 CDN 依赖。
- **AI 友好的开发规范**：内置 `skills/jqnest-tool-builder`，沉淀工具新增、重构和验收流程。

## 工具分类

| 分类 | 数量 | 示例 |
|---|---:|---|
| 编码开发 | 9 | 进制转换、URL 编码、随机密码、哈希计算、Base64、HTML 实时预览 |
| 文本处理 | 8 | 文本分析、文本去重、大小写转换、文本对比、简繁转换、拼音转换 |
| 代码格式 | 7 | 代码格式化、JSON 格式化、XML 格式化、Markdown 编辑器、HTML/Markdown 互转 |
| 计算换算 | 12 | 长度、重量、温度、面积、体积、字节、功率、压力、热量、人民币大写 |
| 图片处理 | 9 | 图片压缩、格式转换、裁剪、翻转、多宫格切图、色板提取、水印、ICO 生成 |
| 矢量文档 | 5 | SVG 代码编辑、SVG 压缩、PDF 转图片、PDF 水印、SVG 编辑 |
| 二维码 | 3 | 二维码生成、二维码识别、公众号二维码 |
| 颜色工具 | 4 | 颜色工具箱、颜色混合、渐变色卡、CSS 渐变生成 |
| 生活查询 | 7 | 手机号归属地、身份证查询、行政区划、世界首都、世界时间、日历查询 |
| 符号速查 | 3 | HTML 符号、Emoji、特殊符号 |

工具清单的唯一数据源是 [`public/scripts/data/tools.js`](./public/scripts/data/tools.js)。

## 本地运行

本项目使用原生 ES Modules，必须通过 HTTP 服务访问，不能直接用 `file://` 打开。

```bash
# Python
python3 -m http.server 5173

# 或 Node
npx http-server . -p 5173 -c-1
```

访问：

```text
http://localhost:5173/
```

常用路径：

```text
http://localhost:5173/                    # 工作台首页
http://localhost:5173/#/tool/hex_convert  # 工作台内打开指定工具
http://localhost:5173/tools/hex_convert/  # 独立访问指定工具
http://localhost:5173/#/page/about        # 关于页
```

## 项目结构

```text
.
├─ index.html                    # 工作台首页
├─ about.html                    # 关于页
├─ docs/
│  └─ DEVELOPMENT.md             # 开发规范
├─ public/
│  ├─ styles/                    # tokens / themes / base / layout / components / utilities
│  ├─ scripts/
│  │  ├─ core/                   # app-init / theme / shell / tool-page
│  │  ├─ components/             # page-header / toast / dock / unit-converter
│  │  ├─ data/tools.js           # 工具注册表
│  │  ├─ pages/home.js           # 首页逻辑
│  │  └─ utils/                  # DOM / clipboard / download
│  └─ vendor/                    # 本地第三方库、字典和数据文件
├─ tools/
│  ├─ _shared/                   # 共享侧栏、上传区、预览网格、代码编辑器、水印模块
│  ├─ _template.html             # 新工具模板
│  └─ <slug>/                    # 单个工具
│     ├─ index.html
│     └─ page.js
└─ skills/
   └─ jqnest-tool-builder/       # AI agent 开发 skill、模板和检查脚本
```

## 开发规范

开发前请先阅读 [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)。核心规则：

- 所有颜色、字号、间距、圆角、阴影和动效使用 `public/styles/tokens.css` 中的 CSS 变量。
- 页面头部统一通过 `mountPageHeader()` / `mountToolHeader()` 渲染。
- 新工具默认复用全局组件，尽量不写 `tool.css`。
- 工具页必须同时支持独立访问和工作台 iframe 嵌入。
- 新工具必须注册到 `public/scripts/data/tools.js`。
- 复制 `tools/_template.html` 或使用 `skills/jqnest-tool-builder` 模板起步。

## 新增工具流程

```bash
# 1. 复制模板或使用 skill 脚手架
cp tools/_template.html tools/<slug>/index.html

# 2. 创建业务脚本
touch tools/<slug>/page.js

# 3. 在 public/scripts/data/tools.js 注册工具

# 4. 本地启动验证
python3 -m http.server 5173
```

推荐验证三个入口：

- `http://localhost:5173/tools/<slug>/`
- `http://localhost:5173/#/tool/<slug>`
- `http://localhost:5173/` 搜索工具名

## 设计与架构原则

1. **单一数据源**：工具信息集中在 `tools.js`，首页、搜索、分类和工具头部都从这里读取。
2. **组件优先**：按钮、输入、面板、标签、表格、空状态等优先使用全局组件。
3. **渐进增强**：工具页保持独立可用，再由工作台提供搜索、导航、主题同步和 iframe 体验。
4. **少依赖外链**：核心运行依赖尽量落在仓库内，方便离线部署和长期维护。
5. **可持续迁移**：旧工具逻辑可以保留在 `old/` 中作为参考，新工具统一按 2.0 规范重构。

## License

MIT
