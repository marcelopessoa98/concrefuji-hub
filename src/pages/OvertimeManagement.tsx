import { useState, useMemo } from 'react';
import { Edit2, Trash2, Save, X, Clock, Building2, Filter } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
import { useOvertimeRecords, OvertimeEntry } from '@/hooks/useOvertimeRecords';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { calculateOvertimeHours, formatOvertimeMinutes, getDayOfWeekName } from '@/lib/overtime';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OvertimeManagement = () => {
  const { employees } = useEmployees();
  const { projects } = useProjects();
  const { records, isLoading, updateOvertimeEntry, deleteOvertimeEntry, deleteOvertimeRecord } = useOvertimeRecords();

  // Filter state
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  // Edit state
  const [editingEntry, setEditingEntry] = useState<OvertimeEntry | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    project_id: '',
    project_name: '',
    start_time: '',
    end_time: '',
    type: 'remunerada',
    observation: '',
  });

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  const projectOptions = useMemo(() => {
    return projects.map((project) => ({
      value: project.id,
      label: project.name,
      sublabel: project.client_name,
    }));
  }, [projects]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (filterEmployee !== 'all' && record.employee_id !== filterEmployee) return false;
      if (filterMonth !== 'all' && record.month !== filterMonth) return false;
      if (filterYear !== 'all' && record.year !== filterYear) return false;
      return true;
    });
  }, [records, filterEmployee, filterMonth, filterYear]);

  // Flatten entries with record info
  const allEntries = useMemo(() => {
    return filteredRecords.flatMap((record) =>
      (record.entries || []).map((entry) => ({
        ...entry,
        employee_name: record.employee_name,
        record_month: record.month,
        record_year: record.year,
      }))
    ).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredRecords]);

  const startEdit = (entry: OvertimeEntry) => {
    setEditingEntry(entry);
    setEditForm({
      date: entry.date,
      project_id: entry.project_id || '',
      project_name: entry.project_name,
      start_time: entry.start_time,
      end_time: entry.end_time,
      type: entry.type,
      observation: entry.observation || '',
    });
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditForm({
      date: '',
      project_id: '',
      project_name: '',
      start_time: '',
      end_time: '',
      type: 'remunerada',
      observation: '',
    });
  };

  const saveEdit = () => {
    if (!editingEntry) return;

    const project = projects.find((p) => p.id === editForm.project_id);

    updateOvertimeEntry.mutate({
      id: editingEntry.id,
      date: editForm.date,
      project_id: editForm.project_id || null,
      project_name: project?.name || editForm.project_name,
      start_time: editForm.start_time,
      end_time: editForm.end_time,
      type: editForm.type,
      observation: editForm.observation || null,
    });

    cancelEdit();
  };

  const handleDeleteEntry = (id: string) => {
    deleteOvertimeEntry.mutate(id);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy (EEEE)", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getOvertimeDisplay = (date: string, start: string, end: string) => {
    const minutes = calculateOvertimeHours(date, start, end);
    return formatOvertimeMinutes(minutes);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Gerenciar Lançamentos</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e edite os lançamentos de horas extras
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Funcionário</Label>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>HE</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum lançamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  allEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      {editingEntry?.id === entry.id ? (
                        <>
                          <TableCell className="font-medium">{entry.employee_name}</TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="w-36"
                            />
                          </TableCell>
                          <TableCell>
                            <Combobox
                              options={projectOptions}
                              value={editForm.project_id}
                              onValueChange={(value) => setEditForm({ ...editForm, project_id: value })}
                              placeholder="Selecione..."
                              className="w-48"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={editForm.start_time}
                              onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={editForm.end_time}
                              onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editForm.type}
                              onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="remunerada">Remunerada</SelectItem>
                                <SelectItem value="banco_de_horas">Banco de Horas</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            {getOvertimeDisplay(editForm.date, editForm.start_time, editForm.end_time)}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.observation}
                              onChange={(e) => setEditForm({ ...editForm, observation: e.target.value })}
                              placeholder="Observação"
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={saveEdit}
                                disabled={updateOvertimeEntry.isPending}
                              >
                                <Save className="w-4 h-4 text-primary" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={cancelEdit}>
                                <X className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{entry.employee_name}</TableCell>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>{entry.project_name}</TableCell>
                          <TableCell>{entry.start_time}</TableCell>
                          <TableCell>{entry.end_time}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.type === 'remunerada' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-accent/10 text-accent-foreground'
                            }`}>
                              {entry.type === 'remunerada' ? 'Remunerada' : 'Banco de Horas'}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            {getOvertimeDisplay(entry.date, entry.start_time, entry.end_time)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                            {entry.observation || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEdit(entry)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. O lançamento será removido permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Summary */}
        {allEntries.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-muted-foreground">
              Exibindo <span className="font-semibold text-foreground">{allEntries.length}</span> lançamento(s)
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OvertimeManagement;
