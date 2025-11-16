45
  import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Received:', req.body);

    const { level, goal, location, frequency, assessmentData, userId, assessmentId } = req.body;

    console.log('[API] Data received:', {
      level,
      goal,
      location,
      frequency,
      hasAssessmentData: !!assessmentData,
      userId: userId ? 'present' : 'missing',
    });

    let calculatedLevel = level || 'intermediate';

    if (assessmentData && typeof assessmentData === 'object' && Object.keys(assessmentData).length > 0) {
      const levels = Object.values(assessmentData).map((test) => test.oneRepMax > 80 ? 'advanced' : 'intermediate');
      calculatedLevel = levels.includes('advanced') ? 'advanced' : 'intermediate';
    }

    console.log('Level calculated from score:', calculatedLevel);

    const program = {
      level: calculatedLevel,
      goal: goal,
      location: location,
      frequency: frequency,
      generatedAt: new Date().toISOString(),
      assessmentData: assessmentData || null,
      assessmentId: assessmentId,
      userId: userId,
    };

    console.log('[API] Generated:', program);

    // SAVE TO SUPABASE WITH SERVICE ROLE
    const adminSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: dbData, error: dbError } = await adminSupabase
      .from('training_programs')
      .insert([{
        user_id: userId,
        ...program,
        status: 'active',
        created_at: new Date().toISOString()
      }]).insert([{
    user_id: userId,
    assessment_id: assessmentId,
    name: `${calculatedLevel.charAt(0).toUpperCase() + calculatedLevel.slice(1)} Program`,
    description: `Personalized ${calculatedLevel} training program for ${goal}`,
    level: calculatedLevel,
    goal: goal,
    location: location,
    frequency: frequency,
    days_per_week: frequency,
    total_weeks: 12,
    status: 'active',
    split: 'full_body',
    weekly_schedule: {},
    created_at: new Date().toISOString(),
    metadata: {
      generated_at: new Date().toISOString(),
      assessment_data: assessmentData || null
    }
  }])

    if (dbError) {
      console.error('[API] Supabase INSERT Error:', dbError);
    } else {
      console.log('[API] Program saved to Supabase:', dbData);
    }

    return res.status(200).json({
      success: true,
      program: program
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
