// الفصل الثاني — الوحدة ١ (القياس) في «ساحة المهرجان»: الكتلة والسعة والوقت والمساحة أدوات مطبخ ومدينة
import { ar, wait, rr, clamp } from '../core/util.js';
import { bubble } from '../world/entities.js';
import { sfx } from '../core/sound.js';
import { R, shuffle, near, changed, dec, finish, panel, sheetOpen, sheetClose, hiDPI, msgBox, setMsg, btn, numPad, counters , qMsg } from './bench.js';
import { ST5, GUEST } from '../world/festival.js';
import { building3d, boxShadow } from '../world/art.js';

const at = (st, key, label) => ({
  target: () => st,
  taps: () => [{ x: st.x, y: st.y - 24, hit: 40, approach: { x: st.x, y: st.y + 22 } }],
  actions(W, d) { return near(W, { x: st.x, y: st.y + 16 }, 50) ? [{ key, label, kind: 'go', run: () => this.open(W, d) }] : []; },
  draw(d, t, active, done) { return done ? [{ y: st.y + 30, draw: c => bubble(c, st.x, st.y - 70, '✓', '#1FA05A') }] : []; }
});
const step = (d, n) => `(${ar(Math.min(d.r + 1, n))} من ${ar(n)})`;
const kg = g => `${dec(g / 1000)} كغ`, L = ml => `${dec(ml / 1000)} لتر`;
const hm = m => { m = ((m % 720) + 720) % 720; const h = Math.floor(m / 60) || 12; return `${ar(h)}:${ar(String(m % 60).padStart(2, '0'))}`; };
const hm24 = m => { m = ((m % 1440) + 1440) % 1440; return `${ar(String(Math.floor(m / 60)).padStart(2, '0'))}:${ar(String(m % 60).padStart(2, '0'))}`; };

/* ═══ ٣٧. قياس الكتلة والسعة (١) — «مطبخ المهرجان» ═══ */
const WEIGHTS = [1000, 500, 200, 100, 50];
export const massCapacity1 = Object.assign({
  id: 'massCapacity1', giver: 'safiya',
  intro: n => [{ who: 'safiya', text: `أهلاً يا ${n}! أنا صفية رئيسة مطبخ المهرجان. الطلبات مكتوبة بوحدات مختلفة، والميزان بأثقال قديمة.` },
    { who: 'safiya', text: 'وازن الأكياس بالأثقال، واملأ الإبريق بالمقدار المطلوب. انتبه: الكيلوغرام ألف غرام، واللتر ألف مليلتر.' }],
  begin(d) { d.rounds = [{ t: 'w', g: R(5, 39) * 50, how: 'kg' }, { t: 'j', ml: R(3, 19) * 50 }, { t: 'w', g: R(41, 79) * 50, how: 'g' }]; d.r = 0; d.tray = []; d.ml = 0; },
  goal: d => `⚖️ جهّز مقادير المطبخ ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'w') {
      const label = r.how === 'kg' ? kg(r.g) : `${ar(r.g)} غرام`;
      const render = (m, k, tilt) => {
        sheetOpen(`<h3>⚖️ ميزان المطبخ</h3>${msgBox(m || `على الكفة كيس طحين كتلته <b>${label}</b>. ضع الأثقال المناسبة في الكفة الأخرى`, k)}<canvas id="bal" width="300" height="120"></canvas>
          <div class="tray">${d.tray.length ? d.tray.map((v, i) => `<button class="chip coin" data-t="${i}">${v >= 1000 ? ar(v / 1000) + ' كغ' : ar(v) + ' غ'}</button>`).join('') : '<span class="empty">ضع الأثقال هنا</span>'}</div>
          <div class="wallet">${WEIGHTS.map(v => `<button class="money coin" data-v="${v}">${v >= 1000 ? '١ كغ' : ar(v) + ' غ'}</button>`).join('')}</div>
          <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⚖️ وازن</button></div>`);
        const c = hiDPI(panel().querySelector('#bal')), a = (tilt || 0) * .18;
        c.save(); c.translate(150, 46); c.fillStyle = '#7A6A4A'; c.fillRect(-4, 0, 8, 60); c.rotate(a); c.fillStyle = '#5E6B78'; c.fillRect(-110, -4, 220, 8);
        [[-100, '#C98A3A', '🌾'], [100, '#9AA5B1', '']].forEach(([x, col, e], i) => { c.strokeStyle = '#5E6B78'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 20, 30); c.moveTo(x, 0); c.lineTo(x + 20, 30); c.stroke(); c.fillStyle = col; rr(c, x - 26, 30, 52, 10, 4); c.fill(); if (e) { c.font = '22px sans-serif'; c.textAlign = 'center'; c.fillText(e, x, 26); } else d.tray.slice(0, 6).forEach((w, j) => { c.fillStyle = '#4A4F63'; rr(c, x - 22 + (j % 3) * 15, 18 - Math.floor(j / 3) * 12, 13, 11, 2); c.fill(); }); });
        c.restore();
        panel().querySelectorAll('[data-v]').forEach(b => b.onclick = e => { e.stopPropagation(); if (d.tray.length < 14) { d.tray.push(+b.dataset.v); sfx('pick'); render(m, k); } });
        panel().querySelectorAll('[data-t]').forEach(b => b.onclick = e => { e.stopPropagation(); d.tray.splice(+b.dataset.t, 1); sfx('drop'); render(m, k); });
        btn('benchOut', () => { sheetClose(); changed(); });
        btn('benchGo', async () => { const s = d.tray.reduce((a, b) => a + b, 0);
          if (s === r.g) { sfx('win'); render('✓ توازنت الكفتان تماماً!', 'ok', 0); await wait(800); d.tray = []; await this.next(W, d); }
          else { sfx('cough'); render(s < r.g ? `كفة الطحين أثقل! الكيس ${label}` : `كفة الأثقال أثقل! الكيس ${label}`, 'bad', s < r.g ? -1 : 1); } });
      };
      render(msg, kind);
    } else {
      sheetOpen(`<h3>💧 إبريق القياس</h3>${qMsg(msg, kind, `املأ الإبريق بـ <b>${L(r.ml)}</b> من ماء الورد`)}<canvas id="jug" width="300" height="190"></canvas>
        <div class="row2"><button class="act" id="pour">💧 صبّ (اضغط مطولاً)</button><button class="act ghost" id="back">↩ أرجع ٥٠ مل</button></div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">✓ هذا المقدار</button></div>`);
      const c = hiDPI(panel().querySelector('#jug'));
      const draw = () => { c.clearRect(0, 0, 300, 190); const x = 100, y = 20, w = 100, h = 160;
        c.save(); rr(c, x, y, w, h, 10); c.clip(); c.fillStyle = '#7CC8F0'; const lh = h * d.ml / 1000; c.fillRect(x, y + h - lh, w, lh); c.restore();
        c.strokeStyle = '#5E6B78'; c.lineWidth = 3; rr(c, x, y, w, h, 10); c.stroke();
        for (let v = 100; v < 1000; v += 100) { const yy = y + h - h * v / 1000; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + w, yy); c.lineTo(x + w - (v === 500 ? 26 : 14), yy); c.stroke(); }
        c.fillStyle = '#2A1B66'; c.font = '800 11px Cairo, sans-serif'; c.textAlign = 'left'; c.fillText('٥٠٠ مل', x + w + 6, y + h / 2 + 4); c.fillText('١ لتر', x + w + 6, y + 6); };
      draw();
      let tm = 0; const pour = panel().querySelector('#pour');
      const stop = () => clearInterval(tm);
      pour.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const add = () => { d.ml = Math.min(1000, d.ml + 50); sfx('pick'); draw(); }; add(); stop(); tm = setInterval(add, 220); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => pour.addEventListener(ev, stop));
      btn('back', () => { d.ml = Math.max(0, d.ml - 50); draw(); });
      btn('benchOut', () => { stop(); sheetClose(); changed(); });
      btn('benchGo', async () => { stop(); if (d.ml === r.ml) { sfx('win'); d.ml = 0; await this.next(W, d); } else { sfx('cough'); setMsg(d.ml > r.ml ? `فاض عن المطلوب! المطلوب ${L(r.ml)}` : `الماء أقل من المطلوب! المطلوب ${L(r.ml)}`, 'bad'); } });
    }
  },
  async next(W, d) { d.r++; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'massCapacity1', [{ who: 'safiya', text: 'مقادير مضبوطة بالغرام والمليلتر! مطبخنا جاهز للمهرجان.' }]); } else this.open(W, d, '✓ ممتاز! الطلب التالي…', 'ok'); }
}, at(ST5.scale, 'scale', '⚖️ ميزان المطبخ'));

/* ═══ ٣٨. قياس الكتلة والسعة (٢) — «وصفات الجدة» ═══ */
export const massCapacity2 = Object.assign({
  id: 'massCapacity2', giver: 'umsaid',
  intro: n => [{ who: 'umsaid', text: `حيّاك يا ${n}! أنا أم سعيد. وصفاتي مكتوبة لأربعة أشخاص، والضيوف أعدادهم مختلفة.` },
    { who: 'umsaid', text: 'اضبط كل مقدار حسب عدد الضيوف: إذا تضاعف العدد تضاعفت المقادير.' }],
  begin(d) { const mk = () => [['طحين', 'غ', R(10, 20) * 20], ['سكر', 'غ', R(3, 8) * 20], ['حليب', 'مل', R(5, 12) * 40]]; d.rounds = shuffle([8, 2, 6]).map(p => ({ p, ing: mk() })); d.r = 0; d.a = d.b = d.c = 0; },
  goal: d => `🍲 اضبط مقادير وصفات الجدة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], f = r.p / 4;
    sheetOpen(`<h3>🍲 وصفة أم سعيد</h3><div class="recipe"><b>لـ ٤ أشخاص:</b> ${r.ing.map(([n, u, v]) => `${n} ${ar(v)} ${u}`).join(' — ')}</div>${qMsg(msg, kind, `اليوم سنطبخ لـ <b>${ar(r.p)}</b> أشخاص. اضبط كل مقدار`)}<div id="cnt"></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🍲 اطبخ</button></div>`);
    const holder = panel().querySelector('#cnt');
    holder.innerHTML = ['a', 'b', 'c'].map((k, i) => `<div class="cnt"><span>${r.ing[i][0]} (${r.ing[i][1]})</span><button class="act ghost" data-c="${k}" data-v="-10">−١٠</button><b id="cv_${k}">${ar(d[k])}</b><button class="act ghost" data-c="${k}" data-v="10">+١٠</button><button class="act ghost" data-c="${k}" data-v="100">+١٠٠</button></div>`).join('');
    holder.querySelectorAll('[data-c]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.c; d[k] = clamp(d[k] + +b.dataset.v, 0, 3000); holder.querySelector('#cv_' + k).textContent = ar(d[k]); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      const k = ['a', 'b', 'c'].findIndex((x, i) => d[x] !== r.ing[i][2] * f);
      if (k < 0) { sfx('win'); d.r++; d.a = d.b = d.c = 0; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'massCapacity2', [{ who: 'umsaid', text: 'كل قِدر بمقداره الصحيح! الضيوف سيطلبون المزيد.' }]); } else this.open(W, d, '✓ طبخة موفقة! الوصفة التالية…', 'ok'); }
      else { sfx('cough'); setMsg(`كمية ال${r.ing[k][0]} لا تناسب ${ar(r.p)} أشخاص`, 'bad'); }
    });
  }
}, at(ST5.recipe, 'recipe', '🍲 دفتر الوصفات'));

/* ═══ ٣٩. تحويل الوقت — «ساعة البرج» ═══ */
export const timeConvert = Object.assign({
  id: 'timeConvert', giver: 'mudhaffar',
  intro: n => [{ who: 'mudhaffar', text: `يا ${n}! أنا مظفّر مصلّح الساعات. ساعة البرج تحتاج من يضبطها على مواعيد المهرجان.` },
    { who: 'mudhaffar', text: 'المواعيد مكتوبة بالدقائق والساعات والأيام. حوّلها واضبط العقارب أو العدّاد.' }],
  begin(d) { const s1 = R(13, 22) * 20, n1 = R(13, 34) * 5, s2 = R(26, 40) * 15, h2 = [1.5, 2.5, .75, 1.25][R(0, 3)], dd = R(2, 5);
    d.rounds = [{ t: 'c', s: s1, ans: s1 + n1, text: `الساعة الآن ${hm(s1)}، والعرض يبدأ بعد ${ar(n1)} دقيقة. اضبط الساعة على موعد العرض.` },
      { t: 'c', s: s2, ans: s2 + h2 * 60, text: `الساعة الآن ${hm(s2)}، والسباق بعد ${dec(h2)} ساعة. اضبط الساعة على موعده.` },
      { t: 'n', ans: dd * 24, text: `الحفل الختامي بعد ${ar(dd)} أيام بالضبط. كم ساعة نضع على عدّاد الانتظار؟` }]; d.r = 0; d.tm = d.rounds[0].s; d.n = 0; },
  goal: d => `⏰ اضبط ساعة البرج ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    if (r.t === 'c') {
      sheetOpen(`<h3>⏰ ساعة البرج</h3>${qMsg(msg, kind, r.text)}<canvas id="clk" width="200" height="200"></canvas>
        <div class="row2"><button class="act ghost" data-m="-60">−١ س</button><button class="act ghost" data-m="-5">−٥ د</button><button class="act ghost" data-m="5">+٥ د</button><button class="act ghost" data-m="60">+١ س</button></div>
        <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⏰ اضبط الساعة</button></div>`);
      const c = hiDPI(panel().querySelector('#clk'));
      const draw = () => { c.clearRect(0, 0, 200, 200); c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(100, 100, 90, 0, 7); c.fill(); c.strokeStyle = '#2A1B66'; c.lineWidth = 4; c.stroke();
        for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; c.fillStyle = '#2A1B66'; c.font = '900 15px Cairo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ar(i), 100 + 72 * Math.cos(a), 100 + 72 * Math.sin(a)); }
        for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30; c.lineWidth = i % 5 ? 1 : 2.5; c.beginPath(); c.moveTo(100 + 84 * Math.cos(a), 100 + 84 * Math.sin(a)); c.lineTo(100 + 88 * Math.cos(a), 100 + 88 * Math.sin(a)); c.stroke(); }
        const m = ((d.tm % 720) + 720) % 720, ha = (m / 720) * 2 * Math.PI - Math.PI / 2, ma = (m % 60) / 60 * 2 * Math.PI - Math.PI / 2;
        c.lineCap = 'round'; c.lineWidth = 6; c.beginPath(); c.moveTo(100, 100); c.lineTo(100 + 44 * Math.cos(ha), 100 + 44 * Math.sin(ha)); c.stroke();
        c.lineWidth = 3.5; c.strokeStyle = '#E2475C'; c.beginPath(); c.moveTo(100, 100); c.lineTo(100 + 68 * Math.cos(ma), 100 + 68 * Math.sin(ma)); c.stroke(); c.fillStyle = '#2A1B66'; c.beginPath(); c.arc(100, 100, 6, 0, 7); c.fill(); c.textBaseline = 'alphabetic'; };
      draw();
      panel().querySelectorAll('[data-m]').forEach(b => b.onclick = e => { e.stopPropagation(); d.tm += +b.dataset.m; sfx('click'); draw(); });
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { if (((d.tm - r.ans) % 720 + 720) % 720 === 0) await this.next(W, d); else { sfx('cough'); setMsg(`الساعة تشير إلى ${hm(d.tm)}، وهذا ليس الموعد. ${r.text}`, 'bad'); } });
    } else {
      sheetOpen(`<h3>⏳ عدّاد الانتظار</h3>${qMsg(msg, kind, r.text)}<div id="cnt"></div><div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">⏳ ثبّت العدّاد</button></div>`);
      counters(panel().querySelector('#cnt'), [['n', '⏳ ساعات', 200]], d);
      btn('benchOut', () => { sheetClose(); changed(); });
      btn('benchGo', async () => { if (d.n === r.ans) await this.next(W, d); else { sfx('cough'); setMsg(`العدّاد لا يساوي المدة. تذكّر: اليوم ٢٤ ساعة`, 'bad'); } });
    }
  },
  async next(W, d) { sfx('win'); d.r++; if (d.r < 3 && d.rounds[d.r].s !== undefined) d.tm = d.rounds[d.r].s; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'timeConvert', [{ who: 'mudhaffar', text: 'ساعة البرج مضبوطة، وكل موعد في وقته!' }]); } else this.open(W, d, `✓ مضبوطة! ${d.rounds[d.r].text}`, 'ok'); }
}, at(ST5.clock, 'clock', '⏰ آلة ساعة البرج'));

/* ═══ ٤٠. المناطق الزمنية (١) — «مكالمات الأقارب» ═══ */
const CITIES = [['القاهرة', -2], ['لندن', -4], ['نيودلهي', 1.5], ['طوكيو', 5], ['نيويورك', -9], ['جاكرتا', 3]];
export const timeZones1 = Object.assign({
  id: 'timeZones1', giver: 'nawal',
  intro: n => [{ who: 'nawal', text: `أهلاً يا ${n}! أنا نوال في مركز الاتصالات. الناس يريدون الاتصال بأقاربهم في مدن بعيدة.` },
    { who: 'nawal', text: 'ساعة كل مدينة على الجدار متوقفة. اضبطها من وقت مسقط وفرق التوقيت، حتى لا نوقظ أحداً!' }],
  begin(d) { d.rounds = shuffle(CITIES).slice(0, 3).map(([city, df], i) => { const m = (R(i === 2 ? 20 : 8, i === 2 ? 23 : 17) * 60) + [0, 15, 30, 45][R(0, 3)]; return { city, df, m, ans: m + df * 60 }; }); d.r = 0; d.tm = 0; },
  goal: d => `🌍 اضبط ساعات المدن على الجدار ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r], rel = r.df > 0 ? `تسبق مسقط بـ${dec(r.df)} ساعة` : `متأخرة عن مسقط بـ${dec(-r.df)} ساعة`;
    if (!d.tm) d.tm = r.m;
    sheetOpen(`<h3>🌍 ساعة ${r.city}</h3>${qMsg(msg, kind, `الساعة في مسقط الآن <b>${hm24(r.m)}</b>، و${r.city} ${rel}. اضبط ساعة ${r.city}`)}
      <div class="dclock"><small>${r.city}</small><b id="dc">${hm24(d.tm)}</b></div>
      <div class="row2"><button class="act ghost" data-m="-60">−١ س</button><button class="act ghost" data-m="-15">−١٥ د</button><button class="act ghost" data-m="15">+١٥ د</button><button class="act ghost" data-m="60">+١ س</button></div>
      <div class="row2"><button class="act ghost" id="benchOut">رجوع</button><button class="act go" id="benchGo">🌍 ثبّت الساعة</button></div>`);
    panel().querySelectorAll('[data-m]').forEach(b => b.onclick = e => { e.stopPropagation(); d.tm += +b.dataset.m; panel().querySelector('#dc').textContent = hm24(d.tm); sfx('click'); });
    btn('benchOut', () => { sheetClose(); changed(); });
    btn('benchGo', async () => {
      if (((d.tm - r.ans) % 1440 + 1440) % 1440 === 0) { sfx('win'); d.r++; d.tm = 0; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'timeZones1', [{ who: 'nawal', text: 'كل الساعات مضبوطة! اتصل الناس بأقاربهم في الوقت المناسب.' }]); } else this.open(W, d, '✓ ضُبطت! المدينة التالية…', 'ok'); }
      else { sfx('cough'); setMsg(`لو اتصلنا الآن ستكون الساعة في ${r.city} غير ${hm24(d.tm)}. راجع فرق التوقيت`, 'bad'); }
    });
  }
}, at(ST5.calls, 'calls', '🌍 جدار الساعات'));

/* ═══ ٤١. حساب المساحة والمحيط — «بيت الضيافة» ═══ */
export const areaPerimeter = Object.assign({
  id: 'areaPerimeter', giver: 'tariq',
  intro: n => [{ who: 'tariq', text: `مرحباً يا ${n}! أنا المهندس طارق، أبني بيت الضيافة لضيوف المهرجان.` },
    { who: 'tariq', text: 'في المخططات أبعاد ناقصة. استنتجها من المساحة أو المحيط، واحسب بلاط الغرفة المركّبة.' }],
  begin(d) { const w1 = R(3, 6), l1 = R(5, 12), l2 = R(6, 11), w2 = R(2, l2 - 1), W3 = R(8, 12), H3 = R(6, 9), a3 = R(2, W3 - 4), b3 = R(2, H3 - 3);
    d.rounds = [{ t: 'A', w: w1, A: w1 * l1, ans: l1 }, { t: 'P', l: l2, P: 2 * (l2 + w2), ans: w2 }, { t: 'L', W: W3, H: H3, a: a3, b: b3, ans: W3 * H3 - a3 * b3 }]; d.r = 0; d.n = 1; },
  goal: d => `🏠 أكمل مخططات بيت الضيافة ${step(d, 3)}`,
  open(W, d, msg, kind) {
    const r = d.rounds[d.r];
    const text = r.t === 'A' ? `غرفة مساحتها <b>${ar(r.A)} م²</b> وعرضها <b>${ar(r.w)} م</b>. اضبط طولها.` : r.t === 'P' ? `حديقة محيطها <b>${ar(r.P)} م</b> وطولها <b>${ar(r.l)} م</b>. اضبط عرضها.` : 'غرفة الاستقبال على شكل حرف L. كم متراً مربعاً من البلاط تحتاج أرضيتها؟';
    sheetOpen(`<h3>🏠 مخطط ${ar(d.r + 1)}</h3>${qMsg(msg, kind, text)}<canvas id="plan" width="300" height="190"></canvas><div id="ctl"></div><button class="act ghost" id="benchOut">رجوع</button>`);
    const c = hiDPI(panel().querySelector('#plan')), u = 18, ox = 20, oy = 16;
    const grid = () => { c.strokeStyle = 'rgba(42,27,102,.10)'; c.lineWidth = 1; for (let x = ox; x <= 290; x += u) { c.beginPath(); c.moveTo(x, oy); c.lineTo(x, 182); c.stroke(); } for (let y = oy; y <= 182; y += u) { c.beginPath(); c.moveTo(ox, y); c.lineTo(290, y); c.stroke(); } };
    const lab = (t, x, y) => { c.fillStyle = '#2A1B66'; c.font = '900 13px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(t, x, y); };
    const draw = () => { c.clearRect(0, 0, 300, 190); grid(); c.fillStyle = 'rgba(31,200,181,.25)'; c.strokeStyle = '#2A1B66'; c.lineWidth = 3;
      if (r.t === 'A') { const L2 = d.n, Wd = r.w; c.fillRect(ox, oy + 10, L2 * u, Wd * u); c.strokeRect(ox, oy + 10, L2 * u, Wd * u); lab(`${ar(r.w)} م`, ox + L2 * u + 18, oy + 14 + Wd * u / 2); lab('الطول = ؟', ox + L2 * u / 2, oy + Wd * u + 28); }
      else if (r.t === 'P') { c.fillRect(ox, oy + 10, r.l * u, d.n * u); c.strokeRect(ox, oy + 10, r.l * u, d.n * u); lab(`${ar(r.l)} م`, ox + r.l * u / 2, oy + 4); lab('العرض = ؟', ox + r.l * u + 30, oy + 14 + d.n * u / 2); }
      else { const s = Math.min(1, 14 / Math.max(r.W, r.H)), U = u * s * 1.25; c.beginPath(); c.moveTo(ox, oy + 10); c.lineTo(ox + (r.W - r.a) * U, oy + 10); c.lineTo(ox + (r.W - r.a) * U, oy + 10 + r.b * U); c.lineTo(ox + r.W * U, oy + 10 + r.b * U); c.lineTo(ox + r.W * U, oy + 10 + r.H * U); c.lineTo(ox, oy + 10 + r.H * U); c.closePath(); c.fill(); c.stroke();
        lab(`${ar(r.W)} م`, ox + r.W * U / 2, oy + 24 + r.H * U); lab(`${ar(r.H)} م`, ox - 2 + 0, oy + 14 + r.H * U / 2); lab(`${ar(r.a)} م`, ox + (r.W - r.a / 2) * U, oy + 6 + r.b * U); lab(`${ar(r.b)} م`, ox + (r.W - r.a) * U + 16, oy + 14 + r.b * U / 2); } };
    draw();
    const ok = async () => { sfx('win'); d.r++; d.n = 1; changed(); if (d.r >= 3) { sheetClose(); await finish(W, 'areaPerimeter', [{ who: 'tariq', text: 'المخططات مكتملة! بيت الضيافة جاهز لاستقبال الضيوف.' }]); } else this.open(W, d, '✓ مخطط صحيح! التالي…', 'ok'); };
    if (r.t === 'L') { const pad = numPad(panel().querySelector('#ctl'), '🧱 اطلب البلاط (م²)', async v => { if (v === r.ans) await ok(); else { sfx('cough'); pad.clear(); setMsg('كمية البلاط لا تطابق مساحة الغرفة. قسّمها مستطيلين أو اطرح الجزء الناقص', 'bad'); } }, { dot: false }); }
    else {
      panel().querySelector('#ctl').innerHTML = `<div class="row2"><button class="act ghost" data-s="-1">−١ م</button><button class="act ghost" data-s="1">+١ م</button><button class="act go" id="build">🔨 ابنِ</button></div>`;
      panel().querySelectorAll('[data-s]').forEach(b => b.onclick = e => { e.stopPropagation(); d.n = clamp(d.n + +b.dataset.s, 1, 14); sfx('click'); draw(); });
      btn('build', async () => { if (d.n === r.ans) await ok(); else { sfx('cough'); setMsg(r.t === 'A' ? `بهذا الطول تصبح المساحة ${ar(d.n * r.w)} م² وليست ${ar(r.A)}` : `بهذا العرض يصبح المحيط ${ar(2 * (r.l + d.n))} م وليس ${ar(r.P)}`, 'bad'); } });
    }
    btn('benchOut', () => { sheetClose(); changed(); });
  },
  draw(d, t, active, done) { const n = done ? 3 : (d.r || 0); const cols = ['#F3D9C6', '#DCEFE3', '#E3D8F5'], doors = ['#B8613E', '#2F6B73', '#6B4FA8'];   // بيوت ضيافة مجسّمة تُبنى واحداً بعد آخر
    return Array.from({ length: n }, (_, i) => { const b = { x: GUEST.x + 20 + i * 128, y: GUEST.y + 70, w: 112, h: 60, H: 74, wall: cols[i], door: doors[i], doorW: 30, doorH: 52, lamp: false };
      return { y: b.y + b.h, draw: c => { boxShadow(c, b.x, b.y, b.w, b.h, b.H); building3d(c, 'guesthouse' + i, b); } }; }); }
}, (() => { const s = at(ST5.guest, 'guest', '🏠 مخططات البيت'); delete s.draw; return s; })());

export const T2U1 = { massCapacity1, massCapacity2, timeConvert, timeZones1, areaPerimeter };
