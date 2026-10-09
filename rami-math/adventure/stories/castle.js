// المغامرة الكبرى: «القلعة المظلمة» — تُفتح بعد الوحدة التاسعة (آخر وحدة). «سيد الظلال» سرق قنديل الخير فغرقت القرية في ليل طويل.
// سفح القلعة (ألواح الجسر المتحرك بين حراس الظلال، شعلة من نار المخيم، ومجمرتا البوابة)، ساحة القلعة (إنقاذ زياد بصندوقين على
// لوحين، وشعاع القمر بمرآتين إلى بلّورة باب البرج)، وقاعة العرش (رموز من ذكريات المغامرات، وحوار يكشف سر سيد الظلال)،
// ثم احتفال يجمع أصدقاء كل المغامرات. بلا رياضيات ولا مؤقت ولا عقاب.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const rows = g => g.map(r => r.join(''));

/* ── سفح القلعة (٣٠×٢٢): الخندق والسور في الشمال، والمخيم في الجنوب ── */
const F = grid(30, 22); border(F);
rect(F, 1, 1, 28, 2, '#'); rect(F, 15, 1, 15, 2, '_'); F[0][15] = '_';         // ممر البوابة
rect(F, 1, 3, 28, 3, '#'); F[3][15] = '.';                                     // سور القلعة وبوابتها
rect(F, 1, 5, 28, 7, '~');                                                      // الخندق
rect(F, 15, 8, 15, 20, '_');
rect(F, 2, 12, 6, 13, ';'); rect(F, 24, 13, 27, 14, ';');                       // عشب طويل للاختباء
pts(F, [[4, 15], [9, 19], [21, 18], [26, 18], [2, 9], [10, 9]], 'T');

/* ── ساحة القلعة (٣٠×٢٢) ── */
const C = grid(30, 22); border(C);
rect(C, 1, 8, 9, 8, '#'); rect(C, 9, 1, 9, 8, '#'); C[5][9] = '.';               // غرفة السجن (الباب عند ٩،٥)
rect(C, 10, 1, 28, 1, '#'); C[1][15] = '.'; C[0][15] = '_';                      // جدار البرج وبابه
rect(C, 15, 15, 15, 20, '_'); C[21][15] = '_';
rect(C, 12, 16, 14, 18, ';'); rect(C, 25, 5, 27, 7, ';');
pts(C, [[3, 15], [7, 18], [25, 19], [17, 5]], 'T');

/* ── البرج وقاعة العرش (٢٦×١٦) ── */
const W = grid(26, 16, 'c'); border(W);
rect(W, 1, 8, 24, 8, '#'); W[8][13] = 'c'; W[15][13] = '_';

const SHADOW = { kind: 'man', robe: '#2B2633', accent: '#5B3C88', skin: '#9C7A5A', beard: '#2B2B2B', hat: 'cap', vest: '#1E1A26', build: 1.1 };
const DHAFER = { kind: 'man', robe: '#1E1A26', accent: '#7B4FC8', skin: '#B97F52', beard: '#3A3A3A', vest: '#2E2340', build: 1.22, tall: 1.12 };
const FRIENDS = ['harith', 'mubarak', 'saif', 'saeed', 'shaikha', 'jaber', 'majid', 'sara', 'ziyad', 'dhafer'];
const SOL = { t1: 2, t2: 1, t3: 0 };   // من اليمين: 🔥 الشعلة ثم ⚓ المرساة ثم 🏮 الفانوس
const MEM = ['🔥', '⚓', '🏮', '⭐'];
export default {
  id: 'castle', title: 'القلعة المظلمة', icon: '🏰', stars: 5,
  start: { area: 'foot', x: 14, y: 17 },
  symbols: MEM,
  items: { torch: { icon: '🪵', name: 'شعلة غير مشتعلة' }, fire: { icon: '🔥', name: 'شعلة مشتعلة' }, plank: { icon: '🪵', name: 'لوح الجسر المتحرك' }, qindeel: { icon: '🪔', name: 'قنديل الخير' } },
  cast: {
    harith: { name: 'الشيخ الحارث', look: { kind: 'man', robe: '#E3D8C2', accent: '#5E6B78', skin: '#8B5A38', beard: '#D8D8D8', tool: 'cane', elder: true } },
    mubarak: { name: 'النجار مبارك', look: { kind: 'man', robe: '#EFE6D2', accent: '#8A5A30', skin: '#B97F52', beard: '#4A4A4A', apron: '#8A5A30', build: 1.15 } },
    ziyad: { name: 'زياد', look: { kind: 'boy', robe: '#F7F5EF', accent: '#E2475C', skin: '#B97F52', hat: 'cap' } },
    dhafer: { name: 'سيد الظلال', look: DHAFER },
    saif: { name: 'القبطان سيف', look: { kind: 'man', robe: '#F4F1E8', accent: '#1F4E79', skin: '#B97F52', beard: '#5A5A5A', hat: 'cap', build: 1.08 } },
    saeed: { name: 'الجد سعيد', look: { kind: 'man', robe: '#EFE6D2', accent: '#B5651D', skin: '#B97F52', beard: '#DDDDDD', tool: 'cane', elder: true, hat: 'straw' } },
    shaikha: { name: 'الجدة شيخة', look: { kind: 'woman', robe: '#8E3B5E', accent: '#E3B04B', skin: '#C98E5F', elder: true } },
    jaber: { name: 'جابر دليل القافلة', look: { kind: 'man', robe: '#EFE6D2', accent: '#7B3F98', skin: '#B97F52', beard: '#2B2B2B', hat: 'cap', tool: 'cane' } },
    majid: { name: 'الجد ماجد', look: { kind: 'man', robe: '#F4F1E8', accent: '#7B3F98', skin: '#B97F52', beard: '#DDDDDD', tool: 'cane', elder: true } },
    sara: { name: 'المستكشفة سارة', look: { kind: 'woman', robe: '#C9955A', accent: '#2F6FB2', skin: '#D9A374', hat: 'straw', vest: '#7A5230' } }
  },
  goals: [
    { text: 'تحدّث مع الشيخ الحارث في المخيم', done: A => A.flag('met'), at: () => ({ area: 'foot', id: 'harith' }), hint: 'الشيخ الحارث بجانب نار المخيم.' },
    { text: 'اجمع ٣ ألواح من الجسر المتحرك (اختبئ من حراس الظلال في العشب الطويل)', done: A => A.count('plank') >= 3 || A.flag('bridge'), at: A => ({ area: 'foot', id: ['pk1', 'pk2', 'pk3'].find(id => !(A.ent(id) || {}).got) || 'pk1' }), hint: 'الحارس يرى ما أمامه في مخروط الضوء فقط. امشِ خلفه، أو قف في العشب الطويل حتى يمر.' },
    { text: 'أصلح الجسر فوق الخندق مع النجار مبارك', done: A => A.flag('bridge'), at: A => ({ area: 'foot', id: ['br1', 'br2', 'br3'].find(id => !(A.ent(id) || {}).built) || 'br1' }), hint: 'الإطارات الذهبية فوق الخندق أماكن الألواح. انقر عليها من الأقرب إلى الأبعد.' },
    { text: 'أشعل شعلتك من نار المخيم', done: A => A.has('fire') || A.flag('gate'), at: () => ({ area: 'foot', id: 'camp' }), hint: 'نار المخيم في وسط الطريق جنوب الخندق.' },
    { text: 'أوقد مجمرتي البوابة لتنفتح', done: A => A.flag('gate'), at: A => ({ area: 'foot', id: ['bc1', 'bc2'].find(id => !(A.ent(id) || {}).lit) || 'bc2' }), hint: 'المجمرتان على جانبي بوابة القلعة بعد الجسر. الظلال تهرب من النور!' },
    { text: 'ادخل ساحة القلعة', done: A => A.flag('court'), at: () => ({ area: 'court', x: 15, y: 20 }), hint: 'البوابة انفتحت شمال الجسر.' },
    { text: 'حرّر زياد: ادفع الصندوقين على اللوحين فينفتح القفص', done: A => A.flag('ziyad'), at: A => ({ area: 'court', id: !A.flag('cage') ? (A.pressed(A.ent('p1')) ? 'b2' : 'b1') : 'ziyad' }), hint: 'غرفة السجن غرب الساحة. انقر على الصندوق فيدفعه البطل حتى لوحته الذهبية.' },
    { text: 'وجّه شعاع القمر بالمرآتين إلى بلّورة باب البرج', done: A => A.flag('moon'), at: A => ({ area: 'court', id: (A.ent('m1') || {}).r % 2 ? 'm1' : 'm2' }), hint: 'شعاع القمر يدخل من النافذة الشرقية. انقر على المرآة لتدور، واتبع الضوء حتى البلّورة.' },
    { text: 'اصعد إلى برج الظلال', done: A => A.flag('tower'), at: () => ({ area: 'tower', x: 13, y: 14 }), hint: 'باب البرج شمال الساحة انفتح.' },
    { text: 'اضبط ألواح باب العرش على رموز زياد', done: A => A.flag('code'), at: A => ({ area: 'tower', id: ['t1', 't2', 't3'].find(id => (A.ent(id) || {}).sym !== SOL[id]) || 't1' }), hint: 'قال زياد: من اليمين 🔥 الشعلة، ثم ⚓ المرساة، ثم 🏮 الفانوس.' },
    { text: 'واجه سيد الظلال في قاعة العرش', done: A => A.flag('truth'), at: () => ({ area: 'tower', id: 'dhafer' }), hint: 'سيد الظلال جالس على عرشه. ربما الكلمة الطيبة أقوى من السيف.' },
    { text: 'ضع قنديل الخير في منارة البرج', done: A => A.flag('done'), at: () => ({ area: 'tower', id: 'lamp' }), hint: 'المنارة في زاوية قاعة العرش.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'في ليلة بلا قمر، اختفى «قنديل الخير» من ساحة القرية… وغرقت قرية الخير في ظلام لا ينتهي.' },
    { who: 'narrator', text: 'وعلى الجبل البعيد، أضاءت نافذة واحدة في «القلعة المظلمة»، حيث يسكن سيد الظلال.' },
    { who: 'hero', text: 'هذه مغامرتي الكبرى. سأعيد النور إلى قرية الخير!' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 60; s.decor = s.decor || {}; s.decor.qindeel = s.decor.qindeel || Date.now(); },
  rewards: ['💎 ٦٠ جوهرة', '🪔 قنديل الخير في ساحة القرية', '🏅 وسام «بطل قرية الخير»'],
  areas: {
    foot: {
      theme: 'castle', map: rows(F), dark: .42,
      ents: [
        { id: 'harith', kind: 'npc', who: 'harith', x: 13, y: 15, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'mubarak', kind: 'npc', who: 'mubarak', x: 17, y: 9, face: 'left', mark: A => A.flag('met') && !A.flag('mub') ? '!' : null },
        { id: 'camp', kind: 'fire', x: 15, y: 13 },
        { id: 'tent', kind: 'tent', x: 18, y: 15, color: '#6B4A2E' }, { id: 'cr1', kind: 'crates', x: 11, y: 16 },
        { id: 'safeF', kind: 'safe', x: 12, y: 18 }, { id: 'safeF2', kind: 'safe', x: 16, y: 10 },
        { id: 'pk1', kind: 'item', x: 3, y: 10, item: 'plank' }, { id: 'pk2', kind: 'item', x: 27, y: 12, item: 'plank' }, { id: 'pk3', kind: 'item', x: 6, y: 18, item: 'plank' },
        { id: 'gA', kind: 'guard', look: SHADOW, path: [[2, 11], [12, 11]], speed: 1.2, range: 3.4, wait: 1.3, caughtMsg: '🌑 رآك حارس الظلال! تعود بهدوء إلى نار المخيم… اختبئ في العشب الطويل.' },
        { id: 'gB', kind: 'guard', look: SHADOW, path: [[23, 9], [23, 17]], speed: 1.1, range: 3.4, wait: 1.3, caughtMsg: '🌑 رآك حارس الظلال! تعود بهدوء إلى نار المخيم… امشِ خلفه.' },
        { id: 'br1', kind: 'site', x: 15, y: 7, model: 'bridge' }, { id: 'br2', kind: 'site', x: 15, y: 6, model: 'bridge' }, { id: 'br3', kind: 'site', x: 15, y: 5, model: 'bridge' },
        { id: 'sgM', kind: 'sign', x: 13, y: 8, text: 'حطّم حراس الظلال الجسر المتحرك ورموا ألواحه حول المخيم. الإطارات الذهبية فوق الخندق أماكنها.' },
        { id: 'bc1', kind: 'beacon', x: 13, y: 4 }, { id: 'bc2', kind: 'beacon', x: 17, y: 4 },
        { id: 'gate', kind: 'gate', x: 15, y: 3, when: A => A.flag('gate'), openMsg: '🔓 انفتحت بوابة القلعة!' },
        { id: 'toCourt', kind: 'exit', x: 15, y: 0, to: 'court', tx: 15, ty: 20 },
        { id: 's1', kind: 'star', x: 1, y: 20 }, { id: 's2', kind: 'star', x: 28, y: 9 },
        // أصدقاء المغامرات يصلون في الاحتفال
        { id: 'f_saif', kind: 'npc', who: 'saif', x: 11, y: 10, face: 'right', hidden: true }, { id: 'f_saeed', kind: 'npc', who: 'saeed', x: 12, y: 12, face: 'right', hidden: true },
        { id: 'f_shaikha', kind: 'npc', who: 'shaikha', x: 19, y: 10, face: 'left', hidden: true }, { id: 'f_jaber', kind: 'npc', who: 'jaber', x: 19, y: 12, face: 'left', hidden: true },
        { id: 'f_majid', kind: 'npc', who: 'majid', x: 13, y: 11, face: 'right', hidden: true }, { id: 'f_sara', kind: 'npc', who: 'sara', x: 18, y: 11, face: 'left', hidden: true },
        { id: 'f_ziyad', kind: 'npc', who: 'ziyad', x: 14, y: 12, face: 'up', hidden: true }, { id: 'f_dhafer', kind: 'npc', who: 'dhafer', x: 16, y: 12, face: 'up', hidden: true }
      ],
      on: {
        harith: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'harith', text: 'وصلتَ يا بطل! هذه القلعة المظلمة، وفيها قنديل الخير الذي سرقه سيد الظلال.' },
              { who: 'harith', text: 'حراسه حطّموا الجسر المتحرك ورموا ألواحه حول المخيم. النجار مبارك عند الخندق ينتظرها.' },
              { who: 'harith', text: 'وخذ هذه الشعلة. أشعلها من نارنا، فالظلال تهرب من النور، وبوابة القلعة تُفتح بمجمرتيها.' },
              { who: 'harith', text: 'وتذكّر: الحراس لا يرون إلا ما أمامهم. العشب الطويل يخفيك.' }
            ]); A.flag('met', true); A.give('torch'); return;
          }
          A.say([{ who: 'harith', text: A.flag('gate') ? 'البوابة مفتوحة! القرية كلها تدعو لك.' : 'أنت قادر على ذلك. ' + ((A.goal() || {}).hint || '') }]);
        },
        mubarak: async A => {
          if (A.flag('bridge')) return A.say([{ who: 'mubarak', text: 'جسر متين! كما علّمتك أيام العاصفة الكبرى.' }]);
          A.flag('mub', true);
          A.say([{ who: 'mubarak', text: A.count('plank') >= 3 ? 'ثلاثة ألواح! ضعها على الإطارات الذهبية فوق الخندق، وأنا أشدّها بالحبال.' : `أهلاً يا صديقي! أحتاج ثلاثة ألواح لأصلح الجسر (معك ${['لا شيء', 'واحد', 'اثنان'][A.count('plank')]}). احذر الحراس!` }]);
        },
        camp: async A => {
          if (A.has('fire') || A.flag('gate')) return A.toast('🔥 شعلتك مشتعلة');
          if (!A.has('torch')) return A.say([{ who: 'narrator', text: 'نار المخيم دافئة. الشيخ الحارث يريد أن يكلمك.' }]);
          A.take('torch'); A.give('fire'); A.sfx('gate'); A.sparkle(15, 13, '#FF8A1E');
        },
        br1: (A, e) => plank(A, e), br2: (A, e) => plank(A, e), br3: (A, e) => plank(A, e),
        bc1: (A, e) => brazier(A, e), bc2: (A, e) => brazier(A, e)
      }
    },
    court: {
      theme: 'castle', map: rows(C), dark: .55,
      enter: A => { if (!A.flag('court')) { A.flag('court', true); A.say([{ who: 'narrator', text: 'ساحة القلعة: حجارة سوداء، وأشجار يابسة، وحراس بفوانيس بنفسجية… ومن غرفة غرب الساحة صوت تعرفه!' }, { who: 'narrator', text: '«يا بطل! أنا هنا! أنا زياد!»' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 15, y: 21, to: 'foot', tx: 15, ty: 1 },
        { id: 'safeC', kind: 'safe', x: 15, y: 19 }, { id: 'safeC2', kind: 'safe', x: 10, y: 6 },
        { id: 'cage', kind: 'cage', x: 5, y: 2, when: A => { const ok = A.pressed(A.ent('p1')) && A.pressed(A.ent('p2')); if (ok) A.flag('cage', true); return ok; }, openMsg: '🔓 انفتح قفص زياد!' },
        { id: 'ziyad', kind: 'npc', who: 'ziyad', x: 5, y: 2, face: 'down', mark: A => A.flag('cage') && !A.flag('ziyad') ? '!' : null },
        { id: 'p1', kind: 'plate', x: 3, y: 4 }, { id: 'p2', kind: 'plate', x: 7, y: 4 },
        { id: 'b1', kind: 'block', x: 3, y: 6, to: 'p1' }, { id: 'b2', kind: 'block', x: 7, y: 6, to: 'p2' },
        { id: 'sgC', kind: 'sign', x: 11, y: 4, text: 'سجن القلعة: القفص يُفتح حين يقف صندوق ثقيل على كل لوحة ذهبية. انقر على الصندوق فيدفعه البطل.' },
        { id: 'moonW', kind: 'beam', x: 28, y: 9, dir: 2, color: '#CFE3FF', light: 2 },
        { id: 'm1', kind: 'rot', style: 'mirror', x: 20, y: 9, r: 1 }, { id: 'm2', kind: 'rot', style: 'mirror', x: 20, y: 14, r: 1 },
        { id: 'moonC', kind: 'crystal', x: 12, y: 14 },
        { id: 'sgW', kind: 'sign', x: 26, y: 11, text: 'نافذة القمر: «حين يلمس نور القمر البلّورة، ينفتح باب البرج». انقر على المرآة لتدور.' },
        { id: 'tdoor', kind: 'door', x: 15, y: 1, when: A => A.flag('moon'), openMsg: '🔓 انفتح باب برج الظلال!', name: 'باب البرج', locked: 'باب حديدي أسود… عليه رسم هلال. لعل نور القمر يفتحه.' },
        { id: 'toTower', kind: 'exit', x: 15, y: 0, to: 'tower', tx: 13, ty: 14 },
        { id: 'gA', kind: 'guard', look: SHADOW, path: [[11, 11], [18, 11]], speed: 1, range: 3.2, wait: 1.4, caughtMsg: '🌑 رآك حارس الظلال! تعود إلى النار الآمنة… تحرّك حين يدير ظهره.' },
        { id: 'gB', kind: 'guard', look: SHADOW, path: [[24, 3], [24, 17]], speed: 1.1, range: 3.2, wait: 1.2, caughtMsg: '🌑 رآك حارس الظلال! تعود إلى النار الآمنة… اختبئ في العشب الطويل.' },
        { id: 'bn1', kind: 'banner', x: 12, y: 2, color: '#5B3C88' }, { id: 'bn2', kind: 'banner', x: 18, y: 2, color: '#5B3C88' },
        { id: 's3', kind: 'star', x: 28, y: 20 }, { id: 's4', kind: 'star', x: 1, y: 10 }
      ],
      tick: A => { const c = A.ent('moonC'); if (c && c.lit && !A.flag('moon')) { A.flag('moon', true); A.sfx('win'); A.shake(.4); A.toast('🌙 أضاءت بلّورة القمر!'); } },
      on: {
        ziyad: async A => {
          if (!A.flag('cage')) return A.say([{ who: 'ziyad', text: 'القفص يُفتح حين يقف الصندوقان على اللوحين الذهبيين!' }]);
          if (A.flag('ziyad')) return;
          await A.say([
            { who: 'ziyad', text: 'شكراً يا بطل! تبعتُ الحراس لأرى أين أخذوا القنديل… فأمسكوا بي.' },
            { who: 'ziyad', text: 'سمعت سيد الظلال يقول رموز باب عرشه: من اليمين 🔥 الشعلة، ثم ⚓ المرساة، ثم 🏮 الفانوس.' },
            { who: 'hero', text: 'هذه ذكريات مغامراتي! شعلة إنقاذ القرية، ومرساة الجزيرة، وفانوس المهرجان.' },
            { who: 'ziyad', text: 'وباب البرج يفتحه نور القمر من النافذة الشرقية. سأنتظرك في المخيم!' }
          ]);
          A.flag('ziyad', true); A.hide('ziyad'); A.sparkle(5, 2);
        },
        moonC: A => A.say([{ who: 'narrator', text: A.ent('moonC').lit ? 'البلّورة تتوهج بنور القمر الفضي!' : 'بلّورة بيضاء باردة… تنتظر نور القمر.' }])
      }
    },
    tower: {
      theme: 'castle', map: rows(W), dark: .72,
      enter: A => { if (!A.flag('tower')) { A.flag('tower', true); A.say([{ who: 'narrator', text: 'برج الظلال: درج حجري، وباب ضخم عليه ثلاثة ألواح… ومن خلفه ضوء خافت يتراقص.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 13, y: 15, to: 'court', tx: 15, ty: 2 },
        { id: 'safeT', kind: 'safe', x: 13, y: 13 },
        { id: 't1', kind: 'tablet', x: 15, y: 9, sym: 3 }, { id: 't2', kind: 'tablet', x: 16, y: 9, sym: 3 }, { id: 't3', kind: 'tablet', x: 17, y: 9, sym: 3 },
        { id: 'sgT', kind: 'sign', x: 10, y: 10, text: 'باب العرش: «لا يدخل إلا من يتذكّر رحلته». انقر على اللوح ليتغير رمزه.' },
        { id: 'throne', kind: 'door', x: 13, y: 8, when: A => A.flag('code'), openMsg: '🔓 انفتح باب قاعة العرش!', name: 'باب العرش', locked: 'باب العرش مقفل بألواح الرموز. تذكّر ما قاله زياد.' },
        { id: 'dhafer', kind: 'npc', who: 'dhafer', x: 13, y: 3, face: 'down', mark: A => A.flag('code') && !A.flag('truth') ? '!' : null },
        { id: 'lamp', kind: 'beacon', x: 21, y: 3 },
        { id: 'tw1', kind: 'torchw', x: 9, y: 2 }, { id: 'tw2', kind: 'torchw', x: 17, y: 2 },
        { id: 'pl1', kind: 'pillar', x: 6, y: 5, h: 80, color: '#5A5664' }, { id: 'pl2', kind: 'pillar', x: 20, y: 6, h: 80, color: '#5A5664' },
        { id: 'pl3', kind: 'pillar', x: 4, y: 11, h: 60, color: '#5A5664' }, { id: 'pl4', kind: 'pillar', x: 22, y: 11, h: 60, color: '#5A5664' },
        { id: 's5', kind: 'star', x: 24, y: 1 }
      ],
      on: {
        t1: (A, e) => tab(A, e), t2: (A, e) => tab(A, e), t3: (A, e) => tab(A, e),
        dhafer: async A => {
          if (A.flag('truth')) return A.say([{ who: 'dhafer', text: A.flag('done') ? 'شكراً لأنك سألتني.' : 'ضع القنديل في المنارة… ودع القرية ترى النور.' }]);
          await A.say([{ who: 'dhafer', text: 'من تجرّأ على دخول قلعتي؟ قنديل الخير لي الآن، ولن يعود النور إلى قريتكم!' }]);
          for (;;) {
            const k = await A.choose('ماذا تقول لسيد الظلال؟', ['«سأهزمك يا سيد الظلال!»', '«لماذا أطفأت نور قريتنا؟»'], 'hero');
            if (k === 1) break;
            A.shake(.4); await A.say([{ who: 'dhafer', text: 'هه! كلهم يقولون هذا… ثم يرحلون.' }, { who: 'narrator', text: 'ازدادت الظلال كثافة. القوة لا تطرد الظلام… ربما يحتاج من يسأله.' }]);
          }
          await A.say([
            { who: 'dhafer', text: '(يصمت طويلاً…) لم يسألني أحد من قبل.' },
            { who: 'dhafer', text: 'اسمي ظافر. كنت صبياً من قرية الخير. ضللتُ الطريق في ليلة مظلمة، وكانت أنوار القرية تضيء فرحة… ولم يأتِ أحد يبحث عني.' },
            { who: 'dhafer', text: 'كبرتُ وحيداً في هذه القلعة. وقلت: ليعرفوا معنى الظلام كما عرفته.' },
            { who: 'hero', text: 'القرية لم تنسَك يا ظافر. الشيخ الحارث يذكر صبياً ضاع منذ سنين، وما زال يدعو له. تعال معنا، فمكانك في الاحتفال.' },
            { who: 'dhafer', text: 'حقاً؟… خذ قنديل الخير. ضعه في منارة البرج، فيراه كل من في القرية.' }
          ]);
          A.flag('truth', true); A.give('qindeel');
        },
        lamp: async (A, e) => {
          if (e.lit) return;
          if (!A.has('qindeel')) return A.say([{ who: 'narrator', text: A.flag('code') ? 'منارة البرج مطفأة… تحتاج قنديل الخير. سيد الظلال يحتفظ به.' : 'منارة البرج مطفأة.' }]);
          A.take('qindeel'); A.set('lamp', { lit: true }); A.flag('done', true); A.sfx('gate'); A.shake(.6); A.sparkle(21, 2, '#FFD54A'); A.weather({ dark: .08 });
          await A.say([{ who: 'narrator', text: 'اشتعل قنديل الخير في أعلى البرج… وانطلق نوره الذهبي فوق الجبال حتى وصل قرية الخير!' }]);
          A.flag('party', true);
          FRIENDS.forEach(id => { A.S.ent['foot:f_' + id] = Object.assign(A.S.ent['foot:f_' + id] || {}, { hidden: false }); });
          ['gA', 'gB'].forEach(id => { A.S.ent['foot:' + id] = Object.assign(A.S.ent['foot:' + id] || {}, { hidden: true }); });
          await A.goto('foot', 15, 10);
          for (let i = 0; i < 8; i++) setTimeout(() => { A.sparkle(4 + (i * 7) % 22, 2 + (i * 3) % 6, ['#FF7AB6', '#FFD54A', '#7CD6FF', '#7BE495'][i % 4]); A.sfx('win'); A.shake(.15); }, i * 420);
          await A.say([
            { who: 'narrator', text: 'وعند سفح القلعة، اجتمع كل أصدقاء رحلتك الطويلة حول نار المخيم!' },
            { who: 'harith', text: 'ظافر؟! يا بني… ما زلتُ أدعو لك كل ليلة. مرحباً بعودتك إلى قرية الخير.' },
            { who: 'saif', text: 'من الجزيرة المفقودة إلى القلعة المظلمة… أنت أشجع بحّار عرفته!' },
            { who: 'saeed', text: 'وسقيتَ مدرّجاتنا قبل أن تصعد القمة. أنت بطل بقلب طيب.' },
            { who: 'shaikha', text: 'والفوانيس عادت تضيء، والقنديل عاد يضيء. ما أجمل هذه الليلة!' },
            { who: 'jaber', text: 'النجوم دلّتنا في الصحراء، واليوم دلّ نورُك الجميعَ إلى البيت.' },
            { who: 'majid', text: 'وسر المدينة القديمة صار حكاية يرويها الأطفال!' },
            { who: 'ziyad', text: 'وأنا سأحكي لجدتي كل شيء!' },
            { who: 'dhafer', text: 'تعلّمتُ الليلة أن النور لا يُسرق… بل يُشارَك.' },
            { who: 'hero', text: 'شكراً لكم جميعاً. قرية الخير أجمل حين نكون معاً.' },
            { who: 'narrator', text: '🎉 أكملتَ المغامرة الكبرى… وعاد النور إلى قرية الخير إلى الأبد.' }
          ]);
          A.complete();
        }
      }
    }
  }
};

async function plank(A, e) {
  if (e.built) return;
  const order = ['br1', 'br2', 'br3'], i = order.indexOf(e.id);
  if (i > 0 && !A.ent(order[i - 1]).built) return A.toast('🪵 ابدأ من الإطار الأقرب إليك');
  if (!A.has('plank')) return A.say([{ who: 'mubarak', text: 'نحتاج لوحاً لهذا الإطار. الألواح متناثرة حول المخيم… احذر الحراس.' }]);
  A.take('plank'); A.set(e.id, { built: true }); A.setTile(e.x, e.y, '='); A.sfx('drop'); A.shake(.3); A.sparkle(e.x, e.y, '#C88A4A');
  const n = order.filter(id => A.ent(id).built).length;
  if (n < 3) return A.toast(`🪵 ثبّتَّ لوحاً (${n === 1 ? 'واحداً' : 'اثنين'} من ثلاثة)`);
  A.flag('bridge', true); A.sfx('win'); A.say([{ who: 'mubarak', text: 'اكتمل الجسر! شددتُ الألواح بالحبال. الآن أشعل شعلتك وأوقد مجمرتي البوابة.' }]);
}
async function brazier(A, e) {
  if (e.lit) return A.toast('🔥 المجمرة مشتعلة');
  if (!A.has('fire')) return A.say([{ who: 'narrator', text: A.has('torch') ? 'مجمرة باردة… أشعل شعلتك من نار المخيم أولاً.' : 'مجمرة باردة بجانب البوابة.' }]);
  A.set(e.id, { lit: true }); A.sfx('gate'); A.sparkle(e.x, e.y - 1, '#FF8A1E');
  if (!['bc1', 'bc2'].every(id => A.ent(id).lit)) return A.toast('🔥 أوقدتَ مجمرة (واحدة من اثنتين)');
  A.take('fire'); A.flag('gate', true); A.say([{ who: 'narrator', text: 'اشتعلت المجمرتان… وتراجعت الظلال عن البوابة، فانفتحت ببطء!' }]);
}
async function tab(A, e) {
  if (A.flag('code')) return A.toast('🔓 الباب مفتوح');
  A.set(e.id, { sym: ((e.sym || 0) + 1) % MEM.length }); A.sfx('click');
  if (Object.entries(SOL).every(([id, v]) => A.ent(id).sym === v)) { A.flag('code', true); A.sfx('win'); A.say([{ who: 'narrator', text: '🔥⚓🏮 أضاءت الرموز… وتذكّرتَ رحلتك كلها. تحرّك باب العرش!' }]); }
}
