import React, { useEffect, useRef } from 'react';
import { useSiteSettings } from '../lib/SiteContext';
import { useIsMobile } from '../lib/useIsMobile';

const upgradeImageUrl = (url) => {
  if (!url) return '';
  let u = url.trim();
  if (u.startsWith('data:')) return u;
  if (u.includes('cloudinary.com')) {
    return u.replace(/\/upload\/(?:f_[^/]+,q_[^/]+,w_\d+,c_limit\/)?/, '/upload/f_auto,q_55,w_900,c_limit/');
  }
  if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
    let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
    if (!out.endsWith('=s0')) out += '=s0';
    return out;
  }
  return u;
};

const AboutSection = ({ sectionId = 'about' }) => {
  const { settings, loading } = useSiteSettings();
  const sectionRef = useRef(null);

  const isMobile = useIsMobile();

  // Scroll-reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        entry.target.querySelectorAll('.reveal').forEach(r => {
          if (entry.isIntersecting) r.classList.add('visible');
        });
      }),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  if (loading || !settings) return null;

  const aboutLabel  = settings.aboutLabel  || 'About';
  const aboutTitle  = settings.aboutTitle  || 'The Artist';
  const aboutLead   = settings.aboutLead   || '';
  const aboutText   = settings.aboutText   || '';

  const images = Array.isArray(settings.aboutImages) && settings.aboutImages.length
    ? settings.aboutImages
    : (settings.aboutImage ? [settings.aboutImage] : []);
  const img = images.length > 0 ? images[0] : '';

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(4rem, 8vw, 7rem) 1.5rem',
      }}
    >
      {/* Section label */}
      <div className="reveal" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '4rem',
      }}>
        <div style={{ width: '2rem', height: '1px', background: 'var(--accent)' }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
        }}>
          {aboutLabel}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: img && !isMobile ? '1fr 1fr' : '1fr',
        gap: isMobile ? '2.5rem' : 'clamp(2.5rem, 6vw, 5rem)',
        alignItems: 'center',
      }}>

        {/* Image column */}
        {img && (
          <div className="reveal" style={{ position: 'relative' }}>
            {/* Decorative border offset */}
            <div style={{
              position: 'absolute',
              inset: '-12px',
              border: '1px solid rgba(196,165,116,0.15)',
              borderRadius: '4px',
              zIndex: 0,
              transform: 'rotate(1.5deg)',
            }} />
            <img
              src={upgradeImageUrl(img)}
              alt={settings.artistName || 'Artist'}
              loading="lazy"
              decoding="async"
              className="img-fade"
              onLoad={e => e.currentTarget.classList.add('loaded')}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: 'auto',
                aspectRatio: '4/5',
                objectFit: 'cover',
                borderRadius: '4px',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Text column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2
            className="reveal"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '0.01em',
              marginBottom: '1.75rem',
              color: 'var(--text)',
            }}
          >
            {aboutTitle}
          </h2>

          {aboutLead && (
            <p
              className="reveal reveal-delay-1"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
                lineHeight: 1.7,
                fontWeight: 300,
                color: 'var(--text)',
                marginBottom: '1.5rem',
                borderLeft: '2px solid var(--accent)',
                paddingLeft: '1.25rem',
              }}
            >
              {aboutLead}
            </p>
          )}

          {aboutText && (
            <div
              className="reveal reveal-delay-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                lineHeight: 1.85,
                color: 'var(--dim)',
              }}
              dangerouslySetInnerHTML={{ __html: aboutText.replace(/\n/g, '<br>') }}
            />
          )}

          {/* Geo tag */}
          <div
            className="reveal reveal-delay-3"
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ width: '1.5rem', height: '1px', background: 'var(--dim)' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
            }}>
              Dahab · Sinai · Egypt
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
