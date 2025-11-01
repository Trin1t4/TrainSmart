import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';
import { HOMEALTERNATIVES } from '../../server/exerciseSubstitutions.js';

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
      console.error('[API] ❌ User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessmentData) {
      console.error('[API] ❌ Assessment fetch error:', assessmentError);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const onboardingData = userData.onboarding_data || {};

    console.log('[API] 🎯 Starting intelligent level calculation...');
    console.log('[API] 📍 Location from onboarding:', onboardingData.trainingLocation);

    // ✅ CALCOLO LIVELLO INTELLIGENTE
    const intelligentLevel = calculateIntelligentLevel(
      assessmentData, 
      onboardingData
    );

    console.log('[API] 📊 Intelligent Level Result:', intelligentLevel);

    // ✅ CONVERTI ASSESSMENT IN FORMATO STANDARD CON VARIANTI
    let assessments = [];
    
    if (assessmentData.assessment_type === 'home' && assessmentData.exercises) {
      assessments = convertHomeAssessmentToStandard(
        assessmentData.exercises,
        intelligentLevel.bodyweight
      );
      console.log('[API] 🏠 Home assessment converted:', assessments);
      
    } else if (assessmentData.assessment_type === 'gym') {
      assessments = convertGymAssessmentToStandard(
        assessmentData,
        intelligentLevel.bodyweight
      );
      console.log('[API] 🏋️ Gym assessment converted:', assessments);
    }

    // ✅ PREPARA INPUT PROGRAMMA
    const programInput = {
      userId,
      assessmentId,
      location: onboardingData.trainingLocation || 'gym',  // ← LOCATION QUI!
      equipment: onboardingData.equipment || {},
      goal: onboardingData.goal || 'muscle_gain',
      level: intelligentLevel.finalLevel,
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments: assessments,
      exerciseVariants: assessmentData.exercises || []
    };

    console.log('[API] 📤 Final Program Input:', {
      level: programInput.level,
      location: programInput.location,
      assessments: programInput.assessments.map(a => ({
        name: a.exerciseName,
        variant: a.variant,
        level: a.level,
        maxReps: a.maxReps,
        oneRepMax: a.oneRepMax
      }))
    });

    // 🔥 DEBUG CRITICO - Controlla cosa arriva a generateProgram
    console.log('[API] 🔥 ========== BEFORE GENERATE PROGRAM ==========');
    console.log('[API] 🔥 programInput.location:', programInput.location);
    console.log('[API] 🔥 (This should be "gym" if user selected palestra)');
    console.log('[API] 🔥 ========== END DEBUG ==========');

    // ✅ GENERA PROGRAMMA
    let program = await generateProgram(programInput);

    console.log('[API] ✅ Program generated');
    console.log('[API] 🔥 First day name:', program.weeklySchedule?.[0]?.dayName);
    console.log('[API] 🔥 First day location:', program.weeklySchedule?.[0]?.location);
    console.log('[API] 🔥 First 3 exercises from generated program:');
    program.weeklySchedule?.[0]?.exercises?.slice(0, 3).forEach(ex => {
      console.log('[API] 🔥  - Exercise:', ex.name);
    });

    // ✅ CONTROLLA SE ESERCIZI SONO GIÀ "HOME" (BUG!)
    const firstExercise = program.weeklySchedule?.[0]?.exercises?.[0]?.name;
    const isAlreadyBodyweight = 
      firstExercise?.includes('Pistol') || 
      firstExercise?.includes('Archer') || 
      firstExercise?.includes('Australian') ||
      firstExercise?.includes('Handstand');

    if (isAlreadyBodyweight && programInput.location === 'gym') {
      console.error('[API] 🚨 BUG DETECTED! generateProgram generated HOME exercises even though location is GYM!');
      console.error('[API] 🚨 First exercise:', firstExercise);
      console.error('[API] 🚨 This means programGenerator.js is IGNORING the location parameter!');
    }

    // ✅ APPLICA LOCATION ALTERNATIVES - MA SOLO SE LOCATION === 'HOME'
    // Se location === 'gym' e ancora troviamo esercizi bodyweight, è un bug in generateProgram!
    if (programInput.location === 'home' || programInput.location === 'mixed') {
      console.log(`[API] 🏠 Location is HOME/MIXED - checking for gym exercises to convert...`);
      
      program.weeklySchedule = program.weeklySchedule.map(day => ({
        ...day,
        exercises: day.exercises.map(exercise => {
          // Cerca alternativa HOME
          const homeAlternative = HOMEALTERNATIVES[exercise.name];
          
          if (homeAlternative) {
            console.log(`[API] 🔄 Substituting: ${exercise.name} → ${homeAlternative}`);
            return { 
              ...exercise, 
              name: homeAlternative,
              location: 'home'
            };
          }
          
          if (programInput.location === 'home') {
            console.log(`[API] ⚠️ No alternative found for ${exercise.name}, keeping as is`);
          }
          
          return exercise;
        })
      }));

      console.log('[API] ✅ HOME alternatives applied successfully');
    } else if (programInput.location === 'gym') {
      console.log('[API] 🏋️ Location is GYM - keeping all standard exercises');
      
      // 🔥 Aggiungi ulteriore debug se ancora troviamo esercizi bodyweight
      const hasBodyweightExercises = program.weeklySchedule?.some(day => 
        day.exercises?.some(ex => 
          ex.name?.includes('Pistol') || ex.name?.includes('Archer')
        )
      );
      
      if (hasBodyweightExercises) {
        console.error('[API] 🚨 ERROR! Found bodyweight exercises but location is GYM!');
        console.error('[API] 🚨 This is a bug in generateProgram() - it ignores location!');
      }
    }

    // ✅ SALVA PROGRAMMA IN DB
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
        location: programInput.location,
        status: 'active',
        current_week: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] ❌ Error saving program:', saveError);
      return res.status(500).json({ error: 'Failed to save program' });
    }

    console.log('[API] ✅ Program saved with ID:', savedProgram.id);
    console.log('[API] ✅ Location saved:', programInput.location);
    console.log('[API] ✅ First exercise:', savedProgram.weekly_schedule?.[0]?.exercises?.[0]?.name);

    return res.status(200).json({ 
      success: true, 
      programId: savedProgram.id,
      program: savedProgram,
      levelAnalysis: intelligentLevel,
      appliedLocation: programInput.location
    });

  } catch (error) {
    console.error('[API] ❌ Unexpected error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ===== CALCOLO LIVELLO INTELLIGENTE =====
function calculateIntelligentLevel(assessmentData, onboardingData) {
  // [resto del codice rimane uguale - copy dal file originale]
}

// ===== CONVERSIONE HOME ASSESSMENT =====
function convertHomeAssessmentToStandard(exercises, bodyweight) {
  // [resto del codice rimane uguale - copy dal file originale]
}

// ===== CONVERSIONE GYM ASSESSMENT =====
function convertGymAssessmentToStandard(assessmentData, bodyweight) {
  // [resto del codice rimane uguale - copy dal file originale]
}

// ===== FORMULE E CALCOLI =====
export function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

export function calculateTargetWeight(oneRepMax, percentage) {
  return Math.round((oneRepMax * percentage) / 2.5) * 2.5;
}

export function calculateTrainingWeight(oneRM, targetReps, RIR = 2) {
  if (!oneRM || oneRM === 0) return null;
  
  const maxReps = targetReps + RIR;
  const weight = oneRM * (37 - maxReps) / 36;
  
  return Math.round(weight / 2.5) * 2.5;
}
