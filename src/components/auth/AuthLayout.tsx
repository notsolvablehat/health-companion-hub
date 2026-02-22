import { ReactNode, useEffect, useState } from 'react';
import { HeartPulse, Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const APP_NAMES = [
  { text: 'Swasth Dekhbhal', lang: 'en' },
  { text: 'स्वास्थ्य देखभाल', lang: 'hi' },
  { text: 'ಆರೋಗ್ಯ ರಕ್ಷಣೆ', lang: 'kn' },
  { text: 'சுகாதார பாதுகாப்பு', lang: 'ta' },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [nameIdx, setNameIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNameIdx((p) => (p + 1) % APP_NAMES.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#f8fafb' }}>
      {/* Soft pastel shapes - no gradients, just solid blurred circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full opacity-30"
          style={{ background: '#ccfbf1', filter: 'blur(80px)' }}
        />
        <div
          className="absolute top-[40%] -right-24 w-[350px] h-[350px] rounded-full opacity-25"
          style={{ background: '#fef3c7', filter: 'blur(80px)' }}
        />
        <div
          className="absolute -bottom-24 left-[30%] w-[380px] h-[380px] rounded-full opacity-20"
          style={{ background: '#ede9fe', filter: 'blur(80px)' }}
        />
      </div>

      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 0.6px, transparent 0.6px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-10 sm:py-14">
        {/* Brand header */}
        <Link to="/" className="flex items-center gap-3 mb-9 group">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'hsl(173, 58%, 39%)' }}
          >
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          {/* Rotating multilingual name */}
          <div className="relative h-8 w-56 overflow-hidden">
            {APP_NAMES.map((n, i) => (
              <span
                key={n.lang}
                className={`absolute inset-0 flex items-center text-xl font-bold tracking-tight transition-all duration-500 ${
                  i === nameIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
                style={{ color: '#1e293b' }}
              >
                {n.text}
              </span>
            ))}
          </div>
        </Link>

        {/* Form card */}
        <div className="w-full max-w-[400px]">
          <div
            className="rounded-2xl p-7 sm:p-9"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 24px -8px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Accent bar */}
            <div className="flex gap-1.5 mb-6 justify-center">
              <div className="h-1 w-8 rounded-full" style={{ background: 'hsl(173, 58%, 39%)' }} />
              <div className="h-1 w-8 rounded-full" style={{ background: 'hsl(38, 70%, 50%)' }} />
              <div className="h-1 w-8 rounded-full" style={{ background: 'hsl(0, 60%, 55%)' }} />
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
                {title}
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
                {subtitle}
              </p>
            </div>

            {/* Form */}
            <div className="auth-light-form">
              {children}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-5 mt-7 text-[11px]" style={{ color: '#94a3b8' }}>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> HIPAA Compliant
          </span>
          <span className="w-px h-3" style={{ background: '#e2e8f0' }} />
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> 256-bit Encrypted
          </span>
        </div>

        <p className="text-center text-[11px] mt-4" style={{ color: '#94a3b8' }}>
          © {new Date().getFullYear()} Swasth Dekhbhal
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
