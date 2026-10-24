// مغامرة مضمار السباق: «راية البداية» (الصف الثامن، الوحدة ١٤) — بمحرك المغامرات، وبآلية جديدة لم تُستعمل قبلها:
// «حواجز المضمار»: ثلاثة حواجز على معابر حارات السباق، لكل حاجز إيقاعه (يرتفع ثم ينخفض بزمن ثابت)، والحارات بينها مسيّجة. يعبر البطل المعبر
// حين يرتفع الحاجز؛ ولا ينخفض حاجز على البطل ولا على طريق بدأ يمشيه. يجلب البطل راية البداية الخضراء من برج التوقيت شرقاً ويعود بها.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── المضمار (١٨×١٢): رصيف البداية غرباً، ثم ثلاث جزر بين حارات مسيّجة، وبرج التوقيت شرقاً؛ والمعابر في الصف ٦ ── */
const RC = grid(18, 12); rect(RC, 1, 1, 3, 10, '.'); rect(RC, 5, 2, 7, 9, '.'); rect(RC, 9, 2, 11, 9, '.'); rect(RC, 13, 1, 16, 10, '.');
export const BOOMS = [['b1', 4, 6, 3, 1.4, 0], ['b2', 8, 6, 3.6, 1.4, 1.1], ['b3', 12, 6, 2.8, 1.2, .5]];   // [معرّف، س، ص، الدورة، مدة الارتفاع، الإزاحة] بالثواني
BOOMS.forEach(([, x, y]) => { RC[y][x] = '.'; });
const COACH = { kind: 'man', skin: '#A8764E', robe: '#FEE2E2', accent: '#DC2626', hat: 'cap', vest: '#DC2626' };

export default {
  id: 'g8race', title: 'راية البداية', icon: '🏁', stars: 3,
  start: { area: 'track', x: 2, y: 8 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { flag: { icon: '🟩', name: 'راية البداية الخضراء' } },
  cast: { adel: { name: 'المدرّب عادل', look: COACH } },
  goals: [
    { text: 'تحدّث مع المدرّب عادل', done: A => A.flag('met'), at: () => ({ area: 'track', id: 'adel' }), hint: 'عادل على رصيف البداية.' },
    { text: 'اعبر الحواجز الثلاثة إلى برج التوقيت وخذ الراية', done: A => A.has('flag'), at: () => ({ area: 'track', id: 'tower' }), hint: 'راقب إيقاع كل حاجز: كم ثانية يبقى مرفوعاً؟ انتظر حتى يرتفع ثم اعبر.' },
    { text: 'أعد الراية إلى عادل', done: A => A.flag('done'), at: () => ({ area: 'track', id: 'adel' }), hint: 'عُد عبر الحواجز إلى رصيف البداية.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'دقائق قبل نهائي سباق القرية… والعدّاؤون على خط البداية.' },
    { who: 'narrator', text: 'لكن راية البداية الخضراء نُسيت في برج التوقيت، خلف حارات التدريب المغلقة بالحواجز!' },
    { who: 'hero', text: 'لأسأل المدرّب عادل.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).raceHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «بطل المضمار»'],
  areas: {
    track: {
      theme: 'village', map: rows(RC), dark: 0,
      enter: () => { clock = 0; },
      ents: [
        ...BOOMS.map(([id, x, y]) => ({ id, kind: 'boom', x, y, open: false })),
        { id: 'adel', kind: 'npc', who: 'adel', x: 1, y: 6, face: 'right', mark: A => !A.flag('met') || (A.has('flag') && !A.flag('done')) ? '!' : null },
        { id: 'tower', kind: 'chest', x: 16, y: 6 },
        { id: 'sg', kind: 'sign', x: 3, y: 2, text: 'حارات التدريب: «لا تعبر إلا والحاجز مرفوع. لكل حاجز إيقاعه، فراقب قبل أن تعبر».' },
        { id: 's1', kind: 'star', x: 5, y: 2 }, { id: 's2', kind: 'star', x: 11, y: 9 }, { id: 's3', kind: 'star', x: 16, y: 10 }
      ],
      on: {
        adel: async A => {
          if (A.has('flag') && !A.flag('done')) { A.flag('done', true); A.sfx('win'); A.shake(.3); A.sparkle(1, 6, '#22C55E');
            await A.say([{ who: 'adel', text: 'الراية الخضراء! في الوقت تماماً.' }, { who: 'narrator', text: 'رفع عادل الراية… وانطلق العدّاؤون، وارتفعت أرقام ساعة البرج.' }, { who: 'adel', text: 'عرفت سرّ الحواجز: لكل واحد إيقاع ثابت، ومن يراقبه يعرف متى يعبر.' }]); return A.complete(); }
          if (A.flag('met')) return A.say([{ who: 'adel', text: (A.goal() || {}).hint || '' }]);
          await A.say([{ who: 'adel', text: 'نسيت راية البداية في برج التوقيت شرق الحارات!' }, { who: 'adel', text: 'بين الحارات ثلاثة حواجز آلية، كل واحد يرتفع وينخفض بإيقاعه. اعبر حين يرتفع.' }]); A.flag('met', true);
        },
        tower: async A => { if (A.has('flag')) return; A.set('tower', { open: true }); A.give('flag'); A.sfx('win'); await A.say([{ who: 'hero', text: 'راية البداية! الآن العودة قبل أن يبدأ السباق.' }]); }
      },
      tick: (A, dt) => { clock += dt; const h = A.hero(), path = A.heroPath();
        BOOMS.forEach(([id, x, y, per, up, ph]) => { const want = ((clock + ph) % per) < up, e = A.ent(id), busy = (h.x === x && h.y === y) || path.some(([px, py]) => px === x && py === y);
          const open = want || (e.open && busy); if (open !== e.open) { A.set(id, { open }); if (Math.abs(h.x - x) + Math.abs(h.y - y) <= 3) A.sfx(open ? 'gate' : 'drop'); } }); }
    }
  }
};
let clock = 0;
