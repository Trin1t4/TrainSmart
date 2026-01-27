// ============================================================================
// FILE: packages/web/src/utils/exerciseVariants.ts
// SEZIONE: funzione getVariantsForExercise
// AZIONE: SOSTITUISCI l'intera funzione
// ============================================================================

/**
 * Get all variants for a given exercise name and pattern
 * Used by ExerciseDislikeModal and Alternatives Modal to find replacements
 * 
 * ✅ FIX: Versione migliorata con:
 * - Fallback automatico per pattern detection se non fornito
 * - Logging per debug
 * - Matching case-insensitive
 */
export function getVariantsForExercise(
  exerciseName: string,
  patternId?: string
): string[] {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    horizontal_pull: HORIZONTAL_PULL_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  // ✅ FIX: Se pattern non fornito, prova a dedurlo dal nome esercizio
  let effectivePattern = patternId;
  
  if (!effectivePattern || !variantMap[effectivePattern]) {
    const name = exerciseName.toLowerCase();
    
    // Lower Push (Squat pattern) - include Leg Press!
    if (name.includes('squat') || name.includes('leg press') || name.includes('pressa') || 
        name.includes('lunge') || name.includes('affondo') || name.includes('pistol') ||
        name.includes('leg extension') || name.includes('step up') || name.includes('hack')) {
      effectivePattern = 'lower_push';
    } 
    // Lower Pull (Deadlift/Hinge pattern)
    else if (name.includes('deadlift') || name.includes('stacco') || name.includes('rdl') ||
             name.includes('hip thrust') || name.includes('glute bridge') || name.includes('nordic') ||
             name.includes('leg curl') || name.includes('good morning') || name.includes('hyperextension') ||
             name.includes('back extension')) {
      effectivePattern = 'lower_pull';
    } 
    // Horizontal Push (Bench pattern)
    else if (name.includes('push-up') || name.includes('push up') || name.includes('piegament') ||
             name.includes('panca') || name.includes('bench') || name.includes('chest press') ||
             name.includes('floor press') || name.includes('dip') || name.includes('fly') ||
             name.includes('croci')) {
      effectivePattern = 'horizontal_push';
    } 
    // Horizontal Pull (Row pattern)
    else if (name.includes('row') || name.includes('remator') || name.includes('pulley') ||
             name.includes('cable row') || name.includes('t-bar') || name.includes('inverted')) {
      effectivePattern = 'horizontal_pull';
    } 
    // Vertical Push (Overhead pattern)
    else if (name.includes('military') || name.includes('shoulder press') || name.includes('pike') ||
             name.includes('handstand') || name.includes('arnold') || name.includes('lateral raise') ||
             name.includes('alzate') || name.includes('front raise') || name.includes('overhead')) {
      effectivePattern = 'vertical_push';
    } 
    // Vertical Pull (Pull-up pattern)
    else if (name.includes('pull-up') || name.includes('pull up') || name.includes('pullup') ||
             name.includes('trazion') || name.includes('lat pulldown') || name.includes('lat machine') ||
             name.includes('chin-up') || name.includes('chin up')) {
      effectivePattern = 'vertical_pull';
    } 
    // Core
    else if (name.includes('plank') || name.includes('crunch') || name.includes('sit-up') ||
             name.includes('leg raise') || name.includes('ab wheel') || name.includes('dead bug') ||
             name.includes('bird dog') || name.includes('pallof') || name.includes('hollow') ||
             name.includes('v-up')) {
      effectivePattern = 'core';
    }
    
    if (effectivePattern && effectivePattern !== patternId) {
      console.log(`[getVariantsForExercise] 🔍 Pattern inferred: "${effectivePattern}" for "${exerciseName}" (original: "${patternId}")`);
    }
  }

  // Se ancora non abbiamo un pattern valido, log e return empty
  if (!effectivePattern || !variantMap[effectivePattern]) {
    console.warn(`[getVariantsForExercise] ⚠️ No valid pattern found for: "${exerciseName}" (pattern: "${patternId}")`);
    return [];
  }

  const variants = variantMap[effectivePattern];

  // Return all variant names except the current one (case-insensitive comparison)
  const normalizedCurrentName = exerciseName.toLowerCase().trim();
  const alternativeNames = variants
    .map(v => v.name)
    .filter(name => name.toLowerCase().trim() !== normalizedCurrentName);
    
  console.log(`[getVariantsForExercise] ✅ Found ${alternativeNames.length} alternatives for "${exerciseName}" (pattern: ${effectivePattern}):`, alternativeNames);
  
  return alternativeNames;
}


// ============================================================================
// VERIFICA: LOWER_PUSH_VARIANTS deve includere Leg Press
// Se non presente, AGGIUNGI a LOWER_PUSH_VARIANTS:
// ============================================================================

/*
Verifica che LOWER_PUSH_VARIANTS contenga:

{
  id: 'leg_press',
  name: 'Leg Press',
  difficulty: 4,
  equipment: 'gym',
  primary: ['quadriceps', 'glutes'],
  secondary: ['hamstrings']
},

{
  id: 'hack_squat',
  name: 'Hack Squat',
  difficulty: 5,
  equipment: 'gym',
  primary: ['quadriceps'],
  secondary: ['glutes', 'hamstrings']
},

Se mancano, aggiungili all'array LOWER_PUSH_VARIANTS.
*/
