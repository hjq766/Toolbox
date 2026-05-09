// 颜色混合功能
class ColorMixer {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.updateAll();
    }

    initElements() {
        // 颜色选择器和文本输入
        this.color1Picker = document.getElementById('color1');
        this.color2Picker = document.getElementById('color2');
        this.color1Text = document.getElementById('color1Text');
        this.color2Text = document.getElementById('color2Text');
        this.color1RGB = document.getElementById('color1RGB');
        this.color2RGB = document.getElementById('color2RGB');
        
        // 权重滑块
        this.weight1Slider = document.getElementById('weight1');
        this.weight2Slider = document.getElementById('weight2');
        
        // 预览元素
        this.color1Preview = document.getElementById('color1Preview');
        this.color2Preview = document.getElementById('color2Preview');
        this.mixedPreview = document.getElementById('mixedPreview');
        this.gradientPreview = document.getElementById('gradientPreview');

        // 渐变控制
        this.gradientType = document.getElementById('gradientType');
        this.gradientAngle = document.getElementById('gradientAngle');
        this.angleValue = document.getElementById('angleValue');
        this.gradientCode = document.getElementById('gradientCode');
    }

    initEventListeners() {
        // 颜色选择器变化事件
        this.color1Picker.addEventListener('input', () => {
            this.color1Text.value = this.color1Picker.value.toUpperCase();
            this.updateAll();
        });
        
        this.color2Picker.addEventListener('input', () => {
            this.color2Text.value = this.color2Picker.value.toUpperCase();
            this.updateAll();
        });

        // 文本输入变化事件
        this.color1Text.addEventListener('input', () => {
            if (this.isValidColor(this.color1Text.value)) {
                this.color1Picker.value = this.color1Text.value;
                this.updateAll();
            }
        });
        
        this.color2Text.addEventListener('input', () => {
            if (this.isValidColor(this.color2Text.value)) {
                this.color2Picker.value = this.color2Text.value;
                this.updateAll();
            }
        });

        // 权重滑块变化事件
        this.weight1Slider.addEventListener('input', () => {
            const weight1 = parseInt(this.weight1Slider.value);
            this.weight1Slider.nextElementSibling.textContent = weight1 + '%';
            this.weight2Slider.value = 100 - weight1;
            this.weight2Slider.nextElementSibling.textContent = (100 - weight1) + '%';
            this.updateAll();
        });
        
        this.weight2Slider.addEventListener('input', () => {
            const weight2 = parseInt(this.weight2Slider.value);
            this.weight2Slider.nextElementSibling.textContent = weight2 + '%';
            this.weight1Slider.value = 100 - weight2;
            this.weight1Slider.nextElementSibling.textContent = (100 - weight2) + '%';
            this.updateAll();
        });

        // 渐变控制事件
        this.gradientType.addEventListener('change', () => this.updateGradient());
        this.gradientAngle.addEventListener('input', () => {
            this.angleValue.textContent = this.gradientAngle.value + '°';
            this.updateGradient();
        });

        // 色块点击复制事件
        this.color1Preview.addEventListener('click', () => this.copyColorValue(this.color1Picker.value));
        this.color2Preview.addEventListener('click', () => this.copyColorValue(this.color2Picker.value));
        this.mixedPreview.addEventListener('click', () => this.copyColorValue(this.mixColors()));
    }

    // 检查颜色值是否有效
    isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }

    // 将十六进制颜色转换为RGB数组
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        return [
            parseInt(hex.substr(0, 2), 16),
            parseInt(hex.substr(2, 2), 16),
            parseInt(hex.substr(4, 2), 16)
        ];
    }

    // 将RGB数组转换为十六进制颜色
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    // 判断颜色是否为浅色
    isLightColor(color) {
        const rgb = this.hexToRgb(color);
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        return brightness > 128;
    }

    // 复制颜色值
    copyColorValue(color) {
        const tempInput = document.createElement('input');
        tempInput.value = color;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('颜色值已复制到剪贴板');
    }

    // 更新色块的颜色值显示
    updateColorPreview(element, color) {
        element.style.backgroundColor = color;
        const valueSpan = element.querySelector('.color-value');
        if (valueSpan) {
            valueSpan.textContent = color;
        }
        
        // 根据背景色调整文字颜色
        if (this.isLightColor(color)) {
            element.classList.add('light-bg');
        } else {
            element.classList.remove('light-bg');
        }
    }

    // 更新RGB值显示
    updateRGBValue(element, color) {
        const rgb = this.hexToRgb(color);
        element.value = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }

    // 混合两种颜色
    mixColors() {
        const color1 = this.hexToRgb(this.color1Picker.value);
        const color2 = this.hexToRgb(this.color2Picker.value);
        const weight1 = parseInt(this.weight1Slider.value) / 100;
        const weight2 = parseInt(this.weight2Slider.value) / 100;

        const mixed = color1.map((c1, i) => {
            const c2 = color2[i];
            return (c1 * weight1 + c2 * weight2);
        });

        return this.rgbToHex(...mixed);
    }

    // 生成渐变CSS代码
    generateGradientCode() {
        const color1 = this.color1Picker.value;
        const color2 = this.color2Picker.value;
        const mixedColor = this.mixColors();
        const type = this.gradientType.value;
        const angle = this.gradientAngle.value;

        if (type === 'linear') {
            return `background: linear-gradient(${angle}deg, ${color1}, ${mixedColor}, ${color2});`;
        } else {
            return `background: radial-gradient(circle, ${color1}, ${mixedColor}, ${color2});`;
        }
    }

    // 更新渐变预览
    updateGradient() {
        const gradientCSS = this.generateGradientCode();
        this.gradientPreview.style = gradientCSS;
        this.gradientCode.value = gradientCSS;
    }

    // 更新所有视图
    updateAll() {
        // 更新颜色预览
        this.updateColorPreview(this.color1Preview, this.color1Picker.value);
        this.updateColorPreview(this.color2Preview, this.color2Picker.value);
        
        // 更新RGB值
        this.updateRGBValue(this.color1RGB, this.color1Picker.value);
        this.updateRGBValue(this.color2RGB, this.color2Picker.value);
        
        // 计算并更新混合颜色
        const mixedColor = this.mixColors();
        this.updateColorPreview(this.mixedPreview, mixedColor);
        
        // 更新渐变预览和代码
        this.updateGradient();
    }
}

// 复制渐变代码功能
function copyGradient() {
    const element = document.getElementById('gradientCode');
    element.select();
    document.execCommand('copy');
    showToast('渐变代码已复制到剪贴板');
}

// 初始化颜色混合器
document.addEventListener('DOMContentLoaded', () => {
    new ColorMixer();
});