'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { Property } from '@asta-rental/shared';
import { Building2, Plus, Trash2, Tag, Home, Store, Building } from 'lucide-react';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'apartment' | 'house' | 'commercial'>('apartment');
  const [monthlyRent, setMonthlyRent] = useState(1200);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/properties', {
        method: 'POST',
        body: JSON.stringify({ address, type, monthlyRent: Number(monthlyRent) })
      });
      setShowModal(false);
      setAddress('');
      loadProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to create property');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to soft delete this property?')) return;
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
          <h1 className="text-2xl font-bold text-gray-100">Properties</h1>
          <p className="text-sm text-gray-400">
            Tu cartera inmobiliaria: disponibilidad, valores y estado de cada unidad.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-white text-xs font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div key={prop.id} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gray-800 border border-gray-700">
                  {getTypeIcon(prop.type)}
                </div>
                <span className="text-xs uppercase font-mono text-gray-400 tracking-wider">
                  {prop.type}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                  prop.status === 'available'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : prop.status === 'rented'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {prop.status}
              </span>
            </div>

            <h3 className="font-semibold text-gray-100 line-clamp-1">{prop.address}</h3>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-sm">
              <span className="text-gray-400">Monthly Rent</span>
              <span className="font-bold text-gray-100">${prop.monthlyRent}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleDelete(prop.id)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Property Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-100">Create New Property</h3>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Property Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Monthly Rent ($)</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  required
                  min={1}
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
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
