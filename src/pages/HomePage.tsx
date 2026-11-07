import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Search,
  ArrowRight,
  Sparkles,
  Radio,
  Clock,
  Compass,
  CheckCircle2,
  PhoneCall,
  Activity,
  Layers,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { SAMPLE_LOCATIONS } from '../data/sampleData';
import { NavPage } from '../components/layout/Navbar';
import { HazardLocationSearch } from '../components/common/HazardLocationSearch';

interface HomePageProps {
  onNavigate: (page: NavPage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { incidents, alerts, selectedLocation, setSelectedLocation } = useIncidents();

  // Filtered counts
  const totalIncidents = incidents.length;
  const verifiedCount = incidents.filter((i) => i.status === 'Verified' || i.status === 'Field Team Dispatched').length;
  const severeCount = incidents.filter((i) => i.severity === 'Severe' || i.severity === 'High').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-8 pb-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>COMMUNITY RISK INTELLIGENCE & EARLY WARNING</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
              Community early warning for weather hazards, floods, and public safety.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              SafeZone AI combines official disaster management telemetry with community-verified ground reports and computer-vision hazard scanning to safeguard neighborhoods before, during, and after severe weather.
            </p>

            {/* Universal Hazard & Location Search Bar */}
            <div className="pt-2 max-w-2xl">
              <HazardLocationSearch
                onSearchSubmit={() => onNavigate('map')}
                showQuickPills={true}
                placeholder="Search ANY community, locality, avenue, or hazard keyword..."
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('map')}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Live Risk Map</span>
              </button>
              <button
                onClick={() => onNavigate('report')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Report Local Hazard</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('analyzer')}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-teal-300 hover:text-white transition-colors cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>AI Photo Analyzer</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Image Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl group">
              <div className="aspect-video sm:aspect-[16/10] overflow-hidden bg-slate-950 relative">
                <img
                  src="/src/assets/images/safezone_hero_satellite_1793984746017.jpg"
                  alt="SafeZone AI Satellite Weather Telemetry Console"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG map preview if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Overlay card details */}
              <div className="absolute bottom-0 inset-x-0 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-teal-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span>METEOROLOGICAL SATELLITE & RADAR</span>
                  </span>
                  <span className="tabular-nums text-slate-300">UPDATED: 4 MINS AGO</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Regional Monsoon & Coastal Basin Surveillance
                </h3>
                <p className="text-xs text-slate-200 line-clamp-2">
                  Multi-spectral precipitation estimates and catchment runoff monitoring active across 6 metropolitan drainage zones.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-300">Catchment alert status:</span>
                  <span className="text-amber-400 font-semibold">Elevated (Watch 2)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Incident Statistics Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6" aria-label="Community Incident Statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="text-xs text-slate-300 font-medium">Actively Monitored Incidents</div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono tabular-nums">
              {totalIncidents}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-teal-400 font-medium">{verifiedCount} field-verified</span>
              <span>·</span>
              <span>Across all zones</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="text-xs text-slate-300 font-medium">High & Severe Hazards</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2 font-mono tabular-nums">
              {severeCount}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Immediate dispatch priority</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="text-xs text-slate-300 font-medium">Community Sentinels</div>
            <div className="text-3xl font-extrabold text-teal-400 mt-2 font-mono tabular-nums">
              1,420+
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>Active citizen contributors</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="text-xs text-slate-300 font-medium">Mean Triage & Dispatch</div>
            <div className="text-3xl font-extrabold text-slate-100 mt-2 font-mono tabular-nums">
              18.4m
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>From report to civic crew</span>
            </div>
          </div>
        </div>
      </section>

      {/* Official Alerts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Current Official Emergency Advisories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold uppercase tracking-wider text-[11px] ${
                      alert.severity === 'Warning'
                        ? 'text-orange-400'
                        : alert.severity === 'Advisory'
                        ? 'text-amber-400'
                        : 'text-teal-400'
                    }`}
                  >
                    {alert.severity} · {alert.type}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">
                    {alert.id}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {alert.headline}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Issued by {alert.source}
                </p>

                <div className="pt-1">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Affected Zones
                  </div>
                  <div className="text-xs text-slate-300 flex flex-wrap gap-1">
                    {alert.affectedZones.map((z, idx) => (
                      <span key={z}>
                        {z}
                        {idx < alert.affectedZones.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Valid for 6h+</span>
                </span>
                <button
                  onClick={() => {
                    setSelectedLocation(alert.affectedZones[0] || 'All Locations');
                    onNavigate('map');
                  }}
                  className="text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
                >
                  Map Zone &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access to Important Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            SafeZone AI Platform Capabilities
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access public safety tools designed for community members, volunteers, and municipal teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigate('map')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              Live Risk Map
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Explore real-time geospatial hazard markers for waterlogging, tree falls, and closed roads with category filters.
            </p>
          </div>

          <div
            onClick={() => onNavigate('analyzer')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              AI Incident Analyzer
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Upload hazard photos for automated visual classification, hazard severity scoring, and immediate safety recommendations.
            </p>
          </div>

          <div
            onClick={() => onNavigate('guide')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              SAFEGuide AI Assistant
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Conversational safety guidance in English and Tamil (தமிழ்) covering flash floods, cyclone prep, first aid, and helpline directories.
            </p>
          </div>

          <div
            onClick={() => onNavigate('report')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              Report Community Hazard
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Submit photo evidence, specify coordinates or street names, and alert neighbors and civic response units.
            </p>
          </div>

          <div
            onClick={() => onNavigate('nearby')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform mb-4">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              Nearby Verified Help
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Access directory of active trauma centers, fire stations, flood evacuation camps, and 24/7 municipal dispatch desks.
            </p>
          </div>

          <div
            onClick={() => onNavigate('admin')}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              Dispatcher Triage Console
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Review incoming reports, verify authenticity, merge duplicates, broadcast alerts, and coordinate civic units.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
