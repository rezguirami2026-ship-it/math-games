// مغامرة منجم الأعماق: «المنقّب المفقود في الأعماق» (الصف الثامن، الوحدة ١) — بمحرك المغامرات (adventure/engine.js)
// وبآليات جديدة لم تُستعمل في مغامرات الصفوف ٥–٧: مصباح يخفت ويُملأ من مصابيح الزيت (الظلام يشتد كلما نقص زيته)،
// معول يكسر الصخور فتصير حجارة، سلة على بكرة تمتلئ بالحجارة فترتفع منصة فوق النهر الجوفي، وعربة على السكة تُوجَّه بمحوّلات
// لتحطم الحاجز الخشبي. الفصل الأخير «رحلة العربة» هرباً من انهيار النفق (ride.js)، ثم احتفال في ساحة المنجم.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── ساحة المنجم عند الغروب (٢٢×١٤) ── */
const Y = grid(22, 14, '.'); rect(Y, 0, 0, 21, 2, '#'); rect(Y, 0, 0, 0, 13, '#'); rect(Y, 21, 0, 21, 13, '#'); rect(Y, 0, 13, 21, 13, '#');
rect(Y, 11, 3, 11, 11, '_'); rect(Y, 4, 9, 18, 9, '_');
[[6, 4], [16, 4], [3, 8], [19, 10], [7, 12], [15, 12]].forEach(([x, y]) => { Y[y][x] = 'T'; });   // نخيل الساحة
/* ── الطبقة العميقة (٣٠×١٦): ممر بصخرتين، جيب بصخرة، قاعة، ونهر جوفي، وقاعة شرقية ── */
const D = grid(30, 16);
rect(D, 1, 6, 6, 10, '.'); rect(D, 6, 8, 11, 8, '.'); D[8][9] = 'R'; D[8][10] = 'R';
rect(D, 12, 6, 18, 12, '.'); rect(D, 12, 3, 14, 4, '.'); D[5][13] = 'R';
rect(D, 19, 1, 20, 14, '~');
rect(D, 21, 5, 28, 12, '.');
/* ── الأشغال القديمة (٢٨×١٨): سكك ومفترقان، وحجرة خلف حاجز خشبي ── */
const O = grid(28, 18, '.'); rect(O, 0, 0, 27, 0, '#'); rect(O, 0, 17, 27, 17, '#'); rect(O, 0, 0, 0, 17, '#'); rect(O, 27, 0, 27, 17, '#');
rect(O, 4, 8, 16, 8, '_'); rect(O, 10, 9, 10, 14, '_'); rect(O, 4, 14, 19, 14, '_');
rect(O, 20, 11, 20, 16, '#'); rect(O, 20, 11, 26, 11, '#'); O[14][20] = '.';
rect(O, 2, 2, 3, 3, '#'); rect(O, 24, 2, 25, 3, '#'); rect(O, 14, 2, 16, 4, '#');

const MIRIAM = { kind: 'woman', skin: '#C99A72', robe: '#3E5C76', accent: '#E3B04B', vest: '#C9772E' };
const SALEH = { kind: 'man', skin: '#B5835A', robe: '#5E5040', accent: '#E3B04B', hat: 'cap', vest: '#C9772E', beard: '#2B2118' };
const SALEM = { kind: 'man', skin: '#A8764E', robe: '#6B5A48', accent: '#E3B04B', hat: 'cap', vest: '#E3B04B', beard: '#E5E5E5', elder: true };
const DARK = new Set(['deep', 'old']);

// مسار العربة من بدايتها حسب المحوّلين: [نقاط]، ونهايته: 'east' مسدود، 'west' مسدود، 'gate' الحاجز
function cartRoute(A) {
  const pts = [], add = (x0, y0, x1, y1) => { const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0); let x = x0, y = y0; while (x !== x1 || y !== y1) { x += dx; y += dy; pts.push([x, y]); } };
  add(4, 8, 10, 8);
  if (!A.ent('sw1').on) { add(10, 8, 16, 8); return { pts, end: 'east' }; }
  add(10, 8, 10, 14);
  if (!A.ent('sw2').on) { add(10, 14, 4, 14); return { pts, end: 'west' }; }
  add(10, 14, 19, 14); return { pts, end: 'gate' };
}
let ride = null;   // حركة العربة الجارية

export default {
  id: 'g8mine', title: 'المنقّب المفقود في الأعماق', icon: '⛏️', stars: 5,
  start: { area: 'yard', x: 11, y: 11 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },   // كاميرا أقرب وشخصيات أكبر (الصف الثامن)
  items: { lamp: { icon: '🏮', name: 'مصباح المنقّب' }, pick: { icon: '⛏️', name: 'معول' }, rock: { icon: '🪨', name: 'حجر' } },
  cast: { miriam: { name: 'المنقّبة مريم', look: MIRIAM }, saleh: { name: 'المنقّب صالح', look: SALEH }, salem: { name: 'العمّ سالم', look: SALEM } },
  goals: [
    { text: 'تحدّث مع المنقّبة مريم في ساحة المنجم', done: A => A.flag('met'), at: () => ({ area: 'yard', id: 'miriam' }), hint: 'مريم واقفة قرب المصعد.' },
    { text: 'انزل بالمصعد إلى الطبقة العميقة', done: A => A.flag('deep'), at: () => ({ area: 'yard', id: 'lift' }), hint: 'المصعد في شمال الساحة.' },
    { text: 'اكسر الصخور بالمعول واجمع ثلاثة حجارة', done: A => A.count('rock') >= 3 || A.flag('bridge'), at: () => ({ area: 'deep', x: 8, y: 8 }), hint: 'امشِ نحو الصخرة فيكسرها المعول. واحدة منها تسد جيباً صغيراً في القاعة.' },
    { text: 'ضع الحجارة الثلاثة في سلة البكرة لترتفع المنصة فوق النهر الجوفي', done: A => A.flag('bridge'), at: () => ({ area: 'deep', id: 'basket' }), hint: 'السلة على ضفة النهر الجوفي.' },
    { text: 'اعبر إلى الأشغال القديمة', done: A => A.flag('old'), at: () => ({ area: 'deep', id: 'toOld' }), hint: 'الممر في شرق القاعة الشرقية.' },
    { text: 'وجّه العربة بالمحوّلين لتحطم الحاجز الخشبي', done: A => A.flag('crash'), at: A => ({ area: 'old', id: !A.ent('sw1') || !A.ent('sw1').on ? 'sw1' : !A.ent('sw2').on ? 'sw2' : 'cart' }), hint: 'المحوّل يغيّر اتجاه السكة عند المفترق. ادفع العربة بعد ضبطهما.' },
    { text: 'أنقذ العمّ سالم', done: A => A.flag('saved'), at: () => ({ area: 'old', id: 'salem' }), hint: 'العمّ سالم في الحجرة خلف الحاجز.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'غابت الشمس عن منجم الأعماق، وعاد المنقّبون من الأنفاق… إلا واحداً.' },
    { who: 'narrator', text: 'العمّ سالم، أقدم منقّب في القرية، نزل إلى الأشغال القديمة صباحاً ولم يصعد.' },
    { who: 'hero', text: 'يجب أن أجده قبل أن يحلّ الليل.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).deepRescue = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «منقذ الأعماق»'],
  areas: {
    yard: {
      theme: 'mountain', map: rows(Y), dark: .2,
      enter: A => { A.S.flags.weather = { dark: .2 }; },
      ents: [
        { id: 'miriam', kind: 'npc', who: 'miriam', x: 9, y: 5, face: 'down', mark: A => A.flag('met') ? null : '!' },
        { id: 'saleh', kind: 'npc', who: 'saleh', x: 15, y: 6, face: 'left' },
        { id: 'salemY', kind: 'npc', who: 'salem', x: 13, y: 5, face: 'down', hidden: true },
        { id: 'lift', kind: 'exit', x: 11, y: 3, to: 'deep', tx: 2, ty: 8, when: A => A.has('lamp'), locked: 'المصعد ينزل إلى الظلام… كلّم مريم أولاً، فلن تنزل بلا مصباح.' },
        { id: 'tower', kind: 'pillar', x: 10, y: 3 }, { id: 'tower2', kind: 'pillar', x: 12, y: 3 },
        { id: 'h1', kind: 'house', x: 1, y: 6, w: 3, h: 2, roof: '#F6D5C3' }, { id: 'h2', kind: 'house', x: 18, y: 7, w: 3, h: 2, roof: '#D6E6F5' }, { id: 'h3', kind: 'house', x: 1, y: 12, w: 3, h: 2, roof: '#FBE6B0' },
        { id: 'c1', kind: 'crates', x: 5, y: 5 }, { id: 'c2', kind: 'barrel', x: 17, y: 4 }, { id: 'c3', kind: 'barrel', x: 18, y: 4 },
        { id: 'k2', kind: 'tent', x: 18, y: 11, color: '#0E7490' }, { id: 'k3', kind: 'tent', x: 5, y: 11, color: '#C2410C' },
        { id: 'bf1', kind: 'beacon', x: 8, y: 10, lit: true }, { id: 'bf2', kind: 'beacon', x: 14, y: 10, lit: true },
        { id: 't1', kind: 'torchw', x: 9, y: 3 }, { id: 't2', kind: 'torchw', x: 13, y: 3 },
        { id: 'flag', kind: 'banner', x: 11, y: 2, colors: ['#15803D', '#FFFFFF', '#DC2626'] },
        { id: 'safeY', kind: 'safe', x: 11, y: 12 }, { id: 's1', kind: 'star', x: 1, y: 3 }
      ],
      on: {
        miriam: async A => {
          if (A.flag('saved')) return A.say([{ who: 'miriam', text: 'أنت بطل المنجم كله اليوم!' }]);
          if (A.flag('met')) return A.say([{ who: 'miriam', text: ((A.goal() || {}).hint || 'بالتوفيق!') }]);
          await A.say([
            { who: 'miriam', text: 'جئتَ في وقتك! العمّ سالم نزل إلى الأشغال القديمة ليتفقد عرقاً قديماً، ولم يعد.' },
            { who: 'miriam', text: 'الأنفاق هناك مظلمة. خذ هذا المصباح، لكن زيته قليل: املأه من مصابيح الزيت المعلّقة في الطريق.' },
            { who: 'miriam', text: 'وخذ المعول أيضاً. الصخور تسقط هناك كثيراً.' }
          ]);
          A.give('lamp'); A.give('pick'); A.S.flags.fuel = 100; A.flag('met', true);
        },
        saleh: A => A.say([{ who: 'saleh', text: A.flag('saved') ? 'لن ننسى ما فعلت يا بطل.' : 'المصعد ينزل إلى الطبقة العميقة. انتبه للنهر الجوفي هناك… لا يعبره أحد إلا بمنصة البكرة.' }]),
        salemY: A => A.say([{ who: 'salem', text: 'أربعون سنة في المنجم، ولم أرَ شجاعة مثل شجاعتك.' }])
      }
    },
    deep: {
      theme: 'cave', map: rows(D), dark: .55,
      enter: A => { if (!A.flag('deep')) { A.flag('deep', true); A.say([{ who: 'narrator', text: 'الطبقة العميقة… رائحة التراب، وصوت قطرات الماء، وظلام يبتلع الضوء.' }, { who: 'hero', text: 'سأقتصد في زيت المصباح، وأملؤه كلما وجدت مصباح زيت.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 1, y: 8, to: 'yard', tx: 11, ty: 5 },
        { id: 'safeD', kind: 'safe', x: 3, y: 7 },
        { id: 'oil1', kind: 'oil', x: 5, y: 6 }, { id: 'oil2', kind: 'oil', x: 16, y: 7 }, { id: 'oil3', kind: 'oil', x: 24, y: 6 },
        { id: 'basket', kind: 'basket', x: 18, y: 10, n: 0 },
        ...[[2, 6], [6, 10], [12, 7], [17, 6], [21, 5], [28, 5], [21, 12]].map(([x, y], i) => ({ id: 'tw' + i, kind: 'torchw', x, y })),
        ...[[1, 10], [13, 12], [14, 12], [24, 12], [25, 12], [28, 11]].map(([x, y], i) => ({ id: 'cr' + i, kind: 'crystal', x, y, lit: true })),
        { id: 'pl1', kind: 'pillar', x: 15, y: 11 }, { id: 'bx1', kind: 'crates', x: 22, y: 6 }, { id: 'bx2', kind: 'barrel', x: 4, y: 10 },
        { id: 'sg', kind: 'sign', x: 17, y: 11, text: 'بكرة المنصة: كلما ثقلت السلة ارتفعت المنصة على الجهة الأخرى. تحتاج ثلاثة حجارة.' },
        { id: 'toOld', kind: 'exit', x: 28, y: 8, to: 'old', tx: 2, ty: 4 },
        { id: 's2', kind: 'star', x: 12, y: 3 }, { id: 's3', kind: 'star', x: 27, y: 11 }
      ],
      onSolid: (A, x, y, ch) => {
        if (ch !== 'R') return false;
        if (!A.has('pick')) { A.toast('🪨 صخرة كبيرة… تحتاج معولاً'); return true; }
        A.setTile(x, y, '.'); A.give('rock'); A.shake(.35); A.sfx('drop'); A.sparkle(x, y, '#9C8F80'); return true;
      },
      on: {
        oil1: (A, e) => refill(A, e), oil2: (A, e) => refill(A, e), oil3: (A, e) => refill(A, e),
        basket: async (A, e) => {
          if (A.flag('bridge')) return A.toast('🌉 المنصة مرفوعة');
          const n = Math.min(3 - (e.n || 0), A.count('rock'));
          if (!n) return A.say([{ who: 'narrator', text: `السلة فيها ${['لا شيء', 'حجر واحد', 'حجران'][e.n || 0]}. تحتاج ثلاثة حجارة لترتفع المنصة.` }]);
          A.take('rock', n); A.set('basket', { n: (e.n || 0) + n }); A.sfx('pick');
          if (A.ent('basket').n >= 3) { A.flag('bridge', true); A.setTile(19, 9, '_'); A.setTile(20, 9, '_'); A.shake(.5); A.sfx('gate'); await A.say([{ who: 'narrator', text: 'نزلت السلة الثقيلة… وارتفعت على الجهة الأخرى منصة خشبية امتدت فوق النهر الجوفي!' }]); }
          else A.toast(`🪨 في السلة ${A.ent('basket').n === 1 ? 'حجر واحد' : 'حجران'} من ثلاثة`);
        }
      },
      tick: (A, dt) => burn(A, dt)
    },
    old: {
      theme: 'cave', map: rows(O), dark: .55,
      enter: A => { if (!A.flag('old')) { A.flag('old', true); A.say([{ who: 'narrator', text: 'الأشغال القديمة: سكك صدئة، ومفترقان، وفي آخر النفق حاجز خشبي ضخم.' }, { who: 'salem', text: '(صوت بعيد) …هل من أحد هناك؟ أنا عالق خلف الحاجز!' }, { who: 'hero', text: 'العمّ سالم! الحاجز ثقيل… لعل عربة المنجم تحطمه.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 1, y: 4, to: 'deep', tx: 27, ty: 8 },
        { id: 'safeO', kind: 'safe', x: 3, y: 5 },
        { id: 'cart', kind: 'cart', x: 4, y: 8, load: '#7A6B5C' },
        { id: 'sw1', kind: 'lever', x: 11, y: 7, color: '#2F6FD6', on: false }, { id: 'sw2', kind: 'lever', x: 11, y: 15, color: '#D63A3A', on: false },
        { id: 'sg1', kind: 'sign', x: 9, y: 7, text: 'المحوّل الأزرق: إن رُفع انعطفت السكة جنوباً، وإلا استمرت شرقاً.' },
        { id: 'sg2', kind: 'sign', x: 9, y: 15, text: 'المحوّل الأحمر: إن رُفع اتجهت السكة شرقاً نحو الحاجز، وإلا غرباً.' },
        { id: 'stop1', kind: 'barrel', x: 17, y: 8 }, { id: 'stop2', kind: 'barrel', x: 3, y: 14 },
        { id: 'wall', kind: 'gate', x: 20, y: 14, when: A => A.flag('crash'), openMsg: '💥 تحطم الحاجز الخشبي!' },
        { id: 'salem', kind: 'npc', who: 'salem', x: 24, y: 14, face: 'left', mark: A => A.flag('crash') && !A.flag('saved') ? '!' : null },
        { id: 'beams', kind: 'crates', x: 25, y: 13 },
        ...[[5, 2], [12, 2], [20, 2], [26, 6], [7, 16], [17, 16], [21, 12]].map(([x, y], i) => ({ id: 'ow' + i, kind: 'torchw', x, y })),
        ...[[1, 10], [1, 11], [26, 16], [22, 16], [13, 6]].map(([x, y], i) => ({ id: 'oc' + i, kind: 'crystal', x, y, lit: true })),
        { id: 'ob1', kind: 'crates', x: 13, y: 11 }, { id: 'ob2', kind: 'barrel', x: 7, y: 11 }, { id: 'ob3', kind: 'barrel', x: 23, y: 8 },
        { id: 'oil4', kind: 'oil', x: 6, y: 3 }, { id: 'oil5', kind: 'oil', x: 22, y: 5 },
        { id: 's4', kind: 'star', x: 26, y: 2 }, { id: 's5', kind: 'star', x: 2, y: 16 }
      ],
      on: {
        oil4: (A, e) => refill(A, e), oil5: (A, e) => refill(A, e),
        cart: async A => {
          if (ride || A.flag('crash')) return;
          const r = cartRoute(A); ride = { r, i: 0, t: 0 }; A.sfx('engine'); A.toast('🛒 انطلقت العربة!');
        },
        salem: async A => {
          if (A.flag('saved')) return;
          await A.say([
            { who: 'salem', text: 'الحمد لله! سقطت عارضة خلفي فأغلقت الطريق، وانطفأ مصباحي منذ ساعات.' },
            { who: 'hero', text: 'هيا يا عمّ، القرية كلها تنتظرك.' },
            { who: 'narrator', text: 'وفجأة… اهتز النفق، وتساقط الغبار من السقف!' },
            { who: 'salem', text: 'النفق ينهار! العربة الكبيرة هناك على السكة الرئيسية… اركب معي، بسرعة!' }
          ]);
          A.flag('saved', true);
          const m = await import('./ride.js');   // الفصل الأخير: رحلة العربة هرباً من الانهيار
          await new Promise(res => m.playRide({ onDone: res, story: true }));
          A.S.flags.weather = { dark: .2 }; await A.goto('yard', 11, 7); A.show('salemY');
          await A.say([
            { who: 'narrator', text: 'خرجت العربة من فم النفق إلى ساحة المنجم، والنجوم تملأ السماء.' },
            { who: 'miriam', text: 'العمّ سالم! لقد عدتما!' },
            { who: 'salem', text: 'لولا هذا البطل لبقيت هناك. شكراً يا بني.' },
            { who: 'saleh', text: 'سنسمّي العرق الجديد باسمك: «عرق البطل»!' }
          ]);
          A.complete();
        }
      },
      tick: (A, dt) => { burn(A, dt); moveCart(A, dt); }
    }
  }
};

/* المصباح: يخفت في الطبقات المظلمة، والظلام يشتد كلما نقص زيته (بلا عقاب: يبقى ضوء خافت) */
function burn(A, dt) {
  const f = A.S.flags; if (f.fuel == null) f.fuel = 100;
  f.fuel = Math.max(0, f.fuel - dt * 2.4);
  f.weather = { dark: .5 + (1 - f.fuel / 100) * .42 };
  if (f.fuel < 30 && !f.warn1) { f.warn1 = 1; A.toast('🏮 زيت المصباح يقل… ابحث عن مصباح زيت'); }
  if (f.fuel <= 0 && !f.warn0) { f.warn0 = 1; A.toast('🌑 انطفأ المصباح تقريباً! مصابيح الزيت تلمع في الظلام'); }
}
function refill(A, e) {
  A.S.flags.fuel = 100; A.S.flags.warn1 = A.S.flags.warn0 = 0; A.sfx('pick'); A.sparkle(e.x, e.y - 1, '#FFB060'); A.toast('🏮 امتلأ المصباح بالزيت'); A.save();
}
/* العربة: تتقدم بلاطة كل ٠٫٢٢ ثانية على مسارها، وتنتظر إن وقف البطل أمامها */
function moveCart(A, dt) {
  if (!ride) return; const c = A.ent('cart'); if (!c) return;
  const [nx, ny] = ride.r.pts[ride.i] || [], h = A.hero();
  if (nx === undefined) {
    const end = ride.r.end; ride = null;
    if (end === 'gate') { A.flag('crash', true); A.shake(1); A.sfx('gate'); A.set('cart', { x: 18, y: 13, px: null, py: null }); A.say([{ who: 'narrator', text: 'دوّى صوت هائل… وتحطم الحاجز الخشبي!' }, { who: 'salem', text: 'أنا هنا يا بني!' }]); return; }
    A.shake(.4); A.sfx('cough'); A.toast(end === 'east' ? '🛢️ اصطدمت العربة بنهاية السكة الشرقية… جرّب المحوّل الأزرق' : '🛢️ وصلت العربة إلى نهاية السكة الغربية… جرّب المحوّل الأحمر');
    setTimeout(() => { A.set('cart', { x: 4, y: 8, px: null, py: null }); A.toast('🔄 عادت العربة إلى بدايتها'); }, 1600); return;
  }
  if (h.x === nx && h.y === ny) return;   // البطل على السكة أمامها: تنتظر
  ride.t += dt; const k = Math.min(1, ride.t / .22), [px, py] = ride.i ? ride.r.pts[ride.i - 1] : [4, 8];
  c.px = px + (nx - px) * k; c.py = py + (ny - py) * k;
  if (k >= 1) { c.x = nx; c.y = ny; ride.i++; ride.t = 0; }
}
