import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Boxes, 
  FileCheck2, 
  ArrowUpRight, 
  ExternalLink, 
  Activity, 
  Lock, 
  Network, 
  Database,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import PostureGauge from '../components/PostureGauge';

export default function Dashboard({ scan, onNavigate, onTriggerScan, isScanning }) {
  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShieldAlert className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-300">No Scan Data Available</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
          Launch a CSPM scan to discover cloud resources and detect security misconfigurations.
        </p>
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg transition"
        >
          {isScanning ? 'Scanning...' : 'Launch First Cloud Scan'}
        </button>
      </div>
    );
  }

  const sevData = [
    { name: 'Critical', count: scan.critical_count || 0, color: '#EF4444' },
    { name: 'High', count: scan.high_count || 0, color: '#F97316' },
    { name: 'Medium', count: scan.medium_count || 0, color: '#F59E0B' },
    { name: 'Low', count: scan.low_count || 0, color: '#3B82F6' },
  ];

  const serviceData = [
    { service: 'Object Storage (COS)', score: scan.service_breakdown?.COS?.score || 0, findings: scan.service_breakdown?.COS?.total_findings || 0 },
    { service: 'Virtual Private Cloud', score: scan.service_breakdown?.VPC?.score || 0, findings: scan.service_breakdown?.VPC?.total_findings || 0 },
    { service: 'Identity & Access (IAM)', score: scan.service_breakdown?.IAM?.score || 0, findings: scan.service_breakdown?.IAM?.total_findings || 0 },
    { service: 'Activity Tracker', score: scan.service_breakdown?.ACTIVITY_TRACKER?.score || 0, findings: scan.service_breakdown?.ACTIVITY_TRACKER?.total_findings || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Cloud Security Posture Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated configuration auditing for IBM Cloud Object Storage, VPC, IAM, and Activity Tracker.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('architecture')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700 transition"
          >
            <Network className="w-3.5 h-3.5 text-sky-400" />
            <span>Architecture View</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Reports</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Posture Score Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Posture Score
            </span>
            <div className="text-2xl font-black text-slate-100">
              {scan.posture_score}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Grade <b className="text-slate-200">{scan.risk_grade}</b> Status
            </p>
          </div>
          <PostureGauge score={scan.posture_score} grade={scan.risk_grade} size={90} />
        </div>

        {/* Critical & High Findings */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              High-Risk Findings
            </span>
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-400">{scan.critical_count}</span>
            <span className="text-xs text-slate-400">Critical &bull; <b className="text-orange-400">{scan.high_count}</b> High</span>
          </div>
          <button 
            onClick={() => onNavigate('findings')}
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-3"
          >
            Review all {scan.total_findings} findings <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Resources Scanned */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Scanned Resources
            </span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100">{scan.total_resources}</span>
            <span className="text-xs text-slate-400">in {scan.region || 'us-south'}</span>
          </div>
          <button 
            onClick={() => onNavigate('discovery')}
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-3"
          >
            Explore inventory <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Compliance Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Compliance Align
            </span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ISO/IEC 27017:</span>
              <span className="font-mono font-bold text-cyan-400">{scan.iso_compliance_score}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">CSA STAR (CCM):</span>
              <span className="font-mono font-bold text-purple-400">{scan.csa_compliance_score}%</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('compliance')}
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-3"
          >
            View gap analysis <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution Donut */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-1">Vulnerability Severity Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Count of active misconfigurations categorized by impact.</p>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sevData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {sevData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
            {sevData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-400">{s.name}:</span>
                <span className="font-mono font-bold text-slate-200">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Posture Breakdown Bar */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">IBM Cloud Service Security Ratings</h3>
              <p className="text-xs text-slate-400">Calculated posture percentage across core cloud pillars.</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              4 Services Evaluated
            </span>
          </div>
          <div className="space-y-4">
            {serviceData.map((s) => {
              const score = s.score;
              const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={s.service} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{s.service}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">{s.findings} findings</span>
                      <span className="font-mono font-bold text-slate-200">{score}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Critical cloud risk stems from public COS buckets & unrestricted VPC port 22/3389 rules.</span>
            <button 
              onClick={() => onNavigate('remediation')}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              Go to Remediation Center <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Threat Exposure Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-200 mb-1">Threat Exposure Matrix (Likelihood vs. Impact)</h3>
        <p className="text-xs text-slate-400 mb-4">
          Risk classification based on exploit accessibility and potential cloud account compromise impact.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">Immediate Action</span>
            <p className="text-2xl font-black text-red-300 mb-1">{scan.critical_count}</p>
            <p className="text-[11px] text-slate-400 leading-tight">High Likelihood / High Impact (e.g., Public SSH 22, Anonymous S3/COS)</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-900/40">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block mb-1">Severe Exposure</span>
            <p className="text-2xl font-black text-orange-300 mb-1">{scan.high_count}</p>
            <p className="text-[11px] text-slate-400 leading-tight">High Impact / Medium Likelihood (Wildcard Admin IAM, Missing Audit Target)</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/40">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Hygiene Hardening</span>
            <p className="text-2xl font-black text-amber-300 mb-1">{scan.medium_count}</p>
            <p className="text-[11px] text-slate-400 leading-tight">Medium Impact / Moderate Likelihood (Unrotated API keys, Versioning)</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Informational</span>
            <p className="text-2xl font-black text-blue-300 mb-1">{scan.low_count}</p>
            <p className="text-[11px] text-slate-400 leading-tight">Low Impact / Best Practices (Read data auditing, IP restrictions)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
