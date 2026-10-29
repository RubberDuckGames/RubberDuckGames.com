// Save files for the console-style games (Bread, Math Force). Decided 29 Oct:
// like a Nintendo game, each game has three save files, and anyone can pick
// any file. Copy and Erase work the way they do on a console. This replaced a
// shared player list (28 Oct): on a phone, a save from before players existed
// went to whoever picked first, and there was no easy way to hand it to the
// right kid or start over. Treasure Trail keeps its own players, because a
// kid's spelling list and learning levels belong to that kid.
//
// Each file is two things in localStorage: the game's save under
// "<game>:file<n>", and its name and buddy in the list "<game>:files".
const SaveFiles = (() => {
  const BUDDIES = ['🐈‍⬛', '🐕', '🦆', '🦹', '🦸', '🚂', '⛵', '🚀', '🦖', '🐉', '🦉', '🐙', '🤖', '🦊', '🐢', '👾'];
  const N = 3;
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // The first time, the saves from the player list become files, named after
  // the player they belonged to (then a save from before players, if any).
  // The old keys are left where they are, so nothing is thrown away.
  function list(game) {
    let files = read(game + ':files');
    if (Array.isArray(files) && files.length === N) return files;
    files = Array(N).fill(null);
    let i = 0;
    const players = (read('treasure-trail') || {}).players || [];
    for (const p of players) {
      const d = p.id && raw(`${game}:${p.id}`);
      if (i < N && d) { try { localStorage.setItem(`${game}:file${i + 1}`, d); } catch (e) { } files[i++] = { name: p.name, buddy: p.buddy }; }
    }
    const old = raw(game);
    if (i < N && old) { try { localStorage.setItem(`${game}:file${i + 1}`, old); } catch (e) { } files[i++] = { name: `File ${i}`, buddy: '🐕' }; }
    write(game + ':files', files);
    return files;
  }
  const meta = (game, n) => list(game)[n - 1];
  const load = (game, n) => read(`${game}:file${n}`);
  const save = (game, n, data) => write(`${game}:file${n}`, data);
  function setMeta(game, n, m) { const f = list(game); f[n - 1] = m; write(game + ':files', f); }
  function erase(game, n) { setMeta(game, n, null); try { localStorage.removeItem(`${game}:file${n}`); } catch (e) { } }
  function copy(game, from, to) { setMeta(game, to, { ...meta(game, from) }); try { localStorage.setItem(`${game}:file${to}`, raw(`${game}:file${from}`) || '{}'); } catch (e) { } }
  function create(game, n, name, buddy) { setMeta(game, n, { name: name || `File ${n}`, buddy }); save(game, n, {}); }

  const css = document.createElement('style');
  css.textContent = `.files{display:grid;gap:.6rem;margin:.75rem 0}
.files .file{display:grid;grid-template-columns:auto 1fr;gap:.1rem .7rem;align-items:center;text-align:left;width:100%}
.files .fnum{grid-row:span 2;font-size:.7em;opacity:.7}
.files .fname .bud{font-size:1.3em;margin-right:.3em;vertical-align:middle}
.files .fsum{font-size:.8em;opacity:.8}
.files .file.new .fname{opacity:.7}
.files-msg{font-weight:700;margin:.5rem 0}
.files-row{display:flex;gap:.6rem;justify-content:flex-end;flex-wrap:wrap}
.who-add{display:grid;gap:.6rem;margin:.75rem 0;text-align:left}
.who-add label{font-weight:700}
.who-add input{display:block;width:100%;margin-top:.3rem;font:inherit;font-size:1.1rem;padding:.5rem .7rem;border:3px solid currentColor;border-radius:.5rem}
.who-buds{display:flex;flex-wrap:wrap;gap:.35rem}
.who-buds button{font-size:1.5rem;line-height:1;padding:.35rem;border:3px solid transparent;border-radius:.5rem;background:none;cursor:pointer}
.who-buds button[aria-pressed="true"]{border-color:currentColor}`;
  document.head.appendChild(css);

  // "Pick a file": three tiles with Copy and Erase under them. summary(save)
  // is the game's one line of progress for a file.
  function mount(el, { game, summary, onPick }) {
    let mode = 'play', from = null;
    const tile = (m, n) => m
      ? `<button class="btn file" data-n="${n}"><span class="fnum">File ${n}</span><span class="fname"><span class="bud" aria-hidden="true">${esc(m.buddy)}</span>${esc(m.name)}</span><span class="fsum">${esc(summary(load(game, n) || {}))}</span></button>`
      : `<button class="btn file new" data-n="${n}"${mode === 'copyFrom' || mode === 'erase' ? ' disabled' : ''}><span class="fnum">File ${n}</span><span class="fname">New file</span></button>`;
    const say = { copyFrom: 'Copy which file?', copyTo: () => `Copy File ${from} to which file?`, erase: 'Erase which file?' };
    const show = () => {
      const files = list(game), any = files.some(Boolean), msg = typeof say[mode] === 'function' ? say[mode]() : say[mode];
      el.innerHTML = (msg ? `<p class="files-msg">${msg}</p>` : '') + `<div class="files">${files.map((m, i) => tile(m, i + 1)).join('')}</div>`
        + `<div class="files-row">${mode === 'play' ? (any ? '<button class="btn" data-do="copy">Copy</button><button class="btn" data-do="erase">Erase</button>' : '') : '<button class="btn" data-do="cancel">Cancel</button>'}</div>`;
    };
    const confirm = (text, ok, then) => {
      el.innerHTML = `<p class="files-msg">${text}</p><div class="files-row"><button class="btn" data-do="cancel">Cancel</button><button class="btn go" data-do="ok">${ok}</button></div>`;
      el.querySelector('[data-do=ok]').onclick = e => { e.stopPropagation(); then(); mode = 'play'; show(); };
    };
    // a new file, or a copy into an empty one: a name and a buddy (a copy
    // starts with the original's, so it can be renamed for someone else)
    const newFile = (n, src) => {
      const was = src && meta(game, src);
      let buddy = was ? was.buddy : BUDDIES[1];
      el.innerHTML = `<form class="who-add">${was ? `<p class="files-msg">Copy File ${src} to File ${n}</p>` : ''}<label>Name<input name="n" maxlength="20" autocomplete="off" placeholder="File ${n}" value="${was ? esc(was.name) : ''}"></label><div><b>Pick a buddy</b><div class="who-buds">${BUDDIES.map(b => `<button type="button" data-b="${b}" aria-pressed="${b === buddy}">${b}</button>`).join('')}</div></div><div class="files-row"><button type="button" class="btn" data-do="cancel">Cancel</button><button class="btn go">${was ? 'Copy' : 'Start'}</button></div></form>`;
      const f = el.querySelector('form');
      f.querySelector('.who-buds').onclick = e => { const b = e.target.closest('[data-b]'); if (!b) return; buddy = b.dataset.b; f.querySelectorAll('[data-b]').forEach(x => x.setAttribute('aria-pressed', x === b)); };
      f.onsubmit = e => {
        e.preventDefault();
        if (was) { copy(game, src, n); setMeta(game, n, { name: f.n.value.trim() || `File ${n}`, buddy }); mode = 'play'; return show(); }
        create(game, n, f.n.value.trim(), buddy); onPick(n, meta(game, n));
      };
    };
    el.onclick = e => {
      const d = e.target.closest('[data-do]')?.dataset.do;
      if (d === 'cancel') { mode = 'play'; return show(); }
      if (d === 'copy') { mode = 'copyFrom'; return show(); }
      if (d === 'erase') { mode = 'erase'; return show(); }
      const t = e.target.closest('[data-n]'); if (!t) return;
      const n = +t.dataset.n, m = meta(game, n);
      if (mode === 'play') return m ? onPick(n, m) : newFile(n);
      if (mode === 'copyFrom' && m) { from = n; mode = 'copyTo'; return show(); }
      if (mode === 'copyTo' && n !== from) return m ? confirm(`Copy File ${from} onto File ${n}? File ${n}'s save (${esc(m.name)}) goes away.`, 'Copy', () => copy(game, from, n)) : newFile(n, from);
      if (mode === 'erase' && m) return confirm(`Erase File ${n} (${esc(m.name)})? Everything in it goes away.`, 'Erase', () => erase(game, n));
    };
    show();
  }

  return { list, meta, load, save, mount, esc };
})();
