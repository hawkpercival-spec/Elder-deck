import React, { useState, useEffect } from "react";
import { Sparkles, Scroll, Landmark, HelpCircle, Bookmark, Check } from "lucide-react";
import { Card, generateProphecy } from "../data/cards";
import { sfx } from "../utils/audio";

interface OracleParchmentProps {
  card: Card;
  onSaveProphecy: (question: string, omen: string, trial: string, destiny: string) => Promise<void>;
  savedProphecies: Array<{ cardId: string; question: string }>;
}

export const OracleParchment: React.FC<OracleParchmentProps> = ({ 
  card, 
  onSaveProphecy, 
  savedProphecies 
}) => {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prophecy, setProphecy] = useState<{ omen: string; trial: string; destiny: string } | null>(null);

  // Reset prophecy when card changes
  useEffect(() => {
    setProphecy(null);
    setQuestion("");
    setSubmittedQuestion("");
  }, [card]);

  const handleConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsConsulting(true);
    setSubmittedQuestion(question);
    sfx.playFullShuffle(); // play a shuffling sound for the mystical consultation process

    // Staggered reveal for a magical feeling
    setTimeout(() => {
      const result = generateProphecy(card, question);
      setProphecy(result);
      setIsConsulting(false);
      sfx.playMysticChime(card.rarity);
    }, 1200);
  };

  const handleSave = async () => {
    if (!prophecy || !submittedQuestion) return;
    setIsSaving(true);
    try {
      await onSaveProphecy(submittedQuestion, prophecy.omen, prophecy.trial, prophecy.destiny);
      sfx.playShuffleTick(0, 1.4);
    } catch (e) {
      console.error("Failed to save destiny scroll:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const isSaved = prophecy && savedProphecies.some(
    (p) => p.cardId === card.id && p.question.trim().toLowerCase() === submittedQuestion.trim().toLowerCase()
  );

  const sampleQuestions = [
    "Will I survive the Frost Troll on the high pass?",
    "Will I find gold in the upcoming dungeon?",
    "Does the shadow lady nocturne favor my path?",
    "Will my blacksmithing attempts succeed today?"
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-6">
      
      {/* ================= ORACLE QUESTION FORM ================= */}
      <div className="bg-skyrim-stone/80 rounded-lg p-5 border border-skyrim-gold/20 flex flex-col space-y-4">
        <div className="flex items-center space-x-3 text-skyrim-gold-light border-b border-skyrim-gold/10 pb-2.5">
          <Scroll className="w-5 h-5" />
          <span className="font-serif text-sm font-semibold tracking-wider uppercase">
            Consult the Runes
          </span>
        </div>

        <p className="text-gray-400 text-xs leading-relaxed">
          Whisper thy current venture or plight to the ancient cards. The fates of <span className="text-skyrim-gold font-bold">{card.name}</span> shall interpret thy doom.
        </p>

        <form onSubmit={handleConsult} className="space-y-3">
          <div className="relative">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Will I find gold today? Should I venture out?" 
              maxLength={120}
              className="w-full bg-black/55 text-sm rounded border border-skyrim-gold/30 p-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-skyrim-gold focus:ring-1 focus:ring-skyrim-gold font-sans transition-colors"
              disabled={isConsulting}
            />
            <div className="absolute right-3 top-3">
              <HelpCircle className="w-4 h-4 text-skyrim-gold/50" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isConsulting || !question.trim()}
            className="w-full py-2.5 rounded bg-gradient-to-r from-amber-950 via-skyrim-gold/20 to-amber-950 text-skyrim-gold-light font-serif text-sm font-semibold tracking-widest border border-skyrim-gold/30 hover:border-skyrim-gold hover:text-white hover:from-amber-900 hover:to-amber-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            {isConsulting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-skyrim-gold animate-spin" />
                <span>COMMUNING WITH THE STARS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>WHISPER TO THE RUNES</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion tags */}
        <div className="flex flex-col space-y-1.5 pt-2">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
            Common Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sq, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuestion(sq);
                  sfx.playShuffleTick(0, 1.2);
                }}
                disabled={isConsulting}
                className="text-[10px] text-left text-skyrim-gold/60 hover:text-skyrim-gold-light hover:border-skyrim-gold/40 px-2 py-1 bg-black/25 rounded border border-skyrim-gold/15 transition-all truncate max-w-full"
              >
                "{sq}"
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* ================= PROPHECY OUTPUT ================= */}
      {isConsulting && (
        <div className="text-center py-8 animate-pulse">
          <p className="font-serif italic text-sm text-skyrim-gold">
            "The scrolls flutter, the mists of Oblivion part..."
          </p>
        </div>
      )}

      {prophecy && !isConsulting && (
        <div className="parchment-bg rounded-lg p-6 text-skyrim-dark relative overflow-hidden border-2 border-amber-900/60 shadow-2xl animate-fade-in">
          {/* Ornate corner flourishes */}
          <div className="absolute inset-1.5 border border-amber-950/10 rounded pointer-events-none" />
          
          <div className="border-b border-amber-950/20 pb-3 mb-4 text-center">
            <span className="font-serif text-[10px] tracking-[0.2em] text-amber-900 font-bold uppercase block mb-1">
              Scroll of Destiny
            </span>
            <h4 className="font-serif font-bold text-lg text-amber-950 tracking-wide">
              The Prophecy Revealed
            </h4>
          </div>

          <div className="space-y-4 font-serif text-sm text-amber-950 leading-relaxed">
            {/* The Omen */}
            <div>
              <span className="font-bold text-xs tracking-wider uppercase text-amber-900 block mb-1">
                ✦ The Omen
              </span>
              <p className="text-justify px-1">{prophecy.omen}</p>
            </div>

            {/* The Trial */}
            <div>
              <span className="font-bold text-xs tracking-wider uppercase text-amber-900 block mb-1">
                ✦ The Trial
              </span>
              <p className="text-justify px-1">{prophecy.trial}</p>
            </div>

            {/* The Destiny */}
            <div className="bg-amber-950/5 p-3 rounded border border-amber-950/10">
              <span className="font-bold text-xs tracking-wider uppercase text-amber-900 block mb-1">
                ✦ The Destiny
              </span>
              <p className="italic text-center font-semibold text-amber-950">
                {prophecy.destiny}
              </p>
            </div>
          </div>

          {/* Save Scroll to Archive capability */}
          <div className="mt-4 pt-3 border-t border-amber-950/20 flex justify-center">
            {isSaved ? (
              <div className="flex items-center space-x-1.5 text-emerald-800 font-serif text-xs font-bold tracking-wider bg-emerald-800/10 px-3 py-1.5 rounded border border-emerald-800/20 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>SCROLL RECORDED IN THE ARCHIVES</span>
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded bg-amber-950/15 hover:bg-amber-950/35 border border-amber-950/40 text-[#2a241e] hover:text-black font-serif text-xs font-bold tracking-widest transition-all flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-40"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaving ? "TRANSCRIBING SCROLL..." : "SAVE SCROLL TO ARCHIVE"}</span>
              </button>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-amber-950/10 flex justify-between items-center text-[9px] text-amber-900/60 font-mono uppercase">
            <span>SIGILS ALIGNED</span>
            <span>SOVNGARDE AWAITS</span>
          </div>
        </div>
      )}

    </div>
  );
};
