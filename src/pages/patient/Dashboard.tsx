import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Heart, Activity, FileText, MessageCircle, Users } from 'lucide-react';
import type { PatientProfile } from '@/types/auth';

export default function PatientDashboard() {
  const { user, profile, logout } = useAuth();
  const patientProfile = profile as PatientProfile | null;

  const stats = [
    { label: 'Active Cases', value: '3', icon: FileText, color: 'bg-info/10 text-info' },
    { label: 'Reports', value: '12', icon: Activity, color: 'bg-success/10 text-success' },
    { label: 'My Doctors', value: '2', icon: Users, color: 'bg-warning/10 text-warning' },
    { label: 'Messages', value: '5', icon: MessageCircle, color: 'bg-primary/10 text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">HealthCare</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {patientProfile ? `${patientProfile.first_name} ${patientProfile.last_name}` : user?.email}
              </p>
              <p className="text-xs text-muted-foreground">Patient</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{patientProfile ? `, ${patientProfile.first_name}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your health journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass-card rounded-xl p-6 hover:shadow-elevated transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>New Case</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Activity className="w-6 h-6" />
              <span>Upload Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <MessageCircle className="w-6 h-6" />
              <span>AI Chat</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Find Doctor</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
