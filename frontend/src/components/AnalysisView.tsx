import React, { useState } from 'react';
import { MeetingAnalysis, ActionItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface AnalysisViewProps {
  data: MeetingAnalysis;
  onUpdate?: (analysis: MeetingAnalysis) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'actions'>('summary');
  const [openReasoning, setOpenReasoning] = useState<Record<string, boolean>>({});
  const { user, googleAccessToken, loginWithGoogle } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddPoint = async () => {
    if (!newTopic.trim() || !newContent.trim()) return;
    setIsEnhancing(true);
    try {
      const response = await fetch('http://localhost:8000/api/enhance-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newTopic, content: newContent })
      });
      const result = await response.json();
      const enhancedPoint = { topic: result.topic, content: result.content };

      if (onUpdate) {
        let updatedSummary;
        if (editingIndex !== null) {
          updatedSummary = [...data.summary];
          updatedSummary[editingIndex] = enhancedPoint;
        } else {
          updatedSummary = [...data.summary, enhancedPoint];
        }
        onUpdate({ ...data, summary: updatedSummary });
      }
      setNewTopic("");
      setNewContent("");
      setEditingIndex(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Enhancement failed", error);
      alert("Failed to enhance point.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const toggleReasoning = (id: string) => setOpenReasoning(prev => ({ ...prev, [id]: !prev[id] }));

  const exportToCalendar = async (item: ActionItem) => {
    if (!user) return alert("Sign In Required.");
    let token = googleAccessToken;
    if (!token) {
       // Try to prompt login if token is missing
       try { await loginWithGoogle(); } catch(e) { return ; }
    }
    
    let deadlineIso = item.deadline || new Date(Date.now() + 86400000).toISOString();
    try {
      const response = await fetch('http://localhost:8000/api/google/sync-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: googleAccessToken, 
          summary: item.task, 
          start_time: deadlineIso 
        })
      });
      const result = await response.json();
      if (result.success && result.link) window.open(result.link, '_blank');
      else alert(`Sync failed: ${result.error || "Unknown error"}`);
    } catch (e: any) { alert(`Error syncing: ${e.message}`); }
  };

  const exportToDrive = async () => {
    if (!user) return alert("Sign In Required.");
    let token = googleAccessToken;
    if (!token) {
       try { await loginWithGoogle(); } catch(e) { return ; }
    }

    // Convert summary to a readable text format
    const transcriptText = data.summary.map(p => `${p.topic.toUpperCase()}\n${p.content}\n`).join('\n');
    const filename = `Meeting_Summary_${new Date().toISOString().slice(0,10)}.txt`;

    try {
      const response = await fetch('http://localhost:8000/api/google/upload-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: googleAccessToken, 
          filename, 
          content: transcriptText 
        })
      });
      const result = await response.json();
      if (result.success && result.link) {
         window.open(result.link, '_blank');
         alert("Meeting summary uploaded to Google Drive!");
      } else alert(`Upload failed: ${result.error || "Unknown error"}`);
    } catch (e: any) { alert(`Error uploading: ${e.message}`); }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 border-red-500/40 bg-red-500/10';
      case 'Medium': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'Low': return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      default: return 'text-slate-400 border-slate-500/40 bg-slate-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-2">
      
      {/* Header Intent Banner */}
      <div className="dashboard-card p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative border border-slate-800 rounded-2xl bg-slate-900/10 shadow-lg">
        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1.5 text-center md:text-left">
          <p className="font-space text-[10px] font-black text-blue-500 uppercase tracking-widest shadow-sm">Meeting Core Intent</p>
          <h2 className="font-space text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-sm">{data.intent}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Summary Sections */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
           <div className="flex justify-between items-center px-2">
              <h3 className="font-space text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg"></span>
                Discussion Summary
              </h3>
              <button 
                onClick={() => {setNewTopic(""); setNewContent(""); setIsAddModalOpen(true);}}
                className="text-[10px] font-space font-black text-blue-400 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 bg-slate-900/50 px-4 py-2.5 rounded-lg border border-slate-800 hover:border-blue-500/50 shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
                Add Detail
              </button>
              <button 
                onClick={exportToDrive}
                className="text-[10px] font-space font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 bg-slate-900/50 px-4 py-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Sync to Drive
              </button>
           </div>
           
           <div className="space-y-4">
              {data.summary.map((point, i) => (
                <div key={i} className="dashboard-card p-6 md:p-8 group relative border border-slate-900 rounded-2xl bg-slate-900/10 hover:bg-slate-900/30 transition-all shadow-md">
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="font-space text-lg font-black text-white uppercase tracking-tight leading-tight pr-8">{point.topic}</h4>
                      <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6 lg:top-8 lg:right-8">
                         <button onClick={() => {setNewTopic(point.topic); setNewContent(point.content); setEditingIndex(i); setIsAddModalOpen(true);}} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"><svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                         <button onClick={() => {if (onUpdate) onUpdate({...data, summary: data.summary.filter((_, idx)=>idx!==i)});}} className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"><svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                   </div>
                   <p className="font-outfit text-base text-slate-400 leading-relaxed max-w-3xl opacity-90">{point.content}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Action Items List */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
           <h3 className="font-space text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3 px-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-lg"></span>
              Action Items
           </h3>
           <div className="space-y-4">
              {data.actionItems.map((item, i) => (
                <div key={i} className="dashboard-card p-6 md:p-8 border-l-4 border-l-blue-600 border border-slate-900 rounded-2xl bg-slate-900/10 hover:shadow-xl transition-all shadow-md">
                   <div className="flex justify-between items-start mb-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-space font-black uppercase tracking-widest border shadow-sm ${getPriorityStyles(item.priority)}`}>
                         {item.priority}
                      </span>
                      <button onClick={() => exportToCalendar(item)} className="p-2.5 text-slate-500 hover:text-white transition-all bg-slate-950 rounded-xl border border-slate-800 hover:border-blue-500/50 group/btn shadow-md">
                         <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                      </button>
                   </div>
                   <h4 className="font-space text-lg font-black text-white uppercase tracking-tight mb-6 leading-tight pr-4">{item.task}</h4>
                   <div className="grid grid-cols-2 gap-4 border-t border-slate-800/40 pt-6">
                      <div className="space-y-1">
                         <p className="text-[9px] font-space font-black text-slate-500 uppercase tracking-widest opacity-60">Assignee</p>
                         <p className="text-xs font-black text-slate-200">{item.assignee || "UNASSIGNED"}</p>
                      </div>
                      <div className="text-right space-y-1">
                         <p className="text-[9px] font-space font-black text-slate-500 uppercase tracking-widest opacity-60">Deadline</p>
                         <p className="text-xs font-black text-blue-400">{item.deadline || "DATE TBD"}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95 backdrop-shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
             <h3 className="font-space text-xl font-black text-white mb-8 uppercase tracking-tighter shadow-sm">
               {editingIndex !== null ? 'Modify Point' : 'Add Point'}
             </h3>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-space font-black text-slate-500 uppercase tracking-widest ml-1">Topic Title</label>
                   <input value={newTopic} placeholder="Marketing Plan..." onChange={e=>setNewTopic(e.target.value)} className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-black text-white focus:border-blue-500 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-space font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                   <textarea value={newContent} onChange={e=>setNewContent(e.target.value)} rows={6} placeholder="Provide details..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-black text-white focus:border-blue-500 outline-none transition-all shadow-inner resize-none leading-relaxed" />
                </div>
             </div>
             <div className="flex gap-4 mt-10">
                <button onClick={()=>setIsAddModalOpen(false)} className="flex-1 h-12 rounded-xl bg-slate-800 font-space font-black text-[10px] text-slate-400 tracking-widest hover:bg-slate-750 transition-colors uppercase border border-slate-700/50 shadow-md">Discard</button>
                <button 
                  onClick={handleAddPoint} 
                  disabled={isEnhancing || !newTopic || !newContent}
                  className="flex-1 h-12 rounded-xl bg-blue-600 font-space font-black text-[10px] text-white tracking-widest hover:bg-blue-500 transition-all uppercase shadow-lg shadow-blue-600/20 disabled:opacity-40"
                >
                  {isEnhancing ? 'Syncing...' : 'Save Point'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
