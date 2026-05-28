import React from 'react';
import { useSiteSettings } from '../lib/SiteContext';
import ResponsiveImage from './ResponsiveImage';

const AboutSection = ({ sectionId = 'about' }) => {
  const { settings, loading } = useSiteSettings();

  if (loading || !settings) return null;

  const aboutLabel = settings.aboutLabel || 'About';
  const aboutTitle = settings.aboutTitle || 'The Artist';
  const aboutLead = settings.aboutLead || '';
  const aboutText = settings.aboutText || '';
  
  // Logic to handle multiple images or single image like the original vanilla JS
  const images = Array.isArray(settings.aboutImages) && settings.aboutImages.length 
    ? settings.aboutImages 
    : (settings.aboutImage ? [settings.aboutImage] : []);
  
  const img = images.length > 0 ? images[0] : ''; // Just taking the first one for React to avoid layout shifts from random rendering

  // Upgrade image URL logic
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

  return (
    <section id={sectionId} className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24 min-h-[50vh]">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {img && (
          <div className="w-full">
            <ResponsiveImage
              src={upgradeImageUrl(img)}
              alt={settings.artistName || 'Artist'}
              className="w-full h-auto rounded-xl object-cover aspect-[4/5] shadow-2xl"
              breakpoints={[360,640,900,1200]}
            />
          </div>
        )}
        
        <div className="flex flex-col justify-center animate-fade-up">
          <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-3 md:mb-4">{aboutLabel}</p>
          <h2 className="font-display text-3xl md:text-5xl mb-4 md:mb-6">{aboutTitle}</h2>
          
          {aboutLead && (
            <p className="text-lg md:text-2xl leading-relaxed mb-6 md:mb-8 text-white">
              {aboutLead}
            </p>
          )}
          
          {aboutText && (
            <div 
              className="text-dim text-lg leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: aboutText.replace(/\n/g, '<br>') }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
