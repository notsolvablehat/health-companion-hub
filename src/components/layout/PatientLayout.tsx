import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export function PatientLayout() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar role="patient" />

      {/* Main Content Area */}
      <div className="lg:pl-56">
        <Header />
        
        <main className="p-4 lg:p-5 pb-20 lg:pb-5">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav role="patient" />
    </div>
  );
}

export default PatientLayout;
