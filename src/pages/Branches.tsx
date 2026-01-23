import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Users, Building2, Clock } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanyClients } from '@/hooks/useCompanyClients';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const Branches = () => {
  const { branches, isLoading: isLoadingBranches, addBranch, updateBranch, deleteBranch } = useBranches();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { companyClients, isLoading: isLoadingClients } = useCompanyClients();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
  });

  const isLoading = isLoadingBranches || isLoadingEmployees || isLoadingClients;

  // Count employees and clients by branch
  const branchStats = useMemo(() => {
    const stats: Record<string, { employees: number; clients: number }> = {};
    branches.forEach(branch => {
      stats[branch.id] = {
        employees: employees.filter(emp => emp.branch_id === branch.id).length,
        clients: companyClients.filter(client => client.branch_id === branch.id).length,
      };
    });
    return stats;
  }, [branches, employees, companyClients]);

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(search.toLowerCase()) ||
    branch.city.toLowerCase().includes(search.toLowerCase()) ||
    branch.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city || !formData.state) {
      return;
    }

    if (editingBranch) {
      updateBranch.mutate({
        id: editingBranch,
        name: formData.name,
        city: formData.city,
        state: formData.state,
      });
    } else {
      addBranch.mutate({
        name: formData.name,
        city: formData.city,
        state: formData.state,
      });
    }

    setFormData({ name: '', city: '', state: '' });
    setEditingBranch(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    const branch = branches.find((b) => b.id === id);
    if (branch) {
      setFormData({
        name: branch.name,
        city: branch.city,
        state: branch.state,
      });
      setEditingBranch(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteBranch.mutate(id);
    setDeleteConfirm(null);
  };

  const openNewDialog = () => {
    setFormData({ name: '', city: '', state: '' });
    setEditingBranch(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Sedes</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as sedes da empresa
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="accent" onClick={openNewDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Sede
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBranch ? 'Editar Sede' : 'Nova Sede'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingBranch
                        ? 'Atualize os dados da sede'
                        : 'Preencha os dados para cadastrar uma nova sede'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Sede *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: ConcreFuji Fortaleza"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ex: Fortaleza"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <select
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Selecione o estado</option>
                        {BRAZILIAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="accent">
                      {editingBranch ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cidade ou estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhuma sede encontrada
            </div>
          ) : (
            filteredBranches.map((branch) => {
              const stats = branchStats[branch.id] || { employees: 0, clients: 0 };
              return (
                <div
                  key={branch.id}
                  className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">
                          {branch.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {branch.city}, {branch.state}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(branch.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(branch.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Users className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{stats.employees}</p>
                        <p className="text-xs text-muted-foreground">Funcionários</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{stats.clients}</p>
                        <p className="text-xs text-muted-foreground">Clientes</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta sede? Esta ação não pode ser desfeita e pode afetar funcionários, clientes e obras associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Branches;
