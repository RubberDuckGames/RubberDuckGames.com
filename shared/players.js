// Shared players for every game on the site. Decided 28 Oct: one player list
// for all the games, so kids on one computer each have their own Bread and
// their own Math Force, and nobody sets themselves up once per game.
//
// The list is the one Treasure Trail already keeps (localStorage key
// "treasure-trail", .players). This file only adds a permanent id to each
// player and leaves the rest of Treasure Trail's save as it is; Treasure Trail
// fills in its own fields for a player added here the next time it loads.
// Each game keeps one save per player under "<game>:<player id>". The id is
// also what a future database would file each player's saves under (#14).
const Players = (() => {
  const TT = 'treasure-trail';
  const BUDDIES = ['🐈‍⬛', '🐕', '🦆', '🦹', '🦸', '🚂', '⛵', '🚀', '🦖', '🐉', '🦉', '🐙', '🤖', '🦊', '🐢', '👾'];
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const newId = () => Math.random().toString(36).slice(2, 10);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Same three starting players as Treasure Trail, so a family that opens Bread
  // first sees the same list Treasure Trail will show.
  function list() {
    let s = read(TT), changed = false;
    if (!s || !Array.isArray(s.players)) {
      s = Object.assign(s || { sound: true, current: null }, { players: [['Player 1', '🐈‍⬛'], ['Player 2', '🐕'], ['Player 3', '🦆']].map(([name, buddy]) => ({ name, buddy, age: null, setup: false })) });
      changed = true;
    }
    s.players.forEach(p => { if (!p.id) { p.id = newId(); changed = true; } });
    if (changed) write(TT, s);
    return s.players;
  }
  function add(name, buddy) {
    list();
    const s = read(TT), p = { id: newId(), name, buddy, age: null, setup: true };
    s.players.push(p); write(TT, s);
    return p;
  }
  const find = id => list().find(p => p.id === id) || null;

  // A game's save from before players existed goes to whoever picks themselves
  // first in that game, so nothing that was already earned is lost.
  function load(game, id) {
    const k = `${game}:${id}`;
    if (localStorage.getItem(k) === null && localStorage.getItem(game) !== null) {
      try { localStorage.setItem(k, localStorage.getItem(game)); localStorage.removeItem(game); } catch (e) { }
    }
    return read(k);
  }
  const save = (game, id, data) => write(`${game}:${id}`, data);

  // "Who's playing?": one button per player, and Add a player. The game styles
  // .btn and .row; the layout of the list and the form is here.
  const css = document.createElement('style');
  css.textContent = `.who-list{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin:.75rem 0}
.who-list .bud{font-size:1.4em;margin-right:.35em;vertical-align:middle}
.who-add{display:grid;gap:.6rem;margin:.75rem 0;text-align:left}
.who-add label{font-weight:700}
.who-add input{display:block;width:100%;margin-top:.3rem;font:inherit;font-size:1.1rem;padding:.5rem .7rem;border:3px solid currentColor;border-radius:.5rem}
.who-buds{display:flex;flex-wrap:wrap;gap:.35rem}
.who-buds button{font-size:1.5rem;line-height:1;padding:.35rem;border:3px solid transparent;border-radius:.5rem;background:none;cursor:pointer}
.who-buds button[aria-pressed="true"]{border-color:currentColor}
.who-add .row{justify-content:flex-end}`;
  document.head.appendChild(css);

  function mount(el, onPick) {
    const showList = () => {
      el.innerHTML = `<div class="who-list">${list().map(p => `<button class="btn who" data-id="${esc(p.id)}"><span class="bud" aria-hidden="true">${esc(p.buddy)}</span>${esc(p.name)}</button>`).join('')}<button class="btn" data-add>➕ Add a player</button></div>`;
    };
    const showAdd = () => {
      let buddy = BUDDIES[3];
      el.innerHTML = `<form class="who-add"><label>Name<input name="n" maxlength="20" autocomplete="off" required></label><div><b>Pick a buddy</b><div class="who-buds">${BUDDIES.map(b => `<button type="button" data-b="${b}" aria-pressed="${b === buddy}">${b}</button>`).join('')}</div></div><div class="row"><button type="button" class="btn" data-cancel>Cancel</button><button class="btn go">Save</button></div></form>`;
      const f = el.querySelector('form');
      f.n.focus();
      f.querySelector('.who-buds').onclick = e => { const b = e.target.closest('[data-b]'); if (!b) return; buddy = b.dataset.b; f.querySelectorAll('[data-b]').forEach(x => x.setAttribute('aria-pressed', x === b)); };
      f.querySelector('[data-cancel]').onclick = showList;
      f.onsubmit = e => { e.preventDefault(); const n = f.n.value.trim(); if (!n) return; onPick(add(n, buddy)); };
    };
    el.onclick = e => {
      const who = e.target.closest('[data-id]'); if (who) return onPick(find(who.dataset.id));
      if (e.target.closest('[data-add]')) showAdd();
    };
    showList();
  }

  return { list, add, find, load, save, mount, esc };
})();
