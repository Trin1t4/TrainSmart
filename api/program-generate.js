import { createClient } from '@supabase/supabase-js';
import { generateProgram } from './lib/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
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

    // Prepara input per il generatore
    const programInput = {
      userId,
      assessmentId,
      location: userData.onboarding_data?.trainingLocation || 'gym',
      equipment: userData.onboarding_data?.equipment || {},
      goal: userData.onboarding_data?.goal || 'muscle_gain',
      level: userData.onboarding_data?.level || 'beginner',
      frequency: userData.onboarding_data?.weeklyFrequency || 3,
      painAreas: userData.onboarding_data?.painAreas || [],
      disabilityType: userData.onboarding_data?.disabilityType || null,
      sportRole: userData.onboarding_data?.sportRole || null,
      specificBodyParts: userData.onboarding_data?.specificBodyParts || [],
      assessments: assessmentData.exercises || []
    };

    // Genera il programma
    const program = await generateProgram(programInput);

    if (!program) {
      return res.status(500).json({ error: 'Failed to generate program' });
    }

    // Salva nel database
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        ...program,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] Save error:', saveError);
      return res.status(500).json({ error: 'Failed to save program' });
    }

    return res.status(200).json(savedProgram);
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
