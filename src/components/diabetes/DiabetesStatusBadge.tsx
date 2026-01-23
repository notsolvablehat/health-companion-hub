import { AlertCircle, AlertTriangle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiabetesStatusBadgeProps {
  status: 'diabetic' | 'at-risk' | 'monitoring' | null;
}

const statusConfig = {
  diabetic: {
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    icon: AlertCircle,
    label: 'Diabetic',
  },
  'at-risk': {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    icon: AlertTriangle,
    label: 'At Risk',
  },
  monitoring: {
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    icon: Activity,
    label: 'Monitoring',
  },
} as const;

/**
 * Status badge component for diabetes dashboard
 * 
 * Displays the patient's diabetes status with appropriate color coding and icon.
 */
export function DiabetesStatusBadge({ status }: DiabetesStatusBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border px-3 py-1.5 text-sm font-medium`}>
      <Icon className="h-4 w-4 mr-1.5" />
      {config.label}
    </Badge>
  );
}
