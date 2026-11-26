// Date night (Randi, 23 Nov): "He 'cooks' dinner for his wife, but he doesn't
// cook. He heats, so it's kind of a disaster from the start." Top-down in
// his kitchen, like the movies: three things to heat (frozen lasagna in the
// oven, leftover mac and cheese in the microwave, garlic bread in the
// toaster), each taken from the fridge, put in, taken out when it dings and
// served at the table. Left in too long it burns: smoke, then the smoke
// alarm, and she comes to look. His wife waits in the living room, pops in
// partway through, and sits down when the time is up or all three are on the
// table. His farts hang in the kitchen; the window, the fan over the stove
// and the back door clear them, a fart out the open back door doesn't count,
// and candles on the table help. The score is the food and the smell when
// she sits down. It borrows the house's canvas, buttons, sprites, gas grid
// and walking (HOUSE.kit), like the theater.
// Changed 26 Nov, too easy: she comes in every 14 to 22 seconds, and comes
// running when she hears a loud fart. She smells the whole kitchen, not just
// the doorway. He fills faster and tastes more, the lasagna takes longer, and
// a fart while she is in the kitchen near him costs points.
Object.assign(T, {
  dateBtn: 'Date night',
  dateIntro: 'Make dinner for your wife before she gets hungry. Take the food out of the fridge and heat it up!',
  wife: 'His wife',
  dateHint: 'Date night: he "cooks" dinner for his wife. He heats. Walk with the arrows or the stick (or hold a finger on the kitchen). Use (E) does what fits where he stands: take the next thing from the fridge, put it in the oven, microwave or toaster, take it out when it dings, and serve it at the table. Lasagna goes in the oven, mac and cheese in the microwave, garlic bread in the toaster. Leave it in too long and it burns, and the smoke alarm brings her running. Farts (Space, F or the Fart button) hang in the kitchen: open the window, turn on the fan over the stove, or fart out the open back door. Light the candles on the table. She checks on him every so often, and a loud fart brings her running. When the time is up or all three are served, she sits down to eat.',
  useFridge: 'Fridge', usePut: 'Put in', useTake: 'Take out', useServe: 'Serve', useCandles: 'Candles', useWindow: 'Window', useDoor: 'Door', useFan: 'Fan',
  dishes: { lasagna: 'the lasagna', mac: 'the mac and cheese', garlic: 'the garlic bread' },
  apps: { O: 'oven', W: 'microwave', T: 'toaster' },
  gotFood: 'Got {food}. He tastes it. Just a little.',
  snack: 'Just a little snack.',
  handsFull: 'His hands are full.',
  wrongApp: '{food} doesn\'t go in the {app}.',
  notDone: 'Not done yet.',
  dateDing: 'Ding! {food} is ready.',
  burnt: ['{food} is burning!', 'Is that smoke?!', 'Oh no, {food}!'],
  burnMac: 'The mac and cheese exploded in the microwave!',
  alarm: 'BEEP BEEP BEEP! The smoke alarm!',
  dateServed: 'Served {food}.',
  servedBurnt: 'Served {food}. Crispy.',
  allServed: 'Dinner\'s ready!',
  candlesLit: 'Candles. Fancy.',
  windowOpen: 'Window open.', windowShut: 'Window shut.',
  doorOpen: 'Back door open.', doorShut: 'Back door shut.',
  fanOn: 'Fan on.', fanOff: 'Fan off.',
  outBack: 'Out the back door! +{n}',
  clock: 'Dinner in {n}s', plates: 'Plates {n}/3', alarmOn: 'Alarm!',
  peek: 'How\'s it going in there?',
  peekSmell: ['What IS that smell?!', 'Did something die in here?', 'Oh wow. Okay. I\'ll wait out here.'],
  peekOk: 'Smells... interesting.',
  heardIt: 'What was that noise?!',
  inFront: ['Really?! Right in front of me?', 'Ew! I saw that!', 'Oh come ON.'],
  peekGood: 'Ooh, smells good!',
  peekSmoke: 'Is something BURNING?!',
  sits: 'Okay, I\'m starving. What\'s for dinner?',
  ateOk: '{food}: perfect.', ateBurnt: '{food}: crispy.', ateNone: 'No {food}.',
  smellFresh: 'It smells nice in here!', smellBit: 'It smells a little funny in here.', smellBad: 'Did you cook... farts?',
  cold: 'Why is the window open? It\'s freezing!',
  verdict: ['Best date night ever!', 'It\'s the thought that counts.', 'Well... he tried.', 'Let\'s just order pizza.'],
  dateText: 'Score {score}. {ate} {smell} Best score {best}.',
  dateAgain: 'Make dinner again',
});

const DATE = (() => {
  const K = HOUSE.kit, { cx, cv } = K, TS = 16, INK = '#2a1a0e';
  const MW = 22, MH = 15;
  const map = Array.from({ length: MH }, () => Array(MW).fill('#'));
  const put = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) map[j][i] = c; };
  put(1, 1, 20, 13, '.');
  put(1, 1, 13, 1, 'c');            // the counter along the top
  put(1, 1, 2, 2, 'F');             // the fridge
  put(5, 1, 1, 1, 'W');             // the microwave
  put(7, 1, 1, 1, 'T');             // the toaster
  put(9, 1, 2, 1, 'O');             // the oven
  put(11, 1, 1, 1, 'H');            // the fan switch over the stove
  put(13, 1, 1, 1, 'S');            // the sink
  put(14, 6, 4, 2, 'X');            // the table
  put(0, 5, 1, 2, 'N');             // the window
  put(0, 10, 1, 2, 'B');            // the back door
  put(17, 14, 2, 1, 'L');           // the way to the living room
  const SOLID = '#cFWTOHSXNBL', AIR = '#cFWTOHS';
  const at = (i, j) => (i < 0 || j < 0 || i >= MW || j >= MH) ? '#' : map[j][i];
  const blocked = (x, y) => [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y - 1], [x + 5, y - 1]].some(([a, b]) => SOLID.includes(at(Math.floor(a / TS), Math.floor(b / TS))));
  const GG = K.gasGrid(MW, MH, k => AIR.includes(map[Math.floor(k / MW)][k % MW]) || map[Math.floor(k / MW)][k % MW] === '#', .998);   // a small kitchen holds a smell
  const C = (i, j) => [(i + .5) * TS, (j + .5) * TS];
  // what can be used, and where he has to stand to use it
  const SPOTS = { F: C(1.5, 2.4), W: C(5, 1.4), T: C(7, 1.4), O: C(9.5, 1.4), H: C(11, 1.4), N: C(0.4, 5.5), B: C(0.4, 10.5), X: C(15.5, 6.5) };
  const ITEMS = { lasagna: { app: 'O', cook: 40, burn: 14 }, mac: { app: 'W', cook: 10, burn: 7 }, garlic: { app: 'T', cook: 7, burn: 4 } };
  const ORDER = ['lasagna', 'mac', 'garlic'];
  const MIX = { lasagna: { dairy: 2, savory: 2 }, mac: { dairy: 3 }, garlic: { bread: 3 }, snack: { sweet: 2 } };
  const LENGTH = 110, FILL = 3, TASTE = 20, LOUD = ['trumpet', 'machine', 'rumbler', 'duck', 'squeaker'], SEAT = C(18, 6.1), DOOR = C(17.5, 13.6), PEEK = C(17.5, 11.5);
  const plateAt = n => [(14.7 + n * 1.3) * TS, 6.6 * TS];
  let G = null, raf = 0, last = 0, msgT = 0, ended = false;
  const img = {}; for (const id of ['lasagna', 'mac', 'garlic']) { img[id] = new Image(); img[id].src = spriteURL(id); img[id + '-b'] = new Image(); img[id + '-b'].src = spriteURL(id, true); }
  const say = (text, ms = 2200, alert = false) => { const el = $('#hMsg'); el.textContent = text; el.hidden = false; el.classList.toggle('alert', alert); $('#live').textContent = text; msgT = ms; };
  const cap = s => s[0].toUpperCase() + s.slice(1);

  function start() {
    ended = false; GG.gas.fill(0);
    G = { time: 0, x: 6 * TS, y: 5 * TS, dir: 'up', step: 0, frozen: 0, moving: false, done: false, bar: 20, score: 0, puffs: [], smoke: [],
      hand: null, next: 0, apps: { O: null, W: null, T: null }, plates: [], window: false, door: false, fan: false, candles: false,
      alarm: false, alarmT: 0, snackT: 0, belly: { gas: 100, total: 2, dairy: 1, sulfur: 0, bread: 0, sweet: 0, savory: 1, ate: new Set() },
      wife: { x: DOOR[0], y: DOOR[1] + 20, state: 'away', t: 0, why: '', next: 12 + Math.random() * 6 }, endAt: 0, callAt: 0 };
    mode = 'date';
    document.body.classList.add('housePlay', 'outPlay');
    $('#dinner').hidden = true; $('#house').hidden = false; K.fitView();
    say(T.dateIntro, 3600); hud();
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
  }

  function step(dt) {
    G.time += dt;
    if (msgT > 0) { msgT -= dt * 1000; if (msgT <= 0) $('#hMsg').hidden = true; }
    if (G.endAt && G.time >= G.endAt) { G.endAt = 0; return finish(); }
    if (!G.done) K.steer(G, dt, 62, blocked, cam, G.time);
    if (G.snackT > 0) G.snackT -= dt;
    // the food: cooking, ready (a ding), then burning (smoke and, after a few seconds, the alarm)
    for (const a of 'OWT') {
      const s = G.apps[a]; if (!s) continue;
      s.t += dt; const it = ITEMS[s.id];
      if (s.state === 'cook' && s.t >= it.cook) { s.state = 'ready'; say(fill(T.dateDing, { food: cap(T.dishes[s.id]) }), 2000); tone(1320, .08, 'triangle', 0, .1); tone(1760, .2, 'triangle', .1, .1); }
      else if (s.state === 'ready' && s.t >= it.cook + it.burn) { s.state = 'burnt'; s.burntT = 0; say(s.id === 'mac' ? T.burnMac : cap(fill(pick(T.burnt), { food: T.dishes[s.id] })), 2400, true); tone(220, .3, 'sawtooth', 0, .08); }
      if (s.state === 'burnt') {
        s.burntT += dt; const [x, y] = C(a === 'O' ? 9.5 : a === 'W' ? 5 : 7, 1);
        GG.add(x, y + TS, dt * 2.5);   // burnt food stinks up the kitchen too
        if (Math.random() < dt * 6) G.smoke.push({ x: x + (Math.random() - .5) * 10, y: y + 4, t: 0 });
        if (s.burntT > 3 && !G.alarm) { G.alarm = true; G.alarmT = 0; say(T.alarm, 2600, true); if (G.wife.state === 'away') visit('smoke'); }
      }
    }
    if (G.alarm) { G.alarmT += dt; if (Math.floor(G.alarmT * 4) !== Math.floor((G.alarmT - dt) * 4)) tone(2600, .08, 'square', 0, .05); if (!'OWT'.split('').some(a => G.apps[a] && G.apps[a].state === 'burnt')) G.alarm = false; }
    // the bar: he's nervous and keeps tasting things
    G.bar = Math.min(100, G.bar + dt * FILL);
    if (G.bar >= 100 && !G.done) { say('Uh oh.', 1200); fart(true); }
    // the gas: the window, the back door, the fan and the candles each clear the air near them
    let gs = (G.gasT || 0) + dt; while (gs > .05) { gs -= .05; GG.step(); vents(); } G.gasT = gs;
    for (const q of G.puffs) q.t += dt; G.puffs = G.puffs.filter(q => q.t < .7);
    for (const q of G.smoke) { q.t += dt; q.y -= dt * 10; } G.smoke = G.smoke.filter(q => q.t < 1.6);
    wifeStep(dt);
    if (!G.done && G.plates.length === 3 && !G.callAt && G.wife.state === 'away') { G.callAt = G.time; say(T.allServed, 2000); visit('sit'); }
    if (!G.done && G.time >= LENGTH && G.wife.state !== 'sit' && G.wife.state !== 'tosit') visit('sit');
    hud();
  }
  function vents() {
    const g = GG.gas, near = (i, j, ci, cj, r) => Math.hypot(i - ci, j - cj) <= r;
    for (let j = 1; j < MH - 1; j++) for (let i = 1; i < MW - 1; i++) {
      const k = j * MW + i; if (!g[k]) continue;
      if (G.window && near(i, j, 1, 5.5, 3)) g[k] *= .92;
      if (G.door && near(i, j, 1, 10.5, 3)) g[k] *= .92;
      if (G.fan && near(i, j, 9.5, 2, 3.5)) g[k] *= .93;
      if (G.candles && near(i, j, 15.5, 6.5, 2.5)) g[k] *= .985;
    }
  }

  // she waits in the living room; she comes to look (partway through, or at the alarm), and at the end she sits down
  function visit(why) {
    const w = G.wife;
    if (why === 'sit') { w.state = 'tosit'; w.why = 'sit'; w.route = null; return; }
    if (w.state !== 'away') return;
    w.state = 'in'; w.why = why;
  }
  function wifeStep(dt) {
    const w = G.wife;
    if (G.time >= w.next && w.state === 'away' && !G.done) visit('peek');
    const walk = (tx, ty, sp = 45) => { const dx = tx - w.x, dy = ty - w.y, d = Math.hypot(dx, dy); if (d <= sp * dt) { w.x = tx; w.y = ty; return true; } w.x += dx / d * sp * dt; w.y += dy / d * sp * dt; w.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); return false; };
    if (w.state === 'in') {
      if (walk(PEEK[0], PEEK[1], w.why === 'peek' ? 45 : 80)) { w.state = 'look'; w.t = 0; react(); }
    } else if (w.state === 'look') {
      w.t += dt; if (w.t > 3) w.state = 'out';
    } else if (w.state === 'out') {
      if (walk(DOOR[0], DOOR[1] + 20)) { w.state = 'away'; w.next = G.time + 14 + Math.random() * 8; }
    } else if (w.state === 'tosit') {
      G.done = true;   // dinner's on: he stops and watches
      // up from the door, across below the table, then up to her chair on its right
      if (!w.route) w.route = [[w.x, 8.6 * TS], [SEAT[0], 8.6 * TS], SEAT];
      if (walk(w.route[0][0], w.route[0][1])) w.route.shift();
      if (!w.route.length) { w.state = 'sit'; w.t = 0; say(T.sits, 2400); G.endAt = G.time + 2.6; }
    }
  }
  function react() {
    const w = G.wife, smell = Math.max(smellAt(w.x, w.y, 2), roomSmell()), smoke = 'OWT'.split('').some(a => G.apps[a] && G.apps[a].state === 'burnt');
    let line, pts = 0;
    if (w.why === 'smoke' || smoke) { line = T.peekSmoke; pts = -50; }
    else if (smell > 1.2) { line = pick(T.peekSmell); pts = -60; }
    else if (w.why === 'heard') { line = T.heardIt; pts = -20; }
    else if (smell > .5) line = T.peekOk;
    else { line = T.peekGood; pts = 20; }
    G.score += pts;
    say(fill(T.quote, { who: T.wife, line }), 2600, pts < 0);
  }
  // how strong the smell is around a spot: the average over a few squares
  function smellAt(px, py, r) {
    const ci = Math.floor(px / TS), cj = Math.floor(py / TS); let s = 0, n = 0;
    for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) { if (i < 0 || j < 0 || i >= MW || j >= MH || AIR.includes(map[j][i]) || map[j][i] === '#') continue; s += GG.gas[j * MW + i]; n++; }
    return n ? s / n : 0;
  }

  // the whole kitchen: a thin haze everywhere is still a smell
  const roomSmell = () => smellAt(10 * TS, 7 * TS, 9) * 2.5;
  // what Use would do where he stands: the nearest thing in reach
  function target() {
    let best = null, bd = 30;
    for (const k in SPOTS) { const d = Math.hypot(G.x - SPOTS[k][0], G.y - 6 - SPOTS[k][1]); if (d < bd) { bd = d; best = k; } }
    return best;
  }
  function useLabel(t) {
    if (!t) return T.useFridge;
    if (t === 'F') return T.useFridge;
    if ('OWT'.includes(t)) return G.apps[t] ? T.useTake : T.usePut;
    if (t === 'X') return G.hand ? T.useServe : T.useCandles;
    return { N: T.useWindow, B: T.useDoor, H: T.useFan }[t];
  }
  function use() {
    if (G.done) return;
    const t = target(); if (!t) return;
    if (t === 'F') {
      if (G.hand) return say(T.handsFull, 1400);
      if (G.next < 3) { const id = ORDER[G.next++]; G.hand = { id, state: 'raw' }; taste(id); say(fill(T.gotFood, { food: T.dishes[id] }), 2200); tone(523, .06, 'square', 0, .08); }
      else if (G.snackT <= 0) { G.snackT = 10; taste('snack'); say(T.snack, 1400); }
      return;
    }
    if ('OWT'.includes(t)) {
      const s = G.apps[t];
      if (s) {
        if (s.state === 'cook') return say(T.notDone, 1200);
        if (G.hand) return say(T.handsFull, 1400);
        G.hand = { id: s.id, state: s.state === 'burnt' ? 'burnt' : 'ok' }; G.apps[t] = null; tone(659, .06, 'square', 0, .08);
        return;
      }
      if (!G.hand || G.hand.state !== 'raw') return;
      if (ITEMS[G.hand.id].app !== t) return say(fill(T.wrongApp, { food: cap(T.dishes[G.hand.id]), app: T.apps[t] }), 1800);
      G.apps[t] = { id: G.hand.id, t: 0, state: 'cook' }; G.hand = null; tone(440, .06, 'square', 0, .08); tone(330, .06, 'square', .07, .08);
      return;
    }
    if (t === 'X') {
      if (G.hand && G.hand.state !== 'raw') { G.plates.push(G.hand); say(fill(G.hand.state === 'burnt' ? T.servedBurnt : T.dateServed, { food: T.dishes[G.hand.id] }), 1800); G.hand = null; tone(784, .1, 'triangle', 0, .1); }
      else if (!G.hand && !G.candles) { G.candles = true; say(T.candlesLit, 1600); tone(988, .12, 'sine', 0, .08); }
      return;
    }
    if (t === 'N') { G.window = !G.window; say(G.window ? T.windowOpen : T.windowShut, 1000); }
    if (t === 'B') { G.door = !G.door; say(G.door ? T.doorOpen : T.doorShut, 1000); }
    if (t === 'H') { G.fan = !G.fan; say(G.fan ? T.fanOn : T.fanOff, 1000); }
    tone(330, .05, 'square', 0, .06);
  }
  function taste(id) {
    const b = G.belly, m = MIX[id]; for (const k in m) { b[k] += m[k]; b.total += m[k]; } b.ate.add(id);
    G.bar = Math.min(100, G.bar + (id === 'snack' ? 25 : TASTE));
  }
  function fart(forced) {
    if (G.done || G.frozen > 0) return;
    if (G.bar < 12 && !forced) { say(T.empty); return; }
    const out = Math.min(G.bar, 40), type = whichFart({ ...G.belly, gas: G.bar });
    const back = { up: [0, 4], down: [0, -12], left: [6, -6], right: [-6, -6] }[G.dir], px = G.x + back[0], py = G.y + back[1];
    playType(type, .3 + G.bar / 250); discover(type);
    G.bar = Math.max(0, G.bar - 40);
    if (G.door && Math.hypot(G.x - SPOTS.B[0], G.y - 6 - SPOTS.B[1]) < 26) { G.score += 25; say(fill(T.outBack, { n: 25 }), 1600); return; }   // out into the yard
    const w = G.wife;
    if ((w.state === 'in' || w.state === 'look' || w.state === 'out') && Math.hypot(G.x - w.x, G.y - w.y) < 48) { G.score -= 40; say(fill(T.quote, { who: T.wife, line: pick(T.inFront) }), 2200, true); }   // she saw that
    if (LOUD.includes(type) && w.state === 'away') visit('heard');   // she heard that from the living room
    GG.add(px, py, out * 2.4);
    G.puffs.push({ x: px, y: py, t: 0, color: TYPES[type].color, r: 5 + out * .1 });
  }

  function hud() {
    const g = Math.round(G.bar), w = g >= 100 ? 3 : g >= 50 ? 2 : g >= 15 ? 1 : 0;
    $('#hFill').style.width = g + '%'; $('#hWord').textContent = T.barWords[w];
    $('#hMeter').setAttribute('aria-valuenow', g); $('#hMeter').setAttribute('aria-valuetext', `${g}%, ${T.barWords[w]}`);
    $('#hRoom').textContent = fill(T.clock, { n: Math.max(0, Math.ceil(LENGTH - G.time)) });
    $('#hScore').textContent = fill(T.score, { n: G.score });
    $('#hFood').textContent = fill(T.plates, { n: G.plates.length }) + (G.alarm ? ' · ' + T.alarmOn : '');
    const t = target();
    $('#hUse').disabled = !t || G.done; $('#hUse').textContent = useLabel(t);
  }

  // the end: she tastes everything and smells the room
  function finish() {
    mode = 'done'; ended = true; cancelAnimationFrame(raf);
    let ate = [];
    for (const id of ORDER) {
      const p = G.plates.find(q => q.id === id), food = cap(T.dishes[id]);
      if (!p) ate.push(fill(T.ateNone, { food: T.dishes[id].replace(/^the /, '') }));
      else if (p.state === 'burnt') { G.score += 30; ate.push(fill(T.ateBurnt, { food })); }
      else { G.score += 100; ate.push(fill(T.ateOk, { food })); }
    }
    const smell = Math.max(smellAt(SEAT[0], SEAT[1], 2), roomSmell()) * (G.candles ? .5 : 1);
    let sm;
    if (smell < .4) { G.score += 100; sm = T.smellFresh; } else if (smell < 1.2) sm = T.smellBit; else { G.score -= 100; sm = T.smellBad; }
    if (G.candles) { G.score += 50; sm += ' ' + T.candlesLit; }
    if (G.window || G.door) { G.score -= 20; sm += ' ' + T.cold; }
    if (G.callAt) G.score += Math.round(Math.max(0, LENGTH - G.callAt) * 2);   // done early
    const v = !G.plates.length ? 3 : G.score >= 550 ? 0 : G.score >= 300 ? 1 : G.score >= 100 ? 2 : 3;   // no dinner at all is pizza night
    const best = Math.max(+store.get('feed-the-fart:dateBest') || 0, G.score); store.set('feed-the-fart:dateBest', best);
    $('#hdTitle').textContent = T.verdict[v];
    $('#hdText').textContent = fill(T.dateText, { score: G.score, ate: ate.join(' '), smell: sm, best });
    $('#hdFoods').innerHTML = '';
    $('#hdAgain').textContent = T.dateAgain; $('#hdDinner').hidden = true;   // Menu on the bottom row goes back to the start
    $('#houseDone').hidden = false; $('#hdAgain').focus();
  }

  // ---- drawing ----
  // the camera keeps the kitchen under the bar at the top (the counter, with
  // everything he uses, is the top row) and follows him when it doesn't fit
  const hudTop = W => { const r = cv.getBoundingClientRect(), hb = $('.hhud').getBoundingClientRect(), k = r.width / W || 1; return Math.max(0, Math.ceil((hb.bottom - r.top) / k) + 2); };
  const cam = (W, H) => {
    const top = hudTop(W), room = H - top;
    const x = MW * TS <= W ? Math.round((MW * TS - W) / 2) : Math.max(-8, Math.min(MW * TS - W + 8, Math.round(G.x - W / 2)));
    const y = MH * TS <= room ? -top - Math.round((room - MH * TS) / 2) : Math.max(-top, Math.min(MH * TS - H + 8, Math.round(G.y - 8 - top - room / 2)));
    return { x, y };
  };
  const mapCan = document.createElement('canvas'); mapCan.width = MW * TS; mapCan.height = MH * TS;
  { const m = mapCan.getContext('2d'), R = (x, y, w, h, c) => { m.fillStyle = c; m.fillRect(x, y, w, h); };
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const c = map[j][i], x = i * TS, y = j * TS;
      if (c === '#') { R(x, y, TS, TS, '#5a3a2a'); if (j === 0) { R(x, y + 10, TS, 6, '#e8e0c8'); R(x + (i % 2) * 8, y + 10, 7, 2, '#d8cfb4'); } continue; }
      R(x, y, TS, TS, (i + j) % 2 ? '#e8dcc0' : '#d6c6a4');   // a checked kitchen floor
      if (c === 'c' || c === 'S' || c === 'H') { R(x, y, TS, TS, '#b89a74'); R(x, y, TS, 9, '#e0cfae'); R(x, y + 9, TS, 1, '#8a6a4a'); R(x + 6, y + 11, 4, 2, '#7a5a3a'); }
      if (c === 'S') { R(x + 2, y + 1, 12, 7, '#9aa8b0'); R(x + 4, y + 2, 8, 5, '#c8dce8'); R(x + 7, y, 2, 3, '#7a8a94'); }
      if (c === 'H') { R(x + 4, y + 2, 8, 6, '#8a8a92'); R(x + 6, y + 3, 4, 2, '#c9c9c9'); }
      if (c === 'F') { R(x, y, TS, TS, '#f2f2ee'); R(x + 1, y + (j === 1 ? 1 : 0), 14, 15, '#e4e4de'); if (j === 1) R(x + 12, y + 6, 2, 8, '#9aa0a6'); else { R(x + 12, y + 2, 2, 6, '#9aa0a6'); R(x, y + 15, TS, 1, '#9aa0a6'); } R(x + 1, y + 15 * (j === 1), 14, 1, '#b8b8b0'); }
      if (c === 'W') { R(x, y, TS, TS, '#b89a74'); R(x + 1, y + 1, 14, 9, '#3a3a40'); R(x + 2, y + 2, 9, 7, '#20242a'); R(x + 12, y + 3, 2, 1, '#8fd06a'); R(x + 12, y + 5, 2, 2, '#9a9a9a'); }
      if (c === 'T') { R(x, y, TS, TS, '#b89a74'); R(x + 3, y + 2, 10, 7, '#c9c9cf'); R(x + 5, y + 2, 2, 1, '#2a2a2e'); R(x + 9, y + 2, 2, 1, '#2a2a2e'); R(x + 13, y + 4, 1, 3, '#2a2a2e'); }
      if (c === 'O') { R(x, y, TS, TS, '#2a2a30'); R(x, y, TS, 4, '#4a4a52'); R(x + 3 + (i === 9 ? 1 : 0), y + 1, 3, 2, '#1a1a1e'); R(x + 1, y + 5, 14, 9, '#18181c'); R(x + 3, y + 7, 10, 5, '#3a2a24'); R(x + 2, y + 5, 12, 1, '#9a9aa0'); }
      if (c === 'X') { R(x, y, TS, TS, '#8a5a32'); R(x, y + (j === 6 ? 0 : 13), TS, 3, j === 6 ? '#a8703f' : '#6a4226'); if ((i + j) % 2) R(x + 4, y + 7, 8, 1, '#7a4a28'); }
      if (c === 'N') { R(x, y, TS, TS, '#5a3a2a'); R(x + 4, y + (j === 5 ? 2 : 0), 8, j === 5 ? 14 : 14, '#9fd0f0'); R(x + 4, y + 7 + (j === 5 ? 0 : 0), 8, 1, '#f4f4f0'); }
      if (c === 'B') { R(x, y, TS, TS, '#5a3a2a'); R(x + 3, y + (j === 10 ? 1 : 0), 10, j === 10 ? 15 : 15, '#8a5228'); if (j === 11) R(x + 10, y + 2, 2, 2, '#e8c35a'); }
      if (c === 'L') { R(x, y, TS, TS, '#c8b494'); R(x, y + 12, TS, 4, '#a8946e'); }
    }
    // the chairs and a rug under the table
    R(13 * TS + 4, 6 * TS + 4, 9, 22, '#6a4226'); R(18 * TS + 3, 6 * TS + 4, 9, 22, '#6a4226');
  }
  // her from above: brown hair down her back, a teal top, jeans (nobody in particular)
  function wifeSprite(dir) {
    return K.sprite('wife-' + dir, 12, 18, r => {
      const SKN = '#f0c9a0', HAIR = '#6b3a1e', TOP = '#3a8a8a', JEAN = '#3a4a7a';
      r(3, 13, 2, 4, JEAN); r(7, 13, 2, 4, JEAN); r(2, 17, 3, 1, '#2a1a10'); r(7, 17, 3, 1, '#2a1a10');
      r(2, 7, 8, 7, TOP); r(1, 8, 1, 4, SKN); r(10, 8, 1, 4, SKN);
      if (dir === 'up') { r(2, 0, 8, 8, HAIR); r(3, 7, 6, 3, HAIR); return; }
      r(2, 1, 8, 6, SKN); r(2, 0, 8, 2, HAIR); r(1, 1, 2, 7, HAIR); r(9, 1, 2, 7, HAIR);
      if (dir !== 'left') r(6, 3, 1, 1, INK); if (dir !== 'right') r(4, 3, 1, 1, INK);
      r(4, 5, 3, 1, '#c25a5a');
    });
  }
  function draw() {
    const [W, H] = K.view(), c = cam(W, H), t = G.time;
    cx.fillStyle = '#2a1a12'; cx.fillRect(0, 0, W, H);
    cx.drawImage(mapCan, -c.x, -c.y);
    const R = (x, y, w, h, col) => { cx.fillStyle = col; cx.fillRect(Math.round(x - c.x), Math.round(y - c.y), w, h); };
    // open window and door, the fan's blades, the appliances' lights
    if (G.window) { R(4, 5 * TS + 2, 8, 2, '#5a3a2a'); R(4, 5 * TS + 4, 8, 26, '#cfeaff'); }
    if (G.door) { R(3, 10 * TS + 1, 10, 31, '#3f8f3a'); R(3, 10 * TS + 1, 10, 4, '#9fd0f0'); }
    if (G.fan) { const f = Math.floor(t * 12) % 2; R(11 * TS + 5 + f * 3, TS + 3, 3, 4, '#f4f4f0'); }
    for (const a of 'OWT') {
      const s = G.apps[a]; if (!s) continue;
      const x = (a === 'O' ? 9 : a === 'W' ? 5 : 7) * TS, y = TS;
      if (a === 'O') R(x + 3, y + 7, 26, 5, s.state === 'burnt' ? '#5a3a2a' : '#e8742a');
      if (a === 'W') R(x + 2, y + 2, 9, 7, s.state === 'burnt' ? '#3a2a1a' : '#f5d34a');
      if (a === 'T') R(x + 5, y + 1, 6, 2, s.state === 'burnt' ? '#1a1a1a' : '#e8742a');
      if (s.state === 'ready' && Math.floor(t * 4) % 2) { R(x + (a === 'O' ? 14 : 6), y - 9, 3, 6, '#ffffff'); R(x + (a === 'O' ? 14 : 6), y - 2, 3, 2, '#ffffff'); }
    }
    // the smoke alarm on the wall
    R(8 * TS + 4, 4, 8, 4, '#f4f4f0'); if (G.alarm && Math.floor(t * 6) % 2) R(8 * TS + 6, 5, 4, 2, '#e04848');
    // the table: plates, food, candles
    for (let n = 0; n < 3; n++) { const [px, py] = plateAt(n); R(px - 7, py - 5, 14, 9, '#f4f4f0'); R(px - 5, py - 4, 10, 7, '#e4e0d6'); }
    G.plates.forEach((p, n) => { const [px, py] = plateAt(n), im = img[p.id + (p.state === 'burnt' ? '-b' : '')]; if (im.complete) cx.drawImage(im, Math.round(px - 8 - c.x), Math.round(py - 12 - c.y)); });
    R(15.5 * TS - 1, 7.35 * TS, 2, 6, '#f4f4f0'); R(16.3 * TS - 1, 7.35 * TS, 2, 6, '#f4f4f0');
    if (G.candles) { const f = Math.floor(t * 8) % 2; R(15.5 * TS - 1, 7.35 * TS - 3 - f, 2, 3, '#f5d34a'); R(16.3 * TS - 1, 7.35 * TS - 3 - (1 - f), 2, 3, '#f5d34a'); }
    // people, sorted top to bottom
    const items = [];
    const w = G.wife;
    if (w.state !== 'away') items.push({ y: w.y, d: () => { const s = wifeSprite(w.state === 'sit' ? 'left' : w.state === 'look' ? 'up' : w.dir || 'up'); cx.drawImage(s, Math.round(w.x - s.width / 2 - c.x), Math.round(w.y - s.height + 1 - c.y)); } });
    items.push({ y: G.y, d: () => {
      const s = K.himSprite(G.dir, G.step, false), hx = Math.round(G.x - s.width / 2 - c.x), hy = Math.round(G.y - s.height + 1 - c.y);
      cx.drawImage(s, hx, hy);
      if (G.hand) { const im = img[G.hand.id + (G.hand.state === 'burnt' ? '-b' : '')]; if (im.complete) cx.drawImage(im, Math.round(G.x - 8 - c.x), hy - 13); }
    } });
    items.sort((a, b) => a.y - b.y).forEach(i => i.d());
    K.drawGas(GG.gas, MW, MH, c);
    for (const q of G.smoke) { cx.globalAlpha = .55 * (1 - q.t / 1.6); cx.fillStyle = '#6a6a6a'; const r = 3 + q.t * 4; cx.fillRect(Math.round(q.x - r - c.x), Math.round(q.y - r - c.y), r * 2, r * 2); }
    for (const q of G.puffs) { cx.globalAlpha = .7 * (1 - q.t / .7); cx.fillStyle = q.color; cx.beginPath(); cx.arc(Math.round(q.x - c.x), Math.round(q.y - c.y), q.r * (.5 + q.t), 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
    // the thing Use works on blinks
    const tg = target();
    if (tg && !G.done && Math.floor(t * 3) % 2) { const [sx, sy] = SPOTS[tg]; cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.strokeRect(Math.round(sx - 9 - c.x) + .5, Math.round(sy - 9 - c.y) + .5, 18, 18); }
  }

  function frame(now) {
    if (mode !== 'date') return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    try { step(dt); if (mode === 'date') draw(); } catch (e) { console.error(e); }
    if (mode === 'date') raf = requestAnimationFrame(frame);
  }

  document.addEventListener('keydown', e => {
    if (mode !== 'date' || document.querySelector('dialog[open]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((k === ' ' || k === 'f') && !e.repeat) { e.preventDefault(); audio(); fart(); }
    else if ((k === 'e' || k === 'Enter') && !e.repeat && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); use(); }
  });
  for (const [id, fn] of [['#hFart', () => fart()], ['#hUse', use]]) {
    const b = $(id);
    b.addEventListener('pointerdown', e => { if (mode === 'date') { e.preventDefault(); audio(); fn(); } });
    b.addEventListener('click', e => { if (e.detail === 0 && mode === 'date') fn(); });
  }
  const prevAgain = $('#hdAgain').onclick;
  $('#hdAgain').onclick = () => { if (ended) { ended = false; $('#houseDone').hidden = true; start(); } else prevAgain(); };
  $('#dateBtn').textContent = T.dateBtn;
  $('#dateBtn').onclick = () => { audio(); $('#startCover').hidden = true; start(); };
  return { start, peek: () => G, step, draw, fart, use, target, smell: () => [smellAt(G.wife.x, G.wife.y, 2), roomSmell()], SPOTS, LENGTH };   // for checking from the console
})();
