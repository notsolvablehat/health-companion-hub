import api from './api';
import type {
  CaseResponse,
  CaseCreate,
  CaseUpdate,
  CaseApprovalRequest,
  DoctorNoteCreate,
  DoctorNote,
  CaseListResponse,
  DoctorNoteListResponse
} from '@/types/case';

export const casesService = {
  /**
   * Create a new case (Doctor only)
   * POST /cases/
   */
  createCase: async (data: CaseCreate): Promise<CaseResponse> => {
    const response = await api.post<CaseResponse>('/cases/', data);
    return response.data;
  },

  /**
   * Get complete case details (merge Postgres + MongoDB data)
   * GET /cases/:case_id
   */
  getCase: async (caseId: string): Promise<CaseResponse> => {
    const response = await api.get<CaseResponse>(`/cases/${caseId}`);
    return response.data;
  },

  /**
   * Update case (subjective/objective/assessment/plan sections)
   * PATCH /cases/:case_id
   */
  updateCase: async (caseId: string, data: CaseUpdate): Promise<CaseResponse> => {
    const response = await api.patch<CaseResponse>(`/cases/${caseId}`, data);
    return response.data;
  },

  /**
   * Doctor approval workflow with optional approval notes
   * POST /cases/:case_id/approve
   */
  approveCase: async (caseId: string, data: CaseApprovalRequest): Promise<CaseResponse> => {
    const response = await api.post<CaseResponse>(`/cases/${caseId}/approve`, data);
    return response.data;
  },

  /**
   * List all cases for a doctor
   * GET /cases/doctor/:doctor_id/list
   */
  listDoctorCases: async (
    doctorId: string, 
    params?: { 
      skip?: number; 
      limit?: number; 
      status?: string 
    }
  ): Promise<CaseListResponse> => {
    const response = await api.get<CaseListResponse>(`/cases/doctor/${doctorId}/list`, { params });
    return response.data;
  },

  /**
   * List all cases for a patient
   * GET /cases/patient/:patient_id/list
   */
  listPatientCases: async (
    patientId: string, 
    params?: { 
      skip?: number; 
      limit?: number 
    }
  ): Promise<CaseListResponse> => {
    const response = await api.get<CaseListResponse>(`/cases/patient/${patientId}/list`, { params });
    return response.data;
  },

  /**
   * Add a note to case (Doctor only)
   * POST /cases/:case_id/notes
   */
  addNote: async (caseId: string, data: DoctorNoteCreate): Promise<DoctorNote> => {
    const response = await api.post<DoctorNote>(`/cases/${caseId}/notes`, data);
    return response.data;
  },

  /**
   * Get all notes for a case
   * GET /cases/:case_id/notes
   */
  getNotes: async (caseId: string): Promise<DoctorNoteListResponse> => {
    const response = await api.get<DoctorNoteListResponse>(`/cases/${caseId}/notes`);
    return response.data;
  }
};

export default casesService;
