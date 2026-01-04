/**
 * FIX 2: DISTRIBUZIONE INTELLIGENTE CORRETTIVI
 * 
 * PROBLEMA: Gli esercizi correttivi vengono aggiunti a TUTTI i giorni.
 * Con 3 zone dolenti e 6 giorni/settimana = 36 esercizi correttivi/settimana.
 * Troppo volume correttivo, poco volume allenante.
 * 
 * SOLUZIONE:
 * 1. Distribuire i correttivi sui giorni in modo intelligente
 * 2. Max 2 correttivi per giorno
 * 3. Ogni correttivo appare 2-3x/settimana (frequenza ottimale)
 * 4. Priorità ai correttivi per zone con severità maggiore
 * 
 * COME APPLICARE:
 * Sostituire la logica di aggiunta correttivi in tutte le funzioni generate*Day*
 * in weeklySplitGenerator.ts
 */

import { Exercise, DayWorkout } from '../types';
import { NormalizedPainArea, getCorrectiveExercises } from './painManagement';

// ============================================================
// CONFIGURAZIONE
// ============================================================

/**
 * Configurazione distribuzione correttivi
 */
const CORRECTIVE_CONFIG = {
  maxPerDay: 2,              // Max correttivi per sessione
  minWeeklyFrequency: 2,     // Ogni correttivo almeno 2x/settimana
  maxWeeklyFrequency: 3,     // Max 3x/settimana per evitare overload
  prioritizeBySeverity: true, // Correttivi per zone più dolorose hanno priorità
};

/**
 * Mapping zona dolore → giorni consigliati
 * Basato su quando i muscoli NON sono affaticati dal workout principale
 */
const PAIN_ZONE_TO_OPTIMAL_DAYS: Record<string, string[]> = {
  // Zone lower body → meglio nei giorni upper o rest
  knee: ['upper', 'push', 'pull'],
  hip: ['upper', 'push', 'pull'],
  ankle: ['upper', 'push', 'pull'],
  lower_back: ['upper', 'push'],
  
  // Zone upper body → meglio nei giorni lower o rest
  shoulder: ['lower', 'legs', 'gambe'],
  wrist: ['lower', 'legs', 'gambe'],
  elbow: ['lower', 'legs', 'gambe'],
  
  // Zone "centrali" → distribuire uniformemente
  cervical: ['any'],
  neck: ['any'],
  back: ['lower', 'legs'], // Back generico, non lower back
};

// ============================================================
// TIPI
// ============================================================

interface CorrectiveAssignment {
  exercise: Exercise;
  painArea: string;
  severity: number;
  assignedDays: number[]; // Indici dei giorni
}

interface DayType {
  dayIndex: number;
  type: 'full_body' | 'upper' | 'lower' | 'push' | 'pull' | 'legs';
}

// ============================================================
// FUNZIONI HELPER
// ============================================================

/**
 * Determina il tipo di giorno dal nome
 */
function getDayType(dayName: string): 'full_body' | 'upper' | 'lower' | 'push' | 'pull' | 'legs' {
  const lower = dayName.toLowerCase();
  
  if (lower.includes('full body')) return 'full_body';
  if (lower.includes('upper')) return 'upper';
  if (lower.includes('lower') || lower.includes('gambe') || lower.includes('legs')) return 'lower';
  if (lower.includes('push')) return 'push';
  if (lower.includes('pull')) return 'pull';
  
  return 'full_body'; // Default
}

/**
 * Verifica se un giorno è ottimale per un correttivo di una certa zona
 */
function isDayOptimalForZone(dayType: string, painZone: string): boolean {
  const optimalDays = PAIN_ZONE_TO_OPTIMAL_DAYS[painZone];
  
  if (!optimalDays || optimalDays.includes('any')) {
    return true; // Può andare ovunque
  }
  
  return optimalDays.some(optimal => dayType.includes(optimal));
}

/**
 * Ordina le zone dolore per severità (più severe prima)
 */
function sortPainAreasBySeverity(painAreas: NormalizedPainArea[]): NormalizedPainArea[] {
  return [...painAreas].sort((a, b) => {
    // Severity più alta = priorità maggiore
    const sevA = a.severity || 5;
    const sevB = b.severity || 5;
    return sevB - sevA;
  });
}

// ============================================================
// FUNZIONE PRINCIPALE
// ============================================================

/**
 * Genera e distribuisce i correttivi in modo intelligente sui giorni della settimana
 * 
 * @param painAreas - Zone di dolore con severità
 * @param days - Array dei giorni workout (verrà modificato in place)
 * @param translateFn - Funzione per tradurre nomi esercizi
 */
export function distributeCorrectivesIntelligently(
  painAreas: NormalizedPainArea[],
  days: DayWorkout[],
  translateFn: (name: string) => string = (n) => n
): void {
  if (!painAreas || painAreas.length === 0) {
    console.log('✅ Nessuna zona dolente, skip correttivi');
    return;
  }
  
  const numDays = days.length;
  console.log(`🔧 Distribuzione correttivi per ${painAreas.length} zone su ${numDays} giorni`);
  
  // 1. Ordina per severità
  const sortedPainAreas = CORRECTIVE_CONFIG.prioritizeBySeverity
    ? sortPainAreasBySeverity(painAreas)
    : painAreas;
  
  // 2. Genera tutti i correttivi potenziali
  const allCorrectiveAssignments: CorrectiveAssignment[] = [];
  
  for (const painEntry of sortedPainAreas) {
    const correctives = getCorrectiveExercises(painEntry.area);
    
    for (const correctiveName of correctives) {
      allCorrectiveAssignments.push({
        exercise: {
          pattern: 'corrective',
          name: translateFn(correctiveName),
          sets: 2,
          reps: '10-15',
          rest: '30s',
          intensity: 'Low',
          notes: `Correttivo per ${painEntry.area}`,
        },
        painArea: painEntry.area,
        severity: painEntry.severity || 5,
        assignedDays: [],
      });
    }
  }
  
  console.log(`   📋 ${allCorrectiveAssignments.length} correttivi totali da distribuire`);
  
  // 3. Determina tipo di ogni giorno
  const dayTypes: DayType[] = days.map((day, idx) => ({
    dayIndex: idx,
    type: getDayType(day.dayName),
  }));
  
  // 4. Traccia quanti correttivi per giorno
  const correctivesPerDay: number[] = new Array(numDays).fill(0);
  
  // 5. Distribuisci ogni correttivo
  for (const assignment of allCorrectiveAssignments) {
    // Calcola frequenza target basata su severità
    const targetFrequency = assignment.severity >= 7
      ? CORRECTIVE_CONFIG.maxWeeklyFrequency  // Severità alta → 3x/settimana
      : CORRECTIVE_CONFIG.minWeeklyFrequency; // Severità normale → 2x/settimana
    
    // Trova i giorni migliori per questo correttivo
    const optimalDays = dayTypes
      .filter(dt => isDayOptimalForZone(dt.type, assignment.painArea))
      .filter(dt => correctivesPerDay[dt.dayIndex] < CORRECTIVE_CONFIG.maxPerDay)
      .sort((a, b) => correctivesPerDay[a.dayIndex] - correctivesPerDay[b.dayIndex]); // Meno affollati prima
    
    // Se non ci sono giorni ottimali, usa qualsiasi giorno con spazio
    const availableDays = optimalDays.length > 0
      ? optimalDays
      : dayTypes
          .filter(dt => correctivesPerDay[dt.dayIndex] < CORRECTIVE_CONFIG.maxPerDay)
          .sort((a, b) => correctivesPerDay[a.dayIndex] - correctivesPerDay[b.dayIndex]);
    
    // Assegna il correttivo ai giorni (rispettando targetFrequency)
    const daysToAssign = Math.min(targetFrequency, availableDays.length);
    
    // Distribuisci uniformemente (non tutti consecutivi)
    const spacing = Math.max(1, Math.floor(availableDays.length / daysToAssign));
    
    for (let i = 0; i < daysToAssign; i++) {
      const dayIdx = availableDays[Math.min(i * spacing, availableDays.length - 1)].dayIndex;
      
      if (correctivesPerDay[dayIdx] < CORRECTIVE_CONFIG.maxPerDay) {
        assignment.assignedDays.push(dayIdx);
        correctivesPerDay[dayIdx]++;
      }
    }
  }
  
  // 6. Aggiungi i correttivi ai giorni
  for (const assignment of allCorrectiveAssignments) {
    for (const dayIdx of assignment.assignedDays) {
      days[dayIdx].exercises.push({ ...assignment.exercise });
    }
  }
  
  // 7. Log risultato
  console.log('   📊 Distribuzione finale:');
  days.forEach((day, idx) => {
    const numCorrectivesInDay = day.exercises.filter(ex => ex.pattern === 'corrective').length;
    console.log(`      ${day.dayName}: ${numCorrectivesInDay} correttivi`);
  });
  
  const totalAssigned = allCorrectiveAssignments.reduce((sum, a) => sum + a.assignedDays.length, 0);
  console.log(`   ✅ Totale: ${totalAssigned} correttivi distribuiti (vs ${allCorrectiveAssignments.length * numDays} se tutti i giorni)`);
}

// ============================================================
// FUNZIONE LEGACY WRAPPER
// ============================================================

/**
 * Drop-in replacement per il codice esistente.
 * Invece di:
 *   const correctives = generateCorrectiveExercises(painAreas);
 *   days.forEach(day => day.exercises.push(...correctives));
 * 
 * Usa:
 *   addCorrectivesToDaysIntelligently(painAreas, days, translateExerciseName);
 */
export function addCorrectivesToDaysIntelligently(
  painAreas: NormalizedPainArea[],
  days: DayWorkout[],
  translateFn?: (name: string) => string
): void {
  distributeCorrectivesIntelligently(painAreas, days, translateFn);
}

// ============================================================
// ESEMPIO DI INTEGRAZIONE
// ============================================================

/**
 * PRIMA (codice attuale):
 * ```typescript
 * // Aggiungi correttivi a tutti i giorni se necessario
 * const correctives = generateCorrectiveExercises(painAreas);
 * days.forEach(day => day.exercises.push(...correctives));
 * ```
 * 
 * DOPO (nuovo codice):
 * ```typescript
 * // Distribuisci correttivi intelligentemente
 * addCorrectivesToDaysIntelligently(painAreas, days, translateExerciseName);
 * ```
 */
