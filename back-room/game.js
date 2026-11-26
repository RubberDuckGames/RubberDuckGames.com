// The Back Room (working title), Trello #57. A puzzle box of a room for older
// kids and grown-ups, designed by Randi: the back room of Cottonwood Crossing,
// a shop that buys what ranches and farms clear out. A crate has turned up
// with a note, "For whoever finally sorts the back room." You look closer at
// the odd old things in the room, find their drawers, dials and latches, and
// each answer opens the next. No timer, no way to fail.
//
// How it's drawn (decided 26 Nov; the card suggested three.js): a flat 320 x
// 200 pixel scene for the room and one for each close-up, drawn in code, with
// a few "faces" for things you turn round (the dresser, the ship, the crate).
// Real 3D was tried on paper and dropped: the clues are small numbers and
// letters stamped on tags, dials and plates, and a pixel close-up keeps every
// one of them sharp and the same size on every phone, where a turning 3D
// model shows them at an angle, blurred, and needs a camera you fight with
// on a touch screen. It also needs no library and runs on an old phone.
//
// Everything you can touch is a real <button> laid over the canvas (`spots`),
// not a hit test on the canvas: the keyboard, a controller and a screen
// reader all get it for free, each says what it is, and the focus ring is the
// browser's own. They show nothing until picked with a key or a controller,
// because a puzzle box doesn't light up its secrets.
//
// Every answer is in ROOMS, so later rooms add an entry instead of editing
// the code that checks them. Every visible string is in STR by key.

// ---------- The answers ----------
const ROOMS = {
  back: {
    tags: { washer: 125, dresser: 105, scale: 240, ship: 315 },   // cents, one tag on each
    total: 785,                                                    // the four tags added up: rings the register
    // the meters left to right (silver, green, red): the coin each takes and where its needle stops
    meters: [{ coin: 'penny', reads: 3 }, { coin: 'nickel', reads: 7 }, { coin: 'dime', reads: 1 }],
    lock: [3, 7, 1],                                               // the padlock's dials, in the same order
    sack: 9,                                                       // the left pan
    weights: { flatiron: 3, horseshoe: 2, insulator: 1, sash: 4 }, // only 4 + 3 + 2 makes 9
    grinderNo: 22,
    build: ['screw', 'blade', 'plate', 'ring'],                    // the grinder goes together in this order
    grinderTurns: 4,
    flags: 'SORT',                                                 // the ship's hoist, top to bottom
    wringTaps: 6,                                                  // crank taps to feed the note through
    wringGap: 260,                                                 // ms; quicker than this and it bunches
  },
};
const A = ROOMS.back;
const PUZZLES = ['washer', 'adder', 'register', 'drawer', 'grinder', 'secret', 'scale', 'meters', 'lock', 'box'];

// ---------- Strings ----------
const STR = {
  title: 'The Back Room',
  shop: 'Cottonwood Crossing',
  soundBtn: 'Sound on', soundOff: 'Sound off',
  inv: "Things you're carrying", invEmpty: 'Nothing in your pockets yet.',
  turnL: 'Turn it left', turnR: 'Turn it right',
  back: 'Back', crankDoc: 'Crank Doc',
  held: 'Holding',
  startLine: 'Cottonwood Crossing buys what ranches and farms clear out. In the back room, behind fifty years of it, a crate has turned up with a note on top.',
  startHow: 'Tap anything to look closer. Doc, the old red dentist’s machine in the corner, gives hints when you crank him.',
  startNew: 'Open the back room', startGo: 'Keep sorting', startOver: 'Start over',
  overTitle: 'Start over?', overLine: 'Everything in the back room goes back where it was, and the crate shuts again. Rubber ducks you found stay found.',
  overGo: 'Start over', cancel: 'Cancel', close: 'Close',
  // views
  vRoom: 'The back room', vWasher: 'The wringer washer', vAdder: 'The adding machine', vRegister: 'The cash register',
  vDresser: 'The dresser', vScale: 'The balance scale', vGrinder: 'The meat grinder', vShip: 'The ship model',
  vCrate: 'The crate', vMeters: 'The parking meters',
  faceFront: 'from the front', faceSide: 'from the side', faceBack: 'from the back', faceTop: 'from the top', facePort: 'one side', faceStar: 'the other side',
  // things in the room
  sDoc: 'Doc, the dentist’s machine', sDuck: 'Something small and yellow',
  // items
  i_soggy: 'Soggy note', i_note: 'Wren’s note', i_penny: 'Penny', i_nickel: 'Nickel', i_dime: 'Dime', i_key: 'Brass key',
  i_crank: 'Crank handle', i_sash: 'Iron weight', i_chart: 'Flag chart', i_letter: 'Wren’s letter',
  holding: 'You’re holding the {item}. Tap where it goes.',
  letGo: 'You put the {item} back in your pocket.',
  noGo: 'The {item} doesn’t do anything there.',
  got: 'You take the {item}.',
  // washer
  sLidKnob: 'The lid knob', sTub: 'Inside the tub', sDrain: 'The drain lever', sRollers: 'The wringer rollers', sWCrank: 'The wringer crank',
  sTag: 'A price tag', tagSays: 'The tag says {price}.',
  wLid: 'The knob turns, and the lid lifts off.',
  wWater: 'Cloudy grey water. You can’t see the bottom.',
  wDrain: 'Glug, glug. The water runs out across the floor.',
  wDrained: 'The drain lever is already open.',
  wEmpty: 'An empty enamel tub.',
  wRollers: 'Two rubber rollers, to squeeze the water out of the wash.',
  wRollNo: 'The rollers squeeze it, but it comes out the same.',
  wRollIn: 'You tuck the soggy note between the rollers.',
  wRollWait: 'The note is in the rollers. Turn the crank.',
  wCrankEmpty: 'The crank turns, and the empty rollers squeak round.',
  wFeed: 'Creak. The note inches through the rollers.',
  wBunch: 'Too fast! The note bunches up and backs out a little.',
  wOut: 'The note comes out the other side, flat and dry enough to read.',
  // adding machine
  sAKey: '{n} in the {col} column', colD: 'dollars', colT: 'dimes', colC: 'cents',
  sAClear: 'The clear key', sACrank: 'The crank', sATape: 'The paper tape', sAWindow: 'The total window',
  aNothing: 'No keys are down, so the crank adds nothing.',
  aAdded: 'Ka-chunk. It adds {v}. The total is {total}.',
  aClear: 'Clack. The total goes back to $0.00.',
  aTape: 'The tape says: {lines}.', aTapeEmpty: 'The paper tape is blank.',
  aWindow: 'The total window shows {total}.',
  // register
  sRKey: '{label} key', rowD: 'dollars', rowT: 'dimes', rowC: 'cents',
  sRCrank: 'The crank', sRFlags: 'The window on top', sRDrawer: 'The cash drawer',
  rNoSale: 'Ding! A flag pops up: NO SALE. The drawer stays shut.',
  rRang: 'Ding! The flags pop up: {v}. The drawer stays shut.',
  rOpen: 'DING! The flags pop up {v}, and the cash drawer shoots open.',
  rFlags: 'The flags show {v}.', rFlagsNone: 'An empty glass window. The flags show when something rings up.',
  rShut: 'The drawer is shut tight. It opens when a sale rings up.',
  rEmpty: 'An empty cash drawer.',
  // dresser
  sDTop: 'The top drawer', sDMid: 'The middle drawer', sDBot: 'The bottom drawer', sDIn: 'Inside the drawer',
  sDSide: 'The side of the dresser', sDLatch: 'A little wooden latch', sDPanel: 'A small panel in the back',
  dTopIn: 'Old receipts. "Buggy wheel, $2." "Twelve glass insulators, $1.80." "Cream separator, traded for a goat."',
  dLocked: 'Locked. There’s a little brass keyhole.',
  dUnlock: 'The key turns with a click, and the drawer slides open.',
  dEmpty: 'Nothing else in here.',
  dShallow: 'An empty drawer. It only goes in about half as far as the others.',
  dSide: 'From the side, the dresser is deep.',
  dLatch: 'The wooden latch turns sideways.', dLatchBack: 'The latch turns back.',
  dStuck: 'The panel won’t slide. The little latch is holding it.',
  dPanel: 'The panel slides away. There’s a hiding spot behind the bottom drawer!',
  dPanelOpen: 'The hiding spot behind the bottom drawer.',
  // scale
  sSPan: 'The right pan, holding {w} pounds', sSSack: 'The sack on the left pan', sSTray: '{item} on the tray, stamped {w}', sSOn: '{item} on the right pan, stamped {w}', sSDrawer: 'A drawer in the base', sSTrayAll: 'The tray',
  i_flatiron: 'Flatiron', i_horseshoe: 'Horseshoe', i_insulator: 'Glass insulator',
  sSack: 'A sack stamped 9 LB.',
  sPut: 'The {item} goes on the right pan. It\u2019s stamped {w}.', sOff: 'The {item} goes back on the tray.',
  sFull: 'The right pan is full.',
  sOpen: 'The beam levels out. Click! A drawer in the base slides open.',
  sDrawerShut: 'A little drawer in the base. It won’t pull open.',
  // grinder
  sGPart: '{part}, stamped No. {no}', sGBlade: 'A grinder blade', sGBody: 'The grinder, stamped No. 22', sGCrank: 'Where the crank goes', sGNote: 'Something poking out the front',
  p_screw: 'A grinder screw', p_plate: 'A grinder plate', p_ring: 'A grinder ring',
  gBody: 'A meat grinder clamped to the counter. It’s stamped No. 22.',
  gWrong: 'Stamped No. {no}. It’s too big for this grinder.',
  gOn: 'It fits.',
  gNeedScrew: 'That goes on the end of the screw. The screw goes in first.',
  gNeedBlade: 'The blade goes on before that.',
  gNeedPlate: 'The plate goes on before the ring.',
  gNoCrank: 'There’s no crank. The handle is missing.',
  gAttach: 'The crank handle slides on.',
  gSpin: 'The crank spins, but the grinder isn’t put together.',
  gTurn: 'Grind, grind. Something moves inside the barrel.',
  gOut: 'A rolled-up note squeezes out the front of the grinder!',
  // ship
  sSail: 'The ship', sPlaque: 'The brass plaque', sFlag: 'A flag, {n} from the top: {desc}',
  shipSays: 'A three-masted ship, rigged with cotton thread.',
  plaque: 'The plaque says: SHE SPEAKS IN FLAGS.',
  fS: 'white with a blue square in the middle', fO: 'cut corner to corner, yellow and red', fR: 'red with a yellow cross', fT: 'red, white and blue stripes up and down',
  fA: 'white and blue, with a notch cut in the end', fD: 'yellow, blue and yellow stripes across', fE: 'blue over red', fH: 'white and red, side by side', fK: 'yellow and blue, side by side', fW: 'a blue border, then white, with a red square in the middle',
  // crate
  sCUp: 'Turn the {col} dial up, now {d}', sCDown: 'Turn the {col} dial down, now {d}', colSilver: 'silver', colGreen: 'green', colRed: 'red',
  sCLid: 'The crate lid', sCNote: 'The note on the crate', sCWUp: 'Turn letter wheel {n} up, now {l}', sCWDown: 'Turn letter wheel {n} down, now {l}',
  sCLetter: 'A letter and a big iron key', sCLock: 'The padlock',
  cLocked: 'The padlock holds the lid shut.',
  cUnlocked: 'Clunk. The padlock springs open.',
  cLid: 'The lid creaks up. Inside, in the straw, is a little wooden box with four letter wheels.',
  cBox: 'Click. The little box opens. There’s a letter inside, and a big iron key.',
  // meters
  sMeter: 'The {col} meter. {reads}', mExpired: 'It reads EXPIRED.', mReads: 'Its needle points to {n}.',
  mSlot: 'It reads EXPIRED. The coin slot is stamped {coin}.',
  mWrong: 'It won’t go in. This slot is stamped {coin}.',
  mIn: 'Clink. The EXPIRED flag drops and the needle swings to {n}.',
  coin_penny: '1¢', coin_nickel: '5¢', coin_dime: '10¢',
  // the duck
  duck: 'A rubber duck, hiding behind the cans! It squeaks hello.',
  duckHi: 'The rubber duck sits on Doc’s head now. He doesn’t seem to mind.',
  // the notes
  noteTitle: 'A note from the washer',
  noteText: 'For whoever finally sorts the back room:\n\nEvery price I ever set is on a tag. Four tags still hang in here. Add them up and ring the total on the big register.\n\nThe rest you’ll find the way I did, by looking twice.',
  sign: '— Wren',
  crateTitle: 'The note on the crate',
  crateText: 'For whoever finally sorts the back room.\n\nStart with the wash.',
  crateSign: '— W.',
  chartTitle: 'A rolled-up flag chart',
  chartLine: 'Ship’s flags, each with the letter it stands for.',
  chartAlt: 'Ten flags and their letters. A: white and blue, with a notch cut in the end. D: yellow, blue and yellow stripes across. E: blue over red. H: white and red, side by side. K: yellow and blue, side by side. O: cut corner to corner, yellow and red. R: red with a yellow cross. S: white with a blue square in the middle. T: red, white and blue stripes up and down. W: a blue border, then white, with a red square in the middle.',
  letterTitle: 'Wren’s letter',
  letterText: 'You sorted it.\n\nI meant to for fifty-one years. Every week something new came in off a ranch, and the back room got deeper. If you’re reading this, you looked twice at everything, which is all this shop ever asked of anybody.\n\nThe key opens the door at the very back, the one that says ENTER AT YOUR OWN RISK. I never went through. My father did.\n\nBe kind to Doc. He was my father’s, and he means well.',
  endNext: 'The room behind that door is still being built.',
  ducks: 'Rubber ducks found: {n} of {m}.',
  keepLooking: 'Keep looking around',
  // Doc
  docHello: '*creak* ...Oh! A patient. ',
  docOpen: ['Open wide... ', 'Just a little pressure... ', 'Rinse, please... ', 'Mm-hmm, mm-hmm... ', 'Bite down gently... ', 'Comfortable? Good... '],
  docDone: 'Lovely. Not a single cavity in the whole back room.',
  // canvas words
  art_expired: 'EXPIRED', art_limit: 'LIMIT 60 MIN', art_plaque: 'SHE SPEAKS IN FLAGS', art_sack: '9 LB', art_noSale: 'NO SALE', art_up: 'THIS SIDE UP', art_no22: 'NO. 22',
};

// Doc's hints, three to a step: a nudge, a clearer nudge, then nearly the
// answer, never the answer straight away. Picked by `hintNow`.
const HINTS = {
  'washer.start': ['That washer is awfully full for something nobody’s used in years.', 'Lids come off. And water drains, if you find the lever.', 'Turn the knob on the lid, and flip the drain lever at the bottom of the tub.'],
  'washer.take': ['Something’s at the bottom of that tub. Two somethings.', 'Pick them up. Gently, they’ve been soaking.', 'Tap the soggy note and the coin in the empty tub.'],
  'washer.wring': ['A soggy note won’t read itself, I’m afraid.', 'What on a washer squeezes things flat?', 'Pick the soggy note, then tap the wringer’s rollers on top.'],
  'washer.crank': ['Gently now. Slow and steady, like a good rinse.', 'If it bunches up, you’re cranking too fast.', 'Tap the crank about once a second until the note comes out.'],
  'adder': ['Prices, prices. Every price in here is on a tag.', 'Four tags: on the washer, the dresser, the scale and the ship. The adding machine is happy to help.', 'Press one key in each column for a price, pull the crank, and do that for every tag. Watch the total.'],
  'register': ['That fancy register would love to ring up a sale.', 'One key in each row: dollars, dimes, then cents. Then the crank on the side.', 'Ring up the four tags’ total, the same total the adding machine printed.'],
  'drawer': ['A little brass key. Now, what has a little keyhole?', 'Have a look at the dresser’s drawers.', 'Pick the key, then tap the dresser’s middle drawer.'],
  'grinder.parts': ['Two grinders got their parts mixed up. Happens to the best of us.', 'Every part is stamped with a number. The grinder says No. 22.', 'No. 22 parts go on in order: the screw, the blade, the plate, then the ring.'],
  'grinder.crank': ['All put together, and no way to turn it. Tsk.', 'It needs a crank handle. A locked drawer might have one.', 'The crank is in the dresser’s middle drawer. Pick it, then tap the side of the grinder.'],
  'grinder.turn': ['Turn it, turn it. Something’s in the barrel.', 'Keep cranking, nice and easy.', 'Tap the crank until something comes out the front.'],
  'grinder.take': ['Something’s poking out the front of that grinder.', 'Go on, pull it out.', 'Tap the rolled-up paper at the front of the grinder.'],
  'secret': ['One of those dresser drawers is telling a little fib.', 'The bottom drawer is shallow, but the dresser is deep. Turn it around.', 'At the back of the dresser, turn the little wooden latch, then slide the panel.'],
  'secret.take': ['There’s something heavy in that hiding spot.', 'Take it. It’s exactly the weight you need.', 'Tap the iron weight behind the bottom drawer.'],
  'scale': ['That scale wants both pans to weigh the same.', 'The sack says 9 pounds. Everything on the tray has its weight stamped on it.', 'Put things on the right pan until their numbers make 9.'],
  'scale.short': ['That scale wants both pans to weigh the same.', 'The sack says 9 pounds. Everything on the tray has its weight stamped on it.', 'The tray only adds up to 6. You need 4 pounds more, hidden somewhere in the dresser.'],
  'scale.take': ['The scale’s drawer is open. Something shiny.', 'Go on, take it.', 'Tap the coin in the drawer at the bottom of the scale.'],
  'meters': ['Those meters have been expired for years. Poor things.', 'Each slot takes one kind of coin. Read the slots.', 'A penny, a nickel and a dime, one in each meter. Then read the needles left to right.'],
  'meters.short': ['Those meters have been expired for years. Poor things.', 'Each slot takes one kind of coin. Read the slots.', 'There are three coins to find: one in the washer, one in the register, one in the scale.'],
  'lock': ['That padlock has three dials: silver, green and red.', 'The parking meters are silver, green and red too, left to right.', 'Set each dial to the number its meter’s needle points at.'],
  'box.lid': ['The padlock’s off. What are you waiting for?', 'Lift the lid.', 'Tap the top of the crate to open it.'],
  'box.nochart': ['Four letter wheels. A four-letter word, somewhere in this room.', 'Ships talk without saying a word.', 'You’ll need the flag chart. The meat grinder has it, once it’s built.'],
  'box': ['Four letter wheels. Ships talk without saying a word.', 'Turn the ship around and look at its flags.', 'Match each flag, top to bottom, to the chart from the grinder.'],
  'letter': ['Go on, it’s addressed to you.', 'The letter in the little box.', 'Tap the letter in the little box to read it.'],
};

// an item's name inside a sentence: "the penny", but "Wren’s note" keeps its capital
const inm = id => { const n = STR['i_' + id]; return n.startsWith('Wren') ? n : n[0].toLowerCase() + n.slice(1); };
const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
const money = c => '$' + (c / 100).toFixed(2);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const $ = q => document.querySelector(q);

// ---------- Saving ----------
const KEY = 'back-room';
function fresh(old = {}) {
  return {
    v: 1, started: false, done: false, inv: [], got: [], held: null, solved: {}, hints: {},
    duck: !!old.duck, docOn: false, sound: old.sound ?? true,
    washer: { lid: false, drained: false, noteIn: false, feed: 0 },
    adder: { cols: [0, 0, 0], tape: [], total: 0 },
    reg: { keys: [0, 0, 0], flags: null, open: false },
    dresser: { open: null, unlocked: false, latch: false, panel: false },
    scale: { tray: ['flatiron', 'horseshoe', 'insulator'], pan: [], open: false },
    grinder: { built: [], crank: false, turns: 0, out: false },
    meters: [false, false, false],
    crate: { lock: [0, 0, 0], unlocked: false, lid: false, wheels: [0, 0, 0, 0], box: false },
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
if (!S || S.v !== 1) S = fresh();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

const has = id => S.inv.includes(id);
const got = id => S.got.includes(id);
function give(id) { if (!got(id)) S.got.push(id); if (!has(id)) S.inv.push(id); sfx.pick(); }
function useUp(id) { S.inv = S.inv.filter(i => i !== id); if (S.held === id) S.held = null; }

// ---------- Sound ----------
const tone = RDG.sound({ on: () => S.sound, type: 'square', vol: .04 });
const sfx = {
  click: () => tone(900, .03),
  clunk: () => { tone(160, .09); tone(90, .12, 'square', .06); },
  key: () => tone(1300, .025, 'square', 0, .03),
  creak: () => tone(240, .14, 'sawtooth', 0, .03, 170),
  ding: big => { tone(1568, big ? .7 : .35, 'triangle', 0, .07); if (big) tone(2093, .6, 'triangle', .03, .04); },
  glug: () => { for (let i = 0; i < 7; i++) tone(260 + Math.random() * 220, .07, 'sine', i * .08, .06); },
  solve: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, 'triangle', i * .09, .05)),
  whirr: () => tone(320, .4, 'sawtooth', 0, .025, 950),
  bunch: () => tone(120, .16, 'square', 0, .05, 80),
  coin: () => { tone(1800, .05); tone(2400, .09, 'square', .05); },
  pick: () => tone(660, .06, 'triangle', 0, .06),
  no: () => tone(190, .12, 'triangle', 0, .06),
  squeak: () => { tone(1500, .1, 'square', 0, .04, 1000); tone(1700, .1, 'square', .12, .04, 1100); },
};

// ---------- Drawing kit ----------
const W = 320, H = 200;
const cv = $('#cv'); cv.width = W; cv.height = H;
const g0 = cv.getContext('2d');
let G = g0;
const off = n => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const bufA = off(), bufB = off();

const C = {
  ink: '#1c120a', wallA: '#5b3b22', wallB: '#51341e', wallC: '#62412a', seam: '#2c1b0f', grain: '#46301b',
  floorA: '#4a3320', floorB: '#3f2c1b', floorSeam: '#2a1d12',
  woodL: '#b07c45', wood: '#8a5a30', woodD: '#5e3a1c', woodDD: '#3e2512',
  iron: '#5d6166', ironL: '#8e949a', ironD: '#36393d',
  steel: '#a9adb3', steelL: '#dadde0', steelD: '#6c7076',
  rust: '#8a4422', rustL: '#b0602e', rustD: '#5a2a14',
  red: '#a8322a', redL: '#cf4f3e', redD: '#6a1d18',
  enamel: '#e6e1d3', enamelL: '#fbf8ee', enamelD: '#b9b2a1', enamelDD: '#8c8574',
  brass: '#b8902e', brassL: '#ecc65c', brassD: '#76591a',
  copper: '#b5653a', copperL: '#e0915a', copperD: '#7a3e1e',
  glass: '#4f9a8c', glassL: '#8fd0c0', glassD: '#2c5e56',
  paper: '#efe4c6', paperD: '#cdbd92',
  green: '#4f7a52', greenL: '#77a576', greenD: '#2f4c32',
  cream: '#e8dfc8', creamD: '#b8ab8a',
  water: '#5f737a', waterL: '#8299a0',
  sack: '#a88a5a', sackD: '#7a6038',
  yellow: '#f2c230', yellowD: '#b88a10', blue: '#2f5fa8', white: '#f4f1e8', black: '#141414',
};

const R = (x, y, w, h, c) => { G.fillStyle = c; G.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const px = (x, y, c) => R(x, y, 1, 1, c);
function bev(x, y, w, h, b, l, d) { R(x, y, w, h, b); R(x, y, w, 1, l); R(x, y, 1, h, l); R(x, y + h - 1, w, 1, d); R(x + w - 1, y, 1, h, d); }
function dith(x, y, w, h, c, step = 2) { G.fillStyle = c; for (let j = 0; j < h; j++) for (let i = j % step; i < w; i += step) G.fillRect(x + i, y + j, 1, 1); }
function oval(cx, cy, rx, ry, c) {
  for (let j = -ry; j <= ry; j++) {
    const s = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + .5) * (ry + .5)))));
    R(cx - s, cy + j, 2 * s + 1, 1, c);
  }
}
const disc = (cx, cy, r, c) => oval(cx, cy, r, r, c);
function ringO(cx, cy, rx, ry, c, from = 0, to = Math.PI * 2) {
  const n = Math.max(24, (rx + ry) * 5);
  for (let i = 0; i <= n; i++) { const t = from + (to - from) * i / n; px(Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), c); }
}
function line(x0, y0, x1, y1, c, th = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (; ;) {
    R(x0, y0, th, th, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
// a 3 x 5 pixel font for everything stamped, printed or painted in the scene
const FONT = {};
('0:111101101101111 1:010110010010111 2:111001111100111 3:111001011001111 4:101101111001001 5:111100111001111 6:111100111101111 7:111001010010010 8:111101111101111 9:111101111001111 ' +
  'A:010101111101101 B:110101110101110 C:011100100100011 D:110101101101110 E:111100110100111 F:111100110100100 G:011100101101011 H:101101111101101 I:111010010010111 J:001001001101010 ' +
  'K:101101110101101 L:100100100100111 M:101111111101101 N:110101101101101 O:010101101101010 P:110101110100100 Q:010101101110011 R:110101110101101 S:011100010001110 T:111010010010010 ' +
  'U:101101101101111 V:101101101101010 W:101101111111101 X:101101010101101 Y:101101010010010 Z:111001010100111 $:011100010001110 .:000000000000010 ¢:010111100111010 -:000000111000000 ' +
  '+:000010111010000 =:000111000111000 *:000101010101000 !:010010010000010 ?:110001010000010 /:001001010100100 ,:000000000010100 \':010010000000000')
  .split(' ').forEach(p => { FONT[p[0]] = p.slice(2); });
function text(s, x, y, c, k = 1) {
  let cx = Math.round(x);
  for (const ch of String(s).toUpperCase()) {
    const gl = FONT[ch];
    if (gl) for (let i = 0; i < 15; i++) if (gl[i] === '1') R(cx + (i % 3) * k, y + ((i / 3) | 0) * k, k, k, c);
    if (ch === '$') { R(cx + k, y - k, k, k, c); R(cx + k, y + 5 * k, k, k, c); }   // the stem, so it isn't an S
    cx += 4 * k;
  }
}
const tw = (s, k = 1) => String(s).length * 4 * k - k;
const textC = (s, cx, y, c, k = 1) => text(s, cx - tw(s, k) / 2, y, c, k);
function rng(seed) { let n = (seed >>> 0) % 2147483646 + 1; return () => (n = n * 16807 % 2147483647) / 2147483647; }

// things drawn once and kept: walls, floors, the room's shelves
const cache = {};
function cached(key, fn) {
  if (!cache[key]) {
    const c = off(), old = G; G = c.getContext('2d');
    fn(rng([...key].reduce((a, ch) => a * 31 + ch.charCodeAt(0) | 0, 7)));
    G = old; cache[key] = c;
  }
  G.drawImage(cache[key], 0, 0);
}
function planks(x0, y0, w, h, bw, r, cols = [C.wallA, C.wallB, C.wallC]) {
  for (let x = x0; x < x0 + w; x += bw) {
    R(x, y0, bw, h, cols[(r() * cols.length) | 0]);
    R(x, y0, 1, h, C.seam);
    for (let k = 0; k < h / 5; k++) R(x + 2 + ((r() * (bw - 4)) | 0), y0 + ((r() * h) | 0), 1, 2 + ((r() * 7) | 0), C.grain);
    px(x + (bw >> 1), y0 + 3, C.ironD); px(x + (bw >> 1), y0 + h - 5, C.ironD);
  }
}
function floor(y0, r) {
  for (let y = y0; y < H; y += 6) {
    R(0, y, W, 6, r() < .5 ? C.floorA : C.floorB); R(0, y, W, 1, C.floorSeam);
    for (let x = (r() * 50) | 0; x < W; x += 40 + ((r() * 60) | 0)) R(x, y, 1, 6, C.floorSeam);
  }
  R(0, y0 - 4, W, 4, C.woodDD); R(0, y0 - 4, W, 1, C.woodD);
}
// pixel lighting: an ordered dither of shadow, darker away from the light,
// so the dark corners stay pixel art instead of a smooth gradient
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const shades = {};
function shade(cx, cy, rad, k = 1) {
  const key = [cx, cy, rad, k].join();
  if (!shades[key]) {
    const c = off(), x2 = c.getContext('2d'), im = x2.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - cx) * .75, y - cy) / rad, lvl = Math.max(0, Math.min(1, (d - .62) * 1.8)) * 16 * k, b = BAYER[(y & 3) * 4 + (x & 3)];
      const i = (y * W + x) * 4; im.data[i] = 12; im.data[i + 1] = 7; im.data[i + 2] = 3;
      im.data[i + 3] = b < lvl ? (b < lvl - 8 ? 160 : 90) : 0;
    }
    x2.putImageData(im, 0, 0); shades[key] = c;
  }
  G.drawImage(shades[key], 0, 0);
}
function tag(x, y, s) {
  const w = tw(s) + 7;
  R(x, y, w, 9, C.paper); R(x, y + 8, w, 1, C.paperD); R(x + w - 1, y, 1, 9, C.paperD);
  px(x + 2, y + 4, C.ink);
  text(s, x + 5, y + 2, C.ink);
}
function bgFloor() { cached('bgFloor', r => { planks(0, 0, W, 178, 16, r); floor(180, r); }); }
function bgBench(top = 150) {
  cached('bgBench' + top, r => {
    planks(0, 0, W, top, 16, r);
    for (let y = top; y < H; y += 5) { R(0, y, W, 5, r() < .5 ? C.woodL : '#a5733f'); for (let x = (r() * 30) | 0; x < W; x += 20 + ((r() * 50) | 0)) R(x, y + 2, 6 + ((r() * 14) | 0), 1, C.wood); }
    R(0, top, W, 2, '#c99a5e');
  });
}

// coins and small things, used in several places
function coin(cx, cy, kind) {
  const r = kind === 'dime' ? 4 : kind === 'nickel' ? 6 : 5;
  const [b, l, d] = kind === 'penny' ? [C.copper, C.copperL, C.copperD] : [C.steel, C.steelL, C.steelD];
  oval(cx, cy + 1, r, r - 1, d); oval(cx, cy, r, r - 1, b); px(cx - 2, cy - 1, l); px(cx - 1, cy - 2, l);
}
function brassKey(x, y) { disc(x, y, 4, C.brassD); disc(x, y, 3, C.brass); disc(x, y, 1, C.ink); R(x + 4, y - 1, 14, 3, C.brass); R(x + 14, y + 2, 2, 3, C.brass); R(x + 10, y + 2, 2, 2, C.brass); R(x + 4, y - 1, 14, 1, C.brassL); }
function soggy(x, y) { oval(x, y, 9, 4, C.paperD); dith(x - 7, y - 3, 14, 6, '#9c9070', 2); px(x - 3, y - 1, C.ink); px(x + 2, y, C.ink); }

// ---------- Signal flags ----------
// The real International Code of Signals flags (A, D, E, H, K, O, R, S, T, W).
function flag(L, x, y, w = 18, h = 12) {
  const half = w >> 1;
  switch (L) {
    case 'A': R(x, y, half, h, C.white); R(x + half, y, w - half, h, C.blue);
      for (let j = 0; j < h; j++) { const cut = Math.round(5 * (1 - Math.abs(j - (h - 1) / 2) / ((h - 1) / 2))); R(x + w - cut, y + j, cut, 1, '#000'); }
      break;
    case 'D': R(x, y, w, h, C.yellow); R(x, y + 3, w, h - 6, C.blue); break;
    case 'E': R(x, y, w, h >> 1, C.blue); R(x, y + (h >> 1), w, h - (h >> 1), C.red); break;
    case 'H': R(x, y, half, h, C.white); R(x + half, y, w - half, h, C.red); break;
    case 'K': R(x, y, half, h, C.yellow); R(x + half, y, w - half, h, C.blue); break;
    case 'O': for (let j = 0; j < h; j++) { const k = Math.round(w * (1 - j / h)); R(x, y + j, w, 1, C.yellow); R(x + w - k, y + j, k, 1, C.red); } break;
    case 'R': R(x, y, w, h, C.red); R(x, y + (h >> 1) - 1, w, 3, C.yellow); R(x + half - 1, y, 3, h, C.yellow); break;
    case 'S': R(x, y, w, h, C.white); R(x + 5, y + 3, w - 10, h - 6, C.blue); break;
    case 'T': { const t = Math.round(w / 3); R(x, y, t, h, C.red); R(x + t, y, t, h, C.white); R(x + 2 * t, y, w - 2 * t, h, C.blue); break; }
    case 'W': R(x, y, w, h, C.blue); R(x + 3, y + 2, w - 6, h - 4, C.white); R(x + 6, y + 4, w - 12, h - 8, C.red); break;
  }
  if (L !== 'A') { R(x, y, w, 1, 'rgba(0,0,0,.25)'); }
}

// ---------- Doc ----------
// The old red dentist's unit (Randi, 26 Nov): two gauge eyes, a round mouth
// up top, knobs down the front like vest buttons, a rusty arm and a spit
// bowl. He's the hint button. Until he's cranked his gauges are dark; his
// needles sit higher the more of the room is sorted, and swing up when
// something is solved.
const AN = { wAng: 0, wAngT: 0, aPull: 0, rPull: 0, gAng: Math.PI, gAngT: Math.PI, tilt: 0, needles: [0, 0, 0], dCrank: 0, cheer: -1e9, flick: -1e9 };
const progress = () => PUZZLES.filter(p => S.solved[p]).length / PUZZLES.length;
function docNeedles(now) {
  if (!S.docOn) return [0, 0];
  let v = .1 + .8 * progress();
  const c = (now - AN.cheer) / 1800;
  if (c < 1) v = v + (1 - v) * (1 - c) + Math.sin(now / 60) * .06 * (1 - c);
  const f = (now - AN.flick) / 700;
  if (f < 1) return [Math.random(), Math.random()];
  return [v, Math.min(1, v + Math.sin(now / 900) * .03)];
}
function gauge(cx, cy, r, v, on) {
  disc(cx, cy, r + 1, C.ironD); disc(cx, cy, r, on ? C.white : '#7d776a');
  if (on) for (let i = 0; i <= 4; i++) { const a = Math.PI * (1.1 - i * .3); px(Math.round(cx + Math.cos(a) * (r - 1)), Math.round(cy - Math.sin(a) * (r - 1)), C.ink); }
  const a = Math.PI * (1.1 - v * 1.2);
  line(cx, cy, cx + Math.cos(a) * (r - 1.5), cy - Math.sin(a) * (r - 1.5), on ? C.red : C.ironD);
  px(cx, cy, C.ink);
}
function docHead(x, y, now) {   // 30 wide, 26 tall, top left at x, y
  const [l, r] = docNeedles(now);
  oval(x + 15, y + 4, 7, 3, C.enamelDD); oval(x + 15, y + 3, 6, 2, C.enamel); oval(x + 15, y + 4, 3, 1, C.ink);   // the mouth up top
  bev(x, y + 6, 30, 22, C.red, C.redL, C.redD);
  dith(x + 2, y + 22, 26, 5, C.rustD, 3);
  gauge(x + 8, y + 15, 5, l, S.docOn); gauge(x + 22, y + 15, 5, r, S.docOn);
  if (S.duck) duckSprite(x + 10, y - 7);
}
function duckSprite(x, y) {
  R(x + 2, y + 3, 8, 4, C.yellow); R(x + 1, y + 4, 10, 3, C.yellow); R(x + 6, y, 4, 4, C.yellow);
  px(x + 8, y + 1, C.ink); R(x + 10, y + 2, 2, 1, '#f28c28'); R(x + 2, y + 6, 8, 1, C.yellowD);
}

// ---------- Views ----------
// Each view is a scene: draw() paints it, spots() lists what can be touched.
// A spot is { id, x, y, w, h, label, act, use }: act() runs on a tap, and
// use(item) runs instead when an item is held (it returns false if the item
// does nothing there).
const say = (k, v, who) => setMsg(fmt(STR[k] ?? k, v), who);
const face = { dresser: 0, ship: 0, crate: 0 };
let view = 'room';

const ROOM_AT = {   // where each close-up sits in the room, for the zoom
  washer: [44, 84, 46, 84], dresser: [86, 88, 42, 74], adder: [128, 78, 36, 24], grinder: [162, 76, 26, 26], register: [186, 50, 50, 52],
  ship: [242, 4, 76, 50], meters: [262, 66, 58, 96], scale: [232, 102, 34, 60], crate: [126, 144, 76, 54],
};

function drawRoom(now) {
  cached('room', r => {
    planks(0, 0, W, 140, 14, r); floor(144, r);
    // the high dusty window, the only daylight back here
    bev(52, 10, 34, 22, C.woodD, C.wood, C.woodDD); R(55, 13, 28, 16, '#8aa0a0'); dith(55, 13, 28, 16, '#b8c8c0', 3); R(68, 13, 2, 16, C.woodD); R(55, 20, 28, 2, C.woodD);
    // shelves over the counter
    for (const y of [34, 64]) { bev(124, y, 116, 3, C.woodL, '#d09a5a', C.woodD); R(126, y + 3, 112, 1, 'rgba(0,0,0,.4)'); }
    R(124, 20, 3, 80, C.woodD); R(237, 20, 3, 80, C.woodD);
    // cans on the top shelf (the duck hides behind the last one)
    const cans = [[130, C.red], [140, '#c96a2a'], [150, C.green], [162, C.red], [172, C.brass], [196, C.blue], [206, C.red], [222, '#7a5a30']];
    cans.forEach(([x, c]) => { R(x, 22, 9, 12, c); R(x, 22, 9, 1, C.steelL); R(x, 26, 9, 3, C.paper); R(x + 7, 22, 2, 12, 'rgba(0,0,0,.3)'); });
    // bottles
    for (const [x, c] of [[184, C.glassD], [189, '#7a4a14'], [230, C.glass]]) { R(x, 25, 4, 9, c); R(x + 1, 21, 2, 4, c); px(x + 1, 26, C.glassL); }
    // glass insulators on the lower shelf
    for (let i = 0; i < 9; i++) {
      const x = 128 + i * 12, c = i % 3 ? C.glass : C.glassD;
      oval(x + 4, 55, 4, 3, c); R(x, 55, 9, 8, c); R(x - 1, 61, 11, 3, c); px(x + 2, 56, C.glassL); px(x + 2, 57, C.glassL);
    }
    // the counter
    R(124, 102, 116, 40, C.woodD); bev(122, 98, 120, 5, C.woodL, '#d09a5a', C.wood);
    for (const x of [128, 166, 204]) bev(x, 108, 32, 28, C.woodD, C.wood, C.woodDD);
    // the ship's high shelf and the bulb
    bev(240, 52, 80, 3, C.woodL, '#d09a5a', C.woodD);
    R(170, 0, 1, 10, C.ink); R(167, 10, 7, 3, C.ironD); disc(170, 15, 3, '#fff2c0');
  });
  const w = S.washer;
  // Doc
  const x = 6;
  R(x, 150, 40, 10, C.ironD); R(x + 2, 148, 36, 3, C.iron);
  bev(x + 10, 56, 20, 94, C.red, C.redL, C.redD); dith(x + 11, 118, 18, 30, C.rust, 3); dith(x + 12, 60, 5, 24, C.rustD, 4);
  for (const k of [68, 80, 92, 104]) { disc(x + 20, k, 2, C.ironD); px(x + 19, k - 1, C.ironL); }
  line(x + 28, 62, x + 46, 54, C.rustL, 2); disc(x + 47, 54, 2, C.rust); line(x + 47, 55, x + 52, 70, C.rustL, 2); R(x + 51, 70, 3, 5, C.steelD);
  line(x + 29, 96, x + 40, 96, C.ironD, 2); oval(x + 44, 94, 7, 3, C.enamelDD); oval(x + 44, 93, 6, 2, C.enamel); oval(x + 44, 94, 3, 1, C.enamelD);
  const ca = AN.dCrank; disc(x + 3, 112, 4, C.ironD); line(x + 3, 112, x + 3 + Math.cos(ca) * 7, 112 + Math.sin(ca) * 7, C.iron, 2);
  docHead(x + 5, 30, now);
  // the washer
  if (w.drained) { oval(70, 176, 26, 4, '#2c3438'); oval(70, 175, 20, 2, '#3c484e'); }
  R(54, 150, 3, 16, C.enamelD); R(80, 150, 3, 16, C.enamelD);
  R(50, 106, 36, 46, C.enamel); R(50, 106, 3, 46, C.enamelD); R(54, 106, 4, 46, C.enamelL); R(78, 106, 8, 46, C.enamelD);
  R(50, 128, 36, 2, C.black); oval(68, 106, 19, 4, C.enamelDD); oval(68, 105, 18, 3, w.lid ? (w.drained ? C.enamelD : C.water) : C.enamelL);
  R(56, 86, 2, 18, C.iron); R(78, 86, 2, 18, C.iron); bev(53, 84, 30, 4, C.iron, C.ironL, C.ironD); R(57, 89, 22, 3, C.cream); R(57, 92, 22, 3, C.creamD);
  line(82, 86, 86, 94, C.paperD); R(84, 94, 5, 4, C.paper);
  // the dresser
  bev(88, 92, 38, 3, C.woodL, '#d09a5a', C.woodD); R(90, 95, 34, 60, C.wood); R(90, 155, 34, 4, C.woodD);
  for (let i = 0; i < 3; i++) { const y = 98 + i * 19, out = S.dresser.open === i ? 3 : 0; bev(92 - out / 2, y + out, 30 + out, 16, C.wood, C.woodL, C.woodDD); px(100, y + 8 + out, C.brass); px(114, y + 8 + out, C.brass); }
  line(100, 106, 96, 112, C.paperD); R(93, 112, 5, 4, C.paper);
  // on the counter: the adding machine, the grinder, the register
  bev(130, 84, 30, 15, C.green, C.greenL, C.greenD); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) px(134 + i * 4, 87 + j * 3, C.cream); R(152, 78, 6, 8, C.paper); line(160, 90, 163, 84, C.ironD);
  R(166, 86, 14, 6, C.iron); R(166, 80, 6, 6, C.iron); R(170, 92, 4, 6, C.ironD); if (S.grinder.crank) line(166, 89, 162, 82, C.ironD);
  bev(190, 64, 44, 34, C.brass, C.brassL, C.brassD); R(200, 54, 24, 11, C.brass); R(203, 56, 18, 7, '#20160c');
  if (S.reg.flags) R(206, 57, 12, 4, C.white);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) px(195 + i * 6, 72 + j * 6, C.cream);
  if (S.reg.open) bev(192, 96, 40, 5, C.wood, C.woodL, C.woodDD);
  // the ship on its shelf
  R(262, 48, 3, 4, C.brass); R(296, 48, 3, 4, C.brass);
  line(304, 40, 318, 32, C.woodD);
  for (const [mx, top] of [[268, 14], [283, 8], [297, 16]]) {
    R(mx, top, 1, 30, C.woodD);
    let y = 39; for (let k = 0; k < 3; k++) { const h = [8, 7, 5][k], w = [12, 10, 7][k]; y -= h; R(mx - (w >> 1), y, w, h - 1, C.cream); R(mx + (w >> 1) - 2, y, 2, h - 1, C.creamD); R(mx - (w >> 1) - 1, y - 1, w + 2, 1, C.woodD); }
    line(mx, top, 258, 39, '#2a1a10');
  }
  for (let y = 39; y < 48; y++) { const t = (y - 39) / 9, l = 256 + Math.round(t * t * 12), r = 310 - Math.round(t * 16); R(l, y, r - l, 1, y < 41 ? C.woodL : y === 42 ? C.brassL : y < 45 ? C.woodDD : C.ink); }
  line(318, 32, 316, 38, C.paperD); R(313, 38, 5, 3, C.paper);
  // the parking meters
  const mc = [[C.steel, C.steelL], [C.green, C.greenL], [C.red, C.redL]];
  for (let i = 0; i < 3; i++) {
    const mx = 274 + i * 18;
    R(mx - 1, 92, 3, 68, C.ironD); R(mx - 4, 158, 9, 3, C.ironD);
    oval(mx, 76, 7, 6, mc[i][0]); R(mx - 7, 76, 15, 16, mc[i][0]); R(mx - 6, 77, 2, 14, mc[i][1]);
    R(mx - 4, 74, 9, 7, '#d8e0d8'); if (!S.meters[i]) R(mx - 4, 78, 9, 3, C.red); R(mx - 1, 84, 3, 1, C.ink);
  }
  // the balance scale on a stool
  R(238, 136, 26, 3, C.woodL); R(240, 139, 2, 22, C.woodD); R(260, 139, 2, 22, C.woodD);
  R(246, 130, 10, 6, C.ironD); R(250, 108, 2, 22, C.brass);
  const k = Math.round(AN.tilt / 4); line(238, 108 + k, 264, 108 - k, C.brass);
  oval(240, 120 + k, 5, 1, C.brassD); oval(262, 120 - k, 5, 1, C.brassD); R(237, 115 + k, 6, 5, C.sack);
  R(252, 114, 5, 4, C.paper);
  // the crate
  R(130, 150, 70, 44, C.wood);
  for (let y = 150; y < 194; y += 9) { R(130, y, 70, 1, C.woodDD); R(130, y + 1, 70, 1, C.woodL); }
  R(130, 150, 6, 44, C.woodD); R(194, 150, 6, 44, C.woodD);
  if (S.crate.lid) { R(128, 140, 74, 10, C.woodD); R(136, 152, 58, 6, '#c9a84a'); }
  else { R(150, 146, 18, 6, C.paper); R(153, 148, 10, 1, C.ink); }
  if (!S.crate.unlocked) { R(162, 160, 8, 8, C.brass); ringO(166, 159, 3, 3, C.ironL, Math.PI, Math.PI * 2); }
  // the duck, until it's found (then it rides on Doc's head)
  if (!S.duck) duckSprite(229, 24 + Math.round(Math.sin(now / 600)));
  R(222, 22, 9, 12, '#7a5a30'); R(222, 26, 9, 3, C.paper); R(222, 22, 9, 1, C.steelL);
  shade(168, 24, 190, .9);
  // the bulb glows over the shade
  disc(170, 15, 2, '#fffbe8');
}

const roomSpots = () => [
  { id: 'doc', x: 4, y: 22, w: 50, h: 140, label: STR.sDoc, act: crankDoc },
  { id: 'washer', x: 46, y: 82, w: 42, h: 86, label: STR.vWasher, act: () => go('washer') },
  { id: 'dresser', x: 88, y: 90, w: 38, h: 70, label: STR.vDresser, act: () => go('dresser') },
  { id: 'adder', x: 128, y: 76, w: 34, h: 24, label: STR.vAdder, act: () => go('adder') },
  { id: 'grinder', x: 162, y: 76, w: 24, h: 24, label: STR.vGrinder, act: () => go('grinder') },
  { id: 'register', x: 188, y: 50, w: 48, h: 50, label: STR.vRegister, act: () => go('register') },
  !S.duck && { id: 'duck', x: 226, y: 18, w: 16, h: 16, label: STR.sDuck, act: () => { S.duck = true; sfx.squeak(); say('duck'); save(); refresh(); } },
  { id: 'ship', x: 244, y: 4, w: 76, h: 46, label: STR.vShip, act: () => go('ship') },
  { id: 'meters', x: 264, y: 66, w: 56, h: 96, label: STR.vMeters, act: () => go('meters') },
  { id: 'scale', x: 234, y: 102, w: 30, h: 60, label: STR.vScale, act: () => go('scale') },
  { id: 'crate', x: 128, y: 142, w: 74, h: 54, label: STR.vCrate, act: () => go('crate') },
].filter(Boolean);

// ----- the wringer washer -----
function drawWasher() {
  const w = S.washer;
  bgFloor();
  if (w.drained) { oval(170, 190, 70, 6, '#2c3438'); oval(166, 189, 54, 4, '#3c484e'); }
  for (const lx of [106, 210]) { R(lx, 148, 6, 40, C.enamelD); R(lx, 148, 2, 40, C.enamel); R(lx - 2, 186, 10, 3, C.enamelDD); }
  // the wringer, on posts at the back of the tub
  R(118, 26, 6, 46, C.iron); R(196, 26, 6, 46, C.iron); R(118, 26, 2, 46, C.ironL);
  bev(110, 20, 100, 8, C.iron, C.ironL, C.ironD);
  for (const ry of [30, 39]) { R(122, ry, 76, 8, C.cream); R(122, ry, 76, 2, C.white); R(122, ry + 6, 76, 2, C.creamD); }
  if (w.noteIn) {
    const f = w.feed / A.wringTaps;
    const up = Math.round(16 * (1 - f)); if (up) { R(142, 30 - up, 36, up, C.paperD); dith(142, 30 - up, 36, up, '#a89c78', 3); }
    const dn = Math.round(16 * f); if (dn) { R(142, 47, 36, dn, C.paper); for (let i = 2; i < dn; i += 3) R(146, 47 + i, 26, 1, '#8a7a5a'); }
  }
  // crank wheel
  disc(212, 38, 7, C.ironD); disc(212, 38, 5, C.iron);
  const ca = AN.wAng, cx = 212 + Math.cos(ca) * 12, cy = 38 + Math.sin(ca) * 12;
  line(212, 38, cx, cy, C.ironD, 3); disc(cx, cy, 3, C.woodL);
  // tub
  oval(160, 150, 64, 7, C.enamelDD);
  R(96, 78, 128, 72, C.enamel); R(96, 78, 4, 72, C.enamelD); R(101, 78, 9, 72, C.enamelL); R(204, 78, 12, 72, C.enamelD); R(216, 78, 8, 72, C.enamelDD);
  R(96, 118, 128, 4, C.black);
  dith(196, 124, 26, 24, C.enamelDD, 3);
  // drain lever
  R(154, 144, 12, 8, C.ironD);
  if (w.drained) line(160, 150, 176, 160, C.iron, 3); else line(160, 150, 174, 136, C.iron, 3);
  // rim and inside
  oval(160, 78, 66, 12, C.enamelDD); oval(160, 77, 64, 11, C.enamel);
  if (!w.lid) {
    oval(160, 74, 60, 10, C.enamelD); oval(160, 73, 58, 9, C.enamelL); disc(160, 69, 4, C.ink); px(158, 67, C.ironL);
  } else {
    oval(160, 78, 58, 8, w.drained ? C.enamelD : C.water);
    if (!w.drained) { for (let i = 0; i < 5; i++) R(120 + i * 17 + Math.round(Math.sin(performance.now() / 500 + i) * 3), 75 + (i % 3) * 2, 8, 1, C.waterL); }
    else { if (!got('soggy')) soggy(142, 78); if (!got('penny')) coin(178, 78, 'penny'); }
    oval(268, 162, 12, 26, C.enamelDD); oval(267, 161, 10, 24, C.enamelL); disc(267, 161, 3, C.ink);
  }
  line(112, 26, 104, 36, C.paperD); tag(94, 36, money(A.tags.washer));
  shade(160, 80, 190, .8);
}
function washerSpots() {
  const w = S.washer, out = [];
  if (!w.lid) out.push({ id: 'knob', x: 100, y: 60, w: 120, h: 24, label: STR.sLidKnob, act: () => { w.lid = true; sfx.clunk(); say('wLid'); done(); } });
  else {
    out.push({ id: 'tub', x: 104, y: 68, w: 112, h: 18, label: STR.sTub, act: () => say(w.drained ? 'wEmpty' : 'wWater') });
    if (w.drained && !got('soggy')) out.push({ id: 'soggy', x: 130, y: 70, w: 24, h: 14, label: STR.i_soggy, act: () => { give('soggy'); say('got', { item: inm('soggy') }); done(); } });
    if (w.drained && !got('penny')) out.push({ id: 'penny', x: 168, y: 70, w: 20, h: 14, label: STR.i_penny, act: () => { give('penny'); say('got', { item: inm('penny') }); done(); } });
  }
  out.push({ id: 'drain', x: 144, y: 132, w: 36, h: 28, label: STR.sDrain, act: () => { if (w.drained) return say('wDrained'); w.drained = true; sfx.glug(); say('wDrain'); done(); } });
  out.push({
    id: 'rollers', x: 116, y: 26, w: 88, h: 24, label: STR.sRollers,
    act: () => say(w.noteIn ? 'wRollWait' : 'wRollers'),
    use: id => { if (id !== 'soggy') { sfx.no(); return say('wRollNo'); } useUp('soggy'); w.noteIn = true; w.feed = 0; sfx.click(); say('wRollIn'); done(); },
  });
  out.push({ id: 'wcrank', x: 200, y: 22, w: 30, h: 32, label: STR.sWCrank, act: wring });
  out.push({ id: 'tag', x: 90, y: 32, w: 30, h: 16, label: STR.sTag, act: () => say('tagSays', { price: money(A.tags.washer) }) });
  return out;
}
let lastWring = 0;
function wring() {
  const w = S.washer, now = performance.now();
  AN.wAngT += Math.PI / 3;
  if (!w.noteIn) { sfx.creak(); return say('wCrankEmpty'); }
  if (now - lastWring < A.wringGap && w.feed > 0) { w.feed--; sfx.bunch(); say('wBunch'); }
  else {
    w.feed++; sfx.creak();
    if (w.feed >= A.wringTaps) { w.noteIn = false; give('note'); solve('washer'); say('wOut'); }
    else say('wFeed');
  }
  lastWring = now; done();
}

// ----- the adding machine -----
const COLX = [100, 136, 172], keyY = n => 36 + (9 - n) * 14;
function drawAdder() {
  const a = S.adder;
  bgBench(156);
  bev(64, 30, 176, 146, C.green, C.greenL, C.greenD); R(64, 168, 176, 8, C.greenD);
  // the total window, number wheels
  bev(84, 8, 112, 22, C.greenD, C.greenL, C.ink); R(88, 11, 104, 16, C.ink);
  const t = money(a.total); text(t, 188 - tw(t, 2), 14, C.cream, 2);
  // the key bed
  R(80, 30, 112, 134, C.greenD); R(80, 30, 112, 1, C.ink);
  for (let c = 0; c < 3; c++) {
    for (let n = 1; n <= 9; n++) {
      const x = COLX[c], y = keyY(n), down = a.cols[c] === n;
      disc(x, y + 1, 6, C.ink); disc(x, y + (down ? 1 : 0), 6, down ? C.creamD : C.cream); textC(n, x + 1, y - 2 + (down ? 1 : 0), C.ink);
    }
  }
  textC('$1', COLX[0], 162, C.cream); textC('10¢', COLX[1] + 1, 162, C.cream); textC('1¢', COLX[2] + 1, 162, C.cream);
  // clear key
  disc(218, 44, 8, C.redD); disc(218, 43, 7, C.red); textC('C', 219, 41, C.white);
  // the paper tape
  R(204, 62, 30, 96, C.paper); R(204, 62, 30, 2, C.paperD); disc(219, 60, 6, C.paperD);
  a.tape.slice(-9).reverse().forEach((s, i) => text(s, 206, 148 - i * 9, /[TC]$/.test(s) ? C.red : C.ink));
  // the crank
  const ang = -1.1 + AN.aPull * 1.6;
  disc(248, 104, 5, C.ironD);
  const hx = 248 + Math.cos(ang) * 30, hy = 104 + Math.sin(ang) * 30;
  line(248, 104, hx, hy, C.iron, 3); disc(hx, hy, 4, C.woodL);
  shade(160, 90, 200, .7);
}
function adderSpots() {
  const a = S.adder, out = [];
  const cols = [STR.colD, STR.colT, STR.colC];
  for (let c = 0; c < 3; c++) for (let n = 1; n <= 9; n++)
    out.push({ id: `k${c}${n}`, x: COLX[c] - 15, y: keyY(n) - 7, w: 30, h: 14, label: fmt(STR.sAKey, { n, col: cols[c] }), act: () => { a.cols[c] = a.cols[c] === n ? 0 : n; sfx.key(); setMsg(''); done(); } });
  out.push({ id: 'clear', x: 206, y: 32, w: 26, h: 24, label: STR.sAClear, act: () => { a.total = 0; a.cols = [0, 0, 0]; a.tape.push('0.00C'); sfx.clunk(); say('aClear'); done(); } });
  out.push({ id: 'crank', x: 238, y: 60, w: 50, h: 80, label: STR.sACrank, act: addUp });
  out.push({ id: 'tape', x: 202, y: 58, w: 34, h: 102, label: STR.sATape, act: () => a.tape.length ? say('aTape', { lines: a.tape.slice(-6).join(', ') }) : say('aTapeEmpty') });
  out.push({ id: 'window', x: 84, y: 6, w: 112, h: 24, label: STR.sAWindow, act: () => say('aWindow', { total: money(a.total) }) });
  return out;
}
function addUp() {
  const a = S.adder, v = a.cols[0] * 100 + a.cols[1] * 10 + a.cols[2];
  AN.aPull = 1; sfx.creak();
  if (!v) return say('aNothing');
  a.total += v; a.tape.push((v / 100).toFixed(2) + '+'); a.tape = a.tape.slice(-20); a.cols = [0, 0, 0];
  say('aAdded', { v: money(v), total: money(a.total) });
  if (a.total === A.total) solve('adder');
  done();
}

// ----- the cash register -----
const RKX = i => 44 + i * 30, RKY = [70, 96, 122];
function drawRegister() {
  const r = S.reg;
  bgBench(160);
  // the crest and its window of pop-up flags
  R(90, 10, 140, 40, C.brass); oval(160, 12, 70, 9, C.brass); R(90, 10, 2, 40, C.brassL); R(228, 10, 2, 40, C.brassD);
  for (let i = 0; i < 6; i++) { ringO(100 + i * 24, 46, 6, 3, C.brassD, Math.PI, Math.PI * 2); }
  R(104, 14, 112, 28, '#20160c'); line(108, 16, 116, 24, '#3a2e20');
  if (r.flags === 'nosale') { R(124, 20, 72, 14, C.white); textC(STR.art_noSale, 160, 24, C.red); }
  else if (r.flags) r.flags.forEach((f, i) => { if (f) { R(110 + i * 36, 18, 30, 14, C.white); textC(f, 125 + i * 36, 23, C.ink); } });
  // the body, scrolled and stamped
  bev(14, 48, 292, 112, C.brass, C.brassL, C.brassD);
  for (let i = 0; i < 9; i++) { ringO(30 + i * 33, 54, 4, 2, C.brassD); ringO(30 + i * 33, 150, 4, 2, C.brassD); }
  dith(16, 140, 288, 18, C.brassD, 4);
  ['$1', '10¢', '1¢'].forEach((s, row) => text(s, 18, RKY[row] - 2, C.ink));
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
    const x = RKX(i), y = RKY[row], down = r.keys[row] === i + 1, lab = row === 1 ? (i + 1) * 10 : i + 1;
    disc(x, y + 2, 9, C.brassD); disc(x, y + (down ? 2 : 0), 9, C.ink); disc(x, y + (down ? 2 : 0), 8, down ? C.creamD : C.cream);
    textC(lab, x + 1, y - 2 + (down ? 2 : 0), C.ink);
  }
  // the crank on the side
  const ang = -1.2 + AN.rPull * 1.8;
  disc(302, 104, 5, C.brassD);
  const hx = 302 + Math.cos(ang) * 14, hy = 104 + Math.sin(ang) * 22;
  line(302, 104, hx, hy, C.ironD, 3); disc(hx, hy, 4, C.woodL);
  // the cash drawer
  if (r.open) {
    R(26, 166, 268, 24, C.woodDD); for (let i = 1; i < 5; i++) R(26 + i * 54, 166, 2, 24, C.woodD);
    if (!got('nickel')) coin(70, 178, 'nickel');
    if (!got('key')) brassKey(184, 178);
    bev(20, 186, 280, 14, C.wood, C.woodL, C.woodDD); disc(160, 192, 3, C.brassD);
  } else { bev(20, 160, 280, 20, C.wood, C.woodL, C.woodDD); disc(160, 170, 3, C.brassD); }
  shade(160, 90, 210, .6);
}
function registerSpots() {
  const r = S.reg, out = [], rows = [STR.rowD, STR.rowT, STR.rowC];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
    const lab = row === 1 ? `${(i + 1) * 10}¢` : row === 0 ? `$${i + 1}` : `${i + 1}¢`;
    out.push({ id: `r${row}${i}`, x: RKX(i) - 15, y: RKY[row] - 12, w: 30, h: 26, label: fmt(STR.sRKey, { label: lab }) + ', ' + rows[row], act: () => { r.keys[row] = r.keys[row] === i + 1 ? 0 : i + 1; sfx.key(); setMsg(''); done(); } });
  }
  out.push({ id: 'crank', x: 286, y: 70, w: 34, h: 70, label: STR.sRCrank, act: ring });
  out.push({ id: 'flags', x: 100, y: 10, w: 120, h: 36, label: STR.sRFlags, act: () => r.flags ? say('rFlags', { v: flagWords() }) : say('rFlagsNone') });
  if (r.open) {
    if (!got('nickel')) out.push({ id: 'nickel', x: 60, y: 168, w: 22, h: 18, label: STR.i_nickel, act: () => { give('nickel'); say('got', { item: inm('nickel') }); done(); } });
    if (!got('key')) out.push({ id: 'key', x: 176, y: 168, w: 26, h: 18, label: STR.i_key, act: () => { give('key'); say('got', { item: inm('key') }); done(); } });
    out.push({ id: 'drawer', x: 20, y: 186, w: 280, h: 14, label: STR.sRDrawer, act: () => say('rEmpty') });
  } else out.push({ id: 'drawer', x: 20, y: 160, w: 260, h: 20, label: STR.sRDrawer, act: () => say('rShut') });
  return out;
}
const flagWords = () => S.reg.flags === 'nosale' ? STR.art_noSale : S.reg.flags.filter(Boolean).join(' ');
function ring() {
  const r = S.reg, [d, t, c] = r.keys, v = d * 100 + t * 10 + c;
  AN.rPull = 1;
  r.flags = v ? [d ? '$' + d : '', t ? t * 10 + '¢' : '', c ? c + '¢' : ''] : 'nosale';
  r.keys = [0, 0, 0];
  if (v === A.total && !r.open) { r.open = true; sfx.ding(true); solve('register'); say('rOpen', { v: money(v) }); }
  else { sfx.ding(false); say(v ? 'rRang' : 'rNoSale', { v: money(v) }); }
  done();
}

// ----- the dresser -----
const DRAWER_Y = [40, 80, 120];
function drawDresser() {
  const d = S.dresser, f = face.dresser;
  bgFloor();
  if (f === 0) {
    bev(96, 24, 128, 7, C.woodL, '#d09a5a', C.woodD); R(100, 31, 120, 130, C.wood);
    for (let y = 34; y < 160; y += 7) R(102, y, 2 + (y * 7 % 11), 1, C.woodD);
    R(100, 160, 120, 14, C.woodD); R(102, 174, 10, 10, C.woodDD); R(208, 174, 10, 10, C.woodDD);
    // closed drawers from the bottom up, then the open one on top
    for (let i = 2; i >= 0; i--) if (d.open !== i) drawerFront(i, 0);
    if (d.open !== null) {
      const i = d.open, y = DRAWER_Y[i];
      const deep = i === 2 ? 5 : 14;
      R(106, y - 2, 108, 18, C.woodDD);
      R(108, y + 16 - deep, 104, deep, C.woodD); R(108, y + 16 - deep, 104, 1, C.woodDD);
      if (i === 2) R(108, y - 2, 104, 18 - deep, C.wood);   // the back board, close: shallow
      if (i === 0) { R(116, y + 6, 22, 8, C.paper); R(140, y + 4, 18, 9, C.paperD); R(162, y + 7, 24, 7, C.paper); for (let k = 0; k < 3; k++) R(119, y + 8 + k * 2, 14, 1, '#8a7a5a'); }
      if (i === 1 && !got('crank')) { R(130, y + 8, 40, 3, C.iron); R(168, y + 2, 3, 9, C.iron); R(166, y, 7, 4, C.woodL); }
      drawerFront(i, 14);
    }
  } else if (f === 1) {
    bev(70, 24, 180, 7, C.woodL, '#d09a5a', C.woodD); R(74, 31, 172, 130, C.wood);
    bev(84, 40, 152, 112, C.wood, C.woodD, C.woodL); bev(90, 46, 140, 100, C.wood, C.woodL, C.woodD);
    R(74, 160, 172, 14, C.woodD); R(76, 174, 10, 10, C.woodDD); R(234, 174, 10, 10, C.woodDD);
  } else {
    R(98, 24, 124, 152, C.ink); R(100, 24, 120, 150, '#a8865a');
    for (let x = 100; x < 220; x += 20) { R(x, 24, 1, 150, '#6e5434'); for (let y = 30; y < 170; y += 13) R(x + 4 + (y % 9), y, 6, 1, '#8e6e46'); }
    R(100, 24, 120, 3, '#c9a878');
    R(102, 174, 10, 10, C.woodDD); R(208, 174, 10, 10, C.woodDD);
    if (d.panel) {
      R(136, 124, 48, 34, '#120a05');
      if (!got('sash')) { bev(142, 140, 36, 9, C.iron, C.ironL, C.ironD); textC('4', 160, 142, C.ironL); }
      bev(186, 124, 48, 34, C.wood, C.woodL, C.woodDD);
    } else bev(136, 124, 48, 34, C.wood, C.woodL, C.woodDD);
    if (d.latch) { R(158, 108, 5, 22, C.woodL); px(160, 119, C.ink); }
    else { R(150, 118, 22, 5, C.woodL); px(160, 120, C.ink); }
  }
  shade(160, 80, 190, .8);
}
function drawerFront(i, out) {
  const y = DRAWER_Y[i] + out, gx = out ? 4 : 0;
  bev(108 - gx, y, 104 + 2 * gx, 34, C.wood, C.woodL, C.woodDD);
  bev(112 - gx, y + 4, 96 + 2 * gx, 26, C.wood, C.woodD, C.woodL);
  disc(134 - gx, y + 17, 3, C.brassD); disc(134 - gx, y + 16, 2, C.brass);
  disc(186 + gx, y + 17, 3, C.brassD); disc(186 + gx, y + 16, 2, C.brass);
  if (i === 1 && !S.dresser.unlocked) { R(157, y + 12, 7, 10, C.brass); R(159, y + 14, 3, 3, C.ink); R(160, y + 17, 1, 3, C.ink); }
  if (i === 0) { line(132 - gx, y + 18, 124 - gx, y + 26, C.paperD); tag(110 - gx, y + 26, money(A.tags.dresser)); }
}
function dresserSpots() {
  const d = S.dresser, f = face.dresser, out = [];
  if (f === 0) {
    const names = [STR.sDTop, STR.sDMid, STR.sDBot];
    if (d.open !== null) {
      const i = d.open, y = DRAWER_Y[i];
      if (i === 1 && !got('crank')) out.push({ id: 'crank', x: 126, y: y - 2, w: 52, h: 16, label: STR.i_crank, act: () => { give('crank'); say('got', { item: inm('crank') }); done(); } });
      else out.push({ id: 'in', x: 108, y: y - 2, w: 104, h: 16, label: STR.sDIn, act: () => say(i === 0 ? 'dTopIn' : i === 2 ? 'dShallow' : 'dEmpty') });
    }
    for (let i = 0; i < 3; i++) {
      const y = DRAWER_Y[i] + (d.open === i ? 14 : 0);
      out.push({
        id: 'd' + i, x: 106, y, w: 108, h: 34, label: names[i],
        act: () => {
          if (i === 1 && !d.unlocked) { sfx.no(); return say('dLocked'); }
          d.open = d.open === i ? null : i; sfx.creak();
          if (d.open === 2) say('dShallow'); else if (d.open === 0) say('dTopIn'); else setMsg('');
          done();
        },
        use: i === 1 && !d.unlocked ? id => { if (id !== 'key') { sfx.no(); return say('dLocked'); } useUp('key'); d.unlocked = true; d.open = 1; sfx.clunk(); solve('drawer'); say('dUnlock'); done(); } : null,
      });
    }
    out.push({ id: 'tag', x: 104, y: DRAWER_Y[0] + 24 + (d.open === 0 ? 14 : 0), w: 30, h: 14, label: STR.sTag, act: () => say('tagSays', { price: money(A.tags.dresser) }) });
  } else if (f === 1) {
    out.push({ id: 'side', x: 74, y: 30, w: 172, h: 140, label: STR.sDSide, act: () => say('dSide') });
  } else {
    out.push({ id: 'latch', x: 146, y: 104, w: 30, h: 30, label: STR.sDLatch, act: () => { d.latch = !d.latch; sfx.click(); say(d.latch ? 'dLatch' : 'dLatchBack'); done(); } });
    if (d.panel && !got('sash')) out.push({ id: 'sash', x: 138, y: 134, w: 44, h: 20, label: STR.i_sash, act: () => { give('sash'); say('got', { item: inm('sash') }); done(); } });
    out.push({
      id: 'panel', x: d.panel ? 186 : 136, y: 136, w: 48, h: 24, label: STR.sDPanel,
      act: () => {
        if (d.panel) return say('dPanelOpen');
        if (!d.latch) { sfx.no(); return say('dStuck'); }
        d.panel = true; sfx.creak(); solve('secret'); say('dPanel'); done();
      },
    });
  }
  return out;
}

// ----- the balance scale -----
const TRAYX = [214, 236, 258, 280];
function weightSprite(id, cx, by) {   // bottom centre at cx, by
  const n = A.weights[id];
  if (id === 'flatiron') { R(cx - 10, by - 5, 20, 5, C.ironD); R(cx - 8, by - 7, 14, 2, C.iron); R(cx - 6, by - 12, 2, 6, C.ironD); R(cx + 2, by - 12, 2, 6, C.ironD); R(cx - 6, by - 13, 10, 2, C.ironD); textC(n, cx, by - 5, C.ironL); }
  if (id === 'horseshoe') { R(cx - 7, by - 13, 4, 12, C.rust); R(cx + 3, by - 13, 4, 12, C.rust); R(cx - 6, by - 3, 12, 3, C.rust); px(cx - 6, by - 10, C.rustL); textC(n, cx, by - 9, C.paper); }
  if (id === 'insulator') { oval(cx, by - 11, 5, 3, C.glass); R(cx - 5, by - 11, 11, 7, C.glass); R(cx - 7, by - 4, 15, 4, C.glassD); px(cx - 3, by - 9, C.glassL); textC(n, cx + 1, by - 9, C.glassL); }
  if (id === 'sash') { bev(cx - 12, by - 7, 24, 7, C.iron, C.ironL, C.ironD); textC(n, cx, by - 6, C.ironL); }
}
function drawScale(now) {
  const s = S.scale;
  bgFloor();
  bev(20, 166, 280, 8, C.woodL, '#d09a5a', C.woodD); R(30, 174, 6, 26, C.woodD); R(284, 174, 6, 26, C.woodD);
  // base, drawer and post
  bev(124, 150, 72, 16, C.iron, C.ironL, C.ironD);
  if (s.open) { R(140, 163, 40, 3, '#120a05'); bev(138, 166, 44, 14, C.woodD, C.wood, C.woodDD); if (!got('dime')) coin(160, 171, 'dime'); }
  else bev(144, 155, 32, 9, C.woodD, C.wood, C.woodDD);
  R(157, 40, 6, 112, C.brass); R(157, 40, 2, 112, C.brassL); R(162, 40, 1, 112, C.brassD);
  const k = Math.round(AN.tilt);
  line(70, 44 + k, 250, 44 - k, C.brassD, 3); line(70, 43 + k, 250, 43 - k, C.brass, 2);
  disc(160, 44, 4, C.brassD); disc(160, 43, 2, C.brassL);
  for (const [ex, ey] of [[70, 44 + k], [250, 44 - k]]) { line(ex, ey, ex - 26, ey + 46, C.ironL); line(ex, ey, ex + 26, ey + 46, C.ironL); }
  const ly = 92 + k, ry = 92 - k;
  oval(70, ly, 30, 5, C.brassD); oval(70, ly - 1, 28, 4, C.brass);
  oval(250, ry, 30, 5, C.brassD); oval(250, ry - 1, 28, 4, C.brass);
  // the sack
  oval(70, ly - 18, 16, 6, C.sack); R(54, ly - 18, 33, 16, C.sack); R(54, ly - 4, 33, 2, C.sackD); R(66, ly - 26, 8, 4, C.sackD);
  textC(STR.art_sack, 71, ly - 14, C.ink);
  // the right pan's load
  s.pan.forEach((id, i) => weightSprite(id, 250 + [-13, 13, -13, 13][i], ry - 2 - (i > 1 ? 13 : 0)));
  // the tray
  bev(204, 154, 94, 10, C.wood, C.woodL, C.woodDD);
  s.tray.forEach((id, i) => weightSprite(id, TRAYX[i], 156));
  line(163, 60, 174, 66, C.paperD); tag(170, 66, money(A.tags.scale));
  shade(160, 80, 200, .7);
}
const panWeight = () => S.scale.pan.reduce((t, id) => t + A.weights[id], 0);
function scaleSpots() {
  const s = S.scale, out = [], k = Math.round(AN.tilt), ry = 92 - k;
  s.tray.forEach((id, i) => out.push({
    id: 'tray-' + id, x: TRAYX[i] - 11, y: 138, w: 22, h: 26, label: fmt(STR.sSTray, { item: STR['i_' + id], w: A.weights[id] }),
    act: () => { if (s.pan.length >= 4) return say('sFull'); s.tray.splice(s.tray.indexOf(id), 1); s.pan.push(id); sfx.clunk(); say('sPut', { item: inm(id), w: A.weights[id] }); weigh(); done(); },
  }));
  const putSash = id => { if (id !== 'sash') return false; if (s.pan.length >= 4) return say('sFull'); useUp('sash'); s.pan.push('sash'); sfx.clunk(); say('sPut', { item: inm('sash'), w: A.weights.sash }); weigh(); done(); };
  out.push({ id: 'pan', x: 218, y: ry - 34, w: 64, h: 40, label: fmt(STR.sSPan, { w: panWeight() }), act: () => say('sSPan', { w: panWeight() }), use: putSash });
  // after the pan, so they sit on top of it: listed first, the pan covered
  // them and a tap on a weight only said what the pan held (found 26 Nov)
  s.pan.forEach((id, i) => out.push({
    id: 'pan-' + id, x: 250 + [-13, 13, -13, 13][i] - 12, y: ry - 16 - (i > 1 ? 13 : 0), w: 24, h: 15, label: fmt(STR.sSOn, { item: STR['i_' + id], w: A.weights[id] }),
    act: () => { s.pan.splice(s.pan.indexOf(id), 1); s.tray.push(id); sfx.click(); say('sOff', { item: inm(id) }); weigh(); done(); },
  }));
  out.push({ id: 'trayAll', x: 200, y: 164, w: 100, h: 10, label: STR.sSTrayAll, act: () => setMsg(''), use: putSash });
  out.push({ id: 'sack', x: 40, y: 60 + k, w: 60, h: 36, label: STR.sSSack, act: () => say('sSack') });
  if (s.open && !got('dime')) out.push({ id: 'dime', x: 148, y: 164, w: 24, h: 18, label: STR.i_dime, act: () => { give('dime'); say('got', { item: inm('dime') }); done(); } });
  else out.push({ id: 'drawer', x: 140, y: 150, w: 40, h: 18, label: STR.sSDrawer, act: () => say(s.open ? 'dEmpty' : 'sDrawerShut') });
  out.push({ id: 'tag', x: 166, y: 62, w: 32, h: 16, label: STR.sTag, act: () => say('tagSays', { price: money(A.tags.scale) }) });
  return out;
}
function weigh() {
  if (panWeight() === A.sack && !S.scale.open) { S.scale.open = true; setTimeout(() => { sfx.clunk(); solve('scale'); say('sOpen'); refresh(); }, 600); }
}

// ----- the meat grinder -----
const PARTS = [
  { id: 'ring71', kind: 'ring', no: 71 }, { id: 'screw22', kind: 'screw', no: 22 }, { id: 'plate71', kind: 'plate', no: 71 },
  { id: 'blade', kind: 'blade', no: 0 }, { id: 'ring22', kind: 'ring', no: 22 }, { id: 'screw71', kind: 'screw', no: 71 }, { id: 'plate22', kind: 'plate', no: 22 },
];
const partX = i => 26 + i * 44;
function partSprite(p, cx, cy) {
  const big = p.no === 71 ? 1.35 : 1;
  if (p.kind === 'screw') { const l = Math.round(13 * big); R(cx - l, cy - 3, 2 * l, 6, C.ironL); for (let x = -l + 2; x < l; x += 4) line(cx + x, cy - 3, cx + x + 2, cy + 2, C.iron); R(cx - l - 4, cy - 1, 4, 3, C.iron); }
  if (p.kind === 'blade') { R(cx - 9, cy - 1, 19, 3, C.steel); R(cx - 1, cy - 9, 3, 19, C.steel); disc(cx, cy, 2, C.steelD); px(cx - 8, cy - 1, C.steelL); }
  if (p.kind === 'plate') { const r = Math.round(8 * big); disc(cx, cy, r, C.steelD); disc(cx, cy, r - 1, C.steel); for (let a = 0; a < 6; a++) px(Math.round(cx + Math.cos(a) * (r - 4)), Math.round(cy + Math.sin(a) * (r - 4)), C.ink); px(cx, cy, C.ink); }
  if (p.kind === 'ring') { const r = Math.round(9 * big); disc(cx, cy, r, C.ironD); disc(cx, cy, r - 1, C.iron); disc(cx, cy, r - 4, C.woodL); ringO(cx, cy, r - 1, r - 1, C.ironL, Math.PI, Math.PI * 1.5); }
  if (p.no) textC(p.no, cx + 1, cy + 14, C.woodDD);
}
function drawGrinder(now) {
  const gr = S.grinder;
  bgBench(130);
  R(0, 128, W, 4, C.woodD);
  // clamp under the counter edge
  R(104, 84, 14, 60, C.iron); R(98, 140, 26, 4, C.ironD); R(108, 144, 6, 10, C.ironD); R(102, 152, 18, 3, C.iron);
  // hopper and barrel
  for (let y = 30; y < 56; y++) { const hw = Math.round(24 - (y - 30) * .5); R(122 - hw, y, 2 * hw, 1, C.iron); px(122 - hw, y, C.ironL); px(121 + hw, y, C.ironD); }
  oval(122, 30, 24, 3, C.ironD); oval(122, 30, 22, 2, C.ink);
  R(88, 56, 104, 30, C.iron); R(88, 58, 104, 3, C.ironL); R(88, 80, 104, 6, C.ironD);
  for (const x of [100, 150, 176]) R(x, 56, 2, 30, C.ironD);
  text(STR.art_no22, 112, 66, C.ironL);
  oval(192, 71, 5, 15, C.ironD); oval(192, 71, 3, 12, C.ink);
  const b = gr.built;
  if (b.includes('screw')) { R(192, 67, 10, 8, C.ironL); line(194, 67, 196, 74, C.iron); line(198, 67, 200, 74, C.iron); }
  if (b.includes('blade')) { R(202, 60, 3, 22, C.steelL); R(198, 70, 11, 3, C.steelL); }
  if (b.includes('plate')) { oval(206, 71, 3, 15, C.steelD); oval(206, 71, 2, 14, C.steel); for (let j = -10; j <= 10; j += 5) px(206, 71 + j, C.ink); }
  if (b.includes('ring')) { oval(209, 71, 4, 17, C.ironD); oval(209, 71, 3, 16, C.iron); oval(209, 71, 2, 12, C.steel); }
  if (gr.out && !got('chart')) { R(212, 67, 22, 7, C.paper); R(212, 67, 22, 1, C.white); R(232, 67, 2, 7, C.paperD); }
  // the crank
  disc(86, 71, 6, C.ironD);
  if (gr.crank) { const a = AN.gAng, hx = 86 + Math.cos(a) * 24, hy = 71 + Math.sin(a) * 24; line(86, 71, hx, hy, C.iron, 4); R(hx - 3, hy - 8, 6, 10, C.woodL); }
  // the parts on the counter
  PARTS.forEach((p, i) => { if (!b.includes(p.kind) || !isBuiltPart(p)) partSprite(p, partX(i), 160); });
  shade(160, 90, 200, .7);
}
const isBuiltPart = p => p.no !== 71 && S.grinder.built.includes(p.kind);
function grinderSpots() {
  const gr = S.grinder, out = [];
  PARTS.forEach((p, i) => {
    if (isBuiltPart(p)) return;
    const label = p.kind === 'blade' ? STR.sGBlade : fmt(STR.sGPart, { part: STR['p_' + p.kind], no: p.no });
    out.push({ id: p.id, x: partX(i) - 21, y: 140, w: 42, h: 42, label, act: () => fitPart(p) });
  });
  const crankAct = () => {
    if (!gr.crank) { sfx.no(); return say('gNoCrank'); }
    AN.gAngT += Math.PI * .8; sfx.creak();
    if (gr.built.length < 4) return say('gSpin');
    if (gr.out) return say('gTurn');
    gr.turns++;
    if (gr.turns >= A.grinderTurns) { gr.out = true; say('gOut'); } else say('gTurn');
    done();
  };
  out.push({ id: 'crank', x: 56, y: 40, w: 46, h: 62, label: STR.sGCrank, act: crankAct, use: id => { if (id !== 'crank' || gr.crank) return false; useUp('crank'); gr.crank = true; sfx.clunk(); say('gAttach'); done(); } });
  out.push({ id: 'body', x: 102, y: 26, w: 88, h: 62, label: STR.sGBody, act: () => say('gBody'), use: id => { if (id !== 'crank' || gr.crank) return false; useUp('crank'); gr.crank = true; sfx.clunk(); say('gAttach'); done(); } });
  if (gr.out && !got('chart')) out.push({ id: 'note', x: 208, y: 60, w: 32, h: 22, label: STR.sGNote, act: () => { give('chart'); solve('grinder'); say('got', { item: inm('chart') }); done(); } });
  return out;
}
function fitPart(p) {
  const gr = S.grinder, need = A.build[gr.built.length];
  if (p.no && p.no !== A.grinderNo) { sfx.no(); return say('gWrong', { no: p.no }); }
  if (p.kind !== need) {
    sfx.no();
    const order = A.build.indexOf(p.kind), first = A.build[gr.built.length];
    return say(first === 'screw' ? 'gNeedScrew' : first === 'blade' ? 'gNeedBlade' : order > A.build.indexOf('plate') ? 'gNeedPlate' : 'gNeedBlade');
  }
  gr.built.push(p.kind); sfx.clunk(); say('gOn'); done();
}

// ----- the ship -----
// a filled triangle, row by row
function tri(x0, y0, x1, y1, x2, y2, c) {
  const P = [[x0, y0], [x1, y1], [x2, y2]];
  for (let y = Math.min(y0, y1, y2); y <= Math.max(y0, y1, y2); y++) {
    const xs = [];
    for (let i = 0; i < 3; i++) { const [ax, ay] = P[i], [bx, by] = P[(i + 1) % 3]; if ((y >= ay && y < by) || (y >= by && y < ay)) xs.push(ax + (y - ay) * (bx - ax) / (by - ay)); }
    if (xs.length >= 2) { const l = Math.min(...xs), r = Math.max(...xs); R(l, y, r - l + 1, 1, c); }
  }
}
// The flag hoist hangs from the mainmast's top down to the stern, on the side
// the ship shows when it's turned round. FLAG_AT gives each flag's top left.
const HOIST = [[158, 8], [262, 114]];
const FLAG_AT = i => { const t = .14 + i * .19; return [Math.round(HOIST[0][0] + (HOIST[1][0] - HOIST[0][0]) * t) - 10, Math.round(HOIST[0][1] + (HOIST[1][1] - HOIST[0][1]) * t) + 1]; };
const MASTS = [[108, 22, 3], [160, 8, 4], [210, 18, 3]];   // x, top, sails
function sail(mx, y0, h, wTop, wBot) {
  for (let j = 0; j < h; j++) { const w = Math.round(wTop + (wBot - wTop) * j / h); R(mx + 1 - (w >> 1), y0 + j, w, 1, j === h - 1 ? C.creamD : C.cream); R(mx + 1 + (w >> 1) - 3, y0 + j, 3, 1, C.creamD); }
  R(mx + 1 - (wTop >> 1) - 3, y0 - 1, wTop + 6, 2, C.woodD);
}
function drawShip(now) {
  const f = face.ship;
  cached('bgShip', r => { planks(0, 0, W, 170, 16, r); R(0, 170, W, 30, C.woodDD); bev(10, 166, 300, 8, C.woodL, '#d09a5a', C.woodD); R(30, 174, 6, 14, C.woodD); R(284, 174, 6, 14, C.woodD); });
  G.save();
  if (f === 1) { G.translate(W, 0); G.scale(-1, 1); }
  R(120, 148, 5, 18, C.brass); R(196, 148, 5, 18, C.brass);
  // jibs out to the bowsprit, then masts and sails
  line(276, 116, 314, 96, C.woodD, 2);
  tri(213, 30, 213, 108, 290, 106, C.cream); tri(216, 46, 216, 104, 306, 100, C.creamD);
  for (const [mx, top, n] of MASTS) {
    R(mx, top, 3, 120 - top, C.woodD); R(mx, top, 1, 120 - top, C.woodL);
    let y = 112;
    for (let k = 0; k < n; k++) { const h = [26, 22, 18, 12][k], wb = [46, 40, 33, 24][k]; y -= h; sail(mx, y, h, wb - 6, wb); y -= 2; }
  }
  for (const [mx, top] of MASTS) { line(mx + 1, top, 58, 112, '#2a1a10'); line(mx + 1, top, 300, 99, '#2a1a10'); }
  // the hull: a raised stern on the left, the bow raking up on the right
  bev(54, 106, 58, 12, C.woodL, '#d09a5a', C.woodD);
  for (let y = 116; y < 152; y++) {
    const t = (y - 116) / 36, l = 54 + Math.round(t * t * 46), rr = 282 - Math.round(Math.pow(t, 1.3) * 62);
    const col = y < 120 ? C.woodL : y < 126 ? C.woodDD : y < 128 ? C.brassL : y < 135 ? '#c9a03a' : y < 143 ? C.woodDD : C.ink;
    R(l, y, rr - l, 1, col);
  }
  for (let x = 84; x < 252; x += 14) R(x, 129, 5, 4, C.ink);
  G.restore();
  if (f === 0) {
    R(136, 52, 3, 7, C.blue); R(136, 52, 3, 1, C.ink);   // a corner of a flag, peeking from the far side
    bev(104, 178, 112, 14, C.brass, C.brassL, C.brassD); textC(STR.art_plaque, 160, 183, C.ink);
    line(312, 98, 306, 110, C.paperD); tag(290, 110, money(A.tags.ship));
  } else {
    line(HOIST[0][0], HOIST[0][1], HOIST[1][0], HOIST[1][1], C.ink);
    [...A.flags].forEach((L, i) => { const [x, y] = FLAG_AT(i); R(x - 1, y - 1, 22, 15, C.ink); flag(L, x, y, 20, 13); });
  }
  shade(160, 90, 210, .6);
}
function shipSpots() {
  if (face.ship === 0) return [
    { id: 'ship', x: 56, y: 8, w: 220, h: 144, label: STR.sSail, act: () => say('shipSays') },
    { id: 'plaque', x: 104, y: 176, w: 112, h: 18, label: STR.sPlaque, act: () => say('plaque') },
    { id: 'tag', x: 286, y: 106, w: 34, h: 16, label: STR.sTag, act: () => say('tagSays', { price: money(A.tags.ship) }) },
  ];
  return [
    { id: 'ship', x: 40, y: 100, w: 200, h: 52, label: STR.sSail, act: () => say('shipSays') },
    ...[...A.flags].map((L, i) => ({ id: 'flag' + i, x: FLAG_AT(i)[0] - 3, y: FLAG_AT(i)[1] - 3, w: 26, h: 19, label: fmt(STR.sFlag, { n: i + 1, desc: STR['f' + L] }), act: () => say(fmt(STR.sFlag, { n: i + 1, desc: STR['f' + L] }) + '.') })),
  ];
}

// ----- the crate -----
const DIALX = [128, 160, 192], DIAL = [[C.steelL, C.steelD, 'colSilver'], [C.greenL, C.greenD, 'colGreen'], [C.redL, C.redD, 'colRed']];
const WHEELX = [106, 142, 178, 214];
const chev = (cx, y, up, c) => { for (let i = 0; i < 6; i++) { const k = up ? i : 5 - i; R(cx - k, y + i - 1, 2 * k + 1, 1, c); } };
function drawCrate() {
  const c = S.crate;
  bgFloor();
  if (c.lid) {
    R(36, 18, 248, 46, C.wood); for (let y = 18; y < 64; y += 11) R(36, y, 248, 1, C.woodDD);
    R(36, 64, 248, 128, C.woodDD); R(40, 68, 240, 120, '#2a1a0c');
    dith(40, 140, 240, 50, '#c9a84a', 2); dith(41, 160, 238, 30, '#e0c060', 3);
    for (let i = 0; i < 30; i++) { const x = 44 + (i * 53) % 232, y = 132 + (i * 29) % 52; line(x, y, x + 6, y - 3, '#e8cc70'); }
    bev(70, 86, 180, 84, C.wood, C.woodL, C.woodDD);
    for (const [x, y] of [[70, 86], [244, 86], [70, 164], [244, 164]]) R(x, y, 6, 6, C.brass);
    if (!c.box) {
      R(80, 92, 160, 2, C.woodDD);
      c.wheels.forEach((l, i) => {
        const x = WHEELX[i];
        chev(x, 98, true, C.brassL);
        R(x - 13, 106, 26, 34, C.brassD); R(x - 10, 109, 20, 28, C.cream); R(x - 10, 109, 20, 3, C.creamD); R(x - 10, 134, 20, 3, C.creamD);
        textC(String.fromCharCode(65 + l), x + 1, 116, C.ink, 3);
        chev(x, 146, false, C.brassL);
      });
    } else {
      R(74, 90, 172, 76, '#2a1a0c'); bev(70, 66, 180, 22, C.wood, C.woodL, C.woodDD);
      if (!got('letter')) { R(96, 104, 70, 46, C.paper); line(96, 104, 131, 126, C.paperD); line(166, 104, 131, 126, C.paperD); disc(131, 128, 4, C.red); R(176, 120, 6, 6, C.ironD); R(182, 122, 44, 3, C.iron); R(214, 125, 3, 6, C.iron); R(220, 125, 3, 5, C.iron); ringO(176, 123, 8, 8, C.iron); }
    }
  } else if (face.crate === 0) {
    R(36, 40, 248, 152, C.wood);
    for (let y = 40; y < 192; y += 25) { R(36, y, 248, 2, C.woodDD); R(36, y + 2, 248, 1, C.woodL); for (let x = 50; x < 280; x += 37) R(x, y + 8 + (x % 7), 10, 1, C.woodD); }
    R(36, 40, 18, 152, C.woodD); R(266, 40, 18, 152, C.woodD); R(36, 40, 2, 152, C.woodL);
    for (const x of [44, 274]) for (const y of [50, 182]) disc(x, y, 1, C.ironL);
    text(STR.art_up, 60, 172, 'rgba(30,18,8,.55)', 2);
    // the hasp and padlock
    R(150, 34, 20, 34, C.ironD); R(152, 36, 16, 30, C.iron);
    const up = c.unlocked ? 10 : 0;
    R(112, 52 - up, 8, 22 + up, C.steelD); R(200, 52, 8, 22, C.steelD); ringO(160, 52 - up, 44, 18, C.steelD, Math.PI, Math.PI * 2); ringO(160, 53 - up, 42, 17, C.steel, Math.PI, Math.PI * 2);
    bev(100, 70, 120, 92, C.brass, C.brassL, C.brassD); dith(102, 150, 116, 10, C.brassD, 3);
    c.lock.forEach((d, i) => {
      const x = DIALX[i], [rim, dark] = DIAL[i];
      chev(x, 84, true, C.brassD);
      R(x - 13, 94, 26, 34, dark); R(x - 11, 96, 22, 30, rim); R(x - 8, 99, 16, 24, C.ink);
      textC(d, x + 1, 104, C.white, 3);
      chev(x, 134, false, C.brassD);
    });
  } else {
    R(36, 40, 248, 152, C.wood);
    for (let x = 36; x < 284; x += 31) { R(x, 40, 2, 152, C.woodDD); R(x + 2, 40, 1, 152, C.woodL); }
    R(36, 40, 248, 16, C.woodD); R(36, 176, 248, 16, C.woodD);
    R(120, 76, 80, 54, C.paper); R(120, 128, 80, 2, C.paperD); disc(160, 80, 2, C.ironD);
    for (let i = 0; i < 5; i++) R(128, 88 + i * 7, 40 + ((i * 17) % 24), 1, '#4a3a2a');
  }
  shade(160, 100, 200, .7);
}
function crateSpots() {
  const c = S.crate, out = [];
  if (c.lid) {
    if (!c.box) c.wheels.forEach((l, i) => {
      const L = String.fromCharCode(65 + l);
      out.push({ id: 'wu' + i, x: WHEELX[i] - 17, y: 92, w: 34, h: 26, label: fmt(STR.sCWUp, { n: i + 1, l: L }), act: () => turnWheel(i, 1) });
      out.push({ id: 'wd' + i, x: WHEELX[i] - 17, y: 128, w: 34, h: 26, label: fmt(STR.sCWDown, { n: i + 1, l: L }), act: () => turnWheel(i, -1) });
    });
    else if (!got('letter')) out.push({ id: 'letter', x: 92, y: 100, w: 140, h: 54, label: STR.sCLetter, act: takeLetter });
    return out;
  }
  if (face.crate === 0) {
    if (!c.unlocked) c.lock.forEach((d, i) => {
      const col = STR[DIAL[i][2]];
      out.push({ id: 'lu' + i, x: DIALX[i] - 16, y: 76, w: 32, h: 30, label: fmt(STR.sCUp, { col, d }), act: () => turnDial(i, 1) });
      out.push({ id: 'ld' + i, x: DIALX[i] - 16, y: 118, w: 32, h: 30, label: fmt(STR.sCDown, { col, d }), act: () => turnDial(i, -1) });
    });
    out.push({ id: 'lid', x: 36, y: 40, w: 248, h: 28, label: STR.sCLid, act: () => { if (!c.unlocked) { sfx.no(); return say('cLocked'); } c.lid = true; sfx.creak(); say('cLid'); done(); } });
    out.push({ id: 'lock', x: 100, y: 150, w: 120, h: 14, label: STR.sCLock, act: () => say(c.unlocked ? 'cUnlocked' : 'cLocked') });
  } else out.push({ id: 'note', x: 116, y: 72, w: 88, h: 62, label: STR.sCNote, act: () => readCard('crate') });
  return out;
}
function turnDial(i, step) {
  const c = S.crate; c.lock[i] = (c.lock[i] + step + 10) % 10; sfx.click(); setMsg('');
  if (c.lock.join() === A.lock.join()) { c.unlocked = true; setTimeout(() => sfx.clunk(), 120); solve('lock'); say('cUnlocked'); }
  done();
}
function turnWheel(i, step) {
  const c = S.crate; c.wheels[i] = (c.wheels[i] + step + 26) % 26; sfx.click(); setMsg('');
  if (c.wheels.map(n => String.fromCharCode(65 + n)).join('') === A.flags) { c.box = true; setTimeout(() => sfx.ding(true), 120); solve('box'); say('cBox'); }
  done();
}
function takeLetter() { give('letter'); S.done = true; save(); refresh(); readCard('letter'); }

// ----- the parking meters -----
const MX = [60, 160, 260], MCOL = [[C.steel, C.steelL, C.steelD], [C.green, C.greenL, C.greenD], [C.red, C.redL, C.redD]];
function drawMeters() {
  bgFloor();
  for (let i = 0; i < 3; i++) {
    const c = MX[i], [b, l, d] = MCOL[i];
    R(c - 5, 112, 10, 70, C.ironD); R(c - 5, 112, 3, 70, C.iron); R(c - 14, 178, 28, 6, C.ironD);
    oval(c, 34, 34, 18, d); oval(c, 33, 33, 17, b); R(c - 34, 34, 68, 78, b); R(c - 34, 34, 2, 78, d); R(c - 30, 26, 6, 84, l); R(c + 28, 34, 6, 78, d);
    // the dial window
    oval(c, 56, 26, 22, C.ink); oval(c, 56, 24, 20, '#e8ecdc');
    for (let n = 0; n <= 9; n++) {
      const a = Math.PI - n / 9 * Math.PI, x = c + Math.cos(a) * 20, y = 63 - Math.sin(a) * 19;
      textC(n, x + 1, y - 2, C.ink); px(Math.round(c + Math.cos(a) * 14), Math.round(64 - Math.sin(a) * 13), '#8a8a7a');
    }
    const an = Math.PI - AN.needles[i] / 9 * Math.PI;
    line(c, 64, c + Math.cos(an) * 15, 64 - Math.sin(an) * 14, C.red, 2); disc(c, 64, 2, C.ink);
    if (!S.meters[i]) { R(c - 17, 68, 34, 9, C.red); textC(STR.art_expired, c + 1, 70, C.white); }
    // the coin slot plate
    bev(c - 18, 82, 36, 16, C.ironD, C.ironL, C.ink); R(c - 6, 86, 12, 2, C.ink);
    textC(STR['coin_' + A.meters[i].coin], c + 1, 90, C.paper);
    textC(STR.art_limit, c + 1, 102, d);
  }
  shade(160, 80, 200, .7);
}
function meterSpots() {
  const cols = ['colSilver', 'colGreen', 'colRed'];
  return MX.map((c, i) => {
    const m = A.meters[i], coinTxt = STR['coin_' + m.coin];
    const reads = S.meters[i] ? fmt(STR.mReads, { n: m.reads }) : STR.mExpired;
    return {
      id: 'm' + i, x: c - 36, y: 14, w: 72, h: 100, label: fmt(STR.sMeter, { col: STR[cols[i]], reads }),
      act: () => say(S.meters[i] ? fmt(STR.mReads, { n: m.reads }) : fmt(STR.mSlot, { coin: coinTxt })),
      use: id => {
        if (!['penny', 'nickel', 'dime'].includes(id)) return false;
        if (S.meters[i]) return false;
        if (id !== m.coin) { sfx.no(); return say('mWrong', { coin: coinTxt }); }
        useUp(id); S.meters[i] = true; sfx.coin(); say('mIn', { n: m.reads });
        if (S.meters.every(Boolean)) solve('meters');
        done();
      },
    };
  });
}

const VIEWS = {
  room: { title: 'vRoom', draw: drawRoom, spots: roomSpots },
  washer: { title: 'vWasher', draw: drawWasher, spots: washerSpots },
  adder: { title: 'vAdder', draw: drawAdder, spots: adderSpots },
  register: { title: 'vRegister', draw: drawRegister, spots: registerSpots },
  dresser: { title: 'vDresser', draw: drawDresser, spots: dresserSpots, faces: () => ['faceFront', 'faceSide', 'faceBack'] },
  scale: { title: 'vScale', draw: drawScale, spots: scaleSpots },
  grinder: { title: 'vGrinder', draw: drawGrinder, spots: grinderSpots },
  ship: { title: 'vShip', draw: drawShip, spots: shipSpots, faces: () => ['facePort', 'faceStar'] },
  crate: { title: 'vCrate', draw: drawCrate, spots: crateSpots, faces: () => S.crate.lid ? null : ['faceFront', 'faceTop'] },
  meters: { title: 'vMeters', draw: drawMeters, spots: meterSpots },
};

// ---------- Solving and Doc's hints ----------
function solve(id) {
  if (S.solved[id]) return;
  S.solved[id] = true; S.docOn = true; AN.cheer = performance.now();
  setTimeout(sfx.solve, 250);
}
// What Doc talks about: the thing you're looking at, if it has something
// left to do, else the first thing in the room you can get on with.
const STEPS = [
  { id: 'washer', view: 'washer', left: () => !S.solved.washer || (S.washer.drained && S.washer.lid && !got('penny')), ready: () => true,
    key: () => { const w = S.washer; if (w.noteIn) return 'washer.crank'; if (has('soggy')) return 'washer.wring'; if (w.lid && w.drained) return 'washer.take'; return 'washer.start'; } },
  { id: 'adder', view: 'adder', left: () => !S.solved.adder, ready: () => true, key: () => 'adder' },
  { id: 'register', view: 'register', left: () => !S.solved.register || (S.reg.open && (!got('key') || !got('nickel'))), ready: () => true, key: () => 'register' },
  { id: 'drawer', view: 'dresser', left: () => !S.solved.drawer || (S.dresser.unlocked && !got('crank')), ready: () => has('key') || S.dresser.unlocked, key: () => 'drawer' },
  { id: 'grinder', view: 'grinder', left: () => !S.solved.grinder, ready: () => true,
    key: () => { const gr = S.grinder; if (gr.built.length < 4) return 'grinder.parts'; if (!gr.crank) return 'grinder.crank'; if (!gr.out) return 'grinder.turn'; return 'grinder.take'; } },
  { id: 'secret', view: 'dresser', left: () => !got('sash'), ready: () => true, key: () => S.dresser.panel ? 'secret.take' : 'secret' },
  { id: 'scale', view: 'scale', left: () => !S.solved.scale || !got('dime'), ready: () => true,
    key: () => S.scale.open ? 'scale.take' : (got('sash') ? 'scale' : 'scale.short') },
  { id: 'meters', view: 'meters', left: () => !S.solved.meters, ready: () => ['penny', 'nickel', 'dime'].some(has),
    key: () => ['penny', 'nickel', 'dime'].every(c => got(c)) ? 'meters' : 'meters.short' },
  { id: 'lock', view: 'crate', left: () => !S.solved.lock, ready: () => !!S.solved.meters, key: () => 'lock' },
  { id: 'box', view: 'crate', left: () => !S.solved.box, ready: () => !!S.solved.lock, key: () => !S.crate.lid ? 'box.lid' : (got('chart') ? 'box' : 'box.nochart') },
  { id: 'box2', view: 'ship', left: () => !S.solved.box, ready: () => got('chart'), key: () => got('chart') ? 'box' : 'box.nochart' },
  { id: 'letter', view: 'crate', left: () => !got('letter'), ready: () => !!S.solved.box, key: () => 'letter' },
];
function hintNow() {
  const here = STEPS.find(s => s.view === view && s.left() && (s.ready() || view !== 'dresser'));
  const step = here || STEPS.find(s => s.left() && s.ready());
  if (!step) return STR.docDone;
  const k = step.key(), lines = HINTS[k], lvl = S.hints[k] || 0;
  S.hints[k] = lvl + 1;
  return lines[Math.min(lvl, lines.length - 1)];
}
function crankDoc() {
  const first = !S.docOn;
  S.docOn = true; AN.flick = performance.now(); AN.dCrank += Math.PI * 2;
  sfx.whirr();
  const open = STR.docOpen[(Math.random() * STR.docOpen.length) | 0];
  setMsg((first ? STR.docHello : '') + open + hintNow(), 'doc');
  save();
}

// ---------- Messages, the panel and the spots ----------
let msgWho = null;
function setMsg(t, who = null) { $('#msgText').textContent = t; msgWho = t ? who : null; $('#msgFace').hidden = msgWho !== 'doc'; }

let lastInput = 'pointer';
addEventListener('pointerdown', () => { lastInput = 'pointer'; }, true);
addEventListener('keydown', () => { lastInput = 'key'; }, true);

const done = () => { save(); refresh(); };
function refresh() {
  const v = VIEWS[view];
  const keep = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null;
  const box = $('#spots'); box.textContent = '';
  // later spots sit on top of earlier ones, so a big spot goes before the
  // small ones inside it
  for (const sp of v.spots()) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'spot'; b.dataset.id = sp.id;
    b.setAttribute('aria-label', sp.label);
    b.style.left = (sp.x / W * 100) + '%'; b.style.top = (sp.y / H * 100) + '%';
    b.style.width = (sp.w / W * 100) + '%'; b.style.height = (sp.h / H * 100) + '%';
    b.addEventListener('click', () => tapSpot(sp));
    box.append(b);
  }
  if (keep) { const again = box.querySelector(`[data-id="${CSS.escape(keep)}"]`); if (again) again.focus(); }
  const faces = v.faces && v.faces();
  $('#turnL').hidden = $('#turnR').hidden = !faces;
  $('#backBtn').hidden = view === 'room';
  const title = STR[v.title] + (faces ? ', ' + STR[faces[face[view]]] : '');
  cv.setAttribute('aria-label', title);
  // the pockets
  const inv = $('#inv'); inv.textContent = ''; inv.dataset.empty = STR.invEmpty;
  for (const id of S.inv) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'item'; b.dataset.id = 'inv-' + id;
    const held = S.held === id;
    b.setAttribute('aria-pressed', held ? 'true' : 'false');
    const img = document.createElement('img'); img.alt = ''; img.src = icon(id);
    const span = document.createElement('span'); span.textContent = STR['i_' + id];
    b.append(img, span);
    if (held) { const h = document.createElement('span'); h.className = 'held'; h.textContent = STR.held; b.append(h); }
    b.addEventListener('click', () => tapItem(id));
    inv.append(b);
  }
  if (keep && keep.startsWith('inv-')) { const again = inv.querySelector(`[data-id="${CSS.escape(keep)}"]`); if (again) again.focus(); }
  $('#soundBtn').textContent = S.sound ? '🔔' : '🔕';
  $('#soundBtn').setAttribute('aria-label', S.sound ? STR.soundBtn : STR.soundOff);
}
function tapSpot(sp) {
  const held = S.held;
  if (held && sp.use) {
    const r = sp.use(held);
    if (r !== false) return;
    sfx.no(); say('noGo', { item: inm(held) }); return;
  }
  if (held) { S.held = null; refresh(); }
  sp.act();
}
function tapItem(id) {
  if (['note', 'chart', 'letter'].includes(id)) { S.held = null; refresh(); return readCard(id); }
  if (S.held === id) { S.held = null; say('letGo', { item: inm(id) }); }
  else { S.held = id; sfx.pick(); say('holding', { item: inm(id) }); }
  refresh();
}

// ---------- Item pictures ----------
const icons = {};
function icon(id) {
  if (icons[id]) return icons[id];
  const c = document.createElement('canvas'); c.width = c.height = 24;
  const old = G; G = c.getContext('2d');
  switch (id) {
    case 'soggy': soggy(12, 13); break;
    case 'note': R(5, 4, 14, 17, C.paper); for (let i = 0; i < 5; i++) R(7, 7 + i * 3, 9, 1, '#6a5a40'); break;
    case 'chart': R(3, 5, 18, 14, C.paper); flag('S', 5, 7, 6, 4); flag('R', 13, 7, 6, 4); flag('T', 5, 13, 6, 4); flag('O', 13, 13, 6, 4); break;
    case 'letter': R(3, 6, 18, 12, C.paper); line(3, 6, 12, 13, C.paperD); line(20, 6, 12, 13, C.paperD); disc(12, 13, 2, C.red); break;
    case 'penny': case 'nickel': case 'dime': coin(12, 12, id); break;
    case 'key': brassKey(4, 12); break;
    case 'crank': R(3, 14, 15, 3, C.iron); R(16, 6, 3, 10, C.iron); R(15, 3, 5, 5, C.woodL); break;
    case 'sash': bev(2, 9, 20, 7, C.iron, C.ironL, C.ironD); textC('4', 12, 10, C.ironL); break;
  }
  G = old;
  return (icons[id] = c.toDataURL());
}
function chartImage() {
  const c = document.createElement('canvas'); c.width = 132; c.height = 52;
  const old = G; G = c.getContext('2d');
  R(0, 0, 132, 52, C.paper);
  'ADEHKORSTW'.split('').forEach((L, i) => { const x = 4 + (i % 5) * 26, y = 4 + ((i / 5) | 0) * 25; flag(L, x, y, 16, 11); text(L, x + 19, y + 3, C.ink); });
  G = old;
  return c.toDataURL();
}

// ---------- Cards ----------
let onClose = null;
function card(html, closable = true, after) {
  $('#card').innerHTML = html;
  $('#cover').hidden = false;
  onClose = closable ? () => { closeCard(); if (after) after(); } : null;
  $('#card').querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => ACTS[b.dataset.act]()));
  const go = $('#card').querySelector('.go') || $('#card').querySelector('button');
  if (go) go.focus();
}
function closeCard() { $('#cover').hidden = true; refresh(); const f = $('#spots .spot'); if (f && lastInput === 'key') f.focus(); }
const ACTS = {
  close: () => onClose ? onClose() : closeCard(),
  start: () => { S.started = true; save(); closeCard(); setMsg(STR.startHow); },
  over: () => card(`<h2 id="cardTitle">${esc(STR.overTitle)}</h2><p>${esc(STR.overLine)}</p><div class="row"><button class="btn" type="button" data-act="startCard">${esc(STR.cancel)}</button><button class="btn go" type="button" data-act="wipe">${esc(STR.overGo)}</button></div>`),
  wipe: () => { S = fresh(S); S.started = true; save(); view = 'room'; face.dresser = face.ship = face.crate = 0; AN.needles = [0, 0, 0]; AN.tilt = 0; closeCard(); setMsg(STR.startHow); },
  startCard: () => startCard(),
};
function startCard() {
  const row = S.started
    ? `<button class="btn" type="button" data-act="over">${esc(STR.startOver)}</button><button class="btn go" type="button" data-act="start">${esc(STR.startGo)}</button>`
    : `<button class="btn go" type="button" data-act="start">${esc(STR.startNew)}</button>`;
  card(`<h2 id="cardTitle">${esc(STR.title)}</h2><p>${esc(STR.startLine)}</p><p class="soft">${esc(STR.startHow)}</p><div class="row">${row}</div>`, false);
}
function readCard(id) {
  const btn = `<div class="row"><button class="btn go" type="button" data-act="close">${esc(STR.close)}</button></div>`;
  if (id === 'note') card(`<h2 id="cardTitle">${esc(STR.noteTitle)}</h2><div class="paper">${esc(STR.noteText)}<p class="sign">${esc(STR.sign)}</p></div>${btn}`);
  if (id === 'crate') card(`<h2 id="cardTitle">${esc(STR.crateTitle)}</h2><div class="paper">${esc(STR.crateText)}<p class="sign">${esc(STR.crateSign)}</p></div>${btn}`);
  if (id === 'chart') card(`<h2 id="cardTitle">${esc(STR.chartTitle)}</h2><p>${esc(STR.chartLine)}</p><img class="chart" src="${chartImage()}" alt="${esc(STR.chartAlt)}" width="132" height="52">${btn}`);
  if (id === 'letter') {
    const ducks = fmt(STR.ducks, { n: S.duck ? 1 : 0, m: 1 });
    card(`<h2 id="cardTitle">${esc(STR.letterTitle)}</h2><div class="paper">${esc(STR.letterText)}<p class="sign">${esc(STR.sign)}</p></div><p>${esc(STR.endNext)}</p><p class="soft">${esc(ducks)}</p>` +
      `<div class="row"><button class="btn" type="button" data-act="over">${esc(STR.startOver)}</button><button class="btn go" type="button" data-act="close">${esc(STR.keepLooking)}</button></div>`);
  }
}

// ---------- Moving between views ----------
let tr = null;   // the zoom: { to, from, t0, rect, out }
function go(to) {
  if (tr) return;
  const out = to === 'room', near = out ? view : to;
  tr = { from: view, to, t0: performance.now(), rect: ROOM_AT[near], out };
  view = to; S.held = null; setMsg('');
  refresh();
  if (lastInput === 'key') { const f = $('#spots .spot'); if (f) f.focus(); }
}
function turn(step) {
  const faces = VIEWS[view].faces && VIEWS[view].faces();
  if (!faces) return;
  face[view] = (face[view] + step + faces.length) % faces.length;
  sfx.creak(); setMsg(STR[VIEWS[view].title] + ', ' + STR[faces[face[view]]] + '.');
  refresh();
}

// ---------- The frame ----------
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function frame(now) {
  requestAnimationFrame(frame);   // first, so one bad frame can't stop the game
  // easing the moving parts toward where they should be
  AN.wAng += (AN.wAngT - AN.wAng) * .2;
  AN.gAng += (AN.gAngT - AN.gAng) * .15;
  AN.aPull = Math.max(0, AN.aPull - .04); AN.rPull = Math.max(0, AN.rPull - .04);
  const want = Math.max(-1, Math.min(1, A.sack - panWeight())) * 10;
  AN.tilt += (want - AN.tilt) * .12;
  A.meters.forEach((m, i) => { AN.needles[i] += ((S.meters[i] ? m.reads : 0) - AN.needles[i]) * .08; });
  if (tr) {
    const p = Math.min(1, (now - tr.t0) / 340), q = ease(tr.out ? 1 - p : p);
    const near = tr.out ? tr.from : tr.to;
    G = bufA.getContext('2d'); VIEWS.room.draw(now);
    G = bufB.getContext('2d'); VIEWS[near].draw(now);
    G = g0; g0.imageSmoothingEnabled = false;
    const [rx, ry, rw, rh] = tr.rect;
    const sw = W + (rw * 1.15 - W) * q, sh = sw * H / W;
    const sx = (rx + rw / 2 - sw / 2) * q, sy = (ry + rh / 2 - sh / 2) * q;
    g0.globalAlpha = 1; g0.drawImage(bufA, sx, sy, sw, sh, 0, 0, W, H);
    g0.globalAlpha = Math.max(0, Math.min(1, (q - .45) / .55)); g0.drawImage(bufB, 0, 0);
    g0.globalAlpha = 1;
    if (p >= 1) tr = null;
  } else { G = g0; VIEWS[view].draw(now); }
  // Doc's little face in the panel, and beside his words
  for (const id of ['docFace', 'msgFace']) {
    const c = document.getElementById(id); if (id === 'msgFace' && c.hidden) continue;
    G = c.getContext('2d'); G.clearRect(0, 0, 34, 30); docHead(2, 3, now);
  }
  G = g0;
}

// ---------- Fitting the screen ----------
// The picture is 16:10. The panel goes under it (a phone held upright) or
// beside it (sideways, and most computers), whichever leaves the picture
// bigger. The panel's height under the picture depends on how its words wrap,
// so it's measured, not guessed.
function fit() {
  const play = $('#play'), stage = $('#stage'), panel = $('#panel');
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  // clientWidth, not innerWidth: on a phone, innerWidth grows with anything
  // that sticks out, and the picture was then sized to the wider page
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  const aw = vw - 1.2 * rem - 8, ah = vh - $('#bar').offsetHeight - .6 * rem - 8;
  const pw = Math.min(19 * rem, aw * .42);
  const side = Math.min(aw - pw - .6 * rem, ah * W / H);
  play.classList.add('below'); panel.style.width = Math.min(aw, ah * W / H) + 'px';
  const ph = panel.offsetHeight;
  const below = Math.min(aw, (ah - ph - .6 * rem) * W / H);
  const useSide = side > below * 1.08 && side > 240;
  play.classList.toggle('below', !useSide);
  const w = Math.max(200, Math.floor(useSide ? side : below));
  stage.style.width = w + 'px'; stage.style.height = Math.round(w * H / W) + 'px';
  panel.style.width = useSide ? pw + 'px' : w + 'px';
}

// ---------- Keys and the controller ----------
function nav(dir) {
  const els = [...document.querySelectorAll('#spots .spot, #inv button, .acts button')].filter(e => e.offsetParent && !e.hidden);
  const at = document.activeElement;
  if (!els.includes(at)) { if (els[0]) els[0].focus(); return; }
  const r = at.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bd = 1e9;
  for (const e of els) {
    if (e === at) continue;
    const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - cx, y = q.top + q.height / 2 - cy;
    const [main, side] = dir === 'ArrowLeft' ? [-x, y] : dir === 'ArrowRight' ? [x, y] : dir === 'ArrowUp' ? [-y, x] : [y, x];
    if (main <= 2) continue;
    const d = main + Math.abs(side) * 2.2;
    if (d < bd) { bd = d; best = e; }
  }
  if (best) best.focus();
}
addEventListener('keydown', e => {
  if (!$('#cover').hidden) {
    if (e.key === 'Escape' && onClose) { e.preventDefault(); onClose(); }
    return;
  }
  if (e.key.startsWith('Arrow')) { e.preventDefault(); nav(e.key); return; }
  if (e.key === 'Escape' || e.key === 'Backspace') { if (view !== 'room') { e.preventDefault(); go('room'); } return; }
  const k = e.key.toLowerCase();
  if (k === 'h') { e.preventDefault(); crankDoc(); }
  else if (k === 'q') { e.preventDefault(); turn(-1); }
  else if (k === 'e') { e.preventDefault(); turn(1); }
});
RDG.pad({ a: ' ', b: 'Escape', y: 'h', select: 'h', l: 'q', r: 'e', zl: 'q', zr: 'e', start: 'Enter' });

// ---------- Start ----------
document.querySelectorAll('[data-s]').forEach(e => { e.textContent = STR[e.dataset.s]; });
document.querySelectorAll('[data-s-label]').forEach(e => { e.setAttribute('aria-label', STR[e.dataset.sLabel]); });
$('#backBtn').addEventListener('click', () => go('room'));
$('#turnL').addEventListener('click', () => turn(-1));
$('#turnR').addEventListener('click', () => turn(1));
$('#docBtn').addEventListener('click', crankDoc);
$('#soundBtn').addEventListener('click', () => { S.sound = !S.sound; save(); refresh(); });
addEventListener('resize', fit);
A.meters.forEach((m, i) => { AN.needles[i] = S.meters[i] ? m.reads : 0; });
AN.tilt = Math.max(-1, Math.min(1, A.sack - panWeight())) * 10;
refresh(); fit();
requestAnimationFrame(frame);
startCard();
