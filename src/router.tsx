import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Layouts
import RootLayout from '@/components/layout/RootLayout';
import PatientLayout from '@/components/layout/PatientLayout';
import DoctorLayout from '@/components/layout/DoctorLayout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Onboarding from '@/pages/auth/Onboarding';

// Patient Pages
import PatientDashboard from '@/pages/patient/Dashboard';
import PatientCases from '@/pages/patient/Cases';
import PatientCaseDetail from '@/pages/patient/CaseDetail';
import PatientReportInsights from '@/pages/patient/ReportInsights';
import PatientBookings from '@/pages/patient/Bookings';
import PatientChat from '@/pages/patient/Chat';

// Doctor Pages
import DoctorDashboard from '@/pages/doctor/Dashboard';
import DoctorReportInsights from '@/pages/doctor/ReportInsights';
import DoctorPatientDetail from '@/pages/doctor/PatientDetail';
import DoctorCases from '@/pages/doctor/Cases';
import DoctorCaseReview from '@/pages/doctor/CaseReview';
import DoctorCaseFullData from '@/pages/doctor/CaseFullData';
import DoctorCreateCase from '@/pages/doctor/CreateCase';
import DoctorBookings from '@/pages/doctor/Bookings';
import DoctorChat from '@/pages/doctor/Chat';

// Shared Pages
import Profile from '@/pages/shared/Profile';
import Settings from '@/pages/shared/Settings';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public Routes
      {
        path: '/',
        element: <Index />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      
      // Onboarding (authenticated but not onboarded)
      {
        path: '/onboarding',
        element: <ProtectedRoute requireOnboarded={false} />,
        children: [
          {
            index: true,
            element: <Onboarding />,
          },
        ],
      },
      
      // Patient Routes
      {
        element: <ProtectedRoute allowedRoles={['patient']} />,
        children: [
          {
            element: <PatientLayout />,
            children: [
              {
                path: '/patient/dashboard',
                element: <PatientDashboard />,
              },
              {
                path: '/patient/cases',
                element: <PatientCases />,
              },
              {
                path: '/patient/cases/:caseId',
                element: <PatientCaseDetail />,
              },
              {
                path: '/patient/reports',
                element: <PatientReportInsights />,
              },
              {
                path: '/patient/bookings',
                element: <PatientBookings />,
              },
              {
                path: '/patient/chat',
                element: <PatientChat />,
              },
              {
                path: '/patient/chat/:chatId',
                element: <PatientChat />,
              },
              {
                path: '/patient/profile',
                element: <Profile />,
              },
              {
                path: '/patient/settings',
                element: <Settings />,
              },
            ],
          },
        ],
      },
      
      // Doctor Routes
      {
        element: <ProtectedRoute allowedRoles={['doctor']} />,
        children: [
          {
            element: <DoctorLayout />,
            children: [
              {
                path: '/doctor/dashboard',
                element: <DoctorDashboard />,
              },
              {
                path: '/doctor/reports',
                element: <DoctorReportInsights />,
              },
              {
                path: '/doctor/patients/:patientId',
                element: <DoctorPatientDetail />,
              },
              {
                path: '/doctor/cases',
                element: <DoctorCases />,
              },
              {
                path: '/doctor/cases/new',
                element: <DoctorCreateCase />,
              },
              {
                path: '/doctor/cases/:caseId',
                element: <DoctorCaseReview />,
              },
              {
                path: '/doctor/cases/:caseId/full-data',
                element: <DoctorCaseFullData />,
              },
              {
                path: '/doctor/bookings',
                element: <DoctorBookings />,
              },
              {
                path: '/doctor/chat',
                element: <DoctorChat />,
              },
              {
                path: '/doctor/chat/:chatId',
                element: <DoctorChat />,
              },
              {
                path: '/doctor/profile',
                element: <Profile />,
              },
              {
                path: '/doctor/settings',
                element: <Settings />,
              },
            ],
          },
        ],
      },
      
      // Shared Routes Redirects
      {
        path: '/profile',
        element: <Navigate to="/patient/profile" replace />,
      },
      {
        path: '/settings',
        element: <Navigate to="/patient/settings" replace />,
      },
      
      // 404
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
