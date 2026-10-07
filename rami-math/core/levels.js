// المستويات: نقاط خبرة تُحسب من الإنجاز نفسه (لا تُخزَّن ولا تنقص أبداً، وتعمل مع الحفظ القديم):
// ١٠ لكل درس منجز + ٥ لكل نجمة (أفضل نجوم الدرس) + ٣ لكل مرة لُعب فيها نشاط الدرس (حتى ٥ مرات لكل درس).
export const LEVELS = [
  { xp: 0, title: 'مستكشف صغير', icon: '🌱' },
  { xp: 40, title: 'مستكشف', icon: '🧭' },
  { xp: 100, title: 'مساعد القرية', icon: '🤝' },
  { xp: 180, title: 'صديق الأهالي', icon: '🏡' },
  { xp: 280, title: 'حارس الطريق', icon: '🛤️' },
  { xp: 400, title: 'بطل السوق', icon: '🏪' },
  { xp: 540, title: 'فارس القلعة', icon: '🏰' },
  { xp: 700, title: 'نجم المهرجان', icon: '🌟' },
  { xp: 880, title: 'أمين القرية', icon: '🗝️' },
  { xp: 1080, title: 'حكيم قرية الخير', icon: '👑' }
];
export function xpOf(s) {
  if (!s || !s.quests) return 0;
  const q = s.quests; let xp = 0;
  Object.keys(q.done || {}).forEach(id => { xp += 10 + 5 * Math.min(3, ((q.data || {})[id] || {}).stars || 0); });
  Object.values(s.activities || {}).forEach(a => { xp += 3 * Math.min(5, a.plays || 0); });
  return xp;
}
/* المستوى الحالي: n (يبدأ من ١)، واللقب، والتقدم نحو المستوى التالي */
export function levelOf(s) {
  const xp = xpOf(s); let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i], nx = LEVELS[i + 1];
  return { n: i + 1, xp, title: cur.title, icon: cur.icon, next: nx ? nx.xp : null, nextTitle: nx ? nx.title : null, pct: nx ? Math.round((xp - cur.xp) / (nx.xp - cur.xp) * 100) : 100, left: nx ? nx.xp - xp : 0, max: !nx };
}
