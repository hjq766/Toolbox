// 颜色转换核心功能
function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
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
    return `#${f(0)}${f(8)}${f(4)}`;
}

// 调色板生成功能
function generateShades(hex) {
    const shades = [];
    const hsl = hexToHSL(hex);
    
    for (let i = 1; i <= 9; i++) {
        const lightness = 95 - (i * 10);
        const shade = hslToHex(hsl.h, hsl.s, lightness);
        shades.push({
            name: `${i}00`,
            color: shade
        });
    }
    
    return shades;
}

function generateComplementaryColors(hex) {
    const hsl = hexToHSL(hex);
    return [
        { name: 'Primary', color: hex },
        { name: 'Complementary', color: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l) }
    ];
}

function generateAnalogousColors(hex) {
    const hsl = hexToHSL(hex);
    return [
        { name: 'Analogous 1', color: hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l) },
        { name: 'Primary', color: hex },
        { name: 'Analogous 2', color: hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l) }
    ];
}

// 系统色板功能
function updateSystemColors(baseColor) {
    // 更新系统色板
    const systemColors = generateSystemColors(baseColor);
    
    // 更新每个系统色的梯度
    Object.entries(systemColors).forEach(([name, color]) => {
        const shades = generateShades(color);
        let shadesHtml = `
            <div class="color-scale-blocks">
                ${shades.map(shade => `
                    <div class="color-scale-block" 
                         style="background-color: ${shade.color}" 
                         data-color="${shade.color}"
                         onclick="copyToClipboard('${shade.color}')">
                    </div>
                `).join('')}
            </div>
        `;
        const elementId = `${name.toLowerCase()}_shades`;
        if (document.getElementById(elementId)) {
            document.getElementById(elementId).innerHTML = shadesHtml;
        }
    });

    // 更新互补色系
    const complementaryColors = generateComplementaryColors(baseColor);
    const complementaryHtml = complementaryColors.map(color => `
        <div class="shade-item" onclick="copyToClipboard('${color.color}')">
            <div class="shade-preview" style="background-color: ${color.color}"></div>
            <div class="shade-info">${color.name}: ${color.color}</div>
        </div>
    `).join('');
    document.getElementById('complementary_colors').innerHTML = complementaryHtml;

    // 更新类似色系
    const analogousColors = generateAnalogousColors(baseColor);
    const analogousHtml = analogousColors.map(color => `
        <div class="shade-item" onclick="copyToClipboard('${color.color}')">
            <div class="shade-preview" style="background-color: ${color.color}"></div>
            <div class="shade-info">${color.name}: ${color.color}</div>
        </div>
    `).join('');
    document.getElementById('analogous_colors').innerHTML = analogousHtml;
}

function generateSystemColors(baseColor) {
    // 确保 baseColor 是有效的十六进制颜色值
    if (!baseColor.startsWith('#')) {
        baseColor = '#' + baseColor;
    }
    
    const hsl = hexToHSL(baseColor);
    // 保持主色的饱和度和亮度特征，但适当调整以确保每个语义色都清晰可见
    const baseSaturation = hsl.s;  // 使用原始饱和度
    const baseLightness = hsl.l;   // 使用原始亮度
    
    return {
        primary: baseColor,        // 直接使用输入的颜色值
        success: hslToHex(142, baseSaturation, baseLightness),
        info: hslToHex(200, baseSaturation, baseLightness),
        warning: hslToHex(35, baseSaturation, baseLightness),
        danger: hslToHex(0, baseSaturation, baseLightness)
    };
}


// 添加重新生成系统色的函数
function regenerateSystemColors() {
    const currentColor = document.getElementById('input_color').value || '#2196f3';
    updateSystemColors(currentColor);
}

// 工具函数
function clearInput() {
    document.getElementById('input_color').value = '';
    document.getElementById('result_grid').innerHTML = '';
}

function inputExample(e) {
    let color = e.dataset.color || e.innerText;
    document.getElementById('input_color').value = color;
    convert();
}

function toggleColorReference() {
    const library = document.getElementById('colorLibrary');
    if (library.style.display === 'none') {
        library.style.display = 'block';
    } else {
        library.style.display = 'none';
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败');
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// 初始化
const originalConvert = convert;
convert = function(val) {
    originalConvert(val);
    if (val) {
        updateSystemColors(val);
    }
}

// 初始化页面
convert('#2196f3');