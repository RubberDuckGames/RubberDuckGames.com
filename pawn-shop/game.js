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
  play: 'Play', startOver: 'Start over', cancel: 'Cancel', close: 'Close', done: 'Done', back: 'Back', keepPlaying: 'Keep playing',
  startOverAsk: 'Start over? Your money, your finds and the day go back to the start.',
  shop: 'The shop', stick: 'Walking stick', helpBtn: 'How to play', closeHelp: 'Close help', soundBtn: 'Sounds on or off',
  help: [
    '<b>Walk:</b> arrow keys, WASD, the stick, or tap where to go.',
    '<b>Buying:</b> each morning the front door has two yard sales and the swap meet to pick from. Judge each find by eye: look for the tells.',
    '<b>Use:</b> Space or the Use button, next to a table, the desk, the register or the door. Or tap the thing itself.',
    '<b>The desk:</b> the camera there shows what a find is really worth. Set its price tag, then put it out on a table.',
    '<b>Quick sell:</b> the dealer buys it at the desk right away, for less than it\'s worth.',
    '<b>Every sale:</b> what you paid goes into the Rent Pool. Only the profit goes in your pocket.',
    '<b>Buyers:</b> bargain hunters come early and offer low. Collectors pay fair, but they only turn up late in the day.',
    '<b>Condition:</b> every find is 1 to 5, broken to mint. Scuffs mean a worn one, a white twinkle a mint one. The camera says exactly; the field guide (at the desk) says roughly before you buy.',
    '<b>Mystery boxes:</b> five things inside. Anything illegal goes to the police: selling it gets you arrested.',
    '<b>Battleships:</b> three big models are out there. Keep one in the ship case and it\'s yours for good; sell it and it may turn up again.',
    '<b>Help:</b> H or ?. A controller works too.',
  ],
  // the action button, by what's in reach
  use: 'Use', actDesk: 'Desk', actTable: 'Table', actRack: 'Rack', actCase: 'Case', actRegister: 'Register', actDoor: 'Door', actBoard: 'Rent', actLook: 'Look', actCar: 'Car', actSeller: 'Talk',
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
  },
  // what each seller says when you talk to them
  sellers: {
    garage: ['Everything must go!', 'Cleaning out the garage.', 'Grandpa kept everything.', 'Ask if you want a deal.'],
    toys: ['My kids grew up. Everything goes!', 'Toys! Lots of toys!', 'Some of these are older than me.'],
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
    shady: ['No questions, okay?', 'Brand new. Don\'t ask where from.', 'Cash only. Quick, quick.'],
  },
  fee: 'You paid ${n} to get in.', tooPoorFee: 'You need ${n} to get into the swap meet.',
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
  buyers: { hunter: 'A bargain hunter', regular: 'A shopper', collector: 'A collector' },
  hunterSays: ['I\'ll give you ${n}. Cash.', 'How about ${n}? It\'s a bit worn.'],
  collectorIn: ['Am I too late?', 'Just made it!', 'Still open? Great.'],
  ask: 'Asking', yourPocket: 'You have ${n}.', buy: 'Buy ${n}', leave: 'Leave it', askLess: 'Ask for less',
  sellerYes: ['Oh, fine. ${n}.', 'For you? ${n}.', 'Sure, ${n}. It\'s just taking up space.'],
  sellerNo: ['Sorry, that price is firm.', 'Nope, that\'s a fair price.', 'I could get more on the internet!'],
  bought: 'Bought the {item} for ${n}.', tooPoor: 'Not enough money in your pocket.',
  sealedNote: 'Sealed tight. No peeking. Could be junk, could be treasure.',
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
    tlr: 'twin-lens camera', boxcam: '1920s box camera', folding: '1930s folding camera', enlarger: 'photo enlarger',
    truck: 'moving truck toy', plane: 'tin airliner', biplane: 'tin biplane', ship: 'model battleship',
    canteen: 'army surplus canteen', comics: 'comic book', book: 'old book', plush: 'stuffed bear', present: 'wrapped present',
    milk: 'carton of expired milk', lint: 'ball of lint', pills: 'suspicious bottle',
  },
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
  keepShip: 'Keep it in the ship case', keptShip: 'The {name} goes in the ship case. It\'s yours for good.',
  fleetTitle: 'The ship case', fleetText: 'Your battleships, kept for good.', fleetEmpty: 'Empty. Three model battleships are out there somewhere: the Missouri, the Bismarck and the Yamato.',
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
    lantern: ['The glass is whole. It still lights.', 'The glass is cracked, so it won\'t hold a flame.'],
    robot: ['A real 1950s tin wind-up robot. See the key on its side? It shines.', 'A plastic copy. No wind-up key, and no shine.'],
    tincar: ['A 1950s tin car with chrome bumpers. The chipped paint shows its age.', 'A plastic copy, painted all one colour. No chrome bumpers.'],
    figure: ['A real 80s figure, still sealed on its card.', 'A knockoff. The colours are all wrong.'],
    junk: ['Cheap plastic toys. Nobody collects these.', 'Cheap plastic toys. Nobody collects these.'],
    hairball: ['It\'s shaped exactly like a duck. Somebody out there wants this.', 'It\'s a hairball. It\'s just a hairball.'],
    insulator: ['An old glass insulator off a telegraph pole. See the tiny bubbles? Old glass has them.', 'A new glass copy. Clear and perfect, so it\'s no older than you.'],
    typewriter: ['A 1940s typewriter: black steel, round glass keys, gold letters.', 'An 80s plastic typewriter. Square keys, beige, and heavy for nothing.'],
    iron: ['A real cast-iron flat iron. People heated these on the stove. See the rust?', 'A painted copy. Shiny black, no rust, never been near a stove.'],
    duck: ['A vintage squeaky duck. The paint has faded the way only old toys do.', 'A new rubber duck. Cute, but there are millions of them.'],
    sharpener: ['Cast iron with a brass band. Schools bolted these to the wall for years.', 'A plastic copy. Light as anything, and no brass band.'],
    train: ['Still in its window box. The box is half of what collectors pay for.', 'A loose engine, no box, and a wheel missing.'],
    bottle: ['Pressed black glass that shines in the light. It used to hold aftershave.', 'Painted plastic. No shine at all.'],
    sub: ['Tin, with its wind-up key on the side. It dives in the bathtub.', 'A plastic copy. No key, so it doesn\'t go.'],
    tlr: ['A twin-lens camera: you look down into the top lens and shoot through the bottom one.', 'The top lens is cracked, so you can\'t see what you\'re shooting.'],
    boxcam: ['A 1920s box camera: card covered in black leather, a metal front. Point, click, hope.', 'A plastic toy made to look old. No metal front.'],
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
};
// Condition (the oldest kid tester's rule, 26 Nov): a hidden 1 to 5 on every
// find. 1 is worth a quarter and never more than $10, 2 half, 3 its value, 4 at
// least $80, 5 at least $150. The 4 and 5 multipliers are ours. Duds have a
// condition too, but it doesn't save them.
const QUAL = { odds: [.15, .25, .3, .2, .1], mult: [.25, .5, 1, 1.25, 1.5], floor: [0, 0, 0, 80, 150], cap: [10, 1e9, 1e9, 1e9, 1e9] };
const NO_Q = new Set(['box', 'hairball', 'present', 'milk', 'lint', 'pills', 'junk']);
const TOYS = ['robot', 'tincar', 'figure', 'sub', 'truck', 'plane', 'biplane'];
// Five things in every mystery box (his list, 26 Nov). The odds are ours.
const BOX_LOOT = [
  { p: .2, kinds: TOYS }, { p: .15, kinds: ['shovel', 'grinder', 'iron', 'sharpener'] }, { p: .1, kinds: ['canteen'] },
  { p: .1, kinds: ['comics'] }, { p: .08, kinds: ['book'] }, { p: .08, kinds: ['plush'] }, { p: .06, kinds: ['present'] },
  { p: .07, kinds: ['milk'] }, { p: .08, kinds: ['lint'] }, { p: .06, kinds: ['mouse'] }, { p: .02, kinds: ['pills'] },
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
  sellerYes: .5, sellerCut: .75,
  shadyChance: .6, shadyCut: [.08, .15], copsAfter: [25, 45], copsAfterBuy: 6, copWalk: 3.2, thiefRun: 7,
  // buyers: bargain hunters offer this share of what it's worth; collectors come after this share of the day
  hunter: [.45, .6], hunterMax: .7, lateFrom: .7, collector: [1, 1.3],
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
// One shop per device, under `pawn-shop`. A find is { uid, kind, good, value,
// cost, seen, tag, opened, inside }; `spots` says which find is on each table.
const KEY = 'pawn-shop';
const fresh = () => ({ day: 1, phase: 'morning', clock: 0, pocket: TUNE.start, pool: 0, rent: TUNE.rent, rentDay: TUNE.rentEvery, rentN: 0, owed: 0, paidRents: 0, guide: false, fleet: [], won: false, yardDone: false, stock: [], spots: [null, null, null, null, null], uid: 1, sound: true, seenHelp: false, started: false });
const S = Object.assign(fresh(), load());
if (!S.today) S.today = pickToday();
// two of the yard sales each morning, never the same two in a row if it can help it
function pickToday() { return shuffle(['garage', 'toys', 'cat']).slice(0, 2); }
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

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
  K: '#6a4a2e', z: '#ffffff', V: '#d83a2a', H: '#4e5a3a', A: '#6a7a4a',
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
const CAT = ['k...k...', 'kkkkk...', 'kykyk...', 'kkkkk..k', '.kkkkk.k', '.kkkkkkk', '.kk.kk..'];

// the finds: one picture for both a real one and a dud, then the tell
const PIX = {
  shovel: ['.ww...........', 'w..wwwwwwwwRRR.', '.ww.......RrRRR', '..........RRRRR', '...........RRR.'],
  plate: ['...gggggg...', '.ggGGGGGGgg.', 'ggGGGGGGGGgg', 'gGGGGGGGGGGg', 'gGGGGGGGGGGg', 'ggGGGGGGGGgg', '.ggGGGGGGgg.', '...gggggg...'],
  camera: ['...bbbb.....', 'bbbbbbbbbbbb', 'bSSSbbbbbSSb', 'bLLLbOObLLLb', 'bLLbOooObLLb', 'bLLbOooObLLb', 'bLLLbOObLLLb', 'bbbbbbbbbbbb'],
  grinder: ['..iiii....', '.iIIIIi...', 'iIIIIIIi..', 'iIIIIIIiii', 'iIIIIIIiIi', '.iIIIIi.ii', '..iIIi....', '.iiiiii...', 'iIIIIIIi..', 'iiiiiiii..'],
  scale: ['......bb......', 'bbbbbbbbbbbbbb', '.b....bb....b.', 'BBBB..bb..BBBB', '.BB...bb...BB.', '......bb......', '.....bbbb.....', '....bbbbbb....'],
  lantern: ['...bb...', '..b..b..', '.bbbbbb.', '.bhhhhb.', '.bhyhhb.', '.bhyhhb.', '.bhhhhb.', '.bbbbbb.', 'bBBBBBBb', 'bbbbbbbb'],
  box: ['xxxxxxxxxxxx', 'xXXXXTTXXXXx', 'xXXXXTTXXXXx', 'TTTTTTTTTTTT', 'xXXXXTTXXXXx', 'xXXXXTTXXXXx', 'xxxxxxxxxxxx'],
  open: ['x..........x', 'xx........xx', 'xXXXXXXXXXXx', 'xXXXXXXXXXXx', 'xXXXXXXXXXXx', 'xxxxxxxxxxxx'],
  robot: ['....b.....', '..SSSSS...', '..SoSoS...', '..SSSSS...', '..SbbbS...', '.SSSSSSS..', 'SSSRRRSSS.', 'S.SRRRS.S.', '..SSSSS...', '..SS.SS...', '..SS.SS...', '.SSS.SSS..'],
  tincar: ['....RRRRR.....', '...RhhRhhR....', '.RRRRRRRRRRRR.', 'RRRRRRRRRRRRRR', 'SRRRRRRRRRRRRS', '.bb.......bb..', '.bb.......bb..'],
  figure: ['xxxxxxxxxx', 'xyyyyyyyyx', 'xXXXXXXXXx', 'xXhhsshhXx', 'xXhhsshhXx', 'xXhRRRRhXx', 'xXsRRRRsXx', 'xXhRRRRhXx', 'xXhphhphXx', 'xXhphhphXx', 'xXXXXXXXXx', 'xxxxxxxxxx'],
  junk: ['....hh....', '...hOOh...', '..hhhhhh..', '.hRPRGyPh.', 'hPyGRPRGyh', 'hGRyPGyRPh', 'hyPRGyPGRh', '.hhhhhhhh.'],
  insulator: ['...JJJJ...', '..JjjjjJ..', '..JjjjjJ..', '.JJjjjjJJ.', 'JjjjjjjjjJ', 'JJJJJJJJJJ', '.JjjjjjjJ.', '.JjjjjjjJ.', '..JJJJJJ..'],
  typewriter: ['...hhhhhhhh...', '.bbbbbbbbbbbb.', 'bSbbbbbbbbbbSb', 'bbbbbbbbbbbbbb', 'bbnbnbnbnbnbbb', 'bbbnbnbnbnbnbb', 'bbnbnbnbnbnbbb', 'bbbbbnnnnbbbbb', '.bbbbbbbbbbbb.'],
  iron: ['....bbbb....', '...b....b...', '...b....b...', '..iiiiiiii..', '.iIIIIIIIIi.', 'iIIIIIIIIIIi', 'iiiiiiiiiiii'],
  duck: ['..fff...', '.fffbf..', '.ffffrr.', 'f.fff...', 'fffffff.', 'ffffffff', '.ffffff.'],
  // drawn 26 Nov from Randi's photos of the real toys (shapes and colours only)
  sharpener: ['.iiiiiii....', 'iIIIIIIIi...', 'iIIIIIIIiSS.', 'iBBBBBBBi.S.', 'iIIIIIIIi.S.', 'iIIIIIRIi.bb', '.iiiiiii..bb', '...ii.......', '.iiiiii.....'],
  train: ['yyyyyyyyyyyyyyyy', 'yVVyhhhhhhhhhhhy', 'yyyyhPPPPPPPPPhy', 'yVVyhPPPPPPPPPhy', 'yyyyhBBBBBBBBBhy', 'yVVyhhbbhhhbbhhy', 'yyyyyyyyyyyyyyyy'],
  trainLoose: ['................', '..PPPPPPPPPP....', '.PPPPPPPPPPPP...', '.BBBBBBBBBBBB...', '..bb.....b......'],
  bottle: ['.........bb...', '.bbbb.....b...', '.bhbb.bb.bbb..', '.bbbbbhbbbbbb.', 'bbhbbbbbbbbhbb', 'bbbbbbbbbbbbbb', '.bb..bbb..bb..', '.bb..bbb..bb..'],
  sub: ['.......JJ.......', '......JjjJ......', '..JJJJJJJJJJJJ..', '.JjjjjjjjjjjjjJV', 'JjjnjnjnjnjjjjJV', '.JjjjjjjjjjjjJ.V', '...VV.....VV....'],
  tlr: ['.bbbbbbb.', 'bSSSSSSSb', 'bbbbbbbbb', 'bbbOOObbb', 'bbOoooObb', 'bbbOOObbb', 'bbbbbbbbb', 'bbbOOObbb', 'bbOoooObb', 'bbbOOObbb', 'bbbbbbbbb', 'bSSSSSSSb'],
  boxcam: ['...bbbb...', 'bbbbbbbbbb', 'bSSSSSSSSb', 'bSobSSboSb', 'bSSSSSSSSb', 'bSSSbbSSSb', 'bSSbOObSSb', 'bSSbOObSSb', 'bSSSbbSSSb', 'bbbbbbbbbb'],
  folding: ['bbbbb.......', 'bSSSb.......', 'bbbbbVVVSS..', 'bbbbbVVVSOO.', 'bbbbbVVVSooO', 'bbbbbVVVSOO.', 'bbbbbVVVSS..', 'bSSSb..S....', 'bbbbb.SS....'],
  enlarger: ['.iiiiii...', 'iIIIIIIiS.', 'iIIIIIIiS.', '.iiiiii.S.', '..iOOi..S.', '..ioOi..S.', '........S.', '........S.', '........S.', 'wwwwwwwwww', 'wnnnnnnnSw', 'wwwwwwwwww'],
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
  pills: ['..bb..', '..LL..', '.LLLL.', 'LLLLLL', 'LnnnnL', 'LnVVnL', 'LnnnnL', 'LLLLLL', 'LLLLLL'],
};
// the three battleships: one hull, each in its own paint
const SHIP_C = { Missouri: { O: '#7a7e88' }, Bismarck: { O: '#a8acb4' }, Yamato: { O: '#5e626c' } };
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
  lantern: [PIX.lantern, edit(PIX.lantern, [[3, 3, 'b'], [4, 4, 'b'], [3, 5, 'b'], [4, 6, 'b']])],
  robot: [edit(PIX.robot, [[8, 6, 'y'], [9, 5, 'y'], [9, 6, 'y'], [9, 7, 'y'], [3, 1, 'n']]), swap(swap(PIX.robot, 'S', 'v'), 'o', 'b')],
  tincar: [edit(PIX.tincar, [[5, 3, 'd'], [10, 2, 'd'], [3, 4, 'd']]), swap(PIX.tincar, 'S', 'R')],
  figure: [edit(PIX.figure, [[2, 1, 'R'], [3, 1, 'R']]), swap(swap(PIX.figure, 's', 'g'), 'y', 'Q')],
  junk: [PIX.junk, PIX.junk],
  insulator: [edit(PIX.insulator, [[4, 2, 'n'], [6, 6, 'n'], [3, 7, 'n']]), swap(swap(PIX.insulator, 'j', 'h'), 'J', 'O')],
  typewriter: [edit(PIX.typewriter, [[6, 3, 'y'], [7, 3, 'y']]), swap(swap(PIX.typewriter, 'b', 'X'), 'n', 'T')],
  iron: [edit(PIX.iron, [[3, 4, 'R'], [8, 5, 'R'], [5, 4, 'R']]), edit(swap(swap(PIX.iron, 'I', 'b'), 'i', 'k'), [[4, 4, 'n']])],
  duck: [swap(PIX.duck, 'f', 'F'), PIX.duck],
  sharpener: [PIX.sharpener, swap(swap(swap(PIX.sharpener, 'B', 'S'), 'I', 'S'), 'R', 'S')],
  train: [PIX.train, PIX.trainLoose],
  bottle: [PIX.bottle, swap(swap(PIX.bottle, 'b', 'i'), 'h', 'i')],
  sub: [edit(PIX.sub, [[3, 1, 'y'], [4, 1, 'y']]), swap(swap(PIX.sub, 'j', 'o'), 'J', 'P')],
  tlr: [PIX.tlr, edit(PIX.tlr, [[3, 4, 'n'], [4, 3, 'n'], [5, 4, 'n']])],
  boxcam: [PIX.boxcam, swap(swap(PIX.boxcam, 'b', 'P'), 'S', 'o')],
  folding: [PIX.folding, edit(PIX.folding, [[6, 3, 'k'], [7, 4, 'k'], [5, 5, 'k'], [6, 6, '.']])],
  enlarger: [PIX.enlarger, edit(PIX.enlarger, [[3, 4, '.'], [4, 4, '.'], [3, 5, '.'], [4, 5, '.']])],
  truck: [edit(PIX.truck, [[9, 0, 'd'], [10, 0, 'd'], [14, 2, 'd'], [8, 4, 'd'], [16, 5, 'd'], [2, 4, 'd']]), swap(PIX.truck, 'S', 'o')],
  plane: [PIX.plane, swap(swap(PIX.plane, 'S', 'n'), 'V', 'P')],
  biplane: [PIX.biplane, swap(PIX.biplane, 'S', 'w')],
  ship: [PIX.ship, PIX.ship],
  canteen: [PIX.canteen, swap(PIX.canteen, 'y', 'A')],
  comics: [PIX.comics, swap(PIX.comics, 'T', 'n')],
  book: [PIX.book, swap(swap(PIX.book, 'B', 'n'), 'm', 'P')],
  plush: [PIX.plush, swap(PIX.plush, 'b', 'o')],
  present: [PIX.present, PIX.present], milk: [PIX.milk, PIX.milk], lint: [PIX.lint, PIX.lint], pills: [PIX.pills, PIX.pills],
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
    let base = (f.good ? K.worth : K.dud) * rand(1 - TUNE.jitter, 1 + TUNE.jitter);
    if (!NO_Q.has(kind)) {
      f.q = kind === 'ship' ? 4 : rollQ();
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
const nameOf = f => f.kind === 'ship' ? t('shipName', { name: f.ship }) : f.kind === 'box' && f.opened ? t('boxName', { item: t(`boxIn.${f.inside}`) }) : f.title ? t('artName', { title: f.title }) : t(`kinds.${f.kind}`);
const Name = f => { const n = nameOf(f); return n[0].toUpperCase() + n.slice(1); };
const known = f => f.seen || (f.kind === 'box' && f.opened);
// what customers and the dealer think it's worth: they know
const worthTo = f => f.kind === 'box' && !f.opened ? TUNE.boxWorth : f.value;
const byUid = uid => S.stock.find(f => f.uid === uid);
const spotOf = f => S.spots.indexOf(f.uid);
const inBack = () => S.stock.filter(f => spotOf(f) < 0);

// ---------- The shop ----------
// Laid out 26 Nov: the desk with the camera top left, three tables, the glass
// case and the rack, the register counter by the door. The back wall holds
// the rent board.
const SHOP = [
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
];
const SHOP_DOOR = { x: 10, y: 11.8 }, REG_FRONT = { x: 14.5, y: 9.6 };
// ---------- Where to buy ----------
// Decided 26 Nov (Randi's asks): a different pair of yard sales each morning,
// each with its own mix, and the swap meet, walked stall to stall. `MK` is
// the place you're at: its finds, slots, sellers, what's solid.
const SALES = {
  garage: { house: '#e8dcc4', siding: '#cfc2a6', yes: .5, finds: () => [...shuffle(['shovel', 'plate', 'camera', 'grinder', 'scale', 'lantern', 'insulator', 'typewriter', 'iron', 'sharpener', 'bottle', 'canteen', 'train', 'boxcam', 'folding', 'enlarger', 'tlr']).slice(0, 5), ...(Math.random() < .6 ? ['box'] : [])] },
  toys: { house: '#d8e4f0', siding: '#b8c8d8', yes: .5, finds: () => ['junk', 'junk', 'junk', ...shuffle([...TOYS, 'train']).slice(0, 2), pick(['figure', 'duck', 'box', 'present', 'plush', 'comics'])] },
  cat: { house: '#f0d8e0', siding: '#d8b8c4', yes: .15, cats: true, finds: () => ['hairball', 'hairball', 'hairball', 'hairball', ...shuffle(['plate', 'lantern', 'scale', 'camera']).slice(0, 2)] },
  swap: { fee: 5 },
};
const STALLS = {
  toys: { sign: 'TOYS', canopy: '#c84a3a', finds: () => shuffle([...shuffle(TOYS).slice(0, 3), 'junk', 'junk']).slice(0, 2) },
  trains: { sign: 'TRAINS', canopy: '#3b4a6a', finds: () => ['train', pick(['train', 'bottle'])] },
  surplus: { sign: 'SURPLUS', canopy: '#6a7a4a', finds: () => ['canteen', pick(['canteen', 'shovel', 'sharpener'])] },
  books: { sign: 'BOOKS', canopy: '#5e3a1c', finds: () => shuffle(['comics', 'book', 'comics', 'plush']).slice(0, 2) },
  glass: { sign: 'GLASS', canopy: '#4a9a6a', finds: () => shuffle(['plate', pick(['plate', 'lantern', 'insulator']), 'insulator']).slice(0, 2) },
  tools: { sign: 'TOOLS', canopy: '#8a5a30', finds: () => ['shovel', pick(['grinder', 'iron'])] },
  old: { sign: 'OLD STUFF', canopy: '#8a4ab0', finds: () => shuffle(['grinder', 'scale', 'lantern', 'typewriter', 'typewriter', 'iron', 'sharpener', 'bottle', 'boxcam']).slice(0, 2) },
  ducks: { sign: 'DUCKS', canopy: '#ffd040', finds: () => ['duck', 'duck'] },
  cameras: { sign: 'CAMERAS', canopy: '#3b6ea8', finds: () => shuffle(['camera', 'boxcam', 'folding', 'enlarger', 'tlr', 'junk']).slice(0, 2) },
  cat: { sign: 'CAT ART', canopy: '#e05a9a', yes: .15, finds: () => ['hairball', 'hairball'] },
  boxes: { sign: 'BOXES', canopy: '#e8a030', finds: () => ['box', 'box'] },
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
// four stalls under striped awnings, each with its own seller and two finds.
// The DEALS stall, when it's there, is top right, so its seller can run off
// the edge when the police come.
function buildSwap() {
  let list = shuffle(Object.keys(STALLS).filter(k => k !== 'shady' && k !== 'models')).slice(0, 8);
  if (shipsLeft().length && Math.random() < TUNE.shipChance) list[pick([0, 1, 2, 4, 5, 6])] = 'models';
  if (Math.random() < TUNE.shadyChance) { list = list.slice(0, 7); list.splice(3, 0, 'shady'); }
  const M = { id: 'swap', kind: 'swap', w: 36, top: 2, bottom: 11.2, sale: SALES.swap, items: [], slots: [], vendors: [], stalls: [], solid: [], objs: [], bought: 0, start: { x: 3.5, y: 8.6 }, cats: [], cops: null, copT: randIn(TUNE.copsAfter) };
  list.forEach((sid, i) => {
    const st = STALLS[sid], top = i < 4, sx = 8 + (i % 4) * 7, ty = top ? 3.6 : 8, vi = M.vendors.length;
    M.vendors.push({ x: sx + 2, y: top ? 3.35 : 10.6, look: sid === 'cat' ? CAT_LADY : sid === 'shady' ? HOOD : pick(LOOKS), rows: sid === 'shady' ? SHADY : CUST, lines: `stalls.${sid}`, yes: st.yes ?? .5, no: sid === 'cat' ? 'catNo' : 'sellerNo', face: 1, walkT: 0, shady: sid === 'shady' });
    M.solid.push({ x: sx, y: ty, w: 4, h: 1 }, top ? { x: sx, y: 2, w: 4, h: 1.6 } : { x: sx, y: 9, w: 4, h: 2.2 });
    const finds = st.finds();
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
  return M;
}
let scene = 'shop';
const objs = () => scene === 'shop' ? SHOP : MK.objs.filter(o => o.slot == null || MK.items[o.slot]);
function solidAt(x, y) {
  if (scene === 'shop') {
    if (x < 1 || x >= W - 1 || y < 2 || y >= H - 1.2) return true;
    return SHOP.some(o => !o.wall && x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
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
function actionNow() { const o = inReach(); return o ? o.act : 'use'; }
function act() { const o = inReach(); if (o) use(o); }
function use(o) {
  if (scene === 'yard') {
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
  else if (a === 'play') startPlay();
  else if (a === 'over') openCard(`${h2(t('startOver'))}<p>${t('startOverAsk')}</p><div class="row">${btn('title', t('cancel'))}${btn('reset', t('startOver'), true)}</div>`, null, 'title');
  else if (a === 'title') titleCard();
  else if (a === 'reset') { const snd = S.sound; for (const k in S) delete S[k]; Object.assign(S, fresh(), { sound: snd, seenHelp: true }); save(); enterShop(); startPlay(); }
  // the door
  else if (a === 'go') goBuying(b.dataset.sale);
  else if (a === 'openShop') openShop();
  else if (a === 'closeUp') { closeCard(); S.clock = TUNE.dayLen; }
  // the yard sale
  else if (a === 'buy') buy(+b.dataset.slot);
  else if (a === 'askLess') askLess(+b.dataset.slot);
  else if (a === 'drive') backToShop();
  // the desk and the floor
  else if (a === 'find') findCard(byUid(+b.dataset.uid), cardFrom, cardSpot);
  else if (a === 'desk') deskCard();
  else if (a === 'spotList') spotCard(cardSpot);
  else if (a === 'snap') snap(f);
  else if (a === 'openBox') openBox(f);
  else if (a === 'quick') quickSell(f);
  else if (a === 'toss') { S.stock = S.stock.filter(x => x !== f); save(); SFX.no(); say(t('tossed')); deskCard(); }
  else if (a === 'copsOk') { closeCard(); showBar(); }
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
  // the end of the day
  else if (a === 'rent') rentCard();
  else if (a === 'nextDay') nextDay();
});
$('#card').addEventListener('input', e => {
  if (e.target.id === 'tagIn' && cardFind) { setTag(cardFind, Math.floor(+e.target.value || 0)); refreshFindBtns(cardFind); }
});
// a find out on a table always has a tag, or it would go for nothing
function setTag(f, n) { f.tag = clamp(Math.round(n), spotOf(f) >= 0 ? 1 : 0, 99999); save(); }

function titleCard() {
  mode = 'title';
  openCard(`${h2(t('title'))}<p>${t('intro')}</p><div class="row">${S.started ? btn('over', t('startOver')) : ''}${btn('play', t('play'), true)}</div>`, null, 'none');
}

// ----- the door -----
function doorCard() {
  if (S.phase === 'open') {
    openCard(`${h2(t('closeTitle'))}<p>${t('closeText', { clock: clockText() })}</p><div class="row">${btn('close', t('keepOpen'))}${btn('closeUp', t('closeUp'), true)}</div>`);
    return;
  }
  const any = S.spots.some(u => u != null);
  const icon = { garage: LOOK.shovel[0], toys: LOOK.robot[0], cat: ART[1], swap: PIX.box };
  const places = S.yardDone ? `<p class="soft">${t('beenYard')}</p>` : `<div class="list">${[...S.today, 'swap'].map(id =>
    `<button class="it" type="button" data-act="go" data-sale="${id}"><img src="${picSrc(icon[id])}" alt=""><span>${t(`sales.${id}.name`)}<small>${t(`sales.${id}.line`, { fee: SALES.swap.fee })}</small></span></button>`).join('')}</div>`;
  openCard(`${h2(t('doorTitle'))}<p>${t('doorText', { n: S.day })}</p>${places}${any ? '' : `<p class="soft">${t('nothingOut')}</p>`}
    <div class="row">${btn('close', t('cancel'))}${btn('openShop', t('openShop'), S.yardDone && any)}</div>`, S.yardDone ? null : '.it');
}

// ----- the yard sale -----
function goBuying(id) {
  const fee = id === 'swap' ? SALES.swap.fee : 0;
  if (S.pocket < fee) { closeCard(); say(t('tooPoorFee', { n: fee })); return; }
  closeCard(); SFX.car();
  S.pocket -= fee; S.yardDone = true; save();
  MK = id === 'swap' ? buildSwap() : buildYard(id);
  scene = 'yard'; P.x = MK.start.x; P.y = MK.start.y; P.route = null; custs = []; floats = [];
  setWidth(MK.w);
  if (fee) { say(t('swapHello')); say(t('fee', { n: fee })); } else say(t(MK.vendors[0].lines));
  showBar();
}
function lookCard(slot) {
  const f = MK.items[slot]; if (!f) return;
  const sl = MK.slots[slot], v = MK.vendors[sl.vendor];
  sl.line = sl.line || t(v.lines);
  const note = f.kind === 'box' ? `<p class="note">${t('sealedNote')}</p>` : f.hot ? `<p class="note">${t('hotNote')}</p>` : '';
  const poor = S.pocket < f.ask;
  const rough = S.guide && f.q ? `<dt>${t('condLbl')}</dt><dd>${STR.guideSays[f.q - 1]}</dd>` : '';
  openCard(`${h2(Name(f))}<div class="look">${picHtml(f)}<div class="facts"><dl><dt>${t('ask')}</dt><dd>$${f.ask}</dd>${rough}</dl><p class="soft">${t('yourPocket', { n: S.pocket })}</p></div></div>${note}
    <p id="sellerSays" class="soft" role="status">“${f.reply || (f.free ? t('giveaway') : sl.line)}”</p>
    <div class="row">${btn('close', t('leave'))}${f.free ? '' : btn('askLess', t('askLess'), false, `data-slot="${slot}" ${f.asked ? 'disabled' : ''}`)}${btn('buy', f.free ? t('takeFree') : t('buy', { n: f.ask }), true, `data-slot="${slot}" ${poor ? 'disabled' : ''}`)}</div>`);
}
function askLess(slot) {
  const f = MK.items[slot], v = MK.vendors[MK.slots[slot].vendor]; f.asked = true;
  if (Math.random() < v.yes) { f.ask = Math.max(1, Math.round(f.ask * TUNE.sellerCut)); f.reply = t(v.shady ? 'shadyYes' : 'sellerYes', { n: f.ask }); SFX.coin(); }
  else { f.reply = t(v.no); SFX.no(); }
  lookCard(slot);
}
function buy(slot) {
  const f = MK.items[slot];
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
  openCard(`${h2(t('carTitle'))}<p>${n ? t('carText', { n }) : t('carNone')}</p><div class="row">${btn('close', t('stay'))}${btn('drive', t('drive'), true)}</div>`);
}
function backToShop() {
  closeCard(); SFX.car(); enterShop(); P.x = 10; P.y = 10.4; showBar();
  // driving off with stolen goods doesn't keep them: an officer is waiting
  const hot = S.stock.filter(f => f.hot);
  if (hot.length) { SFX.siren(); confiscate(hot, 'copsShopTitle', 'copsShop'); }
}
function enterShop() { scene = 'shop'; MK = null; custs = []; floats = []; P.route = null; setWidth(20); }
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
    <div class="row">${S.guide ? '' : btn('guide', t('guideBuy', { n: TUNE.guide }), false, S.pocket < TUNE.guide ? 'disabled' : '')}${btn('close', t('done'), true)}</div>`, '.it');
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
  if (atDesk && f.kind === 'present') acts.push(btn('unwrap', t('unwrap'), true));
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
  const list = S.fleet.map(n => `<li><img src="${picSrc(PIX.ship, { ...C, ...SHIP_C[n] })}" alt="">${n}</li>`).join('');
  openCard(`${h2(t('fleetTitle'))}<p>${S.fleet.length ? t('fleetText') : t('fleetEmpty')}</p>${list ? `<ul class="loot">${list}</ul>` : ''}<div class="row">${btn('close', t('done'), true)}</div>`);
}

// ----- the rent board -----
function boardCard() {
  openCard(`${h2(t('boardTitle'))}<p>${t('boardText', { rent: S.rent, day: S.rentDay, pool: S.pool })}</p>${S.owed ? `<p>${t('boardOwed', { n: S.owed })}</p>` : ''}<p class="note">${t('boardSplit')}</p><div class="row">${btn('close', t('done'), true)}</div>`);
}

// ---------- The day ----------
function clockText(c = S.clock) {
  const mins = 9 * 60 + Math.floor(clamp(c / TUNE.dayLen, 0, 1) * 8 * 60 / 30) * 30, h = Math.floor(mins / 60), m = mins % 60;
  return `${(h - 1) % 12 + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
}
let daySales = [];
function openShop() {
  closeCard(); S.phase = 'open'; S.clock = 0; spawnT = TUNE.firstCust; save();
  SFX.door(); say(t('openMsg')); showBar();
}
function stepDay(dt) {
  if (S.phase !== 'open') return;
  S.clock += dt;
  if (S.clock < TUNE.dayLen) {
    spawnT -= dt;
    if (spawnT <= 0) { spawnT = randIn(TUNE.custEvery); spawnCust(); }
  } else if (!stepDay.closing) { stepDay.closing = true; say(t('closing')); }
  if (S.clock >= TUNE.dayLen && !custs.length) { stepDay.closing = false; endDay(); }
  if (Math.floor(S.clock) % 5 === 0 && Math.floor(S.clock) !== stepDay.saved) { stepDay.saved = Math.floor(S.clock); save(); }
}
function endDay() {
  S.phase = 'closed'; save(); SFX.bell();
  const list = daySales.length ? `<p>${t('daySold')}</p><ul>${daySales.map(s => `<li>${Name(s.f)}: $${s.n}</li>`).join('')}</ul>` : `<p>${t('dayNone')}</p>`;
  const rentToday = S.day >= S.rentDay;
  openCard(`${h2(t('dayTitle', { n: S.day }))}${list}<p class="soft">${t('dayTotals', { pocket: S.pocket, pool: S.pool })}</p><div class="row">${rentToday ? btn('rent', t('rentTitle'), true) : btn('nextDay', t('nextDay'), true)}</div>`, null, 'none');
  daySales = [];
}
function rentCard() {
  const due = S.rent + S.owed;
  const fromPool = Math.min(S.pool, due), fromPocket = Math.min(S.pocket, due - fromPool), short = due - fromPool - fromPocket;
  S.pool -= fromPool; S.pocket -= fromPocket;
  S.owed = short ? short + TUNE.late : 0;
  if (!short) S.paidRents++;
  S.rentDay += TUNE.rentEvery; S.rentN = (S.rentN || 0) + 1;
  const newLease = S.rentN % TUNE.lease === 0;
  if (newLease) S.rent += TUNE.rentUp;
  save();
  if (short) SFX.no(); else SFX.ching();
  const paid = t('rentPaid', { rent: fromPool + fromPocket, fromPool, more: fromPocket ? t('rentMore', { n: fromPocket }) : '' });
  const won = !S.won && S.paidRents >= TUNE.winAfter;
  if (won) { S.won = true; save(); }
  openCard(`${h2(t('rentTitle'))}<p>${paid}</p>${short ? `<p>${t('rentShort', { n: short, fee: TUNE.late })}</p>` : ''}<p class="soft">${newLease ? t('leaseNew', { rent: S.rent }) + ' ' : ''}${t('rentNext', { rent: S.rent, day: S.rentDay })} ${newLease ? '' : t('leaseLeft', { n: TUNE.lease - S.rentN % TUNE.lease })}</p>
    ${won ? `<p class="note"><b>${t('wonTitle')}</b> ${t('wonText')}</p>` : ''}<div class="row">${btn('nextDay', t('nextDay'), true)}</div>`, null, 'none');
  if (won) SFX.wow();
  showBar();
}
function nextDay() {
  closeCard(); S.day++; S.phase = 'morning'; S.clock = 0; S.yardDone = false;
  const was = [...S.today].sort().join(); do S.today = pickToday(); while ([...S.today].sort().join() === was); save();
  P.x = 10; P.y = 9.5; say(t('morning', { n: S.day })); showBar();
}

// ---------- Customers ----------
// Each one walks in, looks at a find, and decides: the tag is fair, so they
// bring it to the register (and sometimes haggle anyway); the tag is a bit
// high, so they bring it and haggle; or it's far too high and they leave.
// They know what things are worth, give or take: a dud with a big tag sits.
// Buyers (Randi, 26 Nov): bargain hunters come all day and offer low;
// collectors pay fair, but only turn up late (after `TUNE.lateFrom` of the
// day). Selling to the first offer or waiting for a collector is the choice.
// A collector wears a hat and glasses, so they can be told apart.
const COLLECTOR = { a: CUST.a.map((r, i) => i === 0 ? '.hhhhhhhh.' : i === 3 ? '..sbsbbs..' : r), b: CUST.b.map((r, i) => i === 0 ? '.hhhhhhhh.' : i === 3 ? '..sbsbbs..' : r) };
function spawnCust() {
  const late = S.clock > TUNE.dayLen * TUNE.lateFrom;
  const kind = late ? (Math.random() < .7 ? 'collector' : 'regular') : (Math.random() < .5 ? 'hunter' : 'regular');
  const look = kind === 'collector' ? { ...pick(LOOKS), h: '#2a2a30' } : pick(LOOKS);
  const c = { x: SHOP_DOOR.x - .5 + Math.random(), y: 11.6, look, kind, rows: kind === 'collector' ? COLLECTOR : CUST, mode: 'in', t: 0, walkT: 0, face: 1, route: null, find: null, say: null };
  if (kind === 'collector') c.say = { text: t('collectorIn'), t: 2 };
  const free = S.spots.map((u, i) => u != null && !custs.some(o => o.spot === i) ? i : -1).filter(i => i >= 0);
  if (free.length) { c.spot = free[Math.floor(Math.random() * free.length)]; c.route = path(c, SHOP.find(o => o.spot === c.spot).stand, true); }
  else { c.spot = null; c.route = path(c, { x: 9 + Math.random() * 3, y: 7.6 }, true); }
  if (!c.route) return;
  custs.push(c); SFX.door();
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
function leaveShop(c) { c.mode = 'out'; c.route = path(c, SHOP_DOOR, true) || [SHOP_DOOR]; }
function putBack(c) {
  // the find goes back where it was, if that spot's still free
  if (!c.find) return;
  if (S.spots[c.spot] == null) S.spots[c.spot] = c.find.uid;
  else { const i = S.spots.indexOf(null); if (i >= 0) S.spots[i] = c.find.uid; }
  c.find = null; save();
}
function stepCusts(dt) {
  for (const c of custs) {
    if (c.say) { c.say.t -= dt; if (c.say.t <= 0) c.say = null; }
    if ((c.mode === 'in' || c.mode === 'browse') && mice.some(m => dist(m, c) < 1.6)) { bubble(c, t('mouseScare')); leaveShop(c); continue; }
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
      const mint = f.q === 5;
      const would = worthTo(f) * randIn(c.kind === 'collector' ? (mint ? TUNE.collectorMint : TUNE.collector) : TUNE.pay);
      const stretch = mint ? TUNE.mintStretch : TUNE.stretch;
      if (c.kind === 'hunter') {
        // a bargain hunter always offers low, and goes no higher than this
        c.max = Math.max(1, Math.round(worthTo(f) * TUNE.hunterMax)); c.price = f.tag;
        c.offer = Math.max(1, round5(worthTo(f) * randIn(TUNE.hunter)));
        if (!worthTo(f) || c.offer >= f.tag) { c.offer = null; c.max = f.tag; }
        if (!worthTo(f) || f.tag > worthTo(f) * 2) { bubble(c, t('tooPricey')); leaveShop(c); continue; }
      } else if (f.tag <= would) {
        c.max = f.tag; c.price = f.tag;
        c.offer = c.kind !== 'collector' && Math.random() < TUNE.haggleAnyway && f.tag >= 20 ? round5(f.tag * randIn(TUNE.offer)) : null;
      } else if (f.tag <= would * stretch) {
        c.max = Math.max(1, Math.round(would)); c.price = f.tag; c.offer = Math.max(1, round5(would * randIn(TUNE.offer)));
        if (c.offer >= f.tag) c.offer = null;
      } else { bubble(c, t('tooPricey')); leaveShop(c); continue; }
      c.find = f; S.spots[c.spot] = null; save();
      c.mode = 'toReg'; c.joined = ++lineNo;
      c.route = path(c, linePlace(inLine().indexOf(c)), true);
    } else if (c.mode === 'toReg') {
      if (walk(c, dt)) { c.mode = 'wait'; c.t = TUNE.wait; bubble(c, t('wait')); SFX.bell(); }
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
  if (!c) { openCard(`${h2(t('regTitle'))}<p>${t('regEmpty')}</p><div class="row">${btn('close', t('done'), true)}</div>`); return; }
  const f = c.find, item = nameOf(f), who = `<p><b>${t(`buyers.${c.kind}`)}</b></p>`;
  if (c.offer == null) {
    openCard(`${h2(t('regTitle'))}<div class="look">${picHtml(f)}<div class="facts">${who}<p>${t('regPays', { item, tag: f.tag })}</p></div></div><div class="row">${btn('noSale', t('noSale'))}${btn('ring', t('ringUp'), true)}</div>`, null, 'noSale');
  } else {
    const mid = round5((c.offer + f.tag) / 2);
    c.mid = mid > c.offer && mid < f.tag ? mid : null;
    openCard(`${h2(t('regTitle'))}<div class="look">${picHtml(f)}<div class="facts">${who}<p>${t('regOffer', { item, tag: f.tag, offer: c.offer })}</p><dl><dt>${t('paid')}</dt><dd>$${f.cost}</dd><dt>${t('worth')}</dt><dd>${known(f) ? '$' + f.value : t('worthUnknown')}</dd></dl></div></div>
      <div class="row">${btn('noSale', t('noSale'))}${c.mid && !c.countered ? btn('counter', t('counter', { n: c.mid })) : ''}${btn('offer', t('sellFor', { n: c.offer }), true)}</div>`, null, 'noSale');
  }
}
function counter(c) {
  c.countered = true;
  if (c.mid <= c.max) { bubble(c, t('deal', { n: c.mid })); sell(c, c.mid); }
  else { SFX.no(); bubble(c, t('walkOff')); closeCard(); putBack(c); leaveShop(c); }
}
function noSale(c) { closeCard(); bubble(c, t('walkOff')); putBack(c); leaveShop(c); }
function sell(c, n) {
  const f = c.find; c.find = null;
  S.stock = S.stock.filter(x => x !== f);
  bubble(c, t('thanks')); leaveShop(c);
  const r = SHOP.find(o => o.id === 'reg');
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
  $('#dayPill').textContent = S.phase === 'open' ? t('dayClock', { n: S.day, clock: clockText() }) : t('day', { n: S.day });
  $('#cashPill').innerHTML = `<span class="long">${t('pocket', { n: S.pocket })}</span><span class="short">${t('pocketShort', { n: S.pocket })}</span>`;
  $('#poolPill').innerHTML = `<span class="long">${t('pool', { n: S.pool, rent: S.rent + S.owed })}</span><span class="short">${t('poolShort', { n: S.pool, rent: S.rent + S.owed })}</span>`;
}
function nextThing() {
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
  if (scene === 'yard') return t('goalYard');
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
  if (open) { $('#goalNow').textContent = goalText(); $('#helpList').innerHTML = STR.help.map(l => `<li>${l}</li>`).join(''); }
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
  for (let j = 2; j < 11; j++) for (let i = 1; i < 19; i++) put(floorTile((i * 7 + j * 3) % 4), i * T, j * T);
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
  for (const wx of [3, 13]) {
    px(wx * T, 11 * T + 3, 4 * T, 10, '#a8d8f0'); px(wx * T + 6, 11 * T + 4, 10, 2, '#e8f8ff');
    px(wx * T, 11 * T + 3, 4 * T, 1, '#2a1a10');
  }
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
  drawCar(2 * T, 10 * T + 2);
}
function drawFinds(now) {
  MK.items.forEach((f, i) => {
    if (!f) return;
    const s = MK.slots[i];
    drawItemAt(f, s.x * T, s.y * T, now);
    tagAt(f.ask, s.x * T, s.tagY * T + 2);
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
  const bx = 15 * T;
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
  drawCar(2 * T, 9 * T + 2);
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
  if (scene === 'shop') drawShop(now); else if (MK.kind === 'swap') drawSwap(now); else drawYard(now);
  // people, drawn top to bottom so nearer ones stand in front
  const people = [{ o: P, rows: KEEPER, col: C }, ...custs.map(c => ({ o: c, rows: c.rows || CUST, col: c.look }))];
  if (scene === 'yard') {
    MK.vendors.forEach(v => { if (!v.gone) people.push({ o: v, rows: v.rows, col: v.look }); });
    if (MK.cops) MK.cops.officers.forEach(o => people.push({ o, rows: OFFICER, col: COP }));
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
  if (scene === 'yard') for (const v of [...MK.vendors, ...(MK.cops ? MK.cops.officers : [])]) if (v.say && !v.gone) bubbleAt(v.say.text, v.x * T, v.y * T - 15);
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
  closeCard(); mode = 'play'; S.started = true;
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
  if (scene === 'shop') { stepDay(dt); stepCusts(dt); stepMice(dt); } else stepMarket(dt);
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
