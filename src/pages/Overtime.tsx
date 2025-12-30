import { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Clock, User, Building2 } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
import { useOvertimeRecords } from '@/hooks/useOvertimeRecords';
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
import { calculateOvertimeHours, formatOvertimeMinutes, getDayOfWeekName } from '@/lib/overtime';
import { toast } from 'sonner';

interface OvertimeFormEntry {
  id: string;
  date: string;
  projectId: string;
  startTime: string;
  endTime: string;
  type: 'remunerada' | 'banco_de_horas';
  observation: string;
}

const Overtime = () => {
  const { employees } = useEmployees();
  const { projects } = useProjects();
  const { addOvertimeRecord } = useOvertimeRecords();
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [entries, setEntries] = useState<OvertimeFormEntry[]>([
    {
      id: Date.now().toString(),
      date: '',
      projectId: '',
      startTime: '',
      endTime: '',
      type: 'remunerada',
      observation: '',
    },
  ]);

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

  // Prepare project options for combobox
  const projectOptions = useMemo(() => {
    return projects.map((project) => ({
      value: project.id,
      label: project.name,
      sublabel: project.client_name,
    }));
  }, [projects]);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now().toString(),
        date: '',
        projectId: '',
        startTime: '',
        endTime: '',
        type: 'remunerada',
        observation: '',
      },
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length === 1) {
      toast.error('Deve haver pelo menos uma entrada');
      return;
    }
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof OvertimeFormEntry, value: string) => {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const calculateTotalOvertimeHours = (date: string, start: string, end: string) => {
    if (!date || !start || !end) return '0h 0m';
    const overtimeMinutes = calculateOvertimeHours(date, start, end);
    return formatOvertimeMinutes(overtimeMinutes);
  };

  const getEntryDayInfo = (date: string) => {
    if (!date) return '';
    return getDayOfWeekName(date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedMonth || !selectedYear) {
      toast.error('Preencha o funcionário, mês e ano');
      return;
    }

    const invalidEntries = entries.filter(
      (entry) => !entry.date || !entry.projectId || !entry.startTime || !entry.endTime
    );

    if (invalidEntries.length > 0) {
      toast.error('Preencha todos os campos obrigatórios das entradas');
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployee);
    if (!employee) return;

    const formattedEntries = entries.map((entry) => {
      const project = projects.find((p) => p.id === entry.projectId);
      return {
        date: entry.date,
        project_id: entry.projectId,
        project_name: project?.name || '',
        start_time: entry.startTime,
        end_time: entry.endTime,
        type: entry.type,
        observation: entry.observation || null,
      };
    });

    addOvertimeRecord.mutate({
      employee_id: selectedEmployee,
      employee_name: employee.name,
      month: selectedMonth,
      year: selectedYear,
      entries: formattedEntries,
    });
    
    // Reset form
    setSelectedEmployee('');
    setSelectedMonth('');
    setEntries([
      {
        id: Date.now().toString(),
        date: '',
        projectId: '',
        startTime: '',
        endTime: '',
        type: 'remunerada',
        observation: '',
      },
    ]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Registro de Horas Extras</h1>
          <p className="text-muted-foreground mt-1">
            Registre as horas extras dos funcionários
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee and Period Selection */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Funcionário *
                </Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mês *</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano *</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
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

          {/* Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-foreground">
                Lançamentos de Horas Extras
              </h2>
              <Button type="button" variant="outline" onClick={addEntry}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lançamento
              </Button>
            </div>

            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-card rounded-xl border border-border p-6 animate-slide-up"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Lançamento #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Local (Obra) *
                    </Label>
                    <Combobox
                      options={projectOptions}
                      value={entry.projectId}
                      onValueChange={(value) => updateEntry(entry.id, 'projectId', value)}
                      placeholder="Digite para buscar..."
                      searchPlaceholder="Buscar obra..."
                      emptyText="Nenhuma obra encontrada."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Hora *</Label>
                    <Select
                      value={entry.type}
                      onValueChange={(value) => updateEntry(entry.id, 'type', value as 'remunerada' | 'banco_de_horas')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remunerada">Remunerada</SelectItem>
                        <SelectItem value="banco_de_horas">Banco de Horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dia da Semana</Label>
                    <div className="h-10 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground font-medium flex items-center">
                      {getEntryDayInfo(entry.date) || '-'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Hora de Entrada *
                    </Label>
                    <Input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Hora de Saída *
                    </Label>
                    <Input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Hora Extra</Label>
                    <div className="h-10 px-3 py-2 rounded-lg bg-primary/10 text-primary font-bold flex items-center">
                      {calculateTotalOvertimeHours(entry.date, entry.startTime, entry.endTime)}
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                    <Label>Observação</Label>
                    <Textarea
                      value={entry.observation}
                      onChange={(e) => updateEntry(entry.id, 'observation', e.target.value)}
                      placeholder="Digite alguma observação (opcional)"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" variant="accent" size="lg" disabled={addOvertimeRecord.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {addOvertimeRecord.isPending ? 'Salvando...' : 'Salvar Horas Extras'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Overtime;
