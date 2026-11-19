import React, { useState } from 'react';
import { 
  Radar, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Server, 
  Database, 
  Network, 
  Users, 
  Activity, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { startScan } from '../api';

export default function Scanner({ cloudStatus, onScanCompleted, onNavigate }) {
  const [region, setRegion] = useState(cloudStatus?.region || 'us-south');
  const [selectedServices, setSelectedServices] = useState(['COS', 'VPC', 'IAM', 'ACTIVITY_TRACKER']);
  const [profile, setProfile] = useState('full');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [scanResult, setScanResult] = useState(null);

  const toggleService = (svc) => {
    if (selectedServices.includes(svc)) {
      if (selectedServices.length === 1) return; // Keep at least one
      setSelectedServices(selectedServices.filter((s) => s !== svc));
    } else {
      setSelectedServices([...selectedServices, svc]);
    }
  };

  const handleLaunchScan = async () => {
    setIsScanning(true);
    setLogs([]);
    setScanResult(null);

    const addLog = (msg) => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog(`Initiating Risk Radar CSPM Scan against IBM Cloud (${region})...`);
    addLog(`Target Services: ${selectedServices.join(', ')}`);
    addLog(`Mode: ${cloudStatus?.mode === 'LIVE_IBM_CLOUD' ? 'LIVE IBM CLOUD INFRASTRUCTURE' : 'SIMULATED CLOUD LAB'}`);

    try {
      addLog('Step 1/5: Authenticating with IBM Cloud IAM token exchange...');
      await new Promise((r) => setTimeout(r, 400));
      
      addLog('Step 2/5: Polling IBM Cloud Resource Controller & service endpoints...');
      await new Promise((r) => setTimeout(r, 600));

      const res = await startScan(region, selectedServices);

      if (res.success) {
        addLog(`Step 3/5: Discovered ${res.scan.total_resources} cloud resources across selected services.`);
        addLog(`Step 4/5: Evaluated 19 cloud security rules & calculated CVSS risk scores.`);
        addLog(`Step 5/5: Mapped ${res.scan.total_findings} findings to ISO 27017 & CSA STAR controls.`);
        addLog(`SUCCESS: Scan completed. Posture Score: ${res.scan.posture_score}% (Grade ${res.scan.risk_grade})`);
        setScanResult(res.scan);
        if (onScanCompleted) {
          onScanCompleted(res.scan);
        }
      } else {
        addLog(`ERROR: Scan failed - ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      addLog(`FATAL: Execution exception - ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Radar className="w-6 h-6 text-sky-400" />
          Cloud Security Scanner Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Execute automated configuration scans against IBM Cloud Object Storage, VPC, IAM, and Activity Tracker.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Configuration Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Scan Parameters
          </h3>

          {/* Region Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Target IBM Cloud Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={isScanning}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="us-south">us-south (Dallas)</option>
              <option value="us-east">us-east (Washington DC)</option>
              <option value="eu-de">eu-de (Frankfurt)</option>
              <option value="eu-gb">eu-gb (London)</option>
              <option value="jp-tok">jp-tok (Tokyo)</option>
              <option value="au-syd">au-syd (Sydney)</option>
            </select>
          </div>

          {/* Target Services Checklist */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              Select Cloud Services to Audit
            </label>
            <div className="space-y-2">
              {[
                { id: 'COS', label: 'IBM Cloud Object Storage', icon: Database, color: 'text-cyan-400' },
                { id: 'VPC', label: 'IBM Cloud VPC & Security Groups', icon: Network, color: 'text-indigo-400' },
                { id: 'IAM', label: 'IBM Cloud IAM & Policies', icon: Users, color: 'text-purple-400' },
                { id: 'ACTIVITY_TRACKER', label: 'Activity Tracker Audit Routing', icon: Activity, color: 'text-amber-400' },
              ].map((svc) => {
                const Icon = svc.icon;
                const isChecked = selectedServices.includes(svc.id);
                return (
                  <div
                    key={svc.id}
                    onClick={() => !isScanning && toggleService(svc.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? 'bg-slate-800/80 border-sky-500/40 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${svc.color}`} />
                      <span className="text-xs font-medium">{svc.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scan Profiles */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Compliance Scan Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProfile('full')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  profile === 'full'
                    ? 'bg-sky-600/20 text-sky-400 border-sky-500/50'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}
              >
                Full Comprehensive
              </button>
              <button
                type="button"
                onClick={() => setProfile('strict')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  profile === 'strict'
                    ? 'bg-sky-600/20 text-sky-400 border-sky-500/50'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}
              >
                Strict High-Risk
              </button>
            </div>
          </div>

          {/* Launch Trigger */}
          <button
            onClick={handleLaunchScan}
            disabled={isScanning}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition ${
              isScanning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(2,132,199,0.35)]'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Running CSPM Engine...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Automated Cloud Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Live Terminal Execution Console */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Scanner Output Stream
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400">Daemon Ready</span>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-sky-300 min-h-[340px] max-h-[380px] overflow-y-auto border border-slate-800/80 space-y-1">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-72 text-slate-600">
                  <Radar className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
                  <p>Ready to audit. Configure parameters on the left and click "Run Automated Cloud Scan".</p>
                </div>
              ) : (
                logs.map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line.includes('SUCCESS') ? (
                      <span className="text-emerald-400 font-bold">{line}</span>
                    ) : line.includes('ERROR') || line.includes('FATAL') ? (
                      <span className="text-red-400 font-bold">{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completion Banner */}
          {scanResult && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-sky-950/40 to-slate-900/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Cloud Audit Completed Successfully!
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Posture Score: <b>{scanResult.posture_score}%</b> &bull; Found <b>{scanResult.total_findings}</b> misconfigurations.
                </p>
              </div>
              <button
                onClick={() => onNavigate('findings')}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1 shadow transition"
              >
                <span>Inspect Findings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
