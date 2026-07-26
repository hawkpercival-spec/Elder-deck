import React, { useState } from "react";
import { 
  Crown, 
  Sparkles, 
  X, 
  Lock, 
  Gem, 
  Globe,
  Loader2
} from "lucide-react";
import { sfx } from "../utils/audio";

interface PaywallModalProps {
  onClose: () => void;
  onSubscribe: (currency?: "USD" | "GBP") => Promise<void>;
  loading: boolean;
  isSignedIn: boolean;
  onOpenAuth: () => void;
  isClosable?: boolean;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ 
  onClose, 
  onSubscribe, 
  loading, 
  isSignedIn,
  onOpenAuth,
  isClosable = true
}) => {
  const [currency, setCurrency] = useState<"USD" | "GBP">("USD");

  const playTick = () => sfx.playShuffleTick(0, 1.1);
  const playFlip = () => sfx.playFlip();

  const handleAction = async () => {
    playFlip();
    await onSubscribe(currency);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-skyrim-stone/95 border border-skyrim-gold/30 rounded-sm relative p-8 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.05)] text-center overflow-hidden"
        style={{ backgroundImage: "radial-gradient(circle at center, #261f18 0%, #0f0d0b 100%)" }}
      >
        {/* Decorative corner brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-skyrim-gold/40" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-skyrim-gold/40" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-skyrim-gold/40" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-skyrim-gold/40" />

        {/* Close Button */}
        {isClosable && (
          <button 
            onClick={() => { playFlip(); onClose(); }}
            className="absolute top-4 right-4 text-gray-500 hover:text-skyrim-gold transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3.5 bg-skyrim-gold/5 border border-skyrim-gold/25 rounded-full mb-3 text-skyrim-gold animate-pulse">
            <Crown className="w-9 h-9" />
          </div>
          <h2 className="font-serif text-3xl font-black tracking-[0.15em] text-[#f1e5ac] uppercase skyrim-text-shadow">
            The Seer's Covenant
          </h2>
          <p className="font-sans text-[10px] tracking-[0.2em] text-skyrim-gold-light/60 uppercase mt-1.5 font-bold">
            Unlock the Infinite Sight of Sovngarde
          </p>
        </div>

        {/* Medieval Hook & Dual Currency Selector */}
        <div className="mb-6 space-y-3">
          <div className="px-4 py-3 border border-red-500/40 bg-red-950/40 text-red-200 rounded-sm text-xs font-serif leading-relaxed text-left space-y-1 shadow-inner">
            <div className="font-bold flex items-center space-x-1.5 text-amber-300">
              <Lock className="w-4 h-4 shrink-0 text-red-400" />
              <span>MANDATORY 7-DAY PAYMENT NOTICE</span>
            </div>
            <p className="text-[11px] text-gray-300 font-sans">
              All users who have had access to play under the Master Seer profile must settle the $2.99 USD covenant offering. If payment is not completed within 7 days, your account will be permanently banned and your IP address blocked from the system.
            </p>
          </div>

          {!isClosable && (
            <div className="px-4 py-2 border border-red-500/25 bg-red-950/20 text-[#f1e5ac] rounded-sm text-[11px] font-serif uppercase tracking-wider animate-pulse">
              🛡️ Thy One-Time Free Trial has Completed 🛡️
            </div>
          )}

          {/* Global Currency Toggle */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => { playTick(); setCurrency("USD"); }}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all cursor-pointer flex items-center space-x-1 ${
                currency === "USD"
                  ? "bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(212,175,55,0.3)] font-bold"
                  : "bg-black/40 border-gray-700 text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>🇺🇸 $ USD</span>
            </button>
            <button
              type="button"
              onClick={() => { playTick(); setCurrency("GBP"); }}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all cursor-pointer flex items-center space-x-1 ${
                currency === "GBP"
                  ? "bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(212,175,55,0.3)] font-bold"
                  : "bg-black/40 border-gray-700 text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>🇬🇧 £ GBP</span>
            </button>
          </div>

          <div className="inline-block px-5 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-sm">
            <span className="font-serif text-[#f1e5ac] text-base tracking-widest font-bold block">
              {currency === "USD" ? "$2.99 USD / moon (monthly)" : "£2.49 GBP / moon (monthly)"}
            </span>
            <span className="font-mono text-[9.5px] text-skyrim-gold/80 block mt-0.5">
              Dual Currency Accepted ($2.99 USD & £2.49 GBP)
            </span>
          </div>

          <p className="font-serif text-xs text-gray-300 italic leading-relaxed px-4">
            {!isClosable 
              ? "\"The gates have shut, pilgrim. Only those signed under the Seer's Covenant may continue to gaze into the cosmic scrolls.\""
              : "\"Only the initiated whose names are written in the scrolls of the high heavens may transcend the boundaries of the daily draws.\""}
          </p>
        </div>

        {/* Feature Breakdown Bento-like layout */}
        <div className="space-y-3.5 text-left bg-black/35 p-5 border border-skyrim-gold/10 rounded-sm mb-6">
          
          {/* Feature 1 */}
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-skyrim-gold/10 border border-skyrim-gold/25 rounded-sm mt-0.5 text-skyrim-gold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider">
                Unlimited Arcane Draws
              </h4>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5 leading-normal">
                Draw as many destiny cards as thy heart seeks, transcending the 1-draw daily trial.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-skyrim-gold/10 border border-skyrim-gold/25 rounded-sm mt-0.5 text-skyrim-gold">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider">
                The Synthesized Prophecy Scroll
              </h4>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5 leading-normal">
                Custom-weave thy personal journal entries and drawn card lore into a majestic physical parchment scroll, sealed by the seers.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-skyrim-gold/10 border border-skyrim-gold/25 rounded-sm mt-0.5 text-skyrim-gold">
              <Gem className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider">
                Full Seer Codex Access
              </h4>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5 leading-normal">
                Access advanced alignment filters, deep dream integration logs, and permanent cloud-synced quest logs.
              </p>
            </div>
          </div>

          {/* Feature 4: Global Network */}
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-skyrim-gold/10 border border-skyrim-gold/25 rounded-sm mt-0.5 text-skyrim-gold">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-serif text-xs font-bold text-[#f1e5ac] uppercase tracking-wider">
                Global Coven Access (USD $ / GBP £)
              </h4>
              <p className="font-sans text-[10px] text-gray-400 mt-0.5 leading-normal">
                Global user submissions unlocked. Connect with seekers from the UK, USA, and worldwide in USD ($) or GBP (£).
              </p>
            </div>
          </div>

        </div>

        {/* CTA Button */}
        <button
          onClick={handleAction}
          disabled={loading}
          className="w-full group relative py-3.5 bg-[#2a241e] border-2 border-skyrim-gold text-[#f1e5ac] hover:text-white hover:border-skyrim-gold-light hover:bg-[#3d342b] transition-all text-xs font-serif font-bold tracking-[0.25em] uppercase cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.98] shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-skyrim-gold" />
              <span>Chanting Incantations...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-skyrim-gold" />
              <span>Subscribe ({currency === "USD" ? "$2.99 USD" : "£2.49 GBP"})</span>
            </>
          )}
        </button>

        {/* Safe text & secure seal */}
        <div className="flex items-center justify-center mt-5 text-[9px] font-sans tracking-widest text-gray-500 uppercase space-x-2">
          <span>🔒 SECURED BY STRIPE</span>
          <span>•</span>
          <span>USD ($) & GBP (£) ACCEPTED</span>
          <span>•</span>
          <span>CANCEL ANYTIME</span>
        </div>

      </div>
    </div>
  );
};

