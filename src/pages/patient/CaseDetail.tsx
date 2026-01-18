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
  TrendingUp,
  ClipboardList,
  Users
} from 'lucide-react';
import { useCase } from '@/hooks/queries';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseBackendDate } from '@/lib/utils';

export default function PatientCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();

  const { data: caseData, isLoading, error } = useCase(caseId);

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
      case 'under_review': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'approved_by_doctor': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'closed': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ').toUpperCase();

  const safeRender = (value: any) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return JSON.stringify(value);
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
          {formatStatus(caseData.status)}
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
                  {parseBackendDate(caseData.created_at) ? format(parseBackendDate(caseData.created_at)!, 'MMM dd, yyyy') : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                   {parseBackendDate(caseData.created_at) ? formatDistanceToNow(parseBackendDate(caseData.created_at)!, { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Case Type</p>
                <p className="text-sm text-muted-foreground capitalize">{caseData.case_type || 'General'}</p>
              </div>
            </div>
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

        <TabsContent value="subjective" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                History & Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-1">Chief Complaint</h4>
                    <p className="text-muted-foreground">{safeRender(caseData.subjective?.chief_complaint)}</p>
                </div>
                {caseData.subjective?.history_of_present_illness && (
                    <div>
                        <h4 className="font-semibold text-sm mb-1">History of Present Illness</h4>
                        {typeof caseData.subjective.history_of_present_illness === 'string' ? (
                            <p className="text-muted-foreground">{caseData.subjective.history_of_present_illness}</p>
                        ) : (
                            <div className="space-y-3 bg-muted/30 p-3 rounded-md border">
                                {(caseData.subjective.history_of_present_illness as any).narrative && (
                                    <p className="text-sm text-muted-foreground">{(caseData.subjective.history_of_present_illness as any).narrative}</p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(caseData.subjective.history_of_present_illness as any).onset && (
                                        <div>
                                            <p className="text-xs font-semibold">Onset:</p>
                                            <p className="text-sm text-muted-foreground">{safeRender((caseData.subjective.history_of_present_illness as any).onset)}</p>
                                        </div>
                                    )}
                                    {(caseData.subjective.history_of_present_illness as any).duration && (
                                        <div>
                                            <p className="text-xs font-semibold">Duration:</p>
                                            <p className="text-sm text-muted-foreground">{safeRender((caseData.subjective.history_of_present_illness as any).duration)}</p>
                                        </div>
                                    )}
                                    {(caseData.subjective.history_of_present_illness as any).severity && (
                                        <div>
                                            <p className="text-xs font-semibold">Severity:</p>
                                            {typeof (caseData.subjective.history_of_present_illness as any).severity === 'object' ? (
                                                <div className="text-sm text-muted-foreground">
                                                    {(caseData.subjective.history_of_present_illness as any).severity.description && (
                                                        <span className="capitalize">{(caseData.subjective.history_of_present_illness as any).severity.description}</span>
                                                    )}
                                                    {(caseData.subjective.history_of_present_illness as any).severity.scale && (
                                                        <span className="ml-2">({(caseData.subjective.history_of_present_illness as any).severity.scale}/10)</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">{safeRender((caseData.subjective.history_of_present_illness as any).severity)}</p>
                                            )}
                                        </div>
                                    )}
                                    {(caseData.subjective.history_of_present_illness as any).character && (
                                        <div>
                                            <p className="text-xs font-semibold">Character:</p>
                                            <p className="text-sm text-muted-foreground">{(caseData.subjective.history_of_present_illness as any).character}</p>
                                        </div>
                                    )}
                                    {(caseData.subjective.history_of_present_illness as any).functional_status && (
                                        <div>
                                            <p className="text-xs font-semibold">Functional Status:</p>
                                            <p className="text-sm text-muted-foreground">{(caseData.subjective.history_of_present_illness as any).functional_status}</p>
                                        </div>
                                    )}
                                </div>
                                {(caseData.subjective.history_of_present_illness as any).aggravating_factors && Array.isArray((caseData.subjective.history_of_present_illness as any).aggravating_factors) && (caseData.subjective.history_of_present_illness as any).aggravating_factors.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold mb-1">Aggravating Factors:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(caseData.subjective.history_of_present_illness as any).aggravating_factors.map((factor: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs">{factor}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(caseData.subjective.history_of_present_illness as any).alleviating_factors && Array.isArray((caseData.subjective.history_of_present_illness as any).alleviating_factors) && (caseData.subjective.history_of_present_illness as any).alleviating_factors.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold mb-1">Alleviating Factors:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(caseData.subjective.history_of_present_illness as any).alleviating_factors.map((factor: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{factor}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(caseData.subjective.history_of_present_illness as any).associated_symptoms && Array.isArray((caseData.subjective.history_of_present_illness as any).associated_symptoms) && (caseData.subjective.history_of_present_illness as any).associated_symptoms.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold mb-2">Associated Symptoms:</p>
                                        <div className="space-y-2">
                                            {(caseData.subjective.history_of_present_illness as any).associated_symptoms.map((symptom: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                    <span className="text-sm font-medium">{symptom.symptom || safeRender(symptom)}</span>
                                                    {symptom.severity && (
                                                        <span className="text-xs text-muted-foreground">Severity: {symptom.severity}/10</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {caseData.subjective?.past_medical_history && caseData.subjective.past_medical_history.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-sm mb-1">Past Medical History</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                            {caseData.subjective.past_medical_history.map((item, i) => (
                                <li key={i}>
                                    {typeof item === 'string' ? item : safeRender((item as any)?.condition || item)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {caseData.subjective?.current_medications && caseData.subjective.current_medications.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-sm mb-1">Current Medications</h4>
                        <div className="space-y-2">
                            {caseData.subjective.current_medications.map((item, i) => {
                                // Check if item is an object with medication details
                                if (typeof item === 'object' && item !== null && (item as any).name) {
                                    const med = item as any;
                                    return (
                                        <div key={i} className="p-3 bg-muted/30 rounded-md border">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-sm">{med.name}</h5>
                                                    {med.indication && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">For: {med.indication}</p>
                                                    )}
                                                </div>
                                                {med.status && (
                                                    <Badge 
                                                        variant={med.status === 'active' ? 'default' : 'secondary'}
                                                        className="text-xs capitalize"
                                                    >
                                                        {med.status}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                                {med.dosage && (
                                                    <div>
                                                        <span className="text-muted-foreground">Dosage:</span>
                                                        <span className="ml-1 font-medium">{med.dosage}</span>
                                                    </div>
                                                )}
                                                {med.frequency && (
                                                    <div>
                                                        <span className="text-muted-foreground">Frequency:</span>
                                                        <span className="ml-1 font-medium">{med.frequency}</span>
                                                    </div>
                                                )}
                                                {med.duration && (
                                                    <div>
                                                        <span className="text-muted-foreground">Duration:</span>
                                                        <span className="ml-1 font-medium">{med.duration}</span>
                                                    </div>
                                                )}
                                                {med.rxnorm_code && (
                                                    <div className="col-span-2 md:col-span-3">
                                                        <span className="text-muted-foreground">RxNorm Code:</span>
                                                        <span className="ml-1 font-mono text-xs">{med.rxnorm_code}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                // Fallback for simple string format
                                return (
                                    <div key={i} className="p-2 bg-muted/30 rounded-md border">
                                        <p className="text-sm">{typeof item === 'string' ? item : safeRender((item as any)?.medication || item)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                 {caseData.subjective?.allergies && caseData.subjective.allergies.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-sm mb-1 text-red-600">Allergies</h4>
                         <ul className="space-y-2 mt-2">
                            {caseData.subjective.allergies.map((item, i) => (
                                <li key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-muted/30 p-2 rounded">
                                    {/* Handle both object and string formats defensively */}
                                    {typeof item === 'string' ? (
                                        <span className="font-medium">{item}</span>
                                    ) : (
                                        <>
                                            <span className="font-medium">
                                                {safeRender(item.allergen_name || 'Unknown')} 
                                                {item.allergen_type && <span className="text-xs text-muted-foreground ml-1">({safeRender(item.allergen_type)})</span>}
                                            </span>
                                            <span className="text-sm text-red-600 capitalize">
                                                {safeRender(item.severity)} {item.reaction_type && `- ${safeRender(item.reaction_type)}`}
                                            </span>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objective" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Vitals & Findings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {caseData.objective?.vital_signs ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {Object.entries(caseData.objective.vital_signs).map(([key, val]) => (
                                 <div key={key} className="p-3 bg-muted/30 rounded-lg">
                                     <p className="text-xs text-muted-foreground uppercase">{key.replace(/_/g, ' ')}</p>
                                     <p className="font-semibold">{val}</p>
                                 </div>
                             ))}
                        </div>
                    ) : <p className="text-muted-foreground">No vital signs recorded.</p>}

                     {caseData.objective?.physical_examination && (
                         <div>
                            <h4 className="font-semibold text-sm mb-2">Physical Examination</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(caseData.objective.physical_examination).map(([system, finding]) => (
                                    <div key={system} className="border p-3 rounded-md">
                                        <p className="text-xs font-semibold uppercase text-primary">{system}</p>
                                        <p className="text-sm">{safeRender(finding)}</p>
                                    </div>
                                ))}
                             </div>
                         </div>
                     )}

                     {caseData.objective?.lab_results && caseData.objective.lab_results.length > 0 && (
                         <div>
                            <h4 className="font-semibold text-sm mb-2">Lab Results</h4>
                            <div className="space-y-2">
                                {caseData.objective.lab_results.map((lab, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                                        <span>{lab.test_name}</span>
                                        <span className="font-mono text-sm">{lab.value} {lab.unit}</span>
                                    </div>
                                ))}
                            </div>
                         </div>
                     )}
                </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Clinical Assessment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {caseData.assessment?.clinical_impression && (
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Clinical Impression</h4>
                            {typeof caseData.assessment.clinical_impression === 'string' ? (
                                <p className="text-muted-foreground">{caseData.assessment.clinical_impression}</p>
                            ) : (
                                <div className="space-y-3 bg-muted/30 p-3 rounded-md border">
                                    {(caseData.assessment.clinical_impression as any).summary && (caseData.assessment.clinical_impression as any).summary !== '' && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Summary:</p>
                                            <p className="text-sm text-muted-foreground">{(caseData.assessment.clinical_impression as any).summary}</p>
                                        </div>
                                    )}
                                    {(caseData.assessment.clinical_impression as any).complexity_level && (caseData.assessment.clinical_impression as any).complexity_level !== '' && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Complexity Level:</p>
                                            <Badge variant="secondary" className="capitalize">{(caseData.assessment.clinical_impression as any).complexity_level}</Badge>
                                        </div>
                                    )}
                                    {(caseData.assessment.clinical_impression as any).diagnostic_certainty && (caseData.assessment.clinical_impression as any).diagnostic_certainty !== '' && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Diagnostic Certainty:</p>
                                            <Badge variant="secondary" className="capitalize">{(caseData.assessment.clinical_impression as any).diagnostic_certainty}</Badge>
                                        </div>
                                    )}
                                    {(caseData.assessment.clinical_impression as any).main_concerns && Array.isArray((caseData.assessment.clinical_impression as any).main_concerns) && (caseData.assessment.clinical_impression as any).main_concerns.filter((c: any) => c && safeRender(c) !== '').length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Main Concerns:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {(caseData.assessment.clinical_impression as any).main_concerns.filter((c: any) => c && safeRender(c) !== '').map((concern: any, i: number) => (
                                                    <li key={i} className="text-sm text-muted-foreground">{safeRender(concern)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(caseData.assessment.clinical_impression as any).key_findings && Array.isArray((caseData.assessment.clinical_impression as any).key_findings) && (caseData.assessment.clinical_impression as any).key_findings.filter((f: any) => f && safeRender(f) !== '').length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Key Findings:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {(caseData.assessment.clinical_impression as any).key_findings.filter((f: any) => f && safeRender(f) !== '').map((finding: any, i: number) => (
                                                    <li key={i} className="text-sm text-muted-foreground">{safeRender(finding)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {caseData.assessment?.problem_list && caseData.assessment.problem_list.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Problem List</h4>
                            <div className="space-y-2">
                                {caseData.assessment.problem_list.map((problem, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${problem.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span>{problem.diagnosis}</span>
                                        {problem.code && <Badge variant="outline" className="text-xs">{problem.code}</Badge>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Care Plan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {caseData.plan?.medications && caseData.plan.medications.length > 0 && (
                        <div>
                             <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Pill className="w-3 h-3" /> Medications
                             </h4>
                             <div className="space-y-3">
                                {caseData.plan.medications.map((med, i) => (
                                    <div key={i} className="p-3 border rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{med.drug_name}</span>
                                            <span className="text-sm text-muted-foreground">{med.dosage}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{med.frequency} • {med.duration} • {med.instructions}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    {caseData.plan?.patient_education && (
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Patient Education</h4>
                            {typeof caseData.plan.patient_education === 'string' ? (
                                <p className="text-muted-foreground bg-muted/30 p-3 rounded-md border">
                                    {caseData.plan.patient_education}
                                </p>
                            ) : (
                                <div className="space-y-3 bg-muted/30 p-3 rounded-md border">
                                    {caseData.plan.patient_education.topics && Array.isArray(caseData.plan.patient_education.topics) && caseData.plan.patient_education.topics.filter(t => t && safeRender(t) !== '').length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Topics Covered:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {caseData.plan.patient_education.topics.filter(t => t && safeRender(t) !== '').map((topic, i) => (
                                                    <li key={i} className="text-sm text-muted-foreground">{safeRender(topic)}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {caseData.plan.patient_education.education_provided && caseData.plan.patient_education.education_provided !== '' && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Education Provided:</p>
                                            <p className="text-sm text-muted-foreground">{caseData.plan.patient_education.education_provided}</p>
                                        </div>
                                    )}
                                    {caseData.plan.patient_education.patient_understanding && caseData.plan.patient_education.patient_understanding !== '' && (
                                        <div>
                                            <p className="text-xs font-semibold mb-1">Patient Understanding:</p>
                                            <p className="text-sm text-muted-foreground">{caseData.plan.patient_education.patient_understanding}</p>
                                        </div>
                                    )}
                                    {caseData.plan.patient_education.education_materials && (
                                        Array.isArray(caseData.plan.patient_education.education_materials) ? (
                                            caseData.plan.patient_education.education_materials.filter(m => m && safeRender(m) !== '').length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold mb-1">Materials:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {caseData.plan.patient_education.education_materials.filter(m => m && safeRender(m) !== '').map((material, i) => {
                                                            // Check if material is an object
                                                            if (typeof material === 'object' && material !== null) {
                                                                return (
                                                                    <li key={i} className="text-sm">
                                                                        <div className="space-y-1 ml-2">
                                                                            {Object.entries(material).map(([key, value]) => (
                                                                                value && value !== '' && (
                                                                                    <div key={key} className="flex gap-2">
                                                                                        <span className="font-medium text-muted-foreground">{key}:</span>
                                                                                        <span className="text-muted-foreground">{safeRender(value)}</span>
                                                                                    </div>
                                                                                )
                                                                            ))}
                                                                        </div>
                                                                    </li>
                                                                );
                                                            }
                                                            return <li key={i} className="text-sm text-muted-foreground">{safeRender(material)}</li>;
                                                        })}
                                                    </ul>
                                                </div>
                                            )
                                        ) : typeof caseData.plan.patient_education.education_materials === 'object' ? (
                                            Object.entries(caseData.plan.patient_education.education_materials).filter(([_, v]) => v && safeRender(v) !== '').length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold mb-1">Materials:</p>
                                                    <div className="space-y-2 ml-4">
                                                        {Object.entries(caseData.plan.patient_education.education_materials).filter(([_, v]) => v && safeRender(v) !== '').map(([key, value]) => (
                                                            <div key={key} className="flex gap-2">
                                                                <span className="font-medium text-sm">{key}:</span>
                                                                <span className="text-sm text-muted-foreground">{safeRender(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ) : null
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                     {caseData.plan?.follow_up && (
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Follow Up</h4>
                             <div className="flex gap-4">
                                {caseData.plan.follow_up.date && parseBackendDate(caseData.plan.follow_up.date) && <Badge variant="secondary">Date: {format(parseBackendDate(caseData.plan.follow_up.date)!, 'MMM dd, yyyy')}</Badge>}
                                {caseData.plan.follow_up.type && <Badge variant="outline">{caseData.plan.follow_up.type}</Badge>}
                             </div>
                             {caseData.plan.follow_up.instructions && <p className="text-sm mt-2 text-muted-foreground">{caseData.plan.follow_up.instructions}</p>}
                        </div>
                    )}
                </CardContent>
             </Card>
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
              {caseData.doctor_notes.map((note, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Doctor Note ({note.note_type})</span>
                    <span className="text-xs text-muted-foreground">{parseBackendDate(note.created_at) ? format(parseBackendDate(note.created_at)!, 'MMM dd, yyyy') : 'Unknown'}</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
