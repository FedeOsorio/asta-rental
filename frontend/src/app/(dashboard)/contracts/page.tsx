'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { Property, Renter, Contract } from '@asta-rental/shared';
import { FileText, Plus, CheckCircle, XCircle, Calendar, DollarSign, AlertCircle } from 'lucide-react';

export default function ContractsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [renters, setRenters] = useState<Renter[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [propertyId, setPropertyId] = useState('');
  const [renterId, setRenterId] = useState('');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [monthlyRent, setMonthlyRent] = useState(1200);

  const loadData = async () => {
    try {
      const [propsData, rentersData] = await Promise.all([
        fetchApi<Property[]>('/properties'),
        fetchApi<Renter[]>('/renters')
      ]);
      setProperties(propsData);
      setRenters(rentersData);

      const availableProp = propsData.find((p) => p.status === 'available');
      if (availableProp) setPropertyId(availableProp.id);
      if (rentersData.length > 0) setRenterId(rentersData[0].id);
    } catch (err) {
      console.error('Failed to load lease form data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/contracts', {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          renterId,
          startDate,
          endDate,
          monthlyRent: Number(monthlyRent)
        })
      });
      setShowModal(false);
      alert('Lease Contract created successfully! Monthly payments generated.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create contract');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Lease Contracts</h1>
          <p className="text-sm text-gray-400">
            Creá contratos, asigná inquilinos y generá automáticamente el calendario de pagos.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-white text-xs font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Create New Lease
        </button>
      </div>

      {/* Info Panel explaining Transactional Contract logic for interviews */}
      <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-indigo-500">
        <h3 className="font-semibold text-gray-200 text-sm mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Transactional Guarantee (ACID)
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Creating a contract validates property availability, sets property status to &quot;rented&quot;, and inserts N monthly payment rows within a single SQL transaction (`DrizzleContractRepository`). If any step fails, the entire lease is rolled back.
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-100">Create Lease Contract</h3>

            <form onSubmit={handleCreateContract} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Select Property</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.status !== 'available'}>
                      {p.address} ({p.type}) - ${p.monthlyRent} [{p.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Select Renter</label>
                <select
                  value={renterId}
                  onChange={(e) => setRenterId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {renters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  Execute Lease Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
