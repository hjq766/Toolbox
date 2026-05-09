// 全局变量
let currentImage = null;
let canvas = document.getElementById('previewCanvas');
let ctx = canvas.getContext('2d');
let rows = 3;
let cols = 3;
let cutPieces = null;

// 调试函数
function debug(message, data = null) {
    console.log(`[Debug] ${message}`);
    if (data) {
        console.log(data);
    }
}

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const deleteImageBtn = document.getElementById('deleteImageBtn');
const gridSizePresets = document.getElementById('gridSizePresets');
const downloadBtn = document.getElementById('downloadBtn');
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const gridLines = document.getElementById('gridLines');
const customGridBtn = document.getElementById('customGridBtn');
const customGridGroup = document.querySelector('.custom-grid-group');
const confirmCustomGrid = document.getElementById('confirmCustomGrid');

// 初始化事件监听
function initEventListeners() {
    debug('初始化事件监听');
    // 文件上传相关
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    deleteImageBtn.addEventListener('click', deleteImage);

    // 宫格设置相关
    document.querySelectorAll('.size-preset').forEach(btn => {
        if (btn.id !== 'customGridBtn') {
            btn.addEventListener('click', () => {
                debug('选择预设宫格', { rows: btn.dataset.rows, cols: btn.dataset.cols });
                document.querySelectorAll('.size-preset').forEach(b => b.classList.remove('active'));
                customGridGroup.style.display = 'none';
                btn.classList.add('active');
                rows = parseInt(btn.dataset.rows);
                cols = parseInt(btn.dataset.cols);
                drawGridLines();
            });
        }
    });

    // 自定义宫格按钮
    customGridBtn.addEventListener('click', () => {
        debug('点击自定义宫格按钮');
        document.querySelectorAll('.size-preset').forEach(b => b.classList.remove('active'));
        customGridBtn.classList.add('active');
        customGridGroup.style.display = 'block';
    });

    // 确认自定义宫格
    confirmCustomGrid.addEventListener('click', () => {
        rows = Math.min(Math.max(parseInt(rowsInput.value) || 1, 1), 10);
        cols = Math.min(Math.max(parseInt(colsInput.value) || 1, 1), 10);
        debug('确认自定义宫格', { rows, cols });
        rowsInput.value = rows;
        colsInput.value = cols;
        drawGridLines();
    });

    // 切割和下载按钮
    cutImageBtn.addEventListener('click', cutImage);
}

// 处理文件拖放
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    debug('文件拖放');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 处理文件选择
function handleFileSelect(e) {
    debug('文件选择');
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 处理图片文件
function handleFile(file) {
    debug('处理文件', { 
        name: file.name,
        type: file.type,
        size: file.size
    });

    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        debug('文件读取完成');
        currentImage = new Image();
        currentImage.onload = () => {
            debug('图片加载完成', {
                width: currentImage.width,
                height: currentImage.height
            });
            displayImage();
            cutImageBtn.disabled = false;
            uploadArea.style.display = 'none';
            previewSection.style.display = 'block';
        };
        currentImage.onerror = (error) => {
            debug('图片加载失败', error);
            showToast('图片加载失败');
        };
        currentImage.src = e.target.result;
    };
    reader.onerror = (error) => {
        debug('文件读取失败', error);
        showToast('文件读取失败');
    };
    reader.readAsDataURL(file);
}

// 显示图片
function displayImage() {
    const container = canvas.parentElement;
    
    // 确保容器已经渲染完成
    if (!container || !container.clientWidth) {
        debug('容器尚未准备好，稍后重试');
        setTimeout(displayImage, 100);
        return;
    }
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    debug('显示图片', {
        container: {
            width: containerWidth,
            height: containerHeight
        },
        image: {
            width: currentImage.width,
            height: currentImage.height
        }
    });

    // 设置画布大小为容器大小
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // 计算图片缩放和位置
    const scale = Math.min(
        containerWidth / currentImage.width,
        containerHeight / currentImage.height
    );
    
    const scaledWidth = currentImage.width * scale;
    const scaledHeight = currentImage.height * scale;
    
    // 计算居中位置
    const x = (containerWidth - scaledWidth) / 2;
    const y = (containerHeight - scaledHeight) / 2;

    debug('图片显示参数', {
        scale,
        scaledWidth,
        scaledHeight,
        x,
        y
    });
    
    // 清空画布
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    
    try {
        // 绘制图片
        ctx.drawImage(
            currentImage,
            x, y,
            scaledWidth,
            scaledHeight
        );
        
        // 保存实际显示的图片尺寸信息，用于切割时的计算
        canvas.imageInfo = {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
            scale
        };
        
        drawGridLines();
    } catch (error) {
        debug('绘制图片失败', error);
        showToast('图片显示失败');
    }
}

// 绘制网格线
function drawGridLines() {
    if (!currentImage || !canvas.imageInfo) {
        debug('无法绘制网格线：图片或尺寸信息不存在');
        return;
    }
    
    const { x, y, width, height } = canvas.imageInfo;
    
    debug('绘制网格线', {
        imageInfo: canvas.imageInfo,
        rows,
        cols
    });

    // 清除现有网格线
    gridLines.innerHTML = '';
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    
    try {
        // 绘制垂直线
        for (let i = 1; i < cols; i++) {
            const lineX = x + (width * i) / cols;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', lineX);
            line.setAttribute('y1', y);
            line.setAttribute('x2', lineX);
            line.setAttribute('y2', y + height);
            line.setAttribute('stroke', '#fff');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '4,4');
            svg.appendChild(line);
        }
        
        // 绘制水平线
        for (let i = 1; i < rows; i++) {
            const lineY = y + (height * i) / rows;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', lineY);
            line.setAttribute('x2', x + width);
            line.setAttribute('y2', lineY);
            line.setAttribute('stroke', '#fff');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '4,4');
            svg.appendChild(line);
        }
        
        gridLines.appendChild(svg);
    } catch (error) {
        debug('绘制网格线失败', error);
    }
}

// 切割并下载图片
async function cutImage() {
    if (!currentImage || !canvas.imageInfo) {
        debug('无法切割：图片或尺寸信息不存在');
        showToast('请先上传图片');
        return;
    }
    
    debug('开始切割图片', {
        imageInfo: canvas.imageInfo,
        rows,
        cols
    });

    showToast('正在处理...');
    
    try {
        // 使用原始图片尺寸进行切割
        const pieceWidth = currentImage.width / cols;
        const pieceHeight = currentImage.height / rows;
        
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = pieceWidth;
        tempCanvas.height = pieceHeight;
        
        const pieces = [];
        // 切割图片
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                tempCtx.clearRect(0, 0, pieceWidth, pieceHeight);
                tempCtx.drawImage(
                    currentImage,
                    col * pieceWidth,
                    row * pieceHeight,
                    pieceWidth,
                    pieceHeight,
                    0,
                    0,
                    pieceWidth,
                    pieceHeight
                );
                
                const piece = {
                    data: tempCanvas.toDataURL('image/png'),
                    name: `piece_${row + 1}_${col + 1}.png`
                };
                pieces.push(piece);
            }
        }
        
        debug('切割完成，开始打包下载', { piecesCount: pieces.length });
        
        // 创建并下载zip
        const zip = new JSZip();
        pieces.forEach(piece => {
            const data = piece.data.split(',')[1];
            zip.file(piece.name, data, {base64: true});
        });
        
        const content = await zip.generateAsync({type: 'blob'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'grid_pieces.zip';
        link.click();
        URL.revokeObjectURL(link.href);
        
        debug('下载完成');
        showToast('下载已开始');
    } catch (error) {
        debug('处理失败', error);
        showToast('处理失败，请重试');
    }
}

// 删除图片
function deleteImage() {
    debug('删除图片');
    currentImage = null;
    cutPieces = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gridLines.innerHTML = '';
    uploadArea.style.display = 'block';
    previewSection.style.display = 'none';
    cutImageBtn.disabled = true;
    fileInput.value = '';
}

// 更新UI状态
function updateUIState(hasImage) {
    previewSection.style.display = hasImage ? 'block' : 'none';
    uploadArea.style.display = hasImage ? 'none' : 'block';
    cutImageBtn.disabled = !hasImage;
    
    // 控制调整尺寸模块的禁用状态
    const sizePresetsGroup = document.getElementById('sizePresets');
    if (hasImage) {
        sizePresetsGroup.classList.remove('disabled');
        document.querySelectorAll('.size-preset').forEach(preset => {
            preset.classList.remove('disabled');
        });
    } else {
        sizePresetsGroup.classList.add('disabled');
        document.querySelectorAll('.size-preset').forEach(preset => {
            preset.classList.add('disabled');
        });
        customGridGroup.style.display = 'none';
    }
}

// 加载JSZip库
function loadJSZip() {
    debug('加载JSZip库');
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => {
            debug('JSZip库加载成功');
            resolve();
        };
        script.onerror = (error) => {
            debug('JSZip库加载失败', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// 初始化
async function init() {
    debug('初始化应用');
    try {
        await loadJSZip();
        initEventListeners();
        debug('初始化完成');
    } catch (error) {
        debug('初始化失败', error);
        showToast('加载必要组件失败');
    }
}

// 启动应用
init();