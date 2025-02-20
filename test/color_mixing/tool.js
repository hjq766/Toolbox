document.addEventListener('DOMContentLoaded', () => {
    const mixColorsBtn = document.getElementById('mixColorsBtn');
    const resultGrid = document.getElementById('resultGrid');

    mixColorsBtn.addEventListener('click', () => {
        const color1 = document.getElementById('color1').value;
        const color2 = document.getElementById('color2').value;
        const mixedColor = mixColors(color1, color2);
        displayResult(mixedColor);
    });
});

// 混合颜色函数
function mixColors(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const mixedRgb = {
        r: Math.round((rgb1.r + rgb2.r) / 2),
        g: Math.round((rgb1.g + rgb2.g) / 2),
        b: Math.round((rgb1.b + rgb2.b) / 2)
    };
    
    return rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b);
}

// 将十六进制颜色转换为 RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

// 将 RGB 转换为十六进制
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// 显示混合结果
function displayResult(mixedColor) {
    const resultGrid = document.getElementById('resultGrid');
    const gradientPreview = document.getElementById('gradientPreview');
    const mixedColorInfo = document.getElementById('mixedColorInfo');

    // 生成颜色梯度
    const gradient = `linear-gradient(to right, ${document.getElementById('color1').value}, ${document.getElementById('color2').value}, ${mixedColor})`;
    gradientPreview.style.background = gradient;

    // 显示混合颜色信息
    mixedColorInfo.innerHTML = `混合颜色: ${mixedColor}`;
    showToast(`已生成颜色: ${mixedColor}`); // 使用公共的 toast 提示
}
