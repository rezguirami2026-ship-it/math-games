// شاشات البداية: العنوان، اختيار البطل، بطاقة الفصل. لا قوائم دروس ولا لوحات.
import { drawHuman, SKINS, ACCENTS } from '../character/human.js';
const $ = id => document.getElementById(id);
let anim = 0;
function animate(canvases) {
  cancelAnimationFrame(anim); let ph = 0;
  const loop = () => {
    ph += .14;
    canvases.forEach(({ c, h }) => { const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); drawHuman(x, Object.assign({ x: c.width / 2, y: c.height - 14, s: 2.2, dir: 'down', moving: true, phase: ph }, h())); });
    anim = requestAnimationFrame(loop);
  };
  loop();
}
export const screens = {
  title(saved, { onContinue, onNew }) {
    const el = $('screen'); el.className = 'screen on title';
    el.innerHTML = `<div class="sky"></div><div class="logo">قرية الخير</div><div class="tag">مغامرة رامي ماث</div>
      <canvas id="tHero" width="200" height="190"></canvas>
      <div class="btns">${saved ? `<button class="act big" id="bCont">تابع مغامرتك</button><button class="act ghost" id="bNew">مغامرة جديدة</button>` : `<button class="act big" id="bNew">ابدأ المغامرة</button>`}</div>`;
    animate([{ c: $('tHero'), h: () => saved ? heroLook(saved.hero) : { kind: 'boy', accent: ACCENTS[0], skin: SKINS[1] } }]);
    if (saved) $('bCont').onclick = () => { cancelAnimationFrame(anim); el.className = 'screen'; onContinue(); };
    $('bNew').onclick = () => { if (saved && !confirm('ستبدأ مغامرة جديدة ويُمسح عالمك الحالي. هل أنت متأكد؟')) return; this.hero(onNew); };
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
      cancelAnimationFrame(anim); done(Object.assign({}, pick, { name }));
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
