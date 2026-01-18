import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Edit2, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useCase, useUpdateCase } from '@/hooks/queries';
import { format } from 'date-fns';
import { parseBackendDate } from '@/lib/utils';
import { toast } from 'sonner';

// Fields that should NOT be editable
const NON_EDITABLE_FIELDS = [
  'case_id',
  'patient_id',
  'doctor_id',
  'created_at',
  'updated_at',
  'status',
  'audit_trail',
];

// Enum field definitions
const ENUM_FIELDS: Record<string, string[]> = {
  'severity': ['critical', 'high', 'moderate', 'low'],
  'case_type': ['initial', 'follow_up', 'urgent', 'routine'],
  'smoking_status': ['never', 'former', 'current'],
  'alcohol_use': ['none', 'occasional', 'regular', 'heavy'],
  'drug_use': ['none', 'former', 'current'],
  'frequency': ['once daily', 'twice daily', 'three times daily', 'four times daily', 'as needed'],
  'route': ['oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhalation', 'rectal'],
  'allergen_type': ['drug', 'food', 'environmental', 'other'],
  'relative': ['mother', 'father', 'sibling', 'grandparent', 'other'],
  'problem_type': ['diagnosis', 'symptom', 'risk_factor'],
  'status': ['active', 'resolved', 'chronic', 'acute', 'suspected', 'alive', 'deceased'],
  'confidence': ['high', 'medium', 'low'],
  'likelihood': ['high', 'medium', 'low'],
  'complexity_level': ['straightforward', 'moderate', 'complex'],
  'diagnostic_certainty': ['high', 'medium', 'low'],
  'priority': ['routine', 'urgent', 'stat'],
  'patient_understanding': ['poor', 'fair', 'good', 'excellent'],
  'follow_up_type': ['in_person', 'telemedicine', 'phone'],
  'follow_up_with': ['same_doctor', 'specialist', 'other'],
  'urgency': ['routine', 'urgent', 'emergent'],
  'disposition': ['discharge', 'admit', 'transfer', 'observation'],
};

// Define complex field schemas that must maintain their structure
const COMPLEX_FIELD_SCHEMAS: Record<string, any> = {
  'social_history': {
    type: 'object',
    fields: {
      occupation: 'string',
      smoking_status: 'enum',
      pack_years: 'number',
      alcohol_use: 'enum',
      drug_use: 'enum',
      living_status: 'string',
    }
  },
  'vital_signs': {
    type: 'object',
    fields: {
      recorded_at: 'string',
      systolic_bp: 'number',
      diastolic_bp: 'number',
      heart_rate: 'number',
      respiratory_rate: 'number',
      temperature: 'number',
      oxygen_saturation: 'number',
      weight: 'number',
      height: 'number',
      bmi: 'number',
    }
  },
  'history_of_present_illness': {
    type: 'object',
    fields: {
      narrative: 'string',
      onset: 'string',
      duration: 'string',
      character: 'string',
      severity: 'severity_object',
      aggravating_factors: 'string_array',
      alleviating_factors: 'string_array',
      associated_symptoms: 'symptom_array',
      functional_status: 'string',
    }
  },
  'clinical_impression': {
    type: 'object',
    fields: {
      summary: 'string',
      complexity_level: 'enum',
      diagnostic_certainty: 'enum',
      main_concerns: 'array',
      key_findings: 'array',
    }
  },
  'patient_education': {
    type: 'object',
    fields: {
      topics: 'array',
      education_provided: 'string',
      patient_understanding: 'enum',
      education_materials: 'array',
    }
  },
  'follow_up': {
    type: 'object',
    fields: {
      schedule_follow_up: 'boolean',
      follow_up_date: 'string',
      follow_up_type: 'enum',
      follow_up_with: 'enum',
      follow_up_reason: 'string',
      urgent_return_criteria: 'string',
    }
  },
  'disposition': {
    type: 'object',
    fields: {
      disposition: 'enum',
      disposition_location: 'string',
      discharge_date_time: 'string',
      discharge_instructions: 'string',
      restrictions: 'string',
    }
  },
};

// Fields that are simple strings/text (not requiring object structure)
const STRING_FIELDS = [
  'chief_complaint',
  'past_medical_history',
  'current_medications',
  'allergies',
  'family_history',
  'review_of_systems',
  'physical_examination',
  'lab_results',
  'imaging_results',
  'problem_list',
  'differential_diagnoses',
  'diagnostic_plan',
  'medications',
  'non_pharmaceutical_interventions',
  'procedures',
  'referrals',
];

export default function CaseFullData() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');

  const { data: caseData, isLoading, error } = useCase(caseId);
  const updateCaseMutation = useUpdateCase(caseId!);

  const isFieldEditable = (fieldPath: string) => {
    return !NON_EDITABLE_FIELDS.some(nonEditableField => fieldPath.includes(nonEditableField));
  };

  const getEnumOptions = (fieldPath: string): string[] | null => {
    const fieldName = fieldPath.split('.').pop() || '';
    return ENUM_FIELDS[fieldName] || null;
  };

  const isComplexField = (fieldPath: string): boolean => {
    const fieldName = fieldPath.split('.').pop() || '';
    return !!COMPLEX_FIELD_SCHEMAS[fieldName];
  };

  const isStringField = (fieldPath: string): boolean => {
    const fieldName = fieldPath.split('.').pop() || '';
    return STRING_FIELDS.includes(fieldName);
  };

  const getFieldSchema = (fieldPath: string) => {
    const fieldName = fieldPath.split('.').pop() || '';
    return COMPLEX_FIELD_SCHEMAS[fieldName];
  };

  const startEdit = (fieldPath: string, currentValue: any) => {
    if (!isFieldEditable(fieldPath)) return;
    setEditingField(fieldPath);
    
    // For complex fields, initialize with proper structure
    if (isComplexField(fieldPath)) {
      const schema = getFieldSchema(fieldPath);
      if (currentValue && typeof currentValue === 'object') {
        setEditValue(currentValue);
      } else {
        // Initialize with empty object with schema fields
        const emptyObj: any = {};
        if (schema?.fields) {
          Object.keys(schema.fields).forEach(key => {
            emptyObj[key] = '';
          });
        }
        setEditValue(emptyObj);
      }
    } else if (isStringField(fieldPath)) {
      // For fields that should remain as strings
      setEditValue(typeof currentValue === 'string' ? currentValue : '');
    } else {
      setEditValue(typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const cleanupValue = (value: any): any => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const cleaned: any = {};
      for (const key in value) {
        const cleanedVal = cleanupValue(value[key]);
        if (cleanedVal !== null) {
          cleaned[key] = cleanedVal;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }
    if (Array.isArray(value)) {
      const cleaned = value.map(cleanupValue).filter(v => v !== null);
      return cleaned.length > 0 ? cleaned : [];
    }
    return value;
  };

  const saveEdit = (fieldPath: string) => {
    const pathParts = fieldPath.split('.');
    const updatePayload: any = {};
    
    let current = updatePayload;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current[pathParts[i]] = {};
      current = current[pathParts[i]];
    }
    
    // Handle value based on field type
    let valueToSave = editValue;
    
    if (isComplexField(fieldPath)) {
      // Complex fields keep their object structure, but clean up empty values
      valueToSave = cleanupValue(editValue);
    } else if (isStringField(fieldPath)) {
      // String fields remain as strings
      valueToSave = String(editValue);
    } else if (typeof editValue === 'string' && (editValue.startsWith('{') || editValue.startsWith('['))) {
      // Try to parse JSON for other fields
      try {
        valueToSave = JSON.parse(editValue);
      } catch {
        // Keep as string if JSON parse fails
      }
    }
    
    current[pathParts[pathParts.length - 1]] = valueToSave;

    updateCaseMutation.mutate(updatePayload, {
      onSuccess: () => {
        toast.success('Field updated successfully');
        cancelEdit();
      },
      onError: (error: any) => {
        const errorMsg = error?.response?.data?.detail?.[0]?.msg || error?.response?.data?.detail || 'Failed to update field';
        toast.error(errorMsg);
      }
    });
  };

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? `${value.length} items` : 'Empty array';
      }
      return 'Object';
    }
    return String(value);
  };

  const renderComplexFieldEditor = (fieldPath: string, schema: any) => {
    const currentValue = editValue || {};
    
    return (
      <div className="space-y-3 mt-2">
        {Object.entries(schema.fields).map(([fieldKey, fieldType]: [string, any]) => {
          const enumOptions = ENUM_FIELDS[fieldKey];
          const fieldValue = currentValue[fieldKey];
          const displayValue = fieldValue === null || fieldValue === undefined ? '' : fieldValue;
          
          return (
            <div key={fieldKey}>
              <Label className="text-xs capitalize">{fieldKey.replace(/_/g, ' ')}</Label>
              {enumOptions ? (
                <Select 
                  value={displayValue ? String(displayValue) : 'none'} 
                  onValueChange={(val) => setEditValue({ ...currentValue, [fieldKey]: val === 'none' ? null : val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={`Select ${fieldKey.replace(/_/g, ' ')}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {enumOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : fieldType === 'boolean' ? (
                <Select 
                  value={fieldValue === true ? 'true' : fieldValue === false ? 'false' : 'none'} 
                  onValueChange={(val) => setEditValue({ ...currentValue, [fieldKey]: val === 'none' ? null : val === 'true' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : fieldType === 'number' ? (
                <Input
                  type="number"
                  value={displayValue}
                  onChange={(e) => setEditValue({ ...currentValue, [fieldKey]: e.target.value ? Number(e.target.value) : null })}
                  className="mt-1"
                  placeholder={fieldKey.replace(/_/g, ' ')}
                />
              ) : fieldType === 'string_array' ? (
                <Textarea
                  value={Array.isArray(fieldValue) ? fieldValue.join(', ') : ''}
                  onChange={(e) => {
                    const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                    setEditValue({ ...currentValue, [fieldKey]: values.length > 0 ? values : [] });
                  }}
                  placeholder="Enter comma-separated values (e.g., value1, value2, value3)"
                  rows={2}
                  className="mt-1"
                />
              ) : fieldType === 'symptom_array' ? (
                <div className="space-y-2 mt-1">
                  <p className="text-xs text-muted-foreground">Add symptoms (one per line, format: symptom | severity | duration)</p>
                  <Textarea
                    value={Array.isArray(fieldValue) ? fieldValue.map((s: any) => `${s.symptom || ''} | ${s.severity || ''} | ${s.duration || ''}`).join('\n') : ''}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter(Boolean);
                      const symptoms = lines.map(line => {
                        const parts = line.split('|').map(p => p.trim());
                        return {
                          symptom: parts[0] || '',
                          severity: parts[1] ? Number(parts[1]) : null,
                          duration: parts[2] || ''
                        };
                      }).filter(s => s.symptom);
                      setEditValue({ ...currentValue, [fieldKey]: symptoms.length > 0 ? symptoms : [] });
                    }}
                    placeholder="headache | 7 | 2 days\nnausea | 5 | 1 day"
                    rows={3}
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              ) : fieldType === 'severity_object' ? (
                <div className="space-y-2 mt-1">
                  <div>
                    <Label className="text-xs">Scale (0-10)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={fieldValue?.scale || ''}
                      onChange={(e) => setEditValue({ 
                        ...currentValue, 
                        [fieldKey]: { 
                          ...(fieldValue || {}), 
                          scale: e.target.value ? Number(e.target.value) : null 
                        } 
                      })}
                      className="mt-1"
                      placeholder="0-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={fieldValue?.description || ''}
                      onChange={(e) => setEditValue({ 
                        ...currentValue, 
                        [fieldKey]: { 
                          ...(fieldValue || {}), 
                          description: e.target.value || null 
                        } 
                      })}
                      className="mt-1"
                      placeholder="e.g., mild, moderate, severe"
                    />
                  </div>
                </div>
              ) : fieldType === 'object' ? (
                <Textarea
                  value={typeof fieldValue === 'object' && fieldValue !== null ? JSON.stringify(fieldValue, null, 2) : ''}
                  onChange={(e) => {
                    if (!e.target.value.trim()) {
                      setEditValue({ ...currentValue, [fieldKey]: null });
                      return;
                    }
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditValue({ ...currentValue, [fieldKey]: parsed });
                    } catch {
                      // Keep invalid JSON in textarea for user to fix
                    }
                  }}
                  rows={3}
                  className="mt-1 font-mono text-xs"
                  placeholder="JSON object"
                />
              ) : (
                <Input
                  value={displayValue}
                  onChange={(e) => setEditValue({ ...currentValue, [fieldKey]: e.target.value || null })}
                  className="mt-1"
                  placeholder={fieldKey.replace(/_/g, ' ')}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderObjectAsKeyValue = (obj: any, parentPath: string = '', level: number = 0) => {
    if (!obj || typeof obj !== 'object') return null;

    const entries = Array.isArray(obj) ? obj.map((item, idx) => [idx, item]) : Object.entries(obj);
    
    return entries.map(([key, value]) => {
      const fieldPath = parentPath ? `${parentPath}.${key}` : String(key);
      const isEditing = editingField === fieldPath;
      const editable = isFieldEditable(fieldPath);
      const isObject = value && typeof value === 'object';
      const enumOptions = getEnumOptions(fieldPath);
      const isComplex = isComplexField(fieldPath);
      const complexSchema = isComplex ? getFieldSchema(fieldPath) : null;

      return (
        <div key={fieldPath} className={`${level > 0 ? 'ml-4 pl-4 border-l-2 border-muted' : ''}`}>
          <div className="py-3 border-b last:border-b-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Label className="text-sm font-medium capitalize">
                  {String(key).replace(/_/g, ' ')}
                </Label>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    {isComplex && complexSchema ? (
                      // Render structured editor for complex fields
                      renderComplexFieldEditor(fieldPath, complexSchema)
                    ) : enumOptions ? (
                      <Select value={editValue} onValueChange={setEditValue}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {enumOptions.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : isStringField(fieldPath) ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={4}
                        className="text-sm"
                        placeholder="Enter text..."
                      />
                    ) : isObject ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={6}
                        className="font-mono text-xs"
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-sm"
                      />
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(fieldPath)} disabled={updateCaseMutation.isPending}>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {isObject ? (
                      <div className="mt-2">
                        {renderObjectAsKeyValue(value, fieldPath, level + 1)}
                      </div>
                    ) : (
                      <p className={`text-sm mt-1 ${value === null || value === undefined ? 'text-muted-foreground italic' : ''}`}>
                        {renderValue(value)}
                      </p>
                    )}
                  </>
                )}
              </div>
              {!isEditing && editable && !isObject && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(fieldPath, value)}
                  className="mt-1"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              {!isEditing && editable && isComplex && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(fieldPath, value)}
                  className="mt-1"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit Fields
                </Button>
              )}
              {!editable && !isObject && (
                <Badge variant="secondary" className="mt-1 text-xs">Read-only</Badge>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load case data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Complete Case Data</h1>
          <p className="text-muted-foreground">Case #{caseData.case_id?.substring(0, 8)}</p>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Case ID</Label>
              <p className="text-sm mt-1 font-mono">{caseData.case_id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                <Badge variant={caseData.status === 'approved_by_doctor' ? 'default' : 'secondary'}>
                  {caseData.status?.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Severity</Label>
              <div className="mt-1">
                {renderObjectAsKeyValue({ severity: caseData.severity }, '', 0)}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm mt-1">
                {parseBackendDate(caseData.created_at) ? format(parseBackendDate(caseData.created_at)!, 'PPP p') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjective Data */}
      {caseData.subjective && (
        <Card>
          <CardHeader>
            <CardTitle>Subjective Data</CardTitle>
          </CardHeader>
          <CardContent>
            {renderObjectAsKeyValue(caseData.subjective, 'subjective', 0)}
          </CardContent>
        </Card>
      )}

      {/* Objective Data */}
      {caseData.objective && (
        <Card>
          <CardHeader>
            <CardTitle>Objective Data</CardTitle>
          </CardHeader>
          <CardContent>
            {renderObjectAsKeyValue(caseData.objective, 'objective', 0)}
          </CardContent>
        </Card>
      )}

      {/* Assessment */}
      {caseData.assessment && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {renderObjectAsKeyValue(caseData.assessment, 'assessment', 0)}
          </CardContent>
        </Card>
      )}

      {/* Plan */}
      {caseData.plan && (
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {renderObjectAsKeyValue(caseData.plan, 'plan', 0)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
