// 字符集定义
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// 易混淆字符
const similarChars = 'iIlL1oO0';
const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';

// 更新密码长度显示
document.getElementById('passwordLength').addEventListener('input', function(e) {
    document.getElementById('lengthValue').textContent = e.target.value;
});

// 生成单个密码
function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const options = {
        uppercase: document.getElementById('uppercase').checked,
        lowercase: document.getElementById('lowercase').checked,
        numbers: document.getElementById('numbers').checked,
        symbols: document.getElementById('symbols').checked,
        excludeSimilar: document.getElementById('excludeSimilar').checked,
        excludeAmbiguous: document.getElementById('excludeAmbiguous').checked
    };

    // 验证至少选择了一种字符类型
    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
        showToast('请至少选择一种字符类型！');
        return;
    }

    // 生成字符集
    let chars = '';
    if (options.uppercase) chars += charSets.uppercase;
    if (options.lowercase) chars += charSets.lowercase;
    if (options.numbers) chars += charSets.numbers;
    if (options.symbols) chars += charSets.symbols;

    // 排除字符
    if (options.excludeSimilar) {
        chars = chars.split('').filter(char => !similarChars.includes(char)).join('');
    }
    if (options.excludeAmbiguous) {
        chars = chars.split('').filter(char => !ambiguousChars.includes(char)).join('');
    }

    // 生成密码
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 显示密码
    document.getElementById('generatedPassword').value = password;
    
    // 更新强度显示
    updatePasswordStrength(password);
}

// 批量生成密码
function generateMultiple() {
    const count = 10; // 可以改为可配置
    let passwords = '';
    for (let i = 0; i < count; i++) {
        generatePassword();
        passwords += document.getElementById('generatedPassword').value + '\n';
    }
    
    // 显示批量结果
    const batchResults = document.querySelector('.batch-results');
    batchResults.style.display = 'block';
    document.getElementById('batchPasswords').value = passwords;
}

// 复制密码
function copyPassword() {
    const password = document.getElementById('generatedPassword').value;
    if (!password) {
        showToast('请先生成密码！');
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        showToast('密码已复制到剪贴板！');
    }).catch(err => {
        showToast('复制失败：' + err.message);
    });
}

// 更新密码强度显示
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    // 计算强度分数
    let score = 0;
    if (password.length >= 12) score += 2;
    if (password.length >= 16) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 2;

    // 设置强度显示
    let strength = '';
    let color = '';
    if (score >= 6) {
        strength = '很强';
        color = 'var(--green-color)';
    } else if (score >= 4) {
        strength = '强';
        color = 'var(--skyblue-color)';
    } else if (score >= 2) {
        strength = '中等';
        color = 'var(--orange-color)';
    } else {
        strength = '弱';
        color = 'var(--red-color)';
    }

    strengthBar.style.width = ((score / 8) * 100) + '%';
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = `密码强度: ${strength}`;
}

// 页面加载时生成一个初始密码
document.addEventListener('DOMContentLoaded', generatePassword); 