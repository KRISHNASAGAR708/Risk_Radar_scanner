import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fetchFindings } from '../api';

export default function RemediationCenter({ scanId }) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetchFindings(scanId, { service: filterService })
      .then((data) => {
        setFindings(data || []);
        if (data && data.length > 0) {
          setExpandedId(data[0].id); // Auto-expand first finding
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching findings for remediation:', err);
        setLoading(false);
      });
  }, [scanId, filterService]);

  const copyCommand = (id, cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadRemediationScript = () => {
    const cliCommands = findings
      .filter((f) => f.ibmcloud_cli)
      .map((f) => `# Rule: ${f.rule_id} - ${f.title}\n# Resource: ${f.resource_name}\n${f.ibmcloud_cli}\n`)
      .join('\n');

    const script = `#!/usr/bin/env bash
# ==============================================================================
# Risk Radar CSPM - Automated Remediation Script
# IBM Cloud Infrastructure Hardening
# Generated: ${new Date().toISOString()}
# WARNING: Verify commands against your production change control policies.
# ==============================================================================

echo "Starting Risk Radar IBM Cloud Security Remediation..."

${cliCommands}

echo "Remediation commands executed. Please re-run Risk Radar scan to verify compliance."
`;

    const blob = new Blob([script], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remediate_risk_radar_${new Date().toISOString().slice(0, 10)}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-emerald-400" />
            Cloud Security Remediation Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Actionable remediation guidance, IBM Cloud CLI commands, and manual console walkthroughs.
          </p>
        </div>
        <button
          onClick={downloadRemediationScript}
          disabled={findings.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Fix Script (.sh)</span>
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">Safe Non-Destructive Remediation Mode</p>
          <p className="text-slate-300 leading-relaxed">
            In compliance with zero-trust cloud security principles, Risk Radar provides authoritative CLI fixes and console guidance without mutating or modifying your cloud infrastructure without explicit administrator authorization.
          </p>
        </div>
      </div>

      {/* Service Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 w-fit">
        {['ALL', 'COS', 'VPC', 'IAM', 'ACTIVITY_TRACKER'].map((svc) => (
          <button
            key={svc}
            onClick={() => setFilterService(svc)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterService === svc
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {svc === 'ACTIVITY_TRACKER' ? 'Activity Tracker' : svc}
          </button>
        ))}
      </div>

      {/* Remediation Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading remediation items...</div>
        ) : findings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-slate-200">No remediation items pending.</p>
          </div>
        ) : (
          findings.map((f) => {
            const isExpanded = expandedId === f.id;
            const sevColor = f.severity === 'CRITICAL' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                             f.severity === 'HIGH' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                             'text-amber-400 border-amber-500/30 bg-amber-500/10';

            return (
              <div
                key={f.id}
                className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden transition"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : f.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${sevColor}`}>
                      {f.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {f.rule_id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{f.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 hidden md:inline">
                      {f.resource_name}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details & Actions */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/40 space-y-4 text-xs">
                    {/* Why Dangerous Warning */}
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40">
                      <span className="font-bold text-amber-300 block mb-1">
                        Security Threat Justification:
                      </span>
                      <p className="text-amber-200/90 leading-relaxed">{f.rationale}</p>
                    </div>

                    {/* Affected Resource & Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Affected Cloud Resource
                        </span>
                        <p className="font-mono text-slate-200">{f.resource_name}</p>
                        <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{f.resource_id}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Compliance Violations
                        </span>
                        <p className="font-mono text-sky-400">
                          ISO: {(f.iso27017_controls || []).join(', ')} &bull; CSA: {(f.csa_star_controls || []).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Solution */}
                    <div>
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Recommended Remediation Strategy:
                      </h4>
                      <p className="text-slate-300 leading-relaxed">{f.remediation_summary}</p>
                    </div>

                    {/* IBM Cloud CLI snippet with copy */}
                    {f.ibmcloud_cli && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5" />
                            IBM Cloud CLI Command
                          </span>
                          <button
                            onClick={() => copyCommand(f.id, f.ibmcloud_cli)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            {copiedId === f.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === f.id ? 'Copied!' : 'Copy CLI'}</span>
                          </button>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-sky-300 text-[11px] overflow-x-auto border border-slate-800">
                          <code>{f.ibmcloud_cli}</code>
                        </pre>
                      </div>
                    )}

                    {/* Console Walkthrough */}
                    {f.console_steps && (
                      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                        <span className="text-[11px] font-bold text-slate-300 block mb-1">
                          Manual IBM Cloud Web Console Walkthrough:
                        </span>
                        <pre className="whitespace-pre-wrap font-sans text-slate-400 leading-relaxed">
                          {f.console_steps}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
