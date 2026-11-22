// The movie theater (Randi's idea, 21 Nov): "he needs to fart to keep the loud
// people from talking, but not too much that he disturbs everyone". Top-down
// like the house: rows of seats, the screen across the top. People in the
// audience start talking on their phones now and then; every second they
// talk upsets the crowd. Walk behind a talker and fart: once they've breathed
// enough they leave ("Ugh, let's go."). Use shushes a talker for a few
// seconds, no smell. But the gas drifts onto the quiet people too, and a fart
// in a quiet scene is heard. The crowd bar full, the lights come up and the
// usher shows him out; the movie ends, he wins. Added 22 Nov: an usher walks
// the aisles with a flashlight. Fart where the beam (or the usher's nose) can
// find him and it's a strike; three strikes and he's walked out. It borrows the house's
// canvas, buttons, sprites, gas grid and walking (HOUSE.kit).
Object.assign(T, {
  movBtn: 'The movies',
  movStart: 'Or go to the movies and fart the loud talkers out.',
  movIntro: 'Shut the talkers up! Fart behind them. Not too much... and watch out for the usher.',
  shush: 'Shush', someone: 'Someone',
  talking: ['Blah blah blah', 'No, YOU hang up!', '*loud chewing*', 'Wait, who is that guy?', 'I saw this already'],
  shushed: 'Shhh!',
  talkerLeft: ['Ugh, what is that? Let’s go.', 'I can’t breathe in here!', 'We’re moving seats!'],
  talkerOut: 'A talker left! +{n}',
  watcherEw: ['Shh! What is that smell?', 'Seriously?', 'Ew, who did that?', 'Was that the popcorn?'],
  heard: 'Shhh! (They heard that.)',
  crowd: 'Crowd upset {n}%',
  movWin: 'What a great movie!',
  movLose: 'The lights come up. The usher points at the door.',
  movText: 'Score {score}. He farted {gone} talkers out of the theater. The crowd ended {n}% upset. Best score {best}.',
  movAgain: 'Go to the movies again', movHome: 'Back to the start',
  usherWarn: ['The usher is watching you.', 'Last warning from the usher!'],
  usherLose: 'Three strikes! The usher walks him out.',
  strikes: 'Usher {n}/3',
  movHint: 'People in the audience start talking (a glowing phone and dots). Every second they talk upsets the crowd. Walk behind a talker and fart (Space, F or the Fart button): when they’ve breathed enough, they leave. Shush (Use or E) quiets a talker you’re next to for a few seconds. But the gas drifts onto quiet people too, and a fart in a quiet scene gets heard. Loud scenes (explosions, car chases) cover the sound. If the crowd gets too upset, the usher shows him out. And watch the usher with the flashlight: a fart in the beam, or right next to the usher, is a strike. Three strikes and you’re out. Shushing is fine.',
});

const THEATER = (() => {
  const K = HOUSE.kit, { cx, cv } = K, TS = 16, INK = '#2a1a0e';
  const MW = 24, MH = 17;   // small enough that most screens show the whole room, the movie included
  const map = Array.from({ length: MH }, () => Array(MW).fill('#'));
  const put = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) map[j][i] = c; };
  put(1, 1, 22, 15, '.');
  put(2, 1, 20, 2, 'M');            // the screen
  const ROWS = [5, 7, 9, 11, 13];
  for (const y of ROWS) { put(2, y, 9, 1, 's'); put(13, y, 9, 1, 's'); }   // seats; aisles at the sides and down the middle
  put(11, 16, 2, 1, 'O');           // the doors
  const SOLID = '#Ms';
  const at = (i, j) => (i < 0 || j < 0 || i >= MW || j >= MH) ? '#' : map[j][i];
  const blocked = (x, y) => [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y - 1], [x + 5, y - 1]].some(([a, b]) => SOLID.includes(at(Math.floor(a / TS), Math.floor(b / TS))));
  const GG = K.gasGrid(MW, MH, k => map[Math.floor(k / MW)][k % MW] === '#', .996);   // a big room with the air on: it fades
  // the movie: quiet scenes and loud ones; a fart is heard if it's louder than the scene
  const MOVIE = [[8, .1, 'Opening scene'], [4, 1, 'Explosion!'], [9, .08, 'The kissing scene'], [5, .95, 'Car chase!'], [8, .1, 'The sad part'],
    [3, 1, 'Jump scare!'], [9, .12, 'Talking scene'], [6, 1, 'The big battle'], [8, .06, 'Very quiet scene'], [4, .9, 'Helicopter crash!'], [10, .1, 'The ending'], [6, .6, 'The credits']];
  const STARTS = []; { let t = 0; for (const m of MOVIE) { STARTS.push(t); t += m[0]; } }
  const LENGTH = STARTS[STARTS.length - 1] + MOVIE[MOVIE.length - 1][0];
  const sceneAt = t => { let i = 0; while (i < MOVIE.length - 1 && t >= STARTS[i + 1]) i++; return i; };
  // the usher's walk: down the middle aisle, along the first row (the front is under the movie), down the side aisles, along the back
  const WALK = [[12, 15.2], [12, 6.2], [1.5, 6.2], [1.5, 15.2], [22.5, 15.2], [22.5, 6.2], [12, 6.2]].map(([x, y]) => [x * TS, y * TS]);
  const BEAM = 150, WIDE = .65, NEAR = 26;   // how far the flashlight reaches, half its width, and how close is "right next to"
  const HAIRS = ['#2a1a10', '#8a4b22', '#e8c35a', '#6a6a6a', '#3a2414', '#c9c9c9', '#c2643a'], SHIRTS = ['#3f8f5a', '#c2304a', '#3a6ea5', '#d9a420', '#7d4fa0', '#4f7a4a', '#e8742a'];
  const FAMILY = [[15, 13, 'mom', '#c9c9c9', '#7d4fa0'], [16, 13, 'kidA', '#e8c35a', '#e8742a'], [17, 13, 'kidB', '#3a2414', '#7d4fa0']];
  let G = null, raf = 0, last = 0, msgT = 0, ended = false;
  const say = (text, ms = 2200, alert = false) => { const el = $('#hMsg'); el.textContent = text; el.hidden = false; el.classList.toggle('alert', alert); $('#live').textContent = text; msgT = ms; };

  function start() {
    ended = false; GG.gas.fill(0);
    const people = [];
    let n = 0;
    for (const y of ROWS) for (let x = 2; x < 22; x++) {
      if (map[y][x] !== 's') continue;
      const fam = FAMILY.find(f => f[0] === x && f[1] === y);
      if (fam) { people.push({ x: x + .5, y: y + .9, who: fam[2], hair: fam[3], shirt: fam[4], family: true }); continue; }
      if ((x * 7 + y * 13) % 5 < 2 && !(y === 13 && x >= 13 && x <= 18)) people.push({ x: x + .5, y: y + .9, who: 'm' + n, hair: HAIRS[n % 7], shirt: SHIRTS[(n * 3) % 7] }), n++;
    }
    G = { time: 0, x: 14.5 * TS, y: 14.8 * TS, dir: 'up', step: 0, frozen: 0, moving: false, done: false, bar: 30, crowd: 0, score: 0, gone: 0, puffs: [], nextTalk: 5, endAt: 0,
      strikes: 0, out: false,
      usher: { x: WALK[0][0], y: WALK[0][1], to: 1, wait: 2, face: -Math.PI / 2, beam: -Math.PI / 2, watchT: 0 },
      people: people.map(p => ({ ...p, dose: 0, talking: false, quietT: 0, ewT: 0, complained: false, left: false, leaveT: 0 })) };
    mode = 'movie';
    document.body.classList.add('housePlay', 'outPlay');
    $('#dinner').hidden = true; $('#house').hidden = false; K.fitView();
    say(T.movIntro, 3200); hud();
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function step(dt) {
    G.time += dt;
    if (msgT > 0) { msgT -= dt * 1000; if (msgT <= 0) $('#hMsg').hidden = true; }
    if (G.endAt && G.time >= G.endAt) { G.endAt = 0; return finish(G.won); }
    if (G.done) return;
    K.steer(G, dt, 60, blocked, cam, G.time);
    G.bar = Math.min(100, G.bar + dt * 3);   // popcorn and a big soda
    // someone starts talking every so often, sooner as the movie goes on
    G.nextTalk -= dt;
    if (G.nextTalk <= 0) {
      G.nextTalk = Math.max(4, 10 - G.time / 15) + Math.random() * 3;
      const quiet = G.people.filter(p => !p.family && !p.left && !p.talking);
      if (quiet.length) { const p = pick(quiet); p.talking = true; p.line = pick(T.talking); }
    }
    walkUsher(dt);
    let gasStep = (G.gasT || 0) + dt; while (gasStep > .05) { gasStep -= .05; GG.step(); } G.gasT = gasStep;
    for (const p of G.people) {
      if (p.left) { p.leaveT += dt; continue; }
      if (p.quietT > 0) p.quietT -= dt;
      if (p.ewT > 0) p.ewT -= dt;
      const g = GG.at(p.x * TS, p.y * TS - 4);
      if (g > .5) p.dose += g * dt;
      if (p.talking) {
        if (p.quietT <= 0) G.crowd += dt * .6;
        if (p.dose >= 6) { p.left = true; p.talking = false; G.gone++; const pts = 100; G.score += pts; G.crowd = Math.max(0, G.crowd - 8); say(pick(T.talkerLeft) + ' ' + fill(T.talkerOut, { n: pts }), 2200); tone(523, .08, 'square', 0, .1); tone(784, .12, 'square', .1, .1); }
      } else if (g > 1.2 && !p.complained && p.dose >= 8) {
        p.complained = true; p.ewT = 4; G.crowd += 5; say(fill(T.quote, { who: p.family ? T.riders[p.who] : T.someone, line: pick(T.watcherEw) }), 2000);
      } else if (p.complained && p.dose >= 20 && !p.family) { p.left = true; G.crowd += 3; }
    }
    G.crowd = Math.min(100, G.crowd);
    for (const q of G.puffs) q.t += dt; G.puffs = G.puffs.filter(q => q.t < .7);
    if (G.crowd >= 100) { G.done = true; G.won = false; say(T.movLose, 3000, true); tone(196, .5, 'square', 0, .12); G.endAt = G.time + 3; }
    else if (G.time >= LENGTH) { G.done = true; G.won = true; G.score += Math.round((100 - G.crowd) * 3); say(T.movWin, 2400); G.endAt = G.time + 2.2; }
    hud();
  }
  // the usher walks the loop, stops at each corner to look around, and sweeps the light as they go
  function walkUsher(dt) {
    const u = G.usher;
    if (u.watchT > 0) { u.watchT -= dt; u.beam = Math.atan2(G.y - u.y, G.x - u.x); return; }   // the light stays on him
    if (u.wait > 0) u.wait -= dt;
    else {
      const [tx, ty] = WALK[u.to], dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy), sp = 40 * dt;
      if (d <= sp) { u.x = tx; u.y = ty; u.to = (u.to + 1) % WALK.length; u.wait = 1.5; }
      else { u.x += dx / d * sp; u.y += dy / d * sp; u.face = Math.atan2(dy, dx); }
    }
    u.beam = u.face + Math.sin(G.time * 1.3) * (u.wait > 0 ? 1.8 : 1.3);
    // the usher smells it: a strong cloud on the usher with him close by
    if (GG.at(u.x, u.y - 6) > .7 && Math.hypot(G.x - u.x, G.y - u.y) < 56) strike();
  }
  function seen() {
    const u = G.usher, dx = G.x - u.x, dy = G.y - u.y, d = Math.hypot(dx, dy);
    if (d < NEAR) return true;
    if (d > BEAM) return false;
    let a = Math.atan2(dy, dx) - u.beam; a = Math.atan2(Math.sin(a), Math.cos(a));
    return Math.abs(a) < WIDE;
  }
  function strike() {
    const u = G.usher;
    if (G.done || u.watchT > 0) return;
    G.strikes++; u.watchT = 3;
    if (G.strikes >= 3) { G.done = true; G.won = false; G.out = true; say(T.usherLose, 3000, true); tone(196, .5, 'square', 0, .12); G.endAt = G.time + 3; }
    else { say(T.usherWarn[G.strikes - 1], 2200, true); tone(330, .12, 'square', 0, .1); tone(262, .18, 'square', .12, .1); }
  }
  function fart() {
    if (G.done || G.frozen > 0) return;
    if (G.bar < 12) { say(T.empty); return; }
    const scene = MOVIE[sceneAt(G.time)], loud = .2 + G.bar / 125;
    const type = whichFart({ gas: G.bar, total: 4, dairy: 2, sulfur: 1, bread: 1, sweet: 0, savory: 0, ate: new Set() });   // popcorn with butter
    const back = { up: [0, 4], down: [0, -12], left: [6, -6], right: [-6, -6] }[G.dir], px = G.x + back[0], py = G.y + back[1];
    GG.add(px, py, G.bar * 2.4);
    for (const p of G.people) if (!p.left && Math.hypot(p.x * TS - px, p.y * TS - 6 - py) < 30) p.dose += G.bar * .12;   // right behind them
    G.puffs.push({ x: px, y: py, t: 0, color: TYPES[type].color, r: 5 + G.bar * .1 });
    playType(type, scene[1] >= loud ? .25 : .45 + G.bar / 200); discover(type);
    if (scene[1] < loud) { G.crowd += 12; say(T.heard, 1600); }
    if (seen()) strike();
    G.bar = Math.max(0, G.bar - 40);
  }
  function shush() {
    if (G.done) return;
    const p = G.people.filter(q => q.talking && q.quietT <= 0).sort((a, b) => Math.hypot(a.x * TS - G.x, a.y * TS - G.y) - Math.hypot(b.x * TS - G.x, b.y * TS - G.y))[0];
    if (!p || Math.hypot(p.x * TS - G.x, p.y * TS - G.y) > 30) return;
    p.quietT = 8; say(T.shushed, 1000); tone(1800, .05, 'sine', 0, .05);
  }
  function hud() {
    const g = Math.round(G.bar), w = g >= 100 ? 3 : g >= 50 ? 2 : g >= 15 ? 1 : 0, sc = MOVIE[sceneAt(G.time)];
    $('#hFill').style.width = g + '%'; $('#hWord').textContent = T.barWords[w];
    $('#hMeter').setAttribute('aria-valuenow', g); $('#hMeter').setAttribute('aria-valuetext', `${g}%, ${T.barWords[w]}`);
    $('#hRoom').textContent = `${sc[2]} (${sc[1] >= .85 ? T.loud : T.quiet})`;
    $('#hScore').textContent = fill(T.score, { n: G.score });
    $('#hFood').textContent = fill(T.crowd, { n: Math.round(G.crowd) }) + (G.strikes ? ' · ' + fill(T.strikes, { n: G.strikes }) : '');
    const near = G.people.some(q => q.talking && q.quietT <= 0 && Math.hypot(q.x * TS - G.x, q.y * TS - G.y) <= 30);
    $('#hUse').disabled = !near; $('#hUse').textContent = T.shush;
  }

  // the camera follows him but stays on the theater when it's bigger than the screen
  const cam = (W, H) => {
    // a room that fits sits at the bottom of the screen, clear of the bar at the top
    const fit = (v, size, view, low) => size <= view ? (low ? size - view : Math.round((size - view) / 2)) : Math.max(-8, Math.min(size - view + 8, v));
    return { x: fit(Math.round(G.x - W / 2), MW * TS, W, false), y: fit(Math.round(G.y - 8 - H * .62), MH * TS, H, true) };
  };
  const mapCan = document.createElement('canvas'); mapCan.width = MW * TS; mapCan.height = MH * TS;
  { const m = mapCan.getContext('2d'), R = (x, y, w, h, c) => { m.fillStyle = c; m.fillRect(x, y, w, h); };
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const c = map[j][i], x = i * TS, y = j * TS;
      if (c === '#') { R(x, y, TS, TS, '#1d1018'); continue; }
      if (c === 'M') { R(x, y, TS, TS, '#2a3a5a'); R(x, y + 14, TS, 2, '#0e0e12'); continue; }   // the screen, lit; the movie shows in the panel
      R(x, y, TS, TS, '#3a2030'); if ((i + j) % 2) R(x + 4, y + 4, 2, 2, '#4a2838');   // dark carpet
      if (c === 's') { R(x + 1, y + 2, 14, 12, '#8a1f2a'); R(x + 1, y + 2, 14, 4, '#a8323a'); R(x, y + 14, TS, 2, '#2a1018'); }
      if ((i === 1 || i === 11 || i === 12 || i === 22) && j > 3 && j % 2) R(x + 7, y + 13, 2, 2, '#f5d34a');   // aisle lights
      if (c === 'O') { R(x, y, TS, TS, '#4a2838'); R(x + 2, y + 2, 12, 14, '#6a3a4a'); R(x + 2, y + 1, 12, 2, '#3f8f3a'); }
    }
  }
  function drawScreen(x, y, w, h, t) {
    const sc = sceneAt(t), name = MOVIE[sc][2], R = (a, b, cw, ch, col) => { cx.fillStyle = col; cx.fillRect(x + a, y + b, cw, ch); };
    R(-3, -3, w + 6, h + 6, '#0e0e12');
    const loud = MOVIE[sc][1] >= .85;
    R(0, 0, w, h, loud ? '#3a2a20' : name === 'The ending' ? '#e8923a' : '#1d2a4a');
    if (loud) {
      for (let k = 0; k < 5; k++) { const bx = (k * 73 + Math.floor(t * 4) * 37) % (w - 30), by = (k * 11 + Math.floor(t * 4) * 5) % (h - 14), r = 6 + (k * 3 + Math.floor(t * 8)) % 7;
        R(bx, by, r * 2, r, '#f5d34a'); R(bx + 2, by + 2, r * 2 - 4, r - 3, '#e8742a'); }
      if (name === 'Car chase!') { const cxp = (t * 90) % (w + 40) - 40; R(cxp, h - 12, 22, 8, '#c2304a'); R(cxp - 34, h - 12, 22, 8, '#3a6ea5'); }
    } else {
      R(w / 2 - 40, h - 22, 10, 22, '#0e0e12'); R(w / 2 - 41, h - 30, 12, 9, '#0e0e12');   // two people talking on screen
      R(w / 2 + 30, h - 22, 10, 22, '#0e0e12'); R(w / 2 + 29, h - 30, 12, 9, '#0e0e12');
      if (name === 'The kissing scene') { R(w / 2 - 4, 4, 3, 3, '#e04848'); R(w / 2 + 1, 4, 3, 3, '#e04848'); R(w / 2 - 3, 7, 6, 3, '#e04848'); }
      if (name === 'The sad part') for (let k = 0; k < 20; k++) R((k * 23 + Math.floor(t * 20) * 3) % w, (k * 7 + Math.floor(t * 30) * 4) % h, 1, 3, '#7a9ac8');
      if (name === 'The credits') for (let k = 0; k < 4; k++) R(w / 2 - 30, (h - (t * 10 + k * 9) % h), 60, 2, '#c9c9c9');
    }
    // the program under the screen: what's coming, yellow loud and dark quiet
    const sy = y + h + 6; cx.fillStyle = INK; cx.fillRect(x - 1, sy - 1, w + 2, 5);
    MOVIE.forEach((q, n) => { const a = STARTS[n] / LENGTH * w, b = (STARTS[n] + q[0]) / LENGTH * w; cx.fillStyle = q[1] >= .85 ? '#f5d34a' : '#3a4a6a'; cx.fillRect(Math.round(x + a), sy, Math.max(1, Math.round(b - a)), 3); });
    cx.fillStyle = '#ffffff'; cx.fillRect(Math.round(x + Math.min(1, t / LENGTH) * w) - 1, sy - 2, 2, 7);
  }
  // someone in the audience, seen from behind (the back of the head and shoulders)
  function seated(p, c, t) {
    const x = Math.round(p.x * TS - c.x), y = Math.round(p.y * TS - c.y);
    const s = K.sprite(`seat-${p.hair}-${p.shirt}-${p.talking ? 1 : 0}`, 12, 12, r => {
      r(1, 7, 10, 5, p.shirt); r(3, 1, 6, 6, p.hair); r(4, 0, 4, 1, p.hair);
      if (p.talking) { r(9, 3, 1, 2, '#e9b88f'); r(10, 3, 2, 3, '#1d1d22'); }   // turned to the side, phone up
    });
    cx.drawImage(s, x - 7, y - 14);
    if (p.talking) {
      cx.fillStyle = '#bfe8ff'; cx.globalAlpha = .35 + .2 * Math.sin(t * 9); cx.fillRect(x + 1, y - 13, 8, 8); cx.globalAlpha = 1;   // the phone's glow
      if (p.quietT <= 0) { const f = Math.floor(t * 3) % 3; cx.fillStyle = '#fff'; cx.fillRect(x - 6, y - 20, 14, 6); cx.fillStyle = INK; for (let k = 0; k <= f; k++) cx.fillRect(x - 4 + k * 4, y - 18, 2, 2); }
    }
    if (p.ewT > 0) { cx.fillStyle = '#7aa83a'; const f = Math.floor(t * 5) % 2; for (const o of [-3, 2]) { cx.fillRect(x + o, y - 18 - f, 1, 2); cx.fillRect(x + o + 1, y - 20 + f, 1, 2); } }
  }
  function usher(c, t) {
    const u = G.usher, x = Math.round(u.x - c.x), y = Math.round(u.y - c.y);
    const s = K.sprite('usher', 12, 15, r => {
      r(2, 0, 8, 3, '#8a1f2a'); r(1, 2, 10, 1, '#5a1018');   // the cap
      r(3, 3, 6, 3, '#e9b88f'); r(4, 4, 1, 1, INK); r(7, 4, 1, 1, INK);
      r(2, 6, 8, 6, '#8a1f2a'); r(5, 6, 2, 6, '#f2efe6'); r(6, 8, 1, 1, '#f5d34a'); r(6, 10, 1, 1, '#f5d34a');   // the uniform
      r(1, 7, 1, 4, '#8a1f2a'); r(10, 7, 1, 4, '#8a1f2a');
      r(3, 12, 2, 3, '#1d1d22'); r(7, 12, 2, 3, '#1d1d22');
    });
    cx.drawImage(s, x - 7, y - 16);
    if (u.watchT > 0 && Math.floor(t * 4) % 2) { cx.fillStyle = '#fff'; cx.fillRect(x - 2, y - 26, 5, 8); cx.fillStyle = '#c2304a'; cx.fillRect(x - 1, y - 25, 3, 4); cx.fillRect(x - 1, y - 20, 3, 1); }   // a ! over the usher
  }
  function beam(c, t) {
    const u = G.usher, x = u.x - c.x, y = u.y - 8 - c.y, on = u.watchT > 0;
    cx.globalAlpha = on ? .3 + .1 * Math.sin(t * 20) : .18; cx.fillStyle = '#fff2a0';
    cx.beginPath(); cx.moveTo(x, y); cx.arc(x, y, BEAM, u.beam - WIDE, u.beam + WIDE); cx.closePath(); cx.fill();
    cx.globalAlpha = 1;
  }
  function draw() {
    const [W, H] = K.view(), c = cam(W, H), t = G.time;
    cx.fillStyle = '#120a10'; cx.fillRect(0, 0, W, H);
    cx.drawImage(mapCan, -c.x, -c.y);
    if (MOVIE[sceneAt(t)][1] >= .85 && Math.floor(t * 8) % 3 === 0) { cx.globalAlpha = .08; cx.fillStyle = '#ffe9a0'; cx.fillRect(0, 0, W, H); cx.globalAlpha = 1; }   // the screen lights the room
    const items = [];
    for (const p of G.people) if (!p.left) items.push({ y: p.y * TS, d: () => seated(p, c, t) });
    items.push({ y: G.usher.y, d: () => usher(c, t) });
    items.push({ y: G.y, d: () => { const s = K.himSprite(G.dir, G.step, false); cx.drawImage(s, Math.round(G.x - s.width / 2 - c.x), Math.round(G.y - s.height + 1 - c.y)); } });
    items.sort((a, b) => a.y - b.y).forEach(i => i.d());
    K.drawGas(GG.gas, MW, MH, c);
    beam(c, t);
    for (const q of G.puffs) { cx.globalAlpha = .7 * (1 - q.t / .7); cx.fillStyle = q.color; cx.beginPath(); cx.arc(Math.round(q.x - c.x), Math.round(q.y - c.y), q.r * (.5 + q.t), 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
    // the movie itself is drawn just under the bar at the top, always in view
    // (on a phone the room is taller than the screen, and the camera follows him)
    { const r = cv.getBoundingClientRect(), hb = $('.hhud').getBoundingClientRect(), k = r.width / W || 1;
      const top = Math.max(4, Math.ceil((hb.bottom - r.top) / k) + 4), w = Math.min(W - 10, 20 * TS);
      drawScreen(Math.round((W - w) / 2), top, w, 32, t); }
  }

  function frame(now) {
    if (mode !== 'movie') return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    try { step(dt); if (mode === 'movie') draw(); } catch (e) { console.error(e); }
    if (mode === 'movie') raf = requestAnimationFrame(frame);
  }
  function finish(win) {
    mode = 'done'; ended = true; cancelAnimationFrame(raf);
    const best = Math.max(+store.get('feed-the-fart:movBest') || 0, G.score); store.set('feed-the-fart:movBest', best);
    $('#hdTitle').textContent = win ? T.movWin : G.out ? T.usherLose : T.movLose;
    $('#hdText').textContent = fill(T.movText, { score: G.score, gone: G.gone, n: Math.round(G.crowd), best });
    $('#hdFoods').innerHTML = '';
    $('#hdAgain').textContent = T.movAgain; $('#hdDinner').textContent = T.movHome;
    $('#houseDone').hidden = false; $('#hdAgain').focus();
  }
  function home() {
    ended = false; mode = 'start';
    $('#houseDone').hidden = true; $('#hdAgain').textContent = T.again; $('#hdDinner').textContent = T.toDinner;
    document.body.classList.remove('housePlay', 'outPlay'); $('#house').hidden = true; $('#dinner').hidden = false;
    $('#startCover').hidden = false; $('#movBtn').focus();
  }

  document.addEventListener('keydown', e => {
    if (mode !== 'movie' || document.querySelector('dialog[open]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((k === ' ' || k === 'f') && !e.repeat) { e.preventDefault(); audio(); fart(); }
    else if ((k === 'e' || k === 'Enter') && !e.repeat && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); shush(); }
  });
  for (const [id, fn] of [['#hFart', fart], ['#hUse', shush]]) {
    const b = $(id);
    b.addEventListener('pointerdown', e => { if (mode === 'movie') { e.preventDefault(); audio(); fn(); } });
    b.addEventListener('click', e => { if (e.detail === 0 && mode === 'movie') fn(); });
  }
  const prevAgain = $('#hdAgain').onclick, prevDinner = $('#hdDinner').onclick;
  $('#hdAgain').onclick = () => { if (ended) { $('#houseDone').hidden = true; start(); } else prevAgain(); };
  $('#hdDinner').onclick = () => { if (ended) home(); else prevDinner(); };
  $('#movBtn').textContent = T.movBtn;
  $('#movBtn').onclick = () => { audio(); $('#startCover').hidden = true; start(); };
  T.start += ' ' + T.movStart; $('#startText').textContent = T.start;
  return { start, peek: () => G, step, draw, fart, shush, seen, LENGTH };   // for checking from the console
})();
