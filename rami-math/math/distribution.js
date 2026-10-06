// القسمة بوصفها توزيعاً متساوياً — منطق رياضي صِرف لا يعرف شيئاً عن الرسم
export function inspectLoads(loads, total) {
  const sum = loads.reduce((a, b) => a + b, 0), share = total / loads.length;
  return {
    sum, share,
    allLoaded: sum === total,
    equal: loads.every(n => n === share),
    heavy: loads.map((n, i) => (n > share ? i : -1)).filter(i => i >= 0),
    light: loads.map((n, i) => (n < share ? i : -1)).filter(i => i >= 0)
  };
}

// القسمة مع الباقي: الشاحنات متساوية، والعربة الصغيرة تأخذ الباقي (أصغر من عدد الشاحنات)
export function inspectRemainder(loads, van, total) {
  const n = loads.length, share = Math.floor(total / n), rem = total % n, sum = loads.reduce((a, b) => a + b, 0) + van;
  return { share, rem, allLoaded: sum === total, equal: loads.every(x => x === loads[0]), trucksOk: loads.every(x => x === share), vanOk: van === rem,
    vanTooMuch: van >= n, heavy: loads.map((x, i) => (x > share ? i : -1)).filter(i => i >= 0), light: loads.map((x, i) => (x < share ? i : -1)).filter(i => i >= 0) };
}
