import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useCompanyClients } from '@/hooks/useCompanyClients';
import { useProjects } from '@/hooks/useProjects';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const Projects = () => {
  const { companyClients, isLoading: isLoadingClients, addCompanyClient, updateCompanyClient, deleteCompanyClient } = useCompanyClients();
  const { projects, isLoading: isLoadingProjects, addProject, updateProject, deleteProject } = useProjects();
  const { isAdmin } = useAuth();
  
  const [search, setSearch] = useState('');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  
  // Client dialog
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [clientFormData, setClientFormData] = useState({ name: '', contact: '' });
  
  // Project dialog
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [selectedClientForProject, setSelectedClientForProject] = useState<string>('');
  const [projectFormData, setProjectFormData] = useState({ name: '', address: '' });
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'client' | 'project'; id: string } | null>(null);

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  // Filter clients based on search
  const filteredClients = companyClients.filter((client) => {
    const clientProjects = projects.filter((p) => p.client_id === client.id);
    const matchesClient = client.name.toLowerCase().includes(search.toLowerCase());
    const matchesProject = clientProjects.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return matchesClient || matchesProject;
  });

  // Client handlers
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name) return;

    if (editingClient) {
      updateCompanyClient.mutate({ id: editingClient, ...clientFormData });
    } else {
      addCompanyClient.mutate(clientFormData);
    }

    setClientFormData({ name: '', contact: '' });
    setEditingClient(null);
    setIsClientDialogOpen(false);
  };

  const handleEditClient = (id: string) => {
    const client = companyClients.find((c) => c.id === id);
    if (client) {
      setClientFormData({ name: client.name, contact: client.contact || '' });
      setEditingClient(id);
      setIsClientDialogOpen(true);
    }
  };

  const openNewClientDialog = () => {
    setClientFormData({ name: '', contact: '' });
    setEditingClient(null);
    setIsClientDialogOpen(true);
  };

  // Project handlers
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.name || !selectedClientForProject) return;

    if (editingProject) {
      updateProject.mutate({ id: editingProject, client_id: selectedClientForProject, ...projectFormData });
    } else {
      addProject.mutate({ client_id: selectedClientForProject, ...projectFormData });
    }

    setProjectFormData({ name: '', address: '' });
    setSelectedClientForProject('');
    setEditingProject(null);
    setIsProjectDialogOpen(false);
  };

  const handleEditProject = (project: { id: string; client_id: string; name: string; address: string | null }) => {
    setProjectFormData({ name: project.name, address: project.address || '' });
    setSelectedClientForProject(project.client_id);
    setEditingProject(project.id);
    setIsProjectDialogOpen(true);
  };

  const openNewProjectDialog = (clientId?: string) => {
    setProjectFormData({ name: '', address: '' });
    setSelectedClientForProject(clientId || '');
    setEditingProject(null);
    setIsProjectDialogOpen(true);
  };

  // Delete handler
  const handleDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'client') {
      deleteCompanyClient.mutate(deleteConfirm.id);
    } else {
      deleteProject.mutate(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  if (isLoadingClients || isLoadingProjects) {
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
            <h1 className="text-3xl font-display font-bold text-foreground">Clientes e Obras</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie clientes e suas respectivas obras
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={openNewClientDialog}>
                <Users className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
              <Button variant="accent" onClick={() => openNewProjectDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Obra
              </Button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou obra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          ) : (
            filteredClients.map((client) => {
              const clientProjects = projects.filter((p) => p.client_id === client.id);
              const isExpanded = expandedClients.has(client.id);

              return (
                <Collapsible
                  key={client.id}
                  open={isExpanded}
                  onOpenChange={() => toggleClient(client.id)}
                >
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {/* Client Header */}
                    <div className="p-4 flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-3 flex-1 text-left">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-semibold text-foreground">
                              {client.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {clientProjects.length} obra{clientProjects.length !== 1 ? 's' : ''} cadastrada{clientProjects.length !== 1 ? 's' : ''}
                              {client.contact && ` • ${client.contact}`}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      
                      {isAdmin && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openNewProjectDialog(client.id);
                            }}
                            title="Adicionar obra"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClient(client.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ type: 'client', id: client.id });
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Projects List */}
                    <CollapsibleContent>
                      <div className="border-t border-border bg-muted/30">
                        {clientProjects.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Nenhuma obra cadastrada para este cliente
                          </div>
                        ) : (
                          <div className="divide-y divide-border">
                            {clientProjects.map((project) => (
                              <div
                                key={project.id}
                                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-accent" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-foreground">
                                      {project.name}
                                    </h4>
                                    {project.address && (
                                      <p className="text-sm text-muted-foreground">
                                        {project.address}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    project.status === 'active' 
                                      ? 'bg-green-500/10 text-green-600' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {project.status === 'active' ? 'Ativa' : 'Inativa'}
                                  </span>
                                  {isAdmin && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditProject(project)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteConfirm({ type: 'project', id: project.id })}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </div>

        {/* Client Dialog */}
        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleClientSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </DialogTitle>
                <DialogDescription>
                  {editingClient
                    ? 'Atualize os dados do cliente'
                    : 'Preencha os dados para cadastrar um novo cliente'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Nome do Cliente *</Label>
                  <Input
                    id="client_name"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_contact">Contato</Label>
                  <Input
                    id="client_contact"
                    value={clientFormData.contact}
                    onChange={(e) => setClientFormData({ ...clientFormData, contact: e.target.value })}
                    placeholder="Telefone ou email"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="accent">
                  {editingClient ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Project Dialog */}
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleProjectSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Editar Obra' : 'Nova Obra'}
                </DialogTitle>
                <DialogDescription>
                  {editingProject
                    ? 'Atualize os dados da obra'
                    : 'Preencha os dados para cadastrar uma nova obra'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project_client">Cliente *</Label>
                  <Select value={selectedClientForProject} onValueChange={setSelectedClientForProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_name">Nome da Obra *</Label>
                  <Input
                    id="project_name"
                    value={projectFormData.name}
                    onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                    placeholder="Nome da obra"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_address">Endereço</Label>
                  <Input
                    id="project_address"
                    value={projectFormData.address}
                    onChange={(e) => setProjectFormData({ ...projectFormData, address: e.target.value })}
                    placeholder="Endereço da obra"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="accent">
                  {editingProject ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirm?.type === 'client'
                  ? 'Tem certeza que deseja excluir este cliente? Todas as obras associadas também serão excluídas. Esta ação não pode ser desfeita.'
                  : 'Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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
