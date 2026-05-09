// DOM 元素
const totalInput = document.getElementById('bar-total');
const longValue = document.getElementById('bar-long');
const shortValue = document.getElementById('bar-short');
const ratioTabs = document.querySelectorAll('.ratio-tab');
const barL = document.querySelector('.bar-l');
const barR = document.querySelector('.bar-r');

// 状态变量
let currentRatio = 1.618; // 默认黄金比例

// 计算黄金分割
function calculateRatio(total, ratio) {
    const long = Math.round(total * (ratio / (1 + ratio)));
    const short = total - long;
    return { long, short };
}

// 更新预览
function updatePreview(long, short, total) {
    // 更新数值显示
    longValue.textContent = long;
    shortValue.textContent = short;
    
    // 更新预览条
    const longPercent = (long / total) * 100;
    const shortPercent = (short / total) * 100;
    
    barL.style.width = `${longPercent}%`;
    barR.style.width = `${shortPercent}%`;
    
    // 更新数值显示
    barL.textContent = `${long}px`;
    barR.textContent = `${short}px`;
}

// 处理输入变化
function handleInputChange() {
    const total = parseInt(totalInput.value) || 0;
    const { long, short } = calculateRatio(total, currentRatio);
    updatePreview(long, short, total);
}

// 处理比例切换
function handleRatioChange(ratio) {
    currentRatio = parseFloat(ratio);
    handleInputChange();
    
    // 更新按钮状态
    ratioTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.ratio === ratio.toString());
    });
}

// 输入框焦点效果
function handleInputFocus(e) {
    e.target.closest('.size-input').classList.add('focused');
}

function handleInputBlur(e) {
    e.target.closest('.size-input').classList.remove('focused');
}

// 事件监听
totalInput.addEventListener('input', handleInputChange);
totalInput.addEventListener('focus', handleInputFocus);
totalInput.addEventListener('blur', handleInputBlur);

ratioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        handleRatioChange(tab.dataset.ratio);
    });
});

// 初始化
handleInputChange();

