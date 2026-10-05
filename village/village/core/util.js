export const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a, b, t) => a + (b - a) * t;
export const wait = ms => new Promise(r => setTimeout(r, ms));
export function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const shades = new Map();   // الألوان المحسوبة محفوظة: تُستدعى آلاف المرات في كل إطار
export function shade(hex, amt) {
  const k = hex + amt; let r = shades.get(k);
  if (r) return r;
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => clamp(v + amt, 0, 255));
  r = '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  if (shades.size < 4000) shades.set(k, r);
  return r;
}
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map(sh => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, t)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
