import React, { useEffect, useRef } from 'react';
import { useSiteSettings } from '../lib/SiteContext';
import AboutSection from './AboutSection';
import PortfolioGallery from './PortfolioGallery';
import ContactSection from './ContactSection';

// ---------- helpers ----------
const upgradeImageUrl = (url) => {
  if (!url) return '';
  const u = url.trim();
  if (u.startsWith('data:')) return u;
  if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
    let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
    if (!out.endsWith('=s0')) out += '=s0';
    return out;
  }
  return u;
};

// Stats count-up animation
function animateStat(el) {
  const raw = el.textContent.trim();
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return;
  const num = parseInt(match[1], 10);
  const suffix = match[2] || '';
  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    const start = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(num * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    obs.disconnect();
  }, { threshold: 0.5 });
  obs.observe(el);
}

// ---------- Stats section ----------
const StatsSection = ({ settings, sec }) => {
  const stats = settings.stats || [];
  if (!stats.length) return null;
  return (
    <div
      id={sec.id || 'stats'}
      className="flex flex-wrap justify-center gap-12 py-16 px-6 max-w-5xl mx-auto"
    >
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <div
            className="text-4xl md:text-5xl font-display text-accent mb-2"
            ref={(el) => { if (el) animateStat(el); }}
          >
            {s.value || '—'}
          </div>
          <div className="text-sm tracking-widest uppercase text-dim">{s.label || ''}</div>
        </div>
      ))}
    </div>
  );
};

// ---------- Custom code block (shadow-DOM) ----------
const CustomCodeBlock = ({ sec }) => {
  const hostRef = useRef(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = '';
    const root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    if (sec.customCss) {
      const style = document.createElement('style');
      style.textContent = sec.customCss;
      root.appendChild(style);
    }
    if (sec.customHtml) {
      const wrap = document.createElement('div');
      wrap.className = 'custom-code-root';
      wrap.innerHTML = sec.customHtml;
      root.appendChild(wrap);
    }
    if (sec.customJs) {
      const script = document.createElement('script');
      script.textContent = `try {\n${sec.customJs}\n} catch(e){ console.error('Custom block JS:', e); }`;
      root.appendChild(script);
    }
  }, [sec]);

  return <div ref={hostRef} className="custom-code-host w-full" />;
};

// ---------- Custom section ----------
const CustomSection = ({ sec }) => {
  const useCode = sec.customUseCode && (sec.customHtml || sec.customCss || sec.customJs);

  if (useCode) {
    return (
      <section
        id={sec.id}
        className={`py-24 ${sec.customLayout === 'full' ? 'w-full' : 'max-w-7xl mx-auto px-4 md:px-10'}`}
      >
        <CustomCodeBlock sec={sec} />
      </section>
    );
  }

  const img = sec.customImage ? upgradeImageUrl(sec.customImage) : '';
  const isCenter = sec.customLayout === 'center';

  return (
    <section
      id={sec.id}
      className={`py-24 px-4 md:px-10 max-w-7xl mx-auto`}
    >
      <div className={`flex gap-12 items-center ${isCenter ? 'flex-col text-center' : 'flex-col md:flex-row'}`}>
        {img && !isCenter && (
          <div className="md:w-1/2 flex-shrink-0">
            <img src={img} alt={sec.customTitle || ''} loading="lazy" className="w-full rounded-xl object-cover shadow-2xl" />
          </div>
        )}
        <div className={isCenter ? 'max-w-2xl' : 'flex-1'}>
          {sec.customLabel && (
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">{sec.customLabel}</p>
          )}
          {sec.customTitle && (
            <h2 className="font-display text-4xl md:text-5xl mb-6">{sec.customTitle}</h2>
          )}
          {sec.customSubtitle && (
            <p className="text-lg text-dim mb-6">{sec.customSubtitle}</p>
          )}
          {sec.customBody && (
            <div
              className="text-dim leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sec.customBody.replace(/\n/g, '<br>') }}
            />
          )}
        </div>
        {img && isCenter && (
          <img src={img} alt={sec.customTitle || ''} loading="lazy" className="w-full max-w-lg rounded-xl object-cover shadow-2xl" />
        )}
      </div>
    </section>
  );
};

// ---------- Main dynamic renderer ----------
function getPageSections(d) {
  if (d.pageSections && d.pageSections.length) {
    return [...d.pageSections]
      .map((s, i) => ({ ...s, order: s.order ?? i }))
      .sort((a, b) => a.order - b.order);
  }
  const nav = d.navVisibility || {};
  return [
    { id: 'about',   type: 'about',   order: 0, enabled: nav.about !== false },
    { id: 'works',   type: 'works',   order: 1, enabled: true },
    { id: 'contact', type: 'contact', order: 2, enabled: true },
  ];
}

const PageSections = () => {
  const { settings, loading } = useSiteSettings();
  if (loading || !settings) return null;

  const sections = getPageSections(settings).filter(s => s.enabled !== false);

  return (
    <>
      {sections.map((sec) => {
        switch (sec.type) {
          case 'about':
            return <AboutSection key={sec.id} sectionId={sec.id} />;
          case 'works':
            return <PortfolioGallery key={sec.id} sectionId={sec.id} settings={settings} />;
          case 'contact':
            return <ContactSection key={sec.id} sectionId={sec.id} />;
          case 'stats':
            return settings.showStats !== false
              ? <StatsSection key={sec.id} settings={settings} sec={sec} />
              : null;
          case 'custom':
            return <CustomSection key={sec.id} sec={sec} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default PageSections;
