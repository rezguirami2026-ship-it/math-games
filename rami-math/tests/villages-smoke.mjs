// فحص سريع للقرى (الصفان ٨ و٩): خريطة القرى، ودخول القرية الأولى بالعرضين، والمشي بنقرة. node villages-smoke.mjs <مجلد اللقطات> [8|9] (الخادم على 8000)
import { chromium } from 'playwright-core';
const OUT = process.argv[2], G = process.argv[3] || '8';
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
await p.addInitScript(g => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', g);
}, G);
await p.goto(`http://localhost:8000/?grade=${G}`); await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/a_title.png` });
if (!(await p.$('#bCont'))) { await p.evaluate(async g => { const m = await import('/core/state.js'); const st = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' }); st.gems = 12; localStorage.setItem('ramimath_village_v1_g' + g, JSON.stringify(st)); }, G); await p.reload(); await p.waitForTimeout(2500); }
await p.click('#bCont');
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/b_hub.png` });
await p.click('.hnode[data-u="0"]').catch(e => errs.push('no node: ' + e.message)); await p.waitForTimeout(5000);
await p.screenshot({ path: `${OUT}/c_v3d.png` });
await p.click('[data-a=view]').catch(e => errs.push('no view btn')); await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/d_v2d.png` });
// نقرة للمشي ثم لقطة
console.log('errors so far:', errs.join(' || ')); const el = await p.$('.vcv'); if (!el) { await b.close(); process.exit(); } const box = await el.boundingBox(); await p.mouse.click(box.x + box.width * .6, box.y + box.height * .5); await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/e_walk2d.png` });
console.log('errors:', errs.length, errs.slice(0, 6).join('\n'));
await b.close();
