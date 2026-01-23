import { useState } from 'react';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/queries/useAppointmentQueries';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { getInitials } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

export default function DoctorAppointments() {
  const { data, isLoading, error } = useAppointments('doctor');
  const updateStatusMutation = useUpdateAppointmentStatus();

  const appointments = data?.appointments || [];

  // Sort by date ascending
  const upcomingAppointments = appointments
    .filter(a => a.status === 'Scheduled')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const completedAppointments = appointments
    .filter(a => a.status === 'Completed')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const cancelledAppointments = appointments
    .filter(a => a.status === 'Cancelled' || a.status === 'No-show')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const handleStatusUpdate = async (id: string, status: 'Completed' | 'Cancelled') => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { 
          status, 
          cancellation_reason: status === 'Cancelled' ? 'Cancelled by doctor' : undefined 
        }
      });
    } catch (error) {
      // handled hook
    }
  };

  /**
   * Group upcoming appointments by date for better schedule view
   */
  const groupedUpcoming = upcomingAppointments.reduce((acc, appt) => {
    const date = new Date(appt.start_time);
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(appt);
    return acc;
  }, {} as Record<string, typeof upcomingAppointments>);

  const getSectionTitle = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d'); // e.g., Monday, January 25
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1">
          Manage your patient consultations
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Done
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 space-y-8">
          {isLoading ? (
            <AppointmentsSkeleton />
          ) : upcomingAppointments.length > 0 ? (
            Object.entries(groupedUpcoming).map(([dateStr, appts]) => (
              <div key={dateStr} className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  {getSectionTitle(dateStr)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({appts.length} appointments)
                  </span>
                </h3>
                <div className="space-y-4">
                  {appts.map(apt => (
                    <AppointmentCard 
                      key={apt.id} 
                      appointment={apt} 
                      isDoctorView 
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
             <EmptyState title="No upcoming appointments" description="Your schedule is clear." />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {isLoading ? (
            <AppointmentsSkeleton />
          ) : completedAppointments.length > 0 ? (
            completedAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} isDoctorView />
            ))
          ) : (
            <EmptyState title="No completed appointments" description="Completed appointments will appear here." />
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6 space-y-4">
          {isLoading ? (
            <AppointmentsSkeleton />
          ) : cancelledAppointments.length > 0 ? (
            cancelledAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} isDoctorView />
            ))
          ) : (
            <EmptyState title="No cancelled appointments" description="Cancelled appointments will appear here." />
          )}
        </TabsContent>
      </Tabs>
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

function EmptyState({ title, description }: { title: string, description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
