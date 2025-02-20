// 获取DOM元素
const containerWidth = document.getElementById('containerWidth');
const desiredCols = document.getElementById('desiredCols');
const colCount = document.getElementById('colCount');
const rowCount = document.getElementById('rowCount');
const colGap = document.getElementById('colGap');
const rowGap = document.getElementById('rowGap');
const colSpan = document.getElementById('colSpan');
const rowSpan = document.getElementById('rowSpan');
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

// 当前选中的单元格
let selectedCell = null;

// 布局偏好设置
let layoutPreference = 'balanced';
document.querySelectorAll('[data-type]').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('[data-type]').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        layoutPreference = option.dataset.type;
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
    }
});

customMode.addEventListener('change', () => {
    if (customMode.checked) {
        preferenceOptions.style.display = 'none';
        customGapInput.style.display = 'block';
        customSideMarginInput.style.display = 'block';
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
        switch(layoutPreference) {
            case 'compact':
                plans.push(
                    {
                        name: '超紧凑布局',
                        gap: 8,
                        sideMargin: 8,
                        colWidth: Math.floor((width - (8 * (cols - 1)) - (8 * 2)) / cols),
                        description: '最小化间距，最大化内容区域，适合数据密集型页面。'
                    },
                    {
                        name: '紧凑网格布局',
                        gap: 10,
                        sideMargin: 10,
                        colWidth: Math.floor((width - (10 * (cols - 1)) - (10 * 2)) / cols),
                        description: '稍大的间距提供更好的内容区分度，保持紧凑。'
                    },
                    {
                        name: '紧凑均衡布局',
                        gap: 12,
                        sideMargin: 12,
                        colWidth: Math.floor((width - (12 * (cols - 1)) - (12 * 2)) / cols),
                        description: '中等间距配合紧凑的列宽，适合信息密集的页面布局。'
                    },
                    {
                        name: '紧凑舒适布局',
                        gap: 14,
                        sideMargin: 14,
                        colWidth: Math.floor((width - (14 * (cols - 1)) - (14 * 2)) / cols),
                        description: '较为舒适的间距，同时保持紧凑的整体感。'
                    },
                    {
                        name: '网格化布局',
                        gap: 16,
                        sideMargin: 16,
                        colWidth: Math.floor((width - (16 * (cols - 1)) - (16 * 2)) / cols),
                        description: '最大化的紧凑间距，提供清晰的网格感。'
                    }
                );
                break;
            case 'spacious':
                plans.push(
                    {
                        name: '宽松基础布局',
                        gap: 24,
                        sideMargin: 24,
                        colWidth: Math.floor((width - (24 * (cols - 1)) - (24 * 2)) / cols),
                        description: '基础宽松间距，提供舒适的浏览体验。'
                    },
                    {
                        name: '宽松展示布局',
                        gap: 26,
                        sideMargin: 26,
                        colWidth: Math.floor((width - (26 * (cols - 1)) - (26 * 2)) / cols),
                        description: '增加间距以提升内容的展示效果。'
                    },
                    {
                        name: '宽松优雅布局',
                        gap: 28,
                        sideMargin: 28,
                        colWidth: Math.floor((width - (28 * (cols - 1)) - (28 * 2)) / cols),
                        description: '优雅的间距比例，适合高端内容展示。'
                    },
                    {
                        name: '大气布局',
                        gap: 30,
                        sideMargin: 30,
                        colWidth: Math.floor((width - (30 * (cols - 1)) - (30 * 2)) / cols),
                        description: '宽松大气的间距，营造出开阔的视觉效果。'
                    },
                    {
                        name: '画廊布局',
                        gap: 32,
                        sideMargin: 32,
                        colWidth: Math.floor((width - (32 * (cols - 1)) - (32 * 2)) / cols),
                        description: '最大化的宽松间距，打造画廊般的观感。'
                    }
                );
                break;
            default: // balanced
                plans.push(
                    {
                        name: '标准网格布局',
                        gap: 16,
                        sideMargin: 16,
                        colWidth: Math.floor((width - (16 * (cols - 1)) - (16 * 2)) / cols),
                        description: '标准均衡的间距，适合大多数网页布局场景。'
                    },
                    {
                        name: '改良网格布局',
                        gap: 18,
                        sideMargin: 18,
                        colWidth: Math.floor((width - (18 * (cols - 1)) - (18 * 2)) / cols),
                        description: '稍大的间距提供更好的内容区分度。'
                    },
                    {
                        name: '中等间距布局',
                        gap: 20,
                        sideMargin: 20,
                        colWidth: Math.floor((width - (20 * (cols - 1)) - (20 * 2)) / cols),
                        description: '中等间距平衡了紧凑与宽松。'
                    },
                    {
                        name: '舒适阅读布局',
                        gap: 22,
                        sideMargin: 22,
                        colWidth: Math.floor((width - (22 * (cols - 1)) - (22 * 2)) / cols),
                        description: '较大的间距提供舒适的阅读体验。'
                    },
                    {
                        name: '优化展示布局',
                        gap: 24,
                        sideMargin: 24,
                        colWidth: Math.floor((width - (24 * (cols - 1)) - (24 * 2)) / cols),
                        description: '最大化的均衡间距，适合重要内容展示。'
                    }
                );
        }
    }
    
    return plans;
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
                    <button class="btn btn-primary" onclick="applyPlan(${index}, ${JSON.stringify(plan).replace(/"/g, '&quot;')})">
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
                    <span class="info-label">列宽</span>
                    <span class="info-value">${plan.colWidth}px</span>
                </div>
                <div class="info-item">
                    <span class="info-label">列间距</span>
                    <span class="info-value">${plan.gap}px</span>
                </div>
                <div class="info-item">
                    <span class="info-label">两侧边距</span>
                    <span class="info-value">${plan.sideMargin}px</span>
                </div>
                <div class="info-item">
                    <span class="info-label">总宽度</span>
                    <span class="info-value">${plan.colWidth * desiredCols.value + plan.gap * (desiredCols.value - 1) + plan.sideMargin * 2}px</span>
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
                if (value < 12) input.value = value + 1;
                break;
            case 'decrease-rows':
                if (value > 1) input.value = value - 1;
                break;
            case 'increase-rows':
                if (value < 12) input.value = value + 1;
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
    gridPreview.style.padding = `0 ${sideMargin}px`;
    gridPreview.style.setProperty('--side-margin', `${sideMargin}px`);
    
    // 生成网格单元格
    gridPreview.innerHTML = Array(cols * rows).fill('')
        .map(() => '<div class="grid-cell"></div>')
        .join('');
    
    // 为每个单元格添加点击事件
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            // 如果已经有选中的单元格且没有确认，不允许选择新的单元格
            if (selectedCell && selectedCell.querySelector('.confirm-span-btn')) {
                return;
            }
            
            // 移除之前选中的单元格的选中状态
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
            
            // 设置新的选中单元格
            cell.classList.add('selected');
            selectedCell = cell;
            
            // 添加确认按钮
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'confirm-span-btn';
            confirmBtn.innerHTML = '<span class="iconify" data-icon="tabler:check"></span>';
            
            // 确认按钮点击事件
            confirmBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                // 应用跨度设置
                cell.style.gridColumn = `span ${colSpan.value}`;
                cell.style.gridRow = `span ${rowSpan.value}`;
                // 移除确认按钮
                confirmBtn.remove();
                // 移除选中状态
                cell.classList.remove('selected');
                selectedCell = null;
            });
            
            // 移除之前的确认按钮（如果有）
            cell.querySelector('.confirm-span-btn')?.remove();
            cell.appendChild(confirmBtn);
        });
    });
    
    updatePreviewInfo();
}

// 监听单元格跨度变化
[colSpan, rowSpan].forEach(input => {
    input.addEventListener('input', () => {
        if (selectedCell) {
            selectedCell.style.gridColumn = `span ${colSpan.value}`;
            selectedCell.style.gridRow = `span ${rowSpan.value}`;
        }
    });
});

// 更新CSS代码显示
function updateCSSCode() {
    const css = `.grid-container {
    display: grid;
    grid-template-columns: repeat(${colCount.value}, 1fr);
    grid-template-rows: repeat(${rowCount.value}, auto);
    gap: ${rowGap.value}px ${colGap.value}px;
}`;
    
    cssCode.textContent = css;
}

// 复制代码功能
document.getElementById('copyCode').addEventListener('click', () => {
    navigator.clipboard.writeText(cssCode.textContent)
        .then(() => showToast('代码已复制到剪贴板'))
        .catch(err => showToast('复制失败，请手动复制'));
});

// 添加标签页切换功能
document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const isRecommendTab = tab.dataset.tab === 'recommend';
        const isPreviewTab = tab.dataset.tab === 'preview';
        
        // 切换标签页激活状态
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 切换内容显示
        const tabId = tab.dataset.tab;
        document.querySelectorAll('.preview-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`.preview-content[data-tab="${tabId}"]`).classList.add('active');
        
        // 控制导出按钮显示
        exportImageBtn.style.display = isRecommendTab ? 'none' : 'block';
        
        // 控制设置区域状态
        const sections = [gridSettingsSection, cellSettingsSection];
        sections.forEach(section => {
            if (section) {
                section.querySelectorAll('input, button').forEach(el => {
                    el.disabled = isRecommendTab;
                });
                section.style.opacity = isRecommendTab ? '0.5' : '1';
                section.style.pointerEvents = isRecommendTab ? 'none' : 'auto';
            }
        });
        
        // 控制智能布局推荐区域状态
        const recommendSection = document.querySelector('.panel-section:first-child');
        if (recommendSection) {
            recommendSection.querySelectorAll('input, button').forEach(el => {
                el.disabled = isPreviewTab;
            });
            recommendSection.style.opacity = isPreviewTab ? '0.5' : '1';
            recommendSection.style.pointerEvents = isPreviewTab ? 'none' : 'auto';
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

// 导出预览图
document.getElementById('exportImage').addEventListener('click', () => {
    const activeCard = document.querySelector('.device-card.active');
    const deviceWidth = parseInt(activeCard ? activeCard.dataset.width : '1920');
    const sideMargin = parseInt(gridSideMargin.value) || 0;
    
    // 创建临时容器以包含边距
    const container = document.createElement('div');
    container.style.padding = `0 ${sideMargin}px`;
    container.style.background = 'var(--bg-color)';
    container.style.width = `${deviceWidth}px`;
    container.style.boxSizing = 'border-box';
    
    // 克隆网格预览
    const gridClone = gridPreview.cloneNode(true);
    container.appendChild(gridClone);
    document.body.appendChild(container);
    
    const options = {
        width: deviceWidth,
        height: container.offsetHeight,
        scale: 1
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

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
                // 禁用所有输入元素
                section.querySelectorAll('input, button').forEach(el => {
                    el.disabled = isRecommendTab;
                });
                // 添加视觉反馈
                section.style.opacity = isRecommendTab ? '0.5' : '1';
                section.style.pointerEvents = isRecommendTab ? 'none' : 'auto';
            }
        });
    });
});

// 初始化状态（因为默认是推荐标签页）
if (document.querySelector('.form-tab[data-tab="recommend"]').classList.contains('active')) {
    exportImageBtn.style.display = 'none';
    [gridSettingsSection, cellSettingsSection].forEach(section => {
        if (section) {
            section.querySelectorAll('input, button').forEach(el => el.disabled = true);
            section.style.opacity = '0.5';
            section.style.pointerEvents = 'none';
        }
    });
}

// 添加更新预览信息的函数
function updatePreviewInfo() {
    const activeCard = document.querySelector('.device-card.active');
    const deviceWidth = activeCard ? activeCard.dataset.width : '1920';
    const sideMargin = parseInt(gridSideMargin.value) || parseInt(colGap.value);
    
    document.getElementById('previewDeviceWidth').textContent = `${deviceWidth}px`;
    document.getElementById('previewColCount').textContent = `${colCount.value}列`;
    document.getElementById('previewColGap').textContent = `${colGap.value}px`;
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
