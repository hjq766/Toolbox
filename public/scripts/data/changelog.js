// 更新日志数据源（关于页 / 首页对外展示，经 publicChangelog() 过滤 docs）
//
// 【迭代期】CHANGELOG[0].items 只在头部 prepend，不删不改。
// 【整理 / 发版】仅当明确说「整理更新日志」或「发版」时：
//   1. 先把当前版本全部 items 归档到 docs/CHANGELOG_DEV.md「原始流水」（见 DEVELOPMENT.md §Changelog 双轨）
//   2. 再合并删减 changelog.js 写成对外稿；已发布的历史版本勿再改动。
//
// type: 'tool' | 'feat' | 'improve' | 'fix' | 'style' | 'refactor' | 'breaking' | 'docs'（docs 仅对内）
// 版本号：发版时同步 /version.json 的 "v"（不带 v 前缀）
export const CHANGELOG = [
  {
    version: 'v2.4.0',
    date: '2026-06-10',
    items: [
      { type: 'style', text: '全站内容区最大宽度调整为 1280px，大屏布局更舒展' },
      { type: 'tool', text: '颜色名称查询：输入 HEX 自动匹配最接近的 CSS 命名色与中国传统色（各 Top 5）；744 色全量浏览（传统色 / CSS 分栏、全部色表搜索分页、色相分类完整展示）；OKLab 感知距离匹配、同义色合并；点击色块可复制并回填查询' },
      { type: 'tool', text: 'PDF 合并/拆分：多份 PDF 合并或按页 / 自定义范围拆分并 ZIP 打包，全程本地处理；加强加密 PDF、超大文件与页面范围校验' },
      { type: 'tool', text: '房贷/贷款计算器：等额还款与等额本金、两种方式对比、逐月还款明细与结果复制' },
      { type: 'tool', text: '折柱组合图：柱状与折线同图、专业双 Y 轴，按系列指定类型，支持轴名称、平滑曲线与柱圆角，导出 PNG / SVG' },
      { type: 'tool', text: '热力图：自定义颜色区间与数值范围，支持数据标签与色阶图例，导出 PNG / SVG' },
      { type: 'tool', text: '条形码生成：可自定义配色与尺寸，导出 PNG / SVG' },
      { type: 'tool', text: 'CSS 阴影生成器：多层与内阴影可视化调节，内置柔和 / 卡片 / 浮起 / 霓虹等预设，一键复制 CSS' },
      { type: 'tool', text: '亲戚关系计算器：正向 / 反向称谓、关系链反查与两人合称，点击构建关系链即时出结果' },
      { type: 'improve', text: '渐变色卡全面升级：精选库扩至 210 个并重组场景分类（含灵感抽卡与全库搜索），修复悬停显示异常；CSS 渐变生成器同步新版预设' },
      { type: 'improve', text: '符号速查、色卡、首都、HTTP 状态码等浏览工具统一搜索与分类 Tab 布局，查找更顺手' },
      { type: 'improve', text: '关于页改版：项目信息更清晰；更新日志按「新工具 / 新增 / 优化 / 修复」等标签分类与配色展示，条目表述更清晰；新增开源组件集中致谢' },
      { type: 'improve', text: '二维码生成优化：SVG 与复制图片、Wi-Fi / 名片转义、chip 选型、预览信息与默认填入当前页链接' },
      { type: 'improve', text: '模拟数据生成：词库扩充（含职位与 34 省级行政区地址），页脚增加合规声明' },
      { type: 'improve', text: 'DESIGN.md 解析器：新增颜色示例与 Token 对照预览，组件规范与颜色工具箱展示对齐' },
      { type: 'improve', text: '图表工具：CSV 导入更稳健，导出适配当前主题；饼图新增圆环 / 玫瑰组合模式' },
      { type: 'improve', text: '百分比计算器重设计：场景卡片式四种计算，修复打折联动与涨跌幅颜色语义，结果可点击复制' },
      { type: 'improve', text: '颜色工具箱配色方案新增「矩形配色」' },
      { type: 'improve', text: '全站工具页补齐分享卡片与站点地图，分享到微信 / 微博可正确显示标题与图标' },
      { type: 'improve', text: '全站「点击复制」交互与提示风格统一' },
      { type: 'improve', text: '代码与 Markdown 类工具编辑器改为本地加载，首次打开更快' },
      { type: 'improve', text: '拼音、Emoji、汇率、HTTP 状态码、HTML 符号、日历等工具补充数据来源说明' },
      { type: 'fix', text: 'DESIGN.md：修复导出 HTML 样式不完整；预览与导出增加内容安全过滤' },
      { type: 'fix', text: 'Markdown 编辑器：修复拖入叠加、清空预览不同步、编辑区高度与预览排版样式等问题' },
      { type: 'fix', text: '公共上传与 PDF 处理：修复多上传区同时响应全页拖拽；兼容无 MIME 的 PDF 文件' },
      { type: 'fix', text: 'IP 查询：新增多路备用接口，修复快速连查时旧结果覆盖新结果' },
    ]
  },
  {
    version: 'v2.3.2',
    date: '2026-06-05',
    items: [
      { type: 'feat', text: '工作台新增最近使用入口：搜索框内与顶栏提供同一份最近使用记录，方便快速回到常用工具' },
    ]
  },
  {
    version: 'v2.3.1',
    date: '2026-06-03',
    items: [
      { type: 'fix', text: '公共上传组件：修复同时拖入多个文件夹时，只读取到其中一个文件夹内容的问题；影响图片转换、图片压缩、图片拼接、SVG 压缩等批量工具' },
    ]
  },
  {
    version: 'v2.3.0',
    date: '2026-05-30',
    items: [
      { type: 'feat', text: '新增 SQL 格式化：支持 MySQL、PostgreSQL、SQLite 等主流方言，一键格式化、压缩与移除注释' },
      { type: 'feat', text: '新增百分比计算器：支持求占比、涨跌幅、折扣、百分比值等常用计算场景，输入即出结果' },
      { type: 'feat', text: '新增「CSS 工具」分类：渐变生成、文字渐变、网格布局、圆角、三角形、裁剪形状等工具统一归类，查找更方便' },
      { type: 'feat', text: '新增 CSS 文字渐变：160+ 精选渐变预设，可视化调节颜色与方向，一键复制代码' },
      { type: 'feat', text: '新增 CSS 圆角、三角形、裁剪形状生成器：实时预览效果，一键生成对应 CSS 代码' },
      { type: 'feat', text: '新增 PDF 专属水印：按名单批量生成带姓名等信息的专属水印 PDF，支持 ZIP 一键打包下载' },
      { type: 'feat', text: '批量处理工具支持选择文件夹：可一次导入整个文件夹，无需逐个选择文件' },
      { type: 'improve', text: 'JSON 格式化升级：新增 YAML 自动识别与互转能力，并修复多格式切换时的兼容性问题' },
      { type: 'improve', text: '颜色工具箱升级：新增对比度检测、最近使用记录、分享链接与文件导出，支持 CSS 颜色名称及无 # 色值输入' },
      { type: 'improve', text: '图片色板提取升级：自动识别主色、辅色、背景色和文字色，支持导出 Tailwind 配置片段' },
      { type: 'improve', text: '图片压缩升级：新增「压到指定大小」模式，支持目标 KB / MB 自动压缩，并提升 JPEG / PNG 压缩质量' },
      { type: 'improve', text: '多宫格切图升级：新增三联图、长图三切预设，支持 PNG、JPG、WebP 导出及质量控制' },
      { type: 'improve', text: '图片圆角边框升级：新增 1×、2×、3× 导出倍率，并优化透明背景阴影效果' },
      { type: 'improve', text: 'EXIF 信息查看升级：新增文件摘要、GPS 坐标复制、地图跳转及 JSON 导出功能' },
      { type: 'improve', text: 'ICO 图标生成器优化：调整参数面板布局，并修复删除图片后预览残留的问题' },
      { type: 'improve', text: 'DESIGN.md 解析器重构：优化模块架构，修复普通 Markdown 误识别及部分颜色 Token 编辑异常问题' },
      { type: 'improve', text: '底层代码与样式体系优化：精简冗余代码，统一工具能力，提升整体稳定性与维护性' },
      { type: 'improve', text: '优化暗色模式下多处界面细节与交互反馈，体验更加统一' },
      { type: 'fix', text: 'IP 地址查询修复：解决 HTTPS 环境下查询失败问题，并新增备用接口自动切换机制' },
    ]
  },
  {
    version: 'v2.2.5',
    date: '2026-05-28',
    items: [
      { type: 'fix', text: '图片格式转换：修复 JPG / WebP 同格式转换时质量压缩失效的问题' },
      { type: 'fix', text: '图片压缩：修复部分情况下点击压缩后无响应或静默失败的问题；优化压缩库加载方式，稳定性更高' },
    ]
  },
  {
    version: 'v2.2.4',
    date: '2026-05-27',
    items: [
      { type: 'fix', text: '图片格式转换：修复同时上传多个文件夹时，同名文件在压缩包里互相覆盖只剩一个的问题；修复 Windows 系统下 HEIC 图片无法上传的问题；修复修改设置后点下载仍会得到旧结果的问题' },
      { type: 'improve', text: '图片格式转换：BMP / TIFF 格式增加兼容性说明，避免导出后格式不符预期；文件夹批量导入时图片卡片显示所在路径方便区分同名文件；支持直接拖拽文件夹上传，自动读取内部所有图片' },
    ]
  },
  {
    version: 'v2.2.3',
    date: '2026-05-25',
    items: [
      { type: 'improve', text: 'SVG 代码编辑：界面重构，新增颜色批量替换、一键优化、自动裁剪；导出分组更清晰' },
      { type: 'improve', text: 'SVG 压缩：新增安全 / 平衡 / 激进三档预设，新增代码粘贴入口' },
      { type: 'improve', text: '特殊符号：扩充符号库，新增交通地图、科学工程、颜文字、编程符号等多个分类' },
      { type: 'improve', text: '图片拼接：新增自定义标题，模板拼图改为横向选择并优化布局；优化滑块流畅度与大图预览缩放；修复拖拽排序、JPG 透明等问题' },
      { type: 'improve', text: '图片色板提取：新增预览缩放平移、色带预览、颜色详情面板、近似色合并、WCAG 对比度、CSS 变量导出等；重新设计颜色卡片样式' },
      { type: 'improve', text: '统一多个工具的上传区、按钮等界面细节，视觉风格更一致' },
      { type: 'fix', text: '修复数据图表工具导入 Excel 文件失败的问题' },
    ]
  },
  {
    version: 'v2.2.2',
    date: '2026-05-23',
    items: [
      { type: 'improve', text: 'ICO 图标生成：新增 SVG 输入支持；新增背景填充选项，解决透明图标导出变黑的问题；新增暗色预览；Favicon 模式附带 PWA 配置文件；Android 支持自适应图标' },
      { type: 'improve', text: 'ICO 图标生成：优化了界面布局，尺寸选择更直观；新增单独下载任意尺寸、放大预览、清空重置等功能；修复裁剪框偏移及 ZIP 下载性能问题' },
      { type: 'improve', text: '大小写转换：界面全面重构，所有格式转换功能平铺一屏；编程命名方式按钮改为中文标注，更易读' },
      { type: 'improve', text: '日历：节气单独以绿色显示，与节日红色区分；同一天有多个节日/节气时全部展示；修复农历转公历日期未同步刷新的问题' },
      { type: 'improve', text: '图标转图片：界面重构，层次更清晰；新增图层预览放大查看、批量导出进度条；修复文件类型校验缺失的问题' },
      { type: 'improve', text: '图片水印：新增「复制到剪贴板」功能；侧栏布局精简，未上传图片时自动禁用' },
      { type: 'fix',     text: 'PDF 水印：修复自定义页面范围时，未选中页面在导出结果中被丢失的问题' },
      { type: 'fix',     text: '图片裁剪：修复工具栏文字颜色显示异常的问题' },
      { type: 'improve', text: '统一了部分图片工具的操作按钮样式与交互' },
    ]
  },
  {
    version: 'v2.2.1',
    date: '2026-05-21',
    items: [
      { type: 'improve', text: '人民币大写：新增转换历史记录与书写规范速查，修复部分金额转换错误' },
      { type: 'improve', text: '数据图表优化：PNG 导出支持 1× / 2× / 3× 高清倍率；修复矩形树图深色主题下文字不可读的问题' },
      { type: 'improve', text: '图片工具优化：格式转换重构操作流程，体验更流畅；压缩工具修复多项统计与下载问题' },
      { type: 'feat', text: '首页新增「最近更新」入口，快速浏览近期上线工具；新工具卡片自动显示角标提示' },
    ]
  },
  {
    version: 'v2.2.0',
    date: '2026-05-20',
    items: [
      { type: 'feat', text: '新增 DESIGN.md 解析器：把设计规范文件变成可视化设计文档，色彩对比度评级、点击色板直接改色，支持导出 CSS / Tailwind / HTML' },
      { type: 'feat', text: '新增 ASCII Art 生成器：支持图片转字符画 + 文字转艺术字' },
      { type: 'feat', text: '新增数据图表工具（柱状图、折线图、饼图等 8 种），支持多系列数据编辑与导出' },
      { type: 'improve', text: '移动端全局优化：精简顶栏、适配底部安全区、优化触屏交互体验' },
      { type: 'improve', text: '多个文本工具重构：去重、排序、加密、简繁转换、拼音转换、HTML 转文本等均改为实时处理，新增双面板布局' },
      { type: 'improve', text: '编码工具优化：Base64、URL 编码改为双向实时互转；表格数据转换新增 Excel / JSON 互转' },
      { type: 'improve', text: '代码工具优化：格式化新增 SQL 支持，HTML/JS 转换改为实时，Markdown 编辑器 PDF 导出样式修复' },
      { type: 'fix', text: '修复多个工具的功能异常：JSON 工具视图切换报错、Grid 布局预览报错、数据图表导出问题等' },
      { type: 'improve', text: '统一全站工具的 UI 样式与交互规范' },
    ]
  },
  {
    version: 'v2.1.1',
    date: '2026-05-15',
    items: [
      { type: 'fix', text: '图片格式转换工具：修复 HEIC 上传失败、批量转换中断等 Bug，移除无意义的预设，新增限制长边模式' },
      { type: 'fix', text: '图片拼接工具：修复模板拼图格子尺寸失控问题，新增单格尺寸控制；修复自由拼接多分辨率图片默认显示混乱；修复对齐面板在填满裁切模式下错误显示等 Bug' },
      { type: 'improve', text: '宽高比换算工具：重组布局、精简预设分类（5类→3类）、修复小数比例显示与预设高亮同步问题' },
      { type: 'improve', text: '日期计算器：结果展示从列表改为卡片网格布局，数据层级更清晰' },
      { type: 'feat', text: '新增图片工具：图片滤镜，可视化调整亮度/对比度/饱和度等 8 项参数，支持预设风格一键套用、实时预览、下载成品图及复制 CSS 代码' },
      { type: 'feat', text: '新增计算工具：年龄计算器，输入生日即时显示精确年龄、已活天数、下次生日倒计时、星座及生肖' },
    ]
  },
  {
    version: 'v2.1.0',
    date: '2026-05-10',
    items: [
      { type: 'feat', text: '新增开发工具：UUID 生成器、时间戳转换、正则表达式测试、JWT 解析' },
      { type: 'feat', text: '新增文本工具：假数据生成、文本排序、CSV/TSV 转换、文本加密' },
      { type: 'feat', text: '新增单位换算：时间换算、速度换算、日期计算器、汇率换算' },
      { type: 'feat', text: '新增图片工具：图片拼接、图片圆角边框、图片马赛克/模糊、EXIF 信息查看、ICO 图标转图片' },
      { type: 'feat', text: '新增网络工具：HTTP 状态码速查、User-Agent 解析、网站 Meta 抓取、IP 地址查询' },
      { type: 'feat', text: '新增全站版本更新日志，支持查看历史版本变更记录' },
      { type: 'feat', text: '新增静态资源版本检测与自动刷新机制，部署后用户无感知获取最新版本' },
      { type: 'improve', text: '合并 11 类单位换算为统一工具，数据驱动 + Tab 切换' },
      { type: 'improve', text: 'Dock 快捷栏优化：在添加工具面板中集成移除功能，替代原右键移除方式' },
      { type: 'improve', text: '优化全站工具操作区布局与按钮层级，提升视觉一致性与交互体验' },
      { type: 'fix', text: '修复页面滚动后鼠标悬停底部无法唤出 Dock 栏及悬停闪烁的问题' },
    ]
  },
  {
    version: 'v2.0.0',
    date: '2025-05-05',
    items: [
      { type: 'breaking', text: '全站架构升级为 v2，ES Modules + 组件化重写，旧版工具全部迁移' },
      { type: 'breaking', text: 'Dock 快捷栏重构：改为自定义模式，支持拖拽排序与移除' },
      { type: 'breaking', text: '全站 CSS 架构重建：Design Token + 主题系统 + 组件库 + 工具类，替代原有零散样式' },
      { type: 'breaking', text: '第三方库统一管理：移除内嵌依赖，改为 vendor 本地托管 + CDN 按需加载' },
      { type: 'breaking', text: '全站改为工作台模式：侧栏分类导航 + iframe 无缝加载，替代原工具列表跳转' },
      { type: 'improve', text: '图标系统从 Iconify 切换至 Lucide，统一全站图标风格' },
      { type: 'improve', text: '统一页面 Header 组件，优化响应式布局，改善移动端浏览体验' },
      { type: 'improve', text: '部分工具重命名与整理，移除过时工具' },
      { type: 'improve', text: '全站多数工具功能优化与增强，提升易用性与输出质量' },
    ]
  },
];

/** 对外展示的更新日志（过滤 docs 等仅对内条目） */
export const publicChangelog = () =>
  CHANGELOG
    .map(v => ({ ...v, items: v.items.filter(i => i.type !== 'docs') }))
    .filter(v => v.items.length > 0);
