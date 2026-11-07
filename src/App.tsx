/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IncidentProvider } from './context/IncidentContext';
import { Navbar, NavPage } from './components/layout/Navbar';
import { AlertBanner } from './components/common/AlertBanner';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { ReportIncidentPage } from './pages/ReportIncidentPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { SafeGuidePage } from './pages/SafeGuidePage';
import { NearbyHelpPage } from './pages/NearbyHelpPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { AdminPage } from './pages/AdminPage';
import { IncidentCategory } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [preloadedLocation, setPreloadedLocation] = useState<string | undefined>(undefined);
  const [transferData, setTransferData] = useState<{
    image: string;
    category: IncidentCategory;
    description: string;
  } | null>(null);

  const handleNavigate = (page: NavPage, extra?: { preloadedLocation?: string }) => {
    if (extra?.preloadedLocation) {
      setPreloadedLocation(extra.preloadedLocation);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransferToReport = (data: {
    image: string;
    category: IncidentCategory;
    description: string;
  }) => {
    setTransferData(data);
    setCurrentPage('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <IncidentProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-300">
        {/* Skip to Main Content Link for Keyboard Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-400 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-xl focus:ring-2 focus:ring-white focus:outline-none text-xs"
        >
          Skip to main content
        </a>

        {/* Top Emergency Advisory Banner */}
        <AlertBanner onNavigateToAlerts={() => handleNavigate('dashboard')} />

        {/* Top Navigation Bar */}
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Dynamic Page Content */}
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentPage === 'map' && <LiveMapPage onNavigate={handleNavigate} />}
          {currentPage === 'report' && (
            <ReportIncidentPage
              onNavigate={handleNavigate}
              preloadedImage={transferData?.image}
              preloadedCategory={transferData?.category}
              preloadedDescription={transferData?.description}
              preloadedLocation={preloadedLocation}
            />
          )}
          {currentPage === 'analyzer' && (
            <AnalyzerPage
              onNavigate={handleNavigate}
              onTransferToReport={handleTransferToReport}
            />
          )}
          {currentPage === 'guide' && <SafeGuidePage onNavigate={handleNavigate} />}
          {currentPage === 'nearby' && <NearbyHelpPage onNavigate={handleNavigate} />}
          {currentPage === 'my-reports' && <MyReportsPage onNavigate={handleNavigate} />}
          {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </IncidentProvider>
  );
}
