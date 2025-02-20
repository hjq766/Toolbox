// 初始化 DOM 引用
const DOM = {
    imagePreview: document.getElementById('imagePreview'),
    previewPlaceholder: document.getElementById('previewPlaceholder'),
    previewImage: document.querySelector('.preview-image'),
    paletteContainer: document.getElementById('paletteContainer'),
    paletteSection: document.querySelector('.palette-section'),
    colorCount: document.getElementById('colorCount'),
    sortMethod: document.getElementById('sortMethod'),
    extractBtn: document.getElementById('extractBtn'),
    exportBtn: document.getElementById('exportBtn')
};

// 全局状态管理
let pickerState = {
    isPickerActive: false,
    isSelecting: false,
    currentToolbar: null,
    pickerBtn: null,
    selectBtn: null,
    selectionBox: null,
    startPos: null
};

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 文件拖放
    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', (e) => e.preventDefault());
    dropZone.addEventListener('drop', handleDrop);

    // 文件选择
    const fileInput = dropZone.querySelector('input[type="file"]');
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImageUpload);

    // 重新提取按钮
    DOM.extractBtn.addEventListener('click', extractColors);

    // 导出按钮
    DOM.exportBtn.addEventListener('click', downloadPalette);

    // 复制全部按钮
    document.querySelector('.copy-all').addEventListener('click', copyAllColors);

    // 下载色板按钮
    document.querySelector('.download-palette').addEventListener('click', downloadPalette);

    // 初始化取色工具
    initColorPicker();
});

// 提取颜色
function extractColors() {
    try {
        const colorCount = parseInt(DOM.colorCount.value);
        const img = DOM.imagePreview;

        // 创建临时 canvas 来处理图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 使用更大的尺寸来提高颜色提取的准确度
        const maxSize = 400; // 增加处理尺寸
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // 使用高质量缩放
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const pixels = [];

        // 收集所有像素颜色
        for (let i = 0; i < imageData.length; i += 4) {
            pixels.push([
                imageData[i], // R
                imageData[i + 1], // G
                imageData[i + 2] // B
            ]);
        }

        // 使用 K-means 聚类算法提取主要颜色
        let palette = kMeans(pixels, colorCount);

        // 根据排序方式处理颜色
        const sortMethod = DOM.sortMethod.value;
        if (sortMethod === 'brightness') {
            palette.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
        } else if (sortMethod === 'hue') {
            palette.sort((a, b) => rgbToHsl(...a)[0] - rgbToHsl(...b)[0]);
        }

        displayPalette(palette);
        DOM.exportBtn.disabled = false;
        DOM.extractBtn.disabled = false;
    } catch (err) {
        DOM.extractBtn.disabled = false;
    }
}

// K-means 聚类算法
function kMeans(pixels, k) {
    // 随机选择初始中心点
    let centroids = pixels.sort(() => 0.5 - Math.random()).slice(0, k);
    let oldCentroids = [];
    let iterations = 0;
    const maxIterations = 20;

    while (!arraysEqual(centroids, oldCentroids) && iterations < maxIterations) {
        oldCentroids = [...centroids];
        iterations++;

        // 分配像素到最近的中心点
        const clusters = Array(k).fill().map(() => []);
        pixels.forEach(pixel => {
            let minDistance = Infinity;
            let closestCentroid = 0;

            centroids.forEach((centroid, i) => {
                const distance = colorDistance(pixel, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroid = i;
                }
            });

            clusters[closestCentroid].push(pixel);
        });

        // 更新中心点
        centroids = clusters.map(cluster => {
            if (cluster.length === 0) return [0, 0, 0];
            return cluster.reduce((acc, pixel) => {
                return [
                    acc[0] + pixel[0],
                    acc[1] + pixel[1],
                    acc[2] + pixel[2]
                ];
            }, [0, 0, 0]).map(sum => Math.round(sum / cluster.length));
        });
    }

    return centroids;
}

// 计算两个颜色之间的距离
function colorDistance(color1, color2) {
    const rDiff = color1[0] - color2[0];
    const gDiff = color1[1] - color2[1];
    const bDiff = color1[2] - color2[2];
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// RGB 转 HSL 函数
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // 灰色
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}

// 比较两个数组是否相等
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, i) => {
        if (Array.isArray(val)) return arraysEqual(val, arr2[i]);
        return val === arr2[i];
    });
}

// 显示色板
function displayPalette(palette) {
    DOM.paletteContainer.innerHTML = palette.map(color => {
        const [r, g, b] = color;
        const hex = rgbToHex(r, g, b);
        return `
                    <div class="color-card" onclick="copyColor('${hex}', 'rgb(${r}, ${g}, ${b})')">
                        <div class="color-preview" style="background: rgb(${r}, ${g}, ${b})"></div>
                        <div class="color-info">
                            <div>${hex}</div>
                            <div>rgb(${r}, ${g}, ${b})</div>
                        </div>
                    </div>
                `;
    }).join('');
}

// RGB 转 HEX
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// 导出色板
function exportPalette() {
    const cards = DOM.paletteContainer.querySelectorAll('.color-card');
    const colors = Array.from(cards).map(card => {
        const hex = card.querySelector('.color-info div').textContent;
        const rgb = card.querySelector('.color-info div:last-child').textContent;
        return {
            hex,
            rgb
        };
    });

    const data = {
        colors,
        exportTime: new Date().toLocaleString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 复制所有颜色
function copyAllColors() {
    const cards = DOM.paletteContainer.querySelectorAll('.color-card');
    const colors = Array.from(cards).map(card => {
        const hex = card.querySelector('.color-info div').textContent;
        const rgb = card.querySelector('.color-info div:last-child').textContent;
        return `${hex} ${rgb}`;
    }).join('\n');

    navigator.clipboard.writeText(colors).then(() => {
        showToast('已复制所有颜色值');
    });
}

// 下载色板图片
function downloadPalette() {
    const cards = DOM.paletteContainer.querySelectorAll('.color-card');
    const includeHex = document.getElementById('includeHex').checked;

    // 计算画布尺寸
    const colorCount = cards.length;
    const width = 800;
    const colorHeight = 160; // 增加颜色块高度
    const textHeight = includeHex ? 40 : 0; // 只有勾选 HEX 时才添加文字区域
    const height = colorHeight + textHeight;
    const colorWidth = width / colorCount;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // 绘制背景
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // 绘制颜色块和文字
    cards.forEach((card, i) => {
        const color = card.querySelector('.color-preview').style.background;
        const hex = card.querySelector('.color-info div').textContent;
        const x = i * colorWidth;

        // 绘制颜色块
        ctx.fillStyle = color;
        ctx.fillRect(x, 0, colorWidth, colorHeight);

        // 绘制分隔线
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + colorWidth - 1, 0, 1, colorHeight);

        // 只在勾选 HEX 时绘制颜色值
        if (includeHex) {
            ctx.fillStyle = '#333';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(hex, x + colorWidth / 2, colorHeight + 25);
        }
    });

    // 下载图片
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// 事件监听
DOM.extractBtn.addEventListener('click', extractColors);
DOM.exportBtn.addEventListener('click', downloadPalette);
DOM.copyAllBtn.addEventListener('click', copyAllColors);
DOM.downloadPaletteBtn.addEventListener('click', downloadPalette);

// 显示提示信息
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// 绑定事件
DOM.dropZone.onclick = triggerFileInput;
DOM.fileInput.onchange = selectFile;
DOM.dropZone.ondragover = (e) => e.preventDefault();
DOM.dropZone.ondrop = handleDrop;
DOM.sortMethod.onchange = extractColors;

// 添加复制颜色函数
function copyColor(hex, rgb) {
    navigator.clipboard.writeText(`${hex} ${rgb}`).then(() => {
        showToast('已复制颜色值');
    });
}

// 添加重置图片函数
function resetImage() {
    DOM.imagePreview.src = '';
    DOM.previewPlaceholder.style.display = 'flex';
    DOM.previewImage.style.display = 'none';
    document.querySelector('.palette-section').style.display = 'none';
    DOM.paletteContainer.innerHTML = '';
    // 移除工具栏
    const toolbar = document.querySelector('.image-toolbar');
    if (toolbar) toolbar.remove();
}

// 添加取色器功能
function initColorPicker() {
    const preview = DOM.imagePreview;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 移除旧的工具栏（如果存在）
    if (pickerState.currentToolbar) {
        pickerState.currentToolbar.remove();
    }

    // 添加工具栏
    const toolbar = document.createElement('div');
    toolbar.className = 'image-toolbar';
    DOM.previewImage.appendChild(toolbar);
    pickerState.currentToolbar = toolbar;

    // 添加取色器按钮
    const pickerBtn = document.createElement('button');
    pickerBtn.className = 'tool-btn picker-btn';
    pickerBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z"/>
                </svg>
            `;
    toolbar.appendChild(pickerBtn);
    pickerState.pickerBtn = pickerBtn;

    // 添加选区按钮
    const selectBtn = document.createElement('button');
    selectBtn.className = 'tool-btn select-btn';
    selectBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z"/>
                </svg>
            `;
    toolbar.appendChild(selectBtn);
    pickerState.selectBtn = selectBtn;

    // 点击取色器功能
    pickerBtn.onclick = () => {
        pickerState.isPickerActive = !pickerState.isPickerActive;
        pickerState.isSelecting = false;
        
        pickerBtn.classList.toggle('active');
        selectBtn.classList.remove('active');
        preview.style.cursor = pickerState.isPickerActive ? 'crosshair' : 'default';
        
        if (pickerState.selectionBox) {
            pickerState.selectionBox.remove();
            pickerState.selectionBox = null;
        }

        // 确保色板区域可见
        DOM.paletteSection.style.display = 'block';
    };

    // 选区功能
    selectBtn.onclick = () => {
        pickerState.isSelecting = !pickerState.isSelecting;
        pickerState.isPickerActive = false;
        
        selectBtn.classList.toggle('active');
        pickerBtn.classList.remove('active');
        preview.style.cursor = pickerState.isSelecting ? 'crosshair' : 'default';

        // 确保色板区域可见
        DOM.paletteSection.style.display = 'block';
    };

    // 处理点击取色
    preview.onclick = (e) => {
        if (!pickerState.isPickerActive) return;

        const rect = preview.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        canvas.width = preview.naturalWidth;
        canvas.height = preview.naturalHeight;
        ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);

        const scaleX = canvas.width / preview.offsetWidth;
        const scaleY = canvas.height / preview.offsetHeight;

        const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
        const color = [pixel[0], pixel[1], pixel[2]];

        // 确保色板区域可见并添加颜色
        DOM.paletteSection.style.display = 'block';
        addColorToPanel(color);
    };

    // 处理选区
    preview.onmousedown = (e) => {
        if (!pickerState.isSelecting) return;

        const rect = preview.getBoundingClientRect();
        pickerState.startPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        pickerState.selectionBox = document.createElement('div');
        pickerState.selectionBox.className = 'selection-box';
        DOM.previewImage.appendChild(pickerState.selectionBox);
    };

    preview.onmousemove = (e) => {
        if (!pickerState.isSelecting || !pickerState.selectionBox) return;

        const rect = preview.getBoundingClientRect();
        const currentPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        const left = Math.min(currentPos.x, pickerState.startPos.x);
        const top = Math.min(currentPos.y, pickerState.startPos.y);
        const width = Math.abs(currentPos.x - pickerState.startPos.x);
        const height = Math.abs(currentPos.y - pickerState.startPos.y);

        pickerState.selectionBox.style.left = `${left}px`;
        pickerState.selectionBox.style.top = `${top}px`;
        pickerState.selectionBox.style.width = `${width}px`;
        pickerState.selectionBox.style.height = `${height}px`;
    };

    preview.onmouseup = () => {
        if (!pickerState.isSelecting || !pickerState.selectionBox) return;

        const rect = pickerState.selectionBox.getBoundingClientRect();
        const previewRect = preview.getBoundingClientRect();

        // 创建一个临时canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // 计算选区在原始图片中的位置和大小
        const scaleX = preview.naturalWidth / preview.offsetWidth;
        const scaleY = preview.naturalHeight / preview.offsetHeight;

        const x = (rect.left - previewRect.left) * scaleX;
        const y = (rect.top - previewRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;

        // 设置临时canvas的大小
        tempCanvas.width = width;
        tempCanvas.height = height;

        // 在临时canvas上绘制选中区域的图像
        tempCtx.drawImage(
            preview,
            x, y, width, height,
            0, 0, width, height
        );

        // 获取选区的像素数据
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const pixels = [];

        // 收集像素数据
        for (let i = 0; i < imageData.data.length; i += 4) {
            pixels.push([
                imageData.data[i],
                imageData.data[i + 1],
                imageData.data[i + 2]
            ]);
        }

        // 直接提取颜色
        const colors = kMeans(pixels, 5);
        colors.forEach(color => addColorToPanel(color));

        // 移除选区框并重置状态
        pickerState.selectionBox.remove();
        pickerState.selectionBox = null;
        pickerState.isSelecting = false;
        selectBtn.classList.remove('active');
        preview.style.cursor = 'default';
    };
}

// 添加颜色到面板
function addColorToPanel(color) {
    const [r, g, b] = color;
    const hex = rgbToHex(r, g, b);

    const colorCard = document.createElement('div');
    colorCard.className = 'color-card';
    colorCard.onclick = () => copyColor(hex, `rgb(${r}, ${g}, ${b})`);
    colorCard.innerHTML = `
                <div class="color-preview" style="background: rgb(${r}, ${g}, ${b})"></div>
                <div class="color-info">
                    <div>${hex}</div>
                    <div>rgb(${r}, ${g}, ${b})</div>
                </div>
            `;

    DOM.paletteContainer.appendChild(colorCard);
    DOM.exportBtn.disabled = false;
}

// 清空色板函数
function clearPalette() {
    DOM.paletteContainer.innerHTML = '';
    DOM.paletteSection.style.display = 'block';
    DOM.extractBtn.disabled = false;
    DOM.exportBtn.disabled = true;

    // 重置所有取色工具状态
    pickerState.isPickerActive = false;
    pickerState.isSelecting = false;
    pickerState.startPos = null;

    if (pickerState.pickerBtn) {
        pickerState.pickerBtn.classList.remove('active');
    }
    if (pickerState.selectBtn) {
        pickerState.selectBtn.classList.remove('active');
    }
    if (pickerState.selectionBox) {
        pickerState.selectionBox.remove();
        pickerState.selectionBox = null;
    }

    DOM.imagePreview.style.cursor = 'default';
}

// 处理图片上传
function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            DOM.imagePreview.src = e.target.result;
            DOM.imagePreview.onload = () => {
                DOM.previewImage.style.display = 'block';
                DOM.previewPlaceholder.style.display = 'none';
                DOM.paletteSection.style.display = 'block';
                DOM.extractBtn.disabled = false;
                // 移除旧的工具栏
                const oldToolbar = DOM.previewImage.querySelector('.image-toolbar');
                if (oldToolbar) {
                    oldToolbar.remove();
                }
                // 重新初始化取色工具
                initColorPicker();
                extractColors();
            };
        };
        reader.readAsDataURL(file);
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            DOM.imagePreview.src = e.target.result;
            DOM.imagePreview.onload = () => {
                DOM.previewImage.style.display = 'block';
                DOM.previewPlaceholder.style.display = 'none';
                DOM.paletteSection.style.display = 'block';
                DOM.extractBtn.disabled = false;
                // 移除旧的工具栏
                const oldToolbar = DOM.previewImage.querySelector('.image-toolbar');
                if (oldToolbar) {
                    oldToolbar.remove();
                }
                // 重新初始化取色工具
                initColorPicker();
                extractColors();
            };
        };
        reader.readAsDataURL(file);
    }
}

function clearImage() {
    DOM.imagePreview.src = '';
    DOM.previewImage.style.display = 'none';
    DOM.previewPlaceholder.style.display = 'flex';
    DOM.extractBtn.disabled = true;
    clearPalette();
}