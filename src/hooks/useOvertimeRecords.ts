import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OvertimeEntry {
  id: string;
  overtime_record_id: string;
  date: string;
  project_id: string | null;
  project_name: string;
  start_time: string;
  end_time: string;
  type: string;
  observation: string | null;
  created_at: string;
}

export interface OvertimeRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  month: string;
  year: string;
  created_at: string;
  entries?: OvertimeEntry[];
}

export interface OvertimeRecordInput {
  employee_id: string;
  employee_name: string;
  month: string;
  year: string;
  entries: {
    date: string;
    project_id: string | null;
    project_name: string;
    start_time: string;
    end_time: string;
    type: string;
    observation: string | null;
  }[];
}

export function useOvertimeRecords() {
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ['overtime_records'],
    queryFn: async () => {
      const { data: recordsData, error: recordsError } = await supabase
        .from('overtime_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Fetch entries for each record
      const recordsWithEntries = await Promise.all(
        (recordsData as OvertimeRecord[]).map(async (record) => {
          const { data: entries, error: entriesError } = await supabase
            .from('overtime_entries')
            .select('*')
            .eq('overtime_record_id', record.id);

          if (entriesError) throw entriesError;

          return {
            ...record,
            entries: entries as OvertimeEntry[],
          };
        })
      );

      return recordsWithEntries;
    },
  });

  const addOvertimeRecord = useMutation({
    mutationFn: async (input: OvertimeRecordInput) => {
      // Insert the record
      const { data: record, error: recordError } = await supabase
        .from('overtime_records')
        .insert([{
          employee_id: input.employee_id,
          employee_name: input.employee_name,
          month: input.month,
          year: input.year,
        }])
        .select()
        .single();

      if (recordError) throw recordError;

      // Insert entries
      const entriesWithRecordId = input.entries.map(entry => ({
        ...entry,
        overtime_record_id: record.id,
      }));

      const { error: entriesError } = await supabase
        .from('overtime_entries')
        .insert(entriesWithRecordId);

      if (entriesError) throw entriesError;

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime_records'] });
      toast.success('Horas extras registradas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar horas extras: ' + error.message);
    },
  });

  const deleteOvertimeRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('overtime_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime_records'] });
      toast.success('Registro de horas extras removido!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover registro: ' + error.message);
    },
  });

  return {
    records,
    isLoading,
    error,
    addOvertimeRecord,
    deleteOvertimeRecord,
  };
}
