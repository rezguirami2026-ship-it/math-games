// الفصل الثاني — الوحدة ٤ (القياس ٢) على «طريق القافلة»: وحدات إمبراطورية ومناطق زمنية وسنوات كبيسة ومساحات
import { ar, wait, rr, clamp } from '../core/util.js';
import { bubble } from '../world/entities.js';
import { sfx } from '../core/sound.js';
import { R, shuffle, near, changed, dec, finish, panel, sheetOpen, sheetClose, hiDPI, msgBox, setMsg, btn, numPad, counters } from './bench.js';
import { ST8 } from '../world/caravan.js';
import { shrub } from '../world/art.js';

const at = (st, key, label) => ({
  target: () => st,
  taps: () => [{ x: st.x, y: st.y - 24, hit: 44, approach: { x: st.x, y: st.y + 22 } }],
  actions(W, d) { return near(W, { x: st.x, y: st.y + 16 }, 52) ? [{ key, label, kind: 'go', run: () => this.open(W, d) }] : []; },
  draw(d, t, active, done) { return done ? [{ y: st.y + 30, draw: c => bubble(c, st.x, st.y - 160, '✓', '#1FA05A') }] : []; }
});
const step = (d, n) => `(${ar(Math.min(d.r + 1, n))} من ${ar(n)})`;
const H = v => Math.round(v * 1000);
async function advance(mod, W, d, n, id, lines) { sfx('win'); d.r++; changed(); if (d.r >= n) { sheetClose(); await finish(W, id, lines); } else mod.open(W, d, '✓ أحسنت!', 'ok'); }
function kp(mod, W, d, o) {
  sheetOpen(`<h3>${o.title}</h3>${o.visual || ''}${msgBox(o.msg ? `${o.msg} ${o.text}` : o.text, o.kind)}<div id="pad"></div><button class="act ghost" id="benchOut">رجوع</button>`);
  const pad = numPad(panel().querySelector('#pad'), o.label || '✓ الجواب', async v => { if (H(v) === H(o.ans)) await advance(mod, W, d, o.n, o.id, o.lines); else { sfx('cough'); pad.clear(); setMsg(`${o.hint || 'ليس صحيحاً.'} ${o.text}`, 'bad'); } }, o.opts || {});
  btn('benchOut', () => { sheetClose(); changed(); });
}
const hm24 = m => { m = ((m % 1440) + 1440) % 1440; return `${ar(String(Math.floor(m / 60)).padStart(2, '0'))}:${ar(String(m % 60).padStart(2, '0'))}`; };
const durTxt = m => { const h = Math.floor(m / 60), mi = m % 60; return `${h === 1 ? 'ساعة' : h === 2 ? 'ساعتان' : ar(h) + ' ساعات'}${mi ? ' و' + ar(mi) + ' دقيقة' : ''}`; };

/* ═══ ٥٩. السعة والكتلة — «محطة الوقود» ═══ */
export const capacityMass = Object.assign({
  id: 'capacityMass', giver: 'mansour',
  intro: n => [{ who: 'mansour', text: `أهلاً يا ${n}! أنا منصور في محطة الوقود. قوافل كثيرة تأتي من بلدان تقيس بالغالون والرطل.` },
    { who: 'mansour', text: 'الغالون ٤ كوارت، و١٠ لترات تساوي ٢٫٢ غالون تقريباً، والكيلوغرام ٢٫٢ رطل تقريباً. حوّل كل طلب لنخدم القافلة.' }],
  begin(d) { const g = R(3, 12), k = R(2, 6), kg = R(3, 12) * 5; d.rounds = [{ t: 'c', g, ans: 4 * g }, { t: 'k', text: `خزان شاحنة سعته ${ar(10 * k)} لتراً. كم غالوناً يستوعب؟ (١٠ لترات = ٢٫٢ غالون)`, ans: 2.2 * k }, { t: 'k', text: `حمولة الجمل ${ar(kg)} كغ، وميزان القافلة يقرأ بالرطل. كم رطلاً؟ (١ كغ ≈ ٢٫٢ رطل)`, ans: 2.2 * kg }]; d.r = 0; d.q = 0; },
  goal: d => `⛽ اخدم قوافل محطة الوقود ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '⛽ محطة الوقود', text: r.text, ans: r.ans, n: 3, id: 'capacityMass', msg, kind, lines: [{ who: 'mansour', text: 'تحوّل بين اللتر والغالون والرطل كأنك عامل محطة منذ سنين!' }], hint: 'التحويل غير صحيح.' });
    sheetOpen(`<h3>⛽ المضخة</h3>${msgBox((msg ? `${msg} ` : '') + `قائد القافلة يريد <b>${ar(r.g)}</b> غالونات، ومضختنا تعدّ بالكوارت (١ غالون = ٤ كوارت). كم كوارت نضخ؟`, kind)}<div id="cnt"></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⛽ اضخ</button></div>`);
    counters(panel().querySelector('#cnt'), [['q', '🛢️ كوارت', 60]], d);
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { if (d.q === r.ans) { d.q = 0; await advance(this, W, d, 3, 'capacityMass', null); } else { sfx('cough'); setMsg(`${ar(d.q)} كوارت ${d.q < r.ans ? 'أقل' : 'أكثر'} من ${ar(r.g)} غالونات`, 'bad'); } });
  }
}, at(ST8.fuel, 'fuel', '⛽ مضخة الوقود'));

/* ═══ ٦٠. المسافة — «دليل القافلة» ═══ */
function lengths() {   // أربعة أطوال بوحدات مختلفة، كلها بالملم للمقارنة
  for (;;) {
    const a = R(31, 99), b = R(30, 99), c = R(3, 9), dd = R(2, 4) * 2;
    const L = [{ t: `${dec(a / 10)} سم`, mm: a }, { t: `${ar(b)} ملم`, mm: b }, { t: `${dec(c / 100)} م`, mm: c * 10 }, { t: `${ar(dd / 2)} بوصة`, mm: dd / 2 * 25 }];
    const s = L.map(x => x.mm).sort((x, y) => x - y); if (s.every((v, i) => !i || v - s[i - 1] >= 4)) return shuffle(L);
  }
}
export const distance = Object.assign({
  id: 'distance', giver: 'sultan',
  intro: n => [{ who: 'sultan', text: `حيّاك يا ${n}! أنا سلطان دليل القافلة. خرائطنا قديمة، بعضها بالأميال وبعضها بالبوصات.` },
    { who: 'sultan', text: 'الميل ١٫٦ كم تقريباً، والبوصة ٢٫٥ سم تقريباً. حوّل اللافتات وقِس الحبال ورتّب الأطوال.' }],
  begin(d) { const m = R(2, 12) * 5, n = R(3, 6), cm = n * R(20, 95); d.rounds = [{ t: 'k', text: `لافتة الطريق القديمة: ${ar(m)} ميلاً حتى الواحة. كم كيلومتراً؟ (١ ميل ≈ ١٫٦ كم)`, ans: m * 1.6 }, { t: 'k', text: `حبل طوله ${dec(cm / 100)} م يُقطع إلى ${ar(n)} أجزاء متساوية. كم سنتيمتراً طول الجزء؟`, ans: cm / n }, { t: 'o', items: lengths() }]; d.r = 0; d.ord = []; },
  goal: d => `🧭 جهّز خرائط القافلة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '🧭 دليل القافلة', text: r.text, ans: r.ans, n: 3, id: 'distance', msg, kind, lines: null, hint: 'القياس غير صحيح.' });
    sheetOpen(`<h3>🧭 ترتيب الحبال</h3>${msgBox(msg ? `${msg} رتّب أطوال الحبال من الأقصر إلى الأطول` : 'اضغط أطوال الحبال من الأقصر إلى الأطول (البوصة ≈ ٢٫٥ سم)', kind)}
      <div class="tiles">${r.items.map((it, i) => `<button class="tile ${d.ord.includes(i) ? 'on' : ''}" data-i="${i}">${it.t}${d.ord.includes(i) ? `<sup> ${ar(d.ord.indexOf(i) + 1)}</sup>` : ''}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="oReset">↺ من جديد</button><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ رتّب</button></div>`);
    panel().querySelectorAll('.tile').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i; if (!d.ord.includes(i)) { d.ord.push(i); sfx('click'); this.open(W, d, msg, kind); } });
    btn('oReset', () => { d.ord = []; this.open(W, d, msg, kind); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const ok = d.ord.length === 4 && d.ord.every((i, k) => !k || r.items[i].mm > r.items[d.ord[k - 1]].mm);
      if (ok) { d.ord = []; await advance(this, W, d, 3, 'distance', [{ who: 'sultan', text: 'الخرائط جاهزة! تعرف المسافات بكل الوحدات.' }]); }
      else { sfx('cough'); d.ord = []; this.open(W, d, 'الترتيب غير صحيح، حوّل كل الأطوال إلى الملم ثم قارن.', 'bad'); }
    });
  }
}, at(ST8.signs, 'signs', '🧭 خرائط الدليل'));

/* ═══ ٦١. المناطق الزمنية (٢) — «مطار الواحة» ═══ */
const CITIES = [['لندن', -4], ['القاهرة', -2], ['طوكيو', 5], ['نيودلهي', 1.5], ['باريس', -3], ['سيدني', 6]];
export const timeZones2 = Object.assign({
  id: 'timeZones2', giver: 'lubna',
  intro: n => [{ who: 'lubna', text: `أهلاً يا ${n}! أنا لبنى في مطار الواحة. لوحة الوصول تحتاج من يضبطها.` },
    { who: 'lubna', text: 'وقت الوصول = وقت الإقلاع + مدة الرحلة، ثم نضيف فرق التوقيت إن كانت المدينة متقدمة، ونطرحه إن كانت متأخرة.' }],
  begin(d) { d.rounds = shuffle(CITIES).slice(0, 3).map(([city, z]) => { const dep = R(0, 23) * 60 + [0, 15, 30, 45][R(0, 3)], dur = R(2, 9) * 60 + [0, 15, 30, 45][R(0, 3)]; return { city, z, dep, dur, ans: dep + dur + z * 60 }; }); d.r = 0; d.tm = d.rounds[0].dep; },
  goal: d => `✈️ اضبط لوحة الوصول في المطار ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], rel = r.z > 0 ? `تتقدم على مسقط بـ${dec(r.z)} ساعة` : `متأخرة عن مسقط بـ${dec(-r.z)} ساعة`;
    const text = `رحلة إلى ${r.city} أقلعت <b>${hm24(r.dep)}</b> بتوقيت مسقط، ومدتها <b>${durTxt(r.dur)}</b>. و${r.city} ${rel}. متى تصل بتوقيت ${r.city}؟`;
    sheetOpen(`<h3>✈️ لوحة الوصول</h3>${msgBox(msg ? `${msg} ${text}` : text, kind)}<div class="dclock"><small>الوصول بتوقيت ${r.city}</small><b id="dc">${hm24(d.tm)}</b></div>
      <div class="row2"><button class="act ghost" data-m="-60">−١ س</button><button class="act ghost" data-m="-15">−١٥ د</button><button class="act ghost" data-m="15">+١٥ د</button><button class="act ghost" data-m="60">+١ س</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✈️ ثبّت الوصول</button></div>`);
    panel().querySelectorAll('[data-m]').forEach(b => b.onclick = e => { e.stopPropagation(); d.tm += +b.dataset.m; panel().querySelector('#dc').textContent = hm24(d.tm); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => { if (((d.tm - r.ans) % 1440 + 1440) % 1440 === 0) { d.r < 2 && (d.tm = d.rounds[d.r + 1].dep); await advance(this, W, d, 3, 'timeZones2', [{ who: 'lubna', text: 'لوحة الوصول دقيقة! المسافرون يعرفون متى يستقبلون أهلهم.' }]); }
      else { sfx('cough'); setMsg(`${hm24(d.tm)} ليس وقت الوصول. أضف المدة أولاً، ثم فرق التوقيت. ${text}`, 'bad'); } });
  }
}, at(ST8.flights, 'flights', '✈️ لوحة الوصول'));

/* ═══ ٦٢. السنوات الكبيسة — «جدار القرن» ═══ */
const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const leapYears = Object.assign({
  id: 'leapYears', giver: 'faisal',
  intro: n => [{ who: 'faisal', text: `مرحباً يا ${n}! أنا فيصل حارس جدار القرن. على الجدار ألواح سنوات، والكبيسة منها تتوهج.` },
    { who: 'faisal', text: 'السنة الكبيسة تُقسم على ٤ بلا باقٍ، إلا سنوات القرن مثل ١٩٠٠ فلا تكون كبيسة إلا إذا قُسمت على ٤٠٠ مثل ٢٠٠٠.' }],
  begin(d) { const a = R(1990, 2010), r1 = shuffle(Array.from({ length: 24 }, (_, i) => a + i)).slice(0, 12), r2 = shuffle([1800, 1900, 2000, 2100, 2400, 1600, 1996, 2004, 1998, 2022, 2028, 2015]), B = [2000, 2004, 2008][R(0, 2)], E = [2020, 2024, 2028][R(0, 2)];
    d.rounds = [{ t: 's', years: r1 }, { t: 's', years: r2 }, { t: 'k', text: `وُلد خالد يوم ٢٩ فبراير ${ar(B)}. كم مرة جاء يوم ميلاده الحقيقي (٢٩ فبراير) بعد ولادته حتى نهاية سنة ${ar(E)}؟`, ans: (E - B) / 4 }]; d.r = 0; d.sel = []; },
  goal: d => `📜 أضئ السنوات الكبيسة على جدار القرن ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '📜 لغز الميلاد', text: r.text, ans: r.ans, opts: { dot: false }, n: 3, id: 'leapYears', msg, kind, lines: [{ who: 'faisal', text: 'الجدار يتوهج كله! تعرف قاعدة الكبيسة حتى في سنوات القرن.' }], hint: 'عُدّ السنوات الكبيسة بعد سنة الولادة.' });
    sheetOpen(`<h3>📜 جدار القرن</h3>${msgBox(msg ? `${msg} أضئ السنوات الكبيسة` : 'اضغط ألواح السنوات الكبيسة فقط لتتوهج', kind)}
      <div class="stones">${r.years.map((y, i) => `<button class="stone ${d.sel.includes(i) ? 'on' : ''}" data-i="${i}">${ar(y)}</button>`).join('')}</div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">📜 أضئ الجدار</button></div>`);
    panel().querySelectorAll('.stone').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.i, k = d.sel.indexOf(i); if (k >= 0) d.sel.splice(k, 1); else d.sel.push(i); b.classList.toggle('on'); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const bad = d.sel.filter(i => !leap(r.years[i])), miss = r.years.filter((y, i) => leap(y) && !d.sel.includes(i)).length;
      if (!bad.length && !miss) { d.sel = []; await advance(this, W, d, 3, 'leapYears', null); }
      else { sfx('cough'); setMsg(bad.length ? `${ar(r.years[bad[0]])} ليست كبيسة${r.years[bad[0]] % 100 === 0 ? ': سنة قرن لا تُقسم على ٤٠٠' : ': لا تُقسم على ٤ بلا باقٍ'}` : `بقيت ${ar(miss)} سنوات كبيسة لم تُضئها`, 'bad'); }
    });
  }
}, at(ST8.century, 'century', '📜 جدار القرن'));

/* ═══ ٦٣. المستطيلات — «بستان وفاء» (مطابقة المستطيل بمساحته) ═══ */
const rectSvg = (w, h) => { const s = 9; return `<svg viewBox="0 0 ${w * s + 4} ${h * s + 4}" style="width:${w * s + 4}px;height:${h * s + 4}px"><rect x="2" y="2" width="${w * s}" height="${h * s}" fill="#BFE8C9" stroke="#2E8B57" stroke-width="2"/></svg>`; };
export const rectangles = Object.assign({
  id: 'rectangles', giver: 'wafa',
  intro: n => [{ who: 'wafa', text: `أهلاً يا ${n}! أنا وفاء البستانية. أحواض البستان مستطيلة ومربعة، وبطاقاتها اختلطت.` },
    { who: 'wafa', text: 'طابق كل حوض ببطاقته: المساحة = الطول × العرض، ومحيط المربع = ٤ × طول ضلعه.' }],
  begin(d) {
    const mk = () => { const s = new Set(), o = []; while (o.length < 3) { const w = R(2, 9), h = R(2, 7); if (w === h || s.has(w * h)) continue; s.add(w * h); o.push([w, h]); } return o; };
    const sq = shuffle([3, 4, 5, 6, 7, 8, 9]).slice(0, 3), w3 = R(4, 9), A = w3 * R(5, 12);
    d.rounds = [{ t: 'm', kind: 'A', items: mk().map(([w, h]) => ({ w, h, v: w * h })) }, { t: 'm', kind: 'P', items: sq.map(s => ({ w: s, h: s, v: 4 * s })) }, { t: 'k', text: `حوض مستطيل مساحته ${ar(A)} م² وعرضه ${ar(w3)} م. كم طوله؟`, ans: A / w3 }];
    d.r = 0; d.pick = -1; d.gone = [];
  },
  goal: d => `🌿 طابق أحواض بستان وفاء ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'k') return kp(this, W, d, { title: '🌿 حوض جديد', text: r.text, ans: r.ans, opts: { dot: false }, n: 3, id: 'rectangles', msg, kind, lines: [{ who: 'wafa', text: 'كل حوض ببطاقته الصحيحة! البستان مرتب وجميل.' }], hint: 'الطول = المساحة ÷ العرض.' });
    if (!r.order) r.order = shuffle([0, 1, 2]);
    const unit = r.kind === 'A' ? 'م²' : 'م';
    sheetOpen(`<h3>🌿 ${r.kind === 'A' ? 'الأحواض ومساحاتها' : 'المربعات ومحيطاتها'}</h3>${msgBox(msg ? `${msg} اضغط حوضاً ثم بطاقته` : `اضغط حوضاً ثم بطاقة ${r.kind === 'A' ? 'مساحته' : 'محيطه'} (كل مربع صغير ١ م)`, kind)}
      <div class="match"><div>${r.items.map((it, i) => `<button class="mt ${d.pick === i ? 'on' : ''} ${d.gone.includes(i) ? 'gone' : ''}" data-r="${i}">${rectSvg(it.w, it.h)}<small>${ar(it.w)} × ${ar(it.h)} م</small></button>`).join('')}</div>
      <div>${r.order.map(i => `<button class="mt val ${d.gone.includes(i) ? 'gone' : ''}" data-v="${i}">${ar(r.items[i].v)} ${unit}</button>`).join('')}</div></div><button class="act ghost" id="benchOut">رجوع</button>`);
    panel().querySelectorAll('[data-r]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.r; if (!d.gone.includes(i)) { d.pick = i; sfx('click'); this.open(W, d, msg, kind); } });
    panel().querySelectorAll('[data-v]').forEach(b => b.onclick = async e => {
      e.stopPropagation(); const i = +b.dataset.v; if (d.pick < 0 || d.gone.includes(i)) return;
      if (i === d.pick) { d.gone.push(i); d.pick = -1; sfx('good'); if (d.gone.length >= 3) { d.gone = []; await advance(this, W, d, 3, 'rectangles', null); } else this.open(W, d, '✓ مطابقة صحيحة!', 'ok'); }
      else { const it = r.items[d.pick]; d.pick = -1; sfx('cough'); this.open(W, d, `ليست بطاقته. ${r.kind === 'A' ? `${ar(it.w)} × ${ar(it.h)} = ؟` : `٤ × ${ar(it.w)} = ؟`}`, 'bad'); }
    });
    btn('benchOut', () => { sheetClose(); changed(); });
  }
}, at(ST8.rects, 'rects', '🌿 بطاقات الأحواض'));

/* ═══ ٦٤. الأشكال غير المنتظمة — «أرض الواحة» ═══ */
function blob() {   // شكل على الشبكة: مربعات كاملة وأنصاف مثلثية على الأطراف
  const w = R(3, 5), h = R(3, 4), full = [], halves = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) full.push([x + 1, y + 1]);
  for (let y = 0; y < h; y++) if (R(0, 1)) halves.push([w + 1, y + 1, 'R']);
  for (let x = 0; x < w; x++) if (R(0, 2) === 0) halves.push([x + 1, 0, 'T']);
  if (!halves.length) halves.push([w + 1, 1, 'R']);
  return { full, halves, ans: full.length + halves.length / 2 };
}
export const irregularShapes = Object.assign({
  id: 'irregularShapes', giver: 'buthaina',
  intro: n => [{ who: 'buthaina', text: `يا ${n}! أنا بثينة حارسة الواحة. نريد زراعة الأعشاب حول الماء، والأرض غير منتظمة.` },
    { who: 'buthaina', text: 'عُدّ المربعات الكاملة، وكل نصفين يساويان مربعاً واحداً. ومتوازي الأضلاع مساحته القاعدة × الارتفاع.' }],
  begin(d) { const b = R(3, 7), hh = R(2, 5); d.rounds = [Object.assign({ t: 'b' }, blob()), Object.assign({ t: 'b' }, blob()), { t: 'p', b, h: hh, ans: b * hh }]; d.r = 0; },
  goal: d => `🌱 احسب مساحات أرض الواحة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], text = r.t === 'b' ? 'كم وحدة مربعة مساحة قطعة العشب الخضراء؟' : `متوازي أضلاع قاعدته ${ar(r.b)} وحدات وارتفاعه ${ar(r.h)} وحدات. ما مساحته؟`;
    kp(this, W, d, { title: '🌱 أرض الواحة', text, ans: r.ans, n: 3, id: 'irregularShapes', msg, kind, lines: [{ who: 'buthaina', text: 'زرعنا الأعشاب بالمقدار الصحيح تماماً، والواحة صارت أجمل!' }], hint: r.t === 'b' ? 'عُدّ الكاملة ثم أضف نصف عدد الأنصاف.' : 'المساحة = القاعدة × الارتفاع.',
      visual: `<canvas id="grid" width="300" height="190"></canvas>` });
    const c = hiDPI(panel().querySelector('#grid')), u = 30, ox = 16, oy = 10;
    c.strokeStyle = 'rgba(42,27,102,.15)'; c.lineWidth = 1; for (let x = 0; x <= 9; x++) { c.beginPath(); c.moveTo(ox + x * u, oy); c.lineTo(ox + x * u, oy + 6 * u); c.stroke(); } for (let y = 0; y <= 6; y++) { c.beginPath(); c.moveTo(ox, oy + y * u); c.lineTo(ox + 9 * u, oy + y * u); c.stroke(); }
    c.fillStyle = 'rgba(46,139,87,.75)';
    if (r.t === 'b') {
      r.full.forEach(([x, y]) => c.fillRect(ox + x * u + 1, oy + y * u + 1, u - 2, u - 2));
      r.halves.forEach(([x, y, s]) => { c.beginPath(); if (s === 'R') { c.moveTo(ox + x * u, oy + y * u); c.lineTo(ox + x * u, oy + (y + 1) * u); c.lineTo(ox + (x + 1) * u, oy + (y + 1) * u); } else { c.moveTo(ox + x * u, oy + (y + 1) * u); c.lineTo(ox + (x + 1) * u, oy + (y + 1) * u); c.lineTo(ox + (x + 1) * u, oy + y * u); } c.closePath(); c.fill(); });
    } else {
      const x0 = 2, y0 = 1; c.beginPath(); c.moveTo(ox + (x0 + 2) * u, oy + y0 * u); c.lineTo(ox + (x0 + 2 + r.b) * u, oy + y0 * u); c.lineTo(ox + (x0 + r.b) * u, oy + (y0 + r.h) * u); c.lineTo(ox + x0 * u, oy + (y0 + r.h) * u); c.closePath(); c.fill();
      c.strokeStyle = '#E2475C'; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(ox + (x0 + 2) * u, oy + y0 * u); c.lineTo(ox + (x0 + 2) * u, oy + (y0 + r.h) * u); c.stroke(); c.setLineDash([]);
    }
  },
  draw(d, t, active, done) { if (!done) return []; const s = ST8.oasis; return [-2.6, -2.1, -1.6, -1.05, -.5, .05, 3.2].map((a, i) => { const x = s.x + Math.cos(a) * 176, y = 5100 + Math.sin(a) * 86; return { y, x, draw: c => shrub(c, x, y, 9, i % 2 ? '#E8A33D' : '#D9478C') }; }).concat([{ y: s.y + 30, draw: c => bubble(c, s.x, s.y - 160, '✓', '#1FA05A') }]); }   // شجيرات مزهرة حول الواحة بعد تخطيطها
}, (() => { const s = at(ST8.oasis, 'oasis', '🌱 مخطط الواحة'); delete s.draw; return s; })());

export const T2U4 = { capacityMass, distance, timeZones2, leapYears, rectangles, irregularShapes };
