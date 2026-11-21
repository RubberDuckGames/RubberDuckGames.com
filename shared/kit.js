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

  return { sound, stick, noZoom };
})();
