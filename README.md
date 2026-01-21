# Healthcare Dashboard - Frontend

A modern healthcare management dashboard connecting Patients and Doctors with AI-powered insights.

## 🏗️ Architecture

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components (AuthLayout)
│   ├── common/          # Shared components (LoadingSpinner, ProtectedRoute, OfflineIndicator)
│   ├── layout/          # Layout components (Sidebar, Header, MobileNav, PatientLayout, DoctorLayout)
│   ├── profile/         # Profile components (EditProfileDialog)
│   └── ui/              # shadcn/ui components
│
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state & methods
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx # Theme (light/dark) management
│
├── hooks/               # Custom React hooks
│   ├── queries/         # TanStack Query hooks
│   │   ├── useAIQueries.ts       # AI chat & analysis
│   │   ├── useAssignmentQueries.ts # Doctor-Patient bookings
│   │   ├── useAuthQueries.ts     # Authentication
│   │   ├── useCaseQueries.ts     # Medical cases
│   │   └── useReportQueries.ts   # File uploads
│   ├── useForm.ts       # Form validation hook
│   ├── useOffline.ts    # Online/offline detection
│   └── use-mobile.tsx   # Mobile detection
│
├── lib/                 # Utilities & constants
│   ├── constants.ts     # App constants, query keys, routes
│   └── utils.ts         # Helper functions
│
├── pages/               # Route pages
│   ├── auth/            # Login, Register, Onboarding
│   ├── doctor/          # Doctor-specific pages
│   │   ├── Bookings.tsx # Patient assignments management
│   │   ├── Cases.tsx    # Case list & review
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   └── Chat.tsx     # AI chat
│   ├── patient/         # Patient-specific pages
│   │   ├── Bookings.tsx # Doctor assignments view
│   │   ├── Cases.tsx    # Case list & details
│   │   ├── Dashboard.tsx
│   │   ├── Reports.tsx  # File uploads
│   │   └── Chat.tsx     # AI chat
│   └── shared/          # Pages for both roles (Profile, Settings)
│
├── services/            # API service layer
│   ├── api.ts           # Base HTTP client with auth
│   ├── auth.ts          # Authentication endpoints
│   ├── assignments.ts   # Doctor-Patient bookings
│   ├── cases.ts         # Medical case CRUD
│   ├── reports.ts       # File upload flow
│   ├── ai.ts            # AI chat & analysis
│   └── users.ts         # User profile management
│
├── types/               # TypeScript type definitions
│   ├── auth.ts          # User, Profile types
│   ├── assignment.ts    # Booking/assignment types
│   ├── case.ts          # Medical case types (SOAP structure)
│   ├── report.ts        # File upload types
│   └── ai.ts            # AI chat & analysis types
│
├── router.tsx           # React Router configuration
├── App.tsx              # App entry with providers
└── main.tsx             # React DOM render
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Routing | React Router v6 |
| State | TanStack Query v5 |
| UI | shadcn/ui + Tailwind CSS |
| Forms | Custom useForm hook |
| Charts | Recharts |
| Icons | Lucide React |

## 🔐 Authentication Flow

1. **Register** → Creates user with role (Patient/Doctor)
2. **Onboarding** → Completes medical/professional profile
3. **Login** → JWT token stored in localStorage
4. **Protected Routes** → Role-based access control

## 📱 Features

### Patient Features
- **Dashboard**: Health overview, recent cases, assigned doctors
- **Cases**: Create and track medical cases
- **Reports**: Upload medical documents (PDF, images)
- **Bookings**: View assigned doctors and history
- **AI Chat**: Chat with AI about health questions

### Doctor Features
- **Dashboard**: Patient overview, pending cases, workload
- **Patients**: Assigned patient list and profiles
- **Cases**: Review, approve/reject patient cases
- **Bookings**: Assign/discharge patients, view history
- **AI Chat**: AI-assisted patient analysis

## 🔌 Backend Integration

### API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Users | `GET /users/me`, `GET /users/profile`, `POST /users/onboard` |
| Assignments | `GET /assignments/patient`, `GET /assignments/doctors`, `POST /assignments/assign`, `POST /assignments/revoke` |
| Cases | `GET /cases`, `POST /cases`, `GET /cases/:id`, `PATCH /cases/:id` |
| Reports | `POST /reports/upload-url`, `POST /reports/:id/confirm`, `GET /reports/:id/download` |
| AI | `POST /ai/chat/start`, `POST /ai/chat/:id/message`, `GET /ai/chats` |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set environment variable
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Authentication state management |
| `src/services/api.ts` | HTTP client with token handling |
| `src/router.tsx` | Route definitions |
| `src/lib/constants.ts` | Query keys, routes, enums |
| `src/types/*.ts` | TypeScript interfaces |

## 🎨 Design System

- Uses CSS variables for theming (light/dark mode)
- Semantic color tokens: `--primary`, `--destructive`, `--success`, etc.
- Consistent spacing and typography via Tailwind

---

Built with ❤️ using [Lovable](https://lovable.dev)
