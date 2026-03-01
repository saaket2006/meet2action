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
    <div className="space-y-6">
      {/* Core Intent Panel */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 border border-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Core Intent</h4>
          <p className="text-lg font-medium text-slate-200 leading-snug">{data.intent}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Summary Items */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0b0f19]">
              <h3 className="text-base font-semibold text-white">Minutes of Meeting</h3>
              <button
                onClick={() => {
                  setNewTopic("");
                  setNewContent("");
                  setIsAddModalOpen(true);
                }}
                className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Detail
              </button>
            </div>
            
            <div className="p-0 flex-1 divide-y divide-slate-800/60">
              {data.summary.map((point, i) => {
                const id = `summary-${i}`;
                return (
                  <div key={i} className="group/item relative p-6 hover:bg-slate-800/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-slate-200 text-sm font-semibold">
                        {point.topic}
                      </h5>

                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setNewTopic(point.topic);
                            setNewContent(point.content);
                            setEditingIndex(i);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded transition"
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
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                      {point.content}
                    </p>

                    {point.reasoning && (
                      <div>
                        <button
                          onClick={() => toggleReasoning(id)}
                          className="text-xs font-medium text-slate-500 hover:text-blue-400 transition inline-flex items-center gap-1"
                        >
                          {openReasoning[id] ? 'Hide Extraction Logic' : 'View Extraction Logic'}
                        </button>
                        {openReasoning[id] && (
                          <div className="mt-2 p-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-400 italic">
                            {point.reasoning}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {data.summary.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No meeting minutes extracted.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Action Items */}
        <div className="lg:w-[400px] xl:w-[480px] flex-shrink-0">
          <div className="bg-[#111827] border border-slate-800 rounded-lg shadow-sm overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0b0f19]">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Action Matrix
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {data.actionItems.length}
                </span>
              </h3>
            </div>
            
            <div className="divide-y divide-slate-800/60 max-h-[800px] overflow-y-auto">
              {sortedActions.map((item, i) => {
                const id = `action-${i}`;
                return (
                  <div key={i} className="p-5 hover:bg-slate-800/20 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center justify-center w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityStyles(item.priority)}`}>
                          {item.priority}
                        </span>
                        <div className="text-xs font-medium text-slate-500">
                          Assignee: <span className="text-slate-300">{item.assignee || "Unassigned"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (onUpdate) {
                              const updatedActions = data.actionItems.filter((_, idx) => idx !== i);
                              onUpdate({ ...data, actionItems: updatedActions });
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition"
                          title="Remove Action"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200 mb-3 leading-snug">
                      {item.task}
                    </h4>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/50">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {item.deadline || "No deadline"}
                      </div>
                      
                      <button
                        onClick={() => exportToCalendar(item)}
                        className="text-[11px] px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition font-medium flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                        </svg>
                        Export
                      </button>
                    </div>

                    {item.reasoning && (
                      <div className="mt-3">
                        <button
                          onClick={() => toggleReasoning(id)}
                          className="text-[10px] font-medium text-slate-500 hover:text-blue-400 transition"
                        >
                          {openReasoning[id] ? 'Hide Logic' : 'View Logic'}
                        </button>
                        {openReasoning[id] && (
                          <div className="mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 italic">
                            {item.reasoning}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {sortedActions.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No action items identified.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Point Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 w-full max-w-md shadow-xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingIndex !== null ? 'Edit Detail' : 'Add Detail'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Topic</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Q3 Roadmap"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                  placeholder="Enter the details..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPoint}
                disabled={isEnhancing || !newTopic || !newContent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEnhancing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {editingIndex !== null ? 'Save Changes' : 'Add Detail'}
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
