// On the job (decided 25 Nov): he's a construction plumber on the night shift,
// putting new plumbing into a grocery store that stays open: the drains under
// the new freezers in the aisle, the sink in the back room, a new toilet and a
// drinking fountain by the restrooms. The crew works around him (the foreman,
// an electrician on a ladder, the refrigeration tech, a laborer sweeping) and
// a few night customers shop. Three asks from the same day:
// - "go to a spot and rapidly hit a button but also not shart": a job is done
//   by tapping Use over and over (holding the key doesn't count), and every
//   tap is a strain that adds to the bar. A full bar is a shart and ends the
//   shift, so he has to let some out between jobs.
// - "blame his farts on other crew or fart in a pipe or freezer for someone
//   else to find": when the foreman smells one he blames whoever is closest
//   to him, so a fart left by the electrician is the electrician's. A fart
//   into a job's open pipe stays in the pipe; a fart into an open freezer
//   stays there once the door is shut.
// - "a drinking fountain... so the first drink is a fart": the foreman checks
//   every finished job, and the fountain's check is the first drink.
// Customers who smell it complain, and the foreman hearing or catching him is
// a strike; three strikes and he's sent home. It borrows the house's canvas,
// buttons, sprites, gas grid and walking (HOUSE.kit), like Date night.
Object.assign(T, {
  jobBtn: 'On the job',
  jobIntro: 'Night shift at the grocery store. Get the plumbing in before morning, and don\'t get caught.',
  jobHint: 'On the job: he\'s the plumber on the night shift at a grocery store. Walk with the arrows or the stick (or hold a finger on the store). Each job blinks when he\'s at it: tap Use (E) as fast as you can to get it done. Tap, don\'t hold. Every tap is a strain and fills the bar, and a full bar is a shart that ends the shift, so fart (Space, F or the Fart button) between jobs. When the foreman smells a fart, he blames whoever is closest to him, so leave them by the crew. A fart into a pipe before the job is done stays in the pipe until the foreman checks it. Open a new freezer, fart in it and shut it, and the refrigeration tech finds it. The drinking fountain\'s first drink goes to the foreman. A customer who smells one complains, and the foreman catching him is a strike. Three strikes and he\'s sent home. The loading dock door in the back room lets it out safely. With a controller: A farts, B is Use, Select opens this.',
  useWork: 'Work', useOpen: 'Open', useClose: 'Close', useDock: 'Door',
  jobs: ['the freezer drain', 'the other freezer drain', 'the back room sink', 'the new toilet', 'the drinking fountain'],
  jobDone: '{job}: done! +{n}',
  intoPipe: 'Into the pipe. Saved for later.',
  intoFreezer: 'Into the freezer. Shut the door!',
  dockOut: 'Out the loading dock.',
  dockOpen: 'Dock door open.', dockShut: 'Dock door shut.',
  freezerOpen: 'Freezer open.', freezerShut: 'Freezer shut.',
  clench: 'Clench! He needs to let one out!',
  shart: 'Oh no.', shartGo: 'He has to go home and change.',
  tests: ['The foreman pours water down the drain...', 'The foreman pours water down the drain...', 'The foreman turns on the sink...', 'The foreman flushes the toilet...', 'The foreman takes the first drink...'],
  testOk: 'Looks good.',
  testFart: ['BLORP! The drain burps up a fart!', 'BLORP! The drain burps up a fart!', 'PFFFT! The faucet spits a fart!', 'BRAAAP! The toilet flushes backwards!', 'PFFT! The first drink is a fart!'],
  whoPipes: 'Who put a fart in the pipes?!',
  freezerFind: 'WHO FARTED IN THE FREEZER?!',
  freezerShutIt: 'Shut the door, you\'re letting the cold out.',
  crew: { foreman: 'The foreman', elec: 'The electrician', tech: 'The refrigeration tech', lab: 'The laborer', cust: 'A customer' },
  crewEw: ['Dude!', 'Was that the drain?', 'Smells like a sewer line in here.', 'Somebody open the dock!', 'Oh, come ON.'],
  blamed: 'The foreman blames {who}! +{n}',
  blameLine: ['Really? On the job?', 'Go take a walk.', 'Was that you? Unbelievable.'],
  caught: 'Was that you, plumber?',
  heard: 'I heard that.',
  complain: ['Ew! Something smells in this aisle!', 'Is there a sewer leak?', 'I\'m shopping somewhere else.'],
  strikes: 'Strikes {n}/3',
  sentHome: 'Three strikes. The foreman sends him home.',
  jobCount: 'Jobs {n}/5',
  verdict: ['Employee of the month!', 'Good night\'s work.', 'The foreman wants a word.', 'Sent home early.'],
  jobText: 'Score {score}. Jobs done {jobs} of 5. {extra}Best score {best}.',
  extraFound: 'Farts found by others: {n}. ',
  extraBlamed: 'Blamed on the crew: {n}. ',
  jobAgain: 'Work another night',
});

const JOB = (() => {
  const K = HOUSE.kit, { cx, cv } = K, TS = 16, INK = '#2a1a0e';
  const MW = 32, MH = 20;
  const map = Array.from({ length: MH }, () => Array(MW).fill('#'));
  const put = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) map[j][i] = c; };
  put(1, 1, 30, 18, '.');
  put(2, 1, 16, 1, 'Z');                              // the new freezer cases along the top of the store
  for (const x of [4, 7, 10, 13, 16]) put(x, 5, 1, 8, 'A');   // the aisles' shelves
  for (const x of [3, 6, 9]) put(x, 15, 1, 2, 'K');  // the checkouts
  put(13, 19, 4, 1, 'E');                             // the front doors
  put(20, 1, 1, 18, '|'); map[5][20] = '.'; map[14][20] = '.';   // the back room's door and the restrooms' door
  put(21, 10, 10, 1, '|'); map[10][26] = '.';         // between the back room and the restrooms
  put(23, 1, 3, 1, 'S');                              // the back room sink
  put(29, 1, 1, 1, 'G');                              // his gang box
  put(31, 3, 1, 2, 'B');                              // the loading dock door
  put(23, 18, 1, 1, 'T');                             // the new toilet
  put(20, 16, 1, 1, 'D');                             // the drinking fountain, on the restroom wall
  const SOLID = '#|ZAKESGBTD', AIR = '#|ZSGBTDE';   // gas goes over the shelves and the checkouts, not into the freezers
  const at = (i, j) => (i < 0 || j < 0 || i >= MW || j >= MH) ? '#' : map[j][i];
  const free = (i, j) => !SOLID.includes(at(i, j));
  const blocked = (x, y) => [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y - 1], [x + 5, y - 1]].some(([a, b]) => SOLID.includes(at(Math.floor(a / TS), Math.floor(b / TS))));
  const GG = K.gasGrid(MW, MH, k => AIR.includes(map[Math.floor(k / MW)][k % MW]), .997);   // a big store with the air on
  const C = (i, j) => [(i + .5) * TS, (j + .5) * TS];
  // the jobs, in T.jobs order: where he stands, and the fixture drawn there
  const JOBS = [{ at: C(5, 2.2), fx: [5, 1] }, { at: C(13, 2.2), fx: [13, 1] }, { at: C(24, 2.2), fx: [24, 1] }, { at: C(23, 17.2), fx: [23, 18] }, { at: C(19, 16), fx: [20, 16] }];
  const TAPS = 20, STRAIN = 1.1, FILL = .9, LENGTH = 150;
  const FREEZERS = [C(9, 2.2), C(16, 2.2)], DOCK = C(30.2, 3.5);
  const SPOTS = { j0: JOBS[0].at, j1: JOBS[1].at, j2: JOBS[2].at, j3: JOBS[3].at, j4: JOBS[4].at, f0: FREEZERS[0], f1: FREEZERS[1], B: DOCK };
  const LOOKS = {
    foreman: { id: 'foreman', hat: '#f4f4f0', top: '#4a6a8a', vest: '#f07a2a', legs: '#3a4a6a' },
    elec: { id: 'elec', hat: '#f5d34a', top: '#7a5a3a', legs: '#3a4a6a', belt: true },
    tech: { id: 'tech', hat: '#3a7ac8', top: '#3a6aa8', legs: '#2a2a3a' },
    lab: { id: 'lab', hat: '#f07a2a', top: '#6a6a6a', vest: '#c8e83a', legs: '#4a4a52' },
  };
  const SHIRTS = ['#c25a5a', '#5a8a3a', '#8a5aa8', '#e8b04a', '#4a8ab8', '#d87aa8'], HAIRS = ['#2a1a10', '#6b3a1e', '#c8a050', '#8a8a8a', '#a04a20'], SKINS = ['#f0c9a0', '#c8946a', '#8a5a3a', '#f4d4b4'];
  let G = null, raf = 0, last = 0, msgT = 0, ended = false;
  const say = (text, ms = 2200, alert = false) => { const el = $('#hMsg'); el.textContent = text; el.hidden = false; el.classList.toggle('alert', alert); $('#live').textContent = text; msgT = ms; };
  const cap = s => s[0].toUpperCase() + s.slice(1);

  // the people walk tile to tile on the shortest path (the store is small enough to search every time)
  function path(fx, fy, tx, ty, ok) {
    const prev = new Int16Array(MW * MH).fill(-1), s = fy * MW + fx, goal = ty * MW + tx, q = [s]; prev[s] = s;
    for (let h = 0; h < q.length; h++) {
      const k = q[h]; if (k === goal) break;
      const i = k % MW, j = (k / MW) | 0;
      for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + u, b = j + v, n = b * MW + a; if (a < 0 || b < 0 || a >= MW || b >= MH || prev[n] !== -1 || !ok(a, b)) continue; prev[n] = k; q.push(n); }
    }
    if (prev[goal] === -1) return [];
    const out = []; for (let k = goal; k !== s; k = prev[k]) out.push(C(k % MW, (k / MW) | 0)); return out.reverse();
  }
  const inStore = (i, j) => i < 20 && j < 19 && free(i, j);
  function goTo(p, [tx, ty], ok = free) {
    const i = Math.floor(p.x / TS), j = Math.floor((p.y - 2) / TS);
    p.route = path(i, j, Math.floor(tx / TS), Math.floor(ty / TS), ok); p.route.push([tx, ty]);
  }
  function walk(p, dt) {
    if (!p.route || !p.route.length) return true;
    const [tx, ty] = p.route[0], dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), sp = p.speed * dt;
    if (d > .01) p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    if (d <= sp) { p.x = tx; p.y = ty; p.route.shift(); } else { p.x += dx / d * sp; p.y += dy / d * sp; }
    return !p.route.length;
  }
  const gasAt = (x, y) => GG.gas[Math.floor((y - 4) / TS) * MW + Math.floor(x / TS)] || 0;

  function start() {
    ended = false; GG.gas.fill(0);
    const P = (id, at, speed, more) => ({ id, look: LOOKS[id], x: at[0], y: at[1], dir: 'down', speed, route: [], wait: 0, dose: 0, cool: 0, ...more });
    G = { time: 0, x: 18.5 * TS, y: 3.6 * TS, dir: 'down', step: 0, frozen: 0, moving: false, done: false, bar: 25, score: 0, puffs: [], strikes: 0,
      jobs: JOBS.map(() => ({ p: 0, done: false, fart: false, checked: false })), freezers: FREEZERS.map(() => ({ open: false, fart: false })), dock: false,
      clenched: false, sharted: false, sent: false, found: 0, blamedN: 0, custT: 6, customers: [], tapT: 0,
      belly: { gas: 100, total: 3, dairy: 1, sulfur: 1, bread: 0, sweet: 1, savory: 0, ate: new Set() },   // gas station coffee and a breakfast burrito
      foreman: P('foreman', C(10, 14), 40, { queue: [], patrol: 0, testing: -1 }),
      elec: P('elec', C(18.5, 8), 0, {}),
      tech: P('tech', C(3, 2.5), 32, { stop: 0 }),
      lab: P('lab', C(2, 13.5), 26, { stop: 0 }),
      endAt: 0, allAt: 0 };
    mode = 'job';
    document.body.classList.add('housePlay', 'outPlay');
    $('#dinner').hidden = true; $('#house').hidden = false; K.fitView();
    say(T.jobIntro, 3600); hud();
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
  }
  const crewList = () => [G.foreman, G.elec, G.tech, G.lab];

  function step(dt) {
    G.time += dt;
    if (msgT > 0) { msgT -= dt * 1000; if (msgT <= 0) $('#hMsg').hidden = true; }
    if (G.endAt && G.time >= G.endAt) { G.endAt = 0; return finish(); }
    if (!G.done) K.steer(G, dt, 62, blocked, cam, G.time);
    // the bar fills by itself (coffee and a breakfast burrito), and every tap on a job adds a strain
    if (!G.done) G.bar = Math.min(100, G.bar + dt * FILL);
    if (G.bar >= 85 && !G.clenched && !G.done) { G.clenched = true; say(T.clench, 2000, true); tone(196, .15, 'square', 0, .1); tone(196, .15, 'square', .2, .1); }
    if (G.bar < 70) G.clenched = false;
    if (G.bar >= 100 && !G.done) return shart();
    let gs = (G.gasT || 0) + dt; while (gs > .05) { gs -= .05; GG.step(); vents(); } G.gasT = gs;
    for (const q of G.puffs) q.t += dt; G.puffs = G.puffs.filter(q => q.t < .7);
    if (G.tapT > 0) G.tapT -= dt;
    foremanStep(dt); techStep(dt); labStep(dt); customersStep(dt);
    // the crew breathe it in
    for (const p of [G.elec, G.tech, G.lab]) {
      if (p.cool > 0) p.cool -= dt;
      const g = gasAt(p.x, p.y); if (g > .35) p.dose += g * dt;
      if (p.dose >= 3 && p.cool <= 0) { p.dose = 0; p.cool = 12; p.ew = 2; G.score += 20; say(fill(T.quote, { who: T.crew[p.id], line: pick(T.crewEw) }) + ' +20', 2000); }
      if (p.ew > 0) p.ew -= dt;
    }
    const left = LENGTH - G.time;
    if (!G.done && G.jobs.every(j => j.done) && !G.allAt) G.allAt = G.time;
    // the shift ends once every job is done and checked, or at 6 AM
    if (!G.done && ((G.allAt && G.jobs.every(j => j.checked) && G.foreman.testing < 0) || left <= 0)) { G.done = true; G.endAt = G.time + 1.5; }
    hud();
  }
  function vents() {
    if (!G.dock) return;
    const g = GG.gas;
    for (let j = 1; j < MH - 1; j++) for (let i = 21; i < MW - 1; i++) { const k = j * MW + i; if (g[k] && Math.hypot(i - 30, j - 3.5) <= 4) g[k] *= .9; }
  }

  // the foreman checks each job as it's finished, and otherwise walks round the jobs
  function foremanStep(dt) {
    const f = G.foreman;
    if (f.cool > 0) f.cool -= dt;
    if (f.wait > 0) { f.wait -= dt; if (f.wait <= 0 && f.testing >= 0) test(f.testing); return; }
    if (f.route && f.route.length) { walk(f, dt); }
    else if (f.testing >= 0) { f.wait = 2.2; f.dir = 'up'; say(T.tests[f.testing], 2200); }
    else if (f.queue.length) { f.testing = f.queue.shift(); goTo(f, JOBS[f.testing].at); }
    else { const pts = [JOBS[0].at, C(10, 14), JOBS[4].at, JOBS[2].at, C(18.5, 10)]; f.patrol = (f.patrol + 1) % pts.length; goTo(f, pts[f.patrol]); f.wait = 1.5; }
    // he smells it: whoever is closest to him gets the blame
    if (gasAt(f.x, f.y) > .5 && f.cool <= 0 && !G.done) {
      f.cool = 10;
      const near = [{ who: 'him', x: G.x, y: G.y }, G.elec, G.tech, G.lab].map(p => ({ p, d: Math.hypot(p.x - f.x, p.y - f.y) })).sort((a, b) => a.d - b.d)[0].p;
      if (near.who === 'him') strike(T.caught);
      else { G.score += 75; G.blamedN++; near.ew = 3; say(fill(T.blamed, { who: T.crew[near.id].replace(/^The /, 'the '), n: 75 }) + ' "' + pick(T.blameLine) + '"', 2600); tone(523, .08, 'square', 0, .1); tone(659, .12, 'square', .1, .1); }
    }
  }
  function test(n) {
    const f = G.foreman, j = G.jobs[n]; j.checked = true; f.testing = -1;
    if (j.fart) {
      const pts = n === 4 ? 250 : 150; G.score += pts; G.found++; f.ew = 3; f.cool = 10;   // what comes back up the pipe is nobody's to blame
      say(T.testFart[n] + ' ' + fill(T.quote, { who: T.crew.foreman, line: T.whoPipes }) + ' +' + pts, 3200);
      playType(n === 4 ? 'squeaker' : 'rumbler', .5);
      GG.add(JOBS[n].at[0], JOBS[n].at[1] - 8, 30);   // what came back out of the pipe
    } else say(fill(T.quote, { who: T.crew.foreman, line: T.testOk }), 1600);
  }
  // the refrigeration tech walks the new freezers and checks each one
  function techStep(dt) {
    const p = G.tech;
    if (p.wait > 0) { p.wait -= dt; return; }
    if (walk(p, dt)) {
      const stops = [C(3, 2.5), FREEZERS[0], C(12, 2.5), FREEZERS[1]];
      const k = FREEZERS.findIndex(q => Math.hypot(q[0] - p.x, q[1] - p.y) < 4);
      if (k >= 0) {
        const fz = G.freezers[k];
        if (fz.open) { fz.open = false; say(fill(T.quote, { who: T.crew.tech, line: T.freezerShutIt }), 2000); }
        else if (fz.fart) { fz.fart = false; G.score += 200; G.found++; p.ew = 3; GG.add(p.x, p.y - 10, 50); say(fill(T.quote, { who: T.crew.tech, line: T.freezerFind }) + ' +200', 2800); tone(330, .2, 'sawtooth', 0, .08); }
        p.dir = 'up';
      }
      p.stop = (p.stop + 1) % stops.length; p.wait = 3; goTo(p, stops[p.stop], (i, j) => free(i, j) && j <= 4);
    }
  }
  function labStep(dt) {
    const p = G.lab;
    if (walk(p, dt)) { const stops = [C(2, 13.5), C(18.5, 13.5), C(18.5, 3.5), C(2, 3.5)]; p.stop = (p.stop + 1) % stops.length; goTo(p, stops[p.stop], inStore); }
  }
  // a few night shoppers: in the front doors, round an aisle or two, a checkout, and out
  function customersStep(dt) {
    G.custT -= dt;
    if (G.custT <= 0 && G.customers.length < 3 && G.time < LENGTH - 15) {
      G.custT = 12 + Math.random() * 8;
      const look = { id: 'c' + Math.floor(Math.random() * 1e6), top: pick(SHIRTS), hair: pick(HAIRS), skin: pick(SKINS), legs: pick(['#3a4a7a', '#2a2a2a', '#6a5a4a']) };
      const aisle = () => C(pick([5, 6, 8, 9, 11, 12, 14, 15]), 5 + Math.floor(Math.random() * 8));
      const c = { id: 'cust', look, x: C(14.5, 18)[0], y: C(14.5, 18)[1], dir: 'up', speed: 30, route: [], wait: 0, dose: 0, plan: [aisle(), aisle(), C(pick([4, 7, 10]), 15.5), C(14.5, 18)], gone: false };
      goTo(c, c.plan.shift(), inStore); G.customers.push(c);
    }
    for (const c of G.customers) {
      const g = gasAt(c.x, c.y); if (g > .35 && !c.upset) c.dose += g * dt;
      if (c.dose >= 2.5 && !c.upset) { c.upset = true; c.ew = 3; strike(pick(T.complain), T.crew.cust); c.plan = []; goTo(c, C(14.5, 18), inStore); c.speed = 50; }
      if (c.ew > 0) c.ew -= dt;
      if (c.wait > 0) { c.wait -= dt; continue; }
      if (walk(c, dt)) { if (c.plan.length) { c.wait = 2 + Math.random() * 3; goTo(c, c.plan.shift(), inStore); } else c.gone = true; }
    }
    G.customers = G.customers.filter(c => !c.gone);
  }
  function strike(line, who = T.crew.foreman) {
    if (G.done) return;
    G.strikes++; G.score -= 50;
    say(fill(T.quote, { who, line }) + ' ' + fill(T.strikes, { n: G.strikes }), 2600, true);
    tone(330, .12, 'square', 0, .1); tone(262, .18, 'square', .12, .1);
    if (G.strikes >= 3) { G.done = true; G.sent = true; G.endAt = G.time + 3; setTimeout(() => { if (mode === 'job') say(T.sentHome, 3000, true); }, 1800); }
  }
  function shart() {
    G.done = true; G.sharted = true; G.frozen = 9; G.score -= 200;
    say(T.shart, 2400, true); tone(140, .8, 'sawtooth', 0, .12);
    GG.add(G.x, G.y - 4, 120);
    setTimeout(() => { if (mode === 'job') say(T.shartGo, 2400, true); }, 2000);
    G.endAt = G.time + 4.5;
  }

  // what Use would do where he stands: the nearest thing in reach
  function target() {
    let best = null, bd = 30;
    for (const k in SPOTS) {
      if (k[0] === 'j' && G.jobs[+k[1]].done) continue;
      const d = Math.hypot(G.x - SPOTS[k][0], G.y - 6 - SPOTS[k][1]); if (d < bd) { bd = d; best = k; }
    }
    return best;
  }
  function useLabel(t) {
    if (!t || t[0] === 'j') return T.useWork;
    if (t[0] === 'f') return G.freezers[+t[1]].open ? T.useClose : T.useOpen;
    return T.useDock;
  }
  function use() {
    if (G.done) return;
    const t = target(); if (!t) return;
    if (t[0] === 'j') {   // one tap is one turn of the wrench
      const n = +t[1], j = G.jobs[n];
      j.p += 1 / TAPS; G.bar = Math.min(100, G.bar + STRAIN); G.tapT = .12;
      tone(180 + Math.random() * 60, .03, 'square', 0, .07);
      if (j.p >= 1) { j.done = true; G.score += 100; G.foreman.queue.push(n); say(fill(T.jobDone, { job: cap(T.jobs[n]), n: 100 }), 2000); tone(784, .08, 'triangle', 0, .1); tone(1047, .16, 'triangle', .09, .1); }
      return;
    }
    if (t[0] === 'f') { const fz = G.freezers[+t[1]]; fz.open = !fz.open; say(fz.open ? T.freezerOpen : T.freezerShut, 1000); }
    if (t === 'B') { G.dock = !G.dock; say(G.dock ? T.dockOpen : T.dockShut, 1000); }
    tone(330, .05, 'square', 0, .06);
  }
  function fart() {
    if (G.done || G.frozen > 0) return;
    if (G.bar < 12) { say(T.empty); return; }
    const out = Math.min(G.bar, 40), type = whichFart({ ...G.belly, gas: G.bar });
    const back = { up: [0, 4], down: [0, -12], left: [6, -6], right: [-6, -6] }[G.dir], px = G.x + back[0], py = G.y + back[1];
    playType(type, .3 + G.bar / 250); discover(type);
    G.bar = Math.max(0, G.bar - 40);
    const t = target();
    // into a pipe that isn't finished, into an open freezer, or out the dock door: nobody smells it now
    if (t && t[0] === 'j') { const j = G.jobs[+t[1]]; if (j.p > 0 && !j.fart) { j.fart = true; say(T.intoPipe, 1800); return; } }
    if (t && t[0] === 'f') { const fz = G.freezers[+t[1]]; if (fz.open) { fz.fart = true; say(T.intoFreezer, 1800); return; } }
    if (G.dock && Math.hypot(G.x - DOCK[0], G.y - 6 - DOCK[1]) < 30) { say(T.dockOut, 1400); return; }
    GG.add(px, py, out * 2.4);
    G.puffs.push({ x: px, y: py, t: 0, color: TYPES[type].color, r: 5 + out * .1 });
    const f = G.foreman;
    if (Math.hypot(f.x - px, f.y - 6 - py) < 34) strike(T.heard);
    for (const p of [G.elec, G.tech, G.lab]) if (Math.hypot(p.x - px, p.y - 6 - py) < 30) p.dose += out * .08;
    for (const c of G.customers) if (Math.hypot(c.x - px, c.y - 6 - py) < 30) c.dose += 3;
  }

  const clock = () => { const m = Math.min(480, Math.floor(G.time / LENGTH * 480)), h = (22 + Math.floor(m / 60)) % 24, mm = String(m % 60).padStart(2, '0'); return `${h % 12 || 12}:${mm} ${h >= 12 && h < 24 ? 'PM' : 'AM'}`; };
  function hud() {
    const g = Math.round(G.bar), w = g >= 100 ? 3 : g >= 50 ? 2 : g >= 15 ? 1 : 0;
    $('#hFill').style.width = g + '%'; $('#hWord').textContent = T.barWords[w];
    $('#hMeter').setAttribute('aria-valuenow', g); $('#hMeter').setAttribute('aria-valuetext', `${g}%, ${T.barWords[w]}`);
    $('#hRoom').textContent = clock();
    $('#hScore').textContent = fill(T.score, { n: G.score });
    $('#hFood').textContent = fill(T.jobCount, { n: G.jobs.filter(j => j.done).length }) + (G.strikes ? ' · ' + fill(T.strikes, { n: G.strikes }) : '');
    const t = target();
    $('#hUse').disabled = !t || G.done; $('#hUse').textContent = useLabel(t);
  }

  function finish() {
    mode = 'done'; ended = true; cancelAnimationFrame(raf);
    const n = G.jobs.filter(j => j.done).length;
    if (G.allAt && !G.sent && !G.sharted) G.score += Math.round(Math.max(0, LENGTH - G.allAt) * 2);   // done early
    const v = G.sent || G.sharted ? 3 : G.score >= 900 ? 0 : G.score >= 500 ? 1 : 2;
    const best = Math.max(+store.get('feed-the-fart:jobBest') || 0, G.score); store.set('feed-the-fart:jobBest', best);
    $('#hdTitle').textContent = G.sharted ? T.shart + ' ' + T.shartGo : G.sent ? T.sentHome : T.verdict[v];
    const extra = (G.found ? fill(T.extraFound, { n: G.found }) : '') + (G.blamedN ? fill(T.extraBlamed, { n: G.blamedN }) : '');
    $('#hdText').textContent = fill(T.jobText, { score: G.score, jobs: n, extra, best });
    $('#hdFoods').innerHTML = '';
    $('#hdAgain').textContent = T.jobAgain; $('#hdDinner').hidden = true;
    $('#houseDone').hidden = false; $('#hdAgain').focus();
  }

  // ---- drawing ----
  const hudTop = W => { const r = cv.getBoundingClientRect(), hb = $('.hhud').getBoundingClientRect(), k = r.width / W || 1; return Math.max(0, Math.ceil((hb.bottom - r.top) / k) + 2); };
  const cam = (W, H) => {
    const top = hudTop(W), room = H - top;
    const x = MW * TS <= W ? Math.round((MW * TS - W) / 2) : Math.max(-8, Math.min(MW * TS - W + 8, Math.round(G.x - W / 2)));
    const y = MH * TS <= room ? -top - Math.round((room - MH * TS) / 2) : Math.max(-top, Math.min(MH * TS - H + 8, Math.round(G.y - 8 - top - room / 2)));
    return { x, y };
  };
  const PRODUCT = ['#e04848', '#f5d34a', '#3a8ac8', '#5aa83a', '#e8742a', '#a85ac8', '#f4f4f0'];
  const mapCan = document.createElement('canvas'); mapCan.width = MW * TS; mapCan.height = MH * TS;
  { const m = mapCan.getContext('2d'), R = (x, y, w, h, c) => { m.fillStyle = c; m.fillRect(x, y, w, h); };
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const c = map[j][i], x = i * TS, y = j * TS, back = i > 20 && j < 10, rest = i > 20 && j > 10;
      if (c === '#') { R(x, y, TS, TS, '#4a4a52'); if (j === 0) R(x, y + 10, TS, 6, '#d8d8d0'); continue; }
      if (c === '|') { R(x, y, TS, TS, '#b8b0a0'); R(x + 6, y, 4, TS, '#a09888'); continue; }
      // floors: store tile, back room concrete, restroom tile
      if (back) { R(x, y, TS, TS, '#a8a49a'); if ((i * 7 + j * 3) % 5 === 0) R(x + 5, y + 9, 2, 1, '#98948a'); }
      else if (rest) R(x, y, TS, TS, (i + j) % 2 ? '#e0ecf0' : '#ccdce4');
      else { R(x, y, TS, TS, '#e4e4dc'); R(x, y, TS, 1, '#d4d4cc'); R(x, y, 1, TS, '#d4d4cc'); }
      if (c === 'Z') { R(x, y, TS, TS, '#2a3a4a'); R(x + 1, y + 2, 14, 10, '#9fd0f0'); R(x + 1, y + 2, 14, 2, '#dff2ff'); R(x + 2 + (i % 3) * 4, y + 7, 3, 3, PRODUCT[i % PRODUCT.length]); R(x, y + 12, TS, 4, '#3a4a5a'); R(x + (i % 2 ? 15 : 0), y + 2, 1, 10, '#2a3a4a'); }
      if (c === 'A') { R(x, y, TS, TS, '#8a8a92'); R(x + 2, y, 12, TS, '#a8a8b0'); for (let k = 0; k < 3; k++) R(x + 3 + k * 4, y + 3 + ((i + j + k) % 2) * 6, 3, 4, PRODUCT[(i * 3 + j + k) % PRODUCT.length]); }
      if (c === 'K') { R(x, y, TS, TS, '#4a4a52'); R(x + 2, y + 1, 12, 14, '#2a2a30'); if (j === 15) R(x + 4, y + 3, 8, 3, '#8fd06a'); }
      if (c === 'E') { R(x, y, TS, TS, '#4a4a52'); R(x + 1, y + 2, 14, 12, '#3a4a6a'); R(x + 7, y + 2, 2, 12, '#9a9aa0'); }
      if (c === 'S') { R(x, y, TS, TS, '#9aa8b0'); R(x + 2, y + 3, 12, 9, '#c8dce8'); R(x + 7, y, 2, 4, '#7a8a94'); }
      if (c === 'G') { R(x, y, TS, TS, '#a8a49a'); R(x + 1, y + 3, 14, 11, '#c83a2a'); R(x + 1, y + 3, 14, 2, '#e85a4a'); R(x + 6, y + 6, 4, 2, '#2a2a2a'); }
      if (c === 'B') { R(x, y, TS, TS, '#8a8a92'); for (let k = 0; k < 4; k++) R(x + 2, y + k * 4, 12, 1, '#6a6a72'); }
      if (c === 'T') { R(x + 3, y + 1, 10, 5, '#f4f4f0'); R(x + 2, y + 6, 12, 9, '#f4f4f0'); R(x + 4, y + 7, 8, 6, '#b8d8e8'); }
      if (c === 'D') { R(x, y, TS, TS, '#b8b0a0'); R(x + 1, y + 4, 10, 8, '#9aa8b0'); R(x + 2, y + 5, 7, 5, '#c8dce8'); }
    }
    // the night outside the front doors, and a sign over the back room door
    R(20 * TS - 1, 4 * TS + 6, 18, 4, '#c83a2a');
  }
  // a person from above, in the crew's colours (nobody in particular)
  function person(look, dir) {
    return K.sprite('job-' + look.id + '-' + dir, 12, 18, r => {
      const skin = look.skin || '#f0c9a0', hair = look.hair || '#5a3a1e';
      r(3, 13, 2, 4, look.legs); r(7, 13, 2, 4, look.legs); r(2, 17, 3, 1, '#2a1a10'); r(7, 17, 3, 1, '#2a1a10');
      r(2, 7, 8, 7, look.top);
      if (look.vest) { r(2, 7, 2, 7, look.vest); r(8, 7, 2, 7, look.vest); r(2, 11, 8, 1, '#e8e8e0'); }
      if (look.belt) r(2, 12, 8, 2, '#4a3020');
      r(1, 8, 1, 4, skin); r(10, 8, 1, 4, skin);
      if (dir === 'up') r(3, 1, 6, 6, hair);
      else { r(3, 1, 6, 6, skin); r(3, 1, 6, 1, hair); if (dir !== 'left') r(7, 3, 1, 1, INK); if (dir !== 'right') r(4, 3, 1, 1, INK); }
      if (look.hat) { r(3, 0, 6, 2, look.hat); r(2, 2, 8, 1, look.hat); } else r(3, 0, 6, 2, hair);
    });
  }
  function draw() {
    const [W, H] = K.view(), c = cam(W, H), t = G.time;
    cx.fillStyle = '#14141c'; cx.fillRect(0, 0, W, H);
    cx.drawImage(mapCan, -c.x, -c.y);
    const R = (x, y, w, h, col) => { cx.fillStyle = col; cx.fillRect(Math.round(x - c.x), Math.round(y - c.y), w, h); };
    // the dock door open to the night
    if (G.dock) { R(31 * TS + 1, 3 * TS, 14, 32, '#1a1a2a'); R(31 * TS + 4, 3 * TS + 6, 1, 1, '#f4f4f0'); R(31 * TS + 10, 4 * TS + 3, 1, 1, '#f4f4f0'); }
    // the new freezers' doors
    FREEZERS.forEach((q, k) => { const fz = G.freezers[k], x = Math.floor(q[0] / TS) * TS; if (fz.open) { R(x + 1, TS + 12, 14, 8, '#dff2ff'); R(x + 1, TS + 12, 14, 1, '#6a8aa0'); } if (fz.fart) for (let n = 0; n < 2; n++) R(x + 4 + n * 6, TS + 3 + Math.round(Math.sin(t * 3 + n) * 1.5), 2, 2, '#9ac85a'); });
    // the jobs: copper stubs until done, a progress bar while he works, a stored fart's wisp
    JOBS.forEach((jb, n) => {
      const j = G.jobs[n], [fx, fy] = jb.fx, x = fx * TS, y = fy * TS;
      if (!j.done) { const sx = n === 4 ? x + 2 : x + 6, sy = n === 3 ? y - 2 : n === 4 ? y + 2 : y + 12; R(sx, sy, 3, 5, '#c87a3a'); R(sx - 1, sy, 5, 1, '#e8a05a'); }
      else if (n < 2) { R(x + 5, y + 13, 6, 2, '#9aa0a6'); }
      if (j.p > 0 && !j.done) { const [ax, ay] = jb.at; R(ax - 10, ay - 30, 20, 4, '#2a1a0e'); R(ax - 9, ay - 29, Math.round(18 * j.p), 2, '#8fd06a'); }
      if (j.fart && !j.checked) R(x + 7, y + 2 + Math.round(Math.sin(t * 3 + n) * 1.5), 2, 2, '#9ac85a');
    });
    // the electrician's ladder
    R(G.elec.x - 7, G.elec.y - 26, 2, 28, '#c8a050'); R(G.elec.x + 5, G.elec.y - 26, 2, 28, '#c8a050'); for (let k = 0; k < 4; k++) R(G.elec.x - 7, G.elec.y - 22 + k * 7, 14, 1, '#c8a050');
    // people, sorted top to bottom
    const items = [];
    const add = (p, lift = 0) => items.push({ y: p.y, d: () => {
      const s = person(p.look, p.wait > 0 && p === G.foreman && p.testing >= 0 ? 'up' : p.dir), hx = Math.round(p.x - s.width / 2 - c.x), hy = Math.round(p.y - s.height + 1 - lift - c.y);
      cx.drawImage(s, hx, hy);
      if (p.ew > 0) { cx.fillStyle = '#9ac85a'; for (let k = 0; k < 3; k++) cx.fillRect(hx + 2 + k * 4, hy - 3 - ((Math.floor(t * 6) + k) % 3), 1, 2); }
    } });
    add(G.foreman); add(G.elec, 12); add(G.tech); add(G.lab); for (const p of G.customers) add(p);
    items.push({ y: G.y, d: () => {
      const s = K.himSprite(G.dir, G.tapT > 0 ? 1 : G.step, G.sharted), hx = Math.round(G.x - s.width / 2 - c.x), hy = Math.round(G.y - s.height + 1 - c.y);
      cx.drawImage(s, hx, hy);
      if (G.clenched && Math.floor(t * 6) % 2) { cx.fillStyle = '#9fd0f0'; cx.fillRect(hx + s.width, hy + 2, 2, 3); }   // a bead of sweat
    } });
    items.sort((a, b) => a.y - b.y).forEach(i => i.d());
    // the laborer's broom
    R(G.lab.x + 5, G.lab.y - 10, 1, 9, '#c8a050'); R(G.lab.x + 3, G.lab.y - 2, 5, 2, '#8a6a3a');
    K.drawGas(GG.gas, MW, MH, c);
    for (const q of G.puffs) { cx.globalAlpha = .7 * (1 - q.t / .7); cx.fillStyle = q.color; cx.beginPath(); cx.arc(Math.round(q.x - c.x), Math.round(q.y - c.y), q.r * (.5 + q.t), 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
    const tg = target();
    if (tg && !G.done && Math.floor(t * 3) % 2) { const [sx, sy] = SPOTS[tg]; cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.strokeRect(Math.round(sx - 9 - c.x) + .5, Math.round(sy - 15 - c.y) + .5, 18, 18); }
  }

  function frame(now) {
    if (mode !== 'job') return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    try { step(dt); if (mode === 'job') draw(); } catch (e) { console.error(e); }
    if (mode === 'job') raf = requestAnimationFrame(frame);
  }

  document.addEventListener('keydown', e => {
    if (mode !== 'job' || document.querySelector('dialog[open]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((k === ' ' || k === 'f') && !e.repeat) { e.preventDefault(); audio(); fart(); }
    else if ((k === 'e' || k === 'Enter') && !e.repeat && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); use(); }   // held keys don't count: tap it
  });
  for (const [id, fn] of [['#hFart', () => fart()], ['#hUse', use]]) {
    const b = $(id);
    b.addEventListener('pointerdown', e => { if (mode === 'job') { e.preventDefault(); audio(); fn(); } });
    b.addEventListener('click', e => { if (e.detail === 0 && mode === 'job') fn(); });
  }
  const prevAgain = $('#hdAgain').onclick;
  $('#hdAgain').onclick = () => { if (ended) { ended = false; $('#houseDone').hidden = true; start(); } else prevAgain(); };
  $('#jobBtn').textContent = T.jobBtn;
  $('#jobBtn').onclick = () => { audio(); $('#startCover').hidden = true; start(); };
  return { start, peek: () => G, step, draw, fart, use, target, SPOTS, JOBS, LENGTH, gas: GG };   // for checking from the console
})();
