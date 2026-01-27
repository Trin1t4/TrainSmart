// ============================================================================
// FILE: packages/web/src/components/LiveWorkoutSession.tsx
// MODIFICHE MULTIPLE - Seguire nell'ordine
// ============================================================================


// ============================================================================
// MODIFICA 1: Aggiungere helper function all'inizio del file (dopo imports)
// ============================================================================

/**
 * ✅ FIX: Determina il pattern di movimento dall'esercizio se non specificato
 * Usato per trovare alternative quando exercise.pattern è undefined
 */
function determinePatternFromExercise(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  // Lower Push (Squat pattern)
  if (name.includes('squat') || name.includes('leg press') || name.includes('pressa') || 
      name.includes('lunge') || name.includes('affondo') || name.includes('pistol') ||
      name.includes('leg extension') || name.includes('step up')) {
    return 'lower_push';
  }
  
  // Lower Pull (Deadlift/Hinge pattern)
  if (name.includes('deadlift') || name.includes('stacco') || name.includes('rdl') ||
      name.includes('hip thrust') || name.includes('glute bridge') || name.includes('nordic') ||
      name.includes('leg curl') || name.includes('good morning') || name.includes('hyperextension')) {
    return 'lower_pull';
  }
  
  // Horizontal Push (Bench pattern)
  if (name.includes('push-up') || name.includes('push up') || name.includes('piegament') ||
      name.includes('panca') || name.includes('bench') || name.includes('chest press') ||
      name.includes('floor press') || name.includes('dip')) {
    return 'horizontal_push';
  }
  
  // Horizontal Pull (Row pattern)
  if (name.includes('row') || name.includes('remator') || name.includes('pulley') ||
      name.includes('inverted row') || name.includes('seated cable')) {
    return 'horizontal_pull';
  }
  
  // Vertical Push (Overhead pattern)
  if (name.includes('military') || name.includes('shoulder press') || name.includes('pike') ||
      name.includes('handstand') || name.includes('arnold') || name.includes('lateral raise') ||
      name.includes('alzate')) {
    return 'vertical_push';
  }
  
  // Vertical Pull (Pull-up pattern)
  if (name.includes('pull-up') || name.includes('pull up') || name.includes('chin') ||
      name.includes('trazion') || name.includes('lat pulldown') || name.includes('lat machine')) {
    return 'vertical_pull';
  }
  
  // Core
  if (name.includes('plank') || name.includes('crunch') || name.includes('sit-up') ||
      name.includes('leg raise') || name.includes('ab wheel') || name.includes('dead bug') ||
      name.includes('bird dog') || name.includes('pallof')) {
    return 'core';
  }
  
  console.warn(`[determinePatternFromExercise] Unknown pattern for: ${exerciseName}`);
  return 'compound';
}


// ============================================================================
// MODIFICA 2: Fix currentTargetSets con fallback sicuro
// TROVA: const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets;
// SOSTITUISCI CON:
// ============================================================================

// ✅ FIX: Fallback sicuro per evitare undefined che blocca la progressione
const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets || 3;


// ============================================================================
// MODIFICA 3: SOSTITUISCI INTERAMENTE la funzione proceedToNextSet
// ============================================================================

/**
 * ✅ FIX CRITICO: Funzione proceedToNextSet completamente rivista
 * Risolve il bug dove la serie non avanzava mai
 */
const proceedToNextSet = () => {
  if (!currentExercise) {
    console.warn('[proceedToNextSet] No current exercise - aborting');
    return;
  }

  console.log(`[proceedToNextSet] Processing: Exercise ${currentExerciseIndex + 1}/${totalExercises} "${currentExercise.name}", Set ${currentSet}/${currentTargetSets}`);

  // ========================================================================
  // SUPERSET LOGIC: Se siamo nell'ultimo esercizio di un superset,
  // torna al primo esercizio del gruppo per il prossimo set
  // ========================================================================
  if (isInSuperset && isLastInSupersetGroup && isLastInSupersetGroup()) {
    const currentGroup = currentExercise.supersetGroup;
    const firstInGroup = exercises.find(ex => ex.supersetGroup === currentGroup);

    if (firstInGroup && currentSet < currentTargetSets) {
      const firstIndex = exercises.findIndex(ex => ex.name === firstInGroup.name);
      if (firstIndex !== -1) {
        console.log(`[proceedToNextSet] Superset: returning to first exercise of group, advancing to set ${currentSet + 1}`);
        setCurrentExerciseIndex(firstIndex);
        setCurrentSet(prev => prev + 1);
        // Reset UI state
        setCurrentReps(0);
        setShowRPEInput(false);
        setShowRIRConfirm(false);
        toast.info(`🔄 Set ${currentSet + 1} - Superset`, { duration: 2000 });
        return;
      }
    }
  }

  // ========================================================================
  // NORMAL FLOW: Check if more sets remaining in current exercise
  // ========================================================================
  if (currentSet < currentTargetSets) {
    const nextSet = currentSet + 1;
    console.log(`[proceedToNextSet] ✅ Advancing to set ${nextSet}/${currentTargetSets}`);
    
    setCurrentSet(nextSet);
    
    // Reset UI inputs per il prossimo set
    setCurrentReps(0);
    setShowRPEInput(false);
    setShowRIRConfirm(false);
    
    // Toast feedback
    toast.info(`Serie ${nextSet}/${currentTargetSets}`, { duration: 1500 });
    
  } else {
    // ========================================================================
    // ALL SETS COMPLETED: Move to next exercise
    // ========================================================================
    console.log(`[proceedToNextSet] ✅ All ${currentTargetSets} sets completed for "${currentExercise.name}"`);
    
    // Se è superset, salta tutti gli esercizi del gruppo già completati
    let nextIndex = currentExerciseIndex + 1;
    
    if (isInSuperset && currentExercise.supersetGroup) {
      const currentGroup = currentExercise.supersetGroup;
      while (nextIndex < totalExercises && exercises[nextIndex]?.supersetGroup === currentGroup) {
        console.log(`[proceedToNextSet] Skipping superset member: ${exercises[nextIndex]?.name}`);
        nextIndex++;
      }
    }

    if (nextIndex < totalExercises) {
      const nextExercise = exercises[nextIndex];
      console.log(`[proceedToNextSet] ✅ Moving to exercise ${nextIndex + 1}/${totalExercises}: "${nextExercise.name}"`);
      
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      
      // Reset ALL UI state for new exercise
      setCurrentReps(0);
      setCurrentWeight(nextExercise.weight || 0);
      setShowRPEInput(false);
      setShowRIRConfirm(false);
      setActiveTempo && setActiveTempo(null);
      setCurrentPainLevel && setCurrentPainLevel(0);
      setPainAdaptations && setPainAdaptations([]);
      
      toast.success(`✅ ${currentExercise.name} completato!`, {
        description: `Prossimo: ${nextExercise.name}`
      });
      
    } else {
      // ========================================================================
      // WORKOUT COMPLETE!
      // ========================================================================
      console.log('[proceedToNextSet] 🎉 All exercises completed - finishing workout');
      handleWorkoutComplete();
    }
  }
};


// ============================================================================
// MODIFICA 4: Assicurarsi che handleSetComplete avvii il timer E avanzi la serie
// TROVA la funzione handleSetComplete e AGGIUNGI alla fine, PRIMA della chiusura }:
// ============================================================================

  // ✅ FIX: Avvia timer di recupero SEMPRE dopo un set completato
  const shouldStartTimer = currentSet < currentTargetSets || currentExerciseIndex < totalExercises - 1;
  
  if (shouldStartTimer && currentExercise) {
    let restSeconds = parseRestTimeToSeconds(currentExercise.rest || '90s');
    
    // Aggiustamenti per fase mestruale se applicabile
    if (menstrualPhase === 'menopause') {
      restSeconds = Math.round(restSeconds * 1.2); // +20% rest
    }
    
    console.log(`[handleSetComplete] ⏱️ Starting rest timer: ${restSeconds}s`);
    setRestTimeRemaining(restSeconds);
    setRestTimerActive(true);
  }

  // ✅ FIX: Se non c'è RPE input da mostrare, avanza subito
  // Altrimenti l'utente deve completare il feedback RPE prima di procedere
  if (!showRPEInput) {
    console.log('[handleSetComplete] No RPE input needed, proceeding to next set');
    proceedToNextSet();
  }


// ============================================================================
// MODIFICA 5: Aggiungere componente Timer visibile nel JSX
// TROVA un punto appropriato nel JSX (es. dopo l'header dell'esercizio)
// AGGIUNGI:
// ============================================================================

{/* ✅ FIX: Rest Timer Display - SEMPRE visibile quando attivo */}
{restTimerActive && restTimeRemaining > 0 && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -20 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
  >
    {/* Timer Icon with pulse animation */}
    <div className="relative">
      <Timer className="w-8 h-8" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
    </div>
    
    {/* Time Display */}
    <div className="flex flex-col">
      <span className="text-xs text-blue-200 uppercase tracking-wider">Recupero</span>
      <span className="text-3xl font-bold tabular-nums">
        {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
      </span>
    </div>
    
    {/* Skip Button */}
    <button
      onClick={() => {
        setRestTimerActive(false);
        setRestTimeRemaining(0);
        toast.info('⏭️ Recupero saltato', { duration: 1500 });
      }}
      className="ml-4 bg-white/20 hover:bg-white/30 active:bg-white/40 px-4 py-2 rounded-xl text-sm font-medium transition-all"
    >
      Salta →
    </button>
  </motion.div>
)}


// ============================================================================
// MODIFICA 6: Fix chiamata a getVariantsForExercise con pattern fallback
// TROVA dove viene chiamato getVariantsForExercise
// SOSTITUISCI CON:
// ============================================================================

// ✅ FIX: Usa pattern dall'esercizio O determina automaticamente
const exercisePattern = currentExercise.pattern || determinePatternFromExercise(currentExercise.name);
const variants = getVariantsForExercise(currentExercise.name, exercisePattern);

console.log(`[Alternatives] Pattern: ${exercisePattern}, Variants found: ${variants.length}`, variants);
