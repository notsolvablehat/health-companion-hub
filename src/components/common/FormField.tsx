import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  name,
  error,
  touched,
  required,
  children,
  className,
}: FormFieldProps) {
  const showError = touched && error;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} error={!!showError}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {showError && (
        <p className="text-sm text-destructive animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
