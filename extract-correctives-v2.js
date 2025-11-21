/**
 * Script v2 - Estrae esercizi correttivi usando approccio line-by-line più robusto
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'packages/shared/src/utils/movementSpecificCorrectiveExercises.ts');
const lines = fs.readFileSync(sourceFile, 'utf8').split('\n');

const exercises = [];
let currentExercise = null;
let inCuesArray = false;
let cues = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Detect start of exercise
  if (line.includes('name:') && line.includes("'")) {
    if (currentExercise && currentExercise.name) {
      // Save previous exercise
      currentExercise.cues = cues;
      exercises.push({ ...currentExercise });
    }

    // Extract name
    const nameMatch = line.match(/name:\s*'([^']+)'/);
    currentExercise = {
      name: nameMatch ? nameMatch[1] : '',
      description: '',
      cues: []
    };
    cues = [];
    inCuesArray = false;
  }

  // Extract purpose (description)
  if (line.includes('purpose:') && line.includes("'")) {
    const purposeMatch = line.match(/purpose:\s*'([^']+)'/);
    if (currentExercise && purposeMatch) {
      currentExercise.description = purposeMatch[1];
    }
  }

  // Detect start of cues array
  if (line.includes('cues:') && line.includes('[')) {
    inCuesArray = true;
    continue;
  }

  // Extract cues
  if (inCuesArray) {
    if (line.includes(']')) {
      inCuesArray = false;
    } else if (line.includes("'")) {
      // Extract cue text
      const cueMatch = line.match(/'([^']+)'/);
      if (cueMatch) {
        cues.push(cueMatch[1]);
      }
    }
  }
}

// Add last exercise
if (currentExercise && currentExercise.name) {
  currentExercise.cues = cues;
  exercises.push({ ...currentExercise });
}

// Remove duplicates by name
const uniqueExercises = [];
const seenNames = new Set();

exercises.forEach(ex => {
  if (ex.name && !seenNames.has(ex.name) && ex.description && ex.cues.length > 0) {
    uniqueExercises.push(ex);
    seenNames.add(ex.name);
  }
});

console.log(`\n✅ Extracted ${uniqueExercises.length} unique corrective exercises\n`);
console.log('='.repeat(80));

// Generate output
let output = `/**
 * Corrective Exercise Descriptions
 * Auto-generated from movementSpecificCorrectiveExercises.ts
 * DO NOT EDIT MANUALLY - run extract-correctives-v2.js to regenerate
 */

import { ExerciseDescription } from './exerciseDescriptions';

export const CORRECTIVE_EXERCISE_DESCRIPTIONS: Record<string, ExerciseDescription> = {

`;

uniqueExercises.forEach((ex, index) => {
  // Escape single quotes in description and cues
  const desc = ex.description.replace(/'/g, "\\'");
  const escapedCues = ex.cues.map(c => c.replace(/'/g, "\\'"));

  output += `  '${ex.name}': {\n`;
  output += `    description: '${desc}',\n`;
  output += `    technique: [\n`;
  escapedCues.forEach((cue, i) => {
    const comma = i < escapedCues.length - 1 ? ',' : '';
    output += `      '${cue}'${comma}\n`;
  });
  output += `    ]`;
  output += index < uniqueExercises.length - 1 ? `  },\n\n` : `  }\n`;
});

output += `};\n`;

// Save to file
const outputFile = path.join(__dirname, 'packages/web/src/utils/correctiveExerciseDescriptions.ts');
fs.writeFileSync(outputFile, output);

console.log(`\n✅ Created: ${outputFile}`);
console.log(`\n📝 Now update exerciseDescriptions.ts to import and merge this file\n`);
console.log('='.repeat(80));

// Print first 3 as sample
console.log('\nSample (first 3 exercises):\n');
uniqueExercises.slice(0, 3).forEach(ex => {
  console.log(`'${ex.name}':`);
  console.log(`  Description: ${ex.description}`);
  console.log(`  Cues: ${ex.cues.length} items`);
  console.log('');
});
