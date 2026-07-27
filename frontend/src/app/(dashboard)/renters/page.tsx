'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { Renter } from '@asta-rental/shared';
import { Users, Plus, Mail, Phone, UserCheck } from 'lucide-react';

export default function RentersPage() {
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const loadRenters = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Renter[]>('/renters');
      setRenters(data);
    } catch (err: any) {
      console.error('Failed to load renters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRenters();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/renters', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, phone })
      });
      setShowModal(false);
      setFullName('');
      setEmail('');
      setPhone('');
      loadRenters();
    } catch (err: any) {
      alert(err.message || 'Failed to create renter');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Renters</h1>
          <p className="text-sm text-gray-400">Datos de contacto, historial y contratos activos de cada inquilino.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-white text-xs font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add Renter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renters.map((renter) => (
          <div key={renter.id} className="glass-card rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                {renter.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">{renter.fullName}</h3>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Active Profile
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-gray-800/60 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>{renter.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span>{renter.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-100">Add New Renter</h3>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jane.doe@example.com"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1 555 0199"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gradient-btn text-white text-xs font-semibold rounded-xl"
                >
                  Save Renter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
