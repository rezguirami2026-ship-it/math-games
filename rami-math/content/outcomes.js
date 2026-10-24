// مخرجات الصف المختار (content/grade.js). المحتوى نفسه في content/g5|g6|g7/outcomes.js.
// منفصل عن التحديات عمداً: محرك التحدي يستورده، والتحديات تستورد المحرك (فلا حلقة استيراد).
import { GRADE } from './grade.js';
import * as g5 from './g5/outcomes.js';
import * as g6 from './g6/outcomes.js';
import * as g7 from './g7/outcomes.js';
import * as g8 from './g8/outcomes.js';
import * as g9 from './g9/outcomes.js';
const G = { 5: g5, 6: g6, 7: g7, 8: g8, 9: g9 }[GRADE];
export const OUT = G.OUT, BY_LESSON = G.BY_LESSON, outcomesOf = G.outcomesOf;
