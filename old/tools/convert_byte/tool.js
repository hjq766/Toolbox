document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.unit-item input[type="number"]');
    
    function formatNumber(num) {
        if (!num) return '';
        const number = parseFloat(num);
        
        // 如果是整数，直接返回
        if (Number.isInteger(number)) {
            return number.toString();
        }
        // 对于小数，保留6位小数
        return number.toFixed(6);
    }

    function updateAllValues(byteValue) {
        const values = {
            'b': byteValue * 8,
            'B': byteValue,
            'KB': byteValue / 1024,
            'MB': byteValue / Math.pow(1024, 2),
            'GB': byteValue / Math.pow(1024, 3),
            'TB': byteValue / Math.pow(1024, 4),
            'PB': byteValue / Math.pow(1024, 5)
        };

        inputs.forEach(input => {
            const unit = input.closest('.unit-item').dataset.unit;
            input.value = formatNumber(values[unit]);
        });
    }

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = this.value.trim();
            if (!value) {
                inputs.forEach(input => input.value = '');
                return;
            }

            const unit = this.closest('.unit-item').dataset.unit;
            let byteValue;
            const inputValue = parseFloat(value);

            switch(unit) {
                case 'b': byteValue = inputValue / 8; break;
                case 'B': byteValue = inputValue; break;
                case 'KB': byteValue = inputValue * 1024; break;
                case 'MB': byteValue = inputValue * Math.pow(1024, 2); break;
                case 'GB': byteValue = inputValue * Math.pow(1024, 3); break;
                case 'TB': byteValue = inputValue * Math.pow(1024, 4); break;
                case 'PB': byteValue = inputValue * Math.pow(1024, 5); break;
            }

            updateAllValues(byteValue);
        });

        // 添加键盘事件支持
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.blur(); // 失去焦点
            }
        });
    });

    window.resetValues = function() {
        inputs.forEach(input => input.value = '');
    }
});