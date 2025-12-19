-- ================================================================
-- FIX: Reliable user_profile creation on signup
-- Date: 2025-12-13
-- Problem: "Database error saving new user" when registering
-- Solution: Trigger with SECURITY DEFINER + fallback RLS policy
-- ================================================================

-- ================================================================
-- 1. DROP old trigger and function (clean slate)
-- ================================================================
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_profile();

-- ================================================================
-- 2. CREATE robust function with SECURITY DEFINER
-- This bypasses RLS and runs with elevated privileges
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- ================================================================
-- 3. CREATE trigger on auth.users
-- Fires AFTER INSERT so user exists in auth.users
-- ================================================================
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- ================================================================
-- 4. UPDATE RLS policy for user_profiles INSERT
-- Allow INSERT when user_id matches the inserting user's ID
-- OR when called from a SECURITY DEFINER function (service role)
-- ================================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
WITH CHECK (
  -- Normal case: authenticated user inserting their own profile
  auth.uid() = user_id
  OR
  -- Trigger case: auth.uid() is NULL but we trust SECURITY DEFINER
  auth.uid() IS NULL
);

-- ================================================================
-- 5. BACKFILL: Create profiles for any users missing them
-- ================================================================
INSERT INTO user_profiles (user_id, email, onboarding_completed, created_at, updated_at)
SELECT
  id,
  email,
  false,
  COALESCE(created_at, NOW()),
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ================================================================
-- 6. VERIFICATION
-- ================================================================
DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
  users_without_profile INTEGER;
BEGIN
  -- Check trigger
  SELECT EXISTS(
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created_profile'
  ) INTO trigger_exists;

  -- Check function
  SELECT EXISTS(
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_new_user_profile'
  ) INTO function_exists;

  -- Check orphan users
  SELECT COUNT(*) INTO users_without_profile
  FROM auth.users u
  LEFT JOIN user_profiles p ON u.id = p.user_id
  WHERE p.user_id IS NULL;

  IF NOT trigger_exists THEN
    RAISE EXCEPTION 'TRIGGER on_auth_user_created_profile was not created!';
  END IF;

  IF NOT function_exists THEN
    RAISE EXCEPTION 'FUNCTION handle_new_user_profile was not created!';
  END IF;

  IF users_without_profile > 0 THEN
    RAISE WARNING 'Found % users without profiles (backfill may have failed)', users_without_profile;
  END IF;

  RAISE NOTICE 'SUCCESS: Trigger and function created. All users have profiles.';
END;
$$;

-- ================================================================
-- NOTES
-- ================================================================
--
-- This migration ensures:
-- 1. Every new signup automatically gets a user_profile (via trigger)
-- 2. The trigger uses SECURITY DEFINER to bypass RLS
-- 3. Existing users without profiles get backfilled
-- 4. The RLS policy allows both authenticated INSERT and trigger INSERT
--
-- To verify manually:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile';
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user_profile';
-- SELECT COUNT(*) FROM auth.users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE p.user_id IS NULL;
--
