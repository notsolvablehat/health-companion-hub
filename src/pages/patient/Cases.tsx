import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientCases() {
  // Mock data
  const cases = [
    { id: '1', title: 'High blood glucose levels', status: 'open', created: '2 hours ago', doctor: 'Dr. Smith' },
    { id: '2', title: 'Medication adjustment request', status: 'in_review', created: '1 day ago', doctor: 'Dr. Smith' },
    { id: '3', title: 'Routine checkup results', status: 'approved', created: '3 days ago', doctor: 'Dr. Johnson' },
    { id: '4', title: 'Side effects report', status: 'closed', created: '1 week ago', doctor: 'Dr. Smith' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in_review': return <FileText className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_review': return 'secondary';
      case 'approved': return 'default';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Cases</h1>
          <p className="text-muted-foreground">Manage your medical cases and consultations</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </div>

      <div className="space-y-4">
        {cases.map((caseItem) => (
          <Card key={caseItem.id} className="hover:shadow-soft transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{caseItem.title}</h3>
                    <Badge variant={getStatusColor(caseItem.status) as "default" | "secondary"} className="flex items-center gap-1">
                      {getStatusIcon(caseItem.status)}
                      {caseItem.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Assigned to: {caseItem.doctor}</p>
                  <p className="text-xs text-muted-foreground mt-1">Created {caseItem.created}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/patient/cases/${caseItem.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
