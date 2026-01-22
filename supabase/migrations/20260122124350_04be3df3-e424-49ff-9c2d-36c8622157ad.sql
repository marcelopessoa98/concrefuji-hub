-- Tighten permissive RLS policies (replace WITH CHECK true / USING true with is_authenticated())

-- overtime_entries
DROP POLICY IF EXISTS "Authenticated users can insert overtime_entries" ON public.overtime_entries;
CREATE POLICY "Authenticated users can insert overtime_entries"
ON public.overtime_entries
FOR INSERT
WITH CHECK (is_authenticated());

-- overtime_records
DROP POLICY IF EXISTS "Authenticated users can insert overtime_records" ON public.overtime_records;
CREATE POLICY "Authenticated users can insert overtime_records"
ON public.overtime_records
FOR INSERT
WITH CHECK (is_authenticated());

-- notifications
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (is_authenticated());

DROP POLICY IF EXISTS "Authenticated users can update notifications" ON public.notifications;
CREATE POLICY "Authenticated users can update notifications"
ON public.notifications
FOR UPDATE
USING (is_authenticated());
