// مغامرة مصنع التغليف: «يوم العطل الكبير» (الصف الثامن، الوحدة ٣) — بمحرك المغامرات، وبآليتين جديدتين لم تُستعملا من قبل:
// سيور ناقلة تحمل البطل في اتجاهها (لا يمشي عكسها)، ولوحتا تحكم تقلبان اتجاه السيرين؛ وبرمجة الروبوت «رقيم»: يكتب الطالب برنامجاً
// من أوامر اتجاه، وكل أمر يجعل رقيم ينزلق حتى يصطدم بشيء، والهدف أن يصل إلى المصهر الرئيسي بين الرفوف الضيقة.
// صباح يوم المهرجان، وطلبية صناديق الهدايا متوقفة لأن المصنع تعطّل.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── أرض المصنع (٢٤×١٤): ممران من السيور يقطعان القاعة طولاً، وغرفة التحكم شرقاً ── */
const F = grid(24, 14); rect(F, 1, 1, 22, 12, '.');
const LANE_A = [], LANE_B = []; for (let y = 1; y <= 12; y++) { for (let x = 6; x <= 8; x++) LANE_A.push([x, y]); for (let x = 14; x <= 16; x++) LANE_B.push([x, y]); }
/* ── غرفة التحكم (١٨×١٢): حظيرة رفوف ضيقة يتحرك فيها رقيم وحده ── */
const C = grid(18, 12); rect(C, 1, 1, 16, 10, '.'); rect(C, 4, 2, 12, 9, '#'); rect(C, 5, 3, 11, 8, '.');
const PEN = ['...X..F', '.X.X.X.', '.X...X.', '.XXX.X.', '...X...', 'R..X.X.'];   // x٥..١١، y٣..٨
const SHELVES = [], FUSE = [11, 3], RSTART = [5, 8];
PEN.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'X') SHELVES.push([5 + i, 3 + j]); }));

const SUAD = { kind: 'woman', skin: '#C99A72', robe: '#C2410C', accent: '#FB923C', vest: '#FACC15' };
const TARIQ = { kind: 'man', skin: '#B88660', robe: '#F2EEE4', accent: '#1E3A8A', beard: '#2B2118', glasses: true };
const HIND = { kind: 'woman', skin: '#B5835A', robe: '#334155', accent: '#0EA5E9', vest: '#FACC15' };
const DIRS = { '⬆': [0, -1], '⬇': [0, 1], '⬅': [-1, 0], '➡': [1, 0] };

export default {
  id: 'g8packing', title: 'يوم العطل الكبير', icon: '⚙️', stars: 5,
  start: { area: 'floor', x: 2, y: 7 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { fuse: { icon: '🔌', name: 'المصهر الرئيسي' }, card: { icon: '🪪', name: 'بطاقة غرفة التحكم' } },
  cast: { suad: { name: 'المشرفة سعاد', look: SUAD }, tariq: { name: 'المهندس طارق', look: TARIQ }, hind: { name: 'الفنية هند', look: HIND } },
  goals: [
    { text: 'تحدّث مع المشرفة سعاد', done: A => A.flag('met'), at: () => ({ area: 'floor', id: 'suad' }), hint: 'سعاد قرب المدخل.' },
    { text: 'اقلب اتجاه السير الأول من لوحته واعبره', done: A => A.flag('crossA'), at: A => ({ area: 'floor', id: A.ent('cA') && A.ent('cA').d === 0 ? 'cA' : 'cA' }), hint: 'السير يحملك في اتجاه أسهمه. اجعل أسهمه نحو الشرق ثم قف عليه.' },
    { text: 'اقلب السير الثاني واعبره إلى غرفة التحكم', done: A => A.flag('control'), at: () => ({ area: 'floor', id: 'toCtrl' }), hint: 'لوحة السير الثاني بين السيرين.' },
    { text: 'برمج الروبوت رقيم ليصل إلى المصهر بين الرفوف', done: A => A.has('fuse') || A.flag('fixed'), at: () => ({ area: 'control', id: 'prog' }), hint: 'كل أمر يجعل رقيم ينزلق حتى يصطدم برف أو جدار. فكّر أين يتوقف بعد كل أمر.' },
    { text: 'ركّب المصهر في اللوحة الرئيسية', done: A => A.flag('fixed'), at: () => ({ area: 'control', id: 'main' }), hint: 'اللوحة الرئيسية في شمال الغرفة.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'صباح يوم المهرجان… وفي مصنع التغليف صمتٌ غريب: السيور متوقفة، والآلات مطفأة.' },
    { who: 'narrator', text: 'وطلبية صناديق الهدايا لأطفال القرية يجب أن تخرج قبل الظهر!' },
    { who: 'hero', text: 'لنكتشف ما الذي تعطّل.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).factoryFixer = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «مُصلح المصنع»'],
  areas: {
    floor: {
      theme: 'ruins', map: rows(F), dark: .12,
      enter: A => { A.S.flags.weather = { dark: .12 }; },
      ents: [
        { id: 'suad', kind: 'npc', who: 'suad', x: 3, y: 4, face: 'down', mark: A => A.flag('met') ? null : '!' },
        { id: 'hind', kind: 'npc', who: 'hind', x: 11, y: 10, face: 'left' },
        ...LANE_A.map(([x, y], i) => ({ id: 'ba' + i, kind: 'belt', x, y, d: 2, col: '#FACC15' })),
        ...LANE_B.map(([x, y], i) => ({ id: 'bb' + i, kind: 'belt', x, y, d: 2, col: '#22D3EE' })),
        { id: 'cA', kind: 'console', x: 4, y: 2, color: '#FACC15' }, { id: 'cB', kind: 'console', x: 11, y: 2, color: '#22D3EE' },
        { id: 'sg1', kind: 'sign', x: 5, y: 11, text: 'السيور تحمل كل ما يقف عليها في اتجاه أسهمها. لوحة كل سير تقلب اتجاهه.' },
        ...[[2, 1], [2, 12], [10, 1], [12, 12], [19, 1], [21, 12]].map(([x, y], i) => ({ id: 'cr' + i, kind: i % 2 ? 'crates' : 'barrel', x, y })),
        ...[[18, 4], [18, 9], [20, 4], [20, 9]].map(([x, y], i) => ({ id: 'mc' + i, kind: 'container', deco: true, x, y, color: ['#E11D48', '#2563EB', '#16A34A', '#7C3AED'][i] })),
        { id: 'pl1', kind: 'pillar', x: 10, y: 6 }, { id: 'pl2', kind: 'pillar', x: 12, y: 7 },
        { id: 'tA', kind: 'trigger', x: 9, y: 7, run: A => A.flag('crossA', true) }, ...[[9, 3], [9, 5], [9, 9], [9, 11], [10, 4], [10, 9], [11, 6]].map(([x, y], i) => ({ id: 'tA' + i, kind: 'trigger', x, y, run: A => A.flag('crossA', true) })),
        { id: 'toCtrl', kind: 'exit', x: 22, y: 7, to: 'control', tx: 2, ty: 5 },
        { id: 's1', kind: 'star', x: 1, y: 12 }, { id: 's2', kind: 'star', x: 12, y: 1 }
      ],
      on: {
        suad: async A => {
          if (A.flag('met')) return A.say([{ who: 'suad', text: ((A.goal() || {}).hint || 'بالتوفيق!') }]);
          await A.say([
            { who: 'suad', text: 'الحمد لله أنك جئت! انقطع التيار عن المصنع كله، والمصهر الرئيسي احترق.' },
            { who: 'suad', text: 'المصهر الاحتياطي في غرفة التحكم شرقاً… لكن السيور بيننا وبينها تعمل بالاتجاه المعاكس!' },
            { who: 'suad', text: 'لكل سير لوحة تقلب اتجاهه. قف على السير حين تشير أسهمه نحو الشرق، فيحملك.' }
          ]); A.flag('met', true);
        },
        hind: A => A.say([{ who: 'hind', text: A.flag('crossA') ? 'أحسنت! لوحة السير الأزرق هناك، قرب الجدار الشمالي.' : 'إن وقفت على سير يتجه غرباً أعادك إلى البداية… جرّب لوحته أولاً.' }]),
        cA: A => flip(A, 'ba', LANE_A.length, 'السير الأصفر'), cB: A => flip(A, 'bb', LANE_B.length, 'السير الأزرق')
      },
      tick: (A, dt) => belts(A, dt)
    },
    control: {
      theme: 'ruins', map: rows(C), dark: .1,
      enter: A => { A.S.flags.weather = { dark: .1 }; if (!A.flag('control')) { A.flag('control', true); A.say([{ who: 'tariq', text: 'وصلت! المصهر الاحتياطي هناك بين الرفوف الضيقة… لا يدخلها إلا الروبوت رقيم.' }, { who: 'tariq', text: 'رقيم ينزلق في الاتجاه الذي تأمره به حتى يصطدم بشيء. اكتب له برنامجاً من لوحته.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 1, y: 5, to: 'floor', tx: 21, ty: 7 },
        { id: 'tariq', kind: 'npc', who: 'tariq', x: 14, y: 6, face: 'left' },
        { id: 'prog', kind: 'console', x: 3, y: 9, color: '#22D3EE' }, { id: 'main', kind: 'console', x: 8, y: 1, color: '#EF4444' },
        { id: 'robot', kind: 'robot', x: RSTART[0], y: RSTART[1] },
        ...SHELVES.map(([x, y], i) => ({ id: 'sh' + i, kind: 'crates', x, y })),
        { id: 'fuseItem', kind: 'beacon', x: FUSE[0], y: FUSE[1], lit: true },
        { id: 'sgP', kind: 'sign', x: 2, y: 9, text: 'برنامج رقيم: أوامر اتجاه بالترتيب. كل أمر = انزلاق حتى أول عائق.' },
        { id: 's3', kind: 'star', x: 15, y: 1 }, { id: 's4', kind: 'star', x: 1, y: 10 }, { id: 's5', kind: 'star', x: 16, y: 10 }
      ],
      on: {
        tariq: A => A.say([{ who: 'tariq', text: A.has('fuse') ? 'المصهر معك! ركّبه في اللوحة الحمراء الرئيسية.' : 'انظر إلى الحظيرة من فوق: أين يتوقف رقيم إذا انزلق إلى الأعلى أولاً؟' }]),
        prog: A => program(A),
        main: async A => {
          if (A.flag('fixed')) return; if (!A.has('fuse')) return A.say([{ who: 'narrator', text: 'اللوحة الرئيسية بلا مصهر… المصهر الاحتياطي بين الرفوف.' }]);
          A.take('fuse'); A.flag('fixed', true); A.sfx('win'); A.shake(.5); A.weather({ dark: 0 });
          await A.say([{ who: 'narrator', text: 'تك… ثم هدير الآلات! عادت الأضواء، ودارت السيور، وبدأت صناديق الهدايا تخرج ملوّنة.' },
            { who: 'suad', text: 'الطلبية ستصل قبل الظهر! أطفال القرية سيفرحون بهداياهم.' }, { who: 'tariq', text: 'وأنت علّمت رقيم برنامجاً جديداً… سنسمّيه «برنامج البطل».' }]);
          A.complete();
        }
      }
    }
  }
};

/* لوحة السير: تقلب اتجاه أسهم سيرها كلها (شرق ⇄ غرب) */
function flip(A, pre, n, name) {
  const d0 = A.ent(pre + '0').d, d = d0 === 2 ? 0 : 2;
  for (let i = 0; i < n; i++) { const e = A.ent(pre + i); if (e) { e.d = d; } } A.set(pre + '0', { d });
  for (let i = 1; i < n; i++) A.ent(pre + i).d = d;
  A.sfx('engine'); A.toast(`⚙️ ${name} يتجه الآن ${d === 0 ? 'شرقاً ➡' : 'غرباً ⬅'}`); A.save();
}
/* السير يحمل البطل خطوة في اتجاهه كل ٠٫٢٨ ثانية (ويلغي مشيه، فلا يُعبر عكسه) */
function belts(A, dt) {
  // اتجاه السيور محفوظ في أول بلاطة من كل سير
  ['ba', 'bb'].forEach(pre => { const d = A.ent(pre + '0') && A.ent(pre + '0').d; if (d != null) for (let i = 1; i < 36; i++) { const e = A.ent(pre + i); if (e) e.d = d; } });
  const S = A.S, h = A.hero(); const on = ['ba', 'bb'].map(pre => { for (let i = 0; i < 36; i++) { const e = A.ent(pre + i); if (e && e.x === h.x && e.y === h.y) return e; } return null; }).find(Boolean);
  if (!on) { S._belt = 0; return; }
  S._belt = (S._belt || 0) + dt; if (S._belt < .28) return; S._belt = 0;
  const [dx, dy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][on.d || 0];
  if (!A.blockedAt(h.x + dx, h.y + dy)) A.tp(h.x + dx, h.y + dy);
}
/* برمجة رقيم: أوامر اتجاه (حتى ٨)، ثم تشغيل: ينزلق مع كل أمر حتى أول عائق، وإن وصل المصهر حمله وعاد */
async function program(A) {
  if (A.has('fuse') || A.flag('fixed')) return A.toast('🤖 رقيم أنجز مهمته!');
  const prog = [];
  for (;;) {
    const txt = `برنامج رقيم: ${prog.length ? prog.join(' ') : '(فارغ)'}`;
    const opts = ['⬆', '⬇', '⬅', '➡', '▶ شغّل', '↩ امسح آخر أمر'], k = await A.choose(txt, opts, 'narrator');
    if (k <= 3) { if (prog.length < 8) prog.push(opts[k]); else A.toast('📋 البرنامج ممتلئ (٨ أوامر)'); continue; }
    if (k === 5) { prog.pop(); continue; }
    if (!prog.length) { A.toast('📋 أضف أمراً واحداً على الأقل'); continue; }
    break;
  }
  const r = A.ent('robot'); A.sfx('engine');
  for (const cmd of prog) {
    const [dx, dy] = DIRS[cmd];
    for (let s = 0; s < 10; s++) { const nx = r.x + dx, ny = r.y + dy; if (A.tileAt(nx, ny) === '#' || SHELVES.some(([x, y]) => x === nx && y === ny)) break;
      for (let k = 1; k <= 6; k++) { await new Promise(res => setTimeout(res, 28)); r.px = r.x + dx * k / 6; r.py = r.y + dy * k / 6; } r.x = nx; r.y = ny; r.px = r.py = null; }
    A.sfx('drop'); await new Promise(res => setTimeout(res, 150));
    if (r.x === FUSE[0] && r.y === FUSE[1]) { A.set('robot', { x: r.x, y: r.y, carry: true }); A.hide('fuseItem'); A.sparkle(r.x, r.y, '#FACC15'); A.give('fuse');
      await A.say([{ who: 'tariq', text: 'وصل رقيم إلى المصهر! برنامجك صحيح… خذ المصهر.' }]); return; }
  }
  await new Promise(res => setTimeout(res, 300)); A.set('robot', { x: RSTART[0], y: RSTART[1], carry: false }); A.sfx('cough');
  A.toast('🤖 توقف رقيم بعيداً عن المصهر وعاد إلى البداية… تتبّع أين ينزلق بعد كل أمر');
}
