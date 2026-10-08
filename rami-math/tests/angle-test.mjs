// اختبار رسوم الزوايا: مئات الرسوم العشوائية كما في التحديات (مثلث، زوايا حول نقطة، زوايا على مستقيم)،
// ويقيس هل يلمس رقمُ زاوية أيَّ خط في الرسم أو رقماً آخر، أو يخرج من الرسم. node angle-test.mjs [مجلد للقطة]
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1300, height: 1000 } });
await p.goto('http://localhost:8000/index.html?2d=1'); await p.waitForTimeout(1200);
const res = await p.evaluate(async () => {
  const G = await import('/content/chGeo.js'); const deg = v => G.ar ? G.ar(v) + '°' : v + '°'; const { ar } = await import('/core/util.js'); const D = v => ar(v) + '°';
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), cases = [];
  for (let i = 0; i < 60; i++) { const A = R(35, 80), B = R(35, Math.min(85, 160 - A)); cases.push(['مثلث', G.triangle([A, B, 180 - A - B], [D(A), D(B), '؟'])]); }
  for (let i = 0; i < 30; i++) { const V = R(10, 70) * 2, b2 = (180 - V) / 2; cases.push(['متطابق الضلعين', G.triangle([b2, b2, V], ['؟', '؟', D(V)])]); }
  for (let i = 0; i < 60; i++) { const a = R(60, 120), b2 = R(50, 110), c = R(40, 90); cases.push(['حول نقطة ٤', G.fan([a, b2, c, 360 - a - b2 - c], [D(a), D(b2), D(c), '؟'])]); }
  for (let i = 0; i < 40; i++) { const a = R(70, 150), b2 = R(60, 140); if (a + b2 < 330) cases.push(['حول نقطة ٣', G.fan([a, b2, 360 - a - b2], [D(a), D(b2), '؟'])]); }
  for (let i = 0; i < 40; i++) { const a = R(25, 155); cases.push(['على مستقيم ٢', G.fan([a, 180 - a], [D(a), '؟'], true)]); }
  for (let i = 0; i < 40; i++) { const a = R(20, 80), b2 = R(20, 80); cases.push(['على مستقيم ٣', G.fan([a, b2, 180 - a - b2], [D(a), D(b2), '؟'], true)]); }
  const box = document.createElement('div'); box.dir = 'rtl'; box.style.cssText = 'position:fixed;inset:0;z-index:99;background:#fff;display:flex;flex-wrap:wrap;gap:6px;padding:6px;overflow:auto';
  box.innerHTML = cases.map(([n, s], i) => `<div style="width:300px" data-n="${n}" data-i="${i}">${s}</div>`).join(''); document.body.appendChild(box); await document.fonts.ready;
  const bad = {}, sample = [];
  box.querySelectorAll('[data-n]').forEach(d => {
    const svg = d.querySelector('svg'), sb = svg.getBoundingClientRect(), ctm = svg.getScreenCTM(), pt = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(ctm); };
    const segs = [];
    svg.querySelectorAll('line').forEach(l => segs.push([pt(+l.getAttribute('x1'), +l.getAttribute('y1')), pt(+l.getAttribute('x2'), +l.getAttribute('y2'))]));
    svg.querySelectorAll('polygon').forEach(pg => { const P = pg.getAttribute('points').trim().split(/\s+/).map(s => s.split(',').map(Number)); P.forEach((a, i) => segs.push([pt(...a), pt(...P[(i + 1) % P.length])])); });
    const ts = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent, r: t.getBoundingClientRect() }));
    const hit = (r, [a, c]) => { for (let k = 0; k <= 40; k++) { const x = a.x + (c.x - a.x) * k / 40, y = a.y + (c.y - a.y) * k / 40; if (x > r.left + 1 && x < r.right - 1 && y > r.top + 2 && y < r.bottom - 2) return true; } return false; };
    let why = null;
    ts.forEach((o, i) => { if (o.r.left < sb.left || o.r.right > sb.right || o.r.top < sb.top || o.r.bottom > sb.bottom) why = why || `«${o.t}» خارج الرسم`;
      if (segs.some(s => hit(o.r, s))) why = why || `«${o.t}» على خط`;
      ts.slice(i + 1).forEach(q => { const ix = Math.min(o.r.right, q.r.right) - Math.max(o.r.left, q.r.left), iy = Math.min(o.r.bottom, q.r.bottom) - Math.max(o.r.top, q.r.top); if (ix > 1 && iy > 1) why = why || `«${o.t}» فوق «${q.t}»`; }); });
    const n = d.dataset.n; bad[n] = bad[n] || [0, 0, '']; bad[n][1]++; if (why) { bad[n][0]++; bad[n][2] = bad[n][2] || why; if (sample.length < 12) { sample.push(+d.dataset.i); d.style.outline = '3px solid red'; } }
  });
  box.innerHTML = box.innerHTML; [...box.children].forEach((c, i) => { if (!sample.includes(i)) c.remove(); });
  return bad;
});
if (process.argv[2]) await p.screenshot({ path: process.argv[2] + '/angles-bad.png' });
let tot = 0; for (const [n, [x, all, why]] of Object.entries(res)) { tot += x; console.log(`${x ? '❌' : '✅'} ${n}: ${all - x} من ${all} سليمة ${why}`); }
console.log(tot ? `النتيجة: ${tot} رسماً فيها تداخل` : 'النتيجة: كل الرسوم سليمة'); await b.close();
