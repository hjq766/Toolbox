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

    const fx = x > 0.008856 ? Math.pow(x / xn, 1 / 3) : (7.787 * x / xn) + 16 / 116;
    const fy = y > 0.008856 ? Math.pow(y / yn, 1 / 3) : (7.787 * y / yn) + 16 / 116;
    const fz = z > 0.008856 ? Math.pow(z / zn, 1 / 3) : (7.787 * z / zn) + 16 / 116;

    return {
        l: Math.round((116 * fy) - 16),
        a: Math.round(500 * (fx - fy)),
        b: Math.round(200 * (fy - fz))
    };
}

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
        color.hex = rgbToHex({ r, g, b });
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
        const level = isDarkMode ? (900 - i * 50) : (i * 50);
        let shade;

        if (level === 500) {
            shade = hex;
        } else if (level < 500) {
            // 调整浅色部分的计算方式
            const progress = (500 - level) / 500;
            const lightness = Math.min(98, hsl.l + (100 - hsl.l) * progress);
            const saturation = Math.max(hsl.s * 0.8, hsl.s * (1 - progress * 0.4));
            shade = hslToHex(hsl.h, saturation, lightness);
        } else {
            // 调整深色部分的计算方式
            const progress = (level - 500) / 400;
            const lightness = Math.max(5, hsl.l * (1 - progress));
            const saturation = Math.min(100, hsl.s * (1 + progress * 0.2));
            shade = hslToHex(hsl.h, saturation, lightness);
        }

        shades.push({
            hex: shade,
            level: isDarkMode ? (900 - level) : level
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
            // 确保 DOM 元素都已加载
            if (colorWheel && colorInput && hexValue && rgbValue && hslValue) {
                updateColorDisplay(colorWheel.value);
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
    const cssButton = document.querySelector('[data-format="css"]');
    if (cssButton) {
        cssButton.classList.add('active');
    }

    // 添加格式选择按钮点击效果
    document.querySelectorAll('.format-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });



});

// 生成状态颜色
function generateSemanticColors(baseColor) {
    const baseHsl = hexToHSL(baseColor);

    return {
        // 成功色：现代化的绿色，更加优雅
        success: hslToHex(
            142,  // 更偏蓝的绿色，更现代
            Math.max(65, Math.min(85, baseHsl.s)),  // 保持适中饱和度
            Math.max(35, Math.min(50, baseHsl.l))   // 适中的亮度，确保可读性
        ),

        // 信息色：清新的蓝色
        info: hslToHex(
            217,  // 更纯净的蓝色
            Math.max(70, Math.min(90, baseHsl.s)),
            Math.max(45, Math.min(60, baseHsl.l))
        ),

        // 警告色：温暖但不刺眼的橙色
        warning: hslToHex(
            35,   // 更偏红的橙色，更温暖
            Math.max(75, Math.min(90, baseHsl.s)),
            Math.max(50, Math.min(65, baseHsl.l))
        ),

        // 危险色：现代化的红色
        danger: hslToHex(
            358,  // 更纯净的红色
            Math.max(70, Math.min(85, baseHsl.s)),
            Math.max(45, Math.min(55, baseHsl.l))
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

// 复制颜色值
function copyColorValue(value) {
    // 创建一个临时的 textarea 元素
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    try {
        // 选择文本并执行复制命令
        textarea.select();
        document.execCommand('copy');
        showToast('颜色值已复制到剪贴板');
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    } finally {
        // 清理临时元素
        document.body.removeChild(textarea);
    }
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
        // 确保容器存在
        const container = document.getElementById('doughnutChart');
        if (container) {
            updateColorDisplay(colorWheel.value);
        }
    }

    // 添加 tab 切换逻辑
    const tabs = document.querySelectorAll('.form-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active 类
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // 添加当前选中的 active 类
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab') + 'Content';
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 渲染色彩参考内容
    renderColorReference();

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

    if (type === 'tailwind') {
        return generateTailwindConfig(parsedColor, shades, semanticColors);
    }

    let prefix, suffix;
    switch (type) {
        case 'css':
            prefix = '--';
            suffix = ';';
            break;
        case 'scss':
            prefix = '$';
            suffix = ';';
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

// 生成Tailwind CSS配置
function generateTailwindConfig(parsedColor, shades, semanticColors) {
    let output = '// tailwind.config.js\nmodule.exports = {\n';
    output += '  theme: {\n';
    output += '    extend: {\n';
    output += '      colors: {\n';

    // 主色系
    output += '        primary: {\n';
    output += `          DEFAULT: '${parsedColor.hex}',\n`;
    shades.forEach(shade => {
        output += `          ${shade.level}: '${shade.hex}',\n`;
    });
    output += '        },\n';

    // 状态颜色
    Object.entries(semanticColors).forEach(([name, value]) => {
        output += `        ${name}: '${value}',\n`;
    });

    output += '      }\n';
    output += '    }\n';
    output += '  }\n';
    output += '}\n\n';

    // 使用示例
    output += '/* 使用示例 */\n';
    output += '/* <div class="bg-primary text-white">主色背景</div> */\n';
    output += '/* <div class="bg-primary-100 text-primary-900">浅色背景</div> */\n';
    output += '/* <div class="text-success bg-success/10">成功状态</div> */\n';

    return output;
}

function exportVariables(type) {
    // 更新按钮激活状态
    const buttons = document.querySelectorAll('.format-tab');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-format') === type) {
            btn.classList.add('active');
        }
    });

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

// 选择预设颜色
function selectPresetColor(color) {
    colorWheel.value = color;
    colorInput.value = color;
    updateColorDisplay(color);
}

// 复制色阶SVG
function copyShadesSVG() {
    const color = colorWheel.value;
    const shades = generateShades(color);
    const svg = generateShadesSVG(shades);
    copyColorValue(svg);
    showToast('色阶SVG已复制到剪贴板');
}

// 生成色阶SVG
function generateShadesSVG(shades) {
    const width = 800;
    const height = 100;
    const rectWidth = width / shades.length;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

    shades.forEach((shade, index) => {
        const x = index * rectWidth;
        svg += `<rect x="${x}" y="0" width="${rectWidth}" height="${height}" fill="${shade.hex}"/>`;

        // 添加文字标签
        const textColor = isLightColor(shade.hex) ? '#000000' : '#ffffff';
        svg += `<text x="${x + rectWidth / 2}" y="${height / 2 + 4}" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="12">${shade.level}</text>`;
    });

    svg += '</svg>';
    return svg;
}

// 复制调色板SVG
function copySVGPalette() {
    const color = colorWheel.value;
    const shades = generateShades(color);
    const semanticColors = generateSemanticColors(color);
    const schemes = generateColorSchemes(color);

    const svg = generatePaletteSVG(color, shades, semanticColors, schemes);
    copyColorValue(svg);
    showToast('调色板SVG已复制到剪贴板');
}

// 生成完整调色板SVG
function generatePaletteSVG(primaryColor, shades, semanticColors, schemes) {
    const width = 800;
    let height = 0;
    let svg = `<svg width="${width}" xmlns="http://www.w3.org/2000/svg">`;

    // 主色
    svg += `<rect x="0" y="${height}" width="${width}" height="60" fill="${primaryColor}"/>`;
    const textColor = isLightColor(primaryColor) ? '#000000' : '#ffffff';
    svg += `<text x="20" y="${height + 35}" fill="${textColor}" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Primary: ${primaryColor}</text>`;
    height += 80;

    // 色阶
    const rectWidth = width / shades.length;
    shades.forEach((shade, index) => {
        const x = index * rectWidth;
        svg += `<rect x="${x}" y="${height}" width="${rectWidth}" height="40" fill="${shade.hex}"/>`;
        const shadeTextColor = isLightColor(shade.hex) ? '#000000' : '#ffffff';
        svg += `<text x="${x + rectWidth / 2}" y="${height + 25}" text-anchor="middle" fill="${shadeTextColor}" font-family="Arial, sans-serif" font-size="10">${shade.level}</text>`;
    });
    height += 60;

    // 状态颜色
    const semanticWidth = width / Object.keys(semanticColors).length;
    Object.entries(semanticColors).forEach(([name, color], index) => {
        const x = index * semanticWidth;
        svg += `<rect x="${x}" y="${height}" width="${semanticWidth}" height="40" fill="${color}"/>`;
        const semanticTextColor = isLightColor(color) ? '#000000' : '#ffffff';
        svg += `<text x="${x + semanticWidth / 2}" y="${height + 25}" text-anchor="middle" fill="${semanticTextColor}" font-family="Arial, sans-serif" font-size="12">${name}</text>`;
    });
    height += 40;

    svg += `</svg>`;
    return svg.replace('<svg width="800" xmlns="http://www.w3.org/2000/svg">', `<svg width="800" height="${height}" xmlns="http://www.w3.org/2000/svg">`);
}

// 导出调色板
function exportPalette() {
    const color = colorWheel.value;
    const shades = generateShades(color);
    const semanticColors = generateSemanticColors(color);
    const schemes = generateColorSchemes(color);

    const palette = {
        name: `调色板_${color}`,
        primary: color,
        shades: shades.map(s => ({ level: s.level, color: s.hex })),
        semantic: semanticColors,
        schemes: schemes,
        created: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette_${color.replace('#', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('调色板已导出');
}

// 导入调色板
function importPalette(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const palette = JSON.parse(e.target.result);
            if (palette.primary) {
                selectPresetColor(palette.primary);
                showToast('调色板导入成功');
            } else {
                showToast('调色板格式不正确');
            }
        } catch (error) {
            showToast('调色板导入失败');
        }
    };
    reader.readAsText(file);
}

// 添加判断颜色亮度的辅助函数
function isLightColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 使用相对亮度公式: (R * 299 + G * 587 + B * 114) / 1000
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}

// 计算相对亮度（WCAG标准）
function getRelativeLuminance(hex) {
    const rgb = hexToRgb(hex);
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 计算对比度比值
function getContrastRatio(color1, color2) {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// 获取WCAG等级 - 扩展版本
function getWCAGLevel(ratio, fontSize = 'normal') {
    const results = {
        ratio: ratio.toFixed(2),
        normalText: {},
        largeText: {},
        uiComponents: {}
    };

    // 普通文本 (14px+)
    if (ratio >= 7) {
        results.normalText = { level: 'AAA', text: 'AAA级', class: 'excellent', pass: true };
    } else if (ratio >= 4.5) {
        results.normalText = { level: 'AA', text: 'AA级', class: 'good', pass: true };
    } else {
        results.normalText = { level: 'Fail', text: '不合格', class: 'poor', pass: false };
    }

    // 大字体 (18px+ 或 14px+ 粗体)
    if (ratio >= 4.5) {
        results.largeText = { level: 'AAA', text: 'AAA级', class: 'excellent', pass: true };
    } else if (ratio >= 3) {
        results.largeText = { level: 'AA', text: 'AA级', class: 'good', pass: true };
    } else {
        results.largeText = { level: 'Fail', text: '不合格', class: 'poor', pass: false };
    }

    // UI组件 (按钮、表单等)
    if (ratio >= 3) {
        results.uiComponents = { level: 'AA', text: 'AA级', class: 'good', pass: true };
    } else {
        results.uiComponents = { level: 'Fail', text: '不合格', class: 'poor', pass: false };
    }

    // 兼容旧版本
    if (fontSize === 'large') {
        return results.largeText;
    }
    return results.normalText;
}

// 获取详细的WCAG结果
function getDetailedWCAGResults(ratio) {
    return {
        normalText: {
            level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail',
            pass: ratio >= 4.5
        },
        largeText: {
            level: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'Fail',
            pass: ratio >= 3
        },
        uiComponents: {
            level: ratio >= 3 ? 'AA' : 'Fail',
            pass: ratio >= 3
        }
    };
}

// 渲染色彩参考
// 修改 renderColorReference 函数中的颜色判断逻辑
function renderColorReference() {
    const referenceGrid = document.querySelector('.reference-grid');
    if (!referenceGrid) return;
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    const colorGroups = colors.map(colorSet => {
        const type = Object.keys(colorSet)[0];
        let colorList = colorSet[type];

        // 在深色模式下反转梯度色的顺序
        if (isDarkMode && ['gray', 'blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo'].includes(type)) {
            colorList = [...colorList].reverse();
        }

        return `
            <div class="color-group">
                <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                <div class="color-list">
                    ${colorList.map(color => {
            // 修改这里的判断逻辑
            let textColor;
            if (type === 'ant') {
                // Ant Design 色板的特殊处理
                const colorName = color[0].toLowerCase();
                if (['yellow-6', 'lime-6', 'gold-6'].includes(colorName)) {
                    textColor = '#1f2937'; // 深色文字
                } else {
                    textColor = 'white'; // 浅色文字
                }
            } else {
                // 其他色板保持原有逻辑
                const levelMatch = color[0].match(/\d+/);
                textColor = levelMatch
                    ? (parseInt(levelMatch[0]) >= 500 ? 'white' : '#1f2937')
                    : isLightColor(color[1]) ? '#1f2937' : 'white';
            }

            return `
                            <div class="color-item" 
                                 style="background-color: ${color[1]}; color: ${textColor}" 
                                 onclick="copyColorValue('${color[1]}')">
                                <div class="color-info">
                                    <div class="color-name">${color[0]}</div>
                                    <div class="color-value">${color[1]}</div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }).join('');

    referenceGrid.innerHTML = colorGroups;
}

// 确保在页面加载完成后调用渲染函数
document.addEventListener('DOMContentLoaded', () => {
    // ... 其他初始化代码 ...
    renderColorReference();
});

// 添加到文件末尾
document.addEventListener('DOMContentLoaded', function () {
    // 处理价格卡片的 tab 切换
    const priceTabs = document.querySelectorAll('.switch-tab');
    const indicator = document.querySelector('.switch-indicator');

    priceTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // 移除所有 active 类
            priceTabs.forEach(t => t.classList.remove('active'));
            // 添加当前 active 类
            tab.classList.add('active');
            // 移动指示器
            indicator.style.left = `calc(${index * 50}% + 2px)`;
        });
    });
});

//圆环chart
function updateDoughnutChart(color) {
    const shades = generateShades(color);
    // 选择6个关键色阶点：50, 200, 400, 600, 800, 900
    const keyShades = [
        shades[1],  // 50
        shades[4],  // 200
        shades[6],  // 300
        shades[8], //  400
        shades[10], // 500
        shades[12]  // 600
    ];

    const data = [
        { title: "色阶 50", color: keyShades[0].hex },
        { title: "色阶 200", color: keyShades[1].hex },
        { title: "色阶 300", color: keyShades[2].hex },
        { title: "色阶 400", color: keyShades[3].hex },
        { title: "色阶 500", color: keyShades[4].hex },
        { title: "色阶 600", color: keyShades[5].hex }
    ];

    // 获取画布容器
    const container = document.getElementById('doughnutChart');
    // 清除现有内容
    container.innerHTML = '';

    // 创建 SVG 元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const width = 280;
    const height = 280;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.75;

    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // 计算总值
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    const anglePerSection = 360 / data.length;  // 平均分配角度

    data.forEach((item, index) => {
        const endAngle = startAngle + anglePerSection;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', describeArc(centerX, centerY, radius, innerRadius, startAngle, endAngle));
        path.setAttribute('fill', item.color);

        // 添加交互效果
        path.addEventListener('mouseover', (e) => showTooltip(e, item));
        path.addEventListener('mouseout', hideTooltip);

        svg.appendChild(path);
        startAngle = endAngle;
    });

    // 添加中心文字
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', centerX);
    text.setAttribute('y', centerY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'var(--text-color)');
    text.textContent = '色阶展示';
    svg.appendChild(text);

    container.appendChild(svg);
}

// 辅助函数：计算圆弧路径
function describeArc(x, y, outerRadius, innerRadius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, outerRadius, endAngle);
    const end = polarToCartesian(x, y, outerRadius, startAngle);
    const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
        'M', start.x, start.y,
        'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        'Z'
    ].join(' ');
}

// 辅助函数：极坐标转笛卡尔坐标
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// 工具提示相关函数
function showTooltip(event, data) {
    const tooltip = document.createElement('div');
    tooltip.className = 'doughnut-tooltip';
    tooltip.textContent = `${data.title}: ${data.color}`;
    tooltip.style.position = 'fixed';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 25}px`;
    document.body.appendChild(tooltip);
}

function hideTooltip() {
    const tooltip = document.querySelector('.doughnut-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
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
    const shadesGrids = document.querySelectorAll('#shadesGrid');
    shadesGrids.forEach(grid => {
        grid.innerHTML = shades.map(shade => `
            <div class="shade-item">
                <div class="shade-box" 
                     style="background-color: ${shade.hex}"
                     onclick="copyColorValue('${shade.hex}')">
                </div>
                <span class="shade-value">${shade.hex}</span>
                <span class="shade-level">${shade.level}</span>
            </div>
        `).join('');
    });

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
            container.innerHTML = colors.map(({ name, color }) => `
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

    // 添加：自动更新导出变量预览
    const exportCode = document.getElementById('exportCode');
    if (exportCode && exportCode.textContent) {
        // 获取当前选中的格式
        const activeFormatBtn = document.querySelector('.format-buttons .btn.active');
        const format = activeFormatBtn ? activeFormatBtn.textContent.toLowerCase() : 'css';
        exportVariables(format);
    }

    // 更新颜色示例中的样式
    document.documentElement.style.setProperty('--primary', parsedColor.hex);
    const colorShades = generateShades(parsedColor.hex);
    shades.forEach(shade => {
        document.documentElement.style.setProperty(`--primary-${shade.level}`, shade.hex);
    });

    // 设置状态颜色变量
    const semanticColorValues = generateSemanticColors(parsedColor.hex);
    Object.entries(semanticColorValues).forEach(([name, value]) => {
        document.documentElement.style.setProperty(`--${name}`, value);
    });

    // 更新对比度检测
    updateContrastChecker(parsedColor.hex);

    // 更新高级工具
    updateHarmonyScore(parsedColor.hex);


    // 添加：更新圆环图
    requestAnimationFrame(() => {
        updateDoughnutChart(parsedColor.hex);
    });
}

// 更新对比度检测
// 全局变量存储当前对比度模式
let contrastMode = 'text'; // 'text' 或 'background'

function updateContrastChecker(color) {
    const whiteContrast = document.getElementById('whiteContrast');
    const blackContrast = document.getElementById('blackContrast');

    if (whiteContrast && blackContrast) {
        if (contrastMode === 'text') {
            // 文字色模式：选中颜色作为文字色
            updateContrastSample(whiteContrast, color, '#ffffff', '与白色背景');
            updateContrastSample(blackContrast, color, '#000000', '与黑色背景');
        } else {
            // 背景色模式：选中颜色作为背景色
            updateContrastSample(whiteContrast, '#ffffff', color, '白色文字');
            updateContrastSample(blackContrast, '#000000', color, '黑色文字');
        }
    }

    // 更新详细的对比度分析
    updateDetailedContrastAnalysis(color);
}

// 更新单个对比度样本
function updateContrastSample(element, textColor, backgroundColor, description) {
    const ratio = getContrastRatio(textColor, backgroundColor);
    const results = getWCAGLevel(ratio);

    element.style.backgroundColor = backgroundColor;
    element.style.color = textColor;
    element.querySelector('.sample-text').textContent = `${description} - 对比度测试`;
    element.querySelector('.contrast-ratio').textContent = `${ratio.toFixed(2)}:1`;
    element.querySelector('.wcag-level').textContent = results.text;
    element.querySelector('.wcag-level').className = `wcag-level ${results.class}`;
}

// 切换对比度模式
function switchContrastMode(mode) {
    contrastMode = mode;

    // 重新更新对比度检测
    const currentColor = colorWheel.value;
    updateContrastChecker(currentColor);
}





// 新增：详细对比度分析
function updateDetailedContrastAnalysis(color) {
    try {
        const analysisContainer = document.getElementById('contrastAnalysis');
        if (!analysisContainer) {
            return;
        }

        // 简单的测试内容
        analysisContainer.innerHTML = `
            <div class="contrast-detailed-analysis">
                <h4>详细对比度分析</h4>
                <p>正在加载分析结果...</p>
            </div>
        `;

        // 异步加载详细内容
        setTimeout(() => {
            try {
                const whiteRatio = getContrastRatio(color, '#ffffff');
                const blackRatio = getContrastRatio(color, '#000000');

                // 获取详细的WCAG结果
                const whiteResults = getDetailedWCAGResults(whiteRatio);
                const blackResults = getDetailedWCAGResults(blackRatio);

                // 生成建议
                const suggestions = generateContrastSuggestions(color, whiteRatio, blackRatio);

                // 生成可访问性报告
                const accessibilityReport = generateAccessibilityReport(color);

                // 更新内容
                updateAnalysisContent(analysisContainer, whiteResults, blackResults, suggestions, accessibilityReport);
            } catch (error) {
                console.error('Error in delayed analysis:', error);
                analysisContainer.innerHTML = `
                    <div class="contrast-detailed-analysis">
                        <h4>详细对比度分析</h4>
                        <p>分析过程中出现错误，请稍后重试。</p>
                    </div>
                `;
            }
        }, 100);

    } catch (error) {
        console.error('Error in updateDetailedContrastAnalysis:', error);
    }
}

// 更新分析内容
function updateAnalysisContent(container, whiteResults, blackResults, suggestions, accessibilityReport) {
    container.innerHTML = `
        <div class="contrast-detailed-analysis">
            <h4>详细对比度分析</h4>
            
            <div class="contrast-matrix">
                <div class="contrast-test-item">
                    <div class="test-label">普通文本 (14px)</div>
                    <div class="test-results">
                        <div class="test-result ${whiteResults.normalText.pass ? 'pass' : 'fail'}">
                            白底: ${whiteResults.normalText.level} ${whiteResults.normalText.pass ? '✓' : '✗'}
                        </div>
                        <div class="test-result ${blackResults.normalText.pass ? 'pass' : 'fail'}">
                            黑底: ${blackResults.normalText.level} ${blackResults.normalText.pass ? '✓' : '✗'}
                        </div>
                    </div>
                </div>
                
                <div class="contrast-test-item">
                    <div class="test-label">大字体 (18px+)</div>
                    <div class="test-results">
                        <div class="test-result ${whiteResults.largeText.pass ? 'pass' : 'fail'}">
                            白底: ${whiteResults.largeText.level} ${whiteResults.largeText.pass ? '✓' : '✗'}
                        </div>
                        <div class="test-result ${blackResults.largeText.pass ? 'pass' : 'fail'}">
                            黑底: ${blackResults.largeText.level} ${blackResults.largeText.pass ? '✓' : '✗'}
                        </div>
                    </div>
                </div>
                
                <div class="contrast-test-item">
                    <div class="test-label">UI组件</div>
                    <div class="test-results">
                        <div class="test-result ${whiteResults.uiComponents.pass ? 'pass' : 'fail'}">
                            白底: ${whiteResults.uiComponents.level} ${whiteResults.uiComponents.pass ? '✓' : '✗'}
                        </div>
                        <div class="test-result ${blackResults.uiComponents.pass ? 'pass' : 'fail'}">
                            黑底: ${blackResults.uiComponents.level} ${blackResults.uiComponents.pass ? '✓' : '✗'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="contrast-suggestions">
                <h5>优化建议</h5>
                <ul>
                    ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            </div>

            <div class="accessibility-score">
                <h5>可访问性评分</h5>
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-value">${accessibilityReport.score}</span>
                        <span class="score-max">/100</span>
                    </div>
                    <div class="score-grade ${accessibilityReport.grade.toLowerCase()}">${accessibilityReport.grade}</div>
                </div>
                <div class="score-breakdown">
                    ${accessibilityReport.breakdown.map(item => `
                        <div class="breakdown-item">
                            <span class="item-name">${item.name}</span>
                            <div class="item-bar">
                                <div class="item-fill" style="width: ${item.score}%"></div>
                            </div>
                            <span class="item-score">${item.score}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}



// 生成对比度建议
function generateContrastSuggestions(color, whiteRatio, blackRatio) {
    const suggestions = [];
    const rgb = hexToRgb(color);
    const hsl = hexToHSL(color);

    if (whiteRatio < 4.5 && blackRatio < 4.5) {
        suggestions.push('当前颜色在白底和黑底上都不符合AA标准，建议调整颜色的明度');

        if (hsl.l > 50) {
            suggestions.push('可以尝试降低颜色的明度(L值)来提高对比度');
        } else {
            suggestions.push('可以尝试提高颜色的明度(L值)来提高对比度');
        }
    } else if (whiteRatio < 4.5) {
        suggestions.push('在白色背景上对比度不足，建议使用深色背景或调暗颜色');
    } else if (blackRatio < 4.5) {
        suggestions.push('在黑色背景上对比度不足，建议使用浅色背景或调亮颜色');
    }

    if (Math.max(whiteRatio, blackRatio) >= 7) {
        suggestions.push('恭喜！当前颜色已达到AAA级标准，具有优秀的可访问性');
    } else if (Math.max(whiteRatio, blackRatio) >= 4.5) {
        suggestions.push('当前颜色符合AA级标准，可访问性良好');
    }

    // 色彩饱和度建议
    if (hsl.s > 80) {
        suggestions.push('高饱和度颜色可能在某些显示设备上造成视觉疲劳，建议适当降低饱和度');
    }

    return suggestions.length > 0 ? suggestions : ['当前颜色的对比度表现良好'];
}

// 生成可访问性报告
function generateAccessibilityReport(color) {
    const whiteRatio = getContrastRatio(color, '#ffffff');
    const blackRatio = getContrastRatio(color, '#000000');
    const bestRatio = Math.max(whiteRatio, blackRatio);

    // 计算各项得分
    const contrastScore = Math.min(100, (bestRatio / 7) * 100);
    const readabilityScore = bestRatio >= 4.5 ? 100 : (bestRatio / 4.5) * 100;
    const accessibilityScore = bestRatio >= 3 ? 100 : (bestRatio / 3) * 100;

    const totalScore = Math.round((contrastScore + readabilityScore + accessibilityScore) / 3);

    let grade = 'F';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 60) grade = 'C';
    else if (totalScore >= 50) grade = 'D';

    return {
        score: totalScore,
        grade: grade,
        breakdown: [
            { name: '对比度', score: Math.round(contrastScore) },
            { name: '可读性', score: Math.round(readabilityScore) },
            { name: '可访问性', score: Math.round(accessibilityScore) }
        ]
    };
}

// 计算色彩和谐度
function calculateHarmonyScore(color) {
    const hsl = hexToHSL(color);
    const shades = generateShades(color);

    // 色相平衡评分 (基于色相的分布)
    const hueBalance = Math.min(100, 60 + (hsl.h % 60) / 60 * 40);

    // 饱和度协调评分 (适中的饱和度得分更高)
    const saturationHarmony = Math.max(0, 100 - Math.abs(hsl.s - 70) * 2);

    // 明度对比评分 (适中的明度得分更高)
    const lightnessContrast = Math.max(0, 100 - Math.abs(hsl.l - 50) * 2);

    // 综合评分
    const overallScore = Math.round((hueBalance + saturationHarmony + lightnessContrast) / 3);

    return {
        overall: overallScore,
        hueBalance: Math.round(hueBalance),
        saturationHarmony: Math.round(saturationHarmony),
        lightnessContrast: Math.round(lightnessContrast)
    };
}

// 更新和谐度显示
function updateHarmonyScore(color) {
    const scores = calculateHarmonyScore(color);

    // 更新总分
    const scoreValue = document.getElementById('harmonyScore');
    const scoreCircle = document.querySelector('.score-circle');
    if (scoreValue && scoreCircle) {
        scoreValue.textContent = scores.overall;
        scoreCircle.style.setProperty('--score', scores.overall);
    }

    // 更新各项评分
    const hueBalanceEl = document.getElementById('hueBalance');
    const saturationHarmonyEl = document.getElementById('saturationHarmony');
    const lightnessContrastEl = document.getElementById('lightnessContrast');

    if (hueBalanceEl) {
        hueBalanceEl.style.width = `${scores.hueBalance}%`;
        hueBalanceEl.parentElement.nextElementSibling.textContent = `${scores.hueBalance}%`;
    }

    if (saturationHarmonyEl) {
        saturationHarmonyEl.style.width = `${scores.saturationHarmony}%`;
        saturationHarmonyEl.parentElement.nextElementSibling.textContent = `${scores.saturationHarmony}%`;
    }

    if (lightnessContrastEl) {
        lightnessContrastEl.style.width = `${scores.lightnessContrast}%`;
        lightnessContrastEl.parentElement.nextElementSibling.textContent = `${scores.lightnessContrast}%`;
    }

    // 更新建议
    updateHarmonySuggestions(scores, color);
}

// 更新和谐度建议
function updateHarmonySuggestions(scores, color) {
    const suggestions = [];
    const hsl = hexToHSL(color);

    if (scores.overall >= 80) {
        suggestions.push('当前配色具有优秀的视觉和谐度');
    } else if (scores.overall >= 60) {
        suggestions.push('配色整体协调，可考虑微调优化');
    } else {
        suggestions.push('建议调整配色以提升视觉和谐度');
    }

    if (scores.saturationHarmony < 60) {
        if (hsl.s > 80) {
            suggestions.push('饱和度过高，建议降低至60-80%范围');
        } else if (hsl.s < 40) {
            suggestions.push('饱和度偏低，建议提升至50-70%范围');
        }
    }

    if (scores.lightnessContrast < 60) {
        if (hsl.l > 70) {
            suggestions.push('明度偏高，可能影响文字可读性');
        } else if (hsl.l < 30) {
            suggestions.push('明度偏低，建议在浅色背景上使用');
        }
    }

    const suggestionsList = document.getElementById('harmonySuggestions');
    if (suggestionsList) {
        suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }
}