-- =====================================================
-- RECOVERY TRACKING TABLE
-- Stores daily recovery screening data (sleep, stress, pain)
-- =====================================================

-- Create the recovery_tracking table
CREATE TABLE IF NOT EXISTS recovery_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Screening date
    screening_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Sleep quality (1-10)
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),

    -- Stress level (1-10)
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),

    -- Energy level (1-10)
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),

    -- Muscle soreness (1-10, where 1 = no soreness, 10 = very sore)
    muscle_soreness INTEGER CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10),

    -- Pain areas (array of body parts with pain)
    pain_areas JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"area": "lower_back", "intensity": 7}, {"area": "knee", "intensity": 4}]

    -- Menstrual cycle phase (optional, for female athletes)
    menstrual_phase TEXT CHECK (menstrual_phase IN ('follicular', 'ovulation', 'luteal', 'menstrual', 'menopausal', NULL)),

    -- General notes
    notes TEXT,

    -- Calculated adjustment factor (0.5 to 1.2)
    -- < 1.0 = reduce intensity, > 1.0 = can increase
    volume_adjustment DECIMAL(3,2) DEFAULT 1.0 CHECK (volume_adjustment >= 0.3 AND volume_adjustment <= 1.5),
    intensity_adjustment DECIMAL(3,2) DEFAULT 1.0 CHECK (intensity_adjustment >= 0.3 AND intensity_adjustment <= 1.5),

    -- Whether user completed workout after screening
    workout_completed BOOLEAN DEFAULT FALSE,
    workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint for one screening per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_recovery_user_date
ON recovery_tracking(user_id, screening_date);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_recovery_user_id ON recovery_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_date ON recovery_tracking(screening_date DESC);

-- Enable RLS
ALTER TABLE recovery_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recovery data"
ON recovery_tracking FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery data"
ON recovery_tracking FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery data"
ON recovery_tracking FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery data"
ON recovery_tracking FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to calculate adjustments based on screening
CREATE OR REPLACE FUNCTION calculate_recovery_adjustments()
RETURNS TRIGGER AS $$
DECLARE
    base_adjustment DECIMAL(3,2) := 1.0;
    sleep_factor DECIMAL(3,2);
    stress_factor DECIMAL(3,2);
    soreness_factor DECIMAL(3,2);
    pain_factor DECIMAL(3,2);
    cycle_factor DECIMAL(3,2) := 1.0;
BEGIN
    -- Sleep factor (7-9 hours optimal)
    IF NEW.sleep_hours IS NOT NULL THEN
        IF NEW.sleep_hours < 5 THEN
            sleep_factor := 0.7;
        ELSIF NEW.sleep_hours < 6 THEN
            sleep_factor := 0.85;
        ELSIF NEW.sleep_hours < 7 THEN
            sleep_factor := 0.95;
        ELSIF NEW.sleep_hours <= 9 THEN
            sleep_factor := 1.0;
        ELSE
            sleep_factor := 0.95; -- Too much sleep can also be suboptimal
        END IF;
    ELSE
        -- Use sleep quality if hours not provided
        sleep_factor := COALESCE(NEW.sleep_quality, 7) / 10.0 * 0.4 + 0.6;
    END IF;

    -- Stress factor (lower is better)
    stress_factor := 1.0 - (COALESCE(NEW.stress_level, 5) - 1) * 0.05;

    -- Soreness factor (lower is better)
    soreness_factor := 1.0 - (COALESCE(NEW.muscle_soreness, 3) - 1) * 0.06;

    -- Pain factor (based on pain areas count and intensity)
    IF NEW.pain_areas IS NOT NULL AND jsonb_array_length(NEW.pain_areas) > 0 THEN
        pain_factor := GREATEST(0.5, 1.0 - jsonb_array_length(NEW.pain_areas) * 0.1);
    ELSE
        pain_factor := 1.0;
    END IF;

    -- Menstrual cycle factor (evidence-based adjustments)
    IF NEW.menstrual_phase IS NOT NULL THEN
        CASE NEW.menstrual_phase
            WHEN 'follicular' THEN cycle_factor := 1.05; -- Higher capacity
            WHEN 'ovulation' THEN cycle_factor := 1.1;   -- Peak performance
            WHEN 'luteal' THEN cycle_factor := 0.95;     -- Slightly reduced
            WHEN 'menstrual' THEN cycle_factor := 0.85;  -- Reduced capacity
            WHEN 'menopausal' THEN cycle_factor := 0.95; -- Individual variation
            ELSE cycle_factor := 1.0;
        END CASE;
    END IF;

    -- Calculate final adjustments
    NEW.volume_adjustment := LEAST(1.2, GREATEST(0.5,
        base_adjustment * sleep_factor * stress_factor * soreness_factor * pain_factor * cycle_factor
    ));

    -- Intensity adjustment (slightly less aggressive)
    NEW.intensity_adjustment := LEAST(1.1, GREATEST(0.6,
        base_adjustment * sleep_factor * stress_factor * pain_factor * cycle_factor
    ));

    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate adjustments
DROP TRIGGER IF EXISTS calculate_recovery_on_insert ON recovery_tracking;
CREATE TRIGGER calculate_recovery_on_insert
BEFORE INSERT OR UPDATE ON recovery_tracking
FOR EACH ROW
EXECUTE FUNCTION calculate_recovery_adjustments();

-- Grant permissions
GRANT ALL ON recovery_tracking TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE recovery_tracking IS 'Daily recovery screening data for adaptive training intensity';
COMMENT ON COLUMN recovery_tracking.volume_adjustment IS 'Calculated multiplier for training volume (0.5-1.2)';
COMMENT ON COLUMN recovery_tracking.intensity_adjustment IS 'Calculated multiplier for training intensity (0.6-1.1)';
