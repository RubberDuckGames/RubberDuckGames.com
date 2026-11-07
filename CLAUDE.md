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
  per world (or section) is `S.pond`, `S.farm`, `S.barn`, and learned moves are `S.moves`. The farm
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
  Touch screens get a round stick like Math Force's (decided 2 Nov, after
  play-tests; it replaced an arrow pad you slid a thumb on). The keyboard still
  works on computers, and holding a finger or the mouse on the world works on
  both. During play, pinch and double-tap zoom are blocked, as in Rodeo. On a phone held upright
  the page looks like a Game Boy: screen frame, black cross pad, round red
  Paw, Bark and Dig buttons, and cards cover the whole screen.
  A phone turned sideways plays like a Switch: the game in the middle, the pad
  on a dark controller on the left, the buttons in a diamond on the right.
  Messages sit in a text box inside the game screen on phones.
  The game opens on a title screen (logo, Bread and Crumb, blinking PRESS
  START); any key, button or tap plays a start-up jingle, then Pick a file.
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
  Decided 2 Nov, from play-tests: walking up to the car with Crumb asks "Go
  home?" (Not yet / Go home) instead of ending the trip; a big boss goose guards
  Crumb in the farm's corn and takes a bark then a paw, three times; crows
  stand up like birds; fences running up and down are drawn end on; and the
  closet dresses Crumb too (`S.crumbWear`, the same pieces placed for Crumb).
  Decided 3 Nov: the farm is one open map (`FARM_OPEN`, 72 tiles wide; a
  world's size is `LW`/`LH`, set when it starts). The barn was a stop of its
  own for an afternoon; the testers expected it on the farm, so it moved there,
  east of the farmyard through a gap in the fence by the car. A world can have
  sections (`W.sections`), each with its own five pieces and costume; the end
  card adds up each section and the whole world. The barn's jobs: push the hay
  out of the doors and herd the three cows into their stalls (cows walk away
  from Bread and trot from a bark), and push the ladder out of the tack room
  (a hay puzzle) and under the hayloft so the barn cats climb down and chase
  off the mice. Both jobs done wins the cow costume. The dairy cow by the doors
  teaches Bread to push (`S.moves.push`): walking into a bale or the ladder
  slides it one tile, straight only. Hay can end up stuck, so the ? help bar
  has Put the hay back. The roof hides the inside until Bread walks in.
  The chicken coop sits below the farmyard, down past the car. Crumb runs off
  there and hides up on the roost; the eggs are scattered, and Bread carries
  them one at a time to the nest of their color (one is under a bale, one
  buried, one on an island in the duck pond, one under a bush). Every nest full
  wins the chicken costume and Crumb hops down. Since Crumb is at the coop, the
  corn has a lost piglet instead, guarded by the goose; finding it wins the pig
  costume. The horse ring is below the barn (the barn's path runs down to its
  gate, and there's a gap through from the coop). The pony is loose and runs
  from Bread like the cows; once it's herded in, Bread walks up and hops on,
  rides round the three barrels (each one counts once she's gone most of the
  way round it) and out the gate, on a clock like Rodeo's. The first ride wins
  the cowboy costume; the best time is `S.ring.best` and shows on the end card.
  Paw hops off.
  Decided 3 Nov: Crumb has a closet of Crumb's own (`CRUMB_ITEMS`,
  `S.crumbHave`), not Bread's pieces, which looked wrong on Crumb (the
  sunglasses most of all). Crumb's costumes are little animals hidden as extra
  sparkles that don't count toward % (`crumbSpots`): a duckling at the pond; a
  piglet, a barn kitten, a mouse, a chick and a foal around the farm. The treat
  shop has a For Crumb part with small things to buy.
  Progress is in localStorage under `bread-corgi:file<n>`.
  Decided 5 Nov (the testers wanted the pond harder): the lower park has a
  round duck pond where the mama duck waits, and her four ducklings run from
  Bread like the cows; one that reaches the water stays and swims to her (at
  first it had to reach her and got chased out again). All four home pays a
  few treats (the first time is a held-up moment, `S.pond.ducklings`); it
  doesn't count toward %. A rowboat bridge to an island in the big pond was
  tried the same day and taken out: one push, no puzzle.
  Also decided 5 Nov, the testers' idea: four frogs on lily pads in the big
  pond (pink, yellow, blue, orange), each with its own note (`FROGS`). Swim near
  and they croak a tune; Bread repeats it by barking at each frog in order.
  Three rounds, the same tune a note longer each time (3, 4, 5); a wrong frog
  croaks low and the tune plays again. The whole song wins Crumb's frog costume
  (not counted toward %). The big pond is bigger and runs off the east edge, and
  the hedge maze by it is only on the west side ("we're visiting a pond, not a
  hedge maze"); the two mazes below the fence stay, for the key squirrel.
  Decided 5 Nov, after a play-test with a tester who skips words: the ? button
  (or H) makes the next thing light up and flash, while the help bar is open
  and for 5 seconds after (`drawHints`, `HINT_MS`). It flashed by itself after
  15 seconds at first, but then flashed all through herding the cows. It
  shows the nest for the egg Bread carries, the loose eggs (drawn over bushes
  while they flash), the ladder for the stuck cats, and the empty cow stalls. Arrows, rings and picture bubbles were tried the same
  day and dropped as too much. Each stall now has its own straw bed and feed
  box, since the testers took the three stalls for one pen. The help bar no
  longer opens by itself.
- `tugboat/index.html` is Tugboat Deliveries, a separate game designed by the
  youngest kid tester (Trello card #45; he's almost 3 and knows the arrow keys
  and the space bar). Decided 29 Oct: 8-bit like Bread, one harbor that fits
  the screen, arrow keys drive, Space is the horn. A picture docket shows what
  to pick up (an animal or a crate) and which dock it goes to (a big number, a
  color and a shape), because he can't read yet. Decided 2 Nov: no voice, only
  chiptune sounds, like Bread.
  Loading and unloading happen by themselves near the dock. Bumping buoys and
  boats just boings: no damage, no timer, no losing. Sparkles float on the
  water to collect. The tugboat's name (his name) is typed in on the family's
  device and stored there only, so the public title is "Tugboat Deliveries".
  Decided 2 Nov: a second level, the river. After PRESS START a card picks
  Harbor, River A B C or River 1 2 3 (arrows and Space work on it; the ⛵ Pick
  button brings it back). The river scrolls by on its own; the next letter or
  number to get is shown big at the top, a wrong one floats past, a bump boings.
  Decided 2 Nov, after his first go: a run is the whole set, A to Z or 1 to
  20, from the start each time, with more room on the water. One wanted letter
  floats by at a time between ducks, lily pads, logs and boats, and a missed
  one comes back a few seconds later until he gets it (the gaps are in `GAP`).
  `S.abc` and `S.num` count finished runs.
  Progress is in localStorage under `tugboat`.
- `rodeo/index.html` is Rodeo (Trello #46). It
  opens on a title screen with a cowgirl racing across and PRESS START, then
  the choice of event. Decided 31 Oct, after the racers played it and loved it: pole
  bending is the second event, picked on the opening screen (the stables will
  lead to this choice later). Six poles; the gate is at the end of the line, so
  the poles run the long way across the arena; rings of dots mark the next gap.
  The horse changes leads by itself: steering smoothly is clean, snapping
  across costs turning and speed for a moment. Leads are in the poles only, so
  the barrels stay as the racers liked them. The racers' spacing is 21 feet;
  the game's is whatever lets this horse make the weave. Roping is the third
  event: chase the steer, hold GO to swing, let go to cast, then keep the dot
  in the moving green spot until the meter fills, like fishing in Stardew
  Valley; the tie is the same thing, shorter and harder. One button for both,
  so it plays on a phone. If the meter empties on the rope, the chase is back
  on; the clock runs through all of it, and at 90 seconds the steer gets away.
  Three rounds on one clock, each harder than the last; the numbers are in
  `ROUNDS`, and the best time counts all three. Decided 31 Oct: neighbors who race say other games are too
  slow or don't play well, so this tests only how the horse feels, with plain
  art: one cloverleaf, tap to run, stick or arrows to steer, a knocked barrel
  adds 5 seconds. Speed widens the turn; the numbers are in `TUNE`. The rule
  against timers is for the learning games; racing against the clock is this
  game's point. Phone first: upright is a Game Boy with the stick and GO below
  the screen; sideways the arena is as tall as the screen, with the stick and
  GO on the dirt at each side. Best times are in localStorage under `rodeo-test`.
- `conquest/index.html` is Conquest (working title), a turn-based war game
  designed by the oldest kid tester (Trello #47 has his units and rules). Decided
  4 Nov: the units are his own drawings exactly (`conquest/units/*.png`, cut
  from screenshots of his drawing app; the white gaps inside them are see-through
  except the medic crosses). The green parts of each drawing are the team's
  colour, and the world is worn WW2 rather than bright: the game recolours and
  grimes the drawings in the browser (`grime()`), drawn at half size for chunky
  pixels. Units face up, down, left or right only; turned at in-between angles
  his drawings came out jagged. Money comes from cities (capital 3, others 1 a
  turn); you win by taking every city or by being the last army standing.
  The first version is land only: his four ground units and two of the defense
  guns (the AA guns wait for aircraft). Guns stay where they're bought. A
  bought unit goes on the city or a free square next to it, and moves next
  turn. The computer buys one unit per city a turn: with two, it swamped a test
  game with 41 units. Strings are in `STR`. A game in progress is saved under
  `conquest` at the start of each of your turns. It has a home page card (4 Nov) so his friends can play it.
  Decided 6 Nov: the rules aren't a list on the start card any more. How to
  play is a button (start card, setup card, and the ? in the top bar during a
  game) that opens a picture book, `GUIDE`: ten pages, each a little moving
  scene drawn with the game's own map and units (`paintTiles`, `drawUnit`)
  and one short line. The money line and the last page ("Your level") are
  worked out from `LEVELS`, so they follow the level picked (the game's own
  level mid-game) and stay right if the levels change.
  Decided 4 Nov, after his first long game stalled at turn 80 behind enemy
  guns: aircraft. Air and ground are two layers (a square holds one of each;
  tapping again steps from the air unit to the ground unit to the city).
  Planes and helicopters fly over anything, and in the air only units that
  fire at air (`hits` has `A`) can hit them. Planes carry 10 fuel (`FUEL`),
  one per square; a turn in the air without moving burns 2 (`CIRCLE`), so only
  helicopters hover; ending a move on your own city lands it and it fills up
  next turn; a landed plane can be hit by anyone and is lost if the city
  falls; a plane at 0 fuel in the air crashes. Aircraft are bought onto the
  city's air spot. The ground attack bomber's fire burns 2 more turns, 1
  health a turn (`BURN`, a guess to check with him). The artillery gun was too
  strong, so after it fires it reloads through your next turn. Aircraft are
  drawn bigger than a square, with a shadow, because his planes are thin
  drawings and were hard to see squeezed into one.
  Decided 4 Nov: defense guns, AA guns and missile AA can be built on any empty
  land square touching one of your units (corners count), as long as no enemy
  can fire on it: tap the square to open the build panel. Artillery guns are
  built only in cities. The computer still builds guns only in its cities.
  Decided 5 Nov, after he kept running out of money and getting pushed back
  until he lost: a level choice (`LEVELS`) on the start, new-game and end
  cards. Easy (the default) gives the computer half its city money, a 50%
  chance to buy in each city, and no aircraft until turn 10, and you start
  with 6. Normal is 75%, turn 6, start 4. Hard is the old computer. Saves from
  before then play as Normal. AA guns, missile AA and AA tanks fire on their
  own (`aaReact`) at an enemy aircraft that moves into range, or before it
  fires from in range, once each enemy turn. The AA tank's range is 3 (was 2)
  so it isn't outranged by aircraft. Guns (anything `fixed`) are dug in and
  take half damage.
  Decided 5 Nov, his next round: bombers drop bombs only on a ground target 1
  square away (`rngG`); their guns still reach aircraft from range. The map is
  twice as wide (24 by 14, `CORNER` mirrored into four corners) and scrolls
  sideways where it doesn't fit. Four teams, green, red, yellow and blue
  (`TEAMS`, turn order), each played by a player on this device or by the
  computer, picked on the New game card; with two or more players a Pass the
  device card comes between turns. Each team flag has its own shape (square,
  pennant, swallowtail, two bars) so colour isn't the only signal. Teams have
  a score with each other (`G.rel`), starting at 0: firing on a team or taking
  its city takes off half a point, at most once a turn; giving it 4 money (the
  Teams card) adds half a point. At +1 they're allies: no firing on each other,
  no taking each other's cities, and allies left alone at the end win
  together. You can't become allies with a team while you're allied with a
  team it dislikes. At -2 they're enemies for good, and it stays there.
  Computer teams leave neutral teams alone while free cities remain, fight
  teams they dislike, and once every city is owned go after anyone who isn't
  an ally; they don't give money yet. AA fires on its own only at aircraft of
  teams that dislike it. The level now sets the computer teams' money.
  Saves are `v: 2`; the two-team saves from before can't be loaded.
  Decided 5 Nov, from a play-test: on your turn each unit shows a filled
  yellow square if it hasn't moved, an empty one if it has moved and can still
  fire, and nothing (greyed out) when it's done.
- `og-image.png`, `apple-touch-icon.png`, `favicon.ico` and `brand/github-social-preview.png`
  are rendered from the matching `brand/*.html` with headless Chrome
  (`--headless=new --window-size=1200,630 --screenshot=...`); favicon.ico comes
  from a 64 px render via `sips -s format ico`. Bump `?v=` in the meta tags when
  an image changes, or link previews keep the old one. Decided 3 Nov: the duck
  is 8-bit, and the two share pictures are 8-bit scenes drawn by
  `brand/pixel-scene.js` ("games for kids, by kids", with sprites copied from
  the games instead of emoji). They wait for the pixel font, so render them
  with `--virtual-time-budget=6000`.
- `shared/files.js` is the save-file picker for Bread and Math Force. Decided
  29 Oct (#44): like a console game, three save files per game that anyone can
  play, with Copy and Erase (a copy into an empty file can be renamed). A file
  is `<game>:file<n>` plus its name and buddy in `<game>:files`. This replaced
  the shared player list from 28 Oct (#41): a save from before players went to
  whoever picked first, with no way to give it to the right kid. The first
  time, each player's save (`<game>:<player id>`) became a file named after
  them; the old keys are left in place. Treasure Trail keeps its own players.
  Sound is one setting per game for the whole computer (`<game>-sound`).
- Decided 5 Nov: the home page lists the games in order by name.
- Each game folder has a `card.png`, the picture on its home page card (the
  cards are arcade cabinets; the whole card is the link in, Play on the right).
  They are rendered from `brand/capture.html`; how is written at its top.
- `treasure-trail/index.html` is the whole game in one file ("Treasure Trail" is a working title): no build step,
  no libraries. It runs offline when you double-click it.
  It is the only game that speaks (the browser's own voice). Decided 5 Nov:
  `voiceScore` picks the best English voice on the device (natural, enhanced
  and premium first, novelty voices never); letters are said by name
  (`LETTER_NAMES`) and words a little slower. Recorded clips were the other
  option and are parked: most lines are sentences built on the fly, so clips
  would only cover the letters and words, in a second voice.

## Rules

- **This repo is public.** No family names, photos, ages or anything else that
  identifies the kids. The game's default players are "Player 1–3", and each
  family renames them in the browser.
- Commits use the studio identity, `Rubber Duck Games <hello@rubberduckgames.com>`,
  set in this repo's local git config. Check `git log --format='%an <%ae>'`
  before pushing.
- Progress lives in the browser's localStorage (`treasure-trail`, and one key
  per save file for Bread and Math Force). There's no server and no account yet; a
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
- Bread's and Tugboat's strings are inline, not in a catalogue, like Treasure Trail's.
- A save file can't be renamed after it's made, except by copying it into an empty file.
