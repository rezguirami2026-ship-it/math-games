// الفيديو التعريفي: يظهر تلقائياً أول مرة تُفتح فيها اللعبة على الجهاز (فوق الشاشة الرئيسية)، ويُعاد من زر «🎬 فيديو تعريفي».
// المتصفحات تمنع التشغيل بالصوت قبل لمسة: نعرض صورة الغلاف وزر تشغيل كبيراً. الفيديو من الشبكة (لا يُخزَّن مع التطبيق).
const SRC = 'assets/video/intro.mp4?v=6', POSTER = 'assets/video/intro-poster.jpg', KEY = 'ramimath_introvid';
export const introSeen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return true; } };
const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} };

export function showIntroVideo({ first = false } = {}) {
  if (document.querySelector('.ivid')) return;
  if (first && (introSeen() || navigator.webdriver)) return;   // مرة واحدة، والاختبار الآلي لا يراه
  const m = document.createElement('div'); m.className = 'ivid';
  m.innerHTML = `<div class="ividIn">
      <div class="ividHead"><b>🎬 تعرّف على قرية الخير</b><button class="ividX" aria-label="إغلاق">✕</button></div>
      <div class="ividBox"><video playsinline preload="metadata" poster="${POSTER}"></video>
        <button class="ividPlay" aria-label="تشغيل"><span>▶</span></button>
        <p class="ividErr" hidden>الفيديو يحتاج اتصالاً بالإنترنت. شاهده لاحقاً من زر «🎬 فيديو تعريفي» 🌐</p></div>
      <div class="ividFoot"><button class="act go ividGo">${first ? '🎮 ابدأ اللعب' : 'رجوع'}</button>${first ? '<button class="act ghost ividSkip">تخطَّ الفيديو</button>' : ''}</div></div>`;
  document.body.appendChild(m);
  const v = m.querySelector('video'), play = m.querySelector('.ividPlay');
  const close = () => { markSeen(); try { v.pause(); } catch (e) {} m.classList.add('out'); setTimeout(() => m.remove(), 250); };
  play.onclick = () => { if (!v.src) v.src = SRC; v.controls = true; play.hidden = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  v.addEventListener('error', () => { if (!v.src) return; m.querySelector('.ividErr').hidden = false; play.hidden = true; v.hidden = true; });
  v.addEventListener('ended', () => { markSeen(); m.querySelector('.ividGo').classList.add('pulse'); });
  m.querySelector('.ividX').onclick = close; m.querySelector('.ividGo').onclick = close;
  const sk = m.querySelector('.ividSkip'); if (sk) sk.onclick = close;
}
