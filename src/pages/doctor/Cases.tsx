import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentUser, useDoctorCases } from '@/hooks/queries';
import { Case } from '@/types/case';
import { formatDistanceToNow } from 'date-fns';
import { parseBackendDate } from '@/lib/utils';

export default function DoctorCases() {
  const { data: user } = useCurrentUser();
  const { data: caseResponse, isLoading, error } = useDoctorCases(user?.id);
  const cases = caseResponse?.cases || [];

  const filterCases = (status: string) => {
    if (status === 'all') return cases;
    return cases.filter((c) => c.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'under_review': return 'default'; // In Review
      case 'approved_by_doctor': return 'default'; // Greenish usually, but default is black/primary
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const CaseList = ({ filteredCases }: { filteredCases: Partial<Case>[] }) => (
    <div className="space-y-4">
      {filteredCases.length > 0 ? (
        filteredCases.map((caseItem) => (
          <div key={caseItem.case_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {caseItem.patient_name || `Patient ID: ${caseItem.patient_id?.substring(0, 8)}...`}
                </span>
                <Badge variant={getStatusColor(caseItem.status || 'open') as any}>
                  {formatStatus(caseItem.status || 'open')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{caseItem.chief_complaint}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {parseBackendDate(caseItem.created_at) ? formatDistanceToNow(parseBackendDate(caseItem.created_at)!, { addSuffix: true }) : ''}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/doctor/cases/${caseItem.case_id}`}>Review</Link>
            </Button>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8">No cases found</p>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Failed to load cases. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cases</h1>
          <p className="text-muted-foreground">Review and manage patient cases</p>
        </div>
        <Button asChild>
          <Link to="/doctor/cases/new">New Case</Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({cases.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({filterCases('open').length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({filterCases('under_review').length})</TabsTrigger>
          <TabsTrigger value="action_required">Action Required</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              <CaseList filteredCases={cases} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open">
          <Card>
            <CardContent className="pt-6">
              <CaseList filteredCases={filterCases('open')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="under_review">
          <Card>
            <CardContent className="pt-6">
              <CaseList filteredCases={filterCases('under_review')} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="action_required">
             <Card>
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">List cases that need immediate attention (e.g. unapproved)</p>
               <CaseList filteredCases={cases.filter(c => c.status !== 'closed' && c.status !== 'approved_by_doctor')} />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
