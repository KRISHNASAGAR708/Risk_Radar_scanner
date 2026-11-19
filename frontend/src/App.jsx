import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CloudArchitecture from './pages/CloudArchitecture';
import ResourceDiscovery from './pages/ResourceDiscovery';
import Scanner from './pages/Scanner';
import Findings from './pages/Findings';
import ComplianceCenter from './pages/ComplianceCenter';
import RemediationCenter from './pages/RemediationCenter';
import ScanHistory from './pages/ScanHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import { 
  fetchCloudStatus, 
  fetchScans, 
  fetchScan, 
  fetchTopology, 
  startScan 
} from './api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default true for instant demo
  const [user, setUser] = useState({ name: 'Cloud Security Architect' });
  const [activePage, setActivePage] = useState('dashboard');
  const [cloudStatus, setCloudStatus] = useState(null);
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [activeScan, setActiveScan] = useState(null);
  const [topologyData, setTopologyData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Load initial system state
  useEffect(() => {
    loadCloudStatus();
    loadScans();
    loadTopology();
  }, []);

  const loadCloudStatus = async () => {
    try {
      const data = await fetchCloudStatus();
      setCloudStatus(data);
    } catch (e) {
      console.error('Error fetching cloud status:', e);
    }
  };

  const loadScans = async (autoSelectLatest = true) => {
    try {
      const data = await fetchScans();
      setScans(data || []);
      if (data && data.length > 0 && (autoSelectLatest || !selectedScanId)) {
        setSelectedScanId(data[0].id);
        setActiveScan(data[0]);
      }
    } catch (e) {
      console.error('Error fetching scans:', e);
    }
  };

  const loadTopology = async () => {
    try {
      const data = await fetchTopology();
      setTopologyData(data);
    } catch (e) {
      console.error('Error fetching topology:', e);
    }
  };

  const handleSelectScan = async (scanId) => {
    setSelectedScanId(scanId);
    try {
      const data = await fetchScan(scanId);
      setActiveScan(data);
    } catch (e) {
      console.error('Error loading scan:', e);
    }
  };

  const handleQuickScan = async () => {
    setIsScanning(true);
    try {
      const res = await startScan(cloudStatus?.region || 'us-south');
      if (res.success) {
        await loadScans(true);
        await loadTopology();
        setActivePage('dashboard');
      }
    } catch (e) {
      console.error('Quick scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanCompleted = (newScan) => {
    loadScans(true);
    loadTopology();
    setActiveScan(newScan);
    setSelectedScanId(newScan.id);
  };

  if (!isAuthenticated) {
    return <Login onLogin={(u) => { setUser(u); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        cloudStatus={cloudStatus}
        scans={scans}
        selectedScanId={selectedScanId}
        onSelectScan={handleSelectScan}
        onTriggerScan={handleQuickScan}
        isScanning={isScanning}
        onNavigate={setActivePage}
        activePage={activePage}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          findingCount={activeScan?.total_findings || 0}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              scan={activeScan}
              onNavigate={setActivePage}
              onTriggerScan={handleQuickScan}
              isScanning={isScanning}
            />
          )}

          {activePage === 'architecture' && (
            <CloudArchitecture
              scan={activeScan}
              topologyData={topologyData}
            />
          )}

          {activePage === 'discovery' && (
            <ResourceDiscovery scanId={selectedScanId} />
          )}

          {activePage === 'scanner' && (
            <Scanner
              cloudStatus={cloudStatus}
              onScanCompleted={handleScanCompleted}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'findings' && (
            <Findings
              scanId={selectedScanId}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'compliance' && (
            <ComplianceCenter scanId={selectedScanId} />
          )}

          {activePage === 'remediation' && (
            <RemediationCenter scanId={selectedScanId} />
          )}

          {activePage === 'history' && (
            <ScanHistory onSelectScan={handleSelectScan} />
          )}

          {activePage === 'reports' && (
            <Reports scan={activeScan} />
          )}

          {activePage === 'settings' && (
            <Settings
              cloudStatus={cloudStatus}
              onStatusChanged={(newStatus) => {
                setCloudStatus(newStatus);
                loadScans(true);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
