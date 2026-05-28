import React, { useEffect } from 'react';
import { useSiteSettings } from '../lib/SiteContext';

const SEO = () => {
  const { settings, loading } = useSiteSettings();

  useEffect(() => {
    if (loading || !settings) return;

    // Title
    const title = settings.seoTitle || settings.artistName || 'Sanad in Dahab | Mural Artist & Street Art in Sinai Egypt';
    document.title = title;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = settings.seoDescription || settings.aboutLead || 'Sanad\'s custom graffiti and wall paintings across Dahab, Nuweiba, and Sinai. Explore vibrant street art combining Egyptian culture with modern design.';

    // Keywords
    if (settings.metaKeywords) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.name = 'keywords';
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.content = settings.metaKeywords;
    }

    // Favicon and Apple Touch Icon
    if (settings.faviconUrl) {
      let icon = document.querySelector('link[rel="icon"]');
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
      }
      
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }

      // upgrade URL
      let fv = settings.faviconUrl;
      if (/googleusercontent\.com|ggpht\.com/i.test(fv)) {
        fv = fv.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '') + '=s128';
      }
      icon.href = fv;
      
      let appleFv = settings.faviconUrl;
      if (/googleusercontent\.com|ggpht\.com/i.test(appleFv)) {
        appleFv = appleFv.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '') + '=s180';
      }
      appleIcon.href = appleFv;
    }

    // OG Image
    if (settings.ogImage) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      
      let ogv = settings.ogImage;
      if (/googleusercontent\.com|ggpht\.com/i.test(ogv)) {
        ogv = ogv.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '') + '=s1200';
      }
      ogImage.content = ogv;
    }

    // Open Graph title & description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = settings.seoTitle || title;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = settings.seoDescription || metaDesc.content || '';

    // Twitter card
    let twCard = document.querySelector('meta[name="twitter:card"]');
    if (!twCard) {
      twCard = document.createElement('meta');
      twCard.name = 'twitter:card';
      document.head.appendChild(twCard);
    }
    twCard.content = settings.ogImage ? 'summary_large_image' : 'summary';

    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twTitle) {
      twTitle = document.createElement('meta');
      twTitle.name = 'twitter:title';
      document.head.appendChild(twTitle);
    }
    twTitle.content = settings.seoTitle || title;

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twDesc) {
      twDesc = document.createElement('meta');
      twDesc.name = 'twitter:description';
      document.head.appendChild(twDesc);
    }
    twDesc.content = settings.seoDescription || metaDesc.content || '';

    // Canonical
    if (settings.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      // Ensure we use the base non-www URL + the current path
      const baseUrl = settings.canonicalUrl.replace(/\/$/, ''); // Remove trailing slash
      canonical.href = `${baseUrl}${window.location.pathname}`;
    }

    // Basic structured data (JSON-LD)
    let ld = document.getElementById('site-json-ld');
    const baseUrl = settings.canonicalUrl ? settings.canonicalUrl.replace(/\/$/, '') : window.location.origin;
    const currentUrl = `${baseUrl}${window.location.pathname}`;
    const json = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "name": settings.artistName || 'Sanad',
          "description": settings.seoDescription || metaDesc.content || '',
          "url": currentUrl,
        },
        {
          "@type": "LocalBusiness",
          "name": settings.artistName || "Sanad in Dahab Murals",
          "image": settings.ogImage || `${baseUrl}/favicon.svg`,
          "description": settings.seoDescription || metaDesc.content || '',
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dahab",
            "addressRegion": "South Sinai Governorate",
            "addressCountry": "EG"
          },
          "url": currentUrl,
          "telephone": "+201000000000",
          "priceRange": "$$"
        }
      ]
    };
    if (!ld) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.id = 'site-json-ld';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify(json);

  }, [settings, loading]);

  return null;
};

export default SEO;
