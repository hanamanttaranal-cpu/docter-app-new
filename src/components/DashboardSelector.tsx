import React, { useState } from 'react';
import { User } from '../types';
import { Activity, ShieldAlert, Heart, Settings, Network, LogOut } from 'lucide-react';

interface DashboardSelectorProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  availableUsers: User[];
  socketLogs: string[];
  clearSocketLogs: () => void;
  lockedRole?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  onLogOut?: () => void;
}

export default function DashboardSelector({
  currentUser,
  onUserChange,
  availableUsers,
  socketLogs,
  clearSocketLogs,
  lockedRole,
  onLogOut
}: DashboardSelectorProps) {
  const [showLogs, setShowLogs] = useState(false);

  const getHeaderStyle = () => {
    switch (currentUser?.role || lockedRole) {
      case 'ADMIN':
        return {
          title: 'MedConsult Admin Portal',
          subtitle: 'System Control & Analytics',
          logoBg: 'bg-indigo-600 shadow-indigo-600/15',
          activeRing: 'ring-indigo-500/10',
          roleLabel: 'Admin Terminal'
        };
      case 'DOCTOR':
        return {
          title: 'MedConsult Clinical Portal',
          subtitle: 'Doctor Medical Office',
          logoBg: 'bg-teal-600 shadow-teal-600/15',
          activeRing: 'ring-teal-500/10',
          roleLabel: 'Clinical Console'
        };
      case 'PATIENT':
      default:
        return {
          title: 'MedConsult Patient Console',
          subtitle: 'On-Demand Consultation',
          logoBg: 'bg-emerald-600 shadow-emerald-600/15',
          activeRing: 'ring-emerald-500/10',
          roleLabel: 'Patient Access'
        };
    }
  };

  const style = getHeaderStyle();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand / Icon */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${style.logoBg} flex items-center justify-center text-white font-black shadow-md`}>
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-md sm:text-lg font-black text-gray-900 tracking-tight block">{style.title}</span>
              <span className="text-2xs font-bold text-gray-400 uppercase tracking-widest block -mt-1">{style.subtitle}</span>
            </div>
          </div>

          {/* Center Sandbox Broker Status */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-gray-100 rounded-full py-1.5 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-semibold text-gray-600 font-mono">STOMP: Port-Mapped OK</span>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-2xs bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors font-bold px-2 py-0.5 rounded-sm flex items-center gap-1"
              id="toggle-stomp-logs"
            >
              <Network className="w-3 h-3" />
              {showLogs ? 'Hide Streams' : 'STOMP Logs'}
            </button>
          </div>

          {/* User Select & Switcher */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xs font-bold text-gray-400 uppercase block tracking-wider leading-none">Logged In As</span>
              <span className="text-xs font-bold text-slate-800 font-sans block mt-0.5" id="current-user-fullname">
                {currentUser?.name || 'Anonymous User'}
              </span>
            </div>

            {/* Profile Avatar Frame */}
            <div className="hidden sm:block">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                alt={currentUser?.name || 'Avatar'}
                className={`w-9 h-9 rounded-full ring-2 ${style.logoBg.replace('bg-', 'ring-').split(' ')[0]}/10 object-cover`}
              />
            </div>

            {/* Elegant Sign Out Button */}
            {onLogOut && (
              <button
                onClick={onLogOut}
                className="text-2xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                id="sign-out-dashboard-button"
                title="Log Out Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out STOMP Stream Monitor Logs */}
      {showLogs && (
        <div className="bg-slate-900 border-b border-slate-800 p-4 text-white font-mono text-2xs transition-all" id="stomp-traffic-drawer">
          <div className="max-w-7xl mx-auto flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-emerald-400 font-bold flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Live STOMP Messaging Frame Inspector
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearSocketLogs}
                className="text-4xs text-slate-400 hover:text-white underline"
              >
                Clear
              </button>
              <button
                onClick={() => setShowLogs(false)}
                className="text-4xs text-slate-400 hover:text-white underline"
              >
                Close
              </button>
            </div>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {socketLogs.length === 0 ? (
              <p className="text-slate-500 italic">No STOMP WebSocket frames captured yet.</p>
            ) : (
              socketLogs.map((log, index) => (
                <div key={index} className="flex gap-2 border-b border-slate-950/20 py-0.5">
                  <span className="text-slate-500 select-none">[{new Date().toTimeString().split(' ')[0]}]</span>
                  <span className={log.startsWith('<<<') ? 'text-emerald-400' : 'text-cyan-400'}>{log}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
}
