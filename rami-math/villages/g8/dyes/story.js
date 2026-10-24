// مغامرة مصبغة الألوان: «ثوب العرس الضائع» (الصف الثامن، الوحدة ٩) — بمحرك المغامرات، وبآليتين جديدتين لم تُستعملا قبلها:
// «أحواض الصبغ»: يخطو البطل في حوض فيأخذ ثوبه لونه، والألوان الأساسية تختلط (أحمر وأصفر = برتقالي، أزرق وأصفر = أخضر، أحمر وأزرق = بنفسجي،
// والثلاثة معاً = بنّي عكر)، ونافورة الغسل تعيده أبيض؛ و«ستائر الحرير»: لا يعبر الستارة إلا من ثوبه بلونها. وفي كل غرفة «باب خدمة»
// يعيد البطل إلى البهو حتى لا يُحبس. الطريق: برتقالي ← أزرق ← أخضر ← بنفسجي إلى صندوق الثوب.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── دار الصبغ (١٨×١٣): أربع غرف من الغرب إلى الشرق تفصلها جدران بستائر، والرابعة مقسومة بستارة بنفسجية إلى حجرة الثوب شمالاً ── */
const DH = grid(18, 13); rect(DH, 1, 1, 4, 11, '.'); rect(DH, 6, 1, 8, 11, '.'); rect(DH, 10, 1, 12, 11, '.'); rect(DH, 14, 6, 16, 11, '.'); rect(DH, 14, 1, 16, 4, '.');
[[5, 6], [9, 6], [13, 8], [15, 5]].forEach(([x, y]) => { DH[y][x] = '.'; });
export const COL = { r: '#DC2626', b: '#2563EB', y: '#FACC15', ry: '#F97316', by: '#16A34A', rb: '#7C3AED', rby: '#7C5A3A' };
export const NAME = { r: 'أحمر', b: 'أزرق', y: 'أصفر', ry: 'برتقالي', by: 'أخضر', rb: 'بنفسجي', rby: 'بنّي عكر' };
const POOLS = [['pr1', 2, 3, 'r'], ['py1', 2, 9, 'y'], ['pw1', 1, 6, 'w'], ['pb2', 7, 2, 'b'], ['pw2', 7, 10, 'w'], ['py3', 11, 10, 'y'], ['pw3', 11, 2, 'w'], ['pr4', 16, 10, 'r'], ['pb4', 14, 10, 'b'], ['pw4', 16, 7, 'w']];
const CURT = [['c1', 5, 6, 'ry'], ['c2', 9, 6, 'b'], ['c3', 13, 8, 'by'], ['c4', 15, 5, 'rb']];
const key = A => A.flag('dye') || '';
const tintOf = A => { const k = key(A); return k ? COL[k] : null; };

const DYER = { kind: 'woman', skin: '#B5835A', robe: '#7C2D12', accent: '#FDE68A', elder: true, apron: '#7C3AED' };
const GHALIB = { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#DC2626', beard: '#D6D3D1', elder: true, apron: '#7C3AED' };

export default {
  id: 'g8dyes', title: 'ثوب العرس الضائع', icon: '👘', stars: 4,
  start: { area: 'dyehouse', x: 3, y: 7 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  tint: tintOf,
  items: { robe: { icon: '👘', name: 'ثوب العرس المطرّز' } },
  cast: { ghalib: { name: 'الصبّاغ غالب', look: GHALIB }, salma: { name: 'الجدة سلمى', look: DYER } },
  goals: [
    { text: 'تحدّث مع الصبّاغ غالب', done: A => A.flag('met'), at: () => ({ area: 'dyehouse', id: 'ghalib' }), hint: 'غالب في بهو دار الصبغ.' },
    { text: 'اعبر الستارة البرتقالية', done: A => A.flag('r2'), at: () => ({ area: 'dyehouse', id: 'c1' }), hint: 'لا يوجد حوض برتقالي! أي لونين يصنعان البرتقالي؟' },
    { text: 'اعبر الستارتين الزرقاء والخضراء', done: A => A.flag('r4'), at: A => A.flag('r3') ? { area: 'dyehouse', id: 'c3' } : { area: 'dyehouse', id: 'c2' }, hint: 'ثوبك برتقالي الآن… كيف يصير أزرق صافياً؟ وبعدها: ماذا تضيف إلى الأزرق ليصير أخضر؟' },
    { text: 'اعبر الستارة البنفسجية وخذ ثوب العرس', done: A => A.has('robe'), at: () => ({ area: 'dyehouse', id: 'chest' }), hint: 'البنفسجي من الأحمر والأزرق. وإن عكرت الألوان فالنافورة تغسلها.' },
    { text: 'أعد الثوب إلى الجدة سلمى', done: A => A.flag('done'), at: () => ({ area: 'dyehouse', id: 'salma' }), hint: 'الجدة سلمى في البهو.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'غداً عرس في القرية، وثوب العروس المطرّز في دار الصبغ القديمة.' },
    { who: 'narrator', text: 'لكن جدّ غالب حمى الدار بستائر حرير سحرية: لا يعبر الستارة إلا من ثوبه بلونها!' },
    { who: 'hero', text: 'لأسأل الصبّاغ غالب.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).dyesHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «سيد الألوان»'],
  areas: {
    dyehouse: {
      theme: 'kitchen', map: rows(DH), dark: 0,
      enter: () => { lastT = null; },
      ents: [
        ...POOLS.map(([id, x, y, c]) => ({ id, kind: 'dyepool', x, y, dye: c, col: c === 'w' ? 'wash' : COL[c] })),
        ...CURT.map(([id, x, y, c]) => ({ id, kind: 'curtain', x, y, col: COL[c], dye: c })),
        { id: 'ghalib', kind: 'npc', who: 'ghalib', x: 3, y: 5, face: 'down', mark: A => A.flag('met') ? null : '!' },
        { id: 'salma', kind: 'npc', who: 'salma', x: 1, y: 10, face: 'right', mark: A => A.has('robe') && !A.flag('done') ? '!' : null },
        { id: 'sg1', kind: 'sign', x: 4, y: 1, text: 'وصية الجد: «الأحمر والأصفر برتقال، والأزرق والأصفر زرع أخضر، والأحمر والأزرق بنفسج. والنافورة تغسل كل شيء».' },
        { id: 'chest', kind: 'chest', x: 15, y: 1, item: 'robe' },
        { id: 'back2', kind: 'exit', x: 6, y: 11, to: 'dyehouse', tx: 3, ty: 9 }, { id: 'back3', kind: 'exit', x: 12, y: 11, to: 'dyehouse', tx: 3, ty: 9 }, { id: 'back4', kind: 'exit', x: 14, y: 11, to: 'dyehouse', tx: 3, ty: 9 },
        { id: 's1', kind: 'star', x: 1, y: 1 }, { id: 's2', kind: 'star', x: 8, y: 11 }, { id: 's3', kind: 'star', x: 12, y: 1 }, { id: 's4', kind: 'star', x: 16, y: 3 }
      ],
      on: {
        ghalib: async A => {
          if (A.flag('met')) return A.say([{ who: 'ghalib', text: (A.goal() || {}).hint || 'بالتوفيق!' }]);
          await A.say([
            { who: 'ghalib', text: 'أهلاً يا بطل! ثوب العرس في صندوق آخر حجرة، خلف أربع ستائر حرير.' },
            { who: 'ghalib', text: 'الستارة لا تفتح لأحد إلا لمن ثوبه بلونها. اخطُ في حوض فيصير ثوبك بلونه، وإن خطوت في حوضين اختلط اللونان!' },
            { who: 'ghalib', text: 'والنافورة الزرقاء الفاتحة تغسل ثوبك أبيض. وفي كل غرفة باب خدمة يعيدك إلى هنا إن احتجت.' }
          ]); A.flag('met', true);
        },
        salma: async A => {
          if (!A.has('robe')) return A.say([{ who: 'salma', text: 'ثوب حفيدتي في آخر الدار… ستائر جدّ غالب تحرسه منذ خمسين سنة.' }]);
          if (A.flag('done')) return;
          A.flag('done', true); A.sfx('win'); A.shake(.3); A.sparkle(1, 10, '#FACC15');
          await A.say([{ who: 'salma', text: 'ثوب العرس! ما أجمل ألوانه… كما صبغه جدّ غالب تماماً.' },
            { who: 'ghalib', text: 'عرفت سرّ الألوان: لونان أساسيان بنسبة واحدة يصنعان لوناً جديداً.' },
            { who: 'narrator', text: 'وفي الغد لبست العروس الثوب المطرّز، وزيّنت القرية حبالها بأقمشة المصبغة الملوّنة.' }]);
          A.complete();
        }
      },
      tick: A => dyeStep(A)
    }
  }
};

/* حين يكمل البطل خطوته إلى وسط حوض: يضيف لونه إلى ثوبه (أو يغسله)، ويُعلَم عبور الستائر */
let lastT = null;
function dyeStep(A) {
  if (A.busy()) return; const h = A.hero(), k = h.x + ',' + h.y; if (lastT === k) return; lastT = k;
  if (h.x >= 6 && h.x <= 8) A.flag('r2', true); if (h.x >= 10 && h.x <= 12) A.flag('r3', true); if (h.x >= 14 && h.y >= 6) A.flag('r4', true);
  const p = POOLS.find(([id, x, y]) => x === h.x && y === h.y); if (!p) return;
  const c = p[3], cur = key(A);
  if (c === 'w') { if (cur) { A.flag('dye', ''); A.sfx('drop'); A.toast('💧 غسلت ثوبك: صار أبيض'); } return; }
  if (cur.includes(c)) return;
  const nx = ['r', 'b', 'y'].filter(q => cur.includes(q) || q === c).join('');
  A.flag('dye', nx); A.sfx('pick'); A.sparkle(h.x, h.y, COL[nx]);
  A.toast(nx === 'rby' ? '🟤 اختلطت الألوان الثلاثة: صار ثوبك بنّياً عكراً… اغسله في النافورة' : `🎨 صار ثوبك ${NAME[nx]}`);
}
