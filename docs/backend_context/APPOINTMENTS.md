# Appointments Module Documentation

## Overview
The appointments module handles the scheduling of consultations between patients and doctors. Unlike the assignment system which links a patient to a doctor for long-term care, appointments are for specific scheduled interactions.

---

## 1. Core Concepts

### **Appointment Booking**
- Patients can book 30-minute slots with their assigned doctors.
- Booking is instant (no approval required).
- Slots are currently hardcoded to Monday-Friday, 9:00 AM - 5:00 PM.

### **Appointment Types**
- **Consultation**: General check-up or new issue.
- **Follow-up**: Review progress or test results.
- **Emergency**: Urgent care needed.

### **Status Workflow**
1. **Scheduled**: Initial state upon booking.
2. **Completed**: Doctor marks as done after visit.
3. **Cancelled**: Patient or doctor cancels.
4. **No-show**: Patient missed the appointment.

---

## 2. API Endpoints

### **Get Appointments (Doctor View)**
Fetch all appointments for the logged-in doctor.

- **Endpoint**: `GET /appointments/doctor`
- **Auth**: Required (Doctor)
- **Parameters**: 
  - `start_date` (optional): Filter from this date
  - `end_date` (optional): Filter to this date
  - `status` (optional): Filter by status
- **Response**:
```json
{
  "count": 5,
  "appointments": [
    {
      "id": "appt-uuid-1",
      "patient_id": "patient-uuid-123",
      "patient_name": "John Doe",
      "start_time": "2026-01-25T10:00:00Z",
      "end_time": "2026-01-25T10:30:00Z",
      "type": "Consultation",
      "status": "Scheduled",
      "notes": "Recurring headache"
    }
  ]
}
```

### **Get Appointments (Patient View)**
Fetch all appointments for the logged-in patient.

- **Endpoint**: `GET /appointments/patient`
- **Auth**: Required (Patient)
- **Response**: Similar to doctor view but with `doctor_name` instead of `patient_name`.

### **Create Appointment**
Book a new appointment slot.

- **Endpoint**: `POST /appointments`
- **Auth**: Required (Patient)
- **Request Body**:
```json
{
  "doctor_id": "doctor-uuid-456",
  "start_time": "2026-01-25T10:00:00Z",
  "type": "Consultation",
  "reason": "Headache persisting for 3 days"
}
```
- **Response**:
```json
{
  "id": "appt-uuid-1",
  "status": "Scheduled",
  "message": "Appointment confirmed"
}
```

### **Update Status**
Cancel or complete an appointment.

- **Endpoint**: `PATCH /appointments/{id}/status`
- **Auth**: Required (Doctor or Patient for cancellation)
- **Request Body**:
```json
{
  "status": "Cancelled",
  "cancellation_reason": "Personal emergency"
}
```

---

## 3. Data Models (Typescript)

### **AppointmentType**
Enum: `'Consultation' | 'Follow-up' | 'Emergency'`

### **AppointmentStatus**
Enum: `'Scheduled' | 'Completed' | 'Cancelled' | 'No-show'`

### **Appointment**
```typescript
interface Appointment {
  id: string;
  doctor_id: string;
  doctor_name: string;
  patient_id: string;
  patient_name: string;
  start_time: string; // ISO DateTime
  end_time: string;   // ISO DateTime
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;    // Patient provided reason
  notes?: string;     // Doctor notes (internal)
}
```
