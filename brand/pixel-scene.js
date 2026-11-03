// The share pictures (og-image.html, github-social-preview.html), drawn in
// 8-bit like the games. Decided 3 Nov: "games for kids, by kids", with the
// games' own sprites instead of emoji. Everything is drawn on a small canvas,
// 4 screen pixels to a pixel, and scaled up with smoothing off. The sprites
// are copied from the games (Bread, Crumb, the tugboat, the rodeo rider) and
// the duck from logo.svg; if a game redraws one, copy it here again.
const DUCK = ['....................', '.........kkkk.......', '........koooook.....', '.......koooooook....', '.......koooeoookkk..', '.......kooooooobbbk.', '.......koooooobbbbk.', '.......kooooookkkk..', '..kk....kooooook....', '.kook...kooooook....', '.koookkkkoooooookk..', '.koooooooooooooook..', '.koooodoooooooooook.', '.kooooddoooooodoook.', '..koooodddddddooook.', '..koooooooooooooook.', '...koooooooooooook..', '....kkooooooooookk..', '......kkkkkkkkkk....', '....................',];
const DUCK_COL = { k: '#5a2308', o: '#f28c28', d: '#c2410c', b: '#c2410c', e: '#16131a' };
const BREAD = ['........................', '.............o....o.....', '.............oo..oo.....', '.............opoopo.....', '............oooowooo....', '............oooowooo....', '............oooowwnoo...', '.wo.........oooowwwwwn..', '.ooo.oooooooooowwwwwww..', '...oooooooooowwwwwwo....', '..ooooooooooowwww.......', '..ddooooooooowwww.......', '...dddooowwwwwwww.......', '....dddwwwwwwwww........', '....dd.......oo.........', '....dd.......oo.........', '....ff.......ff.........', '........................'];
const BREAD_COL = {
  k: '#2a1a10', n: '#1d1410', o: '#e8913a', d: '#c46a1f', w: '#fff6ea', p: '#f4a6a0', f: '#fff6ea',
  y: '#ffd23f', Y: '#e0a800', b: '#ff8a1f', r: '#e04848', R: '#a8302f', l: '#bfe8ff', g: '#c9c9d4',
  D: '#2b2b33', m: '#9b5cd8', s: '#b8773a', t: '#8a4f2a', c: '#f2d8b8', u: '#3a6fd8', h: '#ffffff', e: '#ffe680',
  G: '#3f8a5c', L: '#5aa772', q: '#2e6b45', W: '#5bb8e8', V: '#3a8fc0', P: '#e8a0bf', Q: '#cf7fa3', M: '#a07bc4', N: '#7b4fa0',
};
const CRUMB = [...['..........D..D....', '..........DD.DD...', '..........DpDDpD..', '.........DDDsDDD..', '.........DDDhDsss.', '.D.......DDDDssssn', '.DD.DDDDDDDDDsss..', '..DDDDDDDDDDsss...', '..DDDDDDDDDDss....', '...DDDDDDDDss.....'], '...sD.....ss......', '...ss.....ss......'];
const TUG = ['..............DD........', '..............DD........', '..............rr........', '..............DD........', '..........hhhhhhhhh.....', '..........hllhllhlh.....', '..........hllhllhlh.....', '..........hhhhhhhhh.....', '.rrrrrrrrrrrrrrrrrrrrrr.', '..rrrgrrrrgrrrrgrrrrrrrr', '..rrrrrrrrrrrrrrrrrrrrr.', '...RRRRRRRRRRRRRRRRRRR..'];
const TUG_COL = {
  k: '#1d1410', D: '#24242c', h: '#ffffff', r: '#e04848', R: '#a8302f', l: '#bfe8ff', g: '#8c8c96', y: '#ffd23f', Y: '#e0a800',
  b: '#ff8a1f', t: '#8a4f2a', s: '#b8773a', c: '#f2d8b8', P: '#f4a6a0', Q: '#d9837d', G: '#5aa772', q: '#3f8a5c', u: '#3a6fd8', m: '#9b5cd8',
  W: '#5bb8e8', V: '#3a8fc0', o: '#e8913a', p: '#f7c6d8', e: '#ffe680', n: '#2b2b33', a: '#7fd36b',
};
const SPR = {
  body: [
    '...........................t.t',
    '..........................mbbb',
    '.........................mmbkbb',
    '........................mmbbbbbbb',
    '.......................mmbbbbbbbbp',
    '......................mmbbbb..bbbp',
    '.....................mmbbbb',
    '...mmm...bbbbbbbbbbbmmbbbbb',
    '.mmmmbbbbbbbbbbbbbbbbbbbbbb',
    'mmm.bbbbbbbbbbbbbbbbbbbbbbb',
    'mm..bbbbbbbbbbbbbbbbbbbbbb',
    'm...bbbbbbbbbbbbbbbbbbbbb',
    'm...bbbbbbbbbbbbbbbbbbbb',
    '.....bbbbbddddddddbbbbb',
  ],
  legs: [
    ['..bb....................bbb', '.bb.......................bb', 'bb.........................bb', 'b...........................bb', 'h............................hh'],
    ['.....bb..............bb', '......bb............bb', '.......bb...........bb', '.......bb..........bb', '.......hh..........hh'],
    ['.....bbb........bbb', '.......bbb....bbb', '.........bbbbb', '........hh..hh'],
    ['....bb.................bb', '...bb....................bb', '..bb.......................b', '..bb........................b', '..hh.........................h'],
  ],
  // the rider: a cowboy hat, a braid flying behind her, and her hands on the reins
  girl: [
    '.....HHHH',
    '....HHHHHH',
    '....nnnnnn',
    '.HHHHHHHHHHHH',
    '..yyffffff',
    '.yyyfffkff',
    'yy.yffffff',
    'y...rrrrr',
    '....rrrrrrrf',
    '....rrrrr..ff',
    '....rrrr',
    '....ssssss',
    '....jjjjjj',
    '.....jjjj',
    '.....jjj',
    '.....jjj',
    '.....kkk',
  ],
};
const PAL = { b: '#8a4f2a', d: '#5e3319', m: '#2a1a12', t: '#8a4f2a', k: '#1d1410', p: '#c98a6a', h: '#1d1410', r: '#d8343f', s: '#6b3a1a', f: '#f2c8a0', y: '#e8b33f', j: '#3a6fd8', H: '#c9853f', n: '#6b3a1a', e: '#b8362f' };
const RIDER = (() => {
  const g = Array.from({ length: 34 }, () => Array(40).fill('.')), top = 5;
  const put = (rows, x, y, as) => rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g[y + j][x + i] = as && ch !== 'h' ? as : ch; }));
  put(SPR.legs[1], 3, top + 14, 'd'); put(SPR.legs[0], 1, top + 14); put(SPR.body, 1, top);
  put(['eeeeeeeeee', 'eeeeeeeeee', 'eeeeeeeeee'], 10, top + 7); put(['ssssssss'], 11, top + 6); put(SPR.girl, 7, 1);
  return g.map(r => r.join(''));
})();

function drawScene(cv, title, tag) {
  const S = 4, W = Math.round(cv.width / S), H = Math.round(cv.height / S);
  const lo = document.createElement('canvas'); lo.width = W; lo.height = H;
  const x = lo.getContext('2d');
  const px = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), w, h); };
  // a sprite with a one-pixel dark outline, like the games draw them
  const sprite = (rows, col, X, Y, k = 1, flip = false, line = '#1d1410') => {
    const w = Math.max(...rows.map(r => r.length)), at = (i, j) => (rows[j] || '')[i] || '.';
    for (let j = -1; j <= rows.length; j++) for (let i = -1; i <= w; i++) {
      const ch = at(i, j), xx = X + (flip ? w - 1 - i : i) * k, yy = Y + j * k;
      if (ch !== '.') px(xx, yy, k, k, col[ch] || line);
      else if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => at(i + a, j + b) !== '.')) px(xx, yy, k, k, line);
    }
  };
  const sky = Math.round(H * .6);
  // sky in bands, pixel clouds, grass with tufts
  ['#cfeaff', '#d9efff', '#e3f3ff', '#ecf7ff'].forEach((c, i) => px(0, i * sky / 4, W, sky / 4 + 1, c));
  const cloud = (a, b) => { px(a + 4, b, 14, 3, '#ffffff'); px(a, b + 3, 26, 4, '#ffffff'); px(a + 2, b + 7, 20, 1, '#d9e8f5'); };
  cloud(W * .08, 10); cloud(W * .55, 6); cloud(W * .84, 56);
  px(0, sky, W, H - sky, '#a6e08f'); px(0, sky, W, 2, '#cdeeb8'); px(0, sky + 2, W, 1, '#8fd17a');
  for (let i = 0; i < W; i += 9) { const yy = sky + 8 + (i * 7) % (H - sky - 12); px(i, yy, 1, 2, '#79bd66'); px(i + 2, yy - 1, 1, 3, '#79bd66'); }
  // the pond, stepped like an 8-bit ellipse, and the duck sitting in it
  const pcx = W * .19, pcy = sky + 20, rx = W * .2, ry = 9;
  for (let j = -ry; j <= ry; j++) { const half = Math.round(rx * Math.sqrt(1 - (j / (ry + .5)) ** 2)); px(pcx - half, pcy + j, half * 2, 1, j > ry - 3 ? '#5fb4e6' : '#8fd3f5'); }
  px(pcx - rx * .5, pcy - 2, 8, 1, '#ffffff'); px(pcx + rx * .4, pcy + 2, 6, 1, '#ffffff');
  const dk = 4; sprite(DUCK, DUCK_COL, pcx - 12 * dk, pcy - 18 * dk, dk, false, '#5a2308');
  sprite(TUG, TUG_COL, pcx + rx - 30, pcy - 9, 1);   // the tugboat out on the pond
  // the games' own characters along the bottom
  sprite(BREAD, BREAD_COL, W * .48, H - 26, 1);
  sprite(CRUMB, { D: '#2b2b33', s: '#c46a1f', p: '#f4a6a0', h: '#ffffff', n: '#1d1410' }, W * .48 + 30, H - 19, 1);
  sprite(RIDER, PAL, W * .74, H - 40, 1);
  // the words in the pixel font, snapped to hard pixels
  const words = (str, a, b, size, col) => {
    const t = document.createElement('canvas'); t.width = W; t.height = size * 2;
    const g = t.getContext('2d'); g.font = `${size}px "Press Start 2P"`; g.fillStyle = col; g.textBaseline = 'top'; g.fillText(str, 0, 0);
    const d = g.getImageData(0, 0, W, size * 2);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0;
    g.putImageData(d, 0, 0);
    x.drawImage(t, a, b);
  };
  const tx = Math.round(W * .35);
  title.forEach((line, i) => { words(line, tx + 1, 22 + i * 22 + 1, 16, '#8fb4d6'); words(line, tx, 22 + i * 22, 16, '#23324a'); });
  tag.forEach((line, i) => words(line, tx, 74 + i * 13, 8, '#4d5d74'));
  const out = cv.getContext('2d'); out.imageSmoothingEnabled = false; out.drawImage(lo, 0, 0, W * S, H * S);
}
