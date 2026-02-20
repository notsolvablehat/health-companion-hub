import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  FileText,
  ClipboardCheck,
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Bot,
  Activity,
  UserCheck,
  AlertCircle,
  Stethoscope,
  TrendingUp,
  Sparkles,
  Calendar,
  BarChart3,
  Percent,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { parseBackendDate } from '@/lib/utils';

const DONUT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--info))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
];

const GENDER_COLORS = [
  'hsl(var(--info))',
  'hsl(var(--destructive))',
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main dashboard query
  const { data, isLoading, error } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => dashboardService.getDoctorDashboard(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  // Analytics query (independent)
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['doctor-analytics'],
    queryFn: () => dashboardService.getDoctorAnalytics(),
    staleTime: 1000 * 60 * 5,
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

  const getWorkloadColor = (percentage: number) => {
    if (percentage < 50) return 'bg-success';
    if (percentage < 80) return 'bg-warning';
    return 'bg-destructive';
  };

  const getWorkloadText = (percentage: number) => {
    if (percentage < 50) return 'Light workload';
    if (percentage < 80) return 'Moderate workload';
    return 'Heavy workload';
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year), parseInt(m) - 1);
    return format(date, 'MMM');
  };

  // Stats from mixed sources
  const stats = [
    {
      label: "Today's Appts",
      value: analytics?.appointments.today ?? '—',
      icon: Calendar,
      color: 'bg-primary/10 text-primary',
      href: '/doctor/appointments',
    },
    {
      label: 'This Week',
      value: analytics?.appointments.upcoming_week ?? '—',
      icon: Clock,
      color: 'bg-info/10 text-info',
      href: '/doctor/appointments',
    },
    {
      label: 'Completion Rate',
      value: analytics ? `${Math.round(analytics.appointments.completion_rate)}%` : '—',
      icon: Percent,
      color: 'bg-success/10 text-success',
      href: '/doctor/appointments',
    },
    {
      label: 'Open Cases',
      value: data.cases.open,
      icon: FileText,
      color: 'bg-warning/10 text-warning',
      href: '/doctor/cases?status=open',
    },
  ];

  // Chart configs
  const appointmentsByMonthConfig: ChartConfig = {
    count: { label: 'Appointments', color: 'hsl(var(--primary))' },
  };

  const genderConfig: ChartConfig = {
    male: { label: 'Male', color: 'hsl(var(--info))' },
    female: { label: 'Female', color: 'hsl(var(--destructive))' },
  };

  const ageGroupConfig: ChartConfig = {
    count: { label: 'Patients', color: 'hsl(var(--primary))' },
  };

  const caseTypeConfig: ChartConfig = {
    count: { label: 'Cases', color: 'hsl(var(--primary))' },
  };

  // Donut data for case types
  const caseTypeDonutData = analytics
    ? analytics.cases_by_type.filter((d) => d.count > 0)
    : [];

  // Gender pie data
  const genderPieData = analytics
    ? analytics.patient_demographics.by_gender.filter((d) => d.count > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, Dr. {data.user_info.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your practice overview • {data.user_info.specialisation}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/doctor/chat">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Link>
          </Button>
        </div>
      </div>

      {/* Workload Progress Card */}
      <Card className="glass-card bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Patient Load</h3>
                <p className="text-sm text-muted-foreground">
                  {data.patient_stats.active} of {data.patient_stats.max} patients •{' '}
                  {getWorkloadText(data.patient_stats.load_percentage)}
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold text-foreground">
              {Math.round(data.patient_stats.load_percentage)}%
            </span>
          </div>
          <div className="relative">
            <Progress
              value={data.patient_stats.load_percentage}
              className="h-3"
            />
            <div
              className={`absolute inset-0 h-3 rounded-full ${getWorkloadColor(
                data.patient_stats.load_percentage
              )} opacity-20`}
              style={{ width: `${data.patient_stats.load_percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

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

      {/* Analytics Charts Row 1: Appointments Over Time + Gender */}
      {analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Appointments Over Time */}
          {analytics.appointments.by_month.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Appointments Over Time
                </CardTitle>
                <CardDescription>Last 6 months • {analytics.appointments.total} total</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={appointmentsByMonthConfig} className="h-[220px]">
                  <BarChart data={analytics.appointments.by_month}>
                    <defs>
                      <linearGradient id="doctorApptGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} className="text-xs" />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="url(#doctorApptGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Patient Gender Distribution */}
          {genderPieData.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-info" />
                  Patient Gender Distribution
                </CardTitle>
                <CardDescription>
                  {genderPieData.reduce((sum, g) => sum + g.count, 0)} patients total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={genderConfig} className="h-[220px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="count"
                      nameKey="type"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {genderPieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {genderPieData.map((entry, index) => (
                    <div key={entry.type} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length] }}
                      />
                      <span className="text-muted-foreground capitalize">
                        {entry.type}: {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Analytics Charts Row 2: Age Groups + Case Types */}
      {analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Patient Age Groups */}
          {analytics.patient_demographics.by_age_group.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Patient Age Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ageGroupConfig} className="h-[220px]">
                  <BarChart
                    data={analytics.patient_demographics.by_age_group}
                    layout="vertical"
                  >
                    <defs>
                      <linearGradient id="ageGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" allowDecimals={false} />
                    <YAxis dataKey="type" type="category" className="text-xs" width={50} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="url(#ageGradient)"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Cases by Type Donut */}
          {caseTypeDonutData.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-info" />
                  Cases by Type
                </CardTitle>
                <CardDescription>
                  {caseTypeDonutData.reduce((sum, d) => sum + d.count, 0)} total cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={caseTypeConfig} className="h-[220px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={caseTypeDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="count"
                      nameKey="type"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {caseTypeDonutData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {caseTypeDonutData.map((entry, index) => (
                    <div key={entry.type} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                      />
                      <span className="text-muted-foreground capitalize">
                        {entry.type.replace('_', ' ')}: {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reports Stats + Pending Approvals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Report Analysis Stats */}
        {analytics && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                Report Analysis
              </CardTitle>
              <CardDescription>AI-powered report insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-5 rounded-xl bg-success/5 border border-success/10">
                  <p className="text-3xl font-bold text-success">{analytics.reports_analyzed}</p>
                  <p className="text-sm text-muted-foreground mt-1">Analyzed</p>
                </div>
                <div className="text-center p-5 rounded-xl bg-warning/5 border border-warning/10">
                  <p className="text-3xl font-bold text-warning">{analytics.reports_pending}</p>
                  <p className="text-sm text-muted-foreground mt-1">Pending</p>
                </div>
              </div>
              {(analytics.reports_analyzed + analytics.reports_pending) > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Analysis Progress</span>
                    <span className="font-medium">
                      {Math.round(
                        (analytics.reports_analyzed /
                          (analytics.reports_analyzed + analytics.reports_pending)) *
                          100
                      )}%
                    </span>
                  </div>
                  <Progress
                    value={
                      (analytics.reports_analyzed /
                        (analytics.reports_analyzed + analytics.reports_pending)) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Approvals */}
        <Card className="glass-card border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Pending Approvals
              </CardTitle>
              <CardDescription>Cases awaiting your review</CardDescription>
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
              <div className="space-y-3">
                {data.pending_approvals.slice(0, 5).map((approval) => (
                  <Link
                    key={approval.case_id}
                    to={`/doctor/cases/${approval.case_id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5 hover:bg-warning/10 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-warning" />
                        <p className="font-medium truncate">{approval.patient_name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {approval.chief_complaint || 'No complaint specified'}
                      </p>
                      <p className="text-xs text-muted-foreground">
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

      {/* Analytics loading skeleton */}
      {analyticsLoading && !analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      )}

      {/* Recent Cases + Case Status Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Cases</CardTitle>
              <CardDescription>{data.cases.total} total cases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/cases" className="flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.cases.items.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No cases assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.cases.items.slice(0, 5).map((caseItem) => (
                  <Link
                    key={caseItem.case_id}
                    to={`/doctor/cases/${caseItem.case_id}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {caseItem.chief_complaint || 'Untitled Case'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parseBackendDate(caseItem.created_at)
                          ? formatDistanceToNow(parseBackendDate(caseItem.created_at)!, {
                              addSuffix: true,
                            })
                          : 'Unknown'}
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

        {/* Case Status Overview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Case Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 rounded-xl bg-warning/10 border border-warning/20">
                <Clock className="w-5 h-5 mx-auto text-warning mb-2" />
                <p className="text-2xl font-bold text-warning">{data.cases.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-info/10 border border-info/20">
                <Activity className="w-5 h-5 mx-auto text-info mb-2" />
                <p className="text-2xl font-bold text-info">{data.cases.under_review}</p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle className="w-5 h-5 mx-auto text-success mb-2" />
                <p className="text-2xl font-bold text-success">{data.cases.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                <FileText className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold text-foreground">{data.cases.closed}</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <Link to="/doctor/patients">
                <Users className="w-6 h-6" />
                <span>View Patients</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              asChild
            >
              <Link to="/doctor/cases">
                <FileText className="w-6 h-6" />
                <span>Review Cases</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              asChild
            >
              <Link to="/doctor/chat">
                <Bot className="w-6 h-6" />
                <span>AI Assistant</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              asChild
            >
              <Link to="/doctor/appointments">
                <Calendar className="w-6 h-6" />
                <span>Appointments</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Stats Summary */}
      {(data.ai_stats.chat_count > 0 || data.ai_stats.analyses_count > 0) && (
        <Card className="glass-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Clinical Assistant</h3>
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
