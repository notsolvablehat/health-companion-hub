import { api } from './api';
import type { DiabetesDashboardResponse } from '@/types/diabetes';

/**
 * Diabetes Dashboard Service
 * 
 * Provides API integration for diabetes monitoring dashboard.
 * See: docs/backend_context/DIABETES_DASHBOARD.md
 */
export const diabetesService = {
  /**
   * Get diabetes dashboard for authenticated patient
   * 
   * @returns DiabetesDashboardResponse
   * @throws ApiError on failure
   */
  getMyDashboard: async (): Promise<DiabetesDashboardResponse> => {
    const response = await api.get<DiabetesDashboardResponse>('/patient/diabetes-dashboard');
    return response.data;
  },

  /**
   * Get diabetes dashboard for specific patient (doctor only)
   * 
   * @param patientId - UUID of the patient
   * @returns DiabetesDashboardResponse
   * @throws ApiError on failure (403 if not assigned, 404 if patient not found)
   */
  getPatientDashboard: async (patientId: string): Promise<DiabetesDashboardResponse> => {
    const response = await api.get<DiabetesDashboardResponse>(
      `/patient/${patientId}/diabetes-dashboard`
    );
    return response.data;
  },
};
