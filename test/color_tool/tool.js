// 获取DOM元素
const colorWheel = document.getElementById('colorWheel');
const colorInput = document.getElementById('colorInput');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');
const hslValue = document.getElementById('hslValue');
const opacitySlider = document.getElementById('opacitySlider');
const opacityValue = document.getElementById('opacityValue');

// 颜色转换函数
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
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

function rgbToHSB(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    
    let h, s, v = max;
    s = max === 0 ? 0 : d / max;
    
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        b: Math.round(v * 100)
    };
}

function rgbToCMYK(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }
    
    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);
    
    return { c, m, y, k };
}

// 颜色解析函数
// 添加新的颜色转换函数
function rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) {
        return { h: 0, s: 0, l: Math.round(l * 100) };
    }
    
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    
    switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    
    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hexToHWB(hex) {
    const { r, g, b } = hexToRgb(hex);
    const white = Math.min(r, g, b) / 255;
    const black = 1 - Math.max(r, g, b) / 255;
    const hsv = rgbToHSB(r, g, b);
    
    return {
        h: hsv.h,
        w: Math.round(white * 100),
        b: Math.round(black * 100)
    };
}

function hexToLAB(hex) {
    const { r, g, b } = hexToRgb(hex);
    
    // sRGB to XYZ
    let rs = r / 255;
    let gs = g / 255;
    let bs = b / 255;
    
    rs = rs > 0.04045 ? Math.pow((rs + 0.055) / 1.055, 2.4) : rs / 12.92;
    gs = gs > 0.04045 ? Math.pow((gs + 0.055) / 1.055, 2.4) : gs / 12.92;
    bs = bs > 0.04045 ? Math.pow((bs + 0.055) / 1.055, 2.4) : bs / 12.92;
    
    const x = rs * 0.4124 + gs * 0.3576 + bs * 0.1805;
    const y = rs * 0.2126 + gs * 0.7152 + bs * 0.0722;
    const z = rs * 0.0193 + gs * 0.1192 + bs * 0.9505;
    
    // XYZ to Lab
    const xn = 0.95047;
    const yn = 1.00000;
    const zn = 1.08883;
    
    const fx = x > 0.008856 ? Math.pow(x / xn, 1/3) : (7.787 * x / xn) + 16/116;
    const fy = y > 0.008856 ? Math.pow(y / yn, 1/3) : (7.787 * y / yn) + 16/116;
    const fz = z > 0.008856 ? Math.pow(z / zn, 1/3) : (7.787 * z / zn) + 16/116;
    
    return {
        l: Math.round((116 * fy) - 16),
        a: Math.round(500 * (fx - fy)),
        b: Math.round(200 * (fy - fz))
    };
}

// 在 parseColor 函数中添加新的格式
// 在 parseColor 函数中添加 HEX8 格式
function parseColor(input) {
    input = input.trim().toLowerCase();
    let match;
    let color = {};

    // HEX 格式
    if (input.startsWith('#')) {
        color.hex = input.toUpperCase();
        color.hex8 = color.hex + 'FF'; // 添加 HEX8 格式（完全不透明）
        const rgb = hexToRgb(input);
        color.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        color.rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        const hsl = hexToHSL(input);
        color.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        const hsb = rgbToHSB(rgb.r, rgb.g, rgb.b);
        color.hsb = `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
        const cmyk = rgbToCMYK(rgb.r, rgb.g, rgb.b);
        color.cmyk = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        const hwb = hexToHWB(input);
        color.hwb = `hwb(${hwb.h}, ${hwb.w}%, ${hwb.b}%)`;
        const lab = hexToLAB(input);
        color.lab = `lab(${lab.l}, ${lab.a}, ${lab.b})`;
        return color;
    }

    // RGB 格式
    match = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match) {
        const [_, r, g, b] = match.map(Number);
        color.rgb = input;
        color.hex = rgbToHex({r, g, b});
        return parseColor(color.hex); // 重用 HEX 的转换逻辑
    }

    return null;
}

// 生成色阶
function generateShades(hex) {
    const shades = [];
    const hsl = hexToHSL(hex);
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 从 0 到 900，每次增加 50
    for (let i = 0; i <= 18; i++) {
        const level = isDarkMode ? (900 - i * 50) : (i * 50); // 在深色模式下反转 level
        let shade;
        
        if (level === 500) {
            shade = hex;
        } else if (level < 500) {
            const progress = (500 - level) / 500;
            const lightness = 98 - (98 - hsl.l) * (1 - progress);
            const saturation = Math.max(hsl.s * 0.95, hsl.s * (1 - progress * 0.3));
            shade = hslToHex(hsl.h, saturation, lightness);
        } else {
            const progress = (level - 500) / 400;
            const lightness = Math.max(2, hsl.l * (1 - progress * 0.8));
            const saturation = Math.min(100, hsl.s * (1 + progress * 0.1));
            shade = hslToHex(hsl.h, saturation, lightness);
        }
        
        shades.push({
            hex: shade,
            level: isDarkMode ? (900 - level) : level // 确保显示的 level 值也相应反转
        });
    }
    
    return shades;
}

// 监听主题变化并更新色阶
document.addEventListener('DOMContentLoaded', () => {
    // 创建观察器来监听 data-theme 属性的变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                // 主题改变时重新生成色阶
                const currentColor = colorWheel.value;
                updateColorDisplay(currentColor);
            }
        });
    });

    // 开始观察 html 元素的 data-theme 属性变化
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // 默认显示 CSS 变量
    const color = colorWheel.value;
    exportVariables('css');
    
    // 设置 CSS 按钮为激活状态
    document.querySelector('[onclick="exportVariables(\'css\')"]').classList.add('active');
    
    // 添加按钮点击效果
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新三角形位置
            const preview = document.querySelector('.export-preview');
            if (preview) {
                preview.style.setProperty('--triangle-left', `${btn.offsetLeft + btn.offsetWidth/2}px`);
            }
        });
    });

});

// 生成状态颜色
function generateSemanticColors(baseColor) {
    const baseHsl = hexToHSL(baseColor);
    
    return {
        // 成功色：保持绿色色相，但根据主色调整饱和度和亮度
        success: hslToHex(
            120, 
            Math.min(90, baseHsl.s + 5), 
            Math.min(60, baseHsl.l + 5)
        ),
        
        // 信息色：使用主色，略微调整
        info: hslToHex(
            baseHsl.h,
            Math.min(95, baseHsl.s + 10),
            Math.min(65, baseHsl.l + 10)
        ),
        
        // 警告色：保持橙色色相，但参考主色的饱和度和亮度
        warning: hslToHex(
            40,
            Math.min(95, baseHsl.s + 15),
            Math.min(65, Math.max(45, baseHsl.l))
        ),
        
        // 危险色：保持红色色相，但参考主色的饱和度和亮度
        danger: hslToHex(
            5,
            Math.min(100, baseHsl.s + 20),
            Math.min(60, Math.max(40, baseHsl.l - 5))
        )
    };
}

// 生成配色方案
function generateColorSchemes(hex) {
    const hsl = hexToHSL(hex);
    
    return {
        complementary: [
            { name: 'Primary', color: hex },
            { name: 'Complement', color: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l) }
        ],
        splitComplementary: [
            { name: 'Primary', color: hex },
            { name: 'Split 1', color: hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l) },
            { name: 'Split 2', color: hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l) }
        ],
        analogous: [
            { name: 'Primary', color: hex },
            { name: 'Analogous -20°', color: hslToHex((hsl.h - 20 + 360) % 360, hsl.s, hsl.l) },
            { name: 'Analogous -10°', color: hslToHex((hsl.h - 10 + 360) % 360, hsl.s, hsl.l) },
            { name: 'Analogous +10°', color: hslToHex((hsl.h + 10) % 360, hsl.s, hsl.l) },
            { name: 'Analogous +20°', color: hslToHex((hsl.h + 20) % 360, hsl.s, hsl.l) }
        ],
        triadic: [
            { name: 'Primary', color: hex },
            { name: 'Triadic 1', color: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l) },
            { name: 'Triadic 2', color: hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l) }
        ]
    };
}

// 更新颜色显示
function updateColorDisplay(color) {
    // 更新基础颜色值显示
    const parsedColor = parseColor(color);
    if (!parsedColor) return;

    hexValue.textContent = parsedColor.hex;
    rgbValue.textContent = parsedColor.rgb;
    hslValue.textContent = parsedColor.hsl;
    
    // 更新颜色格式转换结果
    const formatsGrid = document.getElementById('colorFormats');
    formatsGrid.innerHTML = Object.entries(parsedColor).map(([format, value]) => `
        <div class="format-item" onclick="copyColorValue('${value}')">
            <div class="format-label">${format.toUpperCase()}</div>
            <div class="format-value">${value}</div>
        </div>
    `).join('');
    
    // 更新色阶
    const shades = generateShades(parsedColor.hex);
    const shadesGrid = document.getElementById('shadesGrid');
    shadesGrid.innerHTML = shades.map(shade => `
        <div class="shade-item">
            <div class="shade-box" 
                 style="background-color: ${shade.hex}"
                 onclick="copyColorValue('${shade.hex}')">
            </div>
            <span class="shade-value">${shade.hex}</span>
            <span class="shade-level">${shade.level}</span>
        </div>
    `).join('');
    
    // 更新状态颜色
    const semanticColors = generateSemanticColors(parsedColor.hex);
    const semanticGrid = document.getElementById('semanticColors');
    semanticGrid.innerHTML = Object.entries(semanticColors).map(([name, color]) => `
        <div class="semantic-color">
            <div class="semantic-box" 
                 style="background-color: ${color}"
                 onclick="copyColorValue('${color}')">
            </div>
            <span class="semantic-label">${name.charAt(0).toUpperCase() + name.slice(1)}</span>
            <span class="semantic-value">${color}</span>
        </div>
    `).join('');
    
    // 更新配色方案
    const schemes = generateColorSchemes(parsedColor.hex);
    Object.entries(schemes).forEach(([schemeName, colors]) => {
        const container = document.getElementById(`${schemeName}Colors`);
        if (container) {
            container.innerHTML = colors.map(({name, color}) => `
                <div class="scheme-color">
                    <div class="color-box" 
                         style="background-color: ${color}"
                         onclick="copyColorValue('${color}')">
                    </div>
                    <span class="color-name">${name}</span>
                    <span class="semantic-value">${color}</span>
                </div>
            `).join('');
        }
    });
}

// 复制颜色值
function copyColorValue(value) {
    navigator.clipboard.writeText(value).then(() => {
        showToast('颜色值已复制到剪贴板');
    });
}

// 清空输入
function clearInput() {
    colorInput.value = '';
    colorWheel.value = '#000000';
    updateColorDisplay('#000000');
}

// 事件监听
colorWheel.addEventListener('input', (e) => {
    colorInput.value = e.target.value;
    updateColorDisplay(e.target.value);
});

colorInput.addEventListener('input', (e) => {
    const color = parseColor(e.target.value);
    if (color) {
        colorWheel.value = color.hex;
        updateColorDisplay(color.hex);
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 确保 DOM 元素都已加载
    if (colorWheel && colorInput && hexValue && rgbValue && hslValue) {
        updateColorDisplay(colorWheel.value);
    }
    
    // 监听主题变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                const currentColor = colorWheel.value;
                updateColorDisplay(currentColor);
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});

// 在文件末尾添加导出变量相关函数
function generateVariables(color, type) {
    const parsedColor = parseColor(color);
    const shades = generateShades(color);
    const semanticColors = generateSemanticColors(color);
    
    let prefix, suffix;
    switch (type) {
        case 'css':
            prefix = '--';
            suffix = ';';
            break;
        case 'scss':
            prefix = '$';
            suffix = ';';  // 移除 !default
            break;
        case 'less':
            prefix = '@';
            suffix = ';';
            break;
    }
    
    let output = '';
    if (type === 'css') {
        output += ':root {\n';
    }
    
    // 基础颜色
    output += `    ${prefix}primary: ${parsedColor.hex}${suffix}\n`;
    output += `    ${prefix}primary-rgb: ${hexToRgb(parsedColor.hex).r}, ${hexToRgb(parsedColor.hex).g}, ${hexToRgb(parsedColor.hex).b}${suffix}\n`;
    
    // 色阶
    shades.forEach(shade => {
        output += `    ${prefix}primary-${shade.level}: ${shade.hex}${suffix}\n`;
    });
    
    // 状态颜色
    Object.entries(semanticColors).forEach(([name, value]) => {
        output += `    ${prefix}${name}: ${value}${suffix}\n`;
        // 添加 RGB 变量
        const rgb = hexToRgb(value);
        output += `    ${prefix}${name}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b}${suffix}\n`;
    });
    
    if (type === 'css') {
        output += '}';
    }
    
    // 添加使用示例
    output += '\n\n/* 使用示例 */\n';
    switch (type) {
        case 'css':
            output += '.example {\n';
            output += '    color: var(--primary);\n';
            output += '    background: rgba(var(--primary-rgb), 0.1);\n';
            output += '}';
            break;
        case 'scss':
            output += '.example {\n';
            output += '    color: $primary;\n';
            output += '    background: rgba($primary-rgb, 0.1);\n';
            output += '}';
            break;
        case 'less':
            output += '.example {\n';
            output += '    color: @primary;\n';
            output += '    background: rgba(@primary-rgb, 0.1);\n';
            output += '}';
            break;
    }
    
    return output;
}

function exportVariables(type) {
    const color = colorWheel.value;
    const code = generateVariables(color, type);
    const exportCode = document.getElementById('exportCode');
    exportCode.textContent = code;
}

// 添加一个专门的复制代码按钮函数
function copyExportCode() {
    const exportCode = document.getElementById('exportCode');
    copyColorValue(exportCode.textContent);
}