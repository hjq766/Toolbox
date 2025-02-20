// 全局变量
let currentType = 'linear';
let currentAngle = 90;
let currentShape = 'circle';
let radialSize = 100;
let colorStops = [
    { color: '#ff0000', position: 0 },
    { color: '#0000ff', position: 100 }
];
let repeatCount = 4;
let isRepeating = false;
let diamondStyle = 'normal';
let diamondSize = 40;
let isDragging = false;
let radialPositionX = 50;
let radialPositionY = 50;

// DOM 元素
const gradientPreview = document.getElementById('gradientPreview');
const cssOutput = document.getElementById('cssOutput');
const gradientBar = document.getElementById('gradientBar');
const colorStopsContainer = document.getElementById('colorStops');
const angleSlider = document.getElementById('gradientAngle');
const linearSettings = document.getElementById('linearSettings');
const radialSettings = document.getElementById('radialSettings');
const repeatingSettings = document.getElementById('repeatingSettings');
const repeatCountSlider = document.getElementById('repeatCount');
const repeatingConicSettings = document.getElementById('repeatingConicSettings');

// 初始化
function init() {
    // 初始化类型选择器
    initTypeSelector();
    
    // 初始化角度滑块
    initAngleSlider();
    
    // 初始化形状选择器
    initShapeSelector();
    
    // 初始化颜色节点
    initColorStops();
    
    // 初始化按钮事件
    initButtons();
    
    // 更新渐变显示
    updateGradient();
    
    initRepeatCountSlider();
    initRepeatSwitch();
    initDirectionButtons();
    initDiamondControls();
    initCSSPaste();
    initRadialSizeControl();
    initRadialPositionControls();
}

// 初始化类型选择器
function initTypeSelector() {
    const typeTabs = document.querySelectorAll('.type-button');
    const repeatSwitchWrapper = document.getElementById('repeatSwitchWrapper');
    const linearSettings = document.getElementById('linearSettings');
    const radialSettings = document.getElementById('radialSettings');
    
    typeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('Type changed to:', tab.dataset.type);
            typeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentType = tab.dataset.type;
            
            // 显示/隐藏相应的设置面板
            if (currentType === 'radial') {
                console.log('Switching to radial gradient mode');
                linearSettings.style.display = 'none';
                radialSettings.style.display = 'block';
                repeatingConicSettings.style.display = 'none';
                console.log('Panel visibility:', {
                    linear: linearSettings.style.display,
                    radial: radialSettings.style.display
                });
            } else if (currentType === 'conic') {
                linearSettings.style.display = 'block';
                radialSettings.style.display = 'none';
                // 根据是否是重复模式显示对应的方向控制
                if (isRepeating) {
                    linearSettings.style.display = 'none';
                    repeatingConicSettings.style.display = 'block';
                } else {
                    linearSettings.style.display = 'block';
                    repeatingConicSettings.style.display = 'none';
                }
            } else {
                linearSettings.style.display = 'block';
                radialSettings.style.display = 'none';
                repeatingConicSettings.style.display = 'none';
            }
            
            updateGradient();
        });
    });
}

// 初始化角度滑块
function initAngleSlider() {
    const valueDisplay = angleSlider.nextElementSibling;
    angleSlider.addEventListener('input', (e) => {
        currentAngle = e.target.value;
        valueDisplay.textContent = `${currentAngle}°`;
        updateGradient();
    });
}

// 初始化形状选择器
function initShapeSelector() {
    const shapeTabs = document.querySelectorAll('#radialSettings .shape-tab');
    shapeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            shapeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentShape = tab.dataset.shape;
            updateGradient();
        });
    });
}

// 初始化颜色节点
function initColorStops() {
    // 清空现有节点
    colorStopsContainer.innerHTML = '';
    gradientBar.style.background = generateGradientCSS();
    
    // 创建初始颜色节点
    colorStops.forEach((stop, index) => {
        createColorStop(stop, index);
    });
}

// 创建颜色节点
function createColorStop(stop, index) {
    const stopElement = document.createElement('div');
    stopElement.className = 'color-stop';
    stopElement.style.left = `${stop.position}%`;
    stopElement.style.backgroundColor = stop.color;
    stopElement.dataset.index = index;
    
    // 创建颜色输入
    const popup = document.createElement('div');
    popup.className = 'color-picker-popup';
    popup.innerHTML = `
        <div class="picker-header">
            <span>颜色选择</span>
        </div>
        <div class="picker-content">
            <input type="color" class="color-input" value="${stop.color}">
            <div class="alpha-control">
                <div class="alpha-label">透明度</div>
                <div class="alpha-slider">
                    <input type="range" min="0" max="100" value="100">
                    <span class="alpha-value">100%</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    const colorInput = popup.querySelector('.color-input');
    const alphaSlider = popup.querySelector('input[type="range"]');
    const alphaValue = popup.querySelector('.alpha-value');

    // 处理颜色变化
    function updateColor() {
        const hex = colorInput.value;
        const alpha = alphaSlider.value / 100;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        stop.color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        stopElement.style.backgroundColor = stop.color;
        updateGradient();
    }

    colorInput.addEventListener('input', updateColor);
    alphaSlider.addEventListener('input', (e) => {
        alphaValue.textContent = `${e.target.value}%`;
        updateColor();
    });

    // 点击节点时显示颜色选择器
    stopElement.addEventListener('click', (e) => {
        if (!isDragging) {
            const rect = stopElement.getBoundingClientRect();
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 8}px`;
            popup.classList.add('active');
            e.stopPropagation();
        }
    });

    // 点击其他地方时关闭颜色选择器
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && !stopElement.contains(e.target)) {
            popup.classList.remove('active');
        }
    });

    console.log('Adding event listeners to color stop');

    // 移除之前所有的点击相关事件
    stopElement.removeEventListener('click', () => {});
    colorInput.parentElement.removeEventListener('click', () => {});

    let dragStartTime = 0;
    let hasMoved = false;

    // 鼠标按下事件处理
    stopElement.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // 只响应左键
        e.preventDefault();
        
        dragStartTime = Date.now();
        hasMoved = false;
        
        // 开始监听移动
        const onMouseMove = (e) => {
            if (!isDragging && Date.now() - dragStartTime > 200) {
                isDragging = true;
            }
            
            if (isDragging) {
                hasMoved = true;
                e.preventDefault();
                
                const rect = gradientBar.getBoundingClientRect();
                let newPosition = startLeft + ((e.clientX - startX) / rect.width * 100);
                
                // 限制范围和处理重叠
                newPosition = Math.max(0, Math.min(100, newPosition));
                const hasOverlap = colorStops.some((stop, i) => 
                    i !== index && Math.abs(stop.position - newPosition) < 2
                );
                if (hasOverlap) return;
                
                stop.position = Math.round(newPosition);
                stopElement.style.left = `${stop.position}%`;
                updateGradient();
            }
        };
        
        // 鼠标松开事件
        const onMouseUp = (e) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // 如果没有移动，且按下时间小于200ms，则视为点击，打开颜色选择器
            if (!hasMoved && Date.now() - dragStartTime < 200) {
                colorInput.click();
            } else if (isDragging) {
                // 如果有拖拽，则重新排序并刷新节点
                colorStops.sort((a, b) => a.position - b.position);
                initColorStops();
                updateGradient();
            }
            
            isDragging = false;
        };

        startX = e.clientX;
        startLeft = stop.position;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // 颜色变化事件
    colorInput.addEventListener('change', (e) => {
        e.stopPropagation();
        stop.color = e.target.value;
        stopElement.style.backgroundColor = stop.color;
        updateGradient();
    });

    // 添加 input 事件监听，实时更新颜色
    colorInput.addEventListener('input', (e) => {
        e.stopPropagation();
        stop.color = e.target.value;
        stopElement.style.backgroundColor = stop.color;
        updateGradient();
    });

    // 右键删除
    stopElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (colorStops.length > 2) {
            colorStops.splice(index, 1);
            initColorStops();
            updateGradient();
            showToast('已删除颜色节点', 'info');
        }
    });

    // 添加到容器
    colorStopsContainer.appendChild(stopElement);
}

// 生成渐变CSS
function generateGradientCSS() {
    const stops = colorStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    let result;
    switch (currentType) {
        case 'linear':
            if (isRepeating) {
                const adjustedStops = colorStops.map(stop => {
                    const adjustedPosition = (stop.position / repeatCount);
                    return `${stop.color} ${adjustedPosition}%`;
                }).join(', ');
                result = `repeating-linear-gradient(${currentAngle}deg, ${adjustedStops})`;
            } else {
                result = `linear-gradient(${currentAngle}deg, ${stops})`;
            }
            break;
        case 'radial':
            if (isRepeating) {
                if (currentShape === 'circle') {
                    const previewSize = Math.min(gradientPreview.offsetWidth, gradientPreview.offsetHeight);
                    const pixelSize = (radialSize / 100) * (previewSize / repeatCount);
                    result = `repeating-radial-gradient(circle ${pixelSize}px at ${radialPositionX}% ${radialPositionY}%, ${stops})`;
                } else {
                    const adjustedSize = radialSize / repeatCount;
                    result = `repeating-radial-gradient(ellipse ${adjustedSize}% ${adjustedSize}% at ${radialPositionX}% ${radialPositionY}%, ${stops})`;
                }
            } else {
                if (currentShape === 'circle') {
                    const previewSize = Math.min(gradientPreview.offsetWidth, gradientPreview.offsetHeight);
                    const pixelSize = (radialSize / 100) * previewSize;
                    result = `radial-gradient(circle ${pixelSize}px at ${radialPositionX}% ${radialPositionY}%, ${stops})`;
                } else {
                    result = `radial-gradient(ellipse ${radialSize}% ${radialSize}% at ${radialPositionX}% ${radialPositionY}%, ${stops})`;
                }
            }
            break;
        case 'conic':
            if (isRepeating) {
                const adjustedStops = colorStops.map(stop => {
                    const adjustedPosition = (stop.position * 360 / 100 / repeatCount);
                    return `${stop.color} ${adjustedPosition}deg`;
                }).join(', ');
                result = `repeating-conic-gradient(from ${currentAngle}deg at center, ${adjustedStops})`;
            } else {
                result = `conic-gradient(from ${currentAngle}deg at center, ${stops})`;
            }
            break;
    }
    return result;
}

// 更新渐变显示
function updateGradient() {
    const gradientCSS = generateGradientCSS();
    
    // 先清除现有样式
    gradientPreview.style.removeProperty('background');
    gradientBar.style.removeProperty('background');
    
    // 分别设置背景属性
    gradientPreview.style.backgroundImage = gradientCSS;
    gradientPreview.style.backgroundRepeat = 'no-repeat';
    gradientPreview.style.backgroundPosition = 'center';
    gradientPreview.style.backgroundSize = 'contain';
    
    gradientBar.style.backgroundImage = gradientCSS;
    gradientBar.style.backgroundRepeat = 'no-repeat';
    gradientBar.style.backgroundPosition = 'center';
    gradientBar.style.backgroundSize = '100% 100%';
    
    cssOutput.textContent = `background-image: ${gradientCSS};`;
}

// 初始化按钮事件
function initButtons() {
    // 复制CSS按钮
    document.getElementById('copyCSS').addEventListener('click', () => {
        const css = cssOutput.textContent;
        if (!css) {
            showToast('没有可复制的内容');
            return;
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(css)
                .then(() => showToast('已复制到剪贴板'))
                .catch(() => {
                    copyTextFallback(css);
                });
        } else {
            copyTextFallback(css);
        }
    });

    // 重置按钮
    document.getElementById('resetGradient').addEventListener('click', () => {
        // 重置所有状态到初始值
        currentType = 'linear';
        currentAngle = 90;
        currentShape = 'circle';
        radialSize = 100;
        colorStops = [
            { color: '#ff0000', position: 0 },
            { color: '#0000ff', position: 100 }
        ];
        repeatCount = 4;
        isRepeating = false;
        diamondStyle = 'normal';
        diamondSize = 40;
        radialPositionX = 50;
        radialPositionY = 50;

        // 重置UI
        document.querySelectorAll('.type-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'linear');
        });
        document.querySelectorAll('#radialSettings .shape-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.shape === 'circle');
        });
        document.getElementById('repeatSwitch').checked = false;
        document.getElementById('linearSettings').style.display = 'block';
        document.getElementById('radialSettings').style.display = 'none';
        document.getElementById('repeatingSettings').style.display = 'none';
        document.getElementById('repeatingConicSettings').style.display = 'none';

        // 更新渐变
        initColorStops();
        updateGradient();
        showToast('已重置为默认状态');
    });
}

// 添加颜色节点的点击事件
gradientBar.addEventListener('click', (e) => {
    if (e.target !== gradientBar) return; // 确保点击的是渐变条而不是颜色节点
    
    const rect = gradientBar.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    
    // 检查是否与现有节点太近
    const newPosition = Math.round(position);
    const tooClose = colorStops.some(stop => 
        Math.abs(stop.position - newPosition) < 2
    );
    
    if (!tooClose) {
        // 插入新的颜色节点
        const newStop = {
            color: '#ffffff',
            position: newPosition
        };
        
        // 找到正确的插入位置
        let insertIndex = 0;
        for (let i = 0; i < colorStops.length; i++) {
            if (colorStops[i].position > position) {
                break;
            }
            insertIndex = i + 1;
        }
        
        colorStops.splice(insertIndex, 0, newStop);
        initColorStops();
        updateGradient();
    }
});

// 移除原有的拖放事件监听器
colorStopsContainer.removeEventListener('dragover', () => {});
colorStopsContainer.removeEventListener('drop', () => {});

// 添加重复次数滑块初始化
function initRepeatCountSlider() {
    const valueDisplay = repeatCountSlider.nextElementSibling;
    repeatCountSlider.addEventListener('input', (e) => {
        repeatCount = parseInt(e.target.value);
        valueDisplay.textContent = `${repeatCount}次`;
        updateGradient();
    });
}

// 添加开关初始化函数
function initRepeatSwitch() {
    const repeatSwitch = document.getElementById('repeatSwitch');
    const repeatingSettings = document.getElementById('repeatingSettings');
    const linearSettings = document.getElementById('linearSettings');
    const repeatingConicSettings = document.getElementById('repeatingConicSettings');
    
    repeatSwitch.addEventListener('change', (e) => {
        isRepeating = e.target.checked;
        repeatingSettings.style.display = isRepeating ? 'block' : 'none';
        
        // 如果当前是角度渐变，切换方向控制面板
        if (currentType === 'conic') {
            linearSettings.style.display = isRepeating ? 'none' : 'block';
            repeatingConicSettings.style.display = isRepeating ? 'block' : 'none';
            // 重置为默认方向
            if (isRepeating) {
                document.querySelector('#repeatingConicSettings [data-direction="to bottom right"]').click();
            } else {
                document.querySelector('#linearSettings [data-direction="to right"]').click();
            }
        }
        
        updateGradient();
    });
}

// 添加方向按钮初始化函数
function initDirectionButtons() {
    const directionTabs = document.querySelectorAll('[data-direction]');
    const customAngle = document.getElementById('customAngle');
    
    directionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 如果是菱形渐变，不响应点击
            if (currentType === 'diamond') return;
            
            directionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const direction = tab.dataset.direction;
            if (direction === 'custom') {
                customAngle.style.display = 'block';
            } else {
                customAngle.style.display = 'none';
                // 更新渐变方向
                switch(direction) {
                    case 'to right':
                        currentAngle = 90;
                        break;
                    case 'to left':
                        currentAngle = 270;
                        break;
                    case 'to bottom':
                        currentAngle = 180;
                        break;
                    case 'to top':
                        currentAngle = 0;
                        break;
                    case 'to bottom right':
                        currentAngle = 135;
                        break;
                    case 'to bottom left':
                        currentAngle = 225;
                        break;
                    case 'to top right':
                        currentAngle = 45;
                        break;
                    case 'to top left':
                        currentAngle = 315;
                        break;
                }
                // 更新角度显示
                const angleSlider = document.getElementById('gradientAngle');
                angleSlider.value = currentAngle;
                angleSlider.nextElementSibling.textContent = `${currentAngle}°`;
            }
            updateGradient();
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
});

// 添加拖动相关的事件监听
colorStopsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

colorStopsContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const rect = gradientBar.getBoundingClientRect();
    let position = ((e.clientX - rect.left) / rect.width) * 100;
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    // 限制首尾节点的移动范围
    if (draggedIndex === 0) {
        position = 0;
    } else if (draggedIndex === colorStops.length - 1) {
        position = 100;
    } else {
        // 中间节点限制在0-100之间，并避免重叠
        position = Math.max(0, Math.min(100, position));
        const newPosition = Math.round(position);
        const hasOverlap = colorStops.some((stop, i) => 
            i !== draggedIndex && Math.abs(stop.position - newPosition) < 2
        );
        if (hasOverlap) {
            showToast('节点位置太近了', 'error');
            return;
        }
    }
    
    colorStops[draggedIndex].position = Math.round(position);
    // 对颜色节点按位置排序
    colorStops.sort((a, b) => a.position - b.position);
    initColorStops();
    updateGradient();
});

// 首先添加 initDiamondControls 函数的定义
function initDiamondControls() {
    const diamondStyleTabs = document.querySelectorAll('[data-diamond-style]');
    const diamondSizeSlider = document.getElementById('diamondSize');
    
    if (diamondStyleTabs) {
        diamondStyleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                diamondStyleTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                diamondStyle = tab.dataset.diamondStyle;
                updateGradient();
            });
        });
    }
    
    if (diamondSizeSlider) {
        const valueDisplay = diamondSizeSlider.nextElementSibling;
        diamondSizeSlider.addEventListener('input', (e) => {
            diamondSize = parseInt(e.target.value);
            valueDisplay.textContent = `${diamondSize}%`;
            updateGradient();
        });
    }
}

// 添加 CSS 解析和应用功能
function parseCSSGradient(cssText) {
    if (!cssText) return null;
    
    // 清理输入文本
    cssText = cssText.trim()
        .replace(/^background(?:-image)?:\s*/, '')  // 移除 background 或 background-image
        .replace(/;$/, '')                          // 移除末尾分号
        .replace(/\s+deg\s+/, 'deg ')              // 修复多余的空格
        .replace(/\s+,\s+/g, ', ')                 // 标准化逗号间隔
        .replace(/\s+at\s+/, ' at ')               // 标准化 at 关键字
        .replace(/\s{2,}/g, ' ');                  // 移除多余空格

    // 解析渐变类型
    const typeMatch = cssText.match(/^(repeating-)?(linear|radial|conic)-gradient\((.*)\)$/);
    if (!typeMatch) {
        console.error('Invalid gradient format:', cssText);
        return null;
    }

    const isRepeating = !!typeMatch[1];
    const type = typeMatch[2];
    let content = typeMatch[3].trim();

    // 解析角度/方向和形状
    let angle = 90;
    let shape = 'circle';
    let size = 100;
    let positionX = 50;
    let positionY = 50;
    let colorStops = [];

    if (type === 'radial') {
        // 支持更多的径向渐变语法
        const radialMatch = content.match(/^(?:(circle|ellipse))?\s*(?:([.\d]+(?:px|%))|(?:([.\d]+)(?:px|%)\s+([.\d]+)(?:px|%)))?\s*(?:at\s+([.\d]+%)\s+([.\d]+%))?,?\s*(.+)$/);
        
        if (radialMatch) {
            shape = radialMatch[1] || 'circle';
            
            // 处理尺寸
            if (radialMatch[2]) { // 单一尺寸（圆形）
                const sizeValue = radialMatch[2];
                if (sizeValue.endsWith('px')) {
                    const previewSize = Math.min(gradientPreview.offsetWidth, gradientPreview.offsetHeight);
                    size = (parseFloat(sizeValue) / previewSize) * 100;
                } else {
                    size = parseFloat(sizeValue);
                }
            }
            
            // 处理位置
            if (radialMatch[5] && radialMatch[6]) {
                positionX = parseFloat(radialMatch[5]);
                positionY = parseFloat(radialMatch[6]);
            }
            
            // 处理颜色节点
            colorStops = parseColorStops(radialMatch[7] || content);
        } else {
            colorStops = parseColorStops(content);
        }
    } else if (type === 'linear') {
        // 处理方向关键字
        const directionMatch = content.match(/^to\s+(top|bottom|left|right)(?:\s+(left|right))?/);
        if (directionMatch) {
            const direction = directionMatch[0];
            switch(direction) {
                case 'to right': angle = 90; break;
                case 'to left': angle = 270; break;
                case 'to bottom': angle = 180; break;
                case 'to top': angle = 0; break;
                case 'to bottom right': angle = 135; break;
                case 'to bottom left': angle = 225; break;
                case 'to top right': angle = 45; break;
                case 'to top left': angle = 315; break;
            }
            const colorStopsText = content.substring(directionMatch[0].length).replace(/^,\s*/, '');
            colorStops = parseColorStops(colorStopsText);
        } else {
            const angleMatch = content.match(/^(-?[.\d]+)deg/);
            if (angleMatch) {
                angle = parseFloat(angleMatch[1]);
                if (angle < 0) {
                    angle = (360 + angle) % 360;
                }
                const colorStopsText = content.substring(angleMatch[0].length).replace(/^,\s*/, '');
                colorStops = parseColorStops(colorStopsText);
            } else {
                colorStops = parseColorStops(content);
            }
        }
    }

    return {
        type,
        isRepeating,
        angle,
        shape,
        size,
        positionX,
        positionY,
        colorStops
    };
}

function parseColorStops(stopsText) {
    if (!stopsText) return [];
    
    // 分割颜色节点，处理各种分隔符
    const stops = stopsText.split(/\s*,\s*/).filter(Boolean);
    
    return stops.map((stop, index) => {
        // 支持更多颜色格式和位置格式
        const match = stop.match(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)(?:\s+(-?[.\d]+)(?:%|deg)?)?/);
        
        if (match) {
            let position;
            if (match[2] !== undefined) {
                position = parseFloat(match[2]);
            } else {
                position = index === 0 ? 0 : index === stops.length - 1 ? 100 : Math.round((index / (stops.length - 1)) * 100);
            }
            
            return {
                color: match[1],
                position: position
            };
        }
        return null;
    }).filter(Boolean);
}

// 修改处理粘贴事件的函数
function handlePaste(text) {
    try {
        // 修改正则表达式以更灵活地匹配渐变代码
        const gradient = parseCSSGradient(text.trim());
        if (!gradient) {
            showToast('无效的渐变CSS代码', 'error');
            return;
        }
        
        // 应用解析结果
        currentType = gradient.type;
        isRepeating = gradient.isRepeating;
        currentAngle = gradient.angle;
        currentShape = gradient.shape;
        radialSize = gradient.size;
        radialPositionX = gradient.positionX;
        radialPositionY = gradient.positionY;
        colorStops = gradient.colorStops;
        
        // 更新UI
        const typeButton = document.querySelector(`[data-type="${currentType}"]`);
        if (typeButton) {
            typeButton.click();
        }
        
        // 更新重复开关
        const repeatSwitch = document.getElementById('repeatSwitch');
        if (repeatSwitch) {
            repeatSwitch.checked = isRepeating;
        }
        
        // 更新角度/方向
        if (currentType === 'linear' || currentType === 'conic') {
            // 查找匹配的预设方向按钮
            let directionButton = null;
            switch(currentAngle) {
                case 0: directionButton = '[data-direction="to top"]'; break;
                case 90: directionButton = '[data-direction="to right"]'; break;
                case 180: directionButton = '[data-direction="to bottom"]'; break;
                case 270: directionButton = '[data-direction="to left"]'; break;
                case 45: directionButton = '[data-direction="to top right"]'; break;
                case 135: directionButton = '[data-direction="to bottom right"]'; break;
                case 225: directionButton = '[data-direction="to bottom left"]'; break;
                case 315: directionButton = '[data-direction="to top left"]'; break;
                default:
                    directionButton = '[data-direction="custom"]';
            }
            
            const button = document.querySelector(directionButton);
            if (button) {
                button.click();
            }
            
            // 更新角度滑块
            if (angleSlider) {
                angleSlider.value = currentAngle;
                angleSlider.nextElementSibling.textContent = `${currentAngle}°`;
            }
        }
        
        // 更新形状
        if (currentType === 'radial') {
            const shapeButton = document.querySelector(`[data-shape="${currentShape}"]`);
            if (shapeButton) {
                shapeButton.click();
            }
            
            const sizeSlider = document.getElementById('radialSize');
            if (sizeSlider) {
                sizeSlider.value = radialSize;
                sizeSlider.nextElementSibling.textContent = `${radialSize}%`;
            }
            
            const posXSlider = document.getElementById('radialPositionX');
            const posYSlider = document.getElementById('radialPositionY');
            if (posXSlider && posYSlider) {
                posXSlider.value = radialPositionX;
                posYSlider.value = radialPositionY;
                posXSlider.nextElementSibling.textContent = `${radialPositionX}%`;
                posYSlider.nextElementSibling.textContent = `${radialPositionY}%`;
            }
        }
        
        // 重新初始化颜色节点
        initColorStops();
        updateGradient();
        
        showToast('渐变已更新', 'success');
    } catch (error) {
        console.error('解析CSS失败:', error);
        showToast('解析CSS代码失败', 'error');
    }
}

// 添加粘贴功能
function initCSSPaste() {
    const cssOutput = document.getElementById('cssOutput');
    const pasteButton = document.getElementById('pasteCSS');
    
    // 处理粘贴事件
    function handlePaste(text) {
        try {
            const gradient = parseCSSGradient(text.trim());
            if (!gradient) {
                showToast('无效的渐变CSS代码', 'error');
                return;
            }
            
            // 应用解析结果
            currentType = gradient.type;
            isRepeating = gradient.isRepeating;
            currentAngle = gradient.angle;
            currentShape = gradient.shape;
            radialSize = gradient.size;
            radialPositionX = gradient.positionX;
            radialPositionY = gradient.positionY;
            colorStops = gradient.colorStops;
            
            // 更新UI
            const typeButton = document.querySelector(`[data-type="${currentType}"]`);
            if (typeButton) {
                typeButton.click();
            }
            
            // 更新重复开关
            const repeatSwitch = document.getElementById('repeatSwitch');
            if (repeatSwitch) {
                repeatSwitch.checked = isRepeating;
            }
            
            // 更新角度/方向
            if (currentType === 'linear' || currentType === 'conic') {
                // 查找匹配的预设方向按钮
                let directionButton = null;
                switch(currentAngle) {
                    case 0: directionButton = '[data-direction="to top"]'; break;
                    case 90: directionButton = '[data-direction="to right"]'; break;
                    case 180: directionButton = '[data-direction="to bottom"]'; break;
                    case 270: directionButton = '[data-direction="to left"]'; break;
                    case 45: directionButton = '[data-direction="to top right"]'; break;
                    case 135: directionButton = '[data-direction="to bottom right"]'; break;
                    case 225: directionButton = '[data-direction="to bottom left"]'; break;
                    case 315: directionButton = '[data-direction="to top left"]'; break;
                    default:
                        directionButton = '[data-direction="custom"]';
                }
                
                const button = document.querySelector(directionButton);
                if (button) {
                    button.click();
                }
                
                // 更新角度滑块
                if (angleSlider) {
                    angleSlider.value = currentAngle;
                    angleSlider.nextElementSibling.textContent = `${currentAngle}°`;
                }
            }
            
            // 更新形状
            if (currentType === 'radial') {
                const shapeButton = document.querySelector(`[data-shape="${currentShape}"]`);
                if (shapeButton) {
                    shapeButton.click();
                }
                
                const sizeSlider = document.getElementById('radialSize');
                if (sizeSlider) {
                    sizeSlider.value = radialSize;
                    sizeSlider.nextElementSibling.textContent = `${radialSize}%`;
                }
                
                const posXSlider = document.getElementById('radialPositionX');
                const posYSlider = document.getElementById('radialPositionY');
                if (posXSlider && posYSlider) {
                    posXSlider.value = radialPositionX;
                    posYSlider.value = radialPositionY;
                    posXSlider.nextElementSibling.textContent = `${radialPositionX}%`;
                    posYSlider.nextElementSibling.textContent = `${radialPositionY}%`;
                }
            }
            
            // 重新初始化颜色节点
            initColorStops();
            updateGradient();
            
            showToast('渐变已更新', 'success');
        } catch (error) {
            console.error('解析CSS失败:', error);
            showToast('解析CSS代码失败', 'error');
        }
    }
    
    // 监听粘贴按钮点击
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            handlePaste(text);
        } catch (error) {
            showToast('无法访问剪贴板', 'error');
        }
    });
    
    // 监听直接粘贴
    cssOutput.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        handlePaste(text);
    });
}

// 初始化径向渐变大小控制
function initRadialSizeControl() {
    const sizeSlider = document.getElementById('radialSize');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            radialSize = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${radialSize}%`;
            updateGradient();
        });
    }
}

// 添加位置控制初始化函数
function initRadialPositionControls() {
    const xSlider = document.getElementById('radialPositionX');
    const ySlider = document.getElementById('radialPositionY');
    
    // 处理滑块变化
    xSlider.addEventListener('input', (e) => {
        radialPositionX = e.target.value;
        e.target.nextElementSibling.textContent = `${radialPositionX}%`;
        updateGradient();
    });
    
    ySlider.addEventListener('input', (e) => {
        radialPositionY = e.target.value;
        e.target.nextElementSibling.textContent = `${radialPositionY}%`;
        updateGradient();
    });
}

function copyTextFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('已复制到剪贴板');
    } catch (err) {
        showToast('复制失败，请手动复制');
    } finally {
        document.body.removeChild(textarea);
    }
}
