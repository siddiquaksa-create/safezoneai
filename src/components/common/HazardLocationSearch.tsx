import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, X, Sparkles, AlertTriangle, Droplets, Trees, Zap, Building2, Check } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { requestBrowserLocation } from '../../services/locationService';

interface HazardLocationSearchProps {
  onSearchSubmit?: (location: string) => void;
  variant?: 'hero' | 'compact' | 'toolbar';
  placeholder?: string;
  showQuickPills?: boolean;
}

export const HazardLocationSearch: React.FC<HazardLocationSearchProps> = ({
  onSearchSubmit,
  variant = 'hero',
  placeholder = 'Search ANY location, locality, road, or hazard keyword...',
  showQuickPills = false,
}) => {
  const { searchQuery, setSearchQuery, selectedLocation, setSelectedLocation, availableLocations, clearSearch } = useIncidents();
  const [inputValue, setInputValue] = useState(searchQuery || (selectedLocation !== 'All Locations' ? selectedLocation : ''));
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal value if context changes from outside
  useEffect(() => {
    const active = searchQuery || (selectedLocation !== 'All Locations' ? selectedLocation : '');
    setInputValue(active);
  }, [searchQuery, selectedLocation]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: string) => {
    setInputValue(loc);
    setSelectedLocation(loc);
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(loc);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (clean) {
      setSelectedLocation(clean);
      setIsOpen(false);
      if (onSearchSubmit) {
        onSearchSubmit(clean);
      }
    } else {
      clearSearch();
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
    setLocationNotice(null);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationNotice('Detecting GPS coordinates...');
    try {
      const geo = await requestBrowserLocation();
      setInputValue(geo.localityName);
      setSelectedLocation(geo.localityName);
      setLocationNotice(`Located: ${geo.localityName}`);
      setIsOpen(false);
      if (onSearchSubmit) {
        onSearchSubmit(geo.localityName);
      }
    } catch (err: any) {
      setLocationNotice(err.message || 'Location access unavailable. Using default metropolitan grid.');
    } finally {
      setIsLocating(false);
      setTimeout(() => setLocationNotice(null), 4000);
    }
  };

  // Filter suggestion list
  const filteredSuggestions = availableLocations
    .filter((loc) => loc !== 'All Locations')
    .filter((loc) => !inputValue || loc.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 7);

  const hazardPresets = [
    { label: 'Flooding & Waterlogging', icon: Droplets, color: 'text-sky-400' },
    { label: 'Blocked Road & Tree Fall', icon: Trees, color: 'text-emerald-400' },
    { label: 'Power Line & Utility Hazard', icon: Zap, color: 'text-amber-400' },
  ];

  if (variant === 'toolbar') {
    return (
      <div ref={containerRef} className="relative w-full max-w-md">
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <MapPin className="w-3.5 h-3.5 text-teal-400 absolute left-2.5 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search any location or hazard..."
            aria-label="Search hazards by location or keyword"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-16 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear location search"
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              title="Use current GPS location"
              aria-label="Use current GPS location"
              className="p-1 text-teal-400 hover:text-teal-300 disabled:opacity-50"
            >
              <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 text-xs py-1.5 max-h-72 overflow-y-auto">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="w-full px-3 py-2 flex items-center gap-2 text-teal-300 hover:bg-slate-800 text-left border-b border-slate-800"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Use My Current GPS Position</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectLocation('All Locations')}
              className="w-full px-3 py-1.5 flex items-center justify-between text-slate-300 hover:bg-slate-800 text-left"
            >
              <span>View All Community Zones</span>
              {selectedLocation === 'All Locations' && <Check className="w-3.5 h-3.5 text-teal-400" />}
            </button>
            {filteredSuggestions.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className="w-full px-3 py-1.5 flex items-center justify-between text-slate-200 hover:bg-slate-800 text-left"
              >
                <span className="truncate">{loc}</span>
                {selectedLocation.toLowerCase() === loc.toLowerCase() && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
              </button>
            ))}
            {inputValue && !filteredSuggestions.some((s) => s.toLowerCase() === inputValue.toLowerCase()) && (
              <button
                type="button"
                onClick={() => handleSelectLocation(inputValue)}
                className="w-full px-3 py-2 flex items-center gap-2 text-amber-300 hover:bg-slate-800 text-left border-t border-slate-800"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Scan hazards for custom location: <strong>&ldquo;{inputValue}&rdquo;</strong></span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Hero & Default Variant
  return (
    <div ref={containerRef} className="w-full space-y-2">
      <form
        onSubmit={handleFormSubmit}
        className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-slate-900/95 rounded-xl border border-slate-700/90 shadow-2xl backdrop-blur-md"
      >
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 text-slate-300">
          <MapPin className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
          <label htmlFor="universal-hazard-search" className="sr-only">
            {placeholder}
          </label>
          <input
            id="universal-hazard-search"
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-slate-400"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear location search input"
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Scan hazards around your current location"
            aria-label="Use current GPS location"
          >
            <Navigation className={`w-3.5 h-3.5 text-teal-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">My Location</span>
          </button>

          <button
            type="submit"
            aria-label="Scan risk for location"
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-teal-500/20 focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Scan Risk</span>
          </button>
        </div>
      </form>

      {/* Geolocation feedback notice */}
      {locationNotice && (
        <div className="text-xs text-teal-300 flex items-center gap-1.5 px-2 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          <span>{locationNotice}</span>
        </div>
      )}

      {/* Interactive Suggestion Modal/Dropdown */}
      {isOpen && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-slate-900/98 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md p-3 text-xs space-y-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Community Zones & Known Localities
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => handleSelectLocation('All Locations')}
                  className="px-2.5 py-1.5 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="font-semibold">All Locations (Full City View)</span>
                  {selectedLocation === 'All Locations' && <Check className="w-3.5 h-3.5 text-teal-400" />}
                </button>
                {filteredSuggestions.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="px-2.5 py-1.5 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate">{loc}</span>
                    {selectedLocation.toLowerCase() === loc.toLowerCase() && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom search write-in prompt */}
            {inputValue && !availableLocations.some((l) => l.toLowerCase() === inputValue.toLowerCase()) && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectLocation(inputValue)}
                  className="w-full p-2.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center gap-2 text-left font-medium"
                >
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="truncate">
                    Analyze hazards for custom location: <strong>&ldquo;{inputValue}&rdquo;</strong>
                  </span>
                </button>
              </div>
            )}

            {/* Quick Hazard Category Shortcuts */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Hazard Filters
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hazardPresets.map(({ label, icon: Icon, color }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleSelectLocation(label)}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-[11px]"
                  >
                    <Icon className={`w-3 h-3 ${color}`} />
                    <span>{label.split('&')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Location Pills */}
      {showQuickPills && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
          <span className="text-slate-400 font-medium">Quick zones:</span>
          {availableLocations
            .filter((l) => l !== 'All Locations')
            .slice(0, 6)
            .map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => handleSelectLocation(zone)}
                className={`hover:text-teal-300 underline underline-offset-4 cursor-pointer transition-colors ${
                  selectedLocation.toLowerCase() === zone.toLowerCase()
                    ? 'text-teal-300 font-semibold decoration-teal-400'
                    : 'decoration-slate-600'
                }`}
              >
                {zone}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
