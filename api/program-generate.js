export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Received:', req.body);
    
  const { level, goal, location, frequency, assessmentData, userId, assessmentId } = req.body;    
    // GENERA UN PROGRAMMA DI TEST
    
  // Calculate level from assessmentData if provided
  let calculatedLevel = level || 'beginner';
  if (assessmentData && Object.keys(assessmentData).length > 0) {
    const oneRepMaxes = Object.values(assessmentData).map(e => e.oneRepMax);
    const avgStrength = oneRepMaxes.reduce((a, b) => a + b, 0) / oneRepMaxes.length;
    if (avgStrength > 100) calculatedLevel = 'advanced';
    else if (avgStrength > 60) calculatedLevel = 'intermediate';
  }
    const program = {
    name: `Programma ${calculatedLevel.toUpperCase()} - ${goal}`,
          level: calculatedLevel,
      goal: goal,
      location: location,
      frequency: frequency,
          split: calculatedLevel === 'advanced' ? 'UPPER_LOWER' : 'FULL_BODY',
      daysPerWeek: frequency || 3,
      totalWeeks: 8,
    exercises: calculatedLevel === 'advanced' ? [
        'Squat Bulgaro',
        'Stacco Rumeno', 
        'Military Press',
        'Trazioni Zavorrate',
        'Dips',
        'Face Pulls'
      ] : [
        'Squat',
        'Push-up',
        'Rematore',
        'Plank'
      ],
      generatedAt: new Date().toISOString()
          assessmentData: assessmentData || null,
    assessmentId: assessmentId,
    userId: userId,
    };
    
    console.log('[API] Generated:', program);
    
    return res.status(200).json({
      success: true,
      program: program
    });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal error'
    });
  }
}
