// The start card as a scene (decided 25 Nov): seven level buttons and Play the
// house in a row were "a bit much". Instead he stands in the middle with a
// thing for each place around him: the turkey (just dinner), the house, the
// van (out to dinner), a wedding invite, popcorn (the movies), candles (date
// night) and his toolbox (on the job). Each thing is the button for its level,
// with its name under it; poking him makes him fart. Loaded last, so each level
// file has already set its button's name and onclick; this only adds the
// picture and moves the name into a label under it.
Object.assign(T, {
  poke: 'Poke him',
  pokeLines: ['Excuse me.', 'It wasn\'t the cheese.', 'Pull my finger next time.', 'Better out than in.', 'That one\'s been waiting.', 'Must be the turkey.'],
});

(() => {
  const K = HOUSE.kit;
  const url = c => c.toDataURL();
  // 16 x 16 pictures, outlined by the kit like every other sprite
  const icon = (key, draw) => url(K.sprite('start-' + key, 16, 16, draw));
  const ICONS = {
    dinnerBtn: spriteURL('turkey'),
    startBtn: icon('house', r => {
      r(1, 7, 14, 1, '#8a2a1e'); r(2, 6, 12, 1, '#a83a2a'); r(3, 5, 10, 1, '#a83a2a'); r(4, 4, 8, 1, '#a83a2a'); r(5, 3, 6, 1, '#a83a2a'); r(6, 2, 4, 1, '#a83a2a'); r(7, 1, 2, 1, '#a83a2a');
      r(11, 2, 2, 3, '#6a6a72');                                    // chimney
      r(2, 8, 12, 7, '#f0e4c8'); r(3, 10, 3, 3, '#9fd0f0'); r(10, 10, 3, 3, '#9fd0f0'); r(7, 10, 2, 5, '#8a5228');
    }),
    outBtn: icon('van', r => {
      r(1, 5, 12, 7, '#c8d8e8'); r(13, 7, 2, 5, '#c8d8e8'); r(2, 6, 3, 3, '#3a4a6a'); r(6, 6, 3, 3, '#3a4a6a'); r(10, 6, 3, 3, '#3a4a6a'); r(13, 7, 1, 2, '#3a4a6a');
      r(1, 10, 14, 1, '#8a9aaa'); r(15, 10, 1, 1, '#f5d34a');
      r(3, 11, 3, 3, '#2a2a2e'); r(10, 11, 3, 3, '#2a2a2e'); r(4, 12, 1, 1, '#9a9aa0'); r(11, 12, 1, 1, '#9a9aa0');
    }),
    wedBtn: icon('invite', r => {
      r(1, 4, 14, 9, '#f8f4ec'); r(1, 4, 14, 1, '#e0d8c8');
      for (let k = 0; k < 7; k++) { r(1 + k, 4 + k * .7 | 0, 1, 1, '#c8bca8'); r(14 - k, 4 + k * .7 | 0, 1, 1, '#c8bca8'); }
      r(6, 8, 2, 1, '#d83a5a'); r(9, 8, 2, 1, '#d83a5a'); r(6, 9, 5, 1, '#d83a5a'); r(7, 10, 3, 1, '#d83a5a'); r(8, 11, 1, 1, '#d83a5a');   // a heart seal
    }),
    movBtn: icon('popcorn', r => {
      r(3, 1, 3, 3, '#fff6d8'); r(6, 0, 4, 3, '#fff6d8'); r(10, 1, 3, 3, '#fff6d8'); r(4, 3, 8, 2, '#fff6d8'); r(7, 2, 2, 1, '#f5d34a'); r(4, 2, 1, 1, '#f5d34a'); r(11, 2, 1, 1, '#f5d34a');
      for (let y = 5; y < 15; y++) { const inset = (y - 5) / 5 | 0; r(3 + inset, y, 10 - inset * 2, 1, '#f4f4f0'); }
      for (let y = 5; y < 15; y++) { const inset = (y - 5) / 5 | 0; r(5 + inset, y, 2, 1, '#d83a3a'); r(9 - inset, y, 2, 1, '#d83a3a'); }
    }),
    dateBtn: icon('candles', r => {
      r(5, 1, 1, 2, '#f5d34a'); r(10, 2, 1, 2, '#f5d34a'); r(5, 0, 1, 1, '#f5a03a'); r(10, 1, 1, 1, '#f5a03a');
      r(4, 3, 3, 10, '#f4f4f0'); r(9, 4, 3, 9, '#f4f4f0'); r(5, 3, 1, 1, '#2a2a2a'); r(10, 4, 1, 1, '#2a2a2a');
      r(2, 13, 12, 2, '#c8a050'); r(3, 15, 10, 1, '#a8803a');
    }),
    jobBtn: icon('toolbox', r => {
      r(5, 2, 6, 1, '#4a4a52'); r(5, 3, 1, 2, '#4a4a52'); r(10, 3, 1, 2, '#4a4a52');   // handle
      r(1, 5, 14, 9, '#c83a2a'); r(1, 5, 14, 2, '#e85a4a'); r(1, 9, 14, 1, '#8a2a1e'); r(7, 8, 2, 3, '#c9c9cf');
      r(12, 0, 2, 6, '#9aa0a6'); r(11, 0, 4, 1, '#9aa0a6');   // a pipe wrench sticking out
    }),
  };
  // him standing, front on: the dinner scene's face on overalls
  function him(face) {
    const sp = SCENE_SPRITES[face], pal = Object.assign({}, SCENE_PAL, sp.pal);
    return url(K.sprite('start-him-' + face, 24, 48, r => {
      const SH = '#3d3d45', OV = '#b07a3a', OD = '#9c6a30', SK = '#e2a978', BT = '#4a3020';
      r(10, 20, 4, 2, SK);                                              // neck
      r(3, 22, 18, 10, SH); r(1, 23, 3, 10, SH); r(20, 23, 3, 10, SH);  // shirt and arms
      r(1, 33, 3, 3, SK); r(20, 33, 3, 3, SK);                          // hands
      r(7, 22, 2, 4, OV); r(15, 22, 2, 4, OV); r(7, 26, 10, 6, OV); r(8, 26, 1, 1, '#e8c35a'); r(15, 26, 1, 1, '#e8c35a'); r(10, 27, 4, 3, OD);   // the bib
      r(5, 32, 14, 11, OV); r(11, 37, 2, 6, OD); r(6, 33, 1, 9, OD);   // the legs
      r(4, 43, 7, 4, BT); r(13, 43, 7, 4, BT);                          // boots
      sp.rows.forEach((row, j) => [...row].forEach((ch, i) => { if (pal[ch]) r(4 + i, j, 1, 1, pal[ch]); }));
    }));
  }
  const FACE = him('himNormal'), SMUG = him('himSmug');

  // put a picture and a label in each place's button; the level file set its name
  for (const id in ICONS) {
    const b = $('#' + id), name = b.textContent;
    b.className = 'item'; b.textContent = '';
    const im = document.createElement('img'); im.src = ICONS[id]; im.alt = ''; im.width = 16; im.height = 16;
    const lb = document.createElement('span'); lb.className = 'lbl'; lb.textContent = name;
    b.append(im, lb);
  }
  const pk = $('#pokeBtn'), pim = $('#pokeImg'), say = $('#pokeSay');
  pk.setAttribute('aria-label', T.poke); pim.src = FACE;
  let busy = 0;
  pk.onclick = () => {
    audio();
    const type = pick(ORDER.filter(k => k !== 'shart'));   // any kind but the secret one; it doesn't count toward the collection
    playType(type, .6);
    pim.src = SMUG; say.textContent = pick(T.pokeLines); say.hidden = false;
    const puff = document.createElement('span'); puff.className = 'puff'; puff.style.background = TYPES[type].color;
    pk.append(puff); setTimeout(() => puff.remove(), 1200);
    clearTimeout(busy); busy = setTimeout(() => { pim.src = FACE; say.hidden = true; }, 1800);
  };
})();
