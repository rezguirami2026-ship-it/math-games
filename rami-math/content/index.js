// مدخل محتوى الصف المختار: UNITS وLESSONS وOUTCOMES وCHALLENGES (والصف نفسه GRADE).
// لا يستورده إلا main.js: التحديات تستورد محرك التحدي، فاستيراده من ملفات المحرك يصنع حلقة.
import { GRADE } from './grade.js';
import { CH as C5 } from './g5/challenges.js';
import { CH as C6 } from './g6/challenges.js';
import { CH as C7 } from './g7/challenges.js';
export { GRADE, GRADES, gradeInfo } from './grade.js';
export { UNITS, LESSONS, lessonIndex } from './lessons.js';
export { OUT as OUTCOMES, BY_LESSON, outcomesOf } from './outcomes.js';
export const CHALLENGES = { 5: C5, 6: C6, 7: C7 }[GRADE];
