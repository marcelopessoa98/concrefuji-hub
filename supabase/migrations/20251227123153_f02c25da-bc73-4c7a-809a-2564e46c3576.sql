-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de perfis de usuários (sincronizada com auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles de usuários (separada para segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Tabela de funcionários
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    admission_date DATE NOT NULL,
    birth_date DATE,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes/obras
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    address TEXT,
    contact TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de registros de horas extras
CREATE TABLE public.overtime_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    employee_name TEXT NOT NULL,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de entradas de horas extras
CREATE TABLE public.overtime_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    overtime_record_id UUID REFERENCES public.overtime_records(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    project_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'remunerada',
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se usuário está autenticado
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- RLS Policies para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para employees (todos autenticados podem ver e gerenciar)
CREATE POLICY "Authenticated users can view employees" ON public.employees
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert employees" ON public.employees
    FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employees" ON public.employees
    FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employees" ON public.employees
    FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para clients
CREATE POLICY "Authenticated users can view clients" ON public.clients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert clients" ON public.clients
    FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clients" ON public.clients
    FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clients" ON public.clients
    FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para overtime_records
CREATE POLICY "Authenticated users can view overtime_records" ON public.overtime_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert overtime_records" ON public.overtime_records
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update overtime_records" ON public.overtime_records
    FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete overtime_records" ON public.overtime_records
    FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para overtime_entries
CREATE POLICY "Authenticated users can view overtime_entries" ON public.overtime_entries
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert overtime_entries" ON public.overtime_entries
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update overtime_entries" ON public.overtime_entries
    FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete overtime_entries" ON public.overtime_entries
    FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para notifications
CREATE POLICY "Authenticated users can view notifications" ON public.notifications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications" ON public.notifications
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete notifications" ON public.notifications
    FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para criar profile e role automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  
  -- Primeiro usuário é admin, demais são users
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();