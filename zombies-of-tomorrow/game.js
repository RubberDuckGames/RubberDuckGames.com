// Zombies of Tomorrow, round one: bedroom to basement (first test build, 15 Nov),
// then the silo (26 Nov); the launch itself is launch.html.
// A small first-person raycaster. All art comes from art.js (make_game_art.py).
"use strict";

const W = 640, H = 400, VH = 336;          // view is 640 x 336, HUD strip below
const F = (W / 2) / 0.66;                   // pixels per world unit at distance 1
const HC = 0.8, HW = 1.5;                   // eye height and wall height, in world units (walls: 64 texels a unit)
const SPRU = 64;                            // sprite texels per world unit, same as the walls (people ~68 tall)
const cv = document.getElementById("screen");
const ctx = cv.getContext("2d");
const img = ctx.createImageData(W, H);
const buf = new Uint32Array(img.data.buffer);

// ---------- art ----------
const PAL = {};
for (const [k, hex] of Object.entries(ART.palette)) {
  const n = parseInt(hex.slice(1), 16);
  PAL[k] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function bake(rows) {
  const h = rows.length, w = rows[0].length, px = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) px.push(rows[y][x] === "." ? null : PAL[rows[y][x]]);
  return { w, h, px };                      // column-major for fast column drawing
}
const TEX = {}, SPR = {};
for (const [k, r] of Object.entries(ART.tex)) TEX[k] = bake(r);
for (const [k, r] of Object.entries(ART.spr)) SPR[k] = bake(r);

// ---------- sound (tiny beeps, no files) ----------
let actx = null;
function beep(freq, dur, type = "square", vol = 0.06, slide = 0) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, actx.currentTime + dur);
    g.gain.value = vol; g.gain.linearRampToValueAtTime(0, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* sound is optional */ }
}
const SFX = {
  buzz: () => { for (let i = 0; i < 4; i++) setTimeout(() => beep(110, 0.15, "sawtooth", 0.05), i * 220); },
  knock: () => { for (let i = 0; i < 3; i++) setTimeout(() => beep(90, 0.08, "triangle", 0.25), i * 260); },
  tick: () => { for (let i = 0; i < 6; i++) setTimeout(() => beep(2400, 0.02, "square", 0.03), i * 330); },
  zap: () => beep(900, 0.18, "square", 0.05, -700),
  pop: () => { beep(500, 0.1, "triangle", 0.08, 600); setTimeout(() => beep(1400, 0.12, "sine", 0.05), 80); },
  hurt: () => beep(160, 0.25, "sawtooth", 0.07, -80),
  static: () => { for (let i = 0; i < 8; i++) setTimeout(() => beep(200 + Math.random() * 1800, 0.05, "sawtooth", 0.025), i * 60); },
  beacon: () => { for (let i = 0; i < 3; i++) setTimeout(() => beep(660, 0.3, "sine", 0.06), i * 600); },
  ok: () => { beep(523, 0.1); setTimeout(() => beep(784, 0.15), 110); },
  whirr: () => beep(120, 0.6, "sawtooth", 0.04, 300),
  hum: () => beep(98, 1.8, "sine", 0.07, 6),                // the drifting people, all on one note
  crash: () => { for (let i = 0; i < 7; i++) setTimeout(() => beep(300 + Math.random() * 2500, 0.08, "square", 0.05), i * 45); },
  bark: () => { for (let i = 0; i < 2; i++) setTimeout(() => beep(720, 0.07, "square", 0.05, -260), i * 140); },
};

// ---------- state ----------
const S = {
  name: "", kid: "", flags: {}, guide: [], items: {},
  hearts: 3, hurtCool: 0, zapCool: 0, flash: 0, light: 1,
};
const flag = (k) => !!S.flags[k];
const set = (k) => { S.flags[k] = true; };
function addPage(title, text, image) {
  if (S.guide.some((p) => p.title === title)) return;
  S.guide.push({ title, text, image });
  hint("New page in your guide book (G)");
}

// Moving to another part of the same page (27 Nov): setting location.href to
// index.html#something from index.html#else only changes the hash, and the
// browser doesn't reload for that, so the Harvest Ring and Hometown exits
// left you standing where you were. Set the hash, then reload.
function goTo(hash) { location.hash = hash; location.reload(); }

// ---------- levels ----------
const WALLCHARS = {
  "#": "paper", p: "poster", w: "window", m: "starmap", k: "tile", K: "kwindow", d: "door",
  c: "concrete", P: "pipes", S: "steel", v: "vent", h: "chrome", o: "silo", n: "silo7",
  e: "hedge", g: "gate", D: "egodoor", B: "basedoor", G: "glass", V: "portrait",
  q: "hull", Q: "hullplain", M: "board", N: "heronote", U: "ladderup", O: "board2",
  F: "farm", C: "crops", L: "spoke", X: "farmwin", "%": "board3",
  // Hometown (27 Nov)
  a: "postoff", b: "barber", i: "dime", j: "bakery", r: "house", A: "tomorrow", E: "istoday", H: "hubladder",
  Y: "roundwin", J: "schoolfront", z: "schoolsign", x: "lockers", I: "room3sign", 8: "booth", 0: "gymsign",
  u: "blackboard", 1: "draw1", 2: "draw2", 3: "draw3", s: "gymwall", R: "rink", 4: "rink2", 7: "rinklaps",
  6: "rinkplain", T: "tapes", W: "switches",
  // the Lifeboat (27 Nov): the letters were nearly all taken, so these are
  // whatever was left
  f: "hotel", t: "tex", y: "buck", Z: "rowena", "@": "dockhatch", 5: "patches", l: "goldwall", 9: "longwin",
  $: "suit", "&": "labhatch", "*": "labsign", "!": "dont", "+": "labshelf", "<": "chalk1", "=": "chalk2",
  ">": "chalk3", "~": "labport", "/": "tubedoor", "?": "jartank", "^": "board4",
};
// A.R.P.F.'s clean path through the dust in Ego House: from the basement
// door along the hall and into the greenhouse
const EGO_PATH = new Set(["9,3", "10,3", "11,3", "12,3", ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => x + ",4")]);
const LEVELS = {
  home: {
    // Decided 26 Nov: the bedroom was 5 x 5 units (about 8 m, since a person is
    // about 1 unit tall) and Parker said it was too big for a kid's room. It is
    // 3 x 3 now, with a short hall to the kitchen; the kitchen is unchanged.
    map: [
      "#p#w###kkKkkkk",
      "m...###......k",
      "#............k",
      "#...###......k",
      "#######......k",
      "#######......k",
      "#######kkkdkkk",
    ],
    ceil: () => "plaster", floor: (x) => (x >= 7 ? "lino" : "boards"), light: 1,
    start: { x: 2.3, y: 2.6, a: -Math.PI / 2 },
  },
  basement: {
    map: [
      "hhhhhhhhhhhh",
      "c....c.....c",
      "c....c.....c",
      "c..........v",
      "c....c.....c",
      "cPPPPccPSPPc",
      "ccccccc...cc",
      "ccccccc...cc",
      "cccccccccccc",
    ],
    ceil: () => "cpipes", floor: () => "cfloor", light: 0.45,
    start: { x: 2.5, y: 1.6, a: Math.PI / 2 },
  },
  // Added 26 Nov: Ego House, as in the novel's ch 18. The gates and the drive
  // at the bottom, the chrome hall under fifty years of dust, and the
  // greenhouse to the right, where the Moon-Bloom grows.
  mansion: {
    map: [
      "hhhhhhhhhhhhGGGGGG",
      "hhhhhVhhhhhG.....G",
      "h.........hG.....G",
      "h................G",
      "B.........hG.....G",
      "h.........hG.....G",
      "hhhhhhDhhhhG.....G",
      "eeeee...eeeGGGGGGG",
      "eeeee...eeeeeeeeee",
      "eeeeeegeeeeeeeeeee",
      "eeeee...eeeeeeeeee",
      "eeeee...eeeeeeeeee",
      "eeeeeeeeeeeeeeeeee",
    ],
    ceil: (x, y) => (y >= 7 ? "sky" : x >= 11 ? "glassroof" : "decoceil"),
    floor: (x, y) => (y >= 7 ? "gravel" : x >= 11 ? "soil" : EGO_PATH.has(x + "," + y) ? "cleanmarble" : "dustmarble"),
    light: 1,
    start: { x: 6.5, y: 11.6, a: -Math.PI / 2 },
  },
  // Added 26 Nov: Ship Seven's hangar deck (novel ch 21). Round, like
  // everything on the ship: four capsules in a ring, the mission board and
  // Ivan's note on the north wall, the ladder up on the south.
  hangar: {
    map: [
      "QQQQqMNqQQQ",
      "QQQq...qQQQ",
      "Qq.......qQ",
      "Qq.......qQ",
      "q.........q",
      "q.........q",
      "q.........q",
      "Qq.......qQ",
      "Qq.......qQ",
      "QQQq...qQQQ",
      "QQQQqUqqQQQ",
    ],
    ceil: () => "hangarceil", floor: () => "hangarflr", light: 0.95,
    start: { x: 5.5, y: 8.6, a: -Math.PI / 2 },
  },
  // Added 26 Nov: a stretch of the Harvest Ring (novel ch 22). The spoke
  // ladder you came down is on the west wall, the crop reports on the north,
  // the potting bench at the far east end.
  harvest: {
    map: [
      "FFFFFFFFCCFFFFXFFFFFFF",
      "F....................F",
      "F....................F",
      "L....................F",
      "F....................F",
      "F....................F",
      "FFFFXFFFFFFFFFFFFFFFFF",
    ],
    ceil: () => "canopy", floor: () => "grate", light: 0.8,
    start: { x: 1.6, y: 3.5, a: 0 },
  },
  // Added 27 Nov: Hometown (novel ch 23). Main Street along the top, from
  // the hub ladder (west) to the big round window (east); the school below
  // it at the east end: the hall, Room 3, the recording room and the gym,
  // with the Roll-A-Rama behind the gym.
  hometown: {
    map: [
      "raaabbbiiijjjrrrAErrrrrrr",
      "H.......................Y",
      "r.......................Y",
      "r.......................Y",
      "rrrrrrrrrrrrJJJJz.zJJJJJr",
      "xxxxxxxxxxxxx...........x",
      "xxxxxxxxxxxxx...........Y",
      "xxxxxxxxxxxxxx.Ix.8x0.xxx",
      "xxxxxxxxxxxxu...x..x....s",
      "xxxxxxxxxxxxu...x..x....s",
      "xxxxxxxxxxxxu...xWTx....s",
      "xxxxxxxxxxxxx321xxxs....s",   // seen from inside Room 3, facing south, so the title runs 3-2-1 west to east
      "xxxxxxxxxxxxxxxxxxRRR.RRR",
      "xxxxxxxxxxxxxxxxx6......4",
      "xxxxxxxxxxxxxxxxx6......6",
      "xxxxxxxxxxxxxxxxx6......6",
      "xxxxxxxxxxxxxxxxx66676666",
    ],
    ceil: (x, y) => (y <= 3 ? "townceil" : y >= 13 ? (x === 20 && y === 14 ? "mirrorball" : "rinkceil") : "schoolceil"),
    floor: (x, y) => (y <= 3 ? "sidewalk" : y >= 13 ? "rinkflr" : y >= 8 && x >= 20 ? "gymflr" : y >= 8 && (x === 17 || x === 18) ? "carpet" : "schoolflr"),
    light: 0.95,
    start: { x: 1.6, y: 1.6, a: 0 },
  },
  // Added 27 Nov: the Lifeboat (novel ch 24). The hall of portraits from the
  // docking hatch (west) to the gold ballroom; the lab is the little room at
  // the east end, reached only through the tube (a card, there and back).
  lifeboat: {
    map: [
      "ffffffff999999$&*9l++++++",
      "fffffffl..........l+<=>++",
      "fffffffl..........l+....~",
      "fftfyfZl..........l+....+",
      "@.................l/....~",
      "f.................!+....+",
      "fff5fffl..........l+....+",
      "fffffffl..........l++?+++",
      "fffffffl..........l++++++",
      "fffffffl..........l++++++",
      "ffffffffllllllllllll+++++",
    ],
    ceil: (x, y) => (x <= 7 ? "hotelceil" : x >= 19 ? "labceil" : (x === 10 && y === 3) || (x === 13 && y === 6) || (x === 15 && y === 3) ? "chandelier" : "goldceil"),
    floor: (x, y) => (x <= 7 ? "anchorcarpet" : x >= 19 ? "labflr" : "parquet"),
    light: 0.75,
    start: { x: 1.5, y: 4.5, a: 0 },
  },
  // Added 26 Nov: the silo under the estate, round as a grid allows, with
  // Ship Seven standing in the middle. The ceiling is the dark of the shaft,
  // so the ship climbs up out of sight.
  silo: {
    map: [
      "ooooonooooo",
      "oooo...oooo",
      "oo.......oo",
      "oo.......oo",
      "o.........o",
      "o.........o",
      "o.........o",
      "oo.......oo",
      "oo.......oo",
      "oooo...oooo",
      "ooooonooooo",
    ],
    ceil: () => "silodark", floor: () => "siloflr", light: 0.85,
    start: { x: 5.5, y: 9.4, a: -Math.PI / 2 },
  },
};
let L = null, map = null, ents = [];
const P = { x: 0, y: 0, a: 0 };

function ent(o) { return Object.assign({ solid: true, r: 0.3, hidden: false }, o); }

function loadLevel(name) {
  L = LEVELS[name]; L.name = name;
  map = L.map.map((r) => r.split(""));
  P.x = L.start.x; P.y = L.start.y; P.a = L.start.a;
  S.light = L.light;
  ents = { home: homeEnts, mansion: mansionEnts, basement: basementEnts, silo: siloEnts, hangar: hangarEnts, harvest: harvestEnts, hometown: hometownEnts, lifeboat: lifeboatEnts }[name]();
}

// ---------- the story: home ----------
function homeEnts() {
  return [
    ent({ id: "bed", spr: "bed", x: 1.5, y: 3.4, label: "Go to bed", use: useBed }),
    ent({ id: "clock", spr: "clock", x: 2.4, y: 3.65, label: "Turn off the alarm", use: useClock }),
    ent({ id: "comic", spr: "deskcomic", x: 2.6, y: 1.35, label: "Look at the comic", use: () => {
      say([["", "An old comic, soft as cloth. ORION GOES TO SPACE. A corgi in a fishbowl helmet flies a round silver rocket, and a friendly robot with a lid for a hat helps him steer.", "art/orion-page-1.png"],
           ["", "In the middle, a page has been torn out. Inside the cover, in faded colored pencil: For my little star. Look up. Love, Papa.", "art/look-inscription.png"]],
          () => addPage("The Orion comic", "Your great-grandfather Ivan Pert drew this for his daughter Rosie in 1958. The robot has a lid for a hat. One page, just before the star map, is missing.", "art/orion-page-1.png"));
    } }),
    ent({ id: "paper", spr: "deskpaper", x: 1.4, y: 1.35, label: "Read the newspaper clipping", use: () => {
      say([["", "A yellow newspaper clipping, 1958: ANOTHER SCIENTIST LOST. Plane vanishes over the Bermuda Triangle. Ivan Pert, 38, an engineer, is the third scientist to go missing this year.", "art/look-clipping.png"]],
          () => addPage("Missing scientists", "1958: Ivan Pert's plane vanished over the Bermuda Triangle. He was the third scientist to go missing that year. Why so many?", "art/look-clipping.png"));
    } }),
    ent({ id: "photo", spr: "shelf", x: 3.6, y: 3.6, label: "Look at the photo", use: () => {
      say([["", "A black and white photo of your great-grandfather, Ivan Pert, grinning in front of a huge silver rocket in the desert.", "art/look-photo.png"], ["", "On the back, in the same handwriting as the comic: Bottling machine. Ha. Love, Papa.", "art/look-photo-back.png"], ["", "Nobody in the family can explain the rocket.", "art/look-photo.png"]],
          () => addPage("Ivan Pert and the rocket", "A photo of Ivan Pert next to a rocket nobody can explain. Where was this taken? Who built it?", "art/look-photo.png"));
    } }),
    ent({ id: "mirror", spr: "mirror", x: 3.65, y: 1.3, label: "Look in the mirror", use: useMirror }),
    ent({ id: "stove", spr: "stove", x: 12.4, y: 1.4 }),
    ent({ id: "mom", spr: "mom", x: 11.3, y: 2.0, label: "Talk to Mom", use: useMom }),
    ent({ id: "table", spr: "table", x: 9.5, y: 4.0, r: 0.45, label: () => (flag("human") ? "Open the lock box" : "Look at the table"), use: useBox }),
    ent({ id: "radio", spr: "radio", x: 7.5, y: 1.4 }),
    ent({ id: "human", spr: "human", x: 10.5, y: 5.45, hidden: true, label: "Talk to the lawyer", use: useHuman }),
  ];
}

function useClock() {
  if (!flag("alarm")) {
    set("alarm"); SFX.ok();
    say([["", "Click. Quiet at last. Your room is full of your own drawings: spaceships, star maps, a desk covered in half-built gadgets."],
         ["", "Downstairs, someone is making pancakes."]]);
  } else if (flag("box") && !flag("night")) {
    useBed();
  } else {
    say([["", "The radio clock. It's been picking up a weird signal between stations all week."]]);
  }
}

function useMirror() {
  if (flag("chosen")) { say([["", `There you are, ${S.name}. Hair: hopeless. Ready for the day.`]]); return; }
  panel(`<h2>Who are you?</h2>
    <p>You're Ivan Pert's great-grandchild. You're fifteen.</p>
    <div class="row" style="justify-content:flex-start"><button id="pick-boy">Boy</button><button id="pick-girl">Girl</button></div>
    <p>Your name:</p><input id="pick-name" maxlength="16" placeholder="Type your name">
    <div class="row"><button id="pick-done">Done</button></div>`);
  let kid = "";
  const pick = (k) => { kid = k; document.getElementById("pick-boy").className = k === "boy" ? "" : "alt"; document.getElementById("pick-girl").className = k === "girl" ? "" : "alt"; };
  document.getElementById("pick-boy").onclick = () => pick("boy");
  document.getElementById("pick-girl").onclick = () => pick("girl");
  pick("boy");
  document.getElementById("pick-name").focus();
  document.getElementById("pick-done").onclick = () => {
    const n = document.getElementById("pick-name").value.trim();
    if (!n) { document.getElementById("pick-name").focus(); return; }
    S.name = n; S.kid = kid; set("chosen"); closePanel(); SFX.ok();
    say([["", `${S.name}. That's you.`]]);
  };
}

function useMom() {
  if (!flag("chosen")) { say([["Mom", "Morning! Did you even look in a mirror? Go fix that hair before breakfast."]]); return; }
  if (!flag("story")) {
    const kidword = S.kid === "girl" ? "girl" : "boy";
    say([
      ["Mom", `Morning, ${S.name}. Pancakes are almost ready. Sit.`],
      ["Mom", "You've been reading that old comic again, haven't you? Your great-grandpa Ivan drew it for Grandma Rosie."],
      ["Mom", "He died when his plane went down over the Bermuda Triangle. 1958. They never found a thing."],
      ["Mom", "Grandma always said it made no sense. He hated flying. Didn't trust the science of it. Wouldn't even get on a plane for a wedding."],
      ["Mom", "But he drew rockets on every napkin in the house. Funny, isn't it?"],
      ["", "The kitchen radio crackles. Between the stations, through the static, a voice: ...anyone... Hometown... please..."],
      ["Mom", "That radio's been doing that all week. I'll get a new one."],
      ["", "Knock. Knock. Knock."],
      ["Mom", `Who on earth knocks at this hour? Get the door, would you, ${kidword}?`],
    ], () => { set("story"); SFX.knock(); hint("Someone is at the front door"); }, (i) => { if (i === 5) SFX.static(); if (i === 7) SFX.knock(); });
  } else if (!flag("human")) {
    say([["Mom", "The door! Go on."]]);
  } else if (!flag("box")) {
    say([["Mom", "A lawyer? For us? Well, don't just stare at it. Open it."]]);
  } else {
    say([["Mom", "Keys, letters, blueprints... I don't know what to think. Let's sleep on it. Bed, mister. Or miss. You know what I mean."]]);
  }
}

function useDoor() {
  if (!flag("story")) { say([["", "The front door. Nobody's there. Yet."]]); return; }
  if (flag("human")) { say([["", "The street is empty. The lawyer is gone. You can still hear the ticking, very faintly. Or maybe you can't."]]); return; }
  const hu = ents.find((e) => e.id === "human");
  hu.hidden = false; SFX.tick();
  useHuman();
}

function useHuman() {
  const greatword = S.kid === "girl" ? "great-granddaughter" : "great-grandson";
  say([
    ["", "A very old man in an old-fashioned gray suit, holding a briefcase. He is far too polite. When it's quiet, you can hear him ticking."],
    ["Mr. Hu Man", `Good morning. You must be ${S.name}. My name is Hu Man. I am the lawyer for my client, Mr. Vladimir Ego, who has not been heard from in twenty years.`],
    ["Mr. Hu Man", `Your great-grandfather, Ivan Pert, was Mr. Ego's favorite inventor. Under the terms of the will, this now belongs to Ivan Pert's ${greatword}.`],
    ["", "He walks past you into the kitchen, sets a heavy lock box on the table, and walks back out."],
    ["Mr. Hu Man", "I am not permitted to answer questions. Good day. Do look after it."],
    ["", "He is gone before anyone can ask anything. Tick. Tick. Tick."],
  ], () => {
    set("human");
    ents = ents.filter((e) => e.id !== "human");
    const t = ents.find((e) => e.id === "table"); t.spr = "tablebox";
    hint("Open the lock box on the kitchen table");
  }, (i) => { if (i === 5) SFX.tick(); });
}

function useBox() {
  if (!flag("human")) { say([["", "Pancakes. Still warm."]]); return; }
  if (flag("box")) { say([["", "The lock box is empty now. Everything is in your guide book."]]); return; }
  say([
    ["", "Inside the lock box, packed like it's 1958:"],
    ["", "Old blueprints and star maps of stations nobody has ever heard of. Three great wheels, turning around a moon of Jupiter.", "art/look-blueprints.png"],
    ["", "A stack of typed letters from Ivan Pert, dated 1969 to 1987. The one on top ends: Wherever you are, Rosie, look up.", "art/look-letters.png"],
    ["", "A brass key with a little rocket on it. The tag says: EGO HOUSE. FRONT GATE.", "art/look-key.png"],
    ["", "And pages about a fusion engine, with half the words blacked out: [REDACTED].", "art/look-redacted.png"],
  ], () => {
    set("box"); S.items.key = true; SFX.ok();
    addPage("The blueprints", "Plans for three spinning stations around Europa, a moon of Jupiter, stamped COLONY OF TOMORROW, 1964. Every station has more to find than the plans show.", "art/look-blueprints.png");
    addPage("Ivan's letters", "Letters from Ivan Pert, typed out by someone, dated 1969 to 1987, years after he died. The one on top ends: Wherever you are, Rosie, look up.", "art/look-letters.png");
    addPage("The brass key", "A brass key with a rocket on it. Tag: EGO HOUSE. FRONT GATE.", "art/look-key.png");
    addPage("[REDACTED]", "Notes on a fusion engine. Half the words are blacked out. Somebody didn't want this read.", "art/look-redacted.png");
    hint("It's been a long day. Go to bed.");
  });
}

function useBed() {
  if (!flag("box")) { say([["", "Your bed. Unmade, of course. It's morning, not bedtime."]]); return; }
  if (flag("night")) return;
  set("night");
  card(`<p>That night...</p>`, null, 1500, () => {
    S.light = 0.35; SFX.beacon();
    say([
      ["", "BZZT. The radio clock wakes you. It's tuned to that strange signal again, and this time it's clear."],
      ["", "Beep. Beep. Beep. An emergency beacon. And under it, a recorded voice, very far away:"],
      ["A voice", "...this is the Colony of Tomorrow... the stations are moving... if anyone can hear this... please..."],
      ["", "You turn on the lamp and unroll the map from the lock box. The station the voice named is on it."],
    ], () => {
      addPage("The first message", "An emergency beacon, and a voice from the Colony of Tomorrow: the stations are moving. The station is on the map from the lock box.");
      card(`<p>The next morning, you take the brass key to the address on the tag.</p>
            <p>A long road with nothing else on it. At the end: Ego House.</p>`, "Go", 0, enterMansion);
    }, (i) => { if (i === 1) SFX.beacon(); });
  });
}

// ---------- the story: the basement ----------
function basementEnts() {
  return [
    ent({ id: "lever", spr: "leveroff", x: 4.6, y: 1.2, label: "Pull the lever", use: () => {
      if (flag("power")) { say([["", "The power is on."]]); return; }
      set("power"); S.light = 1; SFX.whirr();
      ents.find((e) => e.id === "lever").spr = "leveron";
      ents.find((e) => e.id === "pinball").spr = "pinon";
      say([["", "Clunk. The lights flicker, buzz, and come on. Chrome everywhere, and dust on all of it."]], () => hint("Something in the next room is covered in dust"));
    } }),
    ent({ id: "bench", spr: "bench", x: 1.5, y: 4.5, r: 0.45, label: "Open the workbench drawer", use: useBench }),
    ent({ id: "arpf", spr: "arpfoff", x: 8.5, y: 2.3, r: 0.4, label: "Switch on the robot", use: useArpf }),
    ent({ id: "terminal", spr: "terminal", x: 6.6, y: 4.4, label: "Use the terminal", use: useTerminal }),
    ent({ id: "pinball", spr: "pinoff", x: 1.45, y: 1.4, r: 0.45, label: "The pinball machine", use: usePinball }),
  ];
}

function useArpf() {
  if (!flag("power")) { say([["", "A big gray trash can with treads, a toaster strapped to its side, and a whisk stuck in its lid. It's dead. Maybe the power is off."]]); return; }
  if (!flag("arpf")) {
    const a = ents.find((e) => e.id === "arpf"); a.spr = "arpfon"; SFX.whirr();
    say([
      ["", "You find a switch under the lid. Whirr. Clunk. The lid lifts one inch, and in the gap, an eye begins to glow."],
      ["A.R.P.F.", "Oh! A visitor! Nobody has visited in... *click* ...a very long time."],
      ["A.R.P.F.", "Automatic Roaming Poop Finder, at your service. I find poop. I also play checkers. I am very good at checkers."],
      ["A.R.P.F.", `Mr. Hu Man said someone would come with the key. He said to be nice. I am being nice. Hello, ${S.name}.`],
      ["A.R.P.F.", "One day, when I have enough parts, I will rule the WORLD! Every street! Every lawn! Every single... *BZZT*"],
      ["A.R.P.F.", "...*click*. Sorry. What were we talking about?"],
      ["A.R.P.F.", "Oh! The silo door, there. It's locked. Ivan Pert left a trick for it on the terminal. Red light means locked."],
    ], () => { set("arpf"); hint("Use the terminal to unlock the silo door"); }, (i) => { if (i === 4) SFX.static(); });
    return;
  }
  if (!flag("wired")) say([["A.R.P.F.", "The terminal! Ivan always taped a note to the screen. He never could remember anything."]]);
  else if (!flag("won")) say([["A.R.P.F.", "Ivan's ray gun! Workbench drawer! The thing is LOOKING at you!"]]);
  else say([["A.R.P.F.", "Goo and stars! You did it! Ivan Pert would be proud. The silo is through that door. Mind the stairs."]]);
}

function useTerminal() {
  if (!flag("power")) { say([["", "A dark screen. No power."]]); return; }
  if (!flag("arpf")) { say([["", "The terminal hums. Taped to the screen is a note. Maybe the robot in the corner knows what it's for."]]); return; }
  if (flag("wired")) { say([["", "DOOR: OPEN. The light is green."]]); return; }
  const wires = [["Red", "#c8423b"], ["Teal", "#3f9c96"], ["Mustard", "#e8b33c"]];
  const plugs = ["Star", "Rocket", "Moon"];
  const answer = { Red: "Rocket", Teal: "Moon", Mustard: "Star" };
  panel(`<h2>Rewire the silo door</h2>
    <p>A note taped to the screen, in Ivan Pert's tidy capitals:<br><b>RED TO THE ROCKET. TEAL TO THE MOON. MUSTARD TO THE STAR.</b></p>
    <img class="note" src="art/look-note.png" alt="A yellow note taped to the screen: red to the rocket, teal to the moon, mustard to the star.">
    <p>Pick a wire, then the plug it goes to.</p>
    <div class="wires">${wires.map(([n, c]) => `<button data-w="${n}" style="background:${c};color:#1b1a2e">${n} wire</button>`).join("")
      .split("</button>").filter(Boolean).map((b, i) => b + `</button><button data-p="${plugs[i]}" class="alt">${plugs[i]} plug</button>`).join("")}</div>
    <p id="wire-msg">&nbsp;</p>
    <div class="row"><button id="wire-close" class="alt">Close</button></div>`);
  let picked = null, done = 0;
  const msg = document.getElementById("wire-msg");
  document.querySelectorAll("[data-w]").forEach((b) => b.onclick = () => {
    if (b.classList.contains("done")) return;
    document.querySelectorAll("[data-w]").forEach((x) => x.classList.remove("picked"));
    b.classList.add("picked"); picked = b; beep(400, 0.05);
  });
  document.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => {
    if (!picked || b.classList.contains("done")) { msg.textContent = "Pick a wire first."; return; }
    if (answer[picked.dataset.w] === b.dataset.p) {
      picked.classList.remove("picked"); picked.classList.add("done"); b.classList.add("done"); picked = null; done++;
      msg.textContent = done < 3 ? "Click. That one fits." : "All three! DOOR: OPEN."; SFX.ok();
      if (done === 3) setTimeout(() => { closePanel(); doorOpens(); }, 700);
    } else { msg.textContent = "Bzzt. Wrong plug. Check the note."; SFX.hurt(); }
  });
  document.getElementById("wire-close").onclick = closePanel;
}

function doorOpens() {
  set("wired");
  map[5][8] = ".";
  say([
    ["", "Ka-chunk. The silo door's light turns green, and it slides open."],
    ["", "Then the vent in the wall rattles. Something is squeezing through the grate. Something that crawled out of the greenhouse."],
    ["A.R.P.F.", "Uh-oh. That is NOT poop. Ivan's ray gun is in the workbench drawer! Quick!"],
  ], () => {
    ents.push(sprout(10.4, 3.5));
    hint("Get the ray gun from the workbench drawer");
  }, (i) => { if (i === 1) SFX.static(); });
}

function useBench() {
  if (!flag("wired")) { say([["", "Ivan Pert's old workbench. Tools, wire, a red toaster with no insides. The drawer is stuck shut."]]); return; }
  if (S.items.gun) { say([["", "The drawer is empty now."]]); return; }
  S.items.gun = true; SFX.ok(); set("armed"); document.getElementById("zapBtn").hidden = false;
  say([["", "The drawer sticks, then flies open. Inside: a ray gun, red and silver, with IVAN'S, HANDS OFF scratched on the side.", "art/look-raygun.png"],
       ["A.R.P.F.", TOUCHY ? "Press Zap to zap! Don't let it touch you!" : "Press F to zap! Don't let it touch you!"]],
      () => {
        ents.push(sprout(10.5, 1.5), sprout(10.5, 4.5));
        hint("Zap them with F. They pop into goo and stars.");
        addPage("Ivan's ray gun", "Found in Ivan Pert's workbench drawer. Scratched on the side: IVAN'S, HANDS OFF.", "art/look-raygun.png");
      });
}

function sprout(x, y) {
  return ent({ id: "sprout", spr: "sprout0", x, y, r: 0.3, hp: 2, enemy: true, t: Math.random() });
}

function checkWin() {
  if (L.name === "harvest") {
    if (!flag("hsprouts") || flag("hcleared") || ents.some((e) => e.enemy && !e.dead)) return;
    set("hcleared");
    say([["A.R.P.F.", "Goo and stars! Five for five! *scoop* *scoop* I am also a mop now."]], () => hint("Read the crop reports on the wall"));
    return;
  }
  if (L.name !== "basement" || flag("won") || !flag("armed")) return;
  if (ents.some((e) => e.enemy && !e.dead)) return;
  set("won");
  addPage("The sprouts", "Something that crawled out of Ego's greenhouse: a Moon-Bloom bud on root legs, with one flower that watches you. Two zaps and it pops into goo and stars.");
  say([["A.R.P.F.", "Goo and stars! You did it! Ivan Pert would be proud."],
       ["A.R.P.F.", "The silo is through that door. I'll... I'll come too. If that's all right. I'm very good at checkers."]],
      () => hint("Go through the silo door"));
}

// Added 27 Nov, the kids' idea: a pinball machine in the basement that opens
// the real one (rubberduckgames.com/pinball/, which has a Zombies of Tomorrow
// table). It opens in a new tab, so the story is still here when you come
// back: saves aren't built yet, and leaving this page would lose your place.
function usePinball() {
  if (!flag("power")) { say([["", "A pinball machine, under fifty years of dust. ZOMBIES OF TOMORROW, it says on the back-glass, very faintly. It's dark. The power must be off."]]); return; }
  const lines = [["", "The pinball machine is lit up and ringing, all by itself. ZOMBIES OF TOMORROW. A corgi in a fishbowl helmet on the back-glass, and a round silver rocket."]];
  if (flag("arpf")) lines.push(["A.R.P.F.", "Mr. Ego never let anybody play it. It's been waiting since 1975. One game wouldn't hurt."]);
  say(lines, () => {
    panel(`<h2>Pinball</h2><p>Play pinball in a new tab. Pick the Zombies of Tomorrow table. This game stays right here.</p>
      <div class="row"><button id="pin-no" class="alt">Not now</button><button id="pin-go">Play pinball</button></div>`);
    document.getElementById("pin-no").onclick = closePanel;
    document.getElementById("pin-go").onclick = () => { closePanel(); window.open("../pinball/", "_blank"); };
  });
}

// ---------- the story: Ego House (added 26 Nov, as in the novel's ch 18) ----------
function mansionEnts() {
  return [
    ent({ id: "sofa", spr: "sofa", x: 3.0, y: 2.55, r: 0.6 }),
    ent({ id: "checkers", spr: "checkers", x: 7.5, y: 5.2, r: 0.35, label: "Look at the checkers game", use: () => say([
      ["", "A game of checkers on a little chrome table, left halfway. Red is winning."],
      ["", "The board has been dusted. Nothing else in the house has. Somebody still plays this game."]]) }),
    ent({ id: "lamp", spr: "decolamp", x: 9.4, y: 2.3, r: 0.2 }),
    ent({ id: "bloom", spr: "bloom0", x: 14.5, y: 3.7, r: 0.8, label: "Look at the Moon-Bloom", use: () => say([
      ["", "Every flower is turned toward you. When you step to the left, they follow. When you step to the right, they follow.", "art/look-flower.png"],
      ["", "You don't want to get any closer. You really, really don't."]]) }),
    ent({ id: "keyhook", spr: "keyhook", x: 16.55, y: 5.45, r: 0.2, label: () => (S.items.basementKey ? "The empty hook" : "Take the key off the hook"), use: useKeyHook }),
  ];
}

function enterMansion() {
  loadLevel("mansion");
  say([["", "Ego House. Two great curls of black iron with a rocket worked into the middle of each, rusted to the color of cinnamon. Beyond them, a drive between dead hedges."],
       ["", "Up on the rise, the house: chrome, and round, and shaped like a spaceship from 1955. The gates are locked."]],
      () => hint("Use the brass key on the gate (walk up to it, press E)"));
}

function useGate() {
  map[9][6] = "."; SFX.whirr();
  say([["", "The brass key turns, stiff and squealing, and the gates groan open."]],
      () => addPage("Ego House", "Vladimir Ego's mansion, at the end of a long road with nothing else on it. Rocket gates, a chrome house like a 1955 spaceship, and nobody home for fifty years.", "art/look-key.png"));
}

function useFrontDoor() {
  map[6][6] = "."; SFX.ok();
  say([["", "The front door is a round chrome hatch with a porthole in it, like the door of a rocket. It isn't locked. It swings open without a sound, as if somebody oils it."]]);
}

function usePortrait() {
  say([["", "A portrait, as tall as the wall, in a gold frame. Slicked-back silver hair, a silver goatee, a teal velvet smoking jacket and an orange ascot. A small, knowing smile.", "art/look-portrait.png"],
       ["", "The brass plate says THE FOUNDER. His eyes are looking off to one side, at something far away. Or at the greenhouse door.", "art/look-portrait.png"]],
      () => addPage("Vladimir Ego", "The Founder. His portrait fills the end wall of the hall at Ego House: silver hair, silver goatee, velvet jacket, ascot, and a small knowing smile.", "art/look-portrait.png"));
}

function useBasementDoor() {
  if (!S.items.basementKey) {
    say([["", "A steel door: BASEMENT. Locked. Taped to it, a card in tiny, neat handwriting:"],
         ["", "The basement key is on the hook in the greenhouse. Please mind the flowers. H.M."]],
        () => hint("Find the key in the greenhouse"));
    return;
  }
  say([["", "The key turns. Cold air comes up from below, and the smell of dust and oil. Stairs go down into the dark."]], () => {
    loadLevel("basement"); hint("Find a way to turn the power on");
  });
}

function useKeyHook() {
  if (S.items.basementKey) { say([["", "The hook is empty. The flowers are still watching it."]]); return; }
  S.items.basementKey = true; SFX.ok();
  ents.find((e) => e.id === "keyhook").spr = "keyhook0";
  say([["", "You lift the key off the hook. Behind you, very softly, leaves rustle."],
       ["", "When you turn around, nothing has moved. But the flowers are all still looking at you."]],
      () => hint("Back to the basement door, at the end of the hall"));
}

function watchFlowers() {
  set("watched");
  const bloom = ents.find((e) => e.id === "bloom");
  say([
    ["", "The greenhouse has gone wild. Roots have cracked the floor. The glass is furred with silver-blue leaves, pressed against it from the inside."],
    ["", "In the middle, taller than the house should allow: a tower of see-through leaves, silver and blue, glowing like a lamp. The Moon-Bloom."],
    ["", "Pale round flowers hang all over it, faces to the floor, like lamps on a string."],
    ["", "Then, all at once, every flower turns. To look at you.", "art/look-flower.png"],
  ], () => {
    addPage("The Moon-Bloom", "In the greenhouse at Ego House: a tower of see-through silver-blue leaves, glowing, hung with pale flowers. On Earth! And when you walked in, every flower turned to look at you.", "art/look-flower.png");
    hint("A key hangs on a hook by the far glass");
  }, (i) => { if (i === 3) { bloom.spr = "bloom1"; SFX.static(); } });
}

// ---------- the story: the hangar (added 26 Nov, as in the novel's ch 21) ----------
// You reach it from the launch (launch.html sends you to index.html#hangar),
// and the flight brings you back to it.
function hangarEnts() {
  const tag = (L) => () => say([["", `A tag tied to the ladder with string, in tiny, neat handwriting: CAPSULE ${L}. Fuel checked. Seals checked. Ready. H.M.`]]);
  return [
    ent({ id: "capsA", spr: "capsA", x: 4.0, y: 4.0, r: 0.55, label: "Climb into Capsule A", use: useCapsuleA }),
    ent({ id: "capsB", spr: "capsB", x: 7.0, y: 4.0, r: 0.55, label: "Look at Capsule B", use: tag("B") }),
    ent({ id: "capsC", spr: "capsC", x: 4.0, y: 6.8, r: 0.55, label: "Look at Capsule C", use: tag("C") }),
    ent({ id: "capsD", spr: "capsD", x: 7.0, y: 6.8, r: 0.55, label: "Look at Capsule D", use: tag("D") }),
    ent({ id: "arpf", spr: "arpfon", x: 5.5, y: 5.4, r: 0.4, label: "Talk to A.R.P.F.", use: () => say(
      flag("board") ? [["A.R.P.F.", "Capsule A. It's the one with the tag. It's always the one with the tag."]]
                    : [["A.R.P.F.", "The board! Ivan's board! Go and look. I am not crying. Trash cans do not cry."]]) }),
    ent({ id: "radio", spr: "radio", x: 8.9, y: 5.5, r: 0.25, label: "Call home on the radio", use: useHangarRadio }),
  ];
}

function enterHangar(back) {
  loadLevel("hangar");
  try { S.name = sessionStorage.getItem("zot-name") || S.name; } catch (e) { /* fine without it */ }
  if (back === "harvest") {                                         // home from the Harvest Ring
    set("board"); set("harvestdone"); map[0][5] = "O";
    say([["", "That night, in the hangar, the light beside HARVEST RING on the mission board turns from green to white. Done."],
         ["", "And beside HOMETOWN, a light you hadn't noticed blinks on. Green."],
         ["A.R.P.F.", "Hometown next! The school, the pool, the roller rink. And the corgis. Hundreds of corgis."]],
        () => hint("Capsule A goes to Hometown whenever you're ready"));
    return;
  }
  if (back === "ready") {                                           // back from a flight toward Hometown
    set("board"); set("harvestdone"); map[0][5] = "O";
    say([["", "Capsule A clamps back into its place in the ring. The light beside HOMETOWN is still green."]], () => hint("Capsule A goes to Hometown whenever you're ready"));
    return;
  }
  if (back === "hometown" || back === "question") {                  // home from Hometown (added 27 Nov)
    set("board"); set("harvestdone"); set("hometowndone"); map[0][5] = "%";
    ents.push(ent({ id: "fluffy", spr: "fluffy", x: 6.4, y: 6.2, r: 0.3, solid: false, label: "The fluffy corgi", use: () => say([
      ["", "The fluffy corgi has found the warmest spot in the hangar and is asleep on it, snoring. It came home with you. Nobody told it not to."]]) }));
    if (back === "question") {                                      // back from a flight toward the Lifeboat
      set("lifeboatknown");
      say([["", "Capsule A clamps back into its place in the ring. Out past Hometown, at the end of the long line, the Lifeboat is still tumbling."]], () => hint("Capsule A goes back out whenever you're ready"));
      return;
    }
    say([["", "That night, the light beside HOMETOWN on the mission board turns white."],
         ["", "And down in the blank rows, beside the penciled question mark, a light blinks on. Green. Steady. No name at all."],
         ["You", "It's not on the plans. The bunker. I looked. It's not on any of the blueprints from the box."],
         ["", "A.R.P.F.'s radio plays a game show buzzer. Wrong answer. Then a news announcer from long ago, very grave: \"...and the senator declined to comment...\""],
         ["You", "You know something."],
         ["", "A.R.P.F.'s lid drops an inch. Its visor looks at the ceiling."]],
        () => hint("Ask home about the question mark, on the radio"));
    return;
  }
  if (back === "lifeboat") {                                        // home from the Lifeboat (added 27 Nov)
    set("board"); set("harvestdone"); set("hometowndone"); set("lifeboatknown"); set("lifeboatdone"); map[0][5] = "%";
    ents.push(ent({ id: "fluffy", spr: "fluffy", x: 5.0, y: 2.4, r: 0.3, solid: false, label: "The fluffy corgi", use: () => say([
      ["", "The fluffy corgi has decided Dolores is its person now, as well as you. It lies flat on the cold floor between you, chin on its paws, and yawns enormously."]]) }));
    ents.push(ent({ id: "dolores", spr: "dolores", x: 6.2, y: 2.3, r: 0.3, label: "Talk to Dolores", use: useDoloresHangar }));
    ents.push(ent({ id: "tomcrate", spr: "tomcrate", x: 2.2, y: 5.6, r: 0.4, label: "The tomatoes", use: () => say([["", "A whole crate of tomatoes from the Lifeboat, and three pots of seedlings. Something green, for where you're going."]]) }));
    ents.push(ent({ id: "seedlings", spr: "seedlings", x: 2.3, y: 4.6, r: 0.3, solid: false }));
    say([["", "On Ship Seven, Dolores stands in the hangar for a long time without moving, looking at everything. The capsules. The tags in Hu Man's tiny writing. And then the mission board."],
         ["", "She walks up to it slowly and puts one finger on the pencil."],
         ["Dolores", "That's his writing."],
         ["You", "He knew about the Lifeboat. Before anybody went up. He drew it for them."],
         ["Dolores", "He knew about everything. He told me once, on the telephone, near the end: if anybody ever came, tell them the dogs know. I asked him what it meant. He said he hoped I'd never need to find out."],
         ["", "The fluffy corgi looks back at you. Then it yawns, enormously."],
         ["", "Dolores takes a pencil out of one of her sweater pockets. You nod. On the blank row, very small, in her own careful hand, she writes THE LIFEBOAT."],
         ["", "The light beside it turns white."]],
        () => hint("Let Dolores use the radio"), (i) => { if (i === 7) { map[0][5] = "^"; SFX.ok(); } });
    return;
  }
  if (back) {                                                       // home from the flight
    set("board");
    say([["", "Capsule A clamps back into its place in the ring with a clunk you feel in your teeth. Home. Well. The ship."],
         ["A.R.P.F.", "The Harvest Ring is still waiting for us. Hazel's book is in there somewhere. Whenever you're ready."]],
        () => hint("Capsule A goes back out whenever you're ready"));
    return;
  }
  card(`<p>Ship Seven, in orbit, with the Earth behind you.</p>
        <p>A.R.P.F. sets the course. One g, all the way: four days to the asteroid belt,
        with a flip in the middle so you can slow down.</p>
        <p>Weird Kid Weekly, Issue 388. You remember the drawing.</p>`, "Climb down to the hangar", 0, () => {
    say([["", "At the bottom of the ladder, a round room with a striped floor, like a parking lot. HANGAR DECK."],
         ["", "And four little ships, round and silver, each one about the size of a car standing on its end. A. B. C. D."],
         ["A.R.P.F.", "Capsules! The big ship is too big to go in between the wheels. The little ships go in, and come back. That was the plan."],
         ["", "It's still the plan. It's just going to be you."]], () => hint("Look at the mission board on the far wall"));
  });
}

function useBoard() {
  set("board");
  say([
    ["", "A big black panel the size of a door: MISSION BOARD. The names of places, in white paint, each with a little round light.", "art/look-board.png"],
    ["", "FOUNDER'S STATION. HOMETOWN. HARVEST RING. And blank rows under them, as if someone left room for places not built yet.", "art/look-board.png"],
    ["", "In one of the blank rows, in pencil, very small, in the handwriting from the comic: a question mark.", "art/look-board.png"],
    ["", "Then one of the lights blinks on. Green. Steady. Beside HARVEST RING.", "art/look-board.png"],
  ], () => {
    SFX.ok();
    addPage("The mission board", "On Ship Seven's hangar deck: FOUNDER'S STATION, HOMETOWN, HARVEST RING, and blank rows, one with a penciled question mark. HARVEST RING's light is green: go there first.", "art/look-board.png");
    hint("Read the note beside the board, then take Capsule A");
  });
}

function useHeroNote() {
  say([["", "Next to the board, held up with tape gone brown, a page from a notebook:", "art/look-hero.png"],
       ["", "THE WHEELS SPIN. THE BIG SHIP WAITS. TAKE A CAPSULE IN, BRING IT BACK. ONE PLACE AT A TIME. DON'T BE A HERO. I.P.", "art/look-hero.png"],
       ["", "And under that, added later, in the same hand but shakier: BE A LITTLE BIT OF A HERO.", "art/look-hero.png"],
       ["", "You laugh out loud. It echoes around the hangar."]],
      () => addPage("Ivan's note", "DON'T BE A HERO. And under it, later, shakier: BE A LITTLE BIT OF A HERO. I.P.", "art/look-hero.png"));
}

function useHangarRadio() {
  if (flag("lifeboatdone")) { doloresCalls(); return; }
  if (flag("hometowndone") && !flag("lifeboatknown")) { askHuMan(); return; }
  say([["", "You switch on the radio and say hello. Then you wait. One second. Two."],
       ["Mom", "...hello, baby. We can hear you. There's a little gap before you answer. Is that normal?"],
       ["", "It's normal. Weird Kid Weekly, Issue 371: the speed of light. Your voice takes a moment to get there, and the farther you go, the longer it takes."],
       ["Grandma Rosie", "Keep looking up, kiddo. We are."]]);
}

// the question mark (27 Nov): Hu Man knows, seventeen minutes away
function askHuMan() {
  say([["", "You ask your mother to ask Hu Man. Then you sit on the cold floor with your back against the board to wait. The fluffy corgi climbs into your lap and goes straight back to sleep."],
       ["", "Seventeen minutes there. Seventeen minutes back. When the answer comes, it isn't your mother's voice. It's his."],
       ["Hu Man", "I drew up the papers myself. In 1962, in my office, with the door locked. Mrs. Hale and Mr. Crandall and four of the others. They did not trust Vladimir, not entirely."],
       ["Hu Man", "They wanted somewhere to go if the perfect city turned out to be less than perfect. A place he had not built and could not switch off. They called it the Lifeboat."],
       ["Hu Man", "Your great-grandfather drew it for them. Quietly. It was never on the plans, because the plans were Vladimir's."],
       ["", "You look up at the question mark. Small and neat and penciled, in the handwriting from the comic. \"He knew,\" you whisper."],
       ["Hu Man", "It has its own air, and water, and power, and a garden of Earth seed in sealed tins. Forty bedrooms, a library and a ballroom. It is tethered to the far end of Hometown, on a very long line."],
       ["Hu Man", "You will find it by the line. And I would like to say again, as your lawyer, and as a man who has known a great many lonely people... go carefully."]],
      () => { set("lifeboatknown"); hint("Take Capsule A to the end of the line"); }, (i) => { if (i === 2) SFX.tick(); });
}

// home from the Lifeboat (27 Nov): Dolores calls Earth
function useDoloresHangar() {
  say([["Dolores", flag("called") ? "Somebody heard. Somebody heard it." : "The dogs know. Mr. Pert said it like it was a place. Not like the dogs know a secret. Like they know where."]],
      () => { if (!flag("called")) hint("Let Dolores use the radio"); });
}
function doloresCalls() {
  if (flag("called")) { say([["", "The radio is quiet. On the mission board, one light is still dark. FOUNDER'S STATION."]]); return; }
  say([["", "That night you tell your mother everything. The tumbling drum, the piano floating in the dark, the ballroom full of tomatoes, the lab they kept outside because of Ohio."],
       ["", "Then you give the microphone to Dolores. She holds it in both hands for a long time."],
       ["Dolores", "What do I say? It's been so long."],
       ["You", "Say anything."],
       ["Dolores", "Can anybody hear me? Is anybody there? This is Dolores. Dolores Brandt. I'm not in Hometown anymore. I'm on a ship, with Ivan Pert's great-grandkid, and a dog, and a trash can."],
       ["Dolores", "And I just wanted to say. To anybody. That I'm still here."]], () => {
    card(`<p>Seventeen minutes there. Seventeen minutes back.</p>
          <p>You sit up with her in the dark of the hangar, among the tomato plants. Dolores eats a tomato like an apple, juice running down her chin.
          The fluffy corgi eats one too, and sneezes, and eats another. A.R.P.F. plays a slow old waltz, and after a while Dolores's foot begins to tap along.</p>`, "The radio crackles", 0, () => {
      SFX.static();
      say([["Grandma Rosie", "Dolores? This is Rosie. Rosie Pert. Ivan's daughter. Yes, sweetheart. We hear you. We hear you."],
           ["", "Dolores Brandt puts her face in her hands, with a tomato in one of them, and cries. You put your arm around her, and the fluffy corgi climbs into both your laps, and none of you says anything at all."],
           ["", "On the mission board, one light is still dark. FOUNDER'S STATION. You look at it for a long time before you go to sleep."]],
          () => { set("called"); addPage("The Lifeboat", "The backers' own bunker, drawn by Ivan Pert and never on Vladimir's plans. Dolores Brandt kept its garden alone and knocked on Ivan's line every night until somebody knocked back.", "art/look-board.png"); hint("Founder's Station isn't built yet!"); });
    });
  });
}

function useCapsuleA() {
  if (flag("lifeboatdone")) { say([["A.R.P.F.", "One light still dark. FOUNDER'S STATION. That part isn't built yet. Ivan never finished anything on time either."]]); return; }
  if (flag("hometowndone")) {
    if (!flag("lifeboatknown")) { say([["", "Capsule A. But where to? The question mark isn't on any plan."], ["A.R.P.F.", "*a game show buzzer* Maybe somebody at home knows. Somebody with a very good memory. And a ticking."]], () => hint("Ask home about the question mark, on the radio")); return; }
    say([["", "The capsule knows the way to Hometown by now. This time you go past it."], ["A.R.P.F.", "To the end of the line! Mind the corgi. It has a helmet now. I screwed it on myself, with great ceremony."]], () => {
      card(`<p>The hangar door opens under you, and Capsule A drops out into space.</p>`, null, 1800, () => { location.href = "flight.html#lifeboat"; });
    });
    return;
  }
  if (flag("harvestdone")) {
    say([["", "Capsule A. It knows the way now, and so do you."], ["A.R.P.F.", "Hometown! The rocks are thicker that way. I have been told I am an excellent ducker."]], () => {
      card(`<p>The hangar door opens under you, and Capsule A drops out into space.</p>`, null, 1800, () => { location.href = "flight.html#hometown"; });
    });
    return;
  }
  if (!flag("board")) { say([["", "Capsule A. A tag on its ladder: CAPSULE A. Fuel checked. Seals checked. Ready. H.M. Sixty-two lines of it."], ["", "But where to? Maybe the board on the wall knows."]], () => hint("Look at the mission board")); return; }
  say([["", "Capsule A is the size of a phone booth inside. One seat, a bubble window, a stick between your knees. A.R.P.F. doesn't fit. It comes anyway."],
       ["A.R.P.F.", "Harvest Ring! Mind the rocks. There are a great many rocks."]], () => {
    card(`<p>The hangar door opens under you, and Capsule A drops out into space.</p>`, null, 1800, () => { location.href = "flight.html"; });
  });
}

// ---------- the story: the Harvest Ring (added 26 Nov, as in the novel's ch 22) ----------
function harvestEnts() {
  return [
    ent({ id: "t1", spr: "trays", x: 3.6, y: 1.5, r: 0.55 }), ent({ id: "t2", spr: "trays", x: 3.6, y: 5.5, r: 0.55 }),
    ent({ id: "t3", spr: "trays", x: 10.6, y: 5.5, r: 0.55 }), ent({ id: "t4", spr: "trays", x: 16.4, y: 5.5, r: 0.55 }),
    ent({ id: "b1", spr: "bloom0", x: 6.5, y: 2.9, r: 0.7 }), ent({ id: "b2", spr: "bloom0", x: 12.8, y: 4.3, r: 0.7 }),
    ent({ id: "b3", spr: "bloom0", x: 17.6, y: 2.2, r: 0.7 }),
    ent({ id: "tank", spr: "tank", x: 15.0, y: 1.55, r: 0.5, label: "The water tank", use: useTank }),
    ent({ id: "bench", spr: "bench", x: 20.1, y: 3.5, r: 0.75, label: "The potting bench", use: usePottingBench }),
    ent({ id: "gerald", spr: "gerald", x: 4.5, y: 3.5, r: 0.35, person: true, hidden: true, label: "Talk to the farmer", use: () => say([
      ["", "A man in blue overalls, very pale, faintly green, like the inside of a cucumber. His eyes are silver all the way through. A gold star is pinned to his bib."],
      ["", "He holds out his arms to you, slowly, and hums one low note. \"Gold star,\" he murmurs. \"Record year.\""],
      ["", "His name is stitched on the bib: G. POMFREY. You can't zap a person. Maybe A.R.P.F. has an idea."]]) }),
    ent({ id: "arpf", spr: "arpfon", x: 2.4, y: 2.2, r: 0.4, label: "Talk to A.R.P.F.", use: useArpfHarvest }),
  ];
}

function enterHarvest() {
  loadLevel("harvest");
  try { S.name = sessionStorage.getItem("zot-name") || S.name; } catch (e) { /* fine without it */ }
  S.items.gun = true; set("armed"); S.hearts = 3; document.getElementById("zapBtn").hidden = false;   // Ivan's ray gun came along
  card(`<p>Capsule A clamps onto the hub, right in the middle of the wheel.</p>
        <p>Here, at the center, you weigh almost nothing. Weird Kid Weekly, Issue 402:
        a merry-go-round. Stand on the edge and it tries to fling you off. Sit in the middle and you just turn gently round.</p>
        <p>You climb down the spoke toward the rim. A sign on the ladder: IT GETS HEAVY. It does.</p>`, "Climb down", 0, () => {
    say([
      ["", "Lamps, row after row, buzzing on as if they've been waiting for you. Fifty years of timers. On at morning, off at night, whether anybody comes or not."],
      ["", "Empty planting trays, cracked and gray. Dead corn. A sprinkler hissing on its own, watering nothing."],
      ["", "And the Moon-Bloom, everywhere. Up through the floor grates, up through the ceiling, its leaves leaning together overhead into a glowing roof."],
      ["", "As you step off the ladder, the flowers turn toward you. Not all at once. In a wave, all the way down the ring."],
      ["A.R.P.F.", "*crackle* I caught something on the old frequency, on the way in. A recording. Listen."],
      ["A voice", "This is Hazel Brandt. I used to be head farmer of the Harvest Ring... The book's still where we put it... Start with the farms."],
    ], () => hint("Look around the ring. Find what Hazel left."), (i) => { if (i === 3) { ents.filter((e) => e.spr === "bloom0").forEach((e) => { e.spr = "bloom1"; }); SFX.static(); } });
  });
}

function sproutsAttack() {
  set("hsprouts");
  [[10.5, 3.0], [12.0, 1.6], [14.0, 3.4], [11.2, 4.4], [15.5, 4.0]].forEach(([x, y]) => ents.push(sprout(x, y)));
  say([["", "Something drops off the leaves overhead and lands on the grate with a tik-tik-tik. Then another. Then three more."],
       ["A.R.P.F.", "Sprouts! Five of them! Zap! I'll scoop! Teamwork!"]], () => hint("Zap them with F. Two zaps each."));
}

function useTank() {
  if (flag("water")) { say([["A.R.P.F.", "My lid is full! Sloshing! Point me at something!"]]); return; }
  if (!flag("bloomnear")) { say([["", "A great round water tank against the outer wall. H2O. The tap still works. The flowers nearby have all leaned away from it."]]); return; }
  set("water"); SFX.whirr();
  say([["", "You turn the tap. A.R.P.F. rolls under it and holds its lid open until it's sloshing over the sides."],
       ["", "Weird Kid Weekly, Issue 395: water stops radiation. The farmers kept the beds behind the water tanks. And the flowers lean away from the tanks, every one."],
       ["A.R.P.F.", "I am a bucket now. A very proud bucket."]], () => hint("Take the water to the potting bench"));
}

function usePottingBench() {
  const b = ents.find((e) => e.id === "bench");
  if (!flag("wet")) {
    if (!flag("water")) {
      set("bloomnear");
      say([["", "A long wooden counter with a row of little drawers, each with a brass handle and a label: WHEAT. BARLEY. POTATO. BEAN. TOMATO. LETTUCE. CORN."],
           ["", "The Moon-Bloom has grown right up through the middle of it. Its flowers hang down so low over the drawers you'd have to put your head among them to reach."],
           ["", "They're all looking at you. You don't put your head among them."]], () => hint("The flowers lean away from the water tank..."));
      return;
    }
    set("wet"); b.spr = "benchwet"; SFX.pop();
    say([["", "A.R.P.F. tips its lid. SPLOOSH. Water everywhere."],
         ["", "The flowers flinch. Every one. They shrink up and away, shut tight, and the drawers are clear."]], () => hint("Which drawer? Hazel's crop reports might help."));
    return;
  }
  if (flag("notebook")) { say([["", "The CORN drawer is open, the seed piled on the floor. The false bottom leans against the bench."]]); return; }
  const names = ["WHEAT", "BARLEY", "POTATO", "BEAN", "TOMATO", "LETTUCE", "CORN"];
  panel(`<h2>The potting bench</h2><p>Seven drawers. Open one.</p>
    <div class="wires">${names.map((n) => `<button data-d="${n}">${n}</button>`).join("")}</div>
    <p id="drawer-msg">&nbsp;</p>
    <div class="row"><button id="drawer-close" class="alt">Close</button></div>`);
  const msg = document.getElementById("drawer-msg");
  document.querySelectorAll("[data-d]").forEach((btn) => btn.onclick = () => {
    if (btn.dataset.d !== "CORN") { msg.textContent = `${btn.dataset.d}: packed with seed. You dig to the bottom. Plain wood.`; beep(300, 0.05); return; }
    closePanel(); findNotebook();
  });
  document.getElementById("drawer-close").onclick = closePanel;
}

function findNotebook() {
  set("notebook"); SFX.ok();
  say([["", "CORN. Hazel's reports said corn: none. But the drawer is full. Packed with seed, untouched for fifty years."],
       ["", "You scoop it all out until the bottom shows. Plain wood. You feel along the edges until you find it: a little notch. A false bottom."],
       ["", "Under it, a small green notebook, the kind the farmers kept seed counts in. Hazel's.", "art/look-notebook.png"],
       ["", "Columns of numbers, week by week, the corn going pale, the beans curling. And on the last page, week 31, 1975:", "art/look-notebook.png"],
       ["", "THE FLOWERS FOLLOW PEOPLE. D. SAW IT FIRST.", "art/look-notebook.png"]], () => {
    addPage("Hazel's notebook", "Hidden under the false bottom of the CORN drawer. Hazel Brandt's counts, week by week, 1975. The last page: THE FLOWERS FOLLOW PEOPLE. D. SAW IT FIRST.", "art/look-notebook.png");
    const g = ents.find((e) => e.id === "gerald"); g.hidden = false; g.x = 4.5; g.y = 3.5;
    say([["", "Back down the ring, between you and the ladder, someone is standing in the aisle. Swaying. Arms out."],
         ["A.R.P.F.", "Oh dear. Oh dear oh dear. That's a person. Was a person. Is a person. You can't zap a person."]], () => hint("Talk to A.R.P.F."));
  });
}

function useArpfHarvest() {
  const g = ents.find((e) => e.id === "gerald");
  if (flag("notebook") && !g.hidden && !g.lured) {
    g.lured = true; SFX.static();
    say([["A.R.P.F.", "Leave this to me. I have every reel Mr. Ego ever recorded."],
         ["A voice", "Gerald! Gerald Pomfrey! A gold star for you, my boy! Down in the potato beds! A record year!"],
         ["", "It's Vladimir Ego's voice, warm and proud. The man in the overalls turns, slowly, toward the sound, and drifts away down the ring after it, humming."]],
        () => hint("Back to the ladder, on the west wall"));
    return;
  }
  if (!flag("hsprouts")) say([["A.R.P.F.", "Hazel said the book's still where we put it. Farmers put things in the farm. Start looking!"]]);
  else if (!flag("crops")) say([["A.R.P.F.", "The wall! All those papers! Farmers write everything down."]]);
  else if (!flag("notebook")) say([["A.R.P.F.", "Corn: none. But they kept a drawer for it. Why keep a drawer for nothing?"]]);
  else say([["A.R.P.F.", "Back up the spoke! Mind your head, it gets light."]]);
}

function useCropWall() {
  set("crops");
  say([["", "Crop reports. Hundreds of them, one for every week, pinned up all the way along the wall. In square, careful handwriting: Hazel's.", "art/look-crops.png"],
       ["", "Week 28: corn pale. Week 29: corn poor. Week 30: worse. Week 31: CORN: NONE. Each with a little red star.", "art/look-crops.png"],
       ["", "After that, a different hand. G. POMFREY. RECORD! RECORD! And gold stars, all the way to the end of the wall.", "art/look-crops.png"]],
      () => addPage("The crop reports", "Hazel Brandt's weekly reports, 1975: the corn failing, then CORN: NONE. Then G. Pomfrey took over, and every week after was a RECORD, with a gold star.", "art/look-crops.png"));
}

function useSpoke() {
  const g = ents.find((e) => e.id === "gerald");
  if (!flag("notebook")) { say([["A.R.P.F.", "Not yet! Hazel said the book's still where we put it. We came for the book."]]); return; }
  if (!g.lured) { say([["", "The man in the overalls is drifting toward you, arms out, humming. You can't get past him to the ladder."]], () => hint("Talk to A.R.P.F.")); return; }
  say([["", "Up the spoke, lighter with every rung, back to the hub and Capsule A. Behind you, very faintly, somebody is humming one note in the potato beds."]], () => {
    card(`<p>Capsule A drops away from the hub and flies you home to Ship Seven.</p>`, null, 1600, () => { goTo("hangar-harvest"); });
  });
}

// ---------- the story: Hometown (added 27 Nov, as in the novel's ch 23) ----------
// Main Street runs east from the hub ladder to the big round window. The
// school is on the south side: the hall, Room 3, the recording room and the
// gym, with the Roll-A-Rama behind the gym. No ray gun here: nothing in
// Hometown is for zapping.
const DRIFTERS = [[3.8, 1.2, 2], [5.2, 1.2, 3], [9.0, 2.0, 1], [13.5, 1.3, 2], [15.2, 2.7, 1], [19.5, 1.4, 3], [21.8, 2.4, 1], [23.2, 1.6, 2]];
const GYM_SPOTS = [[20.6, 8.6], [22.9, 9.1], [21.2, 10.9], [23.2, 10.5], [20.5, 9.9], [22.3, 11.3], [21.8, 8.4]];

function hometownEnts() {
  const people = DRIFTERS.map(([x, y, k], i) => ent({
    id: "d" + i, spr: "drift" + k, kind: k, x, y, bx: x, by: y, ox: x, oy: y, r: 0.3, person: true, drifter: true, t: i * 0.7,
    label: "Look at the person", use: () => useDrifter(k),
  }));
  return [
    ...people,
    ent({ id: "poster", spr: "poster", x: 5.9, y: 3.55, r: 0.2, label: "Read the poster", use: usePosterWhen }),
    ent({ id: "square", spr: "square", x: 7.7, y: 3.5, r: 0.5, label: "The square", use: () => say([["", "A little square with a bench and a fountain. The fountain is dry. There's dust in the bottom of it, and one penny."]]) }),
    ent({ id: "l1", spr: "lamp", x: 4.0, y: 3.85, r: 0.12 }), ent({ id: "l2", spr: "lamp", x: 11.0, y: 1.15, r: 0.12 }),
    ent({ id: "l3", spr: "lamp", x: 20.5, y: 3.85, r: 0.12 }),
    ent({ id: "helper", spr: "helper", x: 23.0, y: 2.5, r: 0.45, hidden: true }),
    ent({ id: "arpf", spr: "arpfon", x: 2.4, y: 2.4, r: 0.4, solid: false, follow: true, label: "Talk to A.R.P.F.", use: useArpfTown }),
    // the school
    ent({ id: "fount", spr: "rocketfount", x: 13.35, y: 5.3, r: 0.2, label: "The water fountain", use: () => say([["", "A water fountain shaped like a rocket. You press the button. Nothing. Then, far down in the pipes, a gurgle, like the station clearing its throat."]]) }),
    ent({ id: "desks", spr: "desks", x: 14.6, y: 9.0, r: 0.5, solid: false, label: "The little desks", use: () => say([["", "Little desks in rows, with little chairs. On one of them, a worksheet: THE MOONS OF JUPITER. Somebody has drawn a corgi on Ganymede."]]) }),
    ent({ id: "tdesk", spr: "tdesk", x: 13.55, y: 8.35, r: 0.4, solid: false, label: "The teacher's desk", use: () => say([["", "The teacher's desk. A red apple on it, shiny and perfect. You pick it up. It's made of wax. Miss Lindqvist must have kept it there for fifty years."]]) }),
    ent({ id: "fluffy", spr: "fluffybar", x: 14.4, y: 10.2, r: 0.3, solid: false, hidden: true, label: "The fluffy corgi", use: useFluffy }),
    // the switch panel is on the wall right above this desk, so the desk is
    // where you reach it from (27 Nov: standing in front of the desk, the
    // desk was always the nearer thing to use)
    ent({ id: "mic", spr: "micdesk", x: 17.75, y: 9.45, r: 0.4, solid: false, label: () => (flag("edge") ? "The microphone" : "The microphone and the switches"), use: useEdge }),
    ent({ id: "fridge", spr: "fridge", x: 23.45, y: 8.35, r: 0.3, solid: false, label: "The refrigerator", use: () => say([["", "A refrigerator with its door hanging open, and a corgi inside it, eating. It looks at you. It keeps eating."]]) }),
    ent({ id: "heap1", spr: "corgiheap", x: 22.6, y: 11.2, r: 0.5, solid: false }),
    ent({ id: "heap2", spr: "corgiheap", x: 20.7, y: 10.9, r: 0.5, solid: false }),
    ent({ id: "baller", spr: "corgi2", x: 21.6, y: 9.6, r: 0.3, solid: false, label: "Throw the ball", use: throwBall }),
    ent({ id: "ball", spr: "ball", x: 21.6, y: 9.6, r: 0.1, solid: false, hidden: true }),
    ent({ id: "oldcorgi", spr: "oldcorgi", x: 22.5, y: 9.8, r: 0.3, solid: false, hidden: true, label: "The old red corgi", use: useOldCorgi }),
    // the Roll-A-Rama
    ent({ id: "skater", spr: "skater", x: 20.5, y: 13.3, r: 0.3, solid: false, person: true, t: 0, label: "The skater", use: () => say([
      ["", "A very old man in a cowboy shirt with pearl snaps and a big silver buckle, skating slowly round in one wide circle, arms out from his sides."],
      ["", "His hair is white and wispy and floats up a little in the light gravity. His eyes are silver. He's smiling at nothing."],
      ["", "Round and round. You don't stop him. You couldn't, and you don't think you'd want to."]]) }),
    ent({ id: "rc1", spr: "corgi3", x: 23.4, y: 13.35, r: 0.3, solid: false }), ent({ id: "rc2", spr: "corgi", x: 23.4, y: 14.0, r: 0.3, solid: false }),
  ];
}

function enterHometown() {
  loadLevel("hometown");
  try { S.name = sessionStorage.getItem("zot-name") || S.name; } catch (e) { /* fine without it */ }
  S.items.gun = false; document.getElementById("zapBtn").hidden = true;
  card(`<p>Hometown is the wheel with the windows. More than you could ever count, round and yellow and warm,
        all the way around the rim. And in almost every lit one, a shape. Somebody standing at the glass, very still.</p>
        <p>They're all looking the same way. Not at you. Past you, at the Sun.</p>`, "Dock at the hub", 0, () => {
    card(`<p>The docking hatch opens into water.</p>
          <p>Not a flood. The water just hangs there in the air, in great wobbling blobs as big as beach balls,
          as big as cars, drifting round a blue-tiled room. HOMETOWN POOL. NO RUNNING. NO DIVING. ALWAYS SWIM UP!</p>
          <p>At the hub nothing presses on anything, so the water doesn't fall. You poke a blob. It wraps round your fingertip like a jelly glove, and lets go with a tiny <i>plip</i>.</p>
          <p>Behind you, A.R.P.F. floats straight into one the size of an armchair, and gurgles. You pull it out by the scoop arm.</p>`,
      "Climb down", 0, () => {
        say([["", "Climbing down into Hometown is easier than the Harvest Ring. It's a smaller wheel and it turns more gently. By the bottom you weigh about what you weigh at home."],
             ["", "The hatch opens onto a street. Green tiles, lampposts, little shops with striped awnings, all curving up and away until they disappear into the ceiling."],
             ["", "And all along the street, there are people. At the windows, on the sidewalk, all turned the same way, arms held out a little, swaying together like grass under water."],
             ["", "Nobody turns around. From all of them together comes one soft low note, held on and on. The sound of a lot of people waiting for something, for a very long time."],
             ["", "A.R.P.F. rolls up so close its tread bumps your sneaker. \"Yeah,\" you whisper. \"Me too.\""]],
            () => hint("Walk down Main Street"), (i) => { if (i === 3) SFX.hum(); });
      });
  });
}

function useDrifter(k) {
  const turned = flag("spilled");
  const who = { 1: "A man in a sweater", 2: "A woman in a long skirt", 3: "A mailman with his bag still over his shoulder" }[k];
  say([["", turned ? `${who}. Turned round now, toward the tea. Silver eyes, all the way through. Humming.` : `${who}, facing the round window at the end of the street. You say hello. They don't turn around.`]]);
}

function usePosterWhen() {
  say([["", "A poster on a post in the square: THE SHIP IS COMING! A rocket, and a happy crowd.", "art/look-when.png"],
       ["", "Somebody has scratched into the paint underneath it with something sharp. The letters are deep and angry: WHEN?", "art/look-when.png"]],
      () => addPage("THE SHIP IS COMING!", "A poster in the square on Main Street. Underneath, scratched into the paint: WHEN?", "art/look-when.png"));
}

function teaTime() {
  set("tea");
  const h = ents.find((e) => e.id === "helper"); h.hidden = false; h.x = Math.min(23, P.x + 6); h.y = 2.5; h.rolling = true;
  say([["", "Squee. Squee. Squee. A wheel squeaking, round and round, coming up the street toward you."]], () => hint("Something's coming"));
}

function helperArrives() {
  const h = ents.find((e) => e.id === "helper"); h.rolling = false;
  say([["", "A robot. Tall and smooth, like a big friendly bowling pin, in chipped teal and orange stripes, on one rubber wheel. It's pushing a tea cart."],
       ["", "Teal and orange. The same paint as the scrap in your backpack, the one you scooped out of space."],
       ["Helper", "TEA TIME! Have a cup! Have a cup! A happy Egonot is a helpful Egonot!"],
       ["", "An arm unfolds and pours. Pale green tea, steaming. It smells sweet, like syrup on a stove. It smells exactly like the farm."]], teaChoice);
}

function teaChoice() {
  panel(`<h2>Tea time</h2><p>The robot holds the cup out to you.</p>
    <div class="row"><button id="tea-drink" class="alt">Drink the tea</button><button id="tea-no">No thank you</button></div>`);
  document.getElementById("tea-drink").onclick = () => { closePanel(); say([["", "You lift the cup. A.R.P.F.'s scoop arm knocks it out of your hand."], ["A.R.P.F.", "Smell it! That's the farm. That's the flowers. Gerald had a gold star, and look at him."]], teaChoice); };
  document.getElementById("tea-no").onclick = () => {
    closePanel();
    say([["You", "No thank you."], ["Helper", "Have a cup!"], ["You", "I said no thank you."],
         ["Helper", "HAVE A CUP! HAVE A CUP! HAVE A..."]], () => { const a = ents.find((e) => e.id === "arpf"); a.ram = true; SFX.whirr(); });
  };
}

function teaSpill() {
  set("spilled"); SFX.crash();
  const h = ents.find((e) => e.id === "helper"); h.spr = "helperdown"; h.solid = false; h.label = "The robot";
  h.use = () => say([["", "The Helper lies on its back with its wheel spinning, its face flashing ERROR. \"Have... a... cuuuup...\""]]);
  const a = ents.find((e) => e.id === "arpf"); a.ram = false;
  say([["", "A.R.P.F. hits the cart at full speed. A crash like every dish in a kitchen falling at once."],
       ["", "The urn goes over. A tidal wave of pale green tea across the tiles. The robot spins three times, flashing ERROR, ERROR, ERROR, and crashes onto its back."],
       ["A.R.P.F.", "I'm afraid our guest doesn't care for tea."],
       ["", "You laugh so hard you have to sit down on the curb. Then you look up."],
       ["", "All along Main Street, the drifting people are turning around. Not to look at you. To look at the tea. And the soft low note has gone up, just a little, like a question."]],
      corgisArrive, (i) => {
        // they drift toward the puddle, but only a little way, and you can
        // slip between them: nobody gets boxed in on Main Street
        if (i === 4) { SFX.hum(); ents.filter((e) => e.drifter).forEach((e) => { e.spr = "drift" + e.kind + "f"; e.toTea = true; e.solid = false; }); }
      });
}

function dog(id, spr, x, y) { return ent({ id, spr, base: spr, x, y, r: 0.3, solid: false, dog: true, path: [], t: Math.random() * 6 }); }

function corgisArrive() {
  const h = ents.find((e) => e.id === "helper");
  const pack = ["corgi", "corgi2", "corgi3", "corgi", "corgi2", "corgi", "corgi3", "corgi2", "corgi"];
  pack.forEach((s, i) => {
    const c = dog("pk" + i, s, 7.6 + (i % 3) * 0.2, 1.2);
    const a = (i / pack.length) * Math.PI * 2;
    c.path = [[P.x + Math.cos(a) * 1.0, P.y + Math.sin(a) * 0.9]];
    ents.push(c);
  });
  const old = dog("pkold", "oldcorgi", 7.4, 1.3); old.path = [[P.x - 0.7, P.y]]; ents.push(old);
  const fl = dog("pkfluffy", "fluffy", 7.5, 1.4); fl.path = [[P.x + 0.6, P.y + 0.4]]; ents.push(fl);
  ents.filter((e) => e.dog).forEach((e) => { e.speed = Math.hypot(e.path[0][0] - e.x, e.path[0][1] - e.y) / 1.5; });
  // the words wait until they've got to you (the world stands still while
  // anyone is talking), so they really do surround you in about four seconds
  SFX.bark(); S.swarmT = 1.7;
}

function corgiScene() {
  say([["", "Barking. A lot of barking, all at once. The high, bossy yaps of small dogs who believe themselves to be very large dogs."],
       ["", "Out of the alley by the five-and-dime: a flood of short legs and big ears, orange and white and red and sable, twenty, thirty of them."],
       ["", "They surround you in about four seconds. The biggest, an old red one with a gray muzzle and one floppy ear, steps forward."],
       ["", "It sniffs your sneaker. Your knee. The goo stain from the farm, for a long time. Then your hand. You smell like turkey dinner and rocket fuel and a little bit like trash can."],
       ["", "One short, sharp bark. Every corgi stops at once. And the tails start wagging."],
       ["You", "Hi. Hi. I'm sorry. Hi."],
       ["", "They swarm you. The other way, the happy way. Corgis in your lap, corgis on your shoulders, a puppy chewing your shoelace."],
       ["", "Then a small, fat, extremely fluffy one sticks its nose in your jacket pocket, pulls out your Jackpot Bar, and runs."],
       ["You", "Hey!"]],
      () => {
        SFX.bark();
        const door = [[17.5, 3.3], [17.5, 5.5]];
        ents.filter((e) => e.dog).forEach((e, i) => {
          if (e.id === "pkfluffy") { e.spr = e.base = "fluffybar"; e.path = [...door, [21.0, 5.6], "gone"]; e.speed = 3.2; return; }
          const spot = GYM_SPOTS[i % GYM_SPOTS.length];
          e.path = [...door, [21.5, 6.3], [21.5, 7.6], spot]; e.speed = 2.6 + Math.random() * 0.4;
          if (e.id === "pkold") e.path = [...door, [21.5, 6.3], [21.5, 7.6], [22.5, 9.8], "gone"];
        });
        hint("After that corgi!");
      }, (i) => { if (i === 4) SFX.bark(); });
}

function enterSchool() {
  set("school");
  say([["", "Through the double doors: HOMETOWN SCHOOL. LEARNING IS FUN! The corgi with the candy bar is fast. You lose it in the hall."],
       ["", "Lockers painted teal. A trophy case with a dusty cup for SCIENCE FAIR 1973. Paper planets on the bulletin boards, and a sign about Attitude Class."],
       ["", "It's the strangest school you've ever been in, and the most ordinary. You can't make yourself leave it."]],
      () => {
        // the old corgi plants itself in the doorway behind you: it isn't
        // letting you go until you've followed it
        const old = ents.find((e) => e.id === "oldcorgi"); old.hidden = false; old.x = 17.5; old.y = 4.55; old.spr = "oldcorgi"; old.atDoor = true; old.solid = true;
        hint("Look around the school");
      });
}

function useDrawings() {
  if (flag("drawings")) { say([["", flag("ada") ? "The wall of drawings, with one gap in the middle where Ada's was." : "WHAT I WILL DO WHEN THE SHIP COMES. Ada's drawing, the girl and the little boy in the blob of blue.", "art/look-ada.png"]]); return; }
  set("drawings");
  say([["", "The back wall of Room 3 is covered in children's drawings. A title over them, cut out of colored paper one letter at a time: WHAT I WILL DO WHEN THE SHIP COMES."],
       ["", "I will show my grandpa my room. It has a window with Jupiter in it."],
       ["", "I will give my Nana a hug and a kiss and another hug."],
       ["", "My dog Biscuit is coming. Mom says he is too old. But he is coming. A brown dog in a fishbowl helmet, tongue out."],
       ["", "I will show James the pool. I will show him how you can swim UP. He is 4 so I will hold his hand. Ada Okafor, age 8.", "art/look-ada.png"],
       ["", "You know that name. Not Ada. James. OKAFOR, JAMES, AGE 4. A little brass plate on a seat on Ship Seven, with a folded blanket and a paper bag that says FOR THE TRIP.", "art/look-ada.png"],
       ["", "The ship never came for him. Ada drew him floating in the pool, holding her hand, and pinned it up, and waited."],
       ["", "Out of the window you can see a bit of Main Street, and the people at the windows, swaying. You don't know which one is Ada. You don't want to know."],
       ["", "You sit down at one of the little desks, much too small for you, and put your head on your arms. A.R.P.F. waits in the doorway. It doesn't play anything at all."]],
      () => {
        const f = ents.find((e) => e.id === "fluffy"); f.hidden = false;
        say([["", "After a while, something cold and wet pushes against your elbow. The small, fat, extremely fluffy corgi, sitting by your desk, with the Jackpot Bar in its mouth."]]);
      });
}

function useFluffy() {
  const f = ents.find((e) => e.id === "fluffy");
  if (flag("ada")) { say([["", "The fluffy corgi is lying on your foot. Whenever you move, it gets up and comes too, like a dog that has decided to stay."]]); return; }
  panel(`<h2>The fluffy corgi</h2><p>It drops the Jackpot Bar on your sneaker and looks up at you. It watches every move.</p>
    <div class="row"><button id="give-bar" class="alt">Give it the Jackpot Bar</button><button id="give-cracker">Give it a cracker</button></div>`);
  document.getElementById("give-bar").onclick = () => { closePanel(); say([["", "You start to unwrap it, and stop. Chocolate is bad for dogs. Even dogs in space."]]); };
  document.getElementById("give-cracker").onclick = () => {
    closePanel(); set("ada"); f.spr = "fluffy"; f.follow = true; f.solid = false;
    say([["", "You dig a cracker out of the FOR THE TRIP bag. The corgi eats it in one gulp, then licks your fingers to make sure. You eat the Jackpot Bar yourself."],
         ["", "It lies down on your foot with a big sigh, like a dog that has decided to stay."],
         ["", "When you stand up, you take Ada's drawing down off the wall, very carefully, so the corners don't tear, and fold it into Hazel's notebook.", "art/look-ada.png"],
         ["", "Somebody should know."]],
        () => addPage("Ada's drawing", "From Room 3, Hometown School: I will show James the pool. I will show him how you can swim UP. He is 4 so I will hold his hand. Ada Okafor, age 8. James's seat on Ship Seven is still waiting.", "art/look-ada.png"));
  };
}

function useOldCorgi() {
  const old = ents.find((e) => e.id === "oldcorgi");
  if (flag("edge")) { say([["", "The old red corgi thumps its tail on the floor, once. Thump. As if it's counting."]]); return; }
  if (old.atDoor) {
    old.atDoor = false; old.solid = false; old.speed = 1.6; old.path = [[17.5, 6.0], [17.5, 7.0]]; old.waitFor = true;
    say([["", "The old red corgi with the floppy ear is standing in the doorway, barking at you. Not angry. Insistent. Not that way."],
         ["", "It trots off down the hall with its tail high, looking back every few steps to make sure you're coming, the way dogs on TV lead people to a kid stuck down a well."]],
        () => hint("Follow the old corgi"));
    return;
  }
  say([["", "The old corgi looks at you with bright black eyes, and then at the wall above the desk."]]);
}

function useTapes() {
  say([["", "Shelves all round the walls, full of tape reels in flat cardboard boxes. Hundreds. Every box has a typed label, and every label ends the same way.", "art/look-tapes.png"],
       ["", "AKINS, SAMUEL. Birthday message to Grandfather. NOT SENT. BRANDT, DOLORES. Birthday message to Grandmother. NOT SENT.", "art/look-tapes.png"],
       ["", "CHEN, LUCY. Christmas message to Aunt May. NOT SENT. OKAFOR, ADA. Message to James. NOT SENT.", "art/look-tapes.png"],
       ["", "Every child in Hometown sat on that cushion and talked into the round part. None of it went home. Until a rock hit the colony, and the beacon grabbed them all, and sent them, fifty years late."],
       ["", "One of them got heard. You heard it. At four in the morning, under the whooping of the beacon: Dolores."]],
      () => addPage("The recording room", "Hundreds of messages from the children of Hometown, to grandparents and aunts and little brothers on Earth. Every label says NOT SENT.", "art/look-tapes.png"));
}

function useEdge() {
  if (flag("edge")) { say([["", "The EDGE light is still on. Amber. Steady now. Somebody at the edge of the colony knows you're here.", "art/look-edge.png"]]); return; }
  say([["", "An old round microphone on a stand, a big reel-to-reel, and a chair with a cushion on it, to make a short person tall enough to reach. A card on the desk: TALK INTO THE ROUND PART. LOUD AS YOU LIKE."],
       ["", "On the wall above it, a panel of switches, each with a little light and a label. FOUNDER'S STATION. HARVEST RING. HOMETOWN OFFICE. HUB. The station's own telephones, wheel to wheel. All dark.", "art/look-edge.png"],
       ["", "All except one. Its label has been scratched over, as if someone tried to take it off and couldn't quite. EDGE. Amber. Blinking.", "art/look-edge.png"]], () => {
    panel(`<h2>EDGE</h2><p>The light blinks. The old corgi looks at you. You look at the old corgi.</p>
      <div class="row"><button id="edge-leave" class="alt">Leave it</button><button id="edge-flip">Flip the switch</button></div>`);
    document.getElementById("edge-leave").onclick = closePanel;
    document.getElementById("edge-flip").onclick = () => {
      closePanel(); SFX.static();
      say([["", "A hiss of static from the little speaker over the desk. Long, and empty. You lean in close. You don't say anything. You just listen."],
           ["", "And then, out of the static, faint and far and very, very clear: Tap. Tap. Tap."],
           ["", "Three knocks. Like somebody on the other end of the line, rapping on a microphone with one knuckle."]], () => {
        panel(`<h2>The round microphone</h2><p>You stop breathing.</p>
          <div class="row"><button id="edge-knock">Knock on the microphone</button></div>`);
        document.getElementById("edge-knock").onclick = () => {
          closePanel(); SFX.knock();
          say([["", "Tap. Tap. Tap. Your hand is shaking so badly you can barely do it. But you do it."],
               ["", "Silence. The longest silence of your life."],
               ["", "Then, from very far away: Tap. Tap. Tap."],
               ["", "Somebody is out there. At the edge of the colony, where the bunker was, where the rock hit. Somebody heard you knock, and knocked back."]],
              () => {
                set("edge"); SFX.ok();
                addPage("The EDGE line", "In the recording room: a switch labeled EDGE, scratched over, its light amber. You knocked three times. Somebody at the edge of the colony knocked back.", "art/look-edge.png");
                const old = ents.find((e) => e.id === "oldcorgi"); old.waitFor = false; old.path = [[17.5, 7.0], [17.5, 6.0], [21.5, 6.3], [21.5, 7.6], [22.5, 9.8]]; old.speed = 1.6;
                hint("Back up the ladder to the hub");
              }, (i) => { if (i === 2) setTimeout(SFX.knock, 300); });
        };
      }, (i) => { if (i === 1) setTimeout(SFX.knock, 300); });
    };
  });
}

function throwBall() {
  const b = ents.find((e) => e.id === "ball");
  if (!b.hidden) return;
  b.hidden = false; b.x = P.x + Math.cos(P.a) * 0.4; b.y = P.y + Math.sin(P.a) * 0.4;
  b.vx = Math.cos(P.a) * 3.2; b.vy = Math.sin(P.a) * 3.2; b.life = 1.3;
  // where it will land: the ball goes straight, the floor turns under it,
  // so it seems to curve (Weird Kid Weekly, Issue 404). The corgis know.
  let x = b.x, y = b.y, vx = b.vx, vy = b.vy;
  for (let t = 0; t < b.life; t += 1 / 30) { [vx, vy] = curve(vx, vy, 1 / 30); const nx = x + vx / 30, ny = y + vy / 30; if (wallAt(nx, ny) !== ".") break; x = nx; y = ny; }
  ents.filter((e) => e.dog || e.id === "baller").forEach((e) => { if (Math.hypot(e.x - 21.8, e.y - 9.8) < 2.6) { e.path = [[x + (Math.random() - 0.5) * 0.4, y + (Math.random() - 0.5) * 0.4]]; e.speed = 2.8; } });
  if (!flag("ball")) {
    set("ball");
    say([["", "You throw it straight. It rolls away in a perfectly straight line... and then curves. Slowly, smoothly, to one side, as if an invisible hand were steering it."],
         ["", "Weird Kid Weekly, Issue 404: Why Can't You Play Catch on a Space Station? You and the ball and the floor all go round together. Once the ball leaves, it goes straight, and the floor keeps turning under it."],
         ["", "The corgis were born here. They aren't running to where the ball was going. They're running to where it's going to end up."],
         ["A.R.P.F.", "Remarkable."]]);
  } else hint("Wrong again. The corgis laugh at you, the way dogs laugh.");
}
function curve(vx, vy, dt) { const w = 1.4 * dt, c = Math.cos(w), s = Math.sin(w); return [vx * c - vy * s, vx * s + vy * c]; }

function useArpfTown() {
  if (!flag("tea")) say([["A.R.P.F.", "Stay in the middle of the street. Walk quietly. I am walking quietly. My treads are very quiet treads."]]);
  else if (!flag("school")) say([["A.R.P.F.", "Your Jackpot Bar! That little thief went into the school!"]]);
  else if (!flag("ada")) say([["A.R.P.F.", "Room 3 is just down the hall. I like schools. Schools are full of things worth keeping."]]);
  else if (!flag("edge")) say([["A.R.P.F.", "That old corgi has been trying to tell you something ever since we came in. I know the look. It's my look."]]);
  else say([["A.R.P.F.", "Somebody knocked back. Somebody is alive out there. Back up the ladder. Ivan's board will want to know."]]);
}

function useHubLadder() {
  if (!flag("edge")) {
    say([["A.R.P.F.", flag("school") ? "Not yet. The corgis want something. Did you see the old one, with the floppy ear?" : "Not yet! We've only just got here. Main Street first."]]);
    return;
  }
  say([["", "Up the ladder, lighter with every rung, through the floating pool, back to Capsule A. The fluffy corgi comes too. Nobody tells it not to."]], () => {
    card(`<p>Capsule A drops away from the hub and flies you home to Ship Seven.</p>`, null, 1600, () => { goTo("hangar-hometown"); });
  });
}

function townWall(w) {
  const shops = {
    a: ["Look in the post office", "The post office. Behind the glass, the lost and found board, still pinned with cards. A mailbox nobody empties."],
    b: ["Look in the barber shop", "A barber shop with a red-and-white pole, not turning. One chair, a towel folded on its arm, waiting for the next customer."],
    i: ["Look in the five-and-dime", "A five-and-dime with a window full of dusty toys: wind-up rockets, a cowboy hat, a doll in a space helmet."],
    j: ["Look in the bakery", "A bakery with nothing in the window but a sign: TRY OUR MOON-BLOOM MUFFINS! And a picture of a smiling muffin with a tiny flower on top. You don't feel hungry anymore."],
    r: ["Look in the window", "A lit window, and somebody standing at the glass, very still. Their arms are held out a little. They don't see you."],
    A: ["Read the sign", "Painted high on the houses, in letters taller than a person: TOMORROW IS TODAY!"],
    E: ["Read the sign", "Painted high on the houses, in letters taller than a person: TOMORROW IS TODAY!"],
    Y: ["Look out the round window", "The big round window at the end of the street. The stars sweep past as the wheel turns, and the Sun, bigger than you've ever seen it. Every person on Main Street is facing it."],
    "7": ["Read the scoreboard", "A scoreboard with numbers that flip over. LAPS. Under it, a number with so many digits that some have stuck halfway. Two old corgis on the bench beside it thump their tails, once, every time he passes. Thump."],
    "3": ["Look at the drawings", null], "1": ["Look at the drawings", null], "2": ["Look at the drawings", null],
  };
  if (w === "H") return { label: "Climb the ladder to the hub", use: useHubLadder };
  if (w === "W") return { label: "The switches", use: useEdge };
  if (w === "T") return { label: "The tapes", use: useTapes };
  if (w === "1" || w === "2" || w === "3") return { label: "Look at the drawings", use: useDrawings };
  const s = shops[w];
  return s ? { label: s[0], use: () => say([["", s[1]]]) } : null;
}

function updateHometown(dt) {
  const arpf = ents.find((e) => e.id === "arpf"), h = ents.find((e) => e.id === "helper");
  if (!flag("tea") && P.x > 9.5) teaTime();
  if (S.swarmT > 0) { S.swarmT -= dt; if (S.swarmT <= 0) corgiScene(); }
  if (h.rolling) {                                        // the Helper, squeaking up the street
    const dx = P.x - h.x, dy = P.y - h.y, d = Math.hypot(dx, dy);
    if (d > 1.3) { h.x += dx / d * 1.4 * dt; h.y += dy / d * 1.4 * dt; h.sq = (h.sq || 0) - dt; if (h.sq <= 0) { h.sq = 0.35; beep(1900, 0.04, "square", 0.02); } }
    else helperArrives();
  }
  if (arpf.ram) {                                         // A.R.P.F. at full speed
    const dx = h.x - arpf.x, dy = h.y - arpf.y, d = Math.hypot(dx, dy);
    if (d > 0.5) { arpf.x += dx / d * 5 * dt; arpf.y += dy / d * 5 * dt; } else teaSpill();
  }
  for (const e of ents) {
    if (e.follow && !arpf.ram) follow(e, e.id === "arpf" ? 0.9 : 0.6, dt);
    if (e.drifter) {                                      // swaying, all together
      e.t += dt;
      if (e.toTea) { const dx = h.x - e.bx, dy = h.y - e.by, d = Math.hypot(dx, dy); if (d > 1.2) { e.bx += dx / d * 0.12 * dt; e.by += dy / d * 0.12 * dt; } }
      e.x = e.bx + Math.sin(e.t * 0.9) * 0.04; e.y = e.by;
      if (e.toTea && Math.hypot(e.bx - e.ox, e.by - e.oy) > 1.5) e.toTea = false;      // a little way, no further
    }
    if (e.path && e.path.length) {                        // corgis on the move
      const p = e.path[0];
      if (p === "gone") { e.hidden = true; e.path = []; continue; }
      if (e.waitFor && Math.hypot(P.x - e.x, P.y - e.y) > 2.2) continue;   // the old corgi waits for you
      const dx = p[0] - e.x, dy = p[1] - e.y, d = Math.hypot(dx, dy), sp = (e.speed || 2.6) * dt;
      if (d <= sp) { e.x = p[0]; e.y = p[1]; e.path.shift(); if (!e.path.length && e.waitFor && e.y < 7.5) e.path = [[17.6, 8.7]]; }
      else { e.x += dx / d * sp; e.y += dy / d * sp; dogFace(e, dx); }
    }
  }
  const b = ents.find((e) => e.id === "ball");
  if (!b.hidden) {
    [b.vx, b.vy] = curve(b.vx, b.vy, dt); b.life -= dt;
    const nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
    if (wallAt(nx, ny) === "." && b.life > 0) { b.x = nx; b.y = ny; }
    else if (b.life > -0.8) b.life = Math.min(b.life, 0);
    if (b.life < -0.8) {                                  // the young one brings it back to your feet
      b.hidden = true; SFX.bark();
      const y = ents.find((e) => e.id === "baller"); y.speed = 2.2; y.path = [[P.x + Math.cos(P.a) * 0.8, P.y + Math.sin(P.a) * 0.8]];
    }
  }
  const sk = ents.find((e) => e.id === "skater");            // round and round
  sk.t += dt * 0.35; sk.x = 20.5 + Math.cos(sk.t) * 1.9; sk.y = 14.0 + Math.sin(sk.t) * 0.75;
  if (!flag("school") && P.y > 5.6 && P.y < 7) enterSchool();     // well into the hall, clear of the doorway
  if (!flag("rink") && P.y > 12.6) {
    set("rink");
    say([["", "Colored light, and music. Real music, tinny and scratchy and far too cheerful, the kind your grandma calls disco, playing on a loop."],
         ["", "The Hometown Roll-A-Rama. A mirror ball turns slowly overhead, scattering little squares of light like snow. Up near the middle of the wheel, your steps have a bounce in them."],
         ["", "It's the saddest and the funniest thing you've ever seen. You don't know how it can be both. But it is."]]);
  }
}

function follow(e, gap, dt) {
  const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy);
  if (d > 4) {                                            // lost round a corner: catch up
    const bx = P.x - Math.cos(P.a) * gap, by = P.y - Math.sin(P.a) * gap;
    if (wallAt(bx, by) === ".") { e.x = bx; e.y = by; }
    return;
  }
  if (d > gap + 0.2) {
    const s = 2.4 * dt, mx = e.x + dx / d * s, my = e.y + dy / d * s;
    if (wallAt(mx, e.y) === ".") e.x = mx;
    if (wallAt(e.x, my) === ".") e.y = my;
    if (e.id === "fluffy") dogFace(e, dx);
  }
}
function dogFace(e, dx) {
  const base = e.base || (e.spr.replace(/L$/, ""));
  if (!SPR[base + "L"]) return;
  e.spr = dx < 0 ? base + "L" : base;
}


// ---------- the story: the Lifeboat (added 27 Nov, as in the novel's ch 24) ----------
// The hall runs east from the docking hatch to the ballroom. The lab is out
// along the rope: in the map it's a room of its own at the east end, and the
// crinkly tube between them is a card, there and back.
function lifeboatEnts() {
  return [
    ent({ id: "tub1", spr: "tubtom", x: 9.6, y: 2.4, r: 0.6, label: "The bathtub", use: () => say([["", "A claw-footed bathtub with gold taps, full of dark earth. Tomato vines on stakes, heavy with small red tomatoes. Real green. Earth green."]]) }),
    ent({ id: "tub2", spr: "tubpot", x: 12.3, y: 2.2, r: 0.6, label: "The bathtub", use: () => say([["", "Potatoes in a bathtub, their leaves sticking up out of the earth."]]) }),
    ent({ id: "tub3", spr: "tubcar", x: 12.2, y: 8.2, r: 0.6, label: "The bathtub", use: () => say([["", "A row of something tall and feathery. Carrots, you think. You've never seen carrots growing before."]]) }),
    ent({ id: "tub4", spr: "tubtom", x: 9.6, y: 7.6, r: 0.6, label: "The bathtub", use: () => say([["", "More tomatoes. On the edge of this one, a watering can. It's dripping."], ["", "Somebody watered these. Today."]]) }),
    ent({ id: "bigtub", spr: "tubtom", x: 15.0, y: 7.8, r: 0.6, label: "The big bathtub", use: () => say([[
      "", flag("met") ? "The big bathtub at the end of the row. Marisol's. She was very, very good with tomatoes." : "The biggest bathtub, at the end of the row. The tomatoes in it are the best in the room."]]) }),
    ent({ id: "can", spr: "wcan", x: 9.0, y: 6.7, r: 0.15, solid: false }),
    ent({ id: "drawers", spr: "drawers", x: 16.6, y: 8.4, r: 0.5, label: "The drawers", use: () => say([["", "Dresser drawers, pulled out and lined up and filled with soil. Lettuce, in rows."]]) }),
    ent({ id: "piano", spr: "piano", x: 13.2, y: 5.0, r: 0.8, label: "The piano", use: () => say([
      ["", "A grand piano, the twin of the one floating outside, with its lid propped open and its insides full of beans."],
      ["", "They climb up strings that someone has tied, very neatly, to the chandeliers. You press a key. Plink. A bean leaf trembles."]]) }),
    ent({ id: "lamp1", spr: "flamp", x: 11.0, y: 4.0, r: 0.15 }), ent({ id: "lamp2", spr: "flamp", x: 16.0, y: 5.8, r: 0.15 }),
    ent({ id: "lamp3", spr: "flamp", x: 8.6, y: 5.6, r: 0.15 }),
    ent({ id: "arpf", spr: "arpfon", x: 2.4, y: 4.9, r: 0.4, solid: false, follow: true, label: "Talk to A.R.P.F.", use: useArpfLifeboat }),
    ent({ id: "fluffy", spr: "fluffy", x: 2.6, y: 4.2, r: 0.3, solid: false, follow: true, label: "The fluffy corgi", use: () => say([["", "The fluffy corgi trots ahead with its tail going. It isn't sniffing the air the way the Hometown corgis did. It's just trotting. Like a dog on a walk."]]) }),
    // the lab
    ent({ id: "bench", spr: "workbench", x: 23.45, y: 4.5, r: 0.45, label: "The workbench", use: () => say([["", "Screwdrivers and solder and the guts of three different radios. A round microphone on a stand, and a wire that runs up through the ceiling and out along the rope. Ivan built it."]]) }),
    ent({ id: "dolores", spr: "dolback", x: 22.6, y: 4.5, r: 0.3, person: true, label: "The woman at the microphone", use: useDolores }),
  ];
}

function enterLifeboat() {
  loadLevel("lifeboat");
  try { S.name = sessionStorage.getItem("zot-name") || S.name; } catch (e) { /* fine without it */ }
  S.items.gun = false; document.getElementById("zapBtn").hidden = true;
  card(`<p>The first thing you notice is the cold. Not freezing, not quite. Your breath comes out in clouds.
        It's the cold of a house in winter when the heat has been turned down too low for too long.</p>
        <p>The second thing is the carpet. Red and thick, patterned with little gold anchors, the most expensive carpet
        you have ever stood on. And threadbare all the way down the middle, as if somebody has walked up and down this hall ten thousand times.</p>`,
       "Step inside", 0, () => {
         say([["", "The spin here is gentle and strange. The floor holds you, but lightly, and every half a minute it seems to tilt a little under your feet, and then tilt back."],
              ["", "You keep one hand on the wall."]], () => hint("Walk down the hall"));
       });
}

function noFlowers() {
  set("noflowers");
  say([["", "The fluffy corgi, unscrewed from its helmet and much happier, trots ahead with its tail going. Not sniffing the air. Not checking. Just trotting."],
       ["", "You realize why, and stop. There are no flowers here."],
       ["", "You've been smelling Moon-Bloom since the Harvest Ring without even knowing it, the sweet, heavy smell at the back of every breath. Here, there isn't any."],
       ["", "Take nothing with you, the Founder told them. Not the farm seed. Not the tea. And they didn't."]]);
}

function enterBallroom() {
  set("ballroom");
  say([["", "The hall opens into a ballroom. Huge, and round, and gold, and almost dark. Three chandeliers sway very slightly with the wobble, their crystals clinking like ice in a glass."],
       ["", "And the whole floor is a garden. Not a farm. A garden, the kind somebody makes by hand. Bathtubs full of earth. Dresser drawers. A grand piano full of beans."],
       ["", "And the plants are green. Real green. Earth green. Not silver, not blue, not glowing. It's the first plain green thing you've seen since you left home."],
       ["", "That's the smell. Tomato leaves. Dirt. Summer. You stand there breathing it."]],
      () => hint("Somebody has been gardening here"));
}

function lifeboatWall(w) {
  const t = {
    t: ["Look at the portrait", [["", "A big man in a cowboy hat, holding an oil derrick the way other men hold a fishing rod. TEXAS CRANDALL, FOUNDING MEMBER."]]],
    y: ["Look at the portrait", [["", "A plump smiling man with a bottle of soda. BUCK FIZZWELL, FOUNDING MEMBER."]]],
    Z: ["Look at the portrait", [["", "At the end of the hall, bigger than the rest: a tall woman with silver hair, straight as a railroad spike, glaring out as if she's about to ask you a question you can't answer.", "art/look-rowena.png"],
                                 ["", "ROWENA HALE, CHAIRMAN. Somebody drew a small crown on her head in pencil, a long time ago. Somebody else rubbed it out. And somebody, later, drew it back.", "art/look-rowena.png"]]],
    5: ["Open the closet", [["", flag("met") ? "The inside of the closet door: tally marks, in fives. Four hundred and twelve patches. D.B." : "A closet door. On the inside, rows and rows of tally marks in groups of five. Somebody has been counting something for a very long time.", "art/look-patches.png"]]],
    9: ["Look out the window", [["", "Long windows, with the stars sliding past outside. And the gray thread of the cable, running all the way back toward Hometown."]]],
    $: ["The suit", [["", "A heavy gray suit on a hook, with a fishbowl helmet. Through the window beside it you can see a rope."]]],
    "!": ["The welded door", [["", "A great door, shut and welded round the edges with thick, ugly seams. Painted across it, in big uneven letters: DON'T."],
                               ["", "Beyond it, you know, is the hole. And the stars. And the piano, turning."]]],
    "*": ["Read the sign", [["", "LABORATORY. By order of the Chairman, the laboratory shall be kept OUTSIDE. Under it, in plain marker, smaller: Because of Ohio. R.H.", "art/look-ohio.png"],
                           ["", "Walt Okonkwo. The chemist from the Tuesday night meetings, who once blew up a laboratory in Ohio on purpose. You laugh, all by yourself in a freezing ballroom full of tomatoes, a little too loud."]]],
    "<": ["Read the chalkboard", [["", "NO TEA SINCE 1983, underlined twice. Under it, columns of names and dates, and notes: Slower, but no worse. Remembers her sister. Hums. Gardens. Happy.", "art/look-chalk.png"]]],
    "=": ["Read the chalkboard", [["", "M.S.: knows me most days.", "art/look-chalk.png"]]],
    ">": ["Read the chalkboard", [["", "At the bottom, in great big letters, with a circle round it and a lot of question marks: WHY NOT THE DOGS???", "art/look-chalk.png"]]],
    "?": ["The fish tank", [["", "One jar on a shelf by itself, its lid screwed down tight, the whole of it sunk in a fish tank full of water.", "art/look-jar.png"],
                            ["", "At the bottom, a single silver-blue leaf. Not glowing. Not turning. Just lying there like a leaf at the bottom of a pond. SMUGGLED. SORRY, ROWENA. KEEP IT WET. W.O.", "art/look-jar.png"]]],
    "~": ["Look out the porthole", [["", "The Lifeboat, right beside you, wobbling. The rope of little lights strung between you, like the lights on a Christmas tree."]]],
    "+": ["The shelves", [["", "Shelves up to the ceiling, crammed with glass jars and coils of wire and old tin boxes and books with their spines cracked."]]],
  }[w];
  if (t) return { label: t[0], use: () => say(t[1], w === "Z" ? () => addPage("Rowena Hale", "Chairman of the Lifeboat. Her portrait has a pencil crown: drawn on, rubbed out, drawn back.", "art/look-rowena.png") : w === "*" ? () => addPage("Because of Ohio", "The Lifeboat's laboratory was kept OUTSIDE, on the end of a rope, by order of the Chairman. Because of Ohio. R.H.", "art/look-ohio.png") : null) };
  if (w === "&") return { label: "The round hatch", use: useLabHatch };
  if (w === "/") return { label: "Back through the tube", use: useTubeBack };
  if (w === "@") return { label: "Back to Capsule A", use: useDockHatch };
  return null;
}

function useLabHatch() {
  if (flag("inlab")) return;
  say([["", "One of the windows isn't a window at all. It's a hatch, round, with a wheel on it. Through the glass: a thin line strung out into the dark, with little lights clipped along it."],
       ["", "At the far end of it, wobbling along on its own short tether, a much smaller shape. Round, with one porthole and a stubby chimney. Like a stove somebody threw out of a kitchen."],
       ["", "There's a light on in the porthole."]], () => {
    card(`<p>There's a tube along the rope. More of a tunnel, soft and silver and crinkly, like the inside of a juice box, held open with metal hoops.</p>
          <p>You pull yourself along it hand over hand. The fluffy corgi refuses to be carried and refuses to stay behind, so it comes too, <i>tikka tikka tikka</i>.</p>
          <p>A.R.P.F. can't fit. Behind you, very loudly, a woman in an old movie wails, "Don't leave me!" And then, sulkily, nothing.</p>`, "Push the little door open", 0, () => {
      set("inlab");
      const a = ents.find((e) => e.id === "arpf"); a.follow = false; a.x = 15.5; a.y = 1.6;
      const f = ents.find((e) => e.id === "fluffy"); f.x = 20.4; f.y = 4.9;
      P.x = 20.5; P.y = 4.5; P.a = 0; S.knockT = 0.5;
      say([["", "The lab is round, and small, and so full of things that at first you can't see anything at all."],
           ["", "And under the porthole, at a workbench covered in the guts of three radios, a person is sitting with their back to you, hunched over a microphone. The round kind."],
           ["", "A small, thin woman, wrapped in about four sweaters, with a long gray braid tied off with a twist of copper wire. One knuckle out."]]);
    });
  });
}

function useDolores() {
  const d = ents.find((e) => e.id === "dolores");
  if (!flag("met")) { meetDolores(); return; }
  if (!flag("told")) { doloresStory(); return; }
  if (!flag("hazel")) { say([["Dolores", "My mom's on the Icebox. Since 1975. I want to hear it. Take me to it."]], () => hint("Back through the tube, to A.R.P.F.")); return; }
  say([["Dolores", d.packed ? "I'm ready, honey. Tomatoes and all. Lead the way." : "You'll want those tomatoes. Where you're going. You'll want something green."]]);
}

function meetDolores() {
  const d = ents.find((e) => e.id === "dolores");
  d.spr = "dolwrench"; set("spun"); SFX.hurt();
  say([["", "The fluffy corgi sneezes."],
       ["", "She spins round on the stool so fast her braid whips over her shoulder, and she's got a wrench in her hand, a big one, held up like a bat."],
       ["", "Her eyes are very wide. They're brown. Plain brown, all the way through, with no silver in them anywhere."]], knockChoice);
}

function knockChoice() {
  panel(`<h2>The lab</h2><p>You both stare. In every version you thought of all night, you had something clever ready. Now you don't have anything at all.</p>
    <div class="row"><button id="dol-hello" class="alt">Say hello</button><button id="dol-knock">Knock three times on the door frame</button></div>`);
  document.getElementById("dol-hello").onclick = () => { closePanel(); say([["You", "H-hello?"], ["", "The wrench doesn't move. Words could be anybody. She's been waiting for something else."]], knockChoice); };
  document.getElementById("dol-knock").onclick = () => {
    closePanel(); SFX.knock();
    const d = ents.find((e) => e.id === "dolores");
    say([["", "You lift your hand, and knock three times on the door frame, with one knuckle. Tap. Tap. Tap."],
         ["", "The wrench comes down, very slowly."],
         ["", "\"Oh,\" she breathes. Her face crumples, and then un-crumples. \"Oh. It was you.\""]], () => { set("met"); d.label = "Talk to Dolores"; doloresStory(); }, (i) => { if (i === 1) d.spr = "dolores"; });
  };
}

function doloresStory() {
  say([["Dolores", "My name is Dolores Brandt. And I'm sixty-five years old. I wanted to make sure I still knew. You get out of the habit. Of saying it."],
       ["", "You tell her your name. She says it back to you twice, carefully, tasting it. Then she looks at your face, really looks at it."],
       ["Dolores", "Say that last name again... Pert. You've got his ears. Ivan Pert. He fixed my radiator, in Hometown, when I was a little girl. He fixed everybody's radiator."],
       ["Dolores", "He built that line. The night they put us on the shuttles he came out here with a toolbox and spent three days running it all the way back to the school. Our own telephone."],
       ["Dolores", "He answered it every Sunday night, for four years. And then one Sunday he didn't answer. And he never answered again."],
       ["", "1987. You don't say it. You don't have to."],
       ["Dolores", "So I kept calling. Every night. Seven o'clock. In case. The rock took the voice out of it, five years ago. So then I could only knock. I figured knocking's free."],
       ["You", "Where is everybody?"],
       ["Dolores", "Rowena ran it for twelve years. Ran it like a railroad. Walt did the science, out here, where she could keep an eye on him. We grew the garden from the sealed tins."],
       ["Dolores", "In 1999 Walt said there was enough fuel in the two old shuttles to try for home. Most of them went. They said they'd send a ship back for the rest of us. They never called."],
       ["Dolores", "Somebody had to stay. Somebody had to keep the garden. And Marisol couldn't go. She'd had tea. Walt found if you stop the tea, it doesn't get better. But it doesn't get worse."],
       ["Dolores", "She hummed all day long, and she was very, very good with tomatoes. She's in the garden now. Under the big bathtub. She'd have liked that."],
       ["", "The fluffy corgi gets up, walks across the room, and sits down against Dolores's ankle."],
       ["Dolores", "Well. Hello, you. I haven't seen a dog in forty-three years. You're a big fat fluffy girl. Oh, you're a disgrace. You're a total disgrace."],
       ["Dolores", "How did you know to knock?"],
       ["", "You tell her. The radio clock in the middle of the night, the beacon whooping, and under it, a little girl's voice. Can anybody hear me? This is Dolores, in Hometown."],
       ["Dolores", "That was my birthday message. For my grandma. I was nine. They never sent it... No, honey. Don't be sorry. Somebody heard it."],
       ["You", "There's one more message. It came on its own, the first night. A.R.P.F. caught it. It's from your mom."],
       ["Dolores", "My mom's on the Icebox. Since 1975."],
       ["You", "I know. It's a recording. Nobody ever sent it. But it's for you."]],
      () => {
        set("told");
        addPage("Dolores Brandt", "Sixty-five. Kept the Lifeboat's garden, and knocked on Ivan's line every night at seven o'clock since 1987. Brown eyes, plain all the way through.");
        hint("Back through the tube, to A.R.P.F.");
      });
}

function useTubeBack() {
  if (!flag("told")) { say([["", flag("met") ? "Not yet. She's still talking." : "The little door back to the tube. Not yet. Somebody in here is knocking."]]); return; }
  card(`<p>Back through the tube, hand over hand. Dolores goes first. She doesn't look back once at the lab, or the jar in the fish tank, or the chalkboards with all the names.</p>`, "Into the ballroom", 0, () => {
    const d = ents.find((e) => e.id === "dolores"); d.x = 13.8; d.y = 2.3; d.spr = "dolores";
    const a = ents.find((e) => e.id === "arpf"); a.x = 15.2; a.y = 2.0; a.follow = false;
    const f = ents.find((e) => e.id === "fluffy"); f.x = 13.9; f.y = 2.9; f.follow = false;
    P.x = 14.6; P.y = 3.6; P.a = -Math.PI / 2;
    SFX.ok();
    say([["", "A.R.P.F. is waiting at the hatch with its lid all the way up, and when Dolores comes out of the tube it rolls back three feet in astonishment and plays a trumpet fanfare, the kind they play when the queen comes in."],
         ["Dolores", "Is that... the poop bin?"],
         ["", "A.R.P.F.'s visor flickers, deeply offended."],
         ["You", "It's A.R.P.F. It's a lot more than a poop bin now. Play it. The one from the hangar. The first night."],
         ["A voice", "This is Hazel Brandt, on the Icebox. I used to be head farmer of the Harvest Ring. This is not a crop report."],
         ["", "Dolores sits down on the edge of the nearest bathtub, very slowly, as if her knees have forgotten how. The fluffy corgi climbs straight into her lap."],
         ["A voice", "Nobody asked me to make this one, so I don't suppose anybody will ever send it. But I'm making it anyway. Dolores. Baby. If you're out there at the bunker..."],
         ["", "You don't listen to the rest. It isn't yours. You go and stand at the long windows among the tomato vines, and you let Hazel Brandt talk to her daughter."],
         ["", "It takes a long time. Some of it makes Dolores laugh. Most of it doesn't."],
         ["Dolores", "The book. The book's still where we put it. She means the notebook. Under the corn."],
         ["", "You take out the small green notebook with the soil worked into the corners. You slip Ada's drawing out from between the pages first. Then you give the notebook to her.", "art/look-notebook.png"]],
        () => {
          set("hazel"); a.follow = true; f.follow = true;
          say([["Dolores", "This place has been dying for five years. Four hundred and twelve patches. I've kept count, on the inside of a closet door. I could do four hundred and thirteen. But I'd rather not."],
               ["", "She doesn't bring much. Her mother's notebook. The sweaters. Walt's notes in a tin box. She looks at the leaf in the fish tank for a while, and leaves it, and turns off the light."],
               ["Dolores", "And tomatoes. A whole crate, and three pots of seedlings. You'll want those, where you're going. You'll want something green."]],
              () => { d.packed = true; d.follow = true; d.solid = false; hint("Back to Capsule A, at the end of the hall"); });
        }, (i) => { if (i === 4) SFX.static(); });
  });
}

function useDockHatch() {
  if (!flag("hazel")) {
    say([["A.R.P.F.", flag("inlab") || flag("met") ? "Not yet. We came for whoever's knocking." : "Not yet! Somebody watered those tomatoes. Today."]]);
    return;
  }
  say([["", "The capsule is not built for two people, one trash can, one corgi and a crate of tomatoes. It manages."],
       ["", "As the clamps let go, Dolores watches the Lifeboat through the bubble window until it's too small to see."],
       ["Dolores", "Rowena would've hated that I'm leaving it. No. She'd have said what took me so long."]], () => {
    card(`<p>Capsule A swings away from the tumbling drum and flies you all home to Ship Seven.</p>`, null, 1800, () => { goTo("hangar-lifeboat"); });
  });
}

function useArpfLifeboat() {
  if (!flag("ballroom")) say([["A.R.P.F.", "Brr. My joints are squeaking. This is a cold, cold place, and somebody keeps it very tidy."]]);
  else if (!flag("inlab")) say([["A.R.P.F.", "That watering can is dripping. Somebody is here. Look for a way out to that light."]]);
  else if (!flag("hazel")) say([["A.R.P.F.", "*sniff* I am NOT sulking. Trash cans do not sulk."]]);
  else say([["A.R.P.F.", "Capsule A is at the end of the hall. I have counted the seats. There are not enough seats. We will manage."]]);
}

function updateLifeboat(dt) {
  S.lt = (S.lt || 0) + dt;
  P.a += Math.sin(S.lt * 2 * Math.PI / 30) * 0.05 * dt;     // the slow lopsided wobble, every half a minute
  for (const e of ents) if (e.follow) follow(e, e.id === "arpf" ? 1.0 : e.id === "dolores" ? 1.4 : 0.6, dt);
  if (!flag("noflowers") && P.x > 3.2 && P.x < 7) noFlowers();
  if (!flag("ballroom") && P.x > 7.8 && P.x < 18) enterBallroom();
  if (flag("inlab") && !flag("spun")) {                    // Tap. Tap. Tap. "Come on. You did it once."
    S.knockT -= dt;
    if (S.knockT <= 0) { S.knockT = 5; SFX.knock(); }
    const d = ents.find((e) => e.id === "dolores");
    if (Math.hypot(d.x - P.x, d.y - P.y) < 1.4) meetDolores();
  }
}


// ---------- the story: the silo (added 26 Nov, as in the novel's ch 19) ----------
function siloEnts() {
  return [
    ent({ id: "ship", spr: "shipseven", x: 5.5, y: 4.6, r: 1.35, label: "Climb the ladder", use: useShip }),
    ent({ id: "crate1", spr: "crate", x: 2.3, y: 6.6, r: 0.5, label: "Pry open the crate", use: useCrate }),
    ent({ id: "crate2", spr: "crate", x: 8.7, y: 6.6, r: 0.5, label: "Pry open the crate", use: useCrate }),
    ent({ id: "crate3", spr: "crate", x: 2.6, y: 2.9, r: 0.5, label: "Pry open the crate", use: useCrate }),
    ent({ id: "tag", spr: "tagpost", x: 6.6, y: 6.3, r: 0.15, label: "Read the tag", use: useTag }),
    ent({ id: "arpf", spr: "arpfon", x: 4.0, y: 8.5, r: 0.4, label: "Talk to A.R.P.F.", use: useArpfSilo }),
  ];
}

function enterSilo() {
  loadLevel("silo"); SFX.whirr();
  say([["", "The stairs go down and down. At the bottom, a round concrete room as wide as a church, and so tall the top is lost in the dark."],
       ["A.R.P.F.", "Ladies and gentlemen... the ship!", "art/look-ship.png"],
       ["", "It's the rocket from the photograph. The rocket from the comic. Round and silver, standing on three red fins, with a big red 7 on its side.", "art/look-ship.png"],
       ["A.R.P.F.", "Ship Seven. The families' ship. Fueled and ready since 1964. Somebody has been keeping it that way.", "art/look-ship.png"]],
      () => {
        addPage("Ship Seven", "The families' ship, in a silo under Ego House. Round and silver, three red fins, a big red 7. Fueled and ready since 1964.", "art/look-ship.png");
        hint("Look around the silo. The ladder goes up to the hatch.");
      });
}

function useCrate() {
  const e = target();
  if (flag("snacks")) {
    if (e.spr === "crate") { e.spr = "crateopen"; SFX.ok(); }
    say([["", "More Jackpot Bars. Hundreds of them. You already have plenty."]]);
    return;
  }
  e.spr = "crateopen"; set("snacks"); S.items.snacks = true; SFX.ok();
  say([
    ["", "JACKPOT, in giant gold letters, with money signs all over it. You've found a fortune. You've found a FORTUNE."],
    ["", "You pry the lid up with both hands..."],
    ["", "Candy. It's candy. Jackpot Bars, gold wrappers, three cherries on every one. Best before 2027.", "art/look-jackpot.png"],
    ["A.R.P.F.", "Mr. Ego's favorite! He ate one every day. Well. He did. Before."],
  ], () => {
    addPage("Jackpot Bars", "Crates and crates of them in the hold of Ship Seven, packed for the colony. Mr. Ego's favorite candy. Best before 2027, so somebody has been changing them.", "art/look-jackpot.png");
    hint("Snacks: check. Climb the ladder to the hatch.");
  });
}

function useTag() {
  say([
    ["", "A paper tag, tied to the rail with string, covered on both sides in tiny, neat handwriting. One line a year.", "art/look-tag.png"],
    ["", "1964: Fuel checked. Seals checked. Ready. H.M. ... 1965: Ready. H.M. ... And on, and on, every year.", "art/look-tag.png"],
    ["", "One line is different. 2006: NO.", "art/look-tag.png"],
    ["", "The last line: 2025: Ready. H.M.", "art/look-tag.png"],
  ], () => addPage("Hu Man's tag", "A tag on the rail by Ship Seven's ladder. Every year from 1964 to 2025, the same tiny handwriting: Ready. H.M. Except 2006, which just says NO.", "art/look-tag.png"));
}

function useArpfSilo() {
  if (!flag("snacks")) say([["A.R.P.F.", "Ivan always said never fly without snacks. Those crates say JACKPOT. I'm sure that means something important."]]);
  else say([["A.R.P.F.", "Up the ladder! I know the way. I've known the way for sixty-two years. Nobody asked."]]);
}

function useShip() {
  if (!flag("snacks")) {
    say([["", "You climb the ladder to the open hatch. Taped inside the door, a note in Ivan Pert's tidy capitals:"],
         ["", "TO WHOEVER COMES. THE ROBOT KNOWS THE WAY. TRUST IT. AND BRING SNACKS. I.P."],
         ["", "Snacks. You climb back down."]], () => hint("Find some snacks first. Those crates, maybe?"));
    return;
  }
  say([
    ["", "Up the ladder, through the hatch. Inside, the ship goes up and up in rings of cream leather seats, each one with a brass plate and a name. The families who never came."],
    ["", "At the very top, a little round cockpit. Two seats. A panel of switches and dials and chunky levers. The left-hand seat fits you perfectly."],
    ["A.R.P.F.", "Strap in, please. I've always wanted to say that. Strap in, please!"],
    ["", "Far above you, with a groan of old steel, the silo doors begin to open. A circle of sky."],
  ], countdown, (i) => { if (i === 3) SFX.whirr(); });
}

function countdown() {
  let n = 10;
  const tick = () => {
    if (n > 0) {
      card(`<p class="small">A calm, friendly voice from 1964, on A.R.P.F.'s radio:</p><h1>T-MINUS ${n}</h1>`, null, 60000);
      beep(n > 3 ? 440 : 660, 0.12, "square", 0.05);
      n--; setTimeout(tick, 800);
    } else {
      card(`<h1>LIFTOFF!</h1><p>The whole world turns into noise, and then into weight.</p>`, null, 60000);
      for (let i = 0; i < 6; i++) setTimeout(() => beep(60 + i * 8, 0.4, "sawtooth", 0.08), i * 200);
      try { sessionStorage.setItem("zot-name", S.name || ""); } catch (e) { /* the launch works without it */ }
      setTimeout(() => { location.href = "launch.html"; }, 2200);
    }
  };
  tick();
}

// ---------- the UI ----------
const talkEl = document.getElementById("talk"), panelEl = document.getElementById("panel"), cardEl = document.getElementById("card");
let talkQ = null;
function say(lines, done, onLine) { talkQ = { lines, i: 0, done, onLine }; showLine(); }
// A line can carry a close-up (decided 15 Nov: looking at something shows it
// on screen, not only in words). Lines without one show no picture.
function showLine() {
  const [who, text, pic] = talkQ.lines[talkQ.i];
  const img = talkEl.querySelector(".pic");
  if (pic) { img.src = pic; img.alt = text; img.hidden = false; } else { img.hidden = true; img.removeAttribute("src"); }
  talkEl.querySelector(".who").textContent = who;
  talkEl.querySelector(".who").style.display = who ? "" : "none";
  talkEl.querySelector(".text").textContent = text;
  talkEl.style.display = "block";
  if (talkQ.onLine) talkQ.onLine(talkQ.i);
}
function nextLine() {
  if (!talkQ) return;
  talkQ.i++;
  if (talkQ.i < talkQ.lines.length) { showLine(); return; }
  const d = talkQ.done; talkQ = null; talkEl.style.display = "none";
  if (d) d();
}
document.getElementById("next").onclick = nextLine;

function panel(html) { panelEl.innerHTML = html; panelEl.style.display = "block"; }
function closePanel() { panelEl.style.display = "none"; panelEl.innerHTML = ""; }
function busy() { return !!talkQ || panelEl.style.display === "block" || cardEl.style.display === "flex"; }

function card(html, button, ms, then) {
  cardEl.innerHTML = html + (button ? `<div class="row"><button id="card-go">${button}</button></div>` : "");
  cardEl.style.display = "flex";
  const go = () => { cardEl.style.display = "none"; if (then) then(); };
  if (button) document.getElementById("card-go").onclick = go; else setTimeout(go, ms);
}

function openGuide() {
  if (!S.guide.length) { hint("Your guide book is empty. Look around!"); return; }
  panel(`<h2>Guide book</h2>` + S.guide.map((p) => `<div class="page"><b>${p.title}</b><br>${p.text}${p.image ? `<br><img src="${p.image}" alt="${p.title}">` : ""}</div>`).join("")
    + `<div class="row"><button id="guide-close">Close</button></div>`);
  document.getElementById("guide-close").onclick = closePanel;
}

let hintTimer = 0;
// on a phone the hints name the buttons, not the keys
const TOUCHY = matchMedia("(pointer: coarse)").matches;
function hint(t) {
  if (TOUCHY) t = t.replace("press E", "press Use").replace("with F", "with Zap").replace("(G)", "(Book)");
  document.getElementById("hint").textContent = t; hintTimer = 6;
}

// ---------- input ----------
const keys = {};
addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") { if (e.key === "Enter") document.getElementById("pick-done")?.click(); return; }
  keys[e.code] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  if (talkQ && ["Space", "KeyE", "Enter"].includes(e.code)) { nextLine(); return; }
  if (e.code === "Escape") { closePanel(); return; }
  if (busy()) return;
  if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") interact();
  if (e.code === "KeyF") zap();
  if (e.code === "KeyG") openGuide();
});
addEventListener("keyup", (e) => { keys[e.code] = false; });
cv.addEventListener("mousedown", () => { if (!busy()) { if (S.items.gun) zap(); else interact(); } });

// ---------- world ----------
function wallAt(x, y) {
  const r = map[Math.floor(y)];
  if (!r) return "c";
  const c = r[Math.floor(x)];
  return c === undefined ? "c" : c;
}
function blocked(x, y) {
  if (wallAt(x, y) !== ".") return true;
  for (const e of ents) if (e.solid && !e.hidden && !e.dead && !e.enemy && Math.hypot(e.x - x, e.y - y) < e.r + 0.18) return true;
  return false;
}

function target() {
  let best = null, bd = 1.5;
  for (const e of ents) {
    if (!e.use || e.hidden || e.dead) continue;
    // reach is measured from the edge of big things (Ship Seven is 2.7 wide)
    // (27 Nov) A.R.P.F. and the fluffy corgi follow at your heels in Hometown;
    // they count as a little further off, or they'd always be the thing you use
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy) - Math.max(0, e.r - 0.3) + (e.follow ? 0.7 : 0);
    let da = Math.atan2(dy, dx) - P.a;
    da = Math.atan2(Math.sin(da), Math.cos(da));
    if (d < bd && Math.abs(da) < 0.55) { best = e; bd = d; }
  }
  if (!best && ["home", "mansion", "hangar", "harvest", "hometown", "lifeboat"].includes(L.name)) {
    for (let s = 0.2; s <= 1.8; s += 0.1) {
      const w = wallAt(P.x + Math.cos(P.a) * s, P.y + Math.sin(P.a) * s);
      if (L.name === "home" && w === "d") return { label: "Open the front door", use: useDoor };
      if (L.name === "hometown") { const t = townWall(w); if (t) return t; }
      if (L.name === "lifeboat") { const t = lifeboatWall(w); if (t) return t; }
      if (L.name === "harvest") {
        if (w === "C") return { label: "Read the crop reports", use: useCropWall };
        if (w === "L") return { label: "Climb the spoke ladder", use: useSpoke };
      }
      if (L.name === "hangar") {
        if (w === "M") return { label: "Look at the mission board", use: useBoard };
        if (w === "^") return { label: "Look at the mission board", use: () => say([["", "MISSION BOARD. HOMETOWN, white. HARVEST RING, white. THE LIFEBOAT, in Dolores's careful pencil, white. And one light still dark: FOUNDER'S STATION.", "art/look-board.png"]]) };
        if (w === "O" || w === "%") return { label: "Look at the mission board", use: () => say([["", w === "%"
          ? "MISSION BOARD. FOUNDER'S STATION, dark. HOMETOWN, white. HARVEST RING, white. And in the blank row, a penciled question mark, and a light beside it. Green."
          : "MISSION BOARD. HARVEST RING, white: done. HOMETOWN, green: next.", "art/look-board.png"]]) };
        if (w === "N") return { label: "Read the note", use: useHeroNote };
        if (w === "U") return { label: "The ladder up", use: () => say([["", "The ladder goes up through the rings of seats to the cockpit. The ship knows the way. The hangar is where you're needed."]]) };
      }
      if (L.name === "mansion") {
        if (w === "g") return { label: "Unlock the gate", use: useGate };
        if (w === "D") return { label: "Open the front door", use: useFrontDoor };
        if (w === "B") return { label: "Open the basement door", use: useBasementDoor };
        if (w === "V") return { label: "Look at the portrait", use: usePortrait };
      }
      if (w !== ".") break;
    }
  }
  return best;
}
function interact() { const t = target(); if (t) t.use(); }

function zap() {
  if (!S.items.gun || S.zapCool > 0) return;
  S.zapCool = 0.35; S.flash = 0.12; SFX.zap();
  let best = null, bd = 9;
  for (const e of ents) {
    if (!e.enemy || e.dead) continue;
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy);
    let da = Math.atan2(dy, dx) - P.a;
    da = Math.atan2(Math.sin(da), Math.cos(da));
    if (Math.abs(da) < Math.atan(0.3 / d) + 0.04 && d < bd && clearLine(e)) { best = e; bd = d; }
  }
  for (const e of ents) {                          // you can't zap a person
    if (!e.person || e.hidden) continue;
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy);
    let da = Math.atan2(dy, dx) - P.a; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (Math.abs(da) < Math.atan(0.3 / d) + 0.04 && d < bd) { hint("You can't zap a person."); return; }
  }
  if (best) {
    best.hp--; best.hit = 0.15;
    if (best.hp <= 0) { best.dead = true; best.spr = "pop"; best.popT = 0.8; SFX.pop(); }
  }
}
function clearLine(e) {
  const n = Math.ceil(Math.hypot(e.x - P.x, e.y - P.y) * 8);
  for (let i = 1; i < n; i++) if (wallAt(P.x + (e.x - P.x) * i / n, P.y + (e.y - P.y) * i / n) !== ".") return false;
  return true;
}

function update(dt) {
  if (hintTimer > 0) { hintTimer -= dt; if (hintTimer <= 0 && !flag("won")) document.getElementById("hint").textContent = ""; }
  S.zapCool = Math.max(0, S.zapCool - dt); S.flash = Math.max(0, S.flash - dt); S.hurtCool = Math.max(0, S.hurtCool - dt);
  for (const e of ents) {
    if (e.hit) e.hit = Math.max(0, e.hit - dt);
    if (e.dead && e.popT !== undefined) { e.popT -= dt; if (e.popT <= 0) e.hidden = true; }
  }
  if (busy()) return;
  let turn = (keys.ArrowLeft || keys.KeyA ? -1 : 0) + (keys.ArrowRight || keys.KeyD ? 1 : 0);
  let walk = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? 1 : 0);
  const st = TOUCH.stick;                         // phone stick: up walks, sideways turns
  if (st.on && Math.hypot(st.x, st.y) > 0.2) { turn = st.x; walk = Math.abs(st.y) > 0.25 ? -st.y : 0; }
  P.a += turn * 2.4 * dt;
  const sp = 2.2 * dt * walk, nx = P.x + Math.cos(P.a) * sp, ny = P.y + Math.sin(P.a) * sp;
  const pad = 0.22 * Math.sign(Math.cos(P.a) * sp), padY = 0.22 * Math.sign(Math.sin(P.a) * sp);
  if (!blocked(nx + pad, P.y)) P.x = nx;
  if (!blocked(P.x, ny + padY)) P.y = ny;

  // sprouts: watch you until you're armed, then shuffle toward you
  for (const e of ents) {
    if (!e.enemy || e.dead) continue;
    e.t += dt; e.spr = Math.floor(e.t * 4) % 2 ? "sprout1" : "sprout0";
    if (!S.items.gun) continue;
    const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy);
    if (d > 0.5) {
      const s = 0.75 * dt, mx = e.x + dx / d * s, my = e.y + dy / d * s;
      if (wallAt(mx, e.y) === ".") e.x = mx;
      if (wallAt(e.x, my) === ".") e.y = my;
    } else if (S.hurtCool <= 0) {
      S.hearts--; S.hurtCool = 1; SFX.hurt();
      if (S.hearts <= 0) knockedOut();
    }
  }
  checkWin();
  if (L.name === "hometown") updateHometown(dt);
  if (L.name === "lifeboat") updateLifeboat(dt);
  if (L.name === "harvest") {
    if (!flag("hsprouts") && P.x > 7.8) sproutsAttack();
    const g = ents.find((e) => e.id === "gerald");
    if (g && !g.hidden) {
      const tx = g.lured ? 20.5 : P.x, ty = g.lured ? 1.5 : P.y;
      const dx = tx - g.x, dy = ty - g.y, d = Math.hypot(dx, dy);
      const sp = g.lured ? 1.4 : 0.35;                  // drifting at you; hurrying after the Founder's voice
      if (d > 0.9) { g.x += dx / d * sp * dt; g.y += dy / d * sp * dt; }
      else if (g.lured) g.hidden = true;                // gone off down the ring
    }
  }
  if (L.name === "basement" && flag("won") && P.y > 6.3) enterSilo();
  if (L.name === "mansion" && !flag("hall") && P.y < 5.8) {
    set("hall");
    say([["", "Inside, everything is chrome, and everything is under dust. Fifty years of it, thick as felt, on the floor and the sofa and the lamps."],
         ["", "Except for one clean path down the middle of the floor. Two stripes wide, polished, as if something with treads drives up and down here every single day."]]);
  }
  if (L.name === "mansion" && !flag("watched") && P.x > 11.4 && P.y < 7) watchFlowers();
}

function knockedOut() {
  say([["A.R.P.F.", "Got you! *whirr* I pulled you back. Let's try that again. Two zaps each!"]], () => {
    S.hearts = 3; P.a = 0;
    const left = ents.filter((e) => e.enemy && !e.dead).length;
    ents = ents.filter((e) => !e.enemy);
    if (L.name === "harvest") {
      P.x = 1.6; P.y = 3.5;
      [[10.5, 3.0], [12.0, 1.6], [14.0, 3.4], [11.2, 4.4], [15.5, 4.0]].slice(0, left).forEach(([x, y]) => ents.push(sprout(x, y)));
    } else {
      P.x = 2.5; P.y = 2.5;
      ents.push(sprout(10.4, 3.5), sprout(10.5, 1.5), sprout(10.5, 4.5));
    }
  });
}

// ---------- drawing ----------
const zbuf = new Float32Array(W);
function rgb(c, k) { return (255 << 24) | (Math.min(255, c[2] * k) << 16) | (Math.min(255, c[1] * k) << 8) | Math.min(255, c[0] * k); }

function render() {
  const dirX = Math.cos(P.a), dirY = Math.sin(P.a), plX = -dirY * 0.66, plY = dirX * 0.66;
  const light = S.light;
  // textured floor and ceiling, darker with distance
  const r0x = dirX - plX, r0y = dirY - plY, r1x = dirX + plX, r1y = dirY + plY;
  for (let y = 0; y < VH; y++) {
    const below = y > VH / 2, dy = Math.abs(y - VH / 2) || 0.5;
    const rowD = F * (below ? HC : HW - HC) / dy;
    const k = Math.max(0.25, Math.min(1, 1.15 - rowD * 0.09)) * light * (below ? 1 : 0.9);
    let fx = P.x + rowD * r0x, fy = P.y + rowD * r0y;
    const stx = rowD * (r1x - r0x) / W, sty = rowD * (r1y - r0y) / W;
    for (let x = 0; x < W; x++, fx += stx, fy += sty) {
      const cx = Math.floor(fx), cyy = Math.floor(fy);
      const u = Math.floor((fx - cx) * 64) & 63, v = Math.floor((fy - cyy) * 64) & 63;
      const tt = TEX[below ? L.floor(cx, cyy) : L.ceil(cx, cyy)];
      buf[y * W + x] = rgb(tt.px[u * tt.h + v], k);
    }
  }
  for (let x = 0; x < W; x++) {
    const cam = 2 * x / W - 1, rx = dirX + plX * cam, ry = dirY + plY * cam;
    let mx = Math.floor(P.x), my = Math.floor(P.y);
    const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry);
    let stepX, stepY, sdx, sdy, side = 0, hit = ".";
    if (rx < 0) { stepX = -1; sdx = (P.x - mx) * ddx; } else { stepX = 1; sdx = (mx + 1 - P.x) * ddx; }
    if (ry < 0) { stepY = -1; sdy = (P.y - my) * ddy; } else { stepY = 1; sdy = (my + 1 - P.y) * ddy; }
    for (let n = 0; n < 64; n++) {
      if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
      hit = (map[my] && map[my][mx]) || "c";
      if (hit !== ".") break;
    }
    const dist = side === 0 ? sdx - ddx : sdy - ddy;
    zbuf[x] = dist;
    const tex = TEX[WALLCHARS[hit] || "concrete"];
    let wx = side === 0 ? P.y + dist * ry : P.x + dist * rx; wx -= Math.floor(wx);
    let tx = Math.floor(wx * tex.w);
    if ((side === 0 && rx < 0) || (side === 1 && ry > 0)) tx = tex.w - 1 - tx;
    const top = VH / 2 - F * (HW - HC) / dist, lineH = F * HW / dist;
    const k = Math.max(0.25, Math.min(1, 1.15 - dist * 0.09)) * (side ? 0.82 : 1) * light;
    const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(VH, Math.ceil(top + lineH));
    const col = tx * tex.h;
    for (let y = y0; y < y1; y++) {
      const ty = Math.max(0, Math.min(tex.h - 1, Math.floor((y - top) / lineH * tex.h)));
      const c = tex.px[col + ty];
      if (c) buf[y * W + x] = rgb(c, k);
    }
  }
  // sprites, far to near
  const list = ents.filter((e) => !e.hidden).map((e) => ({ e, d: (e.x - P.x) ** 2 + (e.y - P.y) ** 2 })).sort((a, b) => b.d - a.d);
  const inv = 1 / (plX * dirY - dirX * plY);
  for (const { e } of list) {
    const s = SPR[e.spr], sx = e.x - P.x, sy = e.y - P.y;
    const tX = inv * (dirY * sx - dirX * sy), tY = inv * (-plY * sx + plX * sy);
    if (tY <= 0.1) continue;
    const scr = Math.floor(W / 2 * (1 + tX / tY));
    const unit = F / tY, hgt = s.h / SPRU * unit, wid = s.w / SPRU * unit;
    const bottom = VH / 2 + HC * unit, top = bottom - hgt, left = scr - wid / 2;
    const k = Math.max(0.3, Math.min(1, 1.15 - Math.sqrt((sx * sx + sy * sy)) * 0.09)) * light;
    const x0 = Math.max(0, Math.floor(left)), x1 = Math.min(W, Math.ceil(left + wid));
    for (let x = x0; x < x1; x++) {
      if (tY >= zbuf[x]) continue;
      const tx = Math.max(0, Math.min(s.w - 1, Math.floor((x - left) / wid * s.w)));
      const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(VH, Math.ceil(bottom));
      for (let y = y0; y < y1; y++) {
        const ty = Math.max(0, Math.min(s.h - 1, Math.floor((y - top) / hgt * s.h)));
        const c = s.px[tx * s.h + ty];
        if (c) buf[y * W + x] = e.hit ? rgb([255, 255, 255], 1) : rgb(c, k);
      }
    }
  }
  // the ray gun in your hand, drawn at native size
  if (S.items.gun && (L.name === "basement" || L.name === "harvest")) {
    const g = SPR.gunview, gs = 1, gx = Math.floor(W / 2 + 20), gy = VH - g.h * gs;
    for (let x = 0; x < g.w * gs; x++) for (let y = 0; y < g.h * gs; y++) {
      const c = g.px[Math.floor(x / gs) * g.h + Math.floor(y / gs)];
      if (c) buf[(gy + y) * W + gx + x] = rgb(c, 1);
    }
    if (S.flash > 0) for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y < 37) buf[(VH / 2 + y) * W + W / 2 + x] = rgb([255, 244, 194], 1);
    buf[(VH / 2) * W + W / 2] = rgb([200, 66, 59], 1);   // a little aim dot
  }
  // HUD strip
  buf.fill(rgb(PAL.K, 1), VH * W, H * W);
  if (S.items.gun) for (let i = 0; i < 3; i++) heart(16 + i * 24, VH + 20, i < S.hearts);
  if (S.items.key) keyIcon(W - 60, VH + 24);
  if (S.hurtCool > 0.8) for (let i = 0; i < W * VH; i += 2) buf[i] = rgb([200, 66, 59], 1);
  ctx.putImageData(img, 0, 0);
  // labels on the HUD strip are drawn as text on top
  ctx.fillStyle = "#e8b33c"; ctx.font = "16px monospace";
  if (S.name) ctx.fillText(S.name.toUpperCase(), 96, VH + 38);
  const t = !busy() && target();
  ctx.fillStyle = "#f6efdc";
  if (t) ctx.fillText((TOUCHY ? "USE: " : "E: ") + (typeof t.label === "function" ? t.label() : t.label), 240, VH + 38);
}
function dot2(x, y, v) { buf[y * W + x] = buf[y * W + x + 1] = buf[(y + 1) * W + x] = buf[(y + 1) * W + x + 1] = v; }
function heart(x, y, full) {
  const rows = [".RR.RR.", "RRRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."];
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === "R") dot2(x + i * 2, y + j * 2, rgb(full ? PAL.R : PAL.l, 1)); }));
}
function keyIcon(x, y) {
  const rows = [".YYY......", "Y...YYYYYY", "Y...Y..Y.Y", ".YYY......"];
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === "Y") dot2(x + i * 2, y + j * 2, rgb(PAL.Y, 1)); }));
}

// ---------- go ----------
let last = 0;
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
  update(dt); render();
  requestAnimationFrame(frame);
}

// The launch and the flight send you here as index.html#hangar; everyone
// else starts in bed. (Saves aren't built yet, so the guide book starts empty.)
if (location.hash === "#harvest") {
  enterHarvest();
} else if (location.hash === "#hometown") {
  enterHometown();
} else if (location.hash === "#lifeboat") {
  enterLifeboat();
} else if (location.hash === "#hangar-question") {
  enterHangar("question");
} else if (location.hash === "#hangar-lifeboat") {
  enterHangar("lifeboat");
} else if (location.hash === "#hangar-harvest") {
  enterHangar("harvest");
} else if (location.hash === "#hangar-ready") {
  enterHangar("ready");
} else if (location.hash === "#hangar-hometown") {
  enterHangar("hometown");
} else if (location.hash === "#hangar" || location.hash === "#hangar-back") {
  enterHangar(location.hash === "#hangar-back");
} else {
  loadLevel("home");
  card(`<h1>ZOMBIES OF TOMORROW</h1>
        <p class="small">Round one: bedroom to liftoff. A test build.</p>
        <p>You dream of stars. A great wheel turns slowly in the dark.<br>Someone, very far away, is saying your name. A corgi barks.</p>
        <p class="small"><a href="#hangar" onclick="location.hash='hangar';location.reload();return false" style="color:#e8b33c">Or skip ahead to the hangar</a></p>`,
       "Wake up", 0, () => {
         SFX.buzz();
         say([["", "BZZZZZ. BZZZZZ. Your radio clock is buzzing."]], () => hint("Turn off the alarm clock by your bed (walk up to it, press E)"));
       });
}
requestAnimationFrame(frame);
