/**
 * FIX 9 INTEGRATION - LiveWorkoutSession.tsx
 * 
 * Questo file contiene le modifiche esatte da applicare a LiveWorkoutSession.tsx
 * per integrare i miglioramenti del Fix 9:
 * 
 * 1. Learning Period - No auto-adjust per primi N sessioni
 * 2. RIR Media Pesata - Considera tutti i set, non solo l'ultimo
 * 3. Damping - Aggiustamenti graduali
 * 4. Moltiplicatore Categoria - Compound vs Isolation
 * 
 * ISTRUZIONI:
 * 1. Copia le funzioni in questo file
 * 2. Sostituisci analyzeRPEAndSuggest con la nuova versione
 * 3. Aggiungi lo state per learning period
 * 4. Aggiorna autoApplyWeightAdjustment
 */

// ============================================================
// STEP 1: AGGIUNGI QUESTI IMPORT
// ============================================================

/*
Aggiungi in cima al file, dopo gli altri import:

import {
  checkLearningPeriod,
  getSessionCountWithExercise,
  calculateWeightedRIR,
  calculateDampedAdjustment,
  calculateNormalizedSessionFatigue,
  analyzeExerciseForAdjustment,
  LEVEL_CONFIG,
  FATIGUE_MULTIPLIERS,
  type SetData,
  type LearningPeriodStatus,
} from '../lib/fix-09-auto-regulation-improvements';
*/

// ============================================================
// STEP 2: AGGIUNGI QUESTI STATE
// ============================================================

/*
Aggiungi dopo gli altri useState:

// Learning period status per ogni esercizio
const [learningStatus, setLearningStatus] = useState<Record<string, LearningPeriodStatus>>({});

// User level (da passare come prop o ottenere dal programma)
const userLevel = program?.user_level || 'intermediate';
*/

// ============================================================
// STEP 3: SOSTITUISCI analyzeRPEAndSuggest
// ============================================================

/**
 * NUOVA VERSIONE di analyzeRPEAndSuggest
 * 
 * Cambiamenti:
 * 1. Usa RIR media pesata invece di solo ultimo set
 * 2. Applica damping agli aggiustamenti
 * 3. Rispetta learning period
 * 4. Considera categoria esercizio
 */
const analyzeRPEAndSuggest_IMPROVED = async (rpe: number) => {
  const exerciseName = currentExercise.name;
  const exercisePattern = currentExercise.pattern;
  const currentSetNumber = currentSet;
  const totalSetsPlanned = currentTargetSets;
  const isLastSet = currentSetNumber === totalSetsPlanned;

  // Target RIR per l'ultimo set
  const targetRIR = currentExercise.targetRir ?? extractBaseTargetRIR(currentExercise.notes, currentExercise.intensity);
  const perceivedRIR = currentRIR;

  console.log(`[RIR Analysis V2] ${exerciseName} Set ${currentSetNumber}/${totalSetsPlanned}:`, {
    rpe,
    perceivedRIR,
    targetRIR,
    isLastSet,
    pattern: exercisePattern,
    userLevel
  });

  // ========================================
  // SET INTERMEDI: Solo tracking, no giudizio
  // ========================================
  if (!isLastSet) {
    const setsRemaining = totalSetsPlanned - currentSetNumber;

    // Avviso solo se RIR è già molto basso (rischio di non completare)
    if (perceivedRIR <= 1 && setsRemaining >= 2) {
      setSuggestion({
        type: 'reduce',
        message: `⚠️ Set ${currentSetNumber}/${totalSetsPlanned}: RIR ${perceivedRIR} - Attenzione! Mancano ${setsRemaining} set. Considera di ridurre il carico.`,
        newRest: increaseRest(currentExercise.rest),
        weightAdjustment: 0
      });
    } else {
      setSuggestion({
        type: 'maintain',
        message: `📊 Set ${currentSetNumber}/${totalSetsPlanned}: RIR ${perceivedRIR} registrato. Il sistema valuterà sull'ultimo set.`,
      });
    }
    return;
  }

  // ========================================
  // ULTIMO SET: ANALISI COMPLETA
  // ========================================

  // 1. Verifica Learning Period
  const sessionsCount = await getSessionCountWithExercise(userId, exerciseName, supabase);
  const learningResult = checkLearningPeriod(userId, exerciseName, sessionsCount, userLevel);
  
  // Aggiorna stato learning
  setLearningStatus(prev => ({ ...prev, [exerciseName]: learningResult }));

  // 2. Calcola RIR Media Pesata (tutti i set)
  const allSets = setLogs[exerciseName] || [];
  const setDataForAnalysis: SetData[] = allSets.map((s, idx) => ({
    setNumber: idx + 1,
    repsCompleted: s.reps_completed,
    repsTarget: typeof currentExercise.reps === 'number' ? currentExercise.reps : parseInt(String(currentExercise.reps)) || 10,
    rpe: s.rpe,
    rir: s.rir_perceived ?? (10 - s.rpe), // Fallback se RIR non registrato
    weight: s.weight_used || 0,
  }));

  // Aggiungi il set corrente
  setDataForAnalysis.push({
    setNumber: currentSetNumber,
    repsCompleted: currentReps,
    repsTarget: typeof currentExercise.reps === 'number' ? currentExercise.reps : parseInt(String(currentExercise.reps)) || 10,
    rpe: currentRPE,
    rir: perceivedRIR,
    weight: currentWeight || 0,
  });

  const weightedRIRResult = calculateWeightedRIR(setDataForAnalysis);
  
  console.log(`[RIR Analysis V2] Weighted RIR:`, weightedRIRResult);

  // 3. Se in Learning Period → No auto-adjust, solo feedback educativo
  if (learningResult.isInLearningPeriod) {
    const rirDiff = weightedRIRResult.weightedRIR - targetRIR;
    
    let message = `📊 ${learningResult.message}\n`;
    message += `RIR medio pesato: ${weightedRIRResult.weightedRIR.toFixed(1)} (target: ${targetRIR})\n`;
    message += weightedRIRResult.interpretation;
    
    if (Math.abs(rirDiff) >= 2) {
      message += `\n\n💡 Suggerimento: ${rirDiff > 0 ? 'Il peso sembra leggero' : 'Il peso sembra pesante'}. `;
      message += `Dopo la calibrazione, il sistema regolerà automaticamente.`;
    }

    setSuggestion({
      type: 'maintain',
      message,
      weightAdjustment: 0
    });
    return;
  }

  // 4. Calcola Adjustment con Damping
  const rirDiff = weightedRIRResult.weightedRIR - targetRIR;
  
  // Conta set consecutivi con stesso pattern
  let consecutiveSets = 0;
  for (let i = setDataForAnalysis.length - 1; i >= 0; i--) {
    const setRirDiff = setDataForAnalysis[i].rir - targetRIR;
    if (Math.sign(setRirDiff) === Math.sign(rirDiff) && Math.abs(setRirDiff) >= 1) {
      consecutiveSets++;
    } else {
      break;
    }
  }

  const adjustmentResult = calculateDampedAdjustment(
    rirDiff,
    exercisePattern,
    userLevel,
    consecutiveSets
  );

  console.log(`[RIR Analysis V2] Damped Adjustment:`, adjustmentResult);

  // 5. Genera Suggestion
  if (!adjustmentResult.shouldAdjust) {
    // Nessun aggiustamento necessario o non abbastanza conferme
    let message = '';
    
    if (Math.abs(rirDiff) <= 1) {
      message = `🔥 PERFETTO! RIR ${weightedRIRResult.weightedRIR.toFixed(1)} ≈ target ${targetRIR}. Carico calibrato!`;
    } else {
      message = `📊 ${adjustmentResult.reason}\n`;
      message += `RIR medio: ${weightedRIRResult.weightedRIR.toFixed(1)} vs target ${targetRIR}`;
    }

    setSuggestion({
      type: 'maintain',
      message,
      weightAdjustment: 0
    });
    return;
  }

  // 6. Aggiustamento Confermato
  const isIncrease = adjustmentResult.adjustmentPercent > 0;
  const absPercent = Math.abs(adjustmentResult.adjustmentPercent);
  
  const confidenceEmoji = {
    high: '🎯',
    medium: '📈',
    low: '🔍'
  }[adjustmentResult.confidence];

  let message = '';
  if (isIncrease) {
    message = `${confidenceEmoji} Peso LEGGERO (RIR ${weightedRIRResult.weightedRIR.toFixed(1)} vs target ${targetRIR})\n`;
    message += `Aumento +${absPercent}% per ${adjustmentResult.applyTo === 'next_set' ? 'prossimo set' : 'prossima sessione'}`;
  } else {
    message = `${confidenceEmoji} Peso PESANTE (RIR ${weightedRIRResult.weightedRIR.toFixed(1)} vs target ${targetRIR})\n`;
    message += `Riduzione -${absPercent}% per ${adjustmentResult.applyTo === 'next_set' ? 'prossimo set' : 'prossima sessione'}`;
  }

  if (adjustmentResult.confidence !== 'high') {
    message += `\n\n(${adjustmentResult.reason})`;
  }

  setSuggestion({
    type: isIncrease ? 'increase' : 'reduce',
    message,
    weightAdjustment: adjustmentResult.adjustmentPercent
  });

  // 7. Auto-apply se confidence è alta e applyTo è 'next_session'
  if (adjustmentResult.confidence === 'high' && adjustmentResult.applyTo === 'next_session') {
    // Applica automaticamente per la prossima sessione
    await autoApplyWeightAdjustment_IMPROVED(adjustmentResult.adjustmentPercent);
  }
};

// ============================================================
// STEP 4: AGGIORNA autoApplyWeightAdjustment
// ============================================================

/**
 * NUOVA VERSIONE di autoApplyWeightAdjustment
 * 
 * Cambiamenti:
 * 1. Rispetta il max adjustment per livello
 * 2. Logga più informazioni per analytics
 * 3. Include pattern e confidence nel log
 */
const autoApplyWeightAdjustment_IMPROVED = async (percentChange: number) => {
  if (!currentExercise) return;

  const config = LEVEL_CONFIG[userLevel];
  
  // Applica cap per livello
  const cappedChange = Math.max(
    -config.maxAdjustmentPercent,
    Math.min(config.maxAdjustmentPercent, percentChange)
  );

  const currentWeightNum = typeof currentExercise.weight === 'number'
    ? currentExercise.weight
    : parseFloat(String(currentExercise.weight)) || 0;

  if (currentWeightNum <= 0) return;

  // Arrotonda a 0.5kg
  const newWeight = Math.round(currentWeightNum * (1 + cappedChange / 100) * 2) / 2;

  // Update local state
  setAdjustedWeights(prev => ({ ...prev, [currentExercise.name]: newWeight }));

  // Persist to database con info aggiuntive
  try {
    await persistWeightAdjustment_IMPROVED(
      currentExercise.name,
      currentExercise.pattern,
      newWeight,
      cappedChange,
      {
        userLevel,
        wasLearningPeriod: false,
        confidence: 'high',
        setCount: setLogs[currentExercise.name]?.length || 0,
      }
    );
    
    console.log(`[Auto-Regulation V2] Weight adjusted: ${currentExercise.name} ${currentWeightNum}kg → ${newWeight}kg (${cappedChange > 0 ? '+' : ''}${cappedChange}%)`);
    
    toast.success(
      cappedChange > 0 ? '📈 Peso aumentato' : '📉 Peso ridotto',
      { description: `${currentExercise.name}: ${currentWeightNum}kg → ${newWeight}kg` }
    );
  } catch (error) {
    console.error('[Auto-Regulation V2] Failed to persist:', error);
  }
};

// ============================================================
// STEP 5: AGGIORNA persistWeightAdjustment
// ============================================================

/**
 * NUOVA VERSIONE di persistWeightAdjustment
 * Include più metadata per analytics migliori
 */
const persistWeightAdjustment_IMPROVED = async (
  exerciseName: string,
  exercisePattern: string,
  newWeight: number,
  percentChange: number,
  metadata: {
    userLevel: string;
    wasLearningPeriod: boolean;
    confidence: string;
    setCount: number;
  }
) => {
  try {
    // Fetch current program
    const { data: program, error: fetchError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (fetchError || !program) {
      throw new Error('Failed to fetch program');
    }

    // Find and update exercise (stessa logica di prima)
    let updated = false;
    const updatePayload: any = {};

    // Try weekly_schedule first
    if (program.weekly_schedule && Array.isArray(program.weekly_schedule)) {
      const updatedSchedule = program.weekly_schedule.map((day: any) => ({
        ...day,
        exercises: day.exercises?.map((ex: any) => {
          if (ex.name === exerciseName) {
            updated = true;
            return {
              ...ex,
              weight: typeof ex.weight === 'string' ? `${newWeight}kg` : newWeight,
              notes: `${ex.notes || ''} | V2: ${percentChange > 0 ? '+' : ''}${percentChange}% (${metadata.confidence})`.trim()
            };
          }
          return ex;
        })
      }));

      if (updated) {
        updatePayload.weekly_schedule = updatedSchedule;
      }
    }

    // Try weekly_split.days
    if (!updated && program.weekly_split?.days) {
      const updatedDays = program.weekly_split.days.map((day: any) => ({
        ...day,
        exercises: day.exercises?.map((ex: any) => {
          if (ex.name === exerciseName) {
            updated = true;
            return {
              ...ex,
              weight: typeof ex.weight === 'string' ? `${newWeight}kg` : newWeight,
              notes: `${ex.notes || ''} | V2: ${percentChange > 0 ? '+' : ''}${percentChange}% (${metadata.confidence})`.trim()
            };
          }
          return ex;
        })
      }));

      if (updated) {
        updatePayload.weekly_split = { ...program.weekly_split, days: updatedDays };
      }
    }

    // Try exercises array
    if (!updated && program.exercises) {
      const updatedExercises = program.exercises.map((ex: any) => {
        if (ex.name === exerciseName) {
          updated = true;
          return {
            ...ex,
            weight: typeof ex.weight === 'string' ? `${newWeight}kg` : newWeight,
            notes: `${ex.notes || ''} | V2: ${percentChange > 0 ? '+' : ''}${percentChange}% (${metadata.confidence})`.trim()
          };
        }
        return ex;
      });

      if (updated) {
        updatePayload.exercises = updatedExercises;
      }
    }

    if (!updated) {
      console.warn(`[RIR Adjustment V2] Exercise ${exerciseName} not found`);
      return;
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('training_programs')
      .update(updatePayload)
      .eq('id', programId);

    if (updateError) throw updateError;

    // Log adjustment con metadata estesi
    await supabase.from('program_adjustments').insert({
      user_id: userId,
      program_id: programId,
      trigger_type: percentChange > 0 ? 'low_rpe' : 'high_rpe',
      avg_rpe_before: currentRPE,
      sessions_analyzed: 1,
      adjustment_type: percentChange > 0 ? 'increase_volume' : 'decrease_volume',
      volume_change_percent: percentChange,
      exercises_affected: [{
        exercise_name: exerciseName,
        pattern: exercisePattern,
        avg_rpe: currentRPE,
        old_weight: currentExercise.weight,
        new_weight: newWeight,
        reason: `V2 Auto-Regulation`,
        metadata: {
          user_level: metadata.userLevel,
          confidence: metadata.confidence,
          set_count: metadata.setCount,
          fatigue_multiplier: FATIGUE_MULTIPLIERS[exercisePattern] || 1.0,
        }
      }],
      applied: true,
      user_accepted: true
    });

    // Clear cache
    localStorage.removeItem('currentProgram');

    console.log(`[RIR Adjustment V2] Persisted: ${exerciseName} → ${newWeight}kg`);
  } catch (error) {
    console.error('[RIR Adjustment V2] Error:', error);
    throw error;
  }
};

// ============================================================
// STEP 6: AGGIUNGI ANALISI POST-SESSIONE
// ============================================================

/**
 * Da chiamare in handleWorkoutComplete()
 * Aggiunge analisi della sessione con moltiplicatori categoria
 */
const analyzeSessionWithCategoryMultipliers = () => {
  const exerciseData = Object.entries(setLogs).map(([name, sets]) => {
    const exercise = exercises.find(ex => ex.name === name);
    return {
      exerciseName: name,
      pattern: exercise?.pattern || 'accessory',
      sets: sets.map((s, idx) => ({
        setNumber: idx + 1,
        repsCompleted: s.reps_completed,
        repsTarget: 10,
        rpe: s.rpe,
        rir: s.rir_perceived ?? (10 - s.rpe),
        weight: s.weight_used || 0,
      })),
      targetRIR: exercise?.targetRir ?? 2,
    };
  });

  const sessionAnalysis = calculateNormalizedSessionFatigue(exerciseData);

  console.log('[Session Analysis V2]', sessionAnalysis);

  // Mostra insights all'utente
  toast.info(sessionAnalysis.interpretation, {
    description: `RPE raw: ${sessionAnalysis.rawAvgRPE} → Normalizzato: ${sessionAnalysis.normalizedFatigue}`,
    duration: 5000
  });

  return sessionAnalysis;
};

// ============================================================
// STEP 7: INTEGRA NEL COMPONENTE
// ============================================================

/*
In handleWorkoutComplete(), aggiungi prima del salvataggio:

  // Analisi sessione con moltiplicatori categoria
  const sessionAnalysis = analyzeSessionWithCategoryMultipliers();
  
  // Includi nell'oggetto workout log
  const workoutNotes = [
    'Live workout with real-time RPE feedback V2',
    `Session fatigue: ${sessionAnalysis.normalizedFatigue}/10`,
    sessionAnalysis.interpretation,
    painNote,
    contextNote,
  ].filter(Boolean).join(' | ');

In handleRPESubmit(), sostituisci la chiamata:

  // PRIMA:
  analyzeRPEAndSuggest(currentRPE);
  
  // DOPO:
  await analyzeRPEAndSuggest_IMPROVED(currentRPE);

*/

// ============================================================
// EXPORT (per test)
// ============================================================

export {
  analyzeRPEAndSuggest_IMPROVED,
  autoApplyWeightAdjustment_IMPROVED,
  persistWeightAdjustment_IMPROVED,
  analyzeSessionWithCategoryMultipliers,
};
