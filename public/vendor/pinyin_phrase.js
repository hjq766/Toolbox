/**
 * 多音字词组拼音表
 * 用于正向最大匹配分词，提升多音字识别准确率
 * 格式：{ "词组": "拼音（空格分隔）" }
 */
var pinyin_phrase = {
// ── 行 (háng / xíng) ──
"银行": "yín háng", "行业": "háng yè", "行列": "háng liè", "行情": "háng qíng",
"行会": "háng huì", "行话": "háng huà", "行家": "háng jiā", "行号": "háng hào",
"行距": "háng jù", "行规": "háng guī", "行当": "háng dang", "行道": "háng dào",
"同行": "tóng háng", "内行": "nèi háng", "外行": "wài háng", "在行": "zài háng",
"一行": "yī háng", "央行": "yāng háng", "排行": "pái háng", "商行": "shāng háng",
"车行": "chē háng", "琴行": "qín háng", "洋行": "yáng háng",
"行走": "xíng zǒu", "行为": "xíng wéi", "行人": "xíng rén", "行动": "xíng dòng",
"行政": "xíng zhèng", "行程": "xíng chéng", "行驶": "xíng shǐ", "行李": "xíng li",
"行军": "xíng jūn", "行进": "xíng jìn", "行事": "xíng shì", "行刑": "xíng xíng",
"行凶": "xíng xiōng", "行医": "xíng yī", "行贿": "xíng huì", "行善": "xíng shàn",
"行踪": "xíng zōng", "行文": "xíng wén", "行使": "xíng shǐ", "行径": "xíng jìng",
"执行": "zhí xíng", "运行": "yùn xíng", "发行": "fā xíng", "通行": "tōng xíng",
"流行": "liú xíng", "旅行": "lǚ xíng", "飞行": "fēi xíng", "施行": "shī xíng",
"平行": "píng xíng", "践行": "jiàn xíng", "先行": "xiān xíng", "并行": "bìng xíng",
"举行": "jǔ xíng", "进行": "jìn xíng", "不行": "bù xíng", "可行": "kě xíng",

// ── 乐 (lè / yuè) ──
"音乐": "yīn yuè", "乐器": "yuè qì", "乐曲": "yuè qǔ", "乐队": "yuè duì",
"乐团": "yuè tuán", "乐章": "yuè zhāng", "乐谱": "yuè pǔ", "乐理": "yuè lǐ",
"乐坛": "yuè tán", "乐手": "yuè shǒu", "乐府": "yuè fǔ", "声乐": "shēng yuè",
"器乐": "qì yuè", "民乐": "mín yuè", "军乐": "jūn yuè", "奏乐": "zòu yuè",
"管乐": "guǎn yuè", "弦乐": "xián yuè", "配乐": "pèi yuè",
"快乐": "kuài lè", "乐趣": "lè qù", "乐观": "lè guān", "乐意": "lè yì",
"欢乐": "huān lè", "极乐": "jí lè", "安乐": "ān lè", "娱乐": "yú lè",
"逸乐": "yì lè", "享乐": "xiǎng lè", "可乐": "kě lè", "取乐": "qǔ lè",

// ── 长 (cháng / zhǎng) ──
"长度": "cháng dù", "长期": "cháng qī", "长远": "cháng yuǎn", "长久": "cháng jiǔ",
"长处": "cháng chù", "长江": "cháng jiāng", "长城": "cháng chéng", "长途": "cháng tú",
"长寿": "cháng shòu", "长廊": "cháng láng", "长跑": "cháng pǎo", "长篇": "cháng piān",
"长短": "cháng duǎn", "漫长": "màn cháng", "悠长": "yōu cháng", "绵长": "mián cháng",
"细长": "xì cháng", "修长": "xiū cháng", "狭长": "xiá cháng",
"长大": "zhǎng dà", "长辈": "zhǎng bèi", "长官": "zhǎng guān", "长老": "zhǎng lǎo",
"长子": "zhǎng zǐ", "长兄": "zhǎng xiōng", "长者": "zhǎng zhě",
"成长": "chéng zhǎng", "生长": "shēng zhǎng", "增长": "zēng zhǎng", "助长": "zhù zhǎng",
"家长": "jiā zhǎng", "校长": "xiào zhǎng", "市长": "shì zhǎng", "部长": "bù zhǎng",
"局长": "jú zhǎng", "院长": "yuàn zhǎng", "会长": "huì zhǎng", "社长": "shè zhǎng",
"队长": "duì zhǎng", "班长": "bān zhǎng", "组长": "zǔ zhǎng", "科长": "kē zhǎng",
"处长": "chù zhǎng", "厅长": "tīng zhǎng", "县长": "xiàn zhǎng", "省长": "shěng zhǎng",
"村长": "cūn zhǎng", "船长": "chuán zhǎng", "站长": "zhàn zhǎng", "团长": "tuán zhǎng",
"师长": "shī zhǎng", "首长": "shǒu zhǎng", "酋长": "qiú zhǎng",

// ── 重 (zhòng / chóng) ──
"重量": "zhòng liàng", "重要": "zhòng yào", "重大": "zhòng dà", "重点": "zhòng diǎn",
"重视": "zhòng shì", "重心": "zhòng xīn", "重任": "zhòng rèn", "重力": "zhòng lì",
"沉重": "chén zhòng", "严重": "yán zhòng", "慎重": "shèn zhòng", "尊重": "zūn zhòng",
"注重": "zhù zhòng", "稳重": "wěn zhòng", "贵重": "guì zhòng", "隆重": "lóng zhòng",
"重复": "chóng fù", "重新": "chóng xīn", "重建": "chóng jiàn", "重来": "chóng lái",
"重叠": "chóng dié", "重逢": "chóng féng", "重组": "chóng zǔ", "重启": "chóng qǐ",
"重现": "chóng xiàn", "重生": "chóng shēng", "重演": "chóng yǎn", "重申": "chóng shēn",
"重温": "chóng wēn", "重回": "chóng huí", "重返": "chóng fǎn", "重塑": "chóng sù",
"双重": "shuāng chóng",

// ── 数 (shù / shǔ / shuò) ──
"数字": "shù zì", "数学": "shù xué", "数据": "shù jù", "数量": "shù liàng",
"数目": "shù mù", "数额": "shù é", "数值": "shù zhí", "数码": "shù mǎ",
"数组": "shù zǔ", "数列": "shù liè",
"少数": "shǎo shù", "多数": "duō shù", "次数": "cì shù", "人数": "rén shù",
"频数": "pín shù", "基数": "jī shù", "偶数": "ǒu shù", "奇数": "jī shù",
"整数": "zhěng shù", "分数": "fēn shù", "指数": "zhǐ shù", "系数": "xì shù",
"数落": "shǔ luò", "数数": "shǔ shù", "数不清": "shǔ bù qīng",
"数一数二": "shǔ yī shǔ èr",

// ── 调 (diào / tiáo) ──
"调查": "diào chá", "调动": "diào dòng", "调度": "diào dù", "调配": "diào pèi",
"调任": "diào rèn", "调离": "diào lí", "调换": "diào huàn", "调令": "diào lìng",
"调遣": "diào qiǎn", "调拨": "diào bō", "调职": "diào zhí", "调防": "diào fáng",
"声调": "shēng diào", "色调": "sè diào", "格调": "gé diào", "论调": "lùn diào",
"基调": "jī diào", "腔调": "qiāng diào", "笔调": "bǐ diào", "曲调": "qǔ diào",
"单调": "dān diào", "跑调": "pǎo diào", "走调": "zǒu diào", "变调": "biàn diào",
"调节": "tiáo jié", "调整": "tiáo zhěng", "调解": "tiáo jiě", "调和": "tiáo hé",
"调控": "tiáo kòng", "调理": "tiáo lǐ", "调养": "tiáo yǎng", "调试": "tiáo shì",
"调皮": "tiáo pí", "调情": "tiáo qíng", "调侃": "tiáo kǎn", "调味": "tiáo wèi",
"协调": "xié tiáo", "空调": "kōng tiáo",

// ── 为 (wéi / wèi) ──
"行为": "xíng wéi", "作为": "zuò wéi", "认为": "rèn wéi", "以为": "yǐ wéi",
"成为": "chéng wéi", "称为": "chēng wéi", "视为": "shì wéi", "人为": "rén wéi",
"因为": "yīn wèi", "为了": "wèi le", "为何": "wèi hé", "为什么": "wèi shén me",

// ── 相 (xiāng / xiàng) ──
"相互": "xiāng hù", "相关": "xiāng guān", "相同": "xiāng tóng", "相信": "xiāng xìn",
"相对": "xiāng duì", "相比": "xiāng bǐ", "相当": "xiāng dāng", "相似": "xiāng sì",
"相反": "xiāng fǎn", "相处": "xiāng chǔ", "相连": "xiāng lián", "相近": "xiāng jìn",
"相爱": "xiāng ài", "相逢": "xiāng féng", "相依": "xiāng yī", "相配": "xiāng pèi",
"相遇": "xiāng yù", "相识": "xiāng shí", "相邻": "xiāng lín", "互相": "hù xiāng",
"相片": "xiàng piàn", "相机": "xiàng jī", "相貌": "xiàng mào", "相册": "xiàng cè",
"真相": "zhēn xiàng", "长相": "zhǎng xiàng", "面相": "miàn xiàng",
"宰相": "zǎi xiàng", "丞相": "chéng xiàng", "首相": "shǒu xiàng",

// ── 兴 (xīng / xìng) ──
"兴奋": "xīng fèn", "兴起": "xīng qǐ", "兴盛": "xīng shèng", "兴旺": "xīng wàng",
"兴建": "xīng jiàn", "兴办": "xīng bàn", "兴隆": "xīng lóng", "复兴": "fù xīng",
"振兴": "zhèn xīng", "新兴": "xīn xīng", "中兴": "zhōng xīng",
"兴趣": "xìng qù", "高兴": "gāo xìng", "尽兴": "jìn xìng", "兴致": "xìng zhì",
"扫兴": "sǎo xìng", "即兴": "jí xìng", "助兴": "zhù xìng", "雅兴": "yǎ xìng",

// ── 应 (yīng / yìng) ──
"应该": "yīng gāi", "应当": "yīng dāng", "应有": "yīng yǒu",
"应用": "yìng yòng", "应对": "yìng duì", "应付": "yìng fu", "应变": "yìng biàn",
"应聘": "yìng pìn", "应答": "yìng dá", "应急": "yìng jí", "应邀": "yìng yāo",
"应酬": "yìng chou", "应验": "yìng yàn", "应征": "yìng zhēng",
"适应": "shì yìng", "反应": "fǎn yìng", "响应": "xiǎng yìng", "效应": "xiào yìng",
"感应": "gǎn yìng", "对应": "duì yìng", "供应": "gōng yìng",

// ── 间 (jiān / jiàn) ──
"时间": "shí jiān", "空间": "kōng jiān", "房间": "fáng jiān", "中间": "zhōng jiān",
"之间": "zhī jiān", "期间": "qī jiān", "人间": "rén jiān", "民间": "mín jiān",
"夜间": "yè jiān", "午间": "wǔ jiān", "瞬间": "shùn jiān", "车间": "chē jiān",
"间谍": "jiàn dié", "间隔": "jiàn gé", "间断": "jiàn duàn", "间接": "jiàn jiē",
"间歇": "jiàn xiē", "离间": "lí jiàn", "挑拨离间": "tiǎo bō lí jiàn",

// ── 觉 (jué / jiào) ──
"觉得": "jué de", "觉悟": "jué wù", "觉醒": "jué xǐng", "觉察": "jué chá",
"感觉": "gǎn jué", "视觉": "shì jué", "听觉": "tīng jué", "味觉": "wèi jué",
"触觉": "chù jué", "嗅觉": "xiù jué", "直觉": "zhí jué", "错觉": "cuò jué",
"幻觉": "huàn jué", "知觉": "zhī jué", "自觉": "zì jué", "不知不觉": "bù zhī bù jué",
"睡觉": "shuì jiào", "午觉": "wǔ jiào", "懒觉": "lǎn jiào",

// ── 干 (gān / gàn) ──
"干净": "gān jìng", "干燥": "gān zào", "干枯": "gān kū", "干旱": "gān hàn",
"干涸": "gān hé", "干杯": "gān bēi", "干脆": "gān cuì", "干扰": "gān rǎo",
"干预": "gān yù", "干涉": "gān shè", "干细胞": "gān xì bāo",
"若干": "ruò gān", "饼干": "bǐng gān",
"干部": "gàn bù", "干活": "gàn huó", "干劲": "gàn jìn", "干练": "gàn liàn",
"干事": "gàn shì", "干线": "gàn xiàn", "干嘛": "gàn ma", "树干": "shù gàn",
"主干": "zhǔ gàn", "才干": "cái gàn", "骨干": "gǔ gàn", "躯干": "qū gàn",

// ── 发 (fā / fà) ──
"发展": "fā zhǎn", "发现": "fā xiàn", "发生": "fā shēng", "发布": "fā bù",
"发明": "fā míng", "发动": "fā dòng", "发表": "fā biǎo", "发挥": "fā huī",
"发射": "fā shè", "发送": "fā sòng", "发达": "fā dá", "发财": "fā cái",
"发誓": "fā shì", "发言": "fā yán", "发泄": "fā xiè", "发扬": "fā yáng",
"发育": "fā yù", "发作": "fā zuò", "爆发": "bào fā", "出发": "chū fā",
"开发": "kāi fā", "启发": "qǐ fā", "蒸发": "zhēng fā", "触发": "chù fā",
"头发": "tóu fa", "发型": "fà xíng", "发丝": "fà sī", "发际": "fà jì",
"白发": "bái fà", "理发": "lǐ fà", "假发": "jiǎ fà", "脱发": "tuō fà",
"毛发": "máo fà", "鬓发": "bìn fà",

// ── 还 (hái / huán) ──
"还是": "hái shì", "还有": "hái yǒu", "还要": "hái yào", "还好": "hái hǎo",
"还能": "hái néng", "还会": "hái huì", "还在": "hái zài", "还没": "hái méi",
"还原": "huán yuán", "还击": "huán jī", "归还": "guī huán", "偿还": "cháng huán",
"返还": "fǎn huán", "还债": "huán zhài", "还手": "huán shǒu", "还清": "huán qīng",

// ── 都 (dōu / dū) ──
"都是": "dōu shì", "都有": "dōu yǒu", "都会": "dōu huì", "都要": "dōu yào",
"都不": "dōu bù", "都能": "dōu néng", "都在": "dōu zài",
"首都": "shǒu dū", "都市": "dū shì", "都城": "dū chéng", "成都": "chéng dū",

// ── 教 (jiāo / jiào) ──
"教书": "jiāo shū", "教学": "jiào xué", "教育": "jiào yù", "教师": "jiào shī",
"教授": "jiào shòu", "教练": "jiào liàn", "教室": "jiào shì", "教材": "jiào cái",
"教程": "jiào chéng", "教堂": "jiào táng", "教会": "jiào huì", "教训": "jiào xun",
"教导": "jiào dǎo", "教养": "jiào yǎng", "宗教": "zōng jiào", "佛教": "fó jiào",
"基督教": "jī dū jiào", "伊斯兰教": "yī sī lán jiào",
"请教": "qǐng jiào", "指教": "zhǐ jiào", "赐教": "cì jiào",

// ── 假 (jiǎ / jià) ──
"假如": "jiǎ rú", "假设": "jiǎ shè", "假装": "jiǎ zhuāng", "假冒": "jiǎ mào",
"假象": "jiǎ xiàng", "假定": "jiǎ dìng", "真假": "zhēn jiǎ", "虚假": "xū jiǎ",
"假期": "jià qī", "假日": "jià rì", "放假": "fàng jià", "请假": "qǐng jià",
"休假": "xiū jià", "暑假": "shǔ jià", "寒假": "hán jià", "年假": "nián jià",
"病假": "bìng jià", "事假": "shì jià", "产假": "chǎn jià",

// ── 空 (kōng / kòng) ──
"空气": "kōng qì", "空间": "kōng jiān", "空中": "kōng zhōng", "空军": "kōng jūn",
"空前": "kōng qián", "空想": "kōng xiǎng", "空洞": "kōng dòng", "空虚": "kōng xū",
"空旷": "kōng kuàng", "太空": "tài kōng", "天空": "tiān kōng", "航空": "háng kōng",
"空调": "kōng tiáo", "真空": "zhēn kōng", "高空": "gāo kōng",
"空白": "kòng bái", "空缺": "kòng quē", "空隙": "kòng xì", "空闲": "kòng xián",
"空地": "kòng dì", "有空": "yǒu kòng", "没空": "méi kòng", "抽空": "chōu kòng",

// ── 得 (dé / de / děi) ──
"得到": "dé dào", "得知": "dé zhī", "得意": "dé yì", "得力": "dé lì",
"得体": "dé tǐ", "获得": "huò dé", "取得": "qǔ dé", "值得": "zhí dé",
"舍得": "shě de", "记得": "jì de", "觉得": "jué de", "显得": "xiǎn de",
"懂得": "dǒng de", "免得": "miǎn de",

// ── 分 (fēn / fèn) ──
"分别": "fēn bié", "分析": "fēn xī", "分配": "fēn pèi", "分离": "fēn lí",
"分开": "fēn kāi", "分裂": "fēn liè", "分类": "fēn lèi", "分享": "fēn xiǎng",
"分辨": "fēn biàn", "分布": "fēn bù", "分担": "fēn dān", "分割": "fēn gē",
"分明": "fēn míng", "分散": "fēn sàn", "分手": "fēn shǒu", "分钟": "fēn zhōng",
"百分": "bǎi fēn", "十分": "shí fēn", "充分": "chōng fēn", "部分": "bù fen",
"身分": "shēn fèn", "成分": "chéng fèn", "水分": "shuǐ fèn", "本分": "běn fèn",
"缘分": "yuán fèn", "分量": "fèn liàng", "分内": "fèn nèi", "分外": "fèn wài",
"过分": "guò fèn", "处分": "chǔ fèn",

// ── 好 (hǎo / hào) ──
"好的": "hǎo de", "好人": "hǎo rén", "好处": "hǎo chù", "好看": "hǎo kàn",
"好吃": "hǎo chī", "好听": "hǎo tīng", "好像": "hǎo xiàng", "好运": "hǎo yùn",
"美好": "měi hǎo", "友好": "yǒu hǎo", "良好": "liáng hǎo",
"好奇": "hào qí", "好客": "hào kè", "好学": "hào xué", "爱好": "ài hào",
"嗜好": "shì hào",

// ── 朝 (cháo / zhāo) ──
"朝向": "cháo xiàng", "朝着": "cháo zhe", "朝阳": "cháo yáng",
"朝代": "cháo dài", "朝廷": "cháo tíng", "朝政": "cháo zhèng", "朝野": "cháo yě",
"朝鲜": "cháo xiǎn", "王朝": "wáng cháo", "唐朝": "táng cháo",
"朝气": "zhāo qì", "朝夕": "zhāo xī", "朝霞": "zhāo xiá",
"今朝": "jīn zhāo",

// ── 传 (chuán / zhuàn) ──
"传统": "chuán tǒng", "传播": "chuán bō", "传说": "chuán shuō", "传递": "chuán dì",
"传达": "chuán dá", "传承": "chuán chéng", "传染": "chuán rǎn", "传授": "chuán shòu",
"传输": "chuán shū", "传闻": "chuán wén", "传奇": "chuán qí", "流传": "liú chuán",
"宣传": "xuān chuán", "遗传": "yí chuán", "相传": "xiāng chuán",
"传记": "zhuàn jì", "自传": "zì zhuàn", "列传": "liè zhuàn", "外传": "wài zhuàn",

// ── 弹 (tán / dàn) ──
"弹琴": "tán qín", "弹奏": "tán zòu", "弹唱": "tán chàng", "弹性": "tán xìng",
"弹簧": "tán huáng", "弹力": "tán lì", "弹跳": "tán tiào", "反弹": "fǎn tán",
"子弹": "zǐ dàn", "炸弹": "zhà dàn", "导弹": "dǎo dàn", "核弹": "hé dàn",
"原子弹": "yuán zǐ dàn", "弹药": "dàn yào", "弹头": "dàn tóu", "弹壳": "dàn ké",
"弹弓": "dàn gōng", "炮弹": "pào dàn", "枪弹": "qiāng dàn",

// ── 种 (zhǒng / zhòng) ──
"种类": "zhǒng lèi", "种族": "zhǒng zú", "种子": "zhǒng zi", "品种": "pǐn zhǒng",
"物种": "wù zhǒng", "种种": "zhǒng zhǒng", "各种": "gè zhǒng", "一种": "yī zhǒng",
"人种": "rén zhǒng", "种姓": "zhǒng xìng",
"种植": "zhòng zhí", "种地": "zhòng dì", "种田": "zhòng tián", "种花": "zhòng huā",
"播种": "bō zhǒng", "耕种": "gēng zhòng",

// ── 率 (lǜ / shuài) ──
"效率": "xiào lǜ", "频率": "pín lǜ", "概率": "gài lǜ", "比率": "bǐ lǜ",
"利率": "lì lǜ", "税率": "shuì lǜ", "速率": "sù lǜ", "汇率": "huì lǜ",
"心率": "xīn lǜ",
"率领": "shuài lǐng", "率先": "shuài xiān", "率直": "shuài zhí",
"统率": "tǒng shuài", "轻率": "qīng shuài", "草率": "cǎo shuài",
"坦率": "tǎn shuài", "直率": "zhí shuài",

// ── 散 (sàn / sǎn) ──
"散步": "sàn bù", "散发": "sàn fā", "散布": "sàn bù", "散落": "sàn luò",
"散开": "sàn kāi", "散去": "sàn qù", "解散": "jiě sàn", "扩散": "kuò sàn",
"疏散": "shū sàn", "驱散": "qū sàn", "弥散": "mí sàn",
"散文": "sǎn wén", "散漫": "sǎn màn", "松散": "sōng sǎn", "零散": "líng sǎn",
"散装": "sǎn zhuāng",

// ── 盛 (shèng / chéng) ──
"盛大": "shèng dà", "盛开": "shèng kāi", "盛行": "shèng xíng", "盛况": "shèng kuàng",
"盛宴": "shèng yàn", "盛世": "shèng shì", "盛产": "shèng chǎn", "茂盛": "mào shèng",
"繁盛": "fán shèng", "旺盛": "wàng shèng", "鼎盛": "dǐng shèng",
"盛饭": "chéng fàn", "盛满": "chéng mǎn", "盛器": "chéng qì",

// ── 强 (qiáng / qiǎng / jiàng) ──
"强大": "qiáng dà", "强烈": "qiáng liè", "强调": "qiáng diào", "强化": "qiáng huà",
"强力": "qiáng lì", "强壮": "qiáng zhuàng", "强盛": "qiáng shèng",
"坚强": "jiān qiáng", "顽强": "wán qiáng", "富强": "fù qiáng", "增强": "zēng qiáng",
"加强": "jiā qiáng",
"强迫": "qiǎng pò", "强制": "qiǎng zhì", "勉强": "miǎn qiǎng",
"强求": "qiǎng qiú", "强行": "qiǎng xíng", "强占": "qiǎng zhàn",
"倔强": "jué jiàng",

// ── 曲 (qū / qǔ) ──
"曲线": "qū xiàn", "曲折": "qū zhé", "弯曲": "wān qū", "扭曲": "niǔ qū",
"歌曲": "gē qǔ", "曲目": "qǔ mù", "曲调": "qǔ diào", "曲子": "qǔ zi",
"乐曲": "yuè qǔ", "插曲": "chā qǔ", "序曲": "xù qǔ", "舞曲": "wǔ qǔ",
"作曲": "zuò qǔ", "谱曲": "pǔ qǔ",

// ── 落 (luò / là / lào) ──
"落后": "luò hòu", "落地": "luò dì", "落下": "luò xià", "落实": "luò shí",
"落成": "luò chéng", "落入": "luò rù", "落户": "luò hù", "落选": "luò xuǎn",
"落日": "luò rì", "落叶": "luò yè", "落差": "luò chā", "落幕": "luò mù",
"降落": "jiàng luò", "坠落": "zhuì luò", "脱落": "tuō luò", "洒落": "sǎ luò",
"陨落": "yǔn luò", "没落": "mò luò", "村落": "cūn luò", "部落": "bù luò",
"丢三落四": "diū sān là sì", "落下": "là xià",

// ── 难 (nán / nàn) ──
"难度": "nán dù", "难题": "nán tí", "难以": "nán yǐ", "难免": "nán miǎn",
"难过": "nán guò", "难受": "nán shòu", "难看": "nán kàn", "难忘": "nán wàng",
"难道": "nán dào", "难得": "nán dé", "难堪": "nán kān", "难关": "nán guān",
"困难": "kùn nán", "艰难": "jiān nán",
"灾难": "zāi nàn", "难民": "nàn mín", "遇难": "yù nàn", "避难": "bì nàn",
"苦难": "kǔ nàn", "磨难": "mó nàn", "劫难": "jié nàn", "患难": "huàn nàn",

// ── 没 (méi / mò) ──
"没有": "méi yǒu", "没想到": "méi xiǎng dào", "没关系": "méi guān xi",
"淹没": "yān mò", "沉没": "chén mò", "没落": "mò luò", "没收": "mò shōu",
"埋没": "mái mò", "湮没": "yān mò",

// ── 系 (xì / jì) ──
"系统": "xì tǒng", "系列": "xì liè", "系数": "xì shù", "体系": "tǐ xì",
"关系": "guān xì", "联系": "lián xì", "世系": "shì xì", "星系": "xīng xì",
"系鞋带": "jì xié dài",

// ── 切 (qiē / qiè) ──
"切割": "qiē gē", "切开": "qiē kāi", "切断": "qiē duàn", "切片": "qiē piàn",
"切除": "qiē chú", "切菜": "qiē cài",
"切实": "qiè shí", "一切": "yī qiè", "亲切": "qīn qiè", "密切": "mì qiè",
"迫切": "pò qiè", "确切": "què qiè", "适切": "shì qiè", "恳切": "kěn qiè",
"热切": "rè qiè", "急切": "jí qiè", "深切": "shēn qiè", "殷切": "yīn qiè",

// ── 着 (zhe / zháo / zhuó) ──
"着急": "zháo jí", "着火": "zháo huǒ", "着凉": "zháo liáng", "着迷": "zháo mí",
"睡着": "shuì zháo", "着陆": "zhuó lù", "着手": "zhuó shǒu", "着重": "zhuó zhòng",
"着力": "zhuó lì", "着眼": "zhuó yǎn", "着装": "zhuó zhuāng", "着想": "zhuó xiǎng",
"着实": "zhuó shí", "执着": "zhí zhuó", "沉着": "chén zhuó", "附着": "fù zhuó",

// ── 转 (zhuǎn / zhuàn) ──
"转变": "zhuǎn biàn", "转化": "zhuǎn huà", "转换": "zhuǎn huàn", "转移": "zhuǎn yí",
"转折": "zhuǎn zhé", "转达": "zhuǎn dá", "转让": "zhuǎn ràng", "转型": "zhuǎn xíng",
"转身": "zhuǎn shēn", "转弯": "zhuǎn wān", "转向": "zhuǎn xiàng",
"旋转": "xuán zhuǎn", "扭转": "niǔ zhuǎn", "逆转": "nì zhuǎn",
"转动": "zhuàn dòng", "转圈": "zhuàn quān", "运转": "yùn zhuàn", "周转": "zhōu zhuǎn",
"转速": "zhuàn sù", "自转": "zì zhuàn", "公转": "gōng zhuàn",

// ── 的 (de / dí / dì) ──
"的确": "dí què", "目的": "mù dì", "有的放矢": "yǒu dì fàng shǐ",

// ── 了 (le / liǎo) ──
"了解": "liǎo jiě", "了不起": "liǎo bu qǐ", "了结": "liǎo jié", "了然": "liǎo rán",
"了如指掌": "liǎo rú zhǐ zhǎng", "一目了然": "yī mù liǎo rán",
"了无": "liǎo wú", "明了": "míng liǎo", "受不了": "shòu bù liǎo",

// ── 地 (dì / de) ──
"地方": "dì fāng", "地区": "dì qū", "地球": "dì qiú", "地图": "dì tú",
"地址": "dì zhǐ", "地位": "dì wèi", "地面": "dì miàn", "地下": "dì xià",
"地铁": "dì tiě", "地震": "dì zhèn", "地带": "dì dài", "地形": "dì xíng",
"地理": "dì lǐ", "地产": "dì chǎn", "地基": "dì jī", "地盘": "dì pán",
"土地": "tǔ dì", "大地": "dà dì", "天地": "tiān dì",

// ── 给 (gěi / jǐ) ──
"给予": "jǐ yǔ", "供给": "gōng jǐ", "补给": "bǔ jǐ", "自给": "zì jǐ",
"配给": "pèi jǐ",

// ── 宁 (níng / nìng) ──
"安宁": "ān níng", "宁静": "níng jìng", "宁可": "nìng kě", "宁愿": "nìng yuàn",
"宁肯": "nìng kěn", "宁死": "nìng sǐ",

// ── 塞 (sāi / sài / sè) ──
"塞子": "sāi zi", "塞住": "sāi zhù", "堵塞": "dǔ sè", "阻塞": "zǔ sè",
"闭塞": "bì sè", "梗塞": "gěng sè", "塞外": "sài wài", "边塞": "biān sài",
"要塞": "yào sài",

// ── 薄 (báo / bó / bò) ──
"薄弱": "bó ruò", "单薄": "dān bó", "淡薄": "dàn bó", "刻薄": "kè bó",
"薄利": "bó lì", "厚薄": "hòu bó", "鄙薄": "bǐ bó",
"薄饼": "báo bǐng", "薄片": "báo piàn",
"薄荷": "bò he",

// ── 藏 (cáng / zàng) ──
"隐藏": "yǐn cáng", "躲藏": "duǒ cáng", "藏身": "cáng shēn", "藏匿": "cáng nì",
"珍藏": "zhēn cáng", "收藏": "shōu cáng", "埋藏": "mái cáng", "暗藏": "àn cáng",
"储藏": "chǔ cáng", "冷藏": "lěng cáng",
"西藏": "xī zàng", "藏族": "zàng zú", "藏语": "zàng yǔ", "宝藏": "bǎo zàng",

// ── 磨 (mó / mò) ──
"磨练": "mó liàn", "磨合": "mó hé", "磨损": "mó sǔn", "磨擦": "mó cā",
"磨炼": "mó liàn", "折磨": "zhé mo", "琢磨": "zuó mo", "消磨": "xiāo mó",
"磨坊": "mò fáng", "磨盘": "mò pán", "石磨": "shí mò",

// ── 担 (dān / dàn) ──
"担心": "dān xīn", "担任": "dān rèn", "担当": "dān dāng", "担忧": "dān yōu",
"担保": "dān bǎo", "承担": "chéng dān", "负担": "fù dān", "分担": "fēn dān",
"担子": "dàn zi", "重担": "zhòng dàn", "扁担": "biǎn dan",

// ── 冲 (chōng / chòng) ──
"冲击": "chōng jī", "冲锋": "chōng fēng", "冲突": "chōng tū", "冲刺": "chōng cì",
"冲动": "chōng dòng", "冲浪": "chōng làng", "冲洗": "chōng xǐ",
"脉冲": "mài chōng", "缓冲": "huǎn chōng",
"冲劲": "chòng jìn",

// ── 称 (chēng / chèn) ──
"称为": "chēng wéi", "称呼": "chēng hū", "称号": "chēng hào", "称赞": "chēng zàn",
"名称": "míng chēng", "简称": "jiǎn chēng", "总称": "zǒng chēng", "俗称": "sú chēng",
"称职": "chèn zhí", "称心": "chèn xīn", "匀称": "yún chèn", "对称": "duì chèn",
"相称": "xiāng chèn",

// ── 载 (zài / zǎi) ──
"记载": "jì zǎi", "刊载": "kān zǎi", "转载": "zhuǎn zǎi", "连载": "lián zǎi",
"登载": "dēng zǎi", "三年五载": "sān nián wǔ zǎi",
"载体": "zài tǐ", "承载": "chéng zài", "装载": "zhuāng zài", "运载": "yùn zài",
"载客": "zài kè", "载重": "zài zhòng", "满载": "mǎn zài", "下载": "xià zài",
"超载": "chāo zài",

// ── 参 (cān / shēn) ──
"参加": "cān jiā", "参与": "cān yù", "参考": "cān kǎo", "参观": "cān guān",
"参赛": "cān sài", "参照": "cān zhào", "参谋": "cān móu", "参军": "cān jūn",
"人参": "rén shēn", "海参": "hǎi shēn", "党参": "dǎng shēn",

// ── 供 (gōng / gòng) ──
"供应": "gōng yìng", "供给": "gōng jǐ", "提供": "tí gōng", "供水": "gōng shuǐ",
"供电": "gōng diàn", "供暖": "gōng nuǎn", "供求": "gōng qiú",
"供奉": "gòng fèng", "供品": "gòng pǐn", "供认": "gòng rèn", "口供": "kǒu gòng",
"供词": "gòng cí",

// ── 蒙 (méng / mēng / měng) ──
"蒙受": "méng shòu", "启蒙": "qǐ méng", "蒙蔽": "méng bì",
"蒙骗": "mēng piàn", "蒙混": "mēng hùn",
"蒙古": "měng gǔ", "内蒙古": "nèi měng gǔ",

// ── 模 (mó / mú) ──
"模式": "mó shì", "模仿": "mó fǎng", "模型": "mó xíng", "模拟": "mó nǐ",
"模范": "mó fàn", "模糊": "mó hu", "规模": "guī mó", "楷模": "kǎi mó",
"模样": "mú yàng", "模具": "mú jù", "模板": "mú bǎn", "模子": "mú zi",

// ── 铺 (pū / pù) ──
"铺设": "pū shè", "铺垫": "pū diàn", "铺开": "pū kāi", "铺路": "pū lù",
"铺张": "pū zhāng",
"店铺": "diàn pù", "铺面": "pù miàn", "铺子": "pù zi", "当铺": "dàng pù",
"床铺": "chuáng pù",

// ── 血 (xuè / xiě) ──
"血液": "xuè yè", "血管": "xuè guǎn", "血压": "xuè yā", "血型": "xuè xíng",
"血统": "xuè tǒng", "血缘": "xuè yuán", "血脉": "xuè mài",
"出血": "chū xiě", "流血": "liú xiě", "鸡血": "jī xiě", "抽血": "chōu xiě",
"验血": "yàn xiě",

// ── 背 (bèi / bēi) ──
"背景": "bèi jǐng", "背后": "bèi hòu", "背面": "bèi miàn", "背叛": "bèi pàn",
"背离": "bèi lí", "违背": "wéi bèi", "背光": "bèi guāng",
"背包": "bēi bāo", "背负": "bēi fù", "背着": "bēi zhe", "背书包": "bēi shū bāo",

// ── 累 (lèi / léi / lěi) ──
"劳累": "láo lèi", "疲累": "pí lèi",
"累计": "lěi jì", "累积": "lěi jī", "积累": "jī lěi", "累加": "lěi jiā",
"日积月累": "rì jī yuè lěi", "连篇累牍": "lián piān lěi dú",
"累赘": "léi zhuì",

// ── 恶 (è / wù / ě) ──
"恶人": "è rén", "恶意": "è yì", "恶劣": "è liè", "恶性": "è xìng",
"凶恶": "xiōng è", "邪恶": "xié è", "险恶": "xiǎn è", "罪恶": "zuì è",
"厌恶": "yàn wù", "可恶": "kě wù", "好恶": "hào wù", "深恶痛绝": "shēn wù tòng jué",
"恶心": "ě xīn",

// ── 宿 (sù / xiǔ / xiù) ──
"宿舍": "sù shè", "住宿": "zhù sù", "寄宿": "jì sù", "留宿": "liú sù",
"宿敌": "sù dí", "宿愿": "sù yuàn", "宿命": "sù mìng",
"一宿": "yī xiǔ", "两宿": "liǎng xiǔ",
"星宿": "xīng xiù",

// ── 处 (chǔ / chù) ──
"处理": "chǔ lǐ", "处于": "chǔ yú", "处罚": "chǔ fá", "处分": "chǔ fèn",
"处置": "chǔ zhì", "处境": "chǔ jìng", "相处": "xiāng chǔ",
"处处": "chù chù", "好处": "hǎo chù", "到处": "dào chù", "深处": "shēn chù",
"用处": "yòng chù", "住处": "zhù chù", "去处": "qù chù", "妙处": "miào chù",

// ── 舍 (shě / shè) ──
"舍得": "shě de", "舍弃": "shě qì", "舍不得": "shě bu de", "取舍": "qǔ shě",
"割舍": "gē shě", "施舍": "shī shě",
"宿舍": "sù shè", "校舍": "xiào shè", "寒舍": "hán shè",

// ── 奇 (qí / jī) ──
"奇怪": "qí guài", "奇迹": "qí jì", "奇妙": "qí miào", "奇特": "qí tè",
"奇异": "qí yì", "好奇": "hào qí", "惊奇": "jīng qí", "神奇": "shén qí",
"传奇": "chuán qí", "稀奇": "xī qí", "猎奇": "liè qí",
"奇数": "jī shù", "奇偶": "jī ǒu",

// ── 更 (gēng / gèng) ──
"更改": "gēng gǎi", "更换": "gēng huàn", "更新": "gēng xīn", "更替": "gēng tì",
"更正": "gēng zhèng", "更迭": "gēng dié", "变更": "biàn gēng",
"更加": "gèng jiā", "更好": "gèng hǎo", "更多": "gèng duō", "更大": "gèng dà",

// ── 把 (bǎ / bà) ──
"把握": "bǎ wò", "把持": "bǎ chí", "把关": "bǎ guān", "把守": "bǎ shǒu",
"把控": "bǎ kòng",
"把手": "bà shou", "把柄": "bà bǐng", "刀把": "dāo bà",

// ── 卷 (juǎn / juàn) ──
"卷起": "juǎn qǐ", "卷入": "juǎn rù", "席卷": "xí juǎn", "卷心菜": "juǎn xīn cài",
"花卷": "huā juǎn", "卷曲": "juǎn qū",
"试卷": "shì juàn", "答卷": "dá juàn", "卷宗": "juàn zōng", "画卷": "huà juàn",
"长卷": "cháng juàn", "手卷": "shǒu juàn",

// ── 禁 (jìn / jīn) ──
"禁止": "jìn zhǐ", "禁令": "jìn lìng", "禁区": "jìn qū", "禁忌": "jìn jì",
"禁烟": "jìn yān", "禁毒": "jìn dú", "严禁": "yán jìn", "查禁": "chá jìn",
"不禁": "bù jīn", "禁不住": "jīn bu zhù", "情不自禁": "qíng bù zì jīn",

// ── 当 (dāng / dàng) ──
"当时": "dāng shí", "当然": "dāng rán", "当前": "dāng qián", "当中": "dāng zhōng",
"当地": "dāng dì", "当年": "dāng nián", "当天": "dāng tiān", "当初": "dāng chū",
"当场": "dāng chǎng", "当面": "dāng miàn", "当代": "dāng dài", "当心": "dāng xīn",
"当家": "dāng jiā", "当选": "dāng xuǎn", "充当": "chōng dāng", "担当": "dān dāng",
"适当": "shì dàng", "妥当": "tuǒ dàng", "恰当": "qià dàng",
"当铺": "dàng pù", "当作": "dàng zuò", "上当": "shàng dàng",

// ── 几 (jǐ / jī) ──
"几个": "jǐ gè", "几次": "jǐ cì", "几年": "jǐ nián", "几天": "jǐ tiān",
"几乎": "jī hū", "几何": "jǐ hé", "茶几": "chá jī",

// ── 看 (kàn / kān) ──
"看见": "kàn jiàn", "看法": "kàn fǎ", "看来": "kàn lái", "看起来": "kàn qǐ lái",
"看守": "kān shǒu", "看管": "kān guǎn", "看护": "kān hù",

// ── 要 (yào / yāo) ──
"要求": "yāo qiú", "要挟": "yāo xié", "要请": "yāo qǐng",
"重要": "zhòng yào", "主要": "zhǔ yào", "需要": "xū yào", "必要": "bì yào",
"要素": "yào sù", "要点": "yào diǎn", "要害": "yào hài", "要塞": "yào sài",
"摘要": "zhāi yào", "概要": "gài yào", "纲要": "gāng yào",

// ── 只 (zhǐ / zhī) ──
"只是": "zhǐ shì", "只有": "zhǐ yǒu", "只能": "zhǐ néng", "只要": "zhǐ yào",
"只好": "zhǐ hǎo", "只不过": "zhǐ bù guò",
"一只": "yī zhī", "两只": "liǎng zhī",

// ── 会 (huì / kuài) ──
"会议": "huì yì", "社会": "shè huì", "机会": "jī huì", "开会": "kāi huì",
"会计": "kuài jì", "财会": "cái kuài",

// ── 似 (sì / shì) ──
"似乎": "sì hū", "似是而非": "sì shì ér fēi", "相似": "xiāng sì",
"类似": "lèi sì", "酷似": "kù sì", "近似": "jìn sì", "貌似": "mào sì",
"似的": "shì de",

// ── 壳 (ké / qiào) ──
"贝壳": "bèi ké", "外壳": "wài ké", "蛋壳": "dàn ké", "果壳": "guǒ ké",
"弹壳": "dàn ké", "脑壳": "nǎo ké",
"地壳": "dì qiào", "甲壳": "jiǎ qiào",

// ── 尽 (jìn / jǐn) ──
"尽力": "jìn lì", "尽量": "jǐn liàng", "尽管": "jǐn guǎn", "尽快": "jǐn kuài",
"尽早": "jǐn zǎo", "尽可能": "jǐn kě néng",
"尽情": "jìn qíng", "尽头": "jìn tóu", "尽职": "jìn zhí", "尽兴": "jìn xìng",
"穷尽": "qióng jìn", "无尽": "wú jìn", "竭尽": "jié jìn",
};
