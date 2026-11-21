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
// PLACEHOLDER: every number below is a first guess until he gives his own.
// The colours and drawings are placeholders too, until he picks or draws them.
const CELLS = {
  mouth:   { name: 'Mouth',   says: 'Eats food next to it.',               upkeep: 0.10, holds: 10, color: '#c2255c' },
  mover:   { name: 'Mover',   says: 'Moves the creature.',                 upkeep: 0.15, holds: 10, push: 1, color: '#0b7285' },
  storage: { name: 'Storage', says: 'Holds lots of energy, so it lasts longer without food.', upkeep: 0.05, holds: 60, color: '#e8a317' },
  bone:    { name: 'Bone',    says: 'Inside frame. Lets the creature grow bigger.', upkeep: 0.05, holds: 10, room: 4, color: '#efe4cc' },
  killer:  { name: 'Killer',  says: 'Takes energy from other creatures it touches. Armor stops it.', upkeep: 0.15, holds: 10, damage: 2, color: '#26282c' },
  producer: { name: 'Producer', says: 'Makes energy for the creature, like a plant.', upkeep: 0.05, holds: 10, makes: 0.15, color: '#5c940d' },
  eye:     { name: 'Eye',     says: 'Sees food to go to and killers to run from. On a killer, it sees prey to chase.', upkeep: 0.10, holds: 10, sees: 6, color: '#4dabf7' },
  armor:   { name: 'Armor',   says: 'Outside protection. Killer cells can\'t hurt it.', upkeep: 0.10, holds: 10, color: '#62708a' },
};
const TYPES = Object.keys(CELLS);

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
  speed: 20,         // Speed slider start: ticks each second
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
  else if (t === 'eye') { g.fillStyle = '#ffffff'; R(1, 2, 6, 4); g.fillStyle = '#10203f'; R(3, 2, 2, 4); R(2, 3, 4, 2); g.fillStyle = '#ffffff'; R(3, 3, 1, 1); }
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
const settings = { food: WORLD.food, change: WORLD.change, speed: WORLD.speed, babies: WORLD.babies };

// The world is as many squares as fit the screen when it's made; cols and
// rows are for the home page card picture, whose headless window reported a
// shorter screen than it took the picture of.
function newWorld(cols, rows) {
  const r = $('#stage').getBoundingClientRect();
  const T = r.width < 700 ? 8 : 10;
  W = cols || Math.max(30, Math.floor(r.width / T)); H = rows || Math.max(20, Math.floor(r.height / T));
  occ = new Int32Array(W * H); food = new Uint8Array(W * H); poison = new Uint8Array(W * H); foodCount = 0; poisonCount = 0;
  creatures = []; byId = new Map(); tick = born = died = 0; hist.length = 0; select(null);
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
    if (p.t === 'killer') c.killers++;
  }
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
    if (fits(c, x, y)) { c.x = x; c.y = y; c.energy = c.max; addCreature(c); return c; }
  }
  return null;
}

function growFood() {
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
  const spots = [[c.x + c.w + 1, c.y], [c.x - b.w - 1, c.y], [c.x, c.y + c.h + 1], [c.x, c.y - b.h - 1]];
  for (let i = spots.length - 1; i > 0; i--) { const j = rnd(i + 1); [spots[i], spots[j]] = [spots[j], spots[i]]; }
  for (const [x, y] of spots) {
    if (!fits(b, x, y)) continue;
    b.x = x; b.y = y; b.changed = changed;
    const give = c.energy / 2; c.energy -= give; b.energy = Math.min(b.max, give);
    addCreature(b); c.kids++; born++;
    return;
  }
}

function die(c) {
  mark(c, 0); c.dead = true; died++; byId.delete(c.id);
  if (WORLD.deadToFood) for (const p of c.cells) { const k = (c.y + p.y) * W + c.x + p.x; if (!food[k]) { food[k] = 1; foodCount++; } }
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

function live(c) {
  c.age++;
  c.energy = Math.min(c.max, c.energy - c.upkeep + c.makes);
  if (poisonCount) for (const p of c.cells) for (const [dx, dy] of DIRS) {
    const x = c.x + p.x + dx, y = c.y + p.y + dy;
    if (x >= 0 && y >= 0 && x < W && y < H && poison[y * W + x]) c.energy -= WORLD.poisonHurt;
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
        v.energy -= CELLS.killer.damage; c.energy = Math.min(c.max, c.energy + take);
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
      if (food[k]) { food[k] = 0; foodCount--; c.energy = Math.min(c.max, c.energy + WORLD.foodEnergy); break; }
    }
  }
  // More movers move it more often; a bigger body moves it less often.
  if (c.movers && Math.random() < Math.min(1, c.movers / c.cells.length)) {
    const seen = c.eyes ? look(c) : null;
    if (seen != null) c.dir = seen;
    else if (Math.random() < WORLD.turn) c.dir = rnd(4);
    const [dx, dy] = DIRS[c.dir];
    if (fits(c, c.x + dx, c.y + dy)) { mark(c, 0); c.x += dx; c.y += dy; mark(c, c.id); }
    else c.dir = rnd(4);
  }
  if (settings.babies && c.energy >= c.max * WORLD.birthAt && c.age >= WORLD.birthAge && creatures.length < WORLD.maxCreatures) haveBaby(c);
  if (c.energy <= 0) die(c);
}

function step() {
  tick++;
  growFood();
  for (const c of creatures.slice()) if (!c.dead) live(c);
  creatures = creatures.filter(c => !c.dead);
  if (tick % 10 === 0) { hist.push(creatures.length); if (hist.length > 180) hist.shift(); }
}

// ---------------------------------------------------------------------------
// Drawing
let T = 8, ox = 0, oy = 0;
function fit() {
  const dpr = window.devicePixelRatio || 1, r = cv.getBoundingClientRect();
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  T = Math.max(1, Math.floor(Math.min(cv.width / W, cv.height / H)));
  ox = Math.floor((cv.width - T * W) / 2); oy = Math.floor((cv.height - T * H) / 2);
}
function draw() {
  g.fillStyle = '#bcd8cf'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#eef6f2'; g.fillRect(ox, oy, T * W, T * H);
  for (let k = 0; k < W * H; k++) {
    if (food[k]) drawCell(g, 'food', ox + (k % W) * T, oy + ((k / W) | 0) * T, T);
    else if (poison[k]) drawCell(g, 'poison', ox + (k % W) * T, oy + ((k / W) | 0) * T, T);
  }
  for (const c of creatures) for (const p of c.cells) drawCell(g, p.t, ox + (c.x + p.x) * T, oy + (c.y + p.y) * T, T);
  if (sel && !sel.dead) {
    const pad = Math.max(2, T / 3);
    g.strokeStyle = '#14262b'; g.lineWidth = Math.max(2, T / 4);
    g.strokeRect(ox + sel.x * T - pad, oy + sel.y * T - pad, sel.w * T + pad * 2, sel.h * T + pad * 2);
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
  $('#sN').textContent = creatures.length; $('#sBorn').textContent = born; $('#sDied').textContent = died;
  $('#sGen').textContent = creatures.reduce((m, c) => Math.max(m, c.gen), 0); $('#sFood').textContent = foodCount;
  drawGraph();
  if (sel) showInfo();
}

// ---------------------------------------------------------------------------
// The info card for one creature
function select(c) {
  sel = c; $('#info').hidden = !c;
  if (c) { drawShape($('#infoPic'), c.cells); showInfo(); }
}
function showInfo() {
  const c = sel, n = id => c.cells.filter(p => p.t === id).length;
  $('#infoTitle').textContent = c.dead ? 'It died' : c.changed ? 'Creature (born different)' : 'Creature';
  const rows = [
    ['Energy', Math.max(0, Math.round(c.energy)) + ' of ' + c.max],
    ['Uses each tick', +c.upkeep.toFixed(2)],
    ...(c.makes ? [['Makes each tick', +c.makes.toFixed(2)]] : []),
    ['Cells', c.cells.length + ' of ' + sizeLimit(c.cells)],
    ['Generation', c.gen], ['Age', c.age], ['Babies', c.kids],
    ...TYPES.filter(n).map(t => [CELLS[t].name, n(t)]),
  ];
  $('#infoList').innerHTML = rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
  $('#infoEdit').hidden = c.dead;
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
function drop(x, y) {
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
  cv.style.cursor = kind ? 'crosshair' : '';
}
$('#foodBtn').onclick = () => setPlacing(placing === 'food' ? null : 'food');
$('#poisonBtn').onclick = () => setPlacing(placing === 'poison' ? null : 'poison');
$('#creatureBtn').onclick = () => setPlacing(placing === 'creature' ? null : 'creature');

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
      c.x = x0 + dx; c.y = y0 + dy; c.energy = c.max; addCreature(c); return;
    }
}
// A quick drag skips squares between pointer events, so fill in the line.
let lastTile = null;
cv.addEventListener('pointermove', e => {
  if (!painting) return;
  const [x, y] = tileAt(e), [lx, ly] = lastTile, n = Math.max(Math.abs(x - lx), Math.abs(y - ly));
  for (let i = 1; i <= n; i++) drop(Math.round(lx + (x - lx) * i / n), Math.round(ly + (y - ly) * i / n));
  lastTile = [x, y];
});
const stopPaint = () => { painting = false; };
cv.addEventListener('pointerup', stopPaint);
cv.addEventListener('pointercancel', stopPaint);
cv.addEventListener('pointerdown', e => {
  const [x, y] = tileAt(e);
  if (placing === 'creature') { dropCreature(x, y); return; }
  if (placing) {
    painting = true; cv.setPointerCapture(e.pointerId);
    erasing = placing === 'poison' && x >= 0 && y >= 0 && x < W && y < H && !!poison[y * W + x];
    drop(x, y); lastTile = [x, y]; return;
  }
  let hit = null;
  // a tap near a creature counts too, since cells are small on a phone
  for (let d = 0; d <= 2 && !hit; d++)
    for (let yy = y - d; yy <= y + d && !hit; yy++)
      for (let xx = x - d; xx <= x + d && !hit; xx++)
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && occ[yy * W + xx]) hit = byId.get(occ[yy * W + xx]);
  select(hit);
});
function nextCreature() {
  if (!creatures.length) return select(null);
  const i = sel ? creatures.indexOf(sel) : -1;
  select(creatures[(i + 1) % creatures.length]);
}
$('#infoClose').onclick = () => { select(null); cv.focus(); };
$('#infoEdit').onclick = () => openBuilder(sel.cells);
$('#infoSave').onclick = () => { saveCreature(sel.cells); $('#infoSave').textContent = 'Saved'; setTimeout(() => { $('#infoSave').textContent = 'Save'; }, 1500); };

// Saved creatures (Randi's ask, 20 Nov): kept on this device under
// pixels-of-life:saved, newest first, at most SAVED_MAX.
const SAVED_KEY = 'pixels-of-life:saved', SAVED_MAX = 12;
let saved = [];
try { const d = JSON.parse(localStorage.getItem(SAVED_KEY)); if (Array.isArray(d)) saved = d.filter(c => Array.isArray(c) && c.length && c.every(p => CELLS[p.t])); } catch (e) {}
const storeSaved = () => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch (e) {} };
const sameShape = (a, b) => { const k = c => norm(c).map(p => p.x + ',' + p.y + p.t).sort().join(' '); return k(a) === k(b); };
function saveCreature(cells) {
  const n = norm(cells);
  saved = [n, ...saved.filter(c => !sameShape(c, n))].slice(0, SAVED_MAX);
  storeSaved(); drawSaved();
}

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
  const nums = s ? `Uses ${s.upkeep} · Holds ${s.holds}${s.room ? ' · +' + s.room + ' room' : ''}${s.damage ? ' · ' + s.damage + ' damage' : ''}${s.makes ? ' · Makes ' + s.makes : ''}${s.sees ? ' · Sees ' + s.sees : ''}` : 'Takes a cell away.';
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
  const i = '123456789'.indexOf(e.key);
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
  $('#sizeLine').textContent = `Cells: ${design.length} of ${sizeLimit(design)}` + (bones ? ` (${bones} bone)` : '');
}
function openBuilder(cells) {
  let msg = '';
  if (cells) {
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
$('#buildClear').onclick = () => { design = []; say(''); drawBuilder(); };
$('#buildSave').onclick = () => {
  if (!design.length) return say('Put at least one cell on the grid.');
  if (!connected(design)) return say('All the cells have to touch, side to side.');
  saveCreature(design); say('Saved.', true);
};
function drawSaved() {
  const list = $('#savedList');
  $('#saved').hidden = !saved.length;
  list.innerHTML = '';
  saved.forEach((cells, i) => {
    const item = document.createElement('div'); item.className = 'savedItem';
    const use = document.createElement('button'); use.type = 'button'; use.className = 'use';
    use.setAttribute('aria-label', `Saved creature ${i + 1}, ${cells.length} cells. Put it in the builder.`);
    const pic = document.createElement('canvas'); pic.width = pic.height = 64; drawShape(pic, cells); use.append(pic);
    use.onclick = () => openBuilder(cells);
    const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'rm'; rm.textContent = 'Remove';
    rm.setAttribute('aria-label', `Remove saved creature ${i + 1}`);
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
bindSlider('speed', v => v);
$('#babies').checked = settings.babies;
$('#babies').onchange = e => { settings.babies = e.target.checked; };
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
  else if (e.key === 'n' || e.key === 'N') nextCreature();
  else if (e.key === '?') $('#helpDlg').showModal();
  else if (e.key === 'Escape' && sel) select(null);
});
window.addEventListener('resize', () => { fit(); draw(); });

// ---------------------------------------------------------------------------
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.25, (now - last) / 1000); last = now;
  if (!paused) {
    acc += dt * settings.speed;
    let n = 0;
    while (acc >= 1 && n++ < 30) { step(); acc--; }
    if (n > 30) acc = 0;
  }
  draw();
  if (now - lastStats > 250) { lastStats = now; showStats(); }
  requestAnimationFrame(frame);
}
newWorld(); fit(); showStats();
requestAnimationFrame(frame);
openBuilder();
