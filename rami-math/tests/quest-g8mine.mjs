// اختبار مغامرة منجم الأعماق بمحرك مغامرات القرى: الفصول الستة بأدواتها الحقيقية (أزرار، نقر، توقيت)، وخطأ مقصود في بعضها،
// والتحقق من بطاقة كل فصل ورسائل اللاسلكي، ثم الختام والجائزة. node quest-g8mine.mjs [مجلد اللقطات] (الخادم على 8000)
import { chromium } from 'playwright-core';
const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const sleep = ms => new Promise(r => setTimeout(r, ms)), results = [], ok = (n, c, i = '') => results.push([c ? '✅' : '❌', n, i]);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1100, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(() => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', '8'); localStorage.setItem('ramimath_3d', '0'); });
await p.goto('http://localhost:8000/?grade=8&2d=1'); await sleep(1200);
await p.evaluate(async () => { const m = await import('/core/state.js'), { LESSONS } = await import('/content/lessons.js'); const s = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' });
  LESSONS.filter(l => l.u === 0).forEach(l => { s.quests.done[l.id] = Date.now(); s.quests.data[l.id] = { stars: 3 }; }); localStorage.setItem('ramimath_village_v1_g8', JSON.stringify(s)); });
await p.reload(); await sleep(1500); await p.click('#bCont'); await sleep(400); await p.evaluate(() => window.__villages.enter(0)); await sleep(2500);
await p.click('[data-a=adv]'); await sleep(1500);
const shot = async n => { if (out) await p.screenshot({ path: `${out}/${n}.png` }); };
const radio = () => p.evaluate(() => document.querySelector('.qz-radio p').textContent);
const startCh = async (n, title) => { await p.waitForFunction(t => { const h = document.querySelector('.qz-card h2'); return h && h.textContent === t; }, title, { timeout: 60000 }); ok(`بطاقة الفصل ${n}: «${title}»`, true); await shot(`q${n}a`); await p.click('.qz-card button'); await sleep(900); };
// ١ النزول: إطلاق، توجيه بعيداً عن العوارض، ثم توقّف قرب المحطة
await startCh(1, 'النزول'); ok('اللاسلكي يرشد', await p.evaluate(() => !document.querySelector('.qz-radio').hidden));
await p.evaluate(() => document.querySelector('.qz-ctl [data-id=B]').onpointerdown(new Event('pointerdown')));
for (let k = 0; k < 600; k++) {
  const r = await p.evaluate(() => { const q = window.__qch, st = q.st; if (st.stop) return 'end'; const bm = q.beams.find(b => !b.hit && b.d > st.d && b.d < st.d + 4); q.ctl.held.L = !!bm && bm.side > 0; q.ctl.held.R = !!bm && bm.side < 0;
    if (q.DEPTH - st.d < 1.6) { document.querySelector('.qz-ctl [data-id=B]').onpointerdown(new Event('pointerdown')); return 'stop'; } return st.d; });
  if (r === 'end' || r === 'stop') break; await sleep(100);
}
await shot('q1b'); ok('١. القفص توقف عند المحطة', await p.evaluate(() => window.__qch.st.stop));
// ٢ ضوء المصباح: المشي بالنقر بين نقاط طريق على الخريطة
await startCh(2, 'ضوء المصباح');
const walk = (tx, ty) => p.evaluate(async ([tx, ty]) => { const q = window.__qch, M = q.MAP, h = q.hero, s = [Math.floor(h.x), Math.floor(h.y)], k = (x, y) => x + ',' + y, prev = new Map([[k(...s), null]]), Q = [s];
  while (Q.length) { const [x, y] = Q.shift(); if (x === tx && y === ty) break; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (M[ny] && M[ny][nx] === '.' && !prev.has(k(nx, ny))) { prev.set(k(nx, ny), [x, y]); Q.push([nx, ny]); } } }
  if (!prev.has(k(tx, ty))) return false; const path = []; let c = [tx, ty]; while (c) { path.unshift(c); c = prev.get(k(...c)); }
  for (const [x, y] of path) { h.tx = x + .5; h.ty = y + .5; for (let i = 0; i < 40 && Math.hypot(h.x - h.tx, h.y - h.ty) > .1; i++) await new Promise(r => setTimeout(r, 40)); } return true; }, [tx, ty]);
const reach = [];
for (const s of await p.evaluate(() => window.__qch.shards.map(s => [Math.floor(s.x), Math.floor(s.y)]))) reach.push(await walk(...s));
await shot('q2b'); const oil = await p.evaluate(() => window.__qch.oils.map(o => [Math.floor(o.x), Math.floor(o.y)])); reach.push(await walk(...oil[1]));
ok('الشظايا وجرار الزيت قابلة للوصول', reach.every(Boolean), JSON.stringify(reach)); ok('٢. جُمعت الشظايا الثلاث', await p.evaluate(() => window.__qch.got === 3));
const door = await p.evaluate(() => [Math.floor(window.__qch.door.x), Math.floor(window.__qch.door.y)]); await walk(...door);
// ٣ النهر: خطأ مقصود (صخرة غائصة) ثم القفز حين تطفو
await startCh(3, 'النهر الجوفي');
const wrong = await p.evaluate(async () => { const q = window.__qch; for (let i = 0; i < 120; i++) { const c = [0, 1, 2].find(c => !q.up(q.rows[0][c])); if (c != null) { q.jump(0, c); return q.st.row === -1; } await new Promise(r => setTimeout(r, 50)); } return null; });
await sleep(200); ok('القفز إلى صخرة غائصة لا يتم ويعطي تلميحاً', wrong === true && /تحت الماء/.test(await radio()));
await p.evaluate(async () => { const q = window.__qch; for (let i = 0; i < 2500 && q.st.row < q.ROWS; i++) { const r = q.st.row + 1;
  if (q.st.hop <= 0) { if (r === q.ROWS) q.jump(r, 1); else { const c = [q.st.col, q.st.col - 1, q.st.col + 1, 0, 1, 2].find(c => c >= 0 && c < 3 && (q.st.row < 0 || Math.abs(c - q.st.col) <= 1) && q.up(q.rows[r][c])); if (c != null) q.jump(r, c); } }
  await new Promise(r => setTimeout(r, 100)); } });
ok('٣. العبور إلى الضفة الأخرى', await p.evaluate(() => window.__qch.st.row === window.__qch.ROWS)); await shot('q3b');
// ٤ المحوّلات: إطلاق خاطئ ثم ضبط المحوّلين، ثم المستوى الثاني
await startCh(4, 'المحوّلات');
await p.evaluate(() => window.__qch.go()); await sleep(5500); ok('طريق مسدود يعيد العربة ويعطي تلميحاً', await p.evaluate(() => window.__qch.lv === 0 && !window.__qch.run) && /مسدود/.test(await radio()));
await p.evaluate(() => { const s = window.__qch.sw; s.a = 0; s.c = 1; window.__qch.go(); }); await sleep(7000); ok('الحاجز الأول يتحطم وينتقل إلى المستوى الثاني', await p.evaluate(() => window.__qch.lv === 1));
await shot('q4b'); await p.evaluate(() => { const s = window.__qch.sw; s.a = 0; s.e = 1; s.i = 1; window.__qch.go(); });
// ٥ الإنقاذ: ضغطة خارج المنطقة ثم ضغطات في الوسط
await startCh(5, 'الإنقاذ');
await p.evaluate(() => window.__qch.press()); await sleep(300);
await p.evaluate(async () => { const q = window.__qch; for (let i = 0; i < 300 && Math.abs(q.st.a) < .7; i++) await new Promise(r => setTimeout(r, 20)); q.press(); });
ok('الضغط خارج الأخضر لا يرفع ويعطي تلميحاً', await p.evaluate(() => window.__qch.st.lvl === 0 && window.__qch.st.misses === 1));
await p.evaluate(async () => { const q = window.__qch; for (let i = 0; i < 4000 && !q.st.done; i++) { if (Math.abs(q.st.a) < q.zone() * .5) { q.press(); await new Promise(r => setTimeout(r, 250)); } await new Promise(r => setTimeout(r, 10)); } });
ok('٥. رفع العارضة أربع درجات', await p.evaluate(() => !!window.__qch.st.done)); await shot('q5b');
// ٦ الهروب بالعربة (لاعب آلي)
await startCh(6, 'الهروب');
await p.waitForFunction(() => window.__vadv && !window.__vadv.done, null, { timeout: 20000 });
const t0 = Date.now(); while (Date.now() - t0 < 240000 && !(await p.evaluate(() => !!document.querySelector('.vm-end')))) {
  const k = await p.evaluate(() => { const S = window.__vadv; if (!S || S.done) return 'x'; const near = (S.things || []).filter(t => !t.hit && t.z > S.z && t.z < S.z + 9);
    if (near.some(t => t.kind === 'gap' && t.z < S.z + 2.2)) return 'ArrowUp';
    if (near.some(t => t.kind === 'rock' && t.lane === S.lane)) { const f = [0, 1, 2].filter(l => !near.some(t => t.kind === 'rock' && t.lane === l)).sort((a, b) => Math.abs(a - S.lane) - Math.abs(b - S.lane))[0]; return f === undefined ? 'x' : f < S.lane ? 'ArrowLeft' : f > S.lane ? 'ArrowRight' : 'x'; } return 'x'; });
  await p.keyboard.press(k); await sleep(60); }
await p.click('.vm-end .vm-go'); ok('٦. النجاة بالعربة', true);
await p.waitForSelector('.qz-end button', { timeout: 40000 }); await shot('q7'); ok('الختام: بطاقة الإكمال والجوائز', await p.evaluate(() => /منقذ الأعماق/.test(document.querySelector('.qz-end').textContent)));
await p.click('.qz-end button'); await sleep(600);
ok('النتيجة محفوظة والوسام ممنوح', await p.evaluate(() => { const v = window.__villages.state.vil; return !!(v.adv && v.adv.mine) && !!(v.badges && v.badges.deepRescue) && !!v.quest.g8mine.done; }));
ok('لا أخطاء في الكونسول', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log(results.map(r => r.join(' ')).join('\n')); console.log(`النتيجة: ${results.filter(r => r[0] === '✅').length} من ${results.length}`); await b.close();
