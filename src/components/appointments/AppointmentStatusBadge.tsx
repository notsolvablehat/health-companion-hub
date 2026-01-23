import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types/appointment';
import { Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { color: string; icon: any }> = {
  Scheduled: {
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: Calendar,
  },
  Completed: {
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2,
  },
  Cancelled: {
    color: 'bg-muted text-muted-foreground border-border',
    icon: XCircle,
  },
  'No-show': {
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertCircle,
  },
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Scheduled;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </Badge>
  );
}
