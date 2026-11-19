import React from 'react';
import { Network, ShieldCheck, Layers, Cpu, Server, Database, KeyRound, Activity } from 'lucide-react';
import CloudTopology from '../components/CloudTopology';

export default function CloudArchitecture({ scan, topologyData }) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Network className="w-6 h-6 text-sky-400" />
          IBM Cloud Infrastructure & Pipeline Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Visual representation of the live IBM Cloud resource collector, rule evaluation pipelines, and compliance verification.
        </p>
      </div>

      {/* Main Interactive Cloud Topology Canvas */}
      <CloudTopology topologyData={topologyData} scan={scan} />

      {/* Cloud Security Architecture Concept Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-sky-400">
            <Server className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-200">1. Cloud Resource Collector</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The collection layer authenticates with <b>IBM Cloud IAM</b> using an API Key to obtain an OAuth 2.0 bearer token. It performs parallel discovery across <b>IBM Cloud Object Storage</b>, <b>VPC Gen 2 Security Groups</b>, <b>IAM Policies</b>, and <b>Activity Tracker Event Routes</b>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Cpu className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-200">2. Deterministic Rule Engine</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Discovered configurations are passed to an extensible policy-as-code engine containing <b>19 specialized rules</b>. Each rule evaluates exact resource properties (e.g., <code className="text-sky-300">0.0.0.0/0</code> ingress, wildcard <code className="text-sky-300">serviceType: *</code>, and disabled MFA).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-purple-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-200">3. Compliance Cross-Walk</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Detected findings are mapped to <b>ISO/IEC 27017:2015</b> (Cloud Service Controls) and the <b>Cloud Security Alliance Cloud Controls Matrix (CSA CCM v4)</b>. Compliance scores reflect strictly evaluated controls.
          </p>
        </div>
      </div>
    </div>
  );
}
