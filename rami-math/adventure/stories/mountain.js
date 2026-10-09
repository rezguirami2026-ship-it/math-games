// المغامرة: «قمة جبل شمس» — تُفتح بعد الوحدة الثامنة (القياس ٢). الجد سعيد يرسل البطل إلى صندوق جدّه الأكبر في القمة.
// قرية المدرّجات (فتح الفلج وتوجيه مائه بحجارة القنوات إلى المدرّجات الثلاثة)، الوادي (ركام يُكسر، ريح على الحافة يُحتمى منها
// خلف الصخور، ألواح الجسر المكسور، جسر فوق الهاوية، وصخور تتساقط)، والقمة عند الغروب (لغز الرموز من رسالة الجد).
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const flowers = g => g.forEach((r, y) => r.forEach((c, x) => { if (c === '.' && (x * 3 + y * 7) % 11 === 0) r[x] = ','; }));
const rows = g => g.map(r => r.join(''));

/* ── قرية المدرّجات (٣٠×٢٢) ── */
const B = grid(30, 22); border(B); flowers(B);
rect(B, 1, 15, 28, 15, '_'); B[15][29] = '_';
pts(B, [[22, 9], [26, 9], [2, 19], [24, 19], [14, 1], [27, 1]], 'T');

/* ── الوادي (٣٠×٢٢) ── */
const V = grid(30, 22); border(V);
rect(V, 1, 1, 28, 11, '#'); rect(V, 2, 2, 26, 10, '.');                 // الجروف حول ساحة صغيرة شمالاً
rect(V, 2, 11, 26, 11, '#'); V[11][4] = '.';                             // ممر إلى الساحة الشمالية
rect(V, 8, 12, 8, 20, '#'); V[16][8] = 'R';                              // ركام يسد الطريق
rect(V, 18, 12, 20, 20, ' ');                                            // الهاوية
V[0][15] = '#'; V[15][0] = '_'; V[16][29] = '_';

/* ── القمة عند الغروب (٢٦×١٦) ── */
const S = grid(26, 16); border(S); S[8][0] = '_';
pts(S, [[4, 2], [20, 12], [2, 13], [23, 6]], 'T');

const SAEED = { kind: 'man', robe: '#EFE6D2', accent: '#B5651D', skin: '#B97F52', beard: '#DDDDDD', tool: 'cane', elder: true, hat: 'straw' };
const SOL = { t1: 2, t2: 0, t3: 3 };   // من اليسار: ⭐ ثم 🌙 ثم 🌴 (والرسالة تُقرأ من اليمين: النخلة ثم الهلال ثم النجمة)
export default {
  id: 'mountain', title: 'قمة جبل شمس', icon: '⛰️', stars: 5,
  start: { area: 'base', x: 14, y: 18 },
  breakTool: 'hammer',
  items: { rope: { icon: '🪢', name: 'حبل التسلق' }, hammer: { icon: '🔨', name: 'مطرقة الجد' }, plank: { icon: '🪵', name: 'لوح من الجسر' }, letter: { icon: '📜', name: 'رسالة الجد الأكبر' } },
  cast: {
    saeed: { name: 'الجد سعيد', look: SAEED },
    huda: { name: 'هدى', look: { kind: 'girl', robe: '#2E8B57', accent: '#E3B04B', skin: '#C98E5F', hat: 'cap' } }
  },
  goals: [
    { text: 'تحدّث مع الجد سعيد في قرية المدرّجات', done: A => A.flag('met'), at: () => ({ area: 'base', id: 'saeed' }), hint: 'الجد سعيد قرب الطريق جنوب القرية.' },
    { text: 'افتح بوابة الفلج ليجري الماء', done: A => A.flag('falaj'), at: () => ({ area: 'base', id: 'sluice' }), hint: 'بوابة الفلج غرب القرية، عند النبع.' },
    { text: 'أدر حجارة القنوات حتى يصل الماء إلى المدرّجات الثلاثة', done: A => ['fA', 'fB', 'fC'].every(f => A.flag('w_' + f)), at: A => ({ area: 'base', id: !A.flag('w_fC') ? 't2' : 't1' }), hint: 'الماء الأزرق يجري في القناة. انقر على حجر القناة ليدور، فيتجه الماء نحو مدرّج آخر. كل مدرّج يرتوي مرة يبقى أخضر.' },
    { text: 'خذ الحبل والمطرقة من صندوق الجد', done: A => A.has('hammer'), at: () => ({ area: 'base', id: 'c_gear' }), hint: 'الصندوق بجانب بيت الجد.' },
    { text: 'انطلق شرقاً إلى الوادي', done: A => A.flag('canyon'), at: () => ({ area: 'canyon', x: 1, y: 15 }), hint: 'الطريق الشرقي يقود إلى الوادي.' },
    { text: 'اكسر الركام الذي يسد الطريق', done: A => !!A.S.cut['canyon:8,16'], at: () => ({ area: 'canyon', x: 8, y: 16 }), hint: 'انقر على الركام والمطرقة معك.' },
    { text: 'اجمع ٣ ألواح من الجسر المكسور (احتمِ من الريح خلف الصخور)', done: A => A.count('plank') >= 3 || A.flag('bridge'), at: A => ({ area: 'canyon', id: ['pk1', 'pk2', 'pk3'].find(id => !(A.ent(id) || {}).got) || 'pk1' }), hint: 'الريح على الحافة تهب من الشرق. قف غرب صخرة حين يظهر التحذير.' },
    { text: 'أصلح الجسر المعلّق فوق الهاوية', done: A => A.flag('bridge'), at: A => ({ area: 'canyon', id: ['br1', 'br2', 'br3'].find(id => !(A.ent(id) || {}).built) || 'br1' }), hint: 'الإطارات الذهبية فوق الهاوية أماكن الألواح. انقر عليها.' },
    { text: 'اعبر الجسر وتفادَ الصخور المتساقطة حتى القمة', done: A => A.flag('summit'), at: () => ({ area: 'summit', x: 1, y: 8 }), hint: 'الصخور تتدحرج على المنحدر. انتظر حتى تمر ثم اعبر.' },
    { text: 'اضبط ألواح صندوق الجد الأكبر على رموز الرسالة', done: A => A.flag('open'), at: A => ({ area: 'summit', id: ['t1', 't2', 't3'].find(id => (A.ent(id) || {}).sym !== SOL[id]) || 't1' }), hint: 'الرسالة تقول من اليمين: 🌴 النخلة، ثم 🌙 الهلال، ثم ⭐ النجمة.' },
    { text: 'افتح الصندوق وشاهد الغروب من القمة', done: A => A.flag('done'), at: () => ({ area: 'summit', id: 'box' }), hint: 'الصندوق في وسط القمة.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'جبل شمس… أعلى جبال عُمان، وفي سفحه قرية صغيرة من المدرّجات الخضراء.' },
    { who: 'narrator', text: 'الجد سعيد يحتفظ بسرّ عائلته: صندوق تركه جده الأكبر على القمة قبل مئة عام.' },
    { who: 'hero', text: 'رحلة إلى القمة! لنرَ ماذا يخبئ الجبل.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.decor = s.decor || {}; s.decor.cairn = s.decor.cairn || Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🗻 رُجْمة حجرية من القمة في ساحة القرية', '🏅 وسام «متسلّق القمم»'],
  areas: {
    base: {
      theme: 'village', map: rows(B), dark: 0,
      ents: [
        { id: 'saeed', kind: 'npc', who: 'saeed', x: 12, y: 17, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'huda', kind: 'npc', who: 'huda', x: 18, y: 12, face: 'left' },
        { id: 'home', kind: 'house', x: 20, y: 7, w: 4, h: 2 }, { id: 'h2', kind: 'house', x: 24, y: 5, w: 3, h: 2, roof: '#D9C6A0' },
        { id: 'c_gear', kind: 'chest', x: 19, y: 8, item: 'hammer' },
        { id: 'safeB', kind: 'safe', x: 15, y: 17 },
        { id: 'spring', kind: 'well', x: 2, y: 4 },
        { id: 'sluice', kind: 'lever', x: 3, y: 6, color: '#2F6FD6' },
        { id: 'falaj', kind: 'beam', x: 3, y: 4, dir: 0, color: '#4FB6FF', when: A => A.flag('falaj') },
        { id: 't1', kind: 'rot', style: 'mirror', x: 9, y: 4, r: 1 }, { id: 't2', kind: 'rot', style: 'mirror', x: 9, y: 10, r: 1 },
        { id: 'fA', kind: 'crystal', style: 'field', x: 9, y: 1 }, { id: 'fB', kind: 'crystal', style: 'field', x: 17, y: 10 }, { id: 'fC', kind: 'crystal', style: 'field', x: 3, y: 10 },
        { id: 'sgF', kind: 'sign', x: 6, y: 7, text: 'فلج القرية: يجري الماء من النبع في القناة، وحجارة القنوات تغيّر اتجاهه. انقر على الحجر ليدور.' },
        { id: 'toCanyon', kind: 'exit', x: 29, y: 15, to: 'canyon', tx: 1, ty: 15, when: A => A.has('hammer') && ['fA', 'fB', 'fC'].every(f => A.flag('w_' + f)), locked: 'الجد سعيد طلب أن أسقي المدرّجات أولاً… وأحتاج المطرقة.' },
        { id: 's1', kind: 'star', x: 1, y: 13 }, { id: 's2', kind: 'star', x: 28, y: 20 }
      ],
      onLever: (A, e) => { if (e.id === 'sluice' && e.on && !A.flag('falaj')) { A.flag('falaj', true); A.sfx('drop'); A.say([{ who: 'narrator', text: 'انفتحت بوابة الفلج، وجرى الماء الصافي في القناة!' }]); } },
      tick: A => { ['fA', 'fB', 'fC'].forEach(f => { const c = A.ent(f); if (c && A.flag('w_' + f)) c.wet = true; if (c && c.lit && !A.flag('w_' + f)) { c.wet = true; A.flag('w_' + f, true); A.sfx('plant'); A.sparkle(c.x, c.y, '#7CC36B'); A.toast(`🌱 ارتوى مدرّج (${['fA', 'fB', 'fC'].filter(k => A.flag('w_' + k)).length} من ٣)`); } }); },
      on: {
        saeed: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'saeed', text: 'أهلاً بك في جبل شمس يا بطل! أنا سعيد، وهذه مدرّجات أجدادي.' },
              { who: 'saeed', text: 'جدي الأكبر ترك صندوقاً على القمة، وكتب في رسالته رموز قفله. خذ الرسالة.' },
              { who: 'saeed', text: 'لكن قبل أن تصعد: الفلج مغلق منذ الصباح والمدرّجات عطشى. افتح بوابته غرب القرية، ووجّه الماء إلى المدرّجات الثلاثة.' },
              { who: 'saeed', text: 'وفي صندوقي حبل ومطرقة، ستحتاجهما في الوادي.' }
            ]); A.flag('met', true); A.give('letter', 1, true); return;
          }
          A.say([{ who: 'saeed', text: ['fA', 'fB', 'fC'].every(f => A.flag('w_' + f)) ? 'ارتوت المدرّجات! بارك الله فيك. الطريق إلى القمة شرقاً.' : ((A.goal() || {}).hint || '') }]);
        },
        huda: A => A.say([{ who: 'huda', text: 'جدي يقول إن الصاعد إلى القمة يرى الغروب فوق الغيوم!' }]),
        c_gear: async (A, e) => { if (e.open) return; A.set(e.id, { open: true }); A.sfx('win'); A.give('hammer'); A.give('rope', 1, true); }
      }
    },
    canyon: {
      theme: 'ruins', map: rows(V), dark: 0,
      wind: { period: 7, dur: 2.2, dx: -1, dy: 0, force: 2.4, zones: [[9, 12, 17, 20]], until: A => A.flag('bridge') },
      enter: A => { if (!A.flag('canyon')) { A.flag('canyon', true); A.say([{ who: 'narrator', text: 'الوادي العميق: جروف عالية، وريح قوية على الحافة، والجسر المعلّق مقطوع فوق الهاوية!' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 15, to: 'base', tx: 28, ty: 15 },
        { id: 'safeC', kind: 'safe', x: 2, y: 15 }, { id: 'safeC2', kind: 'safe', x: 10, y: 16 }, { id: 'safeC3', kind: 'safe', x: 22, y: 16 },
        { id: 'r1', kind: 'pillar', x: 12, y: 15, h: 40, color: '#9C9488' }, { id: 'r2', kind: 'pillar', x: 15, y: 18, h: 40, color: '#9C9488' }, { id: 'r3', kind: 'pillar', x: 16, y: 13, h: 40, color: '#9C9488' }, { id: 'r4', kind: 'pillar', x: 11, y: 19, h: 40, color: '#9C9488' },
        { id: 'pk1', kind: 'item', x: 11, y: 13, item: 'plank' }, { id: 'pk2', kind: 'item', x: 14, y: 19, item: 'plank' }, { id: 'pk3', kind: 'item', x: 10, y: 4, item: 'plank' },
        { id: 'br1', kind: 'site', x: 18, y: 16, model: 'bridge' }, { id: 'br2', kind: 'site', x: 19, y: 16, model: 'bridge' }, { id: 'br3', kind: 'site', x: 20, y: 16, model: 'bridge' },
        { id: 'sgB', kind: 'sign', x: 17, y: 14, text: 'الجسر المعلّق مقطوع! الإطارات الذهبية فوق الهاوية أماكن الألواح الثلاثة.' },
        { id: 'fall1', kind: 'hazard', creature: 'boulder', path: [[24, 12], [24, 20]], speed: 2.1, r: .7, caughtMsg: '🪨 صخرة متساقطة! تعود إلى النقطة الآمنة… انتظر حتى تمرّ.' },
        { id: 'fall2', kind: 'hazard', creature: 'boulder', path: [[27, 20], [27, 12]], speed: 1.7, r: .7, caughtMsg: '🪨 صخرة متساقطة! تعود إلى النقطة الآمنة… انتظر حتى تمرّ.' },
        { id: 'toSummit', kind: 'exit', x: 29, y: 16, to: 'summit', tx: 1, ty: 8 },
        { id: 's3', kind: 'star', x: 26, y: 2 }, { id: 's4', kind: 'star', x: 2, y: 19 }
      ],
      onSolid: (A, x, y, ch) => { if (ch === 'R') { if (A.has('hammer')) { A.cut(x, y); A.sfx('drop'); A.shake(.5); A.toast('🔨 تكسّر الركام!'); } else A.toast('🪨 ركام ثقيل… تحتاج المطرقة.'); return true; } if (ch === ' ') { A.toast('⚠️ هاوية عميقة! أصلح الجسر لتعبر.'); return true; } },
      on: { br1: (A, e) => plank(A, e), br2: (A, e) => plank(A, e), br3: (A, e) => plank(A, e) }
    },
    summit: {
      theme: 'ruins', map: rows(S), dark: .18,
      enter: A => { if (!A.flag('summit')) { A.flag('summit', true); A.weather({ dark: .18 }); A.say([{ who: 'narrator', text: 'القمة! الغيوم تحتك، والشمس تميل نحو الغروب… وفي الوسط صندوق خشبي قديم عليه ثلاثة ألواح.' }, { who: 'hero', text: 'رسالة الجد الأكبر تقول: «من اليمين: النخلة، ثم الهلال، ثم النجمة».' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 8, to: 'canyon', tx: 28, ty: 16 },
        { id: 'safeS', kind: 'safe', x: 2, y: 8 },
        { id: 'box', kind: 'chest', x: 12, y: 5 },
        { id: 't1', kind: 'tablet', x: 11, y: 7, sym: 1 }, { id: 't2', kind: 'tablet', x: 12, y: 7, sym: 1 }, { id: 't3', kind: 'tablet', x: 13, y: 7, sym: 1 },
        { id: 'cn1', kind: 'pillar', x: 7, y: 4, h: 34, color: '#B8AE98' }, { id: 'cn2', kind: 'pillar', x: 18, y: 4, h: 44, color: '#B8AE98' }, { id: 'cn3', kind: 'pillar', x: 18, y: 11, h: 30, color: '#B8AE98' },
        { id: 's5', kind: 'star', x: 24, y: 2 }
      ],
      on: {
        t1: (A, e) => tab(A, e), t2: (A, e) => tab(A, e), t3: (A, e) => tab(A, e),
        box: async (A, e) => {
          if (!A.flag('open')) return A.say([{ who: 'narrator', text: 'الصندوق مقفل بألواح الرموز. اقرأ رسالة الجد الأكبر.' }]);
          if (A.flag('done')) return;
          A.set('box', { open: true }); A.flag('done', true); A.sfx('win'); A.sparkle(12, 5, '#FFD54A'); A.weather({ dark: .3 });
          await A.say([
            { who: 'narrator', text: 'في الصندوق: خنجر عُماني قديم، وورقة بخط جميل…' },
            { who: 'narrator', text: '«إلى من يصل إلى هنا: الجبل لا يُصعد بالقوة وحدها، بل بالصبر والتعاون وسقي الأرض قبل الرحيل».' },
            { who: 'hero', text: 'سقيتُ المدرّجات قبل أن أصعد… كأن الجد الأكبر كان يعرف!' },
            { who: 'narrator', text: 'وغربت الشمس فوق بحر من الغيوم، في أجمل منظر رآه البطل في حياته.' }
          ]);
          A.complete();
        }
      }
    }
  }
};

async function plank(A, e) {
  if (e.built) return;
  if (!A.has('plank')) return A.say([{ who: 'narrator', text: 'تحتاج لوحاً من الجسر المكسور. الألواح متناثرة على الحافة.' }]);
  A.take('plank'); A.set(e.id, { built: true }); A.setTile(e.x, e.y, '='); A.sfx('drop'); A.shake(.3); A.sparkle(e.x, e.y, '#C88A4A');
  const n = ['br1', 'br2', 'br3'].filter(id => A.ent(id).built).length;
  if (n < 3) return A.toast(`🪵 ثبّتَّ لوحاً (${n === 1 ? 'واحداً' : 'اثنين'} من ثلاثة)`);
  A.flag('bridge', true); A.sfx('win'); A.say([{ who: 'narrator', text: 'اكتمل الجسر المعلّق! الطريق إلى القمة مفتوح… لكن احذر الصخور المتساقطة.' }]);
}
async function tab(A, e) {
  if (A.flag('open')) return A.toast('🔓 القفل مفتوح');
  A.set(e.id, { sym: ((e.sym || 0) + 1) % 4 }); A.sfx('click');
  if (Object.entries(SOL).every(([id, v]) => A.ent(id).sym === v)) { A.flag('open', true); A.sfx('win'); A.say([{ who: 'narrator', text: '🌴🌙⭐ طقطق القفل القديم… وانفتح!' }]); }
}
