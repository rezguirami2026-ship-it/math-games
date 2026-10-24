// مغامرة ميناء الموازين: «لغز الحاوية الخضراء» (الصف الثامن، الوحدة ٢) — بمحرك المغامرات، وبآليات جديدة لم تُستعمل من قبل:
// المد والجزر (الماء يغطي الممر الطيني ثم ينحسر، والطالب يعبر في وقت الجزر؛ وإن ارتفع الماء وهو في الممر عاد بأمان إلى الرصيف)،
// ولوحات تحكم الرافعة (كل لوحة ترفع حاوية بعينها وتنقلها، فتفتح ممراً في متاهة الحاويات بترتيب صحيح)، واختيار الحاوية الصحيحة من ثلاث.
// الليل في الميناء، ودواء مستوصف القرية في حاوية خضراء ضاعت بين الحاويات، والسفينة تبحر عند الفجر.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── الرصيف ليلاً (٢٦×١٦): بحر شمالاً، رصيف غرباً، ممر طيني يغمره المد، ومكتب الميناء القديم شرقاً ── */
const Q = grid(26, 16, '.'); rect(Q, 0, 0, 25, 2, '~'); rect(Q, 0, 0, 0, 15, '#'); rect(Q, 25, 0, 25, 15, '#'); rect(Q, 0, 15, 25, 15, '#'); Q[15][8] = '.';
const FLATS = []; for (let y = 3; y <= 14; y++) for (let x = 16; x <= 18; x++) FLATS.push([x, y]);
/* ── ساحة الحاويات (٢٤×١٦): ممر رئيسي وثلاث جيوب تُركن فيها الحاويات، وحجرة الحاويات الخضراء ── */
const Yd = grid(24, 16); rect(Yd, 1, 6, 4, 10, '.'); rect(Yd, 1, 8, 22, 8, '.'); rect(Yd, 20, 6, 22, 10, '.');
rect(Yd, 8, 9, 8, 10, '.'); rect(Yd, 14, 6, 14, 7, '.'); rect(Yd, 18, 9, 18, 10, '.'); rect(Yd, 11, 9, 11, 9, '.'); rect(Yd, 16, 7, 16, 7, '.');
/* ── سطح السفينة عند الفجر (١٦×١٠) ── */
const Dk = grid(16, 10, '.'); rect(Dk, 0, 0, 15, 0, '~'); rect(Dk, 0, 9, 15, 9, '~'); rect(Dk, 0, 0, 0, 9, '~'); rect(Dk, 15, 0, 15, 9, '~');

const SAIF = { kind: 'man', skin: '#A8764E', robe: '#F2EEE4', accent: '#1E3A8A', beard: '#E5E5E5', elder: true, hat: 'cap' };
const NAWAL = { kind: 'woman', skin: '#C99A72', robe: '#1E3A8A', accent: '#F59E0B', vest: '#F59E0B' };
const HAMOOD = { kind: 'man', skin: '#B5835A', robe: '#F7F5EF', accent: '#0E7490', apron: '#0E7490', beard: '#2B2118' };
const MOVES = { m1: [[8, 8], [8, 10]], m2: [[14, 8], [14, 6]], m3: [[18, 8], [18, 10]] };   // لكل حاوية متحركة: مكانها في الممر ومكان ركنها
const WALLC = [];   // حاويات ملوّنة على جدران الممر للزينة
for (let x = 5; x <= 19; x++) [7, 9].forEach(y => { if (Yd[y][x] === '#') WALLC.push([x, y]); });
const TIDE = { period: 11, low: 4.6 };   // ثانية: دورة كاملة، ومدة الجزر منها

export default {
  id: 'g8scales', title: 'لغز الحاوية الخضراء', icon: '📦', stars: 5,
  start: { area: 'quay', x: 6, y: 12 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { key: { icon: '🗝️', name: 'مفتاح الرافعات' }, log: { icon: '📒', name: 'سجل الشحنات' } },
  cast: { saif: { name: 'الربّان سيف', look: SAIF }, nawal: { name: 'مشغّلة الرافعة نوال', look: NAWAL }, hamood: { name: 'البائع حمود', look: HAMOOD } },
  goals: [
    { text: 'تحدّث مع الربّان سيف عند الرصيف', done: A => A.flag('met'), at: () => ({ area: 'quay', id: 'saif' }), hint: 'الربّان واقف قرب سفينته.' },
    { text: 'اعبر الممر الطيني وقت الجزر إلى مكتب الميناء القديم', done: A => A.has('key') || A.flag('keyGot'), at: () => ({ area: 'quay', id: 'chest' }), hint: 'انتظر حتى ينحسر الماء عن الممر، ثم اعبر بسرعة.' },
    { text: 'افتح بوابة ساحة الحاويات بالمفتاح', done: A => A.flag('yard'), at: () => ({ area: 'quay', id: 'yardGate' }), hint: 'البوابة في جنوب الرصيف.' },
    { text: 'شغّل لوحات الرافعة لتفتح الممر بين الحاويات', done: A => A.flag('m3moved'), at: A => ({ area: 'yard', id: !A.flag('m1moved') ? 'c1' : !A.flag('m2moved') ? 'c2' : 'c3' }), hint: 'كل لوحة تنقل حاوية واحدة. ابدأ باللوحة القريبة منك.' },
    { text: 'اختر الحاوية الخضراء الصحيحة', done: A => A.flag('found'), at: () => ({ area: 'yard', x: 20, y: 8 }), hint: 'رقم الحاوية مكتوب في سجل الشحنات.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'منتصف الليل في ميناء الموازين. الرافعات نائمة، والموج يضرب الرصيف بهدوء.' },
    { who: 'narrator', text: 'لكن المستوصف ينتظر دواءً جاء في حاوية خضراء… ضاعت بين مئات الحاويات!' },
    { who: 'hero', text: 'السفينة تبحر عند الفجر. يجب أن أجد الحاوية قبل ذلك.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).portHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «بطل الميناء»'],
  areas: {
    quay: {
      theme: 'island', map: rows(Q), dark: .42,
      enter: A => { A.S.flags.weather = { dark: .42 }; A.S.tideT = A.S.tideT || 0; },
      ents: [
        { id: 'saif', kind: 'npc', who: 'saif', x: 6, y: 5, face: 'down', mark: A => A.flag('met') ? null : '!' },
        { id: 'hamood', kind: 'npc', who: 'hamood', x: 11, y: 10, face: 'left' },
        { id: 'b1', kind: 'boat', x: 4, y: 2, sail: true }, { id: 'b2', kind: 'boat', x: 11, y: 2 },
        { id: 'l1', kind: 'beacon', x: 2, y: 4, lit: true }, { id: 'l2', kind: 'beacon', x: 14, y: 4, lit: true }, { id: 'l3', kind: 'beacon', x: 23, y: 4, lit: true },
        { id: 'cr1', kind: 'crates', x: 3, y: 9 }, { id: 'cr2', kind: 'barrel', x: 13, y: 7 }, { id: 'cr3', kind: 'barrel', x: 13, y: 8 },
        { id: 'qc1', kind: 'container', deco: true, x: 2, y: 13, color: '#E11D48' }, { id: 'qc2', kind: 'container', deco: true, x: 3, y: 13, color: '#2563EB' }, { id: 'qc3', kind: 'container', deco: true, x: 12, y: 13, color: '#F59E0B' }, { id: 'qc4', kind: 'container', deco: true, x: 13, y: 13, color: '#16A34A' },
        { id: 'sgT', kind: 'sign', x: 15, y: 11, text: 'تحذير: الممر الطيني يغمره المد. اعبره وقت الجزر فقط، حين ينحسر الماء تماماً.' },
        { id: 'safeQ', kind: 'safe', x: 14, y: 9 }, { id: 'safeE', kind: 'safe', x: 20, y: 9 },
        ...FLATS.map(([x, y], i) => ({ id: 'tw' + i, kind: 'tidewater', x, y })),
        { id: 'office', kind: 'house', x: 20, y: 6, w: 4, h: 2, roof: '#94A3B8' },
        { id: 'chest', kind: 'chest', x: 23, y: 9, item: 'key' },
        { id: 'yardGate', kind: 'gate', x: 8, y: 14, needs: 'key', name: 'بوابة الساحة', locked: 'بوابة ساحة الحاويات مقفلة. المفتاح في مكتب الميناء القديم عبر الممر الطيني.' },
        { id: 'toYard', kind: 'exit', x: 8, y: 15, to: 'yard', tx: 2, ty: 8, when: A => A.has('key') },
        { id: 's1', kind: 'star', x: 1, y: 3 }, { id: 's2', kind: 'star', x: 24, y: 13 }
      ],
      on: {
        saif: async A => {
          if (A.flag('met')) return A.say([{ who: 'saif', text: ((A.goal() || {}).hint || 'بالتوفيق يا بطل!') }]);
          await A.say([
            { who: 'saif', text: 'أنت البطل الذي يتحدث عنه أهل القرية؟ أحتاجك! دواء المستوصف في حاوية خضراء ضاعت في الساحة.' },
            { who: 'saif', text: 'هذا سجل الشحنات: حاويتنا رقمها سبعة. لكن الساحة مقفلة، ومفتاح الرافعات في مكتب الميناء القديم.' },
            { who: 'saif', text: 'الطريق إلى المكتب ممر طيني يغمره المد. انتظر الجزر، ثم اعبر قبل أن يعود الماء!' }
          ]); A.give('log'); A.flag('met', true);
        },
        hamood: A => A.say([{ who: 'hamood', text: A.flag('met') ? 'المد يأتي ويذهب كل بضع ثوانٍ. راقب الماء قبل أن تخطو.' : 'الربّان سيف يبحث عنك قرب السفينة.' }])
      },
      tick: (A, dt) => tide(A, dt)
    },
    yard: {
      theme: 'ruins', map: rows(Yd), dark: .4,
      enter: A => { A.S.flags.weather = { dark: .4 }; if (!A.flag('yard')) { A.flag('yard', true); A.say([{ who: 'narrator', text: 'ساحة الحاويات: جدران من حديد ملوّن، وثلاث حاويات تسد الممر.' }, { who: 'nawal', text: '(عبر اللاسلكي) لكل حاوية لوحة تحكم تنقلها إلى جيب بجانب الممر. ابدأ باللوحة القريبة منك.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 1, y: 8, to: 'quay', tx: 8, ty: 13 },
        { id: 'safeY', kind: 'safe', x: 2, y: 9 },
        ...WALLC.map(([x, y], i) => ({ id: 'wc' + i, kind: 'container', deco: true, x, y, color: ['#E11D48', '#2563EB', '#F59E0B', '#16A34A', '#7C3AED', '#0EA5E9'][(x + y * 3) % 6] })),
        { id: 'm1', kind: 'container', x: 8, y: 8, color: '#DC2626', label: 'أ' }, { id: 'm2', kind: 'container', x: 14, y: 8, color: '#2563EB', label: 'ب' }, { id: 'm3', kind: 'container', x: 18, y: 8, color: '#F59E0B', label: 'ج' },
        { id: 'c1', kind: 'console', x: 3, y: 7, color: '#DC2626' }, { id: 'c2', kind: 'console', x: 11, y: 9, color: '#2563EB' }, { id: 'c3', kind: 'console', x: 16, y: 7, color: '#F59E0B' },
        { id: 'g5', kind: 'container', x: 21, y: 6, color: '#15803D', label: '٥' }, { id: 'g7', kind: 'container', x: 22, y: 8, color: '#16A34A', label: '٧' }, { id: 'g9', kind: 'container', x: 21, y: 10, color: '#22C55E', label: '٩' },
        { id: 's3', kind: 'star', x: 14, y: 7 }, { id: 's4', kind: 'star', x: 1, y: 6 }
      ],
      on: {
        c1: A => moveBox(A, 'm1', 'm1moved', 'الحاوية الحمراء «أ»'), c2: A => moveBox(A, 'm2', 'm2moved', 'الحاوية الزرقاء «ب»'), c3: A => moveBox(A, 'm3', 'm3moved', 'الحاوية الصفراء «ج»'),
        g5: A => wrongBox(A, '٥'), g9: A => wrongBox(A, '٩'),
        g7: async A => {
          if (A.flag('found')) return;
          A.flag('found', true); A.sparkle(22, 8, '#4ADE80'); A.sfx('win');
          await A.say([{ who: 'hero', text: 'الرقم سبعة، كما في سجل الشحنات! هذه حاوية الدواء.' }, { who: 'nawal', text: '(عبر اللاسلكي) أحسنت! سأرفعها بالرافعة الكبيرة إلى السفينة… والفجر يطلع الآن!' }]);
          await A.goto('deck', 8, 6);
          await A.say([
            { who: 'narrator', text: 'أشرقت الشمس على البحر، ونزلت الحاوية الخضراء على سطح السفينة.' },
            { who: 'saif', text: 'في موعدها تماماً! سيصل الدواء إلى المستوصف اليوم.' },
            { who: 'nawal', text: 'لولاك لبقينا نبحث حتى الظهر.' }
          ]);
          A.complete();
        }
      }
    },
    deck: {
      theme: 'camp', map: rows(Dk), dark: .05,
      enter: A => { A.S.flags.weather = { dark: .05 }; },
      ents: [
        { id: 'saifD', kind: 'npc', who: 'saif', x: 6, y: 4, face: 'down' }, { id: 'nawalD', kind: 'npc', who: 'nawal', x: 10, y: 4, face: 'down' },
        { id: 'cargo', kind: 'container', deco: true, x: 8, y: 3, color: '#16A34A', label: '٧' }, { id: 'mast', kind: 'pillar', x: 3, y: 5 }, { id: 'rope', kind: 'barrel', x: 12, y: 7 },
        { id: 's5', kind: 'star', x: 13, y: 2 }
      ]
    }
  }
};

/* المد والجزر: الماء يغطي الممر ثم ينحسر بدورة ثابتة؛ لا يُحفظ (يُحسب من الزمن). إن عاد الماء والبطل في الممر رجع بأمان إلى الرصيف */
function tide(A, dt) {
  const S = A.S; S.tideT = ((S.tideT || 0) + dt) % TIDE.period;
  const low = S.tideT < TIDE.low, was = S._low;
  if (low !== was) { S._low = low; FLATS.forEach((_, i) => { const e = A.ent('tw' + i); if (e) e.hidden = low; });
    if (A.flag('met') && !A.has('key')) A.toast(low ? '🏖️ الماء ينحسر… اعبر الممر الآن!' : '🌊 المد يرتفع! انتظر الجزر التالي'); }
  if (!low) { const h = A.hero(); if (FLATS.some(([x, y]) => x === h.x && y === h.y)) { A.tp(h.x < 17 ? 15 : 19, h.y); A.shake(.3); A.sfx('cough'); A.toast('🌊 ارتفع الماء! عدتَ إلى اليابسة بأمان'); } }
}
/* لوحة الرافعة: ترفع حاويتها وتنقلها بين مكانها في الممر وجيبها (حركة ناعمة)، إلا إن كان البطل في الطريق */
async function moveBox(A, id, flag, name) {
  const e = A.ent(id), [a, b] = MOVES[id], toB = e.x === a[0] && e.y === a[1], [tx, ty] = toB ? b : a, h = A.hero();
  if (h.x === tx && h.y === ty) return A.toast('🚧 ابتعد عن مكان الحاوية أولاً');
  A.sfx('engine'); A.toast(`🏗️ الرافعة ترفع ${name}…`);
  const fx = e.x, fy = e.y;
  for (let k = 1; k <= 20; k++) { await new Promise(r => setTimeout(r, 35)); const u = k / 20; e.lift = Math.sin(u * Math.PI) * 60; e.px = fx + (tx - fx) * u; e.py = fy + (ty - fy) * u; }
  e.lift = 0; e.px = e.py = null; A.set(id, { x: tx, y: ty }); A.shake(.25); A.sfx('drop');
  if (toB) A.flag(flag, true);
}
function wrongBox(A, n) { A.sfx('cough'); return A.say([{ who: 'hero', text: `هذه الحاوية رقمها ${n}… أما سجل الشحنات فيقول إن حاويتنا رقمها سبعة.` }]); }
