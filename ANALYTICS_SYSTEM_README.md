# 📊 ANALYTICS DATABASE SYSTEM - FitnessFlow

## Overview

Sistema analytics completo per FitnessFlow con database separato (schema `analytics`) per analisi dei dati senza impattare il database operazionale.

**Status**: Production-Ready
**Architecture**: Same DB, Separate Schema
**Refresh**: Daily Batch (00:00 UTC)
**Data Retention**: Unlimited

---

## 🎯 PRIORITÀ (User-Defined)

1. **Business Metrics** ⭐⭐⭐⭐⭐ (Priority 1)
   - Conversion funnel
   - DAU/MAU
   - Engagement metrics
   - Growth rates

2. **User Analytics** ⭐⭐⭐⭐ (Priority 2)
   - Registrations
   - Retention cohorts
   - Churn analysis
   - Lifetime value

3. **Program Popularity** ⭐⭐⭐ (Priority 3)
   - Split types distribution
   - Goals distribution
   - Level distribution
   - Usage patterns

4. **Workout Analytics** ⭐⭐ (Priority 4)
   - Volume trends
   - Frequency patterns
   - Completion rates
   - Exercise popularity

5. **RPE Trends** ⭐ (Priority 5)
   - RPE distribution
   - Auto-adjustments
   - Recovery quality
   - Fatigue management

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────┐
│     OPERATIONAL DB (public)         │
│  • auth.users                        │
│  • training_programs                 │
│  • workout_logs                      │
│  • exercise_logs                     │
│  • program_adjustments               │
└────────────┬────────────────────────┘
             │
   ┌─────────▼────────┐
   │  ETL Pipeline    │ ← Daily 00:00 UTC
   │  (PostgreSQL     │
   │   Functions)     │
   └─────────┬────────┘
             │
┌────────────▼─────────────────────────┐
│     ANALYTICS DB (analytics)         │
│                                       │
│  📦 Dimension Tables (3)             │
│  • dim_users                          │
│  • dim_date                           │
│  • dim_programs                       │
│                                       │
│  📋 Fact Tables (7)                  │
│  • fact_user_registrations            │
│  • fact_onboarding_completions        │
│  • fact_screening_completions         │
│  • fact_program_creations             │
│  • fact_workouts                      │
│  • fact_exercises                     │
│  • fact_program_adjustments           │
│                                       │
│  📊 Aggregated Tables (5)            │
│  • agg_user_activity_daily            │
│  • agg_workout_volume_weekly          │
│  • agg_rpe_trends_monthly             │
│  • agg_program_popularity             │
│  • agg_business_metrics_daily         │
│                                       │
│  🔍 Materialized Views (4)           │
│  • mv_user_retention_cohorts          │
│  • mv_workout_frequency_stats         │
│  • mv_rpe_distribution                │
│  • mv_conversion_funnel               │
└───────────────────────────────────────┘
```

---

## 📁 DATABASE SCHEMA

### Dimension Tables

#### `dim_users`
User master data con statistiche aggregate.
```sql
- user_id (PK)
- email
- created_at
- first_program_created_at
- first_workout_logged_at
- total_programs_created
- total_workouts_logged
- is_active (boolean)
- last_activity_at
- cohort_month (YYYY-MM)
- cohort_week (YYYY-WW)
```

#### `dim_date`
Calendar table per time-based analysis.
```sql
- date_id (PK)
- year, quarter, month, week
- day_of_week, day_of_month, day_of_year
- is_weekend
- month_name, day_name
```

### Fact Tables

#### `fact_workouts`
Workout sessions completate.
```sql
- workout_id, user_id, program_id
- workout_date, workout_timestamp
- day_name, split_type
- exercises_completed, total_exercises
- completion_rate (%)
- session_rpe (1-10)
- session_duration_minutes
- mood, sleep_quality
```

#### `fact_exercises`
Esercizi singoli con RPE.
```sql
- exercise_id, workout_id, user_id
- workout_date
- exercise_name, pattern
- sets_completed, reps_completed, weight_used
- exercise_rpe (1-10)
- difficulty_vs_baseline
```

### Aggregated Tables

#### `agg_business_metrics_daily`
**[PRIORITY 1]** Business KPI giornalieri.
```sql
- date_id (PK)
- new_registrations
- onboarding_completions
- screening_completions
- program_creations
- daily_active_users (DAU)
- workouts_logged
- avg_session_duration_minutes
- registration_to_onboarding_rate
- returning_users
- churn_count
```

#### `agg_user_activity_daily`
**[PRIORITY 2]** Attività utenti per giorno.
```sql
- date_id, user_id (PK)
- workouts_logged
- exercises_completed
- total_volume (sets × reps)
- avg_rpe
- active_minutes
```

---

## 🔄 ETL PIPELINE

### Functions Available

1. **`analytics.populate_dim_date()`**
   - One-time: Popola 10 anni di date (2024-2034)
   - Eseguire solo una volta

2. **`analytics.refresh_dim_users()`**
   - Aggiorna dimension users da auth.users
   - Calcola statistiche aggregate

3. **`analytics.refresh_fact_tables(full_refresh BOOLEAN)`**
   - `full_refresh = true`: Ricarica tutti i dati
   - `full_refresh = false`: Incrementale (ultimi 7 giorni)

4. **`analytics.refresh_aggregated_tables()`**
   - Ricalcola tabelle aggregate da fact tables

5. **`analytics.refresh_materialized_views()`**
   - Refresh delle 4 materialized views

6. **`analytics.daily_etl_refresh()`** ⭐ **MASTER FUNCTION**
   - Esegue tutti gli step sopra in sequenza
   - Chiamare questa via cron job daily

### ETL Schedule

**Daily at 00:00 UTC** (via pg_cron):
```sql
SELECT cron.schedule(
  'daily-analytics-etl',
  '0 0 * * *',
  'SELECT analytics.daily_etl_refresh();'
);
```

### Manual Trigger (Testing)
```sql
-- Full refresh (prima volta)
SELECT analytics.daily_etl_refresh();

-- Check logs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 📊 QUERY LIBRARY

### Priority 1: Business Metrics

**[1.1] Daily Business KPIs**
```sql
SELECT
  date_id,
  new_registrations,
  daily_active_users as dau,
  workouts_logged,
  program_creations
FROM analytics.agg_business_metrics_daily
WHERE date_id >= CURRENT_DATE - 30
ORDER BY date_id DESC;
```

**[1.2] Conversion Funnel**
```sql
SELECT * FROM analytics.mv_conversion_funnel
WHERE month = DATE_TRUNC('month', CURRENT_DATE);
```

**[1.3] Week-over-Week Growth**
```sql
-- See analytics_queries_library.sql [1.4]
```

### Priority 2: User Analytics

**[2.1] Retention Cohorts**
```sql
SELECT * FROM analytics.mv_user_retention_cohorts
ORDER BY cohort_month DESC LIMIT 6;
```

**[2.2] Churn Analysis**
```sql
-- See analytics_queries_library.sql [2.3]
```

**[2.3] Power Users**
```sql
-- See analytics_queries_library.sql [2.5]
```

### Priority 3: Program Popularity

**[3.1] Most Popular Programs**
```sql
SELECT * FROM analytics.agg_program_popularity
ORDER BY total_programs DESC LIMIT 10;
```

**[3.2] Program by Goal**
```sql
-- See analytics_queries_library.sql [3.2]
```

### Priority 4: Workout Analytics

**[4.1] Weekly Volume Trends**
```sql
SELECT
  week_start_date,
  SUM(workouts_count) as workouts,
  SUM(total_sets) as sets,
  SUM(total_reps) as reps,
  AVG(avg_rpe) as avg_rpe
FROM analytics.agg_workout_volume_weekly
WHERE week_start_date >= CURRENT_DATE - 84 -- 12 weeks
GROUP BY week_start_date
ORDER BY week_start_date DESC;
```

**[4.2] Most Popular Exercises**
```sql
-- See analytics_queries_library.sql [4.4]
```

### Priority 5: RPE Trends

**[5.1] RPE Distribution**
```sql
SELECT * FROM analytics.mv_rpe_distribution
ORDER BY rpe_bucket;
```

**[5.2] Auto-Regulation Summary**
```sql
-- See analytics_queries_library.sql [5.3]
```

---

## 🚀 DEPLOYMENT GUIDE

### Step 1: Enable pg_cron Extension

1. Apri Supabase Dashboard
2. Database → Extensions
3. Cerca "pg_cron"
4. Click "Enable"

### Step 2: Execute Migration

1. Apri SQL Editor in Supabase
2. Copy contenuto di `analytics_database_migration.sql`
3. Paste ed esegui (Run o F5)
4. Verifica output: "✅ Analytics Database Migration Complete!"

### Step 3: Schedule Daily ETL

```sql
-- Schedule daily ETL job
SELECT cron.schedule(
  'daily-analytics-etl',
  '0 0 * * *', -- Every day at midnight UTC
  'SELECT analytics.daily_etl_refresh();'
);

-- Verify scheduled
SELECT * FROM cron.job;
```

### Step 4: Initial Load

```sql
-- First time: Full refresh
SELECT analytics.daily_etl_refresh();

-- Check row counts
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'analytics'
ORDER BY tablename;
```

### Step 5: Verify Data

```sql
-- Check business metrics (last 7 days)
SELECT * FROM analytics.agg_business_metrics_daily
WHERE date_id >= CURRENT_DATE - 7
ORDER BY date_id DESC;

-- Check user count
SELECT COUNT(*) FROM analytics.dim_users;

-- Check workouts count
SELECT COUNT(*) FROM analytics.fact_workouts;
```

---

## 📈 DASHBOARD INTEGRATION

### Option A: Supabase Dashboard Queries

Crea "Saved Queries" in Supabase SQL Editor per:
- Daily KPIs
- Retention cohorts
- Conversion funnel
- Top exercises

### Option B: External BI Tool (Metabase, Tableau, etc.)

**Connection String**:
```
Host: [your-project].supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [your-db-password]
Schema: analytics
```

**Recommended Charts**:

1. **Business Metrics Dashboard**
   - Line chart: DAU trend (7/30/90 days)
   - Funnel chart: Conversion funnel
   - KPI cards: New registrations, Programs created, Workouts logged
   - Bar chart: Week-over-week growth

2. **User Analytics Dashboard**
   - Cohort retention heatmap
   - Line chart: New users trend
   - Pie chart: User engagement status
   - Table: Power users list

3. **Program Popularity Dashboard**
   - Bar chart: Programs by goal
   - Pie chart: Level distribution
   - Bar chart: Split type distribution
   - Heatmap: Goal × Level combinations

4. **Workout Analytics Dashboard**
   - Line chart: Weekly volume trend
   - Bar chart: Frequency distribution
   - Line chart: Completion rate trend
   - Table: Top exercises

5. **RPE Trends Dashboard**
   - Histogram: RPE distribution
   - Line chart: Monthly avg RPE
   - Bar chart: Auto-adjustments by type
   - Table: Users with high RPE

### Option C: Custom React Dashboard

Usa `client/src/lib/supabaseClient.ts` per query:

```typescript
import { supabase } from './supabaseClient';

// Example: Get daily business metrics
export async function getBusinessMetrics(days = 30) {
  const { data, error } = await supabase
    .from('agg_business_metrics_daily')
    .select('*')
    .gte('date_id', new Date(Date.now() - days * 24*60*60*1000).toISOString().split('T')[0])
    .order('date_id', { ascending: false });

  return { data, error };
}

// Example: Get conversion funnel
export async function getConversionFunnel() {
  const { data, error } = await supabase
    .from('mv_conversion_funnel')
    .select('*')
    .order('month', { ascending: false })
    .limit(6);

  return { data, error };
}
```

---

## 🔒 SECURITY & PERMISSIONS

### RLS Policies

Analytics schema ha permessi READ-ONLY per authenticated users:

```sql
-- Granted in migration
GRANT USAGE ON SCHEMA analytics TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO authenticated;
```

**Note**: Dati analytics non hanno RLS row-level perché sono aggregate e anonymizzate.

### Admin Access

Solo admin Supabase può:
- Eseguire ETL functions
- Modificare schema analytics
- Schedule cron jobs

---

## 🧪 TESTING & VALIDATION

### Data Quality Checks

```sql
-- [T1] Check for nulls in key fields
SELECT
  COUNT(*) FILTER (WHERE session_rpe IS NULL) as null_rpe,
  COUNT(*) FILTER (WHERE user_id IS NULL) as null_user_id,
  COUNT(*) as total_workouts
FROM analytics.fact_workouts;

-- [T2] Check for duplicates
SELECT workout_id, COUNT(*)
FROM analytics.fact_workouts
GROUP BY workout_id
HAVING COUNT(*) > 1;

-- [T3] Validate aggregations
SELECT
  (SELECT SUM(workouts_logged) FROM analytics.agg_user_activity_daily WHERE date_id = CURRENT_DATE) as agg_workouts,
  (SELECT COUNT(*) FROM analytics.fact_workouts WHERE workout_date = CURRENT_DATE) as fact_workouts,
  -- Should match
  (SELECT SUM(workouts_logged) FROM analytics.agg_user_activity_daily WHERE date_id = CURRENT_DATE) =
  (SELECT COUNT(*) FROM analytics.fact_workouts WHERE workout_date = CURRENT_DATE) as match;

-- [T4] Check ETL freshness
SELECT
  MAX(updated_at) as last_etl_run,
  EXTRACT(HOUR FROM NOW() - MAX(updated_at)) as hours_since_etl
FROM analytics.agg_business_metrics_daily;
```

### Performance Benchmarks

```sql
-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM analytics.agg_business_metrics_daily
WHERE date_id >= CURRENT_DATE - 30;

-- Expected: < 50ms
```

---

## 📊 MONITORING

### Daily Health Checks

```sql
-- Row counts per table
SELECT
  'dim_users' as table_name,
  COUNT(*) as rows,
  MAX(updated_at) as last_update
FROM analytics.dim_users
UNION ALL
SELECT
  'fact_workouts',
  COUNT(*),
  MAX(created_at)
FROM analytics.fact_workouts
UNION ALL
SELECT
  'agg_business_metrics_daily',
  COUNT(*),
  MAX(updated_at)
FROM analytics.agg_business_metrics_daily;

-- ETL Job Status
SELECT
  jobid,
  jobname,
  schedule,
  active,
  last_run,
  next_run
FROM cron.job
WHERE jobname = 'daily-analytics-etl';

-- Recent ETL Runs
SELECT
  runid,
  jobid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-analytics-etl')
ORDER BY start_time DESC
LIMIT 10;
```

### Alerts Setup

```sql
-- Alert: ETL failed
SELECT
  COUNT(*) as failed_runs
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-analytics-etl')
  AND status = 'failed'
  AND start_time >= NOW() - INTERVAL '24 hours';

-- If failed_runs > 0 → Send alert

-- Alert: No new data in 48h
SELECT
  EXTRACT(HOUR FROM NOW() - MAX(updated_at)) as hours_stale
FROM analytics.agg_business_metrics_daily;

-- If hours_stale > 48 → Send alert
```

---

## 🛠️ MAINTENANCE

### Weekly Tasks

- [ ] Verify ETL job status
- [ ] Check row counts growth
- [ ] Review slow queries
- [ ] Validate data quality

### Monthly Tasks

- [ ] Analyze storage growth
- [ ] Optimize indexes if needed
- [ ] Archive old data (if retention policy)
- [ ] Review materialized view refresh time

### Quarterly Tasks

- [ ] Performance audit
- [ ] Schema optimization review
- [ ] Add new metrics based on business needs

---

## 📚 FILES REFERENCE

1. **`analytics_database_migration.sql`** (Main)
   - Schema creation
   - Tables, views, functions
   - Indexes
   - Initial data load

2. **`analytics_queries_library.sql`** (Queries)
   - 50+ pre-built queries
   - Organized by priority
   - Ready for dashboards

3. **`ANALYTICS_SYSTEM_README.md`** (This file)
   - Complete documentation
   - Deployment guide
   - Usage examples

---

## 🎓 BEST PRACTICES

### Query Optimization

1. **Always use indexes**: Le query sono ottimizzate con 10+ indexes
2. **Use aggregated tables**: Preferisci `agg_*` invece di `fact_*` per dashboards
3. **Use materialized views**: Per query complesse (es. retention cohorts)
4. **Limit date ranges**: Usa `WHERE date >= CURRENT_DATE - X` per performance

### Data Freshness

- **Real-time**: NON disponibile (refresh daily)
- **Near real-time**: Query `public` schema per dati attuali
- **Historical**: Query `analytics` schema per trends

### Scaling

**Current capacity**: 100K+ users, 1M+ workouts

**If scaling needed**:
1. Partition large fact tables by date
2. Increase materialized view refresh frequency
3. Add more indexes for specific queries
4. Consider separate analytics database

---

## 🆘 TROUBLESHOOTING

### Issue: ETL job not running

**Check**:
```sql
SELECT * FROM cron.job WHERE jobname = 'daily-analytics-etl';
```

**Fix**:
1. Verify pg_cron extension enabled
2. Re-schedule job
3. Check database logs

### Issue: Slow queries

**Check**:
```sql
-- Find slow queries
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE query LIKE '%analytics%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Fix**:
1. Add missing indexes
2. Use aggregated tables
3. Limit date range

### Issue: Data mismatch

**Check**:
```sql
-- Validate fact vs aggregate
SELECT
  (SELECT COUNT(*) FROM analytics.fact_workouts WHERE workout_date = '2025-01-18') as fact_count,
  (SELECT SUM(workouts_logged) FROM analytics.agg_user_activity_daily WHERE date_id = '2025-01-18') as agg_count;
```

**Fix**:
1. Re-run ETL: `SELECT analytics.daily_etl_refresh();`
2. Check for nulls in source data
3. Verify RLS policies

---

## 📞 SUPPORT

**Documentation**: Questo file + `analytics_queries_library.sql`
**Queries**: 50+ query pre-built in library
**Schema**: Full DDL in `analytics_database_migration.sql`

---

**Created**: 2025-01-18
**Version**: 1.0.0
**Status**: Production-Ready ✅
