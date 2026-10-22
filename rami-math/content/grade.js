// الصف الدراسي: يُقرأ مرة واحدة عند فتح الصفحة (قبل أي محتوى)، وتغييره يعيد تحميلها.
// الصف المحفوظ على الجهاز في ramimath_grade. الصف يظهر للطلاب حين يُعلَن PUBLISHED في ملف دروسه، وإلا يظهر «قريباً»
// ويرجع إلى السادس؛ و?grade=5 يفتح صفاً له خريطة دروس ولو لم يُنشر بعد (للمعلم أثناء البناء، بحفظ ذلك الصف).
import * as G5 from './g5/lessons.js';
import * as G7 from './g7/lessons.js';
const KEY = 'ramimath_grade';
export const GRADES = [
  { n: 5, name: 'الخامس', ready: G5.PUBLISHED === true, has: G5.LESSONS.length > 0 },
  { n: 6, name: 'السادس', ready: true, has: true },
  { n: 7, name: 'السابع', ready: G7.PUBLISHED === true, has: G7.LESSONS.length > 0 }
];
export const gradeInfo = n => GRADES.find(g => g.n === +n) || null;
const stored = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
const param = (() => { try { return +new URLSearchParams(location.search).get('grade') || 0; } catch (e) { return 0; } })();
const usable = n => { const g = gradeInfo(n); return !!g && (g.ready || (n === param && g.has)); };
export const GRADE = [param, +stored()].find(usable) || 6;
/* هل اختار الطالب صفه على هذا الجهاز؟ (لشاشة الاختيار أول تشغيل) */
export const gradeChosen = () => !!gradeInfo(stored());
export function rememberGrade(n) { try { localStorage.setItem(KEY, String(n)); } catch (e) {} }
/* تغيير الصف: يُحفظ ثم تُعاد الصفحة بلا ?grade حتى يُحمَّل محتوى الصف الجديد كله */
export function chooseGrade(n) {
  const g = gradeInfo(n); if (!g || !g.ready) return false;
  rememberGrade(n);
  if (n === GRADE) return false;
  const u = new URL(location.href); u.searchParams.delete('grade'); location.replace(u.href);
  return true;
}
