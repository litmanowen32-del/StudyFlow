-- Create table for storing Google OAuth tokens
CREATE TABLE public.google_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tokens"
ON public.google_oauth_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
ON public.google_oauth_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
ON public.google_oauth_tokens
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
ON public.google_oauth_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_google_oauth_tokens_updated_at
BEFORE UPDATE ON public.google_oauth_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add google_classroom_id to tasks table to track synced assignments
ALTER TABLE public.tasks
ADD COLUMN google_classroom_id TEXT,
ADD COLUMN google_course_id TEXT;