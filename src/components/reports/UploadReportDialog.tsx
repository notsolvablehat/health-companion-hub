// src/components/reports/UploadReportDialog.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Image as ImageIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useUploadReport, useAvailablePatients } from '@/hooks/queries/useReportQueries';
import { useCases } from '@/hooks/queries/useCaseQueries';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Report } from '@/types/report';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (report: Report) => void;
  patientId?: string; // For doctors uploading on behalf of patients
}

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function UploadReportDialog({
  open,
  onClose,
  onSuccess,
  patientId,
}: UploadReportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [caseId, setCaseId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const { mutate: upload, uploadProgress, isPending } = useUploadReport();
  const { data: casesData } = useCases();
  const { user } = useAuth();
  
  // Fetch available patients for doctors
  const { 
    data: patientsData, 
    isLoading: isPatientsLoading,
    error: patientsError,
    refetch: refetchPatients 
  } = useAvailablePatients();

  const isDoctor = user?.role === 'doctor';

  // Initialize selected patient
  useEffect(() => {
    if (open) {
      if (patientId) {
        // If patientId prop is provided, use it
        setSelectedPatientId(patientId);
      } else if (!isDoctor && user?.id) {
        // For patients, auto-select their own ID
        setSelectedPatientId(user.id);
      } else {
        // For doctors, reset selection
        setSelectedPatientId('');
      }
    }
  }, [open, patientId, isDoctor, user?.id]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload PDF or image files only.');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 50MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (isDoctor && !selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }

    // Determine patient_id: use selected patient or current user's ID
    const effectivePatientId = selectedPatientId || user?.id;

    if (!effectivePatientId) {
      toast.error('Unable to determine patient ID');
      return;
    }

    upload(
      {
        file,
        caseId: caseId || undefined,
        patientId: effectivePatientId,
        description: description || undefined,
      },
      {
        onSuccess: (report) => {
          toast.success('Report uploaded successfully');
          onSuccess?.(report);
          handleClose();
        },
        onError: (error: any) => {
          const errorMessage = error.message || 'Failed to upload report';
          toast.error(errorMessage);
          
          // If error is about unassigned patient, suggest refreshing patient list
          if (errorMessage.includes('not assigned')) {
            toast.info('Patient list may have changed. Try refreshing.');
          }
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setFile(null);
      setSelectedPatientId('');
      setCaseId('');
      setDescription('');
      onClose();
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8 text-muted-foreground" />;
    
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-primary" />;
    }
    return <ImageIcon className="w-8 h-8 text-primary" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Report</DialogTitle>
          <DialogDescription>
            Upload a medical report (PDF or image)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Selection (Doctors Only) */}
          {isDoctor && !patientId && (
            <div>
              <Label htmlFor="patient-select">
                Select Patient <span className="text-destructive">*</span>
              </Label>
              
              {isPatientsLoading ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading patients...
                </div>
              ) : patientsError ? (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load patients. Please try again.
                  </AlertDescription>
                </Alert>
              ) : patientsData?.patients && patientsData.patients.length > 0 ? (
                <Select 
                  value={selectedPatientId} 
                  onValueChange={setSelectedPatientId} 
                  disabled={isPending}
                >
                  <SelectTrigger id="patient-select" className="mt-2">
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientsData.patients.map((patient) => (
                      <SelectItem key={patient.user_id} value={patient.user_id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No patients assigned to you yet. Contact administration to get patient assignments.
                  </AlertDescription>
                </Alert>
              )}
              
              {patientsData && patientsData.patients.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchPatients()}
                  disabled={isPatientsLoading || isPending}
                  className="mt-2"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isPatientsLoading ? 'animate-spin' : ''}`} />
                  Refresh Patient List
                </Button>
              )}
            </div>
          )}

          {/* File Upload Area */}
          <div>
            <Label>File</Label>
            <div
              className={`
                mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${file ? 'bg-muted/50' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept={ACCEPTED_FILE_TYPES.join(',')}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                disabled={isPending}
              />

              <div className="flex flex-col items-center gap-2">
                {getFileIcon()}
                {file ? (
                  <>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {!isPending && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF or images (max 50MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Case Selection (Optional) */}
          <div>
            <Label htmlFor="case-select">Link to Case (Optional)</Label>
            <Select value={caseId || 'none'} onValueChange={(val) => setCaseId(val === 'none' ? '' : val)} disabled={isPending}>
              <SelectTrigger id="case-select" className="mt-2">
                <SelectValue placeholder="No case selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No case</SelectItem>
                {casesData?.cases.map((caseItem) => (
                  <SelectItem key={caseItem.case_id} value={caseItem.case_id}>
                    {caseItem.case_id} - {caseItem.chief_complaint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || isPending || (isDoctor && !selectedPatientId)}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UploadReportDialog;
