// src/services/cases.ts

import api from './api';
import type {
  Case,
  CaseDetail,
  CaseListResponse,
  CreateCaseRequest,
  UpdateCaseStatusRequest,
} from '@/types/case';

export const casesService = {
  /**
   * Get all cases for current user (patient)
   * Backend endpoint: GET /cases/patient/:patient_id/list
   */
  getCases: async (
    userId: string,
    params?: {
      status?: string;
    }
  ): Promise<CaseListResponse> => {
    const response = await api.get<CaseListResponse>(
      `/cases/patient/${userId}/list`,
      { params }
    );
    return response.data;
  },

  /**
   * Get single case details
   * Backend endpoint: GET /cases/:case_id
   */
  getCaseById: async (caseId: string): Promise<CaseDetail> => {
    const response = await api.get<CaseDetail>(`/cases/${caseId}`);
    return response.data;
  },

  /**
   * Create a new case (Patient only)
   */
  createCase: async (data: CreateCaseRequest): Promise<CaseDetail> => {
    const response = await api.post<CaseDetail>('/cases', data);
    return response.data;
  },

  /**
   * Update case status (Doctor only)
   */
  updateCaseStatus: async (
    caseId: string,
    data: UpdateCaseStatusRequest
  ): Promise<CaseDetail> => {
    const response = await api.patch<CaseDetail>(`/cases/${caseId}/status`, data);
    return response.data;
  },
};

export default casesService;
