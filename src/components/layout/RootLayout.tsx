import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Root layout component that provides AuthContext to all routes.
 * This ensures a single AuthProvider instance for the entire application.
 */
export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default RootLayout;
