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
    },

    // GAMBE - LEG PRESS / LEG EXTENSION / LEG CURL
    'Leg Press': {
        gym: {
            name: "Leg Press",
            equipment: [['none']],
            weightMultiplier: 1.2
        },
        homeWithEquipment: {
            name: "Goblet Squat Heavy",
            equipment: [['dumbbell']],
            weightMultiplier: 0.4,
            minWeightKg: 20
        },
        homeBodyweight: {
            strength: "Bulgarian Split Squat",         // ← Unilaterale forza
            muscle_gain: "Wall Sit + Squat Pulses",    // ← Isometrico + volume
            weight_loss: "Jump Lunges",                // ← Pliometrico
            endurance: "Wall Sit 60s + Squat",         // ← Endurance gambe
            performance: "Box Jump",                   // ← Esplosivo
            general_fitness: "Reverse Lunge",          // ← Standard
            toning: "Wall Sit Hold",                   // ← Isometrico
            disability: "Glute Bridge",                // ← Facilitato
            pregnancy: "Sumo Squat"                    // ← Sicuro
        }
    },

    'Leg Extension': {
        gym: {
            name: "Leg Extension",
            equipment: [['none']],
            weightMultiplier: 0.4
        },
        homeWithEquipment: {
            name: "Leg Extension Elastico",
            equipment: [['band']],
            weightMultiplier: 0
        },
        homeBodyweight: {
            strength: "Sissy Squat",                   // ← Quadricipiti forza
            muscle_gain: "Sissy Squat Tempo",          // ← TUT quad
            weight_loss: "Squat Jump + Hold",          // ← Metabolico
            endurance: "Wall Sit 90s",                 // ← Endurance
            performance: "Sissy Squat Explosive",      // ← Esplosivo
            general_fitness: "Squat Isometrico",       // ← Base
            toning: "Quad Isometrico Muro",            // ← Isometrico
            disability: "Seated Knee Extension",       // ← Facilitato
            pregnancy: "Seated Quad Stretch"           // ← Mobilità
        }
    },

    'Leg Curl': {
        gym: {
            name: "Leg Curl",
            equipment: [['none']],
            weightMultiplier: 0.4
        },
        homeWithEquipment: {
            name: "Leg Curl Elastico",
            equipment: [['band']],
            weightMultiplier: 0
        },
        homeBodyweight: {
            strength: "Nordic Curl",                   // ← Femorali forza
            muscle_gain: "Nordic Curl Eccentrico",     // ← TUT femorali
            weight_loss: "Glute Bridge March",         // ← Metabolico
            endurance: "Glute Bridge 60s Hold",        // ← Endurance
            performance: "Nordic Curl Assisted",       // ← Progressione
            general_fitness: "Lying Leg Curl (asciugamano)", // ← Base
            toning: "Glute Bridge Isometrico",         // ← Isometrico
            disability: "Prone Knee Flexion",          // ← Facilitato
            pregnancy: "Side Lying Leg Curl"           // ← Sicuro
        }
    },

    'Calf Raises': {
        gym: {
            name: "Calf Raises Macchina",
            equipment: [['none']],
            weightMultiplier: 0.6
        },
        homeWithEquipment: {
            name: "Calf Raises con Manubri",
            equipment: [['dumbbell']],
            weightMultiplier: 0.4,
            minWeightKg: 10
        },
        homeBodyweight: {
            strength: "Single Leg Calf Raise",         // ← Unilaterale forza
            muscle_gain: "Calf Raise Tempo 3-3-3",     // ← TUT polpacci
            weight_loss: "Calf Raise Jump",            // ← Pliometrico
            endurance: "Calf Raise 50 reps",           // ← Endurance
            performance: "Explosive Calf Raise",       // ← Esplosivo
            general_fitness: "Calf Raise Standard",    // ← Base
            toning: "Calf Raise Isometrico",           // ← Isometrico
            disability: "Seated Calf Raise",           // ← Facilitato
            pregnancy: "Wall Supported Calf"           // ← Supportato
        }
    },

    // BRACCIA
    'Curl Bilanciere': {
        gym: {
            name: "Curl Bilanciere",
            equipment: [['barbell']],
            weightMultiplier: 0.3
        },
        homeWithEquipment: {
            name: "Curl Manubri",
            equipment: [['dumbbell']],
            weightMultiplier: 0.25,
            minWeightKg: 8
        },
        homeBodyweight: {
            strength: "Chin-up (supinato)",            // ← Bicipiti + dorsali
            muscle_gain: "Chin-up Tempo",              // ← TUT bicipiti
            weight_loss: "Burpee + Chin-up",           // ← Metabolico
            endurance: "Chin-up AMRAP",                // ← Endurance
            performance: "Explosive Chin-up",          // ← Esplosivo
            general_fitness: "Inverted Row Supinato",  // ← Base
            toning: "Inverted Row Iso Hold",           // ← Isometrico
            disability: "Band Curl",                   // ← Facilitato
            pregnancy: "Seated Band Curl"              // ← Sicuro
        }
    },

    'Tricep Pushdown': {
        gym: {
            name: "Tricep Pushdown Cavo",
            equipment: [['none']],
            weightMultiplier: 0.3
        },
        homeWithEquipment: {
            name: "Tricep Extension Manubrio",
            equipment: [['dumbbell']],
            weightMultiplier: 0.25,
            minWeightKg: 6
        },
        homeBodyweight: {
            strength: "Close Grip Push-up Deficit",    // ← Tricipiti forza
            muscle_gain: "Diamond Push-up Tempo",      // ← TUT tricipiti
            weight_loss: "Diamond Push-up Burpee",     // ← Metabolico
            endurance: "Diamond Push-up AMRAP",        // ← Endurance
            performance: "Clapping Diamond Push",      // ← Esplosivo
            general_fitness: "Diamond Push-up",        // ← Base
            toning: "Tricep Plank Hold",               // ← Isometrico
            disability: "Wall Tricep Press",           // ← Facilitato
            pregnancy: "Incline Tricep Push"           // ← Sicuro
        }
    },

    // CORE
    'Plank': {
        gym: {
            name: "Plank",
            equipment: [['none']],
            weightMultiplier: 0
        },
        homeWithEquipment: {
            name: "Plank",
            equipment: [['none']],
            weightMultiplier: 0
        },
        homeBodyweight: {
            strength: "RKC Plank Weighted",            // ← Plank intenso
            muscle_gain: "Plank Variations Circuit",   // ← Volume core
            weight_loss: "Mountain Climber",           // ← Cardio core
            endurance: "Plank 2min Challenge",         // ← Endurance
            performance: "Body Saw Plank",             // ← Dinamico
            general_fitness: "Plank Standard",         // ← Base
            toning: "Plank Hip Dips",                  // ← Obliqui
            disability: "Incline Plank",               // ← Facilitato
            pregnancy: "Bird Dog"                      // ← Sicuro gravidanza
        }
    },

    'Crunch': {
        gym: {
            name: "Crunch Macchina",
            equipment: [['none']],
            weightMultiplier: 0.3
        },
        homeWithEquipment: {
            name: "Crunch con Peso",
            equipment: [['dumbbell']],
            weightMultiplier: 0.15,
            minWeightKg: 5
        },
        homeBodyweight: {
            strength: "Dragon Flag Negativa",          // ← Core forza estrema
            muscle_gain: "Crunch Tempo 3-2-1",         // ← TUT addominali
            weight_loss: "Bicycle Crunch 60s",         // ← Metabolico
            endurance: "Crunch 100 reps",              // ← Endurance
            performance: "V-up",                       // ← Esplosivo
            general_fitness: "Crunch Standard",        // ← Base
            toning: "Dead Bug",                        // ← Core stability
            disability: "Pelvic Tilt",                 // ← Facilitato
            pregnancy: "Pelvic Floor Activation"       // ← Sicuro
        }
    },

    'Leg Raises': {
        gym: {
            name: "Leg Raise alla Spalliera",
            equipment: [['none']],
            weightMultiplier: 0
        },
        homeWithEquipment: {
            name: "Hanging Leg Raise",
            equipment: [['pullup_bar']],
            weightMultiplier: 0
        },
        homeBodyweight: {
            strength: "Toes to Bar",                   // ← Core forza
            muscle_gain: "Leg Raise Tempo",            // ← TUT addominali bassi
            weight_loss: "Flutter Kicks 60s",          // ← Metabolico
            endurance: "Leg Raise Slow 30 reps",       // ← Endurance
            performance: "Windshield Wipers",          // ← Rotazionale
            general_fitness: "Lying Leg Raise",        // ← Base
            toning: "Reverse Crunch",                  // ← Addominali bassi
            disability: "Knee Raise",                  // ← Facilitato
            pregnancy: "Seated Knee Lift"              // ← Sicuro
        }
    },

    // GLUTEI
    'Hip Thrust': {
        gym: {
            name: "Hip Thrust Bilanciere",
            equipment: [['barbell', 'bench']],
            weightMultiplier: 0.8
        },
        homeWithEquipment: {
            name: "Hip Thrust Manubri",
            equipment: [['dumbbell']],
            weightMultiplier: 0.4,
            minWeightKg: 15
        },
        homeBodyweight: {
            strength: "Single Leg Hip Thrust",         // ← Unilaterale forza
            muscle_gain: "Hip Thrust Tempo 4-2-2",     // ← TUT glutei
            weight_loss: "Glute Bridge March",         // ← Metabolico
            endurance: "Glute Bridge 100 reps",        // ← Endurance
            performance: "Hip Thrust Jump",            // ← Esplosivo
            general_fitness: "Glute Bridge",           // ← Base
            toning: "Hip Thrust Isometrico",           // ← Isometrico
            disability: "Glute Squeeze",               // ← Facilitato
            pregnancy: "Side Lying Hip Abduction"      // ← Sicuro laterale
        }
    },

    'Affondi': {
        gym: {
            name: "Affondi con Bilanciere",
            equipment: [['barbell']],
            weightMultiplier: 0.5
        },
        homeWithEquipment: {
            name: "Affondi con Manubri",
            equipment: [['dumbbell']],
            weightMultiplier: 0.4,
            minWeightKg: 10
        },
        homeBodyweight: {
            strength: "Bulgarian Split Squat",         // ← Unilaterale forza
            muscle_gain: "Walking Lunge Tempo",        // ← TUT gambe
            weight_loss: "Jump Lunges",                // ← Pliometrico
            endurance: "Walking Lunge 50m",            // ← Endurance
            performance: "Explosive Lunge",            // ← Esplosivo
            general_fitness: "Reverse Lunge",          // ← Standard
            toning: "Static Lunge Hold",               // ← Isometrico
            disability: "Supported Lunge",             // ← Con supporto
            pregnancy: "Reverse Lunge Shallow"         // ← ROM ridotto
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
