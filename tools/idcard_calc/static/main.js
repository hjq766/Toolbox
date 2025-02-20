const zodiacData = [
    "子鼠", "丑牛", "寅虎", "卯兔", "辰龙", "巳蛇",
    "午马", "未羊", "申猴", "酉鸡", "戌狗", "亥猪"
];

const constellationData = [{
        "name": "水瓶座",
        "start_date": "01-20",
        "end_date": "02-18"
    },
    {
        "name": "双鱼座",
        "start_date": "02-19",
        "end_date": "03-20"
    },
    {
        "name": "白羊座",
        "start_date": "03-21",
        "end_date": "04-19"
    },
    {
        "name": "金牛座",
        "start_date": "04-20",
        "end_date": "05-20"
    },
    {
        "name": "双子座",
        "start_date": "05-21",
        "end_date": "06-21"
    },
    {
        "name": "巨蟹座",
        "start_date": "06-22",
        "end_date": "07-22"
    },
    {
        "name": "狮子座",
        "start_date": "07-23",
        "end_date": "08-22"
    },
    {
        "name": "处女座",
        "start_date": "08-23",
        "end_date": "09-22"
    },
    {
        "name": "天秤座",
        "start_date": "09-23",
        "end_date": "10-23"
    },
    {
        "name": "天蝎座",
        "start_date": "10-24",
        "end_date": "11-22"
    },
    {
        "name": "射手座",
        "start_date": "11-23",
        "end_date": "12-21"
    },
    {
        "name": "摩羯座",
        "start_date": "12-22",
        "end_date": "01-19"
    }
]

// 在计算年龄函数之前添加验证函数
function validateIdCard(idCard) {
    // 基本格式校验
    const pattern = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/;
    if (!pattern.test(idCard)) {
        return false;
    }

    // 校验日期
    const year = parseInt(idCard.substr(6, 4));
    const month = parseInt(idCard.substr(10, 2));
    const day = parseInt(idCard.substr(12, 2));
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        return false;
    }

    // 校验校验码
    const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const tokens = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += parseInt(idCard.charAt(i)) * factors[i];
    }
    const checkToken = tokens[sum % 11];
    return checkToken === idCard.charAt(17).toUpperCase();
}

// 计算年龄函数
function calculateAges() {
    const input = document.getElementById('idInput').value.trim();
    if (!input) {
        showToast('请输入身份证号码');
        return;
    }

    const idCards = input.split('\n').filter(id => id.trim());
    const results = [];

    idCards.forEach((idCard, index) => {
        idCard = idCard.trim();
        const isValid = validateIdCard(idCard);
        if (isValid) {
            const birthday = idCard.substr(6, 8);
            const year = birthday.substr(0, 4);
            const month = birthday.substr(4, 2);
            const day = birthday.substr(6, 2);
            const birthDate = `${year}-${month}-${day}`;
            const age = calculateAge(birthDate);
            const gender = parseInt(idCard.substr(16, 1)) % 2 === 0 ? '女' : '男';
            const areaCode = idCard.substr(0, 6);
            const region = getRegion(areaCode);
            const zodiac = getZodiac(parseInt(year));
            const constellation = getConstellation(parseInt(month), parseInt(day));

            results.push({
                id: index + 1,
                idCard,
                isValid: true,
                region,
                birthday: birthDate,
                gender,
                age,
                zodiac,
                constellation
            });
        } else {
            results.push({
                id: index + 1,
                idCard,
                isValid: false
            });
        }
    });

    displayResults(results);
    document.getElementById('exportBtn').style.display = 'block';
}

// 添加分页相关变量
let currentPage = 1;
const itemsPerPage = 10;
let allResults = [];

// 修改显示结果函数，添加分页功能
function displayResults(results) {
    allResults = results; // 保存所有结果
    const resultArea = document.getElementById('resultArea');
    document.querySelector('.result-title').style.display = 'flex';

    // 计算分页
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageResults = results.slice(start, end);

    let html = `
                <table class="result-table">
                        <thead>
                            <tr>
                                <th>序号</th>
                                <th>身份证号码</th>
                                <th>验证结果</th>
                                <th>地区</th>
                                <th>出生日期</th>
                                <th>性别</th>
                                <th>年龄</th>
                                <th>生肖</th>
                                <th>星座</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

    pageResults.forEach(result => {
        html += `
                        <tr>
                            <td>${result.id}</td>
                        <td>${result.idCard}</td>
                        <td class="${result.isValid ? 'valid' : 'invalid'}">${result.isValid ? '有效' : '无效'}</td>
                        <td>${result.isValid ? result.region || '-' : '-'}</td>
                        <td>${result.isValid ? result.birthday : '-'}</td>
                        <td class="${result.isValid ? (result.gender === '男' ? 'gender-male' : 'gender-female') : ''}">${result.isValid ? result.gender : '-'}</td>
                        <td>${result.isValid ? result.age : '-'}</td>
                        <td>${result.isValid ? result.zodiac : '-'}</td>
                        <td>${result.isValid ? result.constellation : '-'}</td>
                        </tr>
                    `;
    });

    html += `</tbody></table>`;

    // 添加分页控件
    if (totalPages > 1) {
        html += `
                    <div class="pagination">
                        <div class="pagination-controls">
                            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                                上一页
                            </button>
                            <span class="page-info">第 ${currentPage} 页，共 ${totalPages} 页</span>
                            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                                下一页
                            </button>
                        </div>
                    </div>
                `;
    }

    resultArea.innerHTML = html;
}

// 添加换页函数
function changePage(page) {
    currentPage = page;
    displayResults(allResults);
}

// 计算年龄函数
function calculateAge(birthday) {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

// 修改获取生肖的函数
function getZodiac(year) {
    return zodiacData[(year - 4) % 12].substring(1); // 从 "子鼠" 中获取 "鼠"
}

// 修改获取星座的函数
function getConstellation(month, day) {
    const date = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    for (const constellation of constellationData) {
        // 处理跨年的情况（比如摩羯座12.22-1.19）
        if (constellation.name === "摩羯座") {
            if (month === 12 && day >= 22 || month === 1 && day <= 19) {
                return constellation.name;
            }
            continue;
        }

        const [startMonth, startDay] = constellation.start_date.split('-').map(Number);
        const [endMonth, endDay] = constellation.end_date.split('-').map(Number);

        if (month === startMonth && day >= startDay || month === endMonth && day <= endDay) {
            return constellation.name;
        }
    }

    return "未知";
}

// 修改获取地区的函数
function getRegion(areaCode) {
    const provinceCode = areaCode.substr(0, 2) + '0000';
    const cityCode = areaCode.substr(0, 4) + '00';

    let result = [];

    if (provinceData[provinceCode]) {
        result.push(provinceData[provinceCode].text);
        if (cityData[cityCode]) {
            result.push(cityData[cityCode].text);
        }
    }

    return result.join(' ');
}

// 添加文件处理相关函数
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

// 处理文件内容
function processFile(file) {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'txt' || extension === 'csv') {
        reader.onload = function(e) {
            document.getElementById('idInput').value = e.target.result;
        };
        reader.readAsText(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {
                type: 'array'
            });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                header: 1
            });
            const idCards = jsonData.flat().filter(id => id && typeof id === 'string' || typeof id === 'number');
            document.getElementById('idInput').value = idCards.join('\n');
        };
        reader.readAsArrayBuffer(file);
    }
}

// 添加拖拽处理
const fileUpload = document.querySelector('.file-upload');

fileUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUpload.classList.add('drag-over');
});

fileUpload.addEventListener('dragleave', () => {
    fileUpload.classList.remove('drag-over');
});

fileUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
});

// 添加导出 Excel 功能
function exportToExcel() {
    if (!allResults || allResults.length === 0) {
        showToast('没有可导出的数据');
        return;
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 准备数据
    const data = allResults.map(result => ({
        '序号': result.id,
        '身份证号码': result.idCard,
        '验证结果': result.isValid ? '有效' : '无效',
        '地区': result.isValid ? result.region : '-',
        '出生日期': result.isValid ? result.birthday : '-',
        '性别': result.isValid ? result.gender : '-',
        '年龄': result.isValid ? result.age : '-',
        '生肖': result.isValid ? result.zodiac : '-',
        '星座': result.isValid ? result.constellation : '-'
    }));

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(data);

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '身份证信息');

    // 导出文件
    XLSX.writeFile(wb, '身份证信息.xlsx');
}