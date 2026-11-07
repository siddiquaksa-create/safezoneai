import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { IncidentReport, OfficialAlert, IncidentStatus, SeverityLevel, LocationRiskProfile } from '../types';
import { INITIAL_INCIDENTS, INITIAL_ALERTS, SAMPLE_LOCATIONS } from '../data/sampleData';
import {
  COMPREHENSIVE_COMMUNITY_LOCATIONS,
  geocodeAnyLocation,
  filterIncidentsByQuery,
} from '../services/locationService';

interface IncidentContextType {
  incidents: IncidentReport[];
  alerts: OfficialAlert[];
  userReportIds: string[];
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableLocations: string[];
  addCustomLocation: (name: string) => void;
  searchedLocationProfile: LocationRiskProfile;
  clearSearch: () => void;
  filterIncidents: (categoryFilter?: string, officialOnly?: boolean) => IncidentReport[];
  addIncident: (report: Omit<IncidentReport, 'id' | 'reportedAt' | 'updatedAt' | 'verificationVotes' | 'status' | 'isSampleData'>) => IncidentReport;
  updateIncidentStatus: (id: string, status: IncidentStatus, adminNotes?: string) => void;
  verifyIncident: (id: string) => void;
  rejectIncident: (id: string, reason: string) => void;
  markDuplicate: (id: string, parentId: string) => void;
  broadcastAlert: (alert: Omit<OfficialAlert, 'id' | 'issuedAt' | 'isSampleData'>) => void;
  deleteUserReport: (id: string) => void;
  resetToDefaultData: () => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

const STORAGE_INCIDENTS_KEY = 'safezone_incidents_v1';
const STORAGE_USER_REPORTS_KEY = 'safezone_user_reports_v1';
const STORAGE_ALERTS_KEY = 'safezone_alerts_v1';
const STORAGE_CUSTOM_LOCATIONS_KEY = 'safezone_custom_locations_v1';

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_INCIDENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored incidents:', e);
    }
    return INITIAL_INCIDENTS;
  });

  const [alerts, setAlerts] = useState<OfficialAlert[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ALERTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored alerts:', e);
    }
    return INITIAL_ALERTS;
  });

  const [userReportIds, setUserReportIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_REPORTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse user report IDs:', e);
    }
    return ['INC-2026-101', 'INC-2026-088']; // Pre-populate 2 reports for immediate citizen tracking experience
  });

  const [customLocations, setCustomLocations] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_LOCATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored custom locations:', e);
    }
    return [];
  });

  const [selectedLocation, setSelectedLocationState] = useState<string>('All Locations');
  const [searchQuery, setSearchQueryState] = useState<string>('');

  // Combined master locations list
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    SAMPLE_LOCATIONS.forEach((l) => set.add(l));
    COMPREHENSIVE_COMMUNITY_LOCATIONS.forEach((l) => set.add(l.name));
    customLocations.forEach((l) => set.add(l));
    return Array.from(set);
  }, [customLocations]);

  const addCustomLocation = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === 'All Locations') return;
    if (!availableLocations.some((loc) => loc.toLowerCase() === trimmed.toLowerCase())) {
      setCustomLocations((prev) => {
        const next = [trimmed, ...prev];
        localStorage.setItem(STORAGE_CUSTOM_LOCATIONS_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const setSelectedLocation = (loc: string) => {
    const trimmed = loc.trim();
    setSelectedLocationState(trimmed || 'All Locations');
    if (trimmed && trimmed !== 'All Locations') {
      setSearchQueryState(trimmed);
      addCustomLocation(trimmed);
    } else {
      setSearchQueryState('');
    }
  };

  const setSearchQuery = (query: string) => {
    const trimmed = query.trim();
    setSearchQueryState(trimmed);
    if (trimmed && trimmed.toLowerCase() !== 'all' && trimmed.toLowerCase() !== 'all locations') {
      setSelectedLocationState(trimmed);
      addCustomLocation(trimmed);
    } else {
      setSelectedLocationState('All Locations');
    }
  };

  const clearSearch = () => {
    setSelectedLocationState('All Locations');
    setSearchQueryState('');
  };

  // Dynamically evaluated location risk profile for the currently searched location
  const searchedLocationProfile = useMemo(() => {
    const target = searchQuery || (selectedLocation !== 'All Locations' ? selectedLocation : 'Metro Central Basin');
    return geocodeAnyLocation(target, incidents, alerts);
  }, [searchQuery, selectedLocation, incidents, alerts]);

  // Universal filter function for any page
  const filterIncidents = (categoryFilter = 'All', officialOnly = false): IncidentReport[] => {
    const activeQuery = searchQuery || (selectedLocation !== 'All Locations' ? selectedLocation : '');
    return filterIncidentsByQuery(incidents, activeQuery, categoryFilter, officialOnly);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_USER_REPORTS_KEY, JSON.stringify(userReportIds));
  }, [userReportIds]);

  const addIncident = (
    reportData: Omit<IncidentReport, 'id' | 'reportedAt' | 'updatedAt' | 'verificationVotes' | 'status' | 'isSampleData'>
  ): IncidentReport => {
    const newId = `INC-2026-${Math.floor(110 + Math.random() * 890)}`;
    const newReport: IncidentReport = {
      ...reportData,
      id: newId,
      status: 'Pending Verification',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verificationVotes: 1,
      isSampleData: false, // User reports are marked as actual user-submitted entries
    };

    if (reportData.locationName) {
      addCustomLocation(reportData.locationName);
    }

    setIncidents((prev) => [newReport, ...prev]);
    setUserReportIds((prev) => [newId, ...prev]);
    return newReport;
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus, adminNotes?: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status,
              updatedAt: new Date().toISOString(),
              adminNotes: adminNotes !== undefined ? adminNotes : inc.adminNotes,
            }
          : inc
      )
    );
  };

  const verifyIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'Verified',
              verificationVotes: inc.verificationVotes + 1,
              updatedAt: new Date().toISOString(),
            }
          : inc
      )
    );
  };

  const rejectIncident = (id: string, reason: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'Rejected',
              adminNotes: `Rejected by moderator: ${reason}`,
              updatedAt: new Date().toISOString(),
            }
          : inc
      )
    );
  };

  const markDuplicate = (id: string, parentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'Rejected',
              duplicateOf: parentId,
              adminNotes: `Marked as duplicate of report ${parentId}`,
              updatedAt: new Date().toISOString(),
            }
          : inc
      )
    );
  };

  const broadcastAlert = (alertData: Omit<OfficialAlert, 'id' | 'issuedAt' | 'isSampleData'>) => {
    const newAlert: OfficialAlert = {
      ...alertData,
      id: `OFF-ALERT-2026-${Math.floor(100 + Math.random() * 900)}`,
      issuedAt: new Date().toISOString(),
      isSampleData: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const deleteUserReport = (id: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    setUserReportIds((prev) => prev.filter((reportId) => reportId !== id));
  };

  const resetToDefaultData = () => {
    setIncidents(INITIAL_INCIDENTS);
    setAlerts(INITIAL_ALERTS);
    setUserReportIds(['INC-2026-101', 'INC-2026-088']);
    setCustomLocations([]);
    setSelectedLocationState('All Locations');
    setSearchQueryState('');
    localStorage.removeItem(STORAGE_INCIDENTS_KEY);
    localStorage.removeItem(STORAGE_ALERTS_KEY);
    localStorage.removeItem(STORAGE_USER_REPORTS_KEY);
    localStorage.removeItem(STORAGE_CUSTOM_LOCATIONS_KEY);
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        alerts,
        userReportIds,
        selectedLocation,
        setSelectedLocation,
        searchQuery,
        setSearchQuery,
        availableLocations,
        addCustomLocation,
        searchedLocationProfile,
        clearSearch,
        filterIncidents,
        addIncident,
        updateIncidentStatus,
        verifyIncident,
        rejectIncident,
        markDuplicate,
        broadcastAlert,
        deleteUserReport,
        resetToDefaultData,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
