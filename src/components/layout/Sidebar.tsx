import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Settings,
  User,
  Activity,
  ClipboardList,
  CalendarCheck,
  Map,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const patientNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'My Cases', href: '/patient/cases', icon: FileText },
  { label: 'Reports', href: '/patient/reports', icon: Sparkles },
  { label: 'Documents', href: '/patient/documents', icon: FolderOpen },
  { label: 'Hospital Map', href: '/patient/navigation', icon: Map },
  { label: 'Appointments', href: '/patient/appointments', icon: CalendarCheck },
  { label: 'My Doctors', href: '/patient/bookings', icon: Users },
  { label: 'AI Chat', href: '/patient/chat', icon: MessageSquare },
];

const doctorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/doctor/appointments', icon: CalendarCheck },
  { label: 'Assignments', href: '/doctor/bookings', icon: Users },
  { label: 'Reports', href: '/doctor/reports', icon: Sparkles },
  { label: 'Cases', href: '/doctor/cases', icon: ClipboardList },
  { label: 'AI Chat', href: '/doctor/chat', icon: MessageSquare },
];

const bottomNavItems: NavItem[] = [
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  role: UserRole;
  isCollapsed?: boolean;
}

import { useMyDiabetesDashboard } from '@/hooks/queries/useDiabetesQueries';

export function Sidebar({ role, isCollapsed = false }: SidebarProps) {
  const location = useLocation();
  const { data: diabetesDashboard } = useMyDiabetesDashboard({ enabled: role === 'patient' });
  
  const navItems = role === 'doctor' 
    ? doctorNavItems 
    : [
        ...patientNavItems,
        ...(diabetesDashboard?.has_diabetes_data ? [{ 
          label: 'Diabetes Manager', 
          href: '/patient/diabetes-dashboard', 
          icon: Activity 
        }] : [])
      ];
  
  const roleAwareBottomNavItems = bottomNavItems.map(item => ({
    ...item,
    href: `/${role}${item.href}`
  }));

  const isActive = (href: string) => {
    if (href === location.pathname) return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden lg:flex flex-col',
        isCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <Link to={role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-sidebar-foreground" />
          {!isCollapsed && (
            <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">Swasth Dekhbhal</span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
        {roleAwareBottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
