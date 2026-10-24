// مغامرة سوق العروض: «سرّ مانيكان الخيّاط» (الصف الثامن، الوحدة ٨) — بمحرك المغامرات، وبآلية جديدة لم تُستعمل قبلها:
// «المانيكان»: تماثيل عرض في محل الخيّاط القديم مربوطة بتروس تحت البلاط، فتتحرك خطوة مع كل خطوة يخطوها البطل:
// الأبيض «مرآة» يتحرك بعكس الاتجاه الأفقي (تخطو شرقاً فيخطو غرباً) وبالاتجاه العمودي نفسه، والذهبي «نسخة» يخطو مثلك تماماً،
// ولا يتحرك أيهما إن كان مكانه الجديد مسدوداً — وهذا هو مفتاح الحل. في السوق مانيكان مرآة يسدّ الممر ويُبعَد إلى كوّة،
// وفي المحل يجب أن يقف كل مانيكان على منصته (محسوب بحلّال: ١٣ خطوة) ليُفتح زجاج العرض ويظهر مفتاح بوابة السوق.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── السوق المسقوف ليلاً (١٨×١٢): ممر الدكاكين شمالاً (الصف ٦) وفيه كوّة واحدة، والساحة جنوبه، وبينهما جدار بفتحة واحدة ── */
const SQ = grid(18, 12); rect(SQ, 2, 6, 16, 6, '.'); SQ[5][11] = '.'; SQ[7][8] = '.'; rect(SQ, 1, 8, 16, 10, '.'); SQ[11][8] = '.';
/* ── محل الخيّاط (١٤×١٣): الصالة ورفوف القماش، ومنصتا العرض شمالاً، وزجاج العرض وصندوق المفتاح خلفه ── */
const TL = ['##############', '#######.######', '#######.######', '#............#', '#.##......##.#', '#....#..#....#', '#............#', '#..#......#..#', '#.....##.....#', '#............#', '#.##......##.#', '#............#', '######.#######'];
const TWINS = { tm: { x: 4, y: 6, mode: 'mirror', col: '#F8FAFC' }, tc: { x: 9, y: 6, mode: 'copy', col: '#FACC15' } };
const STANDS = { pm: [6, 3, 'tm', '#64748B'], pc: [9, 3, 'tc', '#CA8A04'] };   // [س، ص، مانيكانها، لونها]
const onStands = A => Object.values(STANDS).every(([x, y, id]) => { const e = A.ent(id); return e && e.x === x && e.y === y; });
const SQ_TWIN = { x: 14, y: 6 };

const THUWAINI = { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#EA580C', beard: '#2B2118' };
const KHAYYAT = { kind: 'man', skin: '#C68A5B', robe: '#E0E7FF', accent: '#4338CA', beard: '#D6D3D1', elder: true, glasses: true };

export default {
  id: 'g8offers', title: 'سرّ مانيكان الخيّاط', icon: '🧥', stars: 4,
  start: { area: 'souq', x: 5, y: 9 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { key: { icon: '🗝️', name: 'مفتاح بوابة السوق' } },
  cast: { thuwaini: { name: 'التاجر ثويني', look: THUWAINI }, khayyat: { name: 'الخيّاط أبو سالم', look: KHAYYAT } },
  goals: [
    { text: 'تحدّث مع التاجر ثويني', done: A => A.flag('met'), at: () => ({ area: 'souq', id: 'thuwaini' }), hint: 'ثويني في ساحة السوق.' },
    { text: 'أبعِد المانيكان عن الممر وادخل محل الخيّاط', done: A => A.flag('tailor'), at: () => ({ area: 'souq', id: 'toTailor' }), hint: 'المانيكان الأبيض مرآة: كل خطوة شرقاً تحرّكه غرباً. في الجدار الشمالي للممر كوّة واحدة… متى يكون تحتها تماماً؟ وماذا يحدث له إن خطوت أنت شمالاً؟' },
    { text: 'أوقف كل مانيكان على منصته', done: A => A.flag('open'), at: () => ({ area: 'tailor', id: 'khayyat' }), hint: 'الأبيض مرآة والذهبي نسخة، ولا يتحرك أيهما إن اصطدم بجدار أو رف. استعمل الجدران لتوقف واحداً بينما يتحرك الآخر. والذراع تعيدهما.' },
    { text: 'خذ المفتاح وأوصله إلى ثويني قبل الفجر', done: A => A.flag('done'), at: A => A.has('key') ? { area: 'souq', id: 'thuwaini' } : { area: 'tailor', id: 'prize' }, hint: 'انفتح زجاج العرض: المفتاح في الصندوق خلفه.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'ليلة التخفيضات الكبرى في سوق العروض… وبعد ساعات يفتح السوق أبوابه للناس.' },
    { who: 'narrator', text: 'لكن مفتاح بوابة السوق حُبس خلف زجاج العرض في محل الخيّاط القديم!' },
    { who: 'hero', text: 'لأسأل التاجر ثويني.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).offersHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «بطل السوق»'],
  areas: {
    souq: {
      theme: 'village', map: rows(SQ), dark: 0,
      ents: [
        { id: 'tw0', kind: 'twin', x: SQ_TWIN.x, y: SQ_TWIN.y, mode: 'mirror', col: '#F8FAFC' },
        { id: 'thuwaini', kind: 'npc', who: 'thuwaini', x: 3, y: 9, face: 'right', mark: A => !A.flag('met') || (A.has('key') && !A.flag('done')) ? '!' : null },
        { id: 'reset0', kind: 'lever', x: 15, y: 10, color: '#F59E0B' },
        { id: 'sg1', kind: 'sign', x: 6, y: 10, text: 'محل الخيّاط أبو سالم: «مانيكانات جدّي تمشي معك! الأبيض مرآة لك، والذهبي ظلّك».' },
        { id: 'gateMain', kind: 'gate', x: 8, y: 11, when: A => A.flag('done'), openMsg: '🔓 انفتحت بوابة السوق!' },
        { id: 'toTailor', kind: 'exit', x: 16, y: 6, to: 'tailor', tx: 6, ty: 11 },
        { id: 's1', kind: 'star', x: 2, y: 6 }, { id: 's2', kind: 'star', x: 16, y: 10 }
      ],
      on: {
        thuwaini: async A => {
          if (A.has('key') && !A.flag('done')) {
            A.flag('done', true); A.sfx('win'); A.shake(.3); A.sparkle(8, 11, '#FACC15');
            await A.say([{ who: 'thuwaini', text: 'المفتاح! أنقذت ليلة التخفيضات يا بطل!' },
              { who: 'narrator', text: 'دار المفتاح في القفل، وارتفعت بوابة السوق مع أول ضوء للفجر.' },
              { who: 'thuwaini', text: 'وعرفنا السرّ: المرآة تعكس خطواتك، والظل يتبعها، والجدار يوقف أحدهما ليتحرك الآخر.' },
              { who: 'narrator', text: 'وامتلأ سوق العروض بالناس، ولافتات التخفيضات تتأرجح فوق رؤوسهم.' }]);
            return A.complete();
          }
          if (A.flag('met')) return A.say([{ who: 'thuwaini', text: (A.goal() || {}).hint || 'بالتوفيق يا بطل!' }]);
          await A.say([
            { who: 'thuwaini', text: 'أهلاً يا بطل! غداً أكبر يوم تخفيضات في السنة، وبوابة السوق مقفلة!' },
            { who: 'thuwaini', text: 'نسيت المفتاح على منصة العرض في محل الخيّاط أبو سالم، فأغلق زجاج العرض عليه وذهب إلى بيته.' },
            { who: 'thuwaini', text: 'والمحل في آخر الممر الشمالي… لكن انتبه: مانيكانات أبو سالم القديمة تمشي مع كل خطوة تخطوها!' }
          ]); A.flag('met', true);
        }
      },
      onLever: A => { A.set('tw0', { x: SQ_TWIN.x, y: SQ_TWIN.y }); A.set('reset0', { on: false }); A.toast('🔄 عاد المانيكان إلى مكانه'); },
      onTwin: A => { const e = A.ent('tw0'); if (e.x === 11 && e.y === 5 && !A.flag('niche')) { A.flag('niche', true); A.toast('✨ دخل المانيكان الكوّة! الممر مفتوح'); A.sfx('win'); } }
    },
    tailor: {
      theme: 'kitchen', map: TL, dark: 0,
      ents: [
        ...Object.entries(STANDS).map(([id, [x, y, , col]]) => ({ id, kind: 'plate', x, y, col })),
        ...Object.entries(TWINS).map(([id, d]) => ({ id, kind: 'twin', ...d })),
        { id: 'glass', kind: 'gate', x: 7, y: 2, when: A => A.flag('open'), openMsg: '🔓 انفتح زجاج العرض!' },
        { id: 'prize', kind: 'chest', x: 7, y: 1, item: 'key' },
        { id: 'khayyat', kind: 'npc', who: 'khayyat', x: 1, y: 11, face: 'right' },
        { id: 'reset', kind: 'lever', x: 12, y: 11, color: '#F59E0B' },
        { id: 'back', kind: 'exit', x: 6, y: 12, to: 'souq', tx: 15, ty: 6 },
        { id: 's3', kind: 'star', x: 12, y: 3 }, { id: 's4', kind: 'star', x: 1, y: 3 }
      ],
      on: { khayyat: A => A.say([{ who: 'khayyat', text: A.flag('open') ? 'انفتح الزجاج! المفتاح في الصندوق.' : (A.goal() || {}).hint || '' }]) },
      onLever: A => { if (A.flag('open')) { A.set('reset', { on: false }); return A.toast('🔒 الزجاج مفتوح: توقفت التروس'); } Object.entries(TWINS).forEach(([id, d]) => A.set(id, { x: d.x, y: d.y })); A.set('reset', { on: false }); A.toast('🔄 عاد المانيكانان إلى مكانهما'); },
      enter: A => { if (A.flag('open')) Object.keys(TWINS).forEach(id => A.set(id, { frozen: true })); else if (!A.flag('tailor')) { A.flag('tailor', true); A.say([{ who: 'khayyat', text: 'جئت تأخذ مفتاح ثويني؟ أنا أبو سالم. زجاج العرض لا يُفتح إلا إذا وقف كل مانيكان على منصته.' }, { who: 'khayyat', text: 'الأبيض على المنصة الرمادية، والذهبي على المنصة الذهبية. الأبيض يعكس خطوتك يميناً ويساراً، والذهبي يقلّدها. والجدار يوقف من يصطدم به!' }]); } },
      tick: A => { if (!A.flag('open') && onStands(A)) { A.flag('open', true); Object.keys(TWINS).forEach(id => A.set(id, { frozen: true }));   /* تتوقف التروس حين ينفتح الزجاج */ A.sfx('win'); A.sparkle(7, 2, '#FACC15'); A.say([{ who: 'khayyat', text: 'كل مانيكان على منصته! انفتح زجاج العرض.' }]); } }
    }
  }
};
