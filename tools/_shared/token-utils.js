export function resolveRef(val, root) {
  if (typeof val !== 'string') return String(val ?? '');
  return val.replace(/\{([^}]+)\}/g, (original, path) => {
    let value = root;
    for (const key of path.split('.')) {
      if (value == null) return original;
      value = value[key];
    }
    return value != null ? String(value) : original;
  });
}

export function safeCssValue(value, fallback = '') {
  const text = String(value ?? '').trim();
  if (!text || /[;{}<>"'`\\]/.test(text) || /\b(?:url|expression|javascript)\s*\(/i.test(text)) {
    return fallback;
  }
  return text;
}
