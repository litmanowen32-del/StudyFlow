-- Add article_summarizer_enabled column to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN article_summarizer_enabled boolean DEFAULT false;