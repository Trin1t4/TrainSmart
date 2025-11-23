# 🔄 CONVERSATION CONTEXT - Video Correction System

**Last Updated**: 2025-11-24
**Session**: Video Correction System Implementation + Testing Documentation
**Status**: ✅ IMPLEMENTATION COMPLETE → ⏳ READY FOR TESTING

---

## 📍 DOVE SIAMO

### Sistema Implementato (2 giorni di lavoro)

**Giorno 1** (Ieri):
- ✅ Gemini API key configurata su Supabase
- ✅ Database migration completa (video_corrections, quota system)
- ✅ Edge Function `analyze-exercise-video` deployata
- ✅ Storage bucket `user-exercise-videos` configurato
- ✅ VideoUploadModal creato e integrato in WorkoutLogger
- ✅ VideoFeedbackView creato (display risultati AI)
- ✅ PaywallModal creato (3 tiers pricing)

**Giorno 2** (Oggi):
- ✅ PaywallModal integrato in Dashboard (trigger dopo 7 giorni)
- ✅ Route `/video-feedback/:correctionId` creata
- ✅ Documentazione testing completa (3 files)
- ✅ Session summary creato

### Files Creati Totale: 15 files

**Backend/Database**:
1. `supabase_video_corrections_migration.sql` (500 righe)
2. `supabase/functions/analyze-exercise-video/index.ts` (300 righe)

**Frontend**:
3. `packages/web/src/lib/videoCorrectionService.ts` (400 righe)
4. `packages/web/src/components/VideoUploadModal.tsx` (350 righe)
5. `packages/web/src/components/VideoFeedbackView.tsx` (280 righe)
6. `packages/web/src/components/PaywallModal.tsx` (400 righe)
7. `packages/web/src/pages/VideoFeedback.tsx` (18 righe)

**Modified**:
8. `packages/web/src/components/WorkoutLogger.tsx` (added video upload button)
9. `packages/web/src/components/Dashboard.tsx` (added paywall integration)
10. `packages/web/src/App.tsx` (added video feedback route)

**Documentation**:
11. `VIDEO_CORRECTION_SYSTEM_README.md` (deployment guide)
12. `TODO_VIDEO_CORRECTION.md` (original task list)
13. `VIDEO_CORRECTION_TEST_PLAN.md` (comprehensive testing, 400+ lines)
14. `video_correction_test_queries.sql` (SQL queries, 500+ lines)
15. `QUICK_START_TESTING.md` (quick test guide)
16. `SESSION_SUMMARY.md` (implementation overview)
17. `CONVERSATION_CONTEXT.md` (questo file)

---

## 🎯 STATO ATTUALE

### ✅ Completato

**Backend**:
- [x] Tabelle database: `video_corrections`, `correction_quota_history`
- [x] RPC functions: `check_video_correction_quota`, `increment_video_correction_usage`
- [x] Storage bucket: `user-exercise-videos` con RLS policies
- [x] Edge Function: Gemini 1.5 Pro integration
- [x] Gemini API key: `AIzaSyBMIUgFOkneTaahxLYOZKjY6IvethkL8_s`

**Frontend**:
- [x] Video upload modal con camera recording
- [x] Progress tracking durante upload
- [x] Quota display (used/max per tier)
- [x] Gemini processing status polling
- [x] Video feedback view con score/issues/corrections
- [x] Paywall modal con 3 tiers
- [x] Auto-trigger paywall dopo 7 giorni

**Documentation**:
- [x] Deployment guide completo
- [x] Test plan dettagliato (8 test suites)
- [x] SQL queries pronte (16 sezioni)
- [x] Quick start guide (5 min test)

### ⏳ Da Fare (Next Session)

**High Priority**:
1. [ ] **Test sistema completo** (usa `QUICK_START_TESTING.md`)
   - Upload video reale
   - Verifica Gemini processing funziona
   - Testa feedback display
   - Testa paywall trigger

**Medium Priority** (opzionale):
2. [ ] **Stripe Integration** (2-3 ore se vuoi fare ora)
   - Setup Stripe account
   - Create products (€19.90/29.90/44.90)
   - Implement checkout flow
   - Webhook per aggiornare subscription_tier

**Low Priority** (future):
3. [ ] Email notifications (video ready, paywall reminders)
4. [ ] MediaPipe integration (ridurre costi AI)
5. [ ] Video comparison side-by-side
6. [ ] Mobile app port

---

## 🗂️ ARCHITETTURA SISTEMA

### User Flow Completo

```
1. USER REGISTRATION
   ↓
   users table created (subscription_tier = 'free', video_corrections_used = 0)

2. WORKOUT SESSION
   Dashboard → Start Workout LIVE
   ↓
   WorkoutLogger mostra esercizi
   ↓
   User click "📹 Record Form Check" button

3. VIDEO UPLOAD
   VideoUploadModal opens
   ↓
   Check quota: check_video_correction_quota(user_id)
   ↓
   IF can_upload = true:
     - User records/uploads video
     - Upload to Storage: user-exercise-videos/{user_id}/{timestamp}_{exercise}.mp4
     - Create record in video_corrections (status: 'pending')
     - Increment quota: increment_video_correction_usage(user_id)
     - Trigger Edge Function (fire-and-forget)
   ELSE:
     - Show "Quota Esaurita" modal
     - Offer upgrade to PRO/PREMIUM

4. GEMINI PROCESSING (Edge Function)
   analyze-exercise-video triggered
   ↓
   Download video from Storage
   ↓
   Convert to base64
   ↓
   Call Gemini 1.5 Pro API with exercise-specific prompt
   ↓
   Parse response:
     - feedback_score (1-10)
     - feedback_issues (JSON array)
     - feedback_corrections (JSON array)
     - feedback_warnings (JSON array)
     - load_recommendation (increase/maintain/decrease)
   ↓
   Update video_corrections (status: 'completed')

5. VIEW FEEDBACK
   User navigates to /video-feedback/{correction_id}
   ↓
   VideoFeedbackView loads:
     - Video player (signed URL from Storage)
     - Score visualization (stars, color coding)
     - Issues cards (severity badges)
     - Corrective cues (checkmarks)
     - Load recommendation

6. PAYWALL TRIGGER (7 days after signup)
   Dashboard.tsx useEffect:
   ↓
   Check: days_since_signup >= 7 AND subscription_tier = 'free'
   ↓
   IF true:
     - Show PaywallModal
     - Display user progress metrics
     - Show 3 tiers (BASE/PRO/PREMIUM)
     - [TODO] Stripe checkout flow
```

---

## 💰 PRICING MODEL

| Tier | Price | Duration | Video Corrections | Features |
|------|-------|----------|-------------------|----------|
| **FREE** | €0 | Week 1 only | 1 (demo) | Trial program |
| **BASE** | €19.90 | 6 weeks | 0 | Full program, no video |
| **PRO** | €29.90 | 6 weeks | 12 (2/week) | Program + AI video |
| **PREMIUM** | €44.90 | 6 weeks | Unlimited | Everything + coach |

**Business Model**:
- No auto-renewal (user re-purchases after 6 weeks)
- One-time payment per cycle
- Natural upsell moment at retest

**Costs (100 users/month)**:
- Gemini API: €2.64/month (330 videos × €0.008)
- Storage: <€1/month
- **Total**: ~€3.50/month
- **Margin**: 99.8%

---

## 🔧 CONFIGURAZIONE SUPABASE

### Database Tables

**users** (modified):
- `subscription_tier` VARCHAR(20) DEFAULT 'free' (CHECK: free/base/pro/premium)
- `video_corrections_used` INTEGER DEFAULT 0
- `video_corrections_reset_date` TIMESTAMP DEFAULT NOW()
- `subscription_start_date` TIMESTAMP
- `subscription_end_date` TIMESTAMP

**video_corrections**:
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL (FK → auth.users)
- `video_url` TEXT NOT NULL (Storage path)
- `video_filename` VARCHAR(255)
- `exercise_name` VARCHAR(255)
- `exercise_pattern` VARCHAR(50)
- `processing_status` VARCHAR(20) (pending/processing/completed/failed)
- `feedback_score` INTEGER (1-10)
- `feedback_issues` JSONB
- `feedback_corrections` JSONB
- `feedback_warnings` JSONB
- `load_recommendation` VARCHAR(50)
- `error_message` TEXT
- `viewed_at` TIMESTAMP
- `created_at` TIMESTAMP DEFAULT NOW()

**correction_quota_history**:
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL
- `old_used` INTEGER
- `new_used` INTEGER
- `reset_occurred` BOOLEAN
- `reset_reason` VARCHAR(100)
- `created_at` TIMESTAMP

### Storage Buckets

**user-exercise-videos**:
- `public` = false (private)
- Path structure: `{user_id}/{timestamp}_{exercise_name}_{random}.mp4`
- Max file size: 100MB
- RLS policies: Only user can upload/view their videos

### RPC Functions

**check_video_correction_quota(p_user_id UUID)**:
- Returns JSONB:
  ```json
  {
    "can_upload": boolean,
    "tier": "free|base|pro|premium",
    "used": number,
    "max_allowed": number,
    "remaining": number,
    "reset_date": "ISO timestamp",
    "days_until_reset": number
  }
  ```

**increment_video_correction_usage(p_user_id UUID)**:
- Increments `video_corrections_used`
- Logs to `correction_quota_history`
- Returns success boolean

### Edge Functions

**analyze-exercise-video**:
- Trigger: Manual (fire-and-forget from frontend)
- Input: `{ video_url, exercise_name, user_id, correction_id }`
- Gemini API: `gemini-1.5-pro` model
- Timeout: 60 seconds
- Secrets: `GEMINI_API_KEY`

---

## 🚀 QUICK COMMANDS

### Dev Server
```bash
cd "C:\Users\dario\OneDrive\Desktop\FitnessFlow\packages\web"
npm run dev
# Server: http://127.0.0.1:5177/
```

### Git Commands
```bash
cd "C:\Users\dario\OneDrive\Desktop\FitnessFlow"

# Status
git status

# Recent commits
git log --oneline -5

# Diff
git diff

# Commit
git add -A
git commit -m "message"

# Push
git push origin main
```

### Supabase CLI (se installato)
```bash
# Login
supabase login

# Edge Function logs
supabase functions logs analyze-exercise-video --follow

# Deploy function
supabase functions deploy analyze-exercise-video
```

---

## 📋 TESTING CHECKLIST

### Quick Test (5 min)
Segui `QUICK_START_TESTING.md`:

- [ ] Get User ID from Supabase
- [ ] Run DB verification queries
- [ ] Upload test video from UI
- [ ] Check Gemini processing logs
- [ ] View feedback page
- [ ] Test paywall trigger

### Full Test (60 min)
Segui `VIDEO_CORRECTION_TEST_PLAN.md`:

- [ ] Test 1: Database Setup
- [ ] Test 2: Quota System
- [ ] Test 3: Upload Flow
- [ ] Test 4: Gemini Processing
- [ ] Test 5: Feedback Display
- [ ] Test 6: Quota Exhaustion
- [ ] Test 7: Paywall Display
- [ ] Test 8: Error Handling

---

## 🐛 KNOWN ISSUES / NOTES

### Possibili Problemi

1. **Gemini API Quota**:
   - Free tier: 15 requests/minute
   - Se superi, processing fallisce
   - Check logs Edge Function per rate limit errors

2. **Video Size Limit**:
   - Max 100MB per video
   - Frontend blocca upload se > 100MB
   - Suggerisci video 10-20 secondi per test

3. **Storage RLS**:
   - Path must match: `{user_id}/...`
   - Se user_id nel path != auth.uid() → upload fails
   - Check RLS policies se upload bloccato

4. **Paywall Timing**:
   - Trigger: `created_at` >= 7 days ago
   - Se user creato oggi → paywall non mostra
   - Usa SQL per simulare:
     ```sql
     UPDATE users SET created_at = NOW() - INTERVAL '8 days' WHERE id = 'YOUR_USER_ID';
     ```

### Performance Notes

- **Video upload**: 5-30 secondi (dipende da size)
- **Gemini processing**: 30-60 secondi (video analysis)
- **Feedback loading**: <2 secondi (se processing completato)

---

## 💡 TIPS PER PROSSIMA SESSIONE

### Se riprendi tra qualche giorno:

1. **Check server running**:
   ```bash
   cd packages/web && npm run dev
   ```

2. **Review recent commits**:
   ```bash
   git log --oneline -10
   ```

3. **Read documents in ordine**:
   - `SESSION_SUMMARY.md` (overview completo)
   - `QUICK_START_TESTING.md` (se vuoi testare subito)
   - `VIDEO_CORRECTION_TEST_PLAN.md` (se hai problemi)

4. **Get User ID subito**:
   - Vai su Supabase → Authentication → Users
   - Copia ID, ti servirà per test

### Se vuoi continuare sviluppo:

**Next Features** (in ordine priorità):
1. Stripe integration (pagamenti reali)
2. Email notifications (via Supabase Edge Functions)
3. Video comparison (before/after)
4. Mobile app (React Native)
5. Coach dashboard (per tier PREMIUM)

---

## 📞 REFERENCE LINKS

### Supabase Dashboard
- Project: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
- Database Tables: .../editor
- Storage: .../storage/buckets/user-exercise-videos
- Edge Functions: .../functions
- Auth Users: .../auth/users
- Logs: .../logs

### Documentation Files
- `VIDEO_CORRECTION_SYSTEM_README.md` - Deployment guide completo
- `TODO_VIDEO_CORRECTION.md` - Task list originale (ieri)
- `VIDEO_CORRECTION_TEST_PLAN.md` - Test plan dettagliato (oggi)
- `video_correction_test_queries.sql` - SQL queries pronte (oggi)
- `QUICK_START_TESTING.md` - Quick test 5 min (oggi)
- `SESSION_SUMMARY.md` - Riepilogo implementazione (oggi)
- `CONVERSATION_CONTEXT.md` - Questo file (oggi)

### External APIs
- Gemini API Dashboard: https://aistudio.google.com/apikey
- Stripe Dashboard: https://dashboard.stripe.com/ (se implementi pagamenti)

---

## 🎯 OBIETTIVI NEXT SESSION

### Scenario A: Testing Only (1 ora)
1. Esegui quick test (5 min)
2. Se funziona → sistema production ready!
3. Se non funziona → usa full test plan per debug

### Scenario B: Testing + Stripe (3-4 ore)
1. Quick test sistema base (30 min)
2. Setup Stripe account (30 min)
3. Create products + checkout flow (2 ore)
4. Test payment flow (30 min)

### Scenario C: Production Deployment (2 ore)
1. Test completo locale (1 ora)
2. Deploy su Vercel/Netlify (30 min)
3. Test production (30 min)

---

## 📊 PROJECT STATS

**Total Development Time**: 2 giorni
**Total Files Created**: 17 files
**Total Lines Written**: ~4,000 righe (code + docs)
**Technologies Used**:
- React + TypeScript
- Supabase (Database, Storage, Edge Functions)
- Gemini 1.5 Pro AI
- Framer Motion (animations)
- Tailwind CSS (styling)

**Commits This Session**:
```
4729e7a - docs: Add session summary and implementation overview
f44280c - docs: Add comprehensive testing documentation
422757a - feat: Complete Paywall + Video Feedback integration
0a255d9 - feat: Video Correction System with Gemini AI + Paywall
```

---

## ✅ FINAL CHECKLIST

Prima di chiudere la sessione, verifica:

- [x] Tutti i file committati
- [x] Documentation completa
- [x] Server dev running (per test rapidi)
- [x] Gemini API key configurata
- [x] Database migration eseguita
- [x] Edge Function deployata
- [x] Questo file (CONVERSATION_CONTEXT.md) salvato

**Status**: ✅ TUTTO PRONTO PER TESTING

---

## 🚀 COME RIPRENDERE

**Prossima sessione, inizia così**:

1. Leggi `SESSION_SUMMARY.md` (5 min overview)
2. Leggi questo file (`CONVERSATION_CONTEXT.md`) per context
3. Scegli scenario:
   - Solo testing → `QUICK_START_TESTING.md`
   - Stripe integration → `VIDEO_CORRECTION_SYSTEM_README.md` sezione Stripe
   - Deploy production → verifica test prima

4. Get User ID:
   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```

5. Start dev server:
   ```bash
   cd packages/web && npm run dev
   ```

6. Go! 🚀

---

**Last Updated**: 2025-11-24 23:15 UTC
**Next Session**: Inizia con testing (usa QUICK_START_TESTING.md)
**Server**: http://127.0.0.1:5177/

Generated with Claude Code 🤖

Co-Authored-By: Claude <noreply@anthropic.com>
