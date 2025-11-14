import { generateProgram } from './api/lib/programGenerator.js';

console.log('🧪 Testing programGenerator...\n');

const testInput = {
  userId: 'test-123',
  assessmentId: 'assess-123',
  location: 'gym',
  goal: 'muscle_gain',
  level: 'beginner',
  frequency: 3,
  equipment: { barbell: true, dumbbells: true },
  painAreas: [],
  assessments: [],
  disabilityType: null,
  sportRole: null,
  specificBodyParts: []
};

try {
  const result = generateProgram(testInput);
  console.log('✅ SUCCESS! Programma generato:');
  console.log('- Nome:', result.name);
  console.log('- Split:', result.split);
  console.log('- Giorni/settimana:', result.daysPerWeek);
  console.log('- Settimane totali:', result.totalWeeks);
  if (result.weeklySchedule && result.weeklySchedule[0]) {
    console.log('- Primo giorno:', result.weeklySchedule[0].dayName);
    console.log('- Esercizi:', result.weeklySchedule[0].exercises.length);
  }
} catch (error) {
  console.error('❌ ERRORE:', error.message);
}
