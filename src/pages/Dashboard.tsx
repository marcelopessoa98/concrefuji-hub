import { Users, Building2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useClients } from '@/hooks/useClients';
import { useOvertimeRecords } from '@/hooks/useOvertimeRecords';
import { useNotifications } from '@/hooks/useNotifications';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BirthdayCard } from '@/components/dashboard/BirthdayCard';
import { OvertimeChart } from '@/components/dashboard/OvertimeChart';
import { NotificationWidget } from '@/components/dashboard/NotificationWidget';

const Dashboard = () => {
  const { authUser } = useAuth();
  const { employees } = useEmployees();
  const { clients } = useClients();
  const { records } = useOvertimeRecords();
  const { unreadCount } = useNotifications();

  const totalOvertimeHours = records.reduce((total, record) => {
    return total + (record.entries?.reduce((entryTotal, entry) => {
      const start = new Date(`2024-01-01T${entry.start_time}`);
      const end = new Date(`2024-01-01T${entry.end_time}`);
      return entryTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0) || 0);
  }, 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Bem-vindo, {authUser?.firstName || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo do seu sistema de gestão
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total de Funcionários" value={employees.length} icon={Users} description="Cadastrados no sistema" variant="default" />
          <StatCard title="Obras Ativas" value={clients.length} icon={Building2} description="Em andamento" variant="accent" />
          <StatCard title="Horas Extras (Mês)" value={`${Math.round(totalOvertimeHours)}h`} icon={Clock} description="Total acumulado" variant="warning" />
          <StatCard title="Notificações" value={unreadCount} icon={AlertCircle} description="Pendentes de leitura" variant={unreadCount > 0 ? 'accent' : 'success'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OvertimeChart type="employees" />
          <OvertimeChart type="projects" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotificationWidget />
          <BirthdayCard />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
