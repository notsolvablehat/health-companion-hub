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
    /* Force light appearance regardless of theme */
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#faf7f2' }}>
      {/* Animated morphing gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] animate-blob-morph opacity-60"
          style={{ background: 'linear-gradient(135deg, #99f6e4, #5eead4, #2dd4bf)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute top-[30%] -right-24 w-[420px] h-[420px] animate-blob-morph opacity-50"
          style={{ background: 'linear-gradient(135deg, #fed7aa, #fdba74, #fb923c)', filter: 'blur(80px)', animationDelay: '3s' }}
        />
        <div
          className="absolute -bottom-24 left-[30%] w-[480px] h-[480px] animate-blob-morph opacity-40"
          style={{ background: 'linear-gradient(135deg, #ddd6fe, #c4b5fd, #a78bfa)', filter: 'blur(80px)', animationDelay: '6s' }}
        />
        {/* Small accent blob */}
        <div
          className="absolute top-[15%] left-[55%] w-[200px] h-[200px] animate-blob-morph opacity-30"
          style={{ background: 'linear-gradient(135deg, #fda4af, #fb7185)', filter: 'blur(60px)', animationDelay: '9s' }}
        />
      </div>

      {/* Dot grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 0.8px, transparent 0.8px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-10 sm:py-14">
        {/* Brand header */}
        <Link to="/" className="flex items-center gap-3.5 mb-9 group">
          {/* Logo with glow */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl scale-[1.8] opacity-40 group-hover:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', filter: 'blur(16px)' }}
            />
            <div
              className="relative p-3 rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
          </div>
          {/* Rotating multilingual name */}
          <div className="relative h-9 w-60 overflow-hidden">
            {APP_NAMES.map((n, i) => (
              <span
                key={n.lang}
                className={`absolute inset-0 flex items-center text-[22px] font-bold tracking-tight transition-all duration-500 ${
                  i === nameIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ color: '#1e293b' }}
              >
                {n.text}
              </span>
            ))}
          </div>
        </Link>

        {/* Form card */}
        <div className="w-full max-w-[420px]">
          <div
            className="rounded-3xl p-8 sm:p-10 shadow-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
            }}
          >
            {/* Colored accent dots at top */}
            <div className="flex gap-1.5 mb-7 justify-center">
              <div className="h-1.5 w-10 rounded-full" style={{ background: '#14b8a6' }} />
              <div className="h-1.5 w-10 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="h-1.5 w-10 rounded-full" style={{ background: '#f43f5e' }} />
            </div>

            {/* Title */}
            <div className="text-center mb-7">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
                {title}
              </h2>
              <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
                {subtitle}
              </p>
            </div>

            {/* Form — force light styling */}
            <div className="auth-light-form">
              {children}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-5 mt-8 text-[11px]" style={{ color: '#94a3b8' }}>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> HIPAA Compliant
          </span>
          <span className="w-px h-3" style={{ background: '#cbd5e1' }} />
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> 256-bit Encrypted
          </span>
        </div>

        <p className="text-center text-[11px] mt-5" style={{ color: '#94a3b8' }}>
          © {new Date().getFullYear()} Swasth Dekhbhal
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
