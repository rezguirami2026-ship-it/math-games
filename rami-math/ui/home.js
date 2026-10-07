// الشاشة الرئيسية (عند الدخول): مستوحاة من تصميم بطاقات الألعاب الحديثة — بطل مجسّم، شعار، زر «تابع مغامرتك»،
// بطاقتا «مغامرة جديدة» و«رمز التقدّم»، أربع أدوات (الإعدادات، الإنجازات، الدروس، تقدّمي)، بطاقة الرحلة الحالية، وشريط سفلي.
// كل ما يُعرض قراءة من الحفظ الموجود (لا نقاط ولا مستويات جديدة). المعرّفات bCont/bNew/bCode كما هي.
import { LESSONS, UNITS } from '../content/lessons.js';
import { levelOf } from '../core/levels.js';
import { ACH } from '../achievements/achievements.js';
import { BADGES } from '../achievements/badges.js';
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
    ach: saved && saved.achievements ? ACH.filter(a => saved.achievements[a.id]).length : 0, done,
    badges: saved && saved.achievements ? BADGES.filter(b => saved.achievements[b.id]).length : 0,
    stars: id => Math.min(3, ((saved && saved.quests && saved.quests.data && saved.quests.data[id]) || {}).stars || 0) };
}

/* المشهد الخلفي: سماء مشمسة وغيوم، جبال الحجر، قلعة عُمانية بعلم، بيوت بأقواس وفانوس، نخيل كبير في المقدمة، وساحة مبلّطة بزخرفة دائرية (SVG خفيف بلا صور) */
const PALM = (x, y, s, f = 1) => `<g transform="translate(${x} ${y}) scale(${s * f} ${s})"><path d="M0 0 C-6 -90 6 -170 18 -250" stroke="#7A5230" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M0 0 C-6 -90 6 -170 18 -250" stroke="#A9764A" stroke-width="5" fill="none" stroke-dasharray="6 14"/>
  ${[[-150, 60], [-110, 30], [-60, 10], [0, 0], [50, 15], [100, 40], [150, 70], [-30, -20], [25, -25]].map(([dx, dy], i) => `<path d="M18 -250 Q${18 + dx * .5} ${-300 + dy * .3} ${18 + dx} ${-240 + dy}" stroke="${i % 2 ? '#2F8A3A' : '#46A845'}" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M18 -250 Q${18 + dx * .5} ${-300 + dy * .3} ${18 + dx} ${-240 + dy}" stroke="#7FD06A" stroke-width="3" fill="none" stroke-dasharray="2 7"/>`).join('')}
  <g fill="#D98A10">${[[8, -238], [26, -236], [16, -228], [2, -226]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="7"/>`).join('')}</g></g>`;
const SCENE = `<svg class="hscene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="hsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E9BE6"/><stop offset=".55" stop-color="#9FD3F5"/><stop offset="1" stop-color="#FFE9C2"/></linearGradient>
    <radialGradient id="hsSun" cx=".55" cy=".2" r=".5"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></radialGradient>
    <linearGradient id="hsM1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8F87B8"/><stop offset="1" stop-color="#C9B6C9"/></linearGradient>
    <linearGradient id="hsM2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A57E6A"/><stop offset="1" stop-color="#D7B08A"/></linearGradient>
    <linearGradient id="hsWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D4A0"/><stop offset="1" stop-color="#C99A62"/></linearGradient>
    <linearGradient id="hsWall2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E6C28A"/><stop offset="1" stop-color="#BE8F57"/></linearGradient>
    <radialGradient id="hsPlaza" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#F6DDB0"/><stop offset="1" stop-color="#D3A86E"/></radialGradient>
    <filter id="hsBlur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#hsSky)"/><rect width="1600" height="900" fill="url(#hsSun)"/>
  <g fill="#fff" opacity=".92">${[[230, 120, 1], [760, 70, .8], [1180, 140, 1.1], [1450, 60, .7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="70" ry="22"/><ellipse cx="40" cy="-14" rx="44" ry="26"/><ellipse cx="-30" cy="-8" rx="34" ry="20"/><ellipse cx="80" cy="4" rx="40" ry="16"/></g>`).join('')}</g>
  <path d="M0 470 L120 330 L230 400 L360 260 L520 390 L660 300 L820 420 L980 290 L1130 380 L1290 270 L1440 360 L1600 300 V600 H0Z" fill="url(#hsM1)" opacity=".85"/>
  <path d="M0 520 L160 420 L300 480 L460 380 L620 470 L780 400 L960 490 L1120 410 L1300 470 L1460 400 L1600 450 V620 H0Z" fill="url(#hsM2)" opacity=".9"/>
  ${[[420, 560, .55], [520, 575, .5], [980, 560, .55], [1080, 570, .5], [610, 585, .45]].map(([x, y, s]) => PALM(x, y, s, 1)).join('')}
  <!-- القلعة على اليمين -->
  <g transform="translate(1180 230)">
    <rect x="0" y="150" width="380" height="330" fill="url(#hsWall2)"/>
    <rect x="-40" y="90" width="120" height="390" rx="10" fill="url(#hsWall)"/><rect x="300" y="60" width="130" height="420" rx="10" fill="url(#hsWall)"/>
    <rect x="130" y="40" width="150" height="160" fill="url(#hsWall)"/>
    <g fill="#B48550">${Array.from({ length: 26 }, (_, i) => `<rect x="${-40 + i * 18}" y="${i < 7 ? 76 : i < 17 ? 136 : 46}" width="11" height="16" rx="2"/>`).join('')}</g>
    <g fill="#8A6238" opacity=".75"><rect x="0" y="260" width="20" height="34" rx="10"/><rect x="342" y="220" width="20" height="34" rx="10"/><rect x="190" y="90" width="22" height="36" rx="11"/></g>
    <path d="M150 480 V390 a45 45 0 0 1 90 0 V480Z" fill="#6E4524"/><path d="M160 480 V395 a35 35 0 0 1 70 0 V480Z" fill="#8A5A30"/>
    <line x1="350" y1="60" x2="350" y2="-70" stroke="#5A5A5A" stroke-width="5"/>
    <g transform="translate(350 -70)"><rect width="90" height="20" fill="#C8102E"/><rect y="20" width="90" height="16" fill="#fff"/><rect y="36" width="90" height="18" fill="#009639"/><rect width="28" height="54" fill="#C8102E"/></g>
  </g>
  <!-- بيوت ودكان على اليسار -->
  <g transform="translate(-40 360)">
    <rect x="0" y="40" width="330" height="260" fill="url(#hsWall)"/><rect x="230" y="0" width="160" height="300" fill="url(#hsWall2)"/>
    <g fill="#B48550">${Array.from({ length: 21 }, (_, i) => `<rect x="${i * 19}" y="${i < 12 ? 30 : -10}" width="12" height="14" rx="2"/>`).join('')}</g>
    <path d="M100 300 V200 a60 60 0 0 1 120 0 V300Z" fill="#6E4524"/><path d="M114 300 V205 a46 46 0 0 1 92 0 V300Z" fill="#9A6234"/>
    <rect x="262" y="90" width="44" height="60" rx="22" fill="#2F6B73"/><rect x="330" y="90" width="44" height="60" rx="22" fill="#2F6B73"/>
    <path d="M320 150 l120 -30 20 50 -130 20z" fill="#3F7FB0" opacity=".9"/><path d="M320 150 l120 -30 6 15 -124 30z" fill="#F4F1E8" opacity=".9"/>
    <circle cx="245" cy="185" r="14" fill="#FFE08A" filter="url(#hsBlur)"/><rect x="238" y="170" width="14" height="22" rx="4" fill="#8A5A30"/>
  </g>
  <!-- الساحة المبلّطة بزخرفة دائرية -->
  <path d="M0 660 Q800 590 1600 660 V900 H0Z" fill="url(#hsPlaza)"/>
  <g fill="none" stroke="#B9874F" stroke-width="3" opacity=".55"><ellipse cx="800" cy="800" rx="520" ry="120"/><ellipse cx="800" cy="800" rx="380" ry="86"/><ellipse cx="800" cy="800" rx="230" ry="52"/></g>
  <g stroke="#B9874F" stroke-width="2" opacity=".35">${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<line x1="800" y1="800" x2="${800 + Math.cos(a) * 520}" y2="${800 + Math.sin(a) * 120}"/>`; }).join('')}</g>
  <!-- لافتة خشبية -->
  <g transform="translate(1390 520)"><rect x="-6" y="0" width="12" height="150" fill="#6B4520"/><rect x="150" y="0" width="12" height="150" fill="#6B4520"/>
    <rect x="-30" y="-20" width="220" height="70" rx="10" fill="#7A4A22"/><rect x="-22" y="-12" width="204" height="54" rx="8" fill="#9C6438"/>
    <text x="80" y="27" text-anchor="middle" font-family="Cairo,sans-serif" font-weight="900" font-size="34" fill="#FFF1D0">قرية الخير</text></g>
  ${PALM(60, 900, 1.25)}${PALM(1560, 900, 1.2, -1)}
  <g opacity=".95">${[[110, 860, '#3E8A3A'], [220, 890, '#4FA548'], [1430, 870, '#3E8A3A'], [1520, 890, '#4FA548']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="120" ry="70" fill="${c}"/>`).join('')}
    ${[[90, 830], [150, 850], [1450, 840], [1500, 860], [210, 870]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="9" fill="${['#E2475C', '#FFC23D', '#F08AB0'][i % 3]}"/>`).join('')}</g>
</svg>`;

/* أيقونات البطاقات الأربع (مرسومة بتدرجات) */
const CARD_ICON = {
  castle: `<svg viewBox="0 0 160 120"><defs><linearGradient id="ciW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DCA8"/><stop offset="1" stop-color="#C9955A"/></linearGradient></defs>
    <ellipse cx="80" cy="104" rx="70" ry="12" fill="#2E8B57"/><ellipse cx="80" cy="100" rx="66" ry="10" fill="#5FC25A"/>
    <rect x="40" y="48" width="80" height="52" fill="url(#ciW)" stroke="#8A5A24" stroke-width="2"/><rect x="28" y="36" width="24" height="64" fill="url(#ciW)" stroke="#8A5A24" stroke-width="2"/><rect x="108" y="36" width="24" height="64" fill="url(#ciW)" stroke="#8A5A24" stroke-width="2"/>
    <g fill="url(#ciW)" stroke="#8A5A24" stroke-width="1.5">${[28, 40, 108, 120].map(x => `<rect x="${x}" y="28" width="8" height="10"/>`).join('')}${[46, 58, 70, 82, 94, 106].map(x => `<rect x="${x}" y="40" width="8" height="10"/>`).join('')}</g>
    <path d="M70 100 V82 a10 10 0 0 1 20 0 V100Z" fill="#7A4A2A"/><line x1="120" y1="30" x2="120" y2="6" stroke="#555" stroke-width="2"/>
    <g transform="translate(120 6)"><rect width="22" height="5" fill="#C8102E"/><rect y="5" width="22" height="4" fill="#fff"/><rect y="9" width="22" height="5" fill="#009639"/><rect width="7" height="14" fill="#C8102E"/></g>
    <g stroke="#2F8A3A" stroke-width="4" stroke-linecap="round" fill="none"><path d="M18 98 Q16 76 20 64"/><path d="M20 64 q-12 -2 -16 6M20 64 q12 -4 16 4M20 64 q-4 -10 -12 -12M20 64 q6 -10 14 -10"/></g></svg>`,
  map: `<svg viewBox="0 0 160 120"><defs><linearGradient id="ciP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4D6"/><stop offset="1" stop-color="#E7C48A"/></linearGradient></defs>
    <path d="M20 24 L60 14 L100 24 L138 14 V96 L100 106 L60 96 L20 106Z" fill="url(#ciP)" stroke="#8A5A24" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="12" y="18" width="12" height="92" rx="6" fill="#C9955A" stroke="#8A5A24" stroke-width="2"/>
    <path d="M30 88 C46 74 52 60 70 62 S96 74 108 52" fill="none" stroke="#8A5A24" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round"/>
    <path d="M108 30 c-8 0 -12 6 -12 11 0 8 12 20 12 20 s12 -12 12 -20 c0 -5 -4 -11 -12 -11z" fill="#E2475C" stroke="#9A2433" stroke-width="2"/><circle cx="108" cy="41" r="4" fill="#fff"/>
    <path d="M44 56 l10 -16 10 16z" fill="#7FA9C9"/><path d="M50 46 l4 -6 4 6z" fill="#fff"/>
    <g stroke="#2F8A3A" stroke-width="3" stroke-linecap="round" fill="none"><path d="M60 86 Q59 76 61 70"/><path d="M61 70 q-7 -1 -10 4M61 70 q7 -2 10 3M61 70 q-2 -6 -8 -7"/></g>
    <circle cx="128" cy="92" r="20" fill="#2F6FB2" stroke="#FFC23D" stroke-width="4"/><circle cx="128" cy="92" r="14" fill="#EAF6FF"/><path d="M128 80 l4 12 -4 12 -4 -12z" fill="#E2475C"/><path d="M128 92 l4 0 -4 12z" fill="#2A1B66"/></svg>`,
  trophy: `<svg viewBox="0 0 160 120"><defs><linearGradient id="ciG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF2B0"/><stop offset=".55" stop-color="#F5B82E"/><stop offset="1" stop-color="#B97A10"/></linearGradient></defs>
    <path d="M50 14h60v24c0 22-13 36-30 36S50 60 50 38z" fill="url(#ciG)" stroke="#8A5A10" stroke-width="2.4"/>
    <path d="M50 22H34c0 20 10 28 22 28M110 22h16c0 20-10 28-22 28" fill="none" stroke="#E0A21E" stroke-width="7" stroke-linecap="round"/>
    <rect x="72" y="72" width="16" height="14" fill="#D9961C" stroke="#8A5A10" stroke-width="2"/>
    <path d="M24 90 h112 l-10 14 10 14 H24 l10 -14z" fill="#7B3FD0" stroke="#4A1F8A" stroke-width="2"/><rect x="50" y="86" width="60" height="16" rx="3" fill="#9C66F0" stroke="#4A1F8A" stroke-width="2"/>
    <path d="M80 26l5 10 11 1.6-8 7.8 2 11L80 51l-10 5.4 2-11-8-7.8L75 36z" fill="#fff" stroke="#E0A21E" stroke-width="1.5"/>
    <g fill="#FFE07A">${[[26, 30], [136, 34], [30, 60], [132, 64]].map(([x, y]) => `<path d="M${x} ${y - 8} l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z"/>`).join('')}</g></svg>`,
  profile: `<svg viewBox="0 0 160 120"><defs><linearGradient id="ciB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FB0FF"/><stop offset="1" stop-color="#1F5FBF"/></linearGradient></defs>
    <g fill="#4FA548">${[[34, 70, -40], [36, 46, -20], [126, 70, 40], [124, 46, 20]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="18" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g>
    <circle cx="80" cy="58" r="44" fill="url(#ciB)" stroke="#fff" stroke-width="5"/><circle cx="80" cy="46" r="14" fill="#fff"/><path d="M56 84 c2 -16 12 -22 24 -22 s22 6 24 22z" fill="#fff"/>
    <g transform="translate(124 92)"><circle r="16" fill="#FFC23D" stroke="#B97A10" stroke-width="2.5"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-4" y="-22" width="8" height="10" rx="2" fill="#FFC23D" stroke="#B97A10" stroke-width="2" transform="rotate(${i * 45})"/>`).join('')}<circle r="6" fill="#fff" stroke="#B97A10" stroke-width="2"/></g></svg>`
};
const GEM = c => `<svg viewBox="0 0 40 40" class="gem"><polygon points="12,1 28,1 39,12 39,28 28,39 12,39 1,28 1,12" fill="url(#gemG)" stroke="#8A5A10" stroke-width="2"/><polygon points="14,7 26,7 33,14 33,26 26,33 14,33 7,26 7,14" fill="${c}"/><path d="M20 12 l2.4 5 5.6.8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.6 -.8z" fill="#FFE07A"/></svg>`;

export function homeHTML(saved) {
  const P = progressOf(saved), L = saved ? levelOf(saved) : null;
  const card = (cls, id, attr, icon, title, sub, gem) => `<button class="hcard ${cls}" ${id ? `id="${id}"` : ''} ${attr || ''}><span class="ci">${CARD_ICON[icon]}</span><b>${title}</b><small>${sub}</small>${GEM(gem)}</button>`;
  return `${SCENE}<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gemG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0B8"/><stop offset=".5" stop-color="#E8B33A"/><stop offset="1" stop-color="#9C6512"/></linearGradient></defs></svg>
  <div class="home2">
    <header class="h2top">
      <button class="hbtn" id="hSet" data-p="set" aria-label="الإعدادات"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg></button>
      ${L ? `<div class="hlevel"><span>${L.icon}</span>المستوى ${ar(L.n)}: ${L.title}</div>` : '<div></div>'}
    </header>
    <section class="h2hero">
      <canvas id="tHero" width="270" height="355"></canvas>
      <div class="hbrand"><div class="hlogo"><span class="cap">🎓</span>قرية الخير</div><div class="hribbon">مغامرة رامي ماث</div><p class="htag">رحلة ممتعة في عالم الرياضيات</p></div>
    </section>
    <nav class="h2cards">
      ${saved ? card('c1', 'bCont', '', 'castle', 'تابع المغامرة', `الوحدة ${ar(P.unitIdx + 1)}: ${P.u.title}`, '#2F6FB2') : card('c1', 'bNew', '', 'castle', 'ابدأ المغامرة', 'ابدأ رحلتك مع رامي', '#2F6FB2')}
      ${card('c2', '', 'data-p="les"', 'map', 'رحلة الدروس', 'اكتشف، تعلّم، تقدّم', '#E07B12')}
      ${card('c3', '', 'data-p="ach"', 'trophy', 'الإنجازات', saved ? `${ar(P.badges)} وساماً · ${ar(P.total)} درساً` : 'اجمع النجوم والأوسمة', '#6B3FD0')}
      ${card('c4', '', 'data-p="me"', 'profile', 'حسابي', 'تابع تقدّمك وبياناتك', '#2E9E5B')}
    </nav>
    <div class="h2more">
      ${saved ? '<button class="hpill" id="bNew">✨ مغامرة جديدة</button>' : ''}
      <button class="hpill" id="bCode">🔑 لديّ رمز تقدّم</button>
      <button class="hpill" data-p="sta">📊 تقدّمي</button>
      <button class="hpill" data-p="set">⚙️ الإعدادات</button>
    </div>
  </div>
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
    ach() { const S = saved || { quests: {}, achievements: {} }; open(`<h3>🏅 الأوسمة <small>${ar(P.badges)} / ${ar(BADGES.length)}</small></h3><div class="bdGrid">` +
      BADGES.map(b => { const [c, g] = b.prog(S), on = !!(S.achievements && S.achievements[b.id]); return `<div class="bd ${on ? 'on' : ''}"><span>${b.icon}</span><b>${b.name}</b><small>${b.desc}</small>${on ? '<em>✓ مكتسب</em>' : `<i><u style="width:${Math.round(Math.min(1, c / g) * 100)}%"></u></i><em>${ar(Math.min(c, g))} / ${ar(g)}</em>`}</div>`; }).join('') + '</div>' +
      `<h3>🏆 إنجازات المغامرة <small>${ar(P.ach)} / ${ar(ACH.length)}</small></h3><div class="hlist">` + ACH.map(a => `<div class="ach ${saved && saved.achievements && saved.achievements[a.id] ? 'on' : ''}"><span>${a.icon}</span><div><b>${a.name}</b><small>${a.desc}</small></div></div>`).join('') + '</div>'); },
    les() { open(`<h3>📖 رحلة الدروس</h3><div class="hlist">` + UNITS.map((u, ui) => { const ls = LESSONS.filter(l => l.u === ui), d = ls.filter(l => P.done(l.id)).length;
      return `<div class="qunit"><b>الفصل ${u.term === 1 ? 'الأول' : 'الثاني'} · الوحدة ${ar(u.n)}: ${u.title}</b><small>📍 ${u.place} — ${ar(d)} من ${ar(ls.length)} · ★ ${ar(ls.reduce((n, l) => n + P.stars(l.id), 0))} من ${ar(ls.length * 3)}</small>` +
        ls.map(l => `<div class="qrow ${P.done(l.id) ? 'done' : l === P.cur ? 'now' : ''}"><span>${P.done(l.id) ? '✅' : l === P.cur ? '▶️' : '🔒'}</span><div><b>${l.title}${P.stars(l.id) ? ` <em class="qstars">${'★'.repeat(P.stars(l.id))}<s>${'☆'.repeat(3 - P.stars(l.id))}</s></em>` : ''}</b></div></div>`).join('') + '</div>'; }).join('') + '</div>'); },
    sta() { open(`<h3>📊 تقدّمي</h3><div class="hlist">` + UNITS.map((u, ui) => { const ls = LESSONS.filter(l => l.u === ui), d = ls.filter(l => P.done(l.id)).length;
      return `<div class="hstat"><b>${u.title} <small>${u.place}</small></b><div class="hbar"><i style="width:${Math.round(d / ls.length * 100)}%"></i></div><span>${ar(d)}/${ar(ls.length)}</span></div>`; }).join('') +
      `</div><p class="muted">أنجزتَ ${ar(P.total)} من ${ar(P.all)} درساً${saved ? '' : ' — ابدأ المغامرة لتظهر رحلتك هنا'}.</p>`); },
    me() { open(saved ? `<h3>👤 حسابي</h3><div class="bagrow"><span>🦸 البطل</span><b>${saved.hero.name}</b></div><div class="bagrow"><span>📚 الدروس المنجزة</span><b>${ar(P.total)} / ${ar(P.all)}</b></div>
        <div class="bagrow"><span>💚 نقاط الخير</span><b>${ar(saved.good || 0)}</b></div><div class="bagrow"><span>🏆 الإنجازات</span><b>${ar(P.ach)} / ${ar(ACH.length)}</b></div><div class="bagrow"><span>🏅 الأوسمة</span><b>${ar(P.badges)} / ${ar(BADGES.length)}</b></div><div class="bagrow"><span>${levelOf(saved).icon} المستوى</span><b>${ar(levelOf(saved).n)}: ${levelOf(saved).title}</b></div><p class="muted">لنقل مغامرتك إلى جهاز آخر: من الحقيبة 🎒 داخل اللعبة ← «رمز حفظ التقدّم».</p>`
        : `<h3>👤 حسابي</h3><p class="muted">لا توجد مغامرة محفوظة على هذا الجهاز بعد. ابدأ مغامرة جديدة، أو استعد مغامرتك برمز التقدّم.</p>`); }
  };
  el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => show[b.dataset.p]());

}
