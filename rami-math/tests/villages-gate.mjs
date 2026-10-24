// اختبار بوابات القرى (الصفان ٨ و٩): مغلقة قبل إنهاء الدروس، تُفتح بحركة بعدها، العبور منها يُدخل القرية التالية عند مدخلها،
// والبوابة إلى قرية لم تُبنَ بعد تبقى مغلقة؛ وعلامة الهدف فوق صاحب الدرس الحالي ثم فوق البوابة. node villages-gate.mjs [لقطات] [--3d]
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(d3 => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, d3);
await page.goto('http://localhost:8000/?grade=8' + (d3 ? '' : '&2d=1')); await sleep(1200);
const setDone = upto => page.evaluate(async upto => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u <= upto).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); }, upto);
const boot = async u => { await page.reload(); await sleep(1500); await page.click('#bCont'); await sleep(400); await page.evaluate(u => window.__villages.enter(u), u); await sleep(3000); };
const shot = async n => { if (out) await page.screenshot({ path: `${out}/${n}.png` }); };
const G = () => page.evaluate(() => { const a = window.__villages.api, s = a.st, g = a.grid; return { x: s.hero.x, y: s.hero.y, at: window.__villages.state.vil.at, goal: s.goalPt, arrow: !document.querySelector('.varrow').hidden }; });
// ١. القرية الأولى بلا دروس: البوابة مغلقة، والعلامة فوق صاحب الدرس الأول
await setDone(-1); await boot(0);
let g = await G(); ok('العلامة فوق صاحب الدرس الأول (لا فوق المحطة)', !!g.goal && g.goal.mh === 165, JSON.stringify(g.goal));
ok('سهم الحافة يظهر حين يكون الهدف خارج الشاشة', g.arrow); await shot('g1-arrow');
const gate = await page.evaluate(() => { const d = window.__villages.api; return null; });
const blockedGap = () => page.evaluate(() => { const g = window.__villages.api.grid; return g.blocked(2260, 1754); });
ok('١. البوابة مغلقة قبل إنهاء الدروس', await blockedGap());
// ٢. بعد إنهاء دروس المنجم: تُفتح حين يقترب البطل، والعلامة فوقها، والعبور يُدخل ميناء الموازين
await setDone(0); await boot(0);
g = await G(); ok('بعد الدروس: العلامة فوق البوابة', !!g.goal && g.goal.x === 2260, JSON.stringify(g.goal));
await page.evaluate(() => { const s = window.__villages.api.st; s.hero.x = 2260; s.hero.y = 1600; }); await sleep(2800); await shot('g2-open');
ok('٢. البوابة فُتحت وحُفظ أنها رُئيت', await page.evaluate(() => !!(window.__villages.state.vil.gates || {}).mine) && !(await blockedGap()));
await page.evaluate(() => { const s = window.__villages.api.st; s.path = [{ x: 2260, y: 1700 }, { x: 2260, y: 1770 }]; }); await sleep(3500);
g = await G(); ok('٣. العبور يُدخل القرية التالية عند مدخلها', g.at === 'scales' && Math.abs(g.y - 1740) < 30, JSON.stringify(g)); await shot('g3-next');
// ٣. مطبخ الحلوى منتهٍ والقرية التالية لم تُبنَ: البوابة مغلقة
await setDone(3); await boot(3);
await page.evaluate(() => { const s = window.__villages.api.st; s.hero.x = 2000; s.hero.y = 1640; }); await sleep(1500);
ok('٤. البوابة إلى قرية لم تُبنَ تبقى مغلقة', await page.evaluate(() => window.__villages.api.grid.blocked(2000, 1754)));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`);
await b.close();
