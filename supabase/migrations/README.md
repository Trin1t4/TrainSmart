# Supabase Migrations

## Ordine di Esecuzione

Eseguire le migrazioni in ordine numerico nel SQL Editor di Supabase:

### Core Schema
1. `001_training_programs.sql` - Schema base per i programmi di allenamento
2. `002_subscriptions.sql` - Tabella subscriptions per Stripe payments
3. `003_rls_policies.sql` - Row Level Security policies per tutte le tabelle

### Features
4. `004_rpe_autoregulation.sql` - Sistema di autoregolazione basato su RPE
5. `005_analytics.sql` - Tabelle per analytics e tracking
6. `006_admin_system.sql` - Sistema amministrativo
7. `007_admin_rpc_functions.sql` - Funzioni RPC per admin
8. `008_storage_videos.sql` - Configurazione storage per video esercizi
9. `009_pain_tracking.sql` - Sistema di pain tracking
10. `010_video_corrections.sql` - Correzioni video con AI (Gemini)

### Social & Advanced
11. `011_social_features.sql` - Features social (community, achievements, follow)
12. `012_pain_rehabilitation.sql` - Sistema di riabilitazione dal dolore
13. `013_teamflow.sql` - Migrazione completa TeamFlow (team edition)
14. `014_email_triggers.sql` - Trigger per invio email automatiche

### Hotfixes (per data)
- `20250526_team_edition.sql` - Team edition features
- `20251210_create_recovery_tracking.sql` - Recovery tracking table
- `20251211_fix_missing_tables.sql` - Fix tabelle mancanti

## Note

- Le migrazioni numerate (001-014) sono idempotent - possono essere rieseguite
- Le migrazioni con timestamp sono fix specifici
- Prima di eseguire, verificare sempre lo stato attuale del database
- RLS policies (003) devono essere applicate DOPO la creazione delle tabelle

## Utility Queries

Le query di utility/monitoring sono in `docs/sql/`:
- `SQL_MONITORING_QUERIES.sql` - Query per monitoring database
- `analytics_queries_library.sql` - Libreria query analytics
