import React from 'react';
import { Shield, Play, RefreshCw, Bell, Layers, ExternalLink } from 'lucide-react';
import ModeBadge from './ModeBadge';

export default function Navbar({ 
  cloudStatus, 
  scans = [], 
  selectedScanId, 
  onSelectScan, 
  onTriggerScan, 
  isScanning,
  onNavigate,
  activePage
}) {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(2,132,199,0.35)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
                RISK RADAR
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-sky-950/80 text-sky-400 border border-sky-800/80 rounded">
                CSPM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">IBM Cloud Security Posture</p>
          </div>
        </div>

        {/* Scan Selector */}
        {scans.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Active Audit:</span>
            <select
              value={selectedScanId || ''}
              onChange={(e) => onSelectScan(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 py-1 px-2.5 focus:outline-none focus:border-sky-500"
            >
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.started_at).toLocaleDateString()} {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Score: {s.posture_score}% ({s.mode === 'LIVE_IBM_CLOUD' ? 'Live' : 'Lab'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Environment Mode Pill */}
        <ModeBadge
          mode={cloudStatus?.mode}
          isConnected={cloudStatus?.is_connected}
          onConfigure={() => onNavigate('settings')}
        />

        {/* Quick Scan Action */}
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
            isScanning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(2,132,199,0.3)]'
          }`}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Scanning Cloud...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Scan</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
