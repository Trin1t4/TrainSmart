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
    const intelligentLevel = calculateIntelligentLevel(assessmentData, onboardingData);

    console.log('[API] 📊 Intelligent Level Result:', intelligentLevel);

    if (!intelligentLevel || !intelligentLevel?.trainingType ?? 'mixed') {
      console.error('[API] ❌ Failed to calculate intelligent level');
      return res.status(500).json({ error: 'Failed to calculate level' });
    }

    // ✅ CONVERTI ASSESSMENT IN FORMATO STANDARD CON VARIANTI
    let assessments = [];
    
    if (assessmentData.assessment_type === 'home' && assessmentData.exercises) {
      assessments = convertHomeAssessmentToStandard(
        assessmentData.exercises,
        intelligentLevel?.trainingType ?? 'mixed'
      );
      console.log('[API] 🏠 Home assessment converted:', assessments.length, 'exercises');
      
    } else if (assessmentData.assessment_type === 'gym') {
      assessments = convertGymAssessmentToStandard(
        assessmentData,
        intelligentLevel?.trainingType ?? 'mixed'
      );
      console.log('[API] 🏋️ Gym assessment converted:', assessments.length, 'exercises');
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
        exerciseName: a.exerciseName,
        variant: a.variant,
        level: a.level,
        maxReps: a.maxReps,
        oneRepMax: a.oneRepMax
      }))
    });

    // ✅ GENERA PROGRAMMA
    let program = await generateProgram(programInput);

    if (!program || !program.weeklySchedule) {
      console.error('[API] ❌ Program generation failed');
      return res.status(500).json({ error: 'Failed to generate program' });
    }

    console.log('[API] ✅ Program generated with', program.weeklySchedule.length, 'days');
    console.log('[API] 🔥 First exercise:', program.weeklySchedule?.[0]?.exercises?.[0]?.name);
    console.log("[API] 🔍 DEBUG First exercise FULL:", JSON.stringify(program.weeklySchedule?.[0]?.exercises?.[0], null, 2));

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
      'Squat Bulgaro': 'Bulgarian Split Squat',
      'Rematore bilanciere': 'Barbell Row',
      'Rematore manubrio': 'Dumbbell Row',
      'Leg Press': 'Leg Press'
    };

    // ✅ CONVERTI HOME → GYM SE LOCATION === 'GYM'
    if (programInput.location === 'gym') {
      console.log('[API] 🏋️ Location is GYM - converting HOME exercises to GYM exercises');
      
      let convertedCount = 0;
      program.weeklySchedule = program.weeklySchedule.map(day => ({
        ...day,
        exercises: day.exercises.map(exercise => {
          const gymAlternative = GYM_ALTERNATIVES[exercise.name];
          
          if (gymAlternative) {
            console.log(`[API] 🔄 Converting: "${exercise.name}" → "${gymAlternative}"`);
            convertedCount++;
            return { 
              ...exercise, 
              name: gymAlternative,
              location: 'gym'
            };
          }
          
          return exercise;
        })
      }));
      
      console.log(`[API] ✅ GYM conversion completed - ${convertedCount} exercises converted`);
      console.log('[API] 🔥 First exercise AFTER conversion:', program.weeklySchedule?.[0]?.exercises?.[0]?.name);
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
    console.log('[API] ✅ Location saved:', programInput.location);
    console.log('[API] ✅ First exercise in DB:', savedProgram.weekly_schedule?.[0]?.exercises?.[0]?.name);

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
  const bodyweight = onboardingData.personalInfo?.weight || assessmentData.bodyWeight || 80;
  
  // Formula semplificata - calcola based su assessment
  let score = 0;
  let count = 0;

  if (assessmentData.exercises && Array.isArray(assessmentData.exercises)) {
    for (const exercise of assessmentData.exercises) {
      if (exercise.weight && exercise.reps) {
        const oneRepMax = calculateOneRepMax(exercise.weight, exercise.reps);
        const ratio = oneRepMax / bodyweight;
        
        // Benchmark standards
        const standards = {
          'Squat': { beginner: 0.75, intermediate: 1.25, advanced: 1.75 },
          'Stacco': { beginner: 1.0, intermediate: 1.5, advanced: 2.0 },
          'Panca': { beginner: 0.5, intermediate: 0.85, advanced: 1.25 },
          'Trazioni': { beginner: 0.5, intermediate: 0.75, advanced: 1.0 }
        };

         let level = 'beginner';
        for (const [exercise, thresholds] of Object.entries(standards)) {
          if (assessmentData.exercises[count].name?.includes(exercise)) {
            if (ratio >= thresholds.advanced) level = 'advanced';
            else if (ratio >= thresholds.intermediate) level = 'intermediate';
            break;
          }
        }
        
        count++;
      }
    }
  }

  const finalLevel = level || 'beginner';
  return {
    bodyweight,
    finalLevel,
    score: 50
  };
}

// ===== CONVERSIONE HOME ASSESSMENT =====
function convertHomeAssessmentToStandard(exercises, bodyweight) {
  return (exercises || []).map((ex, index) => ({
    id: `home-${index}`,
    exerciseName: ex.name || ex.exercise || 'Unknown',
    variant: 'bodyweight',
    level: 'intermediate',
    maxReps: ex.reps || 10,
    oneRepMax: calculateOneRepMax(ex.weight || 0, ex.reps || 10),
    weight: ex.weight || 0,
    notes: ex.notes || ''
  }));
}

// ===== CONVERSIONE GYM ASSESSMENT =====
function convertGymAssessmentToStandard(assessmentData, bodyweight) {
  const exercises = assessmentData.exercises || [];
  
  return exercises.map((ex, index) => ({
    id: `gym-${index}`,
    exerciseName: ex.name || ex.exercise || 'Unknown',
    variant: 'gym',
    level: 'intermediate',
    maxReps: ex.reps || 8,
    oneRepMax: calculateOneRepMax(ex.weight || 0, ex.reps || 8),
    weight: ex.weight || 0,
    notes: ex.notes || ''
  }));
}

// ===== FORMULE E CALCOLI =====
function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  if (weight === 0 || reps === 0) return 0;
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
