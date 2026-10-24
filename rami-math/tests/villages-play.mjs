// لعب قرية كاملة آلياً (الصفان ٨ و٩): لكل درس بالترتيب: فتح محطته، الحوار، جولات المهمة (محاولة خاطئة يجب أن تعطي تلميحاً ثم الصحيحة)،
// ثم التحدي (خطأ في أول سؤال ثم حل كل الأسئلة من بياناتها)، وشاشة النجوم، والتحقق من إنهاء الدرس وعدم وجود أخطاء في الكونسول.
// node villages-play.mjs [الصف] [رقم الوحدة من ٠] [مجلد اللقطات] [--3d] (الخادم على 8000)
import { chromium } from 'playwright-core';
const args = process.argv.slice(2).filter(a => !a.startsWith('--')), D3 = process.argv.includes('--3d');
const [G = '8', U = '0', OUT = ''] = args;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } }); const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e.stack || e)));
await p.addInitScript(([g, d3]) => { localStorage.setItem('ramimath_grade_asked', '1'); localStorage.setItem('ramimath_grade', g); localStorage.setItem('ramimath_3d', d3 ? '1' : '0'); }, [G, D3]);
await p.goto(`http://localhost:8000/?grade=${G}`); await sleep(1500);
await p.evaluate(async g => { const m = await import('/core/state.js'); const st = m.fresh({ name: 'سالم', kind: 'boy', skin: '#C68A5B', color: '#2F6FB2' }); localStorage.setItem('ramimath_village_v1_g' + g, JSON.stringify(st)); }, G);
await p.reload(); await sleep(2000); await p.click('#bCont'); await sleep(800);
const E = (f, a) => p.evaluate(f, a);
async function until(f, what, ms = 15000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return; await sleep(80); } throw new Error('انتهت المهلة: ' + what); }
const shot = async n => { if (OUT) await p.screenshot({ path: `${OUT}/${n}.png` }); };
// يتقدم في الحوار ما دام ظاهراً
let talkShot = false;
async function talkThrough() { for (let k = 0; k < 12; k++) { if (!talkShot && await E(() => !!document.querySelector('.vtalk'))) { talkShot = true; await sleep(300); await shot('t_talk'); } if (!(await E(() => !!document.querySelector('.vtalk')))) { await sleep(300); if (!(await E(() => !!document.querySelector('.vtalk')))) return; } await p.mouse.click(640, 700); await sleep(320); } }

await E(u => window.__villages.enter(+u), U); await until(() => E(() => !!window.__villages.api), 'دخول القرية', 20000); await sleep(1500);
await shot('v_village');
const ids = await E(u => window.__villages.LESSONS.filter(l => l.u === +u).map(l => l.id), U);
let passed = 0;
for (const id of ids) {
  const t0 = Date.now();
  try {
    await E(id => window.__villages.api.open(id), id);
    await sleep(600); await talkThrough();
    await until(() => E(() => !!document.querySelector('.vm .vm-scene')), 'لوحة المهمة');
    for (let i = 0; i < 9; i++) {   // عدد الجولات من المهمة نفسها: تنتهي حين تُغلق لوحتها
      await until(() => E(i => window.__vm && window.__vm.r && !window.__vm.done && document.querySelector('.vm header small')?.textContent.startsWith('الجولة ' + ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'][i]), i), `الجولة ${i + 1}`);
      if (i === 1) await shot(`m_${id}`);
      // خطأ مقصود ثم الصحيح، من بيانات الجولة نفسها
      const res = await E(() => {
        const r = window.__vm.r, I = r.input, cand = [];
        if (I.type === 'pick') I.opts.forEach((_, k) => cand.push(k)); else if (I.type === 'cells') cand.push(r.sol.slice(1), r.sol); else if (I.type === 'grid') cand.push(r.sol.map(([x, y]) => [x + 1, y]), r.sol); else if (I.type === 'steps') cand.push([(r.sol[0] + 1) % I.steps[0].opts.length], r.sol); else if (I.type === 'ray') cand.push({ ...r.sol, closed: !r.sol.closed }, r.sol); else if (I.type === 'mix') cand.push(r.sol.map(v => v * 2), r.sol); else if (I.type === 'chips') cand.push(r.sol.slice(1).length ? r.sol.slice(1) : [r.sol[0] + 1], r.sol); else if (I.type === 'blanks') cand.push(r.sol.map((v, i) => i ? v : v + 1), r.sol); else if (I.type === 'frac') { const fc = []; for (let w = 0; w <= 60; w++) { fc.push({ w, n: 0, d: 1 }); for (let d = 2; d <= 60; d++) for (let n = 1; n < d; n++) fc.push({ w, n, d }); } cand.push({ w: 0, n: 0, d: 0 }, ...fc); } else if (I.type === 'dial') for (let v = I.min; v <= I.max; v += I.step || 1) cand.push(Math.round(v * 1000) / 1000); else { for (let v = -2000; v <= 2000; v++) [1, 10, 100, 1000, 10000].forEach(d => cand.push(v / d)); for (let v = 1; v <= 100; v++) [100, 1000, 10000].forEach(m => cand.push(v * m, -v * m)); for (let v = 2001; v <= 20000; v++) cand.push(v / 100); }
        if ((I.type === 'num' || I.type === 'frac') && r.sol != null) cand.unshift(r.sol);   // أجوبة كبيرة أو بمنزلة من الآلة الحاسبة (الوحدة ٦)
        const right = cand.find(v => r.ok(v)), wrong = cand.find(v => !r.ok(v));
        window.__vm.answer(wrong); const bad = document.querySelector('.vm-msg.bad')?.textContent || '';
        window.__vm.answer(right); return { bad, good: !!document.querySelector('.vm-msg.good'), right };
      });
      if (!res.bad.trim()) throw new Error(`الجولة ${i + 1}: الخطأ بلا تلميح`);
      if (!res.good) throw new Error(`الجولة ${i + 1}: الجواب الصحيح (${res.right}) لم يُقبل`);
      await E(() => document.querySelector('.vm .vm-go').click());
      if (!(await E(() => !!document.querySelector('.vm .vm-scene')))) break;
    }
    await sleep(500); await talkThrough();
    // التحدي
    await until(() => E(() => !!document.querySelector('#panel .chSheet')), 'فتح التحدي');
    await shot(`c_${id}`);
    for (let i = 0; ; i++) {
      const st = await E(id => { const d = window.__villages.state.quests.data[id]; return d && d.ch ? { i: d.ch.i, n: d.ch.items.length, it: d.ch.items[d.ch.i] } : null; }, id);
      if (!st || st.i >= st.n || await E(() => !!document.querySelector('.vm-end'))) break;
      await until(() => E(n => { const s = document.querySelector('#panel .chSheet'); return !!s && !s.querySelector('.chBurst') && +s.dataset.i === n; }, st.i), `ظهور سؤال التحدي ${st.i + 1}`, 8000);   // بعد الاحتفال القصير
      const it = st.it, click = (sel, k) => E(([sel, k]) => { const x = document.querySelectorAll('#panel ' + sel)[k]; if (!x) throw new Error('غير موجود: ' + sel + k); x.click(); }, [sel, k]);
      if (i === 0 && (it.type === 'choice' || it.type === 'tf')) { await click('.chOpt', it.ans === 0 ? 1 : 0); await until(() => E(() => document.getElementById('benchMsg')?.classList.contains('bad')), 'تلميح خطأ التحدي', 4000); }
      if (it.type === 'choice' || it.type === 'tf') await click('.chOpt', it.ans);
      else if (it.type === 'multi') { for (const k of it.ans) await click('.chOpt', k); await click('#chGo', 0); }
      else if (it.type === 'order') { for (const k of it.ans) await click('.chOpt', k); await click('#chGo', 0); }
      else if (it.type === 'match') { for (let k = 0; k < it.ans.length; k++) { await click('.chL', k); await click('.chR', it.ans[k]); } await click('#chGo', 0); }
      else if (it.type === 'num') { const s = String(+(+it.ans).toFixed(3)).replace('-', '−'); for (const k of [...s, 'go']) await E(k => document.querySelector(`#panel #chPad [data-k="${k}"]`).click(), k); }
      else throw new Error('نوع سؤال غير مدعوم في الاختبار: ' + it.type);
      await until(() => E(([id, i]) => { const d = window.__villages.state.quests.data[id]; return !d.ch || d.ch.i > i || !!document.querySelector('.vm-end'); }, [id, st.i]), `حل سؤال التحدي ${st.i + 1} (${it.type})`, 8000);
      await sleep(250);
    }
    await until(() => E(() => !!document.querySelector('.vm-end')), 'شاشة النجوم');
    if (id === ids[0]) await shot('e_end');
    await E(() => document.querySelector('.vm-end .vm-go').click());
    await until(() => E(id => !!window.__villages.state.quests.done[id], id), 'تسجيل إنهاء الدرس');
    passed++; console.log(`✅ ${id} (${((Date.now() - t0) / 1000).toFixed(1)} ث)`);
  } catch (e) { console.log(`❌ ${id}: ${e.message}`); await shot('fail_' + id); break; }
}
await sleep(800); await shot('z_after');
// مغامرة القرية بعد إنهاء دروسها: لاعب آلي يقرأ السكة أمامه (يتفادى الصخور ويقفز فوق الكسور)
if (passed === ids.length && await E(() => { const b = document.querySelector('[data-a=adv]'); return !!b && !b.hidden; })) {
  try {
    await E(() => document.querySelector('[data-a=adv]').click()); await until(() => E(() => !!(window.__vadv || window.__adv)), 'بدء المغامرة');
    if (await E(() => !window.__vadv && !!window.__adv)) {   // مغامرة بمحرك البلاطات (adventure/engine.js): تُلعب كاملة في اختبارها tests/adv-g8<القرية>.mjs
      await sleep(2500); await shot('adv_tile'); await E(() => document.querySelector('.advX').click()); await sleep(1500);
      console.log('🗺️ المغامرة بدأت وأُغلقت (تُلعب كاملة في اختبار adv-g8 الخاص بها)'); throw { skip: 1 };
    }
    const t0 = Date.now(); let shotDone = false;
    while (Date.now() - t0 < 240000 && !(await E(() => !!document.querySelector('.vm-end')))) {
      await E(() => { const S = window.__vadv; if (!S || S.done) return; const key = k => dispatchEvent(new KeyboardEvent('keydown', { key: k }));
        const ahead = [...(window.__vadvThings || [])]; });
      await p.keyboard.press(await E(() => { const S = window.__vadv; if (!S || S.done) return 'x'; const T = S.things || []; const near = T.filter(t => !t.hit && t.z > S.z && t.z < S.z + 9);
        if (near.some(t => t.kind === 'gap' && t.z < S.z + 2.2)) return 'ArrowUp';
        if (near.some(t => t.kind === 'rock' && t.lane === S.lane)) { const free = [0, 1, 2].filter(l => !near.some(t => t.kind === 'rock' && t.lane === l)); const to = free.sort((a, b) => Math.abs(a - S.lane) - Math.abs(b - S.lane))[0]; return to === undefined ? 'x' : to < S.lane ? 'ArrowLeft' : to > S.lane ? 'ArrowRight' : 'x'; }
        const gem = near.find(t => t.kind === 'gem'); if (gem && gem.lane !== S.lane && !near.some(t => t.kind === 'rock' && t.lane === gem.lane)) return gem.lane < S.lane ? 'ArrowLeft' : 'ArrowRight';
        return 'x'; }));
      if (!shotDone && Date.now() - t0 > 9000) { await shot('adv_ride'); shotDone = true; }
      await sleep(60);
    }
    await until(() => E(() => !!document.querySelector('.vm-end')), 'نهاية المغامرة', 5000); await shot('adv_end');
    const r = await E(() => ({ gems: window.__vadv.gems, hits: window.__vadv.hits }));
    await E(() => document.querySelector('.vm-end .vm-go').click()); await sleep(500);
    const saved = await E(() => JSON.stringify((window.__villages.state.vil.adv || {})));
    console.log(`🎢 المغامرة انتهت: ${r.gems} بلّورة، ${r.hits} اصطدام — المحفوظ: ${saved}`);
  } catch (e) { if (!e.skip) { console.log('❌ المغامرة: ' + e.message); await shot('fail_adv'); } }
}
// بعد إنهاء القرية: القرية التالية مفتوحة في الخريطة
await E(() => document.querySelector('[data-a=map]').click()); await sleep(1200);
const next = await E(u => { const n = document.querySelector(`.hnode[data-u="${+u + 1}"]`); return !!n && !n.classList.contains('lock'); }, U);
console.log(next ? '🚪 القرية التالية فُتحت في الخريطة' : '❌ القرية التالية ما زالت مقفلة');
await shot('z_hub');
console.log(`النتيجة: ${passed} من ${ids.length} — أخطاء الكونسول: ${errs.length}${errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''}`);
await b.close();
