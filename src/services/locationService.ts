import { IncidentReport, OfficialAlert, EmergencyFacility, LocationRiskProfile } from '../types';
import { EMERGENCY_FACILITIES } from '../data/sampleData';

export interface LocationGeoData {
  name: string;
  lat: number;
  lng: number;
  zoneType: 'canal' | 'basin' | 'residential' | 'commercial' | 'transit' | 'coastal' | 'industrial';
  floodSusceptibility: 'High' | 'Moderate' | 'Low';
}

export const COMPREHENSIVE_COMMUNITY_LOCATIONS: LocationGeoData[] = [
  { name: 'North Canal Corridor', lat: 13.0827, lng: 80.2707, zoneType: 'canal', floodSusceptibility: 'High' },
  { name: 'Metro Basin Sector 4', lat: 13.0915, lng: 80.2821, zoneType: 'basin', floodSusceptibility: 'High' },
  { name: 'Lakeview Bypass', lat: 13.1021, lng: 80.2612, zoneType: 'basin', floodSusceptibility: 'Moderate' },
  { name: 'Old Town Ring Road', lat: 13.0732, lng: 80.2609, zoneType: 'transit', floodSusceptibility: 'Moderate' },
  { name: 'Greenbelt Ridge Avenue', lat: 13.0512, lng: 80.2319, zoneType: 'residential', floodSusceptibility: 'Low' },
  { name: 'Delta Causeway Basin', lat: 13.0450, lng: 80.2450, zoneType: 'canal', floodSusceptibility: 'High' },
  { name: 'Industrial Harbour West', lat: 13.0980, lng: 80.2950, zoneType: 'coastal', floodSusceptibility: 'High' },
  { name: 'Eastern Expressway Underpass', lat: 13.0645, lng: 80.2452, zoneType: 'transit', floodSusceptibility: 'High' },
  { name: 'Anna Nagar Central Avenue', lat: 13.0850, lng: 80.2180, zoneType: 'commercial', floodSusceptibility: 'Moderate' },
  { name: 'Adyar Riverbank Environs', lat: 13.0420, lng: 80.2520, zoneType: 'canal', floodSusceptibility: 'High' },
  { name: 'Velachery Lowland Sump', lat: 13.0480, lng: 80.2650, zoneType: 'basin', floodSusceptibility: 'High' },
  { name: 'Marina Beach Coastal Strip', lat: 13.0580, lng: 80.2860, zoneType: 'coastal', floodSusceptibility: 'Moderate' },
  { name: 'T. Nagar Commercial Quadrant', lat: 13.0610, lng: 80.2400, zoneType: 'commercial', floodSusceptibility: 'Moderate' },
  { name: 'Koyambedu Transit Terminal', lat: 13.0760, lng: 80.2220, zoneType: 'transit', floodSusceptibility: 'Moderate' },
  { name: 'Mylapore Cultural Heritage Ward', lat: 13.0520, lng: 80.2720, zoneType: 'residential', floodSusceptibility: 'Low' },
  { name: 'Central Railway Junction Area', lat: 13.0830, lng: 80.2780, zoneType: 'transit', floodSusceptibility: 'Moderate' },
];

/**
 * Deterministically generates coordinate mapping and hazard intelligence
 * for ANY location name entered by the user (local, custom, or global).
 */
export function geocodeAnyLocation(
  query: string,
  existingIncidents: IncidentReport[] = [],
  activeAlerts: OfficialAlert[] = [],
  facilities: EmergencyFacility[] = EMERGENCY_FACILITIES
): LocationRiskProfile {
  const normalized = query.trim();
  const lower = normalized.toLowerCase();

  // 1. Check if exact or partial match in comprehensive community locations
  const known = COMPREHENSIVE_COMMUNITY_LOCATIONS.find(
    (loc) => loc.name.toLowerCase() === lower || loc.name.toLowerCase().includes(lower)
  );

  let lat: number;
  let lng: number;
  let isCustom = false;

  if (known) {
    lat = known.lat;
    lng = known.lng;
  } else {
    // Generate deterministic coordinate in metropolitan viewport bounds:
    // lat: 13.045 to 13.105, lng: 80.225 to 80.295
    isCustom = true;
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash << 5) - hash + normalized.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    const latSpan = 13.105 - 13.045;
    const lngSpan = 80.295 - 80.225;

    lat = Number((13.045 + (positiveHash % 1000) * (latSpan / 1000)).toFixed(4));
    lng = Number((80.225 + ((positiveHash >> 3) % 1000) * (lngSpan / 1000)).toFixed(4));
  }

  // 2. Count active matching incidents
  const matchingIncidents = existingIncidents.filter((inc) => {
    return (
      inc.locationName.toLowerCase().includes(lower) ||
      inc.title.toLowerCase().includes(lower) ||
      inc.description.toLowerCase().includes(lower)
    );
  });

  // 3. Count matching or nearby official alerts
  const matchingAlerts = activeAlerts.filter((alert) => {
    return (
      alert.affectedZones.some((z) => z.toLowerCase().includes(lower)) ||
      alert.headline.toLowerCase().includes(lower)
    );
  });

  // 4. Find closest emergency facility
  let nearestFacility: EmergencyFacility | undefined;
  let minDistance = Infinity;

  facilities.forEach((fac) => {
    const dist = calculateDistanceKm(lat, lng, fac.coordinates.lat, fac.coordinates.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestFacility = fac;
    }
  });

  // 5. Compute contextual risk level
  let riskLevel: LocationRiskProfile['riskLevel'] = 'Low';
  let weatherSummary = 'Normal ambient conditions. Standard municipal drainage active.';

  if (matchingAlerts.some((a) => a.severity === 'Warning' || a.severity === 'Emergency')) {
    riskLevel = 'Severe';
    weatherSummary = 'Official Extreme Weather Hazard Alert in effect. High convective rainfall & inundation risk.';
  } else if (matchingIncidents.some((i) => i.severity === 'Severe' || i.severity === 'High')) {
    riskLevel = 'High';
    weatherSummary = 'Active high-severity hazards reported in this zone. Transit disruptions and waterlogging likely.';
  } else if (matchingAlerts.length > 0 || matchingIncidents.length > 0) {
    riskLevel = 'Moderate';
    weatherSummary = 'Active public safety advisory. Minor road blockages or localized ponding under monitoring.';
  } else if (known && known.floodSusceptibility === 'High') {
    riskLevel = 'Moderate';
    weatherSummary = 'Low-elevation water basin. Vulnerable to fast runoff during sudden squalls.';
  } else {
    riskLevel = isCustom ? 'Low' : 'Minimal';
    weatherSummary = 'No active critical emergency alerts recorded. Route and utilities clear.';
  }

  return {
    name: known ? known.name : normalized,
    lat,
    lng,
    riskLevel,
    weatherSummary,
    activeHazardsCount: matchingIncidents.length,
    matchingAlertsCount: matchingAlerts.length,
    nearestAlertHeadline: matchingAlerts[0]?.headline,
    nearestFacilityName: nearestFacility?.name,
    nearestFacilityDistance: Number(minDistance.toFixed(1)),
    isCustomLocation: isCustom,
  };
}

/**
 * Filter incidents by ANY search keyword (location name, hazard type, category, or description)
 */
export function filterIncidentsByQuery(
  incidents: IncidentReport[],
  query: string,
  categoryFilter = 'All',
  officialOnly = false
): IncidentReport[] {
  const cleanQuery = query.trim().toLowerCase();

  return incidents.filter((inc) => {
    if (officialOnly && !inc.isOfficial) return false;
    if (categoryFilter !== 'All' && inc.category !== categoryFilter) return false;

    if (!cleanQuery || cleanQuery === 'all' || cleanQuery === 'all locations') {
      return true;
    }

    // Match location name
    if (inc.locationName.toLowerCase().includes(cleanQuery)) return true;

    // Match title, description, or category
    if (inc.title.toLowerCase().includes(cleanQuery)) return true;
    if (inc.description.toLowerCase().includes(cleanQuery)) return true;
    if (inc.category.toLowerCase().includes(cleanQuery)) return true;
    if (inc.severity.toLowerCase().includes(cleanQuery)) return true;
    if (inc.id.toLowerCase().includes(cleanQuery)) return true;

    // Common synonyms for disaster queries
    if (cleanQuery.includes('flood') || cleanQuery.includes('water')) {
      if (inc.category === 'Flooding & Waterlogging' || inc.category === 'Drainage Obstruction') return true;
    }
    if (cleanQuery.includes('tree') || cleanQuery.includes('branch') || cleanQuery.includes('road')) {
      if (inc.category === 'Blocked Road & Tree Fall') return true;
    }
    if (cleanQuery.includes('wire') || cleanQuery.includes('power') || cleanQuery.includes('spark') || cleanQuery.includes('electric')) {
      if (inc.category === 'Power Line & Utility Hazard') return true;
    }
    if (cleanQuery.includes('bridge') || cleanQuery.includes('structure') || cleanQuery.includes('pole')) {
      if (inc.category === 'Public Infrastructure Damage') return true;
    }

    return false;
  });
}

/**
 * Approximate distance calculation in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Browser Geolocation Request
 */
export function requestBrowserLocation(): Promise<{ lat: number; lng: number; localityName: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Find closest known community zone
        let closest = COMPREHENSIVE_COMMUNITY_LOCATIONS[0];
        let minDist = Infinity;
        COMPREHENSIVE_COMMUNITY_LOCATIONS.forEach((loc) => {
          const d = calculateDistanceKm(latitude, longitude, loc.lat, loc.lng);
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        });

        resolve({
          lat: latitude,
          lng: longitude,
          localityName: minDist < 15 ? closest.name : `Current Position (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can still search for any location by name.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please enter your location manually.';
        }
        reject(new Error(msg));
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  });
}
