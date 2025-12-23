import { Users, Building2, Clock, FileText, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BirthdayCard } from '@/components/dashboard/BirthdayCard';
import { OvertimeChart } from '@/components/dashboard/OvertimeChart';
import { NotificationWidget } from '@/components/dashboard/NotificationWidget';

const Dashboard = () => {
  const { currentUser, employees, clients, overtimeRecords, notifications } = useApp();

  const totalOvertimeHours = overtimeRecords.reduce((total, record) => {
    return total + record.entries.reduce((entryTotal, entry) => {
      const start = new Date(`2024-01-01T${entry.startTime}`);
      const end = new Date(`2024-01-01T${entry.endTime}`);
      return entryTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }, 0);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Bem-vindo, {currentUser?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo do seu sistema de gestão
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Funcionários"
            value={employees.length}
            icon={Users}
            description="Cadastrados no sistema"
            variant="default"
          />
          <StatCard
            title="Obras Ativas"
            value={clients.length}
            icon={Building2}
            description="Em andamento"
            variant="accent"
          />
          <StatCard
            title="Horas Extras (Mês)"
            value={`${Math.round(totalOvertimeHours)}h`}
            icon={Clock}
            description="Total acumulado"
            trend={{ value: 12, isPositive: false }}
            variant="warning"
          />
          <StatCard
            title="Notificações"
            value={unreadNotifications}
            icon={AlertCircle}
            description="Pendentes de leitura"
            variant={unreadNotifications > 0 ? 'accent' : 'success'}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OvertimeChart type="employees" />
          <OvertimeChart type="projects" />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotificationWidget />
          <BirthdayCard />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
