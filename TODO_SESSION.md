# 📋 TODO LIST - Session in Progress

**Last Updated**: 2025-11-24
**Current Focus**: Video Correction System Testing & UI Fixes

---

## ✅ COMPLETED

1. [x] Get User ID from Supabase Dashboard
   - User ID: `010466e3-a02a-48c9-bfd4-24620dbd9440`
   - Created user record in `public.users` table

2. [x] Verify database setup (tables, functions, storage)
   - ✅ `video_corrections` table exists
   - ✅ `check_video_correction_quota` function works
   - ✅ `user-exercise-videos` storage bucket exists
   - ✅ Quota system returns: `can_upload: true`, `remaining: 1`

3. [x] Start dev server and login
   - Server running: http://127.0.0.1:5173/
   - User logged in successfully

4. [x] Fix LiveWorkout → WorkoutLogger flow
   - LiveWorkoutSession now opens WorkoutLogger after completion
   - Commit: `001363d`

---

## 🔄 IN PROGRESS / NEXT STEPS

### High Priority (Video System Testing)

5. [ ] **Add video upload button in LiveWorkout** (after each set with RPE)
   - Location: Inside LiveWorkoutSession.tsx
   - When: After each set, in RPE input modal
   - UI: Add "📹 Carica Video Form Check" button
   - Integration: VideoUploadModal component
   - User request: Video upload must be available during workout, not after

6. [ ] **Upload test video via WorkoutLogger**
   - Test VideoUploadModal functionality
   - Upload 10-15 second test video
   - Verify quota decrement
   - Check storage upload works

7. [ ] **Check Gemini processing in Edge Function logs**
   - Supabase → Edge Functions → analyze-exercise-video → Logs
   - Verify Gemini API call succeeds
   - Check processing status: pending → processing → completed
   - Verify feedback stored in database

8. [ ] **View feedback on /video-feedback page**
   - Navigate to /video-feedback/{correction_id}
   - Verify video player works
   - Check score display (1-10)
   - Verify issues/corrections/warnings display

9. [ ] **Test paywall trigger (simulate 8 days)**
   - SQL: `UPDATE users SET created_at = NOW() - INTERVAL '8 days' WHERE id = '010466e3-a02a-48c9-bfd4-24620dbd9440';`
   - Reload Dashboard
   - Verify PaywallModal appears
   - Check 3 tiers display: BASE (€19.90) / PRO (€29.90) / PREMIUM (€44.90)

---

### Medium Priority (UI Fixes)

10. [ ] **Fix prescreening menu scroll issue**
    - Location: Pre-screening/onboarding flow
    - Issue: Menu doesn't scroll properly
    - Impact: User can't see all options

11. [ ] **Fix exercise description - always visible, not dropdown**
    - Location: Exercise cards in workout view
    - Issue: Descriptions hidden in dropdown menu
    - Fix: Show descriptions as plain text, always visible
    - User feedback: "la descrizione esercizio non deve essere in menu a tendina. deve essere scritta chiaramente"

---

### Low Priority (Feature Additions)

12. [ ] **Add anagrafica step to onboarding** (nome, cognome, privacy)
    - Issue: No personal data collection (name, surname)
    - Impact: Required for Stripe payments, GDPR compliance, professional UX
    - Solution: Add "Step 0: Anagrafica" in onboarding
    - Fields:
      - Nome (required)
      - Cognome (required)
      - Data di nascita (optional but useful)
      - Checkbox privacy/terms (required for GDPR)

---

## 🐛 KNOWN ISSUES

### Database Errors (Non-blocking)
- **406 errors on `pain_thresholds` table**
  - Multiple requests failing with 406 (Not Acceptable)
  - Likely RLS policy issue or Accept headers problem
  - Affects: Pain tracking feature
  - Priority: Low (doesn't block video system)

### Missing Features
- **No Stripe integration** (payments not functional)
  - Paywall shows but can't actually pay
  - Needs: Stripe setup, products creation, checkout flow, webhooks

---

## 📊 PROJECT STATUS

**Video Correction System**:
- Backend: ✅ Complete (DB, Storage, Edge Function, Gemini API)
- Frontend: 🔄 80% (VideoUploadModal exists, needs LiveWorkout integration)
- Testing: ⏳ Not yet tested end-to-end

**User Onboarding**:
- Basic flow: ✅ Working
- Anagrafica: ❌ Missing (critical for payments)

**Workout System**:
- LiveWorkout: ✅ Working
- WorkoutLogger: ✅ Working
- UI issues: ⚠️ Scroll problems, descriptions in dropdown

---

## 🎯 NEXT SESSION PRIORITIES

1. **Integrate video upload in LiveWorkout** (highest priority, user request)
2. **Test video system end-to-end** (upload → Gemini → feedback)
3. **Fix UI issues** (scroll, descriptions)
4. **Add anagrafica step** (required for production)

---

## 🔗 IMPORTANT CONTEXT FILES

- `CONVERSATION_CONTEXT.md` - Full system documentation
- `SESSION_SUMMARY.md` - Implementation overview
- `VIDEO_CORRECTION_TEST_PLAN.md` - Testing guide
- `QUICK_START_TESTING.md` - 5-minute quick test

---

## 🗃️ DATABASE INFO

**User ID**: `010466e3-a02a-48c9-bfd4-24620dbd9440`
**Email**: `noisiamonoi.benessere@gmail.com`
**Tier**: `free`
**Video quota**: `0/1 used`

---

Generated with Claude Code 🤖

Co-Authored-By: Claude <noreply@anthropic.com>
