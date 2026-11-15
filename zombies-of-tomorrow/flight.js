// Zombies of Tomorrow: flying between stations (first test, 15 Nov).
// Weave through the asteroid belt and shoot what you can't dodge.
"use strict";

const W = 640, H = 400, VH = 360;         // play area 640 x 360, HUD strip below
const F = 330;                              // pixels per world unit at distance 1
const SZ = 2.2;                             // how far in front of you the ship flies
const FAR = 40;
const TRIP = 75;                            // seconds from the hangar to the Harvest Ring

const cv = document.getElementById("screen");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;

// ---------- art: each sprite pre-drawn once on its own little canvas ----------
const SPR = {};
for (const [k, rows] of Object.entries(FART.spr)) {
  const c = document.createElement("canvas");
  c.width = rows[0].length; c.height = rows.length;
  const g = c.getContext("2d");
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch !== ".") { g.fillStyle = FART.palette[ch]; g.fillRect(x, y, 1, 1); }
  }));
  SPR[k] = c;
}
const PAL = FART.palette;

// ---------- sound ----------
let actx = null;
function beep(freq, dur, type = "square", vol = 0.05, slide = 0) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), actx.currentTime + dur);
    g.gain.value = vol; g.gain.linearRampToValueAtTime(0, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* sound is optional */ }
}
const SFX = {
  pew: () => beep(1200, 0.08, "square", 0.03, -800),
  crack: () => beep(140, 0.18, "sawtooth", 0.06, -60),
  boom: () => { beep(90, 0.35, "sawtooth", 0.08, -50); beep(60, 0.4, "triangle", 0.08); },
  hurt: () => beep(200, 0.3, "sawtooth", 0.08, -150),
  get: () => { beep(660, 0.08); setTimeout(() => beep(990, 0.12), 80); },
  woof: () => { beep(330, 0.06, "square", 0.06, -120); setTimeout(() => beep(300, 0.08, "square", 0.06, -140), 120); },
};

// ---------- state ----------
let G;
function newGame() {
  G = {
    t: 0, on: false, done: false,
    ship: { x: 0, y: 0.3, vx: 0, vy: 0 }, hull: 5, hurt: 0, shake: 0, cool: 0,
    rocks: [], shots: [], items: [], booms: [],
    scrap: 0, corgis: 0, crates: 0, spawn: 0, itemSpawn: 3,
    stars: Array.from({ length: 150 }, () => star(Math.random() * FAR)),
  };
}
function star(z) { return { x: (Math.random() - 0.5) * 14, y: (Math.random() - 0.5) * 9, z: z || FAR }; }

const SIZES = {
  big: { r: 0.55, hp: 3, px: 30 },
  mid: { r: 0.36, hp: 2, px: 20 },
  small: { r: 0.22, hp: 1, px: 12 },
};
function addRock(size, x, y, z, vx = 0, vy = 0) {
  G.rocks.push({ size, x, y, z, vx, vy, hp: SIZES[size].hp, v: Math.floor(Math.random() * 3), hit: 0, flip: Math.random() < 0.5 });
}

// ---------- input ----------
const keys = {};
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
});
addEventListener("keyup", (e) => { keys[e.code] = false; });
let pointer = null;
function pointerAt(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}
cv.addEventListener("pointerdown", (e) => { pointer = pointerAt(e); cv.setPointerCapture(e.pointerId); });
cv.addEventListener("pointermove", (e) => { if (pointer) pointer = pointerAt(e); });
cv.addEventListener("pointerup", () => { pointer = null; });

// ---------- the flight ----------
function fire() {
  if (G.cool > 0) return;
  G.cool = 0.16; SFX.pew();
  const s = G.ship;
  G.shots.push({ x: s.x - 0.09, y: s.y - 0.02, z: SZ + 0.2 }, { x: s.x + 0.09, y: s.y - 0.02, z: SZ + 0.2 });
}

function update(dt) {
  G.t += dt;
  const prog = Math.min(1, G.t / TRIP);
  const s = G.ship;

  // steer
  let ax = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
  let ay = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0);
  const st = TOUCH.stick;
  if (st.on && Math.hypot(st.x, st.y) > 0.15) { ax = st.x; ay = st.y; }
  if (pointer) {
    const tx = (pointer.x - W / 2) / F * SZ, ty = (pointer.y - VH / 2) / F * SZ;
    ax = Math.max(-1, Math.min(1, (tx - s.x) * 3)); ay = Math.max(-1, Math.min(1, (ty - s.y) * 3));
  }
  s.vx += (ax * 3.2 - s.vx) * Math.min(1, dt * 8);
  s.vy += (ay * 2.4 - s.vy) * Math.min(1, dt * 8);
  s.x = Math.max(-1.45, Math.min(1.45, s.x + s.vx * dt));
  s.y = Math.max(-0.85, Math.min(0.85, s.y + s.vy * dt));
  G.cool -= dt; G.hurt -= dt; G.shake = Math.max(0, G.shake - dt);
  if (keys.Space || keys.KeyF || pointer) fire();

  const speed = 9 + prog * 5;
  // stars rush past
  for (const st of G.stars) { st.z -= speed * dt * 1.4; if (st.z < 0.3) Object.assign(st, star()); }

  // rocks come in waves, thicker the closer you get
  if (prog < 0.86) {
    G.spawn -= dt;
    if (G.spawn <= 0) {
      G.spawn = 0.75 - prog * 0.45 + Math.random() * 0.25;
      const roll = Math.random();
      const size = roll < 0.3 + prog * 0.2 ? "big" : roll < 0.75 ? "mid" : "small";
      const aim = Math.random() < 0.45;                           // some come right at you
      addRock(size, aim ? s.x + (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 3.6,
        aim ? s.y + (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 2.2, FAR,
        (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2);
    }
    G.itemSpawn -= dt;
    if (G.itemSpawn <= 0) {
      G.itemSpawn = 7 + Math.random() * 5;
      const kind = Math.random() < 0.45 ? "corgi" : "crate";
      G.items.push({ kind, x: (Math.random() - 0.5) * 2.6, y: (Math.random() - 0.5) * 1.5, z: FAR, r: kind === "corgi" ? 0.32 : 0.26, bob: Math.random() * 6 });
    }
  }

  for (const r of G.rocks) { r.z -= speed * dt; r.x += r.vx * dt; r.y += r.vy * dt; r.hit = Math.max(0, r.hit - dt); }
  for (const it of G.items) { it.z -= speed * dt * 0.9; it.bob += dt; }
  for (const b of G.booms) b.t += dt;
  for (const sh of G.shots) sh.z += 34 * dt;

  // shots hit rocks
  for (const sh of G.shots) {
    for (const r of G.rocks) {
      const R = SIZES[r.size].r;
      if (!sh.dead && !r.dead && Math.abs(sh.z - r.z) < 1.2 && Math.abs(sh.x - r.x) < R && Math.abs(sh.y - r.y) < R) {
        sh.dead = true; r.hp--; r.hit = 0.1;
        if (r.hp <= 0) breakRock(r); else SFX.crack();
      }
    }
  }
  // rocks hit you
  for (const r of G.rocks) {
    const R = SIZES[r.size].r;
    if (!r.dead && Math.abs(r.z - SZ) < 0.45 && Math.abs(r.x - s.x) < R + 0.28 && Math.abs(r.y - s.y) < R + 0.2) {
      r.dead = true; boom(r.x, r.y, r.z, 2);
      if (G.hurt <= 0) {
        G.hull--; G.hurt = 1.2; G.shake = 0.4; SFX.hurt();
        hint(G.hull > 1 ? "Ow! Hull hit." : "Careful! One more hit and A.R.P.F. has to tow you home.");
        if (G.hull <= 0) return lose();
      }
    }
  }
  // pick things up by flying into them
  for (const it of G.items) {
    if (!it.dead && Math.abs(it.z - SZ) < 0.6 && Math.abs(it.x - s.x) < it.r + 0.3 && Math.abs(it.y - s.y) < it.r + 0.25) {
      it.dead = true;
      if (it.kind === "scrap") { G.scrap++; SFX.get(); }
      if (it.kind === "crate") { G.crates++; G.hull = Math.min(5, G.hull + 1); SFX.get(); hint("A supply crate! Hull patched up."); }
      if (it.kind === "corgi") { G.corgis++; SFX.woof(); hint(["Got one! A corgi in a fishbowl helmet.", "Another corgi! It licks the inside of its helmet.", "Corgi rescued! It looks very pleased with itself."][G.corgis % 3]); }
    }
  }
  G.rocks = G.rocks.filter((r) => !r.dead && r.z > 0.4);
  G.items = G.items.filter((i) => !i.dead && i.z > 0.4);
  G.shots = G.shots.filter((sh) => !sh.dead && sh.z < FAR);
  G.booms = G.booms.filter((b) => b.t < 0.6);

  if (prog >= 1 && !G.done) win();
}

function breakRock(r) {
  r.dead = true; SFX.boom();
  boom(r.x, r.y, r.z, r.size === "big" ? 2 : 1);
  const next = r.size === "big" ? "mid" : r.size === "mid" ? "small" : null;
  if (next) for (const d of [-1, 1]) addRock(next, r.x + d * 0.15, r.y, r.z, d * 0.9, (Math.random() - 0.5) * 0.6);
  if (r.size !== "big" && Math.random() < 0.35) G.items.push({ kind: "scrap", x: r.x, y: r.y, z: r.z, r: 0.2, bob: 0 });
}
function boom(x, y, z, k) { G.booms.push({ x, y, z, k, t: 0 }); }

// ---------- drawing ----------
function proj(x, y, z) { return [W / 2 + x * F / z, VH / 2 + y * F / z]; }
function drawAt(img, x, y, z, worldR, pxR, flip) {
  const [sx, sy] = proj(x, y, z);
  const scale = (worldR * F / z) / pxR;
  const w = img.width * scale, h = img.height * scale;
  if (flip) { ctx.save(); ctx.translate(sx, sy); ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore(); }
  else ctx.drawImage(img, sx - w / 2, sy - h / 2, w, h);
}

function render() {
  const shx = G.shake > 0 ? (Math.random() - 0.5) * 10 : 0, shy = G.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  ctx.save(); ctx.translate(shx, shy);
  ctx.fillStyle = PAL.D; ctx.fillRect(-10, -10, W + 20, VH + 20);
  // the Sun, far off, getting bigger as the trip goes on
  const prog = Math.min(1, G.t / TRIP), sunR = 6 + prog * 4;
  ctx.fillStyle = PAL.Y; ctx.beginPath(); ctx.arc(W - 70, 50, sunR + 3, 0, 7); ctx.fill();
  ctx.fillStyle = PAL.S; ctx.beginPath(); ctx.arc(W - 70, 50, sunR, 0, 7); ctx.fill();
  // stars, streaking
  for (const st of G.stars) {
    const [x1, y1] = proj(st.x, st.y, st.z), [x0, y0] = proj(st.x, st.y, st.z + 0.5);
    const b = Math.min(1, 3 / st.z);
    ctx.strokeStyle = b > 0.5 ? PAL.S : PAL.l; ctx.lineWidth = b > 0.6 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(Math.round(x0), Math.round(y0)); ctx.lineTo(Math.round(x1), Math.round(y1)); ctx.stroke();
  }
  // the Harvest Ring, coming up out of the dark near the end
  if (prog > 0.8) {
    const z = 3 + (1 - (prog - 0.8) / 0.2) * 60;
    drawAt(SPR.station, 0, -0.2, z, 1.8, 80);
  }
  // everything in the belt, far to near
  const things = [
    ...G.rocks.map((r) => ({ z: r.z, d: () => {
      const sz = SIZES[r.size];
      drawAt(SPR[r.size + r.v], r.x, r.y, r.z, sz.r * 1.2, sz.px, r.flip);
      if (r.hit > 0) { const [sx, sy] = proj(r.x, r.y, r.z); ctx.fillStyle = "rgba(255,244,194,.6)"; ctx.beginPath(); ctx.arc(sx, sy, sz.r * F / r.z, 0, 7); ctx.fill(); }
    } })),
    ...G.items.map((i) => ({ z: i.z, d: () => drawAt(SPR[i.kind], i.x, i.y + Math.sin(i.bob * 2) * 0.05, i.z, i.kind === "scrap" ? 0.12 : i.r * 1.4, i.kind === "corgi" ? 24 : i.kind === "crate" ? 15 : 10) })),
    ...G.booms.map((b) => ({ z: b.z, d: () => drawAt(SPR["boom" + Math.min(2, Math.floor(b.t / 0.2))], b.x, b.y, b.z, 0.5 * b.k, 24) })),
    ...G.shots.map((sh) => ({ z: sh.z, d: () => drawAt(SPR.laser, sh.x, sh.y, sh.z, 0.06, 3) })),
  ].sort((a, b) => b.z - a.z);
  for (const t of things) if (t.z > SZ) t.d();
  // your ship
  const s = G.ship, [sx, sy] = proj(s.x, s.y, SZ);
  if (!(G.hurt > 0 && Math.floor(G.t * 12) % 2)) {
    const img = SPR["ship" + (Math.floor(G.t * 10) % 2)];
    ctx.save(); ctx.translate(Math.round(sx), Math.round(sy)); ctx.rotate(s.vx * 0.08);
    ctx.drawImage(img, -img.width / 2, -img.height / 2); ctx.restore();
  }
  for (const t of things) if (t.z <= SZ) t.d();
  // aim marks in front of the ship
  const [ax, ay] = proj(s.x, s.y, 12);
  ctx.strokeStyle = PAL.R; ctx.lineWidth = 2;
  ctx.strokeRect(Math.round(ax) - 6, Math.round(ay) - 6, 12, 12);
  if (G.hurt > 0.9) { ctx.fillStyle = "rgba(200,66,59,.35)"; ctx.fillRect(-10, -10, W + 20, VH + 20); }
  ctx.restore();
  hud(prog);
}

function hud(prog) {
  ctx.fillStyle = PAL.K; ctx.fillRect(0, VH, W, H - VH);
  for (let i = 0; i < 5; i++) {                       // hull pips
    ctx.fillStyle = i < G.hull ? PAL.R : PAL.Z;
    ctx.fillRect(12 + i * 18, VH + 12, 14, 16);
    ctx.fillStyle = i < G.hull ? PAL.P : PAL.l; ctx.fillRect(12 + i * 18, VH + 12, 14, 3);
  }
  // the trip: hangar to the Harvest Ring
  const bx = 120, bw = 300;
  ctx.fillStyle = PAL.Z; ctx.fillRect(bx, VH + 18, bw, 4);
  ctx.fillStyle = PAL.T; ctx.fillRect(bx, VH + 18, bw * prog, 4);
  ctx.fillStyle = PAL.L; ctx.fillRect(bx + bw * prog - 4, VH + 13, 8, 14);
  ctx.fillStyle = PAL.G; ctx.beginPath(); ctx.arc(bx + bw + 10, VH + 20, 7, 0, 7); ctx.fill();
  ctx.fillStyle = PAL.Y; ctx.font = "14px monospace";
  ctx.fillText("SCRAP " + G.scrap, 452, VH + 18);
  ctx.fillText("CORGIS " + G.corgis, 452, VH + 34);
  ctx.drawImage(SPR.corgi, 560, VH + 4, 32, 32);
}

// ---------- start, win, lose ----------
const cardEl = document.getElementById("card");
function card(html, buttons) {
  cardEl.innerHTML = html + `<div class="row">${buttons.map((b, i) => `<button id="cb${i}" class="${i ? "alt" : ""}">${b[0]}</button>`).join("")}</div>`;
  cardEl.style.display = "flex";
  buttons.forEach((b, i) => { document.getElementById("cb" + i).onclick = () => { cardEl.style.display = "none"; b[1](); }; });
}
let hintT = 0;
function hint(t) { document.getElementById("hint").textContent = t; hintT = 4; }

function start() {
  newGame(); G.on = true;
  hint("Weave around the rocks. Shoot the ones you can't dodge. Fly into corgis and crates to pick them up.");
}
function win() {
  G.done = true; G.on = false;
  const stars = G.hull >= 5 ? "Not a scratch!" : G.hull >= 3 ? "A few dents." : "That was close.";
  card(`<h1>DOCKING AT THE HARVEST RING</h1>
        <p>${stars} Hull ${G.hull} of 5.</p>
        <p>Scrap collected: ${G.scrap}. Supply crates: ${G.crates}. Corgis rescued: ${G.corgis}.</p>
        <p class="small">Inside, the silver-blue towers have grown up through the ceiling grates. Something in there is watching the airlock.</p>`,
    [["Fly again", start], ["Back to round one", () => { location.href = "index.html"; }]]);
}
function lose() {
  G.on = false;
  card(`<h1>HULL BREACHED</h1>
        <p>A.R.P.F. flies out in the spare capsule, hooks on a tow line, and hauls you back to the hangar.</p>
        <p class="small">"You did very well. For a person. Again?"</p>`,
    [["Fly again", start], ["Back to round one", () => { location.href = "index.html"; }]]);
}

let last = 0;
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
  if (G.on) update(dt);
  if (hintT > 0) { hintT -= dt; if (hintT <= 0) document.getElementById("hint").textContent = ""; }
  render();
  requestAnimationFrame(frame);
}

newGame();
card(`<h1>THE FLIGHT</h1>
      <p class="small">A first test: from the hangar to the Harvest Ring.</p>
      <p>The colony is falling through the asteroid belt,<br>and the space between the stations is full of rocks.</p>
      <p>Weave around them. Shoot the ones you can't dodge.<br>Keep an eye out for lost corgis.</p>`,
  [["Launch", start]]);
requestAnimationFrame(frame);
