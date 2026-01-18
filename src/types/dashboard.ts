// Patient Dashboard Types
export interface PatientDashboardData {
  user_info: {
    user_id: string;
    name: string;
    email: string;
    last_profile_update: string | null;
  };
  assigned_doctors: Array<{
    doctor_id: string;
    name: string;
    email: string;
    specialisation: string;
  }>;
  cases: {
    open: number;
    under_review: number;
    closed: number;
    approved: number;
    total: number;
    items: Array<{
      case_id: string;
      status: string;
      chief_complaint: string;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
  reports: {
    total: number;
    items: Array<{
      report_id: string;
      file_name: string;
      file_type: string;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
  health_charts: {
    weight_history: Array<{ date: string; value: number }>;
    glucose_readings: Array<{ date: string; fasting?: number; post_meal?: number }>;
    blood_pressure: Array<{ date: string; systolic: number; diastolic: number }>;
    last_profile_update: string | null;
  };
  alerts: Array<{
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    created_at: string;
  }>;
  ai_stats: {
    chat_count: number;
    analyses_count: number;
  };
}

// Doctor Dashboard Types
export interface DoctorDashboardData {
  user_info: {
    user_id: string;
    name: string;
    email: string;
    specialisation: string;
  };
  patient_stats: {
    active: number;
    max: number;
    load_percentage: number;
  };
  cases: {
    open: number;
    under_review: number;
    closed: number;
    approved: number;
    total: number;
    items: Array<{
      case_id: string;
      status: string;
      chief_complaint: string;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
  pending_approvals: Array<{
    case_id: string;
    patient_name: string;
    patient_id: string;
    chief_complaint: string;
    created_at: string;
  }>;
  alerts: Array<{
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    created_at: string;
  }>;
  ai_stats: {
    chat_count: number;
    analyses_count: number;
  };
}
