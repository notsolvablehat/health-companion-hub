import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            {apiError}
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            I am a <span className="text-destructive">*</span>
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
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border hover:border-primary/50 bg-transparent'
                  )}
                >
                  <div className={cn(
                    'p-2.5 rounded-lg transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'font-medium',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}>
                      {option.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
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
          className="w-full"
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

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
