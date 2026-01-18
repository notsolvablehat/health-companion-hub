import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Calendar, 
  User, 
  Activity, 
  FileText, 
  Stethoscope,
  Pill,
  AlertCircle,
  Heart,
  Thermometer,
  Droplet,
  TrendingUp,
  ClipboardList,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { casesService } from '@/services';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PatientCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();

  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => casesService.getCaseById(caseId!),
    enabled: !!caseId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/patient/cases">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Case Details</h1>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>Failed to load case details. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in_review': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'approved': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'closed': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/patient/cases">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{caseData.subjective?.chief_complaint || 'Case Details'}</h1>
          <p className="text-muted-foreground">Case ID: {caseData.case_id}</p>
        </div>
        <Badge className={`${getStatusColor(caseData.status)} border`}>
          {caseData.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Overview Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Case Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(caseData.created_at), 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(caseData.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Case Type</p>
                <p className="text-sm text-muted-foreground capitalize">{caseData.case_type || 'Routine'}</p>
              </div>
            </div>
            {caseData.severity && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Severity</p>
                  <p className="text-sm text-muted-foreground capitalize">{caseData.severity}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SOAP Note Tabs */}
      <Tabs defaultValue="subjective" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subjective">Subjective</TabsTrigger>
          <TabsTrigger value="objective">Objective</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>

        {/* Subjective Tab */}
        <TabsContent value="subjective" className="space-y-4">
          {/* Chief Complaint */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Chief Complaint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{caseData.subjective?.chief_complaint || 'Not provided'}</p>
            </CardContent>
          </Card>

          {/* History of Present Illness */}
          {caseData.subjective?.history_of_present_illness && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  History of Present Illness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseData.subjective.history_of_present_illness.narrative && (
                  <div>
                    <p className="text-sm font-medium mb-1">Narrative</p>
                    <p className="text-muted-foreground">{caseData.subjective.history_of_present_illness.narrative}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {caseData.subjective.history_of_present_illness.onset && (
                    <div>
                      <p className="text-sm font-medium">Onset</p>
                      <p className="text-sm text-muted-foreground">{caseData.subjective.history_of_present_illness.onset}</p>
                    </div>
                  )}
                  {caseData.subjective.history_of_present_illness.duration && (
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{caseData.subjective.history_of_present_illness.duration}</p>
                    </div>
                  )}
                  {caseData.subjective.history_of_present_illness.severity && (
                    <div>
                      <p className="text-sm font-medium">Severity</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {caseData.subjective.history_of_present_illness.severity.description} ({caseData.subjective.history_of_present_illness.severity.scale}/10)
                      </p>
                    </div>
                  )}
                </div>
                {caseData.subjective.history_of_present_illness.character && (
                  <div>
                    <p className="text-sm font-medium mb-1">Character</p>
                    <p className="text-sm text-muted-foreground">{caseData.subjective.history_of_present_illness.character}</p>
                  </div>
                )}
                {caseData.subjective.history_of_present_illness.aggravating_factors?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Aggravating Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {caseData.subjective.history_of_present_illness.aggravating_factors.map((factor: string, i: number) => (
                        <Badge key={i} variant="outline">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {caseData.subjective.history_of_present_illness.alleviating_factors?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Alleviating Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {caseData.subjective.history_of_present_illness.alleviating_factors.map((factor: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-green-500/10">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Medications */}
          {caseData.subjective?.current_medications && caseData.subjective.current_medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.subjective.current_medications.map((med: any, i: number) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                          {med.indication && <p className="text-xs text-muted-foreground mt-1">For: {med.indication}</p>}
                        </div>
                        <Badge variant="outline" className="text-xs">{med.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Allergies */}
          {caseData.subjective?.allergies && caseData.subjective.allergies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {caseData.subjective.allergies.map((allergy: any, i: number) => (
                    <div key={i} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-700">{allergy.allergen_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{allergy.allergen_type} - {allergy.reaction_type}</p>
                        </div>
                        <Badge variant="destructive" className="text-xs capitalize">{allergy.severity}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Objective Tab */}
        <TabsContent value="objective" className="space-y-4">
          {/* Vital Signs */}
          {caseData.objective?.vital_signs && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {caseData.objective.vital_signs.systolic_bp > 0 && (
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-red-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Blood Pressure</p>
                        <p className="text-lg font-semibold">{caseData.objective.vital_signs.systolic_bp}/{caseData.objective.vital_signs.diastolic_bp}</p>
                        <p className="text-xs text-muted-foreground">mmHg</p>
                      </div>
                    </div>
                  )}
                  {caseData.objective.vital_signs.heart_rate > 0 && (
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-pink-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Heart Rate</p>
                        <p className="text-lg font-semibold">{caseData.objective.vital_signs.heart_rate}</p>
                        <p className="text-xs text-muted-foreground">bpm</p>
                      </div>
                    </div>
                  )}
                  {caseData.objective.vital_signs.temperature > 0 && (
                    <div className="flex items-start gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Temperature</p>
                        <p className="text-lg font-semibold">{caseData.objective.vital_signs.temperature}</p>
                        <p className="text-xs text-muted-foreground">°F</p>
                      </div>
                    </div>
                  )}
                  {caseData.objective.vital_signs.oxygen_saturation > 0 && (
                    <div className="flex items-start gap-2">
                      <Droplet className="w-4 h-4 text-blue-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">O2 Saturation</p>
                        <p className="text-lg font-semibold">{caseData.objective.vital_signs.oxygen_saturation}</p>
                        <p className="text-xs text-muted-foreground">%</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lab Results */}
          {caseData.objective?.lab_results && caseData.objective.lab_results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Laboratory Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.objective.lab_results.map((lab: any, i: number) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lab.test_name}</p>
                          <p className="text-sm text-muted-foreground">{lab.value} {lab.unit}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={lab.abnormal ? "destructive" : "outline"}>{lab.status}</Badge>
                          {lab.abnormal && <p className="text-xs text-red-600 mt-1">Abnormal</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4">
          {/* Clinical Impression */}
          {caseData.assessment?.clinical_impression && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Clinical Impression
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {caseData.assessment.clinical_impression.summary && (
                  <div>
                    <p className="text-sm font-medium mb-1">Summary</p>
                    <p className="text-muted-foreground">{caseData.assessment.clinical_impression.summary}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {caseData.assessment.clinical_impression.complexity_level && (
                    <div>
                      <p className="text-sm font-medium">Complexity</p>
                      <Badge variant="outline" className="capitalize mt-1">{caseData.assessment.clinical_impression.complexity_level}</Badge>
                    </div>
                  )}
                  {caseData.assessment.clinical_impression.diagnostic_certainty && (
                    <div>
                      <p className="text-sm font-medium">Diagnostic Certainty</p>
                      <Badge variant="outline" className="capitalize mt-1">{caseData.assessment.clinical_impression.diagnostic_certainty}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Problem List */}
          {caseData.assessment?.problem_list && caseData.assessment.problem_list.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Problem List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.assessment.problem_list.map((problem: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">#{problem.rank} - {problem.condition}</p>
                          <p className="text-sm text-muted-foreground capitalize">{problem.problem_type}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{problem.severity}</Badge>
                      </div>
                      {problem.clinical_reasoning && (
                        <p className="text-sm text-muted-foreground mt-2">{problem.clinical_reasoning}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          {/* Medications */}
          {caseData.plan?.medications && caseData.plan.medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Prescribed Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.plan.medications.map((med: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency} ({med.route})</p>
                          {med.indication && <p className="text-xs text-muted-foreground mt-1">For: {med.indication}</p>}
                        </div>
                        <Badge variant="outline">{med.status}</Badge>
                      </div>
                      {med.instructions && (
                        <p className="text-sm text-muted-foreground mt-2">{med.instructions}</p>
                      )}
                      {med.warnings && med.warnings.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                          <p className="text-xs font-medium text-yellow-700">Warnings:</p>
                          <ul className="text-xs text-yellow-700 list-disc list-inside">
                            {med.warnings.map((warning: string, j: number) => (
                              <li key={j}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up */}
          {caseData.plan?.follow_up && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Follow-up Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {caseData.plan.follow_up.follow_up_date && (
                    <div>
                      <p className="text-sm font-medium">Follow-up Date</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(caseData.plan.follow_up.follow_up_date), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                  {caseData.plan.follow_up.follow_up_type && (
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <Badge variant="outline" className="capitalize mt-1">{caseData.plan.follow_up.follow_up_type.replace('_', ' ')}</Badge>
                    </div>
                  )}
                </div>
                {caseData.plan.follow_up.follow_up_reason && (
                  <div>
                    <p className="text-sm font-medium mb-1">Reason</p>
                    <p className="text-sm text-muted-foreground">{caseData.plan.follow_up.follow_up_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Doctor Notes */}
      {caseData.doctor_notes && caseData.doctor_notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Doctor's Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {caseData.doctor_notes.map((note: any, i: number) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Dr. {note.doctor_name || 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(note.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  <p className="text-sm">{note.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
