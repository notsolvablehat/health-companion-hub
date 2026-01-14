import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, FileText, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function DoctorCaseReview() {
  const { caseId } = useParams();
  const [notes, setNotes] = useState('');

  // Mock data
  const caseData = {
    id: caseId,
    patient: { name: 'John Doe', id: '1' },
    title: 'High blood glucose levels',
    description: 'My blood glucose readings have been consistently above 200 mg/dL for the past week despite following my medication schedule.',
    status: 'open',
    priority: 'high',
    created: '2024-01-10',
    reports: [
      { id: '1', name: 'Blood Glucose Report.pdf', date: '2024-01-09' },
    ],
    history: [
      { action: 'Case created', date: '2024-01-10', by: 'John Doe' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/doctor/cases">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Case Review</h1>
          <p className="text-muted-foreground">Case #{caseId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-destructive hover:text-destructive">
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button className="bg-success hover:bg-success/90">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{caseData.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {caseData.created}
                  </span>
                  <Link to={`/doctor/patients/${caseData.patient.id}`} className="flex items-center gap-1 hover:text-primary">
                    <User className="w-4 h-4" />
                    {caseData.patient.name}
                  </Link>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge>{caseData.status}</Badge>
                <Badge variant="destructive">{caseData.priority}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Patient Description</h3>
              <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg">{caseData.description}</p>
            </div>

            <div>
              <Label htmlFor="notes">Your Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your clinical notes, recommendations, or feedback..."
                rows={5}
                className="mt-2"
              />
            </div>

            <Button className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Save Notes & Set to In Review
            </Button>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attached Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attached Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {caseData.reports.map((report) => (
                  <div key={report.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Case History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseData.history.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm">{event.action}</p>
                      <p className="text-xs text-muted-foreground">{event.date} by {event.by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
