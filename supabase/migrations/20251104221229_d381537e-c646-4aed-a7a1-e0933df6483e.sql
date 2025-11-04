-- Add calendar_view field to calendar_events to differentiate between hourly and monthly views
ALTER TABLE calendar_events ADD COLUMN calendar_view TEXT NOT NULL DEFAULT 'both' CHECK (calendar_view IN ('hourly', 'monthly', 'both'));

-- Add index for better performance
CREATE INDEX idx_calendar_events_view ON calendar_events(calendar_view);

-- Add recurring event support for multiple days
ALTER TABLE calendar_events ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE calendar_events ADD COLUMN recurring_days INTEGER[] DEFAULT NULL;