// خريطة دروس الصف السابع (بالترتيب الرسمي) — بنفس عقد content/g6/lessons.js:
// UNITS: { term, n, title, place, ach, opens }، والدروس عبر L(unitIndex, id, title, mission, mech, giver, ready).
// فارغة حتى تصل قائمة الدروس الرسمية؛ ما دامت فارغة يظهر الصف «قريباً» في شاشة الاختيار.
export const UNITS = [];
export const PUBLISHED = false;   // true حين تكتمل دروس الصف: عندها يظهر في شاشة اختيار الصف للطلاب
const L = (u, id, title, mission, mech, giver, ready) => ({ u, id, title, mission, mech, giver, ready: !!ready });
export const LESSONS = [];
export const lessonIndex = id => LESSONS.findIndex(l => l.id === id);
