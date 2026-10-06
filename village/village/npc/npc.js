// أهل القرية: يتجولون، يلتفتون إلى البطل، ويطلبون المساعدة
import { drawHuman } from '../character/human.js';
export function makeNpcs() {
  return [
    { id: 'salem', name: 'العم سالم', role: 'سائق القافلة', kind: 'man', robe: '#F4F1E8', accent: '#2F6FB2', skin: '#C98E5F', beard: '#6B6B6B', x: 440, y: 880, home: { x: 440, y: 885, r: 70 } },
    { id: 'umkhalid', name: 'أم خالد', role: 'من أهل القرية', kind: 'woman', robe: '#3E7C6B', accent: '#7B3F98', skin: '#D9A374', x: 1030, y: 520, home: { x: 1020, y: 525, r: 60 } },
    { id: 'yousef', name: 'يوسف', role: 'ابن المزارع', kind: 'boy', robe: '#F7F5EF', accent: '#C0392B', skin: '#B97F52', x: 520, y: 990, home: { x: 520, y: 995, r: 70 } },
    { id: 'naser', name: 'العم ناصر', role: 'صاحب الدكان', kind: 'man', robe: '#EFE6D2', accent: '#2E8B57', skin: '#C98E5F', beard: '#4A4A4A', x: 210, y: 1000, home: { x: 210, y: 996, r: 14 } },
    { id: 'hamad', name: 'العم حمد', role: 'المزارع', kind: 'man', robe: '#E9E1CF', accent: '#B5651D', skin: '#B97F52', beard: '#2B2B2B', x: 1160, y: 930, home: { x: 1160, y: 930, r: 140 } },
    { id: 'saeed', name: 'سعيد', role: 'ساعي البريد', kind: 'man', robe: '#DCE6F0', accent: '#C0392B', skin: '#D9A374', x: 640, y: 1310, home: { x: 640, y: 1312, r: 16 } },
    { id: 'mubarak', name: 'مبارك', role: 'النجار', kind: 'man', robe: '#E9DCC3', accent: '#8B5A2B', skin: '#C98E5F', beard: '#5A5A5A', x: 1636, y: 336, home: { x: 1636, y: 338, r: 12 } },
    { id: 'khalid', name: 'المدرب خالد', role: 'مدرب الفريق', kind: 'man', robe: '#DCEFE3', accent: '#2E8B57', skin: '#B97F52', x: 2060, y: 484, home: { x: 2062, y: 486, r: 18 } },
    { id: 'abdullah', name: 'عبدالله', role: 'ناظر المحطة', kind: 'man', robe: '#E1E6EE', accent: '#2F6FB2', skin: '#D9A374', beard: '#3A3A3A', x: 2070, y: 800, home: { x: 2072, y: 802, r: 12 } },
    { id: 'shaikha', name: 'الجدة شيخة', role: 'منظمة المهرجان', kind: 'woman', robe: '#8E3B5E', accent: '#E3B04B', skin: '#C98E5F', x: 2046, y: 1068, home: { x: 2046, y: 1070, r: 16 } },
    { id: 'juma', name: 'جمعة', role: 'الراعي', kind: 'man', robe: '#EFE6D2', accent: '#7B3F98', skin: '#B97F52', beard: '#2B2B2B', x: 1600, y: 1530, home: { x: 1600, y: 1532, r: 16 } },
    { id: 'saif', name: 'القبطان سيف', role: 'قبطان الميناء', kind: 'man', robe: '#F4F1E8', accent: '#1F4E79', skin: '#B97F52', beard: '#5A5A5A', x: 2682, y: 472, home: { x: 2684, y: 474, r: 14 } },
    { id: 'reem', name: 'المهندسة ريم', role: 'ورشة الهياكل', kind: 'woman', robe: '#3E6E8E', accent: '#F4F1E8', skin: '#D9A374', x: 2408, y: 292, home: { x: 2408, y: 294, r: 10 } },
    { id: 'layla', name: 'ليلى', role: 'دكان الهدايا', kind: 'woman', robe: '#B0476A', accent: '#FFC23D', skin: '#C98E5F', x: 2752, y: 292, home: { x: 2752, y: 294, r: 10 } },
    { id: 'ali', name: 'علي', role: 'بنّاء المرسى', kind: 'man', robe: '#E3D8C2', accent: '#8B5A2B', skin: '#B97F52', x: 2612, y: 916, home: { x: 2612, y: 918, r: 12 } },
    { id: 'badr', name: 'بدر', role: 'الصياد', kind: 'man', robe: '#DCE6F0', accent: '#2F6FB2', skin: '#8B5A38', x: 2858, y: 1164, home: { x: 2858, y: 1166, r: 10 } },
    { id: 'hind', name: 'هند', role: 'الرسامة', kind: 'woman', robe: '#2E8B57', accent: '#E85D75', skin: '#DDA779', x: 2382, y: 1218, home: { x: 2382, y: 1220, r: 10 } },
    { id: 'sulaiman', name: 'سليمان', role: 'صاحب الطاحونة', kind: 'man', robe: '#EFE6D2', accent: '#C0392B', skin: '#C98E5F', beard: '#6B6B6B', x: 2762, y: 1232, home: { x: 2762, y: 1234, r: 12 } },
    { id: 'majid', name: 'الجد ماجد', role: 'حارس الخريطة', kind: 'man', robe: '#F4F1E8', accent: '#7B3F98', skin: '#B97F52', beard: '#DDDDDD', x: 2862, y: 1560, home: { x: 2862, y: 1562, r: 12 } },
    { id: 'hamdan', name: 'حمدان', role: 'حارس الجسر', kind: 'man', robe: '#EFE6D2', accent: '#8B5A2B', skin: '#B97F52', beard: '#4A4A4A', x: 372, y: 1800, home: { x: 372, y: 1802, r: 10 } },
    { id: 'muna', name: 'منى', role: 'أمينة المتحف', kind: 'woman', robe: '#5E4A8E', accent: '#E3B04B', skin: '#D9A374', x: 330, y: 2112, home: { x: 330, y: 2114, r: 10 } },
    { id: 'zaid', name: 'زيد', role: 'الصائغ', kind: 'man', robe: '#F4F1E8', accent: '#C9971C', skin: '#C98E5F', beard: '#4A4A4A', x: 596, y: 2112, home: { x: 596, y: 2114, r: 10 } },
    { id: 'aisha', name: 'عائشة', role: 'الحلوانية', kind: 'woman', robe: '#B0476A', accent: '#F4F1E8', skin: '#C98E5F', x: 966, y: 2112, home: { x: 966, y: 2114, r: 10 } },
    { id: 'fahad', name: 'فهد', role: 'قائد الرحلة', kind: 'man', robe: '#DCEFE3', accent: '#2E8B57', skin: '#B97F52', x: 1172, y: 2122, home: { x: 1172, y: 2124, r: 10 } },
    { id: 'harith', name: 'الحارث', role: 'حارس البئر', kind: 'man', robe: '#E3D8C2', accent: '#5E6B78', skin: '#8B5A38', beard: '#4A4A4A', x: 1492, y: 2132, home: { x: 1492, y: 2134, r: 10 } },
    { id: 'qais', name: 'قيس', role: 'قارع الأجراس', kind: 'man', robe: '#F4F1E8', accent: '#C0392B', skin: '#C98E5F', x: 2540, y: 1882, home: { x: 2540, y: 1884, r: 10 } },
    { id: 'mariam', name: 'مريم', role: 'صاحبة الكشك', kind: 'woman', robe: '#2E6E8E', accent: '#FFC23D', skin: '#DDA779', x: 2682, y: 2122, home: { x: 2682, y: 2124, r: 10 } },
    { id: 'khamis', name: 'خميس', role: 'أمين المخزن', kind: 'man', robe: '#E9DCC3', accent: '#7B3F98', skin: '#B97F52', beard: '#4A4A4A', x: 328, y: 2402, home: { x: 328, y: 2404, r: 10 } },
    { id: 'saleh', name: 'صالح', role: 'تاجر التمر', kind: 'man', robe: '#EFE6D2', accent: '#8B5A2B', skin: '#C98E5F', beard: '#4A4A4A', x: 842, y: 2412, home: { x: 842, y: 2414, r: 10 } },
    { id: 'murad', name: 'مراد', role: 'البنّاء', kind: 'man', robe: '#DCE6F0', accent: '#C0392B', skin: '#B97F52', x: 1112, y: 2412, home: { x: 1112, y: 2414, r: 10 } },
    { id: 'zahra', name: 'زهرة', role: 'صانعة الحلوى', kind: 'woman', robe: '#C0392B', accent: '#F4F1E8', skin: '#D9A374', x: 1422, y: 2412, home: { x: 1422, y: 2414, r: 10 } },
    { id: 'azzan', name: 'عزّان', role: 'حارس البوابة', kind: 'man', robe: '#F4F1E8', accent: '#1F4E79', skin: '#8B5A38', beard: '#4A4A4A', x: 2122, y: 2102, home: { x: 2122, y: 2104, r: 10 } },
    { id: 'safiya', name: 'صفية', role: 'رئيسة المطبخ', kind: 'woman', robe: '#F4F1E8', accent: '#C0392B', skin: '#D9A374', x: 420, y: 2890, home: { x: 420, y: 2892, r: 10 } },
    { id: 'umsaid', name: 'أم سعيد', role: 'صاحبة الوصفات', kind: 'woman', robe: '#7B3F98', accent: '#FFC23D', skin: '#C98E5F', x: 742, y: 2890, home: { x: 742, y: 2892, r: 10 } },
    { id: 'mudhaffar', name: 'مظفّر', role: 'مصلّح الساعات', kind: 'man', robe: '#E3D8C2', accent: '#2F6FB2', skin: '#B97F52', beard: '#4A4A4A', x: 1162, y: 2912, home: { x: 1162, y: 2914, r: 10 } },
    { id: 'nawal', name: 'نوال', role: 'موظفة الاتصالات', kind: 'woman', robe: '#2E6E8E', accent: '#F4F1E8', skin: '#DDA779', x: 1614, y: 2866, home: { x: 1614, y: 2868, r: 10 } },
    { id: 'tariq', name: 'المهندس طارق', role: 'مهندس البناء', kind: 'man', robe: '#DCE6F0', accent: '#1F4E79', skin: '#C98E5F', x: 2282, y: 2952, home: { x: 2282, y: 2954, r: 10 } },
    { id: 'hamid', name: 'حامد', role: 'سائق الحافلة', kind: 'man', robe: '#E1E6EE', accent: '#2F6FB2', skin: '#B97F52', beard: '#4A4A4A', x: 480, y: 3206, home: { x: 480, y: 3208, r: 10 } },
    { id: 'sara', name: 'سارة', role: 'المهندسة الزراعية', kind: 'woman', robe: '#2E8B57', accent: '#F4F1E8', skin: '#D9A374', x: 862, y: 3272, home: { x: 862, y: 3274, r: 10 } },
    { id: 'khalfan', name: 'خلفان', role: 'صاحب النخيل', kind: 'man', robe: '#EFE6D2', accent: '#8B5A2B', skin: '#8B5A38', beard: '#4A4A4A', x: 1222, y: 3272, home: { x: 1222, y: 3274, r: 10 } },
    { id: 'noor', name: 'نور', role: 'منظمة الألعاب', kind: 'woman', robe: '#C0392B', accent: '#FFC23D', skin: '#DDA779', x: 1722, y: 3206, home: { x: 1722, y: 3208, r: 10 } },
    { id: 'yaqoob', name: 'يعقوب', role: 'صاحب كشك الدوّار', kind: 'man', robe: '#F4F1E8', accent: '#E85D75', skin: '#C98E5F', x: 2422, y: 3272, home: { x: 2422, y: 3274, r: 10 } },
    { id: 'jamal', name: 'جمال', role: 'أمين الخزينة', kind: 'man', robe: '#E1E6EE', accent: '#5E6B78', skin: '#B97F52', beard: '#4A4A4A', x: 424, y: 3738, home: { x: 424, y: 3740, r: 8 } },
    { id: 'ruqaya', name: 'رقية', role: 'معلمة التاريخ', kind: 'woman', robe: '#8E3B5E', accent: '#F4F1E8', skin: '#D9A374', x: 704, y: 3738, home: { x: 704, y: 3740, r: 8 } },
    { id: 'saud', name: 'سعود', role: 'صاحب البقالة', kind: 'man', robe: '#EFE6D2', accent: '#2E8B57', skin: '#C98E5F', beard: '#4A4A4A', x: 984, y: 3738, home: { x: 984, y: 3740, r: 8 } },
    { id: 'obaid', name: 'عبيد', role: 'بائع السمك', kind: 'man', robe: '#DCE6F0', accent: '#2F6FB2', skin: '#8B5A38', beard: '#4A4A4A', x: 1264, y: 3738, home: { x: 1264, y: 3740, r: 8 } },
    { id: 'hessa', name: 'حصة', role: 'صاحبة لعبة العشرات', kind: 'woman', robe: '#C98A3A', accent: '#F4F1E8', skin: '#DDA779', x: 1544, y: 3738, home: { x: 1544, y: 3740, r: 8 } },
    { id: 'adil', name: 'عادل', role: 'صاحب الآلة', kind: 'man', robe: '#C9D3DD', accent: '#7B3F98', skin: '#B97F52', x: 1824, y: 3738, home: { x: 1824, y: 3740, r: 8 } },
    { id: 'latifa', name: 'لطيفة', role: 'صانعة الكعك', kind: 'woman', robe: '#E85D75', accent: '#FFC23D', skin: '#C98E5F', x: 424, y: 4098, home: { x: 424, y: 4100, r: 8 } },
    { id: 'ghanim', name: 'غانم', role: 'صاحب محل العيد', kind: 'man', robe: '#F4F1E8', accent: '#C0392B', skin: '#B97F52', beard: '#4A4A4A', x: 704, y: 4098, home: { x: 704, y: 4100, r: 8 } },
    { id: 'shamsa', name: 'شمسة', role: 'صانعة الخلطات', kind: 'woman', robe: '#E3B04B', accent: '#7B3F98', skin: '#D9A374', x: 984, y: 4098, home: { x: 984, y: 4100, r: 8 } },
    { id: 'raya', name: 'ريا', role: 'بائعة الشوكولاتة', kind: 'woman', robe: '#6B4520', accent: '#F4F1E8', skin: '#DDA779', x: 1264, y: 4098, home: { x: 1264, y: 4100, r: 8 } },
    { id: 'humaid', name: 'حميد', role: 'حارس البراميل', kind: 'man', robe: '#EFE6D2', accent: '#1F4E79', skin: '#8B5A38', beard: '#4A4A4A', x: 1544, y: 4098, home: { x: 1544, y: 4100, r: 8 } },
    { id: 'mansour', name: 'منصور', role: 'عامل محطة الوقود', kind: 'man', robe: '#DCE6F0', accent: '#C0392B', skin: '#B97F52', beard: '#4A4A4A', x: 446, y: 4798, home: { x: 446, y: 4800, r: 8 } },
    { id: 'sultan', name: 'سلطان', role: 'دليل القافلة', kind: 'man', robe: '#EFE6D2', accent: '#8B5A2B', skin: '#8B5A38', beard: '#4A4A4A', x: 866, y: 4798, home: { x: 866, y: 4800, r: 8 } },
    { id: 'lubna', name: 'لبنى', role: 'موظفة المطار', kind: 'woman', robe: '#2F6FB2', accent: '#F4F1E8', skin: '#DDA779', x: 1306, y: 4798, home: { x: 1306, y: 4800, r: 8 } },
    { id: 'faisal', name: 'فيصل', role: 'حارس جدار القرن', kind: 'man', robe: '#F4F1E8', accent: '#7B3F98', skin: '#C98E5F', beard: '#4A4A4A', x: 1746, y: 4798, home: { x: 1746, y: 4800, r: 8 } },
    { id: 'wafa', name: 'وفاء', role: 'البستانية', kind: 'woman', robe: '#2E8B57', accent: '#FFC23D', skin: '#D9A374', x: 2186, y: 4798, home: { x: 2186, y: 4800, r: 8 } },
    { id: 'buthaina', name: 'بثينة', role: 'حارسة الواحة', kind: 'woman', robe: '#1F4E79', accent: '#1FC8B5', skin: '#C98E5F', x: 1306, y: 5238, home: { x: 1306, y: 5240, r: 8 } },
    { id: 'hamood', name: 'حمود', role: 'معلم البلاط', kind: 'man', robe: '#E1E6EE', accent: '#2F6FB2', skin: '#B97F52', beard: '#4A4A4A', x: 466, y: 5798, home: { x: 466, y: 5800, r: 8 } },
    { id: 'amna', name: 'آمنة', role: 'خياطة العلم', kind: 'woman', robe: '#C0392B', accent: '#F4F1E8', skin: '#DDA779', x: 886, y: 5798, home: { x: 886, y: 5800, r: 8 } },
    { id: 'mohsen', name: 'محسن', role: 'نجار الأبواب', kind: 'man', robe: '#EFE6D2', accent: '#E3B04B', skin: '#C98E5F', beard: '#4A4A4A', x: 1306, y: 5798, home: { x: 1306, y: 5800, r: 8 } },
    { id: 'zainab', name: 'زينب', role: 'تاجرة التمور', kind: 'woman', robe: '#8B5A2B', accent: '#FFC23D', skin: '#D9A374', x: 1726, y: 5798, home: { x: 1726, y: 5800, r: 8 } },
    { id: 'jaber', name: 'جابر', role: 'صانع الكريستال', kind: 'man', robe: '#F4F1E8', accent: '#7B3F98', skin: '#8B5A38', beard: '#4A4A4A', x: 2146, y: 5798, home: { x: 2146, y: 5800, r: 8 } },
    { id: 'rashed', name: 'راشد', role: 'صاحب الورشة', kind: 'man', robe: '#C9D3DD', accent: '#5E6B78', skin: '#B97F52', beard: '#3A3A3A', x: 1290, y: 1320, home: { x: 1290, y: 1322, r: 16 } }
  ].map(n => Object.assign({ dir: 'down', phase: 0, moving: false, target: null, wait: Math.random() * 2, gest: 2 + Math.random() * 5 }, variety(n), LOOKS[n.id] || {}, n));
}
/* تنوّع الأجسام: كل شخص بعرض وطول مختلفين قليلاً (ثابتين له)، وكبار السن ينحنون ويتكئون على عصا */
function variety(n) {
  let k = 0; for (const ch of n.id) k = (k * 31 + ch.charCodeAt(0)) % 997;
  const old = n.beard === '#DDDDDD' || n.beard === '#6B6B6B';
  return { build: .92 + (k % 7) * .035, tall: .95 + (k % 5) * .028, elder: n.beard === '#DDDDDD', tool: n.beard === '#DDDDDD' ? 'cane' : undefined, speed: old ? 30 : 36 + (k % 4) * 4 };
}
/* أزياء أهل القلب: كل مهنة بما يميّزها، وحركتها المعتادة حين تقف */
const LOOKS = {
  salem: { vest: '#F28C28', build: 1.12, gestureAnim: 'interact' },                    // السائق: سترة عاكسة
  umkhalid: { build: 1.1, tall: .96, gestureAnim: 'talk' },
  yousef: { hat: 'cap', gear: { bag: true }, tall: .94, gestureAnim: 'wave' },           // ابن المزارع: قبعة وحقيبة مدرسية
  naser: { apron: '#3F6E5A', glasses: true, build: 1.2, tall: .97, gestureAnim: 'place' }, // صاحب الدكان: مريلة ونظارة
  hamad: { hat: 'straw', tool: 'hoe', tall: 1.06, build: .92, gestureAnim: 'pickup' },  // المزارع: قبعة خوص ومعول
  saeed: { hat: 'cap', accent: '#C0392B', postbag: true, gestureAnim: 'interact' },     // ساعي البريد: قبعة وحقيبة بريد
  rashed: { apron: '#4A4F56', glasses: true, build: 1.08, gestureAnim: 'place' },          // صاحب الورشة: مريلة جلدية
  // السوق الأسبوعي
  mubarak: { apron: '#8B5A2B', build: 1.1, gestureAnim: 'place' },                          // النجار: مريلة خشب
  khalid: { hat: 'cap', accent: '#2E8B57', tall: 1.04, build: .95, gestureAnim: 'wave' },  // المدرب: قبعة رياضية
  abdullah: { vest: '#2F6B73', hat: 'cap', accent: '#2A3F5F', gestureAnim: 'interact' },  // ناظر المحطة: سترة وقبعة
  shaikha: { elder: true, tool: 'cane', tall: .94, gestureAnim: 'talk' },                  // الجدة شيخة: عصا
  juma: { hat: 'straw', tool: 'cane', build: .95, gestureAnim: 'interact' },                // الراعي: قبعة خوص وعصا رعي
  // الميناء
  saif: { hat: 'cap', accent: '#1F4E79', build: 1.12, tall: 1.04, gestureAnim: 'wave' },   // القبطان
  reem: { glasses: true, vest: '#F28C28', gestureAnim: 'interact' },                       // المهندسة: سترة عمل ونظارة
  layla: { apron: '#E85D75', gestureAnim: 'place' },                                       // صاحبة دكان الهدايا
  ali: { vest: '#F2C230', build: 1.1, gestureAnim: 'pickup' },                             // البنّاء
  badr: { hat: 'straw', build: 1.05, gestureAnim: 'pickup' },                              // الصياد
  hind: { apron: '#7FB2C8', gestureAnim: 'interact' },                                     // الرسامة
  sulaiman: { apron: '#C9B48E', build: 1.08, gestureAnim: 'place' }                        // صاحب الطاحونة
};
const GEST_T = { pickup: 1.5, place: 1, interact: .8, talk: 1.6, wave: 1.1 };
const play = (n, name, dur) => { n.anim = { name, t: 0, dur: dur || GEST_T[name] || 1 }; };
export const npcVisible = (n, st) => !n.needs || !!st.world[n.needs];
export function updateNpc(n, dt, player, blocked) {
  if (n.anim && (n.anim.t += dt / n.anim.dur) >= 1) n.anim = null;
  const near = Math.hypot(player.x - n.x, player.y - n.y) < 85;
  if (near || n.talking) {
    n.moving = false; n.target = null;
    const dx = player.x - n.x, dy = player.y - n.y; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    if (n.talking) { if (!n.anim) play(n, 'talk'); }               // يتكلم بيديه طوال الحوار
    else if (!n.wasNear) play(n, 'wave');                           // يلوّح حين يقترب البطل
    n.wasNear = true;
    return;
  }
  n.wasNear = false;
  if (!n.target) {
    n.moving = false; n.wait -= dt; n.gest -= dt;
    if (n.gest <= 0 && !n.anim) {   // حركة معتادة: حركة المهنة، أو التفات حوله
      n.gest = 4 + Math.random() * 6;
      if (Math.random() < .55) play(n, n.gestureAnim || 'interact'); else n.dir = ['down', 'left', 'right', 'down'][Math.floor(Math.random() * 4)];
    }
    if (n.wait <= 0) { const a = Math.random() * 6.28, r = Math.random() * n.home.r; n.target = { x: n.home.x + Math.cos(a) * r, y: n.home.y + Math.sin(a) * r * .6 }; }
    return;
  }
  const dx = n.target.x - n.x, dy = n.target.y - n.y, d = Math.hypot(dx, dy);
  if (d < 3) { n.target = null; n.wait = 1.5 + Math.random() * 3; n.moving = false; return; }
  const st = (n.speed || 42) * dt, nx = n.x + dx / d * st, ny = n.y + dy / d * st;
  if (blocked(nx, ny)) { n.target = null; n.wait = 1; return; }
  n.x = nx; n.y = ny; n.moving = true; n.phase += st * .17;
  n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
export const drawNpc = (ctx, n, mark) => drawHuman(ctx, Object.assign({}, n, { mark, anim: n.anim && !n.moving ? n.anim.name : undefined, animT: n.anim ? n.anim.t : 0 }));
