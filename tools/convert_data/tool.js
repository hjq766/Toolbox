// DOM 元素
const datePicker = document.getElementById('datePicker');
const timePicker = document.getElementById('timePicker');
const timestamp = document.getElementById('timestamp');
const resultContent = document.getElementById('resultContent');
const copyBtn = document.getElementById('copyBtn');
const formatTabs = document.querySelectorAll('.format-tab');
const customFormatInput = document.getElementById('customFormat');

// 当前选中的格式
let currentFormat = 'YYYY-MM-DD'; // 默认格式改为标准日期

// 自动更新时间的定时器
let timeInterval;

// 格式化日期
function formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    let result = format;
    result = result.replace('YYYY', year);
    result = result.replace('MM', month);
    result = result.replace('DD', day);
    result = result.replace('HH', hours);
    result = result.replace('mm', minutes);
    result = result.replace('ss', seconds);

    return result;
}

// 更新结果
function updateResult(date) {
    if (!date || isNaN(date.getTime())) {
        resultContent.textContent = '';
        return;
    }

    const format = customFormatInput?.style.display !== 'none' && customFormatInput?.value
        ? customFormatInput.value
        : currentFormat;

    resultContent.textContent = formatDate(date, format);
}

// 自动更新当前时间
function startTimeUpdate() {
    if (timeInterval) {
        clearInterval(timeInterval);
    }

    function updateCurrentTime() {
        const now = new Date();
        
        // 转换为中国时区的时间字符串
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        // 分别设置日期和时间
        datePicker.value = `${year}-${month}-${day}`;
        timePicker.value = `${hours}:${minutes}:${seconds}`;
        
        // 更新时间戳
        timestamp.value = Math.floor(now.getTime() / 1000);
        
        // 更新结果
        updateResult(now);
    }

    updateCurrentTime();
    timeInterval = setInterval(updateCurrentTime, 1000);
}

// 设置当前时间
function setCurrentTime() {
    startTimeUpdate();
}

// 解析输入
function parseInput() {
    let date;
    
    if (timestamp.value) {
        date = new Date(timestamp.value * 1000);
    } else {
        // 组合日期和时间
        const dateValue = datePicker.value;
        const timeValue = timePicker.value || '00:00:00';
        date = new Date(`${dateValue}T${timeValue}`);
    }

    if (date && !isNaN(date.getTime())) {
        if (timeInterval) {
            clearInterval(timeInterval);
        }
        // 更新所有输入框
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        datePicker.value = `${year}-${month}-${day}`;
        timePicker.value = `${hours}:${minutes}:${seconds}`;
        timestamp.value = Math.floor(date.getTime() / 1000);
        
        updateResult(date);
    } else {
        showToast('请输入有效的日期时间');
    }
}

// 监听日期或时间变化
[datePicker, timePicker].forEach(input => {
    input.addEventListener('input', function() {
        if (timeInterval) {
            clearInterval(timeInterval);
        }
        // 只有当日期和时间都有值时才进行转换
        if (datePicker.value) {
            const dateValue = datePicker.value;
            const timeValue = timePicker.value || '00:00:00';
            const date = new Date(`${dateValue}T${timeValue}`);
            
            if (!isNaN(date.getTime())) {
                // 更新时间戳
                timestamp.value = Math.floor(date.getTime() / 1000);
                // 更新结果
                updateResult(date);
            }
        }
    });
});

// 时间戳输入框变化时
timestamp.addEventListener('input', function() {
    if (this.value) {
        const date = new Date(this.value * 1000);
        if (!isNaN(date.getTime())) {
            if (timeInterval) {
                clearInterval(timeInterval);
            }
            // 更新日期和时间选择器
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            
            datePicker.value = `${year}-${month}-${day}`;
            timePicker.value = `${hours}:${minutes}:${seconds}`;
            updateResult(date);
        }
    }
});

// 格式切换按钮点击事件
document.querySelectorAll('.format-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.format-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFormat = tab.dataset.format;
        
        // 如果有日期，直接更新结果
        if (datePicker.value) {
            const dateValue = datePicker.value;
            const timeValue = timePicker.value || '00:00:00';
            const date = new Date(`${dateValue}T${timeValue}`);
            if (!isNaN(date.getTime())) {
                updateResult(date);
            }
        }
    });
});

// 格式类型切换（常用/自定义）
document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const isCustom = tab.dataset.format === 'custom';
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelector('.format-presets').style.display = isCustom ? 'none' : 'block';
        document.querySelector('.custom-format').style.display = isCustom ? 'block' : 'none';
        
        // 如果有日期，直接更新结果
        if (datePicker.value) {
            const dateValue = datePicker.value;
            const timeValue = timePicker.value || '00:00:00';
            const date = new Date(`${dateValue}T${timeValue}`);
            if (!isNaN(date.getTime())) {
                updateResult(date);
            }
        }
    });
});

// 自定义格式输入变化时
customFormatInput?.addEventListener('input', function() {
    // 如果有日期，直接更新结果
    if (datePicker.value) {
        const dateValue = datePicker.value;
        const timeValue = timePicker.value || '00:00:00';
        const date = new Date(`${dateValue}T${timeValue}`);
        if (!isNaN(date.getTime())) {
            updateResult(date);
        }
    }
});

// 复制结果
copyBtn.addEventListener('click', () => {
    if (resultContent.textContent) {
        navigator.clipboard.writeText(resultContent.textContent)
            .then(() => showToast('已复制到剪贴板'))
            .catch(() => showToast('复制失败'));
    }
});

// 页面加载时启动自动更新
document.addEventListener('DOMContentLoaded', startTimeUpdate);

// 页面卸载时清理定时器
window.addEventListener('beforeunload', () => {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
});
