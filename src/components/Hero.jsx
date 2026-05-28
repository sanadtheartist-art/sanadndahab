import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../lib/SiteContext';

// Mirror the getPageSections() logic from rfrns/index.html
function getPageSections(d) {
  if (d.pageSections && d.pageSections.length) {
    return [...d.pageSections]
      .map((s, i) => ({ ...s, order: s.order ?? i }))
      .sort((a, b) => a.order - b.order);
  }
  // Fallback to legacy navVisibility + heroCtaText fields
  const nav = d.navVisibility || {};
  const sections = [
    { id: 'about', type: 'about', order: 0, enabled: nav.about !== false, showInNav: nav.about !== false, navLabel: 'About', showHeroButton: false },
    { id: 'works', type: 'works', order: 1, enabled: true, showInNav: nav.works !== false, navLabel: 'Works', showHeroButton: true, heroButtonText: d.heroCtaText || 'View Works', heroButtonStyle: 'primary' },
    { id: 'contact', type: 'contact', order: 2, enabled: true, showInNav: nav.contact !== false, navLabel: 'Contact', showHeroButton: d.showHeroContact !== false, heroButtonText: 'Get in Touch', heroButtonStyle: 'ghost' }
  ];
  return sections;
}

const upgradeImageUrl = (url) => {
  if (!url) return '';
  let u = url.trim();
  if (u.startsWith('data:')) return u;
  if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
    let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
    if (!out.endsWith('=s0')) out += '=s0';
    return out;
  }
  return u;
};

const isVideo = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(url);
const getYouTubeId = (url) => {
  if (!url) return null;
  const src = url.trim();
  try {
    const u = new URL(src);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0]?.split('?')[0] || null;
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1]?.split('/')[0] || null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1]?.split('/')[0] || null;
      return u.searchParams.get('v');
    }
  } catch { /* ignore */ }
  const m = src.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

// Extracted Background component to handle the slideshow perfectly
const HeroBackground = ({ settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build unique playlist
  const playlist = Array.from(new Set([
    ...(settings?.heroImages || []),
    settings?.heroImage,
    ...(settings?.heroVideos || []),
    settings?.heroVideo
  ].filter(Boolean)));

  const intervalSec = Math.min(60, Math.max(3, Number(settings?.heroSlideInterval) || 6));
  const shuffle = settings?.heroSlideShuffle !== false;

  useEffect(() => {
    if (playlist.length > 0 && shuffle) {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    }
  }, [playlist.length, shuffle]);

  useEffect(() => {
    if (playlist.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        if (shuffle) {
          let next = prev;
          while (next === prev && playlist.length > 1) {
            next = Math.floor(Math.random() * playlist.length);
          }
          return next;
        }
        return (prev + 1) % playlist.length;
      });
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [playlist.length, intervalSec, shuffle]);

  if (playlist.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen overflow-hidden hero-bg">
      {playlist.map((url, index) => {
        const isActive = index === currentIndex;
        const opacityClass = isActive ? 'opacity-100' : 'opacity-0';
        const zIndexClass = isActive ? 'z-10' : 'z-0';
        
        const ytId = getYouTubeId(url);
        const video = isVideo(url);

        return (
          <div 
            key={url + index} 
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${opacityClass} ${zIndexClass}`}
          >
            {ytId ? (
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
                  className="w-[100vw] h-[100vh] min-w-[177.77vh] min-h-[56.25vw] scale-[1.15]"
                  allow="autoplay; encrypted-media"
                  style={{ border: 0 }}
                />
              </div>
            ) : video ? (
              <video 
                src={url} 
                className="w-full h-full object-cover" 
                autoPlay 
                muted 
                loop 
                playsInline 
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${upgradeImageUrl(url)})` }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Hero = () => {
  const { settings, loading } = useSiteSettings();

  const eyebrow = settings?.heroEyebrow || settings?.artistName || 'Mural Artist';
  const title = settings?.heroTitle || 'Transforming Walls<br>Into Stories';
  const sub = settings?.heroSubtitle || 'Large-scale murals and public art';

  // Build hero action buttons from pageSections (same as legacy renderHeroActions)
  const heroBtns = settings
    ? (() => {
        const sections = getPageSections(settings);
        const btns = sections.filter(s => s.enabled !== false && s.showHeroButton);
        if (btns.length) return btns;
        // Absolute fallback
        const fallback = [];
        fallback.push({ id: 'works', heroButtonText: settings.heroCtaText || 'View Works', heroButtonStyle: 'primary', navLabel: 'Works' });
        if (settings.emailLink && settings.showHeroContact !== false) {
          fallback.push({ id: 'contact', heroButtonText: 'Get in Touch', heroButtonStyle: 'ghost', navLabel: 'Contact' });
        }
        return fallback;
      })()
    : [{ id: 'works', heroButtonText: 'View Portfolio', heroButtonStyle: 'primary' }];

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center items-center px-4 md:px-10 py-32 text-center overflow-hidden"
      aria-label="Introduction"
    >
      <HeroBackground settings={settings} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-0 pointer-events-none" />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[100px] z-0 animate-pulse-slow pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent2/20 rounded-full blur-[100px] z-0 animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-fade-up px-2">
        <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4 md:mb-6" id="hero-eyebrow">
          {eyebrow}
        </p>

        <h1
          className="font-display font-normal text-4xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight mb-6 md:mb-8"
          id="hero-title"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        <p className="text-base md:text-xl text-dim max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed" id="hero-sub">
          {sub}
        </p>

        {/* Dynamic CTA buttons from pageSections — mirrors renderHeroActions() */}
        <div className="flex flex-wrap gap-4 justify-center" id="hero-actions">
          {heroBtns.map((s, i) => {
            const text = s.heroButtonText || s.navLabel || 'Explore';
            const style = s.heroButtonStyle || (i === 0 ? 'primary' : 'ghost');
            const href = `#${s.id}`;
            if (style === 'ghost') {
              return (
                <a
                  key={s.id || i}
                  href={href}
                  className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {text}
                </a>
              );
            }
            return (
              <a
                key={s.id || i}
                href={href}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-br from-accent to-accent-hover text-black font-semibold rounded-full shadow-[0_12px_30px_rgba(196,165,116,0.18)] hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(196,165,116,0.25)] transition-all duration-300"
              >
                {text}
              </a>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
        <span className="text-[0.65rem] tracking-[0.2em] uppercase">Scroll</span>
        <span className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
