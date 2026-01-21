import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Project {
  id: string;
  client_id: string;
  name: string;
  address: string | null;
  status: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  branch_name?: string;
}

export interface ProjectInput {
  client_id: string;
  name: string;
  address?: string | null;
  status?: string;
  branch_id: string;
}

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          company_clients (
            name
          ),
          branches (
            name
          )
        `)
        .order('name');

      if (error) throw error;
      
      return data.map((project: any) => ({
        ...project,
        client_name: project.company_clients?.name || '',
        branch_name: project.branches?.name || '',
      })) as Project[];
    },
  });

  const addProject = useMutation({
    mutationFn: async (project: ProjectInput) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Obra adicionada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar obra: ' + error.message);
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...project }: Partial<ProjectInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Obra atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar obra: ' + error.message);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Obra removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover obra: ' + error.message);
    },
  });

  const getProjectsByBranch = (branchId: string) => {
    return projects.filter((project) => project.branch_id === branchId);
  };

  return {
    projects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByBranch,
  };
}
