// App.tsx
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import AnalysisView from './components/AnalysisView';
import IntegrationsView from './components/IntegrationsView';
import { storageService } from './services/storage';
import { MeetingAnalysis, FileData, AnalysisStatus, SavedAnalysis, View } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';

const MOCK_ANALYSIS: MeetingAnalysis = {
  // ... (keep MOCK_ANALYSIS as is, it's long so just referencing it)
  intent: "Project 'Aether' Sprint Planning and Q3 Roadmap Alignment",
  summary: [
    {
      topic: "Technical Infrastructure",
      content: "The team discussed the migration to the new edge-computing nodes. Current latency is at 45ms, goal is to reach <10ms by end of August."
    },
    {
      topic: "Marketing & Brand",
      content: "Sarah presented the 'Aether' brand identity. The futuristic aesthetic with neon accents was approved. Social media rollout starts next week."
    },
    {
      topic: "Budget & Resource Allocation",
      content: "An additional $50k has been unlocked for external penetration testing. Hiring for 2 more senior DevOps roles is prioritized."
    }
  ],
  actionItems: [
    {
      task: "Complete Edge Node prototype",
      assignee: "Marcus Chen",
      deadline: "20-02-2026",
      priority: "High",
      canExport: true
    },
    {
      task: "Approve final brand kit and style guide",
      assignee: "Sarah Miller",
      deadline: "20-02-2026",
      priority: "Medium",
      canExport: true
    },
    {
      task: "Draft Q3 hiring plan for DevOps roles",
      assignee: "Elena Rodriguez",
      deadline: "22-02-2026",
      priority: "High",
      canExport: true
    },
    {
      task: "Coordinate with security firm for Pen-Testing",
      assignee: "David Park",
      deadline: "21-02-2026",
      priority: "Low",
      canExport: true
    }
  ],
  projectContextFound: true
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('main');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get user from AuthContext
  const { user } = useAuth();
  // Use email as unique ID, or undefined if guest
  const userId = user?.email;

  useEffect(() => {
    // Reload history when user changes
    setHistory(storageService.getHistory(userId));
  }, [userId]);

  const handleFileSelect = async (fileData: FileData) => {
    setStatus('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileData.file);

      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Backend failed');
      }

      const result: MeetingAnalysis = await response.json();

      setAnalysis(result);
      // Use the generated title if available, otherwise fallback to filename
      const storageName = result.title || fileData.name;
      storageService.saveAnalysis(result, storageName, userId);
      setHistory(storageService.getHistory(userId));
      setStatus('success');
    } catch (err) {
      console.error(err);
      setError('Backend connection failed.');
      setStatus('error');
    }
  };

  const handleTrySample = () => {
    setStatus('analyzing');
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setStatus('success');
    }, 1500);
  };

  const handleViewHistory = (item: SavedAnalysis) => {
    setAnalysis(item);
    setStatus('success');
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storageService.deleteAnalysis(id, userId);
    setHistory(storageService.getHistory(userId));
  };

  const reset = () => {
    setAnalysis(null);
    setStatus('idle');
    setError(null);
    setView('main');
  };

  const handleNavigate = (newView: View) => {
    if (newView === 'main') {
      reset();
    }
    setView(newView);
  };

  const isIdle = status === 'idle';
  const isError = status === 'error';
  const isAnalyzing = status === 'analyzing';

  const handleAnalysisUpdate = (updatedAnalysis: MeetingAnalysis) => {
    setAnalysis(updatedAnalysis);

    // Check if this analysis is already saved (has an ID matching one in history)
    // If we have a 'SavedAnalysis' type in state, use it. But 'analysis' is MeetingAnalysis.
    // We need to check if we are viewing a history item.

    const currentAnalysisIsSaved = history.some(item =>
      item.intent === updatedAnalysis.intent &&
      item.createdAt === (analysis as SavedAnalysis)?.createdAt
    );

    if (currentAnalysisIsSaved && (analysis as SavedAnalysis)?.id) {
      // It's an existing item, update it
      const updatedSaved: SavedAnalysis = {
        ...updatedAnalysis,
        id: (analysis as SavedAnalysis).id,
        createdAt: (analysis as SavedAnalysis).createdAt,
        sourceName: (analysis as SavedAnalysis).sourceName
      };
      storageService.updateAnalysis(updatedSaved, userId);
    } else {
      // It's a new or unsaved analysis, save as new? 
      // Start: For now, if we are in "success" mode after analysis, we already saved it once in handleFileSelect.
      // So we should find the most recent one or pass the ID. 
      // Let's rely on finding it in history by content match if ID is missing, or better:
      // When we setAnalysis in handleFileSelect, we should ideally upgrade it to SavedAnalysis.

      // Simplified approach: If we are viewing history, update. If fresh analysis, update the last entry if it matches.
      const lastItem = history[0];
      if (lastItem && lastItem.intent === analysis?.intent) {
        const updatedSaved: SavedAnalysis = {
          ...updatedAnalysis,
          id: lastItem.id,
          createdAt: lastItem.createdAt,
          sourceName: lastItem.sourceName
        };
        storageService.updateAnalysis(updatedSaved, userId);
      }
    }
    setHistory(storageService.getHistory(userId));
  };

  return (
    <Layout
      activeView={view}
      onNavigate={handleNavigate}
    >
      <div className="max-w-6xl mx-auto">
        {view === 'integrations' ? (
          <IntegrationsView />
        ) : (
          <>
            {isIdle || isError ? (
              <div className="space-y-24">
                <section className="text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    Meetings to <span className="gradient-text">Actions</span>
                  </h2>
                  <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    An Intent-Centric Agent Orchestrated Platform that transforms your meetings into actionable insights, seamlessly integrating with your workflow.
                  </p>

                  <div className="max-w-2xl mx-auto space-y-4">
                    {error && (
                      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    <FileUpload onFileSelect={handleFileSelect} isLoading={isAnalyzing} />

                    <div className="flex items-center justify-center gap-4">
                      <div className="h-px bg-slate-800 flex-1"></div>
                      <span className="text-slate-500 text-sm font-medium">OR</span>
                      <div className="h-px bg-slate-800 flex-1"></div>
                    </div>

                    <button
                      onClick={handleTrySample}
                      disabled={isAnalyzing}
                      className="w-full py-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 text-blue-400 font-semibold hover:bg-blue-500/10 transition-all active:scale-[0.98]"
                    >
                      View Sample Meeting Analysis
                    </button>
                  </div>
                </section>

                {history.length > 0 && (
                  <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold">Recent Intelligence Sessions</h3>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Backend Sync: Active</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleViewHistory(item)}
                          className="glass p-6 rounded-3xl cursor-pointer hover:border-blue-500/40 hover:bg-white/5 transition-all group relative"
                        >
                          <button
                            onClick={(e) => handleDeleteHistory(e, item.id)}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">
                            {new Date(item.createdAt).toLocaleDateString()} • {item.sourceName}
                          </div>
                          <h4 className="text-lg font-semibold text-slate-100 line-clamp-2 mb-4">{item.intent}</h4>
                          <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-4 border-t border-white/5">
                            <span>{item.actionItems.length} Actions</span>
                            <span className="text-blue-400 group-hover:translate-x-1 transition-transform">Review Analysis →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: 'Intelligent Intent', desc: 'Auto-detect the purpose of every discussion.', icon: '🧠' },
                    { title: 'Action Extraction', desc: 'Identify assignees and deadlines of tasks instantly.', icon: '🎯' },
                    { title: 'App Integration', desc: 'Sync directly with Trello, Google Calendar, and many more.', icon: '🔗' },
                  ].map((feature, i) => (
                    <div key={i} className="glass p-8 rounded-3xl text-left hover:border-white/20 transition-all group">
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{feature.icon}</div>
                      <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Analyzing Meeting</h3>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      Analysis Results
                      {analysis === MOCK_ANALYSIS && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase tracking-wider">Demo Mode</span>
                      )}
                    </h3>
                    <p className="text-slate-400">Review extracted and suggested actions</p>
                  </div>
                  <button
                    onClick={reset}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    New Session
                  </button>
                </div>
                {analysis && <AnalysisView data={analysis} onUpdate={handleAnalysisUpdate} />}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );

};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
