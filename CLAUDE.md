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
  Decided 28 Oct (#38): the game starts in town and you find the sector 1
  warehouse; every town after a sector is new and random. The town looks
  broken down and infected (dead lawns, cracked streets, boarded windows,
  patches of purple glitch), and the glitch shrinks a little with each sector
  fixed. The biggest patch is on the next warehouse, and after 25 seconds an
  arrow at the screen edge points to it.
  Decided 28 Oct (#43): in play the game fills the screen, the status bubbles
  sit on top of the world, and the controls are behind a ? button (or H) that
  opens an info bar; it opens by itself the first time each player starts. On
  a phone held upright the bubbles and info bar sit above the maze instead.
- `bread/index.html` is Bread the Corgi, a separate game designed by the middle
  kid tester (Trello card #39). Decided 28 Oct: 8-bit (drawn 16 px to a tile on a
  small canvas, scaled up with smoothing off) and no voice, only chiptune beeps,
  so everything a player needs is written on screen. Bread rides from home to a
  small world with her puppy friend Crumb (a mini corgi in Rottweiler colors),
  who runs off when they get there. Decided 28 Oct: each world is a trip with a
  start and an end, no timer, nothing locked behind you. At the pond, a squirrel
  has the gate key; past the gate, Crumb is stuck on a floating dock, so Bread
  swims out, then leads Crumb back to the car while pawing fleas off Crumb. Her
  bark freezes squirrels and fleas and her paw swipe catches them. Each world is
  meant to teach a move (the pond: swimming) that opens spots in earlier worlds.
  Worlds are data (`WORLDS` in the script: map, goals, setup, steps); progress
  per world is `S.pond`, `S.farm`, and learned moves are `S.moves`. The farm
  (opens after the pond): Crumb digs under the fence into a corn maze, the big
  pig in the muddy pen teaches Bread to dig, Bread digs under, finds Crumb, and
  leads Crumb back; crows instead of squirrels; the pig costume. Soft dirt at
  the pond can be dug once Bread has learned. Crumb follows the trail Bread
  walks, so Crumb never gets stuck on walls. The plan for the rest of the map
  (cow, aquarium, ocean, museum) is on Trello #39.
  The map is driven with the arrow keys (◀ ▶ buttons on touch): the car stops
  at each place and Enter goes in; clicking places on the map does nothing.
  Decided 28 Oct: fewer words. No names or check marks on the map; each place
  shows five paw prints (gold found, dark not yet) or its trophy. The results
  card shows the pieces as pictures, dark for not found. Messages are a few
  words, and only one line is on screen at a time.
  Beating a world wins its costume; the extra pieces, the hidden sparkles and the gold paw print make 100%
  and the trophy. Special finds get a held-up moment with a short tune. Treats
  are the money. Bread is a girl pup (she/her). She has a health bar of 5 bones;
  bumping an unfrozen baddie costs one, and running out is a nap, not a loss
  (she keeps her treats). No "left" counters during play; the end of a world
  is a tally that counts up and finishes on % complete (each piece is 20%).
  Decided 28 Oct, after play-tests: full screen (bar and buttons float over the
  world, controls behind a ? button); the pond park has a hedge maze on each
  side; Bread can swim (squirrels and fleas can't) and shakes off when she
  climbs out; the rubber duck toy floats in the pond; the goal shows for a few
  seconds when it changes and stays in the ? help bar; the closet is a
  wardrobe of pictures with a mirror, and things not found yet show as dark ? shapes;
  the paw aims itself at the nearest baddie in reach, marked with white corners.
  Progress is in localStorage under `bread-corgi:<player id>`.
- `og-image.png`, `apple-touch-icon.png`, `favicon.ico` and `brand/github-social-preview.png`
  are rendered from the matching `brand/*.html` with headless Chrome
  (`--headless=new --window-size=1200,630 --screenshot=...`); favicon.ico comes
  from a 64 px render via `sips -s format ico`. Bump `?v=` in the meta tags when
  an image changes, or link previews keep the old one.
- `shared/players.js` is the player list every game shares. Decided 28 Oct
  (#41): one list for all the games, kept in Treasure Trail's save
  (`treasure-trail`.players), with a permanent `id` added to each player. Bread
  and Math Force start with "Who's playing?" and keep one save per player under
  `<game>:<player id>`; a save from before players existed goes to whoever picks
  first. Sound is one setting per game for the whole computer (`<game>-sound`).
- Each game folder has a `card.png`, the picture on its home page card (the
  cards are arcade cabinets; the whole card is the link in, Play on the right).
  They are rendered from `brand/capture.html`; how is written at its top.
- `treasure-trail/index.html` is the whole game in one file ("Treasure Trail" is a working title): no build step,
  no libraries. It runs offline when you double-click it.

## Rules

- **This repo is public.** No family names, photos, ages or anything else that
  identifies the kids. The game's default players are "Player 1–3", and each
  family renames them in the browser.
- Commits use the studio identity, `Rubber Duck Games <hello@rubberduckgames.com>`,
  set in this repo's local git config. Check `git log --format='%an <%ae>'`
  before pushing.
- Progress lives in the browser's localStorage (`treasure-trail`, and one key
  per player for each other game). There's no server and no account yet; a
  database with a parent email sign-in is parked on #14.
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
- Bread and Math Force can add a player but not rename one; renaming is only in Treasure Trail.
