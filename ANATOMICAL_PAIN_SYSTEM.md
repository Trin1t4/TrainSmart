# Anatomical Pain Tracking System

## Complete Documentation

**Version**: 1.0.0
**Date**: January 2025
**Author**: FitnessFlow Development Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Clinical Use Cases](#clinical-use-cases)
5. [Integration Guide](#integration-guide)
6. [API Reference](#api-reference)
7. [Clinical Evidence Base](#clinical-evidence-base)
8. [Future Enhancements](#future-enhancements)

---

## System Overview

The Anatomical Pain Tracking System is a comprehensive, evidence-based platform for managing musculoskeletal pain in training contexts. It bridges the gap between clinical assessment and practical exercise programming through five integrated subsystems.

### Key Features

- **51 Golden Standard Clinical Tests** - Evidence-based assessment protocols
- **75 Exercise Classifications** - Complete anatomical movement breakdown
- **15 Recovery Protocols** - Structured 3-phase rehabilitation programs
- **Intelligent Substitution Engine** - Automatic exercise modification/replacement
- **5 Functional Screening Protocols** - Quick and comprehensive assessment options

### Clinical Philosophy

This system is built on three core principles:

1. **Movement-Based Assessment** - Pain is understood through movement patterns, not just locations
2. **Directional Preference** - Based on McKenzie Method for spine, identifying movements that centralize vs peripheralize pain
3. **Progressive Loading** - Structured 3-phase protocols (Acute → Subacute → Return to Activity)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
│  (Screening Flow, Pain Logs, Exercise Substitution UI)      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               ANATOMICAL PAIN SYSTEM API                     │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Screening  │  │ Substitution │  │    Protocol      │   │
│  │   Engine    │  │    Engine    │  │  Recommendation  │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │             │
└─────────┼─────────────────┼────────────────────┼─────────────┘
          │                 │                    │
┌─────────▼─────────────────▼────────────────────▼─────────────┐
│                   CORE DATA LAYER                             │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │   Golden     │ │   Exercise   │ │      Recovery        │ │
│  │   Standard   │ │  Anatomical  │ │     Protocols        │ │
│  │    Tests     │ │Classification│ │   (15 protocols)     │ │
│  │ (51 tests)   │ │(75 exercises)│ │                      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Assessment** → User performs functional screening (5-30 min)
2. **Interpretation** → System identifies painful movement patterns
3. **Protocol Selection** → Appropriate recovery protocol recommended
4. **Program Adaptation** → Exercise substitutions/modifications generated
5. **Monitoring** → Track progress through protocol phases

---

## Core Components

### 1. Golden Standard Tests (`goldenStandardTests.ts`)

**Purpose**: Evidence-based clinical assessment tests for each body region.

**Database**: 51 tests covering:
- **Spine** (14 tests): Forward bend, McKenzie extensions, rotation tests, SLR, etc.
- **Hip** (10 tests): FADIR, Thomas test, Trendelenburg, 90/90 rotations, etc.
- **Knee** (9 tests): Lachman, McMurray, patellar grind, valgus/varus stress, etc.
- **Shoulder** (13 tests): Neer, Hawkins-Kennedy, empty can, Speed's, O'Brien, etc.
- **Ankle** (5 tests): Anterior drawer, talar tilt, Thompson, dorsiflexion assessment, etc.

**Test Structure**:
```typescript
{
  name: "Lachman Test",
  region: "knee",
  movements_tested: ["knee_anterior_translation"],
  procedure: "Patient supine, knee flexed 20-30°...",
  positive_indicates: ["ACL tear", "ACL insufficiency"],
  sensitivity: "High",
  specificity: "High",
  clinical_notes: "Gold standard for ACL assessment..."
}
```

**Key Functions**:
```typescript
getTestsByRegion('lumbar_spine')     // → All spine tests
getTestsByMovement('hip_flexion')    // → Tests assessing hip flexion
getQuickScreeningTests('shoulder')   // → High sensitivity/specificity tests
```

---

### 2. Exercise Anatomical Classification (`exerciseAnatomicalClassification.ts`)

**Purpose**: Complete anatomical breakdown of 75 exercises by movement patterns.

**Database**: 75 exercises across categories:
- **Lower Push** (15): Squats, lunges, step-ups, leg press, etc.
- **Lower Pull** (12): Deadlifts, RDLs, hip thrusts, Nordic curls, etc.
- **Upper Push Horizontal** (8): Bench press, push-ups, dips, floor press, etc.
- **Upper Push Vertical** (7): Overhead press, pike push-ups, lateral raises, etc.
- **Upper Pull Horizontal** (8): Rows, face pulls, inverted rows, etc.
- **Upper Pull Vertical** (6): Pull-ups, chin-ups, lat pulldowns, etc.
- **Core** (9): Planks, dead bugs, bird dogs, Pallof press, etc.

**Exercise Structure**:
```typescript
{
  exerciseName: "Back Squat",
  category: "lower_push",
  primaryRegions: ["lumbar_spine", "hip", "knee", "ankle"],
  movements: [
    {
      region: "lumbar_spine",
      primary: ["spinal_axial_compression"],
      secondary: ["neutral_spine_isometric"],
      phase_specific: {
        eccentric: ["spinal_axial_compression"],
        bottom: ["spinal_flexion"],  // buttwink risk
        concentric: ["spinal_axial_compression"]
      }
    },
    // ... hip, knee, ankle movement profiles
  ],
  contraindicated_if_pain_in: [
    "spinal_flexion", "hip_flexion", "knee_flexion"
  ],
  safe_alternatives: ["Box Squat", "Leg Press", "Bulgarian Split Squat"],
  clinical_notes: "Buttwink common if poor hip mobility..."
}
```

**Key Functions**:
```typescript
getExerciseProfile('Back Squat')                    // → Full anatomical profile
getExercisesByMovement('hip_flexion')               // → All exercises using hip flexion
findSafeAlternatives('Back Squat', ['spinal_flexion']) // → Safe substitutes
isExerciseContraindicated('Squat', 'knee_pain')     // → Boolean check
```

---

### 3. Recovery Protocols (`anatomicalRecoveryProtocols.ts`)

**Purpose**: Structured 3-phase rehabilitation protocols for specific pain patterns.

**Database**: 15 protocols covering:
- **Spine** (7): Flexion intolerance, extension intolerance, rotation pain, axial compression, lateral flexion, SI joint, thoracic mobility
- **Hip** (4): FAI/impingement, hip flexor strain, abductor weakness, IR restriction
- **Knee** (2): Patellofemoral pain syndrome, post-ACL reconstruction
- **Shoulder** (2): Subacromial impingement, rotator cuff tendinopathy

**Protocol Structure**:
```typescript
{
  movement_pattern: "spinal_flexion",
  protocol_name: "Flexion Intolerance Protocol",
  diagnosis_hints: [
    "Pain increases with forward bending",
    "Pain worse in morning",
    "Pain better with extension"
  ],
  common_in: [
    "Lumbar disc herniation",
    "Posterior annular tear",
    "Discogenic pain"
  ],

  // PHASE 1: ACUTE (2-4 weeks)
  phase_1_acute: {
    avoid_exercises: [
      "Conventional Deadlift (from floor)",
      "Barbell Row (bent-over)",
      "Sit-ups", ...
    ],
    recommended_exercises: [
      "McKenzie Extensions - 10 reps every 2-3 hours",
      "Dead Bug - 3x10",
      "Rack Pull (mid-thigh) - 3x8",
      "Chest-Supported Row - 3x10", ...
    ],
    goal: "Centralize pain, establish extension preference",
    duration: "2-4 weeks"
  },

  // PHASE 2: SUBACUTE (4-6 weeks)
  phase_2_subacute: {
    exercises: [
      "Romanian Deadlift (stop at hamstring stretch)",
      "Trap Bar Deadlift",
      "Box Squat", ...
    ],
    progression_criteria: "Pain-free in Phase 1 for 2+ weeks"
  },

  // PHASE 3: RETURN TO ACTIVITY
  phase_3_return: {
    exercises: ["Conventional Deadlift (perfect form)", ...],
    maintain: ["Daily McKenzie extensions", ...],
    criteria: "Pain-free Phase 2 for 2+ weeks"
  },

  red_flags: [
    "Cauda equina symptoms",
    "Progressive neurological deficits", ...
  ],

  clinical_pearls: [
    "McKenzie extensions both diagnostic and therapeutic",
    "Most respond within 2 weeks", ...
  ]
}
```

**Key Functions**:
```typescript
getProtocolByMovement('spinal_flexion')     // → Flexion intolerance protocol
getProtocolByName('Patellofemoral Pain')    // → PFPS protocol
getAppropriatePhase(protocol, weeksIn, 1)  // → Current phase based on timeline
```

---

### 4. Substitution Engine (`exerciseSubstitutionEngine.ts`)

**Purpose**: Intelligent exercise substitution and modification based on painful movements.

**Core Algorithm**:

1. **Identify Problematic Movements**: Check if exercise uses painful movements
2. **Check Contraindication**: Is exercise absolutely contraindicated?
3. **Generate Substitutions**: Find exercises in same category that avoid painful movements
4. **Score Alternatives**: Rank by similarity (category match, similar movements, same regions)
5. **Suggest Modifications**: If exercise can be modified safely

**Match Score Calculation**:
- Same category: +40 points
- Overlapping body regions: +30 points
- Similar (non-painful) movements: +20 points
- Listed as safe alternative: +10 points

**Modification Types**:
```typescript
{
  type: "rom",  // Range of motion
  description: "Limit squat depth to 50-70%",
  cues: ["Squat to parallel only", "Use box to control depth"],
  notes: "Prevents buttwink and excessive hip flexion"
}

{
  type: "position",  // Body/equipment position
  description: "Elevate starting position (rack pull)",
  cues: ["Start from pins at knee height"],
  notes: "Eliminates flexion at setup"
}

{
  type: "load",  // Weight adjustment
  description: "Reduce load 40-60%",
  cues: ["Use lighter weights", "Higher rep ranges"],
  notes: "Maintains pattern with less stress"
}

{
  type: "equipment",  // Equipment change
  description: "Use chest-supported variation",
  cues: ["Lie prone on bench", "No spinal flexion required"],
  notes: "Eliminates spinal load entirely"
}
```

**Key Functions**:
```typescript
// Find safe substitutions
findSafeSubstitutions(
  'Conventional Deadlift',
  ['spinal_flexion']
)
// → [{
//     exerciseName: "Trap Bar Deadlift",
//     matchScore: 75,
//     rationale: "same category; less spinal flexion"
//   }, ...]

// Modify existing exercise
modifyExerciseForPain('Back Squat', 'knee_flexion')
// → {
//     feasible: true,
//     modifications: [{
//       type: "rom",
//       description: "Limit depth to 60-90°",
//       cues: ["Use box squat at parallel height"]
//     }]
//   }

// Generate complete adapted program
generatePainAdaptedProgram(
  ['Back Squat', 'Deadlift', 'Barbell Row'],
  ['spinal_flexion']
)
// → {
//     modified_exercises: [
//       { original: "Back Squat", action: "modify", modifications: [...] },
//       { original: "Deadlift", action: "replace", replacement: "Trap Bar DL" },
//       { original: "Barbell Row", action: "replace", replacement: "Cable Row" }
//     ],
//     summary: "1 kept, 1 modified, 2 replaced",
//     protocol_recommendation: "Flexion Intolerance Protocol"
//   }

// Analyze program pain patterns
analyzeProgramPainPatterns(exercises, painfulMovements)
// → {
//     high_risk_exercises: [...],
//     moderate_risk_exercises: [...],
//     safe_exercises: [...],
//     recommendations: [...]
//   }
```

---

### 5. Functional Screening (`functionalScreening.ts`)

**Purpose**: Systematic movement screening to identify painful patterns and generate recommendations.

**Screening Protocols** (5 total):

1. **Lower Back Quick Screen** (5-7 min)
   - Forward bend, extension, rotation L/R, single-leg stance L/R
   - Identifies directional preference

2. **Lower Back Comprehensive** (20-30 min)
   - Includes quick screen + McKenzie protocol, cat-cow, instability tests, SLR, FABER
   - Detailed directional preference assessment

3. **Hip Quick Screen** (10 min)
   - FADIR, Thomas test, 90/90 IR, Trendelenburg
   - Identifies impingement, flexibility, and stability issues

4. **Knee Quick Screen** (8 min)
   - Bodyweight squat, single-leg squat, patellar grind, step-downs
   - Identifies patellofemoral pain and control deficits

5. **Shoulder Quick Screen** (10 min)
   - Neer, Hawkins-Kennedy, painful arc, empty can, ER strength
   - Identifies impingement and rotator cuff pathology

**Screening Flow**:

```
1. SELECT PROTOCOL
   ↓
2. PERFORM TESTS (user rates pain 0-10 for each test)
   ↓
3. INTERPRET RESULTS
   - Identify painful movements (pain ≥ 3/10)
   - Identify restrictions
   - Determine directional preference (spine)
   - Calculate severity (mild/moderate/severe)
   ↓
4. GENERATE MOVEMENT PROFILE
   - Pain patterns
   - Restrictions
   - Severity
   - Directional preference
   ↓
5. RECOMMENDATIONS
   - Recovery protocol(s)
   - Safe exercises
   - Avoid exercises
   - Specific clinical recommendations
```

**Movement Profile Structure**:
```typescript
{
  pain_patterns: ["spinal_flexion", "hip_flexion"],
  restrictions: ["hip_internal_rotation", "ankle_dorsiflexion"],
  directional_preference: "extension",  // flexion intolerant
  severity: "moderate",

  recommendations: [
    "MODERATE pain detected. Begin with modified programming.",
    "EXTENSION DIRECTIONAL PREFERENCE detected.",
    "Perform McKenzie extensions 10 reps every 2-3 hours.",
    "Avoid all forward bending exercises initially.",
    "Use rack pulls instead of conventional deadlifts.",
    "Limit squat depth to parallel (50-70%).",
    "Work on hip IR mobility daily (90/90 stretches)."
  ],

  safe_exercises: [
    "Rack Pull (knee height)",
    "Box Squat (parallel)",
    "Hip Thrust",
    "Chest-Supported Row", ...
  ],

  avoid_exercises: [
    "Conventional Deadlift (from floor)",
    "Deep Squats",
    "Bent-over Barbell Row",
    "Sit-ups", ...
  ],

  recommended_protocols: [
    { protocol_name: "Flexion Intolerance Protocol", ... },
    { protocol_name: "Hip Impingement Protocol", ... }
  ]
}
```

**Key Functions**:
```typescript
// Interpret screening results
interpretScreeningResults(results)
// → MovementProfile with pain patterns, recommendations, exercises

// Generate report
generateScreeningReport(results, profile)
// → Formatted markdown report

// Quick assessment (without full screening)
quickPainAssessment([
  { movement: 'spinal_flexion', pain: 7 },
  { movement: 'hip_flexion', pain: 4 }
])
// → { severity: 'moderate', primaryIssues: [...], recommendations: [...] }
```

---

## Clinical Use Cases

### Use Case 1: New User with Lower Back Pain

**Scenario**: User reports "lower back pain when bending forward and deadlifting."

**Workflow**:

1. **Screening** (Lower Back Quick Screen - 5 min)
   ```typescript
   const results = {
     protocol_used: "Lower Back Quick Screen",
     test_results: [
       { test_name: "Forward Bend", movement: "spinal_flexion", pain: 8 },
       { test_name: "Extension", movement: "spinal_extension", pain: 1 },
       { test_name: "Rotation R", movement: "spinal_rotation_right", pain: 3 },
       { test_name: "Rotation L", movement: "spinal_rotation_left", pain: 3 }
     ]
   };
   ```

2. **Interpretation**
   ```typescript
   const profile = interpretScreeningResults(results);
   // → {
   //     pain_patterns: ["spinal_flexion"],
   //     directional_preference: "extension",  // flexion intolerant!
   //     severity: "moderate",
   //     recommended_protocols: [Flexion Intolerance Protocol]
   //   }
   ```

3. **Protocol Application**
   - Phase 1 (Acute): Avoid all flexion, perform McKenzie extensions 10 reps every 2-3 hours
   - Replace: Conventional DL → Rack Pull, Barbell Row → Chest-Supported Row
   - Add: Dead bug, bird dog, planks

4. **Program Adaptation**
   ```typescript
   const adapted = generatePainAdaptedProgram(
     originalProgram,
     profile.pain_patterns
   );
   // → Automatic exercise substitutions
   ```

5. **Monitoring & Progression**
   - Week 1-4: Phase 1 exercises only
   - Week 5-10: If pain centralized, progress to Phase 2 (RDLs, trap bar DL)
   - Week 11+: If pain-free, cautiously return to conventional deadlifts

**Expected Outcome**: 80% of flexion-intolerant backs respond to McKenzie approach within 2-4 weeks with pain centralization.

---

### Use Case 2: Knee Pain During Squats

**Scenario**: User has anterior knee pain during squats, worse at depth.

**Workflow**:

1. **Screening** (Knee Quick Screen - 8 min)
   ```typescript
   const results = {
     test_results: [
       { test: "Bodyweight Squat", movement: "knee_flexion", pain: 6 },
       { test: "Single-Leg Squat R", movement: "knee_flexion", pain: 7 },
       { test: "Patellar Grind R", movement: "patellofemoral_compression", pain: 8 },
       { test: "Trendelenburg R", movement: "hip_abduction", pain: 0, rom_restriction: true }  // Positive!
     ]
   };
   ```

2. **Interpretation**
   - **Primary Issue**: Patellofemoral pain syndrome
   - **Contributing Factor**: Hip abductor weakness (positive Trendelenburg)

3. **Protocol**: Patellofemoral Pain Syndrome Protocol
   - **Phase 1**: Limit squat depth to 60-90° knee flexion, Spanish squats 3x30sec, clamshells 3x20

4. **Program Modifications**
   ```typescript
   modifyExerciseForPain('Back Squat', 'patellofemoral_compression')
   // → {
   //     modifications: [
   //       { type: "rom", description: "Limit depth to 60-90°", cues: ["Box squat at parallel"] },
   //       { type: "equipment", description: "Spanish Squat", notes: "Reduces PF compression" }
   //     ]
   //   }
   ```

5. **Critical Addition**: Hip strengthening
   - Clamshells, lateral walks, Copenhagen planks
   - Glute med weakness is THE most common contributor to PFPS

**Expected Outcome**: 70-80% of PFPS cases respond to load management + hip strengthening in 6-12 weeks.

---

### Use Case 3: Shoulder Impingement in Overhead Athlete

**Scenario**: CrossFit athlete with shoulder pain during overhead press and pull-ups.

**Workflow**:

1. **Screening** (Shoulder Quick Screen - 10 min)
   ```typescript
   const results = {
     test_results: [
       { test: "Neer R", movement: "shoulder_flexion", pain: 7 },
       { test: "Hawkins-Kennedy R", movement: "shoulder_internal_rotation", pain: 6 },
       { test: "Painful Arc R", movement: "shoulder_abduction", pain: 8 },  // 60-120° arc!
       { test: "ER Strength R", movement: "shoulder_external_rotation", pain: 2, weakness: true }
     ]
   };
   ```

2. **Diagnosis**: Classic subacromial impingement pattern + external rotator weakness

3. **Protocol**: Subacromial Impingement Syndrome Protocol
   - **Phase 1**: Avoid overhead, focus on face pulls (3x20), ER strengthening (3x15), scapular control
   - **Phase 2**: Progressive overhead ROM (landmine press → limited ROM OHP)
   - **Phase 3**: Full overhead press

4. **Program Modifications**
   ```typescript
   findSafeSubstitutions('Overhead Press', ['shoulder_flexion'])
   // → Landmine Press (matchScore: 85), DB Shoulder Press neutral grip (80), Floor Press (70)

   // Critical additions:
   // - Face pulls 15-20 reps BEFORE every upper session
   // - 2:1 pull:push ratio
   // - ER strengthening 3x/week
   ```

**Expected Outcome**: 90%+ of impingement cases respond to conservative management (scapular control + ER strengthening + load management) within 8-12 weeks.

---

### Use Case 4: Post-ACL Reconstruction Athlete

**Scenario**: 6 months post-ACL reconstruction, cleared for return to sport training.

**Workflow**:

1. **Screening**: Comprehensive knee assessment + strength testing
   - Quad strength LSI (limb symmetry index): 75% (NEEDS >90%)
   - Hamstring strength LSI: 80% (NEEDS >90%)
   - Single-leg hop test: 70% (NEEDS >90%)

2. **Protocol**: Post-ACL Reconstruction Protocol (Phase 3 - Return to Sport)
   - Still in Phase 2-3 transition based on strength deficits

3. **Program Focus**:
   ```typescript
   // Critical exercises (from protocol Phase 3):
   - Nordic Hamstring Curl - 3x8 (2x/week minimum for LIFE)
   - Bulgarian Split Squat - 3x8 each
   - Single-Leg RDL - 3x8 each
   - Step-ups - 3x10 each
   - Progressive plyometrics (box jumps, single-leg hops)
   ```

4. **Return to Sport Criteria** (must pass ALL):
   - Quad strength LSI >90%
   - Hamstring strength LSI >90%
   - Hop test battery >90% LSI
   - Psychological readiness (ACL-RSI score >60)
   - 9-12 months post-surgery (MINIMUM)

5. **Lifelong Prevention**:
   - Nordic curls 2x/week forever (reduces re-injury risk 50%+)
   - Maintain single-leg strength training

**Expected Outcome**: Athletes who meet ALL return-to-sport criteria have <10% re-injury rate. Those who return early (6-9 months) have 20-25% re-injury rate.

---

## Integration Guide

### Integration with Existing Pain Management Service

**File**: `packages/web/src/lib/painManagementService.ts`

Add these new methods:

```typescript
import {
  interpretScreeningResults,
  generatePainAdaptedProgram,
  findSafeSubstitutions,
  getProtocolByMovement
} from '@shared/utils/functionalScreening';
import { EXERCISE_ANATOMICAL_DATABASE } from '@shared/utils/exerciseAnatomicalClassification';

class PainManagementService {

  /**
   * Analyze cross-exercise pain patterns anatomically
   */
  async analyzeAnatomicalPainPattern(userId: string): Promise<{
    painful_movements: string[];
    affected_regions: BodyRegion[];
    recommended_protocol?: RecoveryProtocol;
    exercise_substitutions: Array<{ from: string; to: string; reason: string }>;
  }> {
    // 1. Get all pain logs for user from last 4 weeks
    const painLogs = await this.getPainLogsForUser(userId, 28);

    // 2. For each exercise with pain ≥4, get anatomical profile
    const painfulExercises = painLogs.filter(log => log.pain_level >= 4);

    const movementCounts: Record<string, number> = {};
    const regionSet = new Set<BodyRegion>();

    painfulExercises.forEach(log => {
      const exercise = EXERCISE_ANATOMICAL_DATABASE[log.exercise_name];
      if (!exercise) return;

      // Count movements
      exercise.movements.forEach(m => {
        regionSet.add(m.region);
        m.primary.forEach(movement => {
          movementCounts[movement] = (movementCounts[movement] || 0) + 1;
        });
      });
    });

    // 3. Find most common painful movements (appear in 2+ exercises)
    const painfulMovements = Object.entries(movementCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([movement, _]) => movement);

    // 4. Get recommended protocol for most common painful movement
    const protocol = painfulMovements.length > 0
      ? getProtocolByMovement(painfulMovements[0])
      : undefined;

    // 5. Generate substitutions for all painful exercises
    const substitutions = painfulExercises.map(log => {
      const result = findSafeSubstitutions(
        log.exercise_name,
        painfulMovements
      );

      const bestSub = result.safe_replacements[0];

      return {
        from: log.exercise_name,
        to: bestSub?.exerciseName || 'No safe alternative found',
        reason: bestSub?.rationale || 'Exercise classification not found'
      };
    });

    return {
      painful_movements: painfulMovements,
      affected_regions: Array.from(regionSet),
      recommended_protocol: protocol,
      exercise_substitutions: substitutions
    };
  }

  /**
   * Get safe exercise recommendations based on painful movements
   */
  async getSafeExerciseRecommendations(
    userId: string,
    currentProgram: Exercise[]
  ): Promise<{
    keep: string[];
    modify: Array<{ exercise: string; modification: any }>;
    replace: Array<{ from: string; to: string }>;
  }> {
    // Get user's pain pattern
    const pattern = await this.analyzeAnatomicalPainPattern(userId);

    // Generate adapted program
    const adapted = generatePainAdaptedProgram(
      currentProgram.map(e => e.name),
      pattern.painful_movements
    );

    return {
      keep: adapted.modified_exercises
        .filter(e => e.action === 'keep')
        .map(e => e.original),

      modify: adapted.modified_exercises
        .filter(e => e.action === 'modify')
        .map(e => ({
          exercise: e.original,
          modification: e.modifications
        })),

      replace: adapted.modified_exercises
        .filter(e => e.action === 'replace')
        .map(e => ({
          from: e.original,
          to: e.replacement || 'No alternative found'
        }))
    };
  }

  /**
   * Perform functional screening and get complete assessment
   */
  async performFunctionalScreening(
    userId: string,
    screeningResults: ScreeningResults
  ): Promise<{
    profile: MovementProfile;
    report: string;
    recommended_program_changes: any;
  }> {
    // Interpret screening
    const profile = interpretScreeningResults(screeningResults);

    // Generate report
    const report = generateScreeningReport(screeningResults, profile);

    // Get current program and generate adaptations
    const currentProgram = await this.getUserProgram(userId);
    const programChanges = await this.getSafeExerciseRecommendations(
      userId,
      currentProgram
    );

    // Store screening results in database
    await this.saveScreeningResults(userId, {
      date: screeningResults.date,
      protocol: screeningResults.protocol_used,
      profile,
      report
    });

    return {
      profile,
      report,
      recommended_program_changes: programChanges
    };
  }
}
```

### UI Integration Points

**1. Screening Flow Component** (`packages/web/src/components/ScreeningFlow.tsx`):
```typescript
import { SCREENING_PROTOCOLS, interpretScreeningResults } from '@shared/utils/functionalScreening';

export function ScreeningFlow() {
  const [protocol, setProtocol] = useState<ScreeningProtocol | null>(null);
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);

  // Render protocol selection → test-by-test UI → results interpretation
}
```

**2. Exercise Substitution Modal** (`packages/web/src/components/ExerciseSubstitutionModal.tsx`):
```typescript
import { findSafeSubstitutions, modifyExerciseForPain } from '@shared/utils/exerciseSubstitutionEngine';

export function ExerciseSubstitutionModal({ exercise, painfulMovements }) {
  const substitutions = findSafeSubstitutions(exercise, painfulMovements);
  const modifications = modifyExerciseForPain(exercise, painfulMovements[0]);

  // Render substitution options + modification options
}
```

**3. Pain Pattern Dashboard** (`packages/web/src/components/PainPatternDashboard.tsx`):
```typescript
import { analyzeProgramPainPatterns } from '@shared/utils/exerciseSubstitutionEngine';

export function PainPatternDashboard({ userId }) {
  const pattern = useQuery(['pain-pattern', userId], () =>
    painManagementService.analyzeAnatomicalPainPattern(userId)
  );

  // Render: painful movements chart, affected regions, protocol recommendation
}
```

---

## API Reference

### Golden Standard Tests

```typescript
// Get all tests
GOLDEN_STANDARD_TESTS: Record<string, GoldenStandardTest>

// Query functions
getTestsByRegion(region: BodyRegion): GoldenStandardTest[]
getTestsByMovement(movementKey: string): GoldenStandardTest[]
getTestByName(testName: string): GoldenStandardTest | undefined
getQuickScreeningTests(region: BodyRegion): GoldenStandardTest[]
getComprehensiveTestBattery(region: BodyRegion): {
  screening: GoldenStandardTest[];
  confirmatory: GoldenStandardTest[];
}
```

### Exercise Classification

```typescript
// Get all exercises
EXERCISE_ANATOMICAL_DATABASE: Record<string, ExerciseAnatomicalProfile>

// Query functions
getExerciseProfile(exerciseName: string): ExerciseAnatomicalProfile | undefined
getExercisesByMovement(movementKey: string): string[]
getExercisesByCategory(category: ExerciseCategory): ExerciseAnatomicalProfile[]
isExerciseContraindicated(exerciseName: string, painfulMovement: string): boolean
getExerciseMovements(exerciseName: string): string[]
findSafeAlternatives(exerciseName: string, painfulMovements: string[]): string[]
```

### Recovery Protocols

```typescript
// Get all protocols
ANATOMICAL_RECOVERY_PROTOCOLS: Record<string, RecoveryProtocol>

// Query functions
getProtocolByMovement(movementKey: string): RecoveryProtocol | undefined
getProtocolsByDiagnosis(diagnosis: string): RecoveryProtocol[]
getProtocolByName(protocolName: string): RecoveryProtocol | undefined
hasRedFlags(protocol: RecoveryProtocol, symptoms: string[]): boolean
getAppropriatePhase(protocol: RecoveryProtocol, weeksInProtocol: number, currentPhase: number): PhaseProtocol
```

### Substitution Engine

```typescript
// Main functions
findSafeSubstitutions(
  exerciseName: string,
  painfulMovements: string[],
  allAvailableExercises?: string[]
): SubstitutionResult

modifyExerciseForPain(
  exerciseName: string,
  painfulMovement: string
): ModificationResult

generatePainAdaptedProgram(
  originalExercises: string[],
  painfulMovements: string[]
): PainAdaptedProgram

analyzeProgramPainPatterns(
  exercises: string[],
  painfulMovements: string[]
): {
  high_risk_exercises: string[];
  moderate_risk_exercises: string[];
  safe_exercises: string[];
  movement_frequency: Record<string, number>;
  recommendations: string[];
}

getEducationalSubstitution(
  exerciseName: string,
  painfulMovement: string
): {
  shouldSubstitute: boolean;
  reasoning: string;
  bestAlternative?: string;
  modifications?: ExerciseModification[];
  learningPoints: string[];
}
```

### Functional Screening

```typescript
// Screening protocols
SCREENING_PROTOCOLS: Record<string, ScreeningProtocol>

// Main functions
interpretScreeningResults(results: ScreeningResults): MovementProfile
generateScreeningReport(results: ScreeningResults, profile: MovementProfile): string
quickPainAssessment(painPoints: Array<{ movement: string; pain: number }>): {
  severity: 'mild' | 'moderate' | 'severe';
  primaryIssues: string[];
  quickRecommendations: string[];
}

// Utility functions
getAvailableScreeningProtocols(): ScreeningProtocol[]
getScreeningProtocol(name: string): ScreeningProtocol | undefined
createScreeningResultTemplate(protocolName: string): ScreeningResults | undefined
```

---

## Clinical Evidence Base

### McKenzie Method (Directional Preference)

- **Evidence**: Multiple RCTs show 70-80% of mechanical back pain patients have directional preference
- **Implementation**: Forward bend test + extension test (McKenzie extensions)
- **Clinical Pearl**: Pain centralization = good prognostic sign
- **Source**: McKenzie, R. (1981). *The Lumbar Spine: Mechanical Diagnosis and Therapy*

### Patellofemoral Pain Syndrome

- **Hip Strengthening**: RCTs show hip abductor strengthening reduces PFPS symptoms 60-70%
- **Spanish Squat**: Reduces patellofemoral compression via posterior tibial translation
- **Leg Extension**: High anterior shear force = often problematic. Limited ROM (90-45°) safer.
- **Source**: Nascimento et al. (2018), *British Journal of Sports Medicine*

### ACL Injury Prevention

- **Nordic Hamstring Curl**: Reduces ACL injury risk by 50%+ in multiple large RCTs
- **Neuromuscular Training**: Reduces ACL injury 50%+ in female athletes
- **Return to Sport Timing**: Every 1-month delay reduces re-injury risk. <9 months = 20-25% re-injury rate.
- **Source**: Grindem et al. (2016), *British Journal of Sports Medicine*

### Shoulder Impingement

- **External Rotation Strengthening**: Core treatment. Addresses rotator cuff weakness.
- **Scapular Control**: Poor scapular kinematics in 67-100% of impingement cases
- **Pull:Push Ratio**: 2:1 ratio recommended for shoulder health
- **Conservative Management**: 90%+ success rate with exercise + load management
- **Source**: Cools et al. (2014), *British Journal of Sports Medicine*

---

## Future Enhancements

### Phase 2 (Q2 2025)

1. **Video Library Integration**
   - Add `video_ref` links to actual demonstration videos
   - Embedded video player in screening flow

2. **AI-Enhanced Pattern Recognition**
   - Machine learning model to identify pain patterns from free-text descriptions
   - Predict optimal protocol based on user demographics + symptoms

3. **Progress Tracking Dashboard**
   - Visual timeline of pain ratings across protocol phases
   - Automatic phase progression suggestions based on criteria

4. **Mobile App Integration**
   - Mobile-first screening flow
   - Push notifications for McKenzie extensions (every 2-3 hours)
   - Daily protocol exercise reminders

### Phase 3 (Q3 2025)

5. **Telehealth Integration**
   - Share screening reports with healthcare providers
   - Virtual PT review of movement screening videos

6. **Advanced Biomechanics**
   - Joint angle analysis from video
   - Real-time form feedback using computer vision

7. **Research Data Collection**
   - Anonymized outcome tracking for protocol effectiveness
   - Continuous improvement of protocols based on real-world data

---

## Conclusion

The Anatomical Pain Tracking System represents a complete bridge between clinical assessment and practical training programming. By systematically identifying painful movement patterns, applying evidence-based recovery protocols, and intelligently modifying exercise programs, we enable users to train effectively despite pain while progressing toward full recovery.

**Core Strengths**:
- Evidence-based (51 gold standard tests, 15 clinically-validated protocols)
- Comprehensive (75 exercises, all major movement categories)
- Intelligent (automatic substitution engine with scoring algorithm)
- Practical (5-30 minute screening options, clear 3-phase protocols)
- Educational (learning points, clinical notes, red flags)

**Clinical Impact**:
- Reduces inappropriate training through pain
- Accelerates recovery through structured progression
- Educates users on pain mechanisms and self-management
- Prevents chronification through early intervention

---

**For Questions/Support**: Contact development team or consult clinical documentation.

**Last Updated**: January 2025
**Version**: 1.0.0
