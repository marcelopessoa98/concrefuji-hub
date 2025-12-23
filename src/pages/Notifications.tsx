import { AlertTriangle, AlertCircle, Info, Check, Trash2, Bell } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Notifications = () => {
  const { notifications, markNotificationAsRead, deleteNotification, clearAllNotifications, currentUser } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getBackground = (type: string, read: boolean) => {
    if (read) return 'bg-muted/30';
    switch (type) {
      case 'error':
        return 'bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-info/10 border-info/20';
    }
  };

  const handleClearAll = () => {
    if (currentUser?.role !== 'admin') {
      toast.error('Apenas administradores podem apagar todas as notificações');
      return;
    }
    clearAllNotifications();
    toast.success('Todas as notificações foram apagadas');
  };

  const handleDelete = (id: string) => {
    if (currentUser?.role !== 'admin') {
      toast.error('Apenas administradores podem apagar notificações');
      return;
    }
    deleteNotification(id);
    toast.success('Notificação apagada');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              Notificações
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                  {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Alertas sobre limites de horas extras e outras informações importantes
            </p>
          </div>
          {currentUser?.role === 'admin' && notifications.length > 0 && (
            <Button variant="outline" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todas
            </Button>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Limites de Horas Extras</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Limite semanal: <strong>40 horas</strong> | Limite aos sábados: <strong>16 horas por mês</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Funcionários que excederem esses limites receberão notificações automáticas.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground">Nenhuma notificação</h3>
            <p className="text-muted-foreground mt-1">
              Você não possui notificações no momento
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border transition-all animate-slide-up",
                  getBackground(notification.type, notification.read)
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{notification.title}</p>
                      <p className="text-muted-foreground mt-1">{notification.message}</p>
                      {notification.employeeName && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Funcionário: <strong>{notification.employeeName}</strong>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markNotificationAsRead(notification.id)}
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4 text-success" />
                        </Button>
                      )}
                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          title="Apagar"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {format(parseISO(notification.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
