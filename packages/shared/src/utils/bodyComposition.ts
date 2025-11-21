/**
 * BODY COMPOSITION CALCULATIONS
 *
 * Formule validate scientificamente per stima body fat %:
 * - Navy Method (US Navy Body Composition Program)
 * - YMCA Formula
 * - Covert Bailey Formula
 *
 * Accuracy: ±3-4% vs DEXA scan (gold standard)
 *
 * Riferimenti:
 * - Hodgdon & Beckett (1984) - Navy Method validation
 * - YMCA Physical Fitness Specialist Manual
 * - Jackson & Pollock research
 */

// ============================================================================
// TYPES
// ============================================================================

export interface BodyMeasurements {
  gender: 'M' | 'F';
  age: number;
  height: number; // cm
  weight: number; // kg
  neck: number; // cm
  waist: number; // cm (ombelico per uomini)
  hips?: number; // cm (solo donne - punto più largo)
}

export interface BodyCompositionResult {
  bodyFatPercentage: number; // %
  fatMass: number; // kg
  leanMass: number; // kg
  bmi: number;
  category: 'essential' | 'athletic' | 'fitness' | 'average' | 'obese';
  method: 'navy' | 'ymca' | 'simple_bmi';
  interpretation: string;
}

// ============================================================================
// NAVY METHOD (Most Accurate with Circumferences)
// ============================================================================

/**
 * Navy Method - Formula validata US Navy
 *
 * UOMINI:
 * BF% = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
 *
 * DONNE:
 * BF% = 163.205 × log10(waist + hips - neck) - 97.684 × log10(height) - 78.387
 *
 * Accuracy: ±3.5% vs DEXA
 */
export function calculateBodyFatNavy(measurements: BodyMeasurements): number {
  const { gender, height, neck, waist, hips } = measurements;

  if (gender === 'M') {
    // UOMINI: BF% = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
    const bf =
      86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;

    return Math.max(3, Math.min(50, bf)); // Clamp 3-50%
  } else {
    // DONNE: BF% = 163.205 × log10(waist + hips - neck) - 97.684 × log10(height) - 78.387
    if (!hips) {
      throw new Error('Hips measurement required for women (Navy Method)');
    }

    const bf =
      163.205 * Math.log10(waist + hips - neck) -
      97.684 * Math.log10(height) -
      78.387;

    return Math.max(10, Math.min(60, bf)); // Clamp 10-60%
  }
}

// ============================================================================
// YMCA FORMULA (Simpler - Solo Vita e Peso)
// ============================================================================

/**
 * YMCA Formula - Più semplice, solo circonferenza vita
 *
 * Accuracy: ±4-5% vs DEXA (meno accurata del Navy)
 */
export function calculateBodyFatYMCA(measurements: BodyMeasurements): number {
  const { gender, weight, waist } = measurements;

  if (gender === 'M') {
    // UOMINI: BF% = (4.15 × waist) - (0.082 × weight) - 98.42
    const bf = 4.15 * waist - 0.082 * weight - 98.42;
    return Math.max(3, Math.min(50, bf));
  } else {
    // DONNE: BF% = (4.15 × waist) - (0.082 × weight) - 76.76
    const bf = 4.15 * waist - 0.082 * weight - 76.76;
    return Math.max(10, Math.min(60, bf));
  }
}

// ============================================================================
// BMI-BASED ESTIMATION (Least Accurate - Fallback)
// ============================================================================

/**
 * Stima BF% da BMI usando formule Deurenberg et al. (1991)
 *
 * BF% = 1.20 × BMI + 0.23 × age - 10.8 × sex - 5.4
 * (sex = 1 per uomini, 0 per donne)
 *
 * Accuracy: ±8-10% (NON accurata per atleti o individui muscolosi)
 */
export function calculateBodyFatFromBMI(
  bmi: number,
  age: number,
  gender: 'M' | 'F'
): number {
  const sexFactor = gender === 'M' ? 1 : 0;
  const bf = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;

  return Math.max(gender === 'M' ? 3 : 10, Math.min(gender === 'M' ? 50 : 60, bf));
}

// ============================================================================
// HELPER: Calcola BMI
// ============================================================================

export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightMeters = height / 100;
  return weight / (heightMeters * heightMeters);
}

// ============================================================================
// CATEGORIZZAZIONE BODY FAT
// ============================================================================

export function categorizeBodyFat(
  bf: number,
  gender: 'M' | 'F'
): BodyCompositionResult['category'] {
  if (gender === 'M') {
    // UOMINI
    if (bf < 6) return 'essential'; // Essenziale (atleti elite)
    if (bf < 14) return 'athletic'; // Atletico
    if (bf < 18) return 'fitness'; // Fitness
    if (bf < 25) return 'average'; // Media
    return 'obese'; // Obesità
  } else {
    // DONNE
    if (bf < 14) return 'essential'; // Essenziale (atlete elite)
    if (bf < 21) return 'athletic'; // Atletico
    if (bf < 25) return 'fitness'; // Fitness
    if (bf < 32) return 'average'; // Media
    return 'obese'; // Obesità
  }
}

/**
 * Interpretazione testuale categoria
 */
export function interpretBodyFatCategory(
  category: BodyCompositionResult['category'],
  gender: 'M' | 'F'
): string {
  const ranges = {
    M: {
      essential: '< 6%',
      athletic: '6-13%',
      fitness: '14-17%',
      average: '18-24%',
      obese: '> 25%'
    },
    F: {
      essential: '< 14%',
      athletic: '14-20%',
      fitness: '21-24%',
      average: '25-31%',
      obese: '> 32%'
    }
  };

  const descriptions = {
    essential: 'Grasso essenziale - Livello molto basso, tipico di atleti elite. Mantenere solo per brevi periodi.',
    athletic: 'Atletico - Ottimo per performance sportive. Massa muscolare elevata visibile.',
    fitness: 'Fitness - Buon livello di salute e forma fisica. Addominali visibili.',
    average: 'Media - Range salutare per popolazione generale. Forma fisica accettabile.',
    obese: 'Obesità - Livello elevato. Rischi per la salute. Consigliato deficit calorico e attività fisica.'
  };

  return `${ranges[gender][category]} - ${descriptions[category]}`;
}

// ============================================================================
// MAIN FUNCTION: Calcola Body Composition Completa
// ============================================================================

/**
 * Calcola composizione corporea completa con metodo Navy (preferito)
 *
 * FALLBACK:
 * - Se mancano circonferenze → usa YMCA
 * - Se mancano anche quelle → usa BMI
 */
export function calculateBodyComposition(
  measurements: BodyMeasurements
): BodyCompositionResult {
  const { gender, age, height, weight, neck, waist, hips } = measurements;

  // Calcola BMI sempre
  const bmi = calculateBMI(weight, height);

  let bodyFatPercentage: number;
  let method: BodyCompositionResult['method'];

  // PRIORITÀ 1: Navy Method (più accurato)
  if (neck && waist && (gender === 'M' || hips)) {
    try {
      bodyFatPercentage = calculateBodyFatNavy(measurements);
      method = 'navy';
    } catch (error) {
      console.warn('Navy method failed, falling back to YMCA', error);
      bodyFatPercentage = calculateBodyFatYMCA(measurements);
      method = 'ymca';
    }
  }
  // PRIORITÀ 2: YMCA (se manca neck o hips)
  else if (waist) {
    bodyFatPercentage = calculateBodyFatYMCA(measurements);
    method = 'ymca';
  }
  // PRIORITÀ 3: BMI fallback (meno accurato)
  else {
    bodyFatPercentage = calculateBodyFatFromBMI(bmi, age, gender);
    method = 'simple_bmi';
  }

  // Calcola masse
  const fatMass = (weight * bodyFatPercentage) / 100;
  const leanMass = weight - fatMass;

  // Categoria
  const category = categorizeBodyFat(bodyFatPercentage, gender);
  const interpretation = interpretBodyFatCategory(category, gender);

  return {
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10, // 1 decimale
    fatMass: Math.round(fatMass * 10) / 10,
    leanMass: Math.round(leanMass * 10) / 10,
    bmi: Math.round(bmi * 10) / 10,
    category,
    method,
    interpretation
  };
}

// ============================================================================
// VALIDAZIONE MISURE
// ============================================================================

/**
 * Valida che le misure siano plausibili
 */
export function validateMeasurements(measurements: BodyMeasurements): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Altezza plausibile (120-250 cm)
  if (measurements.height < 120 || measurements.height > 250) {
    errors.push('Altezza non plausibile (range: 120-250 cm)');
  }

  // Peso plausibile (30-300 kg)
  if (measurements.weight < 30 || measurements.weight > 300) {
    errors.push('Peso non plausibile (range: 30-300 kg)');
  }

  // Collo plausibile (20-60 cm)
  if (measurements.neck && (measurements.neck < 20 || measurements.neck > 60)) {
    errors.push('Circonferenza collo non plausibile (range: 20-60 cm)');
  }

  // Vita plausibile (40-200 cm)
  if (measurements.waist && (measurements.waist < 40 || measurements.waist > 200)) {
    errors.push('Circonferenza vita non plausibile (range: 40-200 cm)');
  }

  // Fianchi plausibili (50-200 cm)
  if (measurements.hips && (measurements.hips < 50 || measurements.hips > 200)) {
    errors.push('Circonferenza fianchi non plausibile (range: 50-200 cm)');
  }

  // Navy Method validation: waist > neck
  if (measurements.waist && measurements.neck && measurements.waist <= measurements.neck) {
    errors.push('Circonferenza vita deve essere maggiore del collo');
  }

  // Donne: hips > waist (generalmente)
  if (
    measurements.gender === 'F' &&
    measurements.hips &&
    measurements.waist &&
    measurements.hips < measurements.waist
  ) {
    errors.push('Circonferenza fianchi generalmente maggiore della vita (donne)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  calculateBodyComposition,
  calculateBodyFatNavy,
  calculateBodyFatYMCA,
  calculateBodyFatFromBMI,
  calculateBMI,
  categorizeBodyFat,
  interpretBodyFatCategory,
  validateMeasurements
};
