document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const fromBaseButtons = document.querySelectorAll('#fromBase .btn');
    const toBaseButtons = document.querySelectorAll('#toBase .btn');
    const input = document.getElementById('input');
    const output = document.getElementById('output');

    // 当前选中的进制
    let currentFromBase = 10;
    let currentToBase = 16;

    // 按钮点击处理
    function handleBaseButtonClick(buttons, isFrom) {
        buttons.forEach(btn => btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (isFrom) {
                currentFromBase = parseInt(btn.dataset.base);
            } else {
                currentToBase = parseInt(btn.dataset.base);
            }
            convert();
        }));
    }

    // 初始化按钮点击事件
    handleBaseButtonClick(fromBaseButtons, true);
    handleBaseButtonClick(toBaseButtons, false);

    // 转换函数
    function convert() {
        const value = input.value.trim();
        if (!value) {
            output.value = '';
            return;
        }

        try {
            const decimal = parseInt(value, currentFromBase);
            if (isNaN(decimal)) {
                showToast(`请输入有效的${currentFromBase}进制数值`);
                return;
            }
            const result = decimal.toString(currentToBase).toUpperCase();
            output.value = result;
        } catch (e) {
            showToast('转换失败，请检查输入');
        }
    }

    // 输入框事件
    input.addEventListener('input', convert);
});

// 复制结果
function copyResult() {
    const output = document.getElementById('output');
    if (!output.value) {
        showToast('没有可复制的内容');
        return;
    }

    output.select();
    document.execCommand('copy');
    showToast('复制成功');
} 