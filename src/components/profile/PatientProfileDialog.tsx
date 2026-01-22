import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { assignmentsService } from '@/services/assignments';
import { getInitials, calculateAge, formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplet,
  Ruler,
  Weight,
  AlertCircle,
  Pill,
  FileText,
  UserCircle,
} from 'lucide-react';

interface PatientProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientEmail: string;
}


function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function ListSection({ icon: Icon, label, items }: { icon: any; label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function PatientProfileDialog({ open, onOpenChange, patientEmail }: PatientProfileDialogProps) {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['patientProfile', patientEmail],
    queryFn: () => assignmentsService.getPatientByEmail(patientEmail),
    enabled: open && !!patientEmail,
  });

  const initials = profile?.name ? getInitials(profile.name.split(' ')[0], profile.name.split(' ')[1] || '') : '??';
  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Profile</DialogTitle>
          <DialogDescription>
            View detailed patient information and medical history
          </DialogDescription>
        </DialogHeader>

        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">Failed to load patient profile</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(error as any)?.message || 'Please try again later'}
            </p>
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-start gap-4 pb-4 border-b">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-semibold truncate">{profile.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {profile.patient_id}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {profile.gender}
                  </Badge>
                  {age && (
                    <Badge variant="secondary" className="text-xs">
                      {age} years old
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground mb-3">Contact Information</h4>
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone_number} />
              <InfoRow icon={MapPin} label="Address" value={profile.address} />
              <InfoRow icon={Calendar} label="Date of Birth" value={profile.date_of_birth ? formatDate(profile.date_of_birth) : undefined} />
            </div>

            {/* Vitals */}
            {(profile.blood_group || profile.height_cm || profile.weight_kg) && (
              <div className="space-y-1 pt-4 border-t">
                <h4 className="text-sm font-semibold text-foreground mb-3">Vitals</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.blood_group && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Droplet className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Group</p>
                        <p className="text-sm font-medium">{profile.blood_group}</p>
                      </div>
                    </div>
                  )}
                  {profile.height_cm && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Ruler className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Height</p>
                        <p className="text-sm font-medium">{profile.height_cm} cm</p>
                      </div>
                    </div>
                  )}
                  {profile.weight_kg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Weight className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="text-sm font-medium">{profile.weight_kg} kg</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical Information */}
            {(profile.allergies?.length > 0 || profile.current_medications?.length > 0 || profile.medical_history?.length > 0) && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-foreground">Medical Information</h4>
                <ListSection icon={AlertCircle} label="Allergies" items={profile.allergies} />
                <ListSection icon={Pill} label="Current Medications" items={profile.current_medications} />
                <ListSection icon={FileText} label="Medical History" items={profile.medical_history} />
              </div>
            )}

            {/* Emergency Contact */}
            {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
              <div className="space-y-1 pt-4 border-t">
                <h4 className="text-sm font-semibold text-foreground mb-3">Emergency Contact</h4>
                <InfoRow icon={UserCircle} label="Name" value={profile.emergency_contact_name} />
                <InfoRow icon={Phone} label="Phone" value={profile.emergency_contact_phone} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
