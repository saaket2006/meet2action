import React, { useState } from 'react';
import { MeetingAnalysis, ActionItem } from '../types';

interface AnalysisViewProps {
  data: MeetingAnalysis;
  onUpdate?: (analysis: MeetingAnalysis) => void;
}

import { useAuth } from '../context/AuthContext';

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'actions'>('summary');
  const [openReasoning, setOpenReasoning] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  // New State for "Add Point"
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddPoint = async () => {
    if (!newTopic.trim() || !newContent.trim()) return;

    setIsEnhancing(true);
    try {
      // 1. Enhance with LLM
      const response = await fetch('http://localhost:8000/api/enhance-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newTopic, content: newContent })
      });

      const result = await response.json();
      const enhancedPoint = {
        topic: result.topic,
        content: result.content
      };

      // 2. Update Local State
      if (onUpdate) {
        let updatedSummary;
        if (editingIndex !== null) {
          // Edit existing
          updatedSummary = [...data.summary];
          updatedSummary[editingIndex] = enhancedPoint;
        } else {
          // Add new
          updatedSummary = [...data.summary, enhancedPoint];
        }

        const updatedAnalysis = {
          ...data,
          summary: updatedSummary
        };
        onUpdate(updatedAnalysis);
      }

      // 3. Reset and Close
      setNewTopic("");
      setNewContent("");
      setEditingIndex(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Enhancement failed", error);
      alert("Failed to enhance point. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const toggleReasoning = (id: string) => {
    setOpenReasoning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exportToCalendar = async (item: ActionItem) => {
    // Determine deadline
    let deadlineIso = "";
    if (item.deadline) {
      deadlineIso = item.deadline; // Assuming the backend parser can handle "2024-08-15" etc.
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      deadlineIso = tomorrow.toISOString();
    }

    if (user) {
      // User IS logged in: Sync directly via backend API
      try {
        const response = await fetch('http://localhost:8000/auth/calendar/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            summary: item.task,
            deadline: deadlineIso
          })
        });

        const result = await response.json();
        if (response.ok && result.link) {
          // Open the created event
          window.open(result.link, '_blank');
        } else {
          const errorMsg = result.detail || result.error || "Unknown error";
          alert(`Failed to sync event: ${errorMsg}`);
          console.error("Sync failed", result);
        }
      } catch (e: any) {
        console.error("Sync error", e);
        alert(`Error syncing to calendar: ${e.message}`);
      }
    } else {
      // User IS NOT logged in: Redirect to login with pending event params
      // This will flow through: Login -> Callback (Create Event) -> Redirect to Event Link
      const baseUrl = "http://localhost:8000/auth/google/login";
      const summaryParam = encodeURIComponent(item.task);
      const deadlineParam = encodeURIComponent(deadlineIso);

      const syncUrl = `${baseUrl}?summary=${summaryParam}&deadline=${deadlineParam}`;
      window.location.href = syncUrl;
    }
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
            className={`flex-1 py-6 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'summary'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-900/40'
              : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            Intelligent M.O.M
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-6 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'actions'
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
            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                {data.summary.map((point, i) => {
                  const id = `summary-${i}`;
                  return (
                    <div key={i} className="group/item relative space-y-4">
                      <div className="flex justify-between items-start">
                        <h5 className="text-blue-400 text-xs font-bold uppercase tracking-widest pt-1">
                          {point.topic}
                        </h5>

                        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          {/* Edit/Delete Actions */}
                          <button
                            onClick={() => {
                              setNewTopic(point.topic);
                              setNewContent(point.content);
                              setEditingIndex(i);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-blue-400 transition"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => {
                              if (onUpdate) {
                                const updatedSummary = data.summary.filter((_, idx) => idx !== i);
                                onUpdate({ ...data, summary: updatedSummary });
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 transition"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-200 text-lg leading-relaxed">
                        {point.content}
                      </p>

                      <div className="flex gap-4">
                        {point.reasoning && (
                          <button
                            onClick={() => toggleReasoning(id)}
                            className="text-[10px] uppercase font-bold text-slate-500 hover:text-blue-400 transition flex items-center gap-1"
                          >
                            {openReasoning[id] ? 'Hide Reasoning' : 'View Reasoning'}
                          </button>
                        )}
                      </div>

                      {openReasoning[id] && point.reasoning && (
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs italic text-slate-400 animate-in slide-in-from-top-2">
                          {point.reasoning}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Point Button - Bottom of List */}
              <button
                onClick={() => {
                  setNewTopic("");
                  setNewContent("");
                  setIsAddModalOpen(true);
                }}
                className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-slate-900/50 transition-all flex items-center justify-center gap-2 font-medium group"
              >
                <div className="p-1 rounded-full bg-slate-800 group-hover:bg-blue-500/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                Add Manual Summary Point
              </button>
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

                      <div className="flex gap-2">
                        {item.reasoning && (
                          <button
                            onClick={() => toggleReasoning(id)}
                            className="text-xs px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition"
                            title="View Reasoning"
                          >
                            Reasoning
                          </button>
                        )}

                        <button
                          onClick={() => {
                            // Open Edit Modal (TODO: Implement Edit Modal for Actions)
                            // For now, let's just delete as requested by "wrong place"
                            // A full Edit for Actions is complex (3 fields). Delete is critical.
                            if (onUpdate) {
                              const updatedActions = data.actionItems.filter((_, idx) => idx !== i);
                              onUpdate({ ...data, actionItems: updatedActions });
                            }
                          }}
                          className="text-xs px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete Action"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <button
                          onClick={() => exportToCalendar(item)}
                          className="text-xs px-4 py-2 rounded-xl bg-yellow-600 hover:bg-orange-500 text-white transition font-bold"
                        >
                          Sync to Calendar
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

      {/* Add/Edit Point Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingIndex !== null ? 'Edit Summary Point' : 'Add Summary Point'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Budget Review"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Content</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Enter the details..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPoint}
                disabled={isEnhancing || !newTopic || !newContent}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEnhancing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <span>✨</span> {editingIndex !== null ? 'Save Changes' : 'Add & Enhance'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
