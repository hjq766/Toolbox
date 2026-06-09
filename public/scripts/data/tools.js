// 工具注册表：单一数据源。首页/搜索/面包屑/SEO 等均从这里读取。
// 新增工具：先在此注册，再创建 tools/<slug>/index.html + page.js。
export const CATEGORIES = [
  { id: 'all',    name: '全部',     icon: 'grid-3x3' },
  { id: 'recently', name: '最近新增', icon: 'sparkles' },
  { id: 'dev',    name: '编码开发', icon: 'code' },
  { id: 'css',    name: 'CSS 工具', icon: 'layers' },
  { id: 'text',   name: '文本处理', icon: 'type' },
  { id: 'code',   name: '代码格式', icon: 'braces' },
  { id: 'calc',   name: '计算换算', icon: 'scale' },
  { id: 'chart',  name: '数据图表', icon: 'bar-chart-2' },
  { id: 'image',  name: '图片处理', icon: 'image' },
  { id: 'media',  name: '矢量文档', icon: 'pen-tool' },
  { id: 'qrcode', name: '码制工具', icon: 'scan-barcode' },
  { id: 'color',  name: '颜色工具', icon: 'palette' },
  { id: 'query',  name: '生活查询', icon: 'search' },
  { id: 'net',    name: '网络工具', icon: 'globe' },
  { id: 'symbol', name: '符号速查', icon: 'hash' }
];

/**
 * Tool schema:
 *   slug, title, desc, category, icon, tags?, status? ('ready' | 'planned')
 */
export const TOOLS = [
  // 编码开发
  { slug: 'hex_convert',     title: '进制转换',       desc: '二/八/十/十六进制互相转换', category: 'dev', icon: 'hash', tags: ['hex','bin','oct','进制'], status: 'ready' },
  { slug: 'urlcode',         title: 'URL 编码',       desc: 'URL 编码 / 解码转换工具',   category: 'dev', icon: 'link', tags: ['url','encode'],             status: 'ready' },
  { slug: 'rand_password',   title: '随机密码生成',   desc: '安全的随机密码，支持自定义长度与字符集', category: 'dev', icon: 'key-round', tags: ['password','随机'], status: 'ready' },
  { slug: 'hash',            title: '哈希计算',       desc: '支持 MD5 / SHA1 / SHA256 / SHA512 / SHA3 / RIPEMD160 + HMAC', category: 'dev', icon: 'shield-check', tags: ['md5','sha','hmac','hash','哈希'], status: 'ready' },
  { slug: 'base64',          title: 'Base64 编码',    desc: '文本与图片的 Base64 编码/解码互转',              category: 'dev', icon: 'lock',  tags: ['base64','编码','解码','图片'],  status: 'ready' },
  { slug: 'meta',            title: 'Meta 生成器',    desc: '快速生成 HTML Meta 标签（title/description/keywords/robots/viewport）', category: 'dev', icon: 'tag', tags: ['meta','seo','html'], status: 'ready' },
  { slug: 'grid_layout',     title: 'Grid 网格布局',  desc: '可视化网格布局生成器，支持智能推荐、多设备预览与导出', category: 'css', icon: 'layout-grid', tags: ['grid','layout','布局','网格'], status: 'ready' },
  { slug: 'css_clip_path',   title: 'CSS 裁剪形状',  desc: '可视化生成 clip-path 裁剪形状，支持预设、多边形拖点、圆形/椭圆/内缩与 CSS 导出', category: 'css', icon: 'crop', tags: ['CSS','clip-path','裁剪','形状','polygon','前端'], updatedAt: '2026-05-25', status: 'ready' },
  { slug: 'css_triangle',      title: 'CSS 三角形生成', desc: '可视化生成 CSS 三角形，支持 border / clip-path 两种写法、方向预设与 tooltip 箭头代码', category: 'css', icon: 'triangle', tags: ['CSS','三角形','triangle','border','clip-path','tooltip','前端'], updatedAt: '2026-05-25', status: 'ready' },
  { slug: 'css_border_radius', title: 'CSS 圆角生成',   desc: '可视化生成 border-radius，支持统一/四角/椭圆三种模式，内置 8 种形状预设与 CSS 一键复制', category: 'css', icon: 'square', tags: ['CSS','圆角','border-radius','radius','前端'], updatedAt: '2026-05-25', status: 'ready' },
  { slug: 'css_box_shadow',    title: 'CSS 阴影生成',   desc: '可视化生成 box-shadow，支持多层叠加、内阴影、不透明度调节，内置柔和/卡片/浮起/霓虹等预设，一键复制 CSS', category: 'css', icon: 'layers', tags: ['CSS','阴影','box-shadow','shadow','前端'], updatedAt: '2026-06-10', status: 'ready' },
  { slug: 'html_preview',    title: 'HTML 实时预览',  desc: '在线编辑 HTML/CSS/JS 并实时预览，支持多设备与导出', category: 'dev', icon: 'code', tags: ['html','css','javascript','预览','playground'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'web_preview',     title: '多设备网页预览', desc: '任意 URL 的桌面/笔电/平板/手机多尺寸预览，附二维码', category: 'dev', icon: 'smartphone', tags: ['preview','device','responsive','响应式','二维码'], status: 'ready' },
  { slug: 'uuid_generator',  title: 'UUID 生成器',    desc: '生成 UUID v4，支持批量、大写、去横杠等格式选项',     category: 'dev', icon: 'fingerprint', tags: ['uuid','guid','唯一','生成'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'timestamp',       title: '时间戳转换',     desc: 'Unix 时间戳与可读日期互转，实时时钟 + 批量转换',     category: 'dev', icon: 'clock', tags: ['timestamp','时间戳','unix','日期'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'regex_test',      title: '正则表达式测试', desc: '实时匹配高亮 + 分组捕获 + 常用正则速查库',            category: 'dev', icon: 'regex', tags: ['regex','正则','匹配','pattern'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'jwt_decode',      title: 'JWT 解析',       desc: '粘贴 JWT 自动解码 Header / Payload，可视化过期时间', category: 'dev', icon: 'shield', tags: ['jwt','token','解码','json'], updatedAt: '2026-05-10', status: 'ready' },

  // 文本处理
  { slug: 'ascii_art',         title: 'ASCII 字符画', desc: '图片转 ASCII 字符画 + 文字艺术字生成，支持彩色、多密度、多字体', category: 'text', icon: 'terminal', tags: ['ascii','字符画','art','图片','文字'], updatedAt: '2026-05-20', status: 'ready' },
  { slug: 'text_size',        title: '文本分析器',  desc: '字符/字数/字节/行数等多维统计', category: 'text', icon: 'text', tags: ['count','统计'], status: 'ready' },
  { slug: 'text_deduplicate', title: '文本去重',    desc: '按行去重，支持忽略空白/大小写/保序等', category: 'text', icon: 'filter', status: 'ready' },
  { slug: 'en_case',          title: '大小写转换',  desc: '全大/小写、首字母、空格/下划线/中横线互转', category: 'text', icon: 'a-large-small', tags: ['case','大小写','camel','snake'], improvedAt: '2026-05-23', status: 'ready' },
  { slug: 'text_difference',  title: '文本对比',    desc: '两段文本的行级差异高亮对比',     category: 'text', icon: 'git-compare-arrows', tags: ['diff','对比','差异'], status: 'ready' },
  { slug: 'html_text',        title: 'HTML 转文本', desc: '去除 HTML 标签，提取纯文本',     category: 'text', icon: 'file-code', tags: ['html','text','抽取'], status: 'ready' },
  { slug: 'text_morse',       title: '摩尔斯电码',  desc: '文本与摩尔斯电码双向转换，支持中文（拼音）', category: 'text', icon: 'radio', tags: ['morse','摩尔斯','电码'], status: 'ready' },
  { slug: 'zh_convert',       title: '简繁体转换',  desc: '中文简体与繁体互转，支持大陆/港澳/台湾用法', category: 'text', icon: 'languages', tags: ['简体','繁体','中文','opencc'], status: 'ready' },
  { slug: 'pinyin',           title: '拼音转换',    desc: '汉字转拼音，支持声调/首字母/大写',             category: 'text', icon: 'keyboard', tags: ['pinyin','拼音','汉字'], status: 'ready' },
  { slug: 'lorem_generator',  title: '模拟数据生成',  desc: '姓名/手机/身份证/地址/公司/职位等模拟字段，覆盖 34 个省级行政区，支持导出 JSON/CSV', category: 'text', icon: 'database', tags: ['lorem','假数据','模拟','测试数据','fake','mock'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'text_sort',        title: '文本排序',    desc: '按字母/数字/长度/随机排序，正序逆序 + 去空行', category: 'text', icon: 'arrow-up-down', tags: ['sort','排序','行'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'csv_convert',      title: '表格数据转换', desc: 'CSV / TSV / JSON / Excel (.xlsx) / Markdown 表格互转，支持上传与导出', category: 'text', icon: 'table', tags: ['csv','tsv','json','表格','markdown','excel','xlsx','转换'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'text_encrypt',     title: '文本加密',    desc: 'AES / DES / TripleDES / Rabbit 对称加密解密',  category: 'text', icon: 'lock-keyhole', tags: ['加密','解密','aes','des','encrypt'], updatedAt: '2026-05-10', status: 'ready' },

  // 代码格式
  { slug: 'code_format',     title: '代码格式化',       desc: '支持 HTML/CSS/JS/Python 等多语言的代码格式化', category: 'code', icon: 'code', tags: ['code','format','beautify'],     improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'code_json',       title: 'JSON 格式化',      desc: 'JSON / YAML 格式化 / 压缩 / 校验，自动识别格式，支持 YAML · CSV 互转', category: 'code', icon: 'braces', tags: ['json','yaml','csv','格式化'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'code_xml',        title: 'XML 格式化',       desc: 'XML 格式化 / 校验 / 压缩工具',                 category: 'code', icon: 'file-code', tags: ['xml','格式化'],                 improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'code_sql',        title: 'SQL 格式化',       desc: 'SQL 语句格式化 / 压缩，支持标准 SQL / MySQL / PostgreSQL / SQLite', category: 'code', icon: 'database', tags: ['sql','mysql','postgresql','sqlite','格式化','数据库'], updatedAt: '2026-05-29', status: 'ready' },
  { slug: 'markdown_editor', title: 'Markdown 编辑器',   desc: '所见即所得 Markdown 编辑器，实时预览 + 快捷插入 + 导出', category: 'code', icon: 'file-text', tags: ['markdown','编辑器','preview','写作'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'markdown_html',   title: 'Markdown 转 HTML', desc: 'Markdown 格式转 HTML 代码，实时预览',          category: 'code', icon: 'file-text',  tags: ['markdown','html','转换'],       status: 'ready' },
  { slug: 'html_markdown',   title: 'HTML 转 Markdown', desc: 'HTML 代码转 Markdown 格式，实时预览',          category: 'code', icon: 'code',  tags: ['html','markdown','转换'],       improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'html_javascript', title: 'HTML/JS 转换',     desc: 'HTML 代码与 JavaScript 代码互相转换',           category: 'code', icon: 'terminal', tags: ['html','javascript','转换'],     improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'design_md',      title: 'DESIGN.md 解析器', desc: '解读 / 可视化 / 校验 DESIGN.md 设计系统规范，组件 Token 对照表 + 颜色示例（表面分层/文本层级/YAML 组件预览），导出 CSS / Tailwind / HTML', category: 'code', icon: 'palette', tags: ['design','design.md','token','设计系统','google','stitch'], improvedAt: '2026-06-10', status: 'ready' },

  // 计算换算
  { slug: 'unit_converter',  title: '单位换算',    desc: '长度/重量/面积/体积/温度/速度/时间/数据等 11 类单位互换', category: 'calc', icon: 'arrow-left-right', tags: ['单位','换算','长度','重量','面积','体积','温度','速度','时间','数据','功率','压强','热量'], status: 'ready' },
  { slug: 'convert_scale',   title: '宽高比换算',  desc: '任意宽/高推算比例，预设 16:9、4:3、3:2、1:1',      category: 'calc', icon: 'ratio', tags: ['ratio','aspect','宽高比','16:9'], improvedAt: '2026-05-15', status: 'ready' },
  { slug: 'calc_golden',     title: '黄金比例',    desc: '黄金分割及经典设计比例分段计算，带可视化预览',       category: 'calc', icon: 'star', tags: ['golden','ratio','黄金'], status: 'ready' },
  { slug: 'rmb',             title: '人民币大写',  desc: '数字金额转中文大写金额',                           category: 'calc', icon: 'badge-japanese-yen', tags: ['rmb','大写','金额','currency'], improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'date_calc',       title: '日期计算器',  desc: '两日期间隔 + 日期加减天数 + 工作日计算',            category: 'calc', icon: 'calendar-range', tags: ['date','日期','间隔','工作日'], updatedAt: '2026-05-10', improvedAt: '2026-05-15', status: 'ready' },
  { slug: 'age_calc',        title: '年龄计算器',  desc: '输入生日计算精确年龄，含总天数、下次生日倒计时、星座生肖',   category: 'calc', icon: 'cake', tags: ['年龄','生日','星座','生肖','age','birthday'], updatedAt: '2026-05-15', status: 'ready' },
  { slug: 'exchange_rate',   title: '汇率换算',    desc: '主要货币实时汇率换算（离线近似值 + 在线更新）',     category: 'calc', icon: 'circle-dollar-sign', tags: ['汇率','货币','exchange','rate','美元','欧元'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'percent_calc',    title: '百分比计算',  desc: '求百分比值、占比、涨跌幅、折扣四种常用计算，输入即得结果', category: 'calc', icon: 'percent', tags: ['百分比','折扣','涨跌','占比','percent','计算'], updatedAt: '2026-05-29', status: 'ready' },
  { slug: 'loan_calc',       title: '房贷/贷款计算器', desc: '等额还款与等额本金对比，月供/总利息/总还款额一目了然，附逐月还款明细', category: 'calc', icon: 'landmark', tags: ['房贷','贷款','月供','利息','计算器','loan','mortgage'], updatedAt: '2026-06-10', status: 'ready' },

  // 数据图表
  { slug: 'chart_bar',  title: '柱状图',  desc: '创建柱状图 / 条形图，支持多系列、堆叠、自定义配色，导出 PNG / SVG',  category: 'chart', icon: 'bar-chart-2', tags: ['图表','柱状图','条形图','bar','chart','数据可视化'], updatedAt: '2026-05-20', improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'chart_line', title: '折线图',  desc: '创建折线图 / 面积图，支持多系列、平滑曲线、面积填充，导出 PNG / SVG', category: 'chart', icon: 'trending-up', tags: ['图表','折线图','曲线','趋势','line','chart'], updatedAt: '2026-05-20', improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'chart_combo', title: '折柱组合图', desc: '柱状 + 折线同图展示，按系列指定图表类型，专业双 Y 轴（柱→左轴、线→右轴），支持轴名称、平滑曲线与配色，导出 PNG / SVG', category: 'chart', icon: 'chart-column-increasing', tags: ['图表','折柱','组合图','双轴','combo','bar','line','chart'], updatedAt: '2026-06-10', status: 'ready' },
  { slug: 'chart_pie',     title: '饼图 / 圆环图', desc: '实心饼图或圆环图，可叠加玫瑰图效果；圆环内径、玫瑰映射方式可调，支持自定义配色，导出 PNG / SVG', category: 'chart', icon: 'pie-chart', tags: ['图表','饼图','圆环图','玫瑰图','南丁格尔','donut','pie','chart'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'chart_scatter', title: '散点图',   desc: '创建散点图，支持多系列、自定义点大小与形状，导出 PNG / SVG',        category: 'chart', icon: 'scatter-chart', tags: ['图表','散点图','scatter','chart','相关性'], updatedAt: '2026-05-20', improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'chart_radar',   title: '雷达图',   desc: '创建雷达图，支持多系列、面积填充、多边形/圆形，导出 PNG / SVG',    category: 'chart', icon: 'radar',         tags: ['图表','雷达图','radar','chart','多维'], updatedAt: '2026-05-20', improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'chart_funnel',  title: '漏斗图',   desc: '创建漏斗图，支持排序、对齐、间距调节，导出 PNG / SVG',             category: 'chart', icon: 'filter',        tags: ['图表','漏斗图','funnel','chart','转化'], updatedAt: '2026-05-20', improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'chart_gauge',   title: '仪表盘',   desc: '创建仪表盘图，支持多指针、范围配色、进度模式，导出 PNG / SVG',     category: 'chart', icon: 'gauge',         tags: ['图表','仪表盘','gauge','chart','进度'], updatedAt: '2026-05-20', improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'chart_treemap', title: '矩形树图', desc: '创建矩形树图，支持自定义配色、标签样式，导出 PNG / SVG',           category: 'chart', icon: 'square-stack',  tags: ['图表','矩形树图','treemap','chart','占比'], updatedAt: '2026-05-20', improvedAt: '2026-05-21', status: 'ready' },
  { slug: 'chart_heatmap', title: '热力图',  desc: '创建热力图，自定义颜色区间与数值范围，支持数据标签与色阶图例，导出 PNG / SVG', category: 'chart', icon: 'grid-3x3', tags: ['图表','热力图','heatmap','chart','频次','分布'], updatedAt: '2026-06-10', status: 'ready' },

  // 图片处理
  { slug: 'images_convert',   title: '图片格式转换', desc: '批量转换 JPG/PNG/WebP/HEIC + 尺寸调整 + 质量控制，支持文件夹导入',     category: 'image', icon: 'arrow-left-right', tags: ['图片','转换','格式','convert','heic','heif'], improvedAt: '2026-05-28', status: 'ready' },
  { slug: 'images_compress',  title: '图片压缩',     desc: '多模式批量图片压缩（高质量/均衡/极限/自定义），支持文件夹导入',   category: 'image', icon: 'minimize-2', tags: ['图片','压缩','批量','compress'], improvedAt: '2026-05-28', status: 'ready' },
  { slug: 'images_clipping',  title: '图片裁剪',     desc: '自由/比例裁剪 + 旋转翻转 + 多格式输出',           category: 'image', icon: 'scissors', tags: ['图片','裁剪','crop','旋转'],     status: 'ready' },
  { slug: 'images_flip',      title: '图片翻转',     desc: '水平/垂直翻转 + 旋转 90°/180° + 原尺寸下载',     category: 'image', icon: 'flip-horizontal', tags: ['图片','翻转','旋转','flip'],     status: 'ready' },
  { slug: 'images_cut',       title: '多宫格切图',   desc: '预设/自定义行列宫格切图，ZIP 批量下载',            category: 'image', icon: 'grid-2x2', tags: ['图片','切图','宫格','grid'],     status: 'ready' },
  { slug: 'images_color',     title: '图片色板提取', desc: '自动提取主色调 + 手动取色 + 选区取色 + 导出',      category: 'image', icon: 'palette', tags: ['图片','色板','取色','palette'], improvedAt: '2026-05-24', status: 'ready' },
  { slug: 'watermark_images', title: '图片水印',     desc: '文字/图片水印 + 单个/铺满模式 + 位置/角度/间距', category: 'image', icon: 'droplet', tags: ['图片','水印','watermark'],        improvedAt: '2026-05-23', status: 'ready' },
  { slug: 'ico_generator',    title: 'ICO 图标生成', desc: '多平台图标生成（Win/Mac/iOS/Android/Favicon）+ 裁剪 + 圆角 + ICO/ICNS/PNG', category: 'image', icon: 'app-window', tags: ['ICO','ICNS','图标','favicon','icon'], improvedAt: '2026-05-23', status: 'ready' },
  { slug: 'ico_converter',    title: '图标转图片',   desc: 'ICO/ICNS 图标解析，提取内部所有图层并导出为 PNG/JPG/WebP', category: 'image', icon: 'image-down', tags: ['ICO','ICNS','图标','转换','提取','icon'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'ps_online',        title: '在线 PS（第三方）',  desc: '在线 Photoshop 图像处理工具（第三方）',  category: 'image', icon: 'brush', tags: ['ps','photoshop','图像','编辑'],  status: 'ready', url: './tools/ps_online/index.html' },
  { slug: 'images_merge',     title: '图片拼接',     desc: '多图横向/纵向/宫格/模板拼接，支持自定义标题、间距背景与预设版式',              category: 'image', icon: 'combine', tags: ['图片','拼接','拼图','merge','模板','宫格'], updatedAt: '2026-05-10', improvedAt: '2026-05-24', status: 'ready' },
  { slug: 'images_border',    title: '图片圆角边框', desc: '添加圆角 + 边框 + 阴影 + 背景色/渐变底',            category: 'image', icon: 'square', tags: ['图片','圆角','边框','阴影','border'], updatedAt: '2026-05-10', improvedAt: '2026-05-27', status: 'ready' },
  { slug: 'images_mosaic',    title: '图片马赛克',   desc: '全图/选区马赛克 + 高斯模糊，强度可调',              category: 'image', icon: 'grid-3x3', tags: ['图片','马赛克','模糊','mosaic','blur'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'images_exif',      title: 'EXIF 信息查看', desc: '读取 JPEG/HEIC/TIFF 等图片 EXIF 元数据，支持 GPS 坐标与 JSON 导出',      category: 'image', icon: 'info', tags: ['图片','EXIF','元数据','GPS','相机'], updatedAt: '2026-05-10', improvedAt: '2026-05-27', status: 'ready' },
  { slug: 'images_filter',    title: '图片滤镜',      desc: '可视化调色滤镜，实时预览 + 下载成品图 + 复制 CSS 代码',                 category: 'image', icon: 'sliders-horizontal', tags: ['图片','滤镜','调色','filter','CSS'], updatedAt: '2026-05-15', status: 'ready' },

  // SVG / PDF
  { slug: 'svg_code_editor', title: 'SVG 代码编辑', desc: 'SVG 代码编辑、实时预览、元素可视化编辑、裁剪、优化与多格式导出', category: 'media', icon: 'pen-tool', tags: ['svg','编辑','代码','preview','优化','导出'], improvedAt: '2026-05-24', status: 'ready' },
  { slug: 'svg_compress',    title: 'SVG 压缩',     desc: 'SVG 批量压缩，安全/平衡/激进档位预设，支持文件夹与代码粘贴', category: 'media', icon: 'file-archive', tags: ['svg','压缩','优化','批量'], improvedAt: '2026-05-24', status: 'ready' },
  { slug: 'pdf_images',       title: 'PDF 转图片',   desc: 'PDF 逐页转 PNG/JPEG，批量下载 ZIP',               category: 'media', icon: 'file-text', tags: ['PDF','图片','转换','png'],      status: 'ready' },
  { slug: 'pdf_merge_split',  title: 'PDF 合并/拆分', desc: '多个 PDF 合并为一份，或将一份 PDF 按页拆分为多个文件，全程本地处理', category: 'media', icon: 'file-stack', tags: ['PDF','合并','拆分','merge','split','页面'], updatedAt: '2026-06-10', status: 'ready' },
  { slug: 'watermark_pdf',    title: 'PDF 水印',     desc: 'PDF 添加文字/图片水印 + 页面范围 + 铺满模式',    category: 'media', icon: 'stamp', tags: ['PDF','水印','watermark'],         status: 'ready' },
  { slug: 'pdf_batch_watermark', title: 'PDF 批量专属水印', desc: '按名单批量生成专属水印 PDF，支持名单预览、共用副水印、命名规则与 ZIP 导出', category: 'media', icon: 'files', tags: ['PDF','水印','批量','专属','名单','ZIP'], updatedAt: '2026-05-25', status: 'ready' },
  { slug: 'svg_editor',       title: 'SVG 编辑（第三方）',   desc: '在线 SVG 矢量图形编辑器（第三方）',               category: 'media', icon: 'pencil', tags: ['svg','编辑','矢量','editor'],   status: 'ready', url: './tools/svg_editor/index.html' },

  // 二维码
  { slug: 'qrcode',          title: '二维码生成',   desc: '自定义二维码生成，支持 Logo / 配色 / 多内容类型', category: 'qrcode', icon: 'qr-code', tags: ['qrcode','二维码'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'qrcode_scan',     title: '二维码识别',   desc: '上传图片识别二维码（WiFi/链接/名片/微信等）',      category: 'qrcode', icon: 'scan-line', tags: ['二维码','扫码','识别','jsQR'], status: 'ready' },
  { slug: 'wechat_qrcode',   title: '公众号二维码', desc: '输入公众号 ID 提取官方二维码',                     category: 'qrcode', icon: 'message-circle', tags: ['微信','公众号','二维码'],      status: 'ready' },
  { slug: 'barcode',         title: '条形码生成',   desc: '支持 CODE128 / EAN-13 / EAN-8 / UPC-A / CODE39 等格式，可自定义配色与高度，导出 PNG / SVG', category: 'qrcode', icon: 'scan-barcode', tags: ['barcode','条形码','EAN','CODE128','生成'], updatedAt: '2026-06-10', status: 'ready' },

  // 颜色设计
  { slug: 'color_tool',      title: '颜色工具箱',   desc: '颜色格式转换 / 色阶 / 配色方案 / 组件颜色示例 / 变量导出', category: 'color', icon: 'palette', tags: ['颜色','转换','HEX','RGB','HSL','配色'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'color_mixing',    title: '颜色混合',     desc: '两色按权重混合 + 渐变预览 + CSS 导出',             category: 'color', icon: 'blend', tags: ['颜色','混合','渐变','blend'],                status: 'ready' },
  { slug: 'color_gradient',  title: '渐变色卡',     desc: '210 个精选 CSS 渐变，默认灵感抽卡 + 14 类浏览与全库搜索', category: 'color', icon: 'pipette', tags: ['渐变','色卡','gradient','配色'], improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'color_name',      title: '颜色名称查询', desc: '输入任意 HEX 色值，自动查找最接近的 CSS 命名色和中国传统色（744 色），附全量色表浏览',  category: 'color', icon: 'tag', tags: ['颜色','命名','CSS','中国色','传统色','color name'], updatedAt: '2026-06-10', improvedAt: '2026-06-10', status: 'ready' },
  { slug: 'css_gradient',      title: 'CSS 渐变生成',    desc: '可视化渐变编辑器，支持线性/径向/锥形 + 重复模式',                                     category: 'css',   icon: 'paintbrush',  tags: ['CSS','渐变','gradient','生成器'],                        status: 'ready' },
  { slug: 'css_text_gradient', title: 'CSS 文字渐变',    desc: '可视化文字渐变生成器，色标拖拽 + 方向控制 + 预设库，一键导出 background-clip: text CSS', category: 'css',   icon: 'type',        tags: ['CSS','文字','渐变','gradient','文字渐变','text','生成器'], updatedAt: '2026-05-26', status: 'ready' },

  // 生活查询
  { slug: 'phone_localtion', title: '手机号归属地', desc: '手机号码归属地查询（聚合数据 API）',       category: 'query', icon: 'phone', tags: ['phone','手机','归属地'],       status: 'ready' },
  { slug: 'idcard_calc',     title: '身份证查询',   desc: '身份证号码信息查询，支持批量 + 导出 Excel', category: 'query', icon: 'credit-card', tags: ['身份证','idcard','年龄','生肖'], status: 'ready' },
  { slug: 'areacode',        title: '行政区划',     desc: '中国行政区划代码 / 邮编查询',               category: 'query', icon: 'map-pin', tags: ['行政区划','邮编','区号'],       status: 'ready' },
  { slug: 'capital',         title: '世界首都',     desc: '世界各国首都信息查询，按洲分类',                category: 'query', icon: 'flag', tags: ['首都','国家','capital','世界'],  status: 'ready' },
  { slug: 'worldtime',       title: '世界时间',     desc: '实时查看世界各地当前时间',                      category: 'query', icon: 'clock', tags: ['时间','时区','world','time'],    status: 'ready' },
  { slug: 'zodiac',          title: '十二生肖',     desc: '生肖年份查询，五行 / 性格 / 相配分析',          category: 'query', icon: 'paw-print', tags: ['生肖','zodiac','年份','属相'],   status: 'ready' },
  { slug: 'calendar',        title: '日历查询',     desc: '公历农历日期查询转换，节气节日，干支生肖', category: 'query', icon: 'calendar', tags: ['日历','农历','节气','节日','干支'], improvedAt: '2026-05-23', status: 'ready' },
  { slug: 'relationship',    title: '亲戚关系计算', desc: '中国亲属称谓计算器，正向/反向/关系链/两人合称四种查询', category: 'query', icon: 'users', tags: ['亲戚','称谓','关系','亲属','relationship'], updatedAt: '2026-06-10', status: 'ready' },

  // 网络工具
  { slug: 'ip_query',        title: 'IP 地址查询',  desc: '查询当前 IP 及任意 IP 的归属地信息',        category: 'net', icon: 'globe', tags: ['ip','地址','归属地','location'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'http_status',     title: 'HTTP 状态码',    desc: '1xx-5xx HTTP 状态码含义速查，搜索即查',              category: 'net', icon: 'file-code', tags: ['http','状态码','status','code'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'useragent_parse', title: 'User-Agent 解析', desc: '粘贴 UA 字符串解析浏览器/操作系统/设备信息',          category: 'net', icon: 'monitor-smartphone', tags: ['ua','user-agent','浏览器','设备'], updatedAt: '2026-05-10', status: 'ready' },
  { slug: 'meta_fetch',      title: '网站 Meta 抓取', desc: '输入 URL 获取网站 title / description / OG 标签等',  category: 'net', icon: 'scan', tags: ['meta','og','title','抓取','seo'], updatedAt: '2026-05-10', status: 'ready' },

  // 符号速查
  { slug: 'html_query',      title: 'HTML 符号',    desc: 'HTML 特殊符号 / 实体编码对照表，点击即复制', category: 'symbol', icon: 'at-sign', tags: ['html','符号','实体','entity'],  status: 'ready' },
  { slug: 'emoji',           title: 'Emoji 大全',   desc: '常用 emoji 表情，点击即复制',                  category: 'symbol', icon: 'smile', tags: ['emoji','表情','符号'],           status: 'ready' },
  { slug: 'special_symbols', title: '特殊符号',     desc: '特殊符号大全，点击即复制',                      category: 'symbol', icon: 'hash', tags: ['符号','特殊','箭头','数学'],     improvedAt: '2026-05-24', status: 'ready' }
];

export const categoryName = (id) => CATEGORIES.find(c => c.id === id)?.name || id;
export const findTool = (slug) => TOOLS.find(t => t.slug === slug);
export const readyTools = () => TOOLS.filter(t => t.status === 'ready');
