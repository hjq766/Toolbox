// 工具注册表：单一数据源。首页/搜索/面包屑/SEO 等均从这里读取。
// 新增工具：先在此注册，再创建 tools/<slug>/index.html + page.js。
export const CATEGORIES = [
  { id: 'all',    name: '全部',     icon: 'grid-3x3' },
  { id: 'dev',    name: '编码开发', icon: 'code' },
  { id: 'text',   name: '文本处理', icon: 'type' },
  { id: 'code',   name: '代码格式', icon: 'braces' },
  { id: 'calc',   name: '计算换算', icon: 'scale' },
  { id: 'image',  name: '图片处理', icon: 'image' },
  { id: 'media',  name: '矢量文档', icon: 'pen-tool' },
  { id: 'qrcode', name: '二维码', icon: 'qr-code' },
  { id: 'color',  name: '颜色工具', icon: 'palette' },
  { id: 'query',  name: '生活查询', icon: 'search' },
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
  { slug: 'grid_layout',     title: 'Grid 网格布局',  desc: '可视化网格布局生成器，支持智能推荐、多设备预览与导出', category: 'dev', icon: 'layout-grid', tags: ['grid','layout','布局','网格'], status: 'ready' },
  { slug: 'html_preview',    title: 'HTML 实时预览',  desc: '在线编辑 HTML/CSS/JS 并实时预览，支持多设备与导出', category: 'dev', icon: 'code', tags: ['html','css','javascript','预览','playground'], status: 'ready' },
  { slug: 'web_preview',     title: '多设备网页预览', desc: '任意 URL 的桌面/笔电/平板/手机多尺寸预览，附二维码', category: 'dev', icon: 'smartphone', tags: ['preview','device','responsive','响应式','二维码'], status: 'ready' },

  // 文本处理
  { slug: 'text_size',        title: '文本分析器',  desc: '字符/字数/字节/行数等多维统计', category: 'text', icon: 'text', tags: ['count','统计'], status: 'ready' },
  { slug: 'text_deduplicate', title: '文本去重',    desc: '按行去重，支持忽略空白/大小写/保序等', category: 'text', icon: 'filter', status: 'ready' },
  { slug: 'en_case',          title: '大小写转换',  desc: '全大/小写、首字母、空格/下划线/中横线互转', category: 'text', icon: 'a-large-small', tags: ['case','大小写','camel','snake'], status: 'ready' },
  { slug: 'text_difference',  title: '文本对比',    desc: '两段文本的行级差异高亮对比',     category: 'text', icon: 'git-compare-arrows', tags: ['diff','对比','差异'], status: 'ready' },
  { slug: 'html_text',        title: 'HTML 转文本', desc: '去除 HTML 标签，提取纯文本',     category: 'text', icon: 'file-code', tags: ['html','text','抽取'], status: 'ready' },
  { slug: 'text_morse',       title: '摩尔斯电码',  desc: '文本与摩尔斯电码双向转换，支持中文（拼音）', category: 'text', icon: 'radio', tags: ['morse','摩尔斯','电码'], status: 'ready' },
  { slug: 'zh_convert',       title: '简繁体转换',  desc: '中文简体与繁体互转，支持大陆/港澳/台湾用法', category: 'text', icon: 'languages', tags: ['简体','繁体','中文','opencc'], status: 'ready' },
  { slug: 'pinyin',           title: '拼音转换',    desc: '汉字转拼音，支持声调/首字母/大写',             category: 'text', icon: 'keyboard', tags: ['pinyin','拼音','汉字'], status: 'ready' },

  // 代码格式
  { slug: 'code_format',     title: '代码格式化',       desc: '支持 HTML/CSS/JS/Python 等多语言的代码格式化', category: 'code', icon: 'code', tags: ['code','format','beautify'],     status: 'ready' },
  { slug: 'code_json',       title: 'JSON 格式化',      desc: 'JSON 格式化 / 压缩 / 校验 / YAML·CSV 预览',   category: 'code', icon: 'braces', tags: ['json','yaml','csv','格式化'],   status: 'ready' },
  { slug: 'code_xml',        title: 'XML 格式化',       desc: 'XML 格式化 / 校验 / 压缩工具',                 category: 'code', icon: 'file-code', tags: ['xml','格式化'],                 status: 'ready' },
  { slug: 'markdown_editor', title: 'Markdown 编辑器',   desc: '所见即所得 Markdown 编辑器，实时预览 + 快捷插入 + 导出', category: 'code', icon: 'file-text', tags: ['markdown','编辑器','preview','写作'], status: 'ready' },
  { slug: 'markdown_html',   title: 'Markdown 转 HTML', desc: 'Markdown 格式转 HTML 代码，实时预览',          category: 'code', icon: 'file-text',  tags: ['markdown','html','转换'],       status: 'ready' },
  { slug: 'html_markdown',   title: 'HTML 转 Markdown', desc: 'HTML 代码转 Markdown 格式，实时预览',          category: 'code', icon: 'code',  tags: ['html','markdown','转换'],       status: 'ready' },
  { slug: 'html_javascript', title: 'HTML/JS 转换',     desc: 'HTML 代码与 JavaScript 代码互相转换',           category: 'code', icon: 'terminal', tags: ['html','javascript','转换'],     status: 'ready' },

  // 计算换算
  { slug: 'convert_length',  title: '长度换算',    desc: '米/厘米/英寸/英里等长度单位互换',                 category: 'calc', icon: 'ruler', status: 'ready' },
  { slug: 'convert_weight',  title: '重量换算',    desc: '千克/克/磅/盎司等重量单位互换',                   category: 'calc', icon: 'scale', status: 'ready' },
  { slug: 'convert_temp',    title: '温度换算',    desc: '摄氏度 / 华氏度 / 开尔文',                         category: 'calc', icon: 'thermometer', status: 'ready' },
  { slug: 'convert_area',    title: '面积换算',    desc: '平米/亩/公顷/英亩等面积单位互换',                 category: 'calc', icon: 'square', tags: ['area','面积','亩','公顷'], status: 'ready' },
  { slug: 'convert_volume',  title: '体积换算',    desc: '升/毫升/立方米 + 市/英/美制体积单位互换',         category: 'calc', icon: 'box', tags: ['volume','体积','升','加仑'], status: 'ready' },
  { slug: 'convert_byte',    title: '字节换算',    desc: '比特/字节/KB/MB/GB/TB/PB 互换',                    category: 'calc', icon: 'hard-drive', tags: ['byte','bit','kb','mb','gb','tb'], status: 'ready' },
  { slug: 'convert_power',   title: '功率换算',    desc: '瓦/千瓦/马力等功率单位互换',                       category: 'calc', icon: 'zap', tags: ['power','功率','瓦','马力','hp'], status: 'ready' },
  { slug: 'convert_press',   title: '压力换算',    desc: '帕/兆帕/巴/大气压/PSI 等互换',                     category: 'calc', icon: 'gauge', tags: ['pressure','压力','bar','psi','atm'], status: 'ready' },
  { slug: 'convert_heat',    title: '热量换算',    desc: '焦耳/卡路里/千瓦时/BTU 等热量单位互换',           category: 'calc', icon: 'flame', tags: ['heat','energy','热量','卡路里'], status: 'ready' },
  { slug: 'convert_scale',   title: '宽高比换算',  desc: '任意宽/高推算比例，预设 16:9、4:3、3:2、1:1',      category: 'calc', icon: 'ratio', tags: ['ratio','aspect','宽高比','16:9'], status: 'ready' },
  { slug: 'calc_golden',     title: '黄金比例',    desc: '黄金分割及经典设计比例分段计算，带可视化预览',       category: 'calc', icon: 'star', tags: ['golden','ratio','黄金'], status: 'ready' },
  { slug: 'rmb',             title: '人民币大写',  desc: '数字金额转中文大写金额',                           category: 'calc', icon: 'badge-japanese-yen', tags: ['rmb','大写','金额','currency'], status: 'ready' },

  // 图片处理
  { slug: 'images_compress',  title: '图片压缩',     desc: '多模式批量图片压缩（高质量/均衡/极限/自定义）',   category: 'image', icon: 'minimize-2', tags: ['图片','压缩','批量','compress'],  status: 'ready' },
  { slug: 'images_convert',   title: '图片格式转换', desc: '批量转换 JPG/PNG/WebP + 尺寸调整 + 质量控制',     category: 'image', icon: 'arrow-left-right', tags: ['图片','转换','格式','convert'],   status: 'ready' },
  { slug: 'images_clipping',  title: '图片裁剪',     desc: '自由/比例裁剪 + 旋转翻转 + 多格式输出',           category: 'image', icon: 'scissors', tags: ['图片','裁剪','crop','旋转'],     status: 'ready' },
  { slug: 'images_flip',      title: '图片翻转',     desc: '水平/垂直翻转 + 旋转 90°/180° + 原尺寸下载',     category: 'image', icon: 'flip-horizontal', tags: ['图片','翻转','旋转','flip'],     status: 'ready' },
  { slug: 'images_cut',       title: '多宫格切图',   desc: '预设/自定义行列宫格切图，ZIP 批量下载',            category: 'image', icon: 'grid-2x2', tags: ['图片','切图','宫格','grid'],     status: 'ready' },
  { slug: 'images_color',     title: '图片色板提取', desc: '自动提取主色调 + 手动取色 + 选区取色 + 导出',      category: 'image', icon: 'palette', tags: ['图片','色板','取色','palette'],   status: 'ready' },
  { slug: 'watermark_images', title: '图片水印',     desc: '文字/图片水印 + 单个/铺满模式 + 位置/角度/间距', category: 'image', icon: 'droplet', tags: ['图片','水印','watermark'],        status: 'ready' },
  { slug: 'ico_generator',    title: 'ICO 图标生成', desc: '多平台图标生成（Win/Mac/iOS/Android/Favicon）+ 裁剪 + 圆角 + ICO/ICNS/PNG', category: 'image', icon: 'app-window', tags: ['ICO','ICNS','图标','favicon','icon'], status: 'ready' },
  { slug: 'ps_online',        title: '在线 PS（第三方）',  desc: '在线 Photoshop 图像处理工具（第三方）',  category: 'image', icon: 'brush', tags: ['ps','photoshop','图像','编辑'],  status: 'ready', url: './tools/ps_online/index.html' },

  // SVG / PDF
  { slug: 'svg_code_editor', title: 'SVG 代码编辑', desc: 'SVG 代码编辑 + 实时预览 + 元素可视化编辑 + 裁剪', category: 'media', icon: 'pen-tool', tags: ['svg','编辑','代码','preview'], status: 'ready' },
  { slug: 'svg_compress',    title: 'SVG 压缩',     desc: 'SVG 批量压缩，移除冗余代码',                      category: 'media', icon: 'file-archive', tags: ['svg','压缩','优化'],          status: 'ready' },
  { slug: 'pdf_images',       title: 'PDF 转图片',   desc: 'PDF 逐页转 PNG/JPEG，批量下载 ZIP',               category: 'media', icon: 'file-text', tags: ['PDF','图片','转换','png'],      status: 'ready' },
  { slug: 'watermark_pdf',    title: 'PDF 水印',     desc: 'PDF 添加文字/图片水印 + 页面范围 + 铺满模式',    category: 'media', icon: 'stamp', tags: ['PDF','水印','watermark'],         status: 'ready' },
  { slug: 'svg_editor',       title: 'SVG 编辑（第三方）',   desc: '在线 SVG 矢量图形编辑器（第三方）',               category: 'media', icon: 'pencil', tags: ['svg','编辑','矢量','editor'],   status: 'ready', url: './tools/svg_editor/index.html' },

  // 二维码
  { slug: 'qrcode',          title: '二维码生成',   desc: '自定义二维码生成，支持 Logo / 配色 / 多内容类型', category: 'qrcode', icon: 'qr-code', tags: ['qrcode','二维码'],              status: 'ready' },
  { slug: 'qrcode_scan',     title: '二维码识别',   desc: '上传图片识别二维码（WiFi/链接/名片/微信等）',      category: 'qrcode', icon: 'scan-line', tags: ['二维码','扫码','识别','jsQR'], status: 'ready' },
  { slug: 'wechat_qrcode',   title: '公众号二维码', desc: '输入公众号 ID 提取官方二维码',                     category: 'qrcode', icon: 'message-circle', tags: ['微信','公众号','二维码'],      status: 'ready' },

  // 颜色设计
  { slug: 'color_tool',      title: '颜色工具箱',   desc: '颜色格式转换 / 色阶 / 配色方案 / 变量导出',       category: 'color', icon: 'palette', tags: ['颜色','转换','HEX','RGB','HSL','配色'],      status: 'ready' },
  { slug: 'color_mixing',    title: '颜色混合',     desc: '两色按权重混合 + 渐变预览 + CSS 导出',             category: 'color', icon: 'blend', tags: ['颜色','混合','渐变','blend'],                status: 'ready' },
  { slug: 'color_gradient',  title: '渐变色卡',     desc: '160+ 精选 CSS 渐变配色方案，点击即复制',           category: 'color', icon: 'pipette', tags: ['渐变','色卡','gradient','配色'],              status: 'ready' },
  { slug: 'css_gradient',    title: 'CSS 渐变生成', desc: '可视化渐变编辑器，支持线性/径向/锥形 + 重复模式',  category: 'color', icon: 'paintbrush', tags: ['CSS','渐变','gradient','生成器'],            status: 'ready' },

  // 生活查询
  { slug: 'phone_localtion', title: '手机号归属地', desc: '手机号码归属地查询（聚合数据 API）',       category: 'query', icon: 'phone', tags: ['phone','手机','归属地'],       status: 'ready' },
  { slug: 'idcard_calc',     title: '身份证查询',   desc: '身份证号码信息查询，支持批量 + 导出 Excel', category: 'query', icon: 'credit-card', tags: ['身份证','idcard','年龄','生肖'], status: 'ready' },
  { slug: 'areacode',        title: '行政区划',     desc: '中国行政区划代码 / 邮编查询',               category: 'query', icon: 'map-pin', tags: ['行政区划','邮编','区号'],       status: 'ready' },
  { slug: 'capital',         title: '世界首都',     desc: '世界各国首都信息查询，按洲分类',                category: 'query', icon: 'flag', tags: ['首都','国家','capital','世界'],  status: 'ready' },
  { slug: 'worldtime',       title: '世界时间',     desc: '实时查看世界各地当前时间',                      category: 'query', icon: 'clock', tags: ['时间','时区','world','time'],    status: 'ready' },
  { slug: 'zodiac',          title: '十二生肖',     desc: '生肖年份查询，五行 / 性格 / 相配分析',          category: 'query', icon: 'paw-print', tags: ['生肖','zodiac','年份','属相'],   status: 'ready' },
  { slug: 'calendar',        title: '日历查询',     desc: '公历农历日期查询转换，节气节日，干支生肖', category: 'query', icon: 'calendar', tags: ['日历','农历','节气','节日','干支'], status: 'ready' },

  // 符号速查
  { slug: 'html_query',      title: 'HTML 符号',    desc: 'HTML 特殊符号 / 实体编码对照表，点击即复制', category: 'symbol', icon: 'at-sign', tags: ['html','符号','实体','entity'],  status: 'ready' },
  { slug: 'emoji',           title: 'Emoji 大全',   desc: '常用 emoji 表情，点击即复制',                  category: 'symbol', icon: 'smile', tags: ['emoji','表情','符号'],           status: 'ready' },
  { slug: 'special_symbols', title: '特殊符号',     desc: '特殊符号大全，点击即复制',                      category: 'symbol', icon: 'hash', tags: ['符号','特殊','箭头','数学'],     status: 'ready' }
];

export const categoryName = (id) => CATEGORIES.find(c => c.id === id)?.name || id;
export const findTool = (slug) => TOOLS.find(t => t.slug === slug);
export const readyTools = () => TOOLS.filter(t => t.status === 'ready');
