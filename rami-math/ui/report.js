// «تقرير تقدّمي»: صفحة واحدة يحتفظ بها الطالب (صورة PNG): الدروس والنجوم والمستوى والأوسمة، ومهاراته الأقوى،
// وما يحتاج تدريباً، وشريط إتقان لكل مجال من مجالات المنهج الـ١١. تُرسم من الحفظ فقط، ولا تُرسل إلى أي مكان.
import { game } from '../core/state.js';
import { sfx } from '../core/sound.js';
import { ar } from '../core/util.js';
import { LESSONS } from '../content/lessons.js';
import { levelOf } from '../core/levels.js';
import { BADGES } from '../achievements/badges.js';
import { ADVENTURES } from '../adventure/index.js';
import { SKILLS, skillOf, lessonStars } from './mastery.js';
import { reviews } from '../missions/review.js';

const W = 1240, H = 1880, F = 'Cairo, "Segoe UI", Tahoma, sans-serif';
/* الأرقام الكاملة للتقرير (منفصلة عن الرسم لتُختبر) */
export function reportData(s = game.state) {
  const K = SKILLS.map(sk => ({ sk, k: skillOf(sk, s) })), started = K.filter(x => x.k.done);
  const ids = LESSONS.map(l => l.id), st = ids.map(id => lessonStars(id, s)), done = st.filter(x => x >= 0).length;
  const stars = st.reduce((a, x) => a + Math.max(0, Math.min(3, x)), 0), gold = st.filter(x => x === 4).length;
  const total = Math.round(K.reduce((a, x) => a + x.k.pct * x.sk[4].length, 0) / ids.length);
  const strong = started.filter(x => x.k.q >= .5).sort((a, b) => (b.k.q - a.k.q) || (b.k.done - a.k.done)).slice(0, 3);
  const practice = started.filter(x => !strong.includes(x) && (x.k.pend || x.k.q < .9)).sort((a, b) => (b.k.pend - a.k.pend) || (a.k.q - b.k.q)).slice(0, 2);
  const adv = ADVENTURES.filter(a => ((s.adventures || {})[a.id] || {}).done).length;
  const badges = BADGES.filter(b => (s.achievements || {})[b.id]).length;
  return { K, done, lessons: ids.length, stars, gold, total, strong, practice, adv, advAll: ADVENTURES.length, badges, badgesAll: BADGES.length,
    gems: s.gems || 0, mastered: s.mastered || 0, pending: Object.keys(reviews()).length, lv: levelOf(s) };
}

function draw(s) {
  const D = reportData(s), girl = s.hero.kind === 'girl', c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const rr = (px, py, w, h, r) => { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); };
  const txt = (t, px, py, size, col, wt = 700, al = 'right') => { x.font = `${wt} ${size}px ${F}`; x.fillStyle = col; x.textAlign = al; x.fillText(t, px, py); };
  x.direction = 'rtl';
  x.fillStyle = '#FFFDF6'; x.fillRect(0, 0, W, H);
  // الرأس: شريط أزرق بنقش ذهبي
  const hg = x.createLinearGradient(0, 0, W, 0); hg.addColorStop(0, '#163E66'); hg.addColorStop(1, '#2A6BA8'); x.fillStyle = hg; x.fillRect(0, 0, W, 250);
  x.fillStyle = '#E3B04B'; for (let i = 20; i < W; i += 40) { x.beginPath(); x.moveTo(i, 250); x.lineTo(i + 10, 262); x.lineTo(i + 20, 250); x.fill(); }
  txt('قرية الخير · رامي ماث', W - 70, 78, 30, '#FCE7B0', 800);
  txt(girl ? 'تقرير تقدّم البطلة' : 'تقرير تقدّم البطل', W - 70, 150, 58, '#FFFFFF', 900);
  txt(s.hero.name, W - 70, 218, 46, '#FFE08A', 900);
  const d = new Date(); txt(`${ar(d.getDate())} / ${ar(d.getMonth() + 1)} / ${ar(d.getFullYear())}`, 70, 78, 26, '#FCE7B0', 700, 'left');
  // المستوى (دائرة على اليسار)
  x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.arc(170, 160, 70, 0, 7); x.fill();
  x.font = `64px ${F}`; x.textAlign = 'center'; x.fillStyle = '#000'; x.fillText(D.lv.icon, 170, 180);
  txt(`المستوى ${ar(D.lv.n)}: ${D.lv.title}`, 270, 172, 28, '#FFFFFF', 800, 'left');
  // أربع بطاقات أرقام
  const cards = [['📘', `${ar(D.done)} من ${ar(D.lessons)}`, 'درساً أنجزته'], ['⭐', `${ar(D.stars)} من ${ar(D.lessons * 3)}`, D.gold ? `نجمة، و${ar(D.gold)} 🌟 ذهبية` : 'نجمة في الدروس'],
    ['🏅', `${ar(D.badges)} من ${ar(D.badgesAll)}`, 'وساماً'], ['📊', `${ar(D.total)}٪`, 'من المنهج أتقنته']];
  const cw = (W - 140 - 3 * 24) / 4;
  cards.forEach(([ic, big, small], i) => { const px = W - 70 - (i + 1) * cw - i * 24, py = 300;
    rr(px, py, cw, 170, 22); x.fillStyle = '#F2F6FB'; x.fill(); x.strokeStyle = '#C9D8EA'; x.lineWidth = 2; x.stroke();
    x.font = `44px ${F}`; x.textAlign = 'center'; x.fillStyle = '#000'; x.fillText(ic, px + cw / 2, py + 58);
    txt(big, px + cw / 2, py + 112, 36, '#163E66', 900, 'center'); txt(small, px + cw / 2, py + 150, 22, '#56627A', 700, 'center'); });
  // نقاط القوة وما يحتاج تدريباً
  let y = 540;
  const box = (title, col, rows, empty) => { const h = 70 + Math.max(1, rows.length) * 52; rr(70, y, W - 140, h, 22); x.fillStyle = col + '14'; x.fill(); x.strokeStyle = col; x.lineWidth = 3; x.stroke();
    txt(title, W - 100, y + 50, 32, col, 900);
    if (!rows.length) txt(empty, W - 100, y + 102, 26, '#56627A', 700);
    rows.forEach(({ sk, k }, i) => { const py = y + 102 + i * 52; txt(`${sk[2]}`, W - 150, py, 28, '#1F2A44', 800);
      x.font = `28px ${F}`; x.textAlign = 'center'; x.fillStyle = '#000'; x.fillText(sk[1], W - 115, py);
      txt(`${ar(Math.round(k.q * 100))}٪ في الدروس المنجزة`, 110, py, 24, '#56627A', 700, 'left'); });
    y += h + 30; };
  box('💪 أقوى مهاراتي', '#2E9E5B', D.strong, 'أنجز دروساً أكثر لتظهر مهاراتك الأقوى هنا.');
  box('🎯 أتدرّب أكثر على', '#E07B00', D.practice, D.done ? 'رائع! لا مجال يحتاج تدريباً إضافياً الآن.' : 'ابدأ أول دروسك في قرية الخير.');
  // أشرطة المجالات الـ١١
  txt('📈 إتقاني في مجالات المنهج', W - 70, y + 20, 32, '#163E66', 900); y += 50;
  D.K.forEach(({ sk, k }) => { const bx = 110, bw = 520, by = y + 8;
    x.font = `26px ${F}`; x.textAlign = 'center'; x.fillStyle = '#000'; x.fillText(sk[1], W - 90, y + 30);
    txt(sk[2], W - 125, y + 30, 25, '#1F2A44', 800);
    txt(`${ar(k.done)} من ${ar(k.ids.length)}`, bx + bw + 20, y + 30, 20, '#56627A', 700, 'left');
    rr(bx, by, bw, 30, 15); x.fillStyle = '#E6ECF3'; x.fill();
    if (k.pct) { rr(bx + bw - Math.max(30, bw * k.pct / 100), by, Math.max(30, bw * k.pct / 100), 30, 15); x.fillStyle = sk[3]; x.fill(); }
    txt(`${ar(k.pct)}٪`, bx - 12, y + 31, 22, '#1F2A44', 800, 'right');
    y += 54; });
  // سطر إضافي ثم الختام
  y += 16; rr(70, y, W - 140, 80, 20); x.fillStyle = '#FFF4D6'; x.fill();
  txt(`💎 ${ar(D.gems)} جوهرة   ·   🗺️ ${ar(D.adv)} من ${ar(D.advAll)} مغامرات   ·   🧠 ${ar(D.mastered)} مهارة أتقنتها بالمراجعة`, W / 2, y + 52, 26, '#5A4300', 800, 'center');
  y += 150; txt('احتفظ بهذا التقرير، وقارنه بتقريرك القادم لترى كم تقدّمت 📈', W / 2, y, 26, '#163E66', 800, 'center');
  txt('إعداد: أ. رامي الرزقي', 70, y + 60, 22, '#56627A', 700, 'left');
  txt('قرية الخير · رامي ماث', W - 70, y + 60, 22, '#56627A', 700);
  return c;
}

export async function openReport(host) {
  const s = game.state; sfx('talk');
  try { await Promise.race([document.fonts.load(`900 40px Cairo`), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  const c = draw(s), url = c.toDataURL('image/png'), name = `تقرير-${s.hero.name}.png`, m = document.createElement('div'); m.className = 'gCert rpView';
  m.innerHTML = `<div class="gCertIn"><img alt="تقرير تقدّمي" src="${url}"><div class="gBtns"><button class="act go" data-save>💾 احفظ التقرير صورة</button><button class="act ghost" data-back>رجوع</button></div>
    <p class="gCertTip">إن لم تُحفظ الصورة على جهازك: التقط لقطة شاشة لها 📸</p></div>`;
  (host || document.body).appendChild(m);
  m.onclick = e => e.stopPropagation();
  m.querySelector('[data-back]').onclick = () => m.remove();
  m.querySelector('[data-save]').onclick = async () => {
    sfx('good');
    try {   // الهاتف: المشاركة تحفظ الصورة في المعرض؛ وإلا تنزيل عادي
      const blob = await new Promise(r => c.toBlob(r, 'image/png')), file = new File([blob], name, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'تقرير تقدّمي' }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
  };
  return m;
}
