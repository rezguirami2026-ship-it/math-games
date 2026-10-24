// مغامرة مكتب المحقق: «لغز الجرّة المسروقة» (الصف الثامن، الوحدة ١٠) — بمحرك المغامرات، وبآليتين جديدتين لم تُستعملا قبلها:
// «العدسة وآثار الأقدام»: آثار خفية لا تظهر إلا تحت عدسة المحقق وقرب البطل (نصف قطر بلاطتين ونصف)، تقود عبر متاهة حديقة المتحف
// (الطريق محسوب بالبحث في المتاهة، فالآثار والأدلة دائماً على طريق حقيقي)؛ و«الاستنتاج»: ثلاثة مشتبه بهم يصف كل منهم نفسه،
// وثلاثة أدلة تلتقط في الطريق، ثم يختار البطل من أخذ الجرّة (الخطأ يعطي تلميحاً بلا عقاب).
const rows = g => g.map(r => r.join ? r.join('') : r);

/* ── قاعة المتحف (١٦×١٢): القاعدة الفارغة في الوسط، والمحقق والمشتبه بهم جنوباً، وباب الحديقة شرقاً ── */
const MU = ['################', '#..............#', '#..............#', '#..............#', '#..............#', '#..............#', '#...............', '#..............#', '#..............#', '#..............#', '#..............#', '################'];
/* ── متاهة حديقة المتحف (١٩×١٣): متاهة كاملة مولّدة ببذرة ثابتة (طريق واحد بين أي خليتين، ونهايات مسدودة)، ومدخلها غرباً ── */
const GD = (() => { const W = 19, H = 13, g = Array.from({ length: H }, () => Array(W).fill('#')); let seed = 8108; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const st = [[1, 7]]; g[7][1] = '.';
  while (st.length) { const [x, y] = st[st.length - 1], nb = [[2, 0], [-2, 0], [0, 2], [0, -2]].map(([dx, dy]) => [x + dx, y + dy, dx, dy]).filter(([nx, ny]) => nx > 0 && ny > 0 && nx < W - 1 && ny < H - 1 && g[ny][nx] === '#');
    if (!nb.length) { st.pop(); continue; } const [nx, ny, dx, dy] = nb[Math.floor(rnd() * nb.length)]; g[y + dy / 2][x + dx / 2] = '.'; g[ny][nx] = '.'; st.push([nx, ny]); }
  g[7][0] = '.'; return g.map(r => r.join('')); })();
const START = [1, 7], SHED = [17, 1];
// أقصر طريق في المتاهة من المدخل إلى المخزن: عليه آثار الأقدام
const PATH = (() => { const key = (x, y) => x + ',' + y, prev = new Map([[key(...START), null]]), q = [START];
  while (q.length) { const [x, y] = q.shift(); if (x === SHED[0] && y === SHED[1]) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (GD[ny] && GD[ny][nx] === '.' && !prev.has(key(nx, ny))) { prev.set(key(nx, ny), [x, y]); q.push([nx, ny]); } } }
  const out = []; let c = SHED; while (c) { out.unshift(c); c = prev.get(key(...c)); } return out; })();
const dirOf = (a, b) => b[0] > a[0] ? 0 : b[1] > a[1] ? 1 : b[0] < a[0] ? 2 : 3;
const PRINTS = PATH.slice(1, -1).map((p, k) => ({ id: 'gp' + k, kind: 'print', x: p[0], y: p[1], d: dirOf(p, PATH[k + 2]), n: k }));
const CLUES = [['thread', PATH[Math.floor(PATH.length * .3)]], ['ticket', PATH[Math.floor(PATH.length * .65)]], ['sandal', PATH[PATH.length - 3]]];
// نجوم في نهايات مسدودة بعيدة عن الطريق
const STARS = (() => { const dist = new Map(PATH.map(p => [p + '', 0])), q = PATH.slice();
  while (q.length) { const [x, y] = q.shift(), d = dist.get([x, y] + ''); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (GD[ny] && GD[ny][nx] === '.' && !dist.has([nx, ny] + '')) { dist.set([nx, ny] + '', d + 1); q.push([nx, ny]); } } }
  const out = []; for (let y = 1; y < GD.length - 1; y++) for (let x = 1; x < 18; x++) { const d = dist.get([x, y] + ''); if (GD[y][x] !== '.' || !d || d > 20) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => GD[y + dy] && GD[y + dy][x + dx] === '.').length === 1) out.push([x, y, d]); }
  return out.sort((a, b) => a[2] - b[2]).map(([x, y]) => [x, y]); })();   // نجوم في أقرب النهايات المسدودة إلى طريق الآثار
const MU_PRINTS = [[8, 5, 1], [8, 6, 0], [9, 6, 0], [10, 6, 0], [11, 6, 0], [12, 6, 0], [13, 6, 0], [14, 6, 0]].map(([x, y, d], k) => ({ id: 'mp' + k, kind: 'print', x, y, d }));
const SUSPECTS = ['salem', 'badr', 'zayed'], CULPRIT = 1;
const clues = A => ['thread', 'ticket', 'sandal'].filter(k => A.has(k)).length;

const L = (kind, skin, robe, accent, x = {}) => ({ kind, skin, robe, accent, ...x });
export default {
  id: 'g8detective', title: 'لغز الجرّة المسروقة', icon: '🏺', stars: 3,
  start: { area: 'museum', x: 4, y: 7 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { lens: { icon: '🔎', name: 'عدسة المحقق' }, thread: { icon: '🧵', name: 'خيط أزرق' }, ticket: { icon: '🎟️', name: 'تذكرة العبّارة' }, sandal: { icon: '🩴', name: 'سير نعل مقطوع' }, jar: { icon: '🏺', name: 'الجرّة الأثرية' } },
  cast: { fahad: { name: 'المحقق فهد', look: L('man', '#A8764E', '#F4F1E8', '#1E3A8A', { beard: '#2B2118', glasses: true }) },
    salem: { name: 'الحارس سالم', look: L('man', '#C68A5B', '#1E40AF', '#FACC15', { hat: 'cap', vest: '#1E3A8A' }) },
    badr: { name: 'العامل بدر', look: L('man', '#B5835A', '#2563EB', '#F4F1E8') },
    zayed: { name: 'الزائر زايد', look: L('man', '#A8764E', '#FFFFFF', '#78350F', { beard: '#57534E' }) } },
  goals: [
    { text: 'تحدّث مع المحقق فهد', done: A => A.flag('met'), at: () => ({ area: 'museum', id: 'fahad' }), hint: 'المحقق فهد في قاعة المتحف.' },
    { text: 'اتبع آثار الأقدام بالعدسة', done: A => A.flag('garden'), at: () => ({ area: 'museum', id: 'toGarden' }), hint: 'الآثار لا تُرى إلا تحت العدسة وقريباً منك. ابدأ من القاعدة الفارغة.' },
    { text: 'اجمع الأدلة الثلاثة وجد الجرّة', done: A => A.has('jar') && clues(A) === 3, at: A => A.has('jar') ? { area: 'garden', id: 'c_' + ['thread', 'ticket', 'sandal'].find(k => !A.has(k)) } : { area: 'garden', id: 'shed' }, hint: 'كل أثر يشير إلى الخطوة التالية. والأدلة ملقاة على طريق اللص نفسه.' },
    { text: 'تحدّث مع المشتبه بهم وأخبر فهد من أخذ الجرّة', done: A => A.flag('done'), at: () => ({ area: 'museum', id: 'fahad' }), hint: 'لكل مشتبه به ملابس وحذاء وتذكرة: أيهم يطابق الأدلة الثلاثة كلها؟' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'صباح يوم المعرض في متحف القرية… والقاعدة في وسط القاعة فارغة!' },
    { who: 'narrator', text: 'الجرّة الأثرية التي عمرها خمسمئة سنة اختفت في الليل.' },
    { who: 'hero', text: 'لأسأل المحقق فهد.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).detectiveHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «المحقق الصغير»'],
  areas: {
    museum: {
      theme: 'castle', map: MU, dark: 0,
      ents: [
        ...MU_PRINTS,
        { id: 'pedestal', kind: 'sign', x: 8, y: 4, text: 'قاعدة الجرّة الأثرية: «جرّة فخار من القرن العاشر الهجري». الزجاج مفتوح… ولا أحد رأى شيئاً.' },
        { id: 'fahad', kind: 'npc', who: 'fahad', x: 3, y: 9, face: 'right', mark: A => !A.flag('met') || (A.has('jar') && clues(A) === 3 && !A.flag('done')) ? '!' : null },
        { id: 'salem', kind: 'npc', who: 'salem', x: 10, y: 9, face: 'up' }, { id: 'badr', kind: 'npc', who: 'badr', x: 12, y: 9, face: 'up' }, { id: 'zayed', kind: 'npc', who: 'zayed', x: 14, y: 9, face: 'up' },
        { id: 'toGarden', kind: 'exit', x: 15, y: 6, to: 'garden', tx: START[0], ty: START[1] },
        { id: 's1', kind: 'star', x: 14, y: 1 }
      ],
      on: {
        fahad: async A => {
          if (!A.flag('met')) { await A.say([{ who: 'fahad', text: 'وصلت في وقتك! الجرّة اختفت، ولم يُكسر قفل ولا نافذة.' }, { who: 'fahad', text: 'خذ عدستي: آثار الأقدام لا تراها العين، لكن العدسة تكشفها حين تقترب منها.' }, { who: 'fahad', text: 'ابدأ من القاعدة الفارغة، واتبع الآثار حيث تأخذك. واجمع أي دليل تجده!' }]);
            A.give('lens'); A.flag('met', true); return; }
          if (!(A.has('jar') && clues(A) === 3)) return A.say([{ who: 'fahad', text: (A.goal() || {}).hint || '' }]);
          if (A.flag('done')) return;
          const k = await A.choose('من أخذ الجرّة؟', ['الحارس سالم', 'العامل بدر', 'الزائر زايد'], 'fahad');
          if (k !== CULPRIT) return A.say([{ who: 'fahad', text: k === 0 ? 'سالم يلبس حذاء الحراسة الثقيل، والآثار آثار نعل. راجع الأدلة.' : 'زايد يلبس الأبيض كله، والخيط الذي وجدته أزرق. راجع الأدلة.' }]);
          A.flag('done', true); A.sfx('win'); A.shake(.3); A.sparkle(8, 4, '#FACC15'); A.set('pedestal', { text: 'قاعدة الجرّة الأثرية: عادت الجرّة إلى مكانها.' });
          await A.say([{ who: 'badr', text: 'نعم… أنا أخذتها! رأيت ماء المطر يقطر من السقف فوقها، فخبأتها في مخزن الحديقة لأحميها.' },
            { who: 'badr', text: 'وكنت سأخبر المحقق قبل أن أركب العبّارة… لكني نسيت من الخوف. أنا آسف.' },
            { who: 'fahad', text: 'نيّتك طيبة يا بدر، لكن الأمانة أن تخبرنا. وأنت يا بطل: كل دليل أسقط احتمالاً حتى بقي احتمال واحد!' },
            { who: 'narrator', text: 'وعادت الجرّة إلى قاعدتها قبل أن يفتح المعرض أبوابه، وأُصلح السقف في اليوم نفسه.' }]);
          A.complete();
        },
        salem: A => A.say([{ who: 'salem', text: 'أنا الحارس. ثوبي الأزرق هذا زيّ الحراسة، وحذائي الثقيل لا أخلعه أبداً. ولم أركب العبّارة في حياتي!' }]),
        badr: A => A.say([{ who: 'badr', text: 'أنا عامل النظافة. ألبس قميصي الأزرق ونعلي الخفيف… وسأسافر بالعبّارة الليلة لزيارة أهلي.' }]),
        zayed: A => A.say([{ who: 'zayed', text: 'أنا زائر من المدينة. دشداشتي بيضاء كما ترى، وأمشي بالنعل. جئت أمس بالعبّارة لأرى المعرض.' }])
      }
    },
    garden: {
      theme: 'village', map: GD, dark: 0,
      enter: A => { if (!A.flag('garden')) { A.flag('garden', true); A.toast('🌿 متاهة حديقة المتحف: اتبع الآثار بالعدسة'); } },
      ents: [
        ...PRINTS,
        ...CLUES.map(([k, [x, y]]) => ({ id: 'c_' + k, kind: 'item', x, y, item: k })),
        { id: 'shed', kind: 'chest', x: SHED[0], y: SHED[1] },
        { id: 'back', kind: 'exit', x: 0, y: 7, to: 'museum', tx: 14, ty: 6 },
        ...STARS.map(([x, y], k) => ({ id: 'gs' + k, kind: 'star', x, y })).slice(0, 2)
      ],
      on: {
        shed: async A => { if (A.has('jar')) return; A.set('shed', { open: true }); A.give('jar'); A.sfx('win'); A.sparkle(SHED[0], SHED[1], '#FACC15'); await A.say([{ who: 'hero', text: 'الجرّة! ملفوفة بقماش نظيف… من خبأها هنا كان حريصاً عليها.' }]); }
      }
    }
  }
};
export { PATH, CLUES, STARS };
