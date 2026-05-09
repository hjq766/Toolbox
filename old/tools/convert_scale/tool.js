// DOM元素
let widthInput, heightInput, widthInputWrapper, heightInputWrapper;
let currentRatioText, ratioValue, simpleRatio, currentWidth, currentHeight;
let widthHint, heightHint, previewBox, scaleInfo, externalLabel;
let swapBtn, copyBtn, resetBtn;

// 状态变量
let currentRatio = 16/9; // 当前比例 (宽/高)
let lastActiveInput = 'width'; // 最后活跃的输入框
let isCalculating = false; // 防止循环计算

// 常用比例预设
const ratioPresets = {
    '16:9': 16/9,
    '16:10': 16/10,
    '21:9': 21/9,
    '4:3': 4/3,
    '9:19.5': 9/19.5,
    '9:20': 9/20,
    '9:16': 9/16,
    '10:16': 10/16,
    '3:4': 3/4,
    '7:5': 7/5,
    '3:2': 3/2,
    '5:3': 5/3,
    '5:4': 5/4,
    '2:3': 2/3,
    '1:1': 1,
    '4:5': 4/5,
    '1.618:1': 1.618, // 黄金比例
    '√2:1': Math.sqrt(2) // A4纸张比例
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    initDefaultValues();
    updatePreview();
});

// 初始化DOM元素
function initElements() {
    widthInput = document.getElementById('widthInput');
    heightInput = document.getElementById('heightInput');
    widthInputWrapper = document.getElementById('widthInputWrapper');
    heightInputWrapper = document.getElementById('heightInputWrapper');
    
    currentRatioText = document.getElementById('currentRatioText');
    ratioValue = document.getElementById('ratioValue');
    simpleRatio = document.getElementById('simpleRatio');
    currentWidth = document.getElementById('currentWidth');
    currentHeight = document.getElementById('currentHeight');
    
    widthHint = document.getElementById('widthHint');
    heightHint = document.getElementById('heightHint');
    previewBox = document.getElementById('previewBox');
    scaleInfo = document.getElementById('scaleInfo');
    externalLabel = document.getElementById('externalLabel');
    
    swapBtn = document.getElementById('swapBtn');
    copyBtn = document.getElementById('copyBtn');
    resetBtn = document.getElementById('resetBtn');
}

// 初始化事件监听器
function initEventListeners() {
    // 输入框事件
    widthInput.addEventListener('input', handleWidthInput);
    heightInput.addEventListener('input', handleHeightInput);
    widthInput.addEventListener('focus', handleInputFocus);
    heightInput.addEventListener('focus', handleInputFocus);
    widthInput.addEventListener('blur', handleInputBlur);
    heightInput.addEventListener('blur', handleInputBlur);
    
    // 比例预设按钮
    document.querySelectorAll('.ratio-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const ratio = tab.dataset.ratio;
            handleRatioChange(ratio);
            
            // 更新按钮状态
            document.querySelectorAll('.ratio-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // 快捷操作按钮
    swapBtn.addEventListener('click', handleSwap);
    copyBtn.addEventListener('click', handleCopy);
    resetBtn.addEventListener('click', handleReset);
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    handleSwap();
                    break;
                case 'c':
                    if (document.activeElement === widthInput || document.activeElement === heightInput) {
                        e.preventDefault();
                        handleCopy();
                    }
                    break;
                case 'd':
                    e.preventDefault();
                    handleReset();
                    break;
            }
        }
    });
}

// 初始化默认值
function initDefaultValues() {
    widthInput.value = '1920';
    heightInput.value = '1080';
    currentRatio = 16/9;
    updateActiveRatioTab();
    updateInputHints();
    updatePreview();
}

// 输入框事件处理 - 支持双向计算
function handleWidthInput() {
    if (isCalculating) return;
    
    const width = parseInt(widthInput.value);
    lastActiveInput = 'width';
    
    if (!validateInput(widthInput, width)) return;
    
    if (width && currentRatio) {
        isCalculating = true;
        const height = Math.round(width / currentRatio);
        heightInput.value = height;
        isCalculating = false;
    }
    
    updatePreview();
}

// 输入框事件处理 - 支持双向计算
function handleHeightInput() {
    if (isCalculating) return;
    
    const height = parseInt(heightInput.value);
    lastActiveInput = 'height';
    
    if (!validateInput(heightInput, height)) return;
    
    if (height && currentRatio) {
        isCalculating = true;
        const width = Math.round(height * currentRatio);
        widthInput.value = width;
        isCalculating = false;
    }
    
    updatePreview();
}

// 输入框焦点效果
function handleInputFocus(e) {
    const wrapper = e.target.parentElement;
    wrapper.classList.add('focused');
    
    if (e.target === widthInput) {
        lastActiveInput = 'width';
        widthHint.classList.add('active');
        heightHint.classList.remove('active');
    } else {
        lastActiveInput = 'height';
        heightHint.classList.add('active');
        widthHint.classList.remove('active');
    }
}

// 输入框焦点效果
function handleInputBlur(e) {
    const wrapper = e.target.parentElement;
    wrapper.classList.remove('focused');
    widthHint.classList.remove('active');
    heightHint.classList.remove('active');
}

// 输入验证
function validateInput(input, value) {
    const wrapper = input.parentElement;
    
    // 清除之前的状态
    wrapper.classList.remove('error', 'success', 'warning');
    
    if (isNaN(value) || value <= 0 || !Number.isInteger(value)) {
        if (input.value !== '') {
            wrapper.classList.add('error');
            return false;
        }
        return true;
    }
    
    if (value > 10000) {
        wrapper.classList.add('warning');
    } else {
        wrapper.classList.add('success');
    }
    
    return true;
}

// 更新输入提示
function updateInputHints() {
    widthHint.textContent = '输入宽度，自动计算高度';
    heightHint.textContent = '输入高度，自动计算宽度';
}

// 更新激活的比例按钮
function updateActiveRatioTab() {
    const currentRatioStr = getCurrentRatioString();
    
    document.querySelectorAll('.ratio-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.ratio === currentRatioStr) {
            tab.classList.add('active');
        }
    });
}

// 显示提示消息
function showToast(message) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-size: 14px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 快捷操作功能
function handleSwap() {
    const width = widthInput.value;
    const height = heightInput.value;
    
    widthInput.value = height;
    heightInput.value = width;
    
    currentRatio = 1 / currentRatio;
    updateActiveRatioTab();
    
    updatePreview();
    showToast('已交换宽高');
}

// 快捷操作功能
function handleCopy() {
    const width = widthInput.value || '0';
    const height = heightInput.value || '0';
    const text = `${width} × ${height}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('尺寸已复制到剪贴板');
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('尺寸已复制到剪贴板');
    });
}

// 快捷操作功能
function handleReset() {
    widthInput.value = '1920';
    heightInput.value = '1080';
    currentRatio = 16/9;
    
    updateActiveRatioTab();
    updateInputHints();
    updatePreview();
    showToast('已重置为默认尺寸');
}

// 处理比例切换
function handleRatioChange(ratioStr) {
    
    let ratio;
    
    // 处理特殊比例
    if (ratioStr === '√2:1') {
        ratio = Math.sqrt(2);
    } else if (ratioStr === '1.618:1') {
        ratio = 1.618;
    } else if (ratioPresets[ratioStr]) {
        ratio = ratioPresets[ratioStr];
    } else {
        // 解析自定义比例，如 "16:9"
        const parts = ratioStr.split(':');
        if (parts.length === 2) {
            const w = parseFloat(parts[0]);
            const h = parseFloat(parts[1]);
            if (w && h) {
                ratio = w / h;
            }
        }
    }
    
    if (!ratio) return;
    
    currentRatio = ratio;
    
    // 根据最后活跃的输入框重新计算
    if (lastActiveInput === 'width' && widthInput.value) {
        const width = parseInt(widthInput.value);
        const height = Math.round(width / ratio);
        heightInput.value = height;
    } else if (lastActiveInput === 'height' && heightInput.value) {
        const height = parseInt(heightInput.value);
        const width = Math.round(height * ratio);
        widthInput.value = width;
    } else {
        // 如果没有输入值，使用默认值
        widthInput.value = '1920';
        const height = Math.round(1920 / ratio);
        heightInput.value = height;
    }
    
    updatePreview();
}

// 获取当前比例字符串
function getCurrentRatioString() {
    // 查找匹配的预设比例
    for (const [key, value] of Object.entries(ratioPresets)) {
        if (Math.abs(value - currentRatio) < 0.001) {
            return key;
        }
    }
    
    // 如果没有匹配的预设，返回简化比例
    const width = parseInt(widthInput.value) || 1;
    const height = parseInt(heightInput.value) || 1;
    const simplified = calculateSimpleRatio(width, height);
    return `${simplified.width}:${simplified.height}`;
}

// 工具函数
function calculateSimpleRatio(width, height) {
    const gcdValue = gcd(Math.round(width), Math.round(height));
    return {
        width: Math.round(width) / gcdValue,
        height: Math.round(height) / gcdValue
    };
}

// 工具函数
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// 工具函数
function updatePreview() {
    const width = parseInt(widthInput.value) || 0;
    const height = parseInt(heightInput.value) || 0;
    
    if (width <= 0 || height <= 0) return;
    
    // 更新比例显示
    const ratioStr = getCurrentRatioString();
    currentRatioText.textContent = ratioStr;
    ratioValue.textContent = currentRatio.toFixed(3);
    
    // 更新详情
    const simplified = calculateSimpleRatio(width, height);
    simpleRatio.textContent = `${simplified.width}:${simplified.height}`;
    currentWidth.textContent = width;
    currentHeight.textContent = height;
    
    // 更新预览
    const previewArea = document.getElementById('previewArea');
    const maxWidth = previewArea.clientWidth - 40;
    const maxHeight = previewArea.clientHeight - 40;
    
    let previewWidth, previewHeight, scale;
    
    // 计算预览尺寸和缩放比例 - 使用容器的实际大小
    if (width / height > maxWidth / maxHeight) {
        // 宽度受限
        previewWidth = maxWidth * 0.8;  // 使用容器80%的宽度
        previewHeight = previewWidth / (width / height);
        scale = previewWidth / width;
    } else {
        // 高度受限
        previewHeight = maxHeight * 0.8;  // 使用容器80%的高度
        previewWidth = previewHeight * (width / height);
        scale = previewHeight / height;
    }
    
    // 应用预览尺寸
    previewBox.style.width = `${previewWidth}px`;
    previewBox.style.height = `${previewHeight}px`;
    previewBox.setAttribute('data-size', `${width} × ${height}`);
    
    // 更新缩放信息
    if (scale >= 1) {
        scaleInfo.textContent = `放大比例: ${scale.toFixed(1)}:1`;
    } else {
        scaleInfo.textContent = `缩放比例: 1:${(1/scale).toFixed(1)}`;
    }
    
    // 处理小预览框的标签显示
    if (previewWidth < 100 || previewHeight < 60) {
        previewBox.classList.add('small-preview');
        externalLabel.style.display = 'block';
        externalLabel.textContent = `${width} × ${height}`;
    } else {
        previewBox.classList.remove('small-preview');
        externalLabel.style.display = 'none';
    }
}