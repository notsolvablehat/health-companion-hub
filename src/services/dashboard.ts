import { api } from './api';
import type {
  PatientDashboardData,
  DoctorDashboardData,
  PatientAnalyticsData,
  DoctorAnalyticsData,
} from '@/types/dashboard';

export interface DashboardQueryParams {
  cases_page?: number;
  cases_limit?: number;
  reports_page?: number;
  reports_limit?: number;
}

export const dashboardService = {
  /**
   * Get patient dashboard data
   */
  getPatientDashboard: async (params?: DashboardQueryParams): Promise<PatientDashboardData> => {
    const response = await api.get<PatientDashboardData>('/patient/dashboard', {
      params: {
        cases_page: params?.cases_page ?? 1,
        cases_limit: params?.cases_limit ?? 5,
        reports_page: params?.reports_page ?? 1,
        reports_limit: params?.reports_limit ?? 5,
      },
    });
    return response.data;
  },

  /**
   * Get patient analytics data (charts & trends)
   */
  getPatientAnalytics: async (): Promise<PatientAnalyticsData> => {
    const response = await api.get<PatientAnalyticsData>('/patient/analytics');
    return response.data;
  },

  /**
   * Get doctor dashboard data
   */
  getDoctorDashboard: async (params?: DashboardQueryParams): Promise<DoctorDashboardData> => {
    const response = await api.get<DoctorDashboardData>('/doctor/dashboard', {
      params: {
        cases_page: params?.cases_page ?? 1,
        cases_limit: params?.cases_limit ?? 10,
      },
    });
    return response.data;
  },

  /**
   * Get doctor analytics data (charts & demographics)
   */
  getDoctorAnalytics: async (): Promise<DoctorAnalyticsData> => {
    const response = await api.get<DoctorAnalyticsData>('/doctor/analytics');
    return response.data;
  },
};

export default dashboardService;
