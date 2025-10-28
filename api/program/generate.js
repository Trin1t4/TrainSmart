import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Inizializza Supabase con service role key (server-side)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const { userId, assessmentId } = body;

    if (!userId || !assessmentId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch user data from database
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[API] User fetch error:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
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
      return new Response(JSON.stringify({ error: 'Assessment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
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
      assessmentResults: assessmentData.test_results || {}
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

    // Generate program
    const program = await generateProgram(programInput);

    // Save program to database
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        name: program.name,
        description: program.description,
        duration_weeks: program.durationWeeks,
        frequency: programInput.frequency,
        program_data: program,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] Error saving program:', saveError);
      return new Response(JSON.stringify({ error: 'Failed to save program' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[API] Program saved to database with ID:', savedProgram.id);

    return new Response(JSON.stringify({ 
      success: true, 
      programId: savedProgram.id,
      program: savedProgram
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Error generating program:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
