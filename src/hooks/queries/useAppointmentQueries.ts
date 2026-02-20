import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@/services/appointments';
import { QUERY_KEYS } from '@/lib/constants';
import { toast } from 'sonner';
import type { CreateAppointmentRequest, UpdateAppointmentStatusRequest } from '@/types/appointment';

/**
 * Hook to fetch appointments (handles both patient and doctor roles automatically via service)
 */
export function useAppointments(role: 'patient' | 'doctor') {
  return useQuery({
    queryKey: QUERY_KEYS.MY_APPOINTMENTS(role),
    queryFn: () => role === 'patient' 
      ? appointmentsService.getMyAppointments() 
      : appointmentsService.getDoctorAppointments(),
  });
}

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsService.createAppointment(data),
    onSuccess: () => {
      toast.success('Appointment booked successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPOINTMENTS('patient') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPOINTMENTS('doctor') });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to book appointment');
    },
  });
}

/**
 * Hook to update appointment status (Cancel, Complete)
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentStatusRequest }) => 
      appointmentsService.updateStatus(id, data),
    onSuccess: () => {
      toast.success('Appointment status updated');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPOINTMENTS('patient') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPOINTMENTS('doctor') });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update appointment status');
    },
  });
}

/**
 * Hook to fetch booked time slots for a doctor on a specific date
 */
export function useBookedSlots(doctorId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['booked-slots', doctorId, date],
    queryFn: () => appointmentsService.getBookedSlots(doctorId!, date!),
    enabled: !!doctorId && !!date,
  });
}
