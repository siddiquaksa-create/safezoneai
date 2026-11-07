import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Copy,
  Radio,
  AlertTriangle,
  Send,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Check,
  Eye,
  Activity,
  PlusCircle,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { IncidentReport, IncidentStatus, SeverityLevel } from '../types';
import { NavPage } from '../components/layout/Navbar';

interface AdminPageProps {
  onNavigate: (page: NavPage) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    incidents,
    alerts,
    updateIncidentStatus,
    verifyIncident,
    rejectIncident,
    markDuplicate,
    broadcastAlert,
  } = useIncidents();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);

  // Broadcast modal form state
  const [broadcastSource, setBroadcastSource] = useState('Municipal Emergency Operations Desk');
  const [broadcastType, setBroadcastType] = useState('Flash Flood Warning & Traffic Divert');
  const [broadcastHeadline, setBroadcastHeadline] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'Watch' | 'Advisory' | 'Warning' | 'Emergency'>('Warning');
  const [broadcastZones, setBroadcastZones] = useState('North Canal Corridor, Metro Basin');
  const [broadcastInstructions, setBroadcastInstructions] = useState(
    'Avoid low-lying canal crossings.\nObey police traffic diversions.\nCall 112 for stranded vehicle towing.'
  );

  const filteredIncidents = incidents.filter((inc) => {
    if (filterStatus !== 'All' && inc.status !== filterStatus) return false;
    return true;
  });

  // Potential duplicate detection helper: matches reports with same category and same location
  const findPotentialDuplicates = (target: IncidentReport) => {
    return incidents.filter(
      (inc) =>
        inc.id !== target.id &&
        inc.category === target.category &&
        inc.locationName === target.locationName &&
        inc.status !== 'Rejected'
    );
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastHeadline.trim()) return;

    broadcastAlert({
      source: broadcastSource,
      type: broadcastType,
      severity: broadcastSeverity,
      severityColor:
        broadcastSeverity === 'Emergency'
          ? 'rose'
          : broadcastSeverity === 'Warning'
          ? 'orange'
          : broadcastSeverity === 'Advisory'
          ? 'amber'
          : 'teal',
      validUntil: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      affectedZones: broadcastZones.split(',').map((z) => z.trim()),
      headline: broadcastHeadline.trim(),
      instructions: broadcastInstructions.split('\n').filter((i) => i.trim()),
      isOfficial: true,
    });

    setIsBroadcastModalOpen(false);
    setBroadcastHeadline('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span>INCIDENT TRIAGE & EMERGENCY DISPATCH CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Admin & Dispatcher Command Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verify citizen submissions, eliminate duplicates, deploy municipal response crews, and issue live community emergency broadcasts.
          </p>
        </div>

        <button
          onClick={() => setIsBroadcastModalOpen(true)}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <Radio className="w-4 h-4" />
          <span>Broadcast Official Emergency Alert</span>
        </button>
      </div>

      {/* KPI Triage Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Pending Verification</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono tabular-nums">
            {incidents.filter((i) => i.status === 'Pending Verification').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting sentinel triage</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Active Field Deployments</div>
          <div className="text-3xl font-extrabold text-sky-400 mt-1 font-mono tabular-nums">
            {incidents.filter((i) => i.status === 'Field Team Dispatched').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dewatering & tree teams</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Verified Hazards</div>
          <div className="text-3xl font-extrabold text-teal-400 mt-1 font-mono tabular-nums">
            {incidents.filter((i) => i.status === 'Verified').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Authenticated by field photos</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Official Alerts Live</div>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">
            {alerts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">State & Municipal feeds</div>
        </div>
      </div>

      {/* Queue Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
          <span className="text-slate-500 font-medium shrink-0">Queue Filter:</span>
          {['All', 'Pending Verification', 'Verified', 'Field Team Dispatched', 'Under Monitoring', 'Resolved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-400 shrink-0">
          {filteredIncidents.length} Reports in Triage
        </span>
      </div>

      {/* Triage Incidents Table & Action Center */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Incident Triage and Dispatch Queue</caption>
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4">Hazard ID & Title</th>
                <th scope="col" className="py-3 px-4">Location</th>
                <th scope="col" className="py-3 px-4">Category</th>
                <th scope="col" className="py-3 px-4">Severity</th>
                <th scope="col" className="py-3 px-4">Current Status</th>
                <th scope="col" className="py-3 px-4 text-center">Triage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.map((inc) => {
                const potentialDups = findPotentialDuplicates(inc);

                return (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-white leading-snug">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center gap-2">
                        <span>{inc.id}</span>
                        <span>·</span>
                        <span>{inc.reporterName || 'Citizen Sentinel'}</span>
                        {inc.aiAssisted && (
                          <span className="text-teal-400 font-semibold">· AI Scanned</span>
                        )}
                      </div>
                      {potentialDups.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400">
                          <Copy className="w-3 h-3" />
                          <span>{potentialDups.length} potential duplicate(s) nearby</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {inc.locationName}
                    </td>

                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {inc.category}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          inc.severity === 'Severe'
                            ? 'text-red-400'
                            : inc.severity === 'High'
                            ? 'text-orange-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={inc.status}
                        aria-label={`Change status for incident ${inc.id}`}
                        onChange={(e) => updateIncidentStatus(inc.id, e.target.value as IncidentStatus)}
                        className="bg-slate-950 text-xs text-white border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
                      >
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Field Team Dispatched">Field Team Dispatched</option>
                        <option value="Under Monitoring">Under Monitoring</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {inc.status !== 'Verified' && (
                          <button
                            onClick={() => verifyIncident(inc.id)}
                            className="px-2.5 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Verify Report"
                          >
                            Verify
                          </button>
                        )}

                        <button
                          onClick={() => {
                            updateIncidentStatus(
                              inc.id,
                              'Field Team Dispatched',
                              'Municipal Rapid Response Crew deployed with emergency pumps and clearing apparatus.'
                            );
                          }}
                          className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Deploy Field Crew"
                        >
                          Dispatch
                        </button>

                        <button
                          onClick={() => {
                            setSelectedIncident(inc);
                            setIsRejectModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Reject Report"
                        >
                          Reject
                        </button>

                        {potentialDups.length > 0 && (
                          <button
                            onClick={() => markDuplicate(inc.id, potentialDups[0].id)}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                            title={`Merge with ${potentialDups[0].id}`}
                          >
                            Merge Dup
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Reject Report #{selectedIncident.id}
            </h3>
            <p className="text-xs text-slate-400">
              Provide justification for marking this submission as invalid or unsubstantiated:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate duplicate angle, resolved before inspection, or unverified location..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-teal-400"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectIncident(selectedIncident.id, rejectReason || 'Did not meet verification criteria');
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Community Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <Radio className="w-4 h-4" />
                <span>Issue Live Community Emergency Alert</span>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Issuing Authority / Agency:</label>
                <input
                  type="text"
                  value={broadcastSource}
                  onChange={(e) => setBroadcastSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Alert Level:</label>
                  <select
                    value={broadcastSeverity}
                    onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Watch">Watch (Green/Teal)</option>
                    <option value="Advisory">Advisory (Amber)</option>
                    <option value="Warning">Warning (Orange)</option>
                    <option value="Emergency">Emergency (Red)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Hazard Type:</label>
                  <input
                    type="text"
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Affected Zones (comma separated):</label>
                <input
                  type="text"
                  value={broadcastZones}
                  onChange={(e) => setBroadcastZones(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Broadcast Headline Message *:</label>
                <input
                  type="text"
                  value={broadcastHeadline}
                  onChange={(e) => setBroadcastHeadline(e.target.value)}
                  placeholder="e.g. Rapid Inundation Warning: North Canal Underpass closed immediately"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Citizen Directives (one per line):</label>
                <textarea
                  rows={3}
                  value={broadcastInstructions}
                  onChange={(e) => setBroadcastInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!broadcastHeadline.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  Publish Live Alert Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
