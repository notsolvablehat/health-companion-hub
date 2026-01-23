import { api } from './api';
import type { 
  Appointment, 
  AppointmentsResponse, 
  CreateAppointmentRequest, 
  UpdateAppointmentStatusRequest 
} from '@/types/appointment';

export const appointmentsService = {
  /**
   * Get appointments for the current patient
   */
  getMyAppointments: async (params?: { status?: string }): Promise<AppointmentsResponse> => {
    // Ideally this hits /appointments/patient
    // For now, if 404, we might want to return empty list or mock data
    // But I will write clean API code.
    const response = await api.get<AppointmentsResponse>('/appointments/patient', { params });
    return response.data;
  },

  /**
   * Get appointments for the current doctor
   */
  getDoctorAppointments: async (params?: { start_date?: string; end_date?: string }): Promise<AppointmentsResponse> => {
    const response = await api.get<AppointmentsResponse>('/appointments/doctor', { params });
    return response.data;
  },

  /**
   * Create a new appointment
   */
  createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  /**
   * Update appointment status (cancel/complete)
   */
  updateStatus: async (id: string, data: UpdateAppointmentStatusRequest): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/status`, data);
    return response.data;
  },
};
