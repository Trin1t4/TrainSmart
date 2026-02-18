-- ============================================================================
-- MESOCYCLE TRACKING
-- ============================================================================
-- Adds mesocycle tracking to volume_profiles for inter-mesocycle progression.
--
-- Context:
-- - Muscles adapt in 6-8 weeks
-- - Tendons/ligaments need 12-16 weeks
-- - Bone remodeling takes 16-20 weeks
-- 
-- Progressive volume loading requires tracking mesocycle number to:
-- 1. Cap volume at MAV for first 3 mesocycles (tissue adaptation)
-- 2. Allow MAV-MRV exploration after 3+ mesocycles
-- 3. Base progression on previous mesocycle RPE and recovery
--
-- Author: Dario (TrainSmart)
-- Date: 2026-02-18
-- ============================================================================

-- Add mesocycle tracking columns
ALTER TABLE volume_profiles
ADD COLUMN IF NOT EXISTS mesocycle_number INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS mesocycle_start_date TIMESTAMPTZ DEFAULT NOW();

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_volume_profiles_mesocycle 
ON volume_profiles(user_id, mesocycle_number);

-- Update existing records to mesocycle 1
UPDATE volume_profiles
SET mesocycle_number = 1,
    mesocycle_start_date = created_at
WHERE mesocycle_number IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN volume_profiles.mesocycle_number IS 
  'Current mesocycle number (1-based). Used for progressive volume loading: mesocycles 1-3 capped at MAV, 4+ can explore MAV-MRV range.';

COMMENT ON COLUMN volume_profiles.mesocycle_start_date IS
  'Start date of current mesocycle. Used to track mesocycle duration and reset timing.';
