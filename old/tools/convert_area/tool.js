function convertArea(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let sqm; // 统一转换到平方米
    switch(from) {
        case 'sqkm': sqm = num * 1000000; break;
        case 'ha': sqm = num * 10000; break;
        case 'sqm': sqm = num; break;
        case 'sqdm': sqm = num * 0.01; break;
        case 'sqcm': sqm = num * 0.0001; break;
        case 'sqmm': sqm = num * 0.000001; break;
        case 'mu': sqm = num * 666.67; break;
        case 'sqmi': sqm = num * 2589988.11; break;
        case 'acre': sqm = num * 4046.86; break;
        case 'sqrd': sqm = num * 25.293; break;
        case 'sqft': sqm = num * 0.092903; break;
        case 'sqin': sqm = num * 0.00064516; break;
    }

    document.getElementById('sqkm').value = formatNumber(sqm / 1000000);
    document.getElementById('ha').value = formatNumber(sqm / 10000);
    document.getElementById('sqm').value = formatNumber(sqm);
    document.getElementById('sqdm').value = formatNumber(sqm * 100);
    document.getElementById('sqcm').value = formatNumber(sqm * 10000);
    document.getElementById('sqmm').value = formatNumber(sqm * 1000000);
    document.getElementById('mu').value = formatNumber(sqm / 666.67);
    document.getElementById('sqmi').value = formatNumber(sqm / 2589988.11);
    document.getElementById('acre').value = formatNumber(sqm / 4046.86);
    document.getElementById('sqrd').value = formatNumber(sqm / 25.293);
    document.getElementById('sqft').value = formatNumber(sqm / 0.092903);
    document.getElementById('sqin').value = formatNumber(sqm / 0.00064516);
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