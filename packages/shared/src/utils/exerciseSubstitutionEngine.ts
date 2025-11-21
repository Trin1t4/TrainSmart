/**
 * Exercise Substitution Engine
 *
 * Intelligent exercise substitution system based on painful movement patterns.
 * Provides safe alternatives, exercise modifications, and pain-adapted programming.
 */

import {
  EXERCISE_ANATOMICAL_DATABASE,
  ExerciseAnatomicalProfile,
  ExerciseCategory,
  getExerciseProfile,
  getExercisesByCategory,
  isExerciseContraindicated
} from './exerciseAnatomicalClassification';
import { ANATOMICAL_RECOVERY_PROTOCOLS, getProtocolByMovement } from './anatomicalRecoveryProtocols';

// =============================================================================
// TYPES
// =============================================================================

export interface SubstitutionResult {
  safe_replacements: Array<{
    exerciseName: string;
    matchScore: number; // 0-100, how well it matches original exercise
    rationale: string;
  }>;
  rationale: string;
  modifications?: ExerciseModification[];
}

export interface ExerciseModification {
  type: 'rom' | 'load' | 'tempo' | 'position' | 'equipment';
  description: string;
  cues: string[];
  notes: string;
}

export interface ModificationResult {
  modified: boolean;
  modifications: ExerciseModification[];
  feasible: boolean; // Can the exercise be safely modified?
  rationale: string;
}

export interface PainAdaptedProgram {
  modified_exercises: Array<{
    original: string;
    action: 'keep' | 'modify' | 'replace';
    replacement?: string;
    modifications?: ExerciseModification[];
    rationale: string;
  }>;
  summary: string;
  protocol_recommendation?: string;
}

// =============================================================================
// CORE SUBSTITUTION LOGIC
// =============================================================================

/**
 * Find safe substitutions for an exercise based on painful movements
 */
export function findSafeSubstitutions(
  exerciseName: string,
  painfulMovements: string[],
  allAvailableExercises?: string[]
): SubstitutionResult {
  // 1. Get anatomical profile of the exercise
  const originalExercise = getExerciseProfile(exerciseName);

  if (!originalExercise) {
    return {
      safe_replacements: [],
      rationale: `Exercise "${exerciseName}" not found in database. Unable to provide substitutions.`,
      modifications: []
    };
  }

  // 2. Identify which movements in the exercise match painful movements
  const problematicMovements = getProblematicMovements(originalExercise, painfulMovements);

  if (problematicMovements.length === 0) {
    return {
      safe_replacements: [],
      rationale: `Exercise "${exerciseName}" does not involve any of the painful movements. Exercise can be performed.`,
      modifications: []
    };
  }

  // 3. Get candidate exercises (same category)
  const candidateExercises = allAvailableExercises
    ? allAvailableExercises
        .map((name) => getExerciseProfile(name))
        .filter((ex): ex is ExerciseAnatomicalProfile => ex !== undefined)
    : getExercisesByCategory(originalExercise.category);

  // 4. Filter exercises that don't use painful movements
  const safeExercises = candidateExercises.filter((candidate) => {
    if (candidate.exerciseName === originalExercise.exerciseName) return false;

    const candidateMovements = candidate.movements.flatMap((m) => [
      ...m.primary,
      ...m.secondary,
      ...(m.phase_specific
        ? [
            ...(m.phase_specific.eccentric || []),
            ...(m.phase_specific.bottom || []),
            ...(m.phase_specific.concentric || []),
            ...(m.phase_specific.top || [])
          ]
        : [])
    ]);

    // Check if candidate uses any painful movements
    const usesPainfulMovement = candidateMovements.some((movement) =>
      painfulMovements.includes(movement)
    );

    return !usesPainfulMovement;
  });

  // 5. Score and rank safe exercises by similarity to original
  const scoredExercises = safeExercises.map((candidate) => {
    const score = calculateMatchScore(originalExercise, candidate, painfulMovements);
    return {
      exercise: candidate,
      score
    };
  });

  // Sort by match score (descending)
  scoredExercises.sort((a, b) => b.score - a.score);

  // 6. Take top 5 alternatives
  const topAlternatives = scoredExercises.slice(0, 5).map((item) => ({
    exerciseName: item.exercise.exerciseName,
    matchScore: item.score,
    rationale: generateSubstitutionRationale(originalExercise, item.exercise, problematicMovements)
  }));

  // 7. Generate overall rationale
  const overallRationale = `Exercise "${exerciseName}" involves painful movements: ${problematicMovements.join(
    ', '
  )}. ${topAlternatives.length} safe alternatives found in same category (${
    originalExercise.category
  }).`;

  return {
    safe_replacements: topAlternatives,
    rationale: overallRationale,
    modifications: []
  };
}

/**
 * Modify exercise parameters to avoid painful movement
 */
export function modifyExerciseForPain(
  exerciseName: string,
  painfulMovement: string
): ModificationResult {
  const exercise = getExerciseProfile(exerciseName);

  if (!exercise) {
    return {
      modified: false,
      modifications: [],
      feasible: false,
      rationale: `Exercise "${exerciseName}" not found in database.`
    };
  }

  const modifications: ExerciseModification[] = [];

  // Check if exercise involves the painful movement
  const exerciseMovements = exercise.movements.flatMap((m) => [
    ...m.primary,
    ...m.secondary,
    ...(m.phase_specific
      ? [
          ...(m.phase_specific.eccentric || []),
          ...(m.phase_specific.bottom || []),
          ...(m.phase_specific.concentric || []),
          ...(m.phase_specific.top || [])
        ]
      : [])
  ]);

  if (!exerciseMovements.includes(painfulMovement)) {
    return {
      modified: false,
      modifications: [],
      feasible: true,
      rationale: `Exercise does not involve "${painfulMovement}". No modifications needed.`
    };
  }

  // Generate modifications based on movement pattern
  const movementMods = getMovementSpecificModifications(exerciseName, painfulMovement);

  if (movementMods.length > 0) {
    modifications.push(...movementMods);
  }

  // Check if exercise is in contraindicated list
  if (exercise.contraindicated_if_pain_in.includes(painfulMovement)) {
    return {
      modified: false,
      modifications,
      feasible: false,
      rationale: `Exercise "${exerciseName}" is contraindicated for pain in "${painfulMovement}". Recommend substitution rather than modification.`
    };
  }

  const feasible = modifications.length > 0;

  return {
    modified: feasible,
    modifications,
    feasible,
    rationale: feasible
      ? `Exercise can be modified to reduce stress on "${painfulMovement}".`
      : `No viable modifications found. Consider substitution.`
  };
}

/**
 * Generate pain-adapted program with substitutions and modifications
 */
export function generatePainAdaptedProgram(
  originalExercises: string[],
  painfulMovements: string[]
): PainAdaptedProgram {
  const modifiedExercises = originalExercises.map((exerciseName) => {
    const exercise = getExerciseProfile(exerciseName);

    if (!exercise) {
      return {
        original: exerciseName,
        action: 'keep' as const,
        rationale: 'Exercise not in database - unable to assess'
      };
    }

    // Check if exercise uses painful movements
    const isContraindicated = painfulMovements.some((movement) =>
      exercise.contraindicated_if_pain_in.includes(movement)
    );

    const exerciseMovements = exercise.movements.flatMap((m) => [...m.primary, ...m.secondary]);
    const usesPainfulMovement = exerciseMovements.some((movement) =>
      painfulMovements.includes(movement)
    );

    // Decision tree
    if (!usesPainfulMovement) {
      // Exercise is safe - keep it
      return {
        original: exerciseName,
        action: 'keep' as const,
        rationale: 'Exercise does not involve painful movements - safe to perform'
      };
    } else if (isContraindicated) {
      // Exercise is contraindicated - replace it
      const substitution = findSafeSubstitutions(exerciseName, painfulMovements);
      const bestReplacement = substitution.safe_replacements[0];

      if (bestReplacement) {
        return {
          original: exerciseName,
          action: 'replace' as const,
          replacement: bestReplacement.exerciseName,
          rationale: `Contraindicated for painful movements. Replaced with ${bestReplacement.exerciseName} (match: ${bestReplacement.matchScore}%).`
        };
      } else {
        return {
          original: exerciseName,
          action: 'replace' as const,
          rationale: 'Contraindicated but no suitable replacement found - consider removing from program'
        };
      }
    } else {
      // Exercise uses painful movement but not contraindicated - try to modify
      const modification = modifyExerciseForPain(exerciseName, painfulMovements[0]);

      if (modification.feasible && modification.modifications.length > 0) {
        return {
          original: exerciseName,
          action: 'modify' as const,
          modifications: modification.modifications,
          rationale: 'Exercise modified to reduce painful movement stress'
        };
      } else {
        // Modification not feasible - replace
        const substitution = findSafeSubstitutions(exerciseName, painfulMovements);
        const bestReplacement = substitution.safe_replacements[0];

        if (bestReplacement) {
          return {
            original: exerciseName,
            action: 'replace' as const,
            replacement: bestReplacement.exerciseName,
            rationale: `Modification not feasible. Replaced with ${bestReplacement.exerciseName}.`
          };
        } else {
          return {
            original: exerciseName,
            action: 'modify' as const,
            modifications: modification.modifications,
            rationale: 'No suitable replacement found - attempt modifications with caution'
          };
        }
      }
    }
  });

  // Generate summary
  const kept = modifiedExercises.filter((e) => e.action === 'keep').length;
  const modified = modifiedExercises.filter((e) => e.action === 'modify').length;
  const replaced = modifiedExercises.filter((e) => e.action === 'replace').length;

  const summary = `Pain-Adapted Program: ${kept} exercises kept, ${modified} modified, ${replaced} replaced. Total: ${originalExercises.length} exercises.`;

  // Check if there's a relevant recovery protocol
  let protocolRecommendation: string | undefined;
  if (painfulMovements.length > 0) {
    const protocol = getProtocolByMovement(painfulMovements[0]);
    if (protocol) {
      protocolRecommendation = `Recommended Protocol: ${protocol.protocol_name}. Consider following structured recovery phases.`;
    }
  }

  return {
    modified_exercises: modifiedExercises,
    summary,
    protocol_recommendation: protocolRecommendation
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get movements in exercise that match painful movements
 */
function getProblematicMovements(
  exercise: ExerciseAnatomicalProfile,
  painfulMovements: string[]
): string[] {
  const exerciseMovements = exercise.movements.flatMap((m) => [
    ...m.primary,
    ...m.secondary,
    ...(m.phase_specific
      ? [
          ...(m.phase_specific.eccentric || []),
          ...(m.phase_specific.bottom || []),
          ...(m.phase_specific.concentric || []),
          ...(m.phase_specific.top || [])
        ]
      : [])
  ]);

  return painfulMovements.filter((pm) => exerciseMovements.includes(pm));
}

/**
 * Calculate match score between two exercises
 */
function calculateMatchScore(
  original: ExerciseAnatomicalProfile,
  candidate: ExerciseAnatomicalProfile,
  painfulMovements: string[]
): number {
  let score = 0;

  // Same category (very important) +40 points
  if (original.category === candidate.category) {
    score += 40;
  }

  // Overlapping primary regions +30 points
  const overlappingRegions = original.primaryRegions.filter((region) =>
    candidate.primaryRegions.includes(region)
  );
  score += (overlappingRegions.length / original.primaryRegions.length) * 30;

  // Similar movement patterns (non-painful) +20 points
  const originalMovements = original.movements.flatMap((m) => m.primary);
  const candidateMovements = candidate.movements.flatMap((m) => m.primary);

  const safeSimilarMovements = originalMovements.filter(
    (om) => candidateMovements.includes(om) && !painfulMovements.includes(om)
  );

  if (originalMovements.length > 0) {
    score += (safeSimilarMovements.length / originalMovements.length) * 20;
  }

  // Listed as safe alternative in original exercise +10 points
  if (original.safe_alternatives && original.safe_alternatives.includes(candidate.exerciseName)) {
    score += 10;
  }

  return Math.round(score);
}

/**
 * Generate rationale for substitution
 */
function generateSubstitutionRationale(
  original: ExerciseAnatomicalProfile,
  substitute: ExerciseAnatomicalProfile,
  problematicMovements: string[]
): string {
  const reasons: string[] = [];

  if (original.category === substitute.category) {
    reasons.push('same movement category');
  }

  const overlappingRegions = original.primaryRegions.filter((region) =>
    substitute.primaryRegions.includes(region)
  );

  if (overlappingRegions.length > 0) {
    reasons.push(`targets ${overlappingRegions.join(', ')}`);
  }

  reasons.push(`avoids ${problematicMovements.join(', ')}`);

  return reasons.join('; ');
}

/**
 * Get movement-specific modifications
 */
function getMovementSpecificModifications(
  exerciseName: string,
  painfulMovement: string
): ExerciseModification[] {
  const modifications: ExerciseModification[] = [];

  // Spinal Flexion modifications
  if (painfulMovement === 'spinal_flexion') {
    if (exerciseName.toLowerCase().includes('deadlift')) {
      modifications.push({
        type: 'position',
        description: 'Elevate starting position (rack pull)',
        cues: ['Start from pins at knee height', 'Avoid floor touch', 'Maintain neutral spine'],
        notes: 'Eliminates flexion at setup. Consider trap bar or Romanian deadlift.'
      });
    }

    if (exerciseName.toLowerCase().includes('row')) {
      modifications.push({
        type: 'position',
        description: 'Use chest-supported variation',
        cues: ['Lie prone on incline bench', 'Let chest support torso', 'No spinal flexion required'],
        notes: 'Completely eliminates spinal flexion demand. Ideal for flexion-intolerant backs.'
      });
    }

    if (exerciseName.toLowerCase().includes('squat')) {
      modifications.push({
        type: 'rom',
        description: 'Limit depth to prevent buttwink',
        cues: [
          'Squat to parallel only (50-70% depth)',
          'Stop before pelvis tilts',
          'Use box to control depth'
        ],
        notes: 'Buttwink indicates end of hip flexion ROM. Stop before this point.'
      });
    }
  }

  // Spinal Extension modifications
  if (painfulMovement === 'spinal_extension') {
    if (
      exerciseName.toLowerCase().includes('overhead press') ||
      exerciseName.toLowerCase().includes('shoulder press')
    ) {
      modifications.push({
        type: 'position',
        description: 'Use seated variation with back support',
        cues: [
          'Sit on bench with back pad',
          'Keep lower back against pad',
          'Avoid excessive lean back'
        ],
        notes: 'Eliminates compensatory lumbar extension. Consider landmine press alternative.'
      });
    }

    if (exerciseName.toLowerCase().includes('hip thrust')) {
      modifications.push({
        type: 'rom',
        description: 'Limit top ROM to avoid hyperextension',
        cues: ['Stop at hip alignment', 'Avoid excessive arch', 'Focus on glute squeeze not back arch'],
        notes: 'Top position often causes excessive lumbar extension. Stop at neutral hip alignment.'
      });
    }

    if (exerciseName.toLowerCase().includes('plank')) {
      modifications.push({
        type: 'position',
        description: 'Elevate hands or use dead bug alternative',
        cues: [
          'Place hands on bench',
          'Avoid sagging hips',
          'Consider dead bug as alternative'
        ],
        notes: 'Plank can cause lumbar sag. Elevating hands reduces extension stress.'
      });
    }
  }

  // Hip Flexion modifications
  if (painfulMovement === 'hip_flexion' || painfulMovement.includes('deep_hip_flexion')) {
    if (exerciseName.toLowerCase().includes('squat')) {
      modifications.push({
        type: 'rom',
        description: 'Reduce squat depth to 50-70%',
        cues: [
          'Squat to parallel or slightly above',
          'Use box at appropriate height',
          'Stop at first sign of discomfort'
        ],
        notes: 'Deep hip flexion often problematic in FAI. Box squat provides consistent depth control.'
      });

      modifications.push({
        type: 'position',
        description: 'Widen stance, turn toes out',
        cues: ['Stance 1.5x shoulder width', 'Toes out 20-30°', 'Push knees out over toes'],
        notes: 'Wider stance reduces hip flexion demand. More external rotation, less flexion required.'
      });

      modifications.push({
        type: 'equipment',
        description: 'Elevate heels',
        cues: ['Use 0.5-1 inch heel wedge', 'Allows more upright torso', 'Reduces hip flexion demand'],
        notes: 'Heel elevation shifts load more to quads, reduces hip flexion. Use plates or lifting shoes.'
      });
    }
  }

  // Knee Flexion / Patellofemoral Compression modifications
  if (
    painfulMovement === 'knee_flexion' ||
    painfulMovement === 'patellofemoral_compression' ||
    painfulMovement === 'knee_pain'
  ) {
    if (exerciseName.toLowerCase().includes('squat')) {
      modifications.push({
        type: 'rom',
        description: 'Limit depth to 60-90° knee flexion',
        cues: [
          'Partial squat only',
          'Box squat at appropriate height',
          'Stop well before full depth'
        ],
        notes: 'Patellofemoral compression increases with depth. Limit ROM significantly.'
      });

      modifications.push({
        type: 'equipment',
        description: 'Consider Spanish Squat or wall sit',
        cues: [
          'Use resistance band behind knees',
          'Band pulls tibia backward',
          'Reduces PF compression'
        ],
        notes: 'Spanish squat creates posterior tibial translation = reduced patellofemoral stress.'
      });
    }

    if (exerciseName.toLowerCase().includes('lunge')) {
      modifications.push({
        type: 'position',
        description: 'Use reverse lunge instead of forward',
        cues: ['Step backward not forward', 'Less knee shear force', 'Easier to control'],
        notes: 'Reverse lunges have significantly lower anterior knee shear than forward lunges.'
      });
    }

    if (exerciseName.toLowerCase().includes('leg extension')) {
      modifications.push({
        type: 'rom',
        description: 'Limited ROM (90-45° only)',
        cues: [
          'Start at 90° knee flexion',
          'Stop at 45°',
          'Avoid last 45° (highest stress)'
        ],
        notes: 'Last 45° of knee extension has highest PF compression and shear. Avoid this range.'
      });
    }
  }

  // Shoulder Flexion / Impingement modifications
  if (
    painfulMovement === 'shoulder_flexion' ||
    painfulMovement === 'shoulder_abduction' ||
    painfulMovement.includes('impingement')
  ) {
    if (
      exerciseName.toLowerCase().includes('overhead press') ||
      exerciseName.toLowerCase().includes('shoulder press')
    ) {
      modifications.push({
        type: 'rom',
        description: 'Limit overhead ROM to pain-free range',
        cues: ['Stop at 120-150° shoulder flexion', 'Avoid full overhead', 'Pin press variation'],
        notes: 'Impingement typically occurs 60-120°. Limiting ROM may allow training.'
      });

      modifications.push({
        type: 'equipment',
        description: 'Use landmine press instead',
        cues: ['Angled path reduces impingement', 'More shoulder-friendly', 'Single-arm option'],
        notes: 'Landmine press arc often bypasses impingement zone. Excellent alternative.'
      });
    }

    if (exerciseName.toLowerCase().includes('lateral raise')) {
      modifications.push({
        type: 'rom',
        description: 'Stop at 90° or before pain',
        cues: ['Raise to shoulder height only', 'Avoid painful arc', 'Stop at first discomfort'],
        notes: 'Painful arc typically 60-120°. Limiting ROM may allow exercise.'
      });
    }
  }

  // Spinal Rotation modifications
  if (
    painfulMovement === 'spinal_rotation_right' ||
    painfulMovement === 'spinal_rotation_left' ||
    painfulMovement.includes('rotation')
  ) {
    if (exerciseName.toLowerCase().includes('russian twist')) {
      modifications.push({
        type: 'position',
        description: 'Replace with Pallof Press',
        cues: [
          'Use anti-rotation exercise instead',
          'Pallof press is safer',
          'Builds rotation resistance'
        ],
        notes: 'Russian twist combines flexion + rotation = high risk. Pallof press is superior alternative.'
      });
    }
  }

  // Axial Compression modifications
  if (painfulMovement === 'spinal_axial_compression') {
    if (exerciseName.toLowerCase().includes('squat') || exerciseName.toLowerCase().includes('press')) {
      modifications.push({
        type: 'load',
        description: 'Reduce load significantly (40-60%)',
        cues: ['Use lighter weights', 'Higher rep ranges (12-15)', 'Focus on technique'],
        notes: 'Reduce compressive load while maintaining movement pattern. Consider alternative exercises.'
      });

      modifications.push({
        type: 'position',
        description: 'Replace with horizontal loading variation',
        cues: [
          'Use leg press instead of squat',
          'Use landmine press instead of overhead press',
          'Eliminates vertical compression'
        ],
        notes: 'Horizontal loading removes axial compression entirely. Ideal for compression-intolerant spines.'
      });
    }
  }

  return modifications;
}

// =============================================================================
// ADVANCED FUNCTIONS
// =============================================================================

/**
 * Analyze entire program and identify patterns of painful movements
 */
export function analyzeProgramPainPatterns(
  exercises: string[],
  painfulMovements: string[]
): {
  high_risk_exercises: string[];
  moderate_risk_exercises: string[];
  safe_exercises: string[];
  movement_frequency: Record<string, number>;
  recommendations: string[];
} {
  const highRisk: string[] = [];
  const moderateRisk: string[] = [];
  const safe: string[] = [];
  const movementFrequency: Record<string, number> = {};

  exercises.forEach((exerciseName) => {
    const exercise = getExerciseProfile(exerciseName);
    if (!exercise) return;

    const exerciseMovements = exercise.movements.flatMap((m) => [
      ...m.primary,
      ...m.secondary
    ]);

    // Count movement frequency
    exerciseMovements.forEach((movement) => {
      movementFrequency[movement] = (movementFrequency[movement] || 0) + 1;
    });

    const isContraindicated = painfulMovements.some((pm) =>
      exercise.contraindicated_if_pain_in.includes(pm)
    );

    const usesPainfulMovement = exerciseMovements.some((em) =>
      painfulMovements.includes(em)
    );

    if (isContraindicated) {
      highRisk.push(exerciseName);
    } else if (usesPainfulMovement) {
      moderateRisk.push(exerciseName);
    } else {
      safe.push(exerciseName);
    }
  });

  // Generate recommendations
  const recommendations: string[] = [];

  if (highRisk.length > 0) {
    recommendations.push(
      `⚠️ ${highRisk.length} exercises are contraindicated and should be replaced immediately.`
    );
  }

  if (moderateRisk.length > 0) {
    recommendations.push(
      `⚡ ${moderateRisk.length} exercises use painful movements - consider modification or substitution.`
    );
  }

  if (safe.length === exercises.length) {
    recommendations.push('✅ All exercises are safe for current pain pattern.');
  }

  // Identify most problematic painful movement
  const painfulMovementCounts: Record<string, number> = {};
  painfulMovements.forEach((pm) => {
    painfulMovementCounts[pm] = movementFrequency[pm] || 0;
  });

  const mostProblematic = Object.entries(painfulMovementCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (mostProblematic && mostProblematic[1] > 0) {
    recommendations.push(
      `🎯 Most problematic movement: "${mostProblematic[0]}" appears in ${mostProblematic[1]} exercises.`
    );

    // Suggest protocol
    const protocol = getProtocolByMovement(mostProblematic[0]);
    if (protocol) {
      recommendations.push(
        `📋 Recommended: Follow "${protocol.protocol_name}" for structured recovery.`
      );
    }
  }

  return {
    high_risk_exercises: highRisk,
    moderate_risk_exercises: moderateRisk,
    safe_exercises: safe,
    movement_frequency: movementFrequency,
    recommendations
  };
}

/**
 * Get exercise substitution with detailed reasoning for user education
 */
export function getEducationalSubstitution(
  exerciseName: string,
  painfulMovement: string
): {
  shouldSubstitute: boolean;
  reasoning: string;
  bestAlternative?: string;
  modifications?: ExerciseModification[];
  learningPoints: string[];
} {
  const exercise = getExerciseProfile(exerciseName);

  if (!exercise) {
    return {
      shouldSubstitute: false,
      reasoning: 'Exercise not found in database',
      learningPoints: []
    };
  }

  const isContraindicated = exercise.contraindicated_if_pain_in.includes(painfulMovement);
  const learningPoints: string[] = [];

  // Add educational points
  if (painfulMovement === 'spinal_flexion') {
    learningPoints.push(
      'Spinal flexion involves bending forward. This can irritate disc pathology.',
      'Exercises requiring flexion at setup (like deadlifts from floor) are often problematic.',
      'McKenzie extensions (prone press-ups) can help centralize disc-related pain.'
    );
  }

  if (painfulMovement === 'patellofemoral_compression') {
    learningPoints.push(
      'Patellofemoral compression increases with knee flexion depth.',
      'Deeper squats = more compression on the kneecap.',
      'Spanish squats and limited ROM exercises reduce this compression.'
    );
  }

  if (painfulMovement.includes('shoulder')) {
    learningPoints.push(
      'Shoulder impingement typically occurs in the 60-120° range of motion.',
      'Face pulls and external rotation exercises improve shoulder health.',
      'A 2:1 pull-to-push exercise ratio helps prevent shoulder issues.'
    );
  }

  if (isContraindicated) {
    const substitution = findSafeSubstitutions(exerciseName, [painfulMovement]);
    const best = substitution.safe_replacements[0];

    return {
      shouldSubstitute: true,
      reasoning: `"${exerciseName}" is contraindicated for pain in ${painfulMovement}. This movement is a primary component of the exercise and cannot be safely avoided. Substitution recommended.`,
      bestAlternative: best?.exerciseName,
      learningPoints
    };
  } else {
    const modification = modifyExerciseForPain(exerciseName, painfulMovement);

    if (modification.feasible) {
      return {
        shouldSubstitute: false,
        reasoning: `"${exerciseName}" uses ${painfulMovement} but can be modified to reduce stress. Try the modifications below before substituting.`,
        modifications: modification.modifications,
        learningPoints
      };
    } else {
      const substitution = findSafeSubstitutions(exerciseName, [painfulMovement]);
      const best = substitution.safe_replacements[0];

      return {
        shouldSubstitute: true,
        reasoning: `"${exerciseName}" involves ${painfulMovement} and cannot be easily modified. Substitution recommended.`,
        bestAlternative: best?.exerciseName,
        learningPoints
      };
    }
  }
}

// =============================================================================
// EXPORT STATS
// =============================================================================

export function getSubstitutionEngineStats() {
  const allExercises = Object.values(EXERCISE_ANATOMICAL_DATABASE);

  const exercisesWithAlternatives = allExercises.filter(
    (ex) => ex.safe_alternatives && ex.safe_alternatives.length > 0
  ).length;

  const avgAlternatives =
    allExercises.reduce(
      (sum, ex) => sum + (ex.safe_alternatives?.length || 0),
      0
    ) / allExercises.length;

  return {
    totalExercises: allExercises.length,
    exercisesWithAlternatives,
    avgAlternativesPerExercise: avgAlternatives.toFixed(2)
  };
}
