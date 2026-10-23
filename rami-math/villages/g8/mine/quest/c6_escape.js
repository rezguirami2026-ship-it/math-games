// الفصل ٦ «الهروب»: النفق ينهار، والبطل والعمّ سالم يهربان بالعربة على السكك الثلاث (ride.js) حتى فم المنجم.
export default async function (api) {
  api.say('النفق ينهار! اركب العربة مع العمّ سالم: بدّل السكة لتتفادى الصخور، واقفز فوق السكة المكسورة.', 6000);
  await api.wait(1800);
  const m = await import('../ride.js');
  await new Promise(res => m.playRide({ story: true, onDone: res }));
  api.step(0); api.step(1); api.step(2);
}
