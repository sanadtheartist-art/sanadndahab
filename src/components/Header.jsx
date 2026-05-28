import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../lib/SiteContext';
import { useIsMobile } from '../lib/useIsMobile';

const SECTION_LABELS = { about: 'About', works: 'Works', contact: 'Contact' };

function getNavLinks(d) {
  if (d.pageSections && d.pageSections.length) {
    return [...d.pageSections]
      .map((s, i) => ({ ...s, order: s.order ?? i }))
      .sort((a, b) => a.order - b.order)
      .filter(s => s.showInNav !== false && s.enabled !== false)
      .map(s => ({ id: s.id, label: s.navLabel || SECTION_LABELS[s.type] || s.id }));
  }
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
  const isMobile = useIsMobile();

  const artistName = settings?.artistName || 'SANADNDAHAB';
  const navLinks = settings ? getNavLinks(settings) : [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '0.75rem 1rem' }}
        aria-label="Site header"
      >
        <nav
          id="main-nav"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            height: '3.25rem',
            padding: '0 1.25rem',
            borderRadius: '999px',
            border: '1px solid',
            transition: 'background 0.35s, border-color 0.35s, box-shadow 0.35s',
            background: scrolled ? 'rgba(7,7,10,0.92)' : 'rgba(7,7,10,0.6)',
            borderColor: scrolled ? 'rgba(196,165,116,0.2)' : 'rgba(255,255,255,0.08)',
            boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.5)' : 'none',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          {/* Logo */}
          <a
            href="/"
            id="nav-logo"
            aria-label={`${artistName} home`}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1rem' : '1.25rem',
              fontWeight: 400,
              letterSpacing: '0.05em',
              color: 'var(--text)',
              textDecoration: 'none',
              flexShrink: 0,
              maxWidth: isMobile ? '160px' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {artistName}
          </a>

          {/* Desktop nav links — hidden on mobile */}
          {!isMobile && (
            <div id="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {navLinks.map((link, i) => {
                const isLast = i === navLinks.length - 1;
                return isLast ? (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      padding: '0.45rem 1.1rem',
                      borderRadius: '999px',
                      background: 'var(--accent)',
                      color: '#000',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    data-section-id={link.id}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '999px',
                      color: 'var(--dim)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}

          {/* Hamburger — only on mobile */}
          {isMobile && (
            <button
              id="menu-toggle"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{
                display: 'block', width: 22, height: 1.5,
                background: 'var(--text)',
                transition: 'transform 0.3s, opacity 0.3s',
                transform: mobileOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none',
              }} />
              <span style={{
                display: 'block', width: 22, height: 1.5,
                background: 'var(--text)',
                transition: 'opacity 0.3s',
                opacity: mobileOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block', width: 22, height: 1.5,
                background: 'var(--text)',
                transition: 'transform 0.3s, opacity 0.3s',
                transform: mobileOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none',
              }} />
            </button>
          )}
        </nav>
      </header>

      {/* Full-screen mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 190,
            background: 'rgba(7,7,10,0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {navLinks.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.8rem, 10vw, 4.5rem)',
                fontWeight: 300,
                color: 'var(--text)',
                textDecoration: 'none',
                letterSpacing: '0.02em',
                padding: '0.2rem 0',
                transition: 'color 0.2s',
                animation: `fadeUp 0.5s ${i * 0.08}s both`,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
            >
              {link.label}
            </a>
          ))}
          <div style={{
            marginTop: '2.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--dim)',
            animation: 'fadeUp 0.5s 0.3s both',
          }}>
            DAHAB · SINAI · EGYPT
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
