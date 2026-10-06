// القصة: الفصل الأول «قافلة المزرعة». الكلام من داخل العالم، لا عبارات مدرسية.
import { ar } from '../core/util.js';
export const CHAPTER = { n: 1, title: 'الأعداد' };
export const CHAPTER2 = { n: 2, title: 'ماء القرية وسوقها' };
export const introLines = name => [
  { who: 'narrator', text: `وصلتَ إلى قرية الخير يا ${name}. المزرعة عطشى، والفلج جافّ منذ أيام.` },
  { who: 'narrator', text: 'كل مشكلة في القرية تحتاج إلى الرياضيات لتُحل، وأول من يحتاجك العم سالم عند المستودع.' }
];
export function npcLines(id, st, name) {
  const m = st.missions.convoy, done = !!st.world.delivered;
  if (id === 'salem') {
    if (m.status === 'new') return [{ who: 'salem', text: 'الشاحنات تنتظر يوم انطلاقها إلى المزرعة.' }];
    if (false) return [
      { who: 'salem', text: `أهلاً يا ${name}! جئتَ في وقتك.` },
      { who: 'salem', text: `في المستودع ${ar(27)} صندوقاً من البذور وأدوات الري، ولدينا ${ar(6)} شاحنات وعربة صغيرة.` },
      { who: 'salem', text: 'كل شاحنة يجب أن تحمل العدد نفسه، وما يتبقى بعد التوزيع يذهب في العربة الصغيرة.' },
      { who: 'salem', text: 'احمل الصناديق من المستودع إلى الشاحنات والعربة، ثم اضغط إشارة الانطلاق.' }
    ];
    if (!done) return [{ who: 'salem', text: m.pile > 0 || st.carry > 0 ? `ما زال في المستودع ${ar(m.pile)} صناديق.` : 'كل الصناديق في الشاحنات. إذا تساوت الحمولات فاضغط إشارة الانطلاق.' }];
    return [{ who: 'salem', text: 'وصلت القافلة والفلج يجري من جديد. أهل القرية كلهم يتحدثون عنك!' }];
  }
  const T = st.missions.tanks || {}, S = st.missions.shop || {};
  if (false) return [
    { who: 'umkhalid', text: `الفلج عاد يجري يا ${name}، لكن خزانات البيوت فارغة.` },
    { who: 'umkhalid', text: 'كل بيت يحتاج قدراً مختلفاً، والمكتوب على لوحة كل خزان هو الجزء الذي يجب أن يمتلئ منه.' },
    { who: 'umkhalid', text: 'الخزان مقسّم عشرة أقسام متساوية. اضخ الماء، وحين يصل القدر المطلوب أغلق الصمام.' }
  ];
  if (false) return [{ who: 'umkhalid', text: 'انظر إلى لوحة كل خزان، فهي تخبرك بالقدر الذي يحتاجه البيت.' }];
  if (id === 'naser') {
    if (false) return [
      { who: 'naser', text: `حيّاك الله يا ${name}! أهل القرية يحتاجون أدوات للزراعة بعد عودة الماء.` },
      { who: 'naser', text: 'عندي كل ما يحتاجونه، والأسعار مكتوبة على اللوحة بالريال. ادفع المبلغ بالضبط، فأنا لا أحب الأخطاء في الحساب!' }
    ];
    if (S.status === 'done') return [{ who: 'naser', text: 'دكاني مفتوح دائماً يا تاجرنا الأمين.' }];
    return [{ who: 'naser', text: 'دكاني فيه كل ما يحتاجه أهل القرية.' }];
  }
  if (id === 'yousef' && S.status === 'done') return [{ who: 'yousef', text: 'حديقة المدرسة صارت أجمل مكان في القرية!' }];
  if (id === 'umkhalid') return done
    ? [{ who: 'umkhalid', text: `رأيت الماء في الفلج؟ بارك الله فيك يا ${name}.` }, { who: 'umkhalid', text: 'ساحة القرية تحتاج ظلاً، ازرع فيها نخلة بنقاط الخير.' }]
    : [{ who: 'umkhalid', text: 'المزرعة عطشى… لو وصلت أدوات الري لعاد الماء إلى الفلج.' }];
  if (id === 'yousef') return done
    ? [{ who: 'yousef', text: 'صارت المزرعة خضراء! سأساعد أبي في السقي.' }]
    : [{ who: 'yousef', text: 'أبي ينتظر البذور في المزرعة، والشاحنات لم تتحرك بعد!' }];
  if (id === 'saeed') return [{ who: 'saeed', text: 'البريد يصل إلى كل بيت في القرية، فردياً كان رقمه أو زوجياً.' }];
  if (id === 'rashed') return [{ who: 'rashed', text: 'في ورشتي تتحرك الفاصلة يميناً ويساراً كما تريد.' }];
  if (id === 'hamad' && !done) return [{ who: 'hamad', text: 'المزرعة تنتظر البذور والماء.' }];
  if (id === 'hamad') return [{ who: 'hamad', text: `جزاك الله خيراً يا ${name}! البذور وصلت، والمحاصيل بدأت تنمو.` }];
  return [];
}
export function objective(st) {
  const m = st.missions.convoy;
  if (m.status === 'new') return '💬 تحدّث مع العم سالم عند الشاحنات';
  if (m.status === 'active') return m.pile || st.carry ? '🚚 وزّع الصناديق على الشاحنات بالتساوي' : '🚦 أطلق القافلة من الإشارة';
  const T = st.missions.tanks, S = st.missions.shop;
  if (T.status === 'active') return '💧 املأ كل خزان بالقدر المكتوب على لوحته';
  if (T.status === 'new' && S.status === 'new') return '💬 أم خالد قرب البئر، والعم ناصر في الدكان: من تساعد أولاً؟';
  if (T.status === 'new') return '💬 أم خالد تنتظرك قرب البئر';
  if (S.status === 'new' || S.status === 'active') return '🏪 العم ناصر ينتظرك في الدكان';
  const n = st.world.trees.filter(Boolean).length;
  if (n < 3) return `🌴 ساحة القرية: ${ar(n)} من ${ar(3)} نخلات بنقاط الخير`;
  return '✨ الفصل الثالث قريباً — جرّب أغراضك في خزانة البطل 🚪';
}
