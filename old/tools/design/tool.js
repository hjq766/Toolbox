// DOM 元素
const categoryTabs = document.querySelectorAll('.tab-btn');
const categoryContents = document.querySelectorAll('.category-content');
const deviceSearch = document.getElementById('deviceSearch');
const deviceList = document.querySelector('.device-list');
const specsGrid = document.querySelector('.specs-grid');

// 通用渲染函数，可以处理任意规范卡片
function renderSpecCard(spec) {
    if (!spec || !spec.items || spec.items.length === 0) return '';
    
    return `
        <div class="spec-card">
            <h3>${spec.title}</h3>
            ${spec.note ? `<div class="spec-note">${spec.note}</div>` : ''}
            ${spec.items.map(item => `
                <div class="spec-item">
                    <span class="spec-label">${item.name}</span>
                    <span class="spec-value">${item.size || item.value}</span>
                    ${item.desc ? `<small class="spec-desc">${item.desc}</small>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// 渲染设备列表
function renderDevices(searchText = '') {
    if (!deviceList) return;
    
    // 合并所有设备数据
    const allDevices = [
        ...designSpecs.ui.devices.mobile.items,
        ...designSpecs.ui.devices.tablet.items
    ];
    
    // 搜索过滤
    const filteredDevices = searchText ? allDevices.filter(device => 
        device.name.toLowerCase().includes(searchText.toLowerCase()) ||
        device.specs.some(spec => 
            spec.label.toLowerCase().includes(searchText.toLowerCase()) ||
            spec.value.toLowerCase().includes(searchText.toLowerCase())
        )
    ) : allDevices;
    
    deviceList.innerHTML = filteredDevices.map(device => renderSpecCard({
        title: device.name,
        items: device.specs.map(spec => ({
            name: spec.label,
            value: spec.value
        }))
    })).join('');
}

// 渲染通用规范
function renderSpecs() {
    if (!specsGrid) return;
    
    const { web, icons } = designSpecs.ui;
    const allSpecs = [
        web.resolutions,
        web.grid,
        web.typography,
        icons.ios,
        icons.android
    ];
    
    specsGrid.innerHTML = allSpecs.map(spec => renderSpecCard(spec)).join('');
}

// 渲染平面设计规范
function renderPrintSpecs(searchText = '') {
    const specsGrid = document.querySelector('#print-content .specs-grid');
    if (!specsGrid) return;
    
    // 获取所有平面设计规范
    const printSpecs = Object.values(designSpecs.print);
    
    // 过滤和渲染
    const filteredSpecs = searchText ? printSpecs.map(spec => ({
        ...spec,
        items: spec.items.filter(item => 
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.size.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.desc && item.desc.toLowerCase().includes(searchText.toLowerCase()))
        )
    })).filter(spec => spec.items.length > 0) : printSpecs;
    
    specsGrid.innerHTML = filteredSpecs.map(spec => renderSpecCard(spec)).join('');
}

// 全局搜索函数
function searchAll(searchText) {
    const searchLower = searchText.toLowerCase();
    const activeContent = document.querySelector('.category-content.active');
    
    if (activeContent.id === 'ui-content') {
        // 搜索 UI 设计规范内容
        renderDevices(searchText);
    } else if (activeContent.id === 'print-content') {
        // 搜索平面设计规范内容
        renderPrintSpecs(searchText);
    }
}

// 更新事件监听
deviceSearch?.addEventListener('input', (e) => {
    searchAll(e.target.value);
});

categoryTabs?.forEach(tab => {
    tab.addEventListener('click', () => {
        const categoryId = tab.dataset.category;
        switchCategory(categoryId);
    });
});

// 切换主分类
function switchCategory(categoryId) {
    // 移除所有标签的 active 类
    categoryTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 添加当前标签的 active 类
    const activeTab = document.querySelector(`.tab-btn[data-category="${categoryId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // 切换内容区域
    categoryContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`${categoryId}-content`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // 保持搜索状态
    if (deviceSearch?.value) {
        searchAll(deviceSearch.value);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 设置默认标签状态
        const defaultTab = document.querySelector('.tab-btn[data-category="ui"]');
        if (defaultTab) {
            defaultTab.classList.add('active');
            const uiContent = document.getElementById('ui-content');
            if (uiContent) {
                uiContent.classList.add('active');
            }
        }

        // 渲染内容
        renderDevices();
        renderSpecs();
        renderPrintSpecs();
    } catch (error) {
        console.error('初始化渲染时出错:', error);
    }
});
