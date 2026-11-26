// Feed the Fart (Trello #55; the name decided 20 Nov). Pull my finger is the main button. Thanksgiving dinner: feed the
// plumber, fill his fart meter, pull his finger. The plumber is a family in-joke
// about a real person who is in on it and encourages it, so the family
// nickname is fine on screen (decided 20 Nov). He's lactose intolerant and
// denies it, so dairy makes the worst ones and he always says it wasn't the cheese.

const NAME = 'Uncle Stinky Butt';   // which nickname goes on screen is Randi's call; one place to change it

// Every visible string, by key (the parent CLAUDE.md wants a catalogue in a new game).
const T = {
  start: `It's Thanksgiving dinner. Feed ${NAME} from the table. When he holds out his finger, pull it. Find every kind of fart, and maybe the secret one.`,
  keys: 'On a keyboard: Tab to a food and press Enter. F pulls his finger. C opens the collection.',
  hintEmpty: 'Pick something from the table for him to eat.',
  hintReady: 'He\'s holding out his finger. Pull it now, or keep eating for a bigger one.',
  hintFull: 'He\'s full. Pull his finger!',
  hintBusy: '…',
  meterWords: ['Empty', 'Rumbling', 'Getting full', 'Full!'],
  mmm: 'Mmm, {food}.',
  dairyEat: ['Cheese never bothers me.', 'Dairy? I\'m fine with dairy.', 'My stomach is made of steel.'],
  full: 'I\'m stuffed. Pull my finger!',
  ready: 'Hey. Pull my finger.',
  cheese: 'It wasn\'t the cheese.',
  sneaky: 'Who, me?',
  sbd: 'What? I didn\'t hear anything.',
  after: ['Excuse me!', 'Better out than in.', 'That was the turkey.', 'You pulled it.'],
  roomEw: ['Ewww!', 'Open a window!', 'Not at the table!', 'Who did that?'],
  yell: `${NAME.toUpperCase()}!!`,
  tapatio: ['Don\'t forget my Tapatio!', 'Pass the hot sauce. The Tapatio.'],
  roomSbd: 'What is that SMELL?',
  coma: "I'm stuffed. Just resting my eyes...",
  wokeUp: "Huh? I wasn't asleep.",
  wokeSelf: 'Huh? Who farted?',
  wakeBtn: 'Wake him up',
  ohNo: 'Oh no.',
  goHome: 'I might need a change of clothes.',
  newFind: 'New fart: {name}!',
  count: 'Farts {n}/{total}',
  winText: `You found the Ultimate Shart, the secret win! ${NAME} made it to the bathroom. Nobody saw anything.`,
  notFound: '???',
  play: 'Play it',
  fromHouse: 'Dinner is what you found in the house.',
  snacks: 'Snacks from the fridge',
  locked: '???',
  lockedHint: 'Find {n} farts to unlock',
  lockedHint1: 'Find 1 fart to unlock',
  newSnack: 'New snack: {name}!',
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  live: '{name}! {react}',
  liveReact: ['Nobody noticed.', 'The dog covers its nose.', 'Everyone holds their nose.', 'The flowers wilt and the cat runs off.'],
};
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const pick = a => a[Math.floor(Math.random() * a.length)];

// Each food adds gas and pushes the mix toward a kind of fart. The weights add
// up to 1 per food: dairy, sulfur (eggs, sprouts, beans), bread, sweet, savory.
const FOODS = [
  { id: 'turkey', name: 'Turkey', gas: 15, mix: { savory: 1 } },
  { id: 'stuffing', name: 'Stuffing', gas: 15, mix: { bread: .6, savory: .4 } },
  { id: 'mash', name: 'Mashed potatoes', d: 'with butter', gas: 15, mix: { dairy: .5, savory: .5 } },
  { id: 'gravy', name: 'Gravy', gas: 10, mix: { savory: 1 } },
  { id: 'casserole', name: 'Green bean casserole', gas: 15, mix: { dairy: .5, sulfur: .5 } },
  { id: 'mac', name: 'Mac and cheese', gas: 25, mix: { dairy: 1 } },
  { id: 'sweetpot', name: 'Sweet potatoes', d: 'with marshmallows', gas: 15, mix: { sweet: 1 } },
  { id: 'cranberry', name: 'Cranberry sauce', gas: 10, mix: { sweet: 1 } },
  { id: 'corn', name: 'Corn', gas: 10, mix: { sweet: .4, savory: .6 } },
  { id: 'rolls', name: 'Rolls', d: 'with butter', gas: 10, mix: { bread: .8, dairy: .2 } },
  { id: 'eggs', name: 'Deviled eggs', gas: 20, mix: { sulfur: 1 } },
  { id: 'sprouts', name: 'Brussels sprouts', gas: 20, mix: { sulfur: 1 } },
  { id: 'pie', name: 'Pumpkin pie', d: 'with whipped cream', gas: 15, mix: { sweet: .5, dairy: .5 } },
  { id: 'eggnog', name: 'Eggnog', gas: 30, mix: { dairy: 1 } },
  // More to pick from (Randi, 22 Nov: "they want more variety - like beans,
  // nachos, milk shakes"). In the house his brothers bring them.
  { id: 'beans', name: 'Baked beans', gas: 25, mix: { sulfur: .5, sweet: .3, savory: .2 } },
  { id: 'nachos', name: 'Nachos', d: 'with extra cheese', gas: 20, mix: { dairy: .6, savory: .4 } },
  { id: 'shake', name: 'Milkshake', d: 'chocolate', gas: 25, mix: { dairy: .6, sweet: .4 } },
  // Snacks from the fridge (decided 20 Nov, family favorites). Each unlocks
  // when that many kinds of fart have been found, and has its own line.
  { id: 'pizzabites', name: 'Pizza bites', gas: 15, mix: { dairy: .5, savory: .5 }, unlock: 1, say: 'Pizza bites! The best food group.' },
  { id: 'bagel', name: 'Cream cheese bagel', gas: 20, mix: { dairy: .6, bread: .4 }, unlock: 3, say: 'Extra cream cheese. Always.' },
  { id: 'sardines', name: 'Sardines', d: 'and cheese crackers', gas: 25, mix: { sulfur: .6, dairy: .2, bread: .2 }, unlock: 5, say: 'Sardines and cheese crackers. Don\'t tell anyone.' },
  { id: 'creamblock', name: 'A whole block of cream cheese', d: 'with tortilla chips', gas: 40, mix: { dairy: .85, savory: .15 }, unlock: 7,
    say: 'It\'s a dip. Dip is a vegetable.', room: 'Is that a WHOLE block of cream cheese?' },
];

// The kinds of fart, in collection order. size scales the cloud; react is the
// least the room does (0 nothing, 1 the dog, 2 the family, 3 everything).
const TYPES = {
  sbd:      { name: 'Silent But Deadly', d: 'No sound. The biggest stink.', hint: 'Eggs and sprouts, and not a sound.', color: '#a6c73a', size: 1.5, alpha: .35, react: 3 },
  squeaker: { name: 'The Squeaker', d: 'A short, high squeak.', hint: 'Something sweet.', color: '#f2a7c3', size: .55, alpha: .7, react: 1 },
  duck:     { name: 'The Duck', d: 'Quack.', hint: 'Ducks love bread.', color: '#ffd84a', size: .75, alpha: .7, react: 1 },
  trumpet:  { name: 'The Trumpet', d: 'A long, brassy blast.', hint: 'Lots of dairy. He says it wasn\'t.', color: '#e08a2b', size: 1.1, alpha: .7, react: 2 },
  machine:  { name: 'The Machine Gun', d: 'Rapid-fire bursts.', hint: 'A little of everything.', color: '#9a9a9a', size: .45, alpha: .75, react: 2 },
  rumbler:  { name: 'The Rumbler', d: 'A low, long rumble.', hint: 'Turkey and gravy.', color: '#a0784a', size: 1, alpha: .7, react: 1 },
  sneaky:   { name: 'The Sneaky', d: 'A tiny cloud. Watch who notices.', hint: 'Pull early, before he\'s very full.', color: '#d6d6d6', size: .3, alpha: .5, react: 1 },
  shart:    { name: 'The Ultimate Shart', d: 'The secret win. He ran for the bathroom.', hint: 'The secret one. Nobody knows the recipe.', color: '#7f8a3a', size: 1.6, alpha: .75, react: 3 },
};
const ORDER = Object.keys(TYPES);

// The rules, first match wins. The shart recipe is the secret (card #55): the
// meter maxed, eggnog and mac and cheese, plus deviled eggs or Brussels sprouts.
function whichFart(b = belly) {   // the house passes its own belly
  const share = k => b[k] / Math.max(1, b.total);
  if (b.gas >= 100 && b.ate.has('eggnog') && b.ate.has('mac') && (b.ate.has('eggs') || b.ate.has('sprouts'))) return 'shart';
  if (b.gas < 35) return 'sneaky';
  if (share('sulfur') >= .4) return 'sbd';
  if (share('dairy') >= .45) return 'trumpet';
  if (b.ate.size >= 5) return 'machine';
  if (share('bread') >= .4) return 'duck';
  if (share('sweet') >= .4) return 'squeaker';
  return 'rumbler';
}

// Each food is a little pixel drawing, not an emoji (decided 20 Nov: "can we
// not use icons"). One letter per pixel; '.' is see-through. PAL is the colours.
const PAL = { k: '#2a1a0e', h: '#fffbe9', w: '#f4efe4', p: '#c9c2b4', e: '#e2d6bd', c: '#f4e0b0', b: '#d9a05a', B: '#7a4a22',
  o: '#e8923a', O: '#b5642a', z: '#7a3a14', y: '#ffd84a', Y: '#d99a1e', g: '#6cbf3f', G: '#2f7a2a', r: '#d8344f', R: '#8a1c30',
  P: '#f27d92', q: '#7fb0e6', u: '#3a74b8', U: '#23508a', s: '#e0652a', m: '#fff6e6', M: '#d99a5a' };
const WHITE_BOWL = ['kkkkkkkkkkkkkkkk', 'khwwwwwwwwwwwwpk', 'kwwwwwwwwwwwwwpk', '.kwwwwwwwwwwwpk.', '..kwwwwwwwwwpk..', '...kkppppppkk...', '....kkkkkkkk....'];
const BLUE_BOWL = ['kkkkkkkkkkkkkkkk', 'kqqqqqqqqqqqqqUk', 'kquuuuuuuuuuuuUk', '.kuuuuuuuuuuuUk.', '..kuuuuuuuuuUk..', '...kkUUUUUUkk...', '....kkkkkkkk....'];
const RED_BOWL = ['kkkkkkkkkkkkkkkk', 'kPPPPPPPPPPPPPRk', 'kPrrrrrrrrrrrrRk', '.krrrrrrrrrrrRk.', '..krrrrrrrrrRk..', '...kkRRRRRRkk...', '....kkkkkkkk....'];
const DISH = ['kkkkkkkkkkkkkkkk', 'kpkhwwwwwwwwkpk.', '.kkwwwwwwwwwwkk.', '..kwwwwwwwwwwk..', '..kppppppppppk..', '..kkkkkkkkkkkk..'];
const SPRITES = {
  turkey: ['...........kkk..', '..........khwwk.', '..........kwwwk.', '.........kwwkk..', '........kzOk....', '.......kzOOk....',
    '....kkkOOOOk....', '...kOOoOOOOk....', '..kOoooOOOOzk...', '.kOoohoOOOOzk...', '.kOooooOOOzzk...', '.kOOooOOOOzk....',
    '.kzOOOOOOzzk....', '..kzzOOzzzk.....', '...kkzzzkk......'],
  stuffing: ['....kkkkkkkk....', '..kkbcbBcbgbkk..', '.kbcBbgcbBcbcbk.', '.kcbBcbbcgbBcbk.', ...WHITE_BOWL],
  mash: ['.......kk.......', '......kyyk......', '.....kyhyYk.....', '...kkwyyYYwkk...', '..kwhwwwwwwwek..', '.kwhwwewwwwewek.', ...BLUE_BOWL],
  gravy: ['kk..........kk..', 'kBk.......kkkwk.', '.kBkkkkkkkk..kwk', '.kwBBBBzBBBk.kwk', '.khwwwwwwwwwkkwk', '..kwhwwwwwwwwwk.',
    '...kwwwwwwwwpk..', '....kkwwwwppk...', '.....kppppk.....', '....kkkkkkkk....'],
  casserole: ['...kkkkkkkkkk...', '..kMoMkoMoMoMk..', '.kgoMgoMgoMgogk.', '.kGgGgGgGgGgGgk.', ...DISH],
  mac: ['....kkkkkkkk....', '..kkyYyhYyYykk..', '.kyYyYYyYyYyYyk.', '.kYyhyYyYYyYyYk.', ...RED_BOWL],
  sweetpot: ['...kkkkkkkkkk...', '..kmMkmMkmMmkk..', '.kmMmsmMsmMmMsk.', '.kssssssssssssk.', ...DISH],
  cranberry: ['....kkkkkkkk....', '...kPrrrrrrRk...', '...krPrrrrrRk...', '...kRRRRRRRRk...', '...kPrrrrrrRk...', '...krrrrrrrRk...',
    '...kRRRRRRRRk...', '...kPrrrrrrRk...', '...krrrrrrrRk...', '.kkkkkkkkkkkkkk.', 'kphhhhhhhhhhhhpk', 'kppppppppppppppk', '.kkkkkkkkkkkkkk.'],
  corn: ['......kkkk......', '.....kyyyyk.....', '....khYyYyYk....', '....khyYyYyk....', '....khYyYyYk....', '....khyYyYyk....', '....khYyYyYk....', '...kkhyYyYykk...', '..kgGhYyYyYggk..', '..kGggyYyYggGk..', '.kGggGYyYygGggk.', '.kggGggYygGggGk.', '..kGggGyYGggGk..', '...kgGggGggGk...', '....kkkGggkk....', '......kGGk......'],
  rolls: ['....kkkkkkk.....', '...kbhbbbbbk....', '..kbhbbbbbbOk...', '.kbbbkbbbkbbOk..', '.kbbbbkbkbbbOk..', '.kOcccccccccOk..',
    '.kOOOOOOOOOOOk..', '..kkkkkkkkkkk...', '..........kkkkk.', '.........kyhyyk.', '.........kyyyYk.', '.........kkkkkk.'],
  eggs: ['.kkkkk...kkkkk..', 'khyryek.khyyrek.', 'kwyyyek.kwyyyek.', 'kwwwwek.kwwwwek.', '.kweek...kweek..', '..kkk.....kkk...',
    'kkkkkkkkkkkkkkkk', 'kphhhhhhhhhhhhpk', '.kkkkkkkkkkkkkk.'],
  sprouts: ['....kkkk........', '...khgGgk.kkkk..', '..kgGgGgGkhgGgk.', '..kGgGgGGkgGgGGk', '..kgGgGGkkGgGGGk', '...kkkkk.kkgGGk.',
    '.kkkkk....kkkk..', 'khgGgGk.........', 'kgGgGGk.........', 'kGgGGGk.........', '.kkkkk..........'],
  pie: ['..........kkk...', '.........khwwk..', '........kkwwwk..', '......kkoowkk...', '.....kooooook...', '....kohooooOk...',
    '...koooooooOk...', '..kooooooooOk...', '.kooooooooOOk...', 'kMMMMMMMMMMMMk..', 'kBBBBBBBBBBBBk..', '.kkkkkkkkkkkk...'],
  eggnog: ['...kkkkkkkk.....', '...kcBcccBck....', '...kccBccccbk...', '...khcccccckkk..', '...khcccccck.kk.', '...khcccccck..k.',
    '...khcccccck.kk.', '...khcccccckkk..', '...kwcccccck....', '...kwwwwwwwk....', '....kkkkkkk.....'],
  beans: ['....kkkkkkkk....', '..kkOzOOzOOzkk..', '.kOzOOzhOzOOzOk.', '.kzOOzOOzOOhzOk.', ...WHITE_BOWL],
  nachos: ['.....k....k.....', '....kyk..kyk....', '...kyYyk.kyyk...', '..kyyooyykyoyk..', '.kyoooooooooyyk.', '.kooooyoooyoook.', ...DISH],
  shake: ['..........kk....', '.....kk..kPk....', '....krRk.kPk....', '...kkwwwkPkkk...', '..khwwwwwwwwwk..', '..kwwwwwwwwwpk..', '..kkkkkkkkkkkk..',
    '...kBBBBBBBBk...', '...khBBBBBBBk...', '....kBBBBBBk....', '....khBBBBBk....', '.....kBBBBk.....', '......kkkk......', '.......kk.......', '.....kkkkkk.....'],
  // for Date night (23 Nov): what he heats up; not on the Thanksgiving table
  lasagna: ['..kkkkkkkkkkkk..', '.kyrYryrYryrYrk.', '.kooooooooooook.', '.kyyyyyyyyyyyyk.', '.krrRrrRrrRrrRk.', ...DISH],
  garlic: ['.kkkkkkkkkkkkkk.', '.kbgbbgbbgbbgbk.', '.kyyyyyyyyyyyyk.', '.kbbbbbbbbbbbbk.', '.kOOOOOOOOOOOOk.', '.kkkkkkkkkkkkkk.', ...DISH.slice(1)],
  pizzabites: ['................', '................', '................', '.kkkk.kkkk.kkkk.', 'kyrhykyrhykyrhyk', 'kyyyYkyyyYkyyyYk', 'kYyyYkYyyYkYyyYk', '.kkkk.kkkk.kkkk.', 'kkkkkkkkkkkkkkkk', 'kphhhhhhhhhhhhpk', '.kkkkkkkkkkkkkk.'],
  bagel: ['....kkkkkkkk....', '..kkbbbbbbbbkk..', '.kbbwwwwwwwwbbk.', 'kbbwwwhhwwwwwbbk', 'kbwwwhwwkkwwwwbk', 'kbwwwwwk..kwwwbk', 'kbwwwwwk..kwwwbk', 'kbwwwwwwkkwwwwbk', 'kbbwwwwwwwwwwbbk', '.kbbwwwwwwwwbbk.', '..kkbbOObbbbkk..', '....kkkkkkkk....'],
  sardines: ['kkkkkkkkkkkk....', 'kwquuuuuuqwk....', 'kwqqqqqqqqwk....', 'kwquuuuuuqwk....', 'kwqqqqqqqqwk....', 'kwwwwwwwwwwk....', 'kkkkkkkkkkkk....', '.kkkkkk.kkkkkkk.', '.koYoYk.koYoYok.', '.kooook.koooook.', '.koYoYk.koYoYok.', '.kkkkkk.kkkkkkk.'],
  creamblock: ['..kkkkkkkkkkk...', '..khhhhhhhhhk...', '..kwwwwwwwwwk...', '..kwwwwwwwwwk...', '..kwwwwwwwwwk...', '.kpppppppppppk..', '.kpwpwpwpwpwpk..', '..kkkkkkkkkkk...', '.k....k....k....', 'kyk..kyk..kyk...', 'kyYk.kyYk.kyYk..', 'kkkkkkkkkkkkkk..'],
};
PAL.K = PAL.k;
function spriteURL(id, dark) {   // dark: a one-colour outline for a snack not unlocked yet
  const rows = SPRITES[id], c = document.createElement('canvas'); c.width = c.height = 16;
  const x = c.getContext('2d'), top = 16 - rows.length >> 1;
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (PAL[ch]) { x.fillStyle = dark ? '#6b5a48' : PAL[ch]; x.fillRect(i, top + j, 1, 1); } }));
  return c.toDataURL();
}

const $ = s => document.querySelector(s);
const svg = $('#scene');
const KEY = 'feed-the-fart:found', SKEY = 'feed-the-fart-sound';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
let found = new Set();
try { found = new Set(JSON.parse(store.get(KEY) || '[]').filter(k => TYPES[k])); } catch (e) {}
let soundOn = store.get(SKEY) !== 'off';
let belly, busy = false, clearT = 0;
let mode = 'start';   // 'start', 'house' or 'dinner'
const READY = 20;   // the finger comes out at 20%, so the Sneaky (a small one) can be found; full is the big payoff
function emptyBelly() { belly = { gas: 0, total: 0, dairy: 0, sulfur: 0, bread: 0, sweet: 0, savory: 0, ate: new Set() }; }
emptyBelly();

// ---------- sound: everything is made in the browser, no recordings ----------
let ac, master, noiseBuf;
function audio() {
  if (!ac) {
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = .8; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; }
  }
  if (ac && ac.state === 'suspended') ac.resume();
  return soundOn ? ac : null;
}
// One fart voice: a buzzing tone with a wobble on its pitch, a flutter on its
// loudness (the "brrrap"), and some filtered noise for air.
function brap(t, dur, o) {
  const osc = ac.createOscillator(); osc.type = o.wave || 'sawtooth';
  osc.frequency.setValueAtTime(o.f, t); osc.frequency.linearRampToValueAtTime(o.f2 || o.f, t + dur);
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = o.wob || 0; lg.gain.value = o.depth || 0;
  lfo.connect(lg); lg.connect(osc.frequency);
  const amp = ac.createGain(); amp.gain.value = o.flut ? .5 : 1;
  const fl = ac.createOscillator(), flg = ac.createGain(); fl.type = 'square'; fl.frequency.value = o.flut || 1; flg.gain.value = o.flut ? .5 : 0;
  fl.connect(flg); flg.connect(amp.gain);
  const n = ac.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
  const nf = ac.createBiquadFilter(); nf.type = o.hiss ? 'highpass' : 'bandpass'; nf.frequency.value = o.hiss ? 2500 : o.f * 2; nf.Q.value = .8;
  const ng = ac.createGain(); ng.gain.value = o.noise || 0;
  const og = ac.createGain(); og.gain.value = o.tone == null ? 1 : o.tone;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp || 1000;
  const env = ac.createGain(), v = o.vol || .5;
  env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(v, t + .02);
  env.gain.setValueAtTime(v * .85, t + dur * .7); env.gain.linearRampToValueAtTime(0, t + dur);
  osc.connect(og); og.connect(amp); n.connect(nf); nf.connect(ng); ng.connect(amp); amp.connect(lp); lp.connect(env); env.connect(master);
  [osc, lfo, fl, n].forEach(s => { s.start(t); s.stop(t + dur + .05); });
}
function quack(t) {
  const o = ac.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(620, t); o.frequency.exponentialRampToValueAtTime(400, t + .16);
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1150; bp.Q.value = 3;
  const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9, t + .02); g.gain.linearRampToValueAtTime(0, t + .17);
  o.connect(bp); bp.connect(g); g.connect(master); o.start(t); o.stop(t + .2);
}
function note(t, f, dur, wave, vol, vib) {
  const o = ac.createOscillator(); o.type = wave; o.frequency.value = f;
  if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 6; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur); }
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
  const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .03); g.gain.setValueAtTime(vol, t + dur * .8); g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
}
const SOUNDS = {
  sbd() {},   // silent, by definition
  squeaker(t, v) { brap(t, .38, { f: 430, f2: 580, wob: 9, depth: 40, flut: 40, lp: 3200, noise: .15, vol: .45 * v, wave: 'square' }); },
  duck(t, v) { brap(t, .22, { f: 110, flut: 28, lp: 700, noise: .3, vol: .6 * v }); quack(t + .28); quack(t + .52); },
  trumpet(t, v) { brap(t, 1.4, { f: 185, f2: 168, wob: 5.5, depth: 7, lp: 2200, noise: .06, vol: .45 * v, wave: 'square' }); },
  machine(t, v) { for (let i = 0; i < 9; i++) brap(t + i * .11, .08, { f: 95 + Math.random() * 30, flut: 30, lp: 900, noise: .35, vol: .7 * v }); },
  rumbler(t, v) { brap(t, 2.1, { f: 55, f2: 44, wob: 3, depth: 6, flut: 17, lp: 420, noise: .25, vol: .95 * v }); },
  sneaky(t, v) { brap(t, .55, { f: 200, wave: 'sine', tone: 0, hiss: true, lp: 6000, noise: .6, vol: .12 * v }); },
  shart(t) { brap(t, .75, { f: 72, f2: 92, flut: 22, wob: 4, depth: 10, lp: 650, noise: .55, vol: .95 }); },
};
function sadTrombone(t) { [311, 294, 277].forEach((f, i) => note(t + i * .38, f, .34, 'sawtooth', .35)); note(t + 1.14, 262, 1.1, 'sawtooth', .35, 7); }
// Plain beeps come from the kit (RDG.sound); the farts, the quack and the sad
// trombone stay this game's own, since they need noise, wobble and vibrato.
const tone = RDG.sound({ on: () => soundOn, vol: .1 });
function nom() { tone(520, .07, 'sine', 0, .2); tone(440, .07, 'sine', .1, .2); }
function slam() { const a = audio(); if (!a) return; brap(a.currentTime, .15, { f: 60, tone: .5, noise: 1, lp: 500, vol: .9 }); }
function playType(k, v) { const a = audio(); if (a) SOUNDS[k](a.currentTime + .02, v || 1); }

// ---------- the clouds ----------
const NS = 'http://www.w3.org/2000/svg';
function cloud(type, scale, slow, x0, y0) {
  const ty = TYPES[type], g = document.createElementNS(NS, 'g');
  for (let i = 0; i < 8; i++) {
    const c = document.createElementNS(NS, 'circle');
    const a = i / 8 * Math.PI * 2;
    c.setAttribute('cx', (Math.cos(a) * 26 * (.6 + Math.random() * .5)).toFixed(1));
    c.setAttribute('cy', (Math.sin(a) * 16 * (.6 + Math.random() * .5)).toFixed(1));
    c.setAttribute('r', (22 + Math.random() * 14).toFixed(1));
    c.setAttribute('fill', ty.color);
    g.append(c);
  }
  $('#clouds').append(g);
  const sx = x0 == null ? 108 : x0, sy = y0 == null ? 322 : y0;
  const dur = (2600 + scale * 1800) * (slow || 1), t0 = performance.now();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function step(now) {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 2);
    const s = .25 + e * scale * 2.4;
    const x = sx + (reduce ? 0 : e * 260 * scale), y = sy - (reduce ? 0 : e * 90);
    g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
    g.setAttribute('opacity', (ty.alpha * (p < .6 ? 1 : 1 - (p - .6) / .4)).toFixed(3));
    if (p < 1) requestAnimationFrame(step); else g.remove();
  })(t0);
}

// ---------- the room ----------
function react(level) {
  clearTimeout(clearT);
  if (level >= 1) svg.classList.add('dognose');
  // Decided 20 Nov: the kids at the table yell his name on the bad ones; always
  // on the biggest, about half the time on medium ones.
  if (level >= 2) { svg.classList.add('noses', 'flydrop'); sayRoom(level >= 3 || Math.random() < .5 ? T.yell : pick(T.roomEw)); }
  if (level >= 3) svg.classList.add('wilt', 'catgone');
  clearT = setTimeout(calm, 7000);
}
function calm() { svg.classList.remove('dognose', 'noses', 'flydrop', 'wilt', 'catgone'); $('#sayRoom').hidden = true; }

let sayT = {};
function bubble(id, text, ms) {
  const el = $(id); el.textContent = text; el.hidden = false;
  clearTimeout(sayT[id]); if (ms) sayT[id] = setTimeout(() => el.hidden = true, ms);
}
const say = (t, ms = 2600) => bubble('#sayHim', t, ms);
const sayRoom = t => bubble('#sayRoom', t, 4000);
let faceT;
function face(f, ms) { svg.dataset.face = f; clearTimeout(faceT); if (ms) faceT = setTimeout(() => svg.dataset.face = 'normal', ms); }

// ---------- eating, the meter, the finger ----------
function eat(f) {
  if (busy || belly.gas >= 100) return;
  audio(); nom();
  belly.gas = Math.min(100, belly.gas + f.gas); belly.total += f.gas;
  for (const k in f.mix) belly[k] += f.mix[k] * f.gas;
  belly.ate.add(f.id);
  face('eat', 500);
  if (f.room) sayRoom(f.room);
  if (belly.gas >= 100) say(T.full, 0);
  else if (f.say) say(f.say);
  // his go-to hot sauce (decided 20 Nov), now and then on savory food
  else if ((f.mix.savory || 0) + (f.mix.sulfur || 0) >= .5 && Math.random() < .35) say(pick(T.tapatio));
  else if ((f.mix.dairy || 0) >= .5) say(pick(T.dairyEat));
  else if (belly.gas >= READY && !svg.classList.contains('finger')) say(T.ready);
  else say(fill(T.mmm, { food: f.name.toLowerCase() }), 1500);
  update();
  meal++;
  if (meal >= COMA_AT) setTimeout(startComa, 1200);
}

// The food coma (card #55: "after too much food he dozes off in the recliner,
// and sneaky farts slip out while he sleeps"). After COMA_AT helpings at one
// dinner he leans back in the recliner by the door and snores; every few
// seconds a fart slips out on its own, the table reacts as usual, and new
// kinds count for the collection. Wake him up (the button, tapping him, or F)
// or wait: after five he wakes by himself. The meal count starts again.
const COMA_AT = 10;
let meal = 0, coma = null;
function startComa() {
  if (coma || busy || mode !== 'dinner') return;
  busy = true; coma = { farts: 0, timers: [] };
  svg.classList.remove('finger'); svg.classList.add('coma');
  say(T.coma, 3200);
  $('#pullBtn').hidden = true; $('#wakeBtn').hidden = false; $('#wakeBtn').focus();
  update();
  const snore = () => { if (!coma) return; const a = audio(); if (a) brap(a.currentTime, 1.1, { f: 70, f2: 50, wave: 'sine', flut: 9, lp: 300, noise: .3, vol: .12 }); coma.timers.push(setTimeout(snore, 2600)); };
  coma.timers.push(setTimeout(snore, 1800));
  coma.timers.push(setTimeout(sleepFart, 3800));
}
function sleepFart() {
  if (!coma) return;
  const type = pick(['sneaky', 'sneaky', 'squeaker', 'sbd', 'rumbler']), ty = TYPES[type];
  cloud(type, ty.size * .9, 1, 150, 318);
  playType(type, .6);
  const delay = type === 'sbd' ? 2600 : 600;
  coma.timers.push(setTimeout(() => {
    react(type === 'sneaky' ? 1 : ty.react);
    if (type === 'sbd') sayRoom(T.roomSbd);
    discover(type);
  }, delay));
  if (++coma.farts >= 5) coma.timers.push(setTimeout(() => wake(false), delay + 2500));
  else coma.timers.push(setTimeout(sleepFart, 4000 + Math.random() * 2500));
}
function wake(byYou, quiet) {
  if (!coma) return;
  coma.timers.forEach(clearTimeout); coma = null; meal = 0;
  svg.classList.remove('coma');
  $('#wakeBtn').hidden = true; $('#pullBtn').hidden = false;
  emptyBelly(); busy = false; face('normal'); update();
  if (!quiet) say(byYou ? T.wokeUp : T.wokeSelf, 2600);
  $('#pullBtn').focus();
}
function update() {
  const g = belly.gas;
  $('#meterFill').style.width = g + '%';
  $('#meter').setAttribute('aria-valuenow', g);
  const w = g >= 100 ? 3 : g >= 50 ? 2 : g > 0 ? 1 : 0;
  $('#meterWord').textContent = T.meterWords[w];
  $('#meter').setAttribute('aria-valuetext', `${g}%, ${T.meterWords[w]}`);
  const ready = g >= READY && !busy;
  svg.classList.toggle('finger', ready);
  $('#pullBtn').disabled = !ready;
  $('#pullBtn').classList.toggle('ready', ready && g >= 100);
  for (const { f, b } of foodBtns) { drawFood(f, b); b.disabled = locked(f) || busy || g >= 100; }
  $('#hint').textContent = busy ? T.hintBusy : g >= 100 ? T.hintFull : g >= READY ? T.hintReady : T.hintEmpty;
  svg.style.setProperty('--b', (1 + g * .0018).toFixed(3));
  $('#collBtn').textContent = fill(T.count, { n: found.size, total: ORDER.length });
}

function pull() {
  if (busy || belly.gas < READY) return;
  audio();
  busy = true;
  const type = whichFart(), ty = TYPES[type], full = belly.gas / 100;
  const dairy = belly.dairy / Math.max(1, belly.total) >= .3;
  const scale = ty.size * (.55 + full * .6);
  $('#sayHim').hidden = true;
  update();
  if (type === 'shart') return shart();
  if (type === 'machine') { for (let i = 0; i < 6; i++) setTimeout(() => cloud(type, scale), i * 110); }
  else cloud(type, scale);
  playType(type, .55 + full * .45);
  const level = Math.max(ty.react, full >= .99 ? 2 : full >= .7 ? 1 : 0);
  const delay = type === 'sbd' ? 2600 : 600;
  face(type === 'sneaky' || type === 'sbd' ? 'smug' : 'normal');
  setTimeout(() => {
    react(type === 'sneaky' ? 1 : level);
    if (type === 'sbd') { sayRoom(T.roomSbd); setTimeout(() => sayRoom(T.yell), 1600); }
    $('#live').textContent = fill(T.live, { name: ty.name, react: T.liveReact[type === 'sneaky' ? 1 : level] });
  }, delay);
  setTimeout(() => {
    say(dairy ? T.cheese : type === 'sneaky' ? T.sneaky : type === 'sbd' ? T.sbd : pick(T.after), 3000);
    discover(type);
  }, delay + 500);
  setTimeout(() => { emptyBelly(); busy = false; face('normal'); update(); }, delay + 2400);
}

function discover(type) {
  if (found.has(type)) return;
  found.add(type); store.set(KEY, JSON.stringify([...found]));
  const snack = FOODS.find(f => f.unlock === found.size);
  toast(fill(T.newFind, { name: TYPES[type].name }) + (snack ? ' ' + fill(T.newSnack, { name: snack.name }) : ''));
  update();
}
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3000); }

// The secret win. Decided 20 Nov: keep it cartoony, never the mess. His face
// freezes, a slow pause, "Oh no.", then he runs off to the bathroom (added
// 20 Nov), the door slams, and "I might need a change of clothes." comes from
// behind it (it replaced the card's "I need to go home." the same day).
function shart() {
  const a = audio(); if (a) SOUNDS.shart(a.currentTime + .02);
  cloud('shart', 1.6, 2.2);
  face('frozen');
  svg.classList.add('slow');
  react(3);
  $('#live').textContent = TYPES.shart.name + '!';
  setTimeout(() => say(T.ohNo, 0), 1600);
  setTimeout(() => { $('#sayHim').hidden = true; svg.classList.add('dooropen'); $('#him').classList.add('run'); }, 3400);
  setTimeout(() => { svg.classList.remove('dooropen'); slam(); }, 4700);
  setTimeout(() => { bubble('#sayDoor', T.goHome, 0); const a2 = audio(); if (a2) sadTrombone(a2.currentTime + .05); $('#live').textContent = T.goHome; }, 5600);
  setTimeout(() => {
    discover('shart');
    $('#winText').textContent = T.winText;
    $('#winCover').hidden = false; $('#winAgain').focus();
  }, 8200);
}
function playAgain() {
  $('#winCover').hidden = true; $('#sayDoor').hidden = true;
  svg.classList.remove('slow'); $('#him').classList.remove('run');
  calm(); face('normal'); emptyBelly(); busy = false; meal = 0; update();
  $('#pullBtn').focus();
}

// ---------- the collection ----------
const CLOUD_ICON = c => `<svg viewBox="0 0 64 48" aria-hidden="true"><g fill="${c}"><circle cx="20" cy="28" r="13"/><circle cx="34" cy="20" r="15"/><circle cx="46" cy="30" r="12"/><circle cx="30" cy="34" r="12"/></g></svg>`;
function showColl() {
  $('#collList').innerHTML = '';
  for (const k of ORDER) {
    const t = TYPES[k], has = found.has(k), li = document.createElement('li');
    li.innerHTML = has
      ? `${CLOUD_ICON(t.color)}<div><b>${t.name}</b><span class="d">${t.d}</span>${k === 'sbd' ? '' : `<button type="button" data-k="${k}">${T.play}</button>`}</div>`
      : `${CLOUD_ICON('#4a3826')}<div><b>${T.notFound}</b><span class="d">${t.hint}</span></div>`;
    $('#collList').append(li);
  }
  $('#collCover').hidden = false; $('#collClose').focus();
}
$('#collList').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) playType(b.dataset.k === 'shart' ? 'shart' : b.dataset.k, 1); });
const closeColl = () => { $('#collCover').hidden = true; $('#collBtn').focus(); };
$('#collClose').onclick = closeColl;
$('#collBtn').onclick = showColl;
$('#winColl').onclick = () => { playAgain(); showColl(); };
$('#winAgain').onclick = playAgain;

// ---------- setup ----------
const locked = f => f.unlock && found.size < f.unlock;
function drawFood(f, b) {
  const lock = !!locked(f);
  if (b.dataset.lock === String(lock)) return;
  b.dataset.lock = lock;
  b.innerHTML = lock
    ? `<img class="e" src="${spriteURL(f.id, true)}" alt="" width="16" height="16"><span>${T.locked}</span><span class="d">${f.unlock === 1 ? T.lockedHint1 : fill(T.lockedHint, { n: f.unlock })}</span>`
    : `<img class="e" src="${spriteURL(f.id)}" alt="" width="16" height="16"><span>${f.name}</span>${f.d ? `<span class="d">${f.d}</span>` : ''}`;
}
const foodBtns = FOODS.map(f => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'food';
  b.onclick = () => eat(f);
  drawFood(f, b);
  (f.unlock ? $('#snacks') : $('#foods')).append(b);
  return { f, b };
});
// Dinner serves everything (Just dinner) or only what was found in the house.
function startDinner(allowed) {
  mode = 'dinner';
  $('#house').hidden = true; $('#dinner').hidden = false;
  for (const { f, b } of foodBtns) b.hidden = !!allowed && !allowed.has(f.id);
  $('#snacksH').hidden = !foodBtns.some(o => o.f.unlock && !o.b.hidden);
  $('#fromHouse').hidden = !allowed; $('#fromHouse').textContent = T.fromHouse;
  wake(false, true); meal = 0;
  emptyBelly(); busy = false; calm(); face('normal'); update();
}
$('#pullBtn').onclick = pull;
$('#wakeBtn').onclick = () => wake(true);
$('#wakeBtn').textContent = T.wakeBtn;
$('#coma').addEventListener('click', () => wake(true));
$('#armOut').addEventListener('click', pull);
$('#startText').textContent = T.start;
$('#snacksH').textContent = T.snacks;
$('#startKeys').textContent = T.keys;
$('#dinnerBtn').onclick = () => { audio(); $('#startCover').hidden = true; startDinner(null); $('#foods button').focus(); };
const soundIcon = () => { $('#soundBtn').textContent = soundOn ? T.soundOn : T.soundOff; };
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set(SKEY, soundOn ? 'on' : 'off'); soundIcon(); };
soundIcon();
document.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]')) return;   // the Menu dialog
  if (!$('#collCover').hidden && e.key === 'Escape') return closeColl();
  if (mode === 'house' || mode === 'car' || mode === 'rest' || mode === 'wed' || mode === 'movie' || mode === 'date' || mode === 'job') return;   // the levels have their own keys
  if (!$('#startCover').hidden || !$('#winCover').hidden || !$('#collCover').hidden) return;
  if (e.key === 'f' || e.key === 'F') { if (coma) wake(true); else pull(); }
  else if (e.key === 'c' || e.key === 'C') showColl();
  else if (e.key.startsWith('Arrow') && mode === 'dinner') { e.preventDefault(); dinnerNav(e.key); }
  // Space with nothing picked pulls the finger (a controller's A, #56)
  else if (e.key === ' ' && mode === 'dinner' && (!document.activeElement || document.activeElement === document.body)) { e.preventDefault(); pull(); }
});
// The arrow keys (and a controller's cross pad, #56) move around the food
// tiles as a grid: left and right one tile, up and down a row, and up from
// the top row to Pull my finger (or Wake him up). Space or Enter eats.
function dinnerNav(key) {
  const act = [$('#pullBtn'), $('#wakeBtn')].find(b => !b.hidden);
  const foods = [...document.querySelectorAll('#dinner .food')].filter(b => b.offsetParent);
  if (!foods.length) return;
  const cols = Math.max(1, foods.filter(b => b.offsetTop === foods[0].offsetTop).length);
  const at = document.activeElement, i = foods.indexOf(at);
  let to;
  if (at === act) to = key === 'ArrowDown' ? foods[0] : act;
  else if (i < 0) to = foods[0];
  else if (key === 'ArrowRight') to = foods[Math.min(foods.length - 1, i + 1)];
  else if (key === 'ArrowLeft') to = foods[Math.max(0, i - 1)];
  else if (key === 'ArrowDown') to = foods[Math.min(foods.length - 1, i + cols)];
  else to = i < cols ? act : foods[i - cols];
  if (to) { to.focus(); to.scrollIntoView({ block: 'nearest' }); }
}
update();

// Hand-pixelled sprites for faces and hands (decided 20 Nov, the art pass after
// launch). They sit in the SVG as <image>s on whole game pixels (x and y are
// multiples of 3.125), so the point-sampling lands in the middle of each sprite
// pixel and they come out exact. One letter per pixel, '.' see-through; a
// sprite's own pal overrides SCENE_PAL (the family share one face shape with
// their own hair and skin).
const SCENE_PAL = { k: '#2a1a0e', h: '#22160e', H: '#4a3020', b: '#22160e', s: '#e2a978', S: '#c98a5e', r: '#e8907a',
  m: '#7a2e22', R: '#d8445a', w: '#ffffff' };
const SCENE_SPRITES = {"himNormal":{"rows":["....kkkkkkk.....","..kkhhHHhhhkkk..",".khhHHhhhhhhhhk.","khhHhhhhhhhhHhhk","khhhhhhhhhHhhhhk","khhhsshhhhhhhhhk","khhsssshhhhhhshk",".khssssssshhssk.",".kshhhsssshhhsk.","kSsskksssskkssSk","kSskssksskssksSk","kSsssssSSsssssSk",".ksssssSSsssssk.",".kssbbbbbbbbssk.",".ksbmwwwwwwmbsk.",".ksbbmmmmmmbbsk.",".kSsssbbbbsssSk.","..kSssbbbbssSk..","...kSsbbbbsSk...","....kSBBBBSk....",".....kkkkkk....."],"pal":{"h":"#5a3a22","H":"#8a5a32","b":"#7a4a2a","B":"#5a3420"}},"himEat":{"rows":["....kkkkkkk.....","..kkhhHHhhhkkk..",".khhHHhhhhhhhhk.","khhHhhhhhhhhHhhk","khhhhhhhhhHhhhhk","khhhsshhhhhhhhhk","khhsssshhhhhhshk",".khssssssshhssk.",".kshhhsssshhhsk.","kSssssssssssssSk","kSsskksssskkssSk","kSsssssSSsssssSk",".ksssssSSsssssk.",".kssbbbbbbbbssk.",".ksbsmmmmmmsbsk.",".ksssmRRRRmsssk.",".kSsssbbbbsssSk.","..kSssbbbbssSk..","...kSsbbbbsSk...","....kSBBBBSk....",".....kkkkkk....."],"pal":{"h":"#5a3a22","H":"#8a5a32","b":"#7a4a2a","B":"#5a3420"}},"himSmug":{"rows":["....kkkkkkk.....","..kkhhHHhhhkkk..",".khhHHhhhhhhhhk.","khhHhhhhhhhhHhhk","khhhhhhhhhHhhhhk","khhhsshhhhhhhhhk","khhsssshhhhhhshk",".khssssssshhssk.",".kshhhsssshhhsk.","kSsskksssskkssSk","kSssskssssksssSk","kSsssssSSsssssSk",".ksssssSSsssssk.",".kssbbbbbbbbssk.",".ksbssssmmmbbsk.",".ksssssbbsssssk.",".kSsssbbbbsssSk.","..kSssbbbbssSk..","...kSsbbbbsSk...","....kSBBBBSk....",".....kkkkkk....."],"pal":{"h":"#5a3a22","H":"#8a5a32","b":"#7a4a2a","B":"#5a3420"}},"himFrozen":{"rows":["....kkkkkkk.....","..kkhhHHhhhkkk..",".khhHHhhhhhhhhk.","khhHhhhhhhhhHhhk","khhhhhhhhhHhhhhk","khhhsshhhhhhhhhk","khhsssshhhhhhshk",".khssssssshhssk.",".kshhhsssshhhsk.","kSsswwsssswwssSk","kSsswksssswkssSk","kSsssssSSsssssSk",".ksssssSSsssssk.",".kssbbbbbbbbssk.",".ksbsssmmsssbsk.",".ksssssmmsssssk.",".kSsssbbbbsssSk.","..kSssbbbbssSk..","...kSsbbbbsSk...","....kSBBBBSk....",".....kkkkkk....."],"pal":{"h":"#5a3a22","H":"#8a5a32","b":"#7a4a2a","B":"#5a3420"}},"famA":{"rows":[".....kkkk.....",".....khhk.....","....kkkkkk....","..kkhhHHhhkk..",".khhHhhhhhhhk.",".khhsssssshhk.",".khsssssssshk.","kSssssssssssSk","kSssksssskssSk","kSssssSSssssSk",".krssssssssrk.",".kssmssssmssk.",".ksssmmmmsssk.","..kSssssssSk..","...kkkkkkkk..."],"pal":{"h":"#c9c9c9","H":"#ececec","s":"#f0c9a0","S":"#d9a880"}},"famAEw":{"rows":[".....kkkk.....",".....khhk.....","....kkkkkk....","..kkhhHHhhkk..",".khhHhhhhhhhk.",".khhsssssshhk.",".khsssssssshk.","kSssssssssssSk","kSskksssskksSk","kSssssSSssssSk",".krssssssssrk.",".ksssmmmmsssk.",".kssmssssmssk.","..kSssssssSk..","...kkkkkkkk..."],"pal":{"h":"#c9c9c9","H":"#ececec","s":"#f0c9a0","S":"#d9a880"}},"famB":{"rows":["....kkkkkk....","..kkhhHHhhkk..",".khhHhhhhhhhk.",".khhsssssshhk.",".khsssssssshk.","kSssssssssssSk","kSssksssskssSk","kSssssSSssssSk",".krshhhhhhsrk.",".kssmssssmssk.",".ksssmmmmsssk.","..kSsshhssSk..","...kkkkkkkk..."],"pal":{"h":"#3a2414","H":"#5a3a22","s":"#e2a978","S":"#c98a5e"}},"famBEw":{"rows":["....kkkkkk....","..kkhhHHhhkk..",".khhHhhhhhhhk.",".khhsssssshhk.",".khsssssssshk.","kSssssssssssSk","kSskksssskksSk","kSssssSSssssSk",".krshhhhhhsrk.",".ksssmmmmsssk.",".kssmssssmssk.","..kSsshhssSk..","...kkkkkkkk..."],"pal":{"h":"#3a2414","H":"#5a3a22","s":"#e2a978","S":"#c98a5e"}},"famC":{"rows":["....kkkkkk....","..kkhhHHhhkk..",".khhHhhhhhhhk.",".khhsssssshhk.",".khsssssssshk.","kSssssssssssSk","kSssksssskssSk","khssssSSsssshk",".khsssssssshk.",".khhmssssmhhk.",".khhhmmmmhhhk.","..khhhhhhhhk..","...kkkkkkkk..."],"pal":{"h":"#6b4226","H":"#8a5a32","s":"#d9a074","S":"#b8804e"}},"famCEw":{"rows":["....kkkkkk....","..kkhhHHhhkk..",".khhHhhhhhhhk.",".khhsssssshhk.",".khsssssssshk.","kSssssssssssSk","kSskksssskksSk","khssssSSsssshk",".khsssssssshk.",".khhhmmmmhhhk.",".khhmhhhhmhhk.","..khhhhhhhhk..","...kkkkkkkk..."],"pal":{"h":"#6b4226","H":"#8a5a32","s":"#d9a074","S":"#b8804e"}},"handL":{"rows":[".kkkk.","kssssk","kssssk","ksssSk","kssSSk","kSsSk.",".kkk.."]},"handR":{"rows":[".kkkk.","kssssk","kssssk","kSsssk","kSSssk",".kSsSk","..kkk."]},"handPoint":{"rows":[".kkkk.......","kssssk......","ksssskkkkkk.","kssssssssssk","kSsssskkkkk.","kSSssk......",".kkkk......."]},"cat":{"rows":[".k.....k..........","kpk...kpk.........","kcckkkkcck........","kcccccccck........","kcykccykck........","kcccccccck........","kccccpccck........",".kcccccck.........","..kccccccck.......",".kcccccccCck......",".kccccccccCck.....","kcccccccccCck..kk.","kcccccccccCck.kcck","kcckccccckcck..kck","kcckccccckccckkkck",".kkkkkkkkkkkkkkkk."],"pal":{"k":"#0e0e12","c":"#2b2b33","C":"#4a4a58","y":"#f5d34a","p":"#f27d92"}},"bread":{"rows":[".............k....k....","............kok..kok...","............kookkook...","............kopoopok...","...........koooowoook..","...........koooowoook..",".kk........koooowwnook.","kwok.kkkkkkkoooowwwwwnk","koookoooooooooowwwwwwwk",".kkoooooooooowwwwwwokk.",".kooooooooooowwwwkkk...",".kddooooooooowwwwk.....","..kdddooowwwwwwwwk.....","...kdddwwwwwwwwwk......","...kddkkkkkkkook.......","...kddk.....kook.......","...kffk.....kffk.......","....kk.......kk........"],"pal":{"o":"#e8913a","d":"#c46a1f","w":"#fff6ea","p":"#f4a6a0","n":"#1d1410","f":"#fff6ea"}},"crumb":{"rows":["..........k..k.....",".........kDkkDk....",".........kDDkDDk...",".........kDpDDpDk..","........kDDDsDDDk..",".k......kDDDhDsssk.","kDk.kkkkkDDDDssssnk","kDDkDDDDDDDDDssskk.",".kDDDDDDDDDDsssk...",".kDDDDDDDDDDssk....","..kDDDDDDDDssk.....","..ksDkkkkkssk......","..kssk...kssk......","...kk.....kk......."],"pal":{"D":"#2b2b33","p":"#f4a6a0","s":"#b8773a","h":"#ffffff","n":"#1d1410","k":"#0e0e12"}},"cat2":{"rows":[".k.....k..........","kpk...kpk.........","kcckkkkcck........","kcccccccck........","kcykccykck........","kccwwwwcck........","kccwwpwcck........",".kcwwwwck.........","..kcwwwccck.......",".kcwwwwccCck......",".kcwwwwcccCck.....","kcccccccccCck..kk.","kcccccccccCck.kcck","kwwkccccckwwk..kck","kwwkccccckwwwkkkck",".kkkkkkkkkkkkkkkk."],"pal":{"k":"#0e0e12","c":"#2b2b33","C":"#4a4a58","y":"#8fd06a","p":"#f27d92","w":"#f4f4f4"}},"kidA":{"rows":["...kkkkkk...",".kkhhHHhhkk.","khhHhhhhhhhk","khhssssssshk","kSssssssssSk","kSskssssksSk","kSssssssssSk",".krssssssrk.",".kssmmmmssk.","..kSssssSk..","...kkkkkk..."],"pal":{"h":"#e8c35a","H":"#f5dc8a","s":"#f0c9a0","S":"#d9a880"}},"kidAEw":{"rows":["...kkkkkk...",".kkhhHHhhkk.","khhHhhhhhhhk","khhssssssshk","kSssssssssSk","kSskksskksSk","kSssssssssSk",".krssmmssrk.",".ksmssssmsk.","..kSssssSk..","...kkkkkk..."],"pal":{"h":"#e8c35a","H":"#f5dc8a","s":"#f0c9a0","S":"#d9a880"}},"kidB":{"rows":["...kkkkkk...",".kkhhHHhhkk.","khhHhhhhhhhk","khhssssssshk","kSssssssssSk","kSskssssksSk","kSssssssssSk",".krssssssrk.",".kssmmmmssk.","..kSssssSk..","...kkkkkk..."],"pal":{"h":"#3a2414","H":"#5a3a22","s":"#c68a5e","S":"#a8703f"}},"kidBEw":{"rows":["...kkkkkk...",".kkhhHHhhkk.","khhHhhhhhhhk","khhssssssshk","kSssssssssSk","kSskksskksSk","kSssssssssSk",".krssmmssrk.",".ksmssssmsk.","..kSssssSk..","...kkkkkk..."],"pal":{"h":"#3a2414","H":"#5a3a22","s":"#c68a5e","S":"#a8703f"}}};
for (const im of document.querySelectorAll('#scene image[data-spr]')) {
  const sp = SCENE_SPRITES[im.dataset.spr], rows = sp.rows, pal = Object.assign({}, SCENE_PAL, sp.pal);
  const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
  im.setAttribute('href', c.toDataURL());
  im.setAttribute('width', c.width * 3.125); im.setAttribute('height', c.height * 3.125);
}

// ---------- 16-bit look (decided 20 Nov, Randi: "can we go 8bit? or really 16 bit?") ----------
// The scene is still drawn as one SVG, so the poses, reactions and clouds stay
// simple CSS and DOM. A copy of it, with each element's live (mid-animation)
// style written onto it, is drawn into a canvas at 4x the pixel size, then
// one sample from the middle of each 4x4 block is kept. Taking one sample
// rather than averaging the block is what gives hard pixel edges; averaging
// (just drawing it small) left blurry blended edges that read as a shrunk
// picture, not pixel art. The SVG stays underneath for clicks and screen
// readers, and shows on its own if this ever fails.
(() => {
  const W = 256, H = Math.round(W * 460 / 800), K = 4;
  const out = $('#px'), o = out.getContext('2d');
  out.width = W; out.height = H;
  const big = document.createElement('canvas'); big.width = W * K; big.height = H * K;
  const b = big.getContext('2d', { willReadFrequently: true });
  const frame = o.createImageData(W, H);
  const els = [svg, ...svg.querySelectorAll('*')];
  const PROPS = ['display', 'opacity', 'transform', 'transform-origin', 'transform-box', 'filter', 'image-rendering'];
  let loading = false;
  // Pixel-art outlines (decided 20 Nov, from Randi's Stardew-style references):
  // where two colours meet with a big jump in brightness, the darker side gets
  // a one-pixel edge in a dark shade of its own colour, not flat black. The
  // jump has to be big so the wall's light dither and soft shading don't get
  // outlined too.
  const lum = new Float32Array(W * H), JUMP = 34;
  function outline(d) {
    for (let i = 0; i < W * H; i++) lum[i] = d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11;
    const mark = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      for (const j of [x + 1 < W ? i + 1 : -1, y + 1 < H ? i + W : -1]) {
        if (j < 0 || Math.abs(lum[i] - lum[j]) < JUMP) continue;
        mark[lum[i] < lum[j] ? i : j] = 1;
      }
    }
    for (let i = 0; i < W * H; i++) if (mark[i]) { const t = i * 4; d[t] *= .42; d[t + 1] *= .38; d[t + 2] *= .36; }
  }
  function snap() {
    if (loading) return;
    loading = true;
    const copy = svg.cloneNode(true), all = [copy, ...copy.querySelectorAll('*')];
    const live = [svg, ...svg.querySelectorAll('*')];   // clouds come and go, so walk it fresh
    for (let i = 0; i < live.length; i++) {
      const cs = getComputedStyle(live[i]);
      all[i].setAttribute('style', PROPS.map(p => `${p}:${cs.getPropertyValue(p)}`).join(';'));
    }
    copy.setAttribute('width', W * K); copy.setAttribute('height', H * K);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
    const img = new Image();
    img.onload = () => {
      b.drawImage(img, 0, 0, W * K, H * K);
      const src = b.getImageData(0, 0, W * K, H * K).data, d = frame.data, h = K >> 1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const s = ((y * K + h) * W * K + x * K + h) * 4, t = (y * W + x) * 4;
        d[t] = src[s]; d[t + 1] = src[s + 1]; d[t + 2] = src[s + 2]; d[t + 3] = 255;
      }
      outline(d);
      o.putImageData(frame, 0, 0);
      URL.revokeObjectURL(url); loading = false;
    };
    img.onerror = () => { URL.revokeObjectURL(url); out.hidden = true; };
    img.src = url;
  }
  setInterval(() => { if (mode !== 'house') snap(); }, 66);   // about 15 frames a second, which suits the look
  snap();
})();

// Menu on the end cards (Randi, 22 Nov): the game is over, so it goes straight to
// the start card the way the top bar's Menu does, without asking first.
document.querySelectorAll('[data-menu]').forEach(b => { b.onclick = () => { location.href = location.pathname; }; });
