import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Stethoscope, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { isApiError } from '@/services/api';
import AuthLayout from '@/components/auth/AuthLayout';
import FormField from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export default function Register() {
  const { user, isLoading, isOnboarded, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Redirect logged-in users to their dashboard
  if (!isLoading && user && isOnboarded) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  // Redirect to onboarding if logged in but not onboarded
  if (!isLoading && user && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }


  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
  } = useForm<RegisterFormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
    },
    validationRules: {
      email: {
        required: 'Email is required',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Please enter a valid email address',
        },
      },
      password: {
        required: 'Password is required',
        minLength: {
          value: 8,
          message: 'Password must be at least 8 characters',
        },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: 'Password must contain uppercase, lowercase, and number',
        },
      },
      confirmPassword: {
        required: 'Please confirm your password',
        validate: (value, allValues) =>
          value === allValues.password || 'Passwords do not match',
      },
      role: {
        required: 'Please select a role',
      },
    },
    onSubmit: async (data) => {
      setApiError(null);
      try {
        await register({
          email: data.email,
          password: data.password,
          role: data.role,
        });
      } catch (error) {
        if (isApiError(error)) {
          if (error.message.toLowerCase().includes('already')) {
            setApiError('An account with this email already exists. Please sign in instead.');
          } else {
            setApiError(error.message);
          }
        } else {
          setApiError('An unexpected error occurred. Please try again.');
        }
      }
    },
  });

  const roleOptions = [
    {
      value: 'patient' as const,
      label: 'Patient',
      description: 'Track your health, connect with doctors',
      icon: User,
    },
    {
      value: 'doctor' as const,
      label: 'Doctor',
      description: 'Manage patients, review cases',
      icon: Stethoscope,
    },
  ];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join our healthcare platform today"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">
            {apiError}
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium" style={{ color: '#1e293b' }}>
            I am a <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = values.role === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('role', option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                    isSelected
                      ? 'border-teal-400 bg-teal-50 shadow-md shadow-teal-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <div className={cn(
                    'p-2.5 rounded-lg transition-colors',
                    isSelected ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'font-medium',
                      isSelected ? 'text-teal-700' : 'text-slate-700'
                    )}>
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <FormField
          label="Email address"
          name="email"
          error={errors.email}
          touched={touched.email}
          required
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && !!errors.email}
          />
        </FormField>

        <FormField
          label="Password"
          name="password"
          error={errors.password}
          touched={touched.password}
          required
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && !!errors.password}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </FormField>

        <FormField
          label="Confirm password"
          name="confirmPassword"
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          required
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && !!errors.confirmPassword}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Create account
            </>
          )}
        </Button>

        <p className="text-center text-sm" style={{ color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700 hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
