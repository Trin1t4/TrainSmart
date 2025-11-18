-- ================================================================
-- ADMIN SYSTEM MIGRATION - SUPABASE
-- ================================================================
-- Sistema di ruoli admin per dashboard analytics
--
-- FEATURES:
-- 1. Tabella user_roles per gestire ruoli (user, admin, superadmin)
-- 2. RLS policies per admin access su tabelle analytics
-- 3. Funzioni helper per check admin status
-- ================================================================

-- ================================================================
-- 1. USER ROLES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'admin', 'superadmin'
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id), -- chi ha concesso il ruolo
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_roles_role_check CHECK (role IN ('user', 'admin', 'superadmin')),
  CONSTRAINT user_roles_user_unique UNIQUE (user_id)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ================================================================
-- 2. RLS POLICIES PER USER_ROLES
-- ================================================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users possono vedere il proprio ruolo
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Solo admin possono vedere tutti i ruoli
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Solo superadmin possono modificare i ruoli
DROP POLICY IF EXISTS "Superadmins can manage roles" ON user_roles;
CREATE POLICY "Superadmins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );

-- ================================================================
-- 3. RLS POLICIES PER ANALYTICS (Admin Access)
-- ================================================================

-- Analytics Schema: Admin possono vedere tutti i dati
-- Dimension tables
ALTER TABLE analytics.dim_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all users analytics" ON analytics.dim_users;
CREATE POLICY "Admins can view all users analytics"
  ON analytics.dim_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Fact tables
ALTER TABLE analytics.fact_workouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all workouts analytics" ON analytics.fact_workouts;
CREATE POLICY "Admins can view all workouts analytics"
  ON analytics.fact_workouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

ALTER TABLE analytics.fact_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all exercises analytics" ON analytics.fact_exercises;
CREATE POLICY "Admins can view all exercises analytics"
  ON analytics.fact_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Aggregated tables
ALTER TABLE analytics.agg_business_metrics_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view business metrics" ON analytics.agg_business_metrics_daily;
CREATE POLICY "Admins can view business metrics"
  ON analytics.agg_business_metrics_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

ALTER TABLE analytics.agg_user_activity_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view user activity" ON analytics.agg_user_activity_daily;
CREATE POLICY "Admins can view user activity"
  ON analytics.agg_user_activity_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

ALTER TABLE analytics.agg_rpe_trends_monthly ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view RPE trends" ON analytics.agg_rpe_trends_monthly;
CREATE POLICY "Admins can view RPE trends"
  ON analytics.agg_rpe_trends_monthly FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- 4. HELPER FUNCTIONS
-- ================================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR(50) AS $$
DECLARE
  user_role VARCHAR(50);
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant admin role to user (solo superadmin)
CREATE OR REPLACE FUNCTION grant_admin_role(
  target_user_id UUID,
  new_role VARCHAR(50),
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_role VARCHAR(50);
BEGIN
  -- Check if caller is superadmin
  SELECT role INTO current_role
  FROM user_roles
  WHERE user_id = auth.uid();

  IF current_role != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can grant roles';
  END IF;

  -- Check if role is valid
  IF new_role NOT IN ('user', 'admin', 'superadmin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  -- Insert or update role
  INSERT INTO user_roles (user_id, role, granted_by, notes)
  VALUES (target_user_id, new_role, auth.uid(), admin_notes)
  ON CONFLICT (user_id)
  DO UPDATE SET
    role = new_role,
    granted_by = auth.uid(),
    granted_at = NOW(),
    notes = admin_notes;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. SEED INITIAL ADMIN USER (MANUAL - Inserisci la tua email)
-- ================================================================
-- IMPORTANTE: Modifica questo con la tua email Supabase prima di eseguire!
-- Uncomment e modifica la email:

-- INSERT INTO user_roles (user_id, role, notes)
-- SELECT id, 'superadmin', 'Initial superadmin setup'
-- FROM auth.users
-- WHERE email = 'TUA_EMAIL_ADMIN@example.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- ================================================================
-- 6. SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Admin System Migration Complete!';
  RAISE NOTICE 'Tables created: user_roles';
  RAISE NOTICE 'RLS Policies: 10+ policies for analytics access';
  RAISE NOTICE 'Functions: is_admin(), get_user_role(), grant_admin_role()';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Crea il primo admin manualmente!';
  RAISE NOTICE 'Esegui questa query con la tua email:';
  RAISE NOTICE '';
  RAISE NOTICE 'INSERT INTO user_roles (user_id, role, notes)';
  RAISE NOTICE 'SELECT id, ''superadmin'', ''Initial admin''';
  RAISE NOTICE 'FROM auth.users';
  RAISE NOTICE 'WHERE email = ''tua_email@example.com'';';
END $$;
