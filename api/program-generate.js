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
      try {
        const exercises = Object.values(assessmentData);
        const validOneRepMaxes = exercises
          .map(e => e && e.oneRepMax)
          .filter(rm => rm && !isNaN(rm) && rm > 0);

        console.log('[LEVEL] Valid 1RMs:', validOneRepMaxes);

        if (validOneRepMaxes && validOneRepMaxes.length > 0) {
          const avgStrength = validOneRepMaxes.reduce((a, b) => a + b, 0) / validOneRepMaxes.length;
          console.log('[LEVEL] Avg strength:', avgStrength);

          if (avgStrength > 100) {
            calculatedLevel = 'advanced';
          } else if (avgStrength > 60) {
            calculatedLevel = 'intermediate';
          } else {
            calculatedLevel = 'beginner';
          }
        }
      } catch (error) {
        console.error('[LEVEL] Error:', error);
      }
    }

    console.log('[API] Calculated level:', calculatedLevel);

    const program = {
      level: calculatedLevel,
      goal: goal || 'strength',
      location: location || 'gym',
      frequency: frequency || 3,
      split: calculatedLevel === 'advanced' ? 'UPPER_LOWER' : 'FULL_BODY',
      daysPerWeek: frequency || 3,
      totalWeeks: 8,
      exercises: calculatedLevel === 'advanced' ? [
        { name: 'Squat', sets: 4, reps: 6 },
        { name: 'Bench Press', sets: 4, reps: 6 },
        { name: 'Deadlift', sets: 3, reps: 3 },
      ] : [
        { name: 'Squat', sets: 3, reps: 8 },
        { name: 'Bench Press', sets: 3, reps: 8 },
      ],
      generatedAt: new Date().toISOString(),
      assessmentData: assessmentData || null,
      assessmentId: assessmentId,
      userId: userId,
    };

    console.log('[API] Generated:', program);

    return res.status(200).json({
      success: true,
      program: program,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
