import React from 'react';
import { Shield, Phone, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { OFFICIAL_HELPLINES } from '../../data/sampleData';
import { useIncidents } from '../../context/IncidentContext';
import { NavPage } from './Navbar';

interface FooterProps {
  onNavigate: (page: NavPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { resetToDefaultData } = useIncidents();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* Emergency Helplines Quick Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200">
            <Phone className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-300">
              Verified Emergency Dispatch Numbers
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono">
            {OFFICIAL_HELPLINES.slice(0, 5).map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number}`}
                className="hover:text-teal-300 transition-colors flex items-center gap-1.5 group cursor-pointer"
              >
                <span className="text-slate-300 group-hover:text-slate-200">{line.service}:</span>
                <span className="font-bold text-white group-hover:text-teal-400 tabular-nums">
                  {line.number}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">SafeZone AI</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Community-driven risk intelligence and automated early warning platform. Bridging ground-level citizen reports with official disaster management telemetry.
          </p>
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={resetToDefaultData}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-teal-300 transition-colors py-1 cursor-pointer"
              title="Reset sample data to initial demonstration state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            Platform Modules
          </h4>
          <ul className="space-y-1.5">
            <li>
              <button onClick={() => onNavigate('map')} className="hover:text-teal-300 transition-colors cursor-pointer">
                Live Geospatial Risk Map
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('dashboard')} className="hover:text-teal-300 transition-colors cursor-pointer">
                Community Intelligence Telemetry
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('report')} className="hover:text-teal-300 transition-colors cursor-pointer">
                Citizen Incident Reporting
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('analyzer')} className="hover:text-teal-300 transition-colors cursor-pointer">
                Gemini AI Incident Analyzer
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            Community Guidance
          </h4>
          <ul className="space-y-1.5">
            <li>
              <button onClick={() => onNavigate('guide')} className="hover:text-teal-300 transition-colors cursor-pointer">
                SAFEGuide AI Assistant (English & தமிழ்)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('nearby')} className="hover:text-teal-300 transition-colors cursor-pointer">
                Emergency Evacuation & Help Centers
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('my-reports')} className="hover:text-teal-300 transition-colors cursor-pointer">
                Track My Submitted Reports
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin')} className="hover:text-teal-300 transition-colors cursor-pointer">
                Dispatcher Triage Console
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-2 md:col-span-1">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Safety Notice</span>
          </h4>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            SafeZone AI is an advisory information system. AI computer-vision inferences and community observations do not constitute legal or statutory guarantees of route safety. In active danger, prioritize immediate personal evacuation and notify 112.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-900 py-4 px-4 sm:px-6 text-center text-slate-400 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SafeZone AI &copy; 2026. Built for community resilience and public safety.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Server-Side Gemini 3.8 Flash</span>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span aria-hidden="true">·</span>
            <span>GDPR/Privacy Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
