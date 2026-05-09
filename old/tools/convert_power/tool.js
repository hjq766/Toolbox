function convertPower(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let watts;
    switch(from) {
        case 'watt': watts = num; break;                         // 瓦特
        case 'kilowatt': watts = num * 1000; break;             // 千瓦
        case 'horsepower': watts = num * 745.7; break;          // 英制马力
        case 'metric_horsepower': watts = num * 735.499; break; // 米制马力
        case 'kgms': watts = num * 9.80665; break;              // 公斤·米/秒
        case 'kcalps': watts = num * 4186.8; break;             // 千卡/秒
        case 'btups': watts = num * 1055.06; break;             // 英热单位/秒
        case 'ftlbps': watts = num * 1.355818; break;           // 英尺·磅/秒
        case 'jps': watts = num; break;                         // 焦耳/秒
        case 'nms': watts = num; break;                         // 牛顿·米/秒
    }

    document.getElementById('watt').value = formatNumber(watts);
    document.getElementById('kilowatt').value = formatNumber(watts / 1000);
    document.getElementById('horsepower').value = formatNumber(watts / 745.7);
    document.getElementById('metric_horsepower').value = formatNumber(watts / 735.499);
    document.getElementById('kgms').value = formatNumber(watts / 9.80665);
    document.getElementById('kcalps').value = formatNumber(watts / 4186.8);
    document.getElementById('btups').value = formatNumber(watts / 1055.06);
    document.getElementById('ftlbps').value = formatNumber(watts / 1.355818);
    document.getElementById('jps').value = formatNumber(watts);
    document.getElementById('nms').value = formatNumber(watts);
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