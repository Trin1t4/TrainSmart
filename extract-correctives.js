/**
 * Script per estrarre tutti gli esercizi correttivi da movementSpecificCorrectiveExercises.ts
 * e convertirli nel formato ExerciseDescription per exerciseDescriptions.ts
 */

const fs = require('fs');
const path = require('path');

// Read the movementSpecificCorrectiveExercises.ts file
const sourceFile = path.join(__dirname, 'packages/shared/src/utils/movementSpecificCorrectiveExercises.ts');
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Extract all exercise objects
const exercises = [];
let currentBodyPart = '';

// Simple regex to find all exercises
const bodyPartRegex = /export const (\w+)_CORRECTIVES = {/g;
const exerciseRegex = /{\s*name: '([^']+)',\s*sets: '[^']+',\s*reps: '[^']+',\s*rest: '[^']+',\s*purpose: '([^']+)',\s*cues: \[([\s\S]*?)\]\s*}/g;

// Find all body parts
let bodyPartMatch;
const bodyParts = [];
while ((bodyPartMatch = bodyPartRegex.exec(sourceContent)) !== null) {
  bodyParts.push(bodyPartMatch[1]);
}

console.log(`Found ${bodyParts.length} body parts: ${bodyParts.join(', ')}\n`);

// Extract exercises from each body part section
bodyParts.forEach(bodyPart => {
  // Find the section for this body part
  const sectionStart = sourceContent.indexOf(`export const ${bodyPart}_CORRECTIVES = {`);
  if (sectionStart === -1) return;

  // Find the end of this section (next export or end of file)
  const nextExportIndex = sourceContent.indexOf('export const', sectionStart + 1);
  const sectionEnd = nextExportIndex === -1 ? sourceContent.length : nextExportIndex;
  const section = sourceContent.substring(sectionStart, sectionEnd);

  // Find all exercises in this section
  const exerciseMatches = section.matchAll(/\{\s*name: '([^']+)',[\s\S]*?purpose: '([^']+)',[\s\S]*?cues: \[([\s\S]*?)\]\s*\}/g);

  for (const match of exerciseMatches) {
    const name = match[1];
    const purpose = match[2];
    const cuesStr = match[3];

    // Extract individual cues
    const cues = [];
    const cueMatches = cuesStr.matchAll(/'([^']+)'/g);
    for (const cueMatch of cueMatches) {
      cues.push(cueMatch[1]);
    }

    exercises.push({
      name,
      description: purpose,
      technique: cues
    });
  }
});

console.log(`\nExtracted ${exercises.length} total corrective exercises\n`);
console.log('='.repeat(80));
console.log('\nFORMATTED OUTPUT FOR exerciseDescriptions.ts:\n');
console.log('='.repeat(80));
console.log('\n  // ============================================');
console.log('  // CORRECTIVE EXERCISES (Auto-generated)');
console.log('  // ============================================\n');

// Generate formatted output
exercises.forEach(ex => {
  console.log(`  '${ex.name}': {`);
  console.log(`    description: '${ex.description}',`);
  console.log(`    technique: [`);
  ex.technique.forEach((cue, i) => {
    const comma = i < ex.technique.length - 1 ? ',' : '';
    console.log(`      '${cue}'${comma}`);
  });
  console.log(`    ]`);
  console.log(`  },\n`);
});

// Save to file for easy copying
const outputFile = path.join(__dirname, 'corrective-exercises-formatted.txt');
let output = '  // ============================================\n';
output += '  // CORRECTIVE EXERCISES (Auto-generated)\n';
output += '  // ============================================\n\n';

exercises.forEach(ex => {
  output += `  '${ex.name}': {\n`;
  output += `    description: '${ex.description}',\n`;
  output += `    technique: [\n`;
  ex.technique.forEach((cue, i) => {
    const comma = i < ex.technique.length - 1 ? ',' : '';
    output += `      '${cue}'${comma}\n`;
  });
  output += `    ]\n`;
  output += `  },\n\n`;
});

fs.writeFileSync(outputFile, output);
console.log('='.repeat(80));
console.log(`\n✅ Output saved to: ${outputFile}`);
console.log(`\n📋 Copy and paste this content into exerciseDescriptions.ts before the closing brace\n`);
