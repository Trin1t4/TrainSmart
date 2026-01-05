/**
 * RIR ADJUSTMENT LOGIC
 *
 * REGOLE:
 * - DOWNGRADE (RIR < target): Variante più facile, SENZA TUT
 * - UPGRADE (RIR > target): Prima TUT, poi variante più difficile
 *
 * TUT = AGGRAVANTE (aumenta difficoltà)
 */

import {
  getFirstTUTAggravante,
  getStandardTempo,
  getTempoById,
  type TempoModifier
} from '../data/tempoModifiers';
import { getDowngradedExercise, getUpgradedExercise } from './exerciseProgression';

export type ExerciseType = 'weighted' | 'bodyweight';
export type LocationType = 'gym' | 'home' | 'home_gym';

// ================================================================
// DOWNGRADE (RIR troppo basso = esercizio troppo difficile)
// ================================================================

export interface DowngradeInput {
  exerciseName: string;
  exercisePattern: string;
  exerciseType: ExerciseType;

  targetReps: number;
  actualReps: number;
  targetRIR: number;
  actualRIR: number;

  currentWeight?: number;
  location: LocationType;
}

export interface DowngradeResult {
  needsDowngrade: boolean;
  severity: 'none' | 'warning' | 'critical';

  // Per weighted
  newWeight?: number;
  weightReductionPercent?: number;

  // Per bodyweight
  newVariant?: string;
  newReps?: number;

  // MAI TUT nel downgrade
  tempo: TempoModifier; // Sempre standard

  reason: string;
  userMessage: string;
}

/**
 * Calcola downgrade quando RIR < target
 */
export function calculateDowngrade(input: DowngradeInput): DowngradeResult {
  const rirDelta = input.actualRIR - input.targetRIR;
  const standardTempo = getStandardTempo();

  // RIR ok o alto → nessun downgrade
  if (rirDelta >= -1) {
    return {
      needsDowngrade: false,
      severity: 'none',
      tempo: standardTempo,
      reason: '',
      userMessage: ''
    };
  }

  const severity: 'warning' | 'critical' = rirDelta <= -2 ? 'critical' : 'warning';

  if (input.exerciseType === 'weighted') {
    // PESI: Riduci peso, NO TUT
    const reductionPercent = Math.min(15, Math.abs(rirDelta) * 5);
    const newWeight = Math.round((input.currentWeight || 0) * (1 - reductionPercent / 100) * 2) / 2;

    return {
      needsDowngrade: true,
      severity,
      newWeight,
      weightReductionPercent: reductionPercent,
      tempo: standardTempo, // NO TUT
      reason: `RIR ${input.actualRIR} vs target ${input.targetRIR}`,
      userMessage: severity === 'critical'
        ? `🛑 Carico troppo alto! Ridotto a ${newWeight}kg.`
        : `⚠️ Carico ridotto a ${newWeight}kg per rispettare RIR ${input.targetRIR}.`
    };
  } else {
    // BODYWEIGHT: Variante più facile, NO TUT
    const downgrade = getDowngradedExercise(
      input.exerciseName,
      input.exercisePattern,
      input.location
    );

    if (!downgrade) {
      // Nessuna variante più facile → riduci solo reps
      const newReps = Math.max(5, input.targetReps - 2);
      return {
        needsDowngrade: true,
        severity,
        newReps,
        tempo: standardTempo,
        reason: `RIR ${input.actualRIR}, nessuna variante più facile`,
        userMessage: `⚠️ Riduciamo a ${newReps} reps per rispettare RIR ${input.targetRIR}.`
      };
    }

    // Variante più facile + reps aumentate
    const newReps = input.targetReps + 2;

    return {
      needsDowngrade: true,
      severity,
      newVariant: downgrade.name,
      newReps,
      tempo: standardTempo, // NO TUT
      reason: `RIR ${input.actualRIR} vs target ${input.targetRIR}`,
      userMessage: severity === 'critical'
        ? `🛑 Troppo difficile! Prossima sessione: ${downgrade.name} × ${newReps}.`
        : `⚠️ Proviamo ${downgrade.name} × ${newReps} per rispettare RIR ${input.targetRIR}.`
    };
  }
}

// ================================================================
// UPGRADE (RIR troppo alto = esercizio troppo facile)
// ================================================================

export interface ActiveModification {
  original_variant?: string;
  current_variant: string;
  tempo_modifier_id?: string;
  original_weight?: number;
  current_weight?: number;
  original_reps?: number;
}

export interface UpgradeInput {
  exerciseName: string;
  exercisePattern: string;
  exerciseType: ExerciseType;

  targetRIR: number;
  actualRIR: number;
  targetReps: number;
  actualReps: number;

  currentWeight?: number;

  // Modifica attiva (se presente)
  activeModification?: ActiveModification;

  location: LocationType;
}

export interface UpgradeResult {
  canUpgrade: boolean;
  upgradeType: 'none' | 'add_tut' | 'upgrade_variant' | 'increase_weight' | 'full_reset';

  newVariant?: string;
  newTempo?: TempoModifier;
  newWeight?: number;
  newReps?: number;

  reason: string;
  userMessage: string;
}

/**
 * Calcola upgrade quando RIR > target
 *
 * ORDINE:
 * 1. Se NO TUT → Aggiungi TUT
 * 2. Se già TUT → Upgrade variante/peso, rimuovi TUT
 */
export function calculateUpgrade(input: UpgradeInput): UpgradeResult {
  const rirDelta = input.actualRIR - input.targetRIR;
  const standardTempo = getStandardTempo();

  // RIR ok o basso → nessun upgrade
  if (rirDelta < 2) {
    return {
      canUpgrade: false,
      upgradeType: 'none',
      reason: 'RIR nel range',
      userMessage: ''
    };
  }

  const mod = input.activeModification;
  const hasTUT = mod?.tempo_modifier_id && mod.tempo_modifier_id !== 'standard';

  // ================================================================
  // CASO 1: Nessun TUT attivo → Aggiungi TUT
  // ================================================================
  if (!hasTUT) {
    const tut = getFirstTUTAggravante();

    return {
      canUpgrade: true,
      upgradeType: 'add_tut',
      newTempo: tut,
      newReps: input.targetReps,
      reason: `RIR ${input.actualRIR} > target ${input.targetRIR}`,
      userMessage: `💪 Troppo facile! Aggiungiamo tempo ${tut.tempo} per aumentare la sfida.`
    };
  }

  // ================================================================
  // CASO 2: Già TUT attivo → Upgrade variante/peso, rimuovi TUT
  // ================================================================

  if (input.exerciseType === 'weighted') {
    // PESI: Aumenta peso, rimuovi TUT
    const currentWeight = mod?.current_weight || input.currentWeight || 0;
    const originalWeight = mod?.original_weight || currentWeight;

    // Se peso attuale < originale, torna a originale
    if (currentWeight < originalWeight) {
      return {
        canUpgrade: true,
        upgradeType: 'increase_weight',
        newWeight: originalWeight,
        newTempo: standardTempo, // Rimuovi TUT
        newReps: input.targetReps,
        reason: `RIR ${input.actualRIR} con TUT`,
        userMessage: `🎉 Ottimo! Torniamo a ${originalWeight}kg senza tempo modificato.`
      };
    }

    // Altrimenti aumenta peso del 5%
    const newWeight = Math.round(currentWeight * 1.05 * 2) / 2;
    return {
      canUpgrade: true,
      upgradeType: 'increase_weight',
      newWeight,
      newTempo: standardTempo,
      newReps: input.targetReps,
      reason: `RIR ${input.actualRIR} con TUT`,
      userMessage: `📈 Aumentiamo a ${newWeight}kg senza tempo modificato.`
    };

  } else {
    // BODYWEIGHT: Upgrade variante, rimuovi TUT

    // Se c'è variante originale, torna a quella
    if (mod?.original_variant && mod.current_variant !== mod.original_variant) {
      return {
        canUpgrade: true,
        upgradeType: 'upgrade_variant',
        newVariant: mod.original_variant,
        newTempo: standardTempo, // Rimuovi TUT
        newReps: mod.original_reps || input.targetReps,
        reason: `RIR ${input.actualRIR} con TUT su variante facile`,
        userMessage: `🎉 Torniamo a ${mod.original_variant} × ${mod.original_reps || input.targetReps}!`
      };
    }

    // Altrimenti cerca upgrade
    const upgrade = getUpgradedExercise(
      input.exerciseName,
      input.exercisePattern,
      input.location
    );

    if (upgrade) {
      return {
        canUpgrade: true,
        upgradeType: 'upgrade_variant',
        newVariant: upgrade.name,
        newTempo: standardTempo, // Rimuovi TUT
        newReps: Math.max(input.targetReps - 2, 5),
        reason: `RIR ${input.actualRIR} con TUT`,
        userMessage: `🚀 Proviamo ${upgrade.name}! Senza tempo modificato.`
      };
    }

    // Nessun upgrade disponibile → mantieni TUT e aumenta reps
    return {
      canUpgrade: true,
      upgradeType: 'add_tut', // Mantieni TUT
      newTempo: getTempoById(mod?.tempo_modifier_id || 'slow_both') || getFirstTUTAggravante(),
      newReps: input.targetReps + 2,
      reason: 'Nessuna variante più difficile',
      userMessage: `📈 Aumentiamo a ${input.targetReps + 2} reps con tempo modificato.`
    };
  }
}

// ================================================================
// HELPER
// ================================================================

/**
 * Verifica se un esercizio è bodyweight
 */
export function isBodyweightExercise(exerciseName: string): boolean {
  const bodyweightKeywords = [
    'push-up', 'push up', 'pushup',
    'pull-up', 'pull up', 'pullup',
    'dip', 'dips',
    'squat', 'lunge', 'pistol',
    'row', 'inverted',
    'plank', 'hollow',
    'l-sit', 'handstand',
    'muscle-up', 'muscle up',
    'chin-up', 'chin up',
    'pike', 'archer', 'diamond',
    'bulgarian', 'step-up',
    'air squat', 'bodyweight'
  ];

  const nameLower = exerciseName.toLowerCase();
  return bodyweightKeywords.some(kw => nameLower.includes(kw));
}

/**
 * Determina se l'utente ha superato il limite RIR (ha spinto troppo)
 */
export function didUserPushTooHard(
  targetReps: number,
  actualReps: number,
  targetRIR: number,
  actualRIR: number
): boolean {
  // L'utente ha spinto troppo se:
  // 1. Ha fatto >= reps target
  // 2. Ha finito con RIR più basso del target
  return actualReps >= targetReps && actualRIR < targetRIR;
}

/**
 * Genera messaggio educativo per l'utente
 */
export function getEducationalMessage(severity: 'warning' | 'critical'): string {
  if (severity === 'warning') {
    return 'Ricorda: lasciare reps in riserva protegge le articolazioni e permette progressioni più durature.';
  }

  return 'Importante: allenarsi sempre al limite aumenta il rischio di infortuni e rallenta il recupero.';
}
