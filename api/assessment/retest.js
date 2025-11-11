// ===== API MONTHLY RETEST =====
// Test mensile INTELLIGENTE: 10RM vs 1RM basato su level+goal

import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      userId, 
      currentProgramId,
      assessmentData  // Nuovi dati test
    } = req.body;

    if (!userId || !assessmentData) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'assessmentData']
      });
    }

    console.log('[RETEST] 🔄 Monthly retest for user:', userId);

    // 1. Fetch user data per determinare test type
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data, training_level')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[RETEST] ❌ User not found:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const onboardingData = userData.onboarding_data || {};
    const currentLevel = userData.training_level || onboardingData.level || 'beginner';
    const goal = onboardingData.goal || 'muscle_gain';

    // ===== LOGICA TEST INTELLIGENTE =====
    const testType = determineTestType(currentLevel, goal);
    
    console.log('[RETEST] 🎯 Test type:', {
      level: currentLevel,
      goal: goal,
      testType: testType.type,
      reason: testType.reason
    });

    // 2. Fetch current program
    const { data: currentProgram, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', currentProgramId)
      .eq('user_id', userId)
      .single();

    if (programError) {
      console.error('[RETEST] ❌ Program not found:', programError);
      return res.status(404).json({ error: 'Current program not found' });
    }

    // 3. Fetch previous assessment for comparison
    const { data: previousAssessment, error: prevError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', currentProgram.assessment_id)
      .single();

    if (prevError) {
      console.warn('[RETEST] ⚠️ Previous assessment not found');
    }

    // 4. Create new assessment
    const { data: newAssessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        assessment_type: assessmentData.assessment_type || 'gym',
        exercises: assessmentData.exercises,
        completed: true,
        completed_at: new Date().toISOString(),
        level: assessmentData.level || currentLevel,
        test_type: testType.type // ← NEW: Traccia tipo test (10RM / 1RM)
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('[RETEST] ❌ Failed to create assessment:', assessmentError);
      return res.status(500).json({ error: 'Failed to create assessment' });
    }

    console.log('[RETEST] ✅ New assessment created:', newAssessment.id);

    // 5. Calculate progression
    const progression = calculateProgression(previousAssessment, newAssessment);

    console.log('[RETEST] 📊 Progression:', progression);

    // 6. ✅ CHECK LEVEL UPGRADE: Se beginner raggiunge carichi intermediate → Proponi upgrade
    const levelUpgrade = checkLevelUpgrade(newAssessment, currentLevel, progression);
    
    if (levelUpgrade.shouldUpgrade) {
      console.log('[RETEST] 🚀 Level upgrade available!', levelUpgrade);
    }

    // 7. Convert assessment to standard format
    const assessments = convertAssessmentToStandard(
      newAssessment,
      onboardingData.bodyweight || 80,
      testType.type
    );

    // 8. Prepare program input
    const programInput = {
      userId,
      assessmentId: newAssessment.id,
      location: onboardingData.trainingLocation || 'gym',
      equipment: onboardingData.equipment || {},
      goal: goal,
      level: levelUpgrade.shouldUpgrade ? levelUpgrade.newLevel : currentLevel,
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments: assessments,
      exerciseVariants: newAssessment.exercises || []
    };

    console.log('[RETEST] 🎯 Generating new program with level:', programInput.level);

    // 9. Generate new program
    const newProgram = await generateProgram(programInput);

    if (!newProgram || !newProgram.weeklySchedule) {
      console.error('[RETEST] ❌ Program generation failed');
      return res.status(500).json({ error: 'Failed to generate program' });
    }

    // 10. Save new program
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: newAssessment.id,
        name: levelUpgrade.shouldUpgrade 
          ? `Programma ${levelUpgrade.newLevel.toUpperCase()} - ${new Date().toLocaleDateString('it-IT')}`
          : `Programma ${new Date().toLocaleDateString('it-IT')}`,
        description: levelUpgrade.shouldUpgrade
          ? `🎉 Congratulazioni! Sei passato a livello ${levelUpgrade.newLevel}!`
          : newProgram.description || 'Programma aggiornato dopo test mensile',
        split: newProgram.split,
        days_per_week: newProgram.frequency || programInput.frequency,
        weekly_schedule: newProgram.weeklySchedule,
        progression: newProgram.progression || 'linear',
        includes_deload: newProgram.includesDeload || true,
        deload_frequency: newProgram.deloadFrequency || 4,
        total_weeks: newProgram.totalWeeks || 4,
        requires_end_cycle_test: true,
        status: 'active',
        current_week: 1,
        frequency: programInput.frequency,
        location: programInput.location
      })
      .select()
      .single();

    if (saveError) {
      console.error('[RETEST] ❌ Failed to save program:', saveError);
      return res.status(500).json({ error: 'Failed to save program' });
    }

    // 11. Update user level if upgraded
    if (levelUpgrade.shouldUpgrade) {
      await supabase
        .from('user_profiles')
        .update({ training_level: levelUpgrade.newLevel })
        .eq('user_id', userId);
    }

    // 12. Mark old program as completed
    await supabase
      .from('training_programs')
      .update({ status: 'completed' })
      .eq('id', currentProgramId);

    console.log('[RETEST] ✅ Program regenerated:', savedProgram.id);

    return res.status(200).json({
      success: true,
      newProgram: savedProgram,
      newAssessment: newAssessment,
      progression: progression,
      levelUpgrade: levelUpgrade,
      testType: testType,
      message: levelUpgrade.shouldUpgrade 
        ? `🎉 Congratulazioni! Sei passato a livello ${levelUpgrade.newLevel.toUpperCase()}!`
        : 'Programma aggiornato con successo!'
    });

  } catch (error) {
    console.error('[RETEST] ❌ Error:', error);
    return res.status(500).json({ 
      error: 'Failed to retest and regenerate program',
      details: error.message 
    });
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * ✅ NEW: Determina tipo test basato su level + goal
 * REGOLA:
 * - Beginner: SEMPRE 10RM (sicurezza)
 * - Intermediate: 1RM solo se goal=strength, altrimenti 10RM
 * - Advanced: 1RM se goal=strength, altrimenti 10RM
 */
function determineTestType(level, goal) {
  if (level === 'beginner') {
    return {
      type: '10RM',
      reason: 'Beginner usa sempre 10RM per sicurezza',
      repsTarget: 10
    };
  }

  if (level === 'intermediate' || level === 'advanced') {
    if (goal === 'strength') {
      return {
        type: '1RM',
        reason: `${level} con goal FORZA può testare 1RM`,
        repsTarget: 1
      };
    } else {
      return {
        type: '10RM',
        reason: `${level} senza goal forza usa 10RM`,
        repsTarget: 10
      };
    }
  }

  // Fallback
  return {
    type: '10RM',
    reason: 'Default sicuro',
    repsTarget: 10
  };
}

/**
 * ✅ NEW: Controlla se beginner ha raggiunto carichi intermediate
 * CRITERI:
 * - Squat 1RM >= 1.5x bodyweight
 * - Bench 1RM >= 1x bodyweight
 * - Deadlift 1RM >= 1.75x bodyweight
 */
function checkLevelUpgrade(assessment, currentLevel, progression) {
  if (currentLevel !== 'beginner') {
    return { shouldUpgrade: false };
  }

  const exercises = assessment.exercises || [];
  const bodyweight = 80; // Default, idealmente passato

  // Calcola 1RM per ogni esercizio
  const squat1RM = exercises.find(e => e.name?.toLowerCase().includes('squat'))?.oneRepMax || 0;
  const bench1RM = exercises.find(e => e.name?.toLowerCase().includes('panca') || e.name?.toLowerCase().includes('bench'))?.oneRepMax || 0;
  const deadlift1RM = exercises.find(e => e.name?.toLowerCase().includes('stacco') || e.name?.toLowerCase().includes('deadlift'))?.oneRepMax || 0;

  // Ratios vs bodyweight
  const squatRatio = squat1RM / bodyweight;
  const benchRatio = bench1RM / bodyweight;
  const deadliftRatio = deadlift1RM / bodyweight;

  // Criteri intermediate
  const meetsSquatCriteria = squatRatio >= 1.5;
  const meetsBenchCriteria = benchRatio >= 1.0;
  const meetsDeadliftCriteria = deadliftRatio >= 1.75;

  // Serve almeno 2/3 criteri
  const criteriasMet = [meetsSquatCriteria, meetsBenchCriteria, meetsDeadliftCriteria].filter(Boolean).length;

  if (criteriasMet >= 2) {
    return {
      shouldUpgrade: true,
      newLevel: 'intermediate',
      reason: `Carichi raggiunti: Squat ${squatRatio.toFixed(1)}x BW, Bench ${benchRatio.toFixed(1)}x BW, Deadlift ${deadliftRatio.toFixed(1)}x BW`,
      criteriasMet: {
        squat: { ratio: squatRatio, meets: meetsSquatCriteria },
        bench: { ratio: benchRatio, meets: meetsBenchCriteria },
        deadlift: { ratio: deadliftRatio, meets: meetsDeadliftCriteria }
      }
    };
  }

  return { 
    shouldUpgrade: false,
    reason: `Ancora ${3 - criteriasMet} criteri da raggiungere per intermediate`
  };
}

/**
 * Calcola progressione tra due assessment
 */
function calculateProgression(previous, current) {
  if (!previous || !current) {
    return { message: 'Primo assessment, nessun confronto disponibile' };
  }

  const exercises = ['squat', 'bench', 'pullup', 'press', 'deadlift'];
  const improvements = {};

  for (const ex of exercises) {
    const prev1RM = previous[`${ex}_1rm`];
    const curr1RM = current[`${ex}_1rm`];

    if (prev1RM && curr1RM) {
      const diff = curr1RM - prev1RM;
      const percentChange = ((diff / prev1RM) * 100).toFixed(1);

      improvements[ex] = {
        previous: prev1RM,
        current: curr1RM,
        difference: diff.toFixed(1),
        percentChange: percentChange,
        improved: diff > 0
      };
    }
  }

  // Calculate total improvement
  const totalPrevious = Object.values(improvements).reduce((sum, i) => sum + i.previous, 0);
  const totalCurrent = Object.values(improvements).reduce((sum, i) => sum + i.current, 0);
  const totalImprovement = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);

  return {
    exercises: improvements,
    totalImprovement: totalImprovement,
    message: `Miglioramento totale: ${totalImprovement}%`
  };
}

/**
 * Converte assessment in formato standard per programGenerator
 */
function convertAssessmentToStandard(assessment, bodyweight, testType) {
  const exercises = assessment.exercises || [];
  
  return exercises.map((ex, index) => ({
    id: `retest-${index}`,
    exerciseName: ex.name || ex.exercise || 'Unknown',
    variant: ex.variant || (assessment.assessment_type === 'gym' ? 'gym' : 'bodyweight'),
    level: ex.level || assessment.level || 'intermediate',
    maxReps: ex.reps || (testType === '1RM' ? 1 : 10),
    oneRepMax: testType === '1RM' ? ex.weight : calculateOneRepMax(ex.weight || 0, ex.reps || 10),
    weight: ex.weight || 0,
    bodyweight: bodyweight,
    testType: testType,
    notes: ex.notes || ''
  }));
}

/**
 * Formula Brzycki per calcolo 1RM
 */
function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  if (weight === 0 || reps === 0) return 0;
  return weight * (36 / (37 - reps));
}

import { generateProgram } from '../../server/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      userId, 
      currentProgramId,
      assessmentData  // Nuovi dati 1RM
    } = req.body;

    if (!userId || !assessmentData) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'assessmentData']
      });
    }

    console.log('[RETEST] 🔄 Monthly retest for user:', userId);

    // 1. Fetch current program
    const { data: currentProgram, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', currentProgramId)
      .eq('user_id', userId)
      .single();

    if (programError) {
      console.error('[RETEST] ❌ Program not found:', programError);
      return res.status(404).json({ error: 'Current program not found' });
    }

    // 2. Fetch previous assessment for comparison
    const { data: previousAssessment, error: prevError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', currentProgram.assessment_id)
      .single();

    if (prevError) {
      console.warn('[RETEST] ⚠️ Previous assessment not found');
    }

    // 3. Create new assessment
    const { data: newAssessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        assessment_type: assessmentData.assessment_type || 'gym',
        exercises: assessmentData.exercises,
        completed: true,
        completed_at: new Date().toISOString(),
        level: assessmentData.level || 'intermediate'
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('[RETEST] ❌ Failed to create assessment:', assessmentError);
      return res.status(500).json({ error: 'Failed to create assessment' });
    }

    console.log('[RETEST] ✅ New assessment created:', newAssessment.id);

    // 4. Calculate progression
    const progression = calculateProgression(previousAssessment, newAssessment);

    console.log('[RETEST] 📊 Progression:', progression);

    // 5. Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[RETEST] ❌ User not found:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const onboardingData = userData.onboarding_data || {};

    // 6. Convert assessment to standard format
    const assessments = convertAssessmentToStandard(
      newAssessment,
      onboardingData.bodyweight || 80
    );

    // 7. Prepare program input
    const programInput = {
      userId,
      assessmentId: newAssessment.id,
      location: onboardingData.trainingLocation || 'gym',
      equipment: onboardingData.equipment || {},
      goal: onboardingData.goal || 'muscle_gain',
      level: newAssessment.level || 'intermediate',
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments: assessments,
      exerciseVariants: newAssessment.exercises || []
    };

    console.log('[RETEST] 🎯 Generating new program...');

    // 8. Generate new program
    const newProgram = await generateProgram(programInput);

    if (!newProgram || !newProgram.weeklySchedule) {
      console.error('[RETEST] ❌ Program generation failed');
      return res.status(500).json({ error: 'Failed to generate program' });
    }

    // 9. Save new program
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: newAssessment.id,
        name: newProgram.name || `Programma ${new Date().toLocaleDateString('it-IT')}`,
        description: newProgram.description || 'Programma aggiornato dopo test mensile',
        split: newProgram.split,
        days_per_week: newProgram.frequency || programInput.frequency,
        weekly_schedule: newProgram.weeklySchedule,
        progression: newProgram.progression || 'linear',
        includes_deload: newProgram.includesDeload || true,
        deload_frequency: newProgram.deloadFrequency || 4,
        total_weeks: newProgram.totalWeeks || 4,
        requires_end_cycle_test: true,
        status: 'active',
        current_week: 1,
        frequency: programInput.frequency,
        location: programInput.location
      })
      .select()
      .single();

    if (saveError) {
      console.error('[RETEST] ❌ Failed to save program:', saveError);
      return res.status(500).json({ error: 'Failed to save program' });
    }

    // 10. Mark old program as completed
    await supabase
      .from('training_programs')
      .update({ status: 'completed' })
      .eq('id', currentProgramId);

    console.log('[RETEST] ✅ Program regenerated:', savedProgram.id);

    return res.status(200).json({
      success: true,
      newProgram: savedProgram,
      newAssessment: newAssessment,
      progression: progression,
      message: 'Programma aggiornato con successo!'
    });

  } catch (error) {
    console.error('[RETEST] ❌ Error:', error);
    return res.status(500).json({ 
      error: 'Failed to retest and regenerate program',
      details: error.message 
    });
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Calcola progressione tra due assessment
 */
function calculateProgression(previous, current) {
  if (!previous || !current) {
    return { message: 'Primo assessment, nessun confronto disponibile' };
  }

  const exercises = ['squat', 'bench', 'pullup', 'press', 'deadlift'];
  const improvements = {};

  for (const ex of exercises) {
    const prev1RM = previous[`${ex}_1rm`];
    const curr1RM = current[`${ex}_1rm`];

    if (prev1RM && curr1RM) {
      const diff = curr1RM - prev1RM;
      const percentChange = ((diff / prev1RM) * 100).toFixed(1);

      improvements[ex] = {
        previous: prev1RM,
        current: curr1RM,
        difference: diff.toFixed(1),
        percentChange: percentChange,
        improved: diff > 0
      };
    }
  }

  // Calculate total improvement
  const totalPrevious = Object.values(improvements).reduce((sum, i) => sum + i.previous, 0);
  const totalCurrent = Object.values(improvements).reduce((sum, i) => sum + i.current, 0);
  const totalImprovement = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);

  return {
    exercises: improvements,
    totalImprovement: totalImprovement,
    message: `Miglioramento totale: ${totalImprovement}%`
  };
}

/**
 * Converte assessment in formato standard per programGenerator
 */
function convertAssessmentToStandard(assessment, bodyweight) {
  const exercises = assessment.exercises || [];
  
  return exercises.map((ex, index) => ({
    id: `retest-${index}`,
    exerciseName: ex.name || ex.exercise || 'Unknown',
    variant: ex.variant || (assessment.assessment_type === 'gym' ? 'gym' : 'bodyweight'),
    level: ex.level || assessment.level || 'intermediate',
    maxReps: ex.reps || 10,
    oneRepMax: calculateOneRepMax(ex.weight || 0, ex.reps || 10),
    weight: ex.weight || 0,
    bodyweight: bodyweight,
    notes: ex.notes || ''
  }));
}

/**
 * Formula Brzycki per calcolo 1RM
 */
function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  if (weight === 0 || reps === 0) return 0;
  return weight * (36 / (37 - reps));
}
