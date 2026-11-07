import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Shield,
  Droplets,
  Trees,
  Zap,
  Building2,
  X,
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  Navigation,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { IncidentReport, IncidentCategory } from '../types';
import { NavPage } from '../components/layout/Navbar';
import { HazardLocationSearch } from '../components/common/HazardLocationSearch';

interface LiveMapPageProps {
  onNavigate: (page: NavPage, extra?: { preloadedLocation?: string }) => void;
}

export const LiveMapPage: React.FC<LiveMapPageProps> = ({ onNavigate }) => {
  const {
    incidents,
    alerts,
    selectedLocation,
    setSelectedLocation,
    searchQuery,
    clearSearch,
    searchedLocationProfile,
    filterIncidents,
    verifyIncident,
  } = useIncidents();

  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(incidents[0] || null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterOfficialOnly, setFilterOfficialOnly] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter incidents using universal search logic
  const visibleIncidents = filterIncidents(activeCategory, filterOfficialOnly);

  // Simple geo-to-svg projection for the map viewport (1000x650)
  // Approximate bounds: lat 13.040 to 13.110, lng 80.220 to 80.300
  const projectGeoToSvg = (lat: number, lng: number) => {
    const minLat = 13.040;
    const maxLat = 13.110;
    const minLng = 80.220;
    const maxLng = 80.300;

    const x = ((lng - minLng) / (maxLng - minLng)) * 880 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520 + 60;
    return { x: Math.max(40, Math.min(960, x)), y: Math.max(40, Math.min(610, y)) };
  };

  const getCategoryColor = (category: IncidentCategory) => {
    switch (category) {
      case 'Flooding & Waterlogging':
        return '#0284c7'; // Sky/Blue
      case 'Blocked Road & Tree Fall':
        return '#16a34a'; // Emerald
      case 'Power Line & Utility Hazard':
        return '#eab308'; // Yellow/Amber
      case 'Public Infrastructure Damage':
        return '#ea580c'; // Orange
      case 'Landslide & Erosion':
        return '#b45309'; // Amber brown
      default:
        return '#14b8a6'; // Teal
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetMap = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const isLocationActive = selectedLocation !== 'All Locations' || Boolean(searchQuery);
  const searchedCoords = projectGeoToSvg(searchedLocationProfile.lat, searchedLocationProfile.lng);

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden bg-slate-950">
      {/* Top Filter and Location Search Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 z-10">
        <div className="flex-1 min-w-[260px] max-w-md">
          <HazardLocationSearch variant="toolbar" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          {['All', 'Flooding & Waterlogging', 'Blocked Road & Tree Fall', 'Power Line & Utility Hazard'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? 'All Hazards' : cat.split('&')[0].trim()}
            </button>
          ))}

          <button
            onClick={() => setFilterOfficialOnly(!filterOfficialOnly)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
              filterOfficialOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Official Alerts Only
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-slate-300 tabular-nums">
            {visibleIncidents.length} Markers Visible
          </span>
          {isLocationActive && (
            <button
              onClick={clearSearch}
              className="text-xs text-teal-400 hover:text-teal-300 underline underline-offset-2 cursor-pointer font-medium"
            >
              View All City
            </button>
          )}
        </div>
      </div>

      {/* Searched Location Risk Intelligence Banner (Active when searching any location) */}
      {isLocationActive && (
        <div className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-10 backdrop-blur-md">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-white">{searchedLocationProfile.name}</span>
              {searchedLocationProfile.isCustomLocation && (
                <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 text-[10px] border border-teal-500/30">
                  Custom Searched Location
                </span>
              )}
            </div>
            <span className="text-slate-600">·</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                searchedLocationProfile.riskLevel === 'Severe'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : searchedLocationProfile.riskLevel === 'High'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : searchedLocationProfile.riskLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              Risk Level: {searchedLocationProfile.riskLevel}
            </span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="text-slate-300 hidden md:inline truncate max-w-md">
              {searchedLocationProfile.weatherSummary}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('report', { preloadedLocation: searchedLocationProfile.name })}
              className="flex items-center gap-1 px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Hazard Here</span>
            </button>
            <button
              onClick={clearSearch}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Clear search"
              aria-label="Clear active location filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Map Viewport & Drawer */}
      <div className="relative flex-1 overflow-hidden flex">
        {/* Interactive SVG Geospatial Map */}
        <div
          className="relative flex-1 bg-[#060b14] overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom & Navigation Floating Controls */}
          <div
            className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl"
            role="toolbar"
            aria-label="Map navigation controls"
          >
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={handleResetMap}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400"
              title="Reset view"
              aria-label="Reset map view"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] space-y-2 max-w-xs pointer-events-none">
            <div className="font-semibold text-slate-200 uppercase tracking-wider">
              Map Layers & Symbology
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Waterlogging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Blocked Road</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span>Power/Utility</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Searched Pin</span>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-800 text-slate-400 text-[10px]">
              Yellow halo ring indicates official agency alert.
            </div>
          </div>

          {/* Empty Search State Notice */}
          {visibleIncidents.length === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-slate-900/95 border border-slate-700 p-6 rounded-2xl shadow-2xl text-center max-w-md space-y-3 backdrop-blur-md">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                No Active Incidents in &ldquo;{searchedLocationProfile.name}&rdquo;
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {searchedLocationProfile.weatherSummary} Nearest emergency facility is{' '}
                <strong>{searchedLocationProfile.nearestFacilityName}</strong> (~
                {searchedLocationProfile.nearestFacilityDistance} km).
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => onNavigate('report', { preloadedLocation: searchedLocationProfile.name })}
                  className="w-full sm:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  File First Report Here
                </button>
                <button
                  onClick={clearSearch}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Show All City Hazards
                </button>
              </div>
            </div>
          )}

          {/* SVG Canvas Map */}
          <svg
            className="w-full h-full transition-transform duration-100 ease-out"
            viewBox="0 0 1000 650"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: '50% 50%',
            }}
          >
            {/* Background Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="1" />
              </pattern>
              <radialGradient id="floodGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="searchBeaconGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1000" height="650" fill="url(#grid)" />

            {/* Simulated River & Canal Waterway System */}
            <path
              d="M 20 80 Q 220 120 420 280 T 820 460 T 980 580"
              fill="none"
              stroke="#0369a1"
              strokeWidth="28"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />
            <path
              d="M 20 80 Q 220 120 420 280 T 820 460 T 980 580"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="6"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            <text x="340" y="230" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.7">
              NORTH CANAL CORRIDOR (INFLOW: 3,200 CUSECS)
            </text>

            {/* River Tributary */}
            <path
              d="M 420 280 Q 560 220 740 180 T 980 140"
              fill="none"
              stroke="#0284c7"
              strokeWidth="14"
              strokeOpacity="0.25"
            />

            {/* City Transit & Arterial Roads Grid */}
            <g stroke="#1e293b" strokeWidth="2">
              {/* Outer Ring Road */}
              <ellipse cx="500" cy="320" rx="380" ry="240" fill="none" stroke="#334155" strokeWidth="3" />
              <text x="520" y="85" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                OLD TOWN RING ROAD
              </text>

              {/* Arterial Corridors */}
              <line x1="80" y1="320" x2="920" y2="320" stroke="#334155" strokeWidth="2.5" />
              <line x1="500" y1="60" x2="500" y2="580" stroke="#334155" strokeWidth="2.5" />
              <line x1="160" y1="120" x2="840" y2="520" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="180" y1="520" x2="820" y2="120" stroke="#1e293b" strokeWidth="1.5" />
            </g>

            {/* Major Neighborhood Labels */}
            <g fill="#64748b" fontSize="11" fontWeight="600" letterSpacing="1">
              <text x="180" y="160">NORTH CANAL DISTRICT</text>
              <text x="680" y="240">METRO BASIN SECTOR 4</text>
              <text x="380" y="440">LAKEVIEW BYPASS</text>
              <text x="740" y="480">DELTA CAUSEWAY</text>
              <text x="220" y="480">GREENBELT RIDGE</text>
            </g>

            {/* Inundation Danger Hazard Zone Circles */}
            <circle cx="280" cy="220" r="65" fill="url(#floodGlow)" />
            <circle cx="720" cy="420" r="50" fill="url(#floodGlow)" />

            {/* Pulsing Radar Marker for ANY Searched Location */}
            {isLocationActive && (
              <g transform={`translate(${searchedCoords.x}, ${searchedCoords.y})`} className="z-30">
                {/* Expanding Radar Sweeps */}
                <circle r="40" fill="url(#searchBeaconGlow)" />
                <circle
                  r="28"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  opacity="0.8"
                  className="animate-ping origin-center"
                />
                <circle
                  r="12"
                  fill="#14b8a6"
                  stroke="#ffffff"
                  strokeWidth="3"
                  className="drop-shadow-lg"
                />
                {/* Location Flag Banner */}
                <g transform="translate(0, -22)">
                  <rect
                    x="-90"
                    y="-22"
                    width="180"
                    height="24"
                    rx="6"
                    fill="#0f172a"
                    stroke="#14b8a6"
                    strokeWidth="1.5"
                    className="shadow-2xl"
                  />
                  <text
                    x="0"
                    y="-6"
                    fill="#2dd4bf"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    📍 {searchedLocationProfile.name.slice(0, 22)}
                  </text>
                </g>
              </g>
            )}

            {/* Incident Markers */}
            {visibleIncidents.map((incident) => {
              const { x, y } = projectGeoToSvg(incident.coordinates.lat, incident.coordinates.lng);
              const isSelected = selectedIncident?.id === incident.id;
              const color = getCategoryColor(incident.category);

              return (
                <g
                  key={incident.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIncident(incident);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Severe Hazard Pulsing Ring */}
                  {incident.severity === 'Severe' && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Official Alert Ring */}
                  {incident.isOfficial && (
                    <circle
                      r="16"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    r={isSelected ? '14' : '10'}
                    fill={isSelected ? '#ffffff' : color}
                    stroke="#020617"
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                  />

                  {/* Inner Symbol Dot */}
                  <circle
                    r="4"
                    fill={isSelected ? color : '#ffffff'}
                  />

                  {/* Marker Label on hover/selected */}
                  {isSelected && (
                    <g transform="translate(0, -22)">
                      <rect
                        x="-70"
                        y="-18"
                        width="140"
                        height="20"
                        rx="4"
                        fill="#0f172a"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-4"
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {incident.id} · {incident.category.split('&')[0]}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Incident Detail Slide-Over Card */}
        {selectedIncident && (
          <div className="w-full sm:w-96 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto space-y-4 shrink-0 shadow-2xl z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    selectedIncident.severity === 'Severe'
                      ? 'text-red-400'
                      : selectedIncident.severity === 'High'
                      ? 'text-orange-400'
                      : 'text-amber-400'
                  }`}
                >
                  {selectedIncident.severity} Severity
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {selectedIncident.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                aria-label="Close incident details"
                className="text-slate-300 hover:text-white p-1 cursor-pointer rounded focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Photograph preview if available */}
            {selectedIncident.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                <img
                  src={selectedIncident.imageUrl}
                  alt={selectedIncident.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-teal-300 backdrop-blur-sm">
                  Field Photo Evidence
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                {selectedIncident.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedIncident.description}
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Category:</span>
                <span className="text-white font-medium">{selectedIncident.category}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-white font-medium">{selectedIncident.locationName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-teal-400 font-medium">{selectedIncident.status}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Reported By:</span>
                <span className="text-slate-300">
                  {selectedIncident.reporterName || 'Citizen Report'}
                </span>
              </div>
            </div>

            {/* Admin/Field notes */}
            {selectedIncident.adminNotes && (
              <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-500/30 text-xs space-y-1">
                <div className="text-teal-300 font-semibold text-[11px] uppercase tracking-wider">
                  Field Dispatch Status
                </div>
                <p className="text-teal-200/90 leading-relaxed text-[11px]">
                  {selectedIncident.adminNotes}
                </p>
              </div>
            )}

            {/* Verification and actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => verifyIncident(selectedIncident.id)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Confirm Hazard Exists ({selectedIncident.verificationVotes})</span>
              </button>

              <button
                onClick={() => onNavigate('guide')}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Ask SAFEGuide AI for Safety Steps</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
