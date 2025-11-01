console.log('[API] 🔥 GENERATE.JS LOADED - Location:', programInput.location);
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
      location: onboardingData.trainingLocation || 'gym',
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

    // ✅ GENERA PROGRAMMA
    let program = await generateProgram(programInput);

    console.log('[API] ✅ Program generated');

    // ✅ MAPPING HOME → GYM EXERCISES
    const GYM_ALTERNATIVES = {
      'Pistol Assistito': 'Back Squat',
      'Pistol Completo': 'Back Squat',
      'Squat Assistito': 'Back Squat',
      'Squat Completo': 'Back Squat',
      'Jump Squat': 'Back Squat',
      'Archer Push-up': 'Bench Press',
      'One-Arm Push-up': 'Bench Press',
      'Push-up su Ginocchia': 'Incline Bench Press',
      'Push-up Standard': 'Bench Press',
      'Push-up Mani Strette': 'Close Grip Bench',
      'Dips Completi': 'Dips',
      'Australian Pull-up': 'Barbell Row',
      'Pull-up Completa': 'Lat Pulldown',
      'Inverted Row Orizzontale': 'Barbell Row',
      'Floor Pull asciugamano': 'Assisted Pull-up',
      'Scapular Pull-up': 'Assisted Pull-up',
      'Handstand Push-up': 'Military Press',
      'Handstand Assistito': 'Shoulder Press',
      'Pike Push-up': 'Military Press',
      'Pike Push-up Elevato': 'Incline Bench Press',
      'Plank to Pike': 'Ab Wheel',
      'Single Leg Deadlift': 'Deadlift',
      'Jump Lunge': 'Leg Press',
      'Nordic Curl Eccentrico': 'Leg Curl',
      'L-Sit Progressione': 'Cable Crunch',
      'Plank con Sollevamenti': 'Ab Wheel',
      'Toes to Bar': 'Hanging Leg Raise',
      'Burpees': 'Box Jump',
      'Affondi': 'Walking Lunge',
      'Squat Bulgaro': 'Bulgarian Split Squat'
    };

    // ✅ CONVERTI HOME → GYM SE LOCATION === 'GYM'
    if (programInput.location === 'gym') {
      console.log('[API] 🏋️ Location is GYM - converting HOME exercises to GYM exercises');
      
      program.weeklySchedule = program.weeklySchedule.map(day => ({
        ...day,
        exercises: day.exercises.map(exercise => {
          const gymAlternative = GYM_ALTERNATIVES[exercise.name];
          
          if (gymAlternative) {
            console.log(`[API] 🔄 Converting: ${exercise.name} → ${gymAlternative}`);
            return { 
              ...exercise, 
              name: gymAlternative,
              location: 'gym'
            };
          }
          
          console.log(`[API] ⚠️ No GYM alternative for ${exercise.name}, keeping as is`);
          return exercise;
        })
      }));
      
      console.log('[API] ✅ GYM conversion completed');
    } 
    else if (programInput.location === 'home' || programInput.location === 'mixed') {
      console.log(`[API] 🏠 Location is HOME/MIXED - keeping HOME exercises`);
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
    console.log('[API] ✅ Location:', programInput.location);
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
  // [Copy dal file originale - resto del codice rimane uguale]
}

// ===== CONVERSIONE HOME ASSESSMENT =====
function convertHomeAssessmentToStandard(exercises, bodyweight) {
  // [Copy dal file originale - resto del codice rimane uguale]
}

// ===== CONVERSIONE GYM ASSESSMENT =====
function convertGymAssessmentToStandard(assessmentData, bodyweight) {
  // [Copy dal file originale - resto del codice rimane uguale]
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
