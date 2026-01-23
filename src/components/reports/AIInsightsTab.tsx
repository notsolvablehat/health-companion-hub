// src/components/reports/AIInsightsTab.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Activity, 
  Stethoscope, 
  User, 
  Calendar,
  Thermometer,
  Pill,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Zap,
  FlaskConical
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useAnalysisStatus, 
  useAnalysisList, 
  useAnalysisDetail,
  useAnalyzeReport 
} from '@/hooks/queries/useReportQueries';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Report } from '@/types/report';
import { toast } from 'sonner';

interface AIInsightsTabProps {
  report: Report;
}

export function AIInsightsTab({ report }: AIInsightsTabProps) {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [showReAnalyzeDialog, setShowReAnalyzeDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Fetch analysis status and list
  const { data: statusData, isLoading: statusLoading } = useAnalysisStatus(report.id);
  const { data: listData, isLoading: listLoading } = useAnalysisList(report.id);
  
  // Fetch selected analysis detail
  const { data: analysisDetail, isLoading: detailLoading } = useAnalysisDetail(
    report.id, 
    selectedAnalysisId
  );

  // Mutation for triggering analysis
  const analyzeMutation = useAnalyzeReport(report.id);

  const handleAnalyze = (reAnalyze = false) => {
    analyzeMutation.mutate(
      { analyzeAgain: reAnalyze },
      {
        onSuccess: () => {
          toast.success(reAnalyze ? 'Re-analysis completed!' : 'Analysis completed!');
          setShowReAnalyzeDialog(false);
        },
        onError: (error: any) => {
          toast.error(`Analysis failed: ${error.message}`);
        },
      }
    );
  };

  const handleAnalyzeClick = () => {
    if (statusData?.is_analyzed) {
      setShowReAnalyzeDialog(true);
    } else {
      handleAnalyze(false);
    }
  };

  const handleSelectAnalysis = (mongoId: string) => {
    setSelectedAnalysisId(mongoId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedAnalysisId(null);
  };

  // Helper to get extracted data safely
  const extractedData = analysisDetail?.extracted_data || {};
  const prediction = analysisDetail?.prediction;

  // Render Lab Results Table
  const renderLabResults = (labResults: any) => {
    if (!labResults || !Array.isArray(labResults) || labResults.length === 0) return null;

    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <FlaskConical className="w-4 h-4 text-primary" />
            Lab Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="hidden md:table-cell">Reference Range</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labResults.map((result, idx) => {
                  // Handle both object and string formats
                  if (typeof result === 'string') {
                    return (
                      <TableRow key={idx}>
                        <TableCell colSpan={5} className="text-sm">{result}</TableCell>
                      </TableRow>
                    );
                  }

                  // Extract properties safely
                  const testName = result.test_name || result.name || result.test || 'Unknown Test';
                  const value = result.value ?? result.result ?? 'N/A';
                  const unit = result.unit ?? result.units ?? '';
                  const referenceRange = result.reference_range || result.range || result.normal_range || 'N/A';
                  const status = result.status || result.flag || 'Normal';

                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{String(testName)}</TableCell>
                      <TableCell className="font-mono">{String(value)}</TableCell>
                      <TableCell className="text-muted-foreground">{String(unit)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{String(referenceRange)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            String(status).toLowerCase().includes('high') || String(status).toLowerCase().includes('low')
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {String(status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render Vitals
  const renderVitals = (vitals: any) => {
    if (!vitals || typeof vitals !== 'object' || Array.isArray(vitals)) return null;
    
    const entries = Object.entries(vitals).filter(([_, val]) => {
      // Filter out null, undefined, 'N/A', and empty values
      if (val == null || val === 'N/A' || val === '') return false;
      // Make sure the value can be safely converted to string
      return true;
    });
    
    if (entries.length === 0) return null;

    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Thermometer className="w-4 h-4 text-primary" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {entries.map(([key, value]) => (
              <div key={key} className="p-3 bg-muted/30 rounded-lg text-center border">
                <p className="text-xs text-muted-foreground capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render Lists (Diagnoses, Recommendations, etc.)
  const renderList = (title: string, Icon: React.ComponentType<{ className?: string }>, items: any) => {
    // Handle null/undefined
    if (!items) return null;
    
    // Convert to array if it's not already
    let itemsArray: string[] = [];
    
    if (Array.isArray(items)) {
      // Filter out non-string items and convert objects to strings
      itemsArray = items
        .filter(item => item != null)
        .map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object') return JSON.stringify(item);
          return String(item);
        });
    } else if (typeof items === 'string') {
      itemsArray = [items];
    }
    
    if (itemsArray.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Icon className="w-4 h-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
            {itemsArray.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  // Render Medications (special handling for medication objects)
  const renderMedications = (medications: any) => {
    if (!medications) return null;
    
    let medsArray: any[] = [];
    
    if (Array.isArray(medications)) {
      medsArray = medications.filter(med => med != null);
    } else {
      return null;
    }
    
    if (medsArray.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Pill className="w-4 h-4 text-primary" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {medsArray.map((med, idx) => {
              // Handle both object and string formats
              if (typeof med === 'string') {
                return (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-foreground">{med}</p>
                  </div>
                );
              }
              
              // Handle object format
              const name = med.name || med.medication || 'Unknown Medication';
              const dosage = med.dosage || med.dose || '';
              const frequency = med.frequency || med.schedule || '';
              
              return (
                <div key={idx} className="p-3 bg-muted/30 rounded-lg border">
                  <p className="font-semibold text-foreground mb-1">{name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {dosage && dosage !== 'N/A' && (
                      <span>Dosage: <span className="text-foreground font-medium">{dosage}</span></span>
                    )}
                    {frequency && frequency !== 'N/A' && (
                      <span>Frequency: <span className="text-foreground font-medium">{frequency}</span></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const isLoading = statusLoading || listLoading;
  const isAnalyzing = analyzeMutation.isPending;

  // Detail View
  if (viewMode === 'detail' && selectedAnalysisId) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToList}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis History
        </Button>

        {detailLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading analysis details...</p>
            </CardContent>
          </Card>
        ) : analysisDetail ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Analysis Metadata */}
            <Card className="col-span-full border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="w-5 h-5 text-primary" />
                  Analysis Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Analysis ID</p>
                    <p className="font-mono text-xs">{analysisDetail.analysis_id?.substring(0, 12)}...</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <Badge variant={analysisDetail.status === 'completed' ? 'default' : 'destructive'}>
                      {analysisDetail.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">{formatDate(analysisDetail.created_at || '')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Processing Time</p>
                    <p className="font-medium">{((analysisDetail.processing_time_ms || 0) / 1000).toFixed(2)}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            {prediction && (
              <Card className="col-span-full border-blue-100 dark:border-blue-900 bg-blue-50/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <span className="text-sm font-medium text-muted-foreground">Prediction</span>
                      <Badge 
                        className={`
                          text-md py-1 px-3 w-fit
                          ${prediction.label === 'diabetes' ? 'bg-destructive hover:bg-destructive/90' : 
                            prediction.label === 'prediabetes' ? 'bg-orange-500 hover:bg-orange-600' :
                            'bg-green-600 hover:bg-green-700'}
                        `}
                      >
                        {prediction.label === 'no_diabetes' ? 'No Diabetes Detected' : 
                         prediction.label === 'prediabetes' ? 'Pre-Diabetes Risk' : 
                         prediction.label.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {prediction.confidence && (
                      <div className="flex flex-col gap-2 flex-1 w-full">
                         <span className="text-sm font-medium text-muted-foreground">AI Confidence</span>
                         <div className="flex items-center gap-3">
                           <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-blue-600 rounded-full transition-all duration-500"
                               style={{ width: `${prediction.confidence * 100}%` }}
                             />
                           </div>
                           <span className="text-sm font-bold w-12 text-right">
                             {(prediction.confidence * 100).toFixed(0)}%
                           </span>
                         </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Narrative */}
            {analysisDetail.narrative && (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    Clinical Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line">
                    {analysisDetail.narrative}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Patient Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <User className="w-4 h-4 text-primary" />
                  Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{extractedData.patient_name || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="text-muted-foreground">Age / Sex</p>
                     <p className="font-medium">
                       {extractedData.patient_age || 'N/A'} / {extractedData.patient_sex || 'N/A'}
                     </p>
                  </div>
                  <div>
                     <p className="text-muted-foreground">DOB</p>
                     <p className="font-medium">{extractedData.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="text-muted-foreground">Report Date</p>
                     <p className="font-medium">{extractedData.report_date || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <FileText className="w-4 h-4 text-primary" />
                  Report Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Report Type</p>
                    <p className="font-medium">{extractedData.report_type || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnoses & Recommendations */}
             <div className="flex flex-col gap-6">
               {renderList('Diagnoses', ClipboardList, extractedData.diagnoses)}
               {renderList('Recommendations', Stethoscope, extractedData.recommendations)}
             </div>

             {/* Vitals */}
             {renderVitals(extractedData.vital_signs)}

             {/* Lab Results */}
             {renderLabResults(extractedData.lab_results)}

             {/* Medications */}
             {renderMedications(extractedData.medications)}

             {/* Additional Notes */}
             {extractedData.additional_notes && (
               <Card className="col-span-full">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-foreground text-base">
                     <FileText className="w-4 h-4 text-primary" />
                     Additional Notes
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-foreground leading-relaxed">
                     {extractedData.additional_notes}
                   </p>
                 </CardContent>
               </Card>
             )}

          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Analysis Not Found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Unable to load the selected analysis details.
              </p>
              <Button onClick={handleBackToList} variant="outline">
                Back to List
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // List View (default)
  return (
    <div className="space-y-6">
      {/* Analysis Status Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {statusData?.is_analyzed ? (
                <>
                  <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    {statusData.analysis_count} {statusData.analysis_count === 1 ? 'Analysis' : 'Analyses'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Latest: {formatRelativeTime(statusData.latest_analysis_date || '')}
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="secondary">Not Analyzed</Badge>
                  <span className="text-sm text-muted-foreground">
                    Analyze this report to get AI insights
                  </span>
                </>
              )}
            </div>

            <Button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : statusData?.is_analyzed ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-Analyze
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis History List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading analyses...</p>
          </CardContent>
        </Card>
      ) : listData && listData.total_analyses > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Clock className="w-4 h-4 text-primary" />
              Analysis History ({listData.total_analyses})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {listData.analyses.map((analysis) => (
                <button
                  key={analysis.mongo_id}
                  onClick={() => handleSelectAnalysis(analysis.mongo_id)}
                  className="w-full p-4 rounded-lg border text-left transition-all hover:border-primary hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant={analysis.status === 'completed' ? 'default' : 'destructive'} className="shrink-0">
                        {analysis.analysis_type === 'extraction' ? 'Extraction' : 'Analysis'}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {analysis.prediction_label ? (
                            <span className="capitalize">{analysis.prediction_label.replace('_', ' ')}</span>
                          ) : (
                            <span>{analysis.report_type || 'Data Extraction'}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(analysis.created_at)}
                        </p>
                      </div>
                    </div>
                    {analysis.prediction_confidence && (
                      <Badge variant="outline" className="shrink-0">
                        {(analysis.prediction_confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Analyses Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Click "Analyze Report" to extract lab values, detect anomalies, and get a diabetes risk assessment.
            </p>
            <Button onClick={() => handleAnalyze(false)} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Re-Analyze Confirmation Dialog */}
      <AlertDialog open={showReAnalyzeDialog} onOpenChange={setShowReAnalyzeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Analysis Version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new analysis version for this report. The previous analysis will be preserved in the history.
              This may take a few moments to complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAnalyze(true)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AIInsightsTab;
