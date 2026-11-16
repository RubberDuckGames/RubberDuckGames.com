# RubberDuckGames.com

Public repo: only the files GitHub Pages serves at rubberduckgames.com.
Decided 16 Nov (#52): the games' source, notes and tools live in the private
`RubberDuckGames/Games` repo, next to this folder, and its `release.py` copies
the playable files in here. Zombies of Tomorrow is released here by its own
private repo, `RubberDuckGames/ZombiesOfTomorrow`.

Don't edit or branch here. Make the change in `../Games`, merge it there, run
`python3 release.py`, then commit this repo ("Release: …") and push when asked.
