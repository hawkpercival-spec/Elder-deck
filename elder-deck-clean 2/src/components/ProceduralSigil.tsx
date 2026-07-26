import React from "react";
import { Card } from "../data/cards";

interface ProceduralSigilProps {
  card: Card;
  className?: string;
}

// Simple seedable random generator (SFC32)
const getSeededRandom = (seedStr: string) => {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^ (h >>> 16)) >>> 0;
  return () => {
    a = (a + 0x7ed55d16) + (a << 12);
    a = (a ^ 0xc761c23c) ^ (a >>> 19);
    a = (a + 0x165667b1) + (a << 5);
    a = (a + 0xd3a2646c) ^ (a << 9);
    a = (a + 0xfd7046c5) + (a << 3);
    a = (a ^ 0xb55a4f09) ^ (a >>> 16);
    return (a >>> 0) / 4294967296;
  };
};

export const ProceduralSigil: React.FC<ProceduralSigilProps> = ({ card, className = "" }) => {
  const rand = getSeededRandom(card.id);

  const archetype = card.archetype;
  const rarity = card.rarity;

  // Primary colors based on archetype and rarity
  const primaryColors = {
    Warrior: {
      light: "#f87171", // red-400
      main: "#ef4444",  // red-500
      dark: "#7f1d1d",  // red-900
      glow: "rgba(239, 68, 68, 0.4)",
    },
    Mage: {
      light: "#22d3ee", // cyan-400
      main: "#06b6d4",  // cyan-500
      dark: "#083344",  // cyan-900
      glow: "rgba(6, 182, 212, 0.4)",
    },
    Thief: {
      light: "#34d399", // emerald-400
      main: "#10b981",  // emerald-500
      dark: "#064e3b",  // emerald-950
      glow: "rgba(16, 185, 129, 0.4)",
    },
    Fate: {
      light: "#f472b6", // pink-400
      main: "#ec4899",  // pink-500
      dark: "#500724",  // pink-950
      glow: "rgba(236, 72, 153, 0.4)",
    },
  }[archetype] || {
    light: "#fbbf24",
    main: "#f59e0b",
    dark: "#78350f",
    glow: "rgba(245, 158, 11, 0.4)",
  };

  const goldColor = "#d4af37";
  const bronzeColor = "#cd7f32";

  // Determine background complexity based on rarity
  const constellationCount = {
    Common: 5,
    Rare: 8,
    Epic: 12,
    Legendary: 18,
  }[rarity] || 8;

  // Generate constellation coordinates
  const stars: Array<{ x: number; y: number; size: number }> = [];
  for (let i = 0; i < constellationCount; i++) {
    stars.push({
      x: 30 + Math.floor(rand() * 140),
      y: 30 + Math.floor(rand() * 140),
      size: rand() * 2 + 1,
    });
  }

  // Draw connecting star constellation lines
  const constellationLines: Array<{ from: number; to: number }> = [];
  if (stars.length > 1) {
    for (let i = 0; i < stars.length - 1; i++) {
      if (rand() < 0.6) {
        constellationLines.push({
          from: i,
          to: (i + 1) % stars.length,
        });
      }
      if (rand() < 0.3) {
        constellationLines.push({
          from: i,
          to: Math.floor(rand() * stars.length),
        });
      }
    }
  }

  // Deterministically select visual layers
  const innerRingRadius = 45 + Math.floor(rand() * 15);
  const outerRingRadius = 65 + Math.floor(rand() * 15);
  const geometricSides = [0, 3, 4, 5, 6, 8, 12][Math.floor(rand() * 7)]; // 0 = circle, others = polygons
  const sigilRotation = Math.floor(rand() * 360);
  const dashPattern = [
    "none",
    "4 4",
    "10 5",
    "12 3 3 3",
    "20 10",
  ][Math.floor(rand() * 5)];

  // Central symbol selector
  const centralSymbolId = Math.floor(rand() * 4); // 4 possibilities per archetype

  const renderCentralSymbol = () => {
    switch (archetype) {
      case "Warrior":
        if (centralSymbolId === 0) {
          // Crossed Swords
          return (
            <g transform="translate(100, 100) scale(0.9)">
              {/* Sword 1 */}
              <g transform="rotate(45)">
                <path d="M 0,-40 L 4,-35 L 4,15 L 8,15 L 8,19 L 3,19 L 3,30 Q 3,33 0,33 Q -3,33 -3,30 L -3,19 L -8,19 L -8,15 L -4,15 L -4,-35 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1" />
                <line x1="0" y1="-38" x2="0" y2="15" stroke={primaryColors.dark} strokeWidth="1" />
              </g>
              {/* Sword 2 */}
              <g transform="rotate(-45)">
                <path d="M 0,-40 L 4,-35 L 4,15 L 8,15 L 8,19 L 3,19 L 3,30 Q 3,33 0,33 Q -3,33 -3,30 L -3,19 L -8,19 L -8,15 L -4,15 L -4,-35 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1" />
                <line x1="0" y1="-38" x2="0" y2="15" stroke={primaryColors.dark} strokeWidth="1" />
              </g>
            </g>
          );
        } else if (centralSymbolId === 1) {
          // Medieval Shield
          return (
            <g transform="translate(100, 100)">
              <path d="M -25,-30 L 25,-30 Q 25,0 0,35 Q -25,0 -25,-30 Z" fill={primaryColors.main} stroke={goldColor} strokeWidth="2.5" />
              <path d="M -20,-25 L 20,-25 Q 20,0 0,28 Q -20,0 -20,-25 Z" fill="none" stroke={primaryColors.dark} strokeWidth="1" strokeDasharray="3 3" />
              {/* Shield emblem - dragon claw or cross */}
              <path d="M -8,-5 L 8,-5 M 0,-15 L 0,15" stroke={goldColor} strokeWidth="3" strokeLinecap="round" />
            </g>
          );
        } else if (centralSymbolId === 2) {
          // Battle Axe
          return (
            <g transform="translate(100, 100) scale(0.95)">
              <line x1="0" y1="-45" x2="0" y2="45" stroke={bronzeColor} strokeWidth="3.5" strokeLinecap="round" />
              {/* Left Blade */}
              <path d="M 0,-25 Q -20,-20 -25,-10 Q -15,0 0,5 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1.2" />
              {/* Right Blade */}
              <path d="M 0,-25 Q 20,-20 25,-10 Q 15,0 0,5 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1.2" />
              {/* Top point */}
              <path d="M -3,-44 L 0,-52 L 3,-44 Z" fill={goldColor} />
            </g>
          );
        } else {
          // Sovereign Dragon Emblem
          return (
            <g transform="translate(100, 100) scale(0.85)">
              <path d="M 0,-35 C -15,-20 -25,0 -10,15 C -5,20 5,20 10,15 C 25,0 15,-20 0,-35 Z" fill="none" stroke={goldColor} strokeWidth="2" />
              <path d="M -15,-5 Q 0,10 15,-5 Q 0,-30 -15,-5 Z" fill={primaryColors.main} opacity="0.8" />
              <circle cx="0" cy="-10" r="5" fill={goldColor} />
              <path d="M -5,12 L 0,25 L 5,12 Z" fill={goldColor} />
            </g>
          );
        }

      case "Mage":
        if (centralSymbolId === 0) {
          // Eye of Magnus / Eye of Fate
          return (
            <g transform="translate(100, 100)">
              <path d="M -35,0 Q 0,-25 35,0 Q 0,25 -35,0 Z" fill="none" stroke={goldColor} strokeWidth="2" />
              <circle cx="0" cy="0" r="14" fill={primaryColors.main} stroke={goldColor} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill="#000000" />
              <circle cx="2" cy="-2" r="2.5" fill="#ffffff" />
              {/* Arcane radiating lines */}
              <line x1="0" y1="-28" x2="0" y2="-17" stroke={primaryColors.light} strokeWidth="1.5" />
              <line x1="0" y1="17" x2="0" y2="28" stroke={primaryColors.light} strokeWidth="1.5" />
              <line x1="-38" y1="0" x2="-22" y2="0" stroke={primaryColors.light} strokeWidth="1.5" />
              <line x1="22" y1="0" x2="38" y2="0" stroke={primaryColors.light} strokeWidth="1.5" />
            </g>
          );
        } else if (centralSymbolId === 1) {
          // Arcane Star / Hexagram
          return (
            <g transform="translate(100, 100)">
              {/* Star of David / Seal style */}
              <polygon points="0,-35 30,17 -30,17" fill="none" stroke={primaryColors.light} strokeWidth="2" />
              <polygon points="0,35 30,-17 -30,-17" fill="none" stroke={primaryColors.light} strokeWidth="2" />
              <circle cx="0" cy="0" r="10" fill="none" stroke={goldColor} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4" fill={goldColor} />
            </g>
          );
        } else if (centralSymbolId === 2) {
          // Blazing Fire Mana Seal
          return (
            <g transform="translate(100, 100) scale(0.9)">
              <path d="M 0,35 Q -25,10 -15,-15 Q -30,-5 -5,-40 Q 5,-20 20,-25 Q 5,0 15,15 Q 10,30 0,35 Z" fill={primaryColors.main} stroke={goldColor} strokeWidth="1.5" />
              <path d="M 0,30 Q -15,10 -8,-8 Q -15,0 0,-25 Q 5,-10 10,-12 Q 2,5 8,15 Z" fill="#fff7ed" opacity="0.9" />
            </g>
          );
        } else {
          // Magic Staff of Winterhold
          return (
            <g transform="translate(100, 100)">
              <line x1="0" y1="-50" x2="0" y2="50" stroke={bronzeColor} strokeWidth="3" />
              <circle cx="0" cy="-45" r="10" fill={primaryColors.light} stroke={goldColor} strokeWidth="1.5" className="animate-pulse" />
              {/* Twin wings clamping the crystal */}
              <path d="M -10,-40 Q -15,-50 -2,-52 Q -6,-44 0,-40" fill={goldColor} />
              <path d="M 10,-40 Q 15,-50 2,-52 Q 6,-44 0,-40" fill={goldColor} />
            </g>
          );
        }

      case "Thief":
        if (centralSymbolId === 0) {
          // Silent Nightingale Mask / Crest
          return (
            <g transform="translate(100, 100) scale(0.9)">
              <path d="M -25,-20 C -20,-35 20,-35 25,-20 C 25,0 0,35 0,35 C 0,35 -25,0 -25,-20 Z" fill={primaryColors.dark} stroke={goldColor} strokeWidth="2" />
              {/* Slit eyes */}
              <path d="M -12,-10 Q -6,-6 0,-10" fill="none" stroke={primaryColors.light} strokeWidth="2" strokeLinecap="round" />
              <path d="M 12,-10 Q 6,-6 0,-10" fill="none" stroke={primaryColors.light} strokeWidth="2" strokeLinecap="round" />
              {/* Crescent Moon overlay */}
              <path d="M -15,10 Q 0,22 15,10 Q 0,14 -15,10" fill={goldColor} />
            </g>
          );
        } else if (centralSymbolId === 1) {
          // Thief's Key / Key of Nocturnal
          return (
            <g transform="translate(100, 100) rotate(-45)">
              {/* Bow */}
              <circle cx="0" cy="-30" r="12" fill="none" stroke={goldColor} strokeWidth="3.5" />
              <circle cx="0" cy="-30" r="5" fill="none" stroke={goldColor} strokeWidth="1" />
              {/* Shank */}
              <line x1="0" y1="-18" x2="0" y2="30" stroke={goldColor} strokeWidth="4" strokeLinecap="round" />
              {/* Bit */}
              <path d="M 0,15 L 12,15 L 12,22 L 6,22 L 6,28 L 0,28 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="0.8" />
            </g>
          );
        } else if (centralSymbolId === 2) {
          // Double Assassin Daggers
          return (
            <g transform="translate(100, 100)">
              {/* Dagger 1 */}
              <g transform="rotate(20) translate(0, -5) scale(0.85)">
                <path d="M 0,-40 L 5,-25 L 3,15 L -3,15 L -5,-25 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1" />
                <rect x="-8" y="15" width="16" height="4" rx="1" fill={bronzeColor} />
                <rect x="-2" y="19" width="4" height="15" fill={bronzeColor} />
                <circle cx="0" cy="34" r="3" fill={goldColor} />
              </g>
              {/* Dagger 2 */}
              <g transform="rotate(-160) translate(0, -5) scale(0.85)">
                <path d="M 0,-40 L 5,-25 L 3,15 L -3,15 L -5,-25 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1" />
                <rect x="-8" y="15" width="16" height="4" rx="1" fill={bronzeColor} />
                <rect x="-2" y="19" width="4" height="15" fill={bronzeColor} />
                <circle cx="0" cy="34" r="3" fill={goldColor} />
              </g>
            </g>
          );
        } else {
          // Gilded Coin / Treasury Seal
          return (
            <g transform="translate(100, 100)">
              <circle cx="0" cy="0" r="28" fill={goldColor} stroke={primaryColors.dark} strokeWidth="2.5" />
              <circle cx="0" cy="0" r="23" fill="none" stroke={primaryColors.dark} strokeWidth="1" strokeDasharray="3 3" />
              {/* Center feline crown or claw */}
              <path d="M -12,5 L -4,-12 L 4,-12 L 12,5 Z" fill={primaryColors.dark} />
              <circle cx="0" cy="2" r="5" fill={goldColor} />
            </g>
          );
        }

      default: // Fate
        if (centralSymbolId === 0) {
          // Hourglass of Eternity
          return (
            <g transform="translate(100, 100) scale(0.9)">
              <path d="M -18,-30 L 18,-30 L 18,-24 L 2,-2 Q 1,-1 0,0 Q -1,-1 -2,-2 L -18,-24 Z" fill="none" stroke={goldColor} strokeWidth="2.5" />
              <path d="M -18,30 L 18,30 L 18,24 L 2,2 Q 1,1 0,0 Q -1,1 -2,2 L -18,24 Z" fill="none" stroke={goldColor} strokeWidth="2.5" />
              {/* Sand running or filled */}
              <path d="M -12,28 L 12,28 L 8,14 L -8,14 Z" fill={primaryColors.main} opacity="0.8" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke={primaryColors.light} strokeWidth="1.5" strokeDasharray="2 3" />
              {/* Hourglass frames */}
              <line x1="-18" y1="-30" x2="-18" y2="30" stroke={goldColor} strokeWidth="2" />
              <line x1="18" y1="-30" x2="18" y2="30" stroke={goldColor} strokeWidth="2" />
            </g>
          );
        } else if (centralSymbolId === 1) {
          // Cosmic Eclipse / Moon and Sun
          return (
            <g transform="translate(100, 100)">
              <circle cx="0" cy="0" r="25" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1" />
              {/* Shrouding moon silhouette */}
              <path d="M 0,-25 A 25,25 0 0,0 0,25 A 21,21 0 0,1 0,-25" fill={primaryColors.dark} />
              {/* Radiating sunbeams on the gold side */}
              <line x1="15" y1="-15" x2="26" y2="-26" stroke={goldColor} strokeWidth="2" />
              <line x1="25" y1="0" x2="37" y2="0" stroke={goldColor} strokeWidth="2" />
              <line x1="15" y1="15" x2="26" y2="26" stroke={goldColor} strokeWidth="2" />
            </g>
          );
        } else if (centralSymbolId === 2) {
          // Labyrinth of Doom
          return (
            <g transform="translate(100, 100)">
              <circle cx="0" cy="0" r="28" fill="none" stroke={goldColor} strokeWidth="2.5" />
              <circle cx="0" cy="0" r="20" fill="none" stroke={goldColor} strokeWidth="2.5" strokeDasharray="40 10 30 10" />
              <circle cx="0" cy="0" r="12" fill="none" stroke={goldColor} strokeWidth="2.5" strokeDasharray="15 8 15 5" />
              <circle cx="0" cy="0" r="4" fill={primaryColors.light} />
            </g>
          );
        } else {
          // Crown of Destiny / Constellation Throne
          return (
            <g transform="translate(100, 100) scale(0.9)">
              <path d="M -24,12 L -18,-18 L -6,-4 L 0,-24 L 6,-4 L 18,-18 L 24,12 Z" fill={goldColor} stroke={primaryColors.dark} strokeWidth="1.5" />
              <rect x="-24" y="12" width="48" height="6" fill={bronzeColor} rx="1" />
              {/* Jewels on crown points */}
              <circle cx="-18" cy="-18" r="3" fill={primaryColors.light} />
              <circle cx="0" cy="-24" r="3.5" fill={primaryColors.light} />
              <circle cx="18" cy="-18" r="3" fill={primaryColors.light} />
            </g>
          );
        }
    }
  };

  // Helper to draw custom polygons for geometric backgrounds
  const drawPolygonPath = (cx: number, cy: number, r: number, sides: number) => {
    if (sides <= 2) return "";
    let points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return `M ${points.join(" L ")} Z`;
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      style={{
        background: `radial-gradient(circle, ${primaryColors.dark} 0%, #000000 100%)`,
      }}
    >
      <defs>
        {/* Subtle radial glow filter */}
        <filter id="sigilGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Ancient scratchy line texture */}
        <pattern id="scratch" width="100" height="100" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100" y2="100" stroke="#ffffff" strokeWidth="0.5" opacity="0.04" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#ffffff" strokeWidth="0.5" opacity="0.03" />
        </pattern>
      </defs>

      {/* Textured background */}
      <rect width="200" height="200" fill="url(#scratch)" />

      {/* ================= LAYER 1: CELESTIAL CONSTELLATION ================= */}
      <g opacity="0.35">
        {constellationLines.map((line, idx) => {
          const fromStar = stars[line.from];
          const toStar = stars[line.to];
          if (!fromStar || !toStar) return null;
          return (
            <line
              key={`line-${idx}`}
              x1={fromStar.x}
              y1={fromStar.y}
              x2={toStar.x}
              y2={toStar.y}
              stroke={primaryColors.light}
              strokeWidth="0.8"
            />
          );
        })}
        {stars.map((star, idx) => (
          <circle
            key={`star-${idx}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="#ffffff"
            className="animate-pulse"
            style={{ animationDuration: `${1 + (idx % 3)}s` }}
          />
        ))}
      </g>

      {/* ================= LAYER 2: OUTER RUNIC CHARACTERS / FRAME ================= */}
      {/* Outer Circle Ring */}
      <circle
        cx="100"
        cy="100"
        r={outerRingRadius}
        fill="none"
        stroke={goldColor}
        strokeWidth="1.2"
        opacity="0.5"
      />
      <circle
        cx="100"
        cy="100"
        r={outerRingRadius - 4}
        fill="none"
        stroke={primaryColors.light}
        strokeWidth="1"
        strokeDasharray={dashPattern}
        opacity="0.7"
      />

      {/* Geometric background polygons */}
      {geometricSides > 2 && (
        <path
          d={drawPolygonPath(100, 100, innerRingRadius, geometricSides)}
          fill="none"
          stroke={goldColor}
          strokeWidth="0.8"
          opacity="0.4"
          transform={`rotate(${sigilRotation}, 100, 100)`}
        />
      )}

      {/* Inner circular frame */}
      <circle
        cx="100"
        cy="100"
        r={innerRingRadius}
        fill="none"
        stroke={goldColor}
        strokeWidth="1.5"
        opacity="0.65"
      />

      {/* ================= LAYER 3: THE CORE SYMBOL ================= */}
      <g filter="url(#sigilGlow)">
        {renderCentralSymbol()}
      </g>

      {/* Decorative center radial ticks */}
      <g opacity="0.3" transform="translate(100,100)">
        {Array.from({ length: 8 }).map((_, idx) => (
          <line
            key={`tick-${idx}`}
            x1="0"
            y1={innerRingRadius - 8}
            x2="0"
            y2={innerRingRadius}
            stroke={goldColor}
            strokeWidth="1.2"
            transform={`rotate(${idx * 45})`}
          />
        ))}
      </g>

      {/* Inner small details around center */}
      <circle
        cx="100"
        cy="100"
        r="38"
        fill="none"
        stroke={goldColor}
        strokeWidth="0.6"
        strokeDasharray="2 4"
        opacity="0.4"
      />
    </svg>
  );
};
