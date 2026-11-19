import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  FlaskConical, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { connectCloud, disconnectCloud, fetchRules } from '../api';

export default function Settings({ cloudStatus, onStatusChanged }) {
  const [apiKey, setApiKey] = useState('');
  const [region, setRegion] = useState(cloudStatus?.region || 'us-south');
  const [showKey, setShowKey] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    fetchRules().then((r) => setRules(r || []));
  }, []);

  const handleConnectLive = async (e) => {
    e.preventDefault();
    setConnecting(true);
    setMessage(null);

    try {
      const res = await connectCloud(apiKey, region, 'LIVE_IBM_CLOUD');
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Successfully connected to Live IBM Cloud!' });
        if (onStatusChanged) onStatusChanged(res.status);
      } else {
        setMessage({ type: 'error', text: res.message || 'Authentication rejected by IBM Cloud IAM.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setConnecting(false);
    }
  };

  const handleSwitchToLab = async () => {
    setConnecting(true);
    setMessage(null);
    try {
      const res = await connectCloud('', region, 'SIMULATED_CLOUD_LAB');
      setApiKey('');
      setMessage({ type: 'success', text: 'Switched to High-Fidelity IBM Cloud Simulation Lab.' });
      if (onStatusChanged) onStatusChanged(res.status);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-sky-400" />
          Settings & Cloud Credentials Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your IBM Cloud API authentication, active region, scanner operation modes, and rule definitions.
        </p>
      </div>

      {/* Status banner */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs ${
          message.type === 'success'
            ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/30 border border-red-500/40 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-400" />
              IBM Cloud IAM API Key
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Secure OAuth 2.0 Exchange
            </span>
          </div>

          <form onSubmit={handleConnectLive} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                IBM Cloud API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={cloudStatus?.api_key_masked || 'Enter IBM Cloud API key (e.g. 8xK...)'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Generated via IBM Cloud Console &gt; Manage &gt; Access (IAM) &gt; API keys. Stored strictly in runtime memory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Default Target Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
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

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Current Environment Mode
                </label>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cloudStatus?.mode === 'LIVE_IBM_CLOUD' ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                  <span>{cloudStatus?.mode === 'LIVE_IBM_CLOUD' ? 'LIVE IBM CLOUD' : 'SIMULATED CLOUD LAB'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={connecting || !apiKey}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {connecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                <span>Authenticate & Connect Live Cloud</span>
              </button>

              <button
                type="button"
                onClick={handleSwitchToLab}
                disabled={connecting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                <span>Switch to Simulation Lab Mode</span>
              </button>
            </div>
          </form>
        </div>

        {/* Cloud Account Metadata Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tenant Context
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Account ID</span>
                <span className="font-mono text-slate-200">{cloudStatus?.account_id || 'demo-acct-849302-ibm'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Account Title</span>
                <span className="font-semibold text-slate-200">{cloudStatus?.account_name || 'Risk Radar Enterprise Lab'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Authenticated User</span>
                <span className="font-mono text-slate-200">{cloudStatus?.user_email || 'cloud-admin@riskradar.ibm.sec'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-400">
            Supports IBM Cloud Gen 2 VPC, Cloud Object Storage (S3/Config API), IAM v1/v2, and Activity Tracker.
          </div>
        </div>
      </div>

      {/* Rules Registry Explorer */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              Active CSPM Security Rule Definitions ({rules.length} Rules)
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic detection rules loaded in the scanning engine.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">CVSS</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Rule Description</th>
                <th className="py-3 px-4">Compliance Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rules.map((r) => {
                const sevClass = r.severity === 'CRITICAL' ? 'text-red-400' :
                                 r.severity === 'HIGH' ? 'text-orange-400' :
                                 r.severity === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400';
                return (
                  <tr key={r.rule_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{r.rule_id}</td>
                    <td className={`py-3 px-4 font-bold ${sevClass}`}>{r.severity}</td>
                    <td className="py-3 px-4 font-mono">{r.cvss_score}</td>
                    <td className="py-3 px-4 font-semibold">{r.service}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm">{r.title}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      ISO: {(r.compliance_mappings?.iso27017 || []).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
