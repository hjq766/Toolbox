// 获取DOM元素
const containerWidth = document.getElementById('containerWidth');
const desiredCols = document.getElementById('desiredCols');
const colCount = document.getElementById('colCount');
const rowCount = document.getElementById('rowCount');
const colGap = document.getElementById('colGap');
const rowGap = document.getElementById('rowGap');
const gridPreview = document.getElementById('gridPreview');
const cssCode = document.getElementById('cssCode');
const planList = document.getElementById('planList');
const customGap = document.getElementById('customGap');
const customSideMargin = document.getElementById('customSideMargin');
const exportImageBtn = document.getElementById('exportImage');
const gridSettingsSection = document.querySelector('.panel-section:nth-child(2)');
const cellSettingsSection = document.querySelector('.panel-section:nth-child(3)');
const gridSideMargin = document.getElementById('gridSideMargin');
const recommendSection = document.querySelector('.panel-section:nth-child(1)');

// 布局偏好设置
let layoutPreference = 'balanced';
document.querySelectorAll('[data-type]').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('[data-type]').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        layoutPreference = option.dataset.type;
        // 切换布局偏好时自动生成
        const plans = generateLayoutPlans();
        displayPlans(plans);
    });
});

// 生成布局方案
document.getElementById('generatePlans').addEventListener('click', () => {
    const plans = generateLayoutPlans();
    displayPlans(plans);
});

// 布局模式切换
const preferenceMode = document.getElementById('preferenceMode');
const customMode = document.getElementById('customMode');
const preferenceOptions = document.getElementById('preferenceOptions');
const customGapInput = document.getElementById('customGapInput');
const customSideMarginInput = document.getElementById('customSideMarginInput');

// 监听模式切换
preferenceMode.addEventListener('change', () => {
    if (preferenceMode.checked) {
        preferenceOptions.style.display = 'block';
        customGapInput.style.display = 'none';
        customSideMarginInput.style.display = 'none';
        // 切换回布局偏好模式时，自动生成当前选中偏好的布局方案
        const plans = generateLayoutPlans();
        displayPlans(plans);
    }
});

customMode.addEventListener('change', () => {
    if (customMode.checked) {
        preferenceOptions.style.display = 'none';
        customGapInput.style.display = 'block';
        customSideMarginInput.style.display = 'block';
        // 切换到自定义模式时不自动生成，等用户调整完参数后手动生成
    }
});

// 修改生成布局方案的逻辑
function generateLayoutPlans() {
    const width = parseInt(containerWidth.value);
    const cols = parseInt(desiredCols.value);
    const plans = [];
    
    const isCustomMode = document.getElementById('customMode').checked;
    
    if (isCustomMode) {
        const gap = parseInt(customGap.value);
        const sideMargin = parseInt(customSideMargin.value);
        const colWidth = Math.floor((width - (gap * (cols - 1)) - (sideMargin * 2)) / cols);
        
        plans.push({
            name: '自定义布局',
            gap: gap,
            sideMargin: sideMargin,
            colWidth: colWidth,
            description: `使用 ${gap}px 的列间距和 ${sideMargin}px 的左右边距，根据您的具体需求调整。`
        });
    } else {
        // 创建临时数组存储所有方案
        let tempPlans = [];
        
        switch(layoutPreference) {
            case 'compact':
                tempPlans = [
                    createPlan('超紧凑布局', 8, width, cols, ' '),
                    createPlan('紧凑网格布局', 10, width, cols, ' '),
                    createPlan('紧凑均衡布局', 12, width, cols, ' '),
                    createPlan('紧凑舒适布局', 14, width, cols, ' '),
                    createPlan('网格化布局', 16, width, cols, ' ')
                ];
                break;
            case 'spacious':
                tempPlans = [
                    createPlan('宽松基础布局', 24, width, cols, ' '),
                    createPlan('宽松展示布局', 26, width, cols, ' '),
                    createPlan('宽松优雅布局', 28, width, cols, ' '),
                    createPlan('大气布局', 30, width, cols, ' '),
                    createPlan('画廊布局', 32, width, cols, ' ')
                ];
                break;
            default: // balanced
                tempPlans = [
                    createPlan('标准网格布局', 16, width, cols, ' '),
                    createPlan('改良网格布局', 18, width, cols, ' '),
                    createPlan('中等间距布局', 20, width, cols, ' '),
                    createPlan('舒适阅读布局', 22, width, cols, ' '),
                    createPlan('优化展示布局', 24, width, cols, ' ')
                ];
        }
        
        // 计算每个方案的总宽度与目标宽度的差值
        tempPlans.forEach(plan => {
            const totalWidth = plan.colWidth * cols + plan.gap * (cols - 1) + plan.sideMargin * 2;
            plan.widthDiff = Math.abs(totalWidth - width);
        });
        
        // 根据宽度差值排序
        tempPlans.sort((a, b) => a.widthDiff - b.widthDiff);
        
        // 移除临时的widthDiff属性并添加到最终方案中
        plans.push(...tempPlans.map(({ widthDiff, ...plan }) => plan));
    }
    
    return plans;
}

// 辅助函数：创建布局方案
function createPlan(name, gap, width, cols, description) {
    const sideMargin = gap; // 边距等于间距
    const colWidth = Math.floor((width - (gap * (cols - 1)) - (sideMargin * 2)) / cols);
    
    return {
        name,
        gap,
        sideMargin,
        colWidth,
        description
    };
}

function displayPlans(plans) {
    const planList = document.getElementById('planList');
    planList.innerHTML = plans.map((plan, index) => `
        <div class="plan-item">
            <div class="plan-header">
                <h3 class="plan-title">
                    <span class="iconify" data-icon="tabler:layout-grid"></span>
                    ${plan.name}
                </h3>
                <div class="plan-actions">
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
                    <span class="info-value">${plan.colWidth * desiredCols.value + plan.gap * (desiredCols.value - 1) + plan.sideMargin * 2}px</span>
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

// 添加预览功能
function previewPlan(plan) {
    // 在网格预览标签页中展示当前方案
    document.querySelector('[data-tab="preview"]').click();
    applyPlan(plan);
}

function generatePlanPreview(plan) {
    // 生成小型预览网格的HTML
    return `<div class="grid-preview" style="display: grid; ${plan.css}">
        ${Array(6).fill('<div class="preview-cell"></div>').join('')}
    </div>`;
}

function applyPlan(index, plan) {
    // 检查html2canvas是否可用
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas库未加载，正在尝试重新加载...');
        // 动态加载html2canvas
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = () => {
            console.log('html2canvas加载成功，重新执行导出...');
            exportGrid(plan);
        };
        document.body.appendChild(script);
        return;
    }
    
    exportGrid(plan);
}

// 将导出逻辑单独提取出来
function exportGrid(plan) {
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
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `grid-layout-${desiredCols.value}cols-${plan.gap}gap.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        document.body.removeChild(tempContainer);
    }).catch(error => {
        console.error('导出图片失败:', error);
        document.body.removeChild(tempContainer);
    });
    
    colGap.value = plan.gap;
    rowGap.value = plan.gap;
    updateGridPreview();
}

// 网格设置相关事件监听
document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const input = button.parentElement.querySelector('input');
        const value = parseInt(input.value);
        
        switch(action) {
            case 'decrease-cols':
                if (value > 1) input.value = value - 1;
                break;
            case 'increase-cols':
                if (value < 36) input.value = value + 1;
                break;
            case 'decrease-rows':
                if (value > 1) input.value = value - 1;
                break;
            case 'increase-rows':
                if (value < 36) input.value = value + 1;
                break;
            case 'decrease-col-span':
                if (value > 1) input.value = value - 1;
                break;
            case 'increase-col-span':
                if (value < parseInt(colCount.value)) input.value = value + 1;
                break;
            case 'decrease-row-span':
                if (value > 1) input.value = value - 1;
                break;
            case 'increase-row-span':
                if (value < parseInt(rowCount.value)) input.value = value + 1;
                break;
        }
        updateGridPreview();
    });
});

// 监听输入变化
[colCount, rowCount, colGap, rowGap].forEach(input => {
    input.addEventListener('input', updateGridPreview);
});

// 更新网格预览
function updateGridPreview() {
    const cols = parseInt(colCount.value);
    const rows = parseInt(rowCount.value);
    const cGap = parseInt(colGap.value);
    const rGap = parseInt(rowGap.value);
    const sideMargin = parseInt(gridSideMargin.value) || 0;
    
    // 设置网格容器样式
    gridPreview.style.display = 'grid';
    gridPreview.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridPreview.style.gridTemplateRows = `repeat(${rows}, 60px)`;
    gridPreview.style.gap = `${rGap}px ${cGap}px`;
    gridPreview.style.padding = `20px ${sideMargin}px`;
    gridPreview.style.setProperty('--side-margin', `${sideMargin}px`);
    
    // 生成网格单元格
    gridPreview.innerHTML = Array(cols * rows).fill('')
        .map(() => '<div class="grid-cell"></div>')
        .join('');
    
    updatePreviewInfo();
}



// 添加标签页切换功能
document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const isRecommendTab = tab.dataset.tab === 'recommend';
        
        // 切换标签页激活状态
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 切换内容显示
        const tabId = tab.dataset.tab;
        document.querySelectorAll('.preview-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`.preview-content[data-tab="${tabId}"]`).classList.add('active');
        
        // 控制智能布局推荐模块的显示与隐藏
        const recommendSection = document.getElementById('recommendSection');
        const gridSettingsSection = document.getElementById('gridSettingsSection');
        
        if (tabId === 'preview') {
            recommendSection.style.display = 'none'; // 隐藏智能布局推荐模块
            gridSettingsSection.style.display = 'block'; // 显示网格设置模块
        } else {
            recommendSection.style.display = 'block'; // 显示智能布局推荐模块
            gridSettingsSection.style.display = 'none'; // 隐藏网格设置模块
            
            // 启用智能布局推荐模块的输入元素
            recommendSection.querySelectorAll('input, button').forEach(el => {
                el.disabled = false; // 启用输入元素
            });
        }
    });
});

// 修改设备切换逻辑
document.querySelectorAll('.device-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.device-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        const width = card.dataset.width;
        
        // 更新预览容器宽度
        gridPreview.style.maxWidth = `${width}px`;
        
        // 更新预览信息
        document.getElementById('previewDeviceWidth').textContent = `${width}px`;
        updatePreviewInfo();
    });
});

// 修改导出预览图功能
document.getElementById('exportImage').addEventListener('click', () => {
    const activeCard = document.querySelector('.device-card.active');
    const deviceWidth = parseInt(activeCard ? activeCard.dataset.width : '1920');
    const sideMargin = parseInt(gridSideMargin.value) || 0;
    const cols = parseInt(colCount.value);
    const cGap = parseInt(colGap.value);
    const rGap = parseInt(rowGap.value);
    const rows = parseInt(rowCount.value);
    
    // 创建临时容器以包含边距
    const container = document.createElement('div');
    container.style.cssText = `
        width: ${deviceWidth}px;
        box-sizing: border-box;
        background: var(--bg-color);
        padding: 0;
        margin: 0;
        overflow: hidden;
        display: inline-block;
    `;
    
    // 克隆网格预览并设置样式
    const gridClone = gridPreview.cloneNode(true);
    gridClone.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${cols}, 1fr);
        grid-template-rows: repeat(${rows}, 60px);
        gap: ${rGap}px ${cGap}px;
        padding: 0 ${sideMargin}px;
        width: ${deviceWidth}px;
        box-sizing: border-box;
        max-width: 100%;
        margin: 0;
    `;
    
    // 确保网格单元格样式正确
    gridClone.querySelectorAll('.grid-cell').forEach(cell => {
        cell.style.cssText = `
            background: var(--primary-color-10);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            min-height: 60px;
            margin: 0;
            box-sizing: border-box;
        `;
    });
    
    container.appendChild(gridClone);
    document.body.appendChild(container);
    
    // 计算实际需要的高度
    const actualHeight = (rows * 60) + ((rows - 1) * rGap);
    
    const options = {
        width: deviceWidth,
        height: actualHeight,
        scale: 1,
        backgroundColor: null,
        useCORS: true,
        removeContainer: true
    };
    
    html2canvas(container, options).then(canvas => {
        const link = document.createElement('a');
        link.download = 'grid-preview.png';
        link.href = canvas.toDataURL();
        link.click();
        document.body.removeChild(container);
    });
});

// 初始化
function init() {
    updateGridPreview();
    // 页面加载时自动生成均衡模式的布局方案
    const plans = generateLayoutPlans();
    displayPlans(plans);
    
    // 确保智能推荐布局模块的输入元素是可用的
    const recommendSection = document.getElementById('recommendSection');
    recommendSection.querySelectorAll('input, button').forEach(el => {
        el.disabled = false; // 启用输入元素
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    // 隐藏网格设置模块
    document.querySelector('#gridSettingsSection').style.display = 'none';
});

// 辅助函数：显示提示消息
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

// 监听自定义间距变化
customGap.addEventListener('input', () => {
    // 如果输入了自定义间距，禁用布局偏好选择
    const hasCustomGap = customGap.value !== '';
    document.querySelectorAll('.grid-option').forEach(option => {
        option.style.opacity = hasCustomGap ? '0.5' : '1';
        option.style.pointerEvents = hasCustomGap ? 'none' : 'auto';
    });
});

// 监听标签页切换
document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const isRecommendTab = tab.dataset.tab === 'recommend';
        
        // 控制导出按钮显示
        exportImageBtn.style.display = isRecommendTab ? 'none' : 'block';
        
        // 控制设置区域状态
        const sections = [gridSettingsSection, cellSettingsSection];
        sections.forEach(section => {
            if (section) {
                // 不再禁用所有输入元素
                section.querySelectorAll('input, button').forEach(el => {
                    el.disabled = false; // 始终启用
                });
                // 添加视觉反馈
                section.style.opacity = '1'; // 始终可见
                section.style.pointerEvents = 'auto'; // 始终可用
            }
        });
    });
});

// 初始化状态（因为默认是推荐标签页）
if (document.querySelector('.form-tab[data-tab="recommend"]').classList.contains('active')) {
    exportImageBtn.style.display = 'none';
    [gridSettingsSection, cellSettingsSection].forEach(section => {
        if (section) {
            section.querySelectorAll('input, button').forEach(el => el.disabled = false); // 启用输入元素
            section.style.opacity = '1'; // 始终可见
            section.style.pointerEvents = 'auto'; // 始终可用
        }
    });
}

// 添加更新预览信息的函数
function updatePreviewInfo() {
    const activeCard = document.querySelector('.device-card.active');
    const deviceWidth = parseInt(activeCard ? activeCard.dataset.width : '1920');
    const sideMargin = parseInt(gridSideMargin.value) || 0;
    const cols = parseInt(colCount.value);
    const gap = parseInt(colGap.value);
    
    // 计算列宽
    const totalGapWidth = gap * (cols - 1);
    const totalMarginWidth = sideMargin * 2;
    const availableWidth = deviceWidth - totalGapWidth - totalMarginWidth;
    
    // 确保列宽不小于 0
    const colWidth = Math.max(0, Math.floor(availableWidth / cols));
    
    // 更新显示信息
    document.getElementById('previewDeviceWidth').textContent = `${deviceWidth}px`;
    document.getElementById('previewColCount').textContent = `${cols}列`;
    document.getElementById('previewColWidth').textContent = `${colWidth}px`;
    document.getElementById('previewColGap').textContent = `${gap}px`;
    document.getElementById('previewSideMargin').textContent = `${sideMargin}px`;
}

// 确保在左右边距变化时也更新预览信息
[colCount, rowCount, colGap, gridSideMargin].forEach(input => {
    input.addEventListener('input', updatePreviewInfo);
});

// 添加边距控制
document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'decrease-margin' || action === 'increase-margin') {
            const input = document.getElementById('gridSideMargin');
            const value = parseInt(input.value) || 0;
            
            if (action === 'decrease-margin') {
                input.value = Math.max(0, value - 1);
            } else if (action === 'increase-margin') {
                input.value = Math.min(100, value + 1);
            }
            
            updateGridPreview();
        }
    });
});

// 监听左右边距输入变化
gridSideMargin.addEventListener('input', updateGridPreview);

// 容器宽度和期望列数的变化保持手动生成
[containerWidth, desiredCols].forEach(input => {
    input.addEventListener('input', () => {
        // 这里不自动生成，保留手动生成按钮的控制
    });
});

// 监听列间距滑块变化
const colGapInput = document.getElementById('colGap');
const colGapDisplay = document.querySelector('.col-gap-display'); // 确保选择正确的显示元素

colGapInput.addEventListener('input', () => {
    colGapDisplay.textContent = `${colGapInput.value}px`; // 更新显示的数值
});

// 监听行间距滑块变化
const rowGapInput = document.getElementById('rowGap');
const rowGapDisplay = document.querySelector('.row-gap-display'); // 确保选择正确的显示元素

rowGapInput.addEventListener('input', () => {
    rowGapDisplay.textContent = `${rowGapInput.value}px`; // 更新显示的数值
});


