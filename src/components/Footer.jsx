import React from 'react';
import { useSiteSettings } from '../lib/SiteContext';

const Footer = () => {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();
  const name = settings?.artistName || 'SANADNDAHAB';
  const socials = settings?.socialLinks?.filter(s => s.url) || [];

  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '2.5rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        {/* Brand + copyright */}
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: 'var(--text)',
            marginBottom: '0.25rem',
          }}>{name}</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--dim)',
          }}>© {year} · Dahab · Sinai · Egypt</div>
        </div>

        {/* Social links */}
        {socials.length > 0 && (
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--dim)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
