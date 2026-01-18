import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePatientCases } from '@/hooks/queries';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { parseBackendDate } from '@/lib/utils';

export default function PatientCases() {
  const { user } = useAuth();
  
  const { data: caseResponse, isLoading, error } = usePatientCases(user?.id);
  const cases = caseResponse?.cases || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'under_review': return <FileText className="w-4 h-4" />;
      case 'approved_by_doctor': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'under_review': return 'secondary';
      case 'approved_by_doctor': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Cases</h1>
            <p className="text-muted-foreground">Manage your medical cases and consultations</p>
          </div>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>Failed to load cases. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Cases</h1>
          <p className="text-muted-foreground">Manage your medical cases and consultations</p>
        </div>
        {/* Cases are created by doctors or via appointment request (not yet implemented) */}
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cases yet</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any medical cases on file.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <Card key={caseItem.case_id} className="hover:shadow-soft transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       {/* Mobile responsive fix for badge */}
                       <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-lg">
                                {caseItem.chief_complaint || 'Untitled Case'}
                            </h3>
                            <Badge 
                                variant={getStatusColor(caseItem.status || 'open') as any}
                                className="flex items-center gap-1 w-fit"
                            >
                                {getStatusIcon(caseItem.status || 'open')}
                                {formatStatus(caseItem.status || 'open')}
                            </Badge>
                       </div>
                    </div>
                    {caseItem.doctor_name && (
                      <p className="text-sm text-muted-foreground">
                        Assigned to: Dr. {caseItem.doctor_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {parseBackendDate(caseItem.created_at) ? formatDistanceToNow(parseBackendDate(caseItem.created_at)!, { addSuffix: true }) : ''}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/patient/cases/${caseItem.case_id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
