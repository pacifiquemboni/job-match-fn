import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import { Briefcase } from 'lucide-react';

type RegistrationRole = RegisterData['role'];

interface RegisterPageProps {
  role?: RegistrationRole;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ role = 'WORKER' }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const isClient = role === 'CLIENT';
  const [form, setForm] = useState<Omit<RegisterData, 'role'>>({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const registeredUser = await register({ ...form, role });
      navigate(registeredUser.role === 'CLIENT' ? '/dashboard' : '/', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8fb] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="absolute left-[-6rem] top-10 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-[-5rem] h-56 w-56 rounded-full bg-slate-200/60 blur-3xl" />

        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                {isClient ? 'Client account' : 'Worker account'}
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-[-0.04em]">
                {isClient ? 'Hire faster with the right talent.' : 'Find work that fits your skills.'}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                {isClient
                  ? 'Create your client account to post jobs, review applications, and manage hiring in one place.'
                  : 'Create your worker account to discover jobs, connect with clients, and grow your opportunities.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-2 text-sm font-semibold text-amber-300">
                {isClient ? 'Built for hiring teams' : 'Built for job seekers'}
              </div>
              <p className="text-sm leading-6 text-slate-200">
                Smart matching, messaging, and a simple workflow powered by the same amber theme.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col items-start">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 shadow-sm">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">JobMatch</span>
              <h1 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-slate-950">
                {isClient ? 'Create client account' : 'Create worker account'}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {isClient
                  ? 'Set up your client profile and start posting jobs.'
                  : 'Join the platform and start applying for opportunities.'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="example@mail.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id={isClient ? 'client-terms' : 'worker-terms'}
                  className="mt-0.5 h-4 w-4 accent-amber-400"
                  required
                />
                <label htmlFor={isClient ? 'client-terms' : 'worker-terms'} className="text-sm text-slate-500">
                  I agree to the{' '}
                  <Link to="/terms" className="text-amber-500 hover:text-amber-600">terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-amber-500 hover:text-amber-600">privacy policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-amber-400 py-3 font-semibold text-white transition duration-200 hover:bg-amber-500 disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : isClient ? 'Sign Up as Client' : 'Sign Up as Worker'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-amber-500 transition hover:text-amber-600">
                Sign in
              </Link>
            </p>
            {/* <p className="mt-2 text-sm text-slate-500">
              {isClient ? 'Looking for jobs instead?' : 'Hiring talent instead?'}{' '}
              <Link
                to={isClient ? '/register' : '/register-client'}
                className="font-semibold text-amber-500 transition hover:text-amber-600"
              >
                {isClient ? 'Register as worker' : 'Register as client'}
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Register: React.FC = () => <RegisterPage role="WORKER" />;

export const RegisterClient: React.FC = () => <RegisterPage role="CLIENT" />;
