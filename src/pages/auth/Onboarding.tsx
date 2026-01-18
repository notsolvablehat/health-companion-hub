import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, User, Calendar, Phone, MapPin, AlertCircle, Stethoscope, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { isApiError } from '@/services/api';
import FormField from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { GENDERS, SPECIALIZATIONS, COMMON_ALLERGIES, COMMON_CONDITIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PatientFormValues {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  medical_history: string[];
  allergies: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

interface DoctorFormValues {
  first_name: string;
  last_name: string;
  specialisation: string;
  license_number: string;
  phone: string;
  max_patients: number;
}

export default function Onboarding() {
  const { user, isLoading, isOnboarded, onboardPatient, onboardDoctor, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);

  // Patient form
  const patientForm = useForm<PatientFormValues>({
    initialValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      phone: '',
      address: '',
      medical_history: [],
      allergies: [],
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
    },
    validationRules: {
      first_name: { required: 'First name is required' },
      last_name: { required: 'Last name is required' },
      date_of_birth: { required: 'Date of birth is required' },
      gender: { required: 'Please select your gender' },
    },
    onSubmit: async (data) => {
      setApiError(null);
      try {
        await onboardPatient(data);
      } catch (error) {
        if (isApiError(error)) {
          // If user is already onboarded, refetch and redirect
          if (error.message.toLowerCase().includes('already onboarded')) {
            await refetchUser();
            navigate('/patient/dashboard');
            return;
          }
          setApiError(error.message);
        } else {
          setApiError('An unexpected error occurred. Please try again.');
        }
      }
    },
  });

  // Doctor form
  const doctorForm = useForm<DoctorFormValues>({
    initialValues: {
      first_name: '',
      last_name: '',
      specialisation: '',
      license_number: '',
      phone: '',
      max_patients: 20,
    },
    validationRules: {
      first_name: { required: 'First name is required' },
      last_name: { required: 'Last name is required' },
      specialisation: { required: 'Specialization is required' },
      license_number: { required: 'License number is required' },
    },
    onSubmit: async (data) => {
      setApiError(null);
      try {
        await onboardDoctor(data);
      } catch (error) {
        if (isApiError(error)) {
          // If user is already onboarded, refetch and redirect
          if (error.message.toLowerCase().includes('already onboarded')) {
            await refetchUser();
            navigate('/doctor/dashboard');
            return;
          }
          setApiError(error.message);
        } else {
          setApiError('An unexpected error occurred. Please try again.');
        }
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Doctors don't have onboarding - redirect to dashboard
  if (user.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (isOnboarded) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  // At this point, user is a patient who needs onboarding
  const totalSteps = 3;
  const form = patientForm;

  const toggleArrayItem = (field: 'medical_history' | 'allergies', item: string) => {
    const currentArray = patientForm.values[field];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    patientForm.setValue(field, newArray);
  };

  const renderPatientStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
              <p className="text-muted-foreground mt-1">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="first_name"
                error={patientForm.errors.first_name}
                touched={patientForm.touched.first_name}
                required
              >
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="John"
                  value={patientForm.values.first_name}
                  onChange={patientForm.handleChange}
                  onBlur={patientForm.handleBlur}
                  error={patientForm.touched.first_name && !!patientForm.errors.first_name}
                />
              </FormField>

              <FormField
                label="Last Name"
                name="last_name"
                error={patientForm.errors.last_name}
                touched={patientForm.touched.last_name}
                required
              >
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Doe"
                  value={patientForm.values.last_name}
                  onChange={patientForm.handleChange}
                  onBlur={patientForm.handleBlur}
                  error={patientForm.touched.last_name && !!patientForm.errors.last_name}
                />
              </FormField>
            </div>

            <FormField
              label="Date of Birth"
              name="date_of_birth"
              error={patientForm.errors.date_of_birth}
              touched={patientForm.touched.date_of_birth}
              required
            >
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={patientForm.values.date_of_birth}
                onChange={patientForm.handleChange}
                onBlur={patientForm.handleBlur}
                error={patientForm.touched.date_of_birth && !!patientForm.errors.date_of_birth}
              />
            </FormField>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Gender <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {GENDERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => patientForm.setValue('gender', option.value as 'male' | 'female' | 'other')}
                    className={cn(
                      'py-3 px-4 rounded-lg border-2 font-medium transition-all',
                      patientForm.values.gender === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone" name="phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={patientForm.values.phone}
                    onChange={patientForm.handleChange}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Address" name="address">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="City, State"
                    value={patientForm.values.address}
                    onChange={patientForm.handleChange}
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Medical History</h2>
              <p className="text-muted-foreground mt-1">Help us understand your health background</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">
                Existing Conditions
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => toggleArrayItem('medical_history', condition)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all',
                      patientForm.values.medical_history.includes(condition)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">
                Known Allergies
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleArrayItem('allergies', allergy)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all',
                      patientForm.values.allergies.includes(allergy)
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Emergency Contact</h2>
              <p className="text-muted-foreground mt-1">Someone we can reach in case of emergency</p>
            </div>

            <FormField label="Contact Name" name="emergency_contact_name">
              <Input
                id="emergency_contact_name"
                name="emergency_contact_name"
                placeholder="Jane Doe"
                value={patientForm.values.emergency_contact_name}
                onChange={patientForm.handleChange}
              />
            </FormField>

            <FormField label="Contact Phone" name="emergency_contact_phone">
              <Input
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={patientForm.values.emergency_contact_phone}
                onChange={patientForm.handleChange}
              />
            </FormField>

            <FormField label="Relationship" name="emergency_contact_relationship">
              <Input
                id="emergency_contact_relationship"
                name="emergency_contact_relationship"
                placeholder="Spouse, Parent, Sibling..."
                value={patientForm.values.emergency_contact_relationship}
                onChange={patientForm.handleChange}
              />
            </FormField>
          </div>
        );

      default:
        return null;
    }
  };

  const renderDoctorStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
              <p className="text-muted-foreground mt-1">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="first_name"
                error={doctorForm.errors.first_name}
                touched={doctorForm.touched.first_name}
                required
              >
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="John"
                  value={doctorForm.values.first_name}
                  onChange={doctorForm.handleChange}
                  onBlur={doctorForm.handleBlur}
                  error={doctorForm.touched.first_name && !!doctorForm.errors.first_name}
                />
              </FormField>

              <FormField
                label="Last Name"
                name="last_name"
                error={doctorForm.errors.last_name}
                touched={doctorForm.touched.last_name}
                required
              >
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Doe"
                  value={doctorForm.values.last_name}
                  onChange={doctorForm.handleChange}
                  onBlur={doctorForm.handleBlur}
                  error={doctorForm.touched.last_name && !!doctorForm.errors.last_name}
                />
              </FormField>
            </div>

            <FormField label="Phone" name="phone">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={doctorForm.values.phone}
                  onChange={doctorForm.handleChange}
                  className="pl-10"
                />
              </div>
            </FormField>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Professional Details</h2>
              <p className="text-muted-foreground mt-1">Your credentials and specialization</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">
                Specialization <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => doctorForm.setValue('specialisation', spec)}
                    className={cn(
                      'py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all text-left',
                      doctorForm.values.specialisation === spec
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              {doctorForm.touched.specialisation && doctorForm.errors.specialisation && (
                <p className="text-sm text-destructive">{doctorForm.errors.specialisation}</p>
              )}
            </div>

            <FormField
              label="Medical License Number"
              name="license_number"
              error={doctorForm.errors.license_number}
              touched={doctorForm.touched.license_number}
              required
            >
              <Input
                id="license_number"
                name="license_number"
                placeholder="MD-123456"
                value={doctorForm.values.license_number}
                onChange={doctorForm.handleChange}
                onBlur={doctorForm.handleBlur}
                error={doctorForm.touched.license_number && !!doctorForm.errors.license_number}
              />
            </FormField>

            <FormField label="Maximum Patients" name="max_patients">
              <Input
                id="max_patients"
                name="max_patients"
                type="number"
                min={1}
                max={100}
                value={doctorForm.values.max_patients}
                onChange={doctorForm.handleChange}
              />
            </FormField>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full font-medium transition-all',
                  s < step
                    ? 'bg-success text-success-foreground'
                    : s === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {apiError && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {apiError}
            </div>
          )}

          <form onSubmit={form.handleSubmit}>
            {renderPatientStep()}

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </Button>
              )}
              
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={form.isSubmitting}
                >
                  {form.isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
