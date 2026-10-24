// مغامرة محطة الأرصاد: «منطاد الرصد الهارب» (الصف الثامن، الوحدة ١٣) — بمحرك المغامرات، وبآلية جديدة لم تُستعمل قبلها:
// «المنطاد والرياح»: أفلت منطاد الرصد داخل ساحة الإطلاق المسيّجة. لا يدفعه البطل بيده، بل يختار اتجاه الريح من أربعة أزرار (شمال، شرق، جنوب، غرب)
// فيطفو المنطاد في اتجاهها بلاطة بعد بلاطة حتى يصطدم بعائق، ويجب أن يحط على منصة الهبوط. الساحة محسوبة بحلّال: ٥ رياح على الأقل.
const rows = g => g.map(r => r.join ? r.join('') : r);

/* ── سطح المحطة (١٦×١٢): ممر الأزرار غرباً (س ١–٣)، وساحة الإطلاق المسيّجة شرقاً بعوائقها ── */
const FIELD = ['################', '#####..........#', '#####.#.....#..#', '#####..#..#...##', '#####.##.......#', '#####........###', '#####.#........#', '#####.......#..#', '#####......#...#', '#####..........#', '#####...#...#..#', '################'];
const MAP = FIELD.map((r, y) => y > 0 && y < 11 ? '#...' + r.slice(4) : r);
export const BAL0 = [6, 10], PAD = [13, 2], SOLUTION = ['W', 'N', 'E', 'S', 'W'];
const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }, NAMES = { N: 'الشمال', E: 'الشرق', S: 'الجنوب', W: 'الغرب' };
const STEP = .28;
const REEM = { kind: 'woman', skin: '#C99A72', robe: '#F8FAFC', accent: '#0369A1', glasses: true };

export default {
  id: 'g8weather', title: 'منطاد الرصد الهارب', icon: '🎈', stars: 3,
  start: { area: 'roof', x: 1, y: 9 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: {},
  cast: { reem: { name: 'الراصدة ريم', look: REEM } },
  goals: [
    { text: 'تحدّث مع الراصدة ريم', done: A => A.flag('met'), at: () => ({ area: 'roof', id: 'reem' }), hint: 'ريم في ممر الأزرار.' },
    { text: 'وجّه المنطاد بالرياح إلى منصة الهبوط', done: A => A.flag('landed'), at: () => ({ area: 'roof', id: 'reem' }), hint: 'المنطاد لا يتوقف إلا حين يصطدم بعائق. ابحث عن عائق قرب المنصة يوقفه عندها، ثم فكّر من أين يأتي إليه.' },
    { text: 'عُد إلى ريم', done: A => A.flag('done'), at: () => ({ area: 'roof', id: 'reem' }), hint: 'ريم تنتظر في ممر الأزرار.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'قبل نشرة المساء أفلت منطاد الرصد من حبله داخل ساحة الإطلاق!' },
    { who: 'narrator', text: 'وفيه أجهزة قياس الحرارة والرطوبة لهذا اليوم كله.' },
    { who: 'hero', text: 'لأسأل الراصدة ريم.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).weatherHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «سيد الرياح»'],
  areas: {
    roof: {
      theme: 'village', map: MAP, dark: 0,
      enter: () => { acc = 0; },
      ents: [
        { id: 'bal', kind: 'balloon', x: BAL0[0], y: BAL0[1] },
        { id: 'pad', kind: 'plate', x: PAD[0], y: PAD[1], col: '#F97316' },
        { id: 'wN', kind: 'lever', x: 2, y: 2, color: '#2563EB', wind: 'N' }, { id: 'wE', kind: 'lever', x: 2, y: 4, color: '#16A34A', wind: 'E' },
        { id: 'wS', kind: 'lever', x: 2, y: 6, color: '#F59E0B', wind: 'S' }, { id: 'wW', kind: 'lever', x: 2, y: 8, color: '#DC2626', wind: 'W' },
        { id: 'reset', kind: 'lever', x: 3, y: 10, color: '#64748B' },
        { id: 'reem', kind: 'npc', who: 'reem', x: 1, y: 10, face: 'right', mark: A => !A.flag('met') || (A.flag('landed') && !A.flag('done')) ? '!' : null },
        { id: 'sg', kind: 'sign', x: 3, y: 1, text: 'أزرار الرياح: الأزرق شمالاً، والأخضر شرقاً، والأصفر جنوباً، والأحمر غرباً. والرمادي يعيد المنطاد. المنطاد يطفو حتى يصطدم بشيء.' },
        { id: 's1', kind: 'star', x: 1, y: 1 }, { id: 's2', kind: 'star', x: 3, y: 5 }, { id: 's3', kind: 'star', x: 1, y: 7 }
      ],
      on: {
        reem: async A => {
          if (A.flag('landed') && !A.flag('done')) { A.flag('done', true); A.sfx('win'); A.sparkle(1, 10, '#FACC15');
            await A.say([{ who: 'reem', text: 'حطّ المنطاد على المنصة! وقراءاته كلها سليمة.' }, { who: 'reem', text: 'الآن أحسب الوسيط والوسط الحسابي لحرارة اليوم، ونذيعها في نشرة المساء.' }, { who: 'narrator', text: 'وفي المساء ظهرت قراءات المنطاد على شاشة الاستوديو، وصفّق فريق المحطة للبطل.' }]); return A.complete(); }
          if (A.flag('met')) return A.say([{ who: 'reem', text: (A.goal() || {}).hint || '' }]);
          await A.say([{ who: 'reem', text: 'أفلت المنطاد وصار يطفو مع الريح! لا نستطيع دخول ساحة الإطلاق أثناء العمل.' }, { who: 'reem', text: 'لكن هذه الأزرار تغيّر اتجاه مراوح الساحة: اختر الريح، والمنطاد يطفو حتى يصطدم بشيء. أوصله إلى المنصة البرتقالية.' }]); A.flag('met', true);
        }
      },
      onLever: (A, e) => { if (e.id === 'reset') { A.set('bal', { x: BAL0[0], y: BAL0[1] }); A.flag('wind', ''); A.set('reset', { on: false }); A.toast('🔄 عاد المنطاد إلى مكانه'); return; }
        if (A.flag('landed')) { A.set(e.id, { on: false }); return; } ['wN', 'wE', 'wS', 'wW'].forEach(id => A.set(id, { on: id === e.id })); A.flag('wind', e.wind); A.toast(`💨 الريح نحو ${NAMES[e.wind]}`); },
      tick: (A, dt) => drift(A, dt)
    }
  }
};

/* المنطاد يطفو بلاطة كل STEP ثانية في اتجاه الريح حتى يصطدم بجدار أو شيء، وحين يقف على المنصة يحط */
let acc = 0;
function drift(A, dt) {
  const w = A.flag('wind'); if (!w || A.flag('landed')) return; acc += dt; if (acc < STEP) return; acc = 0;
  const e = A.ent('bal'), [dx, dy] = DIRS[w], nx = e.x + dx, ny = e.y + dy;
  if (MAP[ny][nx] !== '.' || A.blockedAt(nx, ny)) { A.flag('wind', ''); ['wN', 'wE', 'wS', 'wW'].forEach(id => A.set(id, { on: false }));
    if (e.x === PAD[0] && e.y === PAD[1]) { A.flag('landed', true); A.sfx('win'); A.shake(.3); A.sparkle(PAD[0], PAD[1], '#F97316'); A.say([{ who: 'reem', text: 'حطّ على المنصة! تعال إليّ.' }]); } else A.sfx('drop'); return; }
  A.set('bal', { x: nx, y: ny, px: e.x, py: e.y });
}
