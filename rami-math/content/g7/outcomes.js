// مخرجات التعلّم الرسمية للصف السابع — بنفس عقد content/g6/outcomes.js:
// OUT: نص كل مخرج برمزه. BY_LESSON: مخرجات كل درس.
export const OUT = {};
export const BY_LESSON = {};
export const outcomesOf = id => (BY_LESSON[id] || []).map(c => ({ code: c, text: OUT[c] }));
