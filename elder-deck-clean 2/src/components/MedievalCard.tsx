import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Swords, 
  Eye, 
  Flame, 
  Cookie, 
  Shield, 
  Skull, 
  Coins, 
  Wind, 
  Trophy, 
  Activity, 
  Sprout,
  Sparkles,
  Compass,
  Info
} from "lucide-react";
import { Card } from "../data/cards";
import { ProceduralSigil } from "./ProceduralSigil";

export interface ArchetypeLore {
  title: string;
  motto: string;
  description: string;
  affinity: string;
  element: string;
}

export const ARCHETYPE_LORE: Record<"Warrior" | "Mage" | "Thief" | "Fate", ArchetypeLore> = {
  Warrior: {
    title: "Order of the Iron Blade",
    motto: "Honor in Struggle, Glory in Valor",
    description: "Bound by blood and tempered in conflict, Warriors embody martial discipline and unyielding physical might. They stand as impenetrable bulwarks against chaos.",
    affinity: "Primary Focus: Might",
    element: "Element: Steel & Flame",
  },
  Mage: {
    title: "College of Whispering Stars",
    motto: "Knowledge Is the Eternal Arcana",
    description: "Scholars of esoteric winds and ethereal tides. Mages channel celestial magicka to weave prophecies, manipulate reality, and pierce the shroud of mortal perception.",
    affinity: "Primary Focus: Magic",
    element: "Element: Ether & Aether",
  },
  Thief: {
    title: "Guild of Silent Shadows",
    motto: "In Twilight We Reign Unseen",
    description: "Architects of subterfuge, subtle windfalls, and quiet precision. Operating in shadow's embrace, Thieves turn the wheel of fortune before the trap is sprung.",
    affinity: "Primary Focus: Stealth",
    element: "Element: Shadow & Wind",
  },
  Fate: {
    title: "Sovereign Loom of Destiny",
    motto: "As Written in the Elder Scroll, So Shall It Be",
    description: "Servants of cosmic karma and inescapable destiny. Fate cards transcend mortal prowess, exposing the delicate threads that bind all souls to time.",
    affinity: "Primary Focus: Fortune",
    element: "Element: Cosmos & Time",
  },
};

interface MedievalCardProps {
  card: Card;
  isFlipped: boolean; // true = face-up, false = face-down (card back)
  onClick?: () => void;
  interactive?: boolean;
}

// Map runic identifiers to Lucide Icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Eye,
  Flame,
  Cookie,
  Shield,
  Skull,
  Coins,
  Wind,
  Trophy,
  Activity,
  Sprout,
  Sparkles,
  Compass
};

export const MedievalCard: React.FC<MedievalCardProps> = ({
  card,
  isFlipped,
  onClick,
  interactive = true,
}) => {
  const [activeTab, setActiveTab] = React.useState<"art" | "lore">("art");
  const [tilt, setTilt] = React.useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [showArchetypeTooltip, setShowArchetypeTooltip] = React.useState(false);
  const RuneIcon = iconMap[card.runeName] || Sparkles;

  // Reset tab to art whenever the card is flipped face-down
  React.useEffect(() => {
    if (!isFlipped) {
      setActiveTab("art");
    }
  }, [isFlipped]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate subtle 3D tilt angles (up to +/- 8.5 degrees)
    const rotateX = -((y - centerY) / centerY) * 8.5;
    const rotateY = ((x - centerX) / centerX) * 8.5;

    // Specular shine percentage
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, shineX, shineY });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  };

  // Rarity color presets
  const rarityColors = {
    Common: {
      border: "border-slate-500/50",
      text: "text-slate-400",
      bg: "bg-slate-950/90",
      glow: "shadow-[0_0_15px_rgba(148,163,184,0.1)]",
      badge: "bg-slate-800 text-slate-300 border-slate-600"
    },
    Rare: {
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      bg: "bg-emerald-950/90",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      badge: "bg-emerald-900/50 text-emerald-300 border-emerald-600/50"
    },
    Epic: {
      border: "border-indigo-500/50",
      text: "text-indigo-400",
      bg: "bg-indigo-950/90",
      glow: "shadow-[0_0_15px_rgba(99,102,241,0.25)]",
      badge: "bg-indigo-900/50 text-indigo-300 border-indigo-600/50"
    },
    Legendary: {
      border: "border-amber-500/50",
      text: "text-amber-400",
      bg: "bg-amber-950/90",
      glow: "shadow-[0_0_20px_rgba(193,161,83,0.35)]",
      badge: "bg-amber-950/80 text-amber-300 border-amber-600"
    },
  }[card.rarity];

  // Archetype icon colors
  const runeGlowClasses: Record<string, string> = {
    amber: "runic-glow-amber",
    cyan: "runic-glow-cyan",
    indigo: "runic-glow-indigo",
    rose: "runic-glow-rose",
    violet: "runic-glow-indigo",
    emerald: "runic-glow-cyan",
    sky: "runic-glow-cyan",
    fuchsia: "runic-glow-rose",
    lime: "runic-glow-amber",
    red: "runic-glow-rose",
    slate: "runic-glow-amber",
    orange: "runic-glow-amber",
  };

  const runeGlowClass = runeGlowClasses[card.color] || "runic-glow-amber";

  return (
    <motion.div
      animate={isFlipped ? { y: -60, filter: "brightness(1.3) drop-shadow(0 0 40px rgba(212, 175, 55, 0.8))" } : { y: 0, filter: "brightness(1) drop-shadow(0 0 0px rgba(0,0,0,0))" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -28, scale: 0.92, filter: "brightness(1.25) drop-shadow(0 0 30px rgba(212, 175, 55, 0.45))" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "brightness(1) drop-shadow(0 0 0px rgba(0,0,0,0))" }}
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
        onClick={interactive && onClick ? onClick : undefined}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative w-80 h-[480px] perspective-1000 ${
          interactive ? "cursor-pointer" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: interactive && isHovered
            ? `perspective(1000px) scale(1.045) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
            : "perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)",
          filter: interactive && isHovered
            ? "drop-shadow(0 16px 36px rgba(212, 175, 55, 0.45)) drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))"
            : "drop-shadow(0 10px 25px rgba(0, 0, 0, 0.6))",
          transition: isHovered
            ? "transform 0.1s ease-out, filter 0.25s ease"
            : "transform 0.45s ease-out, filter 0.45s ease",
        }}
      >
      {/* Dynamic Specular Sheen Overlay */}
      {interactive && isHovered && (
        <div 
          className="absolute inset-0 z-30 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255, 235, 150, 0.22) 0%, rgba(212, 175, 55, 0.08) 45%, transparent 75%)`,
          }}
        />
      )}
      <div 
        className={`w-full h-full duration-700 transform-style-3d transition-transform relative ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
      >
        
        {/* ================= CARD BACK ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-skyrim-gold/30 shadow-2xl bg-skyrim-stone flex flex-col justify-between p-6">
          {/* Subtle gold ornate frame layout */}
          <div className="absolute inset-2 border border-skyrim-gold/20 rounded-xl pointer-events-none" />
          <div className="absolute inset-3 border border-skyrim-gold/10 rounded-lg pointer-events-none" />
          
          {/* Top ornate corner details */}
          <div className="flex justify-between text-skyrim-gold/40 font-serif text-xs tracking-widest pointer-events-none">
            <span>ELDER</span>
            <span>DECK</span>
          </div>

          {/* Runic Stone Back Illustration (Utilizing generated image) */}
          <div className="relative flex-1 my-4 rounded-lg overflow-hidden border border-skyrim-gold/15 flex items-center justify-center bg-black/40">
            <img 
              src="/src/assets/images/card_back_3d_1784953684442.jpg" 
              alt="Medieval Ancient Runic Deck Card Back" 
              className="absolute inset-0 w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-500"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay glow for interactive focus */}
            <div className="absolute inset-0 bg-gradient-to-t from-skyrim-dark/90 via-transparent to-skyrim-dark/40" />
            
            {/* Spinning/pulsating magical focal point */}
            <div className="relative flex flex-col items-center justify-center space-y-2 text-center z-10 p-4">
              <div className="w-16 h-16 rounded-full border border-skyrim-gold/40 flex items-center justify-center bg-skyrim-dark/80 shadow-[0_0_20px_rgba(193,161,83,0.2)] animate-pulse">
                <Compass className="w-8 h-8 text-skyrim-gold animate-spin" style={{ animationDuration: "25s" }} />
              </div>
              <span className="font-medieval text-skyrim-gold-light text-xs tracking-wider uppercase opacity-80">
                Tap to Reveal Fate
              </span>
            </div>
          </div>

          {/* Bottom ornate details */}
          <div className="flex justify-between items-center text-skyrim-gold/30 font-mono text-[9px] tracking-widest uppercase">
            <span>RUNIC SHUFFLE ACTIVE</span>
            <span>V.I</span>
          </div>
        </div>


        {/* ================= CARD FRONT ================= */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-sm overflow-hidden border-[12px] bg-[#eaddca] flex flex-col justify-between p-5 text-[#2a241e] shadow-2xl ring-1 ring-[#d4af37]"
          style={{ 
            borderColor: "#1a1612",
          }}
        >
          {/* Animated Rarity Border */}
          <motion.div
            className="absolute inset-0 z-20 border-2 rounded-sm pointer-events-none"
            animate={
              card.rarity === "Legendary"
                ? { borderColor: ["#d4af37", "#f1e5ac", "#d4af37"], boxShadow: ["0 0 10px #d4af37", "0 0 20px #f1e5ac", "0 0 10px #d4af37"] }
                : card.rarity === "Rare"
                ? { borderColor: ["#3b82f6", "#60a5fa", "#3b82f6"], boxShadow: ["0 0 10px #3b82f6", "0 0 20px #60a5fa", "0 0 10px #3b82f6"] }
                : { borderColor: "transparent" }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Decorative parchment thin inner line */}
          <div className="absolute inset-1 border border-[#2a241e] opacity-30 pointer-events-none" />

          {/* Top Header: Name and Rarity */}
          <div className="relative z-10 flex justify-between items-center border-b border-[#2a241e]/30 pb-1.5 w-full">
            <div className="flex flex-col">
              <div 
                className="relative inline-flex items-center space-x-1 cursor-help group/archetype"
                onMouseEnter={() => setShowArchetypeTooltip(true)}
                onMouseLeave={() => setShowArchetypeTooltip(false)}
              >
                <span className="font-serif text-[9px] tracking-[0.2em] text-[#8a7b62] uppercase font-bold hover:text-[#1a1612] transition-colors underline decoration-dotted underline-offset-2 decoration-[#8a7b62]/60">
                  {card.archetype}
                </span>
                <Info className="w-2.5 h-2.5 text-[#8a7b62]/70 group-hover/archetype:text-[#1a1612] transition-colors" />

                {/* Contextual Archetype Lore Tooltip */}
                <AnimatePresence>
                  {showArchetypeTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-1 z-50 w-64 p-3 bg-[#1a1612] text-[#eaddca] rounded-md border border-[#d4af37]/70 shadow-[0_12px_28px_rgba(0,0,0,0.85)] pointer-events-none backdrop-blur-md"
                    >
                      {(() => {
                        const info = ARCHETYPE_LORE[card.archetype as keyof typeof ARCHETYPE_LORE] || ARCHETYPE_LORE.Warrior;
                        return (
                          <>
                            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-1 mb-1.5">
                              <span className="font-serif text-[10px] font-bold text-[#d4af37] tracking-wider uppercase flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#d4af37]" />
                                {card.archetype} • {info.title}
                              </span>
                            </div>
                            <p className="font-serif italic text-[9.5px] text-[#c5b396] mb-1.5 leading-tight">
                              "{info.motto}"
                            </p>
                            <p className="font-serif text-[10px] text-[#eaddca]/90 leading-relaxed mb-2">
                              {info.description}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-[#d4af37]/20 text-[8.5px] font-mono text-[#d4af37]/80">
                              <span>{info.affinity}</span>
                              <span>{info.element}</span>
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <h2 className="font-serif text-base font-black tracking-wide text-[#1a1612]">
                {card.name}
              </h2>
            </div>
            
            <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border border-[#2a241e]/40 text-[#2a241e] font-mono">
              {card.rarity}
            </span>
          </div>

          {/* Modern Elegant Tab Bar inside Card Front */}
          <div className="relative z-10 flex justify-center space-x-1 mt-1.5 mb-1.5 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("art");
              }}
              className={`flex-1 py-1 text-[9px] font-serif tracking-[0.2em] uppercase transition-all duration-200 border cursor-pointer font-bold ${
                activeTab === "art"
                  ? "bg-[#1a1612] text-[#eaddca] border-[#1a1612]"
                  : "bg-transparent text-[#2a241e] border-[#2a241e]/15 hover:border-[#2a241e]/40"
              }`}
            >
              🎨 Sigil Art
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("lore");
              }}
              className={`flex-1 py-1 text-[9px] font-serif tracking-[0.2em] uppercase transition-all duration-200 border cursor-pointer font-bold ${
                activeTab === "lore"
                  ? "bg-[#1a1612] text-[#eaddca] border-[#1a1612]"
                  : "bg-transparent text-[#2a241e] border-[#2a241e]/15 hover:border-[#2a241e]/40"
              }`}
            >
              📜 Chronicles
            </button>
          </div>

          {activeTab === "art" ? (
            <>
              {/* Central Art: Hand-painted Medieval Illustration Window or Procedural Sigil */}
              <div className="relative flex-1 my-2 rounded-sm overflow-hidden border-2 border-[#2a241e] bg-[#0f0d0b] shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] flex items-center justify-center min-h-[180px]">
                {card.id.startsWith("proc_") ? (
                  <ProceduralSigil card={card} className="w-full h-full object-cover" />
                ) : (
                  /* The actual medieval cat illustration for signature cards */
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Overlay border lines on the image */}
                <div className="absolute inset-0 border border-[#2a241e]/15 pointer-events-none" />
                
                {/* Beautiful gold seal floating medallion */}
                <div className="absolute bottom-2 right-2 p-1 bg-[#eaddca] border border-[#2a241e] shadow-md flex items-center justify-center rounded-sm">
                  <RuneIcon className="w-3.5 h-3.5 text-[#2a241e]" />
                </div>

                {/* Glowing effect indicator */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Prophecy short text on Parchment Paper */}
              <div className="relative z-10 text-center px-3 py-2 bg-black/5 rounded border border-[#2a241e]/15 mb-3 min-h-[56px] flex items-center justify-center">
                <p className="font-serif italic text-xs text-[#3d3228] leading-relaxed">
                  "{card.phrase}"
                </p>
              </div>
            </>
          ) : (
            /* Central Chronicles & Prophecy Content (Scrollable Parchment Paper) */
            <div 
              tabIndex={0}
              role="region"
              aria-label={`Ancient Chronicles and Prophecy Meaning for ${card.name}`}
              className="relative flex-1 my-2 rounded-sm border-2 border-[#2a241e] bg-[#f5eccd] shadow-[inset_0_0_12px_rgba(0,0,0,0.15)] flex flex-col p-3 overflow-y-auto overflow-x-hidden max-h-[280px] select-text focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1612]"
            >
              {/* Scroll decorative background detail */}
              <div className="absolute inset-0.5 border border-[#2a241e]/10 rounded-sm pointer-events-none" />
              
              <div className="relative z-10 flex flex-col space-y-2.5">
                <div className="text-center">
                  <span className="font-serif text-[10px] tracking-[0.25em] text-[#8a7b62] font-black uppercase block">
                    Ancient Chronicles
                  </span>
                  <div className="w-12 h-[1px] bg-[#2a241e]/30 mx-auto mt-1" />
                </div>

                {/* Quote from the card */}
                <p className="font-serif italic text-[11px] text-[#3d3228] leading-relaxed text-center px-1">
                  "{card.quote}"
                </p>

                {/* Lore Paragraph */}
                <p className="font-serif text-[11px] text-[#2a241e]/90 leading-relaxed text-justify px-1 first-letter:text-2xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:font-serif">
                  {card.lore}
                </p>

                {/* Divider for Prophecy Meaning */}
                <div className="flex items-center justify-center space-x-1.5 py-1">
                  <div className="w-6 h-[1px] bg-[#2a241e]/20" />
                  <span className="font-serif text-[8px] tracking-[0.2em] text-[#8a7b62] font-black uppercase">
                    Prophecy Meaning
                  </span>
                  <div className="w-6 h-[1px] bg-[#2a241e]/20" />
                </div>

                {/* Meaning Text */}
                <p className="font-serif text-[10.5px] text-[#2a241e] leading-relaxed text-center px-2 italic bg-[#1a1612]/5 py-1.5 border border-[#2a241e]/10">
                  {card.meaning}
                </p>
              </div>
            </div>
          )}

          {/* Core Attribute Bars (Styled as Elegant Hand-Drawn Sepia Meters) */}
          <div className="relative z-10 space-y-1.5 border-t border-[#2a241e]/20 pt-2.5">
            {/* Might Bar */}
            <div className="flex flex-col">
              <div className="flex justify-between text-[#8a7b62] font-mono text-[8px] uppercase font-bold">
                <span>Might</span>
                <span className="text-[#2a241e]">{card.stats.might}</span>
              </div>
              <div className="h-1.5 w-full bg-black/10 rounded-none overflow-hidden border border-[#2a241e]/20">
                <div 
                  className="h-full bg-[#2a241e]"
                  style={{ width: `${card.stats.might}%` }}
                />
              </div>
            </div>

            {/* Magic Bar */}
            <div className="flex flex-col">
              <div className="flex justify-between text-[#8a7b62] font-mono text-[8px] uppercase font-bold">
                <span>Magic</span>
                <span className="text-[#2a241e]">{card.stats.magic}</span>
              </div>
              <div className="h-1.5 w-full bg-black/10 rounded-none overflow-hidden border border-[#2a241e]/20">
                <div 
                  className="h-full bg-[#3d3228]"
                  style={{ width: `${card.stats.magic}%` }}
                />
              </div>
            </div>

            {/* Stealth Bar */}
            <div className="flex flex-col">
              <div className="flex justify-between text-[#8a7b62] font-mono text-[8px] uppercase font-bold">
                <span>Stealth</span>
                <span className="text-[#2a241e]">{card.stats.stealth}</span>
              </div>
              <div className="h-1.5 w-full bg-black/10 rounded-none overflow-hidden border border-[#2a241e]/20">
                <div 
                  className="h-full bg-[#1a1612]"
                  style={{ width: `${card.stats.stealth}%` }}
                />
              </div>
            </div>

            {/* Fortune Bar */}
            <div className="flex flex-col">
              <div className="flex justify-between text-[#8a7b62] font-mono text-[8px] uppercase font-bold">
                <span>Fortune</span>
                <span className="text-[#2a241e]">{card.stats.fortune}</span>
              </div>
              <div className="h-1.5 w-full bg-black/10 rounded-none overflow-hidden border border-[#2a241e]/20">
                <div 
                  className="h-full bg-[#8a7b62]"
                  style={{ width: `${card.stats.fortune}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="relative z-10 flex justify-between items-center font-mono text-[8px] text-[#8a7b62] mt-2 pt-1 uppercase border-t border-[#2a241e]/10">
            <span>IMPERIAL DECK</span>
            <span>SIGIL #{card.id.substring(0, 4)}</span>
          </div>

        </div>

      </div>
    </motion.div>
    </motion.div>
  );
};
