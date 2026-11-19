import React, { useState, useEffect } from 'react';
import { 
  History, 
  GitCompare, 
  ArrowUp, 
  ArrowDown, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { fetchScans, compareScans } from '../api';

export default function ScanHistory({ onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [scanAId, setScanAId] = useState('');
  const [scanBId, setScanBId] = useState('');

  useEffect(() => {
    fetchScans()
      .then((data) => {
        setScans(data || []);
        if (data && data.length >= 2) {
          setScanAId(data[1].id); // Older
          setScanBId(data[0].id); // Newer
          handleCompare(data[1].id, data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching scan history:', err);
        setLoading(false);
      });
  }, []);

  const handleCompare = (a, b) => {
    if (!a || !b) return;
    setComparing(true);
    compareScans(a, b)
      .then((res) => {
        setComparison(res);
        setComparing(false);
      })
      .catch((err) => {
        console.error('Comparison error:', err);
        setComparing(false);
      });
  };

  const trendData = [...scans].reverse().map((s) => ({
    time: new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: s.posture_score,
    critical: s.critical_count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-sky-400" />
          Audit Scan History & Posture Drift Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical timeline of IBM Cloud security audits, posture trends over time, and differential drift analysis.
        </p>
      </div>

      {/* Posture Trend Graph */}
      {scans.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Security Posture Score Trend</h3>
              <p className="text-xs text-slate-400">Progression of Cloud Security Posture Score (CSPS) over historical scans.</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
              {scans.length} Recorded Audits
            </span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#38BDF8" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side-by-Side Diff Engine */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-400" />
              Before-and-After Differential Drift Engine
            </h3>
            <p className="text-xs text-slate-400">
              Select any two scans to analyze posture drift, newly introduced regressions, and resolved vulnerabilities.
            </p>
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={scanAId}
              onChange={(e) => {
                setScanAId(e.target.value);
                handleCompare(e.target.value, scanBId);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 py-1.5 px-3 focus:outline-none focus:border-sky-500"
            >
              {scans.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  Scan A: {new Date(s.started_at).toLocaleDateString()} {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.posture_score}%)
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-500 font-bold">&rarr;</span>

            <select
              value={scanBId}
              onChange={(e) => {
                setScanBId(e.target.value);
                handleCompare(scanAId, e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 py-1.5 px-3 focus:outline-none focus:border-sky-500"
            >
              {scans.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  Scan B: {new Date(s.started_at).toLocaleDateString()} {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.posture_score}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Output */}
        {comparison && (
          <div className="space-y-4">
            {/* Posture Delta KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Posture Score Delta (Δ)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${
                    comparison.posture_delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {comparison.posture_delta >= 0 ? `+${comparison.posture_delta}%` : `${comparison.posture_delta}%`}
                  </span>
                  <span className="text-xs text-slate-400">
                    from {comparison.scan_a.posture_score}% to {comparison.scan_b.posture_score}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                  New Security Regressions
                </span>
                <span className="text-2xl font-black text-red-300">
                  {comparison.new_count}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Misconfigurations introduced</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Resolved Vulnerabilities
                </span>
                <span className="text-2xl font-black text-emerald-300">
                  {comparison.resolved_count}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Misconfigurations remediated</p>
              </div>
            </div>

            {/* Regression breakdown list if any */}
            {comparison.new_violations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Newly Introduced Drift Findings:
                </h4>
                <div className="space-y-1.5">
                  {comparison.new_violations.map((v, i) => (
                    <div key={i} className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-red-300">{v.title}</span>
                        <span className="text-slate-400 ml-2">Resource: {v.resource_name}</span>
                      </div>
                      <span className="font-mono text-red-400 font-bold">{v.rule_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Audit List */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase text-slate-400">
          Audit Records Log
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Audit Timestamp</th>
              <th className="py-3 px-4">Mode</th>
              <th className="py-3 px-4">Region</th>
              <th className="py-3 px-4">Resources</th>
              <th className="py-3 px-4">Findings (Crit/High/Med)</th>
              <th className="py-3 px-4">Posture</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {scans.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono">
                  {new Date(s.started_at).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-semibold">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${
                    s.mode === 'LIVE_IBM_CLOUD' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                  }`}>
                    {s.mode === 'LIVE_IBM_CLOUD' ? 'LIVE CLOUD' : 'SIMULATED LAB'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{s.region}</td>
                <td className="py-3.5 px-4 font-mono">{s.total_resources}</td>
                <td className="py-3.5 px-4 font-mono">
                  <span className="text-red-400 font-bold">{s.critical_count}</span> / <span className="text-orange-400">{s.high_count}</span> / <span className="text-amber-400">{s.medium_count}</span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-100">
                  {s.posture_score}% ({s.risk_grade})
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onSelectScan(s.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs"
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
