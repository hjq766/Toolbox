window.designSpecs = {
  // 分类
  categories: [
    { id: 'ui', name: 'UI设计规范' },
    { id: 'print', name: '平面设计规范' }
  ],

  // UI设计规范
  ui: {
    devices: {
      title: "设备尺寸",
      mobile: {
        title: "移动设备",
        items: [
          {
            name: "iPhone 16 Pro Max",
            specs: [
              { label: "分辨率", value: "1320 × 2892 px" },
              { label: "逻辑尺寸", value: "440 × 964 px" },
              { label: "屏幕密度", value: "460 PPI" },
              { label: "屏幕尺寸", value: "6.9" }
            ]
          },
          {
            name: "iPhone 16 Pro",
            specs: [
              { label: "分辨率", value: "1179 × 2556 px" },
              { label: "逻辑尺寸", value: "393 × 852 px" },
              { label: "屏幕密度", value: "460 PPI" },
              { label: "屏幕尺寸", value: "6.3" }
            ]
          },
          {
            name: "iPhone 15 Pro Max / 14 Pro Max",
            specs: [
              { label: "分辨率", value: "1290 × 2796 px" },
              { label: "逻辑尺寸", value: "430 × 932 px" },
              { label: "屏幕密度", value: "460 PPI" },
              { label: "屏幕尺寸", value: "6.7" }
            ]
          },
          {
            name: "iPhone 15 Plus / 14 Plus / 13 Pro Max / 12 Pro Max",
            specs: [
              { label: "分辨率", value: "1284 × 2778 px" },
              { label: "逻辑尺寸", value: "428 × 926 px" },
              { label: "屏幕密度", value: "458 PPI" },
              { label: "屏幕尺寸", value: "6.7" }
            ]
          },
          {
            name: "iPhone 15 Pro / 14 Pro",
            specs: [
              { label: "分辨率", value: "1179 × 2556 px" },
              { label: "逻辑尺寸", value: "430 × 932 px" },
              { label: "屏幕密度", value: "460 PPI" },
              { label: "屏幕尺寸", value: "6.1" }
            ]
          },
          {
            name: "iPhone 15 / 14 / 13 Pro / 13 / 12 Pro / 12",
            specs: [
              { label: "分辨率", value: "1170 × 2532 px" },
              { label: "逻辑尺寸", value: "390 × 844 px" },
              { label: "屏幕密度", value: "460 PPI" },
              { label: "屏幕尺寸", value: "6.1" }
            ]
          },
          {
            name: "iPhone 13 mini / 12 mini",
            specs: [
              { label: "分辨率", value: "1080 × 2340 px" },
              { label: "逻辑尺寸", value: "375 × 812 px" },
              { label: "屏幕密度", value: "476 PPI" },
              { label: "屏幕尺寸", value: "5.4" }
            ]
          },
        ]
      },
      tablet: {
        title: "平板设备",
        items: [
          {
            name: "iPad Pro 12.9",
            specs: [
              { label: "分辨率", value: "2048 × 2732 px" },
              { label: "逻辑尺寸", value: "1024 × 1366 px" },
              { label: "屏幕密度", value: "264 PPI" },
              { label: "屏幕尺寸", value: "12.9" }
            ]
          },
          {
            name: "iPad Pro 11",
            specs: [
              { label: "分辨率", value: "1668 × 2388 px" },
              { label: "逻辑尺寸", value: "834 × 1194 px" },
              { label: "屏幕密度", value: "264 PPI" },
              { label: "屏幕尺寸", value: "11" }
            ]
          },
          {
            name: "iPad Air 4 / 5 / 6",
            specs: [
              { label: "分辨率", value: "1640 × 2360 px" },
              { label: "逻辑尺寸", value: "820 × 1180 px" },
              { label: "屏幕密度", value: "264 PPI" },
              { label: "屏幕尺寸", value: "10.9" }
            ]
          },
          {
            name: "iPad Air 1 / 2 / 3",
            specs: [
              { label: "分辨率", value: "1536 × 2048 px" },
              { label: "逻辑尺寸", value: "768 × 1024 px" },
              { label: "屏幕密度", value: "264 PPI" },
              { label: "屏幕尺寸", value: "9.7" }
            ]
          },
          {
            name: "iPad mini 6 / mini 7",
            specs: [
              { label: "分辨率", value: "1488 × 2266 px" },
              { label: "逻辑尺寸", value: "744 × 1133 px" },
              { label: "屏幕密度", value: "326 PPI" },
              { label: "屏幕尺寸", value: "8.3" }
            ]
          },
          {
            name: "iPad mini 5 / mini 4",
            specs: [
              { label: "分辨率", value: "1536 × 2048 px" },
              { label: "逻辑尺寸", value: "768 × 1024 px" },
              { label: "屏幕密度", value: "326 PPI" },
              { label: "屏幕尺寸", value: "7.9" }
            ]
          }
        ]
      },
      desktop: {
        title: "桌面设备",
        items: [
          {
            name: "MacBook Pro 16",
            specs: [
              { label: "分辨率", value: "3456 × 2234 px" },
              { label: "逻辑尺寸", value: "1728 × 1117 px" },
              { label: "屏幕密度", value: "254 PPI" },
              { label: "屏幕尺寸", value: "16.2" }
            ]
          },
          {
            name: "MacBook Pro 15",
            specs: [
              { label: "分辨率", value: "3024 × 1964 px" },
              { label: "逻辑尺寸", value: "1512 × 982 px" },
              { label: "屏幕密度", value: "254 PPI" },
              { label: "屏幕尺寸", value: "15.3" }
            ]
          },
          {
            name: "MacBook Pro 14",
            specs: [
              { label: "分辨率", value: "3024 × 1964 px" },
              { label: "逻辑尺寸", value: "1512 × 982 px" },
              { label: "屏幕密度", value: "254 PPI" },
              { label: "屏幕尺寸", value: "14.2" }
            ]
          },
          {
            name: "MacBook Pro 13",
            specs: [
              { label: "分辨率", value: "2560 × 1600 px" },
              { label: "逻辑尺寸", value: "1280 × 800 px" },
              { label: "屏幕密度", value: "227 PPI" },
              { label: "屏幕尺寸", value: "13.3" }
            ]
          },
          {
            name: "MacBook Air 15",
            specs: [
              { label: "分辨率", value: "2880 × 1864 px" },
              { label: "逻辑尺寸", value: "1440 × 932 px" },
              { label: "屏幕密度", value: "224 PPI" },
              { label: "屏幕尺寸", value: "15.3" }
            ]
          },
          {
            name: "MacBook Air 13",
            specs: [
              { label: "分辨率", value: "2560 × 1664 px" },
              { label: "逻辑尺寸", value: "1280 × 832 px" },
              { label: "屏幕密度", value: "224 PPI" },
              { label: "屏幕尺寸", value: "13.6" }
            ]
          }
        ]
      }
    },
    web: {
      title: "Web规范",
      note: "以下数值仅供参考，请根据实际项目需求进行调整",
      resolutions: {
        title: "常用分辨率",
        items: [
          { name: "Desktop Large", value: "1920 × 1080 px", desc: "桌面大屏" },
          { name: "Desktop", value: "1440 × 900 px", desc: "桌面标准" },
          { name: "Laptop", value: "1366 × 768 px", desc: "笔记本" },
          { name: "Tablet", value: "768 × 1024 px", desc: "平板竖屏" },
          { name: "Mobile L", value: "425 × 896 px", desc: "大屏手机" },
          { name: "Mobile M", value: "375 × 812 px", desc: "标准手机" },
          { name: "Mobile S", value: "320 × 568 px", desc: "小屏手机" }
        ]
      },
    },
    icons: {
      title: "图标规范",
      ios: {
        title: "iOS图标规范",
        items: [
          { name: "App Store （Retina）", size: "1024 × 1024 px" },
          { name: "App Store", size: "512 × 512 px" },
          { name: "iPhone", size: "180 × 180 px"},
          { name: "iPad Pro", size: "167 × 167 px" },
          { name: "iPad", size: "152 × 152 px" },
        ]
      },
      android: {
        title: "Android图标规范",
        items: [
          { name: "Play Store", size: "512 × 512 px" },
          { name: "xxxhdpi", size: "192 × 192 px" },
          { name: "xxhdpi", size: "144 × 144 px" },
          { name: "xhdpi", size: "96 × 96 px" },
          { name: "hdpi", size: "72 × 72 px" },
          { name: "mdpi", size: "48 × 48 px" }
        ]
      }
    }
  },

  // 平面设计规范
  print: {
    title: "平面设计规范",
    note: "以上尺寸均为不含出血的净尺寸，如需印刷请在四周加3mm出血。印刷文件请确保字体已转曲，色值采用CMYK模式。",
    paper: {
      title: "纸张尺寸",
      note: "印刷时请在四周加3mm出血，成品尺寸以下表为准",
      items: [
        { name: "A0", size: "841 × 1189 mm", desc: "海报/工程图" },
        { name: "A1", size: "594 × 841 mm", desc: "建筑图纸" },
        { name: "A2", size: "420 × 594 mm", desc: "大幅海报" },
        { name: "A3", size: "297 × 420 mm", desc: "海报/图纸" },
        { name: "A4", size: "210 × 297 mm", desc: "文档/打印" },
        { name: "A5", size: "148 × 210 mm", desc: "小册子" },
        { name: "A6", size: "105 × 148 mm", desc: "明信片" },
        { name: "B0", size: "1000 × 1414 mm", desc: "特大海报" },
        { name: "B1", size: "707 × 1000 mm", desc: "大幅海报" },
        { name: "B2", size: "500 × 707 mm", desc: "海报" },
        { name: "B3", size: "353 × 500 mm", desc: "海报" },
        { name: "B4", size: "250 × 353 mm", desc: "书籍/杂志" },
        { name: "B5", size: "176 × 250 mm", desc: "书籍常用" }
      ]
    },
    print: {
      title: "印刷开本",
      note: "印刷时请在四周加3mm出血，成品尺寸以下表为准",
      items: [
        { name: "对开", size: "390 × 545 mm", desc: "报纸常用" },
        { name: "四开", size: "390 × 273 mm", desc: "报纸/杂志" },
        { name: "8开", size: "273 × 195 mm", desc: "画册/杂志" },
        { name: "16开", size: "195 × 136 mm", desc: "书籍/杂志" },
        { name: "32开", size: "136 × 98 mm", desc: "小说常用" },
        { name: "大16开", size: "210 × 140 mm", desc: "图文书籍" },
        { name: "大32开", size: "140 × 105 mm", desc: "口袋书" },
        { name: "正度16开", size: "185 × 130 mm", desc: "标准书籍" },
        { name: "正度32开", size: "130 × 93 mm", desc: "标准书籍" },
        { name: "胶版16开", size: "210 × 285 mm", desc: "杂志常用" },
        { name: "胶版32开", size: "140 × 203 mm", desc: "书籍常用" }
      ]
    },
    business: {
      title: "商务印刷",
      note: "名片建议采用300g铜版纸，覆哑膜。信封尺寸为成品尺寸",
      items: [
        { name: "标准名片", size: "90 × 54 mm", desc: "国际通用" },
        { name: "美式名片", size: "89 × 51 mm", desc: "美国标准" },
        { name: "欧式名片", size: "85 × 55 mm", desc: "欧洲标准" },
        { name: "标准信封", size: "220 × 110 mm", desc: "常用尺寸" },
        { name: "DL信封", size: "220 × 110 mm", desc: "欧标信封" },
        { name: "C4信封", size: "324 × 229 mm", desc: "A4信封" },
        { name: "C5信封", size: "229 × 162 mm", desc: "A5信封" },
        { name: "C6信封", size: "162 × 114 mm", desc: "A6信封" },
        { name: "A6便签", size: "105 × 148 mm", desc: "标准便签" },
        { name: "便签本", size: "75 × 75 mm", desc: "方形便签" }
      ]
    },
    photo: {
      title: "照片尺寸",
      note: "证件照请使用白色背景，建议300dpi以上",
      items: [
        { name: "1寸照片", size: "25 × 35 mm", desc: "证件照 / 登记表" },
        { name: "2寸照片", size: "35 × 49 mm", desc: "证件照 / 简历" },
        { name: "小1寸", size: "22 × 32 mm", desc: "证件照" },
        { name: "小2寸", size: "33 × 45 mm", desc: "证件照" },
        { name: "大1寸", size: "33 × 48 mm", desc: "证件照" },
        { name: "大2寸", size: "35 × 53 mm", desc: "证件照" },
        { name: "护照照片", size: "33 × 48 mm", desc: "护照专用" },
        { name: "签证照片", size: "35 × 45 mm", desc: "签证专用" },
        { name: "驾照照片", size: "22 × 32 mm", desc: "驾驶证专用" }
      ]
    },
    advertising: {
      title: "广告展示",
      note: "展示类设计建议使用CMYK模式，分辨率不低于150dpi",
      items: [
        { name: "标准易拉宝", size: "80 × 180 cm", desc: "常用尺寸" },
        { name: "小型易拉宝", size: "60 × 160 cm", desc: "展会常用" },
        { name: "门型展架", size: "240 × 180 cm", desc: "展会入口" },
        { name: "标准X展架", size: "60 × 160 cm", desc: "常用尺寸" },
        { name: "小型X展架", size: "50 × 135 cm", desc: "展位常用" },
        { name: "道旗", size: "60 × 150 cm", desc: "路边旗帜" },
        { name: "灯箱海报", size: "120 × 180 cm", desc: "户外广告" },
        { name: "商场立牌", size: "60 × 90 cm", desc: "商场广告" }
      ]
    },
    bags: {
      title: "手提袋",
      note: "尺寸顺序为：宽×高×底宽，印刷时请在四周加3mm出血",
      items: [
        { name: "小号手提袋", size: "200 × 250 × 80 mm", desc: "化妆品/小礼品" },
        { name: "中号手提袋", size: "250 × 320 × 100 mm", desc: "服装/礼盒" },
        { name: "大号手提袋", size: "320 × 420 × 120 mm", desc: "大件商品" },
        { name: "文件手提袋", size: "280 × 380 × 80 mm", desc: "A4文件" },
        { name: "礼品手提袋", size: "150 × 220 × 60 mm", desc: "首饰/小物" },
        { name: "红酒手提袋", size: "110 × 330 × 90 mm", desc: "酒类专用" }
      ]
    },
    brochure: {
      title: "宣传册",
      note: "内页建议157g铜版纸，封面建议250g铜版纸，印刷时请在四周加3mm出血",
      items: [
        { name: "A4宣传册", size: "210 × 285 mm", desc: "标准规格" },
        { name: "A5宣传册", size: "148 × 210 mm", desc: "便携规格" },
        { name: "方形画册", size: "200 × 200 mm", desc: "艺术画册" },
        { name: "大开画册", size: "230 × 280 mm", desc: "企业画册" },
        { name: "小开画册", size: "185 × 230 mm", desc: "产品手册" }
      ]
    },
    folds: {
      title: "折页",
      note: "尺寸为展开尺寸，印刷时请在四周加3mm出血，注意预留折痕位置",
      items: [
        { name: "三折页(A4)", size: "297 × 210 mm", desc: "展开尺寸" },
        { name: "四折页(A4)", size: "297 × 210 mm", desc: "展开尺寸" },
        { name: "双折页(A4)", size: "297 × 210 mm", desc: "展开尺寸" },
        { name: "三折页(A3)", size: "420 × 297 mm", desc: "展开尺寸" },
        { name: "四折页(A3)", size: "420 × 297 mm", desc: "展开尺寸" },
        { name: "手风琴折(4P)", size: "396 × 210 mm", desc: "展开尺寸" },
        { name: "手风琴折(6P)", size: "594 × 210 mm", desc: "展开尺寸" },
        { name: "手风琴折(8P)", size: "792 × 210 mm", desc: "展开尺寸" }
      ]
    }
  }
};
