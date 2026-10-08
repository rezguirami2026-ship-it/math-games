// المغامرة ١: «إنقاذ القرية» — تُفتح بعد الوحدة الأولى. ليلة هاجمت فيها «عصابة الظلال» قرية الخير وخطفت أربعة من أهلها.
// بلا رياضيات: استكشاف، أدوات (فانوس، منجل، مفاتيح، شعلة)، تسلّل بين الحراس، لغز صناديق، لغز رافعات بالألوان، وإيقاد المنارات.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const flowers = g => g.forEach((r, y) => r.forEach((c, x) => { if (c === '.' && (x * 7 + y * 13) % 11 === 0) r[x] = ','; }));
const rows = g => g.map(r => r.join(''));

/* ── خريطة القرية ليلاً (٣٢×٢٤) ── */
const V = grid(32, 24); border(V); flowers(V);
rect(V, 1, 11, 31, 11, '_'); rect(V, 16, 1, 16, 22, '_'); rect(V, 4, 5, 4, 10, '_'); rect(V, 25, 5, 25, 10, '_');
pts(V, [[1, 1], [2, 1], [1, 2], [30, 1], [30, 2], [29, 1], [13, 8], [19, 8], [13, 14], [19, 14], [1, 22], [10, 21], [21, 21], [2, 12], [2, 13], [2, 14], [7, 8], [22, 8]], 'T');
rect(V, 1, 18, 7, 22, ','); rect(V, 1, 17, 8, 17, '"'); rect(V, 8, 17, 8, 22, '"');
rect(V, 18, 15, 22, 18, '~');
pts(V, [[29, 6], [30, 6], [29, 8], [30, 8]], '#'); V[7][29] = 'R'; V[7][30] = '.';
rect(V, 10, 6, 12, 7, ';');

/* ── خريطة معسكر عصابة الظلال (٢٨×٢٠) ── */
const C = grid(28, 20); border(C, 'T'); flowers(C);
pts(C, [[0, 0], [27, 0], [0, 19], [27, 19]], '#'); C[10][0] = '_';
rect(C, 1, 10, 9, 10, '_');
rect(C, 4, 5, 6, 8, ';'); rect(C, 10, 11, 12, 14, ';'); rect(C, 14, 4, 15, 6, ';'); rect(C, 19, 9, 20, 11, ';'); rect(C, 24, 1, 26, 2, ';');

const villager = (who, x, y, extra = {}) => ({ id: who, kind: 'npc', who, x, y, ...extra });
const BANDIT = { kind: 'man', robe: '#2E2A36', accent: '#7A1F2B', skin: '#B97F52', beard: '#2B2B2B', hat: 'cap', vest: '#3A3A44', build: 1.12 };
const ORDER = ['blue', 'red', 'green'], COL = { blue: '#2F6FD6', red: '#D63A3A', green: '#2E9E5B' };

export default {
  id: 'rescue', title: 'إنقاذ القرية', icon: '🏘️', stars: 5,
  blurb: 'هاجمت «عصابة الظلال» القرية ليلاً وخطفت أربعة من أهلها. استكشف، تسلّل، وأنقذهم قبل الفجر!',
  start: { area: 'village', x: 4, y: 6 },
  items: { lantern: { icon: '🏮', name: 'الفانوس' }, sickle: { icon: '🌾', name: 'المنجل' }, keys: { icon: '🗝️', name: 'حلقة مفاتيح العصابة' }, hammer: { icon: '🔨', name: 'المطرقة' }, torch: { icon: '🪵', name: 'شعلة غير مشتعلة' }, fire: { icon: '🔥', name: 'الشعلة المشتعلة' } },
  cast: {
    harith: { name: 'الشيخ الحارث', look: { kind: 'man', robe: '#E3D8C2', accent: '#5E6B78', skin: '#8B5A38', beard: '#D8D8D8', tool: 'cane', elder: true } },
    salem: { name: 'العم سالم', look: { kind: 'man', robe: '#F4F1E8', accent: '#2F6FB2', skin: '#C98E5F', beard: '#6B6B6B', vest: '#F28C28', build: 1.12 } },
    naser: { name: 'العم ناصر', look: { kind: 'man', robe: '#EFE6D2', accent: '#2E8B57', skin: '#C98E5F', beard: '#4A4A4A', apron: '#3F6E5A', glasses: true, build: 1.2 } },
    yousef: { name: 'يوسف', look: { kind: 'boy', robe: '#F7F5EF', accent: '#C0392B', skin: '#B97F52', hat: 'cap' } },
    maryam: { name: 'الجدة مريم', look: { kind: 'woman', robe: '#5E3B6E', accent: '#E3B04B', skin: '#C98E5F', elder: true } },
    bandit: { name: 'حارس العصابة', look: BANDIT }
  },
  goals: [
    { text: 'تحدّث مع الشيخ الحارث عند البئر', done: A => A.flag('met'), hint: 'البئر في وسط القرية. اتبع الطريق الترابي.' },
    { text: 'خذ الفانوس من الصندوق بجانب بيتك', done: A => A.has('lantern'), hint: 'الصندوق عند الزاوية الغربية لبيتك، في أعلى يسار القرية.' },
    { text: 'أنقذ العم سالم من المزرعة المسيّجة بالشوك', done: A => A.flag('salem'), hint: 'الشوك لا يُقص باليد. في صندوق الأدوات بجانب السقيفة منجل.' },
    { text: 'تسلّل إلى معسكر العصابة شرق القرية وحرّر يوسف', done: A => A.flag('yousef'), hint: 'القفص يُفتح حين يضغط شيء ثقيل على اللوحتين. ادفع الصناديق!' },
    { text: 'احصل على حلقة المفاتيح من صندوق خيمة الزعيم', done: A => A.has('keys') || A.flag('naser'), hint: 'اختبئ في العشب الطويل حين يقترب الحارس، وراقب مخروط نظره.' },
    { text: 'افتح المخزن وأنقذ العم ناصر', done: A => A.flag('naser'), hint: 'المخزن الكبير شمال شرق القرية. المفاتيح معك الآن.' },
    { text: 'افتح بوابة البرج القديم وأنقذ الجدة مريم', done: A => A.flag('maryam'), hint: 'الراية على البرج تخبرك بترتيب الرافعات. اقرأ ألوانها من اليمين إلى اليسار.' },
    { text: 'أشعل الشعلة من نار الساحة، ثم أوقد المنارات الثلاث', done: A => (A.flag('lit') || 0) >= 3, hint: 'المنارات في زوايا القرية: شمال غرب، وشمال شرق، وجنوبها قرب الطريق.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'منتصف الليل في قرية الخير… صوت عربات وصراخ، ثم سكون غريب.' },
    { who: 'narrator', text: 'تخرج من بيتك فتجد الفوانيس مطفأة، والأبواب مفتوحة. عصابة الظلال مرّت من هنا!' },
    { who: 'hero', text: 'يجب أن أعرف ما حدث. الشيخ الحارث يسهر دائماً عند البئر.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 30; s.gear = s.gear || { owned: {}, worn: {} }; s.gear.owned.cape = s.gear.owned.cape || Date.now(); s.decor = s.decor || {}; s.decor.statue = s.decor.statue || Date.now(); },
  rewards: ['💎 ٣٠ جوهرة', '🦸 وشاح حامي القرية — ارتدِه من خزانة البطل', '🗿 تمثال حامي القرية في ساحة البئر', '🏅 وسام «حامي القرية»'],
  areas: {
    village: {
      theme: 'village', map: rows(V),
      ents: [
        { id: 'home', kind: 'house', x: 3, y: 4, w: 3, h: 2 }, { id: 'shed', kind: 'house', x: 9, y: 16, w: 2, h: 2, roof: '#C9A27A', face: '#B48B5E' },
        { id: 'ware', kind: 'house', x: 24, y: 4, w: 4, h: 2, roof: '#E2D4B4', face: '#C9B48E', noDoor: true }, { id: 'wdoor', kind: 'door', x: 25, y: 4, needs: 'keys', name: 'باب المخزن', locked: 'باب المخزن مقفل بقفل العصابة الكبير. لعل المفاتيح في معسكرهم…' },
        { id: 'tower', kind: 'house', x: 27, y: 19, w: 3, h: 3, roof: '#B8AE98', face: '#9C9280', noDoor: true }, { id: 'gtower', kind: 'gate', x: 28, y: 19, when: A => A.flag('tower_open'), openMsg: '🔓 انفتحت بوابة البرج!' },
        { id: 'banner', kind: 'banner', x: 26, y: 17, colors: [COL.green, COL.red, COL.blue] },
        { id: 'lv_blue', kind: 'lever', x: 24, y: 21, color: COL.blue, c: 'blue' }, { id: 'lv_red', kind: 'lever', x: 25, y: 21, color: COL.red, c: 'red' }, { id: 'lv_green', kind: 'lever', x: 26, y: 21, color: COL.green, c: 'green' },
        { id: 'well', kind: 'well', x: 16, y: 10 }, { id: 'square', kind: 'safe', x: 17, y: 12 },
        { id: 'c_home', kind: 'chest', x: 2, y: 5, item: 'lantern' }, { id: 'c_shed', kind: 'chest', x: 9, y: 17, item: 'sickle' },
        { id: 'harith', kind: 'npc', who: 'harith', x: 14, y: 11, face: 'right', mark: A => A.flag('met') ? null : '!' },
        villager('salem', 4, 20, { face: 'up', mark: A => A.flag('salem') ? null : '!' }),
        villager('naser', 25, 6, { hidden: true, face: 'down' }), villager('maryam', 28, 20, { hidden: true, face: 'down' }),
        villager('v_salem', 13, 12, { who: 'salem', hidden: true, face: 'right' }), villager('v_naser', 15, 13, { who: 'naser', hidden: true, face: 'up' }),
        villager('v_yousef', 18, 13, { who: 'yousef', hidden: true, face: 'up' }), villager('v_maryam', 19, 12, { who: 'maryam', hidden: true, face: 'left' }),
        { id: 'bc1', kind: 'beacon', x: 3, y: 2 }, { id: 'bc2', kind: 'beacon', x: 27, y: 2 }, { id: 'bc3', kind: 'beacon', x: 13, y: 21 },
        { id: 'sign1', kind: 'sign', x: 30, y: 10, text: '← معسكر عصابة الظلال. الطريق مظلم جداً بلا فانوس.' },
        { id: 'sign2', kind: 'sign', x: 23, y: 18, text: 'البرج القديم: «لا يدخل إلا من قرأ الراية من اليمين إلى اليسار».' },
        { id: 'toCamp', kind: 'exit', x: 31, y: 11, to: 'camp', tx: 1, ty: 10, arrow: '➜', when: A => A.has('lantern') && A.flag('salem'), locked: 'الطريق إلى المعسكر مظلم ومخيف… أنقذ العم سالم أولاً، وخذ الفانوس معك.' },
        { id: 's1', kind: 'star', x: 30, y: 7 }, { id: 's2', kind: 'star', x: 23, y: 16 }, { id: 's5', kind: 'star', x: 1, y: 13 }
      ],
      onSolid: (A, x, y, ch) => {
        if (ch === '"') { if (A.has('sickle')) { A.cut(x, y); A.sfx('plant'); A.toast('🌾 قصصتَ الشوك!'); } else A.toast('🌿 شوك كثيف! تحتاج أداة لقصّه.'); return true; }
        if (ch === 'R') { if (A.has('hammer')) { A.cut(x, y); A.sfx('drop'); A.shake(.5); A.toast('🔨 انكسرت الصخرة!'); } else A.toast('🪨 صخرة متشققة… لعل مطرقة تكسرها.'); return true; }
      },
      onLever: (A, e) => {
        const seq = (A.flag('seq') || []).concat(e.on ? [e.c] : []);
        if (!e.on) return;
        if (ORDER.slice(0, seq.length).join() !== seq.join()) {
          A.sfx('cough'); A.toast('🔄 ترتيب مختلف… اقرأ الراية من اليمين إلى اليسار.');
          setTimeout(() => { ['lv_blue', 'lv_red', 'lv_green'].forEach(id => A.set(id, { on: false })); A.flag('seq', []); }, 600); return;
        }
        A.flag('seq', seq); if (seq.length === 3) { A.flag('tower_open', true); A.show('maryam'); A.sfx('win'); }
      },
      on: {
        harith: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'harith', text: 'الحمد لله أنك بخير يا بطل! عصابة الظلال هجمت قبل ساعة وأطفأت كل الفوانيس.' },
              { who: 'harith', text: 'خطفوا أربعة: العم سالم، والعم ناصر، والصغير يوسف، والجدة مريم.' },
              { who: 'hero', text: 'لن أتركهم! من أين أبدأ؟' },
              { who: 'harith', text: 'خذ فانوسك أولاً من صندوق بيتك، فالظلام سلاحهم. ثم سمعتُ صوت سالم قرب المزرعة الجنوبية.' },
              { who: 'harith', text: 'وحين تنقذ الجميع، أوقد المنارات الثلاث فيرى رجال القرية النار ويعودوا. لن تجرؤ العصابة على البقاء.' },
              { who: 'harith', text: 'وانتبه: إن رآك أحدهم فارجع إلى أقرب نار آمنة 🔥 وحاول من جديد بهدوء.' }
            ]); A.flag('met', true); A.checkpoint(17, 12); return;
          }
          const g = A.goal(); await A.say([{ who: 'harith', text: g ? 'أنت قادر على ذلك. ' + (g.hint || '') : 'أنقذتَ القرية يا بطل!' }]);
        },
        salem: async A => {
          if (A.flag('salem')) return;
          await A.say([
            { who: 'salem', text: 'يا بطل! ربطوني هنا وتركوا الشوك حولي حتى لا يصل إليّ أحد.' },
            { who: 'salem', text: 'سمعتهم يقولون إنهم أخذوا يوسف إلى معسكرهم في بستان النخيل شرق القرية، وإن مفاتيح المخزن مع زعيمهم.' },
            { who: 'hero', text: 'اذهب إلى الساحة يا عم، سأعيد الجميع.' }
          ]);
          A.flag('salem', true); A.hide('salem'); A.show('v_salem'); A.sparkle(4, 20);
        },
        wdoor: async (A, e) => {
          if (!A.has('keys')) return A.say([{ who: 'narrator', text: e.locked }]);
          A.set('wdoor', { open: true }); A.sfx('gate'); A.show('naser');
          await A.say([{ who: 'naser', text: 'أخيراً! حبسوني مع بضائع الدكان. شكراً يا بطل!' }, { who: 'naser', text: 'الجدة مريم في البرج القديم جنوب شرق القرية. بوابته لها لغز قديم بالألوان.' }]);
          A.flag('naser', true); A.hide('naser'); A.show('v_naser'); A.take('keys');
        },
        maryam: async A => {
          if (A.flag('maryam')) return;
          await A.say([{ who: 'maryam', text: 'بارك الله فيك يا صغيري! كنت أعرف أن أحداً سيقرأ الراية.' }, { who: 'maryam', text: 'خذ هذه الشعلة. أشعلها من نار الساحة، وأوقد بها المنارات الثلاث.' }]);
          A.flag('maryam', true); A.give('torch'); A.hide('maryam'); A.show('v_maryam');
        },
        square: async A => {
          if (A.has('torch')) { A.take('torch'); A.give('fire'); A.sparkle(17, 12, '#FF8A1E'); return A.say([{ who: 'narrator', text: 'اشتعلت الشعلة! الآن إلى المنارات الثلاث.' }]); }
          A.say([{ who: 'narrator', text: '🔥 نار آمنة. إن رآك أحد الحراس تعود إلى آخر نار مررتَ بها.' }]);
        },
        bc1: (A, e) => beacon(A, e), bc2: (A, e) => beacon(A, e), bc3: (A, e) => beacon(A, e),
        v_yousef: A => A.say([{ who: 'yousef', text: 'شكراً لك! كنت خائفاً جداً في القفص.' }]),
        v_salem: A => A.say([{ who: 'salem', text: 'أنا بخير الآن بفضلك. أكمل يا بطل!' }]),
        v_naser: A => A.say([{ who: 'naser', text: 'ما زال المخزن سليماً. القرية كلها مدينة لك.' }]),
        v_maryam: A => A.say([{ who: 'maryam', text: 'المنارات يا صغيري، المنارات!' }])
      }
    },
    camp: {
      theme: 'camp', map: rows(C), dark: .5,
      enter: A => { if (!A.flag('campIntro')) { A.flag('campIntro', true); A.say([{ who: 'narrator', text: 'معسكر عصابة الظلال: خيام وصناديق وحراس يدورون بفوانيسهم.' }, { who: 'hero', text: 'سأتحرك بهدوء. العشب الطويل يخفيني، ومخروط الضوء أمام الحارس هو ما يراه.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 10, to: 'village', tx: 30, ty: 11, arrow: '➜' },
        { id: 'f1', kind: 'safe', x: 2, y: 10 }, { id: 'f2', kind: 'safe', x: 15, y: 9 },
        { id: 't1', kind: 'tent', x: 8, y: 3, color: '#8E3B3B' }, { id: 't2', kind: 'tent', x: 13, y: 16, color: '#6B4A2E' }, { id: 't3', kind: 'tent', x: 23, y: 4, color: '#3E2A4E' },
        { id: 'cr1', kind: 'crates', x: 16, y: 7 }, { id: 'br1', kind: 'barrel', x: 17, y: 7 }, { id: 'br2', kind: 'barrel', x: 11, y: 6 }, { id: 'br3', kind: 'barrel', x: 8, y: 12 },
        { id: 'c_keys', kind: 'chest', x: 24, y: 5, item: 'keys' },
        { id: 'cage', kind: 'cage', x: 21, y: 13, when: A => A.pressed(A.ent('p1')) && A.pressed(A.ent('p2')), openMsg: '🔓 انفتح القفص!' },
        { id: 'yousef', kind: 'npc', who: 'yousef', x: 21, y: 13, face: 'down', mark: A => A.ent('cage').open && !A.flag('yousef') ? '!' : null },
        { id: 'p1', kind: 'plate', x: 19, y: 16 }, { id: 'p2', kind: 'plate', x: 23, y: 16 },
        { id: 'b1', kind: 'block', x: 17, y: 16 }, { id: 'b2', kind: 'block', x: 23, y: 14 },
        { id: 'sgn', kind: 'sign', x: 17, y: 12, text: 'قفص العصابة: يُفتح حين يُضغط على اللوحتين معاً. (امشِ نحو الصندوق لتدفعه، أو اضغط عليه وأنت بجانبه)' },
        { id: 'gA', kind: 'guard', look: BANDIT, path: [[6, 9], [13, 9]], speed: 1.3, range: 3.6 },
        { id: 'gB', kind: 'guard', look: BANDIT, path: [[18, 2], [18, 12]], speed: 1.2, range: 3.6 },
        { id: 'gC', kind: 'guard', look: BANDIT, path: [[21, 2], [26, 2], [26, 8], [21, 8]], speed: 1.1, range: 3.2, wait: 1.4 },
        { id: 'hammer', kind: 'item', x: 25, y: 17, item: 'hammer' },
        { id: 's3', kind: 'star', x: 5, y: 6 }, { id: 's4', kind: 'star', x: 25, y: 1 }
      ],
      on: {
        yousef: async A => {
          if (!A.ent('cage').open) return A.say([{ who: 'yousef', text: 'أخرجني من هنا! القفص يُفتح حين تُضغط اللوحتان على الأرض.' }]);
          if (A.flag('yousef')) return;
          await A.say([{ who: 'yousef', text: 'أنت بطل حقيقي! سأركض إلى الساحة.' }, { who: 'yousef', text: 'رأيت الزعيم يخبئ المفاتيح في صندوق بجانب خيمته البنفسجية. احذر حارسه!' }]);
          A.flag('yousef', true); A.hide('yousef'); A.sparkle(21, 13);
          A.S.ent['village:v_yousef'] = { hidden: false };   // يظهر في ساحة القرية
        }
      }
    }
  },
  finale: null
};

async function beacon(A, e) {
  if (e.lit) return A.say([{ who: 'narrator', text: 'المنارة مشتعلة. ' + ((A.flag('lit') || 0) < 3 ? 'بقيت منارات أخرى.' : '') }]);
  if (!A.has('fire')) return A.say([{ who: 'narrator', text: A.flag('maryam') ? 'تحتاج شعلة مشتعلة. أشعلها من نار الساحة.' : 'منارة مطفأة. ستحتاج شعلة لتوقدها.' }]);
  A.set(e.id, { lit: true }); A.sfx('gate'); A.sparkle(e.x, e.y - 1, '#FF8A1E'); const n = (A.flag('lit') || 0) + 1; A.flag('lit', n);
  if (n < 3) return A.toast(`🔥 أوقدتَ منارة (${n === 1 ? 'واحدة' : 'اثنتين'} من ثلاث)`);
  await A.say([
    { who: 'narrator', text: 'اشتعلت المنارات الثلاث! أضاءت القرية كلها، ورأى رجال القرية النار من بعيد.' },
    { who: 'narrator', text: 'سُمع صوت عصابة الظلال تفرّ مسرعة نحو الصحراء… ولن تعود.' },
    { who: 'harith', text: 'عادت قرية الخير لأهلها بفضل شجاعتك يا بطل. سنصنع لك تمثالاً في الساحة!' }
  ]);
  A.complete();
}
