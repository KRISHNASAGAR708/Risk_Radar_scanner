import React, { useState } from 'react';
import { Shield, Lock, User, Cloud, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('cloud-admin@enterprise.ibm');
  const [password, setPassword] = useState('••••••••••••');
  const [apiKey, setApiKey] = useState('');
  const [useApiKey, setUseApiKey] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      username: useApiKey ? 'IBM Cloud IAM Principal' : username,
      apiKey: apiKey
    });
  };

  const handleQuickDemo = () => {
    onLogin({
      username: 'Demo Cloud Security Evaluator',
      apiKey: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(2,132,199,0.4)] mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-slate-100">
            RISK RADAR
          </h1>
          <p className="text-xs text-sky-400 font-semibold tracking-widest uppercase mt-0.5">
            IBM Cloud CSPM & Compliance Scanner
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Automated misconfiguration detection mapped to ISO 27017 & CSA STAR
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!useApiKey ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cloud Security Principal / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                IBM Cloud IAM API Key
              </label>
              <div className="relative">
                <Cloud className="w-4 h-4 text-sky-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Enter IBM Cloud IAM Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setUseApiKey(!useApiKey)}
              className="text-sky-400 hover:text-sky-300 font-semibold"
            >
              {useApiKey ? 'Use Standard Login' : 'Direct Cloud API Key Login'}
            </button>
            <span className="text-[11px] text-slate-500">MFA Protected</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo Evaluator Access */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Launch Instant Academic Evaluation Lab</span>
          </button>
          <p className="text-[11px] text-slate-500 mt-2">
            No IBM Cloud credentials required for immediate offline assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
