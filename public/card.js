// 工具卡片数据管理
window.toolCards = {
    // 分类定义
    categories: [
        { id: 'all', name: '全部', icon: 'tabler:border-all' },
        { id: 'dev', name: '开发工具', icon: 'tabler:devices' },
        { id: 'query', name: '查询工具', icon: 'tabler:device-imac-search' },
        { id: 'text', name: '文本工具', icon: 'tabler:clipboard-text' },
        { id: 'calc', name: '计算换算', icon: 'tabler:calculator' },
        { id: 'format', name: '格式转换', icon: 'tabler:transform' },
        { id: 'image', name: '图片工具', icon: 'tabler:photo' },
        { id: 'color', name: '颜色工具', icon: 'tabler:palette' }
    ],

    // 工具卡片数据
    tools: {
        // 开发工具类
        dev: [
            {
                href: 'tools/grid/index.html',
                icon: 'tabler:layout-grid',
                title: 'Grid 网格布局生成器',
                desc: '可视化调整和预览网格布局效果，支持智能布局推荐'
            },
            {
                href: 'tools/preview/index.html',
                icon: 'tabler:devices',
                title: '多设备网页预览工具',
                desc: '一键生成网页在多种设备上的呈现效果'
            },
            {
                href: 'tools/code_encry/index.html',
                icon: 'tabler:lock',
                title: '代码加密',
                desc: '支持JavaScript、CSS、HTML代码的加密工具'
            },
            {
                href: 'tools/meta/index.html',
                icon: 'tabler:bookmarks',
                title: 'Meta生成器',
                desc: '快速生成HTML Meta标签'
            },
            {
                href: 'tools/hash/index.html',
                icon: 'tabler:hash',
                title: '哈希计算',
                desc: '支持多种哈希算法，可计算文本和文件的哈希值，包括MD5、SHA1、SHA256等'
            },
            {
                href: 'tools/rand_password/index.html',
                icon: 'tabler:lock-password',
                title: '随机密码生成',
                desc: '生成安全的随机密码，支持自定义长度和字符类型'
            },
            {
                href: 'tools/urlcode/index.html',
                icon: 'tabler:link',
                title: 'URL编码转换',
                desc: 'URL编码/解码转换工具'
            },
            {
                href: 'tools/hex_convert/index.html',
                icon: 'tabler:hexagon-letter-h',
                title: '进制转换',
                desc: '二进制、八进制、十进制、十六进制转换'
            },
        ],

        // 格式转换类
        format: [
            {
                href: 'tools/markdown_html/index.html',
                icon: 'tabler:square-letter-m',
                title: 'Markdown转HTML',
                desc: 'Markdown格式转HTML代码'
            },
            {
                href: 'tools/html_markdown/index.html',
                icon: 'tabler:square-letter-h',
                title: 'HTML转Markdown',
                desc: 'HTML代码转Markdown格式'
            },
			{
                href: 'tools/code_format/index.html',
                icon: 'tabler:terminal-2',
                title: '代码格式化',
                desc: '支持多种语言的代码格式化工具'
            },
            {
                href: 'tools/code_json/index.html',
                icon: 'tabler:json',
                title: 'JSON格式化',
                desc: 'JSON数据格式化和压缩工具'
            },
            {
                href: 'tools/code_xml/index.html',
                icon: 'tabler:file-type-xml',
                title: 'XML格式化',
                desc: 'XML数据格式化和压缩工具'
            },
            {
                href: 'tools/html_javascript/index.html',
                icon: 'tabler:brackets-angle',
                title: 'HTML/JS转换',
                desc: 'HTML和JavaScript代码互相转换工具'
            },
            {
                href: 'tools/qrcode/index.html',
                icon: 'tabler:qrcode',
                title: '二维码生成',
                desc: '自定义二维码生成工具'
            },
            {
                href: 'tools/zh_convert/index.html',
                icon: 'tabler:analyze',
                title: '简繁体转换',
                desc: '中文简体和繁体字互相转换工具'
            },
            {
                href: 'tools/pinyin/index.html',
                icon: 'tabler:abc',
                title: '拼音转换',
                desc: '中文汉字转拼音工具'
            },
            {
                href: 'tools/base64/index.html',
                icon: 'tabler:alphabet-latin',
                title: 'Base64编码',
                desc: '支持文本内容和图片的Base64编码转换工具'
            },
        ],

        // 查询工具类
        query: [
            {
                href: 'tools/phone_localtion/index.html',
                icon: 'tabler:device-mobile',
                title: '手机号归属地',
                desc: '手机号码归属地查询工具'
            },
            {
                href: 'tools/idcard_calc/index.html',
                icon: 'tabler:id',
                title: '身份证查询',
                desc: '身份证号码信息查询工具'
            },
            {
                href: 'tools/areacode/index.html',
                icon: 'tabler:location-search',
                title: '行政区划',
                desc: '中国行政区划代码查询工具'
            },
            {
                href: 'tools/html_query/index.html',
                icon: 'tabler:brand-html5',
                title: 'HTML符号查询',
                desc: 'HTML特殊符号对照表查询'
            },
            {
                href: 'tools/special_symbols/index.html',
                icon: 'tabler:math-symbols',
                title: '特殊符号',
                desc: '特殊符号大全查询工具'
            },
            {
                href: 'tools/emoji/index.html',
                icon: 'tabler:mood-happy',
                title: 'Emoji表情大全',
                desc: 'emoji表情大全收集了各类常用emoji表情，点击即可快速复制使用'
            },
            {
                href: 'tools/calendar/index.html',
                icon: 'tabler:calendar-search',
                title: '日历查询',
                desc: '公历农历日期查询转换工具'
            },
			{
                href: 'tools/capital/index.html',
                icon: 'tabler:calendar-search',
                title: '世界各国首都查询',
                desc: '快速查询世界各国首都信息'
            },
            {
                href: 'tools/worldtime/index.html',
                icon: 'tabler:ruler-2',
                title: '世界时间',
                desc: '实时查看世界各地时间'
            },
            {
                href: 'tools/zodiac/index.html',
                icon: 'tabler:cat',
                title: '十二生肖查询工具',
                desc: '快速查询年份对应的生肖，了解生肖文化与性格特征'
            },
        ],

        // 文本工具类
        text: [
            {
                href: 'tools/text_difference/index.html',
                icon: 'tabler:contrast',
                title: '文本对比',
                desc: '文本内容差异对比工具'
            },
            {
                href: 'tools/en_case/index.html',
                icon: 'tabler:a-b-2',
                title: '大小写转换',
                desc: '英文字母大小写转换工具'
            },
            {
                href: 'tools/text_size/index.html',
                icon: 'tabler:text-size',
                title: '文本分析器',
                desc: '文本统计和分析工具'
            },
            {
                href: 'tools/text_deduplicate/index.html',
                icon: 'tabler:clear-formatting',
                title: '文本去重工具',
                desc: '快速去除文本中的重复内容，支持多种去重选项'
            },
            {
                href: 'tools/html_text/index.html',
                icon: 'tabler:code-dots',
                title: 'HTML转文本工具',
                desc: '快速去除HTML标签，提取纯文本内容'
            },
            {
                href: 'tools/text_morse/index.html',
                icon: 'tabler:lock',
                title: '摩尔斯电码转换器',
                desc: '支持中英文、数字与摩尔斯电码的双向转换，快速准确'
            },
            {
                href: 'tools/markdown/index.html',
                icon: 'tabler:markdown',
                title: 'Markdown编辑器',
                desc: '在线Markdown编辑器，支持实时预览、语法高亮和多种导出格式'
            },
        ],

        // 计算换算类
        calc: [
            {
                href: 'tools/calc_golden/index.html',
                icon: 'tabler:aspect-ratio',
                title: '黄金比例计算器',
                desc: '快速计算黄金分割比例，适用于设计、艺术创作等场景'
            },
            {
                href: 'tools/convert_scale/index.html',
                icon: 'tabler:arrows-maximize',
                title: '宽高比换算',
                desc: '快速计算和转换各种宽高比例'
            },
            {
                href: 'tools/convert_byte/index.html',
                icon: 'tabler:transform-point',
                title: '字节换算',
                desc: '字符串字节长度计算工具'
            },
            {
                href: 'tools/convert_length/index.html',
                icon: 'tabler:ruler-measure',
                title: '长度换算',
                desc: '各种长度单位互相转换计算'
            },
            {
                href: 'tools/convert_power/index.html',
                icon: 'tabler:square-letter-p',
                title: '功率换算',
                desc: '各种功率单位互相转换计算'
            },
            {
                href: 'tools/convert_temp/index.html',
                icon: 'tabler:temperature-celsius',
                title: '温度换算',
                desc: '摄氏度、华氏度等温度单位转换'
            },
            {
                href: 'tools/convert_volume/index.html',
                icon: 'tabler:box',
                title: '体积换算',
                desc: '各种体积单位互相转换计算'
            },
            {
                href: 'tools/convert_weight/index.html',
                icon: 'tabler:scale',
                title: '重量换算',
                desc: '各种重量单位互相转换计算'
            },
            {
                href: 'tools/convert_press/index.html',
                icon: 'tabler:dashboard',
                title: '压力换算',
                desc: '各种压力单位互相转换计算'
            },
            {
                href: 'tools/convert_heat/index.html',
                icon: 'tabler:flame',
                title: '热量换算',
                desc: '各种热量单位互相转换计算'
            },
            {
                href: 'tools/convert_area/index.html',
                icon: 'tabler:box-margin',
                title: '面积换算',
                desc: '各种面积单位互相转换计算'
            },
            {
                href: 'tools/rmb/index.html',
                icon: 'tabler:currency-yen',
                title: '人民币转换',
                desc: '人民币大小写金额互相转换'
            }
        ],

        // 图片工具类
        image: [
            {
                href: 'tools/images_convert/index.html',
                icon: 'tabler:photo-spark',
                title: '图片格式转换',
                desc: '支持多种图片格式互相转换'
            },
            {
                href: 'tools/images_compress/index.html',
                icon: 'tabler:photo-cog',
                title: '图片压缩工具',
                desc: '在线高质量图片压缩，支持多种图片格式'
            },
            {
                href: 'tools/images_color/index.html',
                icon: 'tabler:color-picker',
                title: '图片色板提取',
                desc: '从图片中提取主要颜色，生成配色方案'
            },
            {
                href: 'tools/images_cut/index.html',
                icon: 'tabler:photo-square-rounded',
                title: '多宫格切图工具',
                desc: '将图片切割成多个小图，支持自定义大小和数量'
            },
            {
                href: 'tools/images_filp/index.html',
                icon: 'tabler:camera-rotate',
                title: '图片翻转工具',
                desc: '快速翻转图片，支持水平、垂直、顺时针、逆时针四种翻转方式'
            },
            {
                href: 'tools/watermark_images/index.html',
                icon: 'tabler:image-in-picture',
                title: '图片水印工具',
                desc: '为图片添加文字或图片水印，支持自定义位置、透明度等效果'
            },
			{
                href: 'tools/watermark_pdf/index.html',
                icon: 'tabler:file-type-pdf',
                title: 'PDF水印工具',
                desc: '为PDF文档添加文字或图片水印，支持自定义位置、透明度等效果'
            },
            {
                href: 'tools/pdf_images/index.html',
                icon: 'tabler:photo-pentagon',
                title: 'PDF转图片',
                desc: '将PDF文档转换为高清图片，支持批量转换'
            },
            {
                href: 'tools/ico_generator/index.html',
                icon: 'tabler:favicon',
                title: 'ICO图标生成',
                desc: '将您的图片转换为高质量的Windows ICO和macOS ICNS格式图标'
            },
	    {
                href: 'tools/svg_compress/index.html',
                icon: 'tabler:file-type-svg',
                title: 'SVG压缩工具',
                desc: '在线SVG矢量图压缩工具'
            }
        ],

        // 颜色工具类
        color: [
            {
                href: 'tools/color_tool/index.html',
                icon: 'tabler:palette',
                title: '颜色工具箱',
                desc: '一站式颜色处理解决方案，为设计师和开发者提供颜色格式转换、调色板生成、智能配色推荐等专业功能'
            },
            {
				href: 'tools/color_gradient/index.html',
                icon: 'tabler:color-filter',
                title: 'CSS渐变色合集',
                desc: '精选CSS渐变色合集，提供多种风格渐变配色方案，支持一键复制CSS代码' 
            },
            {
                href: 'tools/css_gradient/index.html',
                icon: 'tabler:color-swatch',
                title: 'CSS渐变生成器',
                desc: '可视化CSS渐变背景生成工具，支持线性和径向渐变'
            },
            {
				href: 'tools/color_mixing/index.html',
                icon: 'tabler:brand-mixpanel',
                title: '颜色混合工具',
                desc: '可视化混合两种颜色，生成新的颜色效果'
            },
        ]
    },

    // 渲染卡片的方法
    renderCard: function(tool) {
        return `
            <a href="${tool.href}" class="tool-card">
                <div class="tool-content-wrapper">
                    <div class="tool-icon">
                        <span class="iconify" data-icon="${tool.icon}" data-inline="false"></span>
                    </div>
                    <div class="tool-content">
                        <h4>${tool.title}</h4>
                        <p>${tool.desc}</p>
                    </div>
                </div>
                <span class="enter-btn">开始使用</span>
            </a>
        `;
    },
};
