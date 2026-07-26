import { Card } from "../data/cards";

// Simple seedable random generator (SFC32)
function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

// Get seed from string hash (XMUR3)
function xmur3(str: string) {
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function createDeterministicRandom(seedStr: string) {
  const seed = xmur3(seedStr);
  return sfc32(seed(), seed(), seed(), seed());
}

// Data pools for procedural generation
const ARCHETYPES: Array<"Warrior" | "Mage" | "Thief" | "Fate"> = ["Warrior", "Mage", "Thief", "Fate"];
const RARITIES: Array<"Common" | "Rare" | "Epic" | "Legendary"> = ["Common", "Rare", "Epic", "Legendary"];

const RUNES_MAP = {
  Warrior: ["Swords", "Shield", "Trophy"],
  Mage: ["Flame", "Wind", "Sprout"],
  Thief: ["Eye", "Cookie", "Coins", "Skull"],
  Fate: ["Activity", "Skull", "Eye"]
};

const COLOR_MAP = {
  Common: "slate",
  Rare: "violet",
  Epic: "indigo",
  Legendary: "amber"
};

const IMAGE_POOLS = {
  Warrior: [
    "/src/assets/images/warrior_cat_1784591310191.jpg",
    "/src/assets/images/sentry_cat_1784591364459.jpg",
    "/src/assets/images/frost_troll_cat_1784591410273.jpg"
  ],
  Mage: [
    "/src/assets/images/wizard_cat_1784591318541.jpg",
    "/src/assets/images/greybeard_cat_1784591401650.jpg",
    "/src/assets/images/nirnroot_cat_1784591430148.jpg"
  ],
  Thief: [
    "/src/assets/images/nightingale_cat_1784591357293.jpg",
    "/src/assets/images/thief_cat_1784591329350.jpg",
    "/src/assets/images/merchant_cat_1784591372857.jpg",
    "/src/assets/images/dark_speaker_cat_1784591393303.jpg"
  ],
  Fate: [
    "/src/assets/images/sheogorath_cat_1784591380989.jpg",
    "/src/assets/images/daedra_cat_1784591418782.jpg"
  ]
};

const ELEMENTS = {
  Warrior: {
    titles: [
      "The Sovngarde Vanguard",
      "The Steel-Heart Champion",
      "The Shield-Brother of Whiterun",
      "The Windhelm Warden",
      "The Companion Initiate",
      "The Ebony Sentinel",
      "The Dragon-Slayer of Akavir",
      "The Oath-Bound Defender",
      "The Rune-Carved Berserker",
      "The Nordic Warlord",
      "The Iron-Clad Myrmidon",
      "The Blade-Master of Cloud Ruler",
      "The High-Hrothgar Sentry",
      "The Pale-Pass Scout",
      "The Solitude Guard Captain"
    ],
    phrases: [
      "Thy shield is a fortress, and thy sword a swift storm against the darkness.",
      "A glorious combat awaits; the bards shall sing of thy stubborn iron heart.",
      "Stand thy ground, traveler, for the mountain does not bow to the breeze.",
      "May thy heavy boots shake the earth, and thy steel cut through all shadows.",
      "Let thy honor be thy guide, and thy blood be the ink of thy legends."
    ],
    quotes: [
      "By the light of Sovngarde, our blades shall never dull.",
      "Steel is strong, but the iron will of a warrior is unbreakable.",
      "We fight not for glory, but for the shield-brothers who stand beside us.",
      "Honor is written in the blood we shed for our homeland.",
      "Only those who brave the blizzard shall find the warmth of the hall."
    ],
    lores: [
      "A legendary vanguard who has crossed swords with giants and survived the freezing blizzards of the Pale. Their heavy armor is scarred by claws and frost, a testament to their eternal resilience.",
      "Bound by an ancient blood oath to the high kings of old. They watch the mountain passes with a watchful eye, waiting for the return of the ancient dragons and the sound of the horn.",
      "Hailing from the frozen shores of Windhelm, this warrior was forged in the fire of civil conflict. They carry a heavy battle-axe that has shattered the shields of a hundred foes.",
      "An ancient spirit of the Companion guild, whose ghost still haunts the training grounds of Jorrvaskr, imparting wisdom to those worthy of the blade.",
      "A silent sentinel who stood watch at the gates of Solitude during the Great War. It is said they never blinked, and their posture remained as rigid as the city's stone arch."
    ],
    meanings: [
      "Drawing this card urges you to stand your ground against oncoming storms. Face your obstacles with heavy determination; your strength is greater than you know.",
      "A calling to defend what is sacred to you. Do not let minor setbacks dull your resolve. Equip your shield and lead the charge.",
      "This omen signifies a time for direct confrontation. The path of least resistance will lead to defeat; draw your courage and face the giant directly.",
      "Thy resilience is being tested. Do not fear the scars of battle, for they are the gold-leafed repairs of a warrior's soul.",
      "A prompt to seek allies. Even the strongest warlord cannot conquer the mountain alone. Seek thy shield-brothers and combine thy strength."
    ]
  },
  Mage: {
    titles: [
      "The Winterhold Spellweaver",
      "The Disciple of Magnus",
      "The Chrono-Sage of Aetherius",
      "The Psijic Mystic of Artaeum",
      "The Necromancer Sovereign",
      "The Runemaster of Riften",
      "The Conjurer of Oblivion",
      "The Pyromancer Adept",
      "The Star-Gazer of Skyrim",
      "The Void-Weaver of the Abyss",
      "The Tonal Architect of Dwemer",
      "The Illusionist of Markarth",
      "The Restoration Priest of Kynareth",
      "The Alchemy Scholar of Whiterun",
      "The Spectral Sorcerer"
    ],
    phrases: [
      "The winds of magicka blow fierce; bend them to thy will or dissolve in their fire.",
      "Read the old books, search the constellations, and unlock the secret stars.",
      "The cosmic laws are but threads; a master spellweaver can alter the tapestry.",
      "In the silence of the library, the voice of the first era whispers of secrets.",
      "A spark of curiosity is more dangerous than a thousand unsheathed blades."
    ],
    quotes: [
      "The stars themselves are but ink on the great canvas of Aetherius.",
      "Magicka flows like a river; only the disciplined can drink without drowning.",
      "To see the future, one must first dismantle the illusion of the present.",
      "The runes speak a language older than the mountains.",
      "A single spark of curiosity can ignite a firestorm of revelation."
    ],
    lores: [
      "An elder wizard who has studied the forbidden libraries of Apocrypha. Their eyes glow with the pale blue light of raw magicka, capable of altering the local flows of gravity and time.",
      "A quiet researcher of the ancient Dwemer machinery. They have unlocked the secret frequencies of steam and tonal magic, bending copper and gold to their voice.",
      "A solitary hermit dwelling in the hot springs of Eastmarch. They brew alchemical concoctions from creep cluster and dragon's tongue, seeking the elixir of perfect youth.",
      "Once a high scholar at the College of Winterhold, they cast a spell that opened a rift to another dimension and have spent forty years trying to close it from the inside.",
      "A devout priestess of Kynareth who can heal the deepest wounds with a touch. They believe that magicka is a direct gift from the heavens, to be used only for restoration."
    ],
    meanings: [
      "The cosmos is calling you to seek deeper knowledge. An analytical approach or a flash of intuition will solve the riddle before you.",
      "Align your focus. Stop relying on brute force; instead, study the patterns of your environment and find the silver thread of elegance.",
      "A warning against overthinking. Do not get lost in the endless rifts of speculation; ground thy spirit in the practical world before casting thy spell.",
      "Thy magic is flowing strong. It is time to experiment with new ideas and study ancient lore that you previously deemed too difficult.",
      "A reminder to heal. Take a moment to replenish your inner reserves of magicka; an exhausted wizard is no match for the trials ahead."
    ]
  },
  Thief: {
    titles: [
      "The Ragged Flagon Shadow",
      "The Gilded Lockpicker",
      "The Whisper-Foot Rogue",
      "The Riften Cutpurse",
      "The Gray Fox Apparition",
      "The Silent Nightingale",
      "The Moon-Sugar Smuggler",
      "The Vault-Breaker of Markarth",
      "The Black-Market Broker",
      "The Poison-Blade Assassin",
      "The Sleight-of-Hand Trickster",
      "The Rooftop Prowler",
      "The Sewer-Dwelling Informant",
      "The Golden-Glow Saboteur",
      "The Guildmaster of Shadows"
    ],
    phrases: [
      "Walk in the shadows, servant of the night, for the darkness is thy sturdiest shield.",
      "A quick hand can rewrite thy entire history before the guards can draw their bows.",
      "The quietest footsteps carry the heaviest daggers. Avoid the torchlight, traveler.",
      "Thy cleverness is thy gold; let none possess thy keys or thy secret thoughts.",
      "Every lock is a challenge, every guard is a riddle, and every chest is a reward."
    ],
    quotes: [
      "A lock is merely a polite request to come back later.",
      "If they didn't want it stolen, they shouldn't have left it in my line of sight.",
      "Shadows are friendlier than kings. They never ask for taxes.",
      "A coin in the purse is worth ten in the vault of an unwatchful lord.",
      "The best escape route is the one they didn't know existed."
    ],
    lores: [
      "A master of the shadows who can slip through a dragon's hoard without waking a single scale. They speak in codes of whistles and chalk marks, leaving only a single black feather behind.",
      "A clever broker of secrets who deals in whispers and unwritten scrolls. They know every secret passage under the stone streets, slipping away before the alarm can be raised.",
      "A rogue from the docks of Windhelm who can pick any lock in under three seconds using nothing but a rusty nail and a whisper of prayer to Nocturnal.",
      "Exiled from their homeland, this thief has made a fortune selling counterfeit imperial seals and watered-down skooma to unsuspecting noblemen.",
      "A mysterious figure rumored to be the legendary Gray Fox, whose mask hides their true identity from the law and whose exploits are sung by every bards."
    ],
    meanings: [
      "Avoid direct confrontation. The solution to your current quest lies in tact, diplomacy, or a subtle lateral move.",
      "Trust your instincts and watch your back. Someone may be trying to bargain behind your back, or you might need to lock your secrets away tightly.",
      "A favorable time for stealthy ventures. Work quietly behind the scenes to achieve your goals, letting others take the spotlight while you secure the prize.",
      "A warning against greed. Do not reach for the biggest gold coin if it risks triggering the trap; sometimes a modest take is the true victory.",
      "An opportunity to escape a tight spot. Look for the hidden exit or the clever compromise that satisfies all parties without blood spilled."
    ]
  },
  Fate: {
    titles: [
      "The Elder Scroll Arbiter",
      "The Star-Orphan Herald",
      "The Void Voyager",
      "The Oblivion Wanderer",
      "The Thread-Weaver of Fate",
      "The Eclipse Sovereign",
      "The Cosmic Seer",
      "The Daedric Harbinger",
      "The Constellation Guide",
      "The Dragon-Break Anomalous",
      "The Wheel-Turner of Time",
      "The Sovereign of Shifting Sands",
      "The Dreamer of Mundus",
      "The Weaver of Prophecies",
      "The Oracle of the Void"
    ],
    phrases: [
      "A pact struck in starlight cannot be undone; embrace thy dark, beautiful gift.",
      "Embrace the delicious chaos, for order is but a brief dream of the unimaginative.",
      "The threads of destiny are shifting; let the wheel turn as the stars command.",
      "A draw of the card is a strike of the hammer upon the forge of thy future.",
      "Thy fate is a deep river, winding through mountains and valleys of ancient power."
    ],
    quotes: [
      "The future is not written in stone, but in the shifting dust of the stars.",
      "Every roll of the die is a whisper from the Madgod.",
      "The thread is spun, the knot is tied, the pattern is complete.",
      "We are but pieces on a board whose edges are lost in infinity.",
      "When the dragon breaks, time itself must choose its path."
    ],
    lores: [
      "An enigmatic entity whose existence transcends the mortal realm of Mundus. They appear in times of great uncertainty to shift the balances of power with a single word.",
      "A traveler of the infinite library of the cosmos, cataloging every possible timeline. Their mind is a kaleidoscope of past, present, and future events.",
      "Born under the rare alignment of the three moons, this oracle possesses the ability to see the thread of life binding all souls together.",
      "A mysterious wanderer who speaks only in riddles and plays with a deck of ivory cards. Some say they are an aspect of Lorkhan himself, testing mortal hearts.",
      "An ancient spirit that dwells in the deep rifts between the planes of Oblivion, whispering prophecies to those who dare to dream in the dark."
    ],
    meanings: [
      "An epoch-shifting transition is underway. Accept the unexpected and flow with the current of destiny.",
      "A card of ultimate balance. The choices you make today will reverberate across your future for many seasons to come.",
      "Chaos is thy ally today. Do not try to force a logical pattern onto a situation that demands creative, wild, and spontaneous responses.",
      "A cosmic alignment is favoring thy path. The obstacles that seemed insurmountable yesterday are dissolving like mist in the morning sun.",
      "Prepare for a profound revelation. A secret that has been hidden since the first era is about to be brought into the light of day."
    ]
  }
};

export function isProceduralId(id: string): boolean {
  return id.startsWith("proc_");
}

export function generateProceduralCard(id: string): Card {
  const parts = id.split("_");
  let archetype: "Warrior" | "Mage" | "Thief" | "Fate";
  let seedStr: string;

  if (parts.length >= 3 && ARCHETYPES.includes(parts[1] as any)) {
    archetype = parts[1] as any;
    seedStr = parts[2];
  } else {
    // Fallback: If ID is just proc_seed, determine archetype deterministically
    seedStr = parts[1] || id.replace("proc_", "");
    const tempRand = createDeterministicRandom(seedStr);
    archetype = ARCHETYPES[Math.floor(tempRand() * ARCHETYPES.length)];
  }

  const rand = createDeterministicRandom(seedStr);

  // Deterministically select Rarity
  const rarity = RARITIES[Math.floor(rand() * RARITIES.length)];

  const elements = ELEMENTS[archetype];
  
  // Deterministically select indexes
  const titleIdx = Math.floor(rand() * elements.titles.length);
  const phraseIdx = Math.floor(rand() * elements.phrases.length);
  const quoteIdx = Math.floor(rand() * elements.quotes.length);
  const loreIdx = Math.floor(rand() * elements.lores.length);
  const meaningIdx = Math.floor(rand() * elements.meanings.length);

  const name = elements.titles[titleIdx];
  const phrase = elements.phrases[phraseIdx];
  const quote = elements.quotes[quoteIdx];
  const lore = elements.lores[loreIdx];
  const meaning = elements.meanings[meaningIdx];

  // Select image deterministically
  const imagePool = IMAGE_POOLS[archetype];
  const image = imagePool[Math.floor(rand() * imagePool.length)];

  // Select rune deterministically
  const runePool = RUNES_MAP[archetype];
  const runeName = runePool[Math.floor(rand() * runePool.length)];

  // Select color deterministically based on rarity
  const color = COLOR_MAP[rarity];

  // Generate stats deterministically based on archetype
  let might = 20 + Math.floor(rand() * 40);
  let magic = 20 + Math.floor(rand() * 40);
  let stealth = 20 + Math.floor(rand() * 40);
  let fortune = 20 + Math.floor(rand() * 40);

  if (archetype === "Warrior") {
    might = 75 + Math.floor(rand() * 25);
    fortune = 50 + Math.floor(rand() * 40);
  } else if (archetype === "Mage") {
    magic = 75 + Math.floor(rand() * 25);
    fortune = 50 + Math.floor(rand() * 40);
  } else if (archetype === "Thief") {
    stealth = 75 + Math.floor(rand() * 25);
    fortune = 50 + Math.floor(rand() * 45);
  } else { // Fate
    fortune = 80 + Math.floor(rand() * 20);
    might = 40 + Math.floor(rand() * 45);
    magic = 40 + Math.floor(rand() * 45);
  }

  // Adjust statistics slightly based on rarity
  const boost = rarity === "Legendary" ? 15 : rarity === "Epic" ? 10 : rarity === "Rare" ? 5 : 0;
  might = Math.min(100, might + boost);
  magic = Math.min(100, magic + boost);
  stealth = Math.min(100, stealth + boost);
  fortune = Math.min(100, fortune + boost);

  const journalExercise = `Five-Year Duration Term (1,825-day mastery cycle): Grounding the lessons of ${name}. Detail how thou shalt integrate this ${archetype} alignment into thy daily discipline and long-term personal evolution over the next five years.`;
  const temperament = archetype === "Warrior" ? "Choleric (Fire - Yellow Bile)" : archetype === "Mage" ? "Melancholic (Earth - Black Bile)" : archetype === "Thief" ? "Sanguine (Air - Blood)" : "Phlegmatic (Water - Phlegm)";

  return {
    id,
    name,
    rarity,
    archetype,
    phrase,
    quote,
    lore,
    meaning,
    image,
    stats: { might, magic, stealth, fortune },
    color,
    runeName,
    journalExercise,
    temperament
  };
}
