-- Add study buddy preferences to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS study_buddy_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS study_buddy_xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_buddy_type text DEFAULT 'cat',
ADD COLUMN IF NOT EXISTS study_buddy_hunger integer DEFAULT 100;