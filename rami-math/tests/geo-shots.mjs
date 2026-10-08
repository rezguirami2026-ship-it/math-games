// لقطات ورسوم الهندسة: يفتح تحديات دروس الزوايا والأشكال ويصوّر رسومها، ويقيس تداخل النصوص في رسوم SVG
// (نص فوق نص، أو نص يخرج من الرسم). node geo-shots.mjs <مجلد>
import { chromium } from 'playwright-core';
const out = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1000, height: 1100 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8000/index.html?2d=1'); await sleep(1500);
const res = await p.evaluate(async () => {
  const G = await import('/content/chGeo.js'), A = await import('/content/chArt.js'), D = await import('/content/chData.js');
  const box = document.createElement('div'); box.dir = 'rtl'; box.style.cssText = 'position:fixed;inset:0;z-index:99;background:#fff;display:flex;flex-wrap:wrap;gap:8px;padding:8px;overflow:auto';
  const cases = [];
  const tryAdd = (n, f) => { try { const s = f(); if (s) cases.push([n, s]); } catch (e) { cases.push([n, '<b>ERR ' + e.message + '</b>']); } };
  for (const [k, f] of Object.entries(G)) if (typeof f === 'function' && /protractor|fan|triangle|shape|grid|solid|net/i.test(k)) {
    const arg = { protractor: [[40]], fan: [[65, 115]], triangle: [[50, 60, 70]], shape: [['rect'], ['triangle'], ['parallelogram']], grid: [[{ n: 5 }]], solid: [['cube']], net: [['cube']] }[k] || [[]];
    arg.forEach((a, i) => tryAdd(k + i, () => f(...a)));
  }
  for (const k of ['ruler', 'nline', 'rect', 'lshape', 'clock24', 'analog', 'dial']) if (A[k]) tryAdd(k, () => ({ ruler: () => A.ruler(3, 9), nline: () => A.nline(-5, 5, -3, 1), rect: () => A.rect(6, 8), lshape: () => A.lshape(10, 8, 4, 3), clock24: () => A.clock24(14, 35), analog: () => A.analog(3, 40), dial: () => A.dial(350, 500) })[k]());
  box.innerHTML = cases.map(([n, s]) => `<div style="width:300px;border:1px solid #ddd;padding:4px" data-n="${n}"><small>${n}</small>${s}</div>`).join(''); document.body.appendChild(box); await document.fonts.ready;
  const outR = [];
  box.querySelectorAll('[data-n]').forEach(d => { const svg = d.querySelector('svg'); if (!svg) return; const sb = svg.getBoundingClientRect(), ts = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent, r: t.getBoundingClientRect() })).filter(o => o.r.width > 0);
    for (let i = 0; i < ts.length; i++) { const a = ts[i].r; if (a.left < sb.left - 1 || a.right > sb.right + 1 || a.top < sb.top - 1 || a.bottom > sb.bottom + 1) outR.push([d.dataset.n, `«${ts[i].t}» خارج الرسم`]);
      for (let j = i + 1; j < ts.length; j++) { const c = ts[j].r, ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 2 && iy > 2) outR.push([d.dataset.n, `«${ts[i].t}» فوق «${ts[j].t}»`]); } } });
  return { n: cases.length, issues: outR };
});
await p.screenshot({ path: out + '/geo-all.png', fullPage: false });
console.log(`رسوم: ${res.n}`); res.issues.forEach(([n, m]) => console.log('❌', n, m)); if (!res.issues.length) console.log('✅ لا تداخل');
console.log(errs); await b.close();
