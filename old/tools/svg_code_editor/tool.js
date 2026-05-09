// SVG 代码编辑器
const svgCode = document.getElementById('svgCode');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const editorContainer = document.getElementById('editorContainer');
const elementEditor = document.getElementById('elementEditor');

// 保存原始 SVG 代码
let originalSVG = '';
let selectedElement = null;
let currentGradientId = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 监听代码输入
    svgCode.addEventListener('input', debounce(updatePreview, 300));
    
    // 监听文件上传
    fileInput.addEventListener('change', handleFileUpload);
    
    // 上传区域点击
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // 支持拖拽上传
    setupDragAndDrop();
    
    // 支持粘贴
    setupPaste();
    
    // 恢复用户的背景选择
    restorePreviewBg();
    
    // 加载示例
    loadExample();
});

// 加载示例 SVG
function loadExample() {
    const example = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="180" rx="20" fill="#3366FF" opacity="0.8"/>
  <circle cx="100" cy="100" r="60" fill="#fff" opacity="0.9"/>
  <path d="M 70 100 L 90 120 L 130 80" stroke="#3366FF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
    svgCode.value = example;
    originalSVG = example;
    showEditor();
    updatePreview();
}

// 显示编辑器
function showEditor() {
    // 上传区域始终显示，不隐藏
    editorContainer.style.display = 'grid';
}

// 隐藏编辑器
function hideEditor() {
    // 保持编辑器常显
    editorContainer.style.display = 'grid';
}

// 文件上传处理
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('svg')) {
        showToast('请上传 SVG 文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        svgCode.value = content;
        originalSVG = content;
        showEditor();
        updatePreview();
        showToast('文件上传成功');
    };
    reader.readAsText(file);
}

// 拖拽上传
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        });
    });
    
    uploadArea.addEventListener('drop', function(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.includes('svg')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const content = event.target.result;
                    svgCode.value = content;
                    originalSVG = content;
                    showEditor();
                    updatePreview();
                    showToast('文件上传成功');
                };
                reader.readAsText(file);
            } else {
                showToast('请上传 SVG 文件');
            }
        }
    });
}

// 粘贴支持
function setupPaste() {
    document.addEventListener('paste', (e) => {
        const text = e.clipboardData.getData('text');
        if (text && text.trim().startsWith('<svg')) {
            svgCode.value = text;
            originalSVG = text;
            showEditor();
            updatePreview();
            showToast('已粘贴 SVG 代码');
            e.preventDefault();
        }
    });
}

// 更新预览
function updatePreview() {
    const code = svgCode.value.trim();
    const previewContent = document.getElementById('svgPreviewContent');
    
    if (!code) {
        previewContent.innerHTML = `
            <div class="preview-empty">
                <p>👈 在左侧输入 SVG 代码</p>
                <p>预览将实时显示在这里</p>
            </div>
        `;
        updateStats();
        return;
    }
    
    try {
        // 验证 SVG 代码
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'image/svg+xml');
        const parseError = doc.querySelector('parsererror');
        
        if (parseError) {
            throw new Error('SVG 代码格式错误');
        }
        
        // 显示预览
        previewContent.innerHTML = code;
        
        // 为 SVG 元素添加点击事件
        const svgElement = previewContent.querySelector('svg');
        if (svgElement) {
            setupElementSelection(svgElement);
        }
        
        updateStats();
        
    } catch (error) {
        previewContent.innerHTML = `
            <div class="preview-empty" style="color: var(--red-color);">
                <p>⚠️ SVG 代码有误</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// 设置元素选择
function setupElementSelection(svgElement) {
    const selectableElements = svgElement.querySelectorAll('rect, circle, ellipse, line, polyline, polygon, path');
    
    selectableElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            selectElement(el, e);
        });
    });
    
    // 点击 SVG 背景取消选择
    svgElement.addEventListener('click', () => {
        deselectElement();
    });
}

// 点击预览区空白处关闭弹窗
document.addEventListener('DOMContentLoaded', function() {
    const previewContent = document.getElementById('svgPreviewContent');
    if (previewContent) {
        previewContent.addEventListener('click', (e) => {
            // 如果点击的是预览区本身（不是 SVG 元素），关闭弹窗
            if (e.target === previewContent || e.target.classList.contains('preview-empty')) {
                deselectElement();
            }
        });
    }
});

// 选中元素
function selectElement(element, event) {
    // 取消之前的选择
    deselectElement();
    
    selectedElement = element;
    element.classList.add('selected');
    
    // 显示编辑器
    showElementEditor(element, event);
}

// 取消选择
function deselectElement() {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
    }
    elementEditor.classList.remove('show');
}

// 显示元素编辑器
function showElementEditor(element, event) {
    const tagName = element.tagName.toLowerCase();
    document.getElementById('editorTitle').textContent = `编辑 <${tagName}>`;
    
    // 获取元素属性
    const fill = element.getAttribute('fill') || '#000000';
    const fillOpacity = element.getAttribute('fill-opacity') || '1';
    const stroke = element.getAttribute('stroke') || 'none';
    const strokeWidth = element.getAttribute('stroke-width') || '1';
    const strokeOpacity = element.getAttribute('stroke-opacity') || '1';
    
    // 填充颜色 - 始终显示
    const fillGroup = document.getElementById('fillGroup');
    if (fill && fill !== 'none' && !fill.startsWith('url(')) {
        document.getElementById('fillColorPicker').value = fill;
        document.getElementById('fillColorText').value = fill;
    } else {
        document.getElementById('fillColorPicker').value = '#000000';
        document.getElementById('fillColorText').value = 'none';
    }
    const fillOpacityPercent = Math.round(parseFloat(fillOpacity) * 100);
    document.getElementById('fillOpacitySlider').value = fillOpacityPercent;
    document.getElementById('fillOpacityValue').textContent = fillOpacityPercent + '%';
    fillGroup.style.display = 'block';
    
    // 描边 - 始终显示
    const strokeGroup = document.getElementById('strokeGroup');
    if (stroke && stroke !== 'none') {
        document.getElementById('strokeColorPicker').value = stroke;
        document.getElementById('strokeColorText').value = stroke;
        document.getElementById('strokeWidthSlider').value = parseFloat(strokeWidth);
        document.getElementById('strokeWidthValue').textContent = strokeWidth;
    } else {
        document.getElementById('strokeColorPicker').value = '#000000';
        document.getElementById('strokeColorText').value = 'none';
        document.getElementById('strokeWidthSlider').value = 1;
        document.getElementById('strokeWidthValue').textContent = '1';
    }
    const strokeOpacityPercent = Math.round(parseFloat(strokeOpacity) * 100);
    document.getElementById('strokeOpacitySlider').value = strokeOpacityPercent;
    document.getElementById('strokeOpacityValue').textContent = strokeOpacityPercent + '%';
    strokeGroup.style.display = 'block';
    
    // 定位编辑器（跟随鼠标）
    positionEditorNearMouse(event);
    
    // 显示编辑器
    elementEditor.classList.add('show');
    
    // 绑定事件
    bindEditorEvents();
}

// 定位编辑器（跟随鼠标）
function positionEditorNearMouse(event) {
    const previewPanel = document.querySelector('.preview-panel');
    const previewRect = previewPanel.getBoundingClientRect();
    
    // 获取鼠标在预览面板内的相对位置
    let left = event.clientX - previewRect.left + 15;
    let top = event.clientY - previewRect.top + 15;
    
    // 确保不超出边界
    const editorWidth = 280;
    const editorHeight = 350;
    
    // 如果右侧空间不够，显示在鼠标左侧
    if (left + editorWidth > previewRect.width) {
        left = event.clientX - previewRect.left - editorWidth - 15;
    }
    
    // 如果下方空间不够，向上调整
    if (top + editorHeight > previewRect.height) {
        top = previewRect.height - editorHeight - 10;
    }
    
    // 确保不超出上边界和左边界
    if (top < 10) top = 10;
    if (left < 10) left = 10;
    
    elementEditor.style.left = left + 'px';
    elementEditor.style.top = top + 'px';
}

// 绑定编辑器事件
function bindEditorEvents() {
    // 填充颜色
    const fillColorPicker = document.getElementById('fillColorPicker');
    const fillColorText = document.getElementById('fillColorText');
    
    fillColorPicker.oninput = (e) => {
        fillColorText.value = e.target.value;
        applyFillColor(e.target.value);
    };
    
    fillColorText.oninput = (e) => {
        if (isValidColor(e.target.value)) {
            fillColorPicker.value = e.target.value;
            applyFillColor(e.target.value);
        }
    };
    
    // 填充透明度
    const fillOpacitySlider = document.getElementById('fillOpacitySlider');
    const fillOpacityValue = document.getElementById('fillOpacityValue');
    
    fillOpacitySlider.oninput = (e) => {
        const percent = e.target.value;
        fillOpacityValue.textContent = percent + '%';
        applyFillOpacity(percent / 100);
    };
    
    // 描边颜色
    const strokeColorPicker = document.getElementById('strokeColorPicker');
    const strokeColorText = document.getElementById('strokeColorText');
    
    strokeColorPicker.oninput = (e) => {
        strokeColorText.value = e.target.value;
        applyStrokeColor(e.target.value);
    };
    
    strokeColorText.oninput = (e) => {
        if (isValidColor(e.target.value)) {
            strokeColorPicker.value = e.target.value;
            applyStrokeColor(e.target.value);
        }
    };
    
    // 描边宽度
    const strokeWidthSlider = document.getElementById('strokeWidthSlider');
    const strokeWidthValue = document.getElementById('strokeWidthValue');
    
    strokeWidthSlider.oninput = (e) => {
        strokeWidthValue.textContent = e.target.value;
        applyStrokeWidth(e.target.value);
    };
    
    // 描边透明度
    const strokeOpacitySlider = document.getElementById('strokeOpacitySlider');
    const strokeOpacityValue = document.getElementById('strokeOpacityValue');
    
    strokeOpacitySlider.oninput = (e) => {
        const percent = e.target.value;
        strokeOpacityValue.textContent = percent + '%';
        applyStrokeOpacity(percent / 100);
    };
}

// 应用填充颜色
function applyFillColor(color) {
    if (!selectedElement) return;
    selectedElement.setAttribute('fill', color);
    syncCodeFromPreview();
}

// 应用描边颜色
function applyStrokeColor(color) {
    if (!selectedElement) return;
    selectedElement.setAttribute('stroke', color);
    syncCodeFromPreview();
}

// 应用描边宽度
function applyStrokeWidth(width) {
    if (!selectedElement) return;
    selectedElement.setAttribute('stroke-width', width);
    syncCodeFromPreview();
}

// 应用填充透明度
function applyFillOpacity(opacity) {
    if (!selectedElement) return;
    selectedElement.setAttribute('fill-opacity', opacity);
    syncCodeFromPreview();
}

// 应用描边透明度
function applyStrokeOpacity(opacity) {
    if (!selectedElement) return;
    selectedElement.setAttribute('stroke-opacity', opacity);
    syncCodeFromPreview();
}

// 从预览同步到代码
function syncCodeFromPreview() {
    const previewContent = document.getElementById('svgPreviewContent');
    const svgElement = previewContent.querySelector('svg');
    
    if (svgElement) {
        const serializer = new XMLSerializer();
        let result = serializer.serializeToString(svgElement);
        result = formatXML(result);
        svgCode.value = result;
        updateStats();
    }
}

// 验证颜色
function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

// 更新统计信息
function updateStats() {
    const code = svgCode.value;
    const charCount = code.length;
    const lineCount = code.split('\n').length;
    const sizeKB = (new Blob([code]).size / 1024).toFixed(2);
    
    document.getElementById('charCount').textContent = `${charCount} 字符`;
    document.getElementById('lineCount').textContent = `${lineCount} 行`;
    document.getElementById('svgSize').textContent = code ? `${sizeKB} KB` : '0 KB';
    
    // 更新预览区的尺寸信息
    const previewContent = document.getElementById('svgPreviewContent');
    const svgElement = previewContent ? previewContent.querySelector('svg') : null;
    if (svgElement) {
        const width = svgElement.getAttribute('width') || svgElement.viewBox?.baseVal?.width || 'auto';
        const height = svgElement.getAttribute('height') || svgElement.viewBox?.baseVal?.height || 'auto';
        document.getElementById('svgDimensions').textContent = `${width} × ${height}`;
    } else {
        document.getElementById('svgDimensions').textContent = '-';
    }
}

// 格式化 SVG
function formatSVG() {
    const code = svgCode.value.trim();
    if (!code) {
        showToast('请先输入 SVG 代码');
        return;
    }
    
    try {
        const formatted = formatXML(code);
        svgCode.value = formatted;
        updatePreview();
        showToast('格式化成功');
    } catch (error) {
        showToast('格式化失败：' + error.message);
    }
}

// XML 格式化函数
function formatXML(xml) {
    let formatted = '';
    let indent = '';
    const tab = '  ';
    
    xml.split(/>\s*</).forEach(function(node) {
        if (node.match(/^\/\w/)) {
            indent = indent.substring(tab.length);
        }
        formatted += indent + '<' + node + '>\r\n';
        if (node.match(/^<?\w[^>]*[^\/]$/)) {
            indent += tab;
        }
    });
    
    return formatted.substring(1, formatted.length - 3);
}

// 压缩 SVG
function minifySVG() {
    const code = svgCode.value.trim();
    if (!code) {
        showToast('请先输入 SVG 代码');
        return;
    }
    
    try {
        let minified = code.replace(/<!--[\s\S]*?-->/g, '');
        minified = minified.replace(/>\s+</g, '><');
        minified = minified.replace(/\s+/g, ' ');
        minified = minified.trim();
        
        svgCode.value = minified;
        updatePreview();
        showToast('压缩成功');
    } catch (error) {
        showToast('压缩失败：' + error.message);
    }
}

// 复制 SVG 代码
function copySVG() {
    const code = svgCode.value.trim();
    if (!code) {
        showToast('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        showToast('已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败');
    });
}

// 下载 SVG
function downloadSVG() {
    const code = svgCode.value.trim();
    if (!code) {
        showToast('没有可下载的内容');
        return;
    }
    
    const blob = new Blob([code], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('下载成功');
}

// 清空编辑器
function clearEditor() {
    if (svgCode.value.trim() && !confirm('确定要清空编辑器吗？')) {
        return;
    }
    svgCode.value = '';
    originalSVG = '';
    updatePreview();
    showToast('已清空');
}

// 恢复默认
function resetSVG() {
    if (!originalSVG) {
        showToast('没有可恢复的原始 SVG');
        return;
    }
    
    svgCode.value = originalSVG;
    updatePreview();
    showToast('已恢复到原始状态');
}

// 裁剪 SVG
function trimSVG(safe = false) {
    const code = svgCode.value.trim();
    if (!code) {
        showToast('请先输入 SVG 代码');
        return;
    }
    
    try {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = code;
        document.body.appendChild(tempDiv);
        
        const svg = tempDiv.querySelector('svg');
        
        if (!svg) {
            document.body.removeChild(tempDiv);
            showToast('未找到 SVG 元素');
            return;
        }
        
        // 先删除透明和不可见的元素，避免影响边界计算
        const removedElements = [];
        svg.querySelectorAll('*').forEach(el => {
            const fill = el.getAttribute('fill');
            const stroke = el.getAttribute('stroke');
            const opacity = el.getAttribute('opacity');
            
            // 删除透明、无填充无描边的元素
            if (fill === 'transparent' || (fill === 'none' && (!stroke || stroke === 'none')) || 
                opacity === '0') {
                removedElements.push({el, parent: el.parentNode});
                el.remove();
            }
        });
        
        // 检测动画元素，计算动画的最大范围
        let animationBounds = null;
        const animatedElements = svg.querySelectorAll('animate, animateTransform');
        
        if (animatedElements.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            
            // 遍历所有有动画的元素
            svg.querySelectorAll('rect, circle, ellipse, line, polyline, polygon, path').forEach(el => {
                const animations = el.querySelectorAll('animate');
                if (animations.length === 0) return;
                
                // 获取元素的基础位置
                let x = parseFloat(el.getAttribute('x') || el.getAttribute('cx') || 0);
                let y = parseFloat(el.getAttribute('y') || el.getAttribute('cy') || 0);
                let width = parseFloat(el.getAttribute('width') || el.getAttribute('r') || 0);
                let height = parseFloat(el.getAttribute('height') || el.getAttribute('r') || 0);
                
                // 检查动画的最大值
                animations.forEach(anim => {
                    const attr = anim.getAttribute('attributeName');
                    const values = anim.getAttribute('values');
                    
                    if (values) {
                        const nums = values.split(';').map(v => parseFloat(v)).filter(n => !isNaN(n));
                        const maxVal = Math.max(...nums);
                        const minVal = Math.min(...nums);
                        
                        if (attr === 'height') {
                            height = maxVal;
                        } else if (attr === 'y' || attr === 'cy') {
                            y = minVal;
                        } else if (attr === 'width') {
                            width = maxVal;
                        } else if (attr === 'x' || attr === 'cx') {
                            x = minVal;
                        }
                    }
                });
                
                // 更新边界
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + width);
                maxY = Math.max(maxY, y + height);
            });
            
            if (minX !== Infinity) {
                animationBounds = {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY
                };
            }
        }
        
        // 获取可见内容的实际边界（已删除透明元素）
        let bbox = svg.getBBox();
        
        // 恢复删除的元素（用于后续处理）
        removedElements.forEach(({el, parent}) => {
            parent.appendChild(el);
        });
        
        // 如果有动画，合并动画边界
        if (animationBounds) {
            const minX = Math.min(bbox.x, animationBounds.x);
            const minY = Math.min(bbox.y, animationBounds.y);
            const maxX = Math.max(bbox.x + bbox.width, animationBounds.x + animationBounds.width);
            const maxY = Math.max(bbox.y + bbox.height, animationBounds.y + animationBounds.height);
            
            bbox = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }
        
        document.body.removeChild(tempDiv);
        
        if (!bbox || bbox.width === 0 || bbox.height === 0) {
            showToast('无法计算 SVG 边界');
            return;
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        
        // 移除透明和不可见的元素
        svgElement.querySelectorAll('*').forEach(el => {
            const fill = el.getAttribute('fill');
            const stroke = el.getAttribute('stroke');
            const opacity = el.getAttribute('opacity');
            
            // 删除透明、无填充无描边的元素
            if (fill === 'transparent' || (fill === 'none' && (!stroke || stroke === 'none')) || 
                opacity === '0') {
                el.remove();
            }
        });
        
        let finalX = bbox.x;
        let finalY = bbox.y;
        let finalWidth = bbox.width;
        let finalHeight = bbox.height;
        
        if (safe) {
            const paddingX = bbox.width * 0.1;
            const paddingY = bbox.height * 0.1;
            
            finalX = bbox.x - paddingX;
            finalY = bbox.y - paddingY;
            finalWidth = bbox.width + paddingX * 2;
            finalHeight = bbox.height + paddingY * 2;
        }
        
        const newViewBox = `${finalX} ${finalY} ${finalWidth} ${finalHeight}`;
        svgElement.setAttribute('viewBox', newViewBox);
        svgElement.setAttribute('width', Math.round(finalWidth));
        svgElement.setAttribute('height', Math.round(finalHeight));
        
        const serializer = new XMLSerializer();
        let result = serializer.serializeToString(svgElement);
        result = formatXML(result);
        
        svgCode.value = result;
        updatePreview();
        
        const mode = safe ? '安全裁剪' : '精确裁剪';
        const hasAnimation = animatedElements.length > 0 ? ' (检测到动画)' : '';
        showToast(`✅ ${mode}完成 ${Math.round(finalWidth)}×${Math.round(finalHeight)}${hasAnimation}`);
        
    } catch (error) {
        showToast('❌ 裁剪失败：' + error.message);
    }
}

// 切换预览背景
function changePreviewBg(type) {
    const preview = document.getElementById('svgPreviewContent');
    const options = document.querySelectorAll('.bg-option');
    
    options.forEach(opt => opt.classList.remove('active'));
    document.querySelector(`.bg-${type}`).classList.add('active');
    
    preview.setAttribute('data-bg', type);
    localStorage.setItem('svg-preview-bg', type);
}

// 恢复预览背景设置
function restorePreviewBg() {
    const savedBg = localStorage.getItem('svg-preview-bg') || 'checker';
    const preview = document.getElementById('svgPreviewContent');
    const options = document.querySelectorAll('.bg-option');
    
    preview.setAttribute('data-bg', savedBg);
    
    options.forEach(opt => opt.classList.remove('active'));
    const activeOption = document.querySelector(`.bg-${savedBg}`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



// ==================== 导出 PNG 功能 ====================

// 导出静态 PNG
async function exportStaticPNG() {
    const previewContent = document.getElementById('svgPreviewContent');
    const svgElement = previewContent.querySelector('svg');
    
    if (!svgElement) {
        showToast('请先输入 SVG 代码');
        return;
    }
    
    // 获取 SVG 尺寸
    let width = parseInt(svgElement.getAttribute('width')) || 800;
    let height = parseInt(svgElement.getAttribute('height')) || 600;
    
    if (!svgElement.getAttribute('width') && svgElement.viewBox.baseVal.width) {
        width = svgElement.viewBox.baseVal.width;
        height = svgElement.viewBox.baseVal.height;
    }
    
    try {
        showToast('正在生成 PNG...');
        
        // 创建 canvas
        const canvas = document.createElement('canvas');
        const scale = 2; // 2倍分辨率
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        
        // 获取完整的 SVG 代码
        const svgCode = document.getElementById('svgCode').value;
        
        // 使用 Data URL
        const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgCode);
        
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(blob => {
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = 'svg-export.png';
                a.click();
                URL.revokeObjectURL(downloadUrl);
                showToast('✅ PNG 导出成功');
            }, 'image/png');
        };
        
        img.onerror = (e) => {
            console.error('Image load error:', e);
            showToast('❌ PNG 导出失败：图片加载错误');
        };
        
        img.src = svgDataUrl;
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('❌ 导出失败：' + error.message);
    }
}
