import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInitials, formatDate, calculateAge } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  AlertTriangle,
  Edit,
  Stethoscope,
  Award,
  Users,
} from 'lucide-react';
import type { PatientProfile, DoctorProfile } from '@/types/auth';

function PatientProfileView({ profile }: { profile: PatientProfile }) {
  return (
    <div className="space-y-6">
      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.medical_history.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.medical_history.map((condition, index) => (
                <Badge key={index} variant="secondary">
                  {condition}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No medical history recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy, index) => (
                <Badge key={index} variant="destructive" className="bg-warning/10 text-warning border-warning/20">
                  {allergy}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No known allergies</p>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {profile.emergency_contact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-info" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{profile.emergency_contact.name}</span>
              <Badge variant="outline" className="text-xs">
                {profile.emergency_contact.relationship}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{profile.emergency_contact.phone}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DoctorProfileView({ profile }: { profile: DoctorProfile }) {
  return (
    <div className="space-y-6">
      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Specialization</span>
            <Badge variant="secondary">{profile.specialisation}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">License Number</span>
            <span className="font-mono text-sm">{profile.license_number}</span>
          </div>
        </CardContent>
      </Card>

      {/* Patient Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-success" />
            Patient Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Patients</span>
            <span className="font-semibold">{profile.current_patient_count || 0}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Maximum Capacity</span>
            <span className="font-semibold">{profile.max_patients}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(((profile.current_patient_count || 0) / profile.max_patients) * 100, 100)}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Profile() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const isPatient = user.role === 'patient';
  const patientProfile = isPatient ? (profile as PatientProfile) : null;
  const doctorProfile = !isPatient ? (profile as DoctorProfile) : null;

  const name = 'first_name' in profile
    ? `${profile.first_name} ${profile.last_name}`
    : user.email;

  const initials = 'first_name' in profile
    ? getInitials(profile.first_name, profile.last_name)
    : '?';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold">{name}</h1>
                <Badge variant={isPatient ? 'secondary' : 'default'}>
                  {isPatient ? 'Patient' : 'Doctor'}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>

                {'phone' in profile && profile.phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {patientProfile?.date_of_birth && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(patientProfile.date_of_birth)} ({calculateAge(patientProfile.date_of_birth)} years old)
                    </span>
                  </div>
                )}

                {patientProfile?.address && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{patientProfile.address}</span>
                  </div>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific sections */}
      {patientProfile && <PatientProfileView profile={patientProfile} />}
      {doctorProfile && <DoctorProfileView profile={doctorProfile} />}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm">{formatDate(user.created_at)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account Status</span>
            <Badge variant="default" className="bg-success/10 text-success border-success/20">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
