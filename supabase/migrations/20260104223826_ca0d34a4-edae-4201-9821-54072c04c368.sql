-- Drop the old foreign key constraint pointing to clients
ALTER TABLE public.overtime_entries 
DROP CONSTRAINT IF EXISTS overtime_entries_project_id_fkey;

-- Add new foreign key constraint pointing to projects
ALTER TABLE public.overtime_entries 
ADD CONSTRAINT overtime_entries_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;