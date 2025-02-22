const colors = [{
    "gray": [
        ["slate--100", "#f5f6f8", "245, 246, 248", "210, 40%, 96.5%"],
        ["slate-0", "#fafbfc", "250, 251, 252", "210, 20%, 99%"],
        ["slate-50", "#f8fafc", "248, 250, 252", "210, 40%, 98%"],
        ["slate-100", "#f1f5f9", "241, 245, 249", "210, 40%, 96%"],
        ["slate-200", "#e2e8f0", "226, 232, 240", "214, 32%, 91%"],
        ["slate-300", "#cbd5e1", "203, 213, 225", "216, 32%, 84%"],
        ["slate-400", "#94a3b8", "148, 163, 184", "215, 20%, 65%"],
        ["slate-500", "#64748b", "100, 116, 139", "215, 16%, 47%"],
        ["slate-600", "#475569", "71, 85, 105", "215, 19%, 35%"],
        ["slate-700", "#334155", "51, 65, 85", "215, 25%, 27%"],
        ["slate-800", "#1e293b", "30, 41, 59", "217, 33%, 17%"],
        ["slate-900", "#0f172a", "15, 23, 42", "222, 47%, 11%"],
        ["slate-1000", "#0a0f1d", "10, 15, 29", "222, 50%, 8%"],
    ]
}, {
    "blue": [
        ["blue--100", "#fafcff", "250, 252, 255", "213, 100%, 99.5%"],
        ["blue-0", "#f8faff", "248, 250, 255", "213, 100%, 99%"],
        ["blue-50", "#eff6ff", "239, 246, 255", "213, 100%, 97%"],
        ["blue-100", "#dbeafe", "219, 234, 254", "214, 95%, 93%"],
        ["blue-200", "#bfdbfe", "191, 219, 254", "213, 97%, 87%"],
        ["blue-300", "#93c5fd", "147, 197, 253", "212, 96%, 78%"],
        ["blue-400", "#60a5fa", "96, 165, 250", "213, 94%, 68%"],
        ["blue-500", "#3b82f6", "59, 130, 246", "217, 91%, 60%"],
        ["blue-600", "#2563eb", "37, 99, 235", "221, 83%, 53%"],
        ["blue-700", "#1d4ed8", "29, 78, 216", "224, 76%, 48%"],
        ["blue-800", "#1e40af", "30, 64, 175", "226, 71%, 40%"],
        ["blue-900", "#1e3a8a", "30, 58, 138", "224, 64%, 33%"],
        ["blue-1000", "#1e3578", "30, 53, 120", "224, 60%, 29%"],
    ]
}, {
    "green": [
        ["green--100", "#f9fffa", "249, 255, 250", "138, 100%, 99.5%"],
        ["green-0", "#f7fef9", "247, 254, 249", "138, 70%, 99%"],
        ["green-50", "#f0fdf4", "240, 253, 244", "138, 76%, 97%"],
        ["green-100", "#dcfce7", "220, 252, 231", "141, 84%, 93%"],
        ["green-200", "#bbf7d0", "187, 247, 208", "141, 79%, 85%"],
        ["green-300", "#86efac", "134, 239, 172", "142, 77%, 73%"],
        ["green-400", "#4ade80", "74, 222, 128", "142, 69%, 58%"],
        ["green-500", "#22c55e", "34, 197, 94", "142, 71%, 45%"],
        ["green-600", "#16a34a", "22, 163, 74", "142, 76%, 36%"],
        ["green-700", "#15803d", "21, 128, 61", "142, 72%, 29%"],
        ["green-800", "#166534", "22, 101, 52", "142, 64%, 24%"],
        ["green-900", "#14532d", "20, 83, 45", "142, 61%, 20%"],
        ["green-1000", "#124524", "18, 69, 36", "142, 59%, 17%"],
    ]
}, {
    "red": [
        ["red--100", "#fffafa", "255, 250, 250", "0, 100%, 99.5%"],
        ["red-0", "#fff8f8", "255, 248, 248", "0, 80%, 99%"],
        ["red-50", "#fef2f2", "254, 242, 242", "0, 86%, 97%"],
        ["red-100", "#fee2e2", "254, 226, 226", "0, 93%, 94%"],
        ["red-200", "#fecaca", "254, 202, 202", "0, 96%, 89%"],
        ["red-300", "#fca5a5", "252, 165, 165", "0, 94%, 82%"],
        ["red-400", "#f87171", "248, 113, 113", "0, 91%, 71%"],
        ["red-500", "#ef4444", "239, 68, 68", "0, 84%, 60%"],
        ["red-600", "#dc2626", "220, 38, 38", "0, 72%, 51%"],
        ["red-700", "#b91c1c", "185, 28, 28", "0, 74%, 42%"],
        ["red-800", "#991b1b", "153, 27, 27", "0, 70%, 35%"],
        ["red-900", "#7f1d1d", "127, 29, 29", "0, 63%, 31%"],
        ["red-1000", "#6a1717", "106, 23, 23", "0, 64%, 25%"],
    ]
}, {
    "yellow": [
        ["yellow--100", "#fffff9", "255, 255, 249", "55, 100%, 99.5%"],
        ["yellow-0", "#fffef7", "255, 254, 247", "55, 90%, 99%"],
        ["yellow-50", "#fefce8", "254, 252, 232", "55, 92%, 95%"],
        ["yellow-100", "#fef9c3", "254, 249, 195", "55, 97%, 88%"],
        ["yellow-200", "#fef08a", "254, 240, 138", "53, 98%, 77%"],
        ["yellow-300", "#fde047", "253, 224, 71", "48, 96%, 64%"],
        ["yellow-400", "#facc15", "250, 204, 21", "45, 93%, 53%"],
        ["yellow-500", "#eab308", "234, 179, 8", "43, 96%, 47%"],
        ["yellow-600", "#ca8a04", "202, 138, 4", "43, 96%, 40%"],
        ["yellow-700", "#a16207", "161, 98, 7", "43, 91%, 33%"],
        ["yellow-800", "#854d0e", "133, 77, 14", "43, 81%, 29%"],
        ["yellow-900", "#713f12", "113, 63, 18", "43, 72%, 26%"],
        ["yellow-1000", "#5c330e", "92, 51, 14", "43, 73%, 21%"],
    ]
}, {
    "purple": [
        ["purple--100", "#fefcff", "254, 252, 255", "280, 100%, 99.5%"],
        ["purple-0", "#fdfaff", "253, 250, 255", "280, 100%, 99%"],
        ["purple-50", "#faf5ff", "250, 245, 255", "280, 100%, 98%"],
        ["purple-100", "#f3e8ff", "243, 232, 255", "280, 100%, 95%"],
        ["purple-200", "#e9d5ff", "233, 213, 255", "279, 100%, 92%"],
        ["purple-300", "#d8b4fe", "216, 180, 254", "276, 100%, 85%"],
        ["purple-400", "#c084fc", "192, 132, 252", "270, 95%, 75%"],
        ["purple-500", "#a855f7", "168, 85, 247", "266, 90%, 65%"],
        ["purple-600", "#9333ea", "147, 51, 234", "263, 85%, 56%"],
        ["purple-700", "#7e22ce", "126, 34, 206", "263, 70%, 47%"],
        ["purple-800", "#6b21a8", "107, 33, 168", "263, 67%, 39%"],
        ["purple-900", "#581c87", "88, 28, 135", "263, 65%, 32%"],
        ["purple-1000", "#4a1772", "74, 23, 114", "263, 66%, 27%"],
    ]
}, {
    "pink": [
        ["pink--100", "#fffafd", "255, 250, 253", "327, 100%, 99.5%"],
        ["pink-0", "#fff8fb", "255, 248, 251", "327, 70%, 99%"],
        ["pink-50", "#fdf2f8", "253, 242, 248", "327, 73%, 97%"],
        ["pink-100", "#fce7f3", "252, 231, 243", "326, 78%, 95%"],
        ["pink-200", "#fbcfe8", "251, 207, 232", "326, 85%, 90%"],
        ["pink-300", "#f9a8d4", "249, 168, 212", "327, 87%, 82%"],
        ["pink-400", "#f472b6", "244, 114, 182", "326, 85%, 70%"],
        ["pink-500", "#ec4899", "236, 72, 153", "326, 85%, 60%"],
        ["pink-600", "#db2777", "219, 39, 119", "326, 85%, 51%"],
        ["pink-700", "#be185d", "190, 24, 93", "326, 85%, 42%"],
        ["pink-800", "#9d174d", "157, 23, 77", "326, 74%, 35%"],
        ["pink-900", "#831843", "131, 24, 67", "326, 69%, 30%"],
        ["pink-1000", "#6d1438", "109, 20, 56", "326, 69%, 25%"],
    ]
}, {
    "indigo": [
        ["indigo--100", "#f8faff", "248, 250, 255", "226, 100%, 99.5%"],
        ["indigo-0", "#f5f7ff", "245, 247, 255", "226, 100%, 99%"],
        ["indigo-50", "#eef2ff", "238, 242, 255", "226, 100%, 97%"],
        ["indigo-100", "#e0e7ff", "224, 231, 255", "228, 100%, 94%"],
        ["indigo-200", "#c7d2fe", "199, 210, 254", "228, 96%, 89%"],
        ["indigo-300", "#a5b4fc", "165, 180, 252", "230, 94%, 82%"],
        ["indigo-400", "#818cf8", "129, 140, 248", "231, 91%, 74%"],
        ["indigo-500", "#6366f1", "99, 102, 241", "231, 86%, 67%"],
        ["indigo-600", "#4f46e5", "79, 70, 229", "234, 89%, 59%"],
        ["indigo-700", "#4338ca", "67, 56, 202", "235, 66%, 51%"],
        ["indigo-800", "#3730a3", "55, 48, 163", "234, 54%, 41%"],
        ["indigo-900", "#312e81", "49, 46, 129", "235, 47%, 34%"],
        ["indigo-1000", "#29276d", "41, 39, 109", "235, 47%, 29%"],
    ]
}, {
	"ant": [
        ["Primary-6", "#1890ff"],
        ["Red-6", "#f5222d"],
        ["Volcano-6", "#fa541c"],
        ["Orange-6", "#fa8c16"],
        ["Gold-6", "#faad14"],
        ["Yellow-6", "#fadb14"],
        ["Lime-6", "#a0d911"],
        ["Green-6", "#52c41a"],
        ["Cyan-6", "#13c2c2"],
		["DaybreakBlue-6", "#1677ff"],
		["GeekBlue-6", "#2f54eb"],
        ["Purple-6", "#722ed1"],
		["Magenta-6", "#eb2f96"],
    ]
}, {
    "material": [
        ["red-500", "#f44336"],
        ["pink-500", "#e91e63"],
        ["purple-500", "#9c27b0"],
        ["deep-purple-500", "#673ab7"],
        ["indigo-500", "#3f51b5"],
        ["blue-500", "#2196f3"],
        ["light-blue-500", "#03a9f4"],
        ["cyan-500", "#00bcd4"],
        ["teal-500", "#009688"],
        ["green-500", "#4caf50"]
    ]
}, {
    "brand": [
        ["facebook", "#1877f2"],
        ["twitter", "#1da1f2"],
        ["instagram", "#e4405f"],
        ["linkedin", "#0a66c2"],
        ["youtube", "#ff0000"],
        ["github", "#181717"],
        ["dribbble", "#ea4c89"],
        ["behance", "#1769ff"],
        ["pinterest", "#bd081c"],
        ["spotify", "#1db954"]
    ]
}, {
    "chinese": [
        ["朱砂红", "#ff461f"],
        ["玉石青", "#2c9678"],
        ["靛青", "#1661ab"],
        ["胭脂", "#f03752"],
        ["松花绿", "#057748"],
        ["藏青", "#2f2f35"],
        ["琉璃蓝", "#1781b5"],
        ["赭石", "#c35017"],
        ["粉青", "#c8d1d2"],
        ["青瓷", "#1a9b67"]
    ]
}, {
    "seasonal": [
        ["春樱", "#ffd1dc"],      // 柔和的粉色，代表春天樱花
        ["春芽", "#a8e4a0"],      // 嫩绿色，代表春天新芽
        ["夏空", "#87ceeb"],      // 天蓝色，代表夏天晴空
        ["夏阳", "#ffd700"],      // 金黄色，代表夏日阳光
        ["秋叶", "#d2691e"],      // 褐色，代表秋天落叶
        ["秋实", "#daa520"],      // 金色，代表秋天收获
        ["冬雪", "#f0f8ff"],      // 雪白色，代表冬天白雪
        ["冬夜", "#4a4e69"],      // 深蓝灰色，代表冬夜
        ["晨曦", "#ffefd5"],      // 晨光色，代表早晨
        ["暮色", "#483d8b"]       // 深紫色，代表黄昏
    ]
}, {
    "macaron": [
        ["草莓奶昔", "#FFB5B5"],      // 柔和的粉红色
        ["薄荷冰淇淋", "#98DDCA"],    // 清新的薄荷绿
        ["香草奶油", "#FFF4BD"],      // 淡淡的奶油黄
        ["蓝莓慕斯", "#A6CAF0"],      // 温柔的天蓝色
        ["葡萄马卡龙", "#E0BBE4"],    // 淡雅的紫色
        ["蜜桃布丁", "#FFDAB9"],      // 温暖的桃色
        ["抹茶拿铁", "#B4D6B0"],      // 柔和的抹茶绿
        ["焦糖布蕾", "#F4C17B"],      // 温暖的焦糖色
        ["柠檬雪酪", "#FFF6A2"],      // 清新的柠檬黄
        ["树莓慕斯", "#FFB2A7"]       // 甜美的树莓色
    ]
}];