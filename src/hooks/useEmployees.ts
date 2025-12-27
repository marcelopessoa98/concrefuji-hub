import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  admission_date: string;
  birth_date: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeInput {
  name: string;
  role: string;
  department: string;
  admission_date: string;
  birth_date?: string | null;
  photo_url?: string | null;
}

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Employee[];
    },
  });

  const addEmployee = useMutation({
    mutationFn: async (employee: EmployeeInput) => {
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário adicionado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar funcionário: ' + error.message);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...employee }: Partial<EmployeeInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar funcionário: ' + error.message);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover funcionário: ' + error.message);
    },
  });

  const getBirthdaysThisMonth = () => {
    const currentMonth = new Date().getMonth() + 1;
    return employees.filter((emp) => {
      if (!emp.birth_date) return false;
      const birthMonth = parseInt(emp.birth_date.split('-')[1], 10);
      return birthMonth === currentMonth;
    });
  };

  return {
    employees,
    isLoading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getBirthdaysThisMonth,
  };
}
