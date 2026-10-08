// المغامرة ٤: «سر المدينة القديمة» — تُفتح بعد الوحدة الرابعة. الجد ماجد حارس الخريطة يقود البطل إلى مدينة مهجورة تحت الرمال،
// قيل إن «قرص الشمس» فيها كان يحفظ بئر القرية. ثلاث مناطق: المدينة (نقوش تحكي القصة وتكشف رموز البوابة، ركام يُكسر، عقرب)،
// القصر (إنقاذ المستكشفة سارة، تماثيل تُدار نحو النافورة، صناديق على ألواح، صخور تتدحرج)، ومعبد الشمس (حارس حجري، لغز ثلاث مرايا،
// والمذبح). بلا رياضيات ولا مؤقت ولا عقاب.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const flowers = g => g.forEach((r, y) => r.forEach((c, x) => { if (c === '.' && (x * 7 + y * 5) % 13 === 0) r[x] = ','; }));
const rows = g => g.map(r => r.join(''));

/* ── المدينة: الشارع والبوابة والساحة (٣٠×٢٢) ── */
const C = grid(30, 22); border(C); flowers(C);
rect(C, 1, 18, 27, 18, '_'); rect(C, 15, 9, 15, 17, '_'); rect(C, 15, 1, 15, 7, '_');
rect(C, 1, 8, 28, 8, '#'); C[8][15] = '.';                                   // سور البوابة
rect(C, 23, 9, 28, 9, '#'); rect(C, 23, 9, 23, 14, '#'); rect(C, 23, 14, 28, 14, '#'); C[12][23] = 'R';   // زاوية مسدودة بالركام
pts(C, [[3, 3], [26, 3], [8, 12], [19, 11], [2, 15], [11, 20], [24, 20]], 'T');
C[0][15] = '_';

/* ── القصر (٣٠×٢٢) ── */
const P = grid(30, 22); border(P); flowers(P);
rect(P, 15, 15, 15, 20, '_'); rect(P, 7, 1, 7, 6, '#'); rect(P, 1, 6, 7, 6, '#'); P[6][4] = 'R';   // غرفة سارة خلف الركام
rect(P, 22, 1, 22, 6, '#'); rect(P, 22, 6, 28, 6, '#'); P[6][25] = '.';                             // خزانة القصر (باب)
P[21][15] = '_'; P[0][15] = '_';

/* ── معبد الشمس (٢٨×١٨) ── */
const M = grid(28, 18, 'c'); border(M);
rect(M, 21, 1, 21, 16, '#'); M[9][21] = 'c'; M[17][14] = '_';

const MAJID = { kind: 'man', robe: '#F4F1E8', accent: '#7B3F98', skin: '#B97F52', beard: '#DDDDDD', tool: 'cane', elder: true };
const STONE = { kind: 'man', robe: '#8C8478', accent: '#5E564C', skin: '#A39A8C', build: 1.25, tall: 1.12 };
const STATUE = { N: 0, S: 2, W: 3, E: 1 };   // الاتجاه الصحيح لكل تمثال (نحو النافورة)
const GATE_SOL = { t1: 0, t2: 3, t3: 1 };    // رموز البوابة: الأيسر 🌙، الأوسط 🌴، الأيمن ☀️

export default {
  id: 'oldcity', title: 'سر المدينة القديمة', icon: '🏛️', stars: 5,
  start: { area: 'city', x: 3, y: 19 },
  symbols: ['🌙', '☀️', '⭐', '🌴'],
  items: { hammer: { icon: '🔨', name: 'مطرقة المستكشف' }, frag: { icon: '📜', name: 'نقش قديم' }, keyA: { icon: '🌗', name: 'نصف قرص الشمس (الأيمن)' }, keyB: { icon: '🌓', name: 'نصف قرص الشمس (الأيسر)' } },
  cast: {
    majid: { name: 'الجد ماجد', look: MAJID },
    sara: { name: 'المستكشفة سارة', look: { kind: 'woman', robe: '#C9955A', accent: '#2F6FB2', skin: '#D9A374', hat: 'straw', vest: '#7A5230' } }
  },
  goals: [
    { text: 'تحدّث مع الجد ماجد عند مدخل المدينة', done: A => A.flag('met'), at: () => ({ area: 'city', id: 'majid' }), hint: 'الجد ماجد ينتظرك على الشارع قرب نقطة البداية.' },
    { text: 'خذ مطرقة المستكشف من الصندوق القديم', done: A => A.has('hammer'), at: () => ({ area: 'city', id: 'c_hammer' }), hint: 'الصندوق غرب الشارع الكبير.' },
    { text: 'اجمع النقوش الثلاثة واقرأ قصة المدينة (واحد خلف الركام)', done: A => A.count('frag') >= 3 || A.flag('gate'), at: A => { const f = ['f1', 'f2', 'f3'].find(id => !(A.ent(id) || {}).got); return f === 'f3' && !A.S.cut['city:23,12'] ? { area: 'city', x: 23, y: 12 } : { area: 'city', id: f || 'f1' }; }, hint: 'النقش الثالث في زاوية مسدودة بالركام شرق المدينة: اكسره بالمطرقة. واحذر العقرب قرب الثاني.' },
    { text: 'اضبط ألواح البوابة الثلاثة على الرموز التي ذكرتها النقوش', done: A => A.flag('gate'), at: A => ({ area: 'city', id: ['t1', 't2', 't3'].find(id => (A.ent(id) || {}).sym !== GATE_SOL[id]) || 't1' }), hint: 'النقوش قالت: الأيمن ☀️ الشمس، والأوسط 🌴 النخلة، والأيسر 🌙 الهلال. انقر على اللوح ليتغير رمزه.' },
    { text: 'ادخل القصر شمال الساحة', done: A => A.flag('palace'), at: () => ({ area: 'palace', x: 15, y: 20 }), hint: 'البوابة انفتحت. امشِ شمالاً عبر الساحة.' },
    { text: 'أنقذ المستكشفة سارة المحاصرة خلف الركام', done: A => A.flag('sara'), at: A => A.S.cut['palace:4,6'] ? { area: 'palace', id: 'sara' } : { area: 'palace', x: 4, y: 6 }, hint: 'غرفتها في الزاوية الشمالية الغربية من القصر. اكسر الركام بالمطرقة.' },
    { text: 'أدر التماثيل الأربعة لتنظر كلها إلى النافورة', done: A => A.flag('statues'), at: A => ({ area: 'palace', id: Object.keys(STATUE).find(id => (A.ent(id) || {}).r !== STATUE[id]) || 'N' }), hint: 'انقر على التمثال ليدور ربع دورة. سهم الذهب في يده يجب أن يشير إلى النافورة في الوسط.' },
    { text: 'خذ النصف الأيمن من قرص الشمس من خزانة القصر', done: A => A.has('keyA') || A.flag('altar'), at: () => ({ area: 'palace', id: 'c_keyA' }), hint: 'الخزانة في الزاوية الشمالية الشرقية، وبابها انفتح.' },
    { text: 'ادفع الصندوقين على اللوحين الذهبيين لتفتح طريق المعبد', done: A => A.flag('plates'), at: A => ({ area: 'palace', id: A.pressed(A.ent('p1')) ? 'b2' : 'b1' }), hint: 'انقر على كل صندوق فيدفعه البطل إلى لوحه. اتبع الأسهم المضيئة.' },
    { text: 'ادخل معبد الشمس', done: A => A.flag('temple'), at: () => ({ area: 'temple', x: 14, y: 16 }), hint: 'البوابة الحديدية في شمال القصر انفتحت.' },
    { text: 'أدر المرايا الثلاث حتى يصل نور الشمس إلى بلّورة المعبد', done: A => A.flag('beam'), at: A => ({ area: 'temple', id: ['m1', 'm2', 'm3'].find(id => (A.ent(id) || {}).r !== { m1: 1, m2: 1, m3: 2 }[id]) || 'm1' }), hint: 'اتبع الشعاع الذهبي من فتحة السقف: الأولى ترسله إلى الأسفل، والثانية إلى اليمين، والثالثة إلى الأعلى نحو البلّورة.' },
    { text: 'ضع نصفي قرص الشمس على المذبح', done: A => A.flag('altar'), at: () => ({ area: 'temple', id: 'altar' }), hint: 'المذبح في الحجرة الداخلية خلف الباب الذي انفتح.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'قبل ألف عام، كانت هنا مدينة عامرة… ثم غطّتها الرمال ونسيها الناس.' },
    { who: 'narrator', text: 'واليوم، كشفت عاصفة الأسبوع الماضي أسوارها من جديد!' },
    { who: 'hero', text: 'الجد ماجد يقول إن سرّ بئر قريتنا مدفون هنا. لنكتشفه!' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 35; s.decor = s.decor || {}; s.decor.sundisk = s.decor.sundisk || Date.now(); },
  rewards: ['💎 ٣٥ جوهرة', '☀️ قرص الشمس الذهبي في ساحة القرية', '🏅 وسام «كاشف الأسرار»'],
  areas: {
    city: {
      theme: 'ruins', map: rows(C), dark: 0,
      ents: [
        { id: 'majid', kind: 'npc', who: 'majid', x: 5, y: 18, face: 'left', mark: A => A.flag('met') ? null : '!' },
        { id: 'safe1', kind: 'safe', x: 3, y: 17 }, { id: 'safe2', kind: 'safe', x: 16, y: 14 },
        { id: 'c_hammer', kind: 'chest', x: 4, y: 12, item: 'hammer' },
        { id: 'f1', kind: 'item', x: 6, y: 14, item: 'frag', after: A => A.say([{ who: 'narrator', text: '📜 النقش الأول: «نحن أهل مدينة الشمس. حفرنا بئراً لا تجف، وصنعنا قرصاً من الذهب يحفظ ماءها».' }, { who: 'narrator', text: '«ورسمنا على بوابتنا: في اللوح الأيمن ☀️ الشمس».' }]) },
        { id: 'f2', kind: 'item', x: 21, y: 16, item: 'frag', after: A => A.say([{ who: 'narrator', text: '📜 النقش الثاني: «حين جاءت الرمال، قسمنا القرص نصفين، وخبّأنا كل نصف في مكان».' }, { who: 'narrator', text: '«وفي اللوح الأوسط 🌴 النخلة، فهي أمّ هذه الأرض».' }]) },
        { id: 'f3', kind: 'item', x: 26, y: 11, item: 'frag', after: A => A.say([{ who: 'narrator', text: '📜 النقش الثالث: «من يُعِد النصفين إلى مذبح الشمس، تعود البئر كما كانت».' }, { who: 'narrator', text: '«وفي اللوح الأيسر 🌙 الهلال، دليل المسافرين ليلاً».' }]) },
        { id: 'sc1', kind: 'hazard', creature: 'scorpion', path: [[17, 15], [22, 15]], speed: 1, r: .55, caughtMsg: '🦂 لدغة خفيفة من العقرب! تعود إلى آخر نقطة آمنة… انتظر حتى يبتعد.' },
        { id: 't1', kind: 'tablet', x: 12, y: 10, sym: 2 }, { id: 't2', kind: 'tablet', x: 13, y: 10, sym: 2 }, { id: 't3', kind: 'tablet', x: 14, y: 10, sym: 2 },
        { id: 'sgT', kind: 'sign', x: 11, y: 11, text: 'بوابة مدينة الشمس: «لا يدخل إلا من عرف رموز أهلها». انقر على اللوح ليتغير رمزه.' },
        { id: 'gate', kind: 'gate', x: 15, y: 8, when: A => A.flag('gate'), openMsg: '🔓 انفتحت بوابة المدينة القديمة!' },
        { id: 'pl1', kind: 'pillar', x: 10, y: 3 }, { id: 'pl2', kind: 'pillar', x: 20, y: 3 }, { id: 'pl3', kind: 'pillar', x: 10, y: 6, h: 60 }, { id: 'pl4', kind: 'pillar', x: 20, y: 6, h: 50 },
        { id: 'toPalace', kind: 'exit', x: 15, y: 0, to: 'palace', tx: 15, ty: 20, when: A => A.flag('gate') },
        { id: 's1', kind: 'star', x: 2, y: 10 }, { id: 's2', kind: 'star', x: 27, y: 17 }, { id: 's3', kind: 'star', x: 28, y: 13 }
      ],
      onSolid: (A, x, y, ch) => { if (ch === 'R') { if (A.has('hammer')) { A.cut(x, y); A.sfx('drop'); A.shake(.5); A.toast('🔨 تكسّر الركام!'); } else A.toast('🪨 ركام ثقيل… مطرقة المستكشف في الصندوق القديم.'); return true; } },
      onTablet: A => { if (!A.flag('gate') && Object.entries(GATE_SOL).every(([id, v]) => A.ent(id).sym === v)) { A.flag('gate', true); A.sfx('win'); } },
      on: {
        majid: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'majid', text: 'وصلت يا بطل! انظر… هذه مدينة الشمس التي حكى عنها جدّي.' },
              { who: 'majid', text: 'يقولون إن قرص الشمس الذهبي كان يحفظ ماء بئرنا. وبئر القرية يقلّ ماؤها كل عام.' },
              { who: 'majid', text: 'أهل المدينة كتبوا قصتهم على نقوش. اقرأها كلها، ففيها رموز البوابة.' },
              { who: 'majid', text: 'خذ مطرقتي من ذلك الصندوق، تكسر بها الركام. أنا عجوز، سأنتظرك هنا وأدعو لك.' }
            ]); A.flag('met', true); return;
          }
          A.say([{ who: 'majid', text: A.flag('gate') ? 'انفتحت البوابة! القصر خلفها، توكّل على الله.' : 'النقوش تخبرك بالرموز. ' + ((A.goal() || {}).hint || '') }]);
        },
        t1: (A, e) => tab(A, e), t2: (A, e) => tab(A, e), t3: (A, e) => tab(A, e)
      }
    },
    palace: {
      theme: 'ruins', map: rows(P), dark: .25,
      enter: A => { if (!A.flag('palace')) { A.flag('palace', true); A.say([{ who: 'narrator', text: 'قصر مدينة الشمس: نافورة جافة في الوسط، وأربعة تماثيل تنظر في كل اتجاه… وصوت يستغيث!' }, { who: 'narrator', text: '«النجدة! أنا هنا، في الغرفة الشمالية الغربية!»' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 15, y: 21, to: 'city', tx: 15, ty: 1 },
        { id: 'safeP', kind: 'safe', x: 15, y: 18 }, { id: 'safeP2', kind: 'safe', x: 15, y: 12 },
        { id: 'fountain', kind: 'well', x: 15, y: 10 },
        { id: 'N', kind: 'rot', style: 'statue', x: 15, y: 6, r: 2 }, { id: 'S', kind: 'rot', style: 'statue', x: 15, y: 14, r: 0 },
        { id: 'W', kind: 'rot', style: 'statue', x: 11, y: 10, r: 1 }, { id: 'E', kind: 'rot', style: 'statue', x: 19, y: 10, r: 3 },
        { id: 'sgS', kind: 'sign', x: 17, y: 12, text: 'نقش: «حين تنظر التماثيل الأربعة إلى الماء، يُفتح كنز القصر». انقر على التمثال ليدور.' },
        { id: 'sara', kind: 'npc', who: 'sara', x: 3, y: 3, face: 'down', mark: A => A.flag('sara') ? null : '!' },
        { id: 'vault', kind: 'door', x: 25, y: 6, when: A => A.flag('statues'), openMsg: '🔓 انفتحت خزانة القصر!', name: 'باب الخزانة', locked: 'باب الخزانة مغلق بقفل حجري… التماثيل تحرسه.' },
        { id: 'c_keyA', kind: 'chest', x: 25, y: 3, item: 'keyA' },
        { id: 'p1', kind: 'plate', x: 13, y: 3 }, { id: 'p2', kind: 'plate', x: 17, y: 3 },
        { id: 'b1', kind: 'block', x: 12, y: 5, to: 'p1' }, { id: 'b2', kind: 'block', x: 18, y: 5, to: 'p2' },
        { id: 'tgate', kind: 'gate', x: 15, y: 1, when: A => { const ok = A.pressed(A.ent('p1')) && A.pressed(A.ent('p2')); if (ok) A.flag('plates', true); return ok; }, openMsg: '🔓 انفتحت البوابة الحديدية إلى معبد الشمس!' },
        { id: 'rk1', kind: 'hazard', creature: 'boulder', path: [[2, 16], [12, 16]], speed: 2.1, r: .7, caughtMsg: '🪨 صخرة متدحرجة! تعود إلى النار الآمنة… انتظر حتى تمرّ.' },
        { id: 'rk2', kind: 'hazard', creature: 'boulder', path: [[28, 16], [18, 16]], speed: 1.8, r: .7, caughtMsg: '🪨 صخرة متدحرجة! تعود إلى النار الآمنة… انتظر حتى تمرّ.' },
        { id: 'toTemple', kind: 'exit', x: 15, y: 0, to: 'temple', tx: 14, ty: 16, when: A => A.flag('plates') },
        { id: 's4', kind: 'star', x: 27, y: 19 }
      ],
      onSolid: (A, x, y, ch) => { if (ch === 'R') { if (A.has('hammer')) { A.cut(x, y); A.sfx('drop'); A.shake(.5); A.toast('🔨 تكسّر الركام!'); } else A.toast('🪨 ركام ثقيل… تحتاج المطرقة.'); return true; } },
      onRotate: A => { if (!A.flag('statues') && Object.entries(STATUE).every(([id, v]) => A.ent(id).r === v)) { A.flag('statues', true); A.sfx('win'); A.toast('🗿 التماثيل الأربعة تنظر إلى النافورة!'); } },
      on: {
        sara: async A => {
          if (A.flag('sara')) return A.say([{ who: 'sara', text: 'بالتوفيق! المذبح في معبد الشمس شمال القصر.' }]);
          await A.say([
            { who: 'sara', text: 'الحمد لله! أنا سارة، مستكشفة آثار. سقط الركام على باب الغرفة منذ يومين!' },
            { who: 'sara', text: 'وجدت هنا هذا النصف من قرص الشمس. خذه، فأنت أقدر على إكمال الرحلة.' },
            { who: 'sara', text: 'النصف الآخر في خزانة القصر، وبابها لا يُفتح إلا حين تنظر التماثيل الأربعة إلى النافورة.' },
            { who: 'sara', text: 'وطريق المعبد خلف البوابة الحديدية: صندوقان ثقيلان على لوحين يفتحانها.' }
          ]);
          A.flag('sara', true); A.give('keyB'); A.sparkle(3, 3);
        }
      }
    },
    temple: {
      theme: 'cave', map: rows(M), dark: .7,
      enter: A => { if (!A.flag('temple')) { A.flag('temple', true); A.say([{ who: 'narrator', text: 'معبد الشمس: ظلام وصمت، وشعاع ذهبي وحيد يدخل من فتحة في السقف.' }, { who: 'narrator', text: 'وفي الظلام حارس من حجر يمشي ذهاباً وإياباً… لا تدعه يراك!' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 14, y: 17, to: 'palace', tx: 15, ty: 2 },
        { id: 'safeT', kind: 'safe', x: 14, y: 15 },
        { id: 'sun', kind: 'beam', x: 2, y: 4, dir: 0, light: 2 },
        { id: 'm1', kind: 'rot', style: 'mirror', x: 8, y: 4, r: 0 }, { id: 'm2', kind: 'rot', style: 'mirror', x: 8, y: 12, r: 0 }, { id: 'm3', kind: 'rot', style: 'mirror', x: 16, y: 12, r: 1 },
        { id: 'cr', kind: 'crystal', x: 16, y: 6 },
        { id: 'sgM', kind: 'sign', x: 4, y: 6, text: 'نقش: «من يوصل نور الشمس إلى البلّورة، يدخل حجرة المذبح». انقر على المرآة لتدور.' },
        { id: 'guard', kind: 'guard', look: STONE, path: [[3, 14], [11, 14]], speed: .9, range: 3, caughtMsg: '🗿 رآك الحارس الحجري! تعود إلى النار الآمنة… تحرّك حين يدير ظهره.' },
        { id: 'sdoor', kind: 'door', x: 21, y: 9, when: A => A.flag('beam'), openMsg: '🔓 انفتح باب حجرة المذبح!', name: 'باب الحجرة', locked: 'باب حجري عليه رسم شمس… لعل البلّورة تفتحه.' },
        { id: 'altar', kind: 'site', x: 24, y: 9, model: 'altar' },
        { id: 's5', kind: 'star', x: 25, y: 3 }
      ],
      tick: A => { const c = A.ent('cr'); if (c && c.lit && !A.flag('beam')) { A.flag('beam', true); A.sfx('win'); A.shake(.4); A.toast('💎 أضاءت بلّورة المعبد!'); } },
      on: {
        altar: async (A, e) => {
          if (e.built) return;
          if (!A.has('keyA') || !A.has('keyB')) return A.say([{ who: 'narrator', text: 'مذبح حجري عليه دائرة فارغة… تحتاج نصفي قرص الشمس.' }]);
          A.take('keyA'); A.take('keyB'); A.set('altar', { built: true }); A.flag('altar', true); A.sfx('gate'); A.shake(1); A.sparkle(24, 9, '#FFD54A'); A.weather({ dark: .05 });
          await A.say([
            { who: 'narrator', text: 'التأم النصفان… وأشرق قرص الشمس بنور ذهبي ملأ المعبد كله!' },
            { who: 'narrator', text: 'وسُمع من بعيد صوت ماء يتدفق في قنوات المدينة القديمة، نحو بئر قرية الخير.' },
            { who: 'hero', text: 'هذا هو السر! عادت المياه إلى بئرنا بفضل أهل مدينة الشمس.' }
          ]);
          A.complete();
        }
      }
    }
  }
};

async function tab(A, e) {
  if (A.flag('gate')) return A.toast('🔓 البوابة مفتوحة');
  const n = 4, sym = ((e.sym || 0) + 1) % n; A.set(e.id, { sym }); A.sfx('click');
  if (Object.entries(GATE_SOL).every(([id, v]) => A.ent(id).sym === v)) { A.flag('gate', true); A.sfx('win'); A.say([{ who: 'narrator', text: '☀️🌴🌙 أضاءت الرموز الثلاثة… وتحرّكت البوابة الحجرية!' }]); }
}
