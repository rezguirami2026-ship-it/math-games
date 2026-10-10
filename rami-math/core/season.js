// أجواء رمضان: تلقائياً في شهر رمضان الهجري، أو بحسب اختيار اللاعب من الحقيبة (تلقائي / تعمل / متوقفة)
const KEY = 'ramimath_ramadan';
let hijriRamadan = false;
try { hijriRamadan = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric' }).format(new Date()) === '9'; } catch (e) {}
export function ramadanPref() { try { return localStorage.getItem(KEY) || 'auto'; } catch (e) { return 'auto'; } }
export function setRamadanPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
export function ramadanOn() { const p = ramadanPref(); return p === 'on' || (p === 'auto' && hijriRamadan); }
export const PREF_LABEL = { auto: 'تلقائي', on: 'تعمل', off: 'متوقفة' };
/* المواسم بالتاريخ: عيد الفطر (١–٤ شوال)، عيد الأضحى (٩–١٣ ذي الحجة)، اليوم الوطني العُماني (١٧–٢٣ نوفمبر).
   للتجربة: ?season=eid|adha|national|none */
export function seasonNow(d = new Date()) {
  try { const q = new URLSearchParams(location.search).get('season'); if (q) return ['eid', 'adha', 'national'].includes(q) ? q : null; } catch (e) {}
  try {
    const P = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric', day: 'numeric' }).formatToParts(d), m = +P.find(p => p.type === 'month').value, day = +P.find(p => p.type === 'day').value;
    if (m === 10 && day <= 4) return 'eid';
    if (m === 12 && day >= 9 && day <= 13) return 'adha';
  } catch (e) {}
  const M = d.getMonth() + 1, D = d.getDate();
  return M === 11 && D >= 17 && D <= 23 ? 'national' : null;
}
export const SEASONS = {
  eid: { icon: '🎉', name: 'عيد الفطر', greet: 'عيد مبارك! 🎉', banner: 'عيدكم مبارك 🎉', cols: ['#E2475C', '#FFC23D', '#3FA3F5', '#2E9E5B', '#8E6CF6'] },
  adha: { icon: '🐑', name: 'عيد الأضحى', greet: 'عيد أضحى مبارك! 🐑', banner: 'عيد أضحى مبارك 🐑', cols: ['#2E9E5B', '#FFC23D', '#E2475C', '#3FA3F5', '#F08A24'] },
  national: { icon: '🎆', name: 'اليوم الوطني', greet: 'كل عام وعُمان بخير! 🎆', banner: 'اليوم الوطني المجيد', cols: ['#D52B1E', '#FFFFFF', '#14853A'] }
};
