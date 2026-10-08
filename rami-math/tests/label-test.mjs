// اختبار تداخل الكتابة مع الرسم في رسوم التحديات: كل تسمية خارج الشكل الذي تصفه، وداخل حدود الرسم. node label-test.mjs [مجلد]
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 900, height: 900 } });
await p.goto('http://localhost:8000/index.html?2d=1'); await p.waitForTimeout(1200);
const res = await p.evaluate(async () => {
  const A = await import('/content/chArt.js'); const box = document.createElement('div'); box.dir = 'rtl'; box.style.cssText = 'position:fixed;inset:0;z-index:99;background:#fff;display:flex;flex-wrap:wrap;gap:10px;padding:10px';
  const cases = [['rect 6×8', A.rect(6, 8)], ['rect 12×3', A.rect(12, 3)], ['rect 9×9', A.rect(9, 9)], ['rect 25×14 سم', A.rect(25, 14, 'سم')], ['L 10×8', A.lshape(10, 8, 4, 3)], ['L 14×6', A.lshape(14, 6, 6, 2)]];
  box.innerHTML = cases.map(([n, s]) => `<div style="width:320px;border:1px solid #ddd" data-n="${n}">${s}</div>`).join(''); document.body.appendChild(box); await document.fonts.ready;
  const out = []; box.querySelectorAll('[data-n]').forEach(d => { const svg = d.querySelector('svg'), sh = (svg.querySelector('rect,polygon')).getBoundingClientRect(), sb = svg.getBoundingClientRect();
    svg.querySelectorAll('text').forEach(t => { const r = t.getBoundingClientRect(), ov = !(r.right <= sh.left + 1 || r.left >= sh.right - 1 || r.bottom <= sh.top + 1 || r.top >= sh.bottom - 1), outB = r.left < sb.left - 1 || r.right > sb.right + 1;
      out.push({ n: d.dataset.n, t: t.textContent, ok: !ov && !outB, why: ov ? 'فوق الشكل' : outB ? 'خارج الرسم' : '' }); }); });
  return out;
});
if (process.argv[2]) await p.screenshot({ path: process.argv[2] + '/labels.png' });
res.forEach(r => console.log(`${r.ok ? '✅' : '❌'} ${r.n}: «${r.t}» ${r.why}`)); console.log(`النتيجة: ${res.filter(r => r.ok).length} من ${res.length}`);
await b.close();
