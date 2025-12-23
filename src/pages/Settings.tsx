import { useState } from 'react';
import { Settings as SettingsIcon, Clock, Save, ShieldCheck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Settings = () => {
  const { settings, updateSettings, currentUser } = useApp();
  const [maxWeeklyOvertime, setMaxWeeklyOvertime] = useState(settings.maxWeeklyOvertime.toString());
  const [maxSaturdayOvertime, setMaxSaturdayOvertime] = useState(settings.maxSaturdayOvertime.toString());

  const handleSave = () => {
    if (currentUser?.role !== 'admin') {
      toast.error('Apenas administradores podem alterar as configurações');
      return;
    }

    const weekly = parseInt(maxWeeklyOvertime, 10);
    const saturday = parseInt(maxSaturdayOvertime, 10);

    if (isNaN(weekly) || isNaN(saturday) || weekly < 1 || saturday < 1) {
      toast.error('Valores inválidos. Insira números maiores que zero.');
      return;
    }

    updateSettings({
      maxWeeklyOvertime: weekly,
      maxSaturdayOvertime: saturday,
    });

    toast.success('Configurações salvas com sucesso!');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Configure os parâmetros do sistema
          </p>
        </div>

        {!isAdmin && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-warning" />
              <p className="text-foreground">
                Apenas administradores podem alterar as configurações do sistema.
              </p>
            </div>
          </div>
        )}

        {/* Overtime Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Limites de Horas Extras</h2>
              <p className="text-sm text-muted-foreground">
                Defina os limites máximos permitidos por lei
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weeklyLimit">Limite Semanal (horas)</Label>
              <Input
                id="weeklyLimit"
                type="number"
                value={maxWeeklyOvertime}
                onChange={(e) => setMaxWeeklyOvertime(e.target.value)}
                disabled={!isAdmin}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Máximo de horas extras permitidas por semana
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="saturdayLimit">Limite aos Sábados (horas/mês)</Label>
              <Input
                id="saturdayLimit"
                type="number"
                value={maxSaturdayOvertime}
                onChange={(e) => setMaxSaturdayOvertime(e.target.value)}
                disabled={!isAdmin}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Máximo de horas extras aos sábados por mês
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-border flex justify-end">
              <Button variant="accent" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Informações do Sistema</h2>
              <p className="text-sm text-muted-foreground">
                Dados gerais sobre o sistema
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Versão do Sistema</p>
              <p className="font-medium text-foreground">1.0.0</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Desenvolvido por</p>
              <p className="font-medium text-foreground">CONCREFUJI</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Usuário Logado</p>
              <p className="font-medium text-foreground">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Nível de Acesso</p>
              <p className="font-medium text-foreground capitalize">
                {currentUser?.role === 'admin' ? 'Administrador' : 'Funcionário'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
