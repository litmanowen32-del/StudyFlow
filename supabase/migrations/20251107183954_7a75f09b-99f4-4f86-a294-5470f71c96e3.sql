-- Add onboarding fields to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS study_goal_hours_per_week integer,
ADD COLUMN IF NOT EXISTS school_level text CHECK (school_level IN ('middle_school', 'high_school')),
ADD COLUMN IF NOT EXISTS study_preference text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;