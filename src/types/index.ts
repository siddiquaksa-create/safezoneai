export type IncidentCategory =
  | 'Flooding & Waterlogging'
  | 'Blocked Road & Tree Fall'
  | 'Power Line & Utility Hazard'
  | 'Public Infrastructure Damage'
  | 'Drainage Obstruction'
  | 'Landslide & Erosion'
  | 'Other Hazard';

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export type IncidentStatus =
  | 'Pending Verification'
  | 'Verified'
  | 'Field Team Dispatched'
  | 'Under Monitoring'
  | 'Resolved'
  | 'Rejected';

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  status: IncidentStatus;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  reportedAt: string;
  updatedAt: string;
  reporterName?: string;
  isOfficial: boolean;
  isSampleData: boolean;
  verificationVotes: number;
  aiAssisted?: boolean;
  aiConfidence?: number;
  duplicateOf?: string;
  adminNotes?: string;
}

export interface OfficialAlert {
  id: string;
  source: string;
  type: string;
  severity: 'Watch' | 'Advisory' | 'Warning' | 'Emergency';
  severityColor: 'teal' | 'amber' | 'orange' | 'rose';
  issuedAt: string;
  validUntil: string;
  affectedZones: string[];
  headline: string;
  instructions: string[];
  isOfficial: boolean;
  isSampleData: boolean;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  category: 'Hospital & Trauma' | 'Fire & Rescue' | 'Flood Relief Camp' | 'Municipal Emergency Cell' | 'Police & Safety';
  address: string;
  zone: string;
  phone: string;
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'Operational 24/7' | 'High Capacity' | 'Special Equipment Ready';
  amenities: string[];
}

export interface AIAnalysisResult {
  suggestedCategory: IncidentCategory;
  hazardSeverity: SeverityLevel;
  title: string;
  visualObservations: string[];
  confidenceScore: number;
  safetyRecommendations: string[];
  detectedObstacles: string[];
  advisoryDisclaimer: string;
  isDemoFallback?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: 'en' | 'ta';
  quickTips?: string[];
}

export interface LocationRiskProfile {
  name: string;
  lat: number;
  lng: number;
  riskLevel: 'Minimal' | 'Low' | 'Moderate' | 'High' | 'Severe';
  weatherSummary: string;
  activeHazardsCount: number;
  matchingAlertsCount: number;
  nearestAlertHeadline?: string;
  nearestFacilityName?: string;
  nearestFacilityDistance?: number;
  isCustomLocation: boolean;
}
