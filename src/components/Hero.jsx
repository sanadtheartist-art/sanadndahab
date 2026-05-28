import React, { useState, useEffect, useRef } from 'react';
import { useSiteSettings } from '../lib/SiteContext';

function getPageSections(d) {
  if (d.pageSections && d.pageSections.length) {
    return [...d.pageSections]
      .map((s, i) => ({ ...s, order: s.order ?? i }))
      .sort((a, b) => a.order - b.order);
  }
  const nav = d.navVisibility || {};
  return [
    { id: 'about', type: 'about', order: 0, enabled: nav.about !== false, showInNav: nav.about !== false, navLabel: 'About', showHeroButton: false },
    { id: 'works', type: 'works', order: 1, enabled: true, showInNav: nav.works !== false, navLabel: 'Works', showHeroButton: true, heroButtonText: d.heroCtaText || 'View Works', heroButtonStyle: 'primary' },
    { id: 'contact', type: 'contact', order: 2, enabled: true, showInNav: nav.contact !== false, navLabel: 'Contact', showHeroButton: d.showHeroContact !== false, heroButtonText: 'Get in Touch', heroButtonStyle: 'ghost' }
  ];
}

const upgradeImageUrl = (url) => {
  if (!url) return '';
  let u = url.trim();
  if (u.startsWith('data:')) return u;
  if (u.includes('cloudinary.com')) {
    return u.replace(/\/upload\/(?:f_[^/]+,q_[^/]+,w_\d+,c_limit\/)?/, '/upload/f_auto,q_55,w_1400,c_limit/');
  }
  if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
    let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
    if (!out.endsWith('=s0')) out += '=s0';
    return out;
  }
  return u;
};

const MARQUEE_TEXT = 'MURAL · DAHAB · SINAI · STREET ART · جداريات · دهب · EGYPT · فن الجدران · CUSTOM MURALS · سيناء ·';

const HeroBackground = ({ images }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 7000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {images.map((url, i) => (
        <div
          key={url + i}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${upgradeImageUrl(url)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === idx ? 0.32 : 0,
            transition: 'opacity 1.8s ease',
            transform: i === idx ? 'scale(1.04)' : 'scale(1)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '1.8s',
          }}
        />
      ))}
      {/* Dark vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(7,7,10,0.7) 100%)',
        zIndex: 1,
      }} />
      {/* Bottom fade to bg */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
        zIndex: 2,
      }} />
    </div>
  );
};

const Hero = () => {
  const { settings, loading } = useSiteSettings();
  const titleRef = useRef(null);

  // Only use images (no YouTube iframes for speed)
  const images = !loading && settings
    ? Array.from(new Set([
        ...(settings.heroImages || []),
        settings.heroImage,
      ].filter(Boolean)))
    : [];

  const eyebrow = settings?.heroEyebrow || 'Mural Artist';
  const title   = settings?.heroTitle   || 'Painter of the Peninsula';
  const sub     = settings?.heroSubtitle|| 'Breathing life into walls through color, culture, and desert soul.';

  const heroBtns = settings
    ? (() => {
        const sections = getPageSections(settings);
        const btns = sections.filter(s => s.enabled !== false && s.showHeroButton);
        if (btns.length) return btns;
        const fallback = [{ id: 'works', heroButtonText: settings.heroCtaText || 'View Works', heroButtonStyle: 'primary' }];
        if (settings.emailLink && settings.showHeroContact !== false) {
          fallback.push({ id: 'contact', heroButtonText: 'Get in Touch', heroButtonStyle: 'ghost' });
        }
        return fallback;
      })()
    : [{ id: 'works', heroButtonText: 'View Portfolio', heroButtonStyle: 'primary' }];

  return (
    <section
      id="hero"
      aria-label="Introduction"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: '6rem',
        paddingBottom: '6rem',
      }}
    >
      <HeroBackground images={images} />

      {/* Subtle desert geometry lines */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(196,165,116,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(196,165,116,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
      }} />

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '900px',
        textAlign: 'center',
        padding: '0 1.5rem',
      }}>
        {/* Eyebrow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}>
          <div style={{ height: '1px', width: '2.5rem', background: 'var(--accent)', opacity: 0.6 }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>
            {eyebrow}
          </span>
          <div style={{ height: '1px', width: '2.5rem', background: 'var(--accent)', opacity: 0.6 }} />
        </div>

        {/* Title — word-by-word staggered reveal */}
        <h1
          ref={titleRef}
          id="hero-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 9vw, 7.5rem)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0 0.28em',
            overflow: 'hidden',
          }}
          aria-label={title.replace(/<[^>]*>/g, '')}
        >
          {title.replace(/<[^>]*>/g, '').split(' ').map((word, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                lineHeight: 1.12,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  animation: `wordReveal 0.85s ${0.05 + i * 0.12}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          id="hero-sub"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.95rem, 2.2vw, 1.2rem)',
            color: 'var(--dim)',
            maxWidth: '560px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            animation: 'fadeUp 1s 0.25s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {sub}
        </p>

        {/* CTA buttons */}
        <div
          id="hero-actions"
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeUp 1s 0.4s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {heroBtns.map((s, i) => {
            const text  = s.heroButtonText || s.navLabel || 'Explore';
            const style = s.heroButtonStyle || (i === 0 ? 'primary' : 'ghost');
            return (
              <a
                key={s.id || i}
                href={`#${s.id}`}
                className={style === 'ghost' ? 'btn-ghost' : 'btn-primary'}
              >
                {text}
                {style === 'primary' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Marquee strip */}
      <div style={{
        position: 'absolute',
        bottom: '4.5rem',
        left: 0, right: 0,
        zIndex: 10,
        overflow: 'hidden',
        borderTop:    '1px solid rgba(196,165,116,0.1)',
        borderBottom: '1px solid rgba(196,165,116,0.1)',
        padding: '0.6rem 0',
        pointerEvents: 'none',
      }}>
        <div className="marquee-track" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          color: 'var(--dim)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          {/* Repeated twice for seamless loop */}
          {[0,1].map(n => (
            <span key={n} style={{ marginRight: '4rem' }}>
              {MARQUEE_TEXT}&nbsp;&nbsp;&nbsp;{MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '1.5rem', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        opacity: 0.4,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{ width: '1px', height: '28px', background: 'linear-gradient(to bottom, var(--dim), transparent)' }} />
      </div>
    </section>
  );
};

export default Hero;
