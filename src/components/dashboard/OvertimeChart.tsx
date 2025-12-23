import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '@/contexts/AppContext';

interface OvertimeChartProps {
  type: 'employees' | 'projects';
}

export function OvertimeChart({ type }: OvertimeChartProps) {
  const { overtimeRecords, clients } = useApp();

  const calculateHours = (start: string, end: string) => {
    const startDate = new Date(`2024-01-01T${start}`);
    const endDate = new Date(`2024-01-01T${end}`);
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  };

  const getEmployeeData = () => {
    const employeeHours: Record<string, { name: string; hours: number }> = {};
    
    overtimeRecords.forEach((record) => {
      if (!employeeHours[record.employeeId]) {
        employeeHours[record.employeeId] = { name: record.employeeName.split(' ')[0], hours: 0 };
      }
      record.entries.forEach((entry) => {
        employeeHours[record.employeeId].hours += calculateHours(entry.startTime, entry.endTime);
      });
    });

    return Object.values(employeeHours)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)
      .map((item) => ({ ...item, hours: Math.round(item.hours * 10) / 10 }));
  };

  const getProjectData = () => {
    const projectHours: Record<string, { name: string; hours: number }> = {};
    
    overtimeRecords.forEach((record) => {
      record.entries.forEach((entry) => {
        if (!projectHours[entry.projectId]) {
          projectHours[entry.projectId] = { name: entry.projectName.split(' ')[0], hours: 0 };
        }
        projectHours[entry.projectId].hours += calculateHours(entry.startTime, entry.endTime);
      });
    });

    return Object.values(projectHours)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)
      .map((item) => ({ ...item, hours: Math.round(item.hours * 10) / 10 }));
  };

  const data = type === 'employees' ? getEmployeeData() : getProjectData();
  const colors = ['hsl(0, 72%, 51%)', 'hsl(0, 72%, 60%)', 'hsl(0, 72%, 65%)', 'hsl(0, 72%, 70%)', 'hsl(0, 72%, 75%)'];

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
      <h3 className="font-display font-semibold text-foreground mb-4">
        {type === 'employees' ? 'Funcionários com mais horas extras' : 'Obras com mais horas extras'}
      </h3>
      
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}h`, 'Horas']}
              />
              <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
