import React from 'react';
import { Cloud, ShieldCheck, FlaskConical, AlertTriangle } from 'lucide-react';

export default function ModeBadge({ mode, isConnected, onConfigure }) {
  const isLive = mode === 'LIVE_IBM_CLOUD';

  return (
    <div className="flex items-center gap-2">
      {isLive ? (
        <div 
          onClick={onConfigure}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/20 transition shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          title="Connected to authentic IBM Cloud IAM & Resource APIs. Click to view or adjust settings."
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Cloud className="w-3.5 h-3.5" />
          <span>LIVE IBM CLOUD</span>
        </div>
      ) : (
        <div 
          onClick={onConfigure}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-500/20 transition shadow-[0_0_12px_rgba(168,85,247,0.15)]"
          title="Running in high-fidelity simulated cloud lab. Click to enter real IBM Cloud API key."
        >
          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
          <span>SIMULATED CLOUD LAB</span>
          <span className="text-[10px] bg-purple-900/60 px-1.5 py-0.2 rounded border border-purple-700/50">DEMO</span>
        </div>
      )}
    </div>
  );
}
