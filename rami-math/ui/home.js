// الشاشة الرئيسية (عند الدخول): مستوحاة من تصميم بطاقات الألعاب الحديثة — بطل مجسّم، شعار، زر «تابع مغامرتك»،
// بطاقتا «مغامرة جديدة» و«رمز التقدّم»، أربع أدوات (الإعدادات، الإنجازات، الدروس، تقدّمي)، بطاقة الرحلة الحالية، وشريط سفلي.
// كل ما يُعرض قراءة من الحفظ الموجود (لا نقاط ولا مستويات جديدة). المعرّفات bCont/bNew/bCode كما هي.
import { LESSONS, UNITS } from '../content/lessons.js';
import { ACH } from '../achievements/achievements.js';
import { ar } from '../core/util.js';
import { sound } from '../core/sound.js';
import { ramadanPref, setRamadanPref, PREF_LABEL } from '../core/season.js';

const QUOTES = ['كل خطوة صغيرة… تقرّبك من هدفك الكبير', 'الرياضيات مفتاح كل مغامرة', 'من حاول تعلّم، ومن تعلّم نجح', 'أهل القرية ينتظرون مساعدتك!'];

/* تقدّم الحفظ: الدرس الحالي ووحدته، وعدد المنجز في الوحدة وفي المنهج */
export function progressOf(saved) {
  const done = id => !!(saved && saved.quests && saved.quests.done && saved.quests.done[id]);
  const cur = LESSONS.find(l => !done(l.id)) || LESSONS[LESSONS.length - 1], u = UNITS[cur.u];
  const inUnit = LESSONS.filter(l => l.u === cur.u), unitDone = inUnit.filter(l => done(l.id)).length;
  return { cur, u, unitIdx: cur.u, unitDone, unitTotal: inUnit.length, total: LESSONS.filter(l => done(l.id)).length, all: LESSONS.length,
    ach: saved && saved.achievements ? ACH.filter(a => saved.achievements[a.id]).length : 0, done };
}

/* المشهد الخلفي: سماء وغيوم، قلعة عُمانية بعلم، نخيل وكثبان (SVG خفيف بلا صور) */
const SCENE = `<svg class="hscene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs><linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB7EA"/><stop offset=".6" stop-color="#BFE2F7"/><stop offset="1" stop-color="#FFF4DD"/></linearGradient>
  <linearGradient id="hf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9C48C"/><stop offset="1" stop-color="#C99A62"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#hs)"/>
  <g fill="#fff" opacity=".9"><ellipse cx="80" cy="60" rx="34" ry="12"/><ellipse cx="100" cy="52" rx="22" ry="12"/><ellipse cx="290" cy="40" rx="30" ry="10"/><ellipse cx="310" cy="33" rx="18" ry="10"/></g>
  <path d="M0 210 Q90 170 190 200 T400 190 V300 H0Z" fill="#E7C997"/>
  <g transform="translate(250 92)"><rect x="0" y="40" width="130" height="110" fill="url(#hf)"/><rect x="-14" y="20" width="44" height="130" rx="20" fill="#DDB57E"/><rect x="104" y="30" width="40" height="120" rx="18" fill="#CFA56F"/>
    <path d="M0 40h130" stroke="#B88A55" stroke-width="3"/><g fill="#B88A55">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 15}" y="32" width="9" height="10"/>`).join('')}</g>
    <rect x="52" y="105" width="26" height="45" rx="13" fill="#7A4A2A"/><line x1="8" y1="20" x2="8" y2="-14" stroke="#555" stroke-width="2"/>
    <g transform="translate(8 -14)"><rect width="26" height="6" fill="#C8102E"/><rect y="6" width="26" height="5" fill="#fff"/><rect y="11" width="26" height="5" fill="#009639"/><rect width="8" height="16" fill="#C8102E"/></g></g>
  ${[[30, 200, 1], [360, 215, .8], [215, 205, .7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q-3 -40 2 -80" stroke="#8A6238" stroke-width="6" fill="none"/>
    ${[-70, -35, 0, 35, 70, 110].map(a => `<path d="M2 -80 q${Math.cos(a * Math.PI / 180) * 20} ${-12 + Math.abs(a) / 6} ${Math.cos(a * Math.PI / 180) * 38} ${10 + Math.abs(a) / 3}" stroke="#3E8A3A" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}</g>`).join('')}
</svg>`;

const ICON = {
  play: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M10 7.5v9l7-4.5z" fill="#2A1B66"/></svg>',
  pad: '<svg viewBox="0 0 64 48"><rect x="4" y="8" width="56" height="32" rx="16" fill="#fff"/><rect x="14" y="21" width="12" height="4" rx="2" fill="#5B3FD0"/><rect x="18" y="17" width="4" height="12" rx="2" fill="#5B3FD0"/><circle cx="44" cy="20" r="3" fill="#E2475C"/><circle cx="50" cy="26" r="3" fill="#2F6FB2"/><circle cx="38" cy="26" r="3" fill="#FFC23D"/><circle cx="44" cy="31" r="3" fill="#2E9E5B"/></svg>',
  target: '<svg viewBox="0 0 64 64"><circle cx="30" cy="34" r="24" fill="#E2475C"/><circle cx="30" cy="34" r="17" fill="#fff"/><circle cx="30" cy="34" r="10" fill="#E2475C"/><circle cx="30" cy="34" r="4" fill="#fff"/><path d="M30 34L54 10" stroke="#5E3A1E" stroke-width="4"/><path d="M50 6l8 0-0 8-6 2z" fill="#FFC23D"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path fill="#2F6FB2" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9.4 5.5-2 .3a7.5 7.5 0 0 1-.7 1.7l1.2 1.6-1.9 1.9-1.6-1.2a7.5 7.5 0 0 1-1.7.7l-.3 2h-2.7l-.3-2a7.5 7.5 0 0 1-1.7-.7l-1.6 1.2-1.9-1.9 1.2-1.6a7.5 7.5 0 0 1-.7-1.7l-2-.3v-2.7l2-.3a7.5 7.5 0 0 1 .7-1.7L4.2 6.2l1.9-1.9 1.6 1.2a7.5 7.5 0 0 1 1.7-.7l.3-2h2.7l.3 2a7.5 7.5 0 0 1 1.7.7l1.6-1.2 1.9 1.9-1.2 1.6c.3.5.5 1.1.7 1.7l2 .3z"/></svg>',
  cup: '<svg viewBox="0 0 24 24"><path fill="#F2A922" d="M7 3h10v3h3a3 3 0 0 1-3 4.6A5 5 0 0 1 13 14v3h3v3H8v-3h3v-3a5 5 0 0 1-4-3.4A3 3 0 0 1 4 6h3zM5.6 8A1.5 1.5 0 0 0 7 9.2V8zM17 8v1.2A1.5 1.5 0 0 0 18.4 8z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path fill="#1F4E79" d="M2 5c3-1 6-1 10 1 4-2 7-2 10-1v14c-3-1-6-1-10 1-4-2-7-2-10-1z"/><path fill="#9CC8EA" d="M3.5 6.2c2.5-.6 5-.4 7.7 1v11c-2.7-1.3-5.2-1.5-7.7-1zm17 0v11c-2.5-.5-5-.3-7.7 1v-11c2.7-1.4 5.2-1.6 7.7-1z"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" rx="1" fill="#7B3F98"/><rect x="10" y="7" width="4" height="14" rx="1" fill="#F2A922"/><rect x="17" y="3" width="4" height="18" rx="1" fill="#2E9E5B"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.5" fill="currentColor"/><path fill="currentColor" d="M3 21c0-5 4-7.5 9-7.5s9 2.5 9 7.5z"/></svg>',
  bulb: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6" fill="#FFC23D"/><rect x="9" y="16" width="6" height="4" rx="1" fill="#C9D3DA"/><path d="M12 1v2M3 10H1M23 10h-2M5 3l1.5 1.5M19 3l-1.5 1.5" stroke="#FFC23D" stroke-width="2" stroke-linecap="round"/></svg>',
  map: '<svg viewBox="0 0 120 80"><path d="M6 70 Q20 30 45 40 T80 20 L110 64 Z" fill="#D9B27A"/><path d="M30 70 L55 22 L80 70Z" fill="#B98955"/><path d="M48 36 L55 22 L62 36Z" fill="#fff"/><path d="M0 72 Q60 60 120 72 V80 H0Z" fill="#7CC6E8"/><path d="M14 62 Q35 52 52 56 T88 44" stroke="#5E3A1E" stroke-dasharray="4 4" stroke-width="2" fill="none"/>' +
    [[14, 62], [52, 56], [88, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#2E9E5B" stroke="#fff" stroke-width="2"/><path d="M${x - 3} ${y}l2 2 4-4" stroke="#fff" stroke-width="2" fill="none"/>`).join('') + '<path d="M60 22v-12l10 4-10 4" fill="#E2475C"/><circle cx="14" cy="40" r="7" fill="#3E8A3A"/><circle cx="100" cy="40" r="6" fill="#3E8A3A"/></svg>'
};

export function homeHTML(saved) {
  const P = progressOf(saved), q = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];
  const pct = Math.round(P.unitDone / P.unitTotal * 100);
  return `${SCENE}
  <div class="home">
    <header class="htop">
      <button class="hbtn" id="hSet" aria-label="الإعدادات"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg></button>
      ${saved ? `<div class="hlevel"><span>⭐</span>الوحدة ${ar(P.unitIdx + 1)} من ${ar(UNITS.length)}</div>` : '<div></div>'}
    </header>
    <section class="hhero">
      <div class="hbrand">
        <div class="hlogo"><span class="cap">🎓</span>قرية الخير</div>
        <div class="hribbon">مغامرة رامي ماث</div>
        <p class="htag">رحلة ممتعة في عالم الرياضيات</p>
      </div>
      <canvas id="tHero" width="190" height="250"></canvas>
    </section>
    ${saved ? `<button class="hplay" id="bCont"><i>${ICON.play}</i><b>تابع مغامرتك</b><em>‹</em></button>`
            : `<button class="hplay" id="bNew"><i>${ICON.play}</i><b>ابدأ المغامرة</b><em>‹</em></button>`}
    <div class="hcards">
      ${saved ? `<button class="hcard2 purple" id="bNew"><div class="hi">${ICON.pad}</div><b>مغامرة جديدة</b><small>ابدأ من أول درس ببطل جديد</small><span class="harr">←</span></button>` : ''}
      <button class="hcard2 blue" id="bCode"><div class="hi">${ICON.target}</div><b>لديّ رمز تقدّم</b><small>استعد مغامرتك على هذا الجهاز</small><span class="harr">←</span></button>
    </div>
    <nav class="htiles">
      <button data-p="set"><i class="t1">${ICON.gear}</i><b>الإعدادات</b><small>تخصيص تجربتك</small></button>
      <button data-p="ach"><i class="t2">${ICON.cup}</i><b>الإنجازات</b><small>${ar(P.ach)} من ${ar(ACH.length)}</small></button>
      <button data-p="les"><i class="t3">${ICON.book}</i><b>الدروس</b><small>رحلة المنهج</small></button>
      <button data-p="sta"><i class="t4">${ICON.chart}</i><b>تقدّمي</b><small>${ar(P.total)} من ${ar(P.all)} درساً</small></button>
    </nav>
    ${saved ? `<button class="hjourney" data-p="les"><div class="hmap">${ICON.map}</div><div class="hjt"><small>رحلتك الحالية · ${P.u.place}</small><b>الوحدة ${ar(P.unitIdx + 1)}: ${P.u.title}</b>
      <div class="hbar"><i style="width:${pct}%"></i></div><span>${ar(P.unitDone)}/${ar(P.unitTotal)}</span></div><em>‹</em></button>` : ''}
    <div class="hquote"><i>${ICON.bulb}</i><p>«${q}»</p></div>
    <div class="hspace"></div>
  </div>
  <footer class="hnav">
    <button class="on" data-n="home"><i>${ICON.home}</i>الرئيسية</button>
    <button data-n="play"><i><svg viewBox="0 0 64 48">${ICON.pad.replace(/<svg[^>]*>|<\/svg>/g, '').replace('fill="#fff"', 'fill="currentColor"')}</svg></i>المغامرة</button>
    <button data-p="ach"><i>${ICON.cup.replace('#F2A922', 'currentColor')}</i>الإنجازات</button>
    <button data-p="me"><i>${ICON.user}</i>حسابي</button>
  </footer>
  <div class="hsheet" id="hSheet" hidden><div class="hsbox"></div></div>`;
}

/* اللوحات الصغيرة داخل الشاشة الرئيسية (قراءة فقط، ما عدا الإعدادات المحفوظة على الجهاز) */
export function homeSheets(el, saved, gfx) {
  const P = progressOf(saved), sh = el.querySelector('#hSheet'), box = sh.querySelector('.hsbox');
  const open = html => { box.innerHTML = html + '<button class="act" data-x>رجوع</button>'; sh.hidden = false; box.querySelector('[data-x]').onclick = () => { sh.hidden = true; }; };
  sh.onclick = e => { if (e.target === sh) sh.hidden = true; };
  const show = {
    set() {
      const draw = () => open(`<h3>⚙️ الإعدادات</h3>
        <button class="act ghost" id="sSnd">${sound.on ? '🔊 الصوت يعمل' : '🔇 الصوت متوقف'}</button>
        <button class="act ghost" id="sD3">🎮 العرض: ${gfx.d3() ? 'ثلاثي الأبعاد' : 'عادي'}</button>
        ${gfx.d3() ? `<button class="act ghost" id="sQ">✨ الجودة: ${{ auto: 'تلقائية', high: 'عالية', low: 'منخفضة' }[gfx.q()]}</button>` : ''}
        <button class="act ghost" id="sRam">🌙 أجواء رمضان: ${PREF_LABEL[ramadanPref()]}</button>`);
      draw();
      const bind = () => {
        box.querySelector('#sSnd').onclick = () => { sound.on = !sound.on; draw(); bind(); };
        box.querySelector('#sD3').onclick = () => gfx.set3d(!gfx.d3());
        if (box.querySelector('#sQ')) box.querySelector('#sQ').onclick = () => { gfx.setQ({ auto: 'high', high: 'low', low: 'auto' }[gfx.q()]); draw(); bind(); };
        box.querySelector('#sRam').onclick = () => { setRamadanPref({ auto: 'on', on: 'off', off: 'auto' }[ramadanPref()]); draw(); bind(); };
      };
      bind();
    },
    ach() { open(`<h3>🏆 الإنجازات <small>${ar(P.ach)} / ${ar(ACH.length)}</small></h3><div class="hlist">` + ACH.map(a => `<div class="ach ${saved && saved.achievements && saved.achievements[a.id] ? 'on' : ''}"><span>${a.icon}</span><div><b>${a.name}</b><small>${a.desc}</small></div></div>`).join('') + '</div>'); },
    les() { open(`<h3>📖 رحلة الدروس</h3><div class="hlist">` + UNITS.map((u, ui) => { const ls = LESSONS.filter(l => l.u === ui), d = ls.filter(l => P.done(l.id)).length;
      return `<div class="qunit"><b>الفصل ${u.term === 1 ? 'الأول' : 'الثاني'} · الوحدة ${ar(u.n)}: ${u.title}</b><small>📍 ${u.place} — ${ar(d)} من ${ar(ls.length)}</small>` +
        ls.map(l => `<div class="qrow ${P.done(l.id) ? 'done' : l === P.cur ? 'now' : ''}"><span>${P.done(l.id) ? '✅' : l === P.cur ? '▶️' : '🔒'}</span><div><b>${l.title}</b></div></div>`).join('') + '</div>'; }).join('') + '</div>'); },
    sta() { open(`<h3>📊 تقدّمي</h3><div class="hlist">` + UNITS.map((u, ui) => { const ls = LESSONS.filter(l => l.u === ui), d = ls.filter(l => P.done(l.id)).length;
      return `<div class="hstat"><b>${u.title} <small>${u.place}</small></b><div class="hbar"><i style="width:${Math.round(d / ls.length * 100)}%"></i></div><span>${ar(d)}/${ar(ls.length)}</span></div>`; }).join('') +
      `</div><p class="muted">أنجزتَ ${ar(P.total)} من ${ar(P.all)} درساً${saved ? '' : ' — ابدأ المغامرة لتظهر رحلتك هنا'}.</p>`); },
    me() { open(saved ? `<h3>👤 حسابي</h3><div class="bagrow"><span>🦸 البطل</span><b>${saved.hero.name}</b></div><div class="bagrow"><span>📚 الدروس المنجزة</span><b>${ar(P.total)} / ${ar(P.all)}</b></div>
        <div class="bagrow"><span>💚 نقاط الخير</span><b>${ar(saved.good || 0)}</b></div><div class="bagrow"><span>🏆 الإنجازات</span><b>${ar(P.ach)} / ${ar(ACH.length)}</b></div><p class="muted">لنقل مغامرتك إلى جهاز آخر: من الحقيبة 🎒 داخل اللعبة ← «رمز حفظ التقدّم».</p>`
        : `<h3>👤 حسابي</h3><p class="muted">لا توجد مغامرة محفوظة على هذا الجهاز بعد. ابدأ مغامرة جديدة، أو استعد مغامرتك برمز التقدّم.</p>`); }
  };
  el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => show[b.dataset.p]());
  el.querySelector('#hSet').onclick = () => show.set();
  const play = el.querySelector('[data-n="play"]'); play.onclick = () => (el.querySelector('#bCont') || el.querySelector('#bNew')).click();
}
