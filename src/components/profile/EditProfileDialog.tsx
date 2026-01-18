import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { userService, type UpdateProfileRequest } from '@/services/user';
import type { PatientProfile } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PatientProfile;
}

export function EditProfileDialog({ open, onOpenChange, profile }: EditProfileDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();


  // Local state for comma-separated fields (to allow typing commas)
  const [allergiesText, setAllergiesText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [historyText, setHistoryText] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<UpdateProfileRequest & { name: string }>({
    defaultValues: {
      name: profile.name || '',
      date_of_birth: profile.date_of_birth || '',
      gender: profile.gender || 'Prefer not to say',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
      blood_group: profile.blood_group,
      height_cm: profile.height_cm,
      weight_kg: profile.weight_kg,
      allergies: profile.allergies || [],
      current_medications: profile.current_medications || [],
      medical_history: profile.medical_history || [],
      emergency_contact_name: profile.emergency_contact_name || '',
      emergency_contact_phone: profile.emergency_contact_phone || '',
      consent_hipaa: profile.consent_hipaa || true,
    },
  });

  // Reset form when dialog opens with current profile data
  useEffect(() => {
    if (open) {
      const formData = {
        name: profile.name || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || 'Prefer not to say',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        blood_group: profile.blood_group,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        allergies: profile.allergies || [],
        current_medications: profile.current_medications || [],
        medical_history: profile.medical_history || [],
        emergency_contact_name: profile.emergency_contact_name || '',
        emergency_contact_phone: profile.emergency_contact_phone || '',
        consent_hipaa: profile.consent_hipaa || true,
      };
      
      reset(formData);
      
      // Set text fields for comma-separated values
      setAllergiesText((profile.allergies || []).join(', '));
      setMedicationsText((profile.current_medications || []).join(', '));
      setHistoryText((profile.medical_history || []).join(', '));
    }
  }, [open, profile, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Profile Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: userService.updateName,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Name Update Failed',
        description: error.message || 'Failed to update name. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: UpdateProfileRequest & { name: string }) => {
    try {
      // Update name if changed
      if (data.name !== profile.name) {
        await updateNameMutation.mutateAsync(data.name);
      }

      // Update profile - ensure all required fields are present
      const { name, ...profileData } = data;
      
      // Make sure we have all required fields
      const completeProfileData: UpdateProfileRequest = {
        date_of_birth: profileData.date_of_birth,
        gender: profileData.gender,
        phone_number: profileData.phone_number,
        address: profileData.address,
        blood_group: profileData.blood_group,
        height_cm: profileData.height_cm,
        weight_kg: profileData.weight_kg,
        allergies: profileData.allergies || [],
        current_medications: profileData.current_medications || [],
        medical_history: profileData.medical_history || [],
        emergency_contact_name: profileData.emergency_contact_name,
        emergency_contact_phone: profileData.emergency_contact_phone,
        consent_hipaa: profileData.consent_hipaa,
      };

      await updateProfileMutation.mutateAsync(completeProfileData);
      
      // Show success message
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Close dialog after successful update
      onOpenChange(false);
    } catch (error) {
      // Errors are handled by mutation onError callbacks
      console.error('Profile update error:', error);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal and medical information. All fields are required unless marked optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                {...register('date_of_birth', { 
                  required: 'Date of birth is required',
                  pattern: {
                    value: /^\d{4}-\d{2}-\d{2}$/,
                    message: 'Please enter a valid date in YYYY-MM-DD format'
                  },
                  validate: (value) => {
                    const year = parseInt(value.split('-')[0]);
                    const currentYear = new Date().getFullYear();
                    if (year < 1900 || year > currentYear) {
                      return `Year must be between 1900 and ${currentYear}`;
                    }
                    return true;
                  }
                })}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={watch('gender')}
                onValueChange={(value) => setValue('gender', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                {...register('phone_number', { required: 'Phone number is required' })}
                placeholder="+1234567890"
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group (Optional)</Label>
              <Select
                value={watch('blood_group') || ''}
                onValueChange={(value) => setValue('blood_group', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address', { required: 'Address is required' })}
              placeholder="Enter your full address"
              rows={2}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height_cm">Height (cm) (Optional)</Label>
              <Input
                id="height_cm"
                type="number"
                step="0.1"
                {...register('height_cm', { valueAsNumber: true })}
                placeholder="175.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg) (Optional)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                {...register('weight_kg', { valueAsNumber: true })}
                placeholder="70.0"
              />
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (Optional)</Label>
            <Input
              id="allergies"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              onBlur={() => setValue('allergies', allergiesText.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Peanuts, Penicillin (comma separated)"
            />
            <p className="text-xs text-muted-foreground">Separate multiple allergies with commas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_medications">Current Medications (Optional)</Label>
            <Input
              id="current_medications"
              value={medicationsText}
              onChange={(e) => setMedicationsText(e.target.value)}
              onBlur={() => setValue('current_medications', medicationsText.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Aspirin, Metformin (comma separated)"
            />
            <p className="text-xs text-muted-foreground">Separate multiple medications with commas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_history">Medical History (Optional)</Label>
            <Input
              id="medical_history"
              value={historyText}
              onChange={(e) => setHistoryText(e.target.value)}
              onBlur={() => setValue('medical_history', historyText.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Appendectomy 2015, Diabetes (comma separated)"
            />
            <p className="text-xs text-muted-foreground">Separate multiple conditions with commas</p>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                {...register('emergency_contact_name', { required: 'Emergency contact name is required' })}
                placeholder="Jane Doe"
              />
              {errors.emergency_contact_name && (
                <p className="text-sm text-destructive">{errors.emergency_contact_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                {...register('emergency_contact_phone', { required: 'Emergency contact phone is required' })}
                placeholder="+0987654321"
              />
              {errors.emergency_contact_phone && (
                <p className="text-sm text-destructive">{errors.emergency_contact_phone.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProfileMutation.isPending || updateNameMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending || updateNameMutation.isPending}
            >
              {(updateProfileMutation.isPending || updateNameMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
