import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Boxes, 
  Radar, 
  AlertOctagon, 
  FileCheck2, 
  Wrench, 
  History, 
  FileText, 
  Settings,
  Cloud,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activePage, onNavigate, findingCount = 0 }) {
  const menuItems = [
    { id: 'dashboard', label: 'Security Dashboard', icon: LayoutDashboard },
    { id: 'architecture', label: 'Cloud Architecture', icon: Network, highlight: true },
    { id: 'discovery', label: 'Resource Discovery', icon: Boxes },
    { id: 'scanner', label: 'Security Scanner', icon: Radar },
    { id: 'findings', label: 'Vulnerability Findings', icon: AlertOctagon, badge: findingCount },
    { id: 'compliance', label: 'Compliance Center', icon: FileCheck2 },
    { id: 'remediation', label: 'Remediation Center', icon: Wrench },
    { id: 'history', label: 'Scan History & Drift', icon: History },
    { id: 'reports', label: 'Audit Reports', icon: FileText },
    { id: 'settings', label: 'Settings & Cloud Config', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0B0F19] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          CSPM Modules
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600/20 to-cyan-500/10 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(2,132,199,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    {item.badge}
                  </span>
                ) : item.highlight ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Environment Scope Card */}
      <div className="p-3 border-t border-slate-800/80 m-2 rounded-xl bg-slate-900/40">
        <div className="flex items-center gap-2 mb-1">
          <Cloud className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-bold text-slate-300">IBM Cloud Target</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Monitoring <b>COS</b>, <b>VPC</b>, <b>IAM</b>, and <b>Activity Tracker</b> for ISO 27017 & CSA STAR compliance.
        </p>
      </div>
    </aside>
  );
}
