// Pinball, Trello #61, the oldest kid tester's idea: tables you pick from,
// each upright like a real cabinet. Two flippers, a plunger, three pop
// bumpers, two slingshots, two banks of three drop targets with a secret hole
// behind each, three top lanes for the bonus multiplier, a ramp, a barn whose
// tunnel runs under the top corner past lost things, a mode hole, a spinner
// and a backbox. Score, three balls, a best score per table per save file.
//
// How it got here, 26 and 27 Nov: the first draft was one plain table in a
// bubble bath, with the card's ramps left for later. Randi asked for
// "something a bit more elaborate" (pinball as she remembers it, "complicated
// with secret holes and spaces and ramps and tracks"), then for The Mighty
// Pepper's ranch, then "into the barn ... under the house deck and past the
// lost shoes and socks", then a second table, Zombies of Tomorrow. Both
// tables play on the one layout; what makes each its own is in its file
// (table-pepper.js, table-zombies.js), added to TABLES below. The rest of the
// card's Later list (multiball, tilt, missions) waits.
//
// The table is drawn 180 x 320 pixels on a small canvas and the backbox
// 180 x 64 on another, scaled up with smoothing off, like Bread. Everything
// is measured in those pixels: the ball's radius is 4 and gravity is in
// pixels a second squared.
//
// Physics: a fixed step of 1/480 s, as many steps a frame as the time that
// passed (capped, so a slow frame doesn't fling the ball). The ball's top
// speed is TUNE.maxSpeed, about 2 pixels a step, under half its radius, so it
// can't pass through a wall or a flipper between two steps. A flipper hit uses
// the flipper's own speed where the ball touches it: a ball caught near the tip
// while the flipper is still swinging goes fastest, one met by a flipper that
// has already stopped only bounces. On the ramp and in the tunnel the ball
// leaves the physics and follows a path. Every number here is ours.
const $ = q => document.querySelector(q);

// ---------- Strings ----------
// Every visible string is here by key (the parent rule for a new product).
// A table's own words (its name, its targets, its mode) are in its file and
// read first; these are the words every table shares.
const STR = {
  title: 'Pinball',
  intro: 'Pick a file, then a table: The Mighty Pepper\'s ranch or Zombies of Tomorrow.',
  pickFile: 'Pick a file',
  pickTable: 'Pick a table',
  fileNew: 'No games yet',
  fileSum: '{table} {best}',
  tableBest: 'Best score: {best}',
  tableNone: 'Not played yet.',
  howH: 'How to play',
  howKeys: 'Flippers: ← and →, or Z and /. Plunger: hold Space or ↓, let go to shoot.',
  howTouch: 'Flippers: tap the left or right side of the screen. Plunger: hold the right side, let go to shoot.',
  howPad: 'Controller: L and R flip, hold A to pull the plunger.',
  howBalls: 'You get 3 balls.',
  play: 'Play {table}',
  again: 'Play again',
  changeTable: 'Change table',
  changeFile: 'Change file',
  allGames: '← All games',
  overH: 'Game over',
  newBest: 'New best score!',
  best: 'Best: {best}',
  statGames: 'Games played: {n}',
  statRamps: 'Ramps: {n}',
  liveBall: 'Ball {n} of 3',
  liveSaved: 'Ball saved',
  liveRamp: 'Ramp, {v} points',
  liveOver: 'Game over. Score {score}.',
  canvas: 'Pinball table: {table}',
  soundOn: '🔊', soundOff: '🔇',
  soundOnL: 'Sound on', soundOffL: 'Sound off',
  // on the score screen (the 3 x 5 pixel font: capitals, numbers, a few marks)
  dBall: 'BALL {n}',
  dReady: 'PULL PLUNGER',
  dRamp: 'RAMP {v}',
  dSaved: 'BALL SAVED',
  dBonus: 'BONUS {b}',
  dBonusX: 'BONUS {b} X{m}',
  dOver: 'GAME OVER',
  dTitle: 'PINBALL',
  dSave: 'SAVE',
};
const t = (k, v = {}) => ((TB && TB.str[k]) ?? STR[k]).replace(/\{(\w+)\}/g, (_, n) => v[n] ?? '');
const fmt = n => Math.round(n).toLocaleString('en-US');

// ---------- Save data ----------
// Decided 26 Nov (Randi): every game with progress has the three save files
// from the start (shared/files.js), the way Bread and Math Force do. A file
// keeps a best score and counts for each table, `{ pepper: {...}, zombies:
// {...} }`; S is the open table's. Sound is one setting per game.
const KEY = 'pinball', SOUND = 'pinball-sound';
const DEF = { best: 0, games: 0, ramps: 0, stash: 0, stashes: 0, secrets: 0, frenzies: 0, ducks: 0, rows: 0, tubs: 0 };
const SND = { on: (() => { try { return localStorage.getItem(SOUND) !== 'off'; } catch (e) { return true; } })() };
let FILE = {}, S = { ...DEF };
let me = null, meName = null;   // the open file's number and its name and buddy
function useFile(n, m) {
  me = n; meName = m;
  const data = SaveFiles.load(KEY, n) || {};
  // a file saved before there were two tables (27 Nov, never released) kept
  // the Pepper table's numbers at the top
  FILE = 'best' in data ? { pepper: data } : data;
  // the shared file pill: on a phone held upright only the buddy shows
  SaveFiles.badge($('#whoBtn'), n, m);
}
const stats = id => (FILE[id] = { ...DEF, ...FILE[id] });
function persist() { if (me) SaveFiles.save(KEY, me, FILE); }
const saveSound = () => { try { localStorage.setItem(SOUND, SND.on ? 'on' : 'off'); } catch (e) { } };
function showSound() {
  const b = $('#soundBtn');
  b.textContent = SND.on ? STR.soundOn : STR.soundOff;
  b.setAttribute('aria-label', SND.on ? STR.soundOnL : STR.soundOffL);
}

// ---------- Sound ----------
const tone = RDG.sound({ on: () => SND.on, vol: .04 });
const sfx = {
  flip() { tone(180, .04, 'square', 0, .025, 110); },
  bumper() { tone(620, .07, 'square', 0, .045, 1100); },
  sling() { tone(300, .05, 'triangle', 0, .07, 180); },
  duck() { tone(1250, .07, 'square', 0, .035, 700); tone(950, .06, 'square', .07, .03, 600); },
  row() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .1, 'square', i * .07, .04)); },
  lane() { tone(880, .06, 'triangle', 0, .06); },
  tub() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .09, 'triangle', i * .06, .07)); },
  launch(p) { tone(110, .2, 'sawtooth', 0, .04, 300 + 500 * p); },
  rampUp() { tone(200, .35, 'square', 0, .025, 700); },
  ramp(n) { [659, 784, 988, 1175].slice(0, 2 + Math.min(n, 2)).forEach((f, i) => tone(f, .08, 'square', i * .06, .04)); },
  spin() { tone(1500, .015, 'square', 0, .02); },
  plop() { tone(260, .12, 'triangle', 0, .08, 90); },
  gurgle() { for (let i = 0; i < 5; i++) tone(140 + Math.random() * 120, .06, 'triangle', i * .09, .05, 90); },
  pop() { tone(300, .1, 'square', 0, .05, 900); },
  secret() { [523, 784, 659, 1047, 1319].forEach((f, i) => tone(f, .12, 'square', i * .09, .045)); },
  frenzy() { [784, 988, 1175, 1568, 1175, 1568].forEach((f, i) => tone(f, .08, 'triangle', i * .07, .07)); },
  drain() { tone(420, .55, 'triangle', 0, .07, 70); },
  saved() { [659, 784, 988].forEach((f, i) => tone(f, .09, 'square', i * .08, .04)); },
  over() { [523, 440, 349, 262].forEach((f, i) => tone(f, .22, 'triangle', i * .2, .07)); },
};

// ---------- The table ----------
const W = 180, TH = 320, BOX = 64, DMD = 22;   // the table; the backbox, its score screen at the bottom
const TUNE = {
  r: 4,                 // the ball
  gravity: 560,         // down the table, pixels a second squared
  maxSpeed: 980,        // pixels a second; about 2 a step, so nothing is skipped
  step: 1 / 480,
  maxFrame: 1 / 20,     // a slower frame than this is played as this
  wall: .45, rubber: .7, post: .55,   // how much bounce each keeps
  slide: .995,          // a little speed lost along any surface it touches
  flipLen: 26, flipR: 3.4, flipTip: 2.2,
  flipRest: .5, flipUp: -.44,         // radians below and above flat (left flipper)
  flipSpeedUp: 34, flipSpeedDown: 18, // radians a second
  flipBounce: .3,
  bumperKick: 360, slingKick: 330,
  plungerMin: 300, plungerMax: 960, plungerFill: 1.1,   // seconds to pull all the way
  plungerY: 309, plungerDrop: 10,
  ballSave: 6,          // seconds after a launch in which a drained ball comes back
  stuck: 4,             // seconds nearly still away from the flippers before a nudge
  rampClimb: 30,        // pixels of slope at the ramp's mouth
  rampMin: 480,         // the speed that just makes it up the slope
  rampRide: [260, 600], // slowest and fastest along the top
  rampCombo: 10,        // seconds to make the next ramp for more
  holeGrab: 800,        // a ball slower than this drops into a squirrel hole
  bowlGrab: 340,        // and into the barn or the dinner bowl, out in the open
  tunnel: 230,          // pixels a second under the yard
  frenzy: 15,           // seconds of the Dinner Bell; the bowl again adds 10
  open: 8,              // seconds a squirrel hole stays open after a squirrel row
};
const R = TUNE.r;
const mirror = x => 166 - x;   // the field runs from 6 to 160; its middle is 83

// static walls: segments a-b with a half thickness and a bounce
const walls = [];
const wall = (ax, ay, bx, by, o = {}) => { const w = { ax, ay, bx, by, r: 1.5, e: TUNE.wall, ...o }; walls.push(w); return w; };
// the round top, center (90, 86), radius 84, from the left wall over to the right
const ARC = { x: 90, y: 86, r: 84 };
{
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI + Math.PI * i / n, a1 = Math.PI + Math.PI * (i + 1) / n;
    wall(ARC.x + ARC.r * Math.cos(a0), ARC.y + ARC.r * Math.sin(a0), ARC.x + ARC.r * Math.cos(a1), ARC.y + ARC.r * Math.sin(a1));
  }
}
wall(6, 86, 6, 240);              // left wall
wall(174, 86, 174, 330);          // right wall, the outside of the plunger lane
wall(160, 110, 160, 330);         // the inside of the plunger lane
wall(6, 240, 49, 279);            // the guides down to the flippers
wall(160, 240, 117, 279);
// the gate at the top of the plunger lane lets the ball out and not back in;
// it slopes into the field, so a ball that lands on it rolls off
wall(174, 92, 160, 104, { oneWay: true });
// top lanes T U B: four short dividers with round tops
const LANE_X = [63, 83, 103];
[53, 73, 93, 113].forEach(x => wall(x, 26, x, 44, { r: 1.5 }));
// slingshots: the long side kicks
const SLING = [{ ax: 18, ay: 200, bx: 38, by: 253 }, { ax: mirror(18), ay: 200, bx: mirror(38), by: 253 }];
SLING.forEach(s => {
  s.flash = 0; s.cool = 0;
  wall(s.ax, s.ay, s.bx, s.by, { r: 1.5, e: TUNE.rubber, sling: s });
  wall(s.ax, s.ay, s.ax, 234, { r: 1.5 });
  wall(s.ax, 234, s.bx, s.by, { r: 1.5 });
});
// The squirrel banks: three drop targets each, with a pocket behind them
// against the side wall. The first draft had a backing wall right behind the
// targets; the squirrel holes need room, so the pocket runs back to the wall,
// closed top and bottom, and the squirrels are its door. (In the code a bank's
// targets are still `ducks`, from the bubble bath draft.)
const DUCK_Y = [128, 143, 158];
const BANKS = [0, 1].map(side => {
  const fx = side ? 146 : 20, wx = side ? 160 : 6;
  wall(fx, 120, wx, 114);
  wall(fx, 166, wx, 173);
  return {
    side, fx, x0: Math.min(fx, wx), x1: Math.max(fx, wx), open: 0, reset: 0,
    ducks: DUCK_Y.map(y => ({ y, down: false, seg: { ax: fx, ay: y - 6, bx: fx, by: y + 6, r: 1.5, e: TUNE.post } })),
  };
});
// pop bumpers: tumbleweeds
const BUMPERS = [{ x: 58, y: 104 }, { x: 108, y: 104 }, { x: 83, y: 134 }].map(b => ({ ...b, r: 9, flash: 0, cool: 0 }));
// the spinner: a blade on a wire between two posts, that the ball passes under
const SPIN = { ax: 118, bx: 134, y: 80, a: 0, w: 0, acc: 0 };
// round tops on the lane dividers, and the spinner's posts
const POSTS = [53, 73, 93, 113].map(x => ({ x, y: 26, r: 2 })).concat([{ x: SPIN.ax, y: SPIN.y, r: 2 }, { x: SPIN.bx, y: SPIN.y, r: 2 }]);
// flippers
const FLIPS = [
  { side: 0, x: 52, y: 282, rest: TUNE.flipRest, up: TUNE.flipUp, a: TUNE.flipRest, w: 0, held: false },
  { side: 1, x: 114, y: 282, rest: Math.PI - TUNE.flipRest, up: Math.PI - TUNE.flipUp, a: Math.PI - TUNE.flipRest, w: 0, held: false },
];

// A path the ball follows instead of the physics: a list of points, with the
// distance along it to each one worked out once.
function path(pts) {
  const at = [0];
  for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, at, len: at[at.length - 1] };
}
// where on the path, and which way it runs there
function along(p, s) {
  s = Math.max(0, Math.min(p.len, s));
  let i = 1;
  while (i < p.pts.length - 1 && p.at[i] < s) i++;
  const [ax, ay] = p.pts[i - 1], [bx, by] = p.pts[i], L = p.at[i] - p.at[i - 1] || 1, k = (s - p.at[i - 1]) / L;
  return [ax + (bx - ax) * k, ay + (by - ay) * k, (bx - ax) / L, (by - ay) / L];
}

// The fence ramp. Its mouth is on the left above the slingshot, facing the
// right flipper; it climbs, runs over the top of the table above the lanes,
// down the right side over the squirrel bank, and drops the ball into the right
// inlane, so it comes back to the right flipper. It's two rails, so
// everything under it still shows. A ball too slow for the slope rolls back out.
const RAMP = path([[44, 188], [36, 177], [32, 160], [32, 110], [36, 64], [52, 32], [72, 18], [90, 14], [110, 18], [130, 30], [142, 52], [146, 84], [156, 118], [156, 200], [154, 232]]);
// the way in, from the flipper: d, and n across the mouth
const MOUTH = { x: 44, y: 188, dx: -.61, dy: -.79, nx: .79, ny: -.61, half: 7 };
// rails either side of the mouth, reaching back toward the flipper
[1, -1].forEach(k => {
  const x = MOUTH.x + 8 * k * MOUTH.nx, y = MOUTH.y + 8 * k * MOUTH.ny;
  wall(x, y, x - 12 * MOUTH.dx, y - 12 * MOUTH.dy, { r: 1.5 });
});

// The house's porch fills the top left corner (Randi, 27 Nov: "under the
// house deck and past the lost shoes and socks"). It's solid to the ball on
// the table. Under its deck is a dark crawl space behind the lattice, where
// Pepper's lost things lie; only the barn's tunnel gets in there.
// Its edge was at x 46 at first, which left a gap narrower than the ball
// beside the first lane post, where a ball could sit wedged; at 40 the ball
// fits through.
const PORCH = { x0: 6, x1: 40, y1: 100, under: 86, house: 50 };
wall(PORCH.x0, PORCH.y1, PORCH.x1, PORCH.y1);
wall(PORCH.x1, PORCH.y1, PORCH.x1, 16);
// The barn, right of the middle, its door open at the bottom toward the left
// flipper. Shot through the door, the ball drops into the hayloft hole. The
// first barn was 22 wide with a flat roof: in bot play balls sat on the
// roof, and in the gap between it and the squirrels, narrower than the ball.
// Now the roof peaks and the barn is 18 wide, so a ball rolls off and through.
const BARN = { x0: 116, x1: 134, y0: 170, y1: 192, peak: 165 };
wall(BARN.x0, BARN.y0 + 2, (BARN.x0 + BARN.x1) / 2, BARN.peak);
wall((BARN.x0 + BARN.x1) / 2, BARN.peak, BARN.x1, BARN.y0 + 2);
wall(BARN.x0, BARN.y0 + 2, BARN.x0, BARN.y1);
wall(BARN.x1, BARN.y0 + 2, BARN.x1, BARN.y1);
// Where the lost things lie under the corner, in the order the ball passes
// them; each trip from the barn finds the next one. What they are is the
// table's (TB.STASH).
const STASH_X = [35, 29, 22, 16, 12, 7];

// The holes. The barn and the dinner bowl are out in the open; each squirrel
// hole is in the pocket behind a squirrel bank, reached through the gap
// a knocked-down squirrel leaves. Every hole drains into a squirrel tunnel under the
// yard. The bowl's and the squirrel holes' come back up at the mound below
// the lanes, so the ball goes back into the tumbleweeds; the barn's runs
// under the porch, past the lost things, and lets the ball out at its left
// end, onto the squirrel bank's roof.
const POP = { x: 83, y: 72, flash: 0 };
const PORCH_OUT = { x: 13, y: 106 };
const HOLES = [
  { id: 'barn', x: 125, y: 183, r: 6, way: [[125, 183], [112, 150], [80, 124], [50, 100], [40, 93], [8, 93], [PORCH_OUT.x, PORCH_OUT.y]] },
  { id: 'dish', x: 56, y: 150, r: 6, way: [[56, 150], [66, 120], [76, 92], [83, 72]] },
  // A squirrel hole is in the pocket's back corner, where the sloping floor
  // takes the ball. Halfway up the pocket at first, balls in bot play sat
  // in the corner under it until the stuck-ball nudge.
  { id: 'secret', bank: 0, x: 12, y: 162, r: 5, way: [[12, 162], [13, 143], [26, 118], [44, 96], [66, 80], [83, 72]] },
  { id: 'secret', bank: 1, x: 154, y: 162, r: 5, way: [[154, 162], [153, 143], [140, 118], [122, 96], [100, 80], [83, 72]] },
].map(h => ({ ...h, way: path(h.way), cool: 0, flash: 0 }));

// ---------- Game state ----------
// G is one game; B the ball. state: 'menu' (a card is up), 'play', 'over'.
// B.mode is null on the table, 'ramp' on the wire, 'hole' sitting in a hole,
// 'tunnel' under the yard.
let state = 'menu', G = null, B = null;
const LANES = [false, false, false];
function newGame() {
  G = { score: 0, ball: 1, mult: 1, bonus: 0, saveT: 0, saved: false, pull: 0, pulling: false, msg: null, msgT: 0, stillT: 0, combo: 0, comboT: 0, frenzy: 0, stash: [] };
  LANES.fill(false);
  BANKS.forEach(b => { b.ducks.forEach(d => d.down = false); b.reset = 0; b.open = 0; });
  newBall();
}
function newBall() {
  B = { x: 167, y: TUNE.plungerY - R, vx: 0, vy: 0, live: true, launched: false, mode: null };
  G.mult = 1; G.bonus = 0; G.saved = false; G.saveT = 0; G.pull = 0; G.pulling = false; G.combo = 0; G.comboT = 0; G.frenzy = 0;
  live(t('liveBall', { n: G.ball }));
}
const add = n => { G.score += n; };
function say(text, secs = 1.6) { G.msg = text; G.msgT = secs; }
const live = s => { $('#live').textContent = s; };

// ---------- Collisions ----------
// The ball against a point (a circle of radius rad round cx, cy). u is the
// surface's own velocity there (a moving flipper), kick a speed added along
// the normal (bumpers, slingshots). Returns how hard it hit, or 0.
function hitAt(cx, cy, rad, e, ux = 0, uy = 0, kick = 0) {
  const dx = B.x - cx, dy = B.y - cy, d2 = dx * dx + dy * dy, min = rad + R;
  if (d2 >= min * min || d2 === 0) return 0;
  const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
  B.x = cx + nx * min; B.y = cy + ny * min;
  let rx = B.vx - ux, ry = B.vy - uy;
  const vn = rx * nx + ry * ny;
  if (vn >= 0) return 0;
  rx -= (1 + e) * vn * nx; ry -= (1 + e) * vn * ny;
  rx *= TUNE.slide; ry *= TUNE.slide;
  if (kick) { const now = rx * nx + ry * ny; if (now < kick) { rx += (kick - now) * nx; ry += (kick - now) * ny; } }
  B.vx = rx + ux; B.vy = ry + uy;
  return -vn;
}
function nearest(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  let k = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  k = Math.max(0, Math.min(1, k));
  return [ax + k * dx, ay + k * dy, k];
}
function hitSeg(s, kick = 0) {
  if (s.oneWay) {
    // only from above: a ball whose middle is under the gate (on its way up
    // the lane) passes through. The first try also let through any ball
    // moving up, and balls riding the arc round to the right slipped back
    // down the lane.
    const side = (s.bx - s.ax) * (B.y - s.ay) - (s.by - s.ay) * (B.x - s.ax);
    if (side < 0) return 0;
  }
  const [cx, cy] = nearest(B.x, B.y, s.ax, s.ay, s.bx, s.by);
  return hitAt(cx, cy, s.r, s.e, 0, 0, kick);
}
function hitFlipper(f) {
  const tx = f.x + TUNE.flipLen * Math.cos(f.a), ty = f.y + TUNE.flipLen * Math.sin(f.a);
  const [cx, cy, k] = nearest(B.x, B.y, f.x, f.y, tx, ty);
  const rad = TUNE.flipR + (TUNE.flipTip - TUNE.flipR) * k;
  // the flipper's surface moves at w times the distance from the pivot
  return hitAt(cx, cy, rad, TUNE.flipBounce, -f.w * (cy - f.y), f.w * (cx - f.x));
}
const mouthAlong = () => (B.x - MOUTH.x) * MOUTH.dx + (B.y - MOUTH.y) * MOUTH.dy;
const inPocket = bank => B && B.live && !B.mode && B.x > bank.x0 - 2 && B.x < bank.x1 + 2 && B.y > 116 && B.y < 172;

// ---------- One step ----------
function step(dt) {
  for (const f of FLIPS) {
    const want = f.held ? f.up : f.rest, gap = want - f.a;
    const most = (f.held ? TUNE.flipSpeedUp : TUNE.flipSpeedDown) * dt;
    const turn = Math.sign(gap) * Math.min(Math.abs(gap), most);
    f.a += turn; f.w = turn / dt;
  }
  if (G.pulling) G.pull = Math.min(1, G.pull + dt / TUNE.plungerFill);
  if (!B || !B.live) return;
  if (B.mode === 'ramp') return rampStep(dt);
  if (B.mode === 'hole') { if ((B.t -= dt) <= 0) { B.mode = 'tunnel'; B.s = 0; sfx.gurgle(); } return; }
  if (B.mode === 'tunnel') return tunnelStep(dt);

  const px = B.x, py = B.y, before = mouthAlong();
  B.vy += TUNE.gravity * dt;
  const sp = Math.hypot(B.vx, B.vy);
  if (sp > TUNE.maxSpeed) { B.vx *= TUNE.maxSpeed / sp; B.vy *= TUNE.maxSpeed / sp; }
  B.x += B.vx * dt; B.y += B.vy * dt;

  for (const s of walls) {
    const hit = hitSeg(s, s.sling && s.sling.cool <= 0 ? TUNE.slingKick : 0);
    if (hit && s.sling && s.sling.cool <= 0 && hit > 40) { s.sling.cool = .15; s.sling.flash = .1; add(10); sfx.sling(); }
  }
  for (const p of POSTS) hitAt(p.x, p.y, p.r, TUNE.post);
  for (const b of BUMPERS) {
    const hit = hitAt(b.x, b.y, b.r, TUNE.rubber, 0, 0, TUNE.bumperKick);
    if (hit && b.cool <= 0) { b.cool = .08; b.flash = .1; add(G.frenzy > 0 ? 1000 : 100); sfx.bumper(); }
  }
  for (const bank of BANKS) for (const d of bank.ducks) {
    if (d.down) continue;
    if (hitSeg(d.seg) > 30) duckDown(bank, d);
  }
  for (const f of FLIPS) hitFlipper(f);
  // the plunger's top, lower as it's pulled
  const plY = TUNE.plungerY + G.pull * TUNE.plungerDrop;
  if (B.x > 160 && B.y > plY - R) { B.y = plY - R; if (B.vy > 0) B.vy = -B.vy * .2; B.vx *= .9; }

  // into the ramp: across the mouth line from the front, inside its width
  const after = mouthAlong(), across = (B.x - MOUTH.x) * MOUTH.nx + (B.y - MOUTH.y) * MOUTH.ny;
  const into = B.vx * MOUTH.dx + B.vy * MOUTH.dy;
  if (before < 0 && after >= 0 && Math.abs(across) < MOUTH.half && into > 0) {
    B.mode = 'ramp'; B.s = 0; B.v = into; B.made = false; sfx.rampUp();
    return;
  }
  // the spinner: passing under its wire sets it turning, faster the faster
  // the ball was going
  if ((py - SPIN.y) * (B.y - SPIN.y) <= 0 && py !== B.y && B.x > SPIN.ax && B.x < SPIN.bx) {
    SPIN.w = Math.max(SPIN.w, Math.min(60, Math.max(8, Math.abs(B.vy) * .06)));
  }
  // the holes: a ball slow enough drops in; close to a squirrel hole it's
  // drawn toward the middle, the way a real ball rolls into a dip. The bowl
  // and the barn had the same pull at first and caught a ball about once a
  // ball each in bot play (the bell rang half the time, the stash filled in
  // a game), so they have none.
  for (const h of HOLES) {
    // A squirrel hole takes the ball once any squirrel in front of it is
    // down. It needed all three at first, but with two down and the middle
    // one up a ball can slip in through a gap, and it sat in the pocket
    // until the stuck-ball nudge.
    if (h.cool > 0 || (h.bank !== undefined && !BANKS[h.bank].ducks.some(d => d.down))) continue;
    const dx = h.x - B.x, dy = h.y - B.y, d = Math.hypot(dx, dy);
    if (h.bank !== undefined && d < h.r + 3) { B.vx += dx * 40 * dt; B.vy += dy * 40 * dt; }
    if (d < h.r - 1 && Math.hypot(B.vx, B.vy) < (h.bank === undefined ? TUNE.bowlGrab : TUNE.holeGrab)) { intoHole(h); return; }
  }
  // top lanes: rolling through one lights its letter
  LANE_X.forEach((x, i) => {
    const inside = Math.abs(B.x - x) < 7 && Math.abs(B.y - 36) < 6;
    if (inside && !B['lane' + i]) laneHit(i);
    B['lane' + i] = inside;
  });
  if (!B.launched && B.x < 160) { B.launched = true; G.saveT = TUNE.ballSave; }
  if (B.y > TH + 10) drain();
  void px;
}
function rampStep(dt) {
  if (B.s < TUNE.rampClimb) {
    // the slope at the mouth: it slows going up, and rolls back if it stops
    B.v -= TUNE.rampMin * TUNE.rampMin / (2 * TUNE.rampClimb) * dt;
  } else {
    if (!B.made) { B.made = true; rampMade(); }
    const [lo, hi] = TUNE.rampRide;
    B.v = Math.min(hi + (B.s > RAMP.at[11] ? 60 : 0), Math.max(lo, B.v + (B.s > RAMP.at[11] ? 300 * dt : 0)));
  }
  B.s += B.v * dt;
  if (B.s <= 0) {
    // back out of the mouth, the way it came
    B.mode = null;
    B.x = MOUTH.x - MOUTH.dx * 1.5; B.y = MOUTH.y - MOUTH.dy * 1.5;
    B.vx = MOUTH.dx * B.v; B.vy = MOUTH.dy * B.v;
    return;
  }
  const [x, y, ux, uy] = along(RAMP, B.s);
  B.x = x; B.y = y; B.vx = ux * B.v; B.vy = uy * B.v;
  if (B.s >= RAMP.len) { B.mode = null; B.vx *= .4; B.vy *= .7; }   // off the end into the inlane
}
function tunnelStep(dt) {
  const h = B.hole;
  B.s += TUNE.tunnel * dt;
  const [x, y] = along(h.way, B.s);
  B.x = x; B.y = y; B.vx = 0; B.vy = 0;
  // under the porch, the first lost thing the ball rolls past is found
  if (h.id === 'barn' && !B.found && y > PORCH.under) {
    const it = TB.STASH.find(i => !G.stash.includes(i.id));
    if (it && x <= STASH_X[TB.STASH.indexOf(it)] + 3) findThing(it);
  }
  if (h.id === 'barn' && B.s >= h.way.len) {
    B.mode = null; B.vx = 30; B.vy = 40;
    return;
  }
  if (B.s >= h.way.len) {
    // up out of the pop-up, with a little hop toward one side or the other
    B.mode = null; B.x = POP.x; B.y = POP.y;
    B.vx = (Math.random() < .5 ? -1 : 1) * (60 + Math.random() * 80); B.vy = -40;
    POP.flash = .3; sfx.pop();
  }
}
function findThing(it) {
  B.found = true; G.stash.push(it.id); S.stash++;
  add(5000); G.bonus += 1000;
  say(t('dFound', { thing: it.name })); live(t('liveFound', { thing: it.name.toLowerCase() })); sfx.secret();
  if (G.stash.length === TB.STASH.length) {
    // all six back: the stash is complete, and they're lost all over again
    setTimeout(() => {
      if (!G) return;
      add(25000); S.stashes++; G.stash = []; say(t('dStash'), 2.4); live(t('liveStash')); sfx.frenzy();
    }, 1500);
  }
}
function intoHole(h) {
  B.mode = 'hole'; B.hole = h; B.x = h.x; B.y = h.y; B.vx = B.vy = 0; B.t = .9; B.found = false;
  h.cool = 2; h.flash = .9; sfx.plop();
  if (h.id === 'barn') { add(1000); say(t('dBarn')); return; }
  if (h.id === 'dish') {
    add(1500);
    if (G.frenzy > 0) { G.frenzy += 10; say(t('dFrenzyMore')); }
    else { G.frenzy = TUNE.frenzy; S.frenzies++; say(t('dFrenzy'), 2); live(t('liveFrenzy')); setTimeout(sfx.frenzy, 150); }
  } else {
    add(10000); G.bonus += 2000; S.secrets++; say(t('dSecret'), 2); live(t('liveSecret')); B.t = 1.4;
    setTimeout(sfx.secret, 150);
    const bank = BANKS[h.bank]; bank.open = 0; bank.reset = 1.5;
  }
}
function rampMade() {
  if (G.comboT <= 0) G.combo = 0;
  const v = 2000 + 1000 * Math.min(G.combo, 5);
  G.combo++; G.comboT = TUNE.rampCombo; S.ramps++; G.bonus += 500;
  add(v); say(t('dRamp', { v: fmt(v) })); live(t('liveRamp', { v: fmt(v) })); sfx.ramp(G.combo);
}
function duckDown(bank, d) {
  d.down = true; add(500); G.bonus += 200; S.ducks++; sfx.duck();
  if (bank.ducks.every(x => x.down)) {
    // all three down: the squirrel hole behind them is open for a while
    add(2500); S.rows++; bank.open = TUNE.open; say(t('dDuckRow')); setTimeout(sfx.row, 120);
    setTimeout(() => { if (G && bank.open > 0) say(t('dOpen')); }, 1600);
  }
}
function laneHit(i) {
  add(LANES[i] ? 50 : 250);
  if (LANES[i]) return;
  LANES[i] = true; G.bonus += 100; sfx.lane();
  if (LANES.every(Boolean)) {
    LANES.fill(false); add(1000); S.tubs++;
    if (G.mult < 5) { G.mult++; say(t('dTub', { m: G.mult })); } else say(STR.dTubMax);
    sfx.tub();
  }
}
// pressing a flipper moves the lit lanes along one, so a lane can be aimed for
function laneChange(dir) {
  if (state !== 'play') return;
  const l = [...LANES];
  for (let i = 0; i < 3; i++) LANES[(i + dir + 3) % 3] = l[i];
}
function drain() {
  B.live = false; sfx.drain();
  G.frenzy = 0;
  if (G.saveT > 0 && !G.saved) {
    say(STR.dSaved, 1.4); live(STR.liveSaved); sfx.saved();
    setTimeout(() => { if (state === 'play') { const keep = G.bonus, m = G.mult; newBall(); G.saved = true; G.bonus = keep; G.mult = m; } }, 900);
    return;
  }
  const b = G.bonus * G.mult;
  add(b);
  say(G.mult > 1 ? t('dBonusX', { b: fmt(G.bonus), m: G.mult }) : t('dBonus', { b: fmt(G.bonus) }), 2);
  persist();
  setTimeout(() => {
    if (state !== 'play') return;
    if (G.ball >= 3) return gameOver();
    G.ball++; newBall();
  }, 2000);
}
function gameOver() {
  state = 'over';
  const wasBest = G.score > S.best;
  S.games++;
  if (wasBest) S.best = G.score;
  persist();
  sfx.over(); say(STR.dOver, 1e9);
  live(t('liveOver', { score: fmt(G.score) }));
  letGoAll();
  setTimeout(() => showOver(wasBest), 1200);
}

// ---------- Per frame ----------
let acc = 0;
function frame(dt) {
  // the Menu dialog (shared/menu.js) stops the table while it asks
  const asking = $('#menuDlg') && $('#menuDlg').open;
  if (asking) letGoAll();
  const running = state === 'play' && G && !asking;
  if (running) {
    acc = Math.min(acc + dt, TUNE.maxFrame);
    while (acc >= TUNE.step) { step(TUNE.step); acc -= TUNE.step; }
    if (G.saveT > 0 && B && B.live && !B.mode) G.saveT -= dt;
    if (G.comboT > 0) G.comboT -= dt;
    if (G.frenzy > 0) G.frenzy = Math.max(0, G.frenzy - dt);
    // a ball sitting still away from the flippers and the plunger gets a nudge
    const still = B && B.live && !B.mode && Math.hypot(B.vx, B.vy) < 8 && B.x < 160 && B.y < 262;
    G.stillT = still ? G.stillT + dt : 0;
    if (G.stillT > TUNE.stuck) { B.vx = (Math.random() - .5) * 200; B.vy = -160; G.stillT = 0; }
    // a squirrel hole closes when its time is up, unless the ball is in the
    // pocket, where the squirrels popping up would shut it in
    for (const bank of BANKS) {
      if (bank.open > 0 && (bank.open -= dt) <= 0 && !inPocket(bank)) bank.reset = .01;
      if (bank.open <= 0 && bank.ducks.every(d => d.down) && !bank.reset && !inPocket(bank)) bank.reset = .01;
    }
  } else {
    // behind the cards the flippers still drop back
    for (const f of FLIPS) { f.held = false; f.a = f.rest; f.w = 0; }
  }
  // the spinner turns down; every half turn scores
  if (SPIN.w > 0) {
    SPIN.a += SPIN.w * dt; SPIN.acc += SPIN.w * dt;
    while (SPIN.acc >= Math.PI) { SPIN.acc -= Math.PI; if (running) { add(G.frenzy > 0 ? 200 : 50); sfx.spin(); } }
    SPIN.w *= Math.exp(-1.6 * dt);
    if (SPIN.w < 1.5) { SPIN.w = 0; SPIN.acc = 0; }
  }
  for (const b of BUMPERS) { b.flash -= dt; b.cool -= dt; }
  for (const s of SLING) { s.flash -= dt; s.cool -= dt; }
  for (const h of HOLES) { h.flash -= dt; h.cool -= dt; }
  POP.flash -= dt;
  for (const bank of BANKS) if (bank.reset > 0 && (bank.reset -= dt) <= 0) { bank.reset = 0; bank.open = 0; bank.ducks.forEach(d => d.down = false); }
  if (G && G.msgT > 0) G.msgT -= dt;
  if (!calm) motes.forEach(m => { m.y -= m.v * dt; m.x += Math.sin(m.y / 9 + m.p) * .15; if (m.y < -2) { m.y = TH + 2; m.x = 10 + Math.random() * 150; } });
}

// ---------- Controls ----------
// Each flipper and the plunger is held while any key, finger or button holds
// it, so letting go of one of two doesn't drop it.
const holds = { left: new Set(), right: new Set(), plunger: new Set() };
function press(what, src) {
  if (state !== 'play') return;
  const h = holds[what];
  if (h.has(src)) return;
  const was = h.size > 0;
  h.add(src);
  if (was) return;
  if (what === 'plunger') {
    if (ballReady()) { G.pulling = true; G.pull = 0; }
    return;
  }
  const f = FLIPS[what === 'left' ? 0 : 1];
  f.held = true; sfx.flip(); laneChange(what === 'left' ? -1 : 1);
}
function release(what, src) {
  const h = holds[what];
  if (!h.delete(src) || h.size) return;
  if (what === 'plunger') return shoot();
  FLIPS[what === 'left' ? 0 : 1].held = false;
}
function letGoAll() {
  Object.values(holds).forEach(h => h.clear());
  FLIPS.forEach(f => f.held = false);
  if (G) { G.pulling = false; G.pull = 0; }
}
const ballReady = () => B && B.live && !B.mode && B.x > 160 && B.y > TUNE.plungerY - R - 3 && Math.abs(B.vy) < 40;
function shoot() {
  if (!G || !G.pulling) return;
  const p = G.pull;
  G.pulling = false; G.pull = 0;
  if (ballReady()) { B.vy = -(TUNE.plungerMin + (TUNE.plungerMax - TUNE.plungerMin) * p); sfx.launch(p); }
}

const KEYS = {
  ArrowLeft: 'left', z: 'left', Z: 'left', ShiftLeft: 'left',
  ArrowRight: 'right', '/': 'right', '?': 'right', ShiftRight: 'right',
  ' ': 'plunger', ArrowDown: 'plunger', Enter: 'plunger',
};
const keyOf = e => (e.key === 'Shift' ? e.code : e.key);
addEventListener('keydown', e => {
  const what = KEYS[keyOf(e)];
  if (!what || state !== 'play' || e.metaKey || e.ctrlKey || e.altKey) return;
  e.preventDefault();
  press(what, 'k' + keyOf(e));
});
addEventListener('keyup', e => {
  const what = KEYS[keyOf(e)];
  if (what) release(what, 'k' + keyOf(e));
});
// the screen's two halves are the flippers; the right half pulls the plunger
// while the ball waits on it
const wrap = $('#wrap');
const touches = new Map();
wrap.addEventListener('pointerdown', e => {
  if (state !== 'play') return;
  e.preventDefault();
  const what = e.clientX < innerWidth / 2 ? 'left' : 'right';
  touches.set(e.pointerId, what);
  try { wrap.setPointerCapture(e.pointerId); } catch (err) { }
  press(what, 'p' + e.pointerId);
  if (what === 'right' && ballReady()) press('plunger', 'p' + e.pointerId);
});
const lift = e => {
  const what = touches.get(e.pointerId);
  if (!what) return;
  touches.delete(e.pointerId);
  release(what, 'p' + e.pointerId);
  release('plunger', 'p' + e.pointerId);
};
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => wrap.addEventListener(ev, lift));
addEventListener('blur', letGoAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) letGoAll(); });
RDG.noZoom(() => state === 'play', ['#wrap']);
// a controller: the shoulder buttons flip, A (or B) pulls the plunger, and
// the cross pad's left and right flip too (they're the arrow keys)
RDG.pad({ a: ' ', b: ' ', l: 'z', zl: 'z', r: '/', zr: '/', start: 'Enter' });

// ---------- Drawing ----------
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = $('#cv'), box = $('#box');
cv.width = W; cv.height = TH; box.width = W; box.height = BOX;
const g = cv.getContext('2d'), bxg = box.getContext('2d');
bxg.imageSmoothingEnabled = false;
// colours every table starts from; a table's own C is laid over them
const BASE_C = { rail: '#e8d8b8', railDark: '#6b4426', dmd: '#160c06', dmdLit: '#ff8a1e', litOn: '#ffd23f', litOff: '#8a6a3a', hole: '#2a1a10', chrome: '#c8d0dc' };
const C = { ...BASE_C };
function disc(cx, cy, r, col, c2 = g) {
  c2.fillStyle = col;
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y) + .35);
    c2.fillRect(Math.round(cx) - w, Math.round(cy) + y, 2 * w + 1, 1);
  }
}
function ring(cx, cy, r, col, c2 = g) {
  c2.fillStyle = col;
  for (let a = 0; a < 6.28; a += .5 / r) c2.fillRect(Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a)), 1, 1);
}
function pline(x0, y0, x1, y1, w, col, c2 = g) {
  c2.fillStyle = col;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), o = Math.floor(w / 2);
  for (let i = 0; i <= n; i++) c2.fillRect(Math.round(x0 + (x1 - x0) * i / n) - o, Math.round(y0 + (y1 - y0) * i / n) - o, w, w);
}
// a lit arrow on the playfield, pixel by pixel so its edges stay sharp
function arrow(cx, cy, dx, dy, len, col) {
  const nx = -dy, ny = dx;
  for (let y = -len; y <= len; y++) for (let x = -len; x <= len; x++) {
    const a = x * dx + y * dy, c = x * nx + y * ny;   // a along, c across
    const head = a >= 0 && Math.abs(c) <= (len - a) * .8;
    const tail = a < 0 && a > -len * .8 && Math.abs(c) <= 1;
    if (head || tail) { g.fillStyle = col; g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1); }
  }
}
const rail = s => { pline(s.ax, s.ay, s.bx, s.by, 3, C.railDark); pline(s.ax, s.ay, s.bx, s.by, 1, C.rail); };

// The tables. Each table file (table-pepper.js, table-zombies.js) adds one
// here: its words (`str`, read before STR by t()), colours (`C`), sprites,
// lost things (`STASH`) and the painters for what's its own: the field
// (`paint`), the top corner (`corner`), what's drawn over the ball
// (`front`), the rim lights or fence (`rim`) and the backbox (`box`).
// Everything else on the table is drawn here from those colours.
const TABLES = {};
let TB = null;
const bg = document.createElement('canvas');
bg.width = W; bg.height = TH;
function useTable(id) {
  TB = TABLES[id] || TABLES.pepper;
  Object.keys(C).forEach(k => delete C[k]);
  Object.assign(C, BASE_C, TB.C);
  TB.paint(bg.getContext('2d'));
  document.documentElement.dataset.table = TB.id;
}
const BALL = RDG.sprite(['..bbb..', '.bwwbc.', 'bwwbbbc', 'bbbbbcc', 'bbbbccc', '.bcccd.', '..ccc..'],
  { w: '#ffffff', b: '#c8d0dc', c: '#8a96a8', d: '#5c6678' }, { line: '#1d2330' });
// dust or stars drifting up the table, for the look only
const motes = Array.from({ length: 12 }, (_, i) => ({ x: 10 + Math.random() * 150, y: Math.random() * TH, v: 5 + Math.random() * 8, p: i }));

// helpers the tables paint with
function fieldPath(b) { b.beginPath(); b.moveTo(6, 86); b.arc(ARC.x, ARC.y, ARC.r, Math.PI, 2 * Math.PI); b.lineTo(174, TH); b.lineTo(6, TH); b.closePath(); }
// the tunnels show faintly through the field, from each hole to where it comes up
function paintTunnels(b) { HOLES.forEach(h => { for (let s = 0; s < h.way.len; s += 3) { const [x, y] = along(h.way, s); disc(x, y, 1, C.tunnel, b); } }); }
// the aprons under the guides, in planks or plates
function paintAprons(b, fill, line) {
  b.fillStyle = fill;
  b.beginPath(); b.moveTo(6, 240); b.lineTo(49, 279); b.lineTo(49, TH); b.lineTo(6, TH); b.fill();
  b.beginPath(); b.moveTo(160, 240); b.lineTo(117, 279); b.lineTo(117, TH); b.lineTo(160, TH); b.fill();
  b.fillStyle = line;
  for (let y = 250; y < TH; y += 6) { b.fillRect(6, y, 43, 1); b.fillRect(117, y, 43, 1); }
}
function cornerClip() {
  g.beginPath(); g.moveTo(6, 86); g.arc(ARC.x, ARC.y, ARC.r, Math.PI, 1.5 * Math.PI); g.lineTo(PORCH.x1, 0); g.lineTo(PORCH.x1, PORCH.y1); g.lineTo(6, PORCH.y1); g.closePath(); g.clip();
}
// what's been found this game, in a pile on the corner's middle band
function drawFound() {
  if (G) G.stash.forEach((id, i) => { const it = TB.STASH.find(x => x.id === id); g.drawImage(it.img, 8 + (i % 3) * 10, PORCH.house + 3 + (i / 3 | 0) * 11); });
}
// the things still lost, under the corner where the barn's tunnel runs
function drawLost() {
  TB.STASH.forEach((it, k) => { if (!G || !G.stash.includes(it.id)) g.drawImage(it.img, STASH_X[k] - (it.img.width >> 1), PORCH.y1 - it.img.height - 1); });
}
function marqueeTitle(b, dx, y, col, shadow) {
  const title = t('mTitle'), tw = RDG.textWidth(title, 2), tx = Math.round((W - tw) / 2) + dx;
  RDG.text(b, title, tx + 1, y + 1, shadow, 2);
  RDG.text(b, title, tx, y, col, 2);
}
// The ramp: two rails with ties across, drawn over the table, so everything
// under it still shows between the rails.
function drawRamp() {
  const side = (s, k) => { const [x, y, ux, uy] = along(RAMP, s); return [x - uy * k, y + ux * k]; };
  for (let s = 0; s < RAMP.len; s += 8) { const [ax, ay] = side(s, 5), [bx, by] = side(s, -5); pline(ax, ay, bx, by, 1, C.rampDark); }
  for (const k of [5, -5]) {
    let [lx, ly] = side(0, k);
    for (let s = 2; s <= RAMP.len + 1; s += 2) { const [x, y] = side(s, k); pline(lx, ly, x, y, 2, C.rampDark); lx = x; ly = y; }
    [lx, ly] = side(0, k);
    for (let s = 2; s <= RAMP.len + 1; s += 2) { const [x, y] = side(s, k); pline(lx, ly, x, y, 1, C.rampLine); lx = x; ly = y; }
  }
  const a = MOUTH;
  pline(a.x + 7 * a.nx, a.y + 7 * a.ny, a.x - 7 * a.nx, a.y - 7 * a.ny, 2, C.rampLine);
}
function drawStatic() {
  let i = 0;
  for (let x = 14; x < 168; x += 7) { const a = Math.acos(Math.max(-1, Math.min(1, (x - ARC.x) / ARC.r))); TB.rim(x, Math.round(ARC.y - ARC.r * Math.sin(a)), i++); }
  walls.forEach(s => { if (!s.sling) rail(s); });
  POSTS.forEach(p => { disc(p.x, p.y, 2, C.railDark); disc(p.x, p.y, 1, C.rail); });
  // the slingshots, with the rubber along the kicking side
  SLING.forEach(s => {
    g.fillStyle = s.flash > 0 ? '#ffffff' : C.sling;
    g.beginPath(); g.moveTo(s.ax, s.ay); g.lineTo(s.ax, 234); g.lineTo(s.bx, s.by); g.closePath(); g.fill();
    pline(s.ax, s.ay, s.bx, s.by, 3, C.rubber);
  });
}
const blink = (now, ms) => (now / ms | 0) % 2 === 0;
// the parts that change, every frame
let lastDraw = 0;
function drawTable(now) {
  const dt = Math.min(.1, (now - (lastDraw || now)) / 1000); lastDraw = now;
  g.drawImage(bg, 0, 0);
  motes.forEach(m => { g.fillStyle = C.mote; g.fillRect(Math.round(m.x), Math.round(m.y), 1, 1); });
  drawStatic();
  // lane letters and their lights
  t('lanes').split('').forEach((ch, i) => {
    const lit = LANES[i];
    disc(LANE_X[i], 50, 2, lit ? C.litOn : C.litOff);
    RDG.text(g, ch, LANE_X[i] - 1, 54, lit ? C.litOn : C.text);
  });
  // the bonus multiplier lights under the bumpers
  [2, 3, 4, 5].forEach((m, i) => RDG.text(g, m + 'X', 74 + i * 10, 168, G && G.mult >= m ? C.litOn : C.text));
  // the ramp's arrow: blinks fast while a ramp now is worth more
  const combo = G && G.comboT > 0;
  arrow(56, 205, MOUTH.dx, MOUTH.dy, 5, blink(now, combo ? 120 : 600) ? C.litOn : C.litOff);
  // the barn's arrow, and the mode hole's: on while its mode is running
  const fr = G && G.frenzy > 0;
  arrow(123, 206, .1, -.99, 5, blink(now, 520) ? C.litOn : C.litOff);
  arrow(66, 166, -.5, -.87, 5, fr || blink(now, 450) ? C.litOn : C.litOff);
  // ball save, between the flippers
  if (G && G.saveT > 0 && B && B.launched && blink(now, 250)) RDG.text(g, STR.dSave, 76, 300, C.litOn);
  TB.corner();
  // The holes. A secret hole is only a dent until one of the targets in
  // front of it is down, then a dark hole with a rim that blinks. The mode
  // hole has a bowl or crate round it.
  HOLES.forEach(h => {
    if (h.id === 'barn') { disc(h.x, h.y, h.r, h.flash > 0 ? C.litOn : C.barnHole); disc(h.x, h.y, h.r - 1, C.hole); return; }
    if (h.bank !== undefined) {
      if (!BANKS[h.bank].ducks.some(d => d.down)) { disc(h.x, h.y, 2, C.dent); return; }
      disc(h.x, h.y, h.r + 1, blink(now, 200) || h.flash > 0 ? C.litOn : C.secretRim);
    } else {
      disc(h.x, h.y, h.r + 2, h.flash > 0 ? '#ffffff' : C.bowl);
      ring(h.x, h.y, h.r + 2, C.bowlRim);
    }
    disc(h.x, h.y, h.r - 1, C.hole);
  });
  // where the tunnels come up
  disc(POP.x, POP.y, 5, POP.flash > 0 ? C.litOn : C.mound); disc(POP.x, POP.y, 2, C.hole);
  // the bumpers, each on a rubber ring that turns gold while the mode runs
  BUMPERS.forEach(b => {
    const f = b.flash > 0;
    disc(b.x, b.y, b.r + (f ? 1 : 0), fr ? C.frenzyRing : C.ring);
    disc(b.x, b.y, b.r - 1, f ? C.baseHi : C.base);
    g.drawImage(TB.bumper, Math.round(b.x) + TB.bumperAt[0] + (f ? 1 : 0), Math.round(b.y) + TB.bumperAt[1]);
  });
  // the drop targets; a knocked-down one leaves its slot
  BANKS.forEach(bank => bank.ducks.forEach(d => {
    if (d.down) { pline(bank.fx, d.y - 5, bank.fx, d.y + 5, 2, C.slot); return; }
    g.drawImage(TB.target[bank.side], bank.fx + TB.targetAt[bank.side], d.y + TB.targetAt[2]);
  }));
  // the spinner: seen from above, the blade looks wide flat and thin edge on
  const sw = Math.max(1, Math.round(Math.abs(Math.cos(SPIN.a)) * 4));
  g.fillStyle = C.litOn; g.fillRect(SPIN.ax + 2, SPIN.y - (sw >> 1), SPIN.bx - SPIN.ax - 3, sw);
  g.fillStyle = C.railDark; g.fillRect(SPIN.ax + 2, SPIN.y, SPIN.bx - SPIN.ax - 3, 1);
  // flippers, with a rubber edge and a dark pivot
  FLIPS.forEach(f => {
    const tx = f.x + TUNE.flipLen * Math.cos(f.a), ty = f.y + TUNE.flipLen * Math.sin(f.a);
    for (const [r0, col] of [[1, C.rubber], [0, C.flip]]) {
      for (let i = 0; i <= 26; i++) {
        const k = i / 26, r = Math.round(TUNE.flipR + (TUNE.flipTip - TUNE.flipR) * k) + r0 - (r0 ? 0 : 1);
        disc(f.x + (tx - f.x) * k, f.y + (ty - f.y) * k, r, col);
      }
    }
    disc(f.x, f.y, 1, C.railDark);
  });
  // the plunger: a knob on a spring, lower the harder it's pulled
  const pull = G ? G.pull : 0, py = TUNE.plungerY + pull * TUNE.plungerDrop;
  g.fillStyle = C.rubber; g.fillRect(162, py, 11, 3);
  g.fillStyle = C.chrome;
  for (let y = py + 4; y < TH; y += 3 - pull) g.fillRect(163, Math.round(y), 9, 1);
  // the ball: on the table, sunk in a hole, a bump moving under the field in
  // a tunnel (under the corner, the ball itself), then the ramp over the top,
  // then the ball on the ramp with its shadow below
  const bx = B ? Math.round(B.x) : 0, by = B ? Math.round(B.y) : 0;
  if (B && B.live && !B.mode) g.drawImage(BALL, bx - 4, by - 4);
  if (B && B.live && B.mode === 'hole') { g.globalAlpha = .6; g.drawImage(BALL, bx - 4, by - 4); g.globalAlpha = 1; }
  if (B && B.live && B.mode === 'tunnel') {
    if (B.hole.id === 'barn' && by > PORCH.under && bx < PORCH.x1 + 2) g.drawImage(BALL, bx - 4, by - 4);
    else { disc(bx, by, 3, C.bump); disc(bx, by - 1, 2, C.bumpHi); }
  }
  TB.front();
  drawRamp();
  if (B && B.live && B.mode === 'ramp') {
    g.globalAlpha = .3; disc(bx + 3, by + 4, 3, C.hole); g.globalAlpha = 1;
    g.drawImage(BALL, bx - 4, by - 5);
  }
  drawBox(now, dt);
}
// The backbox: the table's own scene, chasing lights round the edge (faster
// while the mode runs), then the score screen.
function drawBox(now, dt) {
  const b = bxg, M = BOX - DMD, fr = G && G.frenzy > 0;
  TB.box(b, now, M, fr, dt);
  const stepN = (now / (fr ? 60 : 160)) | 0;
  let i = 0;
  const bulb = (x, y) => { const on = (i++ + stepN) % 3 === 0; b.fillStyle = on ? C.litOn : C.bulbOff; b.fillRect(x, y, 2, 2); };
  for (let x = 1; x < W - 2; x += 6) bulb(x, 0);
  for (let y = 6; y < M - 2; y += 6) bulb(W - 2, y);
  for (let x = W - 3; x > 1; x -= 6) bulb(x, M - 2);
  for (let y = M - 8; y > 3; y -= 6) bulb(0, y);
  drawDMD(b, M);
}
// the score screen: dot-matrix orange, the 3 x 5 font at double size
function drawDMD(b, top) {
  b.save(); b.translate(0, top);
  b.fillStyle = C.dmd; b.fillRect(0, 0, W, DMD);
  let big = '0', small = '';
  if (!G) big = STR.dTitle;
  else if (G.msgT > 0) big = G.msg;
  else {
    big = fmt(G.score);
    small = ballReady() && !B.launched && !G.pulling ? STR.dReady : G.frenzy > 0 ? t('dFrenzyT', { s: Math.ceil(G.frenzy) }) : t('dBall', { n: G.ball });
  }
  if (small) {
    RDG.text(b, small, 4, 3, C.dmdLit);
    RDG.text(b, big, W - 4 - RDG.textWidth(big, 2), 9, C.dmdLit, 2);
  } else {
    const k = RDG.textWidth(big, 2) <= W - 8 ? 2 : 1;
    RDG.text(b, big, (W - RDG.textWidth(big, k)) / 2, k === 2 ? 6 : 9, C.dmdLit, k);
  }
  // the dots: a dark line between every lit pixel
  b.fillStyle = 'rgba(22,12,6,.55)';
  for (let x = 1; x < W; x += 2) b.fillRect(x, 0, 1, DMD);
  for (let y = 1; y < DMD; y += 2) b.fillRect(0, y, W, 1);
  b.restore();
}

// ---------- Fitting the screen ----------
// As big as fits. Upright, the backbox sits on top of the table and the bar
// takes its own room above both; on a wide screen the backbox stands beside
// the table, so the table gets the whole height, and the bar floats over.
function fit() {
  const bar = $('#bar').offsetHeight, wide = innerWidth > innerHeight * .9;
  wrap.classList.toggle('wide', wide);
  const s = wide ? Math.min(innerWidth * .96 / (2 * W), innerHeight / TH) : Math.min(innerWidth / W, (innerHeight - bar) / (TH + BOX));
  cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(TH * s) + 'px';
  box.style.width = Math.floor(W * s) + 'px'; box.style.height = Math.floor(BOX * s) + 'px';
  wrap.style.paddingTop = wide ? '0' : bar + 'px';
}
addEventListener('resize', fit);

// ---------- Cards ----------
const card = $('#card'), cover = $('#cover');
function showCard(html) {
  card.innerHTML = html;
  cover.hidden = false;
  const first = card.querySelector('.btn.go') || card.querySelector('button');
  if (first) first.focus();
}
const home = () => `<p class="home"><a href="../">${STR.allGames}</a></p>`;
const tableName = id => TABLES[id].str.name;
function showFiles() {
  state = 'menu'; G = null; B = null; letGoAll();
  $('#whoBtn').hidden = true;
  showCard(`<h2 id="cardTitle">${STR.title}</h2><p>${STR.intro}</p><p><b>${STR.pickFile}</b></p><div id="who"></div>${home()}`);
  SaveFiles.mount($('#who'), {
    game: KEY,
    // each table played on this file, with its best score
    summary: d => {
      const f = 'best' in d ? { pepper: d } : d;
      const played = Object.keys(TABLES).filter(id => f[id] && f[id].games);
      return played.length ? played.map(id => t('fileSum', { table: tableName(id), best: fmt(f[id].best || 0) })).join(' · ') : STR.fileNew;
    },
    onPick: (n, m) => { useFile(n, m); showTables(); },
  });
}
function how() {
  const touch = matchMedia('(pointer:coarse)').matches;
  return `<h3 class="sr">${STR.howH}</h3><ul><li>${touch ? STR.howTouch : STR.howKeys}</li><li>${STR.howPad}</li><li>${STR.howBalls}</li></ul>`;
}
// Pick a table: each is a big button with its name, a line about it and
// this file's best score on it
function showTables() {
  state = 'menu'; G = null; B = null;
  $('#whoBtn').hidden = false;
  const btns = Object.keys(TABLES).map(id => {
    const st = FILE[id], tb = TABLES[id].str;
    return `<button class="btn table go" type="button" data-do="play" data-table="${id}"><span class="tname">${tb.name}</span><span class="tblurb">${tb.blurb}</span><span class="tbest">${st && st.best ? t('tableBest', { best: fmt(st.best) }) : STR.tableNone}</span></button>`;
  }).join('');
  showCard(`<h2 id="cardTitle">${SaveFiles.esc(meName.name)}</h2><p><b>${STR.pickTable}</b></p><div class="tables">${btns}</div>${how()}
    <div class="row"><button class="btn" type="button" data-do="files">${STR.changeFile}</button></div>${home()}`);
}
function showOver(wasBest) {
  $('#whoBtn').hidden = false;
  const rows = [['statGames', S.games], ['statRamps', S.ramps], ['statStash', S.stash], ['statStashes', S.stashes], ['statSecrets', S.secrets], ['statFrenzies', S.frenzies], ['statDucks', S.ducks], ['statRows', S.rows], ['statTubs', S.tubs]];
  showCard(`<h2 id="cardTitle">${STR.overH}</h2>
    <p class="big">${fmt(G.score)}</p>
    <p>${wasBest ? `<span class="new">${STR.newBest}</span>` : t('best', { best: fmt(S.best) })}</p>
    <ul class="stats">${rows.map(([k, n]) => `<li>${t(k, { n: fmt(n) })}</li>`).join('')}</ul>
    <details><summary>${STR.howH}</summary><p>${t('howBalls')}</p></details>
    <div class="row"><button class="btn" type="button" data-do="tables">${STR.changeTable}</button><button class="btn go" type="button" data-do="play" data-table="${TB.id}">${STR.again}</button></div>${home()}`);
}
card.addEventListener('click', e => {
  const el = e.target.closest('[data-do]'), d = el && el.dataset.do;
  if (d === 'files') showFiles();
  if (d === 'tables') showTables();
  if (d === 'play') startGame(el.dataset.table);
});
function startGame(id) {
  useTable(id); S = stats(TB.id);
  cv.setAttribute('aria-label', t('canvas', { table: t('name') }));
  cover.hidden = true; card.innerHTML = '';
  $('#whoBtn').hidden = true;
  document.activeElement && document.activeElement.blur && document.activeElement.blur();
  newGame(); state = 'play'; acc = 0;
}
$('#whoBtn').onclick = () => { if (state !== 'play') showFiles(); };
$('#soundBtn').onclick = e => { SND.on = !SND.on; saveSound(); showSound(); e.currentTarget.blur(); };

// ---------- Loop ----------
let last = 0;
function loop(now) {
  requestAnimationFrame(loop);   // first, so one bad frame can't stop the game
  const dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
  frame(dt);
  drawTable(now);
}
// the table files load after this one, so start once they're in
addEventListener('DOMContentLoaded', () => {
  useTable('pepper');
  showSound();
  fit();
  showFiles();
  requestAnimationFrame(loop);
});
