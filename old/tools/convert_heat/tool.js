function convertHeat(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let joules;
    switch(from) {
        case 'joule': joules = num; break;
        case 'kgm': joules = num * 9.80665; break;           // 1 kg·m = 9.80665 J
        case 'psh': joules = num * 2647795.5; break;         // 1 PS·h = 2647795.5 J
        case 'hph': joules = num * 2684519.537; break;       // 1 HP·h = 2684519.537 J
        case 'kwh': joules = num * 3600000; break;           // 1 kW·h = 3600000 J
        case 'kcal': joules = num * 4186.8; break;           // 1 kcal = 4186.8 J
        case 'btu': joules = num * 1055.05585262; break;     // 1 BTU = 1055.05585262 J
        case 'ftlb': joules = num * 1.355817948; break;      // 1 ft·lb = 1.355817948 J
    }

    document.getElementById('joule').value = formatNumber(joules);
    document.getElementById('kgm').value = formatNumber(joules / 9.80665);
    document.getElementById('psh').value = formatNumber(joules / 2647795.5);
    document.getElementById('hph').value = formatNumber(joules / 2684519.537);
    document.getElementById('kwh').value = formatNumber(joules / 3600000);
    document.getElementById('kcal').value = formatNumber(joules / 4186.8);
    document.getElementById('btu').value = formatNumber(joules / 1055.05585262);
    document.getElementById('ftlb').value = formatNumber(joules / 1.355817948);
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