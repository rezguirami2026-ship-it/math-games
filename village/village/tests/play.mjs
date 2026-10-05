// اختبار آلي: يلعب دروس قرية الخير بالترتيب في متصفح Chrome حقيقي.
// لكل درس: محاولة خاطئة أولاً (يجب ألا يتقدم الدرس)، ثم الحل الصحيح (يجب أن ينتهي الدرس).
// ويتحقق أيضاً من عدم وجود أخطاء في الكونسول، ومن إغلاق البوابات قبل وقتها وفتحها بعده.
// التشغيل: cd tests && npm install && npm test        (أو: node play.mjs --show لرؤية المتصفح)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOW = process.argv.includes('--show');
const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── خادم ملفات بسيط (الوحدات لا تعمل من file://) ── */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([\\/])+/, '') || 'index.html';
  if (p === 'favicon.ico') { res.writeHead(204); return res.end(); }   // المتصفح يطلبه تلقائياً
  try { const body = await readFile(join(ROOT, p)); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, r));
const URL_ = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ channel: 'chrome', headless: !SHOW });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

/* ── أدوات اللعب ── */
const G = (fn, arg) => page.evaluate(fn, arg);
const data = id => G(id => window.__game.quests.data(id), id);
const isDone = id => G(id => window.__game.quests.isDone(id), id);
async function until(cond, what, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await cond()) return; await sleep(50); }
  throw new Error('انتهت المهلة: ' + what);
}
// يغلق الحوارات وبطاقات الفصول حتى تعود اللعبة حرة
async function settle(ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const st = await G(() => ({ dialog: document.getElementById('dialog').classList.contains('on'), chapter: document.getElementById('screen').classList.contains('chapter'), busy: window.__game.game.busy, panel: document.getElementById('panel').classList.contains('on') }));
    if (st.dialog) await G(() => document.getElementById('dialog').click());
    else if (st.chapter) await G(() => { const s = document.getElementById('screen'); if (s.onclick) s.onclick(); });
    else if (!st.busy || st.panel) return;
    await sleep(120);
  }
  throw new Error('اللعبة بقيت مشغولة');
}
// ينقل البطل مباشرة إلى نقطة (بدل المشي) ثم ينتظر أن تُرسم الأزرار
async function goTo(x, y) {
  await G(([x, y]) => { const p = window.__game.W.player; p.x = x; p.y = y; p.route = null; p.target = null; }, [x, y]);
  await sleep(120);
}
// يضغط زراً من أزرار الفعل بنصه الكامل (أو بدايته)
async function press(label, { prefix = false, wait = 120 } = {}) {
  let ok = false;
  for (let i = 0; i < 40 && !ok; i++) {
    ok = await G(([label, prefix]) => {
      const b = [...document.querySelectorAll('#actions button')].find(b => !b.disabled && (prefix ? b.textContent.startsWith(label) : b.textContent === label));
      if (b) b.click(); return !!b;
    }, [label, prefix]);
    if (!ok) await sleep(50);
  }
  if (!ok) throw new Error(`الزر غير موجود: «${label}» — الأزرار: ${await G(() => [...document.querySelectorAll('#actions button')].map(b => b.textContent).join(' | '))}`);
  await sleep(wait);
}
// يذهب إلى صاحب الدرس ويتحدث معه (يبدأ الدرس أو يستأنفه)
async function talk(giver) {
  const n = await G(id => { const n = window.__game.W.npcs.find(n => n.id === id); return { x: n.x, y: n.y, name: n.name }; }, giver);
  await goTo(n.x, n.y + 26);
  await press('💬 ' + n.name);
  await settle();
}
const panelClick = sel => G(sel => { const b = document.querySelector('#panel ' + sel); if (!b) throw new Error('غير موجود: ' + sel); b.click(); }, sel);

/* ── حلول الدروس: wrong() محاولة خاطئة، right() الحل ── */
const W = {};   // مواضع من ملفات العالم، تُقرأ من اللعبة نفسها
const S = {};

// ١. القيمة المكانية
const PILES = [{ x: 140, y: 548, label: '١٠٠٠' }, { x: 205, y: 548, label: '١٠٠' }, { x: 265, y: 548, label: '١٠' }, { x: 320, y: 548, label: '١' }], CART = { x: 520, y: 552 };
S.placeValue = async () => {
  const load = async (k, n) => { await goTo(PILES[k].x, PILES[k].y + 20); for (let i = 0; i < n; i++) await press('📦 احمل صندوق ' + PILES[k].label); await goTo(CART.x, CART.y + 20); await press('⬇ ضع على العربة'); };
  // خطأ: صندوق آحاد واحد فقط
  await load(3, 1); await press('🚚 أرسل الشحنة');
  expect((await data('placeValue')).r === 0, 'شحنة خاطئة قُبلت');
  await press('⬆ أنزل ١'); await goTo(PILES[3].x, PILES[3].y + 20); await press('↩ أعِد صندوقاً');
  for (let r = 0; r < 3; r++) {
    const v = (await data('placeValue')).rounds[r], dg = [Math.floor(v / 1000), Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];
    for (let k = 0; k < 4; k++) if (dg[k]) await load(k, dg[k]);
    await press('🚚 أرسل الشحنة');
  }
};
// ٢. المقارنة والتقريب
const DEPOT = { x: 470, y: 572 }, MARK = v => ({ x: 150 + (v / 100 - 1) * 150, y: 708 });
S.compareRound = async () => {
  for (let i = 0; i < 4; i++) {
    await goTo(DEPOT.x, DEPOT.y + 16); await press('📦 خذ الطرد', { prefix: true });
    const d = await data('compareRound'), v = d.items[d.hand], m = Math.round(v / 100) * 100;
    if (i === 0) {   // خطأ: لافتة مجاورة
      const bad = m === 900 ? 800 : m + 100; await goTo(MARK(bad).x, MARK(bad).y + 10); await press('📍 ضعه عند لافتة ' + ar(bad));
      expect((await data('compareRound')).placed.length === 0, 'طرد وُضع عند لافتة خاطئة');
    }
    await goTo(MARK(m).x, MARK(m).y + 10); await press('📍 ضعه عند لافتة ' + ar(m));
  }
};
// ٣. العوامل والمضاعفات
S.factorsMultiples = async () => {
  await goTo(210, 1462);
  await press('🌱 ازرع', { prefix: true });   // خطأ: ١ × ١
  expect((await data('factorsMultiples')).r === 0, 'زراعة خاطئة قُبلت');
  for (let r = 0; r < 3; r++) {
    const [n, kind, k] = (await data('factorsMultiples')).rounds[r], rows = kind === 'rows' ? k : n / k, cols = n / rows;
    for (let i = 1; i < rows; i++) await press('➕ صف');
    for (let i = 1; i < cols; i++) await press('➕ عمود');
    await press('🌱 ازرع', { prefix: true }); await until(async () => (await data('factorsMultiples')).r > r || await isDone('factorsMultiples'), 'جولة البستان');
  }
};
// ٤. الفردية والزوجية
const LETTERS = { x: 510, y: 1318 }, BOX_ODD = { x: 452, y: 1352 }, BOX_EVEN = { x: 568, y: 1352 };
S.oddEven = async () => {
  for (let i = 0; i < 6; i++) {
    await goTo(LETTERS.x, LETTERS.y + 14); await press('✉ خذ الرسالة');
    const d = await data('oddEven'), odd = d.letters[d.i].v % 2 === 1;
    const drop = async o => { const b = o ? BOX_ODD : BOX_EVEN; await goTo(b.x, b.y + 16); await press(o ? '📮 الصندوق الأحمر (فردي)' : '📮 الصندوق الأزرق (زوجي)'); };
    if (i === 0) { await drop(!odd); expect((await data('oddEven')).i === 0, 'رسالة في صندوق خاطئ قُبلت'); }
    await drop(odd);
  }
};
// ٥. الأعداد الأولية
const LAMPS = Array.from({ length: 12 }, (_, i) => ({ x: 700 + (i % 6) * 70, y: i < 6 ? 1280 : 1395 }));
const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
S.primeNumbers = async () => {
  const d = await data('primeNumbers'), light = async i => { await goTo(LAMPS[i].x, LAMPS[i].y + 12); await press('🔥 أشعل فانوس ' + ar(d.nums[i])); };
  await light(d.nums.findIndex(n => !isPrime(n)));
  expect((await data('primeNumbers')).lit.length === 0, 'فانوس غير أولي أُشعل');
  for (let i = 0; i < 12; i++) if (isPrime(d.nums[i])) await light(i);
};
// ٦. الضرب والقسمة على ١٠ و١٠٠ و١٠٠٠
S.powerOf10 = async () => {
  await goTo(1360, 1360);
  for (let r = 0; r < 4; r++) {
    const [a, b] = (await data('powerOf10')).rounds[r], up = b > a, k = Math.round(up ? b / a : a / b);
    if (r === 0) { await press((up ? '÷' : '×') + ar(k)); await until(async () => (await data('powerOf10')).show === null, 'الآلة'); expect((await data('powerOf10')).r === 0, 'تحويل خاطئ قُبل'); }
    await press((up ? '×' : '÷') + ar(k));
    await until(async () => (await data('powerOf10')).r > r, 'جولة الآلة');
  }
};
// ٧ و٨. الدكان: نقود بالضبط (الأسعار بالبيسة)
const PAY = { multiplyStrategies: [10000, 12000, 10000], decimalAdd: [7500, 3250, 4500] };
const coins = t => { const out = []; for (const c of [5000, 1000, 500, 100, 50]) while (t >= c) { out.push(c); t -= c; } return out; };
const shop = id => async () => {
  // talk() فتح الطاولة. خطأ: ٥٠ بيسة فقط
  await panelClick('.money[data-v="50"]'); await panelClick('#shopPay'); await sleep(150);
  expect((await data(id)).round === 0, 'دفع ناقص قُبل');
  await panelClick('.chip[data-i="0"]');
  for (const total of PAY[id]) { for (const c of coins(total)) await panelClick(`.money[data-v="${c}"]`); await panelClick('#shopPay'); await sleep(150); }
};
S.multiplyStrategies = shop('multiplyStrategies');
S.decimalAdd = shop('decimalAdd');
// ٩. القسمة مع الباقي: ٢٧ صندوقاً على ٦ شاحنات = ٤ لكل شاحنة والباقي ٣ للعربة
S.division1 = async () => {
  const P = W.village, trucks = await G(() => window.__game.W.trucks.map(t => ({ x: t.x, y: t.y })));
  const carry = async (n, to) => {
    await goTo(P.PILE.x, P.PILE.y + 20); for (let i = 0; i < n; i++) await press('📦 احمل صندوقاً');
    if (to === 'van') { await goTo(P.VAN.x, P.VAN.y + 16); for (let i = 0; i < n; i++) await press('⬇ ضع في العربة الصغيرة'); }
    else { await goTo(trucks[to].x, trucks[to].y - 40); for (let i = 0; i < n; i++) await press('⬇ ضع في الشاحنة'); }
  };
  // خطأ: ٥ في الأولى و٣ في الثانية
  await carry(5, 0); await carry(3, 1); for (let i = 2; i < 6; i++) await carry(4, i); await carry(3, 'van');
  await goTo(P.SIGNAL.x - 20, P.SIGNAL.y + 10); await press('🚦 أطلق القافلة'); await settle();
  expect(!(await isDone('division1')), 'قافلة غير متساوية انطلقت');
  await goTo(trucks[0].x, trucks[0].y - 40); await press('⬆ خذ منها'); await goTo(trucks[1].x, trucks[1].y - 40); await press('⬇ ضع في الشاحنة');
  await goTo(P.SIGNAL.x - 20, P.SIGNAL.y + 10); await press('🚦 أطلق القافلة');
};
// ١٠. المتتاليات
S.sequences = async () => {
  await goTo(810, 1452); await press('🪨 ابدأ العبور');
  const stone = async k => { await G(k => document.querySelectorAll('#actions button')[k].click(), k); await until(() => G(() => !window.__game.game.busy), 'القفز'); await sleep(120); };
  const d = await data('sequences');
  await stone((d.rows[0].ok + 1) % 3);   // خطأ: الحجر يغطس ويعود البطل إلى الضفة
  expect((await data('sequences')).slips === 1 && (await data('sequences')).row === -1, 'حجر خاطئ لم يغطس');
  for (let r = 0; r < 5; r++) await stone(d.rows[r].ok);
};

/* ── البوابات: لا طريق عبرها قبل وقتها ── */
const GATES = [{ after: 'sequences', name: 'بوابة السوق', a: { x: 1380, y: 640 }, b: { x: 1620, y: 640 } }];
const pathLen = (a, b) => G(([a, b]) => window.__game.findPath(a, b).length, [a, b]);

/* ── التشغيل ── */
let failures = 0;
function expect(ok, msg) { if (!ok) throw new Error(msg); }
try {
  await page.goto(URL_);
  await G(() => localStorage.clear()); await page.reload();
  await page.click('#bNew'); await page.fill('#hname', 'مختبر'); await page.click('#bGo');
  await until(() => G(() => !!window.__game.W), 'دخول القرية');
  await settle();
  const vil = await G(async () => { const v = await import('./world/village.js'), c = await import('./missions/convoy.js'); return { PILE: v.PILE, SIGNAL: v.SIGNAL, VAN: c.VAN }; });
  W.village = vil;
  const lessons = await G(async () => (await import('./content/lessons.js')).LESSONS.map(l => ({ id: l.id, title: l.title, giver: l.giver, u: l.u })));
  for (const g of GATES) expect(await pathLen(g.a, g.b) === 0, `${g.name} مفتوحة قبل وقتها`);
  let played = 0;
  for (const l of lessons) {
    if (!S[l.id]) { console.log(`⏸  توقف عند «${l.title}» (${l.id}): لم يُكتب حله في الاختبار بعد`); break; }
    const t0 = Date.now(), e0 = errors.length;
    try {
      await talk(l.giver);
      await S[l.id]();
      await until(() => isDone(l.id), 'إنهاء الدرس', 60000);
      await settle(60000);
      if (errors.length > e0) throw new Error('أخطاء في الكونسول: ' + errors.slice(e0).join(' / '));
      console.log(`✅ ${l.title} (${((Date.now() - t0) / 1000).toFixed(1)} ث)`);
      played++;
    } catch (e) {
      failures++; console.log(`❌ ${l.title} (${l.id}): ${e.message}`);
      await page.screenshot({ path: join(ROOT, 'tests', `fail-${l.id}.png`) });
      break;   // الدروس مرتبة: لا معنى للمتابعة بعد درس فاشل
    }
    for (const g of GATES.filter(g => g.after === l.id)) {
      if (await pathLen(g.a, g.b) === 0) { failures++; console.log(`❌ ${g.name} لم تُفتح بعد «${l.title}»`); }
      else console.log(`🚪 ${g.name} فُتحت في وقتها`);
    }
  }
  console.log(`\nالنتيجة: نجح ${played} من ${lessons.length} درساً${failures ? ` — وفشل ${failures}` : ''}`);
} catch (e) { failures++; console.log('❌ ' + e.message); }
finally { await browser.close(); server.close(); }
process.exit(failures ? 1 : 0);
