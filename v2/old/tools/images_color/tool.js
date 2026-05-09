document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const colorsSection = document.getElementById('colorsSection');
    const imagePreview = document.getElementById('imagePreview');
    const previewCanvas = document.getElementById('previewCanvas');
    const selectionBox = document.getElementById('selectionBox');
    const colorList = document.getElementById('colorList');
    const manualColorBtn = document.getElementById('manualColorBtn');
    const selectionColorBtn = document.getElementById('selectionColorBtn');
    const deleteImageBtn = document.getElementById('deleteImageBtn');
    const clearColors = document.getElementById('clearColors');
    const exportImage = document.getElementById('exportImage');
    const exportJson = document.getElementById('exportJson');
    const countOptions = document.querySelectorAll('.count-option');
    const sortOptions = document.querySelectorAll('.sort-option');
    const formatOptions = document.querySelectorAll('.format-option');

    // 变量
    let currentMode = 'auto';
    let currentImage = null;
    let currentFormat = 'hex';
    let ctx = previewCanvas.getContext('2d');
    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let selectionData = null;
    const colorThief = new ColorThief();

    // 文件上传处理
    uploadArea.addEventListener('click', () => fileInput.click());
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
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    });

    // 图片上传处理函数
    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                
                // 显示预览区域和颜色区域，隐藏上传区域
                previewSection.style.display = 'block';
                colorsSection.style.display = 'block';
                uploadArea.style.display = 'none';

                // 等待DOM更新后再获取容器尺寸
                setTimeout(() => {
                    resizeAndDisplayImage(img);
                    // 自动提取颜色
                    extractColorsFromImage();
                }, 0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 调整图片大小并显示
    function resizeAndDisplayImage(img) {
        const container = imagePreview;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        const containerRatio = containerWidth / containerHeight;
        const imageRatio = img.width / img.height;
        
        let width, height;
        if (imageRatio > containerRatio) {
            width = containerWidth;
            height = width / imageRatio;
        } else {
            height = containerHeight;
            width = height * imageRatio;
        }

        // 更新 canvas 尺寸和内容
        previewCanvas.style.width = Math.round(width) + 'px';
        previewCanvas.style.height = Math.round(height) + 'px';
        previewCanvas.width = Math.round(width);
        previewCanvas.height = Math.round(height);
        
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
    }

    // 删除图片
    deleteImageBtn.addEventListener('click', () => {
        currentImage = null;
        previewSection.style.display = 'none';
        colorsSection.style.display = 'none';
        uploadArea.style.display = 'block';
        colorList.innerHTML = '';
        fileInput.value = '';
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    });

    // 工具按钮切换
    manualColorBtn.addEventListener('click', () => {
        currentMode = currentMode === 'manual' ? 'auto' : 'manual';
        updateToolButtons();
    });

    selectionColorBtn.addEventListener('click', () => {
        currentMode = currentMode === 'selection' ? 'auto' : 'selection';
        updateToolButtons();
    });

    function updateToolButtons() {
        manualColorBtn.classList.toggle('active', currentMode === 'manual');
        selectionColorBtn.classList.toggle('active', currentMode === 'selection');
        
        if (currentMode === 'manual' || currentMode === 'selection') {
            previewCanvas.style.cursor = 'crosshair';
        } else {
            previewCanvas.style.cursor = 'default';
        }
    }

    // 手动取色
    previewCanvas.addEventListener('click', (e) => {
        if (currentMode !== 'manual') return;
        
        const rect = previewCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        addColorToList([color], true);
    });

    // 保存原始图像数据
    function saveOriginalImageData() {
        return ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
    }

    // 恢复原始图像
    function restoreOriginalImage(imageData) {
        if (imageData) {
            ctx.putImageData(imageData, 0, 0);
        }
    }

    // 绘制选框
    function drawSelectionBox(x1, y1, x2, y2) {
        const imageAspect = currentImage.width / currentImage.height;
        const canvasAspect = previewCanvas.width / previewCanvas.height;
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspect > canvasAspect) {
            drawWidth = previewCanvas.width;
            drawHeight = drawWidth / imageAspect;
            drawX = 0;
            drawY = (previewCanvas.height - drawHeight) / 2;
        } else {
            drawHeight = previewCanvas.height;
            drawWidth = drawHeight * imageAspect;
            drawX = (previewCanvas.width - drawWidth) / 2;
            drawY = 0;
        }

        x1 = Math.max(drawX, Math.min(drawX + drawWidth, x1));
        y1 = Math.max(drawY, Math.min(drawY + drawHeight, y1));
        x2 = Math.max(drawX, Math.min(drawX + drawWidth, x2));
        y2 = Math.max(drawY, Math.min(drawY + drawHeight, y2));

        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);

        restoreOriginalImage(selectionData);

        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, width, height);

        ctx.fillStyle = 'rgba(56, 100, 252, 0.2)';
        ctx.fillRect(left, top, width, height);

        return { left, top, width, height, drawX, drawY, drawWidth, drawHeight };
    }

    // 选框相关事件处理
    previewCanvas.addEventListener('mousedown', (e) => {
        if (currentMode !== 'selection' || !currentImage) return;
        
        const rect = previewCanvas.getBoundingClientRect();
        const scaleX = previewCanvas.width / rect.width;
        const scaleY = previewCanvas.height / rect.height;
        
        startX = (e.clientX - rect.left) * scaleX;
        startY = (e.clientY - rect.top) * scaleY;
        
        isSelecting = true;
        selectionData = saveOriginalImageData();
    });

    previewCanvas.addEventListener('mousemove', (e) => {
        if (!isSelecting || currentMode !== 'selection') return;
        
        const rect = previewCanvas.getBoundingClientRect();
        const scaleX = previewCanvas.width / rect.width;
        const scaleY = previewCanvas.height / rect.height;
        
        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;
        
        drawSelectionBox(startX, startY, currentX, currentY);
    });

    previewCanvas.addEventListener('mouseup', (e) => {
        if (!isSelecting || currentMode !== 'selection') return;
        
        isSelecting = false;
        
        const rect = previewCanvas.getBoundingClientRect();
        const scaleX = previewCanvas.width / rect.width;
        const scaleY = previewCanvas.height / rect.height;
        
        const endX = (e.clientX - rect.left) * scaleX;
        const endY = (e.clientY - rect.top) * scaleY;
        
        const selection = drawSelectionBox(startX, startY, endX, endY);
        
        if (selection.width < 10 || selection.height < 10) {
            restoreOriginalImage(selectionData);
            return;
        }
        
        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = selection.width;
            tempCanvas.height = selection.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            const sourceX = (selection.left - selection.drawX) * (currentImage.width / selection.drawWidth);
            const sourceY = (selection.top - selection.drawY) * (currentImage.height / selection.drawHeight);
            const sourceWidth = selection.width * (currentImage.width / selection.drawWidth);
            const sourceHeight = selection.height * (currentImage.height / selection.drawHeight);
            
            tempCtx.drawImage(currentImage,
                Math.round(sourceX), Math.round(sourceY),
                Math.round(sourceWidth), Math.round(sourceHeight),
                0, 0, selection.width, selection.height
            );
            
            const colors = colorThief.getPalette(tempCanvas, 5);
            const colorStrings = colors.map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
            addColorToList(colorStrings, true);
            
            restoreOriginalImage(selectionData);
        } catch (error) {
            restoreOriginalImage(selectionData);
        }
    });

    // 鼠标离开画布时清除选框
    previewCanvas.addEventListener('mouseleave', () => {
        if (isSelecting) {
            isSelecting = false;
            restoreOriginalImage(selectionData);
        }
    });

    // 取色数量选择
    countOptions.forEach(option => {
        option.addEventListener('click', () => {
            countOptions.forEach(btn => btn.classList.remove('active'));
            option.classList.add('active');
            if (currentImage) {
                extractColorsFromImage();
            }
        });
    });

    // 颜色排序选项
    sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            sortOptions.forEach(btn => btn.classList.remove('active'));
            option.classList.add('active');
            sortColors();
        });
    });

    // 颜色格式选项
    formatOptions.forEach(option => {
        option.addEventListener('click', () => {
            formatOptions.forEach(btn => btn.classList.remove('active'));
            option.classList.add('active');
            currentFormat = option.dataset.format;
            updateColorValues();
        });
    });

    // 自动提取颜色
    function extractColorsFromImage() {
        if (!currentImage) return;
        
        const activeOption = document.querySelector('.count-option.active');
        const count = parseInt(activeOption.dataset.count);
        const colors = colorThief.getPalette(currentImage, count);
        const colorStrings = colors.map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
        addColorToList(colorStrings);
    }

    // 排序颜色
    function sortColors() {
        const sortType = document.querySelector('.sort-option.active').dataset.sort;
        const cards = Array.from(colorList.children);
        
        if (sortType === 'default') return;

        cards.sort((a, b) => {
            const colorA = a.querySelector('.color-preview').style.backgroundColor;
            const colorB = b.querySelector('.color-preview').style.backgroundColor;
            const [hslA, hslB] = [rgbToHsl(colorA), rgbToHsl(colorB)];

            switch (sortType) {
                case 'brightness':
                    return hslB[2] - hslA[2]; // 亮度降序
                case 'hue':
                    return hslA[0] - hslB[0]; // 色相升序
                case 'saturation':
                    return hslB[1] - hslA[1]; // 饱和度降序
            }
        });

        cards.forEach(card => colorList.appendChild(card));
    }

    // 更新颜色值显示
    function updateColorValues() {
        const cards = Array.from(colorList.children);
        cards.forEach(card => {
            const color = card.querySelector('.color-preview').style.backgroundColor;
            const valueElement = card.querySelector('.color-value');
            
            switch (currentFormat) {
                case 'hex':
                    valueElement.textContent = rgbToHex(color);
                    break;
                case 'rgb':
                    valueElement.textContent = color;
                    break;
                case 'hsl':
                    const hsl = rgbToHsl(color);
                    valueElement.textContent = `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`;
                    break;
            }
        });
    }

    // 添加颜色到列表
    function addColorToList(colors, append = false) {
        if (!append) {
            colorList.innerHTML = '';
        }
        
        colors.forEach(color => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            
            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            colorPreview.style.backgroundColor = color;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'color-delete';
            deleteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                colorCard.remove();
            });
            
            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';
            
            const colorValue = document.createElement('div');
            colorValue.className = 'color-value';
            colorValue.textContent = rgbToHex(color);
            
            colorInfo.appendChild(colorValue);
            colorCard.appendChild(colorPreview);
            colorCard.appendChild(deleteBtn);
            colorCard.appendChild(colorInfo);
            colorList.appendChild(colorCard);
            
            colorCard.addEventListener('click', () => {
                navigator.clipboard.writeText(rgbToHex(color));
                showToast('颜色值已复制到剪贴板');
            });
        });
    }

    // RGB 转 HEX
    function rgbToHex(rgb) {
        const values = rgb.match(/\d+/g);
        return '#' + values.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // RGB 转 HSL
    function rgbToHsl(rgb) {
        const values = rgb.match(/\d+/g).map(Number);
        const [r, g, b] = values.map(x => x / 255);
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
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
            
            h *= 60;
        }

        return [h, s * 100, l * 100];
    }

    // 清空色板
    clearColors.addEventListener('click', () => {
        colorList.innerHTML = '';
    });

    // 显示 toast 消息
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.style.display = 'block';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 2000);
    }

    // 插入 toast 容器
    function insertToastContainer() {
        if (!document.getElementById('toast')) {
            const toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.insertBefore(toast, document.body.firstChild);
        }
    }

    // 初始化 toast
    insertToastContainer();

    // 导出功能
    exportImage.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const colors = Array.from(colorList.children);
        const colorWidth = 100;
        
        canvas.width = colors.length * colorWidth;
        canvas.height = colorWidth;
        
        colors.forEach((color, index) => {
            const hex = rgbToHex(color.querySelector('.color-preview').style.backgroundColor);
            ctx.fillStyle = hex;
            ctx.fillRect(index * colorWidth, 0, colorWidth, colorWidth);
            
            const value = color.querySelector('.color-value').textContent;
            ctx.fillStyle = getContrastColor(hex);
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, index * colorWidth + colorWidth/2, colorWidth/2);
        });
        
        const link = document.createElement('a');
        link.download = 'color-palette.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    exportJson.addEventListener('click', () => {
        const colors = Array.from(colorList.children).map(color => {
            const hex = color.querySelector('.color-value').textContent;
            return {
                hex: hex,
                rgb: color.querySelector('.color-preview').style.backgroundColor
            };
        });
        
        const json = JSON.stringify(colors, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'color-palette.json';
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
    });

    // 获取对比色（用于文字颜色）
    function getContrastColor(hex) {
        const rgb = hex.match(/\w\w/g).map(x => parseInt(x, 16));
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    // 从图像数据中提取颜色
    function extractColorsFromImageData(data, count) {
        const colors = [];
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const color = `rgb(${r}, ${g}, ${b})`;
            colors.push(color);
        }
        return colors;
    }

    // 添加颜色到列表
    function addColorsToList(colors) {
        colors.forEach(color => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            
            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            colorPreview.style.backgroundColor = color;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'color-delete';
            deleteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                colorCard.remove();
            });
            
            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';
            
            const colorValue = document.createElement('div');
            colorValue.className = 'color-value';
            colorValue.textContent = rgbToHex(color);
            
            colorInfo.appendChild(colorValue);
            colorCard.appendChild(colorPreview);
            colorCard.appendChild(deleteBtn);
            colorCard.appendChild(colorInfo);
            colorList.appendChild(colorCard);
            
            colorCard.addEventListener('click', () => {
                navigator.clipboard.writeText(rgbToHex(color));
                showToast('颜色值已复制到剪贴板');
            });
        });
    }
});