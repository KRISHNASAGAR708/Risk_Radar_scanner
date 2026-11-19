import React from 'react';
import { 
  FileText, 
  Download, 
  FileCheck, 
  ExternalLink, 
  Printer, 
  ShieldCheck, 
  Code,
  CheckCircle2
} from 'lucide-react';
import { getReportPdfUrl, getReportHtmlUrl } from '../api';

export default function Reports({ scan }) {
  if (!scan) {
    return <div className="p-12 text-center text-slate-400">No scan selected for report generation.</div>;
  }

  const pdfUrl = getReportPdfUrl(scan.id);
  const htmlUrl = getReportHtmlUrl(scan.id);

  const downloadJsonExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scan, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `RiskRadar_Audit_Export_${scan.id.slice(0, 8)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.removeChild(dlAnchor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-400" />
            Audit Report Generation & Exports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Download certified Executive PDF audit reports, Technical HTML security dossiers, and JSON compliance datasets.
          </p>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Executive PDF Report */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Executive PDF Audit Report</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Formally formatted PDF document for C-suite and auditors. Includes executive summary, CSPS score, compliance breakdown, and top threat findings.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Executive PDF</span>
            </a>
          </div>
        </div>

        {/* Technical HTML Audit Report */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Technical Audit HTML Dossier</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Comprehensive, self-contained printable HTML audit report featuring full technical details, threat justifications, and raw CLI remediation commands.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Interactive HTML</span>
            </a>
          </div>
        </div>

        {/* Full JSON Audit Dataset */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Machine-Readable JSON</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Raw JSON export containing full scan telemetry, discovered resource configurations, compliance mappings, and rule scoring for SIEM ingestion.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <button
              onClick={downloadJsonExport}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Raw JSON Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Embed */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Interactive Report Preview</h3>
            <p className="text-xs text-slate-400">Live preview of the generated Technical Audit HTML Report.</p>
          </div>
          <a
            href={htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            Open in new window <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-800 h-96 bg-[#0B0F19]">
          <iframe
            src={htmlUrl}
            title="Audit Report Preview"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
