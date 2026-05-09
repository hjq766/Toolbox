const capitalData = {
    asia: {
        name: "亚洲",
        nameEn: "Asia",
        countries: [{
            "country": "中国",
            "countryEn": "China",
            "capital": "北京",
            "capitalEn": "Beijing",
            "flag": "cn",
            "details": "亚洲 · 东经116°20′，北纬39°56′"
        }, {
            "country": "日本",
            "countryEn": "Japan",
            "capital": "东京",
            "capitalEn": "Tokyo",
            "flag": "jp",
            "details": "亚洲 · 东经139°46′，北纬35°40′"
        }, {
            "country": "韩国",
            "countryEn": "South Korea",
            "capital": "首尔",
            "capitalEn": "Seoul",
            "flag": "kr",
            "details": "亚洲 · 东经127°03′，北纬37°33′"
        }, {
            "country": "朝鲜",
            "countryEn": "North Korea",
            "capital": "平壤",
            "capitalEn": "Pyongyang",
            "flag": "kp",
            "details": "亚洲 · 东经125°45′，北纬39°01′"
        }, {
            "country": "蒙古",
            "countryEn": "Mongolia",
            "capital": "乌兰巴托",
            "capitalEn": "Ulaanbaatar",
            "flag": "mn",
            "details": "亚洲 · 东经106°53′，北纬47°55′"
        }, {
            "country": "越南",
            "countryEn": "Vietnam",
            "capital": "河内",
            "capitalEn": "Hanoi",
            "flag": "vn",
            "details": "亚洲 · 东经105°55′，北纬21°02′"
        }, {
            "country": "老挝",
            "countryEn": "Laos",
            "capital": "万象",
            "capitalEn": "Vientiane",
            "flag": "la",
            "details": "亚洲 · 东经102°36′，北纬17°58′"
        }, {
            "country": "柬埔寨",
            "countryEn": "Cambodia",
            "capital": "金边",
            "capitalEn": "Phnom Penh",
            "flag": "kh",
            "details": "亚洲 · 东经104°55′，北纬11°33′"
        }, {
            "country": "泰国",
            "countryEn": "Thailand",
            "capital": "曼谷",
            "capitalEn": "Bangkok",
            "flag": "th",
            "details": "亚洲 · 东经100°31′，北纬13°45′"
        }, {
            "country": "缅甸",
            "countryEn": "Myanmar",
            "capital": "内比都",
            "capitalEn": "Naypyidaw",
            "flag": "mm",
            "details": "亚洲 · 东经96°09′，北纬21°56′"
        }, {
            "country": "马来西亚",
            "countryEn": "Malaysia",
            "capital": "吉隆坡",
            "capitalEn": "Kuala Lumpur",
            "flag": "my",
            "details": "亚洲 · 东经101°42′，北纬3°08′"
        }, {
            "country": "新加坡",
            "countryEn": "Singapore",
            "capital": "新加坡市",
            "capitalEn": "Singapore City",
            "flag": "sg",
            "details": "亚洲 · 东经103°51′，北纬1°17′"
        }, {
            "country": "印度尼西亚",
            "countryEn": "Indonesia",
            "capital": "雅加达",
            "capitalEn": "Jakarta",
            "flag": "id",
            "details": "亚洲 · 东经106°48′，南纬6°10′"
        }, {
            "country": "菲律宾",
            "countryEn": "Philippines",
            "capital": "马尼拉",
            "capitalEn": "Manila",
            "flag": "ph",
            "details": "亚洲 · 东经120°58′，北纬14°35′"
        }, {
            "country": "印度",
            "countryEn": "India",
            "capital": "新德里",
            "capitalEn": "New Delhi",
            "flag": "in",
            "details": "亚洲 · 东经77°12′，北纬28°36′"
        }, {
            "country": "巴基斯坦",
            "countryEn": "Pakistan",
            "capital": "伊斯兰堡",
            "capitalEn": "Islamabad",
            "flag": "pk",
            "details": "亚洲 · 东经73°04′，北纬33°43′"
        }, {
            "country": "孟加拉国",
            "countryEn": "Bangladesh",
            "capital": "达卡",
            "capitalEn": "Dhaka",
            "flag": "bd",
            "details": "亚洲 · 东经90°24′，北纬23°42′"
        }, {
            "country": "尼泊尔",
            "countryEn": "Nepal",
            "capital": "加德满都",
            "capitalEn": "Kathmandu",
            "flag": "np",
            "details": "亚洲 · 东经85°19′，北纬27°42′"
        }, {
            "country": "不丹",
            "countryEn": "Bhutan",
            "capital": "廷布",
            "capitalEn": "Thimphu",
            "flag": "bt",
            "details": "亚洲 · 东经89°39′，北纬27°32′"
        }, {
            "country": "马尔代夫",
            "countryEn": "Maldives",
            "capital": "马累",
            "capitalEn": "Male",
            "flag": "mv",
            "details": "亚洲 · 东经73°30′，北纬4°10′"
        }, {
            "country": "斯里兰卡",
            "countryEn": "Sri Lanka",
            "capital": "科伦坡",
            "capitalEn": "Colombo",
            "flag": "lk",
            "details": "亚洲 · 东经79°51′，北纬6°56′"
        }, {
            "country": "哈萨克斯坦",
            "countryEn": "Kazakhstan",
            "capital": "努尔苏丹",
            "capitalEn": "Nur-Sultan",
            "flag": "kz",
            "details": "亚洲 · 东经71°22′，北纬51°10′"
        }, {
            "country": "吉尔吉斯斯坦",
            "countryEn": "Kyrgyzstan",
            "capital": "比什凯克",
            "capitalEn": "Bishkek",
            "flag": "kg",
            "details": "亚洲 · 东经74°36′，北纬42°54′"
        }, {
            "country": "塔吉克斯坦",
            "countryEn": "Tajikistan",
            "capital": "杜尚别",
            "capitalEn": "Dushanbe",
            "flag": "tj",
            "details": "亚洲 · 东经68°46′，北纬38°34′"
        }, {
            "country": "乌兹别克斯坦",
            "countryEn": "Uzbekistan",
            "capital": "塔什干",
            "capitalEn": "Tashkent",
            "flag": "uz",
            "details": "亚洲 · 东经69°14′，北纬41°26′"
        }, {
            "country": "土库曼斯坦",
            "countryEn": "Turkmenistan",
            "capital": "阿什哈巴德",
            "capitalEn": "Ashgabat",
            "flag": "tm",
            "details": "亚洲 · 东经58°23′，北纬37°58′"
        }, {
            "country": "伊朗",
            "countryEn": "Iran",
            "capital": "德黑兰",
            "capitalEn": "Tehran",
            "flag": "ir",
            "details": "亚洲 · 东经51°26′，北纬35°40′"
        }, {
            "country": "伊拉克",
            "countryEn": "Iraq",
            "capital": "巴格达",
            "capitalEn": "Baghdad",
            "flag": "iq",
            "details": "亚洲 · 东经44°22′，北纬33°22′"
        }, {
            "country": "叙利亚",
            "countryEn": "Syria",
            "capital": "大马士革",
            "capitalEn": "Damascus",
            "flag": "sy",
            "details": "亚洲 · 东经36°18′，北纬33°30′"
        }, {
            "country": "黎巴嫩",
            "countryEn": "Lebanon",
            "capital": "贝鲁特",
            "capitalEn": "Beirut",
            "flag": "lb",
            "details": "亚洲 · 东经35°30′，北纬33°54′"
        }, {
            "country": "以色列",
            "countryEn": "Israel",
            "capital": "耶路撒冷（国际社会普遍承认）",
            "capitalEn": "Jerusalem",
            "flag": "il",
            "details": "亚洲 · 东经35°13′，北纬31°47′"
        }, {
            "country": "巴勒斯坦",
            "countryEn": "Palestine",
            "capital": "耶路撒冷（巴勒斯坦国法定首都）",
            "capitalEn": "Jerusalem",
            "flag": "ps",
            "details": "亚洲 · 地区坐标涵盖东经34°43′ - 35°30′，北纬31°30′ - 32°33′"
        }, {
            "country": "约旦",
            "countryEn": "Jordan",
            "capital": "安曼",
            "capitalEn": "Amman",
            "flag": "jo",
            "details": "亚洲 · 东经35°56′，北纬31°56′"
        }, {
            "country": "沙特阿拉伯",
            "countryEn": "Saudi Arabia",
            "capital": "利雅得",
            "capitalEn": "Riyadh",
            "flag": "sa",
            "details": "亚洲 · 东经46°43′，北纬24°41′"
        }, {
            "country": "巴林",
            "countryEn": "Bahrain",
            "capital": "麦纳麦",
            "capitalEn": "Manama",
            "flag": "bh",
            "details": "亚洲 · 东经51°33′，北纬26°13′"
        }, {
            "country": "卡塔尔",
            "countryEn": "Qatar",
            "capital": "多哈",
            "capitalEn": "Doha",
            "flag": "qa",
            "details": "亚洲 · 东经51°32′，北纬25°15′"
        }, {
            "country": "阿联酋",
            "countryEn": "United Arab Emirates",
            "capital": "阿布扎比",
            "capitalEn": "Abu Dhabi",
            "flag": "ae",
            "details": "亚洲 · 东经54°22′，北纬24°28′"
        }, {
            "country": "阿曼",
            "countryEn": "Oman",
            "capital": "马斯喀特",
            "capitalEn": "Muscat",
            "flag": "om",
            "details": "亚洲 · 东经58°35′，北纬23°38′"
        }, {
            "country": "也门",
            "countryEn": "Yemen",
            "capital": "萨那",
            "capitalEn": "Sana'a",
            "flag": "ye",
            "details": "亚洲 · 东经44°12′，北纬15°23′"
        }, {
            "country": "科威特",
            "countryEn": "Kuwait",
            "capital": "科威特城",
            "capitalEn": "Kuwait City",
            "flag": "kw",
            "details": "亚洲 · 东经47°58′，北纬29°20′"
        }]
    },
    europe: {
        name: "欧洲",
        nameEn: "Europe",
        countries: [{
            "country": "英国",
            "countryEn": "United Kingdom",
            "capital": "伦敦",
            "capitalEn": "London",
            "flag": "gb",
            "details": "欧洲 · 西经0°07′，北纬51°30′"
        }, {
            "country": "阿尔巴尼亚",
            "countryEn": "Albania",
            "capital": "地拉那",
            "capitalEn": "Tirana",
            "flag": "al",
            "details": "欧洲 · 东经19°49′，北纬41°18′"
        }, {
            "country": "爱尔兰",
            "countryEn": "Ireland",
            "capital": "都柏林",
            "capitalEn": "Dublin",
            "flag": "ie",
            "details": "欧洲 · 西经6°15′，北纬53°20′"
        }, {
            "country": "爱沙尼亚",
            "countryEn": "Estonia",
            "capital": "塔林",
            "capitalEn": "Tallinn",
            "flag": "ee",
            "details": "欧洲 · 东经24°48′，北纬59°26′"
        }, {
            "country": "安道尔",
            "countryEn": "Andorra",
            "capital": "安道尔城",
            "capitalEn": "Andorra la Vella",
            "flag": "ad",
            "details": "欧洲 · 东经1°31′，北纬42°30′"
        }, {
            "country": "奥地利",
            "countryEn": "Austria",
            "capital": "维也纳",
            "capitalEn": "Vienna",
            "flag": "at",
            "details": "欧洲 · 东经16°22′，北纬48°12′"
        }, {
            "country": "白俄罗斯",
            "countryEn": "Belarus",
            "capital": "明斯克",
            "capitalEn": "Minsk",
            "flag": "by",
            "details": "欧洲 · 东经27°34′，北纬53°54′"
        }, {
            "country": "保加利亚",
            "countryEn": "Bulgaria",
            "capital": "索非亚",
            "capitalEn": "Sofia",
            "flag": "bg",
            "details": "欧洲 · 东经23°19′，北纬42°41′"
        }, {
            "country": "北马其顿",
            "countryEn": "North Macedonia",
            "capital": "斯科普里",
            "capitalEn": "Skopje",
            "flag": "mk",
            "details": "欧洲 · 东经21°26′，北纬41°57′"
        }, {
            "country": "比利时",
            "countryEn": "Belgium",
            "capital": "布鲁塞尔",
            "capitalEn": "Brussels",
            "flag": "be",
            "details": "欧洲 · 东经4°21′，北纬50°51′"
        }, {
            "country": "冰岛",
            "countryEn": "Iceland",
            "capital": "雷克雅未克",
            "capitalEn": "Reykjavik",
            "flag": "is",
            "details": "欧洲 · 西经21°56′，北纬64°09′"
        }, {
            "country": "波黑",
            "countryEn": "Bosnia and Herzegovina",
            "capital": "萨拉热窝",
            "capitalEn": "Sarajevo",
            "flag": "ba",
            "details": "欧洲 · 东经18°25′，北纬43°52′"
        }, {
            "country": "波兰",
            "countryEn": "Poland",
            "capital": "华沙",
            "capitalEn": "Warsaw",
            "flag": "pl",
            "details": "欧洲 · 东经21°00′，北纬52°13′"
        }, {
            "country": "丹麦",
            "countryEn": "Denmark",
            "capital": "哥本哈根",
            "capitalEn": "Copenhagen",
            "flag": "dk",
            "details": "欧洲 · 东经12°34′，北纬55°40′"
        }, {
            "country": "德国",
            "countryEn": "Germany",
            "capital": "柏林",
            "capitalEn": "Berlin",
            "flag": "de",
            "details": "欧洲 · 东经13°25′，北纬52°31′"
        }, {
            "country": "俄罗斯",
            "countryEn": "Russia",
            "capital": "莫斯科",
            "capitalEn": "Moscow",
            "flag": "ru",
            "details": "欧洲 · 东经37°37′，北纬55°45′"
        }, {
            "country": "法国",
            "countryEn": "France",
            "capital": "巴黎",
            "capitalEn": "Paris",
            "flag": "fr",
            "details": "欧洲 · 东经2°20′，北纬48°51′"
        }, {
            "country": "梵蒂冈",
            "countryEn": "Vatican City State",
            "capital": "梵蒂冈城",
            "capitalEn": "Vatican City",
            "flag": "va",
            "details": "欧洲 · 东经12°27′，北纬41°54′"
        }, {
            "country": "芬兰",
            "countryEn": "Finland",
            "capital": "赫尔辛基",
            "capitalEn": "Helsinki",
            "flag": "fi",
            "details": "欧洲 · 东经24°56′，北纬60°10′"
        }, {
            "country": "荷兰",
            "countryEn": "Netherlands",
            "capital": "阿姆斯特丹",
            "capitalEn": "Amsterdam",
            "flag": "nl",
            "details": "欧洲 · 东经4°53′，北纬52°22′"
        }, {
            "country": "黑山",
            "countryEn": "Montenegro",
            "capital": "波德戈里察",
            "capitalEn": "Podgorica",
            "flag": "me",
            "details": "欧洲 · 东经19°19′，北纬42°26′"
        }, {
            "country": "捷克",
            "countryEn": "Czech Republic",
            "capital": "布拉格",
            "capitalEn": "Prague",
            "flag": "cz",
            "details": "欧洲 · 东经14°25′，北纬50°05′"
        }, {
            "country": "克罗地亚",
            "countryEn": "Croatia",
            "capital": "萨格勒布",
            "capitalEn": "Zagreb",
            "flag": "hr",
            "details": "欧洲 · 东经15°58′，北纬45°48′"
        }, {
            "country": "拉脱维亚",
            "countryEn": "Latvia",
            "capital": "里加",
            "capitalEn": "Riga",
            "flag": "lv",
            "details": "欧洲 · 东经24°06′，北纬56°58′"
        }, {
            "country": "立陶宛",
            "countryEn": "Lithuania",
            "capital": "维尔纽斯",
            "capitalEn": "Vilnius",
            "flag": "lt",
            "details": "欧洲 · 东经25°19′，北纬54°41′"
        }, {
            "country": "列支敦士登",
            "countryEn": "Liechtenstein",
            "capital": "瓦杜兹",
            "capitalEn": "Vaduz",
            "flag": "li",
            "details": "欧洲 · 东经9°52′，北纬47°09′"
        }, {
            "country": "卢森堡",
            "countryEn": "Luxembourg",
            "capital": "卢森堡市",
            "capitalEn": "Luxembourg City",
            "flag": "lu",
            "details": "欧洲 · 东经6°08′，北纬49°36′"
        }, {
            "country": "罗马尼亚",
            "countryEn": "Romania",
            "capital": "布加勒斯特",
            "capitalEn": "Bucharest",
            "flag": "ro",
            "details": "欧洲 · 东经26°06′，北纬44°25′"
        }, {
            "country": "马耳他",
            "countryEn": "Malta",
            "capital": "瓦莱塔",
            "capitalEn": "Valletta",
            "flag": "mt",
            "details": "欧洲 · 东经14°31′，北纬35°54′"
        }, {
            "country": "摩尔多瓦",
            "countryEn": "Moldova",
            "capital": "基希讷乌",
            "capitalEn": "Chisinau",
            "flag": "md",
            "details": "欧洲 · 东经28°55′，北纬47°00′"
        }, {
            "country": "摩纳哥",
            "countryEn": "Monaco",
            "capital": "摩纳哥城",
            "capitalEn": "Monaco-Ville",
            "flag": "mc",
            "details": "欧洲 · 东经7°25′，北纬43°43′"
        }, {
            "country": "挪威",
            "countryEn": "Norway",
            "capital": "奥斯陆",
            "capitalEn": "Oslo",
            "flag": "no",
            "details": "欧洲 · 东经10°45′，北纬59°55′"
        }, {
            "country": "葡萄牙",
            "countryEn": "Portugal",
            "capital": "里斯本",
            "capitalEn": "Lisbon",
            "flag": "pt",
            "details": "欧洲 · 西经9°08′，北纬38°43′"
        }, {
            "country": "瑞典",
            "countryEn": "Sweden",
            "capital": "斯德哥尔摩",
            "capitalEn": "Stockholm",
            "flag": "se",
            "details": "欧洲 · 东经18°03′，北纬59°20′"
        }, {
            "country": "瑞士",
            "countryEn": "Switzerland",
            "capital": "伯尔尼",
            "capitalEn": "Bern",
            "flag": "ch",
            "details": "欧洲 · 东经7°27′，北纬46°57′"
        }, {
            "country": "塞尔维亚",
            "countryEn": "Serbia",
            "capital": "贝尔格莱德",
            "capitalEn": "Belgrade",
            "flag": "rs",
            "details": "欧洲 · 东经20°27′，北纬44°48′"
        }, {
            "country": "塞浦路斯",
            "countryEn": "Cyprus",
            "capital": "尼科西亚",
            "capitalEn": "Nicosia",
            "flag": "cy",
            "details": "欧洲 · 东经33°22′，北纬35°10′"
        }, {
            "country": "圣马力诺",
            "countryEn": "San Marino",
            "capital": "圣马力诺市",
            "capitalEn": "San Marino City",
            "flag": "sm",
            "details": "欧洲 · 东经12°27′，北纬43°55′"
        }, {
            "country": "斯洛伐克",
            "countryEn": "Slovakia",
            "capital": "布拉迪斯拉发",
            "capitalEn": "Bratislava",
            "flag": "sk",
            "details": "欧洲 · 东经17°07′，北纬48°09′"
        }, {
            "country": "斯洛文尼亚",
            "countryEn": "Slovenia",
            "capital": "卢布尔雅那",
            "capitalEn": "Ljubljana",
            "flag": "si",
            "details": "欧洲 · 东经14°31′，北纬46°03′"
        }, {
            "country": "乌克兰",
            "countryEn": "Ukraine",
            "capital": "基辅",
            "capitalEn": "Kiev",
            "flag": "ua",
            "details": "欧洲 · 东经30°31′，北纬50°27′"
        }, {
            "country": "西班牙",
            "countryEn": "Spain",
            "capital": "马德里",
            "capitalEn": "Madrid",
            "flag": "es",
            "details": "欧洲 · 西经3°42′，北纬40°25′"
        }, {
            "country": "希腊",
            "countryEn": "Greece",
            "capital": "雅典",
            "capitalEn": "Athens",
            "flag": "gr",
            "details": "欧洲 · 东经23°43′，北纬37°58′"
        }, {
            "country": "匈牙利",
            "countryEn": "Hungary",
            "capital": "布达佩斯",
            "capitalEn": "Budapest",
            "flag": "hu",
            "details": "欧洲 · 东经19°05′，北纬47°29′"
        }, {
            "country": "意大利",
            "countryEn": "Italy",
            "capital": "罗马",
            "capitalEn": "Rome",
            "flag": "it",
            "details": "欧洲 · 东经12°29′，北纬41°54′"
        }]
    },
    africa: {
        name: "非洲",
        nameEn: "Africa",
        countries: [{
            "country": "阿尔及利亚",
            "countryEn": "Algeria",
            "capital": "阿尔及尔",
            "capitalEn": "Algiers",
            "flag": "dz",
            "details": "非洲 · 东经3°08′，北纬36°42′"
        }, {
            "country": "埃及",
            "countryEn": "Egypt",
            "capital": "开罗",
            "capitalEn": "Cairo",
            "flag": "eg",
            "details": "非洲 · 东经31°15′，北纬30°03′"
        }, {
            "country": "埃塞俄比亚",
            "countryEn": "Ethiopia",
            "capital": "亚的斯亚贝巴",
            "capitalEn": "Addis Ababa",
            "flag": "et",
            "details": "非洲 · 东经38°42′，北纬9°02′"
        }, {
            "country": "安哥拉",
            "countryEn": "Angola",
            "capital": "罗安达",
            "capitalEn": "Luanda",
            "flag": "ao",
            "details": "非洲 · 东经13°30′，南纬8°50′"
        }, {
            "country": "贝宁",
            "countryEn": "Benin",
            "capital": "波多诺伏（官方首都）、科托努（实际政府所在地）",
            "capitalEn": "Porto - Novo (official), Cotonou (seat of government)",
            "flag": "bj",
            "details": "非洲 · 东经2°30′，北纬6°30′"
        }, {
            "country": "博茨瓦纳",
            "countryEn": "Botswana",
            "capital": "哈博罗内",
            "capitalEn": "Gaborone",
            "flag": "bw",
            "details": "非洲 · 东经25°55′，南纬24°45′"
        }, {
            "country": "布基纳法索",
            "countryEn": "Burkina Faso",
            "capital": "瓦加杜古",
            "capitalEn": "Ouagadougou",
            "flag": "bf",
            "details": "非洲 · 西经1°31′，北纬12°23′"
        }, {
            "country": "布隆迪",
            "countryEn": "Burundi",
            "capital": "布琼布拉",
            "capitalEn": "Bujumbura",
            "flag": "bi",
            "details": "非洲 · 东经29°22′，南纬3°22′"
        }, {
            "country": "赤道几内亚",
            "countryEn": "Equatorial Guinea",
            "capital": "马拉博",
            "capitalEn": "Malabo",
            "flag": "gq",
            "details": "非洲 · 东经8°47′，北纬3°45′"
        }, {
            "country": "多哥",
            "countryEn": "Togo",
            "capital": "洛美",
            "capitalEn": "Lomé",
            "flag": "tg",
            "details": "非洲 · 东经1°13′，北纬6°08′"
        }, {
            "country": "厄立特里亚",
            "countryEn": "Eritrea",
            "capital": "阿斯马拉",
            "capitalEn": "Asmara",
            "flag": "er",
            "details": "非洲 · 东经38°54′，北纬15°17′"
        }, {
            "country": "佛得角",
            "countryEn": "Cape Verde",
            "capital": "普拉亚",
            "capitalEn": "Praia",
            "flag": "cv",
            "details": "非洲 · 西经23°31′，北纬14°55′"
        }, {
            "country": "冈比亚",
            "countryEn": "Gambia",
            "capital": "班珠尔",
            "capitalEn": "Banjul",
            "flag": "gm",
            "details": "非洲 · 西经16°39′，北纬13°28′"
        }, {
            "country": "刚果（布）",
            "countryEn": "Republic of the Congo",
            "capital": "布拉柴维尔",
            "capitalEn": "Brazzaville",
            "flag": "cg",
            "details": "非洲 · 东经15°17′，南纬4°16′"
        }, {
            "country": "刚果（金）",
            "countryEn": "Democratic Republic of the Congo",
            "capital": "金沙萨",
            "capitalEn": "Kinshasa",
            "flag": "cd",
            "details": "非洲 · 东经15°18′，南纬4°19′"
        }, {
            "country": "吉布提",
            "countryEn": "Djibouti",
            "capital": "吉布提市",
            "capitalEn": "Djibouti City",
            "flag": "dj",
            "details": "非洲 · 东经43°09′，北纬11°36′"
        }, {
            "country": "几内亚",
            "countryEn": "Guinea",
            "capital": "科纳克里",
            "capitalEn": "Conakry",
            "flag": "gn",
            "details": "非洲 · 西经13°43′，北纬9°31′"
        }, {
            "country": "几内亚比绍",
            "countryEn": "Guinea - Bissau",
            "capital": "比绍",
            "capitalEn": "Bissau",
            "flag": "gw",
            "details": "非洲 · 西经15°35′，北纬11°51′"
        }, {
            "country": "加纳",
            "countryEn": "Ghana",
            "capital": "阿克拉",
            "capitalEn": "Accra",
            "flag": "gh",
            "details": "非洲 · 西经0°15′，北纬5°33′"
        }, {
            "country": "加蓬",
            "countryEn": "Gabon",
            "capital": "利伯维尔",
            "capitalEn": "Libreville",
            "flag": "ga",
            "details": "非洲 · 东经9°27′，北纬0°23′"
        }, {
            "country": "津巴布韦",
            "countryEn": "Zimbabwe",
            "capital": "哈拉雷",
            "capitalEn": "Harare",
            "flag": "zw",
            "details": "非洲 · 东经31°03′，南纬17°49′"
        }, {
            "country": "喀麦隆",
            "countryEn": "Cameroon",
            "capital": "雅温得",
            "capitalEn": "Yaoundé",
            "flag": "cm",
            "details": "非洲 · 东经11°31′，北纬3°52′"
        }, {
            "country": "科摩罗",
            "countryEn": "Comoros",
            "capital": "莫罗尼",
            "capitalEn": "Moroni",
            "flag": "km",
            "details": "非洲 · 东经43°16′，南纬11°40′"
        }, {
            "country": "科特迪瓦",
            "countryEn": "Côte d'Ivoire",
            "capital": "亚穆苏克罗（政治首都）、阿比让（经济首都）",
            "capitalEn": "Yamoussoukro (political), Abidjan (economic)",
            "flag": "ci",
            "details": "非洲 · 西经4°00′，北纬6°00′"
        }, {
            "country": "肯尼亚",
            "countryEn": "Kenya",
            "capital": "内罗毕",
            "capitalEn": "Nairobi",
            "flag": "ke",
            "details": "非洲 · 东经36°49′，南纬1°17′"
        }, {
            "country": "莱索托",
            "countryEn": "Lesotho",
            "capital": "马塞卢",
            "capitalEn": "Maseru",
            "flag": "ls",
            "details": "非洲 · 东经27°30′，南纬29°20′"
        }, {
            "country": "利比里亚",
            "countryEn": "Liberia",
            "capital": "蒙罗维亚",
            "capitalEn": "Monrovia",
            "flag": "lr",
            "details": "非洲 · 西经10°48′，北纬6°19′"
        }, {
            "country": "利比亚",
            "countryEn": "Libya",
            "capital": "的黎波里",
            "capitalEn": "Tripoli",
            "flag": "ly",
            "details": "非洲 · 东经13°11′，北纬32°54′"
        }, {
            "country": "卢旺达",
            "countryEn": "Rwanda",
            "capital": "基加利",
            "capitalEn": "Kigali",
            "flag": "rw",
            "details": "非洲 · 东经30°04′，南纬1°57′"
        }, {
            "country": "马达加斯加",
            "countryEn": "Madagascar",
            "capital": "塔那那利佛",
            "capitalEn": "Antananarivo",
            "flag": "mg",
            "details": "非洲 · 东经47°30′，南纬18°58′"
        }, {
            "country": "马拉维",
            "countryEn": "Malawi",
            "capital": "利隆圭",
            "capitalEn": "Lilongwe",
            "flag": "mw",
            "details": "非洲 · 东经33°48′，南纬13°59′"
        }, {
            "country": "马里",
            "countryEn": "Mali",
            "capital": "巴马科",
            "capitalEn": "Bamako",
            "flag": "ml",
            "details": "非洲 · 西经8°00′，北纬12°39′"
        }, {
            "country": "毛里求斯",
            "countryEn": "Mauritius",
            "capital": "路易港",
            "capitalEn": "Port Louis",
            "flag": "mu",
            "details": "非洲 · 东经57°30′，南纬20°10′"
        }, {
            "country": "毛里塔尼亚",
            "countryEn": "Mauritania",
            "capital": "努瓦克肖特",
            "capitalEn": "Nouakchott",
            "flag": "mr",
            "details": "非洲 · 西经15°58′，北纬18°06′"
        }, {
            "country": "摩洛哥",
            "countryEn": "Morocco",
            "capital": "拉巴特",
            "capitalEn": "Rabat",
            "flag": "ma",
            "details": "非洲 · 西经6°50′，北纬34°02′"
        }, {
            "country": "莫桑比克",
            "countryEn": "Mozambique",
            "capital": "马普托",
            "capitalEn": "Maputo",
            "flag": "mz",
            "details": "非洲 · 东经32°35′，南纬25°58′"
        }, {
            "country": "纳米比亚",
            "countryEn": "Namibia",
            "capital": "温得和克",
            "capitalEn": "Windhoek",
            "flag": "na",
            "details": "非洲 · 东经17°06′，南纬22°34′"
        }, {
            "country": "南非",
            "countryEn": "South Africa",
            "capital": "行政首都为比勒陀利亚、立法首都为开普敦、司法首都为布隆方丹",
            "capitalEn": "Pretoria (administrative), Cape Town (legislative), Bloemfontein (judicial)",
            "flag": "za",
            "details": "非洲 · 东经18°26′，南纬25°46′"
        }, {
            "country": "南苏丹",
            "countryEn": "South Sudan",
            "capital": "朱巴",
            "capitalEn": "Juba",
            "flag": "ss",
            "details": "非洲 · 东经31°36′，北纬4°51′"
        }, {
            "country": "尼日尔",
            "countryEn": "Niger",
            "capital": "尼亚美",
            "capitalEn": "Niamey",
            "flag": "ne",
            "details": "非洲 · 东经2°07′，北纬13°31′"
        }, {
            "country": "尼日利亚",
            "countryEn": "Nigeria",
            "capital": "阿布贾",
            "capitalEn": "Abuja",
            "flag": "ng",
            "details": "非洲 · 东经7°24′，北纬9°05′"
        }, {
            "country": "塞拉利昂",
            "countryEn": "Sierra Leone",
            "capital": "弗里敦",
            "capitalEn": "Freetown",
            "flag": "sl",
            "details": "非洲 · 西经13°14′，北纬8°30′"
        }, {
            "country": "塞内加尔",
            "countryEn": "Senegal",
            "capital": "达喀尔",
            "capitalEn": "Dakar",
            "flag": "sn",
            "details": "非洲 · 西经17°27′，北纬14°40′"
        }, {
            "country": "塞舌尔",
            "countryEn": "Seychelles",
            "capital": "维多利亚",
            "capitalEn": "Victoria",
            "flag": "sc",
            "details": "非洲 · 东经55°28′，南纬4°37′"
        }, {
            "country": "圣多美和普林西比",
            "countryEn": "Sao Tome and Principe",
            "capital": "圣多美",
            "capitalEn": "Sao Tome",
            "flag": "st",
            "details": "非洲 · 东经6°44′，北纬0°19′"
        }, {
            "country": "斯威士兰",
            "countryEn": "Eswatini",
            "capital": "姆巴巴内",
            "capitalEn": "Mbabane",
            "flag": "sz",
            "details": "非洲 · 东经31°08′，南纬26°19′"
        }, {
            "country": "苏丹",
            "countryEn": "Sudan",
            "capital": "喀土穆",
            "capitalEn": "Khartoum",
            "flag": "sd",
            "details": "非洲 · 东经32°32′，北纬15°36′"
        }, {
            "country": "索马里",
            "countryEn": "Somalia",
            "capital": "摩加迪沙",
            "capitalEn": "Mogadishu",
            "flag": "so",
            "details": "非洲 · 东经45°21′，北纬2°02′"
        }, {
            "country": "坦桑尼亚",
            "countryEn": "Tanzania",
            "capital": "多多马（首都）、达累斯萨拉姆（经济中心）",
            "capitalEn": "Dodoma (capital), Dar es Salaam (economic center)",
            "flag": "tz",
            "details": "非洲 · 东经39°18′，南纬6°10′"
        }, {
            "country": "突尼斯",
            "countryEn": "Tunisia",
            "capital": "突尼斯市",
            "capitalEn": "Tunis",
            "flag": "tn",
            "details": "非洲・东经 10°11′，北纬 36°48′"
        }, {
            "country": "乌干达",
            "countryEn": "Uganda",
            "capital": "坎帕拉",
            "capitalEn": "Kampala",
            "flag": "ug",
            "details": "非洲・东经 32°35′，北纬 0°19′"
        }, {
            "country": "赞比亚",
            "countryEn": "Zambia",
            "capital": "卢萨卡",
            "capitalEn": "Lusaka",
            "flag": "zm",
            "details": "非洲・东经 28°18′，南纬 15°25′"
        }]
    },
    northAmerica: {
        name: "北美洲",
        nameEn: "North America",
        countries: [{
            country: "美国",
            countryEn: "United States",
            capital: "华盛顿",
            capitalEn: "Washington, D.C.",
            flag: "us",
            details: "北美洲 · 西经77°02′，北纬38°53′"
        }, {
            country: "加拿大",
            countryEn: "Canada",
            capital: "渥太华",
            capitalEn: "Ottawa",
            flag: "ca",
            details: "北美洲 · 西经75°42′，北纬45°25′"
        }, {
            "country": "安提瓜和巴布达",
            "countryEn": "Antigua and Barbuda",
            "capital": "圣约翰",
            "capitalEn": "St. John's",
            "flag": "ag",
            "details": "北美洲 · 西经61°50′，北纬17°07′"
        }, {
            "country": "巴巴多斯",
            "countryEn": "Barbados",
            "capital": "布里奇顿",
            "capitalEn": "Bridgetown",
            "flag": "bb",
            "details": "北美洲 · 西经59°37′，北纬13°06′"
        }, {
            "country": "巴哈马",
            "countryEn": "Bahamas",
            "capital": "拿骚",
            "capitalEn": "Nassau",
            "flag": "bs",
            "details": "北美洲 · 西经77°21′，北纬25°05′"
        }, {
            "country": "巴拿马",
            "countryEn": "Panama",
            "capital": "巴拿马城",
            "capitalEn": "Panama City",
            "flag": "pa",
            "details": "北美洲 · 西经79°32′，北纬8°58′"
        }, {
            "country": "伯利兹",
            "countryEn": "Belize",
            "capital": "贝尔莫潘",
            "capitalEn": "Belmopan",
            "flag": "bz",
            "details": "北美洲 · 西经88°46′，北纬17°15′"
        }, {
            "country": "多米尼加",
            "countryEn": "Dominica",
            "capital": "罗索",
            "capitalEn": "Roseau",
            "flag": "dm",
            "details": "北美洲 · 西经61°24′，北纬15°18′"
        }, {
            "country": "多米尼加共和国",
            "countryEn": "Dominican Republic",
            "capital": "圣多明各",
            "capitalEn": "Santo Domingo",
            "flag": "do",
            "details": "北美洲 · 西经69°54′，北纬18°28′"
        }, {
            "country": "格林纳达",
            "countryEn": "Grenada",
            "capital": "圣乔治",
            "capitalEn": "St. George's",
            "flag": "gd",
            "details": "北美洲 · 西经61°45′，北纬12°03′"
        }, {
            "country": "哥斯达黎加",
            "countryEn": "Costa Rica",
            "capital": "圣何塞",
            "capitalEn": "San Jose",
            "flag": "cr",
            "details": "北美洲 · 西经84°05′，北纬9°56′"
        }, {
            "country": "古巴",
            "countryEn": "Cuba",
            "capital": "哈瓦那",
            "capitalEn": "Havana",
            "flag": "cu",
            "details": "北美洲 · 西经82°23′，北纬23°08′"
        }, {
            "country": "海地",
            "countryEn": "Haiti",
            "capital": "太子港",
            "capitalEn": "Port - au - Prince",
            "flag": "ht",
            "details": "北美洲 · 西经72°20′，北纬18°32′"
        }, {
            "country": "洪都拉斯",
            "countryEn": "Honduras",
            "capital": "特古西加尔巴",
            "capitalEn": "Tegucigalpa",
            "flag": "hn",
            "details": "北美洲 · 西经87°13′，北纬14°06′"
        }, {
            "country": "墨西哥",
            "countryEn": "Mexico",
            "capital": "墨西哥城",
            "capitalEn": "Mexico City",
            "flag": "mx",
            "details": "北美洲 · 西经99°09′，北纬19°26′"
        }, {
            "country": "尼加拉瓜",
            "countryEn": "Nicaragua",
            "capital": "马那瓜",
            "capitalEn": "Managua",
            "flag": "ni",
            "details": "北美洲 · 西经86°15′，北纬12°09′"
        }, {
            "country": "萨尔瓦多",
            "countryEn": "El Salvador",
            "capital": "圣萨尔瓦多",
            "capitalEn": "San Salvador",
            "flag": "sv",
            "details": "北美洲 · 西经89°12′，北纬13°42′"
        }, {
            "country": "圣基茨和尼维斯",
            "countryEn": "Saint Kitts and Nevis",
            "capital": "巴斯特尔",
            "capitalEn": "Basseterre",
            "flag": "kn",
            "details": "北美洲 · 西经62°43′，北纬17°18′"
        }, {
            "country": "圣卢西亚",
            "countryEn": "Saint Lucia",
            "capital": "卡斯特里",
            "capitalEn": "Castries",
            "flag": "lc",
            "details": "北美洲 · 西经60°59′，北纬14°01′"
        }, {
            "country": "圣文森特和格林纳丁斯",
            "countryEn": "Saint Vincent and the Grenadines",
            "capital": "金斯敦",
            "capitalEn": "Kingstown",
            "flag": "vc",
            "details": "北美洲 · 西经61°14′，北纬13°10′"
        }, {
            "country": "特立尼达和多巴哥",
            "countryEn": "Trinidad and Tobago",
            "capital": "西班牙港",
            "capitalEn": "Port of Spain",
            "flag": "tt",
            "details": "北美洲 · 西经61°31′，北纬10°39′"
        }]
    },
    southAmerica: {
        name: "南美洲",
        nameEn: "South America",
        countries: [{
            "country": "阿根廷",
            "countryEn": "Argentina",
            "capital": "布宜诺斯艾利斯",
            "capitalEn": "Buenos Aires",
            "flag": "ar",
            "details": "南美洲 · 西经58°22′，南纬34°36′"
        }, {
            "country": "巴拉圭",
            "countryEn": "Paraguay",
            "capital": "亚松森",
            "capitalEn": "Asunción",
            "flag": "py",
            "details": "南美洲 · 西经57°40′，南纬25°16′"
        }, {
            "country": "巴西",
            "countryEn": "Brazil",
            "capital": "巴西利亚",
            "capitalEn": "Brasilia",
            "flag": "br",
            "details": "南美洲 · 西经47°56′，南纬15°47′"
        }, {
            "country": "玻利维亚",
            "countryEn": "Bolivia",
            "capital": "拉巴斯（行政首都）、苏克雷（法定首都）",
            "capitalEn": "La Paz (administrative), Sucre (constitutional)",
            "flag": "bo",
            "details": "南美洲 · 西经68°10′，南纬16°30′"
        }, {
            "country": "厄瓜多尔",
            "countryEn": "Ecuador",
            "capital": "基多",
            "capitalEn": "Quito",
            "flag": "ec",
            "details": "南美洲 · 西经78°30′，南纬0°13′"
        }, {
            "country": "哥伦比亚",
            "countryEn": "Colombia",
            "capital": "波哥大",
            "capitalEn": "Bogotá",
            "flag": "co",
            "details": "南美洲 · 西经74°05′，北纬4°36′"
        }, {
            "country": "圭亚那",
            "countryEn": "Guyana",
            "capital": "乔治敦",
            "capitalEn": "Georgetown",
            "flag": "gy",
            "details": "南美洲 · 西经58°10′，北纬6°48′"
        }, {
            "country": "秘鲁",
            "countryEn": "Peru",
            "capital": "利马",
            "capitalEn": "Lima",
            "flag": "pe",
            "details": "南美洲 · 西经77°03′，南纬12°03′"
        }, {
            "country": "苏里南",
            "countryEn": "Suriname",
            "capital": "帕拉马里博",
            "capitalEn": "Paramaribo",
            "flag": "sr",
            "details": "南美洲 · 西经55°10′，北纬5°50′"
        }, {
            "country": "委内瑞拉",
            "countryEn": "Venezuela",
            "capital": "加拉加斯",
            "capitalEn": "Caracas",
            "flag": "ve",
            "details": "南美洲 · 西经66°58′，北纬10°30′"
        }, {
            "country": "乌拉圭",
            "countryEn": "Uruguay",
            "capital": "蒙得维的亚",
            "capitalEn": "Montevideo",
            "flag": "uy",
            "details": "南美洲 · 西经56°11′，南纬34°53′"
        }, {
            "country": "智利",
            "countryEn": "Chile",
            "capital": "圣地亚哥",
            "capitalEn": "Santiago",
            "flag": "cl",
            "details": "南美洲 · 西经70°40′，南纬33°27′"
        }]
    },
    oceania: {
        name: "大洋洲",
        nameEn: "Oceania",
        countries: [{
            "country": "澳大利亚",
            "countryEn": "Australia",
            "capital": "堪培拉",
            "capitalEn": "Canberra",
            "flag": "au",
            "details": "大洋洲 · 东经149°08′，南纬35°17′"
        }, {
            "country": "巴布亚新几内亚",
            "countryEn": "Papua New Guinea",
            "capital": "莫尔兹比港",
            "capitalEn": "Port Moresby",
            "flag": "pg",
            "details": "大洋洲 · 东经147°10′，南纬9°30′"
        }, {
            "country": "斐济",
            "countryEn": "Fiji",
            "capital": "苏瓦",
            "capitalEn": "Suva",
            "flag": "fj",
            "details": "大洋洲 · 东经178°26′，南纬18°08′"
        }, {
            "country": "基里巴斯",
            "countryEn": "Kiribati",
            "capital": "塔拉瓦",
            "capitalEn": "Tarawa",
            "flag": "ki",
            "details": "大洋洲 · 东经172°58′，北纬1°25′"
        }, {
            "country": "库克群岛",
            "countryEn": "Cook Islands",
            "capital": "阿瓦鲁阿",
            "capitalEn": "Avarua",
            "flag": "ck",
            "details": "大洋洲 · 西经159°46′，南纬21°14′"
        }, {
            "country": "马绍尔群岛",
            "countryEn": "Marshall Islands",
            "capital": "马朱罗",
            "capitalEn": "Majuro",
            "flag": "mh",
            "details": "大洋洲 · 东经171°08′，北纬7°07′"
        }, {
            "country": "密克罗尼西亚联邦",
            "countryEn": "Federated States of Micronesia",
            "capital": "帕利基尔",
            "capitalEn": "Palikir",
            "flag": "fm",
            "details": "大洋洲 · 东经158°15′，北纬6°54′"
        }, {
            "country": "瑙鲁",
            "countryEn": "Nauru",
            "capital": "亚伦",
            "capitalEn": "Yaren",
            "flag": "nr",
            "details": "大洋洲 · 东经166°56′，南纬0°32′"
        }, {
            "country": "纽埃",
            "countryEn": "Niue",
            "capital": "阿洛菲",
            "capitalEn": "Alofi",
            "flag": "nu",
            "details": "大洋洲 · 西经169°52′，南纬19°02′"
        }, {
            "country": "帕劳",
            "countryEn": "Palau",
            "capital": "梅莱凯奥克",
            "capitalEn": "Melekeok",
            "flag": "pw",
            "details": "大洋洲 · 东经134°38′，北纬7°30′"
        }, {
            "country": "萨摩亚",
            "countryEn": "Samoa",
            "capital": "阿皮亚",
            "capitalEn": "Apia",
            "flag": "ws",
            "details": "大洋洲 · 西经171°47′，南纬13°50′"
        }, {
            "country": "所罗门群岛",
            "countryEn": "Solomon Islands",
            "capital": "霍尼亚拉",
            "capitalEn": "Honiara",
            "flag": "sb",
            "details": "大洋洲 · 东经159°57′，南纬9°26′"
        }, {
            "country": "汤加",
            "countryEn": "Tonga",
            "capital": "努库阿洛法",
            "capitalEn": "Nuku'alofa",
            "flag": "to",
            "details": "大洋洲 · 西经175°12′，南纬21°08′"
        }, {
            "country": "图瓦卢",
            "countryEn": "Tuvalu",
            "capital": "富纳富提",
            "capitalEn": "Funafuti",
            "flag": "tv",
            "details": "大洋洲 · 东经179°13′，南纬8°30′"
        }, {
            "country": "瓦努阿图",
            "countryEn": "Vanuatu",
            "capital": "维拉港",
            "capitalEn": "Port - Vila",
            "flag": "vu",
            "details": "大洋洲 · 东经168°18′，南纬17°45′"
        }]
    },
};