// حالة اللعبة: كل ما يُحفظ عن البطل والعالم والمهام. لا رسم هنا ولا واجهة.
export const VERSION = 1;
export const TRUCKS = 6, BOXES = 24, CARRY_MAX = 6, TREE_COST = 20;
export function newState(hero) {
  return {
    v: VERSION, created: Date.now(),
    hero,                                        // { name, kind: 'boy'|'girl', skin, color }
    player: { x: 1380, y: 640, dir: 'left' },
    carry: 0,                                    // صناديق بين يدي البطل
    good: 0,                                     // 💚 نقاط الخير
    story: { chapter: 1, introDone: false },
    missions: { convoy: { status: 'new', pile: BOXES, loads: Array(TRUCKS).fill(0), attempts: 0 } },
    world: { delivered: 0, trees: [0, 0, 0] },   // delivered: وقت وصول القافلة، trees: وقت زراعة كل نخلة
    achievements: {},
    talked: {}
  };
}
export const game = { state: null, busy: false };
