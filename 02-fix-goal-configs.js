// ============================================================================
// FILE: api/lib/GOAL_CONFIGS_COMPLETE_CJS.js
// SEZIONE: GOAL_CONFIGS (alla fine dell'oggetto, dopo motor_recovery)
// AZIONE: AGGIUNGI queste due configurazioni PRIMA della chiusura }
// ============================================================================

// ... codice esistente ...

  motor_recovery: {
    name: 'Recupero Motorio',
    repsRange: '8-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-controlled',
    focus: 'rom_progressive',
    setsMultiplier: 0.8,
    notes: 'Entro limiti dolore, progressione: difficoltà → carico → ROM',
    homeStrategy: 'mobility_strength',
    painThreshold: true,
    progressionOrder: ['difficulty', 'load', 'rom']
  },

  // ✅ FIX BUG: Configurazione per goal "benessere" / "generale"
  // MANCAVA COMPLETAMENTE - causava fallback a muscle_gain con parametri forza
  general_fitness: {
    name: 'Fitness Generale / Benessere',
    repsRange: '10-15',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 45 },
    intensity: 'moderate',
    focus: 'balanced_health',
    setsMultiplier: 1.0,
    notes: 'Programma bilanciato per salute e benessere generale. Mix di forza funzionale, mobilità e conditioning.',
    homeStrategy: 'balanced_bodyweight',
    targetRIR: 3,
    includesCardio: false,
    includesMobility: true,
    mobilityFrequency: 2,
    // Specifico per benessere: non spingere al limite
    maxRPE: 7,
    deloadFrequency: 5 // Deload ogni 5 settimane invece di 4
  },

  // ✅ FIX: Configurazione per goal "resistenza" / "corsa"
  endurance: {
    name: 'Resistenza / Running Support',
    repsRange: '15-20',
    rest: { compound: 60, accessory: 45, isolation: 45, core: 30 },
    intensity: 'moderate',
    focus: 'muscular_endurance',
    setsMultiplier: 0.9,
    notes: 'Alta densità, recuperi brevi. Supporto alla corsa con focus su prevenzione infortuni.',
    homeStrategy: 'high_rep_circuits',
    targetRIR: 2,
    includesCardio: true,
    cardioFrequency: 3,
    // Specifico per runner
    legEmphasis: 'eccentric_control', // Nordic curls, single leg work
    coreEmphasis: 'anti_rotation' // Pallof, bird dogs
  }
}

// ============================================================================
// NOTA: Assicurati che l'export sia corretto:
// export const GOAL_CONFIGS = { ... }
// oppure
// module.exports = { GOAL_CONFIGS, ... }
// ============================================================================
