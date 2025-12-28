import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function NotificationWidget() {
  const { notifications } = useNotifications();
  const recentNotifications = notifications.filter((n) => !n.is_read).slice(0, 3);

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

  const getBackground = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-info/10 border-info/20';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">Notificações Recentes</h3>
        <Link
          to="/notifications"
          className="text-sm text-accent hover:underline flex items-center gap-1"
        >
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {recentNotifications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma notificação pendente
        </p>
      ) : (
        <div className="space-y-3">
          {recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                getBackground(notification.type)
              )}
            >
              <div className="shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{notification.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(parseISO(notification.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
