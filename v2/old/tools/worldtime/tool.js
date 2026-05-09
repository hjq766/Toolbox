// 主要城市及其时区数据
const cities = [
    // 美洲时区（从西到东排序）
    { name: '夏威夷', nameEn: 'Hawaii', timezone: 'UTC-10', flag: 'us' },        // 夏威夷时间
    { name: '阿拉斯加', nameEn: 'Alaska', timezone: 'UTC-9', flag: 'us' },      // 阿拉斯加时间
    { name: '洛杉矶', nameEn: 'Los Angeles', timezone: 'UTC-8', flag: 'us' },   // 太平洋时间
    { name: '芝加哥', nameEn: 'Chicago', timezone: 'UTC-6', flag: 'us' },       // 中部时间
    { name: '纽约', nameEn: 'New York', timezone: 'UTC-5', flag: 'us' },        // 东部时间
    
    // 欧洲时区
    { name: '伦敦', nameEn: 'London', timezone: 'UTC+0', flag: 'gb' },
    { name: '巴黎', nameEn: 'Paris', timezone: 'UTC+1', flag: 'fr' },
    { name: '柏林', nameEn: 'Berlin', timezone: 'UTC+1', flag: 'de' },
    { name: '莫斯科', nameEn: 'Moscow', timezone: 'UTC+3', flag: 'ru' },
    
    // 亚洲时区
    { name: '迪拜', nameEn: 'Dubai', timezone: 'UTC+4', flag: 'ae' },
    { name: '新德里', nameEn: 'New Delhi', timezone: 'UTC+5:30', flag: 'in' },
    { name: '曼谷', nameEn: 'Bangkok', timezone: 'UTC+7', flag: 'th' },
    { name: '新加坡', nameEn: 'Singapore', timezone: 'UTC+8', flag: 'sg' },
    { name: '香港', nameEn: 'Hongkong', timezone: 'UTC+8', flag: 'cn' },
    { name: '首尔', nameEn: 'Seoul', timezone: 'UTC+9', flag: 'kr' },
    { name: '东京', nameEn: 'Tokyo', timezone: 'UTC+9', flag: 'jp' },
    
    // 大洋洲时区
    { name: '悉尼', nameEn: 'Sydney', timezone: 'UTC+11', flag: 'au' },
    { name: '惠灵顿', nameEn: 'Wellington', timezone: 'UTC+13', flag: 'nz' }
];

// 格式化日期时间的函数
function formatDateTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return {
        time: `${hours}:${minutes}:${seconds}`,
        date: `${year}年${month}月${day}日`
    };
}

// 创建时间卡片
function createTimeCard(city) {
    const card = document.createElement('div');
    card.className = 'time-card';
    card.setAttribute('data-city', city.name);
    
    const cityTime = getTimeInTimeZone(city.timezone);
    
    card.innerHTML = `
        <div class="city">
            <span class="fi fi-${city.flag}"></span>
            <span class="city-name">${city.name} / ${city.nameEn}</span>
        </div>
        <div class="time-display">${cityTime.time}</div>
        <div class="date-display">${cityTime.date}</div>
        <div class="timezone">${city.timezone}</div>
    `;
    
    return card;
}

function getTimeInTimeZone(timezone) {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    // 解析 UTC 偏移
    let offset = 0;
    if (timezone) {
        const offsetStr = timezone.replace('UTC', '').trim();
        if (offsetStr.includes(':')) {
            const [hours, minutes] = offsetStr.split(':').map(Number);
            offset = (hours >= 0) ? (hours + minutes/60) : (hours - minutes/60);
        } else {
            offset = parseFloat(offsetStr) || 0;
        }
    }
    
    const targetTime = new Date(utcTime + (offset * 3600000));
    return formatDateTime(targetTime);
}

// 更新所有时间显示
function updateAllTimes() {
    // 更新北京时间
    const beijingTime = getTimeInTimeZone('UTC+8');
    document.getElementById('beijingTime').textContent = beijingTime.time;
    document.getElementById('beijingDate').textContent = beijingTime.date;

    // 更新其他城市时间
    cities.forEach(city => {
        try {
            const cityTime = getTimeInTimeZone(city.timezone);
            const card = document.querySelector(`.time-card[data-city="${city.name}"]`);
            if (card) {
                const timeDisplay = card.querySelector('.time-display');
                const dateDisplay = card.querySelector('.date-display');
                
                if (timeDisplay) timeDisplay.textContent = cityTime.time;
                if (dateDisplay) dateDisplay.textContent = cityTime.date;
            }
        } catch (error) {
            console.error(`Error updating time for ${city.name}:`, error);
        }
    });
}

// 初始化函数
function init() {
    const grid = document.getElementById('worldTimeGrid');
    cities.forEach(city => {
        grid.appendChild(createTimeCard(city));
    });
    
    // 立即更新一次时间
    updateAllTimes();
    
    // 每秒更新一次时间
    setInterval(updateAllTimes, 1000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);