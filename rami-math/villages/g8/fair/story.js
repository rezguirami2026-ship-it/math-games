// مغامرة مهرجان الألعاب: «لغز صانع الألعاب» (الصف الثامن، الوحدة ٧) — بمحرك المغامرات، وبآليتين جديدتين لم تُستعملا قبلها:
// «النطّاطات»: الوقوف على نطّاطة يقذف البطل ثلاث بلاطات في اتجاه سهمها فوق بركة المهرجان (وقد تقذفه نطّاطة إلى أخرى)، والزرقاء يديرها ذراع؛
// و«قاعة النرد»: حجرا نرد كبيران يتدحرجان على حوافهما حين يُدفعان فيتغير وجههما الأعلى، ولا يُفتح باب الجائزة حتى يقف كل حجر
// على لوحته ووجهه الأعلى هو العدد المرسوم عليها (اللغز محسوب بحلّال: ٨ دفعات لكل حجر، وذراع يعيد الحجرين إلى مكانهما).
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── بركة المهرجان (٢٠×١٣): الشاطئ غرباً، وجزر صغيرة في البركة، وجزيرة الورشة شرقاً ومنها باب قاعة النرد ── */
const PK = grid(20, 13); rect(PK, 1, 1, 18, 11, '~'); rect(PK, 1, 1, 4, 11, '.');
const ISLES = { A: [[7, 5], [7, 6], [7, 7], [8, 5], [8, 6], [8, 7]], B: [[7, 1], [7, 2], [8, 2]], C: [[11, 6], [11, 7], [12, 6], [12, 7]], D: [[12, 9], [12, 10], [11, 10]] };
Object.values(ISLES).flat().forEach(([x, y]) => { PK[y][x] = '.'; }); rect(PK, 15, 3, 18, 9, '.');
[[1, 11], [4, 1], [1, 2], [18, 3], [18, 9]].forEach(([x, y]) => { PK[y][x] = 'T'; });
// النطّاطات: [معرّف، س، ص، الاتجاه (٠ يمين، ١ أسفل، ٢ يسار، ٣ أعلى)، زرقاء؟]
const SPRINGS = [['j1', 4, 6, 0], ['j2', 7, 5, 3], ['j3', 8, 2, 1], ['j4', 8, 6, 0], ['j5', 7, 7, 2], ['j6', 11, 7, 2], ['j7', 12, 6, 1, true], ['j8', 11, 10, 3], ['j9', 15, 7, 2]];
const DV = [[1, 0], [0, 1], [-1, 0], [0, -1]], JUMP = 3;
/* ── قاعة النرد (١٦×١٢): لوحتان في الركنين الشماليين، وعمودان، وباب الجائزة شمالاً ── */
const HL = grid(16, 12); rect(HL, 1, 3, 14, 10, '.'); rect(HL, 6, 1, 8, 1, '.'); HL[2][7] = '.';
[[3, 4], [12, 4], [6, 6], [9, 6]].forEach(([x, y]) => { HL[y][x] = '#'; });
const DICE = { dA: { x: 5, y: 8, die: { t: 1, n: 2, e: 3 } }, dB: { x: 10, y: 8, die: { t: 2, n: 6, e: 3 } } };
const PLATES = { pA: [2, 3, 6], pB: [13, 3, 4] };   // [س، ص، الوجه المطلوب]
const onPlate = A => Object.entries(PLATES).map(([id, [x, y, need]]) => ['dA', 'dB'].some(d => { const e = A.ent(d); return e && e.x === x && e.y === y && e.die.t === need; }));

const MASOUD = { kind: 'man', skin: '#A8764E', robe: '#F8FAFC', accent: '#DB2777', beard: '#E5E5E5', elder: true, glasses: true };
const MUHANNAD = { kind: 'boy', skin: '#A8764E', robe: '#F7F5EF', accent: '#16A34A', tall: true };

export default {
  id: 'g8fair', title: 'لغز صانع الألعاب', icon: '🎡', stars: 5,
  start: { area: 'pond', x: 2, y: 9 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { key: { icon: '🗝️', name: 'مفتاح قاعة النرد' }, cup: { icon: '🏆', name: 'كأس المهرجان' } },
  cast: { masoud: { name: 'صانع الألعاب مسعود', look: MASOUD }, muhannad: { name: 'مهند', look: MUHANNAD } },
  goals: [
    { text: 'تحدّث مع صانع الألعاب مسعود', done: A => A.flag('met'), at: () => ({ area: 'pond', id: 'masoud' }), hint: 'مسعود على شاطئ البركة.' },
    { text: 'اقفز على النطّاطات إلى جزيرة الورشة وخذ المفتاح', done: A => A.has('key') || A.flag('hall'), at: () => ({ area: 'pond', id: 'chest' }), hint: 'كل نطّاطة تقذفك ثلاث بلاطات في اتجاه سهمها. والنطّاطة الزرقاء تدور بالذراع الزرقاء على الشاطئ: إلى أين يشير سهمها الآن؟' },
    { text: 'دحرج حجري النرد إلى لوحتيهما بالوجه المطلوب', done: A => A.flag('open'), at: () => ({ area: 'hall', id: 'muhannad' }), hint: 'حين يتدحرج الحجر يصير وجهه الجانبي أعلى. لا تدفعه إلى اللوحة مباشرة: جرّب لفة جانبية أولاً وراقب الوجه الأعلى. والذراع في الركن تعيد الحجرين.' },
    { text: 'افتح صندوق الجائزة وأعد الكأس إلى المهرجان', done: A => A.flag('done'), at: () => ({ area: 'hall', id: 'prize' }), hint: 'باب الجائزة مفتوح شمال القاعة.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'ليلة ختام مهرجان الألعاب… والجميع ينتظر كأس المهرجان.' },
    { who: 'narrator', text: 'لكن الكأس في قاعة النرد عند صانع الألعاب، ومفتاحها في ورشته وسط البركة!' },
    { who: 'hero', text: 'لأسأل العم مسعود.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).fairHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «بطل المهرجان»'],
  areas: {
    pond: {
      theme: 'village', map: rows(PK), dark: 0,
      enter: () => { air = false; lastT = null; },
      ents: [
        ...SPRINGS.map(([id, x, y, d, blue]) => ({ id, kind: 'spring', x, y, d, blue: !!blue })),
        { id: 'masoud', kind: 'npc', who: 'masoud', x: 2, y: 6, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'blue', kind: 'lever', x: 3, y: 4, color: '#2563EB' },
        { id: 'sg1', kind: 'sign', x: 3, y: 8, text: 'نطّاطات المهرجان: «قف على النطّاطة فتقذفك ثلاث خطوات في اتجاه سهمها». والذراع الزرقاء تدير النطّاطة الزرقاء.' },
        { id: 'chest', kind: 'chest', x: 17, y: 4, item: 'key' },
        { id: 'toHall', kind: 'exit', x: 18, y: 6, to: 'hall', tx: 2, ty: 6, when: A => A.has('key') || A.flag('hall'), locked: 'باب قاعة النرد مقفل… المفتاح في صندوق الورشة.' },
        { id: 's1', kind: 'star', x: 7, y: 1 }, { id: 's2', kind: 'star', x: 12, y: 10 }, { id: 's3', kind: 'star', x: 17, y: 8 }
      ],
      on: {
        masoud: async A => {
          if (A.flag('met')) return A.say([{ who: 'masoud', text: (A.goal() || {}).hint || 'بالتوفيق يا بطل!' }]);
          await A.say([
            { who: 'masoud', text: 'أهلاً يا بطل! صنعتُ كأس المهرجان وخبأته في قاعة النرد، ومفتاحها في ورشتي على الجزيرة الشرقية.' },
            { who: 'masoud', text: 'لكن ركبتي تؤلمني ولا أستطيع القفز على النطّاطات. كل نطّاطة تقذفك ثلاث خطوات في اتجاه سهمها.' },
            { who: 'masoud', text: 'والنطّاطة الزرقاء على الجزيرة الوسطى تدور بهذه الذراع الزرقاء. فكّر إلى أين تريد أن تقفز قبل أن تقف عليها!' }
          ]); A.flag('met', true);
        }
      },
      onLever: (A, e) => { A.set('j7', { d: e.on ? 0 : 1 }); A.toast(e.on ? '🔵 النطّاطة الزرقاء تشير الآن شرقاً' : '🔵 النطّاطة الزرقاء تشير الآن جنوباً'); },
      tick: A => bounce(A)
    },
    hall: {
      theme: 'kitchen', map: rows(HL), dark: 0,
      enter: A => { if (!A.flag('hall')) { A.flag('hall', true); A.say([{ who: 'muhannad', text: 'جئت! أنا مهند، أساعد العم مسعود. باب الجائزة لا يُفتح إلا إذا وقف كل حجر نرد على لوحته.' }, { who: 'muhannad', text: 'والمهم: العدد المرسوم على اللوحة يجب أن يكون الوجه الأعلى للحجر. والحجر يتدحرج على حافته، فيتغير وجهه الأعلى مع كل دفعة!' }]); } },
      ents: [
        ...Object.entries(PLATES).map(([id, [x, y, need]]) => ({ id, kind: 'plate', x, y, need })),
        ...Object.entries(DICE).map(([id, d]) => ({ id, kind: 'block', x: d.x, y: d.y, die: { ...d.die } })),
        { id: 'gate', kind: 'gate', x: 7, y: 2, when: A => A.flag('open'), openMsg: '🔓 انفتح باب الجائزة!' },
        { id: 'prize', kind: 'chest', x: 7, y: 1 },
        { id: 'muhannad', kind: 'npc', who: 'muhannad', x: 1, y: 9, face: 'right' },
        { id: 'reset', kind: 'lever', x: 14, y: 10, color: '#F59E0B' },
        { id: 'sg2', kind: 'sign', x: 1, y: 4, text: 'قاعة النرد: «الحجر الأيسر على لوحة الستة، والأيمن على لوحة الأربعة». والذراع البرتقالية تعيد الحجرين إلى مكانهما.' },
        { id: 'back', kind: 'exit', x: 1, y: 6, to: 'pond', tx: 17, ty: 6 },
        { id: 's4', kind: 'star', x: 14, y: 3 }, { id: 's5', kind: 'star', x: 1, y: 10 }
      ],
      on: {
        muhannad: A => A.say([{ who: 'muhannad', text: A.flag('open') ? 'انفتح الباب! الكأس في الصندوق.' : `${onPlate(A).filter(Boolean).length ? 'حجر في مكانه! ' : ''}${(A.goal() || {}).hint || ''}` }]),
        prize: async A => {
          if (A.flag('done')) return;
          A.set('prize', { open: true }); A.give('cup'); A.flag('done', true); A.sfx('win'); A.shake(.3); A.sparkle(7, 1, '#FACC15');
          await A.say([{ who: 'narrator', text: 'لمع كأس المهرجان الذهبي تحت أضواء القاعة.' },
            { who: 'muhannad', text: 'حلّلت لغز العم مسعود! كل دفعة غيّرت الوجه الأعلى، وأنت خطّطت لها.' },
            { who: 'narrator', text: 'وفي الساحة، ارتفعت الألعاب النارية فوق العجلة الدوّارة، وصفّق الزوار للبطل الذي أعاد الكأس.' }]);
          A.complete();
        }
      },
      onLever: A => { Object.entries(DICE).forEach(([id, d]) => A.set(id, { x: d.x, y: d.y, die: { ...d.die } })); A.set('reset', { on: false }); A.toast('🔄 عاد حجرا النرد إلى مكانهما'); },
      tick: A => { if (!A.flag('open') && onPlate(A).every(Boolean)) { A.flag('open', true); A.sfx('win'); A.sparkle(7, 2, '#FACC15'); A.say([{ who: 'muhannad', text: 'ستة وأربعة! انفتح باب الجائزة!' }]); } }
    }
  }
};

/* النطّاطة: حين يصل البطل إليها من بلاطة أخرى تقذفه ثلاث بلاطات في اتجاه سهمها (وتتصل القفزات إن هبط على نطّاطة) */
let air = false, lastT = null;   // في الهواء الآن، وآخر بلاطة فُحصت (لا تُحفظ: تُصفَّر عند دخول البركة)
function bounce(A) {
  if (air || A.busy()) return; const h = A.hero(), k = h.x + ',' + h.y;   // بعد أن يكمل البطل خطوته إلى وسط البلاطة
  if (lastT === k) return; lastT = k;
  const sp = SPRINGS.find(([id, x, y]) => x === h.x && y === h.y); if (!sp) return;
  const e = A.ent(sp[0]), [dx, dy] = DV[e.d || 0], tx = h.x + dx * JUMP, ty = h.y + dy * JUMP;
  if (A.blockedAt(tx, ty)) { A.toast('🚧 مكان الهبوط مسدود'); return; }
  A.sfx('jump'); if (!A.flag('jumped')) { A.flag('jumped', true); A.toast('🤸 قفزة! النطّاطة تقذفك ثلاث خطوات'); }
  air = true; A.jump(tx, ty).then(() => { air = false; A.sfx('drop'); A.shake(.15); });
}
