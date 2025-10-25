// ===== ADAPTFLOW 2.0 - EXERCISE DATABASE =====
// Sistema intelligente di selezione esercizi basato su location, equipment e peso disponibile

export type Goal = 'strength' | 'muscle_gain' | 'weight_loss' | 'endurance' | 'performance' | 'general_fitness' | 'toning' | 'disability' | 'pregnancy';
export type Location = 'gym' | 'home' | 'mixed';
export type EquipmentType = 'barbell' | 'dumbbell' | 'kettlebell' | 'band' | 'pullup_bar' | 'bench' | 'none';

export interface UserEquipment {
  barbell?: boolean;
  dumbbellMaxKg?: number;
  kettlebellKg?: number[];
  bands?: boolean;
  pullupBar?: boolean;
  bench?: boolean;
}

export interface ExerciseVariant {
  gym: {
    name: string;
    equipment: EquipmentType[][]; // Array di gruppi: ogni gruppo è AND, tra gruppi è OR
    weightMultiplier: number;
  };
  homeWithEquipment: {
    name: string;
    equipment: EquipmentType[][]; // Array di gruppi: ogni gruppo è AND, tra gruppi è OR
    weightMultiplier: number;
    minWeightKg?: number;
  };
  homeBodyweight: {
    name: string;
    isGiantSet?: boolean;
  };
}

// ===== DATABASE ESERCIZI COMPLETO =====

export const EXERCISE_DATABASE: Record<string, ExerciseVariant> = {
  
  // GAMBE - SQUAT
  'Squat': {
    gym: {
      name: "Squat Bilanciere",
      equipment: [['barbell']],
      weightMultiplier: 0.7
    },
    homeWithEquipment: {
      name: "Goblet Squat",
      equipment: [['dumbbell'], ['kettlebell']], // dumbbell OR kettlebell
      weightMultiplier: 0.4,
      minWeightKg: 12
    },
    homeBodyweight: {
      name: "Squat a Corpo Libero",
      isGiantSet: false
    }
  },

  'Front Squat': {
    gym: {
      name: "Front Squat",
      equipment: [['barbell']],
      weightMultiplier: 0.6
    },
    homeWithEquipment: {
      name: "Goblet Squat",
      equipment: [['dumbbell'], ['kettlebell']], // dumbbell OR kettlebell
      weightMultiplier: 0.4,
      minWeightKg: 12
    },
    homeBodyweight: {
      name: "Squat Jump + Pause Squat",
      isGiantSet: false
    }
  },

  // GAMBE - STACCO
  'Stacco': {
    gym: {
      name: "Stacco da Terra",
      equipment: [['barbell']],
      weightMultiplier: 0.7
    },
    homeWithEquipment: {
      name: "Stacco Rumeno Manubri",
      equipment: [['dumbbell']], // solo dumbbell
      weightMultiplier: 0.5,
      minWeightKg: 20
    },
    homeBodyweight: {
      name: "GIANT_SET_DEADLIFT",
      isGiantSet: true
    }
  },

  'Stacco Rumeno': {
    gym: {
      name: "Stacco Rumeno Bilanciere",
      equipment: [['barbell']],
      weightMultiplier: 0.6
    },
    homeWithEquipment: {
      name: "Stacco Rumeno Manubri",
      equipment: [['dumbbell']], // solo dumbbell
      weightMultiplier: 0.5,
      minWeightKg: 15
    },
    homeBodyweight: {
      name: "Single Leg RDL",
      isGiantSet: false
    }
  },

  // PETTO
  'Panca Piana': {
    gym: {
      name: "Panca Piana Bilanciere",
      equipment: [['barbell', 'bench']], // barbell AND bench
      weightMultiplier: 0.7
    },
    homeWithEquipment: {
      name: "Panca Manubri",
      equipment: [['dumbbell', 'bench']], // dumbbell AND bench
      weightMultiplier: 0.6,
      minWeightKg: 15
    },
    homeBodyweight: {
      name: "Push-up",
      isGiantSet: false
    }
  },

  'Panca Inclinata': {
    gym: {
      name: "Panca Inclinata",
      equipment: [['barbell', 'bench']], // barbell AND bench
      weightMultiplier: 0.6
    },
    homeWithEquipment: {
      name: "Panca Inclinata Manubri",
      equipment: [['dumbbell', 'bench']], // dumbbell AND bench
      weightMultiplier: 0.5,
      minWeightKg: 12
    },
    homeBodyweight: {
      name: "Pike Push-up",
      isGiantSet: false
    }
  },

  'Dips': {
    gym: {
      name: "Dips",
      equipment: [['none']], // bodyweight
      weightMultiplier: 0
    },
    homeWithEquipment: {
      name: "Dips (tra sedie)",
      equipment: [['none']], // bodyweight
      weightMultiplier: 0
    },
    homeBodyweight: {
      name: "Diamond Push-up",
      isGiantSet: false
    }
  },

  // DORSO - VERTICALE
  'Trazioni': {
    gym: {
      name: "Trazioni",
      equipment: [['pullup_bar']],
      weightMultiplier: 0
    },
    homeWithEquipment: {
      name: "Trazioni",
      equipment: [['pullup_bar']],
      weightMultiplier: 0
    },
    homeBodyweight: {
      name: "GIANT_SET_PULLUP",
      isGiantSet: true
    }
  },

  'Pulley': {
    gym: {
      name: "Lat Machine",
      equipment: [['none']], // macchina da palestra
      weightMultiplier: 0.7
    },
    homeWithEquipment: {
      name: "Band Pull-down",
      equipment: [['band']],
      weightMultiplier: 0
    },
    homeBodyweight: {
      name: "GIANT_SET_PULLUP",
      isGiantSet: true
    }
  },

  // DORSO - ORIZZONTALE
  'Rematore Bilanciere': {
    gym: {
      name: "Rematore Bilanciere",
      equipment: [['barbell']],
      weightMultiplier: 0.6
    },
    homeWithEquipment: {
      name: "Rematore Manubrio",
      equipment: [['dumbbell']],
      weightMultiplier: 0.5,
      minWeightKg: 12
    },
    homeBodyweight: {
      name: "Inverted Row",
      isGiantSet: false
    }
  },

  'Rematore Manubrio': {
    gym: {
      name: "Rematore Manubrio",
      equipment: [['dumbbell']],
      weightMultiplier: 0.5
    },
    homeWithEquipment: {
      name: "Rematore Manubrio",
      equipment: [['dumbbell']],
      weightMultiplier: 0.5,
      minWeightKg: 10
    },
    homeBodyweight: {
      name: "Plank Row",
      isGiantSet: false
    }
  },

  // SPALLE
  'Military Press': {
    gym: {
      name: "Military Press Bilanciere",
      equipment: [['barbell']],
      weightMultiplier: 0.5
    },
    homeWithEquipment: {
      name: "Military Press Manubri",
      equipment: [['dumbbell']],
      weightMultiplier: 0.45,
      minWeightKg: 10
    },
    homeBodyweight: {
      name: "Pike Push-up",
      isGiantSet: false
    }
  },

  'Alzate Laterali': {
    gym: {
      name: "Alzate Laterali",
      equipment: [['dumbbell']],
      weightMultiplier: 0.15
    },
    homeWithEquipment: {
      name: "Alzate Laterali Manubri",
      equipment: [['dumbbell']],
      weightMultiplier: 0.15,
      minWeightKg: 5
    },
    homeBodyweight: {
      name: "Band Lateral Raise",
      isGiantSet: false
    }
  },

  'Croci Cavi': {
    gym: {
      name: "Croci ai Cavi",
      equipment: [['none']], // cavi da palestra
      weightMultiplier: 0.3
    },
    homeWithEquipment: {
      name: "Croci con Elastici",
      equipment: [['band']],
      weightMultiplier: 0
    },
    homeBodyweight: {
      name: "Wide Push-up",
      isGiantSet: false
    }
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Verifica se l'equipment è disponibile.
 * Struttura: Array di gruppi AND, tra gruppi è OR
 * Esempio: [['dumbbell', 'bench']] = dumbbell AND bench (required)
 * Esempio: [['dumbbell'], ['kettlebell']] = dumbbell OR kettlebell
 */
export function checkEquipment(required: EquipmentType[][], available: UserEquipment): boolean {
  // Se non c'è equipment richiesto, ritorna true
  if (required.length === 0) {
    return true;
  }
  
  // Controlla se almeno UN gruppo è soddisfatto (OR tra gruppi)
  for (const group of required) {
    // Controlla se TUTTI gli attrezzi del gruppo sono disponibili (AND nel gruppo)
    const groupSatisfied = group.every(item => {
      if (item === 'none') return true;
      
      switch(item) {
        case 'barbell':
          return available.barbell === true;
        case 'dumbbell':
          return !!(available.dumbbellMaxKg && available.dumbbellMaxKg > 0);
        case 'kettlebell':
          return !!(available.kettlebellKg && available.kettlebellKg.length > 0);
        case 'band':
          return available.bands === true;
        case 'pullup_bar':
          return available.pullupBar === true;
        case 'bench':
          return available.bench === true;
        default:
          return false;
      }
    });
    
    // Se questo gruppo è soddisfatto, ritorna true
    if (groupSatisfied) {
      return true;
    }
  }
  
  // Nessun gruppo soddisfatto
  return false;
}

export function getDefaultSets(goal: Goal, isBodyweight: boolean = false): number {
  const base: Record<Goal, number> = {
    strength: 5,
    muscle_gain: 4,
    weight_loss: 4,
    endurance: 3,
    performance: 4,
    general_fitness: 3,
    toning: 4,
    disability: 3, // Volume moderato per disabilità
    pregnancy: 3 // Volume controllato per gravidanza
  };
  
  return base[goal] + (isBodyweight ? 1 : 0);
}

export function getDefaultReps(goal: Goal, isBodyweight: boolean = false): string {
  const base: Record<Goal, string> = {
    strength: isBodyweight ? "8-10" : "3-6",
    muscle_gain: isBodyweight ? "15-20" : "8-12",
    weight_loss: isBodyweight ? "20-25" : "12-15",
    endurance: isBodyweight ? "20-30" : "15-20",
    performance: isBodyweight ? "10-15" : "6-10",
    general_fitness: isBodyweight ? "12-15" : "10-12",
    toning: isBodyweight ? "15-20" : "12-15",
    disability: isBodyweight ? "10-12" : "8-10", // Reps moderate, focus su tecnica
    pregnancy: isBodyweight ? "12-15" : "10-12" // Reps moderate, evitare sfinimento
  };
  
  return base[goal];
}

export function getDefaultRest(goal: Goal, category: 'compound' | 'isolation' = 'compound'): number {
  const base: Record<Goal, number> = {
    strength: category === 'compound' ? 240 : 120,
    muscle_gain: category === 'compound' ? 120 : 60,
    weight_loss: category === 'compound' ? 90 : 45,
    endurance: category === 'compound' ? 60 : 30,
    performance: category === 'compound' ? 180 : 90,
    general_fitness: category === 'compound' ? 90 : 60,
    toning: category === 'compound' ? 60 : 45,
    disability: category === 'compound' ? 120 : 90, // Recupero generoso
    pregnancy: category === 'compound' ? 90 : 60 // Recupero adeguato
  };
  
  return base[goal];
}
