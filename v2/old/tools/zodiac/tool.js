// 生肖数据
const zodiacData = {
    鼠: {
        years: [2020, 2008, 1996, 1984, 1972, 1960],
        wuxing: "水",
        personality: "聪明机智，善于社交，适应能力强，但有时过于圆滑世故。为人乐观开朗，善于把握机会。",
        compatibility: {
            best: ["龙", "猴"],
            good: ["牛", "龙"],
            bad: ["马", "兔"]
        }
    },
    牛: {
        years: [2021, 2009, 1997, 1985, 1973, 1961],
        wuxing: "土",
        personality: "性格稳重，为人诚实可靠，做事认真负责，但有时固执保守。工作勤恳，意志力强。",
        compatibility: {
            best: ["鼠", "蛇"],
            good: ["鸡", "猴"],
            bad: ["羊", "马"]
        }
    },
    虎: {
        years: [2022, 2010, 1998, 1986, 1974, 1962],
        wuxing: "木",
        personality: "性格勇敢，充满正义感，领导能力强，但易冲动。具有王者风范，富有同情心。",
        compatibility: {
            best: ["马", "狗"],
            good: ["猪", "兔"],
            bad: ["蛇", "猴"]
        }
    },
    兔: {
        years: [2023, 2011, 1999, 1987, 1975, 1963],
        wuxing: "木",
        personality: "温柔善良，优雅有礼，富有艺术气质，但略显优柔寡断。人缘好，受人欢迎。",
        compatibility: {
            best: ["狗", "猪"],
            good: ["羊", "猴"],
            bad: ["鼠", "龙"]
        }
    },
    龙: {
        years: [2024, 2012, 2000, 1988, 1976, 1964],
        wuxing: "土",
        personality: "充满魅力，意志坚强，追求完美，但有时过于理想化。天生领袖气质，富有创造力。",
        compatibility: {
            best: ["鼠", "猴"],
            good: ["蛇", "鸡"],
            bad: ["狗", "兔"]
        }
    },
    蛇: {
        years: [2025, 2013, 2001, 1989, 1977, 1965],
        wuxing: "火",
        personality: "智慧敏锐，优雅神秘，直觉强，但有时过于敏感。思维深邃，观察力强。",
        compatibility: {
            best: ["牛", "鸡"],
            good: ["龙", "猴"],
            bad: ["虎", "猪"]
        }
    },
    马: {
        years: [2026, 2014, 2002, 1990, 1978, 1966],
        wuxing: "火",
        personality: "活泼开朗，追求自由，充满活力，但易浮躁。性格独立，适应力强。",
        compatibility: {
            best: ["虎", "羊"],
            good: ["狗", "兔"],
            bad: ["鼠", "牛"]
        }
    },
    羊: {
        years: [2027, 2015, 2003, 1991, 1979, 1967],
        wuxing: "土",
        personality: "温和善良，富有同情心，具有艺术天赋，但偏感性。性格随和，重视和谐。",
        compatibility: {
            best: ["马", "兔"],
            good: ["猪", "马"],
            bad: ["牛", "狗"]
        }
    },
    猴: {
        years: [2028, 2016, 2004, 1992, 1980, 1968],
        wuxing: "金",
        personality: "聪明灵活，创意十足，应变能力强，但易浮躁。思维敏捷，善于交际。",
        compatibility: {
            best: ["龙", "鼠"],
            good: ["蛇", "兔"],
            bad: ["虎", "猪"]
        }
    },
    鸡: {
        years: [2029, 2017, 2005, 1993, 1981, 1969],
        wuxing: "金",
        personality: "勤奋务实，注重细节，表达能力强，但易过于完美主义。观察力敏锐，重视外表。",
        compatibility: {
            best: ["蛇", "牛"],
            good: ["龙", "虎"],
            bad: ["兔", "狗"]
        }
    },
    狗: {
        years: [2030, 2018, 2006, 1994, 1982, 1970],
        wuxing: "土",
        personality: "忠诚可靠，正直善良，富有正义感，但易过于保守。责任心强，重视友情。",
        compatibility: {
            best: ["虎", "兔"],
            good: ["马", "猪"],
            bad: ["龙", "羊"]
        }
    },
    猪: {
        years: [2031, 2019, 2007, 1995, 1983, 1971],
        wuxing: "水",
        personality: "诚实善良，为人厚道，性格温和，但易过于天真。重情重义，乐于助人。",
        compatibility: {
            best: ["兔", "羊"],
            good: ["虎", "狗"],
            bad: ["蛇", "猴"]
        }
    }
};

// 查询生肖
function queryZodiac() {
    const yearInput = document.getElementById('yearInput');
    const year = parseInt(yearInput.value);
    
    if (!year || year < 1900 || year > 2100) {
        showToast('请输入1900-2100之间的有效年份');
        return;
    }

    // 计算生肖
    const zodiacIndex = (year - 1900) % 12;
    const zodiacNames = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const zodiac = zodiacNames[zodiacIndex];
    
    // 显示结果
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';
    
    // 更新结果内容
    resultSection.querySelector('.year-number').textContent = year + '年';
    resultSection.querySelector('.zodiac-name').textContent = '属' + zodiac;
    resultSection.querySelector('.wuxing').textContent = zodiacData[zodiac].wuxing;
    resultSection.querySelector('.personality').textContent = zodiacData[zodiac].personality;
    
    // 更新相配信息
    const compatibility = zodiacData[zodiac].compatibility;
    resultSection.querySelector('.best-match').textContent = compatibility.best.join('、');
    resultSection.querySelector('.good-match').textContent = compatibility.good.join('、');
    resultSection.querySelector('.bad-match').textContent = compatibility.bad.join('、');

    // 高亮生肖图标
    highlightZodiac(zodiac);
}

// 按年龄查询
function queryByAge() {
    const ageInput = document.getElementById('ageInput');
    const age = parseInt(ageInput.value);
    
    if (!age || age < 0 || age > 200) {
        showToast('请输入0-200之间的有效年龄');
        return;
    }
    
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    
    // 设置年份输入框的值并执行查询
    document.getElementById('yearInput').value = birthYear;
    queryZodiac();
}

// 显示提示信息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 高亮显示当前生肖
function highlightZodiac(zodiac) {
    // 移除所有高亮
    document.querySelectorAll('.zodiac-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加当前生肖高亮
    const currentZodiac = document.querySelector(`[data-zodiac="${zodiac}"]`);
    if (currentZodiac) {
        currentZodiac.classList.add('active');
    }
}

// 添加生肖提示卡片事件
function initZodiacTooltips() {
    const zodiacItems = document.querySelectorAll('.zodiac-item');
    const tooltip = createTooltip();
    let currentItem = null;
    
    zodiacItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const zodiac = item.getAttribute('data-zodiac');
            if (!zodiac) return;
            
            // 更新提示卡片内容
            updateTooltipContent(tooltip, zodiac);
            
            // 显示提示卡片
            showTooltip(tooltip, e);
            currentItem = item;
        });
        
        item.addEventListener('mouseleave', () => {
            if (currentItem === item) {
                hideTooltip(tooltip);
                currentItem = null;
            }
        });
    });
}

// 创建提示卡片元素
function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'zodiac-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <div class="zodiac-title"></div>
            <div class="wuxing"></div>
        </div>
        <div class="tooltip-content">
            <div class="tooltip-years">
                <table class="tooltip-years-table">
                    <tbody class="tooltip-years-body"></tbody>
                </table>
            </div>
            <div class="tooltip-info">
                <div class="personality"></div>
                <div class="compatibility">
                    <div class="compatibility-row">
                        <span class="compatibility-type best">最佳：</span>
                        <span class="compatibility-value"></span>
                    </div>
                    <div class="compatibility-row">
                        <span class="compatibility-type good">较好：</span>
                        <span class="compatibility-value"></span>
                    </div>
                    <div class="compatibility-row">
                        <span class="compatibility-type bad">较差：</span>
                        <span class="compatibility-value"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(tooltip);
    return tooltip;
}

// 删除第一个 updateTooltipContent 函数（287-309行），保留并修改第二个

function updateTooltipContent(tooltip, zodiac) {
    const data = zodiacData[zodiac];
    const currentYear = new Date().getFullYear();
    
    // 更新标题和五行
    tooltip.querySelector('.zodiac-title').textContent = `属${zodiac}`;
    tooltip.querySelector('.wuxing').textContent = `五行：${data.wuxing}`;
    
    // 更新年份表格
    const tbody = tooltip.querySelector('.tooltip-years-body');
    tbody.innerHTML = data.years
        .map(year => {
            const age = currentYear - year;
            const ageText = age >= 0 ? `${age}岁` : `未来${Math.abs(age)}年`;
            return `<tr><td>${year}年</td><td>${ageText}</td></tr>`;
        })
        .join('');
    
    // 更新性格描述
    tooltip.querySelector('.personality').textContent = data.personality;
    
    // 更新相配关系
    tooltip.querySelector('.compatibility-type.best').textContent = data.compatibility.best.join('、');
    tooltip.querySelector('.compatibility-type.good').textContent = data.compatibility.good.join('、');
    tooltip.querySelector('.compatibility-type.bad').textContent = data.compatibility.bad.join('、');
}

// 修改 showTooltip 函数
function showTooltip(tooltip, event) {
    if (!tooltip) return;
    const rect = event.currentTarget.getBoundingClientRect(); // 改用 currentTarget
    positionTooltip(tooltip, rect);
    tooltip.classList.add('show');
}

// 隐藏提示卡片
function hideTooltip(tooltip) {
    tooltip.classList.remove('show');
}

// 计算并设置提示卡片位置
function positionTooltip(tooltip, targetRect) {
    const tooltipRect = tooltip.getBoundingClientRect();
    const spacing = 10; // 提示卡片和目标元素之间的间距
    
    // 计算默认位置（在目标元素右侧）
    let left = targetRect.right + spacing;
    let top = targetRect.top;
    
    // 检查是否会超出视窗右边界
    if (left + tooltipRect.width > window.innerWidth) {
        // 如果会超出右边界，则显示在目标元素左侧
        left = targetRect.left - tooltipRect.width - spacing;
    }
    
    // 确保不会超出顶部边界
    if (top < 0) {
        top = spacing;
    }
    
    // 确保不会超出底部边界
    if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - spacing;
    }
    
    // 应用位置
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

// 更新提示卡片内容
function updateTooltipContent(tooltip, zodiac) {
    const data = zodiacData[zodiac];
    const currentYear = new Date().getFullYear();
    
    // 更新年份表格
    const yearsHtml = data.years
        .map(year => {
            const age = currentYear - year;
            const ageText = age >= 0 ? `${age}岁` : `未来${Math.abs(age)}年`;
            return `<tr><td>${year}年</td><td>${ageText}</td></tr>`;
        })
        .join('');
    tooltip.querySelector('.tooltip-years-body').innerHTML = yearsHtml;
    
    // 更新其他信息
    tooltip.querySelector('.zodiac-title').textContent = `属${zodiac}`;
    tooltip.querySelector('.wuxing').textContent = `五行：${data.wuxing}`;
    
    // 性格文字处理，按句号换行
    const personality = data.personality;
    const formattedPersonality = personality.replace(/。/g, '。\n');
    tooltip.querySelector('.personality').textContent = formattedPersonality;
    
    // 更新相配信息
    tooltip.querySelector('.compatibility .compatibility-row:nth-child(1) .compatibility-value').textContent = data.compatibility.best.join('、');
    tooltip.querySelector('.compatibility .compatibility-row:nth-child(2) .compatibility-value').textContent = data.compatibility.good.join('、');
    tooltip.querySelector('.compatibility .compatibility-row:nth-child(3) .compatibility-value').textContent = data.compatibility.bad.join('、');
}

// 初始化标签切换功能
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 切换按钮状态
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 切换查询内容
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.query-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tabId + 'Query').style.display = 'block';
        });
    });
}

// 按年龄查询
function queryByAge() {
    const ageInput = document.getElementById('ageInput');
    const age = parseInt(ageInput.value);
    
    if (!age || age < 0 || age > 200) {
        showToast('请输入0-200之间的有效年龄');
        return;
    }
    
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    
    // 设置年份输入框的值
    document.getElementById('yearInput').value = birthYear;
    // 执行年份查询
    queryZodiac();
}

// 修改生肖图标点击事件
function initZodiacClick() {
    const zodiacItems = document.querySelectorAll('.zodiac-item');
    const yearsCard = document.querySelector('.zodiac-years-card');
    const yearsList = document.querySelector('.zodiac-years-list');
    const zodiacIcon = document.querySelector('.selected-zodiac-icon');
    const zodiacTitle = document.querySelector('.selected-zodiac-title');
    
    zodiacItems.forEach(item => {
        item.addEventListener('click', () => {
            const zodiac = item.getAttribute('data-zodiac');
            const icon = item.querySelector('.zodiac-icon').textContent;
            const years = getZodiacYears(zodiac);
            
            // 更新标题和图标
            zodiacIcon.textContent = icon;
            zodiacTitle.textContent = `属${zodiac}的年份`;
            
            // 清空并填充年份列表
            yearsList.innerHTML = '';
            years.forEach(year => {
                const age = new Date().getFullYear() - year;
                const yearItem = document.createElement('div');
                yearItem.className = 'zodiac-year-item';
                yearItem.innerHTML = `
                    <span>${year}年</span>
                    <span class="zodiac-year-age">${age}岁</span>
                `;
                yearsList.appendChild(yearItem);
            });
            
            // 显示年份卡片
            yearsCard.style.display = 'block';
            
            // 高亮当前选中的生肖
            zodiacItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// 显示生肖对应的年份
function showZodiacYears(zodiac) {
    const currentYear = new Date().getFullYear();
    const years = zodiacData[zodiac].years;
    const resultSection = document.getElementById('resultSection');
    
    // 计算每个年份对应的年龄
    const yearsWithAge = years.map(year => ({
        year,
        age: currentYear - year
    })).filter(item => item.age >= 0);
    
    // 更新结果内容
    resultSection.querySelector('.zodiac-name').textContent = '属' + zodiac;
    resultSection.querySelector('.wuxing').textContent = zodiacData[zodiac].wuxing;
    resultSection.querySelector('.personality').textContent = zodiacData[zodiac].personality;
    
    // 添加年份列表
    const birthYears = document.createElement('div');
    birthYears.className = 'birth-years';
    birthYears.innerHTML = `
        <div class="years-list">
            ${yearsWithAge.map(({year, age}) => `
                <span class="year-item">
                    ${year}年<span class="current-age">(${age}岁)</span>
                </span>
            `).join('')}
        </div>
    `;
    
    // 替换或添加年份列表
    const existingYears = resultSection.querySelector('.birth-years');
    if (existingYears) {
        existingYears.replaceWith(birthYears);
    } else {
        resultSection.querySelector('.result-content').appendChild(birthYears);
    }
    
    resultSection.style.display = 'block';
    highlightZodiac(zodiac);
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initZodiacTooltips();
    initTabs();
    
    // 设置输入框默认值为当前年份
    const currentYear = new Date().getFullYear();
    document.getElementById('yearInput').value = currentYear;
    
    // 初始查询当前年份
    queryZodiac();
});