// ---------- the map maker ----------
// Decided 24 Nov, his ask: "a map builder so you can build new maps to be
// played by anyone". Randi's picks the same day:
// - Shared by link. Share saves the map in the studio database (the shared
//   `maps` table, tagged 'conquest', db/0003_maps.sql) and gives a link,
//   ?map=<id>. Anyone with the link can play it here or start an online game
//   on it; nobody can browse other people's maps.
// - Names come from two word lists (MAP_ADJ, MAP_NOUN), stored as two
//   numbers, so no typed text from anyone ever shows up on another device.
// - Three sizes (MAP_SIZES): small and medium for quick games, big is the
//   size of his map.
// Maps made or opened on this device are kept under `conquest-maps` (up to
// MAP_KEEP), saved as you go. A shared map can't change: editing one after
// sharing it makes a new link the next time you share.
// A map is { w, h, rows, caps, towns, runways, name: [adj, noun] }; rows are
// strings of '.' land, 'w' water, 'm' rock (nobody walks through it), 'f'
// forest (ground units use 2 moves to cross). It loads through cleanMap, which
// throws out anything that isn't one of those, because a link can come from
// anywhere.
Object.assign(STR, {
  makerBtn: 'Map maker',
  makerTitle: 'Map maker',
  makerIntro: 'Make your own map, then play it or share a link so friends can play it too.',
  myMaps: 'Your maps',
  noMaps: 'No maps yet.',
  newMap: 'New map', makeIt: 'Make it',
  sizePick: 'Size', startPick: 'Start with',
  size_s: 'Small (24 by 16)', size_m: 'Medium (36 by 26)', size_l: 'Big (54 by 38)',
  start_w: 'All sea', start_l: 'All land', start_o: 'A copy of the original map',
  mapOriginal: 'The original map',
  mapSize_s: 'small', mapSize_m: 'medium', mapSize_l: 'big',
  mapLine: '{size} · {teams} teams · {cities} cities',
  sharedMark: 'Shared',
  editBtn: 'Edit', playBtn: 'Play', removeBtn: 'Remove', backBtn: 'Back',
  removeTitle: 'Remove {name}?',
  removeBody: 'It goes from this device. If you shared a link, the link still works.',
  mapPickTitle: 'Map',
  newName: 'New name',
  tool_move: 'Move', tool_land: 'Land', tool_water: 'Sea', tool_rock: 'Rock', tool_forest: 'Forest',
  tool_city: 'City', tool_cap: 'Capital', tool_rw: 'Runway', tool_clear: 'Clear',
  toolHow_move: 'Drag to look around the map.',
  toolHow_land: 'Drag on the map to paint land.',
  toolHow_water: 'Drag on the map to paint sea.',
  toolHow_rock: 'Drag on the map to paint rock. Nothing can walk through rock.',
  toolHow_forest: 'Drag on the map to paint forest. Ground units take 2 moves to cross it.',
  toolHow_city: 'Tap land to put a city there. Tap a city to take it away.',
  toolHow_cap: 'Pick a team, then tap land for its capital. A team with no capital sits the game out.',
  toolHow_rw: 'Tap a city to give it a runway, or to take its runway away.',
  toolHow_clear: 'Tap a city or capital to take it away.',
  brush: 'Brush', brush1: 'Small', brush3: 'Big',
  probCaps: 'Put capitals for at least 2 teams.',
  probRoom: '{team}’s capital needs 3 free land squares near it for its first units.',
  probRw: 'A runway needs 2 free land squares next to its city.',
  mapReady: 'Ready to play.',
  playHere: 'Play it', shareMap: 'Share link', doneBtn: 'Done',
  makingLink: 'Saving the map…',
  mapShareTitle: 'Share this map',
  mapShareBody: 'Anyone with this link can play this map.',
  sharedTitle: 'A map for you',
  sharedBody: '{name}: {line}.',
  remix: 'Open in the map maker',
  mapGone: 'That map can’t be found. The link may be wrong.',
  mapBad: 'That map can’t be played.',
});
const MAP_ADJ = ['Iron', 'Frozen', 'Golden', 'Stormy', 'Hidden', 'Burning', 'Misty', 'Thunder', 'Silver', 'Lonely', 'Twin', 'Broken', 'Emerald', 'Crimson', 'Shadow', 'Sunny'];
const MAP_NOUN = ['Islands', 'Straits', 'Peaks', 'Bay', 'Coast', 'Valley', 'Reef', 'Highlands', 'Lakes', 'Fjords', 'Canyon', 'Atolls', 'Frontier', 'Shores', 'Ridge', 'Isles'];
const MAP_SIZES = { s: [24, 16], m: [36, 26], l: [54, 38] };
const MAP_KEEP = 20, MAPS_KEY = 'conquest-maps';
const TILE_OF = { land: '.', water: 'w', rock: 'm', forest: 'f' };
const TOOLS = ['move', 'land', 'water', 'rock', 'forest', 'city', 'cap', 'rw', 'clear'];
const rollName = () => [Math.random() * MAP_ADJ.length | 0, Math.random() * MAP_NOUN.length | 0];
const mapName = def => !def || def.builtin ? t('mapOriginal') : `${MAP_ADJ[def.name[0]]} ${MAP_NOUN[def.name[1]]}`;
const sizeKey = def => Object.keys(MAP_SIZES).find(k => MAP_SIZES[k][0] === def.w && MAP_SIZES[k][1] === def.h) || 'l';
const mapLine = def => t('mapLine', { size: t('mapSize_' + sizeKey(def)), teams: Object.keys(def.caps).length, cities: Object.keys(def.caps).length + def.towns.length });
const readMaps = () => { try { const a = JSON.parse(localStorage.getItem(MAPS_KEY) || '[]'); return Array.isArray(a) ? a.map(m => ({ ...m, def: cleanMap(m.def) })).filter(m => m.def) : []; } catch (e) { return []; } };
const writeMaps = list => { try { localStorage.setItem(MAPS_KEY, JSON.stringify(list.slice(0, MAP_KEEP))); } catch (e) { } };
const packMap = def => ({ w: def.w, h: def.h, rows: def.rows, caps: def.caps, towns: def.towns, runways: def.runways, name: def.name });

// Only what a map can hold gets through; anything else and it isn't a map.
function cleanMap(d) {
  try {
    if (!d || typeof d !== 'object') return null;
    const size = Object.values(MAP_SIZES).find(([w, h]) => w === d.w && h === d.h); if (!size) return null;
    const [w, h] = size;
    if (!Array.isArray(d.rows) || d.rows.length !== h || !d.rows.every(r => typeof r === 'string' && r.length === w && /^[.wmf]+$/.test(r))) return null;
    const onLand = ([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < w && y < h && '.f'.includes(d.rows[y][x]);
    const caps = {};
    for (const [s, p] of Object.entries(d.caps || {})) { if (TEAMS.includes(s) && Array.isArray(p) && onLand(p)) caps[s] = [p[0], p[1]]; }
    const towns = (Array.isArray(d.towns) ? d.towns : []).slice(0, 120).filter(p => Array.isArray(p) && onLand(p)).map(p => [p[0], p[1]]);
    const all = [...Object.values(caps), ...towns];
    const runways = (Array.isArray(d.runways) ? d.runways : []).slice(0, 60).filter(p => Array.isArray(p) && all.some(([a, b]) => a === p[0] && b === p[1])).map(p => [p[0], p[1]]);
    const n = Array.isArray(d.name) ? d.name : [];
    const name = [Number.isInteger(n[0]) && n[0] >= 0 && n[0] < MAP_ADJ.length ? n[0] : 0, Number.isInteger(n[1]) && n[1] >= 0 && n[1] < MAP_NOUN.length ? n[1] : 0];
    return { w, h, rows: d.rows.slice(), caps, towns, runways, name };
  } catch (e) { return null; }
}
function blankMap(size, start) {
  if (start === 'o') { const o = packMap(BUILTIN); return cleanMap({ ...o, name: rollName() }); }
  const [w, h] = MAP_SIZES[size], ch = start === 'l' ? '.' : 'w';
  return { w, h, rows: Array.from({ length: h }, () => ch.repeat(w)), caps: {}, towns: [], runways: [], name: rollName() };
}

// What still stops a map from being played (empty when it's ready).
function mapProblems(def) {
  const out = [], caps = Object.entries(def.caps);
  if (caps.length < 2) out.push(t('probCaps'));
  const cities = [...caps.map(([, p]) => p), ...def.towns], isCity = (x, y) => cities.some(([a, b]) => a === x && b === y);
  const walk = (x, y) => x >= 0 && y >= 0 && x < def.w && y < def.h && '.f'.includes(def.rows[y][x]);
  for (const [s, [cx, cy]] of caps) {   // the same search newGame uses to place the first 3 units
    let n = 0; const seen = new Set([cx + ',' + cy]), q = [[cx, cy]];
    while (q.length && n < 3) { const [x, y] = q.shift(); for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || !walk(nx, ny)) continue; seen.add(k); q.push([nx, ny]); if (!isCity(nx, ny)) n++; } }
    if (n < 3) out.push(t('probRoom', { team: tn(s) }));
  }
  if (def === CUR && RUNWAYS.length < def.runways.length) out.push(t('probRw'));
  return out;
}

// ---- the editor, drawn on the game's own map with a stand-in game
let M = null;   // { entry: { uid, def, id }, tool, team, brush, last }
function makerG() {
  const d = M.entry.def;
  return { editing: true, v: SAVE_V, turn: 1, side: 'green', view: 'green', ctrl: {}, money: {}, rel: {}, locked: {}, soured: {}, out: {}, stats: {}, units: [],
    cities: [...Object.entries(d.caps).map(([s, [x, y]]) => ({ x, y, hq: true, owner: s, d: [null, null, null, null] })), ...d.towns.map(([x, y]) => ({ x, y, owner: null, d: [null, null, null, null] }))] };
}
function makerOpen(entry) {
  M = { entry, tool: 'land', team: 'green', brush: 1, last: null };
  sel = null; cardHide(); useMap(entry.def); G = makerG();
  for (const id of ['endBtn', 'teamsBtn', 'inviteBtn']) $('#' + id).hidden = true;
  Object.assign(camGo, { x: 0, y: 0 }); Object.assign(cam, camGo);
  render();
}
function makerClose(then) {
  makerSave(); M = null; G = null; sel = null;
  $('#endBtn').hidden = false; $('#teamsBtn').hidden = false;
  pickMap(PREFS.map);
  then();
}
// saved on the device after every change; sharing again after a change makes a new link
function makerSave() {
  if (!M) return;
  const list = readMaps().filter(m => m.uid !== M.entry.uid);
  writeMaps([M.entry, ...list]);
}
let makerDirty = false;
function makerChanged(fit = false) {
  M.entry.id = null;   // a shared map stays as it was; this one gets a new link next time
  if (makerDirty) return;
  makerDirty = true;
  requestAnimationFrame(() => { makerDirty = false; if (!M) return; useMap(M.entry.def, fit); G.cities = makerG().cities; makerSave(); render(); });
}
const makerPaints = () => !!M && !!TILE_OF[M.tool];
function setTile(def, x, y, ch) {
  if (x < 0 || y < 0 || x >= def.w || y >= def.h || def.rows[y][x] === ch) return false;
  def.rows[y] = def.rows[y].slice(0, x) + ch + def.rows[y].slice(x + 1);
  if (!'.f'.includes(ch)) dropCity(def, x, y);   // no cities in the sea or in rock
  return true;
}
function dropCity(def, x, y) {
  const at = p => p[0] === x && p[1] === y;
  for (const s of Object.keys(def.caps)) if (at(def.caps[s])) delete def.caps[s];
  def.towns = def.towns.filter(p => !at(p));
  def.runways = def.runways.filter(p => !at(p));
}
// A fast drag skips squares between pointer events, so each stroke fills the
// straight line from the last square it painted (M.last) to this one.
function makerStroke(x, y) {
  if (!M || !TILE_OF[M.tool]) return;
  const k = x + ',' + y; if (M.last === k) return;
  const [x0, y0] = M.last ? M.last.split(',').map(Number) : [x, y]; M.last = k;
  const n = Math.max(Math.abs(x - x0), Math.abs(y - y0)), r = M.brush === 3 ? 1 : 0; let any = false;
  for (let i = 0; i <= n; i++) {
    const px = Math.round(x0 + (x - x0) * (n ? i / n : 1)), py = Math.round(y0 + (y - y0) * (n ? i / n : 1));
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) any = setTile(M.entry.def, px + dx, py + dy, TILE_OF[M.tool]) || any;
  }
  if (any) makerChanged();
}
function makerTap(x, y) {
  if (!M) return;
  const d = M.entry.def, land = '.f'.includes(d.rows[y]?.[x]), at = p => p[0] === x && p[1] === y;
  const capHere = Object.keys(d.caps).find(s => at(d.caps[s])), townHere = d.towns.some(at);
  M.last = null;
  if (TILE_OF[M.tool]) { makerStroke(x, y); return; }
  if (M.tool === 'city') {
    if (townHere) dropCity(d, x, y);
    else if (land && !capHere) d.towns.push([x, y]);
    else return;
  } else if (M.tool === 'cap') {
    if (capHere === M.team) dropCity(d, x, y);
    else if (land) { dropCity(d, x, y); d.caps[M.team] = [x, y]; }
    else return;
  } else if (M.tool === 'rw') {
    if (!capHere && !townHere) return;
    if (d.runways.some(at)) d.runways = d.runways.filter(p => !at(p)); else d.runways.push([x, y]);
  } else if (M.tool === 'clear') {
    if (!capHere && !townHere) return;
    dropCity(d, x, y);
  } else return;
  sfx('click'); makerChanged();
}
function makerRender() {
  const d = M.entry.def;
  $('#hTeam').textContent = t('makerTitle');
  $('#hTurn').textContent = mapName(d);
  $('#hMoney').textContent = d.w + ' × ' + d.h;
  const probs = mapProblems(d);
  const el = $('#info');
  el.innerHTML = `<h2>${mapName(d)}</h2><div class="row"><button class="btn small quiet" id="mkName">${t('newName')}</button></div>
    <div class="tools">${TOOLS.map(k => `<button class="dbtn" data-tool="${k}" aria-pressed="${M.tool === k}">${t('tool_' + k)}</button>`).join('')}</div>
    ${M.tool === 'cap' ? `<div class="tools">${TEAMS.map(s => `<button class="dbtn" data-team="${s}" aria-pressed="${M.team === s}">${chip(s)}${tn(s)}${d.caps[s] ? ' ✓' : ''}</button>`).join('')}</div>` : ''}
    ${TILE_OF[M.tool] ? `<div class="tools"><span>${t('brush')}</span>${[1, 3].map(n => `<button class="dbtn" data-brush="${n}" aria-pressed="${M.brush === n}">${t('brush' + n)}</button>`).join('')}</div>` : ''}
    <p>${t('toolHow_' + M.tool)}</p>
    ${probs.length ? probs.map(p => `<p class="warn">${p}</p>`).join('') : `<p>${t('mapReady')}</p>`}
    <div class="row"><button class="btn quiet" id="mkDone">${t('doneBtn')}</button><button class="btn quiet" id="mkShare" ${probs.length ? 'disabled' : ''}>${t('shareMap')}</button><button class="btn" id="mkPlay" ${probs.length ? 'disabled' : ''}>${t('playHere')}</button></div>`;
  el.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => { M.tool = b.dataset.tool; sfx('click'); render(); });
  el.querySelectorAll('[data-team]').forEach(b => b.onclick = () => { M.team = b.dataset.team; sfx('click'); render(); });
  el.querySelectorAll('[data-brush]').forEach(b => b.onclick = () => { M.brush = +b.dataset.brush; render(); });
  $('#mkName').onclick = () => { d.name = rollName(); makerSave(); render(); };
  $('#mkDone').onclick = () => makerClose(makerCard);
  $('#mkPlay').onclick = () => { const uid = M.entry.uid; makerClose(() => { pickMap(uid); setupCard(); }); };
  $('#mkShare').onclick = () => shareMap(M.entry, () => render());
}

// ---- sharing
const mapLink = id => location.origin + location.pathname + '?map=' + id;
async function shareMap(entry, back) {
  if (!entry.id) {
    cardShow(`<h2>${t('mapShareTitle')}</h2><p>${t('makingLink')}</p>`);
    try { entry.id = await rpc('map_create', { p_game: 'conquest', p_map: packMap(entry.def) }); }
    catch (e) { cardShow(`<h2>${t('mapShareTitle')}</h2><p class="warn">${t('netFail')}</p><div class="row"><button class="btn" id="ok">${t('done')}</button></div>`); $('#ok').onclick = () => { cardHide(); back(); }; return; }
    const list = readMaps(), i = list.findIndex(m => m.uid === entry.uid);
    if (i >= 0) list[i] = entry; else list.unshift(entry);
    writeMaps(list);
  }
  const url = mapLink(entry.id);
  cardShow(`<h2>${t('mapShareTitle')}</h2><p>${t('mapShareBody')}</p><p><input id="link" readonly value="${url}"></p>
    <div class="row">${navigator.share ? `<button class="btn quiet" id="shr">${t('shareBtn')}</button>` : ''}<button class="btn quiet" id="cp">${t('copyLink')}</button><button class="btn" id="ok">${t('done')}</button></div>`);
  $('#cp').onclick = async () => { try { await navigator.clipboard.writeText(url); } catch (e) { $('#link').select(); document.execCommand('copy'); } $('#cp').textContent = t('copied'); };
  const sh = $('#shr'); if (sh) sh.onclick = () => navigator.share({ title: mapName(entry.def), url }).catch(() => { });
  $('#ok').onclick = () => { cardHide(); back(); };
}
// someone sent a ?map= link
async function openSharedMap(id) {
  const plain = () => history.replaceState(null, '', location.pathname);
  try {
    const rows = await rpc('map_get', { p_id: id });
    const def = rows.length && rows[0].game === 'conquest' ? cleanMap(rows[0].map) : null;
    if (!def) { plain(); cardShow(`<h2>${t('title')}</h2><p class="warn">${t(rows.length ? 'mapBad' : 'mapGone')}</p><div class="row"><button class="btn" id="ok">${t('done')}</button></div>`); $('#ok').onclick = titleCard; return; }
    const list = readMaps();
    let entry = list.find(m => m.id === id);
    if (!entry) { entry = { uid: Math.random().toString(36).slice(2), def, id }; writeMaps([entry, ...list]); }
    pickMap(entry.uid);
    cardShow(`<h2>${t('sharedTitle')}</h2><p>${t('sharedBody', { name: mapName(def), line: mapLine(def) })}</p>
      <div class="row"><button class="btn quiet" id="no">${t('cancel')}</button><button class="btn quiet" id="mk">${t('remix')}</button><button class="btn" id="go">${t('playBtn')}</button></div>`);
    $('#no').onclick = () => { plain(); titleCard(); };
    $('#mk').onclick = () => { plain(); makerOpen({ uid: Math.random().toString(36).slice(2), def: cleanMap(packMap(def)), id: null }); };
    $('#go').onclick = () => { plain(); setupCard(); };
  } catch (e) { cardShow(`<h2>${t('title')}</h2><p class="warn">${t('netFail')}</p><div class="row"><button class="btn" id="re">${t('tryAgain')}</button></div>`); $('#re').onclick = () => openSharedMap(id); }
}

// ---- picking a map for a new game
function pickMap(key) {
  const entry = key && key !== 'his' ? readMaps().find(m => m.uid === key) : null;
  PREFS.map = entry ? key : 'his'; savePrefs();
  useMap(entry ? entry.def : null);
}
function mapPick() {
  const list = readMaps();
  if (!list.length) { if (!CUR.builtin) pickMap('his'); return ''; }
  if ((PREFS.map || 'his') !== 'his' && !list.some(m => m.uid === PREFS.map)) pickMap('his');
  const want = PREFS.map || 'his';
  if (want === 'his' ? !CUR.builtin : CUR !== list.find(m => m.uid === want)?.def) pickMap(want);
  const opt = (v, name, line) => `<label><input type="radio" name="map" value="${v}"${want === v ? ' checked' : ''}> <b>${name}</b> <span>${line}</span></label>`;
  return `<fieldset class="lvl"><legend>${t('mapPickTitle')}</legend>${opt('his', t('mapOriginal'), mapLine(BUILTIN))}${list.map(m => opt(m.uid, mapName(m.def), mapLine(m.def))).join('')}</fieldset>`;
}

// ---- the map maker's own card: your maps, and a new one
function makerCard() {
  const list = readMaps();
  const rows = list.length ? list.map(m => `<div class="tm"><div class="grow"><h3>${mapName(m.def)}</h3><p>${mapLine(m.def)}${m.id ? ' · ' + t('sharedMark') : ''}</p></div>
    <div class="col"><button class="btn small quiet" data-edit="${m.uid}">${t('editBtn')}</button><button class="btn small quiet" data-share="${m.uid}" ${mapProblems(m.def).length ? 'disabled' : ''}>${t('shareMap')}</button><button class="btn small quiet" data-rm="${m.uid}">${t('removeBtn')}</button><button class="btn small" data-play="${m.uid}" ${mapProblems(m.def).length ? 'disabled' : ''}>${t('playBtn')}</button></div></div>`).join('') : `<p>${t('noMaps')}</p>`;
  const radios = (name, keys, pre, pick) => keys.map(k => `<label><input type="radio" name="${name}" value="${k}"${k === pick ? ' checked' : ''}> <b>${t(pre + k)}</b></label>`).join('');
  cardShow(`<h2>${t('makerTitle')}</h2><p>${t('makerIntro')}</p><h3>${t('myMaps')}</h3>${rows}
    <fieldset class="lvl"><legend>${t('newMap')}: ${t('sizePick')}</legend>${radios('msize', ['s', 'm', 'l'], 'size_', 'm')}</fieldset>
    <fieldset class="lvl"><legend>${t('startPick')}</legend>${radios('mstart', ['w', 'l', 'o'], 'start_', 'w')}</fieldset>
    <div class="row"><button class="btn quiet" id="back">${t('backBtn')}</button><button class="btn" id="make">${t('makeIt')}</button></div>`);
  const card = $('#card');
  $('#back').onclick = titleCard;
  $('#make').onclick = () => {
    const start = card.querySelector('input[name=mstart]:checked').value, size = start === 'o' ? 'l' : card.querySelector('input[name=msize]:checked').value;
    makerOpen({ uid: Math.random().toString(36).slice(2), def: blankMap(size, start), id: null });
  };
  const find = uid => readMaps().find(m => m.uid === uid);
  card.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => makerOpen(find(b.dataset.edit)));
  card.querySelectorAll('[data-play]').forEach(b => b.onclick = () => { pickMap(b.dataset.play); setupCard(); });
  card.querySelectorAll('[data-share]').forEach(b => b.onclick = () => { const m = find(b.dataset.share); useMap(m.def); shareMap(m, makerCard); });
  card.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
    const m = find(b.dataset.rm);
    cardShow(`<h2>${t('removeTitle', { name: mapName(m.def) })}</h2><p>${t('removeBody')}</p><div class="row"><button class="btn quiet" id="no">${t('cancel')}</button><button class="btn" id="yes">${t('removeBtn')}</button></div>`);
    $('#no').onclick = makerCard;
    $('#yes').onclick = () => { writeMaps(readMaps().filter(x => x.uid !== m.uid)); if (PREFS.map === m.uid) pickMap('his'); makerCard(); };
  });
}
