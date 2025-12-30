-- Primeiro, vamos renomear a tabela clients atual para projects
-- pois ela contém as obras/projetos

-- Criar tabela de clientes (somente dados do cliente)
CREATE TABLE public.company_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_clients ENABLE ROW LEVEL SECURITY;

-- Policies para company_clients
CREATE POLICY "Admins can delete company_clients"
ON public.company_clients FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert company_clients"
ON public.company_clients FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update company_clients"
ON public.company_clients FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view company_clients"
ON public.company_clients FOR SELECT
USING (public.is_authenticated());

-- Criar tabela de projetos/obras (referenciando clientes)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.company_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies para projects
CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert projects"
ON public.projects FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update projects"
ON public.projects FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view projects"
ON public.projects FOR SELECT
USING (public.is_authenticated());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_clients_updated_at
BEFORE UPDATE ON public.company_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrar dados da tabela clients atual para as novas tabelas
-- Primeiro, inserir clientes únicos
INSERT INTO public.company_clients (name, contact)
SELECT DISTINCT client_name, contact
FROM public.clients;

-- Depois, inserir projetos com referência aos clientes
INSERT INTO public.projects (client_id, name, address, status)
SELECT cc.id, c.project_name, c.address, c.status
FROM public.clients c
JOIN public.company_clients cc ON cc.name = c.client_name;