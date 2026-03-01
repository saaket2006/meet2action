
import React from 'react';
import { useAuth } from '../context/AuthContext';

const IntegrationsView: React.FC = () => {
  const { user } = useAuth();

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
                  onClick={() => {
                    if (item.name === 'Google Calendar' && !user) {
                      window.location.href = 'http://localhost:8000/auth/google/login';
                    }
                  }}
                  disabled={item.status === 'Connected' || item.status === 'Unavailable'}
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
    </div>
  );
};

export default IntegrationsView;
