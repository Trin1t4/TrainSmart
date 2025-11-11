// ===== API WORKOUT LOG =====
// Salva log esercizio completato con feedback RPE

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      userId, 
      programId,
      dayName,
      weekNumber,
      exercise,       // Exercise object con tutti i dati
      performance,    // { setsCompleted, repsPerSet[], weightUsed, rpe, rpePerSet[], formQuality }
      location,       // Dove si è allenato
      equipment,      // Equipment usato
      feedback        // { painLevel, painLocation, notes }
    } = req.body;

    if (!userId || !programId || !dayName || !exercise || !performance) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'programId', 'dayName', 'exercise', 'performance']
      });
    }

    console.log('[LOG] 📝 Saving workout log:', {
      userId,
      exercise: exercise.name,
      setsCompleted: performance.setsCompleted,
      avgRPE: performance.rpe
    });

    // Insert workout log
    const { data: log, error: logError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: userId,
        program_id: programId,
        workout_date: new Date().toISOString().split('T')[0],
        day_name: dayName,
        week_number: weekNumber || 1,
        
        exercise_name: exercise.name,
        exercise_category: exercise.category || 'compound',
        
        location: location || 'gym',
        equipment_used: equipment || {},
        
        sets_completed: performance.setsCompleted,
        sets_planned: exercise.sets,
        reps_completed: performance.repsPerSet || [],
        reps_planned: exercise.reps,
        weight_used: performance.weightUsed || null,
        weight_planned: exercise.weight || null,
        
        rpe: performance.rpe || null,
        rpe_per_set: performance.rpePerSet || [],
        
        form_quality: performance.formQuality || 'good',
        pain_level: feedback?.painLevel || 0,
        pain_location: feedback?.painLocation || null,
        
        notes: feedback?.notes || null
      })
      .select()
      .single();

    if (logError) {
      console.error('[LOG] ❌ Insert error:', logError);
      return res.status(500).json({ 
        error: 'Failed to save log',
        details: logError.message 
      });
    }

    console.log('[LOG] ✅ Log saved:', log.id);

    // Analyze RPE for next workout adjustment
    const shouldAdjust = analyzePerformance(performance, exercise);

    return res.status(200).json({
      success: true,
      log: log,
      adjustment: shouldAdjust
    });

  } catch (error) {
    console.error('[LOG] ❌ Error:', error);
    return res.status(500).json({ 
      error: 'Failed to save workout log',
      details: error.message 
    });
  }
}

// ===== PERFORMANCE ANALYSIS =====

/**
 * Analizza performance e suggerisce aggiustamenti per prossimo workout
 */
function analyzePerformance(performance, exercise) {
  const avgRPE = performance.rpe || 
    (performance.rpePerSet?.reduce((a, b) => a + b, 0) / performance.rpePerSet?.length) || 5;

  const completionRate = performance.setsCompleted / exercise.sets;

  // Logica aggiustamento
  const adjustment = {
    shouldAdjust: false,
    reason: null,
    suggestedChange: null
  };

  // RPE troppo basso - aumenta carico
  if (avgRPE < 6 && completionRate >= 0.9) {
    adjustment.shouldAdjust = true;
    adjustment.reason = 'RPE troppo basso';
    adjustment.suggestedChange = 'increase_weight';
    adjustment.details = 'Aumenta peso 5-10%';
  }

  // RPE troppo alto - diminuisci carico
  if (avgRPE > 9 && completionRate < 0.8) {
    adjustment.shouldAdjust = true;
    adjustment.reason = 'RPE troppo alto';
    adjustment.suggestedChange = 'decrease_weight';
    adjustment.details = 'Diminuisci peso 5-10%';
  }

  // Non ha completato tutte le serie
  if (completionRate < 0.7) {
    adjustment.shouldAdjust = true;
    adjustment.reason = 'Serie incomplete';
    adjustment.suggestedChange = 'decrease_weight';
    adjustment.details = 'Diminuisci peso o serie';
  }

  // Performance ottimale
  if (avgRPE >= 7 && avgRPE <= 8 && completionRate >= 0.9) {
    adjustment.shouldAdjust = false;
    adjustment.reason = 'Performance ottimale';
    adjustment.suggestedChange = 'maintain';
    adjustment.details = 'Mantieni carico attuale';
  }

  console.log('[ANALYZE] 📊 Performance:', {
    avgRPE,
    completionRate,
    adjustment: adjustment.suggestedChange
  });

  return adjustment;
}
