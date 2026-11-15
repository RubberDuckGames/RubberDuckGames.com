// A Menu button next to "All games" in every game. Decided 14 Nov: the only
// way out of a game was "All games", back to the home page, so getting to the
// game's own start (new game, another save file, another level) meant leaving
// and coming back in. Every game already opens on its start screen and keeps
// its saves in localStorage, so Menu reloads the game at its plain address.
// The query is dropped on purpose: Conquest's ?game=<id> would rejoin the
// online game instead of showing the start card.
// It asks first, in a dialog with the page's own look, because a reload stops
// whatever is being played and a stray tap shouldn't do that.
(() => {
  const add = () => {
    const home = document.querySelector('#backLink, a.homelink, a.pill[href="../"]');
    if (!home || document.getElementById('menuBtn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'menuBtn';
    btn.className = 'pill';
    btn.textContent = 'Menu';
    btn.setAttribute('aria-haspopup', 'dialog');
    home.after(btn);
    // On a phone held upright the bar has no room for another button: at 375
    // px Math Force, Rodeo and Tugboat already ran off the edge. There the
    // home link shows only its arrow, the way Treasure Trail's already does.
    if (home.textContent.trim() === '← All games') {
      home.setAttribute('aria-label', 'All games');
      home.innerHTML = '<span aria-hidden="true">←</span><span class="rdgLong" aria-hidden="true"> All games</span>';
    }

    const dlg = document.createElement('dialog');
    dlg.id = 'menuDlg';
    dlg.setAttribute('aria-labelledby', 'menuDlgText');
    dlg.innerHTML =
      '<p id="menuDlgText">Go to the start of this game? What you\'re playing now stops. Your saved games stay.</p>' +
      '<div class="menuDlgRow"><button type="button" class="btn" data-act="cancel">Cancel</button>' +
      '<button type="button" class="btn" data-act="go">Go to start</button></div>';
    const css = document.createElement('style');
    css.textContent =
      '#menuDlg{max-width:min(26rem,calc(100vw - 2rem));padding:1.2rem;border:4px solid var(--line,#222);' +
      'background:var(--panel,#fffdf7);color:inherit;font:inherit;box-shadow:.4rem .4rem 0 rgba(0,0,0,.35)}' +
      '#menuDlg::backdrop{background:rgba(0,0,0,.55)}' +
      '#menuDlg p{margin:0 0 1rem;line-height:1.5}' +
      '.menuDlgRow{display:flex;gap:.6rem;justify-content:flex-end;flex-wrap:wrap}' +
      '#menuDlg button{cursor:pointer}' +
      '@media (max-width:30rem){.rdgLong{display:none}}' +
      '#menuDlg button:focus-visible{outline:.2rem solid currentColor;outline-offset:.2rem}';
    document.head.append(css);
    document.body.append(dlg);

    btn.addEventListener('click', () => {
      dlg.showModal();
      dlg.querySelector('[data-act="cancel"]').focus();
    });
    dlg.addEventListener('click', e => {
      const act = e.target.closest('button') && e.target.closest('button').dataset.act;
      if (act === 'go') location.href = location.pathname;
      else if (act === 'cancel' || e.target === dlg) dlg.close();
    });
    // The games listen for keys on the whole page (Space is a bark, a horn or
    // GO). While the dialog is open, keys belong to it.
    window.addEventListener('keydown', e => { if (dlg.open) e.stopPropagation(); }, true);
    window.addEventListener('keyup', e => { if (dlg.open) e.stopPropagation(); }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();
})();
