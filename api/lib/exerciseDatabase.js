// ===== ADAPTFLOW 2.0 - EXERCISE DATABASE FIXED =====
// ✅ FIXED: homeBodyweight ora è GOAL-AWARE
// Ogni esercizio ha varianti specifiche per obiettivo

export const EXERCISE_DATABASE = {
    // GAMBE - SQUAT
    'Squat': {
        gym: {
            name: "Squat Bilanciere",
            equipment: [['barbell']],
            weightMultiplier: 0.7
        },
        homeWithEquipment: {
            name: "Goblet Squat",
            equipment: [['dumbbell'], ['kettlebell']],
            weightMultiplier: 0.4,
            minWeightKg: 12
        },
        homeBodyweight: {
            strength: "Pistol Squat Progression",      // ← Unilaterale per forza
            muscle_gain: "Squat Tempo 3-1-3",          // ← TUT per ipertrofia
            weight_loss: "Jump Squat",                 // ← Esplosivo per consumo calorico
            endurance: "Squat Pulse 1.5 Rep",          // ← Endurance muscolare
            performance: "Pistol Squat",               // ← Performance atletica
            general_fitness: "Squat a Corpo Libero",   // ← Base fitness
            toning: "Squat Isometrico + Pulse",        // ← Tonificazione
            disability: "Squat Assistito (sedia)",     // ← Adattato
            pregnancy: "Squat Box (sicuro)"            // ← Sicuro gravidanza
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
            equipment: [['dumbbell'], ['kettlebell']],
            weightMultiplier: 0.4,
            minWeightKg: 12
        },
        homeBodyweight: {
            strength: "Shrimp Squat",                  // ← Unilaterale difficile
            muscle_gain: "Tempo Squat 4-2-1",          // ← TUT lungo
            weight_loss: "Jump Squat + Pause",         // ← Esplosivo + isometrico
            endurance: "Squat Non-Stop 1 min",         // ← Endurance
            performance: "Box Jump to Squat",          // ← Pliometrico
            general_fitness: "Goblet Squat (zaino)",   // ← Con zaino carico
            toning: "Squat Isometrico",                // ← Isometrico
            disability: "Squat Assistito",             // ← Facilitato
            pregnancy: "Squat Sumo Wide"               // ← Sicuro per gravidanza
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
            equipment: [['dumbbell']],
            weightMultiplier: 0.5,
            minWeightKg: 20
        },
        homeBodyweight: {
            strength: "GIANT_SET_DEADLIFT",            // ← Giant set forza (già implementato)
            muscle_gain: "GIANT_SET_DEADLIFT",         // ← Giant set volume
            weight_loss: "GIANT_SET_DEADLIFT",         // ← Giant set metabolico
            endurance: "GIANT_SET_DEADLIFT",           // ← Giant set endurance
            performance: "GIANT_SET_DEADLIFT",         // ← Giant set performance
            general_fitness: "GIANT_SET_DEADLIFT",     // ← Giant set generale
            toning: "Single Leg RDL Slow",             // ← Unilaterale lento
            disability: "Good Morning Assistito",      // ← Cerniera anca sicura
            pregnancy: "Cat-Cow + Bird Dog"            // ← Mobilità sicura
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
            equipment: [['dumbbell']],
            weightMultiplier: 0.5,
            minWeightKg: 15
        },
        homeBodyweight: {
            strength: "Single Leg RDL",                // ← Unilaterale forza
            muscle_gain: "Nordic Curl Eccentrico",     // ← Femorali ipertrofia
            weight_loss: "Single Leg RDL + Jump",      // ← Esplosivo
            endurance: "RDL Pulse Bottom",             // ← Endurance femorali
            performance: "Single Leg RDL Explosive",   // ← Esplosivo unilaterale
            general_fitness: "Good Morning",           // ← Cerniera anca
            toning: "Nordic Curl Isometrico",          // ← Isometrico femorali
            disability: "Glute Bridge",                // ← Glutei sicuri
            pregnancy: "Glute Bridge Elevato"          // ← Glutei gravidanza
        }
    },
    
    // PETTO
    'Panca Piana': {
        gym: {
            name: "Panca Piana Bilanciere",
            equipment: [['barbell', 'bench']],
            weightMultiplier: 0.7
        },
        homeWithEquipment: {
            name: "Panca Manubri",
            equipment: [['dumbbell', 'bench']],
            weightMultiplier: 0.6,
            minWeightKg: 15
        },
        homeBodyweight: {
            strength: "Archer Push-up",                // ← Unilaterale forza
            muscle_gain: "Push-up Tempo 3-1-3",        // ← TUT ipertrofia
            weight_loss: "Burpee Push-up",             // ← Metabolico
            endurance: "Push-up AMRAP",                // ← Massime ripetizioni
            performance: "Clapping Push-up",           // ← Esplosivo
            general_fitness: "Push-up Standard",       // ← Base
            toning: "Push-up Isometrico",              // ← Isometrico
            disability: "Push-up su Ginocchia",        // ← Facilitato
            pregnancy: "Wall Push-up"                  // ← Sicuro gravidanza
        }
    },
    
    'Panca Inclinata': {
        gym: {
            name: "Panca Inclinata",
            equipment: [['barbell', 'bench']],
            weightMultiplier: 0.6
        },
        homeWithEquipment: {
            name: "Panca Inclinata Manubri",
            equipment: [['dumbbell', 'bench']],
            weightMultiplier: 0.5,
            minWeightKg: 12
        },
        homeBodyweight: {
            strength: "Deficit Pike Push-up",         // ← Spalle forza
            muscle_gain: "Pike Push-up Tempo",        // ← Spalle TUT
            weight_loss: "Pike Push-up Jump",         // ← Esplosivo spalle
            endurance: "Pike Push-up AMRAP",          // ← Endurance
            performance: "Handstand Push-up Neg",     // ← Negativa verticale
            general_fitness: "Pike Push-up",          // ← Standard
            toning: "Pike Hold Isometrico",           // ← Isometrico spalle
            disability: "Incline Push-up",            // ← Facilitato
            pregnancy: "Incline Push-up Wide"         // ← Sicuro
        }
    },
    
    'Dips': {
        gym: {
            name: "Dips",
            equipment: [['none']],
            weightMultiplier: 0
        },
        homeWithEquipment: {
            name: "Dips (tra sedie)",
            equipment: [['none']],
            weightMultiplier: 0
        },
        homeBodyweight: {
            strength: "Dips Completi",                 // ← Forza tricipiti
            muscle_gain: "Dips Tempo 3-1-2",           // ← TUT tricipiti
            weight_loss: "Diamond Push-up Burpee",     // ← Metabolico
            endurance: "Diamond Push-up AMRAP",        // ← Endurance
            performance: "Explosive Dips",             // ← Esplosivo
            general_fitness: "Diamond Push-up",        // ← Base tricipiti
            toning: "Dips Isometrici",                 // ← Isometrico
            disability: "Bench Dips",                  // ← Facilitato
            pregnancy: "Close Grip Wall Push"         // ← Sicuro
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
            strength: "GIANT_SET_PULLUP",              // ← Giant set dorsali
            muscle_gain: "GIANT_SET_PULLUP",           // ← Giant set volume
            weight_loss: "GIANT_SET_PULLUP",           // ← Giant set metabolico
            endurance: "GIANT_SET_PULLUP",             // ← Giant set endurance
            performance: "GIANT_SET_PULLUP",           // ← Giant set performance
            general_fitness: "GIANT_SET_PULLUP",       // ← Giant set base
            toning: "Inverted Row Isometrico",         // ← Isometrico dorsali
            disability: "Lat Stretch + Scap Pull",     // ← Mobilità scapole
            pregnancy: "Lat Stretch Band"              // ← Mobilità sicura
        }
    },
    
    'Pulley': {
        gym: {
            name: "Lat Machine",
            equipment: [['none']],
            weightMultiplier: 0.7
        },
        homeWithEquipment: {
            name: "Band Pull-down",
            equipment: [['band']],
            weightMultiplier: 0
        },
        homeBodyweight: {
            strength: "GIANT_SET_PULLUP",              // ← Giant set
            muscle_gain: "GIANT_SET_PULLUP",           // ← Giant set
            weight_loss: "GIANT_SET_PULLUP",           // ← Giant set
            endurance: "GIANT_SET_PULLUP",             // ← Giant set
            performance: "GIANT_SET_PULLUP",           // ← Giant set
            general_fitness: "Inverted Row",           // ← Row base
            toning: "Scapular Pull-up",                // ← Scapole
            disability: "Scapular Activation",         // ← Attivazione
            pregnancy: "Band Lat Pull"                 // ← Bande sicure
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
            strength: "Inverted Row Elevato",          // ← Row difficile
            muscle_gain: "Inverted Row Tempo 3-1-3",   // ← TUT dorsali
            weight_loss: "Explosive Inverted Row",     // ← Esplosivo
            endurance: "Inverted Row AMRAP",           // ← Endurance
            performance: "Single Arm Inverted Row",    // ← Unilaterale
            general_fitness: "Inverted Row",           // ← Standard
            toning: "Inverted Row Isometrico",         // ← Isometrico
            disability: "Prone Y-Raise",               // ← Facilitato
            pregnancy: "Supported Row"                 // ← Supportato
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
            strength: "Plank Row Unilaterale",         // ← Core + dorsali forza
            muscle_gain: "Plank Row Tempo",            // ← TUT
            weight_loss: "Plank Row Burpee",           // ← Metabolico
            endurance: "Plank Row Alternato AMRAP",    // ← Endurance
            performance: "Explosive Plank Row",        // ← Esplosivo
            general_fitness: "Plank Row",              // ← Standard
            toning: "Plank Row Isometrico",            // ← Isometrico
            disability: "Prone Swimmers",              // ← Facilitato
            pregnancy: "Supported Elbow Row"           // ← Sicuro
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
            strength: "Handstand Push-up Negativa",    // ← Verticale forza
            muscle_gain: "Pike Push-up Elevato Tempo", // ← TUT spalle
            weight_loss: "Pike Push-up Jump",          // ← Esplosivo
            endurance: "Pike Push-up AMRAP",           // ← Endurance
            performance: "Handstand Hold",             // ← Equilibrio verticale
            general_fitness: "Pike Push-up",           // ← Standard
            toning: "Pike Hold Isometrico",            // ← Isometrico
            disability: "Wall Slide",                  // ← Mobilità spalle
            pregnancy: "Seated Shoulder Press"         // ← Seduto sicuro
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
            strength: "Plank to Pike Dynamico",        // ← Dinamico spalle
            muscle_gain: "Band Lateral Raise Tempo",   // ← TUT deltoidi
            weight_loss: "Lateral Raise Jump",         // ← Esplosivo
            endurance: "Lateral Raise Pulse",          // ← Endurance
            performance: "Single Arm Pike",            // ← Unilaterale
            general_fitness: "Band Lateral Raise",     // ← Standard
            toning: "Lateral Hold Isometrico",         // ← Isometrico
            disability: "Wall Angels",                 // ← Mobilità
            pregnancy: "Seated Lateral Stretch"        // ← Mobilità sicura
        }
    },
    
    'Croci Cavi': {
        gym: {
            name: "Croci ai Cavi",
            equipment: [['none']],
            weightMultiplier: 0.3
        },
        homeWithEquipment: {
            name: "Croci con Elastici",
            equipment: [['band']],
            weightMultiplier: 0
        },
        homeBodyweight: {
            strength: "Wide Push-up Paused",           // ← Petto ampio forza
            muscle_gain: "Wide Push-up Tempo 4-2-1",   // ← TUT petto
            weight_loss: "Wide Push-up Jump",          // ← Pliometrico
            endurance: "Wide Push-up AMRAP",           // ← Endurance
            performance: "Explosive Wide Push",        // ← Esplosivo
            general_fitness: "Wide Push-up",           // ← Standard
            toning: "Wide Push Isometrico",            // ← Isometrico
            disability: "Wall Fly",                    // ← Facilitato
            pregnancy: "Wall Chest Stretch"            // ← Stretch sicuro
        }
    }
};

// ===== UTILITY FUNCTIONS (INVARIATE) =====

export function checkEquipment(required, available) {
    if (required.length === 0) return true;
    
    for (const group of required) {
        const groupSatisfied = group.every(item => {
            if (item === 'none') return true;
            switch (item) {
                case 'barbell': return available.barbell === true;
                case 'dumbbell': return !!(available.dumbbellMaxKg && available.dumbbellMaxKg > 0);
                case 'kettlebell': return !!(available.kettlebellKg && available.kettlebellKg.length > 0);
                case 'band': return available.bands === true;
                case 'pullup_bar': return available.pullupBar === true;
                case 'bench': return available.bench === true;
                default: return false;
            }
        });
        
        if (groupSatisfied) return true;
    }
    
    return false;
}

export function getDefaultSets(goal, isBodyweight = false) {
    const base = {
        strength: 5,
        muscle_gain: 4,
        weight_loss: 4,
        endurance: 3,
        performance: 4,
        general_fitness: 3,
        toning: 4,
        disability: 3,
        pregnancy: 3
    };
    return base[goal] + (isBodyweight ? 1 : 0);
}

export function getDefaultReps(goal, isBodyweight = false) {
    const base = {
        strength: isBodyweight ? "8-10" : "3-6",
        muscle_gain: isBodyweight ? "15-20" : "8-12",
        weight_loss: isBodyweight ? "20-25" : "12-15",
        endurance: isBodyweight ? "20-30" : "15-20",
        performance: isBodyweight ? "10-15" : "6-10",
        general_fitness: isBodyweight ? "12-15" : "10-12",
        toning: isBodyweight ? "15-20" : "12-15",
        disability: isBodyweight ? "10-12" : "8-10",
        pregnancy: isBodyweight ? "12-15" : "10-12"
    };
    return base[goal];
}

export function getDefaultRest(goal, category = 'compound') {
    const base = {
        strength: category === 'compound' ? 240 : 120,
        muscle_gain: category === 'compound' ? 120 : 60,
        weight_loss: category === 'compound' ? 90 : 45,
        endurance: category === 'compound' ? 60 : 30,
        performance: category === 'compound' ? 180 : 90,
        general_fitness: category === 'compound' ? 90 : 60,
        toning: category === 'compound' ? 60 : 45,
        disability: category === 'compound' ? 120 : 90,
        pregnancy: category === 'compound' ? 90 : 60
    };
    return base[goal];
}
