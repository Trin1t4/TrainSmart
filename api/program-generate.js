import { createClient } from '@supabase/supabase-js';
import { rateLimitMiddleware } from './lib/rateLimit.js';
import { generateProgramWithSplit } from '../packages/shared/src/utils/programGenerator.js';
import { validateAndNormalizePainAreas } from '../packages/shared/src/utils/validators.js';
import { generateDefaultBaselines } from '../packages/shared/src/utils/programValidation.js';
import { inferMissingBaselines } from '../packages/shared/src/lib/baselineInferenceService.js';

// Mappa esercizi assessment → pattern per baselines
const EXERCISE_TO_PATTERN = {
  'squat': 'lower_push',
  'panca': 'horizontal_push',
  'bench': 'horizontal_push',
  'bench press': 'horizontal_push',
  'stacco': 'lower_pull',
  'deadlift': 'lower_pull',
  'trazioni': 'vertical_pull',
  'pull up': 'vertical_pull',
  'pull-up': 'vertical_pull',
  'pullup': 'vertical_pull',
  'press': 'vertical_push',
  'overhead press': 'vertical_push',
  'ohp': 'vertical_push',
  'military press': 'vertical_push',
  'rematore': 'horizontal_pull',
  'row': 'horizontal_pull',
  'barbell row': 'horizontal_pull',
};

/**
 * Converte assessmentData dal client in PatternBaselines per il shared generator.
 * assessmentData = { 'Squat': { oneRepMax: 100, reps: 5, weight: 85 }, ... }
 * → PatternBaselines = { lower_push: { weight10RM, reps, ... }, ... }
 */
function convertAssessmentToBaselines(assessmentData, bodyweight) {
  if (!assessmentData || typeof assessmentData !== 'object') return {};

  const baselines = {};

  for (const [exerciseName, test] of Object.entries(assessmentData)) {
    const key = exerciseName.toLowerCase().trim();
    const pattern = EXERCISE_TO_PATTERN[key];

    if (!pattern) {
      console.log(`[API] Assessment exercise "${exerciseName}" non mappato a pattern, skip`);
      continue;
    }

    // Stima 10RM da 1RM: ~75% del 1RM
    const oneRM = test.oneRepMax || 0;
    const weight10RM = oneRM > 0 ? Math.round(oneRM * 0.75) : (test.weight || 0);

    baselines[pattern] = {
      variantId: pattern,
      variantName: exerciseName,
      reps: test.reps || 10,
      weight10RM,
      difficulty: 5,
    };

    console.log(`[API] Baseline: ${exerciseName} → ${pattern}: ${weight10RM}kg (10RM)`);
  }

  return baselines;
}

/**
 * Inferisce trainingType da location + equipment
 */
function inferTrainingType(location, equipment) {
  if (location === 'gym') return 'equipment';
  // Home con attrezzi significativi → equipment
  if (equipment && typeof equipment === 'object') {
    const hasSignificantEquipment = equipment.barbell || equipment.dumbbells ||
      equipment.rack || equipment.bench || equipment.cables;
    if (hasSignificantEquipment) return 'equipment';
  }
  return 'bodyweight';
}

/**
 * Deriva la stringa progression dal livello
 */
function getProgression(level) {
  if (level === 'beginner') return 'linear';
  if (level === 'advanced') return 'ondulata_avanzata';
  return 'ondulata_intermedia';
}

/**
 * Calcola total_weeks in base al goal
 */
function getTotalWeeks(goal) {
  const g = (goal || '').toLowerCase();
  if (g === 'strength' || g === 'forza') return 6;
  if (g === 'fat_loss' || g === 'dimagrimento') return 8;
  return 4; // muscle_gain, general_fitness, etc.
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting: max 5 requests per minute per user/IP
  if (rateLimitMiddleware(req, res, 'programGenerate')) {
    return; // Response already sent by middleware
  }

  try {
    console.log('[API] Received:', req.body);

    const {
      level, goal, location, frequency, assessmentData,
      userId, assessmentId, bodyweight, painAreas,
      equipment, disabilityType, sportRole, medicalRestrictions
    } = req.body;

    console.log('[API] Data received:', {
      level,
      goal,
      location,
      frequency,
      hasAssessmentData: !!assessmentData,
      userId: userId ? 'present' : 'missing',
    });

    // ========================================
    // 1. CALCOLO LIVELLO (bodyweight ratio)
    // ========================================
    let calculatedLevel = level || 'intermediate';

    if (assessmentData && typeof assessmentData === 'object' && Object.keys(assessmentData).length > 0) {
      const bw = bodyweight || 70;
      const levels = Object.values(assessmentData).map((test) => {
        const ratio = test.oneRepMax / bw;
        if (ratio >= 1.5) return 'advanced';
        if (ratio >= 1.0) return 'intermediate';
        return 'beginner';
      });
      const advancedCount = levels.filter(l => l === 'advanced').length;
      const intermediateCount = levels.filter(l => l === 'intermediate').length;
      if (advancedCount >= 2) calculatedLevel = 'advanced';
      else if (intermediateCount >= 2 || advancedCount >= 1) calculatedLevel = 'intermediate';
      else calculatedLevel = 'beginner';
    }

    console.log('[API] Level calculated:', calculatedLevel);

    // ========================================
    // 2. MAPPATURA INPUT → ProgramGeneratorOptions
    // ========================================

    // 2a. Pain areas → normalizzate
    const normalizedPainAreas = validateAndNormalizePainAreas(painAreas || []);

    // 2b. Assessment → PatternBaselines + inferenza pattern mancanti
    const bw = bodyweight || 70;
    let baselines = convertAssessmentToBaselines(assessmentData, bw);

    if (Object.keys(baselines).length > 0) {
      // Inferisci pattern mancanti dai dati esistenti
      baselines = inferMissingBaselines(baselines, bw, calculatedLevel);
    } else {
      // Nessun assessment: genera default (il generator gestisce anche questo internamente)
      baselines = generateDefaultBaselines();
    }

    // 2c. Training type inferito
    const loc = location || 'gym';
    const trainingType = inferTrainingType(loc, equipment);

    // 2d. Session duration default basato su frequency
    const freq = frequency || 3;
    const sessionDuration = freq <= 3 ? 60 : freq <= 4 ? 50 : 45;

    const options = {
      level: calculatedLevel,
      goal: goal || 'muscle_gain',
      location: loc,
      trainingType,
      frequency: freq,
      baselines,
      painAreas: normalizedPainAreas,
      equipment: equipment || {},
      userBodyweight: bw,
      sessionDuration,
      disabilityType: disabilityType || undefined,
      sportRole: sportRole || undefined,
      medicalRestrictions: medicalRestrictions || undefined,
    };

    console.log('[API] Calling shared generateProgramWithSplit:', {
      level: options.level,
      goal: options.goal,
      location: options.location,
      trainingType: options.trainingType,
      frequency: options.frequency,
      baselinesCount: Object.keys(options.baselines).length,
      painAreasCount: options.painAreas.length,
      sessionDuration: options.sessionDuration,
    });

    // ========================================
    // 3. GENERA PROGRAMMA (shared package)
    // ========================================
    const result = generateProgramWithSplit(options);

    // Controlla se la generazione è stata bloccata dalla validazione
    if (result?.error || result?.blocked) {
      console.error('[API] Program generation blocked:', result.errors || result.message);
      return res.status(400).json({
        error: 'Program generation blocked by validation',
        details: result.errors || result.message,
      });
    }

    // Controlla che ci siano giorni generati
    const weeklyScheduleDays = result?.weeklySplit?.days;
    if (!result || !weeklyScheduleDays || weeklyScheduleDays.length === 0) {
      console.error('[API] Program generation failed - no days generated');
      return res.status(500).json({ error: 'Failed to generate program' });
    }

    console.log('[API] Program generated:', result.name, `(${weeklyScheduleDays.length} days)`);

    // ========================================
    // 4. MAPPATURA OUTPUT → formato Supabase
    // ========================================
    const goalLower = (goal || 'muscle_gain').toLowerCase();
    const progression = getProgression(calculatedLevel);
    const totalWeeks = getTotalWeeks(goalLower);
    const requiresEndCycleTest = ['strength', 'forza', 'muscle_gain', 'massa', 'ipertrofia'].includes(goalLower);

    const dbRecord = {
      user_id: userId,
      assessment_id: assessmentId,
      name: result.name,
      description: result.notes || `Programma ${calculatedLevel} - ${goal}`,
      level: calculatedLevel,
      goal: goal,
      location: loc,
      frequency: freq,
      split: result.split,
      days_per_week: weeklyScheduleDays.length,
      total_weeks: totalWeeks,
      weekly_schedule: weeklyScheduleDays,
      progression,
      includes_deload: calculatedLevel !== 'beginner',
      deload_frequency: 4,
      requires_end_cycle_test: requiresEndCycleTest,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // ========================================
    // 5. SAVE TO SUPABASE
    // ========================================
    const adminSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: dbData, error: dbError } = await adminSupabase
      .from('training_programs')
      .insert(dbRecord)
      .select()
      .single();

    if (dbError) {
      console.error('[API] Supabase INSERT Error:', dbError);
    } else {
      console.log('[API] Program saved to Supabase:', dbData?.id);
    }

    return res.status(200).json({
      success: true,
      program: dbData || { ...dbRecord, weeklySchedule: weeklyScheduleDays },
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
