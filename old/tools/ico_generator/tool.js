// DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewGrid = document.getElementById('previewGrid');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const cropImageBtn = document.getElementById('cropImageBtn');
const sizeGrid = document.getElementById('sizeGrid');
const quickSelect = document.getElementById('quickSelect');
const progressContainer = document.querySelector('.progress-container');
const progressFill = document.querySelector('.progress-fill');

// 圆角控制元素
const borderRadiusSlider = document.getElementById('borderRadiusSlider');
const radiusValue = document.getElementById('radiusValue');
const borderRadiusSection = document.getElementById('borderRadiusSection');

// 裁剪相关元素
const cropSection = document.getElementById('cropSection');
const cropCanvas = document.getElementById('cropCanvas');
const cropOverlay = document.getElementById('cropOverlay');
const cropSelection = document.getElementById('cropSelection');
const applyCropBtn = document.getElementById('applyCropBtn');
const cancelCropBtn = document.getElementById('cancelCropBtn');
const cropSquareBtn = document.getElementById('cropSquareBtn');
const resetCropBtn = document.getElementById('resetCropBtn');

// 状态变量
let uploadedFiles = [];
let convertedFiles = [];
let selectedPlatform = 'windows';
let borderRadius = 0;
let originalImage = null;
let croppedImage = null;
let cropData = null;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let cropStart = { x: 0, y: 0, width: 0, height: 0 };

// 平台对应的尺寸配置
const platformSizes = {
    windows: [
        { size: 16, label: '16×16', desc: '小图标' },
        { size: 32, label: '32×32', desc: '标准图标' },
        { size: 48, label: '48×48', desc: '大图标' },
        { size: 64, label: '64×64', desc: '超大图标' },
        { size: 128, label: '128×128', desc: '缩略图' },
        { size: 256, label: '256×256', desc: '高清图标' },
        { size: 512, label: '512×512', desc: '超高清' }
    ],
    macos: [
        { size: 16, label: '16×16', desc: '小图标' },
        { size: 32, label: '32×32', desc: '标准图标' },
        { size: 128, label: '128×128', desc: '大图标' },
        { size: 256, label: '256×256', desc: '高清图标' },
        { size: 512, label: '512×512', desc: 'Retina' },
        { size: 1024, label: '1024×1024', desc: 'Retina HD' }
    ],
    ios: [
        { size: 20, label: '20×20', desc: 'iPhone通知' },
        { size: 29, label: '29×29', desc: 'iPhone设置' },
        { size: 40, label: '40×40', desc: 'iPhone聚焦' },
        { size: 58, label: '58×58', desc: 'iPhone设置@2x' },
        { size: 60, label: '60×60', desc: 'iPhone应用' },
        { size: 76, label: '76×76', desc: 'iPad应用' },
        { size: 80, label: '80×80', desc: 'iPhone聚焦@2x' },
        { size: 87, label: '87×87', desc: 'iPhone设置@3x' },
        { size: 120, label: '120×120', desc: 'iPhone应用@2x' },
        { size: 152, label: '152×152', desc: 'iPad应用@2x' },
        { size: 167, label: '167×167', desc: 'iPad Pro' },
        { size: 180, label: '180×180', desc: 'iPhone应用@3x' },
        { size: 1024, label: '1024×1024', desc: 'App Store' }
    ],
    android: [
        { size: 36, label: '36×36', desc: 'LDPI' },
        { size: 48, label: '48×48', desc: 'MDPI' },
        { size: 72, label: '72×72', desc: 'HDPI' },
        { size: 96, label: '96×96', desc: 'XHDPI' },
        { size: 144, label: '144×144', desc: 'XXHDPI' },
        { size: 192, label: '192×192', desc: 'XXXHDPI' },
        { size: 512, label: '512×512', desc: 'Play Store' }
    ],
    favicon: [
        { size: 16, label: '16×16', desc: '浏览器标签' },
        { size: 32, label: '32×32', desc: '书签栏' },
        { size: 48, label: '48×48', desc: '桌面快捷方式' },
        { size: 64, label: '64×64', desc: '高清显示' },
        { size: 128, label: '128×128', desc: '兼容性' },
        { size: 256, label: '256×256', desc: '特殊用途' }
    ]
};

// 智能推荐配置
const recommendedSizes = {
    windows: {
        basic: [16, 32, 48, 256],
        complete: [16, 32, 48, 64, 128, 256, 512]
    },
    macos: {
        basic: [16, 32, 128, 256, 512],
        retina: [256, 512, 1024]
    },
    ios: {
        essential: [60, 76, 120, 152, 180, 1024],
        complete: [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024]
    },
    android: {
        basic: [48, 72, 96, 144, 192],
        complete: [36, 48, 72, 96, 144, 192, 512]
    },
    favicon: {
        basic: [16, 32, 48],
        complete: [16, 32, 48, 64, 128, 256]
    }
};

// 智能推荐按钮功能
function applyRecommendation(type) {
    const platform = document.querySelector('.platform-card.active').dataset.platform;
    const recommended = recommendedSizes[platform][type];

    if (!recommended) return;

    // 先取消所有选择
    document.querySelectorAll('.size-item input').forEach(checkbox => {
        checkbox.checked = false;
    });

    // 选中推荐的尺寸
    recommended.forEach(size => {
        const checkbox = document.querySelector(`.size-item input[value="${size}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // 如果已经有图片，自动生成预览
    if (originalImage) {
        autoGenerateIcons();
    }
}

// 全选/全不选功能
function toggleAllSizes(selectAll) {
    document.querySelectorAll('.size-item input').forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    
    // 如果已经有图片，自动生成预览
    if (originalImage) {
        autoGenerateIcons();
    }
}

// 获取智能默认选择
function getSmartDefaults(platform) {
    const defaults = {
        windows: recommendedSizes.windows.basic,
        macos: recommendedSizes.macos.basic,
        ios: recommendedSizes.ios.essential,
        android: recommendedSizes.android.basic,
        favicon: recommendedSizes.favicon.basic
    };
    return defaults[platform] || [];
}

// 初始化快速选择按钮
function updateQuickSelect() {
    const selectedPlatform = document.querySelector('.platform-card.active').dataset.platform;
    quickSelect.innerHTML = createRecommendButtons(selectedPlatform);
}

// 创建推荐按钮
function createRecommendButtons(platform) {
    const buttonConfigs = {
        windows: [
            { key: 'basic', label: '常用尺寸' },
            { key: 'complete', label: '完整套装' }
        ],
        macos: [
            { key: 'basic', label: '标准配置' },
            { key: 'retina', label: '高分辨率' }
        ],
        ios: [
            { key: 'essential', label: '必需尺寸' },
            { key: 'complete', label: '完整套装' }
        ],
        android: [
            { key: 'basic', label: '标准密度' },
            { key: 'complete', label: '全部密度' }
        ],
        favicon: [
            { key: 'basic', label: '基础尺寸' },
            { key: 'complete', label: '完整套装' }
        ]
    };

    const configs = buttonConfigs[platform] || [];

    return configs.map(config =>
        `<button type="button" class="quick-preset-btn" onclick="applyRecommendation('${config.key}')">${config.label}</button>`
    ).join('');
}

// 初始化尺寸选项
function updateSizeOptions() {
    const selectedPlatform = document.querySelector('.platform-card.active').dataset.platform;
    const sizes = platformSizes[selectedPlatform];
    const smartDefaults = getSmartDefaults(selectedPlatform);

    // 清空现有选项
    sizeGrid.innerHTML = '';

    // 创建尺寸选项
    const sizeOptions = sizes.map(({ size, label, desc }) => {
        const isRecommended = smartDefaults.includes(size);
        return `
            <div class="size-item">
                <input type="checkbox" value="${size}" ${isRecommended ? 'checked' : ''}>
                <div class="size-card">
                    <div class="size-label">${label}</div>
                    <div class="size-desc">${desc}</div>
                    ${isRecommended ? '<div class="size-recommended"></div>' : ''}
                </div>
            </div>
        `;
    }).join('');

    sizeGrid.innerHTML = sizeOptions;
    
    // 绑定点击事件
    document.querySelectorAll('.size-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const card = item.querySelector('.size-card');
        
        card.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            
            // 如果已经有图片，自动生成预览
            if (originalImage) {
                autoGenerateIcons();
            }
        });
    });
}

// 平台选择切换
document.querySelectorAll('.platform-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelector('.platform-card.active').classList.remove('active');
        card.classList.add('active');
        selectedPlatform = card.dataset.platform;
        updateQuickSelect();
        updateSizeOptions();
        updateBorderRadiusVisibility();
        
        // 如果已经有图片，自动生成预览
        if (originalImage) {
            autoGenerateIcons();
        }
    });
});

// 圆角控制
if (borderRadiusSlider) {
    borderRadiusSlider.addEventListener('input', (e) => {
        borderRadius = parseInt(e.target.value);
        radiusValue.textContent = borderRadius;
        updateRadiusPresets();
        
        // 如果已经有图片，自动生成预览
        if (originalImage) {
            autoGenerateIcons();
        }
    });
}

// 圆角预设按钮
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('radius-btn')) {
        const radius = parseInt(e.target.dataset.radius);
        borderRadius = radius;
        borderRadiusSlider.value = radius;
        radiusValue.textContent = radius;
        updateRadiusPresets();
        
        // 如果已经有图片，自动生成预览
        if (originalImage) {
            autoGenerateIcons();
        }
    }
});

// 更新圆角预设按钮状态
function updateRadiusPresets() {
    document.querySelectorAll('.radius-btn').forEach(btn => {
        const presetRadius = parseInt(btn.dataset.radius);
        btn.classList.toggle('active', presetRadius === borderRadius);
    });
}

// 更新圆角设置的可见性
function updateBorderRadiusVisibility() {
    if (!borderRadiusSection) return;

    // iOS和Android平台显示圆角设置，其他平台隐藏
    const showRadius = ['ios', 'android', 'favicon'].includes(selectedPlatform);
    borderRadiusSection.style.display = showRadius ? 'block' : 'none';

    // iOS平台默认设置为22%圆角
    if (selectedPlatform === 'ios' && borderRadius === 0) {
        borderRadius = 22;
        borderRadiusSlider.value = 22;
        radiusValue.textContent = 22;
        updateRadiusPresets();
    }
}

// 初始化
updateQuickSelect();
updateSizeOptions();
updateBorderRadiusVisibility();
updateRadiusPresets();

// 上传区域拖拽处理
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
    handleFiles(e.dataTransfer.files);
});

// 点击上传
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// 处理上传的文件
function handleFiles(files) {
    uploadedFiles = [];
    previewGrid.innerHTML = '';
    convertBtn.disabled = true;
    cropImageBtn.disabled = true;
    downloadBtn.style.display = 'none';
    cropSection.style.display = 'none';

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            uploadedFiles.push({
                file: file,
                name: file.name
            });

            // 创建预览
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    originalImage = img;
                    croppedImage = null;

                    // 显示原始图片预览
                    showImagePreview(img);

                    convertBtn.disabled = false;
                    cropImageBtn.disabled = false;
                    
                    // 自动生成图标预览
                    setTimeout(() => {
                        autoGenerateIcons();
                    }, 100);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// 显示图片预览
function showImagePreview(img) {
    previewGrid.innerHTML = '';

    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item original-preview';

    const canvas = document.createElement('canvas');
    const maxSize = 300;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 创建预览图像容器
    const previewImage = document.createElement('div');
    previewImage.className = 'preview-image';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '8px';
    previewImage.appendChild(canvas);

    // 创建信息容器
    const previewInfo = document.createElement('div');
    previewInfo.className = 'preview-info';
    previewInfo.innerHTML = `
        <div class="file-name">原始图片</div>
        <div class="info-row">
            <span>尺寸</span>
            <span>${img.width}×${img.height}px</span>
        </div>
        <div class="info-row">
            <span>比例</span>
            <span>${(img.width / img.height).toFixed(2)}:1</span>
        </div>
        <div class="info-row">
            <span>格式</span>
            <span>原始图片</span>
        </div>
    `;

    previewItem.appendChild(previewImage);
    previewItem.appendChild(previewInfo);
    previewGrid.appendChild(previewItem);
}

// 裁剪功能
if (cropImageBtn) {
    cropImageBtn.addEventListener('click', () => {
        if (!originalImage) return;
        showCropInterface();
    });
}

// 显示裁剪界面
function showCropInterface() {
    cropSection.style.display = 'block';

    // 设置画布
    const maxWidth = cropSection.offsetWidth - 40;
    const maxHeight = 400;
    const scale = Math.min(maxWidth / originalImage.width, maxHeight / originalImage.height);

    cropCanvas.width = originalImage.width * scale;
    cropCanvas.height = originalImage.height * scale;

    const ctx = cropCanvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, cropCanvas.width, cropCanvas.height);

    // 初始化裁剪选择区域 - 默认覆盖整个图片的最大正方形
    const size = Math.min(cropCanvas.width, cropCanvas.height);
    const x = (cropCanvas.width - size) / 2;
    const y = (cropCanvas.height - size) / 2;

    cropData = { x, y, width: size, height: size, scale };
    updateCropSelection();

    // 绑定裁剪事件
    bindCropEvents();
}

// 更新裁剪选择区域
function updateCropSelection() {
    if (!cropData || !cropSelection) return;

    cropSelection.style.left = cropData.x + 'px';
    cropSelection.style.top = cropData.y + 'px';
    cropSelection.style.width = cropData.width + 'px';
    cropSelection.style.height = cropData.height + 'px';
}

// 绑定裁剪事件
function bindCropEvents() {
    let isResizing = false;
    let resizeHandle = null;

    // 拖拽移动
    if (cropSelection) {
        cropSelection.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('crop-handle')) {
                isResizing = true;
                resizeHandle = e.target;
            } else {
                isDragging = true;
            }

            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            cropStart = { ...cropData };

            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging && !isResizing) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        if (isDragging) {
            // 移动裁剪区域
            cropData.x = Math.max(0, Math.min(cropCanvas.width - cropData.width, cropStart.x + deltaX));
            cropData.y = Math.max(0, Math.min(cropCanvas.height - cropData.height, cropStart.y + deltaY));
        } else if (isResizing) {
            // 调整裁剪区域大小
            resizeCropArea(resizeHandle, deltaX, deltaY);
        }

        updateCropSelection();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    });
}

// 调整裁剪区域大小 - 保持正方形
function resizeCropArea(handle, deltaX, deltaY) {
    const minSize = 50;
    const maxX = cropCanvas.width;
    const maxY = cropCanvas.height;

    if (handle.classList.contains('crop-handle-se')) {
        // 右下角 - 取较大的变化量来保持正方形
        const delta = Math.max(deltaX, deltaY);
        const newSize = Math.max(minSize, cropStart.width + delta);
        
        // 确保不超出边界
        const maxSize = Math.min(maxX - cropData.x, maxY - cropData.y);
        cropData.width = cropData.height = Math.min(newSize, maxSize);
        
    } else if (handle.classList.contains('crop-handle-sw')) {
        // 左下角 - 向左下拖拽，保持正方形
        const delta = Math.max(-deltaX, deltaY);
        const newSize = Math.max(minSize, cropStart.width + delta);
        const newX = cropStart.x - delta;
        
        // 边界检查
        if (newX >= 0 && newSize >= minSize) {
            const maxSize = Math.min(cropStart.x + cropStart.width, maxY - cropData.y);
            const finalSize = Math.min(newSize, maxSize);
            cropData.x = cropStart.x + cropStart.width - finalSize;
            cropData.width = cropData.height = finalSize;
        }
        
    } else if (handle.classList.contains('crop-handle-ne')) {
        // 右上角 - 向右上拖拽，保持正方形
        const delta = Math.max(deltaX, -deltaY);
        const newSize = Math.max(minSize, cropStart.width + delta);
        const newY = cropStart.y - delta;
        
        // 边界检查
        if (newY >= 0 && newSize >= minSize) {
            const maxSize = Math.min(maxX - cropData.x, cropStart.y + cropStart.height);
            const finalSize = Math.min(newSize, maxSize);
            cropData.y = cropStart.y + cropStart.height - finalSize;
            cropData.width = cropData.height = finalSize;
        }
        
    } else if (handle.classList.contains('crop-handle-nw')) {
        // 左上角 - 向左上拖拽，保持正方形
        const delta = Math.max(-deltaX, -deltaY);
        const newSize = Math.max(minSize, cropStart.width + delta);
        const newX = cropStart.x - delta;
        const newY = cropStart.y - delta;
        
        // 边界检查
        if (newX >= 0 && newY >= 0 && newSize >= minSize) {
            const maxSize = Math.min(cropStart.x + cropStart.width, cropStart.y + cropStart.height);
            const finalSize = Math.min(newSize, maxSize);
            cropData.x = cropStart.x + cropStart.width - finalSize;
            cropData.y = cropStart.y + cropStart.height - finalSize;
            cropData.width = cropData.height = finalSize;
        }
    }
}

// 裁剪为正方形
if (cropSquareBtn) {
    cropSquareBtn.addEventListener('click', () => {
        if (!cropData) return;

        const size = Math.min(cropData.width, cropData.height);
        const centerX = cropData.x + cropData.width / 2;
        const centerY = cropData.y + cropData.height / 2;

        cropData.x = Math.max(0, Math.min(cropCanvas.width - size, centerX - size / 2));
        cropData.y = Math.max(0, Math.min(cropCanvas.height - size, centerY - size / 2));
        cropData.width = size;
        cropData.height = size;

        updateCropSelection();
    });
}

// 重置裁剪
if (resetCropBtn) {
    resetCropBtn.addEventListener('click', () => {
        if (!originalImage) return;

        // 重置为覆盖整个图片的最大正方形
        const size = Math.min(cropCanvas.width, cropCanvas.height);
        const x = (cropCanvas.width - size) / 2;
        const y = (cropCanvas.height - size) / 2;

        cropData = { x, y, width: size, height: size, scale: cropData.scale };
        updateCropSelection();
    });
}

// 应用裁剪
if (applyCropBtn) {
    applyCropBtn.addEventListener('click', () => {
        if (!cropData || !originalImage) return;

        // 创建裁剪后的图片
        const canvas = document.createElement('canvas');
        const sourceX = cropData.x / cropData.scale;
        const sourceY = cropData.y / cropData.scale;
        const sourceWidth = cropData.width / cropData.scale;
        const sourceHeight = cropData.height / cropData.scale;

        canvas.width = sourceWidth;
        canvas.height = sourceHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

        // 创建裁剪后的图片对象
        croppedImage = new Image();
        croppedImage.onload = () => {
            showImagePreview(croppedImage);
            cropSection.style.display = 'none';
        };
        croppedImage.src = canvas.toDataURL();
    });
}

// 取消裁剪
if (cancelCropBtn) {
    cancelCropBtn.addEventListener('click', () => {
        cropSection.style.display = 'none';
    });
}

// 生成指定尺寸的图标
function generateIcon(sourceImage, targetSize) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');

            // 优化图像渲染设置
            ctx.imageSmoothingEnabled = targetSize > 64;
            if (ctx.imageSmoothingEnabled) {
                ctx.imageSmoothingQuality = 'high';
            }

            // 清除画布
            ctx.clearRect(0, 0, targetSize, targetSize);

            // 如果有圆角设置，先绘制圆角蒙版
            if (borderRadius > 0 && ['ios', 'android', 'favicon'].includes(selectedPlatform)) {
                drawRoundedRect(ctx, 0, 0, targetSize, targetSize, (targetSize * borderRadius) / 100);
                ctx.clip();
            }

            // 计算缩放和位置，确保图像完全适配正方形
            const sourceSize = Math.min(sourceImage.width, sourceImage.height);
            const sourceX = (sourceImage.width - sourceSize) / 2;
            const sourceY = (sourceImage.height - sourceSize) / 2;

            // 绘制图像
            ctx.drawImage(
                sourceImage,
                sourceX, sourceY, sourceSize, sourceSize,
                0, 0, targetSize, targetSize
            );

            // 根据平台类型生成不同格式
            generatePlatformBlob(canvas, targetSize).then(resolve).catch(reject);
        } catch (error) {
            reject(error);
        }
    });
}

// 绘制圆角矩形
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 根据平台生成对应格式的Blob
function generatePlatformBlob(canvas, size) {
    return new Promise((resolve) => {
        // 检查用户选择的格式
        const formatIcon = document.getElementById('formatIcon');
        
        const useIconFormat = formatIcon && formatIcon.checked;
        
        // 如果是Windows、macOS或Favicon平台，根据用户选择决定格式
        if ((selectedPlatform === 'windows' || selectedPlatform === 'favicon') && useIconFormat) {
            generateICOBlob(canvas, size).then(resolve);
        } else if (selectedPlatform === 'macos' && useIconFormat) {
            generateICNSBlob(canvas, size).then(resolve);
        } else {
            // 默认生成PNG格式
            canvas.toBlob(resolve, 'image/png', 1.0);
        }
    });
}

// 生成图标格式（ICO/ICNS）
function generateIconFormat(sourceImage, targetSize) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');

            // 优化图像渲染设置
            ctx.imageSmoothingEnabled = targetSize > 64;
            if (ctx.imageSmoothingEnabled) {
                ctx.imageSmoothingQuality = 'high';
            }

            // 清除画布
            ctx.clearRect(0, 0, targetSize, targetSize);

            // 如果有圆角设置，先绘制圆角蒙版
            if (borderRadius > 0 && ['ios', 'android', 'favicon'].includes(selectedPlatform)) {
                drawRoundedRect(ctx, 0, 0, targetSize, targetSize, (targetSize * borderRadius) / 100);
                ctx.clip();
            }

            // 计算缩放和位置，确保图像完全适配正方形
            const sourceSize = Math.min(sourceImage.width, sourceImage.height);
            const sourceX = (sourceImage.width - sourceSize) / 2;
            const sourceY = (sourceImage.height - sourceSize) / 2;

            // 绘制图像
            ctx.drawImage(
                sourceImage,
                sourceX, sourceY, sourceSize, sourceSize,
                0, 0, targetSize, targetSize
            );

            // 根据平台生成对应的图标格式
            if (selectedPlatform === 'windows' || selectedPlatform === 'favicon') {
                generateICOBlob(canvas, targetSize).then(resolve).catch(reject);
            } else if (selectedPlatform === 'macos') {
                generateICNSBlob(canvas, targetSize).then(resolve).catch(reject);
            } else {
                // iOS和Android平台生成PNG
                canvas.toBlob(resolve, 'image/png', 1.0);
            }
        } catch (error) {
            reject(error);
        }
    });
}

// 生成PNG格式
function generatePNGFormat(sourceImage, targetSize) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');

            // 优化图像渲染设置
            ctx.imageSmoothingEnabled = targetSize > 64;
            if (ctx.imageSmoothingEnabled) {
                ctx.imageSmoothingQuality = 'high';
            }

            // 清除画布
            ctx.clearRect(0, 0, targetSize, targetSize);

            // 如果有圆角设置，先绘制圆角蒙版
            if (borderRadius > 0 && ['ios', 'android', 'favicon'].includes(selectedPlatform)) {
                drawRoundedRect(ctx, 0, 0, targetSize, targetSize, (targetSize * borderRadius) / 100);
                ctx.clip();
            }

            // 计算缩放和位置，确保图像完全适配正方形
            const sourceSize = Math.min(sourceImage.width, sourceImage.height);
            const sourceX = (sourceImage.width - sourceSize) / 2;
            const sourceY = (sourceImage.height - sourceSize) / 2;

            // 绘制图像
            ctx.drawImage(
                sourceImage,
                sourceX, sourceY, sourceSize, sourceSize,
                0, 0, targetSize, targetSize
            );

            // 生成PNG格式
            canvas.toBlob(resolve, 'image/png', 1.0);
        } catch (error) {
            reject(error);
        }
    });
}

// 生成真正的ICO格式文件
function generateICOBlob(canvas, size) {
    return new Promise((resolve) => {
        canvas.toBlob((pngBlob) => {
            const reader = new FileReader();
            reader.onload = () => {
                const pngData = new Uint8Array(reader.result);
                const icoData = createICOFile([{
                    size: size,
                    data: pngData
                }]);
                resolve(new Blob([icoData], { type: 'image/x-icon' }));
            };
            reader.readAsArrayBuffer(pngBlob);
        }, 'image/png', 1.0);
    });
}

// 生成真正的ICNS格式文件
function generateICNSBlob(canvas, size) {
    return new Promise((resolve) => {
        canvas.toBlob((pngBlob) => {
            const reader = new FileReader();
            reader.onload = () => {
                const pngData = new Uint8Array(reader.result);
                const icnsData = createICNSFile([{
                    size: size,
                    data: pngData
                }]);
                resolve(new Blob([icnsData], { type: 'image/icns' }));
            };
            reader.readAsArrayBuffer(pngBlob);
        }, 'image/png', 1.0);
    });
}

// 创建ICO文件格式
function createICOFile(images) {
    const headerSize = 6;
    const dirEntrySize = 16;
    const totalDirSize = headerSize + (images.length * dirEntrySize);

    let totalSize = totalDirSize;
    images.forEach(img => totalSize += img.data.length);

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const uint8View = new Uint8Array(buffer);

    // ICO文件头
    view.setUint16(0, 0, true);      // 保留字段
    view.setUint16(2, 1, true);      // 图像类型 (1 = ICO)
    view.setUint16(4, images.length, true); // 图像数量

    let offset = totalDirSize;

    // 目录条目
    images.forEach((img, index) => {
        const entryOffset = headerSize + (index * dirEntrySize);
        const size = img.size >= 256 ? 0 : img.size; // ICO格式中256及以上以0表示

        view.setUint8(entryOffset + 0, size);        // 宽度
        view.setUint8(entryOffset + 1, size);        // 高度
        view.setUint8(entryOffset + 2, 0);           // 颜色数量
        view.setUint8(entryOffset + 3, 0);           // 保留字段
        view.setUint16(entryOffset + 4, 1, true);    // 颜色平面数
        view.setUint16(entryOffset + 6, 32, true);   // 每像素位数
        view.setUint32(entryOffset + 8, img.data.length, true); // 图像数据大小
        view.setUint32(entryOffset + 12, offset, true);         // 图像数据偏移

        // 复制图像数据
        uint8View.set(img.data, offset);
        offset += img.data.length;
    });

    return uint8View;
}

// 创建ICNS文件格式
function createICNSFile(images) {
    // ICNS文件头：'icns' + 文件大小
    const headerSize = 8;

    // 计算总大小
    let totalSize = headerSize;
    const entries = [];

    images.forEach(img => {
        // 根据尺寸确定ICNS类型标识符
        const typeId = getICNSTypeId(img.size);
        if (typeId) {
            const entrySize = 8 + img.data.length; // 8字节头 + 数据
            entries.push({
                typeId: typeId,
                size: entrySize,
                data: img.data
            });
            totalSize += entrySize;
        }
    });

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const uint8View = new Uint8Array(buffer);

    // 写入ICNS文件头
    const icnsSignature = new TextEncoder().encode('icns');
    uint8View.set(icnsSignature, 0);
    view.setUint32(4, totalSize, false); // 大端序

    let offset = headerSize;

    // 写入每个图标条目
    entries.forEach(entry => {
        // 写入条目头
        const typeBytes = new TextEncoder().encode(entry.typeId);
        uint8View.set(typeBytes, offset);
        view.setUint32(offset + 4, entry.size, false); // 大端序

        // 写入图像数据
        uint8View.set(entry.data, offset + 8);
        offset += entry.size;
    });

    return uint8View;
}

// 获取ICNS类型标识符
function getICNSTypeId(size) {
    const typeMap = {
        16: 'icp4',    // 16x16 PNG
        32: 'icp5',    // 32x32 PNG  
        64: 'icp6',    // 64x64 PNG
        128: 'ic07',   // 128x128 PNG
        256: 'ic08',   // 256x256 PNG
        512: 'ic09',   // 512x512 PNG
        1024: 'ic10'   // 1024x1024 PNG
    };
    return typeMap[size];
}

// 当前平台是否支持图标容器格式（ICO/ICNS）
function isIconContainerPlatform(platform) {
    return ['windows', 'macos', 'favicon'].includes(platform);
}

// 获取图标容器扩展名
function getIconExtensionByPlatform(platform) {
    if (platform === 'macos') return 'icns';
    if (platform === 'windows' || platform === 'favicon') return 'ico';
    return 'png';
}

// 读取Blob为Uint8Array
function readBlobAsUint8Array(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = () => reject(new Error('读取图像数据失败'));
        reader.readAsArrayBuffer(blob);
    });
}

// 生成单文件多尺寸图标（ICO/ICNS）
async function generateMultiSizeIconBlob(sourceImage, sizes, platform) {
    const uniqueSizes = [...new Set(sizes)]
        .filter(size => Number.isInteger(size) && size > 0)
        .sort((a, b) => a - b);

    const images = [];
    for (const size of uniqueSizes) {
        if (platform === 'macos' && !getICNSTypeId(size)) continue;
        const pngBlob = await generatePNGFormat(sourceImage, size);
        const pngData = await readBlobAsUint8Array(pngBlob);
        images.push({ size, data: pngData });
    }

    if (images.length === 0) {
        throw new Error('没有可用于生成图标容器的尺寸');
    }

    if (platform === 'macos') {
        const icnsData = createICNSFile(images);
        return new Blob([icnsData], { type: 'image/icns' });
    }

    const icoData = createICOFile(images);
    return new Blob([icoData], { type: 'image/x-icon' });
}

// 开始生成图标
convertBtn.addEventListener('click', async () => {
    if (!originalImage) return;

    convertBtn.disabled = true;
    downloadBtn.style.display = 'none';
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    convertedFiles = [];

    // 获取选中的尺寸
    const selectedSizes = Array.from(document.querySelectorAll('.size-item input:checked'))
        .map(cb => parseInt(cb.value))
        .sort((a, b) => a - b);

    if (selectedSizes.length === 0) {
        alert('请至少选择一个图标尺寸');
        convertBtn.disabled = false;
        progressContainer.style.display = 'none';
        return;
    }

    // 检查用户选择的格式
    const formatIcon = document.getElementById('formatIcon');
    const formatPng = document.getElementById('formatPng');
    
    const useIconFormat = formatIcon && formatIcon.checked;
    const usePngFormat = formatPng && formatPng.checked;
    
    // 如果没有选择任何格式，默认选择图标格式
    if (!useIconFormat && !usePngFormat) {
        if (formatIcon) formatIcon.checked = true;
    }

    // 计算总步数（尺寸数 × 格式数）
    let formatCount = 0;
    if (useIconFormat) formatCount++;
    if (usePngFormat) formatCount++;
    if (formatCount === 0) formatCount = 1; // 默认至少一种格式

    const totalSteps = selectedSizes.length * formatCount;
    let currentStep = 0;

    // 使用裁剪后的图片或原始图片
    const sourceImage = croppedImage || originalImage;

    try {
        // 清空预览区域，准备显示生成的图标
        previewGrid.innerHTML = '';

        for (const size of selectedSizes) {
            // 如果选择了图标格式，生成图标格式
            if (useIconFormat || (!useIconFormat && !usePngFormat)) {
                const iconBlob = await generateIconFormat(sourceImage, size);
                const extension = isIconContainerPlatform(selectedPlatform)
                    ? getIconExtensionByPlatform(selectedPlatform)
                    : 'png';
                
                convertedFiles.push({
                    blob: iconBlob,
                    size: size,
                    name: getFileName(size, extension),
                    platform: selectedPlatform,
                    format: extension
                });

                // 创建预览图
                const previewItem = await createIconPreview(sourceImage, size, convertedFiles.length - 1, iconBlob.size);
                previewGrid.appendChild(previewItem);

                currentStep++;
                progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
            }

            // 如果选择了PNG格式，生成PNG格式
            if (usePngFormat) {
                const pngBlob = await generatePNGFormat(sourceImage, size);
                
                convertedFiles.push({
                    blob: pngBlob,
                    size: size,
                    name: getFileName(size, 'png'),
                    platform: selectedPlatform,
                    format: 'png'
                });

                // 创建预览图
                const previewItem = await createIconPreview(sourceImage, size, convertedFiles.length - 1, pngBlob.size);
                previewGrid.appendChild(previewItem);

                currentStep++;
                progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
            }
        }

        convertBtn.disabled = false;
        progressContainer.style.display = 'none';

        if (convertedFiles.length > 0) {
            downloadBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('生成图标时出错:', error);
        alert('生成图标时出错，请重试');
        convertBtn.disabled = false;
        progressContainer.style.display = 'none';
    }
});

// 获取文件扩展名
function getFileExtension(platform) {
    // 检查用户选择的格式
    const formatIcon = document.getElementById('formatIcon');
    
    const useIconFormat = formatIcon && formatIcon.checked;
    
    // 如果是图标容器平台，根据用户选择决定扩展名
    if (isIconContainerPlatform(platform) && useIconFormat) {
        return getIconExtensionByPlatform(platform);
    } else {
        // 默认返回PNG
        return 'png';
    }
}

// 获取文件名
function getFileName(size, extension) {
    const platformNames = {
        windows: 'icon',
        macos: 'icon',
        ios: 'AppIcon',
        android: 'ic_launcher',
        favicon: 'favicon'
    };

    const baseName = platformNames[selectedPlatform] || 'icon';

    if (selectedPlatform === 'favicon' && size <= 32 && extension !== 'png') {
        return `favicon.${extension}`;
    }

    return `${baseName}_${size}x${size}.${extension}`;
}

// 获取多尺寸图标文件名
function getMultiSizeIconFileName(extension) {
    if (selectedPlatform === 'favicon') {
        return `favicon.${extension}`;
    }
    return `icon_multi.${extension}`;
}

// 创建图标预览
async function createIconPreview(sourceImage, size, index, blobSize) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';

    const previewImage = document.createElement('div');
    previewImage.className = 'preview-image';

    // 创建预览画布
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 优化图像渲染设置
    ctx.imageSmoothingEnabled = size > 64;
    if (ctx.imageSmoothingEnabled) {
        ctx.imageSmoothingQuality = 'high';
    }

    // 清除画布
    ctx.clearRect(0, 0, size, size);

    // 如果有圆角设置，先绘制圆角蒙版
    if (borderRadius > 0 && ['ios', 'android', 'favicon'].includes(selectedPlatform)) {
        drawRoundedRect(ctx, 0, 0, size, size, (size * borderRadius) / 100);
        ctx.clip();
    }

    // 计算缩放和位置
    const sourceSize = Math.min(sourceImage.width, sourceImage.height);
    const sourceX = (sourceImage.width - sourceSize) / 2;
    const sourceY = (sourceImage.height - sourceSize) / 2;

    // 绘制图像
    ctx.drawImage(
        sourceImage,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, size, size
    );

    // 根据尺寸调整显示大小
    const displaySize = Math.min(size, 128);
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';

    // 如果是iOS平台，添加预览圆角效果
    if (selectedPlatform === 'ios' && borderRadius > 0) {
        canvas.style.borderRadius = `${borderRadius}%`;
        canvas.style.overflow = 'hidden';
    }

    previewImage.appendChild(canvas);
    previewItem.appendChild(previewImage);

    // 获取平台信息
    const platformInfo = getPlatformInfo(selectedPlatform);
    const fileInfo = convertedFiles[index];
    const extension = (fileInfo && fileInfo.format) ? fileInfo.format : getFileExtension(selectedPlatform);

    // 添加尺寸和文件信息
    const previewInfo = document.createElement('div');
    previewInfo.className = 'preview-info';
    previewInfo.innerHTML = `
        <div class="file-name">${size}×${size}</div>
        <div class="info-row">
            <span>平台</span>
            <span>${platformInfo}</span>
        </div>
        <div class="info-row">
            <span>格式</span>
            <span>${extension.toUpperCase()}</span>
        </div>
        <div class="info-row">
            <span>大小</span>
            <span>${formatFileSize(blobSize)}</span>
        </div>
        <button class="btn" onclick="downloadIcon(${index})">下载</button>
    `;
    previewItem.appendChild(previewInfo);

    return previewItem;
}

// 获取平台信息
function getPlatformInfo(platform) {
    const platformNames = {
        windows: 'Windows',
        macos: 'macOS',
        ios: 'iOS',
        android: 'Android',
        favicon: 'Web Favicon'
    };
    return platformNames[platform] || platform;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 下载单个图标
window.downloadIcon = async function (index) {
    const previewFile = convertedFiles[index];
    if (!previewFile) return;

    const sourceImage = croppedImage || originalImage;
    const size = previewFile.size;
    
    // 检查用户选择的格式
    const formatIcon = document.getElementById('formatIcon');
    const formatPng = document.getElementById('formatPng');
    
    const useIconFormat = formatIcon && formatIcon.checked;
    const usePngFormat = formatPng && formatPng.checked;
    
    // 确定要下载的格式
    const formatsToDownload = [];
    
    if (useIconFormat && isIconContainerPlatform(selectedPlatform)) {
        formatsToDownload.push(getIconExtensionByPlatform(selectedPlatform));
    }
    
    if (usePngFormat) {
        formatsToDownload.push('png');
    }
    
    // 如果没有选择任何格式，使用默认格式
    if (formatsToDownload.length === 0) {
        if (isIconContainerPlatform(selectedPlatform)) {
            formatsToDownload.push(getIconExtensionByPlatform(selectedPlatform));
        } else {
            formatsToDownload.push('png');
        }
    }
    
    // 读取当前已选择尺寸，用于生成多尺寸图标容器
    const selectedSizes = Array.from(document.querySelectorAll('.size-item input:checked'))
        .map(cb => parseInt(cb.value))
        .sort((a, b) => a - b);

    // 生成并下载每种格式
    for (const format of formatsToDownload) {
        let blob;
        let downloadName = getFileName(size, format);
        
        if (format === 'png') {
            // 如果是PNG格式，可以直接使用预览的blob或重新生成
            blob = await generatePNGFormat(sourceImage, size);
        } else if ((format === 'ico' || format === 'icns') && selectedSizes.length > 1) {
            blob = await generateMultiSizeIconBlob(sourceImage, selectedSizes, selectedPlatform);
            downloadName = getMultiSizeIconFileName(format);
        } else if (format === 'ico' || format === 'icns') {
            blob = await generateIconFormat(sourceImage, size);
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// 批量下载
downloadBtn.addEventListener('click', async () => {
    // 获取选中的尺寸
    const selectedSizes = Array.from(document.querySelectorAll('.size-item input:checked'))
        .map(cb => parseInt(cb.value))
        .sort((a, b) => a - b);

    if (selectedSizes.length === 0) {
        alert('请至少选择一个图标尺寸');
        return;
    }

    // 检查用户选择的格式
    const formatIcon = document.getElementById('formatIcon');
    const formatPng = document.getElementById('formatPng');
    
    const useIconFormat = formatIcon && formatIcon.checked;
    const usePngFormat = formatPng && formatPng.checked;
    
    // 确定要下载的格式
    const formatsToDownload = [];
    
    if (useIconFormat && isIconContainerPlatform(selectedPlatform)) {
        formatsToDownload.push(getIconExtensionByPlatform(selectedPlatform));
    }
    
    if (usePngFormat) {
        formatsToDownload.push('png');
    }
    
    // 如果没有选择任何格式，使用默认格式
    if (formatsToDownload.length === 0) {
        if (isIconContainerPlatform(selectedPlatform)) {
            formatsToDownload.push(getIconExtensionByPlatform(selectedPlatform));
        } else {
            formatsToDownload.push('png');
        }
    }

    const sourceImage = croppedImage || originalImage;
    const zip = new JSZip();
    const platformFolder = getPlatformInfo(selectedPlatform);

    // 显示进度
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    
    const totalFiles = formatsToDownload.reduce((count, format) => {
        if ((format === 'ico' || format === 'icns') && selectedSizes.length > 1 && isIconContainerPlatform(selectedPlatform)) {
            return count + 1;
        }
        return count + selectedSizes.length;
    }, 0);
    let currentFile = 0;

    try {
        const exportedFiles = [];

        // 为每个格式生成文件
        for (const format of formatsToDownload) {
            if ((format === 'ico' || format === 'icns') && selectedSizes.length > 1 && isIconContainerPlatform(selectedPlatform)) {
                const blob = await generateMultiSizeIconBlob(sourceImage, selectedSizes, selectedPlatform);
                const fileName = getMultiSizeIconFileName(format);
                zip.file(fileName, blob);
                exportedFiles.push({
                    name: fileName,
                    format,
                    combined: true,
                    sizes: [...selectedSizes]
                });

                currentFile++;
                progressFill.style.width = `${(currentFile / totalFiles) * 100}%`;
                continue;
            }

            for (const size of selectedSizes) {
                let blob;
                
                if (format === 'png') {
                    blob = await generatePNGFormat(sourceImage, size);
                } else if (format === 'ico' || format === 'icns') {
                    blob = await generateIconFormat(sourceImage, size);
                }
                
                const fileName = getFileName(size, format);
                
                // 为不同平台创建不同的文件夹结构
                let filePath = fileName;
                if (selectedPlatform === 'android') {
                    const density = getAndroidDensity(size);
                    filePath = `${density}/${fileName}`;
                } else if (selectedPlatform === 'ios') {
                    const category = getIOSCategory(size);
                    filePath = `${category}/${fileName}`;
                }

                zip.file(filePath, blob);
                exportedFiles.push({
                    name: filePath,
                    size,
                    format
                });
                
                // 更新进度
                currentFile++;
                progressFill.style.width = `${(currentFile / totalFiles) * 100}%`;
            }
        }

        // 添加说明文件
        const readme = generateReadme(exportedFiles);
        zip.file('README.md', readme);

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${platformFolder}_Icons.zip`;
        a.click();
        URL.revokeObjectURL(url);
        
        progressContainer.style.display = 'none';
    } catch (error) {
        console.error('批量下载时出错:', error);
        alert('批量下载时出错，请重试');
        progressContainer.style.display = 'none';
    }
});

// 获取Android密度文件夹名
function getAndroidDensity(size) {
    const densityMap = {
        36: 'drawable-ldpi',
        48: 'drawable-mdpi',
        72: 'drawable-hdpi',
        96: 'drawable-xhdpi',
        144: 'drawable-xxhdpi',
        192: 'drawable-xxxhdpi',
        512: 'play-store'
    };
    return densityMap[size] || 'drawable';
}

// 获取iOS分类
function getIOSCategory(size) {
    if (size >= 1024) return 'app-store';
    if (size >= 152) return 'ipad';
    if (size >= 60) return 'iphone';
    return 'settings';
}

// 生成说明文件
function generateReadme(exportedFiles = convertedFiles) {
    const platform = getPlatformInfo(selectedPlatform);
    const date = new Date().toLocaleDateString();
    const hasCombinedIcon = exportedFiles.some(file => file && file.combined);

    let content = `# ${platform} 图标包\n\n`;
    content += `生成日期: ${date}\n`;
    content += `平台: ${platform}\n`;
    content += `图标数量: ${exportedFiles.length}\n\n`;

    if (borderRadius > 0) {
        content += `圆角设置: ${borderRadius}%\n\n`;
    }

    content += `## 图标列表\n\n`;
    exportedFiles.forEach(file => {
        if (!file) return;
        if (file.combined && Array.isArray(file.sizes)) {
            content += `- ${file.name} (多尺寸: ${file.sizes.join('、')}px)\n`;
            return;
        }
        if (typeof file.size === 'number') {
            content += `- ${file.name} (${file.size}×${file.size}px)\n`;
            return;
        }
        content += `- ${file.name}\n`;
    });

    content += `\n## 使用说明\n\n`;

    switch (selectedPlatform) {
        case 'windows':
            content += hasCombinedIcon
                ? `推荐使用单文件多尺寸ICO作为应用主图标，兼容任务栏、开始菜单和资源管理器。\n`
                : `将ICO文件放置在应用程序目录中，并在项目设置中指定图标路径。\n`;
            break;
        case 'macos':
            content += hasCombinedIcon
                ? `将单文件多尺寸ICNS添加到应用程序包的Resources文件夹，并在Info.plist中设置CFBundleIconFile。\n`
                : `将ICNS文件添加到应用程序包的Resources文件夹中，并在Info.plist中设置CFBundleIconFile。\n`;
            break;
        case 'ios':
            content += `将PNG文件添加到Xcode项目中，系统会自动根据文件名选择合适的图标。\n`;
            break;
        case 'android':
            content += `将PNG文件放置在对应的drawable文件夹中，Android系统会根据设备密度自动选择。\n`;
            break;
        case 'favicon':
            content += `将favicon.ico放在网站根目录，其他尺寸的PNG文件可用于移动端主屏图标。\n`;
            break;
    }

    content += `\n---\n生成工具: 多平台图标生成器`;

    return content;
}

// 自动生成图标预览
async function autoGenerateIcons() {
    if (!originalImage) return;

    // 获取选中的尺寸
    const selectedSizes = Array.from(document.querySelectorAll('.size-item input:checked'))
        .map(cb => parseInt(cb.value))
        .sort((a, b) => a - b);

    if (selectedSizes.length === 0) return;

    // 使用裁剪后的图片或原始图片
    const sourceImage = croppedImage || originalImage;

    try {
        // 清空预览区域，准备显示生成的图标
        previewGrid.innerHTML = '';
        convertedFiles = [];
        
        // 显示预览说明
        const previewNote = document.getElementById('previewNote');
        if (selectedSizes.length > 6) {
            previewNote.style.display = 'block';
        } else {
            previewNote.style.display = 'none';
        }

        // 只生成前几个尺寸作为预览，避免太多
        const previewSizes = selectedSizes.slice(0, 6);

        for (const size of previewSizes) {
            // 预览始终生成PNG格式，便于显示
            const iconBlob = await generatePNGFormat(sourceImage, size);
            
            convertedFiles.push({
                blob: iconBlob,
                size: size,
                name: getFileName(size, 'png'),
                platform: selectedPlatform,
                format: 'png'
            });

            // 创建预览图
            const previewItem = await createIconPreview(sourceImage, size, convertedFiles.length - 1, iconBlob.size);
            previewGrid.appendChild(previewItem);
        }

        // 如果有更多尺寸，显示提示
        if (selectedSizes.length > 6) {
            const moreItem = document.createElement('div');
            moreItem.className = 'preview-item more-sizes';
            moreItem.innerHTML = `
                <div class="preview-image">
                    <div style="display: flex; align-items: center; justify-content: center; height: 160px; color: var(--text-secondary); font-size: 0.9rem;">
                        还有 ${selectedSizes.length - 6} 个尺寸
                    </div>
                </div>
                <div class="preview-info">
                    <div class="file-name">更多尺寸</div>
                    <div class="info-row">
                        <span>点击生成图标</span>
                        <span>查看全部</span>
                    </div>
                </div>
            `;
            previewGrid.appendChild(moreItem);
        }

        // 显示下载按钮和格式选择
        if (convertedFiles.length > 0) {
            downloadBtn.style.display = 'block';
            
            // Windows、macOS和Favicon平台显示格式选择
            const formatSelection = document.getElementById('formatSelection');
            const formatIconName = document.getElementById('formatIconName');
            
            if (['windows', 'macos', 'favicon'].includes(selectedPlatform)) {
                formatSelection.style.display = 'block';
                
                // 更新格式名称和默认选择
                if (selectedPlatform === 'windows') {
                    formatIconName.textContent = 'ICO格式';
                    // 默认选择ICO格式
                    const formatIcon = document.getElementById('formatIcon');
                    if (formatIcon && !formatIcon.checked && !document.getElementById('formatPng').checked) {
                        formatIcon.checked = true;
                    }
                } else if (selectedPlatform === 'macos') {
                    formatIconName.textContent = 'ICNS格式';
                    // 默认选择ICNS格式
                    const formatIcon = document.getElementById('formatIcon');
                    if (formatIcon && !formatIcon.checked && !document.getElementById('formatPng').checked) {
                        formatIcon.checked = true;
                    }
                } else if (selectedPlatform === 'favicon') {
                    formatIconName.textContent = 'ICO格式';
                    // 默认选择ICO格式
                    const formatIcon = document.getElementById('formatIcon');
                    if (formatIcon && !formatIcon.checked && !document.getElementById('formatPng').checked) {
                        formatIcon.checked = true;
                    }
                }
            } else {
                formatSelection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('自动生成预览时出错:', error);
    }
}
