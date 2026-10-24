// مغامرة مزارع الأفلاج: «الفلج العطشان» (الصف الثامن، الوحدة ٦) — بمحرك المغامرات، وبآليتين جديدتين لم تُستعملا قبلها:
// «الرمضاء»: رمل حار لا يُعبر إلا في الظل، والأثر (مزولة) يغيّر وقت النهار فتتجه ظلال النخيل غرباً صباحاً، وتقصر ظهراً، وتتجه شرقاً عصراً؛
// و«المسحاة»: يحفر البطل الساقية بلاطة بعد بلاطة من فوهة الفلج، فيجري الماء فيما حفره (ويغلقه) حتى يصل إلى الحقول العطشى.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join('').replace(/x/g, '.'));
const SUN = ['الصباح', 'الظهيرة', 'العصر'];

/* ── سهل الرمضاء (٢٢×١٣): رمل حار بين أرض المزرعة غرباً ومنبع الساقية شرقاً، وصخرة في الوسط عليها أثر ثانٍ ── */
const FW = 22, FH = 13, FL = grid(FW, FH); rect(FL, 1, 1, FW - 2, FH - 2, 's'); rect(FL, 1, 1, 3, FH - 2, '.'); rect(FL, 17, 1, FW - 2, FH - 2, '.');
const ISLAND = [[10, 4], [11, 4], [10, 5], [10, 6], [11, 6], [10, 7]]; ISLAND.forEach(([x, y]) => { FL[y][x] = '_'; });
const PALMS = [[7, 5], [9, 6], [11, 5], [11, 7], [13, 6], [11, 8], [6, 9], [15, 3], [5, 2]]; PALMS.forEach(([x, y]) => { FL[y][x] = 'T'; });
[[1, 1], [1, 11], [20, 1], [20, 11]].forEach(([x, y]) => { FL[y][x] = 'T'; });
for (let y = 1; y < FH - 1; y++) { FL[y][1] = FL[y][1] === 'T' ? 'T' : ','; FL[y][19] = FL[y][19] === 'T' ? 'T' : ','; }
const HOT = []; for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) if (FL[y][x] === 's') HOT.push([x, y]);
// الظل: نخلة تلقي ظلها ٣ بلاطات غرباً صباحاً، وبلاطة شمالاً ظهراً، و٣ شرقاً عصراً، ويتوقف عند الجدار
const SHADOW = [[-1, 0, 3], [0, -1, 1], [1, 0, 3]];
function shadeSet(sun) {
  const set = new Set(), [dx, dy, L] = SHADOW[sun];
  PALMS.forEach(([x, y]) => { for (let k = 1; k <= L; k++) { const cx = x + dx * k, cy = y + dy * k; if (FL[cy][cx] === '#' || FL[cy][cx] === 'T') break; set.add(cx + ',' + cy); } });
  return set;
}

/* ── المدرّجات (٢٠×١٤): فوهة الفلج شمالاً غرباً، وأرض محروثة تُحفر فيها السواقي إلى ثلاثة حقول، وممر يدور حولها ── */
const TW = 20, TH = 14, TR = grid(TW, TH); rect(TR, 1, 1, TW - 2, TH - 2, '.');
const RIDGE = []; for (let x = 5; x <= 14; x++) RIDGE.push([x, 5]); RIDGE.forEach(([x, y]) => { TR[y][x] = 'x'; });   // سياج خشبي منخفض يقسم الأرض (عناصر fence)
[[9, 3], [12, 8], [5, 7]].forEach(([x, y]) => { TR[y][x] = 'T'; }); [[1, 12], [18, 12]].forEach(([x, y]) => { TR[y][x] = 'T'; });   // الممر الدائر حول الأرض المحروثة يبقى مفتوحاً: السواقي لا تحبس البطل
const SRC = [2, 2], FIELDS = { fA: [17, 2], fB: [2, 9], fC: [17, 9] };
const SOIL = []; for (let y = 2; y <= 9; y++) for (let x = 2; x <= 17; x++) { if (TR[y][x] !== '.' || Object.values(FIELDS).some(([a, b]) => a === x && b === y) || (x === 10 && y === 7) || (x === SRC[0] && y === SRC[1])) continue; SOIL.push([x, y]); }
const sid = (x, y) => `d${x}_${y}`;

const RASHID = { kind: 'man', skin: '#A8764E', robe: '#F8FAFC', accent: '#15803D', beard: '#E5E5E5', elder: true };
const MUNA = { kind: 'woman', skin: '#B5835A', robe: '#166534', accent: '#FDE68A', apron: '#FDE68A' };

export default {
  id: 'g8aflaj', title: 'الفلج العطشان', icon: '💧', stars: 5,
  start: { area: 'flats', x: 2, y: 8 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { spade: { icon: '⛏️', name: 'المسحاة' } },
  cast: { rashid: { name: 'عريف الفلج راشد', look: RASHID }, muna: { name: 'المزارعة منى', look: MUNA } },
  goals: [
    { text: 'تحدّث مع عريف الفلج راشد', done: A => A.flag('met'), at: () => ({ area: 'flats', id: 'rashid' }), hint: 'راشد بجانب الأثر غرب الرمضاء.' },
    { text: 'أدر الأثر واعبر الرمضاء في الظل إلى الصخرة', done: A => A.flag('island'), at: () => ({ area: 'flats', id: 'dial1' }), hint: 'في أي وقت تمتد ظلال النخيل نحوك؟ جرّب الأوقات الثلاثة وراقب الظلال.' },
    { text: 'أدر أثر الصخرة واعبر إلى منبع الساقية وخذ المسحاة', done: A => A.has('spade') || A.flag('done'), at: () => ({ area: 'flats', id: 'chest' }), hint: 'الظلال التي أوصلتك إلى الصخرة لا تكمل الطريق: إلى أين يجب أن تتجه الظلال الآن؟' },
    { text: 'احفر السواقي من فوهة الفلج إلى الحقول الثلاثة', done: A => A.flag('done'), at: () => ({ area: 'terraces', id: 'muna' }), hint: 'الماء يجري فيما تحفره فقط، فابدأ من الفوهة واحفر بلاطة تجاور الساقية كل مرة.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'جفّت حقول مزارع الأفلاج… فقد طمرت ريح الأمس ساقية المدرّجات بالرمل.' },
    { who: 'hero', text: 'لعل عريف الفلج يعرف ما نفعل.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).falajKeeper = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «حارس الفلج»'],
  areas: {
    flats: {
      theme: 'village', map: rows(FL), dark: 0,
      enter: A => { if (A.flag('sun') == null) A.flag('sun', 1); applySun(A); },
      ents: [
        ...HOT.map(([x, y]) => ({ id: `h${x}_${y}`, kind: 'hot', x, y })),
        { id: 'rashid', kind: 'npc', who: 'rashid', x: 2, y: 4, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'dial1', kind: 'sundial', x: 2, y: 6 }, { id: 'dial2', kind: 'sundial', x: 10, y: 4 },
        { id: 'sg1', kind: 'sign', x: 3, y: 10, text: 'الرمضاء: «لا تمشِ في الشمس، فالرمل يحرق القدمين. الظل طريقك».' },
        { id: 'chest', kind: 'chest', x: 19, y: 3, item: 'spade' },
        { id: 'toTer', kind: 'exit', x: 20, y: 6, to: 'terraces', tx: 9, ty: 11, when: A => A.has('spade'), locked: 'منبع الساقية… أحتاج المسحاة أولاً.' },
        { id: 's1', kind: 'star', x: 9, y: 7 }, { id: 's2', kind: 'star', x: 14, y: 8 }
      ],
      on: {
        rashid: async A => {
          if (A.flag('met')) return A.say([{ who: 'rashid', text: (A.goal() || {}).hint || 'بالتوفيق!' }]);
          await A.say([
            { who: 'rashid', text: 'أهلاً يا بطل. المسحاة التي نحفر بها الساقية تركتها عند منبعها، شرق الرمضاء.' },
            { who: 'rashid', text: 'لكن الرمل الآن حار جداً، ولا يُعبر إلا في الظل. والظهيرة لا ظل فيها!' },
            { who: 'rashid', text: 'هذا «الأثر»: به نعرف أدوار الماء من ظل عموده. أدِره فيتغير وقت النهار، وتتحرك ظلال النخيل معه.' }
          ]); A.flag('met', true);
        }
      },
      onSun: async (A, e) => {
        const s = ((A.flag('sun') ?? 1) + 1) % 3; A.flag('sun', s); applySun(A); A.sfx('click'); A.shake(.15); A.toast(`☀️ ${SUN[s]}: ${['الظلال تمتد غرباً', 'الظلال قصيرة نحو الشمال', 'الظلال تمتد شرقاً'][s]}`);
        const h = A.hero(), hot = A.ent(`h${h.x}_${h.y}`); if (hot && !hot.shade) { A.tp(e.x, e.y + 1); A.toast('🔥 احترق الرمل تحت قدميك! عُد إلى الظل'); }
      },
      tick: A => { if (!A.flag('island') && ISLAND.some(([x, y]) => A.heroIn(x, y, x, y))) { A.flag('island', true); A.sparkle(10, 5, '#FDE68A'); A.say([{ who: 'hero', text: 'وصلت إلى الصخرة! وهنا أثر آخر…' }]); } }
    },
    terraces: {
      theme: 'village', map: rows(TR), dark: 0,
      enter: A => { if (A.flag('flow') == null) A.flag('flow', true); A.set('sluice', { on: !!A.flag('flow') }); if (!A.flag('ter')) { A.flag('ter', true); A.say([{ who: 'muna', text: 'جئت بالمسحاة! الساقية مطمورة، والحقول الثلاثة عطشى.' }, { who: 'muna', text: 'احفر من فوهة الفلج: كل بلاطة تحفرها بجانب الساقية يجري فيها الماء. والماء الجاري لا يُمشى فيه!' }]); } },
      ents: [
        ...SOIL.map(([x, y]) => ({ id: sid(x, y), kind: 'soil', x, y })),
        { id: 'src', kind: 'soil', x: SRC[0], y: SRC[1], dug: true, src: true },
        { id: 'mouth', kind: 'well', x: 2, y: 1 },
        ...RIDGE.map(([x, y]) => ({ id: `fn${x}`, kind: 'fence', x, y })),
        { id: 'sluice', kind: 'lever', x: 5, y: 12, color: '#2F6FD6' },
        ...Object.entries(FIELDS).map(([id, [x, y]]) => ({ id, kind: 'crystal', style: 'field', x, y })),
        { id: 'muna', kind: 'npc', who: 'muna', x: 10, y: 11, face: 'up' },
        { id: 'sg2', kind: 'sign', x: 3, y: 11, text: 'بوابة الفلج: الذراع الزرقاء تفتح الماء وتغلقه. إن أغلقتها جفّت السواقي ومُشي فيها.' },
        { id: 'back', kind: 'exit', x: 1, y: 11, to: 'flats', tx: 19, ty: 6 },
        { id: 's3', kind: 'star', x: 18, y: 1 }, { id: 's4', kind: 'star', x: 10, y: 7 }, { id: 's5', kind: 'star', x: 18, y: 11 }
      ],
      on: {
        muna: A => A.say([{ who: 'muna', text: A.flag('done') ? 'ارتوت الحقول كلها! بارك الله في يديك.' : `ارتوى ${['fA', 'fB', 'fC'].filter(f => A.flag('w_' + f)).length} من ٣ حقول. ${(A.goal() || {}).hint || ''}` }])
      },
      onLever: (A, e) => { A.flag('flow', !!e.on); A.toast(e.on ? '💧 فُتحت بوابة الفلج' : '🚫 أُغلقت بوابة الفلج: تجف السواقي'); },
      onSoil: (A, e) => {
        if (!A.has('spade')) return A.toast('⛏️ أحتاج المسحاة');
        if (e.dug || !e.canDig) return A.toast('⛏️ احفر بجانب الساقية حتى يصلها الماء');
        A.set(e.id, { dug: true }); A.sfx('drop'); A.sparkle(e.x, e.y, '#A16207');
      },
      tick: (A, dt) => flow(A, dt || 1 / 60)
    }
  }
};

/* الظل حسب وقت النهار: كل بلاطة رمل حار في الظل تُعبر */
function applySun(A) {
  const s = A.flag('sun') ?? 1, set = shadeSet(s);
  HOT.forEach(([x, y]) => { const e = A.ent(`h${x}_${y}`); if (e) e.shade = set.has(x + ',' + y); });
  ['dial1', 'dial2'].forEach(id => { const e = A.ent(id); if (e) e.sun = s; });
}

/* جريان الماء: من الفوهة عبر البلاطات المحفورة المتصلة (ولا يدخل بلاطة يقف عليها البطل)، بلاطة كل ٠٫١٢ ث، ويجف ما انقطع عنه */
let acc = 0;
function flow(A, dt) {
  const at = (x, y) => A.ent(x === SRC[0] && y === SRC[1] ? 'src' : sid(x, y)), h = A.hero(), N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const on = !!A.flag('flow'), reach = new Set();
  if (on) { const q = [SRC]; reach.add(SRC + ''); while (q.length) { const [x, y] = q.shift(); N4.forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy, e = at(nx, ny); if (e && e.dug && !reach.has(nx + ',' + ny) && !(h.x === nx && h.y === ny && !e.wet)) { reach.add(nx + ',' + ny); q.push([nx, ny]); } }); } }
  acc += dt; const step = acc >= .12; if (step) acc = 0;
  const grow = [];
  [SRC, ...SOIL].forEach(([x, y]) => { const e = at(x, y); if (!e) return;
    if (e.wet && !reach.has(x + ',' + y)) e.wet = false;
    if (!e.wet && reach.has(x + ',' + y) && (e.src || N4.some(([dx, dy]) => { const n = at(x + dx, y + dy); return n && n.wet; }))) grow.push(e);
    e.canDig = A.has('spade') && !e.dug && N4.some(([dx, dy]) => { const n = at(x + dx, y + dy); return n && n.dug; }); });
  if (step) grow.forEach(e => { e.wet = true; });
  // الحقول: تروى حين يجري الماء في بلاطة تجاورها
  let fresh = false;
  Object.entries(FIELDS).forEach(([id, [x, y]]) => { const f = A.ent(id); if (!f) return; if (A.flag('w_' + id)) { f.wet = true; return; }
    if (N4.some(([dx, dy]) => { const n = at(x + dx, y + dy); return n && n.wet; })) { f.wet = true; A.flag('w_' + id, true); A.sfx('plant'); A.sparkle(x, y, '#7CC36B'); A.toast('🌱 ارتوى حقل!'); fresh = true; } });
  if (fresh && !A.flag('done') && Object.keys(FIELDS).every(id => A.flag('w_' + id))) finale(A);
  // احتياط: إن حبست السواقي البطل بعيداً عن ذراع البوابة، أغلقت منى الفلج فتجف ويُمشى فيها
  if (on && (trapT += dt) > 1) { trapT = 0; const lv = A.ent('sluice'), seen = new Set([h.x + ',' + h.y]), q = [[h.x, h.y]]; let free = false;
    while (q.length && !free) { const [x, y] = q.shift(); for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (Math.abs(nx - lv.x) + Math.abs(ny - lv.y) === 1 && !A.blockedAt(nx, ny)) { free = true; break; } if (!seen.has(k) && !A.blockedAt(nx, ny)) { seen.add(k); q.push([nx, ny]); } } }
    if (!free) { A.flag('flow', false); A.set('sluice', { on: false }); A.say([{ who: 'muna', text: 'أحاطت بك السواقي! أغلقتُ بوابة الفلج حتى تجف وتخرج، ثم افتحها بالذراع الزرقاء.' }]); } }
}
let trapT = 0;
async function finale(A) {
  A.flag('done', true); A.sfx('win'); A.shake(.3);
  await A.say([{ who: 'narrator', text: 'جرى الماء في السواقي الثلاث، واخضرّت الحقول من جديد.' },
    { who: 'muna', text: 'عادت الحياة إلى المدرّجات! سنحكي عنك كلما جرى الفلج.' },
    { who: 'narrator', text: 'وفي المزرعة، رفع عريف الفلج راشد مسحاته تحية لك.' }]);
  A.complete();
}
