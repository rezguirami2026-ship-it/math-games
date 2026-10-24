// دروس الصف المختار (content/grade.js). المحتوى نفسه في content/g5|g6|g7/lessons.js.
// يبقى هذا المسار لأن ملفات كثيرة تستورده؛ والمدخل الكامل (مع المخرجات والتحديات) هو content/index.js.
import { GRADE } from './grade.js';
import * as g5 from './g5/lessons.js';
import * as g6 from './g6/lessons.js';
import * as g7 from './g7/lessons.js';
import * as g8 from './g8/lessons.js';
import * as g9 from './g9/lessons.js';
const G = { 5: g5, 6: g6, 7: g7, 8: g8, 9: g9 }[GRADE];
export const UNITS = G.UNITS, LESSONS = G.LESSONS, lessonIndex = G.lessonIndex;
export const SKILL_IDS = G.SKILL_IDS || null;   // مجالات خريطة الإتقان لصف غير السادس (السادس في ui/mastery.js)
