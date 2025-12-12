-- ============================================
-- TEAMFLOW COMPLETE DATABASE MIGRATION
-- ============================================
-- Eseguire nella dashboard Supabase → SQL Editor
-- Data: 2025-12-01
-- ============================================

-- ============================================
-- 1. TEAMS TABLE (Core TeamFlow)
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  sport TEXT NOT NULL,
  category TEXT,
  level TEXT,
  season_start DATE,
  season_end DATE,
  current_phase TEXT DEFAULT 'pre_season',
  subscription_tier TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'trial',
  max_athletes INT DEFAULT 25,
  trial_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{
    "require_daily_checkin": true,
    "checkin_reminder_time": "08:00",
    "share_analytics_with_athletes": false,
    "allow_athlete_program_view": true,
    "injury_alert_threshold": 3
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_sport ON teams(sport);

-- ============================================
-- 2. TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'athlete',
  jersey_number INT,
  position TEXT,
  dominant_foot TEXT,
  dominant_hand TEXT,
  status TEXT DEFAULT 'active',
  injury_notes TEXT,
  return_date DATE,
  permissions JSONB DEFAULT '{
    "can_view_team_analytics": false,
    "can_edit_own_program": false,
    "can_view_other_athletes": false
  }'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  invite_accepted_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

-- ============================================
-- 3. TEAM INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'athlete',
  position TEXT,
  jersey_number INT,
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(invite_token);

-- ============================================
-- 4. ATHLETE CHECKINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS athlete_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3,1),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  mood INT CHECK (mood BETWEEN 1 AND 10),
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  muscle_soreness INT CHECK (muscle_soreness BETWEEN 1 AND 10),
  soreness_areas TEXT[],
  injury_pain INT CHECK (injury_pain BETWEEN 0 AND 10),
  injury_notes TEXT,
  available_for_training BOOLEAN DEFAULT true,
  unavailable_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_team_date ON athlete_checkins(team_id, checkin_date);

-- ============================================
-- 5. RLS POLICIES FOR TEAMS
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Teams visible to members" ON teams;
DROP POLICY IF EXISTS "Teams insertable by authenticated" ON teams;
DROP POLICY IF EXISTS "Teams editable by staff" ON teams;
DROP POLICY IF EXISTS "Members visible to team" ON team_members;
DROP POLICY IF EXISTS "Members insertable by staff" ON team_members;
DROP POLICY IF EXISTS "Checkins policy" ON athlete_checkins;

-- Teams policies
CREATE POLICY "Teams visible to members" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "Teams insertable by authenticated" ON teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teams editable by staff" ON teams
  FOR UPDATE USING (
    created_by = auth.uid()
    OR id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Team members policies
CREATE POLICY "Members visible to team" ON team_members
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Members insertable by staff" ON team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
    OR team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Checkins policies
CREATE POLICY "Checkins policy" ON athlete_checkins
  FOR ALL USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'coach', 'assistant_coach', 'physio')
    )
  );

-- ============================================
-- 6. SPORT POSITIONS LOOKUP TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sport_positions (
  sport TEXT NOT NULL,
  position_key TEXT NOT NULL,
  position_name_it TEXT NOT NULL,
  position_name_en TEXT NOT NULL,
  category TEXT,
  PRIMARY KEY (sport, position_key)
);

-- Insert positions if not exists
INSERT INTO sport_positions (sport, position_key, position_name_it, position_name_en, category) VALUES
  ('football', 'goalkeeper', 'Portiere', 'Goalkeeper', 'goalkeeper'),
  ('football', 'center_back', 'Difensore Centrale', 'Center Back', 'defense'),
  ('football', 'full_back', 'Terzino', 'Full Back', 'defense'),
  ('football', 'wing_back', 'Esterno', 'Wing Back', 'defense'),
  ('football', 'defensive_mid', 'Mediano', 'Defensive Midfielder', 'midfield'),
  ('football', 'central_mid', 'Centrocampista', 'Central Midfielder', 'midfield'),
  ('football', 'attacking_mid', 'Trequartista', 'Attacking Midfielder', 'midfield'),
  ('football', 'winger', 'Ala', 'Winger', 'attack'),
  ('football', 'striker', 'Attaccante', 'Striker', 'attack'),
  ('basketball', 'point_guard', 'Playmaker', 'Point Guard', 'backcourt'),
  ('basketball', 'shooting_guard', 'Guardia', 'Shooting Guard', 'backcourt'),
  ('basketball', 'small_forward', 'Ala Piccola', 'Small Forward', 'frontcourt'),
  ('basketball', 'power_forward', 'Ala Grande', 'Power Forward', 'frontcourt'),
  ('basketball', 'center', 'Centro', 'Center', 'frontcourt'),
  ('volleyball', 'setter', 'Palleggiatore', 'Setter', 'setter'),
  ('volleyball', 'outside_hitter', 'Schiacciatore', 'Outside Hitter', 'hitter'),
  ('volleyball', 'opposite', 'Opposto', 'Opposite', 'hitter'),
  ('volleyball', 'middle_blocker', 'Centrale', 'Middle Blocker', 'blocker'),
  ('volleyball', 'libero', 'Libero', 'Libero', 'libero')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION get_team_role(p_team_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM team_members
  WHERE team_id = p_team_id AND user_id = p_user_id
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_team_staff(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
    AND user_id = p_user_id
    AND role IN ('owner', 'coach', 'assistant_coach', 'physio', 'nutritionist')
  )
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 8. UPDATE TRIGGER FOR TEAMS
-- ============================================
CREATE OR REPLACE FUNCTION update_team_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS teams_updated_at ON teams;
CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_team_timestamp();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after migration to verify:

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('teams', 'team_members', 'team_invites', 'athlete_checkins', 'sport_positions');

-- SELECT * FROM sport_positions LIMIT 5;

COMMENT ON TABLE teams IS 'TeamFlow - Squadre sportive';
COMMENT ON TABLE team_members IS 'TeamFlow - Membri delle squadre';
COMMENT ON TABLE athlete_checkins IS 'TeamFlow - Check-in giornaliero atleti';
