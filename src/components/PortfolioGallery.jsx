import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectModal from './ProjectModal';

const PortfolioGallery = ({ sectionId = 'works', settings = {} }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const items = [];
      const cats = new Set();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== 'draft') {
          items.push({ id: doc.id, ...data });
          if (data.category) cats.add(data.category);
        }
      });
      
      // Sort based on featured, sortOrder and createdAt
      items.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        const ao = a.sortOrder ?? 99999;
        const bo = b.sortOrder ?? 99999;
        if (ao !== bo) return ao - bo;
        const at = a.createdAt?.seconds ?? 0;
        const bt = b.createdAt?.seconds ?? 0;
        return bt - at;
      });

      setProjects(items);
      setCategories([...cats]);
      setLoading(false);
    }, (err) => {
      console.error("Error loading portfolio:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

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

  if (loading) {
    return (
      <section id={sectionId} className="max-w-7xl mx-auto px-4 md:px-10 py-20 flex flex-col items-center">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">{settings.worksLabel || 'Portfolio'}</p>
        <h2 className="font-display text-4xl md:text-5xl mb-12">{settings.worksTitle || 'Selected Works'}</h2>
        <div className="flex gap-4 animate-pulse">
           <div className="w-64 h-96 bg-white/5 rounded-lg"></div>
           <div className="w-64 h-96 bg-white/5 rounded-lg"></div>
           <div className="w-64 h-96 bg-white/5 rounded-lg"></div>
        </div>
      </section>
    );
  }

  const getOptimizedThumbnailUrl = (url) => {
    if (!url) return '';
    let u = url.trim();
    if (u.includes('cloudinary.com')) {
      // f_auto, q_50 (very fast), w_600
      return u.replace(/\/upload\/(?:f_[^/]+,q_[^/]+,w_\d+,c_limit\/)?/, '/upload/f_auto,q_50,w_600,c_limit/');
    }
    if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
      let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
      if (!out.endsWith('=s600')) out += '=s600';
      return out;
    }
    return u;
  };

  return (
    <section id={sectionId} className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24 min-h-[50vh]">
      <div className="text-center mb-12 md:mb-16 animate-fade-up">
        <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-3 md:mb-4">{settings.worksLabel || 'Portfolio'}</p>
        <h2 className="font-display text-3xl md:text-6xl mb-3 md:mb-4">{settings.worksTitle || 'Selected Works'}</h2>
        {settings.worksSubtitle && (
          <p className="text-base md:text-lg text-dim mt-4 max-w-2xl mx-auto px-2">{settings.worksSubtitle}</p>
        )}
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'all' ? 'bg-accent text-black' : 'bg-white/5 hover:bg-white/10'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === cat ? 'bg-accent text-black' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <p className="text-center text-dim">No works found in this category.</p>
      ) : (
        <div className={
          settings.galleryLayout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' :
          settings.galleryLayout === 'list' ? 'flex flex-col gap-8 max-w-4xl mx-auto' :
          settings.galleryLayout?.startsWith('bento') ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]' :
          settings.galleryLayout === 'carousel' ? 'flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory' :
          'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6'
        }>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              let layoutClass = 'break-inside-avoid';
              const layout = settings.galleryLayout || 'masonry';
              
              if (layout === 'grid') layoutClass = 'aspect-[4/3]';
              else if (layout === 'list') layoutClass = 'w-full aspect-[16/9]';
              else if (layout === 'carousel') layoutClass = 'flex-none w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] aspect-[4/5] snap-center';
              else if (layout === 'bento' || layout === 'bento-hero') {
                layoutClass = (idx % 6 === 0) ? 'sm:col-span-2 md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : (idx % 6 === 3) ? 'sm:col-span-2 md:col-span-2 aspect-[2/1]' : 'aspect-square';
              }
              else if (layout === 'bento-editorial') {
                layoutClass = (idx % 5 === 0) ? 'sm:col-span-2 md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : (idx % 5 === 1 || idx % 5 === 4) ? 'sm:col-span-2 md:col-span-2 aspect-[16/9]' : 'aspect-[4/5]';
              }
              else if (layout === 'bento-mosaic') {
                layoutClass = (idx % 7 === 0) ? 'sm:col-span-2 md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : (idx % 7 === 4) ? 'sm:col-span-2 md:col-span-2 aspect-[2/1]' : 'aspect-square';
              }

              return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProjectIndex(idx)}
                className={`relative group overflow-hidden rounded-xl bg-surface cursor-pointer ${layoutClass}`}
              >
                <div className="w-full h-full">
                  <img
                    src={getOptimizedThumbnailUrl(project.thumbnailUrl) || 'https://via.placeholder.com/600x800?text=No+Image'}
                    alt={project.title}
                    className="w-full h-full object-cover img-fade"
                    loading="lazy"
                    decoding="async"
                    onLoad={(e) => e.currentTarget.classList.add('loaded')}
                    srcSet={/googleusercontent\.com|ggpht\.com/i.test(project.thumbnailUrl || '') ? [360,640,900,1200].map(w => `${(project.thumbnailUrl||'').replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '')}=s${w} ${w}w`).join(', ') : undefined}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'8px'}}>
                    {project.featured && (
                      <span className="text-xs tracking-wider uppercase text-black mb-2 font-bold bg-accent w-fit px-2 py-1 rounded shadow-lg">
                        Featured
                      </span>
                    )}
                    {project.category && (
                      <span className="text-xs tracking-wider uppercase text-accent mb-2 font-medium bg-black/50 w-fit px-2 py-1 rounded backdrop-blur-md border border-white/10">
                        {project.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-display text-white mb-1 drop-shadow-md">{project.title}</h3>
                  <p className="text-sm text-white/80">
                    {[project.location, project.year].filter(Boolean).join(' • ')}
                  </p>
                </div>
              </div>
              );
            })}
        </div>
      )}

      {selectedProjectIndex !== null && (
        <ProjectModal 
          project={filteredProjects[selectedProjectIndex]}
          onClose={() => setSelectedProjectIndex(null)}
          onPrev={() => setSelectedProjectIndex(prev => prev - 1)}
          onNext={() => setSelectedProjectIndex(prev => prev + 1)}
          hasPrev={selectedProjectIndex > 0}
          hasNext={selectedProjectIndex < filteredProjects.length - 1}
        />
      )}
    </section>
  );
};

export default PortfolioGallery;
