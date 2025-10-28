import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Inizializza Supabase con service role key (server-side)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ CORRETTO - usa req.body invece di req.json()
    const { userId, assessmentId } = req.body;

    if (!userId || !assessmentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch user data from database
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[API] User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ LOG DEBUG - USER DATA
    console.log('[API] 🔍 USER DATA COMPLETO:', JSON.stringify(userData, null, 2));
    console.log('[API] 🏠 Training Location:', userData.onboarding_data?.trainingLocation);
    console.log('[API] 🏋️ Equipment:', JSON.stringify(userData.onboarding_data?.equipment));
    console.log('[API] 🎯 Goal:', userData.onboarding_data?.goal);

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

    // Prepare program input
    const onboardingData = userData.onboarding_data || {};
    
    const programInput = {
      userId,
      assessmentId,
      location: onboardingData.trainingLocation || 'gym',
      hasGym: onboardingData.trainingLocation === 'gym',
      equipment: onboardingData.equipment || {},
      goal: onboardingData.goal || 'muscle_gain',
      level: assessmentData.level || 'intermediate',
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || assessmentData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments: Array.isArray(assessmentData.test_results) 
        ? assessmentData.test_results 
        : []
    };

    // ✅ LOG DEBUG - INPUT PROGRAM GENERATOR
    console.log('[API] 📤 INPUT PER PROGRAM GENERATOR:', JSON.stringify({
      location: programInput.location,
      hasGym: programInput.hasGym,
      equipment: programInput.equipment,
      goal: programInput.goal,
      level: programInput.level,
      frequency: programInput.frequency
    }, null, 2));

    console.log('[API] 📊 Assessment Results:', JSON.stringify(programInput.assessments, null, 2));

    // Generate program
    const program = await generateProgram(programInput);

    // ✅ SAVE PROGRAM - SCHEMA CORRETTO
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

    console.log('[API] ✅ Program saved to database with ID:', savedProgram.id);

    return res.status(200).json({ 
      success: true, 
      programId: savedProgram.id,
      program: savedProgram
    });

  } catch (error) {
    console.error('[API] Error generating program:', error);
    return res.status(500).json({ error: error.message });
  }
}
