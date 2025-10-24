import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

// Inizializza Supabase con service role key (server-side)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST allowed
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

    // 2. Fetch user onboarding data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('onboarding_data')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[API] User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const onboarding = userData.onboarding_data || {};

    // 3. Parse assessment results (1RM per esercizio)
    const assessments = [
      { exerciseName: 'Squat', oneRepMax: assessmentData.squat_1rm || 50 },
      { exerciseName: 'Panca Piana', oneRepMax: assessmentData.bench_1rm || 40 },
      { exerciseName: 'Pulley', oneRepMax: assessmentData.pullup_1rm || 40 },
      { exerciseName: 'Military Press', oneRepMax: assessmentData.press_1rm || 30 },
      { exerciseName: 'Stacco', oneRepMax: assessmentData.deadlift_1rm || 60 },
    ];

    // 4. Prepare input for program generator
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

    console.log('[API] Program input:', JSON.stringify(programInput, null, 2));

    // 5. Generate program
    const generatedProgram = generateProgram(programInput);

    console.log('[API] Program generated successfully');

    // 6. Save to database
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

    // 7. Return generated program
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