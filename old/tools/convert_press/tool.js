function convertPressure(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let pa;
    switch(from) {
        case 'bar': pa = num * 100000; break;                // 巴
        case 'kilopascal': pa = num * 1000; break;          // 千帕
        case 'hectopascal': pa = num * 100; break;          // 百帕
        case 'millibar': pa = num * 100; break;             // 毫巴
        case 'pascal': pa = num; break;                      // 帕斯卡
        case 'atmosphere': pa = num * 101325; break;         // 标准大气压
        case 'mmhg': pa = num * 133.322; break;             // 毫米汞柱
        case 'lbf_ft2': pa = num * 47.88026; break;         // 磅力/平方英尺
        case 'psi': pa = num * 6894.757; break;             // 磅力/平方英寸
        case 'inhg': pa = num * 3386.389; break;            // 英寸汞柱
        case 'kgf_cm2': pa = num * 98066.5; break;          // 公斤力/平方厘米
        case 'kgf_m2': pa = num * 9.80665; break;           // 公斤力/平方米
        case 'mmh2o': pa = num * 9.80665; break;            // 毫米水柱
    }

    document.getElementById('bar').value = formatNumber(pa / 100000);
    document.getElementById('kilopascal').value = formatNumber(pa / 1000);
    document.getElementById('hectopascal').value = formatNumber(pa / 100);
    document.getElementById('millibar').value = formatNumber(pa / 100);
    document.getElementById('pascal').value = formatNumber(pa);
    document.getElementById('atmosphere').value = formatNumber(pa / 101325);
    document.getElementById('mmhg').value = formatNumber(pa / 133.322);
    document.getElementById('lbf_ft2').value = formatNumber(pa / 47.88026);
    document.getElementById('psi').value = formatNumber(pa / 6894.757);
    document.getElementById('inhg').value = formatNumber(pa / 3386.389);
    document.getElementById('kgf_cm2').value = formatNumber(pa / 98066.5);
    document.getElementById('kgf_m2').value = formatNumber(pa / 9.80665);
    document.getElementById('mmh2o').value = formatNumber(pa / 9.80665);
}

function resetAll() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
    });
}

function formatNumber(num) {
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return Number(num.toFixed(8)).toString();
} 