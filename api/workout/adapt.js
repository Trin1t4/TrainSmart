// ===== API WORKOUT ADAPT =====
// Rigenera esercizio quando user cambia location mid-workout
// Mantiene GOAL e progressione

import { createClient } from '@supabase/supabase-js';
import { selectExerciseVariant } from '../../server/exerciseSubstitutions.js';

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
      programId, 
      dayName, 
      exerciseName,
      newLocation,      // 'gym' | 'home'
      equipment         // { barbell: true, dumbbellMaxKg: 20, ... }
    } = req.body;

    if (!userId || !programId || !dayName || !exerciseName || !newLocation) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'programId', 'dayName', 'exerciseName', 'newLocation']
      });
    }

    console.log('[ADAPT] 🔄 Request:', { userId, programId, dayName, exerciseName, newLocation });

    // 1. Fetch program
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('user_id', userId)
      .single();

    if (programError || !program) {
      console.error('[ADAPT] ❌ Program not found:', programError);
      return res.status(404).json({ error: 'Program not found' });
    }

    // 2. Fetch user data for goal
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[ADAPT] ❌ User not found:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const onboardingData = userData.onboarding_data || {};
    const goal = onboardingData.goal || 'muscle_gain';
    const level = onboardingData.level || 'intermediate';

    // 3. Find exercise in weekly_schedule
    const weeklySchedule = program.weekly_schedule || [];
    let targetDay = null;
    let targetExercise = null;

    for (const day of weeklySchedule) {
      if (day.name === dayName) {
        targetDay = day;
        for (const exercise of day.exercises) {
          if (exercise.name === exerciseName) {
            targetExercise = exercise;
            break;
          }
        }
        break;
      }
    }

    if (!targetDay || !targetExercise) {
      return res.status(404).json({ 
        error: 'Exercise not found',
        dayName,
        exerciseName
      });
    }

    console.log('[ADAPT] 🎯 Found exercise:', {
      current: targetExercise.name,
      currentLocation: program.location,
      newLocation,
      goal,
      baseWeight: targetExercise.weight
    });

    // 4. Determine base exercise name (remove location-specific suffix)
    const baseExerciseName = extractBaseExerciseName(targetExercise.name);

    // 5. Generate new variant using selectExerciseVariant
    const newVariant = selectExerciseVariant(
      baseExerciseName,
      newLocation,
      equipment || {},
      goal,
      targetExercise.weight || 0
    );

    console.log('[ADAPT] ✅ New variant:', newVariant);

    // 6. Check if it's a GiantSet
    if (newVariant.rounds) {
      // It's a giant set - return as is
      return res.status(200).json({
        success: true,
        adapted: true,
        exercise: {
          ...newVariant,
          originalName: targetExercise.name,
          location: newLocation,
          goal: goal
        }
      });
    }

    // 7. Standard exercise - format response
    const adaptedExercise = {
      name: newVariant.name || newVariant,
      sets: newVariant.sets || targetExercise.sets,
      reps: newVariant.reps || targetExercise.reps,
      rest: newVariant.rest || targetExercise.rest,
      weight: newVariant.weight || null,
      notes: newVariant.notes || `Adattato per ${newLocation}`,
      category: targetExercise.category || 'compound',
      tempo: newVariant.tempo || null,
      originalName: targetExercise.name,
      originalWeight: targetExercise.weight,
      location: newLocation,
      goal: goal,
      equipment: equipment
    };

    console.log('[ADAPT] 📤 Returning adapted exercise:', adaptedExercise.name);

    return res.status(200).json({
      success: true,
      adapted: true,
      exercise: adaptedExercise
    });

  } catch (error) {
    console.error('[ADAPT] ❌ Error:', error);
    return res.status(500).json({ 
      error: 'Failed to adapt exercise',
      details: error.message 
    });
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Estrae nome base esercizio rimuovendo suffissi location-specific
 */
function extractBaseExerciseName(fullName) {
  // Remove common suffixes
  const suffixes = [
    ' Bilanciere',
    ' Manubri',
    ' Manubrio',
    ' a Corpo Libero',
    ' Tempo 3-1-3',
    ' Tempo 4-2-1',
    ' Progression',
    ' Jump',
    ' Assistito',
    ' Completo',
    ' Isometrico'
  ];

  let baseName = fullName;
  for (const suffix of suffixes) {
    if (baseName.endsWith(suffix)) {
      baseName = baseName.slice(0, -suffix.length);
    }
  }

  // Mapping to standard names
  const mapping = {
    'Squat': 'Squat',
    'Pistol': 'Squat',
    'Goblet': 'Squat',
    'Front': 'Front Squat',
    'Panca Piana': 'Panca Piana',
    'Panca Inclinata': 'Panca Inclinata',
    'Push-up': 'Panca Piana',
    'Pike Push-up': 'Panca Inclinata',
    'Archer Push-up': 'Panca Piana',
    'Stacco': 'Stacco',
    'Single Leg RDL': 'Stacco Rumeno',
    'Stacco Rumeno': 'Stacco Rumeno',
    'Trazioni': 'Trazioni',
    'Pull-up': 'Trazioni',
    'Lat Machine': 'Pulley',
    'Rematore': 'Rematore Bilanciere',
    'Inverted Row': 'Rematore Bilanciere',
    'Military Press': 'Military Press',
    'Handstand': 'Military Press',
    'Alzate Laterali': 'Alzate Laterali',
    'Dips': 'Dips',
    'Diamond Push-up': 'Dips',
    'Croci': 'Croci Cavi',
    'Wide Push-up': 'Croci Cavi'
  };

  for (const [pattern, standard] of Object.entries(mapping)) {
    if (baseName.includes(pattern)) {
      return standard;
    }
  }

  return baseName;
}
