new Vue({
    el: '.tool-container',
    data: {
        set: {
            type: 'text',
            input: window.location.href,
            email: {
                to: '',
                subject: '',
                body: ''
            },
            contact: {
                name: '',
                phone: '',
                email: '',
                company: '',
                address: ''
            },
            wifi: {
                ssid: '',
                password: '',
                encryption: 'WPA',
                hidden: false
            },
            errorCorrectionLevel: 'H',
            width: 256,
            margin: 1,
            color: {
                dark: "#000000",
                light: "#ffffff"
            },
            logo: '',
            logoWidth: 64,
            logoBackgroundTransparent: true,
            logoBorderRadius: 0,
            logoPadding: 0,
            dotScale: 0.4
        },
        activeTab: 'style',
        qrcode: null
    },
    mounted() {
        if (this.getContent()) {
            this.generate();
        }
    },
    methods: {
        handleLogoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.set.logo = e.target.result;
                this.generate();
            };
            reader.readAsDataURL(file);
        },
        getContent() {
            switch (this.set.type) {
                case 'text':
                case 'url':
                    return this.set.input || '';
                case 'email':
                    if (!this.set.email.to) return '';
                    return `mailto:${this.set.email.to}?subject=${encodeURIComponent(this.set.email.subject)}&body=${encodeURIComponent(this.set.email.body)}`;
                case 'contact':
                    if (!this.set.contact.name && !this.set.contact.phone) return '';
                    return `BEGIN:VCARD\nVERSION:3.0\nFN:${this.set.contact.name}\nTEL:${this.set.contact.phone}\nEMAIL:${this.set.contact.email}\nORG:${this.set.contact.company}\nADR:;;${this.set.contact.address};;;\nEND:VCARD`;
                case 'wifi':
                    if (!this.set.wifi.ssid) return '';
                    return `WIFI:T:${this.set.wifi.encryption};S:${this.set.wifi.ssid};P:${this.set.wifi.password};H:${this.set.wifi.hidden};`;
                default:
                    return '';
            }
        },
        async generate() {
            const content = this.getContent();
            if (!content) {
                const container = document.querySelector('.qrcode-output');
                container.innerHTML = '<div style="color: var(--text-secondary);">请输入内容生成二维码</div>';
                return;
            }

            try {
                const container = document.querySelector('.qrcode-output');
                container.innerHTML = '';

                // 基础配置
                const options = {
                    text: content,
                    size: parseInt(this.set.width) || 256,
                    margin: parseInt(this.set.margin) || 1,
                    correctLevel: this.set.errorCorrectionLevel === 'H' ? 2 : this.set.errorCorrectionLevel === 'Q' ? 1 : this.set.errorCorrectionLevel === 'M' ? 0 : 3,
                    colorDark: this.set.color.dark,
                    colorLight: this.set.color.light,
                    dotScale: parseFloat(this.set.dotScale) || 0.4,
                    whiteMargin: true,
                    autoColor: false,
                    backgroundDimming: 'rgba(0,0,0,0)',
                    logoImage: this.set.logo || undefined,
                    logoWidth: parseInt(this.set.logoWidth) || 64,
                    logoHeight: parseInt(this.set.logoWidth) || 64,
                    logoBackgroundTransparent: this.set.logoBackgroundTransparent,
                    logoCornerRadius: parseInt(this.set.logoBorderRadius) || 0,
                    logoPadding: parseInt(this.set.logoPadding) || 0,
                    logoMargin: parseInt(this.set.logoPadding) || 0,
                    components: {
                        data: {
                            scale: parseFloat(this.set.dotScale) || 0.4
                        },
                        timing: {
                            scale: parseFloat(this.set.dotScale) || 0.4,
                            protectors: true
                        },
                        alignment: {
                            scale: parseFloat(this.set.dotScale) || 0.4,
                            protectors: true
                        },
                        cornerAlignment: {
                            scale: parseFloat(this.set.dotScale) || 0.4,
                            protectors: true
                        }
                    }
                };

                // 如果有Logo，强制使用高容错级别
                if (this.set.logo) {
                    options.correctLevel = 2; // H级别
                    // 确保Logo大小不超过限制
                    const maxLogoSize = Math.floor(this.set.width * 0.2); // 降低到20%
                    options.logoWidth = Math.min(parseInt(this.set.logoWidth) || 64, maxLogoSize);
                    options.logoHeight = options.logoWidth;
                }

                // 生成二维码
                const qr = new window.AwesomeQR.AwesomeQR(options);
                const dataUrl = await qr.draw();

                // 显示二维码
                const img = new Image();
                img.onload = () => {
                    container.innerHTML = '';
                    container.appendChild(img);
                    this.qrcode = img;
                };
                img.src = dataUrl;
            } catch (error) {
                alert('生成二维码时发生错误：' + error.message);
            }
        },
        loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },
        downloadQR() {
            if (!this.qrcode) return;

            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = this.qrcode.src;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        reset() {
            this.set.input = '';
            this.set.logo = '';
            this.set.logoWidth = 64;
            const container = document.querySelector('.qrcode-output');
            container.innerHTML = '<div style="color: var(--text-secondary);">请输入内容生成二维码</div>';
        },
        removeLogo() {
            this.set.logo = '';
            this.generate();
        }
    },
    watch: {
        'set.type'() {
            if (this.getContent()) {
                this.generate();
            }
        },
        'set.input'() {
            this.generate();
        },
        'set.email': {
            deep: true,
            handler() {
                if (this.set.type === 'email') {
                    this.generate();
                }
            }
        },
        'set.contact': {
            deep: true,
            handler() {
                if (this.set.type === 'contact') {
                    this.generate();
                }
            }
        },
        'set.wifi': {
            deep: true,
            handler() {
                if (this.set.type === 'wifi') {
                    this.generate();
                }
            }
        },
        'set.width'() {
            this.generate();
        },
        'set.margin'() {
            this.generate();
        },
        'set.errorCorrectionLevel'() {
            this.generate();
        },
        'set.color.dark'() {
            this.generate();
        },
        'set.color.light'() {
            this.generate();
        },
        'set.logoWidth'() {
            if (this.set.logo) {
                this.generate();
            }
        },
        'set.logoBackgroundTransparent'() {
            if (this.set.logo) {
                this.generate();
            }
        },
        'set.logoBorderRadius'() {
            if (this.set.logo) {
                this.generate();
            }
        },
        'set.logoPadding'() {
            if (this.set.logo) {
                this.generate();
            }
        },
        'set.dotScale'() {
            this.generate();
        }
    }
});

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// 主题切换
document.getElementById('themeToggle').addEventListener('click', function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const sunIcon = this.querySelector('.sun-icon');
    const moonIcon = this.querySelector('.moon-icon');

    if (!isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    }
});

// 初始化主题
initTheme();