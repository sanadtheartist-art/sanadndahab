import React from 'react';

/**
 * Subtle, transparent decorative SVG elements themed around:
 * - Dahab / Sinai desert
 * - Underwater / coral / fish
 * - Art / painting / brushstrokes
 *
 * All are absolutely positioned, pointer-events: none, and very low opacity.
 */

const base = {
  position: 'absolute',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 0,
};

/* ─── UNDERWATER ─── */

export const CoralBranch = ({ style = {} }) => (
  <svg viewBox="0 0 200 300" fill="none" aria-hidden="true"
    style={{ ...base, width: '180px', opacity: 0.04, ...style }}>
    <path d="M100 300 C100 250 80 220 60 200 C40 180 30 150 40 120 C50 90 45 60 30 40 C25 30 20 15 25 5"
      stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M100 300 C100 260 110 230 120 210 C130 190 150 170 145 140 C140 110 155 80 170 55 C178 40 175 25 170 15"
      stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M60 200 C50 195 35 200 25 190 C15 180 10 165 15 155"
      stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M120 210 C135 205 150 215 160 205 C170 195 180 180 175 165"
      stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M40 120 C25 115 10 125 5 115"
      stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M145 140 C160 135 175 145 185 135"
      stroke="currentColor" strokeWidth="1.2" fill="none" />
  </svg>
);

export const Fish = ({ style = {}, flip = false }) => (
  <svg viewBox="0 0 80 40" fill="none" aria-hidden="true"
    style={{ ...base, width: '60px', opacity: 0.035, transform: flip ? 'scaleX(-1)' : 'none', ...style }}>
    <path d="M5 20 C15 8 30 4 50 10 C55 5 65 3 75 8 C65 12 60 10 55 12
             C60 16 62 22 60 28 C65 30 70 28 75 32 C65 37 55 35 50 30
             C30 36 15 32 5 20Z"
      stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="55" cy="18" r="2" fill="currentColor" opacity="0.5" />
  </svg>
);

export const Bubbles = ({ style = {} }) => (
  <svg viewBox="0 0 100 200" fill="none" aria-hidden="true"
    style={{ ...base, width: '80px', opacity: 0.04, ...style }}>
    <circle cx="30" cy="180" r="6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="50" cy="150" r="4" stroke="currentColor" strokeWidth="0.6" />
    <circle cx="35" cy="120" r="8" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="60" cy="90" r="3" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="45" cy="55" r="5" stroke="currentColor" strokeWidth="0.7" />
    <circle cx="55" cy="25" r="3.5" stroke="currentColor" strokeWidth="0.6" />
    <circle cx="70" cy="65" r="2" stroke="currentColor" strokeWidth="0.4" />
  </svg>
);

export const SeaWaves = ({ style = {} }) => (
  <svg viewBox="0 0 400 60" fill="none" aria-hidden="true"
    style={{ ...base, width: '100%', opacity: 0.03, ...style }}>
    <path d="M0 30 C20 20 40 40 60 30 C80 20 100 40 120 30 C140 20 160 40 180 30 C200 20 220 40 240 30 C260 20 280 40 300 30 C320 20 340 40 360 30 C380 20 400 40 400 30"
      stroke="currentColor" strokeWidth="1" />
    <path d="M0 45 C25 35 50 55 75 45 C100 35 125 55 150 45 C175 35 200 55 225 45 C250 35 275 55 300 45 C325 35 350 55 375 45 C400 35 400 45 400 45"
      stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
  </svg>
);

export const Starfish = ({ style = {} }) => (
  <svg viewBox="0 0 80 80" fill="none" aria-hidden="true"
    style={{ ...base, width: '50px', opacity: 0.035, ...style }}>
    <path d="M40 5 L46 28 L70 28 L50 42 L56 65 L40 52 L24 65 L30 42 L10 28 L34 28 Z"
      stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="40" cy="38" r="3" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

/* ─── DESERT / SINAI ─── */

export const MountainSilhouette = ({ style = {} }) => (
  <svg viewBox="0 0 500 150" fill="none" aria-hidden="true"
    style={{ ...base, width: '100%', opacity: 0.025, ...style }}>
    <path d="M0 150 L60 90 L100 110 L160 50 L200 80 L250 30 L300 70 L340 45 L380 85 L420 60 L460 95 L500 75 L500 150 Z"
      fill="currentColor" />
  </svg>
);

export const DesertDunes = ({ style = {} }) => (
  <svg viewBox="0 0 600 100" fill="none" aria-hidden="true"
    style={{ ...base, width: '100%', opacity: 0.025, ...style }}>
    <path d="M0 80 C50 60 100 75 150 65 C200 55 250 70 300 50 C350 30 400 60 450 55 C500 50 550 65 600 60 L600 100 L0 100 Z"
      fill="currentColor" />
  </svg>
);

/* ─── ART / PAINTING ─── */

export const BrushStroke = ({ style = {} }) => (
  <svg viewBox="0 0 300 40" fill="none" aria-hidden="true"
    style={{ ...base, width: '220px', opacity: 0.04, ...style }}>
    <path d="M5 20 C30 8 60 32 90 18 C120 4 150 28 180 15 C210 2 240 30 270 22 C280 19 290 23 295 20"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      style={{ strokeDasharray: '8 4' }} />
  </svg>
);

export const PaintSplatter = ({ style = {} }) => (
  <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"
    style={{ ...base, width: '90px', opacity: 0.03, ...style }}>
    <circle cx="50" cy="50" r="20" fill="currentColor" />
    <circle cx="30" cy="35" r="8" fill="currentColor" />
    <circle cx="72" cy="40" r="6" fill="currentColor" />
    <circle cx="65" cy="72" r="10" fill="currentColor" />
    <circle cx="35" cy="68" r="5" fill="currentColor" />
    <circle cx="22" cy="55" r="3" fill="currentColor" />
    <circle cx="78" cy="58" r="4" fill="currentColor" />
    <ellipse cx="50" cy="20" rx="4" ry="6" fill="currentColor" transform="rotate(-20,50,20)" />
    <ellipse cx="80" cy="50" rx="3" ry="7" fill="currentColor" transform="rotate(15,80,50)" />
  </svg>
);

export const PaintPalette = ({ style = {} }) => (
  <svg viewBox="0 0 120 100" fill="none" aria-hidden="true"
    style={{ ...base, width: '100px', opacity: 0.03, ...style }}>
    <path d="M60 10 C30 10 5 30 5 55 C5 80 30 90 60 90 C90 90 115 80 115 55 C115 30 90 10 60 10 Z"
      stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="35" cy="40" r="6" stroke="currentColor" strokeWidth="1" />
    <circle cx="55" cy="30" r="5" stroke="currentColor" strokeWidth="1" />
    <circle cx="75" cy="35" r="6" stroke="currentColor" strokeWidth="1" />
    <circle cx="85" cy="55" r="5" stroke="currentColor" strokeWidth="1" />
    <circle cx="40" cy="65" r="5" stroke="currentColor" strokeWidth="1" />
    {/* Thumb hole */}
    <circle cx="70" cy="65" r="10" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const PencilLine = ({ style = {} }) => (
  <svg viewBox="0 0 200 200" fill="none" aria-hidden="true"
    style={{ ...base, width: '160px', opacity: 0.03, ...style }}>
    <path d="M20 180 C40 160 50 140 60 110 C70 80 85 60 100 45 C115 30 130 20 150 15 C160 12 170 15 175 20"
      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <path d="M175 20 L180 10 L185 22 Z" fill="currentColor" opacity="0.5" />
  </svg>
);
