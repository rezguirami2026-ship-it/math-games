// رسوم تحديات الإحصاء والاحتمال: رسم بياني خطي، أعمدة، دائري، جدول تكرار، ودوّار ملوّن.
import { ar } from '../core/util.js';

const INK = '#2A1B66', ACC = '#E2475C', COLORS = ['#3FA3F5', '#FFC23D', '#2E9E5B', '#E2475C', '#8E6CF6', '#F08A24'];
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 11}" font-weight="900" fill="${o.c || INK}" font-family="Cairo,sans-serif">${s}</text>`;

/* محوران وشبكة: xs = تسميات المحور الأفقي، yMax/yStep للرأسي، plot(xi, yv) يعيد إحداثيات */
function axes(xs, yMax, yStep, xTitle, yTitle) {
  const L = 44, B = 170, W = 260, H = 140, x = i => L + (i + .5) * W / xs.length, y = v => B - v / yMax * H; let s = '';
  for (let v = 0; v <= yMax; v += yStep) s += `<line x1="${L}" y1="${y(v)}" x2="${L + W}" y2="${y(v)}" stroke="#E3E7F0"/>` + T(L - 6, y(v) + 4, ar(v), { a: 'end', fs: 10 });
  s += `<line x1="${L}" y1="${B}" x2="${L + W}" y2="${B}" stroke="${INK}" stroke-width="2"/><line x1="${L}" y1="${B}" x2="${L}" y2="${B - H - 6}" stroke="${INK}" stroke-width="2"/>`;
  xs.forEach((l, i) => s += T(x(i), B + 15, l, { fs: 10 }));
  s += T(L + W / 2, B + 32, xTitle, { fs: 11, c: '#8A7A5A' }) + T(12, B - H / 2, yTitle, { fs: 11, c: '#8A7A5A' }).replace('<text', `<text transform="rotate(-90 12 ${B - H / 2})"`);
  return { s, x, y };
}
export function lineGraph(xs, vals, yMax, yStep, xTitle, yTitle) {
  const { s, x, y } = axes(xs, yMax, yStep, xTitle, yTitle);
  return `<svg viewBox="0 0 320 210" class="chLine">${s}<polyline points="${vals.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="${ACC}" stroke-width="3" stroke-linejoin="round"/>${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${ACC}"/>`).join('')}</svg>`;
}
export function barChart(xs, vals, yMax, yStep, xTitle, yTitle) {
  const { s, x, y } = axes(xs, yMax, yStep, xTitle, yTitle), bw = 260 / xs.length * .6;
  return `<svg viewBox="0 0 320 210" class="chLine">${s}${vals.map((v, i) => `<rect x="${x(i) - bw / 2}" y="${y(v)}" width="${bw}" height="${170 - y(v)}" fill="${COLORS[i % COLORS.length]}" stroke="${INK}" stroke-width="1"/>`).join('')}</svg>`;
}
/* مخطط دائري: parts = [[الاسم، عدد الأجزاء]] من total أجزاء متساوية */
export function pie(parts, total) {
  const c = 90, r = 78; let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 330 180" class="chLine">`, legend = '';
  parts.forEach(([n, k], i) => { const a1 = a0 + k / total * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0;
    s += k === total ? `<circle cx="${c}" cy="${c}" r="${r}" fill="${COLORS[i]}"/>` : `<path d="M${c} ${c} L${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A${r} ${r} 0 ${big} 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} Z" fill="${COLORS[i]}" stroke="#fff" stroke-width="2"/>`;
    legend += `<rect x="190" y="${22 + i * 26}" width="16" height="16" rx="3" fill="${COLORS[i]}"/>` + T(214, 35 + i * 26, n, { a: 'start', fs: 13 }); a0 = a1; });
  return s + legend + '</svg>';
}
/* جدول تكرار أو بيانات: head = عناوين الأعمدة، rows = صفوف */
export const table = (head, rows) => `<table class="chTable"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th>${c}</th>`).join('')}</tr>`).join('')}</table>`;
/* دوّار: sectors = [[اسم اللون بالعربية، عدد الأجزاء، لون]] */
export function spinner(sectors) {
  const total = sectors.reduce((a, s) => a + s[1], 0), c = 80, r = 70; let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 160 160" class="chClock">`;
  sectors.forEach(([, k, col]) => { for (let j = 0; j < k; j++) { const a1 = a0 + 2 * Math.PI / total; s += `<path d="M${c} ${c} L${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} Z" fill="${col}" stroke="#fff" stroke-width="2"/>`; a0 = a1; } });
  return s + `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${INK}" stroke-width="3"/><path d="M${c} ${c} L${c + 8} ${c - 44} L${c - 4} ${c - 40} Z" fill="${INK}"/><circle cx="${c}" cy="${c}" r="6" fill="${INK}"/></svg>`;
}
export const COLOR_NAMES = [['أحمر', '#E2475C'], ['أزرق', '#3FA3F5'], ['أصفر', '#FFC23D'], ['أخضر', '#2E9E5B'], ['بنفسجي', '#8E6CF6']];
