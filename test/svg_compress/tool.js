// 获取 DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewGrid = document.getElementById('previewGrid');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qualitySlider = document.getElementById('qualitySlider');
const qualityDisplay = document.querySelector('.value-display'); // 获取显示滑块值的元素
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');

// 初始化滑块显示值
qualityDisplay.textContent = `${(qualitySlider.value * 100).toFixed(0)}%`;

// 监听滑块变化
qualitySlider.addEventListener('input', () => {
    qualityDisplay.textContent = `${(qualitySlider.value * 100).toFixed(0)}%`;
});

// 处理文件上传
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);

// 处理文件
function handleFiles() {
    const files = Array.from(fileInput.files);
    previewGrid.innerHTML = ''; // 清空预览区域
    files.forEach(file => {
        if (file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = (event) => {
                const svgContent = event.target.result;
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = svgContent; // 显示 SVG 预览

                // 添加文件大小信息
                const fileSize = document.createElement('div');
                fileSize.className = 'file-size';
                fileSize.textContent = `文件大小: ${(file.size / 1024).toFixed(2)} KB`; // 转换为 KB
                previewItem.appendChild(fileSize);

                previewGrid.appendChild(previewItem);
            };
            reader.readAsText(file);
        }
    });
    convertBtn.disabled = files.length === 0; // 启用或禁用压缩按钮
}

// 开始压缩
convertBtn.addEventListener('click', async () => {
    const files = Array.from(fileInput.files);
    const compressedFiles = [];
    progressBar.style.display = 'block';
    progress.style.width = '0%';

    for (const file of files) {
        const quality = qualitySlider.value;
        const compressedFile = await compressSVG(file, quality);
        compressedFiles.push(compressedFile);
        // 更新进度条
        progress.style.width = `${(compressedFiles.length / files.length) * 100}%`;
    }

    // 显示下载按钮
    downloadBtn.style.display = 'block';
    downloadBtn.onclick = () => downloadFiles(compressedFiles);

    // 更新预览窗以显示压缩后的文件大小
    updatePreviewWithCompressedFiles(compressedFiles);
});

// 压缩 SVG 文件
async function compressSVG(file, quality) {
    const svgContent = await file.text();
    const compressedContent = compressSvgContent(svgContent, quality);
    const blob = new Blob([compressedContent], { type: 'image/svg+xml' });
    return new File([blob], file.name, { type: 'image/svg+xml' });
}

// 下载压缩后的文件
function downloadFiles(files) {
    files.forEach(file => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// 更新预览窗以显示压缩后的文件大小
function updatePreviewWithCompressedFiles(files) {
    files.forEach((file, index) => {
        const previewItem = document.querySelectorAll('.preview-item')[index];
        if (previewItem) {
            const compressedFileSize = document.createElement('div');
            compressedFileSize.className = 'file-size';
            compressedFileSize.textContent = `压缩后文件大小: ${(file.size / 1024).toFixed(2)} KB`; // 转换为 KB
            previewItem.appendChild(compressedFileSize);
        }
    });
}

// 示例压缩函数（需要实现具体逻辑）
function compressSvgContent(svgContent, quality) {
    // 这里可以添加具体的 SVG 压缩逻辑
    return svgContent; // 返回压缩后的内容
}
