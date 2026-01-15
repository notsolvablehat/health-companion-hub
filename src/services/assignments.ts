// src/services/assignments.ts

import api from './api';
import type {
  Assignment,
  PatientListResponse,
  DoctorListResponse,
  AssignPatientRequest,
  RevokeAssignmentRequest,
} from '@/types/assignment';
import type { PatientProfile } from '@/types/auth';

export const assignmentsService = {
  /**
   * Get assigned patients (Doctor only)
   */
  getMyPatients: async (): Promise<PatientListResponse> => {
    const response = await api.get<PatientListResponse>('/assignments/my-patients');
    return response.data;
  },

  /**
   * Get assigned doctors (Patient only)
   */
  getMyDoctors: async (): Promise<DoctorListResponse> => {
    const response = await api.get<DoctorListResponse>('/assignments/doctors');
    return response.data;
  },

  /**
   * Assign a patient to doctor (Doctor/Admin only)
   * Uses load-balancing if specialisation is provided
   */
  assignPatient: async (data: AssignPatientRequest): Promise<Assignment> => {
    const response = await api.post<Assignment>('/assignments/assign', data);
    return response.data;
  },

  /**
   * Revoke patient assignment (Doctor/Admin only)
   */
  revokeAssignment: async (data: RevokeAssignmentRequest): Promise<Assignment> => {
    const response = await api.post<Assignment>('/assignments/revoke', data);
    return response.data;
  },

  /**
   * Get full patient profile (Doctor only - must be assigned)
   */
  getPatientProfile: async (patientId: string): Promise<PatientProfile> => {
    const response = await api.get<PatientProfile>(`/users/patient-profile/${patientId}`);
    return response.data;
  },
};

export default assignmentsService;
