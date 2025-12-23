import { Cake, Gift } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function BirthdayCard() {
  const { getBirthdaysThisMonth } = useApp();
  const birthdays = getBirthdaysThisMonth();

  const currentMonth = format(new Date(), 'MMMM', { locale: ptBR });

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Cake className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Aniversariantes</h3>
          <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
        </div>
      </div>

      {birthdays.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum aniversariante este mês
        </p>
      ) : (
        <div className="space-y-3">
          {birthdays.map((employee) => {
            const birthDate = parseISO(employee.birthDate);
            const day = format(birthDate, 'dd');
            
            return (
              <div
                key={employee.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-display font-bold text-accent">{day}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentMonth}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
