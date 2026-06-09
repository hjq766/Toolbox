/**
 * 模拟数据生成 — 虚构词库（本站整理维护）
 * 仅供界面测试与开发调试；严禁用于任何违法违规用途
 */

/* ======== 中文姓名 ======== */
export const SURNAMES = [
  '张','王','李','赵','陈','刘','杨','黄','周','吴','徐','孙','马','胡','朱','郭',
  '何','林','罗','高','郑','梁','谢','宋','唐','许','韩','冯','邓','曹','彭','曾',
  '萧','田','董','潘','袁','蔡','蒋','余','于','杜','叶','程','魏','苏','吕','丁',
  '任','卢','姚','沈','钟','姜','崔','谭','陆','范','汪','廖','石','金','贾','夏',
  '韦','付','方','邹','熊','白','孟','秦','邱','侯','江','尹','薛','闫','段','雷',
  '龙','史','陶','贺','顾','毛','郝','龚','邵','万','覃','武','钱','戴','严','莫',
  '孔','向','常','汤','黎','易','乔','文','庞','樊','兰','殷','施','洪','翟','颜',
];

export const GIVEN_NAMES = [
  '伟','芳','娜','敏','静','丽','强','磊','洋','勇','艳','杰','涛','明','超','霞',
  '平','刚','军','华','飞','萍','红','玉','辉','玲','英','梅','雪','慧','宇','浩',
  '建华','志强','海燕','晓明','浩然','子涵','欣怡','梓涵','语桐','一诺','思远',
  '博文','雨泽','宇轩','皓轩','子默','思琪','若曦','昊天','俊杰','文博','天佑',
  '嘉懿','煜城','瑞霖','明哲','星辰','逸飞','锦程','诗涵','雨萱','梦瑶','芷晴',
  '悦然','清雅','舒然','婉清','沐晨','思妍','语嫣','沐阳','若溪','瑾瑜','梓轩',
  '子豪','佳怡','诗雨','宇航','梓豪','雨桐','欣妍','子睿','佳琪','俊豪',
];

/* ======== 英文人名 ======== */
export const EN_FIRST_NAMES = [
  'James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','David','Elizabeth',
  'William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen',
  'Daniel','Lisa','Matthew','Nancy','Andrew','Betty','Joshua','Margaret','Emily','Brian',
  'Kevin','Donna','George','Michelle','Steven','Carol','Kenneth','Amanda','Paul','Melissa',
  'Ryan','Laura','Jason','Ashley','Justin','Kimberly','Brandon','Nicole','Samuel','Rachel',
];

export const EN_LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
];

/* ======== 手机号段（常见运营商） ======== */
export const PHONE_PREFIXES = [
  '130','131','132','133','134','135','136','137','138','139',
  '150','151','152','153','155','156','157','158','159',
  '166','167','170','171','172','173','175','176','177','178',
  '180','181','182','183','184','185','186','187','188','189',
  '190','191','193','195','196','197','198','199',
];

/* ======== 邮箱域名 ======== */
export const EMAIL_DOMAINS = [
  'qq.com','163.com','126.com','gmail.com','outlook.com','foxmail.com',
  'sina.com','hotmail.com','yeah.net','sohu.com','icloud.com','yahoo.com',
  '139.com','aliyun.com','proton.me','live.com',
];

/* ======== 地址（34 个省级行政区：23 省 + 5 自治区 + 4 直辖市 + 2 特别行政区） ======== */
export const PROVINCES = [
  { name: '北京市', cities: ['东城区','西城区','朝阳区','海淀区','丰台区','通州区','大兴区'] },
  { name: '上海市', cities: ['黄浦区','徐汇区','长宁区','静安区','浦东新区','杨浦区','闵行区'] },
  { name: '天津市', cities: ['和平区','南开区','河西区','河北区','红桥区','滨海新区'] },
  { name: '重庆市', cities: ['渝中区','江北区','南岸区','沙坪坝区','九龙坡区','渝北区'] },
  { name: '广东省', cities: ['广州市天河区','深圳市南山区','深圳市福田区','东莞市','佛山市','珠海市','惠州市'] },
  { name: '浙江省', cities: ['杭州市西湖区','杭州市余杭区','宁波市','温州市','绍兴市','嘉兴市'] },
  { name: '江苏省', cities: ['南京市鼓楼区','南京市玄武区','苏州市','无锡市','常州市','南通市'] },
  { name: '四川省', cities: ['成都市武侯区','成都市锦江区','成都市高新区','绵阳市','德阳市','宜宾市'] },
  { name: '湖北省', cities: ['武汉市江汉区','武汉市洪山区','武汉市武昌区','宜昌市','襄阳市','黄石市'] },
  { name: '山东省', cities: ['济南市历下区','济南市市中区','青岛市','烟台市','潍坊市','临沂市'] },
  { name: '河南省', cities: ['郑州市金水区','郑州市二七区','洛阳市','开封市','新乡市','南阳市'] },
  { name: '福建省', cities: ['福州市鼓楼区','厦门市思明区','泉州市','漳州市','莆田市','龙岩市'] },
  { name: '湖南省', cities: ['长沙市岳麓区','长沙市天心区','株洲市','湘潭市','衡阳市','岳阳市'] },
  { name: '陕西省', cities: ['西安市雁塔区','西安市碑林区','西安市未央区','咸阳市','宝鸡市','渭南市'] },
  { name: '辽宁省', cities: ['沈阳市沈河区','沈阳市和平区','大连市','鞍山市','抚顺市','锦州市'] },
  { name: '安徽省', cities: ['合肥市蜀山区','合肥市庐阳区','芜湖市','蚌埠市','马鞍山市','阜阳市'] },
  { name: '河北省', cities: ['石家庄市长安区','唐山市路北区','保定市','廊坊市','邯郸市'] },
  { name: '山西省', cities: ['太原市小店区','大同市平城区','运城市','临汾市'] },
  { name: '江西省', cities: ['南昌市东湖区','赣州市章贡区','九江市','上饶市'] },
  { name: '云南省', cities: ['昆明市五华区','大理市','曲靖市','玉溪市'] },
  { name: '贵州省', cities: ['贵阳市云岩区','遵义市','六盘水市'] },
  { name: '海南省', cities: ['海口市龙华区','三亚市','儋州市'] },
  { name: '甘肃省', cities: ['兰州市城关区','天水市','酒泉市'] },
  { name: '青海省', cities: ['西宁市城西区','海东市'] },
  { name: '黑龙江省', cities: ['哈尔滨市南岗区','齐齐哈尔市','大庆市'] },
  { name: '吉林省', cities: ['长春市朝阳区','吉林市','延边州'] },
  { name: '内蒙古自治区', cities: ['呼和浩特市新城区','包头市','鄂尔多斯市'] },
  { name: '广西壮族自治区', cities: ['南宁市青秀区','桂林市','柳州市'] },
  { name: '西藏自治区', cities: ['拉萨市城关区','日喀则市','林芝市'] },
  { name: '宁夏回族自治区', cities: ['银川市西夏区','银川市金凤区','吴忠市'] },
  { name: '新疆维吾尔自治区', cities: ['乌鲁木齐市天山区','乌鲁木齐市沙依巴克区','喀什市','伊犁州'] },
  { name: '台湾省', cities: ['台北市信义区','新北市板桥区','高雄市前金区','台中市西屯区'] },
  { name: '香港特别行政区', cities: ['中西区','湾仔区','九龙城区','观塘区'] },
  { name: '澳门特别行政区', cities: ['花地玛堂区','圣安多尼堂区','嘉模堂区'] },
];

export const STREETS = [
  /* 常见政区命名 */
  '中山路','人民路','建设路','解放路','和平路','文化路','民主路','团结路',
  '胜利路','光明路','新华路','振兴路','复兴路','文昌路','青年路','红旗路',
  '工农路','友谊路','延安路','长江路','黄河路','淮河路','珠江路','海河路',
  /* 方位与环线 */
  '东风路','西风路','南门街','北门巷','环城南路','环城北路','滨河东路','滨河西路',
  '中心大街','人民大道','滨江大道','滨海大道','迎宾大道','发展大道','物流大道',
  /* 功能与产业 */
  '科技大道','创新街','工业大道','商业街','金融街','电商大道','文创园路','总部基地路',
  '学府路','学院路','科研路','产业园一路','高新区大道','软件园路','创业路','会展路',
  /* 自然与景观 */
  '花园路','湖滨路','梧桐路','柳叶路','樱花街','桃源路','翠竹巷','青松路',
  '枫林路','樟树街','榕城路','海棠路','玉兰大道','银杏路','桂花巷','兰桂坊街',
  /* 地标风格（虚构化） */
  '长安街','望京街','中关村大街','南京路','淮海路','北京路','春熙路','天府大道',
  '广州大道','深南大道','罗湖路','解放大道','武珞路','中山东路','延安中路',
  '延安西路','人民广场路','火车站路','机场路','码头街','港口大道','车站路',
  /* 巷弄里弄 */
  '幸福里','安乐巷','永兴弄','水岸巷','石板街','老街巷','状元巷','文庙街',
  '东大街','西大街','南市街','北巷','十字街','麻绳巷','打铜街','绣花巷',
  /* 现代社区 */
  '阳光路','星河路','盛世路','康乐路','锦绣路','和谐路','绿洲路','观澜路',
  '悦府路','天骄路','尚品街','御景大道','金桂路','银湖路','翡翠路','琥珀街',
];

export const BUILDING_SUFFIX = [
  '号','号楼','弄18号','座','栋','单元302室','号院','广场A座',
];

/* ======== 公司 ======== */
export const COMPANY_PREFIXES = [
  '华','中','金','新','万','恒','天','国','盛','瑞','博','嘉','鑫','鼎','正','泰',
  '宏','信','安','联','创','智','诚','同','达','远','方','云','通','领','科','润',
];
export const COMPANY_SUFFIXES = [
  '科技','网络','信息','电子','传媒','文化','教育','生物','医药','能源',
  '金融','投资','贸易','物流','建设','实业','咨询','设计','数据','软件',
  '智能','数字','互联','创新','服务',
];
export const COMPANY_TYPES = ['有限公司','股份有限公司','集团有限公司'];

/* ======== 职位 ======== */
export const JOB_TITLES = [
  '产品经理','前端工程师','后端工程师','UI 设计师','测试工程师','运营专员',
  '市场经理','销售代表','人力资源','财务主管','数据分析师','项目经理',
  '客服专员','行政助理','品牌策划','内容编辑','架构师','运维工程师',
];

/* ======== 身份证前缀（地区码） ======== */
export const ID_AREA_CODES = [
  '110101','110105','110108','310101','310115','120101','500103','500112',
  '440103','440305','440304','330102','330110','320102','320505','510104',
  '510107','420102','420111','370102','370202','410102','350102','350203',
  '430104','430103','610102','610113','210102','210202','340102','340104',
  '130102','140105','360102','530102','520102','460105','620102','630104',
  '230103','220104','150102','450103',
  '540102','640104','650102','710101','810101','820101',
];

/* ======== 英文 Lorem ======== */
export const LOREM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.',
  'Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue.',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
  'Fusce lacinia arcu et nulla. Nulla vitae massa. Sed mollis eros et ultrices tempus.',
  'Suspendisse potenti. Sed lectus. Integer euismod lacus luctus magna.',
  'Maecenas malesuada. Praesent congue erat at massa.',
  'Aliquam erat volutpat. Nunc eleifend leo vitae magna.',
  'In id erat non orci commodo lobortis. Proin neque massa, cursus ut gravida ut, mattis in urna.',
  'Phasellus lacus. Nulla facilisi. Cum sociis natoque penatibus et magnis dis parturient montes.',
  'Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes.',
  'Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.',
  'Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue.',
];

/* ======== 中文占位文本 ======== */
export const ZH_SENTENCES = [
  '这是一段用于测试的中文占位文本，可在设计稿和开发过程中模拟真实排版。',
  '前端开发中经常需要占位文本来验证页面在不同内容长度下的布局表现。',
  '在软件开发过程中，模拟数据有助于测试界面组件与表格的展示效果。',
  '用户体验设计需要在原型阶段使用接近真实的内容来检验信息层级。',
  '数据驱动的产品决策需要高质量的测试数据进行联调与演示。',
  '现代应用通常需要处理大量结构化数据，表格预览尤为重要。',
  '持续集成要求自动化测试覆盖尽可能多的业务场景与边界条件。',
  '良好的代码质量与完善的测试用例是项目长期可维护性的基础。',
  '微服务架构下各服务接口联调尤其需要丰富且格式规范的模拟数据。',
  '大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。',
  '落霞与孤鹜齐飞，秋水共长天一色。渔舟唱晚，响穷彭蠡之滨。',
  '山不在高，有仙则名；水不在深，有龙则灵。斯是陋室，惟吾德馨。',
  '天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。寒来暑往，秋收冬藏。',
  '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
  '会当凌绝顶，一览众山小。岱宗夫如何，齐鲁青未了。',
  '海内存知己，天涯若比邻。无为在歧路，儿女共沾巾。',
];

/* ======== 车牌 ======== */
export const PLATE_PROVINCES = [
  '京','沪','粤','浙','苏','川','鄂','湘','鲁','豫',
  '闽','皖','渝','津','陕','辽','吉','黑','赣','桂',
  '冀','晋','蒙','琼','甘','青','贵','云','藏','新','宁',
];

/* ======== 用户名组件 ======== */
export const USERNAME_PARTS = [
  'cool','super','lucky','happy','dark','sky','moon','star','fire','ice',
  'blue','red','gold','silver','iron','wolf','fox','eagle','tiger','lion',
  'pixel','byte','code','dev','hack','net','web','data','cloud','node',
  'nova','apex','zen','flux','echo','mint','wave','spark','dash','link',
];

/* ======== 颜色名 ======== */
export const COLOR_NAMES = [
  'red','orange','yellow','green','blue','indigo','violet','pink','brown','gray',
  'cyan','magenta','lime','olive','teal','navy','coral','salmon','crimson','gold',
];
