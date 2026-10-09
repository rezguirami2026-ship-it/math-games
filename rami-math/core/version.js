// رقم إصدار اللعبة (يُعرض في الحقيبة ← حول اللعبة، ويُرسل مع الإحصاءات). غيّره عند كل نشر يستحق إشعار التحديث:
// إصلاح صغير ← v1.0.1، إضافة محتوى ← v1.1.0، تغيير كبير ← v2.0.0
export const APP_VERSION = '1.12.1';
// عنوان خادم الخدمات الاختيارية (Cloudflare Worker). فارغ = الخدمات Online متوقفة واللعبة تعمل كما هي تماماً
export const OPS_URL = 'https://qaryat-alkhair-ops.rezgui-rami2026.workers.dev';
/* مقارنة إصدارين: -١ إن كان a أقدم، ٠ متساويان، ١ أحدث */
export function cmpVer(a, b) {
  const p = v => String(v || '0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const x = p(a), y = p(b);
  for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0) ? -1 : 1; }
  return 0;
}
