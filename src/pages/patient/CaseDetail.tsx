import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, FileText, Calendar, User } from 'lucide-react';

export default function PatientCaseDetail() {
  const { caseId } = useParams();

  // Mock data
  const caseData = {
    id: caseId,
    title: 'High blood glucose levels',
    description: 'My blood glucose readings have been consistently above 200 mg/dL for the past week despite following my medication schedule.',
    status: 'in_review',
    created: '2024-01-10',
    doctor: 'Dr. Smith',
    notes: [
      { author: 'Dr. Smith', content: 'Reviewing your recent reports. Will update shortly.', date: '2024-01-11' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/patient/cases">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Case Details</h1>
          <p className="text-muted-foreground">Case #{caseId}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{caseData.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {caseData.created}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {caseData.doctor}
                </span>
              </div>
            </div>
            <Badge>{caseData.status.replace('_', ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{caseData.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-4">Doctor's Notes</h3>
            <div className="space-y-4">
              {caseData.notes.map((note, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{note.author}</span>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
