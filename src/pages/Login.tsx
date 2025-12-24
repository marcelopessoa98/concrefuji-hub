import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const Login = () => {
  const { loginUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    // Simulate delay for UX
    setTimeout(() => {
      const user = loginUser(email, password);
      if (user) {
        toast.success('Login realizado com sucesso!');
      } else {
        toast.error('Email ou senha inválidos');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="CONCREFUJI" className="h-12 mx-auto mb-4" />
          <p className="text-muted-foreground mt-2">Sistema de Gestão Interna</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">
            Faça seu login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-accent hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Credenciais de demonstração:
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted/50">
                <p><strong>Admin:</strong> admin@concrefuji.com.br</p>
                <p><strong>Senha:</strong> admin123</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p><strong>Estagiário:</strong> estagiario@concrefuji.com.br</p>
                <p><strong>Senha:</strong> estagiario123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} CONCREFUJI. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
