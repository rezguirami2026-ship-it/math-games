// مهمة درس في قرية (الصفان ٨ و٩): مشهد حيّ مرسوم + جولات بآلية الدرس نفسها + تلميح سقراطي (سؤال يوجّه ولا يكشف)،
// ثم «تحدي الدرس» (محرك missions/challenge.js بأسئلته المتنوعة) ثم شاشة النجوم.
// spec = { title, icon, who: { name, face }, intro: [سطور], rounds, make(i) → جولة, draw(g, w, h, t, S), outro: [سطور],
//          challenge: { title, make: () => items } }
// الجولة: { q: نص، input: { type: 'num'|'pick'|'dial', ... }, ok(v): صحيح؟، hint: سؤال يوجّه، bad(v): رد على خطأ بعينه، data: لرسم المشهد }
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
        if (S.r.input.type === 'num') pad.clear();
      }
    }
    let pad = null;
    function input(I) {
      const box2 = $('.vm-in');
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
      }
    }
    window.__vm = { get r() { return S.r; }, answer, get done() { return !!S.done; } };   // للاختبار الآلي (tests/villages-play.mjs)
    requestAnimationFrame(() => { size(); start(); raf = requestAnimationFrame(loop); });
  });
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
