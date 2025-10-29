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

    const { userId, assessmentId } = req.body;

    if (!userId || !assessmentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[API] User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[API] 🔍 USER DATA:', {
      location: userData.onboarding_data?.trainingLocation,
      equipment: userData.onboarding_data?.equipment,
      goal: userData.onboarding_data?.goal
    });

    // Fetch assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessmentData) {
      console.error('[API] Assessment fetch error:', assessmentError);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    console.log('[API] 📊 RAW ASSESSMENT:', {
      assessment_type: assessmentData.assessment_type,
      has_exercises: !!assessmentData.exercises,
      exercises_length: assessmentData.exercises?.length
    });

    // ✅ FIX: Converti exercises JSON in formato assessments
    let assessments = [];
    
    if (assessmentData.assessment_type === 'home' && assessmentData.exercises) {
      // CASA: converti da exercises JSON a formato standard
      assessments = convertHomeAssessmentToStandard(assessmentData.exercises);
      console.log('[API] 🏠 Converted HOME assessment:', assessments);
      
    } else if (assessmentData.assessment_type === 'gym') {
      // PALESTRA: usa 1RM dalle colonne
      assessments = [
        { exerciseName: 'Squat', oneRepMax: assessmentData.squat_1rm || 50 },
        { exerciseName: 'Panca', oneRepMax: assessmentData.bench_1rm || 40 },
        { exerciseName: 'Stacco', oneRepMax: assessmentData.deadlift_1rm || 60 },
        { exerciseName: 'Trazioni', oneRepMax: assessmentData.pullup_1rm || 30 },
        { exerciseName: 'Press', oneRepMax: assessmentData.press_1rm || 30 }
      ];
      console.log('[API] 🏋️ GYM assessment:', assessments);
      
    } else {
      // FALLBACK: valori di default
      assessments = [
        { exerciseName: 'Squat', oneRepMax: 50 },
        { exerciseName: 'Panca', oneRepMax: 40 },
        { exerciseName: 'Stacco', oneRepMax: 60 },
        { exerciseName: 'Trazioni', oneRepMax: 30 },
        { exerciseName: 'Press', oneRepMax: 30 }
      ];
      console.warn('[API] ⚠️ Using default assessments');
    }

    const onboardingData = userData.onboarding_data || {};
    
    const programInput = {
      userId,
      assessmentId,
      location: onboardingData.trainingLocation || 'gym',
      equipment: onboardingData.equipment || {},
      goal: onboardingData.goal || 'muscle_gain',
      level: assessmentData.level || 'beginner',
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments: assessments // ✅ FIX: usa assessments convertiti
    };

    console.log('[API] 📤 FINAL INPUT:', {
      location: programInput.location,
      equipment: programInput.equipment,
      goal: programInput.goal,
      level: programInput.level,
      assessments: programInput.assessments
    });

    // Generate program
    const program = await generateProgram(programInput);

    // Save program
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        name: program.name,
        description: program.description,
        split: program.split,
        days_per_week: program.daysPerWeek,
        weekly_schedule: program.weeklySchedule,
        progression: program.progression,
        includes_deload: program.includesDeload,
        deload_frequency: program.deloadFrequency,
        total_weeks: program.totalWeeks,
        requires_end_cycle_test: program.requiresEndCycleTest,
        frequency: programInput.frequency,
        status: 'active',
        current_week: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] Error saving program:', saveError);
      return res.status(500).json({ error: 'Failed to save program' });
    }

    console.log('[API] ✅ Program saved with ID:', savedProgram.id);

    return res.status(200).json({ 
      success: true, 
      programId: savedProgram.id,
      program: savedProgram
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ✅ FIX: Funzione per convertire assessment HOME in formato standard
function convertHomeAssessmentToStandard(exercises) {
  if (!exercises || !Array.isArray(exercises)) {
    return [];
  }

  const assessments = [];

  exercises.forEach(ex => {
    const maxReps = ex.variant?.maxReps || 8;
    const level = ex.variant?.level || 1;
    
    // Calcola un "peso virtuale" basato su maxReps e level
    // Più reps e livello alto = "peso" più alto (rappresenta forza relativa)
    const virtualWeight = maxReps * level * 5; // Es: 8 reps * level 4 * 5 = 160
    
    // Mappa nomi esercizi
    let mappedName = ex.name;
    if (ex.name === 'Squat') mappedName = 'Squat';
    else if (ex.name === 'Push-up') mappedName = 'Panca'; // Push-up ~ Panca
    else if (ex.name === 'Trazioni') mappedName = 'Trazioni';
    else if (ex.name.includes('Spalle')) mappedName = 'Press';
    else if (ex.name.includes('Gambe')) mappedName = 'Stacco'; // Gambe unilaterali ~ Stacco
    
    assessments.push({
      exerciseName: mappedName,
      oneRepMax: virtualWeight,
      maxReps: maxReps, // ✅ IMPORTANTE: mantieni maxReps per progressioni bodyweight
      level: level,
      variant: ex.variant?.name
    });
  });

  // Aggiungi esercizi mancanti con valori di default
  const requiredExercises = ['Squat', 'Panca', 'Stacco', 'Trazioni', 'Press'];
  requiredExercises.forEach(required => {
    if (!assessments.find(a => a.exerciseName === required)) {
      assessments.push({
        exerciseName: required,
        oneRepMax: 50,
        maxReps: 8,
        level: 1
      });
    }
  });

  return assessments;
}
