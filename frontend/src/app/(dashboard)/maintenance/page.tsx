'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { useLanguage } from '../../../context/LanguageContext';
import { MaintenanceTicket } from '@asta-rental/shared';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const loadTickets = async () => {
    try {
      const data = await fetchApi('/maintenance/tickets');
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const [simulating, setSimulating] = useState(false);

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      const messages = [
        'Hola, se rompió el caño del lavamanos y se está inundando el baño',
        'Buenas tardes, hay olor a gas fuerte cerca de la estufa',
        'Hola, se cortó la luz en todo el departamento despues de un chispazo',
        'Tengo una grieta grande en la pared del balcón'
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      await fetchApi('/maintenance/webhook', {
        method: 'POST',
        body: JSON.stringify({ messageText: randomMsg })
      });

      // Wait 2s for background AI processing to finish, then reload
      setTimeout(() => {
        loadTickets();
        setSimulating(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to simulate webhook', error);
      setSimulating(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">{t('drafts.loading') || 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-400" />
            {t('maintenance.title')}
          </h1>
          <p className="text-gray-400 mt-1">
            {t('maintenance.subtitle')}
          </p>
        </div>
        <button
          onClick={handleSimulateWebhook}
          disabled={simulating}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl hover:bg-indigo-600/30 text-xs font-semibold"
        >
          <Clock className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
          {simulating ? '...' : t('maintenance.simulate_button')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
            <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-400 font-medium">{t('maintenance.no_tickets')}</h3>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="glass-panel p-5 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${getUrgencyColor(ticket.urgency)} flex items-center h-fit`}>
                  {ticket.urgency}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 mb-1 block">
                  {t('maintenance.table.category')}: {ticket.category}
                </span>
                <p className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded-lg mt-2 border border-gray-800 italic">
                  &quot;{ticket.description}&quot;
                </p>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-500 flex items-center gap-1">{t('maintenance.table.renter')}: {ticket.renterName || (t('maintenance.unknown') || 'Unknown')}</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest">{t(`maintenance.status.${ticket.status}`) || ticket.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
