# jqnest Toolbox

jqnest Toolbox 是一个面向日常开发、内容处理、图片处理和生活查询的在线工具箱。2.0 版本完成了从零散工具页到统一工作台的重构：所有工具共享同一套设计系统、页面外壳、主题能力和工具注册表，既可以在首页集中搜索使用，也可以作为独立页面直接访问。当前 2.4.0 继续扩充颜色、图表、PDF、计算和码制工具，并完善公共组件与本地依赖。

当前 `v2.4.0` 分支包含 105 个可用入口，其中 103 个为标准工具，2 个为第三方整页工具入口。


## 2.0.0 亮点

- **工作台式首页**：左侧品牌、搜索、分类导航，右侧工具卡片与 iframe 工具画布。
- **105 个可用入口**：覆盖编码开发、CSS 工具、文本处理、代码格式、计算换算、数据图表、图片处理、码制工具、颜色设计、生活查询和网络工具等场景。
- **新增 8 个工具**：颜色名称查询、PDF 合并/拆分、房贷/贷款计算器、折柱组合图、热力图、条形码生成、CSS 阴影生成器和亲戚关系计算器。
- **颜色与设计能力升级**：渐变色卡扩充至 210 个精选渐变；颜色工具箱与 DESIGN.md 解析器补充组件颜色示例。
- **图表与二维码升级**：图表导入和主题导出更稳健；二维码支持 SVG、复制图片、Wi-Fi / 名片内容与 Logo。
- **统一设计系统**：颜色、字号、间距、圆角、阴影、动效全部由 CSS Token 管理。
- **明暗主题与性能模式**：跨页面、跨 iframe 同步主题；低性能模式可关闭复杂动画和阴影。
- **独立访问 + 嵌入访问**：每个工具既能在工作台中打开，也能通过独立 URL 直接使用。
- **模块化架构**：每个工具由 `index.html` + `page.js` 组成，业务逻辑与公共能力清晰分离。
- **本地化依赖**：常用 vendor、字典和数据文件放在 `public/vendor/`，减少外部 CDN 依赖。
- **AI 友好的开发规范**：内置 `skills/jqnest-tool-builder`，沉淀工具新增、重构和验收流程。

## 工具分类

| 分类 | 数量 | 示例 |
|---|---:|---|
| 编码开发 | 12 | 进制转换、URL 编码、随机密码、哈希计算、Base64、HTML 实时预览、UUID、时间戳、正则、JWT |
| CSS 工具 | 7 | Grid 网格布局、CSS 阴影、裁剪形状、三角形、圆角、渐变生成、文字渐变 |
| 文本处理 | 13 | ASCII Art、文本分析、文本去重、大小写转换、文本对比、简繁转换、拼音转换、CSV/TSV、文本加密 |
| 代码格式 | 9 | 代码格式化、JSON 格式化、XML 格式化、SQL 格式化、Markdown 编辑器、HTML/Markdown 互转、DESIGN.md 解析 |
| 计算换算 | 9 | 单位换算、宽高比、黄金比例、贷款计算、日期计算、年龄计算、汇率换算、百分比计算 |
| 数据图表 | 10 | 柱状图、折线图、折柱组合图、饼图、热力图、散点图、雷达图、漏斗图、仪表盘、矩形树图 |
| 图片处理 | 15 | 图片压缩、格式转换、裁剪、翻转、多宫格切图、色板提取、水印、ICO 生成、拼接、边框、马赛克、EXIF、CSS 滤镜、在线 PS |
| 矢量文档 | 7 | SVG 代码编辑、SVG 压缩、PDF 转图片、PDF 合并/拆分、PDF 水印、PDF 批量专属水印、SVG 编辑 |
| 码制工具 | 4 | 二维码生成、二维码识别、条形码生成、公众号二维码 |
| 颜色工具 | 4 | 颜色工具箱、颜色混合、渐变色卡、颜色名称查询 |
| 生活查询 | 8 | 手机号归属地、身份证查询、行政区划、世界首都、世界时间、日历查询、亲戚关系计算 |
| 网络工具 | 4 | IP 地址查询、HTTP 状态码、User-Agent 解析、网站 Meta 抓取 |
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

核心规则：

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
5. **可持续迭代**：当前正式线从 2.1.0 开始按 2.x 架构持续迭代，最新状态以 `version.json` 与更新日志为准。

## License

MIT
