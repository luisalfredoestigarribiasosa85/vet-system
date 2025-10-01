// String normalization for case-insensitive comparisons
export const normalize = (s = '') => String(s || '').toLowerCase().trim();

// Generic search matcher: checks if any of the specified keys contain the term
export const matchSearch = (item, term, keys) => {
  const q = normalize(term);
  if (!q) return true;
  return keys.some((k) => normalize(item?.[k]).includes(q));
};

// Safe integer parsing with fallback
export const toInt = (value, fallback = 0) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

// Safe float parsing with fallback
export const toFloat = (value, fallback = 0) => {
  const n = parseFloat(value);
  return Number.isNaN(n) ? fallback : n;
};
// Simple confirmation wrapper (sync)
export const confirmAction = (message = '¿Confirmar esta acción?') => {
  return window.confirm(message);
};

// Debounce utility
export const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

// Conditional classnames builder
export const cx = (...args) =>
  args
    .flatMap((a) => {
      if (!a) return [];
      if (typeof a === 'string') return [a];
      if (Array.isArray(a)) return a;
      if (typeof a === 'object') return Object.keys(a).filter((k) => !!a[k]);
      return [];
    })
    .join(' ');

// Lightweight validators
export const isEmail = (v) => /.+@.+\..+/.test(String(v || ''));
export const isPhone = (v) => /[0-9()+\-\s]{6,}/.test(String(v || ''));
