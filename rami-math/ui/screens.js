// شاشات البداية: العنوان، اختيار البطل، بطاقة الفصل. لا قوائم دروس ولا لوحات.
import { drawHuman, SKINS, ACCENTS } from '../character/human.js';
import { importCode } from '../save/save.js';
import { LESSONS } from '../content/lessons.js';
import { ar } from '../core/util.js';
import { homeHTML, homeSheets } from './home.js';
import { gfx } from './hud.js';
const $ = id => document.getElementById(id);
let anim = 0;
/* البطل في شاشات البداية: مجسّماً إن كان العرض ثلاثي الأبعاد مفعّلاً ومدعوماً، وإلا بالرسم ثنائي الأبعاد */
const use3d = () => { try { const q = new URLSearchParams(location.search); if (q.has('2d') || localStorage.getItem('ramimath_3d') === '0') return false; const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };
let P3 = null;
const stopAll = () => { cancelAnimationFrame(anim); if (P3) P3.stopPreviews(); };   // عند مغادرة الشاشة: لا رسم في الخلفية
function animate(canvases) {
  cancelAnimationFrame(anim); if (P3) P3.stopPreviews();
  if (use3d()) {   // كل canvas يُستبدل بنسخة جديدة (السياق ثنائي الأبعاد لا يتحول إلى WebGL)
    const fresh = canvases.map(({ c, h }) => { const n = document.createElement('canvas'); n.width = c.width; n.height = c.height; n.className = c.className; n.id = c.id; c.replaceWith(n); return { c: n, h }; });
    import('../renderer3d/preview.js').then(m => { P3 = m; fresh.forEach(({ c, h }) => { if (c.isConnected) m.previewHero(c, h, { bust: c.id === 'tHero' }); }); }).catch(() => {});
    return;
  }
  let ph = 0;
  const loop = () => {
    ph += .14;
    canvases.forEach(({ c, h }) => { const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); drawHuman(x, Object.assign({ x: c.width / 2, y: c.height - 14, s: 2.2 * c.width / 190, dir: 'down', moving: true, phase: ph }, h())); });
    anim = requestAnimationFrame(loop);
  };
  loop();
}
export const screens = {
  title(saved, { onContinue, onNew, onRestore }) {
    const el = $('screen'); el.className = 'screen on title home-on';
    el.innerHTML = homeHTML(saved); homeSheets(el, saved, gfx);   // الشاشة الرئيسية الجديدة (ui/home.js)
    animate([{ c: $('tHero'), h: () => saved ? heroLook(saved.hero) : { kind: 'boy', accent: ACCENTS[0], skin: SKINS[1] } }]);
    if (saved) $('bCont').onclick = () => { stopAll(); el.className = 'screen'; onContinue(); };
    $('bNew').onclick = () => { if (saved && !confirm('ستبدأ مغامرة جديدة ويُمسح عالمك الحالي. هل أنت متأكد؟')) return; this.hero(onNew); };
    $('bCode').onclick = () => { stopAll(); this.restore(saved, { onContinue, onNew, onRestore }); };
  },
  /* استعادة المغامرة برمز التقدّم: يُعرض اسم البطل وتقدّمه قبل التأكيد */
  restore(saved, cb) {
    const el = $('screen'); el.className = 'screen on hero';
    el.innerHTML = `<h2>🔑 استعادة المغامرة</h2>
      <p class="restore-note">الصق رمز التقدّم الذي نسخته من الحقيبة 🎒</p>
      <textarea id="codeIn" class="codebox" dir="ltr" placeholder="RM1.…" autocomplete="off" spellcheck="false"></textarea>
      <p class="restore-note" id="codeMsg"></p>
      <div class="btns"><button class="act big" id="bCheck">تحقّق من الرمز</button><button class="act ghost" id="bBack">رجوع</button></div>`;
    $('bBack').onclick = () => this.title(saved, cb);
    $('bCheck').onclick = async () => {
      const s = await importCode($('codeIn').value);
      if (!s) { $('codeMsg').textContent = 'هذا الرمز غير صالح. تأكد أنك نسخته كاملاً.'; $('codeIn').classList.add('shake'); setTimeout(() => $('codeIn').classList.remove('shake'), 500); return; }
      const done = LESSONS.filter(l => s.quests && s.quests.done && s.quests.done[l.id]).length;
      $('codeMsg').innerHTML = `مغامرة <b>${s.hero.name}</b>: أنجز ${ar(done)} من ${ar(LESSONS.length)} درساً.${saved ? '<br>ستحلّ محلّ المغامرة المحفوظة على هذا الجهاز.' : ''}`;
      el.querySelector('.btns').innerHTML = `<button class="act big" id="bYes">✓ نعم، استعدها</button><button class="act ghost" id="bBack">رجوع</button>`;
      $('bBack').onclick = () => this.title(saved, cb);
      $('bYes').onclick = () => { stopAll(); el.className = 'screen'; cb.onRestore(s); };
    };
  },
  hero(done) {
    const el = $('screen'); el.className = 'screen on hero';
    const pick = { kind: 'boy', skin: SKINS[1], color: ACCENTS[0] };
    el.innerHTML = `<h2>اختر بطلك</h2>
      <div class="heroes"><button class="hcard on" data-k="boy"><canvas width="150" height="170"></canvas><b>بطل</b></button><button class="hcard" data-k="girl"><canvas width="150" height="170"></canvas><b>بطلة</b></button></div>
      <div class="sw" id="skins">${SKINS.map((c, i) => `<button style="background:${c}" class="${i === 1 ? 'on' : ''}" data-v="${c}" aria-label="لون البشرة"></button>`).join('')}</div>
      <div class="sw" id="cols">${ACCENTS.map((c, i) => `<button style="background:${c}" class="${i === 0 ? 'on' : ''}" data-v="${c}" aria-label="لون التطريز"></button>`).join('')}</div>
      <input id="hname" maxlength="16" placeholder="اسم البطل" autocomplete="off">
      <button class="act big" id="bGo">انطلق إلى القرية</button>`;
    const cards = [...el.querySelectorAll('.hcard')];
    animate(cards.map(b => ({ c: b.querySelector('canvas'), h: () => heroLook(Object.assign({}, pick, { kind: b.dataset.k })) })));
    cards.forEach(b => b.onclick = () => { pick.kind = b.dataset.k; cards.forEach(x => x.classList.toggle('on', x === b)); });
    [['skins', 'skin'], ['cols', 'color']].forEach(([id, key]) => $(id).querySelectorAll('button').forEach(b => b.onclick = () => { pick[key] = b.dataset.v; $(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }));
    $('bGo').onclick = () => {
      const name = $('hname').value.trim();
      if (!name) { $('hname').focus(); $('hname').classList.add('shake'); setTimeout(() => $('hname').classList.remove('shake'), 500); return; }
      stopAll(); done(Object.assign({}, pick, { name }));
    };
  },
  chapter(n, title) {
    return new Promise(res => {
      const el = $('screen'); el.className = 'screen on chapter';
      el.innerHTML = `<div class="ch"><small>الفصل ${['', 'الأول', 'الثاني', 'الثالث'][n] || n}</small><h1>${title}</h1><p>اضغط للمتابعة</p></div>`;
      // ننتظر قليلاً حتى لا تُغلق البطاقة بنفس النقرة التي فتحتها
      setTimeout(() => { el.onclick = () => { el.onclick = null; el.className = 'screen'; res(); }; }, 350);
    });
  }
};
export function heroLook(h) {
  return { kind: h.kind, skin: h.skin, accent: h.color, robe: h.kind === 'girl' ? '#D85C7B' : '#F7F5EF' };
}
