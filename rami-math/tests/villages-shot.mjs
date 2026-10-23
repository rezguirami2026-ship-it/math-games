// لقطة من داخل قرية في موضع معيّن (لمراجعة الشكل): node villages-shot.mjs <ملف.png> [الصف] [الوحدة] [س] [ص] [تقريب] [--2d]
import { chromium } from 'playwright-core';
const a = process.argv.slice(2).filter(x => !x.startsWith('--')), D2 = process.argv.includes('--2d');
const [OUT, G = '8', U = '0', X, Y, Z = '1'] = a;
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(([g, d2]) => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', g); localStorage.setItem('ramimath_3d', d2 ? '0' : '1'); }, [G, D2]);
await p.goto(`http://localhost:8000/?grade=${G}`); await p.waitForTimeout(1200);
await p.evaluate(async g => { const m = await import('/core/state.js'); const st = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' }); localStorage.setItem('ramimath_village_v1_g' + g, JSON.stringify(st)); }, G);
await p.reload(); await p.waitForTimeout(1500); await p.click('#bCont'); await p.waitForTimeout(500);
await p.evaluate(u => window.__villages.enter(+u), U); await p.waitForTimeout(3000);
await p.evaluate(([x, y, z]) => { const a = window.__villages.api; if (x) { a.st.hero.x = +x; a.st.hero.y = +y; } a.view.zoom(+z); }, [X, Y, Z]); await p.waitForTimeout(2500);
await p.screenshot({ path: OUT }); if (errs.length) console.log(errs.join('\n'));
await b.close();
