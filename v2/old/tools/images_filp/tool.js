// 全局变量
let currentImage = null;
let canvas = document.getElementById('previewCanvas');
let ctx = null;
let currentRotation = 0;  // 跟踪当前旋转角度
let isFlippedHorizontal = false;  // 跟踪水平翻转状态
let isFlippedVertical = false;    // 跟踪垂直翻转状态

// 初始化 canvas context
function initCanvas() {
    canvas = document.getElementById('previewCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
    }
}

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const deleteImageBtn = document.getElementById('deleteImageBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
const flipVerticalBtn = document.getElementById('flipVerticalBtn');
const rotateClockwiseBtn = document.getElementById('rotateClockwiseBtn');
const rotateCounterclockwiseBtn = document.getElementById('rotateCounterclockwiseBtn');
const resetBtn = document.getElementById('resetBtn');
const rotate180Btn = document.getElementById('rotate180Btn');

// 初始化事件监听
function initEventListeners() {
    initCanvas();

    // 点击上传
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        if (!uploadArea.contains(e.relatedTarget)) {
            uploadArea.classList.remove('drag-over');
        }
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 支持粘贴上传
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (items) {
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        handleFile(file);
                        showToast('已从剪贴板添加图片');
                        break;
                    }
                }
            }
        }
    });

    deleteImageBtn.addEventListener('click', deleteImage);

    // 翻转和旋转按钮
    flipHorizontalBtn.addEventListener('click', () => {
        flipImage('horizontal');
        downloadImageBtn.disabled = false;
    });
    flipVerticalBtn.addEventListener('click', () => {
        flipImage('vertical');
        downloadImageBtn.disabled = false;
    });
    rotateClockwiseBtn.addEventListener('click', () => {
        rotateImage(90);
        downloadImageBtn.disabled = false;
    });
    rotateCounterclockwiseBtn.addEventListener('click', () => {
        rotateImage(-90);
        downloadImageBtn.disabled = false;
    });

    // 快捷操作按钮
    resetBtn.addEventListener('click', () => {
        if (currentImage) {
            resetTransforms();
            displayImage();
            downloadImageBtn.disabled = false;
            showToast('已重置所有变换');
        }
    });

    rotate180Btn.addEventListener('click', () => {
        if (currentImage) {
            rotateImage(180);
            downloadImageBtn.disabled = false;
        }
    });

    // 下载按钮
    downloadImageBtn.addEventListener('click', downloadImage);
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 统一的文件处理函数
function handleFile(file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showToast('请选择有效的图片文件');
        return;
    }

    // 验证文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
        showToast('图片文件过大，请选择小于10MB的图片');
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        currentImage = new Image();
        currentImage.onload = () => {
            // 重置所有变换状态
            resetTransforms();
            displayImage();
            updateButtonStates(true);
            showToast('图片上传成功');
        };
        currentImage.onerror = () => {
            showToast('图片加载失败，请尝试其他图片');
        };
        currentImage.src = event.target.result;
    };

    reader.onerror = () => {
        showToast('文件读取失败，请重试');
    };

    reader.readAsDataURL(file);
}

// 显示图片
function displayImage(preserveTransforms = false) {
    initCanvas();

    if (!ctx) return;

    const container = document.querySelector('.preview-container');
    if (!container) return;

    // 先显示预览区域，这样才能获取正确的容器宽度
    previewSection.style.display = 'block';

    // 强制浏览器重新计算布局
    container.offsetHeight;

    const maxWidth = container.offsetWidth || container.clientWidth || 800;
    const maxHeight = window.innerHeight * 0.7;

    // 计算缩放比例
    let scale = 1;
    // 根据旋转角度选择合适的尺寸进行比较
    const rotated = currentRotation % 180 !== 0;
    const effectiveWidth = rotated ? currentImage.height : currentImage.width;
    const effectiveHeight = rotated ? currentImage.width : currentImage.height;

    if (effectiveWidth > maxWidth || effectiveHeight > maxHeight) {
        const scaleX = maxWidth / effectiveWidth;
        const scaleY = maxHeight / effectiveHeight;
        scale = Math.min(scaleX, scaleY);
    }

    scale = Math.max(scale, 0.1);

    // 设置画布大小
    canvas.width = Math.max(Math.floor(effectiveWidth * scale), 1);
    canvas.height = Math.max(Math.floor(effectiveHeight * scale), 1);

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 应用变换
    ctx.save();

    // 移动到画布中心
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // 应用旋转
    if (currentRotation !== 0) {
        ctx.rotate((currentRotation * Math.PI) / 180);
    }

    // 应用翻转
    ctx.scale(
        isFlippedHorizontal ? -1 : 1,
        isFlippedVertical ? -1 : 1
    );

    // 绘制图片
    const drawWidth = currentImage.width * scale;
    const drawHeight = currentImage.height * scale;
    ctx.drawImage(
        currentImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
    );

    ctx.restore();

    // 设置容器高度
    container.style.height = canvas.height + 'px';
}

// 下载图片
function downloadImage() {
    if (!currentImage) return;

    // 创建临时画布，使用原始图片尺寸
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // 设置临时画布为原始图片尺寸
    tempCanvas.width = currentImage.width;
    tempCanvas.height = currentImage.height;

    // 应用变换
    tempCtx.save();

    // 移动到画布中心
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);

    // 应用旋转
    if (currentRotation !== 0) {
        tempCtx.rotate((currentRotation * Math.PI) / 180);
    }

    // 应用翻转
    tempCtx.scale(
        isFlippedHorizontal ? -1 : 1,
        isFlippedVertical ? -1 : 1
    );

    // 绘制图片，使用原始尺寸
    tempCtx.drawImage(
        currentImage,
        -currentImage.width / 2,
        -currentImage.height / 2,
        currentImage.width,
        currentImage.height
    );

    tempCtx.restore();

    // 获取文件信息
    const fileName = fileInput.files[0]?.name || 'image.png';
    const fileExt = fileName.split('.').pop().toLowerCase();
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || 'image';

    // 生成操作描述
    let operations = [];
    if (isFlippedHorizontal) operations.push('h-flip');
    if (isFlippedVertical) operations.push('v-flip');
    if (currentRotation !== 0) operations.push(`rotate${currentRotation}`);

    const operationSuffix = operations.length > 0 ? `_${operations.join('_')}` : '_edited';

    // 根据原始图片格式选择适当的导出格式
    let mimeType = 'image/png';
    let quality = 0.95; // 高质量

    if (fileExt === 'jpg' || fileExt === 'jpeg') {
        mimeType = 'image/jpeg';
    } else if (fileExt === 'webp') {
        mimeType = 'image/webp';
    }

    // 创建下载链接
    const link = document.createElement('a');
    link.href = tempCanvas.toDataURL(mimeType, quality);
    link.download = `${baseName}${operationSuffix}.${fileExt}`;
    link.click();

    showToast('图片下载已开始');
}

// 翻转图片
function flipImage(direction) {
    if (!currentImage) return;

    if (direction === 'horizontal') {
        isFlippedHorizontal = !isFlippedHorizontal;
    } else if (direction === 'vertical') {
        isFlippedVertical = !isFlippedVertical;
    }

    displayImage(true);
}

// 旋转图片
function rotateImage(angle) {
    if (!currentImage) return;

    currentRotation = (currentRotation + angle) % 360;
    if (currentRotation < 0) {
        currentRotation += 360;
    }

    displayImage(true);
}

// 重置变换状态
function resetTransforms() {
    currentRotation = 0;
    isFlippedHorizontal = false;
    isFlippedVertical = false;
}

// 更新按钮状态
function updateButtonStates(enabled) {
    downloadImageBtn.disabled = !enabled;
    resetBtn.disabled = !enabled;
    rotate180Btn.disabled = !enabled;
}

// 删除图片
function deleteImage() {
    currentImage = null;
    resetTransforms();
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    previewSection.style.display = 'none';
    updateButtonStates(false);
    fileInput.value = ''; // 清空文件输入
    showToast('图片已删除');
}

// 显示提示消息
function showToast(message) {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    }, 100);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});
