// مغامرة مطبخ الحلوى: «سرّ قِدر الجدة» (الصف الثامن، الوحدة ٤) — بمحرك المغامرات، وبآليتين جديدتين لم تُستعمل في مغامرة قبلها:
// أرض عسل مسكوب يُنزلق عليها البطل حتى يصطدم بصندوق أو جدار (فيخطط طريقه إلى علبة الزعفران وطريق العودة)، وقِدر الجدة:
// ترتيب ثلاثة مكوّنات سرّي تكتشفه بالاستنتاج من فقاعات القدر (ذهبية: مكوّن صحيح في مكانه، بيضاء: صحيح في غير مكانه).
// ليلة العيد، والجدة شيخة نسيت ترتيب وصفتها، وانسكب العسل في المخزن.
import { ar } from '../../../core/util.js';

const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── المخزن (١٦×١٢): العسل يغطي x١..١٤ وy١..٨، وصناديق توقف الانزلاق، والممر السفلي y٩..١٠ ── */
const PN = grid(16, 12); rect(PN, 1, 1, 14, 10, '.');
const CRATES = [[1, 8], [2, 3], [3, 6], [4, 1], [5, 3], [5, 8], [6, 8], [7, 6], [8, 5], [9, 3], [10, 5], [11, 7], [12, 1]];
const SAFFRON = [7, 1];
const HONEY = []; for (let y = 1; y <= 8; y++) for (let x = 1; x <= 14; x++) if (!CRATES.some(([a, b]) => a === x && b === y)) HONEY.push([x, y]);
const HSET = new Set(HONEY.map(([x, y]) => x + ',' + y));
/* ── المطبخ (١٨×١٢) ── */
const KT = grid(18, 12); rect(KT, 1, 1, 16, 10, '.');

const SHEIKHA = { kind: 'woman', skin: '#B88660', robe: '#9D174D', accent: '#FBBF24', elder: true };
const SALIM = { kind: 'man', skin: '#A8764E', robe: '#F8FAFC', accent: '#B45309', beard: '#2B2118' };
const NOURA = { kind: 'girl', skin: '#C68A5B', robe: '#0F766E', accent: '#FDE68A' };
const ING = ['🍯 العسل', '🌹 ماء الورد', '🟡 الزعفران', '🌿 الهيل', '🧈 السمن'];
const ORD = ['الأول', 'الثاني', 'الثالث'];

export default {
  id: 'g8sweets', title: 'سرّ قِدر الجدة', icon: '🍯', stars: 5,
  start: { area: 'kitchen', x: 4, y: 9 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { saffron: { icon: '🟡', name: 'علبة الزعفران' } },
  cast: { sheikha: { name: 'الجدة شيخة', look: SHEIKHA }, salim: { name: 'الطاهي سالم', look: SALIM }, noura: { name: 'نورة', look: NOURA } },
  goals: [
    { text: 'تحدّث مع الجدة شيخة', done: A => A.flag('met'), at: () => ({ area: 'kitchen', id: 'sheikha' }), hint: 'الجدة قرب القدر الكبير.' },
    { text: 'أحضر علبة الزعفران من مخزن العسل', done: A => A.has('saffron') || A.flag('cooked'), at: () => ({ area: 'pantry', id: 'saffron' }), hint: 'على العسل لا تتوقف إلا حين تصطدم بشيء. من أين تستطيع أن تنزلق إلى العلبة مباشرة؟' },
    { text: 'اكتشف ترتيب المكوّنات الثلاثة في قِدر الجدة', done: A => A.flag('cooked'), at: () => ({ area: 'kitchen', id: 'pot' }), hint: 'غيّر شيئاً واحداً في كل محاولة، وانظر كيف تتغير الفقاعات الذهبية والبيضاء.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'ليلة العيد… والمطبخ يفوح برائحة الهيل والورد.' },
    { who: 'narrator', text: 'لكن قِدر الجدة الكبير ما زال فارغاً، والضيوف يصلون مع الفجر!' },
    { who: 'hero', text: 'جدتي تبدو قلقة… لأسألها.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).halwaMaster = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «سيد الحلوى»'],
  areas: {
    kitchen: {
      theme: 'kitchen', map: rows(KT), dark: .05,
      enter: A => { A.S.flags.weather = { dark: .05 }; if (!A.flag('code')) A.flag('code', secret()); },
      ents: [
        { id: 'sheikha', kind: 'npc', who: 'sheikha', x: 6, y: 6, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'salim', kind: 'npc', who: 'salim', x: 12, y: 8, face: 'left' },
        { id: 'noura', kind: 'npc', who: 'noura', x: 3, y: 4, face: 'down' },
        { id: 'pot', kind: 'cauldron', x: 9, y: 5 },
        ...[[2, 1], [4, 1], [6, 1], [11, 1], [13, 1], [15, 1]].map(([x, y], i) => ({ id: 'js' + i, kind: 'jarshelf', x, y })),
        ...[[1, 6], [16, 3]].map(([x, y], i) => ({ id: 'br' + i, kind: 'barrel', x, y })),
        { id: 'note', kind: 'sign', x: 8, y: 9, text: 'ورقة الجدة (بلّلها العسل): «… الزعفران لا يوضع أولاً أبداً …»' },
        { id: 'toPantry', kind: 'exit', x: 16, y: 8, to: 'pantry', tx: 8, ty: 9 },
        { id: 's1', kind: 'star', x: 1, y: 10 }, { id: 's2', kind: 'star', x: 16, y: 10 }
      ],
      on: {
        sheikha: async A => {
          if (A.flag('cooked')) return A.say([{ who: 'sheikha', text: 'أطيب حلوى ذقتها منذ سنين! بارك الله فيك.' }]);
          if (A.flag('met')) return A.say([{ who: 'sheikha', text: ((A.goal() || {}).hint || 'بالتوفيق يا بُني!') }]);
          await A.say([
            { who: 'sheikha', text: 'أهلاً يا حبيبي! حلوى العيد تحتاج ثلاثة مكوّنات أضعها في القدر بترتيب سرّي…' },
            { who: 'sheikha', text: 'لكن ورقة الوصفة تبللت بالعسل، ولم يبقَ منها إلا سطر واحد!' },
            { who: 'sheikha', text: 'وأول ما نحتاجه الزعفران… وعلبته في مخزن العسل شرقاً، والعسل انسكب على أرضه كلها.' },
            { who: 'hero', text: 'سأحضرها يا جدتي، ثم نكتشف الترتيب معاً.' }
          ]); A.flag('met', true);
        },
        salim: A => A.say([{ who: 'salim', text: A.has('saffron') ? 'حين تضع المكوّنات تخبرك الفقاعات: الذهبية مكوّن صحيح في مكانه، والبيضاء مكوّن صحيح في غير مكانه.' : 'دخلتُ المخزن فانزلقتُ حتى اصطدمتُ بالجدار! العسل لا يتركك تتوقف حيث تريد.' }]),
        noura: A => A.say([{ who: 'noura', text: A.flag('cooked') ? 'رائحة الحلوى ملأت الحارة كلها!' : 'جدتي تقول دائماً: من جرّب وتأمّل وصل.' }]),
        pot: A => cook(A)
      }
    },
    pantry: {
      theme: 'kitchen', map: rows(PN), dark: .14,
      enter: A => { A.S.flags.weather = { dark: .14 }; A.S._hp = null; A.S._sd = null; if (!A.flag('pantry')) { A.flag('pantry', true); A.say([{ who: 'narrator', text: 'أرض المخزن تلمع بالعسل… وعلبة الزعفران على الرف البعيد شمالاً.' }, { who: 'hero', text: 'إن خطوتُ على العسل انزلقتُ حتى يوقفني صندوق أو جدار. لأخطط طريقي!' }]); } },
      ents: [
        ...HONEY.map(([x, y], i) => ({ id: 'h' + i, kind: 'honey', x, y })),
        ...CRATES.map(([x, y], i) => ({ id: 'c' + i, kind: i % 4 === 3 ? 'barrel' : 'crates', x, y })),
        { id: 'saffron', kind: 'item', item: 'saffron', x: SAFFRON[0], y: SAFFRON[1], after: A => { A.sparkle(SAFFRON[0], SAFFRON[1], '#FACC15'); A.toast('🟡 وصلتَ إلى علبة الزعفران!'); } },
        { id: 'sg', kind: 'sign', x: 1, y: 10, text: 'تحذير: العسل زلق! من يخطو عليه ينزلق في اتجاهه حتى يصطدم بشيء.' },
        { id: 'jsA', kind: 'jarshelf', x: 14, y: 10 },
        { id: 'back', kind: 'exit', x: 8, y: 10, to: 'kitchen', tx: 15, ty: 8 },
        { id: 's3', kind: 'star', x: 1, y: 1 }, { id: 's4', kind: 'star', x: 14, y: 6 }, { id: 's5', kind: 'star', x: 13, y: 9 }
      ],
      on: {},
      tick: (A, dt) => slide(A, dt)
    }
  }
};

/* الترتيب السرّي: ثلاثة مكوّنات مختلفة، فيها الزعفران وليس أولاً (كما في سطر الوصفة الباقي) */
function secret() {
  for (;;) { const p = [0, 1, 2, 3, 4].sort(() => Math.random() - .5).slice(0, 3); if (p.includes(2) && p[0] !== 2) return p; }
}
/* العسل: إذا دخل البطل بلاطة عسل استمر في اتجاهه خطوة كل ٠٫٠٩ ثانية حتى يصطدم بشيء، ويتوقف على أول أرض جافة */
function slide(A, dt) {
  const S = A.S, h = A.hero(), on = HSET.has(h.x + ',' + h.y);
  if (S._hp && (S._hp[0] !== h.x || S._hp[1] !== h.y)) { const dx = Math.sign(h.x - S._hp[0]), dy = dx ? 0 : Math.sign(h.y - S._hp[1]); S._sd = on ? [dx, dy] : null; }
  S._hp = [h.x, h.y];
  if (!on || !S._sd) { S._st = 0; return; }
  S._st = (S._st || 0) + dt; if (S._st < .09) return; S._st = 0;
  const [dx, dy] = S._sd;
  if (A.blockedAt(h.x + dx, h.y + dy)) { S._sd = null; A.sfx('drop'); return; }
  A.tp(h.x + dx, h.y + dy);
}
/* قِدر الجدة: يختار البطل ثلاثة مكوّنات بالترتيب، وتجيب الفقاعات */
async function cook(A) {
  if (A.flag('cooked')) return A.toast('🍯 الحلوى جاهزة!');
  if (!A.flag('met')) return A.say([{ who: 'narrator', text: 'قِدر كبير فارغ… لعل الجدة تعرف ما ينقصه.' }]);
  if (!A.has('saffron')) return A.say([{ who: 'sheikha', text: 'لا حلوى من غير زعفران يا بُني! علبته في مخزن العسل.' }]);
  const code = A.flag('code') || secret(), tries = A.flag('tries') || [], pick = [];
  const past = tries.slice(-3).map(t => `${t.p.map(i => ING[i].slice(ING[i].indexOf(' ') + 1)).join(' ← ')}: ذهبية ${ar(t.exact)}، بيضاء ${ar(t.near)}`).join(' | ');
  while (pick.length < 3) {
    const left = [0, 1, 2, 3, 4].filter(i => !pick.includes(i)), opts = [...left.map(i => ING[i]), '✖ إلغاء'];
    const k = await A.choose(`المكوّن ${ORD[pick.length]}:${pick.length ? ' (في القدر: ' + pick.map(i => ING[i]).join(' ثم ') + ')' : ''}${past ? ' — محاولاتك: ' + past : ''}`, opts, 'narrator');
    if (k === opts.length - 1) return;
    pick.push(left[k]); A.sfx('drop');
  }
  const exact = pick.filter((v, i) => v === code[i]).length, near = pick.filter(v => code.includes(v)).length - exact;
  tries.push({ p: pick, exact, near }); A.flag('tries', tries);
  A.set('pot', { bub: [...Array(exact).fill('#FACC15'), ...Array(near).fill('#FFFFFF')] }); A.save();
  if (exact === 3) {
    A.take('saffron'); A.flag('cooked', true); A.set('pot', { done: true, bub: ['#FACC15', '#FACC15', '#FACC15'] }); A.sfx('win'); A.sparkle(9, 5, '#FACC15');
    await A.say([{ who: 'narrator', text: 'فاحت رائحة الزعفران والهيل… واكتسبت الحلوى لونها الذهبي اللامع.' },
      { who: 'sheikha', text: 'هذا هو الترتيب! ثلاث فقاعات ذهبية كما كانت أمي تقول.' },
      { who: 'salim', text: `اكتشفته في ${ar(tries.length)} ${tries.length === 1 ? 'محاولة' : tries.length === 2 ? 'محاولتين' : tries.length <= 10 ? 'محاولات' : 'محاولة'}… بالاستنتاج لا بالحظ!` },
      { who: 'sheikha', text: 'سأكتب الوصفة من جديد، وأكتب اسمك بجانبها. عيدك مبارك!' }]);
    return A.complete();
  }
  await A.say([{ who: 'sheikha', text: `ذقتُها… 🫧 ذهبية: ${ar(exact)}، وبيضاء: ${ar(near)}. ${exact + near === 0 ? 'لا شيء من هذه المكوّنات في وصفتي!' : 'قريب… فكّر أيّها تغيّر.'}` }]);
}
