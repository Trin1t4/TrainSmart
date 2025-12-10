/**
 * RECOVERY ADAPTATION SERVICE
 *
 * Applica adjustment al programma basato sui dati di recovery screening
 * (sonno, stress, dolore, ciclo mestruale)
 */

export interface RecoveryData {
  sleepHours: number;
  sleepQuality?: number;
  stressLevel: number;
  energyLevel?: number;
  hasInjury: boolean;
  injuryDetails?: string | null;
  painAreas?: Array<{ area: string; intensity: number }>;
  menstrualCycle?: 'follicular' | 'ovulation' | 'luteal' | 'menstruation' | 'menopause' | 'prefer_not_say' | null;
  isFemale?: boolean;
}

export interface RecoveryAdjustments {
  volumeMultiplier: number;      // 0.5 - 1.2
  intensityMultiplier: number;   // 0.5 - 1.1
  restMultiplier: number;        // 1.0 - 1.5
  painAreasToAvoid: string[];
  notes: string[];
  severity: 'green' | 'yellow' | 'red';
}

/**
 * Calcola gli adjustment basati sui dati di recovery
 */
export function calculateRecoveryAdjustments(recovery: RecoveryData): RecoveryAdjustments {
  let volumeMultiplier = 1.0;
  let intensityMultiplier = 1.0;
  let restMultiplier = 1.0;
  const notes: string[] = [];
  const painAreasToAvoid: string[] = [];
  let severity: 'green' | 'yellow' | 'red' = 'green';

  // ========================================
  // SONNO
  // ========================================
  if (recovery.sleepHours < 5) {
    volumeMultiplier *= 0.70;
    intensityMultiplier *= 0.80;
    restMultiplier *= 1.5;
    notes.push(`Volume -30% per sonno insufficiente (${recovery.sleepHours}h)`);
    severity = 'red';
  } else if (recovery.sleepHours < 6) {
    volumeMultiplier *= 0.85;
    intensityMultiplier *= 0.90;
    restMultiplier *= 1.3;
    notes.push(`Volume -15% per sonno basso (${recovery.sleepHours}h)`);
    severity = severity === 'green' ? 'yellow' : severity;
  } else if (recovery.sleepHours < 7) {
    volumeMultiplier *= 0.95;
    notes.push(`Volume -5% per sonno subottimale (${recovery.sleepHours}h)`);
  } else if (recovery.sleepHours > 9) {
    volumeMultiplier *= 0.95;
    notes.push('Attenzione: troppo sonno può indicare affaticamento');
  }

  // ========================================
  // STRESS
  // ========================================
  if (recovery.stressLevel >= 9) {
    volumeMultiplier *= 0.70;
    intensityMultiplier *= 0.75;
    restMultiplier *= 1.5;
    notes.push('Volume -30% per stress critico');
    severity = 'red';
  } else if (recovery.stressLevel >= 8) {
    volumeMultiplier *= 0.80;
    intensityMultiplier *= 0.85;
    restMultiplier *= 1.3;
    notes.push('Volume -20% per stress elevato');
    severity = severity === 'green' ? 'yellow' : severity;
  } else if (recovery.stressLevel >= 6) {
    volumeMultiplier *= 0.90;
    intensityMultiplier *= 0.95;
    notes.push('Volume -10% per stress moderato');
    severity = severity === 'green' ? 'yellow' : severity;
  }

  // ========================================
  // DOLORE / INFORTUNIO
  // ========================================
  if (recovery.hasInjury) {
    volumeMultiplier *= 0.80;
    intensityMultiplier *= 0.85;
    notes.push('Volume -20% per presenza dolore/infortunio');
    severity = severity === 'green' ? 'yellow' : severity;

    if (recovery.injuryDetails) {
      const injuryLower = recovery.injuryDetails.toLowerCase();
      if (injuryLower.includes('ginocchio') || injuryLower.includes('knee')) {
        painAreasToAvoid.push('knee');
      }
      if (injuryLower.includes('spalla') || injuryLower.includes('shoulder')) {
        painAreasToAvoid.push('shoulder');
      }
      if (injuryLower.includes('schiena') || injuryLower.includes('back')) {
        painAreasToAvoid.push('lower_back');
      }
      if (injuryLower.includes('caviglia') || injuryLower.includes('ankle')) {
        painAreasToAvoid.push('ankle');
      }
      if (injuryLower.includes('polso') || injuryLower.includes('wrist')) {
        painAreasToAvoid.push('wrist');
      }
    }
  }

  // Pain areas con intensità
  if (recovery.painAreas && recovery.painAreas.length > 0) {
    for (const pain of recovery.painAreas) {
      painAreasToAvoid.push(pain.area);
      if (pain.intensity >= 7) {
        notes.push(`⚠️ ${pain.area}: evitare completamente (intensità ${pain.intensity}/10)`);
        severity = 'red';
      } else if (pain.intensity >= 5) {
        notes.push(`🔶 ${pain.area}: carichi ridotti (intensità ${pain.intensity}/10)`);
        severity = severity === 'green' ? 'yellow' : severity;
      }
    }
  }

  // ========================================
  // CICLO MESTRUALE (Evidence-based)
  // ========================================
  if (recovery.isFemale && recovery.menstrualCycle) {
    switch (recovery.menstrualCycle) {
      case 'follicular':
        // Fase follicolare: capacità aumentata
        volumeMultiplier *= 1.05;
        intensityMultiplier *= 1.05;
        notes.push('Fase follicolare: capacità di allenamento aumentata');
        break;
      case 'ovulation':
        // Ovulazione: peak performance
        volumeMultiplier *= 1.10;
        intensityMultiplier *= 1.10;
        notes.push('Ovulazione: peak performance - sfrutta questo momento!');
        break;
      case 'luteal':
        // Fase luteale: capacità leggermente ridotta
        volumeMultiplier *= 0.95;
        notes.push('Fase luteale: capacità leggermente ridotta');
        break;
      case 'menstruation':
        // Mestruazione: ridurre intensità, focus mobilità
        volumeMultiplier *= 0.85;
        intensityMultiplier *= 0.85;
        restMultiplier *= 1.2;
        notes.push('Fase mestruale: intensità ottimizzata');
        severity = severity === 'green' ? 'yellow' : severity;
        break;
      case 'menopause':
        // Menopausa: focus su mobilità e forza ossea
        volumeMultiplier *= 0.95;
        notes.push('Menopausa: focus su forza e mobilità articolare');
        break;
    }
  }

  // ========================================
  // ENERGIA (se disponibile)
  // ========================================
  if (recovery.energyLevel !== undefined) {
    if (recovery.energyLevel <= 3) {
      volumeMultiplier *= 0.70;
      intensityMultiplier *= 0.75;
      notes.push('Energia molto bassa: allenamento leggero consigliato');
      severity = 'red';
    } else if (recovery.energyLevel <= 5) {
      volumeMultiplier *= 0.85;
      notes.push('Energia bassa: volume ridotto');
      severity = severity === 'green' ? 'yellow' : severity;
    }
  }

  // ========================================
  // LIMITI E CLEANUP
  // ========================================

  // Applica limiti
  volumeMultiplier = Math.max(0.50, Math.min(1.20, volumeMultiplier));
  intensityMultiplier = Math.max(0.50, Math.min(1.10, intensityMultiplier));
  restMultiplier = Math.max(1.0, Math.min(2.0, restMultiplier));

  // Arrotonda a 2 decimali
  volumeMultiplier = Math.round(volumeMultiplier * 100) / 100;
  intensityMultiplier = Math.round(intensityMultiplier * 100) / 100;
  restMultiplier = Math.round(restMultiplier * 100) / 100;

  return {
    volumeMultiplier,
    intensityMultiplier,
    restMultiplier,
    painAreasToAvoid: [...new Set(painAreasToAvoid)], // Remove duplicates
    notes,
    severity
  };
}

/**
 * Applica gli adjustment a un programma/workout
 */
export function applyRecoveryAdjustments(
  exercises: any[],
  adjustments: RecoveryAdjustments
): any[] {
  return exercises.map(exercise => {
    const exerciseLower = exercise.name?.toLowerCase() || '';

    // Skip se è in pain area
    for (const painArea of adjustments.painAreasToAvoid) {
      if (isExerciseAffectedByPain(exerciseLower, painArea)) {
        return {
          ...exercise,
          sets: Math.max(2, Math.round(exercise.sets * 0.5)),
          notes: `⚠️ Area dolorante - volume ridotto | ${exercise.notes || ''}`,
          isModified: true,
          modificationReason: `Pain area: ${painArea}`
        };
      }
    }

    // Applica adjustment volume (sets)
    const newSets = Math.max(2, Math.round(exercise.sets * adjustments.volumeMultiplier));

    // Applica adjustment rest
    const newRest = Math.round((exercise.rest || 90) * adjustments.restMultiplier);

    // Applica adjustment peso (se presente)
    let newWeight = exercise.weight;
    if (exercise.weight && typeof exercise.weight === 'number') {
      newWeight = Math.round(exercise.weight * adjustments.intensityMultiplier);
    }

    const isModified = newSets !== exercise.sets ||
                       newRest !== (exercise.rest || 90) ||
                       newWeight !== exercise.weight;

    return {
      ...exercise,
      sets: newSets,
      rest: newRest,
      weight: newWeight,
      isModified,
      originalSets: exercise.sets,
      originalRest: exercise.rest,
      originalWeight: exercise.weight,
      adjustmentApplied: true
    };
  });
}

/**
 * Verifica se un esercizio è affetto da una pain area
 */
function isExerciseAffectedByPain(exerciseName: string, painArea: string): boolean {
  const painMapping: Record<string, string[]> = {
    knee: ['squat', 'leg press', 'affondi', 'lunge', 'step', 'leg extension', 'leg curl'],
    lower_back: ['stacco', 'deadlift', 'good morning', 'rematore', 'row', 'back squat'],
    shoulder: ['military', 'press', 'alzate', 'raise', 'dips', 'panca', 'bench'],
    hip: ['squat', 'deadlift', 'affondi', 'hip thrust', 'glute'],
    ankle: ['calf', 'polpacci', 'jump', 'squat'],
    wrist: ['push-up', 'plank', 'front squat', 'curl'],
    neck: ['military', 'trazioni', 'pull', 'shrug']
  };

  const affectedExercises = painMapping[painArea] || [];
  return affectedExercises.some(keyword => exerciseName.includes(keyword));
}

/**
 * Genera un messaggio user-friendly per gli adjustment
 */
export function getAdjustmentSummary(adjustments: RecoveryAdjustments): string {
  if (adjustments.notes.length === 0) {
    return '✅ Nessun adattamento necessario - vai al massimo!';
  }

  const volumeChange = Math.round((1 - adjustments.volumeMultiplier) * 100);
  const intensityChange = Math.round((1 - adjustments.intensityMultiplier) * 100);

  let summary = '';

  if (volumeChange > 0) {
    summary += `📊 Volume: -${volumeChange}%\n`;
  }
  if (intensityChange > 0) {
    summary += `💪 Intensità: -${intensityChange}%\n`;
  }
  if (adjustments.restMultiplier > 1) {
    summary += `⏱️ Recuperi: +${Math.round((adjustments.restMultiplier - 1) * 100)}%\n`;
  }
  if (adjustments.painAreasToAvoid.length > 0) {
    summary += `🩹 Aree da evitare: ${adjustments.painAreasToAvoid.join(', ')}\n`;
  }

  return summary;
}

export default {
  calculateRecoveryAdjustments,
  applyRecoveryAdjustments,
  getAdjustmentSummary
};
