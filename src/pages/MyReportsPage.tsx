import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { IncidentStatus } from '../types';
import { NavPage } from '../components/layout/Navbar';

interface MyReportsPageProps {
  onNavigate: (page: NavPage) => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({ onNavigate }) => {
  const { incidents, userReportIds, deleteUserReport } = useIncidents();
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Filter user's reports
  const userIncidents = incidents.filter((inc) => userReportIds.includes(inc.id));
  const filteredList = userIncidents.filter((inc) => {
    if (filterStatus !== 'All' && inc.status !== filterStatus) return false;
    return true;
  });

  const getStatusStepIndex = (status: IncidentStatus) => {
    switch (status) {
      case 'Pending Verification':
        return 1;
      case 'Verified':
        return 2;
      case 'Field Team Dispatched':
        return 3;
      case 'Under Monitoring':
      case 'Resolved':
        return 4;
      case 'Rejected':
        return -1;
      default:
        return 1;
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'Verified':
        return 'text-teal-400';
      case 'Field Team Dispatched':
        return 'text-sky-400';
      case 'Pending Verification':
        return 'text-amber-400';
      case 'Resolved':
        return 'text-emerald-400';
      case 'Rejected':
        return 'text-red-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            <span>CITIZEN SUBMISSION TRACKER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            My Submitted Hazard Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track verification progress, field crew dispatches, and resolution notices for incidents you reported.
          </p>
        </div>

        <button
          onClick={() => onNavigate('report')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Another Hazard</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
        {['All', 'Pending Verification', 'Verified', 'Field Team Dispatched', 'Resolved'].map((st) => (
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

      {/* Reports List */}
      <div className="space-y-5">
        {filteredList.length === 0 ? (
          <div className="p-12 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Submitted Reports Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't submitted any hazard reports matching this filter. Notice a localized risk in your area? Report it to protect your neighborhood.
              </p>
            </div>
            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Log First Community Hazard
            </button>
          </div>
        ) : (
          filteredList.map((report) => {
            const step = getStatusStepIndex(report.status);
            const isRejected = report.status === 'Rejected';

            return (
              <div
                key={report.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-teal-400 font-bold">
                        {report.id}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300 font-medium">{report.category}</span>
                      <span className="text-slate-500">·</span>
                      <span
                        className={`font-semibold ${
                          report.severity === 'Severe'
                            ? 'text-red-400'
                            : report.severity === 'High'
                            ? 'text-orange-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {report.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug">
                      {report.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <button
                      onClick={() => deleteUserReport(report.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer rounded focus-visible:ring-2 focus-visible:ring-red-400"
                      title={`Withdraw report ${report.id}`}
                      aria-label={`Withdraw report ${report.id}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Photo & Description */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {report.imageUrl && (
                    <div className="md:col-span-4 rounded-lg overflow-hidden border border-slate-800 aspect-video bg-slate-950">
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className={report.imageUrl ? 'md:col-span-8 space-y-2' : 'col-span-12 space-y-2'}>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>Location: <strong className="text-slate-200">{report.locationName}</strong></span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">
                        Reported: {new Date(report.reportedAt).toLocaleDateString()} at{' '}
                        {new Date(report.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>·</span>
                      <span>Votes: <strong className="text-teal-400">{report.verificationVotes}</strong></span>
                    </div>

                    {report.adminNotes && (
                      <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-teal-300 space-y-1 mt-2">
                        <div className="font-semibold uppercase tracking-wider text-[10px] text-teal-400">
                          Triage Update from Municipal Dispatch:
                        </div>
                        <p className="text-slate-300">{report.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Timeline Stepper */}
                {!isRejected && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 1 ? 'bg-teal-400' : 'bg-slate-800'
                          }`}
                        />
                        <span className={step >= 1 ? 'text-teal-300 font-semibold' : 'text-slate-500'}>
                          1. Logged
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 2 ? 'bg-teal-400' : 'bg-slate-800'
                          }`}
                        />
                        <span className={step >= 2 ? 'text-teal-300 font-semibold' : 'text-slate-500'}>
                          2. Verified
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 3 ? 'bg-teal-400' : 'bg-slate-800'
                          }`}
                        />
                        <span className={step >= 3 ? 'text-teal-300 font-semibold' : 'text-slate-500'}>
                          3. Dispatched
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            step >= 4 ? 'bg-teal-400' : 'bg-slate-800'
                          }`}
                        />
                        <span className={step >= 4 ? 'text-teal-300 font-semibold' : 'text-slate-500'}>
                          4. Monitored / Done
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
