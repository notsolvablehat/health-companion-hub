// src/services/assignments.ts

import api from './api';
import type {
  Assignment,
  MyPatientsResponse,
  MyDoctorsResponse,
  SpecialitiesResponse,
  AssignPatientRequest,
  RevokeAssignmentRequest,
  AssignmentSuccessResponse,
} from '@/types/assignment';
import type { PatientProfile } from '@/types/auth';

export const assignmentsService = {
  /**
   * Get all available specialities
   * GET /assignments/specialities
   */
  getSpecialities: async (): Promise<SpecialitiesResponse> => {
    const response = await api.get<SpecialitiesResponse>('/assignments/specialities');
    return response.data;
  },

  /**
   * Get assigned patients with history (Doctor only)
   * GET /assignments/patient
   */
  getMyPatients: async (): Promise<MyPatientsResponse> => {
    const response = await api.get<MyPatientsResponse>('/assignments/patient');
    return response.data;
  },

  /**
   * Get assigned doctors with history (Patient only)
   * GET /assignments/doctors
   */
  getMyDoctors: async (): Promise<MyDoctorsResponse> => {
    const response = await api.get<MyDoctorsResponse>('/assignments/doctors');
    return response.data;
  },

  /**
   * Assign a patient to doctor (Doctor/Admin only)
   * POST /assignments/assign
   */
  assignPatient: async (data: AssignPatientRequest): Promise<AssignmentSuccessResponse> => {
    const response = await api.post<AssignmentSuccessResponse>('/assignments/assign', data);
    return response.data;
  },

  /**
   * Revoke patient assignment (Doctor/Admin only)
   * POST /assignments/revoke
   */
  revokeAssignment: async (data: RevokeAssignmentRequest): Promise<{ status: string; message: string }> => {
    const response = await api.post<{ status: string; message: string }>('/assignments/revoke', data);
    return response.data;
  },

  /**
   * Get full patient profile (Doctor only - must be assigned)
   * GET /users/patient-profile/:patient_id
   */
  getPatientProfile: async (patientId: string): Promise<PatientProfile> => {
    const response = await api.get<PatientProfile>(`/users/patient-profile/${patientId}`);
    return response.data;
  },
};

export default assignmentsService;
