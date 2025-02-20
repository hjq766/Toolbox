// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewGrid = document.getElementById('previewGrid');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // 存储上传的文件
    let uploadedFiles = [];

    // 文件大小格式化
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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

    // SVG压缩函数
    async function compressSvg(svgContent) {
        try {
            // 创建一个临时的div来解析SVG
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgContent;
            const svgElement = tempDiv.querySelector('svg');

            if (!svgElement) {
                throw new Error('无效的SVG文件');
            }

            // 使用SVG.js解析SVG
            const draw = SVG(svgElement);

            // 移除注释节点
            const iterator = document.createNodeIterator(draw.node, NodeFilter.SHOW_COMMENT);
            let node;
            while (node = iterator.nextNode()) {
                node.parentNode.removeChild(node);
            }

            // 清理空属性和默认值
            draw.find('*').forEach(element => {
                Array.from(element.node.attributes).forEach(attr => {
                    // 移除空属性
                    if (!attr.value) {
                        element.node.removeAttribute(attr.name);
                    }
                    // 移除默认值
                    if (attr.name === 'fill' && attr.value === '#000000') {
                        element.node.removeAttribute(attr.name);
                    }
                    if (attr.name === 'stroke' && attr.value === 'none') {
                        element.node.removeAttribute(attr.name);
                    }
                });
            });

            // 移除空的g标签，但保留有transform属性的
            draw.find('g').forEach(g => {
                if (!g.children().length && !g.attr('transform')) {
                    g.remove();
                }
            });

            // 额外的优化：移除空白字符
            const optimizedSvg = draw.svg()
                .replace(/>\s+</g, '><')  // 移除标签之间的空白
                .replace(/\s+/g, ' ')     // 将多个空白替换为单个空格
                .replace(/\s*([{}>])\s*/g, '$1'); // 移除括号周围的空白

            // 清理临时元素
            draw.remove();
            
            return optimizedSvg;
        } catch (error) {
            console.error('SVG压缩失败:', error);
            throw error;
        }
    }

    // 创建预览项
    function createPreviewItem(file, content) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        
        const originalSize = formatFileSize(file.size);
        div.innerHTML = `
            <div class="preview-content">
                <div class="preview-svg" style="color: inherit;">${content}</div>
                <div class="preview-info">
                    <p class="file-name">${file.name}</p>
                    <p class="file-size">原始大小: ${originalSize}</p>
                    <p class="compressed-size"></p>
                </div>
            </div>
        `;
        
        return div;
    }

    // 处理上传的文件
    async function handleFiles(files) {
        uploadedFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.svg'));
        
        if (uploadedFiles.length === 0) {
            showToast('请上传SVG格式的文件');
            return;
        }

        previewGrid.innerHTML = '';
        convertBtn.disabled = false;
        downloadBtn.style.display = 'none';

        for (const file of uploadedFiles) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const previewItem = createPreviewItem(file, e.target.result);
                previewGrid.appendChild(previewItem);
            };
            reader.readAsText(file);
        }
    }

    // 文件拖放处理
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择变化处理
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 开始压缩
    convertBtn.addEventListener('click', async () => {
        if (uploadedFiles.length === 0) return;

        const progressBar = document.querySelector('.progress-bar');
        const progress = document.querySelector('.progress');
        progressBar.style.display = 'block';
        convertBtn.disabled = true;

        const compressedFiles = [];
        let processedCount = 0;

        for (const file of uploadedFiles) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const svgContent = e.target.result;
                    const result = await compressSvg(svgContent);
                    
                    const previewItems = previewGrid.children;
                    const currentPreview = previewItems[processedCount];
                    
                    if (currentPreview) {
                        const infoDiv = currentPreview.querySelector('.preview-info');
                        const sizeSpan = currentPreview.querySelector('.compressed-size');
                        sizeSpan.textContent = `压缩后大小: ${formatFileSize(result.length)}`;
                        
                        // 更新预览
                        const previewSvg = currentPreview.querySelector('.preview-svg');
                        previewSvg.innerHTML = result;
                    }

                    compressedFiles.push({
                        name: file.name,
                        content: result
                    });

                    processedCount++;
                    progress.style.width = `${(processedCount / uploadedFiles.length) * 100}%`;

                    if (processedCount === uploadedFiles.length) {
                        progressBar.style.display = 'none';
                        downloadBtn.style.display = 'block';
                        downloadBtn.textContent = uploadedFiles.length > 1 ? '批量下载' : '下载SVG';
                        showToast('压缩完成！');
                    }
                } catch (error) {
                    console.error('压缩失败:', error);
                    showToast('压缩失败，请检查文件格式是否正确');
                }
            };
            reader.readAsText(file);
        }

        // 下载按钮事件
        downloadBtn.onclick = async () => {
            if (compressedFiles.length === 1) {
                // 单个文件直接下载
                const file = compressedFiles[0];
                const blob = new Blob([file.content], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${file.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                // 多个文件打包下载
                const zip = new JSZip();
                compressedFiles.forEach(file => {
                    zip.file(`compressed_${file.name}`, file.content);
                });
                
                const content = await zip.generateAsync({type: 'blob'});
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'compressed_svgs.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        };
    });
});
