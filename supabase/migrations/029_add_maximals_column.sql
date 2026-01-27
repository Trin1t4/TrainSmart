-- Add maximals column to user_profiles
-- Stores user's maximal lift data from OptionalQuizzes
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS maximals JSONB;
