# RubberDuckGames.com

Public repo: the studio site and its games, served by GitHub Pages at
rubberduckgames.com (RuberDuckGames.com forwards here at Porkbun).
The branching, versioning and accessibility rules come from the parent `CLAUDE.md`.

## Layout

- `index.html` is the studio home page. Each game sits in its own folder.
- `math-force/index.html` is a separate game designed by the oldest kid tester
  (full design on Trello card #33). Decided 20 Oct: the fix-the-glitch theme;
  Errors are restored, not killed, and the blaster is a debug blaster, not a
  real-world gun. Single-player only; multiplayer needs a server and moderation.
- `bread/index.html` is Bread the Corgi, a separate game designed by the middle
  kid tester (Trello card #39). Decided 28 Oct: 8-bit (drawn 20 px to a tile on a
  small canvas, scaled up with smoothing off) and no voice, only chiptune beeps,
  so everything a player needs is written on screen. Bread rides from home to a
  small world, catches the squirrels and fleas, and the last one drops his
  squeaky bone. Beating a world wins its costume; the extra pieces, the hidden
  sparkles and the gold treat make 100% and the trophy. Treats are the money.
  Progress is in localStorage under `bread-corgi`.
- `og-image.png`, `apple-touch-icon.png`, `favicon.ico` and `brand/github-social-preview.png`
  are rendered from the matching `brand/*.html` with headless Chrome
  (`--headless=new --window-size=1200,630 --screenshot=...`); favicon.ico comes
  from a 64 px render via `sips -s format ico`. Bump `?v=` in the meta tags when
  an image changes, or link previews keep the old one.
- `treasure-trail/index.html` is the whole game in one file ("Treasure Trail" is a working title): no build step,
  no libraries. It runs offline when you double-click it.

## Rules

- **This repo is public.** No family names, photos, ages or anything else that
  identifies the kids. The game's default players are "Player 1–3", and each
  family renames them in the browser.
- Commits use the studio identity, `Rubber Duck Games <hello@rubberduckgames.com>`,
  set in this repo's local git config. Check `git log --format='%an <%ae>'`
  before pushing.
- Progress lives in the browser's localStorage (key `treasure-trail`). There's
  no server and no account.
  That includes each player's school spelling list (`player.words`), which a
  grown-up pastes in Spelling Words; older lists are kept in `player.oldWords`.
- Letter Train never shows speed. Decided 20 Oct for a kid who's anxious about
  typing: the end screen says what they did, and wrong keys are silent in the
  first two levels.
- Design for kids with ADHD and dyslexia: short rounds, every prompt spoken,
  no timers, no buzzers, a hint after two misses, no grade labels.

## Known gaps

- Treasure Trail sizes text in `px`; the parent rules want `rem`.
- Treasure Trail's strings are inline, not in a catalogue.
- Space Lab and Story Tree are on the map as "soon" and not built yet.
- Bread's strings are inline, not in a catalogue, like Treasure Trail's.
- The home page says every word can be read aloud; Math Force and Bread have no voice.
