import React from "react";
import { 
  Sparkles, 
  Scroll, 
  BookOpen, 
  Shield, 
  HelpCircle,
  Crown,
  Heart,
  FileText,
  Feather,
  Users
} from "lucide-react";
import { Card } from "../data/cards";
import { HistoryEntry, QuestLog } from "./QuestLog";
import { SavedProphecy, DestinyArchive } from "./DestinyArchive";
import { OracleParchment } from "./OracleParchment";
import { CovenantLedger } from "./CovenantLedger";
import { JournalSection, JournalEntry } from "./JournalSection";
import { JoinTheBand } from "./JoinTheBand";
import { User } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { sfx } from "../utils/audio";

interface SeerCodexProps {
  user: User | null;
  authLoading: boolean;
  selectedCard: Card | null;
  isFlipped: boolean;
  prophecies: SavedProphecy[];
  history: HistoryEntry[];
  cardsPool: Card[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSaveProphecy: (question: string, omen: string, trial: string, destiny: string) => Promise<void>;
  onDeleteProphecy: (id: string) => void;
  onClearArchive: () => void;
  onSelectCard: (cardId: string) => void;
  onClearHistory: () => void;
  onOpenAuth: () => void;
  savedJournals: JournalEntry[];
  onSaveJournal: (entry: Omit<JournalEntry, "id" | "timestamp">) => Promise<void>;
  onDeleteJournal: (id: string) => void;
  onClearJournals: () => void;
  onUpdateJournal: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  isSubscribed: boolean;
  isMyProfilePublished: boolean;
  onPaywallRequired: () => void;
  showToast?: (msg: string, type?: "success" | "error" | "info") => void;
}

export const SeerCodex: React.FC<SeerCodexProps> = ({
  user,
  authLoading,
  selectedCard,
  isFlipped,
  prophecies,
  history,
  cardsPool,
  activeTab,
  setActiveTab,
  onSaveProphecy,
  onDeleteProphecy,
  onClearArchive,
  onSelectCard,
  onClearHistory,
  onOpenAuth,
  savedJournals,
  onSaveJournal,
  onDeleteJournal,
  onClearJournals,
  onUpdateJournal,
  isSubscribed,
  isMyProfilePublished,
  onPaywallRequired,
  showToast = () => {}
}) => {
  const handleTabChange = (tab: string) => {
    sfx.playShuffleTick(0, 1.2);
    setActiveTab(tab);
  };

  const isLocked = !isSubscribed || !isMyProfilePublished;

  const LockedGate = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-skyrim-gold">
      <Shield className="w-12 h-12 mb-4 opacity-50" />
      <h3 className="font-serif text-lg font-bold mb-2">Access Locked</h3>
      <p className="text-sm mb-4">Please subscribe and create thy profile to access this feature.</p>
      <button onClick={onPaywallRequired} className="px-6 py-2 bg-skyrim-gold text-black rounded-sm font-bold">
        Unlock Covenant
      </button>
    </div>
  );

  const tabs = [
    { id: "oracle", label: "Oracle", icon: Sparkles },
    { id: "band", label: "Join The Band", icon: Users },
    { id: "journal", label: "Crypt Journal", icon: Feather },
    { id: "scrolls", label: "Scrolls", icon: Scroll },
    { id: "logs", label: "Fates Log", icon: BookOpen },
    { id: "ledger", label: "Soul Bond", icon: Shield }
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col relative">
      
      {/* Decorative Top Arching Header */}
      <div className="text-center mb-2 flex items-center justify-center space-x-1">
        <div className="h-[1px] w-8 bg-skyrim-gold/20" />
        <span className="font-serif text-[9px] tracking-[0.3em] text-skyrim-gold/55 uppercase font-bold">
          Seer's Codex
        </span>
        <div className="h-[1px] w-8 bg-skyrim-gold/20" />
      </div>

      {/* TABS GRID: Beautifully styled bookmark-like tabs protruding slightly */}
      <div className="flex w-full overflow-x-auto no-scrollbar border-b border-skyrim-gold/20 bg-black/35 p-1 rounded-t-sm gap-1 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[85px] py-2 px-3 flex items-center justify-center space-x-1.5 rounded-sm transition-all duration-300 cursor-pointer text-[10px] font-serif tracking-widest uppercase relative overflow-hidden select-none border ${
                isActive
                  ? "bg-[#1d1915] text-[#f1e5ac] border-skyrim-gold/35 shadow-[0_2px_10px_rgba(212,175,55,0.06)]"
                  : "bg-transparent text-gray-500 hover:text-gray-300 border-transparent hover:bg-white/5"
              }`}
            >
              {/* Active Tab Glow Accent */}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-skyrim-gold" />
              )}
              
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-skyrim-gold" : "text-gray-500"}`} />
              <span className="font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CODEX INNER SCREEN: Leather/Stone bound aesthetic panel with custom transition */}
      <div 
        className="bg-skyrim-stone/75 border-x border-b border-skyrim-gold/15 rounded-b-sm min-h-[440px] flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
        style={{ backgroundImage: "radial-gradient(circle at top, #201b15 0%, #100e0b 100%)" }}
      >
        {/* Subtle decorative internal border */}
        <div className="absolute inset-2 border border-skyrim-gold/5 pointer-events-none rounded-sm" />

        {/* Dynamic Inner Panel View with animations */}
        <div className="relative p-5 flex-1 flex flex-col z-10 overflow-y-auto max-h-[550px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full flex-1 flex flex-col"
            >
              
              {/* ORACLE TAB VIEW */}
              {activeTab === "oracle" && (
                <div className="w-full flex-1 flex flex-col justify-between">
                  {isLocked ? <LockedGate /> : (
                    selectedCard && isFlipped ? (
                      <OracleParchment 
                        card={selectedCard} 
                        onSaveProphecy={onSaveProphecy}
                        savedProphecies={prophecies}
                      />
                    ) : (
                      /* Elegant Informational Box when no active flipped card */
                      <div className="flex flex-col space-y-4 my-auto py-8 text-center max-w-sm mx-auto animate-fade-in">
                        <div className="p-4 bg-skyrim-gold/5 border border-skyrim-gold/20 rounded-full w-fit mx-auto text-skyrim-gold/70 mb-2">
                          <HelpCircle className="w-7 h-7" />
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-serif text-sm font-semibold tracking-widest text-skyrim-gold-light uppercase">
                            The Oracle's Chamber
                          </h4>
                          <p className="font-mono text-[9px] text-skyrim-gold/40 tracking-[0.2em] uppercase">
                            No Active Reveal
                          </p>
                        </div>

                        <p className="font-serif text-xs text-gray-400 leading-relaxed px-2">
                          Draw a card of fate from the Left Altar, then click to flip it face-up. The Elder Oracle will immediately open this runic scroll to transcribe its ancient prophecy and interpret thy doom.
                        </p>
                        
                        {/* Visual quote citation */}
                        <div className="border-l-2 border-skyrim-gold/30 pl-4 py-1.5 bg-black/15 text-left mt-2 rounded-r-sm">
                          <span className="font-serif italic text-[11px] text-skyrim-gold/65 block">
                            "Secrets of the stars are etched in weathered stone, awaiting the brave traveler to click and unveil."
                          </span>
                          <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-1 block">
                            - Chronicles of Blackreach, Volume IV
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* JOIN THE BAND (NIGROMANCY SOCIAL COVEN) VIEW */}
              {activeTab === "band" && (
                <div className="w-full">
                  {isLocked ? <LockedGate /> : (
                    <JoinTheBand
                      user={user}
                      onOpenAuth={onOpenAuth}
                      showToast={showToast}
                    />
                  )}
                </div>
              )}

              {/* CRYPT JOURNAL VIEW */}
              {activeTab === "journal" && (
                <div className="w-full">
                  {isLocked ? <LockedGate /> : (
                    <JournalSection 
                      selectedCard={selectedCard}
                      isFlipped={isFlipped}
                      savedJournals={savedJournals}
                      onSaveJournal={onSaveJournal}
                      onDeleteJournal={onDeleteJournal}
                      onClearJournals={onClearJournals}
                      onUpdateJournal={onUpdateJournal}
                      isSubscribed={isSubscribed}
                      onPaywallRequired={onPaywallRequired}
                    />
                  )}
                </div>
              )}

              {/* SAVED DESTINY ARCHIVES VIEW */}
              {activeTab === "scrolls" && (
                <div className="w-full">
                  {isLocked ? <LockedGate /> : (
                    <DestinyArchive 
                      prophecies={prophecies}
                      onDeleteProphecy={onDeleteProphecy}
                      onClearArchive={onClearArchive}
                    />
                  )}
                </div>
              )}

              {/* HISTORY (FATES LOG) VIEW */}
              {activeTab === "logs" && (
                <div className="w-full">
                  {isLocked ? <LockedGate /> : (
                    <QuestLog 
                      history={history}
                      cardsPool={cardsPool}
                      onSelectCard={onSelectCard}
                      onClearHistory={onClearHistory}
                    />
                  )}
                </div>
              )}

              {/* SOUL BOND (COVENANT LEDGER) VIEW */}
              {activeTab === "ledger" && (
                <div className="w-full flex-1 flex flex-col justify-between">
                  <div className="flex flex-col space-y-4">
                    {/* Brief description */}
                    <p className="font-serif text-xs text-gray-400 leading-relaxed text-center px-4">
                      Bind thy physical presence to the cloud ledger to secure thy past drawn fates and saved destiny scrolls for all eternity.
                    </p>

                    <CovenantLedger user={user} loading={authLoading} />

                    {/* Streamlined Sync Info Box */}
                    {!user && (
                      <div className="bg-black/35 rounded border border-skyrim-gold/10 p-4 text-center space-y-3 mt-2">
                        <span className="font-serif text-[10px] text-skyrim-gold tracking-widest uppercase font-bold block">
                          Unlock Eternal Storage
                        </span>
                        <p className="font-serif text-[11px] text-gray-400 italic">
                          "He who connects his soul mark to the sacred fire shall never lose track of his journeys."
                        </p>
                        <button
                          onClick={() => {
                            sfx.playShuffleTick(0, 1.25);
                            onOpenAuth();
                          }}
                          className="mx-auto block px-5 py-2 bg-skyrim-gold/10 hover:bg-skyrim-gold/20 text-skyrim-gold border border-skyrim-gold/30 hover:border-skyrim-gold text-[10px] font-serif tracking-wider uppercase transition-all rounded-sm cursor-pointer"
                        >
                          Connect Soul Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Aesthetic Footer */}
                  <div className="text-center pt-6 border-t border-skyrim-gold/10 text-[9px] text-skyrim-gold/30 font-mono uppercase tracking-widest">
                    SOVNGARDE REGISTRY ACTIVE
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
