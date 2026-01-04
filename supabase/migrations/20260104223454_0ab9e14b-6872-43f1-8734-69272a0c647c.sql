-- Drop existing restrictive policies and create permissive ones for overtime_records
DROP POLICY IF EXISTS "Authenticated users can view overtime_records" ON public.overtime_records;
DROP POLICY IF EXISTS "Authenticated users can insert overtime_records" ON public.overtime_records;
DROP POLICY IF EXISTS "Admins can update overtime_records" ON public.overtime_records;
DROP POLICY IF EXISTS "Admins can delete overtime_records" ON public.overtime_records;

CREATE POLICY "Authenticated users can view overtime_records" 
ON public.overtime_records 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert overtime_records" 
ON public.overtime_records 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update overtime_records" 
ON public.overtime_records 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete overtime_records" 
ON public.overtime_records 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing restrictive policies and create permissive ones for overtime_entries
DROP POLICY IF EXISTS "Authenticated users can view overtime_entries" ON public.overtime_entries;
DROP POLICY IF EXISTS "Authenticated users can insert overtime_entries" ON public.overtime_entries;
DROP POLICY IF EXISTS "Admins can update overtime_entries" ON public.overtime_entries;
DROP POLICY IF EXISTS "Admins can delete overtime_entries" ON public.overtime_entries;

CREATE POLICY "Authenticated users can view overtime_entries" 
ON public.overtime_entries 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert overtime_entries" 
ON public.overtime_entries 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update overtime_entries" 
ON public.overtime_entries 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete overtime_entries" 
ON public.overtime_entries 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));