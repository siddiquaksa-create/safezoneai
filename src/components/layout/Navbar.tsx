import React, { useState } from 'react';
import { Shield, PlusCircle, Menu, X, Radio } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export type NavPage =
  | 'home'
  | 'dashboard'
  | 'map'
  | 'report'
  | 'analyzer'
  | 'guide'
  | 'nearby'
  | 'my-reports'
  | 'admin';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userReportIds, alerts } = useIncidents();

  const navLinks: { id: NavPage; label: string; badge?: number }[] = [
    { id: 'home', label: 'Home' },
    { id: 'map', label: 'Live Risk Map' },
    { id: 'dashboard', label: 'Intelligence' },
    { id: 'analyzer', label: 'AI Analyzer' },
    { id: 'guide', label: 'SAFEGuide AI' },
    { id: 'nearby', label: 'Nearby Help' },
    { id: 'my-reports', label: 'My Reports', badge: userReportIds.length },
    { id: 'admin', label: 'Admin Triage' },
  ];

  const handleNavClick = (page: NavPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left cursor-pointer group whitespace-nowrap shrink-0 focus-visible:outline-teal-400 active:scale-95 transition-transform duration-150 select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
            SafeZone <span className="text-teal-400 inline-block transition-transform duration-150 active:scale-95">AI</span>
          </span>
        </button>

        {/* Zone 2: Clean single-line text links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 relative py-1 cursor-pointer text-xs font-semibold uppercase tracking-wider ${
                  isActive
                    ? 'text-teal-400'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {link.label}
                {link.badge ? (
                  <span className="ml-1.5 text-[10px] font-mono text-teal-300 bg-teal-950/80 px-1.5 py-0.2 rounded border border-teal-500/30">
                    {link.badge}
                  </span>
                ) : null}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('report')}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors shadow-sm shadow-teal-500/20 whitespace-nowrap shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Hazard</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {link.badge ? (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                    {link.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
