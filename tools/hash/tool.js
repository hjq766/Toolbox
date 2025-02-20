// 切换选项卡
        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.querySelectorAll('.form-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabName + 'Hash').style.display = 'block';
            document.querySelector(`.form-tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('resultBody').innerHTML = '';
        }

        // 显示提示信息
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 2000);
        }

        // 计算文本哈希
        function calculateTextHash() {
            const text = document.getElementById('hashText').value;
            const key = document.getElementById('hashKey').value;
            
            if (!text) {
                showToast('请输入要计算的文本');
                return;
            }

            const algorithms = ['md5', 'sha1', 'sha3', 'sha256', 'sha224', 'sha512', 'sha384', 'ripemd160'];
            const resultBody = document.getElementById('resultBody');
            resultBody.innerHTML = '';
            
            try {
                algorithms.forEach(algo => {
                    // 普通哈希
                    const hash = CryptoJS[algo.toUpperCase()](text).toString();
                    resultBody.innerHTML += `
                        <tr>
                            <td>${algo.toUpperCase()}</td>
                            <td>${hash}</td>
                        </tr>
                    `;

                    // HMAC哈希（如果有密钥）
                    if (key) {
                        const hmac = CryptoJS['Hmac' + algo.toUpperCase()](text, key).toString();
                        resultBody.innerHTML += `
                            <tr>
                                <td>HMAC-${algo.toUpperCase()}</td>
                                <td>${hmac}</td>
                            </tr>
                        `;
                    }
                });
                document.getElementById('resultSection').style.display = 'block';
            } catch (error) {
                console.error('Hash calculation error:', error);
                showToast('计算出错：' + error.message);
            }
        }

        // 计算文件哈希
        function hash(file, algorithm) {
            return new Promise((resolve) => {
                let reader = new FileReader();
                reader.onload = (e) => {
                    const wordArray = CryptoJS.lib.WordArray.create(reader.result);
                    let result;
                    // 根据算法名称获取正确的哈希函数
                    if (algorithm.toLowerCase() === 'sha3') {
                        result = CryptoJS.SHA3(wordArray);
                    } else if (algorithm.toLowerCase() === 'ripemd160') {
                        result = CryptoJS.RIPEMD160(wordArray);
                    } else if (algorithm.toLowerCase() === 'sha512') {
                        result = CryptoJS.SHA512(wordArray);
                    } else {
                        result = CryptoJS[algorithm.toUpperCase()](wordArray);
                    }
                    resolve(result.toString());
                }
                reader.readAsArrayBuffer(file);
            });
        }

        // 文件大小格式化
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // 处理文件选择
        async function handleFiles(files) {
            if (files.length === 0) return;
            
            showToast('正在计算中...');
            const resultBody = document.getElementById('resultBody');
            resultBody.innerHTML = '';
            document.getElementById('resultSection').style.display = 'block';

            try {
                for (const file of files) {
                    resultBody.innerHTML += `
                        <tr>
                            <td colspan="2" style="background: var(--bg-color-100)">
                                <strong>${file.name}</strong> (${file.type || '未知类型'} - ${formatFileSize(file.size)})
                            </td>
                        </tr>
                    `;
                    
                    // 检查选中的算法并计算
                    if (document.getElementById('md5').checked) {
                        const result = await hash(file, 'MD5');
                        resultBody.innerHTML += createResultRow('MD5', result);
                    }
                    if (document.getElementById('sha1').checked) {
                        const result = await hash(file, 'SHA1');
                        resultBody.innerHTML += createResultRow('SHA1', result);
                    }
                    if (document.getElementById('sha256').checked) {
                        const result = await hash(file, 'SHA256');
                        resultBody.innerHTML += createResultRow('SHA256', result);
                    }
                    if (document.getElementById('sha512').checked) {
                        const result = await hash(file, 'SHA512');
                        resultBody.innerHTML += createResultRow('SHA512', result);
                    }
                    if (document.getElementById('sha3').checked) {
                        const result = await hash(file, 'SHA3');
                        resultBody.innerHTML += createResultRow('SHA3', result);
                    }
                    if (document.getElementById('ripemd160').checked) {
                        const result = await hash(file, 'RIPEMD160');
                        resultBody.innerHTML += createResultRow('RIPEMD160', result);
                    }
                }
            } catch (error) {
                console.error('File processing error:', error);
                showToast('处理文件出错：' + error.message);
            }

            showToast('计算完成');
        }

        // 创建结果行HTML
        function createResultRow(algorithm, hash) {
            return `
                <tr>
                    <td>${algorithm}</td>
                    <td>${hash}</td>
                </tr>
            `;
        }

        // 文件拖放处理
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('drag-over');
        }

        function unhighlight(e) {
            dropZone.classList.remove('drag-over');
        }

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });