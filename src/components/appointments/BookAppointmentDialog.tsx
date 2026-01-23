import { useState, useMemo } from 'react';
import { format, addDays, isSameDay, setHours, setMinutes, isBefore, startOfToday, isWeekend } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMyDoctors } from '@/hooks/queries/useAssignmentQueries';
import { useCreateAppointment } from '@/hooks/queries/useAppointmentQueries';
import { CalendarDays, Clock, User, FileText, Loader2, Plus, AlertCircle } from 'lucide-react';
import { AppointmentType } from '@/types/appointment';
import { toast } from 'sonner';

/**
 * Helper to generate time slots
 * Mon-Fri, 9 AM - 5 PM (17:00), 30 min intervals
 */
const generateTimeSlots = (selectedDate: Date | undefined) => {
  if (!selectedDate || isWeekend(selectedDate)) return [];

  const slots: Date[] = [];
  let currentTime = setMinutes(setHours(selectedDate, 9), 0); // 9:00 AM
  const endTime = setMinutes(setHours(selectedDate, 17), 0); // 5:00 PM

  const now = new Date();

  while (isBefore(currentTime, endTime)) {
    // If today, filter out past times
    if (isSameDay(selectedDate, now) && isBefore(currentTime, now)) {
      currentTime = setMinutes(currentTime, currentTime.getMinutes() + 30);
      continue;
    }
    slots.push(new Date(currentTime));
    currentTime = setMinutes(currentTime, currentTime.getMinutes() + 30);
  }

  return slots;
};

export function BookAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(''); // ISO string
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('Consultation');
  const [reason, setReason] = useState('');

  const { data: doctorsData, isLoading: isLoadingDoctors } = useMyDoctors();
  const createMutation = useCreateAppointment();

  // Filter only active doctors
  const doctors = doctorsData?.doctors || [];

  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const handleBook = async () => {
    if (!selectedDoctorId || !selectedTimeSlot || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createMutation.mutateAsync({
        doctor_id: selectedDoctorId,
        start_time: selectedTimeSlot,
        type: appointmentType,
        reason: reason,
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      // handled by mutation
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDoctorId('');
    setSelectedDate(addDays(new Date(), 1));
    setSelectedTimeSlot('');
    setReason('');
  };

  const selectedDoctor = doctors.find(d => d.user_id === selectedDoctorId);

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Doctor Selection */}
              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger disabled={isLoadingDoctors || doctors.length === 0}>
                    <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Choose a doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doc => (
                      <SelectItem key={doc.user_id} value={doc.user_id}>
                        {doc.name} ({doc.specialisation})
                      </SelectItem>
                    ))}
                    {doctors.length === 0 && !isLoadingDoctors && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No doctors assigned. Please request a doctor assignment first.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <Select value={appointmentType} onValueChange={(val: AppointmentType) => setAppointmentType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <div className="border rounded-md p-2 flex justify-center bg-card">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isBefore(date, startOfToday()) || isWeekend(date)}
                    initialFocus
                    className="p-0"
                  />
                </div>
                {selectedDate && isWeekend(selectedDate) && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Weekends are not available.
                  </p>
                )}
              </div>

              <Button 
                className="w-full mt-2" 
                onClick={() => setStep(2)}
                disabled={!selectedDoctorId || !selectedDate || isWeekend(selectedDate!)}
              >
                Next: Select Time
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-medium">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '-'}</span>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <Label>Summary & Time</Label>
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2">
                    {timeSlots.map((slot) => {
                      const slotIso = slot.toISOString();
                      const isSelected = selectedTimeSlot === slotIso;
                      return (
                        <Button
                          key={slotIso}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={isSelected ? "border-primary" : ""}
                          onClick={() => setSelectedTimeSlot(slotIso)}
                        >
                          {format(slot, 'h:mm a')}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-center py-4 text-muted-foreground bg-muted/50 rounded-md">
                    No slots available for this date.
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason for Visit</Label>
                <Textarea 
                  placeholder="Briefly describe your symptoms or reason for visit..." 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleBook}
                  disabled={!selectedTimeSlot || !reason || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
