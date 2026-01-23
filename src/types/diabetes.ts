/**
 * Diabetes Dashboard Type Definitions
 * 
 * These types match the backend API response structure for the diabetes dashboard.
 * See: docs/backend_context/DIABETES_DASHBOARD.md
 */

/**
 * Single AI diabetes prediction result
 */
export interface DiabetesPrediction {
  analysis_id: string;
  report_id: string;
  report_name: string | null;
  prediction_label: 'diabetes' | 'no_diabetes';
  confidence: number;
  analyzed_at: string;
}

/**
 * HbA1c (Glycated Hemoglobin) measurement
 * 
 * Clinical Reference:
 * - Normal: < 5.7%
 * - Pre-diabetic: 5.7% - 6.4%
 * - Diabetic: ≥ 6.5%
 */
export interface HbA1cReading {
  date: string;
  value: number;
  report_id: string | null;
  status: 'Normal' | 'Pre-diabetic' | 'Diabetic' | null;
}

/**
 * Fasting blood glucose measurement
 * 
 * Clinical Reference:
 * - Normal: < 100 mg/dL
 * - Pre-diabetic: 100 - 125 mg/dL
 * - Diabetic: ≥ 126 mg/dL
 */
export interface FastingGlucoseReading {
  date: string;
  value: number;
  report_id: string | null;
  status: 'Normal' | 'Pre-diabetic' | 'Diabetic' | null;
}

/**
 * Body Mass Index measurement
 * 
 * BMI Categories:
 * - Underweight: < 18.5
 * - Normal: 18.5 - 24.9
 * - Overweight: 25.0 - 29.9
 * - Obese: ≥ 30.0
 */
export interface BMIReading {
  date: string;
  value: number;
  report_id: string | null;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' | null;
}

/**
 * Identified risk factor for diabetes
 */
export interface DiabetesRiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

/**
 * Historical trends for diabetes indicators
 */
export interface DiabetesTrends {
  hba1c_readings: HbA1cReading[];
  fasting_glucose: FastingGlucoseReading[];
  bmi_history: BMIReading[];
}

/**
 * Complete diabetes dashboard response
 */
export interface DiabetesDashboardResponse {
  has_diabetes_data: boolean;
  message?: string;
  diabetes_status: 'diabetic' | 'at-risk' | 'monitoring' | null;
  latest_prediction: DiabetesPrediction | null;
  prediction_history: DiabetesPrediction[];
  trends: DiabetesTrends;
  risk_factors: DiabetesRiskFactor[];
  recommendations: string[];
  total_analyses: number;
  diabetic_predictions_count: number;
  average_confidence: number | null;
}
