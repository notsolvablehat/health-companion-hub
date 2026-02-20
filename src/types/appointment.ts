/**
 * Appointment Types
 * 
 * Definitions for the unified appointment system.
 */

export type AppointmentType = 'Consultation' | 'Follow-up' | 'Emergency';

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';

export interface Appointment {
  id: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialization?: string;
  patient_id: string;
  patient_name?: string;
  start_time: string; // ISO DateTime
  end_time: string;   // ISO DateTime
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;
  cancellation_reason?: string;
  created_at?: string;
}

export interface CreateAppointmentRequest {
  doctor_id: string;
  start_time: string; // ISO DateTime
  type: AppointmentType;
  reason?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  cancellation_reason?: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  count: number;
}

export interface BookedSlotsResponse {
  doctor_id: string;
  doctor_name?: string;
  date: string; // "YYYY-MM-DD" format
  booked_slots: Appointment[]; // Full appointment objects
  total_booked: number;
}
