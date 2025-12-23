import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
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
import { toast } from 'sonner';

const Projects = () => {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    reference: '',
  });

  const filteredClients = clients.filter((client) =>
    client.clientName.toLowerCase().includes(search.toLowerCase()) ||
    client.projectName.toLowerCase().includes(search.toLowerCase()) ||
    client.reference.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.projectName || !formData.reference) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingClient) {
      updateClient(editingClient, formData);
      toast.success('Obra atualizada com sucesso!');
    } else {
      addClient(formData);
      toast.success('Obra cadastrada com sucesso!');
    }

    setFormData({ clientName: '', projectName: '', reference: '' });
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setFormData({
        clientName: client.clientName,
        projectName: client.projectName,
        reference: client.reference,
      });
      setEditingClient(id);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    setDeleteConfirm(null);
    toast.success('Obra removida com sucesso!');
  };

  const openNewDialog = () => {
    setFormData({ clientName: '', projectName: '', reference: '' });
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Obras</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o cadastro de clientes e obras
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? 'Editar Obra' : 'Nova Obra'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingClient
                      ? 'Atualize os dados da obra'
                      : 'Preencha os dados para cadastrar uma nova obra'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Cliente *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Obra *</Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="Nome da obra"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Referência *</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Ex: RF-001"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="accent">
                    {editingClient ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, obra ou referência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhuma obra encontrada
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(client.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(client.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    {client.projectName}
                  </h3>
                  <p className="text-muted-foreground mt-1">{client.clientName}</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                      {client.reference}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.
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

export default Projects;
