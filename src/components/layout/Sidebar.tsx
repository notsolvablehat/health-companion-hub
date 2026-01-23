import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  MessageSquare,
  Settings,
  User,
  Activity,
  Stethoscope,
  ClipboardList,
  CalendarCheck,
  Sparkles,
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
  { label: 'Bookings', href: '/patient/bookings', icon: CalendarCheck },
  { label: 'AI Chat', href: '/patient/chat', icon: MessageSquare },
];

const doctorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/doctor/reports', icon: Sparkles },
  { label: 'Cases', href: '/doctor/cases', icon: ClipboardList },
  { label: 'Bookings', href: '/doctor/bookings', icon: CalendarCheck },
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
  
  // Conditionally add Diabetes Dashboard
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
  
  // Make bottom nav items role-aware
  const roleAwareBottomNavItems = bottomNavItems.map(item => ({
    ...item,
    href: `/${role}${item.href}`
  }));

  const isActive = (href: string) => {
    if (href === location.pathname) return true;
    // Check for sub-routes
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden lg:flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link to={role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-sidebar-foreground">HealthCare</span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {roleAwareBottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
