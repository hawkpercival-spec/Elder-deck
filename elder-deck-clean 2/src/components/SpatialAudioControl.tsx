import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Wind, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  RotateCcw, 
  Headphones, 
  Zap, 
  X, 
  Check, 
  Compass,
  Layers,
  Music
} from "lucide-react";
import { sfx } from "../utils/audio";

interface SpatialAudioControlProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpatialAudioControl: React.FC<SpatialAudioControlProps> = ({ isOpen, onClose }) => {
  const [spatialState, setSpatialState] = useState(() => sfx.getSpatialAudioState());
  const [activePreset, setActivePreset] = useState<string>("full_immersion");
  const [radarPulse, setRadarPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarPulse((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleMasterToggle = () => {
    const newState = sfx.toggleSpatialAudio();
    setSpatialState(sfx.getSpatialAudioState());
  };

  const handleVolumeChange = (type: "master" | "fireplace" | "wind" | "chant", value: number) => {
    if (type === "master") {
      sfx.setSpatialVolumes({ master: value });
    } else if (type === "fireplace") {
      sfx.setSpatialVolumes({ fireplace: value });
    } else if (type === "wind") {
      sfx.setSpatialVolumes({ wind: value });
    } else if (type === "chant") {
      sfx.setSpatialVolumes({ chant: value });
    }
    setSpatialState(sfx.getSpatialAudioState());
  };

  const handleApplyPreset = (presetKey: "hearthside" | "mountain_peak" | "runic_shrine" | "full_immersion") => {
    setActivePreset(presetKey);
    if (!spatialState.isSpatialAudioOn) {
      sfx.toggleSpatialAudio(true);
    }
    sfx.applySpatialPreset(presetKey);
    setSpatialState(sfx.getSpatialAudioState());
    sfx.triggerSpatialFlip("Rare", 0);
  };

  const handleTestFlipLeft = () => {
    sfx.triggerSpatialFlip("Epic", -0.85);
  };

  const handleTestFlipCenter = () => {
    sfx.triggerSpatialFlip("Legendary", 0);
  };

  const handleTestFlipRight = () => {
    sfx.triggerSpatialFlip("Rare", +0.85);
  };

  const handleTestShuffle = () => {
    sfx.triggerSpatialShuffle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#14100c] border-2 border-skyrim-gold/30 rounded-lg p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col space-y-6 text-[#e8dfc8]"
        id="spatial-audio-modal"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-skyrim-gold/20 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-md bg-[#241a13] border border-skyrim-gold/30 text-skyrim-gold shadow-md">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-skyrim-gold-light tracking-wider uppercase flex items-center gap-2">
                3D Spatial Soundscape
                <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 font-sans tracking-normal font-normal">
                  Web Audio 3D Panning
                </span>
              </h2>
              <p className="text-xs text-stone-400 font-serif">
                Immersive environment with reactive card flipping & shuffling acoustic responses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-900 border border-stone-700 text-stone-400 hover:text-white hover:border-skyrim-gold transition-colors cursor-pointer"
            id="close-spatial-audio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Spatial Toggle Switch */}
        <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
          spatialState.isSpatialAudioOn
            ? "bg-[#251b14] border-amber-500/50 shadow-[0_0_20px_rgba(217,119,6,0.15)]"
            : "bg-stone-950/60 border-stone-800"
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${spatialState.isSpatialAudioOn ? "bg-amber-500 text-black animate-bounce" : "bg-stone-800 text-stone-500"}`}>
              {spatialState.isSpatialAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-skyrim-gold-light">
                Master 3D Spatial Audio {spatialState.isSpatialAudioOn ? "(ACTIVE)" : "(OFF)"}
              </div>
              <div className="text-xs text-stone-400">
                Simulates real-time 3D acoustics for hearthfire, wind, and runic chanting
              </div>
            </div>
          </div>

          <button
            onClick={handleMasterToggle}
            className={`px-5 py-2.5 rounded-md font-serif text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border ${
              spatialState.isSpatialAudioOn
                ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                : "bg-stone-800 text-stone-300 border-stone-600 hover:bg-stone-700"
            }`}
            id="toggle-spatial-master"
          >
            {spatialState.isSpatialAudioOn ? "Deactivate" : "Activate 3D Audio"}
          </button>
        </div>

        {/* 3D Spatial Radar Visualizer */}
        <div className="relative w-full h-44 bg-black/60 rounded-lg border border-skyrim-gold/20 overflow-hidden flex items-center justify-center p-3 shadow-inner">
          {/* Radar Grid Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-36 rounded-full border border-skyrim-gold/15 animate-ping opacity-25" />
            <div className="w-32 h-32 rounded-full border border-skyrim-gold/20" />
            <div className="w-20 h-20 rounded-full border border-skyrim-gold/30" />
            <div className="absolute w-full h-[1px] bg-skyrim-gold/10" />
            <div className="absolute h-full w-[1px] bg-skyrim-gold/10" />
          </div>

          {/* Radar Sweep Line */}
          <div 
            className="absolute w-20 h-20 rounded-full border-t-2 border-amber-400/50 pointer-events-none transition-transform duration-75"
            style={{ transform: `rotate(${radarPulse * 3.6}deg)` }}
          />

          {/* Node 1: Left Hearth (Fireplace) */}
          <div className="absolute left-[18%] top-[45%] flex flex-col items-center -translate-y-1/2 group">
            <div className={`p-2 rounded-full border transition-all ${
              spatialState.isSpatialAudioOn && spatialState.fireplaceVolume > 0
                ? "bg-amber-950 text-amber-400 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse"
                : "bg-stone-900 text-stone-600 border-stone-800"
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-serif uppercase tracking-wider text-amber-200 mt-1">Tavern Hearth</span>
            <span className="text-[9px] text-stone-500">Pan: -0.5 (Left)</span>
          </div>

          {/* Node 2: Overhead Orbit (Mountain Wind) */}
          <div 
            className="absolute flex flex-col items-center -translate-x-1/2 transition-all duration-300"
            style={{ 
              left: `${50 + Math.sin(radarPulse * 0.08) * 35}%`,
              top: `${25 + Math.cos(radarPulse * 0.08) * 12}%`
            }}
          >
            <div className={`p-2 rounded-full border transition-all ${
              spatialState.isSpatialAudioOn && spatialState.windVolume > 0
                ? "bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                : "bg-stone-900 text-stone-600 border-stone-800"
            }`}>
              <Wind className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-serif uppercase tracking-wider text-cyan-200 mt-1">Mountain Winds</span>
            <span className="text-[9px] text-cyan-400">Swirling Orbit</span>
          </div>

          {/* Node 3: Right Shrine (Runic Chanting) */}
          <div className="absolute right-[18%] top-[45%] flex flex-col items-center -translate-y-1/2 group">
            <div className={`p-2 rounded-full border transition-all ${
              spatialState.isSpatialAudioOn && spatialState.chantVolume > 0
                ? "bg-purple-950 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.6)] animate-pulse"
                : "bg-stone-900 text-stone-600 border-stone-800"
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-serif uppercase tracking-wider text-purple-200 mt-1">Runic Chanting</span>
            <span className="text-[9px] text-stone-500">Pan: +0.5 (Right)</span>
          </div>

          {/* Center Listener Position */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-skyrim-gold border border-white shadow-[0_0_8px_white] animate-ping" />
            <span className="text-[9px] font-serif font-bold text-skyrim-gold uppercase mt-1">Player Altar</span>
          </div>
        </div>

        {/* Spatial Presets Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-serif font-bold uppercase tracking-wider text-skyrim-gold text-stone-300">
            Acoustic Environment Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "hearthside", label: "Tavern Hearth", icon: Flame, color: "text-amber-400" },
              { id: "mountain_peak", label: "Mountain Peak", icon: Wind, color: "text-cyan-400" },
              { id: "runic_shrine", label: "Runic Shrine", icon: Sparkles, color: "text-purple-400" },
              { id: "full_immersion", label: "Full Immersion", icon: Radio, color: "text-yellow-400" }
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as any)}
                  className={`flex items-center space-x-2 p-2.5 rounded border text-xs font-serif transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-900/40 border-amber-500 text-skyrim-gold-light shadow-md"
                      : "bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${p.color}`} />
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spatial Audio Channel Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-950/40 border border-stone-800 p-4 rounded-lg">
          {/* Channel 1: Fireplace */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-serif">
              <span className="flex items-center space-x-1.5 text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Fireplace Roar</span>
              </span>
              <span className="text-stone-400 text-[10px] font-mono">{Math.round(spatialState.fireplaceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={spatialState.fireplaceVolume}
              onChange={(e) => handleVolumeChange("fireplace", parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Channel 2: Wind */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-serif">
              <span className="flex items-center space-x-1.5 text-cyan-300">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mountain Winds</span>
              </span>
              <span className="text-stone-400 text-[10px] font-mono">{Math.round(spatialState.windVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={spatialState.windVolume}
              onChange={(e) => handleVolumeChange("wind", parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Channel 3: Chanting */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-serif">
              <span className="flex items-center space-x-1.5 text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Runic Chanting</span>
              </span>
              <span className="text-stone-400 text-[10px] font-mono">{Math.round(spatialState.chantVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={spatialState.chantVolume}
              onChange={(e) => handleVolumeChange("chant", parseFloat(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Interactive Spatial Testing Suite */}
        <div className="flex flex-col space-y-2 border-t border-skyrim-gold/20 pt-4">
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-skyrim-gold">
            Test Interactive Card Reactions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={handleTestFlipLeft}
              className="px-3 py-2 rounded bg-amber-950/60 border border-amber-600/40 hover:bg-amber-900 text-amber-200 text-xs font-serif transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Flip (Left -0.85)</span>
            </button>

            <button
              onClick={handleTestFlipCenter}
              className="px-3 py-2 rounded bg-purple-950/60 border border-purple-600/40 hover:bg-purple-900 text-purple-200 text-xs font-serif transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Flip (Center)</span>
            </button>

            <button
              onClick={handleTestFlipRight}
              className="px-3 py-2 rounded bg-cyan-950/60 border border-cyan-600/40 hover:bg-cyan-900 text-cyan-200 text-xs font-serif transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flip (Right +0.85)</span>
            </button>

            <button
              onClick={handleTestShuffle}
              className="px-3 py-2 rounded bg-yellow-950/60 border border-yellow-600/40 hover:bg-yellow-900 text-yellow-200 text-xs font-serif transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
              <span>Spatial Shuffle Sweep</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 font-serif pt-2">
          <span>Stereo Panning engine uses native Web Audio StereoPanner API</span>
          <button
            onClick={onClose}
            className="text-skyrim-gold-light hover:underline font-bold uppercase tracking-wider cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
