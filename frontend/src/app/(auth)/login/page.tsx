'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../context/LanguageContext';
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@alpha.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || t('login.error_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial-gradient">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">{t('login.title')}</h1>
          <p className="text-gray-400 mt-2 text-sm">{t('login.subtitle')}</p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                {t('login.email_label')}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="admin@alpha.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                {t('login.password_label')}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 gradient-btn text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {submitting ? t('login.submitting') : t('login.submit_button')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-3 font-medium">{t('login.quick_access_1')}</p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@alpha.com')}
                className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-300 border border-gray-700/50 transition-colors text-center"
              >
                {t('login.admin_access')}
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('agent@alpha.com')}
                className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-300 border border-gray-700/50 transition-colors text-center"
              >
                {t('login.agent_access')}
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3 font-medium">{t('login.quick_access_2')}</p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@beta.com')}
                className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-300 border border-gray-700/50 transition-colors text-center"
              >
                {t('login.admin_access')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
