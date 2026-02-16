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
  
  const sortedActions = [...data.actionItems].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;   // push empty deadlines down
    if (!b.deadline) return -1;

    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();

    return dateA - dateB; // earliest first
  });

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">

      {/* Core Intent */}
      <section className="relative rounded-[2.5rem] p-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 rounded-l-[2.5rem]" />
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">
          Core Meeting Intent
        </h4>
        <div className="text-3xl font-bold text-white leading-tight">
          {data.intent}
        </div>
      </section>

      {/* Tabs */}
      <div className="rounded-[2rem] overflow-hidden border border-slate-800 bg-slate-950/50 backdrop-blur-xl">

        {/* Tab Header */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-6 text-sm font-bold uppercase tracking-wider transition ${
              activeTab === 'summary'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-900/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Intelligent Summary
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-6 text-sm font-bold uppercase tracking-wider transition ${
              activeTab === 'actions'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-900/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Action Matrix ({data.actionItems.length})
          </button>
        </div>

        <div className="p-10">

          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="grid md:grid-cols-2 gap-12">
              {data.summary.map((point, i) => {
                const id = `summary-${i}`;
                return (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-blue-400 text-xs font-bold uppercase tracking-widest">
                        {point.topic}
                      </h5>

                      {point.reasoning && (
                        <button
                          onClick={() => toggleReasoning(id)}
                          className="text-[10px] uppercase font-bold text-slate-500 hover:text-blue-400 transition"
                        >
                          {openReasoning[id] ? 'Close' : 'Why?'}
                        </button>
                      )}
                    </div>

                    <p className="text-slate-200 text-lg leading-relaxed">
                      {point.content}
                    </p>

                    {openReasoning[id] && point.reasoning && (
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs italic text-slate-400">
                        {point.reasoning}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTION MATRIX TAB */}
          {activeTab === 'actions' && (
            <div className="space-y-8">
              {sortedActions.map((item, i) => {
                const id = `action-${i}`;

                return (
                  <div
                    key={i}
                    className="group relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-5">

                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold tracking-wide uppercase ${getPriorityStyles(item.priority)}`}
                        >
                          {item.priority} Priority
                        </span>

                        <span className="text-xs text-slate-300 uppercase tracking-wider">
                          Assignee : {item.assignee || "Common to all"}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {item.reasoning && (
                          <button
                            onClick={() => toggleReasoning(id)}
                            className="text-xs px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition"
                          >
                            Reasoning
                          </button>
                        )}

                        
                        <button
                          onClick={() => exportToCalendar(item)}
                          className="text-xs px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition"
                        >
                          Sync
                        </button>
                        
                      </div>
                    </div>

                    {/* Task Title */}
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {item.task}
                    </h3>

                    {/* Deadline */}
                    {item.deadline && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>📅</span>
                        Deadline: {item.deadline}
                      </div>
                    )}

                    {/* Reasoning Panel */}
                    {openReasoning[id] && item.reasoning && (
                      <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs italic text-slate-400">
                        {item.reasoning}
                      </div>
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
