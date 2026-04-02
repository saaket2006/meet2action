// App.tsx
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import AnalysisView from './components/AnalysisView';
import IntegrationsView from './components/IntegrationsView';
import LandingPage from './components/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import { storageService } from './services/storage';
import { MeetingAnalysis, FileData, AnalysisStatus, SavedAnalysis, View } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';

const MOCK_ANALYSIS: MeetingAnalysis = {
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

  const { user, openLoginModal } = useAuth();
  const userId = user?.email;

  useEffect(() => {
    setHistory(storageService.getHistory(userId));
  }, [userId]);

  const handleFileSelect = async (fileData: FileData) => {
    if (!user) {
      openLoginModal();
      return;
    }

    setStatus('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileData.file);

      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Processing failed');

      const result: MeetingAnalysis = await response.json();
      setAnalysis(result);
      storageService.saveAnalysis(result, result.title || fileData.name, userId);
      setHistory(storageService.getHistory(userId));
      setStatus('success');
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please retry.');
      setStatus('error');
    }
  };

  const handleTrySample = () => {
    setStatus('analyzing');
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setStatus('success');
    }, 2000); 
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
    if (newView === 'main') reset();
    setView(newView);
  };

  const isIdle = status === 'idle';
  const isError = status === 'error';
  const isAnalyzing = status === 'analyzing';

  const handleAnalysisUpdate = (updatedAnalysis: MeetingAnalysis) => {
    setAnalysis(updatedAnalysis);
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
    setHistory(storageService.getHistory(userId));
  };

  if (view === 'landing') {
    return <LandingPage onEnter={handleNavigate} />;
  }

  return (
    <Layout activeView={view} onNavigate={handleNavigate}>
      {isAnalyzing && <LoadingScreen />}
      
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 p-6">
        {view === 'integrations' ? (
          <IntegrationsView />
        ) : (
          <>
            {isIdle || isError ? (
              <div className="space-y-8">
                
                {/* Platform Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-900 pb-8 mb-6">
                  <div className="space-y-1">
                    <h2 className="font-space text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">
                      Meeting <span className="text-blue-500">Dashboard</span>
                    </h2>
                    <p className="font-outfit text-slate-500 text-sm md:text-base font-medium tracking-wide">
                      Manage your transcripts and analyze historical insights.
                    </p>
                  </div>
                  <button
                    onClick={handleTrySample}
                    disabled={isAnalyzing}
                    className="group h-[44px] px-6 bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-space font-black tracking-widest rounded-lg hover:border-blue-500/50 hover:bg-slate-800 transition-all flex items-center gap-3 shadow-lg"
                  >
                    <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    LOAD DEMO SESSIONS
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-xs font-space font-black uppercase tracking-widest flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Operational Error: {error}
                  </div>
                )}

                {history.length > 0 ? (
                  <div className="dashboard-card overflow-hidden border border-slate-900 rounded-2xl shadow-xl bg-slate-900/10">
                    <div className="px-6 py-5 border-b border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/30">
                       <div className="space-y-0.5">
                          <h3 className="font-space text-xs font-black text-white uppercase tracking-widest">Meeting History</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{history.length} Sessions Records</p>
                       </div>
                       <FileUpload
                        onFileSelect={handleFileSelect}
                        isLoading={isAnalyzing}
                        onAuthRequired={!user ? openLoginModal : undefined}
                        maxWidth="240px"
                      />
                    </div>

                    <div className="overflow-x-auto min-h-[300px]">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead>
                          <tr className="bg-slate-950/40 text-slate-500 font-space text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                            <th className="px-6 py-4">Source Type</th>
                            <th className="px-6 py-4">Summary Insight</th>
                            <th className="px-6 py-4">Date Processed</th>
                            <th className="px-6 py-4 text-right">Action Items</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {history.map((item) => (
                            <tr
                              key={item.id}
                              onClick={() => handleViewHistory(item)}
                              className="hover:bg-blue-600/5 cursor-pointer transition-all group border-transparent border-l-2 hover:border-blue-500"
                            >
                              <td className="px-6 py-5">
                                <div className="font-space font-black text-sm text-slate-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.sourceName}</div>
                                <div className="text-[9px] text-slate-600 font-bold mt-1 uppercase tracking-tighter">Transcript Source Detail</div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="max-w-[400px] truncate text-xs text-slate-400 font-medium group-hover:text-slate-200 transition-colors" title={item.intent}>
                                  {item.intent}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-[11px] font-space font-bold text-slate-500">
                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-4">
                                  <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-[9px] font-space font-black text-blue-500 border border-blue-500/20 uppercase tracking-widest shadow-sm">
                                    {item.actionItems.length} DETECTED
                                  </span>
                                  <button
                                    onClick={(e) => handleDeleteHistory(e, item.id)}
                                    className="text-slate-700 hover:text-red-500 transition-colors p-2.5 bg-slate-900/50 rounded-lg hover:bg-red-500/10"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-card p-16 text-center flex flex-col items-center justify-center space-y-8 border-2 border-dashed border-slate-800 rounded-[2rem] bg-slate-900/5 shadow-inner">
                    <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative group overflow-hidden">
                       <div className="absolute inset-0 bg-blue-600/5 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100"></div>
                       <svg className="w-10 h-10 text-slate-600 group-hover:text-blue-500 transition-colors relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                    </div>
                    <div className="space-y-2">
                       <h3 className="font-space text-2xl font-black text-white uppercase tracking-tighter">Initialize History</h3>
                       <p className="text-slate-500 max-w-sm mx-auto font-outfit text-base leading-relaxed tracking-wide opacity-80">
                          Capture insights today. Upload your first source to begin analyzing results.
                       </p>
                    </div>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onAuthRequired={!user ? openLoginModal : undefined}
                      isLoading={isAnalyzing}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8">
                  <div className="space-y-1">
                    <h3 className="font-space text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-5">
                      Analysis Record
                      {analysis === MOCK_ANALYSIS && (
                        <span className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-blue-600 text-white uppercase tracking-widest shadow-md">SIMULATION</span>
                      )}
                    </h3>
                    <p className="text-[10px] font-space text-slate-500 font-bold uppercase tracking-[0.2em]">Viewing Integrated Source Intelligence</p>
                  </div>
                  <button
                    onClick={reset}
                    className="h-10 px-6 bg-slate-900 border border-slate-800 text-[11px] font-space font-black tracking-widest text-slate-300 hover:text-white hover:border-slate-600 transition-all rounded-lg flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    CLOSE RECORD
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
