// ===== ADAPTFLOW 2.0 - EXERCISE SUBSTITUTIONS & GIANT SETS =====
// Sistema migliorato con selezione intelligente basata su equipment disponibile
import { EXERCISE_DATABASE, checkEquipment, getDefaultSets, getDefaultReps, getDefaultRest } from './exerciseDatabase.js';
// Backward compatibility con HOME_ALTERNATIVES (deprecato, usare selectExerciseVariant)
export const HOME_ALTERNATIVES = {
    'Squat': 'Squat a Corpo Libero',
    'Front Squat': 'Goblet Squat',
    'Panca Piana': 'Push-up',
    'Panca Inclinata': 'Pike Push-up',
    'Stacco': 'GIANT_SET_DEADLIFT',
    'Stacco Rumeno': 'Single Leg RDL',
    'Trazioni': 'GIANT_SET_PULLUP',
    'Lat Machine': 'GIANT_SET_PULLUP',
    'Pulley': 'GIANT_SET_PULLUP',
    'Rematore Bilanciere': 'Inverted Row',
    'Rematore Manubrio': 'Plank Row',
    'Military Press': 'Pike Push-up',
    'Alzate Laterali': 'Band Lateral Raise',
    'Leg Press': 'Bulgarian Split Squat',
    'Leg Curl': 'Nordic Curl',
    'Dips': 'Diamond Push-up',
    'Croci Cavi': 'Wide Push-up',
};
// ===== GIANT SETS MIGLIORATI =====
export function createDeadliftGiantSet(goal, level = 'intermediate') {
    const goalType = goal;
    const configs = {
        strength: { rounds: 4, rest: 240, reps: { jump: "6-8", nordic: "4-6", gm: "8-10", hang: "30s" } },
        muscle_gain: { rounds: 4, rest: 150, reps: { jump: "10-12", nordic: "8-10", gm: "12-15", hang: "45s" } },
        weight_loss: { rounds: 5, rest: 90, reps: { jump: "15", nordic: "10", gm: "20", hang: "30s" } },
        toning: { rounds: 4, rest: 150, reps: { jump: "12", nordic: "8-10", gm: "15", hang: "45s" } },
        performance: { rounds: 4, rest: 180, reps: { jump: "8-10", nordic: "6-8", gm: "10-12", hang: "40s" } },
        endurance: { rounds: 5, rest: 60, reps: { jump: "15-20", nordic: "12", gm: "20-25", hang: "45s" } },
        general_fitness: { rounds: 3, rest: 120, reps: { jump: "10", nordic: "8", gm: "12", hang: "30s" } },
        disability: { rounds: 3, rest: 180, reps: { jump: "Skip", nordic: "6-8 assistiti", gm: "10", hang: "20s" } },
        pregnancy: { rounds: 2, rest: 120, reps: { jump: "Skip", nordic: "Skip", gm: "10-12", hang: "20s" } }
    };
    const config = configs[goal] || configs['muscle_gain'];
    return {
        id: `giant_deadlift_${goal}`,
        name: `Giant Set Stacco - ${goal === 'strength' ? 'Forza' : goal === 'muscle_gain' ? 'Massa' : goal === 'performance' ? 'Performance' : 'Dimagrimento'}`,
        type: 'giant_set',
        rounds: config.rounds,
        restBetweenRounds: config.rest,
        exercises: [
            {
                name: "Squat Jump",
                muscleGroup: "Quads + Esplosività",
                reps: config.reps.jump,
                rest: 0,
                tempo: "Esplosivo",
                notes: "Simula la fase di strappo dello stacco - quadricipiti e potenza"
            },
            {
                name: "Nordic Curl",
                muscleGroup: "Femorali",
                reps: config.reps.nordic,
                rest: 0,
                tempo: "4-5s eccentrica",
                notes: "Femorali - eccentrico controllato, massima tensione"
            },
            {
                name: "Good Morning",
                muscleGroup: "Erettori + Glutei",
                reps: config.reps.gm,
                rest: 0,
                tempo: "Controllato",
                notes: "Erettori spinali + glutei - cerniera anca. Usa zaino carico se disponibile"
            },
            {
                name: "Dead Hang",
                muscleGroup: "Grip + Trap",
                reps: config.reps.hang,
                rest: 0,
                notes: "Grip e trapezi - presa massimale, scapole attive"
            }
        ],
        totalNotes: `⚠️ LO STACCO CON BILANCIERE È INSOSTITUIBILE. Questo giant set simula la fatica sistemica e l'effort tramite lavoro ad alta densità (ZERO pause tra esercizi), ma NON può replicare la biomeccanica e il carico massimale dello stacco tradizionale. ${config.rounds} giri totali con ${config.rest}s di recupero TRA i giri.`
    };
}
export function createPullupGiantSet(goal, level = 'intermediate') {
    const rounds = goal === 'weight_loss' ? 5 : goal === 'muscle_gain' || goal === 'toning' ? 4 : 3;
    const rest = goal === 'weight_loss' ? 90 : goal === 'strength' || goal === 'performance' ? 180 : 120;
    const repsMultiplier = goal === 'muscle_gain' || goal === 'toning' ? 1.3 : goal === 'weight_loss' ? 1.5 : 1;
    return {
        id: 'giant_pullup_floor',
        name: 'Giant Set Dorsale (Floor Work)',
        type: 'giant_set',
        rounds,
        restBetweenRounds: rest,
        exercises: [
            {
                name: "Floor Slide Rows",
                muscleGroup: "Dorsali + Scapole",
                reps: `${Math.round(12 * repsMultiplier)}-${Math.round(15 * repsMultiplier)}`,
                rest: 0,
                tempo: "3s eccentrica",
                notes: "Sdraiato prono, mani avanti, 'scivola' indietro trascinandoti con dorsali (come passo giaguaro ma con DUE BRACCIA INSIEME)"
            },
            {
                name: "Scapular Push-up",
                muscleGroup: "Scapole",
                reps: `${Math.round(15 * repsMultiplier)}`,
                rest: 0,
                tempo: "Controllato",
                notes: "In posizione plank, retrai/protrarre scapole - attivazione scapolare pura"
            },
            {
                name: "Superman Hold",
                muscleGroup: "Erettori + Dorsali",
                reps: `${Math.round(30 * repsMultiplier)}s`,
                rest: 0,
                notes: "Isometrica: braccia estese avanti, tieni in alto - dorsali + erettori"
            },
            {
                name: "Hollow Body Hold",
                muscleGroup: "Core",
                reps: "30s",
                rest: 0,
                notes: "Posizione antagonista - recupero attivo per core anteriore"
            }
        ],
        totalNotes: `⚠️ LE TRAZIONI sono insostituibili per sviluppo dorsale width. Questo giant set allena attivazione scapolare, dorsali e core senza sbarra, ma non può sostituire il pattern di trazione verticale con carico del corpo. Se possibile, installa una sbarra! ${rounds} giri con ${rest}s recupero.`
    };
}
/**
 * Seleziona la variante corretta dell'esercizio basandosi su:
 * - Location (gym/home)
 * - Equipment disponibile
 * - Peso minimo richiesto
 * - Goal dell'utente
 */
export function selectExerciseVariant(exerciseName, location, equipment, goal, assessmentWeight) {
    const goalType = goal;
    const variants = EXERCISE_DATABASE[exerciseName];
    if (!variants) {
        // Fallback: esercizio non trovato, restituisci versione base
        return {
            id: exerciseName.toLowerCase().replace(/\s/g, '_'),
            name: exerciseName,
            sets: getDefaultSets(goalType),
            reps: getDefaultReps(goalType),
            rest: getDefaultRest(goalType),
            category: 'compound'
        };
    }
    // CASO 1: PALESTRA (o mixed che equivale a gym per selezione)
    if (location === 'gym' || location === 'mixed') {
        const gymVariant = variants.gym;
        return {
            id: exerciseName.toLowerCase().replace(/\s/g, '_'),
            name: gymVariant.name,
            sets: getDefaultSets(goalType),
            reps: getDefaultReps(goalType),
            rest: getDefaultRest(goalType),
            weight: assessmentWeight ? Math.round(assessmentWeight * gymVariant.weightMultiplier * 10) / 10 : undefined,
            category: 'compound'
        };
    }
    // CASO 2: CASA - verifica equipment disponibile
    const homeWithEq = variants.homeWithEquipment;
    const homeBodyweight = variants.homeBodyweight;
    
    // ✅ CORREZIONE: Se equipment.none === true, SALTA direttamente a bodyweight
    if (equipment.none === true) {
        // ✅ NEW: Supporta homeBodyweight goal-aware
        let bodyweightVariantName;
        
        // Se homeBodyweight è un oggetto (goal-aware), seleziona per goal
        if (typeof homeBodyweight === 'object' && !homeBodyweight.name && !homeBodyweight.isGiantSet) {
            bodyweightVariantName = homeBodyweight[goalType] || homeBodyweight['general_fitness'];
            console.log(`[VARIANT] Goal-aware bodyweight: ${goalType} → ${bodyweightVariantName}`);
        } else {
            // Fallback: vecchia struttura (retrocompatibilità)
            bodyweightVariantName = homeBodyweight.name || homeBodyweight;
        }
        
        // Gestione Giant Sets
        if (bodyweightVariantName === 'GIANT_SET_DEADLIFT') {
            return createDeadliftGiantSet(goal, 'intermediate');
        }
        if (bodyweightVariantName === 'GIANT_SET_PULLUP') {
            return createPullupGiantSet(goal, 'intermediate');
        }
        
        return {
            id: exerciseName.toLowerCase().replace(/\s/g, '_'),
            name: bodyweightVariantName,
            sets: getDefaultSets(goalType, true),
            reps: getDefaultReps(goalType, true),
            rest: getDefaultRest(goalType) - 20,
            category: 'compound',
            notes: `${goalType.charAt(0).toUpperCase() + goalType.slice(1).replace('_', ' ')} - Variante bodyweight ottimizzata`
        };
    }
    // Controlla se ha equipment necessario (AND+OR logic)
    const hasRequiredEquipment = checkEquipment(homeWithEq.equipment, equipment);
    // Identifica quale attrezzo è effettivamente disponibile e il suo peso max
    let maxAvailableWeight = 0;
    let equipmentType = '';
    // Trova il gruppo soddisfatto e identifica l'attrezzo disponibile
    for (const group of homeWithEq.equipment) {
        // Controlla se questo gruppo è soddisfatto
        const groupSatisfied = group.every(item => {
            switch (item) {
                case 'barbell': return equipment.barbell === true;
                case 'dumbbell': return !!(equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0);
                case 'kettlebell': return !!(equipment.kettlebellKg && equipment.kettlebellKg.length > 0);
                case 'band': return equipment.bands === true;
                case 'pullup_bar': return equipment.pullupBar === true;
                case 'bench': return equipment.bench === true;
                case 'none': return true;
                default: return false;
            }
        });
        if (groupSatisfied) {
            // Identifica quale attrezzo con peso è disponibile in questo gruppo
            if (group.includes('dumbbell') && equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0) {
                maxAvailableWeight = equipment.dumbbellMaxKg;
                equipmentType = 'dumbbells';
                break;
            }
            else if (group.includes('kettlebell') && equipment.kettlebellKg && equipment.kettlebellKg.length > 0) {
                maxAvailableWeight = Math.max(...equipment.kettlebellKg);
                equipmentType = 'kettlebells';
                break;
            }
            else if (group.includes('barbell') && equipment.barbell) {
                maxAvailableWeight = 100; // Assume 100kg disponibili con barbell
                equipmentType = 'barbell';
                break;
            }
            else if (group.includes('band') || group.includes('pullup_bar') || group.includes('none')) {
                // Attrezzi bodyweight/band - nessun peso
                maxAvailableWeight = 0;
                equipmentType = group.includes('band') ? 'bands' : group.includes('pullup_bar') ? 'pullup_bar' : 'bodyweight';
                break;
            }
        }
    }
    const hasMinWeight = maxAvailableWeight >= (homeWithEq.minWeightKg || 0);
    // CASO 2A: Ha attrezzatura adeguata
    if (hasRequiredEquipment && hasMinWeight) {
        const plannedWeight = assessmentWeight ? assessmentWeight * homeWithEq.weightMultiplier : maxAvailableWeight;
        const availableWeight = Math.min(maxAvailableWeight, plannedWeight);
        return {
            id: exerciseName.toLowerCase().replace(/\s/g, '_'),
            name: homeWithEq.name,
            sets: getDefaultSets(goalType),
            reps: getDefaultReps(goalType),
            rest: getDefaultRest(goalType),
            weight: Math.round(availableWeight * 10) / 10,
            category: 'compound',
            notes: availableWeight < plannedWeight * 0.9 ?
                `⚠️ Peso disponibile ridotto: ${availableWeight}kg ${equipmentType} vs ${Math.round(plannedWeight)}kg pianificato` :
                undefined
        };
    }
    // CASO 2B: NO attrezzatura - bodyweight o giant set
    if (homeBodyweight.isGiantSet) {
        if (homeBodyweight.name === 'GIANT_SET_DEADLIFT') {
            return createDeadliftGiantSet(goal, 'intermediate');
        }
        if (homeBodyweight.name === 'GIANT_SET_PULLUP') {
            return createPullupGiantSet(goal, 'intermediate');
        }
    }
    // Esercizio bodyweight normale
    return {
        id: exerciseName.toLowerCase().replace(/\s/g, '_'),
        name: homeBodyweight.name,
        sets: getDefaultSets(goalType, true),
        reps: getDefaultReps(goalType, true),
        rest: getDefaultRest(goalType) - 20,
        category: 'compound',
        notes: 'Esercizio a corpo libero - compensato con volume aumentato'
    };
}
// ===== COMPATIBILITÀ PROGRAMGENERATOR =====
/**
 * Funzione di compatibilità per ProgramGenerator
 * Restituisce esercizio adattato o GiantSet
 */
export function getExerciseForLocation(exerciseName, location, equipment, goal, level) {
    const eq = equipment || { barbell: false, dumbbellMaxKg: 0, kettlebellKg: [], bands: false, pullupBar: false, bench: false, none: false };
    const result = selectExerciseVariant(exerciseName, location, eq, goal);
    // Se è GiantSet, restituiscilo
    if ('rounds' in result) {
        return result;
    }
    // Altrimenti restituisci il nome dell'esercizio
    return result.name;
}
/**
 * Calibra l'effort quando il peso disponibile è inferiore al pianificato
 * MIGLIORAMENTO: Aggiunto warning per peso < 50%
 */
export function calibrateEffort(plannedWeight, availableWeight, goal) {
    const ratio = availableWeight / plannedWeight;
    // Peso OK (90%+)
    if (ratio >= 0.9) {
        return {
            setsMultiplier: 1,
            repsMultiplier: 1,
            restAdjustment: 0,
            notes: ''
        };
    }
    // NUOVO: Peso molto ridotto (<50%) - WARNING
    if (ratio < 0.5) {
        return {
            setsMultiplier: 1,
            repsMultiplier: 1,
            restAdjustment: 0,
            notes: `⚠️ ATTENZIONE: Peso disponibile troppo basso (${availableWeight}kg vs ${plannedWeight}kg = ${Math.round(ratio * 100)}%). Considera di cambiare esercizio o utilizzare tecniche avanzate (rest-pause, drop sets, super slow).`
        };
    }
    // Peso ridotto (50-90%) - calibrazione per obiettivo
    switch (goal) {
        case 'strength':
        case 'performance':
            return {
                setsMultiplier: 1.5,
                repsMultiplier: 1,
                restAdjustment: 30,
                tempo: "4-0-1-0",
                notes: `⚡ Compensazione FORZA: +50% serie, tempo eccentrico lento (4s), recupero maggiore (+30s). Peso: ${availableWeight}kg disponibile vs ${plannedWeight}kg pianificato.`
            };
        case 'muscle_gain':
        case 'toning':
            return {
                setsMultiplier: 1,
                repsMultiplier: 1.5,
                restAdjustment: 0,
                tempo: "3-1-1-0",
                notes: `⚡ Compensazione MASSA: +50% ripetizioni, TUT elevato (3s eccentrica, 1s pausa), stesso recupero. Peso: ${availableWeight}kg disponibile vs ${plannedWeight}kg pianificato.`
            };
        case 'weight_loss':
            return {
                setsMultiplier: 1.3,
                repsMultiplier: 1.2,
                restAdjustment: -20,
                tempo: "Esplosivo dove possibile",
                notes: `⚡ Compensazione DIMAGRIMENTO: +30% serie, +20% reps, recupero ridotto (-20s) per aumentare densità metabolica. Peso: ${availableWeight}kg disponibile vs ${plannedWeight}kg pianificato.`
            };
        case 'disability':
            return {
                setsMultiplier: 1,
                repsMultiplier: 1.2,
                restAdjustment: 30,
                tempo: "Controllato",
                notes: `⚡ Compensazione DISABILITÀ: +20% reps con tempo controllato, +30s recupero per sicurezza. Focus su tecnica perfetta. Peso: ${availableWeight}kg disponibile vs ${plannedWeight}kg pianificato.`
            };
        case 'pregnancy':
            return {
                setsMultiplier: 1,
                repsMultiplier: 1.1,
                restAdjustment: 20,
                tempo: "Moderato",
                notes: `⚡ Compensazione GRAVIDANZA: +10% reps moderate, +20s recupero. Evitare sforzi eccessivi. Peso: ${availableWeight}kg disponibile vs ${plannedWeight}kg pianificato.`
            };
        default:
            return {
                setsMultiplier: 1.2,
                repsMultiplier: 1.2,
                restAdjustment: 0,
                notes: `⚡ Peso ridotto: compensato con +20% volume. ${availableWeight}kg disponibile vs ${plannedWeight}kg pianificato.`
            };
    }
}
