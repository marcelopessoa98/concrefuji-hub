import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyClient {
  id: string;
  name: string;
  contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyClientInput {
  name: string;
  contact?: string | null;
}

export function useCompanyClients() {
  const queryClient = useQueryClient();

  const { data: companyClients = [], isLoading, error } = useQuery({
    queryKey: ['company_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_clients')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as CompanyClient[];
    },
  });

  const addCompanyClient = useMutation({
    mutationFn: async (client: CompanyClientInput) => {
      const { data, error } = await supabase
        .from('company_clients')
        .insert([client])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_clients'] });
      toast.success('Cliente adicionado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar cliente: ' + error.message);
    },
  });

  const updateCompanyClient = useMutation({
    mutationFn: async ({ id, ...client }: Partial<CompanyClientInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('company_clients')
        .update(client)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_clients'] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar cliente: ' + error.message);
    },
  });

  const deleteCompanyClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Cliente removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover cliente: ' + error.message);
    },
  });

  return {
    companyClients,
    isLoading,
    error,
    addCompanyClient,
    updateCompanyClient,
    deleteCompanyClient,
  };
}
