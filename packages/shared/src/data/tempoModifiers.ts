/**
 * TEMPO / TUT MODIFIERS
 *
 * TUT = AGGRAVANTE (aumenta difficoltà)
 *
 * Usato per:
 * - UPGRADE: quando esercizio diventa facile, aggiungi TUT prima di cambiare variante
 * - PROGRESSIONE: alternativa ad aumentare peso/variante
 *
 * Formato: ECCENTRICA - PAUSA BASSO - CONCENTRICA - PAUSA ALTO
 */

export interface TempoModifier {
  id: string;
  name: string;
  tempo: string;
  eccentric: number;
  pause_bottom: number;
  concentric: number;
  pause_top: number;
  tut_per_rep: number;
  difficulty_increase: number; // Percentuale aumento difficoltà (0.2 = +20%)
  description_it: string;
  description_en: string;
}

export const TEMPO_MODIFIERS: TempoModifier[] = [
  // STANDARD (baseline)
  {
    id: 'standard',
    name: 'Standard',
    tempo: '2-0-1-0',
    eccentric: 2,
    pause_bottom: 0,
    concentric: 1,
    pause_top: 0,
    tut_per_rep: 3,
    difficulty_increase: 0,
    description_it: 'Tempo normale controllato',
    description_en: 'Normal controlled tempo'
  },

  // AGGRAVANTI (ordinati per difficoltà crescente)
  {
    id: 'slow_eccentric',
    name: 'Eccentrica Lenta',
    tempo: '4-0-1-0',
    eccentric: 4,
    pause_bottom: 0,
    concentric: 1,
    pause_top: 0,
    tut_per_rep: 5,
    difficulty_increase: 0.15, // +15%
    description_it: '4 secondi in discesa',
    description_en: '4 seconds down'
  },
  {
    id: 'slow_both',
    name: 'Tempo Lento',
    tempo: '3-0-2-0',
    eccentric: 3,
    pause_bottom: 0,
    concentric: 2,
    pause_top: 0,
    tut_per_rep: 5,
    difficulty_increase: 0.20, // +20%
    description_it: '3 secondi giù, 2 secondi su',
    description_en: '3 seconds down, 2 seconds up'
  },
  {
    id: 'pause_bottom',
    name: 'Pausa Isometrica',
    tempo: '2-2-1-0',
    eccentric: 2,
    pause_bottom: 2,
    concentric: 1,
    pause_top: 0,
    tut_per_rep: 5,
    difficulty_increase: 0.25, // +25%
    description_it: '2 secondi pausa nel punto più basso',
    description_en: '2 second pause at bottom'
  },
  {
    id: 'slow_eccentric_pause',
    name: 'Eccentrica + Pausa',
    tempo: '4-1-1-0',
    eccentric: 4,
    pause_bottom: 1,
    concentric: 1,
    pause_top: 0,
    tut_per_rep: 6,
    difficulty_increase: 0.30, // +30%
    description_it: '4 secondi giù, 1 secondo pausa',
    description_en: '4 seconds down, 1 second pause'
  },
  {
    id: 'super_slow',
    name: 'Super Lento',
    tempo: '4-2-3-0',
    eccentric: 4,
    pause_bottom: 2,
    concentric: 3,
    pause_top: 0,
    tut_per_rep: 9,
    difficulty_increase: 0.40, // +40%
    description_it: '4 secondi giù, 2 pausa, 3 su',
    description_en: '4 seconds down, 2 pause, 3 up'
  }
];

/**
 * Ottieni il primo TUT aggravante (per upgrade)
 */
export function getFirstTUTAggravante(): TempoModifier {
  return TEMPO_MODIFIERS.find(t => t.id === 'slow_both')!;
}

/**
 * Ottieni TUT standard
 */
export function getStandardTempo(): TempoModifier {
  return TEMPO_MODIFIERS.find(t => t.id === 'standard')!;
}

/**
 * Trova TUT per ID
 */
export function getTempoById(id: string): TempoModifier | null {
  return TEMPO_MODIFIERS.find(t => t.id === id) || null;
}

/**
 * Formatta il tempo per la visualizzazione UI
 */
export function formatTempoDisplay(tempo: string): string {
  const parts = tempo.split('-').map(Number);
  if (parts.length !== 4) return tempo;

  const [ecc, pauseBot, conc, pauseTop] = parts;
  const segments: string[] = [];

  if (ecc > 0) segments.push(`${ecc}s giù`);
  if (pauseBot > 0) segments.push(`${pauseBot}s pausa`);
  if (conc > 0) segments.push(`${conc}s su`);
  if (pauseTop > 0) segments.push(`${pauseTop}s pausa top`);

  return segments.join(' → ');
}

/**
 * Ottieni il prossimo TUT più difficile
 */
export function getNextHarderTempo(currentTempoId: string): TempoModifier | null {
  const currentIndex = TEMPO_MODIFIERS.findIndex(t => t.id === currentTempoId);
  if (currentIndex === -1 || currentIndex >= TEMPO_MODIFIERS.length - 1) {
    return null;
  }
  return TEMPO_MODIFIERS[currentIndex + 1];
}

/**
 * Verifica se un tempo è standard (nessun aggravante)
 */
export function isStandardTempo(tempoId: string | undefined): boolean {
  return !tempoId || tempoId === 'standard';
}
