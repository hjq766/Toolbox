document.addEventListener('DOMContentLoaded', () => {
	const sourceWidthInput = document.getElementById('sourceWidth');
	const sourceHeightInput = document.getElementById('sourceHeight');
	const targetWidthInput = document.getElementById('targetWidth');
	const targetHeightInput = document.getElementById('targetHeight');
	const ratioText = document.getElementById('ratioText');
	const resetBtn = document.getElementById('resetBtn');
	const swapBtn = document.getElementById('swapBtn');
	const copyBtn = document.getElementById('copyBtn');

	let isUpdating = false; // 防止输入事件循环

	function parseNumber(value) {
		const n = parseFloat(value);
		return Number.isFinite(n) ? n : NaN;
	}

	function getPrecision() {
		return 0;
	}

	function formatNumber(n) {
		const p = getPrecision();
		if (!Number.isFinite(n)) return '';
		if (p <= 0) return String(Math.round(n));
		return n.toFixed(p);
	}

	function gcd(a, b) {
		a = Math.abs(a);
		b = Math.abs(b);
		while (b) {
			const t = b;
			b = a % b;
			a = t;
		}
		return a || 1;
	}

	function updateRatioText() {
		const sw = parseNumber(sourceWidthInput?.value);
		const sh = parseNumber(sourceHeightInput?.value);
		if (!Number.isFinite(sw) || !Number.isFinite(sh) || sw <= 0 || sh <= 0) {
			ratioText.textContent = '—';
			return;
		}
		const aspect = sw / sh;
		let ratioDisplay = '';
		const swInt = Math.round(sw);
		const shInt = Math.round(sh);
		if (Math.abs(sw - swInt) < 1e-6 && Math.abs(sh - shInt) < 1e-6 && swInt > 0 && shInt > 0) {
			const g = gcd(swInt, shInt);
			ratioDisplay = `${swInt / g}:${shInt / g}`;
		}
		const decimalText = aspect.toFixed(4);
		ratioText.textContent = ratioDisplay ? `${ratioDisplay} | ${decimalText}` : `W/H ≈ ${decimalText}`;
	}

	function canLink() {
		const sw = parseNumber(sourceWidthInput?.value);
		const sh = parseNumber(sourceHeightInput?.value);
		return Number.isFinite(sw) && Number.isFinite(sh) && sw > 0 && sh > 0;
	}

	function computeFromWidth(width) {
		const sw = parseNumber(sourceWidthInput?.value);
		const sh = parseNumber(sourceHeightInput?.value);
		if (!canLink()) return '';
		const aspect = sw / sh; // W/H
		return width / aspect; // H = W / (W/H)
	}

	function computeFromHeight(height) {
		const sw = parseNumber(sourceWidthInput?.value);
		const sh = parseNumber(sourceHeightInput?.value);
		if (!canLink()) return '';
		const aspect = sw / sh; // W/H
		return height * aspect; // W = H * (W/H)
	}

	function handleSourceChange() {
		updateRatioText();
		// 当原始尺寸变化时，如果目标有一个值，则联动另一个
		if (!canLink()) return;
		if (document.activeElement === targetWidthInput && targetWidthInput.value !== '') {
			// 用户正在输入目标宽，联动目标高
			const w = parseNumber(targetWidthInput.value);
			if (Number.isFinite(w)) {
				isUpdating = true;
				targetHeightInput.value = formatNumber(computeFromWidth(w));
				isUpdating = false;
			}
		} else if (document.activeElement === targetHeightInput && targetHeightInput.value !== '') {
			// 用户正在输入目标高，联动目标宽
			const h = parseNumber(targetHeightInput.value);
			if (Number.isFinite(h)) {
				isUpdating = true;
				targetWidthInput.value = formatNumber(computeFromHeight(h));
				isUpdating = false;
			}
		}
	}

	function onTargetWidthInput() {
		if (isUpdating) return;
		if (!canLink()) return;
		const w = parseNumber(targetWidthInput.value);
		if (!Number.isFinite(w)) return;
		isUpdating = true;
		targetHeightInput.value = formatNumber(computeFromWidth(w));
		isUpdating = false;
	}

	function onTargetHeightInput() {
		if (isUpdating) return;
		if (!canLink()) return;
		const h = parseNumber(targetHeightInput.value);
		if (!Number.isFinite(h)) return;
		isUpdating = true;
		targetWidthInput.value = formatNumber(computeFromHeight(h));
		isUpdating = false;
	}

	function onSwap() {
		const w = targetWidthInput.value;
		const h = targetHeightInput.value;
		isUpdating = true;
		targetWidthInput.value = h;
		targetHeightInput.value = w;
		isUpdating = false;
	}

	async function onCopy() {
		const w = targetWidthInput.value?.trim();
		const h = targetHeightInput.value?.trim();
		if (!w || !h) return;
		const text = `${w}x${h}`;
		try {
			await navigator.clipboard.writeText(text);
			copyBtn.textContent = '已复制';
			setTimeout(() => {
				copyBtn.textContent = '复制尺寸';
			}, 1200);
		} catch (e) {
			const temp = document.createElement('textarea');
			temp.value = text;
			document.body.appendChild(temp);
			temp.select();
			document.execCommand('copy');
			document.body.removeChild(temp);
		}
	}

	function onReset() {
		isUpdating = true;
		sourceWidthInput.value = '';
		sourceHeightInput.value = '';
		targetWidthInput.value = '';
		targetHeightInput.value = '';
		ratioText.textContent = '—';
		isUpdating = false;
	}

	// 事件绑定
	sourceWidthInput?.addEventListener('input', handleSourceChange);
	sourceHeightInput?.addEventListener('input', handleSourceChange);
	targetWidthInput?.addEventListener('input', onTargetWidthInput);
	targetHeightInput?.addEventListener('input', onTargetHeightInput);
	resetBtn?.addEventListener('click', onReset);
	swapBtn?.addEventListener('click', onSwap);
	copyBtn?.addEventListener('click', onCopy);

	// 初始状态
	updateRatioText();
});
