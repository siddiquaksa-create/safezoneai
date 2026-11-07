import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

interface AlertBannerProps {
  onNavigateToAlerts: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ onNavigateToAlerts }) => {
  const { alerts } = useIncidents();
  const [dismissed, setDismissed] = useState(false);

  // Find most critical alert
  const topAlert = alerts.find((a) => a.severity === 'Warning' || a.severity === 'Emergency') || alerts[0];

  if (!topAlert || dismissed) return null;

  return (
    <div className="bg-amber-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 text-xs md:text-sm backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold text-amber-100 uppercase tracking-wider text-[11px] shrink-0">
            {topAlert.source}
          </span>
          <span className="text-amber-400/60 hidden sm:inline">·</span>
          <p className="truncate text-amber-200/90 font-medium">
            {topAlert.headline}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToAlerts}
            className="flex items-center gap-1 font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap text-xs"
          >
            <span>View Response Zone</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss alert banner"
            className="text-amber-400/60 hover:text-amber-200 p-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
