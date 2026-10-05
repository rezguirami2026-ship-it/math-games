// القصة: الفصل الأول «قافلة المزرعة». الكلام من داخل العالم، لا عبارات مدرسية.
import { ar } from '../core/util.js';
export const CHAPTER = { n: 1, title: 'قافلة المزرعة' };
export const introLines = name => [
  { who: 'narrator', text: `وصلتَ إلى قرية الخير يا ${name}. المزرعة عطشى، والفلج جافّ منذ أيام.` },
  { who: 'narrator', text: 'شاحنات القرية تنتظر في الساحة، والعم سالم يبحث عمّن يساعده.' }
];
export function npcLines(id, st, name) {
  const m = st.missions.convoy, done = !!st.world.delivered;
  if (id === 'salem') {
    if (m.status === 'new') return [
      { who: 'salem', text: `أهلاً يا ${name}! جئتَ في وقتك.` },
      { who: 'salem', text: `في المستودع ${ar(24)} صندوقاً من البذور وأدوات الري، ولدينا ${ar(6)} شاحنات.` },
      { who: 'salem', text: 'طريق المزرعة وعر، فلن تنطلق القافلة إلا إذا حملت كل شاحنة العدد نفسه من الصناديق.' },
      { who: 'salem', text: 'احمل الصناديق من المستودع وضعها في الشاحنات، ثم اضغط إشارة الانطلاق.' }
    ];
    if (!done) return [{ who: 'salem', text: m.pile > 0 || st.carry > 0 ? `ما زال في المستودع ${ar(m.pile)} صناديق.` : 'كل الصناديق في الشاحنات. إذا تساوت الحمولات فاضغط إشارة الانطلاق.' }];
    return [{ who: 'salem', text: 'وصلت القافلة والفلج يجري من جديد. أهل القرية كلهم يتحدثون عنك!' }];
  }
  if (id === 'umkhalid') return done
    ? [{ who: 'umkhalid', text: `رأيت الماء في الفلج؟ بارك الله فيك يا ${name}.` }, { who: 'umkhalid', text: 'ساحة القرية تحتاج ظلاً، ازرع فيها نخلة بنقاط الخير.' }]
    : [{ who: 'umkhalid', text: 'المزرعة عطشى… لو وصلت أدوات الري لعاد الماء إلى الفلج.' }];
  if (id === 'yousef') return done
    ? [{ who: 'yousef', text: 'صارت المزرعة خضراء! سأساعد أبي في السقي.' }]
    : [{ who: 'yousef', text: 'أبي ينتظر البذور في المزرعة، والشاحنات لم تتحرك بعد!' }];
  if (id === 'hamad') return [{ who: 'hamad', text: `جزاك الله خيراً يا ${name}! البذور وصلت، والمحاصيل بدأت تنمو.` }];
  return [];
}
export function objective(st) {
  const m = st.missions.convoy;
  if (m.status === 'new') return '💬 تحدّث مع العم سالم عند الشاحنات';
  if (m.status === 'active') return m.pile || st.carry ? '🚚 وزّع الصناديق على الشاحنات بالتساوي' : '🚦 أطلق القافلة من الإشارة';
  const n = st.world.trees.filter(Boolean).length;
  if (n === 0) return '🌴 ازرع نخلة في ساحة القرية بنقاط الخير';
  if (n < 3) return `🌴 ساحة القرية: ${ar(n)} من ${ar(3)} نخلات`;
  return '✨ الفصل الثاني قريباً: بئر القرية تحتاجك';
}
