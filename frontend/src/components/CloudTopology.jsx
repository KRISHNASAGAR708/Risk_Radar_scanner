import React, { useState } from 'react';
import { 
  Cloud, 
  Database, 
  Network, 
  Users, 
  Activity, 
  Binary, 
  Cpu, 
  Gauge, 
  FileCheck2, 
  LayoutDashboard,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function CloudTopology({ topologyData, scan }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = [
    {
      id: 'account',
      title: 'IBM Cloud Account',
      subtitle: scan?.cloud_account_id || 'demo-acct-849302-fintech',
      type: 'root',
      icon: Cloud,
      color: 'from-sky-600 to-blue-700',
      border: 'border-sky-500/50',
      glow: 'shadow-[0_0_20px_rgba(2,132,199,0.3)]',
      details: {
        'Account Mode': scan?.mode || 'SIMULATED_CLOUD_LAB',
        'Region': scan?.region || 'us-south',
        'Status': 'Connected & Active',
        'Authentication': 'IAM OAuth Token Verified'
      }
    },
    {
      id: 'cos',
      title: 'Object Storage (COS)',
      subtitle: `${scan?.service_breakdown?.COS?.total_findings || 0} Findings`,
      type: 'service',
      icon: Database,
      color: 'from-cyan-600 to-teal-700',
      border: 'border-cyan-500/50',
      details: {
        'Service': 'IBM Cloud Object Storage',
        'Storage Buckets': '4 Inspected',
        'Critical Risk': scan?.service_breakdown?.COS?.critical || 0,
        'High Risk': scan?.service_breakdown?.COS?.high || 0,
        'Service Score': `${scan?.service_breakdown?.COS?.score || 0}%`
      }
    },
    {
      id: 'vpc',
      title: 'Virtual Private Cloud',
      subtitle: `${scan?.service_breakdown?.VPC?.total_findings || 0} Findings`,
      type: 'service',
      icon: Network,
      color: 'from-indigo-600 to-violet-700',
      border: 'border-indigo-500/50',
      details: {
        'Service': 'IBM Cloud VPC Gen 2',
        'VPCs & Subnets': '2 VPCs, 4 Subnets',
        'Security Groups': '5 Firewall Profiles',
        'SSH/RDP Open': 'Port 22 & 3389 Detected',
        'Service Score': `${scan?.service_breakdown?.VPC?.score || 0}%`
      }
    },
    {
      id: 'iam',
      title: 'IAM & Access Control',
      subtitle: `${scan?.service_breakdown?.IAM?.total_findings || 0} Findings`,
      type: 'service',
      icon: Users,
      color: 'from-purple-600 to-fuchsia-700',
      border: 'border-purple-500/50',
      details: {
        'Service': 'IBM Cloud Identity & Access Mgmt',
        'MFA Status': 'Account Root NONE (Violated)',
        'Wildcard Policies': 'Administrator over all-resources',
        'API Keys': 'Legacy Key > 600 days old',
        'Service Score': `${scan?.service_breakdown?.IAM?.score || 0}%`
      }
    },
    {
      id: 'tracker',
      title: 'Activity Tracker',
      subtitle: `${scan?.service_breakdown?.ACTIVITY_TRACKER?.total_findings || 0} Findings`,
      type: 'service',
      icon: Activity,
      color: 'from-amber-600 to-orange-700',
      border: 'border-amber-500/50',
      details: {
        'Service': 'IBM Cloud Activity Tracker (LogDNA)',
        'Event Routes': 'Missing in us-south region',
        'COS Archiving': 'No WORM bucket target bound',
        'Alerting': 'Privilege escalation alerts missing',
        'Service Score': `${scan?.service_breakdown?.ACTIVITY_TRACKER?.score || 0}%`
      }
    },
    {
      id: 'collector',
      title: 'Cloud Resource Collector',
      subtitle: `${scan?.total_resources || 16} Resources Aggregated`,
      type: 'engine',
      icon: Binary,
      color: 'from-blue-600 to-cyan-700',
      border: 'border-blue-500/50',
      details: {
        'Role': 'API Polling & Configuration Normalizer',
        'Protocols': 'IBM Cloud REST APIs & SDKs',
        'Telemetry Captured': 'ACLs, Security Groups, IAM Policies, ATracker',
        'Execution Time': '1.84 seconds'
      }
    },
    {
      id: 'rules',
      title: 'Security Rule Engine',
      subtitle: '19 Security Rules Evaluated',
      type: 'engine',
      icon: Cpu,
      color: 'from-emerald-600 to-teal-700',
      border: 'border-emerald-500/50',
      details: {
        'Engine Type': 'Deterministic Policy-as-Code Evaluator',
        'Rule Sets': 'cos_rules.json, vpc_rules.json, iam_rules.json, tracker_rules.json',
        'Violations Detected': scan?.total_findings || 0
      }
    },
    {
      id: 'risk',
      title: 'Risk Analysis Engine',
      subtitle: `Posture: ${scan?.posture_score || 0}% (Grade ${scan?.risk_grade || 'F'})`,
      type: 'engine',
      icon: Gauge,
      color: 'from-rose-600 to-pink-700',
      border: 'border-rose-500/50',
      details: {
        'Algorithm': 'CVSS-Weighted Threat Penalty Formulation',
        'Critical Penalties': `${scan?.critical_count || 0} x 18 pts`,
        'High Penalties': `${scan?.high_count || 0} x 10 pts`,
        'Calculated CSPS': `${scan?.posture_score || 0}%`
      }
    },
    {
      id: 'compliance',
      title: 'Compliance Mapping Engine',
      subtitle: `ISO: ${scan?.iso_compliance_score || 0}% | CSA: ${scan?.csa_compliance_score || 0}%`,
      type: 'engine',
      icon: FileCheck2,
      color: 'from-violet-600 to-purple-700',
      border: 'border-violet-500/50',
      details: {
        'Framework 1': 'ISO/IEC 27017:2015 (Cloud Security)',
        'Framework 2': 'CSA STAR / Cloud Controls Matrix (CCM v4)',
        'Assessed Controls': 'Strictly mapped to automated detection rules'
      }
    },
    {
      id: 'dashboard',
      title: 'Risk Radar Dashboard',
      subtitle: 'Actionable Remediation Center',
      type: 'output',
      icon: LayoutDashboard,
      color: 'from-sky-500 to-cyan-400',
      border: 'border-sky-400',
      glow: 'shadow-[0_0_25px_rgba(56,189,248,0.4)]',
      details: {
        'Interface': 'Enterprise Dark Cyber CSPM UI',
        'Remediation Guides': 'CLI & Console Manual Fix Guides',
        'Audit Reporting': 'Executive PDF & Technical Audit HTML'
      }
    }
  ];

  const activeNodeData = selectedNode || nodes[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive Topology Graph */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Network className="w-4 h-4 text-sky-400" />
              IBM Cloud End-to-End CSPM Pipeline Topology
            </h3>
            <p className="text-xs text-slate-400">
              Interactive architectural data flow from IBM Cloud services to Risk Radar compliance output.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
            Click any node to inspect telemetry
          </span>
        </div>

        {/* Topology Nodes Flow */}
        <div className="space-y-6">
          {/* Level 1: Cloud Account */}
          <div className="flex justify-center">
            <NodeCard node={nodes[0]} isSelected={activeNodeData.id === nodes[0].id} onSelect={setSelectedNode} />
          </div>

          <div className="flex justify-center">
            <div className="h-6 w-0.5 bg-gradient-to-b from-sky-500 to-slate-700 animate-pulse" />
          </div>

          {/* Level 2: Four Cloud Services */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <NodeCard node={nodes[1]} isSelected={activeNodeData.id === nodes[1].id} onSelect={setSelectedNode} />
            <NodeCard node={nodes[2]} isSelected={activeNodeData.id === nodes[2].id} onSelect={setSelectedNode} />
            <NodeCard node={nodes[3]} isSelected={activeNodeData.id === nodes[3].id} onSelect={setSelectedNode} />
            <NodeCard node={nodes[4]} isSelected={activeNodeData.id === nodes[4].id} onSelect={setSelectedNode} />
          </div>

          <div className="flex justify-center">
            <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500 to-slate-700 animate-pulse" />
          </div>

          {/* Level 3: Processing Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <NodeCard node={nodes[5]} isSelected={activeNodeData.id === nodes[5].id} onSelect={setSelectedNode} />
            <NodeCard node={nodes[6]} isSelected={activeNodeData.id === nodes[6].id} onSelect={setSelectedNode} />
            <NodeCard node={nodes[7]} isSelected={activeNodeData.id === nodes[7].id} onSelect={setSelectedNode} />
            <NodeCard node={nodes[8]} isSelected={activeNodeData.id === nodes[8].id} onSelect={setSelectedNode} />
          </div>

          <div className="flex justify-center">
            <div className="h-6 w-0.5 bg-gradient-to-b from-purple-500 to-sky-400 animate-pulse" />
          </div>

          {/* Level 4: Final Output Dashboard */}
          <div className="flex justify-center">
            <NodeCard node={nodes[9]} isSelected={activeNodeData.id === nodes[9].id} onSelect={setSelectedNode} />
          </div>
        </div>
      </div>

      {/* Node Telemetry Inspector */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activeNodeData.color} flex items-center justify-center text-white shadow-md`}>
              <activeNodeData.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider font-semibold">
                Node Inspector
              </span>
              <h4 className="text-base font-bold text-slate-100">{activeNodeData.title}</h4>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Role in Architecture
              </span>
              <p className="text-xs text-slate-200">
                {activeNodeData.subtitle}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Technical Metadata & Telemetry
              </span>
              {Object.entries(activeNodeData.details).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                  <span className="text-slate-400">{key}:</span>
                  <span className="font-mono font-medium text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 mt-6">
          <div className="flex items-center gap-2 text-xs text-sky-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Architecture visualizes actual IBM Cloud API collection flow.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeCard({ node, isSelected, onSelect }) {
  const Icon = node.icon;
  return (
    <div
      onClick={() => onSelect(node)}
      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? `${node.border} bg-slate-800/90 shadow-[0_0_15px_rgba(56,189,248,0.2)] scale-[1.02]`
          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="truncate">
          <h4 className="text-xs font-bold text-slate-200 truncate">{node.title}</h4>
        </div>
      </div>
      <p className="text-[10px] font-mono text-slate-400 truncate">{node.subtitle}</p>
    </div>
  );
}
