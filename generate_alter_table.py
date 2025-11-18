#!/usr/bin/env python3
"""
Script per generare clausole ALTER TABLE ADD COLUMN IF NOT EXISTS
basate sulle definizioni CREATE TABLE nella migrazione RPE.
"""

import re

# Leggi il file SQL
with open('rpe_autoregulation_migration.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern per trovare CREATE TABLE e estrarre colonne
tables = {
    'workout_logs': [],
    'exercise_logs': [],
    'program_adjustments': []
}

# Trova ogni CREATE TABLE
for table_name in tables.keys():
    # Pattern per trovare la definizione della tabella
    pattern = rf'CREATE TABLE IF NOT EXISTS {table_name}\s*\((.*?)\);'
    match = re.search(pattern, content, re.DOTALL)

    if match:
        table_def = match.group(1)

        # Estrai ogni colonna (ignora id, user_id, program_id, created_at, CONSTRAINT, INDEX)
        lines = table_def.split('\n')
        for line in lines:
            line = line.strip()

            # Salta linee vuote, commenti, constraints, e key columns
            if not line or line.startswith('--') or 'CONSTRAINT' in line:
                continue
            if 'PRIMARY KEY' in line or 'REFERENCES' in line:
                continue

            # Estrai nome colonna e tipo
            match_col = re.match(r'(\w+)\s+(VARCHAR|INTEGER|DECIMAL|BOOLEAN|TEXT|UUID|TIMESTAMPTZ|JSONB)(\([^)]+\))?\s*(.*)', line)
            if match_col:
                col_name = match_col.group(1)
                col_type = match_col.group(2)
                col_size = match_col.group(3) or ''
                col_rest = match_col.group(4) or ''

                # Salta colonne chiave
                if col_name in ['id', 'user_id', 'program_id', 'workout_log_id', 'created_at']:
                    continue

                # Estrai DEFAULT se presente
                default_match = re.search(r'DEFAULT\s+([^,]+)', col_rest)
                default_clause = f' DEFAULT {default_match.group(1).strip()}' if default_match else ''

                # Costruisci la definizione completa
                full_def = f'{col_type}{col_size}{default_clause}'
                tables[table_name].append((col_name, full_def))

# Genera le clausole ALTER TABLE
print("-- ================================================================")
print("-- 4B. ALTER TABLE - Ensure all columns exist (Idempotency)")
print("-- ================================================================")
print("-- In caso la tabella esistesse già, aggiungiamo le colonne mancanti")
print()

for table_name, columns in tables.items():
    if columns:
        print(f"-- {table_name.replace('_', ' ').title()}: Aggiungi colonne se non esistono")
        print(f"ALTER TABLE {table_name}")

        for i, (col_name, col_def) in enumerate(columns):
            comma = ',' if i < len(columns) - 1 else ';'
            print(f"  ADD COLUMN IF NOT EXISTS {col_name} {col_def}{comma}")
        print()
