import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DiabetesRiskFactor } from '@/types/diabetes';

interface RiskFactorsListProps {
  riskFactors: DiabetesRiskFactor[];
}

const severityConfig = {
  high: {
    color: 'text-red-600 dark:text-red-400',
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  medium: {
    color: 'text-yellow-600 dark:text-yellow-400',
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  },
  low: {
    color: 'text-blue-600 dark:text-blue-400',
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
} as const;

/**
 * Risk Factors List Component
 * 
 * Displays identified diabetes risk factors with severity indicators.
 * Each risk factor shows:
 * - Severity icon and color coding (high/medium/low)
 * - Factor name
 * - Detailed description
 */
export function RiskFactorsList({ riskFactors }: RiskFactorsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Factors</CardTitle>
      </CardHeader>
      <CardContent>
        {riskFactors.length === 0 ? (
          <p className="text-muted-foreground text-sm">No risk factors identified</p>
        ) : (
          <div className="space-y-3">
            {riskFactors.map((risk, index) => {
              const config = severityConfig[risk.severity];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${config.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h4 className="font-semibold">{risk.factor}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {risk.description}
                      </p>
                      <p className={`text-xs font-medium mt-2 ${config.color}`}>
                        {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)} severity
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
