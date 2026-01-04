import { useState, useRef } from 'react';
import { FileText, Download, Printer, User, Building2 } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
import { useOvertimeRecords } from '@/hooks/useOvertimeRecords';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const Reports = () => {
  const { employees } = useEmployees();
  const { projects } = useProjects();
  const { records: overtimeRecords } = useOvertimeRecords();
  const [activeTab, setActiveTab] = useState('employee');
  
  // Employee Report
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeMonth, setEmployeeMonth] = useState('');
  const [employeeYear, setEmployeeYear] = useState(new Date().getFullYear().toString());
  const [employeeReport, setEmployeeReport] = useState<any>(null);

  // Project Report
  const [selectedProject, setSelectedProject] = useState('');
  const [projectMonth, setProjectMonth] = useState('');
  const [projectYear, setProjectYear] = useState(new Date().getFullYear().toString());
  const [projectReport, setProjectReport] = useState<any>(null);

  const employeeReportRef = useRef<HTMLDivElement>(null);
  const projectReportRef = useRef<HTMLDivElement>(null);

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

  const getDayName = (dateString: string) => {
    const dayIndex = getDay(parseISO(dateString));
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayIndex];
  };

  const calculateHours = (start: string, end: string) => {
    const startDate = new Date(`2024-01-01T${start}`);
    const endDate = new Date(`2024-01-01T${end}`);
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const generateEmployeeReport = () => {
    if (!selectedEmployee || !employeeMonth || !employeeYear) {
      toast.error('Selecione o funcionário, mês e ano');
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployee);
    if (!employee) return;

    const records = overtimeRecords.filter(
      (r) => r.employee_id === selectedEmployee && r.month === employeeMonth && r.year === employeeYear
    );

    const allEntries = records.flatMap((r) => r.entries || []);
    const sortedEntries = allEntries.sort((a, b) => a.date.localeCompare(b.date));

    const totalHours = sortedEntries.reduce((sum, entry) => {
      return sum + calculateHours(entry.start_time, entry.end_time);
    }, 0);

    setEmployeeReport({
      employee,
      month: months.find((m) => m.value === employeeMonth)?.label,
      year: employeeYear,
      entries: sortedEntries,
      totalHours,
    });
  };

  const generateProjectReport = () => {
    if (!selectedProject || !projectMonth || !projectYear) {
      toast.error('Selecione a obra, mês e ano');
      return;
    }

    const project = projects.find((p) => p.id === selectedProject);
    if (!project) return;

    const allEntries = overtimeRecords.flatMap((r) => 
      (r.entries || []).filter((e) => e.project_id === selectedProject)
    );

    const filteredEntries = allEntries.filter((entry) => {
      const entryMonth = entry.date.split('-')[1];
      const entryYear = entry.date.split('-')[0];
      return entryMonth === projectMonth && entryYear === projectYear;
    });

    const sortedEntries = filteredEntries.sort((a, b) => a.date.localeCompare(b.date));

    const totalHours = sortedEntries.reduce((sum, entry) => {
      return sum + calculateHours(entry.start_time, entry.end_time);
    }, 0);

    setProjectReport({
      project,
      month: months.find((m) => m.value === projectMonth)?.label,
      year: projectYear,
      entries: sortedEntries,
      totalHours,
    });
  };

  const handlePrint = (ref: React.RefObject<HTMLDivElement>, forPdf: boolean = false) => {
    if (ref.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const content = ref.current.innerHTML;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Relatório CONCREFUJI</title>
              <meta charset="UTF-8">
              <style>
                * { box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 40px; 
                  margin: 0;
                  color: #1a1a1a;
                  line-height: 1.5;
                }
                .header { margin-bottom: 30px; }
                .header h2 { 
                  color: #1e40af; 
                  margin-bottom: 15px; 
                  font-size: 24px;
                  border-bottom: 2px solid #1e40af;
                  padding-bottom: 10px;
                }
                .header p { margin: 5px 0; font-size: 14px; }
                .header strong { color: #374151; }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 25px;
                  font-size: 12px;
                }
                th { 
                  background-color: #1e40af !important; 
                  color: white !important; 
                  padding: 12px 8px; 
                  text-align: left;
                  font-weight: 600;
                }
                td { 
                  border: 1px solid #d1d5db; 
                  padding: 10px 8px; 
                }
                tr:nth-child(even) { background-color: #f3f4f6 !important; }
                .total-section {
                  margin-top: 25px;
                  padding-top: 15px;
                  border-top: 2px solid #1e40af;
                }
                .total-section p {
                  font-size: 18px;
                  font-weight: bold;
                  color: #1e40af;
                }
                @media print { 
                  body { 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important;
                  }
                  @page { margin: 20mm; }
                }
              </style>
            </head>
            <body>
              ${content.replace('mt-6 pt-4 border-t border-border', 'total-section')}
              <script>
                window.onload = function() {
                  ${forPdf ? 'setTimeout(function() { window.print(); }, 100);' : 'window.print();'}
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Gere relatórios de horas extras por funcionário ou obra
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Por Funcionário
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Por Obra
            </TabsTrigger>
          </TabsList>

          {/* Employee Report */}
          <TabsContent value="employee" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Funcionário *</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                  <Select value={employeeMonth} onValueChange={setEmployeeMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                  <Select value={employeeYear} onValueChange={setEmployeeYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                <div className="flex items-end">
                  <Button variant="accent" onClick={generateEmployeeReport} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </div>

            {employeeReport && (
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => handlePrint(employeeReportRef, false)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" onClick={() => handlePrint(employeeReportRef, true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Salvar PDF
                  </Button>
                </div>

                <div ref={employeeReportRef} className="bg-card rounded-xl border border-border p-6">
                  <div className="header mb-6">
                    <h2 className="text-xl font-display font-bold text-foreground">
                      Relatório de Horas Extras por Funcionário
                    </h2>
                    <div className="mt-2 text-muted-foreground">
                      <p><strong>Funcionário:</strong> {employeeReport.employee.name}</p>
                      <p><strong>Função:</strong> {employeeReport.employee.role}</p>
                      <p><strong>Período:</strong> {employeeReport.month} de {employeeReport.year}</p>
                    </div>
                  </div>

                  {employeeReport.entries.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      Nenhuma hora extra registrada no período
                    </p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="p-3 text-left font-medium text-muted-foreground">Data</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Dia</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Local</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Entrada</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Saída</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Total</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Obs.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employeeReport.entries.map((entry: any) => (
                              <tr key={entry.id} className="border-b border-border">
                                <td className="p-3">{format(parseISO(entry.date), 'dd/MM/yyyy')}</td>
                                <td className="p-3">{getDayName(entry.date)}</td>
                                <td className="p-3">{entry.project_name}</td>
                                <td className="p-3">{entry.start_time}</td>
                                <td className="p-3">{entry.end_time}</td>
                                <td className="p-3 font-medium">
                                  {formatHours(calculateHours(entry.start_time, entry.end_time))}
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">{entry.observation || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-lg font-display font-bold text-foreground">
                          Total de Horas Extras: {formatHours(employeeReport.totalHours)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Project Report */}
          <TabsContent value="project" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Obra *</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mês *</Label>
                  <Select value={projectMonth} onValueChange={setProjectMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                  <Select value={projectYear} onValueChange={setProjectYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                <div className="flex items-end">
                  <Button variant="accent" onClick={generateProjectReport} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </div>

            {projectReport && (
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => handlePrint(projectReportRef, false)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" onClick={() => handlePrint(projectReportRef, true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Salvar PDF
                  </Button>
                </div>

                <div ref={projectReportRef} className="bg-card rounded-xl border border-border p-6">
                  <div className="header mb-6">
                    <h2 className="text-xl font-display font-bold text-foreground">
                      Relatório de Horas Extras por Obra
                    </h2>
                    <div className="mt-2 text-muted-foreground">
                      <p><strong>Obra:</strong> {projectReport.project.name}</p>
                      <p><strong>Endereço:</strong> {projectReport.project.address || '-'}</p>
                      <p><strong>Período:</strong> {projectReport.month} de {projectReport.year}</p>
                    </div>
                  </div>

                  {projectReport.entries.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      Nenhuma hora extra registrada no período
                    </p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="p-3 text-left font-medium text-muted-foreground">Data</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Dia</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Entrada</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Saída</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Total</th>
                              <th className="p-3 text-left font-medium text-muted-foreground">Obs.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectReport.entries.map((entry: any) => (
                              <tr key={entry.id} className="border-b border-border">
                                <td className="p-3">{format(parseISO(entry.date), 'dd/MM/yyyy')}</td>
                                <td className="p-3">{getDayName(entry.date)}</td>
                                <td className="p-3">{entry.start_time}</td>
                                <td className="p-3">{entry.end_time}</td>
                                <td className="p-3 font-medium">
                                  {formatHours(calculateHours(entry.start_time, entry.end_time))}
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">{entry.observation || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-lg font-display font-bold text-foreground">
                          Total de Horas Extras: {formatHours(projectReport.totalHours)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Reports;
