-- Add São Luís / lunch support to overtime entries
ALTER TABLE public.overtime_entries
ADD COLUMN IF NOT EXISTS start_time_2 text NULL,
ADD COLUMN IF NOT EXISTS end_time_2 text NULL,
ADD COLUMN IF NOT EXISTS lunch_worked boolean NOT NULL DEFAULT false;

-- Helpful index for filtering/reporting
CREATE INDEX IF NOT EXISTS idx_overtime_entries_date ON public.overtime_entries(date);
