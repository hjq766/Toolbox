// 格式化金额显示
function formatAmount(value) {
    return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// 设置快捷金额
function setAmount(amount) {
    document.getElementById('Digits').value = formatAmount(amount);
    convertAmount(); // 自动触发转换
}

// 转换金额
function convertAmount() {
    const value = document.getElementById('Digits').value.trim();
    if (!value) {
        document.getElementById('Result').value = '';
        return;
    }

    try {
        const number = parseFloat(value.replace(/,/g, ''));
        if (isNaN(number) || number > 99999999999.99) {
            document.getElementById('Result').value = '';
            return;
        }

        document.getElementById('Result').value = convertCurrency(number.toString());
    } catch (e) {
        document.getElementById('Result').value = '';
    }
}

// 复制结果
function copyResult() {
    const result = document.getElementById('Result');
    if (!result.value) {
        showToast('没有可复制的内容！');
        return;
    }
    
    result.select();
    try {
        document.execCommand('copy');
        showToast('复制成功！');
    } catch (err) {
        showToast('复制失败，请手动复制');
    }
}

// 重置表单
function resetForm() {
    document.getElementById('Digits').value = '';
    document.getElementById('Result').value = '';
}

// 监听输入,格式化金额
document.getElementById('Digits').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^\d.]/g, '');
    
    // 处理小数点
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // 限制小数位数
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    e.target.value = value;
});

function convertCurrency(currencyDigits) {
    if (!currencyDigits) return "";
    
    // Constants:
    var MAXIMUM_NUMBER = 99999999999.99;
    // Predefine the radix characters and currency symbols for output:
    var CN_ZERO = "零";
    var CN_ONE = "壹";
    var CN_TWO = "贰";
    var CN_THREE = "叁";
    var CN_FOUR = "肆";
    var CN_FIVE = "伍";
    var CN_SIX = "陆";
    var CN_SEVEN = "柒";
    var CN_EIGHT = "捌";
    var CN_NINE = "玖";
    var CN_TEN = "拾";
    var CN_HUNDRED = "佰";
    var CN_THOUSAND = "仟";
    var CN_TEN_THOUSAND = "万";
    var CN_HUNDRED_MILLION = "亿";
    var CN_SYMBOL = "";
    var CN_DOLLAR = "元";
    var CN_TEN_CENT = "角";
    var CN_CENT = "分";
    var CN_INTEGER = "整";

    // Validate input string:
    currencyDigits = currencyDigits.toString();
    if (currencyDigits.match(/[^,.\d]/) != null || 
        !currencyDigits.match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) ||
        Number(currencyDigits) > MAXIMUM_NUMBER) {
        return "";
    }

    // Normalize the format of input digits:
    currencyDigits = currencyDigits.replace(/,/g, "");    // Remove comma delimiters.
    currencyDigits = currencyDigits.replace(/^0+/, "");    // Trim zeros at the beginning.

    // Process the coversion from currency digits to characters:
    // Separate integral and decimal parts before processing coversion:
    var parts = currencyDigits.split(".");
    var integral = parts[0] || "0";
    var decimal = parts.length > 1 ? parts[1].substr(0, 2) : "";

    // Prepare the characters corresponding to the digits:
    var digits = [CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE];
    var radices = ["", CN_TEN, CN_HUNDRED, CN_THOUSAND];
    var bigRadices = ["", CN_TEN_THOUSAND, CN_HUNDRED_MILLION];
    var decimals = [CN_TEN_CENT, CN_CENT];

    // Start processing:
    var outputCharacters = "";
    
    // Process integral part if it is larger than 0:
    if (Number(integral) > 0) {
        var zeroCount = 0;
        for (var i = 0; i < integral.length; i++) {
            var p = integral.length - i - 1;
            var d = integral.substr(i, 1);
            var quotient = p / 4;
            var modulus = p % 4;
            if (d == "0") {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    outputCharacters += digits[0];
                }
                zeroCount = 0;
                outputCharacters += digits[Number(d)] + radices[modulus];
            }
            if (modulus == 0 && zeroCount < 4) {
                outputCharacters += bigRadices[quotient];
            }
        }
        outputCharacters += CN_DOLLAR;
    }

    // Process decimal part if there is:
    if (decimal) {
        for (var i = 0; i < decimal.length; i++) {
            var d = decimal.substr(i, 1);
            if (d !== "0") {
                outputCharacters += digits[Number(d)] + decimals[i];
            }
        }
    }

    // Confirm and return the final output string:
    if (!outputCharacters) {
        outputCharacters = CN_ZERO + CN_DOLLAR;
    }
    if (!decimal) {
        outputCharacters += CN_INTEGER;
    }

    return outputCharacters;
} 