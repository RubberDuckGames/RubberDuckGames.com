// The Flip Shop (working title). The oldest kid tester's idea, 26 Nov (Trello
// #60): a twist on Barn Secrets. In Barn Secrets you find things; here you buy
// finds cheap, work out what they're really worth and sell them from your own
// little shop.
//
// Version 1 is the foundation, from the card: one cramped shop seen from
// above in 8-bit, one place to buy (the Oakridge Suburbs yard sales), seven
// kinds of find, the appraisal camera bolted to the desk, price tags or a
// quick sale to the dealer, customers who haggle at the register, and the
// Rent Pool. Everything in the card's "Later" list (the city map, auctions,
// storage units, licenses, vehicles, expansion, the arcade cabinet, the jet)
// waits for a build of its own.
//
// A day: go out to the yard sales in the morning (once), buy by eye, come
// back, snap each find at the desk to see what it's worth, tag it and put it
// out, then open the shop until 5 PM. Every sale is rung up at the register
// and split: what you paid for the find goes into the Rent Pool, only the
// profit goes in your pocket. Rent comes out of the pool once a week.
const $ = s => document.querySelector(s);

// ---------- Words ----------
// Every visible string is here by key, whole sentences with {placeholders}
// (the parent rule for a new product). Lists are picked from at random.
const STR = {
  title: 'The Flip Shop',
  intro: 'Buy old finds at yard sales, work out what they\'re really worth, and sell them in your own little shop. Make the rent.',
  pickFile: 'Pick a file', fileSum: 'Day {day} · ${pocket}', cancel: 'Cancel', close: 'Close', done: 'Done', back: 'Back', keepPlaying: 'Keep playing',
  shop: 'The shop', stick: 'Walking stick', helpBtn: 'How to play', closeHelp: 'Close help', soundBtn: 'Sounds on or off',
  help: [
    '<b>Walk:</b> arrow keys, WASD, the stick, or tap where to go.',
    '<b>Buying:</b> each morning the front door has two yard sales and the swap meet to pick from. Judge each find by eye: look for the tells.',
    '<b>Use:</b> Space or the Use button, next to a table, the desk, the register or the door. Or tap the thing itself.',
    '<b>The desk:</b> the camera there shows what a find is really worth. Set its price tag, then put it out on a table.',
    '<b>Quick sell:</b> the dealer buys it at the desk right away, for less than it\'s worth.',
    '<b>Every sale:</b> what you paid goes into the Rent Pool. Only the profit goes in your pocket.',
    '<b>Buyers:</b> bargain hunters come all day and offer low. Collectors pay the most, but nobody knows when one will walk in, and some days none come at all.',
    '<b>Condition:</b> every find is 1 to 5, broken to mint. Scuffs mean a worn one, a white twinkle a mint one. The camera says exactly; the field guide (at the desk) says roughly before you buy.',
    '<b>Mystery boxes:</b> five things inside. Anything illegal goes to the police: selling it gets you arrested.',
    '<b>More places:</b> the dump (sweep junk piles on a clock; three sweeps to a pile) and your own table at the swap meet (bring up to 5 tagged finds, ring buyers up at the table).',
    '<b>Old computers:</b> the camera says what decade one is from, and older is worth more. A dead one won\'t turn on: look for the power light.',
    '<b>The play corner:</b> set up a working computer and a game cartridge or two in the corner, and players pay $15 a go while the shop is open.',
    '<b>Other flippers:</b> sometimes a rival is at the sales too. He buys what he likes, so a good find won\'t wait for you. What he passes on tells you something too.',
    '<b>Bidding:</b> now and then a second buyer wants the same find and offers more at the register. Take it, or stick with the first.',
    '<b>Tools:</b> the swap meet has stalls of used tools (check for broken ones) and cheap new tools of who-knows-where (check for knockoffs).',
    '<b>Car parts:</b> hubcaps, whitewall tires, hood ornaments and more from the 1930s to the 1970s. Chrome shines; the copies don\'t.',
    '<b>The workbench:</b> buy one at the online store. Leave a find on it to clean (better condition) or fix (it works again). Jobs take hours of shop time, parts cost money up front, and a fix can fail. The bench holds 3. Copies can\'t be fixed. With a bench, the sales show how long a fix would take.',
    '<b>Getting about:</b> you start on foot, carrying 3 things to one yard sale a day. A used bike turns up at yard sales (5 things, downtown and the swap meet). Downtown, a beat-up truck comes up for sale now and then (12 things, big ones too, everywhere). Your old ride is traded in.',
    '<b>Downtown:</b> houses with a sign out are having a yard sale, and your rival has a shop. He prices high, but sometimes he gets one wrong.',
    '<b>Your rival:</b> he comes into your shop too, and snaps up anything you\'ve priced far too low.',
    '<b>Good deeds:</b> tell a seller their find is worth more, let a kid have a toy for what they have, mail a photo album home, help your rival, give things away at the box by the door. Sometimes kindness comes back to you. Sometimes it doesn\'t. Your good deeds are listed at the bottom of this help.',
    '<b>Bigger shops:</b> at the rent board, move to a bigger shop once you\'ve paid enough rents on time: more places to put things out, more customers, more rent. Pick a landlord when you move: cheap and strict, fair, or kind.',
    '<b>Be kind:</b> sometimes a seller is hunting for something another stall has. Buy it and bring it to them.',
    '<b>The online store:</b> at the desk. Everything costs too much and there\'s no haggling, but sometimes it\'s the only place to get what you need.',
    '<b>Quiet days:</b> some days are slow, and around lunch the street goes quiet. Not everyone who comes in buys.',
    '<b>Battleships:</b> three big models are out there. Keep one in the ship case, or take it out and sell it; sold, it may turn up again.',
    '<b>Help:</b> H or ?. A controller works too.',
  ],
  // the action button, by what's in reach
  use: 'Use', actCorner: 'Games', actKid: 'Talk', actDesk: 'Desk', actTable: 'Table', actRack: 'Rack', actCase: 'Case', actRegister: 'Register', actDoor: 'Door', actBoard: 'Rent', actLook: 'Look', actCar: 'Car', actSeller: 'Talk',
  // the bar
  day: 'Day {n}', dayClock: 'Day {n} · {clock}', pocket: 'Pocket ${n}', pocketShort: '${n}',
  pool: 'Rent Pool ${n} of ${rent}', poolShort: 'Rent Pool ${n}/${rent}',
  // goals, for the ? help
  goalYardGo: 'Go out the front door and pick where to buy today.',
  goalYard: 'Look over the tables and buy what looks good. Your car takes you back to the shop.',
  goalDesk: 'Take your finds to the desk. Snap a photo to see what each one is worth, then give it a price tag.',
  goalTable: 'Put your tagged finds out on the tables.',
  goalOpenShop: 'Open the shop: go to the front door.',
  goalOpen: 'The shop is open. Customers ring up at the register.',
  goalRegister: 'A customer is waiting at the register.',
  // the door
  doorTitle: 'Front door', doorText: 'Morning, day {n}. Where do you want to go buying?',
  openShop: 'Open the shop', beenYard: 'You\'ve been buying today. More sales tomorrow.',
  nothingOut: 'Nothing is out on the tables yet, so nobody will buy anything.',
  closeTitle: 'Close up early?', closeText: 'It\'s {clock}. Close the shop for the day?', keepOpen: 'Keep it open', closeUp: 'Close up',
  // the yard sale
  // where to buy, picked at the front door each morning
  sales: {
    garage: { name: 'Garage sale on Maple Street', line: 'Tools, glass and old things from the garage.' },
    toys: { name: 'Toy sale on Birch Lane', line: 'Old toys, and a whole lot of plastic.' },
    cat: { name: 'Cat lady\'s yard sale on Elm Street', line: 'Hairball sculptures. She says they\'re art.' },
    swap: { name: 'Oakridge Swap Meet', line: 'Stall after stall of everything. Entry is ${fee}.' },
    sell: { name: 'Sell at the swap meet', line: 'Rent a table for ${fee} and bring up to 5 tagged finds. Selling takes the day, so the shop stays shut.' },
    downtown: { name: 'Downtown', line: 'Main Street. Some houses have yard sales out, and your rival has a shop there.' },
    dump: { name: 'Oakridge Dump', line: 'Sweep through the junk piles for {time} seconds. Whatever you find is yours. Entry is ${fee}.' },
  },
  // what each seller says when you talk to them
  sellers: {
    garage: ['Everything must go!', 'Cleaning out the garage.', 'Grandpa kept everything.', 'Ask if you want a deal.'],
    toys: ['My kids grew up. Everything goes!', 'Toys! Lots of toys!', 'Some of these are older than me.'],
    dump: ['Fifty bucks, sixty seconds. Go!', 'Mind the smashed tablets.', 'Whatever you dig up is yours.'],
    house: ['Just clearing out the attic.', 'My grandma kept everything!', 'Make me an offer.', 'Moving next week. It all goes!'],
    rivalshop: ['Top quality. Top prices.', 'No haggling. Well. A little.', 'You want it? Pay for it.', 'Heh. Look who it is.'],
    cat: ['Hairball sculptures! Every one is a work of art.', 'Mittens made that one all by herself.', 'Don\'t mind the cats. They\'re the artists.', 'Each sculpture took years. Of coughing.', 'Fluffy is in her blue period.'],
  },
  stalls: {
    toys: ['Toys from every year! Mostly plastic.', 'Some old, some new. You tell me which.'],
    glass: ['Careful, it\'s all glass.', 'Hold it up to the light!'],
    tools: ['Good old tools. Heavy stuff.', 'They don\'t make them like this any more. Some of them.'],
    old: ['Old things from old farms.', 'Everything here is older than me.'],
    cameras: ['Cameras! Take a look through one.', 'Some of these still work!'],
    cat: ['Hairball sculptures! Fresh this morning!', 'The cats are very proud of their work.'],
    boxes: ['Sealed boxes! What\'s inside? Nobody knows!', 'Every box a surprise!'],
    junk: ['Everything a dollar or two. Well, mostly.', 'Junk! Beautiful junk!'],
    // these stalls had no lines, so their sellers said "undefined" (fixed 27 Nov)
    trains: ['All aboard! Trains and train things.', 'My grandpa ran a model railroad.'],
    surplus: ['Army surplus! The real stuff, mostly.', 'Canteens, shovels, you name it.'],
    books: ['Books and comics. Check the dates!', 'A dollar a book. Rare ones cost more.'],
    ducks: ['Rubber ducks! Squeak, squeak!', 'Old ducks and new ducks.'],
    models: ['Built every one of these by hand.', 'Careful, they\'re heavy.'],
    computers: ['Old computers! Some even turn on.', 'They don\'t make them beige any more.'],
    games: ['Game cartridges! Blow in them first.', 'Gold ones are rare. Most are paint.'],
    carparts: ['Parts from old cars! 1930s to 1970s.', 'Hubcaps, lamps, you name it.', 'Off cars older than your grandpa.'],
    usedtools: ['Second-hand tools. Some work great!', 'Used, not abused. Mostly.', 'If it\'s broken, it\'s a dollar off.'],
    newtools: ['Brand new tools! Still in the box!', 'Cheaper than the store. Way cheaper.', 'Where are they from? Uh... a warehouse.'],
    shady: ['No questions, okay?', 'Brand new. Don\'t ask where from.', 'Cash only. Quick, quick.'],
  },
  // your own table at the swap meet (the oldest kid tester's ask, 26 Nov)
  pickTitle: 'Sell at the swap meet', pickText: 'Pick up to {max} tagged finds to bring. The table costs ${fee}.',
  pickNone: 'Nothing tagged to bring. Give finds a price tag at the desk first.', pickBig: 'The battleship is too big for a folding table.',
  pickGo: 'Go sell ({n})', pickCount: '{n} of {max} picked',
  meetHello: 'Your table is set up. Buyers walk the stalls.', meetClosing: 'The swap meet is closing. Pack up and drive back.',
  meetMine: 'Your table. When a buyer waits with a $, come here to ring it up.', actMyTable: 'Your table',
  meetDone: 'Back from the swap meet. Unsold finds go into the back room.',
  goalMeet: 'Buyers stop at your table. Ring them up there. Drive back when you\'re done.',
  // the dump (his ask, 26 Nov)
  dumpHello: 'The dump! {time} seconds. Sweep the piles with your broom.', dumpFee: 'You paid ${n} at the gate.',
  dumpNothing: ['Just junk.', 'Old tires and rust.', 'Nothing but broken chairs.', 'A sad pile of nothing.'],
  dumpTablet: 'A smashed tablet. Worth nothing.', dumpFound: 'Found a {item}!',
  dumpJet: 'A whole fighter jet under the scrap! How did the dump guy miss that? It won\'t fit in your car.',
  dumpOver: 'Time\'s up! The dump guy waves you out.', dumpLeft: 'Dump {s}s', actSweep: 'Sweep', swept: 'Already swept.',
  goalDump: 'Sweep the junk piles before time runs out. Your car is by the gate.',
  // the play corner (the oldest kid tester's ask): a working computer and its
  // cartridges, and players pay to play
  cornerTitle: 'The play corner', cornerText: 'Set up a working computer and some game cartridges. Players pay ${n} a go while the shop is open.',
  cornerPc: 'Computer', cornerCarts: 'Cartridges ({n} of {max})', cornerNoPc: 'No computer set up.', cornerNoCarts: 'No cartridges yet. Nobody plays without a game.',
  cornerAdd: 'From the back room:', cornerNone: 'Nothing for the corner in the back room. Old computers and game cartridges turn up at sales.',
  cornerSetUp: 'Set up', cornerTake: 'Take it out', cornerFull: 'The corner holds {max} cartridges.',
  pcDead: 'It won\'t turn on. This one is dead.', pcOn: 'Beep! The {item} boots up.',
  cornerReady: 'The play corner is open for players.', playPaid: 'A player paid ${n} for the play corner.',
  gamerSays: ['Pew pew!', 'One more level!', 'High score!', 'Jump! JUMP!', 'Aw, so close!'], gamerIn: ['Is the computer free?', 'Can I play?'],
  dayPlays: 'Play corner: {n} plays, ${cash}.',
  // the rival flipper (27 Nov)
  rivalHere: 'Another flipper is here. He\'s after the good stuff too!', rivalGot: 'The other flipper bought the {item}.',
  rivalTook: ['Mine!', 'Ooh, nice.', 'Sold! To me.', 'Don\'t mind if I do.'], rivalPass: ['Nah.', 'Seen better.', 'Hmm. No.'], rivalBye: 'Got what I came for.',
  // a second buyer bidding at the register (27 Nov)
  bidSay: ['Wait! I\'ll pay ${n} for that!', 'Hold on! I\'ll give you ${n}!'], bidText: 'Another buyer wants it too, and offers ${n}.',
  bidSell: 'Sell to the other buyer ${n}', bidCut: ['Hey! I was first!', 'No fair!'], bidAw: ['Aw, too slow.', 'Next time, then.'],
  // the workbench (his ask, 27 Nov)
  actBench: 'Bench', benchTitle: 'The workbench', benchText: 'Leave finds on the bench to clean or fix. The bench works while the shop is open, parts are paid up front, and it holds {n}.',
  benchOn: 'On the bench', benchFrom: 'From the back room', benchEmpty: 'Nothing on the bench.', benchNone: 'Nothing in the back room the bench can help with. Snap finds at the desk first.',
  benchFull: 'The bench is full. Wait for a job to finish, or take something off.',
  benchClean: 'Clean · {d} · ${n}', benchFix: 'Fix · {d} · ${n}', oneHour: '1 hour', manyHours: '{n} hours', shopDays: '{n} hours (about {d} shop days)',
  benchCleaning: 'Cleaning · {h} left', benchFixing: 'Fixing · {h} left', benchTake: 'Take it off',
  benchStarted: 'On the bench. It needs {h} of shop time.', benchLook: 'Bench: if it\'s broken, a fix takes {h} and about ${n} in parts.', benchTook: 'Off the bench. The parts money is gone.',
  noParts: 'Nobody makes parts for this any more. It can\'t be fixed.',
  benchCleaned: 'The bench: the {item} is clean. {cond} now, worth ${n}.',
  benchFixed: 'The bench: fixed! The {item} works again. Worn, but worth ${n}.',
  benchFail: 'The bench: the {item} was beyond saving. The parts are spent, and it still doesn\'t work.',
  storeBench: 'Workbench with a vise and tools', storeBenchNote: 'Clean and fix finds in the shop.', benchArrives: 'The workbench arrives. It\'s by the rack.',
  // the dump lady and the tank (his idea, 27 Nov)
  ladyLost: '“I\'ve lost my locket somewhere in these heaps. Gold, shaped like a heart. It was my mother\'s. Have you seen it?”',
  ladyAgain: '“Still no locket? Keep your eyes open, dear.”', ladyFound: 'You hold up the gold heart locket. Her hands fly to her mouth. “My mother\'s locket!”', ladyGive: 'Give her the locket', locketFound: 'A gold heart locket! It must be the dump lady\'s.',
  ladyThanks: '“My locket! Oh, thank you. Nobody ever brings anything back here.” She wipes her eyes. “Follow me. I\'ve got something I\'ve kept hidden for years.”',
  ladyHere: 'She points at the biggest heap in the dump. “Under there. Sweep it off.”', ladyDone: '“Take good care of her.”',
  actLady: 'Talk', actHeap: 'Sweep', ladyName: 'The dump lady',
  tankTitle2: 'A tank!', tankFound: 'Under the heap is an old army tank. “My husband drove her home from the war,” says the dump lady. “She\'s yours now.” It doesn\'t fire, and it never will, but it runs.',
  tankMuseum: 'Sell it to the museum ${n}', tankKeep: 'Keep it', tankKept: 'The tank rumbles home and parks outside the shop. People come just to see it.',
  tankSold: 'The museum sends a truck. ${n}, and a plaque with your name on it.', tankOut: ['Is that a TANK?', 'Whoa, a real tank!', 'Can I sit in it?'],
  // the frogs, their tank and the online store (his ideas)
  actTank: 'Frogs', openHotel: 'Open the box', hotelNote: 'An old hotel box, taped shut. Stamped 1958. Something inside is... croaking?',
  frogsTitle: 'Frogs!', frogsText: 'Five live frogs hop out of the box. From 1958? How? They need a glass tank. The online store at the desk has one.',
  frogsInTank: 'Five live frogs hop out of the box. From 1958? How? Into the tank they go.',
  frogsWait: 'The frogs are waiting in their box. They need a glass tank: the online store at the desk sells one.',
  storeBtn: 'Online store', storeTitle: 'The online store', storeSearch: 'You searched: glass tank',
  storeNote: 'No haggling, and everything costs too much. A tank like this is about ${n} anywhere else.',
  storeJunk: ['Glass tank top, size XXL', 'Tank engine toy, wheels sold separately', 'Think tank: a book about thinking', 'Fish tank cleaner, pack of 99'],
  storeJunkPrice: ['$35', '$60', '$28', '$99'], storeNope: 'Not what you need',
  storeTank: 'Glass tank, 20 gallons', storeBuy: 'Buy ${n}', storeHave: 'Bought',
  tankArrives: 'The tank arrives. The frogs move in!', tankEmpty: 'The tank arrives. It\'s empty for now.',
  tankTitle: 'The frog tank', tankText: 'Five frogs from 1958, alive and well. People come in just to see them. They\'re not for sale.',
  tankNone: 'An empty glass tank.', frogSeen: ['Ooh, frogs!', 'Look at the frogs!', 'Ribbit!'],
  // a seller looking for something another stall has (Randi, 27 Nov)
  wishShout: 'Anyone seen a {item}?', wishNote: '“I\'ve been looking all over for a {item}. Have you seen one anywhere?”',
  wishGive: 'Give them the {item}', wishThanks: 'Oh, thank you! That\'s so kind. Here, take this. It was my great-grandma\'s.',
  wishThanksAgain: 'Oh, thank you! That\'s so kind. Here, for your trouble.', wishGot: 'You got the {what}.', wishTip: 'They give you ${n}.',
  // good deeds (Randi, 27 Nov: kindness breeds more kindness; it doesn't
  // always pay, and that's not the point)
  honestBtn: 'Tell them it\'s worth more', honestKeep: '“Really? Then I\'ll keep it! Thank you for being honest.”',
  honestSell: '“You\'re honest. I like that. It\'s still yours, for ${n}.”', honestDud: '“Really? Huh. I\'ll think about it. Thanks!”',
  honestGone: 'They kept it. Being honest cost you the deal.',
  kidcWants: 'They really want the {item} (tag ${tag}), but they only have ${n}.', kidcSell: 'Sell it for ${n}', kidcNo: 'Not today',
  kidcHappy: ['Thank you! Thank you!', 'Best day ever!'], kidcSad: 'Oh. Okay...', kidcIn: ['Ooh, toys!', 'Mom said I could look.'],
  mailBack: 'Mail it back ${n}', mailed: 'Wrapped up and mailed to the name inside. ${n} in stamps.',
  mailLetter: 'A letter came: “Thank you for sending back our family album. We thought it was gone forever.”',
  mailGift: 'A letter came with the album\'s thank-you note, and ${n} tucked inside.',
  rivalStuck: 'Ugh! My truck won\'t start!', rivalHelpTitle: 'Your rival', rivalHelpText: 'His truck won\'t start. He\'s kicking the tire.',
  rivalHelp: 'Give him a jump start', rivalTip: '“...Thanks. Hey. There\'s a sale tomorrow with something good on the table. Don\'t tell anyone I told you.”',
  rivalThanks: '“...Thanks, I guess.”', rivalWhatever: '“Whatever. I had it.”', actRival: 'Help',
  tipHere: 'Your rival\'s tip was good. Something real is on a table here.',
  actDonate: 'Give', donateTitle: 'The donation box', donateText: 'Things nobody buys can still help someone. Pick something to give away.',
  donateNone: 'Nothing in the back room to give.', donateBtn: 'Give it', donated: ['The shelter will love the {item}.', 'The library says thank you for the {item}.', 'The school will find a use for the {item}.'],
  friendIn: ['I heard you\'re an honest shop!', 'My neighbor says good things about you.', 'My kid still talks about your shop!'],
  deedsTitle: 'Good deeds', deedsNone: 'None yet.',
  deed: { honest: 'told a seller their find was worth more', kid: 'let a kid have a toy for what they had', album: 'mailed a family album home',
    rival: 'helped your rival when his truck wouldn\'t start', donate: 'gave away the {item}', wish: 'found a seller what they were hunting for', locket: 'gave the dump lady her locket back' },
  deedLine: 'Day {day}: {what}.',
  // the kid selling sporks (his idea, 27 Nov)
  kidTitle: 'A kid selling sporks', kidHello: ['Sporks! A dollar each! It\'s a spoon AND a fork!', 'Get your sporks! Only one dollar!'],
  kidBuy: 'Buy a spork $1', kidAsk: 'Ask about the sporks', kidBought: 'Thank you! Enjoy your spork!',
  kidStory: '"Where did you get all these sporks?" "My dad had a whole box. He has boxes of everything. Hey, do you want this too? It\'s just an old baseball card. You can have it for free!"',
  kidNoMore: '"Dad found out about the card. Now I\'m only allowed to sell sporks."', kidGot: 'Got an old baseball card. Snap it at the desk.',
  // slow days and quiet spells (Randi, 27 Nov: "times when no one buys")
  mood: { busy: 'Sunny out. It\'s going to be a busy one!', normal: '', slow: 'Rainy day. Not many people are out.' },
  lull: 'Lunchtime. The street goes quiet.', justLook: ['Just looking!', 'Only browsing, thanks.', 'Nice shop!', 'I\'ll think about it.'],
  // the cat lady finds love (his idea, 26 Nov)
  catFanIn: 'Is that... a hairball sculpture?', catFanBuy: 'Who made this? I simply must meet the artist.',
  loveTitle: 'A letter in the mail', loveText: 'Dear shopkeeper, the gentleman who bought "{title}" came to Elm Street to meet the artist. He stayed for tea. Then dinner. We\'re getting married in the spring, and the cats approve! Thank you for selling my art. With love, the cat lady (and Mittens, Fluffy and Sir Whiskers)',
  loveGift: 'Tucked in the card: ${n}.', loveTitleNone: 'her finest work', tooPoorFee: 'You need ${n} to get into the swap meet.',
  swapHello: 'The Oakridge Swap Meet! Walk the stalls.',
  hotNote: 'Brand new, with the store tag still on. Why is it so cheap?',
  catNo: ['Fluffy worked hard on that!', 'That price is firm. Mittens says so.', 'Art is priceless. Well. It\'s that price.'],
  shadyYes: ['Fine, fine. ${n}. Hurry.'],
  // the police at the swap meet
  copsCome: 'Police! Somebody called the police on the DEALS stall.',
  thiefRun: 'Gotta go!', copsShout: 'Stop right there!',
  copsStolen: 'Those were stolen from a store. They go back to their owner.',
  copsTitle: 'Stolen goods', copsTook: 'The officer takes back what you bought from the DEALS stall: {items}. It was stolen, so it goes back to its owner, and the ${n} you paid is gone.',
  copsShopTitle: 'An officer at the door', copsShop: 'What you bought at the DEALS stall was stolen from a store: {items}. It goes back to its owner, and the ${n} you paid is gone.',
  copsOk: 'Okay',
  toss: 'Throw it out', tossed: 'Into the trash it goes.', tossNote: 'Nobody will buy this. Not even the dealer.',
  // buyers in the shop
  buyers: { rivalc: 'Your rival', kidc: 'A kid', friend: 'A friendly face', hunter: 'A bargain hunter', regular: 'A shopper', collector: 'A collector', catfan: 'A man who loves cat art' },
  hunterSays: ['I\'ll give you ${n}. Cash.', 'How about ${n}? It\'s a bit worn.'],
  collectorIn: ['Anything rare today?', 'I collect these!', 'Let\'s see what you\'ve got.', 'Is this the flip shop?'],
  ask: 'Asking', yourPocket: 'You have ${n}.', buy: 'Buy ${n}', leave: 'Leave it', askLess: 'Ask for less',
  hgText: 'Stop the line in the green for a big discount, or the yellow for a small one.', hgStop: 'Stop!',
  hgBig: '30% off', hgSmall: '15% off', hgMiss: 'Missed! The price stays.',
  sellerYes: ['Oh, fine. ${n}.', 'For you? ${n}.', 'Sure, ${n}. It\'s just taking up space.'],
  sellerNo: ['Sorry, that price is firm.', 'Nope, that\'s a fair price.', 'I could get more on the internet!'],
  bought: 'Bought the {item} for ${n}.', tooPoor: 'Not enough money in your pocket.',
  sealedNote: 'Sealed tight. No peeking. Could be junk, could be treasure.',
  // getting about (his ask, 27 Nov): on foot, a bike, a car, a truck, the tank
  rides: { foot: 'feet', bike: 'bike', car: 'car', truck: 'truck', tank: 'tank' },
  actRide: { foot: 'Home', bike: 'Bike', car: 'Car', truck: 'Truck', tank: 'Tank' },
  rideHome: { foot: 'Walk back', bike: 'Ride back', car: 'Drive back', truck: 'Drive back', tank: 'Drive the tank back' },
  rideNow: { foot: 'You\'re on foot: you can carry {n} things and walk to one yard sale.', bike: 'You have a bike: the basket holds {n}, and it gets you downtown and to the swap meet.', car: 'You have the car: it holds {n}, and goes anywhere.', truck: 'You have the truck: it holds {n}, big things too, and goes anywhere.', tank: 'You have the tank. It holds {n}, goes anywhere, and everyone stares.' },
  needBike: 'You need a bike to get there.', needCar: 'You need a car or truck for this.', tooFar: 'Too far to walk.',
  carryFull: 'Your {ride} can\'t carry any more today ({n} is the most).', tooBig: 'Too big for your {ride}. You\'d need a car or truck.',
  rideSale: {
    bike: { name: 'A used bike for sale', line: 'A little rusty, but the tires hold air. A basket on the front holds 5 things, and it can take you downtown.' },
    truck: { name: 'A beat-up truck for sale', line: 'Dents everywhere and one door is a different color, but it starts every time. It holds 12, even big things.' },
  },
  rideGotTitle: 'Your new {ride}!', ridePrice: 'Price', rideTrade: 'Trade in your {ride}', ridePay: 'You pay', rideBuy: 'Buy it ${n}', rideGot: 'It\'s yours! {line}',
  rideGotLine: { bike: 'Ride it home.', truck: 'Vroom. Well, cough, then vroom.' },
  tankGasp: 'Is that a... TANK?!', tankStunned: 'Your rival just stands there staring at the tank.',
  // downtown (his ask, 27 Nov): Main Street, house sales, the rival's shop
  goalDowntown: 'Walk Main Street. Houses with a sign out are having a yard sale, and your rival has a shop.',
  // the rival comes into your shop
  rivalIn: ['Just browsing. Heh.', 'Nice little shop you got.'], rivalSucker: ['Thanks, sucker!', 'Pleasure doing business. Heh heh.'], rivalNothing: 'Nothing here for me.',
  // the ship case
  fleetOut: 'Take it out', fleetOutDone: 'The {name} is back in the back room. Put it in the glass case to sell it.',
  carTitle: 'Back to the shop?', carText: 'You bought {n} today.', carNone: 'You didn\'t buy anything.', drive: 'Drive back', stay: 'Keep looking',
  yardEmpty: 'Sold out! Back to the car.',
  // the desk
  deskTitle: 'The desk', deskText: 'The appraisal camera is bolted to the desk. Pick a find.', deskEmpty: 'Nothing in the back room. Buy finds at the yard sales.',
  paid: 'You paid', worth: 'Worth', worthUnknown: '?', tag: 'Price tag', noTag: 'No tag',
  snap: 'Snap a photo', snapped: 'Flash! Worth ${n}.', openBox: 'Open the box', boxOpened: 'Inside: {item}! Worth ${n}.',
  quick: 'Quick sell ${n}', quickNote: 'The dealer buys right away, but pays only part of what it\'s worth.',
  putOut: 'Put it out', putHere: 'Put it here', takeBack: 'Take it back', noRoom: 'Every table is full.', needTag: 'Give it a price tag first.',
  tagLabel: 'Price tag $', less: '− $5', more: '+ $5',
  unknownNote: 'Snap a photo at the desk to see what it\'s really worth.',
  // a spot on the floor
  spotTitle: { table: 'A table', case: 'The glass case', rack: 'The rack' },
  spotEmpty: 'Empty. Put a find out here?', spotNone: 'Nothing in the back room to put out.',
  // the rent board
  // bigger shops and landlords (his asks)
  boardMove: 'Move to a new shop', moveTitle: 'Shops for rent', moveText: 'A bigger shop has more places to put things out, and more people come in. Moving costs a deposit of one week\'s rent.',
  shops: { 1: { name: 'A little shop', line: '{n} places to put things out.' }, 2: { name: 'The corner thrift', line: '{n} places to put things out, and more people walk by.' }, 3: { name: 'A store on Main Street', line: '{n} places to put things out, on the busiest street in town.' } },
  moveNeed: 'Pay {n} rents on time first.', moveHere: 'You\'re here.', moveLook: 'See landlords',
  lordTitle: 'Pick a landlord', lordText: '{shop}. Moving costs a deposit of one week\'s rent.',
  lords: {
    crabtree: { name: 'Mr. Crabtree', line: 'Cheapest rent in town. Late? That\'s a ${late} fee, and every new lease costs ${up} more a week.' },
    kettle: { name: 'Mrs. Kettle', line: 'Fair rent. A ${late} late fee, and ${up} more a week each new lease.' },
    bealou: { name: 'Bea and Lou', line: 'A bit more rent, but they never raise it, and once a lease, if you\'re short, there\'s no late fee.' },
  },
  lordRent: 'Rent ${n} a week', lordPick: 'Move in (deposit ${n})', moved: 'Moved in! {shop}, with {who} as your landlord.',
  boardLord: 'Your landlord is {who}.', rentShortNoFee: 'You\'re ${n} short. It carries over to next time.', forgiven: 'Bea and Lou say: pay the rest when you can. No late fee this time.',
  boardTitle: 'Rent', boardText: 'Rent is ${rent}, due on day {day}. The Rent Pool has ${pool}.',
  boardOwed: 'Still owed from last time: ${n}.', boardSplit: 'Each sale puts what you paid for the find into the Rent Pool. Only the profit goes in your pocket.',
  // customers and the register
  browse: ['Hmm.', 'Ooh.', 'Let\'s see...'],
  tooPricey: ['Too pricey!', 'No way, not at that price.', 'Maybe somewhere else.'],
  nothingHere: 'Nothing for sale?',
  wait: 'Ready to pay!', forget: 'Forget it.', thanks: ['Thanks!', 'Love it!', 'Pleasure doing business.'],
  regTitle: 'The register', regEmpty: 'Nobody is waiting to pay.',
  regPays: 'They want the {item}. Tag ${tag}. They\'ll pay the tag.',
  regOffer: 'They want the {item}. Tag ${tag}. They offer ${offer}.',
  ringUp: 'Ring it up', sellFor: 'Sell for ${n}', counter: 'Ask ${n}', noSale: 'No sale',
  deal: ['Deal!', 'Okay, okay. ${n}.', 'You drive a hard bargain.'],
  walkOff: ['No thanks.', 'Too much for me.', 'I\'ll pass.'],
  soldTitle: 'Sold!', soldText: 'Sold the {item} for ${n}.',
  splitText: '${cost} goes into the Rent Pool (what you paid). ${profit} profit goes in your pocket.',
  lossText: 'That\'s ${loss} less than you paid. All ${n} goes into the Rent Pool.',
  poolLbl: 'Rent Pool ${n}', pocketLbl: 'Pocket ${n}',
  // the day
  openMsg: 'Open! Customers come in until 5 PM.', closing: 'Closing time!',
  dayTitle: 'Day {n} is done', daySold: 'Sold today:', dayNone: 'Nothing sold today.',
  dayTotals: 'Pocket ${pocket}. Rent Pool ${pool}.',
  rentTitle: 'Rent day', rentPaid: 'Rent paid: ${rent}. ${fromPool} from the Rent Pool{more}.', rentMore: ', ${n} from your pocket',
  rentShort: 'You\'re ${n} short. The landlord adds a ${fee} late fee to next time.',
  rentNext: 'Next rent: ${rent}, due on day {day}.',
  nextDay: 'Next day',
  leaseNew: 'The lease is up. The new lease is ${rent} a week.', leaseLeft: 'Rent is weekly. {n} more on this lease.',
  morning: 'Day {n}. Rise and shine.',
  wonTitle: 'Three rents paid!', wonText: 'The shop made it through three rents. The landlord says hello for once.',
  // the finds. A real one and a dud look alike, except for the tell.
  kinds: {
    shovel: 'rusty shovel', plate: 'green glass plate', camera: 'old camera', grinder: 'meat grinder',
    scale: 'balance scale', lantern: 'brass lantern', box: 'sealed mystery box',
    robot: 'tin toy robot', tincar: 'tin toy car', figure: '80s action figure', junk: 'bag of plastic toys', hairball: 'hairball sculpture',
    insulator: 'glass insulator', typewriter: 'old typewriter', iron: 'flat iron', duck: 'rubber duck',
    sharpener: 'crank pencil sharpener', train: 'toy train in its box', bottle: 'black glass train bottle', sub: 'tin submarine',
    moviecam: '8mm movie camera', flashcam: 'folding camera with flash', shiplamp: 'copper ship lantern', radiometer: 'glass light mill',
    tlr: 'twin-lens camera', tablet: 'smashed tablet', boxcam: '1920s box camera', folding: '1930s folding camera', enlarger: 'photo enlarger',
    truck: 'moving truck toy', plane: 'tin airliner', biplane: 'tin biplane', ship: 'model battleship',
    canteen: 'army surplus canteen', comics: 'comic book', book: 'old book', plush: 'stuffed bear', present: 'wrapped present',
    milk: 'carton of expired milk', lint: 'ball of lint', pills: 'suspicious bottle',
    computer: 'old computer', cart: 'gold game cartridge', spork: 'spork', card: 'old baseball card',
    drill: 'old electric drill', handdrill: 'hand crank drill', mangle: 'clothes mangle', wrench: 'set of wrenches', saw: 'hand saw', toolbox: 'metal toolbox', toolset: 'new tool set in its case',
    hotelbox: 'old hotel box', globe: '1920s snow globe',
    musket: 'Revolutionary War musket', mirror: 'old mirror', album: 'old photo album', hubcap: 'chrome hubcap', tire: 'whitewall tire', hoodorn: 'hood ornament', headlamp: 'old car headlamp', license: 'old license plate',
  },
  pcName: '{d} home computer',
  shipName: 'model battleship {name}',
  ships: ['Missouri', 'Bismarck', 'Yamato'],
  // condition, 1 to 5 (the oldest kid tester's rule, 26 Nov)
  cond: ['Broken', 'Worn', 'Good', 'Crisp', 'Mint'], condLbl: 'Condition', condOf: '{w} ({q} of 5)',
  guideSays: ['Looks bad', 'Looks bad', 'Looks okay', 'Looks good', 'Looks good'],
  guideBuy: 'Buy the field guide ${n}', guideNote: 'The online field guide tells you roughly what shape a find is in before you buy it. It\'s overpriced.',
  guideGot: 'Field guide bought. Now you can judge condition at the sales.', guideHave: 'You have the field guide.',
  // the mystery box: five things
  boxFive: 'Five things inside', boxList: 'Out of the box:', boxMouse: 'a live mouse! It runs off into the shop.',
  mouseCaught: 'Caught the mouse! Out you go, little one.', mouseScare: 'A MOUSE!',
  unwrap: 'Unwrap it', unwrapped: 'It\'s a {item}!',
  turnIn: 'Turn it in', turnedIn: 'The police thank you. Reward: ${n}.',
  arrestTitle: 'Arrested!', arrestText: 'Selling something illegal is a crime. The police take the bottle, the shop closes for the day, and the fine is ${n}.',
  // battleships
  bigNote: 'Too big for a table. It only fits in the glass case.', bigNoRoom: 'The glass case is full.',
  keepShip: 'Keep it in the ship case', keptShip: 'The {name} goes in the ship case, safe and sound.',
  fleetTitle: 'The ship case', fleetText: 'Your battleships. Take one out to put it in the glass case and sell it.', fleetEmpty: 'Empty. Three model battleships are out there somewhere: the Missouri, the Bismarck and the Yamato.',
  takeFree: 'Take it', giveaway: 'Just take it! It doesn\'t fit in my garage.', actFleet: 'Ships',
  // every sculpture has a title, picked when it's made
  artTitles: ['Mittens at Dawn', 'The Thinker, in Fur', 'Fluffy\'s Blue Period', 'Self-Portrait with Hairball', 'Untitled (Cough)', 'Sir Whiskers, Retired', 'The Great Hack', 'Still Life with Tuna', 'Nap Time No. 4'],
  artName: 'hairball sculpture, "{title}"',
  notes: {
    shovel: ['Hand-forged, with a wooden handle and rivets. Old ones like this sell.', 'A cheap shovel with a plastic handle, left out in the rain.'],
    plate: ['Uranium glass! See it glow? Collectors love it.', 'Plain green glass. Pretty, but common.'],
    camera: ['A real vintage camera. See the tiny gold stamp on top?', 'A toy camera. No maker\'s stamp.'],
    grinder: ['Stamped No. 22 on the side. A real old one.', 'No stamp. A newer copy.'],
    scale: ['Solid brass pans. They shine.', 'Painted tin. The paint is chipping off.'],
    lantern: ['Copper and amber glass in a wire cage. The glass is whole, so it still lights.', 'The glass is cracked, so it won\'t hold a flame.'],
    robot: ['A real 1950s tin wind-up robot. See the key on its side? It shines.', 'A plastic copy. No wind-up key, and no shine.'],
    tincar: ['A 1950s tin car with chrome bumpers. The chipped paint shows its age.', 'A plastic copy, painted all one colour. No chrome bumpers.'],
    figure: ['A real 80s figure, still sealed on its card.', 'A knockoff. The colours are all wrong.'],
    junk: ['Cheap plastic toys. Nobody collects these.', 'Cheap plastic toys. Nobody collects these.'],
    hairball: ['It\'s shaped exactly like a duck. Somebody out there wants this.', 'It\'s a hairball. It\'s just a hairball.'],
    insulator: ['An old glass insulator off a telegraph pole. See the tiny bubbles? Old glass has them.', 'A new glass copy. Clear and perfect, so it\'s no older than you.'],
    typewriter: ['A 1930s portable typewriter in its case: black steel, round keys, gold letters.', 'An 80s plastic typewriter. Square keys, beige, and heavy for nothing.'],
    iron: ['A real cast-iron flat iron. People heated these on the stove. See the rust?', 'A painted copy. Shiny black, no rust, never been near a stove.'],
    duck: ['A vintage squeaky duck. The paint has faded the way only old toys do.', 'A new rubber duck. Cute, but there are millions of them.'],
    sharpener: ['Cast iron with a brass band. Schools bolted these to the wall for years.', 'A plastic copy. Light as anything, and no brass band.'],
    train: ['Still in its window box. The box is half of what collectors pay for.', 'A loose engine, no box, and a wheel missing.'],
    bottle: ['Pressed black glass that shines in the light. It used to hold aftershave.', 'Painted plastic. No shine at all.'],
    sub: ['Tin, with its wind-up key on the side. It dives in the bathtub.', 'A plastic copy. No key, so it doesn\'t go.'],
    tablet: ['A smashed tablet from the dump. Not even the dealer wants it.', 'A smashed tablet from the dump. Not even the dealer wants it.'],
    tlr: ['A twin-lens camera: you look down into the top lens and shoot through the bottom one.', 'The top lens is cracked, so you can\'t see what you\'re shooting.'],
    boxcam: ['A 1930s box camera with a silver art deco front. Point, click, hope.', 'A plastic toy made to look old. No metal front.'],
    moviecam: ['A wind-up 8mm movie camera. Wind it fully after each shot, and it films about 30 seconds.', 'Somebody took the lens. It won\'t film a thing.'],
    flashcam: ['A folding camera with its big shiny flash dish. One bulb, one flash, pop!', 'The flash dish is a dull plastic copy.'],
    shiplamp: ['A copper ship\'s lantern with a rope handle. The spots are real age.', 'A new decoration, painted to look like brass. No wick inside.'],
    radiometer: ['A glass light mill. In sunlight the little vanes spin all by themselves!', 'A glass ornament. The vanes are glued, so they never spin.'],
    folding: ['A 1930s folding camera. The red bellows still fold out without a leak.', 'The bellows are torn, so light leaks in. It won\'t take a picture.'],
    enlarger: ['A darkroom photo enlarger, lens and all. It shines a negative onto paper to make prints.', 'No lens. Without one it\'s just a lamp on a stick.'],
    truck: ['Pressed steel. The paint has chipped the way old toys do.', 'Shiny new plastic. Not a chip on it.'],
    plane: ['A 1960s tin airliner with its red stripe. Collectors hunt for these.', 'A plastic copy, white with a blue stripe.'],
    biplane: ['Old tin with a metal propeller.', 'A new shop decoration with a wooden propeller.'],
    ship: ['A huge model battleship, built by hand. Collectors pay thousands.', 'A huge model battleship, built by hand. Collectors pay thousands.'],
    canteen: ['Army surplus, stamped US. The real thing.', 'A camping store canteen. No stamp.'],
    comics: ['Yellowed pages and a 10 cent price. A 1950s comic!', 'A reprint. Bright white pages.'],
    book: ['A first edition with gold letters on the cover.', 'A paperback copy. Not worth much.'],
    plush: ['An old mohair bear with stitched eyes.', 'A new bear with plastic eyes.'],
    present: ['Still wrapped. Unwrap it at the desk.', 'Still wrapped. Unwrap it at the desk.'],
    milk: ['Expired. Very, very expired.', 'Expired. Very, very expired.'],
    lint: ['Lint. From a dryer. In a box.', 'Lint. From a dryer. In a box.'],
    computer: ['It boots up, and the camera dated it. The older a home computer is, the rarer.', 'It won\'t turn on. No power light, no beep, nothing.'],
    cart: ['A real gold cartridge. Only a few were ever made, and collectors want every one.', 'Gold paint over grey plastic. See where it\'s flaking?'],
    spork: ['A plastic spork. A spoon and a fork. Worth about a dollar.', 'A plastic spork. A spoon and a fork. Worth about a dollar.'],
    card: ['A 1950s baseball card, the year the player was new. Collectors pay a lot for these.', 'A 1950s baseball card, the year the player was new. Collectors pay a lot for these.'],
    drill: ['A 1950s electric drill, all metal. Plug it in and it still roars.', 'The cord has been cut off. It won\'t run.'],
    handdrill: ['A hand crank drill. Turn the knob and the gears spin the bit. No plug needed!', 'The crank knob is gone and the gears slip.'],
    mangle: ['A cast-iron clothes mangle from about 1900. Turn the big wheel and the wooden rollers squeeze the water out of the washing.', 'The wooden rollers are split. Nice to look at, but it won\'t squeeze.'],
    wrench: ['Chrome wrenches, every size there. Tools like this last forever.', 'Rusted solid. Half the sizes are missing, too.'],
    saw: ['Sharp, straight and every tooth there.', 'Bent, with teeth missing. It won\'t cut straight.'],
    toolbox: ['A solid steel toolbox. The latches still snap shut.', 'Dented and rusted through at the bottom.'],
    toolset: ['A real tool set, new in its case. Chrome, not paint.', 'A knockoff. The "chrome" is grey plastic, and it bends.'],
    album: ['An old family photo album. Someone\'s name and address are written inside the cover.', 'An old family photo album. Someone\'s name and address are written inside the cover.'],
    mirror: ['A 1920s mirror in a carved gold frame. The glass has gone a little cloudy, the way old mirrors do.', 'A new mirror in a plastic frame painted gold.'],
    musket: ['A real Revolutionary War musket, from about 1776. Rusted solid, it hasn\'t fired in two hundred years and never will. A piece of history.', 'A decorator copy from the 1970s. The wood is shiny and new and the metal is one cast piece. It never fired at all.'],
    hubcap: ['A 1950s chrome hubcap. See how it shines?', 'A plastic copy, painted silver. No shine at all.'],
    tire: ['A whitewall tire from the 1940s, still round and the white still white.', 'Cracked all over. Nobody can drive on this.'],
    hoodorn: ['A chrome hood ornament off a 1930s car. Collectors fight over these.', 'A new copy in cheap grey metal. You can see the seam.'],
    headlamp: ['A 1930s headlamp. The glass is whole.', 'The glass is cracked right across.'],
    license: ['A real 1960s license plate, stamped metal.', 'A souvenir copy, printed on thin plastic.'],
    hotelbox: ['An old hotel box, taped shut. Stamped 1958.', 'An old hotel box, taped shut. Stamped 1958.'],
    globe: ['A glass snow globe from the 1920s. Shake it and it still snows on the little tree.', 'A glass snow globe from the 1920s. Shake it and it still snows on the little tree.'],
    pills: ['Something illegal is inside. Turn it in to the police. Selling it gets you arrested.', 'Something illegal is inside. Turn it in to the police. Selling it gets you arrested.'],
  },
  boxIn: { peanuts: 'packing peanuts and a teacup', marbles: 'a bag of old marbles', comics: 'a stack of old comic books', watch: 'a silver pocket watch', rare: 'a rare first edition comic' },
  boxName: 'box of {item}',
};
const t = (k, v = {}) => { let s = k.split('.').reduce((o, p) => o[p], STR); if (Array.isArray(s)) s = s[Math.floor(Math.random() * s.length)]; return String(s).replace(/\{(\w+)\}/g, (_, n) => v[n]); };

// ---------- Tuning ----------
// The sample prices are the card's (field buy and true value). Everything
// else is ours (26 Nov): the odds of a dud, the dealer's share, how
// customers pay and haggle, the rent. Times in seconds, speeds in tiles a
// second. Change after play-tests.
const KINDS = {
  // ask: what yard sales ask; real/dud: what it's worth; real: chance it's the good one
  shovel: { ask: [15, 50], worth: 60, dud: 6, real: .55 },
  plate: { ask: [5, 25], worth: 180, dud: 8, real: .45 },
  // the oldest kid tester, 26 Nov: the camera is the reliable flip, $40 in and
  // $230 out nearly every time
  camera: { ask: [40, 40], worth: 230, dud: 15, real: .85 },
  grinder: { ask: [10, 30], worth: 70, dud: 12, real: .5 },
  scale: { ask: [20, 45], worth: 95, dud: 15, real: .5 },
  lantern: { ask: [10, 25], worth: 55, dud: 6, real: .5 },
  box: { ask: [100, 100] },
  // added 26 Nov (Randi): toys, where cheap plastic copies sit beside the
  // real 80s and 1950s ones, and the cat lady's hairball sculptures. A bag of
  // plastic toys is always a dud; one sculpture in ten is shaped like a duck.
  robot: { ask: [10, 40], worth: 150, dud: 8, real: .45 },
  tincar: { ask: [8, 30], worth: 90, dud: 6, real: .45 },
  figure: { ask: [3, 15], worth: 80, dud: 3, real: .4 },
  junk: { ask: [2, 8], worth: 4, dud: 4, real: 0 },
  hairball: { ask: [5, 20], worth: 50, dud: 0, real: .1 },
  // added 26 Nov, drawn from Randi's photos of a real thrift shop (looked at
  // for shapes and colours only; the photos stay out of the repo)
  insulator: { ask: [3, 12], worth: 30, dud: 3, real: .5 },
  typewriter: { ask: [15, 40], worth: 120, dud: 10, real: .45 },
  iron: { ask: [5, 15], worth: 35, dud: 5, real: .5 },
  duck: { ask: [1, 4], worth: 40, dud: 1, real: .15 },
  // added 26 Nov from the oldest kid tester's price table (the field buy and the
  // resale, which he checked against real sales: the airliner goes for about
  // $600), drawn from Randi's photos of the real toys. Dud worths and odds ours;
  // the biplane wasn't in his table, so its numbers are ours.
  sharpener: { ask: [12, 18], worth: 115, dud: 5, real: .5 },
  train: { ask: [30, 40], worth: 215, dud: 8, real: .5 },
  bottle: { ask: [20, 30], worth: 160, dud: 4, real: .5 },
  sub: { ask: [35, 45], worth: 280, dud: 6, real: .45 },
  truck: { ask: [20, 30], worth: 135, dud: 5, real: .5 },
  // Randi's ask, 26 Nov: 1920s and 30s cameras and darkroom enlargers. All ours.
  boxcam: { ask: [3, 12], worth: 40, dud: 3, real: .55 },
  tlr: { ask: [15, 35], worth: 150, dud: 12, real: .5 },
  // and from her photos, 26 Nov: a wind-up movie camera, a folding camera with
  // its flash dish, a copper ship lantern, a glass light mill. Numbers ours.
  moviecam: { ask: [10, 30], worth: 80, dud: 5, real: .5 },
  flashcam: { ask: [10, 25], worth: 75, dud: 8, real: .5 },
  shiplamp: { ask: [15, 35], worth: 110, dud: 12, real: .5 },
  radiometer: { ask: [5, 15], worth: 45, dud: 6, real: .5 },
  folding: { ask: [10, 25], worth: 95, dud: 10, real: .5 },
  enlarger: { ask: [15, 35], worth: 120, dud: 8, real: .5 },
  plane: { ask: [45, 65], worth: 600, dud: 10, real: .4 },
  biplane: { ask: [30, 45], worth: 220, dud: 12, real: .4 },
  // the three model battleships: always condition 4, about $3,000 (his rule)
  // (2,400 here, so condition 4's x1.25 lands near his $3,000)
  ship: { ask: [400, 500], worth: 2400, dud: 2400, real: 1, big: true },
  // what comes out of a mystery box (his list); worths ours
  canteen: { ask: [5, 15], worth: 45, dud: 5, real: .5 },
  comics: { ask: [2, 8], worth: 120, dud: 2, real: .35 },
  book: { ask: [1, 5], worth: 60, dud: 2, real: .3 },
  plush: { ask: [2, 8], worth: 70, dud: 2, real: .3 },
  present: { ask: [5, 10], worth: 0, dud: 0, real: 0 },
  milk: { ask: [1, 1], worth: 0, dud: 0, real: 0 },
  lint: { ask: [1, 1], worth: 0, dud: 0, real: 0 },
  pills: { ask: [1, 1], worth: 0, dud: 0, real: 0 },
  tablet: { ask: [1, 1], worth: 0, dud: 0, real: 0 },
  // old computers (his ask: $50 to $100 in, $100 to $1,000 out, by decade; the
  // camera tells the decade). `worth` is unused for a real one, see PC_WORTH.
  // The cartridge's numbers, the decades' worths and the odds are ours.
  computer: { ask: [50, 100], worth: 0, dud: 15, real: .6 },
  cart: { ask: [5, 25], worth: 120, dud: 6, real: .35 },
  // the kid's sporks, and his dad's baseball card (always real, never worn out)
  spork: { ask: [1, 1], worth: 1, dud: 1, real: 0 },
  // tools (Randi, 27 Nov: swap meets have stall after stall of used tools and
  // cheap new ones of questionable source). A dud is broken, or for the new
  // set a knockoff. All ours.
  drill: { ask: [5, 20], worth: 60, dud: 3, real: .5 },
  wrench: { ask: [5, 15], worth: 45, dud: 4, real: .5 },
  saw: { ask: [3, 10], worth: 30, dud: 2, real: .5 },
  toolbox: { ask: [10, 25], worth: 70, dud: 8, real: .5 },
  handdrill: { ask: [5, 15], worth: 55, dud: 4, real: .5 },
  // too big for a table: the glass case only, like the battleships
  mangle: { ask: [20, 60], worth: 260, dud: 15, real: .45, big: true },
  toolset: { ask: [15, 30], worth: 90, dud: 10, real: .35 },
  // the 1958 hotel box with five live frogs (his idea: $40, and the frogs
  // aren't for sale), and the 1920s snow globe a seller gives you (ours)
  hotelbox: { ask: [40, 40], worth: 0, dud: 0, real: 1 },
  // car parts from the 1930s to the 1970s (Randi, 27 Nov). Numbers ours.
  hubcap: { ask: [5, 15], worth: 60, dud: 3, real: .5 },
  mirror: { ask: [10, 30], worth: 140, dud: 8, real: .45 },
  album: { ask: [2, 6], worth: 5, dud: 5, real: 1 },
  // Revolutionary War muskets (Randi, 27 Nov: very rare and not working). A
  // relic: it never fires, and there's no ammo anywhere. Numbers ours.
  musket: { ask: [40, 90], worth: 1500, dud: 40, real: .45 },
  tire: { ask: [10, 25], worth: 80, dud: 5, real: .45 },
  hoodorn: { ask: [10, 30], worth: 150, dud: 8, real: .4 },
  headlamp: { ask: [10, 25], worth: 90, dud: 6, real: .5 },
  license: { ask: [3, 10], worth: 40, dud: 2, real: .5 },
  globe: { ask: [0, 0], worth: 300, dud: 300, real: 1 },
  card: { ask: [0, 0], worth: 1000, dud: 1000, real: 1 },
};
const PC_WORTH = { '1970s': 700, '1980s': 300, '1990s': 120 }, PC_ODDS = [['1970s', .2], ['1980s', .45], ['1990s', .35]];
// Condition (the oldest kid tester's rule, 26 Nov): a hidden 1 to 5 on every
// find. 1 is worth a quarter and never more than $10, 2 half, 3 its value, 4 at
// least $80, 5 at least $150. The 4 and 5 multipliers are ours. Duds have a
// condition too, but it doesn't save them.
const QUAL = { odds: [.15, .25, .3, .2, .1], mult: [.25, .5, 1, 1.25, 1.5], floor: [0, 0, 0, 80, 150], cap: [10, 1e9, 1e9, 1e9, 1e9] };
const NO_Q = new Set(['box', 'hairball', 'present', 'milk', 'lint', 'pills', 'junk', 'tablet', 'spork', 'hotelbox', 'album']);
const TOOLS = ['drill', 'handdrill', 'wrench', 'saw', 'toolbox'];
// broken but real, so the bench can fix them; everything else is a copy
// [hours of shop time, parts $, chance it fails]; the shop day is 8 hours.
// Days at first; hours since 27 Nov, so a quick fix is done the same day. Ours.
const FIX = {
  drill: [4, 20, .2], handdrill: [2, 10, .15], lantern: [1, 12, .15], shiplamp: [3, 20, .2], folding: [10, 25, .25], enlarger: [6, 25, .2],
  moviecam: [12, 35, .35], tlr: [8, 30, .25], computer: [16, 40, .35], headlamp: [2, 15, .15], camera: [6, 25, .2], grinder: [2, 10, .15],
};
const FIXABLE = new Set(Object.keys(FIX));
const rareMusket = () => Math.random() < TUNE.musket ? ['musket'] : [];
// how you get about: what it carries, whether it takes big things, what it's
// worth traded in, and its rank (what places it reaches)
const RIDES = {
  foot: { carry: 3, big: false, trade: 0, rank: 0 }, bike: { carry: 5, big: false, trade: 30, rank: 1 },
  car: { carry: 8, big: true, trade: 200, rank: 2 }, truck: { carry: 12, big: true, trade: 300, rank: 3 }, tank: { carry: 12, big: true, trade: 0, rank: 4 },
};
const NEED = { swap: 1, downtown: 1, dump: 2, sell: 2 };
const ride = () => RIDES[S.ride] || RIDES.car;
// landlords: rent times this, the late fee, the rise each new lease, and
// whether a short week once a lease goes without a fee. Mrs. Kettle's numbers
// are the old rules, so every shop from before has her. Ours.
const LORDS = { crabtree: { mult: .85, late: 50, up: 50 }, kettle: { mult: 1, late: 10, up: 25 }, bealou: { mult: 1.1, late: 0, up: 0, forgive: true } };
const lord = () => LORDS[S.landlord] || LORDS.kettle;
const tier = () => TUNE.tiers[(S.tier || 1) - 1];
const CAR_PARTS = ['hubcap', 'tire', 'hoodorn', 'headlamp', 'license'];
const DUMP_FINDS = ['computer', 'computer', 'cart', ...TOOLS, ...TOOLS, ...CAR_PARTS, 'shovel', 'iron', 'sharpener', 'typewriter', 'lantern', 'grinder', 'canteen', 'tincar', 'truck', 'enlarger', 'boxcam', 'moviecam', 'insulator', 'scale', 'shiplamp'];
const TOYS = ['robot', 'tincar', 'figure', 'sub', 'truck', 'plane', 'biplane'];
// Five things in every mystery box (his list, 26 Nov). The odds are ours.
const BOX_LOOT = [
  { p: .2, kinds: TOYS }, { p: .15, kinds: ['shovel', 'grinder', 'iron', 'sharpener'] }, { p: .1, kinds: ['canteen'] },
  { p: .1, kinds: ['comics'] }, { p: .08, kinds: ['book'] }, { p: .08, kinds: ['plush'] }, { p: .06, kinds: ['present'] },
  { p: .05, kinds: ['milk'] }, { p: .05, kinds: ['lint'] }, { p: .04, kinds: ['album'] }, { p: .06, kinds: ['mouse'] }, { p: .02, kinds: ['pills'] },
];
// The card's mystery box: $100 for anything from $10 to $5,000.
const BOX_IN = [
  { id: 'peanuts', p: .5, v: [10, 30] }, { id: 'marbles', p: .3, v: [40, 90] }, { id: 'comics', p: .13, v: [120, 250] },
  { id: 'watch', p: .06, v: [400, 700] }, { id: 'rare', p: .01, v: [5000, 5000] },
];
const TUNE = {
  walk: 4.4, cust: 2.4,
  jitter: .15,               // a find's worth is its kind's, give or take this share
  dealer: .6,                // quick sell pays this share of what it's worth
  boxWorth: 110,             // what a customer thinks a sealed box is worth
  // the haggle bar (Randi's idea, 26 Nov): a line sweeps back and forth and you
  // stop it. Green takes 30% off, yellow 15%; the green is wider for an easy
  // seller (their `yes`), so the cat lady's is a sliver. Numbers ours.
  hgSweep: 1.3, hgSlow: .5, hgGreen: [.06, .22], hgYellow: .09, hgBig: .7, hgSmall: .85,
  shadyChance: .6, shadyCut: [.08, .15], copsAfter: [25, 45], copsAfterBuy: 6, copWalk: 3.2, thiefRun: 7,
  // buyers: bargain hunters offer this share of what it's worth; collectors come after this share of the day
  // collectors (27 Nov, Randi: waiting until the afternoon for them was a sure
  // thing, so they're random now): 0 to 3 a day, each at a random time, and
  // now and then one walks in unplanned. Ours.
  hunter: [.45, .6], hunterMax: .7, collector: [1, 1.3],
  collDays: [[0, .25], [1, .35], [2, .25], [3, .15]], collAt: [.05, .95], collAny: .05,
  dayLen: 100, firstCust: 3, custEvery: [7, 12], browse: [2, 3.2], wait: 30,
  pay: [.85, 1.25],          // a customer would pay this share of what it's worth
  haggleAnyway: .3,          // ...and sometimes tries to haggle a fair tag down anyway
  stretch: 1.5,              // a tag up to this far over what they'd pay starts a haggle; more and they walk
  offer: [.75, .9],
  // Rent (26 Nov): it went up $50 every 3 days, and the oldest kid tester said
  // it should be weekly and barely move. Now it's weekly on a 4-week lease, and
  // only a new lease raises it, by a little. Numbers ours.
  start: 150, rent: 300, rentUp: 25, rentEvery: 7, lease: 4, late: 10, winAfter: 3,
  guide: 75, turnIn: 25, fine: 100,
  collectorMint: [1.4, 1.8], mintStretch: 2,   // collectors overpay for mint; mint sells even overpriced
  shipChance: .2, giveaway: .1,                // a battleship at the swap meet; a yard sale gives one away
  mouse: 3.4,
  // your table at the swap meet, the dump, the cat fan. Numbers ours, except
  // the dump's entry, which is his.
  tableFee: 15, tableMax: 5, meetSell: 90, meetEvery: [3, 6],
  // the dump got bigger (27 Nov, his ask): 33 piles and 75 seconds, still too
  // many to sweep them all
  dumpFee: 50, dumpTime: 75, dumpHits: 3, dumpRow: 11, dumpOdds: { nothing: .4, tablet: .25, jet: .01 },
  catFan: [20, 45], catFanChance: .35, loveGift: 25,
  // the play corner: $15 a go is his; the rest ours
  play: 15, playTime: [8, 12], cornerCarts: 4, gamer: .3, gamerPerCart: .07,
  kidChance: .15,
  // bigger shops (his tiers: a starter, a corner thrift, a Main Street store):
  // places to put things out, width, base rent, rents paid on time to get
  // there, and how much more often customers come. His: the tiers and 12, then
  // 20 places. The rest ours.
  tiers: [{ spots: 5, w: 20, rent: 300, need: 0, busy: 1 }, { spots: 12, w: 30, rent: 450, need: 2, busy: .85 }, { spots: 20, w: 36, rent: 650, need: 5, busy: .7 }],
  // good deeds: how often each comes up and what sometimes comes back. Ours.
  kidShop: .12, kidHas: 3, kidMax: 30, rivalTrouble: .3, stamps: 3, friendChance: .15,
  honestKeep: .5, honestFair: .6, honestFriend: .4, kidFriend: .3, mailOdds: { letter: .5, gift: .2 }, mailGift: 10, rivalOdds: { tip: .35, thanks: .3 },
  // rides (27 Nov, his ask). Ours: what each carries, trade-ins, prices, odds.
  bikeChance: .45, bikePrice: [60, 90], truckChance: .4, truckPrice: [450, 650], tankStun: 20,
  rivalVisit: .2, rivalCheap: .6, rivalMark: [1.6, 2.2], rivalMistake: .2,
  // the tank (overpriced, his rule) and how much the frogs draw people in; a
  // seller's wish at the swap meet. Ours.
  tank: 150, tankElsewhere: 40,
  // the workbench, its jobs, a musket's rarity, the dump tank (all ours)
  // the bench (his ask, 27 Nov: jobs take time and parts, a fix is a gamble,
  // and it fills up). Ours.
  bench: 200, benchSlots: 3, cleanCost: 5, cleanShare: .2, cleanHours: 1, noParts: .15, musket: .02, museum: 5000, armorMagnet: .8, frogMagnet: .75, wishChance: .4, wishTip: 20,
  // the rival flipper (27 Nov): at half the yard sales and every swap meet you
  // buy at. He has a good eye but not a perfect one. All ours.
  rivalYard: .5, rivalStart: [5, 9], rivalLook: [2.5, 4], rivalRest: [1.5, 3.5], rivalWalk: 2.6,
  rivalEye: { real: .55, dud: .15, box: .3 }, rivalMax: { yard: 3, swap: 5 },
  // a second buyer at the register: how often, and how much more they offer. Ours.
  bidChance: .15, bidUp: [1.1, 1.3],
  // slow days and quiet spells (Randi, 27 Nov). A day is busy, normal or slow
  // (how often, and what it does to the gap between customers); a lull of
  // `lullLen` seconds comes some time around lunch; some people only look.
  moods: [['busy', .25, .65], ['normal', .5, 1], ['slow', .25, 1.9]], lullAt: [.3, .55], lullLen: [12, 20], justLook: .2,
  hint: 5000,
};
const rand = (a, b) => a + Math.random() * (b - a);
const randIn = ([a, b]) => rand(a, b);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round5 = n => Math.max(5, Math.round(n / 5) * 5);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------- Save ----------
// A find is { uid, kind, good, value, cost, seen, tag, opened, inside };
// `spots` says which find is on each table.
// Decided 26 Nov: three save files, like Bread (shared/files.js), so each kid
// runs a shop of their own. The shop is the file's: money, the Rent Pool,
// stock, the day (an open day still picks back up after a reload), the lease,
// the field guide and the fleet. Sound and the help seen once are this
// computer's. Start over went with it: Erase in Pick a file does that now.
const KEY = 'pawn-shop';
const fresh = () => ({ day: 1, ride: 'foot', phase: 'morning', clock: 0, pocket: TUNE.start, pool: 0, rent: TUNE.rent, rentDay: TUNE.rentEvery, rentN: 0, owed: 0, paidRents: 0, guide: false, fleet: [], corner: { pc: null, carts: [] }, won: false, yardDone: false, stock: [], spots: [null, null, null, null, null], uid: 1 });
const store = SaveFiles.split(KEY, ['sound', 'seenHelp']);
const S = Object.assign(fresh(), { sound: true, seenHelp: false }, store.settings());
let me = null;   // the open file's number; nothing is saved to a file before one is picked
// two of the yard sales each morning, never the same two in a row if it can help it
function pickToday() { return shuffle(['garage', 'toys', 'cat']).slice(0, 2); }
function useFile(n, m) {
  me = n;
  for (const k in S) delete S[k];
  const d = store.load(n) || {};
  Object.assign(S, fresh(), { sound: true, seenHelp: false }, d);
  // a shop from before rides (27 Nov) keeps the car it had; only new files start on foot
  if (d.day && !('ride' in d)) S.ride = d.armor === 'kept' ? 'tank' : 'car';
  layoutShop();
  if (!S.today) S.today = pickToday();
  SaveFiles.badge($('#whoBtn'), n, m);
}
function save() { store.save(me, S); }

// ---------- Screen ----------
// Bread's 8-bit way: 16 pixels to a tile on a small canvas scaled up with
// smoothing off. The shop is one cramped room that fits the screen. On a
// phone held upright the whole room came out a thin strip with empty screen
// under it (26 Nov, at 375 x 812), so there the view is 12 tiles across and
// follows the shopkeeper, as in The Mighty Pepper.
const T = 16, H = 12;
let W = 20, VW = W, camX = 0;   // W: the place's width in tiles (the swap meet is wider)
const lo = document.createElement('canvas'); lo.width = W * T; lo.height = H * T;
const cx = lo.getContext('2d'); cx.imageSmoothingEnabled = false;
const cv = $('#cv'), out = cv.getContext('2d');
function resize() {
  const coarse = matchMedia('(pointer:coarse)').matches, upright = innerHeight > innerWidth;
  const roomH = innerHeight - (coarse ? (upright ? 11 * 16 : 0) : 0) - (innerWidth <= 480 ? 5.2 : 3.4) * 16;
  VW = Math.min(W, upright && innerWidth < 600 ? 12 : 20);
  // sideways on a phone the controls sit at the corners, over the dark edges
  let w = innerWidth - (coarse && !upright ? 2 * 9.5 * 16 : 0), h = w * H / VW;
  if (h > roomH) { h = Math.max(150, roomH); w = h * VW / H; }
  $('#box').style.width = w + 'px';
  cv.style.height = h + 'px';
  const k = Math.max(1, Math.ceil(w * Math.min(2, devicePixelRatio || 1) / (VW * T)));
  cv.width = VW * T * k; cv.height = lo.height * k;
}
addEventListener('resize', resize);
function setWidth(w) { W = w; lo.width = W * T; cx.imageSmoothingEnabled = false; resize(); camX = clamp(P.x - VW / 2, 0, W - VW); }

// ---------- Colours and sprites ----------
const LINE = '#1a120c';
const C = {
  s: '#f0c49a', e: '#1a120c', c: '#2f7a4a', C: '#1f5a34', W: '#3f9a5c', a: '#f3ead8', p: '#3b4a6a', k: '#2a1a10',
  // the finds
  w: '#a8743c', m: '#7a3e1c', R: '#b0582a', r: '#d8784a', n: '#e8e0d0', P: '#4a7ad0',
  g: '#4f8f46', G: '#7fbf68', Y: '#c8ff5a', b: '#1a1a1a', L: '#5a3a2a', S: '#c8ccd4', O: '#7a7e88', o: '#5aa6e4',
  i: '#5e626c', I: '#80848e', B: '#d8a832', Q: '#f6dc78', D: '#9a9070', d: '#7a7a7a', y: '#ffd040', h: '#d7f1ff',
  x: '#c99460', X: '#e0b880', T: '#e8dca0', u: '#9a8670', U: '#6e5c48', v: '#7a7e88', j: '#7ad4cc', J: '#3e8e88', f: '#ffd84a', F: '#e8d8a0',
  K: '#6a4a2e', z: '#ffffff', E: '#d89040', V: '#d83a2a', H: '#4e5a3a', A: '#6a7a4a',
};
const spr = (rows, colors = C, flip = false) => RDG.sprite(rows, colors, { line: LINE, flip });
function put(img, x, y) { cx.drawImage(img, Math.round(x), Math.round(y)); }
const px = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); };
const text = (s, x, y, c, k = 1) => RDG.text(cx, s, x, y, c, k);
const textC = (s, x, y, c, k = 1) => text(s, x - RDG.textWidth(s, k) / 2, y, c, k);
const swap = (rows, from, to) => rows.map(r => r.replace(new RegExp(from, 'g'), to));
const edit = (rows, list) => { const r = rows.map(s => s.split('')); for (const [x, y, ch] of list) r[y][x] = ch; return r.map(a => a.join('')); };

// people: the shopkeeper in a green cap and apron, and customers in their own colours
const LEGS = { a: ['..pp..pp..', '..pp..pp..', '..kk..kk..'], b: ['...pp.pp..', '...pp.pp..', '...kk.kk..'] };
const KEEP_TOP = ['..cccccc..', '.cccccccc.', '.CCCCCCCC.', '..sesses..', '..ssssss..', '...ssss...', '..aWWWWa..', '.saWWWWas.', '.saWWWWas.', '..aWWWWa..'];
const KEEPER = { a: [...KEEP_TOP, ...LEGS.a], b: [...KEEP_TOP, ...LEGS.b] };
const CUST_TOP = ['...hhhh...', '..hhhhhh..', '..hssssh..', '..sesses..', '..ssssss..', '...ssss...', '..tttttt..', '.stttttts.', '.stttttts.', '..tttttt..'];
const CUST = { a: [...CUST_TOP, ...LEGS.a], b: [...CUST_TOP, ...LEGS.b] };
const LOOKS = [
  { h: '#5a3a1c', t: '#c84a3a', s: '#f0c49a' }, { h: '#e0c060', t: '#3b6ea8', s: '#f6d2b0' }, { h: '#1a1a1a', t: '#e8a030', s: '#8a5a3a' },
  { h: '#a8a8a8', t: '#8a4ab0', s: '#e8b890' }, { h: '#b8502a', t: '#4a9a6a', s: '#f0c49a' }, { h: '#3a2a1a', t: '#d8d0c0', s: '#c08860' },
].map(l => ({ ...C, ...l, p: '#3b4a6a' }));
// the cat lady, the DEALS stall's seller in a hood and dark glasses, and the police
const CAT_LADY = { ...C, h: '#d0d0d8', t: '#b05aa0', s: '#f0c49a', p: '#5a3a6a' };
const HOOD = { ...C, h: '#3a3a42', t: '#3a3a42', s: '#c08860', p: '#2a2a30' };
const SHADY = { a: CUST.a.map((r, i) => i === 3 ? '..sbbbbs..' : r), b: CUST.b.map((r, i) => i === 3 ? '..sbbbbs..' : r) };
const COP = { ...C, h: '#1a2a5a', t: '#2a4a8a', s: '#e8b890', p: '#1a2a4a' };
const OFFICER = { a: CUST.a.map((r, i) => i === 7 ? '.sttyttts.' : r), b: CUST.b.map((r, i) => i === 7 ? '.sttyttts.' : r) };
// a kid: shorter, no neck (the spork seller, and the players at the play corner)
const KID_TOP = ['...hhhh...', '..hhhhhh..', '..sesses..', '..ssssss..', '..tttttt..', '.stttttts.', '..tttttt..'];
const KID = { a: [...KID_TOP, ...LEGS.a.slice(1)], b: [...KID_TOP, ...LEGS.b.slice(1)] };
const CAT = ['k...k...', 'kkkkk...', 'kykyk...', 'kkkkk..k', '.kkkkk.k', '.kkkkkkk', '.kk.kk..'];

// the finds: one picture for both a real one and a dud, then the tell
const PIX = {
  shovel: ['.ww...........', 'w..wwwwwwwwRRR.', '.ww.......RrRRR', '..........RRRRR', '...........RRR.'],
  plate: ['...gggggg...', '.ggGGGGGGgg.', 'ggGGGGGGGGgg', 'gGGGGGGGGGGg', 'gGGGGGGGGGGg', 'ggGGGGGGGGgg', '.ggGGGGGGgg.', '...gggggg...'],
  camera: ['...bbbb.....', 'bbbbbbbbbbbb', 'bSSSbbbbbSSb', 'bLLLbOObLLLb', 'bLLbOooObLLb', 'bLLbOooObLLb', 'bLLLbOObLLLb', 'bbbbbbbbbbbb'],
  grinder: ['..iiii....', '.iIIIIi...', 'iIIIIIIi..', 'iIIIIIIiii', 'iIIIIIIiIi', '.iIIIIi.ii', '..iIIi....', '.iiiiii...', 'iIIIIIIi..', 'iiiiiiii..'],
  scale: ['......bb......', 'bbbbbbbbbbbbbb', '.b....bb....b.', 'BBBB..bb..BBBB', '.BB...bb...BB.', '......bb......', '.....bbbb.....', '....bbbbbb....'],
  lantern: ['..BBBBBB..', '..B....B..', '.RRRRRRRR.', '..RmRmRm..', '..RRRRRR..', '.BEEEEEEB.', 'BEEEBEEEEB', 'BBBBBBBBBB', 'BEEEBEEEEB', '.BEEBEEEB.', '..RRRRRR..', '.RRRRRRRR.'],
  box: ['xxxxxxxxxxxx', 'xXXXXTTXXXXx', 'xXXXXTTXXXXx', 'TTTTTTTTTTTT', 'xXXXXTTXXXXx', 'xXXXXTTXXXXx', 'xxxxxxxxxxxx'],
  open: ['x..........x', 'xx........xx', 'xXXXXXXXXXXx', 'xXXXXXXXXXXx', 'xXXXXXXXXXXx', 'xxxxxxxxxxxx'],
  robot: ['....b.....', '..SSSSS...', '..SoSoS...', '..SSSSS...', '..SbbbS...', '.SSSSSSS..', 'SSSRRRSSS.', 'S.SRRRS.S.', '..SSSSS...', '..SS.SS...', '..SS.SS...', '.SSS.SSS..'],
  tincar: ['....RRRRR.....', '...RhhRhhR....', '.RRRRRRRRRRRR.', 'RRRRRRRRRRRRRR', 'SRRRRRRRRRRRRS', '.bb.......bb..', '.bb.......bb..'],
  figure: ['xxxxxxxxxx', 'xyyyyyyyyx', 'xXXXXXXXXx', 'xXhhsshhXx', 'xXhhsshhXx', 'xXhRRRRhXx', 'xXsRRRRsXx', 'xXhRRRRhXx', 'xXhphhphXx', 'xXhphhphXx', 'xXXXXXXXXx', 'xxxxxxxxxx'],
  junk: ['....hh....', '...hOOh...', '..hhhhhh..', '.hRPRGyPh.', 'hPyGRPRGyh', 'hGRyPGyRPh', 'hyPRGyPGRh', '.hhhhhhhh.'],
  insulator: ['...JJJJ...', '..JjjjjJ..', '..JjjjjJ..', '.JJjjjjJJ.', 'JjjjjjjjjJ', 'JJJJJJJJJJ', '.JjjjjjjJ.', '.JjjjjjjJ.', '..JJJJJJ..'],
  typewriter: ['..bbbbbbbbbb..', '..bkkkkkkkkb..', '..bkkkkkkkkb..', '..bSSSSSSSSb..', '.bbbbbbbbbbbb.', '.bbbbyyyybbbb.', 'bSbSbSbSbSbSbb', 'bbSbSbSbSbSbbb', 'bSbSbSbSbSbSbb', 'bbbbSSSSSbbbbb', 'kkkkkkkkkkkkkk'],
  iron: ['....bbbb....', '...b....b...', '...b....b...', '..iiiiiiii..', '.iIIIIIIIIi.', 'iIIIIIIIIIIi', 'iiiiiiiiiiii'],
  duck: ['..fff...', '.fffbf..', '.ffffrr.', 'f.fff...', 'fffffff.', 'ffffffff', '.ffffff.'],
  // drawn 26 Nov from Randi's photos of the real toys (shapes and colours only)
  sharpener: ['.iiiiiii....', 'iIIIIIIIi...', 'iIIIIIIIiSS.', 'iBBBBBBBi.S.', 'iIIIIIIIi.S.', 'iIIIIIRIi.bb', '.iiiiiii..bb', '...ii.......', '.iiiiii.....'],
  train: ['yyyyyyyyyyyyyyyy', 'yVVyhhhhhhhhhhhy', 'yyyyhPPPPPPPPPhy', 'yVVyhPPPPPPPPPhy', 'yyyyhBBBBBBBBBhy', 'yVVyhhbbhhhbbhhy', 'yyyyyyyyyyyyyyyy'],
  trainLoose: ['................', '..PPPPPPPPPP....', '.PPPPPPPPPPPP...', '.BBBBBBBBBBBB...', '..bb.....b......'],
  bottle: ['.........bb...', '.bbbb.....b...', '.bhbb.bb.bbb..', '.bbbbbhbbbbbb.', 'bbhbbbbbbbbhbb', 'bbbbbbbbbbbbbb', '.bb..bbb..bb..', '.bb..bbb..bb..'],
  sub: ['.......JJ.......', '......JjjJ......', '..JJJJJJJJJJJJ..', '.JjjjjjjjjjjjjJV', 'JjjnjnjnjnjjjjJV', '.JjjjjjjjjjjjJ.V', '...VV.....VV....'],
  tlr: ['.bkbkbkbk.', 'bSSSSSSSSb', 'bSbbbbbbSb', 'bSbOOOObSb', 'bSbOooObSb', 'bSbOOOObSb', 'bSbbbbbbSb', 'bSbOOOObSb', 'bSbOooObSb', 'bSbOOOObSb', 'bSbbbbbbSb', 'bSSSSSSSSb', 'bbbbbbbbbb'],
  boxcam: ['bbbbbbbbbbb', 'bSSSSSSSSSb', 'bShbbbbbhSb', 'bSbbbbbbbSb', 'bSbbSSSbbSb', 'bSbSbbbSbSb', 'bSbSbObSbSb', 'bSbSbbbSbSb', 'bSbbSSSbbSb', 'bSbbbbbbbSb', 'bSSSSSSSSSb', 'bbbbbbbbbbb'],
  folding: ['bbb..........', 'bSb..........', 'bbbkbkbk.....', 'bbbbkbkbkSSS.', 'bbbkbkbkSnnnS', 'bbbbkbkbSnOnS', 'bbbkbkbkSnnnS', 'bbbbkbkbkSSS.', 'bbbkbkbk.SS..', 'bSb...SSSS...', 'bbbbbbbbbbbbb'],
  enlarger: ['..bkbkb.....', '..kbkbk...S.', '.SSSSSSS..S.', 'SnSSSSSSS.S.', 'SnSSSSSSS.S.', '.SSSSSSS..S.', '..bkbkb...S.', '..kbkbkSSSS.', '...OOO....S.', '...ooo....S.', '..........S.', '..........S.', 'wwwwwwwwwwww', 'wnnnnnnnnnSw', 'wwwwwwwwwwww'],
  moviecam: ['.mmmmmm....', 'mwwwwwwm...', 'mwxxwwwm...', 'mwxmxwwmm..', 'mwxxwwwmbbb', 'mwwwwwwmbOb', 'mwxxwwwmbbb', 'mwwwwwwmm..', 'mwwmmmwwm..', 'mwmxxxmwm..', 'mwmxbxmwm..', 'mwwmmmwwm..', '.mmmmmmm...', '...mmm.....'],
  flashcam: ['...SSSSSS...', '..SnnnnnnS..', '.SnnnnnnnnS.', '.SnnnSnnnnS.', '.SnnnnSnnnS.', '..SnnnnnnS..', '...SSSSSS...', '.....bb.....', 'dddddddddddd', 'bSSSSSSSSSSb', 'bSbbbbbbbbSb', 'bSbVVbbbbbSb', 'bSbbbbbobbSb', 'bSSSSSSSSSSb', 'bbbbbbbbbbbb'],
  shiplamp: ['...RRR...', '...RrR..n', '..RRRRR.n', '.RRRRRRRn', '.RhhRhhRn', '.RhyRhhR.', '.RhyRhhR.', '.RhhRhhR.', '.RhhRhhR.', '.RRRRRRR.', '.RKRRKRR.'],
  radiometer: ['....j....', '...jhj...', '..jhhhj..', '.jhhzhhj.', 'jhnnzbbhj', 'jhnnzbbhj', 'jhhhzhhhj', '.jhhzhhj.', '..jhhhj..', '....j....', '....j....', '...jjj...', '..jjjjj..'],
  truck: ['......nnnnnnnnnnnn', '.SSS..nPPPPPPPPPPn', 'SShS..nnnnnnnnnnnn', 'SSSS..nVVVVVVVVVVn', 'SSSSnnnnnnnnnnnnnn', 'SSSSSSnnnnnnnnnnnn', '.bb..bb.......bbb.', '.bb..bb.......bbb.'],
  plane: ['..S...............', '.SSS..............', '.SSSSSSSSSSSSSSS..', 'SVVVVVVVVVVVVVVVSS', '.SSSSSSSSSSSSSSSS.', '.....SSSSn........', '......SSSSnn......'],
  biplane: ['VVVVVVVVVVVVV.', '.d.d.....d.d..', '..VVVVVVVVVVS.', 'VVVVVVVVVVVVSS', '.d.d.....d.dS.', 'VVVyVVVVVyVVV.', '....bb...bb...'],
  ship: ['..............b...............', '.............bb....b..........', '..........OOOOO...bb...........', '.....b...OkOkOOO.OOOO..b.......', '....OOO.OOOOOOOOOOOOOOOOO......', 'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO.', '.OOOOOOOOOOOOOOOOOOOOOOOOOOOOO.', '..mmmmmmmmmmmmmmmmmmmmmmmmmmm..', '.......kk..............kk......'],
  canteen: ['...bb...', '..HHHH..', '.HAAAAH.', 'HAAAAAAH', 'HAyyAAAH', 'HAAAAAAH', 'HAAAAAAH', '.HAAAAH.', '..HHHH..'],
  comics: ['VVVVVVVVV', 'VTTTTTTTV', 'VTyyyyyTV', 'VTyPPPyTV', 'VTyPPPyTV', 'VTyyyyyTV', 'VTTTTTTTV', 'VTbbbbbTV', 'VTTTTTTTV', 'VVVVVVVVV'],
  book: ['.LLLLLLLL.', 'LmmmmmmmmL', 'LmBBBBBBmL', 'LmmmmmmmmL', 'LmmBBBBmmL', 'LmmmmmmmmL', 'LmmmmmmmmL', 'LmmmmmmmmL', 'LLLLLLLLLn'],
  plush: ['.ww....ww.', 'wxxw..wxxw', '.wwwwwwww.', '.wbwwwwbw.', '.wwwxxwww.', '..wwbbww..', '.wwwwwwww.', 'wwxxxxxxww', '.wwxxxxww.', '.ww....ww.'],
  present: ['....VV....', '...V..V...', 'PPPPVVPPPP', 'PPPPVVPPPP', 'VVVVVVVVVV', 'PPPPVVPPPP', 'PPPPVVPPPP', 'PPPPVVPPPP', 'PPPPPPPPPP'],
  milk: ['..nn..', '..dd..', '.nnnn.', 'nnnnnn', 'nPPPPn', 'nPnnPn', 'nPPPPn', 'nnGnnn', 'nGnnnn', 'nnnnnn'],
  lint: ['..dd.dd.', '.dDdddd.', 'ddddDddd', '.dddddd.', '..dd.d..'],
  tablet: ['bbbbbbbbb', 'bkkkkkkkb', 'bkknkkkkb', 'bkkknkkkb', 'bkkkknnkb', 'bknkkkkkb', 'bkknkkkkb', 'bkkkkkkkb', 'bbbbSbbbb'],
  // an old home computer: a beige screen on a box and its keyboard. A working
  // one has its cursor and power light on.
  computer: ['.TTTTTTTTTT.', '.TbbbbbbbbT.', '.TbGGbbbbbT.', '.TbbbbbbbbT.', '.TbbbbbbbbT.', '.TTTTTTTTGT.', '...TTTTTT...', 'XXXXXXXXXXXX', 'XTXTXTXTXTXX', 'XXTXTXTXTXTX', 'XXXXXXXXXXXX'],
  cart: ['BBBBBBBB', 'BQQQQQQB', 'BQnnnnQB', 'BQnVVnQB', 'BQnnnnQB', 'BQQQQQQB', 'BBBBBBBB', '.iSiSiS.'],
  // drawn from Randi's photos of real 1950s tools (shapes and colours only)
  drill: ['...iIIIIIIIi..', 'OOiIIbIIIIbIi.', 'OOiIIbIIIIbIIi', 'OOiIIbIIIIbIi.', '...iIIIIIIIIi.', '........iIIi..', '.......iIIi...', '.......iIIi...', '.......iiii...', '........b.....', '........bb....'],
  handdrill: ['..iiiii...', '.i.....i..', '.i.....i..', '..iiiii...', '...iSi....', '.iiiiiii..', 'iSSSSSSSi.', 'iSSOOSSSib', 'iSSSSSSSi.', '.iiiiiii..', '....S.....', '....O.....', '....n.....'],
  mangle: ['.....bbbb.....', '.AAAAAAAAAA...', '.A........A...', '.AXXXXXXXXAOO.', '.AxxxxxxxxAOO.', '.AXXXXXXXXAOOb', '.AxxxxxxxxA.bb', '.AXXXXXXXXA...', '.A..A..A..A...', '.A...AA...A...', '.A..A..A..A...', 'AA........AA..'],
  wrench: ['LLLLLLLLLL', 'LSLSLSLSLL', 'LSLSLSLSLL', 'LSLSLSLSLL', 'LLLLLLLLLL'],
  saw: ['mmm.........', 'mmmSSSSSSSSS', 'mmmSSSSSSSS.', '..SnSnSnSnS.'],
  toolbox: ['...bbbbbb...', '...b....b...', 'VVVVVVVVVVVV', 'VVVVVVVVVVVV', 'VSSVVVVVVSSV', 'VVVVVVVVVVVV', 'VVVVVVVVVVVV'],
  toolset: ['yyyyyyyyyyyy', 'yhhhhhhhhhhy', 'yhSSShSShhhy', 'yhSSShSShhhy', 'yhhhhhhhhhhy', 'yVVVVVVVVVVy', 'yyyyyyyyyyyy'],
  musket: ['iiiiiiiiiiKwww....', '.........iwwmwwwww', '...........bwmmmww', '.............mmmmw'],
  armor: ['.......HHHHH........', '......HAAAAAH.......', '.....HAAAAAAAHHHHHHH', '..HHHHHHHHHHHHH.....', '.HAAAAAAAAAAAAAH....', 'HAAAAAAAAAAAAAAAH...', 'HbbbbbbbbbbbbbbbH...', 'bbObObObObObObObbb..', '.bbbbbbbbbbbbbbbb...'],
  album: ['LLLLLLLLL', 'LmmmmmmmL', 'LmnnnnnmL', 'LmnoGonmL', 'LmnnnnnmL', 'LmmmmmmmL', 'LmBBBBBmL', 'LmmmmmmmL', 'LLLLLLLLL'],
  mirror: ['.BBBBBB.', 'BhhhhhhB', 'BhzhhhhB', 'BhhzhhhB', 'BhhhhhhB', 'BhhhhhhB', 'BhhhhhhB', '.BBBBBB.'],
  bike: ['......bb....', '..bbbbbV....', '...VVVVVV...', '.bb.V..V.bb.', 'b..bV...b..b', 'b..b.....b.b', '.bb.......bb'],
  truck: ['.........RRRR...', '.........RhhR...', 'RRRRRRRRRRhhRR..', 'RKRRRRRKRRRRRRRy', 'RRRRKRRRRRRRRRRR', '.bb.......bb....', '.bb.......bb....'],
  hubcap: ['...SSSS...', '.SSOOOOSS.', '.SOShhSOS.', 'SOShSSSSOS', 'SOSSbbSSOS', 'SOSSbbSSOS', 'SOSSSSSSOS', '.SOSSSSOS.', '.SSOOOOSS.', '...SSSS...'],
  tire: ['...bbbbbb...', '.bbbbbbbbbb.', '.bbnnnnnnbb.', 'bbnnbbbbnnbb', 'bbnbbSSbbnbb', 'bbnbSSSSbnbb', 'bbnbSSSSbnbb', 'bbnbbSSbbnbb', 'bbnnbbbbnnbb', '.bbnnnnnnbb.', '.bbbbbbbbbb.', '...bbbbbb...'],
  hoodorn: ['.......SS.', '.....SSShS', '..SSSSSSS.', 'SSSShSSS..', '.SSSSSS...', '..bbbbbb..'],
  headlamp: ['..SSSSSS..', '.SnnhnnnS.', 'SnnhhnnnnS', 'SnnnnnnnnS', 'SnnnnnnnnS', '.SnnnnnnS.', '..SSSSSS..', '....bb....', '...bbbb...'],
  license: ['yyyyyyyyyyyy', 'ybbybbbybbby', 'ybbybybybyby', 'ybbybbbybbby', 'yyyyyyyyyyyy'],
  hotelbox: ['..LLLLLL..', 'LLLLLLLLLL', 'LBBBBBBBBL', 'LBnnnnnnBL', 'LBBBBBBBBL', 'LLLLLLLLLL', 'LLLLLLLLLL'],
  globe: ['..hhhh..', '.hhzhhh.', 'hhzhhzhh', 'hhhgghhh', '.hhgghh.', '..hhhh..', '.mmmmmm.', 'mmmmmmmm'],
  spork: ['r.r.r', 'rrrrr', 'rrrrr', '.rrr.', '..r..', '..r..', '..r..', '..r..'],
  card: ['nnnnnnnn', 'nVVVVVVn', 'nhhsshhn', 'nhsssshn', 'nhhPPhhn', 'nhPPPPhn', 'nhPPPPhn', 'nGGGGGGn', 'nnnnnnnn'],
  pills: ['..bb..', '..LL..', '.LLLL.', 'LLLLLL', 'LnnnnL', 'LnVVnL', 'LnnnnL', 'LLLLLL', 'LLLLLL'],
};
// the three battleships: one hull, each in its own paint
const SHIP_C = { Missouri: { O: '#7a7e88' }, Bismarck: { O: '#a8acb4' }, Yamato: { O: '#5e626c' } };
// the light mill's vanes, turning (a real one spins in daylight; the copy's are glued)
const MILL = [PIX.radiometer, edit(PIX.radiometer, [[2, 4, 'h'], [2, 5, 'h'], [6, 4, 'h'], [6, 5, 'h']]), edit(PIX.radiometer, [[2, 4, 'b'], [3, 4, 'b'], [2, 5, 'b'], [3, 5, 'b'], [5, 4, 'n'], [6, 4, 'n'], [5, 5, 'n'], [6, 5, 'n']])];
const FROG = ['G.G..', 'GGGG.', 'gGGGg', 'g...g'];
const MOUSE = ['...d.d.', '.ddddd.', 'dddddbd', '.dddddr', 'd......'];
// the cat lady's sculptures: a few shapes of plain hairball, and the duck
const ART = [
  ['..uuuu..', '.uUuuUu.', 'uuUuuuUu', 'uUuuUuuu', '.uuUuuu.', '..uuuu..'],
  ['.u....u.', '.uu..uu.', '.uUuuUu.', '.uuuuuu.', '..uuuu..', '.uuUuuu.', 'uuuuuuuu'],
  ['...uu...', '..uUuu..', '...uu...', '..uuuu..', '.uUuuUu.', '..uuuu..', '.uuuuuu.', 'uuUuuUuu'],
];
const DUCK_ART = ['..uu......', '.uUuy.....', '..uu......', '.uuuuuuu.u', 'uuUuuUuuuu', '.uuuuuuuu.', '..uuuuuu..'];
const LOOK = {
  shovel: [edit(PIX.shovel, [[10, 2, 'n'], [10, 3, 'n']]), swap(PIX.shovel, 'w', 'P')],
  plate: [PIX.plate, PIX.plate],
  camera: [edit(PIX.camera, [[2, 2, 'y']]), PIX.camera],
  grinder: [edit(PIX.grinder, [[3, 3, 'n'], [5, 3, 'n']]), PIX.grinder],
  scale: [edit(PIX.scale, [[1, 3, 'Q'], [11, 3, 'Q']]), edit(swap(PIX.scale, 'B', 'D'), [[2, 3, 'd'], [12, 4, 'd']])],
  lantern: [PIX.lantern, edit(PIX.lantern, [[3, 5, 'b'], [4, 6, 'b'], [3, 8, 'b'], [6, 9, 'b']])],
  robot: [edit(PIX.robot, [[8, 6, 'y'], [9, 5, 'y'], [9, 6, 'y'], [9, 7, 'y'], [3, 1, 'n']]), swap(swap(PIX.robot, 'S', 'v'), 'o', 'b')],
  tincar: [edit(PIX.tincar, [[5, 3, 'd'], [10, 2, 'd'], [3, 4, 'd']]), swap(PIX.tincar, 'S', 'R')],
  figure: [edit(PIX.figure, [[2, 1, 'R'], [3, 1, 'R']]), swap(swap(PIX.figure, 's', 'g'), 'y', 'Q')],
  junk: [PIX.junk, PIX.junk],
  insulator: [edit(PIX.insulator, [[4, 2, 'n'], [6, 6, 'n'], [3, 7, 'n']]), swap(swap(PIX.insulator, 'j', 'h'), 'J', 'O')],
  typewriter: [PIX.typewriter, swap(swap(swap(PIX.typewriter, 'b', 'X'), 'S', 'T'), 'y', 'X')],
  iron: [edit(PIX.iron, [[3, 4, 'R'], [8, 5, 'R'], [5, 4, 'R']]), edit(swap(swap(PIX.iron, 'I', 'b'), 'i', 'k'), [[4, 4, 'n']])],
  duck: [swap(PIX.duck, 'f', 'F'), PIX.duck],
  sharpener: [PIX.sharpener, swap(swap(swap(PIX.sharpener, 'B', 'S'), 'I', 'S'), 'R', 'S')],
  train: [PIX.train, PIX.trainLoose],
  bottle: [PIX.bottle, swap(swap(PIX.bottle, 'b', 'i'), 'h', 'i')],
  sub: [edit(PIX.sub, [[3, 1, 'y'], [4, 1, 'y']]), swap(swap(PIX.sub, 'j', 'o'), 'J', 'P')],
  tlr: [PIX.tlr, edit(PIX.tlr, [[3, 4, 'n'], [4, 3, 'n'], [5, 4, 'n']])],
  boxcam: [PIX.boxcam, swap(swap(PIX.boxcam, 'b', 'P'), 'S', 'o')],
  folding: [PIX.folding, edit(PIX.folding, [[5, 4, '.'], [6, 6, '.'], [4, 3, '.']])],
  enlarger: [PIX.enlarger, edit(PIX.enlarger, [[3, 8, '.'], [4, 8, '.'], [5, 8, '.'], [3, 9, '.'], [4, 9, '.'], [5, 9, '.']])],
  moviecam: [PIX.moviecam, edit(PIX.moviecam, [[9, 5, 'b']])],
  flashcam: [PIX.flashcam, swap(swap(PIX.flashcam, 'n', 'd'), 'S', 'd')],
  shiplamp: [PIX.shiplamp, swap(swap(swap(PIX.shiplamp, 'R', 'B'), 'K', 'B'), 'y', 'h')],
  radiometer: [PIX.radiometer, PIX.radiometer],
  truck: [edit(PIX.truck, [[9, 0, 'd'], [10, 0, 'd'], [14, 2, 'd'], [8, 4, 'd'], [16, 5, 'd'], [2, 4, 'd']]), swap(PIX.truck, 'S', 'o')],
  plane: [PIX.plane, swap(swap(PIX.plane, 'S', 'n'), 'V', 'P')],
  biplane: [PIX.biplane, swap(PIX.biplane, 'S', 'w')],
  ship: [PIX.ship, PIX.ship],
  canteen: [PIX.canteen, swap(PIX.canteen, 'y', 'A')],
  comics: [PIX.comics, swap(PIX.comics, 'T', 'n')],
  book: [PIX.book, swap(swap(PIX.book, 'B', 'n'), 'm', 'P')],
  plush: [PIX.plush, swap(PIX.plush, 'b', 'o')],
  computer: [PIX.computer, edit(PIX.computer, [[3, 2, 'b'], [4, 2, 'b'], [9, 5, 'i']])],
  cart: [PIX.cart, edit(PIX.cart, [[2, 1, 'i'], [6, 4, 'i'], [3, 5, 'i'], [1, 3, 'i']])],
  spork: [PIX.spork, PIX.spork], card: [PIX.card, PIX.card],
  drill: [PIX.drill, PIX.drill.slice(0, 9)],
  handdrill: [PIX.handdrill, edit(PIX.handdrill, [[9, 7, '.'], [4, 6, 'O'], [5, 8, 'O']])],
  mangle: [PIX.mangle, edit(PIX.mangle, [[4, 3, 'm'], [5, 4, 'm'], [6, 5, 'm'], [7, 6, 'm'], [8, 7, 'm']])],
  wrench: [PIX.wrench, swap(edit(PIX.wrench, [[3, 2, 'L'], [7, 1, 'L']]), 'S', 'R')],
  saw: [PIX.saw, edit(PIX.saw, [[5, 3, '.'], [7, 3, '.'], [10, 1, 'n'], [11, 1, '.']])],
  toolbox: [PIX.toolbox, edit(PIX.toolbox, [[2, 3, 'K'], [6, 2, 'K'], [8, 5, 'K'], [4, 6, 'K'], [10, 6, 'K']])],
  toolset: [PIX.toolset, swap(PIX.toolset, 'S', 'd')],
  hotelbox: [PIX.hotelbox, PIX.hotelbox], globe: [PIX.globe, PIX.globe],
  musket: [PIX.musket, swap(swap(swap(PIX.musket, 'm', 'x'), 'w', 'X'), 'K', 'i')],
  album: [PIX.album, PIX.album],
  mirror: [PIX.mirror, swap(PIX.mirror, 'B', 'Q')],
  hubcap: [PIX.hubcap, swap(swap(swap(PIX.hubcap, 'S', 'd'), 'h', 'd'), 'O', 'i')],
  tire: [PIX.tire, edit(PIX.tire, [[3, 2, 'K'], [4, 2, 'b'], [2, 5, 'K'], [9, 6, 'b'], [10, 4, 'K'], [6, 9, 'b'], [7, 9, 'K']])],
  hoodorn: [PIX.hoodorn, swap(swap(PIX.hoodorn, 'S', 'I'), 'h', 'I')],
  headlamp: [PIX.headlamp, edit(PIX.headlamp, [[2, 2, 'b'], [3, 3, 'b'], [4, 3, 'b'], [5, 4, 'b'], [6, 4, 'b'], [7, 5, 'b']])],
  license: [PIX.license, swap(swap(PIX.license, 'y', 'n'), 'b', 'V')],
  present: [PIX.present, PIX.present], tablet: [PIX.tablet, PIX.tablet], milk: [PIX.milk, PIX.milk], lint: [PIX.lint, PIX.lint], pills: [PIX.pills, PIX.pills],
};
// Condition shows, a little: a worn or broken find has scuffs, a mint one a
// white glint. Placed by the find's uid, so it stays put.
const wornRows = {};
function wear(rows, it) {
  const q = it.q; if (!q || q === 3 || q === 4) return rows;
  const key = it.uid + ':' + q + ':' + rows.join('|');
  if (wornRows[key]) return wornRows[key];
  const filled = []; rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') filled.push([x, y]); }));
  let seed = it.uid * 9301 + 49297; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const marks = q === 5 ? [filled.filter(([x, y]) => y <= rows.length / 2).sort((a, b) => b[0] - a[0])[0] || filled[0]].map(([x, y]) => [x, y, 'z'])
    : Array.from({ length: q === 1 ? 6 : 3 }, () => { const [x, y] = filled[Math.floor(rnd() * filled.length)]; return [x, y, 'K']; });
  return (wornRows[key] = edit(rows, marks));
}
// uranium glass glows: the rim, drawn on its own so it can pulse
const GLOW = PIX.plate.map(r => r.replace(/[^g]/g, '.').replace(/g/g, 'Y'));
const INSIDE_C = { peanuts: '#f3ead8', marbles: '#5aa6e4', comics: '#e04848', watch: '#c8ccd4', rare: '#ffd040' };
const openRows = {};
function rowsOf(it) {
  if (it.kind === 'box') {
    if (!it.opened) return PIX.box;
    // the open box shows a dab of what's inside
    return openRows[it.inside] || (openRows[it.inside] = edit(PIX.open, [[3, 1, 'Z'], [4, 1, 'Z'], [5, 0, 'Z'], [6, 1, 'Z'], [7, 0, 'Z'], [8, 1, 'Z']]));
  }
  if (it.kind === 'hairball') return it.good ? DUCK_ART : ART[it.shape || 0];
  if (it.kind === 'radiometer' && it.good) return MILL[Math.floor(performance.now() / 160) % MILL.length];
  return wear(LOOK[it.kind][it.good ? 0 : 1], it);
}
const colorsOf = {};
function colOf(it) {
  if (it.kind === 'ship') return colorsOf[it.ship] || (colorsOf[it.ship] = { ...C, ...SHIP_C[it.ship] });
  if (it.kind !== 'box' || !it.opened) return C;
  return colorsOf[it.inside] || (colorsOf[it.inside] = { ...C, Z: INSIDE_C[it.inside] });
}
const itemImg = it => spr(rowsOf(it), colOf(it));
const glows = it => it.kind === 'plate' && it.good;
// a picture for a card: the sprite drawn bigger on a canvas, as a data URL
const urls = new Map();
function picSrc(rows, colors = C, line = LINE) {
  const key = rows.join('|') + (colors.Z || '') + (colors.O || '') + line;
  if (urls.has(key)) return urls.get(key);
  const img = RDG.sprite(rows, colors, { line });
  const k = 8, c = document.createElement('canvas');
  const cw = Math.max(18, img.width + 2); c.width = cw * k; c.height = 13 * k;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(img, Math.round((cw - img.width) / 2) * k, Math.round((13 - img.height) / 2) * k, img.width * k, img.height * k);
  const u = c.toDataURL(); urls.set(key, u); return u;
}
// the glow's own outline is lit too, so it spills past the plate's edge
const GLOW_LINE = '#b8ff4a';
const glowSrc = () => picSrc(GLOW, C, GLOW_LINE);
function picHtml(it) {
  return `<div class="pic"><img src="${picSrc(rowsOf(it), colOf(it))}" alt="">${glows(it) ? `<img class="glow" src="${glowSrc()}" alt="">` : ''}</div>`;
}

// ---------- The finds ----------
// hot: from the DEALS stall at the swap meet. Always the real thing, priced
// far too low, with the store tag still on. It was stolen.
function makeFind(kind, hot = false) {
  const K = KINDS[kind], f = { uid: S.uid++, kind, cost: 0, seen: false, tag: 0 };
  f.ask = Math.round(randIn(K.ask));
  if (kind === 'hairball') { f.shape = Math.floor(Math.random() * ART.length); f.title = pick(STR.artTitles); }
  if (kind === 'box') {
    let r = Math.random(), b = BOX_IN[0];
    for (const x of BOX_IN) { if (r < x.p) { b = x; break; } r -= x.p; }
    f.inside = b.id; f.value = b.v[0] === b.v[1] ? b.v[0] : round5(randIn(b.v)); f.opened = false;
  } else {
    f.good = hot || Math.random() < K.real;
    // a working computer's worth comes from its decade
    if (kind === 'computer' && f.good) { let r = Math.random(); f.decade = PC_ODDS.find(([, p]) => (r -= p) < 0)?.[0] || '1990s'; }
    let base = (f.decade ? PC_WORTH[f.decade] : f.good ? K.worth : K.dud) * rand(1 - TUNE.jitter, 1 + TUNE.jitter);
    if (!NO_Q.has(kind)) {
      f.q = kind === 'ship' ? 4 : kind === 'card' || kind === 'globe' ? Math.max(3, rollQ()) : rollQ();
      if (f.good) f.base = base;
      if (f.good) base = Math.min(QUAL.cap[f.q - 1], Math.max(QUAL.floor[f.q - 1], base * QUAL.mult[f.q - 1]));
    }
    if (kind === 'ship') f.ship = pick(shipsLeft());
    f.value = base < 10 ? Math.round(base) : round5(base);   // a dud can be worth a couple of dollars, or nothing
  }
  if (hot) { f.hot = true; f.ask = Math.max(2, Math.round(f.value * randIn(TUNE.shadyCut))); }
  return f;
}
function rollQ() { let r = Math.random(); for (let i = 0; i < 5; i++) { if (r < QUAL.odds[i]) return i + 1; r -= QUAL.odds[i]; } return 3; }
// Only one of each battleship is ever about: not one you hold or keep in the
// ship case, and not one already out at today's sales. Sold, it goes back
// into circulation (his rule, 26 Nov).
function shipsLeft() {
  const held = [...S.fleet, ...S.stock.filter(f => f.kind === 'ship').map(f => f.ship), ...(MK ? MK.items.filter(f => f && f.kind === 'ship').map(f => f.ship) : [])];
  return STR.ships.filter(n => !held.includes(n));
}
const condText = f => t('condOf', { w: STR.cond[f.q - 1], q: f.q });
const nameOf = f => f.kind === 'computer' && f.decade && f.seen ? t('pcName', { d: f.decade }) : f.kind === 'ship' ? t('shipName', { name: f.ship }) : f.kind === 'box' && f.opened ? t('boxName', { item: t(`boxIn.${f.inside}`) }) : f.title ? t('artName', { title: f.title }) : t(`kinds.${f.kind}`);
const Name = f => { const n = nameOf(f); return n[0].toUpperCase() + n.slice(1); };
const known = f => f.seen || (f.kind === 'box' && f.opened);
// what customers and the dealer think it's worth: they know
const worthTo = f => f.kind === 'box' && !f.opened ? TUNE.boxWorth : f.value;
const byUid = uid => S.stock.find(f => f.uid === uid);
const spotOf = f => S.spots.indexOf(f.uid);
const inCorner = f => S.corner.pc === f.uid || S.corner.carts.includes(f.uid);
const inBack = () => S.stock.filter(f => spotOf(f) < 0 && !inCorner(f) && !onBench(f));

// ---------- The shop ----------
// Laid out 26 Nov: the desk with the camera top left, three tables, the glass
// case and the rack, the register counter by the door. The back wall holds
// the rent board.
let SHOP = [
  { id: 'desk', x: 1, y: 2, w: 3, h: 2, stand: { x: 2.5, y: 4.6 }, act: 'actDesk' },
  { id: 'spot0', x: 5, y: 4, w: 2, h: 1, stand: { x: 6, y: 5.6 }, spot: 0, kind: 'table', act: 'actTable' },
  { id: 'spot1', x: 9, y: 4, w: 2, h: 1, stand: { x: 10, y: 5.6 }, spot: 1, kind: 'table', act: 'actTable' },
  { id: 'spot2', x: 13, y: 4, w: 2, h: 1, stand: { x: 14, y: 5.6 }, spot: 2, kind: 'table', act: 'actTable' },
  { id: 'spot3', x: 4, y: 7, w: 3, h: 1, stand: { x: 5.5, y: 8.6 }, spot: 3, kind: 'case', act: 'actCase' },
  { id: 'spot4', x: 18, y: 3, w: 1, h: 3, stand: { x: 17.45, y: 4.6 }, spot: 4, kind: 'rack', act: 'actRack' },
  { id: 'reg', x: 12, y: 8, w: 4, h: 1, stand: { x: 14.5, y: 7.6 }, act: 'actRegister' },
  { id: 'board', x: 8, y: 0, w: 2, h: 2, stand: { x: 9, y: 2.6 }, act: 'actBoard', wall: true },
  { id: 'door', x: 9, y: 11, w: 2, h: 1, stand: { x: 10, y: 10.5 }, act: 'actDoor', wall: true },
  // the ship case, bottom right, for the battleships you keep (26 Nov)
  { id: 'fleet', x: 16.2, y: 8.4, w: 2.6, h: 1.6, stand: { x: 17.5, y: 10.5 }, act: 'actFleet' },
  // the play corner, bottom left (27 Nov)
  { id: 'corner', x: 1, y: 6.8, w: 2.2, h: 1.3, stand: { x: 2.1, y: 9 }, act: 'actCorner' },
  // the donation box by the door (27 Nov)
  { id: 'donate', x: 6.6, y: 9.7, w: 1, h: .9, stand: { x: 8, y: 10.3 }, act: 'actDonate' },
  // the frog tank, once it's bought (27 Nov)
  // the workbench, once it's bought, by the rack (27 Nov)
  { id: 'bench', x: 16.4, y: 6.4, w: 2.4, h: 1, stand: { x: 17.4, y: 7.8 }, act: 'actBench', only: () => S.bench },
  { id: 'tank', x: 7.8, y: 6.9, w: 2.8, h: 1.4, stand: { x: 9.2, y: 8.9 }, act: 'actTank', only: () => S.tank },
];
// a bigger shop is wider, with more tables to the right (27 Nov)
const BASE_SHOP = SHOP;
// three columns for the corner thrift, five for Main Street; three rows each
const EXTRA_TABLES = [20, 23.2, 26.4, 29.6, 32.8].flatMap(x => [4, 7, 9].map(y => [x, y]));
function layoutShop() {
  const n = tier().spots;
  SHOP = [...BASE_SHOP, ...EXTRA_TABLES.slice(0, n - 5).map(([x, y], i) => ({ id: 'spot' + (5 + i), x, y, w: 2, h: 1, stand: { x: x + 1, y: y + 1.6 }, spot: 5 + i, kind: 'table', act: 'actTable' }))];
  while (S.spots.length < n) S.spots.push(null);
}
const SHOP_DOOR = { x: 10, y: 11.8 }, REG_FRONT = { x: 14.5, y: 9.6 };
// ---------- Where to buy ----------
// Decided 26 Nov (Randi's asks): a different pair of yard sales each morning,
// each with its own mix, and the swap meet, walked stall to stall. `MK` is
// the place you're at: its finds, slots, sellers, what's solid.
const SALES = {
  garage: { house: '#e8dcc4', siding: '#cfc2a6', yes: .5, finds: () => [...shuffle(['shovel', 'plate', 'camera', 'grinder', 'scale', 'lantern', 'insulator', 'typewriter', 'iron', 'sharpener', 'bottle', 'canteen', 'train', 'boxcam', 'folding', 'enlarger', 'tlr', 'moviecam', 'flashcam', 'shiplamp', 'radiometer', 'computer', 'computer', 'album', ...TOOLS, ...CAR_PARTS, ...(frogsLeft() ? ['hotelbox'] : [])]).slice(0, 5), ...rareMusket(), ...(Math.random() < .6 ? ['box'] : [])] },
  toys: { house: '#d8e4f0', siding: '#b8c8d8', yes: .5, finds: () => ['junk', 'junk', 'junk', ...shuffle([...TOYS, 'train']).slice(0, 2), pick(['figure', 'duck', 'box', 'present', 'plush', 'comics', 'cart', 'cart'])] },
  cat: { house: '#f0d8e0', siding: '#d8b8c4', yes: .15, cats: true, finds: () => ['hairball', 'hairball', 'hairball', 'hairball', ...shuffle(['plate', 'lantern', 'scale', 'camera']).slice(0, 2)] },
  swap: { fee: 5 },
};
const STALLS = {
  toys: { sign: 'TOYS', canopy: '#c84a3a', finds: () => shuffle([...shuffle(TOYS).slice(0, 3), 'junk', 'junk']).slice(0, 2) },
  trains: { sign: 'TRAINS', canopy: '#3b4a6a', finds: () => ['train', pick(['train', 'bottle'])] },
  surplus: { sign: 'SURPLUS', canopy: '#6a7a4a', finds: () => ['canteen', pick(['canteen', 'shovel', 'sharpener'])] },
  books: { sign: 'BOOKS', canopy: '#5e3a1c', finds: () => shuffle(['comics', 'book', 'comics', 'plush']).slice(0, 2) },
  glass: { sign: 'GLASS', canopy: '#4a9a6a', finds: () => shuffle(['plate', pick(['plate', 'lantern', 'insulator', 'radiometer']), 'insulator', 'radiometer']).slice(0, 2) },
  tools: { sign: 'TOOLS', canopy: '#8a5a30', finds: () => shuffle(['shovel', 'grinder', 'iron', ...TOOLS]).slice(0, 2) },
  // 27 Nov: used tools, many broken, and cheap new ones, many knockoffs
  carparts: { sign: 'CAR PARTS', canopy: '#a83a2a', finds: () => shuffle(CAR_PARTS).slice(0, 2) },
  usedtools: { sign: 'USED TOOLS', canopy: '#a85a20', finds: () => shuffle([...TOOLS, ...TOOLS]).slice(0, 2) },
  newtools: { sign: 'NEW TOOLS', canopy: '#d8a832', finds: () => ['toolset', pick(['toolset', 'drill'])] },
  old: { sign: 'OLD STUFF', canopy: '#8a4ab0', finds: () => {
    const a = shuffle(['grinder', 'scale', 'lantern', 'typewriter', 'typewriter', 'iron', 'sharpener', 'bottle', 'boxcam', 'shiplamp', 'mangle', ...(frogsLeft() ? ['hotelbox', 'hotelbox'] : [])]).slice(0, 2);
    if (Math.random() < TUNE.musket * 2) a[1] = 'musket';   // twice as likely here as anywhere else
    return a;
  } },
  ducks: { sign: 'DUCKS', canopy: '#ffd040', finds: () => ['duck', 'duck'] },
  cameras: { sign: 'CAMERAS', canopy: '#3b6ea8', finds: () => shuffle(['camera', 'boxcam', 'folding', 'enlarger', 'tlr', 'moviecam', 'flashcam', 'junk']).slice(0, 2) },
  cat: { sign: 'CAT ART', canopy: '#e05a9a', yes: .15, finds: () => ['hairball', 'hairball'] },
  boxes: { sign: 'BOXES', canopy: '#e8a030', finds: () => ['box', 'box'] },
  // 27 Nov: old computers and game cartridges
  computers: { sign: 'COMPUTERS', canopy: '#2a6a8a', finds: () => ['computer', pick(['computer', 'cart', 'cart'])] },
  games: { sign: 'GAMES', canopy: '#6a3aa8', finds: () => ['cart', pick(['cart', 'junk'])] },
  junk: { sign: 'JUNK', canopy: '#7a7a7a', finds: () => ['junk', pick(['junk', 'figure', 'tincar'])] },
  // the stolen goods: real things far too cheap (Randi, 26 Nov: "the cops show up to chase them off")
  // a battleship, now and then (TUNE.shipChance), one to a stall
  models: { sign: 'MODELS', canopy: '#5e626c', finds: () => ['ship'] },
  shady: { sign: 'DEALS', canopy: '#3a3a42', hot: true, yes: 1, finds: () => shuffle(['camera', 'robot', 'figure', 'scale']).slice(0, 2) },
};
let MK = null;
function buildYard(id) {
  const sale = SALES[id], order = shuffle([0, 1, 2, 3, 4, 5]), items = Array(6).fill(null);
  sale.finds().slice(0, 6).forEach((k, i) => { items[order[i]] = makeFind(k); });
  const slots = [3.7, 5, 6.3, 8.7, 10, 11.3].map(x => ({ x, y: 5.05, tagY: 5.6, vendor: 0 }));
  // now and then the owner just wants a battleship gone (his rule, 26 Nov)
  const free = id === 'garage' && shipsLeft().length && Math.random() < TUNE.giveaway;
  const M = {
    id, kind: 'yard', w: 20, top: 3, bottom: 11, sale, items, slots, bought: 0, start: { x: 3.5, y: 9.6 },
    vendors: [{ x: 16, y: 5.4, look: id === 'cat' ? CAT_LADY : pick(LOOKS), rows: CUST, lines: `sellers.${id}`, yes: sale.yes, no: id === 'cat' ? 'catNo' : 'sellerNo', face: -1, walkT: 0 }],
    solid: [{ x: 3, y: 4.6, w: 4, h: 1 }, { x: 8, y: 4.6, w: 4, h: 1 }, { x: 15, y: 6, w: 2, h: 1 }, { x: 2, y: 10, w: 3, h: 2 }],
    objs: [...slots.map((s, i) => ({ id: 'slot' + i, x: s.x - .6, y: 4.6, w: 1.2, h: 1, stand: { x: s.x, y: 6.3 }, slot: i, act: 'actLook' })),
      { id: 'seller', x: 15, y: 5, w: 2, h: 2, stand: { x: 16, y: 7.6 }, vendor: 0, act: 'actSeller' },
      { id: 'car', x: 2, y: 10, w: 3, h: 2, stand: { x: 3.5, y: 9.6 }, act: 'actCar' }],
    // the cat lady's cats, sitting about the lawn admiring their work
    cats: sale.cats ? [['#e8a030', 1.6, 7.2], ['#1a1a1a', 12.8, 8.4], ['#a8a8a8', 7.2, 3.9], ['#f3ead8', 18.2, 6.6], ['#8a5a30', 13.4, 3.9]].map(([k, x, y]) => ({ x, y, c: { ...C, k, y: '#7fd04a' } })) : [],
  };
  // walking everywhere, a used bike leaning on the lawn now and then
  if (S.ride === 'foot' && Math.random() < TUNE.bikeChance) {
    M.rideSale = { kind: 'bike', price: round5(randIn(TUNE.bikePrice)), x: 6, y: 7.1 };
    M.objs.push({ id: 'ridesale', x: 6, y: 7.1, w: 1.8, h: 1.1, stand: { x: 6.9, y: 8.7 }, act: 'actLook', only: () => !MK.rideSale.sold });
    M.solid.push({ x: 6.1, y: 7.4, w: 1.6, h: .6 });
  }
  if (id !== 'cat' && Math.random() < TUNE.kidChance) {
    const vi = M.vendors.length;
    M.vendors.push({ x: 13.5, y: 8.25, look: { ...pick(LOOKS), h: '#c84a3a' }, rows: KID, kid: true, face: -1, walkT: 0 });
    M.objs.push({ id: 'kid', x: 12.6, y: 7.3, w: 1.8, h: 1.7, stand: { x: 13.5, y: 9.8 }, vendor: vi, act: 'actKid' });
    M.solid.push({ x: 12.7, y: 8.3, w: 1.6, h: .7 });
    M.kid = { x: 12.7, y: 8.4 };
  }
  if (free) {
    const f = makeFind('ship'); f.ask = 0; f.free = true;
    const si = M.slots.length;
    M.items.push(f); M.slots.push({ x: 10, y: 8.2, tagY: 8.6, vendor: 0, line: t('giveaway') });
    M.objs.push({ id: 'slot' + si, x: 9, y: 7.7, w: 2, h: 1, stand: { x: 10, y: 9.6 }, slot: si, act: 'actLook' });
    M.solid.push({ x: 9.1, y: 7.8, w: 1.8, h: .6 });
  }
  return M;
}
// The swap meet: a parking lot with a ticket booth, your car, and two rows of
// stalls under striped awnings, each with its own seller and two finds. Four
// a row at first; six since 27 Nov (his ask, more stalls), so the lot is
// 50 tiles wide. The DEALS stall, when it's there, is top right, so its
// seller can run off the edge when the police come.
const PER_ROW = 6;
function buildSwap(mine = null) {
  const n = PER_ROW * 2, myAt = PER_ROW + 1;
  const toolStalls = ['tools', 'usedtools', 'newtools'];
  let list = shuffle([...toolStalls, ...shuffle(Object.keys(STALLS).filter(k => !['shady', 'models', ...toolStalls].includes(k))).slice(0, n - toolStalls.length)]);
  if (shipsLeft().length && Math.random() < TUNE.shipChance) list[pick([...Array(n).keys()].filter(i => i !== PER_ROW - 1 && i !== myAt))] = 'models';
  if (Math.random() < TUNE.shadyChance) { list = list.slice(0, n - 1); list.splice(PER_ROW - 1, 0, 'shady'); }
  if (mine) list[myAt] = 'mine';
  const M = { id: 'swap', kind: 'swap', w: 8 + PER_ROW * 7, top: 2, bottom: 11.2, sale: SALES.swap, items: [], slots: [], vendors: [], stalls: [], solid: [], objs: [], bought: 0, start: { x: 3.5, y: 8.6 }, cats: [], cops: null, copT: randIn(TUNE.copsAfter) };
  list.forEach((sid, i) => {
    const st = STALLS[sid] || MINE_STALL, top = i < PER_ROW, sx = 8 + (i % PER_ROW) * 7, ty = top ? 3.6 : 8, vi = M.vendors.length;
    M.vendors.push({ x: sx + 2, y: top ? 3.35 : 10.6, look: sid === 'cat' ? CAT_LADY : sid === 'shady' ? HOOD : pick(LOOKS), rows: sid === 'shady' ? SHADY : CUST, lines: `stalls.${sid}`, yes: st.yes ?? .5, no: sid === 'cat' ? 'catNo' : 'sellerNo', face: 1, walkT: 0, shady: sid === 'shady', gone: sid === 'mine' });
    M.solid.push({ x: sx, y: ty, w: 4, h: 1 }, top ? { x: sx, y: 2, w: 4, h: 1.6 } : { x: sx, y: 9, w: 4, h: 2.2 });
    const finds = sid === 'mine' ? [] : st.finds();
    if (sid === 'mine') {
      mine.forEach((f, j) => {
        M.items.push(f);
        M.slots.push({ x: sx + .55 + j * .72, y: ty + .45, tagY: j % 2 ? ty + 1.55 : ty + 1, vendor: vi, stall: i, mine: true });
      });
      M.objs.push({ id: 'mine', x: sx, y: ty, w: 4, h: 1, stand: { x: sx + 2, y: 7.6 }, mine: true, act: 'actMyTable' });
    }
    finds.forEach((k, j) => {
      const si = M.slots.length, x = finds.length === 1 ? sx + 2 : sx + 1.2 + j * 1.6;
      M.items.push(makeFind(k, !!st.hot));
      M.slots.push({ x, y: ty + .45, tagY: ty + 1, vendor: vi, stall: i });
      const hw = finds.length === 1 ? 1.8 : .7;
      M.objs.push({ id: 'slot' + si, x: x - hw, y: ty, w: hw * 2, h: 1, stand: { x, y: top ? 5.3 : 7.7 }, slot: si, act: 'actLook' });
    });
    M.stalls.push({ sid, sx, ty, top, st, vendor: vi });
  });
  M.objs.push({ id: 'car', x: 2, y: 9, w: 3, h: 2, stand: { x: 3.5, y: 8.6 }, act: 'actCar' });
  M.solid.push({ x: 2, y: 9, w: 3, h: 2.2 }, { x: 2, y: 2, w: 3, h: 2 });
  if (mine) M.selling = { t: TUNE.meetSell, spawn: 2 };
  // a seller hunting for something another stall has (Randi, 27 Nov)
  if (!mine && Math.random() < TUNE.wishChance) {
    const ok = M.stalls.filter(s => !['shady', 'models', 'mine', 'cat'].includes(s.sid));
    const who = pick(ok), items = M.items.map((f, i) => ({ f, i })).filter(({ f, i }) => f && !f.hot && !isBig(f) && !['box', 'junk', 'hotelbox', 'hairball'].includes(f.kind) && M.slots[i].vendor !== who.vendor);
    if (who && items.length) { const { f } = pick(items); M.wish = { vendor: who.vendor, kind: f.kind, t: 2 }; }
  }
  return M;
}
let scene = 'shop';
const here = o => !o.only || o.only();
const rivalObj = () => MK.rival && MK.rival.mode === 'stuck' && !(MK.rival.route || []).length ? [{ id: 'rivalT', x: MK.rival.x - .5, y: MK.rival.y - 1.2, w: 1, h: 1.2, stand: { x: MK.rival.x + .8, y: MK.rival.y }, act: 'actRival' }] : [];
const objs = () => scene === 'shop' ? SHOP.filter(here) : [...MK.objs.filter(o => (o.slot == null || MK.items[o.slot]) && here(o)), ...rivalObj()];
function solidAt(x, y) {
  if (scene === 'shop') {
    if (x < 1 || x >= W - 1 || y < 2 || y >= H - 1.2) return true;
    return SHOP.some(o => !o.wall && here(o) && x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
  }
  if (x < 1 || x >= W - 1 || y < MK.top || y >= MK.bottom) return true;
  return MK.solid.some(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
}
const blocked = (x, y, hw = .3, hh = .2) => solidAt(x - hw, y - hh) || solidAt(x + hw, y - hh) || solidAt(x - hw, y - .01) || solidAt(x + hw, y - .01);
function moveBy(o, dx, dy) {
  if (dx && !blocked(o.x + dx, o.y)) o.x += dx;
  if (dy && !blocked(o.x, o.y + dy)) o.y += dy;
}
// the shortest way over open floor, tile to tile; the door counts as floor
// for customers, who come and go through it
function path(from, to, door = false) {
  const free = (i, j) => (door && scene === 'shop' && j === 11 && (i === 9 || i === 10)) || !solidAt(i + .5, j + .5);
  const fi = clamp(Math.floor(from.x), 0, W - 1), fj = clamp(Math.floor(from.y), 0, H - 1);
  const ti = clamp(Math.floor(to.x), 0, W - 1), tj = clamp(Math.floor(to.y), 0, H - 1);
  const prev = new Map(), key = (i, j) => j * W + i, q = [[fi, fj]];
  prev.set(key(fi, fj), null);
  while (q.length) {
    const [i, j] = q.shift();
    if (i === ti && j === tj) break;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + a, nj = j + b;
      if (ni < 0 || nj < 0 || ni >= W || nj >= H || prev.has(key(ni, nj)) || !free(ni, nj)) continue;
      prev.set(key(ni, nj), key(i, j)); q.push([ni, nj]);
    }
  }
  if (!prev.has(key(ti, tj))) return null;
  const pts = [];
  for (let k = key(ti, tj); k != null; k = prev.get(k)) pts.unshift({ x: k % W + .5, y: Math.floor(k / W) + .6 });
  pts.shift(); if (pts.length) pts.pop();
  pts.push({ x: to.x, y: to.y });
  return pts;
}
// how far the shopkeeper is from a thing, edge to edge
function reach(o) {
  const dx = Math.max(o.x - P.x, 0, P.x - (o.x + o.w)), dy = Math.max(o.y - (P.y - .2), 0, (P.y - .2) - (o.y + o.h));
  return Math.hypot(dx, dy);
}
function inReach() {
  let best = null, bd = .8;
  for (const o of objs()) { const d = reach(o); if (d < bd) { bd = d; best = o; } }
  return best;
}

// ---------- People ----------
const P = { x: 10, y: 9.5, face: 1, moving: false, walkT: 0, route: null, goal: null, stuck: 0 };
let custs = [], floats = [], spawnT = 0;
// a live mouse out of a mystery box (26 Nov) scurries about the shop until the
// shopkeeper catches it; a customer it runs near shrieks and leaves. Not saved.
let mice = [];
function addMouse() { mice.push({ x: 3 + Math.random() * 2, y: 6, face: 1, dx: 1, dy: 0, t: 0 }); }
function stepMice(dt) {
  for (const m of mice) {
    m.t -= dt;
    if (m.t <= 0) { const a = Math.random() * Math.PI * 2; m.dx = Math.cos(a); m.dy = Math.sin(a); m.t = rand(.4, 1.2); }
    const ox = m.x, oy = m.y;
    moveBy(m, m.dx * TUNE.mouse * dt, m.dy * TUNE.mouse * dt);
    if (m.x === ox && m.y === oy) m.t = 0;
    if (m.dx) m.face = m.dx > 0 ? 1 : -1;
    if (dist(m, P) < .55) { m.caught = true; SFX.coin(); say(t('mouseCaught')); }
  }
  mice = mice.filter(m => !m.caught);
}

// ---------- Messages ----------
const queue = []; let msgUntil = 0;
function say(text, ms) { if (queue.length > 2) queue.shift(); queue.push({ text, ms: ms || Math.max(2200, text.length * 65) }); }
function stepMsg(now) {
  const el = $('#msg');
  if (now < msgUntil) return;
  if (!queue.length) { el.hidden = true; return; }
  const m = queue.shift(); el.textContent = m.text; el.hidden = false; msgUntil = now + m.ms;
}
function float(x, y, text, color) { floats.push({ x, y, text, color, t: 1.6 }); }

// ---------- Sound ----------
const tone = RDG.sound({ on: () => S.sound, vol: .05 });
const SFX = {
  step() { tone(180, .03, 'triangle', 0, .02); },
  bell() { tone(1568, .25, 'sine', 0, .05); tone(1976, .35, 'sine', .12, .04); },
  flash() { tone(2400, .05, 'square', 0, .03, 1200); tone(900, .2, 'triangle', .05, .04, 300); },
  ching() { tone(1319, .08, 'square', 0, .05); tone(1760, .12, 'square', .08, .05); tone(2637, .25, 'square', .18, .04); },
  coin() { tone(988, .06, 'square'); tone(1319, .1, 'square', .06); },
  no() { tone(330, .12, 'triangle', 0, .07, 220); tone(220, .2, 'triangle', .12, .07, 160); },
  open() { [392, 523, 659, 784].forEach((f, i) => tone(f, .1, 'square', i * .08, .05)); },
  rip() { for (let i = 0; i < 5; i++) tone(500 + Math.random() * 900, .03, 'sawtooth', i * .04, .025); },
  wow() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .14, 'square', i * .11, .05)); },
  door() { tone(1175, .1, 'sine', 0, .05); tone(880, .2, 'sine', .1, .05); },
  car() { tone(90, .4, 'sawtooth', 0, .03, 140); },
  siren() { for (let i = 0; i < 8; i++) tone(i % 2 ? 960 : 720, .22, 'square', i * .22, .03); },
  meow() { tone(620, .12, 'sine', 0, .06, 920); tone(920, .2, 'sine', .12, .05, 520); },
};

// ---------- Input ----------
const keys = {};
const stick = RDG.stick('#pad', '#knob');
const DIRK = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
let mode = 'title', hintUntil = 0;
// on a phone, a card that focused the price box would pop the keyboard up
const coarse = () => matchMedia('(pointer:coarse)').matches;
const playing = () => mode === 'play' && $('#cover').hidden;
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!$('#cover').hidden) { if (k === 'escape') { e.preventDefault(); escCard(); } return; }
  if (mode !== 'play') return;
  if (DIRK[k]) { keys[k] = true; e.preventDefault(); P.route = null; P.goal = null; }
  if (e.repeat) return;
  if (k === ' ' || k === 'enter') { e.preventDefault(); act(); }
  else if (k === 'h' || k === '?') toggleHelp();
  else if (k === 'escape' && !$('#help').hidden) toggleHelp(false);
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
$('#actBtn').addEventListener('pointerdown', e => { e.preventDefault(); if (playing()) act(); });
// a tap on a thing walks there and uses it; a tap on the floor walks there
function tileAt(e) {
  const r = cv.getBoundingClientRect();
  return { x: camX + (e.clientX - r.left) / r.width * VW, y: (e.clientY - r.top) / r.height * H };
}
cv.addEventListener('pointerdown', e => {
  if (!playing()) return;
  const at = tileAt(e);
  const o = objs().find(o => at.x >= o.x - .15 && at.x < o.x + o.w + .15 && at.y >= o.y - .3 && at.y < o.y + o.h + .15);
  if (o) { if (reach(o) < .8) { P.route = null; P.goal = null; use(o); } else walkTo(o.stand, o); }
  else if (!solidAt(at.x, at.y + .3)) walkTo({ x: at.x, y: at.y + .3 }, null);
});
function walkTo(to, goal) {
  const r = path(P, to);
  if (!r) return;
  P.route = r; P.goal = goal; P.stuck = 0;
}
RDG.noZoom(playing, ['#pad', '#actBtn', '#cv']);
RDG.pad({ a: ' ', b: 'Escape', select: 'h', start: 'Enter', stick });
function inputDir() {
  let x = 0, y = 0;
  for (const k in DIRK) if (keys[k]) { x += DIRK[k][0]; y += DIRK[k][1]; }
  if (stick.on) { x += stick.x; y += stick.y; P.route = null; P.goal = null; }
  const l = Math.hypot(x, y);
  return l > .15 ? { x: x / Math.max(1, l), y: y / Math.max(1, l) } : null;
}

// ---------- Walking ----------
function stepKeeper(dt) {
  let d = inputDir();
  if (!d && P.route) {
    const n = P.route[0], l = dist(P, n);
    if (l < .12) {
      P.route.shift();
      if (!P.route.length) { const g = P.goal; P.route = null; P.goal = null; if (g && reach(g) < .9) use(g); }
    } else d = { x: (n.x - P.x) / l, y: (n.y - P.y) / l };
  }
  P.moving = !!d;
  if (!d) return;
  const bx = P.x, by = P.y, sp = TUNE.walk * dt;
  moveBy(P, d.x * sp, d.y * sp);
  if (Math.abs(d.x) > .3) P.face = d.x > 0 ? 1 : -1;
  P.walkT += dt;
  if (P.route) { if (dist(P, { x: bx, y: by }) < sp * .2) { P.stuck += dt; if (P.stuck > .5) { P.route = null; P.goal = null; } } else P.stuck = 0; }
}

// ---------- Using things ----------
function actionNow() { const o = inReach(); return o ? (o.act === 'actCar' ? `actRide.${S.ride}` : o.act) : 'use'; }
function act() { const o = inReach(); if (o) use(o); }
function use(o) {
  if (scene === 'yard') {
    if (o.pile != null) return sweep(o.pile);
    if (o.id === 'lady') return ladyCard();
    if (o.id === 'heap') return sweepHeap();
    if (o.id === 'kid') return kidCard();
    if (o.id === 'ridesale') return rideCard();
    if (o.id === 'rivalT') return rivalHelpCard();
    if (o.mine) return firstWaiting() ? regCard() : say(t('meetMine'));
    if (o.slot != null) return lookCard(o.slot);
    if (o.id === 'car') return carCard();
    if (o.vendor != null) { say(t(MK.vendors[o.vendor].lines)); if (MK.id === 'cat') SFX.meow(); return; }
    return;
  }
  if (o.id === 'desk') return deskCard();
  if (o.spot != null) return spotCard(o.spot);
  if (o.id === 'reg') return regCard();
  if (o.id === 'board') return boardCard();
  if (o.id === 'door') return doorCard();
  if (o.id === 'fleet') return fleetCard();
  if (o.id === 'corner') return cornerCard();
  if (o.id === 'tank') return tankCard();
  if (o.id === 'bench') return benchCard();
  if (o.id === 'donate') return donateCard();
}

// ---------- Cards ----------
// A card covers the room and the day stops while it's up, so nobody waits at
// the register while you're pricing something.
let escAct = 'close';
function openCard(html, focusSel, esc = 'close') {
  $('#card').innerHTML = html; $('#cover').hidden = false; stick.letGo();
  for (const k in keys) keys[k] = false;
  P.route = null; P.goal = null; escAct = esc;
  const f = $('#card').querySelector(focusSel || '.btn.go:not(:disabled)') || $('#card').querySelector('button:not(:disabled)'); if (f) f.focus();
}
function closeCard() { $('#cover').hidden = true; }
function escCard() { const b = $('#card').querySelector(`[data-act="${escAct}"]`); if (b) b.click(); else if (escAct === 'close') closeCard(); }
const btn = (act, label, go = false, extra = '') => `<button class="btn${go ? ' go' : ''}" type="button" data-act="${act}" ${extra}>${label}</button>`;
const h2 = s => `<h2 id="cardTitle">${s}</h2>`;
let cardFind = null, cardFrom = null, cardSpot = null;
$('#card').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  const a = b.dataset.act, f = cardFind;
  if (a === 'close') closeCard();
  // the door
  else if (a === 'go') goBuying(b.dataset.sale);
  else if (a === 'openShop') openShop();
  else if (a === 'closeUp') { closeCard(); S.clock = TUNE.dayLen; }
  // the yard sale
  else if (a === 'buy') buy(+b.dataset.slot);
  else if (a === 'askLess') askLess(+b.dataset.slot);
  else if (a === 'hgStop') hgStop();
  else if (a === 'drive') backToShop();
  else if (a === 'pickSell') pickCard();
  else if (a === 'pickT') { const u = +b.dataset.uid, i = picking.indexOf(u); if (i >= 0) picking.splice(i, 1); else if (picking.length < TUNE.tableMax) picking.push(u); pickCard(); const again = $('#card').querySelector(`[data-uid="${u}"]`); if (again) again.focus(); }
  else if (a === 'goSell') goSelling();
  else if (a === 'doorBack') doorCard();
  else if (a === 'love') { closeCard(); showBar(); }
  else if (a === 'kidBuy') kidBuy();
  else if (a === 'buyRide') buyRide();
  else if (a === 'moveList') moveCard();
  else if (a === 'lordList') lordCard(+b.dataset.tier);
  else if (a === 'moveIn') moveIn(+b.dataset.tier, b.dataset.lord);
  else if (a === 'honest') honest(+b.dataset.slot);
  else if (a === 'helpRival') helpRival();
  else if (a === 'donate') donate(byUid(+b.dataset.uid));
  else if (a === 'mailBack') { S.stock = S.stock.filter(x => x !== f); S.pocket -= TUNE.stamps; S.mail = { day: S.day }; deed('album'); save(); showBar(); SFX.coin(); say(t('mailed', { n: TUNE.stamps })); deskCard(); }
  else if (a === 'kidSell') { const c = regCust; c.price = TUNE.kidHas; deed('kid'); if (Math.random() < TUNE.kidFriend) S.friends = (S.friends || 0) + 1; sell(c, TUNE.kidHas); }
  else if (a === 'fleetOut') fleetOut(b.dataset.name);
  else if (a === 'wishGive') wishGive(byUid(+b.dataset.uid));
  else if (a === 'openHotel') openHotel(f);
  else if (a === 'store') storeCard();
  else if (a === 'buyTank') buyTank();
  else if (a === 'buyBench') { if (!S.bench && S.pocket >= TUNE.bench) { S.pocket -= TUNE.bench; S.bench = true; save(); SFX.ching(); showBar(); say(t('benchArrives')); closeCard(); } }
  else if (a === 'clean') benchJob(byUid(+b.dataset.uid), 'clean');
  else if (a === 'benchOff') benchOff(+b.dataset.uid);
  else if (a === 'fix') benchJob(byUid(+b.dataset.uid), 'fix');
  else if (a === 'giveLocket') giveLocket();
  else if (a === 'museum') armorChoice('sold');
  else if (a === 'keepArmor') armorChoice('kept');
  else if (a === 'kidAsk') kidAsk();
  else if (a === 'cornerAdd') cornerAdd(byUid(+b.dataset.uid));
  else if (a === 'cornerOut') cornerOut(+b.dataset.uid);
  // the desk and the floor
  else if (a === 'find') findCard(byUid(+b.dataset.uid), cardFrom, cardSpot);
  else if (a === 'desk') deskCard();
  else if (a === 'spotList') spotCard(cardSpot);
  else if (a === 'snap') snap(f);
  else if (a === 'openBox') openBox(f);
  else if (a === 'quick') quickSell(f);
  else if (a === 'toss') { S.stock = S.stock.filter(x => x !== f); save(); SFX.no(); say(t('tossed')); deskCard(); }
  else if (a === 'copsOk') { closeCard(); showBar(); if (endAfterCops) { endAfterCops = false; endDay(); } }
  else if (a === 'putOut') putOut(f, targetSpot(f));
  else if (a === 'guide') { S.pocket -= TUNE.guide; S.guide = true; save(); SFX.ching(); say(t('guideGot')); showBar(); deskCard(); }
  else if (a === 'unwrap') unwrap(f);
  else if (a === 'turnIn') { S.stock = S.stock.filter(x => x !== f); S.pocket += TUNE.turnIn; save(); SFX.ching(); say(t('turnedIn', { n: TUNE.turnIn })); showBar(); deskCard(); }
  else if (a === 'keepShip') { S.stock = S.stock.filter(x => x !== f); S.fleet.push(f.ship); save(); SFX.wow(); say(t('keptShip', { name: f.ship })); deskCard(); }
  else if (a === 'jail') { closeCard(); for (const c of custs) putBack(c); custs = []; S.clock = TUNE.dayLen; S.yardDone = true; endDay(); }
  else if (a === 'takeBack') { S.spots[spotOf(f)] = null; save(); findCard(f, 'desk'); }
  else if (a === 'less' || a === 'more') { const inp = $('#tagIn'); setTag(f, (+inp.value || 0) + (a === 'more' ? 5 : -5)); inp.value = f.tag || ''; refreshFindBtns(f); }
  // the register
  else if (a === 'ring') sell(regCust, regCust.price);
  else if (a === 'offer') sell(regCust, regCust.offer);
  else if (a === 'counter') counter(regCust);
  else if (a === 'noSale') noSale(regCust);
  else if (a === 'bidSell') sellToBidder(regCust);
  // the end of the day
  else if (a === 'rent') rentCard();
  else if (a === 'nextDay') nextDay();
});
$('#card').addEventListener('input', e => {
  if (e.target.id === 'tagIn' && cardFind) { setTag(cardFind, Math.floor(+e.target.value || 0)); refreshFindBtns(cardFind); }
});
// a find out on a table always has a tag, or it would go for nothing
function setTag(f, n) { f.tag = clamp(Math.round(n), spotOf(f) >= 0 ? 1 : 0, 99999); save(); }

// The title card is Pick a file, and the file pill in the bar comes back to
// it. Leaving a shop is a reload without the reload: customers holding a find
// put it back, and the scene, mice and help are cleared for the next file.
function titleCard() {
  if (mode === 'play') { for (const c of custs) putBack(c); save(); }
  mode = 'title'; regCust = null; hg = null; mice = []; enterShop(); P.x = 10; P.y = 9.5;
  toggleHelp(false); $('#ctrl').hidden = true; showBar();
  openCard(`${h2(t('title'))}<p>${t('intro')}</p><h3>${t('pickFile')}</h3><div id="who"></div>`, null, 'none');
  SaveFiles.mount($('#who'), { game: KEY, summary: d => t('fileSum', { day: d.day || 1, pocket: d.pocket ?? TUNE.start }), onPick: (n, m) => { useFile(n, m); startPlay(); } });
  $('#who').querySelector('button').focus();
}
$('#whoBtn').addEventListener('click', titleCard);

// ----- the door -----
function doorCard() {
  if (S.phase === 'open') {
    openCard(`${h2(t('closeTitle'))}<p>${t('closeText', { clock: clockText() })}</p><div class="row">${btn('close', t('keepOpen'))}${btn('closeUp', t('closeUp'), true)}</div>`);
    return;
  }
  const any = S.spots.some(u => u != null);
  const icon = { garage: LOOK.shovel[0], toys: LOOK.robot[0], cat: ART[1], swap: PIX.box, sell: PIX.present, dump: PIX.tablet, downtown: PIX.mirror };
  const fees = { swap: SALES.swap.fee, sell: TUNE.tableFee, dump: TUNE.dumpFee };
  // what your ride reaches: on foot, only the first yard sale
  const why = (id, i) => ride().rank < (NEED[id] || 0) ? t(NEED[id] === 1 ? 'needBike' : 'needCar') : !ride().rank && i === 1 ? t('tooFar') : '';
  const places = S.yardDone ? `<p class="soft">${t('beenYard')}</p>` : `<div class="list">${[...S.today, 'downtown', 'swap', 'dump', 'sell'].map((id, i) =>
    `<button class="it" type="button" data-act="${id === 'sell' ? 'pickSell' : 'go'}" data-sale="${id}" ${why(id, i) ? 'disabled' : ''}><img src="${picSrc(icon[id])}" alt=""><span>${t(`sales.${id}.name`)}<small>${why(id, i) || t(`sales.${id}.line`, { fee: fees[id], time: TUNE.dumpTime })}</small></span></button>`).join('')}</div>`;
  openCard(`${h2(t('doorTitle'))}<p>${t('doorText', { n: S.day })}</p><p class="soft">${t(`rideNow.${S.ride}`, { n: ride().carry })}</p>${places}${any ? '' : `<p class="soft">${t('nothingOut')}</p>`}
    <div class="row">${btn('close', t('cancel'))}${btn('openShop', t('openShop'), S.yardDone && any)}</div>`, S.yardDone ? null : '.it');
}

// ----- the yard sale -----
function goBuying(id, mine = null) {
  const fee = mine ? TUNE.tableFee : id === 'swap' ? SALES.swap.fee : id === 'dump' ? TUNE.dumpFee : 0;
  if (S.pocket < fee) { closeCard(); say(t('tooPoorFee', { n: fee })); return; }
  closeCard(); SFX.car();
  S.pocket -= fee; S.yardDone = true; save();
  queue.length = 0;
  MK = id === 'swap' ? buildSwap(mine) : id === 'dump' ? buildDump() : id === 'downtown' ? buildDowntown() : buildYard(id);
  if (!mine && (id === 'swap' || (id !== 'dump' && id !== 'downtown' && Math.random() < TUNE.rivalYard)))
    MK.rival = { x: MK.start.x + 1.5, y: MK.start.y, look: RIVAL_LOOK, rows: CUST, mode: 'rest', t: randIn(TUNE.rivalStart), took: 0, max: TUNE.rivalMax[MK.kind], face: 1, walkT: 0, route: null, speed: TUNE.rivalWalk };
  scene = 'yard'; P.x = MK.start.x; P.y = MK.start.y; P.route = null; custs = []; floats = [];
  setWidth(MK.w);
  if (mine) { say(t('meetHello')); say(t('fee', { n: fee })); }
  else if (id === 'dump') { say(t('dumpHello', { time: TUNE.dumpTime })); say(t('dumpFee', { n: fee })); }
  else if (fee) { say(t('swapHello')); say(t('fee', { n: fee })); } else say(t(MK.vendors[0].lines));
  if (MK.rival) say(t('rivalHere'));
  // rolling up in the tank (his ask): the rival freezes, and you get first pick
  if (S.ride === 'tank') {
    if (MK.rival) { MK.rival.t += TUNE.tankStun; MK.rival.say = { text: t('tankGasp'), t: 3 }; say(t('tankStunned')); }
    const rv = MK.vendors.find(v => v.rival); if (rv) { rv.say = { text: t('tankGasp'), t: 3 }; rv.yes = .6; }
  }
  if (id === 'downtown') say(t('goalDowntown'));
  if (S.tip && (MK.kind === 'yard' || MK.kind === 'downtown')) {
    const i = MK.items.findIndex((f, i) => f && !f.good && KINDS[f.kind].real > 0 && f.kind !== 'box' && !MK.vendors[MK.slots[i].vendor].rival && !f.free);
    if (i >= 0) { let g = makeFind(MK.items[i].kind); for (let n = 0; n < 20 && !g.good; n++) g = makeFind(MK.items[i].kind); if (g.good) { MK.items[i] = g; S.tip = false; save(); say(t('tipHere')); } }
  }
  showBar();
}
// ----- your table at the swap meet -----
// Pick up to five tagged finds; they stay in your stock and sit on your table.
// What buyers take is rung up at the table; the rest comes home.
let picking = [];
function pickCard() {
  const can = S.stock.filter(f => f.tag && !isBig(f) && f.kind !== 'pills' && !inCorner(f) && !onBench(f));
  picking = picking.filter(u => can.some(f => f.uid === u));
  const rows = can.map(f => `<button class="it" type="button" data-act="pickT" data-uid="${f.uid}" aria-pressed="${picking.includes(f.uid)}"><img src="${picSrc(rowsOf(f), colOf(f))}" alt=""><span>${picking.includes(f.uid) ? '✓ ' : ''}${Name(f)}<small>${t('tag')} $${f.tag}</small></span></button>`).join('');
  const poor = S.pocket < TUNE.tableFee;
  openCard(`${h2(t('pickTitle'))}<p>${can.length ? t('pickText', { max: TUNE.tableMax, fee: TUNE.tableFee }) : t('pickNone')}</p>
    ${S.stock.some(isBig) ? `<p class="soft">${t('pickBig')}</p>` : ''}<div class="list">${rows}</div>
    <p class="soft" role="status">${t('pickCount', { n: picking.length, max: TUNE.tableMax })}</p>
    <div class="row">${btn('doorBack', t('back'))}${btn('goSell', t('pickGo', { n: picking.length }), true, !picking.length || poor ? 'disabled' : '')}</div>`, '.it', 'doorBack');
}
function goSelling() {
  const mine = picking.map(byUid).filter(Boolean);
  for (const f of mine) { const i = spotOf(f); if (i >= 0) S.spots[i] = null; }
  picking = [];
  goBuying('swap', mine);
}
const MINE_STALL = { sign: 'YOU', canopy: '#2f7a4a', finds: () => [] };
// buyers walk in along the middle aisle to your table, look, and decide the
// way shop customers do; collectors are common here
function stepMeet(dt) {
  const m = MK.selling;
  if (m.t > 0) {
    m.t -= dt; m.spawn -= dt;
    if (m.t <= 0) say(t('meetClosing'));
    const free = MK.slots.map((s, i) => s.mine && MK.items[i] && !custs.some(c => c.slot === i) ? i : -1).filter(i => i >= 0);
    if (m.spawn <= 0 && free.length) {
      m.spawn = randIn(TUNE.meetEvery);
      const r = Math.random(), kind = r < .4 ? 'collector' : r < .8 ? 'regular' : 'hunter';
      const slot = pick(free), sl = MK.slots[slot];
      custs.push({ x: -.5, y: 6.4, kind, slot, look: kind === 'collector' ? { ...pick(LOOKS), h: '#2a2a30' } : pick(LOOKS), rows: kind === 'collector' ? COLLECTOR : CUST,
        mode: 'in', t: 0, walkT: 0, face: 1, route: [{ x: sl.x, y: 6.4 }, { x: sl.x, y: 7.6 }], find: null, say: null });
    }
  }
  for (const c of custs) {
    if (c.say) { c.say.t -= dt; if (c.say.t <= 0) c.say = null; }
    if (c.mode === 'in') { if (walk(c, dt)) { c.mode = 'browse'; c.t = randIn(TUNE.browse); bubble(c, t('browse'), 1.2); } }
    else if (c.mode === 'browse') {
      c.t -= dt; if (c.t > 0) continue;
      const f = MK.items[c.slot];
      if (f && c.kind !== 'collector' && Math.random() < TUNE.justLook) { bubble(c, t('justLook')); leaveShop(c); continue; }
      if (!f || !decide(c, f)) { bubble(c, t(f ? 'tooPricey' : 'nothingHere')); leaveShop(c); continue; }
      c.find = f; MK.items[c.slot] = null; c.mode = 'wait'; c.joined = ++lineNo; c.t = TUNE.wait; bubble(c, t('wait')); SFX.bell();
    } else if (c.mode === 'wait') { c.t -= dt; if (c.t <= 0) { bubble(c, t('forget')); putBack(c); leaveShop(c); } }
    else if (c.mode === 'out') { if (walk(c, dt)) c.gone = true; }
  }
  custs = custs.filter(c => !c.gone);
}
// ----- the rival flipper (27 Nov) -----
// He walks the tables like you do, looks at one find a few seconds, and buys
// it if he likes it: usually a real one, now and then a dud. He leaves the
// free battleship, the stolen goods and the kid's sporks alone, and goes once
// he's bought `max` things or there's nothing left he wants.
function stepRival(dt) {
  const r = MK.rival; if (r.gone) return;
  if (r.say) { r.say.t -= dt; if (r.say.t <= 0) r.say = null; }
  const wants = i => { const f = MK.items[i]; return f && !f.free && !f.hot && !(r.passed || []).includes(f.uid); };
  if (r.mode === 'rest') {
    r.t -= dt; if (r.t > 0) return;
    const open = MK.items.map((f, i) => wants(i) ? i : -1).filter(i => i >= 0);
    if (r.took >= r.max || !open.length) {
      // now and then his truck won't start, and he's stuck by the gate
      if (!r.troubled && Math.random() < TUNE.rivalTrouble) { r.troubled = true; r.mode = 'stuck'; r.route = path(r, { x: MK.start.x + 1.6, y: MK.start.y }) || []; r.say = { text: t('rivalStuck'), t: 3 }; return; }
      r.say = { text: t('rivalBye'), t: 2 }; r.mode = 'leave'; r.route = path(r, MK.start) || []; return;
    }
    r.slot = pick(open); const o = MK.objs.find(o => o.slot === r.slot);
    r.route = path(r, { x: o.stand.x + .5, y: o.stand.y }) || [{ x: o.stand.x + .5, y: o.stand.y }]; r.mode = 'go';
  } else if (r.mode === 'go') {
    if (walk(r, dt, r.speed)) { r.mode = 'look'; r.t = randIn(TUNE.rivalLook); r.face = MK.slots[r.slot].x < r.x ? -1 : 1; }
  } else if (r.mode === 'look') {
    r.t -= dt; if (r.t > 0) return;
    const f = MK.items[r.slot];
    if (f && wants(r.slot)) {
      const eye = f.kind === 'box' ? TUNE.rivalEye.box : f.good ? TUNE.rivalEye.real : TUNE.rivalEye.dud;
      if (Math.random() < eye) {
        MK.items[r.slot] = null; r.took++; SFX.no();
        r.say = { text: t('rivalTook'), t: 1.8 }; say(t('rivalGot', { item: nameOf(f) }));
        float(MK.slots[r.slot].x, MK.slots[r.slot].y - .6, `$${f.ask}`, '#e8a030');
      } else { (r.passed ||= []).push(f.uid); r.say = { text: t('rivalPass'), t: 1.4 }; }
    }
    r.mode = 'rest'; r.t = randIn(TUNE.rivalRest);
  } else if (r.mode === 'stuck') { walk(r, dt, r.speed); if (!r.say && Math.random() < dt / 6) r.say = { text: t('rivalStuck'), t: 2.4 }; }
  else if (r.mode === 'leave') { if (walk(r, dt, r.speed)) r.gone = true; }
}
// ----- being kind at the swap meet (Randi, 27 Nov) -----
// Give a seller the thing they're hunting for. The first time, it's a 1920s
// snow globe that was their great-grandma's; after that, a few dollars.
function wishGive(f) {
  if (!f || !MK.wish) return;
  const v = MK.vendors[MK.wish.vendor]; MK.wish.done = true; deed('wish');
  S.stock = S.stock.filter(x => x !== f); const i = spotOf(f); if (i >= 0) S.spots[i] = null;
  let what, pic;
  if (!S.globe) { const g = makeFind('globe'); delete g.ask; g.cost = 0; S.stock.push(g); S.globe = true; what = nameOf(g); pic = picHtml(g); SFX.wow(); }
  else { S.pocket += TUNE.wishTip; what = t('wishTip', { n: TUNE.wishTip }); SFX.ching(); }
  save(); showBar(); v.say = { text: t('thanks'), t: 2 };
  openCard(`${h2(t('thanks'))}<p>${S.globe && pic ? t('wishThanks') : t('wishThanksAgain')}</p>${pic || ''}<p>${pic ? t('wishGot', { what }) : what}</p><div class="row">${btn('close', t('done'), true)}</div>`);
}
// ----- the frogs (his idea) -----
// One 1958 hotel box per save turns up at a garage sale or the OLD STUFF
// stall. Opened at the desk, five live frogs. They need a glass tank, and the
// only place that sells one is the online store, at its price. In their
// tank they draw people in. They're never for sale.
const frogsLeft = () => !S.frogs && !S.stock.some(f => f.kind === 'hotelbox');
function openHotel(f) {
  S.stock = S.stock.filter(x => x !== f); S.frogs = true; save(); SFX.rip();
  for (let i = 0; i < 5; i++) tone(180 + i * 30, .09, 'square', i * .15, .05, 120);
  openCard(`${h2(t('frogsTitle'))}<div class="pic"><img src="${picSrc(FROG)}" alt=""></div><p>${t(S.tank ? 'frogsInTank' : 'frogsText')}</p><div class="row">${S.tank ? '' : btn('store', t('storeBtn'))}${btn('desk', t('done'), true)}</div>`, null, 'desk');
}
function storeCard() {
  const junk = STR.storeJunk.map((n, i) => `<li><span>${n} · ${STR.storeJunkPrice[i]}</span> <small>${t('storeNope')}</small></li>`);
  junk.splice(2, 0, `<li><b>${t('storeTank')} · $${TUNE.tank}</b> ${btn('buyTank', S.tank ? t('storeHave') : t('storeBuy', { n: TUNE.tank }), !S.tank, S.tank || S.pocket < TUNE.tank ? 'disabled' : '')}</li>`);
  const bench = `<ul class="store"><li><span><b>${t('storeBench')} · $${TUNE.bench}</b><br><small>${t('storeBenchNote')}</small></span> ${btn('buyBench', S.bench ? t('storeHave') : t('storeBuy', { n: TUNE.bench }), false, S.bench || S.pocket < TUNE.bench ? 'disabled' : '')}</li></ul>`;
  openCard(`${h2(t('storeTitle'))}${bench}<p class="soft">${t('storeSearch')}</p><ul class="store">${junk.join('')}</ul><p class="note">${t('storeNote', { n: TUNE.tankElsewhere })}</p>
    ${S.frogs && !S.tank ? `<p>${t('frogsWait')}</p>` : ''}<div class="row">${btn('desk', t('back'), true)}</div>`, null, 'desk');
}
function buyTank() {
  if (S.tank || S.pocket < TUNE.tank) return;
  S.pocket -= TUNE.tank; S.tank = true; save(); SFX.ching(); showBar();
  say(t(S.frogs ? 'tankArrives' : 'tankEmpty')); closeCard();
}
function tankCard() {
  openCard(`${h2(t('tankTitle'))}${S.frogs ? `<div class="pic"><img src="${picSrc(FROG)}" alt=""></div>` : ''}<p>${t(S.frogs ? 'tankText' : 'tankNone')}</p><div class="row">${btn('close', t('done'), true)}</div>`);
}
// ----- the workbench (his ask, 27 Nov) -----
// A find left on the bench is out of stock until its job is done. Clean
// raises a real find's condition one step, up to Crisp (mint is only ever
// found); it costs a fifth of what it adds, at least $5 (at a flat $5,
// cleaning a worn camera doubled its worth for almost nothing). Fix makes
// something broken but real (FIX) work again at Worn, after a few days and
// with the parts paid up front; it can fail, which you find out only when
// it's done, and some can't be fixed at all because nobody makes the parts.
// Copies and knockoffs can't be fixed. The bench holds `benchSlots`, so jobs
// pile up. It was one instant job a day at first; he wanted time and parts.
function setQ(f, q) {
  const base = f.base ?? f.value / QUAL.mult[f.q - 1];
  f.base = base; f.q = q;
  const v = Math.min(QUAL.cap[q - 1], Math.max(QUAL.floor[q - 1], base * QUAL.mult[q - 1]));
  f.value = v < 10 ? Math.round(v) : round5(v);
}
function cleanCost(f) {
  const base = f.base ?? f.value / QUAL.mult[f.q - 1], q = f.q + 1;
  const v = Math.min(QUAL.cap[q - 1], Math.max(QUAL.floor[q - 1], base * QUAL.mult[q - 1]));
  return Math.max(TUNE.cleanCost, round5((v - f.value) * TUNE.cleanShare));
}
const canClean = f => known(f) && f.good && f.q && f.q < 4 && !f.cleaned;
const canFix = f => known(f) && !f.good && FIXABLE.has(f.kind) && !f.fixed;
const onBench = f => (S.benchJobs || []).some(j => j.uid === f.uid);
const cleanHours = f => f.kind === 'musket' ? 6 : TUNE.cleanHours;
const hoursText = n => { n = Math.max(1, Math.ceil(n)); return n === 1 ? t('oneHour') : n >= 8 ? t('shopDays', { n, d: Math.round(n / 8) }) : t('manyHours', { n }); };
function benchCard(msg) {
  const jobs = S.benchJobs || [], full = jobs.length >= TUNE.benchSlots;
  const on = jobs.map(j => { const f = byUid(j.uid); return f ? `<li><span><img src="${picSrc(rowsOf(f), colOf(f))}" alt=""> ${Name(f)}<br><small>${t(j.job === 'clean' ? 'benchCleaning' : 'benchFixing', { h: hoursText(j.left) })}</small></span> ${btn('benchOff', t('benchTake'), false, `data-uid="${f.uid}"`)}</li>` : ''; }).join('');
  const list = inBack().filter(f => canClean(f) || canFix(f));
  const rows = list.map(f => {
    const clean = canClean(f), cost = clean ? cleanCost(f) : FIX[f.kind][1], hours = clean ? cleanHours(f) : FIX[f.kind][0];
    return `<li><span><img src="${picSrc(rowsOf(f), colOf(f))}" alt=""> ${Name(f)}<br><small>${f.q ? condText(f) + ' · ' : ''}${t('worth')} $${f.value}</small></span>
    ${btn(clean ? 'clean' : 'fix', t(clean ? 'benchClean' : 'benchFix', { d: hoursText(hours), n: cost }), false, `data-uid="${f.uid}" ${full || S.pocket < cost ? 'disabled' : ''}`)}</li>`;
  }).join('');
  openCard(`${h2(t('benchTitle'))}<p>${t('benchText', { n: TUNE.benchSlots })}</p>${msg ? `<p class="note" role="status">${msg}</p>` : full ? `<p class="soft">${t('benchFull')}</p>` : ''}
    <h3>${t('benchOn')} (${jobs.length}/${TUNE.benchSlots})</h3>${on ? `<ul class="store bench">${on}</ul>` : `<p class="soft">${t('benchEmpty')}</p>`}
    <h3>${t('benchFrom')}</h3>${rows ? `<ul class="store bench">${rows}</ul>` : `<p class="soft">${t('benchNone')}</p>`}<div class="row">${btn('close', t('done'), true)}</div>`);
}
function benchJob(f, job) {
  const jobs = S.benchJobs = S.benchJobs || [];
  if (!f || jobs.length >= TUNE.benchSlots) return;
  if (job === 'fix') {
    if (!canFix(f)) return;
    // the first look tells you whether parts exist at all
    if (f.parts == null) f.parts = Math.random() >= TUNE.noParts;
    if (!f.parts) { f.fixed = true; save(); SFX.no(); return benchCard(t('noParts')); }
  } else if (!canClean(f)) return;
  const cost = job === 'clean' ? cleanCost(f) : FIX[f.kind][1], hours = job === 'clean' ? cleanHours(f) : FIX[f.kind][0];
  if (S.pocket < cost) return;
  S.pocket -= cost; const i = spotOf(f); if (i >= 0) S.spots[i] = null;
  jobs.push({ uid: f.uid, job, left: hours });
  save(); showBar(); SFX.coin(); benchCard(t('benchStarted', { h: hoursText(hours) }));
}
function benchOff(uid) {
  S.benchJobs = (S.benchJobs || []).filter(j => j.uid !== uid); save(); benchCard(t('benchTook'));
}
// the bench works while the shop is open; a job that's done comes off the
// bench there and then, fixed or not
function benchTick(hours) {
  const jobs = S.benchJobs || []; if (!jobs.length) return;
  for (const j of jobs) j.left -= hours;
  const due = jobs.filter(j => j.left <= 0);
  if (!due.length) return;
  S.benchJobs = jobs.filter(j => j.left > 0);
  const bn = SHOP.find(o => o.id === 'bench'); float(bn.x + 1.2, bn.y - .4, '!', '#2f7a4a');
  for (const j of due) {
    const f = byUid(j.uid); if (!f) continue;
    if (j.job === 'clean') { f.cleaned = true; setQ(f, f.q + 1); say(t('benchCleaned', { item: nameOf(f), cond: STR.cond[f.q - 1], n: f.value })); continue; }
    f.fixed = true;
    if (Math.random() < FIX[f.kind][2]) { say(t('benchFail', { item: nameOf(f) })); continue; }
    if (f.kind === 'computer') f.decade = pick(['1970s', '1980s', '1980s', '1990s', '1990s']);
    f.good = true; f.base = (f.decade ? PC_WORTH[f.decade] : KINDS[f.kind].worth) * rand(1 - TUNE.jitter, 1 + TUNE.jitter); f.q = 2; setQ(f, 2);
    say(t('benchFixed', { item: nameOf(f), n: f.value }));
  }
  save(); SFX.wow();
}
// ----- the dump lady, her locket, and the tank (his idea, 27 Nov) -----
// Once a save. She lives at the dump and has lost her mother's locket in one
// of the piles. Sweep it up and give it back, and she walks you to the
// biggest heap; sweep that and there's an old army tank her husband drove
// home from the war. It runs but never fires. Sell it to the museum, or keep
// it parked outside the shop (the next round makes it something to drive).
const RIVAL_LOOK = { ...C, h: '#1a1a1a', t: '#e8a030', s: '#e8b890', p: '#3a3a42' };
const LADY = { ...C, h: '#e8e8ee', t: '#7a5a8a', s: '#f0c49a', p: '#5a4a3a' };
function ladyCard() {
  const L = S.lady || {};
  if (L.stage === 'found') return openCard(`${h2(t('ladyName'))}<p>${t('ladyFound')}</p><div class="row">${btn('close', t('back'))}${btn('giveLocket', t('ladyGive'), true)}</div>`);
  if (L.stage === 'given' || L.stage === 'done') { say(t(L.stage === 'done' ? 'ladyDone' : 'ladyHere')); return; }
  openCard(`${h2(t('ladyName'))}<p>${L.asked ? t('ladyAgain') : t('ladyLost')}</p><div class="row">${btn('close', t('done'), true)}</div>`);
  S.lady = { ...L, stage: 'lost', asked: true }; save();
}
function giveLocket() {
  S.lady.stage = 'given'; deed('locket'); SFX.wow();
  openCard(`${h2(t('ladyName'))}<p>${t('ladyThanks')}</p><div class="row">${btn('close', t('done'), true)}</div>`);
  const v = MK.vendors.find(v => v.lady), h = MK.heap;
  v.route = path(v, { x: h.x - .6, y: h.y + 1.6 }) || [{ x: h.x - .6, y: h.y + 1.6 }];
}
function sweepHeap() {
  const h = MK.heap; if (h.done) return;
  if (--h.hits > 0) { SFX.rip(); return; }
  h.done = true; S.lady.stage = 'done'; save(); SFX.wow();
  openCard(`${h2(t('tankTitle2'))}<div class="pic wide"><img src="${picSrc(PIX.armor)}" alt=""></div><p>${t('tankFound')}</p>
    <div class="row">${btn('museum', t('tankMuseum', { n: TUNE.museum }))}${btn('keepArmor', t('tankKeep'), true)}</div>`, null, 'none');
}
function armorChoice(what) {
  S.armor = what; if (what === 'kept') S.ride = 'tank';
  if (what === 'sold') { S.pocket += TUNE.museum; SFX.ching(); }
  save(); showBar();
  openCard(`${h2(t('tankTitle2'))}<p>${what === 'sold' ? t('tankSold', { n: TUNE.museum }) : t('tankKept')}</p><div class="row">${btn('close', t('done'), true)}</div>`);
}
// ----- rides (his ask, 27 Nov) -----
// New shops start on foot: 3 things carried, one yard sale a day. A used bike
// leans on a lawn now and then; downtown, a beat-up truck comes up for sale.
// Your old ride is traded in. The tank, if you kept it, is the best of all.
// Shops from before this keep the car they had.
function rideCard() {
  const r = MK.rideSale; if (!r || r.sold) return;
  const trade = ride().trade, net = Math.max(0, r.price - trade);
  openCard(`${h2(t(`rideSale.${r.kind}.name`))}<div class="look"><div class="pic"><img src="${picSrc(PIX[r.kind])}" alt=""></div><div class="facts"><dl><dt>${t('ridePrice')}</dt><dd>$${r.price}</dd>${trade ? `<dt>${t('rideTrade', { ride: t(`rides.${S.ride}`) })}</dt><dd>−$${trade}</dd>` : ''}<dt>${t('ridePay')}</dt><dd>$${net}</dd></dl><p class="soft">${t('yourPocket', { n: S.pocket })}</p></div></div>
    <p class="note">${t(`rideSale.${r.kind}.line`)}</p><div class="row">${btn('close', t('leave'))}${btn('buyRide', t('rideBuy', { n: net }), true, S.pocket < net ? 'disabled' : '')}</div>`);
}
function buyRide() {
  const r = MK.rideSale, net = Math.max(0, r.price - ride().trade);
  if (!r || r.sold || S.pocket < net) return;
  S.pocket -= net; S.ride = r.kind; r.sold = true; save(); SFX.wow(); showBar();
  openCard(`${h2(t('rideGotTitle', { ride: t(`rides.${r.kind}`) }))}<p>${t('rideGot', { line: t(`rideGotLine.${r.kind}`) })}</p><div class="row">${btn('close', t('done'), true)}</div>`);
}
// your ride, parked where you arrived; on foot, a little sign home
function drawRide(x, y) {
  const big = (rows, k = 2) => { const img = spr(rows); cx.drawImage(img, Math.round(x), Math.round(y + 2 * T - img.height * k), img.width * k, img.height * k); };
  if (S.ride === 'foot') { px(x + 20, y + 6, 2, 22, '#5e3a1c'); px(x + 6, y, 32, 10, '#fff6e4'); text('HOME', x + 11, y + 2, '#2f7a4a'); return; }
  if (S.ride === 'bike') return big(PIX.bike);
  if (S.ride === 'truck') return big(PIX.truck, 3);
  if (S.ride === 'tank') return big(PIX.armor, 2);
  drawCar(x, y);
}
// ----- downtown (his ask, 27 Nov) -----
// Main Street: five lots along the top, the sidewalk, then the road. Two or
// three houses have a yard sale out; one lot is the rival's shop, where he
// sells what he's flipped at a markup (and now and then gets one wrong). A
// beat-up truck may be for sale at the curb.
const HOUSE_FINDS = () => shuffle(['mirror', 'mirror', ...TOYS, ...TOOLS, 'lantern', 'typewriter', 'iron', 'license', 'headlamp', 'radiometer', 'cart', ...rareMusket()]).slice(0, 3);
const RIVAL_STOCK = ['camera', 'robot', 'plane', 'sub', 'typewriter', 'mirror', 'hoodorn', 'tlr', 'train', 'computer', 'sharpener', 'bottle'];
function buildDowntown() {
  const M = { id: 'downtown', kind: 'downtown', w: 44, top: 2.8, bottom: 11.2, items: [], slots: [], vendors: [], solid: [], objs: [], cats: [], lots: [], bought: 0, start: { x: 3.5, y: 7.6 } };
  const kinds = shuffle(['rival', 'sale', 'sale', Math.random() < .5 ? 'sale' : 'house', 'house']);
  const colors = shuffle(['#e8dcc4', '#d8e4f0', '#f0d8e0', '#e0ecd0', '#f0e4c0']);
  kinds.forEach((kind, li) => {
    const x0 = 6 + li * 7.5, lot = { kind, x: x0, w: 7, color: colors[li] }; M.lots.push(lot);
    if (kind === 'house') return;
    const rival = kind === 'rival', vi = M.vendors.length;
    M.vendors.push({ x: rival ? x0 + 3.5 : x0 + 6, y: rival ? 3.3 : 4.9, look: rival ? RIVAL_LOOK : pick(LOOKS), rows: CUST, lines: rival ? 'sellers.rivalshop' : 'sellers.house', yes: rival ? .15 : .5, no: 'sellerNo', face: -1, walkT: 0, rival });
    const finds = rival ? shuffle(RIVAL_STOCK).slice(0, 4) : HOUSE_FINDS(), tw = rival ? 5 : 4.4, tx = x0 + (rival ? 1 : .8);
    M.solid.push({ x: tx, y: 3.6, w: tw, h: 1 });
    finds.forEach((k, j) => {
      let f = makeFind(k);
      if (rival) {
        // he flips real things, mostly; marked up, except now and then he's
        // tagged a real one as junk
        for (let n = 0; n < 4 && !f.good && Math.random() < .67; n++) f = makeFind(k);
        f.ask = f.good && Math.random() < TUNE.rivalMistake ? Math.max(5, round5((KINDS[k].dud || 4) * 2)) : round5(Math.max(f.value, KINDS[k].worth * .8) * randIn(TUNE.rivalMark));
      }
      const si = M.slots.length, x = tx + (j + .5) * tw / finds.length;
      M.items.push(f); M.slots.push({ x, y: 4.05, tagY: 4.6, vendor: vi });
      M.objs.push({ id: 'slot' + si, x: x - tw / finds.length / 2, y: 3.6, w: tw / finds.length, h: 1, stand: { x, y: 5.4 }, slot: si, act: 'actLook' });
    });
  });
  if (ride().rank < RIDES.truck.rank && Math.random() < TUNE.truckChance) {
    M.rideSale = { kind: 'truck', price: round5(randIn(TUNE.truckPrice)), x: 24, y: 8.4 };
    M.objs.push({ id: 'ridesale', x: 24, y: 7.8, w: 3, h: 1.8, stand: { x: 25.5, y: 7.6 }, act: 'actLook', only: () => !MK.rideSale.sold });
    M.solid.push({ x: 24.1, y: 8.4, w: 2.8, h: 1.2 });
  }
  M.objs.push({ id: 'car', x: 2, y: 7.8, w: 3, h: 2.4, stand: { x: 3.5, y: 7.6 }, act: 'actCar' });
  M.solid.push({ x: 2, y: 8.4, w: 3, h: 2 });
  return M;
}
function drawDowntown(now) {
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) put(j < 6 ? grassTile((i * 5 + j * 3) % 4) : j < 7 ? concTile((i + j) % 3) : asphaltTile((i * 7 + j * 5) % 4), i * T, j * T);
  for (let i = 0; i < W * T; i += 24) px(i + 4, 9 * T + 7, 12, 2, '#e8d070');
  px(0, 7 * T - 2, W * T, 2, '#9a968c');
  px(0, 0, 6 * T, 2.6 * T, '#c8c4ba'); text('MAIN ST', 1.2 * T, 1 * T, '#2a1a10');
  for (const l of MK.lots) {
    const x = l.x * T, w = l.w * T;
    if (l.kind === 'rival') {
      px(x, 0, w, 2.6 * T, '#3a3a42'); px(x, 0, w, 4, '#e8a030');
      px(x + 8, 12, w - 16, 18, '#a8d8f0'); px(x + 10, 14, 10, 2, '#e8f8ff');
      const sw = RDG.textWidth('FLIP CITY') + 8; px(x + w / 2 - sw / 2, 2, sw, 9, '#e8a030'); textC('FLIP CITY', x + w / 2, 4, '#1a1a1a');
    } else {
      px(x, 0, w, 2.6 * T, l.color); px(x, 0, w, 4, '#7a3e2a');
      for (let y = 6; y < 2.6 * T; y += 5) px(x, y, w, 1, 'rgba(0,0,0,.06)');
      px(x + 10, 14, 22, 16, '#ffffff'); px(x + 12, 16, 18, 12, '#86b8d8'); px(x + w - 30, 10, 16, 31, '#7a2a22');
    }
    if (l.kind === 'sale') { const sx = x + w - 20; px(sx + 8, 5.4 * T, 2, 10, '#5e3a1c'); px(sx, 5.4 * T - 8, 20, 10, '#ffd040'); text('SALE', sx + 2, 5.4 * T - 6, '#c84a3a'); }
    if (l.kind !== 'house') {
      const tx = (l.x + (l.kind === 'rival' ? 1 : .8)) * T, tw = (l.kind === 'rival' ? 5 : 4.4) * T;
      px(tx + 2, 4.6 * T, 2, 5, '#8a8a8a'); px(tx + tw - 4, 4.6 * T, 2, 5, '#8a8a8a');
      px(tx, 3.6 * T, tw, T, l.kind === 'rival' ? '#c99460' : '#f3ead8'); px(tx, 3.6 * T, tw, 2, '#ffffff');
    }
  }
  if (MK.rideSale && !MK.rideSale.sold) {
    const r = MK.rideSale, img = spr(PIX.truck); cx.drawImage(img, r.x * T, r.y * T - 4, img.width * 3, img.height * 3);
    px(r.x * T + 14, r.y * T - 14, 22, 9, '#fff6e4'); text('$' + r.price, r.x * T + 16, r.y * T - 12, '#c84a3a');
  }
  drawFinds(now);
  drawRide(2 * T, 8.2 * T);
}
// ----- good deeds (Randi, 27 Nov) -----
// Kindness that sometimes comes back and sometimes doesn't: a friendly
// customer later (`S.friends`), a tip, a letter, or nothing at all. There's no
// score; the ? help lists what he's done.
function deed(k, v = {}) { (S.deeds ||= []).push({ k, day: S.day, ...v }); save(); }
function deedsHtml() {
  const list = (S.deeds || []).slice(-10).reverse().map(d => `<li>${t('deedLine', { day: d.day, what: t(`deed.${d.k}`, d) })}</li>`).join('');
  return `<li><b>${t('deedsTitle')}</b>${list ? `<ul>${list}</ul>` : ` ${t('deedsNone')}`}</li>`;
}
// the honest seller: once a trip, tell a seller a find is worth more
function honest(slot) {
  const f = MK.items[slot]; if (!f || MK.told) return;
  MK.told = true; deed('honest');
  if (f.good && f.value >= 30) {
    if (Math.random() < TUNE.honestFriend) S.friends = (S.friends || 0) + 1;
    if (Math.random() < TUNE.honestKeep) { MK.items[slot] = null; save(); closeCard(); say(t('honestKeep')); say(t('honestGone')); return; }
    f.ask = Math.max(f.ask, round5(f.value * TUNE.honestFair)); f.reply = t('honestSell', { n: f.ask }).replace(/^“|”$/g, '');
  } else f.reply = t('honestDud').replace(/^“|”$/g, '');
  save(); lookCard(slot);
}
// the rival in trouble: help, and maybe he tips you off
function rivalHelpCard() {
  openCard(`${h2(t('rivalHelpTitle'))}<p>${t('rivalHelpText')}</p><div class="row">${btn('close', t('leave'))}${btn('helpRival', t('rivalHelp'), true)}</div>`);
}
function helpRival() {
  const r = MK.rival; deed('rival'); SFX.car();
  const roll = Math.random(), o = TUNE.rivalOdds;
  const line = roll < o.tip ? (S.tip = true, t('rivalTip')) : roll < o.tip + o.thanks ? t('rivalThanks') : t('rivalWhatever');
  save(); r.mode = 'leave'; r.route = [{ x: -2, y: r.y }];
  openCard(`${h2(t('rivalHelpTitle'))}<p>${line}</p><div class="row">${btn('close', t('done'), true)}</div>`);
}
// the donation box by the door
function donateCard() {
  const list = inBack().map(f => `<li><span><img src="${picSrc(rowsOf(f), colOf(f))}" alt=""> ${Name(f)}</span> ${btn('donate', t('donateBtn'), false, `data-uid="${f.uid}"`)}</li>`).join('');
  openCard(`${h2(t('donateTitle'))}<p>${t('donateText')}</p>${list ? `<ul class="store">${list}</ul>` : `<p class="soft">${t('donateNone')}</p>`}<div class="row">${btn('close', t('done'), true)}</div>`);
}
function donate(f) {
  if (!f) return;
  S.stock = S.stock.filter(x => x !== f); deed('donate', { item: nameOf(f) }); SFX.coin();
  say(t('donated', { item: nameOf(f) })); donateCard();
}
// a mailed album: a letter in a day or two, sometimes a little gift, sometimes nothing
function mailMorning() {
  const m = S.mail; if (!m || S.day <= m.day) return;
  S.mail = null; const r = Math.random(), o = TUNE.mailOdds;
  if (r < o.gift) { S.pocket += TUNE.mailGift; say(t('mailGift', { n: TUNE.mailGift })); SFX.ching(); }
  else if (r < o.gift + o.letter) say(t('mailLetter'));
  save();
}
// ----- the kid selling sporks (his idea, 27 Nov) -----
// Now and then a kid has a little table at a yard sale, selling sporks for a
// dollar. Ask him about them and he gives you his dad's old baseball card,
// which is worth a lot. Once a save: after that, his dad has found out.
function kidCard(said) {
  const v = MK.vendors.find(v => v.kid);
  openCard(`${h2(t('kidTitle'))}<div class="look"><div class="pic"><img src="${picSrc(PIX.spork)}" alt=""></div><div class="facts"><p id="sellerSays" role="status">${said || '“' + t('kidHello') + '”'}</p><p class="soft">${t('yourPocket', { n: S.pocket })}</p></div></div>
    <div class="row">${btn('close', t('leave'))}${btn('kidAsk', t('kidAsk'), false, v.asked ? 'disabled' : '')}${btn('kidBuy', t('kidBuy'), !v.asked, S.pocket < 1 ? 'disabled' : '')}</div>`);
}
function kidBuy() {
  if (S.pocket < 1) return;
  const f = makeFind('spork'); f.cost = 1; delete f.ask; S.pocket -= 1; S.stock.push(f); MK.bought++; save();
  SFX.coin(); showBar(); kidCard(`“${t('kidBought')}”`);
}
function kidAsk() {
  const v = MK.vendors.find(v => v.kid); v.asked = true;
  if (S.sporkCard) { kidCard(t('kidNoMore')); return; }
  const f = makeFind('card'); delete f.ask; f.cost = 0; S.stock.push(f); S.sporkCard = true; MK.bought++; save();
  SFX.wow(); say(t('kidGot'));
  kidCard(`${t('kidStory')}</p><div class="pic"><img src="${picSrc(PIX.card)}" alt=""></div><p>`);
}
// ----- the play corner (the oldest kid tester's ask) -----
// A working computer and up to four cartridges in the corner. While the shop
// is open, players come in now and then, play a while and pay $15. The
// computer and its cartridges aren't for sale while they're set up.
const cornerOn = () => S.corner.pc != null && S.corner.carts.length > 0;
function cornerCard() {
  const pc = byUid(S.corner.pc), carts = S.corner.carts.map(byUid).filter(Boolean);
  const row = (f, act, label) => `<button class="it" type="button" data-act="${act}" data-uid="${f.uid}"><img src="${picSrc(rowsOf(f), colOf(f))}" alt=""><span>${Name(f)}<small>${label}</small></span></button>`;
  const can = inBack().filter(f => f.kind === 'computer' ? !pc : f.kind === 'cart' && carts.length < TUNE.cornerCarts);
  openCard(`${h2(t('cornerTitle'))}<p>${t('cornerText', { n: TUNE.play })}</p>
    <p><b>${t('cornerPc')}</b></p>${pc ? `<div class="list">${row(pc, 'cornerOut', t('cornerTake'))}</div>` : `<p class="soft">${t('cornerNoPc')}</p>`}
    <p><b>${t('cornerCarts', { n: carts.length, max: TUNE.cornerCarts })}</b></p>${carts.length ? `<div class="list">${carts.map(f => row(f, 'cornerOut', t('cornerTake'))).join('')}</div>` : `<p class="soft">${t('cornerNoCarts')}</p>`}
    <p><b>${t('cornerAdd')}</b></p>${can.length ? `<div class="list">${can.map(f => row(f, 'cornerAdd', t('cornerSetUp'))).join('')}</div>` : `<p class="soft">${t('cornerNone')}</p>`}
    <div class="row">${btn('close', t('done'), true)}</div>`, '.it');
}
function cornerAdd(f) {
  if (!f) return;
  if (f.kind === 'computer') {
    // a dead one won't boot; now you know what it's worth, too
    if (!f.good) { f.seen = true; save(); SFX.no(); say(t('pcDead')); return cornerCard(); }
    f.seen = true; S.corner.pc = f.uid; SFX.flash(); say(t('pcOn', { item: nameOf(f) }));
  } else if (S.corner.carts.length < TUNE.cornerCarts) { S.corner.carts.push(f.uid); SFX.coin(); }
  const i = spotOf(f); if (i >= 0) S.spots[i] = null;
  save(); if (cornerOn()) say(t('cornerReady'));
  cornerCard();
}
function cornerOut(uid) {
  if (S.corner.pc === uid) S.corner.pc = null; else S.corner.carts = S.corner.carts.filter(u => u !== uid);
  save(); cornerCard();
}
// ----- the dump -----
// A dirt lot of junk piles. Use sweeps one with the broom: mostly junk, now
// and then a smashed tablet, sometimes a real find (free, so all profit),
// and once in a hundred, a fighter jet nobody noticed. Then the clock runs out.
function buildDump() {
  const M = { id: 'dump', kind: 'dump', w: 9 + TUNE.dumpRow * 2.4 | 0, top: 2, bottom: 11.2, items: [], slots: [], vendors: [], solid: [], objs: [], cats: [], bought: 0, start: { x: 3.5, y: 8.6 }, piles: [], dumpT: TUNE.dumpTime };
  M.vendors.push({ x: 4, y: 5.4, look: { ...C, h: '#e8a030', t: '#e8a030', s: '#c08860', p: '#3b4a6a' }, rows: CUST, lines: 'sellers.dump', yes: 0, no: 'sellerNo', face: 1, walkT: 0 });
  M.objs.push({ id: 'guy', x: 3.4, y: 4.4, w: 1.2, h: 1.2, stand: { x: 4, y: 6.4 }, vendor: 0, act: 'actSeller' });
  for (const y of [3.4, 6, 8.6]) for (let i = 0; i < TUNE.dumpRow; i++) {
    const x = 7 + i * 2.4, k = M.piles.length;
    M.piles.push({ x, y, swept: false, hits: TUNE.dumpHits, seed: k * 7 + 3 });
    M.solid.push({ x: x + .1, y: y + .2, w: 1.4, h: .7 });
    M.objs.push({ id: 'pile' + k, x, y, w: 1.6, h: 1, stand: { x: x + .8, y: y + 1.5 }, pile: k, act: 'actSweep' });
  }
  M.objs.push({ id: 'car', x: 2, y: 9, w: 3, h: 2, stand: { x: 3.5, y: 8.6 }, act: 'actCar' });
  M.solid.push({ x: 2, y: 9, w: 3, h: 2.2 });
  // the dump lady and her locket, until the tank is found
  const L = S.lady || {};
  if (L.stage !== 'done') {
    M.w += 4;
    M.vendors.push({ x: 5.6, y: 3.9, look: LADY, rows: CUST, lady: true, face: 1, walkT: 0, speed: 1.6 });
    M.objs.push({ id: 'lady', x: 5, y: 2.6, w: 1.2, h: 1.4, stand: { x: 5.6, y: 5 }, act: 'actLady', only: () => !MK.vendors.find(v => v.lady).route?.length });
    if (!L.stage || L.stage === 'lost') M.locket = Math.floor(Math.random() * M.piles.length);
    M.heap = { x: M.w - 5, y: 4.6, hits: TUNE.dumpHits * 2, done: false };
    M.solid.push({ x: M.heap.x + .1, y: M.heap.y + .3, w: 2.6, h: 1.6 });
    M.objs.push({ id: 'heap', x: M.heap.x, y: M.heap.y, w: 2.8, h: 2, stand: { x: M.heap.x + 1.4, y: M.heap.y + 2.6 }, act: 'actHeap', only: () => S.lady && S.lady.stage === 'given' });
  }
  return M;
}
function sweep(i) {
  const pl = MK.piles[i];
  if (MK.dumpT <= 0) { say(t('dumpOver')); return; }
  if (pl.swept) { say(t('swept')); return; }
  if (MK.bought >= ride().carry) { say(t('carryFull', { ride: t(`rides.${S.ride}`), n: ride().carry })); return; }
  // three sweeps of the broom to get to the bottom of a pile
  if (--pl.hits > 0) { SFX.rip(); return; }
  pl.swept = true; SFX.rip();
  if (MK.locket === i && (!S.lady || S.lady.stage !== 'given')) {
    S.lady = { ...(S.lady || {}), stage: 'found' }; MK.locket = null; save(); SFX.wow(); say(t('locketFound'));
    float(pl.x + .8, pl.y, '♥', '#d8a832'); return;
  }
  if (Math.random() < TUNE.musket) { const m = makeFind('musket'); delete m.ask; m.cost = 0; S.stock.push(m); MK.bought++; save(); SFX.wow(); say(t('dumpFound', { item: nameOf(m) })); return; }
  const r = Math.random(), o = TUNE.dumpOdds;
  if (r < o.jet) { say(t('dumpJet')); SFX.wow(); return; }
  if (r < o.jet + o.nothing) { say(t('dumpNothing')); return; }
  const f = makeFind(r < o.jet + o.nothing + o.tablet ? 'tablet' : pick(DUMP_FINDS));
  delete f.ask; f.cost = 0; S.stock.push(f); MK.bought++; save();
  if (f.kind === 'tablet') say(t('dumpTablet')); else { say(t('dumpFound', { item: nameOf(f) })); SFX.coin(); }
  float(pl.x + .8, pl.y, f.kind === 'tablet' ? '...' : '!', '#2f7a4a');
}
function stepDump(dt) {
  // the dump lady walking you to the big heap
  const v = MK.vendors.find(v => v.lady);
  if (v && v.route && v.route.length) { walk(v, dt, v.speed); if (!v.route.length) say(t('ladyHere')); }
  // no clock on the heap: once she's shown you, take your time
  if (S.lady && S.lady.stage === 'given') return;
  if (MK.dumpT <= 0) return;
  MK.dumpT -= dt;
  if (MK.dumpT <= 0) { say(t('dumpOver')); SFX.bell(); }
}
function lookCard(slot) {
  const f = MK.items[slot]; if (!f) return;
  const sl = MK.slots[slot], v = MK.vendors[sl.vendor];
  sl.line = sl.line || t(v.lines);
  let note = f.kind === 'box' ? `<p class="note">${t('sealedNote')}</p>` : f.hot ? `<p class="note">${t('hotNote')}</p>` : '';
  const w = MK.wish && !MK.wish.done && sl.vendor === MK.wish.vendor ? MK.wish : null, have = w && S.stock.find(x => x.kind === w.kind && !inCorner(x));
  if (w) note += `<p class="note">${t('wishNote', { item: t(`kinds.${w.kind}`) })}</p>`;
  if (S.bench && FIX[f.kind]) note += `<p class="soft">${t('benchLook', { h: hoursText(FIX[f.kind][0]), n: FIX[f.kind][1] })}</p>`;
  const cant = cantCarry(f); if (cant) note += `<p class="note">${cant}</p>`;
  const poor = S.pocket < f.ask || !!cant;
  const rough = S.guide && f.q ? `<dt>${t('condLbl')}</dt><dd>${STR.guideSays[f.q - 1]}</dd>` : '';
  openCard(`${h2(Name(f))}<div class="look">${picHtml(f)}<div class="facts"><dl><dt>${t('ask')}</dt><dd>$${f.ask}</dd>${rough}</dl><p class="soft">${t('yourPocket', { n: S.pocket })}</p></div></div>${note}
    <p id="sellerSays" class="soft" role="status">“${f.reply || (f.free ? t('giveaway') : sl.line)}”</p>
    <div class="row">${btn('close', t('leave'))}${canTell(f, sl) ? btn('honest', t('honestBtn'), false, `data-slot="${slot}"`) : ''}${have ? btn('wishGive', t('wishGive', { item: t(`kinds.${w.kind}`) }), false, `data-uid="${have.uid}"`) : ''}${f.free ? '' : btn('askLess', t('askLess'), false, `data-slot="${slot}" ${f.asked ? 'disabled' : ''}`)}${btn('buy', f.free ? t('takeFree') : t('buy', { n: f.ask }), true, `data-slot="${slot}" ${poor ? 'disabled' : ''}`)}</div>`);
}
// Ask for less: a timing bar instead of a coin flip (Randi, 26 Nov). One try per
// find. Where the green sits moves each time, so it can't be learned by heart.
let hg = null;
function askLess(slot) {
  const f = MK.items[slot], v = MK.vendors[MK.slots[slot].vendor]; f.asked = true;
  const g = TUNE.hgGreen[0] + (TUNE.hgGreen[1] - TUNE.hgGreen[0]) * v.yes, y = TUNE.hgYellow;
  const c = rand(g / 2 + y + .05, 1 - g / 2 - y - .05);
  hg = { slot, v, lo: c - g / 2, hi: c + g / 2, ylo: c - g / 2 - y, yhi: c + g / 2 + y, t0: performance.now(), at: 0,
    speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? TUNE.hgSlow : TUNE.hgSweep };
  const zone = (a, b, cls, label) => `<div class="hz ${cls}" style="left:${a * 100}%;width:${(b - a) * 100}%"><span>${label}</span></div>`;
  openCard(`${h2(Name(f))}<p>${t('hgText')}</p>
    <div class="haggle" aria-hidden="true">${zone(hg.ylo, hg.yhi, 'y', '')}${zone(hg.lo, hg.hi, 'g', t('hgBig'))}<div class="hm" id="hgMark"></div></div>
    <div class="row">${btn('hgStop', t('hgStop'), true)}</div>`, null, 'hgStop');
  requestAnimationFrame(hgFrame);
}
function hgFrame(now) {
  if (!hg) return;
  const u = ((now - hg.t0) / 1000 * hg.speed) % 2;
  hg.at = u < 1 ? u : 2 - u;
  const m = $('#hgMark'); if (!m) { hg = null; return; }
  m.style.left = `${hg.at * 100}%`;
  requestAnimationFrame(hgFrame);
}
function hgStop() {
  if (!hg) return;
  const h = hg; hg = null;
  const f = MK.items[h.slot], at = h.at;
  const cut = at >= h.lo && at <= h.hi ? TUNE.hgBig : at >= h.ylo && at <= h.yhi ? TUNE.hgSmall : 0;
  if (cut) { f.ask = Math.max(1, Math.round(f.ask * cut)); f.reply = t(h.v.shady ? 'shadyYes' : 'sellerYes', { n: f.ask }); SFX.coin(); }
  else { f.reply = t('hgMiss') + ' ' + t(h.v.no); SFX.no(); }
  lookCard(h.slot);
}
// telling is for ordinary sellers, once a trip, about ordinary finds
const canTell = (f, sl) => !MK.told && (MK.kind === 'yard' || MK.kind === 'downtown') && !f.free && !f.reply && !MK.vendors[sl.vendor].rival && !['box', 'junk', 'hairball', 'spork', 'album'].includes(f.kind);
const cantCarry = f => isBig(f) && !ride().big ? t('tooBig', { ride: t(`rides.${S.ride}`) }) : MK.bought >= ride().carry ? t('carryFull', { ride: t(`rides.${S.ride}`), n: ride().carry }) : '';
function buy(slot) {
  const f = MK.items[slot];
  if (cantCarry(f)) { say(cantCarry(f)); return; }
  if (S.pocket < f.ask) { say(t('tooPoor')); return; }
  S.pocket -= f.ask; f.cost = f.ask; delete f.ask; delete f.asked; delete f.reply;
  S.stock.push(f); MK.items[slot] = null; MK.bought++; save();
  closeCard(); SFX.coin(); say(t('bought', { item: nameOf(f), n: f.cost }));
  float(MK.slots[slot].x, MK.slots[slot].y - .6, `-$${f.cost}`, '#c84a3a');
  // somebody saw that, and the police are already on their way
  if (f.hot && MK.copT != null && !MK.cops) MK.copT = Math.min(MK.copT, TUNE.copsAfterBuy);
  showBar();
  if (MK.items.every(x => !x)) say(t('yardEmpty'));
}
function carCard() {
  const n = MK.bought;
  openCard(`${h2(t('carTitle'))}<p>${n ? t('carText', { n }) : t('carNone')}</p><div class="row">${btn('close', t('stay'))}${btn('drive', t(`rideHome.${S.ride}`), true)}</div>`);
}
let endAfterCops = false;
function backToShop() {
  const selling = !!(MK && MK.selling);
  if (selling) for (const c of custs) putBack(c);
  closeCard(); SFX.car(); enterShop(); P.x = 10; P.y = 10.4; showBar();
  if (selling) say(t('meetDone'));
  // driving off with stolen goods doesn't keep them: an officer is waiting
  const hot = S.stock.filter(f => f.hot);
  if (hot.length) { SFX.siren(); confiscate(hot, 'copsShopTitle', 'copsShop'); endAfterCops = selling; }
  else if (selling) endDay();
}
function enterShop() { queue.length = 0; scene = 'shop'; MK = null; custs = []; floats = []; P.route = null; layoutShop(); setWidth(tier().w); }
// stolen things go back to their owner, and what you paid for them is gone
function confiscate(list, title, words) {
  S.stock = S.stock.filter(f => !list.includes(f)); save();
  const n = list.reduce((a, f) => a + f.cost, 0), items = list.map(nameOf).join(', ');
  openCard(`${h2(t(title))}<p>${t(words, { items, n })}</p><div class="row">${btn('copsOk', t('copsOk'), true)}</div>`, null, 'copsOk');
}

// ----- the swap meet's police -----
// The DEALS stall sells stolen goods. Some time after you arrive, or a few
// seconds after you buy from it, the police pull up: its seller runs off the
// edge of the lot, the officers take the rest as evidence, and if you bought
// anything there, an officer walks over and takes that back too.
function stepMarket(dt) {
  for (const v of [...MK.vendors, ...(MK.cops ? MK.cops.officers : [])]) if (v.say) { v.say.t -= dt; if (v.say.t <= 0) v.say = null; }
  if (MK.kind !== 'swap') return;
  if (MK.wish && !MK.wish.done && (MK.wish.t -= dt) <= 0) { MK.wish.t = 7; MK.vendors[MK.wish.vendor].say = { text: t('wishShout', { item: t(`kinds.${MK.wish.kind}`) }), t: 2.6 }; }
  const sh = MK.stalls.find(s => s.sid === 'shady'); if (!sh) return;
  const thief = MK.vendors[sh.vendor];
  if (thief.run && !thief.gone) { thief.x += TUNE.thiefRun * dt; thief.walkT += dt; thief.face = 1; if (thief.x > W + 2) thief.gone = true; }
  if (!MK.cops) {
    MK.copT -= dt;
    if (MK.copT <= 0) {
      SFX.siren(); say(t('copsCome'));
      thief.run = true; thief.say = { text: t('thiefRun'), t: 2 };
      MK.cops = { car: { x: 5.2, y: 6.3 }, officers: [{ x: 6, y: 6.8, look: COP }, { x: 6.8, y: 7.2, look: COP }].map((o, i) => ({ ...o, face: 1, walkT: 0, to: { x: sh.sx + 1.4 + i * 1.3, y: 5.3 }, route: null })) };
    }
    return;
  }
  const cops = MK.cops;
  for (const o of cops.officers) {
    if (o.chase) {
      o.repath = (o.repath || 0) - dt;
      if (o.repath <= 0) { o.repath = .5; o.route = path(o, { x: P.x - .7, y: P.y }) || [{ x: P.x - .7, y: P.y }]; }
    } else if (!o.route) o.route = [o.to];
    walk(o, dt, TUNE.copWalk);
  }
  if (!cops.cleared && cops.officers.every(o => !o.route || !o.route.length)) {
    cops.cleared = true;
    cops.officers[0].say = { text: t('copsShout'), t: 2 };
    MK.slots.forEach((s, i) => { if (MK.items[i] && MK.items[i].hot) MK.items[i] = null; });
    const mine = S.stock.filter(f => f.hot);
    if (mine.length) { cops.officers[0].chase = true; cops.officers[0].route = null; }
    else say(t('copsStolen'));
  }
  const ch = cops.officers.find(o => o.chase);
  if (ch && dist(ch, P) < 1.3) {
    ch.chase = false; ch.route = []; ch.say = { text: t('copsShout'), t: 1.5 };
    confiscate(S.stock.filter(f => f.hot), 'copsTitle', 'copsTook');
  }
}

// ----- the desk -----
function rowHtml(f) {
  const w = known(f) ? `$${f.value}` : t('worthUnknown');
  return `<button class="it" type="button" data-act="find" data-uid="${f.uid}"><img src="${picSrc(rowsOf(f), colOf(f))}" alt=""><span>${Name(f)}<small>${t('paid')} $${f.cost} · ${t('worth')} ${w} · ${f.tag ? `${t('tag')} $${f.tag}` : t('noTag')}</small></span></button>`;
}
function deskCard() {
  cardFrom = 'desk'; cardSpot = null; cardFind = null;
  const list = inBack();
  const guide = S.guide ? `<p class="soft">${t('guideHave')}</p>` : `<p class="soft">${t('guideNote')}</p>`;
  openCard(`${h2(t('deskTitle'))}<p>${list.length ? t('deskText') : t('deskEmpty')}</p><div class="list">${list.map(rowHtml).join('')}</div>${guide}
    ${S.frogs && !S.tank ? `<p class="note">${t('frogsWait')}</p>` : ''}
    <div class="row">${S.guide ? '' : btn('guide', t('guideBuy', { n: TUNE.guide }), false, S.pocket < TUNE.guide ? 'disabled' : '')}${btn('store', t('storeBtn'))}${btn('close', t('done'), true)}</div>`, '.it');
}
function spotCard(i) {
  const o = SHOP.find(o => o.spot === i), f = byUid(S.spots[i]);
  if (f) return findCard(f, 'spot', i);
  cardFrom = 'spot'; cardSpot = i; cardFind = null;
  const list = inBack();
  openCard(`${h2(t(`spotTitle.${o.kind}`))}<p>${list.length ? t('spotEmpty') : t('spotNone')}</p><div class="list">${list.map(rowHtml).join('')}</div><div class="row">${btn('close', t('done'), !list.length)}</div>`, '.it');
}
// one find, close up: what you paid, what it's worth if you've snapped it,
// its price tag, and what you can do with it from here
function findCard(f, from, spot = null) {
  cardFind = f; cardFrom = from; cardSpot = spot;
  // the hotel box only opens; nobody would buy it taped shut
  if (f.kind === 'hotelbox') return openCard(`${h2(Name(f))}<div class="look">${picHtml(f)}<div class="facts"><dl><dt>${t('paid')}</dt><dd>$${f.cost}</dd></dl></div></div><p class="note">${t('hotelNote')}</p>
    <div class="row">${btn('desk', t('back'))}${from === 'desk' ? btn('openHotel', t('openHotel'), true) : ''}</div>`, null, 'desk');
  const onSpot = spotOf(f) >= 0, atDesk = from === 'desk';
  const worth = known(f) ? `$${f.value}` : t('worthUnknown');
  const cond = known(f) && f.q ? `<dt>${t('condLbl')}</dt><dd>${condText(f)}</dd>` : '';
  let note = '';
  if (f.kind === 'box' && !f.opened) note = t('sealedNote');
  else if (known(f) && f.kind !== 'box') note = STR.notes[f.kind][f.good ? 0 : 1];   // t() would pick one at random
  else if (!known(f)) note = t('unknownNote');
  if (f.kind === 'present' || f.kind === 'pills') note = STR.notes[f.kind][0];
  if (isBig(f)) note += ' ' + t('bigNote');
  if (atDesk && known(f) && !dealerPays(f) && f.kind !== 'pills') note += ' ' + t('tossNote');
  const acts = [];
  if (atDesk && f.kind === 'album') { note = STR.notes.album[0]; acts.push(btn('mailBack', t('mailBack', { n: TUNE.stamps }), true, S.pocket < TUNE.stamps ? 'disabled' : '')); }
  else if (atDesk && f.kind === 'present') acts.push(btn('unwrap', t('unwrap'), true));
  else if (atDesk && f.kind === 'pills') acts.push(btn('turnIn', t('turnIn'), true));
  else if (atDesk && !known(f)) acts.push(f.kind === 'box' ? btn('openBox', t('openBox')) : btn('snap', t('snap')));
  // the dealer's offer would give away what it's worth, so it shows once you know
  else if (atDesk && known(f)) acts.push(dealerPays(f) ? btn('quick', t('quick', { n: dealerPays(f) })) : btn('toss', t('toss')));
  if (atDesk && f.kind === 'ship' && !onSpot) acts.push(btn('keepShip', t('keepShip')));
  if (onSpot) acts.push(btn('takeBack', t('takeBack')));
  else acts.push(btn('putOut', from === 'spot' ? t('putHere') : t('putOut'), true, 'id="putBtn"'));
  openCard(`${h2(Name(f))}<div class="look">${picHtml(f)}<div class="facts"><dl><dt>${t('paid')}</dt><dd>$${f.cost}</dd><dt>${t('worth')}</dt><dd>${worth}</dd>${cond}</dl></div></div>
    ${note ? `<p class="note">${note}</p>` : ''}${atDesk && known(f) && dealerPays(f) ? `<p class="soft">${t('quickNote')}</p>` : ''}
    <div class="tag"><label for="tagIn">${t('tagLabel')}</label>${btn('less', t('less'))}<input id="tagIn" type="number" inputmode="numeric" min="0" step="1" value="${f.tag || ''}">${btn('more', t('more'))}</div>
    <p class="soft" id="putWhy" role="status"></p>
    <div class="row">${btn(from === 'spot' && !onSpot ? 'spotList' : 'desk', t('back'))}${acts.join('')}</div>`, coarse() ? null : '#tagIn', from === 'spot' && !onSpot ? 'spotList' : 'desk');
  if (from === 'spot' && onSpot) { const b = $('#card').querySelector('[data-act="desk"]'); b.dataset.act = 'close'; b.textContent = t('done'); escAct = 'close'; }
  refreshFindBtns(f);
}
// where a find would go from here: the spot picked, or the first free one; a
// battleship only fits in the glass case
const CASE = 3, isBig = f => !!(KINDS[f.kind] && KINDS[f.kind].big);
function targetSpot(f) {
  if (cardSpot != null) return isBig(f) && cardSpot !== CASE ? -1 : cardSpot;
  if (isBig(f)) return S.spots[CASE] == null ? CASE : -1;
  return S.spots.indexOf(null);
}
function refreshFindBtns(f) {
  const b = $('#putBtn'), why = $('#putWhy'); if (!b) return;
  const full = targetSpot(f) < 0;
  b.disabled = !f.tag || full;
  why.textContent = !f.tag ? t('needTag') : full ? t(isBig(f) ? (cardSpot != null ? 'bigNote' : 'bigNoRoom') : 'noRoom') : '';
}
// worth nothing (a plain hairball), the dealer won't take it at all
const dealerPays = f => worthTo(f) > 0 ? Math.max(1, Math.round(worthTo(f) * TUNE.dealer)) : 0;
function snap(f) { f.seen = true; save(); SFX.flash(); say(t('snapped', { n: f.value })); findCard(f, 'desk'); }
// Five things in every box (the oldest kid tester, 26 Nov). What you paid for
// the box is shared out over them, so the Rent Pool still gets it back.
function openBox(f) {
  S.stock = S.stock.filter(x => x !== f); SFX.rip();
  const got = [];
  for (let i = 0; i < 5; i++) {
    let r = Math.random(), row = BOX_LOOT[0];
    for (const x of BOX_LOOT) { if (r < x.p) { row = x; break; } r -= x.p; }
    got.push(pick(row.kinds));
  }
  const share = Math.floor(f.cost / 5);
  const out = got.map((k, i) => {
    if (k === 'mouse') { addMouse(); return null; }
    const n = makeFind(k); delete n.ask; n.cost = share + (i === 4 ? f.cost - share * 5 : 0); S.stock.push(n); return n;
  });
  save();
  const lines = out.map(n => n ? `<li><img src="${picSrc(rowsOf(n), colOf(n))}" alt="">${Name(n)}</li>` : `<li><img src="${picSrc(MOUSE)}" alt="">${t('boxMouse')}</li>`).join('');
  openCard(`${h2(t('boxFive'))}<p>${t('boxList')}</p><ul class="loot">${lines}</ul><div class="row">${btn('desk', t('done'), true)}</div>`, null, 'desk');
}
// a present is always an old toy
function unwrap(f) {
  const n = makeFind(pick(TOYS));
  Object.assign(f, { kind: n.kind, good: n.good, value: n.value, q: n.q, seen: false });
  save(); SFX.rip(); say(t('unwrapped', { item: nameOf(f) })); findCard(f, 'desk');
}
function putOut(f, i) {
  if (!f.tag || i < 0) return;
  if (f.kind === 'pills') return arrested(f);
  S.spots[i] = f.uid; save(); SFX.coin(); closeCard();
}
function quickSell(f) {
  S.stock = S.stock.filter(x => x !== f);
  const at = SHOP[0];
  sale(f, dealerPays(f), at.x + 1.5, at.y);
}

// Selling something illegal (his rule, 26 Nov): the police come, the shop
// closes for the day, and there's a fine, from the pocket and then the pool.
// His version had a man in a black coat who might shoot you; this is a kids'
// site, so the lesson is the arrest.
function arrested(f) {
  S.stock = S.stock.filter(x => x !== f);
  const fromPocket = Math.min(S.pocket, TUNE.fine); S.pocket -= fromPocket; S.pool = Math.max(0, S.pool - (TUNE.fine - fromPocket));
  save(); SFX.siren(); showBar();
  openCard(`${h2(t('arrestTitle'))}<p>${t('arrestText', { n: TUNE.fine })}</p><div class="row">${btn('jail', t('copsOk'), true)}</div>`, null, 'jail');
}
// ----- the ship case -----
function fleetCard() {
  const list = S.fleet.map(n => `<li><img src="${picSrc(PIX.ship, { ...C, ...SHIP_C[n] })}" alt="">${n} ${btn('fleetOut', t('fleetOut'), false, `data-name="${n}"`)}</li>`).join('');
  openCard(`${h2(t('fleetTitle'))}<p>${S.fleet.length ? t('fleetText') : t('fleetEmpty')}</p>${list ? `<ul class="loot">${list}</ul>` : ''}<div class="row">${btn('close', t('done'), true)}</div>`);
}

// out of the ship case (his ask, 27 Nov), back into stock to sell
function fleetOut(name) {
  S.fleet = S.fleet.filter(n => n !== name);
  const f = makeFind('ship'); f.ship = name; delete f.ask; f.cost = 0; f.seen = true; S.stock.push(f); save();
  say(t('fleetOutDone', { name })); fleetCard();
}
// ----- the rent board -----
function boardCard() {
  openCard(`${h2(t('boardTitle'))}<p>${t('boardText', { rent: S.rent, day: S.rentDay, pool: S.pool })}</p>${S.owed ? `<p>${t('boardOwed', { n: S.owed })}</p>` : ''}<p class="soft">${t('boardLord', { who: t(`lords.${S.landlord || 'kettle'}.name`) })}</p><p class="note">${t('boardSplit')}</p>
    <div class="row">${btn('moveList', t('boardMove'))}${btn('close', t('done'), true)}</div>`);
}
// Bigger shops and landlords (his asks, 27 Nov). Moving keeps everything you
// have; the lease starts over and the deposit is one week of the new rent.
function moveCard() {
  const rows = TUNE.tiers.map((tr, i) => {
    const n = i + 1, here = n === (S.tier || 1), locked = S.paidRents < tr.need, small = n < (S.tier || 1);
    if (small) return '';
    return `<li><span><b>${t(`shops.${n}.name`)}</b><br><small>${t(`shops.${n}.line`, { n: tr.spots })} ${locked ? t('moveNeed', { n: tr.need }) : here ? t('moveHere') : ''}</small></span> ${btn('lordList', t('moveLook'), false, `data-tier="${n}" ${locked ? 'disabled' : ''}`)}</li>`;
  }).join('');
  openCard(`${h2(t('moveTitle'))}<p>${t('moveText')}</p><ul class="store">${rows}</ul><div class="row">${btn('close', t('done'), true)}</div>`);
}
const lordRent = (n, id) => round5(TUNE.tiers[n - 1].rent * LORDS[id].mult);
function lordCard(n) {
  const rows = Object.keys(LORDS).map(id => {
    const L = LORDS[id], rent = lordRent(n, id), same = n === (S.tier || 1) && id === (S.landlord || 'kettle');
    return `<li><span><b>${t(`lords.${id}.name`)}</b> · ${t('lordRent', { n: rent })}<br><small>${t(`lords.${id}.line`, { late: L.late, up: L.up })}</small></span> ${btn('moveIn', same ? t('moveHere') : t('lordPick', { n: rent }), !same, `data-tier="${n}" data-lord="${id}" ${same || S.pocket < rent ? 'disabled' : ''}`)}</li>`;
  }).join('');
  openCard(`${h2(t('lordTitle'))}<p>${t('lordText', { shop: t(`shops.${n}.name`) })}</p><ul class="store">${rows}</ul><div class="row">${btn('moveList', t('back'), true)}</div>`, null, 'moveList');
}
function moveIn(n, id) {
  const rent = lordRent(n, id); if (S.pocket < rent) return;
  S.pocket -= rent; S.tier = n; S.landlord = id; S.rent = rent; S.rentN = 0; S.rentDay = S.day + TUNE.rentEvery; S.forgiven = false;
  save(); closeCard(); enterShop(); P.x = 10; P.y = 9.5; SFX.wow(); showBar();
  say(t('moved', { shop: t(`shops.${n}.name`), who: t(`lords.${id}.name`) }));
}

// ---------- The day ----------
function clockText(c = S.clock) {
  const mins = 9 * 60 + Math.floor(clamp(c / TUNE.dayLen, 0, 1) * 8 * 60 / 30) * 30, h = Math.floor(mins / 60), m = mins % 60;
  return `${(h - 1) % 12 + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
}
let daySales = [], dayPlays = { n: 0, cash: 0 };
function openShop() {
  closeCard(); S.phase = 'open'; S.clock = 0; spawnT = TUNE.firstCust;
  let r = Math.random(); S.mood = (TUNE.moods.find(([, p]) => (r -= p) < 0) || TUNE.moods[1])[0];
  S.lull = { at: randIn(TUNE.lullAt) * TUNE.dayLen, len: randIn(TUNE.lullLen), said: false };
  r = Math.random(); const nColl = (TUNE.collDays.find(([, p]) => (r -= p) < 0) || [0])[0];
  S.coll = Array.from({ length: nColl }, () => randIn(TUNE.collAt) * TUNE.dayLen).sort((a, b) => a - b); save();
  SFX.door(); say(t('openMsg')); if (t(`mood.${S.mood}`)) say(t(`mood.${S.mood}`)); showBar();
}
const moodGap = () => (TUNE.moods.find(m => m[0] === S.mood) || TUNE.moods[1])[2];
const inLull = () => S.lull && S.clock >= S.lull.at && S.clock < S.lull.at + S.lull.len;
function stepDay(dt) {
  if (S.phase !== 'open') return;
  S.clock += dt;
  if (S.clock <= TUNE.dayLen) benchTick(dt / TUNE.dayLen * 8);
  if (S.clock < TUNE.dayLen) {
    if (inLull()) { if (!S.lull.said) { S.lull.said = true; say(t('lull')); } }
    else { spawnT -= dt; if (spawnT <= 0) { spawnT = randIn(TUNE.custEvery) * tier().busy * moodGap() * (S.tank && S.frogs ? TUNE.frogMagnet : 1) * (S.armor === 'kept' ? TUNE.armorMagnet : 1); spawnCust(); } }
  } else if (!stepDay.closing) { stepDay.closing = true; say(t('closing')); }
  if (S.clock >= TUNE.dayLen && !custs.length) { stepDay.closing = false; endDay(); }
  if (Math.floor(S.clock) % 5 === 0 && Math.floor(S.clock) !== stepDay.saved) { stepDay.saved = Math.floor(S.clock); save(); }
}
function endDay() {
  S.phase = 'closed'; save(); SFX.bell();
  const list = (daySales.length ? `<p>${t('daySold')}</p><ul>${daySales.map(s => `<li>${Name(s.f)}: $${s.n}</li>`).join('')}</ul>` : `<p>${t('dayNone')}</p>`)
    + (dayPlays.n ? `<p>${t('dayPlays', dayPlays)}</p>` : '');
  const rentToday = S.day >= S.rentDay;
  openCard(`${h2(t('dayTitle', { n: S.day }))}${list}<p class="soft">${t('dayTotals', { pocket: S.pocket, pool: S.pool })}</p><div class="row">${rentToday ? btn('rent', t('rentTitle'), true) : btn('nextDay', t('nextDay'), true)}</div>`, null, 'none');
  daySales = []; dayPlays = { n: 0, cash: 0 };
}
function rentCard() {
  const due = S.rent + S.owed;
  const fromPool = Math.min(S.pool, due), fromPocket = Math.min(S.pocket, due - fromPool), short = due - fromPool - fromPocket;
  S.pool -= fromPool; S.pocket -= fromPocket;
  // Bea and Lou let one short week a lease go without a fee
  const kind = short && lord().forgive && !S.forgiven;
  if (kind) S.forgiven = true;
  S.owed = short ? short + (kind ? 0 : lord().late) : 0;
  if (!short) S.paidRents++;
  S.rentDay += TUNE.rentEvery; S.rentN = (S.rentN || 0) + 1;
  const newLease = S.rentN % TUNE.lease === 0;
  if (newLease) { S.rent += lord().up; S.forgiven = false; }
  save();
  if (short) SFX.no(); else SFX.ching();
  const paid = t('rentPaid', { rent: fromPool + fromPocket, fromPool, more: fromPocket ? t('rentMore', { n: fromPocket }) : '' });
  const won = !S.won && S.paidRents >= TUNE.winAfter;
  if (won) { S.won = true; save(); }
  openCard(`${h2(t('rentTitle'))}<p>${paid}</p>${short ? `<p>${kind ? t('forgiven') : lord().late ? t('rentShort', { n: short, fee: lord().late }) : t('rentShortNoFee', { n: short })}</p>` : ''}<p class="soft">${newLease ? t('leaseNew', { rent: S.rent }) + ' ' : ''}${t('rentNext', { rent: S.rent, day: S.rentDay })} ${newLease ? '' : t('leaseLeft', { n: TUNE.lease - S.rentN % TUNE.lease })}</p>
    ${won ? `<p class="note"><b>${t('wonTitle')}</b> ${t('wonText')}</p>` : ''}<div class="row">${btn('nextDay', t('nextDay'), true)}</div>`, null, 'none');
  if (won) SFX.wow();
  showBar();
}
function nextDay() {
  closeCard(); S.day++; S.phase = 'morning'; S.clock = 0; S.yardDone = false;
  const was = [...S.today].sort().join(); do S.today = pickToday(); while ([...S.today].sort().join() === was); save();
  P.x = 10; P.y = 9.5; say(t('morning', { n: S.day })); mailMorning(); showBar();
  if (S.catLove && !S.catLove.sent && S.day > S.catLove.day) {
    S.catLove.sent = true; S.pocket += TUNE.loveGift; save(); SFX.wow(); showBar();
    openCard(`${h2(t('loveTitle'))}<p class="note">${t('loveText', { title: S.catLove.title || t('loveTitleNone') })}</p><p>${t('loveGift', { n: TUNE.loveGift })}</p><div class="row">${btn('love', t('done'), true)}</div>`, null, 'love');
  }
}

// ---------- Customers ----------
// Each one walks in, looks at a find, and decides: the tag is fair, so they
// bring it to the register (and sometimes haggle anyway); the tag is a bit
// high, so they bring it and haggle; or it's far too high and they leave.
// They know what things are worth, give or take: a dud with a big tag sits.
// Buyers (Randi, 26 Nov): bargain hunters come all day and offer low;
// collectors pay fair or more. They came only late in the day at first, and
// the oldest kid tester learned to hold everything for the afternoon, so since
// 27 Nov a day has 0 to 3 of them at random times (`S.coll`, set when the shop
// opens) plus the odd one unplanned. Selling to the first offer or waiting for
// a collector is the choice, and waiting is a gamble.
// A collector wears a hat and glasses, so they can be told apart.
const COLLECTOR = { a: CUST.a.map((r, i) => i === 0 ? '.hhhhhhhh.' : i === 3 ? '..sbsbbs..' : r), b: CUST.b.map((r, i) => i === 0 ? '.hhhhhhhh.' : i === 3 ? '..sbsbbs..' : r) };
function spawnCust() {
  // a planned collector whose time has come, or now and then one out of the blue
  const due = S.coll && S.coll.length && S.clock >= S.coll[0];
  // the cat fan (26 Nov) comes once a hairball sculpture is out, until he's bought one
  const art = !S.catLove && S.spots.findIndex(u => { const f = byUid(u); return f && f.kind === 'hairball'; });
  const fan = art >= 0 && art !== false && Math.random() < TUNE.catFanChance && !custs.some(o => o.kind === 'catfan');
  // a player for the play corner, if it's set up and free
  if (!fan && cornerOn() && !custs.some(o => o.kind === 'gamer') && Math.random() < TUNE.gamer + TUNE.gamerPerCart * (S.corner.carts.length - 1)) {
    const g = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, look: { ...pick(LOOKS), h: pick(['#3b6ea8', '#c84a3a', '#2f7a4a']) }, kind: 'gamer', rows: KID, mode: 'in', t: 0, walkT: 0, face: 1, find: null, say: { text: t('gamerIn'), t: 2 } };
    g.route = path(g, SHOP.find(o => o.id === 'corner').stand, true);
    if (g.route) { custs.push(g); SFX.door(); }
    return;
  }
  // a kid after a toy they can't afford, now and then
  const toy = S.spots.findIndex(u => { const f = byUid(u); return f && [...TOYS, 'duck', 'plush', 'figure', 'train'].includes(f.kind) && f.tag > TUNE.kidHas && f.tag <= TUNE.kidMax; });
  if (!fan && toy >= 0 && Math.random() < TUNE.kidShop && !custs.some(o => o.kind === 'kidc')) {
    const k = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, look: pick(LOOKS), kind: 'kidc', rows: KID, mode: 'in', t: 0, walkT: 0, face: 1, find: null, spot: toy, say: { text: t('kidcIn'), t: 2 } };
    k.route = path(k, SHOP.find(o => o.spot === toy).stand, true);
    if (k.route) { custs.push(k); SFX.door(); }
    return;
  }
  // someone who heard about you, now and then, after a good deed
  if (!fan && S.friends > 0 && Math.random() < TUNE.friendChance) {
    S.friends--; save();
    const free = S.spots.map((u, i) => u != null && !custs.some(o => o.spot === i) ? i : -1).filter(i => i >= 0);
    if (free.length) {
      const fr = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, look: pick(LOOKS), kind: 'friend', rows: CUST, mode: 'in', t: 0, walkT: 0, face: 1, find: null, spot: pick(free), say: { text: t('friendIn'), t: 2.4 } };
      fr.route = path(fr, SHOP.find(o => o.spot === fr.spot).stand, true);
      if (fr.route) { custs.push(fr); SFX.door(); return; }
    }
  }
  // the rival, now and then, after anything you've priced far too low
  const cheap = S.spots.findIndex(u => { const f = byUid(u); return f && worthTo(f) >= 20 && f.tag < worthTo(f) * TUNE.rivalCheap; });
  if (!fan && cheap >= 0 && Math.random() < TUNE.rivalVisit && !custs.some(o => o.kind === 'rivalc')) {
    const r = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, look: RIVAL_LOOK, kind: 'rivalc', rows: CUST, mode: 'in', t: 0, walkT: 0, face: 1, find: null, spot: cheap, say: { text: t('rivalIn'), t: 2 } };
    r.route = path(r, SHOP.find(o => o.spot === cheap).stand, true);
    if (r.route) { custs.push(r); SFX.door(); }
    return;
  }
  const coll = !fan && (due || Math.random() < TUNE.collAny);
  if (coll && due) S.coll.shift();
  const kind = fan ? 'catfan' : coll ? 'collector' : Math.random() < .5 ? 'hunter' : 'regular';
  const look = kind === 'collector' ? { ...pick(LOOKS), h: '#2a2a30' } : kind === 'catfan' ? { ...C, h: '#a8a8a8', t: '#e05a9a', s: '#f0c49a', p: '#3b4a6a' } : pick(LOOKS);
  const c = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, look, kind, rows: kind === 'collector' ? COLLECTOR : CUST, mode: 'in', t: 0, walkT: 0, face: 1, route: null, find: null, say: null };
  if (kind === 'collector') c.say = { text: t('collectorIn'), t: 2 };
  if (kind === 'catfan') c.say = { text: t('catFanIn'), t: 2.4 };
  if (!c.say && S.tank && S.frogs && Math.random() < .3) c.say = { text: t('frogSeen'), t: 2 };
  if (!c.say && S.armor === 'kept' && Math.random() < .3) c.say = { text: t('tankOut'), t: 2 };
  const free = S.spots.map((u, i) => u != null && !custs.some(o => o.spot === i) ? i : -1).filter(i => i >= 0);
  if (kind === 'catfan' && free.includes(art)) { c.spot = art; c.route = path(c, SHOP.find(o => o.spot === art).stand, true); }
  else if (free.length) { c.spot = free[Math.floor(Math.random() * free.length)]; c.route = path(c, SHOP.find(o => o.spot === c.spot).stand, true); }
  else { c.spot = null; c.route = path(c, { x: 9 + Math.random() * 3, y: 7.6 }, true); }
  if (!c.route) return;
  custs.push(c); SFX.door();
}
// Does this buyer want it at its tag? Sets what they'll pay (`price`), their
// offer if they haggle, and the most they'd go to (`max`). The cat fan pays
// for any hairball sculpture: to him they're art.
function decide(c, f) {
  // the rival buys only what's priced far too low, at the tag, to flip
  // a kid always wants it, and has what they have
  if (c.kind === 'kidc') { c.price = f.tag; c.offer = null; c.max = TUNE.kidHas; return true; }
  // a friend pays fair, a little over, and doesn't haggle
  if (c.kind === 'friend') { const w = worthTo(f) * rand(1, 1.25); if (!worthTo(f) || f.tag > w) return false; c.price = c.max = f.tag; c.offer = null; return true; }
  if (c.kind === 'rivalc') { const ok = worthTo(f) >= 20 && f.tag < worthTo(f) * TUNE.rivalCheap; if (ok) { c.price = c.max = f.tag; c.offer = null; } return ok; }
  const base = c.kind === 'catfan' && f.kind === 'hairball' ? Math.max(worthTo(f), round5(randIn(TUNE.catFan))) : worthTo(f);
  const mint = f.q === 5;
  const would = base * randIn(c.kind === 'collector' ? (mint ? TUNE.collectorMint : TUNE.collector) : c.kind === 'catfan' ? [1, 1.1] : TUNE.pay);
  const stretch = mint ? TUNE.mintStretch : TUNE.stretch;
  if (c.kind === 'hunter') {
    // a bargain hunter always offers low, and goes no higher than this
    c.max = Math.max(1, Math.round(base * TUNE.hunterMax)); c.price = f.tag;
    c.offer = Math.max(1, round5(base * randIn(TUNE.hunter)));
    if (!base || c.offer >= f.tag) { c.offer = null; c.max = f.tag; }
    if (!base || f.tag > base * 2) return false;
  } else if (!base) return false;
  else if (f.tag <= would) {
    c.max = f.tag; c.price = f.tag;
    c.offer = c.kind === 'regular' && Math.random() < TUNE.haggleAnyway && f.tag >= 20 ? round5(f.tag * randIn(TUNE.offer)) : null;
  } else if (f.tag <= would * stretch) {
    c.max = Math.max(1, Math.round(would)); c.price = f.tag; c.offer = Math.max(1, round5(would * randIn(TUNE.offer)));
    if (c.offer >= f.tag) c.offer = null;
  } else return false;
  return true;
}
function bubble(c, text, s = 1.8) { c.say = { text, t: s }; }
function walk(c, dt, speed = c.speed || TUNE.cust) {
  if (!c.route || !c.route.length) return true;
  const n = c.route[0], l = dist(c, n), sp = speed * dt;
  if (l <= sp) { c.x = n.x; c.y = n.y; c.route.shift(); return !c.route.length; }
  c.x += (n.x - c.x) / l * sp; c.y += (n.y - c.y) / l * sp; c.walkT += dt;
  if (Math.abs(n.x - c.x) > .05) c.face = n.x > c.x ? 1 : -1;
  return false;
}
function leaveShop(c) {
  c.mode = 'out';
  if (scene !== 'shop') { c.route = [{ x: c.x, y: 6.4 }, { x: W + 1, y: 6.4 }]; return; }
  c.route = path(c, SHOP_DOOR, true) || [SHOP_DOOR];
}
function putBack(c) {
  // the find goes back where it was, if that spot's still free
  if (!c.find) return;
  if (scene !== 'shop') { MK.items[c.slot] = c.find; c.find = null; return; }
  if (S.spots[c.spot] == null) S.spots[c.spot] = c.find.uid;
  else { const i = S.spots.indexOf(null); if (i >= 0) S.spots[i] = c.find.uid; }
  c.find = null; save();
}
function stepCusts(dt) {
  for (const c of custs) {
    if (c.say) { c.say.t -= dt; if (c.say.t <= 0) c.say = null; }
    if ((c.mode === 'in' || c.mode === 'browse') && mice.some(m => dist(m, c) < 1.6)) { bubble(c, t('mouseScare')); leaveShop(c); continue; }
    if (c.kind === 'gamer') { stepGamer(c, dt); continue; }
    if (c.kind === 'bidder') { stepBidder(c, dt); continue; }
    if (c.mode === 'in') {
      if (walk(c, dt)) {
        if (c.spot == null || S.spots[c.spot] == null) { bubble(c, t('nothingHere')); leaveShop(c); continue; }
        c.mode = 'browse'; c.t = randIn(TUNE.browse); bubble(c, t('browse'), 1.2);
      }
    } else if (c.mode === 'browse') {
      c.t -= dt;
      if (c.t > 0) continue;
      const f = byUid(S.spots[c.spot]);
      if (!f) { leaveShop(c); continue; }
      if (!['catfan', 'collector', 'rivalc', 'kidc', 'friend'].includes(c.kind) && Math.random() < TUNE.justLook) { bubble(c, t('justLook')); leaveShop(c); continue; }
      if (!decide(c, f)) { bubble(c, t(c.kind === 'rivalc' ? 'rivalNothing' : 'tooPricey')); leaveShop(c); continue; }
      if (c.kind === 'catfan' && f.kind === 'hairball') bubble(c, t('catFanBuy'), 2.4);
      c.find = f; S.spots[c.spot] = null; save();
      c.mode = 'toReg'; c.joined = ++lineNo;
      c.route = path(c, linePlace(inLine().indexOf(c)), true);
    } else if (c.mode === 'toReg') {
      if (walk(c, dt)) {
        c.mode = 'wait'; c.t = TUNE.wait; bubble(c, t('wait')); SFX.bell();
        if (c.find.value > 0 && Math.random() < TUNE.bidChance && !custs.some(o => o.kind === 'bidder')) spawnBidder(c);
      }
    } else if (c.mode === 'wait') {
      // the line moves up when the one in front is done
      const at = linePlace(inLine().indexOf(c));
      if ((!c.route || !c.route.length) && dist(c, at) > .1) c.route = [at];
      walk(c, dt);
      c.t -= dt;
      if (c.t <= 0) { bubble(c, t('forget')); putBack(c); leaveShop(c); }
    } else if (c.mode === 'out') {
      if (walk(c, dt)) c.gone = true;
    }
  }
  custs = custs.filter(c => !c.gone);
}
// a player walks to the corner, plays a while, pays and goes. If the corner
// was taken apart while they walked over, they leave.
function stepGamer(c, dt) {
  if (c.mode === 'in') { if (walk(c, dt)) { if (!cornerOn()) { bubble(c, t('nothingHere')); leaveShop(c); } else { c.mode = 'play'; c.t = randIn(TUNE.playTime); c.face = -1; } } }
  else if (c.mode === 'play') {
    if (!cornerOn()) { leaveShop(c); return; }
    c.t -= dt; c.beat = (c.beat || 0) - dt;
    if (c.beat <= 0) { c.beat = rand(2.5, 4); bubble(c, t('gamerSays'), 1.4); tone(rand(500, 900), .06, 'square'); }
    if (c.t <= 0) {
      S.pocket += TUNE.play; dayPlays.n++; dayPlays.cash += TUNE.play; save(); SFX.ching(); showBar();
      const o = SHOP.find(o => o.id === 'corner'); float(o.x + 1.1, o.y, `+$${TUNE.play}`, '#2f7a4a');
      bubble(c, t('thanks')); leaveShop(c);
    }
  } else if (c.mode === 'out') { if (walk(c, dt)) c.gone = true; }
}
// Now and then a second buyer comes in after a find that's already waiting at
// the register, and offers more for it (27 Nov). Sell to them and the first
// buyer walks off cross; ring up the first and the second goes. Shop only.
function spawnBidder(c) {
  const b = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, kind: 'bidder', look: pick(LOOKS), rows: CUST, mode: 'bid', target: c, t: 0, walkT: 0, face: -1, find: null, say: null };
  b.route = path(b, { x: REG_FRONT.x + 1.4, y: REG_FRONT.y + .3 }, true);
  if (b.route) { custs.push(b); SFX.door(); }
}
function stepBidder(b, dt) {
  if (b.say) { b.say.t -= dt; if (b.say.t <= 0) b.say = null; }
  const c = b.target, still = c && c.mode === 'wait' && c.find && !c.gone;
  if (b.mode === 'bid') {
    if (!still) { bubble(b, t('bidAw')); leaveShop(b); return; }
    if (walk(b, dt)) {
      c.bid = round5(Math.max(c.price || 0, c.offer || 0, 5) * randIn(TUNE.bidUp)); c.bidder = b;
      b.mode = 'hover'; b.face = -1; bubble(b, t('bidSay', { n: c.bid }), 2.6); SFX.bell();
    }
  } else if (b.mode === 'hover') { if (!still) { if (!b.find) bubble(b, t('bidAw')); leaveShop(b); } }
  else if (b.mode === 'out') { if (walk(b, dt)) b.gone = true; }
}
function sellToBidder(c) {
  const b = c.bidder, f = c.find, n = c.bid;
  c.find = null; c.bid = null; bubble(c, t('bidCut')); leaveShop(c);
  b.find = f; sell(b, n);
}
// the line at the register: first come, first served, the next one behind
let lineNo = 0;
const inLine = () => custs.filter(c => c.mode === 'toReg' || c.mode === 'wait').sort((a, b) => a.joined - b.joined);
const linePlace = i => i ? { x: REG_FRONT.x - 1.3 * i, y: REG_FRONT.y + .2 } : REG_FRONT;
const firstWaiting = () => inLine().find(c => c.mode === 'wait');

// ----- the register -----
let regCust = null;
function regCard() {
  regCust = firstWaiting();
  const c = regCust;
  if (!c) { openCard(`${h2(t(scene === 'shop' ? 'regTitle' : 'actMyTable'))}<p>${t('regEmpty')}</p><div class="row">${btn('close', t('done'), true)}</div>`); return; }
  const f = c.find, item = nameOf(f), who = `<p><b>${t(`buyers.${c.kind}`)}</b></p>`;
  if (c.kind === 'kidc') return openCard(`${h2(t('regTitle'))}<div class="look">${picHtml(f)}<div class="facts">${who}<p>${t('kidcWants', { item, tag: f.tag, n: TUNE.kidHas })}</p></div></div><div class="row">${btn('noSale', t('kidcNo'))}${btn('kidSell', t('kidcSell', { n: TUNE.kidHas }), true)}</div>`, null, 'noSale');
  if (c.offer == null) {
    openCard(`${h2(t(scene === 'shop' ? 'regTitle' : 'actMyTable'))}<div class="look">${picHtml(f)}<div class="facts">${who}<p>${t('regPays', { item, tag: f.tag })}</p></div></div>${bidRow(c)}<div class="row">${btn('noSale', t('noSale'))}${c.bid ? btn('bidSell', t('bidSell', { n: c.bid })) : ''}${btn('ring', t('ringUp'), true)}</div>`, null, 'noSale');
  } else {
    const mid = round5((c.offer + f.tag) / 2);
    c.mid = mid > c.offer && mid < f.tag ? mid : null;
    openCard(`${h2(t(scene === 'shop' ? 'regTitle' : 'actMyTable'))}<div class="look">${picHtml(f)}<div class="facts">${who}<p>${t('regOffer', { item, tag: f.tag, offer: c.offer })}</p><dl><dt>${t('paid')}</dt><dd>$${f.cost}</dd><dt>${t('worth')}</dt><dd>${known(f) ? '$' + f.value : t('worthUnknown')}</dd></dl></div></div>
      ${bidRow(c)}<div class="row">${btn('noSale', t('noSale'))}${c.bid ? btn('bidSell', t('bidSell', { n: c.bid })) : ''}${c.mid && !c.countered ? btn('counter', t('counter', { n: c.mid })) : ''}${btn('offer', t('sellFor', { n: c.offer }), true)}</div>`, null, 'noSale');
  }
}
const bidRow = c => c.bid && c.bidder && !c.bidder.gone ? `<p class="note">${t('bidText', { n: c.bid })}</p>` : '';
function counter(c) {
  c.countered = true;
  if (c.mid <= c.max) { bubble(c, t('deal', { n: c.mid })); sell(c, c.mid); }
  else { SFX.no(); bubble(c, t('walkOff')); closeCard(); putBack(c); leaveShop(c); }
}
function noSale(c) { closeCard(); bubble(c, t(c.kind === 'kidc' ? 'kidcSad' : 'walkOff')); putBack(c); leaveShop(c); }
function sell(c, n) {
  const f = c.find; c.find = null;
  S.stock = S.stock.filter(x => x !== f);
  bubble(c, t(c.kind === 'rivalc' ? 'rivalSucker' : c.kind === 'kidc' ? 'kidcHappy' : 'thanks'), 2.4); leaveShop(c);
  // the cat fan and the artist: a letter comes the next morning
  if (c.kind === 'catfan' && f.kind === 'hairball' && !S.catLove) S.catLove = { title: f.title || '', day: S.day, sent: false };
  const r = scene === 'shop' ? SHOP.find(o => o.id === 'reg') : { x: c.x - 2.5, y: c.y - 1 };
  sale(f, n, r.x + 2.5, r.y);
}
// Every sale is split here, the card's rule: what you paid for the find goes
// into the Rent Pool, only the profit goes in your pocket. Sold for less than
// it cost, all of it goes to the pool, and the card says what was lost.
function sale(f, n, fx, fy) {
  const toPool = Math.min(f.cost, n), toPocket = n - toPool;
  S.pool += toPool; S.pocket += toPocket; save();
  daySales.push({ f, n });
  SFX.ching();
  if (toPocket) float(fx, fy - .4, `+$${toPocket}`, '#2f7a4a');
  if (toPool) float(fx, fy + .2, `+$${toPool}`, '#3b6ea8');
  const share = n ? Math.round(toPool / n * 100) : 0;
  const bar = n ? `<div class="split" aria-hidden="true">${toPool ? `<b class="p" style="flex:${Math.max(share, 18)}">${t('poolLbl', { n: toPool })}</b>` : ''}${toPocket ? `<b class="k" style="flex:${Math.max(100 - share, 18)}">${t('pocketLbl', { n: toPocket })}</b>` : ''}</div>` : '';
  const words = n < f.cost ? t('lossText', { loss: f.cost - n, n }) : t('splitText', { cost: toPool, profit: toPocket });
  openCard(`${h2(t('soldTitle'))}<p>${t('soldText', { item: nameOf(f), n })}</p>${bar}<p>${words}</p><div class="row">${btn('close', t('done'), true)}</div>`);
  showBar();
}

// ---------- The bar and help ----------
function showBar() {
  const on = mode === 'play';
  ['#dayPill', '#cashPill', '#poolPill', '#helpBtn'].forEach(id => $(id).hidden = !on);
  if (!on) return;
  $('#dayPill').textContent = scene !== 'shop' && MK && MK.kind === 'dump' ? t('dumpLeft', { s: Math.max(0, Math.ceil(MK.dumpT)) })
    : S.phase === 'open' ? t('dayClock', { n: S.day, clock: clockText() }) : t('day', { n: S.day });
  $('#cashPill').innerHTML = `<span class="long">${t('pocket', { n: S.pocket })}</span><span class="short">${t('pocketShort', { n: S.pocket })}</span>`;
  $('#poolPill').innerHTML = `<span class="long">${t('pool', { n: S.pool, rent: S.rent + S.owed })}</span><span class="short">${t('poolShort', { n: S.pool, rent: S.rent + S.owed })}</span>`;
}
function nextThing() {
  if (scene === 'yard' && MK.selling) return firstWaiting() ? MK.objs.find(o => o.mine) : MK.selling.t <= 0 ? MK.objs.find(o => o.id === 'car') : null;
  if (scene === 'yard' && MK.kind === 'dump') { const k = MK.piles.findIndex(p => !p.swept); return MK.objs.find(o => MK.dumpT > 0 && k >= 0 ? o.pile === k : o.id === 'car'); }
  if (scene === 'yard') { const i = MK.items.findIndex(Boolean); return MK.objs.find(o => i >= 0 ? o.slot === i : o.id === 'car'); }
  if (firstWaiting()) return SHOP.find(o => o.id === 'reg');
  if (S.phase === 'open') return null;
  const back = inBack();
  if (!S.yardDone && !back.length) return SHOP.find(o => o.id === 'door');
  if (back.some(f => !known(f) || !f.tag)) return SHOP[0];
  if (back.length && S.spots.includes(null)) return SHOP.find(o => o.spot === S.spots.indexOf(null));
  return SHOP.find(o => o.id === 'door');
}
function goalText() {
  if (scene === 'yard') return t(MK.selling ? 'goalMeet' : MK.kind === 'dump' ? 'goalDump' : MK.kind === 'downtown' ? 'goalDowntown' : 'goalYard');
  if (firstWaiting()) return t('goalRegister');
  if (S.phase === 'open') return t('goalOpen');
  const back = inBack();
  if (!S.yardDone && !back.length) return t('goalYardGo');
  if (back.some(f => !known(f) || !f.tag)) return t('goalDesk');
  if (back.length && S.spots.includes(null)) return t('goalTable');
  return t('goalOpenShop');
}
function toggleHelp(open = $('#help').hidden) {
  $('#help').hidden = !open; $('#helpBtn').setAttribute('aria-expanded', open);
  if (open) { $('#goalNow').textContent = goalText(); $('#helpList').innerHTML = STR.help.map(l => `<li>${l}</li>`).join('') + deedsHtml(); }
  else hintUntil = performance.now() + TUNE.hint;
}
$('#helpBtn').addEventListener('click', () => toggleHelp());
$('#helpClose').addEventListener('click', () => toggleHelp(false));
$('#soundBtn').addEventListener('click', () => { S.sound = !S.sound; save(); $('#soundBtn').textContent = S.sound ? '🔔' : '🔕'; });

// ---------- Drawing ----------
const FLOOR = { base: '#b07a48', dark: '#8a5a30', hi: '#c99460' };
function floorTile(v) {
  return RDG.tile('floor' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, FLOOR.base);
    for (const y of [0, 8]) { fill(0, y, T, 1, FLOOR.dark); fill(0, y + 1, T, 1, FLOOR.hi); }
    const j = (v * 5) % 16; fill(j, 1, 1, 7, FLOOR.dark); fill((j + 8) % 16, 9, 1, 7, FLOOR.dark);
    for (let i = 0; i < 4; i++) set(Math.floor(r() * T), 2 + Math.floor(r() * 12), FLOOR.dark);
  });
}
function grassTile(v) {
  return RDG.tile('grass' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, '#8fc25a');
    for (let i = 0; i < 6; i++) { const x = Math.floor(r() * 15), y = Math.floor(r() * 14) + 1; set(x, y, '#6fa244'); set(x + 1, y - 1, '#6fa244'); }
    for (let i = 0; i < 3; i++) set(Math.floor(r() * T), Math.floor(r() * T), '#b8e07a');
  });
}
function concTile(v) {
  return RDG.tile('conc' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, '#b8b4aa'); fill(0, 15, T, 1, '#9a968c'); fill(15, 0, 1, T, '#9a968c');
    for (let i = 0; i < 4; i++) set(Math.floor(r() * T), Math.floor(r() * T), '#a8a49a');
  });
}
function drawItemAt(f, x, y, now) {
  const img = itemImg(f);
  put(img, x - img.width / 2, y - img.height / 2);
  if (f.hot) { const tx = x + img.width / 2 - 2, ty = y - img.height / 2 - 2; px(tx, ty, 4, 3, '#ffffff'); px(tx + 1, ty + 1, 1, 1, '#e04848'); px(tx - 1, ty + 2, 1, 1, '#c8ccd4'); }
  if (glows(f)) {
    cx.globalAlpha = .3 + .25 * Math.sin(now / 380);
    put(RDG.sprite(GLOW, C, { line: GLOW_LINE }), x - img.width / 2, y - img.height / 2);
    cx.globalAlpha = 1;
  }
}
// price tags are drawn last, over anyone standing in front of a table
let tags = [];
function tagAt(n, x, y) { tags.push([n, x, y]); }
function drawTag(n, x, y) {
  const s = n ? '$' + n : 'FREE', w = RDG.textWidth(s) + 4;
  px(x - w / 2, y, w, 9, '#fff6e4'); px(x - w / 2, y + 8, w, 1, '#a88a60');
  text(s, x - w / 2 + 2, y + 2, '#2a1a10');
}
function drawShop(now) {
  for (let j = 2; j < 11; j++) for (let i = 1; i < W - 1; i++) put(floorTile((i * 7 + j * 3) % 4), i * T, j * T);
  // the back wall: wallpaper over dark wood, shelves of odds and ends
  px(0, 0, W * T, 22, '#e8d8b0');
  for (let i = 0; i < W * T; i += 8) px(i, 0, 2, 22, '#dcc89c');
  px(0, 22, W * T, 10, '#6b4426'); px(0, 22, W * T, 1, '#8a5a30'); px(0, 31, W * T, 1, '#3a2616');
  text('FLIP SHOP', 22, 6, '#2f7a4a', 1);
  px(20, 13, 38, 1, '#2f7a4a');
  // shelves at the right with jars and junk
  for (const sy of [8, 18]) { px(196, sy, 96, 2, '#6b4426'); }
  const JUNK = ['#5aa6e4', '#d8a832', '#c84a3a', '#7fbf68', '#e8e0d0', '#8a4ab0', '#e8a030', '#5e626c'];
  for (let i = 0; i < 12; i++) { const c = JUNK[i % JUNK.length], h = 3 + (i * 5) % 4; px(200 + i * 8, 8 - h, 5, h, c); px(203 + i * 7.5, 18 - 5, 4, 5, JUNK[(i + 3) % 8]); }
  // the rent board: cork with a paper notice
  px(8 * T, 2, 32, 26, '#5e3a1c'); px(8 * T + 2, 4, 28, 22, '#c49a5e');
  px(8 * T + 4, 6, 24, 18, '#fff6e4');
  textC('RENT', 8 * T + 16, 8, '#c84a3a'); textC('$' + (S.rent + S.owed), 8 * T + 16, 16, '#2a1a10');
  // side walls and the front wall with its windows and the door
  px(0, 32, T, H * T, '#4e2f1a'); px(W * T - T, 32, T, H * T, '#4e2f1a');
  px(0, 11 * T, W * T, T, '#4e2f1a');
  // the windows look grey and wet on a slow, rainy day
  const rain = S.phase === 'open' && S.mood === 'slow';
  for (const wx of [3, 13, 21, 29].filter(x => x + 4 < W)) {
    px(wx * T, 11 * T + 3, 4 * T, 10, rain ? '#8a98a4' : '#a8d8f0');
    if (rain) for (let k = 0; k < 6; k++) px(wx * T + 4 + k * 10, 11 * T + 4 + ((now / 40 + k * 5) % 8), 1, 2, '#d8e4ec'); px(wx * T + 6, 11 * T + 4, 10, 2, '#e8f8ff');
    px(wx * T, 11 * T + 3, 4 * T, 1, '#2a1a10');
  }
  if (S.armor === 'kept') { px(13 * T + 10, 11 * T + 6, 30, 6, '#4e5a3a'); px(13 * T + 18, 11 * T + 3, 12, 4, '#6a7a4a'); px(13 * T + 30, 11 * T + 4, 14, 2, '#4e5a3a'); px(13 * T + 10, 11 * T + 11, 30, 2, '#1a1a1a'); }
  const open = S.phase === 'open';
  px(4 * T + 6, 11 * T + 4, 32, 8, open ? '#2f7a4a' : '#7a2a22');
  textC(open ? 'OPEN' : 'CLOSED', 4 * T + 22, 11 * T + 5, '#fff');
  px(9 * T, 11 * T, 2 * T, T, '#3a2616'); px(9 * T + 2, 11 * T + 1, 2 * T - 4, T - 1, open ? '#c8ecff' : '#86a8c0');
  px(9 * T + 15, 11 * T + 1, 2, T - 1, '#3a2616');
  px(9 * T + 2, 10 * T + 12, 2 * T - 4, 4, '#7a2a22');
  // the desk and the bolted-down camera
  px(1 * T, 2 * T + 2, 3 * T, 2 * T - 4, '#6b4426'); px(1 * T, 2 * T + 2, 3 * T, 3, '#8a5a30'); px(1 * T, 4 * T - 4, 3 * T, 2, '#3a2616');
  px(1 * T + 6, 2 * T + 6, 14, 10, '#2a2a2a'); px(1 * T + 10, 2 * T + 9, 6, 5, '#5aa6e4'); px(1 * T + 11, 2 * T + 10, 2, 2, '#d7f1ff');
  px(1 * T + 12, 2 * T + 16, 2, 6, '#5e626c'); px(1 * T + 8, 2 * T + 21, 10, 2, '#5e626c');
  px(2 * T + 12, 2 * T + 8, 14, 10, '#f3ead8'); px(2 * T + 14, 2 * T + 10, 10, 1, '#a88a60'); px(2 * T + 14, 2 * T + 13, 8, 1, '#a88a60');
  const waiting = inBack().length;
  if (waiting) { px(3 * T + 4, 2 * T + 18, 8, 6, '#c49a5e'); px(3 * T + 4, 2 * T + 18, 8, 1, '#8a5a30'); }
  // the display spots
  for (const o of SHOP) {
    if (o.spot == null) continue;
    const x = o.x * T, y = o.y * T, w = o.w * T, h = o.h * T;
    if (o.kind === 'table') {
      px(x + 1, y + h - 2, 3, 6, '#4e2f1a'); px(x + w - 4, y + h - 2, 3, 6, '#4e2f1a');
      px(x, y, w, h, '#8a5a30'); px(x, y, w, 2, '#c99460'); px(x, y + h - 2, w, 2, '#5e3a1c');
    } else if (o.kind === 'case') {
      px(x, y - 2, w, h + 6, '#5e3a1c'); px(x + 2, y, w - 4, h, '#bfe4f4'); px(x + 4, y + 1, 10, 1, '#f0fbff');
    } else {
      px(x + 2, y - 4, w - 4, h + 4, '#c49a5e');
      for (let a = 0; a < h; a += 6) for (let b = 4; b < w - 4; b += 4) px(x + b, y + a, 1, 1, '#8a6a40');
      px(x + 2, y - 4, w - 4, 1, '#6b4426');
    }
    const f = byUid(S.spots[o.spot]);
    if (f) {
      drawItemAt(f, x + w / 2, y + h / 2 - (o.kind === 'rack' ? 4 : 2), now);
      tagAt(f.tag, x + w / 2, o.kind === 'rack' ? y + h - 6 : y + h + 3);
    }
  }
  // the donation box: a blue bin with GIVE on it
  { const d = SHOP.find(o => o.id === 'donate'), x = d.x * T, y = d.y * T; px(x, y, 16, 14, '#3b6ea8'); px(x, y, 16, 3, '#5aa6e4'); px(x + 3, y + 1, 10, 1, '#1a2a4a'); text('GIVE', x + 1, y + 6, '#ffffff'); }
  // the workbench: a wooden bench, a vise, a pegboard of tools
  if (S.bench) {
    const bn = SHOP.find(o => o.id === 'bench'), bx = bn.x * T, by = bn.y * T;
    px(bx, by + 2, bn.w * T, bn.h * T - 2, '#8a5a30'); px(bx, by + 2, bn.w * T, 2, '#c99460');
    px(bx + 2, by + bn.h * T, 3, 4, '#4e2f1a'); px(bx + bn.w * T - 5, by + bn.h * T, 3, 4, '#4e2f1a');
    px(bx + 4, by - 3, 8, 6, '#5e626c'); px(bx + 6, by - 5, 4, 2, '#80848e');
    px(bx + 18, by, 6, 2, '#c84a3a'); px(bx + 26, by + 1, 8, 1, '#a8acb4');
    (S.benchJobs || []).forEach((j, i) => { const f = byUid(j.uid); if (f) { const img = itemImg(f); put(img, bx + 6 + i * 11 - img.width / 4, by - img.height + 6); } });
  }
  // the frog tank: glass, water, gravel, a plant and five frogs hopping about
  if (S.tank) {
    const tk = SHOP.find(o => o.id === 'tank'), tx = tk.x * T, ty = tk.y * T, tw = tk.w * T, th = tk.h * T;
    px(tx, ty, tw, th, '#3a3a42'); px(tx + 2, ty + 2, tw - 4, th - 4, '#7ac0d8'); px(tx + 2, ty + th - 6, tw - 4, 4, '#c8b48a');
    px(tx + 6, ty + 5, 2, th - 10, '#4f8f46'); px(tx + 4, ty + 7, 2, 3, '#6fae4a'); px(tx + 8, ty + 9, 2, 3, '#6fae4a');
    px(tx + 3, ty + 3, 8, 1, '#d8f0f8');
    if (S.frogs) for (let i = 0; i < 5; i++) {
      const hop = Math.max(0, Math.sin(now / 300 + i * 1.7)) * 4, fx = tx + 11 + i * (tw - 20) / 4 + Math.sin(now / 900 + i * 2.3) * 2;
      put(spr(FROG, C, (i + Math.floor(now / 2300)) % 2 === 0), fx, ty + th - 11 - hop);
    }
  }
  // the play corner: a little desk, the computer and its cartridges
  const co = SHOP.find(o => o.id === 'corner'), kx = co.x * T, ky = co.y * T;
  px(kx, ky + 4, co.w * T, co.h * T - 4, '#5e3a1c'); px(kx, ky + 4, co.w * T, 2, '#8a5a30');
  px(kx + 2, ky + co.h * T, 3, 4, '#3a2616'); px(kx + co.w * T - 5, ky + co.h * T, 3, 4, '#3a2616');
  const pc = byUid(S.corner.pc);
  if (pc) {
    put(itemImg(pc), kx + 4, ky - 6);
    // someone playing: the screen flickers in game colours
    if (custs.some(c => c.kind === 'gamer' && c.mode === 'play')) { const g = ['#7fff7f', '#5aa6e4', '#ffd040', '#e04848'][Math.floor(now / 200) % 4]; px(kx + 7, ky - 4, 7, 2, g); px(kx + 10, ky - 2, 3, 1, g); }
  } else textC('GAMES', kx + co.w * T / 2, ky + 8, '#f3ead8');
  S.corner.carts.forEach((u, i) => { const f = byUid(u); if (f) put(itemImg(f), kx + 20 + (i % 2) * 6, ky + 6 + Math.floor(i / 2) * 6 - 6); });
  // the ship case, with the battleships you keep
  const fl = SHOP.find(o => o.id === 'fleet'), fx = fl.x * T, fy = fl.y * T, fw = fl.w * T, fh = fl.h * T;
  px(fx, fy - 2, fw, fh + 4, '#5e3a1c'); px(fx + 2, fy, fw - 4, fh, '#bfe4f4'); px(fx + 4, fy + 1, 8, 1, '#f0fbff');
  S.fleet.forEach((n, i) => { const img = spr(PIX.ship, { ...C, ...SHIP_C[n] }); put(img, fx + (fw - img.width) / 2 + (i % 2 ? 3 : -3), fy - 1 + i * 6); });
  // the register counter, with the Rent Pool jar
  const r = SHOP.find(o => o.id === 'reg'), rx = r.x * T, ry = r.y * T;
  px(rx, ry - 2, r.w * T, T + 2, '#6b4426'); px(rx, ry - 2, r.w * T, 3, '#8a5a30'); px(rx, ry + T - 2, r.w * T, 2, '#3a2616');
  px(rx + 34, ry - 6, 18, 12, '#5e626c'); px(rx + 36, ry - 4, 14, 4, '#2a2a2a'); text(String(Math.min(999, S.pocket)).slice(-3), rx + 37, ry - 4, '#7fff7f');
  px(rx + 8, ry - 7, 10, 11, '#bfe4f4'); px(rx + 8, ry - 7, 10, 1, '#5e626c');
  const fill = clamp(S.pool / Math.max(1, S.rent + S.owed), 0, 1);
  px(rx + 9, ry + 3 - Math.round(9 * fill), 8, Math.round(9 * fill), '#3b6ea8');
}
function drawYard(now) {
  for (let j = 3; j < 11; j++) for (let i = 0; i < W; i++) put(i >= 14 && i <= 17 ? concTile((i + j) % 3) : grassTile((i * 5 + j * 3) % 4), i * T, j * T);
  // the street and the sidewalk
  px(0, 10 * T + 8, W * T, 8, '#d8d4ca'); px(0, 11 * T, W * T, T, '#4a4a52');
  for (let i = 0; i < W * T; i += 24) px(i + 4, 11 * T + 7, 12, 2, '#e8d070');
  // the house: siding, a roof edge, windows and the door
  px(0, 0, W * T, 3 * T, MK.sale.house);
  for (let y = 4; y < 3 * T; y += 5) px(0, y, W * T, 1, MK.sale.siding);
  px(0, 0, W * T, 4, '#7a3e2a');
  for (const wx of [2, 6, 12]) { px(wx * T, 14, 32, 20, '#ffffff'); px(wx * T + 2, 16, 28, 16, '#86b8d8'); px(wx * T + 15, 16, 2, 16, '#ffffff'); }
  px(9 * T, 12, 28, 36, '#7a2a22'); px(9 * T + 22, 30, 3, 3, '#d8a832');
  px(14 * T, 8, 4 * T, 40, '#cfc2a6'); for (let y = 12; y < 48; y += 6) px(14 * T + 2, y, 4 * T - 4, 1, '#b4a68c');
  // bushes along the house
  for (const bx of [0.2, 4.6, 11, 18.2]) { px(bx * T, 2 * T + 6, 22, 12, '#4f8f3a'); px(bx * T + 3, 2 * T + 7, 10, 4, '#6fae4a'); }
  // the YARD SALE sign by the sidewalk
  px(17 * T + 6, 8 * T + 8, 2, 22, '#5e3a1c'); px(16 * T + 6, 8 * T, 38, 14, '#ffd040'); text('YARD', 16 * T + 9, 8 * T + 2, '#c84a3a'); text('SALE', 16 * T + 26, 8 * T + 7, '#c84a3a');
  // the folding tables
  for (const tx of [3, 8]) {
    px(tx * T + 2, 5.6 * T, 2, 6, '#8a8a8a'); px(tx * T + 4 * T - 4, 5.6 * T, 2, 6, '#8a8a8a');
    px(tx * T, 4.6 * T, 4 * T, T, '#f3ead8'); px(tx * T, 4.6 * T, 4 * T, 2, '#ffffff'); px(tx * T, 5.6 * T - 2, 4 * T, 2, '#b8b0a0');
  }
  drawFinds(now);
  for (const c of MK.cats) put(spr(CAT, c.c, c.x > 10), c.x * T - 5, c.y * T - 8);
  // the seller's card table and cash box
  px(15 * T, 6 * T, 2 * T, T - 4, '#3a3a42'); px(15 * T + 10, 6 * T + 2, 12, 7, '#2f7a4a'); px(15 * T + 12, 6 * T + 4, 8, 1, '#d8a832');
  // the kid's spork table, a cardboard sign and a cup of sporks
  if (MK.kid) {
    const x = MK.kid.x * T, y = MK.kid.y * T;
    px(x + 2, y + 8, 2, 5, '#8a5a30'); px(x + 22, y + 8, 2, 5, '#8a5a30'); px(x, y, 26, 9, '#c49a5e'); px(x, y, 26, 2, '#e0b880');
    px(x + 3, y - 4, 7, 6, '#e8e0d0'); for (let k = 0; k < 3; k++) px(x + 4 + k * 2, y - 7, 1, 4, '#d8784a');
    px(x + 13, y + 1, 12, 7, '#fff6e4'); text('$1', x + 15, y + 2, '#c84a3a');
  }
  if (MK.rideSale && !MK.rideSale.sold) { const img = spr(PIX.bike); cx.drawImage(img, 6 * T + 1, 7.1 * T, img.width * 2, img.height * 2); px(6 * T + 6, 7.1 * T - 9, 20, 8, '#fff6e4'); text('$' + MK.rideSale.price, 6 * T + 8, 7.1 * T - 8, '#c84a3a'); }
  drawRide(2 * T, 10 * T + 2);
}
function drawFinds(now) {
  MK.items.forEach((f, i) => {
    if (!f) return;
    const s = MK.slots[i];
    drawItemAt(f, s.x * T, s.y * T, now);
    tagAt(s.mine ? f.tag : f.ask, s.x * T, s.tagY * T + 2);
  });
}
// your car: a little red hatchback
function drawCar(carX, carY) {
  px(carX + 2, carY + 22, 8, 6, '#1a1a1a'); px(carX + 36, carY + 22, 8, 6, '#1a1a1a');
  px(carX, carY + 8, 3 * T, 16, '#c8382a'); px(carX + 8, carY, 26, 10, '#c8382a');
  px(carX + 11, carY + 2, 9, 7, '#a8d8f0'); px(carX + 22, carY + 2, 9, 7, '#a8d8f0');
  px(carX, carY + 14, 3 * T, 2, '#8a2218'); px(carX + 44, carY + 10, 3, 3, '#ffd040');
}
function asphaltTile(v) {
  return RDG.tile('asph' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, '#62626a');
    for (let i = 0; i < 9; i++) set(Math.floor(r() * T), Math.floor(r() * T), r() < .5 ? '#56565e' : '#707078');
  });
}
function drawSwap(now) {
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) put(asphaltTile((i * 7 + j * 5) % 4), i * T, j * T);
  // the chain-link fence along the top, with the banner
  px(0, 0, W * T, 2 * T, '#a8b0b8');
  for (let i = 0; i < W * T; i += 4) for (let j = (i / 4) % 2 ? 2 : 0; j < 2 * T; j += 4) px(i, j, 1, 1, '#7a828a');
  px(0, 2 * T - 2, W * T, 2, '#5a6068');
  const bx = (W / 2 - 4.5) * T;
  px(bx, 6, 9 * T, 14, '#e8a030'); px(bx, 6, 9 * T, 1, '#ffd070'); textC('OAKRIDGE SWAP MEET', bx + 4.5 * T, 10, '#2a1a10');
  // parking lines and the ticket booth by the entrance
  for (let i = 1; i < 7; i += 2) px(i * T, 6 * T, 1, 5 * T, '#e8e4da');
  px(2 * T, 2 * T, 3 * T, 2 * T, '#c8382a'); px(2 * T + 4, 2 * T + 4, 3 * T - 8, 12, '#a8d8f0'); px(2 * T, 2 * T, 3 * T, 3, '#8a2218');
  textC('TICKETS', 3.5 * T, 4 * T - 9, '#ffffff');
  // the stalls: a striped awning behind each seller, a sign, a table
  for (const s of MK.stalls) {
    const x = s.sx * T, w = 4 * T, ay = s.top ? 2 * T : 11 * T + 3;
    for (let i = 0; i < w; i += 6) px(x + i, ay, 3, 9, s.st.canopy), px(x + i + 3, ay, 3, 9, '#f3ead8');
    px(x, ay + 9, w, 1, '#2a1a10');
    const sw = RDG.textWidth(s.st.sign) + 6;
    px(x + w / 2 - sw / 2, ay + 1, sw, 7, '#fff6e4'); textC(s.st.sign, x + w / 2, ay + 2, s.sid === 'shady' ? '#c84a3a' : '#2a1a10');
    const ty = s.ty * T;
    px(x + 2, ty + T, 2, 4, '#5a5a5a'); px(x + w - 4, ty + T, 2, 4, '#5a5a5a');
    px(x, ty, w, T, '#f3ead8'); px(x, ty, w, 2, '#ffffff'); px(x, ty + T - 3, w, 3, s.st.canopy);
  }
  drawFinds(now);
  drawRide(2 * T, 9 * T + 2);
  // the police car, lights going
  if (MK.cops) {
    const c = MK.cops.car, x = c.x * T, y = c.y * T, on = Math.floor(now / 180) % 2;
    px(x + 2, y + 20, 8, 5, '#1a1a1a'); px(x + 38, y + 20, 8, 5, '#1a1a1a');
    px(x, y + 8, 48, 14, '#f3f3f3'); px(x + 10, y, 26, 10, '#1a1a1a'); px(x, y + 14, 48, 3, '#1a2a5a');
    px(x + 13, y + 2, 9, 6, '#a8d8f0'); px(x + 24, y + 2, 9, 6, '#a8d8f0');
    px(x + 16, y - 3, 7, 3, on ? '#ff3030' : '#801818'); px(x + 23, y - 3, 7, 3, on ? '#203080' : '#3060ff');
    text('POLICE', x + 13, y + 9, '#1a2a5a');
  }
}
// the dump: packed dirt, a chain-link fence, the gate shed, and the piles
function dirtTile(v) {
  return RDG.tile('dirt' + v, T, T, (set, fill, r) => {
    fill(0, 0, T, T, '#9a7a52');
    for (let i = 0; i < 10; i++) set(Math.floor(r() * T), Math.floor(r() * T), r() < .5 ? '#86683e' : '#ae8e64');
  });
}
const JUNK_C = ['#5e626c', '#7a7e88', '#3a3a42', '#8a5a30', '#6a4a2e', '#a8acb4', '#c84a3a', '#3b6ea8', '#4f8f46'];
function drawDump(now) {
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) put(dirtTile((i * 7 + j * 5) % 4), i * T, j * T);
  px(0, 0, W * T, 2 * T, '#a8b0b8');
  for (let i = 0; i < W * T; i += 4) for (let j = (i / 4) % 2 ? 2 : 0; j < 2 * T; j += 4) px(i, j, 1, 1, '#7a828a');
  px(0, 2 * T - 2, W * T, 2, '#5a6068');
  px((W / 2 - 4) * T, 6, 8 * T, 14, '#e8a030'); px((W / 2 - 4) * T, 6, 8 * T, 1, '#ffd070'); textC('OAKRIDGE DUMP', W / 2 * T, 10, '#2a1a10');
  // the gate shed
  px(2 * T, 2 * T, 3 * T, 2 * T, '#8a8a8a'); px(2 * T + 4, 2 * T + 4, 3 * T - 8, 12, '#a8d8f0'); px(2 * T, 2 * T, 3 * T, 3, '#5e626c');
  for (const p of MK.piles) {
    const x = p.x * T, y = p.y * T;
    if (p.swept) { px(x + 2, y + 10, 22, 5, '#86683e'); for (let k = 0; k < 4; k++) px(x + 4 + k * 5, y + 11, 3, 1, '#ae8e64'); continue; }
    // the pile gets lower with each sweep
    const top = (3 - p.hits) * 3;
    px(x + 2, y + 6 + top / 2, 22, 10 - top / 2, '#6a5a4a'); if (p.hits > 1) px(x + 6, y + 2 + top, 14, 6, '#6a5a4a'); if (p.hits > 2) px(x + 10, y, 6, 3, '#6a5a4a');
    for (let k = 0; k < 3 + p.hits * 2; k++) { const sd = (p.seed * 31 + k * 17) % 97; px(x + 3 + sd % 19, y + 2 + top + (sd * 7) % Math.max(4, 12 - top), 2 + sd % 3, 2, JUNK_C[(sd + k) % JUNK_C.length]); }
  }
  // the dump lady's shack, and the big heap (or the tank, once it's swept)
  if (MK.vendors.some(v => v.lady)) {
    px(4.4 * T, 2 * T, 2.6 * T, 1.3 * T, '#7a6a5a'); px(4.4 * T, 2 * T, 2.6 * T, 3, '#5e626c'); px(5.1 * T, 2.4 * T, 8, 9, '#3a2616');
    for (let k = 0; k < 3; k++) px(4.6 * T + k * 13, 2 * T + 4, 2, 2, ['#e05a9a', '#ffd040', '#5aa6e4'][k]);
  }
  if (MK.heap) {
    const h = MK.heap, x = h.x * T, y = h.y * T;
    if (h.done) put(spr(PIX.armor), x + 3, y + 10);
    else {
      const k = h.hits / (TUNE.dumpHits * 2);
      px(x, y + 30 - 26 * k, 44, 26 * k + 2, '#6a5a4a'); px(x + 8, y + 24 - 24 * k, 28, 8, '#6a5a4a');
      for (let j = 0; j < 14 * k; j++) px(x + 3 + (j * 13) % 38, y + 30 - 24 * k + (j * 7) % Math.max(4, 24 * k), 3, 2, JUNK_C[j % JUNK_C.length]);
      if (k < 1) put(spr(PIX.armor), x + 3, y + 10 + 12 * k), px(x, y + 30 - 26 * k, 44, 26 * k + 2, '#6a5a4a');
    }
  }
  drawRide(2 * T, 9 * T + 2);
}
function drawPerson(o, rows, colors, now) {
  const going = o === P ? P.moving : o.run || (o.route && o.route.length);
  const step = going && Math.floor(o.walkT * 8) % 2 ? rows.b : rows.a;
  const img = spr(step, colors, o.face < 0);
  put(img, o.x * T - img.width / 2, o.y * T - img.height + 1);
}
function corners(o, now) {
  if (Math.floor(now / 250) % 2) return;
  const x = o.x * T - 2, y = o.y * T - 2, w = o.w * T + 4, h = o.h * T + 4, c = '#ffffff';
  for (const [a, b, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    px(a - (sx < 0 ? 4 : 0), b - (sy < 0 ? 1 : 0), 4, 1, c); px(a - (sx < 0 ? 1 : 0), b - (sy < 0 ? 4 : 0), 1, 4, c);
  }
}
function bubbleAt(s, x, y) {
  const w = RDG.textWidth(s) + 6;
  const bx = clamp(Math.round(x - w / 2), Math.round(camX * T) + 1, Math.round((camX + VW) * T) - w - 1), by = Math.max(1, Math.round(y - 11));
  px(bx, by, w, 10, '#ffffff'); px(bx, by + 9, w, 1, '#2a1a10'); text(s, bx + 3, by + 3, '#2a1a10');
}
function draw(now) {
  cx.clearRect(0, 0, lo.width, lo.height);
  tags = [];
  if (scene === 'shop') drawShop(now); else if (MK.kind === 'swap') drawSwap(now); else if (MK.kind === 'dump') drawDump(now); else if (MK.kind === 'downtown') drawDowntown(now); else drawYard(now);
  // people, drawn top to bottom so nearer ones stand in front
  const people = [{ o: P, rows: KEEPER, col: C }, ...custs.map(c => ({ o: c, rows: c.rows || CUST, col: c.look }))];
  if (scene === 'yard') {
    MK.vendors.forEach(v => { if (!v.gone) people.push({ o: v, rows: v.rows, col: v.look }); });
    if (MK.cops) MK.cops.officers.forEach(o => people.push({ o, rows: OFFICER, col: COP }));
    if (MK.rival && !MK.rival.gone) people.push({ o: MK.rival, rows: MK.rival.rows, col: MK.rival.look });
  }
  people.sort((a, b) => a.o.y - b.o.y);
  if (scene === 'shop') for (const m of mice) { const img = spr(MOUSE, C, m.face < 0); put(img, m.x * T - img.width / 2, m.y * T - img.height); }
  for (const p of people) {
    drawPerson(p.o, p.rows, p.col, now);
    if (p.o.find) drawItemAt(p.o.find, p.o.x * T + 7, p.o.y * T - 8, now);
  }
  // a $ over anyone waiting to pay, so the line can be seen across the room
  for (const g of tags) drawTag(...g);
  for (const c of custs) if (c.say) bubbleAt(c.say.text, c.x * T, c.y * T - 15); else if (c.mode === 'wait') bubbleAt('$', c.x * T, c.y * T - 15);
  if (scene === 'yard') for (const v of [...MK.vendors, ...(MK.cops ? MK.cops.officers : []), ...(MK.rival ? [MK.rival] : [])]) if (v.say && !v.gone) bubbleAt(v.say.text, v.x * T, v.y * T - 15);
  // the next thing blinks while the ? help is open and for a few seconds after
  if (mode === 'play' && (!$('#help').hidden || now < hintUntil)) { const o = nextThing(); if (o) corners(o, now); }
  for (const f of floats) { cx.globalAlpha = clamp(f.t, 0, 1); textC(f.text, f.x * T, (f.y - (1.6 - f.t) * .8) * T, f.color, 1); cx.globalAlpha = 1; }
  // the view follows the shopkeeper when it's narrower than the room
  const want = clamp(P.x - VW / 2, 0, W - VW);
  camX = Math.abs(want - camX) > 4 ? want : camX + (want - camX) * .15;
  out.imageSmoothingEnabled = false;
  out.drawImage(lo, Math.round(camX * T), 0, VW * T, H * T, 0, 0, cv.width, cv.height);
}

// ---------- Start ----------
function startPlay() {
  closeCard(); mode = 'play';
  // a reload in the middle of an open day picks the day back up
  if (S.phase === 'closed') S.phase = 'open';
  save();
  $('#ctrl').hidden = false; showBar(); resize();
  if (!S.seenHelp) { S.seenHelp = true; save(); toggleHelp(true); }
  else say(S.phase === 'open' ? t('openMsg') : t('morning', { n: S.day }));
}
function step(dt, now) {
  if (mode !== 'play') return;
  stepKeeper(dt);
  if (scene === 'shop') { stepDay(dt); stepCusts(dt); stepMice(dt); }
  else { stepMarket(dt); if (MK.rival) stepRival(dt); if (MK.selling) stepMeet(dt); if (MK.kind === 'dump') stepDump(dt); }
  for (const f of floats) f.t -= dt;
  floats = floats.filter(f => f.t > 0);
  const a = t(actionNow()); if ($('#actBtn').textContent !== a) $('#actBtn').textContent = a;
  if (!$('#help').hidden) { const g = goalText(); if ($('#goalNow').textContent !== g) $('#goalNow').textContent = g; }
  if (Math.floor(now / 500) !== step.last) { step.last = Math.floor(now / 500); showBar(); }
}
// the page's own words come from STR too
document.querySelectorAll('[data-s-label]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.sLabel)); e.title = t(e.dataset.sLabel); });
$('#soundBtn').textContent = S.sound ? '🔔' : '🔕';
resize(); titleCard();
let last = performance.now();
function frame(now) {
  // asked for first, so one bad frame can't stop the game (Mission Directive, 16 Nov)
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  try { if ($('#cover').hidden) step(dt, now); draw(now); stepMsg(now); } catch (e) { console.error(e); }
}
requestAnimationFrame(frame);
