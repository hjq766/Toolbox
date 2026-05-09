// DOM元素变量
let containerWidth, desiredCols, rowCount, colGap, rowGap, gridPreview, planList;
let customGap, customSideMargin, exportImageBtn, gridSideMargin, recommendSection, manualSection;
let colCount;

// 当前状态
let currentView = 'recommend';
let currentDevice = 1920;
let isRealTimeUpdate = true;
let layoutPreference = 'balanced';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    containerWidth = document.getElementById('containerWidth');
    desiredCols = document.getElementById('desiredCols');
    rowCount = document.getElementById('rowCount');
    colGap = document.getElementById('colGap');
    rowGap = document.getElementById('rowGap');
    gridPreview = document.getElementById('gridPreview');
    planList = document.getElementById('planList');
    customGap = document.getElementById('customGap');
    customSideMargin = document.getElementById('customSideMargin');
    exportImageBtn = document.getElementById('exportImage');
    gridSideMargin = document.getElementById('gridSideMargin');
    recommendSection = document.getElementById('recommendSection');
    manualSection = document.getElementById('manualSection');
    colCount = desiredCols; // 别名

    // 初始化所有事件监听器
    initEventListeners();

    // 初始化界面
    init();
});

// 初始化事件监听器
function initEventListeners() {
    // 生成布局方案按钮
    const generatePlansBtn = document.getElementById('generatePlans');
    if (generatePlansBtn) {
        generatePlansBtn.addEventListener('click', () => {
            console.log('生成布局方案按钮被点击');
            // 使用新的智能布局生成函数
            const plans = window.generateSmartLayoutPlans ? window.generateSmartLayoutPlans() : generateLayoutPlans();
            console.log('生成的方案:', plans);
            displayPlans(plans);
        });
    }

    // Tab 切换按钮
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;

            // 更新按钮状态
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 切换视图
            currentView = view;
            switchView(view);
        });
    });

    // 移除设备选择功能（已改为使用容器宽度）

    // 移除旧的布局偏好设置事件监听器（已被新的布局偏好功能替代）

    // 网格设置相关事件监听
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const input = button.parentElement.querySelector('input');
            const value = parseInt(input.value);

            switch (action) {
                case 'decrease-cols':
                    if (value > 1) {
                        input.value = value - 1;
                        if (isRealTimeUpdate) updatePreview();
                    }
                    break;
                case 'increase-cols':
                    if (value < 36) {
                        input.value = value + 1;
                        if (isRealTimeUpdate) updatePreview();
                    }
                    break;
                case 'decrease-rows':
                    if (value > 1) {
                        input.value = value - 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
                case 'increase-rows':
                    if (value < 36) {
                        input.value = value + 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
                case 'decrease-margin':
                    if (value > 0) {
                        input.value = value - 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
                case 'increase-margin':
                    if (value < 100) {
                        input.value = value + 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
                case 'decrease-col-gap':
                    if (value > 0) {
                        input.value = value - 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
                case 'increase-col-gap':
                    if (value < 50) {
                        input.value = value + 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
                case 'decrease-row-gap':
                    if (value > 0) {
                        input.value = value - 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
                case 'increase-row-gap':
                    if (value < 50) {
                        input.value = value + 1;
                        if (currentView === 'manual' && isRealTimeUpdate) updateGridPreview();
                    }
                    break;
            }
        });
    });

    // 启用实时更新功能
    enableRealTimeUpdates();

    // 布局偏好功能
    initLayoutPreference();

    // 列数快捷选择功能
    initColQuickSelect();

    // 复制CSS代码功能
    document.getElementById('copyCSS').addEventListener('click', () => {
        const cols = parseInt(desiredCols.value);
        const gap = parseInt(colGap.value);
        const sideMargin = parseInt(gridSideMargin.value) || 0;
        const containerWidthValue = parseInt(containerWidth.value);

        const cssCode = `/* Grid Layout CSS */
.grid-container {
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    gap: ${gap}px;
    padding: 0 ${sideMargin}px;
    max-width: ${containerWidthValue}px;
    margin: 0 auto;
}

.grid-item {
    /* 网格项目样式 */
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
}`;

        navigator.clipboard.writeText(cssCode).then(() => {
            showToast('CSS代码已复制到剪贴板');
        }).catch(() => {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = cssCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('CSS代码已复制到剪贴板');
        });
    });

    // 导出预览图功能
    exportImageBtn.addEventListener('click', () => {
        // 使用容器宽度而不是设备宽度
        const containerWidthValue = parseInt(containerWidth.value);
        const sideMargin = parseInt(gridSideMargin.value) || 0;
        const cols = parseInt(colCount.value);
        const cGap = parseInt(colGap.value);
        const rGap = parseInt(rowGap.value);
        const rows = parseInt(rowCount.value);

        // 创建临时容器
        const container = document.createElement('div');
        container.style.cssText = `
            width: ${containerWidthValue}px;
            box-sizing: border-box;
            background: var(--bg-color);
            padding: 0;
            margin: 0;
            overflow: hidden;
            display: inline-block;
        `;

        // 克隆网格预览
        const gridClone = gridPreview.cloneNode(true);
        gridClone.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            grid-template-rows: repeat(${rows}, 60px);
            gap: ${rGap}px ${cGap}px;
            padding: 0 ${sideMargin}px;
            width: ${containerWidthValue}px;
            box-sizing: border-box;
            max-width: 100%;
            margin: 0;
        `;

        container.appendChild(gridClone);
        document.body.appendChild(container);

        const actualHeight = (rows * 60) + ((rows - 1) * rGap);

        html2canvas(container, {
            width: containerWidthValue,
            height: actualHeight,
            scale: 1,
            backgroundColor: null,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'grid-preview.png';
            link.href = canvas.toDataURL();
            link.click();
            document.body.removeChild(container);
            showToast('网格预览已导出');
        }).catch(error => {
            console.error('导出图片失败:', error);
            document.body.removeChild(container);
            showToast('导出失败，请重试');
        });
    });
}

// 实时更新功能
function enableRealTimeUpdates() {
    // 监听基础参数变化
    [containerWidth, desiredCols].forEach(input => {
        input.addEventListener('input', () => {
            if (isRealTimeUpdate) {
                updatePreview();
            }
        });
    });

    // 监听手动调整参数变化
    [rowCount, colGap, rowGap, gridSideMargin].forEach(input => {
        input.addEventListener('input', () => {
            if (currentView === 'manual' && isRealTimeUpdate) {
                updateGridPreview();
                updatePreviewInfo();
            }
            updateSliderDisplays();
        });
    });
}

// 切换视图函数
function switchView(view) {
    const exportSection = document.getElementById('exportSection');

    if (view === 'recommend') {
        recommendSection.style.display = 'block';
        manualSection.style.display = 'none';
        if (exportSection) exportSection.style.display = 'none';

        // 显示推荐视图，隐藏手动视图
        document.getElementById('recommendView').style.display = 'block';
        document.getElementById('manualView').style.display = 'none';

        if (isRealTimeUpdate) {
            const plans = generateLayoutPlans();
            displayPlans(plans);
        }
    } else {
        recommendSection.style.display = 'none';
        manualSection.style.display = 'block';
        if (exportSection) exportSection.style.display = 'block';

        // 显示手动视图，隐藏推荐视图
        document.getElementById('recommendView').style.display = 'none';
        document.getElementById('manualView').style.display = 'block';

        if (isRealTimeUpdate) {
            updateGridPreview();
        }
    }
}

// 统一的预览更新函数
function updatePreview() {
    if (currentView === 'recommend') {
        const plans = generateLayoutPlans();
        displayPlans(plans);
        document.getElementById('recommendView').style.display = 'block';
        document.getElementById('manualView').style.display = 'none';
    } else {
        updateGridPreview();
        document.getElementById('recommendView').style.display = 'none';
        document.getElementById('manualView').style.display = 'block';
    }
}

// 移除滑块显示值更新函数（已改为输入框样式，不需要额外显示）
function updateSliderDisplays() {
    // 不再需要更新滑块显示值，因为已经改为输入框样式
}

// 生成布局方案的逻辑（保留兼容性，但优先使用新的智能布局）
function generateLayoutPlans() {
    // 如果新的智能布局函数存在，优先使用
    if (window.generateSmartLayoutPlans) {
        return window.generateSmartLayoutPlans();
    }

    // 降级方案：生成默认的均衡布局
    const width = parseInt(containerWidth.value);
    const cols = parseInt(desiredCols.value);
    const plans = [];

    // 直接生成均衡布局方案（移除对已删除元素的引用）
    let tempPlans = [];

    switch (layoutPreference) {
        case 'compact':
            tempPlans = [
                createPlan('超紧凑布局', 8, width, cols, '适合信息密集的界面'),
                createPlan('紧凑网格布局', 10, width, cols, '平衡的紧凑设计'),
                createPlan('紧凑均衡布局', 12, width, cols, '紧凑中的舒适感'),
                createPlan('紧凑舒适布局', 14, width, cols, '紧凑但不拥挤'),
                createPlan('网格化布局', 16, width, cols, '标准的网格间距')
            ];
            break;
        case 'spacious':
            tempPlans = [
                createPlan('宽松基础布局', 24, width, cols, '舒适的阅读体验'),
                createPlan('宽松展示布局', 26, width, cols, '适合内容展示'),
                createPlan('宽松优雅布局', 28, width, cols, '优雅的视觉效果'),
                createPlan('大气布局', 30, width, cols, '大气的设计风格'),
                createPlan('画廊布局', 32, width, cols, '适合图片展示')
            ];
            break;
        default: // balanced
            tempPlans = [
                createPlan('标准网格布局', 16, width, cols, '经典的网格设计'),
                createPlan('改良网格布局', 18, width, cols, '优化的标准布局'),
                createPlan('中等间距布局', 20, width, cols, '平衡的视觉效果'),
                createPlan('舒适阅读布局', 22, width, cols, '适合内容阅读'),
                createPlan('优化展示布局', 24, width, cols, '展示效果优化')
            ];
    }

    // 计算并排序
    tempPlans.forEach(plan => {
        const totalWidth = plan.colWidth * cols + plan.gap * (cols - 1) + plan.sideMargin * 2;
        plan.widthDiff = Math.abs(totalWidth - width);
    });

    tempPlans.sort((a, b) => a.widthDiff - b.widthDiff);
    plans.push(...tempPlans.map(({ widthDiff, ...plan }) => plan));

    return plans;
}

// 创建布局方案
function createPlan(name, gap, width, cols, description) {
    const sideMargin = gap;
    const colWidth = Math.floor((width - (gap * (cols - 1)) - (sideMargin * 2)) / cols);

    return {
        name,
        gap,
        sideMargin,
        colWidth,
        description
    };
}

// 显示方案
function displayPlans(plans) {
    planList.innerHTML = plans.map((plan, index) => `
        <div class="plan-item">
            <div class="plan-header">
                <h3 class="plan-title">${plan.name}</h3>
                <div class="plan-actions">
                    <button class="btn btn-secondary" onclick="copySVG(${JSON.stringify(plan).replace(/"/g, '&quot;')})">
                        复制SVG
                    </button>
                    <button class="btn" onclick="applyPlan(${index}, ${JSON.stringify(plan).replace(/"/g, '&quot;')})">
                        应用方案
                    </button>
                </div>
            </div>
            
            <div class="plan-preview">
                <div class="plan-grid" style="
                    grid-template-columns: repeat(${desiredCols.value}, 1fr);
                    gap: ${plan.gap}px;
                ">
                    ${Array(parseInt(desiredCols.value)).fill('<div class="plan-cell"></div>').join('')}
                </div>
            </div>
            
            <div class="plan-info">
                <div class="info-item">
                    <span class="info-label">设备宽度</span>
                    <span class="info-value ${plan.totalWidth === parseInt(containerWidth.value) ? 'perfect-match' : ''}">${plan.totalWidth}px</span>
                </div>
                <div class="info-item">
                    <span class="info-label">列数</span>
                    <span class="info-value">${desiredCols.value}列</span>
                </div>
                <div class="info-item">
                    <span class="info-label">列宽</span>
                    <span class="info-value">${plan.colWidth}px</span>
                </div>
                <div class="info-item">
                    <span class="info-label">列间距</span>
                    <span class="info-value">${plan.gap}px</span>
                </div>
                <div class="info-item">
                    <span class="info-label">左右边距</span>
                    <span class="info-value">${plan.sideMargin}px</span>
                </div>
            </div>
            
            <div class="plan-description">${plan.description}</div>
        </div>
    `).join('');
}

// 应用方案 - 直接导出该方案的预览图
function applyPlan(index, plan) {
    // 检查html2canvas是否可用
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas库未加载，正在尝试重新加载...');
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = () => {
            console.log('html2canvas加载成功，重新执行导出...');
            exportPlanGrid(plan);
        };
        document.body.appendChild(script);
        return;
    }

    exportPlanGrid(plan);
}

// 导出方案网格预览图
function exportPlanGrid(plan) {
    const width = parseInt(containerWidth.value);

    const tempContainer = document.createElement('div');
    tempContainer.style.width = `${width}px`;
    tempContainer.style.background = 'var(--bg-color)';
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.padding = '20px';

    const gridContainer = document.createElement('div');
    gridContainer.style.width = '100%';
    gridContainer.style.display = 'flex';
    gridContainer.style.justifyContent = 'center';

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${desiredCols.value}, ${plan.colWidth}px)`;
    grid.style.gap = `${plan.gap}px`;
    grid.style.height = '200px';
    grid.style.margin = `0 ${plan.sideMargin}px`;

    // 添加网格单元格
    for (let i = 0; i < desiredCols.value; i++) {
        const cell = document.createElement('div');
        cell.style.background = 'var(--primary-color-10)';
        cell.style.border = '1px solid var(--primary-color)';
        cell.style.borderRadius = '4px';
        cell.style.height = '100%';
        grid.appendChild(cell);
    }

    gridContainer.appendChild(grid);
    tempContainer.appendChild(gridContainer);
    document.body.appendChild(tempContainer);

    html2canvas(tempContainer, {
        width: width,
        height: 240,
        scale: 1,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `grid-layout-${desiredCols.value}cols-${plan.gap}gap.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        document.body.removeChild(tempContainer);
        showToast('布局方案已导出');
    }).catch(error => {
        console.error('导出图片失败:', error);
        document.body.removeChild(tempContainer);
        showToast('导出失败，请重试');
    });
}

// 更新网格预览
function updateGridPreview() {
    const cols = parseInt(colCount.value);
    const rows = parseInt(rowCount.value);
    const cGap = parseInt(colGap.value);
    const rGap = parseInt(rowGap.value);
    const sideMargin = parseInt(gridSideMargin.value) || 0;

    gridPreview.style.display = 'grid';
    gridPreview.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridPreview.style.gridTemplateRows = `repeat(${rows}, 60px)`;
    gridPreview.style.gap = `${rGap}px ${cGap}px`;
    gridPreview.style.padding = `20px ${sideMargin}px`;
    gridPreview.style.setProperty('--side-margin', `${sideMargin}px`);

    gridPreview.innerHTML = Array(cols * rows).fill('')
        .map(() => '<div class="grid-cell"></div>')
        .join('');

    updatePreviewInfo();
}

// 更新预览信息
function updatePreviewInfo() {
    // 使用容器宽度而不是设备宽度
    const containerWidthValue = parseInt(containerWidth.value);
    const sideMargin = parseInt(gridSideMargin.value) || 0;
    const cols = parseInt(colCount.value);
    const gap = parseInt(colGap.value);

    const totalGapWidth = gap * (cols - 1);
    const totalMarginWidth = sideMargin * 2;
    const availableWidth = containerWidthValue - totalGapWidth - totalMarginWidth;
    const colWidth = Math.max(0, Math.floor(availableWidth / cols));

    // 更新显示信息，使用容器宽度
    const containerWidthElement = document.getElementById('previewContainerWidth');
    const currentContainerInfo = document.getElementById('currentContainerInfo');

    if (containerWidthElement) {
        containerWidthElement.textContent = `${containerWidthValue}px`;
    }
    if (currentContainerInfo) {
        currentContainerInfo.textContent = `${containerWidthValue}px 容器`;
    }

    document.getElementById('previewColCount').textContent = `${cols}列`;
    document.getElementById('previewColWidth').textContent = `${colWidth}px`;
    document.getElementById('previewColGap').textContent = `${gap}px`;
    document.getElementById('previewRowGap').textContent = `${parseInt(rowGap.value)}px`;
    document.getElementById('previewSideMargin').textContent = `${sideMargin}px`;
}

// 初始化
function init() {
    // 确保初始状态正确显示
    const recommendView = document.getElementById('recommendView');
    const manualView = document.getElementById('manualView');
    const deviceSection = document.getElementById('deviceSection');

    // 默认显示智能推荐视图
    if (recommendView) recommendView.style.display = 'block';
    if (manualView) manualView.style.display = 'none';
    if (deviceSection) deviceSection.style.display = 'none';

    // 初始化网格预览
    updateGridPreview();

    // 生成并显示布局方案
    const plans = generateLayoutPlans();
    displayPlans(plans);

    // 更新滑块显示值
    updateSliderDisplays();

    console.log('Grid工具初始化完成');
}

// 移除不再需要的列数选择器函数（已改回原来的输入框样式）

// 初始化布局偏好功能
function initLayoutPreference() {
    // 边距偏好选择
    let marginPreference = 'auto'; // '0', 'auto', 'custom'
    let spacingStyle = 'balanced'; // 'compact', 'balanced', 'spacious'

    // 边距偏好按钮事件监听
    document.querySelectorAll('.margin-option').forEach(option => {
        option.addEventListener('click', () => {
            // 更新选中状态
            document.querySelectorAll('.margin-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // 更新边距偏好
            marginPreference = option.dataset.margin;

            // 显示/隐藏自定义选项
            const customOptions = document.getElementById('customOptions');
            const spacingStyleGroup = document.querySelector('.spacing-style').parentElement;

            if (marginPreference === 'custom') {
                customOptions.style.display = 'block';
                spacingStyleGroup.style.display = 'none';
            } else {
                customOptions.style.display = 'none';
                spacingStyleGroup.style.display = 'block';
            }

            // 实时更新预览
            if (isRealTimeUpdate) {
                const plans = generateSmartLayoutPlans();
                displayPlans(plans);
            }
        });
    });

    // 间距风格按钮事件监听
    document.querySelectorAll('.style-option').forEach(option => {
        option.addEventListener('click', () => {
            // 更新选中状态
            document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // 更新间距风格
            spacingStyle = option.dataset.style;

            // 实时更新预览
            if (isRealTimeUpdate && marginPreference !== 'custom') {
                const plans = generateSmartLayoutPlans();
                displayPlans(plans);
            }
        });
    });

    // 自定义输入变化监听
    [customGap, customSideMargin].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                if (marginPreference === 'custom' && isRealTimeUpdate) {
                    const plans = generateSmartLayoutPlans();
                    displayPlans(plans);
                }
            });
        }
    });

    // 重写生成布局方案函数
    window.generateSmartLayoutPlans = function () {
        const width = parseInt(containerWidth.value);
        const cols = parseInt(desiredCols.value);
        const plans = [];

        if (marginPreference === 'custom') {
            // 自定义模式
            const gap = parseInt(customGap.value) || 16;
            const sideMargin = parseInt(customSideMargin.value) || 0;
            const colWidth = Math.floor((width - (gap * (cols - 1)) - (sideMargin * 2)) / cols);
            const totalWidth = colWidth * cols + gap * (cols - 1) + sideMargin * 2;
            const widthDiff = Math.abs(totalWidth - width);

            plans.push({
                name: '自定义布局',
                gap: gap,
                sideMargin: sideMargin,
                colWidth: colWidth,
                totalWidth: totalWidth,
                widthDiff: widthDiff,
                description: `使用 ${gap}px 的列间距和 ${sideMargin}px 的左右边距，总宽度 ${totalWidth}px`
            });
        } else {
            // 智能推荐模式
            let gapRange, baseMargin;

            // 根据间距风格确定间距范围
            switch (spacingStyle) {
                case 'compact':
                    gapRange = [8, 10, 12];
                    break;
                case 'spacious':
                    gapRange = [28, 30, 32];
                    break;
                default: // balanced
                    gapRange = [16, 18, 20, 22, 24];
            }

            // 根据边距偏好确定基础边距
            baseMargin = marginPreference === '0' ? 0 : null;

            // 生成方案 - 为每个间距生成多个边距选项
            gapRange.forEach((gap, gapIndex) => {
                let marginOptions = [];

                if (marginPreference === '0') {
                    // 无边距模式
                    marginOptions = [0];
                } else {
                    // 有边距模式 - 提供多种边距选项
                    switch (spacingStyle) {
                        case 'compact':
                            marginOptions = [16, 20, 24]; // 紧凑风格的边距选项
                            break;
                        case 'spacious':
                            marginOptions = [32, 40, 48]; // 宽松风格的边距选项
                            break;
                        default: // balanced
                            marginOptions = [20, 24, 32]; // 均衡风格的边距选项
                    }
                }

                marginOptions.forEach((sideMargin, marginIndex) => {
                    const colWidth = Math.floor((width - (gap * (cols - 1)) - (sideMargin * 2)) / cols);

                    // 检查是否能达到设备宽度（允许小幅偏差）
                    const totalWidth = colWidth * cols + gap * (cols - 1) + sideMargin * 2;
                    const widthDiff = Math.abs(totalWidth - width);

                    let name, description;
                    if (marginPreference === '0') {
                        name = `无边距${spacingStyle === 'compact' ? '紧凑' : spacingStyle === 'spacious' ? '宽松' : '均衡'}布局`;
                        description = `满屏布局，${gap}px 列间距，适合最大化内容展示`;
                    } else {
                        const styleText = spacingStyle === 'compact' ? '紧凑' : spacingStyle === 'spacious' ? '宽松' : '均衡';
                        name = `${styleText}布局 (${gap}px间距/${sideMargin}px边距)`;

                        // 当总宽度等于容器宽度时，用主色高亮显示
                        const widthText = totalWidth === width
                            ? `<span style="color: var(--primary-color); font-weight: 600;">${totalWidth}px</span>`
                            : `${totalWidth}px`;

                        description = `${gap}px 列间距，${sideMargin}px 边距，总宽度 ${widthText}`;
                    }

                    plans.push({
                        name,
                        gap,
                        sideMargin,
                        colWidth,
                        description,
                        totalWidth,
                        widthDiff
                    });
                });
            });

            // 智能排序：优先显示能完美适配的方案
            plans.sort((a, b) => {
                // 首先按宽度差异排序（完美适配的在前）
                if (a.widthDiff !== b.widthDiff) {
                    return a.widthDiff - b.widthDiff;
                }
                // 宽度差异相同时，按列宽大小排序（列宽大的在前）
                return b.colWidth - a.colWidth;
            });

            // 限制方案数量，避免过多选项
            if (plans.length > 8) {
                plans.splice(8);
            }
        }

        return plans;
    };
}

// 初始化列数快捷选择功能
function initColQuickSelect() {
    // 列数快捷按钮事件监听
    document.querySelectorAll('.col-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cols = parseInt(btn.dataset.cols);

            // 更新选中状态
            document.querySelectorAll('.col-quick-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 更新输入框值
            desiredCols.value = cols;

            // 实时更新预览
            if (isRealTimeUpdate) {
                updatePreview();
            }
        });
    });

    // 监听输入框变化，同步更新快捷按钮状态
    desiredCols.addEventListener('input', () => {
        const currentCols = parseInt(desiredCols.value);

        // 更新快捷按钮状态
        document.querySelectorAll('.col-quick-btn').forEach(btn => {
            const btnCols = parseInt(btn.dataset.cols);
            if (btnCols === currentCols) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });

    // 监听加减按钮，同步更新快捷按钮状态
    document.querySelectorAll('[data-action="decrease-cols"], [data-action="increase-cols"]').forEach(btn => {
        btn.addEventListener('click', () => {
            // 延迟执行，确保输入框值已更新
            setTimeout(() => {
                const currentCols = parseInt(desiredCols.value);

                // 更新快捷按钮状态
                document.querySelectorAll('.col-quick-btn').forEach(quickBtn => {
                    const btnCols = parseInt(quickBtn.dataset.cols);
                    if (btnCols === currentCols) {
                        quickBtn.classList.add('active');
                    } else {
                        quickBtn.classList.remove('active');
                    }
                });
            }, 10);
        });
    });
}

// 复制SVG到剪贴板
function copySVG(plan) {
    const width = parseInt(containerWidth.value);
    const cols = parseInt(desiredCols.value);
    const svgHeight = 240; // SVG高度
    const cellHeight = 120; // 单元格高度
    const topMargin = 40; // 顶部边距

    // 计算实际的列宽（使用plan中的colWidth）
    const cellWidth = plan.colWidth;

    // 生成SVG内容 - 优化为更适合Figma的格式
    let svgContent = `<svg width="${width}" height="${svgHeight}" viewBox="0 0 ${width} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .grid-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; fill: #1a1a1a; }
      .grid-cell { fill: #f0f9ff; stroke: #0ea5e9; stroke-width: 1.5; }
      .margin-area { fill: #fef3c7; fill-opacity: 0.6; stroke: #f59e0b; stroke-width: 1; stroke-dasharray: 3,3; }
      .dimension-line { stroke: #6b7280; stroke-width: 1; }
      .dimension-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; fill: #6b7280; }
      .gap-line { stroke: #ef4444; stroke-width: 1; }
      .gap-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; fill: #ef4444; }
      .cell-number { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; fill: #0369a1; font-weight: 500; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${svgHeight}" fill="#ffffff" stroke="#e5e7eb" stroke-width="1" rx="8"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" class="grid-title">${plan.name}</text>`;

    // 添加边距可视化
    if (plan.sideMargin > 0) {
        svgContent += `
  
  <!-- Side margins -->
  <rect x="8" y="${topMargin}" width="${plan.sideMargin - 8}" height="${cellHeight}" class="margin-area"/>
  <rect x="${width - plan.sideMargin}" y="${topMargin}" width="${plan.sideMargin - 8}" height="${cellHeight}" class="margin-area"/>`;
    }

    svgContent += `
  
  <!-- Grid cells -->`;

    // 生成网格单元格
    for (let i = 0; i < cols; i++) {
        const x = plan.sideMargin + i * (cellWidth + plan.gap);
        svgContent += `
  <rect x="${x}" y="${topMargin}" width="${cellWidth}" height="${cellHeight}" class="grid-cell" rx="6"/>
  <text x="${x + cellWidth / 2}" y="${topMargin + cellHeight / 2 + 4}" text-anchor="middle" class="cell-number">${i + 1}</text>`;
    }

    // 添加尺寸标注
    const annotationY = topMargin + cellHeight + 20;

    svgContent += `
  
  <!-- Annotations -->
  <!-- Column width -->
  <line x1="${plan.sideMargin}" y1="${annotationY}" x2="${plan.sideMargin + cellWidth}" y2="${annotationY}" class="dimension-line"/>
  <text x="${plan.sideMargin + cellWidth / 2}" y="${annotationY + 15}" text-anchor="middle" class="dimension-text">${cellWidth}px</text>`;

    if (plan.gap > 0 && cols > 1) {
        svgContent += `
  <!-- Gap -->
  <line x1="${plan.sideMargin + cellWidth + 2}" y1="${annotationY + 10}" x2="${plan.sideMargin + cellWidth + plan.gap - 2}" y2="${annotationY + 10}" class="gap-line"/>
  <text x="${plan.sideMargin + cellWidth + plan.gap / 2}" y="${annotationY + 25}" text-anchor="middle" class="gap-text">${plan.gap}px gap</text>`;
    }

    if (plan.sideMargin > 0) {
        svgContent += `
  <!-- Side margin -->
  <line x1="8" y1="${topMargin - 10}" x2="${plan.sideMargin}" y2="${topMargin - 10}" class="dimension-line"/>
  <text x="${(8 + plan.sideMargin) / 2}" y="${topMargin - 15}" text-anchor="middle" class="dimension-text">${plan.sideMargin}px</text>`;
    }

    // 添加规格信息
    svgContent += `
  
  <!-- Specifications -->
  <text x="16" y="${svgHeight - 20}" class="dimension-text">容器: ${width}px | 列数: ${cols} | 列宽: ${cellWidth}px | 间距: ${plan.gap}px | 边距: ${plan.sideMargin}px</text>
  
</svg>`;

    // 复制到剪贴板
    navigator.clipboard.writeText(svgContent).then(() => {
        showToast('SVG已复制到剪贴板，可直接粘贴到Figma');
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = svgContent;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showToast('SVG已复制到剪贴板，可直接粘贴到Figma');
        } catch (err) {
            console.error('复制失败:', err);
            showToast('复制失败，请手动复制');

            // 显示SVG内容供手动复制
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 80%;
                max-height: 80%;
                overflow: auto;
            `;

            content.innerHTML = `
                <h3>SVG代码</h3>
                <textarea style="width: 100%; height: 300px; font-family: monospace; font-size: 12px;">${svgContent}</textarea>
                <div style="margin-top: 10px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
                </div>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);
        }

        document.body.removeChild(textArea);
    });
}

// 显示提示消息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 100);
}