// 获取DOM元素
 const uploadArea = document.getElementById('uploadArea');
 const fileInput = document.getElementById('fileInput');
const watermarkInput = document.getElementById('watermarkInput');
const previewCanvas = document.getElementById('previewCanvas');
const ctx = previewCanvas.getContext('2d');
 const downloadBtn = document.getElementById('downloadBtn');

// 水印设置相关元素
const watermarkText = document.getElementById('watermarkText');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');
const opacity = document.getElementById('opacity');
const watermarkSize = document.getElementById('watermarkSize');

// 状态变量
let originalImage = null;
let watermarkImage = null;
let selectedPosition = 'middle-center';
let watermarkType = 'text';
let watermarkMode = 'single'; // 'single' 或 'tile'
let exportFormat = 'png'; // 默认导出格式
const tileRotation = document.getElementById('tileRotation');
const tileSpacing = document.getElementById('tileSpacing');
const tileSpacingX = document.getElementById('tileSpacingX');
const tileSpacingY = document.getElementById('tileSpacingY');

// 添加清空水印功能
const clearBtn = document.getElementById('clearBtn');

clearBtn.addEventListener('click', () => {
    // 重置水印相关设置
    watermarkText.value = '';
    fontSize.value = '24';
    fontColor.value = '#000000';
    opacity.value = '50';
    watermarkImage = null;
    
    // 重置图片上传区域
    document.querySelector('.upload-content').style.display = 'block';
    document.querySelector('.preview-content').style.display = 'none';
    
    // 更新预览
    updatePreview();
});

// 初始化事件监听
function initEventListeners() {
    // 文件拖放
 uploadArea.addEventListener('dragover', (e) => {
     e.preventDefault();
     uploadArea.classList.add('drag-over');
 });

 uploadArea.addEventListener('dragleave', () => {
     uploadArea.classList.remove('drag-over');
 });

 uploadArea.addEventListener('drop', (e) => {
     e.preventDefault();
     uploadArea.classList.remove('drag-over');
        handleImageUpload(e.dataTransfer.files[0]);
    });

    // 文件选择
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleImageUpload(e.target.files[0]));

    // 水印图片上传
    document.getElementById('watermarkUpload').addEventListener('click', () => watermarkInput.click());
    watermarkInput.addEventListener('change', (e) => handleWatermarkImageUpload(e.target.files[0]));

    // 水印类型切换
    document.querySelectorAll('[data-type]').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('[data-type]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            watermarkType = option.dataset.type;
            document.getElementById('textSettings').style.display = watermarkType === 'text' ? 'block' : 'none';
            document.getElementById('imageSettings').style.display = watermarkType === 'image' ? 'block' : 'none';
            updatePreview();
        });
    });

    // 位置选择
    document.querySelectorAll('.position-option').forEach(option => {
     option.addEventListener('click', () => {
            document.querySelectorAll('.position-option').forEach(opt => opt.classList.remove('active'));
         option.classList.add('active');
            selectedPosition = option.dataset.position;
            updatePreview();
     });
 });

    // 实时预览
    [watermarkText, fontSize, fontColor, opacity, watermarkSize].forEach(input => {
        input.addEventListener('input', (e) => {
            const valueDisplay = e.target.nextElementSibling;
            if (e.target.id === 'fontSize') {
                valueDisplay.textContent = `${e.target.value}px`;
            } else if (e.target.id === 'opacity') {
                valueDisplay.textContent = `${e.target.value}%`;
            } else if (e.target.id === 'watermarkSize') {
                valueDisplay.textContent = `${e.target.value}%`;
            }
            updatePreview();
        });
    });

    // 下载按钮
    downloadBtn.addEventListener('click', downloadImage);

    // 水印模式切换
    document.querySelectorAll('[data-mode]').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('[data-mode]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            watermarkMode = option.dataset.mode;
            
            // 显示/隐藏相关设置
            const tileSettings = document.getElementById('tileSettings');
            const positionSettings = document.querySelector('.position-grid').parentElement;
            
            tileSettings.style.display = watermarkMode === 'tile' ? 'block' : 'none';
            positionSettings.style.display = watermarkMode === 'single' ? 'block' : 'none';
            
            updatePreview();
     });
 });

    // 角度预设点击事件
    document.querySelectorAll('.angle-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.angle-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            const angle = parseInt(option.dataset.angle);
            tileRotation.value = angle;
            // 更新显示的角度值（转换为 -45° 这样的格式）
            tileRotation.nextElementSibling.textContent = 
                angle > 180 ? `${angle - 360}°` : `${angle}°`;
            updatePreview();
        });
    });

    // 修改铺满设置的实时预览
    [tileRotation, tileSpacingX, tileSpacingY].forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.target.id === 'tileRotation') {
                const angle = parseInt(e.target.value);
                e.target.nextElementSibling.textContent = 
                    angle > 180 ? `${angle - 360}°` : `${angle}°`;
                // 更新角度预设的选中状态
                document.querySelectorAll('.angle-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.angle === e.target.value);
                });
            } else {
                e.target.nextElementSibling.textContent = `${e.target.value}%`;
            }
            updatePreview();
        });
    });

    // 导出格式切换
    document.querySelectorAll('[data-format]').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('[data-format]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            exportFormat = option.dataset.format;
        });
    });
}

// 处理图片上传
function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('请选择有效的图片文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            resetCanvas();
            updatePreview();
            downloadBtn.disabled = false;
            clearBtn.disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 处理水印图片上传
function handleWatermarkImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('请选择有效的图片文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
       const img = new Image();
        img.onload = () => {
            watermarkImage = img;
            // 显示预览
            const previewImg = document.getElementById('watermarkPreview');
            previewImg.src = e.target.result;
            document.querySelector('.upload-content').style.display = 'none';
            document.querySelector('.preview-content').style.display = 'block';
            updatePreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 重置画布
function resetCanvas() {
    if (!originalImage) return;
    
    // 设置画布尺寸
    const maxWidth = uploadArea.offsetWidth;
    const scale = maxWidth / originalImage.width;
    previewCanvas.width = maxWidth;
    previewCanvas.height = originalImage.height * scale;
    
    // 绘制原始图片
    ctx.drawImage(originalImage, 0, 0, previewCanvas.width, previewCanvas.height);
}

// 更新预览
function updatePreview() {
    if (!originalImage) return;
    
    resetCanvas();
    
    if (watermarkType === 'text' && watermarkText.value) {
        addTextWatermark();
    } else if (watermarkType === 'image' && watermarkImage) {
        addImageWatermark();
    }
}

// 添加文字水印
function addTextWatermark() {
    const text = watermarkText.value;
    const size = fontSize.value;
    const color = fontColor.value;
    const alpha = opacity.value / 100;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = color;
    
    if (watermarkMode === 'tile') {
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = parseInt(size);
        
        // 使用分别设置的水平和垂直间距
        const spacingX = textWidth * (tileSpacingX.value / 100);
        const spacingY = textHeight * (tileSpacingY.value / 100);
        
        // 使用设置的旋转角度
        const rotation = (tileRotation.value * Math.PI) / 180;
        ctx.translate(previewCanvas.width/2, previewCanvas.height/2);
        ctx.rotate(rotation);
        ctx.translate(-previewCanvas.width/2, -previewCanvas.height/2);
        
        const diagonal = Math.sqrt(previewCanvas.width * previewCanvas.width + previewCanvas.height * previewCanvas.height);
        
        for (let y = -diagonal; y < diagonal; y += spacingY) {
            for (let x = -diagonal; x < diagonal; x += spacingX) {
                ctx.fillText(text, x, y);
            }
        }
    } else {
        const metrics = ctx.measureText(text);
        const position = calculatePosition(metrics.width, parseInt(size));
        ctx.fillText(text, position.x, position.y);
    }
    
    ctx.restore();
}

// 添加图片水印
function addImageWatermark() {
    if (!watermarkImage) return;

    const size = watermarkSize.value / 100;
    const alpha = opacity.value / 100;
    
    const watermarkWidth = previewCanvas.width * size;
    const watermarkHeight = (watermarkImage.height / watermarkImage.width) * watermarkWidth;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    if (watermarkMode === 'tile') {
        // 使用分别设置的水平和垂直间距
        const spacingX = watermarkWidth * (tileSpacingX.value / 100);
        const spacingY = watermarkHeight * (tileSpacingY.value / 100);
        
        const rotation = (tileRotation.value * Math.PI) / 180;
        ctx.translate(previewCanvas.width/2, previewCanvas.height/2);
        ctx.rotate(rotation);
        ctx.translate(-previewCanvas.width/2, -previewCanvas.height/2);
        
        const diagonal = Math.sqrt(previewCanvas.width * previewCanvas.width + previewCanvas.height * previewCanvas.height);
        
        for (let y = -diagonal; y < diagonal; y += spacingY) {
            for (let x = -diagonal; x < diagonal; x += spacingX) {
                ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
            }
        }
    } else {
        const position = calculatePosition(watermarkWidth, watermarkHeight);
        ctx.drawImage(watermarkImage, position.x, position.y, watermarkWidth, watermarkHeight);
    }
    
    ctx.restore();
}

// 计算水印位置
function calculatePosition(width, height) {
    // 添加边距
    const padding = 20;
    
    const positions = {
        'top-left': { 
            x: padding, 
            y: padding 
        },
        'top-center': { 
            x: (previewCanvas.width - width) / 2, 
            y: padding 
        },
        'top-right': { 
            x: previewCanvas.width - width - padding, 
            y: padding 
        },
        'middle-left': { 
            x: padding, 
            y: (previewCanvas.height - height) / 2 
        },
        'middle-center': { 
            x: (previewCanvas.width - width) / 2, 
            y: (previewCanvas.height - height) / 2 
        },
        'middle-right': { 
            x: previewCanvas.width - width - padding, 
            y: (previewCanvas.height - height) / 2 
        },
        'bottom-left': { 
            x: padding, 
            y: previewCanvas.height - height - padding 
        },
        'bottom-center': { 
            x: (previewCanvas.width - width) / 2, 
            y: previewCanvas.height - height - padding 
        },
        'bottom-right': { 
            x: previewCanvas.width - width - padding, 
            y: previewCanvas.height - height - padding 
        }
    };

    return positions[selectedPosition];
}

// 下载图片
function downloadImage() {
    const link = document.createElement('a');
    const filename = `watermarked_image.${exportFormat}`;
    // 对于 jpg 格式，MIME 类型仍需使用 jpeg
    const mimeType = `image/${exportFormat === 'jpg' ? 'jpeg' : exportFormat}`;
    
    // 对于 JPG 格式，需要设置白色背景
    if (exportFormat === 'jpg') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = previewCanvas.width;
        tempCanvas.height = previewCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 填充白色背景
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 绘制当前画布内容
        tempCtx.drawImage(previewCanvas, 0, 0);
        
        // 使用最高质量导出
        link.href = tempCanvas.toDataURL(mimeType, 1.0);
    } else {
        // PNG 和 WebP 格式使用最高质量导出
        link.href = previewCanvas.toDataURL(mimeType, 1.0);
    }
    
    link.download = filename;
    link.click();
}

// 初始化
initEventListeners();