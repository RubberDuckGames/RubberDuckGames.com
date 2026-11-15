// No long-press menu in the games. Decided 14 Nov: on an iPhone, a finger held
// on the game (Bread walks while you hold the world) opened Chrome's long-press
// menu, with Ask Gemini in it, again and again in play. A page can't switch
// Gemini off, but it can stop that menu from opening. The text styles alone
// were already on Bread's body and the menu still came, so this covers every
// element and cancels the menu itself, everywhere but boxes you type in.
// A canvas marked data-hold also cancels the touch start, which is what stops
// iOS reading a held finger as a long press. Only canvases that listen with
// pointer events get it: cancelling the touch start also cancels the mouse
// events and click a tap makes, which Conquest's map and Math Force's maze use.
(() => {
  const typing = el => el && el.closest && el.closest('input, textarea, [contenteditable]');
  const css = document.createElement('style');
  css.textContent = '*:not(input):not(textarea){-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}img,canvas{-webkit-user-drag:none}';
  document.head.append(css);
  document.addEventListener('contextmenu', e => { if (!typing(e.target)) e.preventDefault(); });
  document.addEventListener('selectstart', e => { if (!typing(e.target)) e.preventDefault(); });
  document.addEventListener('touchstart', e => { if (e.target.closest && e.target.closest('canvas[data-hold]')) e.preventDefault(); }, { passive: false });
})();
