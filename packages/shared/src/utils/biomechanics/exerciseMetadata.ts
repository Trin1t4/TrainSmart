/**
 * TRAINSMART BIOMECHANICS ENGINE - EXERCISE METADATA
 *
 * 106 esercizi con metadati completi per analisi biomeccanica
 * Basato su letteratura peer-reviewed e principi DCSS
 *
 * @version 2.0.0
 * @author TrainSmart Team
 */

import type { ExerciseMetadata } from './exerciseDefinitionTypes';

export const SUPPORTED_EXERCISES: ExerciseMetadata[] = [
  // ============ LOWER PUSH ============
  {
    id: 'BACK_SQUAT',
    names: ['Back Squat', 'Squat con Bilanciere', 'Squat Bilanciere', 'Barbell Squat', 'Squat'],
    category: 'lower_push',
    equipment: ['barbell'],
    difficulty: 6
  },
  {
    id: 'FRONT_SQUAT',
    names: ['Front Squat', 'Squat Frontale'],
    category: 'lower_push',
    equipment: ['barbell'],
    difficulty: 7
  },
  {
    id: 'BULGARIAN_SPLIT_SQUAT',
    names: ['Bulgarian Split Squat', 'Split Squat Bulgaro', 'Squat Bulgaro', 'Affondi Bulgari'],
    category: 'lower_push',
    equipment: ['bodyweight', 'dumbbell', 'barbell'],
    unilateral: true,
    difficulty: 6
  },
  {
    id: 'GOBLET_SQUAT',
    names: ['Goblet Squat', 'Goblet Squat con Manubrio', 'Goblet Squat con Kettlebell'],
    category: 'lower_push',
    equipment: ['dumbbell', 'kettlebell'],
    difficulty: 4,
    mapsTo: 'BACK_SQUAT'
  },
  {
    id: 'PISTOL_SQUAT',
    names: ['Pistol Squat', 'Squat su una Gamba', 'Single Leg Squat'],
    category: 'lower_push',
    equipment: ['bodyweight'],
    unilateral: true,
    difficulty: 9
  },
  {
    id: 'LUNGES',
    names: ['Lunges', 'Affondi', 'Walking Lunges', 'Affondi Camminati', 'Forward Lunge', 'Reverse Lunge'],
    category: 'lower_push',
    equipment: ['bodyweight', 'dumbbell', 'barbell'],
    unilateral: true,
    difficulty: 5
  },
  {
    id: 'STEP_UP',
    names: ['Step-up', 'Step Up', 'Box Step-up'],
    category: 'lower_push',
    equipment: ['bodyweight', 'dumbbell', 'barbell'],
    unilateral: true,
    difficulty: 4
  },
  {
    id: 'LEG_PRESS',
    names: ['Leg Press', 'Pressa', 'Leg Press Machine', '45° Leg Press'],
    category: 'lower_push',
    equipment: ['machine'],
    difficulty: 4
  },
  {
    id: 'HACK_SQUAT',
    names: ['Hack Squat', 'Hack Squat Machine'],
    category: 'lower_push',
    equipment: ['machine'],
    difficulty: 4
  },
  {
    id: 'LEG_EXTENSION',
    names: ['Leg Extension', 'Leg Extension Machine', 'Estensione Gambe'],
    category: 'lower_push',
    equipment: ['machine'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'SMITH_SQUAT',
    names: ['Smith Machine Squat', 'Smith Squat', 'Squat al Multipower'],
    category: 'lower_push',
    equipment: ['machine'],
    difficulty: 4,
    mapsTo: 'BACK_SQUAT'
  },
  {
    id: 'SKATER_SQUAT',
    names: ['Skater Squat', 'Single Leg Squat to Bench'],
    category: 'lower_push',
    equipment: ['bodyweight'],
    unilateral: true,
    difficulty: 7
  },
  {
    id: 'SISSY_SQUAT',
    names: ['Sissy Squat'],
    category: 'lower_push',
    equipment: ['bodyweight', 'machine'],
    difficulty: 6
  },
  {
    id: 'BODYWEIGHT_SQUAT',
    names: ['Bodyweight Squat', 'Air Squat', 'Squat a Corpo Libero', 'Accosciata'],
    category: 'lower_push',
    equipment: ['bodyweight'],
    difficulty: 2,
    mapsTo: 'BACK_SQUAT'
  },
  {
    id: 'PENDULUM_SQUAT',
    names: ['Pendulum Squat', 'Pendulum Squat Machine'],
    category: 'lower_push',
    equipment: ['machine'],
    difficulty: 4
  },

  // ============ LOWER PULL ============
  {
    id: 'DEADLIFT_CONVENTIONAL',
    names: ['Conventional Deadlift', 'Deadlift', 'Stacco da Terra', 'Stacco'],
    category: 'lower_pull',
    equipment: ['barbell'],
    difficulty: 7
  },
  {
    id: 'DEADLIFT_SUMO',
    names: ['Sumo Deadlift', 'Stacco Sumo'],
    category: 'lower_pull',
    equipment: ['barbell'],
    difficulty: 7
  },
  {
    id: 'ROMANIAN_DEADLIFT',
    names: ['Romanian Deadlift', 'RDL', 'Stacco Rumeno', 'Stacco a Gambe Tese'],
    category: 'lower_pull',
    equipment: ['barbell', 'dumbbell'],
    difficulty: 5
  },
  {
    id: 'TRAP_BAR_DEADLIFT',
    names: ['Trap Bar Deadlift', 'Hex Bar Deadlift', 'Stacco con Trap Bar', 'Stacco Trap Bar'],
    category: 'lower_pull',
    equipment: ['trap_bar'],
    difficulty: 5
  },
  {
    id: 'HIP_THRUST',
    names: ['Hip Thrust', 'Barbell Hip Thrust', 'Spinta d\'Anca'],
    category: 'lower_pull',
    equipment: ['barbell', 'bodyweight', 'machine'],
    difficulty: 4
  },
  {
    id: 'GLUTE_BRIDGE',
    names: ['Glute Bridge', 'Ponte Glutei', 'Hip Bridge'],
    category: 'lower_pull',
    equipment: ['bodyweight', 'dumbbell', 'barbell'],
    difficulty: 2,
    mapsTo: 'HIP_THRUST'
  },
  {
    id: 'NORDIC_CURL',
    names: ['Nordic Curl', 'Nordic Hamstring Curl', 'Leg Curl Nordico'],
    category: 'lower_pull',
    equipment: ['bodyweight'],
    difficulty: 8
  },
  {
    id: 'GOOD_MORNING',
    names: ['Good Morning', 'Good Morning Exercise'],
    category: 'lower_pull',
    equipment: ['barbell', 'bodyweight'],
    difficulty: 5,
    mapsTo: 'ROMANIAN_DEADLIFT'
  },
  {
    id: 'LEG_CURL_LYING',
    names: ['Lying Leg Curl', 'Leg Curl Machine', 'Leg Curl Sdraiato', 'Curl Femorali'],
    category: 'lower_pull',
    equipment: ['machine'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'LEG_CURL_SEATED',
    names: ['Seated Leg Curl', 'Leg Curl Seduto'],
    category: 'lower_pull',
    equipment: ['machine'],
    isolation: true,
    difficulty: 2,
    mapsTo: 'LEG_CURL_LYING'
  },
  {
    id: 'BACK_EXTENSION',
    names: ['Back Extension', 'Hyperextension', '45° Back Extension'],
    category: 'lower_pull',
    equipment: ['machine', 'bench'],
    difficulty: 3
  },
  {
    id: 'SINGLE_LEG_RDL',
    names: ['Single Leg RDL', 'Single Leg Romanian Deadlift', 'Stacco Rumeno Unilaterale'],
    category: 'lower_pull',
    equipment: ['dumbbell', 'kettlebell', 'bodyweight'],
    unilateral: true,
    difficulty: 6
  },
  {
    id: 'KETTLEBELL_SWING',
    names: ['Kettlebell Swing', 'KB Swing', 'Russian Swing', 'American Swing'],
    category: 'lower_pull',
    equipment: ['kettlebell'],
    difficulty: 5
  },
  {
    id: 'HIP_THRUST_MACHINE',
    names: ['Hip Thrust Machine', 'Glute Drive'],
    category: 'lower_pull',
    equipment: ['machine'],
    difficulty: 3,
    mapsTo: 'HIP_THRUST'
  },

  // ============ HORIZONTAL PUSH ============
  {
    id: 'BENCH_PRESS',
    names: ['Bench Press', 'Flat Bench Press', 'Barbell Bench Press', 'Panca Piana', 'Distensioni su Panca'],
    category: 'horizontal_push',
    equipment: ['barbell', 'bench'],
    difficulty: 6
  },
  {
    id: 'INCLINE_BENCH_PRESS',
    names: ['Incline Bench Press', 'Incline Press', 'Panca Inclinata', 'Distensioni Inclinata'],
    category: 'horizontal_push',
    equipment: ['barbell', 'dumbbell', 'bench'],
    difficulty: 6
  },
  {
    id: 'DECLINE_BENCH_PRESS',
    names: ['Decline Bench Press', 'Decline Press', 'Panca Declinata'],
    category: 'horizontal_push',
    equipment: ['barbell', 'dumbbell', 'bench'],
    difficulty: 5,
    mapsTo: 'BENCH_PRESS'
  },
  {
    id: 'DUMBBELL_BENCH_PRESS',
    names: ['Dumbbell Bench Press', 'DB Bench Press', 'Panca con Manubri', 'Distensioni con Manubri'],
    category: 'horizontal_push',
    equipment: ['dumbbell', 'bench'],
    difficulty: 5
  },
  {
    id: 'PUSH_UP',
    names: ['Push-up', 'Push Up', 'Piegamenti', 'Piegamenti sulle Braccia'],
    category: 'horizontal_push',
    equipment: ['bodyweight'],
    difficulty: 4
  },
  {
    id: 'DIAMOND_PUSH_UP',
    names: ['Diamond Push-up', 'Diamond Push Up', 'Piegamenti Diamante', 'Close Grip Push-up'],
    category: 'horizontal_push',
    equipment: ['bodyweight'],
    difficulty: 6,
    mapsTo: 'PUSH_UP'
  },
  {
    id: 'ARCHER_PUSH_UP',
    names: ['Archer Push-up', 'Archer Push Up', 'Piegamenti Arciere'],
    category: 'horizontal_push',
    equipment: ['bodyweight'],
    difficulty: 7
  },
  {
    id: 'DECLINE_PUSH_UP',
    names: ['Decline Push-up', 'Decline Push Up', 'Piegamenti Declinati', 'Feet Elevated Push-up'],
    category: 'horizontal_push',
    equipment: ['bodyweight'],
    difficulty: 5,
    mapsTo: 'PUSH_UP'
  },
  {
    id: 'INCLINE_PUSH_UP',
    names: ['Incline Push-up', 'Incline Push Up', 'Piegamenti Inclinati', 'Hands Elevated Push-up'],
    category: 'horizontal_push',
    equipment: ['bodyweight'],
    difficulty: 2,
    mapsTo: 'PUSH_UP'
  },
  {
    id: 'DIPS_CHEST',
    names: ['Chest Dips', 'Dips', 'Dip', 'Parallele'],
    category: 'horizontal_push',
    equipment: ['parallel_bars', 'dip_station'],
    difficulty: 6
  },
  {
    id: 'DIPS_TRICEPS',
    names: ['Tricep Dips', 'Upright Dips', 'Dip Tricipiti'],
    category: 'horizontal_push',
    equipment: ['parallel_bars', 'dip_station'],
    difficulty: 6,
    mapsTo: 'DIPS_CHEST'
  },
  {
    id: 'CHEST_PRESS_MACHINE',
    names: ['Chest Press Machine', 'Chest Press', 'Machine Chest Press'],
    category: 'horizontal_push',
    equipment: ['machine'],
    difficulty: 2
  },
  {
    id: 'CABLE_FLY',
    names: ['Cable Fly', 'Cable Crossover', 'Croci ai Cavi'],
    category: 'horizontal_push',
    equipment: ['cable'],
    isolation: true,
    difficulty: 3
  },
  {
    id: 'PEC_DECK',
    names: ['Pec Deck', 'Pec Fly Machine', 'Butterfly'],
    category: 'horizontal_push',
    equipment: ['machine'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'SVEND_PRESS',
    names: ['Svend Press', 'Plate Squeeze Press'],
    category: 'horizontal_push',
    equipment: ['plate'],
    difficulty: 3
  },
  {
    id: 'LANDMINE_PRESS',
    names: ['Landmine Press', 'Angled Barbell Press'],
    category: 'horizontal_push',
    equipment: ['barbell', 'landmine'],
    difficulty: 4
  },

  // ============ HORIZONTAL PULL ============
  {
    id: 'BARBELL_ROW',
    names: ['Barbell Row', 'Bent Over Row', 'Rematore con Bilanciere', 'Rematore'],
    category: 'horizontal_pull',
    equipment: ['barbell'],
    difficulty: 6
  },
  {
    id: 'DUMBBELL_ROW',
    names: ['Dumbbell Row', 'One Arm Row', 'Rematore con Manubrio', 'Single Arm Dumbbell Row'],
    category: 'horizontal_pull',
    equipment: ['dumbbell', 'bench'],
    unilateral: true,
    difficulty: 5
  },
  {
    id: 'T_BAR_ROW',
    names: ['T-Bar Row', 'T Bar Row', 'Rematore T-Bar'],
    category: 'horizontal_pull',
    equipment: ['t_bar', 'landmine'],
    difficulty: 6,
    mapsTo: 'BARBELL_ROW'
  },
  {
    id: 'INVERTED_ROW',
    names: ['Inverted Row', 'Australian Pull-up', 'Body Row', 'Rematore Inverso', 'Trazioni Orizzontali'],
    category: 'horizontal_pull',
    equipment: ['bar', 'rings', 'trx'],
    difficulty: 4
  },
  {
    id: 'CABLE_ROW',
    names: ['Cable Row', 'Seated Cable Row', 'Pulley', 'Pulley Basso', 'Low Row'],
    category: 'horizontal_pull',
    equipment: ['cable'],
    difficulty: 4
  },
  {
    id: 'CHEST_SUPPORTED_ROW',
    names: ['Chest Supported Row', 'Seal Row', 'Incline DB Row'],
    category: 'horizontal_pull',
    equipment: ['dumbbell', 'barbell', 'bench'],
    difficulty: 5
  },
  {
    id: 'FACE_PULL',
    names: ['Face Pull', 'Face Pull Cable', 'Rear Delt Pull'],
    category: 'horizontal_pull',
    equipment: ['cable', 'band'],
    difficulty: 3
  },
  {
    id: 'SEATED_ROW_MACHINE',
    names: ['Seated Row Machine', 'Row Machine', 'Machine Row'],
    category: 'horizontal_pull',
    equipment: ['machine'],
    difficulty: 2
  },
  {
    id: 'HIGH_ROW',
    names: ['High Row', 'High Row Machine'],
    category: 'horizontal_pull',
    equipment: ['machine', 'cable'],
    difficulty: 3
  },
  {
    id: 'LOW_ROW_MACHINE',
    names: ['Low Row Machine', 'Low Row'],
    category: 'horizontal_pull',
    equipment: ['machine'],
    difficulty: 3
  },
  {
    id: 'MEADOWS_ROW',
    names: ['Meadows Row', 'Landmine Row'],
    category: 'horizontal_pull',
    equipment: ['barbell', 'landmine'],
    unilateral: true,
    difficulty: 5
  },
  {
    id: 'PENDLAY_ROW',
    names: ['Pendlay Row', 'Dead Stop Row'],
    category: 'horizontal_pull',
    equipment: ['barbell'],
    difficulty: 6
  },

  // ============ VERTICAL PULL ============
  {
    id: 'PULL_UP',
    names: ['Pull-up', 'Pull Up', 'Trazioni', 'Trazioni alla Sbarra'],
    category: 'vertical_pull',
    equipment: ['bar'],
    difficulty: 7
  },
  {
    id: 'CHIN_UP',
    names: ['Chin-up', 'Chin Up', 'Trazioni Presa Supina'],
    category: 'vertical_pull',
    equipment: ['bar'],
    difficulty: 6,
    mapsTo: 'PULL_UP'
  },
  {
    id: 'LAT_PULLDOWN',
    names: ['Lat Pulldown', 'Lat Machine', 'Pulldown', 'Tirata al Lat'],
    category: 'vertical_pull',
    equipment: ['cable', 'machine'],
    difficulty: 4
  },
  {
    id: 'ASSISTED_PULL_UP',
    names: ['Assisted Pull-up', 'Trazioni Assistite', 'Pull-up Machine'],
    category: 'vertical_pull',
    equipment: ['machine', 'band'],
    difficulty: 3,
    mapsTo: 'PULL_UP'
  },
  {
    id: 'NEGATIVE_PULL_UP',
    names: ['Negative Pull-up', 'Eccentric Pull-up', 'Trazione Negativa'],
    category: 'vertical_pull',
    equipment: ['bar'],
    difficulty: 5
  },
  {
    id: 'WIDE_GRIP_PULLDOWN',
    names: ['Wide Grip Lat Pulldown', 'Wide Pulldown', 'Lat Pulldown Presa Larga'],
    category: 'vertical_pull',
    equipment: ['cable', 'machine'],
    difficulty: 4,
    mapsTo: 'LAT_PULLDOWN'
  },
  {
    id: 'NEUTRAL_GRIP_PULLDOWN',
    names: ['Neutral Grip Lat Pulldown', 'Close Grip Pulldown', 'Lat Pulldown Presa Neutra'],
    category: 'vertical_pull',
    equipment: ['cable', 'machine'],
    difficulty: 4,
    mapsTo: 'LAT_PULLDOWN'
  },
  {
    id: 'STRAIGHT_ARM_PULLDOWN',
    names: ['Straight Arm Pulldown', 'Pulldown a Braccia Tese', 'Pullover ai Cavi'],
    category: 'vertical_pull',
    equipment: ['cable'],
    isolation: true,
    difficulty: 3
  },
  {
    id: 'PULLOVER',
    names: ['Pullover', 'Dumbbell Pullover', 'Pullover con Manubrio'],
    category: 'vertical_pull',
    equipment: ['dumbbell', 'cable'],
    difficulty: 4
  },
  {
    id: 'ROPE_CLIMB',
    names: ['Rope Climb', 'Arrampicata sulla Corda'],
    category: 'vertical_pull',
    equipment: ['rope'],
    difficulty: 8
  },

  // ============ VERTICAL PUSH ============
  {
    id: 'OVERHEAD_PRESS',
    names: ['Overhead Press', 'Military Press', 'OHP', 'Lento Avanti', 'Shoulder Press'],
    category: 'vertical_push',
    equipment: ['barbell'],
    difficulty: 6
  },
  {
    id: 'DUMBBELL_SHOULDER_PRESS',
    names: ['Dumbbell Shoulder Press', 'Seated DB Press', 'Shoulder Press con Manubri'],
    category: 'vertical_push',
    equipment: ['dumbbell'],
    difficulty: 5
  },
  {
    id: 'ARNOLD_PRESS',
    names: ['Arnold Press', 'Arnold Shoulder Press'],
    category: 'vertical_push',
    equipment: ['dumbbell'],
    difficulty: 5
  },
  {
    id: 'PIKE_PUSH_UP',
    names: ['Pike Push-up', 'Pike Push Up', 'Piegamenti Pike'],
    category: 'vertical_push',
    equipment: ['bodyweight'],
    difficulty: 5
  },
  {
    id: 'HANDSTAND_PUSH_UP',
    names: ['Handstand Push-up', 'HSPU', 'Wall Handstand Push-up', 'Piegamenti in Verticale'],
    category: 'vertical_push',
    equipment: ['bodyweight', 'wall'],
    difficulty: 9
  },
  {
    id: 'PUSH_PRESS',
    names: ['Push Press', 'Power Press'],
    category: 'vertical_push',
    equipment: ['barbell'],
    difficulty: 6
  },
  {
    id: 'SHOULDER_PRESS_MACHINE',
    names: ['Shoulder Press Machine', 'Machine Shoulder Press'],
    category: 'vertical_push',
    equipment: ['machine'],
    difficulty: 2
  },
  {
    id: 'LATERAL_RAISE',
    names: ['Lateral Raise', 'Side Raise', 'Alzate Laterali'],
    category: 'vertical_push',
    equipment: ['dumbbell', 'cable'],
    isolation: true,
    difficulty: 3
  },
  {
    id: 'LATERAL_RAISE_MACHINE',
    names: ['Lateral Raise Machine', 'Machine Lateral Raise'],
    category: 'vertical_push',
    equipment: ['machine'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'FRONT_RAISE',
    names: ['Front Raise', 'Alzate Frontali'],
    category: 'vertical_push',
    equipment: ['dumbbell', 'cable', 'plate'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'REAR_DELT_FLY',
    names: ['Rear Delt Fly', 'Reverse Fly', 'Alzate Posteriori'],
    category: 'vertical_push',
    equipment: ['dumbbell', 'cable'],
    isolation: true,
    difficulty: 3
  },
  {
    id: 'REAR_DELT_MACHINE',
    names: ['Rear Delt Machine', 'Reverse Pec Deck'],
    category: 'vertical_push',
    equipment: ['machine'],
    isolation: true,
    difficulty: 2
  },

  // ============ CORE ============
  {
    id: 'PLANK',
    names: ['Plank', 'Forearm Plank', 'Plank Isometrico'],
    category: 'core',
    equipment: ['bodyweight'],
    isometric: true,
    difficulty: 3
  },
  {
    id: 'SIDE_PLANK',
    names: ['Side Plank', 'Plank Laterale'],
    category: 'core',
    equipment: ['bodyweight'],
    isometric: true,
    unilateral: true,
    difficulty: 4
  },
  {
    id: 'DEAD_BUG',
    names: ['Dead Bug', 'Dead Bug Exercise'],
    category: 'core',
    equipment: ['bodyweight'],
    difficulty: 3
  },
  {
    id: 'BIRD_DOG',
    names: ['Bird Dog', 'Quadruped Extension'],
    category: 'core',
    equipment: ['bodyweight'],
    difficulty: 2
  },
  {
    id: 'HANGING_LEG_RAISE',
    names: ['Hanging Leg Raise', 'Leg Raise', 'Sollevamento Gambe alla Sbarra'],
    category: 'core',
    equipment: ['bar'],
    difficulty: 6
  },
  {
    id: 'PALLOF_PRESS',
    names: ['Pallof Press', 'Anti-Rotation Press'],
    category: 'core',
    equipment: ['cable', 'band'],
    difficulty: 4
  },
  {
    id: 'AB_WHEEL_ROLLOUT',
    names: ['Ab Wheel Rollout', 'Ab Roller', 'Ruota Addominale'],
    category: 'core',
    equipment: ['ab_wheel'],
    difficulty: 6
  },
  {
    id: 'HOLLOW_BODY',
    names: ['Hollow Body Hold', 'Hollow Hold', 'Hollow Body'],
    category: 'core',
    equipment: ['bodyweight'],
    isometric: true,
    difficulty: 5
  },
  {
    id: 'V_UPS',
    names: ['V-Ups', 'V Ups', 'V-Sit Ups'],
    category: 'core',
    equipment: ['bodyweight'],
    difficulty: 5
  },
  {
    id: 'RUSSIAN_TWIST',
    names: ['Russian Twist', 'Seated Twist'],
    category: 'core',
    equipment: ['bodyweight', 'dumbbell', 'medicine_ball'],
    difficulty: 4
  },
  {
    id: 'WOODCHOP',
    names: ['Woodchop', 'Cable Woodchop', 'Wood Chop'],
    category: 'core',
    equipment: ['cable', 'medicine_ball'],
    difficulty: 4
  },
  {
    id: 'CABLE_CRUNCH',
    names: ['Cable Crunch', 'Kneeling Cable Crunch', 'Crunch ai Cavi'],
    category: 'core',
    equipment: ['cable'],
    difficulty: 3
  },
  {
    id: 'SIT_UP',
    names: ['Sit Up', 'Sit-up'],
    category: 'core',
    equipment: ['bodyweight'],
    difficulty: 3
  },
  {
    id: 'CRUNCH',
    names: ['Crunch', 'Abdominal Crunch'],
    category: 'core',
    equipment: ['bodyweight'],
    difficulty: 2
  },
  {
    id: 'LEG_LOWER',
    names: ['Leg Lower', 'Leg Lowering', 'Lying Leg Lower'],
    category: 'core',
    equipment: ['bodyweight'],
    difficulty: 4
  },

  // ============ ACCESSORY ============
  {
    id: 'BICEP_CURL',
    names: ['Bicep Curl', 'Barbell Curl', 'Dumbbell Curl', 'Curl Bicipiti'],
    category: 'accessory',
    equipment: ['barbell', 'dumbbell', 'cable'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'TRICEP_PUSHDOWN',
    names: ['Tricep Pushdown', 'Cable Pushdown', 'Pushdown Tricipiti'],
    category: 'accessory',
    equipment: ['cable'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'SKULL_CRUSHERS',
    names: ['Skull Crushers', 'Lying Tricep Extension', 'French Press'],
    category: 'accessory',
    equipment: ['barbell', 'dumbbell'],
    isolation: true,
    difficulty: 4
  },
  {
    id: 'HAMMER_CURL',
    names: ['Hammer Curl', 'Neutral Grip Curl', 'Curl a Martello'],
    category: 'accessory',
    equipment: ['dumbbell'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'PREACHER_CURL',
    names: ['Preacher Curl', 'Scott Curl', 'Curl alla Panca Scott'],
    category: 'accessory',
    equipment: ['barbell', 'dumbbell', 'machine'],
    isolation: true,
    difficulty: 3
  },
  {
    id: 'CALF_RAISE',
    names: ['Calf Raise', 'Standing Calf Raise', 'Polpacci'],
    category: 'accessory',
    equipment: ['machine', 'bodyweight', 'dumbbell'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'SHRUGS',
    names: ['Shrugs', 'Shoulder Shrugs', 'Scrollate'],
    category: 'accessory',
    equipment: ['barbell', 'dumbbell'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'FOREARM_CURL',
    names: ['Forearm Curl', 'Wrist Curl', 'Curl Avambracci'],
    category: 'accessory',
    equipment: ['barbell', 'dumbbell'],
    isolation: true,
    difficulty: 1
  },
  {
    id: 'WRIST_EXTENSION',
    names: ['Wrist Extension', 'Reverse Wrist Curl'],
    category: 'accessory',
    equipment: ['barbell', 'dumbbell'],
    isolation: true,
    difficulty: 1
  },
  {
    id: 'NECK_CURL',
    names: ['Neck Curl', 'Neck Flexion', 'Neck Training'],
    category: 'accessory',
    equipment: ['plate', 'machine'],
    isolation: true,
    difficulty: 2
  },
  {
    id: 'HIP_ADDUCTION',
    names: ['Hip Adduction', 'Adductor Machine', 'Adduttori'],
    category: 'accessory',
    equipment: ['machine', 'cable'],
    isolation: true,
    difficulty: 1
  },
  {
    id: 'HIP_ABDUCTION',
    names: ['Hip Abduction', 'Abductor Machine', 'Abduttori'],
    category: 'accessory',
    equipment: ['machine', 'band'],
    isolation: true,
    difficulty: 1
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): ExerciseMetadata | undefined {
  return SUPPORTED_EXERCISES.find(e => e.id === id);
}

/**
 * Get exercise by name (case insensitive)
 */
export function getExerciseByName(name: string): ExerciseMetadata | undefined {
  const normalizedName = name.toLowerCase().trim();
  return SUPPORTED_EXERCISES.find(e =>
    e.names.some(n => n.toLowerCase() === normalizedName)
  );
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: string): ExerciseMetadata[] {
  return SUPPORTED_EXERCISES.filter(e => e.category === category);
}

/**
 * Get exercises by equipment
 */
export function getExercisesByEquipment(equipment: string): ExerciseMetadata[] {
  return SUPPORTED_EXERCISES.filter(e => e.equipment.includes(equipment));
}

/**
 * Get the effective exercise (follows maps_to if present)
 */
export function getEffectiveExercise(id: string): ExerciseMetadata | undefined {
  const exercise = getExerciseById(id);
  if (!exercise) return undefined;

  if (exercise.mapsTo) {
    return getExerciseById(exercise.mapsTo) || exercise;
  }
  return exercise;
}

/**
 * Get all exercise names (for autocomplete/search)
 */
export function getAllExerciseNames(): string[] {
  return SUPPORTED_EXERCISES.flatMap(e => e.names);
}

/**
 * Search exercises by query
 */
export function searchExercises(query: string): ExerciseMetadata[] {
  const normalizedQuery = query.toLowerCase().trim();
  return SUPPORTED_EXERCISES.filter(e =>
    e.names.some(n => n.toLowerCase().includes(normalizedQuery))
  );
}

console.log(`[Biomechanics] Exercise metadata loaded: ${SUPPORTED_EXERCISES.length} exercises`);
