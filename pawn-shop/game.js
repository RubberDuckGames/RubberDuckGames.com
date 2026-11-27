// The Flip Shop (working title). The oldest kid tester's idea, 26 Nov (Trello
// #60): a twist on Barn Secrets. In Barn Secrets you find things; here you buy
// finds cheap, work out what they're really worth and sell them from your own
// little shop.
//
// Version 1 is the foundation, from the card: one cramped shop seen from
// above in 8-bit, one place to buy (the Oakridge Suburbs yard sales), seven
// kinds of find, the appraisal camera bolted to the desk, price tags or a
// quick sale to the dealer, customers who haggle at the register, and the
// Rent Pool. Everything in the card's "Later" list (the city map, auctions,
// storage units, licenses, vehicles, expansion, the arcade cabinet, the jet)
// waits for a build of its own.
//
// A day: go out to the yard sales in the morning (once), buy by eye, come
// back, snap each find at the desk to see what it's worth, tag it and put it
// out, then open the shop until 5 PM. Every sale is rung up at the register
// and split: what you paid for the find goes into the Rent Pool, only the
// profit goes in your pocket. Rent comes out of the pool every few days.
const $ = s => document.querySelector(s);

// ---------- Words ----------
// Every visible string is here by key, whole sentences with {placeholders}
// (the parent rule for a new product). Lists are picked from at random.
const STR = {
  title: 'The Flip Shop',
  intro: 'Buy old finds at yard sales, work out what they\'re really worth, and sell them in your own little shop. Make the rent.',
  play: 'Play', startOver: 'Start over', cancel: 'Cancel', close: 'Close', done: 'Done', back: 'Back', keepPlaying: 'Keep playing',
  startOverAsk: 'Start over? Your money, your finds and the day go back to the start.',
  shop: 'The shop', stick: 'Walking stick', helpBtn: 'How to play', closeHelp: 'Close help', soundBtn: 'Sounds on or off',
  help: [
    '<b>Walk:</b> arrow keys, WASD, the stick, or tap where to go.',
    '<b>Use:</b> Space or the Use button, next to a table, the desk, the register or the door. Or tap the thing itself.',
    '<b>The desk:</b> the camera there shows what a find is really worth. Set its price tag, then put it out on a table.',
    '<b>Quick sell:</b> the dealer buys it at the desk right away, for less than it\'s worth.',
    '<b>Every sale:</b> what you paid goes into the Rent Pool. Only the profit goes in your pocket.',
    '<b>Help:</b> H or ?. A controller works too.',
  ],
  // the action button, by what's in reach
  use: 'Use', actDesk: 'Desk', actTable: 'Table', actRack: 'Rack', actCase: 'Case', actRegister: 'Register', actDoor: 'Door', actBoard: 'Rent', actLook: 'Look', actCar: 'Car', actSeller: 'Talk',
  // the bar
  day: 'Day {n}', dayClock: 'Day {n} · {clock}', pocket: 'Pocket ${n}', pocketShort: '${n}',
  pool: 'Rent Pool ${n} of ${rent}', poolShort: 'Rent Pool ${n}/${rent}',
  // goals, for the ? help
  goalYardGo: 'Go out the front door to the Oakridge yard sales and buy some finds.',
  goalYard: 'Look over the tables and buy what looks good. Your car takes you back to the shop.',
  goalDesk: 'Take your finds to the desk. Snap a photo to see what each one is worth, then give it a price tag.',
  goalTable: 'Put your tagged finds out on the tables.',
  goalOpenShop: 'Open the shop: go to the front door.',
  goalOpen: 'The shop is open. Customers ring up at the register.',
  goalRegister: 'A customer is waiting at the register.',
  // the door
  doorTitle: 'Front door', doorText: 'Morning, day {n}. Where to?',
  goYard: 'Yard sales', openShop: 'Open the shop', beenYard: 'You\'ve been to the yard sales today. They\'re back tomorrow.',
  nothingOut: 'Nothing is out on the tables yet, so nobody will buy anything.',
  closeTitle: 'Close up early?', closeText: 'It\'s {clock}. Close the shop for the day?', keepOpen: 'Keep it open', closeUp: 'Close up',
  // the yard sale
  yardName: 'Oakridge Suburbs yard sales',
  yardHello: 'Yard sale! Everything\'s priced. Ask if you want a deal.',
  sellerLines: ['Everything must go!', 'Cleaning out the garage.', 'Grandpa kept everything.', 'Ask if you want a deal.'],
  ask: 'Asking', yourPocket: 'You have ${n}.', buy: 'Buy ${n}', leave: 'Leave it', askLess: 'Ask for less',
  sellerYes: ['Oh, fine. ${n}.', 'For you? ${n}.', 'Sure, ${n}. It\'s just taking up space.'],
  sellerNo: ['Sorry, that price is firm.', 'Nope, that\'s a fair price.', 'I could get more on the internet!'],
  bought: 'Bought the {item} for ${n}.', tooPoor: 'Not enough money in your pocket.',
  sealedNote: 'Sealed tight. No peeking. Could be junk, could be treasure.',
  carTitle: 'Back to the shop?', carText: 'You bought {n} today.', carNone: 'You didn\'t buy anything.', drive: 'Drive back', stay: 'Keep looking',
  yardEmpty: 'Sold out! Back to the car.',
  // the desk
  deskTitle: 'The desk', deskText: 'The appraisal camera is bolted to the desk. Pick a find.', deskEmpty: 'Nothing in the back room. Buy finds at the yard sales.',
  paid: 'You paid', worth: 'Worth', worthUnknown: '?', tag: 'Price tag', noTag: 'No tag',
  snap: 'Snap a photo', snapped: 'Flash! Worth ${n}.', openBox: 'Open the box', boxOpened: 'Inside: {item}! Worth ${n}.',
  quick: 'Quick sell ${n}', quickNote: 'The dealer buys right away, but pays only part of what it\'s worth.',
  putOut: 'Put it out', putHere: 'Put it here', takeBack: 'Take it back', noRoom: 'Every table is full.', needTag: 'Give it a price tag first.',
  tagLabel: 'Price tag $', less: '− $5', more: '+ $5',
  unknownNote: 'Snap a photo at the desk to see what it\'s really worth.',
  // a spot on the floor
  spotTitle: { table: 'A table', case: 'The glass case', rack: 'The rack' },
  spotEmpty: 'Empty. Put a find out here?', spotNone: 'Nothing in the back room to put out.',
  // the rent board
  boardTitle: 'Rent', boardText: 'Rent is ${rent}, due on day {day}. The Rent Pool has ${pool}.',
  boardOwed: 'Still owed from last time: ${n}.', boardSplit: 'Each sale puts what you paid for the find into the Rent Pool. Only the profit goes in your pocket.',
  // customers and the register
  browse: ['Hmm.', 'Ooh.', 'Let\'s see...'],
  tooPricey: ['Too pricey!', 'No way, not at that price.', 'Maybe somewhere else.'],
  nothingHere: 'Nothing for sale?',
  wait: 'Ready to pay!', forget: 'Forget it.', thanks: ['Thanks!', 'Love it!', 'Pleasure doing business.'],
  regTitle: 'The register', regEmpty: 'Nobody is waiting to pay.',
  regPays: 'They want the {item}. Tag ${tag}. They\'ll pay the tag.',
  regOffer: 'They want the {item}. Tag ${tag}. They offer ${offer}.',
  ringUp: 'Ring it up', sellFor: 'Sell for ${n}', counter: 'Ask ${n}', noSale: 'No sale',
  deal: ['Deal!', 'Okay, okay. ${n}.', 'You drive a hard bargain.'],
  walkOff: ['No thanks.', 'Too much for me.', 'I\'ll pass.'],
  soldTitle: 'Sold!', soldText: 'Sold the {item} for ${n}.',
  splitText: '${cost} goes into the Rent Pool (what you paid). ${profit} profit goes in your pocket.',
  lossText: 'That\'s ${loss} less than you paid. All ${n} goes into the Rent Pool.',
  poolLbl: 'Rent Pool ${n}', pocketLbl: 'Pocket ${n}',
  // the day
  openMsg: 'Open! Customers come in until 5 PM.', closing: 'Closing time!',
  dayTitle: 'Day {n} is done', daySold: 'Sold today:', dayNone: 'Nothing sold today.',
  dayTotals: 'Pocket ${pocket}. Rent Pool ${pool}.',
  rentTitle: 'Rent day', rentPaid: 'Rent paid: ${rent}. ${fromPool} from the Rent Pool{more}.', rentMore: ', ${n} from your pocket',
  rentShort: 'You\'re ${n} short. The landlord adds a ${fee} late fee to next time.',
  rentNext: 'Next rent: ${rent}, due on day {day}.',
  nextDay: 'Next day',
  morning: 'Day {n}. Rise and shine.',
  wonTitle: 'Three rents paid!', wonText: 'The shop made it through three rents. The landlord says hello for once.',
  // the finds. A real one and a dud look alike, except for the tell.
  kinds: {
    shovel: 'rusty shovel', plate: 'green glass plate', camera: 'old camera', grinder: 'meat grinder',
    scale: 'balance scale', lantern: 'brass lantern', box: 'sealed mystery box',
  },
  notes: {
    shovel: ['Hand-forged, with a wooden handle and rivets. Old ones like this sell.', 'A cheap shovel with a plastic handle, left out in the rain.'],
    plate: ['Uranium glass! See it glow? Collectors love it.', 'Plain green glass. Pretty, but common.'],
    camera: ['A real vintage camera. See the tiny gold stamp on top?', 'A toy camera. No maker\'s stamp.'],
    grinder: ['Stamped No. 22 on the side. A real old one.', 'No stamp. A newer copy.'],
    scale: ['Solid brass pans. They shine.', 'Painted tin. The paint is chipping off.'],
    lantern: ['The glass is whole. It still lights.', 'The glass is cracked, so it won\'t hold a flame.'],
  },
  boxIn: { peanuts: 'packing peanuts and a teacup', marbles: 'a bag of old marbles', comics: 'a stack of old comic books', watch: 'a silver pocket watch', rare: 'a rare first edition comic' },
  boxName: 'box of {item}',
};
const t = (k, v = {}) => { let s = k.split('.').reduce((o, p) => o[p], STR); if (Array.isArray(s)) s = s[Math.floor(Math.random() * s.length)]; return String(s).replace(/\{(\w+)\}/g, (_, n) => v[n]); };

// ---------- Tuning ----------
// The sample prices are the card's (field buy and true value). Everything
// else is ours (26 Nov): the odds of a dud, the dealer's share, how
// customers pay and haggle, the rent. Times in seconds, speeds in tiles a
// second. Change after play-tests.
const KINDS = {
  // ask: what yard sales ask; real/dud: what it's worth; real: chance it's the good one
  shovel: { ask: [15, 50], worth: 60, dud: 6, real: .55 },
  plate: { ask: [5, 25], worth: 180, dud: 8, real: .45 },
  camera: { ask: [40, 40], worth: 250, dud: 15, real: .5 },
  grinder: { ask: [10, 30], worth: 70, dud: 12, real: .5 },
  scale: { ask: [20, 45], worth: 95, dud: 15, real: .5 },
  lantern: { ask: [10, 25], worth: 55, dud: 6, real: .5 },
  box: { ask: [100, 100] },
};
// The card's mystery box: $100 for anything from $10 to $5,000.
const BOX_IN = [
  { id: 'peanuts', p: .5, v: [10, 30] }, { id: 'marbles', p: .3, v: [40, 90] }, { id: 'comics', p: .13, v: [120, 250] },
  { id: 'watch', p: .06, v: [400, 700] }, { id: 'rare', p: .01, v: [5000, 5000] },
];
const TUNE = {
  walk: 4.4, cust: 2.4,
  jitter: .15,               // a find's worth is its kind's, give or take this share
  dealer: .6,                // quick sell pays this share of what it's worth
  boxWorth: 110,             // what a customer thinks a sealed box is worth
  sellerYes: .5, sellerCut: .75,
  dayLen: 100, firstCust: 3, custEvery: [7, 12], browse: [2, 3.2], wait: 30,
  pay: [.85, 1.25],          // a customer would pay this share of what it's worth
  haggleAnyway: .3,          // ...and sometimes tries to haggle a fair tag down anyway
  stretch: 1.5,              // a tag up to this far over what they'd pay starts a haggle; more and they walk
  offer: [.75, .9],
  start: 150, rent: 100, rentUp: 50, rentEvery: 3, late: 10, winAfter: 3,
  hint: 5000,
};
const rand = (a, b) => a + Math.random() * (b - a);
const randIn = ([a, b]) => rand(a, b);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round5 = n => Math.max(5, Math.round(n / 5) * 5);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------- Save ----------
// One shop per device, under `pawn-shop`. A find is { uid, kind, good, value,
// cost, seen, tag, opened, inside }; `spots` says which find is on each table.
const KEY = 'pawn-shop';
const fresh = () => ({ day: 1, phase: 'morning', clock: 0, pocket: TUNE.start, pool: 0, rent: TUNE.rent, rentDay: TUNE.rentEvery, owed: 0, paidRents: 0, won: false, yardDone: false, stock: [], spots: [null, null, null, null, null], uid: 1, sound: true, seenHelp: false, started: false });
const S = Object.assign(fresh(), load());
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

// ---------- Screen ----------
// Bread's 8-bit way: 16 pixels to a tile on a small canvas scaled up with
// smoothing off. The shop is one cramped room that fits the screen. On a
// phone held upright the whole room came out a thin strip with empty screen
// under it (26 Nov, at 375 x 812), so there the view is 12 tiles across and
// follows the shopkeeper, as in The Mighty Pepper.
const T = 16, W = 20, H = 12;
let VW = W, camX = 0;
const lo = document.createElement('canvas'); lo.width = W * T; lo.height = H * T;
const cx = lo.getContext('2d'); cx.imageSmoothingEnabled = false;
const cv = $('#cv'), out = cv.getContext('2d');
function resize() {
  const coarse = matchMedia('(pointer:coarse)').matches, upright = innerHeight > innerWidth;
  const roomH = innerHeight - (coarse ? (upright ? 11 * 16 : 0) : 0) - (innerWidth <= 480 ? 5.2 : 3.4) * 16;
  VW = upright && innerWidth < 600 ? 12 : W;
  // sideways on a phone the controls sit at the corners, over the dark edges
  let w = innerWidth - (coarse && !upright ? 2 * 9.5 * 16 : 0), h = w * H / VW;
  if (h > roomH) { h = Math.max(150, roomH); w = h * VW / H; }
  $('#box').style.width = w + 'px';
  cv.style.height = h + 'px';
  const k = Math.max(1, Math.ceil(w * Math.min(2, devicePixelRatio || 1) / (VW * T)));
  cv.width = VW * T * k; cv.height = lo.height * k;
}
addEventListener('resize', resize);

// ---------- Colours and sprites ----------
const LINE = '#1a120c';
const C = {
  s: '#f0c49a', e: '#1a120c', c: '#2f7a4a', C: '#1f5a34', W: '#3f9a5c', a: '#f3ead8', p: '#3b4a6a', k: '#2a1a10',
  // the finds
  w: '#a8743c', m: '#7a3e1c', R: '#b0582a', r: '#d8784a', n: '#e8e0d0', P: '#4a7ad0',
  g: '#4f8f46', G: '#7fbf68', Y: '#c8ff5a', b: '#1a1a1a', L: '#5a3a2a', S: '#c8ccd4', O: '#7a7e88', o: '#5aa6e4',
  i: '#5e626c', I: '#80848e', B: '#d8a832', Q: '#f6dc78', D: '#9a9070', d: '#7a7a7a', y: '#ffd040', h: '#d7f1ff',
  x: '#c99460', X: '#e0b880', T: '#e8dca0',
};
const spr = (rows, colors = C, flip = false) => RDG.sprite(rows, colors, { line: LINE, flip });
function put(img, x, y) { cx.drawImage(img, Math.round(x), Math.round(y)); }
const px = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); };
const text = (s, x, y, c, k = 1) => RDG.text(cx, s, x, y, c, k);
const textC = (s, x, y, c, k = 1) => text(s, x - RDG.textWidth(s, k) / 2, y, c, k);
const swap = (rows, from, to) => rows.map(r => r.replace(new RegExp(from, 'g'), to));
const edit = (rows, list) => { const r = rows.map(s => s.split('')); for (const [x, y, ch] of list) r[y][x] = ch; return r.map(a => a.join('')); };

// people: the shopkeeper in a green cap and apron, and customers in their own colours
const LEGS = { a: ['..pp..pp..', '..pp..pp..', '..kk..kk..'], b: ['...pp.pp..', '...pp.pp..', '...kk.kk..'] };
const KEEP_TOP = ['..cccccc..', '.cccccccc.', '.CCCCCCCC.', '..sesses..', '..ssssss..', '...ssss...', '..aWWWWa..', '.saWWWWas.', '.saWWWWas.', '..aWWWWa..'];
const KEEPER = { a: [...KEEP_TOP, ...LEGS.a], b: [...KEEP_TOP, ...LEGS.b] };
const CUST_TOP = ['...hhhh...', '..hhhhhh..', '..hssssh..', '..sesses..', '..ssssss..', '...ssss...', '..tttttt..', '.stttttts.', '.stttttts.', '..tttttt..'];
const CUST = { a: [...CUST_TOP, ...LEGS.a], b: [...CUST_TOP, ...LEGS.b] };
const LOOKS = [
  { h: '#5a3a1c', t: '#c84a3a', s: '#f0c49a' }, { h: '#e0c060', t: '#3b6ea8', s: '#f6d2b0' }, { h: '#1a1a1a', t: '#e8a030', s: '#8a5a3a' },
  { h: '#a8a8a8', t: '#8a4ab0', s: '#e8b890' }, { h: '#b8502a', t: '#4a9a6a', s: '#f0c49a' }, { h: '#3a2a1a', t: '#d8d0c0', s: '#c08860' },
].map(l => ({ ...C, ...l, p: '#3b4a6a' }));

// the finds: one picture for both a real one and a dud, then the tell
const PIX = {
  shovel: ['.ww...........', 'w..wwwwwwwwRRR.', '.ww.......RrRRR', '..........RRRRR', '...........RRR.'],
  plate: ['...gggggg...', '.ggGGGGGGgg.', 'ggGGGGGGGGgg', 'gGGGGGGGGGGg', 'gGGGGGGGGGGg', 'ggGGGGGGGGgg', '.ggGGGGGGgg.', '...gggggg...'],
  camera: ['...bbbb.....', 'bbbbbbbbbbbb', 'bSSSbbbbbSSb', 'bLLLbOObLLLb', 'bLLbOooObLLb', 'bLLbOooObLLb', 'bLLLbOObLLLb', 'bbbbbbbbbbbb'],
  grinder: ['..iiii....', '.iIIIIi...', 'iIIIIIIi..', 'iIIIIIIiii', 'iIIIIIIiIi', '.iIIIIi.ii', '..iIIi....', '.iiiiii...', 'iIIIIIIi..', 'iiiiiiii..'],
  scale: ['......bb......', 'bbbbbbbbbbbbbb', '.b....bb....b.', 'BBBB..bb..BBBB', '.BB...bb...BB.', '......bb......', '.....bbbb.....', '....bbbbbb....'],
  lantern: ['...bb...', '..b..b..', '.bbbbbb.', '.bhhhhb.', '.bhyhhb.', '.bhyhhb.', '.bhhhhb.', '.bbbbbb.', 'bBBBBBBb', 'bbbbbbbb'],
  box: ['xxxxxxxxxxxx', 'xXXXXTTXXXXx', 'xXXXXTTXXXXx', 'TTTTTTTTTTTT', 'xXXXXTTXXXXx', 'xXXXXTTXXXXx', 'xxxxxxxxxxxx'],
  open: ['x..........x', 'xx........xx', 'xXXXXXXXXXXx', 'xXXXXXXXXXXx', 'xXXXXXXXXXXx', 'xxxxxxxxxxxx'],
};
const LOOK = {
  shovel: [edit(PIX.shovel, [[10, 2, 'n'], [10, 3, 'n']]), swap(PIX.shovel, 'w', 'P')],
  plate: [PIX.plate, PIX.plate],
  camera: [edit(PIX.camera, [[2, 2, 'y']]), PIX.camera],
  grinder: [edit(PIX.grinder, [[3, 3, 'n'], [5, 3, 'n']]), PIX.grinder],
  scale: [edit(PIX.scale, [[1, 3, 'Q'], [11, 3, 'Q']]), edit(swap(PIX.scale, 'B', 'D'), [[2, 3, 'd'], [12, 4, 'd']])],
  lantern: [PIX.lantern, edit(PIX.lantern, [[3, 3, 'b'], [4, 4, 'b'], [3, 5, 'b'], [4, 6, 'b']])],
};
// uranium glass glows: the rim, drawn on its own so it can pulse
const GLOW = PIX.plate.map(r => r.replace(/[^g]/g, '.').replace(/g/g, 'Y'));
const INSIDE_C = { peanuts: '#f3ead8', marbles: '#5aa6e4', comics: '#e04848', watch: '#c8ccd4', rare: '#ffd040' };
const openRows = {};
function rowsOf(it) {
  if (it.kind === 'box') {
    if (!it.opened) return PIX.box;
    // the open box shows a dab of what's inside
    return openRows[it.inside] || (openRows[it.inside] = edit(PIX.open, [[3, 1, 'Z'], [4, 1, 'Z'], [5, 0, 'Z'], [6, 1, 'Z'], [7, 0, 'Z'], [8, 1, 'Z']]));
  }
  return LOOK[it.kind][it.good ? 0 : 1];
}
const colorsOf = {};
function colOf(it) {
  if (it.kind !== 'box' || !it.opened) return C;
  return colorsOf[it.inside] || (colorsOf[it.inside] = { ...C, Z: INSIDE_C[it.inside] });
}
const itemImg = it => spr(rowsOf(it), colOf(it));
const glows = it => it.kind === 'plate' && it.good;
// a picture for a card: the sprite drawn bigger on a canvas, as a data URL
const urls = new Map();
function picSrc(rows, colors = C, line = LINE) {
  const key = rows.join('|') + (colors.Z || '') + line;
  if (urls.has(key)) return urls.get(key);
  const img = RDG.sprite(rows, colors, { line });
  const k = 8, c = document.createElement('canvas');
  c.width = 18 * k; c.height = 13 * k;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(img, Math.round((18 - img.width) / 2) * k, Math.round((13 - img.height) / 2) * k, img.width * k, img.height * k);
  const u = c.toDataURL(); urls.set(key, u); return u;
}
// the glow's own outline is lit too, so it spills past the plate's edge
const GLOW_LINE = '#b8ff4a';
const glowSrc = () => picSrc(GLOW, C, GLOW_LINE);
function picHtml(it) {
  return `<div class="pic"><img src="${picSrc(rowsOf(it), colOf(it))}" alt="">${glows(it) ? `<img class="glow" src="${glowSrc()}" alt="">` : ''}</div>`;
}

// ---------- The finds ----------
function makeFind(kind) {
  const K = KINDS[kind], f = { uid: S.uid++, kind, cost: 0, seen: false, tag: 0 };
  f.ask = Math.round(randIn(K.ask));
  if (kind === 'box') {
    let r = Math.random(), b = BOX_IN[0];
    for (const x of BOX_IN) { if (r < x.p) { b = x; break; } r -= x.p; }
    f.inside = b.id; f.value = b.v[0] === b.v[1] ? b.v[0] : round5(randIn(b.v)); f.opened = false;
  } else {
    f.good = Math.random() < K.real;
    f.value = round5((f.good ? K.worth : K.dud) * rand(1 - TUNE.jitter, 1 + TUNE.jitter));
  }
  return f;
}
const nameOf = f => f.kind === 'box' && f.opened ? t('boxName', { item: t(`boxIn.${f.inside}`) }) : t(`kinds.${f.kind}`);
const Name = f => { const n = nameOf(f); return n[0].toUpperCase() + n.slice(1); };
const known = f => f.seen || (f.kind === 'box' && f.opened);
// what customers and the dealer think it's worth: they know
const worthTo = f => f.kind === 'box' && !f.opened ? TUNE.boxWorth : f.value;
const byUid = uid => S.stock.find(f => f.uid === uid);
const spotOf = f => S.spots.indexOf(f.uid);
const inBack = () => S.stock.filter(f => spotOf(f) < 0);

// ---------- The shop ----------
// Laid out 26 Nov: the desk with the camera top left, three tables, the glass
// case and the rack, the register counter by the door. The back wall holds
// the rent board.
const SHOP = [
  { id: 'desk', x: 1, y: 2, w: 3, h: 2, stand: { x: 2.5, y: 4.6 }, act: 'actDesk' },
  { id: 'spot0', x: 5, y: 4, w: 2, h: 1, stand: { x: 6, y: 5.6 }, spot: 0, kind: 'table', act: 'actTable' },
  { id: 'spot1', x: 9, y: 4, w: 2, h: 1, stand: { x: 10, y: 5.6 }, spot: 1, kind: 'table', act: 'actTable' },
  { id: 'spot2', x: 13, y: 4, w: 2, h: 1, stand: { x: 14, y: 5.6 }, spot: 2, kind: 'table', act: 'actTable' },
  { id: 'spot3', x: 4, y: 7, w: 3, h: 1, stand: { x: 5.5, y: 8.6 }, spot: 3, kind: 'case', act: 'actCase' },
  { id: 'spot4', x: 18, y: 3, w: 1, h: 3, stand: { x: 17.45, y: 4.6 }, spot: 4, kind: 'rack', act: 'actRack' },
  { id: 'reg', x: 12, y: 8, w: 4, h: 1, stand: { x: 14.5, y: 7.6 }, act: 'actRegister' },
  { id: 'board', x: 8, y: 0, w: 2, h: 2, stand: { x: 9, y: 2.6 }, act: 'actBoard', wall: true },
  { id: 'door', x: 9, y: 11, w: 2, h: 1, stand: { x: 10, y: 10.5 }, act: 'actDoor', wall: true },
];
const SHOP_DOOR = { x: 10, y: 11.8 }, REG_FRONT = { x: 14.5, y: 9.6 };
// the yard sale: the house along the top, two folding tables on the lawn, the
// seller on the driveway, your car on the street
const YARD_SLOTS = [3.7, 5, 6.3, 8.7, 10, 11.3].map((x, i) => ({ x, y: 5, table: i < 3 ? 0 : 1 }));
const YARD = [
  ...YARD_SLOTS.map((s, i) => ({ id: 'slot' + i, x: s.x - .6, y: 4.6, w: 1.2, h: 1, stand: { x: s.x, y: 6.3 }, slot: i, act: 'actLook' })),
  { id: 'seller', x: 15, y: 5, w: 2, h: 2, stand: { x: 16, y: 7.6 }, act: 'actSeller' },
  { id: 'car', x: 2, y: 10, w: 3, h: 2, stand: { x: 3.5, y: 9.6 }, act: 'actCar' },
];
const YARD_SOLID = [{ x: 0, y: 0, w: 20, h: 3 }, { x: 3, y: 4.6, w: 4, h: 1 }, { x: 8, y: 4.6, w: 4, h: 1 }, { x: 15, y: 6, w: 2, h: 1 }, { x: 2, y: 10, w: 3, h: 2 }, { x: 0, y: 11, w: 20, h: 1 }];
let scene = 'shop';
const objs = () => scene === 'shop' ? SHOP : YARD.filter(o => o.slot == null || yard.items[o.slot]);
function solidAt(x, y) {
  if (x < 1 || x >= W - 1 || y < (scene === 'shop' ? 2 : 3) || y >= (scene === 'shop' ? H - 1.2 : H)) return true;
  const list = scene === 'shop' ? SHOP.filter(o => !o.wall) : YARD_SOLID;
  return list.some(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
}
const blocked = (x, y, hw = .3, hh = .2) => solidAt(x - hw, y - hh) || solidAt(x + hw, y - hh) || solidAt(x - hw, y - .01) || solidAt(x + hw, y - .01);
function moveBy(o, dx, dy) {
  if (dx && !blocked(o.x + dx, o.y)) o.x += dx;
  if (dy && !blocked(o.x, o.y + dy)) o.y += dy;
}
// the shortest way over open floor, tile to tile; the door counts as floor
// for customers, who come and go through it
function path(from, to, door = false) {
  const free = (i, j) => (door && scene === 'shop' && j === 11 && (i === 9 || i === 10)) || !solidAt(i + .5, j + .5);
  const fi = clamp(Math.floor(from.x), 0, W - 1), fj = clamp(Math.floor(from.y), 0, H - 1);
  const ti = clamp(Math.floor(to.x), 0, W - 1), tj = clamp(Math.floor(to.y), 0, H - 1);
  const prev = new Map(), key = (i, j) => j * W + i, q = [[fi, fj]];
  prev.set(key(fi, fj), null);
  while (q.length) {
    const [i, j] = q.shift();
    if (i === ti && j === tj) break;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + a, nj = j + b;
      if (ni < 0 || nj < 0 || ni >= W || nj >= H || prev.has(key(ni, nj)) || !free(ni, nj)) continue;
      prev.set(key(ni, nj), key(i, j)); q.push([ni, nj]);
    }
  }
  if (!prev.has(key(ti, tj))) return null;
  const pts = [];
  for (let k = key(ti, tj); k != null; k = prev.get(k)) pts.unshift({ x: k % W + .5, y: Math.floor(k / W) + .6 });
  pts.shift(); if (pts.length) pts.pop();
  pts.push({ x: to.x, y: to.y });
  return pts;
}
// how far the shopkeeper is from a thing, edge to edge
function reach(o) {
  const dx = Math.max(o.x - P.x, 0, P.x - (o.x + o.w)), dy = Math.max(o.y - (P.y - .2), 0, (P.y - .2) - (o.y + o.h));
  return Math.hypot(dx, dy);
}
function inReach() {
  let best = null, bd = .8;
  for (const o of objs()) { const d = reach(o); if (d < bd) { bd = d; best = o; } }
  return best;
}

// ---------- People ----------
const P = { x: 10, y: 9.5, face: 1, moving: false, walkT: 0, route: null, goal: null, stuck: 0 };
let custs = [], floats = [], spawnT = 0;
const yard = { items: [], bought: 0, seller: null };

// ---------- Messages ----------
const queue = []; let msgUntil = 0;
function say(text, ms) { if (queue.length > 2) queue.shift(); queue.push({ text, ms: ms || Math.max(2200, text.length * 65) }); }
function stepMsg(now) {
  const el = $('#msg');
  if (now < msgUntil) return;
  if (!queue.length) { el.hidden = true; return; }
  const m = queue.shift(); el.textContent = m.text; el.hidden = false; msgUntil = now + m.ms;
}
function float(x, y, text, color) { floats.push({ x, y, text, color, t: 1.6 }); }

// ---------- Sound ----------
const tone = RDG.sound({ on: () => S.sound, vol: .05 });
const SFX = {
  step() { tone(180, .03, 'triangle', 0, .02); },
  bell() { tone(1568, .25, 'sine', 0, .05); tone(1976, .35, 'sine', .12, .04); },
  flash() { tone(2400, .05, 'square', 0, .03, 1200); tone(900, .2, 'triangle', .05, .04, 300); },
  ching() { tone(1319, .08, 'square', 0, .05); tone(1760, .12, 'square', .08, .05); tone(2637, .25, 'square', .18, .04); },
  coin() { tone(988, .06, 'square'); tone(1319, .1, 'square', .06); },
  no() { tone(330, .12, 'triangle', 0, .07, 220); tone(220, .2, 'triangle', .12, .07, 160); },
  open() { [392, 523, 659, 784].forEach((f, i) => tone(f, .1, 'square', i * .08, .05)); },
  rip() { for (let i = 0; i < 5; i++) tone(500 + Math.random() * 900, .03, 'sawtooth', i * .04, .025); },
  wow() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .14, 'square', i * .11, .05)); },
  door() { tone(1175, .1, 'sine', 0, .05); tone(880, .2, 'sine', .1, .05); },
  car() { tone(90, .4, 'sawtooth', 0, .03, 140); },
};

// ---------- Input ----------
const keys = {};
const stick = RDG.stick('#pad', '#knob');
const DIRK = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
let mode = 'title', hintUntil = 0;
// on a phone, a card that focused the price box would pop the keyboard up
const coarse = () => matchMedia('(pointer:coarse)').matches;
const playing = () => mode === 'play' && $('#cover').hidden;
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!$('#cover').hidden) { if (k === 'escape') { e.preventDefault(); escCard(); } return; }
  if (mode !== 'play') return;
  if (DIRK[k]) { keys[k] = true; e.preventDefault(); P.route = null; P.goal = null; }
  if (e.repeat) return;
  if (k === ' ' || k === 'enter') { e.preventDefault(); act(); }
  else if (k === 'h' || k === '?') toggleHelp();
  else if (k === 'escape' && !$('#help').hidden) toggleHelp(false);
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
$('#actBtn').addEventListener('pointerdown', e => { e.preventDefault(); if (playing()) act(); });
// a tap on a thing walks there and uses it; a tap on the floor walks there
function tileAt(e) {
  const r = cv.getBoundingClientRect();
  return { x: camX + (e.clientX - r.left) / r.width * VW, y: (e.clientY - r.top) / r.height * H };
}
cv.addEventListener('pointerdown', e => {
  if (!playing()) return;
  const at = tileAt(e);
  const o = objs().find(o => at.x >= o.x - .15 && at.x < o.x + o.w + .15 && at.y >= o.y - .3 && at.y < o.y + o.h + .15);
  if (o) { if (reach(o) < .8) { P.route = null; P.goal = null; use(o); } else walkTo(o.stand, o); }
  else if (!solidAt(at.x, at.y + .3)) walkTo({ x: at.x, y: at.y + .3 }, null);
});
function walkTo(to, goal) {
  const r = path(P, to);
  if (!r) return;
  P.route = r; P.goal = goal; P.stuck = 0;
}
RDG.noZoom(playing, ['#pad', '#actBtn', '#cv']);
RDG.pad({ a: ' ', b: 'Escape', select: 'h', start: 'Enter', stick });
function inputDir() {
  let x = 0, y = 0;
  for (const k in DIRK) if (keys[k]) { x += DIRK[k][0]; y += DIRK[k][1]; }
  if (stick.on) { x += stick.x; y += stick.y; P.route = null; P.goal = null; }
  const l = Math.hypot(x, y);
  return l > .15 ? { x: x / Math.max(1, l), y: y / Math.max(1, l) } : null;
}

// ---------- Walking ----------
function stepKeeper(dt) {
  let d = inputDir();
  if (!d && P.route) {
    const n = P.route[0], l = dist(P, n);
    if (l < .12) {
      P.route.shift();
      if (!P.route.length) { const g = P.goal; P.route = null; P.goal = null; if (g && reach(g) < .9) use(g); }
    } else d = { x: (n.x - P.x) / l, y: (n.y - P.y) / l };
  }
  P.moving = !!d;
  if (!d) return;
  const bx = P.x, by = P.y, sp = TUNE.walk * dt;
  moveBy(P, d.x * sp, d.y * sp);
  if (Math.abs(d.x) > .3) P.face = d.x > 0 ? 1 : -1;
  P.walkT += dt;
  if (P.route) { if (dist(P, { x: bx, y: by }) < sp * .2) { P.stuck += dt; if (P.stuck > .5) { P.route = null; P.goal = null; } } else P.stuck = 0; }
}

// ---------- Using things ----------
function actionNow() { const o = inReach(); return o ? o.act : 'use'; }
function act() { const o = inReach(); if (o) use(o); }
function use(o) {
  if (scene === 'yard') {
    if (o.slot != null) return lookCard(o.slot);
    if (o.id === 'car') return carCard();
    if (o.id === 'seller') { say(t('sellerLines')); return; }
    return;
  }
  if (o.id === 'desk') return deskCard();
  if (o.spot != null) return spotCard(o.spot);
  if (o.id === 'reg') return regCard();
  if (o.id === 'board') return boardCard();
  if (o.id === 'door') return doorCard();
}

// ---------- Cards ----------
// A card covers the room and the day stops while it's up, so nobody waits at
// the register while you're pricing something.
let escAct = 'close';
function openCard(html, focusSel, esc = 'close') {
  $('#card').innerHTML = html; $('#cover').hidden = false; stick.letGo();
  for (const k in keys) keys[k] = false;
  P.route = null; P.goal = null; escAct = esc;
  const f = $('#card').querySelector(focusSel || '.btn.go:not(:disabled)') || $('#card').querySelector('button:not(:disabled)'); if (f) f.focus();
}
function closeCard() { $('#cover').hidden = true; }
function escCard() { const b = $('#card').querySelector(`[data-act="${escAct}"]`); if (b) b.click(); else if (escAct === 'close') closeCard(); }
const btn = (act, label, go = false, extra = '') => `<button class="btn${go ? ' go' : ''}" type="button" data-act="${act}" ${extra}>${label}</button>`;
const h2 = s => `<h2 id="cardTitle">${s}</h2>`;
let cardFind = null, cardFrom = null, cardSpot = null;
$('#card').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  const a = b.dataset.act, f = cardFind;
  if (a === 'close') closeCard();
  else if (a === 'play') startPlay();
  else if (a === 'over') openCard(`${h2(t('startOver'))}<p>${t('startOverAsk')}</p><div class="row">${btn('title', t('cancel'))}${btn('reset', t('startOver'), true)}</div>`, null, 'title');
  else if (a === 'title') titleCard();
  else if (a === 'reset') { const snd = S.sound; for (const k in S) delete S[k]; Object.assign(S, fresh(), { sound: snd, seenHelp: true }); save(); enterShop(); startPlay(); }
  // the door
  else if (a === 'yard') goYard();
  else if (a === 'openShop') openShop();
  else if (a === 'closeUp') { closeCard(); S.clock = TUNE.dayLen; }
  // the yard sale
  else if (a === 'buy') buy(+b.dataset.slot);
  else if (a === 'askLess') askLess(+b.dataset.slot);
  else if (a === 'drive') backToShop();
  // the desk and the floor
  else if (a === 'find') findCard(byUid(+b.dataset.uid), cardFrom, cardSpot);
  else if (a === 'desk') deskCard();
  else if (a === 'spotList') spotCard(cardSpot);
  else if (a === 'snap') snap(f);
  else if (a === 'openBox') openBox(f);
  else if (a === 'quick') quickSell(f);
  else if (a === 'putOut') putOut(f, cardSpot != null ? cardSpot : S.spots.indexOf(null));
  else if (a === 'takeBack') { S.spots[spotOf(f)] = null; save(); findCard(f, 'desk'); }
  else if (a === 'less' || a === 'more') { const inp = $('#tagIn'); setTag(f, (+inp.value || 0) + (a === 'more' ? 5 : -5)); inp.value = f.tag || ''; refreshFindBtns(f); }
  // the register
  else if (a === 'ring') sell(regCust, regCust.price);
  else if (a === 'offer') sell(regCust, regCust.offer);
  else if (a === 'counter') counter(regCust);
  else if (a === 'noSale') noSale(regCust);
  // the end of the day
  else if (a === 'rent') rentCard();
  else if (a === 'nextDay') nextDay();
});
$('#card').addEventListener('input', e => {
  if (e.target.id === 'tagIn' && cardFind) { setTag(cardFind, Math.floor(+e.target.value || 0)); refreshFindBtns(cardFind); }
});
// a find out on a table always has a tag, or it would go for nothing
function setTag(f, n) { f.tag = clamp(Math.round(n), spotOf(f) >= 0 ? 1 : 0, 99999); save(); }

function titleCard() {
  mode = 'title';
  openCard(`${h2(t('title'))}<p>${t('intro')}</p><div class="row">${S.started ? btn('over', t('startOver')) : ''}${btn('play', t('play'), true)}</div>`, null, 'none');
}

// ----- the door -----
function doorCard() {
  if (S.phase === 'open') {
    openCard(`${h2(t('closeTitle'))}<p>${t('closeText', { clock: clockText() })}</p><div class="row">${btn('close', t('keepOpen'))}${btn('closeUp', t('closeUp'), true)}</div>`);
    return;
  }
  const any = S.spots.some(u => u != null);
  openCard(`${h2(t('doorTitle'))}<p>${t('doorText', { n: S.day })}</p>${S.yardDone ? `<p class="soft">${t('beenYard')}</p>` : ''}${any ? '' : `<p class="soft">${t('nothingOut')}</p>`}
    <div class="row">${btn('close', t('cancel'))}${btn('openShop', t('openShop'), S.yardDone && any)}${btn('yard', t('goYard'), !S.yardDone, S.yardDone ? 'disabled' : '')}</div>`);
}

// ----- the yard sale -----
function goYard() {
  closeCard(); SFX.car();
  S.yardDone = true; save();
  // five finds, never two of a kind, and often a sealed box
  const kinds = Object.keys(KINDS).filter(k => k !== 'box').sort(() => Math.random() - .5).slice(0, 5);
  if (Math.random() < .6) kinds.splice(Math.floor(Math.random() * 6), 0, 'box');
  const slots = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - .5);
  yard.items = Array(6).fill(null);
  kinds.forEach((k, i) => { yard.items[slots[i]] = makeFind(k); });
  yard.bought = 0;
  yard.seller = { x: 16, y: 5.4, look: LOOKS[Math.floor(Math.random() * LOOKS.length)], t: 0 };
  scene = 'yard'; P.x = 3.5; P.y = 9.6; P.route = null; custs = []; floats = [];
  say(t('yardHello'));
  showBar();
}
function lookCard(slot) {
  const f = yard.items[slot]; if (!f) return;
  const note = f.kind === 'box' ? `<p class="note">${t('sealedNote')}</p>` : '';
  const poor = S.pocket < f.ask;
  openCard(`${h2(Name(f))}<div class="look">${picHtml(f)}<div class="facts"><dl><dt>${t('ask')}</dt><dd>$${f.ask}</dd></dl><p class="soft">${t('yourPocket', { n: S.pocket })}</p></div></div>${note}
    <p id="sellerSays" class="soft" role="status">${f.reply || ''}</p>
    <div class="row">${btn('close', t('leave'))}${btn('askLess', t('askLess'), false, `data-slot="${slot}" ${f.asked ? 'disabled' : ''}`)}${btn('buy', t('buy', { n: f.ask }), true, `data-slot="${slot}" ${poor ? 'disabled' : ''}`)}</div>`);
}
function askLess(slot) {
  const f = yard.items[slot]; f.asked = true;
  if (Math.random() < TUNE.sellerYes) { f.ask = Math.max(1, Math.round(f.ask * TUNE.sellerCut)); f.reply = t('sellerYes', { n: f.ask }); SFX.coin(); }
  else { f.reply = t('sellerNo'); SFX.no(); }
  lookCard(slot);
}
function buy(slot) {
  const f = yard.items[slot];
  if (S.pocket < f.ask) { say(t('tooPoor')); return; }
  S.pocket -= f.ask; f.cost = f.ask; delete f.ask; delete f.asked; delete f.reply;
  S.stock.push(f); yard.items[slot] = null; yard.bought++; save();
  closeCard(); SFX.coin(); say(t('bought', { item: nameOf(f), n: f.cost }));
  float(YARD_SLOTS[slot].x, 4.4, `-$${f.cost}`, '#c84a3a');
  showBar();
  if (yard.items.every(x => !x)) say(t('yardEmpty'));
}
function carCard() {
  const n = yard.bought;
  openCard(`${h2(t('carTitle'))}<p>${n ? t('carText', { n }) : t('carNone')}</p><div class="row">${btn('close', t('stay'))}${btn('drive', t('drive'), true)}</div>`);
}
function backToShop() { closeCard(); SFX.car(); enterShop(); P.x = 10; P.y = 10.4; showBar(); }
function enterShop() { scene = 'shop'; yard.items = []; custs = []; floats = []; P.route = null; }

// ----- the desk -----
function rowHtml(f) {
  const w = known(f) ? `$${f.value}` : t('worthUnknown');
  return `<button class="it" type="button" data-act="find" data-uid="${f.uid}"><img src="${picSrc(rowsOf(f), colOf(f))}" alt=""><span>${Name(f)}<small>${t('paid')} $${f.cost} · ${t('worth')} ${w} · ${f.tag ? `${t('tag')} $${f.tag}` : t('noTag')}</small></span></button>`;
}
function deskCard() {
  cardFrom = 'desk'; cardSpot = null; cardFind = null;
  const list = inBack();
  openCard(`${h2(t('deskTitle'))}<p>${list.length ? t('deskText') : t('deskEmpty')}</p><div class="list">${list.map(rowHtml).join('')}</div><div class="row">${btn('close', t('done'), true)}</div>`, '.it');
}
function spotCard(i) {
  const o = SHOP.find(o => o.spot === i), f = byUid(S.spots[i]);
  if (f) return findCard(f, 'spot', i);
  cardFrom = 'spot'; cardSpot = i; cardFind = null;
  const list = inBack();
  openCard(`${h2(t(`spotTitle.${o.kind}`))}<p>${list.length ? t('spotEmpty') : t('spotNone')}</p><div class="list">${list.map(rowHtml).join('')}</div><div class="row">${btn('close', t('done'), !list.length)}</div>`, '.it');
}
// one find, close up: what you paid, what it's worth if you've snapped it,
// its price tag, and what you can do with it from here
function findCard(f, from, spot = null) {
  cardFind = f; cardFrom = from; cardSpot = spot;
  const onSpot = spotOf(f) >= 0, atDesk = from === 'desk';
  const worth = known(f) ? `$${f.value}` : t('worthUnknown');
  let note = '';
  if (f.kind === 'box' && !f.opened) note = t('sealedNote');
  else if (known(f) && f.kind !== 'box') note = STR.notes[f.kind][f.good ? 0 : 1];   // t() would pick one at random
  else if (!known(f)) note = t('unknownNote');
  const acts = [];
  if (atDesk && !known(f)) acts.push(f.kind === 'box' ? btn('openBox', t('openBox')) : btn('snap', t('snap')));
  // the dealer's offer would give away what it's worth, so it shows once you know
  if (atDesk && known(f)) acts.push(btn('quick', t('quick', { n: dealerPays(f) })));
  if (onSpot) acts.push(btn('takeBack', t('takeBack')));
  else acts.push(btn('putOut', from === 'spot' ? t('putHere') : t('putOut'), true, 'id="putBtn"'));
  openCard(`${h2(Name(f))}<div class="look">${picHtml(f)}<div class="facts"><dl><dt>${t('paid')}</dt><dd>$${f.cost}</dd><dt>${t('worth')}</dt><dd>${worth}</dd></dl></div></div>
    ${note ? `<p class="note">${note}</p>` : ''}${atDesk && known(f) ? `<p class="soft">${t('quickNote')}</p>` : ''}
    <div class="tag"><label for="tagIn">${t('tagLabel')}</label>${btn('less', t('less'))}<input id="tagIn" type="number" inputmode="numeric" min="0" step="1" value="${f.tag || ''}">${btn('more', t('more'))}</div>
    <p class="soft" id="putWhy" role="status"></p>
    <div class="row">${btn(from === 'spot' && !onSpot ? 'spotList' : 'desk', t('back'))}${acts.join('')}</div>`, coarse() ? null : '#tagIn', from === 'spot' && !onSpot ? 'spotList' : 'desk');
  if (from === 'spot' && onSpot) { const b = $('#card').querySelector('[data-act="desk"]'); b.dataset.act = 'close'; b.textContent = t('done'); escAct = 'close'; }
  refreshFindBtns(f);
}
function refreshFindBtns(f) {
  const b = $('#putBtn'), why = $('#putWhy'); if (!b) return;
  const full = cardSpot == null && S.spots.indexOf(null) < 0;
  b.disabled = !f.tag || full;
  why.textContent = !f.tag ? t('needTag') : full ? t('noRoom') : '';
}
const dealerPays = f => Math.max(1, Math.round(worthTo(f) * TUNE.dealer));
function snap(f) { f.seen = true; save(); SFX.flash(); say(t('snapped', { n: f.value })); findCard(f, 'desk'); }
function openBox(f) {
  f.opened = true; f.seen = true; save(); SFX.rip();
  if (f.value >= 400) setTimeout(SFX.wow, 250);
  say(t('boxOpened', { item: t(`boxIn.${f.inside}`), n: f.value }));
  findCard(f, 'desk');
}
function putOut(f, i) {
  if (!f.tag || i < 0) return;
  S.spots[i] = f.uid; save(); SFX.coin(); closeCard();
}
function quickSell(f) {
  S.stock = S.stock.filter(x => x !== f);
  const at = SHOP[0];
  sale(f, dealerPays(f), at.x + 1.5, at.y);
}

// ----- the rent board -----
function boardCard() {
  openCard(`${h2(t('boardTitle'))}<p>${t('boardText', { rent: S.rent, day: S.rentDay, pool: S.pool })}</p>${S.owed ? `<p>${t('boardOwed', { n: S.owed })}</p>` : ''}<p class="note">${t('boardSplit')}</p><div class="row">${btn('close', t('done'), true)}</div>`);
}

// ---------- The day ----------
function clockText(c = S.clock) {
  const mins = 9 * 60 + Math.floor(clamp(c / TUNE.dayLen, 0, 1) * 8 * 60 / 30) * 30, h = Math.floor(mins / 60), m = mins % 60;
  return `${(h - 1) % 12 + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
}
let daySales = [];
function openShop() {
  closeCard(); S.phase = 'open'; S.clock = 0; spawnT = TUNE.firstCust; save();
  SFX.door(); say(t('openMsg')); showBar();
}
function stepDay(dt) {
  if (S.phase !== 'open') return;
  S.clock += dt;
  if (S.clock < TUNE.dayLen) {
    spawnT -= dt;
    if (spawnT <= 0) { spawnT = randIn(TUNE.custEvery); spawnCust(); }
  } else if (!stepDay.closing) { stepDay.closing = true; say(t('closing')); }
  if (S.clock >= TUNE.dayLen && !custs.length) { stepDay.closing = false; endDay(); }
  if (Math.floor(S.clock) % 5 === 0 && Math.floor(S.clock) !== stepDay.saved) { stepDay.saved = Math.floor(S.clock); save(); }
}
function endDay() {
  S.phase = 'closed'; save(); SFX.bell();
  const list = daySales.length ? `<p>${t('daySold')}</p><ul>${daySales.map(s => `<li>${Name(s.f)}: $${s.n}</li>`).join('')}</ul>` : `<p>${t('dayNone')}</p>`;
  const rentToday = S.day >= S.rentDay;
  openCard(`${h2(t('dayTitle', { n: S.day }))}${list}<p class="soft">${t('dayTotals', { pocket: S.pocket, pool: S.pool })}</p><div class="row">${rentToday ? btn('rent', t('rentTitle'), true) : btn('nextDay', t('nextDay'), true)}</div>`, null, 'none');
  daySales = [];
}
function rentCard() {
  const due = S.rent + S.owed;
  const fromPool = Math.min(S.pool, due), fromPocket = Math.min(S.pocket, due - fromPool), short = due - fromPool - fromPocket;
  S.pool -= fromPool; S.pocket -= fromPocket;
  S.owed = short ? short + TUNE.late : 0;
  if (!short) S.paidRents++;
  S.rentDay += TUNE.rentEvery; S.rent += TUNE.rentUp; save();
  if (short) SFX.no(); else SFX.ching();
  const paid = t('rentPaid', { rent: fromPool + fromPocket, fromPool, more: fromPocket ? t('rentMore', { n: fromPocket }) : '' });
  const won = !S.won && S.paidRents >= TUNE.winAfter;
  if (won) { S.won = true; save(); }
  openCard(`${h2(t('rentTitle'))}<p>${paid}</p>${short ? `<p>${t('rentShort', { n: short, fee: TUNE.late })}</p>` : ''}<p class="soft">${t('rentNext', { rent: S.rent, day: S.rentDay })}</p>
    ${won ? `<p class="note"><b>${t('wonTitle')}</b> ${t('wonText')}</p>` : ''}<div class="row">${btn('nextDay', t('nextDay'), true)}</div>`, null, 'none');
  if (won) SFX.wow();
  showBar();
}
function nextDay() {
  closeCard(); S.day++; S.phase = 'morning'; S.clock = 0; S.yardDone = false; save();
  P.x = 10; P.y = 9.5; say(t('morning', { n: S.day })); showBar();
}

// ---------- Customers ----------
// Each one walks in, looks at a find, and decides: the tag is fair, so they
// bring it to the register (and sometimes haggle anyway); the tag is a bit
// high, so they bring it and haggle; or it's far too high and they leave.
// They know what things are worth, give or take: a dud with a big tag sits.
function spawnCust() {
  const look = LOOKS[Math.floor(Math.random() * LOOKS.length)];
  const c = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, look, mode: 'in', t: 0, walkT: 0, face: 1, route: null, find: null, say: null };
  const free = S.spots.map((u, i) => u != null && !custs.some(o => o.spot === i) ? i : -1).filter(i => i >= 0);
  if (free.length) { c.spot = free[Math.floor(Math.random() * free.length)]; c.route = path(c, SHOP.find(o => o.spot === c.spot).stand, true); }
  else { c.spot = null; c.route = path(c, { x: 9 + Math.random() * 3, y: 7.6 }, true); }
  if (!c.route) return;
  custs.push(c); SFX.door();
}
function bubble(c, text, s = 1.8) { c.say = { text, t: s }; }
function walk(c, dt) {
  if (!c.route || !c.route.length) return true;
  const n = c.route[0], l = dist(c, n), sp = TUNE.cust * dt;
  if (l <= sp) { c.x = n.x; c.y = n.y; c.route.shift(); return !c.route.length; }
  c.x += (n.x - c.x) / l * sp; c.y += (n.y - c.y) / l * sp; c.walkT += dt;
  if (Math.abs(n.x - c.x) > .05) c.face = n.x > c.x ? 1 : -1;
  return false;
}
function leaveShop(c) { c.mode = 'out'; c.route = path(c, SHOP_DOOR, true) || [SHOP_DOOR]; }
function putBack(c) {
  // the find goes back where it was, if that spot's still free
  if (!c.find) return;
  if (S.spots[c.spot] == null) S.spots[c.spot] = c.find.uid;
  else { const i = S.spots.indexOf(null); if (i >= 0) S.spots[i] = c.find.uid; }
  c.find = null; save();
}
function stepCusts(dt) {
  for (const c of custs) {
    if (c.say) { c.say.t -= dt; if (c.say.t <= 0) c.say = null; }
    if (c.mode === 'in') {
      if (walk(c, dt)) {
        if (c.spot == null || S.spots[c.spot] == null) { bubble(c, t('nothingHere')); leaveShop(c); continue; }
        c.mode = 'browse'; c.t = randIn(TUNE.browse); bubble(c, t('browse'), 1.2);
      }
    } else if (c.mode === 'browse') {
      c.t -= dt;
      if (c.t > 0) continue;
      const f = byUid(S.spots[c.spot]);
      if (!f) { leaveShop(c); continue; }
      const would = worthTo(f) * randIn(TUNE.pay);
      if (f.tag <= would) {
        c.max = f.tag; c.price = f.tag;
        c.offer = Math.random() < TUNE.haggleAnyway && f.tag >= 20 ? round5(f.tag * randIn(TUNE.offer)) : null;
      } else if (f.tag <= would * TUNE.stretch) {
        c.max = Math.max(1, Math.round(would)); c.price = f.tag; c.offer = Math.max(1, round5(would * randIn(TUNE.offer)));
        if (c.offer >= f.tag) c.offer = null;
      } else { bubble(c, t('tooPricey')); leaveShop(c); continue; }
      c.find = f; S.spots[c.spot] = null; save();
      c.mode = 'toReg'; c.joined = ++lineNo;
      c.route = path(c, linePlace(inLine().indexOf(c)), true);
    } else if (c.mode === 'toReg') {
      if (walk(c, dt)) { c.mode = 'wait'; c.t = TUNE.wait; bubble(c, t('wait')); SFX.bell(); }
    } else if (c.mode === 'wait') {
      // the line moves up when the one in front is done
      const at = linePlace(inLine().indexOf(c));
      if ((!c.route || !c.route.length) && dist(c, at) > .1) c.route = [at];
      walk(c, dt);
      c.t -= dt;
      if (c.t <= 0) { bubble(c, t('forget')); putBack(c); leaveShop(c); }
    } else if (c.mode === 'out') {
      if (walk(c, dt)) c.gone = true;
    }
  }
  custs = custs.filter(c => !c.gone);
}
// the line at the register: first come, first served, the next one behind
let lineNo = 0;
const inLine = () => custs.filter(c => c.mode === 'toReg' || c.mode === 'wait').sort((a, b) => a.joined - b.joined);
const linePlace = i => i ? { x: REG_FRONT.x - 1.3 * i, y: REG_FRONT.y + .2 } : REG_FRONT;
const firstWaiting = () => inLine().find(c => c.mode === 'wait');

// ----- the register -----
let regCust = null;
function regCard() {
  regCust = firstWaiting();
  const c = regCust;
  if (!c) { openCard(`${h2(t('regTitle'))}<p>${t('regEmpty')}</p><div class="row">${btn('close', t('done'), true)}</div>`); return; }
  const f = c.find, item = nameOf(f);
  if (c.offer == null) {
    openCard(`${h2(t('regTitle'))}<div class="look">${picHtml(f)}<div class="facts"><p>${t('regPays', { item, tag: f.tag })}</p></div></div><div class="row">${btn('noSale', t('noSale'))}${btn('ring', t('ringUp'), true)}</div>`, null, 'noSale');
  } else {
    const mid = round5((c.offer + f.tag) / 2);
    c.mid = mid > c.offer && mid < f.tag ? mid : null;
    openCard(`${h2(t('regTitle'))}<div class="look">${picHtml(f)}<div class="facts"><p>${t('regOffer', { item, tag: f.tag, offer: c.offer })}</p><dl><dt>${t('paid')}</dt><dd>$${f.cost}</dd><dt>${t('worth')}</dt><dd>${known(f) ? '$' + f.value : t('worthUnknown')}</dd></dl></div></div>
      <div class="row">${btn('noSale', t('noSale'))}${c.mid && !c.countered ? btn('counter', t('counter', { n: c.mid })) : ''}${btn('offer', t('sellFor', { n: c.offer }), true)}</div>`, null, 'noSale');
  }
}
function counter(c) {
  c.countered = true;
  if (c.mid <= c.max) { bubble(c, t('deal', { n: c.mid })); sell(c, c.mid); }
  else { SFX.no(); bubble(c, t('walkOff')); closeCard(); putBack(c); leaveShop(c); }
}
function noSale(c) { closeCard(); bubble(c, t('walkOff')); putBack(c); leaveShop(c); }
function sell(c, n) {
  const f = c.find; c.find = null;
  S.stock = S.stock.filter(x => x !== f);
  bubble(c, t('thanks')); leaveShop(c);
  const r = SHOP.find(o => o.id === 'reg');
  sale(f, n, r.x + 2.5, r.y);
}
// Every sale is split here, the card's rule: what you paid for the find goes
// into the Rent Pool, only the profit goes in your pocket. Sold for less than
// it cost, all of it goes to the pool, and the card says what was lost.
function sale(f, n, fx, fy) {
  const toPool = Math.min(f.cost, n), toPocket = n - toPool;
  S.pool += toPool; S.pocket += toPocket; save();
  daySales.push({ f, n });
  SFX.ching();
  if (toPocket) float(fx, fy - .4, `+$${toPocket}`, '#2f7a4a');
  if (toPool) float(fx, fy + .2, `+$${toPool}`, '#3b6ea8');
  const share = n ? Math.round(toPool / n * 100) : 0;
  const bar = n ? `<div class="split" aria-hidden="true">${toPool ? `<b class="p" style="flex:${Math.max(share, 18)}">${t('poolLbl', { n: toPool })}</b>` : ''}${toPocket ? `<b class="k" style="flex:${Math.max(100 - share, 18)}">${t('pocketLbl', { n: toPocket })}</b>` : ''}</div>` : '';
  const words = n < f.cost ? t('lossText', { loss: f.cost - n, n }) : t('splitText', { cost: toPool, profit: toPocket });
  openCard(`${h2(t('soldTitle'))}<p>${t('soldText', { item: nameOf(f), n })}</p>${bar}<p>${words}</p><div class="row">${btn('close', t('done'), true)}</div>`);
  showBar();
}

// ---------- The bar and help ----------
function showBar() {
  const on = mode === 'play';
  ['#dayPill', '#cashPill', '#poolPill', '#helpBtn'].forEach(id => $(id).hidden = !on);
  if (!on) return;
  $('#dayPill').textContent = S.phase === 'open' ? t('dayClock', { n: S.day, clock: clockText() }) : t('day', { n: S.day });
  $('#cashPill').innerHTML = `<span class="long">${t('pocket', { n: S.pocket })}</span><span class="short">${t('pocketShort', { n: S.pocket })}</span>`;
  $('#poolPill').innerHTML = `<span class="long">${t('pool', { n: S.pool, rent: S.rent + S.owed })}</span><span class="short">${t('poolShort', { n: S.pool, rent: S.rent + S.owed })}</span>`;
}
function nextThing() {
  if (scene === 'yard') return yard.items.some(Boolean) ? YARD.find(o => o.slot === yard.items.findIndex(Boolean)) : YARD.find(o => o.id === 'car');
  if (firstWaiting()) return SHOP.find(o => o.id === 'reg');
  if (S.phase === 'open') return null;
  const back = inBack();
  if (!S.yardDone && !back.length) return SHOP.find(o => o.id === 'door');
  if (back.some(f => !known(f) || !f.tag)) return SHOP[0];
  if (back.length && S.spots.includes(null)) return SHOP.find(o => o.spot === S.spots.indexOf(null));
  return SHOP.find(o => o.id === 'door');
}
function goalText() {
  if (scene === 'yard') return t('goalYard');
  if (firstWaiting()) return t('goalRegister');
  if (S.phase === 'open') return t('goalOpen');
  const back = inBack();
  if (!S.yardDone && !back.length) return t('goalYardGo');
  if (back.some(f => !known(f) || !f.tag)) return t('goalDesk');
  if (back.length && S.spots.includes(null)) return t('goalTable');
  return t('goalOpenShop');
}
function toggleHelp(open = $('#help').hidden) {
  $('#help').hidden = !open; $('#helpBtn').setAttribute('aria-expanded', open);
  if (open) { $('#goalNow').textContent = goalText(); $('#helpList').innerHTML = STR.help.map(l => `<li>${l}</li>`).join(''); }
  else hintUntil = performance.now() + TUNE.hint;
}
$('#helpBtn').addEventListener('click', () => toggleHelp());
$('#helpClose').addEventListener('click', () => toggleHelp(false));
$('#soundBtn').addEventListener('click', () => { S.sound = !S.sound; save(); $('#soundBtn').textContent = S.sound ? '🔔' : '🔕'; });

// ---------- Drawing ----------
const FLOOR = { base: '#b07a48', dark: '#8a5a30', hi: '#c99460' };
function floorTile(v) {
  return RDG.tile('floor' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, FLOOR.base);
    for (const y of [0, 8]) { fill(0, y, T, 1, FLOOR.dark); fill(0, y + 1, T, 1, FLOOR.hi); }
    const j = (v * 5) % 16; fill(j, 1, 1, 7, FLOOR.dark); fill((j + 8) % 16, 9, 1, 7, FLOOR.dark);
    for (let i = 0; i < 4; i++) set(Math.floor(r() * T), 2 + Math.floor(r() * 12), FLOOR.dark);
  });
}
function grassTile(v) {
  return RDG.tile('grass' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, '#8fc25a');
    for (let i = 0; i < 6; i++) { const x = Math.floor(r() * 15), y = Math.floor(r() * 14) + 1; set(x, y, '#6fa244'); set(x + 1, y - 1, '#6fa244'); }
    for (let i = 0; i < 3; i++) set(Math.floor(r() * T), Math.floor(r() * T), '#b8e07a');
  });
}
function concTile(v) {
  return RDG.tile('conc' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, '#b8b4aa'); fill(0, 15, T, 1, '#9a968c'); fill(15, 0, 1, T, '#9a968c');
    for (let i = 0; i < 4; i++) set(Math.floor(r() * T), Math.floor(r() * T), '#a8a49a');
  });
}
function drawItemAt(f, x, y, now) {
  const img = itemImg(f);
  put(img, x - img.width / 2, y - img.height / 2);
  if (glows(f)) {
    cx.globalAlpha = .3 + .25 * Math.sin(now / 380);
    put(RDG.sprite(GLOW, C, { line: GLOW_LINE }), x - img.width / 2, y - img.height / 2);
    cx.globalAlpha = 1;
  }
}
// price tags are drawn last, over anyone standing in front of a table
let tags = [];
function tagAt(n, x, y) { tags.push([n, x, y]); }
function drawTag(n, x, y) {
  const s = '$' + n, w = RDG.textWidth(s) + 4;
  px(x - w / 2, y, w, 9, '#fff6e4'); px(x - w / 2, y + 8, w, 1, '#a88a60');
  text(s, x - w / 2 + 2, y + 2, '#2a1a10');
}
function drawShop(now) {
  for (let j = 2; j < 11; j++) for (let i = 1; i < 19; i++) put(floorTile((i * 7 + j * 3) % 4), i * T, j * T);
  // the back wall: wallpaper over dark wood, shelves of odds and ends
  px(0, 0, W * T, 22, '#e8d8b0');
  for (let i = 0; i < W * T; i += 8) px(i, 0, 2, 22, '#dcc89c');
  px(0, 22, W * T, 10, '#6b4426'); px(0, 22, W * T, 1, '#8a5a30'); px(0, 31, W * T, 1, '#3a2616');
  text('FLIP SHOP', 22, 6, '#2f7a4a', 1);
  px(20, 13, 38, 1, '#2f7a4a');
  // shelves at the right with jars and junk
  for (const sy of [8, 18]) { px(196, sy, 96, 2, '#6b4426'); }
  const JUNK = ['#5aa6e4', '#d8a832', '#c84a3a', '#7fbf68', '#e8e0d0', '#8a4ab0', '#e8a030', '#5e626c'];
  for (let i = 0; i < 12; i++) { const c = JUNK[i % JUNK.length], h = 3 + (i * 5) % 4; px(200 + i * 8, 8 - h, 5, h, c); px(203 + i * 7.5, 18 - 5, 4, 5, JUNK[(i + 3) % 8]); }
  // the rent board: cork with a paper notice
  px(8 * T, 2, 32, 26, '#5e3a1c'); px(8 * T + 2, 4, 28, 22, '#c49a5e');
  px(8 * T + 4, 6, 24, 18, '#fff6e4');
  textC('RENT', 8 * T + 16, 8, '#c84a3a'); textC('$' + (S.rent + S.owed), 8 * T + 16, 16, '#2a1a10');
  // side walls and the front wall with its windows and the door
  px(0, 32, T, H * T, '#4e2f1a'); px(W * T - T, 32, T, H * T, '#4e2f1a');
  px(0, 11 * T, W * T, T, '#4e2f1a');
  for (const wx of [3, 13]) {
    px(wx * T, 11 * T + 3, 4 * T, 10, '#a8d8f0'); px(wx * T + 6, 11 * T + 4, 10, 2, '#e8f8ff');
    px(wx * T, 11 * T + 3, 4 * T, 1, '#2a1a10');
  }
  const open = S.phase === 'open';
  px(4 * T + 6, 11 * T + 4, 32, 8, open ? '#2f7a4a' : '#7a2a22');
  textC(open ? 'OPEN' : 'CLOSED', 4 * T + 22, 11 * T + 5, '#fff');
  px(9 * T, 11 * T, 2 * T, T, '#3a2616'); px(9 * T + 2, 11 * T + 1, 2 * T - 4, T - 1, open ? '#c8ecff' : '#86a8c0');
  px(9 * T + 15, 11 * T + 1, 2, T - 1, '#3a2616');
  px(9 * T + 2, 10 * T + 12, 2 * T - 4, 4, '#7a2a22');
  // the desk and the bolted-down camera
  px(1 * T, 2 * T + 2, 3 * T, 2 * T - 4, '#6b4426'); px(1 * T, 2 * T + 2, 3 * T, 3, '#8a5a30'); px(1 * T, 4 * T - 4, 3 * T, 2, '#3a2616');
  px(1 * T + 6, 2 * T + 6, 14, 10, '#2a2a2a'); px(1 * T + 10, 2 * T + 9, 6, 5, '#5aa6e4'); px(1 * T + 11, 2 * T + 10, 2, 2, '#d7f1ff');
  px(1 * T + 12, 2 * T + 16, 2, 6, '#5e626c'); px(1 * T + 8, 2 * T + 21, 10, 2, '#5e626c');
  px(2 * T + 12, 2 * T + 8, 14, 10, '#f3ead8'); px(2 * T + 14, 2 * T + 10, 10, 1, '#a88a60'); px(2 * T + 14, 2 * T + 13, 8, 1, '#a88a60');
  const waiting = inBack().length;
  if (waiting) { px(3 * T + 4, 2 * T + 18, 8, 6, '#c49a5e'); px(3 * T + 4, 2 * T + 18, 8, 1, '#8a5a30'); }
  // the display spots
  for (const o of SHOP) {
    if (o.spot == null) continue;
    const x = o.x * T, y = o.y * T, w = o.w * T, h = o.h * T;
    if (o.kind === 'table') {
      px(x + 1, y + h - 2, 3, 6, '#4e2f1a'); px(x + w - 4, y + h - 2, 3, 6, '#4e2f1a');
      px(x, y, w, h, '#8a5a30'); px(x, y, w, 2, '#c99460'); px(x, y + h - 2, w, 2, '#5e3a1c');
    } else if (o.kind === 'case') {
      px(x, y - 2, w, h + 6, '#5e3a1c'); px(x + 2, y, w - 4, h, '#bfe4f4'); px(x + 4, y + 1, 10, 1, '#f0fbff');
    } else {
      px(x + 2, y - 4, w - 4, h + 4, '#c49a5e');
      for (let a = 0; a < h; a += 6) for (let b = 4; b < w - 4; b += 4) px(x + b, y + a, 1, 1, '#8a6a40');
      px(x + 2, y - 4, w - 4, 1, '#6b4426');
    }
    const f = byUid(S.spots[o.spot]);
    if (f) {
      drawItemAt(f, x + w / 2, y + h / 2 - (o.kind === 'rack' ? 4 : 2), now);
      tagAt(f.tag, x + w / 2, o.kind === 'rack' ? y + h - 6 : y + h + 3);
    }
  }
  // the register counter, with the Rent Pool jar
  const r = SHOP.find(o => o.id === 'reg'), rx = r.x * T, ry = r.y * T;
  px(rx, ry - 2, r.w * T, T + 2, '#6b4426'); px(rx, ry - 2, r.w * T, 3, '#8a5a30'); px(rx, ry + T - 2, r.w * T, 2, '#3a2616');
  px(rx + 34, ry - 6, 18, 12, '#5e626c'); px(rx + 36, ry - 4, 14, 4, '#2a2a2a'); text(String(Math.min(999, S.pocket)).slice(-3), rx + 37, ry - 4, '#7fff7f');
  px(rx + 8, ry - 7, 10, 11, '#bfe4f4'); px(rx + 8, ry - 7, 10, 1, '#5e626c');
  const fill = clamp(S.pool / Math.max(1, S.rent + S.owed), 0, 1);
  px(rx + 9, ry + 3 - Math.round(9 * fill), 8, Math.round(9 * fill), '#3b6ea8');
}
function drawYard(now) {
  for (let j = 3; j < 11; j++) for (let i = 0; i < W; i++) put(i >= 14 && i <= 17 ? concTile((i + j) % 3) : grassTile((i * 5 + j * 3) % 4), i * T, j * T);
  // the street and the sidewalk
  px(0, 10 * T + 8, W * T, 8, '#d8d4ca'); px(0, 11 * T, W * T, T, '#4a4a52');
  for (let i = 0; i < W * T; i += 24) px(i + 4, 11 * T + 7, 12, 2, '#e8d070');
  // the house: siding, a roof edge, windows and the door
  px(0, 0, W * T, 3 * T, '#e8dcc4');
  for (let y = 4; y < 3 * T; y += 5) px(0, y, W * T, 1, '#cfc2a6');
  px(0, 0, W * T, 4, '#7a3e2a');
  for (const wx of [2, 6, 12]) { px(wx * T, 14, 32, 20, '#ffffff'); px(wx * T + 2, 16, 28, 16, '#86b8d8'); px(wx * T + 15, 16, 2, 16, '#ffffff'); }
  px(9 * T, 12, 28, 36, '#7a2a22'); px(9 * T + 22, 30, 3, 3, '#d8a832');
  px(14 * T, 8, 4 * T, 40, '#cfc2a6'); for (let y = 12; y < 48; y += 6) px(14 * T + 2, y, 4 * T - 4, 1, '#b4a68c');
  // bushes along the house
  for (const bx of [0.2, 4.6, 11, 18.2]) { px(bx * T, 2 * T + 6, 22, 12, '#4f8f3a'); px(bx * T + 3, 2 * T + 7, 10, 4, '#6fae4a'); }
  // the YARD SALE sign by the sidewalk
  px(17 * T + 6, 8 * T + 8, 2, 22, '#5e3a1c'); px(16 * T + 6, 8 * T, 38, 14, '#ffd040'); text('YARD', 16 * T + 9, 8 * T + 2, '#c84a3a'); text('SALE', 16 * T + 26, 8 * T + 7, '#c84a3a');
  // the folding tables
  for (const tx of [3, 8]) {
    px(tx * T + 2, 5.6 * T, 2, 6, '#8a8a8a'); px(tx * T + 4 * T - 4, 5.6 * T, 2, 6, '#8a8a8a');
    px(tx * T, 4.6 * T, 4 * T, T, '#f3ead8'); px(tx * T, 4.6 * T, 4 * T, 2, '#ffffff'); px(tx * T, 5.6 * T - 2, 4 * T, 2, '#b8b0a0');
  }
  yard.items.forEach((f, i) => {
    if (!f) return;
    const s = YARD_SLOTS[i];
    drawItemAt(f, s.x * T, (s.y + .05) * T, now);
    tagAt(f.ask, s.x * T, 5.6 * T + 2);
  });
  // the seller's card table and cash box
  px(15 * T, 6 * T, 2 * T, T - 4, '#3a3a42'); px(15 * T + 10, 6 * T + 2, 12, 7, '#2f7a4a'); px(15 * T + 12, 6 * T + 4, 8, 1, '#d8a832');
  // your car: a little red hatchback
  const carX = 2 * T, carY = 10 * T + 2;
  px(carX + 2, carY + 22, 8, 6, '#1a1a1a'); px(carX + 36, carY + 22, 8, 6, '#1a1a1a');
  px(carX, carY + 8, 3 * T, 16, '#c8382a'); px(carX + 8, carY, 26, 10, '#c8382a');
  px(carX + 11, carY + 2, 9, 7, '#a8d8f0'); px(carX + 22, carY + 2, 9, 7, '#a8d8f0');
  px(carX, carY + 14, 3 * T, 2, '#8a2218'); px(carX + 44, carY + 10, 3, 3, '#ffd040');
}
function drawPerson(o, rows, colors, now) {
  const going = o === P ? P.moving : o.route && o.route.length;
  const step = going && Math.floor(o.walkT * 8) % 2 ? rows.b : rows.a;
  const img = spr(step, colors, o.face < 0);
  put(img, o.x * T - img.width / 2, o.y * T - img.height + 1);
}
function corners(o, now) {
  if (Math.floor(now / 250) % 2) return;
  const x = o.x * T - 2, y = o.y * T - 2, w = o.w * T + 4, h = o.h * T + 4, c = '#ffffff';
  for (const [a, b, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    px(a - (sx < 0 ? 4 : 0), b - (sy < 0 ? 1 : 0), 4, 1, c); px(a - (sx < 0 ? 1 : 0), b - (sy < 0 ? 4 : 0), 1, 4, c);
  }
}
function bubbleAt(s, x, y) {
  const w = RDG.textWidth(s) + 6;
  const bx = clamp(Math.round(x - w / 2), Math.round(camX * T) + 1, Math.round((camX + VW) * T) - w - 1), by = Math.max(1, Math.round(y - 11));
  px(bx, by, w, 10, '#ffffff'); px(bx, by + 9, w, 1, '#2a1a10'); text(s, bx + 3, by + 3, '#2a1a10');
}
function draw(now) {
  cx.clearRect(0, 0, lo.width, lo.height);
  tags = [];
  if (scene === 'shop') drawShop(now); else drawYard(now);
  // people, drawn top to bottom so nearer ones stand in front
  const people = [{ o: P, rows: KEEPER, col: C }, ...custs.map(c => ({ o: c, rows: CUST, col: c.look }))];
  if (scene === 'yard' && yard.seller) people.push({ o: yard.seller, rows: CUST, col: yard.seller.look });
  people.sort((a, b) => a.o.y - b.o.y);
  for (const p of people) {
    drawPerson(p.o, p.rows, p.col, now);
    if (p.o.find) drawItemAt(p.o.find, p.o.x * T + 7, p.o.y * T - 8, now);
  }
  // a $ over anyone waiting to pay, so the line can be seen across the room
  for (const g of tags) drawTag(...g);
  for (const c of custs) if (c.say) bubbleAt(c.say.text, c.x * T, c.y * T - 15); else if (c.mode === 'wait') bubbleAt('$', c.x * T, c.y * T - 15);
  // the next thing blinks while the ? help is open and for a few seconds after
  if (mode === 'play' && (!$('#help').hidden || now < hintUntil)) { const o = nextThing(); if (o) corners(o, now); }
  for (const f of floats) { cx.globalAlpha = clamp(f.t, 0, 1); textC(f.text, f.x * T, (f.y - (1.6 - f.t) * .8) * T, f.color, 1); cx.globalAlpha = 1; }
  // the view follows the shopkeeper when it's narrower than the room
  const want = clamp(P.x - VW / 2, 0, W - VW);
  camX = Math.abs(want - camX) > 4 ? want : camX + (want - camX) * .15;
  out.imageSmoothingEnabled = false;
  out.drawImage(lo, Math.round(camX * T), 0, VW * T, H * T, 0, 0, cv.width, cv.height);
}

// ---------- Start ----------
function startPlay() {
  closeCard(); mode = 'play'; S.started = true;
  // a reload in the middle of an open day picks the day back up
  if (S.phase === 'closed') S.phase = 'open';
  save();
  $('#ctrl').hidden = false; showBar(); resize();
  if (!S.seenHelp) { S.seenHelp = true; save(); toggleHelp(true); }
  else say(S.phase === 'open' ? t('openMsg') : t('morning', { n: S.day }));
}
function step(dt, now) {
  if (mode !== 'play') return;
  stepKeeper(dt);
  if (scene === 'shop') { stepDay(dt); stepCusts(dt); }
  for (const f of floats) f.t -= dt;
  floats = floats.filter(f => f.t > 0);
  const a = t(actionNow()); if ($('#actBtn').textContent !== a) $('#actBtn').textContent = a;
  if (!$('#help').hidden) { const g = goalText(); if ($('#goalNow').textContent !== g) $('#goalNow').textContent = g; }
  if (Math.floor(now / 500) !== step.last) { step.last = Math.floor(now / 500); showBar(); }
}
// the page's own words come from STR too
document.querySelectorAll('[data-s-label]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.sLabel)); e.title = t(e.dataset.sLabel); });
$('#soundBtn').textContent = S.sound ? '🔔' : '🔕';
resize(); titleCard();
let last = performance.now();
function frame(now) {
  // asked for first, so one bad frame can't stop the game (Mission Directive, 16 Nov)
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  try { if ($('#cover').hidden) step(dt, now); draw(now); stepMsg(now); } catch (e) { console.error(e); }
}
requestAnimationFrame(frame);
