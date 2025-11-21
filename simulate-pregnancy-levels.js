/**
 * SIMULAZIONE SISTEMA LEVEL-AWARE PER GRAVIDANZA
 * Mostra le differenze tra beginner, intermediate e advanced
 */

// Mock della funzione calculateVolume per pre-partum
function calculatePrePartumVolume(level, dayType = 'normal') {
  let sets, reps, rest, intensity, notes;

  if (level === 'beginner') {
    sets = 2;
    reps = 12;
    rest = '120s';
    intensity = '40-50%';
    notes = '⚠️ PRE-PARTUM BEGINNER: Non iniziare allenamento con pesi in gravidanza senza esperienza pregressa. Consulta medico e personal trainer specializzato. Programma solo mobility/bodyweight leggero.';
  } else if (level === 'intermediate') {
    sets = 3;
    reps = 10;
    rest = '120-150s';
    intensity = '55-65%';
    notes = 'Pre-Partum INTERMEDIATE - MANTENIMENTO (no progressioni carico). Evita supino dopo 1° trimestre, respira sempre (no Valsalva). Stop se malessere.';
  } else {
    // Advanced
    sets = dayType === 'heavy' ? 4 : 3;
    reps = dayType === 'heavy' ? 6 : 8;
    rest = '150-180s';
    intensity = '60-75%';
    notes = 'Pre-Partum ADVANCED - MANTENIMENTO (no progressioni carico). Donna allenata può continuare con intensità controllata. Evita supino, respira sempre, stop se sintomi. Clearance medica necessaria.';
  }

  return { sets, reps, rest, intensity, notes };
}

// Mock della funzione per post-partum
function calculatePostPartumVolume(level) {
  let sets, reps, rest, intensity, notes, weeks;

  if (level === 'beginner') {
    sets = 2;
    reps = 12;
    rest = '90-120s';
    intensity = '40-50%';
    weeks = '6+';
    notes = 'Post-Partum BEGINNER (6+ settimane) - Focus pavimento pelvico e core profondo. Respirazione diaframmatica. Progressione molto graduale. Clearance medica necessaria.';
  } else if (level === 'intermediate') {
    sets = 3;
    reps = 10;
    rest = '120-150s';
    intensity = '55-65%';
    weeks = '8+';
    notes = 'Post-Partum INTERMEDIATE (8+ settimane) - MANTENIMENTO. Focus stabilità core e prevenzione diastasi. Check pavimento pelvico prima di aumentare carico.';
  } else {
    // Advanced
    sets = 3;
    reps = 8;
    rest = '150-180s';
    intensity = '60-75%';
    weeks = '12+';
    notes = 'Post-Partum ADVANCED (12+ settimane) - MANTENIMENTO. Donna allenata può riprendere intensità. Verifica diastasi e pavimento pelvico OK prima di heavy lifting. Clearance medica necessaria.';
  }

  return { sets, reps, rest, intensity, notes, weeks };
}

console.log('🤰 SIMULAZIONE SISTEMA LEVEL-AWARE GRAVIDANZA\n');
console.log('='.repeat(90));

// ============================================================================
// PRE-PARTUM
// ============================================================================

console.log('\n\n📊 PRE-PARTUM - CONFRONTO TRA LIVELLI');
console.log('='.repeat(90));

const levels = ['beginner', 'intermediate', 'advanced'];
const prePartumData = levels.map(level => ({
  level,
  normal: calculatePrePartumVolume(level, 'normal'),
  heavy: level === 'advanced' ? calculatePrePartumVolume(level, 'heavy') : null
}));

console.log('\n🔴 BEGINNER (Mai fatto pesi prima)');
console.log('-'.repeat(90));
const beginner = prePartumData[0].normal;
console.log(`Sets: ${beginner.sets}`);
console.log(`Reps: ${beginner.reps}`);
console.log(`Rest: ${beginner.rest}`);
console.log(`Intensità: ${beginner.intensity}`);
console.log(`\n⚠️  ${beginner.notes}\n`);

console.log('\n🟡 INTERMEDIATE (Allenata, ha esperienza con pesi)');
console.log('-'.repeat(90));
const intermediate = prePartumData[1].normal;
console.log(`Sets: ${intermediate.sets}`);
console.log(`Reps: ${intermediate.reps}`);
console.log(`Rest: ${intermediate.rest} (più lunghi rispetto a beginner)`);
console.log(`Intensità: ${intermediate.intensity}`);
console.log(`\n✅ ${intermediate.notes}\n`);

console.log('\n🟢 ADVANCED (Esperta, sta bene, clearance medica)');
console.log('-'.repeat(90));
const advancedNormal = prePartumData[2].normal;
const advancedHeavy = prePartumData[2].heavy;

console.log('📍 NORMAL DAY:');
console.log(`   Sets: ${advancedNormal.sets}`);
console.log(`   Reps: ${advancedNormal.reps}`);
console.log(`   Rest: ${advancedNormal.rest} (molto lunghi)`);
console.log(`   Intensità: ${advancedNormal.intensity}`);

console.log('\n📍 HEAVY DAY (può fare anche forza):');
console.log(`   Sets: ${advancedHeavy.sets}`);
console.log(`   Reps: ${advancedHeavy.reps} (può fare 6 reps!)`);
console.log(`   Rest: ${advancedHeavy.rest}`);
console.log(`   Intensità: ${advancedHeavy.intensity} (fino a 75%!)`);

console.log(`\n✅ ${advancedNormal.notes}\n`);

// Tabella comparativa
console.log('\n📊 TABELLA COMPARATIVA PRE-PARTUM');
console.log('='.repeat(90));
console.log(`
┌─────────────┬──────┬──────┬─────────────┬────────────┬──────────────────────────┐
│ Livello     │ Sets │ Reps │ Rest        │ Intensità  │ Può fare pesi?           │
├─────────────┼──────┼──────┼─────────────┼────────────┼──────────────────────────┤
│ BEGINNER    │ 2    │ 12   │ 120s        │ 40-50%     │ ❌ Solo bodyweight       │
│ INTERMEDIATE│ 3    │ 10   │ 120-150s    │ 55-65%     │ ✅ Pesi moderati         │
│ ADVANCED    │ 3-4  │ 6-10 │ 150-180s    │ 60-75%     │ ✅ Anche forza (6 reps)  │
└─────────────┴──────┴──────┴─────────────┴────────────┴──────────────────────────┘
`);

// ============================================================================
// POST-PARTUM
// ============================================================================

console.log('\n\n📊 POST-PARTUM - CONFRONTO TRA LIVELLI');
console.log('='.repeat(90));

const postPartumData = levels.map(level => ({
  level,
  data: calculatePostPartumVolume(level)
}));

console.log('\n🔴 BEGINNER (6+ settimane)');
console.log('-'.repeat(90));
const ppBeginner = postPartumData[0].data;
console.log(`Timing: ${ppBeginner.weeks} settimane post-parto`);
console.log(`Sets: ${ppBeginner.sets}`);
console.log(`Reps: ${ppBeginner.reps}`);
console.log(`Rest: ${ppBeginner.rest}`);
console.log(`Intensità: ${ppBeginner.intensity}`);
console.log(`\n✅ ${ppBeginner.notes}\n`);

console.log('\n🟡 INTERMEDIATE (8+ settimane)');
console.log('-'.repeat(90));
const ppIntermediate = postPartumData[1].data;
console.log(`Timing: ${ppIntermediate.weeks} settimane post-parto`);
console.log(`Sets: ${ppIntermediate.sets}`);
console.log(`Reps: ${ppIntermediate.reps}`);
console.log(`Rest: ${ppIntermediate.rest}`);
console.log(`Intensità: ${ppIntermediate.intensity}`);
console.log(`\n✅ ${ppIntermediate.notes}\n`);

console.log('\n🟢 ADVANCED (12+ settimane)');
console.log('-'.repeat(90));
const ppAdvanced = postPartumData[2].data;
console.log(`Timing: ${ppAdvanced.weeks} settimane post-parto`);
console.log(`Sets: ${ppAdvanced.sets}`);
console.log(`Reps: ${ppAdvanced.reps} (può riprendere forza!)`);
console.log(`Rest: ${ppAdvanced.rest} (rest lunghi)`);
console.log(`Intensità: ${ppAdvanced.intensity} (fino a 75%!)`);
console.log(`\n✅ ${ppAdvanced.notes}\n`);

// Tabella comparativa post-partum
console.log('\n📊 TABELLA COMPARATIVA POST-PARTUM');
console.log('='.repeat(90));
console.log(`
┌─────────────┬─────────┬──────┬──────┬─────────────┬────────────┬──────────────┐
│ Livello     │ Timing  │ Sets │ Reps │ Rest        │ Intensità  │ Focus        │
├─────────────┼─────────┼──────┼──────┼─────────────┼────────────┼──────────────┤
│ BEGINNER    │ 6+ sett │ 2    │ 12   │ 90-120s     │ 40-50%     │ Core/Pelvico │
│ INTERMEDIATE│ 8+ sett │ 3    │ 10   │ 120-150s    │ 55-65%     │ Stabilità    │
│ ADVANCED    │ 12+ sett│ 3    │ 8    │ 150-180s    │ 60-75%     │ Forza OK     │
└─────────────┴─────────┴──────┴──────┴─────────────┴────────────┴──────────────┘
`);

// ============================================================================
// PRINCIPI CHIAVE
// ============================================================================

console.log('\n\n🎯 PRINCIPI CHIAVE DEL SISTEMA');
console.log('='.repeat(90));

console.log('\n✅ PRE-PARTUM:');
console.log('   1. BEGINNER → ❌ Non iniziare pesi in gravidanza');
console.log('   2. INTERMEDIATE → ✅ Può continuare con adattamenti (3 sets, 55-65%)');
console.log('   3. ADVANCED → ✅ Può allenarsi intensamente (4 sets, 60-75%, anche 6 reps)');
console.log('   4. Tutti → Rest più lunghi (120-180s)');
console.log('   5. Tutti → MANTENIMENTO (no progressioni carico)');

console.log('\n✅ POST-PARTUM:');
console.log('   1. Timing diverso per livello (6+/8+/12+ settimane)');
console.log('   2. BEGINNER → Focus pavimento pelvico');
console.log('   3. INTERMEDIATE → Progressione graduale core');
console.log('   4. ADVANCED → Può riprendere heavy lifting (con clearance)');
console.log('   5. Tutti → Check diastasi e pavimento pelvico prima di heavy');

console.log('\n⚠️  PRECAUZIONI SEMPRE VALIDE:');
console.log('   • Clearance medica necessaria');
console.log('   • NO Valsalva (respirazione continua)');
console.log('   • NO posizione supina dopo 1° trimestre (pre-partum)');
console.log('   • Stop immediato se sintomi (dolore, sanguinamento, vertigini)');
console.log('   • Ascolta sempre il corpo');

console.log('\n💡 ESEMPIO PRATICO:');
console.log('   Powerlifter esperta in gravidanza (ADVANCED):');
console.log('   ✅ Può fare squat 4x6 al 70% con rest 180s');
console.log('   ✅ Può fare bench press (evitando supino, usa incline)');
console.log('   ✅ Può fare deadlift con tecnica perfetta');
console.log('   ⚠️  Ma MANTENIMENTO: niente PR, niente progressioni');
console.log('   ⚠️  Se malessere → stop immediato');

console.log('\n✨ Sistema level-aware per gravidanza implementato!\n');
