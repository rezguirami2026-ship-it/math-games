// المغامرة ٥: «مهمة في الصحراء» — تُفتح بعد الوحدة السابعة. عاصفة رملية تضرب مخيم القافلة ويضيع الجمل «سهيل».
// المخيم (عاصفة رملية تدفع البطل فيحتمي خلف الخيام، آثار حوافر تدل على الطريق)، الكثبان ليلاً (عقارب، أكوام رمل تُحفر بالمجرفة،
// الفلكي حمدان ولغز أعمدة الإرشاد نحو النجم القطبي)، والواحة (ملء القربة، سقي سهيل، وقيادته إلى القافلة). بلا رياضيات ولا مؤقت ولا عقاب.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const rows = g => g.map(r => r.join(''));

/* ── مخيم القافلة (٣٠×٢٢) ── */
const K = grid(30, 22); border(K); rect(K, 1, 10, 28, 10, '_'); K[10][29] = '_';
pts(K, [[2, 2], [27, 2], [2, 19], [27, 19], [15, 2], [15, 19]], 'T');

/* ── الكثبان ليلاً (٣٠×٢٢) ── */
const D = grid(30, 22); border(D); D[10][0] = '_'; D[10][29] = '_';
pts(D, [[4, 3], [11, 2], [3, 18], [12, 20], [19, 18], [10, 9]], 'T');
pts(D, [[8, 5], [14, 16], [22, 6]], 'R');                        // أكوام رمل تُحفر بالمجرفة
rect(D, 26, 1, 26, 20, '#'); D[10][26] = '.';                    // سور الواحة القديم (بوابته عند ٢٦،١٠)

/* ── الواحة (٢٨×١٨) ── */
const O = grid(28, 18); border(O); O[9][0] = '_';
rect(O, 10, 4, 16, 7, '~'); pts(O, [[9, 3], [17, 3], [9, 8], [17, 8], [20, 3], [6, 12], [22, 13], [3, 3], [24, 4]], 'T');

const JABER = { kind: 'man', robe: '#EFE6D2', accent: '#7B3F98', skin: '#B97F52', beard: '#2B2B2B', hat: 'cap', tool: 'cane' };
const VANE_N = 2;   // الاتجاه نحو الشمال (النجم القطبي)
export default {
  id: 'desert', title: 'مهمة في الصحراء', icon: '🏜️', stars: 5,
  start: { area: 'camp', x: 3, y: 10 },
  breakTool: 'shovel',
  items: { skin: { icon: '🫗', name: 'قربة ماء فارغة' }, water: { icon: '💧', name: 'قربة مملوءة بالماء' }, shovel: { icon: '🪏', name: 'المجرفة' }, paw: { icon: '🐾', name: 'أثر حافر سهيل' }, bell: { icon: '🔔', name: 'جرس سهيل' }, rope: { icon: '🪢', name: 'الرسن' } },
  cast: {
    jaber: { name: 'جابر دليل القافلة', look: JABER },
    hamdan: { name: 'الفلكي حمدان', look: { kind: 'man', robe: '#1F3F86', accent: '#E3B04B', skin: '#C98E5F', beard: '#DDDDDD', glasses: true, elder: true } }
  },
  goals: [
    { text: 'احتمِ من العاصفة الرملية وتحدّث مع جابر دليل القافلة', done: A => A.flag('met'), at: () => ({ area: 'camp', id: 'jaber' }), hint: 'جابر عند خيمته غرب المخيم.' },
    { text: 'خذ القربة الفارغة والرسن من صندوق الخيمة', done: A => A.has('skin') || A.has('water') || A.flag('found'), at: () => ({ area: 'camp', id: 'c_skin' }), hint: 'الصندوق شمال خيمة جابر.' },
    { text: 'خذ المجرفة من صندوق العُدّة', done: A => A.has('shovel'), at: () => ({ area: 'camp', id: 'c_shovel' }), hint: 'صندوق العدة جنوب المخيم.' },
    { text: 'اتبع آثار حوافر سهيل: اجمع ٣ آثار (احتمِ خلف الخيام عند الهبّات)', done: A => A.count('paw') >= 3 || A.flag('dunes'), at: A => ({ area: 'camp', id: ['pw1', 'pw2', 'pw3'].find(id => !(A.ent(id) || {}).got) || 'pw1' }), hint: 'الريح الرملية تهب من الشرق. قف غرب خيمة أو صندوق حين يظهر التحذير.' },
    { text: 'الآثار تتجه شرقاً… اخرج إلى الكثبان', done: A => A.flag('dunes'), at: () => ({ area: 'dunes', x: 1, y: 10 }), hint: 'المخرج في نهاية الطريق شرق المخيم.' },
    { text: 'تحدّث مع الفلكي حمدان عند خيمته', done: A => A.flag('hamdan'), at: () => ({ area: 'dunes', id: 'hamdan' }), hint: 'خيمته جنوب غرب الكثبان، والضوء يدل عليها.' },
    { text: 'احفر أكوام الرمل الثلاثة بالمجرفة وابحث عن جرس سهيل', done: A => A.has('bell') || A.flag('found'), at: A => { const m = [[8, 5], [14, 16], [22, 6]].find(([x, y]) => !A.S.cut['dunes:' + x + ',' + y]); return m ? { area: 'dunes', x: m[0], y: m[1] } : { area: 'dunes', id: 'hamdan' }; }, hint: 'انقر على كومة الرمل والمجرفة معك. احذر العقارب!' },
    { text: 'أدر أعمدة الإرشاد الثلاثة نحو الشمال مثل عمود الفلكي', done: A => A.flag('vanes'), at: A => ({ area: 'dunes', id: ['v1', 'v2', 'v3'].find(id => (A.ent(id) || {}).r !== VANE_N) || 'v1' }), hint: 'النجم القطبي في الشمال (أعلى الشاشة). انقر على العمود ليدور حتى يشير سهمه إلى الأعلى مثل عمود الفلكي.' },
    { text: 'ادخل الواحة عبر البوابة القديمة', done: A => A.flag('oasis'), at: () => ({ area: 'oasis', x: 1, y: 9 }), hint: 'البوابة في السور الشرقي، وقد انفتحت.' },
    { text: 'املأ القربة من نبع الواحة', done: A => A.has('water') || A.flag('found'), at: () => ({ area: 'oasis', id: 'spring' }), hint: 'النبع جنوب البركة.' },
    { text: 'اسقِ سهيل الماء واربط رسنه', done: A => A.flag('found'), at: () => ({ area: 'oasis', id: 'suhail' }), hint: 'سهيل جالس متعب شرق الواحة.' },
    { text: 'قُد سهيل إلى جابر والقافلة عند مدخل الواحة', done: A => A.flag('home'), at: () => ({ area: 'oasis', id: 'jaber2' }), hint: 'امشِ وسهيل يتبعك، حتى تصل إلى جابر.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'قافلة قرية الخير في طريقها إلى سوق الواحة… وفجأة اسودّ الأفق.' },
    { who: 'narrator', text: 'عاصفة رملية! انقلبت الخيام، وحين هدأت الهبّة الأولى… كان سهيل الجمل الصغير قد اختفى!' },
    { who: 'hero', text: 'سهيل! لن أعود إلى القرية من دونه.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 35; s.decor = s.decor || {}; s.decor.astrolabe = s.decor.astrolabe || Date.now(); },
  rewards: ['💎 ٣٥ جوهرة', '🧭 إسطرلاب الفلكي حمدان في ساحة القرية', '🏅 وسام «دليل الصحراء»'],
  areas: {
    camp: {
      theme: 'desert', map: rows(K), dark: .12, sand: true,
      wind: { period: 7, dur: 2.4, dx: -1, dy: 0, force: 2.4, zones: [[6, 1, 28, 20]], until: A => A.count('paw') >= 3 || A.flag('dunes') },
      ents: [
        { id: 'jaber', kind: 'npc', who: 'jaber', x: 5, y: 9, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'tj', kind: 'tent', x: 4, y: 7, color: '#8E3B3B' }, { id: 'safeC', kind: 'safe', x: 3, y: 12 },
        { id: 'c_skin', kind: 'chest', x: 6, y: 5, item: 'skin' }, { id: 'c_shovel', kind: 'chest', x: 5, y: 15, item: 'shovel' },
        { id: 'tn1', kind: 'tent', x: 11, y: 5, color: '#6B4A2E' }, { id: 'tn2', kind: 'tent', x: 18, y: 14, color: '#3E2A4E' }, { id: 'tn3', kind: 'tent', x: 23, y: 5, color: '#2E6B4A' },
        { id: 'cr1', kind: 'crates', x: 14, y: 12 }, { id: 'cr2', kind: 'barrel', x: 21, y: 8 }, { id: 'cr3', kind: 'crates', x: 10, y: 16 }, { id: 'cr4', kind: 'barrel', x: 25, y: 13 }, { id: 'cr5', kind: 'crates', x: 17, y: 7 },
        { id: 'pw1', kind: 'item', x: 12, y: 8, item: 'paw', after: A => A.toast('🐾 أثر حافر صغير… يتجه شرقاً!') },
        { id: 'pw2', kind: 'item', x: 19, y: 12, item: 'paw', after: A => A.toast('🐾 أثر آخر، وعليه خيوط حمراء من بطانية سهيل!') },
        { id: 'pw3', kind: 'item', x: 24, y: 6, item: 'paw', after: A => A.say([{ who: 'hero', text: 'الآثار كلها تتجه شرقاً نحو الكثبان. سهيل ذهب من هنا!' }]) },
        { id: 'toDunes', kind: 'exit', x: 29, y: 10, to: 'dunes', tx: 1, ty: 10, when: A => A.flag('met') && A.has('shovel') && (A.count('paw') >= 3), locked: 'الكثبان واسعة… أحتاج المجرفة، وأن أتبع آثار سهيل الثلاثة أولاً.' },
        { id: 's1', kind: 'star', x: 27, y: 17 }, { id: 's2', kind: 'star', x: 9, y: 2 }
      ],
      on: {
        jaber: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'jaber', text: 'تعال خلف الخيمة! الريح الرملية تهب من الشرق، ومن يقف في وجهها تدفعه بعيداً.' },
              { who: 'jaber', text: 'سهيل خاف من العاصفة وهرب. ابحث عن آثار حوافره، ستدلك على طريقه.' },
              { who: 'jaber', text: 'خذ القربة والرسن من صندوق خيمتي، ومجرفة من صندوق العُدّة. الرمال تدفن كل شيء.' },
              { who: 'jaber', text: 'سأقود القافلة إلى مدخل الواحة وأنتظرك هناك. بالتوفيق يا بطل!' }
            ]); A.flag('met', true); return;
          }
          A.say([{ who: 'jaber', text: 'الآثار تدلك على الطريق. ' + ((A.goal() || {}).hint || '') }]);
        },
        c_skin: async (A, e) => { if (e.open) return; A.set(e.id, { open: true }); A.sfx('win'); A.give('skin'); A.give('rope', 1, true); }
      }
    },
    dunes: {
      theme: 'desert', map: rows(D), dark: .5,
      enter: A => { if (!A.flag('dunes')) { A.flag('dunes', true); A.say([{ who: 'narrator', text: 'هدأت العاصفة وحلّ الليل. كثبان فضية تحت النجوم… وضوء خيمة صغيرة في البعيد.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 10, to: 'camp', tx: 28, ty: 10 },
        { id: 'safeD', kind: 'safe', x: 2, y: 10 }, { id: 'safeD2', kind: 'safe', x: 16, y: 13 },
        { id: 'th', kind: 'tent', x: 5, y: 13, color: '#1F3F86' }, { id: 'hamdan', kind: 'npc', who: 'hamdan', x: 7, y: 14, face: 'left', mark: A => A.flag('hamdan') ? null : '!' },
        { id: 'fh', kind: 'fire', x: 8, y: 15 },
        { id: 'sc1', kind: 'hazard', creature: 'scorpion', path: [[11, 6], [18, 6]], speed: 1.1, r: .55, caughtMsg: '🦂 لدغة عقرب! تعود إلى النار الآمنة… انتظر حتى يبتعد.' },
        { id: 'sc2', kind: 'hazard', creature: 'scorpion', path: [[12, 13], [12, 18]], speed: 1, r: .55, caughtMsg: '🦂 لدغة عقرب! تعود إلى النار الآمنة… انتظر حتى يبتعد.' },
        { id: 'sc3', kind: 'hazard', creature: 'scorpion', path: [[20, 15], [24, 15]], speed: .9, r: .55, caughtMsg: '🦂 لدغة عقرب! تعود إلى النار الآمنة… انتظر حتى يبتعد.' },
        { id: 'vm', kind: 'rot', style: 'vane', x: 18, y: 3, r: VANE_N },
        { id: 'v1', kind: 'rot', style: 'vane', x: 17, y: 9, r: 0 }, { id: 'v2', kind: 'rot', style: 'vane', x: 20, y: 11, r: 1 }, { id: 'v3', kind: 'rot', style: 'vane', x: 23, y: 9, r: 3 },
        { id: 'sgV', kind: 'sign', x: 15, y: 10, text: 'أعمدة الإرشاد القديمة: «إذا أشارت الثلاثة إلى النجم القطبي، انفتح باب الواحة». انقر على العمود ليدور.' },
        { id: 'gate', kind: 'gate', x: 26, y: 10, when: A => A.flag('vanes'), openMsg: '🔓 انفتحت بوابة الواحة القديمة!' },
        { id: 'toOasis', kind: 'exit', x: 29, y: 10, to: 'oasis', tx: 1, ty: 9 },
        { id: 's3', kind: 'star', x: 24, y: 19 }, { id: 's4', kind: 'star', x: 2, y: 2 }
      ],
      onSolid: (A, x, y, ch) => {
        if (ch !== 'R') return false;
        if (!A.has('shovel')) { A.toast('🏜️ كومة رمل… تحتاج المجرفة.'); return true; }
        A.cut(x, y); A.sfx('drop'); A.shake(.3);
        if (x === 14 && y === 16) { A.give('bell'); A.say([{ who: 'hero', text: 'جرس سهيل! مدفون هنا… فهو قريب من الواحة.' }]); }
        else A.toast('🏜️ حفرتَ… لا شيء هنا سوى الرمل.');
        return true;
      },
      onRotate: A => { if (!A.flag('vanes') && ['v1', 'v2', 'v3'].every(id => A.ent(id).r === VANE_N)) { A.flag('vanes', true); A.sfx('win'); A.toast('🧭 الأعمدة الثلاثة تشير إلى النجم القطبي!'); } },
      on: {
        hamdan: async A => {
          if (!A.flag('hamdan')) {
            await A.say([
              { who: 'hamdan', text: 'أهلاً بك يا بنيّ. أنا حمدان، أقرأ النجوم منذ أربعين سنة.' },
              { who: 'hamdan', text: 'رأيت جملاً صغيراً يركض نحو الواحة قبل المغرب، وسقط منه شيء في الرمال. احفر الأكوام، لعلك تجده.' },
              { who: 'hamdan', text: 'وباب الواحة القديم لا يُفتح إلا حين تشير أعمدة الإرشاد إلى النجم القطبي، مثل عمودي الذهبي في الشمال.' },
              { who: 'hamdan', text: 'تذكّر: النجم القطبي ثابت في الشمال، به يهتدي المسافرون في الصحراء منذ القدم.' }
            ]); A.flag('hamdan', true); return;
          }
          A.say([{ who: 'hamdan', text: A.flag('vanes') ? 'أحسنت! النجم القطبي دلّك على الطريق.' : A.has('bell') ? 'جرس سهيل! الآن أدر الأعمدة نحو الشمال.' : 'احفر أكوام الرمل، واحذر العقارب.' }]);
        },
        vm: A => A.say([{ who: 'narrator', text: 'عمود الفلكي الذهبي: يشير إلى النجم القطبي في الشمال.' }])
      }
    },
    oasis: {
      theme: 'desert', map: rows(O), dark: 0,
      enter: A => { if (!A.flag('oasis')) { A.flag('oasis', true); A.say([{ who: 'narrator', text: 'أشرقت الشمس على واحة خضراء: نخيل وبركة صافية وطيور… وصوت جمل صغير يئنّ من العطش!' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 9, to: 'dunes', tx: 28, ty: 10 },
        { id: 'jaber2', kind: 'npc', who: 'jaber', x: 3, y: 13, face: 'right', mark: A => A.flag('found') && !A.flag('home') ? '!' : null },
        { id: 'tc1', kind: 'tent', x: 2, y: 15, color: '#8E3B3B' }, { id: 'tc2', kind: 'tent', x: 6, y: 15, color: '#2E6B4A' },
        { id: 'spring', kind: 'well', x: 13, y: 10 },
        { id: 'suhail', kind: 'animal', creature: 'camel', x: 22, y: 9, mark: A => A.flag('found') ? null : '!' },
        { id: 's5', kind: 'star', x: 25, y: 15 }
      ],
      tick: A => { if (A.flag('found') && !A.flag('home') && A.near('suhail', 1, 11, 6, 15) && A.heroIn(1, 11, 6, 15)) { A.flag('home', true); A.unfollow('suhail', 5, 12); finale(A); } },
      on: {
        spring: async A => {
          if (A.has('water')) return A.toast('💧 القربة مملوءة');
          if (!A.has('skin')) return A.say([{ who: 'narrator', text: 'نبع ماء عذب… لو معي قربة!' }]);
          A.take('skin'); A.give('water'); A.sfx('drop'); A.sparkle(13, 10, '#7CD6FF');
        },
        suhail: async A => {
          if (A.flag('found')) return A.toast('🐪 سهيل يتبعك. خذه إلى جابر!');
          if (!A.has('water')) return A.say([{ who: 'narrator', text: 'سهيل متعب جداً ولا يقوى على القيام… إنه عطشان. املأ القربة من النبع.' }]);
          A.take('water'); A.sfx('win'); A.sparkle(22, 9);
          await A.say([{ who: 'narrator', text: 'شرب سهيل حتى ارتوى، ثم نهض وهزّ رأسه فرحاً حين رأى جرسه معك!' }, { who: 'hero', text: 'هيا يا سهيل، القافلة تنتظرنا.' }]);
          A.flag('found', true); A.follow('suhail');
        },
        jaber2: A => A.say([{ who: 'jaber', text: A.flag('found') ? 'أحضره إلى هنا!' : 'وصلت القافلة. هل وجدت سهيل؟ سمعت صوته شرق الواحة.' }])
      }
    }
  }
};

async function finale(A) {
  A.sfx('win'); A.sparkle(5, 12);
  await A.say([
    { who: 'jaber', text: 'سهيل! الحمد لله على سلامتك يا صغير!' },
    { who: 'narrator', text: 'علّق جابر الجرس في رقبة سهيل من جديد، وانطلقت القافلة نحو قرية الخير وسهيل يمشي في المقدمة.' },
    { who: 'hamdan', text: 'ومن الليلة، كلما رأيت النجم القطبي، تذكّر أنه دلّك على صديقك.' }
  ]);
  A.complete();
}
