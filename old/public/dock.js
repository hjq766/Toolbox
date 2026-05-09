/**
 * Dock 栏功能模块
 * 提供 macOS 风格的底部工具栏功能
 */

// 动态加载 card.js
function loadCardJS() {
    return new Promise((resolve, reject) => {
        if (window.toolCards) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        const isInToolsDir = window.location.pathname.includes('/tools/');
        const cardJSPath = isInToolsDir ? '../../public/card.js' : 'public/card.js';

        script.src = cardJSPath;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load card.js'));
        document.head.appendChild(script);
    });
}

// Dock 栏功能
function initDock() {
    const dockContainer = document.getElementById('dockContainer');
    if (!dockContainer) {
        return;
    }

    const dock = dockContainer.querySelector('.dock');
    const toolFolder = document.getElementById('toolFolder');
    const folderTitle = document.getElementById('folderTitle');
    const folderContent = document.getElementById('folderContent');
    const folderClose = document.getElementById('folderClose');
    const dockOverlay = document.getElementById('dockOverlay');

    // 如果 toolCards 不存在，动态加载 card.js
    if (!window.toolCards) {
        loadCardJS().then(() => {
            initDock();
        }).catch(error => {
            console.error('Failed to load card.js:', error);
        });
        return;
    }

    if (!dock || !toolFolder || !folderTitle || !folderContent || !folderClose || !dockOverlay) {
        return;
    }

    // 生成 dock 分类图标（排除"全部"分类）
    const categories = window.toolCards.categories.filter(cat => cat.id !== 'all');

    // 生成工具分类图标
    const categoryItems = categories.map(category => `
        <div class="dock-item" data-category="${category.id}">
            <span class="iconify" data-icon="${category.icon}" data-inline="false"></span>
            <span class="dock-text">${category.name}</span>
        </div>
    `).join('');

    // 添加 jqnav.top 快捷方式
    const isInToolsDir = window.location.pathname.includes('/tools/');
    const logoPath = isInToolsDir ? '../../public/images/logo.png' : 'public/images/logo.png';
    
    // 检测是否在 iframe 中
    let isIframe = false;
    try {
        isIframe = window.self !== window.top;
    } catch (e) {
        isIframe = true;
    }

    const jqnavItem = isIframe ? '' : `
        <div class="dock-item dock-external" data-url="https://jqnav.top" target="_blank">
            <span class="dock-icon-img">
                <img src="${logoPath}" alt="设计导航">
            </span>
            <div class="dock-tooltip">设计导航</div>
        </div>
    `;

    // 检查是否为首页
    const isHomePage = (window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' || 
                       window.location.pathname.endsWith('/index.html')) && 
                       !window.location.pathname.includes('/tools/');

    // 如果不是首页，添加返回首页按钮
    let homeItem = '';
    if (!isHomePage) {
        const isInToolsDir = window.location.pathname.includes('/tools/');
        const homePath = isInToolsDir ? '../../index.html' : 'index.html';
        
        homeItem = `
            <a href="${homePath}" class="dock-item dock-home">
                <span class="iconify" data-icon="tabler:arrow-back-up" data-inline="false"></span>
                <span class="dock-text">返回首页</span>
            </a>
        `;
    }

    dock.innerHTML = categoryItems + jqnavItem + homeItem;

    // 移除之前的事件监听器（如果存在）
    if (dock._clickHandler) {
        dock.removeEventListener('click', dock._clickHandler);
    }

    // 定义点击处理函数 - 使用事件委托
    dock._clickHandler = (e) => {
        // 查找最近的 .dock-item
        const dockItem = e.target.closest('.dock-item');
        if (!dockItem) return;
        
        e.preventDefault();
        e.stopPropagation();

        // 处理外部链接
        if (dockItem.classList.contains('dock-external')) {
            const url = dockItem.dataset.url;
            if (url) {
                window.open(url, '_blank');
            }
            return;
        }

        // 处理返回首页
        if (dockItem.classList.contains('dock-home')) {
            const href = dockItem.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
            return;
        }

        const categoryId = dockItem.dataset.category;
        const category = categories.find(cat => cat.id === categoryId);
        const tools = window.toolCards.tools[categoryId];

        if (!category || !tools) return;

        // 设置文件夹标题
        folderTitle.innerHTML = `
            <span class="iconify" data-icon="${category.icon}" data-inline="false"></span>
            ${category.name}
        `;

        // 生成工具列表
        const isInToolsDir = window.location.pathname.includes('/tools/');
        const basePath = isInToolsDir ? '../../' : '';

        // 使用文档片段优化 DOM 操作
        const fragment = document.createDocumentFragment();
        const grid = document.createElement('div');
        grid.className = 'folder-tools-grid';
        
        grid.innerHTML = tools.map(tool => `
            <a href="${basePath}${tool.href}" class="folder-tool-item">
                <div class="folder-tool-icon">
                    <span class="iconify" data-icon="${tool.icon}" data-inline="false"></span>
                </div>
                <div class="folder-tool-info">
                    <div class="folder-tool-title">${tool.title}</div>
                    <div class="folder-tool-desc">${tool.desc}</div>
                </div>
            </a>
        `).join('');
        
        fragment.appendChild(grid);
        folderContent.innerHTML = '';
        folderContent.appendChild(fragment);

        // 显示文件夹
        showToolFolder();
    };

    // 添加点击事件监听器
    dock.addEventListener('click', dock._clickHandler);

    // 关闭文件夹
    function hideToolFolder() {
        toolFolder.classList.remove('show');
    }

    // 显示文件夹
    function showToolFolder() {
        toolFolder.classList.add('show');
    }

    // 绑定关闭事件
    folderClose.addEventListener('click', hideToolFolder);

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toolFolder.classList.contains('show')) {
            hideToolFolder();
        }
    });
}

// 插入 Dock HTML 结构
function insertDockHTML() {
    const dockHTML = `
        <!-- Dock 栏 -->
        <div class="dock-container" id="dockContainer">
            <div class="dock">
                <!-- 动态生成分类图标 -->
            </div>
        </div>
        
        <!-- 工具文件夹弹窗 -->
        <div class="tool-folder" id="toolFolder">
            <div class="folder-header">
                <h3 id="folderTitle">工具分类</h3>
                <button class="folder-close" id="folderClose">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                </button>
            </div>
            <div class="folder-content" id="folderContent">
                <!-- 动态生成工具列表 -->
            </div>
        </div>
        
        <!-- 遮罩层 -->
        <div class="dock-overlay" id="dockOverlay"></div>
    `;

    // 插入到 body 末尾
    document.body.insertAdjacentHTML('beforeend', dockHTML);
}

// 初始化 Dock 模块
function initDockModule() {
    // 检查是否已经初始化过
    if (window.dockInitialized) return;
    
    // 插入 HTML 结构
    insertDockHTML();

    // 延迟初始化，确保 DOM 完全加载
    setTimeout(() => {
        initDock();
    }, 100);
    
    window.dockInitialized = true;
}

// 备用初始化 - 已废弃，合并到主初始化逻辑
function backupDockInit() {
    // 空函数，保留兼容性
}

// 导出函数供外部调用
window.DockModule = {
    init: initDockModule,
    backupInit: backupDockInit
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDockModule);
} else {
    initDockModule();
}