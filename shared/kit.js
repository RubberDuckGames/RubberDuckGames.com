// The Rubber Duck Games kit: the parts every game shares. Decided 20 Nov: a
// new game starts from these instead of writing its own, and each part takes
// options, so a game changes only what it needs (anything it passes replaces
// the default). A fix made here reaches every game at once.
//
//   const tone = RDG.sound({ on: () => S.sound, type: 'sine', vol: .06 });
//   const stick = RDG.stick('#pad', '#knob');          // stick.x, stick.y, stick.on
//   RDG.noZoom(() => playing, ['#pad', '#goBtn']);
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

  return { sound, stick, noZoom, pad, rpc, played };
})();
