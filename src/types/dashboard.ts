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
  notifications_unread: number;
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
  // New: Specialty-specific metrics
  specialty_metrics: Array<{
    value: string;
    label: string;
    sub: string;
    cls: 'up' | 'down' | 'neutral';
  }>;
  // New: Recent patients with names
  recent_patients: Array<{
    case_id: string;
    status: string;
    chief_complaint: string;
    patient_name: string;
    patient_id: string;
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
  notifications_unread: number;
}

// --- Analytics Types ---

export interface MonthCount {
  month: string;
  count: number;
}

export interface TypeCount {
  type: string;
  count: number;
}

// Patient Analytics
export interface PatientAnalyticsData {
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    no_show: number;
    by_month: MonthCount[];
    by_type: TypeCount[];
    next_appointment: {
      id: string;
      doctor_name: string;
      start_time: string;
      type: string;
      reason: string;
    } | null;
  };
  medications: string[];
  vitals: {
    blood_group: string | null;
    height_cm: number | null;
    weight_kg: number | null;
  } | null;
  reports_by_month: MonthCount[];
  cases_by_month: MonthCount[];
}

// Doctor Analytics
export interface DoctorAnalyticsData {
  appointments: {
    total: number;
    today: number;
    upcoming_week: number;
    completed: number;
    cancelled: number;
    no_show: number;
    by_month: MonthCount[];
    by_type: TypeCount[];
    completion_rate: number;
  };
  patient_demographics: {
    by_gender: TypeCount[];
    by_age_group: TypeCount[];
  };
  cases_by_month: MonthCount[];
  cases_by_type: TypeCount[];
  reports_analyzed: number;
  reports_pending: number;
}
