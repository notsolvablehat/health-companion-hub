import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  Activity,
  Users,
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Heart,
  Bot,
  ArrowRight,
  Plus,
  Upload,
  Sparkles,
  Scale,
  Droplets,
  Stethoscope,
  Calendar,
  Pill,
  Droplet,
  Ruler,
  Weight,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const DONUT_COLORS = [
  'hsl(var(--success))',
  'hsl(var(--info))',
  'hsl(var(--destructive))',
  'hsl(var(--warning))',
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main dashboard query
  const { data, isLoading, error } = useQuery({
    queryKey: ['patient-dashboard'],
    queryFn: () => dashboardService.getPatientDashboard(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  // Analytics query (independent, can fail without breaking the page)
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['patient-analytics'],
    queryFn: () => dashboardService.getPatientAnalytics(),
    staleTime: 1000 * 60 * 5, // 5 min cache for analytics
    refetchOnWindowFocus: false,
  });

  // Show alerts as toasts
  useEffect(() => {
    if (data?.alerts && data.alerts.length > 0) {
      data.alerts.forEach((alert) => {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.type === 'error' ? 'destructive' : 'default',
        });
      });
    }
  }, [data?.alerts, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-3 h-3" />;
      case 'under_review':
        return <Activity className="w-3 h-3" />;
      case 'approved_by_doctor':
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'under_review':
        return 'bg-info/10 text-info border-info/20';
      case 'approved_by_doctor':
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
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

  const stats = [
    {
      label: 'Open Cases',
      value: data.cases.open,
      icon: FileText,
      color: 'bg-warning/10 text-warning',
      href: '/patient/cases?status=open',
    },
    {
      label: 'Total Reports',
      value: data.reports.total,
      icon: Activity,
      color: 'bg-success/10 text-success',
      href: '/patient/reports',
    },
    {
      label: 'My Doctors',
      value: data.assigned_doctors.length,
      icon: Users,
      color: 'bg-info/10 text-info',
      href: '/patient/doctors',
    },
    {
      label: 'AI Chats',
      value: data.ai_stats.chat_count,
      icon: MessageCircle,
      color: 'bg-primary/10 text-primary',
      href: '/patient/chat',
    },
  ];

  // Chart configs
  const appointmentsByMonthConfig: ChartConfig = {
    count: { label: 'Appointments', color: 'hsl(var(--primary))' },
  };

  const appointmentStatusConfig: ChartConfig = {
    completed: { label: 'Completed', color: 'hsl(var(--success))' },
    upcoming: { label: 'Upcoming', color: 'hsl(var(--info))' },
    cancelled: { label: 'Cancelled', color: 'hsl(var(--destructive))' },
    no_show: { label: 'No-show', color: 'hsl(var(--warning))' },
  };

  const trendConfig: ChartConfig = {
    reports: { label: 'Reports', color: 'hsl(var(--primary))' },
    cases: { label: 'Cases', color: 'hsl(var(--info))' },
  };

  const weightChartConfig: ChartConfig = {
    value: { label: 'Weight (kg)', color: 'hsl(var(--primary))' },
  };

  const glucoseChartConfig: ChartConfig = {
    fasting: { label: 'Fasting', color: 'hsl(var(--info))' },
    post_meal: { label: 'Post Meal', color: 'hsl(var(--warning))' },
  };

  const bpChartConfig: ChartConfig = {
    systolic: { label: 'Systolic', color: 'hsl(var(--destructive))' },
    diastolic: { label: 'Diastolic', color: 'hsl(var(--info))' },
  };

  const hasHealthData =
    data.health_charts.weight_history.length > 0 ||
    data.health_charts.glucose_readings.length > 0 ||
    data.health_charts.blood_pressure.length > 0;

  // Merge reports_by_month and cases_by_month into one dataset
  const trendData = (() => {
    if (!analytics) return [];
    const monthMap = new Map<string, { month: string; reports: number; cases: number }>();
    analytics.reports_by_month.forEach((r) => {
      const existing = monthMap.get(r.month) || { month: r.month, reports: 0, cases: 0 };
      existing.reports = r.count;
      monthMap.set(r.month, existing);
    });
    analytics.cases_by_month.forEach((c) => {
      const existing = monthMap.get(c.month) || { month: c.month, reports: 0, cases: 0 };
      existing.cases = c.count;
      monthMap.set(c.month, existing);
    });
    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // Appointment donut data
  const appointmentDonutData = analytics
    ? [
        { name: 'Completed', value: analytics.appointments.completed },
        { name: 'Upcoming', value: analytics.appointments.upcoming },
        { name: 'Cancelled', value: analytics.appointments.cancelled },
        { name: 'No-show', value: analytics.appointments.no_show },
      ].filter((d) => d.value > 0)
    : [];

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year), parseInt(m) - 1);
    return format(date, 'MMM');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {data.user_info.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your health journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/patient/chat">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="glass-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
              onClick={() => navigate(stat.href)}
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Section: Next Appointment + Vitals */}
      {analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Next Appointment */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Next Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.appointments.next_appointment ? (
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-primary/5">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {analytics.appointments.next_appointment.doctor_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(analytics.appointments.next_appointment.start_time), 'PPP · p')}
                    </p>
                    {analytics.appointments.next_appointment.reason && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {analytics.appointments.next_appointment.reason}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {analytics.appointments.next_appointment.type}
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/patient/appointments">Book Appointment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.vitals ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                    <Droplet className="w-5 h-5 mx-auto text-destructive mb-2" />
                    <p className="text-xl font-bold text-foreground">
                      {analytics.vitals.blood_group || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-info/5 border border-info/10">
                    <Ruler className="w-5 h-5 mx-auto text-info mb-2" />
                    <p className="text-xl font-bold text-foreground">
                      {analytics.vitals.height_cm ? `${analytics.vitals.height_cm}` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Height (cm)</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Scale className="w-5 h-5 mx-auto text-primary mb-2" />
                    <p className="text-xl font-bold text-foreground">
                      {analytics.vitals.weight_kg ? `${analytics.vitals.weight_kg}` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Weight (kg)</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Charts Row: Appointments by Month + Status Donut */}
      {analytics && (analytics.appointments.by_month.length > 0 || appointmentDonutData.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Appointments by Month */}
          {analytics.appointments.by_month.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Appointments Over Time
                </CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={appointmentsByMonthConfig} className="h-[220px]">
                  <BarChart data={analytics.appointments.by_month}>
                    <defs>
                      <linearGradient id="appointmentBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="url(#appointmentBarGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Appointment Status Donut */}
          {appointmentDonutData.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-info" />
                  Appointment Status
                </CardTitle>
                <CardDescription>
                  {analytics.appointments.total} total appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={appointmentStatusConfig} className="h-[220px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={appointmentDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {appointmentDonutData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {appointmentDonutData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Trend Charts + Medications */}
      {analytics && (trendData.length > 0 || analytics.medications.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reports & Cases Trend */}
          {trendData.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Reports & Cases Trend
                </CardTitle>
                <CardDescription>Monthly overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendConfig} className="h-[220px]">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} className="text-xs" />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="reports"
                      stroke="hsl(var(--primary))"
                      fill="url(#reportsGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="cases"
                      stroke="hsl(var(--info))"
                      fill="url(#casesGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          {analytics.medications.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Pill className="w-4 h-4 text-success" />
                  Current Medications
                </CardTitle>
                <CardDescription>Active prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.medications.map((med, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
                    >
                      <div className="p-2 bg-success/10 rounded-lg">
                        <Pill className="w-4 h-4 text-success" />
                      </div>
                      <span className="font-medium text-sm">{med}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Analytics loading skeleton */}
      {analyticsLoading && !analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      )}

      {/* My Doctors Section */}
      {data.assigned_doctors.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">My Healthcare Team</CardTitle>
              <CardDescription>Doctors assigned to your care</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/doctors" className="flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.assigned_doctors.slice(0, 3).map((doctor) => (
                <div
                  key={doctor.doctor_id}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-card"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">Dr. {doctor.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {doctor.specialisation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Cases + Reports */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Cases</CardTitle>
              <CardDescription>
                {data.cases.total} total cases • {data.cases.open} open
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/cases" className="flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.cases.items.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No cases yet</p>
                <Button size="sm" asChild>
                  <Link to="/patient/cases">
                    <Plus className="w-4 h-4 mr-2" />
                    View Cases
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.cases.items.slice(0, 5).map((caseItem) => (
                  <Link
                    key={caseItem.case_id}
                    to={`/patient/cases/${caseItem.case_id}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {caseItem.chief_complaint || 'Untitled Case'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`ml-2 flex items-center gap-1 ${getStatusColor(caseItem.status)}`}
                    >
                      {getStatusIcon(caseItem.status)}
                      {caseItem.status.replace('_', ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
              <CardDescription>{data.reports.total} reports uploaded</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/reports" className="flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.reports.items.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No reports yet</p>
                <Button size="sm" asChild>
                  <Link to="/patient/reports">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Report
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.reports.items.slice(0, 5).map((report) => (
                  <div
                    key={report.report_id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{report.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(report.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="uppercase text-xs">
                      {report.file_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Charts Section */}
      {hasHealthData && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Health Trends</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Weight Chart */}
            {data.health_charts.weight_history.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    <CardTitle className="text-base">Weight History</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={weightChartConfig} className="h-[200px]">
                    <AreaChart data={data.health_charts.weight_history}>
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" domain={['dataMin - 2', 'dataMax + 2']} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="url(#weightGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Glucose Chart */}
            {data.health_charts.glucose_readings.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-info" />
                    <CardTitle className="text-base">Glucose Levels</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={glucoseChartConfig} className="h-[200px]">
                    <LineChart data={data.health_charts.glucose_readings}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="fasting"
                        stroke="hsl(var(--info))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="post_meal"
                        stroke="hsl(var(--warning))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Blood Pressure Chart */}
            {data.health_charts.blood_pressure.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive" />
                    <CardTitle className="text-base">Blood Pressure</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={bpChartConfig} className="h-[200px]">
                    <LineChart data={data.health_charts.blood_pressure}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="hsl(var(--info))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              asChild
            >
              <Link to="/patient/cases">
                <FileText className="w-6 h-6" />
                <span>My Cases</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              asChild
            >
              <Link to="/patient/reports">
                <Upload className="w-6 h-6" />
                <span>Upload Report</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              asChild
            >
              <Link to="/patient/chat">
                <Bot className="w-6 h-6" />
                <span>AI Chat</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              asChild
            >
              <Link to="/patient/appointments">
                <Calendar className="w-6 h-6" />
                <span>Appointments</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Stats Summary */}
      {(data.ai_stats.chat_count > 0 || data.ai_stats.analyses_count > 0) && (
        <Card className="glass-card bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Health Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.ai_stats.chat_count} chat sessions • {data.ai_stats.analyses_count} report analyses
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/patient/chat">
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
