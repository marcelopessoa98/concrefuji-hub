import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Clock, 
  ClipboardList,
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  UserCog,
  MapPin
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import logo from '@/assets/logo.png';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: MapPin, label: 'Sedes', path: '/branches' },
  { icon: Users, label: 'Funcionários', path: '/employees' },
  { icon: Building2, label: 'Obras', path: '/projects' },
  { icon: Clock, label: 'Lançar HE', path: '/overtime' },
  { icon: ClipboardList, label: 'Gerenciar HE', path: '/overtime/manage' },
  { icon: FileText, label: 'Relatórios', path: '/reports' },
  { icon: Bell, label: 'Notificações', path: '/notifications' },
  { icon: UserCog, label: 'Usuários', path: '/users', adminOnly: true },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, authUser, isAdmin, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleLogout = async () => {
    await signOut();
  };

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const firstName = authUser?.firstName || user?.email?.split('@')[0] || '';
  const lastName = authUser?.lastName || '';
  const initials = (firstName[0]?.toUpperCase() || '') + (lastName[0]?.toUpperCase() || '');

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CONCREFUJI" className="h-8 w-auto" />
          {!collapsed && (
            <span className="font-display font-bold text-sidebar-foreground text-lg">
              CONCREFUJI
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.path === '/notifications' && unreadCount > 0 && (
                          <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {user && (
          <div className="space-y-3">
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                <span className="text-sidebar-accent-foreground text-sm font-medium">
                  {initials}
                </span>
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {firstName} {lastName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    {isAdmin ? 'Administrador' : 'Funcionário'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
