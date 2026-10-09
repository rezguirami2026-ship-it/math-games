// المغامرة: «الفنار والضباب» — تُفتح بعد الوحدة السادسة (معالجة البيانات). ضباب كثيف يغطي الميناء، وثلاثة مراكب صيد تائهة.
// الرصيف (الحارس راشد ومفتاح الفنار، جرار زيت بين السرطانات، عدستان: واحدة في صندوق وأخرى خلف بوابة تفتحها الصناديق على اللوحين)،
// وغرفة المصباح أعلى الفنار (إشعال المصباح ثم توجيه شعاعه إلى نوافذ المراكب الثلاث، واحدة منها بمرآة). ثم عودة المراكب.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const rows = g => g.map(r => r.join(''));

/* ── الرصيف في الضباب (٣٠×٢٢) ── */
const P = grid(30, 22); border(P);
rect(P, 24, 1, 28, 20, '~'); rect(P, 1, 10, 23, 10, '_'); rect(P, 24, 10, 26, 10, '=');
rect(P, 8, 14, 12, 14, '#'); rect(P, 8, 14, 8, 19, '#'); rect(P, 12, 14, 12, 19, '#'); rect(P, 8, 19, 12, 19, '#'); P[14][10] = '.';   // مخزن العدسة (بوابة عند ١٠،١٤)
pts(P, [[1, 3], [6, 1], [20, 1], [1, 15], [16, 20], [22, 20]], 'T');

/* ── غرفة المصباح أعلى الفنار (٢٢×١٦) ── */
const T = grid(22, 16, 'c'); border(T); T[15][11] = '_';

const SAIF = { kind: 'man', robe: '#F4F1E8', accent: '#1F4E79', skin: '#B97F52', beard: '#5A5A5A', hat: 'cap', build: 1.08 };
const DIRS = ['يمين', 'أسفل', 'يسار', 'أعلى'];
export default {
  id: 'lighthouse', title: 'الفنار والضباب', icon: '🗼', stars: 5,
  start: { area: 'pier', x: 4, y: 10 },
  items: { key: { icon: '🗝️', name: 'مفتاح الفنار' }, oil: { icon: '🛢️', name: 'جرّة زيت' }, lens: { icon: '🔍', name: 'قطعة عدسة' } },
  cast: {
    saif: { name: 'القبطان سيف', look: SAIF },
    rashid: { name: 'راشد حارس الفنار', look: { kind: 'man', robe: '#DCE6F0', accent: '#2F6FB2', skin: '#C98E5F', beard: '#BBBBBB', elder: true, tool: 'cane' } },
    noura: { name: 'نورة', look: { kind: 'woman', robe: '#3E7C6B', accent: '#E3B04B', skin: '#D9A374' } }
  },
  goals: [
    { text: 'تحدّث مع القبطان سيف على الرصيف', done: A => A.flag('met'), at: () => ({ area: 'pier', id: 'saif' }), hint: 'القبطان قرب نهاية الرصيف عند الماء.' },
    { text: 'ابحث عن راشد حارس الفنار في كوخه', done: A => A.has('key') || A.flag('tower'), at: () => ({ area: 'pier', id: 'rashid' }), hint: 'كوخ الحارس غرب الرصيف.' },
    { text: 'اجمع ٣ جرار زيت للمصباح (احذر السرطانات)', done: A => A.count('oil') >= 3 || A.flag('lampOn'), at: A => ({ area: 'pier', id: ['o1', 'o2', 'o3'].find(id => !(A.ent(id) || {}).got) || 'o1' }), hint: 'الجرار متناثرة على الرصيف. امشِ حين يبتعد السرطان.' },
    { text: 'خذ العدسة الأولى من صندوق القوارب', done: A => A.count('lens') >= 1 || A.flag('lampOn'), at: () => ({ area: 'pier', id: 'c_lens1' }), hint: 'الصندوق في الزاوية الجنوبية الغربية.' },
    { text: 'ادفع الصندوقين على اللوحين لتفتح مخزن العدسة الثانية', done: A => A.flag('plates'), at: A => ({ area: 'pier', id: A.pressed(A.ent('p1')) ? 'b2' : 'b1' }), hint: 'انقر على كل صندوق فيدفعه البطل إلى لوحه. اتبع الأسهم.' },
    { text: 'خذ العدسة الثانية من المخزن', done: A => A.count('lens') >= 2 || A.flag('lampOn'), at: () => ({ area: 'pier', id: 'c_lens2' }), hint: 'البوابة انفتحت، والصندوق داخل المخزن.' },
    { text: 'افتح باب الفنار واصعد إلى غرفة المصباح', done: A => A.flag('tower'), at: () => ({ area: 'tower', x: 11, y: 14 }), hint: 'باب الفنار الأحمر شمال الرصيف. انقر عليه والمفتاح معك.' },
    { text: 'أشعل المصباح الكبير بالزيت والعدستين', done: A => A.flag('lampOn'), at: () => ({ area: 'tower', id: 'lamp' }), hint: 'المصباح في وسط الغرفة. انقر عليه.' },
    { text: 'أدر المصباح والمرآة ليصل الشعاع إلى نوافذ المراكب الثلاثة', done: A => ['b1', 'b2', 'b3'].every(b => A.flag(b)), at: A => ({ area: 'tower', id: !A.flag('b1') || !A.flag('b2') ? 'lamp' : (A.ent('mw') || {}).r % 2 ? 'lamp' : 'mw' }), hint: 'انقر على المصباح ليدور شعاعه ربع دورة. كل نافذة زرقاء تضيء ترشد مركباً. النافذة الثالثة تحتاج المرآة.' },
    { text: 'انزل إلى الرصيف واستقبل المراكب مع القبطان سيف', done: A => A.flag('home'), at: () => ({ area: 'pier', id: 'saif' }), hint: 'القبطان ينتظرك على الرصيف.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'مساءٌ في ميناء قرية الخير… ونزل ضباب أبيض كثيف لم يره أحد من قبل.' },
    { who: 'narrator', text: 'ثلاثة مراكب صيد لم تعد بعد، ومصباح الفنار القديم مطفأ منذ الصباح!' },
    { who: 'hero', text: 'من دون نور الفنار لن يجد الصيادون طريقهم إلى البر.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 35; s.decor = s.decor || {}; s.decor.minilight = s.decor.minilight || Date.now(); },
  rewards: ['💎 ٣٥ جوهرة', '🗼 فنار صغير في ساحة القرية', '🏅 وسام «منقذ البحّارة»'],
  areas: {
    pier: {
      theme: 'island', map: rows(P), dark: .45, fog: true, fogUntil: A => A.flag('home'),
      ents: [
        { id: 'saif', kind: 'npc', who: 'saif', x: 22, y: 11, face: 'right', mark: A => !A.flag('met') || (['b1', 'b2', 'b3'].every(b => A.flag(b)) && !A.flag('home')) ? '!' : null },
        { id: 'noura', kind: 'npc', who: 'noura', x: 19, y: 11, face: 'right' },
        { id: 'safe1', kind: 'safe', x: 3, y: 11 }, { id: 'safe2', kind: 'safe', x: 17, y: 8 },
        { id: 'lh', kind: 'house', x: 12, y: 3, w: 5, h: 3, roof: '#F2F2F2', face: '#D63A3A', noDoor: true },
        { id: 'ldoor', kind: 'door', x: 14, y: 4, needs: 'key', name: 'باب الفنار', locked: 'باب الفنار مقفل بقفل كبير. المفتاح مع الحارس راشد.' },
        { id: 'hut', kind: 'house', x: 2, y: 5, w: 3, h: 2, roof: '#C9A27A', face: '#9C7A54' },
        { id: 'rashid', kind: 'npc', who: 'rashid', x: 5, y: 7, face: 'right', mark: A => A.flag('met') && !A.has('key') && !A.flag('tower') ? '!' : null },
        { id: 'o1', kind: 'item', x: 7, y: 8, item: 'oil' }, { id: 'o2', kind: 'item', x: 21, y: 17, item: 'oil' }, { id: 'o3', kind: 'item', x: 20, y: 4, item: 'oil' },
        { id: 'cb1', kind: 'hazard', creature: 'crab', path: [[17, 16], [23, 16]], speed: 1.2, r: .55, caughtMsg: '🦀 قرصك السرطان في الضباب! تعود إلى آخر مكان آمن.' },
        { id: 'cb2', kind: 'hazard', creature: 'crab', path: [[18, 4], [23, 4]], speed: 1, r: .55, caughtMsg: '🦀 قرصك السرطان في الضباب! تعود إلى آخر مكان آمن.' },
        { id: 'c_lens1', kind: 'chest', x: 2, y: 19, item: 'lens' },
        { id: 'p1', kind: 'plate', x: 5, y: 12 }, { id: 'p2', kind: 'plate', x: 15, y: 13 },
        { id: 'b1', kind: 'block', x: 3, y: 13, to: 'p1' }, { id: 'b2', kind: 'block', x: 17, y: 15, to: 'p2' },
        { id: 'sgate', kind: 'gate', x: 10, y: 14, when: A => { const ok = A.pressed(A.ent('p1')) && A.pressed(A.ent('p2')); if (ok) A.flag('plates', true); return ok; }, openMsg: '🔓 انفتحت بوابة المخزن!' },
        { id: 'c_lens2', kind: 'chest', x: 10, y: 17, item: 'lens' },
        { id: 'boat1', kind: 'boat', x: 25, y: 6, hidden: true }, { id: 'boat2', kind: 'boat', x: 26, y: 13, hidden: true }, { id: 'boat3', kind: 'boat', x: 25, y: 17, hidden: true },
        { id: 's1', kind: 'star', x: 1, y: 1 }, { id: 's2', kind: 'star', x: 22, y: 19 }, { id: 's3', kind: 'star', x: 11, y: 18 }
      ],
      enter: A => { ['b1', 'b2', 'b3'].forEach((b, i) => { if (A.flag(b)) A.show('boat' + (i + 1)); }); },
      on: {
        saif: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'saif', text: 'يا بطل! ثلاثة مراكب في البحر، وفيها أزواج نساء القرية وأبناؤهن. الضباب يخفي كل شيء!' },
              { who: 'noura', text: 'زوجي على المركب الأزرق… أرجوك ساعدنا.' },
              { who: 'saif', text: 'لو أضاء الفنار لعرفوا الطريق. حارسه راشد في كوخه غرب الرصيف، اذهب إليه.' }
            ]); A.flag('met', true); return;
          }
          if (['b1', 'b2', 'b3'].every(b => A.flag(b)) && !A.flag('home')) {
            A.flag('home', true); ['boat1', 'boat2', 'boat3'].forEach(b => A.show(b)); A.sfx('win'); A.weather({ dark: .15 });
            for (let i = 0; i < 4; i++) setTimeout(() => A.sparkle(24 + (i % 2), 6 + i * 4, ['#FFD54A', '#7CD6FF'][i % 2]), i * 400);
            await A.say([
              { who: 'narrator', text: 'من بين الضباب ظهرت الأضواء الثلاثة… ورست المراكب على الرصيف واحداً بعد الآخر!' },
              { who: 'noura', text: 'عاد! عاد زوجي سالماً! جزاك الله خيراً يا بطل.' },
              { who: 'saif', text: 'منذ اليوم، كلما أضاء الفنار سنتذكر من أشعله في أصعب ليلة.' }
            ]);
            return A.complete();
          }
          A.say([{ who: 'saif', text: 'أسرع يا بطل! ' + ((A.goal() || {}).hint || '') }]);
        },
        ldoor: async (A, e) => {   // الباب نفسه مدخل الفنار: يُفتح بالمفتاح ثم يصعد البطل
          if (!e.open) { if (!A.has('key')) return A.say([{ who: 'narrator', text: e.locked }]); A.set('ldoor', { open: true }); A.sfx('gate'); A.toast('🔓 فُتح باب الفنار'); }
          await A.goto('tower', 11, 14);
        },
        noura: A => A.say([{ who: 'noura', text: A.flag('b1') || A.flag('b2') || A.flag('b3') ? 'أرى ضوءاً في البحر! استمر!' : 'المركب الأزرق… أرجوك.' }]),
        rashid: async A => {
          if (A.has('key') || A.flag('tower')) return A.say([{ who: 'rashid', text: 'المصباح يحتاج الزيت والعدستين. توكّل على الله!' }]);
          if (!A.flag('met')) return A.say([{ who: 'rashid', text: 'آه… رجلي. تحدّث مع القبطان سيف أولاً يا بني.' }]);
          await A.say([
            { who: 'rashid', text: 'سقطتُ على درج الفنار هذا الصباح، ورجلي لا تحملني.' },
            { who: 'rashid', text: 'خذ المفتاح. المصباح يحتاج ٣ جرار زيت، وعدستين: واحدة في صندوق القوارب، والأخرى في المخزن الصغير.' },
            { who: 'rashid', text: 'وبوابة المخزن تفتحها الصناديق الثقيلة على اللوحين. وفي أعلى الفنار، وجّه الشعاع إلى النوافذ الزرقاء، فلكل مركب نافذة.' }
          ]);
          A.give('key');
        }
      }
    },
    tower: {
      theme: 'cave', map: rows(T), dark: .72,
      enter: A => { if (!A.flag('tower')) { A.flag('tower', true); A.say([{ who: 'narrator', text: 'غرفة المصباح في أعلى الفنار: مصباح نحاسي كبير في الوسط، وثلاث نوافذ زرقاء تطل على البحر.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 11, y: 15, to: 'pier', tx: 14, ty: 5 },
        { id: 'safeT', kind: 'safe', x: 13, y: 14 },
        { id: 'lamp', kind: 'beam', x: 11, y: 8, dir: 0, when: A => A.flag('lampOn'), light: 1.5 },
        { id: 'mw', kind: 'rot', style: 'mirror', x: 6, y: 8, r: 0 },
        { id: 'w1', kind: 'crystal', x: 18, y: 8 }, { id: 'w2', kind: 'crystal', x: 11, y: 12 }, { id: 'w3', kind: 'crystal', x: 6, y: 3 },
        { id: 'sgW', kind: 'sign', x: 15, y: 13, text: 'لوح الحارس: «انقر على المصباح ليدور شعاعه. كل نافذة زرقاء تضيء ترشد مركباً، والنافذة الغربية العالية تحتاج المرآة».' },
        { id: 's4', kind: 'star', x: 2, y: 2 }, { id: 's5', kind: 'star', x: 19, y: 13 }
      ],
      tick: A => { [['w1', 'b1'], ['w2', 'b2'], ['w3', 'b3']].forEach(([w, b], i) => { const c = A.ent(w); if (c && c.lit && !A.flag(b)) { A.flag(b, true); A.sfx('win'); A.toast(`⛵ أضاءت النافذة! المركب ${['الأول', 'الثاني', 'الثالث'][i]} يرى الطريق`); } }); },
      on: {
        lamp: async (A, e) => {
          if (!A.flag('lampOn')) {
            if (A.count('oil') < 3 || A.count('lens') < 2) return A.say([{ who: 'narrator', text: `المصباح يحتاج ٣ جرار زيت (معك ${A.count('oil')}) وعدستين (معك ${A.count('lens')}).` }]);
            A.take('oil', 3); A.take('lens', 2); A.flag('lampOn', true); A.sfx('gate'); A.shake(.4); A.sparkle(11, 8, '#FFD54A');
            return A.say([{ who: 'narrator', text: 'اشتعل المصباح الكبير، وانطلق شعاعه الذهبي! انقر عليه لتديره نحو النوافذ.' }]);
          }
          const dir = ((e.dir || 0) + 1) % 4; A.set('lamp', { dir }); A.sfx('click'); A.toast(`🔦 الشعاع نحو ${DIRS[dir]}`);
        }
      }
    }
  }
};
