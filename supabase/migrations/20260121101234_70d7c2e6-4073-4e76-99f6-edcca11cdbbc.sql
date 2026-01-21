-- Criar tabela de sedes (branches)
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para branches
CREATE POLICY "Authenticated users can view branches" ON public.branches
FOR SELECT USING (is_authenticated());

CREATE POLICY "Admins can insert branches" ON public.branches
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update branches" ON public.branches
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete branches" ON public.branches
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_branches_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir a sede padrão ConcreFuji Fortaleza
INSERT INTO public.branches (name, city, state) 
VALUES ('ConcreFuji Fortaleza', 'Fortaleza', 'CE');

-- Adicionar branch_id às tabelas existentes
ALTER TABLE public.employees ADD COLUMN branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.company_clients ADD COLUMN branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.projects ADD COLUMN branch_id UUID REFERENCES public.branches(id);
ALTER TABLE public.overtime_records ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- Atualizar registros existentes para a sede ConcreFuji Fortaleza
UPDATE public.employees SET branch_id = (SELECT id FROM public.branches WHERE name = 'ConcreFuji Fortaleza' LIMIT 1);
UPDATE public.company_clients SET branch_id = (SELECT id FROM public.branches WHERE name = 'ConcreFuji Fortaleza' LIMIT 1);
UPDATE public.projects SET branch_id = (SELECT id FROM public.branches WHERE name = 'ConcreFuji Fortaleza' LIMIT 1);
UPDATE public.overtime_records SET branch_id = (SELECT id FROM public.branches WHERE name = 'ConcreFuji Fortaleza' LIMIT 1);

-- Tornar branch_id obrigatório após migração dos dados
ALTER TABLE public.employees ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE public.company_clients ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE public.projects ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE public.overtime_records ALTER COLUMN branch_id SET NOT NULL;