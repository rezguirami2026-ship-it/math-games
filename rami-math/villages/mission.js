// مهمة درس في قرية (الصفان ٨ و٩): مشهد حيّ مرسوم + جولات بآلية الدرس نفسها + تلميح سقراطي (سؤال يوجّه ولا يكشف)،
// ثم «تحدي الدرس» (محرك missions/challenge.js بأسئلته المتنوعة) ثم شاشة النجوم.
// spec = { title, icon, who: { name, face }, intro: [سطور], rounds, make(i) → جولة, draw(g, w, h, t, S), outro: [سطور],
//          challenge: { title, make: () => items } }
// الجولة: { q: نص، input: { type: 'num' (و calc: آلة حاسبة بزر π كما في الكتاب)|'pick'|'dial'|'frac' (و mixed للعدد الكسري)|'blanks' (tpl بفراغات {}، والجواب مصفوفة أعداد؛ r.sol للاختبار)|'cells' (جدول نتائج rows/cols/cell(i, j)/off، والجواب أرقام الخلايا المعلَّمة i × عدد الأعمدة + j مرتبة؛ r.sol للاختبار), ... }, ok(v): صحيح؟، hint: سؤال يوجّه، bad(v): رد على خطأ بعينه، data: لرسم المشهد }
import { runChallenge } from '../missions/challenge.js';
import { sfx } from '../core/sound.js';
import { addGems } from '../world/decor.js';
import { ar } from '../core/util.js';
import { sheetClose } from '../missions/bench.js';

const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };

export function mission(spec) {
  return async function run(api, ctx) {
    const L = ctx.lesson, d = (ctx.state.quests.data[L.id] = ctx.state.quests.data[L.id] || {});
    if (spec.intro) await api.talk(spec.who, spec.intro.map(t => ({ who: spec.who.name, t })));
    const ok = await rounds(spec, api);
    if (!ok) return;   // خرج الطالب: يعود متى شاء
    if (spec.outro) await api.talk(spec.who, spec.outro.map(t => ({ who: spec.who.name, t })));
    d.ch = null;
    const stars = await new Promise(res => {
      const cfg = { title: spec.challenge.title, who: '', id: L.id, make: spec.challenge.make, exit: false,
        onDone: (s, C) => { sheetClose(); endScreen(spec, s, C).then(() => { d.ch = null; res(s); }); } };
      runChallenge(null, d, cfg);
    });
    ctx.done(stars); api.refresh();
  };
}

/* الجولات: لوحة سينمائية فيها المشهد والسؤال وأداة الإجابة */
function rounds(spec, api) {
  return new Promise(resolve => {
    const box = el(`<div class="vm"><div class="vm-card">
      <header><span class="vm-face">${spec.who.face}</span><div><b>${spec.icon} ${spec.title}</b><small></small></div><button class="vm-x" aria-label="خروج">✕</button></header>
      <canvas class="vm-scene"></canvas>
      <div class="vm-q"></div><div class="vm-msg"></div><div class="vm-in"></div></div></div>`);
    document.body.append(box);
    const cv = box.querySelector('.vm-scene'), g = cv.getContext('2d'), $ = s => box.querySelector(s);
    const S = { i: 0, r: null, t: 0, anim: 0, v: null, pulse: 0 };
    let raf = 0, last = performance.now();
    const size = () => { const r = cv.getBoundingClientRect(), k = Math.min(2, devicePixelRatio || 1); cv.width = r.width * k; cv.height = r.height * k; g.setTransform(k, 0, 0, k, 0, 0); };
    const loop = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; S.t += dt; S.anim = Math.min(1, S.anim + dt * 1.6); S.pulse = Math.max(0, S.pulse - dt * 2);
      const r = cv.getBoundingClientRect(); g.clearRect(0, 0, r.width, r.height); try { spec.draw(g, r.width, r.height, S.t, S); } catch (e) { console.error('[قرية الخير] مشهد المهمة', e); } raf = requestAnimationFrame(loop); };
    const close = v => { cancelAnimationFrame(raf); removeEventListener('resize', size); box.remove(); resolve(v); };
    $('.vm-x').onclick = () => close(false);
    addEventListener('resize', size);
    const msg = (t, k) => { const m = $('.vm-msg'); m.className = 'vm-msg ' + (k || ''); m.innerHTML = t || ''; };
    function start() {
      S.r = spec.make(S.i); S.v = S.r.input.start ?? null; S.anim = 0;
      $('header small').innerHTML = `الجولة ${ar(S.i + 1)} من ${ar(spec.rounds)}` + `<span class="vm-dots">${Array.from({ length: spec.rounds }, (_, k) => `<i class="${k < S.i ? 'on' : k === S.i ? 'cur' : ''}"></i>`).join('')}</span>`;
      $('.vm-q').innerHTML = S.r.q; msg(''); input(S.r.input);
    }
    function answer(v) {
      if (S.r.ok(v)) {
        sfx('win'); addGems(1); msg('✓ ' + (S.r.good || 'أحسنت!'), 'good'); S.done = true; S.pulse = 1;
        $('.vm-in').innerHTML = `<button class="vm-go">${S.i + 1 < spec.rounds ? 'الجولة التالية ◀' : 'إلى التحدي 🎯'}</button>`;
        $('.vm-go').onclick = () => { S.done = false; if (++S.i >= spec.rounds) close(true); else start(); };
      } else {
        sfx('cough'); S.shake = 1;
        msg(`🤔 ${(S.r.bad && S.r.bad(v)) || ''} ${S.r.hint}`, 'bad');
        if (S.r.input.type === 'num' || S.r.input.type === 'frac' || S.r.input.type === 'blanks') pad.clear();
      }
    }
    let pad = null;
    function input(I) {
      const box2 = $('.vm-in'); box.querySelectorAll('.vm-calc').forEach(x => x.remove());
      if (I.type === 'pick') {
        box2.innerHTML = `<div class="vm-opts">${I.opts.map((o, k) => `<button data-k="${k}">${o}</button>`).join('')}</div>`;
        box2.querySelectorAll('button').forEach(b => b.onclick = () => answer(+b.dataset.k));
      } else if (I.type === 'dial') {   // مؤشر بخطوات: اليسار − واليمين + (كالمحور)، والقيمة تظهر في المشهد
        const step = I.step || 1;
        box2.innerHTML = `<div class="vm-dial"><button data-d="-1" aria-label="أنقص">−</button><output></output><button data-d="1" aria-label="زد">+</button></div><button class="vm-go">${I.label || '✓ ثبّت'}</button>`;
        const out = box2.querySelector('output'), show = () => { out.innerHTML = I.show ? I.show(S.v) : ar(S.v); };
        box2.querySelector('.vm-dial').dir = 'ltr';
        box2.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { S.v = Math.round((S.v + +b.dataset.d * step) * 1000) / 1000; if (I.min != null) S.v = Math.max(I.min, S.v); if (I.max != null) S.v = Math.min(I.max, S.v); sfx('pick'); show(); });
        show(); box2.querySelector('.vm-go').onclick = () => answer(S.v);
      } else if (I.type === 'blanks') {   // قالب عبارة بفراغات (I.tpl فيه {} لكل فراغ): ينقر الطالب الفراغ ويكتب عدده (بإشارة سالبة إن سمح I.neg)
        const n = (I.tpl.match(/\{\}/g) || []).length, V = Array(n).fill(''); let cur = 0, k = 0;
        box2.innerHTML = `<div class="vm-pad vm-fpad"><div class="vm-tpl">${I.tpl.replace(/\{\}/g, () => `<button data-b="${k++}"></button>`)}</div>
          <div class="vm-keys">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(q => `<button data-k="${q}">${ar(q)}</button>`).join('')}${I.neg ? '<button data-k="-">−</button>' : '<button data-k="<">⌫</button>'}<button data-k="0">٠</button><button data-k="ok" class="vm-ok">✓</button></div>${I.neg ? '<div class="vm-row"><button data-k="<">⌫</button></div>' : ''}</div>`;
        const show = () => box2.querySelectorAll('[data-b]').forEach(b => { const v = V[+b.dataset.b]; b.innerHTML = v === '' || v === '-' ? `<i>${v === '-' ? '−' : '؟'}</i>` : (v.startsWith('-') ? ar(v.slice(1)) + '−' : ar(v)); b.classList.toggle('on', +b.dataset.b === cur); });
        pad = { clear() { V.fill(''); cur = 0; show(); } };
        box2.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { cur = +b.dataset.b; sfx('pick'); show(); });
        box2.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
          const q = b.dataset.k;
          if (q === 'ok') { if (V.some(v => v === '' || v === '-')) { msg('🤔 املأ كل الفراغات (انقر الفراغ ثم اكتب عدده).', 'bad'); return; } answer(V.map(Number)); return; }
          if (q === '<') V[cur] = V[cur].slice(0, -1); else if (q === '-') V[cur] = V[cur].startsWith('-') ? V[cur].slice(1) : '-' + V[cur]; else if (V[cur].replace('-', '').length < 3) { V[cur] += q; }
          sfx('pick'); show();
        });
        pad.clear();
      } else if (I.type === 'cells') {   // جدول النتائج (الوحدة ٧): صفوف وأعمدة بعناوينها، ينقر الطالب كل نتيجة تحقق الشرط ثم يثبّت. off: خلية مستحيلة «×»
        const sel = new Set();
        box2.innerHTML = `<div class="vm-cells"><table><thead><tr><th class="vm-corner">${I.corner || ''}</th>${I.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${I.rows.map((rw, i) => `<tr><th>${rw}</th>${I.cols.map((_, j) => I.off && I.off(i, j) ? '<td class="off">×</td>' : `<td><button data-c="${i * I.cols.length + j}">${I.cell(i, j)}</button></td>`).join('')}</tr>`).join('')}</tbody></table></div>
          <div class="vm-row"><button class="vm-clr" data-k="clr">مسح</button><button class="vm-go" data-k="ok">${I.label || '✓ ثبّت النتائج'}</button></div>`;
        const show = () => box2.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', sel.has(+b.dataset.c)));
        pad = { clear() {} };   // التعليم يبقى بعد الخطأ ليصحّحه الطالب
        box2.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const k = +b.dataset.c; if (sel.has(k)) sel.delete(k); else sel.add(k); sfx('pick'); show(); });
        box2.querySelector('[data-k=clr]').onclick = () => { sel.clear(); sfx('pick'); show(); };
        box2.querySelector('[data-k=ok]').onclick = () => { if (!sel.size) { msg('🤔 انقر النتائج التي تحقق الشرط في الجدول أولاً.', 'bad'); return; } answer([...sel].sort((a, b) => a - b)); };
      } else if (I.type === 'chips') {   // قطع النسب (الوحدة ٨): يكوّن الطالب نسبة من قطع سهلة (٥٠٪، ١٠٪، ١٪…) بالجمع والطرح كما في الكتاب، والجواب القطع بإشاراتها (S.v للمشهد)
        let sgn = 1; S.v = [];
        const pc = v => ar(String(v)).replace('.', '٫') + '٪';
        box2.innerHTML = `<div class="vm-chips"><div class="vm-tray"></div><div class="vm-sgn">${I.neg ? '<button data-s="1" class="on">+ أضف</button><button data-s="-1">− اطرح</button>' : ''}</div>
          <div class="vm-chipk">${I.chips.map(v => `<button data-v="${v}">${pc(v)}</button>`).join('')}</div>
          <div class="vm-row"><button class="vm-clr" data-k="clr">مسح</button><button class="vm-clr" data-k="<">⌫</button><button class="vm-go" data-k="ok">${I.label || '✓ ثبّت'}</button></div></div>`;
        const show = () => { const T = S.v.reduce((a, b) => a + b, 0);
          box2.querySelector('.vm-tray').innerHTML = S.v.length ? `${S.v.map((v, k) => (k ? (v < 0 ? ' − ' : ' + ') : v < 0 ? '− ' : '') + `<b>${pc(Math.abs(v))}</b>`).join('')} <i>= ${T < 0 ? pc(-T) + '−' : pc(Math.round(T * 100) / 100)}</i>` : '<i>انقر القطع لتكوّن النسبة</i>';
          box2.querySelectorAll('[data-s]').forEach(b => b.classList.toggle('on', +b.dataset.s === sgn)); };
        pad = { clear() {} };   // القطع تبقى بعد الخطأ ليصحّحها الطالب
        box2.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { sgn = +b.dataset.s; sfx('pick'); show(); });
        box2.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { if (S.v.length >= (I.max || 10)) { msg('🤔 قطع كثيرة! هل توجد طريقة بقطع أقل؟', 'bad'); return; } S.v.push(sgn * +b.dataset.v); sfx('pick'); show(); });
        box2.querySelector('[data-k=clr]').onclick = () => { S.v = []; sfx('pick'); show(); };
        box2.querySelector('[data-k="<"]').onclick = () => { S.v.pop(); sfx('pick'); show(); };
        box2.querySelector('[data-k=ok]').onclick = () => { if (!S.v.length) { msg('🤔 انقر القطع أولاً.', 'bad'); return; } answer(S.v.slice()); };
        show();
      } else if (I.type === 'mix') {   // حوض الخلط (الوحدة ٩): عدد أجزاء كل صبغ بزرّي + و−، والنسبة تُقرأ من اليمين، ولون الحوض يتغير في المشهد (S.v)
        S.v = I.parts.map(() => I.start || 0);
        box2.innerHTML = `<div class="vm-mix">${I.parts.map((p, k) => `${k ? '<b class="vm-mixc">:</b>' : ''}<div class="vm-mixp" style="--c:${p.col}"><small>${p.name}</small><button data-m="${k}" data-d="1" aria-label="زد">+</button><output></output><button data-m="${k}" data-d="-1" aria-label="أنقص">−</button></div>`).join('')}</div>
          <div class="vm-row"><button class="vm-go" data-k="ok">${I.label || '✓ اخلط'}</button></div>`;
        const show = () => box2.querySelectorAll('.vm-mixp output').forEach((o, k) => { o.textContent = ar(S.v[k]); });
        pad = { clear() {} };
        box2.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const k = +b.dataset.m; S.v[k] = Math.max(I.min ?? 1, Math.min(I.max || 20, S.v[k] + +b.dataset.d)); sfx('pick'); show(); });
        box2.querySelector('[data-k=ok]').onclick = () => answer(S.v.slice());
        show();
      } else if (I.type === 'steps') {   // خطوات الحل (الوحدة ١٠): المعادلة الحالية وخيارات العملية التالية؛ الصحيحة تحوّل المعادلة، والجواب أرقام الخيارات بالترتيب (r.sol)
        const got = []; S.v = 0;
        const show = () => { const st = I.steps[got.length];
          box2.innerHTML = `<div class="vm-steps"><ol>${I.steps.slice(0, got.length + 1).map((s, k) => `<li class="${k < got.length ? 'done' : 'cur'}">${s.eq}${k < got.length ? `<small>${s.opts[s.ok]}</small>` : ''}</li>`).join('')}</ol>
            ${st ? `<div class="vm-opts">${st.opts.map((o, k) => `<button data-s="${k}">${o}</button>`).join('')}</div>` : ''}</div>`;
          box2.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const k = +b.dataset.s, cur = I.steps[got.length];
            if (k !== cur.ok) { answer([...got, k]); return; }
            got.push(k); S.v = got.length; sfx('pick'); msg(''); if (got.length >= I.steps.length) { box2.innerHTML = `<div class="vm-steps"><ol>${I.steps.map(s => `<li class="done">${s.eq}<small>${s.opts[s.ok]}</small></li>`).join('')}<li class="cur">${I.final}</li></ol></div>`; answer(got.slice()); } else show(); }); };
        pad = { clear() {} };   // الخطوات الصحيحة تبقى بعد الخطأ
        show();
      } else if (I.type === 'ray') {   // مجموعة الحل على خط الأعداد (الوحدة ١٠): طرف يتحرك بخطوات، ودائرة مفتوحة أو مغلقة، واتجاه الشعاع؛ الجواب { v, closed, right } (S.v للمشهد)
        S.v = { v: I.start ?? 0, closed: false, right: true };
        box2.innerHTML = `<div class="vm-ray"><div class="vm-dial" dir="ltr"><button data-d="-1" aria-label="يسار">◀</button><output></output><button data-d="1" aria-label="يمين">▶</button></div>
          <div class="vm-sgn"><button data-c="0">○ مفتوحة</button><button data-c="1">● مغلقة</button></div><div class="vm-sgn"><button data-r="0">⟵ نحو الأصغر</button><button data-r="1">نحو الأكبر ⟶</button></div></div>
          <div class="vm-row"><button class="vm-go" data-k="ok">${I.label || '✓ ثبّت مجموعة الحل'}</button></div>`;
        const show = () => { box2.querySelector('output').innerHTML = I.show ? I.show(S.v.v) : ar(S.v.v); box2.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', !!+b.dataset.c === S.v.closed)); box2.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', !!+b.dataset.r === S.v.right)); };
        pad = { clear() {} };
        box2.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { S.v.v = Math.max(I.min ?? -20, Math.min(I.max ?? 20, Math.round((S.v.v + +b.dataset.d * (I.step || 1)) * 100) / 100)); sfx('pick'); show(); });
        box2.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { S.v.closed = !!+b.dataset.c; sfx('pick'); show(); });
        box2.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { S.v.right = !!+b.dataset.r; sfx('pick'); show(); });
        box2.querySelector('[data-k=ok]').onclick = () => answer({ ...S.v });
        show();
      } else if (I.type === 'grid') {   // المستوى الإحداثي (الوحدة ١١): ينقر الطالب نقاط الشبكة (n نقطة: ١ لنقطة، ٢ لمستقيم يمر بهما)، والجواب مصفوفة [س، ص] (S.v للمشهد)
        const { x0 = -5, x1 = 5, y0 = -5, y1 = 5, n = 1 } = I, cw = 300 / (x1 - x0), chh = 300 / (y1 - y0), X = x => 20 + (x - x0) * cw, Y = y => 20 + (y1 - y) * chh; S.v = [];
        const svg = () => { const ln = [], lab = [];
          for (let x = x0; x <= x1; x++) ln.push(`<line x1="${X(x)}" y1="20" x2="${X(x)}" y2="320" class="${x ? '' : 'ax'}"/>`); for (let y = y0; y <= y1; y++) ln.push(`<line x1="20" y1="${Y(y)}" x2="320" y2="${Y(y)}" class="${y ? '' : 'ax'}"/>`);
          for (let x = x0; x <= x1; x++) if (x && (x1 - x0 <= 12 || x % 2 === 0)) lab.push(`<text x="${X(x)}" y="${Y(0) + 15}">${ar(Math.abs(x))}${x < 0 ? '−' : ''}</text>`);
          for (let y = y0; y <= y1; y++) if (y && (y1 - y0 <= 12 || y % 2 === 0)) lab.push(`<text x="${X(0) - 11}" y="${Y(y) + 5}">${ar(Math.abs(y))}${y < 0 ? '−' : ''}</text>`);
          const given = (I.given || []).map(([x, y, l]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="6" class="gv"/><text x="${X(x) + 12}" y="${Y(y) - 8}" class="gl">${l || ''}</text>`).join('');
          const seg = (I.segs || []).map(([a, b]) => `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" class="sg"/>`).join('');
          const lines = (I.lines || []).map(([m, c, col]) => `<line x1="${X(x0)}" y1="${Y(m * x0 + c)}" x2="${X(x1)}" y2="${Y(m * x1 + c)}" stroke="${col || '#7C3AED'}" class="ln"/>`).join('');
          let mine = ''; if (S.v.length === 2 && n === 2) { const [[ax, ay], [bx, by]] = S.v; if (ax !== bx) { const m = (by - ay) / (bx - ax); mine = `<line x1="${X(x0)}" y1="${Y(ay + m * (x0 - ax))}" x2="${X(x1)}" y2="${Y(ay + m * (x1 - ax))}" class="mine"/>`; } else mine = `<line x1="${X(ax)}" y1="20" x2="${X(ax)}" y2="320" class="mine"/>`; }
          const pts = S.v.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="7" class="pk"/>`).join('');
          const hits = []; for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) hits.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="${Math.min(cw, chh) / 2}" class="hit" data-x="${x}" data-y="${y}"/>`);
          return `<svg viewBox="0 0 340 340" class="vm-grid" dir="ltr"><defs><clipPath id="vmgc"><rect x="20" y="20" width="300" height="300"/></clipPath></defs>${ln.join('')}<g clip-path="url(#vmgc)">${lines}${seg}${mine}</g>${lab.join('')}${given}${pts}${hits.join('')}</svg>`; };
        const show = () => { box2.querySelector('.vm-gridw').innerHTML = svg(); box2.querySelector('.vm-gpt').innerHTML = S.v.length ? S.v.map(([x, y]) => `(${ar(Math.abs(x))}${x < 0 ? '−' : ''}، ${ar(Math.abs(y))}${y < 0 ? '−' : ''})`).join(' و ') : `<i>${n === 2 ? 'انقر نقطتين على المستقيم' : 'انقر النقطة'}</i>`;
          box2.querySelectorAll('.hit').forEach(c => c.onclick = () => { const p = [+c.dataset.x, +c.dataset.y]; if (S.v.length >= n) S.v = []; S.v.push(p); sfx('pick'); show(); }); };
        box2.innerHTML = `<div class="vm-gridw"></div><div class="vm-gpt"></div><div class="vm-row"><button class="vm-clr" data-k="clr">مسح</button><button class="vm-go" data-k="ok">${I.label || '✓ ثبّت'}</button></div>`;
        pad = { clear() { S.v = []; show(); } };
        box2.querySelector('[data-k=clr]').onclick = () => { S.v = []; sfx('pick'); show(); };
        box2.querySelector('[data-k=ok]').onclick = () => { if (S.v.length < n) { msg(n === 2 ? '🤔 انقر نقطتين على الشبكة.' : '🤔 انقر نقطة على الشبكة.', 'bad'); return; } answer(S.v.map(p => p.slice())); };
        show();
      } else if (I.type === 'frac') {   // لوحة كسر: بسط ومقام مكدّسان (وعدد صحيح على يسارهما إن كان I.mixed)، ينقر الطالب الخانة ثم يكتب أرقامها
        const F = { w: '', n: '', d: '' }; let cur = 'n';
        box2.innerHTML = `<div class="vm-pad vm-fpad"><div class="vm-frac" dir="ltr">${I.mixed ? '<button data-f="w" aria-label="العدد الصحيح"></button>' : ''}<span class="vm-fs"><button data-f="n" aria-label="البسط"></button><i></i><button data-f="d" aria-label="المقام"></button></span></div>
          <div class="vm-keys">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(k => `<button data-k="${k}">${ar(k)}</button>`).join('')}<button data-k="<">⌫</button><button data-k="0">٠</button><button data-k="ok" class="vm-ok">✓</button></div></div>`;
        const show = () => box2.querySelectorAll('[data-f]').forEach(b => { b.innerHTML = F[b.dataset.f] ? ar(F[b.dataset.f]) : '<i>؟</i>'; b.classList.toggle('on', b.dataset.f === cur); });
        pad = { clear() { F.w = F.n = F.d = ''; cur = I.mixed ? 'w' : 'n'; show(); } };
        box2.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { cur = b.dataset.f; sfx('pick'); show(); });
        box2.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
          const k = b.dataset.k;
          if (k === 'ok') { const v = { w: +F.w || 0, n: +F.n || 0, d: +F.d || 0 };
            if (F.w && !F.n && !F.d) v.d = 1; else if (!F.n || !F.d) { msg('🤔 اكتب البسط والمقام كليهما (انقر الخانة ثم اكتب).', 'bad'); return; }
            answer(v); return; }
          if (k === '<') F[cur] = F[cur].slice(0, -1); else if (F[cur].length < 3) F[cur] += k;
          sfx('pick'); show();
        });
        pad.clear();
      } else {   // لوحة أرقام بإشارة سالبة وفاصلة عشرية حسب الجولة
        box2.innerHTML = `<div class="vm-pad"><output dir="ltr"></output><div class="vm-keys">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(k => `<button data-k="${k}">${ar(k)}</button>`).join('')}${I.neg ? '<button data-k="-">−</button>' : '<span></span>'}<button data-k="0">٠</button>${I.dot ? '<button data-k=".">٫</button>' : '<button data-k="<">⌫</button>'}</div><div class="vm-row">${I.dot ? '<button data-k="<">⌫</button>' : ''}<button class="vm-go" data-k="ok">${I.label || '✓ الجواب'}</button></div></div>`;
        let s = '';
        const out = box2.querySelector('output'), show = () => { const neg = s.startsWith('-'), body = ar(s.replace('-', '')).replace('.', '٫'); out.innerHTML = s ? (neg ? body + '−' : body) : '<i>؟</i>'; };
        pad = { clear() { s = ''; show(); } };
        box2.querySelectorAll('button').forEach(b => b.onclick = () => {
          const k = b.dataset.k;
          if (k === 'ok') { if (s && s !== '-' && s !== '.') answer(+s); return; }
          if (k === '<') s = s.slice(0, -1); else if (k === '-') s = s.startsWith('-') ? s.slice(1) : '-' + s; else if (k === '.') { if (!s.includes('.')) s += s.replace('-', '') ? '.' : '0.'; } else if (s.replace(/[-.]/g, '').length < 7) s += k;
          sfx('pick'); show();
        });
        show();
        if (I.calc) calc(box2, box);
      }
    }
    window.__vm = { get r() { return S.r; }, answer, get done() { return !!S.done; } };   // للاختبار الآلي (tests/villages-play.mjs)
    requestAnimationFrame(() => { size(); start(); raf = requestAnimationFrame(loop); });
  });
}

/* آلة حاسبة بزر π (الوحدة ٦ للصف الثامن: «استخدم زر π في الآلة الحاسبة»): تحسب فقط، والطالب يقرّب ويكتب جوابه بنفسه */
function calc(host, card) {
  const b = document.createElement('button'); b.className = 'vm-calcBtn'; b.textContent = '🧮 π'; b.setAttribute('aria-label', 'الآلة الحاسبة'); b.title = 'الآلة الحاسبة'; (host.querySelector('.vm-row') || host).prepend(b);
  const K = ['7', '8', '9', '÷', '(', '4', '5', '6', '×', ')', '1', '2', '3', '−', '²', '0', '.', 'π', '+', '√'];
  const box = el(`<div class="vm-calc" hidden><div class="vm-cscr" dir="ltr"><small></small><b>٠</b></div><div class="vm-ckeys" dir="ltr">${K.map(k => `<button data-c="${k}">${k === '.' ? '٫' : /\d/.test(k) ? ar(+k) : k}</button>`).join('')}
    <button data-c="C" class="vm-cc">C</button><button data-c="<">⌫</button><button data-c="=" class="vm-ceq">=</button><button data-c="x" class="vm-cx">✕</button></div></div>`);
  card.querySelector('.vm-card').append(box);
  let e = '', res = '';
  const hin = s => s.replace(/\d/g, d => ar(+d)).replace(/\./g, '٫');
  const show = () => { box.querySelector('small').textContent = res ? hin(e) + ' =' : ''; box.querySelector('b').textContent = res ? hin(res) : (e ? hin(e) : '٠'); };
  b.onclick = () => { box.hidden = !box.hidden; sfx('pick'); };
  box.querySelectorAll('[data-c]').forEach(q => q.onclick = () => {
    const c = q.dataset.c; sfx('pick');
    if (c === 'x') { box.hidden = true; return; }
    if (c === 'C') { e = res = ''; } else if (c === '<') { if (res) res = ''; else e = e.slice(0, -1); }
    else if (c === '=') { const v = evalCalc(e); res = v == null ? 'خطأ' : String(+v.toPrecision(10)).replace('-', '−'); }
    else { if (res) { e = res !== 'خطأ' && /[+−×÷²]/.test(c) ? res : ''; res = ''; } if (e.length < 40) e += c; }
    show();
  });
  show();
}
/* حساب عبارة الآلة: + − × ÷ وأقواس و² و√ وπ، والضرب ضمني بين «٢π» أو «٣(٤)» */
export function evalCalc(s) {
  const T = s.match(/\d+\.?\d*|\.\d+|[+−×÷()²√π]/g) || []; let i = 0;
  const peek = () => T[i], eat = () => T[i++];
  const prim = () => { const t = eat(); if (t == null) throw 0; if (t === 'π') return Math.PI; if (t === '(') { const v = sum(); if (peek() === ')') eat(); return v; } if (/^[\d.]/.test(t)) return +t; throw 0; };
  const post = () => { let v = prim(); while (peek() === '²') { eat(); v *= v; } return v; };
  const un = () => { if (peek() === '−') { eat(); return -un(); } if (peek() === '√') { eat(); const v = un(); if (v < 0) throw 0; return Math.sqrt(v); } return post(); };
  const prod = () => { let v = un(); for (;;) { const t = peek(); if (t === '×') { eat(); v *= un(); } else if (t === '÷') { eat(); const d = un(); if (!d) throw 0; v /= d; } else if (t != null && /^[\d.(π√]/.test(t)) v *= un(); else return v; } };
  const sum = () => { let v = prod(); for (;;) { const t = peek(); if (t === '+') { eat(); v += prod(); } else if (t === '−') { eat(); v -= prod(); } else return v; } };
  try { const v = sum(); return i === T.length && isFinite(v) ? v : null; } catch (x) { return null; }
}

/* شاشة النهاية: النجوم والجواهر */
function endScreen(spec, stars, C) {
  return new Promise(res => {
    const n = C.items.length;
    const box = el(`<div class="vm vm-end"><div class="vm-card"><div class="vm-burst">${spec.who.face}</div>
      <div class="vm-stars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}" style="animation-delay:${k * .18}s">★</span>`).join('')}</div>
      <h3>أنجزتَ ${spec.title}!</h3><p>أجبت ${ar(C.firstTry)} من ${ar(n)} من المحاولة الأولى · 💎 ${ar(C.gems || n)}</p>
      ${stars < 3 ? '<p class="vm-mut">تستطيع إعادة المهمة من محطتها في القرية لتجمع النجوم الثلاث.</p>' : '<p class="vm-mut">ثلاث نجوم! إتقان كامل 🌟</p>'}
      <button class="vm-go">متابعة</button></div></div>`);
    document.body.append(box); sfx('win');
    box.querySelector('.vm-go').onclick = () => { box.remove(); res(); };
  });
}
