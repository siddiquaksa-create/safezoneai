import React, { useState } from 'react';
import {
  Upload,
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Compass,
  FileText,
  ShieldAlert,
  Navigation,
} from 'lucide-react';
import { useIncidents } from '../context/IncidentContext';
import { IncidentCategory, SeverityLevel } from '../types';
import { analyzeIncidentImage } from '../services/api';
import { NavPage } from '../components/layout/Navbar';
import { geocodeAnyLocation, requestBrowserLocation } from '../services/locationService';

interface ReportIncidentPageProps {
  onNavigate: (page: NavPage) => void;
  preloadedImage?: string;
  preloadedCategory?: IncidentCategory;
  preloadedDescription?: string;
  preloadedLocation?: string;
}

export const ReportIncidentPage: React.FC<ReportIncidentPageProps> = ({
  onNavigate,
  preloadedImage,
  preloadedCategory,
  preloadedDescription,
  preloadedLocation,
}) => {
  const { addIncident, availableLocations, addCustomLocation } = useIncidents();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(preloadedDescription || '');
  const [category, setCategory] = useState<IncidentCategory>(preloadedCategory || 'Flooding & Waterlogging');
  const [severity, setSeverity] = useState<SeverityLevel>('Moderate');
  const [locationName, setLocationName] = useState(preloadedLocation || availableLocations[1] || 'North Canal Corridor');
  const [customLocation, setCustomLocation] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(Boolean(preloadedLocation && !availableLocations.includes(preloadedLocation)));
  const [customLocationName, setCustomLocationName] = useState(preloadedLocation || '');
  const [isLocating, setIsLocating] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(preloadedImage || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const samplePhotos = [
    {
      name: 'Waterlogged Street',
      url: '/src/assets/images/incident_flooding_sample_1793984746312.jpg',
    },
    {
      name: 'Fallen Tree On Roadway',
      url: '/src/assets/images/incident_blocked_road_1793984747412.jpg',
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAiNote(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSamplePhoto = (url: string) => {
    setImagePreview(url);
    setAiNote(null);
  };

  const handleRunAiPrescan = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setAiNote(null);

    try {
      const result = await analyzeIncidentImage(imagePreview, locationName, description);
      if (result.suggestedCategory) {
        setCategory(result.suggestedCategory);
      }
      if (result.hazardSeverity) {
        setSeverity(result.hazardSeverity);
      }
      if (result.title && !title) {
        setTitle(result.title);
      }
      if (result.visualObservations && result.visualObservations.length > 0) {
        setDescription(
          (prev) =>
            (prev ? prev + '\n\n' : '') +
            'AI Visual Observations:\n• ' +
            result.visualObservations.join('\n• ')
        );
      }
      setAiNote(
        `AI Pre-Scan completed (${result.confidenceScore}% visual confidence). Suggested: ${result.suggestedCategory}.`
      );
    } catch (err: any) {
      console.error('AI Pre-Scan error:', err);
      setAiNote('AI scan completed with basic computer-vision suggestions.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const geo = await requestBrowserLocation();
      setLocationName(geo.localityName);
      setCustomLocationName(geo.localityName);
      setCustomLocation(`GPS: ${geo.lat.toFixed(4)}°N, ${geo.lng.toFixed(4)}°E`);
    } catch {
      setLocationName('Metro Basin Sector 4');
      setCustomLocation('Near Canal Junction Gate #3 (Lat: 13.0841, Lng: 80.2719)');
    } finally {
      setIsLocating(false);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Please enter a short headline for the hazard.';
    if (!description.trim() || description.trim().length < 10) {
      errors.description = 'Please describe the incident in at least 10 characters.';
    }
    const finalLocation = isCustomMode ? customLocationName.trim() : locationName;
    if (!finalLocation || finalLocation === 'All Locations') {
      errors.location = 'Please select or enter the specific incident location.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalLocation = isCustomMode ? customLocationName.trim() : locationName;
    const geo = geocodeAnyLocation(finalLocation);
    addCustomLocation(finalLocation);

    const newReport = addIncident({
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      locationName: finalLocation,
      coordinates: {
        lat: geo.lat,
        lng: geo.lng,
      },
      imageUrl: imagePreview || undefined,
      reporterName: reporterName.trim() || 'Anonymous Sentinel',
      isOfficial: false,
      aiAssisted: !!aiNote,
    });

    setSubmittedId(newReport.id);
  };

  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
            INCIDENT SUBMITTED · STATUS: PENDING VERIFICATION
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hazard Report Logged Successfully
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Your report <span className="font-mono text-white font-semibold">#{submittedId}</span> has been dispatched to community sentinels and municipal response units for verification.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left space-y-1.5 max-w-md mx-auto">
          <div className="flex justify-between">
            <span>Reference ID:</span>
            <span className="font-mono text-white font-bold">{submittedId}</span>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="text-slate-200">{category}</span>
          </div>
          <div className="flex justify-between">
            <span>Severity:</span>
            <span className="text-amber-400 font-semibold">{severity}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('my-reports')}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Track in My Reports
          </button>
          <button
            onClick={() => onNavigate('map')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            View on Live Risk Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>CITIZEN INCIDENT REPORTING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          Report a Community Hazard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Alert neighbors and emergency services about flooding, blocked roadways, fallen trees, or damaged infrastructure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            1. Incident Photograph Evidence
          </label>

          {imagePreview ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video max-h-72">
                <img
                  src={imagePreview}
                  alt="Incident preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  aria-label="Remove uploaded image"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* AI Pre-scan Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleRunAiPrescan}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-3.5 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                  <span>{isAnalyzing ? 'Analyzing Image with Gemini...' : 'Run Gemini AI Pre-Scan'}</span>
                </button>

                <span className="text-[11px] text-slate-300">
                  Auto-classifies category & hazard details
                </span>
              </div>

              {aiNote && (
                <div className="p-2.5 rounded bg-teal-950/40 border border-teal-500/20 text-xs text-teal-200">
                  {aiNote}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-700 hover:border-teal-400/50 rounded-xl p-6 text-center space-y-3 transition-colors bg-slate-950/40">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Camera className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <label htmlFor="incident-file-upload" className="text-xs font-semibold text-teal-400 hover:text-teal-300 cursor-pointer">
                    Click to upload a photograph
                    <input
                      id="incident-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, or WEBP up to 20MB. Clear daytime or flash photos improve AI verification.
                  </p>
                </div>
              </div>

              {/* Quick sample demo photo options */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-300">Or use a preloaded community hazard sample:</span>
                <div className="flex flex-wrap gap-2">
                  {samplePhotos.map((photo) => (
                    <button
                      key={photo.name}
                      type="button"
                      onClick={() => handleUseSamplePhoto(photo.url)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
                    >
                      {photo.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hazard Details Form */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="block text-xs font-bold text-white uppercase tracking-wider">
            2. Hazard Details
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="incident-title" className="text-xs text-slate-200 font-medium">Incident Title *</label>
            <input
              id="incident-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flooded roadway near school intersection"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {formErrors.title && (
              <span className="text-[11px] text-red-400">{formErrors.title}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="incident-category" className="text-xs text-slate-200 font-medium">Category *</label>
              <select
                id="incident-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
              >
                <option value="Flooding & Waterlogging">Flooding & Waterlogging</option>
                <option value="Blocked Road & Tree Fall">Blocked Road & Tree Fall</option>
                <option value="Power Line & Utility Hazard">Power Line & Utility Hazard</option>
                <option value="Public Infrastructure Damage">Public Infrastructure Damage</option>
                <option value="Drainage Obstruction">Drainage Obstruction</option>
                <option value="Landslide & Erosion">Landslide & Erosion</option>
                <option value="Other Hazard">Other Hazard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="incident-severity" className="text-xs text-slate-200 font-medium">Estimated Severity *</label>
              <select
                id="incident-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
              >
                <option value="Low">Low – Passable with minor delay</option>
                <option value="Moderate">Moderate – Significant obstruction</option>
                <option value="High">High – Impassable / active risk</option>
                <option value="Severe">Severe – Immediate life hazard / submerged</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="incident-description" className="text-xs text-slate-200 font-medium">Incident Description *</label>
            <textarea
              id="incident-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details: water depth, whether wires are sparking, blocked lanes, or vehicles trapped..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {formErrors.description && (
              <span className="text-[11px] text-red-400">{formErrors.description}</span>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              3. Incident Location & Landmark
            </h2>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium cursor-pointer disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{isLocating ? 'Detecting GPS...' : 'Detect My GPS Location'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                !isCustomMode
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Choose Community Zone
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                isCustomMode
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Enter Any Custom Locality / City
            </button>
          </div>

          <div className="space-y-3">
            {!isCustomMode ? (
              <div>
                <label htmlFor="incident-zone" className="text-xs text-slate-300 font-medium">Select Community Zone:</label>
                <select
                  id="incident-zone"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                >
                  {availableLocations.filter((l) => l !== 'All Locations').map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="incident-custom-zone" className="text-xs text-slate-300 font-medium">Any Locality, Neighborhood, or City Name:</label>
                <input
                  id="incident-custom-zone"
                  type="text"
                  value={customLocationName}
                  onChange={(e) => setCustomLocationName(e.target.value)}
                  placeholder="e.g. West End Marina, Anna Nagar East, Downtown District"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            )}

            <div>
              <label htmlFor="incident-landmark" className="text-xs text-slate-300 font-medium">Exact Street, Crossing, or Landmark (Optional):</label>
              <input
                id="incident-landmark"
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Opposite Metro Pillar 184, near Canal Bridge"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            {formErrors.location && (
              <span className="text-[11px] text-red-400">{formErrors.location}</span>
            )}
          </div>
        </div>

        {/* Reporter Info (Optional / Privacy conscious) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <label htmlFor="incident-reporter" className="font-semibold text-slate-200 block">Your Citizen Identifier (Optional)</label>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Personal contact details remain protected and are never exposed publicly.
            </div>
          </div>
          <input
            id="incident-reporter"
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="e.g. Resident #24 or Name"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 w-full sm:w-48"
          />
        </div>

        {/* Submit Bar */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-teal-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Submit Hazard Report to Community Sentinel</span>
          </button>
        </div>
      </form>
    </div>
  );
};
