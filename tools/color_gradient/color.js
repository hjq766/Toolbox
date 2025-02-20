const gradients = [{
    "popular": [
        ["极光", "linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)"],
        ["日落", "linear-gradient(45deg, #ff512f, #dd8500)"],
        ["深海", "linear-gradient(45deg, #1a2980, #26d0ce)"],
        ["霓虹紫", "linear-gradient(-45deg, #f953c6, #4a0072)"],
        ["青柠", "linear-gradient(45deg, #96e6a1, #159957)"],
        ["极夜", "linear-gradient(45deg, #0f2027, #203a43, #2c5364)"],
        ["火焰", "linear-gradient(-45deg, #f12711, #f5af19)"],
        ["薄暮", "linear-gradient(60deg, #5f72bd, #9b23ea)"],
        ["青空", "linear-gradient(-225deg, #69EACB 0%, #EACCF8 48%, #6654F1 100%)"],
        ["血橙", "linear-gradient(45deg, #ff416c, #ff4b2b)"],
        ["薄荷", "linear-gradient(to right, #00b09b, #96c93d)"],
        ["蓝莓", "linear-gradient(-225deg, #7085B6 0%, #87A7D9 50%, #DEF3F8 100%)"],
        ["桃粉", "linear-gradient(45deg, #ff9a9e, #F6416C)"],
        ["翡翠", "linear-gradient(45deg, #007991, #78ffd6)"],
        ["紫罗兰", "linear-gradient(-225deg, #A445B2 0%, #D41872 52%, #FF0066 100%)"],
        ["晚霞", "linear-gradient(45deg, #355c7d, #6c5b7b, #c06c84)"],
        ["青玉", "linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%)"],
        ["玫瑰金", "linear-gradient(45deg, #f6d365, #fda085)"],
        ["午夜蓝", "linear-gradient(45deg, #0a2f3d, #1f4e79, #5c6e92)"],
        ["璀璨金", "linear-gradient(45deg, #e3b57e, #b88746, #fdf5a6)"]
    ]
}, {
    "modern": [
        ["霓虹", "linear-gradient(to right, #fc00ff, #00dbde)"],
        ["赛博朋克", "linear-gradient(-225deg, #FF0080, #7928CA, #1A1A1A)"],
        ["科技蓝", "linear-gradient(60deg, #29323c, #485563, #2b5876)"],
        ["未来感", "linear-gradient(-45deg, #6157FF, #EE49FD, #1BB2DD)"],
        ["液态金属", "linear-gradient(60deg, #2C3E50, #BDC3C7, #2C3E50)"],
        ["极简黑", "linear-gradient(45deg, #000000, #434343)"],
        ["电音", "linear-gradient(-45deg, #3B27BA, #E847AE, #13CA91)"],
        ["霓虹灯管", "linear-gradient(to right, #FC466B, #3F5EFB)"],
        ["暗调科技", "linear-gradient(60deg, #0A2342, #283655, #4D648D)"],
        ["玻璃态", "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4))"],
        ["新拟态", "linear-gradient(145deg, #F0F0F0, #CACACA)"],
        ["数字迷雾", "linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%)"],
        ["光速", "linear-gradient(to right, #0F2027, #203A43, #2C5364)"],
        ["矩阵", "linear-gradient(-225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)"],
        ["全息投影", "linear-gradient(60deg, #904e95, #e96443, #904e95)"],
        ["量子隧道", "linear-gradient(-225deg, #3D4E81 0%, #5753C9 48%, #6E7FF3 100%)"],
        ["未来主义", "linear-gradient(to right, #0f0c29, #302b63, #24243e)"],
        ["赛博蓝", "linear-gradient(45deg, #1a1a1a, #00b0ff, #c400ff)"],
        ["虚拟现实", "linear-gradient(135deg, #ff004f, #8e1d8f, #200f5a)"],
        ["数字波", "linear-gradient(-45deg, #002661, #7F5D96, #6C87A1)"]
    ]
}, {
    "nature": [
        ["热带雨林", "linear-gradient(120deg, #20bf55, #01baef)"],
        ["沙漠日落", "linear-gradient(-225deg, #ff8008, #ffc837)"],
        ["极地冰川", "linear-gradient(to right, #4ca1af, #c4e0e5)"],
        ["山峦暮色", "linear-gradient(45deg, #283c86, #45a247)"],
        ["海洋深处", "linear-gradient(-225deg, #2CD8D5 0%, #6B8DD6 48%, #8E37D7 100%)"],
        ["春日樱花", "linear-gradient(45deg, #ffc3a0, #ffafbd)"],
        ["秋叶", "linear-gradient(45deg, #e65c00, #f9d423)"],
        ["薰衣草田", "linear-gradient(45deg, #834d9b, #d04ed6)"],
        ["绿洲", "linear-gradient(45deg, #11998e, #38ef7d)"],
        ["森林晨雾", "linear-gradient(-225deg, #5D9FFF 0%, #B8DCFF 48%, #6BBBFF 100%)"],
        ["火山岩浆", "linear-gradient(45deg, #f12711, #f5af19)"],
        ["北极光", "linear-gradient(-45deg, #56CCF2, #2F80ED, #B2FEFA)"],
        ["红树林", "linear-gradient(to right, #134E5E, #71B280)"],
        ["珊瑚礁", "linear-gradient(-225deg, #2CD8D5 0%, #FF8C8C 48%, #FFD700 100%)"],
        ["雪山日出", "linear-gradient(-225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)"],
        ["草原暮色", "linear-gradient(to right, #215f00, #e4e4d9)"],
        ["瀑布", "linear-gradient(-225deg, #B6CEE8 0%, #F578DC 100%)"],
        ["雨后彩虹", "linear-gradient(to right, #7b2ff7, #fe0197, #ffcb00, #36d7b7)"],
        ["秋风", "linear-gradient(45deg, #ff9a8b, #ff6a88)"],
        ["潮汐", "linear-gradient(120deg, #1e3c72, #2a5298)"]
    ]
}, {
    "special": [
        ["全息幻彩", "linear-gradient(-225deg, #FF057C 0%, #8D0B93 50%, #321575 100%)"],
        ["极光之舞", "linear-gradient(-45deg, #00DBDE, #FC00FF, #00DBDE)"],
        ["霓虹律动", "linear-gradient(-45deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)"],
        ["水晶棱镜", "linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%)"],
        ["彩虹糖果", "linear-gradient(45deg, #FFD26F, #3677FF, #FF2F92)"],
        ["极光幻境", "linear-gradient(-225deg, #69EACB 0%, #EACCF8 48%, #6654F1 100%)"],
        ["钻石光谱", "linear-gradient(-225deg, #BDC2E8 0%, #E6DEE9 48%, #EFE9F4 100%)"],
        ["幻彩玻璃", "linear-gradient(60deg, #abecd6 0%, #fbed96 100%)"],
        ["星光闪烁", "linear-gradient(-225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)"],
        ["梦幻泡泡", "linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%)"],
        ["霓虹之夜", "linear-gradient(45deg, #8EC5FC 0%, #E0C3FC 100%)"],
        ["幻彩极光", "linear-gradient(-225deg, #A8BFFF 0%, #884D80 100%)"],
        ["水晶光束", "linear-gradient(to right, #4481EB 0%, #04BEFE 100%)"],
        ["彩虹之桥", "linear-gradient(-225deg, #9EFBD3 0%, #57E9F2 48%, #45D4FB 100%)"],
        ["梦幻星河", "linear-gradient(45deg, #243B55, #141E30)"],
        ["炫彩极光", "linear-gradient(to right, #FF6A00, #FF8C00, #FFB900)"],
        ["电子梦境", "linear-gradient(-225deg, #00B4D8, #0096C7, #0077B6)"],
        ["炫目紫晶", "linear-gradient(135deg, #9B4D96, #EEA3C8, #BC3D4A)"],
        ["永恒之光", "linear-gradient(120deg, #9D4EDD, #6D56A2, #420459)"],
        ["深海之蓝", "linear-gradient(-225deg, #006B8C, #0084A1, #00A9D0)"]
    ]
}, {
    "light": [
        ["清晨", "linear-gradient(45deg, #fef9e7, #def3f6)"],
        ["奶茶", "linear-gradient(45deg, #ffecd2, #fcb69f)"],
        ["香草", "linear-gradient(-225deg, #FFF4E6 0%, #FFE9E4 100%)"],
        ["棉花糖", "linear-gradient(45deg, #f6e5f5, #fff1eb)"],
        ["晨露", "linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%)"],
        ["珍珠母", "linear-gradient(-225deg, #FFFEFF 0%, #D7FFFE 100%)"],
        ["香槟金", "linear-gradient(45deg, #FFF4D6, #FFE8B8)"],
        ["薄荷奶", "linear-gradient(-225deg, #DFFFCD 0%, #90F9C4 48%, #39F3BB 100%)"],
        ["蜜桃乌龙", "linear-gradient(45deg, #FFF0F0, #FFE2E2)"],
        ["柠檬水", "linear-gradient(-225deg, #FFFCD6 0%, #FFF7B2 100%)"],
        ["马卡龙", "linear-gradient(45deg, #FFE6E6, #F7E6FF)"],
        ["奶油", "linear-gradient(-225deg, #FFF8E1 0%, #FFECB3 100%)"],
        ["果冻", "linear-gradient(60deg, #FAF0FF, #FFE4E4)"],
        ["云雾", "linear-gradient(to right, #E0EAFC, #CFDEF3)"],
        ["月光", "linear-gradient(-225deg, #F5F7FA 0%, #E4E7EB 100%)"],
        ["露珠", "linear-gradient(45deg, #D1F5E7, #B3E4D4)"],
        ["粉蓝云霞", "linear-gradient(45deg, #D3E9F7, #F8C1DC)"],
        ["白玫瑰", "linear-gradient(45deg, #F7F2F1, #E9D5D2)"],
        ["冰蓝心语", "linear-gradient(45deg, #F0F9FD, #D5E9F4)"],
        ["蜜桃奶油", "linear-gradient(45deg, #FCE1C7, #FFDCAC)"]
    ]
}, {
    "chinese": [
        ["朱砂", "linear-gradient(45deg, #ff4c29, #b3261e)"],
        ["青瓷", "linear-gradient(-225deg, #88d8c0, #6fb1a0)"],
        ["玉石", "linear-gradient(to right, #a8e6cf, #dcedc1)"],
        ["水墨", "linear-gradient(45deg, #2c3e50, #3498db, #ecf0f1)"],
        ["国画", "linear-gradient(-225deg, #4a503d, #8e9b7d)"],
        ["瓷白", "linear-gradient(45deg, #f7f1e3, #d1ccc0)"],
        ["胭脂", "linear-gradient(to right, #ee9ca7, #ffdde1)"],
        ["翠绿", "linear-gradient(45deg, #2d5a27, #a8e6cf)"],
        ["宝蓝", "linear-gradient(-225deg, #1a237e, #0d47a1, #42a5f5)"],
        ["琥珀", "linear-gradient(45deg, #ff9a00, #ff6d00)"],
        ["紫檀", "linear-gradient(to right, #6a1b9a, #4a148c)"],
        ["松烟", "linear-gradient(45deg, #37474f, #546e7a)"],
        ["赭石", "linear-gradient(-225deg, #bc6f41, #a0522d)"],
        ["湖蓝", "linear-gradient(45deg, #039be5, #0288d1)"],
        ["金箔", "linear-gradient(45deg, #ffd700, #daa520, #b8860b)"],
        ["青铜", "linear-gradient(to right, #7b6b43, #9b8661)"],
        ["丹青", "linear-gradient(-225deg, #00838f, #006064)"],
        ["雅墨", "linear-gradient(45deg, #263238, #37474f)"],
        ["珊瑚红", "linear-gradient(45deg, #ff7043, #ff5722)"],
        ["玉髓", "linear-gradient(to right, #b2dfdb, #80cbc4)"]
    ]
}, {
    "retro": [
        ["复古红", "linear-gradient(45deg, #cb356b, #bd3f32)"],
        ["老电影", "linear-gradient(-225deg, #4b4b4b, #1e1e1e)"],
        ["旧照片", "linear-gradient(to right, #bdc3c7, #95a5a6)"],
        ["黄铜", "linear-gradient(45deg, #d4af37, #c5a028)"],
        ["老唱片", "linear-gradient(-225deg, #232526, #414345)"],
        ["复古绿", "linear-gradient(45deg, #5d8a66, #2d5a27)"],
        ["老报纸", "linear-gradient(to right, #f5f5f5, #e0e0e0)"],
        ["复古蓝", "linear-gradient(45deg, #2c3e50, #3498db)"],
        ["老相机", "linear-gradient(-225deg, #4a4a4a, #2b2b2b)"],
        ["复古棕", "linear-gradient(45deg, #8b4513, #654321)"],
        ["老海报", "linear-gradient(to right, #ff6b6b, #ee5253)"],
        ["复古紫", "linear-gradient(45deg, #6b5b95, #574b90)"],
        ["老钢笔", "linear-gradient(-225deg, #2f3640, #353b48)"],
        ["复古粉", "linear-gradient(45deg, #ffb8b8, #ff9999)"],
        ["老皮革", "linear-gradient(to right, #795548, #5d4037)"],
        ["复古橙", "linear-gradient(45deg, #e67e22, #d35400)"],
        ["老木板", "linear-gradient(-225deg, #8d6e63, #6d4c41)"],
        ["复古黄", "linear-gradient(45deg, #f1c40f, #f39c12)"],
        ["老铜锈", "linear-gradient(to right, #e74c3c, #c0392b)"],
        ["复古灰", "linear-gradient(45deg, #7f8c8d, #95a5a6)"]
    ]
}, {
    "dark": [
        ["暗夜", "linear-gradient(45deg, #0f0c29, #302b63, #24243e)"],
        ["深渊", "linear-gradient(-225deg, #1a1a1a, #2d2d2d)"],
        ["黑洞", "linear-gradient(to right, #000000, #434343)"],
        ["暗影", "linear-gradient(45deg, #232526, #414345)"],
        ["午夜", "linear-gradient(-225deg, #2c3e50, #3498db)"],
        ["暗黑水晶", "linear-gradient(45deg, #2c3e50, #3498db, #2c3e50)"],
        ["暗金属", "linear-gradient(to right, #4b4b4b, #1e1e1e)"],
        ["暗蓝", "linear-gradient(45deg, #141e30, #243b55)"],
        ["暗紫", "linear-gradient(-225deg, #20202c, #515175)"],
        ["暗红", "linear-gradient(45deg, #1f1c2c, #928dab)"],
        ["暗森林", "linear-gradient(to right, #0f2027, #203a43, #2c5364)"],
        ["暗铜", "linear-gradient(45deg, #2c3e50, #fd746c)"],
        ["暗岩", "linear-gradient(-225deg, #2f3542, #57606f)"],
        ["暗钢", "linear-gradient(45deg, #1e272e, #485460)"],
        ["暗玉", "linear-gradient(to right, #0c2461, #1e3799)"],
        ["暗翡翠", "linear-gradient(45deg, #0a3d62, #3c6382)"],
        ["暗琥珀", "linear-gradient(-225deg, #4b4b4b, #7f8c8d)"],
        ["暗银", "linear-gradient(45deg, #2f3640, #353b48)"],
        ["暗青铜", "linear-gradient(to right, #4b4b4b, #7f8c8d)"],
        ["暗玛瑙", "linear-gradient(45deg, #2c2c54, #474787)"]
    ]
}];
