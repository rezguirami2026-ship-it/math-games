// مخرجات الصف التاسع الرسمية — بنفس عقد content/g6/outcomes.js. تُضاف من الخطتين الفصليتين وصفحات الكتاب عند بناء كل وحدة.
export const OUT = {};
export const BY_LESSON = {};
export const outcomesOf = id => (BY_LESSON[id] || []).map(c => ({ code: c, text: OUT[c] }));
