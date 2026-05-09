# jqnest 工具箱 · v2

全新模块化重构版本，与旧版 (根目录 `index.html` / `public` / `tools`) 并行存在、互不影响。

## 文档导航

- 📘 **开发规范（强制性）**：[`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)
  - 设计 Token、组件清单、新增工具步骤、禁止事项、自查清单 —— **开发前必读**
- 📄 规划参考：上级目录 `../Refactoring.md`

## 本地运行

**必须通过 HTTP 服务器**，不能 `file://` 打开（ES Modules 协议限制）。

```bash
# 任选其一
cd v2 && python3 -m http.server 5173
npx http-server v2 -p 5173 -c-1
# 或 VSCode Live Server 扩展：右键 v2/index.html → Open with Live Server
```

然后浏览器访问 `http://localhost:5173/`。

## 项目形态

### 首页：工作台

左侧边栏（品牌 / 搜索 / 分类导航）+ 右画布（卡片浏览 / iframe 工具）。Hash 路由：

- `http://localhost:5173/` → 全部工具卡片视图
- `http://localhost:5173/#/tool/<slug>` → 打开某个工具
- `http://localhost:5173/#/page/about` → 关于页

每个工具**仍可独立访问**，形态完整：

```
http://localhost:5173/tools/hex_convert/index.html
```

嵌入模式自动降级：iframe 内隐藏 site-header / dock / 标准返回按钮，主题跨 frame 同步。

### 目录速览

```
v2/
├─ index.html                  工作台首页
├─ about.html                  关于页
├─ docs/DEVELOPMENT.md         ★ 开发规范
├─ public/
│   ├─ styles/                 tokens → themes → base → layout → components → utilities → pages/
│   └─ scripts/
│       ├─ core/               app-init / theme / perf-mode / shell / tool-page
│       ├─ components/         page-header / toast / dock / unit-converter
│       ├─ utils/              dom / clipboard / download
│       ├─ data/tools.js       ★ 工具注册表（唯一数据源）
│       └─ pages/home.js       首页逻辑
└─ tools/
    ├─ _template.html          复制即可开始写新工具
    └─ <slug>/index.html + page.js + [tool.css]
```

## 已上线工具（见 `public/scripts/data/tools.js`）

**开发工具**：hex_convert · urlcode · rand_password · hash · meta · grid_layout · html_preview · web_preview
**文本工具**：text_size · text_deduplicate
**计算换算**：convert_length · convert_weight · convert_temp

## 新增工具

参照 [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) 第"[新增一个工具的完整步骤](./docs/DEVELOPMENT.md#新增一个工具的完整步骤)"一节。

## 核心原则

1. **Token + 全局组件一次到位**：颜色、字号、间距、按钮、输入、面板全站共用一套。
2. **页面 header 统一渲染**：`mountPageHeader()` / `mountToolHeader()` 是唯一入口。
3. **MPA + 模块化**：每个工具是独立 HTML + ES Module，天然可独立部署。
4. **性能降级**：`<html data-performance="low">` 一键关动画/阴影。
5. **可搜索、可分享、可独立**：Hash 路由 + 独立 URL + 跨 frame 主题同步。

## 旧资源

根目录仍有 v1 代码，继续服务旧链接。v2 自 2026-04 起成为主分支。
