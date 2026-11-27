// The Zombies of Tomorrow table (Randi, 27 Nov: "can we do a second one
// that's zombies of tomorrow themed"). Loaded after game.js like the Pepper
// table, and it plays on the same layout; this file is its words, colours,
// sprites, the painted field, Ego House and the silo, and the backbox.
//
// Everything here comes from the released Zombies of Tomorrow game, so
// nothing from its private story is on this public page: the 1950s print
// palette (the game's pixel.py), Ship Seven, the asteroids ("Mind the
// rocks"), the Moon-Bloom buds you zap, Jackpot crates, Ego House, Ivan's ray
// gun, the brass key, the station plans, the beacon and Mr. Ego's reels. The
// asteroid, Ship Seven and the two drifters are that game's own sprites
// (flight_art.js and art.js), shrunk by keeping the commonest colour in each
// 2 x 2, 4 x 4 block; its corgi was tried too and came out as a smudge. Its
// rule that a drifting person can't be zapped holds here: the drifters are
// on the backbox, humming, and never on the table to be hit.
(() => {
  const PZ = { K: '#1b1a2e', N: '#1f2a52', D: '#141b38', S: '#fff4c2', Y: '#e8b33c', y: '#be8c28', R: '#c8423b', r: '#8e2a2a', T: '#3f9c96', t: '#2a6b68', G: '#5a9a3c', g: '#3e7029', L: '#c9ced6', l: '#8b93a3', H: '#f2f4f8', O: '#d9822b', o: '#a85a1c', W: '#f6efdc', w: '#d6ccb6', P: '#e88a9a', C: '#f3e6c4', U: '#e9c97a', u: '#d6b05c', F: '#9a6a42', f: '#7a5030', B: '#a9d8e8', b: '#78aac8', E: '#4678c8', e: '#2d5096', M: '#966eaa', m: '#694b7d', Q: '#eec49e', q: '#cc9a74', A: '#3454a0', a: '#243a78', Z: '#5c6070' };
  const spr = (rows, flip = false) => RDG.sprite(rows, PZ, { line: PZ.K, flip });
  const ROCK = spr(['...KKKKK...', '..KLLLLll..', '.KLLLLlZll.', '.LLLLlZZllK', 'KLLLlllllZZ', 'KLLlllllZZZ', 'KLlllllZZZZ', '.lllllZZZZZ', '.KlllZZZZZK', '..KlZZZZZK.', '...KZZZK...', '.....K.....']);
  const SHIP = spr(['.........rr.........', '.........RR.........', '.........RR.........', '.........RR.........', '.......KLLLLL.......', '......LLLLLLLL......', '.....LLHHLLLLLL.....', '.....LHHHHKLLLL.....', '....KLLHKZZZLLLl....', 'RRR.KLLLZYYZKLll.RRR', 'RRRRRLLKZYSYKlllRRRR', 'RRRRRLLLZZYZllllRRRR', '.....LLLLKKllll.....', '......LLLSSYll......', '.......LLRRll.......']);
  const DRIFT = [
    ['....Ky....', '...yyyy...', '..Kyyyyy..', '..yyyyyy..', '...yyyyK..', '...QQQQ...', '....QQK...', '..OOOOOO..', '..OOOOOoO.', '.OOOOOOoO.', '.OOOOOOo.O', 'K.OOOOOo.Q', '..OOOOOo..', '...ZZZZK..', '...ZZZZZ..', '...ZZZZZ..', '...ZZZZZ..', '..KZKKZK..', '..KKKKKK..'],
    ['....Ko....', '...oooo...', '..Kooooo..', '..oooooo..', '...ooooK..', '...QQQQ...', '....QQK...', '..KMMMMK..', '..KMMMMKw.', '.wKMMMMMw.', '.wKMMMMm.w', 'K.KMMMMm.Q', '..AAAAAa..', '..AAAAAa..', '..AAAAAa..', '..AAAAAaA.', '..AAAAAaA.', '.AAAAAAaa.', '...ffKfK..'],
  ].map(r => [spr(r), spr(r, true)]);
  // a Moon-Bloom bud on its root legs, the flower that watches you on top
  const BUD = ['..PPP..', '.PWKWP.', '..PPP..', '...t...', '.BBtBB.', 'BbBtBbB', '.L.t.L.', 'L..t..L'];
  // the studio's rubber duck, drifting past in space
  const DUCK = RDG.sprite(['.yy..', 'yyko.', '.yyyy', 'yyyyy'], { y: '#ffd23f', k: '#16121a', o: '#ff8a1e' }, { line: '#16121a' });
  // what's lost in Ego House's basement, to be packed for the colony
  const STASH = [
    { id: 'key', name: 'BRASS KEY', rows: ['.YY.....', 'Y..YYYYY', '.YY..Y.Y'] },
    { id: 'raygun', name: 'RAY GUN', rows: ['..LLL...', 'RRRRRLL.', 'RRRRR...', '.RR.....', '.R......'] },
    { id: 'bar', name: 'JACKPOT BAR', rows: ['YYYYYYY', 'YRYRYRY', 'YYYYYYY'] },
    { id: 'plans', name: 'STATION PLANS', rows: ['AAAAAA', 'AHAAHA', 'AAHHAA', 'AHAAHA', 'AAAAAA'] },
    { id: 'beacon', name: 'BEACON', rows: ['..R..', '.LLL.', 'LLRLL', 'LLLLL', '.l.l.'] },
    { id: 'reel', name: 'EGO REEL', rows: ['.ZZZ.', 'ZLZLZ', 'ZZKZZ', 'ZLZLZ', '.ZZZ.'] },
  ].map(it => ({ ...it, img: spr(it.rows) }));

  const C = {
    cab: '#141b38', cabDark: '#0c1026', rail: '#c9ced6', railDark: '#1b1a2e',
    ring: '#c8423b', base: '#2a2850', baseHi: '#f2f4f8', frenzyRing: '#e8b33c',
    sling: '#3f9c96', rubber: '#c8423b', flip: '#f6efdc',
    litOn: '#e8b33c', litOff: '#4b5578', text: '#8b93a3', slot: '#2a3a6a', hole: '#0a0d1e',
    rampLine: '#c9ced6', rampDark: '#5c6070', chrome: '#c9ced6', rim: '#3f9c96',
    secretRim: '#3f9c96', dent: '#2a3a6a', bowl: '#e8b33c', bowlRim: '#be8c28', barnHole: '#5c6070',
    mound: '#8b93a3', bump: '#3f9c96', bumpHi: '#a9d8e8', mote: 'rgba(255,244,194,.85)', bulbOff: '#3a2a5a',
    tunnel: '#2c3a6e', plate: '#2a6b68', plateHi: '#3f9c96',
  };
  // deep night with stars, and the teal deck plates of the colony
  const SKY = RDG.tile('zotSky', 12, 12, (set, fill, r) => {
    fill(0, 0, 12, 12, PZ.D);
    for (let i = 0; i < 3; i++) set(Math.floor(r() * 12), Math.floor(r() * 12), PZ.N);
    if (r() < .6) set(Math.floor(r() * 12), Math.floor(r() * 12), PZ.S);
  });
  const PLATE = RDG.tile('zotPlate', 12, 12, (set, fill) => {
    fill(0, 0, 12, 12, C.plate);
    fill(0, 0, 12, 1, PZ.t); fill(0, 0, 1, 12, PZ.t); fill(1, 1, 11, 1, C.plateHi);
    set(3, 3, PZ.l); set(9, 3, PZ.l); set(3, 9, PZ.l); set(9, 9, PZ.l);
  });
  const drifters = [{ x: 150, dir: -1, k: 0, v: 6 }, { x: 96, dir: 1, k: 1, v: 4.5 }];

  TABLES.zombies = {
    id: 'zombies', C, STASH,
    bumper: ROCK, bumperAt: [-6, -6],
    target: [spr(BUD), spr(BUD, true)], targetAt: [-3, -6, -5],
    str: {
      name: 'Zombies of Tomorrow',
      blurb: 'Mind the rocks. Ride the launch rail, shoot into Ship Seven\'s silo to find what\'s lost in Ego House\'s basement, and zap the Moon-Bloom buds.',
      howBalls: 'Shoot the launch rail again and again for more each time. Shoot into Ship Seven\'s silo and the ball goes under Ego House, where things for the colony were lost: every trip finds one more. The Jackpot crate starts Jackpot. Zap the Moon-Bloom buds to get at the hatch behind them; a whole row keeps the way open. Light Z A P for a bonus multiplier.',
      statStash: 'Things packed: {n}',
      statStashes: 'All packed: {n}',
      statSecrets: 'Secret hatches: {n}',
      statFrenzies: 'Jackpots: {n}',
      statDucks: 'Moon-Bloom buds zapped: {n}',
      statRows: 'Bud rows: {n}',
      statTubs: 'Z A P lit: {n}',
      liveSecret: 'Secret hatch, 10,000 points',
      liveFrenzy: 'Jackpot',
      liveFound: 'Found the {thing} in the basement',
      liveStash: 'All packed for the colony, 25,000 points',
      mTitle: 'ZOMBIES OF TOMORROW',
      lanes: 'ZAP',
      dDuckRow: 'BUD ROW!',
      dOpen: 'HATCH OPEN',
      dSecret: 'SECRET HATCH!',
      dFrenzy: 'JACKPOT!',
      dFrenzyMore: 'JACKPOT +10',
      dFrenzyT: 'JACKPOT {s}',
      dTub: 'ZAP! {m}X',
      dTubMax: 'ZAP! 5X MAX',
      dBarn: 'INTO THE SILO',
      dFound: 'FOUND: {thing}',
      dStash: 'ALL PACKED!',
    },
    paint(b) {
      b.fillStyle = C.cab; b.fillRect(0, 0, W, TH);
      b.save();
      fieldPath(b); b.fillStyle = b.createPattern(SKY, 'repeat'); b.fill(); b.clip();
      // a planet low on the left, and the colony's deck plates where the
      // ball runs most: the lanes, round the rocks, down to the flippers
      disc(150, 236, 26, PZ.m, b); disc(146, 232, 24, PZ.M, b);
      b.fillStyle = 'rgba(105,75,125,.8)'; b.fillRect(122, 228, 50, 2); b.fillRect(124, 238, 46, 2);
      b.fillStyle = b.createPattern(PLATE, 'repeat');
      b.fillRect(50, 20, 66, 30);
      b.beginPath(); b.ellipse(83, 118, 44, 34, 0, 0, 7); b.fill();
      b.beginPath(); b.moveTo(46, 180); b.lineTo(120, 180); b.lineTo(132, 320); b.lineTo(34, 320); b.fill();
      b.fillRect(160, 86, 14, 240);
      b.restore();
      paintTunnels(b);
      BANKS.forEach(k => { b.fillStyle = PZ.N; b.fillRect(k.x0 + 1, 117, k.x1 - k.x0 - 1, 52); });
      paintAprons(b, '#232a4e', PZ.K);
      for (const x of [10, 40, 121, 154]) for (let y = 286; y < TH; y += 12) { b.fillStyle = PZ.l; b.fillRect(x, y, 1, 1); }
      b.drawImage(SHIP, 126, 292);
      // the drain: a round hatch with a red 7
      disc(83, 314, 5, PZ.K, b); disc(83, 314, 4, PZ.L, b); RDG.text(b, '7', 82, 312, PZ.R);
      b.fillStyle = PZ.Z; b.fillRect(BARN.x0, BARN.y0, BARN.x1 - BARN.x0, BARN.y1 - BARN.y0);
      b.fillStyle = PZ.l; for (let y = BARN.y0 + 11; y < BARN.y1; y += 3) b.fillRect(BARN.x0 + 1, y, BARN.x1 - BARN.x0 - 2, 1);
    },
    // little teal lights round the top of the table
    rim(x, y, i) { g.fillStyle = i % 2 ? C.rim : PZ.t; g.fillRect(x, y + 3, 2, 2); },
    // Ego House: its chrome wall with portholes, the greenhouse with the
    // Moon-Bloom's leaves (where what's found is put), and the dark
    // basement under it with the things still lost.
    corner() {
      g.save(); cornerClip();
      g.fillStyle = PZ.L; g.fillRect(6, 0, PORCH.x1 - 6, PORCH.house);
      g.fillStyle = PZ.H; for (let y = 6; y < PORCH.house; y += 8) g.fillRect(6, y, PORCH.x1 - 6, 1);
      g.fillStyle = PZ.l; for (let y = 9; y < PORCH.house; y += 8) g.fillRect(6, y, PORCH.x1 - 6, 1);
      for (const x of [16, 28]) { disc(x, 36, 4, PZ.K); disc(x, 36, 3, PZ.B); g.fillStyle = PZ.H; g.fillRect(x - 2, 34, 1, 1); }
      g.fillStyle = PZ.t; g.fillRect(6, PORCH.house, PORCH.x1 - 6, PORCH.under - PORCH.house);
      g.fillStyle = 'rgba(169,216,232,.35)'; for (let x = 8; x < PORCH.x1; x += 6) g.fillRect(x, PORCH.house, 1, PORCH.under - PORCH.house);
      g.fillStyle = PZ.L; g.fillRect(6, PORCH.house, PORCH.x1 - 6, 1); g.fillRect(6, PORCH.under - 1, PORCH.x1 - 6, 1);
      drawFound();
      g.fillStyle = '#0a0d1e'; g.fillRect(6, PORCH.under, PORCH.x1 - 6, PORCH.y1 - PORCH.under);
      drawLost();
      g.restore();
    },
    // drawn over the ball: the basement's grate, and the silo's roof and walls
    front() {
      g.fillStyle = 'rgba(139,147,163,.8)';
      for (let x = 8; x < PORCH.x1; x += 4) g.fillRect(x, PORCH.under, 1, PORCH.y1 - PORCH.under);
      g.fillStyle = PZ.l; g.fillRect(6, PORCH.y1 - 1, PORCH.x1 - 6, 2); g.fillRect(PORCH.x1 - 1, PORCH.house, 2, PORCH.y1 - PORCH.house);
      const b = BARN, mid = (b.x0 + b.x1) / 2;
      g.fillStyle = PZ.L; g.beginPath(); g.moveTo(b.x0 - 1, b.y0 + 3); g.lineTo(mid, b.peak - 1); g.lineTo(b.x1 + 1, b.y0 + 3); g.lineTo(b.x1 + 1, b.y0 + 10); g.lineTo(b.x0 - 1, b.y0 + 10); g.fill();
      g.fillStyle = PZ.l; g.fillRect(b.x0 - 1, b.y0 + 9, b.x1 - b.x0 + 3, 1);
      RDG.text(g, '7', Math.round(mid) - 1, b.y0 + 2, PZ.R);
      g.fillStyle = PZ.L; g.fillRect(b.x0 - 1, b.y0, 3, b.y1 - b.y0 + 1); g.fillRect(b.x1 - 1, b.y0, 3, b.y1 - b.y0 + 1);
      g.fillStyle = PZ.R; g.fillRect(b.x0 + 2, b.y1 - 1, 2, 2); g.fillRect(b.x1 - 3, b.y1 - 1, 2, 2);
    },
    // The backbox: night over the colony, a planet, Ship Seven flying,
    // twinkling stars, and two drifters humming slowly across; Ship Seven
    // rocks while Jackpot is on.
    box(b, now, M, fr, dt) {
      b.fillStyle = PZ.D; b.fillRect(0, 0, W, M);
      for (let i = 0; i < 26; i++) { const x = (i * 53) % W, y = (i * 29) % M; b.fillStyle = (i + (calm ? 0 : now / 300 | 0)) % 5 ? PZ.N : PZ.S; b.fillRect(x, y, 1, 1); }
      disc(22, 34, 16, PZ.m, b); disc(20, 32, 14, PZ.M, b);
      b.fillStyle = 'rgba(105,75,125,.9)'; b.fillRect(8, 30, 26, 2); b.fillRect(10, 37, 22, 1);
      b.drawImage(DUCK, Math.round(W - ((calm ? 40 : now / 90) % (W + 20))), 14);
      const rock = fr && !calm ? Math.round(Math.sin(now / 90) * 2) : 0;
      b.drawImage(SHIP, 44, 17 + rock);
      // the drifters walk slowly to the far side and back, humming
      b.fillStyle = PZ.Z; b.fillRect(0, M - 4, W, 4);
      drifters.forEach(d => {
        if (!calm) { d.x += d.dir * d.v * (dt || 0); if (d.x < 74) d.dir = 1; if (d.x > 160) d.dir = -1; }
        b.drawImage(DRIFT[d.k][d.dir < 0 ? 0 : 1], Math.round(d.x), M - 23);
      });
      marqueeTitle(b, 0, 3, PZ.Y, PZ.r);
    },
  };
})();
