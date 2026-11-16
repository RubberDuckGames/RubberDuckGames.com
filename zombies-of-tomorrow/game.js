// Zombies of Tomorrow, round one: bedroom to basement (first test build, 15 Nov).
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

// ---------- levels ----------
const WALLCHARS = {
  "#": "paper", p: "poster", w: "window", m: "starmap", k: "tile", K: "kwindow", d: "door",
  c: "concrete", P: "pipes", S: "steel", v: "vent", h: "chrome",
};
const LEVELS = {
  home: {
    map: [
      "##p#w##kkKkkkk",
      "#.....#......k",
      "m.....#......k",
      "#............k",
      "#.....#......k",
      "#.....#......k",
      "#######kkkdkkk",
    ],
    ceil: () => "plaster", floor: (x) => (x >= 7 ? "lino" : "boards"), light: 1,
    start: { x: 2.0, y: 4.0, a: -Math.PI / 2 },
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
};
let L = null, map = null, ents = [];
const P = { x: 0, y: 0, a: 0 };

function ent(o) { return Object.assign({ solid: true, r: 0.3, hidden: false }, o); }

function loadLevel(name) {
  L = LEVELS[name]; L.name = name;
  map = L.map.map((r) => r.split(""));
  P.x = L.start.x; P.y = L.start.y; P.a = L.start.a;
  S.light = L.light;
  ents = name === "home" ? homeEnts() : basementEnts();
}

// ---------- the story: home ----------
function homeEnts() {
  return [
    ent({ id: "bed", spr: "bed", x: 1.6, y: 4.6, label: "Go to bed", use: useBed }),
    ent({ id: "clock", spr: "clock", x: 2.7, y: 5.6, label: "Turn off the alarm", use: useClock }),
    ent({ id: "comic", spr: "deskcomic", x: 4.4, y: 1.4, label: "Look at the comic", use: () => {
      say([["", "An old comic, soft as cloth. ORION GOES TO SPACE. A corgi in a fishbowl helmet flies a round silver rocket, and a friendly robot with a lid for a hat helps him steer.", "art/orion-page-1.png"],
           ["", "In the middle, a page has been torn out. Inside the cover, in faded colored pencil: For my little star. Look up. Love, Papa.", "art/look-inscription.png"]],
          () => addPage("The Orion comic", "Your great-grandfather Ivan Pert drew this for his daughter Rosie in 1958. The robot has a lid for a hat. One page, just before the star map, is missing.", "art/orion-page-1.png"));
    } }),
    ent({ id: "paper", spr: "deskpaper", x: 1.5, y: 1.4, label: "Read the newspaper clipping", use: () => {
      say([["", "A yellow newspaper clipping, 1958: ANOTHER SCIENTIST LOST. Plane vanishes over the Bermuda Triangle. Ivan Pert, 38, an engineer, is the third scientist to go missing this year.", "art/look-clipping.png"]],
          () => addPage("Missing scientists", "1958: Ivan Pert's plane vanished over the Bermuda Triangle. He was the third scientist to go missing that year. Why so many?", "art/look-clipping.png"));
    } }),
    ent({ id: "photo", spr: "shelf", x: 5.5, y: 5.5, label: "Look at the photo", use: () => {
      say([["", "A black and white photo of your great-grandfather, Ivan Pert, grinning in front of a huge silver rocket in the desert.", "art/look-photo.png"], ["", "On the back, in the same handwriting as the comic: Bottling machine. Ha. Love, Papa.", "art/look-photo-back.png"], ["", "Nobody in the family can explain the rocket.", "art/look-photo.png"]],
          () => addPage("Ivan Pert and the rocket", "A photo of Ivan Pert next to a rocket nobody can explain. Where was this taken? Who built it?", "art/look-photo.png"));
    } }),
    ent({ id: "mirror", spr: "mirror", x: 5.6, y: 1.3, label: "Look in the mirror", use: useMirror }),
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
            <p>Vladimir Ego's mansion. Dust, chrome furniture, a greenhouse gone wild.</p>
            <p>The basement stairs go down into the dark.</p>`, "Go down", 0, () => { loadLevel("basement"); hint("Find a way to turn the power on"); });
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
      say([["", "Clunk. The lights flicker, buzz, and come on. Chrome everywhere, and dust on all of it."]], () => hint("Something in the next room is covered in dust"));
    } }),
    ent({ id: "bench", spr: "bench", x: 1.5, y: 4.5, r: 0.45, label: "Open the workbench drawer", use: useBench }),
    ent({ id: "arpf", spr: "arpfoff", x: 8.5, y: 2.3, r: 0.4, label: "Switch on the robot", use: useArpf }),
    ent({ id: "terminal", spr: "terminal", x: 6.6, y: 4.4, label: "Use the terminal", use: useTerminal }),
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
  if (flag("won") || !flag("armed")) return;
  if (ents.some((e) => e.enemy && !e.dead)) return;
  set("won");
  addPage("The sprouts", "Something that crawled out of Ego's greenhouse: a Moon-Bloom bud on root legs, with one flower that watches you. Two zaps and it pops into goo and stars.");
  say([["A.R.P.F.", "Goo and stars! You did it! Ivan Pert would be proud."],
       ["A.R.P.F.", "The silo is through that door. I'll... I'll come too. If that's all right. I'm very good at checkers."]],
      () => hint("Go through the silo door"));
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
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy);
    let da = Math.atan2(dy, dx) - P.a;
    da = Math.atan2(Math.sin(da), Math.cos(da));
    if (d < bd && Math.abs(da) < 0.55) { best = e; bd = d; }
  }
  if (!best && L.name === "home") {
    for (let s = 0.2; s <= 1.8; s += 0.1) {
      const w = wallAt(P.x + Math.cos(P.a) * s, P.y + Math.sin(P.a) * s);
      if (w === "d") return { label: "Open the front door", use: useDoor };
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
  if (L.name === "basement" && flag("won") && P.y > 6.3) finish();
}

function knockedOut() {
  say([["A.R.P.F.", "Got you! *whirr* I pulled you back. Let's try that again. Two zaps each!"]], () => {
    S.hearts = 3; P.x = 2.5; P.y = 2.5; P.a = 0;
    ents = ents.filter((e) => !e.enemy);
    ents.push(sprout(10.4, 3.5), sprout(10.5, 1.5), sprout(10.5, 4.5));
  });
}

let finished = false;
function finish() {
  if (finished) return; finished = true;
  card(`<h1>END OF ROUND ONE</h1>
        <p>Down the stairs, in the dark, something huge and silver is waiting in a silo.</p>
        <p>Next time: the silo, and the crates marked JACKPOT.</p>
        <p class="small">Pages in your guide book: ${S.guide.length}</p>
        <div class="row"><button onclick="location.href='flight.html'">Try the flight between stations</button></div>`, "Play again", 0, () => location.reload());
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
  if (S.items.gun && L.name === "basement") {
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

loadLevel("home");
card(`<h1>ZOMBIES OF TOMORROW</h1>
      <p class="small">Round one: bedroom to basement. A first test build.</p>
      <p>You dream of stars. A great wheel turns slowly in the dark.<br>Someone, very far away, is saying your name. A corgi barks.</p>
      <p class="small"><a href="flight.html" style="color:#e8b33c">Or skip ahead to the flight test</a></p>`,
     "Wake up", 0, () => {
       SFX.buzz();
       say([["", "BZZZZZ. BZZZZZ. Your radio clock is buzzing."]], () => hint("Turn off the alarm clock by your bed (walk up to it, press E)"));
     });
requestAnimationFrame(frame);
