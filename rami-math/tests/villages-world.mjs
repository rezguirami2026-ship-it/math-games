// اختبار العالم المتصل للصفين ٨ و٩ (villages/world.js): القرى متجاورة على الطريق الكبير، والبوابة بين قريتين مغلقة حتى تكتمل
// دروس التي غربها ثم تُفتح بحركة، والمشي عبرها يُدخل القرية التالية (يتغير العنوان والدروس والهدف)، والبوابة إلى قرية لم تُبنَ مغلقة،
// وعلامة الهدف فوق صاحب الدرس ثم فوق البوابة. node villages-world.mjs [لقطات] [--3d]
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
const setDone = upto => page.evaluate(async upto => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= upto).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); }, upto);
const boot = async u => { await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400); await page.evaluate(u => window.__villages.enter(u), u); await sleep(3500); };
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const S = () => page.evaluate(() => { const a = window.__villages.api, s = a.st, W = window.__villages.world; return { x: Math.round(s.hero.x), y: Math.round(s.hero.y), at: window.__villages.state.vil.at, title: document.querySelector('.vtitle b').textContent, goal: s.goalPt, arrow: !document.querySelector('.varrow').hidden, gate: W.connectors[0] && { wx: W.connectors[0].wx, y: (W.connectors[0].y0 + W.connectors[0].y1) / 2, open: W.connectors[0].open }, regions: W.regions.length }; });
const blockedAt = (x, y) => page.evaluate(([x, y]) => window.__villages.api.grid.blocked(x, y), [x, y]);
const tp = (x, y) => page.evaluate(([x, y]) => { const s = window.__villages.api.st; s.hero.x = x; s.hero.y = y; s.path = []; }, [x, y]);
const walk = pts => page.evaluate(pts => { window.__villages.api.st.path = pts.map(([x, y]) => ({ x, y })); }, pts);
// ١. المنجم بلا دروس: البوابة إلى الميناء مغلقة، والعلامة فوق صاحب الدرس الأول
await setDone(-1); await boot(0);
let s = await S(); ok('القرى الأربع متجاورة في عالم واحد', s.regions === 4, JSON.stringify(s));
ok('العلامة فوق صاحب الدرس الأول', !!s.goal && s.goal.mh === 165, JSON.stringify(s.goal)); if (!d3) ok('سهم الحافة يدل على الهدف', s.arrow);   // المجسّم يرى أوسع: الهدف على الشاشة غالباً await shot('w1');
ok('١. البوابة مغلقة قبل إنهاء دروس المنجم', await blockedAt(s.gate.wx, s.gate.y));
await tp(s.gate.wx - 160, s.gate.y); await sleep(1500); await shot('w2-closed');
// ٢. بعد إنهاء دروس المنجم: العلامة فوق البوابة، تُفتح حين يقترب البطل، والمشي يُدخل الميناء
await setDone(0); await boot(0);
s = await S(); ok('بعد الدروس: العلامة فوق البوابة', !!s.goal && s.goal.x === s.gate.wx, JSON.stringify(s.goal));
await tp(s.gate.wx - 300, s.gate.y); await sleep(3000); s = await S(); await shot('w3-open');
ok('٢. البوابة فُتحت وحُفظ أنها رُئيت', s.gate.open === 1 && !(await blockedAt(s.gate.wx, s.gate.y)) && await page.evaluate(() => !!(window.__villages.state.vil.gates || {}).mine));
await walk([[s.gate.wx + 520, s.gate.y]]); await sleep(4500); s = await S(); await shot('w4-scales');
ok('٣. المشي عبر البوابة يُدخل ميناء الموازين', s.at === 'scales' && s.title.includes('ميناء'), JSON.stringify(s));
ok('والهدف صار درس الميناء الأول', !!s.goal && s.goal.mh === 165);
// ٣. مطبخ الحلوى منتهٍ والقرية الخامسة لم تُبنَ: بوابتها مغلقة
await setDone(3); await boot(3);
const last = await page.evaluate(() => { const C = window.__villages.world.connectors.at(-1); return { wx: C.wx, y: (C.y0 + C.y1) / 2, built: C.built }; });
ok('٤. البوابة إلى قرية لم تُبنَ مغلقة', !last.built && await blockedAt(last.wx, last.y));
await tp(last.wx - 200, last.y); await sleep(2000); await shot('w5-last');
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
