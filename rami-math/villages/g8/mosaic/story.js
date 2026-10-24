// مغامرة دار الفسيفساء: «بلاط الفناء السحري» (الصف الثامن، الوحدة ١٢) — بمحرك المغامرات، وبآلية جديدة لم تُستعمل قبلها:
// «البلاط المنقلب»: حين يقف البطل على بلاطة في شبكة الفناء تنقلب هي وجاراتها الأربع (شمالاً وجنوباً وشرقاً وغرباً) بين الأزرق والذهبي،
// ولا ينفتح باب الخزانة حتى تصير البلاطات كلها ذهبية. الشكل الأول مصنوع بنقرات من الشكل الذهبي، فالحل مضمون؛ وذراع تعيد الشكل الأول.
const grid = (w, h, f = '#') => Array.from({ length: h }, () => Array(w).fill(f));
const rect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
const rows = g => g.map(r => r.join(''));

/* ── فناء الدار (١٤×١٢): شبكة بلاط ٤×٤ في الوسط، وباب الخزانة شمالاً، والمعلّم نزار جنوباً ── */
const CT = grid(14, 12); rect(CT, 1, 3, 12, 10, '.'); rect(CT, 5, 1, 8, 1, '.'); CT[2][7] = '.';
const G0 = [5, 4], GN = 4;   // ركن الشبكة الشمالي الغربي وحجمها
export const PRESSES = [[5, 4], [7, 5], [6, 7], [8, 7]];   // نقرات تصنع الشكل الأول من الشكل الذهبي (وهي نفسها الحل)
const inGrid = (x, y) => x >= G0[0] && x < G0[0] + GN && y >= G0[1] && y < G0[1] + GN;
const fid = (x, y) => `f${x}_${y}`;
const START = (() => { const on = {}; for (let y = G0[1]; y < G0[1] + GN; y++) for (let x = G0[0]; x < G0[0] + GN; x++) on[fid(x, y)] = true;
  PRESSES.forEach(([x, y]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (inGrid(x + dx, y + dy)) on[fid(x + dx, y + dy)] = !on[fid(x + dx, y + dy)]; })); return on; })();
const allOn = A => Object.keys(START).every(id => A.ent(id).on);

const NIZAR = { kind: 'man', skin: '#A8764E', robe: '#F4F1E8', accent: '#1E3A8A', beard: '#E5E5E5', elder: true, apron: '#92400E' };

export default {
  id: 'g8mosaic', title: 'بلاط الفناء السحري', icon: '✴️', stars: 3,
  start: { area: 'court', x: 3, y: 9 },
  view: { tiles: [7, 10, 11, 7.5], people: 1.3 },
  items: { star8: { icon: '✴️', name: 'النجمة الذهبية الثمانية' } },
  cast: { nizar: { name: 'المعلّم نزار', look: NIZAR } },
  goals: [
    { text: 'تحدّث مع المعلّم نزار', done: A => A.flag('met'), at: () => ({ area: 'court', id: 'nizar' }), hint: 'نزار في جنوب الفناء.' },
    { text: 'اجعل بلاط الفناء كله ذهبياً', done: A => A.flag('open'), at: () => ({ area: 'court', id: 'nizar' }), hint: 'كل بلاطة تقف عليها تنقلب هي وجاراتها الأربع. لاحظ: الوقوف على البلاطة نفسها مرتين يعيد كل شيء كما كان! أي البلاطات تحتاج أن تنقرها مرة واحدة؟' },
    { text: 'خذ النجمة الذهبية من الخزانة', done: A => A.flag('done'), at: () => ({ area: 'court', id: 'cabinet' }), hint: 'انفتح باب الخزانة شمال الفناء.' }
  ],
  intro: A => A.say([
    { who: 'narrator', text: 'غداً تُعلَّق النجمة الذهبية الثمانية فوق باب دار الفسيفساء الجديد.' },
    { who: 'narrator', text: 'لكنها في خزانة قديمة لا تُفتح إلا إذا صار بلاط الفناء السحري كله ذهبياً.' },
    { who: 'hero', text: 'لأسأل المعلّم نزار.' }
  ]),
  grant: s => { s.gems = (s.gems || 0) + 40; s.vil = s.vil || {}; (s.vil.badges = s.vil.badges || {}).mosaicHero = Date.now(); },
  rewards: ['💎 ٤٠ جوهرة', '🏅 وسام «سيد الفسيفساء»'],
  areas: {
    court: {
      theme: 'castle', map: rows(CT), dark: 0,
      enter: () => { lastT = null; },
      ents: [
        ...Object.keys(START).map(id => { const [x, y] = id.slice(1).split('_').map(Number); return { id, kind: 'flip', x, y, on: START[id] }; }),
        { id: 'door', kind: 'gate', x: 7, y: 2, when: A => A.flag('open'), openMsg: '🔓 انفتح باب الخزانة!' },
        { id: 'cabinet', kind: 'chest', x: 7, y: 1 },
        { id: 'nizar', kind: 'npc', who: 'nizar', x: 2, y: 9, face: 'right', mark: A => A.flag('met') ? null : '!' },
        { id: 'reset', kind: 'lever', x: 11, y: 9, color: '#D97706' },
        { id: 'sg', kind: 'sign', x: 3, y: 3, text: 'وصية الجد: «قف على بلاطة تنقلب هي وجاراتها الأربع. ذهب كله يفتح الخزانة».' },
        { id: 's1', kind: 'star', x: 1, y: 3 }, { id: 's2', kind: 'star', x: 12, y: 10 }, { id: 's3', kind: 'star', x: 12, y: 3 }
      ],
      on: {
        nizar: async A => {
          if (A.flag('met')) return A.say([{ who: 'nizar', text: A.flag('open') ? 'أحسنت! النجمة في الخزانة.' : (A.goal() || {}).hint || '' }]);
          await A.say([{ who: 'nizar', text: 'أهلاً يا بطل! صمّم جدّي هذا الفناء لغزاً: البلاطة التي تقف عليها تنقلب، ومعها جاراتها الأربع.' },
            { who: 'nizar', text: 'اجعلها كلها ذهبية فتنفتح الخزانة. وإن اختلط عليك الأمر، فالذراع الذهبية تعيد البلاط كما كان.' }]); A.flag('met', true);
        },
        cabinet: async A => { if (A.flag('done')) return; A.set('cabinet', { open: true }); A.give('star8'); A.flag('done', true); A.sfx('win'); A.sparkle(7, 1, '#FACC15');
          await A.say([{ who: 'nizar', text: 'النجمة الذهبية! ثماني رؤوس، وكل زاوية خارجية فيها ٤٥°… جدّي كان يحب الرياضيات مثلك.' }, { who: 'narrator', text: 'وفي الصباح لمعت النجمة فوق باب دار الفسيفساء الجديد.' }]); A.complete(); }
      },
      onLever: A => { if (A.flag('open')) { A.set('reset', { on: false }); return; } Object.keys(START).forEach(id => A.set(id, { on: START[id] })); A.set('reset', { on: false }); lastT = null; A.toast('🔄 عاد البلاط إلى شكله الأول'); },
      tick: A => { flipStep(A); if (!A.flag('open') && allOn(A)) { A.flag('open', true); A.sfx('win'); A.shake(.3); A.sparkle(7, 2, '#FACC15'); A.say([{ who: 'nizar', text: 'ذهب كله! انفتح باب الخزانة.' }]); } }
    }
  }
};

/* حين يكمل البطل خطوته إلى وسط بلاطة من الشبكة: تنقلب هي وجاراتها الأربع (بعد الفتح يبقى البلاط ذهبياً) */
let lastT = null;
function flipStep(A) {
  if (A.busy()) return; const h = A.hero(), k = h.x + ',' + h.y; if (lastT === k) return; lastT = k;
  if (!inGrid(h.x, h.y) || A.flag('open')) return;
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (inGrid(h.x + dx, h.y + dy)) { const e = A.ent(fid(h.x + dx, h.y + dy)); A.set(e.id, { on: !e.on }); } });
  A.sfx('pick');
}
