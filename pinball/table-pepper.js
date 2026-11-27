// The Mighty Pepper table: Pepper's ranch. Loaded after game.js, which has
// the engine, the shared layout and the drawing every table uses; this file
// is only what makes it the ranch: its words, colours, sprites, the painted
// yard, the porch and the barn, and the backbox.
//
// How it got here: the first draft (26 Nov) was a bubble bath. Randi asked
// the same day for Pepper's ranch, so the table belongs with a game the
// testers already know, and then for more: "into the barn ... under the
// house deck and past the lost shoes and socks". The sprites are copied from
// mighty-pepper/game.js, the way Feed the Fart copied Bread and Crumb.
(() => {
  // the ranch's sprites, with The Mighty Pepper's own colours and rows
  const PC = {
    k: '#16121a', n: '#34303b', N: '#4e4858', t: '#c27a35', T: '#e3a55c',
    w: '#fbf6ea', y: '#f2c230', Y: '#c9961c', g: '#7ccf5a', p: '#f0a0a8',
    r: '#d8343f', R: '#9e2230', h: '#9a6232', H: '#5e3a1c',
    s: '#9a7c5e', S: '#c2a07a', c: '#efe0c4',
    b: '#8a5a30', B: '#5e3a1c', q: '#c9a25e', Q: '#8a6a3a', m: '#7a5a3a', u: '#5a86c8', v: '#e8e0d0',
  };
  const spr = (rows, flip = false) => RDG.sprite(rows, PC, { line: '#16121a', flip });
  const PEP_ROWS = [
    '..............hhhhh.....', '.............hhhhhhh....', '...........hhHHHHHHHhh..', '............nnnnnnnN....',
    '............nnTnnnnnn...', '............nnwknnnTTk..', '.n..........Nnnnnttttt..', '.nn.........NNrrrrtt....',
    '..NNNNNNNNNNnnrrrr......', '..nnnnnnnnnnnnnrr.......', '..nnnnnnnnnnnnttn.......', '...tnnnnnnnnnttt........',
    '...tt........tt.........', '...tt........tt.........',
  ];
  const catRows = (head, body, paw) => [...head, ...body, `...n${paw}.......n${paw}...`, `...${paw}${paw}.......${paw}${paw}...`];
  const BIS_ROWS = catRows(['............n...n', '............nnnnn', 'n...........nywyn', 'n...........nwwwn', '.n..........wwpww'],
    ['.n...nnnnnnnnwww.', '..NNNNNNNNNNNww..', '...nnnnnnnnnnww..', '...nnnnnnnnnnn...'], 'w');
  const TATO_ROWS = catRows(['.............n...', '............nnn.n', 'n...........ngnnn', 'n...........nnngn', '.n..........nnpnn'],
    ['.n...nnnnnnnnnnn.', '..NNNNNNNNNNNnn..', '...nnnnnnnnnnnn..', '...nnnnnnnnnnn...'], 'n');
  const SQ_ROWS = ['.SS.......', 'SSSS......', 'SS.SS..ss.', 'S...S.ssss', '....Ssssks', '....sssss.', '.....scc..', '.....s.s..'];
  const PEPPER = spr(PEP_ROWS), BISCUIT = spr(BIS_ROWS, true), TATO = spr(TATO_ROWS, true);
  const TUMBLE = spr(['..qQqQq...', '.Q.q.Q.q..', 'q.Q.qQ.Qq.', 'Qq.Q..q.Q.', '.q.Qq.Q.q.', 'Q.q..Q.qQ.', '.Qq.Q.q.Q.', '..q.QqQ...', '...Qq.q...']);
  const BALE = spr(['yyyyyyyyyy', 'YyYyYyYyYy', 'yhyyyyyyhy', 'yhyyyyyyhy', 'YyYyYyYyYy', 'yyyyyyyyyy']);
  // the studio's rubber duck, hiding in the backbox's water trough
  const DUCK = RDG.sprite(['.yy..', 'yyko.', '.yyyy', 'yyyyy'], { y: '#ffd23f', k: '#16121a', o: '#ff8a1e' }, { line: '#16121a' });
  // a horseshoe between the flippers, where the drain is
  const SHOE = RDG.sprite(['.eeeeee.', 'eekeekee', 'ee....ee', 'ek....ke', 'ee....ee', 'ee....ee', 'ee....ee'], { e: '#9aa2b0', k: '#3a3f4a' }, { line: '#16121a' });
  // Pepper's lost things, from The Mighty Pepper's stash (ITEM_PIX), the
  // second boot drawn the same
  const BOOT = ['..bbb.', '..bBb.', '..bbb.', '..bBb.', '..bbbb', 'bbbbbb', 'BB..BB'];
  const STASH = [
    { id: 'boot', name: 'BOOT', rows: BOOT },
    { id: 'sockStripe', name: 'STRIPY SOCK', rows: ['www.', 'rrr.', 'www.', 'rrr.', 'wwww', 'rrrr', '.www'] },
    { id: 'slipper', name: 'SLIPPER', rows: ['..pppp..', '.pmpppp.', 'pppppmpp', 'mmmmmmmm'] },
    { id: 'sockPolka', name: 'POLKA SOCK', rows: ['uuu.', 'uwu.', 'uuu.', 'wuu.', 'uuwu', 'uuuu', '.uwu'] },
    { id: 'sockHoley', name: 'HOLEY SOCK', rows: ['vvv.', 'vvv.', 'vkv.', 'vvv.', 'vvvv', 'vvkv', '.vvv'] },
    { id: 'boot2', name: 'OTHER BOOT', rows: BOOT },
  ].map(it => ({ ...it, img: spr(it.rows) }));

  const C = {
    cab: '#3a2616', cabDark: '#24170c', rail: '#e8d8b8', railDark: '#6b4426',
    grass: '#b5cc6a', grassMid: '#9fb858', grassDark: '#7f9a44', grassHi: '#d0e08a',
    dirt: '#dcb67a', dirtDark: '#c49a5e', dirtHi: '#f0d49a', tunnel: '#c9a86a',
    ring: '#b8362f', base: '#e8cf8a', baseHi: '#fff6e4', frenzyRing: '#ffd23f',
    sling: '#f2c230', rubber: '#b8362f', flip: '#fff6e4',
    litOn: '#ffd23f', litOff: '#8a6a3a', text: '#5e3a1c', slot: '#6b4426', hole: '#2a1a10',
    rampLine: '#c99460', rampDark: '#5e3a1c', chrome: '#c8d0dc', rim: '#5e3a1c',
    secretRim: '#8a6a3a', dent: '#dcb67a', bowl: '#d8343f', bowlRim: '#9e2230', barnHole: '#7a5a3a',
    mound: '#a8804a', bump: '#a8804a', bumpHi: '#f0d49a', mote: 'rgba(255,246,228,.75)', bulbOff: '#7a4a22',
  };
  // grass with tufts, and the bare dirt of the yard (the Pepper game's
  // ground, at this table's 12-pixel tile)
  const GRASS = RDG.tile('pinGrass', 12, 12, (set, fill, r) => {
    fill(0, 0, 12, 12, C.grass);
    for (let i = 0; i < 3; i++) fill(Math.floor(r() * 10) + 1, Math.floor(r() * 9) + 2, 2, 1, C.grassMid);
    const x = Math.floor(r() * 8) + 1, y = Math.floor(r() * 7) + 3;
    set(x, y, C.grassDark); set(x + 2, y - 1, C.grassDark); set(x + 1, y, C.grassMid); set(x + 1, y - 1, C.grassHi); set(x + 1, y + 1, C.grassDark);
    for (let i = 0; i < 2; i++) set(Math.floor(r() * 12), Math.floor(r() * 12), C.grassHi);
  });
  const DIRT = RDG.tile('pinDirt', 12, 12, (set, fill, r) => {
    fill(0, 0, 12, 12, C.dirt);
    for (let i = 0; i < 4; i++) set(Math.floor(r() * 12), Math.floor(r() * 12), C.dirtDark);
    for (let i = 0; i < 2; i++) set(Math.floor(r() * 12), Math.floor(r() * 12), C.dirtHi);
    set(Math.floor(r() * 11), Math.floor(r() * 11), '#a8804a');
  });
  const clouds = [{ x: 20, y: 6, w: 22 }, { x: 110, y: 3, w: 16 }];

  TABLES.pepper = {
    id: 'pepper', C, STASH,
    bumper: TUMBLE, bumperAt: [-6, -5],
    target: [spr(SQ_ROWS), spr(SQ_ROWS, true)], targetAt: [-3, -8, -5],   // facing right (left bank), left (right bank)
    str: {
      name: 'The Mighty Pepper',
      blurb: "Pepper's ranch. Ride the fence ramp, shoot into the barn to find her lost shoes and socks under the porch, and knock down the Squirrel Gang.",
      howBalls: 'Shoot the fence ramp again and again for more each time. Shoot into the barn and the ball goes under the porch, where Pepper lost her shoes and socks: every trip finds one more. The dinner bowl rings the Dinner Bell. Knock down the squirrels to get at their hole behind them; a whole row keeps the way open. Light S I T for a bonus multiplier.',
      statStash: 'Lost things found: {n}',
      statStashes: 'Stashes complete: {n}',
      statSecrets: 'Squirrel holes: {n}',
      statFrenzies: 'Dinner Bells: {n}',
      statDucks: 'Squirrels knocked down: {n}',
      statRows: 'Squirrel rows: {n}',
      statTubs: 'S I T lit: {n}',
      liveSecret: 'Squirrel hole, 10,000 points',
      liveFrenzy: 'Dinner Bell',
      liveFound: 'Found the {thing} under the porch',
      liveStash: 'Stash complete, 25,000 points',
      mTitle: 'MIGHTY PEPPER',
      lanes: 'SIT',
      dDuckRow: 'SQUIRREL ROW!',
      dOpen: 'HOLE OPEN',
      dSecret: 'SQUIRREL HOLE!',
      dFrenzy: 'DINNER BELL!',
      dFrenzyMore: 'BELL +10',
      dFrenzyT: 'DINNER {s}',
      dTub: 'SIT! {m}X',
      dTubMax: 'SIT! 5X MAX',
      dBarn: 'INTO THE BARN',
      dFound: 'FOUND: {thing}',
      dStash: 'STASH COMPLETE!',
    },
    // the parts that never move: the yard, the dirt paths, the tunnels, the
    // aprons and what's on them, the barn's floor
    paint(b) {
      b.fillStyle = C.cab; b.fillRect(0, 0, W, TH);
      b.save();
      fieldPath(b); b.fillStyle = b.createPattern(GRASS, 'repeat'); b.fill(); b.clip();
      // the bare dirt: the lanes at the top, the yard round the tumbleweeds
      // and the run down to the flippers, worn where the ball goes most
      b.fillStyle = b.createPattern(DIRT, 'repeat');
      b.fillRect(50, 20, 66, 30);
      b.beginPath(); b.ellipse(83, 118, 44, 34, 0, 0, 7); b.fill();
      b.beginPath(); b.moveTo(46, 180); b.lineTo(120, 180); b.lineTo(132, 320); b.lineTo(34, 320); b.fill();
      b.fillRect(160, 86, 14, 240);   // the plunger lane
      b.restore();
      paintTunnels(b);
      BANKS.forEach(k => { b.fillStyle = C.dirtDark; b.fillRect(k.x0 + 1, 117, k.x1 - k.x0 - 1, 52); });
      paintAprons(b, C.rampDark, '#4e2f1a');
      b.drawImage(BALE, 14, 296);
      b.drawImage(BALE, 132, 296);
      b.drawImage(SHOE, 79, 309);
      b.fillStyle = '#e8cf8a'; b.fillRect(BARN.x0, BARN.y0, BARN.x1 - BARN.x0, BARN.y1 - BARN.y0);
      b.fillStyle = '#c9a25e'; for (let i = 0; i < 18; i++) b.fillRect(BARN.x0 + 1 + (i * 7) % 16, BARN.y0 + 11 + (i * 5) % 10, 2, 1);
    },
    // a split-rail fence along the top
    rim(x, y) { g.fillStyle = C.rim; g.fillRect(x, y + 2, 2, 4); },
    // The porch: the house wall along the top, the deck with what Pepper has
    // found this game piled on it, and the dark crawl space under the deck
    // with the things still lost.
    corner() {
      g.save(); cornerClip();
      g.fillStyle = '#5a86c8'; g.fillRect(6, 0, PORCH.x1 - 6, PORCH.house);
      g.fillStyle = '#3e6aa8'; for (let y = 4; y < PORCH.house; y += 4) g.fillRect(6, y, PORCH.x1 - 6, 1);
      g.fillStyle = '#fff6e4'; g.fillRect(20, 30, 12, 10); g.fillStyle = '#7fb8e8'; g.fillRect(21, 31, 4, 3); g.fillRect(27, 31, 4, 3); g.fillRect(21, 36, 4, 3); g.fillRect(27, 36, 4, 3);
      g.fillStyle = C.rampLine; g.fillRect(6, PORCH.house, PORCH.x1 - 6, PORCH.under - PORCH.house);
      g.fillStyle = '#a8743c'; for (let y = PORCH.house + 3; y < PORCH.under; y += 4) g.fillRect(6, y, PORCH.x1 - 6, 1);
      g.fillStyle = C.rampDark; g.fillRect(6, PORCH.house, PORCH.x1 - 6, 1); g.fillRect(6, PORCH.under - 1, PORCH.x1 - 6, 1);
      drawFound();
      g.fillStyle = '#1e140a'; g.fillRect(6, PORCH.under, PORCH.x1 - 6, PORCH.y1 - PORCH.under);
      drawLost();
      g.restore();
    },
    // drawn over the ball: the porch's lattice, and the barn's roof and walls
    front() {
      g.save();
      g.beginPath(); g.rect(6, PORCH.under, PORCH.x1 - 6, PORCH.y1 - PORCH.under); g.clip();
      g.fillStyle = 'rgba(201,148,96,.85)';
      for (let x = -14; x < PORCH.x1; x += 7) for (let i = 0; i < 14; i++) { g.fillRect(x + i, PORCH.under + i, 1, 1); g.fillRect(x + 14 - i, PORCH.under + i, 1, 1); }
      g.restore();
      g.fillStyle = C.rampDark; g.fillRect(6, PORCH.y1 - 1, PORCH.x1 - 6, 2); g.fillRect(PORCH.x1 - 1, PORCH.house, 2, PORCH.y1 - PORCH.house);
      const b = BARN, mid = (b.x0 + b.x1) / 2;
      g.fillStyle = '#b8362f'; g.beginPath(); g.moveTo(b.x0 - 1, b.y0 + 3); g.lineTo(mid, b.peak - 1); g.lineTo(b.x1 + 1, b.y0 + 3); g.lineTo(b.x1 + 1, b.y0 + 10); g.lineTo(b.x0 - 1, b.y0 + 10); g.fill();
      g.fillStyle = '#7a1f1a'; g.fillRect(b.x0 - 1, b.y0 + 5, b.x1 - b.x0 + 3, 1); g.fillRect(b.x0 - 1, b.y0 + 9, b.x1 - b.x0 + 3, 1); g.fillRect(Math.round(mid), b.peak, 1, 10);
      g.fillStyle = '#b8362f'; g.fillRect(b.x0 - 1, b.y0, 3, b.y1 - b.y0 + 1); g.fillRect(b.x1 - 1, b.y0, 3, b.y1 - b.y0 + 1);
      g.fillStyle = '#fff6e4'; g.fillRect(b.x0 + 2, b.y1 - 1, 2, 2); g.fillRect(b.x1 - 3, b.y1 - 1, 2, 2);
    },
    // The backbox: the ranch at sunset. The barn, the fence, the water
    // trough (with a rubber duck in it), Pepper in her hat with Biscuit and
    // Tato; Pepper hops while the Dinner Bell rings.
    box(b, now, M, fr) {
      ['#f7c97a', '#f4b06a', '#ee9a64', '#e08a62'].forEach((c, i) => { b.fillStyle = c; b.fillRect(0, i * 6, W, 6); });
      b.fillStyle = '#e08a62'; b.fillRect(0, 24, W, M - 24);
      disc(166, 12, 5, '#fff0b0', b);
      clouds.forEach(c => { const x = Math.round((c.x + (calm ? 0 : now / 400)) % (W + 30)) - 30; b.fillStyle = '#fff6e4'; b.fillRect(x, c.y + 2, c.w, 3); b.fillRect(x + 4, c.y, c.w - 8, 2); });
      b.fillStyle = '#9fb858'; b.fillRect(0, 30, W, M - 30);
      b.fillStyle = '#7f9a44'; for (let x = 0; x < W; x += 5) b.fillRect(x + (x % 2), 30, 2, 1);
      b.fillStyle = '#b8362f'; b.fillRect(6, 16, 30, 18);
      b.fillStyle = '#7a1f1a'; b.beginPath(); b.moveTo(3, 17); b.lineTo(21, 7); b.lineTo(39, 17); b.fill();
      b.fillStyle = '#fff6e4'; b.fillRect(15, 22, 12, 12); b.fillStyle = '#b8362f'; b.fillRect(16, 23, 10, 11);
      pline(16, 23, 25, 33, 1, '#fff6e4', b); pline(25, 23, 16, 33, 1, '#fff6e4', b);
      b.fillStyle = C.rampLine; b.fillRect(0, 31, W, 1); b.fillRect(0, 35, W, 1);
      b.fillStyle = C.rampDark; for (let x = 40; x < W; x += 12) b.fillRect(x, 29, 2, 9);
      b.fillStyle = '#6b4426'; b.fillRect(140, 33, 26, 6); b.fillStyle = '#5aa6e4'; b.fillRect(141, 33, 24, 2);
      b.drawImage(DUCK, 151, 28 + (calm ? 0 : Math.round(Math.sin(now / 400))));
      const hop = fr && !calm ? Math.round(Math.abs(Math.sin(now / 140)) * 3) : 0;
      b.drawImage(PEPPER, 46, 24 - hop);
      b.drawImage(BISCUIT, 76, 24);
      b.drawImage(TATO, 100, 25);
      marqueeTitle(b, 6, 3, '#fff6e4', '#5e3a1c');
    },
  };
})();
