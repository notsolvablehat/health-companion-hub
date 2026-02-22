import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { isApiError } from '@/services/api';
import AuthLayout from '@/components/auth/AuthLayout';
import FormField from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const { user, isLoading, isOnboarded, login } = useAuth();
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
  } = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
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
          value: 6,
          message: 'Password must be at least 6 characters',
        },
      },
    },
    onSubmit: async (data) => {
      setApiError(null);
      try {
        await login(data);
      } catch (error) {
        if (isApiError(error)) {
          setApiError(error.message);
        } else {
          setApiError('An unexpected error occurred. Please try again.');
        }
      }
    },
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">
            {apiError}
          </div>
        )}

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
              autoComplete="current-password"
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

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign in
            </>
          )}
        </Button>

        <p className="text-center text-sm" style={{ color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-medium hover:text-teal-700 hover:underline transition-colors">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
