// اختبار كتابة العدد السالب: الإشارة يجب أن تظهر على يمين العدد (يقرؤها الطالب أولاً من اليمين): ٣−
// يقيس موضع الإشارة فعلياً على الشاشة في: نص عربي، بطاقة زر، رسم SVG (شبكة الإحداثيات وخط الأعداد)، ولوحة canvas.
// node neg-test.mjs (خادم اللعبة على 8000)
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
await p.goto('http://localhost:8000/index.html?2d=1'); await p.waitForTimeout(1500);
const res = await p.evaluate(async () => {
  const { ar } = await import('/core/util.js'); const { grid } = await import('/content/chGeo.js'); const { nline } = await import('/content/chArt.js');
  const box = document.createElement('div'); box.dir = 'rtl'; box.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99;font:900 30px Cairo;padding:20px'; document.body.appendChild(box);
  box.innerHTML = `<p id="t1">درجة الحرارة ${ar(-3)} ثم صارت ${ar(-28)} درجة</p><button id="t2" class="act" style="font-size:30px">${ar(-2)}</button><div id="t3" style="width:300px">${grid({ n: 5 })}</div><div id="t4" style="width:320px">${nline(-5, 5, -3, 1)}</div>`;
  await document.fonts.ready;
  const pos = (node, digit) => { const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT); let m = null, d = null;
    for (let n; (n = w.nextNode());) for (let i = 0; i < n.data.length; i++) { const ch = n.data[i]; if (ch !== '−' && ch !== digit) continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const x = r.getBoundingClientRect().x; if (ch === '−' && m === null) m = x; if (ch === digit && d === null) d = x; } return m !== null && d !== null ? (m > d ? 'right' : 'left') : 'missing'; };
  const svgText = (sel, txtDigit) => { const t = [...document.querySelectorAll(sel + ' text')].find(t => t.textContent.includes('−') && t.textContent.includes(txtDigit)); return t ? pos(t, txtDigit) : 'missing'; };
  // canvas: نرسم بالاتجاهين ونقارن عمود البكسلات الداكنة للإشارة (أفقية رفيعة) والرقم
  const cv = document.createElement('canvas'); cv.width = 300; cv.height = 80; const c = cv.getContext('2d');
  const canvasSide = dir => { c.clearRect(0, 0, 300, 80); c.direction = dir; c.font = '900 50px Cairo'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText(ar(-4), 150, 60);
    const d = c.getImageData(0, 0, 300, 80).data, col = x => { let n = 0; for (let y = 0; y < 80; y++) n += d[(y * 300 + x) * 4 + 3] > 128; return n; };
    const cols = []; for (let x = 0; x < 300; x++) cols.push(col(x)); const xs = cols.map((v, x) => v ? x : -1).filter(x => x >= 0);
    const segs = []; let s0 = xs[0], pv = xs[0]; for (const x of xs.slice(1)) { if (x > pv + 2) { segs.push([s0, pv]); s0 = x; } pv = x; } segs.push([s0, pv]);
    const h = ([a, z]) => Math.max(...cols.slice(a, z + 1)); if (segs.length < 2) return 'merged'; const minus = segs.reduce((m, s) => h(s) < h(m) ? s : m); return minus === segs[segs.length - 1] ? 'right' : 'left'; };
  return { 'نص عربي': pos(document.getElementById('t1'), '٣'), 'نص عربي ٢٨': pos(document.getElementById('t1'), '٨'), 'بطاقة/زر': pos(document.getElementById('t2'), '٢'), 'شبكة الإحداثيات': svgText('#t3', '٥'), 'خط الأعداد': svgText('#t4', '٥'), 'canvas rtl': canvasSide('rtl'), 'canvas ltr': canvasSide('ltr') };
});
const all = Object.entries(res); console.log(all.map(([k, v]) => `${v === 'right' ? '✅' : '❌'} ${k}: الإشارة على ${v === 'right' ? 'يمين' : v === 'left' ? 'يسار' : v} العدد`).join('\n'));
await b.close();
