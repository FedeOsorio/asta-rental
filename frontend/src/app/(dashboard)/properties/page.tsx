'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { Property } from '@asta-rental/shared';
import { Building2, Plus, Trash2, Tag, Home, Store, Building, Pencil } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function PropertiesPage() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'apartment' | 'house' | 'commercial'>('apartment');
  const [monthlyRent, setMonthlyRent] = useState('');

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Property[]>('/properties');
      setProperties(data);
    } catch (err: any) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setAddress('');
    setType('apartment');
    setMonthlyRent('');
    setShowModal(true);
  };

  const handleOpenEdit = (prop: Property) => {
    setEditId(prop.id);
    setAddress(prop.address);
    setType(prop.type);
    setMonthlyRent(prop.monthlyRent.toString());
    setShowModal(true);
  };

  // Helper for thousands separator formatting
  const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue))) {
      // Add commas back
      const formatted = rawValue ? Number(rawValue).toLocaleString('en-US') : '';
      setMonthlyRent(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const numericRent = Number(monthlyRent.replace(/,/g, ''));
      if (editId) {
        await fetchApi(`/properties/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify({ address, type, monthlyRent: numericRent })
        });
      } else {
        await fetchApi('/properties', {
          method: 'POST',
          body: JSON.stringify({ address, type, monthlyRent: numericRent })
        });
      }
      setShowModal(false);
      loadProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to save property');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete') || 'Are you sure you want to delete this property?')) return;
    try {
      await fetchApi(`/properties/${id}`, { method: 'DELETE' });
      loadProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to delete property');
    }
  };

  const getTypeIcon = (propertyType: string) => {
    switch (propertyType) {
      case 'house':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'commercial':
        return <Store className="w-4 h-4 text-purple-400" />;
      default:
        return <Building className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('nav.properties')}</h1>
          <p className="text-sm text-gray-400">
            {t('properties.subtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-white text-xs font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4" />
          {t('common.add_property') || 'Add Property'}
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div key={prop.id} className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                    {getTypeIcon(prop.type)}
                  </div>
                  <span className="text-xs uppercase font-mono text-gray-400 tracking-wider">
                    {t(`properties.types.${prop.type}`) || prop.type}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 flex items-center rounded-full text-[11px] font-medium uppercase tracking-wider ${
                    prop.status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : prop.status === 'rented'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {t(`properties.status.${prop.status}`) || prop.status}
                </span>
              </div>

              <h3 className="font-semibold text-gray-100 mt-4 line-clamp-1">{prop.address}</h3>
            </div>

            <div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800/60 text-sm">
                <span className="text-gray-400">{t('properties.monthly_rent')}</span>
                <span className="font-bold text-gray-100">${Number(prop.monthlyRent).toLocaleString('en-US')}</span>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3">
                <button
                  onClick={() => handleOpenEdit(prop)}
                  title={t('common.edit')}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(prop.id)}
                  title={t('common.delete')}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              {editId ? (t('common.edit_property') || 'Edit Property') : (t('common.add_property') || 'Create New Property')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">{t('properties.address')}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder={t('properties.address_placeholder') || "e.g. 742 Evergreen Terrace"}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">{t('properties.property_type')}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="apartment">{t('properties.types.apartment') || "Apartment"}</option>
                  <option value="house">{t('properties.types.house') || "House"}</option>
                  <option value="commercial">{t('properties.types.commercial') || "Commercial"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">{t('properties.monthly_rent')} ($)</label>
                <input
                  type="text"
                  value={monthlyRent}
                  onChange={handleRentChange}
                  required
                  placeholder="1,200"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
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
