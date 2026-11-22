// Ant Farm (working title, Trello #59). The oldest kid tester has always wanted
// an ant farm. Decided 22 Nov: a glass ant farm seen from the side, sky and
// grass along the top, sand below. You play one worker ant who hatches into a
// colony of just a queen and a few eggs, and you build it from there: dig,
// make rooms, bring food home, raise the brood. The learning part is a field
// notebook that fills in as you find things out, one short real fact a page
// (each one checked, 22 Nov). Real ant behaviour is the puzzle: the trash room
// has to be far from the nursery, the queen wants her room deep, and food you
// carry home leaves a scent trail the others follow.
// Randi's ask the same day: more than one kind of ant, each its own farm
// (`KINDS`). Version 1 has harvester ants and black garden ants; leafcutter,
// honeypot and army ants each need a mechanic of their own and come later.
// 8-bit like Bread and Tugboat: drawn 8 px to a square on a small canvas and
// scaled up with smoothing off.
const $ = s => document.querySelector(s);
const cv = $('#cv'), out = cv.getContext('2d');
const W = 40, H = 30, T = 8;      // the farm in squares, and a square in pixels
const SURF = 5;                    // the row ants walk along up top
const DEEP = 17;                   // rows from here down count as deep
const lo = document.createElement('canvas'); lo.width = W * T; lo.height = H * T;
const cx = lo.getContext('2d');
cx.imageSmoothingEnabled = false;
const PIX = '"Press Start 2P", monospace';

// Every number here is ours until the oldest kid tester gives his own
// (questions.md asks him). Times are seconds.
const TUNE = {
  step: .16,        // you walk one square
  antStep: .24,     // the other ants walk one square
  queenStep: .6,    // the queen walks one square
  dig: .4,          // dig one square of the top sand
  digDeep: .65,     // dig one square of the harder soil lower down
  bugSlow: 1.7,     // carrying a dead bug, every step takes this many times as long
  roomW: 5, roomH: 3,
  egg: 18,          // an egg hatches into a larva
  feeds: 2,         // food a larva needs before it can become a pupa
  larva: 10,        // a fed larva becomes a pupa
  pupa: 18,         // a pupa becomes an ant
  layAlone: 30,     // the queen lays an egg this often before she has her deep room
  layRoom: 16,      // and this often in it
  queenFat: 3,      // eggs she can lay at the start without being fed (her own fat)
  eggsPerFood: 2,   // eggs one food lets her lay
  queenFull: 6,     // she won't take food past this many eggs' worth
  broodMax: 12,     // eggs, larvae and pupae at once
  antsMax: 30,
  meal: 60,         // the colony eats from the pantry this often
  perMeal: 4,       // one food each meal for every this many ants
  husk: .5,         // chance a meal leaves a husk to throw out
  trailLife: 70,    // a scent trail nobody walks fades in this long
  trailBoost: .5,   // a worker bringing food home tops it up by this much (1 is full)
  trailsMax: 3,
  reach: 7,         // how far from the end of a trail a worker looks for food
  spotFood: 10,     // food in one place up top before it runs out
  spotPile: 3,      // food lying in one place at once
  spotEvery: 5,     // a place drops a new piece this often
  newSpot: 25,      // a new place shows up this long after one runs out
  spotsMax: 2,
  bugEvery: 40,     // a dead bug turns up this often
  trashFar: 8,      // squares the trash room must be from the nursery
  germSlow: .5,     // brood in a germy nursery grows at this speed
  digMax: 30,       // squares one digger digs in its life
  grow: 12,         // the version 1 goal
};
const VALUE = { seed: 1, crumb: 1, bug: 2 };

// ---------- Kinds of ant (Randi, 22 Nov) ----------
// Each kind is its own farm: its soil, its food up top, its ant colours and a
// notebook page of its own. Saves are per kind.
const KINDS = {
  harvester: {
    name: 'Harvester ants', blurb: 'Desert sand. They gather seeds.',
    sky: '#9fdcff', sand: ['#e8c07a', '#d8a85c', '#f2d394'], deep: ['#c98a4a', '#b5773b', '#d89a5a'],
    ant: { B: '#8e2a14', b: '#a83a1c', H: '#8e2a14' }, spots: ['seeds', 'seeds', 'crumbs'], page: 'granary', grass: '#9bbf4a',
  },
  garden: {
    name: 'Black garden ants', blurb: 'Dark garden soil. They eat crumbs and bugs.',
    sky: '#8fd3ff', sand: ['#b38a5a', '#a17a4c', '#c29a68'], deep: ['#7a5534', '#6a4a2c', '#88613c'],
    ant: { B: '#1e1410', b: '#2e2018', H: '#1e1410' }, spots: ['crumbs', 'crumbs', 'seeds'], page: 'oldQueen', grass: '#5aa742',
  },
};

// ---------- The field notebook ----------
// One real fact a page. Checked 22 Nov against AntWiki, university and
// research sources; where only some kinds of ant do it, the page says so.
// Each page opens the first time its moment happens in play.
const PAGES = [
  { k: 'workers', t: 'Sisters', pic: 'ant', f: 'Every worker ant is female. In most colonies the workers are sisters, daughters of the queen.' },
  { k: 'founding', t: 'A queen alone', pic: 'queen', f: 'In many kinds of ants, a new queen starts a colony alone. She raises her first workers without eating, living on fat in her body and her old wing muscles.' },
  { k: 'dig', t: 'Digging', pic: 'ant', f: 'Ants dig by biting off grains of soil with their jaws and carrying them away.' },
  { k: 'lift', t: 'Strong', pic: 'bug', f: 'An ant can lift things many times heavier than itself.' },
  { k: 'trail', t: 'Scent trails', pic: 'trail', f: 'In many kinds of ants, an ant that finds food leaves a scent trail on the way home. Other ants smell it and follow it to the food.' },
  { k: 'antennae', t: 'Antennae', pic: 'ant', f: 'Ants smell, touch and taste with their antennae.' },
  { k: 'fade', t: 'Fading trails', pic: 'trail', f: 'A scent trail fades unless ants keep walking it. When the food runs out, the trail disappears.' },
  { k: 'queenRoom', t: 'Deep down', pic: 'crown', f: 'The queen often stays deep in the nest, where she is safest.' },
  { k: 'mate', t: 'Years of eggs', pic: 'egg', f: 'A queen mates only on her wedding flight, then lays eggs for years.' },
  { k: 'stages', t: 'Four stages', pic: 'larva', f: 'Ants grow in four stages: egg, larva, pupa, adult.' },
  { k: 'larva', t: 'Feeding larvae', pic: 'larva', f: 'Larvae have no legs and can\'t find food. Nurse ants feed them.' },
  { k: 'pupa', t: 'Pupae', pic: 'pupa', f: 'A pupa doesn\'t eat. Inside, it changes into an adult ant. Some kinds spin a silk cocoon first.' },
  { k: 'age', t: 'Jobs', pic: 'ant', f: 'Young workers usually work inside the nest, caring for the brood. Older workers go out to find food.' },
  { k: 'soldier', t: 'Soldiers', pic: 'soldier', f: 'In some kinds of ants, soldiers are big workers with huge heads and strong jaws.' },
  { k: 'midden', t: 'The trash pile', pic: 'bin', f: 'Many ants keep a trash pile, called a midden, away from where they live, so germs don\'t spread.' },
  { k: 'clean', t: 'Keeping clean', pic: 'trash', f: 'Ants carry dead ants and trash out of the nest, and clean each other to keep germs away.' },
  { k: 'granary', t: 'Granaries', pic: 'seed', kind: 'harvester', f: 'Harvester ants store seeds in underground rooms called granaries.' },
  { k: 'oldQueen', t: 'An old queen', pic: 'queen', kind: 'garden', f: 'A black garden ant queen once lived almost 29 years in a lab.' },
];

// ---------- Saved on this device ----------
// The notebook is kept apart from the farms, so a new farm keeps its pages.
const KEY = 'ant-farm';
const S = Object.assign({ sound: true, helpSeen: false, pages: [], kind: 'harvester' }, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
const farmKey = kind => `${KEY}:farm:${kind}`;

// ---------- Sounds ----------
const tone = RDG.sound({ on: () => S.sound });
const sfx = {
  dig: () => tone(140 + Math.random() * 40, .05, 'square', 0, .03),
  pick: () => tone(520, .06, 'square', 0, .04, 780),
  drop: () => tone(600, .06, 'square', 0, .04, 380),
  feed: () => [660, 880].forEach((f, i) => tone(f, .06, 'square', i * .06, .035)),
  room: () => [196, 262, 330].forEach((f, i) => tone(f, .09, 'square', i * .07, .04)),
  hatch: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .08, 'square', i * .07, .035)),
  page: () => [988, 1319, 1568].forEach((f, i) => tone(f, .08, 'square', i * .05, .03)),
  bump: () => tone(110, .05, 'square', 0, .025),
  start: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, .08, 'square', i * .07, .04)); tone(1047, .4, 'square', .3, .03); },
};

// ---------- Pixel art ----------
// No outlines drawn by code: the ants are dark already, and the small things
// carry their own edge colour (e) so they show on the pale tunnels.
const COL = {
  k: '#1a0f08', c: '#3a2418', l: '#3a2418', m: '#5a3418', h: '#fffaf0', e: '#a8845a', p: '#f0d9a0', s: '#c8a060', S: '#8a6236',
  d: '#5a3a1e', g: '#2f5a3a', G: '#6fa77a', y: '#ffd23f', Y: '#c99a12', r: '#e04848', w: '#8c8c96', W: '#5c5c66', t: '#7a6a5a',
  B: '#1e1410', b: '#2e2018', H: '#1e1410', o: '#f6dfa6',
};
const ART = {
  ant: ['.....c.c', '......c.', 'BB.bb.HH', 'BBBbbbHH', '.l.l.l..'],
  ant2: ['.....c.c', '......c.', 'BB.bb.HH', 'BBBbbbHH', 'l.l.l.l.'],
  soldier: ['......c.c', '.......c.', 'BB.bb.HHH', 'BBBbbbHHH', '.l.l.l.mm'],
  soldier2: ['......c.c', '.......c.', 'BB.bb.HHH', 'BBBbbbHHH', 'l.l.l..mm'],
  queen: ['..........c.c.', '...........c..', '.BBBBB..bb.HHH', 'BBBBBBBbbbbHHH', 'BBBBBBB.bb.HH.', '.BBBBB........', '..l.l.l.l.l...'],
  seed: ['.ee.', 'esse', 'esSe', '.ee.'],
  crumb: ['.ee.', 'eoSe', 'eooe', '.ee.'],
  bug: ['.k.k.k.', 'kgggggk', 'kgGgGgk', '.kgggk.', '..k.k..'],
  egg: ['.ee.', 'ehhe', 'ehhe', '.ee.'],
  larva: ['..ee.', '.ehhe', 'ehhhe', '.eee.'],
  pupa: ['.ee.', 'eppe', 'eppe', 'eppe', '.ee.'],
  trash: ['t.t', '.w.', 'tWt'],
  shell: ['.e.e', 'eppe', '.e..'],
  crown: ['y.y.y', 'yyyyy', 'yrYry', 'yyyyy'],
  bin: ['WWWWW', '.www.', '.wWw.', '.www.'],
  trail: ['.y...', '..y..', '...y.', '..y..', '.y...'],
};
const spriteCache = new Map();
// rows of letters into a little canvas; rot turns it a quarter turn at a time
function sprite(name, { map = {}, flip = false, rot = 0, glow = false } = {}) {
  const key = name + JSON.stringify(map) + flip + rot + glow;
  if (spriteCache.has(key)) return spriteCache.get(key);
  let rows = ART[name].map(r => [...r]);
  const w0 = Math.max(...rows.map(r => r.length));
  rows = rows.map(r => { while (r.length < w0) r.push('.'); return flip ? r.reverse() : r; });
  for (let i = 0; i < rot; i++) {   // clockwise
    const h = rows.length, w = rows[0].length, n = [];
    for (let x = 0; x < w; x++) { n.push([]); for (let y = h - 1; y >= 0; y--) n[x].push(rows[y][x]); }
    rows = n;
  }
  const g1 = glow ? 1 : 0, h = rows.length, w = rows[0].length;
  const c = document.createElement('canvas'); c.width = w + 2 * g1; c.height = h + 2 * g1;
  const g = c.getContext('2d');
  // you: a pale edge round your ant, so you can always find yourself
  if (glow) {
    g.fillStyle = '#fff4c8';
    rows.forEach((r, y) => r.forEach((ch, x) => { if (ch !== '.') [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => g.fillRect(x + 1 + a, y + 1 + b, 1, 1)); }));
  }
  rows.forEach((r, y) => r.forEach((ch, x) => { if (ch === '.') return; g.fillStyle = map[ch] || COL[ch]; g.fillRect(x + g1, y + g1, 1, 1); }));
  spriteCache.set(key, c);
  return c;
}
const dataURL = (name, opt) => { const s = sprite(name, opt), c = document.createElement('canvas'), n = Math.max(s.width, s.height) + 2; c.width = c.height = n; c.getContext('2d').drawImage(s, (n - s.width) >> 1, (n - s.height) >> 1); return c.toDataURL(); };
const px = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); };
const put = (img, x, y) => cx.drawImage(img, Math.round(x), Math.round(y));
const hash = (x, y) => { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967296; };

// ---------- The farm ----------
const SOIL = 0, OPEN = 1, SKY = 2, TOP = 3, FRAME = 4, ROCK = 5;
let G = null, P = null, kind = KINDS[S.kind] || KINDS.harvester;
const idx = (x, y) => y * W + x;
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? FRAME : G.grid[idx(x, y)];
const walk = (x, y) => { const t = at(x, y); return t === OPEN || t === TOP; };
const diggable = (x, y) => at(x, y) === SOIL && y > SURF;
const digTime = y => y >= DEEP ? TUNE.digDeep : TUNE.dig;
const isFood = i => i.k in VALUE;
const isBrood = i => i.k === 'egg' || i.k === 'larva' || i.k === 'pupa';
const isTrash = i => i.k === 'trash' || i.k === 'shell';
const room = job => G.rooms.find(r => r.job === job);
const inRoom = (r, x, y) => r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
const roomAt = (x, y) => G.rooms.find(r => inRoom(r, x, y));
const itemsAt = (x, y) => G.items.filter(i => i.by == null && i.x === x && i.y === y);
const free = (x, y) => walk(x, y) && !itemsAt(x, y).length;
const antCount = () => G.ants.length + 1;

function newFarm(k) {
  const g = { kind: k, grid: new Uint8Array(W * H), items: [], ants: [], rooms: [], trails: [], spots: [], nid: 1, time: 0, flags: {}, goals: {}, lastMeal: 0, nextSpot: 0, nextBug: 20, hungry: false, germs: false };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    g.grid[idx(x, y)] = x === 0 || x === W - 1 || y === H - 1 ? FRAME : y < SURF ? SKY : y === SURF ? TOP : SOIL;
  // the start: a short tunnel down from the surface to the queen's first
  // little chamber, as a new queen digs it
  const ex = 20;
  for (let y = SURF + 1; y <= 8; y++) g.grid[idx(ex, y)] = OPEN;
  const first = { x: 18, y: 9, w: 5, h: 2, job: null };
  for (let y = first.y; y < first.y + first.h; y++) for (let x = first.x; x < first.x + first.w; x++) g.grid[idx(x, y)] = OPEN;
  g.rooms.push(first);
  // rocks to dig round, kept off the start
  for (let n = 0; n < 9; n++) {
    const rx = 2 + Math.floor(Math.random() * (W - 5)), ry = 8 + Math.floor(Math.random() * (H - 10)), rw = 1 + Math.floor(Math.random() * 3);
    if (Math.abs(rx - ex) < 5 && ry < 13) continue;
    for (let i = 0; i < rw; i++) if (g.grid[idx(rx + i, ry)] === SOIL) g.grid[idx(rx + i, ry)] = ROCK;
  }
  g.queen = { x: 21, y: 10, fx: 21, fy: 10, t: 1, face: 'l', path: null, fed: TUNE.queenFat, layT: 0 };
  g.player = { id: 0, x: 22, y: 10, fx: 22, fy: 10, t: 1, face: 'l', carry: null, digT: 0, digAt: -1, rec: null };
  const add = (k2, x, y) => g.items.push({ id: g.nid++, k: k2, x, y, t: 0, fed: 0, by: null, res: null });
  add('egg', 18, 10); add('egg', 19, 10); add('egg', 18, 9);
  add('shell', 22, 10);   // your own old cocoon, the first trash
  return g;
}

// ---------- Paths ----------
// Shortest walk over open squares to the first square goal(x, y) likes.
// The farm is 1,200 squares, so a search per task is cheap.
function bfs(sx, sy, goal, max = 2000) {
  const prev = new Int32Array(W * H).fill(-1), s = idx(sx, sy), q = [s];
  prev[s] = s;
  for (let i = 0; i < q.length && i < max; i++) {
    const c = q[i], x = c % W, y = (c / W) | 0;
    if (goal(x, y)) {
      const p = []; let n = c;
      while (n !== s) { p.push({ x: n % W, y: (n / W) | 0 }); n = prev[n]; }
      return p.reverse();
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (walk(nx, ny) && prev[idx(nx, ny)] < 0) { prev[idx(nx, ny)] = c; q.push(idx(nx, ny)); }
    }
  }
  return null;
}
const cellGoal = o => (x, y) => x === o.x && y === o.y;
const freeIn = r => (x, y) => inRoom(r, x, y) && free(x, y);

// ---------- Things ----------
function addItem(k, x, y, r) { const it = { id: G.nid++, k, x, y, t: 0, fed: 0, by: null, res: null }; G.items.push(it); place(it, x, y, r); return it; }
const removeItem = it => { G.items = G.items.filter(i => i !== it); };
// set something down on the nearest empty square (in the same room if it's
// put down in one). In a room it settles onto the floor; in a tunnel it stays
// where it was put, as ants leave things on the walls. Settling everywhere was
// tried first: a seed put down in a pantry with a shaft under it fell out of
// the pantry to the bottom of the shaft.
function place(it, x, y, r = roomAt(x, y)) {
  it.by = null;
  let p = free(x, y) && (!r || inRoom(r, x, y)) ? [] : bfs(x, y, (a, b) => free(a, b) && (!r || inRoom(r, a, b)), 300);
  if (!p) p = bfs(x, y, free, 600) || [];
  const c = p.length ? p[p.length - 1] : { x, y };
  it.x = c.x; it.y = c.y;
  const in_ = roomAt(it.x, it.y);
  while (in_ && inRoom(in_, it.x, it.y + 1) && walk(it.x, it.y + 1) && !itemsAt(it.x, it.y + 1).length) it.y++;
}
function pick(a, it) {
  if (!G.items.includes(it) || it.by != null || Math.abs(it.x - a.x) > 1 || Math.abs(it.y - a.y) > 1) return false;
  it.by = a.id; it.res = null; a.carry = it;
  return true;
}
function putDown(a) {
  const it = a.carry; if (!it) return;
  a.carry = null; place(it, a.x, a.y);
  if (isFood(it) && inRoom(room('pantry'), it.x, it.y)) {
    G.flags.stored = true;
    if (it.k === 'seed') unlock('granary');
  }
  // trash in the trash room goes onto one heap that keeps growing, as a real
  // midden does. Each piece of trash first took a square of its own, and a
  // full trash room left the nursery's trash with nowhere to go (found 22 Nov
  // running ten minutes of colony: germs for good).
  const tr = room('trash');
  if (isTrash(it) && inRoom(tr, it.x, it.y)) { removeItem(it); tr.pile = (tr.pile || 0) + 1; G.flags.trashed = true; unlock('clean'); }
  return it;
}
// feed a larva or the queen with the food being carried
function feed(lv, a) {
  const f = a.carry;
  if (!f || !isFood(f) || !G.items.includes(lv) || lv.k !== 'larva') return false;
  removeItem(f); a.carry = null; lv.fed += VALUE[f.k]; lv.res = null;
  if (Math.random() < TUNE.husk) addItem('trash', lv.x, lv.y);
  G.flags.fed = true; unlock('larva'); sfx.feed();
  return true;
}
const nearQueen = a => Math.abs(a.x - G.queen.x) <= 2 && Math.abs(a.y - G.queen.y) <= 1;
function feedQueen(a) {
  const f = a.carry;
  if (!f || !isFood(f) || !nearQueen(a)) return false;
  removeItem(f); a.carry = null; G.queen.fed = Math.min(TUNE.queenFull, G.queen.fed + VALUE[f.k] * TUNE.eggsPerFood);
  sfx.feed();
  return true;
}

// ---------- Moving ----------
function faceOf(dx, dy, onTop) { return dx > 0 ? 'r' : dx < 0 ? 'l' : onTop ? null : dy < 0 ? 'u' : 'd'; }
function startMove(m, x, y) {
  const f = faceOf(x - m.x, y - m.y, m.y === SURF && y === SURF);
  if (f) m.face = f;
  m.fx = m.x; m.fy = m.y; m.x = x; m.y = y; m.t = 0;
}
// returns true on the frame it reaches the square
function moveOn(m, dt, stepT) {
  if (m.t >= 1) return false;
  m.t = Math.min(1, m.t + dt / stepT);
  return m.t >= 1;
}
const stepTime = (a, base) => base * (a.carry && a.carry.k === 'bug' ? TUNE.bugSlow : 1);

// ---------- Input ----------
const held = new Set();
const KEYDIR = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] };
let lastDir = null, hold = null;
const stick = RDG.stick('#pad', '#knob');
function dirInput() {
  if (lastDir && held.has(lastDir)) return KEYDIR[lastDir];
  for (const k of held) if (KEYDIR[k]) return KEYDIR[k];
  if (stick.on && Math.hypot(stick.x, stick.y) > .35) return Math.abs(stick.x) > Math.abs(stick.y) ? [Math.sign(stick.x), 0] : [0, Math.sign(stick.y)];
  if (hold) {   // a finger or the mouse held on the farm: walk toward it
    const ax = P.x * T + T / 2, ay = P.y * T + T / 2, dx = hold.x - ax, dy = hold.y - ay;
    if (Math.hypot(dx, dy) > T * .7) return Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
  }
  return null;
}
const playing = () => screen === 'play' && $('#cover').hidden;
addEventListener('keydown', e => {
  if (screen === 'title') { if ($('#cover').hidden) { if (!e.repeat) startPressed(); e.preventDefault(); } return; }
  if (!playing()) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (KEYDIR[k]) { held.add(k); lastDir = k; if (!e.repeat && P) P.queued = KEYDIR[k]; e.preventDefault(); return; }
  if (e.repeat) return;
  if (k === ' ' || k === 'Enter') { act(); e.preventDefault(); }
  else if (k === 'r' || k === 'b') makeRoom();
  else if (k === 'n') openBook();
  else if (k === 'h' || k === '?') toggleHelp();
});
addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; held.delete(k); });
addEventListener('blur', () => held.clear());
const loPoint = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * lo.width, y: (e.clientY - r.top) / r.height * lo.height }; };
cv.addEventListener('pointerdown', e => {
  if (screen === 'title') { startPressed(); return; }
  if (!playing()) return;
  hold = loPoint(e); hold.id = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch (err) { }
});
cv.addEventListener('pointermove', e => { if (hold && e.pointerId === hold.id) Object.assign(hold, loPoint(e)); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => cv.addEventListener(ev, e => { if (hold && e.pointerId === hold.id) hold = null; }));
$('#actBtn').addEventListener('pointerdown', e => { e.preventDefault(); if (playing()) act(); });
$('#actBtn').addEventListener('click', e => { if (e.detail === 0 && playing()) act(); });   // keyboard on the button
$('#roomBtn').addEventListener('click', () => { if (playing()) makeRoom(); });
$('#bookBtn').onclick = () => { if (screen === 'play') openBook(); };
$('#helpBtn').onclick = () => toggleHelp();
$('#soundBtn').onclick = () => { S.sound = !S.sound; persist(); hud(); };
RDG.noZoom(playing, ['#pad', '#actBtn', '#roomBtn']);
RDG.pad({ a: ' ', b: 'r', x: 'n', select: 'h', start: 'Enter', stick });

// ---------- You ----------
let bumpT = 0;
function stepPlayer(dt) {
  if (moveOn(P, dt, stepTime(P, TUNE.step))) arrived();
  if (P.t < 1) return;
  // a quick tap of a key can come and go between two frames, so a tap is
  // kept (P.queued) until it has taken its step or dug its square through
  const live = dirInput(), d = live || P.queued;
  if (live && P.queued && (live[0] !== P.queued[0] || live[1] !== P.queued[1])) P.queued = null;
  if (!d) { P.digT = 0; return; }
  const nx = P.x + d[0], ny = P.y + d[1];
  if (walk(nx, ny)) { P.digT = 0; P.queued = null; startMove(P, nx, ny); return; }
  const f = faceOf(d[0], d[1], P.y === SURF); if (f) P.face = f;
  if (diggable(nx, ny)) {
    if (P.digAt !== idx(nx, ny)) { P.digAt = idx(nx, ny); P.digT = 0; }
    P.digT += dt;
    if (Math.random() < dt * 14) sfx.dig();
    if (P.digT >= digTime(ny)) { G.grid[idx(nx, ny)] = OPEN; P.digT = 0; P.queued = null; unlock('dig'); startMove(P, nx, ny); }
  } else { P.queued = null; if ((bumpT -= dt) < 0) { bumpT = .4; sfx.bump(); } }
}
// the scent trail: the way you walked home with food, loops cut out
function arrived() {
  if (!P.rec) return;
  const i = P.rec.findIndex(c => c.x === P.x && c.y === P.y);
  if (i >= 0) P.rec.length = i + 1; else P.rec.push({ x: P.x, y: P.y });
  if (nearQueen(P)) unlock('founding');
}
function nearestItem(a) {
  let best = null, bd = 9;
  for (const i of G.items) {
    if (i.by != null) continue;
    const dx = i.x - a.x, dy = i.y - a.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) continue;
    const ahead = (a.face === 'r' && dx > 0) || (a.face === 'l' && dx < 0) || (a.face === 'u' && dy < 0) || (a.face === 'd' && dy > 0);
    const d = Math.abs(dx) + Math.abs(dy) - (ahead ? .5 : 0);
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}
const hungryLarvaNear = a => G.items.find(i => i.k === 'larva' && i.by == null && i.fed < TUNE.feeds && Math.abs(i.x - a.x) <= 1 && Math.abs(i.y - a.y) <= 1);
// what the big button does right now, and its label
function actNow() {
  if (P.carry) {
    if (isFood(P.carry)) {
      const lv = hungryLarvaNear(P);
      if (lv) return { label: 'Feed', go: () => feed(lv, P) };
      if (nearQueen(P) && G.queen.fed < TUNE.queenFull) return { label: 'Feed', go: () => feedQueen(P) };
    }
    return { label: 'Put down', go: () => { const it = putDown(P); sfx.drop(); if (P.rec && isFood(it) && inRoom(room('pantry'), it.x, it.y)) makeTrail(P.rec); P.rec = null; } };
  }
  const it = nearestItem(P);
  if (it) return { label: 'Pick up', go: () => { pick(P, it); sfx.pick(); if (isFood(it)) { P.rec = P.y === SURF ? [{ x: P.x, y: P.y }] : null; if (it.k === 'bug') unlock('lift'); } } };
  return { label: 'Pick up', go: () => sfx.bump() };
}
function act() { if (P.t < 1) return; const a = actNow(); a.go(); hud(); }

// ---------- Rooms ----------
const JOBS = {
  queen: { name: "Queen's room", pic: 'crown', tint: 'rgba(255,210,63,.18)' },
  nursery: { name: 'Nursery', pic: 'egg', tint: 'rgba(255,255,255,.22)' },
  pantry: { name: 'Pantry', pic: 'seed', tint: 'rgba(200,160,96,.22)' },
  trash: { name: 'Trash room', pic: 'bin', tint: 'rgba(92,92,102,.18)' },
};
function makeRoom() {
  if (P.t < 1) return;
  const here = roomAt(P.x, P.y);
  if (here) return pickJob(here);
  if (P.y <= SURF + 1) return say('Dig down first. Rooms go underground.');
  const w = TUNE.roomW, h = TUNE.roomH;
  const x0 = Math.max(1, Math.min(W - 1 - w, P.x - (w >> 1))), y0 = P.y - (h - 1);
  if (y0 < SURF + 2) return say('Too close to the top. Dig deeper.');
  if (y0 + h > H - 1) return say('No room here. Try higher up.');
  if (G.rooms.some(r => x0 < r.x + r.w + 1 && x0 + w + 1 > r.x && y0 < r.y + r.h + 1 && y0 + h + 1 > r.y)) return say('Too close to another room.');
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (at(x, y) === SOIL) G.grid[idx(x, y)] = OPEN;
  const r = { x: x0, y: y0, w, h, job: null };
  G.rooms.push(r); sfx.room();
  pickJob(r);
}
function pickJob(r) {
  const deep = r.y + r.h - 1 >= DEEP;
  const btns = Object.entries(JOBS).map(([j, J]) => {
    const other = room(j), off = j === 'queen' && !deep;
    const sub = off ? 'Dig deeper first' : r.job === j ? 'This room' : other ? 'Move it here' : '';
    return `<button class="btn" data-job="${j}" ${off || r.job === j ? 'disabled' : ''}><img class="pic" src="${dataURL(J.pic)}" alt=""><span>${J.name}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
  }).join('');
  card(`<h2>What is this room for?</h2><div class="picks">${btns}</div>
    <div class="row"><button class="btn" id="leave">${r.job ? 'Keep it' : 'Leave it empty'}</button></div>`);
  $('#card').querySelectorAll('[data-job]').forEach(b => b.onclick = () => { setJob(r, b.dataset.job); closeCard(); });
  $('#leave').onclick = closeCard;
}
function setJob(r, j) {
  const old = room(j); if (old) old.job = null;
  r.job = j; sfx.room();
  if (j === 'queen') { G.queen.path = bfs(G.queen.x, G.queen.y, (x, y) => inRoom(r, x, y) && y === r.y + r.h - 1); unlock('queenRoom'); }
  if (j === 'trash') unlock('midden');
  say(`${JOBS[j].name}!`);
  checkGerms(); hud();
}

// ---------- The scent trail ----------
function makeTrail(rec) {
  if (rec.length < 3) return;
  const end = rec[0];
  // a new trail to the same place replaces the old one
  G.trails = G.trails.filter(t => Math.abs(t.path[0].x - end.x) > 4 || t.path[0].y !== end.y);
  G.trails.push({ path: rec.slice(), s: 1 });
  if (G.trails.length > TUNE.trailsMax) { G.trails.sort((a, b) => b.s - a.s); G.trails.length = TUNE.trailsMax; }
  unlock('trail'); say('A scent trail! The others can follow it.');
}
function stepTrails(dt) {
  for (const t of G.trails) t.s -= dt / TUNE.trailLife;
  const before = G.trails.length;
  G.trails = G.trails.filter(t => t.s > 0);
  if (G.trails.length < before) unlock('fade');
}

// ---------- The other ants ----------
// Each one picks a task by its job, as a list of steps: walk somewhere
// (goal), walk a path (path), wait, dig a square, or do something (fn; false
// means give up). A task that can't go on is dropped, and whatever the ant
// carries is put down where it stands.
function stepAnt(a, dt) {
  moveOn(a, dt, stepTime(a, TUNE.antStep));
  if (a.t < 1) return;
  if (a.path && a.path.length) {
    const n = a.path.shift();
    if (walk(n.x, n.y)) startMove(a, n.x, n.y); else giveUp(a);
    return;
  }
  if (a.dig) {
    if (!diggable(a.dig.x, a.dig.y)) { if (walk(a.dig.x, a.dig.y)) startMove(a, a.dig.x, a.dig.y); a.dig = null; return; }
    if ((a.dig.t += dt) >= digTime(a.dig.y)) { G.grid[idx(a.dig.x, a.dig.y)] = OPEN; a.dug++; startMove(a, a.dig.x, a.dig.y); a.dig = null; }
    return;
  }
  if (a.wait > 0) { a.wait -= dt; return; }
  if (!a.steps.length) { a.steps = plan(a); if (!a.steps.length) { a.wait = 1 + Math.random(); return; } }
  const s = a.steps.shift();
  if (s.goal) { const p = bfs(a.x, a.y, s.goal); if (p) a.path = p; else giveUp(a); }
  else if (s.path) a.path = s.path.slice();
  else if (s.wait) a.wait = s.wait;
  else if (s.dig) a.dig = { ...s.dig, t: 0 };
  else if (s.fn && s.fn() === false) giveUp(a);
}
function giveUp(a) {
  a.steps = []; a.path = null; a.dig = null; a.wait = 1;
  if (a.carry) putDown(a);
  G.items.forEach(i => { if (i.res === a.id) i.res = null; });
}
const doors = () => { const d = []; for (let x = 1; x < W - 1; x++) if (walk(x, SURF + 1)) d.push({ x, y: SURF + 1 }); return d; };
const anyOf = list => list[Math.floor(Math.random() * list.length)];
function carryTo(a, it, goal, then) {
  it.res = a.id;
  return [{ goal: cellGoal(it) }, { fn: () => pick(a, it) }, { goal }, { fn: then || (() => { putDown(a); return true; }) }];
}
function trashJob(a) {
  const tr = room('trash');
  const t = tr && G.items.find(i => isTrash(i) && i.by == null && i.res == null && !inRoom(tr, i.x, i.y));
  return t ? carryTo(a, t, (x, y) => inRoom(tr, x, y)) : null;
}
function plan(a) {
  const nur = room('nursery'), pan = room('pantry');
  const foodIn = r => G.items.find(i => isFood(i) && i.by == null && i.res == null && inRoom(r, i.x, i.y));
  if (a.job === 'nurse') {
    if (nur) {
      const b = G.items.find(i => isBrood(i) && i.by == null && i.res == null && !inRoom(nur, i.x, i.y));
      if (b) return carryTo(a, b, freeIn(nur));
      const t = G.items.find(i => isTrash(i) && i.by == null && i.res == null && inRoom(nur, i.x, i.y));
      if (t && room('trash')) return carryTo(a, t, (x, y) => inRoom(room('trash'), x, y));
    }
    if (pan) {
      const lv = G.items.find(i => i.k === 'larva' && i.by == null && i.res == null && i.fed < TUNE.feeds);
      const f = foodIn(pan);
      if (lv && f) { lv.res = a.id; return carryTo(a, f, (x, y) => Math.abs(x - lv.x) <= 1 && y === lv.y, () => feed(lv, a)); }
      if (f && G.queen.fed < 1 && !G.hungry) return carryTo(a, f, (x, y) => nearQueen({ x, y }), () => feedQueen(a));
    }
    const r = nur || room('queen') || G.rooms[0];
    return [{ goal: (x, y) => inRoom(r, x, y) && Math.random() < .2 }, { wait: 2 + Math.random() * 2 }];
  }
  if (a.job === 'worker') {
    // a full pantry: no foraging until there's room (found 22 Nov: workers
    // who couldn't put food away left seeds all along the shaft)
    const room4 = pan && (() => { for (let y = pan.y; y < pan.y + pan.h; y++) for (let x = pan.x; x < pan.x + pan.w; x++) if (free(x, y)) return true; return false; })();
    if (pan && room4 && G.trails.length) {
      const tr = G.trails.reduce((b, t) => Math.random() * (b.s + t.s) < t.s ? t : b);
      const p = tr.path, end = p[0], home = p[p.length - 1];
      return [{ goal: cellGoal(home) }, { path: p.slice(0, -1).reverse() }, {
        fn: () => {
          unlock('antennae');
          let f = null, fd = TUNE.reach + 1;
          for (const i of G.items) if (isFood(i) && i.by == null && i.res == null && i.y === SURF && Math.abs(i.x - end.x) < fd) { fd = Math.abs(i.x - end.x); f = i; }
          if (!f) { a.steps = [{ goal: cellGoal(home) }, { wait: 2 }]; return true; }   // nothing there: home empty-handed, the trail isn't topped up
          a.steps = [...carryTo(a, f, cellGoal(end), () => true), { path: p.slice(1) },
            { fn: () => { tr.s = Math.min(1, tr.s + TUNE.trailBoost); return true; } }, { goal: freeIn(pan) }, { fn: () => { putDown(a); return true; } }];
          return true;
        },
      }];
    }
    const tj = trashJob(a); if (tj) return tj;
    const d = doors(); if (!d.length) return [];
    return [{ goal: cellGoal(anyOf(d)) }, { wait: 3 + Math.random() * 3 }];
  }
  if (a.job === 'digger') {
    if (a.dug < TUNE.digMax) {
      for (let tries = 0; tries < 25; tries++) {
        const x = 1 + Math.floor(Math.random() * (W - 2)), y = SURF + 2 + Math.floor(Math.random() * (H - SURF - 4));
        if (at(x, y) !== OPEN || roomAt(x, y)) continue;
        const [dx, dy] = anyOf([[1, 0], [-1, 0], [0, 1]]), len = 3 + Math.floor(Math.random() * 3), line = [];
        for (let i = 1; i <= len; i++) {
          const cx2 = x + dx * i, cy2 = y + dy * i;
          if (!diggable(cx2, cy2) || cy2 < SURF + 2 || cy2 > H - 3 || G.rooms.some(r => cx2 >= r.x - 1 && cx2 <= r.x + r.w && cy2 >= r.y - 1 && cy2 <= r.y + r.h)) break;
          line.push({ x: cx2, y: cy2 });
        }
        if (line.length >= 2) return [{ goal: cellGoal({ x, y }) }, ...line.map(c => ({ dig: c }))];
      }
    }
    return trashJob(a) || [{ wait: 3 }];
  }
  // soldier: guard the door, step out to look round, come back
  const d = doors(); if (!d.length) return [{ wait: 3 }];
  const door = anyOf(d), sx = Math.max(1, Math.min(W - 2, door.x + Math.round(Math.random() * 6 - 3)));
  return [{ goal: cellGoal(door) }, { wait: 4 + Math.random() * 4 }, { goal: cellGoal({ x: sx, y: SURF }) }, { wait: 2 }];
}
// what job a new ant gets: what the colony needs most, nurses first. The
// shares are ours; real workers mostly change jobs as they get older.
const SHARE = { nurse: .3, worker: .4, digger: .15, soldier: .15 };
function jobFor() {
  const n = { nurse: 0, worker: 0, digger: 0, soldier: 0 }; G.ants.forEach(a => n[a.job]++);
  if (!n.nurse) return 'nurse';
  if (!n.worker) return 'worker';
  const all = G.ants.length + 1;
  return Object.keys(SHARE).reduce((b, j) => SHARE[j] * all - n[j] > SHARE[b] * all - n[b] ? j : b);
}

// ---------- The queen and the brood ----------
function stepQueen(dt) {
  const q = G.queen;
  if (moveOn(q, dt, TUNE.queenStep)) { }
  if (q.t >= 1 && q.path && q.path.length) { const n = q.path.shift(); if (walk(n.x, n.y)) startMove(q, n.x, n.y); else q.path = null; }
  const qr = room('queen'), home = qr && inRoom(qr, q.x, q.y);
  q.layT += dt;
  const brood = G.items.filter(isBrood).length;
  if (q.t >= 1 && !(q.path && q.path.length) && q.fed >= 1 && !G.hungry && brood < TUNE.broodMax && q.layT >= (home ? TUNE.layRoom : TUNE.layAlone)) {
    q.layT = 0; q.fed--; addItem('egg', q.x, q.y);
    if (home) unlock('mate');
  }
}
function stepBrood(dt) {
  const nur = room('nursery');
  for (const it of [...G.items]) {
    if (!isBrood(it) || it.by != null) continue;
    const rate = G.germs && inRoom(nur, it.x, it.y) ? TUNE.germSlow : 1;
    if (it.k === 'egg' && (it.t += dt * rate) >= TUNE.egg) { it.k = 'larva'; it.t = 0; unlock('stages'); }
    else if (it.k === 'larva' && it.fed >= TUNE.feeds && (it.t += dt * rate) >= TUNE.larva) { it.k = 'pupa'; it.t = 0; unlock('pupa'); }
    else if (it.k === 'pupa' && antCount() < TUNE.antsMax && (it.t += dt * rate) >= TUNE.pupa) hatch(it);
  }
}
function hatch(it) {
  const job = jobFor();
  removeItem(it);
  G.ants.push({ id: G.nid++, x: it.x, y: it.y, fx: it.x, fy: it.y, t: 1, face: 'r', job, carry: null, steps: [], path: null, dig: null, wait: 1, dug: 0 });
  addItem('shell', it.x, it.y);
  sfx.hatch(); unlock('age');
  if (job === 'soldier') unlock('soldier');
  say(`A new ${job === 'worker' ? 'worker' : job} hatched!`);
}
// germs: trash lying in the nursery, or a trash room too close to it
function checkGerms() {
  const nur = room('nursery'), tr = room('trash');
  let g = false;
  if (nur) {
    if (G.items.some(i => isTrash(i) && i.by == null && inRoom(nur, i.x, i.y))) g = true;
    if (tr) {
      const gapX = Math.max(0, tr.x - (nur.x + nur.w - 1), nur.x - (tr.x + tr.w - 1));
      const gapY = Math.max(0, tr.y - (nur.y + nur.h - 1), nur.y - (tr.y + tr.h - 1));
      if (Math.max(gapX, gapY) < TUNE.trashFar) g = true;
    }
  }
  if (g && !G.germs) say('Germs in the nursery! The brood grows slowly.');
  if (g) unlock('clean');
  G.germs = g;
}
// the colony eats from the pantry. Before there's a pantry there's nothing
// to eat from, so meals start with it.
function stepMeals() {
  const pan = room('pantry');
  if (!pan) { G.lastMeal = G.time; return; }
  if (G.time - G.lastMeal < TUNE.meal) return;
  G.lastMeal = G.time;
  let need = Math.ceil(antCount() / TUNE.perMeal);
  for (const i of [...G.items]) if (need > 0 && isFood(i) && i.by == null && inRoom(pan, i.x, i.y)) { removeItem(i); need--; if (Math.random() < TUNE.husk) addItem('trash', i.x, i.y, pan); }
  const was = G.hungry; G.hungry = need > 0;
  if (G.hungry && !was) say('The colony is hungry. The queen stops laying.');
}

// ---------- Up top ----------
// Food turns up in places (a seed plant, a dropped cookie) and runs out;
// a dead bug turns up now and then. A trail to a place that has run out fades.
function stepTop(dt) {
  const near = s => G.items.filter(i => i.by == null && i.y === SURF && Math.abs(i.x - s.x) <= 2);
  for (const s of G.spots) {
    s.t += dt;
    if (s.left > 0 && s.t >= TUNE.spotEvery && near(s).length < TUNE.spotPile) {
      s.t = 0; s.left--;
      const x = Math.max(1, Math.min(W - 2, s.x + Math.round(Math.random() * 4 - 2)));
      if (at(x, SURF + 1) === SOIL) addItem(s.kind === 'seeds' ? 'seed' : 'crumb', x, SURF);
    }
  }
  const gone = G.spots.filter(s => s.left <= 0 && !near(s).length);
  if (gone.length) { G.spots = G.spots.filter(s => !gone.includes(s)); G.nextSpot = G.time + TUNE.newSpot; }
  if (G.spots.length < TUNE.spotsMax && G.time >= G.nextSpot) {
    const taken = [...G.spots.map(s => s.x), ...doors().map(d => d.x)];
    for (let tries = 0; tries < 20; tries++) {
      const x = 3 + Math.floor(Math.random() * (W - 6));
      if (taken.every(t => Math.abs(t - x) > 6)) { G.spots.push({ x, kind: anyOf(kind.spots), left: TUNE.spotFood, t: TUNE.spotEvery }); break; }
    }
    G.nextSpot = G.time + TUNE.newSpot;
  }
  if (G.time >= G.nextBug) {
    G.nextBug = G.time + TUNE.bugEvery;
    if (!G.items.some(i => i.k === 'bug' && i.y === SURF)) { const x = 2 + Math.floor(Math.random() * (W - 4)); if (at(x, SURF + 1) === SOIL) addItem('bug', x, SURF); }
  }
}

// ---------- Goals ----------
// In order; the first one not done is what the ? help says, and it shows for
// a few seconds when it changes. Once done, a goal stays done.
const GOALS = [
  { id: 'dig', text: 'Dig down deep. Walk into the sand to dig.', done: () => { for (let x = 1; x < W - 1; x++) for (let y = DEEP; y < H - 1; y++) if (at(x, y) === OPEN) return true; return false; } },
  { id: 'queen', text: "Make the queen's room deep down.", done: () => !!room('queen') },
  { id: 'nursery', text: 'Make a nursery and carry the eggs to it.', done: () => { const n = room('nursery'); return n && G.items.some(i => isBrood(i) && i.by == null && inRoom(n, i.x, i.y)); } },
  { id: 'pantry', text: 'Make a pantry. Bring food home from up top.', done: () => !!G.flags.stored },
  { id: 'feed', text: 'Feed a larva.', done: () => !!G.flags.fed },
  { id: 'trash', text: 'Make a trash room far from the nursery. Take the trash there.', done: () => G.flags.trashed && !G.germs },
  { id: 'grow', text: `Grow the colony to ${TUNE.grow} ants.`, done: () => antCount() >= TUNE.grow },
];
let goalShown = null;
function goalNow() { const g = GOALS.find(g => !G.goals[g.id]); return g ? g.text : 'Keep the colony fed, and fill your notebook.'; }
function checkGoals() {
  for (const g of GOALS) if (!G.goals[g.id] && g.done()) G.goals[g.id] = true;
  const t = goalNow();
  if (t !== goalShown) { goalShown = t; say(t, 5); }
  if (G.goals.grow && !G.flags.grown) {
    G.flags.grown = true;
    card(`<h2>Your colony is growing!</h2><p>${antCount()} ants, and the queen is still laying. Keep it fed, and find every notebook page.</p>
      <div class="row"><button class="btn" id="cbook">Notebook</button><button class="btn go" id="cgo">Keep playing</button></div>`);
    $('#cbook').onclick = () => { closeCard(); openBook(); }; $('#cgo').onclick = closeCard;
  }
  $('#goalNow').textContent = t;
}

// ---------- Messages, cards, notebook ----------
let msgT = 0;
function say(t, secs = 3) { const m = $('#msg'); m.textContent = t; m.hidden = false; msgT = secs; }
function card(html) { $('#card').innerHTML = html; $('#cover').hidden = false; held.clear(); hold = null; stick.letGo(); setTimeout(() => { const b = $('#card').querySelector('button:not([disabled])'); if (b) b.focus(); }, 0); }
function closeCard() { $('#cover').hidden = true; cv.focus?.(); }
const pagesHere = () => PAGES.filter(p => !p.kind || p.kind === G.kind);
function unlock(k) {
  const p = PAGES.find(p => p.k === k);
  if (!p || (p.kind && p.kind !== G?.kind) || S.pages.includes(k)) return;
  S.pages.push(k); persist(); sfx.page(); say('New notebook page!'); hud();
}
let bookAt = 0;
function openBook(go) {
  const found = pagesHere().filter(p => S.pages.includes(p.k)), left = pagesHere().length - found.length;
  if (!found.length) { card(`<h2>Field notebook</h2><p>Nothing in it yet. Pages fill in as you find things out.</p><div class="row"><button class="btn go" id="bclose">Close</button></div>`); $('#bclose').onclick = closeCard; return; }
  if (go === undefined) bookAt = found.length - 1;
  bookAt = (bookAt + found.length) % found.length;
  const p = found[bookAt], pic = p.pic === 'ant' ? dataURL('ant', { map: kind.ant }) : p.pic === 'queen' || p.pic === 'soldier' ? dataURL(p.pic, { map: kind.ant }) : dataURL(p.pic);
  card(`<h2>Field notebook</h2><div class="page"><img class="pic" src="${pic}" alt=""><div><h3>${p.t}</h3><p>${p.f}</p></div></div>
    <p class="soft">Page ${bookAt + 1} of ${found.length}${left ? ` · ${left} still to find` : ' · every page found'}</p>
    <div class="row"><button class="btn" id="bclose">Close</button>${found.length > 1 ? '<button class="btn" id="bback">Back</button><button class="btn go" id="bnext">Next</button>' : ''}</div>`);
  $('#bclose').onclick = closeCard;
  if (found.length > 1) { $('#bback').onclick = () => { bookAt--; openBook(1); $('#bback').focus(); }; $('#bnext').onclick = () => { bookAt++; openBook(1); $('#bnext').focus(); }; }
}
function toggleHelp(show) {
  if (screen !== 'play') return;
  const h = $('#help'); h.hidden = show === undefined ? !h.hidden : !show;
  $('#helpBtn').setAttribute('aria-expanded', String(!h.hidden));
  if (!h.hidden && !S.helpSeen) { S.helpSeen = true; persist(); }
}
function hud() {
  $('#soundBtn').textContent = S.sound ? '🔔' : '🔕';
  if (!G || screen !== 'play') return;
  const pan = room('pantry'), food = pan ? G.items.filter(i => isFood(i) && i.by == null && inRoom(pan, i.x, i.y)).length : 0;
  // the long label on wide screens, a picture and the number on a phone
  const pill = (sel, ico, lbl, n) => { const e = $(sel), full = `${lbl} ${n}`; if (e.getAttribute('aria-label') === full) return; e.setAttribute('aria-label', full); e.innerHTML = `<span class="ico" aria-hidden="true">${ico} </span><span class="lbl" aria-hidden="true">${lbl} </span><span aria-hidden="true">${n}</span>`; };
  pill('#hAnts', '🐜', 'Ants', antCount());
  pill('#hFood', G.hungry ? '⚠️' : '🌾', G.hungry ? 'Hungry!' : 'Food', G.hungry ? '' : food);
  pill('#bookBtn', '📓', 'Notebook', `${pagesHere().filter(p => S.pages.includes(p.k)).length}/${pagesHere().length}`);
  const n = { nurse: 0, worker: 0, digger: 0, soldier: 0 }; G.ants.forEach(a => n[a.job]++);
  $('#jobs').textContent = `You, ${n.worker} worker${n.worker === 1 ? '' : 's'}, ${n.nurse} nurse${n.nurse === 1 ? '' : 's'}, ${n.digger} digger${n.digger === 1 ? '' : 's'}, ${n.soldier} soldier${n.soldier === 1 ? '' : 's'}.`;
}

// ---------- Saving ----------
function save() {
  if (!G || screen !== 'play') return;
  const items = G.items.map(i => i.by != null ? { ...i, by: null, res: null } : { ...i, res: null });
  const strip = a => ({ ...a, carry: null, steps: [], path: null, dig: null, rec: null, queued: null });
  const g = { ...G, grid: Array.from(G.grid).join(''), items, ants: G.ants.map(strip), player: strip(P), queen: { ...G.queen, path: null } };
  try { localStorage.setItem(farmKey(G.kind), JSON.stringify(g)); } catch (e) { }
}
function load(k) {
  try {
    const g = JSON.parse(localStorage.getItem(farmKey(k)));
    if (!g) return null;
    g.grid = Uint8Array.from(g.grid, ch => +ch);
    g.queen.t = g.player.t = 1; g.queen.fx = g.queen.x; g.queen.fy = g.queen.y;
    g.ants.forEach(a => { a.t = 1; a.fx = a.x; a.fy = a.y; a.wait = 1; });
    g.player.fx = g.player.x; g.player.fy = g.player.y;
    return g;
  } catch (e) { return null; }
}
setInterval(save, 5000);
addEventListener('pagehide', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

// ---------- Screens ----------
let screen = 'title';
function startPressed() {
  if (screen !== 'title' || !$('#cover').hidden) return;
  sfx.start();
  const kinds = Object.entries(KINDS).map(([k, K]) => {
    const has = !!localStorage.getItem(farmKey(k));
    return `<button class="btn" data-kind="${k}"><img class="pic" src="${dataURL('ant', { map: K.ant })}" alt=""><span>${K.name}<small>${K.blurb}${has ? ' Your farm is saved.' : ''}</small></span></button>`;
  }).join('');
  card(`<h2>Pick your ants</h2><p>Each kind lives in its own farm.</p><div class="picks">${kinds}</div>`);
  $('#card').querySelectorAll('[data-kind]').forEach(b => b.onclick = () => chooseKind(b.dataset.kind));
}
function chooseKind(k) {
  if (!localStorage.getItem(farmKey(k))) return play(k, null);
  card(`<h2>${KINDS[k].name}</h2><p>Keep going with your farm, or start a new one? A new farm keeps your notebook.</p>
    <div class="row"><button class="btn" id="fresh">New farm</button><button class="btn go" id="keep">Keep going</button></div>`);
  $('#keep').onclick = () => play(k, load(k));
  $('#fresh').onclick = () => {
    card(`<h2>Start a new farm?</h2><p>The ${KINDS[k].name.toLowerCase()} farm you have now will be gone. Your notebook stays.</p>
      <div class="row"><button class="btn" id="no">Cancel</button><button class="btn go" id="yes">New farm</button></div>`);
    $('#no').onclick = () => chooseKind(k); $('#yes').onclick = () => play(k, null);
  };
}
function play(k, saved) {
  S.kind = k; persist(); kind = KINDS[k];
  G = saved || newFarm(k); P = G.player;
  screen = 'play'; closeCard(); goalShown = null;
  ['#hAnts', '#hFood', '#bookBtn', '#helpBtn', '#ctrl'].forEach(s => $(s).hidden = false);
  unlock('workers');
  if (!S.helpSeen) toggleHelp(true);
  checkGoals(); hud(); resize();
}

// ---------- Drawing ----------
function drawFarm(time) {
  const k = KINDS[G.kind];
  // sky, sun, clouds
  px(0, 0, lo.width, (SURF + 1) * T, k.sky);
  px(30, 8, 12, 12, '#ffe680'); px(32, 6, 8, 16, '#ffe680'); px(28, 10, 16, 8, '#ffe680');
  for (const [cx0, cy0] of [[90, 12], [210, 8], [290, 18]]) {
    const ox = (cx0 + time * 3) % (lo.width + 40) - 20;
    px(ox, cy0, 22, 5, '#ffffff'); px(ox + 5, cy0 - 3, 11, 3, '#ffffff');
  }
  // soil, rocks and tunnels
  for (let y = SURF + 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const t = at(x, y), X = x * T, Y = y * T;
    if (t === SOIL || t === ROCK) {
      const deep = y > DEEP || (y === DEEP && hash(x, 7) < .5), pal = deep ? k.deep : k.sand;
      px(X, Y, T, T, pal[0]);
      for (let i = 0; i < 5; i++) px(X + Math.floor(hash(x * 7 + i, y) * T), Y + Math.floor(hash(x, y * 5 + i) * T), 1, 1, pal[1 + (i & 1)]);
      if (t === ROCK) { px(X + 1, Y + 1, 6, 6, '#8c8c96'); px(X, Y + 2, 8, 4, '#8c8c96'); px(X + 2, Y + 2, 3, 2, '#b4b4bc'); px(X + 1, Y + 6, 6, 1, '#5c5c66'); }
    } else if (t === OPEN) {
      px(X, Y, T, T, '#f2e2bc');
      const edge = '#8a6236';
      if (!walk(x, y - 1)) px(X, Y, T, 1, edge);
      if (!walk(x, y + 1)) px(X, Y + T - 1, T, 1, '#c9a46a');
      if (!walk(x - 1, y)) px(X, Y, 1, T, edge);
      if (!walk(x + 1, y)) px(X + T - 1, Y, 1, T, edge);
    }
  }
  // rooms: a light wash and a little sign in the corner
  for (const r of G.rooms) {
    if (!r.job) continue;
    cx.fillStyle = JOBS[r.job].tint; cx.fillRect(r.x * T + 1, r.y * T + 1, r.w * T - 2, r.h * T - 2);
    put(sprite(JOBS[r.job].pic), r.x * T + 2, r.y * T + 2);
  }
  // the trash heap: wider and taller as it grows, up to the room's size
  for (const r of G.rooms) {
    if (!r.pile) continue;
    const bottom = (r.y + r.h) * T - 1, mid = (r.x + r.w / 2) * T, hgt = Math.min(r.h * T - 10, 2 + Math.floor(Math.sqrt(r.pile) * 3));
    for (let i = 0; i < hgt; i++) { const half = Math.min(r.w * T / 2 - 2, 3 + (hgt - i) * 1.6); px(mid - half, bottom - i, half * 2, 1, i % 3 ? '#7a6a5a' : '#5c5c66'); }
    for (let i = 0; i < Math.min(12, r.pile); i++) px(mid - 8 + hash(i, r.x) * 16, bottom - hash(r.y, i) * hgt, 1, 1, '#c8a060');
  }
  if (G.germs) { const n = room('nursery'); if (n) for (let i = 0; i < 3; i++) { const gx = n.x * T + 8 + i * 12, gy = n.y * T + 2 + Math.round(Math.sin(time * 3 + i) * 2); px(gx, gy, 2, 2, '#7fbf3f'); px(gx + 3, gy - 2, 1, 1, '#7fbf3f'); } }
  // grass along the top, a little mound at each door
  for (let x = 1; x < W - 1; x++) {
    const X = x * T, Y = (SURF + 1) * T;
    if (walk(x, SURF + 1)) { px(X - 2, Y - 2, 3, 2, k.sand[1]); px(X + T - 1, Y - 2, 3, 2, k.sand[1]); continue; }
    px(X, Y - 1, T, 1, k.grass);
    for (let i = 0; i < 3; i++) { const gx = X + Math.floor(hash(x, i) * T), h = 2 + Math.floor(hash(i, x) * 3); px(gx, Y - h, 1, h, k.grass); }
  }
  // the places food turns up
  for (const s of G.spots) {
    const X = s.x * T + 3, Y = (SURF + 1) * T;
    if (s.kind === 'seeds') { px(X, Y - 18, 1, 18, '#5a8a32'); px(X - 2, Y - 22, 5, 5, s.left ? '#c8a060' : '#8a7a5a'); px(X - 4, Y - 10, 4, 1, '#5a8a32'); px(X + 1, Y - 13, 4, 1, '#5a8a32'); }
    else if (s.left) { px(X - 5, Y - 4, 11, 4, '#d9a25a'); px(X - 4, Y - 5, 9, 1, '#d9a25a'); px(X - 2, Y - 3, 2, 1, '#6a3a1a'); px(X + 2, Y - 2, 2, 1, '#6a3a1a'); }
  }
  // scent trails: dots that fade as the trail does
  for (const tr of G.trails) {
    cx.globalAlpha = .25 + .55 * tr.s;
    tr.path.forEach((c, i) => { if (i % 2 === 0) px(c.x * T + 3, c.y * T + (c.y === SURF ? 6 : 4), 2, 1, '#ff9f1f'); });
    cx.globalAlpha = 1;
  }
  // things lying about
  for (const it of G.items) {
    if (it.by != null) continue;
    const s = sprite(it.k);
    put(s, it.x * T + ((T - s.width) >> 1), it.y * T + T - s.height);
    if (it.k === 'larva' && it.fed < TUNE.feeds && Math.floor(time * 2) % 2) px(it.x * T + 3, it.y * T + T - s.height - 2, 2, 1, '#e04848');
  }
  drawAnt(G.queen, 'queen', time);
  for (const a of G.ants) drawAnt(a, a.job === 'soldier' ? 'soldier' : 'ant', time);
  drawAnt(P, 'ant', time, true);
  if (P.digT > 0) { const d = dirInput(); if (d) for (let i = 0; i < 2; i++) px((P.x + d[0]) * T + Math.random() * T, (P.y + d[1]) * T + Math.random() * T, 1, 1, '#fff4c8'); }
  // the frame and the glass
  px(0, 0, T, lo.height, '#6b4a2a'); px(lo.width - T, 0, T, lo.height, '#6b4a2a'); px(0, lo.height - T, lo.width, T, '#6b4a2a');
  px(2, 0, 1, lo.height - T, '#8a6236'); px(lo.width - 6, 0, 1, lo.height - T, '#8a6236'); px(T, lo.height - T + 2, lo.width - 2 * T, 1, '#8a6236');
  cx.globalAlpha = .12; cx.fillStyle = '#ffffff';
  for (const [a, w] of [[40, 6], [52, 2], [220, 4]]) { cx.beginPath(); cx.moveTo(a, T * 6); cx.lineTo(a + w, T * 6); cx.lineTo(a + w - 60, lo.height - T); cx.lineTo(a - 60, lo.height - T); cx.fill(); }
  cx.globalAlpha = 1;
}
function drawAnt(a, art, time, you) {
  const k = KINDS[G.kind], moving = a.t < 1;
  const x = (a.fx + (a.x - a.fx) * a.t) * T, y = (a.fy + (a.y - a.fy) * a.t) * T;
  const frame = moving && Math.floor(time * 10) % 2 && ART[art + '2'] ? art + '2' : art;
  const rot = { r: 0, d: 1, l: 0, u: 3 }[a.face] || 0;
  const s = sprite(frame, { map: k.ant, flip: a.face === 'l', rot, glow: you });
  const sx = x + ((T - s.width) >> 1), sy = rot % 2 ? y + ((T - s.height) >> 1) : y + T - s.height + (you ? 1 : 0);
  put(s, sx, sy);
  if (a.carry) {
    const c = sprite(a.carry.k);
    const hx = a.face === 'r' ? sx + s.width - 2 : a.face === 'l' ? sx + 2 - c.width : sx + ((s.width - c.width) >> 1);
    const hy = a.face === 'u' ? sy - c.height + 2 : a.face === 'd' ? sy + s.height - 2 : sy - c.height + 3;
    put(c, hx, hy);
  }
}
function drawTitle(time) {
  drawFarm(time);
  cx.fillStyle = 'rgba(30,20,10,.45)'; cx.fillRect(0, 0, lo.width, lo.height);
  cx.textAlign = 'center';
  cx.font = `20px ${PIX}`; cx.fillStyle = '#2a1a10'; cx.fillText('ANT FARM', lo.width / 2 + 2, 92);
  cx.fillStyle = '#ffd23f'; cx.fillText('ANT FARM', lo.width / 2, 90);
  if (Math.floor(time * 2) % 2 && $('#cover').hidden) { cx.font = `8px ${PIX}`; cx.fillStyle = '#fff8ea'; cx.fillText('PRESS START', lo.width / 2, 150); }
  // an ant marching across the grass
  const ax = (time * 30) % (lo.width + 20) - 10;
  put(sprite(Math.floor(time * 10) % 2 ? 'ant2' : 'ant', { map: kind.ant }), ax, (SURF + 1) * T - 5);
}

// ---------- Screen size ----------
// The farm fits the window; on a touch screen it leaves room for the stick and
// buttons (below it held upright, beside it turned sideways).
function resize() {
  const coarse = matchMedia('(pointer:coarse)').matches, sideways = innerWidth > innerHeight, ctl = coarse && screen === 'play';
  const room2 = { w: innerWidth - (ctl && sideways ? 2 * 11 * 16 : 0) - 8, h: innerHeight - 56 - (ctl && !sideways ? 11 * 16 : 0) };
  let w = room2.w, h = w * lo.height / lo.width; if (h > room2.h) { h = room2.h; w = h * lo.width / lo.height; }
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
}
addEventListener('resize', resize);

// ---------- Main loop ----------
// One bad frame mustn't stop the game (found in Mission Directive, 16 Nov).
let last = 0, slow = 0;
function step(dt) {
  G.time += dt;
  stepPlayer(dt);
  for (const a of G.ants) stepAnt(a, dt);
  stepQueen(dt); stepBrood(dt); stepTop(dt); stepTrails(dt); stepMeals();
  if ((slow += dt) > .5) { slow = 0; checkGerms(); checkGoals(); hud(); }
  if (msgT > 0 && (msgT -= dt) <= 0) $('#msg').hidden = true;
  const a = actNow(); if ($('#actBtn').textContent !== a.label) $('#actBtn').textContent = a.label;
}
function loop(t) {
  const dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
  try {
    if (screen === 'title') drawTitle(t / 1000);
    else { if ($('#cover').hidden) step(dt); drawFarm(t / 1000); }
    out.imageSmoothingEnabled = false;
    out.drawImage(lo, 0, 0, cv.width, cv.height);
  } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}
G = newFarm(S.kind in KINDS ? S.kind : 'harvester'); P = G.player;
G.spots.push({ x: 8, kind: 'seeds', left: 3, t: 0 }, { x: 32, kind: 'crumbs', left: 3, t: 0 });
hud(); resize();
requestAnimationFrame(loop);
