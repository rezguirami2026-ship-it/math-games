// أجواء رمضان: تلقائياً في شهر رمضان الهجري، أو بحسب اختيار اللاعب من الحقيبة (تلقائي / تعمل / متوقفة)
const KEY = 'ramimath_ramadan';
let hijriRamadan = false;
try { hijriRamadan = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric' }).format(new Date()) === '9'; } catch (e) {}
export function ramadanPref() { try { return localStorage.getItem(KEY) || 'auto'; } catch (e) { return 'auto'; } }
export function setRamadanPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
export function ramadanOn() { const p = ramadanPref(); return p === 'on' || (p === 'auto' && hijriRamadan); }
export const PREF_LABEL = { auto: 'تلقائي', on: 'تعمل', off: 'متوقفة' };
