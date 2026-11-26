// The Mighty Pepper. Designed by Randi, 22 Nov (Trello #58): an 8-bit western
// on the ranch, seen from above like Bread the Corgi. Pepper is a cowgirl pup
// in a hat and bandana (a dachshund mix who looks like a mini Rottweiler,
// black and tan). She takes jobs from the Wanted board by the barn and
// wrangles the critters that plague the ranch, while the family pets show her
// the ropes and can't stand her.
//
// Version 1 is the foundation: one map (the yard, the barn and the rock
// pile), three jobs, the tumbleweeds and shoes that pull Pepper off the job,
// Respect, and the two cats. Added 25 Nov: Biscuit's team catch (the barn
// mice), and a day that ends: dusk with the bats, the deer and Izzy, a night
// indoors watching Sid and the fox through the window, and dawn with the
// jackrabbits.
//
// The skill underneath is self-control, never said out loud: Stay is what
// wins. Holding Stay lets a tumbleweed or a boot go by, lets Biscuit finish a
// hunt, and once Biscuit has shown her how, Stay and walk is the sneak that
// gets Pepper close to the lizards.
const $ = s => document.querySelector(s);

// ---------- Words ----------
// Every visible string is here by key, whole sentences with {placeholders}
// (the parent rule for a new product). Lists are picked from at random.
const STR = {
  title: 'The Mighty Pepper',
  intro: 'Pepper is a cowgirl pup. Take a job from the Wanted board by the barn, wrangle the critters that plague the ranch, and win over the ranch cats.',
  play: 'Play', startOver: 'Start over', cancel: 'Cancel', close: 'Close', keepPlaying: 'Keep playing',
  startOverAsk: 'Start over? Respect, the jobs and the sneak go back to the start. Pepper keeps her stash and Izzy\'s stories.',
  respect: 'Respect', ranch: 'The ranch', stick: 'Walking stick', helpBtn: 'How to play', closeHelp: 'Close help', soundBtn: 'Sounds on or off',
  stay: 'Stay', bark: 'Bark',
  actPounce: 'Pounce', actRead: 'Read', actFill: 'Fill', actMmf: 'Mmf', actSleep: 'Sleep',
  stash: 'Pepper\'s stash under the porch', notYet: 'Not found yet',
  help: [
    '<b>Walk:</b> arrow keys, WASD, the stick, or hold a finger on the ranch.',
    '<b>Pounce, Read, Fill a hole:</b> Space or the big button. The button says which.',
    '<b>Bark:</b> X or the Bark button.',
    '<b>Stay:</b> hold Z or Shift, or hold the Stay button.',
    '<b>Wake Izzy:</b> sit beside her on the porch (hold Stay).',
    '<b>Help:</b> H or ?. A controller works too.',
  ],
  storiesH: 'Izzy\'s stories', noStories: 'Sit beside Izzy on the porch to hear one.',
  helpSneak: '<b>Sneak:</b> hold Stay and walk.',
  goalBoard: 'Read the Wanted board by the barn.',
  goalSquirrels: 'Bark at the Squirrel Gang to run them out of town, then fill in their holes.',
  goalWood: 'Get under the Knock-Knock Kid while it drums, then bark. Freeze when it looks round.',
  goalLizards: 'Sneak up on the lizards and pounce. Lizard Lou only shuts his eyes for a moment.',
  goalLizardsNoSneak: 'The lizards are too quick for Pepper. Stand still near Biscuit and watch her hunt.',
  goalMice: 'Herd the barn mice into the long grass, where Biscuit lies in wait. They run from Pepper.',
  goalDusk: 'Deer in the garden! Wake Izzy on the porch: sit beside her.',
  goalIzzy: 'Lead Izzy to the deer. Not too fast: her legs are old.',
  goalIn: 'Time to come in. Go to the door.',
  goalNightSid: 'Sid is eating on the porch. Watch from the window, quietly.',
  goalNightFox: 'A fox on the porch! That one is worth a bark.',
  goalNight: 'Bedtime. Go to your bed and press Sleep.',
  goalCarry: 'Put the {item} in the stash under the porch, or take it back where it was.',
  goalDinner: 'Dinner on the porch. Cats first.',
  board: 'Wanted',
  wanted: 'WANTED',
  takeJob: 'Take the job', onJob: 'On the job', caught: 'CAUGHT!',
  postAgain: 'Post them again',
  jobs: {
    squirrels: { name: 'The Squirrel Gang', short: 'Squirrel Gang', line: 'Digging holes all over the yard.' },
    woodpecker: { name: 'The Knock-Knock Kid', short: 'Knock-Knock Kid', line: 'Drumming holes in the barn.' },
    lizards: { name: 'Lizard Lou and the Sunbathers', short: 'Lizard Lou', line: 'Hogging the hot rocks.' },
    mice: { name: 'The Barn Mice', short: 'Barn Mice', line: 'Too small to pin. Herd them to Biscuit.' },
  },
  pill: '{name}: {n} to go', pillShort: '{n} to go',
  jobTaken: 'On the job: {name}.',
  jobDone: 'Job done! {name}, run out of town.',
  notOnJob: 'Not on the job yet. Check the Wanted board.',
  allTitle: 'The ranch is quiet',
  allText: 'Every outlaw on the board is run out of town. For now.',
  starTitle: 'Sheriff Pepper!',
  starText: 'The cats talked it over. They sighed a lot. Pepper wins the sheriff\'s star.',
  sqGone: ['Skedaddle!', 'And stay out!', 'Run out of town!', 'We\'ll be back! Probably not.'],
  sqScatter: 'Scattered! They\'ll be back.',
  holeFilled: 'Filled in. Good as new.',
  woodSpotted: ['Knock knock! Ha!', 'Saw you coming, pup!', 'Knock knock! Who\'s there? Not you!'],
  woodScared: 'SQUAWK! {n} of {max}.',
  woodFar: 'Knock knock! Too far away, pup.',
  woodGone: 'The Knock-Knock Kid flew off for good!',
  lizGone: ['Gotcha! Off the rocks!', 'Hey! I was tanning!', 'Fine, fine. We\'re going.'],
  louGone: 'Lizard Lou is off the ranch!',
  lizQuick: 'Too quick! Stand still and watch how Biscuit does it.',
  mouseSmall: 'Too small to pin! Herd it to Biscuit.',
  teamCatch: ['Teamwork! Biscuit got it.', 'Nice herding. Biscuit got it.', 'Biscuit got it. She almost smiled.'],
  swat: 'SWAT! Biscuit does not want to play.',
  crooked: 'Mrrow?! Tato runs off crooked.',
  ruin: 'It got away. Biscuit gives you The Look.',
  watched: 'Biscuit got it! You watched like a pro.',
  learned: 'Pepper learned the sneak! Hold Stay and walk to creep up quiet.',
  biscuitGot: 'Biscuit got one. Show-off.',
  tatoMiss: ['Tato pounced. Tato missed.', 'Mrrp? Tato missed again.', 'Tato meant to do that.'],
  sitBiscuit: 'Biscuit allows it. Barely.',
  sitTato: 'Tato tilts at you. That means yes.',
  chaseLine: { tumble: 'TUMBLEWEED!', rabbit: 'JACKRABBIT!', bat: 'BATS!' },
  dusk: 'The sun is going down. The bats are out.',
  deerCome: 'Deer! They\'re after the garden.',
  deerIgnore: 'The deer don\'t even look up.',
  stomp: 'STOMP! Pepper thinks better of it.',
  izzyUp: 'Deer? Leave it to me, pup. Slowly.',
  izzyWait: 'These old legs. Wait for me, pup.',
  izzyGo: 'Right behind you. More or less.',
  izzyWin: 'WOOF! Izzy\'s still got it.',
  izzyGrump: 'Back in my day, pups let a dog sleep.',
  gardenGone: 'The deer ate the whole garden. It\'ll grow back.',
  comeIn: 'Pepper! Time to come in!',
  nightIn: 'Night. The pets are kept in.',
  sidCome: 'Sid. On OUR porch. Eating OUR food.',
  tatoSid: 'Tato thinks Sid is a dog. Tato is not sure.',
  sidBlink: 'Sid looked up and gave Pepper a slow blink.',
  houseYell: 'PEPPER! It\'s the middle of the night!',
  sidRan: 'Sid ran off.',
  sidDone: 'Sid licked the bowl clean and wandered off.',
  foxHere: 'A fox. Now THAT is worth a bark.',
  goodGirl: 'Good girl, Pepper. Go away, fox!',
  foxSlunk: 'The fox sniffed the bowl and slunk off.',
  morning: 'Morning! The jackrabbits are out.',
  // Izzy's stories of the old farm, told one at a time (ours, 25 Nov)
  stories: [
    'Back on the old farm, I barked a bull right out of the barley. Big bull. Bigger bark.',
    'I guarded the hen house a whole winter. Not one egg went missing. Well. One.',
    'Deer? On the old farm the deer asked MY permission.',
    'We had a goat called Trouble. I was the only one he listened to.',
    'I was quick once, pup. Quicker than a jackrabbit. Almost.',
    'The old farm had a creek. I never fell in. Twice.',
    'A barn owl lived over the hay. She took the night shift, I took the day.',
    'Every pup thinks her first fox is a big dog. Bark anyway.',
  ],
  pant: 'Pant pant. Where was I?',
  resist: 'Good stay! Let it go.',
  items: { boot: 'cowboy boot', boot2: 'other cowboy boot', sockHoley: 'holey sock', sockStripe: 'striped sock', sockPolka: 'polka-dot sock', slipper: 'muddy slipper' },
  grab: 'Got the {item}!',
  calls: { boot: 'Where\'s my other boot?!', sock: 'Who took my sock?!', slipper: 'Has anyone seen my slipper?!' },
  stashed: 'Into the stash! {n} of {max} kinds.',
  returned: 'Thanks, pup!',
  mmf: 'Mmf! Mouth full.',
  dinner: 'Dinner!',
  ladies: 'Pepper! Cats first.',
  waited: 'Good pup. Cats first.',
};
const t = (k, v = {}) => { let s = k.split('.').reduce((o, p) => o[p], STR); if (Array.isArray(s)) s = s[Math.floor(Math.random() * s.length)]; return s.replace(/\{(\w+)\}/g, (_, n) => v[n]); };

// ---------- Tuning ----------
// Every number here is ours (22 Nov), not from the card. Distances are in
// tiles, speeds in tiles a second, times in seconds. Change after play-tests.
const TUNE = {
  walk: 4.2, sneak: 1.5, chaseRun: 5.2, cat: 2.2, tato: 3.4, stalk: .6,
  bark: 3.6,                                    // squirrels and the woodpecker hear a bark this far
  sqSees: 2.6, sqSeesQuiet: 1.1, dig: 5, maxHoles: 8, startHoles: 3, fill: .9,
  woodSees: 4, woodClose: 2.2, drum: [3, 4.5], look: [1.4, 2.2], scares: 3,
  lizSees: 3.4, lizSeesQuiet: 1, louSees: 3.2, louNap: 2.6, louAwake: [3.5, 5.5],
  pounce: 1.5, pounceTime: .28, pounceHit: 1.1,
  mice: 3, mouseSees: 3, mouseSeesQuiet: 1, mouseRun: 3.1, mouseBolt: 5.5, ambushReach: 1.5,
  duskAt: 160, dawnLen: 30, deer: 2, deerWalk: 1.3, deerEat: 6, stomp: 1.5, izzyWalk: 1.8, izzyLag: 5, izzyReach: 4.5, izzyWake: 1.2, storyCool: 90,
  bats: 6, batSwoop: [6, 10], rabbits: 3, rabbitRun: 6, nightSid: 3, sidEat: 22, foxAfter: 4, foxSniff: 7, blinkWatch: 5,
  tumbleEvery: [16, 28], tumbleSpeed: 2.6, tumbleNear: 4, shoeNear: 1.6, warn: .7, chase: 2.5, callAfter: 4,
  huntFirst: 8, huntEvery: [20, 32], huntZone: 3.5, watch: 8,
  tatoEvery: [9, 15],
  dinnerFirst: 70, dinnerEvery: 110, eat: 6,
  sitNice: 3, sitCool: 25,
  respect: { start: 20, swat: -8, crooked: -5, ruin: -6, ladies: -6, sit: 3, resist: 3, returned: 6, watched: 10, waited: 8, job: 15, team: 5, izzy: 8, blink: 8, fox: 6, yell: -6 },
  hint: 5000,
};

// ---------- Save ----------
// One save per device, under `mighty-pepper`. The stash is a collection, like
// Feed the Fart's farts: how many of each kind Pepper has ever squirrelled away.
const KEY = 'mighty-pepper';
const S = Object.assign({ respect: TUNE.respect.start, star: false, sneak: false, job: null, done: {}, stash: {}, stories: 0, blinks: 0, sound: true, seenHelp: false, started: false }, load());
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

// ---------- Screen ----------
// Decided 22 Nov: Bread's 8-bit way, 16 pixels to a tile on a small canvas
// scaled up with smoothing off, and a camera that follows Pepper round a map
// bigger than the screen.
const T = 16, MW = 40, MH = 26;
let VW = 20, VH = 12;                           // the view in tiles; taller on a phone held upright
const lo = document.createElement('canvas'); lo.width = VW * T; lo.height = VH * T;
const cx = lo.getContext('2d'); cx.imageSmoothingEnabled = false;
const cv = $('#cv'), out = cv.getContext('2d');
function resize() {
  const coarse = matchMedia('(pointer:coarse)').matches, upright = innerHeight > innerWidth;
  const roomH = innerHeight - (coarse && upright ? 13.5 * 16 : 0) - (upright ? 3.4 * 16 : 0);
  // upright, a 20 x 12 view was a thin strip with empty screen under it (22
  // Nov, at 375 x 812), so it shows fewer tiles across and more down instead
  VW = upright ? 12 : 20;
  VH = upright ? clamp(Math.floor(roomH * VW / innerWidth), 10, 18) : 12;
  if (lo.width !== VW * T || lo.height !== VH * T) { lo.width = VW * T; lo.height = VH * T; cx.imageSmoothingEnabled = false; }
  let w = innerWidth, h = w * VH / VW;
  if (h > roomH) { h = Math.max(160, roomH); w = h * VW / VH; }
  $('#box').style.width = w + 'px';
  cv.style.height = h + 'px';
  const k = Math.max(1, Math.ceil(w * Math.min(2, devicePixelRatio || 1) / lo.width));
  cv.width = lo.width * k; cv.height = lo.height * k;
}
addEventListener('resize', resize);

// ---------- Colours and sprites ----------
const LINE = '#16121a';
const C = {
  k: '#16121a', n: '#34303b', N: '#4e4858',     // black fur and its shine
  t: '#c27a35', T: '#e3a55c',                    // Pepper's tan
  w: '#fbf6ea', y: '#f2c230', Y: '#c9961c', g: '#7ccf5a', p: '#f0a0a8',
  r: '#d8343f', R: '#9e2230', h: '#9a6232', H: '#5e3a1c',
  s: '#9a7c5e', S: '#c2a07a', c: '#efe0c4',       // squirrel
  l: '#86a83e', L: '#5e7d2a',                    // lizard
  b: '#8a5a30', B: '#5e3a1c', q: '#c9a25e', Q: '#8a6a3a', m: '#7a5a3a',
  u: '#5a86c8', v: '#e8e0d0', e: '#b8b8c4', o: '#d8823a', O: '#9a4e22', z: '#7fb8e8',
};
const LOU = { ...C, l: '#d8a23a', L: '#9a5e22', k: '#16121a' };
const spr = (rows, opt) => RDG.sprite(rows, opt && opt.colors || C, { line: LINE, flip: !!(opt && opt.flip), outline: !(opt && opt.outline === false) });
function put(img, x, y, scale = 1) { cx.drawImage(img, Math.round(x), Math.round(y), img.width * scale, img.height * scale); }
const px = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); };

// Pepper, side on, facing right: long dachshund body, Rottie black and tan,
// a floppy ear, a cowgirl hat and a red bandana.
const PEP_TOP = [
  '..............hhhhh.....',
  '.............hhhhhhh....',
  '...........hhHHHHHHHhh..',
  '............nnnnnnnN....',
  '............nnTnnnnnn...',
  '............nnwknnnTTk..',
  '.n..........Nnnnnttttt..',
  '.nn.........NNrrrrtt....',
  '..NNNNNNNNNNnnrrrr......',
  '..nnnnnnnnnnnnnrr.......',
  '..nnnnnnnnnnnnttn.......',
];
const PEPPER = {
  a: [...PEP_TOP, '...tnnnnnnnnnttt........', '...tt........tt.........', '...tt........tt.........'],
  b: [...PEP_TOP, '...tnnnnnnnnnttt........', '..tt..........tt........', '..tt..........tt........'],
  sit: [...PEP_TOP, '..tttnnnnnnnnttt........', '..ttt........tt.........'],
  run: [...PEP_TOP, '..ttnnnnnnnnnnttt.......', '.tt.............tt......', 'tt...............t......'],
};
// The two cats. Biscuit is short-haired black and white (Randi, 22 Nov): a
// white blaze, chest and paws. Tato is all black, head tilted, green eyes.
const BIS_HEAD = ['............n...n', '............nnnnn', 'n...........nywyn', 'n...........nwwwn', '.n..........wwpww'];
const BIS_BODY = ['.n...nnnnnnnnwww.', '..NNNNNNNNNNNww..', '...nnnnnnnnnnww..', '...nnnnnnnnnnn...'];
const TATO_HEAD = ['.............n...', '............nnn.n', 'n...........ngnnn', 'n...........nnngn', '.n..........nnpnn'];
const TATO_BODY = ['.n...nnnnnnnnnnn.', '..NNNNNNNNNNNnn..', '...nnnnnnnnnnnn..', '...nnnnnnnnnnn...'];
function catSet(head, body, paw) {
  return {
    a: [...head, ...body, `...n${paw}.......n${paw}...`, `...${paw}${paw}.......${paw}${paw}...`],
    b: [...head, ...body, `....n${paw}.....n${paw}....`, `....${paw}${paw}.....${paw}${paw}....`],
    low: ['.'.repeat(17), '.'.repeat(17), ...head.slice(0, 4), body[0].slice(0, 12) + head[4].slice(12), body[1], body[2], `..${paw}${paw}.......${paw}${paw}....`],
  };
}
const BISCUIT = catSet(BIS_HEAD, BIS_BODY, 'w');
const TATO = catSet(TATO_HEAD, TATO_BODY, 'n');
const SQUIRREL = {
  a: ['.SS.......', 'SSSS......', 'SS.SS..ss.', 'S...S.ssss', '....Ssssks', '....sssss.', '.....scc..', '.....s.s..'],
  dig: ['..........', '.SS.......', 'SSSS......', 'SS.SS.....', 'S...Sssss.', '....ssssss', '.....scsks', '....s.s...'],
};
const BIRD = {
  a: ['..rrr..', '.rrrrr.', '.nwkwee', '.nwwww.', '.nnwnn.', '.nnwnn.', '.nnnnn.', '..nnn..', '..n.n..', '.nn.nn.'],
  peck: ['...rrr.', '..rrrrr', '..nwkwe', '.nwwww.', '.nnwnn.', '.nnwnn.', '.nnnnn.', '..nnn..', '..n.n..', '.nn.nn.'],
  fly: ['..rrr..', '.rrrrr.', 'nnwkwee', 'nnnnnnn', 'n.nwn.n', '..nnn..', '..n.n..'],
};
// a barn mouse, side on, facing right: pink ear and tail
const MOUSE = ['....p..', 'peeeeek', '.eeeeee', '..e..e.'];
// Izzy (Randi, 22 Nov): an old corgi-chihuahua with a big bark, retired on
// the porch. Tan and white, big ears, a grey muzzle.
const IZZY = {
  a: ['..........T...T.', '..........TT.TT.', '..........ttttt.', '..t.......tkttte', '.tt.......twwtee', '..tttttttttwwe..', '..tttttttttww...', '..wwtttttttww...', '...ww.....ww....', '...w.w....w.w...'],
  sleep: ['..........T...T.', '..t.......TTtTT.', '.tt.......ttttte', '..ttttttttttttee', '..tttttttttttww.', '..wwwwwwwwwwww..'],
};
const DEER = {
  a: ['..............h.h.', '..............hhh.', '.............hhkhh', '.............hhhhH', '.............hhh..', '..hhhhhhhhhhhhhh..', '.whhhhhhhhhhhhh...', 'wwhhhhhhhhhhhhh...', '.whhhhhhhhhhhhh...', '..HHHhhhhhhHHHH...', '..h.h......h.h....', '..h.h......h.h....', '..h.h......h.h....', '..H.H......H.H....'],
  eat: ['..hhhhhhhhhhhh....', '.whhhhhhhhhhhhh...', 'wwhhhhhhhhhhhhhh..', '.whhhhhhhhhhhhhhh.', '..HHHhhhhhhHHH.hhh', '..h.h......h.h.hkh', '..h.h......h.h.hhH', '..h.h......h.h....', '..H.H......H.H....'],
};
// the barn's bats (Randi, 25 Nov), and the jackrabbits at dawn
const BAT = { a: ['n.......n', 'nn.nnn.nn', '.nnnnnnn.', '...n.n...'], b: ['.........', '...nnn...', 'nnnnnnnnn', 'n..n.n..n'] };
const RABBIT = {
  a: ['........S.S.', '........S.S.', '........S.S.', '.......SSSS.', '.......SSkSS', 'c.SSSSSSSSS.', 'ccSSSSSSSS..', '.SSSSSSSS...', '..S....SS...'],
  b: ['........S.S.', '........S.S.', '.......SSSS.', 'c.SSSSSSSkSS', 'ccSSSSSSSSS.', '.SSSSSSSSS..', 'SS.......SS.'],
};
// Sid (Randi, 22 Nov): a visiting long-haired tabby, fed on the porch at night
const SIDC = { ...C, s: '#6e5238', S: '#a8845a', m: '#54402c', c: '#efe0c4', y: '#e0b030' };
const SID = ['............s...s.', '...........sSs.sSs', '.ss........SSSSSSS', 'sSSs.......SySSSyS', '.sSSs......SSScSSS', '..sSm......cScccSs', '...sSSmSSmSSmcccs.', '..sSSmSSmSSmSSccs.', '.sSSSmSSmSSmSSSs..', '..sSSSSSSSSSSSSs..', '...ss.ss...ss.ss..'];
const FOX = ['.............O..O.', '.............OOOO.', '.............ooko.', 'ww...........oowwk', 'wOoo........ooww..', '.oOoooooooooooww..', '..ooooooooooooo...', '...oooooooooooo...', '...k.k......k.k...', '...k.k......k.k...'];
const PLANT = ['..gLLg..', '.gLggLg.', 'gLggggLg', '.gLggLg.', '..ggggg.', '...HH...'];
const STUB = ['...LL...', '..gHHg..', '...HH...'];
const LIZ = ['....l...l....', 'l...lllll.lk.', '.lllLLLLLllll', '....lllll.lk.', '....l...l....'];
const LIZ_SHUT = LIZ.map(r => r.replace(/k/g, 'L'));
const TUMBLE = ['..qQqQq...', '.Q.q.Q.q..', 'q.Q.qQ.Qq.', 'Qq.Q..q.Q.', '.q.Qq.Q.q.', 'Q.q..Q.qQ.', '.Qq.Q.q.Q.', '..q.QqQ...', '...Qq.q...'];
const ITEM_PIX = {
  boot: ['..bbb.', '..bBb.', '..bbb.', '..bBb.', '..bbbb', 'bbbbbb', 'BB..BB'],
  sockHoley: ['vvv.', 'vvv.', 'vkv.', 'vvv.', 'vvvv', 'vvkv', '.vvv'],
  sockStripe: ['www.', 'rrr.', 'www.', 'rrr.', 'wwww', 'rrrr', '.www'],
  sockPolka: ['uuu.', 'uwu.', 'uuu.', 'wuu.', 'uuwu', 'uuuu', '.uwu'],
  slipper: ['..pppp..', '.pmpppp.', 'pppppmpp', 'mmmmmmmm'],
};
const HOLE = ['..QQQQQQ..', '.QmmmmmmQ.', 'QmBBBBBBmQ', '.QmmmmmmQ.', '..QQQQQQ..'];
const BOWL = ['.yyyy.', 'RRRRRR', '.RRRR.'];
const BOWL_FULL = ['.hHhh.', 'RRRRRR', '.RRRR.'];
const STAR = ['...y...', '..yyy..', 'yyyyyyy', '.yyYyy.', '.yy.yy.', 'yy...yy'];
const EMOTE = {
  '!': ['y', 'y', 'y', '.', 'y'],
  '?': ['yyy', '..y', '.yy', '...', '.y.'],
  heart: ['.p.p.', 'ppppp', 'ppppp', '.ppp.', '..p..'],
  look: ['rr.rr', 'r...r', '.....', 'r...r', 'rr.rr'],
  dots: ['w.w.w'],
  sweat: ['.z', 'zz', 'zz'],
  z: ['www', '..w', '.w.', 'www'],
};
// Faces for the reaction line, in the spirit of Feed the Fart's.
const FACES = {
  biscuit: ['.n........n.', '.nn......nn.', '.nnnnwwnnnn.', 'nnnnnwwnnnnn', 'nnyynwwnyynn', 'nnyknwwnkynn', 'nnnnwwwwnnnn', 'nnnwwppwwnnn', '.nnwwwwwwnn.', '..nnwwwwnn..', '....nnnn....'],
  look: ['.n........n.', '.nn......nn.', '.nnnnwwnnnn.', 'nnnnnwwnnnnn', 'nnnnnwwnnnnn', 'nnkknwwnkknn', 'nnyynwwnyynn', 'nnnwwppwwnnn', '.nnwkkkkwnn.', '..nnwwwwnn..', '....nnnn....'],
  tato: ['.n..........', '.nn......n..', '.nnnnnnnnnn.', 'nnnnnnnnnnnn', 'nggnnnnnnnnn', 'nkgnnnnnnggn', 'nnnnnnnnnkgn', 'nnnnnppnnnnn', '.nnnnnnnnnn.', '..nnnnnnnn..', '....nnnn....'],
  pepper: ['...hhhhhh...', '..hhhhhhhh..', 'hhHHHHHHHHhh', '.nnnnnnnnnn.', 'NnTnnnnnnTnN', 'NnwknnnnwknN', 'NnnnttttnnnN', '.NnttkkttnN.', '..nttttttn..', '...rrrrrr...', '....rrrr....'],
  guilty: ['...hhhhhh...', '..hhhhhhhh..', 'hhHHHHHHHHhh', '.nnnnnnnnnz.', 'NnTnnnnnnTzN', 'NnkwnnnnkwnN', 'NnnnttttnnnN', '.NnttkkttnN.', '..ntkkkktn..', '...rrrrrr...', '....rrrr....'],
  squirrel: ['.SS.........', 'SSSS..ssss..', 'SS.S.ssssss.', 'S..S.skssks.', '....sssssss.', '....ssskkss.', '.....sccss..', '.....sccss..', '......ss....'],
  bird: ['...rrrr.....', '..rrrrrr....', '..nnnnnn....', '.nwkwwwnee..', '.nwwwwwneeee', '.nwwwwwn....', '..nwwwn.....', '...nnn......'],
  lou: ['....llll....', '..llllllll..', '.lyklllykll.', '.lllllllll..', 'llllllllllll', 'lLLLLLLLLLLl', '.llllllllll.', '..llllllll..'],
  izzy: ['T..........T', 'TT........TT', 'TtT......TtT', '.tttttttttt.', 'ttkttttttktt', 'tttttwwttttt', 'ttttweewtttt', '.tttekkettt.', '..ttewwett..', '...tteett...', '....tttt....'],
  sid: ['.s........s.', '.ss......ss.', 'sSSssssssSSs', 'sSmSSSSSSmSs', 'SyySSSSSSyyS', 'SykSSmmSSkyS', 'SSSSSccSSSSS', 'sSSSccpcSSSs', '.SScccccSSS.', '..sccccccs..', '...ssssss...'],
  house: ['.....rr.....', '....rrrr....', '...rrrrrr...', '..rrrrrrrr..', '.rrrrrrrrrr.', '..wwwwwwww..', '..wkwwwwbw..', '..wwwwwwbw..', '..wwwwwwbw..'],
};
const faceUrl = {};
function faceSrc(name) {
  if (faceUrl[name]) return faceUrl[name];
  const s = spr(FACES[name], { colors: name === 'lou' ? LOU : name === 'sid' ? SIDC : C });
  const c = document.createElement('canvas'); c.width = c.height = 14;
  c.getContext('2d').drawImage(s, Math.floor((14 - s.width) / 2), Math.floor((14 - s.height) / 2));
  return faceUrl[name] = c.toDataURL();
}
function picSrc(rows, colors = C, size = 0) {
  const s = spr(rows, { colors }); const n = Math.max(s.width, s.height, size);
  const c = document.createElement('canvas'); c.width = c.height = n;
  c.getContext('2d').drawImage(s, Math.floor((n - s.width) / 2), Math.floor((n - s.height) / 2));
  return c.toDataURL();
}

// ---------- The map ----------
// Decided 22 Nov, the card's one map: the house and its porch top left, the
// clothesline and the yard in the middle, the barn and the Wanted board top
// right, the rock pile bottom right. Built from blocks rather than typed out,
// so nothing has to be counted by hand.
const MAP = Array.from({ length: MH }, () => Array(MW).fill('.'));
const block = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) MAP[j][i] = ch; };
block(26, 14, 13, 11, ';');                      // the dry ground of the rock pile
block(6, 7, 1, 6, ','); block(6, 12, 26, 1, ','); block(31, 7, 1, 8, ','); block(27, 7, 10, 2, ',');
block(0, 0, MW, 1, '#'); block(0, MH - 1, MW, 1, '#'); block(0, 0, 1, MH, '#'); block(MW - 1, 0, 1, MH, '#');
block(1, 1, 10, 3, 'H'); block(1, 4, 10, 1, 'h'); MAP[4][6] = 'D';
block(1, 5, 10, 2, 'P'); MAP[6][2] = 'S';
block(1, 8, 5, 3, 'v');                          // the garden the deer come for at dusk
MAP[3][14] = 'l'; MAP[3][21] = 'l';
block(17, 9, 2, 2, 'T'); block(11, 16, 2, 2, 'T'); block(22, 19, 2, 2, 'T'); block(36, 10, 2, 2, 'T');
for (const [x, y] of [[2, 20], [3, 20], [4, 21], [2, 22], [8, 23], [14, 23], [20, 23]]) MAP[y][x] = 'b';
block(26, 1, 12, 5, 'R'); block(26, 6, 12, 1, 'B'); block(30, 6, 3, 1, 'G');
MAP[7][25] = 'W';
block(34, 8, 2, 1, 'w');
const ROCKS = [[31, 19], [28, 17], [34, 16], [36, 19], [29, 21], [34, 22]].map(([x, y]) => ({ x: x + .5, y: y + .6 }));
ROCKS.forEach(r => MAP[Math.floor(r.y)][Math.floor(r.x)] = 'o');
for (const [x, y] of [[26, 15], [27, 15], [30, 16], [31, 16], [36, 15], [37, 16], [26, 20], [33, 19], [37, 22], [31, 23], [27, 23], [33, 21]]) MAP[y][x] = 'O';
const SOLID = new Set('#HhDRBGOTWlwb');
const TREES = [[17, 9], [11, 16], [22, 19], [36, 10]];
const BOARD = { x: 25.5, y: 8.25 }, STASH = { x: 2.5, y: 6.7 }, DOOR = { x: 6.5, y: 5.2 };
// Biscuit's team catch (Trello #58, 24 Nov): she lies in the long grass in the
// middle of the yard and Pepper herds the mice to her
const AMBUSH = { x: 15.5, y: 14.6 };
const GARDEN = []; for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) GARDEN.push({ x: 1.8 + i * 1.15, y: 8.9 + j * 1.3, eaten: false });
const IZZY_HOME = { x: 9.6, y: 6.6 }, BARN_DOOR = { x: 31.5, y: 6.8 };
const PERCHES = [27.5, 29, 34, 36.5];
const BOWLS = { biscuit: { x: 3.6, y: 5.7 }, tato: { x: 4.6, y: 5.7 }, pepper: { x: 8.8, y: 5.7 } };
const LINE_POSTS = [14.5, 21.5], LINE_Y = 3.2;
const ITEMS = [
  { id: 'boot', pic: 'boot', home: { x: 7.3, y: 5.5 }, call: 'boot' },
  { id: 'boot2', pic: 'boot', flip: true, home: { x: 7.9, y: 5.5 }, call: 'boot' },
  { id: 'sockHoley', pic: 'sockHoley', home: { x: 15.8, y: 4.3 }, hang: true, call: 'sock' },
  { id: 'sockStripe', pic: 'sockStripe', home: { x: 17.9, y: 4.3 }, hang: true, call: 'sock' },
  { id: 'sockPolka', pic: 'sockPolka', home: { x: 20, y: 4.3 }, hang: true, call: 'sock' },
  { id: 'slipper', pic: 'slipper', home: { x: 10.3, y: 5.7 }, call: 'slipper' },
];
// Night indoors (25 Nov): the pets are kept in and watch the porch through the
// two front windows, as the card has it for Sid. A small room that fits any
// view, so it never scrolls.
const RW = 12, RH = 9;
const ROOM = ['XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XC.........X', 'XC.........X', 'X...rrrr...X', 'X...rrrr...X', 'XII.UUUU.QQX', 'XII......QQX', 'XXXXXXXXXXXX'];
const ROOM_SOLID = new Set('XCU');
const WINDOWS = [{ x: 2, w: 3 }, { x: 7, w: 3 }];   // in tiles across the front wall
const BOWL_X = 8.5;                                  // Sid's bowl on the porch, seen through the second window
let scene = 'ranch';
const solidAt = (x, y) => {
  const i = Math.floor(x), j = Math.floor(y);
  if (scene === 'night') return i < 0 || j < 0 || i >= RW || j >= RH || ROOM_SOLID.has(ROOM[j][i]);
  return i < 0 || j < 0 || i >= MW || j >= MH || SOLID.has(MAP[j][i]);
};
const blocked = (x, y, hw = .32, hh = .22) => solidAt(x - hw, y - hh) || solidAt(x + hw, y - hh) || solidAt(x - hw, y - .01) || solidAt(x + hw, y - .01);
function moveBy(o, dx, dy) {
  let hit = false;
  if (!blocked(o.x + dx, o.y)) o.x += dx; else hit = true;
  if (!blocked(o.x, o.y + dy)) o.y += dy; else hit = true;
  return hit;
}
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (a, b) => a + Math.random() * (b - a);
const randIn = ([a, b]) => rand(a, b);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- Painted ground ----------
const vary = (x, y, n) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % n;
const GR = { hi: '#d0e08a', base: '#b5cc6a', mid: '#9fb858', dark: '#7f9a44' };
const DIRT = { hi: '#f0d49a', base: '#dcb67a', dark: '#c49a5e', peb: '#a8804a' };
const DRY = { base: '#d8b98a', dark: '#c4a070', hi: '#ecd2a6' };
function grass(v) {
  return RDG.tile('g' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, GR.base);
    for (let i = 0; i < 4; i++) fill(Math.floor(r() * 14) + 1, Math.floor(r() * 12) + 2, 2, 1, GR.mid);
    for (let i = 0; i < 2 + v % 2; i++) { const x = Math.floor(r() * 12) + 1, y = Math.floor(r() * 11) + 3; set(x, y, GR.dark); set(x + 2, y - 1, GR.dark); set(x + 1, y, GR.mid); set(x + 1, y - 1, GR.hi); set(x + 1, y + 1, GR.dark); }
    for (let i = 0; i < 3; i++) set(Math.floor(r() * T), Math.floor(r() * T), GR.hi);
  });
}
function dirt(v, mask) {          // mask: sides that are not path (1 up, 2 right, 4 down, 8 left)
  return RDG.tile('d' + v + '/' + mask, T, T, (set, fill, r) => {
    fill(0, 0, T, T, DIRT.base);
    for (let i = 0; i < 5; i++) set(Math.floor(r() * T), Math.floor(r() * T), DIRT.dark);
    if (v % 2 === 0) { const x = Math.floor(r() * 11) + 3, y = Math.floor(r() * 9) + 4; set(x, y, DIRT.hi); set(x + 1, y, DIRT.peb); }
    for (let i = 0; i < T; i++) {
      const bump = (i * 7 + v) % 5 === 0;
      if (mask & 1) { set(i, 0, GR.base); if (bump) set(i, 1, GR.mid); }
      if (mask & 4) { set(i, T - 1, GR.base); if (bump) set(i, T - 2, GR.base); }
      if (mask & 8) { set(0, i, GR.base); if (bump) set(1, i, GR.mid); }
      if (mask & 2) { set(T - 1, i, GR.base); if (bump) set(T - 2, i, GR.base); }
    }
  });
}
function dry(v) {
  return RDG.tile('dry' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, DRY.base);
    for (let i = 0; i < 6; i++) set(Math.floor(r() * T), Math.floor(r() * T), DRY.dark);
    for (let i = 0; i < 3; i++) set(Math.floor(r() * T), Math.floor(r() * T), DRY.hi);
    if (v === 0) { set(4, 9, GR.dark); set(5, 8, GR.mid); set(6, 9, GR.dark); }   // a dry tuft
  });
}
function fence(along) {
  return RDG.tile('f' + along, T, T, (set, fill) => {
    fill(0, 0, T, T, GR.mid);
    if (along) { fill(0, 5, T, 2, '#a8743c'); fill(0, 10, T, 2, '#a8743c'); fill(0, 7, T, 1, '#6b4426'); fill(0, 12, T, 1, '#6b4426'); fill(6, 2, 4, 12, '#8a5a30'); fill(6, 2, 4, 1, '#c99460'); fill(9, 2, 1, 12, '#5e3a1c'); }
    else { fill(5, 0, 2, T, '#a8743c'); fill(10, 0, 2, T, '#a8743c'); fill(7, 0, 1, T, '#6b4426'); fill(12, 0, 1, T, '#6b4426'); fill(4, 5, 10, 5, '#8a5a30'); fill(4, 5, 10, 1, '#c99460'); }
  });
}
function roof(edge) {
  return RDG.tile('roof' + edge, T, T, (set, fill) => {
    fill(0, 0, T, T, '#5a6a86');
    for (let y = 3; y < T; y += 4) fill(0, y, T, 1, '#46556e');
    for (let y = 0; y < T; y += 4) for (let x = (y / 4 % 2) * 4; x < T; x += 8) fill(x, y, 1, 3, '#46556e');
    if (edge) fill(0, 0, T, 2, '#3a4660');
  });
}
function wall(kind) {
  return RDG.tile('wall' + kind, T, T, (set, fill) => {
    fill(0, 0, T, T, '#efe6d0');
    for (let y = 3; y < T; y += 4) fill(0, y, T, 1, '#cfc3a6');
    fill(0, 0, T, 1, '#3a4660');
    if (kind === 'win') { fill(3, 3, 10, 9, '#6b4426'); fill(4, 4, 8, 7, '#9fd3e8'); fill(7, 4, 1, 7, '#6b4426'); fill(4, 7, 8, 1, '#6b4426'); fill(5, 5, 2, 1, '#e9fbff'); }
    if (kind === 'door') { fill(3, 1, 10, 15, '#6b4426'); fill(4, 2, 8, 14, '#8a5a30'); fill(5, 3, 6, 5, '#9c6a3a'); fill(5, 9, 6, 5, '#9c6a3a'); fill(10, 9, 1, 2, '#f2c230'); }
  });
}
function porch(front, hole) {
  return RDG.tile('porch' + front + hole, T, T, (set, fill) => {
    fill(0, 0, T, T, '#b58a5a');
    for (let x = 3; x < T; x += 4) fill(x, 0, 1, T, '#94704a');
    if (front) {
      fill(0, 11, T, 5, '#6b4426');
      for (let x = 0; x < T; x += 4) { fill(x, 12, 2, 1, '#94704a'); fill(x + 2, 14, 2, 1, '#94704a'); }
      if (hole) { fill(3, 10, 10, 6, '#1d1410'); fill(4, 9, 8, 1, '#1d1410'); fill(3, 10, 10, 1, '#4e2f1a'); }
    }
  });
}
function barnRoof(ridge) {
  return RDG.tile('br' + ridge, T, T, (set, fill) => {
    fill(0, 0, T, T, '#b8362f');
    for (let y = 2; y < T; y += 4) fill(0, y, T, 1, '#8e2a20');
    if (ridge) { fill(0, 6, T, 4, '#7a1f18'); fill(0, 6, T, 1, '#d0493a'); }
  });
}
function barnWall(door) {
  return RDG.tile('bw' + door, T, T, (set, fill) => {
    fill(0, 0, T, T, '#a8302f');
    for (let x = 3; x < T; x += 4) fill(x, 0, 1, T, '#7a1f18');
    fill(0, 0, T, 2, '#f4ecdc');
    if (door) { fill(0, 2, T, 14, '#5a1610'); fill(1, 3, 14, 12, '#7a1f18'); for (let i = 0; i < 12; i++) { set(2 + i, 3 + i, '#f4ecdc'); set(13 - i, 3 + i, '#f4ecdc'); } fill(1, 3, 14, 1, '#f4ecdc'); fill(1, 14, 14, 1, '#f4ecdc'); }
  });
}
function boulder(v) {
  return RDG.tile('o' + v, T, T, (set, fill) => {
    fill(0, 0, T, T, DRY.base);
    fill(2, 4, 12, 11, '#6b6b78'); fill(1, 6, 14, 7, '#6b6b78'); fill(3, 3, 10, 1, '#6b6b78');
    fill(3, 4, 9, 7, '#9a9aa6'); fill(2, 6, 3, 4, '#9a9aa6'); fill(4, 4, 4, 2, '#c4c7d2');
    fill(2, 13, 12, 2, '#4c5268'); if (v) { fill(9, 8, 3, 1, '#4c5268'); fill(10, 9, 1, 2, '#4c5268'); }
  });
}
function hotRock() {
  return RDG.tile('hot', T, T, (set, fill) => {
    fill(0, 0, T, T, DRY.base);
    fill(1, 5, 14, 9, '#a07c56'); fill(2, 4, 12, 1, '#a07c56');
    fill(2, 5, 12, 7, '#e3c48e'); fill(3, 5, 5, 2, '#f6e3c4'); fill(2, 12, 12, 1, '#7a5a3a');
  });
}
function postTile() { return RDG.tile('post', T, T, (set, fill) => { fill(0, 0, T, T, GR.base); fill(6, 2, 4, 13, '#8a5a30'); fill(6, 2, 4, 1, '#c99460'); fill(9, 3, 1, 12, '#5e3a1c'); fill(5, 14, 6, 2, GR.dark); }); }
function trough() { return RDG.tile('trough', T, T, (set, fill) => { fill(0, 0, T, T, DIRT.base); fill(0, 3, T, 11, '#6b4426'); fill(1, 4, T - 2, 8, '#5aa6e4'); fill(2, 5, 5, 1, '#d7f1ff'); fill(0, 13, T, 2, '#4e2f1a'); }); }
function bushTile() { return RDG.tile('bush', T, T, (set, fill) => { fill(0, 0, T, T, GR.base); fill(2, 3, 12, 11, '#4f8f3a'); fill(1, 5, 14, 7, '#4f8f3a'); fill(3, 4, 6, 4, '#6fae4a'); fill(2, 12, 12, 2, '#2e6b45'); set(10, 6, '#e04848'); set(5, 9, '#e04848'); set(11, 10, '#e04848'); }); }
function gardenTile(v) {
  return RDG.tile('v' + v, T, T, (set, fill) => {
    fill(0, 0, T, T, '#7a5232');
    for (let y = 2; y < T; y += 5) { fill(0, y, T, 2, '#5e3a1c'); fill(0, y + 2, T, 1, '#94683e'); }
  });
}
function roomTile(ch, x, y) {
  const at = (i, j) => (ROOM[j] || [])[i];
  if (ch === 'X') {
    if (y === 0 || y === 1) return RDG.tile('rw' + y, T, T, (set, fill) => {
      fill(0, 0, T, T, '#b89a7a');
      for (let i = 1; i < T; i += 5) fill(i, 0, 1, T, '#a68a6a');
      if (y === 0) fill(0, 0, T, 3, '#5e3a1c');
      if (y === 1) { fill(0, 12, T, 4, '#5e3a1c'); fill(0, 12, T, 1, '#8a5a30'); }
    });
    return RDG.tile('rx', T, T, (set, fill) => { fill(0, 0, T, T, '#3b2a1c'); fill(0, 0, T, 1, '#5e3a1c'); });
  }
  const floor = (set, fill) => { fill(0, 0, T, T, '#a8743c'); for (let j = 3; j < T; j += 4) fill(0, j, T, 1, '#8a5a30'); fill((x * 5 + y * 3) % 12, 1, 1, 2, '#8a5a30'); };
  if (ch === 'r') {
    const m = (at(x, y - 1) !== 'r') | (at(x + 1, y) !== 'r') << 1 | (at(x, y + 1) !== 'r') << 2 | (at(x - 1, y) !== 'r') << 3;
    return RDG.tile('rr' + m, T, T, (set, fill) => {
      fill(0, 0, T, T, '#a83a3a'); for (let i = 2; i < T; i += 4) for (let j = 2; j < T; j += 4) set(i, j, '#c95a4a');
      if (m & 1) fill(0, 0, T, 2, '#e8c070'); if (m & 4) fill(0, T - 2, T, 2, '#e8c070'); if (m & 8) fill(0, 0, 2, T, '#e8c070'); if (m & 2) fill(T - 2, 0, 2, T, '#e8c070');
    });
  }
  if (ch === 'C') return RDG.tile('rc' + y, T, T, (set, fill) => { floor(set, fill); fill(6, 0, 4, T, '#c9a46a'); for (let j = 1; j < T; j += 3) fill(6, j, 4, 1, '#a8844a'); if (y === 2) { fill(1, 2, 14, 5, '#8a6a9a'); fill(1, 2, 14, 1, '#a88ab8'); } else { fill(2, 11, 12, 4, '#8a6a9a'); fill(2, 11, 12, 1, '#a88ab8'); } });
  if (ch === 'U') return RDG.tile('ru' + (at(x - 1, y) === 'U' ? 1 : 0) + (at(x + 1, y) === 'U' ? 1 : 0), T, T, (set, fill) => { floor(set, fill); fill(0, 1, T, 14, '#3e6a7a'); fill(0, 1, T, 5, '#2e5260'); fill(1, 7, T - 2, 7, '#4e7a8a'); if (at(x - 1, y) !== 'U') fill(0, 1, 3, 14, '#2e5260'); if (at(x + 1, y) !== 'U') fill(T - 3, 1, 3, 14, '#2e5260'); });
  if (ch === 'Q') return RDG.tile('rq' + (at(x - 1, y) === 'Q' ? 1 : 0) + (at(x, y - 1) === 'Q' ? 1 : 0), T, T, (set, fill) => { floor(set, fill); const l = at(x - 1, y) !== 'Q', tp = at(x, y - 1) !== 'Q'; fill(l ? 2 : 0, tp ? 2 : 0, T - (l ? 2 : 2), T - (tp ? 2 : 2), '#c94a3a'); for (let i = 0; i < T; i += 4) { fill(i, 0, 1, T, '#e08a6a'); fill(0, i, T, 1, '#e08a6a'); } if (l) fill(0, 0, 2, T, '#a8743c'); if (tp) fill(0, 0, T, 2, '#a8743c'); });
  if (ch === 'I') return RDG.tile('ri' + (at(x - 1, y) === 'I' ? 1 : 0) + (at(x, y - 1) === 'I' ? 1 : 0), T, T, (set, fill) => { floor(set, fill); fill(0, 0, T, T, '#c99460'); for (let i = 0; i < T; i += 3) fill(i, 0, 1, T, '#8a5a30'); fill(2, 2, 12, 12, '#5a86c8'); });
  return RDG.tile('rf' + ((x * 7 + y) % 4), T, T, floor);
}
function groundTile(ch, x, y) {
  const v = vary(x, y, 4), at = (i, j) => (MAP[j] || [])[i];
  switch (ch) {
    case ',': { const not = (i, j) => { const c = at(i, j); return c !== ',' && c !== 'P' && c !== 'G' && c !== 'w' ? 1 : 0; }; return dirt(v, not(x, y - 1) | not(x + 1, y) << 1 | not(x, y + 1) << 2 | not(x - 1, y) << 3); }
    case ';': case 'o': case 'O': return ch === 'o' ? hotRock() : ch === 'O' ? boulder(v % 2) : dry(v);
    case '#': return fence(y === 0 || y === MH - 1);
    case 'H': return roof(y === 1);
    case 'h': return wall(x % 3 === 2 ? 'win' : '');
    case 'D': return wall('door');
    case 'P': case 'S': return porch(y === 6, ch === 'S');
    case 'R': return barnRoof(y === 3);
    case 'B': return barnWall(false);
    case 'G': return barnWall(true);
    case 'l': return postTile();
    case 'w': return trough();
    case 'b': return bushTile();
    case 'W': return dirt(v, 15);
    case 'v': return gardenTile(v % 2);
    default: return grass(v);
  }
}
// a tree top over its 2 x 2 trunk tiles, drawn with the characters so Pepper walks behind it
const TREE = (() => {
  const rows = [];
  for (let y = 0; y < 30; y++) {
    let r = '';
    for (let x = 0; x < 32; x++) {
      const dx = (x + .5 - 16) / 15, dy = (y + .5 - 13) / 12.5, e = dx * dx + dy * dy;
      if (y >= 22 && x >= 13 && x < 19) r += x === 18 ? 'B' : 'b';
      else r += e > 1 ? '.' : dx < -.2 && dy < -.3 && e < .5 ? 'G' : dy > .45 ? 'q' : 'g';
    }
    rows.push(r);
  }
  return rows;
})();
const TREE_C = { g: '#5ea352', G: '#8fd17a', q: '#3f7a3a', b: '#8a5a30', B: '#5e3a1c' };
const BOARD_PIX = [
  '.BBBBBBBBBBBBBB.', 'BbbbbbbbbbbbbbbB', 'BbvvvvbbvvvvbbbB', 'BbvkkvbbvkkvbbbB', 'BbvvvvbbvvvvbbbB', 'BbvkkvbbvkkvbbbB', 'BbvvvvbbvvvvbbbB', 'BbbbbbbbbbbbbbbB',
  'BbbbbvvvvvbbbbbB', 'BbbbbvkkkvbbbbbB', 'BbbbbvvvvvbbbbbB', 'BbbbbvkkkvbbbbbB', 'BbbbbvvvvvbbbbbB', 'BBBBBBBBBBBBBBBB', '...BB......BB...', '...BB......BB...', '...BB......BB...', '...BB......BB...',
];

// ---------- Characters ----------
const P = { x: 6.5, y: 8.4, face: 1, dir: { x: 1, y: 0 }, moving: false, quiet: true, stay: false, walkT: 0, pounce: null, knock: null, chase: null, urge: null, carry: null, emote: null, eat: 0 };
const cats = {
  biscuit: { who: 'biscuit', x: 4, y: 7.6, face: 1, mode: 'idle', t: 2, goal: null, walkT: 0, emote: null, bumpCool: 0, sitT: 0, sitCool: 0, huntT: TUNE.huntFirst, target: null },
  tato: { who: 'tato', x: 8, y: 8.2, face: -1, mode: 'follow', t: 0, goal: null, walkT: 0, emote: null, bumpCool: 0, sitT: 0, sitCool: 0, pounceT: randIn(TUNE.tatoEvery) },
};
// where Biscuit wanders to when she isn't hunting: the porch, the barn, the rocks, the fence line
const CAT_SPOTS = [{ x: 4, y: 6 }, { x: 9, y: 5.8 }, { x: 28, y: 8.6 }, { x: 33, y: 9 }, { x: 24, y: 14 }, { x: 15, y: 20 }, { x: 30, y: 18.5 }, { x: 12, y: 7.5 }];
let squirrels = [], holes = [], wood = null, lizards = [], mice = [], tumbles = [], puffs = [], items = [];
let tumbleT = randIn(TUNE.tumbleEvery), dinnerT = TUNE.dinnerFirst, dinner = null;
let mode = 'title', hintUntil = 0, warnedQuick = false, warnedJob = 0;
// the day: 'dawn' (jackrabbits), 'day', 'dusk' (bats and deer), 'in' (time to
// come in) and 'night' (indoors). Not saved: a reload starts in the day.
let phase = 'day', dayT = 0, comeT = 0, night = null, deer = [], bats = [], batT = 0, rabbitT = 0, rabbitsLeft = 0, deerWarn = 0;
const izzy = { who: 'izzy', x: IZZY_HOME.x, y: IZZY_HOME.y, face: -1, mode: 'sleep', t: 0, wakeT: 0, walkT: 0, emote: null, storyCool: 0 };

function digSpot(near) {
  for (let i = 0; i < 40; i++) {
    const x = near ? near.x + rand(-4, 4) : rand(8, 24), y = near ? near.y + rand(-3, 3) : rand(8, 23);
    if (x < 8 || x > 24.5 || y < 8 || y > 23.5) continue;
    if (MAP[Math.floor(y)][Math.floor(x)] !== '.' || blocked(x, y, .9, .9)) continue;
    if (holes.some(h => dist(h, { x, y }) < 1.3)) continue;
    return { x, y };
  }
  return near ? digSpot(null) : { x: 14, y: 14 };
}
function spawn() {
  squirrels = []; holes = []; wood = null; lizards = []; mice = [];
  if (!S.done.squirrels) {
    for (let i = 0; i < TUNE.startHoles; i++) holes.push(digSpot(null));
    for (let i = 0; i < 4; i++) { const s = digSpot(null); squirrels.push({ kind: 'sq', x: s.x, y: s.y, face: 1, mode: 'dig', t: rand(1, TUNE.dig), goal: null, vx: 0, vy: 0 }); }
  }
  if (!S.done.woodpecker) wood = { kind: 'bird', perch: 2, x: PERCHES[2], y: 6.9, mode: 'drum', t: randIn(TUNE.drum), scares: 0, knockT: 0, marks: PERCHES.map(() => 1 + Math.floor(Math.random() * 3)), from: null, to: null };
  if (!S.done.lizards) [1, 2, 3, 0].forEach((ri, i) => lizards.push({ kind: 'liz', lou: i === 3, rock: ri, x: ROCKS[ri].x, y: ROCKS[ri].y, face: Math.random() < .5 ? 1 : -1, mode: 'bask', t: 0, eyes: true, eyeT: randIn(TUNE.louAwake) }));
  if (!S.done.mice) for (let i = 0; i < TUNE.mice; i++) {
    let m = digSpot(null); for (let k = 0; k < 20 && dist(m, AMBUSH) < 5; k++) m = digSpot(null);
    mice.push({ kind: 'mouse', x: m.x, y: m.y, face: 1, mode: 'nibble', t: rand(1, 3), vx: 0, vy: 0, scurry: 0 });
  }
  items = ITEMS.map(it => ({ ...it, state: 'home', cool: 0, resisted: false }));
}

// ---------- Messages ----------
// One line at a time, with the face of who said it.
const queue = []; let msgUntil = 0;
function say(face, text, ms) {
  if (queue.length > 2) queue.shift();
  queue.push({ face, text, ms: ms || Math.max(2200, text.length * 65) });
}
function stepMsg(now) {
  const el = $('#msg');
  if (now < msgUntil) return;
  if (!queue.length) { el.hidden = true; return; }
  const m = queue.shift();
  $('#msgFace').hidden = !m.face; if (m.face) $('#msgFace').src = faceSrc(m.face);
  $('#msgText').textContent = m.text; el.hidden = false; msgUntil = now + m.ms;
}

// ---------- Sound ----------
const tone = RDG.sound({ on: () => S.sound, vol: .05 });
const SFX = {
  bark() { tone(560, .07, 'square', 0, .06, 320); tone(500, .09, 'square', .1, .06, 280); },
  mmf() { tone(200, .14, 'triangle', 0, .07, 160); },
  knock() { tone(1100, .025, 'square', 0, .035); tone(1000, .025, 'square', .07, .035); tone(1050, .025, 'square', .14, .035); },
  pounce() { tone(300, .16, 'square', 0, .05, 760); },
  swat() { tone(1400, .08, 'sawtooth', 0, .04, 420); },
  meow() { tone(620, .12, 'sine', 0, .07, 920); tone(920, .2, 'sine', .12, .06, 520); },
  mrrp() { tone(520, .08, 'sine', 0, .07, 780); tone(740, .1, 'sine', .08, .06, 620); },
  up() { [523, 659, 784].forEach((f, i) => tone(f, .1, 'square', i * .08, .05)); },
  down() { tone(330, .18, 'triangle', 0, .08, 220); tone(220, .3, 'triangle', .18, .08, 150); },
  urge() { tone(880, .06, 'square', 0, .05); tone(1175, .08, 'square', .07, .05); },
  grab() { tone(660, .06, 'square'); tone(990, .08, 'square', .06); },
  stash() { [784, 659, 523, 784].forEach((f, i) => tone(f, .08, 'square', i * .07, .05)); },
  star() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .14, 'square', i * .12, .05)); },
  bell() { tone(1568, .4, 'sine', 0, .05); tone(1568, .4, 'sine', .35, .05); },
  crunch() { for (let i = 0; i < 4; i++) tone(140 + Math.random() * 80, .04, 'square', i * .1, .04); },
  dig() { tone(170, .05, 'triangle', 0, .03); },
  fill() { tone(260, .07, 'triangle', 0, .06, 170); tone(200, .07, 'triangle', .08, .06, 140); },
  squeak() { tone(1500, .05, 'square', 0, .03, 1900); },
  squawk() { tone(900, .12, 'sawtooth', 0, .04, 1500); tone(1300, .1, 'sawtooth', .12, .04, 700); },
  bigBark() { tone(300, .16, 'square', 0, .1, 170); tone(250, .24, 'square', .18, .1, 140); },
  stomp() { tone(110, .14, 'triangle', 0, .09, 70); },
  hiss() { tone(2400, .25, 'sawtooth', 0, .015, 1800); },
  job() { [392, 523, 659, 784, 659, 784].forEach((f, i) => tone(f, .12, 'square', i * .1, .05)); },
};

// ---------- Respect ----------
function respect(n) {
  const was = S.respect;
  S.respect = clamp(S.respect + n, 0, 100);
  if (n > 0) SFX.up(); else SFX.down();
  showRespect(); save();
  if (was < 100 && S.respect >= 100 && !S.star) { S.star = true; save(); setTimeout(starCard, 900); }
}
function showRespect() {
  const m = $('#respect'); m.hidden = mode !== 'play';
  m.setAttribute('aria-valuenow', S.respect); m.setAttribute('aria-label', `${t('respect')} ${S.respect}`);
  $('#respectFill').style.width = S.respect + '%'; $('#respectNum').textContent = S.respect;
  m.classList.toggle('star', S.star);
}

// ---------- Input ----------
const keys = {};
let touchStay = false, hold = null;
const stick = RDG.stick('#pad', '#knob');
const DIRK = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!$('#cover').hidden) return;
  if (mode !== 'play') return;
  if (DIRK[k] || k === 'z' || k === 'shift') { keys[k] = true; e.preventDefault(); }
  if (e.repeat) return;
  if (k === ' ' || k === 'enter') { e.preventDefault(); act(); }
  else if (k === 'x') bark();
  else if (k === 'h') toggleHelp();
  else if (k === 'escape' && !$('#help').hidden) toggleHelp(false);
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; touchStay = false; });
const press = (id, fn) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); if (mode === 'play' && $('#cover').hidden) fn(); });
press('#actBtn', () => act()); press('#barkBtn', () => bark());
const stayBtn = $('#stayBtn');
stayBtn.addEventListener('pointerdown', e => { e.preventDefault(); touchStay = true; stayBtn.classList.add('held'); try { stayBtn.setPointerCapture(e.pointerId); } catch (err) { } });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => stayBtn.addEventListener(ev, () => { touchStay = false; stayBtn.classList.remove('held'); }));
// holding a finger or the mouse on the ranch walks Pepper toward it, as in Bread
cv.addEventListener('pointerdown', e => { if (mode !== 'play') return; hold = { id: e.pointerId, cx: e.clientX, cy: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (err) { } });
cv.addEventListener('pointermove', e => { if (hold && hold.id === e.pointerId) { hold.cx = e.clientX; hold.cy = e.clientY; } });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => cv.addEventListener(ev, e => { if (hold && hold.id === e.pointerId) hold = null; }));
RDG.noZoom(() => mode === 'play' && $('#cover').hidden, ['#pad', '#actBtn', '#barkBtn', '#stayBtn', '#cv']);
// a controller: A is the action, B barks, X or any shoulder button is Stay
RDG.pad({ a: ' ', b: 'x', x: 'z', l: 'z', r: 'z', zl: 'z', zr: 'z', select: 'h', start: 'Enter', stick });
function inputDir() {
  let x = 0, y = 0;
  for (const k in DIRK) if (keys[k]) { x += DIRK[k][0]; y += DIRK[k][1]; }
  if (stick.on) { x += stick.x; y += stick.y; }
  if (hold) {
    const r = cv.getBoundingClientRect();
    const wx = ((hold.cx - r.left) / r.width * lo.width + cam.x) / T, wy = ((hold.cy - r.top) / r.height * lo.height + cam.y) / T;
    const dx = wx - P.x, dy = wy - (P.y - .4), l = Math.hypot(dx, dy);
    if (l > .3) { x += dx / l; y += dy / l; }
  }
  const l = Math.hypot(x, y);
  return l > .15 ? { x: x / Math.max(1, l), y: y / Math.max(1, l) } : { x: 0, y: 0 };
}
const holdingStay = () => !!(keys.z || keys.shift || touchStay);

// ---------- Jobs ----------
const JOB_IDS = ['squirrels', 'woodpecker', 'lizards', 'mice'];
const gone = c => c.mode === 'leave' || c.mode === 'gone' || c.mode === 'caught';
function jobLeft(id) {
  if (id === 'squirrels') return squirrels.filter(s => !gone(s)).length + holes.length;
  if (id === 'woodpecker') return wood && wood.mode !== 'leave' && wood.mode !== 'gone' ? TUNE.scares - wood.scares : 0;
  if (id === 'mice') return mice.filter(m => !gone(m)).length;
  return lizards.filter(l => !gone(l)).length;
}
function takeJob(id) {
  S.job = id; save(); closeCard();
  say('pepper', t('jobTaken', { name: t(`jobs.${id}.name`) }));
  cats.biscuit.huntT = Math.min(cats.biscuit.huntT, TUNE.huntFirst);
  showJob();
}
function showJob() {
  const p = $('#jobPill');
  p.hidden = mode !== 'play' || !S.job;
  if (S.job) p.innerHTML = `<span class="long">${t('pill', { name: t(`jobs.${S.job}.short`), n: jobLeft(S.job) })}</span><span class="short">${t('pillShort', { n: jobLeft(S.job) })}</span>`;
}
function checkJob() {
  if (!S.job || jobLeft(S.job) > 0) return;
  const id = S.job;
  S.done[id] = true; S.job = null; save();
  SFX.job(); say('pepper', t('jobDone', { name: t(`jobs.${id}.name`) }), 3600);
  respect(TUNE.respect.job);
  showJob();
  if (JOB_IDS.every(j => S.done[j])) setTimeout(allDoneCard, 1600);
}
function onJob(id, face) {
  if (S.job === id) return true;
  const now = performance.now();
  if (now > warnedJob) { say(face, t('notOnJob')); warnedJob = now + 8000; }
  return false;
}

// ---------- What Pepper does ----------
function nearBoard() { return dist(P, BOARD) < 1.4; }
function nearHole() { return holes.find(h => dist(P, h) < TUNE.fill); }
function actionNow() {
  if (scene === 'night') return (ROOM[Math.floor(P.y)] || [])[Math.floor(P.x)] === 'Q' ? 'actSleep' : 'actPounce';
  if (P.carry) return 'actMmf';
  if (nearBoard()) return 'actRead';
  if (nearHole()) return 'actFill';
  return 'actPounce';
}
function busy() { return P.pounce || P.knock || P.chase || P.eat > 0; }
function act() {
  if (busy()) return;
  const a = actionNow();
  if (a === 'actSleep') { startDawn(); return; }
  if (a === 'actMmf') { SFX.mmf(); say('pepper', t('mmf')); return; }
  if (a === 'actRead') { boardCard(); return; }
  if (a === 'actFill') { const h = nearHole(); holes.splice(holes.indexOf(h), 1); SFX.fill(); puff(h.x, h.y, 6); if (!holes.length || Math.random() < .3) say('pepper', t('holeFilled')); return; }
  // pounce: a leap the way she faces
  const d = P.dir.x || P.dir.y ? P.dir : { x: P.face, y: 0 };
  P.pounce = { t: TUNE.pounceTime, vx: d.x * TUNE.pounce / TUNE.pounceTime, vy: d.y * TUNE.pounce / TUNE.pounceTime };
  SFX.pounce();
  noise(2.5);
}
function landPounce() {
  P.pounce = null; puff(P.x, P.y, 4);
  if (scene === 'night') return;
  for (const c of Object.values(cats)) if (dist(P, c) < .9) bumpCat(c);
  const hitL = lizards.find(l => !gone(l) && dist(P, l) < TUNE.pounceHit);
  if (hitL) { if (onJob('lizards', hitL.lou ? 'lou' : null)) wrangleLizard(hitL); else dart(hitL); }
  const hitS = squirrels.find(s => !gone(s) && dist(P, s) < TUNE.pounceHit);
  if (hitS) { if (onJob('squirrels', 'squirrel')) leave(hitS, 'sqGone'); else scatter(hitS, P); }
  const hitM = mice.find(m => !gone(m) && m.mode !== 'frozen' && dist(P, m) < TUNE.pounceHit);
  if (hitM) { bolt(hitM, P); say(null, t('mouseSmall')); }
}
function bark() {
  if (busy() && !P.chase) return;
  if (scene === 'night') { nightBark(); return; }
  P.emote = { k: 'dots', until: performance.now() + 500 };
  if (P.carry) { SFX.mmf(); say('pepper', t('mmf')); return; }
  SFX.bark();
  noise(TUNE.huntZone * 1.5);
  for (const s of squirrels) if (!gone(s) && dist(P, s) < TUNE.bark) { if (S.job === 'squirrels') leave(s, 'sqGone'); else scatter(s, P); }
  if (S.job !== 'squirrels' && squirrels.some(s => !gone(s) && dist(P, s) < TUNE.bark)) onJob('squirrels', 'squirrel');
  if (wood && (wood.mode === 'drum' || wood.mode === 'look')) {
    const d = dist(P, { x: wood.x, y: 7.3 });
    if (d < TUNE.woodClose) {
      if (S.job === 'woodpecker') {
        wood.scares++; SFX.squawk();
        if (wood.scares >= TUNE.scares) { wood.mode = 'leave'; wood.t = 0; wood.from = { x: wood.x, y: wood.y }; say('bird', t('woodGone'), 3200); }
        else { say('bird', t('woodScared', { n: wood.scares, max: TUNE.scares })); flyAway(); }
      } else { onJob('woodpecker', 'bird'); flyAway(); }
    } else if (d < 9 && S.job === 'woodpecker') say('bird', t('woodFar'));
  }
  for (const l of lizards) if (!gone(l) && l.mode === 'bask' && dist(P, l) < 4) dart(l);
  for (const m of mice) if (!gone(m) && m.mode !== 'frozen' && dist(P, m) < TUNE.bark) bolt(m, P);
  // the deer pay a pup's bark no mind; Izzy's is another matter
  const now = performance.now();
  if (deer.some(d => (d.mode === 'come' || d.mode === 'eat') && dist(P, d) < 6) && now > deerWarn) { deerWarn = now + 4000; say(null, t('deerIgnore')); }
  if (izzy.mode === 'sleep' && dist(P, izzy) < 3) { izzy.emote = { k: 'look', until: now + 1500 }; say('izzy', t('izzyGrump')); }
}
// a loud thing near Biscuit's hunt spoils it
function noise(r) { const b = cats.biscuit; if (b.mode === 'stalk' && b.target && dist(P, b.target) < r) ruinHunt(); }

function stepPepper(dt, now) {
  const stay = holdingStay();
  P.stay = stay;
  if (P.eat > 0) { P.eat -= dt; P.moving = false; P.quiet = true; return; }
  if (P.pounce) {
    // the leap is too quick for a critter to see coming, so P.quiet stays as it was
    moveBy(P, P.pounce.vx * dt, P.pounce.vy * dt); P.moving = true;
    if ((P.pounce.t -= dt) <= 0) landPounce();
    return;
  }
  if (P.knock) { moveBy(P, P.knock.vx * dt, P.knock.vy * dt); if ((P.knock.t -= dt) <= 0) P.knock = null; P.moving = false; return; }
  if (P.chase) {
    // She runs for a spot just behind the tumbleweed (it rolls west, so to its
    // east) and keeps pace there. The first version ran at the tumbleweed
    // itself at full speed: once she caught it she overshot, turned, and
    // overshot again every frame, flipping back and forth on top of it
    // (Randi, 24 Nov: "she kinda glitches"). The step is capped at the
    // distance left, and she turns only when it's clearly on her other side.
    // a jackrabbit can run either way, so it's behind whichever way it's going;
    // a bat is chased right under it
    const tw = P.chase.tw, back = tw.what === 'bat' ? 0 : (tw.vx || -1) < 0 ? .9 : -.9, gx = tw.x + back, gy = tw.y, dx = gx - P.x, dy = gy - P.y, l = Math.hypot(dx, dy);
    if (l > .01) {
      const sp = Math.min(l, TUNE.chaseRun * dt);
      if (moveBy(P, dx / l * sp, dy / l * sp)) P.chase.stuck += dt; else P.chase.stuck = 0;
      P.dir = { x: dx / l, y: dy / l };
    }
    if (Math.abs(tw.x - P.x) > .4) P.face = tw.x < P.x ? -1 : 1;
    P.moving = true; P.quiet = false; P.walkT += dt * 1.6;
    // tumbleweeds roll over fences and rocks; Pepper can't, so a wall ends it
    if ((P.chase.t -= dt) <= 0 || tw.dead || P.chase.stuck > .4) { P.chase = null; P.emote = { k: 'sweat', until: now + 1800 }; say('pepper', t('pant')); }
    return;
  }
  const d = inputDir();
  let speed = TUNE.walk;
  if (stay) speed = S.sneak ? TUNE.sneak : 0;
  if (P.urge) speed = 0;
  P.moving = speed > 0 && (d.x || d.y);
  P.quiet = !P.moving || (stay && S.sneak);
  if (P.moving) {
    moveBy(P, d.x * speed * dt, d.y * speed * dt);
    P.dir = d; if (Math.abs(d.x) > .2) P.face = d.x < 0 ? -1 : 1;
    P.walkT += dt * (speed / TUNE.walk);
  }
  // running into a cat
  if (scene === 'ranch') for (const c of Object.values(cats)) {
    if (P.moving && !P.quiet && dist(P, c) < .75 && (d.x * (c.x - P.x) + d.y * (c.y - P.y)) / (dist(P, c) || 1) > .7) bumpCat(c);
  }
  // the stash and giving things back
  if (P.carry && scene === 'ranch') {
    const it = P.carry;
    if (dist(P, STASH) < .8) {
      S.stash[it.id] = (S.stash[it.id] || 0) + 1; it.state = 'stashed'; P.carry = null; save(); SFX.stash();
      say('guilty', t('stashed', { n: Object.keys(S.stash).length, max: ITEMS.length }));
      fillStash();
    } else if (it.away && dist(P, it.home) < .8) {
      it.state = 'home'; it.cool = 6; P.carry = null; SFX.grab();
      say('house', t('returned')); respect(TUNE.respect.returned);
    } else if (!it.called && now - it.grabbed > TUNE.callAfter * 1000) { it.called = true; say('house', t(`calls.${it.call}`), 3000); }
    // giving it back counts once she's carried it off; standing on the spot
    // where she grabbed it gave it back at once (22 Nov)
    if (dist(P, it.home) > 2) it.away = true;
  }
  // the urges: tumbleweeds and shoes pull her off the job unless she holds Stay
  if (P.urge) {
    if (stay) {
      if (P.urge.kind === 'tumble') { P.urge.tw.tempted = true; respect(TUNE.respect.resist); }
      else if (P.urge.kind === 'sid') respect(TUNE.respect.resist);
      else { P.urge.item.cool = 5; if (!P.urge.item.resisted) { P.urge.item.resisted = true; respect(TUNE.respect.resist); } }
      say('pepper', t('resist')); P.urge = null; P.emote = { k: 'heart', until: now + 1000 };
    } else if ((P.urge.t -= dt) <= 0) {
      const u = P.urge; P.urge = null;
      if (u.kind === 'sid') nightBark();
      else if (u.kind === 'tumble') { u.tw.tempted = true; P.chase = { tw: u.tw, t: TUNE.chase, stuck: 0 }; say('pepper', t(`chaseLine.${u.tw.what || 'tumble'}`), 1600); noise(99); }
      else if (!P.carry) { const it = u.item; it.state = 'carried'; it.grabbed = now; it.called = false; it.away = false; P.carry = it; SFX.grab(); say('guilty', t('grab', { item: t(`items.${it.id}`) })); }
    }
  } else if (!stay && !P.carry && scene === 'ranch') {
    const tw = tumbles.find(w => !w.tempted && dist(P, w) < TUNE.tumbleNear) || bats.find(b => b.low && !b.tempted && dist(P, b) < 2.5);
    const it = items.find(i => i.state === 'home' && i.cool <= 0 && dist(P, i.home) < TUNE.shoeNear);
    if (tw) { P.urge = { kind: 'tumble', tw, t: TUNE.warn }; P.emote = { k: '!', until: now + TUNE.warn * 1000 }; SFX.urge(); }
    else if (it) { P.urge = { kind: 'shoe', item: it, t: TUNE.warn }; P.emote = { k: '!', until: now + TUNE.warn * 1000 }; SFX.urge(); }
  }
  // dinner: cats first
  if (scene === 'ranch' && dinner && dinner.full.pepper && dist(P, BOWLS.pepper) < .8) {
    dinner.full.pepper = false; P.eat = 1.6; SFX.crunch();
    const catsIn = ['biscuit', 'tato'].every(w => dinner.ate[w]);
    if (catsIn) { say('biscuit', t('waited')); respect(TUNE.respect.waited); }
    else { say('look', t('ladies')); respect(TUNE.respect.ladies); for (const c of Object.values(cats)) c.emote = { k: 'look', until: now + 2000 }; }
  }
}
function bumpCat(c) {
  const now = performance.now();
  if (c.bumpCool > 0 || c.mode === 'crooked') return;
  c.bumpCool = 4;
  if (c.who === 'biscuit') {
    SFX.swat(); say('look', t('swat')); respect(TUNE.respect.swat);
    const dx = P.x - c.x, dy = P.y - c.y, l = Math.hypot(dx, dy) || 1;
    P.knock = { t: .25, vx: dx / l * 4, vy: dy / l * 4 }; P.pounce = null; P.chase = null;
    c.emote = { k: 'look', until: now + 2000 }; P.emote = { k: 'sweat', until: now + 1500 };
    if (c.mode === 'stalk' || c.mode === 'go') ruinHunt(true);
  } else {
    SFX.meow(); say('tato', t('crooked')); respect(TUNE.respect.crooked);
    const dx = c.x - P.x, dy = c.y - P.y, l = Math.hypot(dx, dy) || 1;
    c.mode = 'crooked'; c.t = 2; c.vx = dx / l * 4; c.vy = dy / l * 4; c.emote = { k: '?', until: now + 2000 };
  }
}

// ---------- The critters ----------
function puff(x, y, n) { for (let i = 0; i < n; i++) puffs.push({ x: x + rand(-.3, .3), y: y + rand(-.2, .1), vx: rand(-1, 1), vy: rand(-1.4, -.4), t: rand(.3, .6) }); }
function edgeFrom(c) {           // the nearest way off the ranch
  const opts = [{ x: -1, y: c.y }, { x: MW + 1, y: c.y }, { x: c.x, y: MH + 1 }];
  return opts.sort((a, b) => dist(c, a) - dist(c, b))[0];
}
function leave(c, line) {
  c.mode = 'leave'; c.goal = edgeFrom(c); c.emote = { k: '!', until: performance.now() + 1200 };
  if (line) say(c.kind === 'sq' ? 'squirrel' : c.lou ? 'lou' : null, t(line));
  SFX.squeak();
  if (cats.biscuit.target === c) ruinHunt();
  showJob();
}
function scatter(s, from) {
  const dx = s.x - from.x, dy = s.y - from.y, l = Math.hypot(dx, dy) || 1;
  if (cats.biscuit.target === s && cats.biscuit.mode !== 'pounce') ruinHunt();
  s.mode = 'run'; s.t = 1.4; s.vx = dx / l * 5; s.vy = dy / l * 5; s.emote = { k: '!', until: performance.now() + 800 };
}
function stepSquirrels(dt) {
  for (const s of squirrels) {
    if (s.mode === 'gone') continue;
    if (s.mode === 'caught') { s.x = cats.biscuit.x + cats.biscuit.face * .5; s.y = cats.biscuit.y; if ((s.t -= dt) <= 0) leave(s); continue; }
    if (s.mode === 'leave') {
      const dx = s.goal.x - s.x, dy = s.goal.y - s.y, l = Math.hypot(dx, dy);
      if (l < .3) { s.mode = 'gone'; showJob(); continue; }
      s.x += dx / l * 6 * dt; s.y += dy / l * 6 * dt; s.face = dx < 0 ? -1 : 1; s.hop = (s.hop || 0) + dt * 10; continue;
    }
    const sees = P.quiet ? TUNE.sqSeesQuiet : TUNE.sqSees;
    if (s.mode !== 'run' && !P.pounce && dist(P, s) < sees) scatter(s, P);
    if (s.mode === 'run') {
      if (moveBy(s, s.vx * dt, s.vy * dt)) { const tmp = s.vx; s.vx = -s.vy; s.vy = tmp; }
      s.face = s.vx < 0 ? -1 : 1; s.hop = (s.hop || 0) + dt * 10;
      if ((s.t -= dt) <= 0) { s.mode = 'hop'; s.goal = digSpot(s); }
    } else if (s.mode === 'hop') {
      const dx = s.goal.x - s.x, dy = s.goal.y - s.y, l = Math.hypot(dx, dy);
      if (l < .2) { s.mode = 'dig'; s.t = TUNE.dig; continue; }
      if (moveBy(s, dx / l * 2.6 * dt, dy / l * 2.6 * dt)) s.goal = digSpot(s);
      s.face = dx < 0 ? -1 : 1; s.hop = (s.hop || 0) + dt * 8;
    } else if (s.mode === 'dig') {
      s.digT = (s.digT || 0) + dt;
      if (s.digT > .3) { s.digT = 0; if (Math.random() < .5) puffs.push({ x: s.x - s.face * .3, y: s.y, vx: -s.face * rand(.5, 1.5), vy: rand(-1.5, -.5), t: .4 }); if (dist(P, s) < 6 && Math.random() < .3) SFX.dig(); }
      if ((s.t -= dt) <= 0) {
        if (mode === 'play' && holes.length < TUNE.maxHoles && !holes.some(h => dist(h, s) < 1)) { holes.push({ x: s.x, y: s.y }); showJob(); }
        s.mode = 'hop'; s.goal = digSpot(s);
      }
    }
  }
}
function flyAway() {
  if (!wood) return;
  const far = PERCHES.map((x, i) => ({ i, d: Math.abs(x - P.x) })).filter(o => o.i !== wood.perch && o.d > 3);
  const pick = (far.length ? far : PERCHES.map((x, i) => ({ i })).filter(o => o.i !== wood.perch))[Math.floor(Math.random() * (far.length || 3))];
  wood.from = { x: wood.x, y: wood.y }; wood.perch = pick.i; wood.to = { x: PERCHES[pick.i], y: 6.9 };
  wood.mode = 'fly'; wood.t = 0;
}
function stepWood(dt, now) {
  const w = wood; if (!w || w.mode === 'gone') return;
  if (w.mode === 'drum') {
    w.knockT -= dt;
    if (w.knockT <= 0) { w.knockT = .5; w.peck = now; if (dist(P, w) < 10) SFX.knock(); }
    if ((w.t -= dt) <= 0) { w.mode = 'look'; w.t = randIn(TUNE.look); w.marks[w.perch] = Math.min(6, w.marks[w.perch] + 1); }
  } else if (w.mode === 'look') {
    if (!P.quiet && dist(P, { x: w.x, y: 7.3 }) < TUNE.woodSees) { say('bird', t('woodSpotted')); flyAway(); return; }
    if ((w.t -= dt) <= 0) { w.mode = 'drum'; w.t = randIn(TUNE.drum); }
  } else if (w.mode === 'fly') {
    w.t += dt / .8;
    const k = Math.min(1, w.t);
    w.x = w.from.x + (w.to.x - w.from.x) * k; w.y = w.from.y + (w.to.y - w.from.y) * k - Math.sin(k * Math.PI) * 2;
    if (k >= 1) { w.mode = 'drum'; w.t = randIn(TUNE.drum); }
  } else if (w.mode === 'leave') {
    w.t += dt; w.x = w.from.x + w.t * 5; w.y = w.from.y - w.t * 3;
    if (w.t > 3) { w.mode = 'gone'; showJob(); }
  }
}
function dart(l, away) {        // to another hot rock, away from Pepper (or from Tato)
  const from = away || P;
  if (cats.biscuit.target === l && cats.biscuit.mode !== 'pounce') ruinHunt();
  const free = ROCKS.map((r, i) => i).filter(i => i !== l.rock && !lizards.some(o => o !== l && !gone(o) && o.rock === i));
  if (!free.length) return;
  free.sort((a, b) => dist(ROCKS[b], from) - dist(ROCKS[a], from));
  if (away) { const dx = l.x - away.x, dy = l.y - away.y; free.sort((a, b) => ((ROCKS[b].x - l.x) * dx + (ROCKS[b].y - l.y) * dy) - ((ROCKS[a].x - l.x) * dx + (ROCKS[a].y - l.y) * dy)); }
  l.rock = free[0]; l.mode = 'dart'; l.emote = { k: '!', until: performance.now() + 600 };
}
function wrangleLizard(l) {
  leave(l, l.lou ? 'louGone' : 'lizGone');
}
function stepLizards(dt, now) {
  for (const l of lizards) {
    if (l.mode === 'gone') continue;
    if (l.mode === 'caught') { l.x = cats.biscuit.x + cats.biscuit.face * .5; l.y = cats.biscuit.y; if ((l.t -= dt) <= 0) leave(l); continue; }
    if (l.mode === 'leave') {
      const dx = l.goal.x - l.x, dy = l.goal.y - l.y, d = Math.hypot(dx, dy);
      if (d < .3) { l.mode = 'gone'; showJob(); continue; }
      l.x += dx / d * 7 * dt; l.y += dy / d * 7 * dt; l.face = dx < 0 ? -1 : 1; continue;
    }
    if (l.lou) { if ((l.eyeT -= dt) <= 0) { l.eyes = !l.eyes; l.eyeT = l.eyes ? randIn(TUNE.louAwake) : TUNE.louNap; } }
    if (l.mode === 'bask') {
      let sees = P.quiet ? TUNE.lizSeesQuiet : TUNE.lizSees;
      if (l.lou && l.eyes) sees = Math.max(sees, TUNE.louSees);
      // mid-pounce is too quick to notice: found 22 Nov, when a sneaking Pepper
      // flew into a lizard's range and it darted off before she landed
      if (!P.pounce && dist(P, l) < sees) {
        dart(l);
        if (!S.sneak && S.job === 'lizards' && !warnedQuick) { warnedQuick = true; say(null, t('lizQuick')); }
      }
    } else if (l.mode === 'dart') {
      const r = ROCKS[l.rock], dx = r.x - l.x, dy = r.y - l.y, d = Math.hypot(dx, dy);
      if (d < .2) { l.x = r.x; l.y = r.y; l.mode = 'bask'; continue; }
      const sp = Math.min(d, 7 * dt); l.x += dx / d * sp; l.y += dy / d * sp; l.face = dx < 0 ? -1 : 1;
    }
  }
}
// The barn mice. They run straight away from Pepper when she comes near
// noisily, so she herds them by coming at them from the far side; sneaking,
// they let her get round them. Biscuit catches any that come within reach of
// the long grass while she's lying in wait there.
function bolt(m, from) {
  const dx = m.x - from.x, dy = m.y - from.y, l = Math.hypot(dx, dy) || 1;
  m.mode = 'bolt'; m.t = .8; m.from = { x: from.x, y: from.y }; m.emote = { k: '!', until: performance.now() + 700 };
}
function fleeStep(m, from, step) {
  // straight away if it can, else the nearest way round a wall
  const base = Math.atan2(m.y - from.y, m.x - from.x);
  for (const off of [0, .5, -.5, 1, -1, 1.5, -1.5, 2, -2]) {
    const a = base + off, nx = m.x + Math.cos(a) * step, ny = m.y + Math.sin(a) * step;
    if (blocked(nx, ny, .2, .15)) continue;
    m.x = nx; m.y = ny; if (Math.abs(Math.cos(a)) > .2) m.face = Math.cos(a) < 0 ? -1 : 1;
    m.hop = (m.hop || 0) + step * 4; return;
  }
}
function stepMice(dt, now) {
  const b = cats.biscuit, ready = S.job === 'mice' && b.mode === 'ambush' && b.t <= 0 && !b.target;
  for (const m of mice) {
    if (m.mode === 'gone' || m.mode === 'frozen') continue;
    if (m.mode === 'caught') { m.x = b.x + b.face * .5; m.y = b.y; if ((m.t -= dt) <= 0) leave(m); continue; }
    if (m.mode === 'leave') {
      const dx = m.goal.x - m.x, dy = m.goal.y - m.y, d = Math.hypot(dx, dy);
      if (d < .3) { m.mode = 'gone'; showJob(); continue; }
      m.x += dx / d * 6 * dt; m.y += dy / d * 6 * dt; m.face = dx < 0 ? -1 : 1; continue;
    }
    if (ready && dist(m, AMBUSH) < TUNE.ambushReach) {
      b.target = m; b.team = true; b.mode = 'pounce'; b.t = .35; b.from = { x: b.x, y: b.y }; b.face = m.x < b.x ? -1 : 1; SFX.pounce();
      m.mode = 'frozen'; continue;
    }
    const d = dist(P, m), sees = P.quiet ? TUNE.mouseSeesQuiet : TUNE.mouseSees;
    if (m.mode === 'bolt') { fleeStep(m, m.from, TUNE.mouseBolt * dt); if ((m.t -= dt) <= 0) m.mode = 'run'; continue; }
    if (mode === 'play' && d < sees) m.mode = 'run';
    if (m.mode === 'run') {
      if (d > sees + 1.5) { m.mode = 'nibble'; m.t = rand(1, 3); continue; }
      fleeStep(m, P, TUNE.mouseRun * dt);
    } else {
      // nibbling, with a little scurry now and then
      if ((m.t -= dt) <= 0) { m.t = rand(1.5, 3.5); const a = rand(0, Math.PI * 2); m.vx = Math.cos(a); m.vy = Math.sin(a); m.scurry = .4; }
      if (m.scurry > 0) { m.scurry -= dt; moveBy(m, m.vx * 1.5 * dt, m.vy * 1.5 * dt); m.face = m.vx < 0 ? -1 : 1; m.hop = (m.hop || 0) + dt * 6; }
    }
  }
}
function stepTumbles(dt, now) {
  // tumbleweeds blow through in the day only
  if ((phase === 'day' || mode !== 'play') && (tumbleT -= dt) <= 0) {
    tumbleT = randIn(TUNE.tumbleEvery);
    const y = P.y + rand(-3, 3);
    tumbles.push({ what: 'tumble', x: cam.x / T + VW + 1, y: clamp(y, 7, MH - 2), vx: -TUNE.tumbleSpeed, base: 0, rot: 0, tempted: mode !== 'play' });
  }
  // jackrabbits bound across at dawn (Randi, 25 Nov), from either side
  if (phase === 'dawn' && rabbitsLeft > 0 && (rabbitT -= dt) <= 0) {
    rabbitsLeft--; rabbitT = rand(6, 9);
    const side = Math.random() < .5 ? 1 : -1;
    tumbles.push({ what: 'rabbit', x: side > 0 ? cam.x / T - 1 : cam.x / T + VW + 1, y: clamp(P.y + rand(-3, 3), 7, MH - 2), vx: side * TUNE.rabbitRun, rot: 0, tempted: false });
  }
  for (const w of tumbles) {
    w.x += w.vx * dt; w.rot += dt * 8; w.bob = Math.abs(Math.sin(w.rot * .5)) * 5;
    if (w.what === 'rabbit') { w.y = clamp(w.y + Math.sin(w.rot * .7) * 2 * dt, 7, MH - 2); w.bob = Math.abs(Math.sin(w.rot * 1.2)) * 6; }
    if (w.x < -2 || w.x > MW + 2) w.dead = true;
  }
  tumbles = tumbles.filter(w => !w.dead);
}

// ---------- The day: dusk, night and dawn ----------
const activeDeer = () => deer.filter(d => d.mode === 'come' || d.mode === 'eat');
function stepDay(dt) {
  dayT += dt;
  if (phase === 'dawn' && dayT > TUNE.dawnLen) phase = 'day';
  else if (phase === 'day' && dayT > TUNE.duskAt && !dinner && !P.carry) startDusk();
  else if (phase === 'dusk' && !activeDeer().length) {
    phase = 'in'; comeT = 15; say('house', t('comeIn'));
    for (const b of bats) b.mode = 'off';
  } else if (phase === 'in') {
    if ((comeT -= dt) <= 0) { comeT = 15; say('house', t('comeIn')); }
    if (dist(P, DOOR) < 1.3 && !busy()) startNight();
  }
}
function startDusk() {
  phase = 'dusk'; say(null, t('dusk'), 3000); say(null, t('deerCome'));
  deer = [];
  for (let i = 0; i < TUNE.deer; i++) deer.push({ kind: 'deer', x: -3 - i * 2.5, y: 9.4 + i * 1.2, face: 1, mode: 'come', t: 0, target: null, walkT: 0, stompCool: 0 });
  bats = [];
  for (let i = 0; i < TUNE.bats; i++) bats.push({ what: 'bat', x: BARN_DOOR.x, y: BARN_DOOR.y, alt: 8, vx: 1, mode: 'flit', delay: i * .6, goal: null, tempted: false, low: false, flap: rand(0, 6) });
  batT = randIn(TUNE.batSwoop) + 4;
}
// The deer leap the fence on the west side, walk to the garden and eat it a
// plant at a time. Pepper's bark doesn't move them and running at them gets
// her stomped at; Izzy's bark sends them off.
function stepDeer(dt, now) {
  for (const d of deer) {
    if (d.mode === 'gone') continue;
    d.walking = false; d.stompCool = Math.max(0, d.stompCool - dt);
    if (d.mode === 'flee') { d.x -= 6 * dt; d.face = -1; d.walkT += dt * 3; d.hop = Math.abs(Math.sin(d.walkT * 2)) * 6; if (d.x < -3) d.mode = 'gone'; continue; }
    if (d.mode === 'come') {
      if (!d.target || d.target.eaten) {
        const left = GARDEN.filter(g => !g.eaten);
        d.target = left.filter(g => !deer.some(o => o !== d && o.target === g)).sort((a, b) => dist(d, a) - dist(d, b))[0] || left[0];
      }
      if (!d.target) { d.mode = 'flee'; continue; }
      if (walkTo(d, { x: d.target.x - 1, y: d.target.y + .15 }, TUNE.deerWalk, dt)) { d.mode = 'eat'; d.t = TUNE.deerEat; d.face = 1; }
    } else if (d.mode === 'eat') {
      if ((d.t -= dt) <= 0) {
        d.target.eaten = true; puff(d.target.x, d.target.y, 4); d.target = null; d.mode = 'come';
        if (GARDEN.every(g => g.eaten)) { say(null, t('gardenGone')); for (const o of deer) if (o.mode !== 'gone') o.mode = 'flee'; }
      }
    }
    if (mode === 'play' && P.moving && !P.quiet && !P.knock && d.stompCool <= 0 && dist(P, d) < TUNE.stomp) {
      d.stompCool = 3; SFX.stomp();
      const dx = P.x - d.x, dy = P.y - d.y, l = Math.hypot(dx, dy) || 1;
      P.knock = { t: .25, vx: dx / l * 5, vy: dy / l * 5 }; P.chase = null; P.emote = { k: 'sweat', until: now + 1500 };
      say('guilty', t('stomp'));
    }
  }
}
// Izzy sleeps on the porch. Sitting beside her (holding Stay, still) wakes
// her: by day she tells a story of the old farm; at dusk with deer about she
// gets up and follows Pepper, slowly, and sits down if Pepper gets too far
// ahead. Close enough to the deer, her big bark sends them off.
function stepIzzy(dt, now) {
  const z = izzy; z.walking = false; z.storyCool = Math.max(0, z.storyCool - dt);
  switch (z.mode) {
    case 'sleep':
      if (mode === 'play' && dist(P, z) < 1.8 && P.stay && !P.moving) { z.wakeT += dt; if (z.wakeT > TUNE.izzyWake) { z.wakeT = 0; wakeIzzy(now); } } else z.wakeT = 0;
      break;
    case 'story': if ((z.t -= dt) <= 0) z.mode = 'sleep'; break;
    case 'follow': {
      const dd = activeDeer();
      if (!dd.length) { z.mode = 'home'; break; }
      const tg = dd.sort((a, b) => dist(z, a) - dist(z, b))[0];
      if (dist(z, tg) < TUNE.izzyReach) {
        z.mode = 'bark'; z.t = 1.4; z.face = tg.x < z.x ? -1 : 1; z.emote = { k: '!', until: now + 1200 }; SFX.bigBark();
        for (const d of deer) if (d.mode !== 'gone') { d.mode = 'flee'; d.emote = { k: '!', until: now + 900 }; }
        say('izzy', t('izzyWin'), 2600); respect(TUNE.respect.izzy); tellStory();
        break;
      }
      if (dist(P, z) > TUNE.izzyLag) { z.mode = 'rest'; say('izzy', t('izzyWait')); break; }
      const spot = { x: P.x - P.face * 1.2, y: P.y + .3 };
      if (dist(z, spot) > .5) walkTo(z, spot, TUNE.izzyWalk, dt);
      break;
    }
    case 'rest':
      if (!activeDeer().length) z.mode = 'home';
      else if (dist(P, z) < 2.2) { z.mode = 'follow'; say('izzy', t('izzyGo')); }
      break;
    case 'bark': if ((z.t -= dt) <= 0) z.mode = 'home'; break;
    case 'home': if (walkTo(z, IZZY_HOME, TUNE.izzyWalk, dt)) { z.mode = 'sleep'; z.face = -1; } break;
  }
}
function wakeIzzy(now) {
  const z = izzy; z.emote = { k: '?', until: now + 1000 };
  if (phase === 'dusk' && activeDeer().length) { z.mode = 'follow'; say('izzy', t('izzyUp')); return; }
  if (z.storyCool <= 0) { z.mode = 'story'; z.t = 5; z.storyCool = TUNE.storyCool; tellStory(); }
  else z.emote = { k: 'z', until: now + 1500 };
}
function tellStory() {
  const n = STR.stories.length, i = S.stories < n ? S.stories : Math.floor(Math.random() * n);
  if (S.stories < n) { S.stories++; save(); fillStories(); }
  say('izzy', STR.stories[i], 5600);
}
// the barn's bats flit over Pepper at dusk; now and then one swoops low past
// her, which is a chase unless she holds Stay
function flyTo(b, g, sp, dt) { const dx = g.x - b.x, dy = g.y - b.y, l = Math.hypot(dx, dy); if (l < .01) return; const k = Math.min(l, sp * dt); b.x += dx / l * k; b.y += dy / l * k; b.vx = dx; }
function stepBats(dt) {
  for (const b of bats) {
    b.flap += dt * 14;
    if (b.delay > 0) { b.delay -= dt; continue; }
    if (b.mode === 'flit') {
      if (!b.goal || dist(b, b.goal) < .4) b.goal = { x: clamp(P.x + rand(-6, 6), 2, MW - 2), y: clamp(P.y + rand(-4, 3), 2, MH - 2) };
      flyTo(b, b.goal, 3.6, dt); b.alt += (34 + Math.sin(b.flap * .3) * 6 - b.alt) * Math.min(1, dt * 2); b.low = false;
    } else if (b.mode === 'swoop') {
      flyTo(b, b.goal, 5, dt); b.alt += (5 - b.alt) * Math.min(1, dt * 5); b.low = b.alt < 12;
      if ((b.t -= dt) <= 0) { b.mode = 'flit'; b.goal = null; }
    } else if (b.mode === 'off') { b.x += 5 * dt; b.y -= 3 * dt; b.alt += 20 * dt; if (b.x > MW + 3 || b.y < -3) b.dead = true; }
  }
  bats = bats.filter(b => !b.dead);
  if (phase === 'dusk' && mode === 'play' && (batT -= dt) <= 0) {
    batT = randIn(TUNE.batSwoop);
    const b = bats.filter(o => o.mode === 'flit' && !o.tempted && o.delay <= 0).sort((a, c) => dist(P, a) - dist(P, c))[0];
    if (b) { b.mode = 'swoop'; b.t = 1.8; b.goal = { x: P.x + rand(-1, 1), y: P.y + rand(-.5, .5) }; }
  }
}
function startNight() {
  scene = 'night'; phase = 'night';
  if (P.carry) { P.carry.state = 'home'; P.carry.cool = 6; P.carry = null; }
  Object.assign(P, { x: 6, y: 4.8, chase: null, urge: null, pounce: null, knock: null, emote: null });
  Object.assign(cats.biscuit, { x: 8.6, y: 2.9, face: 1, mode: 'window', target: null, goal: null, hopY: 0, emote: null });
  Object.assign(cats.tato, { x: 3.4, y: 2.9, face: 1, mode: 'window', hopY: 0, emote: null });
  Object.assign(izzy, { x: 1.9, y: 7.4, face: 1, mode: 'sleep' });
  tumbles = []; bats = []; deer = []; puffs = []; dinner = null; hold = null;
  night = { t: 0, sid: { x: -2, mode: 'wait', t: 0, face: 1 }, fox: { x: RW + 2, mode: 'wait', t: 0, face: -1 }, foxAt: 1e9, watchT: 0, blink: false, urgeCool: 0, vexT: 5, yellCool: 0 };
  say(null, t('nightIn'));
}
// Sid comes to the bowl, eats and goes. Watching quietly from a window wins a
// slow blink; the urge to bark at Sid comes at the window, and barking wakes
// the house. After Sid, a fox: that one is worth a bark (Randi, 25 Nov).
function stepNight(dt, now) {
  const n = night, sid = n.sid, fox = n.fox;
  n.t += dt; n.urgeCool = Math.max(0, n.urgeCool - dt); n.yellCool = Math.max(0, n.yellCool - dt);
  if (sid.mode === 'wait' && n.t > TUNE.nightSid) sid.mode = 'come';
  if (sid.mode === 'come') {
    sid.x += 1.6 * dt; sid.face = 1;
    if (sid.x >= BOWL_X - .9) { sid.mode = 'eat'; sid.t = TUNE.sidEat; say('biscuit', t('sidCome')); cats.biscuit.emote = { k: 'look', until: now + 2500 }; }
  } else if (sid.mode === 'eat') {
    if ((sid.t -= dt) <= 0) { sid.mode = 'go'; say(null, t('sidDone')); }
    if ((n.vexT -= dt) <= 0) {
      n.vexT = 7; const c = Math.random() < .5 ? cats.tato : cats.biscuit;
      c.emote = { k: c.who === 'tato' ? '?' : 'look', until: now + 1800 };
      if (c.who === 'tato' && !n.tatoSaid) { n.tatoSaid = true; say('tato', t('tatoSid')); } else if (c.who === 'biscuit') SFX.hiss();
    }
  } else if (sid.mode === 'go' || sid.mode === 'run') {
    sid.x += (sid.mode === 'run' ? 5 : 1.6) * dt; sid.face = 1;
    if (sid.x > RW + 2) { sid.mode = 'gone'; n.foxAt = n.t + TUNE.foxAfter; }
  }
  if (fox.mode === 'wait' && n.t > n.foxAt) fox.mode = 'come';
  if (fox.mode === 'come') {
    fox.x -= 1.8 * dt; fox.face = -1;
    if (fox.x <= BOWL_X + .9) { fox.mode = 'sniff'; fox.t = TUNE.foxSniff; say('biscuit', t('foxHere')); for (const c of Object.values(cats)) c.emote = { k: '!', until: now + 1500 }; }
  } else if (fox.mode === 'sniff') {
    if ((fox.t -= dt) <= 0) { fox.mode = 'go'; say(null, t('foxSlunk')); }
  } else if (fox.mode === 'go' || fox.mode === 'run') {
    fox.x += (fox.mode === 'run' ? 6 : 1.8) * dt; fox.face = 1;
    if (fox.x > RW + 2) fox.mode = 'gone';
  }
  // at a window while Sid eats
  const atWin = P.y < 3.7 && WINDOWS.some(w => P.x > w.x - .5 && P.x < w.x + w.w + .5);
  if (sid.mode === 'eat' && atWin) {
    if (P.quiet && !n.blink) {
      n.watchT += dt;
      if (n.watchT > TUNE.blinkWatch) { n.blink = true; S.blinks++; save(); say('sid', t('sidBlink'), 3600); respect(TUNE.respect.blink); P.emote = { k: 'heart', until: now + 1500 }; }
    }
    if (!P.urge && !P.stay && n.urgeCool <= 0) { P.urge = { kind: 'sid', t: TUNE.warn }; P.emote = { k: '!', until: now + TUNE.warn * 1000 }; SFX.urge(); n.urgeCool = 9; }
  }
}
function nightBark() {
  const n = night, now = performance.now();
  SFX.bark(); P.emote = { k: 'dots', until: now + 500 };
  if (n.fox.mode === 'come' || n.fox.mode === 'sniff') { n.fox.mode = 'run'; say('house', t('goodGirl')); respect(TUNE.respect.fox); return; }
  if (n.yellCool > 0) return;
  n.yellCool = 3; say('house', t('houseYell')); respect(TUNE.respect.yell);
  for (const c of Object.values(cats)) c.emote = { k: 'look', until: now + 1800 };
  if (n.sid.mode === 'come' || n.sid.mode === 'eat') { n.sid.mode = 'run'; say(null, t('sidRan')); }
}
function startDawn() {
  scene = 'ranch'; phase = 'dawn'; dayT = 0; night = null;
  Object.assign(P, { x: 6.5, y: 7.4, chase: null, urge: null, pounce: null, knock: null, face: 1 });
  Object.assign(cats.biscuit, { x: 4, y: 7.6, mode: 'idle', t: 2, huntT: TUNE.huntFirst, target: null, goal: null });
  Object.assign(cats.tato, { x: 8, y: 8.2, mode: 'follow' });
  Object.assign(izzy, { x: IZZY_HOME.x, y: IZZY_HOME.y, mode: 'sleep', face: -1 });
  GARDEN.forEach(g => g.eaten = false);
  deer = []; bats = []; tumbles = []; tumbleT = TUNE.dawnLen + 8; rabbitsLeft = TUNE.rabbits; rabbitT = 2;
  dinner = null; dinnerT = TUNE.dinnerFirst;
  say(null, t('morning'));
}

// ---------- The cats ----------
function walkTo(c, goal, speed, dt) {
  const dx = goal.x - c.x, dy = goal.y - c.y, d = Math.hypot(dx, dy);
  if (d < .15) return true;
  const sp = Math.min(d, speed * dt);
  c.x += dx / d * sp; c.y += dy / d * sp; if (Math.abs(dx) > .05) c.face = dx < 0 ? -1 : 1;
  c.walkT += dt * speed / 2; c.walking = true;
  return false;
}
function huntTarget() {
  const b = cats.biscuit, list = [];
  if (S.job === 'squirrels') list.push(...squirrels.filter(s => s.mode === 'dig'));
  if (S.job === 'lizards') list.push(...lizards.filter(l => !l.lou && l.mode === 'bask'));
  return list.sort((a, c) => dist(b, a) - dist(b, c))[0];
}
// until Pepper has learned the sneak, Biscuit hunts again soon, so there's
// another lesson to watch
function nextHunt() { return S.sneak ? randIn(TUNE.huntEvery) : TUNE.huntFirst; }
function ruinHunt(swatted) {
  const b = cats.biscuit, now = performance.now();
  if (b.mode !== 'stalk' && b.mode !== 'go') return;
  const tg = b.target; b.target = null;
  if (tg && !gone(tg)) { if (tg.kind === 'sq') { if (tg.mode !== 'run') scatter(tg, P); } else if (tg.mode === 'bask') dart(tg); }
  b.mode = 'stare'; b.t = 2.2; b.emote = { k: 'look', until: now + 2200 }; b.face = P.x < b.x ? -1 : 1; b.huntT = nextHunt();
  if (!swatted) { say('look', t('ruin')); respect(TUNE.respect.ruin); }
}
function stepBiscuit(dt, now) {
  const b = cats.biscuit; b.walking = false;
  if (dinner && !dinner.ate.biscuit && b.mode !== 'stalk' && b.mode !== 'pounce') { b.target = null; b.mode = 'dinner'; }
  switch (b.mode) {
    case 'dinner':
      if (walkTo(b, BOWLS.biscuit, TUNE.cat * 1.3, dt)) { b.mode = 'eat'; b.t = TUNE.eat; dinner && (dinner.ate.biscuit = true); }
      break;
    case 'eat': if ((b.t -= dt) <= 0) { b.mode = 'idle'; b.t = 2; dinner && (dinner.full.biscuit = false); } break;
    case 'idle':
      if (S.job === 'mice') { b.mode = 'toAmbush'; b.goal = null; break; }
      if (b.goal ? walkTo(b, b.goal, TUNE.cat, dt) : true) { b.goal = null; if ((b.t -= dt) <= 0) { b.goal = CAT_SPOTS[Math.floor(Math.random() * CAT_SPOTS.length)]; b.t = rand(3, 7); } }
      if ((b.huntT -= dt) <= 0) { const tg = huntTarget(); if (tg) { b.target = tg; b.mode = 'go'; } else b.huntT = 5; }
      break;
    case 'go': {
      const tg = b.target; if (!tg || gone(tg) || (tg.kind === 'sq' && tg.mode !== 'dig') || (tg.kind === 'liz' && tg.mode !== 'bask')) { b.mode = 'idle'; b.huntT = 4; break; }
      const side = b.x < tg.x ? -1 : 1, spot = { x: tg.x + side * 3, y: tg.y + .1 };
      if (walkTo(b, spot, TUNE.cat * 1.2, dt)) { b.mode = 'stalk'; b.face = -side; }
      break;
    }
    case 'stalk': {
      const tg = b.target; if (!tg || gone(tg)) { b.mode = 'idle'; b.huntT = 4; break; }
      if (tg.kind === 'sq') tg.t = Math.max(tg.t, 1);      // the squirrel keeps digging, unaware
      if (!P.quiet && dist(P, tg) < TUNE.huntZone) { ruinHunt(); break; }
      if (walkTo(b, { x: tg.x - b.face * .9, y: tg.y }, TUNE.stalk, dt)) { b.mode = 'pounce'; b.t = .35; b.from = { x: b.x, y: b.y }; SFX.pounce(); }
      break;
    }
    case 'pounce': {
      const tg = b.target; b.t -= dt; const k = 1 - Math.max(0, b.t) / .35;
      b.x = b.from.x + (tg.x - b.from.x) * k; b.y = b.from.y + (tg.y - b.from.y) * k; b.hopY = Math.sin(k * Math.PI) * 6;
      if (b.t <= 0) {
        b.hopY = 0; tg.mode = 'caught'; tg.t = .9; b.target = null; b.mode = 'proud'; b.t = 1.6; b.emote = { k: 'heart', until: now + 1500 }; SFX.meow();
        b.huntT = nextHunt();
        if (b.team) { b.team = false; say('biscuit', t('teamCatch')); respect(TUNE.respect.team); showJob(); break; }
        // Watching is standing still (or sneaking) close by. It used to need
        // Stay held as well, and nothing on screen said so, so watching taught
        // nothing (Randi, 24 Nov: "we watch Biscuit pounce/stalk but can't do
        // it ourselves"). Holding Stay is still how the sneak is done after.
        if (P.quiet && dist(P, tg) < TUNE.watch) {
          respect(TUNE.respect.watched);
          if (!S.sneak) { S.sneak = true; save(); say('biscuit', t('learned'), 4200); fillHelp(); }
          else say('biscuit', t('watched'));
        } else say('biscuit', t('biscuitGot'));
        showJob();
      }
      break;
    }
    case 'toAmbush': if (S.job !== 'mice') { b.mode = 'idle'; break; } if (walkTo(b, AMBUSH, TUNE.cat * 1.2, dt)) { b.mode = 'ambush'; b.t = .6; b.face = 1; } break;
    case 'ambush': b.t -= dt; if (S.job !== 'mice') b.mode = 'idle'; break;
    case 'stare': case 'proud': if ((b.t -= dt) <= 0) b.mode = 'idle'; break;
  }
}
function stepTato(dt, now) {
  const c = cats.tato; c.walking = false;
  if (dinner && !dinner.ate.tato && c.mode !== 'pounce' && c.mode !== 'crooked') c.mode = 'dinner';
  switch (c.mode) {
    case 'dinner': if (walkTo(c, BOWLS.tato, TUNE.tato, dt)) { c.mode = 'eat'; c.t = TUNE.eat; dinner && (dinner.ate.tato = true); } break;
    case 'eat': if ((c.t -= dt) <= 0) { c.mode = 'follow'; dinner && (dinner.full.tato = false); } break;
    case 'crooked':
      c.t -= dt; c.x += c.vx * dt; c.y += c.vy * dt;
      { const a = 2.4 * dt, vx = c.vx; c.vx = vx * Math.cos(a) - c.vy * Math.sin(a); c.vy = vx * Math.sin(a) + c.vy * Math.cos(a); }
      c.x = clamp(c.x, 1.5, MW - 1.5); c.y = clamp(c.y, 5.5, MH - 1.5); c.face = c.vx < 0 ? -1 : 1; c.walkT += dt * 3; c.walking = true;
      if (c.t <= 0) c.mode = 'follow';
      break;
    case 'follow': {
      // tags along beside Pepper, a little to the side so she isn't underfoot
      const spot = { x: P.x - P.face * 1.6, y: P.y + 1.1 };
      if (dist(c, spot) > .6) walkTo(c, spot, dist(c, spot) > 4 ? TUNE.tato * 1.4 : TUNE.tato, dt);
      if ((c.pounceT -= dt) <= 0) {
        c.pounceT = randIn(TUNE.tatoEvery);
        const all = [...squirrels.filter(s => s.mode === 'dig' || s.mode === 'hop'), ...lizards.filter(l => l.mode === 'bask'), ...mice.filter(m => m.mode === 'nibble')].filter(o => o !== cats.biscuit.target && dist(c, o) < 4.5);
        const tg = all.sort((a, b) => dist(c, a) - dist(c, b))[0];
        if (tg) { const dx = tg.x - c.x, dy = tg.y - c.y, l = Math.hypot(dx, dy); c.mode = 'pounce'; c.t = .4; c.from = { x: c.x, y: c.y }; c.to = { x: tg.x - dx / l * .9, y: tg.y - dy / l * .9 }; c.tg = tg; c.face = dx < 0 ? -1 : 1; SFX.mrrp(); }
      }
      break;
    }
    case 'pounce': {
      c.t -= dt; const k = 1 - Math.max(0, c.t) / .4;
      c.x = c.from.x + (c.to.x - c.from.x) * k; c.y = c.from.y + (c.to.y - c.from.y) * k; c.hopY = Math.sin(k * Math.PI) * 7;
      if (c.t <= 0) {
        // she misses, every time. The critter bolts away from her, which can send it Pepper's way.
        c.hopY = 0; c.mode = 'miss'; c.t = 1.4; c.emote = { k: '?', until: now + 1400 };
        const tg = c.tg;
        if (tg && !gone(tg)) { if (tg.kind === 'sq') scatter(tg, c); else if (tg.kind === 'mouse') bolt(tg, c); else dart(tg, c); }
        if (Math.random() < .6) say('tato', t('tatoMiss'));
      }
      break;
    }
    case 'miss': if ((c.t -= dt) <= 0) c.mode = 'follow'; break;
  }
}
function stepCats(dt, now) {
  stepBiscuit(dt, now); stepTato(dt, now);
  for (const c of Object.values(cats)) {
    c.bumpCool = Math.max(0, c.bumpCool - dt); c.sitCool = Math.max(0, c.sitCool - dt);
    // sitting nicely beside a cat earns a little respect
    if (mode === 'play' && P.stay && !P.moving && dist(P, c) < 2.5 && c.sitCool <= 0) {
      c.sitT += dt;
      if (c.sitT > TUNE.sitNice) { c.sitT = 0; c.sitCool = TUNE.sitCool; c.emote = { k: 'heart', until: now + 1500 }; say(c.who, t(c.who === 'biscuit' ? 'sitBiscuit' : 'sitTato')); respect(TUNE.respect.sit); }
    } else c.sitT = 0;
  }
}
function stepDinner(dt) {
  if (!dinner) {
    if (phase !== 'day' && phase !== 'dawn') return;
    if ((dinnerT -= dt) <= 0) { dinner = { t: 0, full: { biscuit: true, tato: true, pepper: true }, ate: {} }; SFX.bell(); say('house', t('dinner')); }
    return;
  }
  dinner.t += dt;
  if (dinner.t > 40 || !Object.values(dinner.full).some(Boolean)) { dinner = null; dinnerT = TUNE.dinnerEvery; }
}

// ---------- Drawing ----------
const cam = { x: 0, y: 0 };
function drawEmote(e, x, y, now) {
  if (!e || now > e.until) return;
  const img = spr(EMOTE[e.k]); put(img, x - img.width / 2, y - img.height - 2 + Math.sin(now / 120));
}
function drawPepper(now) {
  const sx = P.x * T - cam.x, sy = P.y * T - cam.y;
  let f = P.moving ? (Math.floor(P.walkT * 8) % 2 ? PEPPER.a : PEPPER.b) : PEPPER.a;
  if (P.stay && !P.moving) f = PEPPER.sit;
  if (P.stay && P.moving) f = Math.floor(P.walkT * 6) % 2 ? PEPPER.sit : PEPPER.a;
  if (P.pounce || P.chase) f = PEPPER.run;
  const img = spr(f, { flip: P.face < 0 }), lift = P.pounce ? Math.sin((1 - P.pounce.t / TUNE.pounceTime) * Math.PI) * 6 : 0;
  px(sx - 9, sy - 1, 18, 2, 'rgba(40,30,10,.25)');
  const x0 = sx - img.width / 2, y0 = sy - img.height - lift;
  put(img, x0, y0);
  if (S.star) put(spr(['.y.', 'yyy', '.y.'], { outline: false }), P.face > 0 ? x0 + 15 : x0 + img.width - 18, y0 + 9);
  if (P.carry) { const c = spr(ITEM_PIX[P.carry.pic], { flip: P.carry.flip }); put(c, P.face > 0 ? x0 + img.width - 6 : x0 - c.width + 6, y0 + 6); }
  drawEmote(P.emote, sx, y0, now);
}
function drawCat(c, now) {
  const set = c.who === 'biscuit' ? BISCUIT : TATO;
  let f = c.walking ? (Math.floor(c.walkT * 6) % 2 ? set.a : set.b) : set.a;
  if (c.mode === 'stalk' || c.mode === 'eat' || c.mode === 'ambush') f = set.low;
  const img = spr(f, { flip: c.face < 0 }), sx = c.x * T - cam.x, sy = c.y * T - cam.y - (c.hopY || 0);
  px(sx - 7, c.y * T - cam.y - 1, 14, 2, 'rgba(40,30,10,.25)');
  put(img, sx - img.width / 2, sy - img.height);
  drawEmote(c.emote, sx, sy - img.height, now);
}
function drawIzzy(now) {
  const z = izzy, sx = z.x * T - cam.x, sy = z.y * T - cam.y, asleep = z.mode === 'sleep';
  const f = asleep ? IZZY.sleep : IZZY.a, img = spr(f, { flip: z.face < 0 });
  const bob = z.walking && Math.floor(z.walkT * 6) % 2 ? 1 : 0;
  px(sx - 7, sy - 1, 14, 2, 'rgba(40,30,10,.25)');
  put(img, sx - img.width / 2, sy - img.height - bob);
  if (asleep && !(z.emote && now < z.emote.until)) put(spr(EMOTE.z), sx + (z.face < 0 ? -10 : 6), sy - img.height - 8 + Math.sin(now / 400) * 2);
  if (z.mode === 'rest') put(spr(EMOTE.sweat), sx + 6, sy - img.height - 6);
  drawEmote(z.emote, sx, sy - img.height, now);
}
function drawDeer(d, now) {
  const sx = d.x * T - cam.x, sy = d.y * T - cam.y;
  const img = spr(d.mode === 'eat' ? DEER.eat : DEER.a, { flip: d.face < 0 }), bob = d.walking && Math.floor(d.walkT * 5) % 2 ? 1 : 0;
  px(sx - 9, sy - 1, 18, 2, 'rgba(40,30,10,.25)');
  put(img, sx - img.width / 2, sy - img.height - bob - (d.hop || 0));
  drawEmote(d.emote, sx, sy - img.height, now);
}
function drawBat(b) {
  if (b.delay > 0) return;
  const img = spr(Math.floor(b.flap) % 2 ? BAT.a : BAT.b, { outline: false }), sx = b.x * T - cam.x, sy = b.y * T - cam.y;
  if (b.low) px(sx - 3, sy - 1, 6, 1, 'rgba(20,10,30,.25)');
  put(img, sx - img.width / 2, sy - b.alt - img.height);
}
function drawCritter(c, now) {
  const sx = c.x * T - cam.x, sy = c.y * T - cam.y;
  if (c.kind === 'sq') {
    const f = c.mode === 'dig' && Math.floor(now / 150) % 2 ? SQUIRREL.dig : SQUIRREL.a;
    const img = spr(f, { flip: c.face < 0 }), hop = c.mode !== 'dig' ? Math.abs(Math.sin(c.hop || 0)) * 3 : 0;
    put(img, sx - img.width / 2, sy - img.height - hop);
    drawEmote(c.emote, sx, sy - img.height, now);
  } else if (c.kind === 'mouse') {
    const img = spr(MOUSE, { flip: c.face < 0 }), hop = c.mode !== 'nibble' && c.mode !== 'frozen' ? Math.abs(Math.sin(c.hop || 0)) * 2 : 0;
    put(img, sx - img.width / 2, sy - img.height - hop);
    drawEmote(c.emote, sx, sy - img.height, now);
  } else if (c.kind === 'liz') {
    const rows = c.lou && !c.eyes ? LIZ_SHUT : LIZ, img = spr(rows, { flip: c.face < 0, colors: c.lou ? LOU : C });
    const sc = c.lou ? 2 : 1, bob = c.mode === 'bask' && Math.floor(now / 700 + c.rock) % 3 === 0 ? 1 : 0;
    put(img, sx - img.width * sc / 2, sy - img.height * sc - bob * sc, sc);
    if (c.lou && !c.eyes && c.mode === 'bask') put(spr(EMOTE.z), sx + 10, sy - 26 + Math.sin(now / 300) * 2);
    drawEmote(c.emote, sx, sy - img.height * sc, now);
  }
}
function drawWood(now) {
  const w = wood; if (!w || w.mode === 'gone') return;
  const sx = w.x * T - cam.x, sy = w.y * T - cam.y;
  const f = w.mode === 'fly' || w.mode === 'leave' ? BIRD.fly : w.mode === 'drum' && now - w.peck < 150 ? BIRD.peck : BIRD.a;
  const img = spr(f, { flip: w.mode === 'look' ? Math.floor(now / 400) % 2 === 0 : false });
  put(img, sx - img.width / 2, sy - img.height);
  if (w.mode === 'look') put(spr(EMOTE['?']), sx - 2, sy - img.height - 8);
}
function drawItemAt(it) {
  const img = spr(ITEM_PIX[it.pic], { flip: it.flip });
  const sx = it.home.x * T - cam.x, sy = (it.hang ? LINE_Y + .2 : it.home.y) * T - cam.y;
  put(img, sx - img.width / 2, it.hang ? sy : sy - img.height);
}
function hintBox(x, y, w, h, now) {          // blinking white corners round the next thing (the ? hint)
  if (Math.floor(now / 250) % 2) return;
  const c = '#ffffff', L = 4;
  for (const [ax, ay, sx2, sy2] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { px(sx2 > 0 ? ax : ax - L, ay - (sy2 > 0 ? 0 : 1), L, 1, c); px(ax - (sx2 > 0 ? 0 : 1), sy2 > 0 ? ay : ay - L, 1, L, c); }
}
function hintTargets() {
  const out = [];
  if (scene === 'night') {
    const n = night;
    if (n.fox.mode === 'come' || n.fox.mode === 'sniff') return [{ x: BOWL_X, y: 3.4 }];
    if (n.sid.mode === 'eat' && !n.blink) return [{ x: BOWL_X, y: 3.4 }];
    return [{ x: 9.9, y: 7.6 }];
  }
  if (phase === 'in') return [DOOR];
  if (phase === 'dusk' && activeDeer().length) {
    if (izzy.mode === 'sleep' || izzy.mode === 'rest') return [izzy];
    return [activeDeer().sort((a, b) => dist(P, a) - dist(P, b))[0]];
  }
  if (P.carry) return [STASH, P.carry.home];
  if (dinner && dinner.full.pepper && dinner.ate.biscuit && dinner.ate.tato) return [BOWLS.pepper];
  if (!S.job) return [BOARD];
  if (S.job === 'squirrels') { const s = squirrels.filter(o => !gone(o)); out.push(...(s.length ? s : holes)); }
  if (S.job === 'woodpecker' && wood) out.push({ x: wood.x, y: wood.y });
  if (S.job === 'lizards') { if (!S.sneak) out.push(cats.biscuit); else out.push(...lizards.filter(l => !gone(l))); }
  if (S.job === 'mice') { const m = mice.filter(o => !gone(o)).sort((a, b) => dist(P, a) - dist(P, b))[0]; return m ? [m, AMBUSH] : []; }
  return out.sort((a, b) => dist(P, a) - dist(P, b)).slice(0, 1);
}
function drawWindow(w) {
  const n = night, x0 = w.x * T - cam.x, y0 = -cam.y, W = w.w * T, ix = x0 + 3, iy = y0 + 4, iw = W - 6, ih = 2 * T - 9;
  px(x0 + 1, y0 + 2, W - 2, 2 * T - 5, '#3b2a1c');
  cx.save(); cx.beginPath(); cx.rect(ix, iy, iw, ih); cx.clip();
  px(ix, iy, iw, ih, '#1a2348');
  for (let i = 0; i < 6; i++) px(ix + (i * 37 + w.x * 11) % iw, iy + (i * 7) % 9 + 1, 1, 1, '#e8e8ff');
  px(ix, iy + ih - 8, iw, 8, '#4a3a2e');
  for (let i = 0; i < iw; i += 5) px(ix + i, iy + ih - 8, 1, 8, '#3a2c22');
  put(spr(BOWL_FULL), BOWL_X * T - cam.x - 4, iy + ih - 5);
  for (const a of [n.sid, n.fox]) {
    if (a.mode === 'wait' || a.mode === 'gone') continue;
    const img = spr(a === n.sid ? SID : FOX, { flip: a.face < 0, colors: a === n.sid ? SIDC : C });
    const bob = a.mode === 'eat' || a.mode === 'sniff' ? (Math.floor(performance.now() / 400) % 2) : 0;
    put(img, a.x * T - cam.x - img.width / 2, iy + ih - 1 - img.height + bob);
  }
  cx.restore();
  px(x0 + W / 2, iy, 1, ih, '#3b2a1c'); px(ix, iy + Math.floor(ih / 2), iw, 1, '#3b2a1c');
}
function drawNight(now) {
  cam.x = Math.round((RW * T - lo.width) / 2); cam.y = Math.round((RH * T - lo.height) / 2);
  px(0, 0, lo.width, lo.height, '#0d0b14');
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) cx.drawImage(roomTile(ROOM[y][x], x, y), x * T - cam.x, y * T - cam.y);
  for (const w of WINDOWS) drawWindow(w);
  const list = [{ y: izzy.y, d: () => drawIzzy(now) }, { y: P.y, d: () => drawPepper(now) }];
  for (const c of Object.values(cats)) list.push({ y: c.y, d: () => drawCat(c, now) });
  list.sort((a, b) => a.y - b.y).forEach(o => o.d());
  for (const p of puffs) px(p.x * T - cam.x, p.y * T - cam.y, 2, 2, '#c49a5e');
  px(0, 0, lo.width, lo.height, 'rgba(18,20,60,.28)');
  if (mode === 'play' && (now < hintUntil || !$('#help').hidden)) for (const h of hintTargets()) hintBox(h.x * T - cam.x - 9, h.y * T - cam.y - 18, 18, 20, now);
}
function draw(now) {
  if (scene === 'night') { drawNight(now); out.imageSmoothingEnabled = false; out.drawImage(lo, 0, 0, cv.width, cv.height); return; }
  const focus = mode === 'play' ? P : { x: 22, y: 9 };
  cam.x = Math.round(clamp(focus.x * T - lo.width / 2, 0, MW * T - lo.width));
  cam.y = Math.round(clamp((focus.y - .5) * T - lo.height / 2, 0, MH * T - lo.height));
  const x0 = Math.floor(cam.x / T), y0 = Math.floor(cam.y / T);
  for (let y = y0; y <= y0 + VH + 1 && y < MH; y++) for (let x = x0; x <= x0 + VW + 1 && x < MW; x++) cx.drawImage(groundTile(MAP[y][x], x, y), x * T - cam.x, y * T - cam.y);
  // the woodpecker's holes in the barn wall
  if (!S.done.woodpecker && wood) PERCHES.forEach((x, i) => { for (let k = 0; k < wood.marks[i]; k++) px(x * T - cam.x - 4 + (k % 3) * 3, 6 * T - cam.y + 4 + Math.floor(k / 3) * 4, 2, 2, '#3a120c'); });
  for (const h of holes) put(spr(HOLE, { outline: false }), h.x * T - cam.x - 5, h.y * T - cam.y - 3);
  // the clothesline
  const ly = LINE_Y * T - cam.y;
  px(LINE_POSTS[0] * T - cam.x, ly, (LINE_POSTS[1] - LINE_POSTS[0]) * T, 1, '#e9eef3');
  // everything that stands, back to front
  const list = [];
  for (const [x, y] of TREES) list.push({ y: y + 2, d: () => put(spr(TREE, { colors: TREE_C }), x * T - cam.x - 1, (y + 2) * T - cam.y - 32) });
  list.push({ y: 8, d: () => put(spr(BOARD_PIX), 25 * T - cam.x - 1, 8 * T - cam.y - 20) });
  for (const it of items) if (it.state === 'home') list.push({ y: it.hang ? LINE_Y + .5 : it.home.y, d: () => drawItemAt(it) });
  for (const [who, b] of Object.entries(BOWLS)) list.push({ y: b.y, d: () => put(spr(dinner && dinner.full[who] ? BOWL_FULL : BOWL), b.x * T - cam.x - 4, b.y * T - cam.y - 5) });
  // the long grass Biscuit hides in, drawn over her
  list.push({ y: AMBUSH.y + .35, d: () => { for (let i = 0; i < 26; i++) { const gx = AMBUSH.x * T - cam.x - 24 + (i % 13) * 4 + (i < 13 ? 2 : 0), gy = AMBUSH.y * T - cam.y + (i < 13 ? -1 : 5), h = 8 + (i * 5) % 5; px(gx, gy - h, 1, h, '#5e8a34'); px(gx + 1, gy - h + 2, 1, h - 2, '#86ad4a'); px(gx + 2, gy - h + 1, 1, h - 1, '#4c7428'); } } });
  for (const g of GARDEN) list.push({ y: g.y, d: () => { const img = spr(g.eaten ? STUB : PLANT); put(img, g.x * T - cam.x - img.width / 2, g.y * T - cam.y - img.height); } });
  list.push({ y: izzy.y, d: () => drawIzzy(now) });
  for (const d of deer) if (d.mode !== 'gone') list.push({ y: d.y, d: () => drawDeer(d, now) });
  for (const c of [...squirrels, ...lizards, ...mice]) if (c.mode !== 'gone') list.push({ y: c.y, d: () => drawCritter(c, now) });
  for (const c of Object.values(cats)) list.push({ y: c.y, d: () => drawCat(c, now) });
  if (mode === 'play') list.push({ y: P.y, d: () => drawPepper(now) });
  for (const w of tumbles) list.push({ y: w.y, d: () => {
    const img = w.what === 'rabbit' ? spr(Math.floor(w.rot) % 2 ? RABBIT.a : RABBIT.b, { flip: w.vx < 0 }) : spr(TUMBLE, { flip: Math.floor(w.rot) % 2 === 0 });
    put(img, w.x * T - cam.x - img.width / 2, w.y * T - cam.y - img.height - w.bob);
  } });
  list.push({ y: 7, d: () => drawWood(now) });
  list.sort((a, b) => a.y - b.y).forEach(o => o.d());
  for (const b of bats) drawBat(b);
  for (const p of puffs) px(p.x * T - cam.x, p.y * T - cam.y, 2, 2, '#c49a5e');
  // the light: pink at dawn, orange then dusky purple at dusk
  const k = phase === 'dusk' ? Math.min(1, (dayT - TUNE.duskAt) / 8) : phase === 'in' ? 1 : 0;
  if (k > 0) { px(0, 0, lo.width, lo.height, `rgba(255,110,40,${.24 * k})`); px(0, 0, lo.width, lo.height, `rgba(60,30,120,${(phase === 'in' ? .4 : .28) * k})`); }
  if (phase === 'dawn') px(0, 0, lo.width, lo.height, `rgba(255,170,190,${.2 * Math.max(0, 1 - dayT / TUNE.dawnLen)})`);
  if (mode === 'play' && (now < hintUntil || !$('#help').hidden)) for (const h of hintTargets()) hintBox(h.x * T - cam.x - 9, h.y * T - cam.y - 18, 18, 20, now);
  // onto the screen, pixels kept hard
  out.imageSmoothingEnabled = false;
  out.drawImage(lo, 0, 0, cv.width, cv.height);
}

// ---------- Cards ----------
function openCard(html, focusSel) {
  $('#card').innerHTML = html; $('#cover').hidden = false; stick.letGo(); hold = null; touchStay = false;
  for (const k in keys) keys[k] = false;
  const f = $('#card').querySelector(focusSel || '.btn.go') || $('#card').querySelector('button'); if (f) f.focus();
}
function closeCard() { $('#cover').hidden = true; }
$('#card').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'play') startPlay();
  else if (a === 'over') openCard(`<h2 id="cardTitle">${t('startOver')}</h2><p>${t('startOverAsk')}</p><div class="row"><button class="btn" data-act="title">${t('cancel')}</button><button class="btn go" data-act="reset">${t('startOver')}</button></div>`);
  else if (a === 'title') titleCard();
  else if (a === 'reset') { Object.assign(S, { respect: TUNE.respect.start, star: false, sneak: false, job: null, done: {}, started: false }); save(); spawn(); startDawn(); phase = 'day'; rabbitsLeft = 0; queue.length = 0; startPlay(); }
  else if (a === 'job') takeJob(b.dataset.job);
  else if (a === 'again') { S.done = {}; S.job = null; save(); spawn(); boardCard(); }
  else if (a === 'close') closeCard();
});
function titleCard() {
  openCard(`<h2 id="cardTitle">${t('title')}</h2><img class="bigpic" src="${picSrc(PEPPER.a)}" alt=""><p>${t('intro')}</p><div class="row">${S.started ? `<button class="btn" data-act="over">${t('startOver')}</button>` : ''}<button class="btn go" data-act="play">${t('play')}</button></div>`);
}
function boardCard() {
  const pics = { squirrels: picSrc(SQUIRREL.a), woodpecker: picSrc(BIRD.a), lizards: picSrc(LIZ, LOU), mice: picSrc(MOUSE) };
  const posters = JOB_IDS.map(id => {
    const status = S.done[id] ? `<p class="stamp">${t('caught')}</p>` : S.job === id ? `<p class="now">${t('onJob')}</p>` : `<button class="btn go" data-act="job" data-job="${id}">${t('takeJob')}</button>`;
    return `<div class="poster"><p class="w">${t('wanted')}</p><img src="${pics[id]}" alt=""><h3>${t(`jobs.${id}.name`)}</h3><p>${t(`jobs.${id}.line`)}</p>${status}</div>`;
  }).join('');
  const again = JOB_IDS.every(j => S.done[j]) ? `<button class="btn go" data-act="again">${t('postAgain')}</button>` : '';
  openCard(`<h2 id="cardTitle">${t('board')}</h2><div class="board">${posters}</div><div class="row"><button class="btn" data-act="close">${t('close')}</button>${again}</div>`, '.poster .btn.go');
}
function starCard() { SFX.star(); showRespect(); openCard(`<h2 id="cardTitle">${t('starTitle')}</h2><img class="bigpic" src="${picSrc(STAR)}" alt=""><p>${t('starText')}</p><div class="row"><button class="btn go" data-act="close">${t('keepPlaying')}</button></div>`); }
function allDoneCard() { openCard(`<h2 id="cardTitle">${t('allTitle')}</h2><p>${t('allText')}</p><p class="soft">${t('respect')}: ${S.respect}</p><div class="row"><button class="btn go" data-act="close">${t('keepPlaying')}</button></div>`); }

// ---------- Help ----------
function goalText() {
  if (scene === 'night') {
    const n = night;
    if (n.fox.mode === 'come' || n.fox.mode === 'sniff') return t('goalNightFox');
    if (n.sid.mode === 'come' || n.sid.mode === 'eat') return t('goalNightSid');
    return t('goalNight');
  }
  if (phase === 'in') return t('goalIn');
  if (phase === 'dusk' && activeDeer().length) return izzy.mode === 'follow' || izzy.mode === 'rest' ? t('goalIzzy') : t('goalDusk');
  if (P.carry) return t('goalCarry', { item: t(`items.${P.carry.id}`) });
  if (dinner && dinner.full.pepper) return t('goalDinner');
  if (!S.job) return t('goalBoard');
  if (S.job === 'squirrels') return t('goalSquirrels');
  if (S.job === 'woodpecker') return t('goalWood');
  if (S.job === 'mice') return t('goalMice');
  return S.sneak ? t('goalLizards') : t('goalLizardsNoSneak');
}
function fillHelp() {
  $('#helpList').innerHTML = [...STR.help, ...(S.sneak ? [STR.helpSneak] : [])].map(l => `<li>${l}</li>`).join('');
  fillStash(); fillStories();
}
function fillStories() {
  const told = STR.stories.slice(0, S.stories);
  $('#storyList').innerHTML = told.length ? told.map(l => `<li>${l}</li>`).join('') : `<li class="none">${t('noStories')}</li>`;
}
function fillStash() {
  $('#stashList').innerHTML = ITEMS.map(it => {
    const n = S.stash[it.id] || 0, name = t(`items.${it.id}`);
    return `<figure class="${n ? '' : 'no'}"><img src="${picSrc(ITEM_PIX[it.pic], C, 8)}" alt="${n ? name : t('notYet')}"><figcaption>${n ? (n > 1 ? `${name} ×${n}` : name) : '?'}</figcaption></figure>`;
  }).join('');
}
function toggleHelp(open = $('#help').hidden) {
  $('#help').hidden = !open; $('#helpBtn').setAttribute('aria-expanded', open);
  if (open) { $('#goalNow').textContent = goalText(); fillHelp(); } else hintUntil = performance.now() + TUNE.hint;
}
$('#helpBtn').addEventListener('click', () => toggleHelp());
$('#helpClose').addEventListener('click', () => toggleHelp(false));
$('#soundBtn').addEventListener('click', () => { S.sound = !S.sound; save(); $('#soundBtn').textContent = S.sound ? '🔔' : '🔕'; });

// ---------- Start ----------
function startPlay() {
  closeCard(); mode = 'play'; S.started = true; save();
  $('#helpBtn').hidden = false; $('#ctrl').hidden = false;
  tumbles = []; tumbleT = 6;
  showRespect(); showJob(); resize();
  if (!S.seenHelp) { S.seenHelp = true; save(); toggleHelp(true); }
}
function step(dt, now) {
  if (scene === 'night') {
    if (mode === 'play') { stepPepper(dt, now); stepNight(dt, now); }
    for (const c of Object.values(cats)) c.bumpCool = Math.max(0, c.bumpCool - dt);
  } else stepRanch(dt, now);
  if (mode === 'play') {
    const a = t(actionNow()); if ($('#actBtn').textContent !== a) $('#actBtn').textContent = a;
    if (!$('#help').hidden) { const g = goalText(); if ($('#goalNow').textContent !== g) $('#goalNow').textContent = g; }
  }
}
function stepRanch(dt, now) {
  if (mode === 'play') { stepPepper(dt, now); stepDay(dt); }
  if (scene !== 'ranch') return;          // the door was reached this frame
  stepIzzy(dt, now); stepDeer(dt, now); stepBats(dt);
  stepSquirrels(dt); stepWood(dt, now); stepLizards(dt, now); stepMice(dt, now); stepTumbles(dt, now); stepCats(dt, now);
  if (mode === 'play') stepDinner(dt);
  for (const it of items) it.cool = Math.max(0, it.cool - dt);
  for (const p of puffs) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 3 * dt; p.t -= dt; }
  puffs = puffs.filter(p => p.t > 0);
  if (mode === 'play') {
    checkJob();
    if (Math.floor(now / 500) !== step.last) { step.last = Math.floor(now / 500); showJob(); }
  }
}
// the page's own words come from STR too
document.querySelectorAll('[data-s]').forEach(e => e.textContent = t(e.dataset.s));
document.querySelectorAll('[data-s-label]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.sLabel)); e.title = t(e.dataset.sLabel); });
$('#soundBtn').textContent = S.sound ? '🔔' : '🔕';
spawn(); resize(); titleCard();
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  // one bad frame mustn't stop the game (Mission Directive, 16 Nov)
  try { if ($('#cover').hidden || mode === 'title') step(dt, now); draw(now); stepMsg(now); } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
