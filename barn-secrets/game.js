// Barn Secrets, Trello #57. A puzzle box of a barn for older kids and
// grown-ups, designed by Randi: Cottonwood Barn, a shop that buys what
// ranches and farms clear out. Doc, the old dentist's machine on the barn
// floor, is falling apart, and his pieces are somewhere in the barn. You
// look closer at the odd old things, find their drawers, dials and latches,
// and each answer opens the next. No timer, no way to fail.
//
// Version 1 (26 Nov) was one back room, a crate and a note, named The Back
// Room; with its note and locked door it was too close to The Room games.
// The rebuild the same day, from Randi's play-test: the barn in parts (the
// barn floor, the workbench, the tack room, the hayloft); papers you use
// instead of letters you read (version 1's notes were only narration); and
// Doc in the main part. Each piece of him you find and hand back lets him do
// something (his lamp lights the hayloft and shows what's scratched out, his
// arm reaches the high shelf) and brings back a memory, so the story comes
// from him.
//
// How it's drawn (decided 26 Nov; the card suggested three.js): a flat 320 x
// 200 pixel scene for each place and each close-up, drawn in code, with a few
// "faces" for things you turn round (the dresser, the ship). Real 3D was
// dropped: the clues are small numbers and letters stamped on dials and
// plates, and a pixel close-up keeps every one sharp and the same size on
// every phone, where a turning 3D model shows them at an angle, blurred,
// behind a camera you fight on a touch screen. It needs no library either.
//
// Everything you can touch is a real <button> laid over the canvas (`spots`),
// not a hit test on the canvas: the keyboard, a controller and a screen
// reader all get it for free, each says what it is, and the focus ring is the
// browser's own. They show nothing until picked with a key or a controller,
// because a puzzle box doesn't light up its secrets.
//
// Every answer is in ROOMS, so later parts of the barn add to it instead of
// editing the code that checks them. Every visible string is in STR by key.

// ---------- The answers ----------
const ROOMS = {
  barn: {
    // the soggy receipt from the washer: what was sold and for how much, in cents
    receipt: [['washer', 125], ['dresser', 105], ['scale', 240], ['ship', 315]],
    total: 785,                                                    // the receipt added up: rings the register
    // the meters left to right (silver, green, red): the coin each takes and where its needle stops
    meters: [{ coin: 'penny', reads: 3 }, { coin: 'nickel', reads: 7 }, { coin: 'dime', reads: 1 }],
    lock: [3, 7, 1],                                               // the crate's padlock, dials in the same order
    sack: 9,                                                       // the left pan
    weights: { flatiron: 3, horseshoe: 2, insulator: 1, sash: 4 }, // only 4 + 3 + 2 makes 9
    grinderNo: 22,                                                 // rusted off the grinder; only the ledger says it
    build: ['screw', 'blade', 'plate', 'ring'],                    // the grinder goes together in this order
    grinderTurns: 4,
    flags: 'HERD',                                                 // the ship's hoist, top to bottom
    wringTaps: 6,                                                  // crank taps to feed the receipt through
    wringGap: 260,                                                 // ms; quicker than this and it bunches
  },
};
const A = ROOMS.barn;
// what fills Doc's gauges, in the order the barn usually gives them up
const PUZZLES = ['washer', 'adder', 'register', 'lamp', 'ledger', 'secret', 'scale', 'meters', 'lock', 'arm', 'shelf', 'grinder', 'box', 'gauge'];
const PARTS_OF_DOC = ['lamp', 'arm', 'gauge'];

// ---------- Strings ----------
const STR = {
  title: 'Barn Secrets',
  shop: 'Cottonwood Barn',
  soundBtn: 'Sound on', soundOff: 'Sound off',
  inv: "Things you're carrying", invEmpty: 'Nothing in your pockets yet.',
  turnL: 'Turn it left', turnR: 'Turn it right', turn: 'Turn',
  back: 'Back', crankDoc: 'Crank Doc', giveDoc: 'Give to Doc',
  held: 'Holding',
  startLine: 'Cottonwood Barn buys what ranches and farms clear out, and fifty years of it is still in the barn. So is Doc, the old red dentist’s machine, and he’s falling apart.',
  startHow: 'Tap anything to look closer. Find Doc’s missing pieces and give them back to him. Crank him if you’re stuck.',
  startNew: 'Open the barn', startGo: 'Keep looking', startOver: 'Start over',
  overTitle: 'Start over?', overLine: 'Everything in the barn goes back where it was, and Doc falls apart again. Rubber ducks you found stay found.',
  overGo: 'Start over', cancel: 'Cancel', close: 'Close',
  // places and close-ups
  vBarn: 'The barn floor', vBench: 'The workbench', vTack: 'The tack room', vLoft: 'The hayloft',
  vWasher: 'The wringer washer', vAdder: 'The adding machine', vRegister: 'The cash register',
  vDresser: 'The tack chest', vScale: 'The balance scale', vGrinder: 'The meat grinder', vShip: 'The ship model',
  vCrate: 'The crate', vMeters: 'The parking meters',
  faceFront: 'from the front', faceSide: 'from the side', faceBack: 'from the back', facePort: 'one side', faceStar: 'the other side',
  // spots in the places
  sDoc: 'Doc, the dentist’s machine', sDuck: 'Something small and yellow', sLadder: 'The ladder up to the hayloft',
  sSaddle: 'A saddle on its rack', sBridles: 'Bridles on their pegs', sShelf: 'A high shelf near the ceiling', sHay: 'Hay bales', sLedger: 'A page stuck in the hay',
  // items
  i_soggy: 'Soggy paper', i_receipt: 'Receipt', i_penny: 'Penny', i_nickel: 'Nickel', i_dime: 'Dime',
  i_crank: 'Crank handle', i_sash: 'Iron weight', i_chart: 'Flag chart', i_ledger: 'Ledger page',
  i_lamp: 'Doc’s lamp', i_arm: 'Doc’s arm', i_gauge: 'Doc’s gauge',
  holding: 'You’re holding the {item}. Tap where it goes.',
  letGo: 'You put the {item} back in your pocket.',
  noGo: 'The {item} doesn’t do anything there.',
  got: 'You take the {item}.',
  // the barn floor
  loftDark: 'You climb up a few rungs. It’s pitch dark up there. You can’t see a thing.',
  loftLit: 'Doc rolls under the hatch and shines his lamp up into the hayloft.',
  // the tack room
  saddle: 'An old saddle, worn smooth where somebody sat for years.',
  bridles: 'Bridles and halters on wooden pegs. One still smells of saddle soap.',
  shelfHigh: 'A shelf way up by the ceiling. Something with a handle is up there, out of reach.',
  shelfArm: 'Doc swings his arm up to the shelf and lifts something down: a crank handle!',
  shelfEmpty: 'Just dust up there now.',
  // the hayloft
  hay: 'Bales and bales of old hay. It tickles your nose.',
  // Doc
  docNoUse: 'Doc looks at the {item} politely. "Not one of mine, I’m afraid."',
  docLamp: 'Ahh, light! I remember now... a little office over the feed store in town. Ranch kids in my chair, scared stiff, and I’d shine this lamp on the ceiling so they had something to look at.',
  docArm: 'My arm! Oh, that’s better. I remember the office closing, the year the new clinic opened. Everything went to auction, and a rancher bought me for two dollars, to drill holes in tractor parts.',
  docGauge: 'Both eyes! It’s all coming back. That rancher was Wren’s father. He brought me out to this barn and forgot about me. Wren never did. Every Sunday Wren cranked me up, and I kept every secret this barn has.',
  ledgerDim: 'Doc squints. "One line’s scratched out. My eyes aren’t what they were, and it’s too dark to read without my lamp."',
  ledgerLit: 'Doc holds the page under his lamp, and the scratches show through: "Grinder parts, No. 22, 50¢."',
  // washer
  sLidKnob: 'The lid knob', sTub: 'Inside the tub', sDrain: 'The drain lever', sRollers: 'The wringer rollers', sWCrank: 'The wringer crank',
  wLid: 'The knob turns, and the lid lifts off.',
  wWater: 'Cloudy grey water. You can’t see the bottom.',
  wDrain: 'Glug, glug. The water runs out across the floor.',
  wDrained: 'The drain lever is already open.',
  wEmpty: 'An empty enamel tub.',
  wRollers: 'Two rubber rollers, to squeeze the water out of the wash.',
  wRollNo: 'The rollers squeeze it, but it comes out the same.',
  wRollIn: 'You tuck the soggy paper between the rollers.',
  wRollWait: 'The paper is in the rollers. Turn the crank.',
  wCrankEmpty: 'The crank turns, and the empty rollers squeak round.',
  wFeed: 'Creak. The paper inches through the rollers.',
  wBunch: 'Too fast! The paper bunches up and backs out a little.',
  wOut: 'The paper comes out the other side, flat enough to read: a receipt.',
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
  // dresser (the tack chest)
  sDTop: 'The top drawer', sDMid: 'The middle drawer', sDBot: 'The bottom drawer', sDIn: 'Inside the drawer',
  sDSide: 'The side of the chest', sDLatch: 'A little wooden latch', sDPanel: 'A small panel in the back',
  dTopIn: 'Old receipts. "Buggy wheel, $2." "Twelve glass insulators, $1.80." "Cream separator, traded for a goat."',
  dMidIn: 'Harness buckles and a tin of saddle soap.',
  dShallow: 'An empty drawer. It only goes in about half as far as the others.',
  dSide: 'From the side, the chest is deep.',
  dLatch: 'The wooden latch turns sideways.', dLatchBack: 'The latch turns back.',
  dStuck: 'The panel won’t slide. The little latch is holding it.',
  dPanel: 'The panel slides away. There’s a hiding spot behind the bottom drawer!',
  dPanelOpen: 'The hiding spot behind the bottom drawer.',
  // scale
  sSPan: 'The right pan, holding {w} pounds', sSSack: 'The sack on the left pan', sSTray: '{item} on the tray, stamped {w}', sSOn: '{item} on the right pan, stamped {w}', sSDrawer: 'A drawer in the base', sSTrayAll: 'The tray',
  i_flatiron: 'Flatiron', i_horseshoe: 'Horseshoe', i_insulator: 'Glass insulator',
  sSack: 'A sack stamped 9 LB.',
  sPut: 'The {item} goes on the right pan. It’s stamped {w}.', sOff: 'The {item} goes back on the tray.',
  sFull: 'The right pan is full.',
  sOpen: 'The beam levels out. Click! A drawer in the base slides open.',
  sDrawerShut: 'A little drawer in the base. It won’t pull open.', sDrawerEmpty: 'An empty little drawer.',
  // grinder
  sGPart: '{part}, stamped No. {no}', sGBlade: 'A grinder blade', sGBody: 'The grinder', sGCrank: 'Where the crank goes', sGNote: 'Something poking out the front', sGEnd: 'The parts on the end of the grinder',
  p_screw: 'A grinder screw', p_plate: 'A grinder plate', p_ring: 'A grinder ring',
  gBody: 'A meat grinder clamped to the bench. The number stamped on it has rusted off.',
  gOn: 'It goes on.',
  gOff: 'You take the parts back off the grinder.',
  gNeedScrew: 'That goes on the end of the screw. The screw goes in first.',
  gNeedBlade: 'The blade goes on before that.',
  gNeedPlate: 'The plate goes on before the ring.',
  gNoCrank: 'There’s no crank. The handle is missing.',
  gAttach: 'The crank handle slides on.',
  gSpin: 'The crank spins, but the grinder isn’t put together.',
  gJam: 'Clunk. It jams! Something in there is the wrong size for this grinder.',
  gTurn: 'Grind, grind. Something moves inside the barrel.',
  gOut: 'A rolled-up paper squeezes out the front of the grinder!',
  // ship
  sSail: 'The ship', sPlaque: 'The brass plaque', sFlag: 'A flag, {n} from the top: {desc}',
  shipSays: 'A three-masted ship, rigged with cotton thread, stored up here in the hay.',
  plaque: 'The plaque says: SHE SPEAKS IN FLAGS.',
  fS: 'white with a blue square in the middle', fO: 'cut corner to corner, yellow and red', fR: 'red with a yellow cross', fT: 'red, white and blue stripes up and down',
  fA: 'white and blue, with a notch cut in the end', fD: 'yellow, blue and yellow stripes across', fE: 'blue over red', fH: 'white and red, side by side', fK: 'yellow and blue, side by side', fW: 'a blue border, then white, with a red square in the middle',
  // crate
  sCUp: 'Turn the {col} dial up, now {d}', sCDown: 'Turn the {col} dial down, now {d}', colSilver: 'silver', colGreen: 'green', colRed: 'red',
  sCLid: 'The crate lid', sCWUp: 'Turn letter wheel {n} up, now {l}', sCWDown: 'Turn letter wheel {n} down, now {l}', sCLock: 'The padlock', sCArm: 'Something rusty in the straw', sCGauge: 'Something wrapped in a rag',
  cLocked: 'The padlock holds the lid shut.',
  cUnlocked: 'Clunk. The padlock springs open.',
  cLid: 'The lid creaks up. In the straw: a rusty jointed arm, and a little box with four letter wheels.',
  cBox: 'Click. The little box opens. Something round is inside, wrapped in a rag.',
  // meters
  sMeter: 'The {col} meter. {reads}', mExpired: 'It reads EXPIRED.', mReads: 'Its needle points to {n}.',
  mSlot: 'It reads EXPIRED. The coin slot is stamped {coin}.',
  mWrong: 'It won’t go in. This slot is stamped {coin}.',
  mIn: 'Clink. The EXPIRED flag drops and the needle swings to {n}.',
  coin_penny: '1¢', coin_nickel: '5¢', coin_dime: '10¢',
  // the duck
  duck: 'A rubber duck, hiding in the hay! It squeaks hello.',
  // the papers
  receiptTitle: 'A receipt from the washer', receiptHead: 'COTTONWOOD BARN. Sold to one buyer:', receiptTotal: 'TOTAL', receiptFoot: 'Paid in full. Ring it up!',
  r_washer: 'Wringer washer', r_dresser: 'Oak tack chest', r_scale: 'Balance scale', r_ship: 'Ship model',
  ledgerTitle: 'A page from the ledger', ledgerLines: ['Hay, 40 bales: $12.00', 'Horseshoes, a box: 60¢', 'Grinder parts, No. {no}: 50¢', 'Saddle soap: 15¢'], ledgerScratched: '(scratched out)', ledgerHint: 'One line is scratched out too hard to read in this light.',
  chartTitle: 'A rolled-up flag chart',
  chartLine: 'Ship’s flags, each with the letter it stands for.',
  chartAlt: 'Ten flags and their letters. A: white and blue, with a notch cut in the end. D: yellow, blue and yellow stripes across. E: blue over red. H: white and red, side by side. K: yellow and blue, side by side. O: cut corner to corner, yellow and red. R: red with a yellow cross. S: white with a blue square in the middle. T: red, white and blue stripes up and down. W: a blue border, then white, with a red square in the middle.',
  endTitle: 'Doc is back together',
  endMore: 'You’ve found them all now, I think. Well... nearly all. There’s still the stalls, and the feed room.',
  endNext: 'The stalls and the feed room are still being built.',
  ducks: 'Rubber ducks found: {n} of {m}.',
  keepLooking: 'Keep looking around',
  // Doc's voice
  docHello: '*creak* ...Oh! A visitor. Forgive me, I’m in pieces: my lamp, my arm, one of my eyes, all lost somewhere in this barn. ',
  docOpen: ['Open wide... ', 'Just a little pressure... ', 'Rinse, please... ', 'Mm-hmm, mm-hmm... ', 'Bite down gently... ', 'Comfortable? Good... '],
  docDone: 'Lovely. Not a single cavity in the whole barn.',
  // canvas words
  art_expired: 'EXPIRED', art_limit: 'LIMIT 60 MIN', art_plaque: 'SHE SPEAKS IN FLAGS', art_sack: '9 LB', art_noSale: 'NO SALE', art_up: 'THIS SIDE UP', art_tack: 'TACK',
};

// Doc's hints, three to a step: a nudge, a clearer nudge, then nearly the
// answer, never the answer straight away. Picked by `hintNow`.
const HINTS = {
  'washer.start': ['That washer is awfully full for something nobody’s used in years.', 'Lids come off. And water drains, if you find the lever.', 'Turn the knob on the lid, and flip the drain lever at the bottom of the tub.'],
  'washer.take': ['Something’s at the bottom of that tub. Two somethings.', 'Pick them up. Gently, they’ve been soaking.', 'Tap the soggy paper and the coin in the empty tub.'],
  'washer.wring': ['Soggy paper won’t read itself, I’m afraid.', 'What on a washer squeezes things flat?', 'Pick the soggy paper, then tap the wringer’s rollers on top.'],
  'washer.crank': ['Gently now. Slow and steady, like a good rinse.', 'If it bunches up, you’re cranking too fast.', 'Tap the crank about once a second until the paper comes out.'],
  'receipt': ['That receipt adds up to something.', 'The adding machine on the workbench will total it for you.', 'One key in each column for a price, then pull the crank. Do that for every line on the receipt.'],
  'register': ['That fancy register would love to ring up a sale.', 'One key in each row: dollars, dimes, then cents. Then the crank on the side.', 'Ring up the receipt’s total, the one the adding machine printed.'],
  'register.take': ['Something in that drawer looks awfully familiar.', 'Is that... my lamp?', 'Take what’s in the register’s drawer.'],
  'lamp': ['That’s my lamp! Would you mind terribly?', 'Hand it to me, would you?', 'Pick my lamp, then tap me, or the Give to Doc button.'],
  'loft': ['With my lamp on, I could light that hayloft for you.', 'Up the ladder at the back of the barn.', 'Tap the ladder on the barn floor.'],
  'ledger.find': ['Somebody stuffed a page into the hay up there.', 'Look among the bales in the hayloft.', 'Tap the paper sticking out of the hay.'],
  'ledger': ['Scratched out, is it? A little more light would help.', 'My lamp is good for more than ceilings.', 'Pick the ledger page, then tap me.'],
  'secret': ['One of those tack chest drawers is telling a little fib.', 'The bottom drawer is shallow, but the chest is deep. Turn it around.', 'At the back of the chest, turn the little wooden latch, then slide the panel.'],
  'secret.take': ['There’s something heavy in that hiding spot.', 'Take it. It’s exactly the weight you need.', 'Tap the iron weight behind the bottom drawer.'],
  'scale': ['That scale wants both pans to weigh the same.', 'The sack says 9 pounds. Everything on the tray has its weight stamped on it.', 'Put things on the right pan until their numbers make 9.'],
  'scale.short': ['That scale wants both pans to weigh the same.', 'The sack says 9 pounds. Everything on the tray has its weight stamped on it.', 'The tray only adds up to 6. You need 4 pounds more, hidden in the tack chest.'],
  'scale.take': ['The scale’s drawer is open. Something shiny.', 'Go on, take it.', 'Tap the coin in the drawer at the bottom of the scale.'],
  'meters': ['Those meters have been expired for years. Poor things.', 'Each slot takes one kind of coin. Read the slots.', 'A penny, a nickel and a dime, one in each meter. Then read the needles left to right.'],
  'meters.short': ['Those meters have been expired for years. Poor things.', 'Each slot takes one kind of coin. Read the slots.', 'There are three coins to find: one in the washer, one in the register, one in the scale.'],
  'lock': ['That crate in the hayloft has a padlock: silver, green and red dials.', 'The parking meters are silver, green and red too, left to right.', 'Set each dial to the number its meter’s needle points at.'],
  'box.lid': ['The padlock’s off. What are you waiting for?', 'Lift the lid.', 'Tap the top of the crate to open it.'],
  'arm.take': ['Is that... my arm, in the straw?', 'Take it, please, before the mice do.', 'Tap the rusty arm in the crate.'],
  'arm': ['My arm! If you’d be so kind.', 'Hand it to me, would you?', 'Pick my arm, then tap me, or the Give to Doc button.'],
  'shelf': ['With my arm back, I can reach high places.', 'There’s a high shelf in the tack room.', 'Tap the high shelf in the tack room.'],
  'grinder.which': ['Two grinders’ parts, all mixed up. Tsk.', 'The grinder’s number rusted off. Somebody must have written it down.', 'The ledger page from the hayloft has the number. Read it under my lamp.'],
  'grinder.parts': ['Now you know the grinder’s number.', 'Every part is stamped. Use the ones that match the ledger.', 'The ledger’s number: the screw, the blade, the plate, then the ring.'],
  'grinder.jam': ['Jammed, is it? Something in there is the wrong size.', 'Take the parts off and check their numbers.', 'Tap the end of the grinder to take the parts off. The ledger says which number fits.'],
  'grinder.crank': ['All put together, and no way to turn it.', 'It needs a crank handle. A high shelf might have one.', 'Pick the crank, then tap the side of the grinder.'],
  'grinder.turn': ['Turn it, turn it. Something’s in the barrel.', 'Keep cranking, nice and easy.', 'Tap the crank until something comes out the front.'],
  'grinder.take': ['Something’s poking out the front of that grinder.', 'Go on, pull it out.', 'Tap the rolled-up paper at the front of the grinder.'],
  'box.nochart': ['Four letter wheels. A four-letter word, somewhere in this barn.', 'Ships talk without saying a word.', 'You’ll need a flag chart. The meat grinder has one, once it works.'],
  'box': ['Four letter wheels. Ships talk without saying a word.', 'Turn the ship around and look at its flags.', 'Match each flag, top to bottom, to the chart from the grinder.'],
  'gauge.take': ['Something round, in a rag. Could it be...?', 'Go on, unwrap it.', 'Tap the thing in the little box.'],
  'gauge': ['Is that... my other eye?', 'Hand it to me, would you? Gently.', 'Pick my gauge, then tap me, or the Give to Doc button.'],
};

// an item's name inside a sentence: "the penny", but "Doc’s lamp" keeps its capital
const inm = id => { const n = STR['i_' + id]; return n.startsWith('Doc') ? n : n[0].toLowerCase() + n.slice(1); };
const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
const money = c => '$' + (c / 100).toFixed(2);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const $ = q => document.querySelector(q);

// ---------- Saving ----------
// Version 1 saved under back-room. Nothing carries over: the barn is a
// different puzzle, and its rubber duck hides somewhere new.
const KEY = 'barn-secrets';
function fresh(old = {}) {
  return {
    v: 2, started: false, done: false, inv: [], got: [], held: null, solved: {}, hints: {},
    duck: !!old.duck, docOn: false, sound: old.sound ?? true,
    parts: { lamp: false, arm: false, gauge: false }, loftSeen: false, ledgerLit: false,
    washer: { lid: false, drained: false, noteIn: false, feed: 0 },
    adder: { cols: [0, 0, 0], tape: [], total: 0 },
    reg: { keys: [0, 0, 0], flags: null, open: false },
    dresser: { open: null, latch: false, panel: false },
    scale: { tray: ['flatiron', 'horseshoe', 'insulator'], pan: [], open: false },
    grinder: { built: [], crank: false, turns: 0, out: false, jam: false },
    meters: [false, false, false],
    crate: { lock: [0, 0, 0], unlocked: false, lid: false, wheels: [0, 0, 0, 0], box: false },
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
if (!S || S.v !== 2) S = fresh();
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
function lampItem(x, y) {   // Doc's lamp off its stalk: a round reflector
  disc(x, y, 7, C.steelD); disc(x, y, 6, C.steel); disc(x, y, 3, C.enamelL); px(x - 2, y - 2, C.white); R(x + 6, y - 1, 6, 3, C.steelD);
}
function brassKey(x, y) { disc(x, y, 4, C.brassD); disc(x, y, 3, C.brass); disc(x, y, 1, C.ink); R(x + 4, y - 1, 14, 3, C.brass); R(x + 14, y + 2, 2, 3, C.brass); R(x + 10, y + 2, 2, 2, C.brass); R(x + 4, y - 1, 14, 1, C.brassL); }
function soggy(x, y) { oval(x, y, 9, 4, C.paperD); dith(x - 7, y - 3, 14, 6, '#9c9070', 2); px(x - 3, y - 1, C.ink); px(x + 2, y, C.ink); }

// ---------- Signal flags ----------
// The real International Code of Signals flags (A, D, E, H, K, O, R, S, T, W).
function flag(L, x, y, w = 18, h = 12) {
  const half = w >> 1;
  switch (L) {
    case 'A': R(x, y, half, h, C.white);
      // the swallowtail: the notch is left undrawn, so whatever is behind
      // shows through (it was painted black, a black wedge on the chart's paper)
      for (let j = 0; j < h; j++) { const cut = Math.round(5 * (1 - Math.abs(j - (h - 1) / 2) / ((h - 1) / 2))); R(x + half, y + j, w - half - cut, 1, C.blue); }
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
// The old red dentist's unit (Randi, 26 Nov): two gauge eyes, a round lamp
// up top, knobs down the front like vest buttons, a swing arm and a spit
// bowl. In the barn he's falling apart: his lamp, his arm and his left gauge
// are lost somewhere, and each one handed back is drawn on him again. He's
// the hint button too. Until he's cranked his gauges are dark; his needles
// sit higher the more of the barn is sorted, and swing up when something is
// solved.
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
// lampTop: the lamp's height above the head, so the face icon can fit it
function docHead(x, y, now) {   // 30 wide; the head is y + 6 to y + 28, the lamp above it
  const [l, r] = docNeedles(now);
  if (S.parts.lamp) {
    R(x + 14, y - 2, 2, 8, C.steelD);
    disc(x + 15, y - 5, 5, C.steelD); disc(x + 15, y - 5, 4, S.docOn ? '#fff2c0' : C.enamelD); px(x + 13, y - 7, C.white);
  } else { oval(x + 15, y + 5, 5, 2, C.ironD); oval(x + 15, y + 5, 3, 1, '#120a05'); }   // the empty lamp socket
  bev(x, y + 6, 30, 22, C.red, C.redL, C.redD);
  dith(x + 2, y + 22, 26, 5, C.rustD, 3);
  if (S.parts.gauge) gauge(x + 8, y + 15, 5, l, S.docOn);
  else { disc(x + 8, y + 15, 6, C.ironD); disc(x + 8, y + 15, 5, '#120a05'); line(x + 5, y + 12, x + 10, y + 18, C.rustD); }
  gauge(x + 22, y + 15, 5, r, S.docOn);
  if (S.duck) duckSprite(x - 2, y - 2);
}
function drawDoc(x, now) {   // the whole of him standing on the barn floor, x is his left edge
  R(x, 152, 44, 10, C.ironD); R(x + 2, 150, 40, 3, C.iron);
  bev(x + 12, 58, 20, 94, C.red, C.redL, C.redD); dith(x + 13, 120, 18, 30, C.rust, 3); dith(x + 14, 62, 5, 24, C.rustD, 4);
  for (const k of [70, 82, 94, 106]) { disc(x + 22, k, 2, C.ironD); px(x + 21, k - 1, C.ironL); }
  if (S.parts.arm) { line(x + 30, 64, x + 48, 56, C.rustL, 2); disc(x + 49, 56, 2, C.rust); line(x + 49, 57, x + 54, 72, C.rustL, 2); R(x + 53, 72, 3, 5, C.steelD); }
  else { R(x + 31, 63, 4, 4, C.rustD); line(x + 34, 66, x + 37, 80, C.ink); }   // a stub and a loose wire
  line(x + 31, 98, x + 42, 98, C.ironD, 2); oval(x + 46, 96, 7, 3, C.enamelDD); oval(x + 46, 95, 6, 2, C.enamel); oval(x + 46, 96, 3, 1, C.enamelD);
  const ca = AN.dCrank; disc(x + 5, 114, 4, C.ironD); line(x + 5, 114, x + 5 + Math.cos(ca) * 7, 114 + Math.sin(ca) * 7, C.iron, 2);
  docHead(x + 7, 32, now);
}
function duckSprite(x, y) {
  R(x + 2, y + 3, 8, 4, C.yellow); R(x + 1, y + 4, 10, 3, C.yellow); R(x + 6, y, 4, 4, C.yellow);
  px(x + 8, y + 1, C.ink); R(x + 10, y + 2, 2, 1, '#f28c28'); R(x + 2, y + 6, 8, 1, C.yellowD);
}

// ---------- Views ----------
// Each view is a scene: draw() paints it, spots() lists what can be touched.
// A spot is { id, x, y, w, h, label, act, use }: act() runs on a tap, and
// use(item) runs instead when an item is held (it returns false if the item
// does nothing there). Each view but the barn floor has a parent, the place
// you go Back to, and `at`, where it sits in that parent's picture (the zoom
// goes in and out of that rectangle).
const say = (k, v, who) => setMsg(fmt(STR[k] ?? k, v), who);
const face = { dresser: 0, ship: 0 };
let view = 'barn';
const onDoc = id => giveDoc(id);

// ----- the barn floor -----
function drawBarn(now) {
  cached('barn', r => {
    planks(0, 0, W, 150, 14, r); floor(152, r);
    for (let i = 0; i < 260; i++) px((r() * W) | 0, 152 + ((r() * 48) | 0), r() < .5 ? '#c9a84a' : '#a8883a');
    // the open barn doors at the back, daylight and a field
    R(124, 38, 76, 108, C.woodDD);
    R(128, 42, 68, 50, '#9cc4d8'); R(128, 74, 68, 18, '#b8d4e0'); R(128, 92, 68, 52, '#7f9e58'); dith(128, 92, 68, 52, '#6a8a48', 3);
    R(128, 104, 68, 2, C.woodD); for (let x = 132; x < 196; x += 12) R(x, 98, 2, 12, C.woodD);
    planks(110, 40, 16, 106, 8, r, [C.wood, C.woodD]); planks(198, 40, 16, 106, 8, r, [C.wood, C.woodD]);
    // the hayloft floor overhead, hay poking over the edge, the hatch
    R(0, 0, W, 28, C.woodDD); for (let x = 0; x < W; x += 40) R(x, 0, 6, 28, '#2a170a');
    bev(0, 28, W, 6, C.wood, C.woodL, C.woodD);
    for (let x = 0; x < W; x += 3) if (r() < .7) R(x, 34, 1, 1 + ((r() * 4) | 0), r() < .5 ? '#c9a84a' : '#e0c060');
    R(236, 22, 32, 12, '#0e0905');
    // the workbench corner on the left
    bev(0, 58, 56, 3, C.woodL, '#d09a5a', C.woodD);
    for (const [x, c] of [[4, C.red], [13, C.green], [22, C.brass], [31, C.blue], [40, C.red]]) { R(x, 48, 7, 10, c); R(x, 51, 7, 2, C.paper); }
    R(0, 101, 54, 46, C.woodD); bev(0, 96, 58, 5, C.woodL, '#d09a5a', C.wood);
    bev(4, 84, 20, 12, C.green, C.greenL, C.greenD); bev(30, 70, 22, 26, C.brass, C.brassL, C.brassD); R(34, 73, 14, 5, '#20160c');
    R(4, 66, 10, 6, C.iron); R(13, 68, 8, 4, C.iron);
    // the tack room door on the right
    R(274, 58, 46, 90, C.woodDD); planks(278, 62, 42, 86, 7, r, [C.wood, C.woodD, '#7a4e28']);
    bev(286, 72, 26, 11, C.paper, C.white, C.paperD); textC(STR.art_tack, 299, 75, C.ink);
    disc(282, 108, 2, C.brass);
    // the ladder up to the hatch
    R(242, 30, 3, 120, C.woodL); R(259, 30, 3, 120, C.woodL);
    for (let y = 38; y < 148; y += 11) R(245, y, 14, 2, C.wood);
  });
  // the parking meters, lined up by the doors
  const mc = [[C.steel, C.steelL], [C.green, C.greenL], [C.red, C.redL]];
  for (let i = 0; i < 3; i++) {
    const mx = 108 + i * 9;
    R(mx - 1, 92, 3, 60, C.ironD); R(mx - 3, 150, 7, 3, C.ironD);
    oval(mx, 76, 4, 4, mc[i][0]); R(mx - 4, 76, 9, 16, mc[i][0]); R(mx - 3, 77, 1, 14, mc[i][1]);
    R(mx - 2, 75, 5, 6, '#d8e0d8'); if (!S.meters[i]) R(mx - 2, 79, 5, 2, C.red);
  }
  // the washer
  const w = S.washer, dx = 154;
  if (w.drained) { oval(70 + dx, 172, 26, 4, '#2c3438'); oval(70 + dx, 171, 20, 2, '#3c484e'); }
  R(54 + dx, 150, 3, 16, C.enamelD); R(80 + dx, 150, 3, 16, C.enamelD);
  R(50 + dx, 106, 36, 46, C.enamel); R(50 + dx, 106, 3, 46, C.enamelD); R(54 + dx, 106, 4, 46, C.enamelL); R(78 + dx, 106, 8, 46, C.enamelD);
  R(50 + dx, 128, 36, 2, C.black); oval(68 + dx, 106, 19, 4, C.enamelDD); oval(68 + dx, 105, 18, 3, w.lid ? (w.drained ? C.enamelD : C.water) : C.enamelL);
  R(56 + dx, 86, 2, 18, C.iron); R(78 + dx, 86, 2, 18, C.iron); bev(53 + dx, 84, 30, 4, C.iron, C.ironL, C.ironD); R(57 + dx, 89, 22, 3, C.cream); R(57 + dx, 92, 22, 3, C.creamD);
  drawDoc(60, now);
  shade(160, 70, 220, .8);
  if (S.parts.lamp && S.docOn) { disc(82, 27, 2, '#fffbe8'); }
}
function ladder() {
  if (!S.parts.lamp) { sfx.no(); return say('loftDark'); }
  const first = !S.loftSeen;
  S.loftSeen = true; go('loft');
  if (first) { say('loftLit', null, 'doc'); save(); }
}
const barnSpots = () => [
  { id: 'bench', x: 0, y: 44, w: 58, h: 104, label: STR.vBench, act: () => go('bench') },
  { id: 'doc', x: 60, y: 24, w: 46, h: 138, label: STR.sDoc, act: crankDoc, use: onDoc },
  { id: 'meters', x: 102, y: 66, w: 28, h: 88, label: STR.vMeters, act: () => go('meters') },
  { id: 'washer', x: 200, y: 82, w: 42, h: 86, label: STR.vWasher, act: () => go('washer') },
  { id: 'ladder', x: 238, y: 20, w: 30, h: 130, label: STR.sLadder, act: ladder },
  { id: 'tack', x: 272, y: 56, w: 48, h: 94, label: STR.vTack, act: () => go('tack') },
];

// ----- the workbench -----
function drawBench(now) {
  cached('bench', r => {
    planks(0, 0, W, 124, 16, r);
    for (const y of [30, 66]) { bev(6, y, 308, 4, C.woodL, '#d09a5a', C.woodD); R(8, y + 4, 304, 1, 'rgba(0,0,0,.4)'); }
    const cans = [C.red, '#c96a2a', C.green, C.red, C.brass, C.blue, C.red, '#7a5a30', C.green, C.blue, C.red, C.brass];
    cans.forEach((c, i) => { const x = 14 + i * 25; R(x, 12, 15, 18, c); R(x, 12, 15, 1, C.steelL); R(x, 18, 15, 5, C.paper); R(x + 12, 12, 3, 18, 'rgba(0,0,0,.3)'); });
    for (let i = 0; i < 16; i++) {
      const x = 14 + i * 19, c = i % 3 ? C.glass : C.glassD;
      oval(x + 6, 51, 6, 4, c); R(x, 51, 13, 12, c); R(x - 2, 60, 17, 6, c); px(x + 3, 53, C.glassL); px(x + 3, 54, C.glassL); px(x + 3, 55, C.glassL);
    }
    R(0, 128, W, 72, C.woodD); bev(0, 122, W, 7, C.woodL, '#d09a5a', C.wood);
    for (const x of [10, 116, 222]) bev(x, 138, 90, 52, C.woodD, C.wood, C.woodDD);
  });
  // the adding machine
  bev(30, 84, 72, 38, C.green, C.greenL, C.greenD); R(36, 88, 46, 30, C.greenD);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) disc(44 + i * 14, 91 + j * 6, 2, C.cream);
  R(86, 70, 12, 18, C.paper); for (let k = 0; k < 4; k++) R(88, 73 + k * 4, 8, 1, '#6a5a40');
  line(102, 104, 110, 90, C.iron, 2); disc(110, 89, 2, C.woodL);
  // the meat grinder
  const gr = S.grinder;
  for (let y = 80; y < 92; y++) { const hw = Math.round(12 - (y - 80) * .4); R(146 - hw, y, 2 * hw, 1, C.iron); }
  R(134, 92, 44, 14, C.iron); R(134, 93, 44, 2, C.ironL); R(140, 106, 8, 22, C.iron); oval(178, 99, 2, 7, C.ironD);
  if (gr.crank) { line(132, 99, 124, 88, C.iron, 2); R(121, 84, 4, 5, C.woodL); }
  if (gr.out && !got('chart')) R(180, 97, 8, 4, C.paper);
  // the register
  const rg = S.reg;
  R(222, 46, 64, 16, C.brass); oval(254, 47, 32, 4, C.brass); R(228, 50, 52, 10, '#20160c');
  if (rg.flags) R(242, 52, 22, 6, C.white);
  bev(200, 60, 108, 62, C.brass, C.brassL, C.brassD); dith(202, 108, 104, 12, C.brassD, 4);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 9; i++) disc(210 + i * 11, 70 + j * 12, 3, C.cream);
  if (rg.open) bev(204, 118, 100, 8, C.wood, C.woodL, C.woodDD);
  shade(160, 30, 240, .7);
}
const benchSpots = () => [
  { id: 'adder', x: 26, y: 66, w: 88, h: 58, label: STR.vAdder, act: () => go('adder') },
  { id: 'grinder', x: 118, y: 74, w: 72, h: 56, label: STR.vGrinder, act: () => go('grinder') },
  { id: 'register', x: 196, y: 40, w: 116, h: 88, label: STR.vRegister, act: () => go('register') },
];

// ----- the tack room -----
function drawTack(now) {
  cached('tack', r => {
    planks(0, 0, W, 178, 16, r, ['#55361f', '#4b2f1a', '#5c3c24']); floor(180, r);
    // the high shelf by the ceiling
    bev(206, 20, 110, 4, C.woodL, '#d09a5a', C.woodD); line(212, 24, 220, 34, C.woodD, 2); line(310, 24, 302, 34, C.woodD, 2);
    // the saddle on its rack
    R(26, 132, 4, 46, C.woodD); R(86, 132, 4, 46, C.woodD); bev(20, 126, 76, 7, C.wood, C.woodL, C.woodD);
    oval(58, 116, 30, 12, '#6a3a1c'); oval(58, 113, 28, 10, '#8a4e26'); R(34, 116, 48, 22, '#7a4420');
    R(36, 136, 8, 26, '#6a3a1c'); R(72, 136, 8, 26, '#6a3a1c'); disc(80, 104, 4, '#6a3a1c'); R(44, 109, 26, 2, '#a86a3a');
    // bridles on their pegs
    for (const x of [112, 134, 156]) {
      R(x - 1, 38, 4, 4, C.woodL);
      ringO(x + 1, 66, 8, 24, '#6a3a1c', -Math.PI / 2, Math.PI * 1.5); ringO(x + 1, 66, 7, 23, '#8a4e26', -Math.PI / 2, Math.PI * 1.5);
      R(x - 2, 82, 6, 2, C.steel);
    }
  });
  // the tack chest
  const d = S.dresser;
  bev(156, 98, 50, 3, C.woodL, '#d09a5a', C.woodD); R(158, 101, 46, 60, C.wood); R(158, 161, 46, 4, C.woodD);
  for (let i = 0; i < 3; i++) { const y = 104 + i * 19, out = d.open === i ? 3 : 0; bev(160 - out / 2, y + out, 42 + out, 16, C.wood, C.woodL, C.woodDD); px(172, y + 8 + out, C.brass); px(190, y + 8 + out, C.brass); }
  // the scale on a stool
  R(226, 140, 52, 4, C.woodL); R(230, 144, 3, 30, C.woodD); R(271, 144, 3, 30, C.woodD);
  R(242, 132, 20, 8, C.ironD); R(250, 98, 4, 34, C.brass);
  const k = Math.round(AN.tilt / 2); line(228, 98 + k, 276, 98 - k, C.brass, 2);
  oval(230, 118 + k, 9, 2, C.brassD); oval(274, 118 - k, 9, 2, C.brassD); R(224, 108 + k, 12, 9, C.sack);
  // the crank up on the shelf, until Doc lifts it down
  if (!got('crank')) { R(250, 15, 20, 4, C.iron); R(268, 9, 3, 9, C.iron); R(266, 6, 7, 4, C.woodL); }
  shade(160, 60, 220, .8);
}
function shelf() {
  if (got('crank')) return say('shelfEmpty');
  if (!S.parts.arm) { sfx.no(); return say('shelfHigh'); }
  give('crank'); AN.dCrank += Math.PI; solve('shelf'); say('shelfArm', null, 'doc'); done();
}
const tackSpots = () => [
  { id: 'saddle', x: 16, y: 96, w: 84, h: 82, label: STR.sSaddle, act: () => say('saddle') },
  { id: 'bridles', x: 100, y: 34, w: 72, h: 60, label: STR.sBridles, act: () => say('bridles') },
  { id: 'dresser', x: 152, y: 94, w: 58, h: 74, label: STR.vDresser, act: () => go('dresser') },
  { id: 'scale', x: 220, y: 94, w: 64, h: 82, label: STR.vScale, act: () => go('scale') },
  { id: 'shelf', x: 204, y: 2, w: 114, h: 26, label: STR.sShelf, act: shelf },
];

// ----- the hayloft -----
function bale(x, y, w, h) {
  R(x, y, w, h, '#c9a84a'); dith(x, y, w, h, '#b8923a', 3); R(x, y, w, 2, '#e0c060'); R(x, y + h - 2, w, 2, '#8a6a24');
  R(x + (w >> 2), y, 2, h, '#7a5a20'); R(x + w - (w >> 2), y, 2, h, '#7a5a20');
}
function drawLoft(now) {
  cached('loft', r => {
    R(0, 0, W, H, '#2a1a0e');
    for (let x = -200; x < W; x += 34) line(x, 0, x + 200, 160, '#3a2414', 3);   // the rafters
    R(0, 0, W, 6, '#1a0f07');
    disc(160, 30, 15, C.woodD); disc(160, 30, 12, '#b8d0d8'); R(159, 18, 2, 24, C.woodD); R(148, 29, 24, 2, C.woodD);   // the round window
    R(0, 160, W, 40, C.woodD); for (let y = 164; y < H; y += 6) R(0, y, W, 1, C.woodDD);
    for (let i = 0; i < 300; i++) px((r() * W) | 0, 160 + ((r() * 40) | 0), r() < .5 ? '#c9a84a' : '#a8883a');
    bale(0, 98, 56, 30); bale(0, 128, 60, 32); bale(56, 128, 60, 32); bale(116, 108, 70, 30); bale(186, 92, 64, 34); bale(186, 126, 66, 34); bale(252, 110, 68, 50);
    // the hatch, with the top of the ladder and Doc's light coming up
    R(276, 184, 44, 16, '#0e0905'); R(282, 184, 3, 16, C.woodL); R(306, 184, 3, 16, C.woodL);
  });
  // the ship on a bale (the same model as its close-up, small)
  const sx = 22, sy = 96;
  for (const [mx, top] of [[sx + 20, sy - 44], [sx + 40, sy - 52], [sx + 60, sy - 42]]) {
    R(mx, top, 1, 40, C.woodD);
    let y = sy - 8; for (let k = 0; k < 3; k++) { const h = [10, 9, 7][k], w = [16, 13, 9][k]; y -= h; R(mx - (w >> 1), y, w, h - 1, C.cream); R(mx + (w >> 1) - 2, y, 2, h - 1, C.creamD); R(mx - (w >> 1) - 1, y - 1, w + 2, 1, C.woodD); }
  }
  for (let y = sy - 8; y < sy + 2; y++) { const t = (y - sy + 8) / 10, l = sx + 4 + Math.round(t * t * 14), rr = sx + 80 - Math.round(t * 18); R(l, y, rr - l, 1, y < sy - 6 ? C.woodL : y === sy - 4 ? C.brassL : y < sy - 1 ? C.woodDD : C.ink); }
  line(sx + 78, sy - 8, sx + 94, sy - 16, C.woodD);
  // the crate
  const c = S.crate;
  R(132, 140, 80, 50, C.wood);
  for (let y = 140; y < 190; y += 10) { R(132, y, 80, 1, C.woodDD); R(132, y + 1, 80, 1, C.woodL); }
  R(132, 140, 7, 50, C.woodD); R(205, 140, 7, 50, C.woodD);
  if (c.lid) { R(130, 128, 84, 12, C.woodD); R(140, 142, 64, 6, '#c9a84a'); }
  if (!c.unlocked) { R(168, 152, 9, 9, C.brass); ringO(172, 151, 4, 4, C.ironL, Math.PI, Math.PI * 2); }
  // the ledger page, tucked into a bale
  if (!got('ledger')) { R(258, 116, 16, 12, C.paper); R(258, 116, 16, 2, '#4a6a3a'); for (let k = 0; k < 3; k++) R(260, 120 + k * 3, 11, 1, '#6a5a40'); }
  // the duck, half in the hay
  if (!S.duck) { duckSprite(290, 148 + Math.round(Math.sin(now / 700))); dith(286, 155, 18, 5, '#c9a84a', 2); }
  shade(300, 196, 260, .7);
}
const loftSpots = () => [
  { id: 'hay', x: 0, y: 92, w: 320, h: 70, label: STR.sHay, act: () => say('hay') },
  { id: 'ship', x: 18, y: 40, w: 100, h: 62, label: STR.vShip, act: () => go('ship') },
  { id: 'crate', x: 128, y: 124, w: 88, h: 70, label: STR.vCrate, act: () => go('crate') },
  !got('ledger') && { id: 'ledger', x: 252, y: 110, w: 28, h: 24, label: STR.sLedger, act: () => { give('ledger'); say('got', { item: inm('ledger') }); done(); } },
  !S.duck && { id: 'duck', x: 284, y: 140, w: 20, h: 20, label: STR.sDuck, act: () => { S.duck = true; sfx.squeak(); say('duck'); save(); refresh(); } },
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
    if (w.feed >= A.wringTaps) { w.noteIn = false; give('receipt'); solve('washer'); say('wOut'); }
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
    if (!got('lamp')) lampItem(186, 178);
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
    if (!got('lamp')) out.push({ id: 'lamp', x: 172, y: 166, w: 28, h: 22, label: STR.i_lamp, act: () => { give('lamp'); say('got', { item: inm('lamp') }); done(); } });
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
      if (i === 1) { for (const bx of [124, 150, 176]) { ringO(bx, y + 8, 5, 3, C.steel); R(bx - 1, y + 6, 2, 4, C.steelD); } R(196, y + 4, 10, 8, C.red); }
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
}
function dresserSpots() {
  const d = S.dresser, f = face.dresser, out = [];
  if (f === 0) {
    const names = [STR.sDTop, STR.sDMid, STR.sDBot];
    if (d.open !== null) {
      const i = d.open, y = DRAWER_Y[i];
      out.push({ id: 'in', x: 108, y: y - 2, w: 104, h: 16, label: STR.sDIn, act: () => say(i === 0 ? 'dTopIn' : i === 2 ? 'dShallow' : 'dMidIn') });
    }
    for (let i = 0; i < 3; i++) {
      const y = DRAWER_Y[i] + (d.open === i ? 14 : 0);
      out.push({
        id: 'd' + i, x: 106, y, w: 108, h: 34, label: names[i],
        act: () => {
          d.open = d.open === i ? null : i; sfx.creak();
          if (d.open === 2) say('dShallow'); else if (d.open === 0) say('dTopIn'); else if (d.open === 1) say('dMidIn'); else setMsg('');
          done();
        },
      });
    }
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
  else out.push({ id: 'drawer', x: 140, y: 150, w: 40, h: 18, label: STR.sSDrawer, act: () => say(s.open ? 'sDrawerEmpty' : 'sDrawerShut') });
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
  R(110, 64, 30, 9, C.rust); dith(110, 64, 30, 9, C.rustL, 2); dith(111, 65, 28, 7, C.rustD, 3);   // where the number was
  oval(192, 71, 5, 15, C.ironD); oval(192, 71, 3, 12, C.ink);
  const b = gr.built.map(id => PARTS.find(p => p.id === id).kind);
  if (b.includes('screw')) { R(192, 67, 10, 8, C.ironL); line(194, 67, 196, 74, C.iron); line(198, 67, 200, 74, C.iron); }
  if (b.includes('blade')) { R(202, 60, 3, 22, C.steelL); R(198, 70, 11, 3, C.steelL); }
  if (b.includes('plate')) { oval(206, 71, 3, 15, C.steelD); oval(206, 71, 2, 14, C.steel); for (let j = -10; j <= 10; j += 5) px(206, 71 + j, C.ink); }
  if (b.includes('ring')) { oval(209, 71, 4, 17, C.ironD); oval(209, 71, 3, 16, C.iron); oval(209, 71, 2, 12, C.steel); }
  if (gr.out && !got('chart')) { R(212, 67, 22, 7, C.paper); R(212, 67, 22, 1, C.white); R(232, 67, 2, 7, C.paperD); }
  // the crank
  disc(86, 71, 6, C.ironD);
  if (gr.crank) { const a = AN.gAng, hx = 86 + Math.cos(a) * 24, hy = 71 + Math.sin(a) * 24; line(86, 71, hx, hy, C.iron, 4); R(hx - 3, hy - 8, 6, 10, C.woodL); }
  // the parts on the counter
  PARTS.forEach((p, i) => { if (!isBuiltPart(p)) partSprite(p, partX(i), 160); });
  shade(160, 90, 200, .7);
}
const isBuiltPart = p => S.grinder.built.includes(p.id);
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
    // any part goes on in the right order; only cranking finds a wrong size,
    // so the ledger's number is what tells you which parts are this grinder's
    if (gr.built.some(id => { const p = PARTS.find(q => q.id === id); return p.no && p.no !== A.grinderNo; })) { gr.jam = true; sfx.bunch(); say('gJam'); return done(); }
    gr.turns++;
    if (gr.turns >= A.grinderTurns) { gr.out = true; say('gOut'); } else say('gTurn');
    done();
  };
  out.push({ id: 'crank', x: 56, y: 40, w: 46, h: 62, label: STR.sGCrank, act: crankAct, use: id => { if (id !== 'crank' || gr.crank) return false; useUp('crank'); gr.crank = true; sfx.clunk(); say('gAttach'); done(); } });
  out.push({ id: 'body', x: 102, y: 26, w: 88, h: 62, label: STR.sGBody, act: () => say('gBody'), use: id => { if (id !== 'crank' || gr.crank) return false; useUp('crank'); gr.crank = true; sfx.clunk(); say('gAttach'); done(); } });
  if (gr.built.length && !gr.out) out.push({ id: 'end', x: 186, y: 50, w: 30, h: 42, label: STR.sGEnd, act: () => { gr.built = []; gr.jam = false; gr.turns = 0; sfx.click(); say('gOff'); done(); } });
  if (gr.out && !got('chart')) out.push({ id: 'note', x: 208, y: 60, w: 32, h: 22, label: STR.sGNote, act: () => { give('chart'); solve('grinder'); say('got', { item: inm('chart') }); done(); } });
  return out;
}
function fitPart(p) {
  const gr = S.grinder, need = A.build[gr.built.length];
  if (p.kind !== need) {
    sfx.no();
    const order = A.build.indexOf(p.kind), first = A.build[gr.built.length];
    return say(first === 'screw' ? 'gNeedScrew' : first === 'blade' ? 'gNeedBlade' : order > A.build.indexOf('plate') ? 'gNeedPlate' : 'gNeedBlade');
  }
  gr.built.push(p.id); sfx.clunk(); say('gOn'); done();
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
  ];
  return [
    { id: 'ship', x: 40, y: 100, w: 200, h: 52, label: STR.sSail, act: () => say('shipSays') },
    ...[...A.flags].map((L, i) => ({ id: 'flag' + i, x: FLAG_AT(i)[0] - 3, y: FLAG_AT(i)[1] - 3, w: 26, h: 19, label: fmt(STR.sFlag, { n: i + 1, desc: STR['f' + L] }), act: () => say(fmt(STR.sFlag, { n: i + 1, desc: STR['f' + L] }) + '.') })),
  ];
}

// ----- the crate -----
// Up in the hayloft. The padlock's dials match the parking meters; inside,
// in the straw, are Doc's arm and a little box with four letter wheels that
// holds his gauge.
const DIALX = [128, 160, 192], DIAL = [[C.steelL, C.steelD, 'colSilver'], [C.greenL, C.greenD, 'colGreen'], [C.redL, C.redD, 'colRed']];
const WHEELX = [148, 184, 220, 256];
const chev = (cx, y, up, c) => { for (let i = 0; i < 6; i++) { const k = up ? i : 5 - i; R(cx - k, y + i - 1, 2 * k + 1, 1, c); } };
function armItem(x, y) {   // Doc's swing arm, lying down: two rusty bars and a joint
  line(x - 1, y - 1, x + 30, y - 7, C.ink, 5); line(x + 31, y - 6, x + 52, y + 3, C.ink, 5);   // dark edges so it shows on the straw
  line(x, y, x + 30, y - 6, C.rustL, 3); disc(x + 31, y - 6, 3, C.rust); line(x + 32, y - 5, x + 52, y + 4, C.rustL, 3); R(x + 50, y + 2, 6, 5, C.steelD);
}
function gaugeItem(cx, cy) { disc(cx, cy, 8, C.ironD); disc(cx, cy, 7, C.white); line(cx, cy, cx - 4, cy - 3, C.red); px(cx, cy, C.ink); R(cx - 2, cy + 7, 4, 3, C.ironD); }
function drawCrate() {
  const c = S.crate;
  cached('bgCrate', r => { R(0, 0, W, H, '#2a1a0e'); for (let x = -200; x < W; x += 34) line(x, 0, x + 200, 160, '#3a2414', 3); R(0, 170, W, 30, C.woodD); for (let i = 0; i < 200; i++) px((r() * W) | 0, 170 + ((r() * 30) | 0), '#c9a84a'); });
  if (c.lid) {
    R(36, 18, 248, 46, C.wood); for (let y = 18; y < 64; y += 11) R(36, y, 248, 1, C.woodDD);
    R(36, 64, 248, 128, C.woodDD); R(40, 68, 240, 120, '#2a1a0c');
    dith(40, 140, 240, 50, '#c9a84a', 2); dith(41, 160, 238, 30, '#e0c060', 3);
    for (let i = 0; i < 30; i++) { const x = 44 + (i * 53) % 232, y = 132 + (i * 29) % 52; line(x, y, x + 6, y - 3, '#e8cc70'); }
    if (!got('arm')) armItem(50, 160);
    bev(122, 86, 160, 80, C.wood, C.woodL, C.woodDD);
    for (const [x, y] of [[122, 86], [276, 86], [122, 160], [276, 160]]) R(x, y, 6, 6, C.brass);
    if (!c.box) {
      R(130, 92, 144, 2, C.woodDD);
      c.wheels.forEach((l, i) => {
        const x = WHEELX[i];
        chev(x, 98, true, C.brassL);
        R(x - 13, 106, 26, 34, C.brassD); R(x - 10, 109, 20, 28, C.cream); R(x - 10, 109, 20, 3, C.creamD); R(x - 10, 134, 20, 3, C.creamD);
        textC(String.fromCharCode(65 + l), x + 1, 116, C.ink, 3);
        chev(x, 146, false, C.brassL);
      });
    } else {
      R(126, 90, 152, 72, '#2a1a0c'); bev(122, 66, 160, 22, C.wood, C.woodL, C.woodDD);
      if (!got('gauge')) { oval(202, 130, 22, 12, '#a89c78'); dith(182, 120, 40, 22, '#8a7a5a', 3); gaugeItem(202, 126); }
    }
  } else {
    R(36, 40, 248, 152, C.wood);
    for (let y = 40; y < 192; y += 25) { R(36, y, 248, 2, C.woodDD); R(36, y + 2, 248, 1, C.woodL); for (let x = 50; x < 280; x += 37) R(x, y + 8 + (x % 7), 10, 1, C.woodD); }
    R(36, 40, 18, 152, C.woodD); R(266, 40, 18, 152, C.woodD); R(36, 40, 2, 152, C.woodL);
    for (const x of [44, 274]) for (const y of [50, 182]) disc(x, y, 1, C.ironL);
    text(STR.art_up, 60, 172, 'rgba(30,18,8,.55)', 2);
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
  }
  shade(160, 100, 210, .7);
}
function crateSpots() {
  const c = S.crate, out = [];
  if (c.lid) {
    if (!got('arm')) out.push({ id: 'arm', x: 44, y: 140, w: 70, h: 30, label: STR.sCArm, act: () => { give('arm'); say('got', { item: inm('arm') }); done(); } });
    if (!c.box) c.wheels.forEach((l, i) => {
      const L = String.fromCharCode(65 + l);
      out.push({ id: 'wu' + i, x: WHEELX[i] - 17, y: 92, w: 34, h: 26, label: fmt(STR.sCWUp, { n: i + 1, l: L }), act: () => turnWheel(i, 1) });
      out.push({ id: 'wd' + i, x: WHEELX[i] - 17, y: 128, w: 34, h: 26, label: fmt(STR.sCWDown, { n: i + 1, l: L }), act: () => turnWheel(i, -1) });
    });
    else if (!got('gauge')) out.push({ id: 'gauge', x: 178, y: 112, w: 48, h: 34, label: STR.sCGauge, act: () => { give('gauge'); say('got', { item: inm('gauge') }); done(); } });
    return out;
  }
  if (!c.unlocked) c.lock.forEach((d, i) => {
    const col = STR[DIAL[i][2]];
    out.push({ id: 'lu' + i, x: DIALX[i] - 16, y: 76, w: 32, h: 30, label: fmt(STR.sCUp, { col, d }), act: () => turnDial(i, 1) });
    out.push({ id: 'ld' + i, x: DIALX[i] - 16, y: 118, w: 32, h: 30, label: fmt(STR.sCDown, { col, d }), act: () => turnDial(i, -1) });
  });
  out.push({ id: 'lid', x: 36, y: 40, w: 248, h: 28, label: STR.sCLid, act: () => { if (!c.unlocked) { sfx.no(); return say('cLocked'); } c.lid = true; sfx.creak(); say('cLid'); done(); } });
  out.push({ id: 'lock', x: 100, y: 150, w: 120, h: 14, label: STR.sCLock, act: () => say(c.unlocked ? 'cUnlocked' : 'cLocked') });
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
  barn: { title: 'vBarn', draw: drawBarn, spots: barnSpots },
  bench: { title: 'vBench', draw: drawBench, spots: benchSpots, parent: 'barn', at: [0, 44, 58, 104] },
  tack: { title: 'vTack', draw: drawTack, spots: tackSpots, parent: 'barn', at: [272, 56, 48, 94] },
  loft: { title: 'vLoft', draw: drawLoft, spots: loftSpots, parent: 'barn', at: [232, 14, 42, 28] },
  washer: { title: 'vWasher', draw: drawWasher, spots: washerSpots, parent: 'barn', at: [200, 82, 42, 86] },
  meters: { title: 'vMeters', draw: drawMeters, spots: meterSpots, parent: 'barn', at: [100, 66, 32, 88] },
  adder: { title: 'vAdder', draw: drawAdder, spots: adderSpots, parent: 'bench', at: [26, 66, 88, 58] },
  register: { title: 'vRegister', draw: drawRegister, spots: registerSpots, parent: 'bench', at: [196, 40, 116, 88] },
  grinder: { title: 'vGrinder', draw: drawGrinder, spots: grinderSpots, parent: 'bench', at: [118, 74, 72, 56] },
  dresser: { title: 'vDresser', draw: drawDresser, spots: dresserSpots, parent: 'tack', at: [152, 94, 58, 74], faces: () => ['faceFront', 'faceSide', 'faceBack'] },
  scale: { title: 'vScale', draw: drawScale, spots: scaleSpots, parent: 'tack', at: [220, 94, 64, 82] },
  ship: { title: 'vShip', draw: drawShip, spots: shipSpots, parent: 'loft', at: [18, 40, 100, 62], faces: () => ['facePort', 'faceStar'] },
  crate: { title: 'vCrate', draw: drawCrate, spots: crateSpots, parent: 'loft', at: [128, 124, 88, 70] },
};

// ---------- Solving, Doc's parts and his hints ----------
function solve(id) {
  if (S.solved[id]) return;
  S.solved[id] = true; S.docOn = true; AN.cheer = performance.now();
  setTimeout(sfx.solve, 250);
}
// Handing Doc something: one of his own pieces goes back on him and brings a
// memory back; the ledger page he reads under his lamp; anything else he
// declines, politely.
function giveDoc(id) {
  S.held = null; S.docOn = true; AN.flick = performance.now();
  if (PARTS_OF_DOC.includes(id)) {
    useUp(id); S.parts[id] = true; solve(id); sfx.whirr();
    if (id === 'gauge') { S.done = true; done(); return endCard(); }
    say(id === 'lamp' ? 'docLamp' : 'docArm', null, 'doc');
    return done();
  }
  if (id === 'ledger') {
    if (!S.parts.lamp) { sfx.no(); say('ledgerDim', null, 'doc'); return done(); }
    S.ledgerLit = true; solve('ledger'); say('ledgerLit', null, 'doc'); return done();
  }
  sfx.no(); say('docNoUse', { item: inm(id) }, 'doc'); refresh();
}
// What Doc talks about: something left to do in the close-up you're looking
// at, else the first thing in the barn you can get on with. Each step's key
// picks its three hints. (Counting close-ups inside the place you're in as
// "here" was tried: on the barn floor he talked about the meters while the
// receipt still needed adding up at the workbench.)
const coins = ['penny', 'nickel', 'dime'];
const STEPS = [
  { view: 'washer', left: () => !S.solved.washer || (S.washer.drained && S.washer.lid && !got('penny')), ready: () => true,
    key: () => { const w = S.washer; if (w.noteIn) return 'washer.crank'; if (has('soggy')) return 'washer.wring'; if (w.lid && w.drained) return 'washer.take'; return 'washer.start'; } },
  { view: 'adder', left: () => !S.solved.adder, ready: () => got('receipt'), key: () => 'receipt' },
  { view: 'register', left: () => !S.solved.register || (S.reg.open && (!got('lamp') || !got('nickel'))), ready: () => got('receipt'), key: () => S.reg.open ? 'register.take' : 'register' },
  { view: 'barn', left: () => !S.parts.lamp, ready: () => has('lamp'), key: () => 'lamp' },
  { view: 'barn', left: () => !S.loftSeen, ready: () => S.parts.lamp, key: () => 'loft' },
  { view: 'loft', left: () => !S.ledgerLit, ready: () => S.parts.lamp, key: () => got('ledger') ? 'ledger' : 'ledger.find' },
  { view: 'dresser', left: () => !got('sash'), ready: () => true, key: () => S.dresser.panel ? 'secret.take' : 'secret' },
  { view: 'scale', left: () => !S.solved.scale || !got('dime'), ready: () => true, key: () => S.scale.open ? 'scale.take' : (got('sash') ? 'scale' : 'scale.short') },
  { view: 'meters', left: () => !S.solved.meters, ready: () => coins.some(has), key: () => coins.every(got) ? 'meters' : 'meters.short' },
  { view: 'crate', left: () => !S.solved.lock, ready: () => !!S.solved.meters && S.loftSeen, key: () => 'lock' },
  { view: 'crate', left: () => !got('arm'), ready: () => !!S.solved.lock, key: () => S.crate.lid ? 'arm.take' : 'box.lid' },
  { view: 'barn', left: () => !S.parts.arm, ready: () => has('arm'), key: () => 'arm' },
  { view: 'tack', left: () => !got('crank'), ready: () => S.parts.arm, key: () => 'shelf' },
  { view: 'grinder', left: () => !S.solved.grinder, ready: () => S.ledgerLit || got('crank'),
    key: () => { const gr = S.grinder; if (gr.jam) return 'grinder.jam'; if (gr.built.length < 4) return S.ledgerLit ? 'grinder.parts' : 'grinder.which'; if (!gr.crank) return 'grinder.crank'; if (!gr.out) return 'grinder.turn'; return 'grinder.take'; } },
  { view: 'crate', left: () => !S.solved.box, ready: () => S.crate.lid, key: () => got('chart') ? 'box' : 'box.nochart' },
  { view: 'ship', left: () => !S.solved.box, ready: () => got('chart'), key: () => 'box' },
  { view: 'crate', left: () => !got('gauge'), ready: () => !!S.solved.box, key: () => 'gauge.take' },
  { view: 'barn', left: () => !S.parts.gauge, ready: () => has('gauge'), key: () => 'gauge' },
];
function hintNow() {
  const step = STEPS.find(s => s.left() && s.ready() && s.view === view) || STEPS.find(s => s.left() && s.ready());
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
  $('#backBtn').hidden = !VIEWS[view].parent;
  $('#docBtn span').textContent = S.held ? STR.giveDoc : STR.crankDoc;
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
  if (['receipt', 'ledger', 'chart'].includes(id)) { S.held = null; refresh(); return readCard(id); }
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
    case 'receipt': R(6, 2, 12, 20, C.paper); for (let i = 0; i < 5; i++) R(8, 5 + i * 3, 8, 1, '#6a5a40'); for (let x = 6; x < 18; x += 2) px(x, 21, C.paperD); break;
    case 'ledger': R(4, 4, 16, 16, C.paper); R(4, 4, 16, 3, '#4a6a3a'); for (let i = 0; i < 4; i++) R(6, 9 + i * 3, 11, 1, i === 2 ? C.ink : '#6a5a40'); break;
    case 'lamp': lampItem(10, 12); break;
    case 'arm': line(2, 16, 11, 9, C.rustL, 2); disc(12, 9, 2, C.rust); line(12, 10, 20, 18, C.rustL, 2); break;
    case 'gauge': gaugeItem(12, 11); break;
    case 'chart': R(3, 5, 18, 14, C.paper); flag('S', 5, 7, 6, 4); flag('R', 13, 7, 6, 4); flag('T', 5, 13, 6, 4); flag('O', 13, 13, 6, 4); break;
    case 'penny': case 'nickel': case 'dime': coin(12, 12, id); break;
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
  showDoc: () => { closeCard(); giveDoc('ledger'); },
  wipe: () => { S = fresh(S); S.started = true; save(); view = 'barn'; face.dresser = face.ship = 0; AN.needles = [0, 0, 0]; AN.tilt = 0; closeCard(); setMsg(STR.startHow); },
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
  if (id === 'receipt') {
    const rows = A.receipt.map(([k, c]) => `<tr><td>${esc(STR['r_' + k])}</td><td>${money(c)}</td></tr>`).join('');
    card(`<h2 id="cardTitle">${esc(STR.receiptTitle)}</h2><div class="paper receipt"><p>${esc(STR.receiptHead)}</p><table>${rows}<tr class="total"><td>${esc(STR.receiptTotal)}</td><td>______</td></tr></table><p>${esc(STR.receiptFoot)}</p></div>${btn}`);
  }
  if (id === 'ledger') {
    const lines = STR.ledgerLines.map(l => `<li${l.includes('{no}') && !S.ledgerLit ? ' class="scratched"' : ''}>${esc(fmt(l, { no: S.ledgerLit ? A.grinderNo : STR.ledgerScratched }))}</li>`).join('');
    const row = S.ledgerLit ? btn : `<p class="soft">${esc(STR.ledgerHint)}</p><div class="row"><button class="btn" type="button" data-act="close">${esc(STR.close)}</button><button class="btn go" type="button" data-act="showDoc">${esc(STR.giveDoc)}</button></div>`;
    card(`<h2 id="cardTitle">${esc(STR.ledgerTitle)}</h2><div class="paper"><ul class="ledger">${lines}</ul></div>${row}`);
  }
  if (id === 'chart') card(`<h2 id="cardTitle">${esc(STR.chartTitle)}</h2><p>${esc(STR.chartLine)}</p><img class="chart" src="${chartImage()}" alt="${esc(STR.chartAlt)}" width="132" height="52">${btn}`);
}
// Doc's last memory, when his gauge goes back on
function endCard() {
  const ducks = fmt(STR.ducks, { n: S.duck ? 1 : 0, m: 1 });
  card(`<h2 id="cardTitle">${esc(STR.endTitle)}</h2><div class="paper">${esc(STR.docGauge)}\n\n${esc(STR.endMore)}</div><p>${esc(STR.endNext)}</p><p class="soft">${esc(ducks)}</p>` +
    `<div class="row"><button class="btn" type="button" data-act="over">${esc(STR.startOver)}</button><button class="btn go" type="button" data-act="close">${esc(STR.keepLooking)}</button></div>`);
}

// ---------- Moving between views ----------
let tr = null;   // the zoom: { parent, child, t0, out }
// Going into a place or a close-up zooms into where it sits in its parent's
// picture (`at`); Back zooms out of it again.
function go(to) {
  if (tr || to === view) return;
  const out = VIEWS[view].parent === to;
  const child = out ? view : to, parent = VIEWS[child].parent;
  tr = parent ? { parent, child, t0: performance.now(), out } : null;
  view = to; S.held = null;
  setMsg('');
  refresh();
  if (lastInput === 'key') { const f = $('#spots .spot'); if (f) f.focus(); }
}
const goBack = () => { const p = VIEWS[view].parent; if (p) go(p); };
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
    G = bufA.getContext('2d'); VIEWS[tr.parent].draw(now);
    G = bufB.getContext('2d'); VIEWS[tr.child].draw(now);
    G = g0; g0.imageSmoothingEnabled = false;
    const [rx, ry, rw, rh] = VIEWS[tr.child].at;
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
    G = c.getContext('2d'); G.clearRect(0, 0, 34, 38); docHead(2, 10, now);
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
  if (e.key === 'Escape' || e.key === 'Backspace') { if (VIEWS[view].parent) { e.preventDefault(); goBack(); } return; }
  const k = e.key.toLowerCase();
  if (k === 'h') { e.preventDefault(); crankDoc(); }
  else if (k === 'q') { e.preventDefault(); turn(-1); }
  else if (k === 'e') { e.preventDefault(); turn(1); }
});
RDG.pad({ a: ' ', b: 'Escape', y: 'h', select: 'h', l: 'q', r: 'e', zl: 'q', zr: 'e', start: 'Enter' });

// ---------- Start ----------
document.querySelectorAll('[data-s]').forEach(e => { e.textContent = STR[e.dataset.s]; });
document.querySelectorAll('[data-s-label]').forEach(e => { e.setAttribute('aria-label', STR[e.dataset.sLabel]); });
$('#backBtn').addEventListener('click', goBack);
$('#turnL').addEventListener('click', () => turn(-1));
$('#turnR').addEventListener('click', () => turn(1));
$('#docBtn').addEventListener('click', () => S.held ? giveDoc(S.held) : crankDoc());
$('#soundBtn').addEventListener('click', () => { S.sound = !S.sound; save(); refresh(); });
addEventListener('resize', fit);
A.meters.forEach((m, i) => { AN.needles[i] = S.meters[i] ? m.reads : 0; });
AN.tilt = Math.max(-1, Math.min(1, A.sack - panWeight())) * 10;
refresh(); fit();
requestAnimationFrame(frame);
startCard();
