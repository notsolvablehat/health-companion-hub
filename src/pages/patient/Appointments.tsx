import { useState } from 'react';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/queries/useAppointmentQueries';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, History, CalendarDays } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PatientAppointments() {
  const { data, isLoading, error } = useAppointments('patient');
  const updateStatusMutation = useUpdateAppointmentStatus();
  
  const [cancelId, setCancelId] = useState<string | null>(null);

  const appointments = data?.appointments || [];

  const upcomingAppointments = appointments
    .filter(a => a.status === 'Scheduled')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const pastAppointments = appointments
    .filter(a => a.status !== 'Scheduled')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const handleCancelClick = (id: string) => {
    setCancelId(id);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: cancelId,
        data: { status: 'Cancelled', cancellation_reason: 'Cancelled by patient' }
      });
      setCancelId(null);
    } catch (error) {
      // handled hook
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Appointments</h1>
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          Failed to load appointments. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage your doctor visits
          </p>
        </div>
        <BookAppointmentDialog />
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {isLoading ? (
            <AppointmentsSkeleton />
          ) : upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <AppointmentCard 
                key={apt.id} 
                appointment={apt} 
                onStatusUpdate={(id, status) => status === 'Cancelled' ? handleCancelClick(id) : undefined}
              />
            ))
          ) : (
            <EmptyState 
              icon={CalendarDays} 
              title="No upcoming appointments" 
              description="Book an appointment with your doctor to get started." 
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          {isLoading ? (
            <AppointmentsSkeleton />
          ) : pastAppointments.length > 0 ? (
            pastAppointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          ) : (
            <EmptyState 
              icon={History} 
              title="No appointment history" 
              description="Your past appointments will appear here." 
            />
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm max-w-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
