// المغامرة ٣: «الجزيرة المفقودة» — تُفتح بعد وحدة الهندسة. عاصفة تحطّم مركب القبطان سيف، فيستيقظ البطل على جزيرة مجهولة.
// شاطئ فيه سرطانات تتحرك، أدغال تُشق بالساطور، كوخ مهجور فيه فانوس، كهف مظلم بلغز مرايا يعكس شعاع الشمس إلى بلّورة،
// شراع مخبأ، ثم بناء طوف وإشعال نار الإشارة للعودة. بلا رياضيات ولا مؤقت ولا عقاب.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const rows = g => g.map(r => r.join(''));

/* ── الشاطئ والأدغال (٣٠×٢٢) ── */
const B = grid(30, 22); border(B, 'T');
rect(B, 1, 1, 28, 8, ','); rect(B, 1, 9, 28, 10, 'T'); pts(B, [[14, 9], [15, 9], [14, 10], [15, 10]], '"');   // حزام الأدغال، وممر شوك يُشق
pts(B, [[3, 3], [6, 6], [22, 2], [25, 6], [9, 2], [19, 7], [4, 7]], 'T'); rect(B, 14, 1, 15, 1, '_'); B[0][14] = '_';
rect(B, 1, 19, 28, 20, '~'); rect(B, 26, 11, 28, 18, '~'); rect(B, 0, 21, 29, 21, '~');
pts(B, [[1, 11], [1, 12], [2, 11], [12, 11], [20, 11], [24, 11]], 'T');

/* ── الكهف (٢٨×١٨) ── */
const C = grid(28, 18, 'c'); border(C);
rect(C, 1, 1, 26, 2, '#'); rect(C, 1, 15, 26, 16, '#'); rect(C, 6, 7, 8, 9, '#'); rect(C, 13, 3, 14, 4, '#'); rect(C, 15, 8, 17, 10, '#');
rect(C, 21, 3, 21, 11, '#'); rect(C, 21, 13, 21, 14, '#');   // جدار يفصل المخزن (الباب عند ٢١،١٢)
C[9][0] = '_';

const SAIF = { kind: 'man', robe: '#F4F1E8', accent: '#1F4E79', skin: '#B97F52', beard: '#5A5A5A', hat: 'cap', build: 1.08 };
export default {
  id: 'island', title: 'الجزيرة المفقودة', icon: '🏝️', stars: 5,
  start: { area: 'beach', x: 6, y: 13 },
  items: { machete: { icon: '🔪', name: 'الساطور' }, plank: { icon: '🪵', name: 'لوح من حطام المركب' }, lantern: { icon: '🏮', name: 'فانوس الكوخ' }, sail: { icon: '⛵', name: 'الشراع القديم' }, flint: { icon: '🔥', name: 'حجر الصوان' } },
  cast: { saif: { name: 'القبطان سيف', look: SAIF } },
  goals: [
    { text: 'استيقظتَ على الشاطئ… تحدّث مع القبطان سيف', done: A => A.flag('met'), at: () => ({ area: 'beach', id: 'saif' }), hint: 'القبطان جالس قرب حطام المركب.' },
    { text: 'افتح صندوق الحطام وخذ الساطور', done: A => A.has('machete') || A.flag('cutDone'), at: () => ({ area: 'beach', id: 'c_wreck' }), hint: 'الصندوق بجانب المركب المحطم.' },
    { text: 'اجمع ٣ ألواح من الحطام على الشاطئ (ابتعد عن السرطانات!)', done: A => A.count('plank') >= 3 || A.flag('raft'), at: A => ({ area: 'beach', id: ['pk1', 'pk2', 'pk3'].find(id => !(A.ent(id) || {}).got) || 'pk1' }), hint: 'السرطانات تمشي ذهاباً وإياباً. انتظر حتى تبتعد ثم امشِ.' },
    { text: 'اشقّ طريقاً في الأدغال بالساطور (انقر على الشجيرات)', done: A => A.flag('cutDone'), at: () => ({ area: 'beach', x: 14, y: 10 }), hint: 'الشجيرات الشائكة وسط حزام الأشجار. انقر عليها والساطور معك.' },
    { text: 'ادخل الكوخ المهجور وخذ الفانوس', done: A => A.has('lantern'), at: () => ({ area: 'beach', id: 'c_hut' }), hint: 'الكوخ خلف الأدغال، والصندوق بجانب بابه.' },
    { text: 'ادخل الكهف المظلم شمال الجزيرة', done: A => A.flag('cave'), at: () => ({ area: 'cave', x: 1, y: 9 }), hint: 'المدخل في أعلى الجزيرة بعد الكوخ.' },
    { text: 'أدر المرآتين حتى يصل شعاع الشمس إلى البلّورة', done: A => A.flag('beam'), at: A => ({ area: 'cave', id: (A.ent('m1') || {}).r % 2 ? 'm2' : 'm1' }), hint: 'انقر على المرآة لتدور. اتبع الشعاع الذهبي: يجب أن ينزل من المرآة الأولى، ثم ينعطف يميناً عند الثانية.' },
    { text: 'خذ الشراع القديم من المخزن السري', done: A => A.has('sail') || A.flag('raft'), at: () => ({ area: 'cave', id: 'c_sail' }), hint: 'الباب انفتح شرق الكهف.' },
    { text: 'ابنِ الطوف على الشاطئ الشرقي (انقر على الإطار الذهبي)', done: A => A.flag('raft'), at: () => ({ area: 'beach', id: 'raft' }), hint: 'الطوف يحتاج ٣ ألواح والشراع.' },
    { text: 'أشعل نار الإشارة ليراك صيادو القرية', done: A => A.flag('signal'), at: () => ({ area: 'beach', id: 'signal' }), hint: 'كومة الحطب قرب الطوف. حجر الصوان مع القبطان.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'هبّت عاصفة على مركب القبطان سيف في عرض البحر… ثم صمت.' },
    { who: 'narrator', text: 'تفتح عينيك على رمل دافئ وموج هادئ. جزيرة لم ترها من قبل، وحطام المركب على الشاطئ!' },
    { who: 'hero', text: 'أين القبطان؟ يجب أن أجده… وأن نجد طريق العودة إلى قرية الخير.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 30; s.decor = s.decor || {}; s.decor.anchor = s.decor.anchor || Date.now(); },
  rewards: ['💎 ٣٠ جوهرة', '⚓ المرساة الذهبية في ساحة القرية', '🏅 وسام «ناجي الجزيرة»'],
  areas: {
    beach: {
      theme: 'island', map: rows(B), dark: 0,
      ents: [
        { id: 'wreck', kind: 'boat', x: 5, y: 16, wreck: true }, { id: 'c_wreck', kind: 'chest', x: 8, y: 16, item: 'machete' },
        { id: 'saif', kind: 'npc', who: 'saif', x: 4, y: 13, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'fire1', kind: 'safe', x: 9, y: 13 },
        { id: 'pk1', kind: 'item', x: 13, y: 16, item: 'plank' }, { id: 'pk2', kind: 'item', x: 19, y: 13, item: 'plank' }, { id: 'pk3', kind: 'item', x: 23, y: 17, item: 'plank' },
        { id: 'cb1', kind: 'hazard', creature: 'crab', path: [[11, 17], [17, 17]], speed: 1.3, r: .55, caughtMsg: '🦀 قرصك السرطان! تعود إلى النار… انتظر حتى يبتعد ثم امشِ.' },
        { id: 'cb2', kind: 'hazard', creature: 'crab', path: [[21, 12], [21, 17]], speed: 1.1, r: .55, caughtMsg: '🦀 قرصك السرطان! تعود إلى النار… انتظر حتى يبتعد ثم امشِ.' },
        { id: 'cb3', kind: 'hazard', creature: 'crab', path: [[15, 14], [22, 14]], speed: .9, r: .55, caughtMsg: '🦀 قرصك السرطان! تعود إلى النار… انتظر حتى يبتعد ثم امشِ.' },
        { id: 'hut', kind: 'house', x: 11, y: 4, w: 3, h: 2, roof: '#B88A5A', face: '#9C6A3A' }, { id: 'c_hut', kind: 'chest', x: 15, y: 4, item: 'lantern' },
        { id: 'sgH', kind: 'sign', x: 17, y: 5, text: 'كوخ قديم… على الباب نقش: «من يحمل النور يجد الشراع في قلب الجبل».' },
        { id: 'raft', kind: 'site', x: 25, y: 15, model: 'raft' }, { id: 'signal', kind: 'beacon', x: 24, y: 13 },
        { id: 'toCave', kind: 'exit', x: 14, y: 0, to: 'cave', tx: 1, ty: 9, when: A => A.has('lantern'), locked: 'ظلام دامس داخل الكهف… أحتاج نوراً قبل أن أدخل.' },
        { id: 's1', kind: 'star', x: 26, y: 2 }, { id: 's2', kind: 'star', x: 2, y: 17 }, { id: 's3', kind: 'star', x: 7, y: 2 }
      ],
      onSolid: (A, x, y, ch) => {
        if (ch === '"') { if (A.has('machete')) { A.cut(x, y); A.sfx('plant'); const cut = k => A.S.cut['beach:' + k]; if ((cut('14,9') && cut('14,10')) || (cut('15,9') && cut('15,10'))) { A.flag('cutDone', true); A.toast('🌿 انفتح طريق عبر الأدغال!'); } else A.toast('🔪 شققتَ جزءاً من الأدغال'); } else A.toast('🌿 أدغال شائكة كثيفة… الساطور في صندوق الحطام.'); return true; }
      },
      on: {
        saif: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'saif', text: 'الحمد لله أنك بخير يا بطل! رجلي التوت حين ضربت الموجةُ المركب، لا أستطيع المشي كثيراً.' },
              { who: 'saif', text: 'نحتاج طوفاً: ثلاثة ألواح من الحطام، وشراعاً. في صندوق الحطام ساطور يشق لك الأدغال.' },
              { who: 'saif', text: 'وانتبه للسرطانات على الرمل، تقرص من يقترب. امشِ حين تبتعد.' },
              { who: 'saif', text: 'وخذ حجر الصوان هذا. حين يجهز الطوف أشعل به نار الإشارة، فيراها صيادو قريتنا.' }
            ]); A.flag('met', true); A.give('flint', 1, true); return;
          }
          A.say([{ who: 'saif', text: A.flag('raft') ? 'الطوف جاهز! أشعل نار الإشارة.' : A.has('sail') ? 'وجدت الشراع! ابنِ الطوف عند الشاطئ الشرقي.' : 'أنت قادر على ذلك. ' + ((A.goal() || {}).hint || '') }]);
        },
        raft: async (A, e) => {
          if (e.built) return;
          if (A.count('plank') < 3 || !A.has('sail')) return A.say([{ who: 'narrator', text: `الطوف يحتاج ٣ ألواح (معك ${A.count('plank')}) والشراع${A.has('sail') ? ' (معك)' : ' (لم تجده بعد)'}.` }]);
          A.take('plank', 3); A.take('sail'); A.set('raft', { built: true }); A.flag('raft', true); A.sfx('win'); A.shake(.3); A.sparkle(25, 15, '#C88A4A');
          A.say([{ who: 'narrator', text: 'ربطتَ الألواح بالحبال ونصبتَ الشراع… طوف متين جاهز للإبحار!' }]);
        },
        signal: async (A, e) => {
          if (e.lit) return;
          if (!A.flag('raft')) return A.say([{ who: 'narrator', text: 'كومة حطب للإشارة. أشعلها حين يجهز الطوف.' }]);
          A.set('signal', { lit: true }); A.flag('signal', true); A.sfx('gate'); A.sparkle(24, 12, '#FF8A1E');
          await A.say([
            { who: 'narrator', text: 'ارتفع لهب نار الإشارة عالياً، ورأى صيادو قرية الخير الدخان من بعيد!' },
            { who: 'saif', text: 'انظر! مراكب الصيادين قادمة لترافقنا. ركبنا الطوف، والبحر هادئ.' },
            { who: 'saif', text: 'لولا شجاعتك لبقينا على هذه الجزيرة طويلاً. أنت بحّار حقيقي يا بطل!' }
          ]);
          A.complete();
        }
      }
    },
    cave: {
      theme: 'cave', map: rows(C), dark: .8,
      enter: A => { if (!A.flag('cave')) { A.flag('cave', true); A.say([{ who: 'narrator', text: 'كهف بارد وصامت… وفي سقفه فتحة صغيرة يدخل منها شعاع شمس ذهبي.' }, { who: 'hero', text: 'هناك بلّورة زرقاء عند الجدار الشرقي، ومرآتان قديمتان. لعلّ الشعاع يفتح شيئاً!' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 9, to: 'beach', tx: 14, ty: 1 },
        { id: 'fireC', kind: 'safe', x: 2, y: 11 },
        { id: 'sun', kind: 'beam', x: 3, y: 5, dir: 0, light: 2 },
        { id: 'm1', kind: 'rot', style: 'mirror', x: 10, y: 5, r: 0 },
        { id: 'm2', kind: 'rot', style: 'mirror', x: 10, y: 12, r: 0 },
        { id: 'cr', kind: 'crystal', x: 18, y: 12 },
        { id: 'sgM', kind: 'sign', x: 4, y: 7, text: 'نقش قديم: «اجعل نور الشمس يلمس البلّورة الزرقاء، فينفتح قلب الجبل». انقر على المرآة لتدور.' },
        { id: 'door', kind: 'door', x: 21, y: 12, when: A => A.flag('beam'), openMsg: '🔓 انفتح باب المخزن السري!', name: 'باب المخزن', locked: 'باب حجري ثقيل لا يتحرك… لعل البلّورة تفتحه.' },
        { id: 'c_sail', kind: 'chest', x: 24, y: 12, item: 'sail' },
        { id: 's4', kind: 'star', x: 25, y: 4 }, { id: 's5', kind: 'star', x: 2, y: 14 }
      ],
      tick: A => { const c = A.ent('cr'); if (c && c.lit && !A.flag('beam')) { A.flag('beam', true); A.sfx('win'); A.shake(.4); A.toast('💎 أضاءت البلّورة الزرقاء!'); } },
      on: { cr: A => A.say([{ who: 'narrator', text: A.ent('cr').lit ? 'البلّورة تتوهج بنور الشمس!' : 'بلّورة زرقاء باردة… تنتظر النور.' }]) }
    }
  }
};
