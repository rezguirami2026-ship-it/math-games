// قاعدة المعلم «أعداد جديدة لكل جولة»: إن تكرر عدد (ثلاثة رموز فأكثر) في سؤالين من التحدي نفسه يُعاد توليد التحدي
// (٢٥ محاولة على الأكثر، فلا حلقة بلا حد). الثوابت الشائعة مثل ١٠٠ و٠٫١ مستثناة كما في tests/fuzz-ch.mjs.
const SKIP = new Set(['١٠٠', '١٠٠٠', '٠٫١', '٠٫٠١', '٣٫١٤']);
const nums = s => (String(s || '').replace(/<[^>]+>/g, ' ').match(/[٠-٩]+(?:٫[٠-٩]+)?/g) || []);
function dup(items) {
  const seen = new Map();
  return items.some((it, k) => nums(it.q).filter(x => x.length >= 3 && !SKIP.has(x)).some(x => { if (seen.has(x) && seen.get(x) !== k) return true; seen.set(x, k); return false; }));
}
export function distinct(CH) {
  for (const c of Object.values(CH)) { const g = c.make.bind(c); c.make = () => { let it; for (let t = 0; t < 25; t++) { it = g(); if (!dup(it)) break; } return it; }; }
  return CH;
}
