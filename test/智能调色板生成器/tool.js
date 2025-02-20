// 获取显示元素
const colorWheel = document.getElementById('colorWheel');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');
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

// 颜色转换函数
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHex({ r, g, b }) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function hexToHSL(hex) {
    let { r, g, b } = hexToRgb(hex);
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h = h * 60;
    }
    
    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// 生成状态颜色
function generateSemanticColors(baseColor) {
    const baseHsl = hexToHSL(baseColor);
    
    return {
        success: hslToHex(120, 65, 55),  // 柔和的绿色
        info: hslToHex(baseHsl.h, Math.min(95, baseHsl.s + 10), Math.min(65, baseHsl.l + 10)),  // 基于主色的亮蓝色
        warning: hslToHex(40, 90, 60),  // 鲜艳的橙黄色
        danger: hslToHex(5, 95, 55)  // 鲜艳的红色
    };
}

// 生成梯度颜色
function generateShades(hex) {
    const shades = [];
    const hsl = hexToHSL(hex);
    
    // 生成19个梯度（50-950）
    for (let i = 1; i <= 19; i++) {
        const level = i * 50;
        let shade;
        
        if (level === 500) {
            // 500级别使用原始颜色
            shade = hex;
        } else if (level < 500) {
            // 500以下，保持色相，保持较高饱和度，提高亮度
            const progress = (500 - level) / 450; // 从0到1的进度
            const lightness = 95 - (95 - hsl.l) * (1 - progress); // 从95%逐渐降低到原始亮度
            const saturation = Math.max(hsl.s * 0.95, hsl.s * (1 - progress * 0.3)); // 保持较高饱和度
            shade = hslToHex(hsl.h, saturation, lightness);
        } else {
            // 500以上，保持色相，增加饱和度，降低亮度
            const progress = (level - 500) / 450; // 从0到1的进度
            const lightness = Math.max(5, hsl.l * (1 - progress * 0.8)); // 降低到最少5%的亮度
            const saturation = Math.min(100, hsl.s * (1 + progress * 0.1)); // 略微增加饱和度
            shade = hslToHex(hsl.h, saturation, lightness);
        }
        
        shades.push({
            hex: shade,
            level: level
        });
    }
    
    return shades;
}

// 更新颜色显示
function updateColorDisplay(color) {
    // 更新颜色值显示
    hexValue.textContent = color.toUpperCase();
    rgbValue.textContent = `rgb(${Object.values(hexToRgb(color)).join(', ')})`;
    
    // 更新状态颜色
    const semanticValues = generateSemanticColors(color);
    Object.entries(semanticColors).forEach(([key, elements]) => {
        const colorValue = semanticValues[key];
        elements.box.style.backgroundColor = colorValue;
        elements.hex.textContent = colorValue;
    });
    
    // 更新梯度颜色
    const shades = generateShades(color);
    shadesGrid.innerHTML = shades.map(shade => `
        <div class="shade-item">
            <div class="shade-box" style="background-color: ${shade.hex}"></div>
            <span class="shade-value">${shade.hex}</span>
            <span class="shade-level">${shade.level}</span>
        </div>
    `).join('');
    
    // 添加点击复制功能
    shadesGrid.querySelectorAll('.shade-value').forEach(el => {
        el.addEventListener('click', () => copyColorValue(el.textContent));
    });
}

// 复制颜色值
function copyColorValue(value) {
    navigator.clipboard.writeText(value).then(() => {
        showToast('颜色值已复制到剪贴板');
    });
}

// 监听颜色变化
colorWheel.addEventListener('input', (event) => {
    updateColorDisplay(event.target.value);
});

// 添加点击复制功能
hexValue.addEventListener('click', () => copyColorValue(hexValue.textContent));
rgbValue.addEventListener('click', () => copyColorValue(rgbValue.textContent));
Object.values(semanticColors).forEach(({ hex }) => {
    hex.addEventListener('click', () => copyColorValue(hex.textContent));
});

// 初始化显示
updateColorDisplay(colorWheel.value);