// 全局变量
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewGrid = document.getElementById('previewGrid');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');
const qualitySlider = document.getElementById('qualitySlider');
const keepExif = document.getElementById('keepExif');

let uploadedFiles = [];
let convertedFiles = [];

// 更新滑块值显示
qualitySlider.nextElementSibling.textContent = Math.round(qualitySlider.value * 100) + '%';

qualitySlider.addEventListener('input', (e) => {
    e.target.nextElementSibling.textContent = Math.round(e.target.value * 100) + '%';
});

// 拖放处理
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

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// 处理文件上传
function handleFiles(files) {
    let validFiles = 0;
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            validFiles++;
            const preview = createPreviewItem(file);
            previewGrid.appendChild(preview);
            uploadedFiles.push({
                file: file,
                preview: URL.createObjectURL(file)
            });
        }
    }

    if (validFiles === 0) {
        showToast('请选择有效的图片文件');
    } else {
        convertBtn.disabled = false;
        downloadBtn.style.display = 'none';
    }
}

// 创建预览项
function createPreviewItem(file) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    const index = uploadedFiles.length;
    previewItem.innerHTML = `
        <div class="preview-image">
            <img src="${URL.createObjectURL(file)}" alt="${file.name}">
        </div>
        <div class="preview-info">
            <div class="file-name">${file.name}</div>
            <div class="info-row">
                <span>原始大小：</span>
                <span class="original-size">${formatFileSize(file.size)}</span>
            </div>
            <div class="info-row">
                <span>压缩大小：</span>
                <span class="compressed-size">-</span>
            </div>
            <div class="info-row">
                <span>压缩比例：</span>
                <span class="compression-ratio">-</span>
            </div>
            <button class="btn" style="display: none;">
                下载此图片
            </button>
        </div>
        <button class="remove-btn" onclick="removeFile(${index})">
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
        </button>
    `;

    return previewItem;
}

// 删除文件
function removeFile(index) {
    previewGrid.children[index].remove();
    uploadedFiles.splice(index, 1);
    if (convertedFiles[index]) {
        convertedFiles.splice(index, 1);
    }

    if (uploadedFiles.length === 0) {
        convertBtn.disabled = true;
        downloadBtn.style.display = 'none';
    }
}

// 压缩按钮点击事件
convertBtn.addEventListener('click', async () => {
    if (uploadedFiles.length === 0) {
        showToast('请先上传图片');
        return;
    }

    convertBtn.disabled = true;
    progressBar.style.display = 'block';
    progress.style.width = '0%';
    convertedFiles = [];

    try {
        const quality = parseFloat(qualitySlider.value);

        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const previewItem = previewGrid.children[i];

            // 更新进度条
            progress.style.width = `${((i + 1) / uploadedFiles.length) * 100}%`;

            try {
                // 如果质量是100%，直接使用原图
                if (quality === 1) {
                    const compressedSize = formatFileSize(file.file.size);
                    
                    previewItem.querySelector('.compressed-size').textContent = compressedSize;
                    previewItem.querySelector('.compression-ratio').textContent = '0%（原图）';

                    // 显示下载按钮
                    const downloadButton = previewItem.querySelector('.btn');
                    downloadButton.style.display = 'block';
                    downloadButton.onclick = () => {
                        const url = URL.createObjectURL(file.file);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.file.name;
                        a.click();
                        URL.revokeObjectURL(url);
                    };

                    // 保存文件
                    convertedFiles.push({
                        file: file.file,
                        name: file.file.name
                    });
                    continue;
                }

                // 检查是否为PNG
                const isPNG = file.file.type === 'image/png';

                // 设置压缩选项
                const options = {
                    maxSizeMB: Infinity,
                    useWebWorker: true,
                    initialQuality: quality,
                    fileType: file.file.type,
                    exifOrientation: keepExif.checked,
                    // PNG特定优化
                    alwaysKeepResolution: true,
                    maxIteration: isPNG ? 2 : 1,
                };

                // 压缩图片
                const compressedFile = await imageCompression(file.file, options);

                // 检查压缩效果
                const compressionRatio = compressedFile.size / file.file.size;
                
                // 如果压缩后反而变大了，使用原图
                if (compressionRatio >= 1) {
                    const originalSize = formatFileSize(file.file.size);
                    previewItem.querySelector('.compressed-size').textContent = originalSize;
                    previewItem.querySelector('.compression-ratio').textContent = '0%';

                    // 显示下载按钮
                    const downloadButton = previewItem.querySelector('.btn');
                    downloadButton.style.display = 'block';
                    downloadButton.onclick = () => {
                        const url = URL.createObjectURL(file.file);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.file.name;
                        a.click();
                        URL.revokeObjectURL(url);
                    };

                    // 保存原始文件
                    convertedFiles.push({
                        file: file.file,
                        name: file.file.name
                    });
                } else {
                    // 使用压缩后的文件
                    const compressedSize = formatFileSize(compressedFile.size);
                    const ratio = Math.round((1 - compressionRatio) * 100);
                    
                    previewItem.querySelector('.compressed-size').textContent = compressedSize;
                    previewItem.querySelector('.compression-ratio').textContent = `${ratio}%`;

                    // 显示下载按钮
                    const downloadButton = previewItem.querySelector('.btn');
                    downloadButton.style.display = 'block';
                    downloadButton.onclick = () => {
                        const url = URL.createObjectURL(compressedFile);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `compressed_${file.file.name}`;
                        a.click();
                        URL.revokeObjectURL(url);
                    };

                    // 保存压缩后的文件
                    convertedFiles.push({
                        file: compressedFile,
                        name: `compressed_${file.file.name}`
                    });
                }
            } catch (err) {
                console.error('压缩失败:', err);
                previewItem.querySelector('.compressed-size').textContent = '压缩失败';
                previewItem.querySelector('.compression-ratio').textContent = '-';
            }
        }

        // 根据处理的图片数量显示不同的下载按钮
        if (convertedFiles.length > 0) {
            downloadBtn.style.display = 'block';
            if (convertedFiles.length === 1) {
                downloadBtn.textContent = '下载图片';
                // 单张图片时，点击直接下载
                downloadBtn.onclick = () => {
                    const file = convertedFiles[0];
                    const url = URL.createObjectURL(file.file);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    a.click();
                    URL.revokeObjectURL(url);
                };
            } else {
                downloadBtn.textContent = '批量下载';
                // 多张图片时，打包下载
                downloadBtn.onclick = () => {
                    const zip = new JSZip();
                    convertedFiles.forEach(file => {
                        zip.file(file.name, file.file);
                    });
                    
                    zip.generateAsync({ type: 'blob' }).then(content => {
                        const url = URL.createObjectURL(content);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'compressed_images.zip';
                        a.click();
                        URL.revokeObjectURL(url);
                    });
                };
            }
            showToast('处理完成！');
        }
    } catch (error) {
        console.error('处理错误:', error);
        showToast('处理失败，请重试');
    } finally {
        convertBtn.disabled = false;
        progressBar.style.display = 'none';
    }
});

// 批量下载按钮点击事件
downloadBtn.addEventListener('click', () => {
    if (convertedFiles.length === 0) {
        showToast('没有可下载的文件');
        return;
    }

    // 创建 ZIP 文件
    const zip = new JSZip();
    convertedFiles.forEach(file => {
        zip.file(file.name, file.file);
    });

    // 生成并下载 ZIP
    zip.generateAsync({ type: 'blob' }).then(content => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed_images.zip';
        a.click();
        URL.revokeObjectURL(url);
        showToast('开始下载压缩包');
    });
});

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 显示提示信息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}