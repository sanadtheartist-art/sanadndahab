import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../lib/SiteContext';

const SECTION_LABELS = { about: 'About', works: 'Works', contact: 'Contact', stats: 'Stats' };

function getNavLinks(d) {
  if (d.pageSections && d.pageSections.length) {
    return [...d.pageSections]
      .map((s, i) => ({ ...s, order: s.order ?? i }))
      .sort((a, b) => a.order - b.order)
      .filter(s => s.enabled !== false && s.showInNav !== false && s.type !== 'custom' || (s.enabled !== false && s.showInNav === true))
      .filter(s => s.showInNav !== false && s.enabled !== false)
      .map(s => ({ id: s.id, label: s.navLabel || SECTION_LABELS[s.type] || s.id }));
  }
  // Legacy fallback
  const nav = d.navVisibility || {};
  const links = [];
  if (nav.about !== false) links.push({ id: 'about', label: d.aboutLabel || 'About' });
  if (nav.works !== false) links.push({ id: 'works', label: d.worksLabel || 'Portfolio' });
  if (nav.contact !== false) links.push({ id: 'contact', label: 'Contact' });
  return links;
}

const Header = () => {
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const artistName = settings?.artistName || 'Artist';
  const navLinks = settings ? getNavLinks(settings) : [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => setMobileOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 pt-4 md:px-10 md:pt-4">
      <nav
        id="main-nav"
        className={`flex justify-between items-center max-w-[1180px] mx-auto h-16 px-4 md:px-6 backdrop-blur-xl border rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 border-white/12 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
            : 'bg-black/66 border-white/8'
        }`}
      >
        {/* Logo */}
        <a
          href="/"
          id="nav-logo"
          aria-label={`${artistName} home`}
          className="font-display text-[1.35rem] font-semibold text-white no-underline truncate flex-1"
        >
          {artistName}
        </a>

        {/* Desktop nav links */}
        <div id="nav-links" className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => {
            const isLast = i === navLinks.length - 1;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                data-section-id={link.id}
                className={`px-4 py-2 text-[0.8rem] font-medium tracking-[0.12em] uppercase rounded-full transition-all duration-300 ${
                  isLast
                    ? 'bg-accent text-black px-5'
                    : 'text-dim hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          id="menu-toggle"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 bg-transparent border-none cursor-pointer ml-2"
        >
          <span className={`block w-[22px] h-[1.5px] bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-[22px] h-[1.5px] bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-[22px] h-[1.5px] bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 mx-4 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 py-4 flex flex-col">
          {navLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={handleLinkClick}
              className="px-6 py-3 text-sm font-medium tracking-widest uppercase text-dim hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
