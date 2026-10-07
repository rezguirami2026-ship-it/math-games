// شاشات البداية: العنوان، اختيار البطل، بطاقة الفصل. لا قوائم دروس ولا لوحات.
import { drawHuman, SKINS, ACCENTS } from '../character/human.js';
import { importCode } from '../save/save.js';
import { LESSONS } from '../content/lessons.js';
import { ar } from '../core/util.js';
import { homeHTML, homeSheets, SCENE } from './home.js';
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
    import('../renderer3d/preview.js').then(m => { P3 = m; fresh.forEach(({ c, h }) => { if (c.isConnected) m.previewHero(c, h, { hero: c.id === 'tHero' || c.classList.contains('pcv') }); }); }).catch(() => {});
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
const P2HEAD = (title, sub) => `${SCENE}<div class="p2logo"><b>قرية الخير</b><small>مغامرة رامي ماث · تعلّم، العب، حقّق المزيد</small></div>
  <div class="p2t"><i class="sp l"></i><h2>${title}</h2><i class="sp r"></i></div>${sub ? `<p class="p2sub">${sub}</p>` : ''}`;
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
    const el = $('screen'); el.className = 'screen on hero p2on';
    el.innerHTML = `${P2HEAD('🔑 استعادة المغامرة', 'الصق رمز التقدّم الذي نسخته من الحقيبة 🎒')}<div class="p2body p2card">
      <textarea id="codeIn" class="codebox" dir="ltr" placeholder="RM1.…" autocomplete="off" spellcheck="false"></textarea>
      <p class="restore-note" id="codeMsg"></p>
      <div class="btns"><button class="pgo" id="bCheck"><span>🔓</span>تحقّق من الرمز</button><button class="act ghost" id="bBack">رجوع</button></div></div>`;
    $('bBack').onclick = () => this.title(saved, cb);
    $('bCheck').onclick = async () => {
      const s = await importCode($('codeIn').value);
      if (!s) { $('codeMsg').textContent = 'هذا الرمز غير صالح. تأكد أنك نسخته كاملاً.'; $('codeIn').classList.add('shake'); setTimeout(() => $('codeIn').classList.remove('shake'), 500); return; }
      const done = LESSONS.filter(l => s.quests && s.quests.done && s.quests.done[l.id]).length;
      $('codeMsg').innerHTML = `مغامرة <b>${s.hero.name}</b>: أنجز ${ar(done)} من ${ar(LESSONS.length)} درساً.${saved ? '<br>ستحلّ محلّ المغامرة المحفوظة على هذا الجهاز.' : ''}`;
      el.querySelector('.btns').innerHTML = `<button class="pgo" id="bYes"><span>✓</span>نعم، استعدها</button><button class="act ghost" id="bBack">رجوع</button>`;
      $('bBack').onclick = () => this.title(saved, cb);
      $('bYes').onclick = () => { stopAll(); el.className = 'screen'; cb.onRestore(s); };
    };
  },
  hero(done) {
    const el = $('screen'); el.className = 'screen on hero';
    const pick = { kind: 'boy', skin: SKINS[1], color: ACCENTS[0] };
    el.className = 'screen on hero p2on';
    el.innerHTML = `${P2HEAD('اختر بطلك', 'اختر الشخصية التي ترغب في اللعب بها')}<div class="p2body">
      <div class="heroes2"><button class="pcard on" data-k="boy"><span class="pbg"></span><canvas class="pcv" width="190" height="230"></canvas><b class="plbl">بطل</b><i class="pchk">✓</i></button>
        <button class="pcard" data-k="girl"><span class="pbg"></span><canvas class="pcv" width="190" height="230"></canvas><b class="plbl">بطلة</b><i class="pchk">✓</i></button></div>
      <div class="sw2"><small>لون البشرة</small><div class="sw" id="skins">${SKINS.map((c, i) => `<button style="background:${c}" class="${i === 1 ? 'on' : ''}" data-v="${c}" aria-label="لون البشرة"></button>`).join('')}</div></div>
      <div class="sw2"><small>لون التطريز</small><div class="sw" id="cols">${ACCENTS.map((c, i) => `<button style="background:${c}" class="${i === 0 ? 'on' : ''}" data-v="${c}" aria-label="لون التطريز"></button>`).join('')}</div></div>
      <label class="pname"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.5" fill="#2F6FB2"/><path fill="#2F6FB2" d="M3 21c0-5 4-7.5 9-7.5s9 2.5 9 7.5z"/></svg><input id="hname" maxlength="16" placeholder="اسم البطل" autocomplete="off"></label>
      <button class="pgo" id="bGo"><span>⭐</span>انطلق إلى القرية<em>‹</em></button></div>`;
    const cards = [...el.querySelectorAll('.pcard')];
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
      const el = $('screen'); el.className = 'screen on chapter p2on';
      el.innerHTML = `${SCENE}<div class="ch2"><div class="ch2rib">الفصل ${['', 'الأول', 'الثاني', 'الثالث'][n] || n}</div><h1>${title}</h1><p class="ch2tap">اضغط للمتابعة ‹</p></div>`;
      // ننتظر قليلاً حتى لا تُغلق البطاقة بنفس النقرة التي فتحتها
      setTimeout(() => { el.onclick = () => { el.onclick = null; el.className = 'screen'; res(); }; }, 350);
    });
  }
};
export function heroLook(h) {
  return { kind: h.kind, skin: h.skin, accent: h.color, robe: h.kind === 'girl' ? '#D85C7B' : '#F7F5EF' };
}
