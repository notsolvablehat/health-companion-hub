import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, 
  Mail, 
  Building2, 
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useMyDoctors } from '@/hooks/queries/useAssignmentQueries';
import { getInitials, formatDate } from '@/lib/utils';
import type { DoctorSummary, DoctorHistoryEntry } from '@/types/assignment';

function DoctorCard({ doctor, isHistory = false, historyData }: { 
  doctor: DoctorSummary; 
  isHistory?: boolean;
  historyData?: DoctorHistoryEntry;
}) {
  const initials = getInitials(doctor.name?.split(' ')[0], doctor.name?.split(' ')[1] || '');

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
              <h3 className="font-semibold text-lg truncate">{doctor.name}</h3>
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
            
            <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
              <Stethoscope className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{doctor.specialisation}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              {doctor.department && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{doctor.department}</span>
                </p>
              )}
              
              {doctor.email && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{doctor.email}</span>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
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

export default function PatientBookings() {
  const { data, isLoading, error } = useMyDoctors();
  const [showHistory, setShowHistory] = useState(false);

  const activeDoctors = data?.doctors || [];
  const historyDoctors = data?.history || [];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Your doctor assignments</p>
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
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">
          Doctors assigned to your care ({data?.count || 0} active)
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Active ({activeDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History ({historyDoctors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : activeDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDoctors.map((doctor) => (
                <DoctorCard key={doctor.doctor_id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No doctors assigned yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  A doctor will be assigned to you when you create a case
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : historyDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyDoctors.map((doctor, index) => (
                <DoctorCard 
                  key={`${doctor.doctor_id}-${index}`} 
                  doctor={doctor} 
                  isHistory 
                  historyData={doctor}
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
