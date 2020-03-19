export const TYPE = {
    OPTIONS:0,
    RANGE:1,
    TWO_LEVEL_OPTIONS:2,
}

export const PARAMETERS = [
    {
        name: "kind",
        type: TYPE.OPTIONS,
        text: "種類",
        data: {
            no_limit: { text: "不限", value: 0 },
            level: { text: "整層住家", value: 1 },
            suite: { text: "獨立套房", value: 2 },
            suite_share: { text: "分租套房", value: 3 },
            share: { text: "雅房", value: 4 },
            car: { text: "車位", value: 8 }
        }
    },
    {
        name: "sex",
        type: TYPE.OPTIONS,
        text: "性別",
        data: {
            man: { text: "男", value: 1 },
            woman: { text: "女", value: 2 },
            no_limit: { text: "不限", value: 3 }
        }
    },
    {name: "area", type: TYPE.RANGE, text: "坪數" },
    { name: "rentprice", type: TYPE.RANGE, text: "租金" },
    {
        name: "option",
        type: TYPE.OPTIONS,
        text: "選項",
        data: {
            broadband: { text: "網路", value: "broadband" },
            tv: { text: "電視", value: "tv" },
            cold: { text: "冷氣", value: "cold" },
            icebox: { text: "冰箱", value: "icebox" },
            sofa: { text: "沙發", value: "sofa" },
            wardrobe: { text: "衣櫃", value: "wardrobe" },
            bed: { text: "床", value: "bed" },
            washer: { text: "洗衣機", value: "washer" },
            four: { text: "第四台", value: "four" },
            hotwater: { text: "熱水器", value: "hotwater" },
            naturalgas: { text: "天然氣", value: "naturalgas" },
            cook: { text: "可開伙", value: "cook" },
            balcony_1: { text: "有陽台", value: "balcony_1" },
            lift: { text: "電梯", value: "lift" },
            cartplace: { text: "車位", value: "cartplace" },
            pet: { text: "寵物", value: "pet" },
            tragoods: { text: "近捷運", value: "tragoods" },
            lease: { text: "短租", value: "lease" },
        }
    },
    {
        name: "mrtcoods",
        type: TYPE.TWO_LEVEL_OPTIONS,
        text: "捷運",
        data: [
            {
                text: "文湖線",
                items: [
                    { value: "4257", text: "南港展覽館" },
                    { value: "4314", text: "南港軟體園" },
                    { value: "4315", text: "東湖" },
                    { value: "4316", text: "葫洲" },
                    { value: "4317", text: "大湖公園" },
                    { value: "4318", text: "內湖" },
                    { value: "4319", text: "文德" },
                    { value: "4320", text: "港墘" },
                    { value: "4321", text: "西湖" },
                    { value: "4282", text: "劍南路" },
                    { value: "4323", text: "大直" },
                    { value: "4324", text: "松山機場" },
                    { value: "4185", text: "中山國中" },
                    { value: "4186", text: "南京復興" },
                    { value: "4187", text: "忠孝復興" },
                    { value: "4188", text: "大安" },
                    { value: "4189", text: "科技大樓" },
                    { value: "4190", text: "六張犁" },
                    { value: "4191", text: "麟光" },
                    { value: "4192", text: "辛亥" },
                    { value: "4193", text: "萬芳醫院" },
                    { value: "4194", text: "萬芳社區" },
                    { value: "4195", text: "木柵" },
                    { value: "4196", text: "動物園" },
                ]
            },
            {
                text: "淡水信義線",
                items: [
                    { value: "4198", text: "新北投" },
                    { value: "4163", text: "淡水" },
                    { value: "4164", text: "紅樹林" },
                    { value: "4165", text: "竹圍" },
                    { value: "4166", text: "關渡" },
                    { value: "4167", text: "忠義" },
                    { value: "4168", text: "復興崗" },
                    { value: "4169", text: "北投" },
                    { value: "4170", text: "奇岩" },
                    { value: "4171", text: "唭哩岸" },
                    { value: "4172", text: "石牌" },
                    { value: "4173", text: "明德" },
                    { value: "4174", text: "芝山" },
                    { value: "4175", text: "士林" },
                    { value: "4176", text: "劍潭" },
                    { value: "4177", text: "圓山" },
                    { value: "4178", text: "民權西路" },
                    { value: "4179", text: "雙連" },
                    { value: "4180", text: "中山" },
                    { value: "4181", text: "台北車站" },
                    { value: "4182", text: "台大醫院" },
                    { value: "4183", text: "中正紀念堂" },
                    { value: "4200", text: "東門" },
                    { value: "4201", text: "大安森林公園" },
                    { value: "4188", text: "大安" },
                    { value: "66300", text: "信義安和" },
                    { value: "66301", text: "台北101" },
                    { value: "4205", text: "象山" },
                ]
            },
            {
                text: "新北投",
                items: [
                    { value: "4169", text: "北投" },
                    { value: "4198", text: "新北投" },
                ]
            },
            {
                text: "松山新店線",
                items: [
                    { value: "4235", text: "松山" },
                    { value: "4236", text: "南京三民" },
                    { value: "4237", text: "台北小巨蛋" },
                    { value: "4186", text: "南京復興" },
                    { value: "66266", text: "松江南京" },
                    { value: "4180", text: "中山" },
                    { value: "4241", text: "北門" },
                    { value: "4242", text: "西門" },
                    { value: "4255", text: "小南門" },
                    { value: "4183", text: "中正紀念堂" },
                    { value: "4184", text: "古亭" },
                    { value: "4244", text: "台電大樓" },
                    { value: "4245", text: "公館" },
                    { value: "4246", text: "萬隆" },
                    { value: "4247", text: "景美" },
                    { value: "4248", text: "大坪林" },
                    { value: "4249", text: "七張" },
                    { value: "4251", text: "新店市公所" },
                    { value: "4250", text: "新店" },
                    { value: "4253", text: "小碧潭" },


                ]
            },
            {
                text: "小碧潭",
                items: [

                    { value: "4253", text: "小碧潭" },
                    { value: "4249", text: "七張" },
                ]
            },
            {
                text: "中和新蘆線",
                items: [

                    { value: "66258", text: "蘆洲" },
                    { value: "66259", text: "三民高中" },
                    { value: "66260", text: "徐匯中學" },
                    { value: "66261", text: "三和國中" },
                    { value: "66262", text: "三重國小" },
                    { value: "4207", text: "迴龍" },
                    { value: "4208", text: "丹鳳" },
                    { value: "4209", text: "輔大" },
                    { value: "4210", text: "新莊" },
                    { value: "4211", text: "頭前庄" },
                    { value: "4212", text: "先嗇宮" },
                    { value: "4213", text: "三重" },
                    { value: "4214", text: "菜寮" },
                    { value: "4215", text: "台北橋" },
                    { value: "4216", text: "大橋頭" },
                    { value: "4178", text: "民權西路" },
                    { value: "66264", text: "中山國小" },
                    { value: "66265", text: "行天宮" },
                    { value: "66266", text: "松江南京" },
                    { value: "4221", text: "忠孝新生" },
                    { value: "4200", text: "東門" },
                    { value: "4184", text: "古亭" },
                    { value: "4231", text: "頂溪" },
                    { value: "4232", text: "永安市場" },
                    { value: "4233", text: "景安" },
                    { value: "4234", text: "南勢角" },
                ]
            },
            {
                text: "板南線",
                items: [

                    { value: "4257", text: "南港展覽館" },
                    { value: "4258", text: "南港" },
                    { value: "4259", text: "昆陽" },
                    { value: "4260", text: "後山埤" },
                    { value: "4261", text: "永春" },
                    { value: "4262", text: "市政府" },
                    { value: "4263", text: "國父紀念館" },
                    { value: "4264", text: "忠孝敦化" },
                    { value: "4187", text: "忠孝復興" },
                    { value: "4221", text: "忠孝新生" },
                    { value: "4267", text: "善導寺" },
                    { value: "4181", text: "台北車站" },
                    { value: "4242", text: "西門" },
                    { value: "4271", text: "龍山寺" },
                    { value: "4272", text: "江子翠" },
                    { value: "4273", text: "新埔" },
                    { value: "4274", text: "板橋" },
                    { value: "4275", text: "府中" },
                    { value: "4277", text: "亞東醫院" },
                    { value: "4278", text: "海山" },
                    { value: "4279", text: "土城" },
                    { value: "4280", text: "永寧" },
                    { value: "4281", text: "頂埔" },
                ]
            },
            {
                text: "綠山線",
                items: [
                    { value: "4164", text: "紅樹林" },
                    { value: "66346", text: "竿蓁林" },
                    { value: "66347", text: "淡金鄧公" },
                    { value: "66348", text: "淡江大學" },
                    { value: "66349", text: "淡金北新" },
                    { value: "66350", text: "新市一路" },
                    { value: "66351", text: "淡水行政中心" },
                    { value: "66352", text: "濱海義山" },
                    { value: "66353", text: "濱海沙崙" },
                    { value: "66354", text: "淡海新市鎮" },
                    { value: "66355", text: "崁頂" },
                ]
            }
        ]
    }
]