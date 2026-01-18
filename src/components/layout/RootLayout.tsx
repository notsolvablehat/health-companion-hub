import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';

/**
 * Root layout component that provides AuthContext to all routes.
 * This ensures a single AuthProvider instance for the entire application.
 */
export function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Outlet />
          <Toaster />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default RootLayout;
