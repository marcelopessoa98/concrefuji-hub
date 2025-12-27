import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Client {
  id: string;
  client_name: string;
  project_name: string;
  address: string | null;
  contact: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  client_name: string;
  project_name: string;
  address?: string | null;
  contact?: string | null;
  status?: string;
}

export function useClients() {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('project_name');

      if (error) throw error;
      return data as Client[];
    },
  });

  const addClient = useMutation({
    mutationFn: async (client: ClientInput) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Obra adicionada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar obra: ' + error.message);
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...client }: Partial<ClientInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Obra atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar obra: ' + error.message);
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Obra removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover obra: ' + error.message);
    },
  });

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
  };
}
