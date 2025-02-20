// DOM 元素
const colorPicker = document.querySelector('.color-picker');
const colorInput = document.getElementById('colorInput');
const clearBtn = document.getElementById('clearBtn');
const resultGrid = document.getElementById('resultGrid');
const shadesGrid = document.getElementById('shadesGrid');

// 状态颜色元素
const semanticColors = {
    success: {
        box: document.getElementById('successColor'),
        hex: document.getElementById('successHex')
    },
    info: {
        box: document.getElementById('infoColor'),
        hex: document.getElementById('infoHex')
    },
    warning: {
        box: document.getElementById('warningColor'),
        hex: document.getElementById('warningHex')
    },
    danger: {
        box: document.getElementById('dangerColor'),
        hex: document.getElementById('dangerHex')
    }
};

// 标签页切换
const tabHeaders = document.querySelectorAll('.tab-header');
const tabPanels = document.querySelectorAll('.tab-panel');

tabHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const targetTab = header.dataset.tab;
        
        // 更新标签页状态
        tabHeaders.forEach(h => h.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        header.classList.add('active');
        document.querySelector(`.tab-panel[data-tab="${targetTab}"]`).classList.add('active');
    });
});

// 更新调色方案
function updateColorSchemes(color) {
    const tc = tinycolor(color);
    
    // 互补色方案
    const complementary = tc.complement();
    document.getElementById('complementaryScheme').innerHTML = `
        ${createColorBox(tc)}
        ${createColorBox(complementary)}
    `;

    // 三分色方案
    const triadic = tc.triad();
    document.getElementById('triadicScheme').innerHTML = triadic.map(c => createColorBox(c)).join('');

    // 分裂互补色方案
    const splitComplementary = tc.splitcomplement();
    document.getElementById('splitComplementaryScheme').innerHTML = splitComplementary.map(c => createColorBox(c)).join('');

    // 类似色方案
    const analogous = tc.analogous();
    document.getElementById('analogousScheme').innerHTML = analogous.map(c => createColorBox(c)).join('');

    // 四分色方案
    const tetradic = tc.tetrad();
    document.getElementById('tetradicScheme').innerHTML = tetradic.map(c => createColorBox(c)).join('');
}

// 创建颜色盒子
function createColorBox(color) {
    const hex = tinycolor(color).toHexString();
    return `
        <div class="color-item">
            <div class="color-box" style="background-color: ${hex}" onclick="copyToClipboard('${hex}')"></div>
            <div class="color-hex" onclick="copyToClipboard('${hex}')">${hex}</div>
        </div>
    `;
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('颜色代码已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败，请重试');
    });
}

// 显示提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 100);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始颜色
    const initialColor = '#2196f3';
    
    if (colorPicker && colorInput) {
        colorPicker.value = initialColor;
        colorInput.value = initialColor;
        updateColorSchemes(initialColor);
        
        // 颜色输入事件
        colorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            colorInput.value = color;
            updateColorSchemes(color);
        });
        
        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            if (tinycolor(color).isValid()) {
                colorPicker.value = color;
                updateColorSchemes(color);
            }
        });
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                colorInput.value = '';
                colorInput.focus();
            });
        }
    }
});