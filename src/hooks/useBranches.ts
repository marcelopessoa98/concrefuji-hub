import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Branch {
  id: string;
  name: string;
  city: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface BranchInput {
  name: string;
  city: string;
  state: string;
}

export function useBranches() {
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Branch[];
    },
  });

  const addBranch = useMutation({
    mutationFn: async (branch: BranchInput) => {
      const { data, error } = await supabase
        .from('branches')
        .insert([branch])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Sede adicionada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar sede: ' + error.message);
    },
  });

  const updateBranch = useMutation({
    mutationFn: async ({ id, ...branch }: Partial<BranchInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('branches')
        .update(branch)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Sede atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar sede: ' + error.message);
    },
  });

  const deleteBranch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Sede removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover sede: ' + error.message);
    },
  });

  return {
    branches,
    isLoading,
    error,
    addBranch,
    updateBranch,
    deleteBranch,
  };
}
