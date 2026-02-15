import { createClient } from '@supabase/supabase-js';
import { rateLimitMiddleware } from './lib/rateLimit.js';
import { generateProgram } from './lib/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting: max 5 requests per minute per user/IP
  if (rateLimitMiddleware(req, res, 'programGenerate')) {
    return; // Response already sent by middleware
  }

  try {
    console.log('[API] Received:', req.body);

    const {
      level, goal, location, frequency, assessmentData,
      userId, assessmentId, bodyweight, painAreas,
      equipment, disabilityType, sportRole, medicalRestrictions
    } = req.body;

    console.log('[API] Data received:', {
      level,
      goal,
      location,
      frequency,
      hasAssessmentData: !!assessmentData,
      userId: userId ? 'present' : 'missing',
    });

    // Calcolo livello basato su bodyweight ratio (se assessmentData presente)
    let calculatedLevel = level || 'intermediate';

    if (assessmentData && typeof assessmentData === 'object' && Object.keys(assessmentData).length > 0) {
      const bw = bodyweight || 70;
      const levels = Object.values(assessmentData).map((test) => {
        const ratio = test.oneRepMax / bw;
        if (ratio >= 1.5) return 'advanced';
        if (ratio >= 1.0) return 'intermediate';
        return 'beginner';
      });
      const advancedCount = levels.filter(l => l === 'advanced').length;
      const intermediateCount = levels.filter(l => l === 'intermediate').length;
      if (advancedCount >= 2) calculatedLevel = 'advanced';
      else if (intermediateCount >= 2 || advancedCount >= 1) calculatedLevel = 'intermediate';
      else calculatedLevel = 'beginner';
    }

    console.log('[API] Level calculated:', calculatedLevel);

    // Converti assessmentData in formato standard per programGenerator
    const assessments = assessmentData ? Object.entries(assessmentData).map(([name, test], i) => ({
      id: `api-${i}`,
      exerciseName: name,
      variant: location === 'gym' ? 'gym' : 'bodyweight',
      level: calculatedLevel,
      maxReps: test.reps || 10,
      oneRepMax: test.oneRepMax || 0,
      weight: test.weight || 0,
      bodyweight: bodyweight || 70
    })) : [];

    // Genera programma COMPLETO usando programGenerator
    const generatedProgram = await generateProgram({
      userId,
      assessmentId,
      location: location || 'gym',
      equipment: equipment || {},
      goal: goal || 'muscle_gain',
      level: calculatedLevel,
      frequency: frequency || 3,
      painAreas: painAreas || [],
      disabilityType: disabilityType || null,
      sportRole: sportRole || null,
      assessments,
      medicalRestrictions: medicalRestrictions || null
    });

    if (!generatedProgram || !generatedProgram.weeklySchedule) {
      console.error('[API] Program generation failed');
      return res.status(500).json({ error: 'Failed to generate program' });
    }

    console.log('[API] Program generated:', generatedProgram.name);

    // SAVE TO SUPABASE WITH SERVICE ROLE
    const adminSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: dbData, error: dbError } = await adminSupabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        name: generatedProgram.name,
        description: generatedProgram.description,
        level: calculatedLevel,
        goal: goal,
        location: location,
        frequency: frequency,
        split: generatedProgram.split,
        days_per_week: generatedProgram.daysPerWeek || frequency || 3,
        total_weeks: generatedProgram.totalWeeks || 4,
        weekly_schedule: generatedProgram.weeklySchedule,
        progression: generatedProgram.progression || 'linear',
        includes_deload: generatedProgram.includesDeload || false,
        deload_frequency: generatedProgram.deloadFrequency || 4,
        requires_end_cycle_test: generatedProgram.requiresEndCycleTest || false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('[API] Supabase INSERT Error:', dbError);
    } else {
      console.log('[API] Program saved to Supabase:', dbData?.id);
    }

    return res.status(200).json({
      success: true,
      program: dbData || generatedProgram
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
