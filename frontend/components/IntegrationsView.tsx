
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-4">Ecosystem <span className="gradient-text">Integrations</span></h2>
        <p className="text-slate-400 max-w-2xl leading-relaxed">
          Connect Meet2Action with the tools your team already uses. Seamlessly bridge the gap between conversation and execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {integrations.map((item, i) => (
          <div key={i} className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="text-4xl group-hover:scale-110 transition-transform">{item.icon}</div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${item.status === 'Connected' ? 'bg-green-500/10 text-green-400' :
                item.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'
                }`}>
                {item.status}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-3">{item.name}</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {item.description}
            </p>
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Capabilities</h4>
              <ul className="space-y-1">
                {item.features.map((f, j) => (
                  <li key={j} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  if (item.name === 'Google Calendar' && !user) {
                    window.location.href = 'http://localhost:8000/auth/google/login';
                  }
                }}
                disabled={item.status === 'Connected' || item.status === 'Unavailable'}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${item.status === 'Connected'
                  ? 'bg-green-500/10 text-green-400 cursor-default border border-green-500/20'
                  : item.status === 'Unavailable'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                  }`}
              >
                {item.status === 'Connected' ? 'Connected' : item.status === 'Unavailable' ? 'Coming Soon' : 'Initialize Connection'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsView;
