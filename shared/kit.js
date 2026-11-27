// The Rubber Duck Games kit: the parts every game shares. Decided 20 Nov: a
// new game starts from these instead of writing its own, and each part takes
// options, so a game changes only what it needs (anything it passes replaces
// the default). A fix made here reaches every game at once.
//
//   const tone = RDG.sound({ on: () => S.sound, type: 'sine', vol: .06 });
//   const stick = RDG.stick('#pad', '#knob');          // stick.x, stick.y, stick.on
//   RDG.noZoom(() => playing, ['#pad', '#goBtn']);
//   const img = RDG.sprite(ROWS, COLORS, { flip: true }); // pixel art from rows of letters
//   RDG.text(ctx, '$250', x, y, '#fff');                // the 3 x 5 pixel font
const RDG = (() => {
  const el = q => typeof q === 'string' ? document.querySelector(q) : q;

  // ---------- Sound ----------
  // Chiptune beeps, no files. Returns tone(f, d, type, when, vol, to): a note
  // of f hertz for d seconds, sliding to `to` if given. Phones and Safari start
  // the sound engine paused and pause it again after the screen locks, so every
  // tap or key wakes it (found in Treasure Trail, 22 Oct).
  //   on:   asked before each note, so the game's sound button is obeyed
  //   d, type, vol: the game's own defaults for a note
  function sound(opt = {}) {
    const o = { on: () => true, d: .1, type: 'square', vol: .05, ...opt };
    let ac;
    const wake = () => {
      if (!o.on()) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state !== 'running') ac.resume();
      } catch (e) { }
    };
    ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, wake, true));
    function tone(f, d = o.d, type = o.type, when = 0, vol = o.vol, to) {
      if (!o.on()) return;
      try {
        wake();
        const t0 = ac.currentTime + when, osc = ac.createOscillator(), g = ac.createGain();
        osc.type = type; osc.frequency.setValueAtTime(f, t0); if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + d);
        g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
        osc.connect(g).connect(ac.destination); osc.start(t0); osc.stop(t0 + d + .02);
      } catch (e) { }
    }
    tone.wake = wake;
    return tone;
  }

  // ---------- Stick ----------
  // A round thumb stick for touch screens. Returns { x, y, on, id, letGo }:
  // x and y run -1 to 1 the way it's pushed, and are 0 when no thumb is on it.
  // letGo() drops the thumb, e.g. when a card opens over the game.
  //   reach:  how far from the middle is a full push, as a share of the width
  //   travel: how far the knob moves, as a share of reach
  function stick(pad, knob, opt = {}) {
    const o = { reach: .42, travel: .7, ...opt };
    pad = el(pad); knob = el(knob);
    const s = { x: 0, y: 0, on: false, id: null };
    const upd = e => {
      const r = pad.getBoundingClientRect(), max = r.width * o.reach;
      if (!max) return;   // hidden (no size), so there's nothing to push
      let x = (e.clientX - r.left - r.width / 2) / max, y = (e.clientY - r.top - r.height / 2) / max;
      const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
      s.x = x; s.y = y; knob.style.transform = `translate(${x * max * o.travel}px,${y * max * o.travel}px)`;
    };
    s.letGo = () => {
      try { if (s.id != null) pad.releasePointerCapture(s.id); } catch (e) { }
      s.id = null; s.on = false; s.x = s.y = 0; knob.style.transform = '';
    };
    pad.addEventListener('pointerdown', e => { e.preventDefault(); s.id = e.pointerId; s.on = true; try { pad.setPointerCapture(e.pointerId); } catch (err) { } upd(e); });
    pad.addEventListener('pointermove', e => { if (e.pointerId === s.id) upd(e); });
    const end = e => { if (e.pointerId === s.id) s.letGo(); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => pad.addEventListener(ev, end));
    return s;
  }

  // ---------- No zoom while playing ----------
  // A thumb on the stick and a thumb on a button look like a pinch to iPhone
  // Safari, and quick taps look like a double tap, so the page zoomed mid play
  // (Bread and Rodeo, 31 Oct to 2 Nov). Decided 15 Nov: every game blocks it the
  // same way, only while playing, so cards and start screens can still be zoomed.
  //   playing: asked on each touch
  //   targets: the stick and buttons the thumbs rest on
  function noZoom(playing, targets = []) {
    const stop = e => { if (playing() && e.cancelable) e.preventDefault(); };
    ['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, stop, { passive: false }));
    document.addEventListener('touchmove', e => { if (e.touches.length > 1) stop(e); }, { passive: false });
    targets.forEach(q => { const t = el(q); if (t) t.addEventListener('touchstart', stop, { passive: false }); });
    let lastEnd = 0;
    document.addEventListener('touchend', e => { const now = performance.now(); if (now - lastEnd < 350) stop(e); lastEnd = now; }, { passive: false });
  }

  // ---------- Game controller ----------
  // A Switch, Xbox or PlayStation controller (anything the browser reads as a
  // standard gamepad). Decided 20 Nov: it presses the keys the game already
  // knows, so a game only says which key each button is; nothing in the game's
  // own controls changes. Buttons are named by where they sit, Xbox style:
  // a bottom, b right, x left, y top (on a Switch controller the bottom button
  // is printed B). The cross pad is the arrow keys.
  //
  //   RDG.pad({ a: ' ', b: 'b', start: 'Enter', stick });
  //
  //   a, b, x, y, l, r, zl, zr, select, start: the key each button presses
  //   stick:    the game's RDG.stick; the left thumbstick steers it smoothly.
  //             Without one, the thumbstick presses the arrow keys too.
  //   deadzone: how far the thumbstick moves before it counts
  //   menu:     says when a card or menu is open; by default, when a .card or
  //             dialog shows
  //
  // On a card or menu, the cross pad moves between its buttons and A presses
  // the one picked, unless the game does that itself.
  const BUTTON = { a: 0, b: 1, x: 2, y: 3, l: 4, r: 5, zl: 6, zr: 7, select: 8, start: 9, up: 12, down: 13, left: 14, right: 15 };
  const FOCUSABLE = 'button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])';
  function pad(opt = {}) {
    const shown = e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed';
    const o = {
      a: ' ', start: 'Enter', up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', stick: null, deadzone: .25,
      menu: () => [...document.querySelectorAll('.card, dialog[open], [role="dialog"]')].some(shown),
      ...opt,
    };
    const held = {};      // key -> true while a button or the thumbstick holds it
    let steering = false;  // the thumbstick is moving the game's stick
    function moveFocus(step) {
      const at = document.activeElement;
      const box = (at && at !== document.body && at.closest('.card, dialog, [role="dialog"]')) ||
        [...document.querySelectorAll('.card, dialog, [role="dialog"]')].filter(shown).pop() || document.body;
      const list = [...box.querySelectorAll(FOCUSABLE)].filter(shown);
      if (!list.length) return;
      const i = list.indexOf(at);
      list[i < 0 ? 0 : (i + step + list.length) % list.length].focus();
    }
    function send(type, key) {
      const before = document.activeElement;
      const e = new KeyboardEvent(type, { key, bubbles: true, cancelable: true });
      (before || document.body).dispatchEvent(e);
      if (type !== 'keydown') return;
      // What a real key would have done, if the game didn't use it. On a card
      // the controller has no Tab key, so it also steps in when the game took
      // the key but did nothing with the buttons (Math Force's start card uses
      // the arrows for walking, even under the card; found 20 Nov).
      const at = document.activeElement;
      const free = !e.defaultPrevented || (o.menu() && at === before);
      if (!free) return;
      if (key === ' ' || key === 'Enter') {
        if (at && at.matches('button, a[href]')) at.click();
        else if (o.menu()) moveFocus(1);   // nothing picked yet (Rodeo's events): pick the first
      }
      if (key === 'ArrowDown' || key === 'ArrowRight') moveFocus(1);
      if (key === 'ArrowUp' || key === 'ArrowLeft') moveFocus(-1);
    }
    function hold(key, down) {
      if (!key || !!held[key] === down) return;
      held[key] = down;
      send(down ? 'keydown' : 'keyup', key);
    }
    function poll() {
      const gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(g => g && g.connected);
      if (gp) {
        const want = {};
        for (const [name, i] of Object.entries(BUTTON)) {
          const b = gp.buttons[i];
          if (o[name] && b && (b.pressed || b.value > .5)) want[o[name]] = true;
        }
        const lx = gp.axes[0] || 0, ly = gp.axes[1] || 0, far = Math.hypot(lx, ly) > o.deadzone;
        const s = o.stick;
        if (s && s.id == null) {           // a thumb on the touch stick wins
          if (far) { const l = Math.max(1, Math.hypot(lx, ly)); s.x = lx / l; s.y = ly / l; s.on = true; steering = true; }
          else if (steering) { s.x = s.y = 0; s.on = false; steering = false; }
        } else if (!s && far) {
          if (lx < -.5) want[o.left] = true;
          if (lx > .5) want[o.right] = true;
          if (ly < -.5) want[o.up] = true;
          if (ly > .5) want[o.down] = true;
        }
        for (const k of new Set([...Object.keys(held), ...Object.keys(want)])) hold(k, !!want[k]);
      }
      requestAnimationFrame(poll);
    }
    let started = false;
    const start = () => { if (!started) { started = true; requestAnimationFrame(poll); } };
    addEventListener('gamepadconnected', start);
    if ([...(navigator.getGamepads ? navigator.getGamepads() : [])].some(g => g)) start();
    // a controller unplugged mid-press lets go of everything
    addEventListener('gamepaddisconnected', () => { Object.keys(held).forEach(k => hold(k, false)); if (o.stick && steering) { o.stick.x = o.stick.y = 0; o.stick.on = false; steering = false; } });
  }

  // ---------- Pixel sprites ----------
  // Moved here 22 Nov from Bread the Corgi, when The Mighty Pepper was the
  // second game to need it. A sprite is written out as rows of letters, one
  // letter a pixel, '.' see-through, and `colors` says which colour each
  // letter is. It gets a 1-pixel outline round its edge, the 8-bit look
  // (Bread, 28 Oct: smooth shapes still looked fuzzy). Returns a small canvas,
  // kept, so drawing the same sprite again costs nothing. The cache goes by
  // the rows and colours objects themselves, so build them once, not per frame.
  //   flip: mirrored left to right; outline: false for none; line: its colour
  const sprites = new WeakMap(), colorIds = new WeakMap();
  let nextColorId = 1;
  function sprite(rows, colors, opt = {}) {
    const o = { flip: false, outline: true, line: '#2a1a10', ...opt };
    if (!colorIds.has(colors)) colorIds.set(colors, nextColorId++);
    const key = colorIds.get(colors) + '|' + o.flip + o.outline + o.line;
    let byKey = sprites.get(rows);
    if (!byKey) sprites.set(rows, byKey = new Map());
    if (byKey.has(key)) return byKey.get(key);
    const m = o.outline ? 1 : 0;
    const w = Math.max(...rows.map(r => r.length)) + 2 * m, h = rows.length + 2 * m;
    const at = (x, y) => (rows[y - m] || '')[x - m] || '.';
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let col = null; const ch = at(x, y);
      if (ch !== '.') col = colors[ch];
      else if (o.outline && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => at(x + a, y + b) !== '.')) col = o.line;
      if (col) { g.fillStyle = col; g.fillRect(o.flip ? w - 1 - x : x, y, 1, 1); }
    }
    byKey.set(key, c);
    return c;
  }

  // ---------- Painted tiles ----------
  // tile(key, w, h, fn) paints a ground tile once and keeps it (Bread's 16-bit
  // backgrounds, 15 Nov). fn(set, fill, rand) draws it: set(x, y, colour) is a
  // pixel, fill(x, y, w, h, colour) a block, and rand() is seeded by the key,
  // so the same tile always comes out the same.
  const tiles = new Map();
  function tile(key, w, h, fn) {
    if (tiles.has(key)) return tiles.get(key);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const set = (x, y, col) => { if (x < 0 || y < 0 || x >= w || y >= h) return; g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const fill = (x, y, a, b, col) => { g.fillStyle = col; g.fillRect(x, y, a, b); };
    let n = [...key].reduce((a, ch) => a * 31 + ch.charCodeAt(0) | 0, 7) >>> 0 || 1;
    fn(set, fill, () => (n = n * 16807 % 2147483647) / 2147483647);
    tiles.set(key, c);
    return c;
  }

  // ---------- Pixel font ----------
  // A 3 x 5 pixel font for anything stamped, printed or painted in a scene.
  // Moved here 26 Nov from Barn Secrets, when The Flip Shop was the second game
  // to need it (its price tags and signs). text(g, s, x, y, colour, k) draws s
  // on the 2d context g, k pixels to a font pixel; textWidth(s, k) is how wide.
  const FONT = {};
  ('0:111101101101111 1:010110010010111 2:111001111100111 3:111001011001111 4:101101111001001 5:111100111001111 6:111100111101111 7:111001010010010 8:111101111101111 9:111101111001111 ' +
    'A:010101111101101 B:110101110101110 C:011100100100011 D:110101101101110 E:111100110100111 F:111100110100100 G:011100101101011 H:101101111101101 I:111010010010111 J:001001001101010 ' +
    'K:101101110101101 L:100100100100111 M:101111111101101 N:110101101101101 O:010101101101010 P:110101110100100 Q:010101101110011 R:110101110101101 S:011100010001110 T:111010010010010 ' +
    'U:101101101101111 V:101101101101010 W:101101111111101 X:101101010101101 Y:101101010010010 Z:111001010100111 $:011100010001110 .:000000000000010 ¢:010111100111010 -:000000111000000 ' +
    '+:000010111010000 =:000111000111000 *:000101010101000 !:010010010000010 ?:110001010000010 /:001001010100100 ,:000000000010100 \':010010000000000 ::000010000010000')
    .split(' ').forEach(p => { FONT[p[0]] = p.slice(2); });
  function text(g, s, x, y, c, k = 1) {
    let cx = Math.round(x); y = Math.round(y);
    g.fillStyle = c;
    for (const ch of String(s).toUpperCase()) {
      const gl = FONT[ch];
      if (gl) for (let i = 0; i < 15; i++) if (gl[i] === '1') g.fillRect(cx + (i % 3) * k, y + ((i / 3) | 0) * k, k, k);
      if (ch === '$') { g.fillRect(cx + k, y - k, k, k); g.fillRect(cx + k, y + 5 * k, k, k); }   // the stem, so it isn't an S
      cx += 4 * k;
    }
  }
  const textWidth = (s, k = 1) => String(s).length * 4 * k - k;

  // ---------- The studio database ----------
  // Decided 22 Nov: every game uses the one shared Supabase project
  // (RubberDuckGames; tables in db/). The publishable key is public by
  // design: browsers can only call the functions the database allows.
  // rpc(fn, args) calls one. Every request gives up after 8 seconds: found
  // in Conquest (10 Nov), where a phone that slept mid-request never got an
  // answer and stopped checking for turns.
  const DB_URL = 'https://hybjirpyeyomedhluvvl.supabase.co';
  const DB_KEY = 'sb_publishable_3n3_7kk6BSLnDQ1_FLdOHA_xyXEJm8P';
  async function rpc(fn, body = {}) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(`${DB_URL}/rest/v1/rpc/${fn}`, { method: 'POST', signal: ctl.signal, headers: { apikey: DB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).finally(() => clearTimeout(tm));
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.message || 'net');
    return j;
  }

  // Counts one open of this game for today (db/0002_plays.sql): the game's
  // folder name, the day and a number. Every game
  // that loads the kit is counted by itself, once per page load, and only on
  // rubberduckgames.com, so previews and a file opened from the disk aren't.
  function played(game = location.pathname.split('/').filter(Boolean)[0]) {
    if (played.done || !game || location.hostname !== 'rubberduckgames.com') return;
    played.done = true;
    rpc('play_add', { p_game: game }).catch(() => { });
  }
  played();

  return { sound, stick, noZoom, pad, sprite, tile, text, textWidth, rpc, played };
})();
