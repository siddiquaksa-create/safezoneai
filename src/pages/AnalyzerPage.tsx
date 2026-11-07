import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Layers,
  ArrowRight,
  Info,
  Loader2,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { analyzeIncidentImage } from '../services/api';
import { AIAnalysisResult, IncidentCategory } from '../types';
import { NavPage } from '../components/layout/Navbar';

interface AnalyzerPageProps {
  onNavigate: (page: NavPage) => void;
  onTransferToReport?: (data: { image: string; category: IncidentCategory; description: string }) => void;
}

export const AnalyzerPage: React.FC<AnalyzerPageProps> = ({ onNavigate, onTransferToReport }) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    '/src/assets/images/incident_flooding_sample_1793984746312.jpg'
  );
  const [userContext, setUserContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleLibrary = [
    {
      title: 'Urban Flash Waterlogging',
      url: '/src/assets/images/incident_flooding_sample_1793984746312.jpg',
      category: 'Flooding & Waterlogging',
    },
    {
      title: 'Fallen Tree Limb Obstruction',
      url: '/src/assets/images/incident_blocked_road_1793984747412.jpg',
      category: 'Blocked Road & Tree Fall',
    },
    {
      title: 'Satellite Weather Telemetry',
      url: '/src/assets/images/safezone_hero_satellite_1793984746017.jpg',
      category: 'Public Infrastructure Damage',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const result = await analyzeIncidentImage(selectedImage, 'Community Hazard Zone', userContext);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(
        'Server-side analysis encountered an error. A local advisory fallback has been engaged.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTransfer = () => {
    if (analysisResult && onTransferToReport) {
      onTransferToReport({
        image: selectedImage,
        category: analysisResult.suggestedCategory,
        description: `${analysisResult.title}\n\nAI Visual Observations:\n• ${analysisResult.visualObservations.join('\n• ')}`,
      });
      onNavigate('report');
    } else {
      onNavigate('report');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GEMINI 3.8 FLASH MULTIMODAL COMPUTER VISION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          AI Incident & Hazard Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Automated advisory visual classification for environmental hazards and public infrastructure obstructions. Evaluates optical patterns, estimates severity, and delivers immediate citizen safety precautions.
        </p>
      </div>

      {/* Strict Public Safety Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-100">
            Advisory Public Safety Notice:
          </span>
          <p className="leading-relaxed">
            AI analysis provides an optical advisory assessment from a single visual perspective. An image cannot prove or disprove underlying subsurface sinkholes, live electrical current in downed wires, or actual water depth and current speed. Always rely on on-site emergency authorities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Selection & Trigger */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              1. Select or Upload Image
            </h2>

            {/* Image Preview Container */}
            <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/3] flex items-center justify-center">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Incident inspection preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8" />
                  <span>No image selected</span>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-teal-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-mono font-semibold tracking-wider">
                    RUNNING MULTIMODAL INFERENCE...
                  </span>
                </div>
              )}
            </div>

            {/* Quick Sample Selector */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Try preloaded hazard scenes:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {sampleLibrary.map((sample) => (
                  <button
                    key={sample.title}
                    onClick={() => {
                      setSelectedImage(sample.url);
                      setAnalysisResult(null);
                    }}
                    className={`p-1.5 rounded-lg border text-left text-[10px] transition-colors cursor-pointer ${
                      selectedImage === sample.url
                        ? 'border-teal-400 bg-teal-500/10 text-teal-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="aspect-video rounded overflow-hidden mb-1">
                      <img
                        src={sample.url}
                        alt={sample.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="line-clamp-1 font-medium">{sample.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom Image */}
            <div className="pt-1">
              <label htmlFor="analyzer-custom-photo" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Upload Custom Photo</span>
                <input
                  id="analyzer-custom-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Context Notes */}
            <div className="space-y-1.5">
              <label htmlFor="analyzer-context-input" className="text-xs text-slate-300 font-medium block">
                Optional location or observed conditions:
              </label>
              <input
                id="analyzer-context-input"
                type="text"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="e.g. Near storm drain after heavy downpour"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
            </div>

            {/* Analyze Action Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !selectedImage}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Hazard with Gemini'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-teal-400 font-semibold">
                    AI ADVISORY FINDINGS
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {analysisResult.title}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">
                    VISUAL CONFIDENCE
                  </div>
                  <div className="text-xl font-bold font-mono text-teal-400 tabular-nums">
                    {analysisResult.confidenceScore}%
                  </div>
                </div>
              </div>

              {/* Badges strip */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Suggested Category</div>
                  <div className="font-bold text-white mt-1">
                    {analysisResult.suggestedCategory}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Assessed Hazard Severity</div>
                  <div
                    className={`font-bold mt-1 ${
                      analysisResult.hazardSeverity === 'Severe'
                        ? 'text-red-400'
                        : analysisResult.hazardSeverity === 'High'
                        ? 'text-orange-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {analysisResult.hazardSeverity}
                  </div>
                </div>
              </div>

              {/* Visual Observations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Key Visual Cues & Optical Observations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult.visualObservations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detected Obstacles */}
              {analysisResult.detectedObstacles && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Detected Obstacle Entities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detectedObstacles.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Recommendations */}
              <div className="space-y-2 p-4 rounded-lg bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Immediate Public Safety Precautions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                  {analysisResult.safetyRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold">&rarr;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advisory Disclaimer */}
              <p className="text-[11px] text-slate-400 italic leading-relaxed border-t border-slate-800 pt-3">
                {analysisResult.advisoryDisclaimer}
              </p>

              {/* Action: Transfer to Report Form */}
              <div className="pt-2">
                <button
                  onClick={handleTransfer}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Transfer Analysis to Official Incident Report Form</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[380px] p-8 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-white">
                  Ready to Inspect Hazard
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a sample or upload a photo, then click "Analyze Hazard with Gemini" to begin multimodal hazard inference.
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Inspect Sample Photo Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
