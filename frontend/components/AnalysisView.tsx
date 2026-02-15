import React, { useState } from 'react';
import { MeetingAnalysis, ActionItem } from '../types';

interface AnalysisViewProps {
  data: MeetingAnalysis;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'actions'>('summary');
  const [openReasoning, setOpenReasoning] = useState<Record<string, boolean>>({});

  const toggleReasoning = (id: string) => {
    setOpenReasoning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exportToCalendar = (item: ActionItem) => {
    alert(`📅 CALENDAR SYNC: "${item.task}" scheduled for ${item.deadline || 'ASAP'}.`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Core Intent */}
      <section className="glass p-10 rounded-[2.5rem] border-l-8 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">
          Core Meeting Intent
        </h4>
        <div className="text-3xl font-bold text-slate-100 leading-tight">
          {data.intent}
        </div>
      </section>

      {/* Tabs */}
      <div className="glass rounded-[2rem] overflow-hidden border border-white/5">
        <div className="flex border-b border-white/5 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-6 text-sm font-bold uppercase tracking-wider ${
              activeTab === 'summary'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-500'
            }`}
          >
            Intelligent Summary
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-6 text-sm font-bold uppercase tracking-wider ${
              activeTab === 'actions'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-500'
            }`}
          >
            Action Matrix ({data.actionItems.length})
          </button>
        </div>

        <div className="p-10">
          {activeTab === 'summary' ? (
            <div className="grid md:grid-cols-2 gap-12">
              {data.summary.map((point, i) => {
                const id = `summary-${i}`;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-4">
                      <h5 className="text-blue-400 text-xs font-bold uppercase tracking-widest">
                        {point.topic}
                      </h5>
                      {point.reasoning && (
                        <button
                          onClick={() => toggleReasoning(id)}
                          className="text-[10px] uppercase font-bold text-slate-500 hover:text-blue-400"
                        >
                          {openReasoning[id] ? 'Close' : 'Why?'}
                        </button>
                      )}
                    </div>
                    <p className="text-slate-200 text-lg">{point.content}</p>
                    {openReasoning[id] && point.reasoning && (
                      <p className="mt-4 text-xs italic text-slate-400">
                        {point.reasoning}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {data.actionItems.map((item, i) => {
                const id = `action-${i}`;
                return (
                  <div key={i} className="p-6 bg-slate-900/40 rounded-3xl">
                    <h6 className="text-xl font-medium">{item.task}</h6>
                    <p className="text-xs text-slate-500">
                      {item.assignee} • {item.deadline || 'ASAP'}
                    </p>

                    <div className="flex gap-4 mt-4">
                      {item.reasoning && (
                        <button
                          onClick={() => toggleReasoning(id)}
                          className="text-[10px] uppercase font-bold text-slate-500 hover:text-blue-400"
                        >
                          Reasoning
                        </button>
                      )}
                      {item.canExport && (
                        <button
                          onClick={() => exportToCalendar(item)}
                          className="text-[10px] font-bold uppercase text-blue-400"
                        >
                          Sync
                        </button>
                      )}
                    </div>

                    {openReasoning[id] && item.reasoning && (
                      <p className="mt-3 text-xs italic text-slate-400">
                        {item.reasoning}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
