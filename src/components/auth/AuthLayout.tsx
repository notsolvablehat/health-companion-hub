import { ReactNode } from 'react';
import { Heart, Activity, Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-primary-foreground/30" />
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border-2 border-primary-foreground/20" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border-2 border-primary-foreground/25" />
        </div>
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-primary-foreground">HealthCare</span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
              Your Health Journey,<br />
              <span className="text-primary-foreground/80">Simplified.</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-md">
              Connect with specialists, manage your health records, and get AI-powered insights all in one place.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/90">Track glucose levels and health metrics</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/90">Secure, HIPAA-compliant data storage</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 text-primary-foreground/50 text-sm">
          © 2024 HealthCare Platform. All rights reserved.
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-primary">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">HealthCare</span>
          </div>
          
          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>
          
          {/* Form content */}
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
