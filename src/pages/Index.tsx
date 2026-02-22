import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Activity, Shield, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, isLoading, isOnboarded } = useAuth();

  if (!isLoading && user && isOnboarded) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  if (!isLoading && user && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const features = [
    {
      icon: Activity,
      title: 'Health Tracking',
      description: 'Monitor vitals, glucose, and blood pressure in a single view.',
    },
    {
      icon: Users,
      title: 'Doctor Connection',
      description: 'Get matched with specialists for your health needs.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'End-to-end encryption for all your health data.',
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Personalized recommendations powered by AI.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-foreground" />
            <span className="text-base font-semibold tracking-tight">HealthCare</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 lg:py-36">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6">
            AI-Powered Healthcare Platform
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
            Your Health Journey,{' '}
            <span className="text-muted-foreground">Simplified.</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Connect with specialists, manage records, and get personalized insights — all in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/register">
                Start for Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">I have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A comprehensive platform to manage your health, effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors"
                >
                  <Icon className="w-5 h-5 text-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="gradient-hero rounded-xl p-10 lg:p-16 text-center">
            <h2 className="text-2xl lg:text-3xl font-semibold text-primary-foreground mb-3">
              Ready to Take Control?
            </h2>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
              Join patients and providers who trust our platform for better outcomes.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HealthCare Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
