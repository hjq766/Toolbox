new Vue({
    el: '#app',
    data: {
        set: {
            preview: '',
            output: ''
        }
    },
    methods: {
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        handleDrop(e) {
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        },
        encode(file) {
            return new Promise((resolve, reject) => {
                try {
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        const wordArray = CryptoJS.lib.WordArray.create(reader.result);
                        let r = CryptoJS.enc.Base64.stringify(wordArray);
                        if (file.type.startsWith('image')) {
                            r = `data:${file.type};base64,${r}`;
                        }
                        return resolve(r);
                    };
                    reader.readAsArrayBuffer(file);
                } catch (e) {
                    return reject(e);
                }
            });
        },
        decode() {
            if (!this.set.output) return;
            if (!this.set.output.startsWith('data:image')) {
                this.set.preview = `data:image/jpeg;base64,${this.set.output}`;
            } else {
                this.set.preview = this.set.output;
            }
        },
        reset() {
            this.set.output = '';
            this.set.preview = '';
            this.$refs.fileInput.value = '';
        },
        async handleFile(file) {
            try {
                const result = await this.encode(file);
                this.set.output = result;
                this.set.preview = result;
            } catch (e) {
                alert('处理文件时发生错误：' + e.message);
            }
        },
        async selectFile(e) {
            if (e.target.files.length > 0) {
                await this.handleFile(e.target.files[0]);
            }
        },
        copyOutput() {
            if (!this.set.output) return;
            
            // 创建临时文本区域
            const textarea = document.createElement('textarea');
            textarea.value = this.set.output;
            document.body.appendChild(textarea);
            
            // 选择并复制
            textarea.select();
            document.execCommand('copy');
            
            // 移除临时元素
            document.body.removeChild(textarea);
            
            // 显示提示
            showToast('已复制到剪贴板');
        }
    }
}); 