import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  Mail, 
  Calendar,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  UserPlus,
  UserMinus,
  Loader2,
  Eye,
} from 'lucide-react';
import { 
  useMyPatients, 
  useSpecialities, 
  useAssignPatient, 
  useRevokeAssignment 
} from '@/hooks/queries/useAssignmentQueries';
import { getInitials, formatDate, calculateAge } from '@/lib/utils';
import { toast } from 'sonner';
import type { PatientSummary, PatientHistoryEntry } from '@/types/assignment';

function PatientCard({ 
  patient, 
  isHistory = false, 
  historyData,
  onRevoke,
  onViewProfile,
}: { 
  patient: PatientSummary; 
  isHistory?: boolean;
  historyData?: PatientHistoryEntry;
  onRevoke?: (email: string) => void;
  onViewProfile?: (patientId: string) => void;
}) {
  const initials = getInitials(patient.name?.split(' ')[0], patient.name?.split(' ')[1] || '');
  const age = patient.date_of_birth ? calculateAge(patient.date_of_birth) : null;

  return (
    <Card className={`hover:shadow-soft transition-shadow ${isHistory ? 'opacity-75' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{patient.name}</h3>
              {!isHistory ? (
                <Badge variant="default" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">
                  <XCircle className="w-3 h-3 mr-1" />
                  Ended
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {patient.patient_id} • {patient.gender}{age ? ` • ${age} years` : ''}
            </p>
            
            <div className="space-y-2 text-sm">
              {patient.email && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </p>
              )}
              
              {isHistory && historyData && (
                <div className="pt-2 border-t border-border mt-3">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {formatDate(historyData.assigned_at)} - {formatDate(historyData.revoked_at)}
                    </span>
                  </p>
                  {historyData.reason && (
                    <p className="flex items-start gap-2 text-muted-foreground mt-1">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-xs">{historyData.reason}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isHistory && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile?.(patient.user_id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Profile
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <UserMinus className="w-4 h-4 mr-1" />
                      Discharge
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Discharge Patient?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will end your assignment with {patient.name}. You will no longer have access to their records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onRevoke?.(patient.email!)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Discharge
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignPatientDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [speciality, setSpeciality] = useState('');
  
  const { data: specialitiesData } = useSpecialities();
  const assignMutation = useAssignPatient();

  const handleSubmit = async () => {
    if (!email || !speciality) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await assignMutation.mutateAsync({
        patient_email: email,
        speciality_required: speciality,
      });
      toast.success('Patient assigned successfully');
      setOpen(false);
      setEmail('');
      setSpeciality('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign patient');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Patient
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign New Patient</DialogTitle>
          <DialogDescription>
            Assign a patient to yourself based on specialization. The system will automatically load-balance if needed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patient-email">Patient Email</Label>
            <Input
              id="patient-email"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="speciality">Required Speciality</Label>
            <Select value={speciality} onValueChange={setSpeciality}>
              <SelectTrigger>
                <SelectValue placeholder="Select speciality" />
              </SelectTrigger>
              <SelectContent>
                {specialitiesData?.specialities.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={assignMutation.isPending}>
            {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DoctorBookings() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useMyPatients();
  const revokeMutation = useRevokeAssignment();

  const activePatients = data?.patients || [];
  const historyPatients = data?.history || [];

  const handleRevoke = async (patientEmail: string) => {
    try {
      await revokeMutation.mutateAsync({
        patient_email: patientEmail,
        reason: 'Discharged',
      });
      toast.success('Patient discharged successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to discharge patient');
    }
  };

  const handleViewProfile = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">Manage your patient assignments</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Failed to load bookings. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your patient assignments ({data?.count || 0} active)
          </p>
        </div>
        <AssignPatientDialog onSuccess={() => refetch()} />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Active ({activePatients.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History ({historyPatients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : activePatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePatients.map((patient) => (
                <PatientCard 
                  key={patient.patient_id} 
                  patient={patient}
                  onRevoke={handleRevoke}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No patients assigned yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the "Assign Patient" button to add patients
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : historyPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyPatients.map((patient, index) => (
                <PatientCard 
                  key={`${patient.patient_id}-${index}`} 
                  patient={patient}
                  isHistory 
                  historyData={patient}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No previous assignments</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your assignment history will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
