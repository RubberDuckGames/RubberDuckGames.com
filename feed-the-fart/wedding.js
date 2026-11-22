// The wedding (Randi's idea, 21 Nov): "a level where he is trying not to fart
// but is in some sort of event where they need to be quiet... but are eating,
// so we lose if we disturb the event". The other levels reward farting; this
// one is holding it. The bar fills on its own (faster after each course), and
// a fart is safe only when the room is loud enough to cover it: laughing,
// clapping, cheering, the band. The program runs on a clock (`PROGRAM`) and the
// strip under the scene shows what's coming. A fart in a quiet moment, or a
// full bar that lets go by itself, disturbs the wedding; three and he's asked
// to leave. It borrows the house's canvas, bar, buttons and sprites (HOUSE.kit).
Object.assign(T, {
  wedBtn: 'The wedding',
  wedStart: 'Or go to a wedding and try NOT to fart.',
  wedIntro: "Hold it in! Let one out only when it's loud.",
  wedBar: 'Holding it',
  eat: 'Eat',
  quiet: 'Quiet!', loud: 'Loud', chatter: 'Chatter',
  safe: ['Nobody noticed.', 'Covered by the music.', 'Smooth.', 'Nobody heard a thing.'],
  caught: ['Did someone just...?', 'The bride: "Seriously?!"', 'The music stops. Everyone stares.'],
  letGo: "He couldn't hold it!",
  served: '{food} is served.', ate: 'Mmm, {food}!', eatNag: 'Mom: "Eat your food!"',
  wedWin: 'What a lovely wedding!', wedLose: 'Asked to leave the wedding.',
  wedText: 'Score {score}. He snuck out {safe} without anyone noticing and got caught {caught} times. Best score {best}.',
  wedAgain: 'Go to the wedding again', wedHome: 'Back to the start',
  disturbed: 'Caught {n}/3',
  wedHint: 'Hold it in! The bar fills on its own, faster after he eats. Let one out (Space, F or the Fart button) only when the room is loud: laughing, clapping, cheering or the band. A bigger bar is a louder fart. The strip under the room shows what is coming: yellow is loud, green is chatter, dark is quiet. A fart in a quiet moment, or a full bar, disturbs the wedding; three times and he has to leave. When food comes, Eat (E or Use).',
});

const WEDDING = (() => {
  const K = HOUSE.kit, { cx } = K;
  const INK = '#2a1a0e', SW = 220, SH = 124;   // the scene's size in game pixels, scaled up whole
  // noise: how loud the room is (a fart louder than this is heard). who: who stands up.
  const PROGRAM = [
    [6, .6, 'Everyone sits down'],
    [10, .08, "Best man's speech", 'bestMan'],
    [3, .95, 'Everyone laughs'],
    [9, .08, "Best man's speech", 'bestMan'],
    [4, 1, 'Applause!'],
    [7, .6, 'Dinner chatter', null, 'sprouts'],
    [11, .06, "Maid of honor's toast", 'maid'],
    [3, .85, 'Cheers! Glasses clink'],
    [8, .5, 'Dinner chatter', null, 'mac'],
    [10, .35, 'The first dance', 'dance'],
    [2, 1, 'The dip! Everyone cheers'],
    [8, .12, 'Cutting the cake', 'cake', 'pie'],
    [4, 1, 'Cheers for the cake'],
    [8, .04, "Grandma's toast", 'grandma'],
    [4, 1, 'Applause!'],
    [5, 1, 'The band kicks in!'],
  ];
  const STARTS = []; { let t = 0; for (const p of PROGRAM) { STARTS.push(t); t += p[0]; } }
  const LENGTH = STARTS[STARTS.length - 1] + PROGRAM[PROGRAM.length - 1][0];
  const nowAt = t => { let i = 0; while (i < PROGRAM.length - 1 && t >= STARTS[i + 1]) i++; return i; };
  const kind = n => n >= .85 ? 'loud' : n >= .3 ? 'chatter' : 'quiet';
  const SEAT = { mom: [88, 'mom', '#c9c9c9', '#7d4fa0', '#f0c9a0'], kidA: [130, 'kidA', '#e8c35a', '#e8742a', '#f0c9a0'], kidB: [144, 'kidB', '#3a2414', '#7d4fa0', '#c68a5e'] };
  const HEAD = [   // the head table, left to right: maid of honor, bride, groom, best man
    { who: 'maid', x: 70, hair: '#8a4b22', shirt: '#c97aa0', skin: '#e9b88f' },
    { who: 'bride', x: 96, hair: '#f4f4f0', shirt: '#ffffff', skin: '#f0c9a0' },
    { who: 'groom', x: 124, hair: '#3a2414', shirt: '#1d1d22', skin: '#d9a074' },
    { who: 'bestMan', x: 150, hair: '#2a1a10', shirt: '#2a2a3a', skin: '#c68a5e' },
  ];
  const GUESTS = [
    { who: 'grandma', x: 22, y: 82, hair: '#e0e0e0', shirt: '#3f8f5a', skin: '#f0c9a0' }, { who: 'g1', x: 44, y: 82, hair: '#6a6a6a', shirt: '#3a6ea5', skin: '#d9a074' },
    { who: 'g2', x: 176, y: 82, hair: '#e8c35a', shirt: '#c2304a', skin: '#f0c9a0' }, { who: 'g3', x: 198, y: 82, hair: '#3a2414', shirt: '#d9a420', skin: '#8a5a3a' },
  ];
  const foodImg = {}; for (const id of ['sprouts', 'mac', 'pie']) { const im = new Image(); im.src = spriteURL(id); foodImg[id] = im; }
  let G = null, keys = {}, raf = 0, last = 0, msgT = 0, ended = false;
  const say = (text, ms = 2200, alert = false) => { const el = $('#hMsg'); el.textContent = text; el.hidden = false; el.classList.toggle('alert', alert); $('#live').textContent = text; msgT = ms; };

  function start() {
    ended = false;
    G = { time: 0, bar: 10, score: 0, safe: 0, caught: 0, ate: 0, plate: null, plateT: 0, nagged: false, ewT: 0, puffs: [], notes: [], last: -1, flash: 0,
      belly: { gas: 0, total: 1, dairy: 0, sulfur: 0, bread: 0, sweet: 0, savory: 1, ate: new Set() }, done: false, endAt: 0 };
    mode = 'wed';
    document.body.classList.add('housePlay', 'outPlay', 'wedPlay');
    $('#dinner').hidden = true; $('#house').hidden = false; K.fitView();
    $('#hBarLabel').textContent = T.wedBar;
    say(T.wedIntro, 3000); hud();
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function step(dt) {
    G.time += dt;
    if (msgT > 0) { msgT -= dt * 1000; if (msgT <= 0) $('#hMsg').hidden = true; }
    if (G.endAt && G.time >= G.endAt) { G.endAt = 0; return finish(G.won); }
    if (G.done) return hud();
    const i = nowAt(G.time), p = PROGRAM[i];
    if (i !== G.last) {   // a new part of the program
      G.last = i;
      if (p[4]) { const f = FOODS.find(x => x.id === p[4]); G.plate = f; G.plateT = 0; G.nagged = false; say(fill(T.served, { food: f.name })); }
      else if (!G.ewT) say(p[2], 1800);
    }
    if (G.plate) { G.plateT += dt; if (G.plateT > 6 && !G.nagged) { G.nagged = true; say(T.eatNag); } }
    // the pressure: steady, and more with every course he's eaten
    G.bar = Math.min(100, G.bar + dt * (2.3 + .6 * G.ate));
    if (G.bar >= 100) { say(T.letGo, 1600); release(true); }
    if (G.ewT > 0) G.ewT -= dt;
    if (G.flash > 0) G.flash -= dt;
    if (p[1] >= .85 && Math.random() < dt * 4) G.notes.push({ x: 20 + Math.random() * 180, y: 60, t: 0 });
    for (const n of G.notes) n.t += dt; G.notes = G.notes.filter(n => n.t < 1.2);
    for (const q of G.puffs) q.t += dt; G.puffs = G.puffs.filter(q => q.t < .8);
    if (p[3] === 'cake' && Math.random() < dt * 1.2) G.flash = .08;   // the photographer
    if (G.time >= LENGTH) { G.done = true; G.won = true; G.score += 200; say(T.wedWin, 2400); playType('trumpet', .3); G.endAt = G.time + 2; }
    hud();
  }
  // A fart's loudness grows with how full the bar is; the room covers it if
  // it's at least as loud. A full bar lets go at full volume.
  function release(forced) {
    if (G.done) return;
    const p = PROGRAM[nowAt(G.time)], loud = forced ? 1 : .2 + G.bar / 125;
    if (!forced && G.bar < 8) { say(T.empty); return; }
    G.belly.gas = G.bar;
    let type = whichFart(G.belly); if (type === 'shart') type = 'trumpet';
    G.puffs.push({ t: 0, color: TYPES[type].color, r: 3 + G.bar / 12 });
    const covered = p[1] >= loud;
    playType(type, covered ? .25 : .5 + G.bar / 200); discover(type);
    const was = G.bar; G.bar = forced ? 20 : Math.max(0, G.bar - 40);
    if (covered) { G.safe++; const pts = 20 + Math.round(was / 2); G.score += pts; say(pick(T.safe) + ' +' + pts, 1600); return; }
    G.caught++; G.score = Math.max(0, G.score - 100); G.ewT = 3;
    say(T.caught[Math.min(2, G.caught - 1)], 2600, true);
    if (G.caught >= 3) { G.done = true; G.won = false; setTimeout(() => { if (mode === 'wed') say(T.yell, 2200); }, 900); G.endAt = G.time + 3.2; }
  }
  function eat() {
    if (G.done || !G.plate) return;
    const f = G.plate; G.plate = null; G.ate++; G.score += 50; G.bar = Math.min(100, G.bar + f.gas * .6);
    G.belly.ate.add(f.id); G.belly.total += 1; for (const k in f.mix) G.belly[k] += f.mix[k] * 3;
    say(fill(T.ate, { food: f.name }), 1400); tone(660, .06, 'square', 0, .08);
  }
  function hud() {
    const g = Math.round(G.bar), w = g >= 100 ? 3 : g >= 50 ? 2 : g >= 15 ? 1 : 0, p = PROGRAM[nowAt(G.time)];
    $('#hFill').style.width = g + '%'; $('#hWord').textContent = T.barWords[w];
    $('#hMeter').setAttribute('aria-valuenow', g); $('#hMeter').setAttribute('aria-valuetext', `${g}%, ${T.barWords[w]}`);
    $('#hRoom').textContent = `${p[2]} (${T[kind(p[1])]})`;
    $('#hScore').textContent = fill(T.score, { n: G.score });
    $('#hFood').textContent = fill(T.disturbed, { n: G.caught });
    $('#hUse').disabled = !G.plate; $('#hUse').textContent = T.eat;
  }

  // ---- drawing: one room, scaled up by a whole number to fill the screen ----
  function person(p, x, y, ew) {
    const s = K.targetSprite({ kind: 'person', who: 'wed-' + p.who, hair: p.hair, shirt: p.shirt, skin: p.skin, out: ew }, G.time);
    cx.drawImage(s, Math.round(x - s.width / 2), Math.round(y));
  }
  function draw() {
    const [W, H] = K.view(), z = Math.max(1, Math.floor(Math.min(W / (SW + 4), (H - 20) / (SH + 4)))), t = G.time;
    const pi = nowAt(t), p = PROGRAM[pi], ew = G.ewT > 0;
    cx.fillStyle = '#2a1a10'; cx.fillRect(0, 0, W, H);
    cx.save(); cx.setTransform(z, 0, 0, z, Math.round((W - SW * z) / 2), Math.max(0, Math.round((H - SH * z) / 2)));
    const R = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(x, y, w, h); };
    // the hall: a soft wall, a wood floor, string lights
    R(0, 0, SW, 70, '#f4e4dc'); R(0, 66, SW, 4, '#e0c8bc'); R(0, 70, SW, SH - 70, '#c8a07a');
    for (let y = 76; y < SH; y += 8) R(0, y, SW, 1, '#b08a64');
    for (let x = 4; x < SW; x += 10) { const on = (Math.floor(t * 2) + x / 10) % 3; R(x, 5 + (x / 10 % 2), 2, 2, on ? '#ffe9a0' : '#f5c84a'); }
    R(0, 4, SW, 1, '#8a7a6a');
    // the flower arch behind the bride and groom
    R(100, 14, 3, 34, '#f4f4f0'); R(118, 14, 3, 34, '#f4f4f0'); R(100, 12, 21, 3, '#f4f4f0');
    for (let k = 0; k < 9; k++) R(98 + (k * 5) % 24, 10 + (k * 7) % 30, 4, 3, ['#f2a7c3', '#ffffff', '#c97aa0'][k % 3]);
    // the cake on its own table, and the band on the right
    R(10, 56, 30, 12, '#f4f0e6'); R(10, 66, 30, 2, '#c9c2b4');
    if (!(p[3] === 'cake' && t - STARTS[pi] > 4)) { R(17, 40, 16, 8, '#ffffff'); R(19, 34, 12, 6, '#ffffff'); R(21, 29, 8, 5, '#ffffff'); R(17, 44, 16, 1, '#f2a7c3'); R(19, 37, 12, 1, '#f2a7c3'); R(24, 26, 2, 3, '#c2304a'); }
    else { R(17, 44, 16, 4, '#ffffff'); R(19, 40, 6, 4, '#ffffff'); }   // cut
    R(176, 40, 36, 28, '#2a2a30'); R(178, 42, 10, 12, '#4a4a58'); R(200, 42, 10, 12, '#4a4a58'); R(181, 45, 4, 4, '#1d1d22'); R(203, 45, 4, 4, '#1d1d22');
    person({ who: 'dj', hair: '#c2304a', shirt: '#3a6ea5', skin: '#d9a074' }, 194, 24 + (p[1] >= .85 ? Math.floor(t * 6) % 2 : 0), false);
    R(186, 54, 16, 6, '#1d1d22'); R(188, 55, 4, 4, '#9a9aa6'); R(196, 55, 4, 4, '#9a9aa6');
    // the head table; whoever's speaking stands with the mic
    const dancing = p[3] === 'dance', cake = p[3] === 'cake';
    for (const h of HEAD) {
      if ((dancing || cake) && (h.who === 'bride' || h.who === 'groom')) continue;
      const up = p[3] === h.who ? -6 : 0;
      person(h, h.x, 30 + up, ew);
      if (up) { R(h.x + 6, 36 + up, 1, 8, '#4a4a58'); R(h.x + 5, 34 + up, 3, 3, '#1d1d22'); }
    }
    R(56, 48, 108, 8, '#f4f0e6'); R(56, 56, 108, 10, '#ffffff'); R(56, 48, 108, 1, '#ffffff');
    for (let x = 60; x < 162; x += 12) R(x, 56, 6, 2, '#f2a7c3');
    if (dancing) { const sw = Math.round(Math.sin(t * 2) * 3); person(HEAD[1], 104 + sw, 62, ew); person(HEAD[2], 116 + sw, 62, ew); }
    if (cake) { person(HEAD[1], 46, 40, ew); person(HEAD[2], 58, 40, ew); R(38, 50, 8, 1, '#9a9aa6'); }
    // the guests at the side tables, Grandma at the front of the left one
    for (const g of GUESTS) person(g, g.x, g.y + (p[3] === g.who ? -6 : 0), ew);
    if (p[3] === 'grandma') { R(28, 82, 1, 8, '#4a4a58'); R(27, 80, 3, 3, '#1d1d22'); }
    R(8, 96, 48, 6, '#f4f0e6'); R(8, 102, 48, 6, '#ffffff'); R(164, 96, 48, 6, '#f4f0e6'); R(164, 102, 48, 6, '#ffffff');
    // his table in front, with Mom and the kids; his plate when a course comes
    for (const k in SEAT) { const [x, who, hair, shirt, skin] = SEAT[k]; person({ who, hair, shirt, skin }, x, who === 'mom' ? 80 : 86, ew && who !== 'mom' ? false : ew); }
    const him = K.himSprite('down', 0, G.bar >= 80 || ew);
    cx.drawImage(him, 110 - Math.round(him.width / 2) + (G.bar >= 80 ? Math.floor(t * 10) % 2 : 0), 78);
    R(76, 98, 76, 6, '#f4f0e6'); R(76, 104, 76, 6, '#ffffff'); R(76, 98, 76, 1, '#ffffff');
    if (G.plate && foodImg[G.plate.id].complete) { R(102, 99, 16, 4, '#ffffff'); cx.drawImage(foodImg[G.plate.id], 102, 88); }
    for (const q of G.puffs) { cx.globalAlpha = .7 * (1 - q.t / .8); cx.fillStyle = q.color; cx.beginPath(); cx.arc(118, 92, q.r * (.5 + q.t), 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
    for (const n of G.notes) { const y = Math.round(n.y - n.t * 30); R(n.x, y, 2, 2, '#3a2414'); R(n.x + 1, y - 5, 1, 5, '#3a2414'); R(n.x + 2, y - 5, 2, 1, '#3a2414'); }
    if (kind(p[1]) === 'chatter') for (const [x, y] of [[44, 78], [176, 78], [88, 76]]) if (Math.floor(t * 2 + x) % 3) { R(x, y, 2, 2, '#fff'); R(x + 3, y, 2, 2, '#fff'); R(x + 6, y, 2, 2, '#fff'); }
    // the program strip: what's coming. Yellow loud, green chatter, dark quiet.
    const sx = 10, sw = 200, sy = 113;
    R(sx - 1, sy - 1, sw + 2, 8, INK);
    PROGRAM.forEach((q, n) => { const a = sx + STARTS[n] / LENGTH * sw, b = sx + (STARTS[n] + q[0]) / LENGTH * sw, k = kind(q[1]);
      R(Math.round(a), sy, Math.max(1, Math.round(b) - Math.round(a)), 6, k === 'loud' ? '#f5d34a' : k === 'chatter' ? '#8fc46a' : '#3a4a6a'); });
    const px = Math.round(sx + Math.min(1, t / LENGTH) * sw); R(px - 1, sy - 3, 3, 12, '#ffffff'); R(px, sy - 2, 1, 10, INK);
    if (G.flash > 0) { cx.globalAlpha = .6; R(0, 0, SW, SH, '#ffffff'); cx.globalAlpha = 1; }
    cx.restore();
  }

  function frame(now) {
    if (mode !== 'wed') return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    try { step(dt); if (mode === 'wed') draw(); } catch (e) { console.error(e); }
    if (mode === 'wed') raf = requestAnimationFrame(frame);
  }
  function finish(win) {
    mode = 'done'; ended = true; cancelAnimationFrame(raf);
    const best = Math.max(+store.get('feed-the-fart:wedBest') || 0, G.score); store.set('feed-the-fart:wedBest', best);
    $('#hdTitle').textContent = win ? T.wedWin : T.wedLose;
    $('#hdText').textContent = fill(T.wedText, { score: G.score, safe: G.safe, caught: G.caught, best });
    $('#hdFoods').innerHTML = '';
    $('#hdAgain').textContent = T.wedAgain; $('#hdDinner').textContent = T.wedHome;
    $('#houseDone').hidden = false; $('#hdAgain').focus();
  }
  function home() {
    ended = false; mode = 'start';
    $('#houseDone').hidden = true; $('#hdAgain').textContent = T.again; $('#hdDinner').textContent = T.toDinner; $('#hBarLabel').textContent = T.barLabel;
    document.body.classList.remove('housePlay', 'outPlay', 'wedPlay'); $('#house').hidden = true; $('#dinner').hidden = false;
    $('#startCover').hidden = false; $('#wedBtn').focus();
  }

  document.addEventListener('keydown', e => {
    if (mode !== 'wed' || document.querySelector('dialog[open]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((k === ' ' || k === 'f') && !e.repeat) { e.preventDefault(); audio(); release(false); }
    else if ((k === 'e' || k === 'Enter') && !e.repeat && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); eat(); }
  });
  for (const [id, fn] of [['#hFart', () => release(false)], ['#hUse', eat]]) {
    const b = $(id);
    b.addEventListener('pointerdown', e => { if (mode === 'wed') { e.preventDefault(); audio(); fn(); } });
    b.addEventListener('click', e => { if (e.detail === 0 && mode === 'wed') fn(); });
  }
  // the end card is the house's; after the wedding its buttons go again or home
  const prevAgain = $('#hdAgain').onclick, prevDinner = $('#hdDinner').onclick;
  $('#hdAgain').onclick = () => { if (ended) { $('#houseDone').hidden = true; start(); } else prevAgain(); };
  $('#hdDinner').onclick = () => { if (ended) home(); else prevDinner(); };
  $('#wedBtn').textContent = T.wedBtn;
  $('#wedBtn').onclick = () => { audio(); $('#startCover').hidden = true; start(); };
  T.start += ' ' + T.wedStart; $('#startText').textContent = T.start;
  return { start, peek: () => G, step, draw, PROGRAM, LENGTH };   // peek, step, draw: for checking from the console
})();
