// واجهة الخدمات الاختيارية: حول اللعبة، الدعم الفني، ونوافذ التحديث/التحديث الإجباري/الإعلان/الصيانة.
// النوافذ لا تقاطع اللعب: تنتظر حتى تُغلق اللوحات والتحديات، وكل إعلان يظهر مرة واحدة فقط.
import { APP_VERSION, cmpVer } from '../core/version.js';
import { env, uid, config, onConfig, seen, ticket, myTickets, TICKET_TYPES } from '../core/ops.js';
import { game } from '../core/state.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const OS_AR = { Android: 'أندرويد', iOS: 'iOS', Windows: 'ويندوز', macOS: 'ماك', Linux: 'لينكس', ChromeOS: 'كروم', Other: 'آخر' };
const DEV_AR = { phone: 'هاتف', tablet: 'تابلت', desktop: 'حاسوب' };
const panel = () => document.getElementById('panel');
function sheet(html) { const el = panel(); el.innerHTML = `<div class="sheet opsSheet">${html}<button class="act" data-close>رجوع إلى العالم</button></div>`; el.classList.add('on'); return el; }

export function openAbout() {
  const c = config();
  sheet(`<h3>ℹ️ حول اللعبة</h3>
    <div class="bagrow"><span>🎮 الإصدار</span><b>v${APP_VERSION} · نسخة ${window.__BUILD || ''}</b></div>
    <div class="bagrow"><span>📱 الجهاز</span><b>${DEV_AR[env.dev]} · ${OS_AR[env.os]}</b></div>
    <div class="bagrow"><span>🔄 أحدث إصدار</span><b dir="ltr">${c && c.latest ? 'v' + esc(c.latest.v) : '—'}</b></div>
    <div class="bagrow"><span>🆔 رقم التثبيت</span><b dir="ltr">${uid()}</b></div>
    <p class="muted opsNote">🔒 اللعبة تعمل بلا إنترنت. نرسل إحصاءات مجهولة قليلة فقط (رقم تثبيت عشوائي، الإصدار، نوع الجهاز) مرة كل فترة لتحسين اللعبة، بلا اسم ولا بريد ولا موقع.</p>
    <p class="muted">إعداد أ. رامي الرزقي — قرية الخير، مغامرة رامي ماث</p>`);
}

export function openSupport(type) {
  if (!type) {
    const mine = myTickets();
    sheet(`<h3>🛟 الدعم الفني</h3><p class="muted">اختر نوع رسالتك:</p>
      <div class="opsTypes">${Object.entries(TICKET_TYPES).map(([k, v]) => `<button class="act ghost" data-tt="${k}">${v}</button>`).join('')}</div>
      ${mine.length ? `<p class="muted">رسائلك السابقة:</p>${mine.map(t => `<div class="bagrow"><span>${TICKET_TYPES[t.type] || ''}</span><b dir="ltr">${t.id}</b></div>`).join('')}` : ''}`);
    panel().querySelectorAll('[data-tt]').forEach(b => b.onclick = e => { e.stopPropagation(); openSupport(b.dataset.tt); });
    return;
  }
  sheet(`<h3>${TICKET_TYPES[type]}</h3>
    <p class="muted">اكتب ما حدث باختصار. لا تكتب اسمك أو رقم هاتفك.</p>
    <textarea id="tkDesc" class="codebox opsDesc" maxlength="500" placeholder="مثال: في درس الكسور لم يتحرك الزر…"></textarea>
    <button class="act go" id="tkSend">📨 إرسال</button><p class="muted" id="tkMsg"></p>`);
  const d = document.getElementById('tkDesc'); d.onclick = e => e.stopPropagation(); d.onpointerdown = e => e.stopPropagation(); d.onkeydown = e => e.stopPropagation();
  document.getElementById('tkSend').onclick = e => {
    e.stopPropagation(); const txt = d.value.trim();
    if (txt.length < 3) { document.getElementById('tkMsg').textContent = 'اكتب وصفاً قصيراً أولاً.'; return; }
    const id = ticket(type, txt);
    sheet(id ? `<h3>✅ وصلتنا رسالتك</h3><div class="bagrow"><span>رقم التذكرة</span><b dir="ltr">${id}</b></div>
      <p class="muted">${navigator.onLine ? 'تُرسل الآن في الخلفية.' : 'لا يوجد إنترنت الآن: ستُرسل وحدها عند عودة الاتصال.'} شكراً لمساعدتك في تحسين اللعبة!</p>`
      : `<h3>⏳ لحظة</h3><p class="muted">لديك رسائل كثيرة تنتظر الإرسال. ستُرسل حين يعود الإنترنت، ثم تستطيع الكتابة من جديد.</p>`);
  };
}

/* ── نوافذ الإعدادات القادمة من الخادم ── */
function modal(html, cls) {
  let m = document.getElementById('opsModal'); if (!m) { m = document.createElement('div'); m.id = 'opsModal'; document.body.appendChild(m); }
  m.className = 'opsModal on ' + (cls || ''); m.innerHTML = `<div class="opsCard">${html}</div>`; return m;
}
const closeModal = () => { const m = document.getElementById('opsModal'); if (m) m.className = 'opsModal'; queue(last); };   // بعد الإغلاق: النافذة التالية إن وُجدت (كل واحدة تظهر مرة)
async function updateNow(btn) {
  if (btn) { btn.disabled = true; btn.textContent = '⏳ جارٍ التحديث…'; }
  try { const r = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (r) await r.update(); } catch (e) {}
  location.reload();
}
const notes = l => l && l.notes && l.notes.length ? `<ul class="opsNotes">${l.notes.slice(0, 6).map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
const free = () => !game.busy && !panel().classList.contains('on') && !document.querySelector('#dialog.on') && !document.querySelector('.screen.on');

function show(c) {
  if (c.min && cmpVer(APP_VERSION, c.min) < 0) {   // تحديث إجباري: الإصدار أقدم من الحد الأدنى المدعوم
    const m = modal(`<div class="opsIcon">⚠️</div><h3>يجب تحديث اللعبة للمتابعة</h3><p>إصدارك <b dir="ltr">v${APP_VERSION}</b> قديم، وأقل إصدار مدعوم <b dir="ltr">v${esc(c.min)}</b>.</p>${notes(c.latest)}<button class="act big go" id="opsUp">🔄 تحديث الآن</button>`, 'must');
    m.querySelector('#opsUp').onclick = e => updateNow(e.target); return true;
  }
  if (c.latest && cmpVer(APP_VERSION, c.latest.v) < 0 && !(seen('up:' + c.latest.v) > Date.now() - 24 * 3600e3)) {
    seen('up:' + c.latest.v, 1);
    const m = modal(`<div class="opsIcon">🎉</div><h3>تحديث جديد متوفر</h3><p>الإصدار: <b dir="ltr">v${esc(c.latest.v)}</b></p>${notes(c.latest)}<button class="act big go" id="opsUp">🔄 تحديث الآن</button><button class="act ghost" id="opsLater">لاحقاً</button>`);
    m.querySelector('#opsUp').onclick = e => updateNow(e.target); m.querySelector('#opsLater').onclick = closeModal; return true;
  }
  if (c.ann && c.ann.on && c.ann.id && !seen('ann:' + c.ann.id)) {
    seen('ann:' + c.ann.id, 1);
    const m = modal(`<div class="opsIcon">${esc(c.ann.icon || '📢')}</div><h3>${esc(c.ann.title)}</h3><p>${esc(c.ann.body)}</p><button class="act big go" id="opsOk">حسناً 👍</button>`);
    m.querySelector('#opsOk').onclick = closeModal; return true;
  }
  if (c.maint && c.maint.on && !sessionStorage.getItem('ops_maint')) {
    try { sessionStorage.setItem('ops_maint', 1); } catch (e) {}
    const m = modal(`<div class="opsIcon">🔧</div><h3>${esc(c.maint.title || 'اللعبة تحت الصيانة')}</h3><p>${esc(c.maint.msg || 'نعمل حالياً على تحسين اللعبة وإضافة تحديثات جديدة.')}</p><p class="muted">تستطيع متابعة اللعب، وتقدّمك محفوظ على جهازك.</p><button class="act big go" id="opsOk">متابعة اللعب ▶</button>`);
    m.querySelector('#opsOk').onclick = closeModal; return true;
  }
  return false;
}
let pending = null, timer = 0, last = null;
function queue(c) { pending = c; if (!c || timer) return; timer = setInterval(() => {   // ننتظر لحظة فراغ (لا تحدٍّ ولا لوحة مفتوحة)
  if (!pending) { clearInterval(timer); timer = 0; return; }
  const must = pending.min && cmpVer(APP_VERSION, pending.min) < 0;
  if (must || free()) { const c2 = pending; pending = null; show(c2); }
}, 2500); }
export function initOpsUI() { onConfig(c => { last = c; queue(c); }); }
