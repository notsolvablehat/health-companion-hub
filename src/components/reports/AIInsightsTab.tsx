// src/components/reports/AIInsightsTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Sparkles, AlertTriangle, FileText, Activity, Pill, Stethoscope } from 'lucide-react';
import { useReportAnalysis } from '@/hooks/queries/useReportQueries';
import { formatDate } from '@/lib/utils';
import type { Report } from '@/types/report';

interface AIInsightsTabProps {
  report: Report;
}

export function AIInsightsTab({ report }: AIInsightsTabProps) {
  const {
    analysis,
    isAnalyzed,
    analyze,
    isAnalyzing,
    error
  } = useReportAnalysis(report.id);

  return (
    <div className="space-y-6">
      {/* Analysis Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {isAnalyzed ? (
                <>
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    Analyzed
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Last analyzed on {formatDate(analysis?.analyzedAt || '')}
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="secondary">Not Analyzed</Badge>
                  <span className="text-sm text-muted-foreground">
                    Click the button to analyze this report
                  </span>
                </>
              )}
            </div>

            <Button
              onClick={() => analyze()}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : isAnalyzed ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze Again
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Report
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              Failed to analyze report: {error.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {isAnalyzed && analysis && (
        <>
          {/* Key Findings from Extraction */}
          {analysis.extraction?.extracted_data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  Extracted Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analysis.extraction.extracted_data).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg gap-4">
                      <span className="font-medium capitalize text-foreground text-sm">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-muted-foreground text-sm text-right">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Narrative */}
          {analysis.analysis?.narrative && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">{analysis.analysis.narrative}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Assessment */}
          {analysis.analysis?.prediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Risk Assessment (Diabetes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-foreground">Overall Risk:</span>
                    <Badge 
                      variant={
                        analysis.analysis.prediction.risk_level === 'high' ? 'destructive' :
                        analysis.analysis.prediction.risk_level === 'medium' ? 'secondary' :
                        'default'
                      }
                    >
                      {analysis.analysis.prediction.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-foreground">Diabetes Probability:</span>
                    <span className="text-muted-foreground font-mono">
                      {(analysis.analysis.prediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-foreground">Prediction:</span>
                    <Badge variant={analysis.analysis.prediction.is_diabetic ? 'destructive' : 'default'}>
                      {analysis.analysis.prediction.is_diabetic ? 'Diabetic Indicators Present' : 'No Diabetic Indicators'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Features */}
          {analysis.analysis?.extracted_features && Object.keys(analysis.analysis.extracted_features).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="w-5 h-5 text-primary" />
                  Extracted Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(analysis.analysis.extracted_features).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground capitalize mb-1">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!isAnalyzed && !isAnalyzing && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Analysis Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Analyze Report" to get AI-powered insights and key findings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIInsightsTab;
