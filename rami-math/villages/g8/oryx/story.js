// مغامرة محمية المها: «صغير المها التائه» (الصف الثامن، الوحدة ١٥) — بمحرك المغامرات، وبآلية جديدة لم تُستعمل قبلها:
// «جهاز التتبّع»: صغير مها بطوق لاسلكي ضاع في العشب الطويل. لا يُرى، لكن جهاز التتبّع في يد البطل يرسل إشارة كل ثانية: أعمدة الإشارة (١–٥)
// تزيد كلما اقترب البطل وتقل كلما ابتعد، والصفير يسرع. حين تمتلئ الإشارة يجد البطل الصغير ويعيده إلى أمه.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── سهل المحمية (٢٠×١٣): ممر المرشدين غرباً، وعشب طويل وأشجار غاف في الوسط والشرق ── */
const PL = grid(20, 13); rect(PL, 1, 1, 18, 11, '.'); rect(PL, 6, 1, 18, 11, ';');
[[8, 3], [11, 7], [14, 2], [16, 9], [9, 10], [13, 5], [17, 5], [7, 6]].forEach(([x, y]) => { PL[y][x] = 'T'; });
export const CALF = [16, 3];
const bars = A => { const h = A.hero(), d = Math.abs(h.x - CALF[0]) + Math.abs(h.y - CALF[1]); return Math.max(1, Math.min(5, 6 - Math.ceil(d / 3))); };
const SALMA = { kind: 'woman', skin: '#C99A72', robe: '#4D7C0F', accent: '#FDE68A', hat: 'straw' };

export default {
  id: 'g8oryx', title: 'صغير المها التائه', icon: '🦌', stars: 3,
  start: { area: 'plain', x: 2, y: 9 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { tracker: { icon: '📡', name: 'جهاز التتبّع' } },
  cast: { salma: { name: 'الحارسة سلمى', look: SALMA } },
  goals: [
    { text: 'تحدّث مع الحارسة سلمى', done: A => A.flag('met'), at: () => ({ area: 'plain', id: 'salma' }), hint: 'سلمى عند ممر المرشدين.' },
    { text: 'ابحث عن الصغير بجهاز التتبّع', done: A => A.flag('found'), at: () => ({ area: 'plain', id: 'salma' }), hint: 'راقب أعمدة الإشارة: إن زادت فأنت تقترب، وإن نقصت فارجع وجرّب اتجاهاً آخر.' },
    { text: 'أخبر سلمى أنك وجدته', done: A => A.flag('done'), at: () => ({ area: 'plain', id: 'salma' }), hint: 'عُد إلى سلمى.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'في الصباح عدّت الحارسة سلمى قطيع المها… فنقص واحد: الصغير ذو الطوق اللاسلكي.' },
    { who: 'narrator', text: 'العشب طويل هذا الموسم، والصغير يختبئ فيه ولا يُرى.' },
    { who: 'hero', text: 'لأسأل الحارسة سلمى.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).oryxHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «حارس المحمية»'],
  areas: {
    plain: {
      theme: 'village', map: rows(PL), dark: 0,
      enter: () => { acc = 0; },
      ents: [
        { id: 'calf', kind: 'animal', creature: 'goat', x: CALF[0], y: CALF[1], hidden: true },
        { id: 'mother', kind: 'animal', creature: 'goat', x: 2, y: 3 },
        { id: 'salma', kind: 'npc', who: 'salma', x: 3, y: 6, face: 'right', mark: A => !A.flag('met') || (A.flag('found') && !A.flag('done')) ? '!' : null },
        { id: 'sg', kind: 'sign', x: 4, y: 1, text: 'محمية المها: «لا تُخِف المها. امشِ بهدوء في العشب الطويل».' },
        { id: 's1', kind: 'star', x: 18, y: 11 }, { id: 's2', kind: 'star', x: 6, y: 1 }, { id: 's3', kind: 'star', x: 12, y: 11 }
      ],
      on: {
        salma: async A => {
          if (A.flag('found') && !A.flag('done')) { A.flag('done', true); A.sfx('win'); A.sparkle(2, 3, '#FACC15');
            await A.say([{ who: 'salma', text: 'وجدته! الحمد لله… انظر كيف ركض إلى أمه.' }, { who: 'salma', text: 'جهاز التتبّع لا يعطي المكان، بل يقول: أقرب أم أبعد. وأنت قارنت الإشارات حتى وصلت.' }, { who: 'narrator', text: 'وفي المساء سجّلت سلمى القطيع كاملاً في جدولها التكراري.' }]); return A.complete(); }
          if (A.flag('met')) return A.say([{ who: 'salma', text: (A.goal() || {}).hint || '' }]);
          await A.say([{ who: 'salma', text: 'أهلاً! صغير المها ضاع في العشب الطويل، وأمه هنا قلقة عليه.' }, { who: 'salma', text: 'خذ جهاز التتبّع: كلما اقتربت من طوقه زادت أعمدة الإشارة وأسرع الصفير.' }]);
          A.give('tracker'); A.flag('met', true);
        }
      },
      tick: (A, dt) => track(A, dt)
    }
  }
};

/* إشارة التتبّع كل ثانية، والعثور حين يقف البطل بجانب الصغير */
let acc = 0;
function track(A, dt) {
  if (!A.has('tracker') || A.flag('found')) return; acc += dt; const b = bars(A), per = 1.6 - b * .22; if (acc < per) return; acc = 0;
  A.sfx('pick'); A.toast(`📡 ${'▮'.repeat(b)}${'▯'.repeat(5 - b)}`);
  const h = A.hero(); if (Math.abs(h.x - CALF[0]) + Math.abs(h.y - CALF[1]) <= 1) { A.flag('found', true); A.set('calf', { hidden: false }); A.sfx('win'); A.sparkle(CALF[0], CALF[1], '#FACC15'); A.say([{ who: 'hero', text: 'هنا! الصغير مختبئ في العشب… والطوق في رقبته.' }]); }
}
export { bars };
