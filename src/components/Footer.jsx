import React from 'react';
import { useSiteSettings } from '../lib/SiteContext';

const Footer = () => {
  const { settings, loading } = useSiteSettings();
  const currentYear = new Date().getFullYear();
  
  const text = settings?.footerText || `© ${currentYear} All rights reserved.`;
  const tagline = settings?.footerTagline || '';

  return (
    <footer className="mt-32 py-10 px-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto text-sm" role="contentinfo">
      <span className="text-dim">{text}</span>
      {tagline && (
        <span className="text-dim text-xs tracking-[0.1em]">{tagline}</span>
      )}
    </footer>
  );
};

export default Footer;
