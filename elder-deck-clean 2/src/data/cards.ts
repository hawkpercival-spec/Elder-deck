export interface Card {
  id: string;
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  archetype: "Warrior" | "Mage" | "Thief" | "Fate";
  phrase: string;
  quote: string;
  lore: string;
  meaning: string;
  image: string;
  stats: {
    might: number;
    magic: number;
    stealth: number;
    fortune: number;
  };
  color: string; // Tailwind color class prefix (e.g. "amber", "indigo", "cyan")
  runeName: string; // Icon identifier
  journalExercise?: string;
  temperament?: string;
}

export const MEDIEVAL_DECK: Card[] = [
  {
    id: "dragonborn",
    name: "The Dragonborn",
    rarity: "Legendary",
    archetype: "Warrior",
    phrase: "Thy voice shall shake the foundations of the world; roar, or be silenced.",
    quote: "Dovahkiin, Dovahkiin, naal ok zin los vahriin...",
    lore: "Born with the blood of dragons, thy fate is forged in fire. The ancient prophecies of the Elder Scrolls speak of thy coming. Take up thy blade and speak thy Truth to the heavens.",
    meaning: "Drawing this card signifies a calling to awaken thy inner strength. Your voice carries weight—use it to defend the weak or shatter barriers. But beware: raw power without purpose invites destruction. Speak with honor, or be consumed by the fire of thy own passions.",
    image: "/src/assets/images/dragonborn_cat_1784953695507.jpg",
    stats: { might: 98, magic: 85, stealth: 30, fortune: 90 },
    color: "amber",
    runeName: "Swords",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Power without purpose breeds chaos. Describe how thy voice and strength shall be cultivated and tempered over the next five years without burning those around thee.",
    temperament: "Choleric (Fire - Yellow Bile)"
  },
  {
    id: "nightingale",
    name: "The Nightingale",
    rarity: "Epic",
    archetype: "Thief",
    phrase: "Walk in the shadows, servant of the night, for the darkness is thy shield.",
    quote: "To the shadow we return, from the shadow we arose.",
    lore: "Sworn to the Lady Nocturnal, thy footsteps leave no sound, and thy eyes pierce the deepest dark. Let the moon guide thy blade and the silence protect thy secret deeds.",
    meaning: "The Nightingale whispers of secrets, discretion, and unseen progress. Do not rush into the glare of public trial; instead, work diligently in the quiet dark. Trust thy intuition and let the silent shadows protect thy delicate schemes from prying eyes.",
    image: "/src/assets/images/nightingale_cat_1784953707351.jpg",
    stats: { might: 55, magic: 50, stealth: 98, fortune: 80 },
    color: "indigo",
    runeName: "Eye",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Thy true progress often happens unseen. Outline a five-year covert labor or hidden goal that will mature quietly in the shadows before stepping into the light.",
    temperament: "Melancholic (Earth - Black Bile)"
  },
  {
    id: "archmage",
    name: "The Archmage",
    rarity: "Epic",
    archetype: "Mage",
    phrase: "The winds of magicka blow fierce; bend them to thy will, or burn in their flame.",
    quote: "What you learn here will last you a lifetime. Several, if you're talented.",
    lore: "Master of the arcane arts, thy hands command the storm, the flame, and the barrier of time. Knowledge is thy sword, and the cosmos is thy study.",
    meaning: "The sign of deep scholarship and intellectual mastery. Thou art being tested on thy focus. Learn to channel thy chaotic energies into precise outcomes. Study the patterns of the universe, but do not lose thy humanity to the endless cold void of theory.",
    image: "/src/assets/images/archmage_cat_1784953718244.jpg",
    stats: { might: 35, magic: 99, stealth: 40, fortune: 75 },
    color: "cyan",
    runeName: "Flame",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Thy intellect is a double-edged sword. Establish a five-year scholarly curriculum to master thy absolute mental focus and preserve warm human empathy.",
    temperament: "Melancholic (Earth - Black Bile)"
  },
  {
    id: "sweetroll",
    name: "The Sweetroll Burglar",
    rarity: "Common",
    archetype: "Thief",
    phrase: "Let none steal thy sweetroll, for a warrior's hunger is a sacred oath.",
    quote: "Let me guess... someone stole your sweetroll?",
    lore: "A whimsical trickster who thrives on petty chaos and warm pastries. Though guards mock thy pursuits, thou knowest that the sweetest victories are those stolen from under the nose of authority.",
    meaning: "A lighthearted reminder to guard thy joy and cherish the sweet fruits of thy daily labor. Do not let cynical guards or trivial worries steal thy happiness. Go forth and claim thy small, delightful rewards with a mischievous grin.",
    image: "/src/assets/images/sweetroll_cat_1784953729723.jpg",
    stats: { might: 20, magic: 15, stealth: 88, fortune: 95 },
    color: "orange",
    runeName: "Cookie",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Guarding thy daily joy is a sacred discipline. Detail how thou shalt cultivate daily sweetness and protect thy lighthearted triumphs over the next five years.",
    temperament: "Sanguine (Air - Blood)"
  },
  {
    id: "arrow_knee",
    name: "The Knee-Bound Sentry",
    rarity: "Common",
    archetype: "Warrior",
    phrase: "A glorious past behind thee, a sturdy shield before thee. Watch the skies, traveler.",
    quote: "I used to be an adventurer like you, then I took an arrow in the knee.",
    lore: "A retired champion bound to guard the town gates. Though the days of dungeon-crawling have passed, thy wisdom and vigilance protect the innocent from dragonfire and highwaymen.",
    meaning: "This card represents transition, vigilance, and the wisdom of limitations. An unexpected arrow may have halted thy wild wanderings, but a new chapter of guardship and protective service has begun. Stand firm at the gates of thy domain and watch the horizon.",
    image: "/src/assets/images/sentry_cat_1784591364459.jpg",
    stats: { might: 75, magic: 10, stealth: 25, fortune: 40 },
    color: "slate",
    runeName: "Shield",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): A halt in wanderings is the start of a deep watch. Outline a five-year commitment to standing firm, holding boundaries, and protecting new ground.",
    temperament: "Phlegmatic (Water - Phlegm)"
  },
  {
    id: "assassin",
    name: "The Dark Speaker",
    rarity: "Epic",
    archetype: "Thief",
    phrase: "Silence, sibling. The Night Mother whispers of shadows, gold, and cold steel.",
    quote: "We know.",
    lore: "A shadow in the sanctuary, a cold blade in the dark. Thou art the instrument of Sithis, executing the contracts of the realm with cold, flawless precision.",
    meaning: "A symbol of swift action, calculated risk, and absolute finality. The Speaker demands that you cut away what is obsolete or toxic in thy life without hesitation. Execute thy plans with quiet resolve, and let thy results speak for themselves.",
    image: "/src/assets/images/dark_speaker_cat_1784591393303.jpg",
    stats: { might: 65, magic: 35, stealth: 96, fortune: 65 },
    color: "rose",
    runeName: "Skull",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): To welcome the new, the old must be pruned. Design a five-year schedule for permanently purging obsolete habits and toxic bonds with quiet resolve.",
    temperament: "Melancholic (Earth - Black Bile)"
  },
  {
    id: "skooma",
    name: "The Moon-Sugar Merchant",
    rarity: "Rare",
    archetype: "Thief",
    phrase: "High risks yield high rewards. Sip from the chalice, but watch thy coinpurse.",
    quote: "Khajiit has wares, if you have coin.",
    lore: "A cunning traveler from the southern sands, purveyor of rare elixirs and forbidden sweetmeats. Trust is a luxury, but opportunity waits for those who have the coin to spare.",
    meaning: "The Merchant cautions against deceptive allurements and false short-cuts. Although sweet fortunes are promised, verify the scales before you barter. Tread carefully around intoxicating deals, and never trust a silver tongue without counting thy gold first.",
    image: "/src/assets/images/merchant_cat_1784591372857.jpg",
    stats: { might: 30, magic: 45, stealth: 85, fortune: 90 },
    color: "violet",
    runeName: "Coins",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Deceptive shortcuts test thy wisdom. Formulate a five-year financial and ethical ledger to weigh scales accurately and avoid intoxicating illusions.",
    temperament: "Sanguine (Air - Blood)"
  },
  {
    id: "greybeard",
    name: "The High Greybeard",
    rarity: "Rare",
    archetype: "Mage",
    phrase: "In deep silence, the Voice gathers strength. Speak only when the mountain is ready.",
    quote: "Lok, Vah Koor. Clear Skies.",
    lore: "A silent monk dwelling atop the freezing, seven-thousand steps of High Hrothgar. By studying the Way of the Voice, thy whispers can shatter shields and thy shouts can clear the skies.",
    meaning: "The ultimate card of meditation and quiet reserve. Thy voice possesses immense strength, yet the greatest power lies in knowing when not to speak. Retreat to the mountain peak of thy mind, find thy inner calm, and speak only to bring absolute clarity.",
    image: "/src/assets/images/greybeard_cat_1784591401650.jpg",
    stats: { might: 45, magic: 95, stealth: 15, fortune: 65 },
    color: "emerald",
    runeName: "Wind",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Deep silence gathers true power. Commit to a five-year meditative retreat schedule, climbing the mental mountain and speaking only when absolute clarity demands it.",
    temperament: "Phlegmatic (Water - Phlegm)"
  },
  {
    id: "frost_troll",
    name: "The Frost Troll",
    rarity: "Rare",
    archetype: "Warrior",
    phrase: "A brutal barrier blocketh thy path. Unleash thy fire to melt the frozen claw.",
    quote: "A roaring blizzard, a flash of white fur, and then—the jaws of the mountain.",
    lore: "A savage beast of the snowy peaks, possessing endless regeneration and terrifying fury. Only the flame can halt its quickening flesh. Face it with courage, or prepare to flee.",
    meaning: "A formidable obstacle looms on thy horizon, regenerating its strength if left unaddressed. Brute force alone will fail; you must find its precise weakness—thy fire of passion, creativity, or logic—to melt the challenge away once and for all.",
    image: "/src/assets/images/frost_troll_cat_1784591410273.jpg",
    stats: { might: 92, magic: 10, stealth: 10, fortune: 30 },
    color: "sky",
    runeName: "Trophy",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Regenerating obstacles demand precise strategy. Plan a five-year campaign to harness thy inner fire and dissolve persistent barriers once and for all.",
    temperament: "Choleric (Fire - Yellow Bile)"
  },
  {
    id: "madgod",
    name: "The Mad Prince Sheogorath",
    rarity: "Legendary",
    archetype: "Fate",
    phrase: "Embrace the chaos, for order is but a dull dream of the unimaginative.",
    quote: "Cheese! Cheese for everyone!",
    lore: "The Daedric Lord of Madness, whose whims change like the shifting winds of the Shivering Isles. A draw of this card portends a day of chaotic fortune, bizarre encounters, and unexpected luck.",
    meaning: "An omen of delightful absurdity and unexpected turns! When the Mad Prince commands, old logic is thrown into the sea. Embrace the bizarre, find humor in chaos, and remember that sometimes a giant slice of cheese is the exact answer you needed.",
    image: "/src/assets/images/sheogorath_cat_1784591380989.jpg",
    stats: { might: 50, magic: 95, stealth: 55, fortune: 100 },
    color: "fuchsia",
    runeName: "Activity",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Order is a dull dream; creative chaos liberates the soul. Chart a five-year practice of playful spontaneity, humor, and embracing delightful absurdity.",
    temperament: "Sanguine (Air - Blood)"
  },
  {
    id: "nirnroot",
    name: "The Crimson Nirnroot",
    rarity: "Rare",
    archetype: "Mage",
    phrase: "A hidden harmony sings in the cavernous depths. Seek the chime in the dark.",
    quote: "A high-pitched chime echoes softly in the cavernous deep...",
    lore: "A rare and resonant plant found only in the pitch-black caverns of Blackreach. Its metallic chime has driven many alchemists mad, yet its glowing sap holds the secrets of ultimate rejuvenation.",
    meaning: "A card of discovery, deep listening, and hidden treasures. A subtle chime is ringing in the quiet dark corners of thy life. Tune thy senses to the quiet hums of opportunity that others overlook; thy finest breakthroughs are hidden deep within.",
    image: "/src/assets/images/nirnroot_cat_1784591430148.jpg",
    stats: { might: 10, magic: 90, stealth: 75, fortune: 55 },
    color: "lime",
    runeName: "Sprout",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Subterranean chimes call for deep listening. Design a five-year exploration of subconscious talents and hidden breakthroughs waiting in the dark.",
    temperament: "Melancholic (Earth - Black Bile)"
  },
  {
    id: "daedra",
    name: "The Daedric Sovereign",
    rarity: "Legendary",
    archetype: "Fate",
    phrase: "A pact struck in starlight cannot be undone. Embrace thy dark gift, mortal.",
    quote: "A mortal spark in my endless void... enter, tiny creature.",
    lore: "An ancient, god-like being from the planes of Oblivion. They offer power beyond imagination, but their artifacts always demand a terrible price. Steel thy resolve, for the pact is signed.",
    meaning: "A heavy, double-edged omen of ambition, contract, and high stakes. You have the power to manifest thy greatest desires, but a spiritual price must be paid. Weigh thy compromises carefully; ensure thy soul's freedom is never traded for transient power.",
    image: "/src/assets/images/daedra_cat_1784591418782.jpg",
    stats: { might: 88, magic: 92, stealth: 45, fortune: 70 },
    color: "red",
    runeName: "Skull",
    journalExercise: "Five-Year Duration Term (1,825-day mastery cycle): Starlight pacts demand soul-bound clarity. Outline a five-year covenant to pursue high ambition while strictly safeguarding thy spiritual freedom.",
    temperament: "Choleric (Fire - Yellow Bile)"
  }
];

export const GAME_TIPS = [
  "Tip: Some guards claim they were once adventurers like you, until they suffered a knee-related injury.",
  "Tip: Sweetrolls are highly valued. Secure them from sneaky burglars.",
  "Tip: The Night Mother hears all. Silence is golden, but contract work is paid in gold.",
  "Tip: If you encounter a Frost Troll on the steps, summon thy fire spells immediately.",
  "Tip: Khajiit has wares, if you have coin.",
  "Tip: Do not eat the Crimson Nirnroot directly; its chime is best distilled into a master potion.",
  "Tip: High Hrothgar has 7,000 steps. Pack warm boots and watch for mountain wolves.",
  "Tip: Never steal cheese in front of a giant. They have excellent throwing arms.",
  "Tip: The Madgod Sheogorath loves cheese, tea, and delicate states of mind."
];

// Algorithmic Fortune Generator
export function generateProphecy(card: Card, question: string): {
  omen: string;
  trial: string;
  destiny: string;
} {
  const q = question.toLowerCase().trim();
  
  // Custom responses based on question keywords
  let omen = "";
  let trial = "";
  let destiny = "";

  const isLove = q.includes("love") || q.includes("relationship") || q.includes("marry") || q.includes("friend");
  const isDanger = q.includes("danger") || q.includes("fight") || q.includes("die") || q.includes("survive") || q.includes("troll") || q.includes("dragon");
  const isGold = q.includes("gold") || q.includes("coin") || q.includes("money") || q.includes("rich") || q.includes("buy") || q.includes("steal");
  const isQuest = q.includes("quest") || q.includes("journey") || q.includes("travel") || q.includes("find") || q.includes("where");

  // Phase 1: The Omen (based on card archetype and question)
  if (isLove) {
    omen = `The runes of ${card.name} reveal a tapestry woven with delicate threads. `;
    if (card.archetype === "Thief") {
      omen += "A sly glance in the shadow of the tavern hearth holds more truth than formal courtships.";
    } else if (card.archetype === "Warrior") {
      omen += "A heart of iron beats fierce, yet even the sturdiest shield can be pierced by a tender gaze.";
    } else if (card.archetype === "Mage") {
      omen += "An ethereal binding of souls is forming, written in the starlight of Aetherius.";
    } else {
      omen += "A chaotic spark ignites. The Madgod mocks thy serious inquiries, yet smiles upon thy devotion.";
    }
  } else if (isDanger) {
    omen = `The dark warning of ${card.name} echoes across the frozen peaks. `;
    if (card.stats.might > 80) {
      omen += "Thy physical vessel is robust. A glorious combat awaits, and the bards shall sing of this clash.";
    } else if (card.stats.stealth > 80) {
      omen += "Face them not in open combat. The shadows call for a silent arrow from the bushes.";
    } else {
      omen += "The threat is grave. Rely on thy quick wits or a warding spell, for steel alone may fail thee.";
    }
  } else if (isGold) {
    omen = `The shining scales of ${card.name} hint at transactions and hidden vaults. `;
    if (card.id === "sweetroll" || card.id === "skooma") {
      omen += "A grand opportunity for wealth presents itself, though the guards may ask questions later.";
    } else if (card.stats.fortune > 80) {
      omen += "The divines favor thy coinpurse. A rich hoard or a generous patron lies just ahead.";
    } else {
      omen += "Wealth must be hammered from raw iron. Seek the forge and sweat for thy gold today.";
    }
  } else if (isQuest) {
    omen = `The compass of ${card.name} points toward an untrodden path. `;
    omen += `Thy journey to find answers will lead thee through ${card.rarity === "Legendary" ? "ancient dragon ruins" : "misty forest valleys"}.`;
  } else {
    // Default general prophecy
    omen = `In the shadow of ${card.name}, the ancient whispers of the scroll begin to take shape. `;
    omen += `A card of ${card.rarity} power, drawing thy spirit toward the path of the ${card.archetype}.`;
  }

  // Phase 2: The Trial (based on card stats and specific card features)
  trial = `Thy current test: `;
  if (card.stats.might > card.stats.magic && card.stats.might > card.stats.stealth) {
    trial += `To channel thy brute strength (${card.stats.might} Might) and confront thy obstacles head-on. Let none doubt thy heavy blade or thy stout iron shield.`;
  } else if (card.stats.magic > card.stats.stealth) {
    trial += `To master the quiet focus (${card.stats.magic} Magic) required to weave spells of fire, frost, or restoration. Read the old books and trust the ancient starlight.`;
  } else {
    trial += `To tread lightly with thy cunning (${card.stats.stealth} Stealth). The quietest footsteps carry the heaviest daggers. Avoid the light of the torches.`;
  }

  // Phase 3: The Destiny (A final poetic medieval resolution)
  destiny = `As written in the Elder Scroll: "${card.phrase}" `;
  if (card.stats.fortune > 80) {
    destiny += "The stars align in a golden crown of luck. Proceed with absolute confidence, traveler.";
  } else if (card.stats.might > 75) {
    destiny += "Victory is carved in steel and blood. Draw thy steel and let thy roar echo across Skyrim.";
  } else {
    destiny += "Patience, traveler. The mists of the high mountains shall clear when the timing is right.";
  }

  return { omen, trial, destiny };
}

export const FORTUNES = {
  Warrior: [
    "A steel blade is only as sharp as the resolve of the warrior who wields it; stand firm.",
    "The stars foretell of a fierce struggle today, yet thy shield shall not fail thee if thy heart is true.",
    "Victory favors the brave; let the drums of battle steady thy racing heart.",
    "Though the path ahead is fraught with conflict, thy inner strength shall shatter any obstacle.",
    "A true champion knows when to strike and when to guard; patience is thy finest armor.",
    "The ash of dragons shall pave the road of thy glory; let thy courage burn brighter than their fire."
  ],
  Mage: [
    "The winds of magic blow in thy favor today, carrying whispers of ancient, forgotten spells.",
    "An unseen spark of arcane power guides thy hand; seek the secrets hidden in plain sight.",
    "Knowledge is the ultimate shield; let thy intellect illuminate the darkest corners of thy journey.",
    "A mystical alignment of the stars grants thee clarity of mind and bounds of boundless mana.",
    "Look beyond the veil of physical reality, for the ether holds the answers thou art searching for.",
    "The runes of the high elves shimmer with power, predicting a day of profound revelation."
  ],
  Thief: [
    "Walk in the shadows, for the light reveals too much to those who would seek thy capture.",
    "The sweetest plunder is often found in the places guarded by the heaviest of locks.",
    "Keep thy footing light and thy wits sharp, and no vault shall remain sealed before thee.",
    "A quiet whisper in the dark is more powerful than the loudest battle cry; speak softly today.",
    "The night is thy closest companion; let the moon shield thy covert designs from prying eyes.",
    "Fortune smiles upon the daring and the silent; grasp thy luck before the dawn betrays thee."
  ],
  Fate: [
    "The tapestry of thy destiny is woven with threads of silver and gold; trust in the grand design.",
    "Every choice is a fork in the road of eternity; look to the stars to guide thy steps.",
    "A sudden wind of change approaches, ready to scatter thy doubts into the cosmos.",
    "The wheel of fortune turns once more, bringing unexpected blessings from the heavens.",
    "What is written in the heavens cannot be undone by mortal hands; accept thy path with grace.",
    "The universe operates in perfect, silent alignment; thy present trials are but steps toward thy ascension."
  ]
};

