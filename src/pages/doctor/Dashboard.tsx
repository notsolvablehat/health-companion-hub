import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpecialtyMetrics } from '@/components/common/SpecialtyMetrics';
import { RecentPatientsTable } from '@/components/common/RecentPatientsTable';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Bot,
  Activity,
  Calendar,
  BarChart3,
  Users,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { parseBackendDate } from '@/lib/utils';

const DONUT_COLORS = [
  'hsl(142, 76%, 36%)',  // green
  'hsl(199, 89%, 48%)',  // blue  
  'hsl(0, 84%, 60%)',    // red
  'hsl(45, 93%, 47%)',   // orange
  'hsl(271, 91%, 65%)',  // purple
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState('amit');

  // Main dashboard query
  const { data, isLoading, error } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => dashboardService.getDoctorDashboard(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  // Analytics query (independent)
  const { data: analytics } = useQuery({
    queryKey: ['doctor-analytics'],
    queryFn: () => dashboardService.getDoctorAnalytics(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't load your dashboard data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  // Get current date formatted
  const currentDate = format(new Date(), 'EEE, dd MMM yyyy');

  // Chart configs
  const topDiagnosesConfig: ChartConfig = {
    count: { label: 'Cases', color: 'hsl(var(--chart-1))' },
  };

  const visitTypesConfig: ChartConfig = {
    count: { label: 'Visits', color: 'hsl(var(--chart-2))' },
  };

  // Sample data for charts (in production, this should come from analytics)
  const topDiagnosesData = analytics?.cases_by_type && analytics.cases_by_type.length > 0 
    ? analytics.cases_by_type.slice(0, 10).map(item => ({
        diagnosis: item.type.replace('_', ' '),
        count: item.count
      }))
    : [
        { diagnosis: 'Urgent', count: 1 },
        { diagnosis: 'Routine', count: 1 },
      ];

  const visitTypesData = analytics?.appointments.by_type && analytics.appointments.by_type.length > 0
    ? analytics.appointments.by_type.map(item => ({
        type: item.type,
        count: item.count
      }))
    : [
        { type: 'Consultation', count: 45 },
        { type: 'Follow-up', count: 30 },
        { type: 'Emergency', count: 15 },
        { type: 'Procedure', count: 10 },
      ];

  // Sample data for retention rate (mock data - should come from backend)
  const retentionRateData = [
    { month: 'Sep', followUp: 65, noShow: 18 },
    { month: 'Oct', followUp: 72, noShow: 15 },
    { month: 'Nov', followUp: 68, noShow: 20 },
    { month: 'Dec', followUp: 78, noShow: 18 },
    { month: 'Jan', followUp: 82, noShow: 16 },
    { month: 'Feb', followUp: 85, noShow: 12 },
  ];

  // Sample data for weekly overview (mock data)
  const weeklyOverviewData = [
    { day: 'Mon', resolved: 6, ongoing: 4, escalated: 2, referred: 0 },
    { day: 'Tue', resolved: 8, ongoing: 5, escalated: 0, referred: 2 },
    { day: 'Wed', resolved: 5, ongoing: 2, escalated: 3, referred: 0 },
    { day: 'Thu', resolved: 10, ongoing: 4, escalated: 2, referred: 1 },
    { day: 'Fri', resolved: 9, ongoing: 4, escalated: 0, referred: 2 },
    { day: 'Sat', resolved: 4, ongoing: 2, escalated: 1, referred: 0 },
  ];

  // Sample vital trends data for patient selector
  const vitalTrendsData: Record<string, { name: string; data: any[] }> = {
    amit: {
      name: 'Amit Patel (Bed 4)',
      data: [
        { time: '02:00', hr: 108, systolic: 96, spo2: 94 },
        { time: '04:00', hr: 112, systolic: 92, spo2: 93 },
        { time: '06:00', hr: 118, systolic: 88, spo2: 91 },
        { time: '08:00', hr: 115, systolic: 94, spo2: 92 },
        { time: '10:00', hr: 120, systolic: 90, spo2: 90 },
        { time: '12:00', hr: 116, systolic: 92, spo2: 91 },
        { time: '14:00', hr: 118, systolic: 92, spo2: 91 },
      ],
    },
    rajesh: {
      name: 'Rajesh Kumar (Bed 7)',
      data: [
        { time: '02:00', hr: 88, systolic: 122, spo2: 96 },
        { time: '04:00', hr: 92, systolic: 118, spo2: 97 },
        { time: '06:00', hr: 95, systolic: 125, spo2: 95 },
        { time: '08:00', hr: 98, systolic: 120, spo2: 96 },
        { time: '10:00', hr: 96, systolic: 128, spo2: 94 },
        { time: '12:00', hr: 100, systolic: 124, spo2: 95 },
        { time: '14:00', hr: 98, systolic: 122, spo2: 96 },
      ],
    },
    sneha: {
      name: 'Sneha Desai (Ward 3)',
      data: [
        { time: '02:00', hr: 75, systolic: 110, spo2: 98 },
        { time: '04:00', hr: 78, systolic: 108, spo2: 99 },
        { time: '06:00', hr: 82, systolic: 112, spo2: 97 },
        { time: '08:00', hr: 80, systolic: 115, spo2: 98 },
        { time: '10:00', hr: 84, systolic: 118, spo2: 96 },
        { time: '12:00', hr: 82, systolic: 114, spo2: 97 },
        { time: '14:00', hr: 79, systolic: 110, spo2: 98 },
      ],
    },
  };

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold">Dr. {data.user_info.name}</h1>
          <span className="text-xs text-muted-foreground">{currentDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-success/10 text-success border-success/20">Online</Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/doctor/chat" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Assistant
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {data.alerts && data.alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Alerts
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {data.alerts.length} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.slice(0, 4).map((alert, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border bg-card/50 hover:border-muted-foreground/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        alert.type === 'error'
                          ? 'bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                          : 'bg-warning'
                      }`}
                    />
                    <span className="text-xs font-medium">{alert.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {parseBackendDate(alert.created_at)
                      ? formatDistanceToNow(parseBackendDate(alert.created_at)!, { addSuffix: true })
                      : 'Now'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ml-3.5">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Specialty Metrics */}
      {data.specialty_metrics && data.specialty_metrics.length > 0 && (
        <SpecialtyMetrics
          metrics={data.specialty_metrics}
          specialisation={data.user_info.specialisation}
        />
      )}

      {/* Top Diagnoses & Retention Rate */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top Diagnoses */}
        {topDiagnosesData.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Top Diagnoses
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Last 90 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDiagnosesData} layout="horizontal" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      dataKey="diagnosis"
                      type="category"
                      className="text-[10px]"
                      width={90}
                      tickFormatter={(value) => {
                        const str = String(value);
                        return str.length > 12 ? `${str.slice(0, 10)}...` : str;
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Retention Rate */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Retention Rate
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Follow-up compliance
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionRateData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="followUp" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Follow-up Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="noShow" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    name="No-show Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Weekly Overview — Patient Outcomes
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              This week
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOverviewData} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="square"
                />
                <Bar dataKey="resolved" stackId="a" fill="hsl(142, 76%, 36%)" name="Resolved" />
                <Bar dataKey="ongoing" stackId="a" fill="hsl(199, 89%, 48%)" name="Ongoing" />
                <Bar dataKey="escalated" stackId="a" fill="hsl(0, 84%, 60%)" name="Escalated" />
                <Bar dataKey="referred" stackId="a" fill="hsl(45, 93%, 47%)" name="Referred Out" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Vital Trend + Visit Types */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        {/* Vital Trend */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Vital Trend — Most Critical
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="h-7 text-xs w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amit">Amit Patel (Bed 4)</SelectItem>
                    <SelectItem value="rajesh">Rajesh Kumar (Bed 7)</SelectItem>
                    <SelectItem value="sneha">Sneha Desai (Ward 3)</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs">
                  Last 12 hours
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalTrendsData[selectedPatient].data} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hr" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="HR (bpm)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="hsl(199, 89%, 48%)" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Systolic BP"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spo2" 
                    stroke="hsl(45, 93%, 47%)" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="SpO2 %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Visit Types */}
        {visitTypesData.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Visit Types
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  This month
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visitTypesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="count"
                      nameKey="type"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {visitTypesData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Today's Summary */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Today's Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold mb-1">
                {analytics?.appointments.today ?? 0}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Scheduled
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-success mb-1">
                {analytics?.appointments.completed ?? 0}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Completed
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-destructive mb-1">
                {data.pending_approvals.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Critical
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold mb-1">
                {data.cases.open}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Pending Reports
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold mb-1">
                {Math.round(data.patient_stats.load_percentage)}%
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Patient Load
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Patients */}
      {data.recent_patients && data.recent_patients.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Recent Patients
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Today
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <RecentPatientsTable patients={data.recent_patients} />
          </CardContent>
        </Card>
      )}

      {/* Case Status Overview + Pending Approvals */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Case Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Case Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
                <Clock className="w-4 h-4 mx-auto text-warning mb-2" />
                <p className="text-xl font-semibold text-warning">{data.cases.open}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Open</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-info/10 border border-info/20">
                <Activity className="w-4 h-4 mx-auto text-info mb-2" />
                <p className="text-xl font-semibold text-info">{data.cases.under_review}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Review</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="w-4 h-4 mx-auto text-success mb-2" />
                <p className="text-xl font-semibold text-success">{data.cases.approved}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Approved</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50 border">
                <FileText className="w-4 h-4 mx-auto text-muted-foreground mb-2" />
                <p className="text-xl font-semibold">{data.cases.closed}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="lg:col-span-2 border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Pending Approvals
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/doctor/cases?status=under_review" className="flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.pending_approvals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 mx-auto text-success mb-3" />
                <p className="text-sm text-muted-foreground">
                  All caught up! No pending approvals.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.pending_approvals.slice(0, 3).map((approval) => (
                  <Link
                    key={approval.case_id}
                    to={`/doctor/cases/${approval.case_id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5 hover:bg-warning/10 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{approval.patient_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {approval.chief_complaint || 'No complaint specified'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {parseBackendDate(approval.created_at)
                          ? formatDistanceToNow(parseBackendDate(approval.created_at)!, {
                              addSuffix: true,
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2">
                      Review
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Stats + Quick Actions */}
      {(data.ai_stats.chat_count > 0 || data.ai_stats.analyses_count > 0) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">AI Clinical Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.ai_stats.chat_count} consultations • {data.ai_stats.analyses_count} report
                    analyses
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/doctor/chat">
                  Start Chat <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
