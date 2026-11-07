import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Filter,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Info,
  Building2,
  Droplets,
  Trees,
  Zap,
  Hammer,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { IncidentCategory, SeverityLevel, IncidentStatus } from '../types';
import { NavPage } from '../components/layout/Navbar';
import { HazardLocationSearch } from '../components/common/HazardLocationSearch';
import { MapPin, X, PlusCircle } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    incidents,
    alerts,
    selectedLocation,
    setSelectedLocation,
    availableLocations,
    searchQuery,
    clearSearch,
    searchedLocationProfile,
    filterIncidents,
  } = useIncidents();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter incidents using universal multi-field & location search
  const filteredIncidents = filterIncidents(categoryFilter, false).filter((inc) => {
    if (severityFilter !== 'All' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
    return true;
  });

  // Category counts
  const categoryCounts: Record<string, number> = {
    'Flooding & Waterlogging': 0,
    'Blocked Road & Tree Fall': 0,
    'Power Line & Utility Hazard': 0,
    'Public Infrastructure Damage': 0,
    'Drainage Obstruction': 0,
    'Landslide & Erosion': 0,
  };

  incidents.forEach((inc) => {
    if (categoryCounts[inc.category] !== undefined) {
      categoryCounts[inc.category]++;
    }
  });

  const severityCounts = {
    Severe: incidents.filter((i) => i.severity === 'Severe').length,
    High: incidents.filter((i) => i.severity === 'High').length,
    Moderate: incidents.filter((i) => i.severity === 'Moderate').length,
    Low: incidents.filter((i) => i.severity === 'Low').length,
  };

  const statusCounts = {
    Verified: incidents.filter((i) => i.status === 'Verified').length,
    Dispatched: incidents.filter((i) => i.status === 'Field Team Dispatched').length,
    Pending: incidents.filter((i) => i.status === 'Pending Verification').length,
    Resolved: incidents.filter((i) => i.status === 'Resolved').length,
  };

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            <span>COMMUNITY RISK INTELLIGENCE & TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Hazard Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live synthesis of public safety reports, multi-agency alerts, and community verification status.
          </p>
        </div>

        {/* Universal Location Search & Metadata Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <HazardLocationSearch variant="toolbar" placeholder="Filter by any location or hazard..." />
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 tabular-nums">
            LAST SYNC: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Searched Location Context Strip */}
      {(selectedLocation !== 'All Locations' || searchQuery) && (
        <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-950/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Zone: {searchedLocationProfile.name}</span>
            </div>
            <span className="text-slate-600">·</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                searchedLocationProfile.riskLevel === 'Severe'
                  ? 'bg-red-500/20 text-red-300'
                  : searchedLocationProfile.riskLevel === 'High'
                  ? 'bg-orange-500/20 text-orange-300'
                  : searchedLocationProfile.riskLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              Risk Assessment: {searchedLocationProfile.riskLevel}
            </span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="text-slate-300 hidden md:inline">
              {searchedLocationProfile.weatherSummary}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-teal-300 hover:text-white font-medium underline underline-offset-2 cursor-pointer"
            >
              View on Risk Map
            </button>
            <button
              onClick={clearSearch}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-white bg-slate-800 rounded text-xs cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset Zone</span>
            </button>
          </div>
        </div>
      )}

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Total Tracked Hazards</div>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">
            {incidents.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>{filteredIncidents.length} match active view filters</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Critical & Severe</div>
          <div className="text-3xl font-extrabold text-orange-400 mt-1 font-mono tabular-nums">
            {severityCounts.Severe + severityCounts.High}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Severe: {severityCounts.Severe} · High: {severityCounts.High}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Active Response Units</div>
          <div className="text-3xl font-extrabold text-teal-400 mt-1 font-mono tabular-nums">
            {statusCounts.Dispatched}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Field teams deployed on-site</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Verified by Sentinels</div>
          <div className="text-3xl font-extrabold text-slate-200 mt-1 font-mono tabular-nums">
            {statusCounts.Verified}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Community authenticated</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Severity Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Bars */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Incident Breakdown by Category
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {incidents.length} incidents logged
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (incidents.length || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-400 transition-all duration-500"
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution & Data Source Provenance */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Hazard Severity Hierarchy
            </h2>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-red-400 font-semibold">Severe Hazard</span>
                <span className="font-mono tabular-nums text-white font-bold">{severityCounts.Severe}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-orange-400 font-semibold">High Hazard</span>
                <span className="font-mono tabular-nums text-white font-bold">{severityCounts.High}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-amber-400 font-semibold">Moderate Hazard</span>
                <span className="font-mono tabular-nums text-white font-bold">{severityCounts.Moderate}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-teal-400 font-semibold">Low Hazard</span>
                <span className="font-mono tabular-nums text-white font-bold">{severityCounts.Low}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Data Provenance & Trust Model</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Official alerts originate from statutory state agencies (SDMA & RMC). Community reports require crowd confirmation and field unit validation before being upgraded from advisory to verified status.
            </p>
          </div>
        </div>
      </div>

      {/* Incident Reports Table with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Community Incident Feed ({filteredIncidents.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live chronological feed of environmental and public safety hazards.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              aria-label="Filter incidents by category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 text-xs text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {Object.keys(categoryCounts).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={severityFilter}
              aria-label="Filter incidents by severity"
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 text-xs text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Severe">Severe</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              aria-label="Filter incidents by status"
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 text-xs text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Verification">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Field Team Dispatched">Dispatched</option>
              <option value="Under Monitoring">Monitoring</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Chronological Community Incident Feed</caption>
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4">ID & Title</th>
                  <th scope="col" className="py-3 px-4">Category</th>
                  <th scope="col" className="py-3 px-4">Severity</th>
                  <th scope="col" className="py-3 px-4">Location</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                  <th scope="col" className="py-3 px-4 text-right">Reported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No incidents match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => {
                    const reportedDate = new Date(incident.reportedAt);
                    const timeAgo = Math.round((Date.now() - reportedDate.getTime()) / 60000);

                    return (
                      <tr
                        key={incident.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            {incident.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {incident.id}
                            {incident.isOfficial ? ' · Official' : ' · Citizen'}
                            {incident.aiAssisted ? ' · AI Scanned' : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                          {incident.category}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              incident.severity === 'Severe'
                                ? 'text-red-400'
                                : incident.severity === 'High'
                                ? 'text-orange-400'
                                : incident.severity === 'Moderate'
                                ? 'text-amber-400'
                                : 'text-teal-400'
                            }`}
                          >
                            {incident.severity}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {incident.locationName}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-slate-300 font-medium">
                            {incident.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-400 whitespace-nowrap">
                          {timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
