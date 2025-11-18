const fs = require('fs');

// Leggi il file SQL
const content = fs.readFileSync('rpe_autoregulation_migration.sql', 'utf-8');

const tables = {
  'workout_logs': [],
  'exercise_logs': [],
  'program_adjustments': []
};

// Per ogni tabella
for (const tableName of Object.keys(tables)) {
  // Trova la definizione CREATE TABLE
  const regex = new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}\\s*\\((.*?)\\);`, 's');
  const match = content.match(regex);

  if (match) {
    const tableDef = match[1];
    const lines = tableDef.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Salta linee vuote, commenti, constraints
      if (!trimmed || trimmed.startsWith('--') || trimmed.includes('CONSTRAINT')) continue;
      if (trimmed.includes('PRIMARY KEY') || trimmed.includes('REFERENCES')) continue;

      // Match colonna: nome tipo(size) DEFAULT value
      const colMatch = trimmed.match(/^(\w+)\s+(VARCHAR|INTEGER|DECIMAL|BOOLEAN|TEXT|UUID|TIMESTAMPTZ|JSONB)(\([^)]+\))?(.*)/);
      if (colMatch) {
        const colName = colMatch[1];
        const colType = colMatch[2];
        const colSize = colMatch[3] || '';
        const colRest = colMatch[4] || '';

        // Salta colonne chiave
        if (['id', 'user_id', 'program_id', 'workout_log_id', 'created_at'].includes(colName)) {
          continue;
        }

        // Estrai DEFAULT
        const defaultMatch = colRest.match(/DEFAULT\s+([^,]+)/);
        let defaultClause = '';
        if (defaultMatch) {
          defaultClause = ` DEFAULT ${defaultMatch[1].trim()}`;
        }

        // Definizione completa
        const fullDef = `${colType}${colSize}${defaultClause}`;
        tables[tableName].push({ name: colName, def: fullDef });
      }
    }
  }
}

// Genera ALTER TABLE
console.log('-- ================================================================');
console.log('-- 4B. ALTER TABLE - Ensure all columns exist (Idempotency)');
console.log('-- ================================================================');
console.log('-- In caso la tabella esistesse già, aggiungiamo le colonne mancanti');
console.log('');

for (const [tableName, columns] of Object.entries(tables)) {
  if (columns.length > 0) {
    const displayName = tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    console.log(`-- ${displayName}: Aggiungi colonne se non esistono`);
    console.log(`ALTER TABLE ${tableName}`);

    columns.forEach((col, i) => {
      const comma = i < columns.length - 1 ? ',' : ';';
      console.log(`  ADD COLUMN IF NOT EXISTS ${col.name} ${col.def}${comma}`);
    });
    console.log('');
  }
}
