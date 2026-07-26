import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Feather, 
  Compass, 
  Trash2, 
  Calendar, 
  ShieldAlert, 
  Loader2, 
  CheckCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock
} from "lucide-react";
import { Card, MEDIEVAL_DECK } from "../data/cards";
import { isProceduralId, generateProceduralCard } from "../utils/procedural";
import { sfx } from "../utils/audio";

export interface JournalEntry {
  id: string;
  timestamp: string;
  cardId: string;
  cardName: string;
  cardRarity: string;
  cardArchetype: string;
  journalPrompt: string;
  entryText: string;
  temperament: string;
  temperamentAnalysis: string;
  occultDiagnosis: string;
  protectiveWard: string;
  summaryTitle: string;
  synthesizedProphecy?: string;
  synthesizedTitle?: string;
  synthesizedVerdict?: string;
}

interface JournalSectionProps {
  selectedCard: Card | null;
  isFlipped: boolean;
  savedJournals: JournalEntry[];
  onSaveJournal: (entry: Omit<JournalEntry, "id" | "timestamp">) => Promise<void>;
  onDeleteJournal: (id: string) => void;
  onClearJournals: () => void;
  onUpdateJournal: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  isSubscribed: boolean;
  onPaywallRequired: () => void;
}

export const JournalSection: React.FC<JournalSectionProps> = ({
  selectedCard,
  isFlipped,
  savedJournals,
  onSaveJournal,
  onDeleteJournal,
  onClearJournals,
  onUpdateJournal,
  isSubscribed,
  onPaywallRequired
}) => {
  const activeCard = selectedCard && isFlipped ? selectedCard : null;
  const [entryText, setEntryText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    temperamentAnalysis: string;
    occultDiagnosis: string;
    protectiveWard: string;
    summaryTitle: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Synthesized Prophecy States
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [synthesizeError, setSynthesizeError] = useState<string | null>(null);

  // Custom Bespoke Meditation Exercise States
  const [customMeditation, setCustomMeditation] = useState<string | null>(null);
  const [generatingMeditation, setGeneratingMeditation] = useState(false);
  const [meditationError, setMeditationError] = useState<string | null>(null);

  const handleGenerateMeditation = async () => {
    if (!activeCard) return;
    setGeneratingMeditation(true);
    setMeditationError(null);
    sfx.playShuffleTick(0, 1.1);

    try {
      const response = await fetch("/api/generate-meditation-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: activeCard.name,
          cardArchetype: activeCard.archetype,
          cardRarity: activeCard.rarity,
          cardLore: activeCard.lore,
          cardMeaning: activeCard.meaning,
          temperament: activeCard.temperament,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate sanctuary meditation.");
      }

      setCustomMeditation(data.meditationExercise);
      sfx.playMysticChime(activeCard.rarity);
    } catch (err: any) {
      console.error("Meditation generation error:", err);
      setMeditationError(err.message || "Celestial disturbance prevented custom exercise generation.");
    } finally {
      setGeneratingMeditation(false);
    }
  };

  useEffect(() => {
    if (activeCard) {
      setCustomMeditation(null);
      setAnalysisResult(null);
      setEntryText("");
      handleGenerateMeditation();
    }
  }, [activeCard?.id]);

  const getCardForEntry = (cardId: string): Card | undefined => {
    if (isProceduralId(cardId)) {
      return generateProceduralCard(cardId);
    }
    return MEDIEVAL_DECK.find(c => c.id === cardId);
  };

  const handleSynthesize = async (entry: JournalEntry) => {
    if (!isSubscribed) {
      onPaywallRequired();
      return;
    }

    const card = getCardForEntry(entry.cardId);
    if (!card) {
      setSynthesizeError("Failed to trace the origins of this card.");
      return;
    }

    setSynthesizingId(entry.id);
    setSynthesizeError(null);
    sfx.playFullShuffle();

    try {
      const response = await fetch("/api/synthesize-prophecy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: entry.cardName,
          cardArchetype: entry.cardArchetype,
          cardRarity: entry.cardRarity,
          cardLore: card.lore,
          cardMeaning: card.meaning,
          journalPrompt: entry.journalPrompt,
          entryText: entry.entryText,
          temperament: entry.temperament,
          temperamentAnalysis: entry.temperamentAnalysis,
          occultDiagnosis: entry.occultDiagnosis,
          protectiveWard: entry.protectiveWard
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The celestial convergence collapsed.");
      }

      await onUpdateJournal(entry.id, {
        synthesizedProphecy: data.prophecy,
        synthesizedTitle: data.title,
        synthesizedVerdict: data.verdict
      });

      sfx.playMysticChime("Epic");
    } catch (err: any) {
      console.error(err);
      setSynthesizeError(err.message || "An arcane disturbance occurred. The stars are veiled.");
      sfx.playShuffleTick(0, 0.6);
    } finally {
      setSynthesizingId(null);
    }
  };

  const handleAnalyze = async () => {
    if (!activeCard) return;
    if (!entryText.trim()) {
      setError("Pray, write thy thoughts down before calling upon the shadows.");
      sfx.playShuffleTick(0, 0.7);
      return;
    }

    setError(null);
    setAnalyzing(true);
    setAnalysisResult(null);
    setSaveSuccess(false);
    sfx.playFullShuffle();

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: activeCard.name,
          cardArchetype: activeCard.archetype,
          journalPrompt: activeCard.journalExercise || "",
          entryText: entryText,
          temperament: activeCard.temperament || "Unknown"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The celestial gears failed to turn.");
      }

      setAnalysisResult(data);
      sfx.playFullShuffle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An arcane disturbance occurred. Try once more.");
      sfx.playShuffleTick(0, 0.6);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!activeCard || !analysisResult || !entryText.trim()) return;

    try {
      await onSaveJournal({
        cardId: activeCard.id,
        cardName: activeCard.name,
        cardRarity: activeCard.rarity,
        cardArchetype: activeCard.archetype,
        journalPrompt: activeCard.journalExercise || "",
        entryText: entryText,
        temperament: activeCard.temperament || "Unknown",
        temperamentAnalysis: analysisResult.temperamentAnalysis,
        occultDiagnosis: analysisResult.occultDiagnosis,
        protectiveWard: analysisResult.protectiveWard,
        summaryTitle: analysisResult.summaryTitle
      });

      setSaveSuccess(true);
      setEntryText("");
      setAnalysisResult(null);
      sfx.playFullShuffle();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError("Failed to engrave thy analysis into the sacred vaults.");
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      sfx.playShuffleTick(0, 1.0);
    } else {
      setExpandedId(id);
      sfx.playShuffleTick(0, 1.25);
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you certain you wish to dissolve all thy saved journal analysis scrolls into the void?")) {
      onClearJournals();
      sfx.playFullShuffle();
    }
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Banish this journal analysis scroll from the archives?")) {
      onDeleteJournal(id);
      sfx.playShuffleTick(0, 0.85);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-5">
      {/* Tab Header */}
      <div className="flex justify-between items-center border-b border-skyrim-gold/10 pb-2">
        <div className="flex items-center space-x-2 text-skyrim-gold-light">
          <Feather className="w-4 h-4 text-skyrim-gold" />
          <span className="font-serif text-xs font-semibold tracking-wider uppercase">
            Nigromancy & Temperament Journal
          </span>
        </div>
        {savedJournals.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-[9px] text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1 uppercase tracking-wider font-mono bg-red-950/20 border border-red-900/20 px-2 py-0.5 rounded cursor-pointer"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>Purge Vault</span>
          </button>
        )}
      </div>

      {/* ================= ACTIVE JOURNALING SECTION ================= */}
      {activeCard ? (
        <div className="flex flex-col space-y-4">
          
          {/* Card Info & Prompt */}
          <div className="bg-black/35 rounded border border-skyrim-gold/10 p-4 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${activeCard.color}-500/5 blur-xl pointer-events-none rounded-full`} />
            
            <div className="flex items-center space-x-2 border-b border-white/5 pb-2 mb-2">
              <span className="font-serif text-xs font-bold text-skyrim-gold-light">
                {activeCard.name}
              </span>
              <span className="text-[8px] font-mono uppercase bg-black/45 border border-white/10 px-1.5 py-0.2 rounded text-gray-400">
                {activeCard.temperament}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] tracking-wider text-skyrim-gold/55 uppercase block">
                  ✦ Bespoke Sanctuary Meditation Exercise
                </span>
                <button
                  onClick={handleGenerateMeditation}
                  disabled={generatingMeditation}
                  className="text-[8px] font-mono text-skyrim-gold hover:text-skyrim-gold-light underline cursor-pointer flex items-center space-x-1"
                >
                  {generatingMeditation ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>Conjuring...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Re-Conjure</span>
                    </>
                  )}
                </button>
              </div>

              {generatingMeditation ? (
                <div className="py-2.5 flex items-center space-x-2 text-skyrim-gold/80 font-serif text-xs italic">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-skyrim-gold" />
                  <span>The celestial scribe is weaving a bespoke meditation exercise for thy card...</span>
                </div>
              ) : (
                <p className="font-serif text-xs text-gray-300 leading-relaxed italic">
                  "{customMeditation || activeCard.journalExercise}"
                </p>
              )}

              {meditationError && (
                <p className="text-[10px] text-red-400 font-serif italic">{meditationError}</p>
              )}
            </div>
          </div>

          {/* Form Textarea */}
          <div className="flex flex-col space-y-1.5 relative">
            <label htmlFor="journal-input" className="font-mono text-[9px] text-gray-500 uppercase tracking-widest pl-1">
              Transcribe thy personal reflection below...
            </label>
            <textarea
              id="journal-input"
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Write thy secrets, struggles, and aspirations... How does thy blood boil or thy phlegm freeze?"
              rows={4}
              maxLength={1000}
              disabled={analyzing}
              className="w-full bg-black/50 text-xs rounded border border-skyrim-gold/15 p-3 text-white placeholder-gray-600 focus:outline-none focus:border-skyrim-gold/40 font-serif leading-relaxed resize-none transition-colors"
            />
            <div className="absolute right-2.5 bottom-2.5 text-[8px] text-gray-600 font-mono">
              {entryText.length}/1000
            </div>
          </div>

          {/* Actions / Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !entryText.trim()}
              className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 rounded-sm border cursor-pointer text-xs font-serif tracking-widest uppercase transition-all ${
                analyzing 
                  ? "bg-black/40 text-gray-500 border-white/5"
                  : entryText.trim()
                    ? "bg-skyrim-gold/10 hover:bg-skyrim-gold/20 text-skyrim-gold border-skyrim-gold/30 hover:border-skyrim-gold"
                    : "bg-black/20 text-gray-600 border-white/5 cursor-not-allowed"
              }`}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-skyrim-gold" />
                  <span>Invoking Shadow Scribe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-skyrim-gold" />
                  <span>Analyze via Nigromancy</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/20 border border-red-900/30 rounded p-2.5 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="font-serif text-[11px] text-red-300 leading-normal">{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {saveSuccess && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded p-2.5 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="font-serif text-[11px] text-emerald-300">
                Thy parchment has been engraved and sealed in the Codex Vault.
              </p>
            </div>
          )}

          {/* ================= ANALYSIS OUTPUT ================= */}
          {analysisResult && (
            <div className="parchment-bg rounded p-4 text-skyrim-dark relative overflow-hidden border border-amber-950/40 shadow-xl animate-fade-in mt-1">
              <div className="absolute inset-1 border border-amber-950/5 rounded pointer-events-none" />
              
              <div className="border-b border-amber-950/25 pb-2 mb-3 text-center">
                <span className="font-serif text-[8px] tracking-[0.25em] text-amber-900 font-bold uppercase block mb-0.5">
                  Nigromantic Analysis Parchment
                </span>
                <span className="font-serif text-sm font-bold text-amber-950 block">
                  {analysisResult.summaryTitle}
                </span>
              </div>

              <div className="space-y-3.5 font-serif text-xs text-amber-950 leading-relaxed text-justify">
                {/* Temperament Review */}
                <div>
                  <span className="font-bold text-[10px] tracking-wider uppercase text-amber-900 block mb-0.5">
                    ✦ The Temperamental Humors
                  </span>
                  <p className="px-1">{analysisResult.temperamentAnalysis}</p>
                </div>

                {/* Occult Diagnosis */}
                <div>
                  <span className="font-bold text-[10px] tracking-wider uppercase text-amber-900 block mb-0.5">
                    ✦ The Shadow Diagnosis
                  </span>
                  <p className="px-1 italic">{analysisResult.occultDiagnosis}</p>
                </div>

                {/* Protective Ward */}
                <div className="bg-amber-950/5 p-2.5 rounded border border-amber-950/15">
                  <span className="font-bold text-[10px] tracking-wider uppercase text-amber-900 block mb-0.5">
                    ✦ The Protective Ward
                  </span>
                  <p className="italic text-center font-semibold text-amber-950">
                    {analysisResult.protectiveWard}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-amber-950/10 flex justify-between items-center text-[8px] text-amber-900/60 font-mono">
                <span>SEAL OF MORTALITY</span>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-amber-900 hover:bg-amber-950 text-white rounded font-serif text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save to Codex Vault
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Prompt when no card drawn */
        <div className="text-center py-10 bg-black/20 rounded border border-dashed border-skyrim-gold/10 px-6 my-auto">
          <Compass className="w-7 h-7 text-skyrim-gold/30 mx-auto mb-2" />
          <p className="font-serif text-xs text-skyrim-gold-light font-bold mb-1 uppercase tracking-wider">
            Sanctuary Gates Sealed
          </p>
          <p className="font-serif text-[11px] italic text-gray-500 max-w-xs mx-auto leading-normal">
            Draw thy Card of Fate from the Left Altar, and click to reveal its face. Only then will thy custom journal exercise and occult analysis be unlocked.
          </p>
        </div>
      )}

      {/* ================= SAVED JOURNALS CODEX ARCHIVE ================= */}
      <div className="flex flex-col space-y-3 pt-4 border-t border-skyrim-gold/10">
        <div className="flex items-center space-x-1.5 text-gray-400">
          <FileText className="w-3.5 h-3.5 text-skyrim-gold/60" />
          <span className="font-serif text-[10px] font-bold tracking-wider uppercase">
            Thy Journal Vault ({savedJournals.length})
          </span>
        </div>

        {savedJournals.length === 0 ? (
          <p className="font-serif text-[10px] italic text-gray-500 text-center py-4">
            Thy chronicle is empty. Submit and save an analysis above to carve thy path in the Codex archives.
          </p>
        ) : (
          <div className="flex flex-col space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {savedJournals.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div 
                  key={entry.id}
                  className={`flex flex-col rounded border transition-all ${
                    isExpanded 
                      ? "bg-amber-950/10 border-skyrim-gold/40 shadow-inner" 
                      : "bg-black/25 border-skyrim-gold/10 hover:border-skyrim-gold/25"
                  }`}
                >
                  {/* Header row (click to expand) */}
                  <div 
                    onClick={() => toggleExpand(entry.id)}
                    className="flex items-center justify-between p-2.5 cursor-pointer select-none text-[10px]"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <BookOpen className="w-3 h-3 text-skyrim-gold shrink-0" />
                      <div className="flex flex-col truncate">
                        <span className="font-serif text-xs font-semibold text-white truncate">
                          {entry.summaryTitle}
                        </span>
                        <span className="text-[8px] text-gray-500 font-serif italic truncate max-w-[200px]">
                          Card: {entry.cardName} ({entry.temperament})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-mono text-[8px] text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                      <button
                        onClick={(e) => handleDeleteOne(e, entry.id)}
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-skyrim-gold/50" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-skyrim-gold/50" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-skyrim-gold/10 animate-fade-in">
                      <div className="parchment-bg rounded p-3 text-skyrim-dark border border-amber-950/30 relative">
                        {/* Prompt */}
                        <div className="mb-2 pb-1.5 border-b border-amber-950/10 text-[9px] text-amber-900/80">
                          <span className="font-semibold uppercase tracking-wider block text-[8px]">
                            ✦ Reflection Prompt:
                          </span>
                          <span className="italic">"{entry.journalPrompt}"</span>
                        </div>

                        {/* User Response */}
                        <div className="mb-3 text-[11px] text-amber-950">
                          <span className="font-semibold uppercase text-amber-900 tracking-wider block text-[8px] mb-0.5">
                            ✦ Thy Transcription:
                          </span>
                          <p className="pl-1 text-justify font-sans">{entry.entryText}</p>
                        </div>

                        {/* Analysis */}
                        <div className="space-y-2 text-[11px] text-amber-950 border-t border-amber-950/10 pt-2 text-justify">
                          <div>
                            <span className="font-semibold uppercase text-amber-900 tracking-wider block text-[8px]">
                              ✦ Occult Scribe's Verdict:
                            </span>
                            <p className="pl-1">{entry.temperamentAnalysis}</p>
                          </div>
                          <div>
                            <span className="font-semibold uppercase text-amber-900 tracking-wider block text-[8px]">
                              ✦ Occult Diagnosis:
                            </span>
                            <p className="pl-1 italic">{entry.occultDiagnosis}</p>
                          </div>
                          <div className="bg-amber-950/5 p-2 rounded border border-amber-950/10 text-center italic font-semibold">
                            "{entry.protectiveWard}"
                          </div>
                        </div>
                      </div>

                      {/* STYLIZED MEDIEVAL SCROLL OF SYNTHESIZED PROPHECY */}
                      <div className="mt-4 pt-4 border-t border-skyrim-gold/10">
                        {!entry.synthesizedProphecy ? (
                          <div className="flex flex-col items-center justify-center py-4 px-2 bg-black/30 border border-skyrim-gold/10 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)]" />
                            
                            <Feather className="w-5 h-5 text-skyrim-gold/40 mb-2 animate-pulse" />
                            <span className="font-medieval text-xs text-skyrim-gold tracking-widest uppercase font-semibold text-center block mb-1">
                              ✦ Weave Synthesized Prophecy ✦
                            </span>
                            <p className="font-serif text-[10px] text-gray-400 italic text-center max-w-xs leading-normal">
                              Weave thy personal journal reflections with the card's ancient lore to manifest a custom destiny scroll.
                            </p>
                            
                            {synthesizeError && (
                              <p className="text-[10px] text-red-400 font-serif font-semibold mt-2 border border-red-500/20 bg-red-950/20 px-2 py-1 rounded">
                                ⚠ {synthesizeError}
                              </p>
                            )}

                            <button
                              onClick={() => handleSynthesize(entry)}
                              disabled={synthesizingId === entry.id}
                              className="px-4 py-2 bg-[#2a241e] hover:bg-[#3d342b] disabled:bg-black/40 text-[#f1e5ac] rounded border border-skyrim-gold/35 hover:border-skyrim-gold/70 font-serif text-[10px] uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center space-x-1.5 mt-3 active:scale-95"
                            >
                              {synthesizingId === entry.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-skyrim-gold" />
                                  <span>Chanting Incantations...</span>
                                </>
                              ) : !isSubscribed ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-skyrim-gold/70" />
                                  <span>Weave Destiny Scroll (Premium ✦)</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-skyrim-gold" />
                                  <span>Weave Destiny Scroll</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          /* RENDER THE UNROLLED MEDIEVAL SCROLL */
                          <div className="relative my-4 mx-auto max-w-sm animate-fade-in">
                            
                            {/* Top Scroll Roller Bar */}
                            <div className="w-full h-2.5 bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 rounded-full relative shadow-lg z-10 flex items-center">
                              {/* Left Gold Knob */}
                              <div className="absolute -left-2 w-4 h-4 bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 rounded-full border border-amber-300 shadow-md" />
                              {/* Right Gold Knob */}
                              <div className="absolute -right-2 w-4 h-4 bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 rounded-full border border-amber-300 shadow-md" />
                            </div>
                            
                            {/* Scroll body: unrolled parchment paper */}
                            <div className="bg-[#f0e3c5] text-amber-950 border-x-[5px] border-amber-900/30 px-5 py-6 shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(139,94,26,0.22)] relative overflow-hidden -my-0.5">
                              
                              {/* Subtle parchment lines and texture overlay */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(139,94,26,0.012)_1px,transparent_1px)] bg-[size:100%_18px] pointer-events-none" />
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,transparent_80%)] pointer-events-none" />
                              
                              {/* Decorative corner brackets in medieval scroll style */}
                              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-amber-900/30" />
                              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-amber-900/30" />
                              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-amber-900/30" />
                              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-amber-900/30" />
                              
                              {/* Scroll Header */}
                              <div className="text-center border-b border-amber-900/20 pb-3 mb-4">
                                <div className="flex items-center justify-center space-x-1.5 mb-1 text-amber-800">
                                  <Sparkles className="w-3 h-3 text-amber-700 animate-pulse" />
                                  <span className="font-serif text-[7px] tracking-[0.3em] font-bold uppercase">
                                    SYNTHESIZED PROPHECY
                                  </span>
                                  <Sparkles className="w-3 h-3 text-amber-700 animate-pulse" />
                                </div>
                                <h5 className="font-medieval text-[13px] font-bold text-amber-950 tracking-wider">
                                  {entry.synthesizedTitle}
                                </h5>
                              </div>

                              {/* Scroll Body: Weave paragraphs */}
                              <div className="space-y-3 font-serif text-[11px] text-amber-950 leading-relaxed text-justify px-1">
                                {entry.synthesizedProphecy.split("\n\n").map((para, idx) => {
                                  if (!para.trim()) return null;
                                  // Capital drop cap for the first paragraph!
                                  if (idx === 0) {
                                    const firstLetter = para.charAt(0);
                                    const restText = para.slice(1);
                                    return (
                                      <p key={idx} className="relative">
                                        <span className="float-left text-3xl font-medieval font-extrabold text-amber-900 mr-1.5 mt-1 line-height-none">
                                          {firstLetter}
                                        </span>
                                        {restText}
                                      </p>
                                    );
                                  }
                                  return (
                                    <p key={idx} className="indent-2">
                                      {para}
                                    </p>
                                  );
                                })}
                              </div>

                              {/* Scroll Verdict Seal */}
                              <div className="mt-5 pt-3.5 border-t border-amber-900/15 text-center">
                                <div className="font-serif italic text-[11px] font-semibold text-amber-900 bg-amber-900/5 py-2 px-3 rounded border border-amber-900/10 inline-block w-full">
                                  "{entry.synthesizedVerdict}"
                                </div>
                                
                                {/* Royal Red Wax Seal */}
                                <div className="flex items-center justify-center mt-5">
                                  <div className="w-8.5 h-8.5 rounded-full bg-red-800 shadow-[0_3px_6px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(255,255,255,0.25)] flex items-center justify-center border-2 border-red-950 relative">
                                    <span className="font-medieval text-xs text-yellow-500 font-extrabold select-none">✦</span>
                                    <div className="absolute inset-0 rounded-full border border-red-900/30 pointer-events-none" />
                                  </div>
                                  <span className="font-mono text-[7px] text-amber-900/60 uppercase tracking-[0.2em] ml-2.5 font-bold">
                                    Sealed by Sovngarde Seers
                                  </span>
                                </div>
                              </div>

                            </div>

                            {/* Bottom Scroll Roller Bar */}
                            <div className="w-full h-2.5 bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 rounded-full relative shadow-lg z-10 flex items-center">
                              {/* Left Gold Knob */}
                              <div className="absolute -left-2 w-4 h-4 bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 rounded-full border border-amber-300 shadow-md" />
                              {/* Right Gold Knob */}
                              <div className="absolute -right-2 w-4 h-4 bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 rounded-full border border-amber-300 shadow-md" />
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
