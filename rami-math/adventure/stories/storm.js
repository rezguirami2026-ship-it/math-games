// المغامرة ٢: «العاصفة الكبرى» — تُفتح بعد وحدة القياس. عاصفة رعدية تضرب سوق الوادي: رياح تدفع البطل (يحتمي خلف الجدران)،
// قيادة أم خالد وطفليها إلى الملجأ، إصلاح الجسر بالألواح، صخور تتدحرج في الوادي، ماعز تائهة تُعاد إلى الحظيرة،
// لغز دوّارات الريح، ثم قرع جرس البرج فتهدأ العاصفة ويظهر قوس قزح. بلا رياضيات، بلا مؤقت، بلا عقاب.
const grid = (w, h, f = '.') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const border = (g, ch = '#') => { const h = g.length, w = g[0].length; rect(g, 0, 0, w - 1, 0, ch); rect(g, 0, h - 1, w - 1, h - 1, ch); rect(g, 0, 0, 0, h - 1, ch); rect(g, w - 1, 0, w - 1, h - 1, ch); };
const pts = (g, list, ch) => list.forEach(([x, y]) => { g[y][x] = ch; });
const flowers = g => g.forEach((r, y) => r.forEach((c, x) => { if (c === '.' && (x * 5 + y * 11) % 9 === 0) r[x] = ','; }));
const rows = g => g.map(r => r.join(''));

/* ── سوق الوادي تحت العاصفة (٣٠×٢٢) ── */
const M = grid(30, 22); border(M); flowers(M);
rect(M, 25, 1, 27, 20, '~'); rect(M, 1, 10, 24, 10, '_'); rect(M, 28, 10, 29, 10, '_'); rect(M, 4, 5, 4, 9, '_');
pts(M, [[1, 1], [8, 1], [22, 1], [1, 20], [12, 20], [23, 20], [28, 2], [28, 18], [7, 20]], 'T');
rect(M, 1, 12, 3, 13, ';');

/* ── الوادي والبرج (٣٠×٢٢) ── */
const V = grid(30, 22); border(V); flowers(V); V[10][0] = '_';
rect(V, 1, 10, 12, 10, '_'); rect(V, 12, 10, 25, 10, '_'); rect(V, 25, 9, 25, 10, '_');
pts(V, [[9, 3], [10, 15], [21, 19], [5, 20], [27, 14], [1, 1], [11, 6]], 'T');
rect(V, 26, 17, 28, 19, ';');

const COL = { mubarak: { kind: 'man', robe: '#E9DCC3', accent: '#8B5A2B', skin: '#C98E5F', beard: '#5A5A5A', apron: '#7A5230', build: 1.1 } };
const kid = (id, kind, x, y, accent) => ({ id, kind: 'npc', who: id, x, y, face: 'up', look: undefined, accent });
const goat = (id, x, y) => ({ id, kind: 'animal', creature: 'goat', x, y, mark: A => A.ent(id).follow || A.flag('pen_' + id) ? null : '!' });

export default {
  id: 'storm', title: 'العاصفة الكبرى', icon: '🌪️', stars: 5,
  start: { area: 'market', x: 4, y: 7 },
  items: { plank: { icon: '🪵', name: 'لوح خشب' }, rope: { icon: '🪢', name: 'حبل متين' } },
  cast: {
    mubarak: { name: 'النجار مبارك', look: COL.mubarak },
    umkhalid: { name: 'أم خالد', look: { kind: 'woman', robe: '#3E7C6B', accent: '#7B3F98', skin: '#D9A374' } },
    salim: { name: 'سليم', look: { kind: 'boy', robe: '#F7F5EF', accent: '#2F6FB2', skin: '#D9A374', hat: 'cap' } },
    hind: { name: 'هند', look: { kind: 'girl', robe: '#C0392B', accent: '#F2C14E', skin: '#D9A374' } },
    juma: { name: 'الراعي جمعة', look: { kind: 'man', robe: '#EFE6D2', accent: '#7B3F98', skin: '#B97F52', beard: '#2B2B2B', tool: 'cane' } }
  },
  goals: [
    { text: 'احتمِ من المطر وتحدّث مع النجار مبارك تحت مظلته', done: A => A.flag('met'), at: () => ({ area: 'market', id: 'mubarak' }), hint: 'النجار تحت المظلة الحمراء شمال السوق. اتبع الماسة الذهبية.' },
    { text: 'اجمع ٣ ألواح خشب طارت بها الريح (احتمِ خلف الصناديق عند الهبّات)', done: A => A.count('plank') >= 3 || A.flag('bridge'), at: A => ({ area: 'market', id: ['pl1', 'pl2', 'pl3'].find(id => !(A.ent(id) || {}).got) || 'pl1' }), hint: 'حين يظهر «⚠️ هبّة ريح قادمة» قف خلف صندوق أو برميل، فهو يحميك من الدفع.' },
    { text: 'تحدّث مع أم خالد وطفليها الخائفين جنوب السوق', done: A => A.flag('leading') || A.flag('sheltered'), at: () => ({ area: 'market', id: 'umkhalid' }), hint: 'أم خالد عند الصناديق المكسورة جنوب غرب السوق.' },
    { text: 'قُد أم خالد وسليم وهند إلى الملجأ (القلعة الصغيرة شمال غرب السوق)', done: A => A.flag('sheltered'), at: () => ({ area: 'market', x: 4, y: 6 }), hint: 'امشِ وهم يتبعونك. حين تصلون أمام باب القلعة يدخلون وحدهم.' },
    { text: 'أصلح الجسر المكسور: انقر على الماء عند الجسر لتضع الألواح', done: A => A.flag('bridge'), at: A => ({ area: 'market', id: ['b1', 'b2', 'b3'].find(id => !(A.ent(id) || {}).built) || 'b1' }), hint: 'الإطار الذهبي على الماء مكان كل لوح. انقر عليه والألواح معك.' },
    { text: 'اعبر الجسر شرقاً إلى الوادي', done: A => A.flag('valley'), at: () => ({ area: 'valley', x: 1, y: 10 }), hint: 'بعد الجسر، اتبع الطريق إلى المخرج الشرقي.' },
    { text: 'تحدّث مع الراعي جمعة', done: A => A.flag('juma'), at: () => ({ area: 'valley', id: 'juma' }), hint: 'الراعي قرب حظيرته غرب الوادي.' },
    { text: 'أعد الماعز الثلاث إلى الحظيرة (انقر على الماعز فتتبعك)', done: A => ['g1', 'g2', 'g3'].every(g => A.flag('pen_' + g)), at: A => { const g = ['g1', 'g2', 'g3'].find(id => !A.flag('pen_' + id)); return (A.ent(g) || {}).follow ? { area: 'valley', x: 4, y: 15 } : { area: 'valley', id: g }; }, hint: 'انقر على العنزة فتمشي خلفك، ثم ادخل الحظيرة من فتحتها العلوية. احذر الصخور المتدحرجة!' },
    { text: 'وجّه دوّارات الريح الثلاث مثل الدوّارة الذهبية الكبيرة', done: A => A.flag('vanes'), at: A => ({ area: 'valley', id: ['v1', 'v2', 'v3'].find(id => (A.ent(id) || {}).r !== (A.ent('vm') || {}).r) || 'v1' }), hint: 'انقر على كل دوّارة لتدور ربع دورة، حتى يشير سهمها مثل الدوّارة الكبيرة داخل ساحة البرج.' },
    { text: 'اقرع جرس البرج لتنادي أهل الوادي وتهدأ العاصفة', done: A => A.flag('calm'), at: () => ({ area: 'valley', id: 'bell' }), hint: 'البوابة انفتحت. الجرس في ساحة البرج.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'سماء سوداء فوق سوق الوادي، وبرق يضيء القمم… العاصفة الكبرى وصلت قبل موعدها!' },
    { who: 'narrator', text: 'الريح تقلب المظلات، والجسر الخشبي فوق الوادي انكسر، وماعز الراعي هربت في كل اتجاه.' },
    { who: 'hero', text: 'لا وقت للخوف. النجار مبارك يعرف السوق جيداً، سأبدأ به.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 30; s.decor = s.decor || {}; s.decor.bell = s.decor.bell || Date.now(); },
  rewards: ['💎 ٣٠ جوهرة', '🔔 جرس الوادي يُعلّق في ساحة القرية', '🏅 وسام «بطل العاصفة»'],
  areas: {
    market: {
      theme: 'storm', map: rows(M), dark: .42, rain: true,
      wind: { period: 7, dur: 2.2, dx: -1, dy: 0, force: 2.4, zones: [[6, 6, 23, 17]], until: A => A.flag('calm') },
      ents: [
        { id: 'shelter', kind: 'house', x: 2, y: 4, w: 4, h: 3, roof: '#C9BCA0' }, { id: 'sgS', kind: 'sign', x: 7, y: 5, text: 'الملجأ: القلعة الصغيرة. جدرانها صمدت مئة عاصفة.' },
        { id: 'h1', kind: 'house', x: 13, y: 3, w: 3, h: 2 }, { id: 'h2', kind: 'house', x: 18, y: 3, w: 3, h: 2, roof: '#D9C6A0' },
        { id: 'stall', kind: 'tent', x: 10, y: 3, color: '#B0243C' }, { id: 'mubarak', kind: 'npc', who: 'mubarak', x: 10, y: 4, face: 'down', mark: A => A.flag('met') ? null : '!' },
        { id: 'c1', kind: 'crates', x: 12, y: 8 }, { id: 'c2', kind: 'crates', x: 17, y: 12 }, { id: 'c3', kind: 'crates', x: 21, y: 8 }, { id: 'c4', kind: 'barrel', x: 9, y: 13 }, { id: 'c5', kind: 'barrel', x: 15, y: 15 }, { id: 'c6', kind: 'barrel', x: 19, y: 6 }, { id: 'c7', kind: 'crates', x: 15, y: 9 }, { id: 'c8', kind: 'barrel', x: 22, y: 13 },
        { id: 'pl1', kind: 'item', x: 14, y: 9, item: 'plank' }, { id: 'pl2', kind: 'item', x: 20, y: 14, item: 'plank' }, { id: 'pl3', kind: 'item', x: 8, y: 17, item: 'plank' },
        { id: 'broken', kind: 'crates', x: 4, y: 17 },
        { id: 'umkhalid', kind: 'npc', who: 'umkhalid', x: 5, y: 18, face: 'up', mark: A => A.flag('leading') || A.flag('sheltered') ? null : '!' },
        { id: 'salim', kind: 'npc', who: 'salim', x: 4, y: 19, face: 'up' }, { id: 'hind', kind: 'npc', who: 'hind', x: 6, y: 19, face: 'up' },
        { id: 'b1', kind: 'site', x: 25, y: 10, model: 'bridge' }, { id: 'b2', kind: 'site', x: 26, y: 10, model: 'bridge' }, { id: 'b3', kind: 'site', x: 27, y: 10, model: 'bridge' },
        { id: 'sgB', kind: 'sign', x: 24, y: 9, text: 'الجسر انكسر! الإطارات الذهبية على الماء أماكن الألواح. انقر عليها والألواح معك.' },
        { id: 'safe1', kind: 'safe', x: 6, y: 8 }, { id: 'safe2', kind: 'safe', x: 23, y: 11 },
        { id: 'toValley', kind: 'exit', x: 29, y: 10, to: 'valley', tx: 1, ty: 10, when: A => A.flag('bridge') && A.flag('sheltered'), locked: 'لن أترك أم خالد وطفليها في العاصفة… سأوصلهم إلى الملجأ أولاً.' },
        { id: 's1', kind: 'star', x: 23, y: 2 }, { id: 's2', kind: 'star', x: 1, y: 15 }
      ],
      tick: A => {
        if (A.flag('leading') && !A.flag('sheltered') && ['umkhalid', 'salim', 'hind'].every(id => A.near(id, 1, 5, 8, 9))) {
          A.flag('sheltered', true); [['umkhalid', 3, 6], ['salim', 2, 6], ['hind', 5, 6]].forEach(([id, x, y]) => A.unfollow(id, x, y)); A.sfx('win');
          A.say([{ who: 'umkhalid', text: 'الحمد لله، وصلنا سالمين! جدران القلعة قوية. اذهب يا بطل، الوادي يحتاجك.' }, { who: 'hind', text: 'شكراً لأنك لم تتركنا!' }]);
        }
      },
      on: {
        mubarak: async A => {
          if (!A.flag('met')) {
            await A.say([
              { who: 'mubarak', text: 'تعال تحت المظلة بسرعة! هذه أقوى عاصفة رأيتها في حياتي.' },
              { who: 'mubarak', text: 'الريح كسرت الجسر وطيّرت ألواح دكاني في الساحة. نحتاج ثلاثة ألواح لنصلحه.' },
              { who: 'mubarak', text: 'وانتبه: حين تشتد الهبّة قف خلف صندوق أو برميل. الريح تدفع من الشرق إلى الغرب، فاختبئ في الجهة الغربية من الأشياء.' },
              { who: 'mubarak', text: 'وسمعت أم خالد وطفليها يصرخون جنوب السوق. خذهم إلى القلعة الصغيرة، فهي الملجأ.' }
            ]); A.flag('met', true); A.give('rope', 1, true); return;
          }
          A.say([{ who: 'mubarak', text: A.count('plank') >= 3 ? 'ممتاز! الألواح معك. ضعها على الإطارات الذهبية فوق الماء.' : 'الألواح في الساحة المكشوفة. لا تنسَ: خلف الصناديق تحميك من الريح.' }]);
        },
        umkhalid: async A => {
          if (A.flag('sheltered')) return A.say([{ who: 'umkhalid', text: 'نحن بأمان هنا. بارك الله فيك.' }]);
          if (A.flag('leading')) return A.say([{ who: 'umkhalid', text: 'نحن خلفك! إلى القلعة.' }]);
          await A.say([{ who: 'umkhalid', text: 'يا بطل! انهار سقف الدكان علينا، والطفلان خائفان من الرعد.' }, { who: 'salim', text: 'أمي، الريح قوية جداً!' }, { who: 'hero', text: 'امشوا خلفي، سأوصلكم إلى القلعة الصغيرة.' }]);
          ['umkhalid', 'salim', 'hind'].forEach(id => A.follow(id)); A.flag('leading', true);
        },
        salim: A => A.say([{ who: 'salim', text: A.flag('sheltered') ? 'القلعة قوية! لن تسقط.' : 'سأمسك بثوب أمي ولن أتركه.' }]),
        hind: A => A.say([{ who: 'hind', text: A.flag('sheltered') ? 'أنت شجاع مثل أبي!' : 'الرعد يخيفني…' }]),
        b1: (A, e) => plank(A, e), b2: (A, e) => plank(A, e), b3: (A, e) => plank(A, e)
      }
    },
    valley: {
      theme: 'storm', map: rows(V), dark: .5, rain: true,
      wind: { period: 6.5, dur: 2.4, dx: -1, dy: 0, force: 2.8, zones: [[8, 2, 21, 19]], until: A => A.flag('calm') },
      enter: A => { if (!A.flag('valley')) { A.flag('valley', true); A.say([{ who: 'narrator', text: 'الوادي: صخور تتدحرج من التل مع السيل، والريح أقوى هنا. وفي الأعلى برج الجرس القديم.' }]); } },
      ents: [
        { id: 'back', kind: 'exit', x: 0, y: 10, to: 'market', tx: 28, ty: 10 },
        { id: 'safe1', kind: 'safe', x: 2, y: 10 }, { id: 'safe2', kind: 'safe', x: 23, y: 12 },
        { id: 'juma', kind: 'npc', who: 'juma', x: 4, y: 8, face: 'right', mark: A => A.flag('juma') ? null : '!' },
        ...[[2, 13], [3, 13], [5, 13], [6, 13], [2, 17], [3, 17], [4, 17], [5, 17], [6, 17]].map(([x, y], i) => ({ id: 'ft' + i, kind: 'fence', x, y })),
        ...[[2, 14], [2, 15], [2, 16], [6, 14], [6, 15], [6, 16]].map(([x, y], i) => ({ id: 'fv' + i, kind: 'fence', x, y, vertical: true })),
        { id: 'sgP', kind: 'sign', x: 7, y: 12, text: 'حظيرة الراعي جمعة. الفتحة من الأعلى.' },
        goat('g1', 12, 3), goat('g2', 22, 16), goat('g3', 14, 19),
        { id: 'rk1', kind: 'hazard', creature: 'boulder', path: [[12, 7], [18, 7]], speed: 2.3, r: .7, caughtMsg: '🪨 صخرة متدحرجة! تعود إلى النار الآمنة… انتظر حتى تمرّ ثم اعبر.' },
        { id: 'rk2', kind: 'hazard', creature: 'boulder', path: [[17, 12], [17, 18]], speed: 2, r: .7, caughtMsg: '🪨 صخرة متدحرجة! تعود إلى النار الآمنة… انتظر حتى تمرّ ثم اعبر.' },
        { id: 'r1', kind: 'pillar', x: 11, y: 12, h: 50, color: '#8C8478' }, { id: 'r2', kind: 'pillar', x: 15, y: 4, h: 50, color: '#8C8478' }, { id: 'r3', kind: 'pillar', x: 20, y: 14, h: 50, color: '#8C8478' }, { id: 'r4', kind: 'pillar', x: 13, y: 16, h: 50, color: '#8C8478' }, { id: 'r5', kind: 'pillar', x: 19, y: 4, h: 50, color: '#8C8478' },
        ...[20, 21, 22, 23, 24, 26, 27, 28].map((x, i) => ({ id: 'fy' + i, kind: 'fence', x, y: 8 })), ...[1, 2, 3, 4, 5, 6, 7].map((y, i) => ({ id: 'fw' + i, kind: 'fence', x: 20, y, vertical: true })),
        { id: 'gtower', kind: 'gate', x: 25, y: 8, when: A => A.flag('vanes'), openMsg: '🔓 انفتحت بوابة ساحة البرج!' },
        { id: 'vm', kind: 'rot', style: 'vane', x: 22, y: 3, r: 3, fixed: true, text: 'الدوّارة الذهبية الكبيرة تشير إلى اتجاه الريح. وجّه الدوّارات الثلاث مثلها.' },
        { id: 'v1', kind: 'rot', style: 'vane', x: 21, y: 11, r: 0 }, { id: 'v2', kind: 'rot', style: 'vane', x: 25, y: 12, r: 1 }, { id: 'v3', kind: 'rot', style: 'vane', x: 28, y: 11, r: 2 },
        { id: 'sgV', kind: 'sign', x: 23, y: 10, text: 'انقر على كل دوّارة لتدور. حين تشير الثلاث مثل الدوّارة الذهبية تنفتح البوابة.' },
        { id: 'bell', kind: 'site', x: 25, y: 4, model: 'bell', built: true },
        { id: 'tw1', kind: 'pillar', x: 21, y: 5, h: 110 }, { id: 'tw2', kind: 'pillar', x: 28, y: 5, h: 110 },
        { id: 's3', kind: 'star', x: 28, y: 20 }, { id: 's4', kind: 'star', x: 27, y: 2 }, { id: 's5', kind: 'star', x: 4, y: 15 }
      ],
      tick: A => {
        ['g1', 'g2', 'g3'].forEach(id => { const g = A.ent(id); if (g && g.follow && A.near(id, 3, 14, 5, 16)) { A.unfollow(id, g.x, g.y); A.flag('pen_' + id, true); A.sfx('win'); A.sparkle(g.x, g.y); A.toast(`🐐 عادت عنزة إلى الحظيرة (${['g1', 'g2', 'g3'].filter(k => A.flag('pen_' + k)).length} من ٣)`); } });
        if (!A.flag('vanes') && ['v1', 'v2', 'v3'].every(id => A.ent(id).r === A.ent('vm').r)) { A.flag('vanes', true); A.sfx('win'); }
      },
      on: {
        juma: async A => {
          if (!A.flag('juma')) { await A.say([{ who: 'juma', text: 'الحمد لله أنك هنا! هربت عنزاتي الثلاث حين ضرب الرعد.' }, { who: 'juma', text: 'انقر على العنزة فتمشي خلفك، ثم أدخلها الحظيرة من فتحتها العلوية. وابتعد عن الصخور المتدحرجة!' }, { who: 'juma', text: 'وبعدها اقرع جرس البرج، فيعرف أهل الوادي أن الخطر في مكان واحد ويجتمعوا في الملاجئ.' }]); A.flag('juma', true); return; }
          A.say([{ who: 'juma', text: ['g1', 'g2', 'g3'].every(g => A.flag('pen_' + g)) ? 'عادت كلها! أنت راعٍ ماهر.' : 'ما زالت بعض العنزات هناك…' }]);
        },
        g1: A => goatTap(A, 'g1'), g2: A => goatTap(A, 'g2'), g3: A => goatTap(A, 'g3'),
        vm: (A, e) => A.say([{ who: 'narrator', text: e.text }]),
        bell: async A => {
          if (!A.flag('vanes')) return A.say([{ who: 'narrator', text: 'البوابة مغلقة. وجّه الدوّارات أولاً.' }]);
          A.sfx('gate'); A.shake(1.2);
          await A.say([{ who: 'narrator', text: 'دنننغ… دنننغ… رنّ الجرس القديم فوق الوادي كله!' }]);
          A.flag('calm', true); A.weather({ rain: false, dark: .05, rainbow: true });
          await A.say([
            { who: 'narrator', text: 'وكأن العاصفة سمعت الجرس… هدأت الريح، وتوقف المطر، وانشقت الغيوم عن قوس قزح كبير.' },
            { who: 'juma', text: 'اجتمع الناس في الملاجئ وسلمت الماعز كلها. سيحكي أهل الوادي عن هذه الليلة طويلاً!' },
            { who: 'hero', text: 'الحمد لله. لم نكن لننجح لولا تعاون الجميع.' }
          ]);
          A.complete();
        }
      }
    }
  }
};

async function plank(A, e) {
  if (e.built) return;
  if (!A.has('plank')) return A.say([{ who: 'narrator', text: 'تحتاج لوح خشب. الألواح طارت إلى الساحة المكشوفة.' }]);
  A.take('plank'); A.set(e.id, { built: true }); A.setTile(e.x, e.y, '='); A.sfx('drop'); A.shake(.3); A.sparkle(e.x, e.y, '#C88A4A');
  const n = ['b1', 'b2', 'b3'].filter(id => A.ent(id).built).length;
  if (n < 3) return A.toast(`🪵 وضعتَ لوحاً (${n === 1 ? 'واحداً' : 'اثنين'} من ثلاثة)`);
  A.flag('bridge', true); A.sfx('win'); A.say([{ who: 'narrator', text: 'اكتمل الجسر! صار الطريق إلى الوادي مفتوحاً.' }]);
}
function goatTap(A, id) {
  if (A.flag('pen_' + id)) return A.say([{ who: 'narrator', text: '🐐 العنزة آمنة في الحظيرة.' }]);
  const g = A.ent(id); if (g.follow) return A.toast('🐐 العنزة تتبعك. خذها إلى الحظيرة!');
  A.follow(id); A.sfx('pick'); A.toast('🐐 العنزة تتبعك الآن. خذها إلى الحظيرة غرب الوادي');
}
