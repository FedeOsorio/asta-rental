'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { Payment, PaymentStatus } from '@asta-rental/shared';
import { CreditCard, CheckCircle, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all' ? '/payments' : `/payments?status=${filter}`;
      const data = await fetchApi<Payment[]>(endpoint);
      setPayments(data);
    } catch (err: any) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const handleMarkPaid = async (id: string) => {
    try {
      await fetchApi(`/payments/${id}/mark-paid`, { method: 'PATCH' });
      loadPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to mark payment as paid');
    }
  };

  const handleRunMaintenance = async () => {
    try {
      const res = await fetchApi('/payments/maintenance/mark-overdue', { method: 'POST' });
      alert(res.message);
      loadPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to run maintenance job');
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Payments</h1>
          <p className="text-sm text-gray-400">
            Seguimiento de cobros por contrato. Marcá pagos recibidos y detectá vencidos.
          </p>
        </div>

        <button
          onClick={handleRunMaintenance}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-xs font-medium text-amber-400 hover:text-amber-300 border-amber-500/20"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Run Overdue Maintenance
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        {(['all', 'pending', 'overdue', 'paid', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-gray-900/60 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Paid Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-gray-200">{p.dueDate}</td>
                  <td className="px-4 py-3.5 font-bold text-gray-100">${p.amount}</td>
                  <td className="px-4 py-3.5">{getStatusBadge(p.status)}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-400">
                    {p.paidDate || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {p.status !== 'paid' && p.status !== 'cancelled' && (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold transition-colors"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
