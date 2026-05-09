// 手机号码验证
function isValidPhoneNumber(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

// 查询归属地
function queryLocation() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    if (!phoneNumber) {
        showToast('请输入手机号码');
        return;
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
        showToast('请输入正确的手机号码');
        return;
    }
    
    // 聚合数据API配置
    const JUHE_KEY = 'ed10ebaaa8e98b85b468c68800555405';
    
    // 创建script标签实现JSONP调用
    const script = document.createElement('script');
    const callbackName = 'jsonp_' + Math.random().toString(36).substr(2, 5);
    
    // 定义回调函数
    window[callbackName] = function(data) {
        console.log('API返回数据:', data);
        if (data.error_code === 0) {
            // API调用成功
            const result = data.result;
            document.getElementById('number').textContent = phoneNumber;
            document.getElementById('province').textContent = `${result.province} ${result.city}`;
            document.getElementById('carrier').textContent = result.company;
            document.getElementById('segment').textContent = phoneNumber.substring(0, 3);
            
            // 显示结果区域
            document.getElementById('resultArea').classList.add('show');
        } else {
            // API调用失败
            console.error('API错误:', data.reason);
            showToast(data.reason || '查询失败');
        }
        // 清理工作
        document.body.removeChild(script);
        delete window[callbackName];
    };
    
    // 设置script的src，添加callback参数
    script.src = `https://apis.juhe.cn/mobile/get?phone=${phoneNumber}&key=${JUHE_KEY}&callback=${callbackName}`;

    // 处理错误情况
    script.onerror = function() {
        showToast('查询失败，请稍后重试');
        document.body.removeChild(script);
        delete window[callbackName];
    };
    
    // 将script标签添加到页面中，开始请求
    document.body.appendChild(script);
}

// 监听输入，只允许输入数字
document.getElementById('phoneNumber').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
}); 