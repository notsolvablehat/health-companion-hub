import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPatients } from '@/hooks/queries';
import { useCreateCase } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import type { CaseCreate } from '@/types/case';

const STEPS = ['Subjective', 'Objective', 'Assessment', 'Plan'];

export default function CreateCase() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { data: patientsData, isLoading: loadingPatients } = useMyPatients();
  const createCaseMutation = useCreateCase();

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [caseType, setCaseType] = useState<'initial' | 'follow_up' | 'urgent' | 'routine'>('routine');
  const [chiefComplaint, setChiefComplaint] = useState('');
  
  // Subjective
  const [subjectiveData, setSubjectiveData] = useState({
    history_of_present_illness: '',
    past_medical_history: '',
    current_medications: '',
    allergies: '',
    family_history: '',
    social_history: '',
    review_of_systems: '',
  });

  // Objective
  const [objectiveData, setObjectiveData] = useState({
    vital_signs: {
      systolic_bp: '',
      diastolic_bp: '',
      heart_rate: '',
      respiratory_rate: '',
      temperature: '',
      oxygen_saturation: '',
      weight: '',
      height: '',
    },
    physical_examination: '',
    lab_results: '',
    imaging_results: '',
  });

  // Assessment
  const [assessmentData, setAssessmentData] = useState({
    problem_list: '',
    differential_diagnoses: '',
    clinical_impression: '',
  });

  // Plan
  const [planData, setPlanData] = useState({
    diagnostic_plan: '',
    medications: '',
    non_pharmaceutical_interventions: '',
    procedures: '',
    patient_education: '',
    follow_up: '',
    referrals: '',
    disposition: '',
  });

  const patients = patientsData?.patients || [];

  const handleNext = () => {
    if (currentStep === 0 && !selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    if (currentStep === 0 && !chiefComplaint.trim()) {
      toast.error('Chief complaint is required');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const buildCasePayload = (): CaseCreate => {
    const payload: any = {
      patient_id: selectedPatientId,
      doctor_id: user?.id, // Add doctor_id from current user
      case_type: caseType,
      chief_complaint: chiefComplaint,
      subjective: {
        chief_complaint: chiefComplaint,
      },
    };

    // Add subjective fields
    if (subjectiveData.history_of_present_illness) {
      payload.subjective.history_of_present_illness = subjectiveData.history_of_present_illness;
    }
    if (subjectiveData.past_medical_history) {
      payload.subjective.past_medical_history = subjectiveData.past_medical_history.split('\n').filter(Boolean);
    }
    if (subjectiveData.current_medications) {
      payload.subjective.current_medications = subjectiveData.current_medications.split('\n').filter(Boolean);
    }
    if (subjectiveData.allergies) {
      payload.subjective.allergies = subjectiveData.allergies.split('\n').filter(Boolean);
    }
    if (subjectiveData.family_history) {
      payload.subjective.family_history = subjectiveData.family_history.split('\n').filter(Boolean);
    }
    if (subjectiveData.social_history) {
      payload.subjective.social_history = subjectiveData.social_history;
    }
    if (subjectiveData.review_of_systems) {
      try {
        payload.subjective.review_of_systems = JSON.parse(subjectiveData.review_of_systems);
      } catch {
        // If not valid JSON, store as string
      }
    }

    // Add objective fields
    const hasVitals = Object.values(objectiveData.vital_signs).some(v => v !== '');
    if (hasVitals) {
      payload.objective = {
        vital_signs: {},
      };
      Object.entries(objectiveData.vital_signs).forEach(([key, value]) => {
        if (value) {
          const numValue = parseFloat(value);
          payload.objective.vital_signs[key] = isNaN(numValue) ? value : numValue;
        }
      });
    }
    if (objectiveData.physical_examination) {
      if (!payload.objective) payload.objective = {};
      try {
        payload.objective.physical_examination = JSON.parse(objectiveData.physical_examination);
      } catch {
        payload.objective.physical_examination = { notes: objectiveData.physical_examination };
      }
    }
    if (objectiveData.lab_results) {
      if (!payload.objective) payload.objective = {};
      try {
        payload.objective.lab_results = JSON.parse(objectiveData.lab_results);
      } catch {
        // Skip if invalid JSON
      }
    }
    if (objectiveData.imaging_results) {
      if (!payload.objective) payload.objective = {};
      try {
        payload.objective.imaging_results = JSON.parse(objectiveData.imaging_results);
      } catch {
        // Skip if invalid JSON
      }
    }

    // Add assessment fields
    if (assessmentData.problem_list || assessmentData.differential_diagnoses || assessmentData.clinical_impression) {
      payload.assessment = {};
      if (assessmentData.problem_list) {
        try {
          payload.assessment.problem_list = JSON.parse(assessmentData.problem_list);
        } catch {
          // Skip if invalid JSON
        }
      }
      if (assessmentData.differential_diagnoses) {
        payload.assessment.differential_diagnoses = assessmentData.differential_diagnoses.split('\n').filter(Boolean);
      }
      if (assessmentData.clinical_impression) {
        payload.assessment.clinical_impression = assessmentData.clinical_impression;
      }
    }

    // Add plan fields
    if (Object.values(planData).some(v => v !== '')) {
      payload.plan = {};
      if (planData.diagnostic_plan) {
        payload.plan.diagnostic_plan = planData.diagnostic_plan.split('\n').filter(Boolean);
      }
      if (planData.medications) {
        try {
          payload.plan.medications = JSON.parse(planData.medications);
        } catch {
          // Skip if invalid JSON
        }
      }
      if (planData.non_pharmaceutical_interventions) {
        payload.plan.non_pharmaceutical_interventions = planData.non_pharmaceutical_interventions.split('\n').filter(Boolean);
      }
      if (planData.procedures) {
        payload.plan.procedures = planData.procedures.split('\n').filter(Boolean);
      }
      if (planData.patient_education) {
        payload.plan.patient_education = planData.patient_education;
      }
      if (planData.follow_up) {
        try {
          payload.plan.follow_up = JSON.parse(planData.follow_up);
        } catch {
          payload.plan.follow_up = { instructions: planData.follow_up };
        }
      }
      if (planData.referrals) {
        payload.plan.referrals = planData.referrals.split('\n').filter(Boolean);
      }
      if (planData.disposition) {
        payload.plan.disposition = planData.disposition;
      }
    }

    return payload as CaseCreate;
  };

  const handleSubmit = () => {
    const payload = buildCasePayload();
    
    createCaseMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success('Case created successfully');
        navigate(`/doctor/cases/${data.case_id}`);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.detail || 'Failed to create case');
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Subjective
        return (
          <div className="space-y-6">
            {/* Patient Selection */}
            <div>
              <Label htmlFor="patient" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Select Patient *
              </Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="patient" className="mt-2">
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPatients ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading patients...</div>
                  ) : patients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No patients assigned</div>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.patient_id} value={patient.patient_id}>
                        {patient.name || patient.patient_id} ({patient.email || patient.patient_id.substring(0, 8)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Case Type */}
            <div>
              <Label htmlFor="caseType">Case Type</Label>
              <Select value={caseType} onValueChange={(v: any) => setCaseType(v)}>
                <SelectTrigger id="caseType" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chief Complaint */}
            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <Input
                id="chiefComplaint"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Brief description of patient's main concern"
                className="mt-2"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Subjective Information (Optional)</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hpi">History of Present Illness</Label>
                  <Textarea
                    id="hpi"
                    value={subjectiveData.history_of_present_illness}
                    onChange={(e) => setSubjectiveData({ ...subjectiveData, history_of_present_illness: e.target.value })}
                    placeholder="Detailed description of the illness progression..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="pmh">Past Medical History</Label>
                  <Textarea
                    id="pmh"
                    value={subjectiveData.past_medical_history}
                    onChange={(e) => setSubjectiveData({ ...subjectiveData, past_medical_history: e.target.value })}
                    placeholder="One condition per line&#10;e.g., Diabetes mellitus&#10;Hypertension"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={subjectiveData.current_medications}
                    onChange={(e) => setSubjectiveData({ ...subjectiveData, current_medications: e.target.value })}
                    placeholder="One medication per line&#10;e.g., Metformin 500mg twice daily&#10;Lisinopril 10mg once daily"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={subjectiveData.allergies}
                    onChange={(e) => setSubjectiveData({ ...subjectiveData, allergies: e.target.value })}
                    placeholder="One allergy per line&#10;e.g., Penicillin - rash&#10;Peanuts - anaphylaxis"
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="familyHistory">Family History</Label>
                  <Textarea
                    id="familyHistory"
                    value={subjectiveData.family_history}
                    onChange={(e) => setSubjectiveData({ ...subjectiveData, family_history: e.target.value })}
                    placeholder="One entry per line&#10;e.g., Father - Coronary artery disease&#10;Mother - Type 2 diabetes"
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="socialHistory">Social History</Label>
                  <Textarea
                    id="socialHistory"
                    value={subjectiveData.social_history}
                    onChange={(e) => setSubjectiveData({ ...subjectiveData, social_history: e.target.value })}
                    placeholder="Occupation, smoking status, alcohol use, living situation..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Objective
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Vital Signs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="systolic">BP Systolic</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={objectiveData.vital_signs.systolic_bp}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, systolic_bp: e.target.value }
                    })}
                    placeholder="mmHg"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">BP Diastolic</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={objectiveData.vital_signs.diastolic_bp}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, diastolic_bp: e.target.value }
                    })}
                    placeholder="mmHg"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate">Heart Rate</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={objectiveData.vital_signs.heart_rate}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, heart_rate: e.target.value }
                    })}
                    placeholder="bpm"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="respRate">Respiratory Rate</Label>
                  <Input
                    id="respRate"
                    type="number"
                    value={objectiveData.vital_signs.respiratory_rate}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, respiratory_rate: e.target.value }
                    })}
                    placeholder="bpm"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="temp">Temperature</Label>
                  <Input
                    id="temp"
                    type="number"
                    step="0.1"
                    value={objectiveData.vital_signs.temperature}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, temperature: e.target.value }
                    })}
                    placeholder="°C"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="o2sat">O2 Saturation</Label>
                  <Input
                    id="o2sat"
                    type="number"
                    value={objectiveData.vital_signs.oxygen_saturation}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, oxygen_saturation: e.target.value }
                    })}
                    placeholder="%"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={objectiveData.vital_signs.weight}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, weight: e.target.value }
                    })}
                    placeholder="kg"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={objectiveData.vital_signs.height}
                    onChange={(e) => setObjectiveData({
                      ...objectiveData,
                      vital_signs: { ...objectiveData.vital_signs, height: e.target.value }
                    })}
                    placeholder="cm"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="physicalExam">Physical Examination</Label>
              <Textarea
                id="physicalExam"
                value={objectiveData.physical_examination}
                onChange={(e) => setObjectiveData({ ...objectiveData, physical_examination: e.target.value })}
                placeholder="General appearance, cardiovascular, respiratory, abdomen, etc..."
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: You can also enter JSON format for structured data
              </p>
            </div>

            <div>
              <Label htmlFor="labResults">Lab Results (JSON format)</Label>
              <Textarea
                id="labResults"
                value={objectiveData.lab_results}
                onChange={(e) => setObjectiveData({ ...objectiveData, lab_results: e.target.value })}
                placeholder='[{"test_name": "HbA1c", "value": "6.5", "unit": "%"}]'
                rows={3}
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="imagingResults">Imaging Results (JSON format)</Label>
              <Textarea
                id="imagingResults"
                value={objectiveData.imaging_results}
                onChange={(e) => setObjectiveData({ ...objectiveData, imaging_results: e.target.value })}
                placeholder='[{"modality": "X-ray", "body_part": "Chest", "impression": "Clear lungs"}]'
                rows={3}
                className="mt-2 font-mono text-sm"
              />
            </div>
          </div>
        );

      case 2: // Assessment
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="problemList">Problem List (JSON format)</Label>
              <Textarea
                id="problemList"
                value={assessmentData.problem_list}
                onChange={(e) => setAssessmentData({ ...assessmentData, problem_list: e.target.value })}
                placeholder='[{"diagnosis": "Type 2 Diabetes", "code": "E11", "status": "active"}]'
                rows={4}
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="differentialDx">Differential Diagnoses</Label>
              <Textarea
                id="differentialDx"
                value={assessmentData.differential_diagnoses}
                onChange={(e) => setAssessmentData({ ...assessmentData, differential_diagnoses: e.target.value })}
                placeholder="One diagnosis per line&#10;e.g., Gastroesophageal reflux disease&#10;Acute coronary syndrome (ruled out)"
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="clinicalImpression">Clinical Impression</Label>
              <Textarea
                id="clinicalImpression"
                value={assessmentData.clinical_impression}
                onChange={(e) => setAssessmentData({ ...assessmentData, clinical_impression: e.target.value })}
                placeholder="Overall clinical summary and diagnostic certainty..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 3: // Plan
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="diagnosticPlan">Diagnostic Plan</Label>
              <Textarea
                id="diagnosticPlan"
                value={planData.diagnostic_plan}
                onChange={(e) => setPlanData({ ...planData, diagnostic_plan: e.target.value })}
                placeholder="One test per line&#10;e.g., Fasting blood glucose&#10;Lipid profile"
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="medications">Medications (JSON format)</Label>
              <Textarea
                id="medications"
                value={planData.medications}
                onChange={(e) => setPlanData({ ...planData, medications: e.target.value })}
                placeholder='[{"drug_name": "Metformin", "dosage": "500mg", "frequency": "twice daily", "duration": "3 months"}]'
                rows={4}
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="interventions">Non-Pharmaceutical Interventions</Label>
              <Textarea
                id="interventions"
                value={planData.non_pharmaceutical_interventions}
                onChange={(e) => setPlanData({ ...planData, non_pharmaceutical_interventions: e.target.value })}
                placeholder="One intervention per line&#10;e.g., Dietary modifications&#10;Exercise 30 min daily"
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="patientEducation">Patient Education</Label>
              <Textarea
                id="patientEducation"
                value={planData.patient_education}
                onChange={(e) => setPlanData({ ...planData, patient_education: e.target.value })}
                placeholder="Topics discussed, understanding level, materials provided..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="followUp">Follow-up Instructions</Label>
              <Textarea
                id="followUp"
                value={planData.follow_up}
                onChange={(e) => setPlanData({ ...planData, follow_up: e.target.value })}
                placeholder="Follow-up in 2 weeks or JSON: {&quot;date&quot;: &quot;2026-02-01&quot;, &quot;instructions&quot;: &quot;Review labs&quot;}"
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="referrals">Referrals</Label>
              <Textarea
                id="referrals"
                value={planData.referrals}
                onChange={(e) => setPlanData({ ...planData, referrals: e.target.value })}
                placeholder="One referral per line&#10;e.g., Cardiology consult&#10;Nutritionist"
                rows={2}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="disposition">Disposition</Label>
              <Input
                id="disposition"
                value={planData.disposition}
                onChange={(e) => setPlanData({ ...planData, disposition: e.target.value })}
                placeholder="e.g., Discharge to home, Admit to hospital"
                className="mt-2"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/cases')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Case</h1>
          <p className="text-muted-foreground">Document patient encounter using SOAP format</p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index === currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : index < currentStep
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <div className="ml-3">
                  <p className={`font-medium ${index === currentStep ? 'text-primary' : ''}`}>
                    {step}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createCaseMutation.isPending || !selectedPatientId || !chiefComplaint}
            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
          >
            {createCaseMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Case
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
