export function generateRecoveryProgram(input) {
  const { area, tests, level } = input;
  
  // Template specifici per zona
  const shoulderRecovery = {
    phase1: {
      name: 'Fase 1: Mobilità e Controllo',
      weeks: 2,
      exercises: [
        { name: 'Scapular Wall Slides', sets: 3, reps: '10-12', notes: 'Controllo scapolare' },
        { name: 'Pendulum Swings', sets: 3, reps: '30s per direzione', notes: 'ROM passivo' },
        { name: 'Face Pulls con Elastico', sets: 3, reps: '12-15', notes: 'Attivazione posteriori' },
        { name: 'Plank Scapular Protraction', sets: 3, reps: '10', notes: 'Stabilità dinamica' }
      ]
    },
    phase2: {
      name: 'Fase 2: Rinforzo Progressivo',
      weeks: 4,
      exercises: [
        { name: 'Push-up su Ginocchia', sets: 3, reps: '8-10', notes: 'Progressione carico' },
        { name: 'Band Pull-Aparts', sets: 3, reps: '15-20', notes: 'Rinforzo posteriori' },
        { name: 'Shoulder External Rotation', sets: 3, reps: '12-15', notes: 'Cuffia rotatori' },
        { name: 'YTW su Pavimento', sets: 3, reps: '10 per lettera', notes: 'Stabilizzatori' }
      ]
    },
    phase3: {
      name: 'Fase 3: Ritorno all\'Attività',
      weeks: 4,
      exercises: [
        { name: 'Push-up Standard', sets: 3, reps: '10-15', notes: 'Full ROM' },
        { name: 'Pike Push-up', sets: 3, reps: '8-12', notes: 'Overhead progressione' },
        { name: 'Inverted Row', sets: 3, reps: '10-12', notes: 'Pulling pattern' },
        { name: 'Dead Hang', sets: 3, reps: '20-30s', notes: 'Stabilità overhead' }
      ]
    }
  };
  
  return {
    name: `Programma Recupero ${area.toUpperCase()}`,
    phases: [shoulderRecovery.phase1, shoulderRecovery.phase2, shoulderRecovery.phase3],
    totalWeeks: 10,
    progression: 'phased_recovery',
    notes: 'Passa alla fase successiva solo dopo aver completato tutti i test di controllo'
  };
}
