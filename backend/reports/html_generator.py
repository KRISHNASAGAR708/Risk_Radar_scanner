import json
from pathlib import Path
from datetime import datetime
from config import Config

class HTMLReportGenerator:
    @staticmethod
    def generate(scan_dict: dict, findings: list, compliance_data: dict, output_filename: str = None) -> str:
        if not output_filename:
            ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            output_filename = f"RiskRadar_Technical_Audit_{scan_dict.get('id', 'scan')[:8]}_{ts}.html"

        out_path = Path(Config.REPORTS_DIR) / output_filename

        posture = scan_dict.get("posture_score", 100.0)
        grade = scan_dict.get("risk_grade", "A+")
        iso_score = scan_dict.get("iso_compliance_score", 100.0)
        csa_score = scan_dict.get("csa_compliance_score", 100.0)
        mode = scan_dict.get("mode", "SIMULATED_CLOUD_LAB")
        mode_badge = "LIVE IBM CLOUD" if mode == "LIVE_IBM_CLOUD" else "SIMULATED CLOUD LAB"
        mode_color = "#10B981" if mode == "LIVE_IBM_CLOUD" else "#8B5CF6"

        findings_rows = ""
        for idx, f in enumerate(findings, 1):
            sev = f.get("severity", "MEDIUM")
            sev_class = {
                "CRITICAL": "bg-red-500/10 text-red-400 border-red-500/30",
                "HIGH": "bg-orange-500/10 text-orange-400 border-orange-500/30",
                "MEDIUM": "bg-amber-500/10 text-amber-400 border-amber-500/30",
                "LOW": "bg-blue-500/10 text-blue-400 border-blue-500/30"
            }.get(sev, "bg-slate-500/10 text-slate-400 border-slate-500/30")

            iso_tags = "".join([f'<span class="px-2 py-0.5 rounded text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 mr-1">{c}</span>' for c in f.get("iso27017_controls", [])])
            csa_tags = "".join([f'<span class="px-2 py-0.5 rounded text-xs bg-purple-950 text-purple-300 border border-purple-800 mr-1">{c}</span>' for c in f.get("csa_star_controls", [])])

            findings_rows += f"""
            <div class="p-5 rounded-xl border border-slate-800 bg-slate-900/60 mb-4 hover:border-slate-700 transition">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 text-xs font-bold rounded-md border {sev_class}">{sev}</span>
                        <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{f.get('rule_id')}</span>
                        <span class="text-xs font-semibold text-sky-400 uppercase tracking-wide">{f.get('service')}</span>
                    </div>
                    <span class="text-xs font-mono text-slate-400">CVSS Score: <b class="text-slate-200">{f.get('cvss_score', 5.0)}</b></span>
                </div>
                <h3 class="text-base font-bold text-slate-100 mb-1">{f.get('title')}</h3>
                <p class="text-xs text-slate-400 font-mono mb-3">Resource: <span class="text-slate-300">{f.get('resource_name')}</span> ({f.get('resource_type')})</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-3">
                    <div class="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                        <p class="text-slate-400 font-semibold mb-1">Vulnerability Description:</p>
                        <p class="text-slate-300">{f.get('description')}</p>
                    </div>
                    <div class="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                        <p class="text-amber-400 font-semibold mb-1">Threat Rationale (Why Dangerous):</p>
                        <p class="text-slate-300">{f.get('rationale')}</p>
                    </div>
                </div>
                <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-3">
                    <p class="text-emerald-400 font-semibold text-xs mb-1">Recommended Remediation:</p>
                    <p class="text-slate-300 text-xs mb-2">{f.get('remediation_summary')}</p>
                    {f'<pre class="p-2 rounded bg-slate-900 text-sky-300 text-xs font-mono overflow-x-auto border border-slate-800"><code>{f.get("ibmcloud_cli")}</code></pre>' if f.get("ibmcloud_cli") else ''}
                </div>
                <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                    <span class="text-xs text-slate-400 font-medium">Compliance:</span>
                    <div>{iso_tags}</div>
                    <div>{csa_tags}</div>
                </div>
            </div>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Radar – IBM Cloud CSPM Security Audit</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Plus Jakarta Sans', sans-serif; }}
        code, pre, .font-mono {{ font-family: 'JetBrains Mono', monospace; }}
    </style>
</head>
<body class="bg-[#0B0F19] text-slate-100 min-h-screen py-10 px-4 md:px-12">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 mb-8 gap-4">
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <span class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">RISK RADAR</span>
                    <span class="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider" style="background-color: {mode_color}20; color: {mode_color}; border: 1px solid {mode_color}40;">
                        ● {mode_badge}
                    </span>
                </div>
                <h1 class="text-2xl font-bold text-slate-100">Automated Cloud Misconfiguration & Compliance Audit</h1>
                <p class="text-xs text-slate-400 mt-1">IBM Cloud CSPM | ISO 27017 & CSA STAR Assessment</p>
            </div>
            <div class="text-right text-xs text-slate-400 font-mono">
                <p>Account: <span class="text-slate-200">{scan_dict.get('cloud_account_id', 'ibm-cloud')}</span></p>
                <p>Region: <span class="text-slate-200">{scan_dict.get('region', 'us-south')}</span></p>
                <p>Generated: <span class="text-slate-200">{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</span></p>
            </div>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Posture Score</p>
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold {'text-emerald-400' if posture >= 80 else 'text-red-400'}">{posture}%</span>
                    <span class="text-xs font-bold text-slate-400">Grade {grade}</span>
                </div>
            </div>
            <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Critical Findings</p>
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-red-400">{scan_dict.get('critical_count', 0)}</span>
                    <span class="text-xs text-slate-400">of {scan_dict.get('total_findings', 0)} total</span>
                </div>
            </div>
            <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">ISO 27017</p>
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-cyan-400">{iso_score}%</span>
                    <span class="text-xs text-slate-400">Compliant</span>
                </div>
            </div>
            <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">CSA STAR (CCM)</p>
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-purple-400">{csa_score}%</span>
                    <span class="text-xs text-slate-400">Compliant</span>
                </div>
            </div>
        </div>

        <!-- Findings List -->
        <div class="mb-12">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-slate-100">Vulnerability Findings & Remediation Guidance</h2>
                <span class="text-xs text-slate-400 font-mono">{len(findings)} Findings Total</span>
            </div>
            {findings_rows}
        </div>

        <!-- Footer -->
        <div class="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>Risk Radar CSPM &bull; Cloud Computing & Cloud Security Major Project &bull; IBM Cloud Security Posture Management</p>
        </div>
    </div>
</body>
</html>
"""
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        return str(out_path)
