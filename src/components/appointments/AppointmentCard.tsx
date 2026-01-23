import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { Appointment } from '@/types/appointment';
import { Clock, MapPin, Stethoscope, User, CalendarDays } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Check, X } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  isDoctorView?: boolean;
  onStatusUpdate?: (id: string, status: 'Completed' | 'Cancelled') => void;
}

export function AppointmentCard({ appointment, isDoctorView = false, onStatusUpdate }: AppointmentCardProps) {
  const otherName = isDoctorView ? appointment.patient_name : appointment.doctor_name;
  const initialString = otherName ? getInitials(otherName.split(' ')[0], otherName.split(' ')[1]) : '??';

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  const canAction = appointment.status === 'Scheduled';

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarFallback className={isDoctorView ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                {initialString}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg truncate mb-1">
                  {otherName || 'Unknown User'}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <AppointmentStatusBadge status={appointment.status} />
                  <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    <Stethoscope className="w-3 h-3 mr-1" />
                    {appointment.type}
                  </span>
                </div>
              </div>
              
              {/* Doctor Actions */}
              {isDoctorView && canAction && onStatusUpdate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onStatusUpdate(appointment.id, 'Completed')}>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusUpdate(appointment.id, 'Cancelled')}>
                      <X className="w-4 h-4 mr-2 text-red-600" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Patient Cancel Action */}
              {!isDoctorView && canAction && onStatusUpdate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                  onClick={() => onStatusUpdate(appointment.id, 'Cancelled')}
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm mt-1">
              <div className="flex items-center text-muted-foreground">
                <CalendarDays className="w-4 h-4 mr-2 text-primary/70" />
                {format(startTime, 'EEEE, MMM d, yyyy')}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-2 text-primary/70" />
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </div>
              
              {!isDoctorView && appointment.doctor_specialization && (
                <div className="flex items-center text-muted-foreground sm:col-span-2">
                  <Stethoscope className="w-4 h-4 mr-2 text-primary/70" />
                  {appointment.doctor_specialization}
                </div>
              )}
              
              {appointment.reason && (
                <div className="flex items-start text-muted-foreground sm:col-span-2 mt-1 bg-muted/30 p-2 rounded text-xs italic">
                  "{appointment.reason}"
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
