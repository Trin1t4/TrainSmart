/**
 * TrainSmart Design Tokens
 * Single source of truth per colori, spacing, e stili
 *
 * USO: import { colors, spacing, radius } from '@/styles/design-tokens'
 */

// =============================================================================
// COLORI SEMANTICI
// =============================================================================

export const colors = {
  // Azioni primarie (workout, CTA principali)
  primary: {
    DEFAULT: 'hsl(160, 84%, 39%)', // emerald-500
    hover: 'hsl(161, 94%, 30%)',   // emerald-600
    light: 'hsl(158, 64%, 52%)',   // emerald-400
    muted: 'hsl(158, 64%, 52%, 0.1)',
  },

  // Azioni secondarie
  secondary: {
    DEFAULT: 'hsl(215, 28%, 17%)', // slate-800
    hover: 'hsl(215, 25%, 27%)',   // slate-700
    light: 'hsl(215, 20%, 65%)',   // slate-400
  },

  // Feedback positivo (completato, successo)
  success: {
    DEFAULT: 'hsl(142, 71%, 45%)', // green-500
    light: 'hsl(142, 69%, 58%)',   // green-400
    muted: 'hsl(142, 71%, 45%, 0.1)',
  },

  // Warning (attenzione, deload)
  warning: {
    DEFAULT: 'hsl(38, 92%, 50%)',  // amber-500
    light: 'hsl(43, 96%, 56%)',    // amber-400
    muted: 'hsl(38, 92%, 50%, 0.1)',
  },

  // Errori, dolore, stop
  danger: {
    DEFAULT: 'hsl(0, 84%, 60%)',   // red-500
    light: 'hsl(0, 91%, 71%)',     // red-400
    muted: 'hsl(0, 84%, 60%, 0.1)',
  },

  // Running/Cardio (distinguere da strength)
  cardio: {
    DEFAULT: 'hsl(173, 80%, 40%)', // teal-500
    hover: 'hsl(175, 84%, 32%)',   // teal-600
    muted: 'hsl(173, 80%, 40%, 0.1)',
  },

  // Info, tooltip, educational
  info: {
    DEFAULT: 'hsl(217, 91%, 60%)', // blue-500
    light: 'hsl(213, 94%, 68%)',   // blue-400
    muted: 'hsl(217, 91%, 60%, 0.1)',
  },
} as const;

// =============================================================================
// SPACING (basato su 4px grid)
// =============================================================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

// =============================================================================
// BORDER RADIUS (semantico)
// =============================================================================

export const radius = {
  none: '0',
  sm: '4px',    // chip, badge, small elements
  md: '6px',    // inputs, small buttons
  lg: '8px',    // cards, standard buttons
  xl: '12px',   // modals, large cards
  '2xl': '16px', // hero elements, feature cards
  full: '9999px', // avatar, pills, circular
} as const;

// =============================================================================
// TOUCH TARGETS (minimo 48x48 per WCAG)
// =============================================================================

export const touchTarget = {
  min: '48px',
  comfortable: '56px',
  large: '64px',
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: {
    primary: '0 0 20px hsl(160, 84%, 39%, 0.3)',
    danger: '0 0 20px hsl(0, 84%, 60%, 0.3)',
  },
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================

export const duration = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// =============================================================================
// BREAKPOINTS (match Tailwind)
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
