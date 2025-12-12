-- ================================================================
-- SOCIAL FEATURES - SUPABASE MIGRATION
-- FitnessFlow/TrainFlow v4.1.0
-- Date: 2025-11-30
-- ================================================================

-- ================================================================
-- SECTION 1: EXTEND USER_PROFILES FOR SOCIAL
-- ================================================================

-- Add social columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS privacy_setting VARCHAR(20) DEFAULT 'public'
  CHECK (privacy_setting IN ('public', 'followers_only', 'private'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_workouts INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_volume DECIMAL(12,2) DEFAULT 0;

-- Index for username search
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_privacy ON user_profiles(privacy_setting);

-- ================================================================
-- SECTION 2: FOLLOWERS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_status ON followers(status);

-- RLS
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows where they are involved"
  ON followers FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON followers FOR DELETE
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can update follow status"
  ON followers FOR UPDATE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- ================================================================
-- SECTION 3: PERSONAL RECORDS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Exercise Info
  exercise_name VARCHAR(200) NOT NULL,
  exercise_pattern VARCHAR(50),

  -- Record Type
  record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('1rm', 'max_reps', 'max_weight', 'best_volume')),

  -- Record Value
  value DECIMAL(10,2) NOT NULL,
  weight_used DECIMAL(6,2),
  reps_at_weight INTEGER,

  -- Previous Record (for delta/improvement)
  previous_value DECIMAL(10,2),
  improvement_percent DECIMAL(5,2),

  -- Context
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE SET NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_pr_per_exercise UNIQUE (user_id, exercise_name, record_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_date ON personal_records(achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_type ON personal_records(record_type);

-- RLS
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PRs"
  ON personal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own PRs"
  ON personal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PRs"
  ON personal_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own PRs"
  ON personal_records FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- SECTION 4: PERSONAL RECORDS HISTORY
-- ================================================================

CREATE TABLE IF NOT EXISTS personal_records_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_record_id UUID NOT NULL REFERENCES personal_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  value DECIMAL(10,2) NOT NULL,
  weight_used DECIMAL(6,2),
  achieved_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pr_history_record ON personal_records_history(personal_record_id);
CREATE INDEX IF NOT EXISTS idx_pr_history_user ON personal_records_history(user_id);

ALTER TABLE personal_records_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PR history"
  ON personal_records_history FOR SELECT
  USING (auth.uid() = user_id);

-- ================================================================
-- SECTION 5: ACHIEVEMENTS TABLE (Definitions)
-- ================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Achievement Definition
  code VARCHAR(50) UNIQUE NOT NULL,
  name_it VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_it TEXT,
  description_en TEXT,

  -- Visual
  icon VARCHAR(50),
  badge_color VARCHAR(20),

  -- Requirements
  category VARCHAR(50) NOT NULL CHECK (category IN ('consistency', 'strength', 'volume', 'milestone', 'special')),
  requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN ('count', 'streak', 'value', 'time')),
  requirement_value DECIMAL(10,2) NOT NULL,
  requirement_unit VARCHAR(20),

  -- Rarity
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  points INTEGER DEFAULT 10,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);

-- RLS - Achievements are public (definitions)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- ================================================================
-- SECTION 6: USER ACHIEVEMENTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  trigger_workout_id UUID REFERENCES workout_logs(id) ON DELETE SET NULL,
  trigger_value DECIMAL(10,2),

  -- Sharing
  shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMPTZ,

  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_date ON user_achievements(unlocked_at DESC);

-- RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user achievements"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can unlock own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- SECTION 7: SOCIAL POSTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Post Type
  post_type VARCHAR(30) NOT NULL CHECK (post_type IN (
    'workout_completed', 'pr_achieved', 'streak_milestone',
    'achievement_unlocked', 'custom', 'workout_summary'
  )),

  -- Content
  title VARCHAR(200),
  content TEXT,

  -- Rich Content (JSON)
  metadata JSONB DEFAULT '{}',

  -- Media
  image_url TEXT,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE SET NULL,
  personal_record_id UUID REFERENCES personal_records(id) ON DELETE SET NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,

  -- Visibility
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'followers_only', 'private')),

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,

  -- Status
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_not_deleted ON social_posts(is_deleted) WHERE is_deleted = false;

-- RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public posts"
  ON social_posts FOR SELECT
  USING (
    is_deleted = false AND (
      visibility = 'public'
      OR user_id = auth.uid()
      OR (visibility = 'followers_only' AND EXISTS (
        SELECT 1 FROM followers
        WHERE following_id = social_posts.user_id
        AND follower_id = auth.uid()
        AND status = 'active'
      ))
    )
  );

CREATE POLICY "Users can create own posts"
  ON social_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON social_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete own posts"
  ON social_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- SECTION 8: POST LIKES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_like UNIQUE (post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- SECTION 9: POST COMMENTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  likes_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_id);

-- RLS
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can comment"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own comments"
  ON post_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- SECTION 10: WORKOUT STREAKS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS workout_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,

  -- Monthly stats
  workouts_this_month INTEGER DEFAULT 0,
  volume_this_month DECIMAL(12,2) DEFAULT 0,

  -- Weekly stats
  workouts_this_week INTEGER DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_workout_streaks_user ON workout_streaks(user_id);

-- RLS
ALTER TABLE workout_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON workout_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others streaks via public profiles"
  ON workout_streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = workout_streaks.user_id
      AND privacy_setting = 'public'
    )
  );

CREATE POLICY "System can manage streaks"
  ON workout_streaks FOR ALL
  USING (auth.uid() = user_id);

-- ================================================================
-- SECTION 11: TRIGGER FUNCTIONS
-- ================================================================

-- Function: Update followers count
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE user_profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE user_id = NEW.following_id;
    UPDATE user_profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE user_id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE user_profiles SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE user_id = OLD.following_id;
    UPDATE user_profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE user_id = OLD.follower_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE user_profiles SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE user_id = NEW.following_id;
      UPDATE user_profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE user_id = NEW.follower_id;
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE user_profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE user_id = NEW.following_id;
      UPDATE user_profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE user_id = NEW.follower_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_followers_count
AFTER INSERT OR UPDATE OR DELETE ON followers
FOR EACH ROW EXECUTE FUNCTION update_followers_count();

-- Function: Update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Function: Update comments count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- Function: Check for new PR from exercise_logs
CREATE OR REPLACE FUNCTION check_for_new_pr()
RETURNS TRIGGER AS $$
DECLARE
  v_current_max DECIMAL(10,2);
  v_user_id UUID;
  v_pr_id UUID;
BEGIN
  -- Get user_id from workout_log
  SELECT user_id INTO v_user_id FROM workout_logs WHERE id = NEW.workout_log_id;

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if this is a new max weight for this exercise
  SELECT COALESCE(value, 0) INTO v_current_max
  FROM personal_records
  WHERE user_id = v_user_id
    AND exercise_name = NEW.exercise_name
    AND record_type = 'max_weight';

  IF NEW.weight_used > v_current_max THEN
    -- Insert or update PR
    INSERT INTO personal_records (
      user_id,
      exercise_name,
      exercise_pattern,
      record_type,
      value,
      weight_used,
      reps_at_weight,
      previous_value,
      improvement_percent,
      workout_log_id
    )
    VALUES (
      v_user_id,
      NEW.exercise_name,
      NEW.pattern,
      'max_weight',
      NEW.weight_used,
      NEW.weight_used,
      NEW.reps_completed,
      CASE WHEN v_current_max > 0 THEN v_current_max ELSE NULL END,
      CASE WHEN v_current_max > 0 THEN ((NEW.weight_used - v_current_max) / v_current_max * 100) ELSE NULL END,
      NEW.workout_log_id
    )
    ON CONFLICT (user_id, exercise_name, record_type)
    DO UPDATE SET
      previous_value = personal_records.value,
      value = NEW.weight_used,
      weight_used = NEW.weight_used,
      reps_at_weight = NEW.reps_completed,
      improvement_percent = ((NEW.weight_used - personal_records.value) / personal_records.value * 100),
      workout_log_id = NEW.workout_log_id,
      achieved_at = NOW()
    RETURNING id INTO v_pr_id;

    -- Log to history
    IF v_pr_id IS NOT NULL AND v_current_max > 0 THEN
      INSERT INTO personal_records_history (personal_record_id, user_id, value, weight_used, achieved_at)
      VALUES (v_pr_id, v_user_id, v_current_max, v_current_max, NOW() - INTERVAL '1 second');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_check_for_new_pr
AFTER INSERT ON exercise_logs
FOR EACH ROW
WHEN (NEW.weight_used IS NOT NULL AND NEW.weight_used > 0)
EXECUTE FUNCTION check_for_new_pr();

-- Function: Update workout streak
CREATE OR REPLACE FUNCTION update_workout_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_workout_date DATE;
BEGIN
  v_workout_date := DATE(NEW.workout_date);

  -- Get current streak data
  SELECT last_workout_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM workout_streaks WHERE user_id = NEW.user_id;

  -- If no record exists, create one
  IF v_last_date IS NULL THEN
    INSERT INTO workout_streaks (user_id, current_streak, longest_streak, last_workout_date, workouts_this_month, workouts_this_week)
    VALUES (NEW.user_id, 1, 1, v_workout_date, 1, 1);
  ELSE
    -- Don't count multiple workouts on same day
    IF v_last_date = v_workout_date THEN
      -- Just update monthly/weekly counts
      UPDATE workout_streaks
      SET workouts_this_month = workouts_this_month + 1,
          workouts_this_week = workouts_this_week + 1,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF v_last_date = v_workout_date - 1 THEN
      -- Consecutive day - increase streak
      v_current_streak := v_current_streak + 1;
      IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
      END IF;

      UPDATE workout_streaks
      SET current_streak = v_current_streak,
          longest_streak = v_longest_streak,
          last_workout_date = v_workout_date,
          workouts_this_month = workouts_this_month + 1,
          workouts_this_week = workouts_this_week + 1,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Gap in days - reset streak
      UPDATE workout_streaks
      SET current_streak = 1,
          last_workout_date = v_workout_date,
          workouts_this_month = CASE
            WHEN EXTRACT(MONTH FROM v_last_date) = EXTRACT(MONTH FROM v_workout_date)
            THEN workouts_this_month + 1
            ELSE 1
          END,
          workouts_this_week = CASE
            WHEN EXTRACT(WEEK FROM v_last_date) = EXTRACT(WEEK FROM v_workout_date)
            THEN workouts_this_week + 1
            ELSE 1
          END,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_workout_streak
AFTER INSERT ON workout_logs
FOR EACH ROW
WHEN (NEW.completed = true)
EXECUTE FUNCTION update_workout_streak();

-- Function: Update user total workouts
CREATE OR REPLACE FUNCTION update_user_workout_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET total_workouts = COALESCE(total_workouts, 0) + 1
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_user_workout_stats
AFTER INSERT ON workout_logs
FOR EACH ROW
WHEN (NEW.completed = true)
EXECUTE FUNCTION update_user_workout_stats();

-- ================================================================
-- SECTION 12: INSERT DEFAULT ACHIEVEMENTS
-- ================================================================

INSERT INTO achievements (code, name_it, name_en, description_it, description_en, icon, badge_color, category, requirement_type, requirement_value, requirement_unit, rarity, points, sort_order) VALUES
-- CONSISTENCY - Workout Count
('first_workout', 'Primo Passo', 'First Step', 'Completa il tuo primo workout', 'Complete your first workout', 'Dumbbell', 'emerald', 'consistency', 'count', 1, 'workouts', 'common', 10, 1),
('workout_10', 'In Movimento', 'Getting Moving', 'Completa 10 workout', 'Complete 10 workouts', 'Activity', 'emerald', 'consistency', 'count', 10, 'workouts', 'common', 25, 2),
('workout_25', 'Costante', 'Consistent', 'Completa 25 workout', 'Complete 25 workouts', 'Target', 'blue', 'consistency', 'count', 25, 'workouts', 'uncommon', 50, 3),
('workout_50', 'Dedicato', 'Dedicated', 'Completa 50 workout', 'Complete 50 workouts', 'Medal', 'blue', 'consistency', 'count', 50, 'workouts', 'uncommon', 100, 4),
('workout_100', 'Centurione', 'Centurion', 'Completa 100 workout', 'Complete 100 workouts', 'Trophy', 'purple', 'consistency', 'count', 100, 'workouts', 'rare', 200, 5),
('workout_250', 'Veterano', 'Veteran', 'Completa 250 workout', 'Complete 250 workouts', 'Award', 'purple', 'consistency', 'count', 250, 'workouts', 'epic', 400, 6),
('workout_500', 'Leggenda', 'Legend', 'Completa 500 workout', 'Complete 500 workouts', 'Crown', 'amber', 'consistency', 'count', 500, 'workouts', 'legendary', 1000, 7),

-- CONSISTENCY - Streak
('streak_3', 'Tre di Fila', 'Three in a Row', '3 giorni consecutivi', '3 consecutive days', 'Flame', 'orange', 'consistency', 'streak', 3, 'days', 'common', 15, 10),
('streak_7', 'Una Settimana', 'One Week', '7 giorni consecutivi', '7 consecutive days', 'Flame', 'orange', 'consistency', 'streak', 7, 'days', 'common', 30, 11),
('streak_14', 'Due Settimane', 'Two Weeks', '14 giorni consecutivi', '14 consecutive days', 'Flame', 'orange', 'consistency', 'streak', 14, 'days', 'uncommon', 60, 12),
('streak_30', 'Un Mese', 'One Month', '30 giorni consecutivi', '30 consecutive days', 'Flame', 'red', 'consistency', 'streak', 30, 'days', 'uncommon', 120, 13),
('streak_60', 'Due Mesi', 'Two Months', '60 giorni consecutivi', '60 consecutive days', 'Flame', 'red', 'consistency', 'streak', 60, 'days', 'rare', 250, 14),
('streak_100', 'Cento Giorni', 'Hundred Days', '100 giorni consecutivi', '100 consecutive days', 'Flame', 'purple', 'consistency', 'streak', 100, 'days', 'epic', 500, 15),
('streak_365', 'Un Anno', 'One Year', '365 giorni consecutivi', '365 consecutive days', 'Flame', 'amber', 'consistency', 'streak', 365, 'days', 'legendary', 2000, 16),

-- STRENGTH - Personal Records
('first_pr', 'Record!', 'Record!', 'Stabilisci il tuo primo PR', 'Set your first PR', 'TrendingUp', 'emerald', 'strength', 'count', 1, 'prs', 'common', 20, 20),
('pr_5', 'In Crescita', 'Growing', 'Stabilisci 5 PR', 'Set 5 PRs', 'TrendingUp', 'blue', 'strength', 'count', 5, 'prs', 'common', 40, 21),
('pr_10', 'Forte', 'Strong', 'Stabilisci 10 PR', 'Set 10 PRs', 'Zap', 'blue', 'strength', 'count', 10, 'prs', 'uncommon', 80, 22),
('pr_25', 'Potente', 'Powerful', 'Stabilisci 25 PR', 'Set 25 PRs', 'Zap', 'purple', 'strength', 'count', 25, 'prs', 'rare', 150, 23),
('pr_50', 'Inarrestabile', 'Unstoppable', 'Stabilisci 50 PR', 'Set 50 PRs', 'Rocket', 'amber', 'strength', 'count', 50, 'prs', 'epic', 300, 24),

-- VOLUME
('volume_1k', 'Primo Tonnellaggio', 'First Tonnage', 'Solleva 1,000 kg totali', 'Lift 1,000 kg total', 'BarChart', 'emerald', 'volume', 'value', 1000, 'kg', 'common', 15, 30),
('volume_10k', 'Dieci Tonnellate', 'Ten Tons', 'Solleva 10,000 kg totali', 'Lift 10,000 kg total', 'BarChart2', 'blue', 'volume', 'value', 10000, 'kg', 'common', 50, 31),
('volume_50k', 'Cinquanta Tonnellate', 'Fifty Tons', 'Solleva 50,000 kg totali', 'Lift 50,000 kg total', 'BarChart3', 'blue', 'volume', 'value', 50000, 'kg', 'uncommon', 100, 32),
('volume_100k', 'Cento Tonnellate', 'Hundred Tons', 'Solleva 100,000 kg totali', 'Lift 100,000 kg total', 'BarChart3', 'purple', 'volume', 'value', 100000, 'kg', 'rare', 200, 33),
('volume_500k', 'Mezzo Milione', 'Half Million', 'Solleva 500,000 kg totali', 'Lift 500,000 kg total', 'Mountain', 'purple', 'volume', 'value', 500000, 'kg', 'epic', 500, 34),
('volume_1m', 'Un Milione', 'One Million', 'Solleva 1,000,000 kg totali', 'Lift 1,000,000 kg total', 'Mountain', 'amber', 'volume', 'value', 1000000, 'kg', 'legendary', 1500, 35),

-- MILESTONE - Special
('early_bird', 'Mattiniero', 'Early Bird', 'Allenati prima delle 6:00', 'Workout before 6:00 AM', 'Sun', 'yellow', 'milestone', 'time', 6, 'hour', 'uncommon', 30, 40),
('night_owl', 'Nottambulo', 'Night Owl', 'Allenati dopo le 22:00', 'Workout after 10:00 PM', 'Moon', 'indigo', 'milestone', 'time', 22, 'hour', 'uncommon', 30, 41),
('weekend_warrior', 'Guerriero del Weekend', 'Weekend Warrior', 'Allenati sia sabato che domenica', 'Workout both Saturday and Sunday', 'Swords', 'orange', 'milestone', 'count', 2, 'weekend_days', 'common', 25, 42),
('perfect_week', 'Settimana Perfetta', 'Perfect Week', 'Completa tutti gli allenamenti programmati in una settimana', 'Complete all scheduled workouts in a week', 'CheckCircle', 'emerald', 'milestone', 'count', 1, 'perfect_weeks', 'uncommon', 50, 43),
('comeback', 'Ritorno', 'Comeback', 'Torna ad allenarti dopo 30+ giorni di pausa', 'Return to training after 30+ days break', 'RefreshCw', 'blue', 'special', 'count', 1, 'comebacks', 'rare', 75, 44)

ON CONFLICT (code) DO UPDATE SET
  name_it = EXCLUDED.name_it,
  name_en = EXCLUDED.name_en,
  description_it = EXCLUDED.description_it,
  description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon,
  badge_color = EXCLUDED.badge_color,
  category = EXCLUDED.category,
  requirement_type = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value,
  requirement_unit = EXCLUDED.requirement_unit,
  rarity = EXCLUDED.rarity,
  points = EXCLUDED.points,
  sort_order = EXCLUDED.sort_order;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
