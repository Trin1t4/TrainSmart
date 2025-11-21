/**
 * Comprehensive Test Suite for Anatomical Pain Tracking System
 *
 * Tests all major components:
 * - Golden Standard Tests
 * - Exercise Anatomical Classification
 * - Recovery Protocols
 * - Substitution Engine
 * - Functional Screening
 */

// NOTE: Jest types not installed in shared package
// Uncomment when running tests with Jest:
// import { describe, it, expect } from '@jest/globals';

// Golden Standard Tests
import {
  GOLDEN_STANDARD_TESTS,
  getTestsByRegion,
  getTestsByMovement,
  getTestByName,
  TEST_COUNT
} from '../goldenStandardTests';

// Exercise Classification
import {
  EXERCISE_ANATOMICAL_DATABASE,
  getExercisesByMovement,
  findSafeAlternatives,
  getExerciseProfile,
  isExerciseContraindicated,
  EXERCISE_COUNT
} from '../exerciseAnatomicalClassification';

// Recovery Protocols
import {
  ANATOMICAL_RECOVERY_PROTOCOLS,
  getProtocolByMovement,
  getProtocolByName,
  PROTOCOL_COUNT
} from '../anatomicalRecoveryProtocols';

// Substitution Engine
import {
  findSafeSubstitutions,
  modifyExerciseForPain,
  generatePainAdaptedProgram,
  analyzeProgramPainPatterns,
  getEducationalSubstitution
} from '../exerciseSubstitutionEngine';

// Functional Screening
import {
  interpretScreeningResults,
  generateScreeningReport,
  quickPainAssessment,
  SCREENING_PROTOCOLS,
  SCREENING_PROTOCOL_COUNT
} from '../functionalScreening';

// =============================================================================
// GOLDEN STANDARD TESTS
// =============================================================================

describe('Golden Standard Tests', () => {
  it('should have 51+ clinical tests', () => {
    expect(TEST_COUNT).toBeGreaterThanOrEqual(51);
    expect(Object.keys(GOLDEN_STANDARD_TESTS).length).toBe(TEST_COUNT);
  });

  it('should get tests by region', () => {
    const spineTests = getTestsByRegion('lumbar_spine');
    expect(spineTests.length).toBeGreaterThan(0);
    expect(spineTests.every((test) => test.region === 'lumbar_spine')).toBe(true);

    const shoulderTests = getTestsByRegion('shoulder');
    expect(shoulderTests.length).toBeGreaterThan(0);
    expect(shoulderTests.every((test) => test.region === 'shoulder')).toBe(true);
  });

  it('should get tests by movement', () => {
    const flexionTests = getTestsByMovement('spinal_flexion');
    expect(flexionTests.length).toBeGreaterThan(0);
    expect(
      flexionTests.every((test) => test.movements_tested.includes('spinal_flexion'))
    ).toBe(true);
  });

  it('should find test by name (fuzzy match)', () => {
    const test = getTestByName('lachman');
    expect(test).toBeDefined();
    expect(test?.name.toLowerCase()).toContain('lachman');
  });

  it('should have proper test structure', () => {
    const test = GOLDEN_STANDARD_TESTS['lachman_test'];
    expect(test).toBeDefined();
    expect(test.name).toBeDefined();
    expect(test.region).toBeDefined();
    expect(test.movements_tested).toBeInstanceOf(Array);
    expect(test.procedure).toBeDefined();
    expect(test.positive_indicates).toBeInstanceOf(Array);
  });

  it('should categorize tests by sensitivity/specificity', () => {
    const allTests = Object.values(GOLDEN_STANDARD_TESTS);
    const highSensitivity = allTests.filter((t) => t.sensitivity === 'High');
    const highSpecificity = allTests.filter((t) => t.specificity === 'High');

    expect(highSensitivity.length).toBeGreaterThan(0);
    expect(highSpecificity.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// EXERCISE ANATOMICAL CLASSIFICATION
// =============================================================================

describe('Exercise Anatomical Classification', () => {
  it('should have 70+ exercises classified', () => {
    expect(EXERCISE_COUNT).toBeGreaterThanOrEqual(70);
    expect(Object.keys(EXERCISE_ANATOMICAL_DATABASE).length).toBe(EXERCISE_COUNT);
  });

  it('should get exercises by movement', () => {
    const squats = getExercisesByMovement('hip_flexion');
    expect(squats.length).toBeGreaterThan(0);
    expect(squats).toContain('Back Squat');
  });

  it('should get exercise profile', () => {
    const squat = getExerciseProfile('Back Squat');
    expect(squat).toBeDefined();
    expect(squat?.exerciseName).toBe('Back Squat');
    expect(squat?.primaryRegions).toContain('lumbar_spine');
    expect(squat?.movements.length).toBeGreaterThan(0);
  });

  it('should identify contraindicated exercises', () => {
    const isContra = isExerciseContraindicated('Back Squat', 'spinal_flexion');
    expect(typeof isContra).toBe('boolean');
  });

  it('should find safe alternatives', () => {
    const alternatives = findSafeAlternatives('Back Squat', ['spinal_flexion']);
    expect(alternatives.length).toBeGreaterThan(0);
    // Alternatives should be in same category and avoid painful movement
  });

  it('should have proper exercise structure', () => {
    const deadlift = getExerciseProfile('Conventional Deadlift');
    expect(deadlift).toBeDefined();
    expect(deadlift?.category).toBe('lower_pull');
    expect(deadlift?.primaryRegions).toBeInstanceOf(Array);
    expect(deadlift?.movements).toBeInstanceOf(Array);
    expect(deadlift?.contraindicated_if_pain_in).toBeInstanceOf(Array);
    expect(deadlift?.safe_alternatives).toBeInstanceOf(Array);
  });

  it('should classify exercises by category', () => {
    const allExercises = Object.values(EXERCISE_ANATOMICAL_DATABASE);
    const categories = new Set(allExercises.map((e) => e.category));

    expect(categories.has('lower_push')).toBe(true);
    expect(categories.has('lower_pull')).toBe(true);
    expect(categories.has('upper_push_horizontal')).toBe(true);
    expect(categories.has('upper_pull_vertical')).toBe(true);
    expect(categories.has('core')).toBe(true);
  });
});

// =============================================================================
// RECOVERY PROTOCOLS
// =============================================================================

describe('Recovery Protocols', () => {
  it('should have 15+ recovery protocols', () => {
    expect(PROTOCOL_COUNT).toBeGreaterThanOrEqual(15);
    expect(Object.keys(ANATOMICAL_RECOVERY_PROTOCOLS).length).toBe(PROTOCOL_COUNT);
  });

  it('should get protocol by movement', () => {
    const protocol = getProtocolByMovement('spinal_flexion');
    expect(protocol).toBeDefined();
    expect(protocol?.movement_pattern).toBe('spinal_flexion');
  });

  it('should get protocol by name', () => {
    const protocol = getProtocolByName('Flexion Intolerance');
    expect(protocol).toBeDefined();
    expect(protocol?.protocol_name).toContain('Flexion Intolerance');
  });

  it('should have complete 3-phase structure', () => {
    const protocol = ANATOMICAL_RECOVERY_PROTOCOLS['flexion_intolerance'];
    expect(protocol).toBeDefined();

    // Phase 1
    expect(protocol.phase_1_acute).toBeDefined();
    expect(protocol.phase_1_acute.avoid_exercises).toBeInstanceOf(Array);
    expect(protocol.phase_1_acute.recommended_exercises).toBeInstanceOf(Array);
    expect(protocol.phase_1_acute.goal).toBeDefined();
    expect(protocol.phase_1_acute.duration).toBeDefined();

    // Phase 2
    expect(protocol.phase_2_subacute).toBeDefined();
    expect(protocol.phase_2_subacute.recommended_exercises).toBeDefined();

    // Phase 3
    expect(protocol.phase_3_return).toBeDefined();
    expect(protocol.phase_3_return.recommended_exercises).toBeDefined();
  });

  it('should include red flags', () => {
    const protocol = ANATOMICAL_RECOVERY_PROTOCOLS['flexion_intolerance'];
    expect(protocol.red_flags).toBeDefined();
    expect(protocol.red_flags!.length).toBeGreaterThan(0);
  });

  it('should have clinical pearls', () => {
    const protocol = ANATOMICAL_RECOVERY_PROTOCOLS['flexion_intolerance'];
    expect(protocol.clinical_pearls).toBeDefined();
    expect(protocol.clinical_pearls!.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// SUBSTITUTION ENGINE
// =============================================================================

describe('Substitution Engine', () => {
  it('should find safe substitutions for exercise', () => {
    const result = findSafeSubstitutions('Conventional Deadlift', ['spinal_flexion']);

    expect(result).toBeDefined();
    expect(result.safe_replacements).toBeInstanceOf(Array);
    expect(result.rationale).toBeDefined();

    if (result.safe_replacements.length > 0) {
      const first = result.safe_replacements[0];
      expect(first.exerciseName).toBeDefined();
      expect(first.matchScore).toBeGreaterThanOrEqual(0);
      expect(first.matchScore).toBeLessThanOrEqual(100);
      expect(first.rationale).toBeDefined();
    }
  });

  it('should suggest exercise modifications', () => {
    const result = modifyExerciseForPain('Back Squat', 'spinal_flexion');

    expect(result).toBeDefined();
    expect(result.modified).toBeDefined();
    expect(result.feasible).toBeDefined();
    expect(result.rationale).toBeDefined();

    if (result.modifications.length > 0) {
      const mod = result.modifications[0];
      expect(mod.type).toBeDefined();
      expect(mod.description).toBeDefined();
      expect(mod.cues).toBeInstanceOf(Array);
    }
  });

  it('should generate pain-adapted program', () => {
    const originalProgram = [
      'Back Squat',
      'Conventional Deadlift',
      'Barbell Row',
      'Bench Press',
      'Overhead Press'
    ];

    const result = generatePainAdaptedProgram(originalProgram, ['spinal_flexion']);

    expect(result).toBeDefined();
    expect(result.modified_exercises.length).toBe(originalProgram.length);
    expect(result.summary).toBeDefined();

    const actions = result.modified_exercises.map((e) => e.action);
    expect(actions).toContain('keep'); // Some exercises should be safe
    expect(actions.some((a) => a === 'replace' || a === 'modify')).toBe(true); // Some should change
  });

  it('should analyze program pain patterns', () => {
    const program = ['Back Squat', 'Conventional Deadlift', 'Romanian Deadlift'];
    const result = analyzeProgramPainPatterns(program, ['spinal_flexion']);

    expect(result).toBeDefined();
    expect(result.high_risk_exercises).toBeInstanceOf(Array);
    expect(result.moderate_risk_exercises).toBeInstanceOf(Array);
    expect(result.safe_exercises).toBeInstanceOf(Array);
    expect(result.movement_frequency).toBeDefined();
    expect(result.recommendations).toBeInstanceOf(Array);
  });

  it('should provide educational substitution with learning points', () => {
    const result = getEducationalSubstitution('Conventional Deadlift', 'spinal_flexion');

    expect(result).toBeDefined();
    expect(result.shouldSubstitute).toBeDefined();
    expect(result.reasoning).toBeDefined();
    expect(result.learningPoints).toBeInstanceOf(Array);
    expect(result.learningPoints.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// FUNCTIONAL SCREENING
// =============================================================================

describe('Functional Screening', () => {
  it('should have 5 screening protocols', () => {
    expect(SCREENING_PROTOCOL_COUNT).toBe(5);
    expect(Object.keys(SCREENING_PROTOCOLS).length).toBe(5);
  });

  it('should interpret screening results', () => {
    const mockResults = {
      protocol_used: 'Lower Back Quick Screen',
      date: '2025-01-15',
      test_results: [
        {
          test_name: 'Standing Forward Bend',
          movement_tested: 'spinal_flexion',
          pain_level: 7,
          rom_restriction: true,
          notes: 'Sharp pain at L4-L5'
        },
        {
          test_name: 'Standing Extension',
          movement_tested: 'spinal_extension',
          pain_level: 2,
          rom_restriction: false,
          notes: 'Minimal discomfort'
        },
        {
          test_name: 'Seated Rotation Right',
          movement_tested: 'spinal_rotation_right',
          pain_level: 3,
          rom_restriction: false
        }
      ]
    };

    const profile = interpretScreeningResults(mockResults);

    expect(profile).toBeDefined();
    expect(profile.pain_patterns).toBeInstanceOf(Array);
    expect(profile.pain_patterns).toContain('spinal_flexion');
    expect(profile.restrictions).toBeInstanceOf(Array);
    expect(profile.severity).toBeDefined();
    expect(['mild', 'moderate', 'severe']).toContain(profile.severity);
    expect(profile.directional_preference).toBe('extension'); // Flexion painful, extension OK
    expect(profile.recommendations).toBeInstanceOf(Array);
    expect(profile.safe_exercises).toBeInstanceOf(Array);
    expect(profile.avoid_exercises).toBeInstanceOf(Array);
  });

  it('should generate screening report', () => {
    const mockResults = {
      protocol_used: 'Knee Quick Screen',
      date: '2025-01-15',
      test_results: [
        {
          test_name: 'Bodyweight Squat',
          movement_tested: 'knee_flexion',
          pain_level: 5,
          rom_restriction: false
        },
        {
          test_name: 'Patellar Grind Test',
          movement_tested: 'patellofemoral_compression',
          pain_level: 6,
          rom_restriction: false
        }
      ]
    };

    const profile = interpretScreeningResults(mockResults);
    const report = generateScreeningReport(mockResults, profile);

    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    expect(report).toContain('MOVEMENT SCREENING REPORT');
    expect(report).toContain('Pain Patterns Identified');
    expect(report).toContain('Recommendations');
  });

  it('should perform quick pain assessment', () => {
    const painPoints = [
      { movement: 'spinal_flexion', pain: 7 },
      { movement: 'hip_flexion', pain: 4 },
      { movement: 'knee_flexion', pain: 3 }
    ];

    const result = quickPainAssessment(painPoints);

    expect(result).toBeDefined();
    expect(result.severity).toBeDefined();
    expect(['mild', 'moderate', 'severe']).toContain(result.severity);
    expect(result.primaryIssues).toBeInstanceOf(Array);
    expect(result.quickRecommendations).toBeInstanceOf(Array);
  });

  it('should determine directional preference correctly', () => {
    // Flexion intolerant (extension preference)
    const flexionIntolerant = {
      protocol_used: 'Lower Back Quick Screen',
      date: '2025-01-15',
      test_results: [
        { test_name: 'Forward Bend', movement_tested: 'spinal_flexion', pain_level: 8, rom_restriction: true },
        { test_name: 'Extension', movement_tested: 'spinal_extension', pain_level: 1, rom_restriction: false }
      ]
    };

    const profile1 = interpretScreeningResults(flexionIntolerant);
    expect(profile1.directional_preference).toBe('extension');

    // Extension intolerant (flexion preference)
    const extensionIntolerant = {
      protocol_used: 'Lower Back Quick Screen',
      date: '2025-01-15',
      test_results: [
        { test_name: 'Forward Bend', movement_tested: 'spinal_flexion', pain_level: 1, rom_restriction: false },
        { test_name: 'Extension', movement_tested: 'spinal_extension', pain_level: 8, rom_restriction: true }
      ]
    };

    const profile2 = interpretScreeningResults(extensionIntolerant);
    expect(profile2.directional_preference).toBe('flexion');
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('System Integration', () => {
  it('should complete full workflow: screening → profile → substitutions', () => {
    // 1. Screening
    const screeningResults = {
      protocol_used: 'Lower Back Quick Screen',
      date: '2025-01-15',
      test_results: [
        {
          test_name: 'Standing Forward Bend',
          movement_tested: 'spinal_flexion',
          pain_level: 7,
          rom_restriction: true
        }
      ]
    };

    // 2. Interpret to get profile
    const profile = interpretScreeningResults(screeningResults);
    expect(profile.pain_patterns).toContain('spinal_flexion');

    // 3. Use profile to generate program adaptations
    const originalProgram = ['Conventional Deadlift', 'Barbell Row', 'Back Squat'];
    const adaptedProgram = generatePainAdaptedProgram(
      originalProgram,
      profile.pain_patterns
    );

    expect(adaptedProgram.modified_exercises.length).toBe(3);
    expect(
      adaptedProgram.modified_exercises.some((e) => e.action === 'replace')
    ).toBe(true);

    // 4. Check protocol recommendation
    expect(adaptedProgram.protocol_recommendation).toBeDefined();
    expect(adaptedProgram.protocol_recommendation).toContain('Protocol');
  });

  it('should link tests → movements → exercises → protocols', () => {
    // 1. Get test for spinal flexion
    const tests = getTestsByMovement('spinal_flexion');
    expect(tests.length).toBeGreaterThan(0);

    // 2. Get exercises using that movement
    const exercises = getExercisesByMovement('spinal_flexion');
    expect(exercises.length).toBeGreaterThan(0);

    // 3. Get protocol for that movement
    const protocol = getProtocolByMovement('spinal_flexion');
    expect(protocol).toBeDefined();

    // 4. Check protocol recommends avoiding those exercises in phase 1
    const phase1 = protocol!.phase_1_acute;
    expect(phase1.avoid_exercises.length).toBeGreaterThan(0);

    // Verify some exercises that use spinal flexion are in avoid list
    const deadliftInAvoid = phase1.avoid_exercises.some((e) =>
      e.toLowerCase().includes('deadlift')
    );
    expect(deadliftInAvoid).toBe(true);
  });

  it('should provide consistent recommendations across system', () => {
    const painfulMovement = 'spinal_flexion';

    // Get protocol recommendation
    const protocol = getProtocolByMovement(painfulMovement);
    const protocolAvoids = protocol!.phase_1_acute.avoid_exercises;

    // Get exercises that use this movement
    const exercisesUsingMovement = getExercisesByMovement(painfulMovement);

    // Get substitutions for one of those exercises
    if (exercisesUsingMovement.length > 0) {
      const result = findSafeSubstitutions(
        exercisesUsingMovement[0],
        [painfulMovement]
      );

      // Safe replacements should NOT use the painful movement
      result.safe_replacements.forEach((replacement) => {
        const repProfile = getExerciseProfile(replacement.exerciseName);
        if (repProfile) {
          const repMovements = repProfile.movements.flatMap((m) => [
            ...m.primary,
            ...m.secondary
          ]);
          expect(repMovements).not.toContain(painfulMovement);
        }
      });
    }
  });
});

// =============================================================================
// EDGE CASES AND ERROR HANDLING
// =============================================================================

describe('Edge Cases', () => {
  it('should handle non-existent exercise gracefully', () => {
    const result = findSafeSubstitutions('Fake Exercise XYZ', ['spinal_flexion']);
    expect(result.safe_replacements.length).toBe(0);
    expect(result.rationale).toContain('not found');
  });

  it('should handle empty painful movements array', () => {
    const result = generatePainAdaptedProgram(['Back Squat'], []);
    expect(result.modified_exercises[0].action).toBe('keep');
  });

  it('should handle exercise with no painful movements', () => {
    const result = findSafeSubstitutions('Bench Press', ['spinal_flexion']);
    expect(result.rationale).toContain('does not involve');
  });

  it('should handle screening with no pain', () => {
    const noPainResults = {
      protocol_used: 'Lower Back Quick Screen',
      date: '2025-01-15',
      test_results: [
        { test_name: 'Test 1', movement_tested: 'spinal_flexion', pain_level: 0, rom_restriction: false },
        { test_name: 'Test 2', movement_tested: 'spinal_extension', pain_level: 0, rom_restriction: false }
      ]
    };

    const profile = interpretScreeningResults(noPainResults);
    expect(profile.pain_patterns.length).toBe(0);
    expect(profile.severity).toBe('mild');
  });
});

// =============================================================================
// DATA COMPLETENESS
// =============================================================================

describe('Data Completeness', () => {
  it('all exercises should have safe alternatives', () => {
    const exercisesWithoutAlternatives = Object.values(EXERCISE_ANATOMICAL_DATABASE)
      .filter((ex) => !ex.safe_alternatives || ex.safe_alternatives.length === 0);

    // Allow some exercises to not have alternatives (like specialized ones)
    const percentageWithAlternatives =
      ((EXERCISE_COUNT - exercisesWithoutAlternatives.length) / EXERCISE_COUNT) * 100;

    expect(percentageWithAlternatives).toBeGreaterThan(70); // At least 70% should have alternatives
  });

  it('all protocols should have all 3 phases', () => {
    const protocols = Object.values(ANATOMICAL_RECOVERY_PROTOCOLS);

    protocols.forEach((protocol) => {
      expect(protocol.phase_1_acute).toBeDefined();
      expect(protocol.phase_2_subacute).toBeDefined();
      expect(protocol.phase_3_return).toBeDefined();

      expect(protocol.phase_1_acute.recommended_exercises.length).toBeGreaterThan(0);
      expect(protocol.phase_2_subacute.recommended_exercises).toBeDefined();
      expect(protocol.phase_3_return.recommended_exercises).toBeDefined();
    });
  });

  it('all tests should have procedures and indicators', () => {
    const tests = Object.values(GOLDEN_STANDARD_TESTS);

    tests.forEach((test) => {
      expect(test.procedure).toBeDefined();
      expect(test.procedure.length).toBeGreaterThan(20); // Meaningful procedure
      expect(test.positive_indicates.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// SUMMARY TEST
// =============================================================================

describe('System Summary', () => {
  it('should report complete system statistics', () => {
    console.log('\n=== ANATOMICAL PAIN TRACKING SYSTEM STATISTICS ===');
    console.log(`Golden Standard Tests: ${TEST_COUNT}`);
    console.log(`Exercise Classifications: ${EXERCISE_COUNT}`);
    console.log(`Recovery Protocols: ${PROTOCOL_COUNT}`);
    console.log(`Screening Protocols: ${SCREENING_PROTOCOL_COUNT}`);

    const byRegion = {
      spine: getTestsByRegion('lumbar_spine').length + getTestsByRegion('cervical_spine').length,
      hip: getTestsByRegion('hip').length,
      knee: getTestsByRegion('knee').length,
      shoulder: getTestsByRegion('shoulder').length,
      ankle: getTestsByRegion('ankle').length
    };

    console.log('\nTests by Region:');
    Object.entries(byRegion).forEach(([region, count]) => {
      console.log(`  ${region}: ${count}`);
    });

    const exerciseCategories = Object.values(EXERCISE_ANATOMICAL_DATABASE).reduce(
      (acc, ex) => {
        acc[ex.category] = (acc[ex.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('\nExercises by Category:');
    Object.entries(exerciseCategories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    console.log('\n===================================================\n');

    // Verification
    expect(TEST_COUNT).toBeGreaterThanOrEqual(51);
    expect(EXERCISE_COUNT).toBeGreaterThanOrEqual(70);
    expect(PROTOCOL_COUNT).toBeGreaterThanOrEqual(15);
  });
});
