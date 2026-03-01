// App.tsx
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import AnalysisView from './components/AnalysisView';
import IntegrationsView from './components/IntegrationsView';
import LandingPage from './components/LandingPage';
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
  const [view, setView] = useState<View>('landing');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get user from AuthContext
  const { user, openLoginModal } = useAuth();
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

  if (view === 'landing') {
    return <LandingPage onEnter={handleNavigate} />;
  }

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
              <div className="space-y-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
                      Intelligence Dashboard
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Manage and analyze your team's meeting insights.
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      isLoading={isAnalyzing}
                      onAuthRequired={!user ? openLoginModal : undefined}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {history.length > 0 ? (
                  <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0b0f19]">
                      <h3 className="text-sm font-semibold text-white">Recent Sessions</h3>
                      <button onClick={handleTrySample} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Load Sample Data</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0f1117] text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="px-6 py-3 font-medium tracking-wide">Source Details</th>
                            <th className="px-6 py-3 font-medium tracking-wide">Intent Overview</th>
                            <th className="px-6 py-3 font-medium tracking-wide">Date</th>
                            <th className="px-6 py-3 font-medium tracking-wide text-right">Actions</th>
                            <th className="px-6 py-3 font-medium text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {history.map((item) => (
                            <tr
                              key={item.id}
                              onClick={() => handleViewHistory(item)}
                              className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                            >
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-200">{item.sourceName}</div>
                                <div className="text-xs text-slate-500 mt-1">Processed via Meet2Action</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="max-w-[250px] lg:max-w-[400px] truncate text-slate-300 font-medium" title={item.intent}>
                                  {item.intent}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {item.actionItems.length} Identified
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={(e) => handleDeleteHistory(e, item.id)}
                                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded hover:bg-red-500/10"
                                  title="Delete Session"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#111827] border border-slate-800 rounded-lg p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-700/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No active sessions</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
                      Upload a meeting transcript, audio, or video file to generate intelligence and action items.
                    </p>
                    <button
                      onClick={handleTrySample}
                      disabled={isAnalyzing}
                      className="px-5 py-2.5 border border-slate-700 bg-slate-800 text-slate-200 text-sm font-medium rounded-md hover:bg-slate-700 hover:text-white transition-colors shadow-sm"
                    >
                      Load Sample Data
                    </button>
                  </div>
                )}
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
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                      Analysis View
                      {analysis === MOCK_ANALYSIS && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase tracking-wider">Demo Mode</span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Reviewing source intelligence</p>
                  </div>
                  <button
                    onClick={reset}
                    className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
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
