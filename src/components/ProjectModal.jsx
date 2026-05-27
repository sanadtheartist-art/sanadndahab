import React, { useEffect, useRef } from 'react';

const ProjectModal = ({ project, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  const modalRef = useRef(null);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    
    document.body.style.overflow = 'hidden'; // lock scroll
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus management inside modal
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext, project]);

  if (!project) return null;

  const meta = [project.location, project.year, project.category].filter(Boolean).join(' • ');

  const renderMediaBlock = (block, idx, isFirst) => {
    if (typeof block === 'string') {
      if (!block.trim()) return null;
      return <img key={idx} src={upgradeImageUrl(block.trim())} alt={project.title} className="w-full rounded-lg mb-8" loading={isFirst ? "eager" : "lazy"} />;
    }
    
    if (block?.type === 'media') {
      if (!block.content?.trim()) return null;
      return <img key={idx} src={upgradeImageUrl(block.content.trim())} alt={project.title} className="w-full rounded-lg mb-8" loading={isFirst ? "eager" : "lazy"} />;
    }
    
    if (block?.type === 'text') {
      if (!block.content?.trim()) return null;
      return (
        <div key={idx} className="text-dim text-lg leading-relaxed my-8" dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br>') }} />
      );
    }
    
    if (block?.type === 'embed') {
      if (!block.content?.trim()) return null;
      let embedCode = block.content;
      if (embedCode.includes('youtube.com/embed/') || embedCode.includes('youtu.be/')) {
        embedCode = embedCode.replace(/<iframe\s/i, '<iframe style="width: 100%; aspect-ratio: 16/9; display: block; margin: 0 auto;" ');
        embedCode = embedCode.replace(/src=["']([^"']+)["']/, (match, urlStr) => {
          try {
            const u = new URL(urlStr.startsWith('http') ? urlStr : 'https:' + urlStr);
            u.searchParams.set('autoplay', '1');
            u.searchParams.set('mute', '1');
            u.searchParams.set('controls', '0');
            u.searchParams.set('playsinline', '1');
            return `src="${u.toString()}"`;
          } catch (e) { return match; }
        });
      }
      return (
        <div key={idx} className="my-8 w-full rounded-lg overflow-hidden flex justify-center" dangerouslySetInnerHTML={{ __html: embedCode }} />
      );
    }
    
    return null;
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300 animate-fade-up"
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
      ref={modalRef}
    >
      {/* Smart Unified Floating Top Navigation Bar (Matches Header.jsx) */}
      <header className="absolute top-0 left-0 right-0 z-[250] px-4 pt-4 md:px-10 md:pt-4 pointer-events-none select-none">
        <nav
          className="flex justify-between items-center max-w-[1180px] mx-auto h-16 px-4 md:px-6 backdrop-blur-xl bg-black/90 border border-white/10 rounded-full shadow-[0_18px_54px_rgba(0,0,0,0.5)] pointer-events-auto"
        >
          {/* Left: Project Title */}
          <span className="font-display text-[1.1rem] md:text-[1.35rem] font-semibold text-white truncate max-w-[50%]">
            {project.title}
          </span>

          {/* Right: Unified Controls */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button 
              onClick={onPrev}
              disabled={!hasPrev}
              className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-base transition-all duration-300 ${
                hasPrev 
                  ? 'text-dim hover:text-white hover:bg-white/5 active:scale-90 cursor-pointer' 
                  : 'text-white/10 cursor-not-allowed opacity-20'
              }`}
              aria-label="Previous project"
            >
              ←
            </button>
            <button 
              onClick={onNext}
              disabled={!hasNext}
              className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-base transition-all duration-300 ${
                hasNext 
                  ? 'text-dim hover:text-white hover:bg-white/5 active:scale-90 cursor-pointer' 
                  : 'text-white/10 cursor-not-allowed opacity-20'
              }`}
              aria-label="Next project"
            >
              →
            </button>

            <div className="w-[1px] h-5 bg-white/10 mx-1"></div>

            <button 
              onClick={onClose}
              className="bg-accent text-black font-semibold text-[0.7rem] md:text-[0.75rem] tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 hover:bg-accent-hover transition-all duration-300 active:scale-95 cursor-pointer"
              aria-label="Close project modal"
            >
              Close
            </button>
          </div>
        </nav>
      </header>

      {/* Scrollable Area for both Mobile and Desktop */}
      <div className="flex-1 w-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">
        {/* Column 1: Details & Metadata */}
        <div className="w-full md:w-1/3 flex flex-col p-8 pt-28 md:p-12 md:pt-28 border-b md:border-b-0 md:border-r border-white/10 bg-surface/50 md:overflow-y-auto shrink-0 md:h-full">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">{meta}</span>
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4 md:mb-6 break-words">{project.title}</h2>
          {project.description && (
            <p className="text-dim text-lg leading-relaxed mb-8">{project.description}</p>
          )}
          
          <div className="flex flex-col gap-4 mb-6">
            {project.client && (
              <div className="border-t border-white/10 pt-4">
                <span className="block text-xs uppercase tracking-widest text-dim mb-1">Client</span>
                <span className="text-white text-lg">{project.client}</span>
              </div>
            )}
            {project.dimensions && (
              <div className="border-t border-white/10 pt-4">
                <span className="block text-xs uppercase tracking-widest text-dim mb-1">Scale</span>
                <span className="text-white text-lg">{project.dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Media Showcase */}
        <div className="w-full md:w-2/3 p-4 pt-8 md:p-12 md:pt-28 md:overflow-y-auto md:h-full bg-black hide-scrollbar pb-16">
          <div className="max-w-4xl mx-auto space-y-4">
            {project.thumbnailUrl && renderMediaBlock(project.thumbnailUrl, 'thumb', true)}
            {(project.mediaUrls || []).map((block, idx) => renderMediaBlock(block, idx, false))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
