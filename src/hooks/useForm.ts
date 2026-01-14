import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: T[K], allValues: T) => string | true;
  };
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  reset: () => void;
  setError: (name: keyof T, message: string) => void;
}

export function useForm<T extends object>({
  initialValues,
  validationRules = {} as ValidationRules<T>,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: unknown): string | null => {
      const rules = validationRules[name];
      if (!rules) return null;

      if (rules.required) {
        const isEmpty = value === undefined || value === null || value === '';
        if (isEmpty) {
          return typeof rules.required === 'string' ? rules.required : 'This field is required';
        }
      }

      if (value === undefined || value === null || value === '') return null;

      const strValue = String(value);

      if (rules.minLength && strValue.length < rules.minLength.value) {
        return rules.minLength.message;
      }

      if (rules.maxLength && strValue.length > rules.maxLength.value) {
        return rules.maxLength.message;
      }

      if (rules.pattern && !rules.pattern.value.test(strValue)) {
        return rules.pattern.message;
      }

      if (rules.validate) {
        const result = rules.validate(value as T[keyof T], values);
        if (result !== true) return result;
      }

      return null;
    },
    [validationRules, values]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isFormValid = true;

    (Object.keys(validationRules) as Array<keyof T>).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [validateField, validationRules, values]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      
      let finalValue: unknown = value;
      
      if (type === 'checkbox' && 'checked' in e.target) {
        finalValue = (e.target as HTMLInputElement).checked;
      }
      
      setValuesState((prev) => ({ ...prev, [name]: finalValue }));
      
      if (errors[name as keyof T]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name as keyof T];
          return next;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      
      const error = validateField(name as keyof T, values[name as keyof T]);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField, values]
  );

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((name: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      
      const allTouched = Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);
      
      if (!validateAll()) return;
      
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validateAll, validationRules, values]
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    setValue,
    setValues,
    handleSubmit,
    reset,
    setError,
  };
}

export default useForm;
