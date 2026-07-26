import React, { useEffect } from "react";
import { Heart, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import { sfx } from "../utils/audio";

interface ElliotPopupProps {
  onClose: () => void;
}

export const ElliotPopup: React.FC<ElliotPopupProps> = ({ onClose }) => {
  useEffect(() => {
    // Play a gorgeous legendary minor/major chord sequence on mount
    sfx.playMysticChime("Legendary");
  }, []);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="relative max-w-md w-full bg-[#1c1612]/95 border-2 border-skyrim-gold/60 text-[#f1e5ac] p-8 rounded-lg shadow-[0_10px_50px_rgba(0,0,0,0.95)] overflow-hidden text-center"
      >
        {/* Subtle, romantic dark parchment texture backing */}
        <div className="absolute inset-0 bg-radial-gradient from-red-950/20 via-transparent to-transparent pointer-events-none opacity-60" />

        {/* Skyrim-inspired corner brass/gold accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-550 hover:text-skyrim-gold transition-colors cursor-pointer p-1"
          title="Seal Decree"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing Hearts & Sparkles Animation Header */}
        <div className="flex justify-center items-center space-x-3 mb-6 relative">
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [-5, 5, -5]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.2, 
              ease: "easeInOut" 
            }}
            className="relative"
          >
            <Heart className="w-14 h-14 text-rose-500 fill-rose-600 drop-shadow-[0_0_15px_rgba(244,63,94,0.7)]" />
            <Sparkles className="w-6 h-6 text-skyrim-gold absolute -top-1 -right-2 animate-pulse" />
          </motion.div>
        </div>

        {/* Decree Title */}
        <span className="text-[10px] font-serif font-black tracking-[0.3em] uppercase block mb-2 text-skyrim-gold/80">
          ✦ Decree of the Hearth ✦
        </span>

        <h2 className="font-medieval text-2xl tracking-wide text-skyrim-gold mb-4 leading-snug">
          I Love You, Elliot
        </h2>

        {/* Scroll Divider */}
        <div className="flex items-center justify-center space-x-2 my-4 opacity-65">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#d4af37]/60" />
          <span className="text-xs text-[#d4af37]">❦</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#d4af37]/60" />
        </div>

        {/* Romantic Medieval Body Text */}
        <p className="font-serif text-sm leading-relaxed text-gray-200 px-2 mb-6 italic">
          "For though the cosmos align, and the stars cast their final light, thy presence remains the most pristine and eternal oracle of all. The runes and the heavens have spoken—thou art deeply, truly cherished."
        </p>

        {/* Call to Action Button */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-b from-[#8f2420] to-[#5a1411] border border-[#d4af37]/50 rounded-sm font-medieval font-bold text-[#f1e5ac] tracking-widest text-sm hover:from-[#aa2e29] hover:to-[#6f1c18] transition-all cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        >
          ACCEPT DESTINY'S DECREE
        </motion.button>
      </motion.div>
    </div>
  );
};
