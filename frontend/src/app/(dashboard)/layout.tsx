'use client';

import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  LogOut,
  ShieldAlert,
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const navItems = [
    { label: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { label: t('nav.properties'), href: '/properties', icon: Building2 },
    { label: t('nav.renters'), href: '/renters', icon: Users },
    { label: t('nav.contracts'), href: '/contracts', icon: FileText },
    { label: t('nav.payments'), href: '/payments', icon: CreditCard },
    ...(user?.role === 'admin' ? [
      { label: t('nav.drafts'), href: '/drafts', icon: AlertCircle },
      { label: t('nav.maintenance'), href: '/maintenance', icon: MessageSquare }
    ] : [])
  ];

  return (
    <div className="min-h-screen flex bg-[#0B0F19]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800/80 bg-gray-950/60 backdrop-blur-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-100 leading-none">A.S.T.A.</h2>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                Gestión de Alquileres
              </span>
            </div>
          </div>
        </div>

        {/* Organization Badge */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs flex flex-col justify-center">
          <div className="flex items-center gap-2 text-indigo-400 font-medium mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Org</span>
          </div>
          <p
            className="text-gray-400 font-medium text-xs truncate"
            title={`ID: ${user?.organizationId}`}
          >
            {user?.organizationName || user?.organizationId}
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <LanguageSwitcher />
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-gray-800/60">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-gray-200 truncate">{user?.email}</p>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                {user?.role}
              </span>
            </div>
            <button
              onClick={() => logout()}
              title={t('nav.logout')}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
