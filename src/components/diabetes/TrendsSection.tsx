import { HbA1cChart } from './HbA1cChart';
import { GlucoseChart } from './GlucoseChart';
import { BMIChart } from './BMIChart';
import type { DiabetesTrends } from '@/types/diabetes';

interface TrendsSectionProps {
  trends: DiabetesTrends;
}

/**
 * Trends Section Component
 * 
 * Container for all three trend charts (HbA1c, Glucose, BMI).
 * Only renders charts that have data available.
 */
export function TrendsSection({ trends }: TrendsSectionProps) {
  const hasAnyTrends =
    trends.hba1c_readings.length > 0 ||
    trends.fasting_glucose.length > 0 ||
    trends.bmi_history.length > 0;

  if (!hasAnyTrends) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Health Trends</h2>
      <div className="grid grid-cols-1 gap-6">
        {trends.hba1c_readings.length > 0 && (
          <HbA1cChart readings={trends.hba1c_readings} />
        )}
        {trends.fasting_glucose.length > 0 && (
          <GlucoseChart readings={trends.fasting_glucose} />
        )}
        {trends.bmi_history.length > 0 && (
          <BMIChart readings={trends.bmi_history} />
        )}
      </div>
    </section>
  );
}
