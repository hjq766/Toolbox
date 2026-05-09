//百度统计
var _hmt = _hmt || [];
(function () {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?d07c3a564a178264d3c3326f1509bc98";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();

function ensureIconifyLoaded() {
    if (window.Iconify) return;

    const existing = document.querySelector('script[data-iconify-loader="true"]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = 'https://code.iconify.design/3/3.1.0/iconify.min.js';
    script.defer = true;
    script.setAttribute('data-iconify-loader', 'true');
    document.head.appendChild(script);
}

ensureIconifyLoaded();

// 获取一言
function fetchHitokoto() {
    fetch('https://v1.hitokoto.cn?max_length=24')
        .then(response => response.json())
        .then(data => {
            const hitokotoText = document.getElementById('hitokoto_text');
            if (hitokotoText) {
                hitokotoText.textContent = data.hitokoto;
                hitokotoText.title = `—— ${data.from}`;
            }
        })
        .catch(error => {
            console.log('Hitokoto API failed, using fallback:', error);
            if (!Array.isArray(window.fallbackHitokoto) || window.fallbackHitokoto.length === 0) {
                return;
            }
            const randomIndex = Math.floor(Math.random() * fallbackHitokoto.length);
            const fallbackData = fallbackHitokoto[randomIndex];
            const hitokotoText = document.getElementById('hitokoto_text');
            if (hitokotoText) {
                hitokotoText.textContent = fallbackData.hitokoto;
                hitokotoText.title = `—— ${fallbackData.from}`;
            }
        });
}

// 初始化一言
function initHitokoto() {
    const hitokotoText = document.getElementById('hitokoto_text');
    if (!hitokotoText || hitokotoText.dataset.bound === 'true') return;

    fetchHitokoto();
    let cooldown = false;

    hitokotoText.addEventListener('click', function () {
        if (!cooldown) {
            cooldown = true;
            fetchHitokoto();
            setTimeout(() => {
                cooldown = false;
            }, 1000);
        }
    });
    hitokotoText.dataset.bound = 'true';
}

let appInitialized = false;
let globalScrollBound = false;

const uiState = {
    ticking: false
};

function detectLowPerformanceMode() {
    const cores = navigator.hardwareConcurrency || 0;
    const memory = navigator.deviceMemory || 0;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return prefersReducedMotion || (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4);
}

function applyPerformanceMode() {
    const mode = detectLowPerformanceMode() ? 'low' : 'normal';
    document.documentElement.setAttribute('data-performance', mode);
}

function handleGlobalScrollUI() {
    const header = document.querySelector('.header');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 100);
    }

    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.classList.toggle('show', window.scrollY > 300);
    }
}

function bindGlobalScroll() {
    if (globalScrollBound) return;

    window.addEventListener('scroll', () => {
        if (!uiState.ticking) {
            uiState.ticking = true;
            requestAnimationFrame(() => {
                handleGlobalScrollUI();
                uiState.ticking = false;
            });
        }
    }, { passive: true });

    globalScrollBound = true;
    handleGlobalScrollUI();
}

function bindSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.dataset.smoothBound === 'true') return;
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
        anchor.dataset.smoothBound = 'true';
    });
}

function bindSearch() {
    const toolSearch = document.getElementById('toolSearch');
    const clearBtn = document.getElementById('clearSearch');
    if (!toolSearch || !clearBtn || toolSearch.dataset.searchBound === 'true') return;

    toolSearch.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase().trim();
        filterTools(searchText);
        clearBtn.style.display = searchText ? 'flex' : 'none';
    });

    clearBtn.addEventListener('click', () => {
        toolSearch.value = '';
        filterTools('');
        clearBtn.style.display = 'none';
    });

    toolSearch.dataset.searchBound = 'true';
}

function initFavicon() {
    addFavicon('/public/favicon.ico');
}

function initApp() {
    if (appInitialized) return;

    applyPerformanceMode();
    insertCommonElements();
    insertToastContainer();
    initTheme();
    initHitokoto();
    bindSmoothAnchorScroll();
    bindSearch();
    initFavicon();

    if (window.toolCards && document.querySelector('.tools-container')) {
        toolManager.init();
    }

    updateToolCount();
    updateAllToolCount();
    initBackToTop();
    bindGlobalScroll();

    appInitialized = true;
}

document.addEventListener('DOMContentLoaded', initApp, { once: true });

// 添加 URL 参数支持，可以通过 URL 直接打开特定分类
function checkUrlCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category && typeof showCategory === 'function') {
        showCategory(category);
    }
}

// 定义工具页面专用的 header - 已移除，统一在 insertCommonElements 处理


// 主题切换功能
let themeInitialized = false;

function initTheme() {
    if (themeInitialized) return;

    const themeToggle = document.getElementById('themeToggle');
    const floatThemeToggle = document.getElementById('floatThemeToggle');

    if (!themeToggle && !floatThemeToggle) return;

    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');

    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcons(savedTheme === 'dark');
    }

    // 切换主题函数
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme === 'dark');
    }

    // 更新所有主题图标
    function updateThemeIcons(isDark) {
        sunIcons.forEach(icon => {
            icon.style.display = isDark ? 'none' : 'block';
        });
        moonIcons.forEach(icon => {
            icon.style.display = isDark ? 'block' : 'none';
        });
    }

    // 添加事件监听
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (floatThemeToggle) {
        floatThemeToggle.addEventListener('click', toggleTheme);
    }

    themeInitialized = true;
}

// 过滤工具卡片
function filterTools(searchText) {
    const allTools = document.querySelectorAll('.tool-card');
    const allCategories = document.querySelectorAll('.category');
    const emptyState = document.getElementById('emptyState');
    let hasVisibleTools = false;

    // 记录每个分类是否有匹配的工具
    const categoryHasMatch = {};

    // 检查每个工具是否匹配
    allTools.forEach(tool => {
        const title = tool.querySelector('h4')?.textContent.toLowerCase() || '';
        const desc = tool.querySelector('p')?.textContent.toLowerCase() || '';
        const isMatch = title.includes(searchText) || desc.includes(searchText);

        tool.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) {
            hasVisibleTools = true;
            // 找到工具所属的分类
            const category = tool.closest('.category');
            if (category) {
                categoryHasMatch[category.dataset.category] = true;
            }
        }
    });

    // 显示/隐藏分类
    allCategories.forEach(category => {
        const categoryId = category.dataset.category;
        category.style.display = categoryHasMatch[categoryId] ? 'block' : 'none';
    });

    // 显示/隐藏空状态提示
    if (emptyState) {
        emptyState.style.display = hasVisibleTools ? 'none' : 'block';
    }

    // 更新工具数量统计
    updateToolCount();
}

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
    if (document.getElementById('toast')) return;
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.insertBefore(toast, document.body.firstChild);
}

// 工具数量统计
function updateToolCount() {
    const toolCount = document.getElementById('toolCount');
    if (!toolCount) return;

    const searchInput = document.getElementById('toolSearch');
    const searchText = searchInput?.value.toLowerCase().trim();

    if (searchText) {
        // 搜索状态：统计所有分类中匹配搜索条件的工具数量
        let matchCount = 0;
        Object.values(window.toolCards.tools).forEach(tools => {
            tools.forEach(tool => {
                if (tool.title.toLowerCase().includes(searchText) ||
                    tool.desc.toLowerCase().includes(searchText)) {
                    matchCount++;
                }
            });
        });
        toolCount.textContent = matchCount;
    } else {
        // 正常状态：根据当前选中的分类统计
        const currentCategory = document.querySelector('.tab-btn.active')?.dataset.category;

        if (currentCategory === 'all') {
            // 全部分类：统计所有工具总数
            const totalTools = Object.values(window.toolCards.tools)
                .reduce((sum, tools) => sum + tools.length, 0);
            toolCount.textContent = totalTools;
        } else {
            // 特定分类：统计该分类的工具数量
            toolCount.textContent = window.toolCards.tools[currentCategory]?.length || 0;
        }
    }
}

// 动态添加 favicon
function addFavicon(faviconUrl) {
    var link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    link.type = 'image/x-icon';

    // 检查页面是否已有favicon，若有则替换
    var head = document.querySelector('head');
    var existingFavicon = document.querySelector('link[rel="icon"]');

    if (existingFavicon) {
        head.removeChild(existingFavicon);
    }

    head.appendChild(link);
}

function insertCommonElements() {
    // 判断当前页面位置和类型
    const isToolsDir = window.location.pathname.includes('/tools/');
    const basePath = isToolsDir ? '../../' : '';
    const isIndexPage = window.location.pathname === '/index.html' || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    
    // 统一生成 Header
    const headerHtml = `
    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="nav-left">
                    <div class="nav-links">
                        <a href="https://jqnav.top" class="nav-link index-nav" target="_blank">设计导航</a>
                        <a href="${basePath}about.html" class="nav-link">关于本站</a>
                        <a href="${basePath}../index.html" class="nav-link" style="color:#6366f1;font-weight:600">✨ 体验新版</a>
                    </div>
                </div>
                
                <div class="theme-toggle-container">
                    <span class="theme-label" id="hitokoto_text"></span>
                    <button class="theme-toggle" id="themeToggle">
                        <svg class="sun-icon" viewBox="0 0 24 24">
                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45-1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45-1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                        </svg>
                        <svg class="moon-icon" viewBox="0 0 24 24" style="display: none;">
                            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                        </svg>
                    </button>
                </div>
            </nav>
        </div>
    </header>
    `;

    // 插入页脚
    const footer = `
        <!--右侧悬浮菜单-->
        <div class="float-menu">
            <div class="float-menu-item" id="darkMode">
                <button class="float-theme-toggle" id="floatThemeToggle">
                <svg class="sun-icon" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45-1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45-1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                </svg>
                <svg class="moon-icon" viewBox="0 0 24 24" style="display: none;">
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
                </button>
                <div class="float-menu-tooltip">切换主题</div>
            </div>
            <!--<div class="float-menu-item" id="qrcode">
                <svg class="icon" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0471 8.08989C16.7777 8.0618 16.5102 8.03558 16.2409 8.03558C12.2136 8.08989 9.04644 11.1479 9.04644 14.9363C9.04644 15.5581 9.15418 16.1536 9.31579 16.7491C9.04644 16.7772 8.75294 16.8034 8.48359 16.8034C7.45586 16.8034 6.62387 16.6043 5.66014 16.3738C5.61704 16.3635 5.57368 16.3531 5.53003 16.3427L2.57647 17.8577L3.40867 15.2322C1.28916 13.7172 0 11.7416 0 9.38764C0 5.24719 3.83777 2 8.48173 2C12.6427 2 16.3207 4.59738 17.0471 8.08989ZM12.7505 6.81648C12.7505 6.16667 12.3214 5.73408 11.6768 5.73408C11.0322 5.73408 10.3876 6.16667 10.3876 6.81648C10.3876 7.46629 11.0322 7.89888 11.6768 7.89888C12.3214 7.89888 12.7505 7.46629 12.7505 6.81648ZM4.42848 6.81648C4.42848 7.46629 5.07307 7.89888 5.71765 7.89888C6.36223 7.89888 6.79133 7.49251 6.79133 6.81648C6.79133 6.14045 6.36223 5.73408 5.71765 5.73408C5.07307 5.73408 4.42848 6.16667 4.42848 6.81648ZM16.7777 8.54869C20.6155 8.54869 23.9981 11.3895 23.9981 14.8539L24 14.8558C24 16.8052 22.7368 18.5356 21.0464 19.8352L21.691 22L19.382 20.7004C18.5498 20.9157 17.6898 21.133 16.8316 21.133C12.7783 21.133 9.58328 18.3184 9.58328 14.8277C9.55728 11.3633 12.7505 8.54869 16.7777 8.54869ZM13.6105 12.8801C13.6105 13.339 14.0396 13.7453 14.4427 13.7453C15.0873 13.7453 15.5164 13.3127 15.5164 12.8801C15.5164 12.4476 15.0873 12.015 14.4427 12.015C14.0136 12.015 13.6105 12.4738 13.6105 12.8801ZM18.2805 12.8801C18.2805 13.339 18.7096 13.7453 19.1127 13.7453C19.7573 13.7453 20.1864 13.3127 20.1864 12.8801C20.1864 12.4476 19.7573 12.015 19.1127 12.015C18.6836 12.015 18.2805 12.4738 18.2805 12.8801Z" fill=""/>
                </svg>
                <div class="float-menu-tooltip">二维码</div>
                <div class="float-menu-popup">
                    <div class="popup-title">有问题 · 联系我</div>
                    <div class="popup-content">
                        <img src="http://jqnest.top/assets/images/ui/wechat_qrcode.webp" alt="微信二维码" class="qr-code">
                        <div class="qr-text">扫一扫 · 加微信</div>
                    </div>
                </div>
            </div>-->
            <div class="float-menu-item" id="donate">
                <svg class="icon" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill=""/>
                </svg>
                <div class="float-menu-tooltip">打赏支持</div>
                <div class="float-menu-popup">
                    <div class="popup-title">请我喝杯咖啡</div>
                    <div class="popup-content">
                        <div class="donate-qrcodes">
                            <div class="donate-item">
                                <img src="https://jqnest.top/assets/images/ui/donate_wechat.webp" alt="微信支付" class="qr-code">
                                <div class="qr-text">微信赞赏</div>
                            </div>
                            <div class="donate-item">
                                <img src="https://jqnest.top/assets/images/ui/donate_alipay.webp" alt="支付宝" class="qr-code">
                                <div class="qr-text">支付宝赞赏</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${!isIndexPage ? `
            <div class="float-menu-item" id="backToHome">
                <a href="${basePath}index.html" class="back-to-home-btn">
                    <span class="iconify" data-icon="ant-design:home-filled" data-inline="false"></span>
                </a>
                <div class="float-menu-tooltip">返回首页</div>
            </div>
            ` : ''}
            ${isIndexPage ? `
            <div class="float-menu-item" id="backToTop">
                <button class="back-to-top-btn">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 15l6-6l6 6"/>
                    </svg>
                </button>
                <div class="float-menu-tooltip">返回顶部</div>
            </div>
            ` : ''}
        </div>
        <footer class="footer">
            <div class="container">
                <div class="footer-left">
                    <span>Copyright ${new Date().getFullYear()} Jacket</span>
                    <span>|</span>
                    <a href="https://beian.miit.gov.cn" id="beian" target="_blank">粤ICP备2024225759号</a>
                    <img src="https://beian.mps.gov.cn/img/logo01.dd7ff50e.png" style="width:12px;margin-right:-5px;margin-left:2px;vertical-align:-1px;">
                    <a href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002003173" rel="noreferrer" target="_blank">粤公网备44030002003173号</a>
                </div>
                <div class="footer-right">
                    <a href="#">问题反馈</a>
                </div>
            </div>
        </footer>
    `;

    // 在工具目录下插入 header 和 footer
    const pageWrapper = document.querySelector('.page-wrapper');

    // 判断是否存在 pageWrapper
    if (pageWrapper) {
        // 先移除已存在的 header（如果有的话）
        const existingHeader = document.querySelector('.header');
        if (existingHeader) {
            existingHeader.remove();
        }

        // 插入新的 header
        pageWrapper.insertAdjacentHTML('afterbegin', headerHtml);

        // 确保 footer 不重复插入
        if (!document.querySelector('.footer')) {
            pageWrapper.insertAdjacentHTML('beforeend', footer);
        }
    } else {
        // 如果没有 pageWrapper，直接插入到 body
        if (!document.querySelector('.footer')) {
            document.body.insertAdjacentHTML('beforeend', footer);
        }
    }
}

// 工具管理器
const toolManager = {
    // 渲染分类
    renderCategory: function (categoryId) {
        const category = window.toolCards.categories.find(c => c.id === categoryId);
        const tools = window.toolCards.tools[categoryId];

        if (!category || !tools) return '';

        return `
            <div class="category" data-category="${categoryId}">
                <h3>${category.name}</h3>
                <div class="tools-grid">
                    ${tools.map(tool => window.toolCards.renderCard(tool)).join('')}
                </div>
            </div>
        `;
    },

    // 渲染所有工具
    renderTools: function () {
        const container = document.querySelector('.tools-container');
        if (!container) return;

        const categories = window.toolCards.categories.filter(c => c.id !== 'all');
        container.innerHTML = categories
            .map(category => this.renderCategory(category.id))
            .join('');
    },

    // 切换分类
    switchCategory: function (categoryId) {
        const tabs = document.querySelectorAll('.tab-btn');
        const categories = document.querySelectorAll('.category');

        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === categoryId);
        });

        if (categoryId === 'all') {
            categories.forEach(cat => cat.style.display = 'block');
        } else {
            categories.forEach(cat => {
                cat.style.display = cat.dataset.category === categoryId ? 'block' : 'none';
            });
        }
    },

    // 初始化工具管理器
    init: function () {
        this.renderTools();
        // 初始化时触发一次 "全部" 分类的切换
        this.switchCategory('all');
    }
};

// 获取工具总数
function getTotalToolCount() {
    if (!window.toolCards) return 0;
    return Object.values(window.toolCards.tools)
        .reduce((sum, tools) => sum + tools.length, 0);
}

// 更新所有工具数量显示
function updateAllToolCount() {
    // 更新工具箱页面的计数
    const toolCount = document.getElementById('toolCount');
    if (toolCount) {
        toolCount.textContent = getTotalToolCount();
    }

    // 更新关于页面的计数
    const aboutCount = document.querySelector('.feature-item span[style*="color: var(--red-color)"]');
    if (aboutCount) {
        aboutCount.textContent = getTotalToolCount();
    }
}

// 返回顶部功能
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop || backToTop.dataset.bound === 'true') return;

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    backToTop.dataset.bound = 'true';
}
