import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

// ✅ Variabili senza prefisso VITE_ per server-side
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Validazione credenziali
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, assessmentId } = req.body;

    if (!userId || !assessmentId) {
      return res.status(400).json({ error: 'Missing userId or assessmentId' });
    }

    console.log(`[API] Generating program for user ${userId}, assessment ${assessmentId}`);

    // 1. Fetch assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessmentData) {
      console.error('[API] Assessment fetch error:', assessmentError);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // 2. ✅ CORREZIONE: Fetch da user_profiles invece di users
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')  // ✅ Nome tabella corretto
      .select('onboarding_data')
      .eq('user_id', userId)  // ✅ Colonna corretta
      .single();

    if (userError || !userData) {
      console.error('[API] User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const onboarding = userData.onboarding_data || {};

    // [... resto del codice invariato ...]

    const exercisesData = assessmentData.exercises || [];
    
    const assessments = exercisesData.map(ex => {
      let oneRepMax;
      
      if (ex.rm10 && ex.rm10 > 0) {
        oneRepMax = ex.rm10 * (36 / (37 - 10));
        console.log(`[API] ${ex.name}: 10RM ${ex.rm10}kg → 1RM ${oneRepMax.toFixed(1)}kg`);
      }
      else if (ex.variant && ex.variant.level && ex.variant.maxReps) {
        const baseWeights = {
          'Squat': [40, 60, 80, 100],
          'Push up': [30, 45, 60, 75],
          'Trazioni': [40, 60, 80, 100],
          'Spalle': [20, 35, 50, 65],
          'Gambe (Unilaterale)': [30, 45, 60, 75]
        };
        
        const weights = baseWeights[ex.name] || [50, 60, 70, 80];
        const levelIndex = Math.min(ex.variant.level - 1, weights.length - 1);
        const baseWeight = weights[levelIndex];
        
        const maxReps = Math.min(ex.variant.maxReps, 30);
        oneRepMax = baseWeight * (36 / (37 - maxReps));
        
        console.log(`[API] ${ex.name}: Lv${ex.variant.level} × ${ex.variant.maxReps} reps → 1RM stimato ${oneRepMax.toFixed(1)}kg`);
      }
      else if (ex.oneRepMax) {
        oneRepMax = ex.oneRepMax;
        console.log(`[API] ${ex.name}: oneRepMax già presente = ${oneRepMax}kg`);
      }
      else {
        oneRepMax = 50;
        console.warn(`[API] ${ex.name}: Nessun dato valido, usando default 50kg`);
      }
      
      return {
        exerciseName: ex.name,
        oneRepMax: Math.round(oneRepMax * 10) / 10
      };
    });

    console.log('[API] Assessments parsed:', assessments);

    const programInput = {
      level: onboarding.fitnessLevel || 'beginner',
      frequency: parseInt(onboarding.frequency) || 3,
      location: onboarding.location || 'gym',
      hasGym: onboarding.location === 'gym' || onboarding.location === 'mixed',
      equipment: onboarding.equipment || {},
      painAreas: onboarding.painAreas || [],
      assessments,
      goal: onboarding.goal || 'general',
      sportRole: onboarding.sportRole,
      specificBodyParts: onboarding.specificBodyParts || [],
      disabilityType: onboarding.disabilityType,
      pregnancyWeek: onboarding.pregnancyWeek,
      pregnancyTrimester: onboarding.pregnancyTrimester,
      hasDoctorClearance: onboarding.hasDoctorClearance,
      pregnancyComplications: onboarding.pregnancyComplications || [],
    };

    console.log('[API] Program input prepared:', JSON.stringify(programInput, null, 2));

    const generatedProgram = generateProgram(programInput);

    console.log('[API] Program generated successfully');

    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        name: generatedProgram.name,
        description: generatedProgram.description,
        split: generatedProgram.split,
        days_per_week: generatedProgram.daysPerWeek,
        weekly_schedule: generatedProgram.weeklySchedule,
        progression: generatedProgram.progression,
        includes_deload: generatedProgram.includesDeload,
        deload_frequency: generatedProgram.deloadFrequency,
        total_weeks: generatedProgram.totalWeeks,
        requires_end_cycle_test: generatedProgram.requiresEndCycleTest,
        status: 'active',
        current_week: 1,
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] Save error:', saveError);
      return res.status(500).json({ error: 'Failed to save program', details: saveError.message });
    }

    console.log('[API] Program saved to database with ID:', savedProgram.id);

    return res.status(200).json({
      success: true,
      program: savedProgram,
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
