// DOM 元素
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const ratioTabs = document.querySelectorAll('.ratio-tab');
const previewWrapper = document.querySelector('.ratio-preview-wrapper');
const currentRatioDisplay = document.getElementById('currentRatio');
const ratioValueDisplay = document.getElementById('ratioValue');

// 状态变量
let currentRatio = '16:9';
let [ratioWidth, ratioHeight] = currentRatio.split(':').map(Number);
let isUpdating = false;

// 设备预设尺寸配置
const devicePresets = {
    '9:19.5': {
        width: 390,  // iPhone 标准宽度
        height: 844  // iPhone 标准高度
    },
    '9:20': {
        width: 360,  // 安卓标准宽度
        height: 800  // 安卓标准高度
    },
    '3:4': {
        width: 768,  // iPad 标准宽度
        height: 1024 // iPad 标准高度
    },
};

// 工具函数
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function calculateSimpleRatio(width, height) {
    const divisor = gcd(width, height);
    return `${width/divisor}:${height/divisor}`;
}

function updatePreview() {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    
    if (width && height) {
        // 更新比例显示
        const simpleRatio = calculateSimpleRatio(width, height);
        currentRatioDisplay.textContent = simpleRatio;
        ratioValueDisplay.textContent = (width / height).toFixed(3);
        
        // 更新预览框大小
        const previewBox = document.querySelector('.preview-box');
        const previewArea = document.querySelector('.preview-area');
        const containerWidth = previewArea.offsetWidth;
        const containerHeight = previewArea.offsetHeight;
        
        // 计算缩放比例，确保预览框完全可见
        const scaleX = (containerWidth - 48) / width;
        const scaleY = (containerHeight - 48) / height;
        const scale = Math.min(scaleX, scaleY, 1); // 限制最大缩放比例为1
        
        // 应用缩放后的尺寸
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        previewBox.style.width = `${scaledWidth}px`;
        previewBox.style.height = `${scaledHeight}px`;
    }
}

// 处理比例切换
function handleRatioChange(ratioStr) {
    currentRatio = ratioStr;
    [ratioWidth, ratioHeight] = ratioStr.split(':').map(Number);
    
    // 更新当前比例的显示
    const simpleRatio = calculateSimpleRatio(ratioWidth, ratioHeight);
    currentRatioDisplay.textContent = simpleRatio; // 更新简化比例
    
    ratioValueDisplay.textContent = (width / height).toFixed(3); // 更新比值
    
    // 检查是否是移动设备预设
    const preset = devicePresets[ratioStr];
    if (preset) {
        widthInput.value = preset.width;
        heightInput.value = preset.height;
    } else {
        widthInput.value = 1920;
        const height = Math.round(1920 * (ratioHeight / ratioWidth));
        heightInput.value = height;
    }
    
    updatePreview();
    ratioTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.ratio === ratioStr);
    });
}

// 输入框事件处理
function handleWidthInput() {
    if (isUpdating) return;
    isUpdating = true;
    
    const width = parseInt(widthInput.value);
    if (width > 0) {
        const height = Math.round(width * (ratioHeight / ratioWidth));
        heightInput.value = height;
        updatePreview();
    }
    
    isUpdating = false;
}

function handleHeightInput() {
    if (isUpdating) return;
    isUpdating = true;
    
    const height = parseInt(heightInput.value);
    if (height > 0) {
        const width = Math.round(height * (ratioWidth / ratioHeight));
        widthInput.value = width;
        updatePreview();
    }
    
    isUpdating = false;
}

// 输入框焦点效果
function handleInputFocus(e) {
    e.target.closest('.size-input').classList.add('focused');
}

function handleInputBlur(e) {
    e.target.closest('.size-input').classList.remove('focused');
}

// 事件监听
widthInput.addEventListener('input', handleWidthInput);
heightInput.addEventListener('input', handleHeightInput);

widthInput.addEventListener('focus', handleInputFocus);
widthInput.addEventListener('blur', handleInputBlur);
heightInput.addEventListener('focus', handleInputFocus);
heightInput.addEventListener('blur', handleInputBlur);

ratioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        handleRatioChange(tab.dataset.ratio);
    });
});

// 窗口大小变化时更新预览
window.addEventListener('resize', updatePreview);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updatePreview();
});
