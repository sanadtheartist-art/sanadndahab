import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SiteProvider, useSiteSettings } from './lib/SiteContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Inner component to consume useSiteSettings context
const AppContent = () => {
  const { loading } = useSiteSettings();

  // Premium Global Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999] text-white">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-accent rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm tracking-[0.2em] uppercase text-dim animate-pulse">Loading Experience</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <SiteProvider>
      <AppContent />
    </SiteProvider>
  );
}

export default App;
