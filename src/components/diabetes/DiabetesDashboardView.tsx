import { DiabetesStatusBadge } from './DiabetesStatusBadge';
import { DiabetesSummaryCards } from './DiabetesSummaryCards';
import { LatestPredictionCard } from './LatestPredictionCard';
import { TrendsSection } from './TrendsSection';
import { RiskFactorsList } from './RiskFactorsList';
import { RecommendationsList } from './RecommendationsList';
import { PredictionHistory } from './PredictionHistory';
import type { DiabetesDashboardResponse } from '@/types/diabetes';

interface DiabetesDashboardViewProps {
  dashboard: DiabetesDashboardResponse;
  isDoctor?: boolean;
}

/**
 * Main Diabetes Dashboard View Component
 * 
 * Displays comprehensive diabetes monitoring dashboard including:
 * - Status badge and summary statistics
 * - Latest AI prediction
 * - Health trend charts (HbA1c, Glucose, BMI)
 * - Risk factors and recommendations
 * - Complete prediction history
 * 
 * Can be used by both patients (viewing their own data) and doctors (viewing patient data).
 */
export function DiabetesDashboardView({ dashboard, isDoctor = false }: DiabetesDashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diabetes Dashboard</h1>
          {isDoctor && (
            <p className="text-sm text-muted-foreground mt-1">
              Patient diabetes monitoring and insights
            </p>
          )}
        </div>
        <DiabetesStatusBadge status={dashboard.diabetes_status} />
      </header>

      {/* Summary Cards */}
      <DiabetesSummaryCards
        totalAnalyses={dashboard.total_analyses}
        diabeticPredictionsCount={dashboard.diabetic_predictions_count}
        averageConfidence={dashboard.average_confidence}
      />

      {/* Latest Prediction */}
      {dashboard.latest_prediction && (
        <section>
          <LatestPredictionCard prediction={dashboard.latest_prediction} />
        </section>
      )}

      {/* Trends Charts */}
      <TrendsSection trends={dashboard.trends} />

      {/* Risk Factors and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskFactorsList riskFactors={dashboard.risk_factors} />
        <RecommendationsList recommendations={dashboard.recommendations} />
      </div>

      {/* Prediction History */}
      {dashboard.prediction_history.length > 0 && (
        <section>
          <PredictionHistory predictions={dashboard.prediction_history} />
        </section>
      )}
    </div>
  );
}
