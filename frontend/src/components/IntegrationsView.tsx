import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface CalendarEntry {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
}

const IntegrationsView: React.FC = () => {
  const { user, googleAccessToken, loginWithGoogle } = useAuth();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [calendars, setCalendars] = useState<CalendarEntry[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');

  const integrations = [
    {
      name: 'Google Calendar',
      icon: '📅',
      status: user ? 'Connected' : 'Pending',
      description: 'Automatically schedule meeting action items with detected deadlines into your primary or secondary calendars.',
      features: ['Conflict detection', 'Smart reminders', 'Group invite sync']
    },
    {
      name: 'Trello',
      icon: '📋',
      status: 'Unavailable',
      description: 'Convert meeting tasks into Trello cards. Map assignees to board members and set labels based on priority.',
      features: ['Custom board mapping', 'Label automation', 'Attachment support']
    },
    {
      name: 'Slack',
      icon: '💬',
      status: 'Unavailable',
      description: 'Push meeting summaries and high-priority action items directly to project channels.',
      features: ['Real-time notifications', 'Interactive task buttons', 'Threaded summaries']
    },
    {
      name: 'Jira Software',
      icon: '🏗️',
      status: 'Unavailable',
      description: 'Directly create tickets in your Jira backlogs from technical meeting discussions.',
      features: ['Sprint assignment', 'Epic linking', 'Story point estimation']
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-800 pb-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Integrations & Add-ons</h2>
        <p className="text-sm text-slate-400">
          Connect Meet2Action with the tools your team already uses. Seamlessly bridge the gap between conversation and execution.
        </p>
      </div>

      <div className="space-y-4">
        {integrations.map((item, i) => (
          <div key={i} className="bg-[#111827] border border-slate-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-colors shadow-sm">
            
            <div className="flex items-start gap-5 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-[#0b0f19] border border-slate-700/60 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {item.icon}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-base font-semibold text-slate-200">{item.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    item.status === 'Connected' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    item.status === 'Pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                    'bg-slate-800/50 border-slate-700/50 text-slate-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-3 hidden lg:flex">
                   {item.features.map((f, j) => (
                      <span key={j} className="text-xs text-slate-500 bg-[#0b0f19] border border-slate-800 px-2 py-1 rounded">
                        {f}
                      </span>
                   ))}
                </div>
              </div>
            </div>

             <div className="w-full md:w-auto flex shrink-0 border-t border-slate-800/60 md:border-t-0 pt-4 md:pt-0">
               <button
                  onClick={async () => {
                    if (item.name === 'Google Calendar') {
                      if (!user) {
                        alert("Please Sign In via the global login button to connect Google services.");
                        return;
                      }
                      
                      if (item.status === 'Connected') {
                        setIsManageModalOpen(true);
                        setIsLoadingCalendars(true);
                        try {
                          let token = googleAccessToken;
                          if (!token) {
                            await loginWithGoogle();
                            token = googleAccessToken;
                          }
                          
                          const response = await fetch('http://localhost:8000/api/google/list-calendars', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: token || googleAccessToken })
                          });
                          const result = await response.json();
                          if (result.success) {
                            setCalendars(result.calendars);
                          } else {
                            alert("Failed to fetch calendars: " + result.error);
                          }
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setIsLoadingCalendars(false);
                        }
                      }
                    }
                  }}
                  disabled={item.status === 'Unavailable'}
                  className={`w-full md:w-auto px-5 py-2 rounded-md text-sm font-medium transition-colors border ${
                      item.status === 'Connected'
                      ? 'bg-slate-800 text-slate-300 border-slate-700 cursor-default'
                      : item.status === 'Unavailable'
                        ? 'bg-[#0b0f19] text-slate-600 border-slate-800 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm'
                    }`}
                >
                  {item.status === 'Connected' ? 'Manage' : item.status === 'Unavailable' ? 'Coming Soon' : 'Connect'}
                </button>
            </div>

            
          </div>
        ))}
      </div>

      {/* Management Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-8 animate-in zoom-in-95 backdrop-shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
             
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Manage Google Calendar</h3>
                  <p className="text-xs text-slate-400 mt-1">Configure your synchronization preferences</p>
                </div>
                <button 
                  onClick={() => setIsManageModalOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Target Calendar</label>
                   {isLoadingCalendars ? (
                      <div className="flex items-center justify-center py-8">
                         <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                   ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                         {calendars.length === 0 ? (
                            <div className="py-10 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Calendars Found</p>
                               <button 
                                 onClick={() => window.location.reload()} 
                                 className="mt-3 text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-tighter"
                               >
                                 Re-sync Account
                               </button>
                            </div>
                         ) : (
                            calendars.map((cal) => (
                               <button 
                                 key={cal.id}
                                 onClick={() => setSelectedCalendarId(cal.id)}
                                 className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                                   selectedCalendarId === cal.id 
                                   ? 'bg-blue-600/10 border-blue-500/50 text-white' 
                                   : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                                 }`}
                               >
                                  <div className="flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${cal.primary ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-600'}`}></div>
                                     <span className="text-sm font-semibold truncate max-w-[240px]">{cal.summary}</span>
                                  </div>
                                  {selectedCalendarId === cal.id && (
                                     <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                     </svg>
                                  )}
                               </button>
                            ))
                         )}
                      </div>
                   )}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                   <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                         </div>
                         <span className="text-xs font-bold text-slate-300">Auto-sync Action Items</span>
                      </div>
                      <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer shadow-inner shadow-blue-900/40">
                         <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                   </div>

                   <button 
                      onClick={() => {alert("Calendar integration preferences saved."); setIsManageModalOpen(false);}}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                   >
                      Save Preferences
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsView;
