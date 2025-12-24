import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Clock, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  UserCog,
  ChevronDown
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo.png';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Funcionários', path: '/employees' },
  { icon: Building2, label: 'Obras', path: '/projects' },
  { icon: Clock, label: 'Horas Extras', path: '/overtime' },
  { icon: FileText, label: 'Relatórios', path: '/reports' },
  { icon: Bell, label: 'Notificações', path: '/notifications' },
  { icon: UserCog, label: 'Usuários', path: '/users', adminOnly: true },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { currentUser, notifications, setCurrentUser } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || currentUser?.role === 'admin'
  );

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="CONCREFUJI" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="notification-badge ml-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                      <span className="text-sidebar-accent-foreground text-sm font-medium">
                        {currentUser.firstName[0]}{currentUser.lastName[0]}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-sidebar-foreground">
                        {currentUser.firstName}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser.role === 'admin' ? 'Administrador' : 'Funcionário'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-sidebar-border bg-sidebar">
            <nav className="p-4 space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.path === '/notifications' && unreadCount > 0 && (
                      <span className="notification-badge ml-auto">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* User info and logout on mobile */}
              {currentUser && (
                <div className="pt-4 mt-4 border-t border-sidebar-border">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                      <span className="text-sidebar-accent-foreground font-medium">
                        {currentUser.firstName[0]}{currentUser.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-sidebar-foreground">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60">
                        {currentUser.role === 'admin' ? 'Administrador' : 'Funcionário'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
