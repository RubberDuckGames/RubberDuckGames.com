// Out to dinner (Randi, 21 Nov): "add a restaurant scene for going out to
// dinner and getting to there means car farts and getting to bathroom at the
// place". Two parts on the house's canvas, bar and buttons (HOUSE.kit):
//   1. The drive: the van from the side, family in the windows. He's driving,
//      so Use is the window lock: locked in, nobody can roll a window down.
//   2. The restaurant, top-down like the house. The food comes, the shart
//      alert starts, and the bathroom is at the back past the tables and the
//      waiters. A fart on the way buys a few seconds (and gets the diners).
Object.assign(T, {
  outBtn: 'Out to dinner',
  carIntro: "Off to the restaurant! He's driving. Fart in the car; Use locks the windows.",
  lock: 'Lock', unlock: 'Unlock',
  locked: 'Windows locked.', unlocked: 'Windows unlocked.',
  unlockPlz: ['Unlock the windows!!', 'Let me roll it down!', 'Why are the windows locked?!'],
  carEw: ['Ew! Who farted?!', 'Roll the window down!', 'I can taste it!', 'Was that the dog?', 'Are we there yet?!'],
  rolled: '{who} rolled the window down.',
  bump: 'Pothole!',
  carOut: '{who} passed out!',
  arrive: "We're here!",
  inCar: 'In the car', atRest: 'Restaurant',
  eta: 'There in {n}',
  timeLeft: 'Hold it {n}',
  seated: 'Table for six! Your food is here.',
  cheese: 'Extra cheese, please.',
  restAlert: 'Shart alert! The bathroom is at the back! {n}',
  occupied: 'Occupied! Hang on...',
  free: "It's free!",
  bumpWaiter: 'Watch it!',
  dinerEw: ['Check, please!', 'Waiter, what is that smell?', 'Is the kitchen on fire?', 'Ew!', 'Can we move tables?'],
  dinerOut: 'A diner passed out!',
  notCheese: "It wasn't the cheese.",
  outWin: 'Ahh. Made it!',
  outLose: '"I might need a change of clothes."',
  outText: 'Score {score}. In the car you knocked out {car} of {carAll}; at the restaurant, {diners} of {dinersAll}. Best score {best}.',
  outAgain: 'Go out again', outHome: 'Back to the start',
  riders: { mom: 'Mom', kidA: 'The kid', kidB: 'The other kid', crumb: 'Crumb' },
  outHint: 'Out to dinner: car farts on the way, then a race for the restaurant bathroom. In the car: fart with Space, F or the Fart button. Use (or E) locks the windows so nobody can roll one down. At the restaurant: walk with the arrows or the stick (or hold a finger on the screen) and get to the bathroom at the back before the time runs out. A fart on the way buys a few seconds. With a controller: A farts, B is Use, Select opens this.',
});

const OUT = (() => {
  const K = HOUSE.kit, { cv, cx, sprite } = K;
  const TS = 16, INK = '#2a1a0e', GAS = '#9fc93a';
  let G = null, raf = 0, last = 0, msgT = 0, ended = false;
  const say = (text, ms = 2200, alert = false) => { const el = $('#hMsg'); el.textContent = text; el.hidden = false; el.classList.toggle('alert', alert); $('#live').textContent = text; msgT = ms; };
  const font = () => { cx.font = '8px "Press Start 2P", monospace'; };

  // ======================= the drive =======================
  const DRIVE = 45;   // seconds to the restaurant
  // seat 0 is the back row, 1 the middle, 2 the front (him at the wheel)
  const RIDERS = [
    { who: 'mom', seat: 0, dx: 4, need: 40, hair: '#c9c9c9', shirt: '#7d4fa0', skin: '#f0c9a0' },
    { who: 'crumb', seat: 0, dx: 16, dog: true, need: 22 },
    { who: 'kidA', seat: 1, dx: 3, small: true, need: 28, hair: '#e8c35a', shirt: '#e8742a', skin: '#f0c9a0' },
    { who: 'kidB', seat: 1, dx: 17, small: true, need: 28, hair: '#3a2414', shirt: '#7d4fa0', skin: '#c68a5e' },
  ];
  const WIN = [[13, 26], [42, 32], [78, 22]];   // each window's x and width on the van
  // a fart in the car comes out as one of three: the menu says what he ate on the way
  const BELLIES = [{ dairy: 3, sulfur: 0, bread: 1 }, { dairy: 0, sulfur: 3, bread: 1 }, { dairy: 0, sulfur: 0, bread: 3 }];
  function startCar() {
    ended = false;
    $('#hdAgain').textContent = T.again; $('#hdDinner').textContent = T.toDinner; $('#hdDinner').hidden = false;
    G = { part: 'car', time: 0, bar: 30, gas: 0, score: 0, lock: false, open: [0, 0, 0], openT: [0, 0, 0], bumpT: 4, bounce: 0,
      riders: RIDERS.map(r => ({ ...r, kind: r.dog ? 'dog' : 'person', out: false, dose: 0, reactT: 1 + Math.random() * 2 })), puffs: [], carOut: 0, arrived: false };
    mode = 'car';
    document.body.classList.add('housePlay', 'outPlay');
    $('#dinner').hidden = true; $('#house').hidden = false; K.fitView();
    say(T.carIntro, 3600);
    hud();
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function carStep(dt) {
    G.bar = Math.min(100, G.bar + dt * 3.2);
    G.bounce = Math.max(0, G.bounce - dt * 3);
    G.bumpT -= dt;
    if (G.bumpT <= 0) {   // potholes jiggle a little one out if there's enough in there
      G.bumpT = 5 + Math.random() * 4; G.bounce = 1; tone(110, .12, 'square', 0, .12);
      if (G.bar >= 15) { G.bar -= 15; G.gas += 8; G.puffs.push({ seat: 2, t: 0, color: TYPES.squeaker.color }); playType('squeaker', .6); discover('squeaker'); say(T.bump, 1400); }
    }
    // windows: open ones air the van out fast; shut, the gas stays put
    const openSum = G.open.reduce((a, b) => a + b, 0);
    G.gas *= Math.exp(-dt * (.02 + .3 * openSum));
    for (let n = 0; n < 3; n++) {
      if (G.openT[n] > 0) { G.openT[n] -= dt; if (G.openT[n] <= 0) G.open[n] = 0; }   // they roll it back up after a while: it's cold out
    }
    for (const r of G.riders) {
      if (r.out) continue;
      if (G.gas > 2) r.dose += G.gas * dt * .05;
      if (r.dose >= r.need) {
        r.out = true; G.carOut++;
        const pts = (50 + r.need * 4) * (G.lock ? 2 : 1); G.score += pts;
        say(fill(T.carOut, { who: T.riders[r.who] }) + ' +' + pts, 2000); continue;
      }
      r.reactT -= dt;
      if (G.gas > 6 && r.reactT <= 0 && !r.dog) {
        r.reactT = 6 + Math.random() * 3;
        if (!G.open[r.seat]) {
          if (G.lock) say(fill(T.quote, { who: T.riders[r.who], line: pick(T.unlockPlz) }), 2200);
          else { G.open[r.seat] = 1; G.openT[r.seat] = 8; say(fill(T.rolled, { who: T.riders[r.who] }), 2000); }
        } else say(fill(T.quote, { who: T.riders[r.who], line: pick(T.carEw) }), 2000);
      }
    }
    for (const p of G.puffs) p.t += dt;
    G.puffs = G.puffs.filter(p => p.t < .8);
    if (G.time >= DRIVE && !G.arrived) {
      G.arrived = G.time; say(T.arrive, 1800);
    }
    if (G.arrived && G.time - G.arrived > 1.8) startRest();
  }
  function carFart() {
    const s = G.bar;
    if (s < 12) { say(T.empty); return; }
    const belly = { ...pick(BELLIES), sweet: 0, savory: 0, total: 4, gas: s, ate: new Set() };
    const type = whichFart(belly);
    G.gas += s * .6; G.bar = Math.max(0, G.bar - 40);
    G.puffs.push({ seat: 2, t: 0, color: TYPES[type].color });
    playType(type, .45 + s / 200); discover(type);
    if (s >= 60 && G.riders.some(r => (r.who === 'kidA' || r.who === 'kidB') && !r.out)) setTimeout(() => { if (mode === 'car') say(T.yell, 1800); }, 700);
  }
  function carUse() {
    G.lock = !G.lock; tone(G.lock ? 330 : 440, .08, 'square', 0, .1);
    if (G.lock) { G.open = [0, 0, 0]; G.openT = [0, 0, 0]; }   // the lock rolls them all up, too
    say(G.lock ? T.locked : T.unlocked, 1400); hud();
  }
  function carDraw() {
    const [W, H] = K.view(), t = G.time, road = Math.round(H * .64);
    cx.fillStyle = '#9fd0f0'; cx.fillRect(0, 0, W, road);
    cx.fillStyle = '#c8e6f8'; for (let i = 0; i < 4; i++) { const x = ((i * 97 - t * 6) % (W + 60) + W + 60) % (W + 60) - 40; cx.fillRect(Math.round(x), 14 + i * 9, 26, 5); cx.fillRect(Math.round(x) + 5, 11 + i * 9, 14, 3); }   // clouds
    // far hills, then trees and houses going by
    cx.fillStyle = '#7fb06a'; for (let x = 0; x < W; x += 2) { const h = 10 + 6 * Math.sin((x + t * 10) / 23) + 4 * Math.sin((x + t * 10) / 9); cx.fillRect(x, road - 22 - Math.round(h), 2, Math.round(h) + 22); }
    for (let i = 0; i < 6; i++) {
      const span = W + 80, x = Math.round(((i * 71 - t * 40) % span + span) % span - 40), y = road - 8;
      if (i % 3 === 0) { cx.fillStyle = ['#d9a05a', '#c2643a', '#e8c35a'][i % 3 === 0 ? (i / 3) % 3 : 0]; cx.fillRect(x, y - 18, 24, 18); cx.fillStyle = '#8a3a2a'; cx.fillRect(x - 2, y - 24, 28, 6); cx.fillStyle = '#a8d8f0'; cx.fillRect(x + 4, y - 13, 6, 6); cx.fillStyle = '#7a4522'; cx.fillRect(x + 15, y - 11, 5, 11); }
      else { cx.fillStyle = '#5a3418'; cx.fillRect(x + 5, y - 8, 3, 8); cx.fillStyle = i % 2 ? '#d9822b' : '#3f8f3a'; cx.fillRect(x, y - 20, 13, 13); cx.fillRect(x + 2, y - 23, 9, 3); }
    }
    // the restaurant comes into view at the end of the drive
    if (t > DRIVE - 7) {
      const x = Math.round(W - (t - (DRIVE - 7)) * 26), y = road - 6;
      cx.fillStyle = '#c2304a'; cx.fillRect(x - 4, y - 46, 76, 8); cx.fillStyle = '#f4e6c4'; cx.fillRect(x, y - 38, 68, 38);
      cx.fillStyle = '#a8d8f0'; cx.fillRect(x + 6, y - 30, 16, 14); cx.fillRect(x + 46, y - 30, 16, 14); cx.fillStyle = '#7a4522'; cx.fillRect(x + 28, y - 24, 12, 24);
      cx.fillStyle = '#3a2414'; cx.fillRect(x + 22, y - 62, 24, 16); cx.fillRect(x + 32, y - 46, 3, 4);   // the sign: a plate, fork and knife, no words
      cx.fillStyle = '#fffbe9'; cx.fillRect(x + 29, y - 59, 10, 10); cx.fillStyle = '#c9c2b4'; cx.fillRect(x + 31, y - 57, 6, 6); cx.fillStyle = '#e8c35a'; cx.fillRect(x + 25, y - 59, 2, 10); cx.fillRect(x + 41, y - 59, 2, 10);
    }
    // the road
    cx.fillStyle = '#5a8a3a'; cx.fillRect(0, road - 4, W, 4);
    cx.fillStyle = '#4a4a52'; cx.fillRect(0, road, W, H - road);
    cx.fillStyle = '#f5d34a'; for (let x = -((t * 120) % 32); x < W; x += 32) cx.fillRect(Math.round(x), road + 30, 16, 3);
    cx.fillStyle = '#6a6a72'; cx.fillRect(0, road, W, 2);
    // the van
    // drawn at 2x or 3x when the screen is wide, so the faces in the windows read
    const vw = 116, z = Math.max(1, Math.min(3, Math.floor(W / 170))), vx = 0, vy = G.bounce > 0 ? -Math.round(Math.sin(G.bounce * 9) * 2) : (Math.floor(t * 8) % 2);
    cx.save(); cx.setTransform(z, 0, 0, z, Math.round(W / 2 - vw * z / 2), road + 26 - 46 * z);
    cx.fillStyle = 'rgba(0,0,0,.25)'; cx.fillRect(4, 45, vw - 6, 3);
    cx.fillStyle = INK; cx.fillRect(vx - 1, vy + 3, vw + 2, 41); cx.fillRect(vx + 7, vy - 1, 92, 6);
    cx.fillStyle = '#3a6ea5'; cx.fillRect(vx, vy + 4, vw, 39); cx.fillRect(vx + 8, vy, 90, 6);
    cx.fillStyle = '#2f5a88'; cx.fillRect(vx, vy + 32, vw, 11); cx.fillStyle = '#5a8ac8'; cx.fillRect(vx + 8, vy + 1, 88, 2);
    cx.fillStyle = '#f5d34a'; cx.fillRect(vx + vw - 4, vy + 26, 4, 4); cx.fillStyle = '#c2304a'; cx.fillRect(vx, vy + 24, 3, 5);
    // windows, with who's inside; the glass slides down into the door when open
    WIN.forEach(([wx, ww], n) => {
      const x = vx + wx, y = vy + 6, h = 20;
      cx.fillStyle = '#1d2a3a'; cx.fillRect(x, y, ww, h);
      cx.save(); cx.beginPath(); cx.rect(x, y, ww, h); cx.clip();
      if (n === 2) { const s = K.himSprite('right', 0, G.frozen > 0); cx.drawImage(s, x + 3, y + 3); }
      for (const r of G.riders) if (r.seat === n) {
        const s = K.targetSprite(r.dog ? { kind: 'dog', who: r.who, out: r.out } : { kind: 'person', who: r.who, hair: r.hair, shirt: r.shirt, skin: r.skin, out: r.out }, t);
        cx.drawImage(s, x + r.dx - 2, y + (r.dog ? 7 : r.small ? 7 : 3));
        if (r.out && !r.dog) { font(); cx.fillStyle = '#fff'; cx.fillText('z', x + r.dx + 8, y + 6 + (Math.floor(t * 3) % 2)); }
      }
      if (G.gas > 1) { cx.globalAlpha = Math.min(.6, G.gas / 60); cx.fillStyle = GAS; cx.fillRect(x, y, ww, h); cx.globalAlpha = 1; }
      for (const p of G.puffs) if (p.seat === n) { cx.globalAlpha = .7 * (1 - p.t / .8); cx.fillStyle = p.color; cx.beginPath(); cx.arc(x + 8, y + 14, 4 + p.t * 14, 0, 7); cx.fill(); cx.globalAlpha = 1; }
      const glass = G.open[n] ? 3 : h;
      cx.globalAlpha = .28; cx.fillStyle = '#cfeaf8'; cx.fillRect(x, y + h - glass, ww, glass); cx.globalAlpha = 1;
      if (!G.open[n]) { cx.fillStyle = '#e8f6fc'; cx.fillRect(x + 2, y + 2, 2, 6); cx.fillRect(x + 5, y + 2, 1, 3); }
      cx.restore();
      cx.fillStyle = INK; cx.fillRect(x - 1, y - 1, ww + 2, 1); cx.fillRect(x - 1, y + h, ww + 2, 1); cx.fillRect(x - 1, y, 1, h); cx.fillRect(x + ww, y, 1, h);
      if (G.open[n] && G.gas > 1) { cx.globalAlpha = .55; cx.fillStyle = GAS; const f = Math.floor(t * 6) % 3; cx.fillRect(x + ww / 2 - 2 + f, y - 4 - f * 2, 4, 3); cx.fillRect(x + ww / 2 + 3 - f, y - 9 - f, 3, 3); cx.globalAlpha = 1; }   // the stink leaving through the window
    });
    if (G.lock) { cx.fillStyle = '#c2304a'; cx.fillRect(vx + 84, vy + 28, 4, 3); cx.fillRect(vx + 84, vy + 27, 1, 1); cx.fillRect(vx + 87, vy + 27, 1, 1); }   // the little lock light by his door
    cx.fillStyle = INK; cx.fillRect(vx + 40, vy + 6, 1, 26); cx.fillRect(vx + 76, vy + 6, 1, 26);
    cx.fillStyle = '#e8c35a'; cx.fillRect(vx + 62, vy + 29, 5, 1); cx.fillRect(vx + 96, vy + 29, 5, 1);
    for (const wx of [20, 92]) {   // wheels, the hubs turning
      const x = vx + wx, y = vy + 38; cx.fillStyle = INK; cx.fillRect(x - 8, y - 6, 16, 14); cx.fillStyle = '#1d1d22'; cx.fillRect(x - 7, y - 5, 14, 12);
      cx.fillStyle = '#9a9aa6'; cx.fillRect(x - 3, y - 2, 6, 6); cx.fillStyle = '#5a5a66'; const f = Math.floor(t * 12) % 2; cx.fillRect(x - (f ? 1 : 3), y + (f ? -2 : 0), f ? 2 : 6, f ? 6 : 2);
    }
    cx.restore();
  }

  // ======================= the restaurant =======================
  const MW = 30, MH = 17;
  const map = Array.from({ length: MH }, () => Array(MW).fill('#'));
  const put = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) map[j][i] = c; };
  put(1, 1, 8, 4, ',');            // the kitchen
  put(1, 1, 7, 1, 'S'); put(3, 3, 4, 1, 'S');
  put(5, 5, 1, 1, 'd');            // the swinging door the waiters come through
  put(10, 1, 12, 5, '.');          // the upper dining room
  put(1, 6, 28, 10, '.');          // the main room
  put(23, 1, 6, 4, 'b');           // the restroom
  put(27, 1, 1, 1, 'P'); put(24, 1, 1, 1, 'W');
  put(25, 5, 1, 1, 'R');           // its door
  put(14, 16, 2, 1, 'O');          // the front door
  put(19, 14, 1, 1, 'H');          // the host stand
  for (const [x, y] of [[11, 2], [15, 2], [19, 2], [3, 8], [8, 8], [18, 8], [23, 8], [3, 12], [8, 12], [23, 12]]) put(x, y, 2, 1, 'T');
  put(13, 12, 4, 1, 'T');          // the family's table
  put(13, 8, 2, 1, 'T');
  for (const [x, y] of [[1, 6], [28, 6], [1, 15], [28, 15], [10, 1], [21, 1]]) put(x, y, 1, 1, 'p');
  const SOLID = '#SPWOHTpR';
  const at = (i, j) => (i < 0 || j < 0 || i >= MW || j >= MH) ? '#' : map[j][i];
  const solidAt = (px, py) => { const c = at(Math.floor(px / TS), Math.floor(py / TS)); return SOLID.includes(c) && !(c === 'R' && G.occ <= 0); };
  const corners = (x, y) => [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y - 1], [x + 5, y - 1]];
  const blocked = (x, y) => corners(x, y).some(([a, b]) => solidAt(a, b));
  const TOILET = [27.5 * TS, 2.2 * TS];
  // diners at the other tables, and the family at theirs
  const HAIRS = ['#2a1a10', '#8a4b22', '#e8c35a', '#6a6a6a', '#3a2414', '#c9c9c9'], SHIRTS = ['#3f8f5a', '#c2304a', '#3a6ea5', '#d9a420', '#7d4fa0', '#4f7a4a'], SKINS = ['#f0c9a0', '#c68a5e', '#e9b88f', '#8a5a3a', '#d9a074'];
  const DINERS = [[11.5, 2.05], [12.5, 3.95], [15.5, 2.05], [16.5, 3.95], [19.5, 3.95], [3.5, 8.05], [4.5, 9.95], [8.5, 9.95], [13.5, 8.05], [14.5, 9.95], [18.5, 8.05], [19.5, 9.95], [23.5, 8.05], [24.5, 9.95], [3.5, 12.05], [9.5, 13.95], [23.5, 13.95]]
    .map(([x, y], n) => ({ kind: 'person', who: 'diner' + n, x, y, need: 20, hair: HAIRS[n % 6], shirt: SHIRTS[(n * 5) % 6], skin: SKINS[(n * 3) % 5] }));
  const FAMILY = [
    { who: 'mom', x: 13.5, y: 12.05, hair: '#c9c9c9', shirt: '#7d4fa0', skin: '#f0c9a0' }, { who: 'brother1', x: 14.5, y: 12.05, hair: '#5a3a22', shirt: '#2f4f6f', skin: '#e2a978' },
    { who: 'brother2', x: 15.5, y: 12.05, hair: '#7a5232', shirt: '#a0522d', skin: '#d9a074' },
    { who: 'kidA', x: 13.5, y: 13.95, hair: '#e8c35a', shirt: '#e8742a', skin: '#f0c9a0' }, { who: 'kidB', x: 15.5, y: 13.95, hair: '#3a2414', shirt: '#7d4fa0', skin: '#c68a5e' },
  ].map(f => ({ kind: 'person', need: 30, family: true, ...f }));
  // waiters walk set loops along the aisles, a tray up; bumping one costs a moment
  const WAITERS = [
    [[5.5, 6.7], [12.5, 7.2], [22.5, 7.2], [12.5, 10.6]],
    [[5.5, 6.7], [5.5, 10.6], [20.5, 10.6], [26.5, 10.6], [26.5, 6.9], [20.5, 6.9]],
    [[12.5, 4.7], [20.5, 4.7], [21.5, 6.9], [11.5, 6.9]],
  ];
  const airtight = k => { const c = map[Math.floor(k / MW)][k % MW]; return c === '#' || c === 'O' || (c === 'R' && G.occ > 0); };
  const GG = K.gasGrid(MW, MH, airtight, .9986), gas = GG.gas, stepGas = GG.step, gasAt = GG.at, addGas = GG.add;
  // the floor, painted once
  const mapCan = document.createElement('canvas'); mapCan.width = MW * TS; mapCan.height = MH * TS;
  { const m = mapCan.getContext('2d'), R = (x, y, w, h, c) => { m.fillStyle = c; m.fillRect(x, y, w, h); };
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const c = map[j][i], x = i * TS, y = j * TS;
      if (c === '#') { R(x, y, TS, TS, '#4a2c16'); if (at(i, j + 1) !== '#') { R(x, y + 6, TS, 10, '#8a5228'); R(x, y + 6, TS, 2, '#a8693a'); } continue; }
      const floor = c === ',' || c === 'S' ? 'k' : c === 'b' || c === 'P' || c === 'W' ? 'b' : 'f';
      if (floor === 'f') { for (let v = 0; v < TS; v += 8) for (let u = 0; u < TS; u += 8) R(x + u, y + v, 8, 8, ((u + v) / 8 + i + j) % 2 ? '#e8d8b8' : '#b8342e'); }   // red and cream diner tiles
      else if (floor === 'k') { R(x, y, TS, TS, '#b8b8b0'); R(x, y, TS, 1, '#a0a098'); R(x, y, 1, TS, '#a0a098'); }
      else { R(x, y, TS, TS, '#d8eef4'); R(x, y, TS, 1, '#b8d8e0'); R(x, y, 1, TS, '#b8d8e0'); }
      if (c === 'S') { R(x, y, TS, 14, '#8a8a92'); R(x, y, TS, 10, '#c8c8d0'); R(x, y, TS, 2, '#e0e0e8'); if ((i + j) % 2) { R(x + 4, y + 3, 8, 5, '#2a2a30'); R(x + 6, y + 4, 4, 3, '#c2304a'); } }
      if (c === 'T') { R(x, y + 1, TS, 13, '#f4f0e6'); R(x, y + 12, TS, 2, '#c9c2b4'); for (let u = 0; u < TS; u += 4) R(x + u, y + 1, 2, 2, '#c2304a');
        R(x + 4, y + 4, 8, 6, '#ffffff'); R(x + 5, y + 5, 6, 4, (i + j) % 3 ? '#d9822b' : '#7d9a3a'); R(x + 13, y + 4, 1, 6, '#c9c2b4'); }
      if (c === 'P') { R(x + 3, y + 1, 10, 5, '#f4f4f0'); R(x + 4, y + 6, 8, 8, '#f4f4f0'); R(x + 5, y + 7, 6, 5, '#b8d8e8'); }
      if (c === 'W') { R(x + 2, y + 1, 12, 9, '#f4f4f0'); R(x + 4, y + 3, 8, 5, '#b8d8e8'); R(x + 7, y, 2, 3, '#9a9aa6'); }
      if (c === 'O') { R(x, y, TS, TS, '#4a2c16'); R(x + 2, y + 2, 12, 12, '#a8d8f0'); R(x + 2, y + 7, 12, 1, '#7a4522'); }
      if (c === 'H') { R(x + 1, y + 2, 14, 12, '#7a4522'); R(x + 1, y + 2, 14, 3, '#a8693a'); R(x + 4, y + 6, 8, 2, '#f4e6c4'); }
      if (c === 'p') { R(x + 4, y + 9, 8, 6, '#c2643a'); R(x + 2, y + 1, 12, 9, '#3f8f3a'); R(x + 5, y, 6, 4, '#6cbf3f'); }
      if (c === 'd') { R(x, y + 5, TS, 6, '#9a6234'); R(x + 7, y + 5, 2, 6, '#5a3418'); R(x + 3, y + 7, 2, 2, '#a8d8f0'); R(x + 11, y + 7, 2, 2, '#a8d8f0'); }
    }
  }

  function startRest() {
    gas.fill(0);
    G.part = 'rest'; mode = 'rest';
    G.x = 17.5 * TS; G.y = 12.8 * TS; G.dir = 'up'; G.step = 0; G.frozen = 0; G.moving = false;
    G.alert = 0; G.alertStart = 0; G.extra = 0; G.served = false; G.endAt = 0; G.oopsAt = 0; G.occ = 99; G.bar = 40; G.puffs = []; G.pops = []; G.diners = 0; G.done = false; G.restT = 0;
    G.people = [...DINERS, ...FAMILY].map(p => ({ ...p, out: false, dose: 0, reactT: 0 }));
    G.waiters = WAITERS.map((route, n) => ({ who: 'waiter' + n, route, leg: 1, x: route[0][0] * TS, y: route[0][1] * TS, wait: n * 1.5, shirt: '#f4f4f0', hair: HAIRS[(n + 2) % 6], skin: SKINS[(n + 1) % 5] }));
    say(T.seated, 2600); hud();
  }
  function restStep(dt) {
    G.restT += dt;
    // the food comes, he orders extra cheese, and then it hits him (game time, so it waits with the game)
    if (!G.served && G.restT > 2.6) { G.served = true; say(T.cheese, 1600); tone(392, .1, 'square', 0, .1); }
    if (!G.alert && !G.done && G.restT > 4.3) { G.alert = 18; G.alertStart = G.time; G.occ = 4 + Math.random() * 5; G.bar = 100; tone(523, .18, 'square', 0, .12); tone(392, .3, 'square', .22, .12); }
    if (G.endAt && G.time >= G.endAt) { G.endAt = 0; return finish(G.won); }
    if (G.oopsAt && G.time >= G.oopsAt) { G.oopsAt = 0; say(T.oops, 2200); }
    K.steer(G, dt, 66 * (G.alert ? .75 : 1), blocked, cam, G.restT);   // clenching slows him down
    // the restroom door: someone's in there for the first few seconds
    if (G.occ > 0 && G.alert) {
      G.occ -= dt;
      if (G.occ <= 0) { if (Math.hypot(G.x - 25.5 * TS, G.y - 6 * TS) < 60) say(T.free, 1400); tone(660, .1, 'sine', 0, .1); }
      else if (Math.hypot(G.x - 25.5 * TS, G.y - 6.5 * TS) < 18 && msgT <= 0) say(T.occupied, 1400);
    }
    // waiters
    for (const w of G.waiters) {
      if (w.wait > 0) { w.wait -= dt; continue; }
      const [gx, gy] = w.route[w.leg % w.route.length], tx = gx * TS, ty = gy * TS, d = Math.hypot(tx - w.x, ty - w.y);
      if (d < 1.5) { w.leg++; w.wait = .4; continue; }
      const s = Math.min(d, 42 * dt); w.x += (tx - w.x) / d * s; w.y += (ty - w.y) / d * s; w.walk = true;
      if (G.frozen <= 0 && Math.hypot(w.x - G.x, w.y - G.y) < 11) { G.frozen = .8; w.wait = .8; say(T.bumpWaiter, 1200); tone(1200, .05, 'square', 0, .1); tone(900, .08, 'square', .06, .1); tone(1400, .05, 'square', .14, .08); }
    }
    // the alert
    if (G.alert && !G.done) {
      G.bar = Math.min(100, G.bar + dt * 6);
      const left = G.alert + G.extra - (G.time - G.alertStart);
      if (Math.floor(left) !== G.lastLeft) { G.lastLeft = Math.floor(left); say(fill(T.restAlert, { n: Math.max(0, Math.ceil(left)) }), 1200, true); }
      if (Math.hypot(G.x - TOILET[0], G.y - TOILET[1]) < 20 && G.occ <= 0) {
        G.done = true; const bonus = 300 + Math.ceil(left) * 10; G.score += bonus;
        say(T.outWin + ' +' + bonus, 2400); playType('trumpet', .5); G.won = true; G.endAt = G.time + 1.8;
      } else if (left <= 0) {
        G.done = true; G.alert = 0; say(T.ohNo, 1200); playType('shart', 1); discover('shart');
        G.oopsAt = G.time + 1.2; G.won = false; G.endAt = G.time + 3.4;
      }
    }
    // the gas and the people breathing it
    G.gasT = (G.gasT || 0) + dt; while (G.gasT > .05) { G.gasT -= .05; stepGas(); }
    for (const p of G.people) {
      if (p.out) continue;
      const g = gasAt(p.x * TS, p.y * TS - 4);
      if (g > .5) p.dose += g * dt;
      if (p.dose >= p.need) { p.out = true; if (!p.family) G.diners++; const pts = 50 + p.need * 4; G.score += pts; G.pops.push({ x: p.x * TS, y: p.y * TS - 20, t: 0, text: '+' + pts }); if (!G.alert) say(p.family ? fill(T.carOut, { who: T.riders[p.who] || T.who[p.who] }) : T.dinerOut); continue; }
      p.reactT -= dt;
      if (g > 2 && p.reactT <= 0) { p.reactT = 12; if (!G.alert && Math.hypot(p.x * TS - G.x, p.y * TS - G.y) < 120) say(pick(T.dinerEw), 1800); }
    }
    for (const p of G.puffs) p.t += dt;
    G.puffs = G.puffs.filter(p => p.t < .7);
    for (const p of G.pops) p.t += dt;
    G.pops = G.pops.filter(p => p.t < 1);
  }
  function restFart() {
    if (G.frozen > 0 || G.done) return;
    const s = G.bar;
    if (s < 12) { say(T.empty); return; }
    const type = whichFart({ ...pick(BELLIES), sweet: 0, savory: 0, total: 4, gas: Math.min(99, s), ate: new Set() });
    const back = { up: [0, 4], down: [0, -12], left: [6, -6], right: [-6, -6] }[G.dir], px = G.x + back[0], py = G.y + back[1];
    addGas(px, py, s * 2.6);
    for (const p of G.people) if (!p.out && Math.hypot(p.x * TS - px, p.y * TS - 6 - py) < 30) p.dose += s * .6;   // the crop dust
    G.puffs.push({ x: px, y: py, t: 0, color: TYPES[type].color, r: 6 + s * .12 });
    playType(type, .45 + s / 200); discover(type);
    G.bar = Math.max(0, G.bar - 30);
    if (G.alert && G.extra < 9) G.extra += 3;   // letting a little out buys a few seconds
  }
  const cam = (W, H) => ({ x: Math.round(G.x - W / 2), y: Math.round(G.y - 8 - H * .44) });
  function restDraw() {
    const [W, H] = K.view(), c = cam(W, H), t = G.time;
    cx.fillStyle = '#2a1a10'; cx.fillRect(0, 0, W, H);
    cx.drawImage(mapCan, -c.x, -c.y);
    { // the restroom door, with a little toilet sign; red while it's taken
      const x = 25 * TS - c.x, y = 5 * TS - c.y;
      if (G.occ > 0) { cx.fillStyle = '#7a4522'; cx.fillRect(x, y + 4, TS, 9); cx.fillStyle = '#9a6234'; cx.fillRect(x + 1, y + 5, TS - 2, 7); }
      else { cx.fillStyle = '#7a4522'; cx.fillRect(x, y - 10, 3, 14); }
      cx.fillStyle = '#fff'; cx.fillRect(x + 4, y - 9, 8, 9); cx.fillStyle = '#3a6ea5'; cx.fillRect(x + 5, y - 8, 6, 2); cx.fillRect(x + 6, y - 6, 4, 3); cx.fillRect(x + 7, y - 3, 2, 2);
      cx.fillStyle = G.occ > 0 ? '#c2304a' : '#3f8f3a'; cx.fillRect(x + 13, y - 7, 2, 2);
      if (G.alert && !G.done) { cx.globalAlpha = .35 + .25 * Math.sin(t * 6); cx.fillStyle = '#ffe9a0'; cx.fillRect(23 * TS - c.x, 1 * TS - c.y, 6 * TS, 5 * TS); cx.globalAlpha = 1; }   // where to go
    }
    const items = [];
    for (const p of G.people) items.push({ y: p.y * TS, d: () => { const s = K.targetSprite(p, t); cx.drawImage(s, Math.round(p.x * TS - s.width / 2 - c.x), Math.round(p.y * TS - s.height - c.y + 2));
      if (p.out) { font(); cx.fillStyle = '#fff'; cx.textAlign = 'start'; cx.fillText('z', Math.round(p.x * TS + 6 - c.x), Math.round(p.y * TS - 16 - c.y - (t * 6 % 6))); } } });
    for (const w of G.waiters) items.push({ y: w.y, d: () => { const s = K.targetSprite({ kind: 'person', who: w.who, hair: w.hair, shirt: w.shirt, skin: w.skin, walk: w.wait <= 0 }, t), x = Math.round(w.x - c.x), y = Math.round(w.y - c.y);
      cx.drawImage(s, x - s.width / 2, y - s.height + 2); cx.fillStyle = INK; cx.fillRect(x + 3, y - 22, 12, 4); cx.fillStyle = '#c9c9d4'; cx.fillRect(x + 4, y - 21, 10, 2); cx.fillStyle = '#d9822b'; cx.fillRect(x + 6, y - 24, 6, 3); } });
    items.push({ y: G.y, d: () => { const s = K.himSprite(G.frozen > 0 ? 'down' : G.dir, G.step, G.frozen > 0); cx.fillStyle = 'rgba(0,0,0,.2)'; cx.fillRect(Math.round(G.x - 6 - c.x), Math.round(G.y - 2 - c.y), 12, 3); cx.drawImage(s, Math.round(G.x - s.width / 2 - c.x), Math.round(G.y - s.height + 1 - c.y)); } });
    items.sort((a, b) => a.y - b.y).forEach(i => i.d());
    K.drawGas(gas, MW, MH, c);
    for (const p of G.puffs) { cx.globalAlpha = .7 * (1 - p.t / .7); cx.fillStyle = p.color; cx.beginPath(); cx.arc(Math.round(p.x - c.x), Math.round(p.y - c.y), p.r * (.5 + p.t), 0, 7); cx.fill(); }
    cx.globalAlpha = 1; font(); cx.textAlign = 'center';
    for (const p of G.pops) { cx.fillStyle = INK; cx.fillText(p.text, Math.round(p.x - c.x) + 1, Math.round(p.y - c.y - p.t * 10) + 1); cx.fillStyle = '#ffe066'; cx.fillText(p.text, Math.round(p.x - c.x), Math.round(p.y - c.y - p.t * 10)); }
    cx.textAlign = 'start';
  }

  // ======================= shared =======================
  function hud() {
    const g = Math.round(G.bar), w = g >= 100 ? 3 : g >= 50 ? 2 : g >= 15 ? 1 : 0;
    $('#hFill').style.width = g + '%'; $('#hWord').textContent = T.barWords[w];
    $('#hMeter').setAttribute('aria-valuenow', g); $('#hMeter').setAttribute('aria-valuetext', `${g}%, ${T.barWords[w]}`);
    $('#hScore').textContent = fill(T.score, { n: G.score });
    if (G.part === 'car') {
      $('#hRoom').textContent = T.inCar; $('#hFood').textContent = fill(T.eta, { n: Math.max(0, Math.ceil(DRIVE - G.time)) });
      $('#hUse').disabled = false; $('#hUse').textContent = G.lock ? T.unlock : T.lock;
    } else {
      $('#hRoom').textContent = T.atRest;
      $('#hFood').textContent = G.alert && !G.done ? fill(T.timeLeft, { n: Math.max(0, Math.ceil(G.alert + G.extra - (G.time - G.alertStart))) }) : '';
      $('#hUse').disabled = true; $('#hUse').textContent = T.use;
    }
  }
  function frame(now) {
    if (mode !== 'car' && mode !== 'rest') return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    try { step(dt); draw(); } catch (e) { console.error(e); }
    raf = requestAnimationFrame(frame);
  }
  function step(dt) {
    G.time += dt;
    if (msgT > 0) { msgT -= dt * 1000; if (msgT <= 0) $('#hMsg').hidden = true; }
    if (mode === 'car') carStep(dt); else restStep(dt);
    hud();
  }
  const draw = () => mode === 'car' ? carDraw() : restDraw();
  function finish(win) {
    if (mode !== 'rest') return;
    mode = 'done'; ended = true; cancelAnimationFrame(raf);
    const best = Math.max(+store.get('feed-the-fart:outBest') || 0, G.score); store.set('feed-the-fart:outBest', best);
    $('#hdTitle').textContent = win ? T.outWin : T.outLose;
    $('#hdText').textContent = fill(T.outText, { score: G.score, car: G.carOut, carAll: RIDERS.length, diners: G.diners, dinersAll: DINERS.length, best });
    $('#hdFoods').innerHTML = '';
    $('#hdAgain').textContent = T.outAgain; $('#hdDinner').textContent = T.outHome;
    $('#houseDone').hidden = false; $('#hdAgain').focus();
  }
  function home() {
    ended = false; mode = 'start';
    $('#houseDone').hidden = true; $('#hdAgain').textContent = T.again; $('#hdDinner').textContent = T.toDinner;
    document.body.classList.remove('housePlay', 'outPlay'); $('#house').hidden = true; $('#dinner').hidden = false;
    $('#startCover').hidden = false; $('#outBtn').focus();
  }
  const fart = () => { if (mode === 'car') carFart(); else if (mode === 'rest') restFart(); };
  const use = () => { if (mode === 'car') carUse(); };

  document.addEventListener('keydown', e => {
    if ((mode !== 'car' && mode !== 'rest') || document.querySelector('dialog[open]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((k === ' ' || k === 'f') && !e.repeat) { e.preventDefault(); audio(); fart(); }
    else if ((k === 'e' || k === 'Enter') && !e.repeat && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); use(); }
  });
  for (const [id, fn] of [['#hFart', fart], ['#hUse', use]]) {
    const b = $(id);
    b.addEventListener('pointerdown', e => { if (mode === 'car' || mode === 'rest') { e.preventDefault(); audio(); fn(); } });
    b.addEventListener('click', e => { if (e.detail === 0 && (mode === 'car' || mode === 'rest')) fn(); });
  }
  // the end card is the house's; after a night out its buttons go out again or home
  const houseAgain = $('#hdAgain').onclick, houseDinner = $('#hdDinner').onclick;
  $('#hdAgain').onclick = () => { if (ended) { $('#houseDone').hidden = true; startCar(); } else houseAgain(); };
  $('#hdDinner').onclick = () => { if (ended) home(); else houseDinner(); };
  $('#outBtn').textContent = T.outBtn;
  $('#outBtn').onclick = () => { audio(); $('#startCover').hidden = true; startCar(); };
  return { start: startCar, peek: () => G, step, draw, restaurant: startRest };   // peek, step, draw: for checking from the console
})();
