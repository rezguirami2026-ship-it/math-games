// مغامرة ميزان الخوارزمي: «مخطوطة الخوارزمي المفقودة» (الصف الثامن، الوحدة ٥) — بمحرك المغامرات، وبآليتين جديدتين لم تُستعملا قبلها:
// باب دار الحكمة مقفل بلوح من ثمانية ألواح حجرية منزلقة (لغز الأرقام ١–٨: يُنزلق لوح مجاور إلى الفراغ حتى تترتب)، و«مصباح الحكمة»
// الذي يُظهر حجارة خطوات خفية فوق بركة الحديقة حوله فقط، فيعبر البطل خطوة خطوة إلى جزيرة المخطوطة.
import { ar } from '../../../core/util.js';

const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── القاعة (١٨×١٢): لوح الألغاز ٣×٣ في x٧..٩ وy٥..٧ حوله ممر، والباب شمالاً ── */
const HL = grid(18, 12); rect(HL, 1, 1, 16, 10, '.');
const BX = 7, BY = 5, SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];
/* ── الحديقة (٢٠×١٤): بركة واسعة، وجزيرة المخطوطة في وسطها ── */
const GD = grid(20, 14); rect(GD, 1, 1, 18, 12, '.'); rect(GD, 2, 3, 17, 10, '~'); rect(GD, 9, 4, 11, 6, '.');
[[1, 2], [18, 2], [1, 7], [18, 8], [3, 12], [16, 12]].forEach(([x, y]) => { GD[y][x] = 'T'; });
const PATH = [[6, 10], [6, 9], [6, 8], [7, 8], [8, 8], [8, 7], [9, 7]];   // الطريق إلى الجزيرة
const DECOY = [[5, 8], [4, 8], [4, 7], [4, 6], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [12, 8]];   // فرعان إلى نجمتين
const STONES = [...PATH, ...DECOY];

const LAYLA = { kind: 'woman', skin: '#C99A72', robe: '#1E3A8A', accent: '#FBBF24', glasses: true };
const YUSUF = { kind: 'man', skin: '#A8764E', robe: '#F8FAFC', accent: '#0F766E', beard: '#E5E5E5', elder: true, glasses: true };

export default {
  id: 'g8khwarizmi', title: 'مخطوطة الخوارزمي المفقودة', icon: '📜', stars: 5,
  start: { area: 'hall', x: 3, y: 9 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { lamp: { icon: '🏮', name: 'مصباح الحكمة' }, book: { icon: '📖', name: 'مخطوطة الجبر والمقابلة' } },
  cast: { layla: { name: 'أمينة المكتبة ليلى', look: LAYLA }, yusuf: { name: 'العالِم يوسف', look: YUSUF } },
  goals: [
    { text: 'تحدّث مع أمينة المكتبة ليلى', done: A => A.flag('met'), at: () => ({ area: 'hall', id: 'layla' }), hint: 'ليلى قرب المدخل.' },
    { text: 'رتّب ألواح الباب من ١ إلى ٨ لتفتحه', done: A => A.flag('solved'), at: () => ({ area: 'hall', id: 't5' }), hint: 'رتّب الصف الأول أولاً، ثم الثاني، ولا تحرّك ما رتّبته إلا مؤقتاً.' },
    { text: 'خذ مصباح الحكمة', done: A => A.has('lamp') || A.flag('found'), at: () => ({ area: 'hall', id: 'lampItem' }), hint: 'المصباح ظهر بعد فتح الباب.' },
    { text: 'اعبر البركة إلى جزيرة المخطوطة', done: A => A.flag('found'), at: () => ({ area: 'garden', id: 'book' }), hint: 'المصباح يُظهر الحجارة القريبة منك فقط: تقدّم خطوة ثم انظر حولك.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'دار الحكمة ليلاً… وقد اختفت المخطوطة الأصلية لكتاب «الجبر والمقابلة»!' },
    { who: 'hero', text: 'لعل أمينة المكتبة تعرف أين أبحث.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).wisdomKeeper = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «حارس الحكمة»'],
  areas: {
    hall: {
      theme: 'ruins', map: rows(HL), dark: .25,
      enter: A => { A.S.flags.weather = { dark: .25 }; if (!A.flag('board')) A.flag('board', scramble()); place(A); },
      ents: [
        { id: 'layla', kind: 'npc', who: 'layla', x: 3, y: 7, face: 'right', mark: A => A.flag('met') ? null : '!' },
        ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: 't' + n, kind: 'tile', label: ar(n), x: BX, y: BY, remote: true, stand: [8, 9] })),
        { id: 'door', kind: 'door', x: 8, y: 2 },
        { id: 'toGarden', kind: 'exit', x: 8, y: 1, to: 'garden', tx: 10, ty: 11 },
        { id: 'lampItem', kind: 'item', item: 'lamp', x: 13, y: 8, hidden: true, after: A => { A.sparkle(13, 8, '#FDE68A'); A.toast('🏮 مصباح الحكمة: يُظهر ما خفي قريباً منك'); } },
        ...[[5, 3], [11, 3], [5, 9], [11, 9]].map(([x, y], i) => ({ id: 'pl' + i, kind: 'pillar', x, y })),
        ...[[1, 1], [16, 1], [1, 10], [16, 10]].map(([x, y], i) => ({ id: 'tw' + i, kind: 'torchw', x, y })),
        { id: 'sg', kind: 'sign', x: 12, y: 4, text: 'لوح الباب: «رتّب الأرقام من ١ إلى ٨، والفراغ في الركن الأخير».' },
        { id: 's1', kind: 'star', x: 15, y: 2 }, { id: 's2', kind: 'star', x: 2, y: 2 }
      ],
      on: {
        layla: async A => {
          if (A.flag('met')) return A.say([{ who: 'layla', text: ((A.goal() || {}).hint || 'بالتوفيق!') }]);
          await A.say([
            { who: 'layla', text: 'المخطوطة نقلها العالِم يوسف إلى جناح الجزيرة في الحديقة ليحميها… ثم أُقفل الباب.' },
            { who: 'layla', text: 'قفل الباب لوح من ثمانية ألواح منزلقة: ينزلق اللوح المجاور للفراغ إليه.' },
            { who: 'layla', text: 'رتّبها من ١ إلى ٨ والفراغ في الركن الأخير، فيُفتح الباب.' }
          ]); A.flag('met', true);
        },
        door: A => A.flag('solved') ? null : A.say([{ who: 'narrator', text: 'الباب مقفل… وأمامه لوح الألغاز.' }]),
        ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map(n => ['t' + n, A => slideTile(A, n)]))
      }
    },
    garden: {
      theme: 'village', map: rows(GD), dark: .55,
      enter: A => { A.S.flags.weather = { dark: .55 }; if (!A.flag('pool')) { A.flag('pool', true); A.say(A.has('lamp') ? [{ who: 'narrator', text: 'بركة واسعة هادئة، وفي وسطها جزيرة عليها جناح صغير.' }, { who: 'hero', text: 'لا جسر… لكن المصباح يرتعش حين أقترب من الماء!' }] : [{ who: 'narrator', text: 'بركة واسعة… ولا طريق إلى الجزيرة.' }]); } },
      ents: [
        ...STONES.map(([x, y], i) => ({ id: 'st' + i, kind: 'stone', x, y })),
        { id: 'pav', kind: 'tent', x: 10, y: 4, color: '#0F766E' },
        { id: 'book', kind: 'item', item: 'book', x: 10, y: 5, after: A => found(A) },
        { id: 'back', kind: 'exit', x: 2, y: 12, to: 'hall', tx: 8, ty: 3 },
        { id: 'yusufG', kind: 'npc', who: 'yusuf', x: 14, y: 12, face: 'left' },
        { id: 's3', kind: 'star', x: 4, y: 6 }, { id: 's4', kind: 'star', x: 12, y: 8 }, { id: 's5', kind: 'star', x: 17, y: 1 }
      ],
      on: { yusufG: A => A.say([{ who: 'yusuf', text: A.flag('found') ? 'أعدتَ المخطوطة! سيقرؤها طلابنا أجيالاً.' : 'نقلتُ المخطوطة إلى الجزيرة… والطريق إليها لا يراه إلا من يحمل المصباح.' }]) },
      tick: A => { const h = A.hero(), lamp = A.has('lamp'); STONES.forEach((_, i) => { const e = A.ent('st' + i); if (e) e.lit = lamp && Math.hypot(e.x - h.x, e.y - h.y) <= 2.5; }); }
    }
  }
};

/* خلط اللوح بحركات صحيحة من الحل (فيبقى قابلاً للحل دائماً) */
function scramble() {
  for (;;) { const b = SOLVED.slice(); let prev = -1;
    for (let k = 0; k < 22; k++) { const z = b.indexOf(0), nb = nbrs(z).filter(q => q !== prev), q = nb[Math.floor(Math.random() * nb.length)]; b[z] = b[q]; b[q] = 0; prev = z; }
    if (b.some((v, i) => v !== SOLVED[i])) return b; }
}
function nbrs(i) { const x = i % 3, y = Math.floor(i / 3), out = []; if (x > 0) out.push(i - 1); if (x < 2) out.push(i + 1); if (y > 0) out.push(i - 3); if (y < 2) out.push(i + 3); return out; }
function place(A) {
  const b = A.flag('board'); b.forEach((n, i) => { if (n) A.set('t' + n, { x: BX + i % 3, y: BY + Math.floor(i / 3), ok: A.flag('solved') }); });
  if (A.flag('solved')) { A.set('door', { open: true }); if (!A.has('lamp') && !A.flag('found')) A.set('lampItem', { hidden: false }); }
}
async function slideTile(A, n) {
  if (A.flag('solved')) return A.toast('✅ اللوح مرتب والباب مفتوح');
  const b = A.flag('board'), i = b.indexOf(n), z = b.indexOf(0);
  if (!nbrs(i).includes(z)) { A.sfx('cough'); return A.toast('🧱 هذا اللوح لا يجاور الفراغ'); }
  const h = A.hero(), zx = BX + z % 3, zy = BY + Math.floor(z / 3);
  if (h.x === zx && h.y === zy) return A.toast('↩ تنحَّ عن الفراغ أولاً');
  const e = A.ent('t' + n), fx = e.x, fy = e.y; A.sfx('drop');
  for (let k = 1; k <= 6; k++) { await new Promise(r => setTimeout(r, 30)); e.px = fx + (zx - fx) * k / 6; e.py = fy + (zy - fy) * k / 6; }
  e.px = e.py = null; b[z] = n; b[i] = 0; A.flag('board', b); A.set('t' + n, { x: zx, y: zy }); A.save();
  if (b.every((v, k) => v === SOLVED[k])) {
    A.flag('solved', true); place(A); A.sfx('win'); A.shake(.4); A.sparkle(8, 2, '#99F6E4');
    await A.say([{ who: 'narrator', text: 'طَق… تحركت الألواح الثمانية معاً، وانفتح الباب!' }, { who: 'layla', text: 'وظهر مصباح الحكمة على منصته! خذه، فلن تعبر البركة من دونه.' }]);
  }
}
async function found(A) {
  A.flag('found', true); A.sparkle(10, 5, '#FDE68A'); A.sfx('win');
  await A.say([{ who: 'narrator', text: 'بين يديك مخطوطة «الجبر والمقابلة»… الكتاب الذي أعطى الجبرَ اسمه.' },
    { who: 'yusuf', text: 'أحسنت يا بُني! رتّبتَ الألواح، وعبرتَ بنور الحكمة. هذه أمانة للأجيال.' }]);
  A.complete();
}
