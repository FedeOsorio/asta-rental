'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api-client';
import { useLanguage } from '../../../context/LanguageContext';
import { CommunicationDraft } from '@asta-rental/shared';
import { Bot, CheckCircle2, Clock, Send, XCircle, AlertCircle, Edit2 } from 'lucide-react';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<CommunicationDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const { t } = useLanguage();

  const loadDrafts = async () => {
    try {
      const data = await fetchApi('/communications/drafts');
      setDrafts(data);
    } catch (error) {
      console.error('Failed to load drafts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleGenerateDrafts = async () => {
    setGenerating(true);
    try {
      await fetchApi('/communications/generate-drafts', { method: 'POST' });
      await loadDrafts();
    } catch (error) {
      console.error('Failed to generate drafts', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id: string, content?: string) => {
    try {
      const body = content ? JSON.stringify({ content }) : undefined;
      await fetchApi(`/communications/${id}/approve`, { method: 'PATCH', body });
      setEditingId(null);
      await loadDrafts();
    } catch (error) {
      console.error('Failed to approve draft', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">{t('drafts.loading') || 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-indigo-400" />
            {t('drafts.title')}
          </h1>
          <p className="text-gray-400 mt-1">
            {t('drafts.subtitle')}
          </p>
        </div>
        <button
          onClick={handleGenerateDrafts}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 text-xs font-semibold transition-all"
        >
          {generating ? <Clock className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
          {generating ? '...' : t('drafts.generate_button')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-400 font-medium">{t('drafts.no_drafts')}</h3>
          </div>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className="glass-panel p-5 rounded-2xl flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-mono text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded flex items-center w-fit">
                    {draft.type === 'overdue_notice' ? (t('drafts.card.overdue_notice') || 'Aviso de Mora') : draft.type}
                  </span>
                  <h3 className="text-gray-200 font-medium mt-3 flex items-center gap-1">{t('drafts.card.to')}: {draft.renterName}</h3>
                </div>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="bg-gray-900/60 p-4 rounded-xl text-gray-300 text-sm flex-1 font-mono leading-relaxed border border-gray-800">
                {editingId === draft.id ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[150px] bg-transparent border-none outline-none resize-none text-gray-200"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{draft.content}</div>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                {editingId === draft.id ? (
                  <button
                    onClick={() => handleApprove(draft.id, editContent)}
                    className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {t('drafts.card.send_edited') || 'Enviar Editado'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(draft.id);
                        setEditContent(draft.content);
                      }}
                      className="px-4 py-2 bg-gray-800/50 text-gray-300 border border-gray-700/50 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleApprove(draft.id)}
                      className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      {t('drafts.card.approve')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
