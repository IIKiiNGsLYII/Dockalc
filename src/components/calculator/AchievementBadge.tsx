/**
 * AchievementBadge: tiered SVG badge icons for Dockalc achievements.
 *
 * Usage (replaces rendering of `achievement.icon`):
 *   <AchievementBadge achievement={achievement} size={130} />
 *
 * Tier is resolved from `achievement.tier`, with two overrides that match the
 * special cases already in MilestoneCelebrationModal:
 *   - `all-milestones-epic` (or tier 'epic')      -> epic
 *   - `calc-100k`, `custom-key-100k`              -> apex
 * Unknown badge ids fall back to a glyph chosen by `category`, so new badges
 * added to ACHIEVEMENTS_LIST render correctly without touching this file.
 *
 * The SVG markup is generated only from the static tables below plus a hash of
 * the badge id, so no user-supplied text is ever injected into the markup.
 * Each badge carries its own <defs> with unique ids, so it works in any number
 * of places on a page (modal, grids, lists).
 */
import React, { useId, useMemo } from 'react';
import type { AchievementItem } from '@/lib/numberMagic';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legendary' | 'apex' | 'epic';

const TIERS: BadgeTier[] = ['bronze', 'silver', 'gold', 'legendary', 'apex', 'epic'];
const APEX_IDS = new Set(['calc-100k', 'custom-key-10k', 'custom-key-100k']);

export function resolveBadgeTier(a: Pick<AchievementItem, 'id' | 'tier'>): BadgeTier {
  if (a.tier === 'epic' || a.id === 'all-milestones-epic') return 'epic';
  if (APEX_IDS.has(a.id)) return 'apex';
  return (a.tier as BadgeTier | undefined) ?? 'bronze';
}

// [light, mid, dark, face, ink] per tier
const C: string[][] = [
  ['#f0b98d', '#b0652f', '#6b3a17', '#4a2410', '#ffd9b3'],
  ['#ffffff', '#b4bdca', '#667184', '#3b4453', '#f4f7fb'],
  ['#fff3b0', '#f5b800', '#a56a00', '#6d4400', '#fff3b0'],
  ['#f5d0fe', '#a855f7', '#4c1d95', '#2e1065', '#f5d0fe'],
  ['#fff7c2', '#ffb300', '#c2410c', '#7c2d12', '#fff7c2'],
  ['#ff4d4d', '#9333ea', '#f59e0b', '#150a2b', '#ffffff'],
];
const FACE_LIGHTNESS = [20, 24, 17, 17, 19, 10];

// Glyph per badge id. "t:" = text label, "ck:" = gear with label, otherwise a key in G.
const ID_GLYPH: Record<string, string> = {
  'first-step': 'sprout', 'decade-club': 't:10', 'quarter-century': 't:25', 'half-century': 't:50',
  'centurion': 't:100', 'calculation-maestro': 't:250', 'math-legend': 't:500', 'grandmaster-1k': 't:1K',
  'calc-2k': 't:2K', 'calc-5k': 't:5K', 'calc-10k': 't:10K', 'calc-15k': 't:15K', 'calc-20k': 't:20K',
  'calc-25k': 't:25K', 'calc-30k': 't:30K', 'calc-40k': 't:40K', 'calc-50k': 't:50K', 'calc-60k': 't:60K',
  'calc-70k': 't:70K', 'calc-80k': 't:80K', 'calc-90k': 't:90K', 'calc-100k': 't:100K',
  'seq-calc-12': 't:12', 'seq-calc-123': 't:123', 'seq-calc-1234': 't:1234', 'seq-calc-12345': 't:12345',
  'custom-key-1': 'ck:1', 'custom-key-100': 'ck:100', 'custom-key-1k': 'ck:1K',
  'custom-key-2500': 'ck:2.5K', 'custom-key-5k': 'ck:5K', 'custom-key-10k': 'ck:10K',
  'custom-key-50k': 'ck:5K', 'custom-key-100k': 'ck:10K',
  'rapid-fire': 'watch', 'tape-auditor': 'tape',
  'prime-hunter': 'gem', 'prime-scholar': 'gems', 'fibonacci-master': 'spiral', 'fibonacci-sage': 'spiral',
  'piday': 't:π', 'euler-constant': 't:e', 'golden-ratio': 't:φ', 'tau-master': 't:τ',
  'perfect-square': 'square', 'cube-artisan': 'cube', 'binary-power': 't:2ⁿ', 'subzero-voyager': 'snow',
  'absolute-zero': 'target', 'lucky-seven': 't:777', 'millionaire': 't:1M', 'billionaire': 't:1B',
  'trillionaire': 't:1T', 'micro-precision': 'lens',
  'standard-solver': 'plus', 'scientific-scholar': 'flask', 'bitwise-wizard': 't:</>', 'rpn-prodigy': 'stack',
  'financial-planner': 'chart', 'global-trader': 'swap', 'polymath': 'trio', 'all-rounder': 'globe',
  'lucky-strike': 'dice', 'dice-roller': 'd20', 'coin-master': 'coin', 'coin-streak': 'coins',
  'target24-solver': 'cards', 'target24-grandmaster': 'cup', 'sprint-starter': 'chev', 'sprint-streak-5': 'flame',
  'sprint-speed-demon': 'bolt', 'sprint-centurion': 'crown',
  'the-answer': 't:42', 'pocket-acrobat': 'flip', 'audiophile': 'phones', 'piano-virtuoso': 'piano',
  'lucky-number-13': 'clover13', 'dollys-favorite': 'dolly', 'revolutionary': 'usflag',
  'all-milestones-epic': 'inf',

  // Secret Milestones from new-badge-ideas.csv
  'night-owl': 'moon', 'early-bird': 'sunrise',
  'streak-3': 'flame', 'streak-7': 'flame', 'streak-30': 'flame', 'streak-100': 'flame', 'streak-365': 'flame',
  'pi-day': 't:π', 'leap-day': 'calendar', 'midnight-countdown': 'clock',
  'taxi-1729': 'taxi', 'leet-1337': 't:1337', 'not-found-404': 't:404', 'calculator-words': 'flip',
  'perfect-number': 'gem', 'palindrome': 'mirror', 'repdigit': 't:111', 'kaprekar-6174': 't:6174', 'googol': 't:10¹⁰⁰',
  'black-hole': 'target', 'infinity-beyond': 'inf', 'nested-deep': 'trio', 'novelist': 'tape',
  'clean-slate': 'broom', 'copycat': 'cards', 'memory-keeper': 'brain', 'history-buff': 'tape', 'theme-hopper': 'palette',
  'snake-eyes': 'dice', 'critical-fumble': 'd20', 'hot-hand': 'coins',
  'speedrunner': 'watch', 'flawless-sprint': 'bolt', 'unit-nomad': 'swap',
  'collector-25': 'cup', 'collector-50': 'cup', 'collector-75': 'cup',
  'set-wonders': 'gem', 'set-modes': 'globe', 'set-games': 'dice',
  'full-spectrum': 'crown', 'secret-finder': 'lens',
};
const CATEGORY_GLYPH: Record<string, string> = { calc: 'calc', wonder: 'gem', mode: 'gear', game: 'dice', easter: 'inf' };

const dot = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="3" fill="currentColor" stroke="none"/>`;
const CALC = '<rect x="33" y="28" width="34" height="44" rx="5"/><path d="M39 36h22v8H39zM40 54h3M48.5 54h3M57 54h3M40 63h3M48.5 63h3M57 63h3"/>';
const GEAR = '<circle cx="50" cy="50" r="9"/><path d="M50 27v8M50 65v8M27 50h8M65 50h8M34 34l6 6M60 60l6 6M66 34l-6 6M40 60l-6 6"/>';
const G: Record<string, string> = {
  calc: CALC, gear: GEAR,
  sprout: '<path d="M50 70V50M50 52C50 40 40 34 30 36C30 46 38 52 50 52M50 48C50 38 58 32 68 33C68 43 60 49 50 48"/>',
  watch: '<circle cx="50" cy="55" r="17"/><path d="M50 55V44M44 32h12M50 32v6"/>',
  tape: '<path d="M36 28h28v44l-5-4-4 4-5-4-5 4-5-4-4 4zM42 38h16M42 46h16M42 54h10"/>',
  gem: '<path d="M36 40l7-9h14l7 9-14 30zM36 40h28M43 31l7 9 7-9M50 40v30"/>',
  gems: '<path d="M50 29l7 8-7 8-7-8zM34 51l7 8-7 8-7-8zM66 51l7 8-7 8-7-8z"/>',
  spiral: '<path d="M50 50h5v-5h-10v10h15V40H40v20h20V35H35v30h30"/>',
  square: '<rect x="34" y="34" width="32" height="32"/><path d="M50 34v32M34 50h32"/>',
  cube: '<path d="M50 30l18 10v20L50 70 32 60V40zM32 40l18 10 18-10M50 50v20"/>',
  snow: '<path d="M50 30v40M33 40l34 20M33 60l34-20"/>',
  target: '<circle cx="50" cy="50" r="18"/><circle cx="50" cy="50" r="7"/>',
  lens: '<circle cx="46" cy="46" r="14"/><path d="M57 57l14 14"/>',
  plus: '<path d="M50 32v36M32 50h36"/>',
  flask: '<path d="M44 30h12M46 30v14L35 66h30L54 44V30"/>',
  stack: '<rect x="33" y="33" width="34" height="8" rx="3"/><rect x="33" y="46" width="34" height="8" rx="3"/><rect x="33" y="59" width="34" height="8" rx="3"/>',
  chart: '<path d="M36 68V52M46 68V42M56 68V48M66 68V34"/>',
  swap: '<path d="M34 42h30l-6-6M66 58H36l6 6"/>',
  trio: '<circle cx="42" cy="44" r="11"/><circle cx="58" cy="44" r="11"/><circle cx="50" cy="58" r="11"/>',
  globe: '<circle cx="50" cy="50" r="19"/><ellipse cx="50" cy="50" rx="8" ry="19"/><path d="M31 50h38"/>',
  dice: '<rect x="33" y="33" width="34" height="34" rx="7"/>' + dot(42, 42) + dot(58, 42) + dot(50, 50) + dot(42, 58) + dot(58, 58),
  d20: '<path d="M50 29l19 11v22L50 73 31 62V40z"/><text x="50" y="52" font-size="16" font-weight="900" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">20</text>',
  coin: '<circle cx="50" cy="50" r="18"/><circle cx="50" cy="50" r="10"/>',
  coins: '<circle cx="35" cy="50" r="8"/><circle cx="50" cy="50" r="8"/><circle cx="65" cy="50" r="8"/>',
  cards: '<rect x="34" y="30" width="26" height="36" rx="4"/><rect x="42" y="36" width="26" height="36" rx="4" fill="currentColor" fill-opacity=".2"/>',
  cup: '<path d="M40 32h20v14a10 10 0 0 1-20 0zM40 36h-6a6 6 0 0 0 6 10M60 36h6a6 6 0 0 1-6 10M50 56v10M42 70h16"/>',
  chev: '<path d="M36 36l12 14-12 14M52 36l12 14-12 14"/>',
  flame: '<path d="M50 30c4 10 14 14 14 28a14 14 0 0 1-28 0c0-8 5-10 6-18 4 3 6 6 8 8 2-6 0-12 0-18z" fill="currentColor"/>',
  bolt: '<path d="M54 28L38 54h12l-4 18 18-28H52z" fill="currentColor"/>',
  crown: '<path d="M32 66V40l10 10 8-14 8 14 10-10v26z" fill="currentColor"/>',
  moon: '<path d="M54 30a18 18 0 1 0 16 26 14 14 0 1 1-16-26z" fill="currentColor"/>',
  sunrise: '<path d="M28 64h44M32 58h36M50 34v-7M36 40l-5-5M64 40l5-5M50 42a12 12 0 0 1 12 12H38a12 12 0 0 1 12-12z" fill="currentColor"/>',
  calendar: '<rect x="33" y="32" width="34" height="38" rx="4"/><path d="M33 42h34M43 28v8M57 28v8M44 50h4M52 50h4M44 58h4M52 58h4"/>',
  clock: '<circle cx="50" cy="50" r="18"/><path d="M50 38v12l8 5"/>',
  taxi: '<path d="M36 54l4-14h20l4 14H36zM32 54h36v11H32zM38 65a4 4 0 1 1 0 .1M62 65a4 4 0 1 1 0 .1M46 36h8v4h-8z" fill="currentColor"/>',
  mirror: '<path d="M38 34v32l-10-8V42zM62 34v32l10-8V42zM50 28v44" stroke-dasharray="3 3"/>',
  broom: '<path d="M64 30L48 46M48 46l-8 16 16-8-8-8zM34 68l12-6"/>',
  brain: '<path d="M50 34c-4-4-12-2-14 4-4 2-5 8-2 12-3 4-2 10 3 12 2 4 8 6 13 4M50 34c4-4 12-2 14 4 4 2 5 8 2 12 3 4 2 10-3 12-2 4-8 6-13 4M50 36v30"/>',
  palette: '<path d="M50 30c-11 0-20 9-20 20 0 8 5 12 11 12 3 0 5-2 6-5 1-2 2-3 4-3 5 0 9-4 9-9 0-8-5-15-10-15z"/>' + dot(42, 42) + dot(50, 38) + dot(58, 42) + dot(40, 52),
  flip: `<g transform="rotate(180 50 50)">${CALC}</g>`,
  phones: '<path d="M34 56v-6a16 16 0 0 1 32 0v6"/><rect x="31" y="54" width="8" height="14" rx="3"/><rect x="61" y="54" width="8" height="14" rx="3"/>',
  piano: '<rect x="31" y="34" width="38" height="32" rx="3"/><path d="M40 34v32M50 34v32M60 34v32"/><path d="M37 34v16M47 34v16M57 34v16" stroke-width="6"/>',
  inf: '<path d="M50 50c-6-11-21-11-21 0s15 11 21 0 21-11 21 0-15 11-21 0z"/>',
  clover13: `
    <g stroke-width="0">
      <!-- Four-Leaf Clover in rich emerald greens (NO gold outline on clover, on gold badge) -->
      <!-- Stem -->
      <path d="M50 50 C49 63, 44 71, 52 75 C53.5 75.5, 54 74.5, 53 73.5 C47 70, 51 62, 51 50 Z" fill="#15803d"/>
      
      <!-- 4 Natural Heart-shaped Clover Leaves (Top, Bottom, Left, Right) -->
      <!-- Top Leaf -->
      <path d="M50 49 C42 38, 33 26, 43 23 C48 21, 50 26, 50 28 C50 26, 52 21, 57 23 C67 26, 58 38, 50 49 Z" fill="#16a34a"/>
      <!-- Bottom Leaf -->
      <path d="M50 51 C42 62, 33 74, 43 77 C48 79, 50 74, 50 72 C50 74, 52 79, 57 77 C67 74, 58 62, 50 51 Z" fill="#15803d"/>
      <!-- Left Leaf -->
      <path d="M49 50 C38 42, 26 33, 23 43 C21 48, 26 50, 28 50 C26 50, 21 52, 23 57 C26 67, 38 58, 49 50 Z" fill="#16a34a"/>
      <!-- Right Leaf -->
      <path d="M51 50 C62 42, 74 33, 77 43 C79 48, 74 50, 72 50 C74 50, 79 52, 77 57 C74 67, 62 58, 51 50 Z" fill="#22c55e"/>

      <!-- Subtle Leaf Midrib Veins for Depth -->
      <path d="M50 49 L50 28 M50 51 L50 72 M49 50 L28 50 M51 50 L72 50" stroke="#14532d" stroke-width="1.2" stroke-linecap="round"/>

      <!-- Number 13 Cleanly on Top (High Contrast, Bold, Clear) -->
      <!-- Depth Shadow -->
      <text x="50" y="52" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" dominant-baseline="central" fill="#064e3b" opacity="0.6">13</text>
      <!-- Pure White Number 13 -->
      <text x="50" y="50" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" dominant-baseline="central" fill="#FFFFFF">13</text>
    </g>
  `,
  dolly: `
    <g stroke-width="0">
      <!-- Scaled to fit completely inside the inner medallion circle -->
      <g transform="translate(50 50) scale(0.60) translate(-50 -49)">
        <!-- Soft backplate glow for contrast -->
        <circle cx="50" cy="50" r="25" fill="#FEF3C7" opacity="0.3"/>

        <!-- Big Iconic Voluminous Blonde Hair (Bouffant Curls) -->
        <path d="M22 52c-4-12 0-25 10-31c8-5 24-5 36 0c11 5 16 19 10 31c6 6 8 18 2 24c-5 5-11 5-16 0c-3 8-10 11-18 11s-15-3-18-11c-5 5-11 5-16 0c-6-6-4-18 2-24z" fill="#EAB308" stroke="#CA8A04" stroke-width="1.5"/>
        <path d="M26 46c-3-10 1-20 9-25c7-4 22-4 30 0c9 4 13 15 9 25c5 5 6 15 2 20c-4 4-9 4-13 0c-3 6-9 9-16 9s-13-3-16-9c-4 4-9 4-13 0c-4-5-3-15 2-20z" fill="#FACC15"/>
        <!-- Soft Highlights on Blonde Hair -->
        <path d="M34 23c6-3 18-3 26 0c5 2 8 7 9 12c-5-4-14-6-22-5c-6 1-11 4-15 8c0-6 2-12 7-15z" fill="#FEF08A"/>
        <path d="M24 45c3-6 7-9 12-10c-2 6-1 12 2 17c-5 0-10-2-14-7z" fill="#FEF08A"/>
        <path d="M76 45c-3-6-7-9-12-10c2 6 1 12-2 17c5 0 10-2 14-7z" fill="#FEF08A"/>

        <!-- Neck & Glamorous Western Outfit Collar -->
        <path d="M44 65h12v12h-12z" fill="#FED7AA"/>
        <path d="M30 77c5-5 13-7 20-7s15 2 20 7v3H30v-3z" fill="#EC4899" stroke="#BE185D" stroke-width="1.5"/>
        <path d="M43 70l7 8l7-8" fill="none" stroke="#FDE047" stroke-width="1.5"/>

        <!-- Smooth Face -->
        <path d="M36 44c0-8 6-15 14-15s14 7 14 15c0 9-5 18-14 21c-9-3-14-12-14-21z" fill="#FED7AA"/>

        <!-- Rosy Cheeks -->
        <ellipse cx="40" cy="51" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8"/>
        <ellipse cx="60" cy="51" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8"/>

        <!-- Eyebrows and Glam Eyes with Eyelashes -->
        <path d="M41 42c2-1.5 5-1 7 0M59 42c-2-1.5-5-1-7 0" stroke="#854D0E" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M41 46q3-2.5 6 0M59 46q-3-2.5-6 0" stroke="#1E293B" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M39.5 44.5l2 1.5M60.5 44.5l-2 1.5" stroke="#1E293B" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="44" cy="46" r="1.5" fill="#1E293B"/>
        <circle cx="56" cy="46" r="1.5" fill="#1E293B"/>

        <!-- Dainty Nose & Brilliant Smiling Red Lips -->
        <path d="M50 47v3.5l1.5 0.5" stroke="#D97706" stroke-width="1" fill="none" stroke-linecap="round"/>
        <path d="M45 54.5c2 2 8 2 10 0c-1 3-9 3-10 0z" fill="#E11D48" stroke="#9F1239" stroke-width="0.8"/>
        <path d="M46.5 54.8c1.5 0.8 5.5 0.8 7 0" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round"/>

        <!-- Forehead Blonde Bangs / Fringe -->
        <path d="M36 36c4-4 10-6 14-3c4-3 10-1 14 3c-4 1-9-1-14 2c-5-3-10-1-14-2z" fill="#FACC15" stroke="#CA8A04" stroke-width="1"/>

        <!-- Sparkling Gold Earring -->
        <circle cx="34" cy="53" r="2" fill="#FDE047" stroke="#CA8A04" stroke-width="0.8"/>
        <circle cx="66" cy="53" r="2" fill="#FDE047" stroke="#CA8A04" stroke-width="0.8"/>
      </g>
    </g>
  `,
  usflag: `
    <g stroke-width="0">
      <defs>
        <clipPath id="rev-badge-clip">
          <circle cx="50" cy="50" r="22"/>
        </clipPath>
        <linearGradient id="rev-silver-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#E2E8F0"/>
        </linearGradient>
        <linearGradient id="rev-silver-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>

      <!-- Circular Red & Blue Striped Background -->
      <g clip-path="url(#rev-badge-clip)">
        <!-- Deep Navy Blue Base Background -->
        <rect x="25" y="25" width="50" height="50" fill="#1E3A8A"/>
        <!-- Alternating Vibrant Red Stripes -->
        <rect x="26" y="25" width="5" height="50" fill="#DC2626"/>
        <rect x="35" y="25" width="5" height="50" fill="#DC2626"/>
        <rect x="44" y="25" width="5.5" height="50" fill="#DC2626"/>
        <rect x="54" y="25" width="5.5" height="50" fill="#DC2626"/>
        <rect x="64" y="25" width="5" height="50" fill="#DC2626"/>
        <rect x="73" y="25" width="4" height="50" fill="#DC2626"/>
        <!-- Soft inner depth shadow -->
        <circle cx="50" cy="50" r="22" fill="none" stroke="#0F172A" stroke-width="2.5" opacity="0.4"/>
      </g>

      <!-- Outer Gold Trim Ring -->
      <circle cx="50" cy="50" r="22" fill="none" stroke="#FDE047" stroke-width="1.8" opacity="0.95"/>

      <!-- Star Drop Shadow for High Contrast -->
      <polygon points="50,35.5 54.3,44.5 64.1,45.9 57,52.8 58.7,62.6 50,57.9 41.3,62.6 43,52.8 35.9,45.9 45.7,44.5" fill="#0F172A" opacity="0.6"/>

      <!-- Single Centered Dimensional Faceted Silver Star -->
      <!-- Left facets (Gleaming Light Silver) -->
      <polygon points="50,50 50,36 54.2,44.8" fill="url(#rev-silver-light)"/>
      <polygon points="50,50 63.8,46.2 56.8,52.9" fill="url(#rev-silver-light)"/>
      <polygon points="50,50 58.6,62.4 50,57.8" fill="url(#rev-silver-light)"/>
      <polygon points="50,50 41.4,62.4 43.2,52.9" fill="url(#rev-silver-light)"/>
      <polygon points="50,50 36.2,46.2 45.8,44.8" fill="url(#rev-silver-light)"/>

      <!-- Right facets (Shaded Silver) -->
      <polygon points="50,50 50,36 45.8,44.8" fill="url(#rev-silver-dark)"/>
      <polygon points="50,50 54.2,44.8 63.8,46.2" fill="url(#rev-silver-dark)"/>
      <polygon points="50,50 56.8,52.9 58.6,62.4" fill="url(#rev-silver-dark)"/>
      <polygon points="50,50 50,57.8 41.4,62.4" fill="url(#rev-silver-dark)"/>
      <polygon points="50,50 43.2,52.9 36.2,46.2" fill="url(#rev-silver-dark)"/>

      <!-- Fine Silver Star Outline & Core Jewel -->
      <polygon points="50,36 54.2,44.8 63.8,46.2 56.8,52.9 58.6,62.4 50,57.8 41.4,62.4 43.2,52.9 36.2,46.2 45.8,44.8" fill="none" stroke="#F8FAFC" stroke-width="0.8"/>
      <circle cx="50" cy="50" r="1.5" fill="#FFFFFF"/>
    </g>
  `,
};

const esc = (s: string) => s.replace(/[&<>]/g, (ch) => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : '&gt;'));
const text = (s: string, size: number, y = 51) =>
  `<text x="50" y="${y}" font-size="${size}" font-weight="900" font-family="Georgia,serif" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">${esc(s)}</text>`;

function glyph(spec: string): string {
  const [kind, arg = ''] = spec.split(':');
  if (kind === 't') return text(arg, [0, 34, 30, 26, 20, 17][Array.from(arg).length] || 16);
  if (kind === 'ck') return `<g transform="translate(0 -6)" stroke-width="3.5">${GEAR}</g>` + text(arg, 14, 72);
  return G[kind] ?? G.gem;
}

const hash = (t: string) => {
  let h = 0;
  for (let k = 0; k < t.length; k++) h = (h * 31 + t.charCodeAt(k)) >>> 0;
  return h;
};

const poly = (n: number, R: number, r: number, rot = 0) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI * i) / n + rot - Math.PI / 2;
    const k = i % 2 ? r : R;
    return (50 + k * Math.cos(a)).toFixed(1) + ',' + (50 + k * Math.sin(a)).toFixed(1);
  }).join(' ');
const PTS = ['', poly(8, 41, 41, Math.PI / 8), poly(12, 43, 38), poly(6, 44, 44), poly(16, 46, 38), poly(24, 48, 41)];

const PAT: Array<(c: string) => string> = [
  (c) => Array.from({ length: 12 }, (_, k) => `<path d="M50 50L50 18" stroke="${c}" stroke-width="3" transform="rotate(${k * 30} 50 50)"/>`).join(''),
  (c) => { let s = ''; for (let x = 28; x < 75; x += 8) for (let y = 28; y < 75; y += 8) s += `<circle cx="${x}" cy="${y}" r="1.6" fill="${c}"/>`; return s; },
  (c) => { let s = ''; for (let x = -20; x < 130; x += 9) s += `<path d="M${x} 80L${x + 40} 20" stroke="${c}" stroke-width="3"/>`; return s; },
  (c) => `<circle cx="50" cy="50" r="22" fill="none" stroke="${c}" stroke-width="2"/><circle cx="50" cy="50" r="14" fill="none" stroke="${c}" stroke-width="2"/>`,
  (c) => { let s = ''; for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) if ((x + y) % 2) s += `<rect x="${22 + x * 7.2}" y="${22 + y * 7.2}" width="7.2" height="7.2" fill="${c}"/>`; return s; },
  (c) => { let s = ''; for (let y = 20; y < 80; y += 9) s += `<path d="M20 ${y}l15-6 15 6 15-6 15 6" fill="none" stroke="${c}" stroke-width="2"/>`; return s; },
];

function buildBadge(glyphSpec: string, tier: BadgeTier, id: string, uid: string, animated: boolean): string {
  const i = TIERS.indexOf(tier);
  const c = C[i];
  const u = `url(#${uid}g)`;
  const hue = (hash(id) * 47) % 360;
  const accent = `hsl(${hue} 90% 68%)`;
  const face = `hsl(${hue} 45% ${FACE_LIGHTNESS[i]}%)`;
  const st = `stroke="${c[2]}" stroke-width="1.5" stroke-linejoin="round"`;
  const pulse = (x: number, y: number) =>
    `<path transform="translate(${x} ${y})" d="M8 8l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="${c[0]}">${
      animated ? '<animate attributeName="opacity" values=".2;1;.2" dur="2s" repeatCount="indefinite"/>' : ''
    }</path>`;

  let s =
    `<defs><linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>` +
    `<clipPath id="${uid}f"><circle cx="50" cy="50" r="28"/></clipPath>` +
    `<filter id="${uid}w" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

  if (i >= 4)
    for (let k = 0; k < 16; k++)
      s += `<path d="M50 50V${i > 4 ? -6 : -1}" stroke="${c[0]}" stroke-width="3" stroke-linecap="round" opacity=".7" transform="rotate(${k * 22.5} 50 50)"/>`;
  if (i >= 3) {
    const w = `<path d="M18 42C4 40-4 26-8 8c12 2 22 8 28 20-2-1-4 0-6 2 6 2 10 6 12 12z" fill="${u}" ${st}/>`;
    s += `<g transform="translate(50 50) scale(${i > 3 ? 1.15 : 1}) translate(-50 -50)">${w}<g transform="translate(100 0) scale(-1 1)">${w}</g></g>`;
  }
  if (i >= 2) s += `<path d="M34 76l-8 26 13-8 7 9 3-27zM66 76l8 26-13-8-7 9-3-27z" fill="${c[2]}"/>`;
  s += i
    ? `<polygon points="${PTS[i]}" fill="${u}" ${st}/>`
    : `<circle cx="50" cy="50" r="38" fill="${u}" ${st}/>`;
  s += `<circle cx="50" cy="50" r="33" fill="none" stroke="${accent}" stroke-width="2" opacity=".9" ${i >= 3 ? 'stroke-dasharray="1 4" stroke-linecap="round"' : ''}/>`;
  s += `<circle cx="50" cy="50" r="29" fill="${face}" stroke="${c[2]}" stroke-width="2"/>`;
  s += `<g clip-path="url(#${uid}f)" opacity=".3">${PAT[hash(id + 'p') % 6](accent)}</g>`;
  s += `<path d="M26 38A26 26 0 0 1 46 24" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>`;
  s += `<g color="${c[4]}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${glyph(glyphSpec)}</g>`;
  if (i === 3) s += `<path d="M50-2l7 9-7 9-7-9z" fill="${u}" ${st}/>`;
  if (i >= 4) s += `<path d="M34 12l3-16 9 9 4-12 4 12 9-9 3 16z" fill="${u}" ${st}/>` + pulse(0, 0) + pulse(82, 76);
  if (i === 5) {
    s += '<g>' + (animated ? '<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="14s" repeatCount="indefinite"/>' : '');
    for (let k = 0; k < 8; k++) s += `<circle cx="50" cy="-2" r="2.6" fill="#fff" transform="rotate(${k * 45} 50 50)"/>`;
    s += '</g>';
  }
  return s;
}

export interface AchievementBadgeProps {
  achievement: Pick<AchievementItem, 'id' | 'title' | 'category' | 'tier' | 'isSecret'>;
  /** Whether the badge is locked. Hides secret numbers on locked secret badges */
  locked?: boolean;
  /** Rendered width in px (height follows the 120:128 aspect). Default 96. */
  size?: number;
  /** Set false to disable the sparkle and orbit animations. Default true. */
  animated?: boolean;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, locked = false, size = 96, animated = true, className }) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '') + '-';
  const tier = resolveBadgeTier(achievement);
  const rawSpec = ID_GLYPH[achievement.id] ?? CATEGORY_GLYPH[achievement.category] ?? 'gem';
  // If secret and locked, mask the glyph with an enigma question mark
  const spec = (locked && achievement.isSecret) ? 't:?' : rawSpec;
  const inner = useMemo(
    () => buildBadge(spec, tier, achievement.id, uid, animated),
    [spec, tier, achievement.id, uid, animated],
  );
  const glow = TIERS.indexOf(tier) >= 3;

  return (
    <svg
      viewBox="-10 -14 120 128"
      width={size}
      height={(size * 128) / 120}
      overflow="visible"
      role="img"
      aria-label={`${achievement.title} (${tier})`}
      className={className}
      filter={glow ? `url(#${uid}w)` : undefined}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
};

export default AchievementBadge;
