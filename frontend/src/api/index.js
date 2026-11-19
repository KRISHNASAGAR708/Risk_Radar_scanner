const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchCloudStatus() {
  const res = await fetch(`${API_BASE}/cloud/status`);
  return res.json();
}

export async function connectCloud(apiKey, region = 'us-south', mode = null) {
  const res = await fetch(`${API_BASE}/cloud/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, region, mode })
  });
  return res.json();
}

export async function disconnectCloud() {
  const res = await fetch(`${API_BASE}/cloud/disconnect`, {
    method: 'POST'
  });
  return res.json();
}

export async function startScan(region = 'us-south', services = ['COS', 'VPC', 'IAM', 'ACTIVITY_TRACKER']) {
  const res = await fetch(`${API_BASE}/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region, services })
  });
  return res.json();
}

export async function fetchScans() {
  const res = await fetch(`${API_BASE}/scans`);
  return res.json();
}

export async function fetchScan(scanId) {
  const res = await fetch(`${API_BASE}/scans/${scanId}`);
  return res.json();
}

export async function fetchFindings(scanId, { severity, service, search } = {}) {
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  if (service) params.append('service', service);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/scans/${scanId}/findings?${params.toString()}`);
  return res.json();
}

export async function fetchResources(scanId, { service } = {}) {
  const params = new URLSearchParams();
  if (service) params.append('service', service);
  const res = await fetch(`${API_BASE}/scans/${scanId}/resources?${params.toString()}`);
  return res.json();
}

export async function fetchCompliance(scanId) {
  const res = await fetch(`${API_BASE}/scans/${scanId}/compliance`);
  return res.json();
}

export async function fetchTopology() {
  const res = await fetch(`${API_BASE}/topology`);
  return res.json();
}

export async function fetchRules() {
  const res = await fetch(`${API_BASE}/rules`);
  return res.json();
}

export async function compareScans(scanA, scanB) {
  const params = new URLSearchParams();
  if (scanA) params.append('scan_a', scanA);
  if (scanB) params.append('scan_b', scanB);
  const res = await fetch(`${API_BASE}/scans/compare?${params.toString()}`);
  return res.json();
}

export function getReportPdfUrl(scanId) {
  return `${API_BASE}/reports/pdf/${scanId}`;
}

export function getReportHtmlUrl(scanId) {
  return `${API_BASE}/reports/html/${scanId}`;
}
