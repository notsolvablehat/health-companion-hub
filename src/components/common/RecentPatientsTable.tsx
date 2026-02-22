import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { parseBackendDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Clock, Activity, CheckCircle } from 'lucide-react';

interface RecentPatient {
  case_id: string;
  status: string;
  chief_complaint: string;
  patient_name: string;
  patient_id: string;
  created_at: string;
}

interface RecentPatientsTableProps {
  patients: RecentPatient[];
}

export function RecentPatientsTable({ patients }: RecentPatientsTableProps) {
  const getSeverityClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'critical';
      case 'under_review':
        return 'high';
      case 'closed':
        return 'moderate';
      default:
        return 'stable';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Critical';
      case 'under_review':
        return 'Review';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const getTagClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'tag-urgent';
      case 'under_review':
        return 'tag-returning';
      case 'closed':
        return 'tag-returning';
      default:
        return 'tag-new';
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'open':
        return <Clock className="w-3 h-3" />;
      case 'under_review':
        return <Activity className="w-3 h-3" />;
      case 'closed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Patient
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Condition
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              const sevClass = getSeverityClass(patient.status);
              const timeStr = parseBackendDate(patient.created_at)
                ? formatDistanceToNow(parseBackendDate(patient.created_at)!, {
                    addSuffix: true,
                  })
                : 'Unknown';

              return (
                <tr
                  key={patient.case_id}
                  className="border-b last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/doctor/cases/${patient.case_id}`}
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      <span
                        className={cn(
                          'inline-block w-1.5 h-1.5 rounded-full',
                          sevClass === 'critical' && 'bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.4)]',
                          sevClass === 'high' && 'bg-warning',
                          sevClass === 'moderate' && 'bg-info',
                          sevClass === 'stable' && 'bg-success'
                        )}
                      />
                      {patient.patient_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {patient.chief_complaint || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded font-medium',
                        patient.status === 'open' && 'bg-destructive/10 text-destructive',
                        patient.status === 'under_review' && 'bg-info/10 text-info',
                        patient.status === 'closed' && 'bg-success/10 text-success'
                      )}
                    >
                      <StatusIcon status={patient.status} />
                      {getStatusLabel(patient.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {timeStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
