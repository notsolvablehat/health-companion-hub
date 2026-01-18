import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, FileText, Calendar, User, CheckCircle, XCircle, Clock, Loader2, AlertCircle, Database } from 'lucide-react';
import { useState } from 'react';
import { useCase, useCaseReports, useApproveCase, useUpdateCase, useAddNote } from '@/hooks/queries';
import { formatDistanceToNow, format } from 'date-fns';
import { parseBackendDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function DoctorCaseReview() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [noteContent, setNoteContent] = useState('');

  const { data: caseData, isLoading: isLoadingCase, error: caseError } = useCase(caseId);
  const { data: reportsData, isLoading: isLoadingReports } = useCaseReports(caseId);

  const approveCaseMutation = useApproveCase(caseId!);
  const updateCaseMutation = useUpdateCase(caseId!);
  const addNoteMutation = useAddNote(caseId!);

  const handleApprove = () => {
    approveCaseMutation.mutate(
      { approval_notes: noteContent }, 
      {
        onSuccess: () => {
          toast.success('Case approved successfully');
        },
        onError: () => toast.error('Failed to approve case')
      }
    );
  };

  const handleClose = () => {
     updateCaseMutation.mutate(
        { status: 'closed' },
        { 
            onSuccess: () => toast.success('Case closed'),
            onError: () => toast.error('Failed to close case')
        }
     );
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    
    addNoteMutation.mutate(
      { 
        case_id: caseId!,
        content: noteContent,
        note_type: 'progress',
        visibility: 'shared'
      },
      {
        onSuccess: () => {
          toast.success('Note added');
          setNoteContent('');
        },
        onError: () => toast.error('Failed to add note')
      }
    );
  };

  if (isLoadingCase) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (caseError || !caseData) {
    return (
        <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>Failed to load case. Please try again.</p>
        </div>
    );
  }

  const reports = reportsData?.reports || []; // check structure of reportsData

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
          <p className="text-muted-foreground">Case #{caseData.case_id}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/doctor/cases/${caseId}/full-data`)}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            View Full Data
          </Button>
          {caseData.status !== 'closed' && (
             <Button 
               variant="outline" 
               onClick={handleClose} 
               disabled={updateCaseMutation.isPending}
               className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
             >
                <XCircle className="w-4 h-4 mr-2" />
                Close Case
            </Button>
          )}
          {caseData.status !== 'approved_by_doctor' && caseData.status !== 'closed' && (
            <Button 
              onClick={handleApprove} 
              disabled={approveCaseMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
            >
                {approveCaseMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <CheckCircle className="w-4 h-4 mr-2" />}
                Approve
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{caseData.subjective?.chief_complaint || 'Untitled Case'}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {parseBackendDate(caseData.created_at) ? format(parseBackendDate(caseData.created_at)!, 'MMM dd, yyyy') : 'N/A'}
                  </span>
                  <div className="flex items-center gap-1 hover:text-primary cursor-pointer">
                    <User className="w-4 h-4" />
                    {caseData.patient_name || `Patient ${caseData.patient_id?.substring(0,8)}`}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={caseData.status === 'approved_by_doctor' ? 'default' : 'secondary'}>
                    {caseData.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {caseData.subjective?.history_of_present_illness && (
                <div>
                    <h3 className="font-medium mb-2">History of Present Illness</h3>
                    {typeof caseData.subjective.history_of_present_illness === 'string' ? (
                        <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg">{caseData.subjective.history_of_present_illness}</p>
                    ) : (
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                            {(caseData.subjective.history_of_present_illness as any).narrative && (
                                <p className="text-muted-foreground">{(caseData.subjective.history_of_present_illness as any).narrative}</p>
                            )}
                            {((caseData.subjective.history_of_present_illness as any).onset || (caseData.subjective.history_of_present_illness as any).duration) && (
                                <div className="flex gap-4 text-xs">
                                    {(caseData.subjective.history_of_present_illness as any).onset && (
                                        <span><strong>Onset:</strong> {(caseData.subjective.history_of_present_illness as any).onset}</span>
                                    )}
                                    {(caseData.subjective.history_of_present_illness as any).duration && (
                                        <span><strong>Duration:</strong> {(caseData.subjective.history_of_present_illness as any).duration}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
             {caseData.assessment?.clinical_impression && (
                <div>
                    <h3 className="font-medium mb-2">Clinical Impression</h3>
                    {typeof caseData.assessment.clinical_impression === 'string' ? (
                        <p className="text-muted-foreground">{caseData.assessment.clinical_impression}</p>
                    ) : (
                        <div className="space-y-2 text-sm">
                            {(caseData.assessment.clinical_impression as any).summary && (
                                <p className="text-muted-foreground">{(caseData.assessment.clinical_impression as any).summary}</p>
                            )}
                            {(caseData.assessment.clinical_impression as any).main_concerns && Array.isArray((caseData.assessment.clinical_impression as any).main_concerns) && (
                                <div>
                                    <p className="font-medium text-xs mb-1">Main Concerns:</p>
                                    <ul className="list-disc list-inside text-muted-foreground">
                                        {(caseData.assessment.clinical_impression as any).main_concerns.map((concern: string, i: number) => (
                                            <li key={i}>{concern}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div>
              <Label htmlFor="notes">Doctor Notes & Approval Comments</Label>
              <Textarea
                id="notes"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add your clinical notes, recommendations, or feedback..."
                rows={5}
                className="mt-2"
              />
            </div>

            <Button className="w-full" onClick={handleAddNote} disabled={addNoteMutation.isPending || !noteContent.trim()}>
              <Clock className="w-4 h-4 mr-2" />
              Add Note
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
              {isLoadingReports ? (
                 <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                    {reports.length > 0 ? reports.map((report: any) => (
                    <div key={report.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                        <p className="text-sm font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{parseBackendDate(report.created_at) ? format(parseBackendDate(report.created_at)!, 'MMM dd, yyyy') : 'Unknown'}</p>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                    </div>
                    )) : <p className="text-sm text-muted-foreground">No reports attached.</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Case History / Audit Trail */}
          {caseData.audit_trail && (
              <Card>
                <CardHeader>
                <CardTitle className="text-base">Case History</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {caseData.audit_trail.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                        <p className="text-sm capitalize">{log.action.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                            {parseBackendDate(log.timestamp) ? formatDistanceToNow(parseBackendDate(log.timestamp)!, { addSuffix: true }) : 'Unknown'}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
