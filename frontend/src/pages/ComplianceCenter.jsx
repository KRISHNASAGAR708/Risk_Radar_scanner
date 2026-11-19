import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchCompliance } from '../api';

export default function ComplianceCenter({ scanId }) {
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('iso'); // 'iso', 'csa', 'gap'

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetchCompliance(scanId)
      .then((data) => {
        setCompliance(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load compliance data:', err);
        setLoading(false);
      });
  }, [scanId]);

  if (loading || !compliance) {
    return <div className="p-12 text-center text-slate-400">Evaluating compliance matrix...</div>;
  }

  const { iso27017, csa_star, combined_gap_analysis } = compliance;

  const exportGapCsv = () => {
    const headers = ['Framework', 'Control ID', 'Title', 'Domain', 'Violations Count', 'Affected Resources'];
    const rows = combined_gap_analysis.map((g) => [
      `"${g.framework}"`,
      `"${g.control_id}"`,
      `"${g.title}"`,
      `"${g.domain}"`,
      g.violations_count,
      `"${(g.affected_resources || []).join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RiskRadar_Compliance_Gaps_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-cyan-400" />
            Cloud Compliance Mapping Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated verification against ISO/IEC 27017 (Cloud Security Controls) and CSA STAR Cloud Controls Matrix (CCM v4).
          </p>
        </div>
        <button
          onClick={exportGapCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Gap Analysis (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ISO 27017 Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">ISO/IEC 27017:2015</h3>
            </div>
            <p className="text-xs text-slate-400 mb-2">Cloud Security Controls Standard</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-cyan-400">{iso27017.score}%</span>
              <span className="text-xs text-slate-400 font-medium">Compliance Rate</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              <b className="text-emerald-400">{iso27017.passed} Passed</b> &bull; <b className="text-red-400">{iso27017.failed} Non-Compliant</b> ({iso27017.total_controls} Assessed)
            </p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-cyan-400 flex items-center justify-center font-bold text-cyan-300 text-lg">
            {iso27017.score}%
          </div>
        </div>

        {/* CSA STAR Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <h3 className="text-sm font-bold text-slate-200">CSA STAR / CCM v4</h3>
            </div>
            <p className="text-xs text-slate-400 mb-2">Cloud Security Alliance Controls Matrix</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-400">{csa_star.score}%</span>
              <span className="text-xs text-slate-400 font-medium">Compliance Rate</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              <b className="text-emerald-400">{csa_star.passed} Passed</b> &bull; <b className="text-red-400">{csa_star.failed} Non-Compliant</b> ({csa_star.total_controls} Assessed)
            </p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-purple-400 flex items-center justify-center font-bold text-purple-300 text-lg">
            {csa_star.score}%
          </div>
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <b>Academic Rigor Notice:</b> Risk Radar strictly claims compliance verification only for the cloud technical controls that the automated inspection rules specifically evaluate. Controls requiring organizational policies or human interviews are classified as not automated.
        </span>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('iso')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'iso'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ISO/IEC 27017:2015 Controls ({iso27017.total_controls})
        </button>
        <button
          onClick={() => setActiveTab('csa')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'csa'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          CSA STAR CCM v4 ({csa_star.total_controls})
        </button>
        <button
          onClick={() => setActiveTab('gap')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'gap'
              ? 'border-red-400 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Compliance Gap Matrix ({combined_gap_analysis.length} Deficiencies)
        </button>
      </div>

      {/* TAB CONTENT 1: ISO 27017 */}
      {activeTab === 'iso' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Control ID</th>
                <th className="py-3 px-4">Control Domain & Title</th>
                <th className="py-3 px-4">Specification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Violations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {iso27017.controls.map((ctrl) => {
                const isPass = ctrl.status === 'PASS';
                return (
                  <tr key={ctrl.control_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {ctrl.control_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-100">{ctrl.title}</p>
                      <span className="text-[10px] text-slate-400">{ctrl.domain}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-md leading-relaxed">
                      {ctrl.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isPass
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isPass ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isPass ? (
                        <span className="text-slate-500 text-[11px]">Zero violations</span>
                      ) : (
                        <span className="text-red-400 font-mono font-bold">
                          {ctrl.violations_count} violation(s)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT 2: CSA STAR */}
      {activeTab === 'csa' && (
        <div className="space-y-6">
          {/* Domain Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4">
              CSA STAR Control Domain Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(csa_star.domain_summary || {}).map(([domain, data]) => {
                const color = data.score >= 80 ? 'bg-emerald-500' : data.score >= 50 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={domain} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">{domain}</span>
                      <span className="font-mono font-bold text-slate-200">{data.score}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-1.5">
                      <div className={`h-full ${color}`} style={{ width: `${data.score}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {data.passed} passed / {data.total} total
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CSA Controls Table */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Control ID</th>
                  <th className="py-3 px-4">Domain & Control Title</th>
                  <th className="py-3 px-4">Control Requirement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Violations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {csa_star.controls.map((ctrl) => {
                  const isPass = ctrl.status === 'PASS';
                  return (
                    <tr key={ctrl.control_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                        {ctrl.control_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-100">{ctrl.title}</p>
                        <span className="text-[10px] text-slate-400">{ctrl.domain}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-md leading-relaxed">
                        {ctrl.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isPass
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {isPass ? 'Compliant' : 'Non-Compliant'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPass ? (
                          <span className="text-slate-500 text-[11px]">Zero violations</span>
                        ) : (
                          <span className="text-red-400 font-mono font-bold">
                            {ctrl.violations_count} violation(s)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: GAP MATRIX */}
      {activeTab === 'gap' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-400">Compliance Gap Matrix</h3>
              <p className="text-xs text-slate-400">Prioritized checklist of failing controls requiring remediation before external audit.</p>
            </div>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Framework</th>
                <th className="py-3 px-4">Control ID</th>
                <th className="py-3 px-4">Control Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Affected Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {combined_gap_analysis.map((gap, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-sky-400">{gap.framework}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-red-400">{gap.control_id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">{gap.title}</td>
                  <td className="py-3.5 px-4 text-slate-400">{gap.domain}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    {(gap.affected_resources || []).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
