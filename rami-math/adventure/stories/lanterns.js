// المغامرة: «فوانيس المهرجان» — تُفتح بعد الوحدة الخامسة (القياس، الفصل الثاني). ليلة المهرجان، والفوانيس الخمسة اختفت.
// الساحة (لغز رافعات المسرح بألوان الراية فيضيء الكشّاف ويكشف آثار الترتر اللامع)، الأزقة (حارسان ليليان وعشب للاختباء،
// صندوقان على لوحين يفتحان بوابة الحديقة)، ولقاء زياد وجدته: حوار يختار فيه الطالب كلمته، ثم تعليق الفوانيس وألعاب نارية.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const rows = g => g.map(r => r.join(''));

/* ── ساحة المهرجان ليلاً (٣٠×٢٢) ── */
const S = grid(30, 22); border(S); S[10][29] = '_';
rect(S, 1, 10, 28, 10, '_'); rect(S, 15, 7, 15, 20, '_');
pts(S, [[1, 7], [28, 7], [1, 14], [28, 14]], 'T');

/* ── الأزقة والحديقة (٣٠×٢٢) ── */
const L = grid(30, 22); border(L); L[10][0] = '_';
rect(L, 1, 6, 20, 6, '#'); L[6][10] = '.';                  // جدار الغرفة الشمالية (فتحة عند ١٠)
rect(L, 9, 14, 28, 14, '#'); L[14][20] = '.';               // جدار الجنوب (فتحة عند ٢٠)
rect(L, 21, 1, 21, 13, '#'); L[4][21] = '.';                // سور الحديقة (بوابة عند ٢١،٤)
rect(L, 5, 8, 7, 9, ';'); rect(L, 13, 11, 15, 12, ';'); rect(L, 2, 16, 5, 18, ';');
pts(L, [[24, 10], [27, 9], [23, 12], [3, 20], [14, 19]], 'T');

const SHAIKHA = { kind: 'woman', robe: '#8E3B5E', accent: '#E3B04B', skin: '#C98E5F', elder: true };
const WATCH = { kind: 'man', robe: '#2F4A6E', accent: '#E3B04B', skin: '#B97F52', beard: '#2B2B2B', hat: 'cap', vest: '#1F3355' };
const COL = { red: '#D63A3A', blue: '#2F6FD6', green: '#2E9E5B' }, ORDER = ['red', 'blue', 'green'];   // الراية تُقرأ من اليمين: أحمر ثم أزرق ثم أخضر
const POSTS = ['lp1', 'lp2', 'lp3', 'lp4', 'lp5'];

export default {
  id: 'lanterns', title: 'فوانيس المهرجان', icon: '🏮', stars: 5,
  start: { area: 'square', x: 15, y: 19 },
  items: { lantern: { icon: '🏮', name: 'فانوس المهرجان' }, sequin: { icon: '✨', name: 'ترتر لامع' } },
  cast: {
    shaikha: { name: 'الجدة شيخة', look: SHAIKHA },
    ziyad: { name: 'زياد', look: { kind: 'boy', robe: '#F7F5EF', accent: '#E2475C', skin: '#B97F52', hat: 'cap' } },
    granny: { name: 'جدة زياد', look: { kind: 'woman', robe: '#4A3A5E', accent: '#C9971C', skin: '#B97F52', elder: true } }
  },
  goals: [
    { text: 'تحدّث مع الجدة شيخة منظمة المهرجان', done: A => A.flag('met'), at: () => ({ area: 'square', id: 'shaikha' }), hint: 'الجدة شيخة قرب الطريق جنوب الساحة.' },
    { text: 'أضئ كشّاف المسرح: حرّك الرافعات بترتيب ألوان الراية (من اليمين)', done: A => A.flag('spot'), at: A => ({ area: 'square', id: ['lv_red', 'lv_blue', 'lv_green'][(A.flag('seq') || []).length] || 'lv_red' }), hint: 'الراية فوق المسرح: أحمر ثم أزرق ثم أخضر من اليمين إلى اليسار.' },
    { text: 'اتبع آثار الترتر اللامع التي كشفها الضوء (٣)', done: A => A.count('sequin') >= 3 || A.flag('alleys'), at: A => ({ area: 'square', id: ['sq1', 'sq2', 'sq3'].find(id => !(A.ent(id) || {}).got) || 'sq1' }), hint: 'الترتر يلمع على الأرض بعد إضاءة الكشّاف.' },
    { text: 'الآثار تقود إلى الأزقة شرق الساحة', done: A => A.flag('alleys'), at: () => ({ area: 'alleys', x: 1, y: 10 }), hint: 'المخرج في نهاية الطريق الشرقي.' },
    { text: 'تسلّل بين الحارسين الليليين إلى الغرفة الشمالية (العشب يخفيك)', done: A => A.flag('north') || A.flag('plates'), at: () => ({ area: 'alleys', x: 10, y: 6 }), hint: 'انتظر حتى يدير الحارس ظهره، واختبئ في العشب الطويل.' },
    { text: 'ادفع الصندوقين على اللوحين لتفتح بوابة الحديقة', done: A => A.flag('plates'), at: A => ({ area: 'alleys', id: A.pressed(A.ent('p1')) ? 'b2' : 'b1' }), hint: 'انقر على كل صندوق فيدفعه البطل إلى لوحه. اتبع الأسهم.' },
    { text: 'ادخل الحديقة وتحدّث مع الولد الذي يحمل الفوانيس', done: A => A.flag('talked'), at: () => ({ area: 'alleys', id: 'ziyad' }), hint: 'بوابة الحديقة انفتحت شرق الغرفة الشمالية.' },
    { text: 'تحدّث مع جدة زياد', done: A => A.has('lantern', 5) || A.flag('lit5'), at: () => ({ area: 'alleys', id: 'granny' }), hint: 'الجدة جالسة عند الزاوية الشمالية الشرقية من الحديقة.' },
    { text: 'عُد إلى الساحة وعلّق الفوانيس الخمسة على أعمدتها', done: A => A.flag('lit5'), at: A => ({ area: 'square', id: POSTS.find(id => !(A.ent(id) || {}).lit) || 'lp1' }), hint: 'الأعمدة الخمسة في زوايا الساحة ووسطها. الماسة الذهبية فوق التالي.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'الليلة ليلة مهرجان قرية الخير… الطبول جاهزة، والحلوى، والأطفال يركضون فرحاً.' },
    { who: 'narrator', text: 'لكن حين حان وقت إضاءة الساحة… كانت الفوانيس الخمسة الكبيرة قد اختفت!' },
    { who: 'hero', text: 'من أخذها؟ ولماذا؟ يجب أن أكتشف ذلك قبل أن يحزن الجميع.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 35; s.decor = s.decor || {}; s.decor.festlamp = s.decor.festlamp || Date.now(); },
  rewards: ['💎 ٣٥ جوهرة', '🏮 فانوس المهرجان الكبير في ساحة القرية', '🏅 وسام «حارس النور»'],
  areas: {
    square: {
      theme: 'village', map: rows(S), dark: .6,
      ents: [
        { id: 'shaikha', kind: 'npc', who: 'shaikha', x: 13, y: 18, face: 'right', mark: A => A.flag('met') ? null : A.has('lantern') && !A.flag('lit5') ? '!' : null },
        { id: 'safeS', kind: 'safe', x: 17, y: 17 },
        { id: 'stage', kind: 'house', x: 12, y: 3, w: 6, h: 2, roof: '#B0243C', face: '#8E1F33', noDoor: true },
        { id: 'banner', kind: 'banner', x: 15, y: 5, colors: [COL.green, COL.blue, COL.red] },
        { id: 'lv_red', kind: 'lever', x: 17, y: 6, color: COL.red, c: 'red' }, { id: 'lv_blue', kind: 'lever', x: 13, y: 6, color: COL.blue, c: 'blue' }, { id: 'lv_green', kind: 'lever', x: 11, y: 6, color: COL.green, c: 'green' },
        { id: 'sgL', kind: 'sign', x: 19, y: 6, text: 'رافعات كشّاف المسرح: حرّكها بترتيب ألوان الراية، من اليمين إلى اليسار.' },
        { id: 'spot', kind: 'fire', x: 15, y: 8, lit: false },
        ...[['lp1', 4, 4], ['lp2', 25, 4], ['lp3', 4, 17], ['lp4', 25, 17], ['lp5', 15, 13]].map(([id, x, y]) => ({ id, kind: 'beacon', x, y })),
        { id: 'k1', kind: 'tent', x: 6, y: 8, color: '#2E6B4A' }, { id: 'k2', kind: 'tent', x: 23, y: 8, color: '#3E2A4E' }, { id: 'k3', kind: 'tent', x: 8, y: 15, color: '#8E3B3B' }, { id: 'k4', kind: 'tent', x: 21, y: 15, color: '#1F4E79' },
        { id: 'cr1', kind: 'crates', x: 10, y: 12 }, { id: 'cr2', kind: 'barrel', x: 19, y: 12 },
        { id: 'sq1', kind: 'item', x: 9, y: 9, item: 'sequin', hidden: true, light: 1.2 }, { id: 'sq2', kind: 'item', x: 21, y: 11, item: 'sequin', hidden: true, light: 1.2 }, { id: 'sq3', kind: 'item', x: 26, y: 9, item: 'sequin', hidden: true, light: 1.2, after: A => A.say([{ who: 'hero', text: 'الترتر يقود إلى الأزقة! الآثار صغيرة… كأنها لطفل.' }]) },
        { id: 'toAlleys', kind: 'exit', x: 29, y: 10, to: 'alleys', tx: 1, ty: 10, when: A => A.count('sequin') >= 3 || A.flag('alleys'), locked: 'إلى أين أذهب في الظلام؟ لعل الكشّاف يكشف آثار اللص.' },
        { id: 's1', kind: 'star', x: 2, y: 2 }, { id: 's2', kind: 'star', x: 27, y: 20 }
      ],
      onLever: (A, e) => {
        if (A.flag('spot') || !e.on) return; const seq = (A.flag('seq') || []).concat([e.c]);
        if (ORDER.slice(0, seq.length).join() !== seq.join()) { A.sfx('cough'); A.toast('🔄 ترتيب مختلف… اقرأ الراية من اليمين إلى اليسار.'); setTimeout(() => { ['lv_red', 'lv_blue', 'lv_green'].forEach(id => A.set(id, { on: false })); A.flag('seq', []); }, 600); return; }
        A.flag('seq', seq);
        if (seq.length === 3) { A.flag('spot', true); A.set('spot', { lit: true, light: 4 }); ['sq1', 'sq2', 'sq3'].forEach(id => A.show(id)); A.sfx('win'); A.say([{ who: 'narrator', text: 'أضاء كشّاف المسرح الساحة… وعلى الأرض بريق صغير: ترتر لامع سقط من ثوب أحدهم!' }]); }
      },
      on: {
        shaikha: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'shaikha', text: 'يا بطل! نظّمت هذا المهرجان أربعين سنة، ولم يحدث هذا قط. الفوانيس الخمسة اختفت!' },
              { who: 'shaikha', text: 'من دونها تبقى الساحة مظلمة، ولا تبدأ الألعاب النارية.' },
              { who: 'shaikha', text: 'كشّاف المسرح يضيء الساحة كلها. رافعاته ثلاث، وترتيبها مكتوب بألوان الراية فوق المسرح.' }
            ]); A.flag('met', true); return;
          }
          if (A.has('lantern') && !A.flag('lit5')) return A.say([{ who: 'shaikha', text: 'أعدت الفوانيس! علّقها على الأعمدة الخمسة يا بطل.' }]);
          A.say([{ who: 'shaikha', text: ((A.goal() || {}).hint || 'بالتوفيق!') }]);
        },
        lp1: (A, e) => post(A, e), lp2: (A, e) => post(A, e), lp3: (A, e) => post(A, e), lp4: (A, e) => post(A, e), lp5: (A, e) => post(A, e)
      }
    },
    alleys: {
      theme: 'village', map: rows(L), dark: .66,
      enter: A => { if (!A.flag('alleys')) { A.flag('alleys', true); A.say([{ who: 'narrator', text: 'أزقة ضيقة خلف الساحة، وحارسان ليليان يحملان فانوسين… وهما يبحثان عن اللص أيضاً!' }, { who: 'hero', text: 'إن رأياني في الظلام ظنّاني اللص. سأتسلل بهدوء وأختبئ في العشب.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 10, to: 'square', tx: 28, ty: 10 },
        { id: 'safeA', kind: 'safe', x: 2, y: 10 }, { id: 'safeA2', kind: 'safe', x: 11, y: 3 },
        { id: 'w1', kind: 'guard', look: WATCH, path: [[4, 11], [18, 11]], speed: 1.1, range: 3.2, wait: 1.3, caughtMsg: '🔦 «من هناك؟» رآك الحارس! تعود بهدوء إلى آخر مكان آمن… واختبئ في العشب.' },
        { id: 'w2', kind: 'guard', look: WATCH, path: [[12, 7], [12, 13]], speed: .9, range: 3, wait: 1.5, caughtMsg: '🔦 «من هناك؟» رآك الحارس! تعود بهدوء إلى آخر مكان آمن… واختبئ في العشب.' },
        { id: 'tNorth', kind: 'trigger', x: 10, y: 5, run: A => { A.flag('north', true); A.checkpoint(10, 5); A.toast('🤫 وصلتَ إلى الغرفة الشمالية دون أن يراك أحد!'); } },
        { id: 'p1', kind: 'plate', x: 6, y: 2 }, { id: 'p2', kind: 'plate', x: 14, y: 2 },
        { id: 'b1', kind: 'block', x: 4, y: 3, to: 'p1' }, { id: 'b2', kind: 'block', x: 16, y: 4, to: 'p2' },
        { id: 'gGate', kind: 'gate', x: 21, y: 4, when: A => { const ok = A.pressed(A.ent('p1')) && A.pressed(A.ent('p2')); if (ok) A.flag('plates', true); return ok; }, openMsg: '🔓 انفتحت بوابة الحديقة!' },
        { id: 'house', kind: 'house', x: 24, y: 2, w: 4, h: 2, roof: '#E2D4B4' },
        { id: 'ziyad', kind: 'npc', who: 'ziyad', x: 25, y: 6, face: 'left', mark: A => A.flag('talked') ? null : '!' },
        { id: 'granny', kind: 'npc', who: 'granny', x: 27, y: 4, face: 'down', mark: A => A.flag('talked') && !A.has('lantern') && !A.flag('lit5') ? '!' : null },
        { id: 'lamps', kind: 'crates', x: 23, y: 7 },
        { id: 's3', kind: 'star', x: 1, y: 1 }, { id: 's4', kind: 'star', x: 27, y: 19 }, { id: 's5', kind: 'star', x: 28, y: 12 }
      ],
      on: {
        ziyad: async A => {
          if (A.flag('talked')) return A.say([{ who: 'ziyad', text: 'جدتي تريد أن تكلمك.' }]);
          await A.say([{ who: 'narrator', text: 'ولد صغير يجلس بين خمسة فوانيس كبيرة، وعلى ثوبه ترتر لامع… إنه زياد!' }]);
          for (;;) {
            const k = await A.choose('ماذا تقول لزياد؟', ['«أنت اللص! أعِد الفوانيس فوراً!»', '«لماذا أخذت الفوانيس يا زياد؟»'], 'hero');
            if (k === 1) break;
            await A.say([{ who: 'ziyad', text: '(يخفض رأسه حزيناً ولا يقول شيئاً…)' }, { who: 'narrator', text: 'ربما يحتاج زياد من يسمعه أولاً. جرّب أن تسأله بلطف.' }]);
          }
          await A.say([
            { who: 'ziyad', text: 'جدتي مريضة ولا تستطيع الذهاب إلى المهرجان… وهي تحب أضواءه كثيراً.' },
            { who: 'ziyad', text: 'أردت أن أجلب لها المهرجان إلى حديقتها. لم أفكر أن الساحة ستبقى مظلمة… آسف.' },
            { who: 'hero', text: 'نيّتك طيبة يا زياد. لنتحدث مع جدتك، وسنجد حلاً يفرح الجميع.' }
          ]);
          A.flag('talked', true);
        },
        granny: async A => {
          if (!A.flag('talked')) return A.say([{ who: 'granny', text: 'أهلاً يا بني… زياد هناك، كلّمه.' }]);
          if (A.has('lantern') || A.flag('lit5')) return A.say([{ who: 'granny', text: 'سأرى الألعاب النارية من هنا، فوق السطح. اذهب يا بني!' }]);
          await A.say([
            { who: 'granny', text: 'زياد ولد طيب، لكن الفوانيس للجميع. أعِدها إلى الساحة يا بني.' },
            { who: 'granny', text: 'ومن سطح بيتي أرى الساحة كلها، فأشاهد الألعاب النارية مع زياد. هذا يكفيني.' },
            { who: 'ziyad', text: 'سأساعدك! خذ الفوانيس الخمسة، وسأحمل أنا الصغير لجدتي.' }
          ]);
          A.give('lantern', 5); A.sparkle(23, 7, '#FFB060');
        }
      }
    }
  }
};

async function post(A, e) {
  if (e.lit) return;
  if (!A.has('lantern')) return A.say([{ who: 'narrator', text: 'عمود فانوس فارغ. الفوانيس الخمسة اختفت…' }]);
  A.take('lantern'); A.set(e.id, { lit: true }); A.sfx('gate'); A.sparkle(e.x, e.y - 1, '#FFB060');
  const n = POSTS.filter(id => A.ent(id).lit).length;
  if (n < 5) return A.toast(`🏮 علّقتَ فانوساً (${['', 'واحداً', 'اثنين', 'ثلاثة', 'أربعة'][n]} من خمسة)`);
  A.flag('lit5', true); A.weather({ dark: .25 });
  for (let i = 0; i < 6; i++) setTimeout(() => { A.sparkle(4 + (i * 9) % 22, 3 + (i * 5) % 14, ['#FF7AB6', '#FFD54A', '#7CD6FF', '#7BE495'][i % 4]); A.sfx('win'); A.shake(.2); }, i * 450);
  await A.say([
    { who: 'narrator', text: 'أضاءت الفوانيس الخمسة… وانطلقت الألعاب النارية فوق قرية الخير!' },
    { who: 'shaikha', text: 'أجمل مهرجان رأيته! وعلى السطح هناك… زياد وجدته يصفقان.' },
    { who: 'hero', text: 'المهرجان أجمل حين يفرح الجميع.' }
  ]);
  A.complete();
}
