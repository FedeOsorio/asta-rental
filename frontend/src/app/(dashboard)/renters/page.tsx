'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { Renter } from '@asta-rental/shared';
import { Users, Plus, Mail, Phone, UserCheck, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function RentersPage() {
  const { t } = useLanguage();
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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

  const handleOpenCreate = () => {
    setEditId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setShowModal(true);
  };

  const handleOpenEdit = (renter: Renter) => {
    setEditId(renter.id);
    setFullName(renter.fullName);
    setEmail(renter.email);
    setPhone(renter.phone);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetchApi(`/renters/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify({ fullName, email, phone })
        });
      } else {
        await fetchApi('/renters', {
          method: 'POST',
          body: JSON.stringify({ fullName, email, phone })
        });
      }
      setShowModal(false);
      loadRenters();
    } catch (err: any) {
      alert(err.message || 'Failed to save renter');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete') || 'Are you sure you want to delete this item?')) return;
    try {
      await fetchApi(`/renters/${id}`, { method: 'DELETE' });
      loadRenters();
    } catch (err: any) {
      alert(err.message || 'Failed to delete renter');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('nav.renters')}</h1>
          <p className="text-sm text-gray-400">{t('renters.subtitle')}</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-white text-xs font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4" />
          {t('common.add_renter') || 'Add Renter'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renters.map((renter) => (
          <div key={renter.id} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  {renter.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">{renter.fullName}</h3>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> {t('renters.active_profile')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(renter)}
                  title={t('common.edit')}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(renter.id)}
                  title={t('common.delete')}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              {editId ? (t('common.edit_renter') || 'Edit Renter') : (t('common.add_renter') || 'Add New Renter')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">{t('renters.full_name')}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder={t('renters.full_name_placeholder') || "e.g. Jane Doe"}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">{t('renters.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('renters.email_placeholder') || "jane.doe@example.com"}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">{t('renters.phone')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder={t('renters.phone_placeholder') || "+1 555 0199"}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 text-xs font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gradient-btn text-white text-xs font-semibold rounded-xl flex items-center justify-center"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
