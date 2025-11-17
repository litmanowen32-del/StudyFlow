-- Add sleep time preferences to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN sleep_start_time time without time zone DEFAULT '23:00:00',
ADD COLUMN sleep_end_time time without time zone DEFAULT '07:00:00';