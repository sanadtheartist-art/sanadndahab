import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';

const getThumb = (url) => {
  if (!url) return '';
  let u = url.trim();
  if (u.includes('cloudinary.com')) {
    return u.replace(/\/upload\/(?:f_[^/]+,q_[^/]+,w_\d+,c_limit\/)?/, '/upload/f_auto,q_50,w_600,c_limit/');
  }
  if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
    let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
    return out.endsWith('=s600') ? out : out + '=s600';
  }
  return u;
};

// A single gallery card
const ProjectCard = ({ project, isFeatured }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const meta = [project.location, project.year].filter(Boolean).join(' · ');

  return (
    <Link
      ref={cardRef}
      to={`/project/${project.id}`}
      className="reveal"
      style={{
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '4px',
        background: 'var(--surface)',
        textDecoration: 'none',
        ...(isFeatured ? { gridColumn: 'span 2' } : {}),
      }}
    >
      {/* Image */}
      <div style={{
        overflow: 'hidden',
        aspectRatio: isFeatured ? '16/7' : '4/5',
        width: '100%',
      }}>
        <img
          src={getThumb(project.thumbnailUrl)}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="img-fade"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            display: 'block',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(7,7,10,0.92) 0%, rgba(7,7,10,0.4) 55%, transparent 100%)',
        opacity: 0,
        transition: 'opacity 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '1.5rem',
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {project.featured && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              background: 'var(--accent)',
              color: '#000',
              padding: '3px 8px',
              borderRadius: '2px',
              fontWeight: 700,
            }}>Featured</span>
          )}
          {project.category && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              border: '1px solid rgba(196,165,116,0.3)',
              padding: '3px 8px',
              borderRadius: '2px',
              background: 'rgba(7,7,10,0.5)',
              backdropFilter: 'blur(4px)',
            }}>{project.category}</span>
          )}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: isFeatured ? '2rem' : '1.4rem',
          fontWeight: 400,
          color: 'var(--text)',
          marginBottom: '4px',
          lineHeight: 1.2,
        }}>{project.title}</h3>
        {meta && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            color: 'rgba(245,240,232,0.55)',
            textTransform: 'uppercase',
          }}>{meta}</p>
        )}
      </div>

      {/* Always-visible minimal label (bottom) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '1.25rem 1rem 0.9rem',
        background: 'linear-gradient(to top, rgba(7,7,10,0.8), transparent)',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.88rem',
          fontWeight: 500,
          color: 'var(--text)',
          margin: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>{project.title}</p>
      </div>
    </Link>
  );
};

const PortfolioGallery = ({ sectionId = 'works', settings = {} }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snap) => {
      const items = [];
      const cats = new Set();
      snap.forEach(doc => {
        const data = doc.data();
        if (data.status !== 'draft') {
          items.push({ id: doc.id, ...data });
          if (data.category) cats.add(data.category);
        }
      });
      items.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const ao = a.sortOrder ?? 99999, bo = b.sortOrder ?? 99999;
        if (ao !== bo) return ao - bo;
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });
      setProjects(items);
      setCategories([...cats]);
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  const filtered = activeFilter === 'all' ? projects : projects.filter(p => p.category === activeFilter);

  const Skeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem', marginTop: '3rem' }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="shimmer" style={{ aspectRatio: '4/5', borderRadius: '4px' }} />
      ))}
    </div>
  );

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
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '2rem', height: '1px', background: 'var(--accent)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>{settings.worksLabel || 'Portfolio'}</span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 300,
          lineHeight: 1.1,
          color: 'var(--text)',
          maxWidth: '600px',
        }}>{settings.worksTitle || 'Selected Works'}</h2>
        {settings.worksSubtitle && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'var(--dim)',
            marginTop: '1rem',
            maxWidth: '500px',
          }}>{settings.worksSubtitle}</p>
        )}
      </div>

      {/* Filter pills */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {['all', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '0.45rem 1rem',
                borderRadius: '2px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                background: activeFilter === cat ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                color: activeFilter === cat ? '#000' : 'var(--dim)',
                fontWeight: activeFilter === cat ? 700 : 400,
              }}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      {loading ? <Skeleton /> : filtered.length === 0 ? (
        <p style={{ color: 'var(--dim)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '4rem 0' }}>
          No works found.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              isFeatured={project.featured && idx === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PortfolioGallery;
