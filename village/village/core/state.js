// حالة اللعبة: كل ما يُحفظ عن البطل والعالم والمهام. لا رسم هنا ولا واجهة.
export const VERSION = 1;
export const TRUCKS = 6, BOXES = 27, CARRY_MAX = 6, TREE_COST = 20;   // ٢٧ ÷ ٦ = ٤ والباقي ٣
export function newState(hero) {
  return {
    v: VERSION, created: Date.now(),
    hero,                                        // { name, kind: 'boy'|'girl', skin, color }
    player: { x: 1380, y: 640, dir: 'left' },
    carry: 0,                                    // صناديق بين يدي البطل
    good: 0,                                     // 💚 نقاط الخير
    story: { chapter: 1, introDone: false },
    missions: { convoy: { status: 'new', pile: BOXES, loads: Array(TRUCKS).fill(0), van: 0, attempts: 0 } },
    world: { delivered: 0, trees: [0, 0, 0] },   // delivered: وقت وصول القافلة، trees: وقت زراعة كل نخلة
    achievements: {},
    talked: {}
  };
}
export const fresh = hero => upgrade(newState(hero));
export const game = { state: null, busy: false };
/* ترقية الحفظ القديم بلا فقدان: تُضاف الأنظمة الجديدة لمن لعب الفصل الأول */
export function upgrade(s) {
  s.missions.tanks = s.missions.tanks || { status: 'locked', levels: [0, 0, 0], targets: null, done: [false, false, false], tries: 0 };
  s.missions.shop = s.missions.shop || { status: 'locked', round: 0, tries: 0 };
  s.gear = s.gear || { owned: {}, worn: {} };
  s.inventory = s.inventory || [];
  if (s.missions.convoy.status === 'done') {
    if (s.missions.tanks.status === 'locked') s.missions.tanks.status = 'new';
    if (s.missions.shop.status === 'locked') s.missions.shop.status = 'new';
    s.gear.owned.bag = s.gear.owned.bag || Date.now();
  }
  if (s.world.trees.filter(Boolean).length >= 3) s.gear.owned.gold = s.gear.owned.gold || Date.now();
  // نظام الدروس: ما أُنجز سابقاً يُحتسب لدرسه في الترتيب
  s.quests = s.quests || { done: {}, started: {}, data: {} };
  if (s.missions.convoy.status === 'done') s.quests.done.division1 = s.quests.done.division1 || Date.now();
  if (s.missions.shop.status === 'done') s.quests.done.decimalAdd = s.quests.done.decimalAdd || Date.now();
  if (s.missions.tanks.status === 'done') s.quests.done.decimalFractions = s.quests.done.decimalFractions || Date.now();
  s.missions.convoy.van = s.missions.convoy.van || 0;
  return s;
}
