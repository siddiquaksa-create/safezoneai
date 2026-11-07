import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  Building2,
  Search,
  Navigation,
  Shield,
  HeartPulse,
  Flame,
  Home,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { EMERGENCY_FACILITIES } from '../data/sampleData';
import { EmergencyFacility } from '../types';
import { NavPage } from '../components/layout/Navbar';

interface NearbyHelpPageProps {
  onNavigate: (page: NavPage) => void;
}

export const NearbyHelpPage: React.FC<NearbyHelpPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [simulatedDirections, setSimulatedDirections] = useState<string | null>(null);

  const categories = [
    'All',
    'Hospital & Trauma',
    'Fire & Rescue',
    'Flood Relief Camp',
    'Municipal Emergency Cell',
    'Police & Safety',
  ];

  const filteredFacilities = EMERGENCY_FACILITIES.filter((facility) => {
    if (selectedCategory !== 'All' && facility.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        facility.name.toLowerCase().includes(q) ||
        facility.zone.toLowerCase().includes(q) ||
        facility.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryIcon = (category: EmergencyFacility['category']) => {
    switch (category) {
      case 'Hospital & Trauma':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'Fire & Rescue':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Flood Relief Camp':
        return <Home className="w-4 h-4 text-teal-400" />;
      case 'Municipal Emergency Cell':
        return <Building2 className="w-4 h-4 text-sky-400" />;
      case 'Police & Safety':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      default:
        return <Building2 className="w-4 h-4 text-teal-400" />;
    }
  };

  const handleRouteRequest = (facility: EmergencyFacility) => {
    setSimulatedDirections(
      `Route to ${facility.name} (${facility.distanceKm} km away via higher elevation bypass): Proceed west on Arterial Ring Road, avoid low underpass at Basin Sector 4. Estimated transit time: ${Math.round(facility.distanceKm * 4.5)} mins.`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>VERIFIED PUBLIC SAFETY & RELIEF INFRASTRUCTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Nearby Emergency Help & Evacuation Centers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Locate operational trauma care centers, water rescue stations, flood evacuation shelters, and municipal dispatch desks.
          </p>
        </div>

        <button
          onClick={() => onNavigate('map')}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-teal-400" />
          <span>View on Geospatial Map</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="nearby-help-search" className="sr-only">
            Search by facility name, zone, or address
          </label>
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            id="nearby-help-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by facility name, zone, or address..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Directions Banner if user clicked a route */}
      {simulatedDirections && (
        <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-200 text-xs flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <Navigation className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                Navigational Safety Advisory
              </div>
              <p className="mt-1 leading-relaxed">{simulatedDirections}</p>
            </div>
          </div>
          <button
            onClick={() => setSimulatedDirections(null)}
            className="text-teal-400 hover:text-teal-200 text-xs font-semibold cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  {getCategoryIcon(facility.category)}
                  <span>{facility.category}</span>
                </span>
                <span className="font-mono text-teal-400 font-bold tabular-nums">
                  {facility.distanceKm} km
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {facility.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{facility.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-medium border border-slate-800 text-[11px]">
                  {facility.status}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 text-[11px]">{facility.zone}</span>
              </div>

              {/* Verified Amenities */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Verified Readiness & Equipment:
                </div>
                <div className="flex flex-wrap gap-1">
                  {facility.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <a
                href={`tel:${facility.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                <span>Call {facility.phone}</span>
              </a>

              <button
                onClick={() => handleRouteRequest(facility)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route Guidance</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
