import React, { useState } from "react";
import { Scroll, Calendar, Trash2, ChevronDown, ChevronUp, Search, Sparkles, AlertCircle } from "lucide-react";
import { sfx } from "../utils/audio";

export interface SavedProphecy {
  id: string;
  timestamp: string; // ISO string
  question: string;
  cardId: string;
  cardName: string;
  cardRarity: "Common" | "Rare" | "Epic" | "Legendary";
  cardArchetype: "Warrior" | "Mage" | "Thief" | "Fate" | string;
  omen: string;
  trial: string;
  destiny: string;
}

interface DestinyArchiveProps {
  prophecies: SavedProphecy[];
  onDeleteProphecy: (id: string) => void;
  onClearArchive: () => void;
}

export const DestinyArchive: React.FC<DestinyArchiveProps> = ({
  prophecies,
  onDeleteProphecy,
  onClearArchive,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      sfx.playShuffleTick(0, 1.0);
    } else {
      setExpandedId(id);
      sfx.playShuffleTick(0, 1.3);
    }
  };

  const handleClear = () => {
    if (confirm("Are you certain you wish to burn thy entire Archive of Destiny? This action is irreversible.")) {
      onClearArchive();
      sfx.playFullShuffle();
    }
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Dost thou wish to banish this specific scroll to the void?")) {
      onDeleteProphecy(id);
      sfx.playShuffleTick(0, 0.8);
    }
  };

  // Filter prophecies by card name, question, or archetype
  const filteredProphecies = prophecies.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.cardName.toLowerCase().includes(q) ||
      p.question.toLowerCase().includes(q) ||
      p.cardArchetype.toLowerCase().includes(q) ||
      p.omen.toLowerCase().includes(q)
    );
  });

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

  return (
    <div className="w-full flex flex-col space-y-4">
      
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center border-b border-skyrim-gold/10 pb-2">
        <div className="flex items-center space-x-2 text-skyrim-gold-light">
          <Scroll className="w-4 h-4 text-skyrim-gold" />
          <span className="font-serif text-xs font-semibold tracking-wider uppercase">
            Archive of Destiny
          </span>
        </div>
        {prophecies.length > 0 && (
          <button 
            onClick={handleClear}
            className="text-[9px] text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1 uppercase tracking-wider font-mono bg-red-950/20 border border-red-900/20 px-2 py-0.5 rounded cursor-pointer"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>Burn Archive</span>
          </button>
        )}
      </div>

      {/* ================= SEARCH BAR ================= */}
      {prophecies.length > 0 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved scrolls..."
            className="w-full bg-black/40 text-xs rounded border border-skyrim-gold/15 p-2.5 pl-9 text-white placeholder-gray-500 focus:outline-none focus:border-skyrim-gold/40 font-sans transition-colors"
          />
          <div className="absolute left-3 top-3">
            <Search className="w-3.5 h-3.5 text-skyrim-gold/40" />
          </div>
        </div>
      )}

      {/* ================= SCROLLS LIST ================= */}
      <div 
        tabIndex={filteredProphecies.length > 0 ? 0 : undefined}
        role="region"
        aria-label="Saved Destiny Scrolls"
        className="flex flex-col space-y-3 max-h-[350px] overflow-y-auto pr-1 focus:outline-none rounded"
      >
        {prophecies.length === 0 ? (
          <div className="text-center py-8 bg-black/20 rounded border border-dashed border-skyrim-gold/10">
            <p className="font-serif text-xs italic text-gray-500 max-w-sm mx-auto">
              Thy destiny is yet unwritten. Ask the Oracle a question above and save the generated Scroll of Destiny to record your path in these archives.
            </p>
          </div>
        ) : filteredProphecies.length === 0 ? (
          <div className="text-center py-8 bg-black/20 rounded border border-dashed border-skyrim-gold/10">
            <p className="font-serif text-xs italic text-gray-500">
              No matching scrolls found in the vaults.
            </p>
          </div>
        ) : (
          filteredProphecies.map((p) => {
            const isExpanded = expandedId === p.id;
            const rarityColors = {
              Common: "text-slate-400 border-slate-900/40 hover:border-slate-500/30 bg-slate-950/20",
              Rare: "text-emerald-400 border-emerald-950/40 hover:border-emerald-500/30 bg-emerald-950/20",
              Epic: "text-indigo-400 border-indigo-950/40 hover:border-indigo-500/30 bg-indigo-950/20",
              Legendary: "text-amber-400 border-amber-950/40 hover:border-amber-500/30 bg-amber-950/20"
            }[p.cardRarity as "Common" | "Rare" | "Epic" | "Legendary"] || "text-slate-400 border-slate-900/40 hover:border-slate-500/30 bg-slate-950/20";

            return (
              <div 
                key={p.id}
                className={`flex flex-col rounded border transition-all ${rarityColors} ${
                  isExpanded ? "ring-1 ring-skyrim-gold/40 border-skyrim-gold/40" : "border-skyrim-gold/10"
                }`}
              >
                {/* Scroll Header (Click to expand) */}
                <div 
                  onClick={() => toggleExpand(p.id)}
                  className="flex items-center justify-between p-3 cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="bg-amber-950/30 p-2 rounded border border-skyrim-gold/10 shrink-0">
                      <Scroll className="w-4 h-4 text-skyrim-gold" />
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-xs font-bold tracking-wide text-white truncate">
                          {p.cardName}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.2 rounded bg-black/40 border border-white/5 font-mono">
                          {p.cardRarity}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-serif italic truncate max-w-[280px]">
                        "{p.question}"
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="flex flex-col items-end text-right font-mono text-[9px] text-gray-500">
                      <span className="flex items-center text-gray-400">
                        <Calendar className="w-2.5 h-2.5 mr-1" />
                        {formatDate(p.timestamp)}
                      </span>
                      <span className="text-[8px] text-skyrim-gold/40">
                        {p.cardArchetype}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleDeleteOne(e, p.id)}
                        className="p-1 hover:text-red-400 text-gray-500 hover:bg-red-950/20 rounded transition-colors"
                        title="Banish Scroll"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-skyrim-gold/60" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-skyrim-gold/60" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Scroll of Destiny Parchment */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-skyrim-gold/10 animate-fade-in">
                    <div className="parchment-bg rounded p-4 text-skyrim-dark relative overflow-hidden border border-amber-950/40 shadow-inner mt-1">
                      <div className="absolute inset-1 border border-amber-950/5 rounded pointer-events-none" />
                      
                      <div className="border-b border-amber-950/20 pb-2 mb-3 text-center">
                        <span className="font-serif text-[8px] tracking-[0.2em] text-amber-900 font-bold uppercase block mb-0.5">
                          Scroll of Destiny
                        </span>
                        <span className="font-serif text-[9px] font-bold text-amber-950/80 block italic">
                          "{p.question}"
                        </span>
                      </div>

                      <div className="space-y-3 font-serif text-xs text-amber-950 leading-relaxed">
                        {/* Omen */}
                        <div>
                          <span className="font-bold text-[10px] tracking-wider uppercase text-amber-900 block mb-0.5">
                            ✦ The Omen
                          </span>
                          <p className="text-justify px-1 text-xs">{p.omen}</p>
                        </div>

                        {/* Trial */}
                        <div>
                          <span className="font-bold text-[10px] tracking-wider uppercase text-amber-900 block mb-0.5">
                            ✦ The Trial
                          </span>
                          <p className="text-justify px-1 text-xs">{p.trial}</p>
                        </div>

                        {/* Destiny */}
                        <div className="bg-amber-950/5 p-2 rounded border border-amber-950/10">
                          <span className="font-bold text-[10px] tracking-wider uppercase text-amber-900 block mb-0.5">
                            ✦ The Destiny
                          </span>
                          <p className="italic text-center font-semibold text-amber-950 text-xs">
                            {p.destiny}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-amber-950/10 flex justify-between items-center text-[8px] text-amber-900/60 font-mono">
                        <span>RECORDED CHRONICLE</span>
                        <span>SOVNGARDE SECURED</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-center font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-1">
        <span>* Destiny scrolls are sealed in the sacred archives *</span>
      </div>

    </div>
  );
};
