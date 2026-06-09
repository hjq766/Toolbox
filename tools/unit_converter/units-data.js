// 单位换算数据源
// 每个类型包含：name 显示名、base 基准单位 key、default 默认输入、groups 分组、quickUnits 快速输入选项
// factor: 1 单位 = factor × 基准单位（线性换算）
// 温度为非线性，使用 toBase / fromBase 函数

export const UNIT_TYPES = [
  {
    id: 'length', name: '长度', icon: 'ruler',
    base: 'm', default: { key: 'm', val: '1' },
    quickUnits: ['m', 'km', 'cm', 'mm', 'in', 'ft', 'mi'],
    groups: [
      { title: '公制', units: [
        { key: 'km', name: '千米', addon: 'km', factor: 1000 },
        { key: 'm', name: '米', addon: 'm', factor: 1 },
        { key: 'dm', name: '分米', addon: 'dm', factor: 0.1 },
        { key: 'cm', name: '厘米', addon: 'cm', factor: 0.01 },
        { key: 'mm', name: '毫米', addon: 'mm', factor: 0.001 },
        { key: 'um', name: '微米', addon: 'μm', factor: 1e-6 },
      ]},
      { title: '英制', units: [
        { key: 'in', name: '英寸', addon: 'in', factor: 0.0254 },
        { key: 'ft', name: '英尺', addon: 'ft', factor: 0.3048 },
        { key: 'yd', name: '码', addon: 'yd', factor: 0.9144 },
        { key: 'mi', name: '英里', addon: 'mi', factor: 1609.344 },
        { key: 'nmi', name: '海里', addon: 'nmi', factor: 1852 },
      ]},
      { title: '中国市制', units: [
        { key: 'li', name: '市里', addon: '里', factor: 500 },
        { key: 'chi', name: '市尺', addon: '尺', factor: 1 / 3 },
        { key: 'cun', name: '市寸', addon: '寸', factor: 1 / 30 },
      ]},
    ]
  },
  {
    id: 'weight', name: '重量', icon: 'weight',
    base: 'kg', default: { key: 'kg', val: '1' },
    quickUnits: ['kg', 'g', 'mg', 't', 'lb', 'oz', 'jin'],
    groups: [
      { title: '公制', units: [
        { key: 't', name: '吨', addon: 't', factor: 1000 },
        { key: 'kg', name: '千克', addon: 'kg', factor: 1 },
        { key: 'g', name: '克', addon: 'g', factor: 0.001 },
        { key: 'mg', name: '毫克', addon: 'mg', factor: 1e-6 },
        { key: 'ct', name: '克拉', addon: 'ct', factor: 0.0002 },
      ]},
      { title: '英制', units: [
        { key: 'lb', name: '磅', addon: 'lb', factor: 0.45359237 },
        { key: 'oz', name: '盎司', addon: 'oz', factor: 0.028349523125 },
        { key: 'st', name: '英石', addon: 'st', factor: 6.35029318 },
      ]},
      { title: '中国市制', units: [
        { key: 'jin', name: '市斤', addon: '斤', factor: 0.5 },
        { key: 'liang', name: '市两', addon: '两', factor: 0.05 },
      ]},
    ]
  },
  {
    id: 'area', name: '面积', icon: 'square',
    base: 'sqm', default: { key: 'sqm', val: '1' },
    quickUnits: ['sqm', 'sqkm', 'ha', 'sqcm', 'sqft', 'acre', 'mu'],
    groups: [
      { title: '公制', units: [
        { key: 'sqkm', name: '平方千米', addon: 'km²', factor: 1_000_000 },
        { key: 'ha', name: '公顷', addon: 'ha', factor: 10_000 },
        { key: 'sqm', name: '平方米', addon: 'm²', factor: 1 },
        { key: 'sqdm', name: '平方分米', addon: 'dm²', factor: 0.01 },
        { key: 'sqcm', name: '平方厘米', addon: 'cm²', factor: 0.0001 },
        { key: 'sqmm', name: '平方毫米', addon: 'mm²', factor: 1e-6 },
      ]},
      { title: '英制', units: [
        { key: 'sqmi', name: '平方英里', addon: 'mi²', factor: 2_589_988.11 },
        { key: 'acre', name: '英亩', addon: 'acre', factor: 4046.86 },
        { key: 'sqrd', name: '平方杆', addon: 'rd²', factor: 25.293 },
        { key: 'sqft', name: '平方英尺', addon: 'ft²', factor: 0.092903 },
        { key: 'sqin', name: '平方英寸', addon: 'in²', factor: 0.00064516 },
      ]},
      { title: '中国市制', units: [
        { key: 'mu', name: '亩', addon: '亩', factor: 666.6667 },
      ]},
    ]
  },
  {
    id: 'volume', name: '体积', icon: 'box',
    base: 'ml', default: { key: 'l', val: '1' },
    quickUnits: ['l', 'ml', 'cubicm', 'usgallon', 'ukgallon', 'cubicft'],
    groups: [
      { title: '公制', units: [
        { key: 'cubicm', name: '立方米', addon: 'm³', factor: 1_000_000 },
        { key: 'cubicdm', name: '立方分米', addon: 'dm³', factor: 1000 },
        { key: 'cubiccm', name: '立方厘米', addon: 'cm³', factor: 1 },
        { key: 'cubicmm', name: '立方毫米', addon: 'mm³', factor: 0.001 },
        { key: 'hl', name: '百升', addon: 'hL', factor: 100_000 },
        { key: 'l', name: '升', addon: 'L', factor: 1000 },
        { key: 'dl', name: '分升', addon: 'dL', factor: 100 },
        { key: 'cl', name: '厘升', addon: 'cL', factor: 10 },
        { key: 'ml', name: '毫升', addon: 'mL', factor: 1 },
      ]},
      { title: '中国市制', units: [
        { key: 'shi', name: '市石', addon: '石', factor: 100_000 },
        { key: 'hu', name: '市斛', addon: '斛', factor: 50_000 },
        { key: 'dou', name: '市斗', addon: '斗', factor: 10_000 },
        { key: 'sheng', name: '市升', addon: '升', factor: 1000 },
        { key: 'he', name: '市合', addon: '合', factor: 100 },
        { key: 'shao', name: '市勺', addon: '勺', factor: 10 },
        { key: 'cuo', name: '市撮', addon: '撮', factor: 1 },
        { key: 'chao', name: '市抄', addon: '抄', factor: 0.1 },
        { key: 'gui', name: '市圭', addon: '圭', factor: 0.01 },
        { key: 'liao', name: '市撂', addon: '撂', factor: 0.001 },
      ]},
      { title: '英制', units: [
        { key: 'cubicyd', name: '立方码', addon: 'yd³', factor: 764_554.858 },
        { key: 'cubicft', name: '立方英尺', addon: 'ft³', factor: 28_316.846592 },
        { key: 'cubicin', name: '立方英寸', addon: 'in³', factor: 16.387064 },
        { key: 'ukgallon', name: '英制加仑', addon: 'UK gal', factor: 4546.09 },
        { key: 'ukquart', name: '英制夸脱', addon: 'UK qt', factor: 1136.5225 },
        { key: 'ukpint', name: '英制品脱', addon: 'UK pt', factor: 568.26125 },
        { key: 'ukfloz', name: '英制液盎司', addon: 'UK fl oz', factor: 28.4130625 },
        { key: 'usgallon', name: '美制加仑', addon: 'US gal', factor: 3785.411784 },
        { key: 'usquart', name: '美制夸脱', addon: 'US qt', factor: 946.352946 },
        { key: 'uspint', name: '美制品脱', addon: 'US pt', factor: 473.176473 },
        { key: 'uscup', name: '美制杯', addon: 'US cup', factor: 236.588236 },
        { key: 'usfloz', name: '美制液盎司', addon: 'US fl oz', factor: 29.5735295625 },
        { key: 'ustbsp', name: '美制汤匙', addon: 'US tbsp', factor: 14.7867647813 },
        { key: 'ustsp', name: '美制茶匙', addon: 'US tsp', factor: 4.92892159375 },
      ]},
    ]
  },
  {
    id: 'temp', name: '温度', icon: 'thermometer',
    base: 'c', default: { key: 'c', val: '25' },
    quickUnits: ['c', 'f', 'k', 'r'],
    nonLinear: true,
    toBase: (v, key) => {
      if (key === 'c') return v;
      if (key === 'f') return (v - 32) * 5 / 9;
      if (key === 'k') return v - 273.15;
      if (key === 'r') return (v - 491.67) * 5 / 9;
    },
    fromBase: (c, key) => {
      if (key === 'c') return c;
      if (key === 'f') return c * 9 / 5 + 32;
      if (key === 'k') return c + 273.15;
      if (key === 'r') return (c + 273.15) * 9 / 5;
    },
    groups: [
      { title: '温度', units: [
        { key: 'c', name: '摄氏度', addon: '°C' },
        { key: 'f', name: '华氏度', addon: '°F' },
        { key: 'k', name: '开尔文', addon: 'K' },
        { key: 'r', name: '兰氏度', addon: '°R' },
      ]},
    ]
  },
  {
    id: 'speed', name: '速度', icon: 'gauge',
    base: 'ms', default: { key: 'kmh', val: '100' },
    quickUnits: ['kmh', 'ms', 'mph', 'kn', 'mach'],
    groups: [
      { title: '公制', units: [
        { key: 'ms', name: '米/秒', addon: 'm/s', factor: 1 },
        { key: 'kmh', name: '千米/时', addon: 'km/h', factor: 1 / 3.6 },
        { key: 'cms', name: '厘米/秒', addon: 'cm/s', factor: 0.01 },
      ]},
      { title: '英制', units: [
        { key: 'mph', name: '英里/时', addon: 'mph', factor: 0.44704 },
        { key: 'fts', name: '英尺/秒', addon: 'ft/s', factor: 0.3048 },
      ]},
      { title: '其他', units: [
        { key: 'kn', name: '节', addon: 'kn', factor: 0.514444 },
        { key: 'mach', name: '马赫', addon: 'Ma', factor: 340.3 },
        { key: 'c', name: '光速', addon: 'c', factor: 299792458 },
      ]},
    ]
  },
  {
    id: 'time', name: '时间', icon: 'clock',
    base: 's', default: { key: 'h', val: '1' },
    quickUnits: ['s', 'min', 'h', 'd', 'week', 'year'],
    groups: [
      { title: '常用', units: [
        { key: 'year', name: '年', addon: '年', factor: 31557600 },
        { key: 'month', name: '月', addon: '月', factor: 2629800 },
        { key: 'week', name: '周', addon: '周', factor: 604800 },
        { key: 'd', name: '天', addon: '天', factor: 86400 },
        { key: 'h', name: '小时', addon: '时', factor: 3600 },
        { key: 'min', name: '分钟', addon: '分', factor: 60 },
        { key: 's', name: '秒', addon: '秒', factor: 1 },
      ]},
      { title: '精确', units: [
        { key: 'ms_t', name: '毫秒', addon: 'ms', factor: 0.001 },
        { key: 'us_t', name: '微秒', addon: 'μs', factor: 1e-6 },
        { key: 'ns_t', name: '纳秒', addon: 'ns', factor: 1e-9 },
      ]},
    ]
  },
  {
    id: 'byte', name: '数据', icon: 'hard-drive',
    base: 'B', default: { key: 'MB', val: '1' },
    quickUnits: ['B', 'KB', 'MB', 'GB', 'TB'],
    groups: [
      { title: '数据存储', units: [
        { key: 'b', name: '比特', addon: 'bit', factor: 1 / 8 },
        { key: 'B', name: '字节', addon: 'B', factor: 1 },
        { key: 'KB', name: '千字节', addon: 'KB', factor: 1024 },
        { key: 'MB', name: '兆字节', addon: 'MB', factor: 1024 ** 2 },
        { key: 'GB', name: '吉字节', addon: 'GB', factor: 1024 ** 3 },
        { key: 'TB', name: '太字节', addon: 'TB', factor: 1024 ** 4 },
        { key: 'PB', name: '拍字节', addon: 'PB', factor: 1024 ** 5 },
      ]},
    ]
  },
  {
    id: 'power', name: '功率', icon: 'zap',
    base: 'watt', default: { key: 'kilowatt', val: '1' },
    quickUnits: ['watt', 'kilowatt', 'horsepower', 'metric_horsepower'],
    groups: [
      { title: '功率', units: [
        { key: 'kilowatt', name: '千瓦', addon: 'kW', factor: 1000 },
        { key: 'watt', name: '瓦', addon: 'W', factor: 1 },
        { key: 'horsepower', name: '英制马力', addon: 'hp', factor: 745.7 },
        { key: 'metric_horsepower', name: '米制马力', addon: 'PS', factor: 735.499 },
        { key: 'kgms', name: '公斤·米/秒', addon: 'kgm/s', factor: 9.80665 },
        { key: 'kcalps', name: '千卡/秒', addon: 'kcal/s', factor: 4186.8 },
        { key: 'btups', name: '英热单位/秒', addon: 'BTU/s', factor: 1055.06 },
        { key: 'ftlbps', name: '英尺·磅/秒', addon: 'ft·lb/s', factor: 1.355818 },
      ]},
    ]
  },
  {
    id: 'press', name: '压强', icon: 'arrow-down-to-line',
    base: 'pascal', default: { key: 'atmosphere', val: '1' },
    quickUnits: ['pascal', 'kilopascal', 'bar', 'atmosphere', 'psi', 'mmhg'],
    groups: [
      { title: '公制', units: [
        { key: 'bar', name: '巴', addon: 'bar', factor: 100_000 },
        { key: 'kilopascal', name: '千帕', addon: 'kPa', factor: 1000 },
        { key: 'hectopascal', name: '百帕', addon: 'hPa', factor: 100 },
        { key: 'millibar', name: '毫巴', addon: 'mbar', factor: 100 },
        { key: 'pascal', name: '帕斯卡', addon: 'Pa', factor: 1 },
      ]},
      { title: '其他', units: [
        { key: 'atmosphere', name: '标准大气压', addon: 'atm', factor: 101_325 },
        { key: 'mmhg', name: '毫米汞柱', addon: 'mmHg', factor: 133.322 },
        { key: 'inhg', name: '英寸汞柱', addon: 'inHg', factor: 3386.389 },
        { key: 'kgf_cm2', name: '公斤力/cm²', addon: 'kgf/cm²', factor: 98_066.5 },
        { key: 'kgf_m2', name: '公斤力/m²', addon: 'kgf/m²', factor: 9.80665 },
        { key: 'mmh2o', name: '毫米水柱', addon: 'mmH₂O', factor: 9.80665 },
        { key: 'lbf_ft2', name: '磅力/ft²', addon: 'lbf/ft²', factor: 47.88026 },
        { key: 'psi', name: 'psi', addon: 'psi', factor: 6894.757 },
      ]},
    ]
  },
  {
    id: 'heat', name: '热量', icon: 'flame',
    base: 'joule', default: { key: 'kwh', val: '1' },
    quickUnits: ['joule', 'kwh', 'kcal', 'btu'],
    groups: [
      { title: '热量 / 能量', units: [
        { key: 'joule', name: '焦耳', addon: 'J', factor: 1 },
        { key: 'kgm', name: '公斤·米', addon: 'kgm', factor: 9.80665 },
        { key: 'kwh', name: '千瓦·时', addon: 'kWh', factor: 3_600_000 },
        { key: 'psh', name: '米制马力·时', addon: 'PSh', factor: 2_647_795.5 },
        { key: 'hph', name: '英制马力·时', addon: 'hph', factor: 2_684_519.537 },
        { key: 'kcal', name: '千卡', addon: 'kcal', factor: 4186.8 },
        { key: 'btu', name: '英热单位', addon: 'BTU', factor: 1055.05585262 },
        { key: 'ftlb', name: '英尺·磅', addon: 'ft·lb', factor: 1.355817948 },
      ]},
    ]
  },
];
