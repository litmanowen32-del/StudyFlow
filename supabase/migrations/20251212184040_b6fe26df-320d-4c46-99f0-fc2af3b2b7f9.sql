-- Add optional feature columns to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS calculator_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS research_finder_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS study_assistant_enabled boolean DEFAULT false;