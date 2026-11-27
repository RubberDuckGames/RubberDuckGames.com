// Zombies of Tomorrow: the launch (26 Nov). Ship Seven climbs out of the
// silo and the Air Force thinks it's an attack: jets scramble, missiles come
// up after you. Decided 26 Nov: you dodge, you don't shoot back (the pilots
// are people), and FULL FUSION gives you a burst of speed. It ends in orbit
// on the title card, as in the novel's ch 20.
"use strict";

const W = 640, H = 400, VH = 360;
const F = 330, SZ = 2.2, FAR = 40;
const CLIMB = 50;                           // seconds from the silo to orbit at cruising push

const cv = document.getElementById("screen");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;

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
let NAME = "";
try { NAME = sessionStorage.getItem("zot-name") || ""; } catch (e) { /* no name, no problem */ }

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
  whoosh: () => beep(300, 0.4, "sawtooth", 0.03, -200),
  boom: () => { beep(90, 0.35, "sawtooth", 0.08, -50); beep(60, 0.4, "triangle", 0.08); },
  hurt: () => beep(200, 0.3, "sawtooth", 0.08, -150),
  fusion: () => beep(120, 0.5, "square", 0.05, 500),
  radio: () => { for (let i = 0; i < 5; i++) setTimeout(() => beep(300 + Math.random() * 1500, 0.04, "sawtooth", 0.02), i * 50); },
  lock: () => beep(1500, 0.06, "square", 0.03),
};

// ---------- state ----------
let G;
function newGame() {
  G = {
    t: 0, alt: 0, on: false, done: false,
    ship: { x: 0, y: 0.2, vx: 0, vy: 0 }, hull: 5, hurt: 0, shake: 0,
    fuel: 1, boosting: false,
    jets: [], missiles: [], clouds: [], booms: [], said: {},
    jetSpawn: 2, cloudSpawn: 0,
    specks: Array.from({ length: 90 }, () => speck(Math.random() * FAR)),
  };
}
function speck(z) { return { x: (Math.random() - 0.5) * 14, y: (Math.random() - 0.5) * 9, z: z || FAR }; }

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

// ---------- the climb ----------
function radio(key, text) { if (G.said[key]) return; G.said[key] = true; SFX.radio(); hint(text); }

function update(dt) {
  G.t += dt;
  const s = G.ship;
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
  G.hurt -= dt; G.shake = Math.max(0, G.shake - dt);

  // FULL FUSION: hold to go faster while the gauge lasts
  const want = keys.Space || keys.KeyF;
  if (want && G.fuel > 0.05) {
    if (!G.boosting) SFX.fusion();
    G.boosting = true; G.fuel = Math.max(0, G.fuel - dt * 0.4);
  } else { G.boosting = false; G.fuel = Math.min(1, G.fuel + dt * 0.12); }
  const push = G.boosting ? 1.9 : 1;
  G.alt = Math.min(1, G.alt + dt / CLIMB * push);
  const prog = G.alt, speed = (9 + prog * 6) * push;

  for (const p of G.specks) { p.z -= speed * dt * 1.4; if (p.z < 0.3) Object.assign(p, speck()); }

  // the story on the radio, as you climb
  if (prog > 0.03) radio("a", "Radio: \"Unidentified rocket, this is the United States Air Force. Turn back now.\"");
  if (prog > 0.14) radio("b", "A.R.P.F.: \"Jets! Don't shoot them, they're people. Just dodge!\"");
  if (prog > 0.38) radio("c", "Radio: \"Missiles away.\" A.R.P.F.: \"FULL FUSION! Hold Space!\"");
  if (prog > 0.7) radio("d", "The sky is going dark. The jets can't climb this high.");
  if (prog > 0.9) radio("e", "Almost there. Keep going!");

  // clouds low down, jets in the middle, missiles chasing after
  if (prog < 0.35) {
    G.cloudSpawn -= dt;
    if (G.cloudSpawn <= 0) {
      G.cloudSpawn = 0.7 + Math.random() * 0.8;
      G.clouds.push({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2.4, z: FAR, v: Math.random() < 0.5 ? 0 : 1 });
    }
  }
  if (prog > 0.12 && prog < 0.7) {
    G.jetSpawn -= dt;
    if (G.jetSpawn <= 0) {
      G.jetSpawn = 1.6 - prog * 1.2 + Math.random() * 0.6;
      const aim = Math.random() < 0.3;                         // tuned 26 Nov: kind enough for an 8-year-old
      G.jets.push({ x: aim ? s.x + (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 3.2,
        y: aim ? s.y + (Math.random() - 0.5) * 0.4 : (Math.random() - 0.5) * 1.8, z: FAR,
        vx: (Math.random() - 0.5) * 0.8, fired: false });
    }
  }
  for (const j of G.jets) {
    j.z -= speed * dt * 1.1; j.x += j.vx * dt;
    if (prog > 0.36 && !j.fired && j.z < 24 && Math.random() < 0.5) {
      j.fired = true; SFX.lock();
      G.missiles.push({ x: j.x, y: j.y, z: j.z, life: 0 });
    } else if (j.z < 24) j.fired = true;
  }
  for (const m of G.missiles) {
    m.life += dt;
    m.z -= speed * dt * 0.9;                                     // they close in slower than you climb...
    const turn = 0.55 * dt;                                      // ...and steer toward you a little
    m.x += Math.max(-turn, Math.min(turn, s.x - m.x)); m.y += Math.max(-turn, Math.min(turn, s.y - m.y));
  }
  for (const c of G.clouds) c.z -= speed * dt;
  for (const b of G.booms) b.t += dt;

  // hits
  const hit = (o, rx, ry) => Math.abs(o.z - SZ) < 0.45 && Math.abs(o.x - s.x) < rx && Math.abs(o.y - s.y) < ry;
  for (const j of G.jets) if (!j.dead && hit(j, 0.55, 0.22)) { j.dead = true; ouch(j); }
  for (const m of G.missiles) if (!m.dead && hit(m, 0.32, 0.28)) { m.dead = true; ouch(m); }
  if (G.hull <= 0) return lose();
  for (const j of G.jets) if (!j.dead && !j.passed && j.z < SZ - 0.5) { j.passed = true; SFX.whoosh(); }

  G.jets = G.jets.filter((j) => !j.dead && j.z > 0.4);
  G.missiles = G.missiles.filter((m) => !m.dead && m.z > 0.4);
  G.clouds = G.clouds.filter((c) => c.z > 0.4);
  G.booms = G.booms.filter((b) => b.t < 0.6);
  if (prog >= 1 && !G.done) win();
}

function ouch(o) {
  G.booms.push({ x: o.x, y: o.y, z: o.z, t: 0 }); SFX.boom();
  if (G.hurt > 0) return;
  G.hull--; G.hurt = 1.2; G.shake = 0.4; SFX.hurt();
  hint(G.hull > 1 ? "Ow! That rattled the whole ship." : "Careful! One more hit and A.R.P.F. takes the controls.");
}

// ---------- drawing ----------
function proj(x, y, z) { return [W / 2 + x * F / z, VH / 2 + y * F / z]; }
function drawAt(img, x, y, z, worldW) {
  const [sx, sy] = proj(x, y, z);
  const w = worldW * F / z, h = w * img.height / img.width;
  ctx.drawImage(img, sx - w / 2, sy - h / 2, w, h);
}
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
function skyAt(p) {
  // light sky blue, to poster blue, to night, to the deep dark of space
  const stops = [PAL.B, PAL.E, PAL.A, PAL.N, PAL.D];
  const f = Math.min(0.999, p) * (stops.length - 1), i = Math.floor(f);
  return mix(stops[i], stops[i + 1], f - i);
}

function render() {
  const prog = G.alt;
  const shx = G.shake > 0 ? (Math.random() - 0.5) * 10 : 0, shy = G.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  ctx.save(); ctx.translate(shx, shy);
  ctx.fillStyle = skyAt(prog); ctx.fillRect(-10, -10, W + 20, VH + 20);
  // stars come out once the air thins
  if (prog > 0.55) {
    ctx.fillStyle = PAL.S; ctx.globalAlpha = Math.min(1, (prog - 0.55) * 3);
    for (const p of G.specks) {
      const [x1, y1] = proj(p.x, p.y, p.z), [x0, y0] = proj(p.x, p.y, p.z + 0.5);
      ctx.strokeStyle = PAL.S; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(x0), Math.round(y0)); ctx.lineTo(Math.round(x1), Math.round(y1)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else {
    // rushing air: pale streaks
    ctx.strokeStyle = "rgba(246,239,220,.35)"; ctx.lineWidth = 1;
    for (const p of G.specks) {
      const [x1, y1] = proj(p.x, p.y, p.z), [x0, y0] = proj(p.x, p.y, p.z + 1.2);
      ctx.beginPath(); ctx.moveTo(Math.round(x0), Math.round(y0)); ctx.lineTo(Math.round(x1), Math.round(y1)); ctx.stroke();
    }
  }
  // near the top of the climb, the curve of the Earth below you
  if (prog > 0.72) {
    const k = (prog - 0.72) / 0.28, cy = VH + 900 - k * 140;
    ctx.fillStyle = PAL.B; ctx.beginPath(); ctx.arc(W / 2, cy, 930, 0, 7); ctx.fill();   // the thin glowing air
    ctx.fillStyle = PAL.E; ctx.beginPath(); ctx.arc(W / 2, cy, 922, 0, 7); ctx.fill();
    ctx.fillStyle = PAL.W;
    for (let i = 0; i < 7; i++) {                                // clouds sitting on the curve
      const x = 60 + i * 87, y = cy - Math.sqrt(922 * 922 - (x - W / 2) ** 2) + 10 + (i % 2) * 6;
      ctx.beginPath(); ctx.ellipse(x, y, 26, 5, 0, 0, 7); ctx.fill();
    }
  }
  const things = [
    ...G.clouds.map((c) => ({ z: c.z, d: () => { ctx.globalAlpha = Math.min(1, c.z / 4); drawAt(SPR["cloud" + c.v], c.x, c.y, c.z, 2.6); ctx.globalAlpha = 1; } })),
    ...G.jets.map((j) => ({ z: j.z, d: () => drawAt(SPR.jet, j.x, j.y, j.z, 1.1) })),
    ...G.missiles.map((m) => ({ z: m.z, d: () => {
      drawAt(SPR.missile, m.x, m.y, m.z, 0.42);
      const [sx, sy] = proj(m.x, m.y, m.z);                       // a blinking light, so you can see them coming
      if (Math.floor(G.t * 8) % 2) { ctx.fillStyle = PAL.R; ctx.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3); }
    } })),
    ...G.booms.map((b) => ({ z: b.z, d: () => drawAt(SPR["boom" + Math.min(2, Math.floor(b.t / 0.2))], b.x, b.y, b.z, 1) })),
  ].sort((a, b) => b.z - a.z);
  for (const t of things) if (t.z > SZ) t.d();
  const s = G.ship, [sx, sy] = proj(s.x, s.y, SZ);
  if (!(G.hurt > 0 && Math.floor(G.t * 12) % 2)) {
    const img = SPR["ship" + (Math.floor(G.t * (G.boosting ? 20 : 10)) % 2)];
    ctx.save(); ctx.translate(Math.round(sx), Math.round(sy)); ctx.rotate(s.vx * 0.08);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    if (G.boosting) { ctx.fillStyle = PAL.S; ctx.fillRect(-3, 26, 7, 14 + Math.random() * 10); ctx.fillStyle = PAL.Y; ctx.fillRect(-1, 30, 3, 16); }
    ctx.restore();
  }
  for (const t of things) if (t.z <= SZ) t.d();
  if (G.hurt > 0.9) { ctx.fillStyle = "rgba(200,66,59,.35)"; ctx.fillRect(-10, -10, W + 20, VH + 20); }
  ctx.restore();
  hud(prog);
}

function hud(prog) {
  ctx.fillStyle = PAL.K; ctx.fillRect(0, VH, W, H - VH);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < G.hull ? PAL.R : PAL.Z; ctx.fillRect(12 + i * 18, VH + 12, 14, 16);
    ctx.fillStyle = i < G.hull ? PAL.P : PAL.l; ctx.fillRect(12 + i * 18, VH + 12, 14, 3);
  }
  // the climb: ground to orbit
  const bx = 120, bw = 260;
  ctx.fillStyle = PAL.Z; ctx.fillRect(bx, VH + 18, bw, 4);
  ctx.fillStyle = PAL.B; ctx.fillRect(bx, VH + 18, bw * prog, 4);
  ctx.fillStyle = PAL.L; ctx.fillRect(bx + bw * prog - 4, VH + 13, 8, 14);
  ctx.fillStyle = PAL.Y; ctx.font = "12px monospace";
  ctx.fillText("SILO", bx - 2, VH + 36); ctx.fillText("ORBIT", bx + bw - 30, VH + 36);
  // the fusion gauge
  ctx.font = "14px monospace"; ctx.fillStyle = G.boosting ? PAL.S : PAL.Y;
  ctx.fillText("FUSION", 400, VH + 25);
  ctx.fillStyle = PAL.Z; ctx.fillRect(462, VH + 14, 160, 12);
  ctx.fillStyle = G.fuel > 0.25 ? PAL.Y : PAL.R; ctx.fillRect(462, VH + 14, 160 * G.fuel, 12);
}

// ---------- start, win, lose ----------
const cardEl = document.getElementById("card");
function card(html, buttons) {
  cardEl.innerHTML = html + `<div class="row">${buttons.map((b, i) => `<button id="cb${i}" class="${i ? "alt" : ""}">${b[0]}</button>`).join("")}</div>`;
  cardEl.style.display = "flex";
  buttons.forEach((b, i) => { document.getElementById("cb" + i).onclick = () => { cardEl.style.display = "none"; b[1](); }; });
}
let hintT = 0;
function hint(t) { document.getElementById("hint").textContent = t; hintT = 5; }

function start() {
  newGame(); G.on = true;
  hint("Steer with the arrows. Dodge the jets and missiles. Hold Space for FULL FUSION.");
}
function win() {
  G.done = true; G.on = false;
  const how = G.hull >= 5 ? "Not a scratch." : G.hull >= 3 ? "A few dents." : "That was close.";
  card(`<p class="small">The jets fall behind like stones. Below you, the Earth: so blue.</p>
        <h1 style="font-size:44px">ZOMBIES OF TOMORROW</h1>
        <p>${how} Hull ${G.hull} of 5.</p>
        <p class="small">${NAME ? NAME + ", y" : "Y"}ou write the title in your notebook. A.R.P.F.'s star map draws a line to HOMETOWN.<br>End of round one.</p>`,
    [["On to the Harvest Ring", () => { location.href = "flight.html"; }], ["Launch again", start], ["Play round one again", () => { location.href = "index.html"; }]]);
}
function lose() {
  G.on = false;
  card(`<h1>A.R.P.F. TAKES THE CONTROLS</h1>
        <p>"Hold on! *BZZT* I have flown this ship in my head ten thousand times!"</p>
        <p class="small">It drops you back down the silo, very gently. "Again? You were nearly there."</p>`,
    [["Launch again", start], ["Back to round one", () => { location.href = "index.html"; }]]);
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
card(`<h1>LIFTOFF</h1>
      <p>Ship Seven climbs out of the silo on a pillar of fire.</p>
      <p>Somebody has noticed. Somebody thinks you're an attack.</p>
      <p class="small">Dodge the jets and missiles. Hold Space (or Boost) for FULL FUSION.</p>`,
  [["Go", start], ["Back to round one", () => { location.href = "index.html"; }]]);
requestAnimationFrame(frame);
