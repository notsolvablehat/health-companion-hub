import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Activity,
  Shield,
  Users,
  HeartPulse,
  Brain,
  Stethoscope,
  Lock,
  Star,
  MessageCircle,
  BarChart3,
  FileHeart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const APP_NAMES = [
  { text: 'Swasth Dekhbhal', lang: 'English' },
  { text: 'स्वास्थ्य देखभाल', lang: 'हिन्दी' },
  { text: 'ಆರೋಗ್ಯ ರಕ್ಷಣೆ', lang: 'ಕನ್ನಡ' },
  { text: 'சுகாதார பாதுகாப்பு', lang: 'தமிழ்' },
];

const TESTIMONIALS = [
  { name: 'Anita S.', role: 'Patient', text: 'This platform transformed how I manage my diabetes. The AI insights are incredible.', rating: 5 },
  { name: 'Dr. Ramesh K.', role: 'Cardiologist', text: 'Best tool for patient management. The dashboards save me hours every week.', rating: 5 },
  { name: 'Priya M.', role: 'Patient', text: 'Booking appointments and sharing records is so seamless now. Love the interface!', rating: 5 },
];

export default function Index() {
  const { user, isLoading, isOnboarded } = useAuth();
  const [nameIndex, setNameIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const nameTimer = setInterval(() => setNameIndex((p) => (p + 1) % APP_NAMES.length), 2000);
    const testTimer = setInterval(() => setTestimonialIndex((p) => (p + 1) % TESTIMONIALS.length), 4000);
    return () => { clearInterval(nameTimer); clearInterval(testTimer); };
  }, []);

  if (!isLoading && user && isOnboarded) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }
  if (!isLoading && user && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#f8fafb' }}>
      {/* Soft pastel circles - no gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: '#ccfbf1', filter: 'blur(100px)' }}
        />
        <div
          className="absolute top-[50%] -left-32 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: '#fef3c7', filter: 'blur(100px)' }}
        />
        <div
          className="absolute -bottom-32 right-[20%] w-[450px] h-[450px] rounded-full opacity-15"
          style={{ background: '#ede9fe', filter: 'blur(100px)' }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 0.6px, transparent 0.6px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* NAV BAR */}
      <header className="z-20 sticky top-0" style={{ background: 'rgba(248, 250, 251, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ background: 'hsl(173, 58%, 39%)' }}>
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight" style={{ color: '#0f172a' }}>Swasth Dekhbhal</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: '#475569' }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-5 py-2 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ background: 'hsl(173, 58%, 39%)' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Rotating app name */}
            <div className="mb-5">
              <div className="relative h-[56px] sm:h-[64px] lg:h-[76px] flex items-center justify-center overflow-hidden">
                {APP_NAMES.map((name, i) => (
                  <h1
                    key={name.lang}
                    className={`absolute text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight transition-all duration-600 ease-out ${
                      i === nameIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ color: 'hsl(173, 58%, 35%)' }}
                  >
                    {name.text}
                  </h1>
                ))}
              </div>
              {/* Language pills */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {APP_NAMES.map((name, i) => (
                  <button
                    key={name.lang}
                    onClick={() => setNameIndex(i)}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: i === nameIndex ? 'hsla(173, 58%, 39%, 0.1)' : 'transparent',
                      color: i === nameIndex ? 'hsl(173, 58%, 35%)' : '#94a3b8',
                      border: i === nameIndex ? '1px solid hsla(173, 58%, 39%, 0.2)' : '1px solid transparent',
                    }}
                  >
                    {name.lang}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-9" style={{ color: '#64748b' }}>
              AI-powered healthcare that connects patients with specialists, tracks vitals, and delivers{' '}
              <span className="font-semibold" style={{ color: '#0f172a' }}>personalized insights</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-base font-semibold px-8 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ background: 'hsl(173, 58%, 39%)' }}
              >
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-base font-medium px-8 py-3 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: '#334155', border: '1px solid #e2e8f0' }}
              >
                I have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="relative z-10 pb-20 lg:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'hsl(173, 58%, 39%)' }}>Why Choose Us</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
              Healthcare, Reimagined
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {/* Big card — Health Tracking */}
            <div
              className="md:col-span-4 p-7 rounded-2xl hover:translate-y-[-2px] transition-transform"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 12px -4px rgba(0,0,0,0.05)',
              }}
            >
              <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: '#f0fdfa' }}>
                <Activity className="w-5 h-5" style={{ color: 'hsl(173, 58%, 39%)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Real-time Health Tracking</h3>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: '#64748b' }}>
                Monitor glucose, blood pressure, heart rate, and vitals in live dashboards. Get instant alerts when readings are abnormal.
              </p>
              {/* Mini chart visual */}
              <div className="flex items-end gap-1 mt-5 h-10">
                {[35, 45, 30, 55, 42, 60, 48, 65, 50, 70, 55, 62, 58, 72, 60].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${h}%`,
                      background: 'hsl(173, 58%, 39%)',
                      opacity: 0.2 + (i / 15) * 0.6,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Small card — AI Insights */}
            <div
              className="md:col-span-2 p-7 rounded-2xl hover:translate-y-[-2px] transition-transform"
              style={{
                background: '#fffbeb',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                boxShadow: '0 2px 12px -4px rgba(0,0,0,0.04)',
              }}
            >
              <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Brain className="w-5 h-5" style={{ color: 'hsl(38, 70%, 45%)' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: '#78350f' }}>AI Insights</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#92400e' }}>
                Personalized health recommendations and risk predictions powered by AI.
              </p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#92400e' }}>Diabetes Risk</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#92400e' }}>BP Analysis</span>
              </div>
            </div>

            {/* Small card — Security */}
            <div
              className="md:col-span-2 p-7 rounded-2xl hover:translate-y-[-2px] transition-transform"
              style={{
                background: '#faf5ff',
                border: '1px solid rgba(167, 139, 250, 0.1)',
                boxShadow: '0 2px 12px -4px rgba(0,0,0,0.04)',
              }}
            >
              <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                <Shield className="w-5 h-5" style={{ color: 'hsl(260, 45%, 55%)' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: '#3b0764' }}>Secure & Private</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#581c87' }}>
                End-to-end encryption. Your health data is HIPAA-compliant and never shared.
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" style={{ color: 'hsl(260, 45%, 55%)' }} />
                <span className="text-xs font-medium" style={{ color: 'hsl(260, 45%, 55%)' }}>256-bit AES Encryption</span>
              </div>
            </div>

            {/* Big card — Doctor Connection */}
            <div
              className="md:col-span-4 p-7 rounded-2xl hover:translate-y-[-2px] transition-transform"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 12px -4px rgba(0,0,0,0.05)',
              }}
            >
              <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: '#fef2f2' }}>
                <Users className="w-5 h-5" style={{ color: 'hsl(0, 60%, 50%)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Connect with Specialists</h3>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: '#64748b' }}>
                Find and book appointments with the right doctors. Share medical records securely and get expert consultations.
              </p>
              <div className="flex items-center mt-5 gap-3">
                <div className="flex -space-x-2">
                  {['hsl(173, 58%, 39%)', 'hsl(38, 70%, 50%)', 'hsl(260, 45%, 58%)', 'hsl(0, 60%, 55%)'].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                      style={{ background: c }}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>500+ verified specialists</span>
              </div>
            </div>

            {/* Reports + Chat mini cards */}
            <div className="md:col-span-3 p-5 rounded-2xl flex items-center gap-4 hover:translate-y-[-2px] transition-transform"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px -4px rgba(0,0,0,0.05)' }}
            >
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: '#f0fdfa' }}>
                <FileHeart className="w-5 h-5" style={{ color: 'hsl(173, 58%, 39%)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: '#0f172a' }}>Smart Reports</h3>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#64748b' }}>AI-analyzed medical reports with highlighted insights</p>
              </div>
            </div>

            <div className="md:col-span-3 p-5 rounded-2xl flex items-center gap-4 hover:translate-y-[-2px] transition-transform"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px -4px rgba(0,0,0,0.05)' }}
            >
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: '#fffbeb' }}>
                <MessageCircle className="w-5 h-5" style={{ color: 'hsl(38, 70%, 45%)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: '#0f172a' }}>AI Health Chat</h3>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#64748b' }}>Ask health questions and get instant AI-powered answers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'hsl(38, 70%, 50%)' }}>Simple Setup</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
              Get Started in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { num: '01', title: 'Create Account', desc: 'Sign up as a patient or doctor. Takes less than 30 seconds.', color: 'hsl(173, 58%, 39%)', bg: '#f0fdfa' },
              { num: '02', title: 'Complete Profile', desc: 'Add your health details, preferences, and medical history.', color: 'hsl(38, 70%, 50%)', bg: '#fffbeb' },
              { num: '03', title: 'Start Your Journey', desc: 'Access dashboards, AI insights, and connect with doctors.', color: 'hsl(260, 45%, 58%)', bg: '#faf5ff' },
            ].map((step, i) => (
              <div
                key={step.num}
                className="text-center p-8 rounded-2xl relative hover:translate-y-[-2px] transition-transform"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 12px -4px rgba(0,0,0,0.05)',
                }}
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px" style={{ background: '#e2e8f0' }} />
                )}
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-base font-extrabold mb-4"
                  style={{ background: step.bg, color: step.color }}
                >
                  {step.num}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#0f172a' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px -4px rgba(0,0,0,0.05)',
            }}
          >
            {[
              { value: '10K+', label: 'Active Users', icon: Users, color: 'hsl(173, 58%, 39%)' },
              { value: '500+', label: 'Specialists', icon: Stethoscope, color: 'hsl(38, 70%, 50%)' },
              { value: '99.9%', label: 'Uptime', icon: BarChart3, color: 'hsl(260, 45%, 58%)' },
              { value: '4.8★', label: 'Rating', icon: Star, color: 'hsl(0, 60%, 55%)' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: '#0f172a' }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'hsl(260, 45%, 58%)' }}>Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
              Loved by Users
            </h2>
          </div>

          <div className="max-w-lg mx-auto relative h-[180px]">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ${
                  i === testimonialIndex ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-98'
                }`}
              >
                <div
                  className="p-8 rounded-2xl text-center h-full flex flex-col justify-center"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 16px -6px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex justify-center mb-3">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-current" style={{ color: 'hsl(38, 70%, 50%)' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4 italic" style={{ color: '#334155' }}>
                    "{t.text}"
                  </p>
                  <div>
                    <span className="text-sm font-bold" style={{ color: '#0f172a' }}>{t.name}</span>
                    <span className="text-xs ml-2" style={{ color: '#94a3b8' }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === testimonialIndex ? 'hsl(173, 58%, 39%)' : '#d1d5db',
                    transform: i === testimonialIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA - soft pastel instead of heavy gradient */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="relative rounded-2xl overflow-hidden p-10 lg:p-16 text-center"
            style={{
              background: 'hsl(173, 58%, 39%)',
              boxShadow: '0 8px 32px -12px hsla(173, 58%, 39%, 0.3)',
            }}
          >
            <div className="relative z-10">
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to Transform Your Health?
              </h2>
              <p className="text-white/70 max-w-lg mx-auto mb-8 text-lg">
                Join thousands of patients and providers building a healthier future.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-base font-semibold px-8 py-3 rounded-lg transition-all hover:opacity-90"
                  style={{ background: '#fff', color: 'hsl(173, 58%, 35%)' }}
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-base font-medium px-8 py-3 rounded-lg transition-all text-white/90 hover:text-white hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Sign in Instead
                </Link>
              </div>
              <div className="flex items-center justify-center gap-5 mt-8 text-white/50 text-xs">
                <span className="flex items-center gap-1">✓ Free to start</span>
                <span className="flex items-center gap-1">✓ No credit card</span>
                <span className="flex items-center gap-1">✓ HIPAA secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs" style={{ color: '#94a3b8' }}>
          © {new Date().getFullYear()} Swasth Dekhbhal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
