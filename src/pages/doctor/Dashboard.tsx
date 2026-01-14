import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Heart, Users, FileText, ClipboardCheck, MessageCircle } from 'lucide-react';
import type { DoctorProfile } from '@/types/auth';

export default function DoctorDashboard() {
  const { user, profile, logout } = useAuth();
  const doctorProfile = profile as DoctorProfile | null;

  const stats = [
    { label: 'My Patients', value: doctorProfile?.current_patient_count ?? '0', max: doctorProfile?.max_patients, icon: Users, color: 'bg-info/10 text-info' },
    { label: 'Pending Cases', value: '7', icon: FileText, color: 'bg-warning/10 text-warning' },
    { label: 'Reviewed Today', value: '5', icon: ClipboardCheck, color: 'bg-success/10 text-success' },
    { label: 'Messages', value: '3', icon: MessageCircle, color: 'bg-primary/10 text-primary' },
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
                Dr. {doctorProfile ? `${doctorProfile.first_name} ${doctorProfile.last_name}` : user?.email}
              </p>
              <p className="text-xs text-muted-foreground">{doctorProfile?.specialisation || 'Doctor'}</p>
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
            Good morning{doctorProfile ? `, Dr. ${doctorProfile.last_name}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's your practice overview for today</p>
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
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  {stat.max && (
                    <span className="text-sm text-muted-foreground">/ {stat.max}</span>
                  )}
                </div>
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
              <Users className="w-6 h-6" />
              <span>View Patients</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>Review Cases</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <ClipboardCheck className="w-6 h-6" />
              <span>Add Notes</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <MessageCircle className="w-6 h-6" />
              <span>Messages</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
