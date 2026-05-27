import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const SiteContext = createContext();

export const useSiteSettings = () => useContext(SiteContext);

// Mirror the applyTheme() function from the original rfrns/index.html
function applyTheme(theme = {}) {
  const root = document.documentElement;
  if (theme.bg) root.style.setProperty('--bg', theme.bg);
  if (theme.surface) root.style.setProperty('--surface', theme.surface);
  if (theme.surface2) root.style.setProperty('--surface-2', theme.surface2);
  if (theme.text) root.style.setProperty('--text', theme.text);
  if (theme.dim) root.style.setProperty('--dim', theme.dim);
  if (theme.accent) {
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-dim', theme.accent + '26');
  }
  if (theme.fontDisplay) root.style.setProperty('--font-display', `'${theme.fontDisplay}', Georgia, serif`);
  if (theme.fontBody) root.style.setProperty('--font-body', `'${theme.fontBody}', system-ui, sans-serif`);
  if (theme.radius != null) root.style.setProperty('--card-radius', theme.radius + 'px');
  if (theme.baseSize) root.style.setProperty('--base-size', theme.baseSize + 'px');
  if (theme.weightDisplay) root.style.setProperty('--weight-display', theme.weightDisplay);
  if (theme.weightBody) root.style.setProperty('--weight-body', theme.weightBody);
  if (theme.headingSpacing != null) root.style.setProperty('--heading-spacing', theme.headingSpacing + 'px');
  if (theme.bodySpacing != null) root.style.setProperty('--body-spacing', theme.bodySpacing + 'px');

  // Also apply dynamic Google Font if fontDisplay or fontBody changed
  const fonts = [theme.fontDisplay, theme.fontBody].filter(Boolean);
  if (fonts.length) {
    const existingLink = document.getElementById('dynamic-font-link');
    const query = fonts.map(f => `family=${encodeURIComponent(f)}:wght@300;400;500;600`).join('&');
    const href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    if (existingLink) {
      existingLink.href = href;
    } else {
      const link = document.createElement('link');
      link.id = 'dynamic-font-link';
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    // Add preconnect hints for Google Fonts to improve LCP
    if (!document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')) {
      const p = document.createElement('link');
      p.rel = 'preconnect';
      p.href = 'https://fonts.gstatic.com';
      p.crossOrigin = '';
      document.head.appendChild(p);
    }
    if (!document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]')) {
      const p2 = document.createElement('link');
      p2.rel = 'preconnect';
      p2.href = 'https://fonts.googleapis.com';
      document.head.appendChild(p2);
    }
  }

  // heroTint CSS injection
  if (theme.heroTint) {
    let style = document.getElementById('hero-tint-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'hero-tint-style';
      document.head.appendChild(style);
    }
    style.textContent = `.hero-bg::after { background: linear-gradient(to top, ${theme.heroTint} 0%, color-mix(in srgb, ${theme.heroTint}, transparent 28%) 24%, transparent 68%) !important; }`;
  }
}

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "site"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings(data);
        // Apply theme CSS vars whenever settings update
        if (data.theme) {
          applyTheme(data.theme);
        }

        // Dynamically update SEO metadata (Title only)
        const siteTitle = data.artistName || (data.heroTitle ? data.heroTitle.replace(/<[^>]+>/g, '') : 'Artist Portfolio');
        document.title = siteTitle;
        // Preload hero image if supplied to help LCP
        const heroUrl = data.heroImage || data.theme?.heroImage || data.ogImage || data.aboutImage;
        if (heroUrl) {
          const existing = document.querySelector('link[rel="preload"][data-hero-preload]');
          const href = heroUrl.startsWith('http') ? heroUrl : heroUrl;
          if (existing) {
            existing.href = href;
          } else {
            const l = document.createElement('link');
            l.rel = 'preload';
            l.as = 'image';
            l.setAttribute('data-hero-preload', '1');
            l.href = href;
            // Let modern browsers prioritize hero image
            try { l.setAttribute('fetchpriority', 'high'); } catch (e) { }
            document.head.appendChild(l);
          }
        }
      }
      setLoading(false);
    }, (err) => {
      console.error("Failed to load site settings", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SiteContext.Provider value={{ settings, loading }}>
      {children}
    </SiteContext.Provider>
  );
};
