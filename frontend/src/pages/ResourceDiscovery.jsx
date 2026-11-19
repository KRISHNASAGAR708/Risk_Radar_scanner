import React, { useState, useEffect } from 'react';
import { Boxes, Search, Database, Network, Users, Activity, Eye, X, Copy, Check } from 'lucide-react';
import { fetchResources } from '../api';

export default function ResourceDiscovery({ scanId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [inspectResource, setInspectResource] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetchResources(scanId, { service: serviceFilter })
      .then((data) => {
        setResources(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch resources:', err);
        setLoading(false);
      });
  }, [scanId, serviceFilter]);

  const filtered = resources.filter((r) => {
    if (!search) return true;
    return (
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.resource_id.toLowerCase().includes(search.toLowerCase()) ||
      r.resource_type.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getServiceIcon = (svc) => {
    switch (svc) {
      case 'COS': return <Database className="w-4 h-4 text-cyan-400" />;
      case 'VPC': return <Network className="w-4 h-4 text-indigo-400" />;
      case 'IAM': return <Users className="w-4 h-4 text-purple-400" />;
      case 'ACTIVITY_TRACKER': return <Activity className="w-4 h-4 text-amber-400" />;
      default: return <Boxes className="w-4 h-4 text-slate-400" />;
    }
  };

  const copyConfig = () => {
    if (!inspectResource) return;
    navigator.clipboard.writeText(JSON.stringify(inspectResource.raw_config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-sky-400" />
            Cloud Resource Discovery & Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inventory of IBM Cloud Object Storage buckets, VPC firewalls, IAM roles, and Activity Tracker routes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Total Discovered: <b className="text-slate-100">{resources.length}</b>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Service Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['ALL', 'COS', 'VPC', 'IAM', 'ACTIVITY_TRACKER'].map((svc) => (
            <button
              key={svc}
              onClick={() => setServiceFilter(svc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                serviceFilter === svc
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {svc === 'ACTIVITY_TRACKER' ? 'Activity Tracker' : svc}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search resource name, ID, or CRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Resource Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Resource Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Resource CRN / ID</th>
                <th className="py-3 px-4 text-right">Raw Config</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading cloud inventory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No resources matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold flex items-center gap-2">
                      {getServiceIcon(res.service)}
                      <span>{res.service}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {res.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60">
                        {res.resource_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {res.region}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate" title={res.resource_id}>
                      {res.resource_id}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectResource(res)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Inspector Modal */}
      {inspectResource && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                {getServiceIcon(inspectResource.service)}
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{inspectResource.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {inspectResource.service} &bull; {inspectResource.resource_type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyConfig}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setInspectResource(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Code Preview */}
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-sky-300">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(inspectResource.raw_config, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
