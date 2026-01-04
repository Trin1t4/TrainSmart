/**
 * SUBSTITUTION CONFIDENCE SCORING
 *
 * Determina quanto "buona" è una sostituzione esercizio
 * basandosi su criteri biomeccanici e funzionali.
 *
 * Score: 0-100
 * - HIGH (80-100): Sostituzione ottimale, applica automaticamente
 * - MEDIUM (50-79): Buona sostituzione, applica con nota
 * - LOW (30-49): Sostituzione accettabile, chiedi conferma
 * - VERY_LOW (0-29): Sostituzione subottimale, suggerisci alternativa o skip
 */

// ============================================================================
// TYPES
// ============================================================================

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface SubstitutionScore {
  score: number;
  level: ConfidenceLevel;
  factors: {
    name: string;
    contribution: number;
    details: string;
  }[];
  recommendation: 'AUTO_APPLY' | 'APPLY_WITH_NOTE' | 'ASK_USER' | 'SUGGEST_SKIP';
  userPrompt?: string;
}

interface Exercise {
  name: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface SubstitutionCandidate {
  exercise: Exercise;
  score: SubstitutionScore;
  reasonForSuggestion: string;
}

// ============================================================================
// SCORING FACTORS
// ============================================================================

/**
 * Calcola confidence score per una sostituzione
 */
export function calculateSubstitutionConfidence(
  originalExercise: Exercise,
  substituteExercise: Exercise,
  context: {
    availableEquipment: string[];
    userLevel: 'beginner' | 'intermediate' | 'advanced';
    painArea: string;
    painSeverity: 'mild' | 'moderate' | 'severe';
  }
): SubstitutionScore {
  const factors: SubstitutionScore['factors'] = [];
  let totalScore = 0;

  // =========================================================================
  // FACTOR 1: Movement Pattern Match (0-30 points)
  // =========================================================================
  const patternScore = scoreMovementPatternMatch(originalExercise, substituteExercise);
  factors.push({
    name: 'Movement Pattern Match',
    contribution: patternScore,
    details: patternScore >= 25
      ? 'Same primary movement pattern'
      : patternScore >= 15
        ? 'Similar movement pattern'
        : 'Different movement pattern'
  });
  totalScore += patternScore;

  // =========================================================================
  // FACTOR 2: Muscle Activation Similarity (0-25 points)
  // =========================================================================
  const muscleScore = scoreMuscleActivation(originalExercise, substituteExercise);
  factors.push({
    name: 'Muscle Activation',
    contribution: muscleScore,
    details: muscleScore >= 20
      ? 'Same primary muscles targeted'
      : muscleScore >= 10
        ? 'Partial muscle overlap'
        : 'Different muscle focus'
  });
  totalScore += muscleScore;

  // =========================================================================
  // FACTOR 3: Equipment Availability (0-15 points)
  // =========================================================================
  const equipmentScore = scoreEquipmentAvailability(
    substituteExercise,
    context.availableEquipment
  );
  factors.push({
    name: 'Equipment Available',
    contribution: equipmentScore,
    details: equipmentScore >= 12
      ? 'Equipment available'
      : equipmentScore >= 6
        ? 'Partial equipment'
        : 'Equipment not available'
  });
  totalScore += equipmentScore;

  // =========================================================================
  // FACTOR 4: Difficulty Match (0-15 points)
  // =========================================================================
  const difficultyScore = scoreDifficultyMatch(
    originalExercise,
    substituteExercise,
    context.userLevel
  );
  factors.push({
    name: 'Difficulty Match',
    contribution: difficultyScore,
    details: difficultyScore >= 12
      ? 'Appropriate difficulty'
      : difficultyScore >= 6
        ? 'Slightly different difficulty'
        : 'Difficulty mismatch'
  });
  totalScore += difficultyScore;

  // =========================================================================
  // FACTOR 5: Pain Avoidance Effectiveness (0-15 points)
  // =========================================================================
  const painAvoidanceScore = scorePainAvoidance(
    originalExercise,
    substituteExercise,
    context.painArea,
    context.painSeverity
  );
  factors.push({
    name: 'Pain Avoidance',
    contribution: painAvoidanceScore,
    details: painAvoidanceScore >= 12
      ? 'Effectively avoids pain area'
      : painAvoidanceScore >= 6
        ? 'Partially avoids pain area'
        : 'May still involve pain area'
  });
  totalScore += painAvoidanceScore;

  // =========================================================================
  // Determine Level and Recommendation
  // =========================================================================
  const level = getConfidenceLevel(totalScore);
  const recommendation = getRecommendation(level, context.painSeverity);
  const userPrompt = generateUserPrompt(
    level,
    originalExercise,
    substituteExercise,
    factors
  );

  return {
    score: totalScore,
    level,
    factors,
    recommendation,
    userPrompt
  };
}

// ============================================================================
// SCORING HELPER FUNCTIONS
// ============================================================================

/**
 * Score movement pattern similarity
 */
function scoreMovementPatternMatch(original: Exercise, substitute: Exercise): number {
  // Define movement pattern categories
  const getPattern = (ex: Exercise): string => {
    const name = ex.name.toLowerCase();

    // Lower body patterns
    if (name.includes('squat') || name.includes('leg press')) return 'knee_dominant';
    if (name.includes('deadlift') || name.includes('hip thrust') || name.includes('rdl')) return 'hip_dominant';
    if (name.includes('lunge') || name.includes('split')) return 'single_leg';
    if (name.includes('leg curl') || name.includes('leg extension')) return 'knee_isolation';

    // Upper body push
    if (name.includes('bench') || name.includes('push-up') || name.includes('pushup')) return 'horizontal_push';
    if (name.includes('overhead') || name.includes('shoulder press') || name.includes('military')) return 'vertical_push';
    if (name.includes('dip') || name.includes('close grip')) return 'tricep_push';

    // Upper body pull
    if (name.includes('row') || name.includes('cable pull')) return 'horizontal_pull';
    if (name.includes('pull-up') || name.includes('pullup') || name.includes('lat pull') || name.includes('chin')) return 'vertical_pull';
    if (name.includes('curl')) return 'bicep_pull';

    // Core
    if (name.includes('plank') || name.includes('dead bug') || name.includes('bird dog')) return 'core_stability';
    if (name.includes('crunch') || name.includes('sit-up')) return 'core_flexion';

    return 'unknown';
  };

  const originalPattern = getPattern(original);
  const substitutePattern = getPattern(substitute);

  if (originalPattern === substitutePattern) return 30;

  // Related patterns get partial credit
  const relatedPatterns: Record<string, string[]> = {
    'knee_dominant': ['single_leg', 'hip_dominant'],
    'hip_dominant': ['knee_dominant', 'single_leg'],
    'single_leg': ['knee_dominant', 'hip_dominant'],
    'horizontal_push': ['vertical_push', 'tricep_push'],
    'vertical_push': ['horizontal_push', 'tricep_push'],
    'horizontal_pull': ['vertical_pull', 'bicep_pull'],
    'vertical_pull': ['horizontal_pull', 'bicep_pull'],
    'core_stability': ['core_flexion'],
    'core_flexion': ['core_stability']
  };

  if (relatedPatterns[originalPattern]?.includes(substitutePattern)) return 18;

  return 5;
}

/**
 * Score muscle activation similarity
 */
function scoreMuscleActivation(original: Exercise, substitute: Exercise): number {
  // Get primary muscles for each exercise
  const getMuscles = (ex: Exercise): string[] => {
    const name = ex.name.toLowerCase();

    if (name.includes('squat')) return ['quadriceps', 'glutes', 'core'];
    if (name.includes('deadlift') || name.includes('rdl')) return ['glutes', 'hamstrings', 'back'];
    if (name.includes('hip thrust')) return ['glutes', 'hamstrings'];
    if (name.includes('lunge') || name.includes('split')) return ['quadriceps', 'glutes'];
    if (name.includes('leg press')) return ['quadriceps', 'glutes'];
    if (name.includes('leg curl')) return ['hamstrings'];
    if (name.includes('leg extension')) return ['quadriceps'];

    if (name.includes('bench') || name.includes('push-up')) return ['chest', 'triceps', 'shoulders'];
    if (name.includes('overhead') || name.includes('shoulder press')) return ['shoulders', 'triceps'];
    if (name.includes('dip')) return ['chest', 'triceps'];
    if (name.includes('fly')) return ['chest'];

    if (name.includes('row')) return ['lats', 'rhomboids', 'biceps'];
    if (name.includes('pull-up') || name.includes('lat pull')) return ['lats', 'biceps'];
    if (name.includes('curl')) return ['biceps'];
    if (name.includes('face pull')) return ['rear_delts', 'rhomboids'];

    return [];
  };

  const originalMuscles = getMuscles(original);
  const substituteMuscles = getMuscles(substitute);

  if (originalMuscles.length === 0 || substituteMuscles.length === 0) return 10;

  // Calculate overlap
  const overlap = originalMuscles.filter(m => substituteMuscles.includes(m)).length;
  const overlapPercent = overlap / originalMuscles.length;

  if (overlapPercent >= 0.8) return 25;
  if (overlapPercent >= 0.5) return 18;
  if (overlapPercent >= 0.3) return 10;
  return 5;
}

/**
 * Score equipment availability
 */
function scoreEquipmentAvailability(substitute: Exercise, available: string[]): number {
  const getRequiredEquipment = (ex: Exercise): string[] => {
    const name = ex.name.toLowerCase();

    if (name.includes('barbell') || name.includes('back squat') || name.includes('deadlift')) {
      return ['barbell', 'plates'];
    }
    if (name.includes('dumbbell') || name.includes('db ')) return ['dumbbells'];
    if (name.includes('cable') || name.includes('machine')) return ['cable_machine'];
    if (name.includes('kettlebell')) return ['kettlebell'];
    if (name.includes('band') || name.includes('resistance')) return ['bands'];
    if (name.includes('pull-up') || name.includes('chin')) return ['pullup_bar'];
    if (name.includes('bench') && !name.includes('push')) return ['bench'];

    // Bodyweight exercises
    if (name.includes('push-up') || name.includes('plank') || name.includes('squat')) {
      return []; // No equipment needed
    }

    return [];
  };

  const required = getRequiredEquipment(substitute);

  // Bodyweight exercise - always available
  if (required.length === 0) return 15;

  // Check if all required equipment is available
  const hasAll = required.every(eq =>
    available.some(a => a.toLowerCase().includes(eq.toLowerCase()))
  );

  if (hasAll) return 15;

  // Partial equipment
  const hasPartial = required.some(eq =>
    available.some(a => a.toLowerCase().includes(eq.toLowerCase()))
  );

  if (hasPartial) return 8;

  return 0;
}

/**
 * Score difficulty match
 */
function scoreDifficultyMatch(
  original: Exercise,
  substitute: Exercise,
  userLevel: 'beginner' | 'intermediate' | 'advanced'
): number {
  const getDifficulty = (ex: Exercise): number => {
    const name = ex.name.toLowerCase();

    // Advanced (3)
    if (name.includes('pistol') || name.includes('muscle up') || name.includes('handstand')) return 3;
    if (name.includes('snatch') || name.includes('clean')) return 3;
    if (name.includes('deficit') || name.includes('pause') || name.includes('tempo')) return 3;

    // Intermediate (2)
    if (name.includes('deadlift') || name.includes('barbell')) return 2;
    if (name.includes('pull-up') || name.includes('dip')) return 2;
    if (name.includes('single leg') || name.includes('unilateral')) return 2;

    // Beginner (1)
    if (name.includes('machine') || name.includes('assisted')) return 1;
    if (name.includes('seated') || name.includes('supported')) return 1;
    if (name.includes('bodyweight') || name.includes('push-up') || name.includes('squat')) return 1;

    return 2; // Default to intermediate
  };

  const originalDiff = getDifficulty(original);
  const substituteDiff = getDifficulty(substitute);
  const userDiff = userLevel === 'beginner' ? 1 : userLevel === 'intermediate' ? 2 : 3;

  // Exact match
  if (originalDiff === substituteDiff) return 15;

  // One level difference is acceptable
  if (Math.abs(originalDiff - substituteDiff) === 1) {
    // Bonus if substitute matches user level
    if (substituteDiff === userDiff) return 12;
    return 10;
  }

  // Two levels difference
  return 5;
}

/**
 * Score pain avoidance effectiveness
 */
function scorePainAvoidance(
  _original: Exercise,
  substitute: Exercise,
  painArea: string,
  painSeverity: 'mild' | 'moderate' | 'severe'
): number {
  const painAreaMap: Record<string, string[]> = {
    'knee': ['squat', 'lunge', 'leg extension', 'leg press', 'jump'],
    'shoulder': ['press', 'raise', 'pull-up', 'dip', 'fly'],
    'lower_back': ['deadlift', 'row', 'good morning', 'squat'],
    'hip': ['squat', 'lunge', 'deadlift', 'hip thrust'],
    'wrist': ['push-up', 'curl', 'press'],
    'elbow': ['curl', 'tricep', 'press']
  };

  const problematicKeywords = painAreaMap[painArea] || [];
  const substituteName = substitute.name.toLowerCase();

  // Check if substitute involves pain area
  const involvesArea = problematicKeywords.some(kw =>
    substituteName.includes(kw.toLowerCase())
  );

  if (!involvesArea) {
    return 15; // Completely avoids pain area
  }

  // If it still involves area, check if it's a safer variant
  const saferVariants = [
    'machine', 'seated', 'supported', 'isometric',
    'partial', 'limited rom', 'light', 'band'
  ];

  const isSaferVariant = saferVariants.some(v =>
    substituteName.includes(v.toLowerCase())
  );

  if (isSaferVariant) {
    // Severity matters for safer variants
    if (painSeverity === 'mild') return 10;
    if (painSeverity === 'moderate') return 6;
    return 3; // Severe - still risky even with safer variant
  }

  // Still involves pain area and not a safer variant
  return 0;
}

// ============================================================================
// LEVEL AND RECOMMENDATION HELPERS
// ============================================================================

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 80) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 30) return 'LOW';
  return 'VERY_LOW';
}

function getRecommendation(
  level: ConfidenceLevel,
  painSeverity: 'mild' | 'moderate' | 'severe'
): SubstitutionScore['recommendation'] {
  // With severe pain, be more conservative
  if (painSeverity === 'severe') {
    if (level === 'HIGH') return 'APPLY_WITH_NOTE';
    if (level === 'MEDIUM') return 'ASK_USER';
    return 'SUGGEST_SKIP';
  }

  // Normal flow
  switch (level) {
    case 'HIGH':
      return 'AUTO_APPLY';
    case 'MEDIUM':
      return 'APPLY_WITH_NOTE';
    case 'LOW':
      return 'ASK_USER';
    case 'VERY_LOW':
      return 'SUGGEST_SKIP';
  }
}

function generateUserPrompt(
  level: ConfidenceLevel,
  original: Exercise,
  substitute: Exercise,
  factors: SubstitutionScore['factors']
): string | undefined {
  if (level === 'HIGH') return undefined;

  const weakFactors = factors
    .filter(f => f.contribution < (f.name === 'Movement Pattern Match' ? 20 : 10))
    .map(f => f.name);

  if (level === 'MEDIUM') {
    return `Sostituendo ${original.name} con ${substitute.name}. ` +
           `Questa è una buona alternativa.`;
  }

  if (level === 'LOW') {
    return `Vuoi sostituire ${original.name} con ${substitute.name}?\n\n` +
           `⚠️ Nota: ${weakFactors.join(', ')} potrebbero essere diversi dall'originale.\n\n` +
           `Oppure preferisci saltare questo esercizio oggi?`;
  }

  // VERY_LOW
  return `Non abbiamo trovato una sostituzione ideale per ${original.name}.\n\n` +
         `La migliore alternativa è ${substitute.name}, ma potrebbe non essere equivalente.\n\n` +
         `Consigliamo di saltare questo esercizio oggi.`;
}

// ============================================================================
// RANKING SUBSTITUTES
// ============================================================================

/**
 * Rank multiple substitute candidates and return sorted by confidence
 */
export function rankSubstituteCandidates(
  originalExercise: Exercise,
  candidates: Exercise[],
  context: {
    availableEquipment: string[];
    userLevel: 'beginner' | 'intermediate' | 'advanced';
    painArea: string;
    painSeverity: 'mild' | 'moderate' | 'severe';
  }
): SubstitutionCandidate[] {
  const scored = candidates.map(candidate => ({
    exercise: candidate,
    score: calculateSubstitutionConfidence(originalExercise, candidate, context),
    reasonForSuggestion: `Alternative per ${originalExercise.name}`
  }));

  // Sort by score descending
  return scored.sort((a, b) => b.score.score - a.score.score);
}

/**
 * Get best substitute or null if none suitable
 */
export function getBestSubstitute(
  originalExercise: Exercise,
  candidates: Exercise[],
  context: {
    availableEquipment: string[];
    userLevel: 'beginner' | 'intermediate' | 'advanced';
    painArea: string;
    painSeverity: 'mild' | 'moderate' | 'severe';
  },
  minimumLevel: ConfidenceLevel = 'LOW'
): SubstitutionCandidate | null {
  const ranked = rankSubstituteCandidates(originalExercise, candidates, context);

  const levelHierarchy: ConfidenceLevel[] = ['HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'];
  const minimumIndex = levelHierarchy.indexOf(minimumLevel);

  // Find first candidate that meets minimum level
  const suitable = ranked.find(c => {
    const candidateIndex = levelHierarchy.indexOf(c.score.level);
    return candidateIndex <= minimumIndex;
  });

  return suitable || null;
}

/**
 * Get smart substitution with alternatives
 */
export function getSmartSubstitution(
  exercise: Exercise,
  painArea: string,
  painSeverity: 'mild' | 'moderate' | 'severe',
  availableCandidates: Exercise[],
  context: {
    availableEquipment: string[];
    userLevel: 'beginner' | 'intermediate' | 'advanced';
  }
): {
  bestSubstitute: SubstitutionCandidate | null;
  alternatives: SubstitutionCandidate[];
  shouldAskUser: boolean;
  shouldSkip: boolean;
} {
  const ranked = rankSubstituteCandidates(
    exercise,
    availableCandidates,
    {
      ...context,
      painArea,
      painSeverity
    }
  );

  if (ranked.length === 0) {
    return {
      bestSubstitute: null,
      alternatives: [],
      shouldAskUser: false,
      shouldSkip: true
    };
  }

  const bestSubstitute = ranked[0];
  const alternatives = ranked.slice(1, 4);

  const { recommendation } = bestSubstitute.score;

  return {
    bestSubstitute,
    alternatives,
    shouldAskUser: recommendation === 'ASK_USER' || recommendation === 'SUGGEST_SKIP',
    shouldSkip: recommendation === 'SUGGEST_SKIP' && ranked.every(
      r => r.score.recommendation === 'SUGGEST_SKIP'
    )
  };
}

/**
 * Get confidence level color for UI
 */
export function getConfidenceLevelColor(level: ConfidenceLevel): {
  text: string;
  bg: string;
  border: string;
} {
  switch (level) {
    case 'HIGH':
      return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500' };
    case 'MEDIUM':
      return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500' };
    case 'LOW':
      return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500' };
    case 'VERY_LOW':
      return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500' };
  }
}

/**
 * Get confidence level label in Italian
 */
export function getConfidenceLevelLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'HIGH':
      return 'Alta';
    case 'MEDIUM':
      return 'Media';
    case 'LOW':
      return 'Bassa';
    case 'VERY_LOW':
      return 'Molto Bassa';
  }
}
