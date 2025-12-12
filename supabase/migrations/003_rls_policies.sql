-- ========================================
-- COMPLETE RLS POLICIES - ALL TABLES
-- ========================================
--
-- SECURITY AUDIT: 2025-11-17
-- CRITICAL FIX: Add RLS to 8 tables missing protection
--
-- Tables covered:
-- 1. training_programs (already secured ✅)
-- 2. recovery_tracking (NEW)
-- 3. user_profiles (NEW)
-- 4. assessments (NEW)
-- 5. body_scans (NEW)
-- 6. onboarding_data (NEW)
-- 7. user_preferences (NEW)
-- 8. set_feedback (NEW)
--
-- ========================================

-- ========================================
-- 1. TRAINING_PROGRAMS (already secured)
-- ========================================
-- Policies already exist from fix_rls_policies.sql
-- Verify with: SELECT * FROM pg_policies WHERE tablename = 'training_programs';

-- ========================================
-- 2. RECOVERY_TRACKING
-- ========================================

-- Enable RLS
ALTER TABLE recovery_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own recovery" ON recovery_tracking;
DROP POLICY IF EXISTS "Users can insert own recovery" ON recovery_tracking;
DROP POLICY IF EXISTS "Users can update own recovery" ON recovery_tracking;
DROP POLICY IF EXISTS "Users can delete own recovery" ON recovery_tracking;

-- SELECT: Users can only view their own recovery data
CREATE POLICY "Users can view own recovery"
ON recovery_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own recovery data
CREATE POLICY "Users can insert own recovery"
ON recovery_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own recovery data
CREATE POLICY "Users can update own recovery"
ON recovery_tracking
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own recovery data
CREATE POLICY "Users can delete own recovery"
ON recovery_tracking
FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 3. USER_PROFILES
-- ========================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- SELECT: Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create their own profile
-- Note: Usually done once during registration
CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own profile (GDPR right to deletion)
CREATE POLICY "Users can delete own profile"
ON user_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 4. ASSESSMENTS
-- ========================================

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can delete own assessments" ON assessments;

-- SELECT: Users can only view their own assessments
CREATE POLICY "Users can view own assessments"
ON assessments
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create their own assessments
CREATE POLICY "Users can insert own assessments"
ON assessments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own assessments
CREATE POLICY "Users can update own assessments"
ON assessments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
ON assessments
FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 5. BODY_SCANS
-- ========================================

-- Enable RLS
ALTER TABLE body_scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own body scans" ON body_scans;
DROP POLICY IF EXISTS "Users can insert own body scans" ON body_scans;
DROP POLICY IF EXISTS "Users can update own body scans" ON body_scans;
DROP POLICY IF EXISTS "Users can delete own body scans" ON body_scans;

-- SELECT: Users can only view their own body scan data
-- CRITICAL: Body photos are sensitive personal data
CREATE POLICY "Users can view own body scans"
ON body_scans
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can upload their own body scans
CREATE POLICY "Users can insert own body scans"
ON body_scans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own body scans
CREATE POLICY "Users can update own body scans"
ON body_scans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own body scans (IMPORTANT for privacy)
CREATE POLICY "Users can delete own body scans"
ON body_scans
FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 6. ONBOARDING_DATA
-- ========================================

-- Enable RLS
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own onboarding" ON onboarding_data;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON onboarding_data;
DROP POLICY IF EXISTS "Users can update own onboarding" ON onboarding_data;
DROP POLICY IF EXISTS "Users can delete own onboarding" ON onboarding_data;

-- SELECT: Users can only view their own onboarding data
CREATE POLICY "Users can view own onboarding"
ON onboarding_data
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create their own onboarding data
CREATE POLICY "Users can insert own onboarding"
ON onboarding_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own onboarding data
CREATE POLICY "Users can update own onboarding"
ON onboarding_data
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own onboarding data
CREATE POLICY "Users can delete own onboarding"
ON onboarding_data
FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 7. USER_PREFERENCES
-- ========================================

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- SELECT: Users can only view their own preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create their own preferences
CREATE POLICY "Users can insert own preferences"
ON user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
ON user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 8. SET_FEEDBACK
-- ========================================

-- Enable RLS
ALTER TABLE set_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own set feedback" ON set_feedback;
DROP POLICY IF EXISTS "Users can insert own set feedback" ON set_feedback;
DROP POLICY IF EXISTS "Users can update own set feedback" ON set_feedback;
DROP POLICY IF EXISTS "Users can delete own set feedback" ON set_feedback;

-- SELECT: Users can only view their own set feedback
CREATE POLICY "Users can view own set feedback"
ON set_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create their own set feedback
CREATE POLICY "Users can insert own set feedback"
ON set_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own set feedback
CREATE POLICY "Users can update own set feedback"
ON set_feedback
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own set feedback
CREATE POLICY "Users can delete own set feedback"
ON set_feedback
FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- 1. Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN (
  'training_programs',
  'recovery_tracking',
  'user_profiles',
  'assessments',
  'body_scans',
  'onboarding_data',
  'user_preferences',
  'set_feedback'
)
ORDER BY tablename;

-- Expected output: rowsecurity = true for ALL tables

-- 2. Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
  'training_programs',
  'recovery_tracking',
  'user_profiles',
  'assessments',
  'body_scans',
  'onboarding_data',
  'user_preferences',
  'set_feedback'
)
GROUP BY tablename
ORDER BY tablename;

-- Expected output: 4 policies per table (SELECT, INSERT, UPDATE, DELETE)

-- 3. List all policies (detailed view)
SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'No USING clause'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename IN (
  'training_programs',
  'recovery_tracking',
  'user_profiles',
  'assessments',
  'body_scans',
  'onboarding_data',
  'user_preferences',
  'set_feedback'
)
ORDER BY tablename, cmd, policyname;

-- ========================================
-- TESTING GUIDE
-- ========================================

/*
STEP 1: Execute this entire SQL file in Supabase SQL Editor

STEP 2: Verify RLS is enabled
Run verification query #1 above
All tables should show rowsecurity = true

STEP 3: Verify policy count
Run verification query #2 above
Each table should have 4 policies

STEP 4: Test from frontend
- Login as User A
- Create some data (program, recovery entry, etc.)
- Logout
- Login as User B
- Try to access User A's data → Should fail (403 Forbidden)
- Create User B's own data → Should succeed
- Query User B's data → Should only see their own data

STEP 5: Test GDPR compliance
- User can export their data (SELECT works)
- User can delete their data (DELETE works)
- After deletion, data is gone from all tables

CRITICAL NOTES:
1. These policies use auth.uid() which requires user to be authenticated
2. Unauthenticated users will get 0 results (secure by default)
3. service_role key bypasses RLS (use only in backend/admin operations)
4. anon key respects RLS (used in frontend)

SECURITY BEST PRACTICES:
- Never expose service_role key to frontend
- Always use anon key in client-side code
- Test policies with real user sessions
- Monitor policy violations in Supabase logs
- Regular audit of pg_policies table

GDPR COMPLIANCE:
✅ Right to access: SELECT policies
✅ Right to rectification: UPDATE policies
✅ Right to erasure: DELETE policies
✅ Data portability: SELECT + export JSON
✅ Purpose limitation: user_id isolation
✅ Data minimization: only necessary columns
✅ Storage limitation: user can delete anytime

NEXT STEPS:
1. Implement server-side validation (Supabase Edge Functions)
2. Add audit logging (who accessed what, when)
3. Encrypt sensitive fields (injury_details, body_scans paths)
4. Rate limiting to prevent brute force
5. Privacy policy + GDPR endpoints in frontend
*/
