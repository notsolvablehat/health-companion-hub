import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
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
  { label: 'Home', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'Cases', href: '/patient/cases', icon: FileText },
  { label: 'Insights', href: '/patient/reports', icon: Sparkles },
  { label: 'Bookings', href: '/patient/bookings', icon: CalendarCheck },
  { label: 'Chat', href: '/patient/chat', icon: MessageSquare },
];

const doctorNavItems: NavItem[] = [
  { label: 'Home', href: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Insights', href: '/doctor/reports', icon: Sparkles },
  { label: 'Cases', href: '/doctor/cases', icon: ClipboardList },
  { label: 'Bookings', href: '/doctor/bookings', icon: CalendarCheck },
  { label: 'Chat', href: '/doctor/chat', icon: MessageSquare },
];

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const location = useLocation();
  const navItems = role === 'doctor' ? doctorNavItems : patientNavItems;

  const isActive = (href: string) => {
    if (href === location.pathname) return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'text-primary')} />
              <span className={cn('text-xs font-medium', active && 'text-primary')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
