'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../lib/api-client';
import { useLanguage } from '../../context/LanguageContext';
import { DollarSign, Clock, AlertTriangle, Building, RefreshCw } from 'lucide-react';

interface CollectionDashboardData {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  byProperty: Array<{
    propertyId: string;
    address: string;
    collected: number;
    pending: number;
    overdue: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<CollectionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<CollectionDashboardData>('/dashboard/collection-status');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Auto-refresh metrics whenever the user switches back to this tab/window
    const onFocus = () => loadDashboard();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-400">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-gray-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('dashboard.refreshing') : t('dashboard.refresh')}
        </button>

      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-relaxed">
              {t('dashboard.total_collected')}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100 mt-3">
            ${data?.totalCollected?.toLocaleString() ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <span>● {t('dashboard.total_collected_desc')}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-relaxed">
              {t('dashboard.pending_payments')}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100 mt-3">
            ${data?.totalPending?.toLocaleString() ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1">
            <span>● {t('dashboard.pending_payments_desc')}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-relaxed">
              {t('dashboard.overdue_payments')}
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100 mt-3">
            ${data?.totalOverdue?.toLocaleString() ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-rose-400 flex items-center gap-1">
            <span>● {t('dashboard.overdue_payments_desc')}</span>
          </div>
        </div>
      </div>

      {/* Property Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-indigo-400" />
          {t('dashboard.title')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-gray-900/60 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">{t('payments.table.property')}</th>
                <th className="px-4 py-3">{t('payments.status.paid')}</th>
                <th className="px-4 py-3">{t('payments.status.pending')}</th>
                <th className="px-4 py-3">{t('payments.status.overdue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {data?.byProperty && data.byProperty.length > 0 ? (
                data.byProperty.map((item) => (
                  <tr key={item.propertyId} className="hover:bg-gray-900/40 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-200">{item.address}</td>
                    <td className="px-4 py-3.5 text-emerald-400">${item.collected}</td>
                    <td className="px-4 py-3.5 text-amber-400">${item.pending}</td>
                    <td className="px-4 py-3.5 text-rose-400">${item.overdue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
