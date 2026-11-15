// Phone controls for Zombies of Tomorrow, the same as the other Rubber Duck
// games (decided 15 Nov: every game gets the same level of phone controls).
// A round stick on the left, like Bread's and Math Force's, and round red
// buttons on the right. Upright, the page looks like a Game Boy; sideways, like
// a Switch. The buttons press the same keys the keyboard does (data-code), so
// the games need no separate touch code beyond reading TOUCH.stick.
"use strict";
const TOUCH = { stick: { x: 0, y: 0, on: false, id: null } };
{
  const st = document.getElementById("stick"), knob = document.getElementById("knob");
  if (st) {
    const s = TOUCH.stick;
    const upd = (e) => {
      const r = st.getBoundingClientRect(), max = r.width * 0.42;
      let x = (e.clientX - r.left - r.width / 2) / max, y = (e.clientY - r.top - r.height / 2) / max;
      const l = Math.hypot(x, y);
      if (l > 1) { x /= l; y /= l; }
      s.x = x; s.y = y; knob.style.transform = `translate(${x * max * 0.7}px,${y * max * 0.7}px)`;
    };
    st.addEventListener("pointerdown", (e) => { e.preventDefault(); s.id = e.pointerId; s.on = true; try { st.setPointerCapture(e.pointerId); } catch (err) { /* old browsers */ } upd(e); });
    st.addEventListener("pointermove", (e) => { if (e.pointerId === s.id) upd(e); });
    const end = (e) => { if (e.pointerId !== s.id) return; s.id = null; s.on = false; s.x = s.y = 0; knob.style.transform = ""; };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => st.addEventListener(ev, end));
  }
  // each round button holds down a keyboard key while a thumb is on it
  document.querySelectorAll("[data-code]").forEach((b) => {
    const code = b.dataset.code;
    const send = (type) => window.dispatchEvent(new KeyboardEvent(type, { code, key: code === "Space" ? " " : "", bubbles: true }));
    b.addEventListener("pointerdown", (e) => { e.preventDefault(); b.classList.add("on"); send("keydown"); });
    const up = () => { if (!b.classList.contains("on")) return; b.classList.remove("on"); send("keyup"); };
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => b.addEventListener(ev, up));
  });
  // A thumb on the stick and a thumb on a button look like a pinch to iPhone
  // Safari, and quick taps look like a double tap, so the page zoomed mid play
  // in Bread and Rodeo. Block both while a card or panel isn't open.
  const stop = (e) => { if (e.cancelable) e.preventDefault(); };
  ["gesturestart", "gesturechange"].forEach((ev) => document.addEventListener(ev, stop, { passive: false }));
  document.addEventListener("touchmove", (e) => { if (e.touches.length > 1) stop(e); }, { passive: false });
  document.querySelectorAll("#stick,[data-code]").forEach((el) => el.addEventListener("touchstart", stop, { passive: false }));
  let lastEnd = 0;
  document.addEventListener("touchend", (e) => {
    const now = performance.now();
    if (now - lastEnd < 350 && !e.target.closest("input,button:not([data-code]),a")) stop(e);
    lastEnd = now;
  }, { passive: false });
}
