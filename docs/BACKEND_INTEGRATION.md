# Healthcare Dashboard - Backend Integration Guide

## Project Structure Overview

```
src/
├── components/
│   ├── ui/                          # shadcn/ui components (no backend)
│   ├── layout/
│   │   ├── Sidebar.tsx              # Navigation (uses AuthContext)
│   │   ├── Header.tsx               # User menu (uses AuthContext)
│   │   ├── MobileNav.tsx            # Mobile nav (uses AuthContext)
│   │   ├── PatientLayout.tsx        # Patient wrapper
│   │   └── DoctorLayout.tsx         # Doctor wrapper
│   ├── common/
│   │   ├── LoadingSpinner.tsx       # No backend
│   │   ├── FormField.tsx            # No backend
│   │   └── ProtectedRoute.tsx       # Uses AuthContext
│   └── auth/
│       └── AuthLayout.tsx           # No backend
├── pages/
│   ├── auth/
│   │   ├── Login.tsx                # 🔌 Backend: POST /auth/login
│   │   ├── Register.tsx             # 🔌 Backend: POST /auth/register
│   │   └── Onboarding.tsx           # 🔌 Backend: POST /users/onboard
│   ├── patient/
│   │   ├── Dashboard.tsx            # 🔌 Backend: Multiple endpoints
│   │   ├── Cases.tsx                # 🔌 Backend: GET /cases
│   │   ├── CaseDetail.tsx           # 🔌 Backend: GET /cases/:id
│   │   ├── Reports.tsx              # 🔌 Backend: GET /reports
│   │   ├── MyDoctors.tsx            # 🔌 Backend: GET /assignments/doctors
│   │   └── Chat.tsx                 # 🔌 Backend: AI chat endpoints
│   ├── doctor/
│   │   ├── Dashboard.tsx            # 🔌 Backend: Multiple endpoints
│   │   ├── Patients.tsx             # 🔌 Backend: GET /assignments/patients
│   │   ├── PatientDetail.tsx        # 🔌 Backend: GET /patients/:id
│   │   ├── Cases.tsx                # 🔌 Backend: GET /cases
│   │   ├── CaseReview.tsx           # 🔌 Backend: GET/PUT /cases/:id
│   │   └── Chat.tsx                 # 🔌 Backend: AI chat endpoints
│   └── shared/
│       ├── Profile.tsx              # 🔌 Backend: GET/PUT /users/profile
│       └── Settings.tsx             # No backend (local preferences)
├── services/
│   ├── api.ts                       # Base HTTP client
│   ├── auth.ts                      # Auth API calls
│   ├── cases.ts                     # TODO: Case API calls
│   ├── reports.ts                   # TODO: Report API calls
│   ├── assignments.ts               # TODO: Assignment API calls
│   └── ai.ts                        # TODO: AI API calls
├── contexts/
│   ├── AuthContext.tsx              # Auth state management
│   └── ThemeContext.tsx             # Theme (local storage)
├── hooks/
│   └── useForm.ts                   # Form handling
├── types/
│   └── auth.ts                      # Auth types
└── lib/
    ├── utils.ts                     # Utility functions
    └── constants.ts                 # App constants
```

---

## API Endpoints Required

### 1. Authentication (`/auth`)

#### POST `/auth/register`
**Request:**
```typescript
{
  email: string;
  password: string;
  role: 'patient' | 'doctor';
}
```
**Response:**
```typescript
{
  access_token: string;
  token_type: 'bearer';
  user: {
    id: string;
    email: string;
    role: 'patient' | 'doctor';
    is_onboarded: boolean;
    created_at: string;
  }
}
```

#### POST `/auth/login`
**Request:**
```typescript
{
  email: string;
  password: string;
}
```
**Response:** Same as register

---

### 2. Users (`/users`)

#### GET `/users/me`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```typescript
{
  id: string;
  email: string;
  role: 'patient' | 'doctor';
  is_onboarded: boolean;
  created_at: string;
}
```

#### GET `/users/profile`
**Headers:** `Authorization: Bearer <token>`
**Response (Patient):**
```typescript
{
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;      // ISO date
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medical_history: string[];
  allergies: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}
```
**Response (Doctor):**
```typescript
{
  user_id: string;
  first_name: string;
  last_name: string;
  specialisation: string;
  license_number: string;
  phone?: string;
  max_patients: number;
  current_patient_count?: number;
}
```

#### POST `/users/onboard`
**Request (Patient):**
```typescript
{
  role: 'patient';
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medical_history?: string[];
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}
```
**Request (Doctor):**
```typescript
{
  role: 'doctor';
  first_name: string;
  last_name: string;
  specialisation: string;
  license_number: string;
  phone?: string;
  max_patients?: number;  // default: 20
}
```
**Response:** Returns the created profile

#### POST `/users/update-profile`
**Request:** Partial profile fields
**Response:** Updated profile

---

### 3. Cases (`/cases`)

#### GET `/cases`
**Query Params:**
```typescript
{
  status?: 'open' | 'in_review' | 'approved' | 'rejected' | 'closed';
  patient_id?: string;  // For doctors filtering
  page?: number;
  limit?: number;
}
```
**Response:**
```typescript
{
  items: Case[];
  total: number;
  page: number;
  limit: number;
}
```
**Case Type:**
```typescript
interface Case {
  id: string;
  patient_id: string;
  patient_name: string;           // For doctor view
  doctor_id?: string;
  doctor_name?: string;           // For patient view
  title: string;
  description: string;
  symptoms: string[];
  status: 'open' | 'in_review' | 'approved' | 'rejected' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  doctor_notes?: string;
  created_at: string;
  updated_at: string;
  report_count: number;           // Number of attached reports
}
```

#### POST `/cases`
**Request:**
```typescript
{
  title: string;
  description: string;
  symptoms: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';  // default: medium
}
```

#### GET `/cases/:id`
**Response:**
```typescript
{
  ...Case,
  reports: Report[];              // Attached reports
  timeline: TimelineEvent[];      // Status change history
}
```

#### PUT `/cases/:id`
**Request (Doctor reviewing):**
```typescript
{
  status: 'in_review' | 'approved' | 'rejected' | 'closed';
  doctor_notes?: string;
}
```

---

### 4. Reports (`/reports`)

#### GET `/reports`
**Query Params:**
```typescript
{
  case_id?: string;
  patient_id?: string;
  type?: 'lab' | 'imaging' | 'prescription' | 'other';
  page?: number;
  limit?: number;
}
```
**Response:**
```typescript
{
  items: Report[];
  total: number;
}
```
**Report Type:**
```typescript
interface Report {
  id: string;
  patient_id: string;
  case_id?: string;               // Optional link to case
  title: string;
  type: 'lab' | 'imaging' | 'prescription' | 'other';
  file_url: string;
  file_name: string;
  file_size: number;              // bytes
  mime_type: string;
  notes?: string;
  ai_summary?: string;            // AI-generated summary
  uploaded_at: string;
}
```

#### POST `/reports`
**Content-Type:** `multipart/form-data`
**Request:**
```
file: File
title: string
type: 'lab' | 'imaging' | 'prescription' | 'other'
case_id?: string
notes?: string
```

#### GET `/reports/:id`
**Response:** Full report with AI analysis
```typescript
{
  ...Report,
  ai_analysis?: {
    summary: string;
    key_findings: string[];
    recommendations: string[];
    risk_indicators: string[];
  }
}
```

#### DELETE `/reports/:id`
**Response:** `204 No Content`

---

### 5. Assignments (`/assignments`)

#### GET `/assignments/doctors`
**For Patients - Get assigned doctors**
**Response:**
```typescript
{
  items: AssignedDoctor[];
}
```
```typescript
interface AssignedDoctor {
  assignment_id: string;
  doctor_id: string;
  first_name: string;
  last_name: string;
  specialisation: string;
  phone?: string;
  assigned_at: string;
  is_primary: boolean;
}
```

#### GET `/assignments/patients`
**For Doctors - Get assigned patients**
**Response:**
```typescript
{
  items: AssignedPatient[];
}
```
```typescript
interface AssignedPatient {
  assignment_id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  medical_history: string[];
  allergies: string[];
  assigned_at: string;
  last_case_date?: string;
  open_cases_count: number;
}
```

#### POST `/assignments`
**Admin/System endpoint to assign patient to doctor**
```typescript
{
  patient_id: string;
  doctor_id: string;
  is_primary?: boolean;
}
```

---

### 6. AI Features (`/ai`)

#### POST `/ai/chat`
**Request:**
```typescript
{
  message: string;
  context?: {
    patient_id?: string;          // For doctor queries about patient
    case_id?: string;
    include_medical_history?: boolean;
  }
}
```
**Response:**
```typescript
{
  id: string;
  message: string;
  sources?: {
    type: 'report' | 'case' | 'medical_knowledge';
    reference: string;
  }[];
  created_at: string;
}
```

#### GET `/ai/chat/history`
**Query Params:** `page`, `limit`
**Response:**
```typescript
{
  items: ChatMessage[];
  total: number;
}
```

#### POST `/ai/analyze-report`
**Request:**
```typescript
{
  report_id: string;
}
```
**Response:**
```typescript
{
  summary: string;
  key_findings: string[];
  recommendations: string[];
  risk_indicators: string[];
}
```

#### GET `/ai/insights/:patient_id`
**Response:**
```typescript
{
  patient_id: string;
  health_score: number;           // 0-100
  trends: {
    metric: string;
    direction: 'improving' | 'stable' | 'declining';
    data_points: { date: string; value: number }[];
  }[];
  alerts: {
    type: 'warning' | 'info';
    message: string;
    created_at: string;
  }[];
  recommendations: string[];
}
```

---

### 7. Dashboard Aggregates (`/dashboard`)

#### GET `/dashboard/patient`
**Response:**
```typescript
{
  stats: {
    open_cases: number;
    total_reports: number;
    assigned_doctors: number;
    health_score: number;
  };
  recent_cases: Case[];           // Last 5
  upcoming_actions: {
    type: 'case_update' | 'report_due' | 'appointment';
    title: string;
    due_date?: string;
  }[];
  health_trends: {
    metric: string;
    data: { date: string; value: number }[];
  }[];
}
```

#### GET `/dashboard/doctor`
**Response:**
```typescript
{
  stats: {
    total_patients: number;
    pending_cases: number;
    cases_reviewed_today: number;
    new_reports: number;
  };
  pending_cases: Case[];          // Cases needing review
  recent_patients: AssignedPatient[];  // Recently active
  workload: {
    date: string;
    cases_reviewed: number;
  }[];
}
```

---

## Component → Endpoint Mapping

| Component | Endpoint(s) Used | Data Expected |
|-----------|------------------|---------------|
| **Login.tsx** | `POST /auth/login` | AuthResponse |
| **Register.tsx** | `POST /auth/register` | AuthResponse |
| **Onboarding.tsx** | `POST /users/onboard` | UserProfile |
| **Header.tsx** | AuthContext (cached) | User + Profile |
| **Sidebar.tsx** | AuthContext (cached) | User role |
| **Patient/Dashboard.tsx** | `GET /dashboard/patient` | DashboardData |
| **Patient/Cases.tsx** | `GET /cases` | PaginatedCases |
| **Patient/CaseDetail.tsx** | `GET /cases/:id` | CaseWithReports |
| **Patient/Reports.tsx** | `GET /reports` | PaginatedReports |
| **Patient/MyDoctors.tsx** | `GET /assignments/doctors` | AssignedDoctors |
| **Patient/Chat.tsx** | `POST /ai/chat`, `GET /ai/chat/history` | ChatMessages |
| **Doctor/Dashboard.tsx** | `GET /dashboard/doctor` | DashboardData |
| **Doctor/Patients.tsx** | `GET /assignments/patients` | AssignedPatients |
| **Doctor/PatientDetail.tsx** | `GET /patients/:id`, `GET /ai/insights/:id` | PatientDetails + Insights |
| **Doctor/Cases.tsx** | `GET /cases` (filtered) | PaginatedCases |
| **Doctor/CaseReview.tsx** | `GET /cases/:id`, `PUT /cases/:id` | Case + Reports |
| **Doctor/Chat.tsx** | `POST /ai/chat`, `GET /ai/chat/history` | ChatMessages |
| **Profile.tsx** | `GET /users/profile`, `POST /users/update-profile` | UserProfile |

---

## Services to Create

### `src/services/cases.ts`
```typescript
export const casesService = {
  list: (params) => api.get('/cases', { params }),
  get: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
};
```

### `src/services/reports.ts`
```typescript
export const reportsService = {
  list: (params) => api.get('/reports', { params }),
  get: (id) => api.get(`/reports/${id}`),
  upload: (formData) => api.post('/reports', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  delete: (id) => api.delete(`/reports/${id}`),
};
```

### `src/services/assignments.ts`
```typescript
export const assignmentsService = {
  getMyDoctors: () => api.get('/assignments/doctors'),
  getMyPatients: () => api.get('/assignments/patients'),
};
```

### `src/services/ai.ts`
```typescript
export const aiService = {
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  getChatHistory: (params) => api.get('/ai/chat/history', { params }),
  analyzeReport: (reportId) => api.post('/ai/analyze-report', { report_id: reportId }),
  getPatientInsights: (patientId) => api.get(`/ai/insights/${patientId}`),
};
```

### `src/services/dashboard.ts`
```typescript
export const dashboardService = {
  getPatientDashboard: () => api.get('/dashboard/patient'),
  getDoctorDashboard: () => api.get('/dashboard/doctor'),
};
```

---

## Types to Create

### `src/types/case.ts`
```typescript
export type CaseStatus = 'open' | 'in_review' | 'approved' | 'rejected' | 'closed';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Case {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id?: string;
  doctor_name?: string;
  title: string;
  description: string;
  symptoms: string[];
  status: CaseStatus;
  priority: CasePriority;
  doctor_notes?: string;
  created_at: string;
  updated_at: string;
  report_count: number;
}

export interface CaseDetail extends Case {
  reports: Report[];
  timeline: TimelineEvent[];
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  symptoms: string[];
  priority?: CasePriority;
}

export interface UpdateCaseRequest {
  status?: CaseStatus;
  doctor_notes?: string;
}
```

### `src/types/report.ts`
```typescript
export type ReportType = 'lab' | 'imaging' | 'prescription' | 'other';

export interface Report {
  id: string;
  patient_id: string;
  case_id?: string;
  title: string;
  type: ReportType;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  notes?: string;
  ai_summary?: string;
  uploaded_at: string;
}

export interface ReportAnalysis {
  summary: string;
  key_findings: string[];
  recommendations: string[];
  risk_indicators: string[];
}

export interface UploadReportRequest {
  file: File;
  title: string;
  type: ReportType;
  case_id?: string;
  notes?: string;
}
```

### `src/types/assignment.ts`
```typescript
export interface AssignedDoctor {
  assignment_id: string;
  doctor_id: string;
  first_name: string;
  last_name: string;
  specialisation: string;
  phone?: string;
  assigned_at: string;
  is_primary: boolean;
}

export interface AssignedPatient {
  assignment_id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  medical_history: string[];
  allergies: string[];
  assigned_at: string;
  last_case_date?: string;
  open_cases_count: number;
}
```

### `src/types/ai.ts`
```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  sources?: {
    type: 'report' | 'case' | 'medical_knowledge';
    reference: string;
  }[];
  created_at: string;
}

export interface PatientInsights {
  patient_id: string;
  health_score: number;
  trends: {
    metric: string;
    direction: 'improving' | 'stable' | 'declining';
    data_points: { date: string; value: number }[];
  }[];
  alerts: {
    type: 'warning' | 'info';
    message: string;
    created_at: string;
  }[];
  recommendations: string[];
}
```

### `src/types/dashboard.ts`
```typescript
export interface PatientDashboard {
  stats: {
    open_cases: number;
    total_reports: number;
    assigned_doctors: number;
    health_score: number;
  };
  recent_cases: Case[];
  upcoming_actions: {
    type: 'case_update' | 'report_due' | 'appointment';
    title: string;
    due_date?: string;
  }[];
  health_trends: {
    metric: string;
    data: { date: string; value: number }[];
  }[];
}

export interface DoctorDashboard {
  stats: {
    total_patients: number;
    pending_cases: number;
    cases_reviewed_today: number;
    new_reports: number;
  };
  pending_cases: Case[];
  recent_patients: AssignedPatient[];
  workload: {
    date: string;
    cases_reviewed: number;
  }[];
}
```

---

## Error Response Format

All API errors should follow:
```typescript
{
  detail: string;           // Human-readable message
  status: number;           // HTTP status code
  errors?: {                // Field-level validation errors
    [field: string]: string[];
  };
}
```

---

## Authentication Flow

1. User registers/logs in → receives `access_token`
2. Token stored in `localStorage` with expiry
3. All subsequent requests include `Authorization: Bearer <token>`
4. On 401 response → token cleared → redirect to `/login`
5. Token auto-checked on app load via `GET /users/me`

---

## Next Steps for Backend Development

1. **Priority 1:** Auth endpoints (`/auth/register`, `/auth/login`)
2. **Priority 2:** User endpoints (`/users/me`, `/users/profile`, `/users/onboard`)
3. **Priority 3:** Cases CRUD (`/cases`)
4. **Priority 4:** Reports with file upload (`/reports`)
5. **Priority 5:** Assignments (`/assignments`)
6. **Priority 6:** Dashboard aggregates (`/dashboard`)
7. **Priority 7:** AI features (`/ai`)
