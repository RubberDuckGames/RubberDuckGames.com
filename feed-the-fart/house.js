// ---------- the house (decided 20 Nov) ----------
// Randi's idea after launch: a level before dinner, seen from above like Bread
// and Math Force. The first try was six big rooms; she pictured "more hallways
// and doors, people getting trapped in small spaces with his farts", so it's a
// maze of halls and small rooms with doors. A fart leaves gas that spreads
// square by square through open space and stops at walls and closed doors, so
// it thins out in a big room and builds up in a shut pantry. People and pets
// walk their own rounds and never open a closed door, so shutting Dad in the
// pantry with a fart traps him. Her other idea: leave one in the fridge, and
// it gets Dad when he goes for his glass of milk. Standing still fills the bar
// (it's the "mana"); a full bar means a run for the bathroom. The dining room
// door at the far end of the halls leads to dinner, which serves only the food
// he picked up. On a phone the house fills the screen with the bar and buttons
// floating over it, like Mission Directive (her ask: no wasted space).
Object.assign(T, {
  // the start card stays short (Randi, 22 Nov: "the base menu is a little wordy"); how to play each one is in its ? help
  start: `It's Thanksgiving with ${NAME}. Pick where to go. Press ? in the game for how to play.`,
  keys: '',
  dinnerHint: `It's Thanksgiving dinner. Feed ${NAME} from the table. When he holds out his finger, pull it. Find every kind of fart, and maybe the secret one. Keyboard: arrows (or Tab) to a food, Space or Enter to eat, F pulls his finger, C opens the collection. With a controller: A eats, X pulls the finger, Select opens this.`,
  playHouse: 'Play the house', justDinner: 'Just dinner',
  barLabel: 'Fart bar', fart: 'Fart', open: 'Open', close: 'Close', use: 'Use',
  barWords: ['Empty', 'Rumbling', 'Ready', 'Full!'],
  score: 'Score {n}', food: 'Food {n}/{all}',
  where: 'Dinner is through the glowing door at the end of the big hall.',
  allFood: "That's all the food! Head to the dining room.",
  houseHint: 'Grab the food and fart where people and pets will smell it. Trap them in small spaces! Walk with the arrows or the stick (or hold a finger on the house). Fart with Space, F or the Fart button: the gas spreads through open rooms and stops at closed doors. Use (or E) opens or closes the door, window or fridge next to you. People who smell it open a window, so shut them in a room without one. Goals has things to try. Fill the bar all the way and run for the bathroom. The glowing door at the end of the big hall goes to dinner. With a controller: A farts, B is Use, Select opens this.',
  intro: 'Find the food. Trap them with your farts!',
  ow: ['OW!', 'OW OW OW!', 'Who left Legos here?!', 'My foot!'],
  slow1: 'Ugh, so full. Slowing down...',
  slow2: 'Too full to hurry.',
  got: 'Got the {food}!',
  empty: 'Nothing left in the tank.',
  knock: { plant: 'The plant wilted!', dog: '{who} passed out!', cat: '{who} fainted!', tank: 'The fish played dead!', person: `${NAME.toUpperCase()}!!` },
  trapped: 'Trapped in the {room}!',
  sniff: '{who} sniffed.',
  who: { cousin1: 'Cousin', cousin2: 'Cousin', brother1: 'His brother', brother2: 'His brother', cat2: 'The other cat', bread: 'Bread', crumb: 'Crumb', plant: 'The plant', dog: 'The dog', cat: 'The cat', tank: 'The fish', grandma: 'Grandma', dad: 'Dad', kid: 'The kid', aunt: 'Aunt', uncle: 'Uncle' },
  stuck: 'Who closed the door?!',
  pts: '+{n}',
  fridgeIn: 'You left one in the fridge...',
  fridgeGot: 'WHO FARTED IN THE FRIDGE?!',
  milk: 'Mmm, milk.',
  alert: 'Shart alert! Get to the bathroom! {n}',
  relief: 'Ahh. Made it!',
  ohNo: 'Oh no.',
  oops: 'I might need a change of clothes.',
  needFood: 'Grab some food first!',
  doneTitle: 'Dinner time!',
  doneText: 'Score {score}. You knocked out {dust} of {all}. Best score {best}.',
  doneNone: 'You brought:',
  again: 'Play the house again', toDinner: 'Go to dinner',
  ew: ['Ew, what stinks?', 'Did the dog poop in the house?', 'Who farted?!', 'Was that the dog?', 'Something smells funny.', 'Open a window!'],
  quote: '{who}: "{line}"',
  opened: '{who} opened a window.',
  ding: 'Ding dong! {who} is here.',
  brought: '{who} brought {foods}!',
  pron: { aunt: 'She', uncle: 'He', brother1: 'He', brother2: 'He' },
  dogsToo: 'Bread and Crumb came too!',
  goalsBtn: 'Goals',
  goalDone: 'Goal: {goal}! +100',
  goalsHead: 'Goals {n}/{all}',
  goalsDone: 'Goals {n} of {all}.',
  goalsBest: 'Most goals: {n}.',
  goals: { pantry: 'Trap Dad in the pantry', fridge: 'Leave one in the fridge for Dad', grandma: 'Knock out Grandma', dog: 'Make the dog pass out',
    cat: 'Make the cat faint', fish: 'Make the fish play dead', plants: 'Wilt every plant', family: 'Knock out the whole family',
    food: 'Find all the food', bath: 'Make it to the bathroom in time' },
  rooms: { northHall: 'Hallway', westHall: 'Hallway', eastHall: 'Hallway', mainHall: 'Hallway', living: 'Living room', kitchen: 'Kitchen',
    pantry: 'Pantry', laundry: 'Laundry room', bath: 'Bathroom', den: 'Den', bedroom: 'Bedroom', kidroom: "Kid's room", closet: 'Coat closet', entry: 'Front hall' },
});

const HOUSE = (() => {
  const TS = 16, MW = 48, MH = 30;
  const cv = $('#hc'), cx = cv.getContext('2d');
  let VW = 256, VH = 144;
  // The canvas covers the screen at a whole-number scale (sharp pixels); a
  // phone held upright sees more house up and down, sideways more across.
  function fitView() {
    const w = innerWidth, h = innerHeight, k = Math.max(2, Math.floor(Math.min(w, h) / 190));
    VW = Math.ceil(w / k); VH = Math.ceil(h / k);
    if (cv.width !== VW || cv.height !== VH) { cv.width = VW; cv.height = VH; }
    cv.style.width = VW * k + 'px'; cv.style.height = VH * k + 'px';
    cx.imageSmoothingEnabled = false;
  }
  addEventListener('resize', () => { if (mode === 'house' || mode === 'car' || mode === 'rest' || mode === 'wed' || mode === 'movie') fitView(); });

  // ---- the map: walls everywhere, rooms carved out, doors, then furniture ----
  const map = Array.from({ length: MH }, () => Array(MW).fill('#'));
  const put = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) map[j][i] = c; };
  const ROOMS = {
    northHall: [4, 2, 28, 2, '='], westHall: [4, 4, 2, 14, '='], eastHall: [30, 4, 2, 14, '='], mainHall: [4, 18, 40, 2, '='],
    living: [7, 6, 12, 10, '_'], kitchen: [20, 6, 9, 8, ','], pantry: [20, 15, 4, 2, '.'],
    laundry: [33, 5, 5, 4, ','], bath: [33, 11, 5, 5, ','],
    den: [7, 21, 11, 7, '.'], bedroom: [20, 21, 9, 7, '-'], kidroom: [31, 21, 5, 5, '.'], closet: [38, 21, 2, 2, '.'], entry: [41, 21, 6, 8, '.'],
  };
  for (const k in ROOMS) put(...ROOMS[k]);
  put(19, 9, 1, 2, '.'); put(42, 20, 2, 1, '.'); put(18, 24, 2, 1, '.');        // open archways
  const DOORS = [[6, 10], [29, 11], [21, 14], [32, 6], [32, 13], [12, 20], [24, 20], [33, 20], [38, 20]];
  for (const [x, y] of DOORS) map[y][x] = 'd';                                   // d open, D closed
  put(3, 18, 1, 2, 'X');                                                         // the dining room door, west end of the main hall (it was tucked in the top hall)
  put(43, 29, 2, 1, 'O');                                                        // the front door
  put(8, 6, 4, 1, 'V'); put(15, 6, 3, 1, 'H'); put(9, 9, 3, 1, 'T'); put(8, 12, 5, 2, 'C'); put(16, 13, 2, 2, 'C');
  put(20, 6, 7, 1, 'K'); put(22, 6, 2, 1, 'S'); put(27, 6, 2, 1, 'F'); put(22, 9, 4, 2, 'K');
  put(20, 16, 4, 1, 'H');
  put(33, 5, 2, 1, 'L');
  put(36, 11, 1, 1, 'W'); put(34, 11, 1, 1, 'k'); put(33, 14, 3, 2, 'B');
  put(8, 25, 4, 2, 'C'); put(14, 21, 3, 1, 'T'); put(8, 21, 3, 1, 'H');
  put(21, 21, 3, 4, 'E'); put(26, 21, 3, 1, 'T');
  put(34, 21, 2, 3, 'E'); put(31, 25, 2, 1, 'T');
  put(38, 21, 2, 1, 'H');
  put(41, 21, 1, 1, 'H'); put(45, 25, 2, 1, 'T');
  // Windows (Randi, 20 Nov: someone opens a window). A window is a wall square
  // (N); when it's open, the room it's in airs out fast. The pantry and the
  // coat closet have none, which makes them the best traps. ix, iy: where you
  // stand to reach it.
  const WINDOWS = [[12, 5, 12, 6], [25, 5, 25, 7], [35, 4, 35, 5], [35, 10, 35, 11], [12, 28, 12, 27], [25, 28, 25, 27], [33, 26, 33, 25], [47, 24, 46, 24]]
    .map(([x, y, ix, iy]) => ({ x, y, ix, iy }));
  for (const w of WINDOWS) map[w.y][w.x] = 'N';
  const SOLID = '#VHTCKSFWkBOLEDN';         // what you can't walk through ('D' is a closed door)
  const AIRTIGHT = '#DFON';                 // what gas can't pass (furniture lets it over)
  const roomAt = (i, j) => { for (const k in ROOMS) { const [x, y, w, h] = ROOMS[k]; if (i >= x && i < x + w && j >= y && j < y + h) return k; } return null; };
  const at = (i, j) => (i < 0 || j < 0 || i >= MW || j >= MH) ? '#' : map[j][i];

  // ---- painting the map once (doors and the fridge are drawn every frame) ----
  const mapCan = document.createElement('canvas'); mapCan.width = MW * TS; mapCan.height = MH * TS;
  const m = mapCan.getContext('2d');
  const R = (x, y, w, h, c) => { m.fillStyle = c; m.fillRect(x, y, w, h); };
  function floor(i, j) {
    const x = i * TS, y = j * TS, room = roomAt(i, j), f = room ? ROOMS[room][4] : '.';
    if (f === '_' || f === '-') {
      const a1 = f === '_' ? '#8a4a4e' : '#4a5a8a', a2 = f === '_' ? '#97585b' : '#5a6a9a';
      R(x, y, TS, TS, a1); for (let a = 0; a < TS; a += 2) for (let b = (a / 2) % 2 * 2; b < TS; b += 4) R(x + b, y + a, 1, 1, a2);
    } else if (f === ',') {
      R(x, y, TS, TS, room === 'bath' ? '#cfe3e8' : room === 'laundry' ? '#d8d0e0' : '#ddd6c8');
      R(x, y, TS, 1, '#b9b0a0'); R(x, y, 1, TS, '#b9b0a0'); R(x + 8, y, 1, TS, '#c9c0b0'); R(x, y + 8, TS, 1, '#c9c0b0');
    } else {
      const hall = f === '=';
      R(x, y, TS, TS, hall ? '#c08a56' : '#b07a48');
      for (let a = 3; a < TS; a += 4) R(x, y + a, TS, 1, hall ? '#a47040' : '#946238');
      R(x + ((i * 7 + j * 3) % 12), y, 1, 4, '#946238'); R(x + ((i * 5 + j * 11) % 12) + 2, y + 8, 1, 4, '#946238');
    }
  }
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const t = map[j][i], x = i * TS, y = j * TS;
    if (t === '#' || t === 'N') {
      R(x, y, TS, TS, '#5a3a24');
      const below = at(i, j + 1);
      if (below !== '#' && below !== 'N') { R(x, y + 4, TS, 12, '#e2c896'); R(x, y + 4, TS, 1, '#f2dcb0'); for (let a = 2; a < TS; a += 5) R(x + a, y + 6, 1, 8, '#d4b882'); R(x, y + 13, TS, 3, '#7a4a2a'); }
      if (t === 'N') { const front = below !== '#' && below !== 'N'; R(x + 2, y + (front ? 5 : 4), 12, front ? 7 : 8, '#f4ece0'); R(x + 3, y + (front ? 6 : 5), 10, front ? 5 : 6, '#a8d8f0'); R(x + 7, y + (front ? 6 : 5), 2, front ? 5 : 6, '#f4ece0'); }
      continue;
    }
    floor(i, j);
    if (t === 'X') { R(x, y, TS, TS, '#f6d68a'); R(x, y, 3, TS, '#7a4522'); if (j === 18) R(x + 5, y + 6, 8, 10, '#f9e4a8'); else R(x + 5, y, 8, 10, '#f9e4a8'); }
    else if (t === 'O') { R(x, y, TS, TS, '#7a4522'); R(x + 2, y + 2, 12, 12, '#8a5228'); R(x + 5, y + 4, 6, 4, '#a8d8f0'); if (i === 44) R(x + 1, y + 9, 2, 2, '#e8c35a'); }
    else if (t === 'V') { R(x, y + 2, TS, 12, '#1d1a22'); R(x + 1, y + 3, 14, 9, '#2a3a5a'); R(x + 2, y + 8, 12, 4, '#3f8f3a'); R(x + 2, y + 4, 4, 1, '#6a8ac8'); }
    else if (t === 'H') { R(x, y, TS, 14, '#6b3f22'); const cs = ['#c2304a', '#3a6ea5', '#d9a420', '#3f8f3a', '#7d4fa0']; for (let a = 1; a < 15; a += 3) R(x + a, y + 2, 2, 10, cs[(a + i + j) % 5]); R(x, y + 14, TS, 2, '#4a2c16'); }
    else if (t === 'T') { R(x, y + 1, TS, 12, '#8a5228'); R(x, y + 1, TS, 2, '#a8693a'); R(x, y + 13, TS, 2, '#5a3418'); }
    else if (t === 'C') { const d = roomAt(i, j) === 'den'; R(x, y, TS, TS, d ? '#8a4a3a' : '#4f7a4a'); R(x + 1, y + 3, 14, 11, d ? '#a85a48' : '#6a9a5a'); R(x + 8, y + 3, 1, 11, d ? '#8a4a3a' : '#4f7a4a'); }
    else if (t === 'K') { R(x, y, TS, 15, '#6e665a'); R(x, y, TS, 11, '#b8ad98'); R(x, y, TS, 2, '#cfc4ae'); R(x, y + 11, TS, 1, '#8a8070'); }
    else if (t === 'k') { R(x, y, TS, 14, '#e4e0d6'); R(x + 3, y + 3, 10, 7, '#f8f8f8'); R(x + 4, y + 4, 8, 5, '#b8d8e8'); }
    else if (t === 'S') { R(x, y, TS, 14, '#2a2a30'); for (const [a, b] of [[2, 2], [9, 2], [2, 8], [9, 8]]) R(x + a, y + b, 5, 4, '#5a2a22'); }
    else if (t === 'L') { R(x, y, TS, 15, '#f0f0ec'); R(x + 3, y + 4, 10, 9, '#9aa8b0'); R(x + 5, y + 6, 6, 5, '#c8dce8'); R(x + 2, y + 1, 4, 2, '#7a8a94'); }
    else if (t === 'W') { R(x + 3, y, 10, 5, '#f4f4f0'); R(x + 4, y + 5, 8, 9, '#f4f4f0'); R(x + 5, y + 6, 6, 6, '#b8d8e8'); }
    else if (t === 'B') { R(x, y, TS, TS, '#f4f4f0'); const top = at(i, j - 1) !== 'B', bot = at(i, j + 1) !== 'B', l = at(i - 1, j) !== 'B', r = at(i + 1, j) !== 'B';
      R(x + (l ? 3 : 0), y + (top ? 3 : 0), TS - (l ? 3 : 0) - (r ? 3 : 0), TS - (top ? 3 : 0) - (bot ? 3 : 0), '#8fd3f5'); }
    else if (t === 'E') { const top = at(i, j - 1) !== 'E'; R(x, y, TS, TS, '#f4ece0'); R(x, y + (top ? 6 : 0), TS, TS - (top ? 6 : 0), roomAt(i, j) === 'kidroom' ? '#3a8ac8' : '#c2304a');
      if (top) R(x + 3, y + 1, 10, 4, '#ffffff'); R(x + (at(i - 1, j) === 'E' ? 0 : 0), y, 1, TS, '#8a5228'); }
  }

  // ---- sprites, with a one-pixel dark outline like the dinner scene ----
  const cache = {};
  function sprite(key, w, h, draw) {
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
    const x = c.getContext('2d'); x.translate(1, 1);
    draw((a, b, cw, ch, col) => { x.fillStyle = col; x.fillRect(a, b, cw, ch); });
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data, W2 = c.width, H2 = c.height, out = [];
    for (let j = 0; j < H2; j++) for (let i = 0; i < W2; i++) {
      if (p[(j * W2 + i) * 4 + 3]) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([u, v]) => { const a = i + u, b = j + v; return a >= 0 && b >= 0 && a < W2 && b < H2 && p[(b * W2 + a) * 4 + 3] > 128; })) out.push(j * W2 + i);
    }
    for (const k of out) { p[k * 4] = 42; p[k * 4 + 1] = 26; p[k * 4 + 2] = 14; p[k * 4 + 3] = 255; }
    x.setTransform(1, 0, 0, 1, 0, 0); x.putImageData(d, 0, 0);
    return (cache[key] = c);
  }
  // him from above: lean face, tousled brown hair, mustache and goatee, tan
  // bib overalls over the charcoal shirt (the same look as at dinner)
  const SK = '#e2a978', HR = '#5a3a22', HL = '#8a5a32', BD = '#7a4a2a', SH = '#3d3d45', OV = '#b07a3a', OD = '#9c6a30', BT = '#4a3020', K = '#2a1a0e';
  function himSprite(dir, step, frozen) {
    const side = dir === 'left' || dir === 'right';
    const base = sprite(`him-${side ? 'side' : dir}-${step}-${frozen ? 1 : 0}`, 14, 20, r => {
      const lift = step === 1 ? [1, 0] : step === 2 ? [0, 1] : [0, 0];
      if (side) {
        const f = step === 1 ? -1 : step === 2 ? 1 : 0;
        r(5 + f, 14, 3, 4, OV); r(7 - f, 14, 3, 4, OD); r(4 + f, 18, 4, 2, BT); r(7 - f, 18, 4, 2, BT);
        r(4, 8, 7, 7, SH); r(5, 9, 5, 6, OV); r(6, 8, 1, 2, OD); r(6, 9, 2, 5, SH); r(6, 14, 2, 1, SK);
        r(3, 1, 8, 7, SK); r(3, 0, 8, 3, HR); r(4, 0, 3, 1, HL); r(7, 3, 4, 3, HR); r(2, 4, 1, 2, SK);
        r(4, 3, 1, 1, K); r(3, 5, 3, 1, BD); r(3, 6, 2, 1, '#ffffff'); r(4, 7, 2, 1, BD);
        return;
      }
      r(3, 14 + lift[0], 3, 4 - lift[0], OV); r(8, 14 + lift[1], 3, 4 - lift[1], OV);
      r(2, 18 - lift[0], 4, 2, BT); r(8, 18 - lift[1], 4, 2, BT);
      r(2, 8, 10, 7, SH); r(4, 9, 6, 6, OV); r(4, 8, 1, 2, OD); r(9, 8, 1, 2, OD); r(4, 11, 6, 1, OD);
      r(2, 14, 2, 1, SK); r(10, 14, 2, 1, SK);
      r(3, 1, 8, 7, SK);
      if (dir === 'up') { r(3, 0, 8, 7, HR); r(5, 0, 3, 1, HL); r(6, 7, 2, 1, SK); r(4, 9, 1, 3, OD); r(9, 9, 1, 3, OD); return; }
      r(3, 0, 8, 3, HR); r(5, 0, 3, 1, HL); r(3, 3, 1, 2, HR); r(10, 3, 1, 2, HR); r(8, 2, 2, 1, HR);
      if (frozen) { r(4, 3, 2, 2, '#ffffff'); r(8, 3, 2, 2, '#ffffff'); r(5, 4, 1, 1, K); r(8, 4, 1, 1, K); r(6, 6, 2, 2, '#5a2318'); }
      else { r(5, 4, 1, 1, K); r(8, 4, 1, 1, K); r(5, 5, 4, 1, BD); r(6, 6, 2, 1, '#ffffff'); r(6, 7, 2, 1, BD); }
    });
    if (dir !== 'right') return base;
    const key = `him-right-${step}`;
    if (!cache[key]) { const c = document.createElement('canvas'); c.width = base.width; c.height = base.height; const x = c.getContext('2d'); x.scale(-1, 1); x.drawImage(base, -base.width, 0); cache[key] = c; }
    return cache[key];
  }
  const GR = '#3f8f3a', GL = '#6cbf3f', BR = '#8a6a3a';
  const DOGS = {
    dog: { body: '#b87333', belly: '#c98a4a', head: '#c98544', ear: '#7a4a20', snout: '#f0d2a8', collar: '#c2304a', legs: '#a8652a' },
    bread: { body: '#e8913a', belly: '#fff6ea', head: '#e8913a', ear: '#c46a1f', snout: '#fff6ea', collar: '#3a6fd8', legs: '#fff6ea', up: true, short: true },
    crumb: { body: '#2b2b33', belly: '#b8773a', head: '#2b2b33', ear: '#2b2b33', snout: '#b8773a', collar: '#9b5cd8', legs: '#b8773a', up: true, short: true },
  };
  function targetSprite(t, time) {
    const out = t.out, k = t.kind;
    if (k === 'plant') return sprite(`plant-${out}`, 16, 16, r => {
      if (out) { r(2, 7, 5, 3, BR); r(9, 7, 5, 3, BR); r(6, 5, 4, 5, '#a07a48'); }
      else { r(3, 2, 4, 6, GR); r(9, 1, 4, 7, GR); r(6, 0, 4, 9, GL); r(4, 4, 2, 2, GL); r(10, 3, 2, 2, GL); }
      r(4, 10, 8, 2, '#d97a4a'); r(5, 12, 6, 4, '#c2643a');
    });
    // Decided 21 Nov: Bread the corgi and Crumb, the puppy, from the corgi game
    // come over with his brother; same dog shape in their own colours, ears up
    if (k === 'dog') { const d = DOGS[t.who || 'dog']; return sprite(`dog-${t.who || 'dog'}-${out}`, 17, 14, r => {
      r(0, 6, 3, 2, d.body); r(2, 5, 10, 7, d.body); r(4, 7, 6, 4, d.belly);
      r(11, 3, 6, 7, d.head); if (d.up) { r(11, 0, 2, 3, d.ear); r(14, 0, 2, 3, d.ear); r(12, 1, 1, 1, '#f4a6a0'); r(14, 1, 1, 1, '#f4a6a0'); } else r(11, 2, 2, 4, d.ear);
      r(15, 6, 2, 3, d.snout); r(16, 6, 1, 1, K); r(10, 4, 1, 6, d.collar);
      if (out) { r(13, 3, 1, 1, K); r(15, 3, 1, 1, K); r(14, 4, 1, 1, K); r(13, 5, 1, 1, K); r(15, 5, 1, 1, K); r(4, 2, 1, 3, d.legs); r(8, 2, 1, 3, d.legs); }
      else { r(14, 4, 1, 1, K); r(4, 12, 2, d.short ? 1 : 2, d.legs); r(9, 12, 2, d.short ? 1 : 2, d.legs); }
    }); }
    if (k === 'cat') { const tux = t.who === 'cat2', W = '#f4f4f4', eye = tux ? '#8fd06a' : '#f5d34a'; return sprite(`cat-${t.who || 'cat'}-${out}`, 15, 14, r => {
      if (out) { r(4, 8, 11, 5, '#2b2b33'); r(0, 6, 6, 6, '#2b2b33'); if (tux) { r(6, 10, 4, 3, W); r(1, 9, 3, 2, W); } r(1, 8, 1, 1, eye); r(3, 8, 1, 1, eye); r(13, 6, 2, 2, '#2b2b33'); return; }
      r(4, 6, 8, 8, '#2b2b33'); r(5, 1, 6, 6, '#2b2b33'); r(5, 0, 1, 1, '#2b2b33'); r(10, 0, 1, 1, '#2b2b33');
      r(6, 3, 1, 1, eye); r(9, 3, 1, 1, eye); r(12, 10, 3, 2, '#2b2b33'); r(6, 7, 4, 4, tux ? W : '#3a3a44');
      if (tux) { r(6, 4, 4, 3, W); r(5, 12, 2, 2, W); r(9, 12, 2, 2, W); }   // the black and white cat: white muzzle, chest and paws
      r(7, 5, 2, 1, '#f27d92');
    }); }
    if (k === 'tank') return sprite(`tank-${out}`, 18, 12, r => {
      r(0, 0, 18, 12, '#3a2414'); r(1, 1, 16, 10, '#8fd3f5'); r(1, 9, 16, 2, '#c9a26a'); r(3, 5, 1, 4, GR);
      if (out) { r(8, 1, 5, 2, '#f4ece0'); r(8, 3, 5, 1, '#f08a1e'); }
      else { r(8, 4, 4, 3, '#f08a1e'); r(6, 4, 2, 3, '#d96a10'); r(11, 5, 1, 1, K); }
    });
    if (t.sit && !t.walk) {   // a cousin on the floor, playing with Legos
      const play = out ? 0 : Math.floor(time * 3) % 2;
      return sprite(`sit-${t.who}-${out}-${play}`, 16, 15, r => {
        const skin = out ? '#b8c890' : t.skin;
        r(3, 8, 10, 5, t.shirt); r(5, 1, 6, 7, skin); r(5, 0, 6, 3, t.hair); r(5, 3, 1, 2, t.hair); r(10, 3, 1, 2, t.hair);
        r(6, 4, 1, 1, K); r(9, 4, 1, 1, K); r(7, 6, 2, 1, out ? t.skin : '#7a2e22');
        r(2, 13, 12, 2, '#3a3a4a');
        r(1, 10 - play, 3, 2, skin); r(12, 9 + play, 3, 2, skin);
      });
    }
    const fan = out && Math.floor(time * 6) % 2, w = t.walk ? Math.floor(time * 6) % 2 : 0;
    return sprite(`p-${t.who}-${out}-${fan}-${w}`, 16, 18, r => {
      const skin = out ? '#b8c890' : t.skin;
      r(2, 8, 12, 8, t.shirt); r(5, 1, 6, 7, skin); r(5, 0, 6, 3, t.hair); r(5, 3, 1, 2, t.hair); r(10, 3, 1, 2, t.hair);
      r(6, 4, 1, 1, K); r(9, 4, 1, 1, K);
      if (out) { r(7, 5, 2, 2, t.skin); r(13, fan ? 1 : 3, 2, 6, t.shirt); r(13, fan ? 0 : 2, 3, 2, t.skin); }
      else r(7, 6, 2, 1, '#7a2e22');
      r(4, 16 - w, 3, 2, '#3a3a4a'); r(9, 16 - (1 - w) * (t.walk ? 1 : 0), 3, 2, '#3a3a4a');
    });
  }
  const foodImg = {};
  for (const f of FOODS) { const im = new Image(); im.src = spriteURL(f.id); foodImg[f.id] = im; }

  // ---- who and what is in the house ----
  // need: how much gas (gas x seconds) knocks them out. route: tile spots they
  // walk between, with a pause at each; milk marks Dad's trip to the fridge.
  const TARGETS = [
    { kind: 'plant', x: 17.5, y: 7.6, need: 12 }, { kind: 'plant', x: 16.5, y: 2.7, need: 12 },
    { kind: 'plant', x: 27.5, y: 26.6, need: 12 }, { kind: 'plant', x: 45.5, y: 27.6, need: 12 },
    { kind: 'cat', x: 36.5, y: 7.6, need: 22 }, { kind: 'cat', who: 'cat2', x: 26.5, y: 25.6, need: 22 }, { kind: 'tank', x: 15.5, y: 21.5, need: 18 },
    { kind: 'dog', x: 12.5, y: 24.6, need: 26, route: [[12.5, 24.5], [24.5, 26.5], [16.5, 19], [36.5, 19]], pause: 4 },
    { kind: 'person', who: 'grandma', x: 16.5, y: 15.6, need: 34, hair: '#c9c9c9', shirt: '#7d4fa0', skin: '#f0c9a0', route: [[16.5, 15.6]], pause: 30 },
    { kind: 'person', who: 'dad', x: 24.5, y: 12.6, need: 34, hair: '#8a4b22', shirt: '#3a6ea5', skin: '#e9b88f',
      route: [[27.5, 7.5, 'milk'], [21.5, 15.6], [11.5, 10.6], [24.5, 12.6], [21.5, 15.6]], pause: 5 },
    { kind: 'person', who: 'kid', x: 32.5, y: 23.6, need: 28, hair: '#2a1a10', shirt: '#3f8f5a', skin: '#c68a5e',
      route: [[32.5, 23.6], [38.5, 22.6], [10.5, 23.6], [35.5, 7.6], [32.5, 23.6]], pause: 4 },
    // two cousins on the living room floor in front of the TV, playing with Legos (Randi, 21 Nov)
    { kind: 'person', who: 'cousin1', sit: true, x: 9.2, y: 8.3, need: 26, hair: '#e8c35a', shirt: '#e8742a', skin: '#f0c9a0', route: [[9.2, 8.3]], pause: 30 },
    { kind: 'person', who: 'cousin2', sit: true, x: 11.6, y: 8.3, need: 26, hair: '#3a2414', shirt: '#7d4fa0', skin: '#c68a5e', route: [[11.6, 8.3]], pause: 30 },
    // Thanksgiving guests ring the bell during the level (Randi: more to do).
    // Decided 21 Nov: his two brothers come too, and the first brings the dogs.
    { kind: 'person', who: 'brother1', arrive: 20, x: 43.5, y: 27.6, need: 34, hair: '#5a3a22', shirt: '#2f4f6f', skin: '#e2a978',
      route: [[42.5, 23.6], [24.5, 18.6], [14.5, 10.6], [25.5, 12.6]], pause: 5 },
    { kind: 'dog', who: 'bread', arrive: 20, with: 'brother1', x: 44.5, y: 27.6, need: 26, route: [[40.5, 19], [16.5, 19], [12.5, 24.5], [36.5, 19]], pause: 3 },
    { kind: 'dog', who: 'crumb', arrive: 20, with: 'brother1', x: 42.5, y: 27.6, need: 20, route: [[44.5, 24.5], [26.5, 19], [14.5, 11.5], [33.5, 19]], pause: 2 },
    { kind: 'person', who: 'brother2', arrive: 55, x: 43.5, y: 27.6, need: 34, hair: '#7a5232', shirt: '#a0522d', skin: '#d9a074',
      route: [[44.5, 22.6], [33.5, 23.6], [16.5, 24.6], [30.5, 9.6]], pause: 5 },
    { kind: 'person', who: 'aunt', arrive: 35, x: 43.5, y: 27.6, need: 30, hair: '#e8c35a', shirt: '#c2304a', skin: '#f0c9a0',
      route: [[44.5, 23.6], [11.5, 8.6], [24.5, 24.6], [35.5, 13.6], [26.5, 11.6]], pause: 4 },
    { kind: 'person', who: 'uncle', arrive: 75, x: 43.5, y: 27.6, need: 38, hair: '#6a6a6a', shirt: '#4f7a4a', skin: '#d9a074',
      route: [[42.5, 24.6], [13.5, 24.6], [9.5, 10.6], [34.5, 6.6], [22.5, 12.6]], pause: 5 },
  ];
  // Randi, 20 Nov: the guests bring food. These dishes aren't in the house at
  // the start; they're set down in the front hall when that guest arrives.
  const BRINGS = { pie: ['aunt', 42.5, 26.5], casserole: ['aunt', 43.5, 26.5], eggnog: ['uncle', 45.5, 23.5], eggs: ['uncle', 42.5, 24.5] };
  // Legos to step on (Randi, 21 Nov): "OW!", a moment's hop, and a little
  // fart slips out; the brick gets kicked away.
  const LEGOS = [[10.5, 8.6, '#d8344f'], [13.5, 10.6, '#3a74b8'], [7.5, 8.6, '#f5d34a'], [33.5, 24.6, '#3f8f3a'], [32.5, 22.6, '#d8344f'],
    [20.5, 18.7, '#3a74b8'], [29.5, 19.5, '#f5d34a'], [15.5, 24.6, '#e8742a'], [5, 14.6, '#3f8f3a']];
  const GOALS = ['pantry', 'fridge', 'grandma', 'dog', 'cat', 'fish', 'plants', 'family', 'food', 'bath'];
  const FOOD_AT = { turkey: [24.5, 12.5], mac: [21.5, 7.5], eggnog: [27.5, 8.5], eggs: [26.5, 12.5], gravy: [20.5, 12.5], mash: [27.5, 11.5],
    casserole: [25.5, 7.5], stuffing: [22.5, 15.5], rolls: [20.5, 15.5], cranberry: [44.5, 23.5], sweetpot: [13.5, 23.5], corn: [4.5, 10.5],
    sprouts: [35.5, 12.5], pie: [25.5, 25.5], pizzabites: [10.5, 11.5], bagel: [33.5, 23.5], sardines: [34.5, 7.5], creamblock: [38.5, 22.5] };

  let G = null, keys = {}, hold = null, last = 0, msgT = 0, raf = 0, gasT = 0;
  const gas = new Float32Array(MW * MH), gas2 = new Float32Array(MW * MH);
  const newBelly = () => ({ gas: 0, total: 0, dairy: 0, sulfur: 0, bread: 0, sweet: 0, savory: 0, ate: new Set() });
  function start() {
    for (const [x, y] of DOORS) map[y][x] = 'd';
    gas.fill(0); decay.fill(.9993);
    G = {
      x: 43.5 * TS, y: 28 * TS + 10, dir: 'up', step: 0, stepT: 0, moving: false, room: '',
      b: newBelly(), score: 0, dusts: 0, got: new Set(), puffs: [], pops: [],
      alert: 0, frozen: 0, needMsgT: 0, time: 0, fridgeOpen: 0, fridgeGas: 0,
      targets: TARGETS.map(t => ({ ...t, out: false, sniffed: false, dose: 0, leg: 0, wait: 2, path: null, stuckT: 0, here: !t.arrive, reactT: 0, detour: null })),
      win: WINDOWS.map(() => 0), goals: new Set(), regionT: 0, hop: 0,
      legos: LEGOS.map(([x, y, c]) => ({ x: x * TS, y: y * TS, c, gone: false })),
      foods: FOODS.filter(f => !locked(f) && FOOD_AT[f.id]).map(f => { const b = BRINGS[f.id], at = b ? b.slice(1) : FOOD_AT[f.id]; return { f, x: at[0] * TS, y: at[1] * TS, wait: b ? b[0] : null }; }),
    };
    mode = 'house';
    document.body.classList.add('housePlay');
    $('#dinner').hidden = true; $('#house').hidden = false; fitView();
    say(T.intro, 3000); setTimeout(() => { if (mode === 'house' && G.time < 8) say(T.where, 4000); }, 3200);
    hud();
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
  }

  function say(text, ms = 2200, alert = false) {
    const el = $('#hMsg'); el.textContent = text; el.hidden = false; el.classList.toggle('alert', alert);
    $('#live').textContent = text; msgT = ms;
  }
  function hud() {
    const g = Math.round(G.b.gas);
    $('#hFill').style.width = g + '%';
    const w = g >= 100 ? 3 : g >= 50 ? 2 : g >= 15 ? 1 : 0;
    $('#hWord').textContent = T.barWords[w];
    $('#hMeter').setAttribute('aria-valuenow', g); $('#hMeter').setAttribute('aria-valuetext', `${g}%, ${T.barWords[w]}`);
    $('#hScore').textContent = fill(T.score, { n: G.score });
    $('#hFood').textContent = fill(T.food, { n: G.got.size, all: G.foods.length });
    $('#hRoom').textContent = T.rooms[G.room] || '';
    const u = useTarget();
    $('#hUse').disabled = !u;
    $('#hUse').textContent = !u ? T.use : u.kind === 'door' ? (map[u.y][u.x] === 'D' ? T.open : T.close) : u.kind === 'window' ? (G.win[u.n] > 0 ? T.close : T.open) : (G.fridgeOpen > 0 ? T.close : T.open);
  }

  // ---- moving ----
  const solidT = (i, j) => SOLID.includes(at(i, j));
  const solidAt = (px, py) => solidT(Math.floor(px / TS), Math.floor(py / TS));
  const corners = (x, y) => [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y - 1], [x + 5, y - 1]];
  const blocked = (x, y) => corners(x, y).some(([a, b]) => solidAt(a, b));
  function bumpDoor(x, y) {   // walking into a closed door opens it
    for (const [a, b] of corners(x, y)) { const i = Math.floor(a / TS), j = Math.floor(b / TS); if (at(i, j) === 'D') { map[j][i] = 'd'; return; } }
  }
  const inRoom = (name, px, py) => { const [x, y, w, h] = ROOMS[name], i = px / TS, j = py / TS; return i >= x && i < x + w && j >= y && j < y + h; };

  // ---- the gas: spreads to open neighbours, stopped by walls and closed doors ----
  const airtight = k => AIRTIGHT.includes(map[Math.floor(k / MW)][k % MW]);
  function stepGas() {
    for (let k = 0; k < MW * MH; k++) {
      if (airtight(k)) { gas2[k] = 0; continue; }
      let sum = 0, n = 0;
      for (const d of [-1, 1, -MW, MW]) { const q = k + d; if (q >= 0 && q < MW * MH && !airtight(q) && Math.abs((q % MW) - (k % MW)) <= 1) { sum += gas[q]; n++; } }
      gas2[k] = (gas[k] + .1 * (sum - n * gas[k])) * decay[k];
    }
    gas.set(gas2);
  }
  // Randi, 20 Nov: gas shut in a small room stays until someone opens the door;
  // a big or open space airs out. Every quarter second the open floor is split
  // into connected spaces (walls, closed doors, closed windows between them),
  // and each gets a fade rate: shut and small, none; an open window, fast; a
  // big space (the halls with doors open), a few seconds' worth; else slow.
  const region = new Int16Array(MW * MH), decay = new Float32Array(MW * MH).fill(.9993);
  const winAt = new Map(WINDOWS.map((w, n) => [w.y * MW + w.x, n]));
  function regions() {
    region.fill(-1); let id = 0;
    for (let k = 0; k < MW * MH; k++) {
      if (airtight(k) || region[k] >= 0) continue;
      const cells = [k]; region[k] = id; let door = false, vent = false;
      for (let h = 0; h < cells.length; h++) {
        const c = cells[h];
        for (const d of [-1, 1, -MW, MW]) {
          const n = c + d; if (n < 0 || n >= MW * MH || Math.abs((n % MW) - (c % MW)) > 1) continue;
          const ch = map[Math.floor(n / MW)][n % MW];
          if (ch === 'D') door = true;
          if (ch === 'N' && G.win[winAt.get(n)] > 0) vent = true;
          if (airtight(n) || region[n] >= 0) continue;
          region[n] = id; cells.push(n);
        }
      }
      const f = vent ? .975 : door && cells.length < 90 ? 1 : cells.length >= 150 ? .9982 : .9993;
      for (const c of cells) decay[c] = f;
      id++;
    }
  }
  const gasAt = (px, py) => { const i = Math.floor(px / TS), j = Math.floor(py / TS); return i < 0 || j < 0 || i >= MW || j >= MH ? 0 : gas[j * MW + i]; };
  function addGas(px, py, amount) {
    const i = Math.floor(px / TS), j = Math.floor(py / TS);
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const k = (j + b) * MW + i + a; if (k >= 0 && k < MW * MH && !airtight(k)) gas[k] += amount * (a || b ? .07 : .44); }
  }
  // the room around a tile, as far as gas can go, and whether a closed door shuts it
  function pocket(i, j) {
    const seen = new Set([j * MW + i]), q = [j * MW + i]; let door = false;
    while (q.length && seen.size < 60) {
      const k = q.shift();
      for (const d of [-1, 1, -MW, MW]) { const n = k + d, c = map[Math.floor(n / MW)][n % MW]; if (seen.has(n)) continue; if (c === 'D') { door = true; continue; } if (AIRTIGHT.includes(c)) continue; seen.add(n); q.push(n); }
    }
    return seen.size < 60 && door;
  }

  // ---- walking people and pets: shortest path over open floor ----
  function path(from, to) {
    const s = from[1] * MW + from[0], e = to[1] * MW + to[0], prev = new Map([[s, -1]]), q = [s];
    while (q.length) {
      const k = q.shift(); if (k === e) break;
      for (const d of [-1, 1, -MW, MW]) { const n = k + d; if (prev.has(n) || n < 0 || n >= MW * MH || Math.abs((n % MW) - (k % MW)) > 1) continue; if (solidT(n % MW, Math.floor(n / MW))) continue; prev.set(n, k); q.push(n); }
    }
    if (!prev.has(e)) return null;
    const out = []; for (let k = e; k !== s; k = prev.get(k)) out.unshift([(k % MW) + .5, Math.floor(k / MW) + .6]);
    return out;
  }
  function walkTarget(t, dt) {
    t.walk = false;
    if (!t.route || t.out || !t.here) return;
    if (t.wait > 0) { t.wait -= dt; return; }
    if (!t.path) {
      const goal = t.detour ? [t.detour.ix + .5, t.detour.iy + .6] : t.route[t.leg % t.route.length];
      t.path = path([Math.floor(t.x), Math.floor(t.y - .2)], [Math.floor(goal[0]), Math.floor(goal[1])]);
      if (!t.path) {   // a closed door in the way: they don't open doors
        t.stuckT += dt;
        if (t.kind === 'person' && t.stuckT > .1 && t.stuckT < .2 && Math.hypot(t.x * TS - G.x, t.y * TS - G.y) < 160) say(T.stuck);
        if (t.stuckT > 5) { if (t.detour) t.detour = null; else t.leg++; t.stuckT = 0; }
        t.wait = .5; return;
      }
      t.stuckT = 0;
    }
    if (!t.path.length) {
      t.path = null;
      if (t.detour) {   // at the window: open it for a while
        const n = WINDOWS.indexOf(t.detour); if (!G.win[n]) { G.win[n] = 30; regions(); near(t) && say(fill(T.opened, { who: T.who[t.who] })); }
        t.detour = null; t.wait = 1.5; return;
      }
      const goal = t.route[t.leg % t.route.length]; t.leg++; t.wait = t.pause; if (goal[2] === 'milk') milk(t); return;
    }
    const [nx, ny] = t.path[0];
    if (solidT(Math.floor(nx), Math.floor(ny - .2))) { t.path = null; return; }   // a door shut in front of them
    const dx = nx - t.x, dy = ny - t.y, d = Math.hypot(dx, dy), sp = 1.7 * dt;
    if (d <= sp) { t.x = nx; t.y = ny; t.path.shift(); } else { t.x += dx / d * sp; t.y += dy / d * sp; }
    t.walk = true;
  }
  const near = t => Math.hypot(t.x * TS - G.x, t.y * TS - G.y) < 200;
  function milk(dad) {
    G.fridgeOpen = 2.5;
    if (G.fridgeGas >= 20) { G.fridgeGas = 0; knock(dad, 300, T.fridgeGot); goal('fridge'); }
    else if (Math.hypot(dad.x * TS - G.x, dad.y * TS - G.y) < 160) say(T.milk);
  }
  function goal(id) {
    if (G.goals.has(id)) return;
    G.goals.add(id); G.score += 100; toast(fill(T.goalDone, { goal: T.goals[id] }));
    [523, 659, 784].forEach((f, i) => tone(f, .12, 'square', i * .1, .1));
  }
  function checkGoals(t, trapped, room) {
    if (t.who === 'dad' && trapped && room === 'pantry') goal('pantry');
    if (t.who === 'grandma') goal('grandma');
    if (t.kind === 'dog') goal('dog');
    if (t.kind === 'cat') goal('cat');
    if (t.kind === 'tank') goal('fish');
    if (G.targets.filter(x => x.kind === 'plant').every(x => x.out)) goal('plants');
    const people = G.targets.filter(x => x.kind === 'person');
    if (people.every(x => x.here && x.out)) goal('family');
  }
  function knock(t, pts, line) {
    t.out = true; t.walk = false; G.dusts++;
    const trapped = pocket(Math.floor(t.x), Math.floor(t.y - .2));
    const room = roomAt(Math.floor(t.x), Math.floor(t.y - .2));
    if (trapped) pts *= 2;
    G.score += pts;
    const kn = fill(T.knock[t.kind], { who: T.who[t.who || t.kind] });
    say(line || (trapped ? fill(T.trapped, { room: (T.rooms[room] || '').toLowerCase() }) + ' ' + kn : kn));
    pop(t.x * TS, t.y * TS - 20, fill(T.pts, { n: pts }));
    checkGoals(t, trapped, room);
  }

  function step(dt) {
    G.time += dt;
    if (msgT > 0 && !G.alert) { msgT -= dt * 1000; if (msgT <= 0) $('#hMsg').hidden = true; }
    const sx = Math.hypot(stick.x, stick.y) < .2 ? 0 : stick.x, sy = Math.hypot(stick.x, stick.y) < .2 ? 0 : stick.y;   // a small dead zone in the middle
    let dx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0) + sx;
    let dy = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0) + sy;
    if (hold) { const c = cam(), hx = hold.x + c.x - G.x, hy = hold.y + c.y - (G.y - 8), d = Math.hypot(hx, hy); if (d > 4) { dx += hx / d; dy += hy / d; } }
    const len = Math.hypot(dx, dy);
    G.moving = len > .2 && G.frozen <= 0;
    if (G.frozen > 0) G.frozen -= dt;
    if (G.moving) {
      dx /= Math.max(1, len); dy /= Math.max(1, len);
      // slower when he's eaten a lot, and slower still while clenching for the
      // bathroom (Randi, 21 Nov)
      const n = G.got.size, slow = (n >= 12 ? .7 : n >= 8 ? .85 : 1) * (G.alert ? .6 : 1);
      const sp = 66 * slow * dt;
      if (!blocked(G.x + dx * sp, G.y)) G.x += dx * sp; else if (dx) bumpDoor(G.x + dx * sp, G.y);
      if (!blocked(G.x, G.y + dy * sp)) G.y += dy * sp; else if (dy) bumpDoor(G.x, G.y + dy * sp);
      G.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      G.stepT += dt; if (G.stepT > .16 / slow) { G.stepT = 0; G.step = G.step === 1 ? 2 : 1; }
    } else G.step = 0;
    const room = roomAt(Math.floor(G.x / TS), Math.floor((G.y - 3) / TS));
    if (room && room !== G.room) { G.room = room; G.roomT = 1.6; }
    if (G.roomT > 0) G.roomT -= dt;

    if (G.frozen <= 0) G.b.gas = Math.min(100, G.b.gas + (G.moving ? .6 : 3.5) * dt);

    for (const fd of G.foods) {
      if (fd.taken || fd.wait || Math.hypot(fd.x - G.x, fd.y - (G.y - 6)) > 11) continue;
      fd.taken = true; G.got.add(fd.f.id); nom();
      const add = fd.f.gas * .6; G.b.gas = Math.min(100, G.b.gas + add); G.b.total += add;
      for (const k in fd.f.mix) G.b[k] += fd.f.mix[k] * add;
      G.b.ate.add(fd.f.id);
      if (G.got.size === 8 || G.got.size === 12) setTimeout(() => { if (mode === 'house') say(G.got.size >= 12 ? T.slow2 : T.slow1); }, 1500);
      if (G.got.size === G.foods.length) goal('food');
      say(G.got.size === G.foods.length ? T.allFood : fill(T.got, { food: fd.f.name.toLowerCase() }), G.got.size === G.foods.length ? 4000 : 2200);
    }

    if (G.b.gas >= 100 && !G.alert && G.frozen <= 0) { G.alert = 10; uhoh(); }
    if (G.alert) {
      G.alert -= dt;
      say(fill(T.alert, { n: Math.max(0, Math.ceil(G.alert)) }), 500, true);
      if (G.b.gas < 100) { G.alert = 0; $('#hMsg').hidden = true; }
      else if (G.alert <= 0) {
        G.alert = 0; G.frozen = 2.2; G.dir = 'down'; G.b.gas = 0; G.score = Math.max(0, G.score - 150);
        addGas(G.x, G.y - 6, 160);
        const a = audio(); if (a) SOUNDS.shart(a.currentTime + .02);
        say(T.ohNo, 1100); setTimeout(() => { if (mode === 'house') say(T.oops, 2200); }, 1100);
      }
    }
    if (inRoom('bath', G.x, G.y - 3) && G.b.gas >= 50 && G.frozen <= 0) {
      const pts = G.alert ? 100 : 30; if (G.alert) goal('bath');
      G.score += pts; G.alert = 0; G.b.gas = 0; flush(); say(T.relief); pop(G.x, G.y - 22, fill(T.pts, { n: pts }));
    }

    G.regionT -= dt; if (G.regionT <= 0) { G.regionT = .25; regions(); }
    G.win.forEach((v, n) => { if (v > 0) { G.win[n] = v - dt; if (G.win[n] <= 0) { G.win[n] = 0; regions(); } } });   // someone shuts it again after a while
    gasT += dt; while (gasT > .05) { gasT -= .05; stepGas(); }
    if (G.fridgeOpen > 0) G.fridgeOpen -= dt;

    for (const t of G.targets) {
      if (!t.here) {
        if (G.time < t.arrive) continue;
        t.here = true;
        if (t.with) continue;   // the dogs come in with his brother; one ding
        const dishes = G.foods.filter(fd => fd.wait === t.who); dishes.forEach(fd => fd.wait = null);
        const names = dishes.map(fd => fd.f.name.toLowerCase());
        say(fill(T.ding, { who: T.who[t.who] }) + (names.length ? ' ' + fill(T.brought, { who: T.pron[t.who], foods: names.join(' and ') }) : '') + (G.targets.some(x => x.with === t.who) ? ' ' + T.dogsToo : ''), 3600);
        tone(660, .35, 'sine', 0, .2); tone(523, .5, 'sine', .38, .2);   // ding dong
      }
      walkTarget(t, dt);
      if (t.out) continue;
      if (t.reactT > 0) t.reactT -= dt;
      // only gas you can see counts: in her test the dog scored +10 walking
      // through leftover haze too faint to draw
      const g = gasAt(t.x * TS, t.y * TS - 4);
      if (g > .5) t.dose += g * dt;
      if (t.dose >= t.need) knock(t, 50 + t.need * 4);
      // people who smell it say so, then go and open the window in that room
      if (t.kind === 'person' && g > 2 && t.reactT <= 0 && !t.detour) {
        t.reactT = 18;
        if (near(t) && G.time > (G.quiet || 0)) say(fill(T.quote, { who: T.who[t.who], line: pick(T.ew) }), 2600);
        const r = region[Math.floor(t.y - .2) * MW + Math.floor(t.x)];
        const w = WINDOWS.find((w, n) => !G.win[n] && region[w.iy * MW + w.ix] === r);
        if (w) { t.detour = w; t.path = null; t.wait = .6; }
      }
      if (!t.out && !t.sniffed && t.dose >= t.need * .3 && g > 2) {
        t.sniffed = true; G.score += 10;
        if (t.kind !== 'person') say(fill(T.sniff, { who: T.who[t.who || t.kind] }));
        pop(t.x * TS, t.y * TS - 20, fill(T.pts, { n: 10 }));
      }
    }
    // stepping on a Lego
    if (G.hop > 0) G.hop -= dt;
    for (const l of G.legos) {
      if (l.gone || G.frozen > 0 || Math.hypot(l.x - G.x, l.y - (G.y - 2)) > 6) continue;
      l.gone = true; G.frozen = .7; G.hop = .5; say(pick(T.ow), 1800); G.quiet = G.time + 1.6;   // let the OW be seen
      tone(900, .08, 'square', 0, .1, 1500);
      if (G.b.gas >= 15) {   // the shock lets a little one out
        addGas(G.x, G.y - 4, 15 * 2.6); G.b.gas -= 15;
        G.puffs.push({ x: G.x, y: G.y - 4, t: 0, color: TYPES.squeaker.color, r: 6 });
        playType('squeaker', .6); discover('squeaker');
      }
    }
    for (const p of G.puffs) p.t += dt;
    G.puffs = G.puffs.filter(p => p.t < .7);
    for (const p of G.pops) p.t += dt;
    G.pops = G.pops.filter(p => p.t < 1.2);

    if (at(Math.floor((G.x - 6) / TS), Math.floor((G.y - 3) / TS)) === 'X') {
      if (G.got.size) return finish();
      if (G.needMsgT <= 0) { say(T.needFood); G.needMsgT = 2.5; }
    }
    if (G.needMsgT > 0) G.needMsgT -= dt;
    hud();
  }
  const pop = (x, y, text) => G.pops.push({ x, y, text, t: 0 });
  const nearFridge = () => Math.hypot(28 * TS - G.x, 7 * TS - (G.y - 6)) < 26;

  // the door or fridge Use works on: the nearest within reach
  function useTarget() {
    if (!G) return null;
    if (nearFridge()) return { kind: 'fridge' };
    let best = null, bd = 40;   // was 24: too fiddly to hit in her test
    for (const [x, y] of DOORS) { const d = Math.hypot((x + .5) * TS - G.x, (y + .5) * TS - (G.y - 6)); if (d < bd) { bd = d; best = { kind: 'door', x, y }; } }
    WINDOWS.forEach((w, n) => { const d = Math.hypot((w.ix + .5) * TS - G.x, (w.iy + .5) * TS - (G.y - 6)); if (d < Math.min(bd, 22)) { bd = d; best = { kind: 'window', n, x: w.x, y: w.y }; } });
    return best;
  }
  function use() {
    if (mode !== 'house' || !G || G.frozen > 0) return;
    const u = useTarget(); if (!u) return;
    if (u.kind === 'fridge') { G.fridgeOpen = G.fridgeOpen > 0 ? 0 : 6; return hud(); }
    if (u.kind === 'window') { G.win[u.n] = G.win[u.n] > 0 ? 0 : 999; regions(); return hud(); }
    const open = map[u.y][u.x] === 'd';
    if (open) {   // nobody standing in the doorway
      if (G.targets.some(t => Math.floor(t.x) === u.x && Math.floor(t.y - .2) === u.y)) return;
      // standing in the doorway: step him out to the side he's on, then shut it
      const inDoor = () => corners(G.x, G.y).some(([a, b]) => Math.floor(a / TS) === u.x && Math.floor(b / TS) === u.y);
      if (inDoor()) {
        const across = at(u.x - 1, u.y) === '#', cxd = (u.x + .5) * TS, cyd = (u.y + .5) * TS;
        const tries = across ? [[0, (G.y - 6 < cyd ? -1 : 1)], [0, (G.y - 6 < cyd ? 1 : -1)]] : [[(G.x < cxd ? -1 : 1), 0], [(G.x < cxd ? 1 : -1), 0]];
        for (const [sx, sy] of tries) {
          const nx = across ? G.x : cxd + sx * 14, ny = across ? cyd + 6 + sy * 14 : G.y;
          if (!blocked(nx, ny)) { G.x = nx; G.y = ny; if (!inDoor()) break; }
        }
        if (inDoor()) return;
      }
      map[u.y][u.x] = 'D'; gas[u.y * MW + u.x] = 0;
      for (const t of G.targets) t.path = null;   // everyone works out their way again
    } else map[u.y][u.x] = 'd';
    tone(open ? 140 : 220, .08, 'square', 0, .1);
    hud();
  }

  function fart() {
    if (mode !== 'house' || !G || G.frozen > 0) return;
    audio();
    const strength = G.b.gas;
    if (strength < 12) { say(T.empty); const a = audio(); if (a) SOUNDS.sneaky(a.currentTime, .6); return; }
    let type = whichFart({ ...G.b, gas: strength });
    if (type === 'shart') type = 'trumpet';   // the shart only happens at dinner, or by missing the bathroom
    const ty = TYPES[type];
    const back = { up: [0, 4], down: [0, -12], left: [6, -6], right: [-6, -6] }[G.dir];
    const px = G.x + back[0], py = G.y + back[1];
    if (G.fridgeOpen > 0 && nearFridge()) { G.fridgeGas = Math.max(G.fridgeGas, strength); G.score += 20; say(T.fridgeIn); }
    else {
      addGas(px, py, strength * 2.6);
      // the crop dust: anyone right beside it gets it at once (Randi's test: the
      // plant only wilted a while later, not when she farted by it)
      for (const t of G.targets) if (t.here && !t.out && Math.hypot(t.x * TS - px, t.y * TS - 6 - py) < 30) t.dose += strength * .6;
    }
    G.puffs.push({ x: px, y: py, t: 0, color: ty.color, r: 6 + strength * .12 });
    playType(type, .45 + strength / 200);
    G.b.gas = Math.max(0, G.b.gas - 40);
    discover(type);
  }
  function flush() { const a = audio(); if (a) brap(a.currentTime, 1.1, { f: 300, wave: 'sine', tone: 0, hiss: true, noise: .5, lp: 3000, vol: .35 }); }
  function uhoh() { tone(523, .18, 'square', 0, .12); tone(392, .3, 'square', .22, .12); }

  function finish() {
    mode = 'done'; cancelAnimationFrame(raf);
    let best = Math.max(+store.get('feed-the-fart:best') || 0, G.score); store.set('feed-the-fart:best', best);
    $('#hdTitle').textContent = T.doneTitle;
    const gBest = Math.max(+store.get('feed-the-fart:goals') || 0, G.goals.size); store.set('feed-the-fart:goals', gBest);
    $('#hdText').textContent = fill(T.doneText, { score: G.score, dust: G.dusts, all: G.targets.length, best }) + ' ' + fill(T.goalsDone, { n: G.goals.size, all: GOALS.length }) + ' ' + fill(T.goalsBest, { n: gBest }) + ' ' + T.doneNone;
    $('#hdFoods').innerHTML = '';
    for (const id of G.got) { const f = FOODS.find(x => x.id === id), li = document.createElement('li'); li.innerHTML = `<img src="${spriteURL(id)}" alt="${f.name}" title="${f.name}">`; $('#hdFoods').append(li); }
    $('#houseDone').hidden = false; $('#hdDinner').focus();
  }

  // ---- drawing ----
  // He stays a little above the middle of the screen, clear of the buttons; past
  // the house's edge is dark (clamping the camera to the house put him under
  // the buttons by the front door on an upright phone).
  function cam() { return { x: Math.round(G.x - VW / 2), y: Math.round(G.y - 8 - VH * .44) }; }
  function draw() {
    const c = cam();
    cx.fillStyle = '#2a1a10'; cx.fillRect(0, 0, VW, VH);
    cx.drawImage(mapCan, -c.x, -c.y);
    { // the TV in the living room has the game on: little red and blue players on a field
      const x = 8 * TS + 2 - c.x, y = 6 * TS + 3 - c.y, w = 4 * TS - 4, h = 9, t = G.time;
      cx.fillStyle = '#3f8f3a'; cx.fillRect(x, y, w, h); cx.fillStyle = 'rgba(255,255,255,.55)';
      for (let a = 4; a < w; a += 8) cx.fillRect(x + a, y, 1, h);
      for (let i = 0; i < 6; i++) { const px = (Math.sin(t * 1.3 + i * 1.7) * .5 + .5) * (w - 3), py = (i % 3) * 3 + 1;
        cx.fillStyle = i < 3 ? '#d8344f' : '#3a74b8'; cx.fillRect(Math.round(x + px), y + py, 2, 2); }
      cx.fillStyle = '#7a4a22'; cx.fillRect(Math.round(x + (Math.sin(t * 1.3 + 2) * .5 + .5) * (w - 3)) + 1, y + 4, 2, 1); }
    for (const l of G.legos) if (!l.gone) {
      const s = sprite(`lego-${l.c}`, 6, 5, r => { r(0, 1, 6, 4, l.c); r(1, 0, 1, 1, l.c); r(4, 0, 1, 1, l.c); r(0, 1, 6, 1, 'rgba(255,255,255,.35)'); });
      cx.drawImage(s, Math.round(l.x - 4 - c.x), Math.round(l.y - 4 - c.y));
    }
    // open windows: the glass slid aside, sky showing
    WINDOWS.forEach((w, n) => { if (!G.win[n]) return; const x = w.x * TS - c.x, y = w.y * TS - c.y, front = at(w.x, w.y + 1) !== '#' && at(w.x, w.y + 1) !== 'N';
      cx.fillStyle = '#5ab0e0'; cx.fillRect(x + 3, y + (front ? 6 : 5), 10, front ? 5 : 6); cx.fillStyle = '#ffffff'; cx.fillRect(x + 2, y + (front ? 5 : 4), 2, front ? 7 : 8); cx.fillRect(x + 12, y + (front ? 5 : 4), 2, front ? 7 : 8); });
    // doors and the fridge, which change
    for (const [i, j] of DOORS) {
      const x = i * TS - c.x, y = j * TS - c.y; if (x < -TS || y < -TS || x > VW || y > VH) continue;
      const across = at(i - 1, j) === '#';   // walls left and right: the door runs across
      cx.fillStyle = '#7a4522';
      if (map[j][i] === 'D') { if (across) { cx.fillRect(x, y + 4, TS, 9); cx.fillStyle = '#9a6234'; cx.fillRect(x + 1, y + 5, TS - 2, 7); cx.fillStyle = '#e8c35a'; cx.fillRect(x + 12, y + 8, 2, 2); }
        else { cx.fillRect(x + 3, y, 9, TS); cx.fillStyle = '#9a6234'; cx.fillRect(x + 4, y + 1, 7, TS - 2); cx.fillStyle = '#e8c35a'; cx.fillRect(x + 7, y + 12, 2, 2); } }
      else if (across) cx.fillRect(x, y - 10, 3, 14); else cx.fillRect(x - 10, y, 14, 3);
    }
    { const x = 27 * TS - c.x, y = 6 * TS - c.y;
      cx.fillStyle = '#f0f0ec'; cx.fillRect(x, y, 32, 15); cx.fillStyle = '#b8b8b0'; cx.fillRect(x, y + 13, 32, 2); cx.fillStyle = '#9a9a9a'; cx.fillRect(x + 28, y + 3, 2, 8);
      if (G.fridgeOpen > 0) { cx.fillStyle = '#fff8c8'; cx.fillRect(x + 2, y + 2, 28, 11); cx.fillStyle = '#c8d8e0'; cx.fillRect(x + 2, y + 7, 28, 1); cx.fillStyle = '#ffffff'; cx.fillRect(x + 5, y + 3, 4, 4); cx.fillStyle = '#3a6ea5'; cx.fillRect(x + 5, y + 3, 4, 1); cx.fillStyle = '#f0f0ec'; cx.fillRect(x + 30, y + 14, 4, 12); }
      if (G.fridgeGas > 0) { cx.globalAlpha = .5 + .2 * Math.sin(G.time * 5); cx.fillStyle = '#9fc93a'; cx.fillRect(x + 12, y - 4, 2, 2); cx.fillRect(x + 18, y - 7, 2, 2); cx.globalAlpha = 1; } }
    { const glow = .35 + .25 * Math.sin(G.time * 4);   // the way to dinner glows
      cx.globalAlpha = glow; cx.fillStyle = '#ffe9a0'; cx.fillRect(3 * TS - c.x - 4, 18 * TS - c.y - 4, TS + 22, 2 * TS + 8); cx.globalAlpha = 1; }
    { const u = useTarget(); if (u && Math.floor(G.time * 3) % 2) {   // what Use will open or close
      cx.strokeStyle = '#ffe066'; cx.lineWidth = 1;
      if (u.kind === 'door' || u.kind === 'window') cx.strokeRect(u.x * TS - c.x + .5, u.y * TS - c.y + .5, TS - 1, TS - 1); else cx.strokeRect(27 * TS - c.x + .5, 6 * TS - c.y + .5, 31, 15); } }
    const items = [];
    for (const fd of G.foods) if (!fd.taken && !fd.wait) items.push({ y: fd.y, d: () => { const b = Math.round(Math.sin(G.time * 4 + fd.x) * 1.5); cx.drawImage(foodImg[fd.f.id], Math.round(fd.x - 8 - c.x), Math.round(fd.y - 12 - c.y + b)); } });
    for (const t of G.targets) if (t.here) items.push({ y: t.y * TS, d: () => { const s = targetSprite(t, G.time); cx.drawImage(s, Math.round(t.x * TS - s.width / 2 - c.x), Math.round(t.y * TS - s.height - c.y + 2));
      if (!t.out && gasAt(t.x * TS, t.y * TS - 4) > 1) {   // stink lines: they're breathing it in
        cx.fillStyle = '#7aa83a'; const bx = Math.round(t.x * TS - c.x), by = Math.round(t.y * TS - s.height - c.y - 2), f = Math.floor(G.time * 5) % 2;
        for (const o of [-5, 0, 5]) { cx.fillRect(bx + o, by - 2 - f, 1, 2); cx.fillRect(bx + o + 1, by - 4 + f, 1, 2); } }
      if (t.out && (t.kind === 'dog' || t.kind === 'cat' || t.kind === 'person')) { cx.fillStyle = '#fff'; cx.font = '8px "Press Start 2P", monospace'; cx.fillText('z', Math.round(t.x * TS + 6 - c.x), Math.round(t.y * TS - 16 - c.y - (G.time * 6 % 6))); } } });
    items.push({ y: G.y, d: () => { const s = himSprite(G.frozen > 0 ? 'down' : G.dir, G.step, G.frozen > 0); cx.fillStyle = 'rgba(0,0,0,.2)'; cx.fillRect(Math.round(G.x - 6 - c.x), Math.round(G.y - 2 - c.y), 12, 3); cx.drawImage(s, Math.round(G.x - s.width / 2 - c.x), Math.round(G.y - s.height + 1 - c.y - (G.hop > 0 ? Math.round(Math.abs(Math.sin(G.hop * 12)) * 4) : 0))); } });
    items.sort((a, b) => a.y - b.y).forEach(i => i.d());
    // the gas: a green haze per square, thicker where there's more, in 2 x 2 dither
    const i0 = Math.max(0, Math.floor(c.x / TS)), j0 = Math.max(0, Math.floor(c.y / TS));
    cx.fillStyle = '#9fc93a';
    for (let j = j0; j <= j0 + Math.ceil(VH / TS) && j < MH; j++) for (let i = i0; i <= i0 + Math.ceil(VW / TS) && i < MW; i++) {
      const g = gas[j * MW + i]; if (g < .25) continue;
      const a = Math.min(.66, g / 8), x = i * TS - c.x, y = j * TS - c.y;
      cx.globalAlpha = a; cx.fillRect(x, y, TS, TS);
      if (a > .25) { cx.globalAlpha = a * .5; cx.fillStyle = '#d4e870'; for (let v = 0; v < TS; v += 4) for (let u = (v / 4 + i + j) % 2 * 2; u < TS; u += 4) cx.fillRect(x + u, y + v, 2, 2); cx.fillStyle = '#9fc93a'; }
    }
    cx.globalAlpha = 1;
    for (const p of G.puffs) { cx.globalAlpha = .7 * (1 - p.t / .7); cx.fillStyle = p.color; cx.beginPath(); cx.arc(Math.round(p.x - c.x), Math.round(p.y - c.y), p.r * (.5 + p.t), 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
    cx.font = '8px "Press Start 2P", monospace'; cx.textAlign = 'center';
    for (const p of G.pops) { cx.fillStyle = '#2a1a0e'; cx.fillText(p.text, Math.round(p.x - c.x) + 1, Math.round(p.y - c.y - p.t * 10) + 1); cx.fillStyle = '#ffe066'; cx.fillText(p.text, Math.round(p.x - c.x), Math.round(p.y - c.y - p.t * 10)); }
    cx.textAlign = 'start';
  }
  function frame(t) {
    if (mode !== 'house') return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    try { step(dt); if (mode === 'house') draw(); } catch (e) { console.error(e); }   // one bad frame mustn't stop the loop
    if (mode === 'house') raf = requestAnimationFrame(frame);
  }

  // ---- controls ----
  document.addEventListener('keydown', e => {
    if (mode !== 'house' || document.querySelector('dialog[open]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(k)) { keys[k] = true; e.preventDefault(); }
    else if ((k === ' ' || k === 'f') && !e.repeat) { e.preventDefault(); fart(); }
    else if ((k === 'e' || k === 'Enter') && !e.repeat && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); use(); }
    else if (k === 'c') showColl();
  });
  document.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = false; });
  window.addEventListener('blur', () => { keys = {}; stick.letGo(); hold = null; });
  // the stick and the zoom block come from the kit, like the other steered games
  const stick = RDG.stick('#hStick', '#hStick i');
  RDG.noZoom(() => mode === 'house' || mode === 'car' || mode === 'rest' || mode === 'wed' || mode === 'movie', ['#hStick', '#hFart', '#hUse', '#hc']);
  // A game controller (#56): A farts, B is Use, X is F (a fart in the house,
  // the finger or waking him at dinner), Select is the ? help, Start is Enter,
  // and the left thumbstick drives the stick. The cross pad is the arrow keys.
  RDG.pad({ a: ' ', b: 'e', x: 'f', select: 'h', stick });
  cv.dataset.hold = '';
  const holdAt = e => { const r = cv.getBoundingClientRect(); hold = { x: (e.clientX - r.left) / r.width * VW, y: (e.clientY - r.top) / r.height * VH }; };
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); holdAt(e); });
  cv.addEventListener('pointermove', e => { if (cv.hasPointerCapture(e.pointerId)) holdAt(e); });
  cv.addEventListener('pointerup', () => hold = null); cv.addEventListener('pointercancel', () => hold = null);
  for (const [id, fn] of [['#hFart', fart], ['#hUse', use]]) {
    const b = $(id);
    b.addEventListener('pointerdown', e => { e.preventDefault(); fn(); });
    b.addEventListener('click', e => { if (e.detail === 0) fn(); });   // Enter or Space on the focused button
  }
  const leave = () => document.body.classList.remove('housePlay');
  function goalsHTML() {
    const esc = x => x.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
    return `<b>${esc(fill(T.goalsHead, { n: G ? G.goals.size : 0, all: GOALS.length }))}</b><ul class="goalList">` +
      GOALS.map(id => { const d = G && G.goals.has(id); return `<li class="${d ? 'done' : ''}"><span class="box" aria-hidden="true"></span>${esc(T.goals[id])}<span class="sr">${d ? ' (done)' : ''}</span></li>`; }).join('') + '</ul>';
  }
  // out.js (going out to dinner) borrows the canvas, the stick and the sprites
  // Shared by the levels that walk on a floor of their own (the restaurant,
  // the movie theater): a gas grid like the house's, the walking (keys, stick
  // or a finger held on the screen), the arrow keys, and the haze drawing.
  function gasGrid(MW2, MH2, airtight, fade) {
    const N = MW2 * MH2, gas = new Float32Array(N), g2 = new Float32Array(N);
    return { gas,
      step() {
        for (let k = 0; k < N; k++) {
          if (airtight(k)) { g2[k] = 0; continue; }
          let sum = 0, n = 0;
          for (const d of [-1, 1, -MW2, MW2]) { const q = k + d; if (q >= 0 && q < N && !airtight(q) && Math.abs((q % MW2) - (k % MW2)) <= 1) { sum += gas[q]; n++; } }
          g2[k] = (gas[k] + .1 * (sum - n * gas[k])) * fade;
        }
        gas.set(g2);
      },
      at: (px, py) => { const i = Math.floor(px / TS), j = Math.floor(py / TS); return i < 0 || j < 0 || i >= MW2 || j >= MH2 ? 0 : gas[j * MW2 + i]; },
      add(px, py, amount) {
        const i = Math.floor(px / TS), j = Math.floor(py / TS);
        for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const k = (j + b) * MW2 + i + a; if (k >= 0 && k < N && !airtight(k)) gas[k] += amount * (a || b ? .07 : .44); }
      } };
  }
  const walkKeys = {}, walking = () => mode === 'rest' || mode === 'movie';
  document.addEventListener('keydown', e => {
    if (!walking() || document.querySelector('dialog[open]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(k)) { walkKeys[k] = true; e.preventDefault(); }
  });
  document.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; walkKeys[k] = false; });
  window.addEventListener('blur', () => { for (const k in walkKeys) walkKeys[k] = false; });
  // moves P (x, y, dir, step, frozen, moving) at sp pixels a second; cam(W, H) is the level's camera
  function steer(P, dt, sp, blocked, camFn, t) {
    const s = stick, sx = Math.hypot(s.x, s.y) < .2 ? 0 : s.x, sy = Math.hypot(s.x, s.y) < .2 ? 0 : s.y, k = walkKeys;
    let dx = (k.ArrowRight || k.d ? 1 : 0) - (k.ArrowLeft || k.a ? 1 : 0) + sx;
    let dy = (k.ArrowDown || k.s ? 1 : 0) - (k.ArrowUp || k.w ? 1 : 0) + sy;
    if (hold) { const c = camFn(VW, VH), hx = hold.x + c.x - P.x, hy = hold.y + c.y - (P.y - 8), d = Math.hypot(hx, hy); if (d > 4) { dx += hx / d; dy += hy / d; } }
    const len = Math.hypot(dx, dy);
    if (P.frozen > 0) P.frozen -= dt;
    P.moving = len > .2 && P.frozen <= 0 && !P.done;
    if (!P.moving) { P.step = 0; return; }
    dx /= Math.max(1, len); dy /= Math.max(1, len);
    const m = sp * dt;
    if (!blocked(P.x + dx * m, P.y)) P.x += dx * m;
    if (!blocked(P.x, P.y + dy * m)) P.y += dy * m;
    P.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    P.step = [1, 0, 2, 0][Math.floor(t * 7) % 4];
  }
  function drawGas(gas, MW2, MH2, c) {
    const i0 = Math.max(0, Math.floor(c.x / TS)), j0 = Math.max(0, Math.floor(c.y / TS));
    cx.fillStyle = '#9fc93a';
    for (let j = j0; j <= j0 + Math.ceil(VH / TS) && j < MH2; j++) for (let i = i0; i <= i0 + Math.ceil(VW / TS) && i < MW2; i++) {
      const g = gas[j * MW2 + i]; if (g < .25) continue;
      cx.globalAlpha = Math.min(.66, g / 8); cx.fillRect(i * TS - c.x, j * TS - c.y, TS, TS);
    }
    cx.globalAlpha = 1;
  }
  const kit = { cv, cx, stick, fitView, sprite, himSprite, targetSprite, view: () => [VW, VH], hold: () => hold, gasGrid, steer, drawGas };
  return { kit, goalsHTML, peek: () => G, gas, start,   // peek: for checking the level from the console
    again: () => { $('#houseDone').hidden = true; start(); },
    dinner: () => { $('#houseDone').hidden = true; leave(); startDinner(new Set(G.got)); window.scrollTo(0, 0); } };
})();

$('#startText').textContent = T.start;
$('#startKeys').textContent = T.keys; $('#startKeys').hidden = !T.keys;
$('#startBtn').textContent = T.playHouse; $('#dinnerBtn').textContent = T.justDinner;
$('#hBarLabel').textContent = T.barLabel; $('#hFart').textContent = T.fart; $('#hUse').textContent = T.use;
// One box under the bar for How to play (?) and, in the house, the Goals list.
function toggleHelp(show, kind = 'help') {
  const box = $('#helpBox');
  if (show === undefined) show = box.hidden || box.dataset.kind !== kind;
  box.dataset.kind = kind;
  if (kind === 'goals') box.innerHTML = HOUSE.goalsHTML(); else box.textContent = mode === 'house' ? T.houseHint : mode === 'car' || mode === 'rest' ? T.outHint : mode === 'wed' ? T.wedHint : mode === 'movie' ? T.movHint : T.dinnerHint;
  box.hidden = !show;
  $('#helpBtn').setAttribute('aria-expanded', String(show && kind === 'help')); $('#goalsBtn').setAttribute('aria-expanded', String(show && kind === 'goals'));
}
$('#helpBtn').onclick = () => toggleHelp();
$('#goalsBtn').onclick = () => toggleHelp(undefined, 'goals');
$('#goalsBtn').textContent = T.goalsBtn;
document.addEventListener('keydown', e => { if ((e.key === 'h' || e.key === 'H') && $('#startCover').hidden && !document.querySelector('dialog[open]')) toggleHelp(); });
document.addEventListener('pointerdown', e => { if (!$('#helpBox').hidden && !e.target.closest('#helpBox, #helpBtn, #goalsBtn')) toggleHelp(false); });
$('#hMeter').setAttribute('aria-label', T.barLabel);
$('#hdAgain').textContent = T.again; $('#hdDinner').textContent = T.toDinner;
$('#startBtn').onclick = () => { audio(); $('#startCover').hidden = true; HOUSE.start(); };
$('#hdAgain').onclick = HOUSE.again;
$('#hdDinner').onclick = HOUSE.dinner;
