import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSiteSettings } from '../lib/SiteContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    const fetchProjectAndOthers = async () => {
      setLoading(true);
      try {
        // Fetch specific project
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const p = docSnap.data();
          setProject({ id: docSnap.id, ...p });
          
          // Update Document Title for SEO
          document.title = `${settings?.artistName || 'Sanad'} | ${p.title}`;
          
          // Update Meta Description
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = p.description || `${p.title} - A mural project by ${settings?.artistName || 'Sanad'}.`;
        } else {
          navigate('/404');
        }

        // Fetch all published projects to determine prev/next
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const items = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status !== 'draft') {
            items.push({ id: doc.id, ...data });
          }
        });
        
        // Sort identically to PortfolioGallery
        items.sort((a, b) => {
          const orderA = a.sortOrder !== undefined ? a.sortOrder : 9999;
          const orderB = b.sortOrder !== undefined ? b.sortOrder : 9999;
          if (orderA !== orderB) return orderA - orderB;
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });
        
        setAllProjects(items);
        
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndOthers();
  }, [id, navigate, settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-accent rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm tracking-[0.2em] uppercase text-dim animate-pulse">Loading Project</p>
      </div>
    );
  }

  if (!project) return null;

  // Determine Prev / Next
  const currentIndex = allProjects.findIndex(p => p.id === id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  // Image Upgrade Logic
  const upgradeImageUrl = (url) => {
    if (!url) return '';
    let u = url.trim();
    if (u.startsWith('data:')) return u;
    if (u.includes('cloudinary.com')) {
      return u.replace(/\/upload\/(?:f_[^/]+,q_[^/]+,w_\d+,c_limit\/)?/, '/upload/f_auto,q_60,w_1200,c_limit/');
    }
    if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
        let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
        if (!out.endsWith('=s0')) out += '=s0';
        return out;
    }
    return u;
  };

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
      return <div key={idx} className="text-dim text-lg leading-relaxed my-8" dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br>') }} />;
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
      return <div key={idx} className="my-8 w-full rounded-lg overflow-hidden flex justify-center" dangerouslySetInnerHTML={{ __html: embedCode }} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <header className="sticky top-0 left-0 right-0 z-[250] px-4 pt-4 md:px-10 md:pt-4 select-none bg-black/80 backdrop-blur-md border-b border-white/10 pb-4">
        <nav className="flex justify-between items-center max-w-[1180px] mx-auto h-12 md:h-16 px-2 md:px-6">
          {/* Left: Home Link & Project Title */}
          <div className="flex items-center gap-4 max-w-[60%]">
            <Link to="/" className="text-dim hover:text-white transition-colors flex items-center gap-2 shrink-0">
              <span className="text-xl">←</span> 
              <span className="hidden md:inline font-semibold uppercase tracking-widest text-xs">Back to Gallery</span>
            </Link>
            <div className="w-[1px] h-6 bg-white/10 hidden md:block"></div>
            <h1 className="font-display text-lg md:text-[1.35rem] font-semibold text-white truncate">
              {project.title}
            </h1>
          </div>

          {/* Right: Prev/Next Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {prevProject ? (
              <Link 
                to={`/project/${prevProject.id}`}
                className="w-10 h-10 flex items-center justify-center rounded-full text-dim hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                aria-label="Previous project"
              >
                ←
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-white/10 cursor-not-allowed">←</div>
            )}
            
            {nextProject ? (
              <Link 
                to={`/project/${nextProject.id}`}
                className="w-10 h-10 flex items-center justify-center rounded-full text-dim hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                aria-label="Next project"
              >
                →
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-white/10 cursor-not-allowed">→</div>
            )}
          </div>
        </nav>
      </header>

      <div className="flex-1 w-full flex flex-col md:flex-row">
        {/* Column 1: Details & Metadata */}
        <div className="w-full md:w-1/3 flex flex-col p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 bg-surface/50 shrink-0">
          <div className="md:sticky md:top-28">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">{meta}</span>
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
        </div>

        {/* Column 2: Media Showcase */}
        <div className="w-full md:w-2/3 p-4 pt-8 md:p-12 bg-black pb-16">
          <div className="max-w-4xl mx-auto space-y-4">
            {project.thumbnailUrl && renderMediaBlock(project.thumbnailUrl, 'thumb', true)}
            {(project.mediaUrls || []).map((block, idx) => renderMediaBlock(block, idx, false))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
