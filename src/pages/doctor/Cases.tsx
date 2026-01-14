import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorCases() {
  // Mock data
  const cases = [
    { id: '1', patient: 'John Doe', title: 'High blood glucose levels', status: 'open', priority: 'high', created: '2 hours ago' },
    { id: '2', patient: 'Jane Smith', title: 'Medication side effects', status: 'in_review', priority: 'medium', created: '5 hours ago' },
    { id: '3', patient: 'Mike Johnson', title: 'Routine checkup query', status: 'open', priority: 'low', created: '1 day ago' },
    { id: '4', patient: 'Sarah Wilson', title: 'Diet plan review', status: 'approved', priority: 'medium', created: '2 days ago' },
  ];

  const filterCases = (status: string) => {
    if (status === 'all') return cases;
    return cases.filter((c) => c.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const CaseList = ({ filteredCases }: { filteredCases: typeof cases }) => (
    <div className="space-y-4">
      {filteredCases.length > 0 ? (
        filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{caseItem.patient}</span>
                <Badge variant={getPriorityColor(caseItem.priority) as "destructive" | "default" | "secondary"}>
                  {caseItem.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{caseItem.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{caseItem.created}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/doctor/cases/${caseItem.id}`}>Review</Link>
            </Button>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8">No cases found</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cases</h1>
        <p className="text-muted-foreground">Review and manage patient cases</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({cases.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({filterCases('open').length})</TabsTrigger>
          <TabsTrigger value="in_review">In Review ({filterCases('in_review').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filterCases('approved').length})</TabsTrigger>
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

        <TabsContent value="in_review">
          <Card>
            <CardContent className="pt-6">
              <CaseList filteredCases={filterCases('in_review')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="pt-6">
              <CaseList filteredCases={filterCases('approved')} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
