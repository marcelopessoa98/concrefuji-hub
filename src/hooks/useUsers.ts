import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const rolesMap = new Map(roles.map(r => [r.user_id, r.role]));

      return profiles.map(p => ({
        id: p.id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        role: rolesMap.get(p.id) || 'user',
        createdAt: p.created_at,
      })) as User[];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
      role: 'admin' | 'user' 
    }) => {
      // Use Edge Function to create user as admin
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: userData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar usuário: ' + error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ 
      id, 
      firstName, 
      lastName, 
      role 
    }: { 
      id: string; 
      firstName: string; 
      lastName: string; 
      role: 'admin' | 'user';
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          first_name: firstName, 
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', id);

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar usuário: ' + error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir usuário: ' + error.message);
    },
  });

  return {
    users,
    isLoading,
    error,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}
