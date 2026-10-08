// اختبار مغامرة «إنقاذ القرية» من البداية إلى النهاية: الفتح بعد الوحدة الأولى، القائمة، كل المهام والألغاز، الحراس، الحفظ والمتابعة، والجوائز.
// node adv-test.mjs [مجلد اللقطات] [--3d]   (يحتاج خادم اللعبة على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null, d3 = process.argv.includes('--3d');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = []; const ok = (n, c, i = '') => { results.push([c ? '✅' : '❌', n, i]); if (!c) console.log('❌', n, i); };
const b = await chromium.launch({ channel: 'chrome' }); const page = await b.newPage({ viewport: { width: 1000, height: 640 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
const shot = async n => { if (out) await page.screenshot({ path: `${out}/adv-${n}.png` }); };
await page.goto('http://localhost:8000/' + (d3 ? '' : '?2d=1')); await page.evaluate(() => localStorage.clear()); await page.reload();
await page.click('#bNew'); await page.fill('#hname', 'سالم'); await page.click('#bGo');
await page.waitForFunction(() => window.__game && window.__game.W, null, { timeout: 60000 });
for (let i = 0; i < 40 && !(await page.$('#dialog.on')); i++) { await page.evaluate(() => { const s = document.getElementById('screen'); if (s && s.onclick) s.onclick(); }); await sleep(300); }
for (let i = 0; i < 12 && await page.$('#dialog.on'); i++) { await page.evaluate(() => document.getElementById('dialog').click()); await sleep(200); }
// أدوات الصفحة: تنفيذ فعل في المغامرة مع تمرير الحوارات حتى ينتهي
await page.evaluate(() => {
  const z = ms => new Promise(r => setTimeout(r, ms));
  window.__do = async (fn) => { let fin = false; const p = Promise.resolve(fn(window.__adv)).then(v => { fin = true; return v; });
    for (let i = 0; i < 400; i++) { await z(120); const d = document.querySelector('.advDlg.on'); if (d && !d.querySelector('[data-o]')) { d.click(); continue; } if (fin && !window.__adv.busy()) break; } return p; };
});
const act = (src) => page.evaluate(`window.__do(A => ${src})`);
const st = () => page.evaluate(() => { const A = window.__adv; return { area: A.area, flags: A.S.flags, inv: A.S.inv, stars: A.S.stars, goal: document.querySelector('.advGoal').textContent }; });

// ١. مقفلة قبل الوحدة الأولى
await page.evaluate(() => document.getElementById('bBag').click()); await sleep(300); await page.evaluate(() => document.getElementById('advBtn').click()); await sleep(300);
ok('القائمة: المغامرة مقفلة قبل إكمال الوحدة الأولى', /تُفتح بإكمال وحدة/.test(await page.textContent('#panel')) && !(await page.$('[data-adv="rescue"]')));
await shot('1-list-locked'); await page.click('[data-close]');
// ٢. إكمال الوحدة الأولى يفتح المغامرة ويظهر الإشعار
await page.evaluate(async () => { const { LESSONS } = await import('/content/lessons.js'); const s = window.__game.state; LESSONS.filter(l => l.u === 0).forEach(l => { s.quests.done[l.id] = Date.now(); }); const { bus } = await import('/core/events.js'); const { checkAdventureUnlocks } = await import('/adventure/index.js'); checkAdventureUnlocks(); });
await page.waitForSelector('.advUnlock', { timeout: 8000 }).catch(() => {});
ok('إشعار «فُتحت مغامرة جديدة» بعد إكمال الوحدة', !!(await page.$('.advUnlock')) && /إنقاذ القرية/.test(await page.textContent('.advUnlock')));
await shot('2-unlock'); await page.click('.advUnlock [data-go]');
await page.waitForSelector('.adv', { timeout: 8000 }); await sleep(1500);
await shot('3-intro');
await page.evaluate(() => window.__do(() => Promise.resolve()));   // مقدمة القصة
ok('المغامرة تبدأ: مقدمة، هدف أول، العالم مستقل (اللعبة متوقفة خلفه)', /الحارث/.test((await st()).goal) && await page.evaluate(() => window.__game.eng.paused === true));
// ٣. القرية
await act("A.use('harith')"); ok('مهمة ١: الحديث مع الشيخ الحارث', (await st()).flags.met);
await act("A.use('c_home')"); ok('مهمة ٢: الفانوس من صندوق البيت', !!(await st()).inv.lantern);
await act("A.goTile(4, 16)"); await act("A.tapTile(4, 17)"); ok('الشوك لا يُقص بلا منجل', !(await page.evaluate(() => window.__adv.S.cut['village:4,17'])));
await act("A.use('c_shed')"); ok('المنجل من صندوق السقيفة', !!(await st()).inv.sickle);
await act("A.goTile(4, 16)"); await act("A.tapTile(4, 17)"); ok('قص الشوك بالمنجل يفتح الطريق', !!(await page.evaluate(() => window.__adv.S.cut['village:4,17'])));
await shot('4-farm');
await act("A.use('salem')"); ok('مهمة ٣: إنقاذ العم سالم', (await st()).flags.salem);
// ٤. المعسكر
await act("A.goTile(31, 11)"); await sleep(900); ok('الانتقال إلى معسكر العصابة', (await st()).area === 'camp');
await page.evaluate(() => window.__do(() => Promise.resolve())); await sleep(400);
await shot('5-camp');
// الحراس: الوقوف أمام حارس يعيدك لآخر نار آمنة
const caught = await page.evaluate(async () => { const A = window.__adv, g = A.ent('gA'); A.tp(Math.round(g.px) + 2, Math.round(g.py)); g.ang = 0; g.pause = 3; await new Promise(r => setTimeout(r, 2600)); return A.hero(); });
ok('الحارس يراك فتعود بهدوء إلى النار الآمنة (لا عقاب)', caught.x <= 3, JSON.stringify(caught));
await page.evaluate(() => { window.__adv.S.flags.invisible = 1; });   // باقي الاختبار بلا حراس
await act("A.goTile(10, 10)"); await act("A.tapTile(17, 16)"); await sleep(600);   // ضغطة واحدة على الصندوق من بعيد: يمشي البطل خلفه ويدفعه حتى لوحته
ok('ضغطة واحدة تدفع الصندوق الأول حتى لوحته', await page.evaluate(() => { const b = window.__adv.ent('b1'); return b.x === 19 && b.y === 16; }));
await act("A.tapTile(23, 14)"); await sleep(600);
ok('لغز الصناديق: اللوحتان مضغوطتان فينفتح القفص', await page.evaluate(() => window.__adv.ent('cage').open === true));
await shot('6-cage');
await act("A.use('yousef')"); ok('مهمة ٤: تحرير يوسف', (await st()).flags.yousef);
await act("A.use('c_keys')"); ok('مهمة ٥: حلقة المفاتيح', !!(await st()).inv.keys);
await act("A.goTile(25, 17)"); ok('المطرقة (اختيارية)', !!(await st()).inv.hammer);
await act("A.goTile(5, 6)"); await act("A.goTile(25, 1)"); ok('نجمتان مخفيتان في المعسكر', (await st()).stars === 2, 'stars=' + (await st()).stars);
// ٥. الحفظ والمتابعة: الخروج ثم العودة من القائمة
await page.click('.advX'); await sleep(500);
ok('الخروج يحفظ ويعيد اللعبة', !(await page.$('.adv')) && await page.evaluate(() => window.__game.eng.paused === false));
await page.evaluate(() => document.getElementById('bBag').click()); await sleep(300); await page.evaluate(() => document.getElementById('advBtn').click()); await sleep(300);
ok('القائمة تعرض «تابع المغامرة»', /تابع المغامرة/.test(await page.textContent('#panel')));
await page.click('[data-adv="rescue"]'); await page.waitForSelector('.adv'); await sleep(1200);
ok('المتابعة من نفس المكان بنفس الأدوات', (await st()).area === 'camp' && !!(await st()).inv.keys);
await page.evaluate(() => { window.__adv.S.flags.invisible = 1; });
await act("A.goTile(0, 10)"); await sleep(900); ok('العودة إلى القرية', (await st()).area === 'village');
await act("A.use('wdoor')"); ok('مهمة ٦: فتح المخزن وإنقاذ ناصر', (await st()).flags.naser);
await act("A.use('lv_red')"); await sleep(900); ok('رافعة بترتيب خاطئ تُعاد بهدوء', !(await st()).flags.tower_open && !(await page.evaluate(() => window.__adv.ent('lv_red').on)));
await act("A.use('lv_blue')"); await act("A.use('lv_red')"); await act("A.use('lv_green')"); await sleep(500);
ok('لغز الراية: الترتيب الصحيح يفتح البرج', (await st()).flags.tower_open && await page.evaluate(() => window.__adv.ent('gtower').open));
await act("A.use('maryam')"); ok('مهمة ٧: إنقاذ الجدة مريم والحصول على الشعلة', (await st()).flags.maryam && !!(await st()).inv.torch);
await act("A.goTile(28, 7)"); await act("A.tapTile(29, 7)"); await act("A.goTile(30, 7)"); await act("A.goTile(23, 16)"); await act("A.goTile(1, 13)");
ok('النجوم الخمس (منها خلف صخرة تُكسر بالمطرقة)', (await st()).stars === 5, 'stars=' + (await st()).stars);
await act("A.use('square')"); ok('إشعال الشعلة من نار الساحة', !!(await st()).inv.fire);
await shot('7-village');
await act("A.use('bc1')"); await act("A.use('bc2')"); await shot('8-beacons'); await act("A.use('bc3')"); await sleep(800);
ok('مهمة ٨: المنارات الثلاث تنهي المغامرة', !!(await page.$('.advEnd')));
await shot('9-end');
const end = await page.textContent('.advEnd');
ok('شاشة النهاية: ٥ نجوم والمكافآت', /٥ من ٥/.test(end) && /وشاح حامي القرية/.test(end));
await page.click('.advEnd [data-home]'); await sleep(600);
const s = await page.evaluate(() => { const s = window.__game.state; return { done: s.adventures.rescue.done, best: s.adventures.rescue.best, cape: !!s.gear.owned.cape, statue: !!s.decor.statue, gems: s.gems, badge: !!(s.achievements || {}).b_adv_rescue }; });
ok('الجوائز: الوشاح، والتمثال في الساحة، والجواهر، والوسام', s.done && s.best === 5 && s.cape && s.statue && s.gems >= 30 && s.badge, JSON.stringify(s));
await page.evaluate(() => { const s = window.__game.state; s.gear.worn.cape = true; const W = window.__game.W; W.player.x = 1210; W.player.y = 640; window.__game.eng.snap(W.player); window.__game.eng.paused = false; });
await sleep(1500); await shot('10-statue');
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n'));
await b.close();
