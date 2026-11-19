import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Filter, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  ChevronRight,
  Database,
  Network,
  Users,
  Activity
} from 'lucide-react';
import { fetchFindings } from '../api';

export default function Findings({ scanId, onNavigate }) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [copiedCli, setCopiedCli] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetchFindings(scanId, {
      severity: severityFilter,
      service: serviceFilter,
      search: search
    })
      .then((data) => {
        setFindings(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching findings:', err);
        setLoading(false);
      });
  }, [scanId, severityFilter, serviceFilter, search]);

  const copyCliCommand = () => {
    if (!selectedFinding?.ibmcloud_cli) return;
    navigator.clipboard.writeText(selectedFinding.ibmcloud_cli);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const getSeverityBadge = (sev) => {
    const config = {
      CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
      MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${config[sev] || config.MEDIUM}`}>
        {sev}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-400" />
            Cloud Vulnerability Findings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detected misconfigurations, compliance control failures, and risk exposures across IBM Cloud resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Total Findings: <b className="text-slate-100">{findings.length}</b>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                severityFilter === s
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Service Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {['ALL', 'COS', 'VPC', 'IAM', 'ACTIVITY_TRACKER'].map((svc) => (
            <button
              key={svc}
              onClick={() => setServiceFilter(svc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                serviceFilter === svc
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40'
              }`}
            >
              {svc === 'ACTIVITY_TRACKER' ? 'Tracker' : svc}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, rule, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Findings Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading security findings...</div>
        ) : findings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-200">No vulnerabilities found matching criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Check filter settings or launch a fresh scan.</p>
          </div>
        ) : (
          findings.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFinding(f)}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(f.severity)}
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {f.rule_id}
                  </span>
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wide">
                    {f.service}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    CVSS: <b className="text-slate-200">{f.cvss_score}</b>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Affected Resource: <span className="text-slate-300 font-semibold">{f.resource_name}</span> ({f.resource_type})
                </p>
                {/* Compliance tags preview */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {f.iso27017_controls?.map((c) => (
                    <span key={c} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                      ISO: {c}
                    </span>
                  ))}
                  {f.csa_star_controls?.map((c) => (
                    <span key={c} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/80">
                      CSA: {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition flex items-center gap-1">
                  Deep Dive & Fix <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Deep-Dive Modal Drawer */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedFinding.severity)}
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {selectedFinding.rule_id}
                  </span>
                  <span className="text-xs font-semibold text-sky-400 uppercase">
                    {selectedFinding.service}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100">{selectedFinding.title}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Resource: <span className="text-slate-200">{selectedFinding.resource_name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Technical Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Vulnerability Description
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedFinding.description}
                </div>
              </div>

              {/* Threat Rationale */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Threat Rationale (Why is this dangerous?)
                </h4>
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200 leading-relaxed">
                  {selectedFinding.rationale}
                </div>
              </div>

              {/* Compliance Controls Mapped */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Regulatory Compliance Control Failures
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">
                      ISO/IEC 27017:2015
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFinding.iso27017_controls?.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[11px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">
                      CSA STAR / CCM v4
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFinding.csa_star_controls?.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono text-[11px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remediation Summary & IBM Cloud CLI */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Actionable Remediation Guidance
                  </h4>
                  {selectedFinding.ibmcloud_cli && (
                    <button
                      onClick={copyCliCommand}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCli ? 'Copied Command!' : 'Copy CLI Command'}</span>
                    </button>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {selectedFinding.remediation_summary}
                </p>

                {selectedFinding.ibmcloud_cli && (
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-sky-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                    <code>{selectedFinding.ibmcloud_cli}</code>
                  </pre>
                )}

                {selectedFinding.console_steps && (
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Manual IBM Cloud Console Steps:
                    </span>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300">
                      {selectedFinding.console_steps}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
