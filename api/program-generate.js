export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Received:', req.body);
    
  const { level, goal, location, frequency, assessmentData, userId, assessmentId } = req.body;    
    // GENERA UN PROGRAMMA DI TEST
    
// DEBUG: Log ricevuti
  console.log("[API] Received:", { level, goal, location, frequency, hasAssessmentData: !!assessmentData, userId: userId ? "present" : "missing" });

  // CALCOLO LEVEL SICURO
  let calculatedLevel = level || "intermediate";
  if (assessmentData && typeof assessmentData === "object" && Object.keys(assessmentData).length > 0) {
    try {
      const exercises = Object.values(assessmentData);
      const validOneRepMaxes = exercises.map(e => e && e.oneRepMax).filter(rm => rm && !isNaN(rm) && rm > 0);
      
      if (validOneRepMaxes && validOneRepMaxes.length > 0) {
        const avgStrength = validOneRepMaxes.reduce((a, b) => a + b, 0) / validOneRepMaxes.length;
        console.log("[LEVEL CALC] avgStrength:", avgStrength);
        if (avgStrength > 100) calculatedLevel = "advanced";
        else if (avgStrength > 60) calculatedLevel = "intermediate";
        else calculatedLevel = "beginner";
      } else {
        console.log("[LEVEL CALC] No valid 1RMs");
      }
    } catch (error) {
      console.error("[LEVEL CALC] Error:", error);
    }
  } else {
    console.log("[LEVEL CALC] No assessmentData");
  }
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
