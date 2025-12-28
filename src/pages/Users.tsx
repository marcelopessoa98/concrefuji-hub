import { UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';

const Users = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <UserCog className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Acesso Restrito
          </h1>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar usuários.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Usuários</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os usuários do sistema
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <UserCog className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Gerenciamento de Usuários</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Os usuários são gerenciados através do sistema de autenticação. 
                Novos usuários podem se registrar através da página de login.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Para promover um usuário a administrador, entre em contato com o suporte técnico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
