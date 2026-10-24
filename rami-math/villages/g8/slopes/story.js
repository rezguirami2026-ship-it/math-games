// مغامرة منحدرات التزلج: «تلفريك الواحة» (الصف الثامن، الوحدة ١١) — بمحرك المغامرات، وبآلية جديدة لم تُستعمل قبلها:
// «عربة التلفريك»: منصة تتحرك ذهاباً وإياباً على مسار ثابت فوق بحيرة الواحة وتتوقف قليلاً عند كل محطة، يقف عليها البطل وهي في المحطة
// فتحمله معها، ولا يُمشى على الماء. العربة الثانية متوقفة حتى يُشغّلها ذراع على الجزيرة. يعبر البطل عربتين إلى قمة الكثيب ليجلب صندوق الإسعاف
// لمتزلج التوى كاحله، ثم يعود.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── بحيرة الواحة (٢٠×١٢): الشاطئ غرباً، والجزيرة في الوسط، وقمة الكثيب شمال شرق، والماء بينها ── */
const LK = grid(20, 12); rect(LK, 1, 1, 18, 10, '~'); rect(LK, 1, 1, 3, 10, '.'); rect(LK, 10, 4, 13, 8, '.'); rect(LK, 15, 1, 18, 3, '.');
// العربتان: [معرّف، المسار من المحطة الأولى إلى الثانية، اللون]
export const G1 = { id: 'g1', path: [[4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6]], col: '#0369A1' };
export const G2 = { id: 'g2', path: [[14, 7], [14, 6], [14, 5], [14, 4], [14, 3], [14, 2]], col: '#DC2626' };
const STEP = .55, WAIT = 1.6;   // ثوانٍ لكل بلاطة، والتوقف في المحطة

const MAJID = { kind: 'man', skin: '#A8764E', robe: '#FDE047', accent: '#DC2626', vest: '#DC2626', tall: true };
const SKIER = { kind: 'boy', skin: '#C68A5B', robe: '#E0F2FE', accent: '#0369A1', tall: true };

export default {
  id: 'g8slopes', title: 'تلفريك الواحة', icon: '🚡', stars: 3,
  start: { area: 'lake', x: 2, y: 8 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { aid: { icon: '🧰', name: 'صندوق الإسعاف' } },
  cast: { majid: { name: 'المنقذ ماجد', look: MAJID }, skier: { name: 'المتزلج حمد', look: SKIER } },
  goals: [
    { text: 'تحدّث مع المنقذ ماجد', done: A => A.flag('met'), at: () => ({ area: 'lake', id: 'majid' }), hint: 'ماجد على الشاطئ الغربي.' },
    { text: 'اركب العربة الزرقاء إلى الجزيرة', done: A => A.flag('isle'), at: () => ({ area: 'lake', id: 'g1' }), hint: 'انتظر العربة حتى تقف عند الشاطئ، ثم قف عليها.' },
    { text: 'شغّل العربة الحمراء واركبها إلى قمة الكثيب', done: A => A.flag('top'), at: A => A.flag('run2') ? { area: 'lake', id: 'g2' } : { area: 'lake', id: 'lv2' }, hint: 'العربة الحمراء متوقفة: ذراعها على الجزيرة.' },
    { text: 'أوصل صندوق الإسعاف إلى حمد', done: A => A.flag('done'), at: A => A.has('aid') ? { area: 'lake', id: 'skier' } : { area: 'lake', id: 'aid' }, hint: 'الصندوق في كوخ القمة. وحمد على الشاطئ ينتظر.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'صباح سباق الكثبان في منتجع التزلج… والتوى كاحل المتزلج حمد عند الشاطئ!' },
    { who: 'narrator', text: 'وصندوق الإسعاف في كوخ قمة الكثيب، خلف بحيرة الواحة.' },
    { who: 'hero', text: 'لأسأل المنقذ ماجد.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).slopesHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «منقذ الكثبان»'],
  areas: {
    lake: {
      theme: 'desert', map: rows(LK), dark: 0,
      enter: () => { T0.g1 = 0; T0.g2 = 0; },
      ents: [
        { id: 'g1', kind: 'gondola', x: G1.path[0][0], y: G1.path[0][1], col: G1.col, k: 0, dir: 1 },
        { id: 'g2', kind: 'gondola', x: G2.path[0][0], y: G2.path[0][1], col: G2.col, k: 0, dir: 1 },
        { id: 'majid', kind: 'npc', who: 'majid', x: 2, y: 5, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'skier', kind: 'npc', who: 'skier', x: 1, y: 9, face: 'right', mark: A => A.has('aid') && !A.flag('done') ? '!' : null },
        { id: 'lv2', kind: 'lever', x: 12, y: 8, color: '#DC2626' },
        { id: 'sg1', kind: 'sign', x: 3, y: 2, text: 'تلفريك الواحة: «قف على العربة وهي في المحطة، ولا تخرج منها فوق الماء». العربة الحمراء تُشغَّل من ذراعها على الجزيرة.' },
        { id: 'aid', kind: 'chest', x: 17, y: 1 },
        { id: 's1', kind: 'star', x: 13, y: 4 }, { id: 's2', kind: 'star', x: 18, y: 3 }, { id: 's3', kind: 'star', x: 1, y: 1 }
      ],
      on: {
        majid: async A => {
          if (A.flag('met')) return A.say([{ who: 'majid', text: (A.goal() || {}).hint || 'بسرعة يا بطل!' }]);
          await A.say([{ who: 'majid', text: 'الحمد لله أنك هنا! حمد يحتاج صندوق الإسعاف، وهو في كوخ القمة شمال شرق البحيرة.' },
            { who: 'majid', text: 'لا جسر فوق البحيرة: اركب عربة التلفريك الزرقاء إلى الجزيرة، ومن هناك الحمراء إلى القمة.' },
            { who: 'majid', text: 'العربة تقف قليلاً في كل محطة ثم تتحرك. قف عليها وهي واقفة، واثبت حتى تصل!' }]); A.flag('met', true);
        },
        skier: async A => {
          if (!A.has('aid')) return A.say([{ who: 'skier', text: 'آه… كاحلي! الصندوق في كوخ القمة.' }]);
          if (A.flag('done')) return;
          A.flag('done', true); A.sfx('win'); A.shake(.2); A.sparkle(1, 9, '#FACC15');
          await A.say([{ who: 'majid', text: 'أحسنت! سأضمّد كاحل حمد الآن.' }, { who: 'skier', text: 'شكراً يا بطل! سأشاهد السباق من الاستراحة، وفي العام القادم أتسابق معك.' },
            { who: 'narrator', text: 'وانطلق سباق الكثبان، والتلفريك يحمل الزوار فوق بحيرة الواحة.' }]);
          A.complete();
        },
        aid: async A => { if (A.has('aid')) return; A.set('aid', { open: true }); A.give('aid'); A.sfx('win'); A.flag('top', true); await A.say([{ who: 'hero', text: 'صندوق الإسعاف! الآن إلى حمد بسرعة.' }]); }
      },
      onLever: (A, e) => { if (e.id === 'lv2') { A.flag('run2', true); A.set('lv2', { on: true }); A.toast('🔴 تحركت العربة الحمراء!'); A.sfx('gate'); } },
      tick: (A, dt) => { ride(A, G1, dt, true); ride(A, G2, dt, A.flag('run2')); const h = A.hero(); if (h.x >= 10 && h.x <= 13 && h.y >= 4) A.flag('isle', true); if (h.y <= 3 && h.x >= 15) A.flag('top', true); }
    }
  }
};

/* حركة العربة: تقف WAIT ثانية في كل طرف ثم تمشي بلاطة كل STEP ثانية، وتحمل البطل إن كان واقفاً عليها */
const T0 = { g1: 0, g2: 0 };
function ride(A, G, dt, on) {
  const e = A.ent(G.id); if (!e || !on) return; T0[G.id] += dt;
  const atEnd = e.k === 0 || e.k === G.path.length - 1; if (T0[G.id] < (atEnd ? WAIT : STEP)) return; T0[G.id] = 0;
  let k = e.k + e.dir, dir = e.dir; if (k < 0 || k >= G.path.length) { dir = -dir; k = e.k + dir; }
  const h = A.hero(), carry = h.x === e.x && h.y === e.y && !A.busy(), [nx, ny] = G.path[k];
  A.set(G.id, { x: nx, y: ny, k, dir, px: e.x, py: e.y });
  if (carry) A.jump(nx, ny, STEP * .9);
}
