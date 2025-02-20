// 基础颜色转换函数
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

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

// 颜色转换核心功能
function parseColor(input) {
    input = input.trim().toLowerCase();
    let match;
    let color = {};

    // HEX 格式
    if (input.startsWith('#')) {
        color.hex = input;
        const rgb = hexToRgb(input);
        color.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        color.rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        const hsl = hexToHSL(input);
        color.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        const hsb = rgbToHSB(rgb.r, rgb.g, rgb.b);
        color.hsb = `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
        const cmyk = rgbToCMYK(rgb.r, rgb.g, rgb.b);
        color.cmyk = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        return color;
    }

    // RGB 格式
    match = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        color.rgb = input;
        color.rgba = `rgba(${r}, ${g}, ${b}, 1)`;
        color.hex = rgbToHex(r, g, b);
        const hsl = hexToHSL(color.hex);
        color.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        const hsb = rgbToHSB(r, g, b);
        color.hsb = `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
        const cmyk = rgbToCMYK(r, g, b);
        color.cmyk = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        return color;
    }

    // RGBA 格式
    match = input.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = parseFloat(match[4]);
        color.rgba = input;
        color.rgb = `rgb(${r}, ${g}, ${b})`;
        color.hex = rgbToHex(r, g, b);
        const hsl = hexToHSL(color.hex);
        color.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        const hsb = rgbToHSB(r, g, b);
        color.hsb = `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
        const cmyk = rgbToCMYK(r, g, b);
        color.cmyk = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        return color;
    }

    // HSL 格式
    match = input.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/);
    if (match) {
        color.hsl = input;
        color.hex = hslToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        const rgb = hexToRgb(color.hex);
        color.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        color.rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        const hsb = rgbToHSB(rgb.r, rgb.g, rgb.b);
        color.hsb = `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
        const cmyk = rgbToCMYK(rgb.r, rgb.g, rgb.b);
        color.cmyk = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        return color;
    }

    return null;
}

// 添加新的转换函数
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

// 调色板生成功能
function generateShades(hex) {
    const shades = [];
    const hsl = hexToHSL(hex);
    
    // 生成更细腻的梯度(50-950)
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
            name: `${level}`,
            color: shade,
            isPrimary: level === 500
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

function generateTriadicColors(hex) {
    const hsl = hexToHSL(hex);
    return [
        { name: 'Primary', color: hex },
        { name: 'Triadic 1', color: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l) },
        { name: 'Triadic 2', color: hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l) }
    ];
}

function generateSplitComplementaryColors(hex) {
    const hsl = hexToHSL(hex);
    return [
        { name: 'Primary', color: hex },
        { name: 'Split 1', color: hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l) },
        { name: 'Split 2', color: hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l) }
    ];
}

function generateTetradicColors(hex) {
    const hsl = hexToHSL(hex);
    return [
        { name: 'Primary', color: hex },
        { name: 'Tetradic 1', color: hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l) },
        { name: 'Tetradic 2', color: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l) },
        { name: 'Tetradic 3', color: hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l) }
    ];
}

function generateMonochromaticColors(hex) {
    const hsl = hexToHSL(hex);
    return [
        { name: 'Lighter 40%', color: hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 40)) },
        { name: 'Lighter 20%', color: hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)) },
        { name: 'Primary', color: hex },
        { name: 'Darker 20%', color: hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)) },
        { name: 'Darker 40%', color: hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 40)) }
    ];
}

function updateResultGrid(color) {
    let html = `
        <div class="color-preview" style="background-color: ${color.hex}"></div>
        <div class="result-values">
    `;
    
    // 添加各种格式的颜色值
    const formats = {
        'HEX': color.hex,
        'RGB': color.rgb,
        'RGBA': color.rgba || `rgba(${hexToRgb(color.hex).r}, ${hexToRgb(color.hex).g}, ${hexToRgb(color.hex).b}, 1)`,
        'HSL': color.hsl,
        'HSB': color.hsb,
        'CMYK': color.cmyk
    };

    for (let [format, value] of Object.entries(formats)) {
        if (value) {
            html += `
                <div class="color-value-item">
                    <div class="color-value-header">
                        <span class="format">${format}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${value}')">复制</button>
                    </div>
                    <span class="value">${value}</span>
                </div>
            `;
        }
    }
    
    html += '</div>';
    document.getElementById('result_grid').innerHTML = html;
}

// 系统色板功能
function updateSystemColors(baseColor) {
    if (!baseColor.startsWith('#')) {
        baseColor = '#' + baseColor;
    }
    
    const shades = generateShades(baseColor);
    let shadesHtml = shades.map(shade => `
        <div class="color-scale-block ${shade.isPrimary ? 'is-primary' : ''}" 
             style="background-color: ${shade.color}" 
             data-color="${shade.color}"
             onclick="copyToClipboard('${shade.color}')">
        </div>
    `).join('');
    
    // 更新数字标签
    let numbersHtml = shades.filter((_, i) => i % 2 === 0).map(shade => 
        `<span>${shade.name}</span>`
    ).join('');
    
    if (document.getElementById('primary_shades')) {
        document.getElementById('primary_shades').innerHTML = shadesHtml;
        document.querySelector('.color-scale-numbers').innerHTML = numbersHtml;
    }

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

    // 更新三分色系
    const triadicColors = generateTriadicColors(baseColor);
    const triadicHtml = triadicColors.map(color => `
        <div class="shade-item" onclick="copyToClipboard('${color.color}')">
            <div class="shade-preview" style="background-color: ${color.color}"></div>
            <div class="shade-info">${color.name}: ${color.color}</div>
        </div>
    `).join('');
    document.getElementById('triadic_colors').innerHTML = triadicHtml;

    // 更新分裂互补色系
    const splitComplementaryColors = generateSplitComplementaryColors(baseColor);
    const splitComplementaryHtml = splitComplementaryColors.map(color => `
        <div class="shade-item" onclick="copyToClipboard('${color.color}')">
            <div class="shade-preview" style="background-color: ${color.color}"></div>
            <div class="shade-info">${color.name}: ${color.color}</div>
        </div>
    `).join('');
    document.getElementById('split_complementary_colors').innerHTML = splitComplementaryHtml;

    // 更新四分色系
    const tetradicColors = generateTetradicColors(baseColor);
    const tetradicHtml = tetradicColors.map(color => `
        <div class="shade-item" onclick="copyToClipboard('${color.color}')">
            <div class="shade-preview" style="background-color: ${color.color}"></div>
            <div class="shade-info">${color.name}: ${color.color}</div>
        </div>
    `).join('');
    document.getElementById('tetradic_colors').innerHTML = tetradicHtml;

    // 更新单色系
    const monochromaticColors = generateMonochromaticColors(baseColor);
    const monochromaticHtml = monochromaticColors.map(color => `
        <div class="shade-item" onclick="copyToClipboard('${color.color}')">
            <div class="shade-preview" style="background-color: ${color.color}"></div>
            <div class="shade-info">${color.name}: ${color.color}</div>
        </div>
    `).join('');
    document.getElementById('monochromatic_colors').innerHTML = monochromaticHtml;
}

// 工具函数
function clearInput() {
    const colorPicker = document.getElementById('color_picker');
    const colorInput = document.getElementById('input_color');
    colorInput.value = '';
    colorPicker.value = '#000000';
    document.getElementById('result_grid').innerHTML = '';
    colorInput.focus(); // 清空后让输入框重新获得焦点
}

function inputExample(e) {
    let color = e.dataset.color || e.innerText;
    document.getElementById('input_color').value = color;
    convert();
}

function toggleColorReference() {
    const library = document.getElementById('colorLibrary');
    const overlay = document.getElementById('drawerOverlay');
    
    if (!library.classList.contains('active')) {
        library.classList.add('active');
        overlay.classList.add('active');
        // 初始化颜色库（如果还没有初始化）
        if (!library.dataset.initialized) {
            initColorLibrary();
            library.dataset.initialized = 'true';
        }
    } else {
        library.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// 添加 ESC 键关闭抽屉
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const library = document.getElementById('colorLibrary');
        if (library.classList.contains('active')) {
            toggleColorReference();
        }
    }
});

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.display = 'block';
    
    // 重置动画
    toast.style.animation = 'none';
    toast.offsetHeight; // 触发重排
    toast.style.animation = 'fadeInOut 2s ease forwards';
    
    // 动画结束后隐藏
    toast.addEventListener('animationend', () => {
        toast.style.display = 'none';
    }, { once: true }); // 确保事件监听器只执行一次
}

// 主转换函数
function convert(val) {
    const input = val || document.getElementById('input_color').value;
    if (!input) return;

    try {
        const color = parseColor(input);
        if (!color) return;
        
        // 更新结果网格
        updateResultGrid(color);
        
        // 更新配色方案
        updateSystemColors(color.hex);
    } catch (error) {
        console.error('Color conversion error:', error);
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 使用默认颜色初始化页面
    convert('#2196f3');
    
    // 添加颜色选择器的事件监听
    const colorPicker = document.getElementById('color_picker');
    const colorInput = document.getElementById('input_color');
    
    colorPicker.addEventListener('input', (e) => {
        colorInput.value = e.target.value;
        convert(e.target.value);
    });
    
    colorInput.addEventListener('input', (e) => {
        const color = parseColor(e.target.value);
        if (color) {
            colorPicker.value = color.hex;
        }
    });

    initColorLibrary();

    // 添加 tab 切换事件监听
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.category);
        });
    });
});

// 初始化色彩参考库
function initColorLibrary() {
    const basicColors = colors.slice(0, 8); // gray, blue, green, red, yellow, purple, pink, indigo
    const extendedColors = colors.slice(8); // material, ant, brand, chinese, gradient

    // 初始化基础色系
    const basicTables = document.getElementById('basic_color_tables');
    if (basicTables) {
        basicTables.innerHTML = generateColorTables(basicColors);
    }

    // 初始化扩展色系
    const extendedTables = document.getElementById('extended_color_tables');
    if (extendedTables) {
        extendedTables.innerHTML = generateColorTables(extendedColors);
    }

    // 确保默认选中状态
    const defaultTab = document.querySelector('.tab-btn[data-category="basic"]');
    if (defaultTab) {
        defaultTab.classList.add('active');
        document.getElementById('basicColors').classList.add('active');
    }
}

// 生成颜色表格 HTML
function generateColorTables(colors) {
    return colors.map(category => {
        const [colorName, colorShades] = Object.entries(category)[0];
        return `
            <div class="color-category">
                <h3>${colorName.charAt(0).toUpperCase() + colorName.slice(1)}</h3>
                <div class="color-shades">
                    ${colorShades.map(([name, hex]) => {
                        const rgb = hexToRgb(hex);
                        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                        const isLight = brightness > 128;
                        
                        return `
                            <div class="color-shade" 
                                 onclick="handleColorClick(this)" 
                                 data-color="${hex}">
                                <div class="color-preview" 
                                     style="background-color: ${hex}" 
                                     data-light="${isLight}">
                                    ${name}: ${hex}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 切换 tab
function switchTab(tabName) {
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-category="${tabName}"]`).classList.add('active');

    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName === 'basic' ? 'basicColors' : 'extendedColors').classList.add('active');
}

// 新增颜色点击处理函数
async function handleColorClick(element) {
    const color = element.dataset.color;
    try {
        // 先复制颜色值
        await navigator.clipboard.writeText(color);
        showToast('已复制到剪贴板');
        // 然后更新输入框颜色
        inputExample(element);
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败');
    }
}