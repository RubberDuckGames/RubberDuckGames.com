// Pixels of Life (Trello #54). A first foundation: a grid world with food, a
// builder for a few cell types (his storage and bone cells among them), and
// creatures that eat, move, use energy, have babies and die.

// ---------------------------------------------------------------------------
// Cell stats: one row per cell, so they can be tuned in one place.
// upkeep = energy it uses every tick; holds = energy it can store;
// push = how much a mover moves the creature; room = extra cells a bone allows.
// Decided 20 Nov (his answers): storage holds energy so the creature lasts
// longer without food; bone is the inside frame that lets the creature grow
// bigger, and armor is the outside protection.
// Decided 20 Nov (his rule): when a killer cell touches another creature, that
// creature takes damage (energy lost each tick, `damage`), and armor stops it:
// a killer touching only armor does nothing. Killers don't hurt their own
// creature. His answer the same day: the killer gets the energy it takes (no
// more than the other creature had left, and up to what the killer can hold),
// so a killer can live by hunting.
// His idea, 21 Nov: the producer cell makes energy for the creature itself, like
// a plant in the sun, so a creature can live without eating (`makes` a tick).
// His idea, 21 Nov: the eye cell lets a creature see food or its predators.
// It works both ways (his rule, the same day): a creature with a killer cell
// and an eye chases the nearest other creature it sees, so hunters get harder
// to escape. Any other creature that moves and has an eye runs straight away
// from the nearest killer it sees; seeing none, it heads for the nearest food
// it sees. `sees` is how many squares out an eye looks.
// His idea, 21 Nov: the smart cell remembers where it found food, "and maybe
// what is good vs bad". A creature with one remembers the last place it ate
// (good) and the last place it got hurt by poison or a killer (bad). With
// nothing in sight it keeps away from the bad place until `forgets` ticks have
// passed, else goes back to the good place and forgets it once there. What its
// eyes see comes first. Babies start with no memories.
// His ask, 22 Nov: smart cells stack and do more. Each smart cell lets the
// creature remember one more food place and one more danger place, and keep
// danger in mind `forgets` ticks longer. It heads for the nearest food place
// it remembers and keeps away from any danger place near it.
// PLACEHOLDER: every number below is a first guess until he gives his own.
// The colours and drawings are placeholders too, until he picks or draws them.
const CELLS = {
  mouth:   { name: 'Mouth',   says: 'Eats food next to it.',               upkeep: 0.10, holds: 10, color: '#c2255c' },
  mover:   { name: 'Mover',   says: 'Moves the creature.',                 upkeep: 0.15, holds: 10, push: 1, color: '#0b7285' },
  storage: { name: 'Storage', says: 'Holds lots of energy, so it lasts longer without food.', upkeep: 0.05, holds: 60, color: '#e8a317' },
  bone:    { name: 'Bone',    says: 'Inside frame. Lets the creature grow bigger.', upkeep: 0.05, holds: 10, room: 4, color: '#efe4cc' },
  killer:  { name: 'Killer',  says: 'Takes energy from other creatures it touches. Armor stops it.', upkeep: 0.15, holds: 10, damage: 2, color: '#26282c' },
  producer: { name: 'Producer', says: 'Makes energy for the creature, like a plant.', upkeep: 0.05, holds: 10, makes: 0.15, color: '#5c940d' },
  smart:   { name: 'Smart',   says: 'Remembers where it found food, and where it got hurt. More smart cells remember more places, for longer.', upkeep: 0.10, holds: 10, forgets: 300, color: '#cc5de8' },
  eye:     { name: 'Eye',     says: 'Sees food to go to and killers to run from. On a killer, it sees prey to chase.', upkeep: 0.10, holds: 10, sees: 6, color: '#4dabf7' },
  fins:    { name: 'Fins',    says: 'Swims: loses no energy in a flood, and can move in water.', upkeep: 0.05, holds: 10, color: '#1864ab' },
  armor:   { name: 'Armor',   says: 'Outside protection. Killer cells can\'t hurt it.', upkeep: 0.10, holds: 10, color: '#62708a' },
};
const TYPES = Object.keys(CELLS);

// Kinds of creature (Randi's ask, 21 Nov), worked out from the cells: the first
// rule that fits wins. The names are ours until he picks his own.
const KINDS = [
  { name: 'Hunter', fits: n => n.killer > 0 },
  { name: 'Plant',  fits: n => n.producer > 0 && !n.mover },
  { name: 'Grazer', fits: n => n.mouth > 0 && n.mover > 0 },
  { name: 'Blob',   fits: () => true },
];
function kindOf(cells) {
  const n = {}; for (const p of cells) n[p.t] = (n[p.t] || 0) + 1;
  for (const t of TYPES) n[t] = n[t] || 0;
  return KINDS.find(k => k.fits(n)).name;
}

// World rules. PLACEHOLDER numbers, same as above.
const WORLD = {
  baseSize: 5,       // most cells a creature can have with no bone
  foodEnergy: 10,    // energy in one piece of food
  food: 4,           // Food slider start: new food each tick, per 10,000 squares
  foodCap: 0.2,      // at most this share of the world is food at once
  startFood: 0.03,   // share of the world that is food in a new world
  babies: true,      // Babies box start
  birthAt: 0.9,      // has a baby when its energy is this full
  birthAge: 40,      // ticks old before it can have a baby
  change: 25,        // Babies change slider start: % of babies born different
  turn: 0.04,        // chance a moving creature turns each tick
  deadToFood: true,  // a dead creature's cells turn into food
  // Poison block (his idea, 20 Nov; what it does is a placeholder until he says):
  // solid, nothing grows on it, and each cell touching one loses this much
  // energy every tick.
  poisonHurt: 1,
  maxCreatures: 400, // the world stops babies past this many
  // Old age (22 Nov, after the testers said the world froze): nothing died of
  // old age, so after a disaster plants (which never starve) filled the world
  // to maxCreatures, no babies could be born, and nothing moved. Now a creature
  // dies once it's this many ticks old, so the world keeps changing. Ours.
  oldAge: 2000,
  // Super plants (his idea, 22 Nov: a group of similar things joins into one
  // thing). Two plants this many empty squares apart or closer join into one
  // super plant, up to `superMax` cells. Both must be `birthAge` old, or every
  // newborn would join its parent the tick it was born.
  joinGap: 1,
  superMax: 30,
  // His ask, 22 Nov: super plants make more energy. Their producers make this
  // many times as much. Ours.
  superBoost: 1.5,
  // Disasters (his idea, 22 Nov: a mass extinction that can wipe out the whole
  // thing, can't be predicted, and how a creature is built decides if it
  // lives). Disaster picks one at random. PLACEHOLDER numbers, ours.
  meteorSize: [0.15, 0.4], // the blast's radius, a share of the world's longer side
  meteorBig: 0.1,          // chance the blast covers almost the whole world
  meteorEdge: 0.6,         // inside this share of the radius nothing lives; outside it, armor saves
  iceTicks: 300,           // how long an ice age stops food and producers
  rainShare: 0.03,         // share of the world's squares poison rain falls on
  rainHurt: 20,            // energy a creature loses for each cell a poison drop hits
  // Flood (his ask, 22 Nov): water covers one side of the world for a while.
  floodSize: [0.35, 0.65], // share of the world it covers, from one edge
  floodTicks: 300,         // how long before it drains (producers don't work underwater)
  floodHurt: 0.15,         // energy lost each tick while any cell is in the water
  // Surprise disasters (his ask, 22 Nov: "happen by themselves sometimes").
  surprise: true,          // Surprise disasters box start
  surpriseEvery: 5000,     // about this many ticks between them, on average
  surpriseCalm: 1000,      // none in a new world's first ticks
  surpriseGap: 1500,       // and none this soon after the last one
  speed: 20,         // ticks each second at ×1
  // The Speed dial (his ask, 21 Nov: evolution was too slow to watch). Each
  // step is a multiple of `speed`; the dial starts at ×1.
  speeds: [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100],
};

// ---------------------------------------------------------------------------
const $ = s => document.querySelector(s);
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const rnd = n => (Math.random() * n) | 0;
const pick = a => a[rnd(a.length)];

// Drawing one cell. Used in the world, the builder and the info card.
function drawCell(g, t, x, y, s) {
  const u = s / 8, R = (a, b, w, h) => g.fillRect(Math.round(x + a * u), Math.round(y + b * u), Math.round(w * u), Math.round(h * u));
  if (t === 'poison') {
    g.fillStyle = '#3b1f7a'; g.fillRect(Math.round(x), Math.round(y), Math.ceil(s), Math.ceil(s));
    g.fillStyle = '#c9b6ff'; R(1, 1, 2, 2); R(5, 1, 2, 2); R(3, 3, 2, 2); R(1, 5, 2, 2); R(5, 5, 2, 2);
    return;
  }
  if (t === 'food') {
    g.fillStyle = '#2b8a3e'; R(2, 2, 4, 4);
    g.fillStyle = '#8ce99a'; R(2, 2, 2, 2);
    return;
  }
  g.fillStyle = CELLS[t].color; g.fillRect(Math.round(x), Math.round(y), Math.ceil(s), Math.ceil(s));
  if (t === 'mouth') { g.fillStyle = '#3d0619'; R(2, 3, 4, 2); }
  else if (t === 'mover') { g.fillStyle = '#a5ecf5'; R(1, 1, 2, 2); R(5, 5, 2, 2); R(5, 1, 2, 2); R(1, 5, 2, 2); }
  else if (t === 'storage') { g.fillStyle = '#fff1b8'; R(2, 2, 4, 4); g.fillStyle = '#b77800'; R(1, 0, 6, 1); R(1, 7, 6, 1); R(0, 1, 1, 6); R(7, 1, 1, 6); }
  else if (t === 'bone') { g.fillStyle = '#8e7b55'; R(1, 2, 2, 4); R(5, 2, 2, 4); R(3, 3, 2, 2); }
  else if (t === 'killer') { g.fillStyle = '#ff6b4a'; R(0, 0, 2, 2); R(6, 0, 2, 2); R(0, 6, 2, 2); R(6, 6, 2, 2); R(3, 3, 2, 2); R(2, 2, 1, 1); R(5, 2, 1, 1); R(2, 5, 1, 1); R(5, 5, 1, 1); }
  else if (t === 'producer') { g.fillStyle = '#c0eb75'; R(3, 1, 2, 6); R(1, 3, 6, 2); g.fillStyle = '#f4fce3'; R(3, 3, 2, 2); }
  else if (t === 'smart') { g.fillStyle = '#f3d9fa'; R(1, 1, 6, 1); R(1, 1, 1, 3); R(1, 3, 4, 1); R(4, 3, 1, 3); R(2, 6, 5, 1); R(6, 4, 1, 3); }
  else if (t === 'eye') { g.fillStyle = '#ffffff'; R(1, 2, 6, 4); g.fillStyle = '#10203f'; R(3, 2, 2, 4); R(2, 3, 4, 2); g.fillStyle = '#ffffff'; R(3, 3, 1, 1); }
  else if (t === 'fins') { g.fillStyle = '#a5d8ff'; R(0, 1, 2, 2); R(0, 5, 2, 2); R(2, 2, 2, 1); R(2, 5, 2, 1); R(4, 3, 3, 2); g.fillStyle = '#ffffff'; R(6, 3, 1, 1); }
  else if (t === 'armor') { g.fillStyle = '#c3ccdb'; R(0, 0, 8, 1); R(0, 0, 1, 8); g.fillStyle = '#39445a'; R(7, 0, 1, 8); R(0, 7, 8, 1); R(3, 3, 2, 2); }
}
const ICON = {};
for (const t of TYPES) {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  drawCell(c.getContext('2d'), t, 0, 0, 32); ICON[t] = c.toDataURL();
}

// A creature's shape: cells at x,y offsets, with the top-left at 0,0.
function norm(cells) {
  const mx = Math.min(...cells.map(p => p.x)), my = Math.min(...cells.map(p => p.y));
  return cells.map(p => ({ x: p.x - mx, y: p.y - my, t: p.t }));
}
const sizeLimit = cells => WORLD.baseSize + cells.filter(p => p.t === 'bone').length * CELLS.bone.room;
function connected(cells) {
  if (!cells.length) return false;
  const key = p => p.x + ',' + p.y, all = new Set(cells.map(key)), seen = new Set([key(cells[0])]), todo = [cells[0]];
  while (todo.length) {
    const p = todo.pop();
    for (const [dx, dy] of DIRS) {
      const k = (p.x + dx) + ',' + (p.y + dy);
      if (all.has(k) && !seen.has(k)) { seen.add(k); todo.push({ x: p.x + dx, y: p.y + dy }); }
    }
  }
  return seen.size === cells.length;
}
const fitsSize = cells => cells.length <= sizeLimit(cells);

// ---------------------------------------------------------------------------
// The world
const cv = $('#world'), g = cv.getContext('2d');
let poisonCount = 0;
let W, H, occ, food, poison, foodCount, creatures, byId, nextId = 1, tick, born, died, sel = null, paused = false, foodAcc = 0;
const hist = [];
const settings = { food: WORLD.food, change: WORLD.change, speed: WORLD.speed, babies: WORLD.babies, surprise: WORLD.surprise };

// The world is as many squares as fit the screen when it's made; cols and
// rows are for the home page card picture, whose headless window reported a
// shorter screen than it took the picture of.
function newWorld(cols, rows) {
  zoom = 1; fitted = false;
  const r = $('#stage').getBoundingClientRect();
  const T = r.width < 700 ? 8 : 10;
  W = cols || Math.max(30, Math.floor(r.width / T)); H = rows || Math.max(20, Math.floor(r.height / T));
  occ = new Int32Array(W * H); food = new Uint8Array(W * H); poison = new Uint8Array(W * H); foodCount = 0; poisonCount = 0;
  creatures = []; byId = new Map(); tick = born = died = 0; hist.length = 0; select(null); iceUntil = 0; boom = null; flood = null; lastDisaster = 0;
  for (let i = 0; i < W * H * WORLD.startFood; i++) { const k = rnd(W * H); if (!food[k]) { food[k] = 1; foodCount++; } }
}

function makeCreature(cells, x, y, gen) {
  const c = { id: nextId++, cells: norm(cells), x, y, dir: rnd(4), age: 0, gen, kids: 0, energy: 0 };
  c.w = Math.max(...c.cells.map(p => p.x)) + 1; c.h = Math.max(...c.cells.map(p => p.y)) + 1;
  c.upkeep = 0; c.max = 0; c.movers = 0; c.makes = 0; c.eyes = 0; c.killers = 0;
  for (const p of c.cells) {
    const s = CELLS[p.t]; c.upkeep += s.upkeep; c.max += s.holds; c.makes += s.makes || 0;
    if (p.t === 'mover') c.movers += s.push;
    if (p.t === 'eye') c.eyes++;
    if (p.t === 'smart') c.smart = (c.smart || 0) + 1;
    if (p.t === 'fins') c.fins = (c.fins || 0) + 1;
    if (p.t === 'killer') c.killers++;
  }
  c.plant = c.makes > 0 && !c.movers;
  return c;
}
function fits(c, x, y) {
  for (const p of c.cells) {
    const px = x + p.x, py = y + p.y;
    if (px < 0 || py < 0 || px >= W || py >= H) return false;
    const o = occ[py * W + px]; if ((o && o !== c.id) || poison[py * W + px]) return false;
  }
  return true;
}
const mark = (c, v) => { for (const p of c.cells) occ[(c.y + p.y) * W + c.x + p.x] = v; };
function addCreature(c) { creatures.push(c); byId.set(c.id, c); mark(c, c.id); }

// Put a new creature from the builder somewhere free, near the middle first.
function release(cells) {
  const c = makeCreature(cells, 0, 0, 1);
  for (let tries = 0; tries < 400; tries++) {
    const spread = Math.min(1, 0.15 + tries / 200);
    const x = Math.round(W / 2 - c.w / 2 + (Math.random() - 0.5) * W * spread);
    const y = Math.round(H / 2 - c.h / 2 + (Math.random() - 0.5) * H * spread);
    if (fits(c, x, y)) { c.x = x; c.y = y; c.energy = c.max; c.name = designName(); addCreature(c); return c; }
  }
  return null;
}

function growFood() {
  if (tick < iceUntil) return;
  foodAcc += settings.food * W * H / 10000;
  while (foodAcc >= 1) {
    foodAcc--;
    if (foodCount >= W * H * WORLD.foodCap) break;
    const k = rnd(W * H);
    if (!occ[k] && !food[k] && !poison[k]) { food[k] = 1; foodCount++; }
  }
  foodAcc = Math.min(foodAcc, 1);
}

function mutate(cells) {
  const out = cells.map(p => ({ ...p })), op = rnd(3);
  if (op === 0) {        // add a cell next to one it has
    const p = pick(out), [dx, dy] = pick(DIRS), x = p.x + dx, y = p.y + dy;
    if (out.some(q => q.x === x && q.y === y)) return null;
    out.push({ x, y, t: pick(TYPES) });
  } else if (op === 1) { // take one away
    if (out.length < 2) return null;
    out.splice(rnd(out.length), 1);
  } else {               // swap one for another kind
    const p = pick(out), t = pick(TYPES.filter(t => t !== p.t)); p.t = t;
  }
  return connected(out) && fitsSize(out) ? out : null;
}

function haveBaby(c) {
  let cells = c.cells, changed = false;
  if (Math.random() * 100 < settings.change) { const m = mutate(cells); if (m) { cells = m; changed = true; } }
  const b = makeCreature(cells, 0, 0, c.gen + 1);
  b.super = c.super && !changed;
  if (b.super) b.makes *= WORLD.superBoost;
  const spots = [[c.x + c.w + 1, c.y], [c.x - b.w - 1, c.y], [c.x, c.y + c.h + 1], [c.x, c.y - b.h - 1]];
  for (let i = spots.length - 1; i > 0; i--) { const j = rnd(i + 1); [spots[i], spots[j]] = [spots[j], spots[i]]; }
  for (const [x, y] of spots) {
    if (!fits(b, x, y)) continue;
    // a baby born the same keeps the name; one born different has none yet
    b.x = x; b.y = y; b.changed = changed; b.name = changed ? '' : c.name;
    const give = c.energy / 2; c.energy -= give; b.energy = Math.min(b.max, give);
    addCreature(b); c.kids++; born++;
    return;
  }
}

function die(c) {
  mark(c, 0); c.dead = true; died++; byId.delete(c.id);
  if (WORLD.deadToFood) for (const p of c.cells) { const k = (c.y + p.y) * W + c.x + p.x; if (!food[k]) { food[k] = 1; foodCount++; } }
}

// ---------------------------------------------------------------------------
// Disasters. Each returns the line shown on screen; `boom` is the meteor's
// flash, drawn for a moment after it hits.
let iceUntil = 0, boom = null, flood = null;
// flood: { side: 0 east, 1 south, 2 west, 3 north, depth in squares, until }
function wet(x, y) {
  if (!flood || tick >= flood.until) return false;
  const d = flood.depth;
  return flood.side === 0 ? x >= W - d : flood.side === 1 ? y >= H - d : flood.side === 2 ? x < d : y < d;
}
const hasArmor = c => c.cells.some(p => p.t === 'armor');
function meteor() {
  const long = Math.max(W, H), big = Math.random() < WORLD.meteorBig;
  const r = big ? long * 0.8 : long * (WORLD.meteorSize[0] + Math.random() * (WORLD.meteorSize[1] - WORLD.meteorSize[0]));
  const cx = Math.random() * W, cy = Math.random() * H, before = creatures.length;
  for (const c of creatures.slice()) {
    const [mx, my] = [c.x + c.w / 2, c.y + c.h / 2], d = Math.hypot(mx - cx, my - cy);
    if (d >= r) continue;
    if (d < r * WORLD.meteorEdge || !hasArmor(c)) { removeCreature(c); died++; }
    else c.energy /= 2;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.hypot(x + .5 - cx, y + .5 - cy) >= r) continue;
    const k = y * W + x;
    if (food[k]) { food[k] = 0; foodCount--; }
    if (poison[k]) { poison[k] = 0; poisonCount--; }
  }
  boom = { x: cx, y: cy, r, at: performance.now() };
  const lost = before - creatures.length;
  return (big ? 'A giant meteor! ' : 'A meteor hit! ') + `${lost} creature${lost === 1 ? '' : 's'} gone. Armor saved some at the edge.`;
}
function iceAge() {
  food.fill(0); foodCount = 0; iceUntil = tick + WORLD.iceTicks;
  return `Ice age! All the food froze, and nothing grows for ${WORLD.iceTicks} ticks. Producers stop too. Storage helps.`;
}
function poisonRain() {
  let hits = 0;
  const drops = Math.round(W * H * WORLD.rainShare);
  for (let i = 0; i < drops; i++) {
    const k = rnd(W * H), x = k % W, y = (k / W) | 0;
    if (occ[k]) {
      const v = byId.get(occ[k]), cell = v && v.cells.find(q => v.x + q.x === x && v.y + q.y === y);
      if (cell && cell.t !== 'armor') { v.energy -= WORLD.rainHurt; hurtAt(v); hits++; if (v.energy <= 0) die(v); }
    } else if (!poison[k]) { if (food[k]) { food[k] = 0; foodCount--; } poison[k] = 1; poisonCount++; }
  }
  creatures = creatures.filter(c => !c.dead);
  return `Poison rain! It hit creatures ${hits} time${hits === 1 ? '' : 's'}, and the poison stays. Armor blocks it.`;
}
// Movers swim straight for dry land (away from the side the water came from);
// creatures that can't move wait it out on their stored energy. The food
// there washes away, and new food grows in the water as usual, which only
// a swimmer with fins stays long enough to eat (22 Nov: with no food
// growing back, fins creatures starved).
function floodWaters() {
  const side = rnd(4), across = side % 2 ? H : W;
  const depth = Math.round(across * (WORLD.floodSize[0] + Math.random() * (WORLD.floodSize[1] - WORLD.floodSize[0])));
  flood = { side, depth, until: tick + WORLD.floodTicks };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = y * W + x; if (food[k] && wet(x, y)) { food[k] = 0; foodCount--; } }
  const where = ['east', 'south', 'west', 'north'][side];
  return `Flood! Water covers the ${where} side for ${WORLD.floodTicks} ticks. Movers swim for dry land; producers stop underwater; the rest need storage.`;
}
const DISASTERS = [meteor, iceAge, poisonRain, floodWaters];
let newsTimer = 0;
let lastDisaster = 0;
function disaster(surprise) {
  lastDisaster = tick;
  const msg = (surprise ? 'Surprise! ' : '') + pick(DISASTERS)();
  if (sel && sel.dead) showInfo();
  const el = $('#news'); el.textContent = msg; el.hidden = false;
  clearTimeout(newsTimer); newsTimer = setTimeout(() => { el.hidden = true; }, 6000);
  showStats();
}

// The way to go (an index into DIRS) for a creature with eyes, or null if
// its eyes see nothing: a hunter goes for the nearest creature; anyone else
// goes away from the nearest killer, else to the nearest food.
const towards = (dx, dy) => Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3);
function look(c) {
  const r = CELLS.eye.sees;
  let food1 = null, foodD = 1e9, foe = null, foeD = 1e9, prey = null, preyD = 1e9;
  for (const p of c.cells) {
    if (p.t !== 'eye') continue;
    const ex = c.x + p.x, ey = c.y + p.y;
    for (let y = Math.max(0, ey - r); y <= Math.min(H - 1, ey + r); y++)
      for (let x = Math.max(0, ex - r); x <= Math.min(W - 1, ex + r); x++) {
        const k = y * W + x, d = Math.abs(x - ex) + Math.abs(y - ey);
        if (food[k] && d < foodD) { foodD = d; food1 = [x - ex, y - ey]; }
        const o = occ[k];
        if (o && o !== c.id) {
          if (d < preyD) { preyD = d; prey = [x - ex, y - ey]; }
          if (d < foeD) { const v = byId.get(o); if (v && v.killers) { foeD = d; foe = [x - ex, y - ey]; } }
        }
      }
  }
  if (c.killers && prey) return towards(prey[0], prey[1]);
  if (foe) return towards(-foe[0] || (Math.random() < .5 ? 1 : -1), -foe[1]);
  if (food1 && (food1[0] || food1[1])) return towards(food1[0], food1[1]);
  return null;
}

// Smart cell memories, in world squares from the creature's middle.
const middle = c => [c.x + c.w / 2, c.y + c.h / 2];
// c.goods: food places, c.bads: danger places, each { at: [x, y], age }.
// Each list holds one place per smart cell, the oldest dropped first; a place
// within 2 squares of one it has already counts as that one.
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
function remember(list, n, item, at) {
  const i = list.findIndex(m => dist(at(m), at(item)) <= 2);
  if (i >= 0) list.splice(i, 1);
  list.push(item); if (list.length > n) list.shift();
}
function ateAt(c, x, y) { if (c.smart) remember(c.goods || (c.goods = []), c.smart, { at: [x, y], age: c.age }, m => m.at); }
function hurtAt(c) { if (c.smart) remember(c.bads || (c.bads = []), c.smart, { at: middle(c), age: c.age }, m => m.at); }
function nearest(list, from) { let best = null, d = 1e9; for (const m of list) { const e = dist(m, from); if (e < d) { d = e; best = m; } } return best; }
function recall(c) {
  const here = middle(c);
  if (c.bads) c.bads = c.bads.filter(m => c.age - m.age <= CELLS.smart.forgets * c.smart);
  const bad = c.bads && nearest(c.bads.map(m => m.at), here);
  if (bad && dist(bad, here) < 10) return towards(here[0] - bad[0] || (Math.random() < .5 ? 1 : -1), here[1] - bad[1]);
  // Back at a food place, it forgets it, but not one it ate at in the last
  // 20 ticks. Forgetting on arrival forgot the place it had just eaten at, so
  // it never held more than one; keeping a place while food was still near it
  // left creatures circling food their mouths couldn't reach until they starved.
  if (c.goods) c.goods = c.goods.filter(m => dist(m.at, here) > 2 || c.age - m.age < 20);
  const good = c.goods && nearest(c.goods.filter(m => dist(m.at, here) > 2).map(m => m.at), here);
  return good ? towards(good[0] - here[0], good[1] - here[1]) : null;
}

function live(c) {
  c.age++;
  const swimming = flood && tick < flood.until && c.cells.some(p => wet(c.x + p.x, c.y + p.y));
  // His ask, 22 Nov: fins. A creature with fins loses nothing to the water and
  // can move in it even without movers, so it can keep eating instead of
  // racing for land. Producers still stop underwater.
  if (swimming) c.energy -= (c.fins ? 0 : WORLD.floodHurt) + c.makes; // no sun underwater
  c.energy = Math.min(c.max, c.energy - c.upkeep + (tick < iceUntil ? 0 : c.makes));
  if (poisonCount) for (const p of c.cells) for (const [dx, dy] of DIRS) {
    const x = c.x + p.x + dx, y = c.y + p.y + dy;
    if (x >= 0 && y >= 0 && x < W && y < H && poison[y * W + x]) { c.energy -= WORLD.poisonHurt; hurtAt(c); }
  }
  for (const p of c.cells) {
    if (p.t !== 'killer') continue;
    for (const [dx, dy] of DIRS) {
      const x = c.x + p.x + dx, y = c.y + p.y + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const o = occ[y * W + x];
      if (!o || o === c.id) continue;
      const v = byId.get(o);
      if (!v || v.dead) continue;
      const hit = v.cells.find(q => v.x + q.x === x && v.y + q.y === y);
      if (hit && hit.t !== 'armor') {
        const take = Math.min(CELLS.killer.damage, Math.max(0, v.energy));
        v.energy -= CELLS.killer.damage; c.energy = Math.min(c.max, c.energy + take); hurtAt(v);
        if (v.energy <= 0) die(v);
      }
    }
  }
  for (const p of c.cells) {
    if (p.t !== 'mouth') continue;
    const mx = c.x + p.x, my = c.y + p.y;
    for (const [dx, dy] of [[0, 0], ...DIRS]) {
      const x = mx + dx, y = my + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const k = y * W + x;
      if (food[k]) { food[k] = 0; foodCount--; c.energy = Math.min(c.max, c.energy + WORLD.foodEnergy); ateAt(c, x, y); break; }
    }
  }
  // More movers move it more often; a bigger body moves it less often.
  // (in a flood a mover swims every tick)
  if ((c.movers || (swimming && c.fins)) && (swimming || Math.random() < Math.min(1, c.movers / c.cells.length))) {
    const seen = c.eyes ? look(c) : null, thought = seen == null && c.smart ? recall(c) : null;
    if (swimming && !c.fins) c.dir = (flood.side + 2) % 4;
    else if (seen != null) c.dir = seen;
    else if (thought != null) c.dir = thought;
    else if (Math.random() < WORLD.turn) c.dir = rnd(4);
    let [dx, dy] = DIRS[c.dir];
    // a swimmer blocked on its way to dry land tries going round
    if (swimming && !c.fins && !fits(c, c.x + dx, c.y + dy)) {
      const side = DIRS[(c.dir + (Math.random() < .5 ? 1 : 3)) % 4];
      if (fits(c, c.x + side[0], c.y + side[1])) [dx, dy] = side;
    }
    if (fits(c, c.x + dx, c.y + dy)) { mark(c, 0); c.x += dx; c.y += dy; mark(c, c.id); }
    else c.dir = rnd(4);
  }
  if (settings.babies && c.energy >= c.max * WORLD.birthAt && c.age >= WORLD.birthAge && creatures.length < WORLD.maxCreatures) haveBaby(c);
  if (c.energy <= 0 || c.age >= WORLD.oldAge) die(c);
}

// Super plants. The two bodies keep their shapes and places; the group shares
// one energy store, one name and one baby count, so a hunter has to drain the
// whole group. The cells don't have to touch, so a super plant skips the
// all-cells-joined check (and a baby copies the whole group, since a change
// that broke the check is thrown away).
function joinPlants(a) {
  if (a.dead || !a.plant || a.age < WORLD.birthAge) return;
  const r = WORLD.joinGap + 1;
  for (const p of a.cells) for (const [dx, dy] of DIRS) for (let i = 1; i <= r; i++) {
    const x = a.x + p.x + dx * i, y = a.y + p.y + dy * i;
    if (x < 0 || y < 0 || x >= W || y >= H) break;
    const o = occ[y * W + x];
    if (!o) continue;
    if (o === a.id) break;
    const b = byId.get(o);
    if (b && !b.dead && b.plant && b.age >= WORLD.birthAge && a.cells.length + b.cells.length <= WORLD.superMax) { join(a, b); return; }
    break;
  }
}
function join(a, b) {
  const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y);
  const cells = [...a.cells.map(p => ({ x: a.x + p.x - x0, y: a.y + p.y - y0, t: p.t })),
                 ...b.cells.map(p => ({ x: b.x + p.x - x0, y: b.y + p.y - y0, t: p.t }))];
  const c = makeCreature(cells, x0, y0, Math.max(a.gen, b.gen));
  c.super = true; c.makes *= WORLD.superBoost; c.name = a.name || b.name; c.kids = a.kids + b.kids;
  c.age = Math.min(a.age, b.age); c.energy = Math.min(c.max, a.energy + b.energy);
  for (const v of [a, b]) { mark(v, 0); v.dead = true; byId.delete(v.id); }
  addCreature(c);
  if (sel === a || sel === b) select(c);
}

function step() {
  tick++;
  if (settings.surprise && creatures.length && tick > WORLD.surpriseCalm && tick - lastDisaster > WORLD.surpriseGap &&
      Math.random() < 1 / WORLD.surpriseEvery) disaster(true);
  growFood();
  for (const c of creatures.slice()) if (!c.dead) live(c);
  for (const c of creatures.slice()) joinPlants(c);
  creatures = creatures.filter(c => !c.dead);

}

// ---------------------------------------------------------------------------
// Drawing
// Zoom (his ask, 21 Nov: to see the cells up close). baseT is the square size
// that fits the whole world on screen; zoom multiplies it (1 to ZOOM_MAX), and
// the view (ox, oy) is kept inside the world. Zoomed in, the picked creature is
// followed until the view is dragged.
let T = 8, baseT = 8, ox = 0, oy = 0, zoom = 1, follow = false, fitted = false;
const ZOOM_MAX = 8;
function clampView() {
  const ww = T * W, wh = T * H;
  ox = Math.round(ww <= cv.width ? (cv.width - ww) / 2 : Math.min(0, Math.max(cv.width - ww, ox)));
  oy = Math.round(wh <= cv.height ? (cv.height - wh) / 2 : Math.min(0, Math.max(cv.height - wh, oy)));
}
const viewCentre = () => [(cv.width / 2 - ox) / T, (cv.height / 2 - oy) / T];
function centreOn(wx, wy) { ox = cv.width / 2 - wx * T; oy = cv.height / 2 - wy * T; clampView(); }
function setZoom(z, px = cv.width / 2, py = cv.height / 2) {
  const wx = (px - ox) / T, wy = (py - oy) / T;
  zoom = Math.min(ZOOM_MAX, Math.max(1, z));
  T = Math.max(1, Math.round(baseT * zoom));
  ox = px - wx * T; oy = py - wy * T; clampView();
  cv.style.cursor = placing ? 'crosshair' : zoom > 1 ? 'grab' : '';
}
function fit() {
  const keep = fitted ? viewCentre() : [W / 2, H / 2];
  const dpr = window.devicePixelRatio || 1, r = cv.getBoundingClientRect();
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  baseT = Math.max(1, Math.floor(Math.min(cv.width / W, cv.height / H)));
  T = Math.max(1, Math.round(baseT * zoom));
  centreOn(keep[0], keep[1]); fitted = true;
}
function draw() {
  g.fillStyle = '#bcd8cf'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#eef6f2'; g.fillRect(ox, oy, T * W, T * H);
  // only the squares on screen, since zoomed in most of the world isn't
  const x0 = Math.max(0, Math.floor(-ox / T)), x1 = Math.min(W - 1, Math.ceil((cv.width - ox) / T));
  const y0 = Math.max(0, Math.floor(-oy / T)), y1 = Math.min(H - 1, Math.ceil((cv.height - oy) / T));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const k = y * W + x;
    if (food[k]) drawCell(g, 'food', ox + x * T, oy + y * T, T);
    else if (poison[k]) drawCell(g, 'poison', ox + x * T, oy + y * T, T);
  }
  for (const c of creatures) for (const p of c.cells) drawCell(g, p.t, ox + (c.x + p.x) * T, oy + (c.y + p.y) * T, T);
  // a super plant's group gets a green box round it, so the joined bodies read as one
  g.strokeStyle = '#2b8a3e'; g.lineWidth = Math.max(1, T / 6);
  for (const c of creatures) if (c.super) g.strokeRect(ox + c.x * T, oy + c.y * T, c.w * T, c.h * T);
  if (tick < iceUntil) { g.fillStyle = 'rgba(165, 216, 255, .35)'; g.fillRect(ox, oy, T * W, T * H); }
  if (flood && tick < flood.until) {
    const d = flood.depth, f = flood.side;
    const [fx, fy, fw, fh] = f === 0 ? [W - d, 0, d, H] : f === 1 ? [0, H - d, W, d] : f === 2 ? [0, 0, d, H] : [0, 0, W, d];
    g.fillStyle = 'rgba(28, 126, 214, .4)'; g.fillRect(ox + fx * T, oy + fy * T, fw * T, fh * T);
  }
  if (boom) {
    const age = (performance.now() - boom.at) / 1200;
    if (age >= 1) boom = null;
    else {
      g.globalAlpha = 1 - age;
      g.fillStyle = '#ff922b'; g.beginPath(); g.arc(ox + boom.x * T, oy + boom.y * T, boom.r * T, 0, 7); g.fill();
      g.strokeStyle = '#c92a2a'; g.lineWidth = Math.max(3, T / 2); g.stroke();
      g.globalAlpha = 1;
    }
  }
  if (sel && !sel.dead) {
    const pad = Math.max(2, T / 3);
    g.strokeStyle = '#14262b'; g.lineWidth = Math.max(2, T / 4);
    g.strokeRect(ox + sel.x * T - pad, oy + sel.y * T - pad, sel.w * T + pad * 2, sel.h * T + pad * 2);
    // a picked smart creature shows its memories: a green ring where it ate,
    // a red cross where it got hurt
    g.lineWidth = Math.max(2, T / 5);
    for (const { at: m } of sel.goods || []) { g.strokeStyle = '#2b8a3e'; g.beginPath(); g.arc(ox + (m[0] + .5) * T, oy + (m[1] + .5) * T, Math.max(5, T * .7), 0, 7); g.stroke(); }
    for (const { at } of sel.bads || []) {
      const bx = ox + at[0] * T, by = oy + at[1] * T, r = Math.max(5, T * .7);
      g.strokeStyle = '#c92a2a'; g.beginPath(); g.moveTo(bx - r, by - r); g.lineTo(bx + r, by + r); g.moveTo(bx + r, by - r); g.lineTo(bx - r, by + r); g.stroke();
    }
  }
}
function drawGraph() {
  const c = $('#graph'), x = c.getContext('2d'), w = c.width, h = c.height;
  x.fillStyle = '#eef6f2'; x.fillRect(0, 0, w, h);
  if (hist.length < 2) return;
  const top = Math.max(5, ...hist);
  x.strokeStyle = '#0b6e4f'; x.lineWidth = 2; x.beginPath();
  hist.forEach((v, i) => { const px = i / 179 * (w - 4) + 2, py = h - 3 - v / top * (h - 6); i ? x.lineTo(px, py) : x.moveTo(px, py); });
  x.stroke();
}
function drawShape(canvas, cells) {
  const x = canvas.getContext('2d'), n = Math.max(...cells.map(p => Math.max(p.x, p.y))) + 1;
  const s = Math.floor(canvas.width / Math.max(n, 4)), off = (canvas.width - s * n) / 2;
  x.fillStyle = '#eef6f2'; x.fillRect(0, 0, canvas.width, canvas.height);
  for (const p of cells) drawCell(x, p.t, off + p.x * s, off + p.y * s, s);
}

let lastStats = 0;
function showStats() {
  // a graph point every quarter second of real time (not every 10 ticks, which
  // at ×100 showed only the last second), so it shows about 45 seconds
  if (!paused) { hist.push(creatures.length); if (hist.length > 180) hist.shift(); }
  $('#sTime').textContent = tick.toLocaleString(); $('#sN').textContent = creatures.length; $('#sBorn').textContent = born; $('#sDied').textContent = died;
  $('#sGen').textContent = creatures.reduce((m, c) => Math.max(m, c.gen), 0); $('#sFood').textContent = foodCount;
  drawGraph();
  if (sel) showInfo();
}

// ---------------------------------------------------------------------------
// The info card for one creature
function select(c) {
  sel = c; follow = !!c; $('#info').hidden = !c;
  if (c) { drawShape($('#infoPic'), c.cells); showInfo(); }
}
function showInfo() {
  const c = sel, n = id => c.cells.filter(p => p.t === id).length;
  $('#infoTitle').textContent = (c.dead ? 'It died: ' : '') + (c.name || 'Creature') + (c.changed ? ' (born different)' : '');
  const rows = [
    ['Kind', c.super ? 'Super plant' : kindOf(c.cells)],
    ['Energy', Math.max(0, Math.round(c.energy)) + ' of ' + c.max],
    ['Uses each tick', +c.upkeep.toFixed(2)],
    ...(c.makes ? [['Makes each tick', +c.makes.toFixed(2)]] : []),
    ['Cells', c.cells.length + ' of ' + (c.super ? WORLD.superMax : sizeLimit(c.cells))],
    ['Generation', c.gen], ['Age', c.age + ' of ' + WORLD.oldAge], ['Babies', c.kids],
    ...(c.smart ? [['Remembers', [c.goods?.length && `${c.goods.length} food`, c.bads?.length && `${c.bads.length} danger`].filter(Boolean).join(', ') || 'nothing yet']] : []),
    ...TYPES.filter(n).map(t => [CELLS[t].name, n(t)]),
  ];
  $('#infoList').innerHTML = rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
  $('#infoEdit').hidden = c.dead || c.super; $('#infoSave').hidden = !!c.super; // a group is bigger than the builder's grid
}
const tileAt = e => {
  const r = cv.getBoundingClientRect(), dpr = cv.width / r.width;
  return [Math.floor(((e.clientX - r.left) * dpr - ox) / T), Math.floor(((e.clientY - r.top) * dpr - oy) / T)];
};
// Add food (Randi's ask, 20 Nov): with it on, tapping or dragging on the world
// drops food in a small patch (3 by 3) on empty squares. Placed food can go
// past WORLD.foodCap, which only limits what grows by itself.
// Add poison works the same way one square at a time; a stroke that starts
// on a poison block takes blocks away instead.
let placing = null, painting = false, erasing = false;
// Remove (Randi's ask, 21 Nov): tapping or dragging clears a 3 by 3 patch of
// creatures, food and poison. A removed creature is taken away, not killed:
// it leaves no food and doesn't count in Died.
function removeCreature(v) {
  mark(v, 0); v.dead = true; byId.delete(v.id);
  creatures = creatures.filter(c => c !== v);
  if (sel === v) select(null);
}
function drop(x, y) {
  if (placing === 'remove') {
    for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) {
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const k = yy * W + xx;
      if (occ[k]) { const v = byId.get(occ[k]); if (v) removeCreature(v); }
      if (food[k]) { food[k] = 0; foodCount--; }
      if (poison[k]) { poison[k] = 0; poisonCount--; }
    }
    return;
  }
  if (placing === 'poison') {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const k = y * W + x;
    if (erasing) { if (poison[k]) { poison[k] = 0; poisonCount--; } }
    else if (!occ[k] && !poison[k]) { if (food[k]) { food[k] = 0; foodCount--; } poison[k] = 1; poisonCount++; }
    return;
  }
  for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) {
    if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
    const k = yy * W + xx;
    if (!occ[k] && !food[k] && !poison[k]) { food[k] = 1; foodCount++; }
  }
}
function setPlacing(kind) {
  placing = kind;
  $('#foodBtn').setAttribute('aria-pressed', kind === 'food');
  $('#poisonBtn').setAttribute('aria-pressed', kind === 'poison');
  $('#creatureBtn').setAttribute('aria-pressed', kind === 'creature');
  $('#removeBtn').setAttribute('aria-pressed', kind === 'remove');
  const names = { food: 'Add food', poison: 'Add poison', creature: 'Add creature', remove: 'Remove' };
  $('#toolsBtn').textContent = kind ? names[kind] : 'Tools';
  $('#toolsBtn').classList.toggle('on', !!kind);
  $('#noToolBtn').hidden = !kind;
  cv.style.cursor = kind ? 'crosshair' : zoom > 1 ? 'grab' : '';
}
// The Tools menu: picking a tool closes it; so do Escape, the button again,
// or a tap anywhere else. Up and down arrows move between the tools.
const toolsMenu = $('#toolsMenu'), toolsBtn = $('#toolsBtn');
function showTools(open) {
  toolsMenu.hidden = !open; toolsBtn.setAttribute('aria-expanded', open);
  if (open) (toolsMenu.querySelector('[aria-pressed="true"]') || toolsMenu.querySelector('button')).focus();
}
toolsBtn.onclick = () => showTools(toolsMenu.hidden);
toolsMenu.addEventListener('click', e => { if (e.target.closest('button')) { showTools(false); toolsBtn.focus(); } });
toolsMenu.addEventListener('keydown', e => {
  const items = [...toolsMenu.querySelectorAll('button:not([hidden])')], i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
  else if (e.key === 'Escape') { e.stopPropagation(); showTools(false); toolsBtn.focus(); }
});
document.addEventListener('pointerdown', e => { if (!toolsMenu.hidden && !e.target.closest('.toolWrap')) showTools(false); });
$('#noToolBtn').onclick = () => setPlacing(null);
$('#noToolBtn').hidden = true;
$('#foodBtn').onclick = () => setPlacing(placing === 'food' ? null : 'food');
$('#poisonBtn').onclick = () => setPlacing(placing === 'poison' ? null : 'poison');
$('#creatureBtn').onclick = () => setPlacing(placing === 'creature' ? null : 'creature');
$('#removeBtn').onclick = () => setPlacing(placing === 'remove' ? null : 'remove');

// Add creature (his ask, 21 Nov): each tap puts a copy of the builder's
// creature where he taps, centred on the tap, or the nearest free spot within
// a few squares. A builder creature that can't live (no cells, or cells not
// touching) opens the builder instead.
function dropCreature(x, y) {
  if (!design.length || !connected(design)) { setPlacing(null); openBuilder(); return; }
  const c = makeCreature(design, 0, 0, 1), x0 = x - (c.w >> 1), y0 = y - (c.h >> 1);
  for (let d = 0; d <= 4; d++)
    for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== d || !fits(c, x0 + dx, y0 + dy)) continue;
      c.x = x0 + dx; c.y = y0 + dy; c.energy = c.max; c.name = designName(); addCreature(c); return;
    }
}
// A quick drag skips squares between pointer events, so fill in the line.
let lastTile = null;
// Pointers: with a tool on, one finger paints; with none, a tap picks a
// creature and a drag moves the view. Two fingers pinch to zoom, and the mouse
// wheel zooms too, both around the point under them.
const pts = new Map();
let pinch = null, press = null;
const devPt = (x, y) => { const r = cv.getBoundingClientRect(), dpr = cv.width / r.width; return [(x - r.left) * dpr, (y - r.top) * dpr]; };
const spread = () => { const [a, b] = [...pts.values()]; return [Math.hypot(a.x - b.x, a.y - b.y), (a.x + b.x) / 2, (a.y + b.y) / 2]; };
cv.addEventListener('pointermove', e => {
  if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pts.size >= 2) {
    const [d, mx, my] = spread();
    setZoom(pinch.z * d / pinch.d, ...devPt(mx, my)); follow = false;
    return;
  }
  if (painting) {
    const [x, y] = tileAt(e), [lx, ly] = lastTile, n = Math.max(Math.abs(x - lx), Math.abs(y - ly));
    for (let i = 1; i <= n; i++) drop(Math.round(lx + (x - lx) * i / n), Math.round(ly + (y - ly) * i / n));
    lastTile = [x, y];
    return;
  }
  if (press) {
    const dx = e.clientX - press.x, dy = e.clientY - press.y;
    if (!press.moved && Math.hypot(dx, dy) < 6) return;
    press.moved = true; follow = false;
    const dpr = cv.width / cv.getBoundingClientRect().width;
    ox = press.ox + dx * dpr; oy = press.oy + dy * dpr; clampView();
  }
});
const letGo = e => {
  pts.delete(e.pointerId);
  if (pinch && pts.size < 2) pinch = null;
  painting = false;
  if (press && !press.moved && e.type === 'pointerup') pickAt(...tileAt(e));
  press = null;
};
cv.addEventListener('pointerup', letGo);
cv.addEventListener('pointercancel', letGo);
cv.addEventListener('wheel', e => {
  e.preventDefault();
  setZoom(zoom * (e.deltaY < 0 ? 1.25 : 0.8), ...devPt(e.clientX, e.clientY)); follow = false;
}, { passive: false });
cv.addEventListener('pointerdown', e => {
  // a finger whose lift was missed (it slid off onto a button) would make
  // every later tap count as a pinch, so the first finger down starts afresh
  if (e.isPrimary) { pts.clear(); pinch = null; }
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  cv.setPointerCapture(e.pointerId);
  if (pts.size === 2) { painting = false; press = null; pinch = { d: spread()[0] || 1, z: zoom }; return; }
  if (pts.size > 2) return;
  const [x, y] = tileAt(e);
  if (placing === 'creature') { dropCreature(x, y); return; }
  if (placing) {
    painting = true;
    erasing = placing === 'poison' && x >= 0 && y >= 0 && x < W && y < H && !!poison[y * W + x];
    drop(x, y); lastTile = [x, y]; return;
  }
  press = { x: e.clientX, y: e.clientY, ox, oy, moved: false };
});
function pickAt(x, y) {
  let hit = null;
  // a tap near a creature counts too, since cells are small on a phone
  for (let d = 0; d <= 2 && !hit; d++)
    for (let yy = y - d; yy <= y + d && !hit; yy++)
      for (let xx = x - d; xx <= x + d && !hit; xx++)
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && occ[yy * W + xx]) hit = byId.get(occ[yy * W + xx]);
  select(hit);
}
function nextCreature() {
  if (!creatures.length) return select(null);
  const i = sel ? creatures.indexOf(sel) : -1;
  select(creatures[(i + 1) % creatures.length]);
}
$('#infoClose').onclick = () => { select(null); cv.focus(); };
$('#infoEdit').onclick = () => openBuilder(sel.cells, sel.name);
$('#infoSave').onclick = () => { if (!sel.name) sel.name = nextName(); saveCreature(sel.cells, sel.name); showInfo(); $('#infoSave').textContent = 'Saved'; setTimeout(() => { $('#infoSave').textContent = 'Save'; }, 1500); };

// Saved creatures (Randi's ask, 20 Nov): kept on this device under
// pixels-of-life:saved, newest first, at most SAVED_MAX. Since 21 Nov each is
// { name, cells }; saves from before were only the cells, and get numbered names.
const SAVED_KEY = 'pixels-of-life:saved', SAVED_MAX = 12;
let saved = [];
try {
  const d = JSON.parse(localStorage.getItem(SAVED_KEY));
  if (Array.isArray(d)) saved = d.map((e, i) => Array.isArray(e) ? { name: 'Creature ' + (i + 1), cells: e } : e)
    .filter(e => e && Array.isArray(e.cells) && e.cells.length && e.cells.every(p => CELLS[p.t]))
    .map(e => ({ name: String(e.name || '').slice(0, 24), cells: e.cells }));
} catch (e) {}
const storeSaved = () => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch (e) {} };
const sameShape = (a, b) => { const k = c => norm(c).map(p => p.x + ',' + p.y + p.t).sort().join(' '); return k(a) === k(b); };
// Saving the same shape again replaces it, so changing the name and saving
// again is how a saved creature is renamed.
function saveCreature(cells, name) {
  const n = norm(cells);
  saved = [{ name, cells: n }, ...saved.filter(e => !sameShape(e.cells, n))].slice(0, SAVED_MAX);
  storeSaved(); drawSaved();
}
function nextName() {
  const used = new Set(saved.map(e => e.name));
  let i = 1; while (used.has('Creature ' + i)) i++;
  return 'Creature ' + i;
}
const designName = () => $('#nameIn').value.trim();

// ---------------------------------------------------------------------------
// The builder
const ED = 9, buildDlg = $('#buildDlg');
let design = [], tool = 'mouth';
const STARTER = [{ x: 3, y: 4, t: 'mover' }, { x: 4, y: 4, t: 'mouth' }, { x: 5, y: 4, t: 'storage' }];
const SAVE_KEY = 'pixels-of-life:design';
try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)); if (Array.isArray(d) && d.length) design = d.filter(p => CELLS[p.t]); } catch (e) {}
if (!design.length) design = STARTER.map(p => ({ ...p }));

const toolsEl = $('#tools');
[...TYPES, 'empty'].forEach((t, i) => {
  const s = CELLS[t], lab = document.createElement('label');
  lab.className = 'tool';
  const nums = s ? `Uses ${s.upkeep} · Holds ${s.holds}${s.room ? ' · +' + s.room + ' room' : ''}${s.damage ? ' · ' + s.damage + ' damage' : ''}${s.makes ? ' · Makes ' + s.makes : ''}${s.sees ? ' · Sees ' + s.sees : ''}${s.forgets ? ' · Forgets danger in ' + s.forgets : ''}` : 'Takes a cell away.';
  lab.innerHTML = `<input type="radio" name="tool" value="${t}"${t === tool ? ' checked' : ''}>` +
    (s ? `<img src="${ICON[t]}" alt="">` : '<span class="empty"></span>') +
    `<span><b>${i + 1}. ${s ? s.name : 'Empty'}</b><small>${s ? s.says + '<br>' : ''}${nums}</small></span>`;
  toolsEl.append(lab);
});
toolsEl.addEventListener('change', e => { tool = e.target.value; });

const gridEl = $('#grid'), gridBtns = [];
for (let y = 0; y < ED; y++) for (let x = 0; x < ED; x++) {
  const b = document.createElement('button');
  b.type = 'button'; b.dataset.x = x; b.dataset.y = y; b.tabIndex = -1;
  b.onclick = () => { placeAt(x, y); };
  gridEl.append(b); gridBtns.push(b);
}
gridBtns[4 * ED + 4].tabIndex = 0;
gridEl.addEventListener('keydown', e => {
  const b = e.target.closest('button'); if (!b) return;
  let x = +b.dataset.x, y = +b.dataset.y;
  const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (!mv) return;
  e.preventDefault();
  x = Math.min(ED - 1, Math.max(0, x + mv[0])); y = Math.min(ED - 1, Math.max(0, y + mv[1]));
  b.tabIndex = -1; const n = gridBtns[y * ED + x]; n.tabIndex = 0; n.focus();
});
buildDlg.addEventListener('keydown', e => {
  const i = '1234567890'.indexOf(e.key);
  if (i < 0 || e.target.closest('input')) return;
  const r = toolsEl.querySelectorAll('input')[i]; r.checked = true; tool = r.value;
});

function placeAt(x, y) {
  const at = design.findIndex(p => p.x === x && p.y === y);
  const next = design.filter((p, i) => i !== at);
  if (tool !== 'empty' && !(at >= 0 && design[at].t === tool)) next.push({ x, y, t: tool });
  if (!fitsSize(next)) { say(`Too big. With ${next.filter(p => p.t === 'bone').length} bone it can have ${sizeLimit(next)} cells. Add a bone to grow bigger.`); return; }
  design = next; say(''); drawBuilder();
}
function say(m, ok, undo) {
  const el = $('#buildMsg'); el.textContent = m; el.classList.toggle('ok', !!ok);
  if (undo) { const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Undo'; b.onclick = undo; el.append(b); }
}
function drawBuilder() {
  for (const b of gridBtns) {
    const p = design.find(q => q.x === +b.dataset.x && q.y === +b.dataset.y);
    b.innerHTML = p ? `<img src="${ICON[p.t]}" alt="">` : '';
    b.setAttribute('aria-label', `Row ${+b.dataset.y + 1}, column ${+b.dataset.x + 1}: ${p ? CELLS[p.t].name : 'empty'}`);
  }
  const bones = design.filter(p => p.t === 'bone').length;
  $('#sizeLine').textContent = `Cells: ${design.length} of ${sizeLimit(design)}` + (bones ? ` (${bones} bone)` : '') + (design.length ? ` · Kind: ${kindOf(design)}` : '');
}
function openBuilder(cells, name) {
  let msg = '';
  if (cells) {
    $('#nameIn').value = name || '';
    const n = norm(cells), w = Math.max(...n.map(p => p.x)) + 1, h = Math.max(...n.map(p => p.y)) + 1;
    if (w > ED || h > ED) msg = `That creature is too big for the builder (${ED} by ${ED}), so this is your last one.`;
    else {
      const dx = Math.floor((ED - w) / 2), dy = Math.floor((ED - h) / 2);
      design = n.map(p => ({ x: p.x + dx, y: p.y + dy, t: p.t }));
    }
  }
  drawBuilder(); drawSaved(); say(msg); if (!buildDlg.open) buildDlg.showModal();
}
$('#buildBtn').onclick = () => openBuilder();
$('#buildCancel').onclick = () => buildDlg.close();
$('#buildClear').onclick = () => { design = []; $('#nameIn').value = ''; say(''); drawBuilder(); };
$('#buildSave').onclick = () => {
  if (!design.length) return say('Put at least one cell on the grid.');
  if (!connected(design)) return say('All the cells have to touch, side to side.');
  if (!designName()) $('#nameIn').value = nextName();
  saveCreature(design, designName()); say(`Saved as ${designName()}.`, true);
};
function drawSaved() {
  const list = $('#savedList');
  $('#saved').hidden = !saved.length;
  list.innerHTML = '';
  saved.forEach(({ name, cells }, i) => {
    const item = document.createElement('div'); item.className = 'savedItem';
    const use = document.createElement('button'); use.type = 'button'; use.className = 'use';
    use.setAttribute('aria-label', `${name}, ${kindOf(cells)}, ${cells.length} cells. Put it in the builder.`);
    const pic = document.createElement('canvas'); pic.width = pic.height = 64; drawShape(pic, cells);
    const nm = document.createElement('b'); nm.textContent = name;
    const kd = document.createElement('small'); kd.textContent = kindOf(cells);
    use.append(pic, nm, kd);
    use.onclick = () => openBuilder(cells, name);
    const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'rm'; rm.textContent = 'Remove';
    rm.setAttribute('aria-label', `Remove ${name}`);
    rm.onclick = () => {
      const gone = saved.splice(i, 1)[0]; storeSaved(); drawSaved();
      say('Removed.', true, () => { saved.splice(i, 0, gone); storeSaved(); drawSaved(); say(''); });
    };
    item.append(use, rm); list.append(item);
  });
}
$('#buildAdd').onclick = () => {
  if (!design.length) return say('Put at least one cell on the grid.');
  if (!connected(design)) return say('All the cells have to touch, side to side.');
  const c = release(design);
  if (!c) return say('There is no room in the world. Try New world.');
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(design)); } catch (e) {}
  buildDlg.close(); select(c); cv.focus();
};
buildDlg.addEventListener('close', () => { if (!creatures.length && !document.querySelector('dialog[open]')) cv.focus(); });

// ---------------------------------------------------------------------------
// Controls
function bindSlider(id, fmt) {
  const el = $('#' + id), out = $('#' + id + 'Out');
  el.value = settings[id]; out.textContent = fmt(settings[id]);
  el.addEventListener('input', () => { settings[id] = +el.value; out.textContent = fmt(settings[id]); });
}
bindSlider('food', v => v);
bindSlider('change', v => v + '%');
// Speed is a dial of steps, not a number of ticks.
{
  const el = $('#speed'), out = $('#speedOut'), steps = WORLD.speeds;
  const fmt = m => '×' + (m === 0.25 ? '¼' : m === 0.5 ? '½' : m);
  el.max = steps.length - 1; el.value = steps.indexOf(1);
  const set = () => { const m = steps[+el.value]; settings.speed = WORLD.speed * m; out.textContent = fmt(m); el.setAttribute('aria-valuetext', fmt(m).replace('×', 'times ')); };
  el.addEventListener('input', set); set();
}
$('#babies').checked = settings.babies;
$('#babies').onchange = e => { settings.babies = e.target.checked; };
$('#surprise').checked = settings.surprise;
$('#surprise').onchange = e => { settings.surprise = e.target.checked; };
function setPaused(p) { paused = p; $('#pauseBtn').textContent = p ? 'Play' : 'Pause'; }
$('#pauseBtn').onclick = () => setPaused(!paused);
$('#newBtn').onclick = () => { newWorld(); fit(); showStats(); openBuilder(); };
$('#helpBtn').onclick = () => $('#helpDlg').showModal();
$('#helpClose').onclick = () => $('#helpDlg').close();
window.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]') || e.ctrlKey || e.metaKey || e.altKey) return;
  const onControl = e.target.closest && e.target.closest('button, input, a');
  if (e.key === ' ' && !onControl) { e.preventDefault(); setPaused(!paused); }
  else if (e.key === 'b' || e.key === 'B') openBuilder();
  else if (e.key === 'f' || e.key === 'F') setPlacing(placing === 'food' ? null : 'food');
  else if (e.key === 'p' || e.key === 'P') setPlacing(placing === 'poison' ? null : 'poison');
  else if (e.key === 'c' || e.key === 'C') setPlacing(placing === 'creature' ? null : 'creature');
  else if (e.key === 'r' || e.key === 'R') setPlacing(placing === 'remove' ? null : 'remove');
  else if (e.key === 'x' || e.key === 'X') disaster();
  else if (e.key === 'n' || e.key === 'N') nextCreature();
  else if (e.key === '+' || e.key === '=') zoomBy(1.5);
  else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.5);
  else if (e.key === '?') $('#helpDlg').showModal();
  else if (e.key === 'Escape' && sel) select(null);
});
window.addEventListener('resize', () => { fit(); draw(); });
// The followed creature sits in the middle of the part of the world the info
// card doesn't cover; on a phone the card covers most of the bottom.
function followSel() {
  const r = cv.getBoundingClientRect(), dpr = cv.width / r.width, card = $('#info');
  const cr = card.hidden ? null : card.getBoundingClientRect();
  const sy = cr && cr.width > r.width * 0.6 ? (cr.top - r.top) * dpr / 2 : cv.height / 2;
  ox = cv.width / 2 - (sel.x + sel.w / 2) * T; oy = sy - (sel.y + sel.h / 2) * T; clampView();
}
// The + and − buttons zoom around the picked creature if there is one.
function zoomBy(f) {
  if (sel && !sel.dead) { setZoom(zoom * f); followSel(); follow = true; }
  else setZoom(zoom * f);
}
$('#disasterBtn').onclick = () => disaster();
$('#zoomIn').onclick = () => zoomBy(1.5);
$('#zoomOut').onclick = () => zoomBy(1 / 1.5);

// ---------------------------------------------------------------------------
let last = performance.now(), acc = 0;
// One bad frame can't stop the game: the next frame is asked for first.
function frame(now) {
  requestAnimationFrame(frame);
  try { runFrame(now); } catch (e) { console.error(e); }
}
function runFrame(now) {
  const dt = Math.min(0.25, (now - last) / 1000); last = now;
  if (!paused) {
    // Fast speeds run as many ticks as fit in about 12 ms of each frame, so
    // the page stays smooth; a busy world can run slower than the dial says,
    // and the Time counter shows how far it really got.
    acc += dt * settings.speed;
    const until = now + 12;
    while (acc >= 1 && performance.now() < until) { step(); acc--; }
    acc = Math.min(acc, settings.speed / 10);
  }
  if (follow && sel && !sel.dead && zoom > 1) followSel();
  draw();
  if (now - lastStats > 250) { lastStats = now; showStats(); }
}
newWorld(); fit(); showStats();
requestAnimationFrame(frame);
openBuilder();
