import React, { useState } from "react";
import { 
  BookOpen, 
  Trophy, 
  Shield, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  Scale, 
  Check, 
  Sparkles, 
  Compass, 
  Info,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { Card } from "../data/cards";
import { isProceduralId, generateProceduralCard } from "../utils/procedural";
import { sfx } from "../utils/audio";

export interface HistoryEntry {
  timestamp: string; // ISO string
  cardId: string;
  cardName: string;
  cardRarity: "Common" | "Rare" | "Epic" | "Legendary";
  cardArchetype: string;
  question?: string;
}

interface QuestLogProps {
  history: HistoryEntry[];
  cardsPool: Card[];
  onSelectCard: (cardId: string) => void;
  onClearHistory: () => void;
}

// Lore-friendly runic archetype alignment analysis
function analyzeRunicPattern(cardA: Card, cardB: Card) {
  const archs = [cardA.archetype, cardB.archetype].sort();
  const key = archs.join(" + ");
  
  const patterns: Record<string, { title: string; desc: string }> = {
    "Warrior + Warrior": {
      title: "Dual Martial Resonance",
      desc: "A concentrated surge of martial energy. Thy path is direct and unyielding, relying on raw strength, physical courage, and unshakeable discipline. Seek solutions in decisive action."
    },
    "Mage + Warrior": {
      title: "The Spellsword's Synergy",
      desc: "The perfect fusion of steel and spellcraft. Balance physical force with mystical strategy. When blade and incantation act as one, no shield can withstand thy dual-pronged advance."
    },
    "Thief + Warrior": {
      title: "The Shadowblade's Cunning",
      desc: "Cunning meets physical might. Strike from the darkness when thy foe is unprepared, combining brutal impact with flawless timing. Evasion is thy shield; strength is thy hammer."
    },
    "Fate + Warrior": {
      title: "The Chosen Vanguard",
      desc: "Thy earthly struggles are woven directly into cosmic destiny. Thou art called to fight not just for mortal gains, but for a grander universal balance. Trust thy blade and thy guidance."
    },
    "Mage + Mage": {
      title: "The Archon's Convergence",
      desc: "An overwhelming concentration of intellect and willpower. Thy challenges require profound contemplation, study, and deep magical wisdom. Direct confrontations of mind are favored."
    },
    "Mage + Thief": {
      title: "The Arcane Trickster",
      desc: "Illusion meets shadow. Decoy thy opponents, blending clever spells with silent steps to bypass trials undetected. Thy victory lies in misdirection, intelligence, and swift maneuvers."
    },
    "Fate + Mage": {
      title: "The Cosmic Oracle",
      desc: "Direct attunement with the weavers of fate. Thy thoughts resonate with higher celestial patterns. Trust thy premonitions, read the stars, and look beyond the surface of current trials."
    },
    "Thief + Thief": {
      title: "Unseen Shadows",
      desc: "Total stealth and untraceable presence. Avoid direct conflict completely; thy success lies in absolute silence, leverage, and evasion. Walk softly and leave no record."
    },
    "Fate + Thief": {
      title: "The Fortune Gambler",
      desc: "Destiny smiles upon thy audacities. The shadows shield thy path while cosmic chance guides thy hand. Trust thy luck and seize fleeting opportunities that arise in sudden moments."
    },
    "Fate + Fate": {
      title: "Sovereign Web of Destiny",
      desc: "A powerful alignment of cosmic threads. Time and fortune are heavily bending around thy current journey. Surrender to the flow of fate; the universe is actively structuring thy doom."
    }
  };

  return patterns[key] || {
    title: "Runic Combination",
    desc: "An intricate combination of medieval alignments. Thy path requires balancing the distinct lessons of both archetypes to uncover hidden patterns in thy life."
  };
}

// Lore-friendly temperament alignment analysis
function analyzeTemperaments(tempA?: string, tempB?: string) {
  if (!tempA || !tempB) return null;
  const cleanA = tempA.split(" ")[0];
  const cleanB = tempB.split(" ")[0];
  
  if (cleanA === cleanB) {
    return `Pure ${cleanA} Alignment. An intense doubling of this psychological temperament. This indicates highly focused, intense energy, but beware of its specific extreme.`;
  }
  
  const set = new Set([cleanA, cleanB]);
  if (set.has("Choleric") && set.has("Melancholic")) {
    return "Fire & Earth. Choleric passion warmed by Melancholic contemplation, but Melancholic caution may stifle the fire. Strive to balance raw drive with deliberate preparation.";
  }
  if (set.has("Choleric") && set.has("Sanguine")) {
    return "Fire & Air. An extremely expressive and high-energy combination. Passion meets optimism, driving rapid progress and highly social alignments, though focus may drift.";
  }
  if (set.has("Choleric") && set.has("Phlegmatic")) {
    return "Fire & Water. Opposing elemental forces. The steam of action. Strive to balance assertive leadership with peaceful, receptive calm to prevent burnout.";
  }
  if (set.has("Melancholic") && set.has("Sanguine")) {
    return "Earth & Air. Deep introverted contemplation paired with light-hearted extroversion. A rich psychological spectrum. Seek depth but let yourself rejoice.";
  }
  if (set.has("Melancholic") && set.has("Phlegmatic")) {
    return "Earth & Water. Rich soil. Highly receptive, introverted, and deep-thinking alignment. Great for wisdom, research, and long-term grounding, though action is slower.";
  }
  if (set.has("Sanguine") && set.has("Phlegmatic")) {
    return "Air & Water. Gentle breeze over tranquil sea. Peace and social harmony are favored. A highly empathetic, calm, and conversational path.";
  }
  return `${cleanA} & ${cleanB} alignment. Seek harmony between these distinct cognitive profiles.`;
}

export const QuestLog: React.FC<QuestLogProps> = ({
  history,
  cardsPool,
  onSelectCard,
  onClearHistory,
}) => {
  const [subTab, setSubTab] = useState<"logs" | "compare">("logs");
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  // Discovery statistics
  const uniqueCardsDrawnIds: string[] = Array.from(new Set(history.map(h => h.cardId)));
  const signatureDrawnCount = uniqueCardsDrawnIds.filter(id => typeof id === "string" && !id.startsWith("proc_")).length;
  const totalCardsCount = cardsPool.length;
  const legendaryCount = history.filter(h => h.cardRarity === "Legendary").length;

  // Resolve unique drawn Card objects for comparison
  const uniqueDrawnCards: Card[] = uniqueCardsDrawnIds
    .map(id => {
      if (isProceduralId(id)) {
        return generateProceduralCard(id);
      }
      return cardsPool.find(c => c.id === id);
    })
    .filter((c): c is Card => !!c);

  // Format standard date
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Unknown Era";
    }
  };

  const handleCardSelectionToggle = (cardId: string) => {
    sfx.playShuffleTick(0, 1.2);
    setSelectedCompareIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length < 2) {
        return [...prev, cardId];
      }
      // If already at 2, replace the last selected one
      return [prev[0], cardId];
    });
  };

  const handleResetScales = () => {
    sfx.playShuffleTick(0, 1.0);
    setSelectedCompareIds([]);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      
      {/* ================= TITLE BAR ================= */}
      <div className="flex justify-between items-center border-b border-skyrim-gold/10 pb-2">
        <div className="flex items-center space-x-2 text-skyrim-gold-light">
          <BookOpen className="w-4 h-4 text-skyrim-gold" />
          <span className="font-serif text-xs font-semibold tracking-wider uppercase">
            Diary of Fates
          </span>
        </div>
        {history.length > 0 && subTab === "logs" && (
          <button 
            onClick={onClearHistory}
            className="text-[9px] text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1 uppercase tracking-wider font-mono bg-red-950/20 border border-red-900/20 px-2 py-0.5 rounded cursor-pointer"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>Burn Log</span>
          </button>
        )}
      </div>

      {/* ================= SUB TABS ================= */}
      <div className="flex bg-black/40 p-0.5 rounded border border-skyrim-gold/10 shrink-0">
        <button
          onClick={() => {
            sfx.playShuffleTick(0, 1.1);
            setSubTab("logs");
          }}
          className={`flex-1 py-1 text-center font-serif text-[10px] tracking-wider uppercase transition-all rounded-sm cursor-pointer ${
            subTab === "logs"
              ? "bg-[#1d1915] text-[#f1e5ac] border border-skyrim-gold/20 shadow-sm"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          }`}
        >
          Annals of Fate
        </button>
        <button
          onClick={() => {
            sfx.playShuffleTick(0, 1.1);
            setSubTab("compare");
          }}
          className={`flex-1 py-1 text-center font-serif text-[10px] tracking-wider uppercase transition-all rounded-sm cursor-pointer ${
            subTab === "compare"
              ? "bg-[#1d1915] text-[#f1e5ac] border border-skyrim-gold/20 shadow-sm"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          }`}
        >
          ⚖️ Comparison Scales
        </button>
      </div>

      {/* ================= VIEWPORT CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* TAB 1: LOGS VIEW */}
        {subTab === "logs" && (
          <div className="flex flex-col space-y-4">
            {/* ================= STATS GRID ================= */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              {/* Discovery percentage */}
              <div className="bg-black/35 rounded border border-skyrim-gold/5 p-2 flex flex-col items-center justify-center text-center">
                <Trophy className="w-3.5 h-3.5 text-skyrim-gold mb-0.5" />
                <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">Signatures</span>
                <span className="font-serif text-xs font-bold text-white mt-0.5">
                  {signatureDrawnCount} / {totalCardsCount}
                </span>
              </div>

              {/* Total Draws */}
              <div className="bg-black/35 rounded border border-skyrim-gold/5 p-2 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-3.5 h-3.5 text-skyrim-gold mb-0.5" />
                <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">Total Draws</span>
                <span className="font-serif text-xs font-bold text-white mt-0.5">
                  {history.length}
                </span>
              </div>

              {/* Legendary Draws */}
              <div className="bg-black/35 rounded border border-skyrim-gold/5 p-2 flex flex-col items-center justify-center text-center">
                <Shield className="w-3.5 h-3.5 text-amber-500 mb-0.5" />
                <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">Legendary</span>
                <span className="font-serif text-xs font-bold text-amber-400 mt-0.5">
                  {legendaryCount}
                </span>
              </div>
            </div>

            {/* ================= HISTORY LIST ================= */}
            <div 
              tabIndex={history.length > 0 ? 0 : undefined}
              role="region"
              aria-label="Diary of Fates Draw History Logs"
              className="flex flex-col space-y-2 max-h-64 overflow-y-auto pr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-skyrim-gold/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1612] rounded"
            >
              {history.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded border border-dashed border-skyrim-gold/10">
                  <p className="font-serif text-xs italic text-gray-500">
                    The parchment is empty. Draw thy first card to scribe thy destiny into the annals of time.
                  </p>
                </div>
              ) : (
                history.map((entry, idx) => {
                  const rarityColors = {
                    Common: "text-slate-400 border-slate-900/50 bg-slate-950/15",
                    Rare: "text-emerald-400 border-emerald-950/50 bg-emerald-950/15",
                    Epic: "text-indigo-400 border-indigo-950/50 bg-indigo-950/15",
                    Legendary: "text-amber-400 border-amber-950/50 bg-amber-950/15"
                  }[entry.cardRarity];

                  return (
                    <div 
                      key={idx}
                      onClick={() => onSelectCard(entry.cardId)}
                      className={`group flex items-center justify-between p-3 bg-black/35 rounded border border-skyrim-gold/10 hover:border-skyrim-gold/30 cursor-pointer transition-all ${rarityColors}`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="flex flex-col truncate">
                          <div className="flex items-center space-x-2">
                            <span className="font-serif text-xs font-bold tracking-wide text-white group-hover:text-skyrim-gold transition-colors truncate">
                              {entry.cardName}
                            </span>
                            <span className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/5 font-mono">
                              {entry.cardRarity}
                            </span>
                          </div>
                          {entry.question ? (
                            <span className="text-[10px] text-gray-400 font-serif italic truncate max-w-[280px]">
                              Query: "{entry.question}"
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-serif">
                              Drawn in quiet contemplation
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="flex flex-col items-end text-right font-mono text-[9px] text-gray-500">
                          <span className="flex items-center text-gray-400">
                            <Calendar className="w-2.5 h-2.5 mr-1" />
                            {formatDate(entry.timestamp)}
                          </span>
                          <span className="text-[8px] text-skyrim-gold/40">
                            {entry.cardArchetype}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-skyrim-gold/40 group-hover:text-skyrim-gold group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-center font-mono text-[9px] text-gray-500 uppercase tracking-widest">
              <span>* Fate records are bound to thy local chamber *</span>
            </div>
          </div>
        )}

        {/* TAB 2: COMPARISON SCALES VIEW */}
        {subTab === "compare" && (
          <div className="flex flex-col space-y-4">
            {uniqueDrawnCards.length < 2 ? (
              /* LOCKED / INSUFFICIENT DATA STATE */
              <div className="text-center py-10 px-4 bg-black/25 rounded border border-dashed border-skyrim-gold/15 flex flex-col items-center space-y-4">
                <div className="p-3 bg-skyrim-gold/5 border border-skyrim-gold/20 rounded-full text-skyrim-gold/60">
                  <Scale className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xs font-semibold tracking-widest text-skyrim-gold-light uppercase">
                  Comparison Scales Locked
                </h4>
                <p className="font-serif text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
                  Thou hast drawn only <strong className="text-white">{uniqueDrawnCards.length}</strong> unique card{uniqueDrawnCards.length === 1 ? "" : "s"} of fate. Draw at least two distinct cards from the altar to weigh their alignments, compare stats, and analyze archetypal resonances on the scales.
                </p>
              </div>
            ) : selectedCompareIds.length === 2 ? (
              /* ACTIVE COMPARISON RESULTS */
              (() => {
                const cardA = uniqueDrawnCards.find(c => c.id === selectedCompareIds[0]);
                const cardB = uniqueDrawnCards.find(c => c.id === selectedCompareIds[1]);
                if (!cardA || !cardB) return null;

                const runicPattern = analyzeRunicPattern(cardA, cardB);
                const temperamentAnalysis = analyzeTemperaments(cardA.temperament, cardB.temperament);

                const rarityColorClasses = (rarity: string) => {
                  switch (rarity) {
                    case "Legendary": return "text-amber-400 border-amber-950/40 bg-amber-950/10";
                    case "Epic": return "text-indigo-400 border-indigo-950/40 bg-indigo-950/10";
                    case "Rare": return "text-emerald-400 border-emerald-950/40 bg-emerald-950/10";
                    default: return "text-slate-400 border-slate-900/40 bg-slate-950/10";
                  }
                };

                const statAttributes: { key: keyof Card['stats']; label: string }[] = [
                  { key: "might", label: "Might" },
                  { key: "magic", label: "Magic" },
                  { key: "stealth", label: "Stealth" },
                  { key: "fortune", label: "Fortune" },
                ];

                return (
                  <div className="flex flex-col space-y-4 animate-fade-in">
                    
                    {/* Reset Selection Header */}
                    <div className="flex justify-between items-center bg-black/25 rounded p-2 border border-skyrim-gold/10">
                      <span className="font-serif text-[9px] text-skyrim-gold/60 uppercase tracking-widest font-bold">
                        Weighing Two Drawn Fates
                      </span>
                      <button
                        onClick={handleResetScales}
                        className="text-[9px] text-skyrim-gold hover:text-skyrim-gold-light transition-all flex items-center space-x-1 uppercase tracking-wider font-mono bg-skyrim-gold/5 hover:bg-skyrim-gold/10 border border-skyrim-gold/25 px-2.5 py-1 rounded-sm cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Reset Scales</span>
                      </button>
                    </div>

                    {/* SIDE-BY-SIDE HEADER CARDS */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* CARD A */}
                      <div className="bg-black/35 p-3 rounded border border-skyrim-gold/10 flex flex-col justify-between space-y-1 text-center">
                        <div>
                          <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">Left Altar</span>
                          <h4 className="font-serif text-xs font-bold text-white leading-tight truncate">
                            {cardA.name}
                          </h4>
                          <span className={`inline-block text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded border mt-1 ${rarityColorClasses(cardA.rarity)}`}>
                            {cardA.rarity}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <span className="font-mono text-[9px] text-skyrim-gold/75 block">
                            {cardA.archetype}
                          </span>
                          {cardA.temperament && (
                            <span className="text-[8px] text-gray-400 block font-serif italic mt-0.5 leading-tight">
                              {cardA.temperament.split(" ")[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CARD B */}
                      <div className="bg-black/35 p-3 rounded border border-skyrim-gold/10 flex flex-col justify-between space-y-1 text-center">
                        <div>
                          <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">Right Altar</span>
                          <h4 className="font-serif text-xs font-bold text-white leading-tight truncate">
                            {cardB.name}
                          </h4>
                          <span className={`inline-block text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded border mt-1 ${rarityColorClasses(cardB.rarity)}`}>
                            {cardB.rarity}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <span className="font-mono text-[9px] text-skyrim-gold/75 block">
                            {cardB.archetype}
                          </span>
                          {cardB.temperament && (
                            <span className="text-[8px] text-gray-400 block font-serif italic mt-0.5 leading-tight">
                              {cardB.temperament.split(" ")[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ATTRIBUTES COMPARISON CHART BARS */}
                    <div className="bg-black/30 rounded border border-skyrim-gold/5 p-3.5 space-y-3">
                      <div className="text-center pb-1 border-b border-white/5">
                        <span className="font-serif text-[10px] text-skyrim-gold/50 uppercase tracking-wider font-bold">
                          Attributes Alignment Comparison
                        </span>
                      </div>
                      
                      {statAttributes.map((attr) => {
                        const valA = cardA.stats[attr.key];
                        const valB = cardB.stats[attr.key];
                        const isADominant = valA > valB;
                        const isBDominant = valB > valA;

                        return (
                          <div key={attr.key} className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between font-mono text-[10px] text-gray-300">
                              
                              {/* Left card stat */}
                              <div className="w-[42%] flex items-center justify-end space-x-1.5">
                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden flex justify-end">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isADominant ? "bg-skyrim-gold shadow-[0_0_4px_rgba(212,175,55,0.3)]" : "bg-gray-600"
                                    }`}
                                    style={{ width: `${valA}%` }}
                                  />
                                </div>
                                <span className={`font-bold shrink-0 w-5 text-right ${isADominant ? "text-skyrim-gold font-black" : "text-gray-400"}`}>
                                  {valA}
                                </span>
                              </div>
                              
                              {/* Attribute Label */}
                              <span className="w-[16%] text-center text-gray-500 uppercase tracking-widest text-[8px] font-bold shrink-0">
                                {attr.label}
                              </span>
                              
                              {/* Right card stat */}
                              <div className="w-[42%] flex items-center justify-start space-x-1.5">
                                <span className={`font-bold shrink-0 w-5 text-left ${isBDominant ? "text-skyrim-gold font-black" : "text-gray-400"}`}>
                                  {valB}
                                </span>
                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isBDominant ? "bg-skyrim-gold shadow-[0_0_4px_rgba(212,175,55,0.3)]" : "bg-gray-600"
                                    }`}
                                    style={{ width: `${valB}%` }}
                                  />
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DYNAMIC LORE ANALYSIS */}
                    <div className="bg-black/35 rounded border border-skyrim-gold/10 p-3 space-y-2">
                      <div className="flex items-center space-x-1.5 text-skyrim-gold-light border-b border-white/5 pb-1">
                        <Sparkles className="w-3.5 h-3.5 text-skyrim-gold" />
                        <span className="font-serif text-[10px] font-semibold tracking-wider uppercase">
                          {runicPattern.title}
                        </span>
                      </div>
                      <p className="font-serif text-xs text-gray-300 leading-relaxed italic">
                        "{runicPattern.desc}"
                      </p>

                      {temperamentAnalysis && (
                        <div className="pt-2 border-t border-white/5 space-y-1">
                          <span className="font-mono text-[8px] text-skyrim-gold/50 uppercase tracking-widest block">
                            Temperament Synthesis
                          </span>
                          <p className="font-serif text-[11px] text-gray-400 leading-relaxed">
                            {temperamentAnalysis}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* COMPARATIVE MEANINGS */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed font-serif text-gray-400 italic">
                      <div className="bg-black/15 p-2 rounded border border-white/5">
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block not-italic mb-1 border-b border-white/5 pb-0.5">Left Meaning</span>
                        "{cardA.meaning.slice(0, 105)}..."
                      </div>
                      <div className="bg-black/15 p-2 rounded border border-white/5">
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block not-italic mb-1 border-b border-white/5 pb-0.5">Right Meaning</span>
                        "{cardB.meaning.slice(0, 105)}..."
                      </div>
                    </div>

                  </div>
                );
              })()
            ) : (
              /* CARD SELECTION SELECTOR GRID */
              <div className="flex flex-col space-y-3 animate-fade-in">
                
                {/* Information Header Banner */}
                <div className="bg-skyrim-gold/5 border border-skyrim-gold/25 rounded p-3 flex items-start space-x-2.5">
                  <Info className="w-4 h-4 text-skyrim-gold mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-serif text-[10px] text-skyrim-gold-light uppercase tracking-wider block font-bold">
                      The Scales of Balance
                    </span>
                    <p className="font-serif text-xs text-gray-400 leading-relaxed">
                      Select exactly <strong className="text-white">two unique fates</strong> from thy drawn pool below to contrast their primary attributes, archetypal resonance, and temperament alignments.
                    </p>
                  </div>
                </div>

                {/* Grid list of unique cards */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
                      Thy Discovered Fates Pool ({uniqueDrawnCards.length})
                    </span>
                    {selectedCompareIds.length > 0 && (
                      <span className="font-mono text-[9px] text-skyrim-gold uppercase">
                        Selected: {selectedCompareIds.length}/2
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {uniqueDrawnCards.map((card) => {
                      const isSelected = selectedCompareIds.includes(card.id);
                      const isSelectionFull = selectedCompareIds.length >= 2;
                      const isDisabled = !isSelected && isSelectionFull;

                      const rarityBorder = {
                        Common: "border-slate-900/30 bg-slate-950/10 hover:border-slate-500/20",
                        Rare: "border-emerald-950/30 bg-emerald-950/10 hover:border-emerald-500/20",
                        Epic: "border-indigo-950/30 bg-indigo-950/10 hover:border-indigo-500/20",
                        Legendary: "border-amber-950/30 bg-amber-950/10 hover:border-amber-500/20"
                      }[card.rarity];

                      return (
                        <button
                          key={card.id}
                          disabled={isDisabled}
                          onClick={() => handleCardSelectionToggle(card.id)}
                          className={`group flex items-center space-x-2.5 p-2 rounded border text-left transition-all ${
                            isSelected
                              ? "bg-skyrim-gold/15 border-skyrim-gold text-[#f1e5ac] shadow-[0_0_8px_rgba(212,175,55,0.08)]"
                              : isDisabled
                              ? "opacity-35 border-white/5 bg-transparent cursor-not-allowed"
                              : `bg-black/35 text-gray-400 hover:text-gray-200 ${rarityBorder}`
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
                            isSelected 
                              ? "border-skyrim-gold bg-skyrim-gold/25" 
                              : "border-gray-600 group-hover:border-gray-400"
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-skyrim-gold" />}
                          </div>

                          <div className="flex flex-col truncate">
                            <span className={`font-serif text-xs font-bold truncate leading-tight ${
                              isSelected ? "text-skyrim-gold-light" : "text-white group-hover:text-skyrim-gold/95"
                            }`}>
                              {card.name}
                            </span>
                            <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">
                              {card.archetype} • {card.rarity}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* State prompt if 1 selected */}
                {selectedCompareIds.length === 1 && (
                  <div className="text-center py-2 bg-black/20 border border-dashed border-skyrim-gold/10 rounded">
                    <span className="font-serif text-xs text-skyrim-gold/70 animate-pulse uppercase tracking-wider block">
                      ✦ Select one more fate to complete the scales ✦
                    </span>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
